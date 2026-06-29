# Module 19 - Specialized Systems: Search, Geospatial, Time-Series & Analytics

**What you'll learn:** When a relational table (`SELECT ... WHERE col LIKE '%foo%'`) is the wrong tool, and which purpose-built store replaces it. We cover the four most common "my Postgres can't do this efficiently" workloads - full-text search, geospatial proximity, time-series telemetry, and analytical aggregation - down to the index data structures, ranking math, and failure modes that surface in production and in interviews.

**Prerequisites:** Read `04-storage-engines-btree-lsm.md` (B-tree vs LSM, since these stores reuse both), `05-indexing-and-query-execution.md`, and `13-replication-and-partitioning.md` (sharding shows up everywhere here). For the OLAP section, `09-cap-pacelc-consistency-models.md` helps frame why analytical stores relax consistency.

---

## 0. The core mental model: indexes are shaped like queries

A row-oriented OLTP database (MySQL, Postgres) is optimized for one access pattern: *fetch/modify a few rows by primary key or a selective index*. Its B-tree answers "give me the row(s) where `id = X` or `created_at BETWEEN a AND b`". Every specialized system in this module exists because some query *shape* doesn't fit that:

```
Query shape                          Wrong tool (why)             Right tool (index used)
-----------------------------------  ---------------------------  -----------------------------
"docs containing 'red business      LIKE '%...%' = full scan,     Inverted index (Lucene)
 cards' ranked by relevance"         no ranking
"50 nearest print shops to (lat,    B-tree is 1-D; 2-D range     R-tree / geohash / S2
 lng)"                               needs 2 indexes intersected
"avg CPU per minute over 30 days,   billions of tiny rows,        Columnar TSDB w/ downsampling
 1M series"                          B-tree write amplification
"revenue by region by month across  reads 100% of columns to      Columnar OLAP (star schema)
 2B order rows"                      aggregate 3 of them
```

The skill being taught: **recognize the shape, name the structure, justify the trade-off.**

---

## 1. Search - the inverted index

### Intuition

A book's index at the back maps *word → page numbers*. That's an inverted index. The "forward" direction is `document → words`; you *invert* it to `word → list of documents`. Now "find docs containing X" is a hash lookup, not a scan.

### Mechanics

Three stages turn text into a queryable index:

```
"Red Business Cards!"
   │ 1. Tokenization     -> ["Red", "Business", "Cards", "!"]
   │ 2. Filtering        -> lowercase, strip punctuation, stem ("cards"->"card"),
   │                         drop stopwords ("the","a")
   │ 3. Indexing         -> postings lists
   ▼
TERM       POSTINGS (docID:freq:[positions])
"red"   -> [12:1:[0], 88:2:[3,9], 204:1:[5]]
"busi"  -> [12:1:[1], 47:1:[0]]
"card"  -> [12:2:[2,2], 88:1:[7]]
```

The pipeline (Lucene calls it an **analyzer**) is the single most important and most misused part. *The same analyzer must run at index time and query time.* If you stem at index time but not query time, "running" never matches "run". Components:

- **Tokenizer** - splits on whitespace/punctuation, or uses n-grams (for CJK languages with no spaces), or edge n-grams (for typeahead).
- **Token filters** - lowercasing, stemming (Porter/Snowball), synonym expansion, ASCII-folding (café → cafe), stopword removal.

A **postings list** stores, per term, the documents containing it plus per-doc frequency and positions (positions enable phrase queries - "red card" as an ordered pair, not just both words anywhere). Postings are stored compressed (delta-encoded doc IDs + variable-byte/FOR encoding) so a term appearing in 10M docs isn't 80MB.

### Ranking: TF-IDF → BM25

You don't just want matches, you want them *ranked*. Two classic intuitions:

- **Term Frequency (TF):** a doc mentioning "card" 5× is more about cards than one mentioning it once.
- **Inverse Document Frequency (IDF):** "card" appearing in every doc is uninformative; "lenticular" appearing in 3 docs is highly discriminating. Rare term = high weight.

TF-IDF = `TF × log(N / df)`. **BM25** (Lucene/Elasticsearch default since ES 5.0) fixes two TF-IDF flaws:

1. **TF saturation** - the 20th occurrence of a word shouldn't add as much as the 2nd. BM25 has a saturation curve controlled by `k1` (default 1.2).
2. **Length normalization** - a 10,000-word doc naturally contains more terms; penalize length via `b` (default 0.75) relative to average doc length.

```
                IDF(term)  ·  TF(term,doc) · (k1 + 1)
BM25 = Σ      ───────────────────────────────────────────────
     terms     TF + k1 · (1 - b + b · |doc| / avgdoclen)
```

> Back-of-envelope: a single-shard BM25 query over 10M docs returns top-10 in **~5–50 ms** because it walks compressed postings, not raw text. The cost driver is *number of shards fanned out × postings length*, not corpus size on disk.

### Architecture: Lucene → Elasticsearch/OpenSearch

```
                 Elasticsearch / OpenSearch cluster
   ┌──────────────────────────────────────────────────────────┐
   │  Index "products"  =  N primary shards + R replicas        │
   │                                                            │
   │   Shard 0 (a Lucene index)   Shard 1   ...   Shard N       │
   │   ┌────────────────────┐                                   │
   │   │ Segment  Segment    │  <- immutable Lucene segments    │
   │   │  (inverted idx +    │     merged in background         │
   │   │   doc values +      │                                  │
   │   │   stored fields)    │                                  │
   │   └────────────────────┘                                  │
   └──────────────────────────────────────────────────────────┘
   Query = scatter to all shards -> each returns local top-K
         -> gather/merge -> global top-K  (scatter-gather)
```

Key architectural facts that bite people:

- **Segments are immutable.** A document update = mark old doc deleted (tombstone) + write new doc to a new segment. Deletes reclaim space only on **merge**. This is an LSM-style design (see `04-...`).
- **Near-real-time, not real-time.** A write goes to an in-memory buffer + translog; it's not searchable until a **refresh** (default 1s). So ES is eventually consistent for reads-after-write. Don't build "user posts comment, immediately re-query ES to show it" - read your own write from the source DB.
- **Doc values** are a columnar, on-disk structure (separate from the inverted index) used for sorting, aggregations, and faceting - because the inverted index is term→doc, but sorting needs doc→value.
- **Shard count is fixed at creation.** Over-shard and you get tiny-segment overhead + scatter-gather fan-out cost; under-shard and you can't scale or rebalance. Rule of thumb: target **10–50 GB per shard**.

### Fuzzy / typeahead / did-you-mean

| Technique | How | When to use |
|---|---|---|
| **Edit distance (Levenshtein)** | Match terms within N character edits; Lucene uses a Levenshtein automaton, not pairwise comparison | Typo tolerance ("buisness"→"business"); cap at distance 1–2 |
| **Edge n-grams** | Index `c, ca, car, card` at index time | As-you-type prefix autocomplete; fast but inflates index |
| **Completion suggester (FST)** | A finite-state transducer in memory | Sub-ms typeahead; can't do mid-word matching |
| **n-gram (non-edge)** | Index all substrings | Infix/"contains" matching; very large index |
| **Phonetic (Soundex/Metaphone)** | Index by how it sounds | Name search ("Smith"/"Smyth") |

War-story trade-off: edge n-grams blow up index size and force you to reindex to change min/max gram size. The completion suggester is faster but lives in heap memory - large suggestion sets cause GC pressure.

---

## 2. Geospatial - making 2-D queries fast

### Intuition

A B-tree sorts on one dimension. "Find shops within 5 km of me" is inherently 2-D: a point close in latitude can be far in longitude. You can't sort 2-D space linearly... unless you **flatten 2-D into 1-D while preserving locality** (so nearby points get nearby keys). That's the whole game.

