---
title: "Back-of-the-Envelope Estimation: Size Any System Fast"
metaTitle: "Back-of-the-Envelope Estimation Guide"
description: "Learn back-of-the-envelope estimation to size any system for millions of users in ten minutes. QPS, storage, Little's Law, and percentiles, explained simply."
keywords:
  - back of the envelope estimation
  - system design estimation
  - capacity planning
  - how to estimate QPS
  - latency numbers every programmer should know
  - Little's Law
  - p99 latency
  - tail latency
  - read write ratio
  - system design interview
  - how many servers do I need
  - powers of two data sizes
  - peak QPS calculation
  - sizing a database
topic: system-design
topicTitle: System Design
category: Engineering
date: '2026-06-15'
order: 1
icon: "\U0001F3D7️"
author: Pritesh Yadav (priteshyadav444)
transformed: true
polished: true
sources:
  - https://en.wikipedia.org/wiki/Little%27s_law
  - https://en.wikipedia.org/wiki/Tail_latency
faq:
  - q: What is back-of-the-envelope estimation in system design?
    a: It is rough math you do before building anything to check whether a design can handle the load. The goal is order-of-magnitude correctness, not precision. If the real answer is 8,000 requests per second and you estimate 10,000, you are right enough to make good design decisions.
  - q: How do you calculate QPS from a number of users?
    a: Multiply daily active users by actions per user per day to get total daily actions, then divide by about 100,000 (seconds in a day) to get average QPS. Multiply by a peak factor of 2 to 10 to get peak QPS, which is the number you design for.
  - q: Why should you never trust average latency?
    a: The average is dragged around by outliers and describes no real user. One slow request among many can make the mean look terrible or hide a real problem. Use percentiles like p50, p95, and p99 instead, because they describe actual user experiences.
  - q: What is Little's Law and why does it matter?
    a: Little's Law says the number of items in a system equals the arrival rate times the average time each item spends inside. It links throughput and latency, and it is how you size thread pools and connection pools without guessing.
  - q: What is tail latency amplification?
    a: When one request fans out to many backends and waits for all of them, the rare slow response from any single backend becomes the common case for the whole request. Fan out to 100 backends each with a 1 percent slow chance, and about 63 percent of requests hit a slow path.
  - q: How many servers do I need for a million users?
    a: There is no fixed answer, but the method is the same every time. Estimate peak QPS, divide by what one server handles (roughly 1,000 to 10,000 QPS), then add headroom for redundancy. The hard part is honest assumptions, not the arithmetic.
---

A senior engineer once sized an entire social network for ten million users on a napkin in under ten minutes, then defended every single number when challenged. No laptop, no spreadsheet, no benchmarks.

That is not a magic trick. It is a skill built from three things you can memorize and a handful of mental models. Once you have them, you can look at almost any system and say, with confidence, what will break first and why.

This is where that skill starts.

## Why this matters

System design is not won by naming technologies. Anyone can say "we'll use Kafka and Redis." What separates an engineer from a name-dropper is being able to say something like this:

*"This needs about 12,000 writes per second and 250 GB of new data per day. A single Postgres box tops out near 5,000 to 10,000 writes per second, so we need sharding or a write buffer."*

That sentence is three estimates and one threshold. Everything downstream, every cache, shard, queue, and replica, is justified by numbers like these. If you cannot produce the numbers, you are guessing.

And the good news: you do not need precision. You need to stay within one power of ten. If the true answer is 8,000 and you say 10,000, you designed the right system. If you say 100 or 1,000,000, you designed the wrong one. That is the whole game.

## The three things you actually memorize

Everything in estimation comes down to three inputs and a lot of multiplication.

1. **Latency numbers** - how long operations take.
2. **Powers of two** - how data sizes relate.
3. **A few system thresholds** - what one machine can do.

Let's take them one at a time.

### Latency numbers, made human

Computers operate on timescales our brains cannot feel. So multiply everything by one billion, which turns nanoseconds into seconds you can imagine.

| Operation | Real latency | If you scaled it up ×1 billion |
|---|---|---|
| Read from L1 cache | 0.5 ns | half a second, a heartbeat |
| Read from main memory (RAM) | 100 ns | about 2 minutes |
| Send 1 KB over the network | 10 µs | about 3 hours |
| SSD random read | ~100 µs | about 1.5 days |
| Round trip inside a datacenter | 0.5 ms | about 6 days |
| Spinning disk seek | 10 ms | about 4 months |
| Packet from California to Europe and back | 150 ms | about 5 years |

