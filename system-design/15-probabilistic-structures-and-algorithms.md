# 15 — Probabilistic Data Structures & Algorithms at Scale

**What you'll learn:** How to trade a tiny, bounded amount of accuracy for orders-of-magnitude less memory and CPU, and the specific data structures that make "good enough, but at billion-scale" possible — Bloom/Cuckoo filters, HyperLogLog, Count-Min Sketch, Top-K, t-digest, Merkle trees, consistent hashing, spatial indexes (geohash/quadtree/S2), and skip lists. For each you'll get the intuition, the precise mechanics, the error bounds with real math, and the production system that ships it.

**Prerequisites:** Read `01-foundations-and-estimation.md` (back-of-envelope math, the latency numbers), `08-replication-and-consistency.md` and `09-cap-pacelc...md` (for Merkle anti-entropy), and `10-partitioning-and-sharding.md` (consistent hashing is the partitioner). Hashing fundamentals from `02-...` help throughout.

---

## 0. The space/accuracy trade-off mindset

Most data structures you learned (hash map, B-tree, balanced BST) are **exact and complete**: they store every element and answer every query precisely. That costs `O(n)` memory. At web scale `n` is a billion uniques per day, 100M distinct search terms, 50M concurrent geo-points. Exact structures blow past RAM, and RAM is where latency lives (see the latency table in `01`: RAM read ≈ 100 ns, SSD ≈ 16 µs, network round trip ≈ 0.5 ms).

The probabilistic move: **stop storing elements; store a lossy fingerprint of the stream.** You give up exactness in a *controlled, mathematically bounded* way and get:

```
        EXACT structure                 PROBABILISTIC structure
   ┌───────────────────────┐        ┌───────────────────────────┐
   │ memory  ∝ n            │        │ memory  ∝ 1/ε² or log log n│
   │ answer  always correct │   →    │ answer  correct ± ε,        │
   │ n=1e9 → GBs            │        │         with prob 1−δ       │
   └───────────────────────┘        │ n=1e9 → KBs                 │
                                     └───────────────────────────┘
```

The discipline is: **know which way the error points.** Bloom filters never produce false negatives but can produce false positives. HyperLogLog is unbiased (error straddles zero). Count-Min only *over*-counts, never under. An engineer who confuses the direction of error ships a correctness bug, not an approximation.

Three questions to ask of any sketch:
1. **What does it answer?** (membership, cardinality, frequency, quantile, set difference, location)
2. **Which direction is the error, and is it bounded?** (one-sided vs two-sided; `ε` additive vs multiplicative)
3. **Is it mergeable?** (Can two sketches from two shards be combined into the sketch of the union? This is what makes them work in MapReduce/streaming.) Mergeability is the property that separates a toy from a distributed-systems tool.

---

## 1. Membership: Bloom filters and Cuckoo filters

**Analogy.** A nightclub bouncer with a mental list. "Have I seen this face?" If he says *no*, you've definitely never been in (no false negatives). If he says *yes*, he might be confusing you with someone (false positive). He keeps no photos — just a fuzzy impression — so the "list" costs almost nothing.

### Bloom filter mechanics

A bit array of `m` bits, all zero, plus `k` independent hash functions.

- **Insert(x):** set bits `h₁(x) mod m, …, h_k(x) mod m` to 1.
- **Query(x):** if *all* `k` bits are 1 → "probably present"; if *any* is 0 → "definitely absent."

```
m = 16 bits, k = 3
insert "cat":  positions 2, 7, 11  →  0010000100010000
insert "dog":  positions 5, 7, 14  →  0010010100010010
query "fox" -> 2,5,14 all set? yes -> FALSE POSITIVE (fox never inserted)
query "owl" -> 1,3,9 -> bit1=0 -> DEFINITELY ABSENT
```

**False-positive math.** After inserting `n` items into `m` bits with `k` hashes, the probability a given bit is still 0 is `(1 − 1/m)^{kn} ≈ e^{−kn/m}`. A false positive needs all `k` chosen bits set:

```
p_fp ≈ (1 − e^{−kn/m})^k
```

Optimal `k = (m/n) ln 2`. At that optimum, `p_fp = 2^{−k} = (0.6185)^{m/n}`. The headline number to memorize: **~9.6 bits per element gives ~1% FP; ~14.4 bits gives ~0.1%.** Each extra ~4.8 bits per element divides the FP rate by 10. Compare to storing the keys themselves (a 64-bit hash = 64 bits/elem, a URL = hundreds of bits): a 1% Bloom is ~6× smaller than even just the hashes.

**Back-of-envelope:** 1 billion items at 1% FP → `1e9 × 9.6 bits ≈ 1.2 GB`. Exact set of 64-bit hashes → ~8 GB plus hash-table overhead (~16 GB). The Bloom fits in RAM; the exact set spills to disk.

**Limitations & variants:**
- **No deletion.** Clearing bits would create false negatives (a bit may be shared). Fix: **Counting Bloom filter** — replace bits with small counters (4 bits each, so 4× the space), increment/decrement. Used where churn matters.
- **Must size up front.** `m` and `k` are fixed at the FP rate you targeted for the planned `n`. Overfill and FP rate climbs. **Scalable Bloom filters** chain progressively larger filters.
- Not cache-friendly: `k` random memory probes per query = `k` cache misses. **Blocked Bloom filters** confine all `k` bits to one cache line (64 B), trading a hair of accuracy for ~`k`× fewer cache misses — what high-QPS systems actually deploy.

### Cuckoo filter

Stores short **fingerprints** (e.g. 8–16 bits) in a cuckoo hash table with two candidate buckets per item, using *partial-key cuckoo hashing* so an item can be relocated knowing only its fingerprint. **Supports deletion** and has better space efficiency than Bloom below ~3% FP.

| | Bloom | Counting Bloom | Cuckoo |
|---|---|---|---|
| False negatives | Never | Never | Never |
| Delete supported | No | Yes | Yes |
| Space @ 1% FP | ~9.6 bits/elem | ~38 bits/elem | ~12 bits/elem |
| Lookup cost | k random probes | k random probes | 2 cache-local probes |
| Insert can fail | No | No | Yes (table near full → rebuild) |
| **Use when** | static set, read-heavy | need delete, space lax | need delete + low FP + locality |

**Real systems.** Bloom filters guard LSM-tree reads: **RocksDB, Cassandra, HBase, LevelDB** keep a per-SSTable Bloom so a point lookup skips files that can't contain the key — turning an `O(#levels)` disk scan into one probe. **Bigtable** popularized this. **CDNs and Chrome's Safe Browsing** historically used Bloom-style filters so a malicious-URL check is a local memory hit, not a network call. **Medium** used Bloom filters to skip already-read posts. Cuckoo/quotient filters appear in newer storage engines and network routers (flow tracking).

---

## 2. Cardinality: HyperLogLog

**Analogy.** Flip coins and remember the longest run of heads you ever saw. If the longest run was 10, you probably flipped *a lot* of coins (≈ 2¹⁰), because long runs are rare. You count "how many distinct things" without remembering any of them — just the rarest pattern you observed.

### Mechanics

Hash each element to a uniform bit string. The bits behave like coin flips. The position of the **leftmost 1-bit** (i.e. number of leading zeros + 1) of any hash is geometrically distributed: seeing a value with `ρ` leading zeros suggests you've seen ~`2^ρ` distinct items.

A single estimate has huge variance, so HLL uses **stochastic averaging**: use the first `p` bits of the hash to pick one of `m = 2^p` registers; store the max `ρ` of the remaining bits in that register. Combine registers with a (harmonic-mean-based) estimator:

```
        m=2^p registers, each holds max leading-zeros seen
   hash(x) = 0110 1 0 0 0 1 ...
             └p┘ └── rest ──┘
              ↑          ↑
          register 6   ρ = leading zeros of rest, store max
   estimate ≈ α_m · m² / Σ 2^{−register_j}     (harmonic mean form)
```