### The four data structures

```
GEOHASH (space-filling curve)          QUADTREE (recursive subdivision)
 Divide world into a grid, interleave    ┌─────┬─────┐   split a cell into 4
 lat/lng bits into one base32 string.    │  •  │     │   when it has too many
 "9q8yy" ~ ±0.6km cell.                   ├──┬──┼─────┤   points; dense areas
 Prefix match = same region.             │•│• │     │   get deeper trees.
 ⚠ adjacent cells can differ in prefix   └─┴──┴─────┘
   (the "edge problem").

R-TREE (bounding boxes)                 S2 (Google) / H3 (Uber)
 Group nearby objects in minimum         Project sphere onto a cube,
 bounding rectangles, nested in a tree.   use a Hilbert curve per face.
 Great for polygons/extents, not just     Fixes geohash's poles/edge
 points. (PostGIS GiST uses R-tree.)      distortion; S2=squares, H3=hexagons.
```

| Structure | Indexes | Strength | Weakness | Real systems |
|---|---|---|---|---|
| **Geohash** | points | Dead simple, prefix = region, works in any KV store | Edge/seam problem; rectangular cells distort near poles | Redis GEO (geohash on a sorted set), early Elasticsearch |
| **Quadtree** | points | Adapts to density; great for "load tiles in viewport" | Unbalanced under skew; rebalancing cost | Many in-memory map engines |
| **R-tree (GiST)** | points + polygons | Handles extents/shapes, true distance, rich predicates | More complex; insert/update heavier | **PostGIS**, SQLite R*Tree, MySQL spatial |
| **S2 / H3** | points + regions | Uniform cells, hierarchical, no seam distortion, set ops on regions | Library, not a DB; learning curve | Google Maps, Uber (H3 for surge zones), Foursquare |

### Why the edge problem matters (the classic interview trap)

