---
title: "Probabilistic Data Structures: Count Billions in Kilobytes"
metaTitle: "Probabilistic Data Structures Explained"
description: "How probabilistic data structures like Bloom filters and HyperLogLog let big systems count billions of items in kilobytes by trading a little accuracy for huge memory savings."
keywords:
  - probabilistic data structures
  - Bloom filter
  - HyperLogLog
  - Count-Min Sketch
  - consistent hashing
  - cardinality estimation
  - approximate counting
  - sketches in databases
  - Merkle tree
  - skip list
  - geohash
  - top-k heavy hitters
  - HyperLogLog vs exact count
  - how Bloom filters work
faq:
  - q: What is a probabilistic data structure?
    a: It is a structure that answers questions like "how many" or "have I seen this" using a tiny, lossy summary instead of storing every item. You trade a small, mathematically bounded amount of accuracy for a massive reduction in memory.
  - q: When should I use a Bloom filter?
    a: Use one when you need a fast "have I seen this before?" check and can tolerate occasional false positives. It never says "no" wrongly, so it is great as a cheap pre-check before an expensive disk or network lookup.
  - q: How does HyperLogLog count unique items in so little memory?
    a: It hashes each item and tracks rare bit patterns rather than the items themselves. A fixed 12 KB sketch estimates distinct counts up to billions with under 1% error, no matter how many items you feed it.
  - q: What is the catch with probabilistic data structures?
    a: The answer is approximate, and you must know which way the error leans. A Bloom filter can over-report membership, Count-Min only over-counts, and HyperLogLog wobbles both ways. Confusing the error direction creates real bugs.
  - q: Can these sketches be combined across servers?
    a: Many can. HyperLogLog sketches merge by taking the element-wise maximum, and Count-Min sketches add. This mergeability is what lets you compute a global answer by combining per-server summaries.
  - q: Are probabilistic data structures used in real databases?
    a: Yes, widely. RocksDB, Cassandra, and HBase use Bloom filters, Redis ships HyperLogLog and Count-Min commands, and BigQuery's APPROX_COUNT_DISTINCT runs on HyperLogLog.
author: Pritesh Yadav
transformed: true
topic: system-design
topicTitle: System Design
category: Engineering
date: '2026-06-15'
order: 15
icon: "\U0001F3D7️"
sources: []
---

Imagine someone hands you a firehose of a billion website visits a day and asks a simple question: how many of those visitors were unique? The obvious answer is to keep a list of everyone you have seen. That list would weigh gigabytes and never fit in fast memory.

Now imagine answering the same question with under 1% error using a fixed 12 kilobytes. Not 12 kilobytes per million visitors. Twelve kilobytes, forever, whether you see ten people or ten billion.

That is not a trick. It is a whole family of tools called **probabilistic data structures**, and they quietly run the largest systems you use every day.

## Why this matters

Most data structures you learned in school are **exact**. A hash map, a sorted tree, a database index: they store every item and answer every question precisely. That precision costs memory proportional to the number of items, written `O(n)`.

At small scale, who cares. At web scale, `n` is a billion unique users a day, a hundred million distinct search terms, fifty million live locations on a map. Exact structures blow past the memory budget, and memory is where speed lives. Reading from RAM takes about 100 nanoseconds. Reading from disk is roughly 160 times slower. Once your data spills out of memory, everything crawls.

Probabilistic data structures change the deal. You give up exactness in a **controlled, measurable** way and get back orders of magnitude less memory and CPU. The savings are not marginal. They are the difference between "fits in memory" and "does not fit anywhere fast."

If you build, operate, or interview for systems of any real size, these tools are part of the vocabulary. The good news is the core ideas are intuitive once you stop thinking like a librarian who keeps every book and start thinking like a bouncer who just remembers faces.

## The one mindset that ties it all together

Every structure here makes the same trade: **stop storing the items, store a lossy fingerprint of the stream instead.**

You will not be able to list what you saw. But you can answer one specific question about it, cheaply and approximately. Before reaching for any of these tools, ask three questions:

1. **What does it answer?** Membership ("have I seen this?"), cardinality ("how many unique?"), frequency ("how often?"), quantiles ("what is the 99th percentile?"), or set difference ("what changed?").
2. **Which way does the error lean, and is it bounded?** This is the one that bites people. Some tools only over-count. Some only over-report. Some wobble evenly around the truth.
3. **Can two summaries be merged?** If a sketch from server A and a sketch from server B can be combined into the sketch of both, you can compute global answers in parallel. This **mergeability** is what turns a clever toy into a distributed-systems workhorse.

Keep those three questions in mind. They are the whole game.

## Membership: the bouncer who remembers faces

### The Bloom filter

Picture a nightclub bouncer with a fuzzy memory. You walk up and he asks himself, "have I seen this face?" If he says **no**, you have definitely never been in. If he says **yes**, he might be confusing you with someone else. He keeps no photos, just a vague impression, so his "list" costs almost nothing.

That is a **Bloom filter**. Under the hood it is a row of bits, all starting at zero, plus a few hash functions that turn any item into a handful of bit positions.

- **To add an item:** flip its bit positions to 1.
- **To check an item:** if all its bit positions are 1, answer "probably present." If any is 0, answer "definitely absent."

The asymmetry is the whole point. A Bloom filter **never gives a false negative**. If it says you are not in the set, you are not, period. But it can give a **false positive**, because another item might have happened to set the same bits.

Here is the practical headline to remember: about **9.6 bits per item gives a 1% false-positive rate**, and about 14.4 bits gives 0.1%. Every extra ~4.8 bits per item divides the error by ten. Compare that to storing the actual keys, which might be hundreds of bits each, and the savings are enormous.

A real example: a billion items at 1% false positives needs roughly 1.2 GB. The exact set of those items would need 16 GB or more once you count overhead. The Bloom filter fits in memory. The exact set spills to disk and gets slow.

A few things to know:

- **You cannot delete from a basic Bloom filter.** Clearing a bit might break another item that shares it. If you need deletions, a **Counting Bloom filter** uses small counters instead of single bits (at about four times the space), or a **Cuckoo filter** supports deletion with better space efficiency at low error rates.
- **You must size it up front.** If you size for a million items and then cram in ten million, the false-positive rate silently climbs toward useless. Monitor how full it is.

### Where you have already used one

Bloom filters guard reads in storage engines like **RocksDB, Cassandra, HBase, and LevelDB**. When you look up a key, the filter instantly skips files that cannot contain it, turning a multi-file disk scan into a single in-memory check. Google's Bigtable popularized the trick. Chrome's Safe Browsing historically used a Bloom-style filter so checking a URL against the malware list was a local memory hit instead of a network call. Medium used one to skip posts you had already read.

## Cardinality: counting coin-flip streaks

### HyperLogLog

Back to our opening puzzle: how many unique visitors, in tiny memory?

Here is the intuition. Flip a coin over and over and remember the longest run of heads you ever saw. If the longest streak was ten heads in a row, you almost certainly flipped a lot of coins, because long streaks are rare. You can estimate **how many** flips happened just from the rarest pattern you observed, without remembering a single flip.

**HyperLogLog** does exactly this with hashes. It turns each item into a random-looking bit string and watches for rare patterns, like long runs of leading zeros. A very rare pattern means you have probably seen a lot of distinct items. To smooth out the luck, it splits the work across thousands of independent "buckets" and averages them.

The result is almost magical. A standard configuration uses **12 KB and achieves about 0.81% error**, and it estimates distinct counts all the way up to billions. The memory does not grow with the data. Doubling the number of unique items adds essentially nothing. That flat curve is why it is called *Hyper*LogLog.

**It merges beautifully.** To combine two HyperLogLog sketches, take the larger value in each bucket. That single fact is why **BigQuery's `APPROX_COUNT_DISTINCT`, Redshift, Presto, and Druid** can count distinct values across many machines in parallel: each worker builds a sketch, the coordinator merges them. **Redis** exposes this directly with `PFADD`, `PFCOUNT`, and `PFMERGE`, where each counter is a 12 KB sketch.

**One trap to avoid:** HyperLogLog gives you unions cheaply, but **intersections are dangerous**. Working out "how many people saw both A and B" by subtracting noisy estimates can produce an error larger than the answer itself when the overlap is small. Do not compute funnel overlaps this way.

## Frequency: tally counters that only ever overcount

### Count-Min Sketch

