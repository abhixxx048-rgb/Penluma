# Module 18 - Architecture Patterns: Monolith → Microservices → Cells

**What you'll learn:** How to decide *whether and how* to split a system into services, where the real boundaries live (DDD bounded contexts, not org charts), how to migrate without a rewrite (strangler-fig), and the infra that makes it survivable (gateways, BFFs, service mesh, discovery). Then the advanced layer almost nobody gets right: avoiding the *distributed monolith*, and cell-based / shuffle-sharding architectures that cap blast radius in multi-region active-active systems.

**Prerequisites:** Read `09-cap-pacelc...md` (consistency trade-offs), `10-data-replication...md` (replication & per-service data), `14-messaging-and-queues...md` (async integration), and `16-observability...md` (you cannot run distributed systems blind). This module assumes you can already reason about partial failure and eventual consistency.

---

## 1. The core intuition: a restaurant kitchen

A **monolith** is one chef cooking every dish at one big station. Fast and simple when there's one chef - no coordination, everything's within arm's reach. But you can't add a second chef to the *same* station without them colliding; to go faster you clone the entire chef (and their whole station) even if only desserts are busy.

**Microservices** are specialized stations - grill, salad, pastry - each with its own tools and its own fridge, communicating by passing tickets. You can staff the busy stations independently. But now a dish that touches three stations needs the tickets to flow correctly, and if the pastry fridge dies, anyone who needed cream is stuck.

**Cells** are the realization that one giant kitchen serving 10,000 covers is a single point of catastrophe. So you build many identical *small* kitchens, and route each table to exactly one. A fire in kitchen #7 ruins dinner for 1/Nth of guests, not everyone.

The entire progression is a trade of **simplicity for independence and isolation** - and you pay in coordination, latency, and operational surface area. The senior skill is knowing how little of that trade you actually need.

---

## 2. Monolith vs Modular Monolith vs Microservices

The crucial middle option that junior engineers skip: the **modular monolith**. One deployable, one database, but with hard *internal* module boundaries (separate schemas, no cross-module SQL joins, communication via in-process interfaces only). It gets you most of the design discipline of microservices with none of the network.

```
 MONOLITH                MODULAR MONOLITH          MICROSERVICES
 ┌──────────────┐        ┌──────────────┐          ┌────┐ ┌────┐ ┌────┐
 │ orders       │        │┌────┐┌──────┐│          │ord │ │bill│ │ship│
 │ billing      │        ││ord ││bill  ││          │+DB │ │+DB │ │+DB │
 │ shipping     │        │└────┘└──────┘│          └─┬──┘ └─┬──┘ └─┬──┘
 │   (1 DB)     │        │   (1 DB,     │            │ network │     │
 └──────────────┘        │  3 schemas)  │            └─────────┴─────┘
  free calls             └──────────────┘            calls = RPC over wire
  free transactions       enforced seams              no shared txn
```

| Dimension | Monolith | Modular Monolith | Microservices |
|---|---|---|---|
| Deploy unit | 1 | 1 | N independent |
| Cross-boundary call | function call (~ns) | function call (~ns) | network RPC (~0.5–5 ms LAN) |
| Transactions | ACID, free | ACID, free | sagas / eventual consistency |
| Team scaling | contention on 1 codebase | per-module ownership | full autonomy |
| Independent scaling | no (clone whole app) | no | yes (scale hot service) |
| Failure isolation | none | none (shared process) | per-service |
| Operational cost | low | low | high (mesh, CI/CD, on-call ×N) |
| Debugging | stack trace | stack trace | distributed tracing required |
| **When to use** | startup/MVP, <5 eng | most companies, scaling teams before scaling load | independent scaling/failure needs, large org, proven boundaries |

**Opinionated take - do NOT split early.** Microservices solve an *organizational* and *isolation* problem, not a "clean code" problem. Below ~15–20 engineers you almost never need them; you need module discipline. Shopify, GitHub, and Stack Overflow ran enormous monoliths for years. Shopify's "modular monolith" (the *Componentization* effort) is the canonical proof that you can get boundary discipline without distribution tax. Premature microservices give you all the costs (network failure, eventual consistency, deploy orchestration) before you have the problem they solve.

