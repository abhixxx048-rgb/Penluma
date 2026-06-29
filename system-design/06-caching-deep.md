# 06 — Caching Deep Dive

**What you'll learn.** How caching actually buys you latency and throughput (locality, the 80/20 rule, and the latency math from `01-foundations-and-estimation.md`), the full stack of cache layers from browser to DB buffer pool, every major caching pattern and eviction policy with real implementation detail, and the four classic distributed-cache failure modes (stampede, hot keys, penetration, avalanche) with the mitigations real systems ship. By the end you should be able to design a cache tier, reason about its consistency, and survive an interview question on "why did your cache make the outage worse."

**Prerequisites.** Read `01-foundations-and-estimation.md` first — you need the latency numbers and back-of-envelope math. `08-replication-and-partitioning.md` helps for the consistent-hashing section (sharding the cache is the same problem as sharding a database). `09-cap-pacelc-consistency-models.md` deepens the cache↔DB consistency discussion.

---

## 1. Why caching works: locality, 80/20, and latency math

A cache is a small, fast store that holds a copy of data whose authoritative home (the "origin" or "backing store") is large and slow. It pays off only because real workloads are **non-uniform**:

- **Temporal locality** — data accessed now is likely accessed again soon (a trending product, a logged-in user's profile).
- **Spatial locality** — data near accessed data is likely accessed too (the next rows of a result set, adjacent pixels of a tile).
- **The 80/20 / Zipfian rule** — in most web workloads a small fraction of keys serve the large majority of requests. Page views, product reads, and search queries follow a Zipf distribution: rank-1 is roughly twice as popular as rank-2, three times rank-3, etc. This is *why* a cache holding 5–20% of your keys can serve 90%+ of reads.

### The latency math (tie-back to 01)

Recall the orders-of-magnitude ladder from `01`:

```
L1 cache reference .................... ~1 ns
Main memory reference ................. ~100 ns
Redis GET over LAN (RTT + processing) . ~0.2–1 ms
SSD random read ...................... ~100 µs
Postgres indexed point query ......... ~1–10 ms
Cross-region round trip .............. ~50–150 ms
```

A cache replaces a 1–10 ms DB query (often several, plus app-server CPU and connection-pool wait) with a sub-millisecond memory lookup. The **effective average latency** is governed by the hit ratio:

```
T_avg = H · T_hit + (1 − H) · (T_miss + T_fill)
```

where `H` is hit ratio, `T_hit` ~ 0.3 ms (Redis), `T_miss` ~ 5 ms (DB), `T_fill` ~ negligible. Plug in numbers — notice how the **tail** is dominated by misses, and how the *last few percent* of hit ratio matter enormously:

| Hit ratio H | T_avg (T_hit=0.3ms, T_miss=5ms) | DB load vs no cache |
|---|---|---|
| 0%  | 5.0 ms | 100% |
| 50% | 2.65 ms | 50% |
| 90% | 0.77 ms | 10% |
| 95% | 0.535 ms | 5% |
| 99% | 0.347 ms | **1%** |
| 99.9% | 0.305 ms | 0.1% |

The killer insight: going from 95% → 99% halves average latency *and* cuts DB load 5×. Going from 99% → 99.9% barely moves latency but cuts DB load another 10×. **The point of a high hit ratio is often DB-load protection, not user latency.** This is also why a cache that *drops* from 99% to 90% during an incident can cause a **10× origin load spike** — the origin was provisioned for 1% of traffic. That is the seed of cache avalanche (§7).

---

## 2. The cache layers

Caching is not one box; it's a stack, each layer absorbing what the layer above missed. Numbers are typical.

```
┌─────────────────────────────────────────────────────────┐
│ 1. CLIENT / BROWSER       HTTP cache, Service Worker      │  ~0 ms, free
│    Cache-Control, ETag, localStorage                       │  scope: 1 user
├─────────────────────────────────────────────────────────┤
│ 2. CDN / EDGE             Cloudflare, Fastly, Akamai,     │  ~10–30 ms
│    Varnish, CloudFront — caches HTML/JSON/assets near user │  scope: a POP region
├─────────────────────────────────────────────────────────┤
│ 3. APPLICATION / IN-PROCESS   per-instance LRU map,        │  ~0.001 ms (ns–µs)
│    Caffeine (JVM), array/APCu (PHP), in-memory dict        │  scope: 1 app instance
├─────────────────────────────────────────────────────────┤
│ 4. DISTRIBUTED CACHE      Redis, Memcached cluster         │  ~0.2–1 ms
│    shared across all app instances                         │  scope: whole fleet
├─────────────────────────────────────────────────────────┤
│ 5. DATABASE BUFFER POOL   Postgres shared_buffers,         │  ~0.01–0.1 ms (RAM)
│    InnoDB buffer pool, OS page cache                       │  hidden, automatic
├─────────────────────────────────────────────────────────┤
│ 6. ORIGIN / DISK          actual table on SSD              │  ~0.1–10 ms
└─────────────────────────────────────────────────────────┘
```

Each layer trades **coherence for speed and scope**. The browser cache is fastest but only one user and easily stale; the distributed cache is shared and authoritative-ish but a network hop away; the DB buffer pool is invisible but is the reason an "uncached" query is sometimes still fast (the rows are already in RAM). A common interview trap: someone "adds Redis" in front of a query that was already 100% served from the Postgres buffer pool — they added a network hop and won nothing. Always measure where the time actually goes.

**Designing the stack:** push caching as far up and out as the consistency budget allows. Static assets → CDN with year-long TTL + content-hash filenames. Personalized HTML → edge with short TTL or `private`. Hot read-mostly objects → distributed cache. Per-request-repeated lookups → in-process. In Print-Flow-360 terms, this maps directly to `readme/STOREFRONT_CACHE_GUIDE.md` (CacheService TTLs) and the Nitro route-rule cache in `frontstore/nuxt.config.ts` — note the rule there that private routes (`/cart`, `/checkout`) must stay `no-store`, which is exactly layer-1/2 correctness.

---

## 3. Caching patterns (read & write)

The pattern decides *who* fills the cache, *who* writes the DB, and *what consistency* you get. This is the most-asked design topic.

### 3.1 Cache-aside (lazy loading) — the default

The application owns the logic. The cache is a dumb store.

```
READ:
  app ──GET key──▶ cache
        miss
  app ──SELECT───▶ DB ──row──▶ app
  app ──SET key, TTL──▶ cache      (populate on miss)
  return row

WRITE:
  app ──UPDATE───▶ DB
  app ──DEL key──▶ cache           (invalidate, don't update)
```

- **Pros:** simple; cache holds only what's actually read; cache failure ≠ data loss (DB is truth); works with any cache.
- **Cons:** first read of any key is a miss (cold cache); you own invalidation; a race window exists (see §8).
- **Used by:** almost everyone. Facebook's memcache (the *Scaling Memcache at Facebook* paper) is cache-aside with `delete` on write.

> **Why DEL not SET on write?** Updating the cache on write seems efficient but creates a nasty stale-write race (two concurrent writers can interleave SET-cache and UPDATE-db so the cache ends with the *older* value). Deleting is idempotent and lets the next reader repopulate from the source of truth. "Invalidate, don't update" is the safe default.

### 3.2 Read-through

Same read shape as cache-aside, but the cache *library/provider* does the DB load behind a loader function, so the app just calls `cache.get(key)`. Encapsulates the miss logic (good for consistency across call sites; e.g. Caffeine `LoadingCache`, AWS DAX for DynamoDB).

### 3.3 Write-through

Every write goes to the cache, which synchronously writes the DB before returning.

```
WRITE:  app ──SET──▶ cache ──UPDATE (sync)──▶ DB ──ok──▶ cache ──ok──▶ app
```

- **Pros:** cache always consistent with DB; reads after write are guaranteed warm.
- **Cons:** every write pays cache + DB latency; caches data that may never be read (write-heavy, read-rare data wastes cache memory). Often paired with read-through.

### 3.4 Write-behind / write-back

Write to cache, acknowledge immediately, flush to DB asynchronously (batched/coalesced).

```
WRITE:  app ──SET──▶ cache ──ack──▶ app
                       │ (async, batched)
                       ▼
                      DB
```

- **Pros:** lowest write latency, absorbs write bursts, coalesces many writes to one key into one DB write (great for counters, view-counts, leaderboards).
- **Cons:** **data-loss window** if the cache node dies before flush; complex ordering/consistency; the DB temporarily lags. Use only where some loss is tolerable or the cache is durable (Redis AOF, or a WAL in front).

### 3.5 Refresh-ahead

Proactively refresh popular keys *before* they expire, so reads never hit a cold key. Predicts hot keys (or refreshes the top-N by access). Reduces tail latency for predictable hot data; wasteful and wrong for low-locality data. Closely related to probabilistic early expiration (§7).

### Comparison

| Pattern | Read path | Write path | Consistency | Write latency | Best for | Risk |
|---|---|---|---|---|---|---|
| **Cache-aside** | app loads on miss | DB then DEL cache | eventual, small race window | DB only | general read-mostly (the default) | cold-start misses; you own invalidation |
| **Read-through** | provider loads on miss | (usually + write-through) | eventual | — | uniform encapsulated access | provider lock-in |
| **Write-through** | warm after write | cache → DB sync | strong (cache=DB) | cache + DB | read-after-write critical | slow writes; caches cold data |
| **Write-behind** | warm | cache → DB async | eventual, lag | cache only (fast) | counters, bursty writes, leaderboards | **data loss on crash** |
| **Refresh-ahead** | never cold for hot keys | (orthogonal) | eventual | — | predictable hot keys | wasted refresh on cold keys |

---

## 4. Eviction policies

A cache has bounded memory; when full, something must go. The policy decides what.

- **FIFO** — evict oldest-inserted. Ignores access frequency; cheap; usually bad hit ratio. Suffers Bélády's anomaly (more cache can mean fewer hits).
- **LRU (Least Recently Used)** — evict the item not touched for longest. Excellent for temporal locality; the workhorse. Weakness: a one-time scan of many cold keys (a batch job, a crawler) evicts your hot set — "cache pollution" / scan resistance failure.
- **LFU (Least Frequently Used)** — evict the least-accessed. Great for stable popularity; weakness: a key that was hot yesterday stays resident forever ("cache staleness"), and new items struggle to build a count. Needs aging/decay to be practical.
- **TTL** — not really an eviction policy but an expiry: each key dies after a fixed time regardless of memory. Combined with LRU/LFU in practice (Redis: TTL expiry + maxmemory eviction).
- **ARC (Adaptive Replacement Cache)** — keeps two lists (recently used + frequently used) plus "ghost" entries (recently evicted keys with no data) and self-tunes the balance between recency and frequency. Scan-resistant. Patented by IBM (used in ZFS, historically).
- **W-TinyLFU** — modern state of the art (Caffeine's default). A tiny LRU "window" admits new items; a frequency sketch (a Count-Min Sketch with aging — see `15-probabilistic-structures-and-algorithms.md`) decides whether a new candidate is more valuable than the eviction victim. Near-optimal hit ratios with O(1) overhead and tiny metadata. This is what you reach for today if you control the cache library.

### How LRU is actually implemented

Naively, LRU needs O(1) "move to front on access" and O(1) "evict from back." The classic structure is a **hash map + doubly-linked list**:

```
hashmap: key ──▶ node
list (MRU ... LRU):  [A] ⇄ [B] ⇄ [C] ⇄ [D]
                      head            tail
GET(B): map lookup O(1) → unlink B → splice B to head → return value
PUT(X) when full: evict tail (D) → remove from map → insert X at head
```

Every operation is O(1). The doubly-linked list gives O(1) unlink; the map gives O(1) find. This is the canonical "LRU cache" coding-interview problem.

**Real caches cheat for speed.** Redis does **not** keep a perfect global LRU list — that costs memory and a list mutation per access. Instead Redis uses **approximate LRU**: each object stores a 24-bit access timestamp (`lru` field); on eviction Redis samples N random keys (`maxmemory-samples`, default 5) and evicts the oldest of the sample. Higher sample size → closer to true LRU, more CPU. Redis 4.0+ also offers **approximate LFU** (a logarithmic counter with time decay) via `maxmemory-policy allkeys-lfu`. Memcached uses a segmented LRU with per-slab-class lists. The lesson: at scale, *approximate* eviction with bounded sampling beats exact eviction with global bookkeeping.

| Policy | Captures | Weakness | When to use |
|---|---|---|---|
| FIFO | nothing useful | poor hit ratio | almost never |
| LRU | recency | scan pollution | general default, recency-driven workloads |
| LFU | frequency | stale hot keys; cold-start | stable popularity (CDN-like) |
| TTL | freshness | not memory-aware | always, combined with above |
| ARC | recency + frequency, adaptive | complexity, patent | filesystem/page caches |
| W-TinyLFU | recency + frequency, scan-resistant | needs library support | modern app caches (Caffeine) |

---

## 5. Cache invalidation — one of the two hard problems

> "There are only two hard things in Computer Science: cache invalidation and naming things." — Phil Karlton

Invalidation is hard because the cached copy and the source of truth drift, and you must decide *when* and *how* to reconcile, across many readers/writers/layers. Strategies, weakest to strongest:

1. **TTL expiry (passive).** Let entries die after N seconds; accept up to N seconds of staleness. Dead simple, no coordination, the backbone of CDN/HTTP caching. Tune TTL to your staleness budget. The whole art is picking N — and **jittering** it (§7).
2. **Explicit invalidation on write (active).** Cache-aside `DEL key` after the DB write. Precise, but you must enumerate every key derived from the changed data — including *fan-out* keys (a product change invalidates the product page, the category listing, the search index, the homepage rail…). Missing one = a silent stale read.
3. **Versioned / immutable keys.** Embed a version or content hash in the key: `product:42:v17` or `app.a3f9.css`. A write bumps the version; old keys are simply never read again and age out naturally. **No invalidation race at all** — this is the strongest, cheapest technique when you can do it (CDN asset hashing lives here). Cost: you need to propagate the new version to readers.
4. **Write-through / read-through** keep cache and DB in lock-step (§3) — invalidation by construction.
5. **Change-data-capture (CDC) invalidation.** Tail the DB's replication log (Postgres logical decoding, Debezium) and invalidate/refresh cache entries from the authoritative change stream. Decouples invalidation from app code, catches *every* write including out-of-band ones. See `12-messaging-and-event-driven.md` and `14-stream-processing-realtime.md`.

**The fan-out problem is the real killer.** A single product edit might require invalidating dozens of derived caches. Two tactics: (a) **tag/group invalidation** — tag every derived key with `product:42` and flush the tag (Varnish "ban", Cache Tags in many frameworks); (b) **generation keys** — store `gen:category:5 = 88` and build dependent keys as `category:5:g88:...`; bump the generation to invalidate the whole family in O(1) without enumerating keys.

---

## 6. Failure modes that make caches a liability

A cache is a performance optimization that quietly becomes a **load-bearing structural component**: once the DB is provisioned for 1% of traffic (§1), the cache *must not fail*. These four failure modes are the canonical interview material.

### 6.1 Cache stampede / thundering herd

A hot key expires (or a cold cache starts). Many concurrent requests all miss, all hit the DB at once, all recompute the same expensive value, and may all write it back — a self-inflicted load spike that can topple the origin.

```
TIME ─────────────────────────────────────────────────▶
key "homepage" TTL expires at t0
                  ┌── req1 miss ──┐
                  ├── req2 miss ──┤  all 5,000 in-flight requests
   t0 ────────────┼── req3 miss ──┤  miss simultaneously and each
                  ├── ... ────────┤  runs the 200ms DB+render
                  └── reqN miss ──┘
                            ▼
                  DB hit by 5,000 identical expensive queries
                  → DB CPU saturates → latency explodes → more misses
```

**Mitigations:**

- **Request coalescing / single-flight.** Only the *first* misser recomputes; everyone else waits on the same in-flight promise/future. In Go this is `golang.org/x/sync/singleflight`; in a single process it's a per-key lock/promise map; across processes it's a distributed lock (see below). This is the single most important fix.
- **Distributed lock on recompute.** First misser takes a short-lived lock (`SET key:lock val NX EX 10`); others either wait-and-retry or serve stale. Beware lock correctness (see Redlock debate in `10-consensus-and-coordination.md`); a *best-effort* lock that occasionally lets two recompute through is fine here — the goal is "few" not "exactly one."
- **Probabilistic early expiration (XFetch).** Don't wait for hard expiry. Each reader recomputes with a small probability that grows as the entry nears expiry, so *one* lucky reader refreshes the key *before* it expires while it's still being served warm. The classic formula (from Vattani et al., "Optimal Probabilistic Cache Stampede Prevention"):

  ```
  recompute if:  now − delta · beta · ln(rand()) ≥ expiry
  ```
  where `delta` is the measured recompute cost and `beta ≥ 1` tunes eagerness. Elegant because it needs **no locks and no coordination** — it staggers refreshes statistically.
- **Serve-stale-while-revalidate.** Keep the expired value, return it immediately, and refresh in the background (HTTP `stale-while-revalidate`, Nuxt/Nitro SWR, Varnish grace mode). Users never wait on a miss.

### 6.2 Hot keys (the celebrity problem)

One key is *so* popular that the single cache shard holding it saturates its CPU/network even though the rest of the cluster is idle (a viral product, a global config blob, a celebrity's profile). Sharding (§9) doesn't help — every read hashes to the *same* node.

**Mitigations:**

- **Local/in-process cache (L1) in front of the distributed cache (L2).** Each app instance caches the hot key locally with a short TTL (1–5 s), so the shard sees `#instances` requests/sec, not `#users`. This is the most common fix and exactly the layered stack in §2. Accept tiny extra staleness.
- **Key splitting / replication.** Store N copies `cfg:0..cfg:9`, readers pick a random suffix → load spreads across N shards. Writes must update all N.
- **Read replicas of the cache** (Redis replicas) for read fan-out.

### 6.3 Cache penetration

Requests for keys that **don't exist anywhere** (random/garbage IDs, a malicious scraper hitting `user:99999999`). Every such request misses the cache *and* misses the DB, so the cache provides zero protection and the DB takes the full hit.

**Mitigations:**

- **Negative caching.** Cache the "not found" result too (`user:99999999 = NULL`, short TTL). Now repeat lookups for the same bad key are absorbed. Watch memory if the bad keys are unique each time.
- **Bloom filter.** Keep a Bloom filter (see `15-probabilistic-structures-and-algorithms.md`) of all valid keys in memory; before hitting cache/DB, test the filter — if it says "definitely not present," reject in O(1) without touching the DB. No false negatives means you never wrongly reject a real key; the small false-positive rate just means a few bad keys slip through to the DB. This is the standard defense against ID-enumeration attacks.

### 6.4 Cache avalanche

Many keys expire *at the same instant* (e.g. you warmed the whole cache at deploy time with identical TTLs, or the entire Redis cluster restarts), so a huge swath of traffic falls through to the DB simultaneously → origin collapse. The macro version of a stampede.

**Mitigations:**

- **Jittered TTLs.** Never use a fixed TTL; add randomness: `ttl = base + rand(0, base·0.1)`. Spreads expiry over a window so misses don't synchronize. (This is the cheap fix you should *always* apply, by default.)
- **Multi-level caching + serve-stale** so a Redis outage degrades to L1/stale, not to the DB.
- **Circuit breaker + request shedding at the origin** (see `16-rate-limiting-and-resiliency.md`) — when the DB is overloaded, shed/queue rather than pile on.
- **Cache warming / staggered restart** so a cold cluster repopulates gradually behind a rate-limited backfill.

| Failure | Trigger | Primary fix | Secondary |
|---|---|---|---|
| Stampede | one hot key expires, many concurrent misses | single-flight / lock | XFetch, stale-while-revalidate |
| Hot key | one key far hotter than others | L1 local cache | key splitting, replicas |
| Penetration | requests for non-existent keys | bloom filter | negative caching |
| Avalanche | mass simultaneous expiry / cache outage | jittered TTL | multi-level, circuit breaker, warming |

---

## 7. Putting it together: a robust read path

Production read paths combine several of the above. A battle-tested cache-aside read for a hot, expensive object looks like:

```
get(key):
  v = L1.get(key)                         # in-process, ns
  if v: return v
  v = redis.get(key)                      # distributed, ~0.5ms
  if v:
     L1.set(key, v, ttl=2s)               # absorb hot keys (§6.2)
     if should_early_refresh(v):          # XFetch (§6.1)
        background_refresh(key)
     return v
  if not bloom.maybe_contains(key):       # penetration guard (§6.3)
     return NOT_FOUND
  if redis.set(lock, 1, NX, EX=5):        # single-flight (§6.1)
     v = db.load(key)                      # ~5ms
     redis.set(key, v or NULL_SENTINEL,    # negative caching (§6.3)
               ttl = base + jitter())      # avalanche guard (§6.4)
     redis.del(lock)
     return v
  else:
     sleep(20ms); return get(key)          # wait for the leader's fill
```

Every line maps to a §6 mitigation. That density is the point — a "cache" in a senior design is this whole assembly, not `Cache::remember()`.

---

## 8. Write consistency between cache and DB (the dual-write problem)

You are writing to *two* stores (cache + DB) without a transaction spanning them. Any interleaving can leave the cache stale. Classic race with cache-aside "DEL on write":

```
T1 (read, key cold)        T2 (write)
  miss
  SELECT → v_old
                            UPDATE → v_new
                            DEL key            ← deletes nothing (key absent)
  SET key = v_old          ← writes STALE value, no TTL bound until expiry
```

Now the cache serves `v_old` until TTL. Mitigations, roughly increasing strength:

- **Always set a TTL** so any stale write self-heals in bounded time (the pragmatic 80% fix).
- **Delete after the DB commit, not before**, and consider **delayed double-delete**: `DEL key` now, then `DEL key` again after a short delay (e.g. 500 ms) to clobber any racing stale repopulation.
- **Version/CAS** the cached value (store `(value, version)`; only overwrite if your version ≥ stored) so a late stale SET can't win.
- **Write-through** to remove the dual-write entirely (one write path), at write-latency cost.
- **CDC-driven invalidation** (§5.5): the cache is invalidated *from the commit log*, so it can't drift from committed state and out-of-band writes are covered. This is the strongest decoupled answer and ties to `11-distributed-transactions-and-idempotency.md` (the broader dual-write problem) and the outbox pattern.

Note: you cannot get *strong* read-your-writes through a remote cache without either write-through or read-from-primary-on-recent-write. See `09-cap-pacelc-consistency-models.md` — a cache is an explicitly eventually-consistent replica.

---

## 9. Distributed caching and consistent hashing

One cache node isn't enough RAM or throughput, so you shard keys across N nodes. The naive map is `node = hash(key) % N`. The catastrophe: **change N (add/remove a node) and almost every key remaps**, so nearly the entire cache misses at once → instant avalanche (§6.4).

**Consistent hashing** fixes this. Map both nodes and keys onto a hash ring `[0, 2³²)`. A key belongs to the first node clockwise from its hash. Adding/removing a node only remaps the keys in *one arc* — on average `K/N` keys move, not all of them.

```
        node A (h=10)
       /            \
  key z              key a → A
   ↑                  ↑
  node D (h=300) ───  ring (0..2^32) ─── node B (h=120)
       \            /
        node C (h=210)     key m (h=150) → C (next clockwise)

Add node E at h=140 → only keys in (120,140] move from C to E.
Everything else stays put.
```

Real systems use **virtual nodes** (each physical node placed at many ring positions, e.g. 100–200 vnodes) to smooth out uneven arc sizes — otherwise three random points on a ring give wildly unequal load. Consistent hashing powers Memcached client libraries (ketama), DynamoDB, Cassandra, and CDN request routing. The detailed treatment (and alternatives like rendezvous/HRW hashing, and bounded-load consistent hashing) is in `08-replication-and-partitioning.md`. Memcached deliberately keeps sharding **client-side** (nodes don't know about each other — "no central coordination"); Redis Cluster shards server-side via 16,384 hash slots assigned to nodes.

---

## 10. Redis vs Memcached

Both are in-memory key-value stores reached over the network. They diverge sharply beyond `GET`/`SET`.

| Dimension | Memcached | Redis |
|---|---|---|
| Data model | opaque string/blob values only | rich types: strings, hashes, lists, sets, sorted sets, streams, bitmaps, HyperLogLog, geo, bitfields |
| Threading | **multi-threaded** (scales on many cores per node) | mostly **single-threaded** command exec (I/O threads in 6+); simpler, no data races, predictable |
| Persistence | none (pure cache) | optional RDB snapshots + AOF log → survives restart |
| Replication / HA | none built-in (client-side sharding) | replicas, Sentinel failover, Redis Cluster |
| Eviction | slab LRU | LRU/LFU/random/TTL, approximate (§4), per-policy |
| Memory efficiency | slab allocator, very low per-item overhead; great for many small uniform items | more per-key overhead, but specialized encodings (ziplist/listpack, intset) for small collections |
| Atomic ops | CAS, incr/decr | huge atomic command set + Lua scripts + transactions (MULTI/EXEC) + functions |
| Pub/Sub, queues, locks | no | yes (Pub/Sub, Streams, sorted-set queues, Redlock) |
| Max value size | 1 MB default | 512 MB |
| Best when | pure, simple, multi-core, throughput-max look-aside cache; huge fleet of tiny items (Facebook) | you need data structures, persistence, HA, atomic server-side logic, or cache + lightweight datastore in one |

**Rule of thumb:** if all you need is a fast look-aside string cache and you want to saturate many cores per node, Memcached is leaner and simpler. If you need anything richer — rate limiters, leaderboards, sessions that survive restart, queues, locks, atomic counters — Redis. Most teams default to Redis today for the Swiss-army-knife value, accepting its single-threaded ceiling (which you scale past via Cluster or sharding).

---

## 11. Redis advanced data structures & tricks

Why Redis wins designs: it moves logic *to the data*, atomically, server-side.

- **Sorted sets (ZSET)** → leaderboards (`ZADD`/`ZREVRANGE`), priority queues, time-windowed rate limiters (`ZADD ts`, `ZREMRANGEBYSCORE` to drop old, `ZCARD` to count — the sliding-window limiter in `16-rate-limiting-and-resiliency.md`), and "schedule by score = run-at-timestamp."
- **Hashes** → store an object's fields without serializing the whole blob; `HINCRBY` one field atomically. Small hashes use a compact listpack encoding (very memory-efficient).
- **HyperLogLog** (`PFADD`/`PFCOUNT`) → count unique visitors in ~12 KB with ~0.81% error regardless of cardinality (see `15-probabilistic-structures-and-algorithms.md`).
- **Bitmaps / `SETBIT`** → daily active users, feature flags per user-id, retention grids — 1 bit per user.
- **`INCR`/`DECR`** → atomic counters; the building block of fixed-window rate limiting and write-behind view counters.
- **Lua scripts / Functions** → execute multi-step read-modify-write atomically server-side (e.g. check-and-decrement inventory, token-bucket refill) with no round-trip races. The server runs it as one unit (single-threaded = effectively serializable).
- **`SET key val NX EX 10`** → the one-liner distributed lock / single-flight primitive (mind correctness caveats; `10-consensus-and-coordination.md`).
- **Streams (`XADD`/consumer groups)** → a lightweight Kafka-like log with at-least-once delivery and acks (`12-messaging-and-event-driven.md`).
- **Pipelining** → batch many commands in one round trip; turns N × RTT into 1 × RTT (huge for the LAN-latency-bound case). Combine with `MGET`/`MSET` for multi-key reads.
- **`EXPIRE`/`PEXPIRE` + lazy + active expiry** → Redis expires keys both lazily (on access) and via a background sampler; this is why you set TTLs liberally.

---

## 12. Common pitfalls / war stories

- **The cache that became the database.** Team set Redis `maxmemory-policy noeviction` and stored the *only* copy of session data with no persistence. A node restart logged out every user mid-checkout. Lesson: a cache is disposable by definition; if losing it hurts, it's a datastore — give it persistence/replication and treat it as such.
- **The TTL avalanche after deploy.** A nightly job warmed the whole product catalog into Redis at 02:00 with a uniform 6-hour TTL. At 08:00 — peak traffic — every key expired in the same minute and the DB fell over. Fix was one line: jitter the TTL. (§6.4)
- **The Postgres-buffer-pool illusion.** Engineers "added Redis" to speed a query and saw *zero* improvement, because the working set already lived in `shared_buffers` — the network hop to Redis was as slow as the in-RAM index scan. Always profile *where* the latency is before adding a layer (§2).
- **The fan-out miss.** A price edit invalidated `product:42` but not the cached category listing and homepage rail that embedded the old price — customers saw stale prices for 24 h. Caching derived/aggregate views needs tag or generation invalidation, not per-object DEL (§5). (This is also the "silent-lie" failure class the project CLAUDE.md warns about, surfacing through the cache layer.)
- **The hot config key.** A global feature-flag blob in Redis read on every request pinned one shard's CPU at 100% while the cluster idled. A 2-second in-process L1 cache dropped that shard's traffic 1000× (§6.2).
- **Update-on-write stale race.** A write path did `SET cache=newval` instead of `DEL cache`; under concurrency the cache occasionally pinned the *old* value indefinitely (§3.1, §8). Switched to delete-with-TTL.
- **`KEYS *` in production.** Someone ran `KEYS prefix:*` to enumerate keys; it's O(N) and blocks Redis's single thread, stalling the whole fleet. Use `SCAN` (cursor-based, non-blocking) always.
- **Caching personalized/private data at a shared layer.** A logged-in user's HTML got cached at the CDN/edge and served to other users. Private routes must be `no-store`/`private` (the exact `frontstore/nuxt.config.ts` rule for `/cart`, `/checkout`).

---

## 🧩 Case Study: Scaling Memcache at Facebook

**The problem.** By the early 2010s Facebook served well over a billion users from a read-dominated social graph — your news feed, friends, profiles. A single page load could fan out to **hundreds or thousands** of distinct data items, and the workload was overwhelmingly read-heavy (reads outnumbered writes by roughly two to three orders of magnitude). At that volume the system fielded on the order of **billions of memcache requests per second** across the fleet, with individual leaf nodes handling on the order of a million ops/sec. No relational database tier could survive that read load directly. The mandate: absorb nearly all reads in RAM, keep latency low enough that a single page assembling thousands of items stayed snappy, and never let the cache tier turn into a load amplifier that toppled MySQL.

**Pattern: cache-aside at scale (§3.1).** Facebook ran the textbook **cache-aside / look-aside** pattern, exactly as described above. On a read, the web server checks memcache; on a miss it loads from MySQL and populates memcache. On a write it updates MySQL and then **deletes** the key — the "invalidate, don't update" rule from §3.1. Deletes are idempotent and avoid the stale-write race; the next reader repopulates from the source of truth. Memcache itself stayed a dumb, fast store; all the logic lived in the application, with **client-side consistent hashing** (§9) routing each key to its leaf node (no central coordinator — the Memcached design philosophy from §10).

```
        ┌─────────── Region (cluster of frontends) ───────────┐
 client │  web servers ──get──▶ memcache pool (look-aside)     │
  ─────▶│        │  miss        (consistent-hash routed, §9)    │
        │        └──SELECT──▶ MySQL primary ──row──▶ web ──set──┤
        │  write: UPDATE MySQL ──▶ then DELETE memcache key     │
        └──────────────────────────┬──────────────────────────┘
                                    │ mcsqueal tails MySQL commit log
                                    ▼  → broadcasts deletes
        ┌──────── replica region (read-only) ────────┐
        │  web servers ──get──▶ memcache  (filled from│
        │  local MySQL replica; invalidated by stream) │
        └─────────────────────────────────────────────┘
```

**Pattern: leases for thundering herd + stale reads (§6.1, §8).** A hot key expiring under this fan-out is the classic stampede of §6.1 — thousands of in-flight requests miss at once and dogpile MySQL. Facebook's elegant fix was the **lease**: on a miss, memcache hands exactly one client a 64-bit *lease token* and makes the others wait briefly and retry. Only the lease holder is allowed to recompute and `set` the value — this is **request coalescing / single-flight (§6.1)** implemented inside the cache server itself, no external distributed lock needed. The same lease mechanism *also* solves the dual-write stale-read race from §8: if a `delete` invalidates the key while a recompute is in flight, the outstanding lease token is voided, so the racing `set` of a now-stale value is **rejected**. One primitive kills both the stampede and the stale-set interleaving. They paired this with **stale-while-revalidate**-style behavior (serving a slightly old value while one client refreshes) to keep tail latency flat during refreshes.

**Pattern: regional invalidation (§5).** Facebook ran multiple geographic regions, each a full memcache + MySQL-replica stack fronting a single primary region for writes. A write in the primary had to invalidate caches *everywhere*, or replica regions would serve stale data indefinitely. Doing this from application code is the **fan-out invalidation problem of §5** at planetary scale, and it's fragile (miss one path, get a silent stale read). Their answer is the strongest technique in §5: **CDC-driven invalidation**. A daemon called **`mcsqueal`** tails the MySQL **commit log** and broadcasts the resulting cache deletes out to the memcache tiers — invalidation derived from the authoritative change stream, not from hopeful app code, so even out-of-band writes are covered. Within a region they also used **gutter pools** (a small standby pool that absorbs traffic for keys whose normal leaf node has failed) to stop a single dead node from raining its share of misses onto MySQL — a direct mitigation against the avalanche dynamic of §6.4.

**The trade-off they accepted.** Facebook deliberately chose **best-effort eventual consistency over strong consistency**. The cache↔DB relationship is the explicitly eventually-consistent replica of §8: a delete can be lost, a cross-region replication lag can briefly expose old data, and they accepted a small, bounded staleness window in exchange for being able to serve the read volume at all. As the paper puts it, they optimize to **reduce the *probability* and *duration*** of stale reads rather than eliminate them. They gave up linearizability to keep the read tier in RAM and the latency low — a textbook PACELC "choose latency" call (`09-cap-pacelc-consistency-models.md`).

**Results.** Cache hit ratios sat in the high-90s, so MySQL saw only a tiny fraction of read traffic — the §1 insight that the last few percent of hit ratio is *DB-load protection*, not user latency, made literal at fleet scale. Leases cut the database load from stampedes by orders of magnitude on hot keys, and individual memcache nodes sustained ~1M requests/sec at sub-millisecond latency. The system scaled cache-aside from one cluster to many regions without changing the core pattern — proof that the §3.1 default, hardened with §6 mitigations, goes a very long way.

### Lessons

- **The default pattern scales — if you harden it.** Plain cache-aside with `delete`-on-write got Facebook to a billion users; what made it survivable was layering §6 mitigations (leases = single-flight, gutter pools = avalanche guard) on top, not replacing the pattern.
- **One well-chosen primitive can solve two problems.** The lease handled *both* thundering herd (§6.1) and the dual-write stale-read race (§8) at once. Look for invariants that collapse multiple failure modes.
- **Invalidate from the source of truth, not from app code.** At fan-out scale, CDC-style invalidation off the commit log (`mcsqueal`) is more reliable than enumerating derived keys in every write path — exactly the §5 "strongest, decoupled" answer.
- **Pick your consistency target explicitly.** They didn't accidentally end up eventually consistent; they *chose* to minimize staleness probability/duration rather than guarantee freshness, because the alternative couldn't carry the load.

## 13. Test yourself

1. Your cache hit ratio drops from 99% to 90% during an incident. By roughly what factor does origin DB load increase, and why is this often more dangerous than the latency change? *(Hint: §1 table — miss rate 1%→10%.)*
2. Why does cache-aside delete the key on write instead of updating it with the new value? Give the concrete race that updating creates. *(Hint: §3.1 / §8 interleaving.)*
3. A single product becomes viral and one Redis shard saturates while the cluster is idle. Why doesn't adding more shards help, and what's the standard fix? *(Hint: §6.2 — same hash, L1 local cache.)*
4. Explain probabilistic early expiration (XFetch) and what advantage it has over a distributed lock for stampede prevention. *(Hint: §6.1 — no coordination, staggered refresh before expiry.)*
5. You shard a Memcached cluster with `hash(key) % N`. What happens to your hit ratio the moment you add one node, and what hashing scheme avoids it? *(Hint: §9 — mass remap vs consistent hashing / vnodes.)*
6. When would you choose write-behind over write-through, and what's the failure you're accepting? *(Hint: §3.4 — bursty counters; data-loss window on crash.)*
7. How does a Bloom filter defend against cache penetration, and why is its false-positive (not false-negative) property the safe one here? *(Hint: §6.3 / `15` — "definitely not present" never rejects a real key.)*
8. Redis is single-threaded for command execution. Name two consequences — one benefit, one risk — and how `KEYS *` interacts with it. *(Hint: §10/§12 — serializable atomicity vs one slow O(N) command blocking everyone.)*

---

## 14. Further reading

- Nishtala et al., **"Scaling Memcache at Facebook"** (NSDI 2013) — the canonical real-world cache-aside paper: leases (stampede prevention), regional pools, cold-cluster warmup, and the `delete`-on-write consistency model. Read this twice.
- Vattani, Chierichetti, Lowenstein, **"Optimal Probabilistic Cache Stampede Prevention"** (VLDB 2015) — the XFetch derivation.
- **Redis documentation** — data types, eviction (`maxmemory-policy`, approximate LRU/LFU), persistence (RDB/AOF), Cluster, and `SCAN` vs `KEYS`.
- **Memcached wiki** — slab allocation, LRU, and the rationale for client-side sharding.
- Kleppmann, **Designing Data-Intensive Applications** — Ch. 1 (latency/percentiles), Ch. 5 (replication & consistency, underpinning cache↔DB), Ch. 6 (partitioning / consistent hashing).
- Karger et al., **"Consistent Hashing and Random Trees"** (1997) — the original; pairs with `08-replication-and-partitioning.md`.
- Caffeine (Java) design notes on **W-TinyLFU** — the modern eviction state of the art.
- Project-local: `readme/STOREFRONT_CACHE_GUIDE.md`, `readme/PERFORMANCE_RND.md`, and the Nitro route-cache warning in `frontstore/nuxt.config.ts`.

---

*Next:* `07-load-balancing-and-scaling.md` (where caching meets request distribution) and `16-rate-limiting-and-resiliency.md` (the circuit breakers and limiters that protect the origin when the cache fails).
