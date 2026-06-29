---
title: "System Design Interview: A 7-Step Framework That Works"
metaTitle: "System Design Interview Framework & Cheat Sheet"
description: "A repeatable 7-step framework for the system design interview, plus 10 worked case studies from URL shorteners to payments. Walk in calm, control the room."
keywords:
  - system design interview
  - system design framework
  - how to answer system design questions
  - system design case studies
  - URL shortener system design
  - news feed system design
  - rate limiter design
  - consistent hashing
  - fan-out on write
  - distributed system design interview
  - back of the envelope estimation
  - payment system design
  - chat system design
  - idempotency key
faq:
  - q: How do I structure a system design interview answer?
    a: Run the same 7-step loop every time - requirements, estimation, API, data model, high-level design, deep dives, then bottlenecks. The structure itself is the signal interviewers look for, so you never have to free-associate under pressure.
  - q: How long should I spend on each part of a 45-minute round?
    a: Roughly 5 minutes on requirements, 5 on estimation, 5 on API and data model, 10 on the high-level design, 15 on deep dives, and 5 wrapping up bottlenecks. The biggest mistake is burning 25 minutes on requirements and never reaching a deep dive.
  - q: What is fan-out on write versus fan-out on read?
    a: Fan-out on write pushes a new post into every follower's precomputed feed, giving fast reads but expensive writes. Fan-out on read gathers posts from everyone you follow at query time, giving cheap writes but slow reads. The senior answer is a hybrid that pushes for normal users and pulls for celebrities.
  - q: Why is consistent hashing used in distributed caches?
    a: Plain hash(key) % N remaps almost every key when you add or remove a node, causing a mass cache miss that can crush your database. Consistent hashing moves only about 1/N of keys when the cluster changes size, so the system stays stable.
  - q: What is an idempotency key and why do payment systems need one?
    a: An idempotency key is a unique token a client attaches to a request so the server can recognize retries. The server stores the result against that key and returns the same answer on replay, which prevents network retries from charging a customer twice.
  - q: Do I need to memorize latency numbers for system design interviews?
    a: A small handful helps a lot - memory is about 100 nanoseconds, an SSD read is tens of microseconds, a same-datacenter round trip is about half a millisecond, and a cross-continent trip is 80 to 150 milliseconds. These let you justify caching, sharding, and replication with real math.
author: Pritesh Yadav (priteshyadav444)
transformed: true
topic: system-design
topicTitle: System Design
category: Engineering
date: '2026-06-15'
order: 20
icon: "\U0001F3D7️"
sources: []
polished: true
---

Most people don't fail the system design interview because they don't know enough. They fail because they panic, blurt out "I'll use Kafka," and then spend forty minutes explaining a system nobody agreed they were building.

The candidates who pass aren't smarter. They're calmer, because they're running a script. They have a fixed loop they trust, and that loop frees up all the brainpower the nervous candidate is spending on "what do I say next?"

This article hands you that loop, then walks ten classic systems through it so you can see the moves in action.

## Why this matters

A design round is the one interview that actually mirrors the job. Nobody asks you to reverse a binary tree at 2 a.m. during an outage. But "the feed is slow, the cache fell over, what do we do?" is a Tuesday.

So the interviewer isn't really testing whether you've memorized how Dropbox works. They're testing whether you can **drive a fuzzy problem from "design a big system" to a concrete architecture**, out loud, while making sensible trade-offs and admitting what breaks.

That's a learnable skill. And once you have the framework, the same handful of moves keep reappearing across wildly different systems - which means studying ten case studies teaches you the hundredth.

## The framework: one loop you run every time

Treat the interviewer as a product manager *and* a co-architect. You drive, but you check in. Here's the loop, in order:

1. **Requirements** - what it does (functional) and how well it must do it (non-functional).
2. **Estimation** - rough numbers: requests per second, storage, bandwidth.
3. **API** - the contract: endpoints, parameters, what comes back.
4. **Data model** - the entities, how you'll query them, and which store fits.
5. **High-level design** - boxes and arrows; trace one request end to end.
6. **Deep dives** - go deep on the two or three pieces the interviewer cares about.
7. **Bottlenecks** - what breaks at scale, how it fails, the trade-offs you chose.

The arrow loops back: whenever a new constraint shows up, let it change the design out loud.

### Spend your time where the signal is

In a 45-minute round, a budget that works:

- ~5 min requirements
- ~5 min estimation
- ~5 min API and data model
- ~10 min high-level design
- ~15 min deep dives
- ~5 min bottlenecks and wrap-up