**Error bound:** standard error ≈ `1.04 / √m`. So `m = 16384` registers (`p=14`) → **~0.81% error using 12 KB** (each register fits in 6 bits → 16384×6/8 ≈ 12 KB). That 12 KB estimates cardinalities up to billions. Exact distinct-count of a billion items needs gigabytes; HLL needs **12 KB, constant, forever.**

**The flat memory curve is the whole point:** `O(log log n)` — doubling the universe adds essentially nothing. The `log log` is why it's called *Hyper*LogLog (refinement of LogLog/Flajolet–Martin).

**Practical refinements (HLL++):** small-range correction via **linear counting** when most registers are empty; 64-bit hashes to avoid collisions past 2³² items; sparse representation that stores only touched registers for small `n` (a few hundred bytes) then switches to dense.

**Mergeable:** to union two HLLs, take the element-wise **max** of registers. This is why **BigQuery `APPROX_COUNT_DISTINCT`, Redshift, Presto/Athena, Druid** can count distinct across shards in parallel — each worker emits an HLL, the coordinator maxes them. **Redis `PFADD`/`PFCOUNT`/`PFMERGE`** is a 12 KB HLL per key (Redis caps it ~0.81% error). Cassandra and many analytics engines use it for `cardinality()`.

**Pitfall:** HLL gives unions cheaply but **intersections are derived via inclusion–exclusion** `|A∩B| = |A| + |B| − |A∪B|`, which subtracts two noisy numbers — error explodes when the intersection is small relative to the sets. Don't compute funnel overlaps from HLLs naively.

---

## 3. Frequency & heavy hitters: Count-Min Sketch and Top-K

**Analogy.** A grid of tally counters. Each item bumps one counter per row, chosen by a hash. To read an item's count, look at all its counters and take the *smallest* — because collisions can only inflate a counter, the minimum is the least-contaminated estimate.

### Count-Min Sketch (CMS)

A 2-D array of counters, `d` rows × `w` columns, with `d` independent hash functions.

- **Add(x, c):** for each row `i`, `count[i][h_i(x)] += c`.
- **Estimate(x):** `min over rows of count[i][h_i(x)]`.

```
          col→  0    1    2    3    4
   row0 (h0):  12    3   88    1    7
   row1 (h1):   5   91    2   14    0     est(x) = min(88, 91, 7) = 7
   row2 (h2):   0    7   33    9   60     (true count ≤ estimate, never below)
```

**Error bound:** with `w = ⌈e/ε⌉` and `d = ⌈ln(1/δ)⌉`, the estimate overshoots the true count by at most `ε·N` (N = total stream weight) with probability `1−δ`. Example: `ε = 0.001`, `δ = 0.001` → `w ≈ 2719`, `d ≈ 7` → ~19,000 counters ≈ 76 KB regardless of how many distinct items. Counts a stream of billions of events in tens of KB.