**Back-of-envelope on the network tax:** A request that touches 4 modules in a monolith is 4 function calls - microseconds total. The same 4 as microservices is 4 RPCs. At p50 ~1 ms each that's ~4 ms; but tail latency compounds: if each service is p99 = 20 ms, a *serial* fan-out of 4 has a p99 closer to ~40–60 ms because you're rolling the dice four times. **Tail amplification is the silent killer** of naive microservices (see `13-latency...md` on the "tail at scale", Dean & Barroso).

---

## 3. Finding boundaries: DDD bounded contexts

The #1 cause of failed microservice migrations is splitting on the wrong axis. **Do not split by technical layer** (a "database service", an "auth service" that everyone calls synchronously) or by org chart. Split by **bounded context** - a region of the domain where a term has one unambiguous meaning.

The litmus test: the word "Order" means different things to different parts of the business. In *Sales* an Order is a cart with pricing. In *Fulfillment* it's a pick-list with a shipping address. In *Billing* it's an invoice line. Each meaning is a bounded context; the seam between them is a natural service boundary.

```
   Sales Context        Fulfillment Context       Billing Context
   ┌──────────────┐     ┌──────────────────┐      ┌──────────────┐
   │ Order =      │     │ Order =          │      │ Order =      │
   │  cart+price  │ ──► │  pick-list+addr  │ ───► │  invoice     │
   └──────────────┘ evt └──────────────────┘  evt └──────────────┘
        ^ same word, different model - translate at the seam (ACL)
```

**Heuristics for good boundaries:**
- **High cohesion, low coupling.** Things that change *together* belong together. If every feature touches two services, they're one service wearing a costume.
- **Data ownership.** A service owns its data exclusively. If two services need to write the same table, you drew the line wrong.
- **Async over sync at the seam.** Contexts integrate by *events* ("OrderPlaced") not synchronous queries where possible - this decouples availability.
- **Anti-Corruption Layer (ACL).** When a context consumes another's model, translate it at the edge so upstream changes don't leak in.

> In Print-Flow-360 terms: a *bounded context* maps cleanly to the modular-monolith idea - `orders`, `pricing`, `pdf-service`, `designer` are already context-shaped. Notice `pdf-service` is the one piece extracted as a real separate service, precisely because it's a *different scaling and failure profile* (heavy CPU/IO file work). That's the right reason to extract: different operational characteristics, not "it felt cleaner."

---

## 4. The Strangler-Fig migration

Named after the fig vine that grows around a host tree until the tree dies and only the fig's hollow shell remains - you grow the new system around the monolith and route traffic over piece by piece. **Never do a big-bang rewrite** (see the war stories; Netscape, the canonical cautionary tale).

```
        ┌──────────────┐
client ─► Facade/Proxy │
        │  (router)    │
        └───┬──────┬───┘
   route?   │      │   route?
   /orders ─┘      └─ /shipping
      │                  │
  ┌───▼───┐         ┌────▼────┐
  │  NEW  │         │ MONOLITH│  ← shrinks each migration
  │ orders│         │ (rest)  │
  │  svc  │         └─────────┘
  └───────┘
```

Steps: (1) put a **facade/proxy** in front of the monolith so the boundary is movable; (2) carve out *one* bounded context behind it; (3) route that path to the new service; (4) **dual-write or replicate data** during transition; (5) backfill + verify; (6) cut reads over; (7) delete the dead code in the monolith. Repeat. Each step is independently shippable and reversible.

**The hard part is data, not code.** You'll run a period where both old and new own a slice. Patterns: *change-data-capture* (Debezium tailing the monolith's WAL to feed the new service), *dual writes* (risky - partial-failure inconsistency; prefer CDC or outbox), and the **outbox pattern** (write business row + event row in one local transaction, relay publishes the event - atomic, no distributed transaction). See `14-messaging...md` for outbox details.

---

## 5. Edge & inter-service infra

### API Gateway vs BFF

| | API Gateway | Backend-for-Frontend (BFF) |
|---|---|---|
| Purpose | single front door: auth, rate-limit, routing, TLS termination | per-client API tailored to one frontend (web/iOS/Android) |
| Count | usually 1 (or 1/region) | 1 per client type |
| Aggregates calls? | sometimes | yes - its whole point |
| Owner | platform team | the frontend team that consumes it |
| Risk | becomes a "god gateway" with business logic | duplication across BFFs |
| Real systems | Kong, AWS API Gateway, Envoy, Zuul | Netflix coined BFF; SoundCloud popularized it |

