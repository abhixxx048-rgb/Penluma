# 16 - Rate Limiting, Resiliency & Fault Tolerance

**What you'll learn:** How to throttle traffic precisely (five rate-limiting algorithms, with pseudo-code and the distributed-Redis variants), and how to keep a system standing when its dependencies misbehave - timeouts, retries with jitter and budgets, circuit breakers, bulkheads, load shedding, backpressure, and graceful degradation. You'll also learn to *think in failures*: cascading collapse, retry storms, thundering herds, and how chaos engineering and blast-radius reduction turn "hope" into engineering.

**Prerequisites:** Read `09-cap-pacelc...md` (consistency/availability trade-offs underpin "fail open vs fail closed"), `11-load-balancing...md` (where limiters and load shedders live), and `13-caching...md` (caches are both a degradation tool and a thundering-herd victim). Familiarity with queues (`12-message-queues...md`) helps for backpressure.

---

## 1. Why this module exists

Most outages are not caused by a single component dying. They're caused by a small failure that *propagates* - a slow database makes web servers pile up requests, threads exhaust, health checks fail, the load balancer pulls nodes out, the survivors get more load, and the whole tier falls over. The failure was 100ms of extra latency; the outage was the *response* to it.

Rate limiting and resiliency are the two halves of controlling that propagation:

- **Rate limiting** controls load coming *in* (protect yourself from clients and from yourself).
- **Resiliency patterns** control how you behave when something *downstream* breaks (protect yourself from your dependencies).

Both are fundamentally about one idea: **bounded resources, explicitly managed, with a defined behavior at the boundary.** Everything below is a variation on that.

---

## 2. Rate limiting

### 2.1 Intuition

A rate limiter is a bouncer at a club door. The club holds N people. The bouncer decides who gets in *now*, who waits, and who gets turned away. The interesting engineering is entirely in the *policy*: do you count per minute? Do you allow a burst then throttle? Do you smooth everyone to a steady trickle? Each algorithm answers differently.

We rate-limit for: protecting backends from overload, enforcing fairness across tenants (very relevant to a multi-tenant SaaS like this one), monetizing API tiers, and stopping abuse (credential-stuffing, scraping).

### 2.2 The five algorithms

```
Fixed Window          Sliding Log           Sliding Counter
[--60s--][--60s--]    keep every timestamp  weight prev window
count per bucket      exact, O(n) memory    by overlap fraction

Token Bucket          Leaky Bucket
tokens refill at rate fixed-rate drain
burst up to capacity  smooths to constant out
```

#### Fixed window counter

Divide time into fixed buckets (e.g. each calendar minute). Keep one counter per bucket.

```
def allow(key, limit, window):
    bucket = key + ":" + floor(now() / window)
    count  = INCR(bucket)            # atomic
    if count == 1: EXPIRE(bucket, window)
    return count <= limit
```

Dead simple, O(1) memory, one counter. **The flaw: boundary bursting.** A limit of 100/min allows 100 at 00:59 and 100 at 01:00 - 200 requests in a 2-second span across the boundary. You've nominally enforced 100/min but actually allowed 2× the rate over a real window.

#### Sliding window log

Store the timestamp of every request in a sorted set. To decide, drop everything older than `now - window` and count what remains.

```
def allow(key, limit, window):
    now = now_ms()
    ZREMRANGEBYSCORE(key, 0, now - window)   # evict old
    count = ZCARD(key)
    if count < limit:
        ZADD(key, now, unique_id); EXPIRE(key, window)
        return True
    return False
```

**Perfectly accurate** - no boundary problem. **Cost:** O(n) memory per key (one entry per request in the window). A client doing 10k req/min costs you 10k stored timestamps. Fine for low-limit auth endpoints; ruinous for high-throughput APIs.

#### Sliding window counter (the practical sweet spot)

Approximate the sliding window using two fixed-window counters, weighting the previous window by how much it still overlaps:

```
estimate = curr_count + prev_count * (1 - elapsed_in_curr / window)
allow if estimate < limit
```

If you're 25% into the current minute, you count 75% of last minute's requests plus all of this minute's. O(1) memory, no hard boundary spike, small approximation error (Cloudflare reported <0.003% error rate in production using exactly this). This is what most production API gateways use.

#### Token bucket (allows controlled bursts)

