# 07 · Load Balancing, Scaling & Stateless Design

**What you'll learn:** How a single web app turns into a fleet that survives traffic spikes and node death — the layers of load balancing (L4 vs L7), the algorithms that distribute requests, why "stateless" is the keystone trick that makes horizontal scaling possible, how databases scale differently from app servers, and how systems shed load *on purpose* instead of falling over. You'll leave able to reason about an autoscaling design under interview pressure or during a 3 a.m. incident.

**Prerequisites:** Read `01-foundations-and-estimation.md` (latency/throughput math, back-of-envelope), `05-caching-and-cdns.md` (externalized state, edge caching), and ideally `09-cap-pacelc-and-consistency.md` (why DB scaling is hard). Sharding here cross-references `08-data-partitioning-and-sharding.md`.

---

## 1. The core problem: one box is never enough

A single server has a hard ceiling — CPU cores, RAM, NIC bandwidth, file descriptors. When demand exceeds it you have exactly two moves:

- **Scale up (vertical):** buy a bigger box.
- **Scale out (horizontal):** buy *more* boxes and spread the work.

**Analogy.** A popular restaurant with one chef can either hire a faster chef (vertical) or open more kitchens and route orders between them (horizontal). The faster chef is simple but eventually no chef is fast enough — and if that one chef gets sick, dinner stops. Multiple kitchens are more complex (who routes orders? what if a kitchen burns down mid-order?) but have no ceiling and survive a single failure.

### Vertical vs Horizontal

| Dimension | Vertical (scale up) | Horizontal (scale out) |
|---|---|---|
| Mechanism | Bigger CPU/RAM/disk on one node | More nodes behind a balancer |
| Ceiling | Hard (largest instance, e.g. AWS u-24tb1 ~ 24 TB RAM, 448 vCPU) | Effectively unbounded |
| Fault tolerance | None — single point of failure | High — lose a node, keep serving |
| Cost curve | Super-linear (top-end hardware is priced like a luxury) | ~Linear (commodity boxes) |
| Code complexity | Zero — app unchanged | Requires statelessness + LB + coordination |
| Latency | Lowest (no network hop, shared memory) | Adds a hop + distributed-systems problems |
| When to use | Databases, single-writer systems, early stage, latency-critical monoliths | Stateless web/API tiers, anything that must survive node loss |

**Rule of thumb:** scale *up* the things that are hard to distribute (the primary database), scale *out* the things that are easy (stateless app servers). Most real systems do both. A 2× vertical bump buys you breathing room in an afternoon; horizontal is the long game.

---

## 2. Load balancing: the layers

A load balancer (LB) is the traffic cop in front of the fleet. The key distinction is *which layer of the network stack it inspects.*

```
        Client
          │  HTTPS
          ▼
   ┌──────────────┐   L7 LB (ALB, Envoy, NGINX, HAProxy http mode)
   │  L7 LOAD BAL │   terminates TLS, reads HTTP headers/path/cookies,
   └──────┬───────┘   can route /api → fleet A, /img → fleet B
          │
   ┌──────┴───────┐   L4 LB (AWS NLB, IPVS, HAProxy tcp mode)
   │  L4 LOAD BAL │   forwards TCP/UDP by IP:port, no payload inspection
   └──┬────┬───┬──┘
      ▼    ▼   ▼
    app1 app2 app3   (stateless backends)
```

### L4 vs L7

| | L4 (transport) | L7 (application) |
|---|---|---|
| Inspects | IP + TCP/UDP port | HTTP method, path, headers, cookies, TLS SNI |
| TLS | Pass-through (or termination on NLB w/ TLS listener) | Terminates TLS, re-encrypts to backend optionally |
| Routing smarts | Hash 5-tuple, sticky by IP | Path/host routing, header rules, cookie affinity, A/B, canary |
| Throughput | Very high, ~µs added latency, millions of conns | Higher CPU cost, more latency (parses every request) |
| Connection model | One client TCP conn often = one backend conn | Can multiplex; HTTP/2 connection coalescing |
| Examples | AWS NLB, Google Maglev, LVS/IPVS, F5 | AWS ALB, Envoy, NGINX, HAProxy, Traefik |
| When to use | Raw TCP, gRPC at the edge, ultra-low latency, non-HTTP | HTTP APIs needing path routing, canaries, WAF, auth |

