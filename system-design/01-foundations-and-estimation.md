# Foundations & Back-of-the-Envelope Estimation

**What you'll learn:** How to reason quantitatively about systems before you build them — the latency and data-size numbers that anchor every design decision, how to estimate QPS / storage / bandwidth from a user count, and the mental models (Little's Law, percentiles, tail amplification, the four golden resources) that separate a guess from an engineering estimate. By the end you can size a system for tens of millions of users on a whiteboard in ten minutes and defend every number.

**Prerequisites:** none — start here. This is module 01 of the curriculum.

---

## 1. Why estimation is the first skill

A system design interview, or a real capacity-planning meeting, is not won by naming technologies. It's won by being able to say: *"This needs ~12k writes/sec, ~250 GB/day of new data, and a single Postgres box tops out around 5–10k writes/sec — so we need sharding or a write buffer."* That sentence is three estimates and one threshold. Everything downstream (caching, sharding, queues, replication) is justified by numbers like these.

The goal of back-of-the-envelope (BOTE) math is **order-of-magnitude correctness**, not precision. If the real answer is 8,000 QPS and you say 10,000, you're right. If you say 100 or 1,000,000, you'll design the wrong system. Estimation is about staying within one power of ten.

There are exactly three inputs you ever need to memorize:
1. **Latency numbers** (how long operations take).
2. **Powers of two** (how data sizes relate).
3. **A few system thresholds** (what one box can do).

Everything else is multiplication.

---

## 2. Latency numbers every engineer should know

These are the canonical figures popularized by Jeff Dean ("Latency Numbers Every Programmer Should Know"). Memorize the *relative* magnitudes; the absolute values drift with hardware but the ratios are stable and that's what matters.

| Operation | Latency | Human-scale analogy (×1 billion) |
|---|---|---|
| L1 cache reference | 0.5 ns | 0.5 s — a heartbeat |
| Branch mispredict | 5 ns | 5 s |
| L2 cache reference | 7 ns | 7 s |
| Mutex lock/unlock | 25 ns | 25 s |
| Main memory (RAM) reference | 100 ns | ~2 min |
| Compress 1 KB (Snappy) | 3,000 ns (3 µs) | ~1 hr |
| Send 1 KB over 1 Gbps network | 10,000 ns (10 µs) | ~3 hr |
| Read 1 MB sequentially from RAM | 250,000 ns (250 µs) | ~3 days |
| SSD random read | 100,000–150,000 ns (~100 µs) | ~1.5 days |
| Round trip within same datacenter | 500,000 ns (0.5 ms) | ~6 days |
| Read 1 MB sequentially from SSD | ~1,000,000 ns (1 ms) | ~12 days |
| Rotational disk seek | 10,000,000 ns (10 ms) | ~4 months |
| Read 1 MB sequentially from spinning disk | ~20,000,000 ns (20 ms) | ~8 months |
| Send a packet CA → Netherlands → CA | 150,000,000 ns (150 ms) | ~5 years |

The "×1 billion" column turns nanoseconds into seconds so your intuition can grip them. It reveals the brutal truth of the **memory hierarchy**:

```
CPU register   ~0 ns   │ instant
L1 cache       0.5 ns  │ 1×
L2 cache       7 ns    │ 14×
RAM            100 ns  │ 200×
SSD random     100 µs  │ 200,000×
DC round trip  500 µs  │ 1,000,000×
Disk seek      10 ms   │ 20,000,000×
Cross-continent 150 ms │ 300,000,000×
```

### The five rules that fall out of this table

1. **RAM is ~100× faster than SSD, SSD is ~100× faster than disk seek.** Two orders of magnitude each. This is *the* justification for caching (module `06-caching-and-cdn.md`): keep hot data in RAM and you avoid a 1000× penalty.
2. **A datacenter round trip (0.5 ms) costs ~5,000 main-memory accesses.** Network calls are expensive. This is why the N+1 query problem (see your own CLAUDE.md) destroys performance — each round trip is thousands of in-memory operations.
3. **Sequential beats random by ~100×** on both SSD and disk. Databases, log-structured storage (Kafka, LSM-trees), and batch jobs are all designed to turn random I/O into sequential I/O.
4. **Cross-continent is ~150 ms, fixed by physics.** Light in fiber travels ~200,000 km/s; a 12,000 km path is ~60 ms one way before any processing. No amount of money makes a single round trip to another continent faster than ~tens of ms. The only fix is *moving the data closer* (CDN, regional replicas).
5. **Compression is cheap relative to network/disk.** 3 µs to compress 1 KB vs 10 µs to send it — compress before you transmit when bandwidth is the bottleneck.

