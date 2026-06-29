---
title: "Caching Explained: How One Layer Saves (or Sinks) Your App"
metaTitle: "Caching Deep Dive: Patterns, Eviction & Failures"
description: "A practical caching deep dive: how cache hit ratio protects your database, the read/write patterns to use, and the four failures that turn caches into outages."
keywords:
  - caching
  - cache hit ratio
  - cache-aside pattern
  - cache invalidation
  - Redis vs Memcached
  - cache stampede
  - LRU eviction
  - consistent hashing
  - distributed cache
  - write-through cache
  - thundering herd
  - hot key problem
  - cache penetration
  - TTL jitter
topic: system-design
topicTitle: System Design
category: Engineering
date: '2026-06-15'
order: 6
icon: "\U0001F3D7️"
author: Pritesh Yadav
transformed: true
faq:
  - q: "What is the difference between cache-aside and write-through caching?"
    a: "With cache-aside, your app loads data into the cache on a miss and writes to the database directly, deleting the cache key afterward. With write-through, every write goes through the cache, which synchronously updates the database, so the cache is always consistent at the cost of slower writes."
  - q: "Why does a cache delete a key on write instead of updating it?"
    a: "Deleting is idempotent and avoids a stale-write race where two concurrent writers interleave and leave the older value in the cache. Deleting forces the next reader to repopulate from the source of truth, which is the safe default."
  - q: "What is a cache stampede and how do you prevent it?"
    a: "A cache stampede happens when a popular key expires and many requests miss at once, all hammering the database with the same expensive query. The main fix is request coalescing (single-flight), so only the first request recomputes while others wait or serve a slightly stale value."
  - q: "Should I use Redis or Memcached?"
    a: "Use Memcached for a simple, multi-core, look-aside string cache with huge numbers of tiny items. Use Redis when you need rich data structures, persistence, replication, atomic server-side logic, leaderboards, rate limiters, or locks. Most teams default to Redis for its versatility."
  - q: "Why does my cache hit ratio matter so much for database load?"
    a: "The last few percent of hit ratio mostly protect your database, not your latency. Going from 99% to 90% hits means misses jump from 1% to 10% of traffic, a 10x increase in database load that can topple an origin provisioned for the lower number."
  - q: "What is consistent hashing and why do distributed caches use it?"
    a: "Consistent hashing maps both keys and cache nodes onto a ring so that adding or removing a node only remaps a small slice of keys instead of nearly all of them. This prevents a mass cache miss (and database avalanche) every time you scale your cache cluster."
sources: []
---

Picture this: your app has been fast and stable for months. Then one Redis node restarts, your cache hit ratio quietly slips from 99% to 90%, and within seconds your database is on fire. Nothing about your traffic changed. The cache did.

That is the strange power of caching. It is the single cheapest way to make software faster, and also one of the most reliable ways to cause an outage if you misunderstand it. This article walks through how caching actually works, the patterns and trade-offs that matter, and the failure modes that bite real teams.

## Why this matters

A cache is a small, fast store that holds a copy of data whose real home is large and slow. Add one and you can turn a 5-millisecond database query into a sub-millisecond memory lookup. That is the obvious win.

The non-obvious win is **database protection**. Once your cache absorbs 99% of reads, your database is only sized for the remaining 1%. The cache stops being a nice-to-have and becomes a load-bearing wall. If it wobbles, everything behind it gets crushed.

So caching is not just "make it faster." It is a design decision with consistency, memory, and reliability consequences. Get it right and you serve a billion users from RAM. Get it wrong and your performance optimization becomes your biggest single point of failure.

## Why caching works at all

A cache only pays off because real-world traffic is lopsided. People do not request data at random.

- **Temporal locality.** Data accessed now is likely accessed again soon. Think of a trending product or a logged-in user's profile being read on every page.
- **Spatial locality.** Data near accessed data tends to get accessed too, like the next rows of a result set.
- **The 80/20 rule.** In most web workloads, a tiny fraction of keys serve the vast majority of requests. Page views and product reads follow a steep popularity curve where the most popular item is roughly twice as requested as the second, three times the third, and so on.