The single most common way to bomb is to spend twenty-five minutes lovingly clarifying requirements and never draw a single deep dive. Deep dives are where senior signal lives. Protect that time.

### Step 1: Requirements are the design in disguise

Separate two kinds of requirement.

**Functional** is what users can do: "a user can shorten a URL." **Non-functional** is how well: "99.9% available, reads under 50 milliseconds, eventual consistency is fine."

Here's the part beginners miss: *the non-functional requirements decide your architecture far more than the features do.* Read-heavy or write-heavy? Consistency or availability? What's the latency budget? How durable must the data be?

Always ask four things up front: the **read-to-write ratio**, the **scale** (daily active users), the **latency target**, and the **consistency tolerance**. Those four numbers point at the design before you've drawn a box.

### Step 2: Estimation, with the math shown

You don't need precision. You need to justify decisions like "this needs sharding" with arithmetic instead of vibes.

A few numbers worth memorizing:

| Quantity | Rough value | Why it matters |
|---|---|---|
| Seconds in a day | ~86,400 (call it 10⁵) | users × actions ÷ 10⁵ ≈ average requests/sec |
| Peak factor | 2–10× average | size for peak, not average |
| Memory reference | ~100 ns | the baseline for "fast" |
| SSD random read | ~16–100 µs | fast, but ~100× slower than memory |
| Same-datacenter round trip | ~0.5 ms | a network hop is not free |
| Cross-continent round trip | ~80–150 ms | the speed of light sets the floor |
| Spinning-disk seek | ~10 ms | keep it out of the hot path |

**Worked example - always do this on the whiteboard.** Say 100M daily users, each posting twice and reading a hundred times.

- Writes: 200M/day ÷ 86,400 ≈ **2,300 writes/sec** (peak ×5 ≈ 11.5K).
- Reads: 10B/day ÷ 86,400 ≈ **115K reads/sec**.
- Storage at 1 KB each over 5 years: 200M × 1 KB × 365 × 5 ≈ **365 TB**.

That 50:1 read skew instantly tells you the plan: cache hard, replicate reads, optimize the read path. And 365 TB tells you it won't live on one box. You didn't guess - you *derived* it.

### Steps 3–4: API and data model

Keep the API boringly RESTful unless there's a real reason not to (gRPC for high-throughput internal calls, WebSocket when the server needs to push).

For the data model, the rule is simple: **match the access pattern.** Say the access pattern out loud - "I look this up by key" - and then the store picks itself. Query by key? A key-value store beats a relational join.

### Steps 5–7: design, dive, and break it

Draw the request path as boxes and arrows. Then the interviewer will pull a thread: "what if one shard gets hot?" Follow it. Your deep dives and your honesty about what breaks are where the real evaluation happens.

One sentence pattern signals staff-level thinking better than any diagram: **name the trade-off explicitly.**

> "I'll fan out on write for normal users, but fall back to fan-out on read for celebrities - a hybrid - because pure write fan-out explodes at 100 million followers."

That single line says: I know the default, I know where it breaks, and I chose on purpose.

---

Now the case studies. Each one is compressed to its requirements, the two or three decisions that actually carry the design, and what an interviewer (or a real incident) will probe.

## URL shortener (TinyURL, bit.ly)

**The shape:** map a short code to a long URL, redirect fast, roughly 100:1 read-to-write, redirects under 50 ms. At 100M new URLs/day that's ~1,160 writes/sec, ~116K reads/sec, and around 91 TB over five years.

**The decisions that matter:**

**Generating the short code.** Three honest options:

| Approach | Upside | Downside |
|---|---|---|
| Hash the long URL, truncate | stateless, dedups identical URLs | collisions need a retry |
| Random 7-char base62 | huge space (62⁷ ≈ 3.5 trillion) | must check for collision before write |
| Counter + base62 encode | no collisions, simple | needs a distributed ID generator |

**Generating IDs without a single bottleneck.** A central auto-increment counter is a single point of failure. Instead use **ranged allocation**: each server grabs a block of, say, 1,000 IDs from a coordinator, then hands them out locally. Or use Twitter's **Snowflake** scheme (timestamp + machine ID + sequence). Then base62-encode the number into the short code.

**The read path is a cache.** Put Redis or Memcached in front of the database. With 100:1 read skew you'll hit 95%+ cache hits easily. One classic interview trap hides here: redirect with **301 (permanent)** and browsers cache it - which kills your click analytics - versus **302 (temporary)**, where every click reaches you. Interviewers love watching you reason through that.