The BFF exists because a mobile screen and a web dashboard need *different* shapes of the same data, and you don't want every backend service to know about UI concerns. Keep the gateway dumb (cross-cutting concerns only) and push aggregation into BFFs. The anti-pattern is a gateway that grows business logic until it's a monolith you can't deploy independently.

### Service Mesh (sidecars, mTLS, traffic shaping)

A mesh moves networking concerns *out of your app* into a **sidecar proxy** (Envoy) deployed next to each instance. Your code makes a plain `localhost` call; the sidecar handles retries, timeouts, mTLS, load balancing, circuit breaking, and telemetry.

```
  ┌─ Pod A ────────┐         ┌─ Pod B ────────┐
  │ app ─► sidecar │── mTLS ─►│ sidecar ─► app │
  └────────────────┘  (Envoy) └────────────────┘
        ▲ data plane           ▲
        └──────── control plane (Istio/Linkerd) pushes config
```

What it buys you: **mTLS everywhere** (zero-trust between services), **traffic shaping** (canary 5% → 50% → 100%, blue/green, mirroring), **resilience** (per-route timeouts, retries with budgets, circuit breakers) *without recompiling apps*, and uniform L7 metrics. Real: **Istio** (Envoy + heavy control plane), **Linkerd** (lighter, Rust micro-proxy), AWS App Mesh.

**Opinionated:** a mesh is *overkill* below ~10–15 services. Sidecars add ~0.5–1 ms per hop and real memory/CPU overhead per pod, plus a notoriously complex control plane. Start with a good HTTP client library (timeouts + retries + circuit breaker, e.g. resilience4j/Polly) and graduate to a mesh when polyglot services or compliance-grade mTLS force your hand.

### Service Discovery

Services come and go (autoscaling, redeploys), so hardcoded IPs are dead on arrival. Two models:

| Model | How | Examples | Trade-off |
|---|---|---|---|
| Client-side | client queries registry, picks an instance, calls it | Netflix Eureka + Ribbon, Consul | client is smarter; LB logic duplicated per language |
| Server-side | client hits a stable VIP/LB which routes | Kubernetes Service + kube-dns, AWS ELB | simpler clients; extra hop |

Kubernetes makes this mostly invisible: a `Service` gives a stable DNS name and virtual IP; kube-proxy/iptables (or the mesh) load-balances to healthy pods via readiness probes. The deep gotcha: **health checks must reflect real readiness** (can it serve traffic + are its deps up?), or discovery will happily route to a zombie.

---

## 6. Database-per-service - the rule and the pain

**The rule:** each service owns its database; no other service touches it directly. This is what makes services independently deployable - you can change `orders`' schema without coordinating a global migration. Violate it (shared database) and you have a *distributed monolith*: separate deploys but coupled at the data layer, so nothing is actually independent.

**The pain it creates - and how the field solves it:**

- **No cross-service JOINs.** You can't `JOIN orders.customer_id = customers.id` across a network. Solutions: **API composition** (fetch from each, join in memory - simple, but N calls and no DB-level filtering), or **CQRS** (maintain a read-optimized materialized view fed by events - fast reads, eventual consistency, more moving parts).
- **No distributed ACID transaction.** "Reserve inventory AND charge card AND create shipment" spans 3 services. You can't 2PC at scale (blocking, coordinator is a SPOF). Use a **Saga**: a sequence of local transactions, each with a **compensating action** to undo on failure.

```
  SAGA (orchestrated)             on failure → compensate backward
  Order ─► reserve inventory ─► charge card ─► create shipment
            ▲ release stock  ◄─ refund     ◄── (rollback chain)
```

| Saga style | How | Pro | Con |
|---|---|---|---|
| Choreography | services react to each other's events | no central coordinator; loose | logic smeared across services; hard to follow |
| Orchestration | a coordinator drives the steps | explicit, debuggable | coordinator is a new component to run |

