---
title: 'Rate Limiting and Resiliency: Keep Systems Standing Under Load'
metaTitle: 'Rate Limiting and Resiliency Patterns'
description: >-
  Learn rate limiting and resiliency patterns that keep systems alive under
  load: token buckets, circuit breakers, retries with jitter, bulkheads, and more.
keywords:
  - rate limiting
  - resiliency patterns
  - circuit breaker
  - token bucket algorithm
  - retry storm
  - exponential backoff jitter
  - cascading failure
  - bulkhead pattern
  - load shedding
  - backpressure
  - distributed rate limiting
  - graceful degradation
  - chaos engineering
  - sliding window rate limiter
  - fault tolerance
faq:
  - q: What is the difference between rate limiting and resiliency?
    a: >-
      Rate limiting controls how much traffic comes into your system so callers
      cannot overwhelm it. Resiliency patterns control how your system behaves
      when the dependencies it calls go slow or down. One protects you from
      clients, the other protects you from your dependencies.
  - q: Which rate limiting algorithm should I use?
    a: >-
      For most public APIs, the sliding window counter is the default choice:
      O(1) memory and near-exact accuracy. Use a token bucket when clients are
      naturally bursty, and a leaky bucket when the downstream cannot tolerate
      bursts at all.
  - q: What is a circuit breaker and when does it trip?
    a: >-
      A circuit breaker watches the failure rate of calls to a dependency and
      trips open once failures cross a threshold, failing fast instead of
      hammering a sick service. After a cooldown it lets one probe request
      through to test whether the dependency has recovered.
  - q: Why do you need jitter when retrying failed requests?
    a: >-
      Without jitter, every client that failed at the same instant retries at
      the same instant, creating a synchronized wave that re-overwhelms the
      recovering service. Adding randomness spreads the retries out and reduces
      contention.
  - q: What is a cascading failure?
    a: >-
      A cascading failure is when a small problem, like 100ms of extra latency,
      triggers a chain reaction: threads pile up, pools exhaust, health checks
      fail, nodes get ejected, survivors get more load, and the whole tier falls
      over. The trigger is trivial; the feedback loop is fatal.
author: Brexis Wazik
transformed: true
topic: system-design
topicTitle: System Design
category: Engineering
date: '2026-06-15'
order: 16
icon: "\U0001F3D7️"
sources: []
polished: true
linked: true
---

Most outages do not start with a server bursting into flames. They start with something tiny: a database that got 100 milliseconds slower. That extra wait makes web servers pile up requests. Threads run out. Health checks time out. The [load balancer](/blog/system-design/07-load-balancing-and-scaling) pulls "unhealthy" nodes offline, which dumps even more traffic on the survivors, which then fall over too.

The failure was 100 milliseconds of latency. The outage was the system's *response* to it.

Controlling that response is the whole game. You will learn how to throttle traffic on purpose, and how to keep your system standing when the things it depends on start misbehaving.

## Why this matters

Every online system needs two abilities, and they are mirror images of each other.

- **Rate limiting** controls the load coming *in*. It protects you from clients, and from your own runaway code.
- **Resiliency patterns** control how you behave when something *downstream* breaks. They protect you from your dependencies.

Underneath both is a single idea: **bounded resources, explicitly managed, with a defined behavior at the boundary.** When you run out of something, you decide in advance what happens. Everything below is a variation on that one sentence.

Get this right and a slow dependency becomes a minor blip. Get it wrong and the same blip becomes a 3 a.m. page and a public status-page apology.

## Rate limiting: the bouncer at the door

Think of a rate limiter as a bouncer at a club. The club holds a fixed number of people. The bouncer decides who gets in now, who waits, and who gets turned away.

All the interesting engineering lives in the *policy*. Do you count requests per minute? Do you allow a quick burst and then slow people down? Do you smooth everyone into a steady trickle? Each algorithm answers that question differently.