With pure geohash prefix matching, two points 10 m apart can sit in cells with different prefixes (you're on a cell boundary). A naive "same prefix = nearby" query *misses neighbors across the seam*. Fix: query your cell **plus its 8 neighbors**, then post-filter by true Haversine distance. Redis GEO does this internally (`GEOSEARCH`).

### PostGIS - the workhorse

PostGIS extends Postgres with a `geography`/`geometry` type and a **GiST index** (R-tree variant). A nearby query:

```sql
SELECT id, name FROM shops
WHERE ST_DWithin(location, ST_MakePoint(:lng,:lat)::geography, 5000)  -- 5 km
ORDER BY location <-> ST_MakePoint(:lng,:lat)::geography              -- KNN, index-assisted
LIMIT 50;
```

The `<->` KNN operator uses the GiST index to walk the tree in nearest-first order - it does **not** scan all rows. `ST_DWithin` uses a bounding-box pre-filter (cheap) then exact distance (expensive) only on candidates. Use `geography` (treats Earth as a spheroid, meters) for real distances; `geometry` (planar, faster) only if your data is small-area and projected.

> Numbers: GiST KNN over ~10M points returns 50 nearest in **single-digit ms**. The cost is tree height (~log of node count). PostGIS scales to tens of millions of points on one node before you need to shard by region (and region-sharding reintroduces the edge problem at shard boundaries).

### Redis GEO

Built on a sorted set where the score *is* the 52-bit geohash. `GEOADD`/`GEOSEARCH BYRADIUS`. Blazing fast, in-memory, but it's points-only, no polygons, and you inherit Redis durability/memory trade-offs. Use it for "live driver positions" leaderboards, not for authoritative spatial data.

---

## 3. Time-Series Databases (TSDB)

### Intuition

Metrics/IoT/telemetry are append-only, timestamp-ordered, and queried by *range over time* + *grouped by series*. You write 1M points/sec, never update them, and care about "last 5 min" far more than "this point from 90 days ago". A general DB treats each point as a precious mutable row with a B-tree - catastrophic write amplification. A TSDB treats time as the primary axis.

### What makes a TSDB different

```
A "series" = metric name + label set, identified by a series key:
   http_requests_total{method="POST", route="/checkout", status="500"}
                       └──────────────── the cardinality bomb ────────────┘

Storage layout (conceptual):
  series_id │ ──────────── time-ordered, delta+columnar compressed ──────────►
   1001     │ t0:v t1:v t2:v t3:v ...   (one tightly packed column per series)
   1002     │ t0:v t1:v t2:v ...
```

Core techniques every TSDB shares:

1. **Columnar / delta-of-delta compression.** Timestamps are near-uniform, so store deltas-of-deltas (often 1 bit each); values use XOR float compression (Facebook **Gorilla** paper - ~1.37 bytes/point vs 16). 10×+ compression is normal.
2. **Downsampling / rollups.** Raw 10 s data → 1 min avg/max → 1 h avg. Old high-resolution data is aggregated and discarded.
3. **Retention policies.** Drop data older than N days *by dropping whole time-partitioned chunks*, not row-by-row `DELETE` (which would be O(rows) and fragment the heap).
4. **Time-partitioned chunks.** Data lands in the "hot" recent chunk (in memory/WAL), older chunks become immutable and compressed.

### The #1 failure mode: cardinality explosion

Cardinality = number of distinct series = product of label-value combinations. Add a label like `user_id` or `request_id` and you go from 1,000 series to 100,000,000. Each series needs an index entry and an open in-memory chunk. **This OOM-kills Prometheus** and is the single most common TSDB incident.

```
labels: {method, status, route}  -> 4 × 5 × 50  = 1,000 series   ✅
add label: user_id (1M users)    -> 1,000 × 1M  = 1 billion      💥 OOM
```

Rule: labels must be **bounded, low-cardinality dimensions**. High-cardinality IDs belong in logs/traces, not metric labels.

### The big three compared

| | Prometheus | InfluxDB | TimescaleDB |
|---|---|---|---|
| Model | Pull (scrapes targets) | Push | Push (it's Postgres) |
| Storage | Custom TSDB (local) | TSM (LSM-like) | Postgres + hypertable chunks |
| Query lang | PromQL | Flux / InfluxQL | **SQL** + time functions |
| HA / scale | Single-node; federate or use **Thanos/Cortex/Mimir** for long-term + global | Clustering in enterprise | Postgres replication; sharding harder |
| Best for | Infra/k8s monitoring, alerting | General IoT/metrics, push pipelines | Teams wanting SQL + joins to relational data |
| Gotcha | Local storage = not durable long-term; cardinality limits | Storage engine churn across versions | Inherits Postgres write ceiling; cardinality via chunk bloat |

Prometheus deliberately keeps each node **simple and ephemeral** - it scrapes, stores ~weeks locally, and you bolt on Thanos/Mimir for global query + object-storage long-term retention. This is a CAP/operational choice: monitoring must keep working even when the rest of the world is on fire, so it avoids distributed dependencies.

> Numbers: a single Prometheus node ingests **~1M samples/sec** and holds millions of active series in ~GBs of RAM (each series ~constant overhead). The wall you hit is RAM ∝ active series, not disk ∝ samples.

---

## 4. Analytics / OLAP

### OLTP vs OLAP - the foundational split

| | OLTP (transactional) | OLAP (analytical) |
|---|---|---|
| Query | Few rows by key, read+write | Aggregate many rows, read-mostly |
| Rows touched | 1s–100s | millions–billions |
| Columns touched | most/all of a row | a few of many |
| Latency target | ms | seconds–minutes ok |
| Storage | **row-oriented** | **column-oriented** |
| Example | MySQL, Postgres | BigQuery, Snowflake, ClickHouse, Redshift |

### Why columnar wins for analytics

```
ROW STORE (on disk):                COLUMN STORE (on disk):
[id|name|region|amount|date]        [id,id,id,...]
[id|name|region|amount|date]        [name,name,...]
[id|name|region|amount|date]        [region,region,...]   <- read only these
                                    [amount,amount,...]    <- two columns for
"SUM(amount) GROUP BY region"        [date,date,...]          SUM..GROUP BY
reads EVERY column of EVERY row.    reads 2 of 5 columns.
```

Three compounding wins:
1. **I/O reduction** - read only the columns the query needs. A 5-column-aggregate over a 200-column table reads ~2.5% of the data.
2. **Compression** - a column is one data type with low entropy → run-length encoding, dictionary encoding, bit-packing give 10×+ ratios. Better compression = even less I/O.
3. **Vectorized / SIMD execution** - process a column as a contiguous array in CPU cache, one SIMD instruction over many values. (C-Store/Vertica and MonetDB pioneered this.)

The catch: **columnar is terrible at OLTP.** Inserting one row touches every column file; point updates are expensive. So OLAP stores are append/bulk-load oriented, often immutable+merge (ClickHouse `MergeTree`, an LSM cousin). Don't point a transactional app at a warehouse.

### Schema: star vs snowflake

```
            ┌──────────┐
            │ dim_date │
            └────┬─────┘
 ┌────────┐   ┌──┴───────────────┐   ┌──────────────┐
 │dim_geo │───│  FACT_orders      │───│ dim_product   │
 └────────┘   │ (measures: qty,   │   └──────────────┘
              │  amount, fk's)    │
 ┌────────┐   └──┬────────────────┘
 │dim_cust│──────┘
 └────────┘
```

- **Fact table** - the events/measures (one row per order line), huge, numeric, foreign keys to dims.
- **Dimension tables** - the descriptive context (product, customer, date, geography), small, wide.
- **Star** = dims are denormalized/flat (fast, fewer joins). **Snowflake** = dims normalized into sub-dims (less redundancy, more joins). Warehouses overwhelmingly prefer **star** - storage is cheap, joins are the cost.
- **Slowly Changing Dimensions (SCD Type 2):** when a customer moves region, you don't overwrite - you add a new dim row with validity dates, so historical facts join to the region that was true *at the time*. Forgetting this silently corrupts historical reports (a real war story).

### Warehouse vs Lake vs Lakehouse

| | Data Warehouse | Data Lake | Lakehouse |
|---|---|---|---|
| Storage | Proprietary columnar, schema-on-write | Object store (S3), raw files, schema-on-read | Object store + open table format (Iceberg/Delta/Hudi) |
| Data | Structured, modeled | Anything (JSON, parquet, images, logs) | Structured + semi-structured, governed |
| Strength | Fast SQL, governance, BI | Cheap, flexible, ML/raw data | Warehouse SQL+ACID *on* lake storage |
| Weakness | Expensive, rigid, hard for ML | "Data swamp", no ACID, slow ad-hoc | Newer, operational complexity |
| Examples | Snowflake, BigQuery, Redshift | S3 + Hive/Athena | Databricks (Delta), Iceberg + Trino |

The lakehouse is the current convergence: keep data in cheap S3 **Parquet** files, but add a metadata/transaction layer (**Apache Iceberg / Delta Lake / Hudi**) that gives ACID commits, schema evolution, time-travel, and `MERGE` - so one copy of data serves both BI SQL engines and ML, no copy-into-warehouse step.

---

## 5. Decision guide - pick the right store

```
Is the query...
├─ "match/rank text, fuzzy, faceted"        -> Search engine (Elasticsearch/Lucene)
├─ "near a point / inside a region"          -> Geospatial (PostGIS, Redis GEO, S2/H3)
├─ "metrics over time, downsampled"          -> TSDB (Prometheus/Timescale/Influx)
├─ "aggregate billions of rows, few cols"    -> Columnar OLAP (ClickHouse/BigQuery)
└─ "fetch/update a few rows by key, ACID"    -> stay on Postgres/MySQL ✅
```

**The senior move is usually polyglot persistence with the relational DB as source of truth + a derived index.** E.g. orders live in Postgres; a CDC stream (Debezium → Kafka) materializes them into Elasticsearch for search and ClickHouse for analytics. This keeps writes ACID and reads specialized - at the cost of eventual consistency between the source and the derived stores (see `09-...` and the CDC discussion in `15-...`).

---

## 6. Common pitfalls / war stories

- **Analyzer mismatch.** Index with stemming + synonyms, query without them → "running shoes" returns nothing. *Always* use the same (or a compatible search) analyzer at query time. Symptom: exact-match works, "obvious" matches don't.
- **Using Elasticsearch as a primary database.** It's near-real-time (1 s refresh), has no real transactions, and silently drops/merges on segment merges. People lose data when ES is the only store. Treat it as a *derived index*, reindex-able from a durable source.
- **Mapping explosion / dynamic mapping.** Letting ES auto-create a field per unique JSON key (e.g. `attributes.<sku>`) explodes the mapping and the cluster state. Use `flattened` type or explicit mappings.
- **Geohash edge bug.** Querying only the matching cell misses neighbors across the seam. Always include the 8 adjacent cells + post-filter by Haversine.
- **`geometry` vs `geography` in PostGIS.** Computing distance in `geometry` (planar, degrees) gives nonsense kilometers. Use `geography` for Earth-surface meters.
- **Cardinality bomb in metrics.** Adding `user_id`/`trace_id`/`url-with-querystring` as a Prometheus label = millions of series = OOM. Keep labels bounded; push IDs to logs/traces.
- **Deleting old TSDB data with `DELETE`.** Row-by-row deletes fragment and choke the engine. Use retention/chunk-drop. Same lesson in Postgres partitioning: `DROP PARTITION`, don't `DELETE`.
- **Running analytics on the OLTP replica.** A `GROUP BY` over the orders table on a row store scans everything, blows the buffer cache, and tanks transactional latency. ETL/CDC into a columnar store instead.
- **Over-sharding Elasticsearch.** "More shards = faster" is wrong; each shard is a Lucene index with fixed overhead, and scatter-gather fan-out grows. Size shards to 10–50 GB.
- **Forgetting SCD Type 2.** Overwriting a dimension corrupts every historical report that depended on the old value. Version dimension rows.

---

## 🧩 Case Study: Uber's H3 Geospatial Index

### The problem

Uber's marketplace is one continuous spatial-matching engine: at any instant it tracks **millions of live drivers**, and at peak handles on the order of **tens of millions of trips per day** - well over a million ride requests per hour globally. Every one of those requests is the geospatial query from §2: *"of all the drivers near this rider right now, which are the closest?"* - answered in tens of milliseconds, continuously, for every city on Earth.

Two harder layers sit on top of plain proximity. **Surge pricing** needs to aggregate supply (drivers) and demand (open requests) into pricing *zones* and recompute multipliers every few minutes. **Marketplace analysis** needs to compare "how busy is this area" across cities - but a fixed lat/lng grid has cells of wildly different real-world area near the poles vs. the equator, so a zone in London isn't comparable to one in Lima. They needed a spatial unit that is (a) fast to look up, (b) hierarchical for roll-ups, and (c) **uniform in area** so cross-city aggregation is honest.

### Why a relational DB fails here

This is the exact §2 "wrong tool" story. A row in Postgres lives in a B-tree, which is one-dimensional - it sorts on a single key. A nearby query is irreducibly 2-D: a driver close in latitude can be far in longitude. The naive fixes all break at Uber's scale:

- **Two B-tree indexes (one on lat, one on lng) intersected** - the §0 table's "2-D range needs 2 indexes intersected" trap. Each index is unselective (a thin latitude band still spans the whole planet's longitude), so the intersection scans enormous candidate sets.
- **PostGIS GiST/R-tree on one node** - genuinely good (the §2 workhorse), but §2's own number is the ceiling: "tens of millions of points on one node before you need to shard by region - *and region-sharding reintroduces the edge problem at shard boundaries*." Uber's write rate (every driver pinging GPS every few seconds = millions of *updates* per second) and global footprint blow past a single spatial node.
- **`SELECT ... WHERE distance < 5km`** scanning every driver - a full scan per request, millions of times an hour. Dead on arrival.

So Uber did the §5 "recognize the shape, name the structure, justify the trade-off" move and reached for a **specialized spatial index** instead of a general DB.

### Applying the module's concepts: H3

H3 is precisely the **"S2/H3" row of the §2 data-structures table** - "project sphere onto a polyhedron, use a hierarchical curve, fixes geohash's poles/edge distortion." The key implementation choices map straight onto §2:

- **Flatten 2-D into 1-D while preserving locality** (§2 intuition). H3 projects the globe onto an icosahedron (20 triangular faces) and tiles each face with **hexagons**, addressed by a 64-bit `H3Index`. `latLngToCell(lat,lng,res)` turns any coordinate into one integer key - the same trick as geohash, but on a better surface.
- **Hexagons over squares** - H3's deliberate divergence from geohash/S2 squares. A hexagon has only **one class of neighbor** (all 6 share an edge, all roughly equidistant from center), whereas a square has edge-neighbors *and* corner-neighbors at different distances. This makes "expand the search ring" and flow/movement modeling clean.
- **Hierarchy for roll-ups** - 16 resolutions (res 0 ≈ continent, res 9 ≈ ~0.1 km² city block). `cellToParent` / `cellToChildren` let surge aggregate fine cells into coarse zones, the spatial analogue of TSDB downsampling (§3).
- **The edge problem, handled by design** (§2's "classic interview trap"). A nearby search isn't "same prefix"; it's `gridDisk(cell, k)` - return this hex plus all hexes within `k` rings - then post-filter by true Haversine distance. This is §2's "query your cell **plus its neighbors**, then post-filter by true distance," made first-class.

Data flow for "find nearby drivers":

```
 Driver GPS ping ──► latLngToCell(lat,lng, res9) ──► H3Index (uint64)
                                                         │
            in-memory map:  H3Index ──► {driverIds...}   │  (sharded by cell)
                                                         ▼
 Rider request ─► riderCell = latLngToCell(rider)
                  candidateCells = gridDisk(riderCell, k=2)   ← cell + rings
                  drivers = union(map[c] for c in candidateCells)
                  return top-N by Haversine(rider, driver)    ← exact post-filter
```

Because the key is just a `uint64`, the index is **not a database** (the §2 caveat: "library, not a DB") - Uber shards driver-location maps by H3 cell across an in-memory fleet, exactly the §5 "specialized index, relational DB as source of truth" polyglot pattern. Trips and payments stay in the durable store; the hot spatial layer is derived and rebuildable.

### The trade-off they accepted

H3's headline win - **uniform-area cells** for honest cross-city comparison - is bought with **a small, permanent geometric lie**: you *cannot* perfectly tile a sphere with hexagons. Every H3 grid contains exactly **12 pentagons** (inherited from the icosahedron's 12 vertices), and parent/child hexagons don't nest perfectly (a child isn't fully contained by one parent - "containment" is approximate). Uber accepted approximate hierarchy and 12 special-case cells (placed over oceans, where almost no rides happen) in exchange for near-uniform area and clean neighbor math. For a marketplace that cares about *relative* density and fast neighbor expansion, approximate nesting is a fine price; for legal/cadastral boundary work it would be the wrong choice (use PostGIS polygons, §2).

