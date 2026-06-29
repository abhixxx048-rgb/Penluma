---
title: "System Design Trade-offs: How to Reason About Any System"
metaTitle: "System Design Trade-offs Explained"
description: "Learn the repeatable system design process: back-of-envelope estimates, the five universal trade-offs, idempotency, and how to reason about any system."
keywords:
  - system design trade-offs
  - back of envelope estimation
  - system design process
  - CAP theorem explained
  - idempotency key
  - exponential backoff jitter
  - latency numbers every programmer should know
  - read heavy vs write heavy
  - SLI SLO SLA error budget
  - URL shortener system design
  - graceful degradation
  - p99 latency percentiles
  - observability three pillars
  - how to design a system interview
faq:
  - q: What is the most important skill in system design?
    a: Making trade-offs explicit and matching them to requirements. There is rarely one "right" design — only choices you can defend out loud against the scale, consistency, and failure needs of the problem.
  - q: What is a back-of-envelope estimate?
    a: Quick, rough math for traffic, storage, and bandwidth that you could do on the back of an envelope. The goal is the right order of magnitude — is it 10 servers or 1,000 — not a precise number.
  - q: What does idempotent mean and why does it matter?
    a: An operation is idempotent if doing it twice has the same effect as doing it once. It matters because network retries can fire a request again, and idempotency keys stop a retried "charge the card" from charging twice.
  - q: Why add jitter to retry backoff?
    a: Without jitter, thousands of clients that failed at the same instant retry at the exact same moment and crash the recovering server again — the thundering herd. Jitter adds a small random delay so retries spread out.
  - q: What is the difference between SLI, SLO, and SLA?
    a: An SLI is the measured number (e.g. percent of requests under 200 ms). An SLO is your internal target for it. An SLA is a contractual promise to customers with penalties if you miss it, usually set looser than the SLO.
  - q: Should I look at average or p99 latency?
    a: Watch percentiles like p99, never the average. The average hides the slow tail; p99 = 800 ms means the slowest 1 percent of requests are worse than 800 ms, and those are real users having a bad time.
author: Pritesh Yadav
transformed: true
topic: systems-fundamentals
topicTitle: Systems Fundamentals
category: Engineering
date: '2026-06-21'
order: 10
icon: ⚙️
sources: []
---

Two people click "Buy" on the last item in stock at the very same millisecond. A payment gateway times out *after* it already charged the card. A burst of traffic at lunchtime is ten times the calm-morning average. None of these are exotic edge cases — they are Tuesday. And the difference between an engineer who freezes and one who stays calm is not memorizing famous architectures. It is owning a **repeatable thinking process**.

This is the capstone. You have learned five separate building blocks — databases (where data lives), caching (copies kept close by for speed), networking (how machines talk), concurrency (doing many things at once safely), and distribution (spreading work across machines). Real systems pull all five at once, like levers on a control panel. Here is how to pull them on purpose.

## Why this matters

You will never be handed a system you have seen before. Interviews invent fresh prompts. Your job hands you a service nobody fully understands. Production breaks in a way no runbook covers.

Memorization fails you in all three. A process does not.

Learn one repeatable way to reason — estimate the scale, find the bottleneck, name the trade-off, plan for failure — and you can walk into *any* system and say something useful within minutes. That is a career skill, not a trivia skill. The single biggest mindset shift: **system design is not about knowing the right answer. It is about making trade-offs explicit and matching them to the requirements.** State your assumptions out loud and defend your choices.

## The seven-step design process

Follow these in order, every single time. The order is the point — most bad designs come from skipping ahead.

1. **Clarify functional requirements** — what must it *do*? (Example: turn a long web address into a short code, and redirect the short code back to the original.)
2. **Clarify non-functional requirements** — how *well* must it do it? Scale (how many users), latency (how fast), availability (how often it is up), consistency (how fresh the data must be), and durability (will we lose data).
3. **Back-of-envelope estimate** — rough math for queries per second, storage, and bandwidth. This tells you whether one computer is enough or you need many.
4. **Define the API and data model** — the contract. What the client sends, what comes back, and how data is stored.
5. **Sketch the high-level design** — boxes and arrows: client → load balancer → app servers → cache → database, plus background workers.
6. **Find the bottleneck and scale it** — the slowest, most overloaded part. Usually it is the database or the hot reads.
7. **Harden for reliability** — redundancy, graceful degradation, idempotency, monitoring.