---

## 3. Powers of two and data-size math

Computers count in powers of two, but humans (and BOTE math) count in powers of ten. The trick is to remember a few anchor points and round.

| Power | Exact | Approx (decimal) | Name | Mnemonic |
|---|---|---|---|---|
| 2^10 | 1,024 | ~1 thousand | Kilo (KB) | "a thousand" |
| 2^20 | 1,048,576 | ~1 million | Mega (MB) | "a million" |
| 2^30 | ~1.07 billion | ~1 billion | Giga (GB) | "a billion" |
| 2^32 | ~4.29 billion | ~4 billion | — | max unsigned 32-bit |
| 2^40 | ~1.10 trillion | ~1 trillion | Tera (TB) | "a trillion" |
| 2^50 | ~1.13 quadrillion | ~1 quadrillion | Peta (PB) | — |

**The working shortcut:** treat 2^10 ≈ 10^3. Then KB→MB→GB→TB→PB are each ×1000. To go from a per-item byte size to a total, just count zeros.

Two more numbers worth burning in:
- **2^32 ≈ 4.3 billion** — the IPv4 address space and the moment a 32-bit auto-increment ID overflows. (Real war story: many systems have died at 2.1 billion when a *signed* 32-bit ID hit 2^31.)
- **Seconds in useful windows:** 1 day ≈ **86,400 s** (round to **~10^5**), 1 month ≈ **2.6 million s** (~2.5×10^6), 1 year ≈ **31.5 million s** (~3×10^7). These convert "per day" into "per second" instantly.

> **Per-day → per-second:** divide by ~100,000. 1 billion events/day ÷ 10^5 ≈ **~11,500/sec average.** Memorize "1 billion/day ≈ 12k/sec."

Common per-object byte sizes for sizing:
- An ASCII char ≈ 1 byte; a UTF-8 emoji ≈ 4 bytes.
- A UUID ≈ 16 bytes binary, 36 bytes as text.
- A tweet/short post ≈ 200–300 bytes of text.
- A typical metadata row (a few columns) ≈ 100–1,000 bytes.
- A JPEG thumbnail ≈ 10–50 KB; a full photo ≈ 1–5 MB; a minute of 1080p video ≈ ~50–100 MB.

---

## 4. QPS, throughput, and read/write ratios

**QPS** (queries per second) is the heartbeat of capacity planning. The standard derivation:

```
Daily Active Users (DAU)
  × actions per user per day      = total daily actions
  ÷ 86,400 (seconds/day ~10^5)    = AVERAGE QPS
  × peak factor (2× to 10×)       = PEAK QPS   ← design to THIS
```

**Always design for peak, not average.** Traffic is bursty: lunch-hour spikes, time-zone overlap, Black Friday, a viral post. A common rule of thumb is **peak ≈ 2–3× average** for steady consumer apps, and up to **10×** for spiky/event-driven ones. Some teams instead use the "80/20" framing: 80% of traffic arrives in 20% of the day → peak ≈ (0.8 × daily) ÷ (0.2 × 86,400) ≈ **4× average**.

**Read/write ratio** determines your entire architecture. Measure or assume it:

| System type | Read:Write | Architectural implication |
|---|---|---|
| Social feed (Twitter, IG) | 100:1 to 1000:1 | Heavy caching + read replicas; precompute feeds |
| E-commerce catalog (your Print-Flow store) | ~10:1 to 100:1 | CDN + cache product pages; DB handles writes fine |
| Analytics ingestion | 1:100 (write-heavy) | Append-only log, batch, columnar store |
| Chat / messaging | ~1:1 | Fan-out on write vs read is a real tradeoff |
| Ledger / banking | balanced, durability-critical | Strong consistency over raw throughput |

A read-heavy system (most consumer apps) is *cacheable* — the primary scaling lever is caching and replication. A write-heavy system can't be cached away and must scale the write path itself (sharding, batching, append-only logs). Knowing the ratio in the first minute tells you which lever to pull.

---

## 5. The four golden resources — which bottlenecks first?

Every machine has exactly four finite resources. A well-run capacity exercise asks: *which one runs out first?*