You rate-limit to protect backends from overload, to keep one noisy customer from starving the others, to power paid API tiers, and to shut down abuse like credential stuffing and scraping.

### The five algorithms, in plain language

**Fixed window counter.** Chop time into buckets, one counter per bucket (say, each calendar minute). Simple and cheap. The catch is **boundary bursting**: a limit of 100 per minute lets through 100 requests at 00:59 and another 100 at 01:00, which is 200 requests in a two-second span. You promised 100 per minute and quietly allowed double.

**Sliding window log.** Store the timestamp of every request. To decide, throw away anything older than your window and count what's left. This is perfectly accurate with no boundary problem. The cost is memory: a client doing 10,000 requests a minute costs you 10,000 stored timestamps. Great for low-traffic login endpoints, ruinous for a busy API.

**Sliding window counter.** This is the practical sweet spot. It approximates a true sliding window using two fixed-window counters, weighting the previous window by how much of it still overlaps. If you are 25% into the current minute, you count all of this minute plus 75% of last minute. You get O(1) memory, no boundary spike, and a tiny approximation error. Cloudflare reported under 0.003% error using exactly this in production. It is what most API gateways reach for by default.

**Token bucket.** A bucket holds up to a *capacity* of tokens and refills at a steady *rate*. Each request spends one token; an empty bucket means rejection. The clever part is **lazy refill**: you do not run a background timer adding tokens, you just calculate how many *would* have accrued since the last request. Token bucket allows short bursts up to capacity, then settles to the steady rate, which matches how real clients behave. Stripe and AWS API Gateway both use this.

**Leaky bucket.** Requests enter a queue and drain at a *fixed* rate; overflow is dropped. Where a token bucket lets bursts pass through, a leaky bucket guarantees a *constant* output. Use it when the thing you protect cannot handle bursts at all, like a legacy mainframe or a payment processor with a hard transactions-per-second cap.

### Quick comparison

| Algorithm | Memory | Allows bursts? | When to use |
|---|---|---|---|
| Fixed window | Tiny | Accidentally | Crude internal throttle, edges don't matter |
| Sliding log | Heavy | No | Low-volume sensitive endpoints (login, password reset) |
| Sliding counter | Tiny | No | General-purpose API gateway, the default choice |
| Token bucket | Tiny | Yes, up to capacity | Public APIs where bursts are normal |
| Leaky bucket | Queue-sized | No, smooths | Protecting a fixed-TPS downstream |

### One counter breaks the moment you scale

A counter in a single server's memory falls apart the instant you run more than one server. Ten servers each allowing 100 per minute is 1,000 per minute in reality. You need **shared state**, and there are three common ways to get it.

1. **Centralized store (usually Redis).** Every node counts against one Redis instance. Correct and simple, at the cost of a network round-trip per request and a potential single point of failure. The crucial detail: wrap the read-modify-write in a small Lua script so it runs as *one atomic operation*. Otherwise two servers race between reading the count and writing it back, and your limit leaks.
2. **Local counts with async sync.** Each node counts locally and reconciles with a central store every so often. This is near-instant with no per-request round-trip, but it temporarily over-admits during the sync window. The "approximate but cheap" trade, used by very high-traffic gateways.
3. **Sticky routing.** Pin each client to one node so its counter stays local. Fragile, because rebalancing during a scale event loses the count. Avoid it for elastic fleets.

Whichever you pick, **always tell the client.** Return `429 Too Many Requests` with a `Retry-After` header and the remaining-quota headers. A limiter that rejects silently just teaches clients to retry harder, which turns into a retry storm (more on that soon). And in a multi-tenant system, key your limits by *tenant and endpoint class together*, so one loud tenant cannot crowd out everyone else. That is the bulkhead idea, applied to rate limits.

## Resiliency: protecting yourself from your dependencies

Rate limiting guards against callers. These next patterns guard against the things you call, the dependencies that go slow or disappear.

### Timeouts: the foundation everything rests on