This is *why* a cache holding just 5 to 20% of your keys can serve 90% or more of your reads. You are not caching everything. You are caching the loud minority.

### The hit ratio is everything

Your average latency is governed by one number: the **hit ratio** (the share of requests the cache answers without touching the origin). Here is what happens as it climbs, assuming a 0.3 ms cache hit and a 5 ms database miss:

| Hit ratio | Average latency | Database load vs no cache |
|---|---|---|
| 0% | 5.0 ms | 100% |
| 50% | 2.65 ms | 50% |
| 90% | 0.77 ms | 10% |
| 95% | 0.535 ms | 5% |
| 99% | 0.347 ms | **1%** |
| 99.9% | 0.305 ms | 0.1% |

Look closely at the bottom rows. Going from 99% to 99.9% barely changes user latency, but it cuts database load by another 10x. **The point of a very high hit ratio is usually to protect the database, not to shave milliseconds off a response.**

Now read the table backward. If your hit ratio *drops* from 99% to 90% during an incident, misses jump from 1% to 10% of traffic. That is a 10x spike in origin load, hitting a database that was only ever provisioned for 1%. This is the seed of the avalanche we will cover later.

## The cache stack: it is layers, not a box

Caching is not one component. It is a stack, where each layer absorbs what the layer above it missed.

1. **Browser / client.** HTTP cache, service workers, local storage. Nearly free, but scoped to one user and easily stale.
2. **CDN / edge.** Cloudflare, Fastly, CloudFront. Caches assets and pages near the user, roughly 10 to 30 ms away, scoped to a regional point of presence.
3. **Application / in-process.** A per-instance map living in your app's memory. Nanoseconds fast, but scoped to one instance.
4. **Distributed cache.** Redis or Memcached, shared across the whole fleet, about 0.2 to 1 ms away over the network.
5. **Database buffer pool.** Your database's own in-RAM cache of recent rows. Invisible and automatic.
6. **Origin / disk.** The actual table on an SSD.

Each layer trades **coherence for speed and reach**. The browser cache is fastest but most easily wrong; the distributed cache is shared and more authoritative but a network hop away.

Here is a classic trap. An engineer "adds Redis" in front of a query that the database was already serving entirely from its in-memory buffer pool. They added a network hop and gained nothing, because the rows were already in RAM. **Always measure where the time actually goes before adding a layer.**

The rule of thumb: push caching as far up and out as your consistency budget allows. Static assets with content-hashed filenames can sit in a CDN for a year. Personalized HTML belongs at the edge with a short TTL or marked private. Hot, read-mostly objects belong in the distributed cache. And private routes like `/cart` and `/checkout` must never be cached at a shared layer, or one user sees another user's data.

## Caching patterns: who fills the cache, who writes the database

The pattern you pick decides your consistency and your write latency. This is the most-asked design topic for a reason.

### Cache-aside (lazy loading): the default

The application is in charge. The cache is a dumb store.

On a **read**, the app asks the cache. On a miss, it queries the database, then writes the result back into the cache with a TTL. On a **write**, the app updates the database, then *deletes* the cache key.

- Simple, works with any cache, and the cache only ever holds data that was actually requested.
- A cache failure is not data loss, because the database is the source of truth.
- The downsides: the first read of any key is always a miss, and you own every invalidation.

**Why delete, not update?** Updating the cache on write feels efficient but creates a nasty race. Two concurrent writers can interleave their cache-set and database-update steps so the cache ends up holding the *older* value. Deleting is idempotent and lets the next reader repopulate cleanly. "Invalidate, don't update" is the safe default, and it is exactly what Facebook's famous memcache setup does.

### Read-through