Imagine a grid of tally counters. Each item you see bumps one counter per row, with the row's hash deciding the column. To read an item's count, you look at all its counters and take the **smallest** one. Why the smallest? Because collisions can only inflate a counter, never shrink it, so the minimum is the least-contaminated estimate.

That is a **Count-Min Sketch**. It answers "how often did I see X?" in a fixed amount of memory, no matter how many distinct items flow through. A typical setup counts a stream of billions of events in tens of kilobytes.

Its error is **one-sided: it never under-counts.** This makes it perfect for "is this item hot?" and useless for "is this item rare?" Low-frequency items get buried under collision noise, so only trust it for the heavy hitters.

### Finding the hot items

A Count-Min Sketch tells you how often a *given* item appeared, but not *which* items are popular. Pair it with a small heap that keeps the current top K, and you get approximate **top-K** tracking in bounded memory. **Redis** ships both as `CMS.*` and `TOPK.*` commands.

This pattern is everywhere: "trending now" lists, rate-limiting the noisiest API keys, network traffic monitoring, and smart caches that only admit items the sketch says are popular (the **TinyLFU** admission policy used in the Caffeine cache works this way).

## Percentiles: why you cannot average a p99

Here is a mistake that ships to production constantly. You have a hundred servers, each reporting its own 99th-percentile latency. You average those numbers to get the "fleet p99." That number is **wrong** and means nothing.

**Percentiles do not average.** The mean of per-server p99s is not the p99 of the whole fleet. But storing every latency to sort it would cost memory proportional to the request count and would not combine across servers.

The answer is a **mergeable quantile sketch**:

- **t-digest** clusters latency values into groups that are fine-grained at the extremes and coarse in the middle, so p99 and p999 stay sharp exactly where your service-level objectives care. It uses a few kilobytes and merges cleanly. **Elasticsearch** uses it for its `percentiles` aggregation.
- **DDSketch**, from Datadog, guarantees a hard relative-error bound (say, within 2% of the true value) rather than t-digest's "empirically great at the tails" behavior. Reach for it when you need an accuracy *contract*, not just good-in-practice.

The rule: aggregate the sketches, never the percentiles.

## Syncing data: Merkle trees

Two people each hold a 10,000-page book and want to find which pages differ, without reading all 10,000 aloud. They hash each chapter and compare chapter hashes. Where chapters match, they skip entirely. Where chapters differ, they zoom in, chapter to section to page. They find every difference in a handful of comparisons instead of thousands.

That is a **Merkle tree**: a tree where each leaf is a hash of a data block and each parent is a hash of its children. The single root hash fingerprints the entire dataset. To compare two copies, exchange roots. If they match, the data is identical, done in one round trip. If they differ, recurse only into the mismatched branches.