Sagas trade **atomicity for availability** and expose *intermediate* states to the world (an order can be "payment pending"). You must design for that (idempotent steps, since retries will re-deliver; see `14-messaging...md` on exactly-once-illusion). Real systems: **AWS Step Functions**, **Temporal**, **Camunda** for orchestration.

---

## 7. The Distributed Monolith - the anti-pattern that eats teams

This is the failure mode that gives microservices a bad name: you paid the full distribution tax and got *none* of the independence. Symptoms:

- **Synchronous call chains.** A→B→C→D where every request blocks on the next. Availability multiplies *down*: four services at 99.9% in series ≈ 99.6% (≈ 35 hrs/yr down vs 8.7). And tail latency compounds.
- **Shared database** behind multiple services.
- **Lock-step deploys.** "You can't release `orders` until `pricing` ships v2." If services must deploy together, they're one service.
- **Shared library hell.** A change to a common DTO/proto forces a coordinated rollout of everyone.
- **Chatty interfaces.** One user action = 30 internal calls.

```
  DISTRIBUTED MONOLITH (bad)         TRUE MICROSERVICES (good)
  A ─► B ─► C ─► D  (sync chain)     A ──evt──► [bus] ──► B
   availability multiplies down       services react async, deploy alone
   one deploy needs all of them       no temporal coupling
```