Same read shape as cache-aside, but the cache library itself loads from the database behind a loader function. Your app just calls `cache.get(key)` and the miss logic is hidden. Cleaner across many call sites, at the cost of depending on the provider's behavior.

### Write-through

Every write goes to the cache, which synchronously writes the database before returning. The cache is always consistent with the database, and a read right after a write is guaranteed warm. The price: every write pays both cache and database latency, and you cache data that might never be read.

### Write-behind (write-back)

Write to the cache, acknowledge immediately, and flush to the database asynchronously in batches. This gives the lowest write latency and can coalesce a thousand updates to a counter into a single database write, which is wonderful for view counts and leaderboards.

The catch is a real one: if the cache node dies before it flushes, **you lose data**. Only use this where some loss is tolerable or the cache itself is durable.

### Refresh-ahead

Proactively refresh popular keys *before* they expire, so a hot key is never cold. Great for predictable hot data, wasteful for everything else.

Here is the whole family at a glance:

| Pattern | Write path | Consistency | Best for | Main risk |
|---|---|---|---|---|
| Cache-aside | DB, then delete key | Eventual, small race | General read-mostly | Cold-start misses; you own invalidation |
| Read-through | Usually with write-through | Eventual | Uniform encapsulated access | Provider lock-in |
| Write-through | Cache to DB, sync | Strong | Read-after-write critical | Slow writes |
| Write-behind | Cache to DB, async | Eventual, lagging | Counters, bursty writes | **Data loss on crash** |
| Refresh-ahead | Orthogonal | Eventual | Predictable hot keys | Wasted refresh on cold keys |

## When the cache is full: eviction policies

A cache has bounded memory. When it fills up, something has to go, and the eviction policy decides what.

- **LRU (Least Recently Used).** Evict whatever has not been touched the longest. This is the workhorse and great for temporal locality. Its weakness: a one-time scan of many cold keys, like a batch job or a crawler, can flush your hot set. This is called cache pollution.
- **LFU (Least Frequently Used).** Evict the least-accessed item. Great for stable popularity, but a key that was hot yesterday can squat in memory forever, and brand-new items struggle to build up a count.
- **TTL.** Not really eviction but expiry: each key dies after a fixed time. In practice you combine TTL with LRU or LFU.
- **W-TinyLFU.** The modern state of the art, used by default in the Caffeine library. It uses a tiny memory sketch to decide whether a new candidate is genuinely more valuable than the item it would evict. Near-optimal hit ratios with almost no overhead. Reach for this if you control the cache library.

### How LRU is actually built

The textbook LRU uses a **hash map plus a doubly-linked list**. The map finds any key in constant time; the list keeps items ordered from most to least recently used. On access, you unlink the node and splice it to the front. When full, you evict the tail. Every operation is constant time. This is the canonical "LRU cache" coding interview question.

But real caches cheat for speed. Redis does *not* keep a perfect global LRU list, because that costs memory and a list edit on every single access. Instead it uses **approximate LRU**: each key stores a small timestamp, and on eviction Redis samples a handful of random keys and evicts the oldest of the sample. More samples means closer to true LRU but more CPU. The lesson generalizes: at scale, approximate eviction with bounded sampling beats exact eviction with global bookkeeping.

## Cache invalidation: one of the genuinely hard problems

> "There are only two hard things in Computer Science: cache invalidation and naming things." — Phil Karlton

Invalidation is hard because the cached copy and the real data drift apart, and you have to decide *when* and *how* to reconcile them across many readers, writers, and layers. Here are the strategies, weakest to strongest:

1. **TTL expiry.** Let entries die after N seconds and accept up to N seconds of staleness. Dead simple, no coordination, the backbone of CDN and HTTP caching. The whole art is picking N, and jittering it.
2. **Explicit invalidation on write.** Delete the key right after the database write. Precise, but you must enumerate *every* key derived from the changed data. Miss one and you get a silent stale read.
3. **Versioned or immutable keys.** Embed a version or content hash in the key, like `product:42:v17` or `app.a3f9.css`. A write bumps the version, old keys are simply never read again and age out on their own. There is no invalidation race at all. This is the strongest and cheapest technique when you can use it, and it is exactly how CDN asset hashing works.
4. **Change-data-capture (CDC).** Tail the database's change log and invalidate cache entries from the authoritative stream. This catches *every* write, even ones made outside your app code, and decouples invalidation from your write paths entirely.