| Resource | Typical limit (one commodity server) | Saturates first when… | Symptom |
|---|---|---|---|
| **CPU** | 8–64 cores | compute-heavy: encryption, compression, serialization, image/video processing | high load average, requests queue |
| **Memory** | 32–512 GB | large caches, in-memory datasets, per-connection buffers, JVM heaps | OOM kills, GC thrash, swap |
| **Disk** | space (TB) + IOPS (SSD ~10k–500k) + throughput (GB/s) | databases, logging, media storage | I/O wait, slow queries |
| **Network** | 1–25 Gbps NIC | media serving, replication, large payloads | bandwidth cap, dropped packets |

**The discipline:** estimate demand on all four, then find the binding constraint. A video service is **network/disk-bound** (serving bytes) — CPU is idle. A password-hashing or ML-inference service is **CPU-bound**. An in-memory cache (Redis) is **memory-bound** and often single-threaded so effectively CPU-bound per core. A logging pipeline is **disk-IOPS-bound**.

Designing the wrong dimension is the classic mistake: adding CPU to a network-bound box does nothing. Identify the bottleneck *first*, then scale only that.

```
        demand
   CPU  ████░░░░░░  40%
   MEM  ██████░░░░  60%
   DISK ████████░░  80%   ← binding constraint: scale disk/IOPS or shard
   NET  ███░░░░░░░  30%
```

---

## 6. Little's Law — the one equation to memorize

> **L = λ × W**
> (items in system) = (arrival rate) × (average time in system)

It holds for *any* stable system regardless of distribution — queues, thread pools, connection pools, the whole service. It's the bridge between throughput and latency.

**Worked example — sizing a thread pool / connection pool:**

Your API handles **λ = 2,000 requests/sec**. Each request spends an average **W = 50 ms = 0.05 s** in the system (mostly waiting on the database).

```
L = λ × W = 2,000 × 0.05 = 100 concurrent requests in flight
```

So at any instant ~100 requests are being processed. If each needs a DB connection for its whole duration, you need a **pool of ~100 connections** (plus headroom). Provision 30 connections and 70 requests queue → latency climbs → timeouts → cascade.

**Run it backwards** to find max throughput from a fixed resource: if you can only afford a DB pool of 50 connections and W stays at 50 ms, then λ_max = L / W = 50 / 0.05 = **1,000 req/s**. Beyond that you *must* either add connections, cut W (faster queries, caching), or shed load.

This is why a small latency regression is so dangerous: if W doubles to 100 ms at the same arrival rate, L doubles to 200 — you've silently doubled your concurrency requirement and may exhaust the pool. Latency and concurrency are coupled. (Connection pooling and backpressure get full treatment in `08-databases-storage-and-replication.md` and `10-message-queues-and-async.md`.)

---

## 7. Percentiles — why averages lie

The single most important reliability concept in this module: **never trust the average (mean) latency.** Averages hide the pain.

Consider 10 requests with latencies (ms): `10, 10, 10, 10, 10, 10, 10, 10, 10, 1000`.
- **Mean = 109 ms** — looks acceptable-ish.
- **p50 (median) = 10 ms** — "typical" user is fine.
- **p90 = 10 ms**, **p100 (max) = 1000 ms** — one user waited a full second.

The mean is dragged around by outliers and tells you about *no actual user*. Percentiles tell you about real experiences:

| Percentile | Meaning | Who cares |
|---|---|---|
| **p50 (median)** | half of requests are faster | "typical" experience |
| **p95** | 1 in 20 requests is slower | noticeable to power users |
| **p99** | 1 in 100 slower | SLA target for most serious services |
| **p999** | 1 in 1,000 slower | Amazon/Google-tier; your biggest customers hit it constantly |

**Why the tail matters more than it seems:** your *best* customers — the ones who make the most requests — are statistically the most likely to hit the slow tail. Amazon famously found that **100 ms of extra latency cost ~1% in sales**, and optimizes p999. A user who loads 100 pages will, on average, hit the p99 latency on one of them.

Operational rules:
- **SLOs are stated in percentiles**, e.g. "p99 < 200 ms," never "average < 200 ms."
- **You cannot average percentiles across servers.** p99 of two boxes is not the average of their p99s. Aggregate raw histograms (HDR histograms, t-digest) instead.
- **Watch the gap** between p50 and p99. A small gap = consistent system. A 10× gap (p50=10 ms, p99=100 ms) signals queueing, GC pauses, lock contention, or noisy neighbors.