A bucket holds up to `capacity` tokens; tokens refill at `rate` per second. Each request consumes one token; if the bucket is empty, reject (or queue).

```
def allow(key, rate, capacity):
    now = now()
    tokens, last = GET(key)            # lazy refill - no background timer
    tokens = min(capacity, tokens + (now - last) * rate)
    if tokens >= 1:
        SET(key, tokens - 1, now)
        return True
    SET(key, tokens, now)
    return False
```

The genius is **lazy refill**: you don't run a timer adding tokens; you compute how many *would* have accrued since the last request. Token bucket allows bursts up to `capacity` then settles to `rate` - which matches real traffic (clients are bursty). This is what AWS API Gateway, Stripe, and most cloud APIs use. Stripe famously documented their token-bucket limiter.

#### Leaky bucket (smooths output to a constant rate)

Requests enter a FIFO queue; they drain at a *fixed* rate. Overflow is dropped. Where token bucket limits the *input* rate but permits bursts to pass through, leaky bucket guarantees a *constant output* - useful when the thing you protect cannot tolerate bursts at all (e.g. a legacy mainframe, a payment processor with a hard TPS cap).

```
Token bucket:  bursts pass through, then throttle   →  protects rate, allows spikes
Leaky bucket:  output is always smooth, queue absorbs →  protects the downstream's TPS
```

### 2.3 Comparison

| Algorithm | Memory | Accuracy | Allows bursts? | When to use |
|---|---|---|---|---|
| Fixed window | O(1) | Poor (2× boundary) | Accidentally | Crude internal throttle, you don't care about edges |
| Sliding log | O(n) per key | Exact | No | Low-volume sensitive endpoints (login, password reset) |
| Sliding counter | O(1) | ~exact (<0.01% err) | No | General-purpose API gateway - the default choice |
| Token bucket | O(1) | Exact | Yes, up to capacity | Public APIs where bursts are normal (Stripe, AWS) |
| Leaky bucket | O(queue) | Exact | No - smooths | Protecting a fixed-TPS downstream |

### 2.4 Distributed rate limiting

A single counter in app memory breaks the moment you run >1 instance: 10 servers each allowing 100/min = 1000/min actual. You need **shared state**. Options:

1. **Centralized store (Redis).** Every node does the INCR/ZADD against one Redis. Correct and simple. Cost: a network round-trip per request (+0.2–1ms intra-region) and Redis becomes a hotspot/SPOF. Mitigate with Redis Cluster sharded by key, and a Lua script to make the read-modify-write **atomic** (otherwise two nodes race between GET and SET):

```lua
-- token bucket as one atomic Redis call; no race window
local tokens = tonumber(redis.call('HGET', KEYS[1], 'tokens') or ARGV[2])
local last   = tonumber(redis.call('HGET', KEYS[1], 'ts') or ARGV[4])
local now, rate, cap = tonumber(ARGV[4]), tonumber(ARGV[1]), tonumber(ARGV[2])
tokens = math.min(cap, tokens + (now - last) * rate)
if tokens >= 1 then
  redis.call('HSET', KEYS[1], 'tokens', tokens - 1, 'ts', now)
  redis.call('EXPIRE', KEYS[1], ARGV[3]); return 1
end
return 0
```