The exact numbers drift as hardware improves. The **ratios are what matter**, and they barely change. Five rules fall straight out of this table:

- **RAM is roughly 100× faster than an SSD, and an SSD is roughly 100× faster than a disk seek.** Two orders of magnitude each. This single fact is the entire justification for caching: keep hot data in memory and you skip a brutal penalty.
- **One network round trip inside a datacenter costs about 5,000 memory accesses.** Network calls are expensive. This is why making 100 small database queries instead of one (the classic "N+1" problem) quietly turns a 1-millisecond job into a 50-millisecond one.
- **Reading data in order is about 100× faster than jumping around randomly**, on both SSD and disk. Databases, logs, and batch jobs are all designed to turn random access into sequential access.
- **Crossing a continent takes about 150 milliseconds, and that is physics.** Light in fiber covers roughly 200,000 km per second, so a 12,000 km path is about 60 ms one way before anything even processes it. No budget makes a single trip to another continent faster. The only fix is moving the data closer.
- **Compression is cheap compared to sending bytes.** It takes about 3 microseconds to compress 1 KB but 10 microseconds to send it. When bandwidth is the bottleneck, compress first.

### Powers of two, the lazy way

Computers count in powers of two; humans count in powers of ten. The trick is to pretend they are the same and round.

Treat **2^10 (1,024) as roughly 1,000**. Then each step up the ladder is just ×1,000:

- Kilobyte → Megabyte → Gigabyte → Terabyte → Petabyte, each one a thousand times bigger.

To go from "bytes per item" to a grand total, you mostly just count zeros. Two more numbers are worth burning into memory:

- **2^32 is about 4.3 billion.** That is the entire IPv4 address space, and the moment a 32-bit counter overflows. (War story: many systems have died at *2.1 billion* because a *signed* 32-bit ID ran out at 2^31. Use 64-bit IDs from day one.)
- **A day has about 86,400 seconds**, which we round to **100,000**. So to turn "per day" into "per second," divide by 100,000. That gives you the single most useful shortcut in all of estimation: **1 billion events per day is about 12,000 per second.**

A few object sizes round out your toolkit: a short text post is 200 to 300 bytes, a UUID is 16 bytes, a photo thumbnail is 10 to 50 KB, a full photo is 1 to 5 MB.

## QPS: the heartbeat of capacity planning

**QPS** means queries (or requests) per second. Almost every estimate starts here, and the derivation is always the same:

```
Daily Active Users
  × actions per user per day     = total daily actions
  ÷ 100,000 (seconds per day)    = AVERAGE QPS
  × peak factor (2× to 10×)      = PEAK QPS   ← design for THIS
```

The most important word there is **peak**. Traffic is bursty: lunch-hour spikes, time zones overlapping, a product launch, a post going viral. For a steady consumer app, peak is roughly 2 to 3× the average. For spiky, event-driven apps it can be 10×. **Always design for peak, never average.** A system sized for the average falls over the first time real life shows up.

### The read/write ratio decides your architecture

Before you choose a single technology, ask one question: for every write, how many reads happen? The answer shapes everything.

| System | Reads per write | What it forces |
|---|---|---|
| Social feed | 100:1 to 1000:1 | Heavy caching, read replicas, precomputed feeds |
| Product catalog | 10:1 to 100:1 | CDN and cache the pages; the database handles writes fine |
| Analytics ingestion | 1:100 (write-heavy) | Append-only logs, batching, columnar storage |
| Chat / messaging | about 1:1 | Real tradeoff between doing work on write vs. on read |

A **read-heavy** system (most consumer apps) is *cacheable*. Your main lever is caching and replication. A **write-heavy** system cannot be cached away; you have to scale the write path itself with sharding and batching. Knowing the ratio in the first minute tells you which lever to pull.

## The four resources, and which one breaks first

Every machine has exactly four finite resources. Good capacity planning asks one blunt question: *which one runs out first?*