---

## 8. Tail-latency amplification in fan-out

This is the advanced trap that surprises senior engineers. When a request **fans out** to many backends in parallel and must wait for *all* of them, the slow tail of each backend becomes the *common case* of the overall request.

If a single backend has a p99 of 100 ms (1% chance any one call is slow), and your request fans out to **100 backends in parallel and waits for the last one**, the probability that *at least one* is in its slow tail is:

```
P(at least one slow) = 1 − (0.99)^100 ≈ 1 − 0.366 = 0.634
```

**~63% of your user-facing requests now experience the slow path.** The system's p99 backend behavior has become the overall p50. This is *tail-latency amplification*, documented in Dean & Barroso's paper *"The Tail at Scale."*

```
Fan-out request waiting for ALL of 100 backends:

backend  1 ──fast──┐
backend  2 ──fast──┤
   ...             ├─► overall latency = MAX of all = the one slow tail
backend 73 ──SLOW──┤        (dominated by stragglers)
   ...             │
backend 100 ─fast──┘
```

Mitigations used in real systems (Google, etc.):
- **Hedged / backup requests:** send a duplicate to a second replica after a short delay (e.g. p95), take whichever returns first. Cuts the tail dramatically for ~5% extra load.
- **Reduce fan-out width** or fan out to fewer, larger shards.
- **Tied requests / request cancellation** so the loser is cancelled.
- **Make every backend's tail tight** — the only durable fix is reducing per-backend p99.

This is why microservice meshes with deep call graphs can have *terrible* p99 even when every individual service "looks fast" on its own dashboard.

---

## 9. A repeatable capacity-planning method

A checklist you can run every time, in order:

1. **State assumptions out loud.** DAU, actions/user/day, peak factor, read:write ratio, average object size, retention period. Write them down — they're the foundation everything rests on, and a reviewer can challenge an assumption but not your arithmetic.
2. **Compute QPS** (average, then peak). Split into read QPS and write QPS using the ratio.
3. **Compute storage/day and storage/year** = (writes/day) × (bytes/object), then × retention. Add replication factor (×3 is standard) and overhead (indexes, metadata: ~1.5–2×).
4. **Compute bandwidth** = QPS × payload size, separately for ingress and egress. Egress is usually the cost and bottleneck (media).
5. **Pick the binding resource** per service (the 4 golden resources).
6. **Divide demand by a single-box threshold** to get server count, add headroom.
7. **Sanity-check** against known thresholds (below) and round to a power of ten.

**Single-box thresholds worth memorizing (commodity hardware, rough):**

| Component | Order-of-magnitude capacity |
|---|---|
| Web/app server | ~1k–10k QPS (depends on work per request) |
| Postgres/MySQL (single primary) | ~5k–10k writes/s, more reads with replicas |
| Redis (single instance) | ~100k+ ops/s (in-memory, single-threaded core) |
| Kafka (per broker) | ~100s of MB/s, ~hundreds of k msgs/s |
| 1 Gbps NIC | ~125 MB/s; 10 Gbps ≈ 1.25 GB/s |
| SSD | ~10k–500k IOPS, ~500 MB/s–several GB/s |

---

## 10. Fully worked example — size a system for 10 million users

**Scenario:** a Twitter-like feed service. **Assumptions (stated):**
- 10 M DAU.
- Each user posts **2 times/day** (write) and reads their feed **20 times/day** (read) → ~10:1 read:write... but reads are cheap lookups while a post fans out. Let's compute both.
- Average post = **300 bytes** of text + metadata; assume 10% include an image of ~**200 KB**.
- Peak factor = **3×**.
- Retention: keep posts **5 years**. Replication ×3.

**Step 1 — Write QPS (posts):**
```
10,000,000 users × 2 posts/day = 20,000,000 posts/day
20,000,000 ÷ 86,400 (~10^5)    ≈ 230 writes/sec average
× 3 peak                        ≈ 700 writes/sec peak
```
700 writes/sec is comfortably within a single well-tuned Postgres primary (~5–10k writes/s). **No write sharding needed yet** — a key, money-saving conclusion.