**Best practice:** state your assumptions and round aggressively. You want the right *order of magnitude*, not a precise number.

**The classic mistake:** jumping straight to a complex distributed design before clarifying requirements and estimating scale. That is over-engineering — building for millions of users you do not have. A single PostgreSQL database handles far more than beginners expect.

## Back-of-envelope estimation: the cheat sheet

"Back-of-envelope" means quick rough math you could scribble on an envelope. Memorize this handful of facts and you can estimate almost anything.

- **Seconds in a day ≈ 86,400 ≈ 10⁵** (one hundred thousand). So **1 million per day ≈ ~12 per second** on average. Flip it: 1 request/second ≈ ~2.5 million/month.
- **Peak ≈ 2–10× the average.** Traffic is bursty — everyone shops at lunchtime. Always state your peak multiplier.
- **Bandwidth** = average payload size in bytes × queries per second. (Multiply by 8 for bits per second if you want to quote Mbps.)
- **Storage** = records per day × bytes per record × how many days you keep it × replication factor (how many copies you store).
- **Power-of-two sizes:** 2¹⁰ ≈ 1 KB, 2²⁰ ≈ 1 MB, 2³⁰ ≈ 1 GB, 2⁴⁰ ≈ 1 TB. One ASCII character = 1 byte; a UUID = 16 bytes.
- **Rough single-node ceilings** (sanity bounds, not gospel): a relational database does ~10,000 writes/second and tens of thousands of reads/second per machine; Redis, an in-memory cache, does 100,000+ operations/second.

> **QPS** just means "queries per second" — the number of requests hitting the system each second.

## Worked example A: a URL shortener (read-heavy)

A URL shortener takes a long web address and hands back a short code, like the ones in text messages. Click the code and it redirects you to the original.

**Requirements:** create a short code from a long URL; redirect a short code back. Assume ~100 million new URLs per day, and links must work for years.

**Estimation:**

- **Writes:** 100,000,000 ÷ 86,400 ≈ **~1,160 writes/second average.** With a ~10× peak, call it ~10,000/second.
- **Reads:** the read-to-write ratio is roughly **100:1** — each link is created once but clicked many times. So ~116,000 reads/second average, much higher at peak.
- **Storage:** ~500 bytes per record × 100M/day × 365 days × 5 years ≈ **~90 TB over five years.**
- **Short code length:** 7 characters in Base62 (the 62 URL-safe characters: a–z, A–Z, 0–9) gives 62⁷ ≈ **3.5 trillion** codes — decades of headroom. We use Base62, not Base64, because Base64 includes `+` and `/`, which have special meaning inside URLs.

**The design insight:** with 100 reads for every write, **the cache *is* the system.** Generate a unique ID (from a global counter or a Snowflake-style 64-bit ID), Base62-encode it into the short code, and store `code → long_url`. The redirect is just a primary-key lookup, so cache it hard — a CDN (edge servers near users) plus Redis in front of the database.

**A real trade-off to surface, not hide:** a `301` redirect ("moved permanently") lets the browser cache the destination, so repeat clicks never touch your servers — wonderful for load, but you lose click analytics. A `302` ("found / temporary") keeps every click hitting you so you can count it — but you carry all the load. Analytics versus load. There is no free answer; there is only the choice you can defend.

## Worked example B: e-commerce checkout (write-heavy, money on the line)

Browsing a catalog is read-heavy — cache it and move on. **Checkout is the hard part,** because real money, inventory, and outside services are all involved. Every earlier topic shows up here with teeth.

- **Concurrency — the "last item in stock" race:** two buyers hit "Buy" for the final unit at the same moment. Without protection, both succeed and you oversell. The fix is a database transaction with row locking (`SELECT ... FOR UPDATE`, which reserves the row so the second buyer waits) or an atomic decrement — a single uninterruptible "subtract one." This is the classic *lost update* problem made concrete.
- **Consistency, per piece:** inventory and payment need **strong consistency** — never oversell, never double-charge. But the product's review count can be **eventually consistent** — a few seconds stale is fine. Different parts of *one* system sit at different points on the spectrum. That is the key insight.
- **External calls and retries:** the payment gateway might time out *after* it already charged the card. The client retries and — without protection — charges twice. This is exactly why idempotency keys exist (more below).
- **Async work:** the confirmation email, invoice PDF, and warehouse notification go on a **queue** (a waiting line of jobs handled by background workers), not on the request path. Checkout stays fast and survives a downstream outage.