### Results

- Nearby-driver lookups become a `uint64` map hit + a bounded `gridDisk` expansion - **single-digit-millisecond** matching, holding up under millions of location updates per second.
- One uniform grid lets surge and analytics compare any two areas worldwide without per-city grid tuning. H3 is open-sourced and now used well beyond Uber.

### Lessons

- **Choose the index to fit the query shape, not the DB you already run.** A 2-D proximity query on a 1-D B-tree is the canonical mismatch; reach for a spatial index even if it means leaving your relational comfort zone.
- **The grid's *geometry* is a design parameter.** Hexagons vs. squares, uniform vs. variable area, perfect vs. approximate nesting - each is a real trade. Uber traded perfect hierarchy for uniform, comparable cells.
- **Edge/seam handling is not optional.** "Same cell" never means "all neighbors"; always expand by neighbor rings (`gridDisk`) and post-filter by true distance.
- **Keep the spatial layer derived.** The fast in-memory H3 index is rebuildable from the durable source of truth - the §5 polyglot-persistence pattern, so you get specialized reads without risking ACID writes.

## 7. Test yourself

1. Why does the same analyzer have to run at both index and query time? Give a concrete failure if it doesn't.
   *Hint: stemming/case/synonyms must align or the query term never matches the indexed term.*
2. Two BM25 improvements over TF-IDF - name them and the parameter that controls each.
   *Hint: `k1` (TF saturation), `b` (length normalization).*