- **CPU** - runs out on encryption, compression, image and video processing, ML inference.
- **Memory** - runs out on large caches, in-memory datasets, big per-connection buffers.
- **Disk** - runs out on space, or on IOPS (operations per second), or on throughput; databases and logging live here.
- **Network** - runs out when you serve lots of bytes: media, replication, big payloads.

The discipline is to estimate demand on all four and find the **binding constraint**, the one that saturates first.

A video service is network and disk bound; its CPU sits nearly idle. A password-hashing service is CPU bound. A Redis cache is memory bound. A logging pipeline is disk bound.

The classic, expensive mistake is scaling the wrong dimension. Adding CPU cores to a network-bound box does literally nothing for throughput. Find the bottleneck first, then scale only that.

```
   CPU  ████░░░░░░  40%
   MEM  ██████░░░░  60%
   DISK ████████░░  80%   ← this is the wall: scale disk or shard
   NET  ███░░░░░░░  30%
```

## Little's Law: the one equation to memorize

There is exactly one formula worth carrying everywhere:

> **L = λ × W**
> items in the system = arrival rate × average time each item stays

It holds for any stable system, no matter the details: queues, thread pools, connection pools, a whole service. It is the bridge between throughput and latency.

**A concrete example.** Your API handles **2,000 requests per second**. Each request spends an average of **50 milliseconds** (0.05 seconds) inside, mostly waiting on the database.

```
L = 2,000 × 0.05 = 100 requests in flight at any instant
```

So you need a database connection pool of about 100, plus headroom. Provision only 30 and the other 70 requests queue up, latency climbs, timeouts fire, and the system cascades into failure.

**Run it backwards** to find your ceiling. If you can only afford a pool of 50 connections and each request still takes 50 ms, then your maximum throughput is 50 ÷ 0.05 = **1,000 requests per second**. Past that, something has to give: more connections, faster queries, or shedding load.

This is why a small latency regression is so dangerous. If each request slows from 50 ms to 100 ms at the same arrival rate, the number in flight doubles from 100 to 200, and you may silently exhaust the pool. **Latency and concurrency are coupled.**

## Why averages lie, and percentiles tell the truth

This may be the single most important reliability idea here: **never trust average latency.**

Picture ten requests, with these times in milliseconds: nine of them at 10 ms, and one at 1,000 ms.

- The **average** is 109 ms, which looks vaguely concerning but describes no one.
- The **median (p50)** is 10 ms. The typical user is perfectly happy.
- The **worst case** is 1,000 ms. One user waited a full second.

The mean got dragged around by a single outlier and told you about no actual person. Percentiles describe real experiences:

- **p50** - half of requests are faster. The typical experience.
- **p95** - 1 in 20 is slower. Power users notice.
- **p99** - 1 in 100 is slower. The standard SLA target for serious services.
- **p999** - 1 in 1,000 is slower. Your biggest customers hit this constantly.

Here is the counterintuitive part: **your best customers live on the tail.** The users who make the most requests are statistically the most likely to hit the slow ones. Amazon famously found that 100 ms of extra latency cost about 1 percent in sales, which is why they optimize p999, not the average.

Two operational rules follow. State your goals in percentiles ("p99 under 200 ms"), never averages. And you **cannot average percentiles across servers**; the p99 of two boxes is not the average of their two p99s. Aggregate the raw data instead.

## Tail latency amplification: the trap that catches seniors

Here is the one that surprises experienced engineers. When a request **fans out** to many backends in parallel and has to wait for *all* of them, the rare slow tail of each backend becomes the *common case* for the whole request.

Suppose one backend is slow just 1 percent of the time. Fan out to **100 backends** and wait for the last one to finish. The chance that *at least one* is slow is:

```
1 − (0.99)^100 ≈ 0.63
```

**About 63 percent of your user-facing requests now take the slow path.** What was a 1-in-100 problem for a single backend became the majority experience for the whole system. This is *tail latency amplification*, documented in Google's paper "The Tail at Scale."

It is why a mesh of microservices with deep call graphs can have terrible p99 even when every single service looks fast on its own dashboard. Nobody owns the end-to-end number, so nobody sees it until users complain.

The real fixes used in production:

- **Hedged requests** - after a short delay, send a duplicate to a second replica and take whichever returns first. Cuts the tail dramatically for about 5 percent extra load.
- **Reduce the fan-out width** - talk to fewer, larger shards.
- **Tighten each backend's own tail** - the only durable fix is making per-backend p99 smaller.

## Common misconceptions

- **"Design for the average load."** No. Average is the load you will almost never actually see. A team sizes for 230 writes per second, a launch in one time zone drives a 15× spike, and the database falls over. Carry a peak factor.
- **"Our dashboard shows 40 ms average, so we're fine."** Meanwhile 1 percent of requests take 4 seconds, and your biggest customer complains every day. The average hid the pain. Track p99 and p999.
- **"Cross-region latency is a performance bug we can optimize."** It is the speed of light. You cannot code your way under ~150 ms across a continent. The only fix is a regional replica or an edge cache.
- **"Raw data size is my storage estimate."** Reality is your napkin number times about 3 for replication, times about 2 for indexes and metadata, so roughly 6× more. Forget this and you are off by an order of magnitude.
- **"A 32-bit ID is plenty."** A signed 32-bit auto-increment counter silently caps at about 2.1 billion. High-volume tables hit it and inserts start failing in production with cryptic errors. Use 64-bit IDs, or UUIDs, from the start.

## How to size a system: the repeatable method

Run this checklist every time, in order. The magic is that a reviewer can challenge an assumption but never your arithmetic.

1. **State your assumptions out loud.** Daily active users, actions per user per day, peak factor, read/write ratio, average object size, retention period. Write them down.
2. **Compute QPS**, average then peak. Split it into read QPS and write QPS using the ratio.
3. **Compute storage** per day and per year: writes per day × bytes per object × retention. Then multiply by 3 for replication and about 2 for index overhead.
4. **Compute bandwidth**: QPS × payload size, separately for incoming and outgoing. Outgoing (egress) is usually the cost and the bottleneck.
5. **Pick the binding resource** for each service using the four resources above.
6. **Divide demand by what one box handles** to get a server count, then add headroom.
7. **Sanity-check and round** to a clean power of ten.

Keep these single-box thresholds in your back pocket:

- Web/app server: roughly **1,000 to 10,000 QPS**, depending on the work per request.
- One Postgres or MySQL primary: about **5,000 to 10,000 writes per second** (more reads with replicas).
- One Redis instance: **100,000+ operations per second** in memory.
- A 1 Gbps network card: about **125 MB per second**; a 10 Gbps card about 1.25 GB/s.

## Watch it work: ten million users in ten minutes

Let's size a Twitter-like feed service. **Assumptions, stated:** 10 million daily users; each posts twice a day and reads their feed 20 times a day; an average post is 300 bytes of text, with 10 percent including a 200 KB image; peak is 3× average; keep posts 5 years with 3× replication.

**Write QPS.** 10M users × 2 posts = 20M posts/day. Divide by 100,000 ≈ 230 writes/sec average, × 3 ≈ **700 writes/sec peak**. That fits comfortably inside a single Postgres primary. *No write sharding needed yet* - a real, money-saving conclusion.

**Read QPS.** 10M × 20 = 200M reads/day. Divide by 100,000 ≈ 2,300/sec, × 3 ≈ **7,000 reads/sec peak**. That exceeds one primary's comfort zone, so you need a Redis cache plus read replicas. At a 90 percent cache hit rate, only about 700 reads/sec actually reach the database. The read/write ratio predicted this exact lever.

**Storage.** Text is 20M × 300 bytes ≈ 6 GB/day. Images are 20M × 10% × 200 KB ≈ 400 GB/day. Images dominate text by about 70×. Over 5 years with 3× replication that is roughly **2.25 PB**, almost entirely images. Conclusion: text goes in Postgres, but **media belongs in object storage (like S3) plus a CDN**, not the database. The sizing surfaced the architecture by itself.

**Bandwidth.** A feed read returns about 20 posts, roughly 50 KB of text and thumbnails. 7,000 reads/sec × 50 KB ≈ 350 MB/sec, about **2.8 Gbps** at peak. That overwhelms a single 1 Gbps network card, which is the textbook case for a CDN to absorb media at the edge.

**Servers.** Total peak is about 700 + 7,000 ≈ 7,700 QPS. At 2,000 QPS per app server that is 4 servers, doubled for redundancy ≈ **8 app servers**.