**Why this matters in practice:** L7 lets you do *content-based* routing — send `/admin` to a hardened pool, `/designer` to GPU boxes, version-pin a canary by header. L4 can't see any of that; it only knows "packets to port 443." Many stacks layer them: an L4 NLB for raw throughput/static IP, fronting an L7 Envoy mesh for smart routing. Google's **Maglev** paper describes an L4 software LB doing consistent hashing across a cluster, handling the full edge of Google with ECMP from the routers.

---

## 3. Balancing algorithms — and why "random" can beat "smart"

The LB must pick *which* backend gets each request. The naïve choices and the clever ones:

| Algorithm | How it works | Strength | Weakness / failure mode |
|---|---|---|---|
| **Round-robin** | Cycle 1→2→3→1… | Trivial, even count distribution | Ignores request *cost*; a slow box still gets 1/N |
| **Weighted RR** | Bigger boxes get more turns | Handles heterogeneous fleets | Static weights drift from reality |
| **Least-connections** | Send to backend with fewest in-flight | Adapts to slow/stuck backends | Needs accurate conn counts; herd onto a freshly-added empty node |
| **Least-response-time / EWMA** | Track exponentially-weighted moving avg latency, pick fastest | Reacts to real degradation (GC pause, hot disk) | Stale signal; noisy under bursty load |
| **Consistent hashing** | Hash key (user/URL) → fixed backend | Cache affinity, sticky w/o cookies, minimal reshuffle on scale | Hot keys overload one node; uneven without vnodes |
| **Power of two choices (P2C)** | Pick 2 backends at random, send to the less-loaded | Near-optimal balance, cheap, decentralized | Slightly worse than perfect global least-conn |

### The P2C insight (the staff-level answer)

Pure random assignment leaves the most-loaded server with `≈ log n / log log n` more load than average — noticeably lumpy. **Pick two at random and choose the less loaded**, and the max load collapses to `≈ log log n / log 2` — exponentially better, for almost no extra work and *no global coordination*. This "power of two choices" result (Mitzenmacher) is why modern proxies default to it.

```
Random:           max load ~ log n / log log n      (lumpy)
Power of 2:        max load ~ log log n              (nearly flat)
                  └─ one extra random pick → exponential improvement
```

**Why not just always use global least-connections?** Because at scale your LB tier is *itself* distributed — many LB instances. None has a perfect global view; sharing exact connection counts across them is a coordination cost and a stale-data trap. P2C needs only two local samples, so it degrades gracefully. NGINX (`random two least_conn`), Envoy (default LB policy with `choice_count`), HAProxy, and Netflix all use P2C variants. EWMA + P2C ("two random choices, pick lower EWMA latency") is the Netflix/Finagle production sweet spot.