**One-sided error:** CMS **never underestimates** (the min still includes the item's own additions; collisions only add). Great for "is this hot?", bad for "is this rare?" — low-frequency items are dominated by collision noise. **Count-Mean-Min** subtracts estimated noise per row to debias.

### Top-K / heavy hitters

CMS tells you a *given* item's frequency, but not *which* items are hot. Combine CMS with a **min-heap of size K**: on each update, estimate the item's count and, if it beats the heap minimum, insert/update it. Result: approximate top-K with bounded memory. **Redis** ships `CMS.*` and `TOPK.*` (the latter uses the **HeavyKeeper** algorithm, which probabilistically decays losers so the heap tracks true heavy hitters better than CMS+heap). The classic exact-ish alternative is **Space-Saving / Misra–Gries** (deterministic counters with eviction), used in stream processors.

| Need | Structure | Error direction | Memory |
|---|---|---|---|
| Distinct count | HyperLogLog | ±1.04/√m | 12 KB |
| Is item present? | Bloom/Cuckoo | FP only | ~10 bits/elem |
| Item frequency | Count-Min | over-count only | ~tens of KB |
| Which items are hot? | Top-K / Space-Saving | approximate set | K counters |
| Percentiles | t-digest / DDSketch | bounded rel. error | ~few KB |

**Real systems.** CMS underpins network telemetry (per-flow byte counts in switches), DDoS detection, ad-frequency capping, and database query optimizers' join-size estimates. **Heavy hitters** drive "trending now," rate-limiting the noisiest API keys, and cache admission (admit only items the sketch says are hot — see **TinyLFU/W-TinyLFU**, the admission policy in Caffeine/RocksDB caches, built on a CMS with aging).

---

## 4. Percentiles: t-digest and quantile sketches

**The trap:** you cannot average percentiles. The mean of per-host p99 is **not** the fleet p99. Storing every latency to sort it is `O(n)` and won't merge across hosts. You need a **mergeable quantile sketch.**

**t-digest (Ted Dunning)** clusters sorted values into centroids whose size is *small near the tails and large in the middle*, so p50 is coarse but p99/p999 stay precise — exactly where SLOs care. It's mergeable: combine two digests by merging centroid lists. Memory ~a few KB for thousands of clusters; relative error at the tails is tiny.

**DDSketch (Datadog)** guarantees **relative-error** quantiles (e.g. answer within ±2% of the true value) with a fully mergeable, bucketed design — preferred when you need a hard accuracy *contract* rather than t-digest's empirically-good-at-tails behavior.

| | t-digest | DDSketch | Naive (store all + sort) |
|---|---|---|---|
| Accuracy guarantee | empirical, great at tails | hard relative-error bound | exact |
| Mergeable | Yes | Yes | only by concatenation |
| Memory | ~KB | ~KB (depends on range) | O(n) |
| **Use when** | metrics/SLO dashboards | strict accuracy SLA | small n, offline |

**Real systems.** **Elasticsearch `percentiles` agg** uses t-digest; **Datadog** built and uses DDSketch fleet-wide; **Prometheus** historically used fixed-bucket histograms (cheap, mergeable, but bucket-bounded error) and now offers native histograms. See `13-observability...md` for how this feeds SLOs.

---

## 5. Anti-entropy & sync: Merkle trees

**Analogy.** Two people each hold a 10,000-page book and want to find which pages differ without reading all 10,000 aloud. They hash each chapter; compare chapter hashes; only descend into chapters that differ; recurse to the page. Mismatches are found in `log n` comparisons.

A **Merkle tree** is a binary tree where leaves are hashes of data blocks and each internal node is `hash(left || right)`. The root is a single fingerprint of the whole dataset.

```
                root = H(H12 || H34)
                /                  \
        H12=H(H1||H2)        H34=H(H3||H4)
         /      \              /       \
       H1=H(d1) H2=H(d2)   H3=H(d3)  H4=H(d4)
```

To reconcile two replicas: exchange roots. Equal → identical, done in one round trip. Differ → recurse only into mismatching subtrees. Cost to find `k` differing blocks ≈ `O(k log n)` hashes exchanged instead of shipping all `n`.

**Real systems.** **DynamoDB and Cassandra** use Merkle trees for **anti-entropy repair** between replicas (Cassandra's `nodetool repair`) — the practical answer to the eventual-consistency divergence discussed in `09-cap-pacelc...md`. **Git** commits/trees, **IPFS/blockchains**, **ZFS** scrubbing, and **rsync**-style block sync all rest on the same Merkle/rolling-hash idea. War story: Cassandra repairs can over-stream if token ranges and tree granularity are misaligned, hashing whole partitions for a one-row diff — tune `repair` ranges.

---

## 6. Partitioning: consistent hashing (derived)

**Problem with naive `hash(key) mod N`:** add or remove one node (N→N±1) and *almost every* key remaps. With 1M keys and N=10→11, ~91% of keys move — a cache stampede or a full data reshuffle. See `10-partitioning-and-sharding.md`.

**Consistent hashing** maps both keys *and* nodes onto the same circular hash space `[0, 2³²)`. A key is owned by the **first node clockwise** from its position.

```
        0/2^32
          ●  ← key k1 → walks clockwise → owned by Node B
      NodeA       NodeB
        ╲          ╱
         ╲        ╱
          ╲      ╱
           NodeC
   Add NodeD between A and B: only keys in (A, D] move from B to D.
```

**Key property:** adding/removing a node remaps only `~K/N` keys (the arc that node owns), not all of them. **Math:** expected fraction of keys moved on a node change is `1/N`.

**Virtual nodes (vnodes):** one physical node placed once on the ring gives lumpy, unbalanced arcs (load variance up to ~`O(log N)` worse). Place each physical node at **V random positions** (e.g. V=100–256). Load standard deviation shrinks ~`1/√V`; with V=100 you get ~10% imbalance, with V=256 a few percent. Vnodes also make **heterogeneous capacity** trivial (a 2× box gets 2× vnodes) and spread a failed node's load across *many* survivors instead of dumping it all on one neighbor.

| Scheme | Keys moved on node change | Balance | Use when |
|---|---|---|---|
| `hash mod N` | ~all | perfect (static) | N never changes |
| Consistent hashing (1 point/node) | ~K/N | lumpy | small clusters, simple |
| + virtual nodes | ~K/N | even (∝1/√V) | real distributed stores |
| Rendezvous (HRW) hashing | ~K/N | even, no ring state | clients need agreement w/o shared ring |

**Real systems.** **Amazon Dynamo** (the paper) introduced consistent hashing + vnodes to the field; **Cassandra, Riak, ScyllaDB** use it for token assignment; **memcached clients (ketama)** and **Envoy/NGINX upstream hashing** use it for sticky load balancing; **Discord** and CDNs use **rendezvous (Highest-Random-Weight) hashing** when they want each client to independently agree on placement without distributing ring state. Bounded-load consistent hashing (Google/Vimeo) caps any node at `(1+ε)×average`.

---

## 7. Spatial: geohash, quadtrees, S2

**Problem:** "find restaurants within 2 km of me" over millions of points. A B-tree on `(lat, lng)` can't do 2-D range efficiently; you need to map 2-D → 1-D so a normal index/range scan works, while keeping nearby points nearby in the 1-D order.

- **Geohash:** interleave bits of lat and lng and base32-encode → a string where **shared prefix ≈ spatial proximity**. `gbsuv` is near `gbsuw`. A prefix range query = a box. Cheap, string-friendly, indexes in any DB. Used by **Redis GEO commands** (`GEOADD`/`GEOSEARCH`, internally a sorted set scored by 52-bit geohash) and **Elasticsearch geo**. Pitfall: the **edge problem** — two points across a cell boundary can be physically adjacent but share no prefix, so neighbor queries must check the 8 surrounding cells.

- **Quadtree:** recursively subdivide space into 4 quadrants until each cell holds ≤ capacity points. Adapts to density: dense cities subdivide deep, oceans stay coarse. Great for dynamic point sets and range/kNN. Used in game engines, mapping, collision detection.

- **S2 (Google):** projects the sphere onto a cube, then uses a **Hilbert space-filling curve** to linearize each face into 64-bit cell IDs. Hilbert curves preserve locality far better than geohash's Z-order (fewer big jumps), and S2 handles spherical geometry correctly (no pole/dateline distortion). A region = a small set of S2 cell-ID ranges → indexable as integer ranges. **Uber's H3** is the hex-grid cousin (uniform cell adjacency, used for surge/demand). S2 powers Google Maps, MongoDB geo, and many ride-hailing/geofencing stacks.

| | Geohash | Quadtree | S2 / H3 |
|---|---|---|---|
| Curve / structure | Z-order (Morton) string | tree | Hilbert curve / hex grid |
| Locality preserved | OK (Z-order jumps) | good | best (Hilbert) |
| Dynamic density | fixed precision | adaptive | fixed levels |
| Edge handling | manual neighbor check | natural | range covering |
| **Use when** | quick prefix index in any DB | in-memory dynamic kNN | planet-scale, correct geometry |

---

## 8. Skip lists

**Analogy.** An express subway over a local line: extra tracks that skip many stops, so you ride the express then drop to the local near your destination — `O(log n)` instead of walking every station.

A skip list is a sorted linked list with **probabilistic express lanes**: each node is promoted to the next level up with probability `p` (usually 0.5), giving ~`log n` levels. Search starts top-left, moves right until the next node overshoots, then drops a level — expected `O(log n)` search/insert/delete with high probability, *without* the rotation bookkeeping of a balanced tree.

```
L3: H ─────────────────────────→ 9 ───→ NIL
L2: H ─────────→ 5 ─────────────→ 9 ───→ NIL
L1: H ──→ 3 ───→ 5 ──→ 7 ───────→ 9 ───→ NIL
L0: H →1→3→4→5→6→7→8→9→ NIL   (full sorted list)
search 7: L3 overshoot→drop, L2 at5 overshoot→drop, L1 5→7 found
```

**Why systems pick it over a balanced tree:** simpler concurrent implementation (no global rebalancing → fine-grained/lock-free insert), and good cache behavior. **Redis sorted sets (ZSET)** use a skip list + hash map (so `ZRANGEBYSCORE` is range-scan friendly while `ZSCORE` is O(1)). **LevelDB/RocksDB memtables**, **Apache Lucene**, and **Java's `ConcurrentSkipListMap`** use skip lists. Probabilistic balance means a pathological RNG could degrade it, but with `p=0.5` the chance of being far from `log n` is astronomically small.

---

## 9. Common pitfalls / war stories

- **Wrong error direction.** Treating a Bloom filter "yes" as authoritative and skipping the real lookup → serving stale/wrong data on false positives. Bloom answers are a *fast path*, always backed by the source of truth.
- **Resizing a Bloom filter under load.** Sizing for `n=1M` then pushing 10M → FP rate silently climbs toward 100% and the filter stops filtering. Monitor fill ratio; use scalable Bloom or rebuild.
- **HLL intersection math.** Computing user-overlap between two segments via inclusion–exclusion when the overlap is tiny → error larger than the answer. Keep exact small sets, or use MinHash for similarity.
- **Averaging percentiles.** Dashboards that `avg(p99)` across hosts report a number that is *neither* the fleet p99 nor meaningful. Aggregate t-digests/histograms, not the percentiles.
- **CMS for rare items.** Using Count-Min to detect *infrequent* events → noise swamps signal because error scales with total stream weight `ε·N`. CMS is for heavy hitters only.
- **Consistent hashing without vnodes.** A 5-node cluster with one ring point each gets 40/10/25/15/10 load splits; the hot node tips over. Always vnode.
- **Geohash edge blindness.** "Nearest store" misses the store 50 m away across a cell boundary. Always query neighbor cells.
- **Non-idempotent sketch merges.** Double-counting the same shard's HLL/CMS into a rollup (HLL max is idempotent; CMS add is **not** — re-adding inflates counts). Know which merge op is idempotent.
- **Hash quality.** All of these assume *uniform* hashing. A weak hash (or attacker-chosen keys) clusters items, breaking every bound at once. Use murmur/xxhash/SipHash (SipHash for adversarial inputs).

---

## 🧩 Case Study: Reddit's unique-pageview counts with HyperLogLog

**The problem.** Reddit wanted to show a "unique views" number on every one of its millions of posts (the "x views" counter under a submission). At Reddit's scale this is brutal: hundreds of millions of pageviews per day, tens of millions of distinct posts, and a long tail where popular posts get *millions* of viewers while most posts get a handful. The naive "exact" approach is to keep, per post, the set of every viewer who has seen it (by user id or a hashed visitor id) and report `len(set)`. With ~300M+ events/day fanning into millions of posts, those per-post sets collectively run to **billions of stored ids** — far too much memory to keep hot, and the write path (SADD into a giant per-post set on every pageview) would hammer the datastore. Crucially, the product requirement is a *display* counter: nobody cares whether a post shows 1,200,000 or 1,206,300 views. **Exactness here is unnecessary** — exactly the situation §0 describes.

**Applying the module.** This is the textbook **cardinality estimation** problem from §2, so Reddit reached for **HyperLogLog**. Each post gets one HLL sketch keyed by `post_id`. On a pageview they `PFADD` the viewer's id into that post's sketch; to render the counter they `PFCOUNT` it. The set of "who viewed" is never materialized — only the **lossy fingerprint** of the viewer stream is kept, which is the core probabilistic move from §0: *stop storing elements; store a sketch of the stream.*

The numbers come straight from the §2 mechanics. A Redis-style dense HLL is **~12 KB** per key (`m = 16384` registers at 6 bits each) with a **standard error ≈ `1.04/√m` ≈ 0.81%**. So a post with a million true viewers reports within roughly ±8,000 — invisible on a rounded "1.2M views" badge. That 12 KB is **constant regardless of whether the post has 10 viewers or 10 million** — the flat `O(log log n)` memory curve that makes HLL viable. Compare to the exact set: a million 64-bit viewer ids is ~8 MB *for one hot post*; HLL is ~700× smaller, and the saving compounds across millions of posts.

Reddit's real pipeline added two refinements the module calls out:

1. **Mergeability across a streaming pipeline.** Pageview events flow through Kafka into a stream processor. Rather than mutate one Redis key on the hot path per event, workers build **partial HLLs per time-window/per-partition**, and these are combined with the **register-wise `max`** union (`PFMERGE`) — the idempotent merge from §2. This is what lets the count be computed in parallel across shards and rolled up without coordinating on a single counter.

2. **HLL++ small-range correction.** Most posts are *not* viral; they have tens of viewers. Raw HLL is biased for small `n`, so the **linear-counting / sparse-representation** path from §2 ("HLL++") keeps the long tail of low-traffic posts accurate and cheap (a few hundred bytes) before switching to the dense 12 KB form only for the posts that actually get big.

```
   pageview events                        per-post HLL sketches (12 KB each)
   ───────────────                        ─────────────────────────────────
   user → /r/x/post_42  ─┐
   user → /r/y/post_99  ─┤   Kafka    ┌── worker A: partial HLLs ─┐
   user → /r/x/post_42  ─┼─────────▶  ├── worker B: partial HLLs ─┼─ PFMERGE (register-wise max)
   user → /r/z/post_42  ─┘            └── worker C: partial HLLs ─┘            │
                                                                               ▼
                                              post_42 sketch ──PFCOUNT──▶ "1.2M views"  (±0.81%)
```

**The trade-off they accepted.** They gave up **exactness and the ability to answer per-viewer questions** in exchange for bounded memory and cheap, mergeable writes. The HLL can tell you *roughly how many* distinct viewers a post had; it can **never** tell you *whether a specific user* viewed it, nor the precise count — and as §2 warns, you can't cheaply intersect two HLLs ("how many people saw both post A and post B?") without inclusion–exclusion blowing up when the overlap is small. For a public vanity counter those are non-needs, so the trade is almost free. The accuracy they bought (~0.8%) is far tighter than the display rounding, and the memory they saved is the difference between "fits in Redis" and "doesn't fit anywhere hot."

**Results.** Per-post memory dropped from *O(viewers)* to a flat **~12 KB**, with error well under 1% — orders of magnitude less RAM than exact sets while keeping the counter accurate enough that no human notices the slack. The write path became a single fixed-cost `PFADD`/merge instead of an ever-growing set insert, so it stays O(1) in space and time even as a post goes viral. The same HLL pattern underlies `APPROX_COUNT_DISTINCT` in BigQuery/Redshift/Presto and `PFCOUNT` in Redis (§2) — Reddit's case is just the canonical product-facing instance of it.

**Lessons**
- **Match the structure to the actual requirement, not the literal ask.** "Count unique viewers" *sounds* like it needs a set; the product only needs a rounded number, so a 12 KB sketch beats an 8 MB set with no user-visible loss. Always ask §0's question: *is exactness actually required here?*
- **Constant memory regardless of scale is the headline feature.** HLL's `O(log log n)` curve means a 10-viewer post and a 10-million-viewer post cost the same — that flatness is what makes it deployable across millions of keys.
- **Pick structures whose merge op is idempotent for streaming rollups.** Register-wise `max` lets you fan out across Kafka partitions and recombine safely; re-merging the same partition can't double-count (unlike a Count-Min `add`).
- **Know what the sketch can't do.** No per-user membership, no cheap intersection — if you later need "did user U see post P?" or accurate overlap, HLL is the wrong tool and you must reach for a Bloom filter or MinHash instead.

## 10. Test yourself

1. You need to count daily unique visitors across 200 web servers and report a single global number with <1% error. Which structure, how much memory per server, and what's the merge operation? *(Hint: HLL, 12 KB, register-wise max.)*
2. A Bloom filter sized for 1% FP at 10M items is now holding 30M. What happened to the FP rate and why? *(Hint: `p_fp ≈ (1−e^{−kn/m})^k`; n tripled → FP soars.)*
3. Why can Count-Min answer "is X a heavy hitter?" but not "is X rare?" Which way does its error point? *(Hint: collisions only add; over-count bounded by `ε·N`.)*
4. Your service computes fleet p99 as `mean(per_host_p99)`. Why is this wrong, and what should you store instead? *(Hint: percentiles don't average; merge t-digests/histograms.)*
5. Adding the 11th node to a 10-node cluster, how many keys move under `hash mod N` vs consistent hashing with vnodes? *(Hint: ~91% vs ~1/11 ≈ 9%.)*
6. Two restaurants are 30 m apart but their nearest-neighbor geohash query returns only one. What's the bug and the fix? *(Hint: cell-boundary edge problem; query the 8 neighbors.)*
7. Why does Redis use a skip list (not a red-black tree) for sorted sets? *(Hint: range scans + simpler concurrent/insert code, same O(log n).)*
8. Cassandra replicas have diverged after a network partition. What structure finds the differing rows with minimal data transfer, and what's the cost to locate `k` diffs? *(Hint: Merkle tree, `O(k log n)`.)*

## 11. Further reading

- **DDIA** (Kleppmann), *Designing Data-Intensive Applications* — Ch. 5 (Merkle/anti-entropy in replication), Ch. 6 (consistent hashing & partitioning).
- Bloom, "Space/Time Trade-offs in Hash Coding with Allowable Errors" (1970); Fan et al., **"Cuckoo Filter: Practically Better Than Bloom"** (2014).
- Flajolet et al., **"HyperLogLog"** (2007); Heule et al., **"HyperLogLog in Practice"** (Google, 2013, the HLL++ paper).
- Cormode & Muthukrishnan, **"Count-Min Sketch"** (2005); Metwally et al., **"Space-Saving / Efficient Computation of Frequent and Top-k"** (2005); Yang et al., **"HeavyKeeper"** (2018).
- Dunning & Ertl, **"Computing Extremely Accurate Quantiles Using t-digests"**; Masson et al., **"DDSketch"** (Datadog, VLDB 2019).
- Karger et al., **"Consistent Hashing and Random Trees"** (1997); **Amazon Dynamo** paper (2007, vnodes + Merkle).
- **Google S2 Geometry** docs; **Uber H3** docs; Pugh, **"Skip Lists: A Probabilistic Alternative to Balanced Trees"** (1990).
- Official docs: **Redis** (HyperLogLog, GEO, CMS/TOPK, ZSET internals), **RocksDB** Bloom-filter wiki, **BigQuery** `APPROX_*` functions, **Elasticsearch** percentiles aggregation.

*See also: `09-cap-pacelc...md` (why anti-entropy exists), `10-partitioning-and-sharding.md` (consistent hashing in context), `13-observability...md` (quantile sketches in metrics).*
