# 20 — Case Studies & the System Design Interview Framework

**What you'll learn:** A reusable, repeatable framework for attacking any system-design problem (whiteboard or production), and then ten fully worked compact designs — URL shortener, distributed rate limiter, news feed, chat, ride-sharing geo, file sync, video streaming, notifications, distributed cache, and payments — each reduced to its requirements, 2–3 load-bearing decisions, the failure modes, and what an interviewer (or an incident) will probe. By the end you should be able to walk into a 45-minute design round and *control the conversation* instead of free-associating.

**Prerequisites:** This is the capstone. Read the earlier modules first — especially `09-cap-pacelc...md` (consistency trade-offs), `10-replication-and-partitioning...md` (sharding), `12-caching...md`, `14-message-queues-and-streaming...md` (Kafka/log), `15-consensus...md` (Raft/leader election), and `17-rate-limiting-and-load-shedding...md`. The case studies *compose* those primitives; this module assumes you know each one.

---

## 1. The framework: a 7-step loop you run every time

Most candidates fail not from ignorance but from **lack of structure** — they jump to "I'll use Kafka" before anyone agreed what the system does. The fix is a fixed loop. Treat the interviewer as a product manager *and* a co-architect: drive, but check in.

```
 ┌──────────────────────────────────────────────────────────────┐
 │ 1. Requirements  → functional + non-functional + constraints │
 │ 2. Estimation    → QPS, storage, bandwidth (back-of-envelope)│
 │ 3. API           → the contract (endpoints, params, returns) │
 │ 4. Data model    → entities, access patterns, choose store   │
 │ 5. High-level    → boxes + arrows, request path end-to-end   │
 │ 6. Deep dives    → 2-3 components the interviewer cares about │
 │ 7. Bottlenecks   → scale, failures, trade-offs, what breaks  │
 └──────────────────────────────────────────────────────────────┘
        ↑ loop back whenever a constraint changes the design ↑
```

**Time budget for a 45-min round:** ~5 min requirements, ~5 min estimation, ~5 min API + data model, ~10 min high-level, ~15 min deep dives, ~5 min wrap-up on bottlenecks. The single biggest mistake is spending 25 minutes on requirements/estimation and never drawing a deep dive.

### Step 1 — Requirements
Separate **functional** ("user can shorten a URL") from **non-functional** ("99.9% availability, p99 < 50ms read"). The non-functional ones *are* the design — read-heavy vs write-heavy, consistency vs availability, latency budget, and durability requirements pick your architecture far more than the features do. Always ask: read:write ratio, expected scale (DAU), latency SLO, and consistency tolerance.

### Step 2 — Estimation (the numbers you must memorize)

| Quantity | Value | Use |
|---|---|---|
| Seconds/day | ~86,400 (~10⁵) | DAU × actions ÷ 10⁵ = avg QPS |
| Peak factor | 2–10× average | size for peak, not average |
| L1 cache ref | ~1 ns | — |
| Main memory ref | ~100 ns | RAM is ~100× cache |
| SSD random read | ~16–100 µs | — |
| Network round trip (same DC) | ~0.5 ms | — |
| Network RTT (cross-continent) | ~80–150 ms | speed of light floor |
| Disk seek (HDD) | ~10 ms | avoid in hot path |
| 1 KB over 1 Gbps | ~10 µs | bandwidth math |

**Worked example (always show the math):** 100M DAU, each posts 2× and reads 100× → writes = 200M/day ÷ 86,400 ≈ **2,300 write QPS** (peak ×5 ≈ 11.5K). Reads = 10B/day ÷ 86,400 ≈ **115K read QPS**. That 50:1 read skew immediately says: cache aggressively, replicate reads, optimize the read path. Storage: 200M writes × 1 KB × 365 × 5 yr ≈ **365 TB** — needs sharding, not one box.

### Steps 3–4 — API and data model
Keep the API boringly RESTful unless there's a reason (gRPC for internal high-throughput, WebSocket for push). The data model's job is to **match the access pattern**: if you query by key, a KV store beats a relational join. State the access pattern *out loud*, then pick the store (see the per-case tables below).