A rough shape of the whole thing:

```
        ┌── CDN (static files, images)
Client ─┤
        └─ LB ─ App servers ─ Cache (Redis) ─ DB (primary + replicas)
                     │
                     └─ Queue ─ Workers (email, PDF, inventory sync)

  LB = load balancer (spreads requests across app servers)
```

**The mistake to avoid:** putting slow or external work (emails, PDFs, third-party calls) on the synchronous request path. It inflates the time the user waits and ties your uptime to someone else's service. Push it to a queue.

## Latency numbers every programmer should know

Latency means "how long one thing takes." These rounded numbers (the classic Jeff Dean / Peter Norvig table) quietly drive almost every design decision:

| Operation | Rough time |
|---|---|
| L1 CPU cache reference | ~0.5 ns |
| Main memory (RAM) reference | ~100 ns |
| Read 4 KB randomly from SSD | ~150 µs |
| Round trip inside one datacenter | ~0.5 ms |
| Hard-disk (HDD) seek | ~10 ms |
| Round trip California ↔ Netherlands | ~150 ms |

**The mental model:** memory is roughly **100× faster** than SSD, which is roughly **100,000× faster** than a cross-continent network round trip. That is *why* we cache in memory and *why* we avoid chatty cross-region calls.

To feel it in your body, scale everything up so reading from L1 cache takes **1 second**. Then reading from RAM takes ~3.5 minutes. Reading from SSD takes ~3.5 days. And a cross-continent round trip? **~9.5 years.** When data lives far away, you are not waiting — you are aging. That is why locality and caching dominate design.

## The five universal trade-offs

This is the heart of it. Almost every design decision is one of these tugs-of-war. Learn to *name* the one you are facing, and you will sound like someone who has done this before.