### The fan-out problem is the real killer

A single product edit might need to invalidate dozens of derived caches: the product page, the category listing, the search index, the homepage rail. Two tactics tame this:

- **Tag invalidation.** Tag every derived key with `product:42` and flush the whole tag at once.
- **Generation keys.** Store a generation number like `gen:category:5 = 88` and build dependent keys from it. Bumping the generation invalidates the entire family instantly, without enumerating a single key.

## Common misconceptions

**"A cache makes everything faster."** Not if the data was already in your database's memory buffer pool. You may just be adding a network hop. Profile first.

**"Updating the cache on write is more efficient than deleting it."** It is faster on paper but opens a race that can pin the *old* value in cache indefinitely. Delete and let the next reader repopulate.

**"A cache can never hurt you."** A cache that drops from a 99% to a 90% hit ratio can cause a 10x spike in database load. The optimization becomes the outage.

**"My cache holds my data safely."** A cache is disposable by definition. If losing it logs out every user or drops orders, it is not a cache, it is an under-protected database. Give it persistence and replication, or do not store the only copy there.

**"Sharding fixes a hot key."** It does not. Every read of that one key hashes to the same node no matter how many shards you add.

## The four failures that turn caches into liabilities

Once your database is sized for 1% of traffic, the cache *must not fail*. These four failure modes are canonical, both in production and in interviews.

### 1. Cache stampede (thundering herd)

A hot key expires. Thousands of requests all miss at the same instant, all run the same expensive query, and all try to write it back. The database gets hit by thousands of identical queries, saturates, slows down, and causes *more* misses. A self-inflicted spiral.

The fixes:

- **Request coalescing (single-flight).** Only the first request recomputes; everyone else waits on that same in-flight result. This is the single most important fix.
- **A short distributed lock.** The first misser grabs a lock, everyone else waits briefly or serves stale data. The lock can be best-effort; the goal is "few recomputes," not "exactly one."
- **Probabilistic early expiration.** Each reader recomputes with a small probability that grows as the key nears expiry, so one lucky reader refreshes it *before* it expires while the old value is still served. Elegant because it needs no locks and no coordination at all.
- **Serve stale while revalidating.** Return the expired value immediately and refresh in the background. Users never wait on a miss.

### 2. Hot keys (the celebrity problem)

One key is so popular that the single shard holding it maxes out its CPU and network while the rest of the cluster sits idle. Think of a viral product or a global config blob read on every request. Sharding does not help, because every read hashes to the same node.

The fixes:

- **A local in-process cache in front of the distributed one.** Each app instance caches the hot key locally for a second or two. Now the shard sees one request per *instance* per second, not one per *user*. This commonly drops a hot shard's traffic by 1000x.
- **Key splitting.** Store several copies under suffixed keys and have readers pick one at random, spreading the load across shards. Writes have to update all copies.

### 3. Cache penetration

Requests for keys that **do not exist anywhere**, like random garbage IDs or a scraper hammering `user:99999999`. Every such request misses the cache *and* the database, so the cache offers zero protection.

The fixes:

- **Negative caching.** Cache the "not found" result too, with a short TTL, so repeat lookups for the same bad key are absorbed.
- **A Bloom filter.** Keep a compact filter of all valid keys in memory. Before touching the cache or database, test the filter; if it says "definitely not present," reject instantly. It has no false negatives, so it never wrongly rejects a real key, and the small false-positive rate just lets a few bad keys slip through harmlessly. This is the standard defense against ID-enumeration attacks.

### 4. Cache avalanche