2. **Local + async sync (sloppy counters).** Each node keeps a local count and periodically reconciles with a central store. Sub-millisecond, no per-request round-trip, but temporarily over-admits during the sync window. This is the **"approximate but cheap"** trade - what large-scale gateways (e.g. envoy's global rate limiting, or per-node buckets reconciled centrally) use when the round-trip cost is unacceptable.

3. **Sticky routing.** Hash the client to one node so its counter is local. Fragile - rebalancing on scale events loses state.

| Approach | Latency cost | Accuracy | SPOF risk | Use when |
|---|---|---|---|---|
| Centralized Redis + Lua | +0.5–1ms/req | Exact | Yes (mitigate w/ cluster) | Correctness matters, moderate QPS |
| Local + async reconcile | ~0 | Approximate (over-admits) | No | Ultra-high QPS, slight over-admit OK |
| Sticky routing | ~0 | Exact-ish | Per-node | Rare; avoid for elastic fleets |

**Always tell the client.** Return `429 Too Many Requests` with `Retry-After` and `X-RateLimit-Remaining`/`-Reset` headers. A limiter that rejects silently just turns into a retry storm (§4). For a multi-tenant store like this codebase, key by tenant *and* by endpoint class so one noisy tenant can't starve others - that's bulkheading (§3.4) applied to rate limits.

---

## 3. Resiliency patterns

Rate limiting protects you from *callers*. These patterns protect you from *callees* - the dependencies that go slow or down.

### 3.1 Timeouts - the foundation everything else stands on

> A request with no timeout is a resource leak waiting for a bad day.

The default timeout in most HTTP clients is "infinite" or absurdly long (Go's default `http.Client`: no timeout; many connection pools: 30–60s). When a downstream hangs, every caller thread blocks until... never. Threads/connections are finite; they exhaust; new requests can't even get a thread; you're down - caused by a dependency that was merely *slow*, not dead.

Set timeouts from your **latency distribution, not averages**. If p99 of the call is 200ms, a 2s timeout gives 10× headroom while still bounding the blast. Rule: a service's own timeout budget must be *larger* than the sum of its downstream timeouts and retries, or the outer caller gives up while you're still trying (wasted work). Propagate **deadlines**, not durations - gRPC does this: the original caller sets "this whole tree must finish by T", and every hop subtracts elapsed time. Without deadline propagation, retries deep in the call tree multiply latency.

### 3.2 Retries - and the trap inside them

Retries fix *transient* failures (a dropped packet, a brief GC pause, a node restart). They make *persistent* failures catastrophically worse. The math: if a service is overloaded and every client retries 3×, you've **tripled** the load on an already-dying service. This is the **retry storm** - retries are the accelerant in most cascading failures.

Rules for safe retries:

1. **Only retry idempotent operations** (GET, PUT, DELETE) - or use an idempotency key so a retried POST doesn't double-charge a card. (Directly relevant to payment flows: a retried charge without an idempotency key is a duplicate charge.)
2. **Exponential backoff** - wait `base * 2^attempt`, not a fixed interval.
3. **Add jitter.** Without it, all clients that failed at the same instant retry at the same instant - a synchronized wave. AWS's canonical post "Exponential Backoff and Jitter" showed *full jitter* (`sleep = random(0, base * 2^attempt)`) dramatically reduces contention vs naked backoff.
4. **Retry budgets / circuit at the client.** Cap retries to e.g. 10% of total requests (a *token bucket on retries*). When the budget is exhausted, fail fast. Google's SRE book and Envoy both implement retry budgets precisely because per-request retry caps still allow storms.
5. **Don't retry at every layer.** If the DB client retries 3×, the service retries 3×, and the gateway retries 3×, one user request becomes 27 backend calls. Retry at **one** layer, ideally the outermost that can do something useful.

```
Bad:   backoff only        ████  ████  ████   (all clients synchronized)
Good:  backoff + jitter    █  █     █ █   █    (spread out, less contention)
```

### 3.3 Circuit breaker - stop knocking on a dead door

If a dependency is down, retrying is pointless and harmful. A circuit breaker tracks the failure rate and, once it crosses a threshold, **trips open** - failing fast (or falling back) *without even attempting the call* for a cooldown. Then it tests the water before resuming.

```
        failures exceed threshold
   ┌────────────────────────────────┐
   ▼                                 │
[CLOSED] ──fail rate > X%──> [OPEN] ──after cooldown──> [HALF-OPEN]
   ▲  (calls flow normally)    │     (reject instantly,    │  (let 1 trial
   │                           │      fast-fail/fallback)  │   request through)
   └───────────────────────────────────────┬─────────────┘
        trial succeeds → CLOSED    trial fails → back to OPEN
```

- **Closed:** normal; count failures over a rolling window.
- **Open:** all calls fail instantly (latency → ~0, you stop hammering the sick service, giving it room to recover).
- **Half-open:** after cooldown, allow a *probe* request. Success → close; failure → re-open.

Netflix Hystrix popularized this; modern equivalents: resilience4j (JVM), Polly (.NET), Envoy/Istio outlier detection (at the mesh layer). Key tuning: threshold (e.g. >50% errors over 20+ requests - never trip on a single failure or tiny sample), and cooldown (5–30s). The circuit breaker is the single most important pattern for stopping **cascading failure**, because it converts "slow, blocking, thread-exhausting calls" into "instant failures" the moment a dependency is unhealthy.

### 3.4 Bulkheads - isolate so one leak doesn't sink the ship

Named after a ship's watertight compartments: flood one, the others keep you afloat. In software, partition resources so one failing dependency can't consume *all* of them.

Concretely: instead of one shared thread pool of 200 for all downstream calls, give the flaky recommendation service its own pool of 20. When recommendations hangs, it exhausts *its* 20 threads - the other 180 keep serving checkout. Without bulkheads, the slow recommendation call eats every thread and takes down the whole app.

Apply per-tenant (one tenant's traffic spike can't starve others - critical for this multi-tenant codebase), per-dependency, or per-endpoint-class. Implementations: separate connection pools, separate thread pools, separate Kubernetes deployments, or even separate cells (cell-based architecture - AWS's approach to blast-radius reduction).

### 3.5 Fallbacks & graceful degradation

When a call fails (or the breaker is open), what do you *return*? A fallback is the degraded-but-useful answer:

- Cached/stale data ("last known price").
- A default ("recommendations unavailable" → show bestsellers).
- A queued write ("we'll process this shortly") instead of a synchronous one.
- Partial response - render the page without the one broken widget.

**Graceful degradation** is the system-level version: shed *features*, not the whole service. Amazon's product page is built so that if reviews, recommendations, and "frequently bought together" all fail, you can *still buy the item*. The buy button is the core path; everything else is optional and degrades independently. Decide, per dependency, **fail-open vs fail-closed** (see `09-cap-pacelc...md`): a rate limiter whose Redis is down - do you allow all traffic (fail open, risk overload) or block all (fail closed, risk outage)? A fraud check - fail closed (don't approve when you can't verify). There's no universal answer; choose deliberately and document it.

### 3.6 Load shedding & backpressure

When you're *already* overloaded, accepting more work makes everything slower and serves *no one* (a queue of 10,000 requests each timing out = 0 successful + 100% CPU). **Load shedding** = deliberately rejecting some requests (429/503) to keep the rest healthy. Shed by priority: drop health-check-able batch/analytics traffic before paying-customer checkout traffic. Better than CPU-based shedding is **queue-latency-based** (used by Facebook/Meta): if the time a request spends *waiting in queue* exceeds a threshold, shed it - that directly measures "am I falling behind?"

**Backpressure** is the upstream-facing twin: instead of silently dropping, signal the producer to *slow down*. TCP flow control, HTTP/2 flow control, reactive streams (`request(n)`), and bounded queues all implement backpressure. A bounded queue that blocks (or rejects) when full *is* backpressure - it's why you should **never use an unbounded queue** between a fast producer and a slow consumer (unbounded queue = OOM crash deferred to later, plus latency that grows without limit). See `12-message-queues...md`.

| Pattern | Protects against | Mechanism | Real systems |
|---|---|---|---|
| Timeout | Hung dependencies | Bound wait time | Every HTTP client; gRPC deadlines |
| Retry + jitter | Transient blips | Backoff w/ randomness | AWS SDK, Envoy |
| Retry budget | Retry storms | Token bucket on retries | Google SRE, Envoy |
| Circuit breaker | Cascading failure | Trip open on high error rate | Hystrix, resilience4j, Istio |
| Bulkhead | Resource monopoly | Partitioned pools | Hystrix, cell architecture |
| Fallback | User-facing errors | Degraded answer | Amazon, Netflix |
| Load shedding | Self-overload | Reject excess by priority | Meta (queue latency) |
| Backpressure | Producer overrun | Signal slow-down | TCP, HTTP/2, Reactive Streams |

---

## 4. Failure thinking

### 4.1 Cascading failures

The canonical sequence: a small perturbation (DB slows 100ms) → callers' threads block longer → thread pools fill → queues grow → latency spikes → health checks time out → load balancer ejects "unhealthy" nodes → survivors get *more* load → they fall over → the LB ejects them too → total outage. The trigger was trivial; the **positive feedback loop** was fatal. Circuit breakers + timeouts + load shedding + bulkheads exist specifically to break these loops.

### 4.2 Retry storms (metastable failures)

A subtle and dangerous class: the system can get *stuck* in a bad state even after the original trigger is gone. Example: a brief overload causes timeouts; clients retry; retries keep the service overloaded; even after the original spike passes, the retry-induced load *sustains* the overload indefinitely. This is a **metastable failure** (a 2021 research area, HotOS paper "Metastable Failures in Distributed Systems"). Recovery often requires *manual* intervention - drop the retry load, shed aggressively, or even briefly take traffic to zero - because the system won't self-heal. The fix is preventive: retry budgets, jitter, and circuit breakers that *remove* the retry pressure.

### 4.3 Thundering herd

Many clients wake up and hit the same resource at the same instant:

- **Cache stampede:** a hot cache key expires; 1000 concurrent requests all miss and all hit the DB to recompute the same value. Fixes: (a) *request coalescing / single-flight* - only the first miss recomputes, the rest wait for it; (b) probabilistic early expiration (XFetch) - recompute *before* expiry with rising probability; (c) locks. See `13-caching...md`.
- **Synchronized retries** (§4.2) - same root cause, fixed by jitter.
- **Cron / restart herds** - every node's `@daily` job fires at 00:00:00, or a deploy restarts all nodes at once and they all reconnect/warm caches simultaneously. Stagger with jitter.

### 4.4 Blast-radius reduction

Assume failures *will* happen; minimize how much they take down. Techniques: **cell-based architecture** (partition users into independent cells; a bug or overload affects one cell, not all users), **shuffle sharding** (AWS - assign each customer a random subset of nodes so any two customers rarely share the *same* full set; one customer's "poison" request affects few others), **regional isolation**, and **canary/staged rollouts** (a bad deploy hits 1% before 100%).

### 4.5 Chaos engineering

You cannot trust resilience you haven't tested under failure. Chaos engineering deliberately injects failures in production-like (or production) environments to verify the system degrades as designed. Netflix's Chaos Monkey (kills random instances), Gremlin, and AWS Fault Injection Service. The discipline: form a **hypothesis** ("if Redis dies, the limiter fails open and latency rises <50ms"), inject the fault on a small blast radius, measure, and fix the surprises. The point isn't breaking things - it's discovering the implicit assumptions ("we assumed the cache was always there") *before* an incident does.

---

## 5. Common pitfalls / war stories

- **No timeout = the silent killer.** The single most common root cause of "the whole app went down because one dependency got slow." Audit every outbound call for an explicit, distribution-based timeout.
- **Retrying non-idempotent writes.** A payment retried without an idempotency key = double charge. Customers notice. (See this repo's payment-correctness notes - retried charges are exactly the failure mode to guard.)
- **Retries at every layer.** 3×3×3 = 27. Pick one layer.
- **Backoff without jitter.** You "added resiliency" and created a synchronized retry wave that's *worse* than no retry.
- **Circuit breaker that trips on one failure / tiny sample.** Now a single blip opens the circuit and you've created an outage from a hiccup. Require a minimum request volume in the window.
- **Unbounded queue as "backpressure."** It's not backpressure; it's deferred OOM with unbounded latency. Bound it.
- **Rate limiter as a SPOF.** If every request must hit one Redis and Redis is down, you must have *already decided* fail-open vs fail-closed - discovering it during the incident is too late.
- **Fixed-window limiter sold as a guarantee.** "100/min" that actually allows 200 at the boundary. Use sliding counter.
- **Load shedding by CPU instead of queue latency.** CPU is a lagging, noisy signal; queue wait time directly measures "am I behind."
- **Health checks that are too strict** (eject nodes during a transient blip → fewer nodes → more load → eject more → cascade). Make health checks tolerant; distinguish "degraded" from "dead."

---

## 🧩 Case Study: Stripe rate limiting + Netflix Hystrix circuit breaking

Two of the most-cited engineering stories in this space map almost one-to-one onto the patterns above. Stripe is the canonical "distributed token bucket" story; Netflix is the canonical "circuit breaker + bulkhead" story. Together they cover the whole module.

### The problem

**Stripe** runs a payments API where a single bad actor - or one customer's runaway integration with a buggy retry loop - can flood the API with thousands of requests per second. At Stripe's scale (millions of API calls per day, billions of dollars in payment volume, every request hitting a shared Postgres/Redis tier), one tenant's burst must never degrade everyone else's checkout. They also can't just drop requests blindly: a rejected `POST /charges` that the client retries without care becomes a *double charge*. So the limiter has to be precise, multi-tenant-fair, distributed across their whole fleet, and paired with idempotency.

**Netflix** (circa 2011–2012) ran ~1B+ API calls/day through their Edge/API tier, fanning out to dozens of backend services (recommendations, bookmarks, ratings, A/B config, etc.) per device request. A single Netflix home screen touched many dependencies. The math is brutal: at 99.99% per-dependency availability across 30 dependencies, you still see ~0.3% of requests touch a failing dependency - millions of failures/day. One slow service (not even *down*, just slow) would block threads on the API tier, exhaust the pool, and take down the *entire* streaming UI. They needed one slow backend to never sink the ship.

### How the module's concepts were applied

**Stripe → token bucket across N servers via Redis (§2.2, §2.4).** Stripe documented their limiter as a **token bucket** implemented in **Redis with a Lua script** - exactly the "centralized store + atomic read-modify-write" design from §2.4. Each request runs the bucket math (lazy refill, decrement) as one atomic Redis call so two app servers can't race between GET and SET. They actually run several limiter *types* layered:

```
        incoming API request (keyed by merchant + endpoint class)
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
  request-rate limiter   concurrency limiter    fleaky-bucket
  (token bucket in       (caps in-flight per     leaky-bucket load
   Redis+Lua, per key)    merchant - a bulkhead)  shedder (sheds non-critical
        │                     │                     first under stress)
        └─────────────────────┼─────────────────────┘
                              ▼
                  allow → 200   |   reject → 429 + Retry-After
```

Keying by **merchant + endpoint class** is the bulkhead-applied-to-rate-limits idea from §2.4/§3.4: a noisy merchant exhausts *their* bucket, not the shared backend. The concurrency limiter caps simultaneous in-flight requests per merchant - a bulkhead (§3.4) expressed as a limit. And because retried `POST`s are dangerous (§3.2 rule 1), Stripe pairs all of this with **idempotency keys**, so a client that retries a 429'd or timed-out charge never double-charges.

**Netflix → circuit breaker + bulkhead + fallback (§3.3–3.5).** Hystrix wrapped *every* outbound dependency call in a command object that enforced four of this module's patterns at once:

- a **timeout** (§3.1) on every call, set from the dependency's latency distribution;
- a **circuit breaker** (§3.3) with the exact CLOSED → OPEN → HALF-OPEN states from the diagram above - it tripped when the rolling error rate crossed a threshold over a minimum request volume (never on a single failure, the §5 pitfall), failed fast while OPEN, and let a single probe through in HALF-OPEN;
- a **bulkhead** (§3.4) - each dependency got its *own* small thread pool, so a hanging recommendations service exhausted only its ~10–20 threads, never the threads serving playback;
- a **fallback** (§3.5) - when the breaker was open or the call failed, return degraded-but-useful data (a generic non-personalized list instead of personalized recommendations), so the page still rendered.

```
[CLOSED] ──errors > 50% over N reqs──> [OPEN] ──5s──> [HALF-OPEN]
   ▲ calls real service                  │ instant fallback   │ 1 probe
   │ (own bulkhead thread pool)          │ (no thread held)   │
   └──────────────────── probe ok ───────────────────────────┘
```

This is precisely the §4.1 cascade broken at three points: the timeout bounds the wait, the bulkhead bounds the resource blast, and the breaker converts "slow blocking call" into "instant fallback" the moment the dependency is unhealthy.

### The key trade-off they accepted

**Stripe** accepted a **Redis round-trip and a Redis SPOF on every API call** (~sub-millisecond, but real) in exchange for *exact, fleet-wide* limiting - they chose the "Centralized Redis + Lua" row of the §2.4 table over the cheaper "local sloppy counter" row, because for payments, over-admitting (charging past a limit, hammering a downstream processor) is worse than a tiny latency cost. They mitigate the SPOF with Redis redundancy and a deliberate fail-open/fail-closed decision per limiter type (§3.5).

**Netflix** accepted **degraded UX and the overhead of a separate thread pool per dependency** (thread-context-switch cost, more total threads) in exchange for *isolation* - a worse-but-working home screen instead of an all-or-nothing one. They gave up "always perfectly personalized" to get "never fully down."

### Real results

- Stripe's published numbers describe the limiter adding only sub-millisecond overhead while protecting the API; the four-layer design (rate + concurrency + load-shed) kept abusive traffic from affecting well-behaved merchants.
- Hystrix let Netflix survive individual dependency outages with **no visible user impact** beyond reduced personalization, and Netflix open-sourced it precisely because the pattern generalized - it became the template for resilience4j, Polly, and Istio outlier detection (§3.3). It also forced **chaos testing** (§4.5): Chaos Monkey killed instances to *prove* the breakers and fallbacks actually worked.

### Lessons

- **A rate limiter is only as good as its keying.** Stripe's win wasn't the algorithm (token bucket is textbook) - it was keying per *merchant + endpoint class* so limiting doubled as bulkheading. Decide what a "tenant" is before you pick an algorithm.
- **Wrap dependencies, not requests.** Netflix's leverage came from making *every* outbound call carry a timeout + breaker + bulkhead + fallback by construction, so resilience was the default, not something each engineer remembered to add.
- **Pick your trade-off explicitly and early.** Both teams *chose* - Stripe: latency/SPOF for exactness; Netflix: degraded UX for isolation. The §5 pitfall is discovering you never decided (fail-open vs fail-closed, over-admit vs round-trip) during the incident.
- **Resilience you haven't broken on purpose is a guess.** Netflix only trusted Hystrix because Chaos Monkey continuously proved the fallbacks fired.

## 6. Test yourself

1. **Why does a fixed-window limiter allow up to 2× the configured rate, and which algorithm fixes it most cheaply?** *(Hint: bursts straddling the window boundary; sliding-window counter, O(1).)*
2. **You run 20 app servers and need a global 1000 req/s limit. Name two designs and their trade-offs.** *(Hint: centralized Redis+Lua (accurate, +round-trip, SPOF) vs local sloppy counters (fast, over-admits).)*
3. **A downstream service is healthy but slow (p99 = 5s, you have no timeout). Walk through how this becomes a full outage.** *(Hint: thread/connection exhaustion → cascade.)*
4. **Why is "backoff without jitter" sometimes worse than no retry at all?** *(Hint: synchronized retry waves; thundering herd on the recovering service.)*
5. **Explain the three circuit-breaker states and what a request experiences in each.** *(Hint: closed=normal, open=instant fail/fallback, half-open=single probe.)*
6. **What is a metastable failure, and why can't the system always self-heal from one?** *(Hint: retry-sustained overload persists after the trigger; positive feedback loop needs external load removal.)*
7. **Your Redis-backed limiter loses Redis. Fail open or fail closed - and how would the answer differ for a fraud-check vs a public read API?** *(Hint: read API → fail open for availability; fraud → fail closed for safety; per-dependency decision.)*
8. **Why should you never put an unbounded queue between a fast producer and slow consumer, and what's the correct alternative?** *(Hint: OOM + unbounded latency; bounded queue that applies backpressure/sheds.)*

---

## 7. Further reading

- **DDIA** (Kleppmann), Ch. 1 ("Reliability") and Ch. 8 ("The Trouble with Distributed Systems") - failure thinking foundations.
- **Google SRE Book** - "Handling Overload," "Addressing Cascading Failures" (the definitive treatment of retry budgets, load shedding, and the cascade loop).
- **Release It!** (Michael Nygard) - origin of the Circuit Breaker and Bulkhead *as named patterns*; "Stability Patterns/Antipatterns."
- **AWS Builders' Library** - "Exponential Backoff and Jitter," "Timeouts, retries, and backoff with jitter," "Workload isolation using shuffle-sharding."
- **"Metastable Failures in Distributed Systems"** (Bronson et al., HotOS 2021) - the sustained-feedback failure class.
- **Stripe Engineering** - "Scaling your API with rate limiters" (token bucket in production).
- **Cloudflare blog** - "How we built rate limiting capable of scaling to millions of domains" (sliding window counter, error analysis).
- **Netflix Hystrix wiki** and **resilience4j docs** - circuit breaker / bulkhead implementation details.
- **Principles of Chaos Engineering** (principlesofchaos.org) - the hypothesis-driven discipline.

---

*Sibling modules: `09-cap-pacelc...md` (fail-open vs fail-closed), `11-load-balancing...md` (where limiters/shedders live), `12-message-queues...md` (bounded queues & backpressure), `13-caching...md` (cache stampede / thundering herd).*