| Trade-off | What pulls each way |
|---|---|
| **Latency vs. throughput** | Latency = time for one request. Throughput = requests handled per second. Batching items raises throughput but makes each item wait longer. Optimize one and you can hurt the other. |
| **Consistency vs. availability (CAP)** | When the network partitions (machines can't reach each other), you must choose: refuse possibly-wrong data (CP), or stay up and reconcile later (AP). Modern systems tune this *per operation*. **PACELC** adds: even with no partition, you trade latency vs. consistency. |
| **Cost vs. performance** | More replicas, RAM, and regions buy speed and uptime — but cost money. Going from 99.9% to 99.99% uptime can cost roughly 10× the infrastructure. |
| **Simplicity vs. flexibility** | A monolith with one Postgres is easy to reason about. Microservices with many data stores scale teams but add operational and consistency complexity. Do not distribute prematurely. |
| **Read-heavy vs. write-heavy** | Read-heavy → replicas, caches, denormalize, CDN. Write-heavy → sharding, write-optimized stores (LSM-tree databases), queue-and-batch. |

## Common misconceptions

**"CAP means I pick CP or AP for the whole system."** Reality: real systems tune consistency *per operation*. Payment is strong; review count is eventual — in the same app. And PACELC reminds you that you trade latency against consistency even when nothing is broken.

**"Average latency is a good health metric."** Reality: the average hides the tail. **Watch percentiles instead.** "p99 = 800 ms" means 99% of requests are faster than 800 ms and the slowest 1% are worse — and that slow 1% is real users having a bad time.

**"More nines is always better."** Reality: each extra nine roughly costs 10× more. Most products do not need five nines. Pick the level your business actually needs.

**"Redundancy means I'm safe."** Reality: redundancy only helps if failover is *automatic and tested*. An untested standby gives false confidence — and the load balancer, the cache, and the database can each *themselves* be a single point of failure.

**"Retrying a failed request is harmless."** Reality: retrying without an idempotency key creates duplicate charges, and retrying a `400` or `401` will never succeed — it just wastes effort. Only retry *transient* failures.

## How to make it survive failure

### Redundancy — no single point of failure

A "single point of failure" is one part whose death takes down everything. Avoid it: run multiple app servers behind a load balancer, keep database replicas with failover, and spread across availability zones or regions. But again — **untested failover is not failover.** Test it.

### Graceful degradation

Under heavy stress, drop non-essential features instead of collapsing entirely. Serve a slightly stale cached page, hide recommendations, disable the review widget — but keep checkout working. A worse-but-working experience beats a blank error page. Design for the unhappy path: every data view needs a loading state, an empty state, and an error state, and the system needs a plan for "what happens when the payment gateway is down."

### Idempotency keys and safe retries

An operation is **idempotent** if doing it twice has the same effect as doing it once. To make "charge the card" idempotent, the *client* generates a unique **idempotency key** (a UUIDv4) per logical request and sends it along. The server stores `key → result`. If a retry arrives with the same key, the server returns the stored result instead of charging again. (Stripe keeps these keys for ~24 hours.)

Retries should use **exponential backoff with jitter**:

```
delay = min(cap, base × 2^attempt) + random_jitter
```

With base = 200 ms: attempt 1 waits ~200 ms, attempt 2 ~400 ms, attempt 3 ~800 ms — backing off so the struggling server gets breathing room. **Jitter** is a small random amount added to each delay. Without it, thousands of clients that failed at the same instant would all retry at the *exact same moment* and crash the recovering server again — the **thundering herd** problem. Jitter spreads them out. Cap the attempts (Stripe ≈ 3; others 6–8).

## How to know what your system is doing

### The three pillars of observability

Observability means understanding what your system is doing from the outside. It rests on three pillars:

- **Metrics** = numeric time-series (QPS, error rate, p99 latency, CPU). Cheap; perfect for dashboards and alerts. They tell you *what* is wrong.
- **Logs** = timestamped records of events, with rich detail. They tell you *why* it is wrong.
- **Traces** = the journey of one request across every service it touches, with timing at each hop. They tell you *where* it is slow or failing.

They work together: **metrics alert, traces localize, logs explain.** **OpenTelemetry (OTel)** is the vendor-neutral standard for emitting all three.

Picture a real 2 a.m. triage. A p99-latency *metric* alert fires. You open a *trace* of a slow request and see the slow hop is the payment service. You read that service's *logs* and find "connection pool exhausted." Three pillars, one root cause, minutes instead of hours.

### SLI, SLO, SLA, and error budgets

- **SLI** (Service Level Indicator) = the *measured* number, e.g. "% of requests served under 200 ms."
- **SLO** (Service Level Objective) = your internal *target* for that SLI, e.g. 99.9%.
- **SLA** (Service Level Agreement) = a *contractual* promise to customers, with penalties if you miss it. Usually set *looser* than the SLO, so you have a safety margin.
- **Error budget** = 100% − SLO = how much failure you are *allowed*. A 99.9% monthly SLO gives ~43 minutes. Spend it shipping faster and taking risks; when it runs out, freeze risky changes.

| Availability | Downtime per year | Per month |
|---|---|---|
| 99% | ~3.65 days | ~7.2 h |
| 99.9% ("three nines") | ~8.76 h | ~43 min |
| 99.99% ("four nines") | ~52 min | ~4.3 min |
| 99.999% ("five nines") | ~5 min | ~26 s |

## How to use this: eight questions for any system

This is the takeaway skill. When you face a system you have never seen — in an interview, a new job, or a 2 a.m. incident — ask these in order:

1. What does it **do**?
2. What is the **scale** (QPS, storage)?
3. What is the **read-to-write shape**?
4. Where is the **bottleneck**?
5. What does it **cache**, and what is the staleness/invalidation story?
6. What is the **consistency requirement** for each piece?
7. What happens when **X fails**?
8. How would you **know** it failed (metrics and alerts)?

Answer those eight and you can analyze anything. There is rarely one right design — only trade-offs made explicit and matched to requirements.

## Conclusion

If you remember one thing, remember this: **the senior move is not having the answer — it is naming the trade-off out loud and choosing on purpose.** Everyone can add a cache; the engineer who says "this buys us read speed but costs us freshness, and here is why that's the right call for *this* product" is the one people trust.

So the next time a system feels overwhelming, do not reach for a famous architecture. Reach for the eight questions. Estimate the scale, find the bottleneck, name the tug-of-war, and plan for the failure that *will* come.

And here is the thread worth pulling next: notice how often the answer to "how do we go faster?" was *keep a copy closer.* Caching looks simple until two copies disagree — and the moment you have a copy of the truth, you have signed up for the hardest question in distributed systems: when, exactly, do you tell it that the truth has changed?