**Step 2 — Read QPS (feed loads):**
```
10,000,000 × 20 reads/day = 200,000,000 reads/day
÷ 86,400                   ≈ 2,300 reads/sec average
× 3 peak                   ≈ 7,000 reads/sec peak
```
7k reads/sec exceeds a single primary's comfort zone → **cache (Redis) + read replicas**. With a 90% cache hit rate, only ~700 reads/sec hit the DB. This is the caching lever the read:write ratio predicted.

**Step 3 — Storage/year:**
```
Text: 20,000,000 posts/day × 300 B = 6 GB/day
Images: 20,000,000 × 10% × 200 KB = 2,000,000 × 200 KB = 400 GB/day
Total raw ≈ 406 GB/day ≈ ~0.4 TB/day

Per year: 0.4 TB × 365 ≈ ~150 TB/year (raw)
× 3 replication                ≈ 450 TB/year
× 5 years retention            ≈ 2.25 PB
```
Text is negligible (~2 TB over 5 years); **images dominate by ~70×.** Conclusion: text/metadata lives in Postgres; **media goes to object storage (S3) + CDN**, not the database. Sizing surfaced the architecture.

**Step 4 — Bandwidth (egress, the expensive direction):**
```
Feed read returns ~20 posts. Mostly text + thumbnail.
Egress per read ≈ ~50 KB (text + a few thumbnails).
7,000 reads/sec × 50 KB ≈ 350 MB/sec ≈ ~2.8 Gbps peak egress
```
2.8 Gbps overwhelms a single 1 Gbps NIC and is the textbook case for a **CDN** to absorb media egress at the edge (`06-caching-and-cdn.md`). Origin then serves only dynamic text.

**Step 5 — Server count (app tier):**
Assume each app server handles ~2,000 QPS of this workload. Total peak QPS ≈ 700 + 7,000 ≈ 7,700.
```
7,700 ÷ 2,000 ≈ 4 servers; ×2 for redundancy/headroom ≈ ~8 app servers
```

**Step 6 — Little's Law cross-check (DB pool):** at 700 DB-reaching reads/sec (post-cache) + 700 writes/sec ≈ 1,400 req/s to DB, W ≈ 20 ms → L = 1,400 × 0.02 = **28 connections** in flight. A pool of ~50 across replicas is ample.

**The one-paragraph answer you'd give:** *"~700 writes/s and ~7k reads/s at peak. Writes fit one Postgres primary; reads need Redis (90% hit) plus read replicas. ~2.25 PB over 5 years dominated by images, so media → S3 + CDN and metadata → Postgres. ~2.8 Gbps egress means a CDN is mandatory. ~8 app servers with headroom. No sharding required at 10 M users — revisit at ~100 M."*

That's a complete, defensible capacity plan from five assumptions and a calculator.

---

## 11. Common pitfalls / war stories