> A request with no timeout is a resource leak waiting for a bad day.

Most HTTP clients default to an infinite or absurdly long timeout. When a downstream hangs, every calling thread blocks until... never. Threads and connections are finite. They run out. New requests cannot even grab a thread. Now you are down, brought low by a dependency that was merely *slow*, not even dead.

Set timeouts from your **latency distribution, not your average**. If the 99th-percentile call takes 200 milliseconds, a 2-second timeout gives generous headroom while still bounding the damage. And propagate **deadlines, not durations**: the original caller sets "this whole thing must finish by time T," and every hop along the way subtracts the time already spent. Without that, retries deep in the call tree quietly multiply your latency.

### Retries: the cure that can become the poison

Retries fix *transient* failures beautifully, a dropped packet, a brief pause, a node restart. They make *persistent* failures catastrophically worse. If a service is already overloaded and every client retries three times, you have just tripled the load on a dying service. This is the **retry storm**, and it is the accelerant in most cascading failures.

Rules for retrying safely:

1. **Only retry idempotent operations**, or use an [idempotency key](/blog/system-design/11-distributed-transactions-and-idempotency). A retried `POST /charges` with no idempotency key is a double charge, and customers notice.
2. **Use exponential backoff.** Wait longer after each attempt, not a fixed interval.
3. **Add jitter.** Without randomness, every client that failed at the same instant retries at the same instant, a synchronized wave. AWS's well-known write-up on backoff and jitter showed that adding randomness dramatically cuts contention.
4. **Set a retry budget.** Cap retries to, say, 10% of total requests, a token bucket on retries themselves. When the budget runs dry, fail fast. Per-request caps alone still allow storms.
5. **Do not retry at every layer.** If the database client retries 3x, the service retries 3x, and the gateway retries 3x, one user request becomes 27 backend calls. Retry at *one* layer.

```
Bad:   backoff only      ████  ████  ████    (all clients synchronized)
Good:  backoff + jitter   █  █    █ █   █     (spread out, less contention)
```

### Circuit breakers: stop knocking on a dead door

If a dependency is down, retrying is pointless and harmful. A circuit breaker watches the failure rate and, once it crosses a threshold, **trips open**, failing fast without even attempting the call for a cooldown period. Then it cautiously tests the water before resuming.

It has three states:

- **Closed:** normal operation. Calls flow through while you count failures over a rolling window.
- **Open:** every call fails instantly. Latency drops to nearly zero and you stop hammering the sick service, giving it room to breathe and recover.
- **Half-open:** after the cooldown, let a single *probe* request through. If it succeeds, close the circuit. If it fails, snap back open.

Netflix's Hystrix popularized this pattern; modern versions include resilience4j on the JVM, Polly on .NET, and Envoy or Istio outlier detection at the service-mesh layer. Tune two things carefully: the trip threshold (say, more than 50% errors over at least 20 requests, never trip on a single failure or a tiny sample) and the cooldown (5 to 30 seconds). This is the single most important pattern for stopping cascading failure, because it converts slow, thread-eating calls into instant failures the moment a dependency turns unhealthy.

### Bulkheads: so one leak doesn't sink the ship

The name comes from the watertight compartments in a ship's hull. Flood one, and the others keep you afloat. In software, you partition resources so one failing dependency cannot consume *all* of them.

Concretely: instead of one shared pool of 200 threads for every downstream call, give the flaky recommendation service its *own* pool of 20. When recommendations hangs, it exhausts those 20 threads, and the other 180 keep serving checkout. Without bulkheads, that one slow call eats every thread and takes the whole app down with it.

Apply this per tenant, per dependency, or per endpoint class. You can implement it with separate connection pools, separate thread pools, separate deployments, or even separate "cells" of infrastructure.

### Fallbacks and graceful degradation

When a call fails or the breaker is open, what do you actually return? A fallback is the degraded-but-still-useful answer:

- Stale cached data ("last known price").
- A sensible default (recommendations down, so show bestsellers instead).
- A queued write ("we'll process this shortly") instead of a synchronous one.
- A partial response, rendering the page without the one broken widget.

**Graceful degradation** is the whole-system version: shed *features*, not the service. Amazon's product page is built so that if reviews, recommendations, and "frequently bought together" all break, you can *still buy the item*. The buy button is the core path; everything else is optional and fails independently.

For each dependency, decide deliberately: **fail open or fail closed?** If your rate limiter's Redis goes down, do you allow all traffic through (fail open, risk overload) or block everything (fail closed, risk an outage)? For a fraud check, you fail closed: never approve when you cannot verify. There is no universal answer. Choose on purpose and write it down.

### Load shedding and backpressure

When you are *already* overloaded, accepting more work just makes everything slower and serves no one. A queue of 10,000 requests all timing out equals zero successes and 100% CPU. **Load shedding** means deliberately rejecting some requests, with a 429 or 503, to keep the rest healthy. Shed by priority: drop batch and analytics traffic before you drop a paying customer's checkout. The best signal is **queue-latency-based** shedding, used at Meta: if a request has been waiting in the queue longer than a threshold, drop it, because wait time directly measures "am I falling behind?"

**Backpressure** is the upstream-facing twin. Instead of silently dropping work, you signal the producer to slow down. [TCP flow control](/blog/system-design/02-networking-and-protocols), HTTP/2 flow control, and bounded queues all do this. A bounded queue that blocks or rejects when full *is* backpressure. This is exactly why you should **never put an unbounded queue between a fast producer and a slow consumer**, an unbounded queue is just an out-of-memory crash deferred to later, with latency that grows without limit in the meantime.

## How systems actually fail

Knowing the patterns is half the job. The other half is learning to *think in failures*.

### Cascading failures

The classic sequence: a database slows by 100ms, callers' threads block longer, thread pools fill, queues grow, latency spikes, health checks time out, the load balancer ejects "unhealthy" nodes, the survivors get more load, they fall over, the balancer ejects them too, and you have a total outage. The trigger was trivial; the **positive feedback loop** was fatal. Timeouts, circuit breakers, bulkheads, and load shedding all exist to break that loop.

### Metastable failures: when the system stays stuck

Here is a subtle and dangerous one. Sometimes a system stays broken even after the original trigger is long gone. A brief overload causes timeouts, clients retry, the retries keep the service overloaded, and the retry-induced load *sustains* the overload indefinitely. This is a **metastable failure**, and recovery often needs *manual* intervention, dropping the retry load, shedding hard, or briefly taking traffic to zero, because the system will not self-heal. The fix is preventive: retry budgets, jitter, and circuit breakers that *remove* the retry pressure.

### Thundering herds

Many clients wake up and slam the same resource at the same instant. The classic case is a **cache stampede**: a [hot cache key expires](/blog/system-design/06-caching-deep), a thousand concurrent requests all miss, and all hit the database to recompute the same value. The fixes are request coalescing (only the first miss recomputes, the rest wait for the result), probabilistic early expiration, or locks. The same root cause shows up in synchronized retries (fixed by jitter) and in cron jobs or deploys that fire on every node at exactly midnight (fixed by staggering with jitter).

### Blast-radius reduction and chaos engineering

Assume failures *will* happen and limit how much they take down. **Cell-based architecture** splits users into independent cells so a bug hits one cell, not everyone. **Shuffle sharding** gives each customer a random subset of nodes so one customer's poison request rarely reaches another. **Canary rollouts** push a bad deploy to 1% before 100%.

And you cannot trust resilience you have never tested. **Chaos engineering** deliberately injects failures to confirm the system degrades the way you designed it to. Netflix's Chaos Monkey kills random instances on purpose. The discipline is hypothesis-driven: predict "if Redis dies, the limiter fails open and latency rises under 50ms," inject the fault on a small blast radius, measure, and fix the surprises. The point is not breaking things. It is discovering your hidden assumptions before a real incident does.