Many keys expire at the same instant, or the whole cache cluster restarts, and a huge wave of traffic falls through to the database at once. The macro version of a stampede.

The fixes:

- **Jittered TTLs.** Never use a fixed TTL. Add randomness so expiries spread across a window instead of synchronizing. This is the cheap fix you should apply by default, always.
- **Multi-level caching plus serve-stale,** so a cache outage degrades to a local or stale value rather than straight to the database.
- **Circuit breakers** at the origin, so an overloaded database sheds load instead of collapsing.
- **Staggered cache warming,** so a cold cluster refills gradually behind a rate-limited backfill.

| Failure | Trigger | Primary fix |
|---|---|---|
| Stampede | One hot key expires, many concurrent misses | Single-flight |
| Hot key | One key far hotter than the rest | Local in-process cache |
| Penetration | Requests for non-existent keys | Bloom filter |
| Avalanche | Mass simultaneous expiry or outage | Jittered TTL |

## Keeping the cache and database in sync

When you write to two stores (cache and database) without a transaction spanning both, any interleaving can leave the cache stale. The classic race: a slow read on a cold key fetches the old value, a write commits the new value and deletes a key that is not there yet, and *then* the slow read writes the old value into the cache, where it sits until TTL.

Mitigations, from pragmatic to bulletproof:

- **Always set a TTL,** so any stale write self-heals in bounded time. This is the 80% fix.
- **Delete after the database commit, not before,** and consider a delayed second delete a few hundred milliseconds later to clobber any racing repopulation.
- **Version the cached value** so a late, stale write cannot win.
- **Write-through** to remove the dual write entirely, at the cost of write latency.
- **CDC-driven invalidation,** where the cache is invalidated from the commit log itself, so it cannot drift from committed state. This is the strongest decoupled answer.

One honest limitation: you cannot get strong read-your-writes guarantees through a remote cache without either write-through or reading from the primary right after a write. A cache is, by design, an eventually-consistent replica.

## Distributed caching and consistent hashing

One node does not have enough RAM, so you shard keys across many. The naive approach, `hash(key) % N`, hides a catastrophe: change N by adding or removing a single node and almost *every* key remaps to a different node. Nearly your entire cache misses at once. Instant avalanche.

**Consistent hashing** fixes this. Map both nodes and keys onto a ring. Each key belongs to the first node clockwise from its position. Adding or removing a node only remaps the keys in one arc of the ring, so on average just `K/N` keys move instead of all of them.

Real systems add **virtual nodes**, placing each physical node at many positions on the ring, to even out the load. This is what powers Memcached client libraries, DynamoDB, Cassandra, and CDN routing. Memcached keeps sharding on the client side with no coordination between nodes; Redis Cluster shards server-side across 16,384 hash slots.

## Redis vs Memcached

Both are in-memory key-value stores reached over the network. They diverge sharply once you go past `GET` and `SET`.

| Dimension | Memcached | Redis |
|---|---|---|
| Data model | Opaque strings only | Rich types: hashes, lists, sets, sorted sets, streams, more |
| Threading | Multi-threaded, scales across cores | Mostly single-threaded command execution |
| Persistence | None | Optional snapshots and append-only log |
| High availability | None built in | Replicas, failover, Cluster |
| Atomic ops | CAS, increment | Huge atomic command set, Lua scripts, transactions |
| Locks, queues, pub/sub | No | Yes |

**Rule of thumb.** If all you need is a fast look-aside string cache and you want to saturate many cores per node, Memcached is leaner. If you need anything richer (rate limiters, leaderboards, sessions that survive a restart, queues, locks, atomic counters) reach for Redis. Most teams default to Redis today for its Swiss-army-knife value, scaling past its single-threaded ceiling with Cluster.

### Why Redis wins so many designs

Redis moves logic *to the data*, atomically, on the server. A few examples:

- **Sorted sets** power leaderboards and sliding-window rate limiters.
- **HyperLogLog** counts unique visitors in about 12 KB with under 1% error, regardless of how many there are.
- **Bitmaps** track daily active users at one bit per user.
- **Lua scripts** run a multi-step read-modify-write as a single atomic unit, with no round-trip races, perfect for check-and-decrement inventory.
- **`SET key val NX EX 10`** is the one-line distributed lock and single-flight primitive.
- **Pipelining** batches many commands into one network round trip, which is huge when you are latency-bound.

## How to use this

Here is a concrete checklist for building a cache tier that helps instead of hurting.

1. **Measure before you cache.** Confirm the latency is actually in the database and not already served from its buffer pool. Do not add a network hop for nothing.
2. **Default to cache-aside with delete-on-write.** It is simple, robust, and survives cache failures. Reach for write-through only when read-after-write must be strongly consistent.
3. **Always set a TTL, and always jitter it.** A fixed TTL is an avalanche waiting for a deploy. Add random spread so expiries never synchronize.
4. **Put a short-lived local cache in front of your distributed cache** for hot keys. One or two seconds of staleness can cut a hot shard's load by orders of magnitude.
5. **Add single-flight on expensive recomputes** so one expiry does not dogpile your database.
6. **Guard against non-existent keys** with negative caching or a Bloom filter, especially if your IDs are guessable.
7. **Use consistent hashing** the moment you have more than one cache node, so scaling does not nuke your hit ratio.
8. **Never store the only copy of important data in a plain cache.** If losing it hurts, give it persistence and replication, or keep the truth in a real database.
9. **Use `SCAN`, never `KEYS *`, in production.** `KEYS` is a single blocking operation that can stall your entire Redis instance.
10. **Plan your invalidation fan-out up front.** Use tags or generation keys for derived and aggregate views instead of hoping you remembered every dependent key.

## A real-world proof: Scaling Memcache at Facebook

By the early 2010s, Facebook served over a billion users from a read-dominated social graph. A single page load could fan out to hundreds or thousands of distinct items, reads outnumbered writes by orders of magnitude, and the fleet handled on the order of billions of cache requests per second. No database tier could take that read load directly.

Their answer was the textbook **cache-aside** pattern from this article, hardened. On a read, check memcache, and on a miss load from the database and populate the cache. On a write, update the database and then *delete* the key, the same "invalidate, don't update" rule we covered. Keys were routed with **client-side consistent hashing**, no central coordinator.

To stop hot keys from causing stampedes, they invented the **lease**: on a miss, the cache hands exactly one client a token and makes the others wait and retry. Only the token holder may recompute and set the value. That is single-flight built right into the cache server. The same lease *also* solved the stale-set race, because a delete during recompute voids the outstanding token, so a racing write of a now-stale value is rejected. One primitive killed two failure modes.

For cross-region invalidation, they used the strongest technique available: a daemon that tails the database commit log and broadcasts cache deletes from the authoritative change stream, so even out-of-band writes were covered. And they accepted, deliberately, a small bounded staleness window in exchange for being able to serve the read volume at all. They did not stumble into eventual consistency; they chose it.

The result: hit ratios in the high 90s, a database that saw only a sliver of read traffic, and a single pattern that scaled from one cluster to many regions without being replaced. That is the lesson in one line. **The default pattern scales a very long way, if you harden it.**

## Conclusion

If you remember one thing, remember this: a cache is not just a speed trick, it is a load-bearing part of your system the moment your database depends on it. The hit ratio you barely notice in good times is the exact thing standing between a normal Tuesday and a self-inflicted outage.

So treat your cache with the same care you give your database. Jitter your TTLs, coalesce your misses, and decide your consistency target on purpose rather than by accident.

And here is the thread worth pulling next. When the cache *does* fail and traffic floods the origin, what actually keeps the whole thing from collapsing? That is the job of circuit breakers, rate limiters, and load shedding, the resiliency patterns that catch you when your fastest layer finally blinks.