**What they'll probe:** collisions under concurrent writes, a cache stampede when a link goes viral (coalesce duplicate requests), and a single hot short code that outgrows one node (replicate that key).

## Distributed rate limiter

**The shape:** allow N requests per window per key (user, IP, or API key), add under a millisecond, and stay accurate across a fleet of stateless servers.

**Pick an algorithm:**

| Algorithm | Behavior |
|---|---|
| Fixed window counter | tiny memory, but allows a 2× burst at the window boundary |
| Sliding window log | exact, but stores every timestamp - expensive |
| Sliding window counter | tiny memory, smooths the edges, good approximation |
| Token bucket | tiny memory, allows controlled bursts - the API default |
| Leaky bucket | smooths traffic to a constant rate |

Default to **token bucket** (a refill rate plus a capacity). It's what Stripe and AWS API Gateway use.

**Where does the counter live?** Per-node counters are fast but each node only sees a slice of traffic, so the global limit ends up N times too loose. Centralize the count in **Redis** with an atomic operation - an `INCR` with expiry, or a small Lua script for token bucket so the whole check is one atomic step. The trade-off: Redis is now in your hot path and is a single point of failure. Soften it with local approximate counters that sync periodically.

**What they'll probe:** the boundary-burst bug, race conditions (the count *must* be atomic - never read, modify, then write), and the failure mode. When Redis goes down, do you **fail open** (let traffic through) or **fail closed** (block it)? Usually fail open, so a cache outage doesn't take down your whole API.

## News feed (Twitter, Instagram timeline)

**The shape:** users follow others, the home timeline shows recent posts from people you follow newest-first, heavily read, and a post showing up two seconds late is fine.

**The one decision everything hinges on - fan-out on write vs read:**

| | Fan-out on write (push) | Fan-out on read (pull) | Hybrid |
|---|---|---|---|
| Read speed | very fast | slow (gather from everyone) | fast |
| Write cost | huge for big accounts | none | bounded |
| Best for | most users | celebrities | everyone |

With **fan-out on write**, a new post is copied into every follower's precomputed feed. Reads are instant. But a celebrity with 100M followers triggers 100M writes per post - a disaster.

With **fan-out on read**, you store the post once and gather posts from everyone a user follows at read time. Cheap writes, slow reads.

**The senior answer is hybrid.** Push for normal users. For accounts with millions of followers, don't fan out at all - pull their recent posts at read time and merge them into the precomputed feed. Twitter's timeline famously evolved into exactly this.

**Mechanics:** feeds live in Redis sorted sets (scored by time), capped around 800 entries. Posts live in a sharded store like Cassandra. The write path drops fan-out jobs onto Kafka, and workers update follower feeds asynchronously - never inside the original request.

**What they'll probe:** the celebrity case (raise it yourself, always), chronological versus ML-ranked feeds, and the thundering herd on a viral post.

## Chat and messaging (WhatsApp)

**The shape:** 1:1 and group chat, real-time delivery, read receipts, presence, in-order messages, offline storage, billions of messages a day.

**The decisions that matter:**

**Connection model.** The server has to *push* to the client, so you need a persistent connection - a **WebSocket** (or MQTT, which WhatsApp uses for low overhead on mobile). One gateway server holds millions of live connections. A **connection registry** in Redis maps `user_id → gateway_server`, so the sender's gateway knows which gateway holds the recipient.

**Delivery and ordering.** Persist the message *before* acknowledging it. Order messages with per-conversation **sequence numbers**, not wall-clock time, because clocks drift between machines. If the recipient is offline, store the message and push via APNs or FCM when their device reconnects. Receipts (sent, delivered, read) are just more messages.