### Steps 5–7
Draw the request path as boxes and arrows; then the interviewer will pull on a thread ("what if a shard is hot?"). Your deep dives and bottleneck discussion are where senior signal lives — show you know *what breaks* and *the trade-off you chose*.

> **Senior tell:** name the trade-off explicitly. "I'll use fan-out-on-write for the common case but fall back to fan-out-on-read for celebrities — hybrid — because pure write-fanout blows up at 100M followers." That sentence signals staff-level reasoning.

---

## 2. URL shortener (TinyURL / bit.ly)

**Requirements:** create short→long mapping; redirect; ~100:1 read:write; low-latency redirect (p99 < 50ms); links rarely deleted. Optional: custom aliases, analytics, expiry.

**Estimation:** 100M new URLs/day → ~1,160 write QPS, ~116K read QPS. 100M × 365 × 5yr × 500 B ≈ **91 TB**.

**Critical decisions:**
1. **Short-code generation.** Three options:

| Approach | Pro | Con | When |
|---|---|---|---|
| Hash(long URL) + truncate | stateless, dedups identical URLs | collisions need retry; not random | dedup matters |
| Random base62 (7 chars) | 62⁷ ≈ 3.5T space, simple | collision check (read before write) | default |
| Counter + base62 encode | no collisions, monotonic | needs distributed ID (see below) | high write rate |

2. **Distributed ID without a single bottleneck.** A central auto-increment is a SPOF. Use **ranged allocation**: each app server grabs a block of 1,000 IDs from a coordinator (ZooKeeper/etcd or a `counters` row with `SELECT FOR UPDATE`), then hands them out locally. Or Twitter **Snowflake** (timestamp+machine+seq). Base62-encode the ID → short code.
3. **Read path = cache.** Redis/Memcached in front of the KV store (DynamoDB/Cassandra). 100:1 read skew → ~95%+ hit rate. Redirect with **301 (cached by browser, kills your analytics)** vs **302 (every hit reaches you, enables analytics)** — classic trade-off interviewers love.

**Bottlenecks / what they probe:** collision handling under concurrency; cache stampede on a viral link (use request coalescing); hot-key for one mega-popular short code (replicate that key); 301 vs 302 reasoning.

---

## 3. Distributed rate limiter

**Requirements:** limit N requests / window / key (user/IP/API-key); low added latency (<1ms ideal); accurate enough; works across a fleet of stateless servers. (Deep treatment in `17-rate-limiting-and-load-shedding...md`.)

**Critical decisions:**
1. **Algorithm.**

| Algorithm | Accuracy | Memory | Burst behavior |
|---|---|---|---|
| Fixed window counter | edge bursts (2× at boundary) | tiny | allows 2N at window edge |
| Sliding window log | exact | O(N) per key — expensive | precise |
| Sliding window counter | good approx | tiny | smooths edges |
| Token bucket | allows controlled bursts | tiny | best for APIs |
| Leaky bucket | smooths to constant rate | tiny | shaping/queueing |

Default to **token bucket** (refill rate + capacity) — it's what Stripe/AWS API Gateway use.
2. **Where does the counter live?** Per-node local counters are fast but each node only sees 1/N of traffic → the global limit is N× too loose. Centralize in **Redis** (atomic `INCR`+`EXPIRE`, or a Lua script for token bucket to make it atomic). Trade-off: Redis is now in your hot path (~0.5ms RTT) and a SPOF — mitigate with local approximate counters + periodic sync, accepting slight over-admission.