3. A user posts data, then immediately re-queries Elasticsearch and doesn't see it. Why, and what's the fix?
   *Hint: refresh interval (~1 s, near-real-time); read-your-write from the source DB, don't lower refresh globally.*
4. Explain the geohash "edge problem" and the standard query fix.
   *Hint: boundary points get different prefixes; query the cell + 8 neighbors, post-filter by true distance.*
5. You add a `request_id` label to a Prometheus metric and the server OOMs. What happened and what's the rule?
   *Hint: cardinality = product of label values; high-cardinality IDs don't belong in labels.*
6. Why is a column store 10–40× faster for `SUM(amount) GROUP BY region` but unusable for the order-checkout write path?
   *Hint: reads only needed columns + compression + SIMD; but one row insert touches every column file.*
7. When would you choose a lakehouse (Iceberg/Delta) over a classic warehouse?
   *Hint: cheap S3 storage + ACID + one copy serving both BI SQL and ML, with schema evolution/time-travel.*
8. What's wrong with overwriting a `region` value in a dimension table, and what's the pattern?
   *Hint: historical facts re-attribute to the new region; SCD Type 2 with validity dates.*

---

## 8. Further reading

- **DDIA (Kleppmann)** - Ch. 3 "Storage and Retrieval" (B-tree vs LSM, column-oriented storage, data warehousing, star/snowflake schemas). The single best grounding for this module.
- **"Finding the Needle"** - Lucene/inverted index internals; and the *Elasticsearch: The Definitive Guide* sections on analysis, relevance, and shards.
- **Robertson & Zaragoza, "The Probabilistic Relevance Framework: BM25 and Beyond."**
- **Pelkonen et al., "Gorilla: A Fast, Scalable, In-Memory Time Series Database"** (Facebook, VLDB 2015) - delta-of-delta + XOR float compression.
- **Stonebraker et al., "C-Store: A Column-oriented DBMS"** (VLDB 2005) - the columnar OLAP foundation.
- **Google S2 Geometry library docs** and **Uber H3 docs** - hierarchical spherical indexing.
- **PostGIS official docs** - `ST_DWithin`, GiST indexing, `geography` vs `geometry`, KNN `<->`.
- **Prometheus docs** - "Storage" and "Naming/labels (cardinality)"; **Thanos/Cortex/Mimir** for long-term/global.
- **Apache Iceberg / Delta Lake** specifications - open table formats and the lakehouse pattern.