**Consistent hashing** deserves its own deep dive — see `08-data-partitioning-and-sharding.md` — but the load-balancing use is: route the *same* cache key / user to the *same* backend so its local cache stays warm, and when a backend is added/removed only `K/N` keys move instead of all of them. Add **virtual nodes** (each physical node owns many ring positions) to smooth out hot spots. **Bounded-load consistent hashing** (Google, 2017; used in Vimeo's HAProxy) caps any node at `(1+ε)·average` and overflows to the next ring node — fixing the hot-key problem.

---

## 4. Health checks: don't route to the dead

A backend can die silently — process up, app hung. The LB must *detect and eject* it.

```
LB ──every 5s──► GET /healthz ──► backend
        │
   2 fails in a row  → mark UNHEALTHY, stop routing
   3 passes in a row → mark HEALTHY, route again (with slow-start)
```

| Check type | What it proves | Cost | Trap |
|---|---|---|---|
| **TCP connect** | Port is open | Cheap | App can be hung but socket still accepts |
| **HTTP shallow** (`/healthz` → 200) | Process serving HTTP | Cheap | Doesn't prove DB/deps work |
| **HTTP deep** (checks DB, cache, queue) | Real readiness | Expensive | **Cascading failure:** DB blip → every backend reports unhealthy → LB ejects *all* of them → total outage |

**War story / design rule:** keep **liveness** (am I running? — shallow) separate from **readiness** (can I serve traffic right now? — deeper, but *bounded*). Kubernetes formalizes this with `livenessProbe` vs `readinessProbe` vs `startupProbe`. Never let a shared-dependency health check eject the entire fleet — that turns a degraded dependency into a complete outage. Cap the blast radius: if >50% report unhealthy, many LBs (ALB "minimum healthy targets", Envoy **panic threshold**, default 50%) **fail open** — they route to *all* backends anyway, on the theory that a half-broken fleet is better than zero capacity.

**Slow-start:** a freshly-healthy node shouldn't get full traffic instantly (cold caches, JIT not warmed, connection pools empty). NGINX/Envoy ramp it up linearly over a window (e.g. 30s).

---

## 5. Sticky sessions vs stateless design — the keystone

Here's the trick that makes horizontal scaling *actually work*.

**Stateful (sticky sessions):** the LB pins a user to one backend (via cookie or source-IP hash) because that backend holds their session in local memory.

```
   user A ──► app1 (session A in RAM)   ← always routed to app1
   user B ──► app2 (session B in RAM)
```

This is the *easy* path that bites you later:
- **No clean horizontal scale:** load is uneven (whales pin to one box), and you can't freely rebalance.
- **Deploy/restart loses sessions:** kill app1 and every pinned user is logged out / loses their cart.
- **Autoscaling fights affinity:** scale-in evicts users; scale-out gets ignored because existing users stay pinned.

**Stateless + externalized state (the right way):** backends hold *no* per-user state. Every request carries or can fetch everything it needs. Shared state lives in an external store.

```
   any user ──► [LB any algorithm] ──► app1 | app2 | app3  (identical, disposable)
                                          │
                                          ▼
                            ┌─────────────────────────┐
                            │  Redis (sessions)        │
                            │  Postgres (data)         │
                            │  S3 (uploads/files)      │
                            │  JWT in cookie (claims)  │
                            └─────────────────────────┘
```

Now any backend can serve any request → round-robin works, scale-in/out is free, a node can die mid-deploy and nobody notices.

| | Sticky sessions | Stateless + external state |
|---|---|---|
| LB algorithm | Constrained (affinity) | Any (RR, least-conn, P2C) |
| Node death | Users lose session | Transparent |
| Deploys | Disruptive / drain-required | Rolling, painless |
| Autoscaling | Fights you | Clean |
| State store | None (in RAM) | Redis/DB/JWT (extra hop ~0.5–2ms) |
| When acceptable | Legacy apps, WebSocket connections (inherently stateful), short sessions | Default for all new HTTP/API tiers |

**Print-Flow-360 connection:** Laravel's session driver is the concrete lever here. `SESSION_DRIVER=file` (local disk) is sticky-by-accident — it *forces* affinity. Move it to `redis`/`database` and the API tier becomes truly stateless and horizontally scalable. Sanctum token auth (a bearer token validated against the DB/cache, no server-side session) is even more stateless. JWTs push state into the *client* (claims in the token) so the server stores nothing — at the cost of revocation being hard (you can't un-issue a token; you need a short TTL + a denylist).

**WebSockets are the honest exception:** a live socket *is* a stateful connection bound to one node. You don't make the socket stateless — you externalize the *fan-out* (Redis pub/sub, a dedicated push tier like Pusher/Soketi/Ably) so any node can publish to any user's socket.

---

## 6. Autoscaling: reactive vs predictive

Horizontal scale is only useful if the fleet size *tracks demand*. Two philosophies:

| | Reactive (target-tracking) | Predictive (forecast) |
|---|---|---|
| Trigger | Metric crosses threshold (CPU > 60%, RPS, queue depth) | ML/seasonal model forecasts load ahead of time |
| Latency to capacity | Slow — only acts *after* load arrives + boot time | Provisions *before* the spike |
| Handles flash spikes | Poorly (lag = brownout) | Better, if pattern is learnable |
| Handles novel spikes | Equally well (it's reactive) | Poorly (unseen pattern) |
| Complexity | Low (AWS Target Tracking, K8s HPA) | High (AWS Predictive Scaling, needs history) |
| Best for | Most workloads | Strong daily/weekly seasonality (e.g. business-hours SaaS) |

**The killer detail: the boot-time gap.** Reactive scaling reacts to load you *already have*. If an instance takes 90s to boot + warm caches + register healthy, then for 90 seconds your overloaded fleet stays overloaded. Math: traffic doubles instantly, you're already at 70% CPU → you saturate immediately, but new capacity is 90s away. That 90s is a brownout (timeouts, 5xx). Mitigations:
- **Scale on a leading indicator**, not CPU. Queue depth or **requests-per-target** rises *before* CPU saturates. Best of all: scale on `request_concurrency / target_concurrency`.
- **Pre-warm / over-provision headroom** (run at 50% not 80% so you have slack while booting).
- **Predictive scaling** for known patterns (Black Friday, 9 a.m. login surge).
- **Faster cold starts:** pre-baked AMIs/images, snapshot-restore (AWS Lambda SnapStart), keep a warm pool.

**Scale-in is dangerous too:** terminating a node mid-request causes errors. This is where **connection draining** comes in (next section). Also beware **scaling oscillation (flapping):** scale out → CPU drops → scale in → CPU spikes → scale out… Fix with a **cooldown period** and asymmetric thresholds (scale out fast at 60%, scale in slow at 30%).

---

## 7. Connection draining (graceful shutdown)

When you remove a node (deploy, scale-in, replace), in-flight requests must complete instead of being severed.

```
T0  LB: mark node "DRAINING" → stop sending NEW requests
T0  node still finishes the ~120 in-flight requests
T0+Δ all in-flight done (or drain timeout hit, e.g. 300s)
T0+Δ LB removes node → orchestrator sends SIGTERM
    app catches SIGTERM → finishes work → exits cleanly
    (if not exited by grace period → SIGKILL)
```

The subtle ordering bug everyone hits: the node must keep failing its **readiness** check (so the LB stops new traffic) but stay **alive** long enough to finish in-flight work *and* for the LB's deregistration to propagate. Common mistake: app exits on SIGTERM *immediately*, before the LB has noticed it's draining → the LB sends a request to a now-dead socket → connection reset → user-facing 502. Kubernetes handles this with a `preStop` hook (`sleep 15`) + `terminationGracePeriodSeconds`; AWS target groups have a "deregistration delay" (default 300s). For HTTP keep-alive, send `Connection: close` during drain so clients reconnect to a live node.

---

## 8. Scaling the database — a different beast entirely

App servers scale out trivially once stateless. **The database is where statefulness is irreducible** — it *is* the state. Two orthogonal techniques:

### Read replicas (scale reads)

```
            writes
   app ───────────────► PRIMARY ──async replication──► REPLICA 1 (reads)
   app ◄── reads ──────────────────────────────────► REPLICA 2 (reads)
```

- One primary takes all writes; replicas stream the write-ahead log and serve reads.
- **Scales reads, not writes** — the primary is still the write bottleneck.
- **Replication lag** is the gotcha: a user writes, immediately reads from a replica that hasn't caught up → "I just saved it, where did it go?" (read-your-own-writes violation). Fixes: route the writer's *own* reads to the primary for a few seconds, or use causal/session consistency tokens. See `09-cap-pacelc-and-consistency.md`.

### Sharding / partitioning (scale writes)

Split the data itself across N independent primaries by a shard key.

```
   shard key = hash(tenant_id) % N
   tenant A,C → shard1 (own primary)
   tenant B,D → shard2 (own primary)
```

- **Scales writes** (each shard takes a fraction).
- Cost: cross-shard queries/joins/transactions become hard or impossible; rebalancing is painful; a bad shard key creates **hot shards**. Full treatment in `08-data-partitioning-and-sharding.md`.

| Technique | Scales | Cost | When |
|---|---|---|---|
| Vertical (bigger DB box) | Reads + writes (to a ceiling) | $$$, single failure | First move, always |
| Read replicas | Reads only | Replication lag, stale reads | Read-heavy (most web apps, ~10:1 read:write) |
| Sharding | Writes + storage | Lost cross-shard joins/txns, ops complexity | Write-bound or > single-box storage |
| CQRS / caching | Reads | Eventual consistency | Hot read paths (see `05-caching-and-cdns.md`) |

**Real systems:** PostgreSQL/MySQL do primary + read replicas natively. **Vitess** (YouTube) shards MySQL. **CockroachDB**/**Spanner** shard *and* replicate automatically with strong consistency (Spanner uses TrueTime + Paxos). **DynamoDB**/**Cassandra** shard by partition key with tunable consistency from day one. **Multi-tenant note (Print-Flow-360):** `stancl/tenancy` on a single shared Postgres means the *tenant_id* is effectively a logical shard key already — the natural physical-sharding axis if a single primary ever caps out is "tenants → shards."

---

## 9. Global Server Load Balancing (GSLB)

Scaling across *regions*, not just nodes. The job: send each user to the nearest/healthiest region and fail over when one dies.

```
   user (EU) ─DNS/Anycast─► EU region ──┐
   user (US) ─DNS/Anycast─► US region ──┼─ async cross-region DB replication
   user (AP) ─DNS/Anycast─► AP region ──┘
                  │
        region down → steer traffic to next-closest
```

| Mechanism | How users reach a region | Failover speed | Trap |
|---|---|---|---|
| **GeoDNS / latency-based DNS** (Route 53, NS1) | DNS returns region-specific IP | Slow (DNS TTL + client caching, minutes) | Clients ignore TTL; stale records send users to a dead region |
| **Anycast** (Cloudflare, Google) | Same IP announced from many sites; BGP routes to nearest | Fast (BGP reconverges) | Long-lived TCP can break if route flips mid-connection |
| **Client-side / app steering** | App fetches a region map, picks endpoint | Flexible, app-controlled | Requires smart client |

The hard part of multi-region is never the routing — it's the **data**. Cross-region replication is high-latency (~70–150ms US↔EU one way), so you choose: one global primary (simple, far writers are slow), regional primaries with conflict resolution (CRDTs / last-write-wins, eventual consistency), or a globally-consistent store (Spanner/Cockroach paying latency for Paxos quorum across regions). This is a PACELC decision — see `09-cap-pacelc-and-consistency.md`.

---

## 10. Graceful degradation & load shedding

When demand exceeds *all* available capacity, you have two outcomes: **degrade on purpose, or collapse by accident.** A queue that grows unbounded doesn't "handle" overload — it adds latency until everything times out and the whole thing falls over (congestion collapse).

**Load shedding = drop work you can't serve, fast, to protect the work you can.** Better to serve 90% well and reject 10% immediately than to serve 100% so slowly that all of it times out.

```
   incoming RPS ──► [admission control]
                       │ within capacity → serve
                       │ over capacity   → reject FAST with 503 + Retry-After
                       │                   (cheap rejection, no queue buildup)
```

Techniques, from gentle to brutal:

| Technique | What it does | Example |
|---|---|---|
| **Graceful degradation** | Turn off non-essential features under load | Drop personalization, serve cached/generic page, hide recommendations |
| **Rate limiting** | Cap per-client RPS | Token bucket per API key (see `06-...` if present) |
| **Load shedding** | Reject excess requests cheaply (503) | Envoy/Netflix concierge, prioritize by request criticality |
| **Brownout** | Reduce quality, not availability | Lower image res, shorter result lists |
| **Circuit breaker** | Stop calling a failing dependency, fail fast | Hystrix/resilience4j; open circuit after N failures |
| **Backpressure** | Push "slow down" upstream | Bounded queues, HTTP 429, reactive streams |

**Prioritized shedding (staff-level):** not all requests are equal. Shed the cheap-to-lose first — drop a background prefetch before a checkout. Netflix and Google tag requests with criticality and shed low-criticality first. **Adaptive concurrency limits** (Netflix's `concurrency-limits`, Envoy's adaptive concurrency, Google's "Overload" chapter in the SRE book) measure latency and *automatically* lower the in-flight ceiling when latency rises — TCP-Vegas-style congestion control, but for requests. This beats a static limit because the right limit changes with backend health.

---

## 11. Common pitfalls / war stories

- **Deep health checks took down the fleet.** A 200ms DB blip made every backend's `/healthz` fail (it pinged the DB), the LB ejected 100% of targets, and a minor blip became a full outage. *Fix:* shallow liveness + bounded readiness + LB panic-threshold fail-open.
- **The retry storm / thundering herd.** A backend slows; clients retry; retries triple the load; the backend dies; healthy backends inherit the load and die too — cascading collapse. *Fix:* exponential backoff **with jitter**, retry budgets (cap retries at e.g. 10% of requests), circuit breakers. AWS's "Timeouts, retries and backoff with jitter" is the canonical write-up.
- **Sticky sessions made deploys a logout event.** `SESSION_DRIVER=file` + rolling deploy = every user logged out per node cycle. *Fix:* externalize sessions to Redis.
- **Least-connections herded onto the new node.** A freshly-added empty backend has 0 connections, so least-conn dumped *all* new traffic onto it, overwhelming its cold caches. *Fix:* slow-start ramp.
- **Autoscaling on CPU was always 90s late.** CPU is a lagging indicator; the brownout was over by the time capacity arrived. *Fix:* scale on requests-per-target / queue depth, keep headroom.
- **Scale-in killed in-flight checkouts.** No drain → SIGKILL mid-request → 502s and double-charges. *Fix:* connection draining + SIGTERM grace + idempotency keys.
- **Read replica showed stale data right after a write.** Classic read-your-writes bug. *Fix:* route post-write reads to primary or use session consistency.
- **Unbounded queue = invisible outage.** "We never reject requests!" — instead every request takes 40s and times out. A bounded queue that sheds is healthier than an unbounded one that drowns.
- **The LB became the SPOF.** One load balancer in front of a redundant fleet — and it died. *Fix:* redundant LBs (active-active via Anycast/ECMP, or active-passive with VIP failover).

---

## 🧩 Case Study: Google Maglev

**The problem.** By the early 2010s Google's edge had to terminate essentially *all* of the company's user-facing traffic — Search, Gmail, Maps, YouTube — at a single front door per cluster. That's millions of new connections per second, hundreds of Gbps per cluster, with hard requirements no hardware appliance could meet cheaply: it had to scale **horizontally on commodity servers** (not $100k F5 boxes that scale *up* to a ceiling), survive any single machine dying without dropping live connections, and let Google add capacity by racking another identical box. The legacy answer — big hardware L4 load balancers in active/passive pairs — wasted the passive box, had a vertical ceiling, and turned the LB into the exact SPOF described in §11. Google's answer was **Maglev**: a distributed software L4 load balancer that runs as a normal Linux service on a fleet of regular servers.

**This is the L4 tier from §2.** Maglev is pure **L4** — it forwards packets by inspecting only the IP 5-tuple (src/dst IP, src/dst port, protocol). It never parses HTTP, never terminates TLS. That's the deliberate "raw TCP, ultra-low latency, millions of conns" column of the L4-vs-L7 table. The L7 smarts (path routing, TLS termination, canaries) happen *behind* it in the application/proxy tier. Maglev's only job is: take a packet for a service VIP (virtual IP) and pick a backend, fast, consistently, and survive failures.

**How traffic reaches the fleet (the horizontal, stateless part of §1 and §5).** Every Maglev machine in a cluster announces the *same* service VIPs to the router via BGP. The router uses **ECMP (equal-cost multi-path)** to spray incoming packets across *all* Maglev machines roughly evenly. There is no leader and no shared state between Maglev boxes — each is an identical, **stateless, disposable** node, exactly the "any node serves any request" model from §5. Add a machine → it announces the VIPs → ECMP starts handing it a share. Lose a machine → it stops announcing → ECMP reroutes. This is horizontal scaling of the *load-balancer tier itself*.

```
            Internet
               │   packets to VIP 1.2.3.4:443
               ▼
        ┌─────────────┐
        │   Router    │  ECMP hashes 5-tuple → spreads across all Maglevs
        └──┬───┬───┬──┘
           ▼   ▼   ▼
        ┌────┐┌────┐┌────┐   each announces SAME VIPs via BGP
        │ M1 ││ M2 ││ M3 │   stateless, no shared state, identical
        └─┬──┘└─┬──┘└─┬──┘   each runs consistent-hash → backend table
          └──┬──┴──┬──┘
             ▼     ▼
          app1  app2  app3 …   (real backends behind the VIP)
```

**The hard part: connection affinity without shared state.** Here's the trap. ECMP routes by 5-tuple hash, but routes can change — a Maglev box is added, removed, or a link flaps — and ECMP may suddenly send an *existing* connection's packets to a *different* Maglev machine than the one that saw its first packet. For a stateful TCP connection, if the new Maglev picks a *different* backend, the connection breaks. So every Maglev machine, with **no coordination**, must independently map the same connection to the same backend.

This is precisely the **consistent hashing for connection affinity** technique from §3 — but Google needed it *uniform* and *minimally disruptive*, so they built a variant called **Maglev hashing**. Instead of points on a ring, Maglev precomputes a fixed-size **lookup table** (e.g. 65,537 entries) where each backend "takes turns" claiming preferred slots until the table is full. The result is two properties that map straight onto §3's consistent-hashing pitch:

- **Even spread:** every backend gets ~1/N of the table (far more balanced than a naive hash ring, which is lumpy without virtual nodes).
- **Minimal disruption on change:** when a backend is added or removed, only ≈`1/N` of table entries move — the same "only K/N keys reshuffle" property that makes consistent hashing the right tool, here tuned for *fewer* disruptions than a ring at the cost of perfect minimality.

Because the table is **deterministic** from the backend set, *every* Maglev machine computes the **identical** table. So even if ECMP reroutes a live connection to a different Maglev box, that box hashes the 5-tuple and picks the *same* backend — connection survives. As a belt-and-suspenders measure each box also keeps a small local **connection-tracking** cache for connections it has seen, falling back to the consistent-hash table for anything new. This is the §3 insight ("route the same key to the same backend, and on membership change only K/N move") applied to keep *TCP connections* — not cache keys — pinned.

**Health checks and draining (§4 and §7).** Maglev continuously **health-checks** each backend and recomputes the lookup table when the healthy set changes — a dead backend simply drops out of the table, which is §4's "detect and eject the dead." Draining a Maglev *machine* is graceful: it withdraws its BGP announcement so ECMP stops sending it new flows (the §7 "stop new traffic but stay alive to finish in-flight" pattern), then drains existing connections before going down. No connection is severed by a planned removal.

**The trade-off they accepted.** Maglev is **L4-only and stateless by design** — and they kept it that way on purpose. By refusing to do L7 (no HTTP parsing, no TLS termination, no per-request routing) and refusing shared connection state across machines, they bought raw throughput, trivial horizontal scale, and resilience. The price: Maglev *cannot* do content-based routing or guarantee perfect connection affinity under simultaneous backend churn — a small fraction of connections can still break if the backend set changes *while* ECMP also reshuffles. Google judged that occasional reset acceptable versus the cost of a coordinated, stateful, L7 design. They also accepted **kernel-bypass complexity** (a userspace packet path with a busy-polling NIC) to hit the latency target.

**Real numbers.** A single Maglev machine saturates a 10 Gbps NIC with small packets — roughly **line-rate**, on the order of millions of packets per second — by bypassing the Linux kernel networking stack and pinning a userspace forwarder to dedicated cores with batched packet processing. A cluster scales linearly: N machines ≈ N× throughput, all behind the same VIPs via ECMP. It has served Google's edge in production since ~2008, replacing hardware LBs while running on commodity servers.

### Lessons

- **Push smarts down the stack when raw scale matters.** Keeping the front door strictly L4 and stateless is *why* it scales linearly on cheap boxes; do the L7 routing in a tier behind it.
- **Consistent hashing isn't just for caches — it's how a stateless fleet agrees without talking.** A deterministic hash lets independent nodes pick the same backend with zero coordination, the same property you'd use for cache affinity in §3.
- **ECMP + identical-announcing nodes is the horizontal-scaling pattern for the LB tier itself** — and it dissolves the "LB is the SPOF" war story from §11.
- **State the affinity trade-off explicitly:** Maglev accepts rare connection resets under simultaneous churn in exchange for no shared state. Knowing exactly what you gave up (perfect affinity) for what you got (statelessness) is the staff-level move.

## 12. Test yourself

1. **Why does "power of two choices" beat both pure-random and global least-connections in a large distributed LB tier?** *(Hint: max-load math `log log n` vs `log n / log log n`; and least-conn needs a global view the distributed LBs don't share.)*
2. **Your `/healthz` checks the database. The DB has a 1-second hiccup. What happens, and how do you prevent it?** *(Hint: every target fails → fleet ejected → outage; separate liveness/readiness + fail-open panic threshold.)*
3. **You set `SESSION_DRIVER=file` and added a second app server behind round-robin. Users report random logouts. Why?** *(Hint: session lives in one node's local disk; RR sends them elsewhere; externalize to Redis.)*
4. **Traffic doubles instantly. You autoscale on CPU > 60% with a 90s boot time. Walk through the brownout, then fix it.** *(Hint: reactive lag + cold start; scale on leading indicator + headroom + predictive/warm pool.)*
5. **When does sharding help and read replicas don't?** *(Hint: write-bound or storage-bound; replicas only scale reads, primary still takes all writes.)*
6. **A backend slows down. Within 30s the whole fleet is down. Name the mechanism and three mitigations.** *(Hint: retry storm/cascading failure; backoff+jitter, retry budgets, circuit breakers, load shedding.)*
7. **During scale-in, users get 502s and a few double-charges. Two fixes — one infra, one app.** *(Hint: connection draining + SIGTERM grace; idempotency keys.)*
8. **Multi-region: GeoDNS vs Anycast for failover — which fails over faster and why is data still the hard part?** *(Hint: Anycast reconverges via BGP in seconds, DNS waits on TTL/client caching; cross-region replication latency + consistency = PACELC trade-off.)*

---

## 13. Further reading

- **DDIA (Kleppmann)** — Ch. 5 (Replication: leaders, replication lag, read-your-writes), Ch. 6 (Partitioning/Sharding), Ch. 1 (Reliability/Scalability/Maintainability). The single best reference for §8.
- **Google SRE Book** — "Handling Overload" and "Addressing Cascading Failures" chapters (load shedding, adaptive concurrency, retry budgets). Free online.
- **Mitzenmacher, "The Power of Two Choices in Randomized Load Balancing"** (1996/2001) — the P2C result in §3.
- **Eisenbud et al., "Maglev: A Fast and Reliable Software Network Load Balancer"** (NSDI 2016) — Google's L4 LB + consistent hashing (§2/§3).
- **Mirrokni et al., "Consistent Hashing with Bounded Loads"** (Google, 2017) — fixes hot keys (§3).
- **AWS Builders' Library** — "Timeouts, retries, and backoff with jitter" and "Using load shedding to avoid overload" — the canonical war-story writeups for §10/§11.
- **Netflix concurrency-limits** (GitHub) and **Envoy docs** — adaptive concurrency, panic threshold, P2C/EWMA LB policies (§3/§4/§10).
- **Kubernetes docs** — liveness/readiness/startup probes, `terminationGracePeriodSeconds`, `preStop` (§4/§7).
- **Sibling modules:** `01-foundations-and-estimation.md`, `05-caching-and-cdns.md`, `08-data-partitioning-and-sharding.md`, `09-cap-pacelc-and-consistency.md`.