- **Designing for average, getting killed by peak.** A team sizes for 230 writes/s average; a product launch in one time zone drives a 15× spike and the DB falls over. Always carry a peak factor and a load-shedding plan.
- **Reporting mean latency on a dashboard.** A service "averages 40 ms" while 1% of requests take 4 s. The biggest customer (millions of requests) complains constantly; the dashboard says everything's fine. Switch SLOs to p99/p999.
- **Averaging percentiles across hosts.** A monitoring system computes "global p99" by averaging per-host p99s. It's mathematically meaningless and hides outlier hosts. Aggregate histograms, not percentiles.
- **The 2^31 integer overflow.** A signed 32-bit auto-increment ID silently caps at 2,147,483,647. High-volume tables hit it and inserts start failing in production with cryptic errors. Use 64-bit (bigint) IDs from day one. (Your CLAUDE.md mandates UUIDs — that's the more robust answer.)
- **Ignoring replication and index overhead in storage.** Raw data size × 1 looks fine; reality is ×3 replication × ~2 for indexes/metadata = ~6× your napkin number. Storage estimates that forget this are off by an order of magnitude.
- **Forgetting the network round trip is ~5,000 RAM accesses.** The N+1 query problem (100 round trips instead of 1) turns a 1 ms operation into a 50 ms one. This is the single most common real-world latency bug — and it's right in your own coding standards.
- **Fan-out p99 surprise.** Each microservice "looks fast" (p99 = 50 ms), but a request that fans out to 50 of them in series/parallel has a p99 in the seconds. Nobody owns the end-to-end number, so nobody sees it until users complain.
- **Treating cross-region latency as tunable.** A team tries to "optimize away" a 150 ms cross-continent hop with code. It's physics. The only fix is a regional replica or edge cache.

---

## 🧩 Case Study: Twitter's Timeline (fan-out and the BOTE that justified it)

**The problem.** By the early 2010s Twitter served on the order of **150 million daily active users** posting **~300–400 million tweets/day** (roughly **5,000–6,000 tweets/sec average**, with documented spikes to **~150,000 tweets/sec** during live events like the 2013 "Castle in the Sky" TV broadcast). But the brutal number wasn't writes — it was reads. The home timeline ("who I follow, newest first") was requested on the order of **hundreds of thousands of times per second**, a **read:write ratio well into the hundreds-to-one** range. That ratio is the entire story, and it's exactly the lever from §4: a read-heavy system is won or lost on how cheap a read is.

**Step 1 — size it the way §9 says.** Run the arithmetic Twitter's engineers effectively ran:

```
Writes:  ~400M tweets/day ÷ ~10^5 s/day  ≈ ~4,600 tweets/sec average
                                          ×3–30 peak ≈ many tens of k/sec
Reads:   timeline loads ≫ tweets         ≈ ~300k timeline reads/sec
Ratio:   reads/writes ≈ several hundred : 1   ← the design driver
```

A few thousand writes/sec fits comfortably on sharded storage (recall §10: even a single primary handles ~5–10k writes/s). **Reads are the wall.** The naive read — "on every timeline load, query the tweets of everyone I follow, merge, sort by time" — is a *fan-out-on-read*. For a user following 1,000 accounts that's a 1,000-way scatter-gather per request, hundreds of thousands of times per second. That's the §8 trap in its purest form.

**Step 2 — the fan-out cost, made concrete.** Twitter's decisive move was **fan-out-on-write**: when you tweet, the system pushes that tweet's ID into a precomputed, per-user "home timeline" cache (held in Redis) for **every one of your followers**, *at write time*. A read then becomes a single sequential lookup of an already-built list — the §10 "precompute feeds" pattern, paid for once at write instead of repeatedly at read.

```
 FAN-OUT-ON-WRITE (the chosen path)

   you tweet ──► [delivery fanout] ──► push tweet-id into
                                       follower_1 timeline (Redis)
                                       follower_2 timeline (Redis)
                                       ...        (one write per follower)
                                       follower_N timeline (Redis)

   follower reads timeline ──► ONE Redis range read  (O(1)-ish, ~ms)
```

The trade is explicit in the math. With an average of a few hundred followers, **one write triggers a few hundred cache writes** — but it converts a hundreds-of-thousands-QPS *read* fan-out into a hundreds-of-thousands-QPS *cheap list read*, while the expensive fan-out happens at the far lower write rate (a few thousand/sec). You move work from the hot path (reads) to the cold path (writes), exactly because the read:write ratio said reads are ~100× more frequent. Storage cost is real: every follower keeps a materialized list of recent tweet IDs in RAM — but IDs are ~8–16 bytes (§3), so a 800-entry timeline is only ~kilobytes, and Redis does **~100k+ ops/sec per instance** (§9 thresholds), which is why an in-memory tier was mandatory rather than hitting the DB.

**Step 3 — where fan-out-on-write breaks, and the hybrid.** Lady Gaga / Obama-class accounts had **tens of millions of followers**. A single tweet from them would mean tens of millions of cache writes — a write *amplification* that stalls the delivery pipeline and delays everyone's timeline. So Twitter accepted a **hybrid**: ordinary accounts use fan-out-on-write; a small set of celebrity accounts are *excluded* from fan-out, and their tweets are **merged in at read time** for followers who include them. Most timelines are pure cache reads; the handful that follow celebrities pay a small merge. This is the §8 mitigation "reduce fan-out width" applied at the data-model level.

**The trade-off they accepted.** They gave up **write simplicity and write latency** (and a lot of RAM for duplicated timelines) to buy **read latency and read throughput**. They also accepted **eventual consistency** — your followers don't all see a tweet at the same instant; the fan-out drains over seconds. For a social feed that's fine; for a ledger (§4) it would be unacceptable. And they accepted the operational complexity of two code paths (the hybrid) rather than one clean rule.

**Results.** The materialized-timeline architecture (the "Timeline" / Redis-backed delivery system Twitter described publicly around 2013) drove home-timeline reads to roughly **a few milliseconds at the median**, served from RAM, while keeping the system stable at **~150k tweets/sec peaks**. Tellingly, when they re-engineered for tail latency, the wins were quoted in **percentiles, not averages** (§7): reported **p99 home-timeline latencies in the low hundreds of milliseconds**, with the explicit goal of shrinking the **p50→p99 gap** — because a power user refreshing constantly hits the tail repeatedly (§7's "your best customers live on the tail").

### Lessons

- **The read:write ratio chooses your architecture before anything else does.** Hundreds-to-one reads → precompute on write and serve from RAM; the BOTE in §4/§10 told them this in the first minute.
- **Fan-out is a cost you can *move*, not erase.** Pay it on the rarer event (writes) when reads dominate — but watch for write-amplification on high-degree nodes and break the rule (hybrid) exactly where the numbers say it hurts.
- **Materializing for reads costs RAM and consistency.** That's an acceptable trade for a feed, a wrong one for money — always name what you're giving up.
- **Report and optimize the tail.** "A few ms median" hid nothing only because they also tracked p99 and the p50→p99 gap; the average would have lied (§7).

## 12. Test yourself

1. A service receives **500 M requests/day**. What is the average QPS, and a reasonable peak QPS? *(Hint: ÷10^5 for average; ×2–3 for peak.)*
2. You have a thread pool of **200** threads and each request takes **W = 100 ms**. What's the max sustainable throughput? *(Hint: Little's Law backwards: λ = L/W.)*
3. Your single-backend p99 is **99.9% under 50 ms (i.e. 0.1% slow)**. You fan out to **200** backends and wait for all. Roughly what fraction of requests hit the slow path? *(Hint: 1 − 0.999^200.)*
4. Why can a service with a **40 ms mean** latency still be a serious reliability problem? *(Hint: what does the mean hide? Think p99/p999 and which users hit it.)*
5. You're storing **100 M new rows/day** at **500 bytes each**. How much raw storage per year, and what's the realistic figure after ×3 replication and ×2 index overhead? *(Hint: bytes/day → ×365 → ×6.)*
6. A box shows CPU 30%, memory 45%, disk-IOPS 95%, network 20%. You add more CPU cores. What happens to throughput, and what should you have done? *(Hint: bottleneck dimension.)*
7. Why is **sequential** disk access ~100× faster than **random**, and name two real systems designed around this fact. *(Hint: seek time; LSM-trees / Kafka logs.)*
8. Without a calculator, convert **2 billion events/day** to per-second. *(Hint: ÷ ~10^5 → then ×2.)*

*Answers: (1) ~5,000 avg, ~10–15k peak. (2) λ = 200/0.1 = 2,000 req/s. (3) 1 − 0.999^200 ≈ 18%. (4) The mean hides the tail; heavy users hit p99/p999 constantly; SLOs must be percentile-based. (5) 50 GB/day → ~18 TB/yr raw → ~110 TB/yr after ×6. (6) Throughput unchanged — disk IOPS is the binding constraint; scale storage/IOPS or shard. (7) Random access pays seek/rotational latency each time; Kafka and LSM-tree stores (RocksDB, Cassandra) turn writes into sequential appends. (8) 2×10^9 ÷ 10^5 = 20,000/s average.)*

---

## 13. Further reading

- **Jeff Dean — "Latency Numbers Every Programmer Should Know"** (the canonical table; see the interactive *"Latency Numbers"* visualization by Colin Scott that updates them by year).
- **Martin Kleppmann — *Designing Data-Intensive Applications (DDIA)***, Ch. 1 (reliability/scalability/maintainability) and the percentiles/SLO discussion — the single best book for this entire curriculum.
- **Dean & Barroso — "The Tail at Scale"** (Communications of the ACM, 2013) — the definitive paper on tail-latency amplification and hedged requests.
- **The System Design Primer** (GitHub: donnemartin/system-design-primer) — the "Powers of two" and "Latency numbers" appendices, plus worked back-of-envelope examples.
- **Brendan Gregg — *Systems Performance*** — deep treatment of the four resources, USE method (Utilization/Saturation/Errors), and Little's Law in practice.

---

**Next:** `02-` onward build on these numbers. Whenever a later module says "this won't scale past X," come back here and prove it with the arithmetic. Estimation is the skill you'll use in every other module — see `07-load-balancing-and-scaling.md` for what to do once a single box's threshold is exceeded.