This is how **DynamoDB and Cassandra** repair drift between replicas after a network hiccup (Cassandra's `nodetool repair`). The same idea underpins **Git**, **IPFS and blockchains**, **ZFS** integrity scrubbing, and **rsync**-style file sync. It is the practical answer to the question "two copies drifted apart, what changed?" without shipping everything across the wire.

## Spreading data across machines: consistent hashing

Suppose you spread a million cache keys across ten servers using `hash(key) mod 10`. Now you add an eleventh server and switch to `mod 11`. How many keys move to a new home? About **91% of them.** That is a cache stampede and possibly an outage, all from adding one box.

**Consistent hashing** fixes this. Picture a clock face. You place both your keys and your servers around the rim by hashing them. Each key belongs to the first server you reach going clockwise. Now when you add a server, only the keys in the slice it covers move. Adding or removing a node remaps roughly **1/N of the keys** instead of nearly all of them.

There is one wrinkle. If each server sits at a single point on the ring, the slices come out lumpy and some servers get overloaded. The fix is **virtual nodes**: place each physical server at many points around the ring (say 100 to 256). The load evens out, a more powerful machine can simply take more points, and when a server dies its load spreads across many survivors instead of dumping onto one unlucky neighbor.

This is the partitioning scheme behind **Amazon Dynamo, Cassandra, Riak, and ScyllaDB**, and it drives sticky load balancing in **memcached clients** and **Envoy**.

## Mapping the world: geohash, quadtrees, and S2

"Find restaurants within 2 km of me" sounds easy until you have millions of points. A normal index sorts on one dimension, but locations are two-dimensional. The trick is to flatten the map into a single sorted line while keeping nearby places near each other in that line.

- **Geohash** interleaves the bits of latitude and longitude into a short string, so places that share a prefix are physically close. A prefix range becomes a map box. It is simple and works in any database. **Redis GEO** commands use it. The catch is the **edge problem**: two spots on opposite sides of a cell boundary can be neighbors in real life but share no prefix, so you must also check the surrounding cells.
- **Quadtrees** recursively split space into four quadrants until each cell is sparse enough. Dense cities subdivide deeply, empty oceans stay coarse. Great for changing point sets and nearest-neighbor queries.
- **S2**, from Google, wraps the map onto a cube and threads a space-filling curve through it for excellent locality and correct handling of the poles and the date line. Uber's **H3** is the hexagonal cousin used for surge pricing. These power Google Maps, MongoDB's geo features, and many ride-hailing systems.

## Fast ordered lookups: skip lists

Think of an express subway running above a local line. You ride the express, which skips most stops, then drop down to the local near your destination. You reach any station in a fraction of the steps.

A **skip list** is a sorted linked list with random express lanes layered on top. Each item has a coin-flip chance of being promoted to the next lane up, giving roughly `log n` levels. Searches start at the top, skip far to the right, and drop down when they overshoot.

The payoff is `O(log n)` search, insert, and delete, the same as a balanced tree, but **without the fiddly rebalancing**. That makes skip lists much easier to make concurrent, which is exactly why **Redis sorted sets**, **RocksDB and LevelDB memtables**, **Apache Lucene**, and Java's `ConcurrentSkipListMap` all use them.

## Common misconceptions

- **"A Bloom filter 'yes' is a final answer."** No. It is a *fast path*. A "yes" might be a false positive, so always back it with the real lookup. Treating it as authoritative serves wrong data.
- **"More items in the same filter is fine."** No. A Bloom filter sized for a million items but fed ten million quietly drifts toward a 100% false-positive rate and stops filtering anything. Watch how full it gets.
- **"I can intersect two HyperLogLogs to find overlap."** Only when the overlap is large. For small overlaps the math subtracts two noisy numbers and the error swamps the answer. Use exact sets or MinHash for similarity.
- **"Average the p99s for a fleet p99."** Wrong and meaningless. Merge the underlying sketches, never the percentiles.
- **"Count-Min can find rare events."** No. Its error scales with total traffic, so rare items drown in noise. It is for heavy hitters only.
- **"Hash quality does not matter."** It is everything. These tools all assume uniform, hard-to-predict hashing. A weak hash, or an attacker choosing keys on purpose, breaks every guarantee at once. Use strong hashes like xxHash, and SipHash when inputs might be adversarial.

## How to use this

1. **Name the question first.** Membership, cardinality, frequency, quantile, or sync. Each maps to a specific tool. Do not pick the structure before you know the question.
2. **Decide if exactness is truly required.** A public "1.2M views" badge does not need a precise count. A billing total does. Be honest about which one you have.
3. **Check the error direction.** Will over-reporting or under-reporting cause a bug in your use case? Match the tool's one-sided or two-sided error to what you can tolerate.
4. **Confirm you can merge.** If you need a global answer across servers, verify the merge operation exists and is safe to repeat. HyperLogLog's max merge is repeat-safe; do not accidentally add the same shard's Count-Min Sketch twice.
5. **Size for the real maximum.** Bloom filters and sketches degrade if overfilled. Provision for peak `n`, and monitor fill levels in production.
6. **Reach for the battle-tested implementation.** Redis, your database, or a vetted library almost certainly ships these already. Use `PFCOUNT`, `APPROX_COUNT_DISTINCT`, and friends before hand-rolling your own.

## Conclusion

The single idea worth carrying away: **at scale, "approximately right and tiny" beats "exactly right and enormous" far more often than your instincts expect.** The art is not in the clever math; it is in noticing that the product only needed a rounded number, and that a 12 KB sketch buys you the same answer a database table struggles to hold.

Here is the thread worth pulling next. Every tool in this article leans on one fragile assumption: that the hash function scatters items uniformly and unpredictably. So what happens when an attacker gets to choose the inputs on purpose, deliberately steering everything into the same bucket? That question opens the door to hash flooding, algorithmic complexity attacks, and the security side of data structures, where a clever input can turn your fastest tool into your slowest.