**Group fan-out.** Small groups: write to each member. Large groups have a cap (WhatsApp's is ~1024 members) - and that cap *is* a design decision, because it bounds the blast radius.

**What they'll probe:** graceful failover when a gateway dies (clients reconnect and re-register), at-least-once delivery made safe with idempotent message IDs so clients can dedupe, and presence at scale (heartbeats are expensive, so debounce and approximate).

## Ride-sharing: nearby drivers (Uber, Lyft)

**The shape:** drivers ping their location every few seconds, a rider request must find nearby available drivers in under 200 ms, and there are millions of location updates per second.

**The core decision - geospatial indexing.** You cannot run `WHERE distance < r` over millions of moving points per query. Instead, encode each location into a **searchable cell**:

| Technique | Idea |
|---|---|
| Geohash | bisect the map recursively; a shared string prefix means "close" |
| Quadtree | subdivide into quadrants, deeper where it's busy |
| Google S2 | map the sphere onto a space-filling curve |
| Uber H3 | a hexagonal grid where all neighbors are equidistant |

A nearby query becomes "find all drivers whose cell is my cell or one of its neighbors." Uber prefers **hexagons (H3)** because all six neighbors sit at an equal distance - unlike squares, where a diagonal neighbor is farther than an edge neighbor.

**The second decision - the write storm.** Millions of drivers updating every few seconds is millions of writes per second. Don't pound a database. Keep the live location index **in memory**, sharded **by region** (so one nearby query hits one shard), and persist only a sampled trail separately.

**What they'll probe:** hotspots like downtown at rush hour (subdivide that cell adaptively), the matching race (two riders must not get the same driver - use a short-lived lock or a dispatch queue), and the cell-boundary case (a driver just across a line is nearby but in a different cell, so you must query neighbors).

## File storage and sync (Dropbox, Google Drive)

**The shape:** upload, download, sync across devices, share, version, handle big files, and be bandwidth-efficient.

**The decisions that matter:**

**Chunking and dedup.** Split each file into ~4 MB **content-addressed chunks**, where the chunk's hash is its ID. This buys you resumable uploads, parallel transfer, and **deduplication** - an identical chunk is stored once globally. Edit a 1 GB file and only the changed chunks re-upload. That's delta sync.

**Split metadata from blobs.** Keep metadata (the file tree, chunk lists, versions, permissions) in a **strongly consistent** store like sharded SQL or Spanner. Keep the chunks in **object storage** like S3 behind a CDN. Metadata is the brain; blob storage is the muscle.

**Sync protocol.** The client watches the local filesystem, computes diffs, and pushes changed chunks plus a new metadata version. Other devices get notified and pull. When two devices edit the same file offline, **version vectors** detect the conflict, and Dropbox resolves it by keeping both ("file (conflicted copy)") - because silently auto-merging binary files is dangerous.

**What they'll probe:** conflict semantics, consistency of metadata versus eventually-consistent blobs, and the overhead of chunking tiny files.

## Video streaming (YouTube, Netflix)

**The shape:** upload and transcode, stream to any device and bandwidth, enormous read scale, fast startup with no rebuffering, petabytes of storage.

**The decisions that matter:**

**The transcoding pipeline (write path).** An upload lands in object storage, then **fan-out transcode jobs** to a worker fleet, producing many resolutions and codecs (240p to 4K, H.264/VP9/AV1) and cutting each video into ~2–10 second **segments**. Transcoding is the expensive part and is embarrassingly parallel, so split each video into segments and transcode them across the fleet at once.

**Adaptive bitrate streaming (read path).** With **HLS or DASH**, the player downloads a manifest listing the segments at several bitrates, then picks a bitrate *per segment* based on the bandwidth it's actually measuring. It drops to 480p mid-stream rather than freeze. That client-side logic is the whole secret of "no buffering."

**The CDN is the game.** Over 99% of bytes are served from edge caches near users - Netflix even embeds boxes inside ISPs (**Open Connect**). The origin only sees cache misses. That's what makes petabyte-scale streaming economically possible.

**What they'll probe:** transcode cost, warming the CDN for a brand-new viral video (tiered caching, origin shielding), and storage tiering for the cold long tail.

## Notification system (push, email, SMS)

**The shape:** send across channels, handle bursty high throughput, respect user preferences and opt-outs, retry failures, and never spam duplicates.

**The decisions that matter:**

**A queue-decoupled pipeline.** Producers publish events to a **message queue** (Kafka or SQS), and channel-specific workers call the providers - APNs/FCM for push, SES/SendGrid for email, Twilio for SMS. Decoupling absorbs bursts and keeps one slow provider from dragging down the rest.

**Idempotency and dedup.** At-least-once queues retry, and retries make duplicates. Attach a notification key and check a dedup store (Redis with a TTL) before sending. A duplicate "your code is 123" text or a double charge is a real incident, not a cosmetic bug.

**Preferences, throttling, and a dead-letter queue.** Check opt-outs and per-user rate caps *before* sending. Retry failures with backoff, and after the max attempts move the message to a **dead-letter queue** - never silently drop a payment receipt.

**What they'll probe:** provider outages (circuit breaker plus a failover provider) and priority (a 2FA code must jump ahead of marketing - give it a separate high-priority topic).

## Distributed cache (Memcached, Redis Cluster)

**The shape:** sub-millisecond reads, scale beyond one machine's RAM, a high hit ratio, and tolerance for node failures.

**The decisions that matter:**

**Sharding with consistent hashing.** The naive `hash(key) % N` remaps almost every key the moment N changes - a mass cache miss that can melt your database. **Consistent hashing** places nodes on a ring and moves only about 1/N of keys when one joins or leaves. Virtual nodes even out the load. This is *the* answer interviewers are fishing for.

**Eviction and invalidation.** Use LRU or LFU eviction and, for writes, default to **cache-aside**. Invalidation is genuinely hard, so prefer a short TTL plus cache-aside over trying to keep the cache perfectly in sync with the source of truth.

**Stampede protection.** When a hot key expires, thousands of requests hit the database at once. Fix it with request coalescing (let one request fetch while the rest wait), staggered TTLs (add jitter), or background refresh.

**What they'll probe:** the hot key that outgrows one node (replicate it or cache it on the client) and the cost of rebalancing.

## Payment system

**The shape:** charge and refund money, where **correctness beats availability** - never double-charge, never lose money. Idempotency, an audit trail, and reconciliation are mandatory.

**The decisions that matter:**

**Idempotency is non-negotiable.** A network retry must not charge twice. The client sends an **idempotency key**; the server records `key → result` and returns the *same* result on replay. Stripe's whole API is built around this, and interviewers expect you to raise it before they ask.

**Money is a state machine plus a ledger, not a column you overwrite.** Model a payment as states - `initiated → pending → succeeded / failed → refunded` - and record an **immutable double-entry ledger** where every movement is a balanced debit and credit. You *reconstruct* balances from the ledger; you never mutate a balance in place. That's what gives you auditability and a way to settle disputes.

**Consistency over availability, plus reliable async.** This is a **CP** system: refuse a payment rather than risk a wrong one. The dangerous moment is the **dual write** - your database commits but the external gateway call times out, and now you don't know if the customer was charged. Solve it with the **transactional outbox** pattern: write the intent and an outbox row in one database transaction, and let a relay publish to the gateway afterward. Then run **reconciliation** jobs that compare your ledger against the gateway's daily report to catch any drift.

**What they'll probe:** the dual-write problem, why you chose CP over AP, and money representation (use integer minor units like cents, never floating point).

## Common misconceptions

A few beliefs quietly sink otherwise strong candidates.

- **"Name-dropping tech shows expertise."** Saying "Kafka" before you know the read-to-write ratio reads as cargo-culting. Derive the tech *from* the numbers.
- **"Estimation is busywork."** A candidate who computes 365 TB and *then* shards sounds senior. One who shards "because big data" does not.
- **"Load is uniform."** The celebrity, the viral link, the one hot cache key - skew is the number-one production surprise. Always ask, "what's the skew?"
- **"At-least-once is basically exactly-once."** Queues redeliver. Without an idempotency key you get duplicate emails, double charges, and double inventory decrements.
- **"I'll just update the DB and then publish to Kafka."** If the process dies between those two steps, the system is inconsistent forever. That's *the* classic distributed-systems bug. Use an outbox or change-data-capture.

## How to use this in your next round

1. **Memorize the 7-step loop**, not ten architectures. The loop is what keeps you calm; the architectures fall out of it.
2. **Open every answer by clarifying requirements** - functional, non-functional, and the four numbers (read:write, scale, latency, consistency). Write them in a corner of the board.
3. **Do the back-of-the-envelope math out loud.** Let the numbers force the decision to shard, cache, or replicate. Show your work.
4. **Draw the happy-path request first**, end to end, before you optimize anything.
5. **Pick two or three deep dives** and name the trade-off in each, in one sentence: "X buys me Y at the cost of Z."
6. **Raise the failure case before the interviewer does.** For every box you draw, say what happens when it crashes. Decide fail-open versus fail-closed on purpose.
7. **Practice five of these out loud, on a timer.** Reading is not rehearsing. The framework only helps if your mouth knows it under stress.

## Conclusion

If you remember one thing, remember this: **the interview rewards structure over knowledge.** The candidate who calmly runs the same loop - requirements, estimation, design, deep dive, what-breaks - beats the one who knows more facts but free-associates. You're being hired to bring order to ambiguity, and the loop is you doing exactly that, live.

Notice how the same primitives kept resurfacing across ten very different systems: a queue to absorb bursts, a cache to survive read skew, consistent hashing to survive resizing, an idempotency key to survive retries. That's not a coincidence - it's the small alphabet that distributed systems are written in.

Want to go deeper on the single idea that quietly powered half these designs? Look at the **transactional outbox** and the dual-write problem next. Once you see how systems lie to themselves when a write half-succeeds, you'll never draw "update the DB, then call the service" the same way again.