**Bottlenecks / probes:** the boundary-burst bug of fixed windows; race conditions (must be atomic — Lua/`INCRBY` not read-modify-write); Redis failure mode (fail-open vs fail-closed — usually **fail-open** so a Redis outage doesn't take down your whole API); clock skew across nodes; distributed accuracy vs latency.

---

## 4. News feed (Twitter/Instagram timeline)

**Requirements:** users follow others; home timeline = recent posts from followees, newest-first; read-heavy; low feed-load latency; eventual consistency OK (a post appearing 2s late is fine).

**Critical decision — fan-out on write vs read:**

```
 FAN-OUT ON WRITE (push)            FAN-OUT ON READ (pull)
 post → write to each follower's    post → store once
        precomputed feed cache      read → gather from all
 read  → O(1) read own feed                followees at query time
 fast reads, costly writes          cheap writes, costly reads
 celebrity = 100M cache writes!     fine for celebrities
```

| | Fan-out on write | Fan-out on read | Hybrid (real answer) |
|---|---|---|---|
| Read latency | very low | high (scatter-gather) | low |
| Write amplification | huge for big accounts | none | bounded |
| Best for | most users | celebrities | everyone |

**The senior answer is hybrid:** push for normal users; for accounts with millions of followers, *don't* fan out — pull their recent posts at read time and merge into the precomputed feed. Twitter's "timeline" famously evolved exactly this way.

**Mechanics:** feeds live in Redis lists/sorted-sets (by timestamp/score), capped at ~800 entries. Posts in Cassandra/sharded store. Write path enqueues fan-out jobs to Kafka → workers update follower feeds asynchronously.

**Bottlenecks / probes:** celebrity fan-out (the headline question — *always* raise it); ranking (chronological vs ML-ranked changes everything); thundering-herd on a viral post; feed staleness; storage of duplicated feed entries.

---

## 5. Chat / messaging (WhatsApp)

**Requirements:** 1:1 and group messaging; real-time delivery; delivery + read receipts; online presence; ordering within a conversation; offline message storage; ~billions of messages/day.

**Critical decisions:**
1. **Connection model.** Need server→client *push*, so **persistent WebSocket** (or MQTT, which WhatsApp uses — low overhead, great on mobile). One server holds millions of long-lived connections. A **session/connection registry** (Redis: `user_id → gateway_server`) lets sender's gateway route to recipient's gateway.

```
 A ──ws──► Gateway1 ──► [route via Redis: B is on Gateway2]
                          │
                          ▼
 B ◄──ws── Gateway2 ◄── Message Service (persist → ack)
```

2. **Delivery + ordering.** Persist before ack ("stored"). Per-conversation **sequence numbers** (not wall-clock — clocks skew) give ordering. Offline → store and push via APNs/FCM when the device reconnects. Receipts are just more messages (sent/delivered/read state).
3. **Group fan-out.** Small groups: write to each member. Large groups (WhatsApp caps ~1024) bounds the blast radius — that cap *is* the design decision.

**Bottlenecks / probes:** connection state at scale (graceful failover when a gateway dies — clients reconnect, re-register); exactly-once vs at-least-once delivery (you get at-least-once + idempotent message IDs → client dedups); ordering guarantees; end-to-end encryption (Signal protocol — server can't read, so no server-side search); presence at billions (heartbeats are expensive — debounce/approximate).

---

## 6. Ride-sharing — nearby drivers (Uber/Lyft)

**Requirements:** drivers send location every few seconds; rider requests → find nearby available drivers fast; match; low latency on "find nearby" (<200ms); millions of location updates/sec.

**Critical decision — geospatial indexing:** you can't `WHERE distance < r` over millions of points per query. Encode location into a **searchable cell**:

| Technique | Idea | Used by |
|---|---|---|
| Geohash | recursively bisect lat/lon → string prefix = proximity | Redis `GEO*`, many |
| Quadtree | tree of subdivided quadrants, denser where busier | classic |
| Google S2 | sphere → Hilbert curve cells (handles poles, no edge distortion) | Google, Uber early |
| Uber H3 | hexagonal grid (uniform neighbor distance) | Uber today |

Nearby query = "find all drivers whose cell ∈ {my cell + neighbors}." Hexagons (H3) win because all 6 neighbors are equidistant, unlike squares (diagonal vs edge).

**Second decision — the write storm.** Millions of drivers × update every 4s = millions of writes/sec. Don't hammer a DB. Keep the live location index **in memory** (sharded by region), updated continuously; persist a sampled trail separately. Shard the geo index **by region**, not by driver ID, so a nearby query hits one shard.

**Bottlenecks / probes:** hotspot cities (downtown SF at rush hour — one cell is overloaded; subdivide adaptively / quadtree depth); update frequency vs accuracy vs cost; matching consistency (two riders shouldn't get the same driver — short-lived lock / dispatch queue); cell-boundary edge case (driver just across a cell line is "nearby" but in a different cell — must query neighbors).

---

## 7. File storage & sync (Dropbox / Google Drive)

**Requirements:** upload/download files; sync across devices; share; versioning; handle large files; bandwidth-efficient sync; ~strong-ish consistency on metadata.

**Critical decisions:**
1. **Chunking + dedup.** Split files into ~4 MB **content-addressed chunks** (hash = ID). Benefits: resumable uploads, parallel transfer, and **dedup** (same chunk stored once globally — huge savings). Edit a 1 GB file → only changed chunks re-upload (delta sync).
2. **Split metadata from blobs.** Metadata (file tree, chunk list, versions, permissions) in a **strongly-consistent** store (sharded SQL / Spanner). Chunks in **object storage** (S3) behind a CDN. The metadata service is the brain; blob storage is the muscle.

```
 Client ─chunks→ Block servers → S3 (content-addressed)
   │
   └─metadata→ Metadata DB (file tree, version vector)
                  │
 other device ◄── notification (poll/long-poll/push) → pull new chunks
```

3. **Sync protocol.** Client watches local FS, computes diffs, pushes changed chunks + new metadata version. Other devices get notified and pull. **Conflict resolution** when two devices edit offline: version vectors detect the conflict; resolve by keeping both ("file (conflicted copy)") — Dropbox's actual choice, because silent auto-merge of binaries is dangerous.

**Bottlenecks / probes:** dedup hashing cost; small-file overhead (chunking wastes on tiny files); conflict resolution semantics; consistency of metadata vs eventually-consistent blobs; bandwidth (delta sync, compression); large-file resumability.

---

## 8. Video streaming (YouTube / Netflix)

**Requirements:** upload + transcode; stream to any device/bandwidth; massive read scale; low startup latency + no rebuffering; store petabytes.

**Critical decisions:**
1. **Transcoding pipeline (write path).** Upload → object storage → **fan-out transcode jobs** (queue + worker fleet) producing many resolutions/codecs (240p…4K, H.264/VP9/AV1) and **segmenting** into ~2–10s chunks for adaptive streaming. Transcoding is embarrassingly parallel and the expensive part — split each video into segments and transcode segments in parallel across the fleet.
2. **Adaptive Bitrate Streaming (read path).** **HLS/DASH**: the player fetches a manifest listing segments at multiple bitrates, then *picks the bitrate per segment* based on measured bandwidth — drop to 480p mid-stream rather than rebuffer. This client-side logic is the heart of "no buffering."
3. **CDN is the whole game.** 99%+ of bytes served from edge caches near users (or ISP-embedded boxes — **Netflix Open Connect**). Origin only sees cache misses. This is what makes petabyte-scale, low-latency streaming economical.

```
 Upload → S3 → [transcode workers] → segments+manifests → S3 (origin)
                                                              │
 Viewer player ◄── ABR (HLS/DASH) ◄── CDN edge ◄── origin (on miss)
```

**Bottlenecks / probes:** transcode throughput & cost; CDN cache hit ratio and warming for a brand-new viral video (origin shielding / tiered cache); ABR algorithm trade-offs (aggressive quality vs rebuffer risk); storage tiering (cold archive for the long tail); thumbnail/preview generation.

---

## 9. Notification system (push / email / SMS)

**Requirements:** send across channels (push/email/SMS/in-app); high throughput, bursty; user preferences & opt-outs; retries; no duplicate spam; some priority tiers.

**Critical decisions:**
1. **Queue-decoupled pipeline.** Producers publish events → a **message queue** (Kafka/SQS) → channel-specific workers call providers (APNs/FCM, SES/SendGrid, Twilio). Decoupling absorbs bursts and isolates a slow provider from the rest.

```
 Services → Notification API → Kafka → [push worker]   → APNs/FCM
                                  ├──► [email worker]  → SES
                                  └──► [sms worker]    → Twilio
                              preferences + dedup + rate-limit check
```

2. **Idempotency + dedup.** At-least-once queues mean retries → duplicates. Attach an idempotency/notification key; check a dedup store (Redis with TTL) before sending. Critical: an SMS billed twice or a duplicate "your code is X" is a real incident.
3. **Preferences, throttling, DLQ.** Respect opt-outs and per-user rate caps *before* sending. Failed sends → retry with backoff → **dead-letter queue** after max attempts (never silently drop a payment receipt).

**Bottlenecks / probes:** third-party provider failures/rate limits (circuit breaker + failover provider); dedup correctness; priority (a 2FA code must jump the marketing queue — separate high-priority topic); fan-out for "notify all users" (batch + throttle, don't melt the providers).

---

## 10. Distributed cache (Memcached / Redis Cluster)

**Requirements:** sub-ms reads; scale beyond one machine's RAM; high hit ratio; tolerate node failures; (see `12-caching...md`).

**Critical decisions:**
1. **Sharding via consistent hashing.** Naive `hash(key) % N` remaps *almost everything* when N changes → mass cache miss → DB meltdown. **Consistent hashing** (hash ring + virtual nodes) moves only ~1/N keys when a node joins/leaves. This is *the* answer interviewers want.

```
 Ring:  ...─[vnode A]─key1─[vnode B]─key2─[vnode C]─... (wrap)
 key → first vnode clockwise. Add node D → only keys
 between its predecessor and D move. Virtual nodes even out load.
```

2. **Eviction + invalidation.** LRU/LFU eviction; write policy (write-through vs write-back vs **cache-aside**, the default). Invalidation is "one of the two hard problems" — prefer short TTL + cache-aside over trying to keep cache perfectly in sync.
3. **Failure & stampede protection.** Replicas for availability (Redis Cluster: primary+replica per shard). **Cache stampede** when a hot key expires → thousands of concurrent DB reads; fix with request coalescing (single-flight), staggered TTL (jitter), or background refresh.

**Bottlenecks / probes:** hot key (one key > one node's capacity — replicate the key or client-side cache it); rebalancing cost; consistency between cache and source of truth; thundering herd; memory fragmentation; cold-start warming.

---

## 11. Payment system

**Requirements:** charge/refund; **correctness over availability** (never double-charge, never lose money); idempotency; audit trail; integrate external gateways; reconciliation; PCI scope.

**Critical decisions:**
1. **Idempotency is non-negotiable.** Network retries must not double-charge. Client sends an **idempotency key**; server records (key → result) and returns the *same* result on replay. Stripe's API is built around this — interviewers expect you to raise it unprompted.
2. **Money is a state machine + ledger, not a column update.** Model payment as states (`initiated → pending → succeeded/failed → refunded`) and record an **immutable double-entry ledger** (every movement = balanced debit+credit). You *reconstruct* balances from the ledger; you never mutate a balance in place. This gives auditability and dispute resolution.

```
 created → authorized → captured → settled
    │          │            └──► refunded
    └──► failed ◄───┘ (each transition = ledger entry, append-only)
```

3. **Consistency over availability + reliable async.** This is a **CP** system — refuse a payment rather than risk a wrong one. Coordinate the local DB write and the external gateway call: don't trust a "fire and call gateway" path. Use the **Transactional Outbox** pattern (write intent + outbox row in one DB tx, a relay publishes to the gateway/queue) or a **Saga** for multi-step flows, with compensating actions (auto-refund) on partial failure. **Reconciliation** jobs compare your ledger to the gateway's daily report to catch drift.

**Bottlenecks / probes:** exactly-once semantics (you get at-least-once + idempotency keys → effectively-once); the dual-write problem (DB succeeds, gateway times out — was it charged? → outbox/saga + reconciliation); consistency model (why CP, not AP); audit/compliance (immutable ledger); currency/rounding (integer minor units, never floats); webhook handling (idempotent + signature-verified).

---

## 12. Common pitfalls / war stories

- **Jumping to tech before requirements.** "Let's use Kafka" before knowing read:write ratio. Interviewers read this as cargo-culting. Derive the tech *from* the numbers.
- **No back-of-envelope math.** Skipping estimation means you can't justify sharding. A candidate who *computes* 365 TB and *then* shards reads as senior; one who shards "because big data" does not.
- **Forgetting the celebrity / hot-key case.** Feed fan-out, a viral short URL, a hot cache key — uniform-load assumptions are the #1 production surprise. Always ask "what's the skew?"
- **`hash % N` for sharding.** Adding one node remaps everything → cache miss storm → DB falls over. Real outage pattern; consistent hashing exists for exactly this.
- **Dual-write with no outbox.** "Update DB, then publish to Kafka" — the process dies between the two and the system is now inconsistent forever. This is *the* distributed-systems bug. Use outbox or CDC.
- **Treating at-least-once as exactly-once.** Queues redeliver. No idempotency key → duplicate emails, double charges, double inventory decrements. (See the project's own recurring "silent-lie" and idempotency bug classes.)
- **Synchronous fan-out in the request path.** Doing 1,000 follower-feed writes inside the POST request → tail latency explodes. Push it to a queue.
- **No load shedding / fail-open vs fail-closed decision.** A rate-limiter or auth dependency goes down and you never decided whether to fail open (let traffic through) or closed (block) — so it does the wrong thing under pressure. Decide *per dependency*, on purpose.
- **Ignoring the "what if it fails" question.** Every box you draw can crash. If you can't say what happens when each one dies, you haven't finished the design.

---

## 13. Test yourself

1. You compute 50:1 read:write at 100M DAU. Name three concrete design moves that ratio dictates. *(Hint: cache, read replicas, optimize/precompute the read path.)*
2. Why does a URL shortener that uses `hash(url) % num_shards` fall over when you add a shard, and what fixes it? *(Hint: mass remap → consistent hashing.)*
3. When is fan-out-on-read *better* than fan-out-on-write, and what's the hybrid rule? *(Hint: celebrities; push for normal users, pull for huge accounts.)*
4. A token-bucket rate limiter uses Redis `GET` then `SET`. What's the bug and the fix? *(Hint: read-modify-write race → atomic Lua/`INCR`.)*
5. Why split metadata from blobs in Dropbox, and which gets the strongly-consistent store? *(Hint: brain vs muscle; metadata = SQL/Spanner, chunks = S3.)*
6. Your payment service writes to its DB then calls the gateway; the process crashes in between. What pattern prevents the resulting inconsistency? *(Hint: transactional outbox / saga + reconciliation.)*
7. Why does Uber prefer H3 hexagons over a square geohash grid for nearby-driver queries? *(Hint: equidistant neighbors; uniform distance vs square's diagonal-vs-edge problem.)*
8. A hot cache key gets more traffic than a single node can serve. Consistent hashing doesn't help — why, and what does? *(Hint: it's one key, not key distribution; replicate the key / client-side cache.)*

---

## 14. Further reading

- **Alex Xu, *System Design Interview* Vol. 1 & 2** — the canonical compact walkthroughs for most of these case studies.
- **Martin Kleppmann, *Designing Data-Intensive Applications* (DDIA)** — Ch. 5–6 (replication/partitioning), Ch. 7 (transactions), Ch. 9 (consistency/consensus), Ch. 11 (stream processing/outbox). The theory under every case here.
- **DynamoDB paper** (Amazon, 2007) — consistent hashing, quorums, eventual consistency.
- **Google Spanner paper** — strong consistency + TrueTime, relevant to payments/metadata.
- **Twitter "Timelines at Scale"** talks — fan-out hybrid in production.
- **Uber Engineering blog: H3** — hexagonal geospatial indexing.
- **Stripe API docs: Idempotent Requests** — the reference idempotency-key design.
- **Netflix Open Connect** docs — CDN/edge strategy for video at scale.
- **"Jeff Dean — Numbers Everyone Should Know"** — the latency table to memorize.
- Sibling modules: `09-cap-pacelc...md`, `10-replication-and-partitioning...md`, `12-caching...md`, `14-message-queues-and-streaming...md`, `15-consensus...md`, `17-rate-limiting-and-load-shedding...md`.