**Fixes:** integrate via **async events** not sync RPC at the seam (temporal decoupling); enforce **independent deployability** as a hard gate ("can I deploy this service alone, right now?"); version contracts and never break consumers (see CLAUDE.md's own backward-compat rule - same principle); collapse chatty chains by *moving the boundary* (if A always calls B, maybe A and B are one context).

---

## 8. Cell-based architecture & shuffle sharding (blast-radius isolation)

The advanced frontier. Even with perfect microservices, a *poison-pill* request, a bad deploy, or a hot tenant can take down a shared service for **everyone**. Cells fix this by partitioning the *entire stack* into independent, identical copies and pinning each customer to one.

```
   ┌──────── router / cell mapper ────────┐
   │ tenant → cell (deterministic)        │
   └──┬───────────┬───────────┬───────────┘
   ┌──▼──┐     ┌──▼──┐     ┌──▼──┐
   │CELL1│     │CELL2│     │CELL3│   each = full stack + DB
   │ svcs│     │ svcs│     │ svcs│   isolated failure domain
   │ +db │     │ +db │     │ +db │
   └─────┘     └─────┘     └─────┘
   a bad deploy / hot tenant in CELL2 only hurts CELL2's users
```

**Blast radius math:** with 1 shared stack, a fatal bug = 100% impact. With 10 equal cells, a cell-local failure = ~10%. The router (cell mapper) must be dead-simple and ultra-reliable - it's the only shared component, so keep it thin (a lookup table, ideally cached/static), not a smart service.

### Shuffle sharding - the elegant upgrade

Plain sharding into cells still means *all* the (say) 100 tenants in cell #2 share a fate. **Shuffle sharding** (AWS Route 53 / popularized by Colm MacCárthaigh) assigns each customer a *random small subset* of nodes instead of one cell, so two customers rarely share their *full* set.

Toy math: 8 worker nodes, give each customer a random pair (2 nodes). There are C(8,2)=28 possible pairs. A poison customer melting *both* their nodes only fully knocks out the *handful* of other customers sharing the *exact same pair*. The probability another customer shares both your nodes is tiny - you get isolation approaching "private infrastructure per customer" at a fraction of the cost.

```
 Customer A → {n1, n4}
 Customer B → {n2, n7}   ← shares 0 nodes with A
 Customer C → {n1, n7}   ← shares only 1 node with A (still served by n4)
 A node dies → most customers still have a surviving node
```

| Isolation strategy | Blast radius | Cost | When |
|---|---|---|---|
| Single shared stack | 100% | lowest | small, low-stakes |
| Cells (N) | ~1/N | N× infra-ish | multi-tenant SaaS, noisy-neighbor risk |
| Shuffle sharding | ~combinatorially tiny | shared pool, low | many customers, want near-private isolation cheaply |

Real systems: **AWS** runs cell-based architecture across S3, DynamoDB, Lambda; **Slack** publicly moved to cells; **Route 53** uses shuffle sharding. The trade-off: cross-cell operations are forbidden by design (a customer lives in one cell), and you need rock-solid per-cell deploy automation (you deploy to cells one at a time - automatic canary across the fleet).

### Multi-region & active-active

Cells generalize to regions. **Active-passive** (one region serves, another on warm standby) is simple but wastes capacity and has failover lag + risk of cold standby. **Active-active** (all regions serve writes) maximizes availability and locality but forces you to confront the hardest problem in the field: **multi-region data consistency** (see `09-cap-pacelc...md` and `10-data-replication...md`).

| Topology | RTO/RPO | Write consistency | Complexity | When |
|---|---|---|---|---|
| Single region | bad (region = SPOF) | trivial | low | most apps, honestly |
| Active-passive | minutes RTO, ~0 RPO if sync replica | one writer | medium | compliance/DR needs |
| Active-active | ~0 RTO | hard (conflicts, CRDTs, or globally-ordered) | high | global, latency-sensitive, 99.99%+ |

Active-active needs either **partitioned writes** (region owns a tenant's data - easiest, maps perfectly onto cells), **CRDTs / last-writer-wins** (eventual, accept conflicts - DynamoDB Global Tables), or a **globally consistent store** (Google **Spanner** / **CockroachDB** using TrueTime/Raft to give external consistency across regions - at a latency cost: cross-region commits pay the speed of light, ~30–150 ms round trips). You cannot have low-latency global writes *and* strong consistency *and* partition tolerance - physics and CAP both say no.

---

## 9. Common pitfalls / war stories

- **The premature split.** A 6-person startup splits into 12 microservices "to be ready to scale." They now spend 80% of their time on CI/CD, service discovery, and distributed debugging instead of features. They had zero scaling problem. *Fix: modular monolith first; extract a service only when it has a distinct scaling or failure profile (like `pdf-service`).*
- **Splitting by layer, not domain.** A "database access service" everyone calls synchronously - congratulations, you built a network-attached bottleneck and a SPOF. Boundaries are *vertical* (domain), not horizontal (tech layer).
- **The shared database that "we'll fix later."** Two services on one DB = distributed monolith forever. The schema becomes a global contract nobody can change. *Fix it during the strangler migration, not after.*
- **Big-bang rewrite.** The mythical "v2 from scratch while v1 runs" - by the time v2 catches up, requirements moved and you have two systems. (Joel Spolsky's "Things You Should Never Do" / the Netscape 6 collapse.) *Strangle, don't rewrite.*
- **Sync fan-out tail latency.** A page that synchronously calls 20 services has a p99 dominated by the *slowest of 20* on every request. *Fix: parallelize, set aggressive timeouts + fallbacks, cache, or precompute via events.*
- **Retry storms / no budgets.** Service B slows down, everyone retries, the retries amplify load, B falls over harder - a *metastable failure*. *Fix: retry budgets, exponential backoff + jitter, circuit breakers, load shedding.*
- **Distributed transaction via dual writes.** "Write to DB then publish to Kafka" - the process crashes between the two and you've lost the event silently. *Fix: outbox pattern (one local txn) + CDC relay.*
- **Mesh as a cargo cult.** Installing Istio for 5 services and then spending a quarter debugging Envoy config and sidecar OOMs. *Earn the mesh.*
- **No idempotency in sagas.** At-least-once delivery means every saga step runs more than once eventually. A non-idempotent "charge card" step double-charges. *Every step needs an idempotency key.*
- **One cell that's special.** A cell-based system where "the big customer gets their own special config" - now you have a snowflake and your per-cell deploy automation lies to you. *Cells must be identical.*

---

## 🧩 Case Study: Amazon - the service-oriented mandate + AWS cell-based architecture

**The problem (early 2000s).** Amazon.com began life as a single C++/Perl monolith called **Obidos**, fronting one giant Oracle database. By the early 2000s the site was serving tens of millions of customers and the monolith had become a *deployment chokepoint*: every team's change had to be coordinated into one release train, a single bad commit could brick the whole storefront, and the shared database was a contention point nobody could evolve without negotiating with everyone else. This is exactly the **distributed monolith trap from §7, except it was still a literal monolith** - lock-step deploys and a shared database, just without the network in between. Growth was throttled not by hardware but by *coordination*.

**The fix, step one - Bezos's service mandate (~2002).** The (now legendary) internal memo decreed: all teams expose their data and functionality *only* through service interfaces over the network; no team may read another team's database directly; there is no other inter-team communication allowed. This is the **database-per-service rule from §6 enforced as org policy**, and it simultaneously forced the **bounded-context discipline from §3**: each team had to define a clean contract for its slice of the domain (catalog, cart, ordering, payments, fulfillment) and own its data exclusively. Crucially they did *not* big-bang rewrite - they strangled Obidos service by service (**§4 strangler-fig**), routing each capability out from behind the monolith over time.

```
   BEFORE (Obidos monolith)          AFTER (service mandate)
   ┌─────────────────────┐           catalog ─┐
   │ catalog/cart/order  │           cart ────┤  each owns its DB,
   │ payment/fulfillment │  ──────►   order ──┤  talks only via API
   │   (one Oracle DB)   │           payment ─┤  no shared tables
   └─────────────────────┘           fulfil ──┘  no lock-step deploy
   one deploy train, shared schema   independent deploy per service
```

The payoff was organizational throughput: hundreds, then thousands of **two-pizza teams** deploying independently - Amazon later reported deploying to production on the order of **once every ~11.6 seconds** across the fleet. That cadence is *impossible* with a shared database or lock-step releases; it is the direct dividend of the §6 ownership rule plus the §7 independent-deployability gate.

**The fix, step two - cell-based architecture inside AWS.** The same teams went on to build AWS, and there they hit the next ceiling from §8: even with clean services, a single shared service plane means a poison-pill request, a hot tenant, or a bad config push can hurt *every* customer at once. So AWS services (DynamoDB, S3, Lambda, SQS, and many control planes) are partitioned into **cells** - full, identical stacks (compute + storage + their own data) - with each customer/partition deterministically mapped to one cell by a deliberately *thin, dumb router* (the **cell mapper from §8**, kept simple because it's the one shared component).

```
        ┌──── thin cell router (lookup, not logic) ────┐
        │ partition key → cell                          │
        └──┬──────────────┬──────────────┬──────────────┘
        ┌──▼──┐        ┌──▼──┐        ┌──▼──┐
        │CELL │        │CELL │        │CELL │   identical full stack
        │ +db │        │ +db │        │ +db │   isolated blast radius
        └─────┘        └─────┘        └─────┘
   bad deploy / poison request in one cell → only that cell's slice hurt
```

With *N* cells a cell-local failure caps impact at ~**1/N** instead of 100% - the **blast-radius math from §8.** Deploys go cell-by-cell as an automatic canary across the fleet, so a regression is caught in one small cell before it reaches the rest.

**Shuffle sharding on top (§8).** For services where even per-cell fate-sharing was too coarse, AWS (notably **Route 53** and the **AWS Shield/Builders' Library** work by Colm MacCárthaigh) applies **shuffle sharding**: each customer gets a *random small subset* of nodes from a shared pool rather than one fixed cell. With a pool of nodes and, say, a per-customer set of a few, the chance any two customers share their *entire* set is combinatorially tiny - so a single abusive or poisoned customer can fully knock out only the handful sharing its exact set, while everyone else keeps a surviving node. This buys near-"private infrastructure per customer" isolation from a *shared* pool, which is the whole point: isolation without N× the cost.

**The key trade-off they accepted.** Cells (and the service mandate before them) **forbid cheap cross-boundary operations**. Once a customer lives in one cell, you cannot trivially run a query or transaction that spans cells - cross-cell joins and global transactions are *designed out*. Internally that meant giving up convenient distributed ACID in favor of **API composition and sagas (§6)** and embracing eventual consistency at the seams (an order can sit in "pending" between services). They traded **developer convenience and strong global consistency for independent deployability and bounded blast radius** - and at Amazon's scale, *availability and isolation were worth far more than the convenience of a JOIN.*

**Results.** Independent per-team deploys (the ~11s cadence above) replaced the monolith's coordinated release train; cell isolation turned what would have been platform-wide AWS outages into incidents scoped to a fraction of customers; shuffle sharding pushed effective blast radius down to a tiny combinatorial fraction. The architecture is now the canonical reference for multi-tenant SaaS reliability.

### Lessons

- **Enforce boundaries as policy, not aspiration.** The §6 database-per-service rule only stuck because Amazon made "no direct DB access, talk via API" a *mandate* - discipline you merely hope for erodes; discipline the platform enforces survives.
- **Independent deployability is the real prize.** The ~11-second deploy cadence is the measurable payoff of §6 + §7 - if you can't deploy one service alone, you don't have microservices, you have a distributed monolith.
- **Cap blast radius before you chase five-nines.** Cells (§8) accept the cost of forbidding cross-cell operations in exchange for turning 100%-impact failures into 1/N-impact failures; shuffle sharding sharpens that to a combinatorial sliver - isolation, not raw uptime, is what bounds the worst day.
- **Keep the one shared component dumb.** The cell router/mapper is the single point everyone depends on, so it must be a thin, boring lookup - putting logic there recreates the very SPOF cells exist to eliminate.

## Test yourself

1. A team wants to split a 4-service synchronous call chain (A→B→C→D, each 99.9% available) for "reliability." What's the combined availability, and why might splitting *hurt* reliability here? *(Hint: 0.999⁴ ≈ 99.6%; serial sync chains multiply availability *down* and compound tail latency.)*
2. You're migrating a monolith and must run both old and new `orders` for a month. How do you keep their data consistent without distributed transactions? *(Hint: CDC/outbox + dual-read verification, not dual writes.)*
3. Why is "split by bounded context" better than "split by org chart" or "split by technical layer"? *(Hint: cohesion/coupling and data ownership; layer-splits create chatty SPOFs.)*
4. When is a service mesh *not* worth it, and what do you use instead? *(Hint: <~10 services / homogeneous stack; resilient HTTP client libraries.)*
5. Give the math for why 10 cells reduces blast radius vs a shared stack, and how shuffle sharding improves on plain cells. *(Hint: 1/N vs combinatorial C(n,k) overlap probability.)*
6. Name three ways to do multi-region active-active writes and the consistency cost of each. *(Hint: partitioned ownership; CRDT/LWW eventual; Spanner-style globally-consistent at cross-region latency.)*
7. What three symptoms tell you you've built a *distributed monolith* rather than microservices? *(Hint: shared DB, lock-step deploys, sync chains / chatty interfaces.)*
8. Why must every saga step be idempotent, and how do you enforce it? *(Hint: at-least-once delivery → replays; idempotency keys / dedup store.)*

---

## 11. Further reading

- **DDIA** (Kleppmann), *Designing Data-Intensive Applications* - Ch. 1 (maintainability/scalability), Ch. 7–9 (transactions, distributed consistency) underpin saga/CAP reasoning.
- Sam Newman, *Building Microservices* (2nd ed.) and *Monolith to Microservices* - the canonical strangler-fig and decomposition references.
- Eric Evans, *Domain-Driven Design* + Vaughn Vernon, *Implementing DDD* - bounded contexts, context maps, ACL.
- Chris Richardson, **microservices.io** + *Microservices Patterns* - saga, CQRS, API composition, outbox (definitive pattern catalog).
- Martin Fowler - "MonolithFirst", "StranglerFigApplication", "BoundedContext", "MicroservicePremium" essays.
- Colm MacCárthaigh / AWS - "Shuffle Sharding" (AWS Builders' Library) and "Workload isolation using shuffle-sharding".
- AWS Builders' Library - "Avoiding fallback in distributed systems", cell-based architecture write-ups; AWS Well-Architected reliability pillar.
- Dean & Barroso, *"The Tail at Scale"* (CACM 2013) - why fan-out kills tail latency.
- Corbett et al., *"Spanner: Google's Globally-Distributed Database"* (OSDI 2012) - TrueTime + globally consistent writes.
- Joel Spolsky, *"Things You Should Never Do, Part I"* - why not to big-bang rewrite.
- Istio / Linkerd / Envoy official docs; Kubernetes Services & readiness probes docs.

> Next: see `14-messaging-and-queues...md` (outbox, idempotency, async seams) and `09-cap-pacelc...md` (the consistency cost you inherit the moment data crosses a service boundary).