## Common misconceptions

- **"My fixed-window limiter enforces 100 per minute."** It actually allows up to 200 at the boundary. Use a sliding window counter if the number is a real guarantee.
- **"Adding retries makes my system more resilient."** Retries without jitter and a budget create a synchronized wave that is *worse* than no retry at all.
- **"An unbounded queue gives me backpressure."** It gives you deferred out-of-memory plus unbounded latency. A bounded queue is backpressure.
- **"More aggressive health checks catch problems faster."** Health checks that are too strict eject nodes during a transient blip, which means fewer nodes, more load, and more ejections, a cascade you built yourself. Make them tolerant and distinguish "degraded" from "dead."
- **"A circuit breaker should trip the moment something fails."** Tripping on a single failure or a tiny sample turns a hiccup into an outage. Require a minimum request volume in the window.

## How to use this

Start small and work outward:

1. **Audit every outbound call for an explicit timeout** set from its latency distribution. This one change prevents the most common outage cause.
2. **Add idempotency keys to every non-idempotent write** before you add retries anywhere near it.
3. **Add retries with exponential backoff and jitter at exactly one layer**, with a retry budget capping them to a small fraction of traffic.
4. **Wrap each external dependency in a circuit breaker** with a sensible threshold and cooldown, never tripping on a single failure.
5. **Give flaky or non-critical dependencies their own resource pool** so they cannot starve the core path.
6. **Define a fallback and a fail-open/fail-closed decision for every dependency**, and document it before the incident, not during it.
7. **Replace any unbounded queue with a bounded one** that applies backpressure or sheds.
8. **Pick the sliding window counter for general API rate limiting**, key it by tenant and endpoint, and return clear 429s.
9. **Run a chaos experiment** to prove your breakers and fallbacks actually fire.

### A real pairing: Stripe and Netflix

Two famous engineering stories cover almost this entire toolkit between them.

**Stripe** runs a payments API where one customer's runaway retry loop could flood the system. Their limiter is a **token bucket in Redis with a Lua script**, exactly the centralized-store-with-atomic-operation design. They key it by *merchant plus endpoint class*, so a noisy merchant exhausts *their own* bucket rather than the shared backend, which means the limiter doubles as a bulkhead. And because a retried charge is dangerous, they pair all of it with idempotency keys. Their accepted trade-off: a real Redis round-trip and single point of failure on every call, in exchange for exact, fleet-wide limiting, because for payments, over-admitting is worse than a sub-millisecond delay.

**Netflix** fanned out each device request to dozens of backend services. At that scale, even 99.99% per-dependency availability across 30 dependencies means millions of touched failures a day. Hystrix wrapped *every* outbound call in a timeout, a circuit breaker, a bulkhead (its own small thread pool), and a fallback. A slow recommendations service exhausted only its own threads and fell back to a generic non-personalized list, so the page still rendered. Their accepted trade-off: degraded personalization and the overhead of many thread pools, in exchange for never being fully down. The lesson that generalizes: wrap *dependencies*, not requests, so resilience is the default rather than something each engineer must remember.

## Conclusion

If you take one thing away, take this: **resilience is not about preventing failures, it is about controlling their blast radius.** A 100-millisecond slowdown should stay a 100-millisecond slowdown, not snowball into an outage. Timeouts, circuit breakers, bulkheads, and load shedding all exist to break the feedback loop before it becomes fatal.

But there is a quiet trap hiding in all of this. Every one of these patterns adds a decision, fail open or fail closed, allow all or block all, and the most painful outages come not from picking the wrong answer but from discovering, mid-incident, that nobody picked one at all. So the real next question is the harder one: when your safety net itself fails, which way does it fall? That is where [consistency-versus-availability trade-offs](/blog/system-design/09-cap-pacelc-consistency-models) come in, and it is worth thinking through long before the pager goes off.