**The one-paragraph answer you would actually give:** *"About 700 writes and 7,000 reads per second at peak. Writes fit one Postgres primary; reads need Redis at a 90 percent hit rate plus read replicas. Around 2.25 PB over five years, dominated by images, so media goes to S3 plus a CDN and metadata stays in Postgres. Egress near 2.8 Gbps makes a CDN mandatory. About 8 app servers with headroom. No sharding needed at 10 million users; revisit near 100 million."*

That is a complete, defensible capacity plan from five assumptions and a calculator.

## A real case study: how Twitter survived its own timeline

Twitter is the cleanest illustration of why the read/write ratio comes first. By the early 2010s it served around 150 million daily users posting 300 to 400 million tweets a day, roughly 5,000 to 6,000 tweets per second on average, with spikes to about 150,000 per second during live events.

But writes were never the problem. **Reads were the wall.** Home timelines were requested on the order of hundreds of thousands of times per second, a read/write ratio in the hundreds-to-one. The naive approach, "on every timeline load, fetch the tweets of everyone you follow, merge, and sort," is a fan-out on *read*. For someone following 1,000 accounts, that is a 1,000-way scatter-gather, hundreds of thousands of times a second. That is exactly the tail amplification trap.

Twitter's fix was to **fan out on write** instead. When you tweet, the system pushes that tweet's ID into a precomputed home-timeline list (held in Redis) for every one of your followers, right then. A read becomes a single, cheap lookup of an already-built list.

The tradeoff is explicit. With a few hundred followers, one tweet triggers a few hundred small cache writes, but it converts a hundreds-of-thousands-QPS expensive read into a hundreds-of-thousands-QPS cheap read, while the costly fan-out happens at the far lower write rate. You move work from the hot path to the cold path, precisely because reads are about 100× more frequent. Tweet IDs are only 8 to 16 bytes, so even an 800-entry timeline is a few kilobytes, and Redis serves over 100,000 operations per second, which is why an in-memory tier was mandatory.

Then it broke. A celebrity with tens of millions of followers would trigger tens of millions of cache writes per tweet, stalling the delivery pipeline for everyone. So Twitter went **hybrid**: ordinary accounts fan out on write, a small set of huge accounts are excluded and merged in at read time. Most timelines stay pure cache reads; the few that follow celebrities pay a small merge. That is "reduce the fan-out width" applied at the data-model level.

What they gave up was real and worth naming: write simplicity, a lot of RAM for duplicated timelines, and strong consistency (your followers see a tweet over a span of seconds, not instantly). For a social feed that is fine. For a bank ledger it would be unacceptable. The lesson: **fan-out is a cost you can move, not erase**, and you should always say out loud what you are trading away.

## Test yourself

Try these on a napkin, no calculator.

1. A service gets 500 million requests/day. Average QPS, and a reasonable peak? *(÷100,000 for average, ×2–3 for peak.)*
2. A thread pool has 200 threads and each request takes 100 ms. Maximum sustainable throughput? *(Little's Law backwards: λ = L ÷ W.)*
3. One backend is slow 0.1 percent of the time. You fan out to 200 and wait for all. Roughly what fraction hit the slow path? *(1 − 0.999^200.)*
4. Why can a service with a 40 ms *mean* latency still be a serious reliability problem?

*Answers: (1) about 5,000 average, 10,000 to 15,000 peak. (2) 200 ÷ 0.1 = 2,000 requests/sec. (3) about 18 percent. (4) The mean hides the tail; heavy users hit p99/p999 constantly, so goals must be percentile-based.*

## Conclusion

If you remember one thing, remember this: **estimation is about staying within one power of ten, not about being exact.** Three memorized numbers, one equation, and an honest list of assumptions let you size a system for tens of millions of users before you write a line of code, and defend every figure.

The numbers told you something quietly profound along the way. They did not just count servers, they *chose the architecture*. The read/write ratio demanded a cache. The storage math demanded object storage. The bandwidth demanded a CDN. Good estimates do not follow your design; they reveal it.

So here is the thread to pull next. Every estimate above eventually runs into a wall, the moment one box is not enough. What do you actually do when you cross that threshold? That is the difference between scaling *up* and scaling *out*, and it is where system design gets genuinely interesting.
