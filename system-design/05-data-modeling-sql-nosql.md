# 05 — Data Modeling: SQL vs NoSQL & Polyglot Persistence

**What you'll learn:** How to model data for systems that must survive scale, starting from relational normalization and ending at access-pattern-first NoSQL design (single-table DynamoDB, partition/sort key selection, hot-partition avoidance). You'll learn *why* joins die at scale, how each NoSQL family stores and retrieves data, and how to reason about polyglot persistence like a staff engineer in a design review or a 3 a.m. incident.

**Prerequisites:** Read `01-foundations-and-estimation.md` (back-of-envelope math, latency numbers), `03-partitioning-sharding.md` (hash vs range partitioning), and `04-replication-consistency.md` (replica lag, read-your-writes). For the consistency trade-offs referenced here, see `09-cap-pacelc.md`. Caching interactions are covered in `07-caching.md`.

---

## 1. Intuition first: the library vs the warehouse

A **relational database** is a meticulous library. Every fact lives in exactly one place — one shelf for authors, one for books, one for loans. Ask any question ("which books did members born in 1990 borrow?") and the librarian *joins* shelves on the fly. Flexible, no duplication, but every question requires walking between shelves.

A **NoSQL store** is an Amazon fulfillment warehouse. Instead of one canonical shelf per fact, items are pre-packed into the exact box a customer will request. There's duplication (the same SKU sits in many boxes), and you can't easily answer a question you didn't pre-pack for — but the question you *did* design for is a single grab off a single shelf, at any scale.

The fundamental tension: **relational optimizes for storage flexibility and ad-hoc queries; NoSQL optimizes for a known set of queries at extreme scale by trading storage and write-amplification for read locality.**

---

## 2. Normalization: the relational baseline

Normalization removes redundancy so each fact is stored once. The practical targets:

- **1NF** — atomic columns, no repeating groups (no comma-separated lists in a column).
- **2NF** — no partial dependency on part of a composite key.
- **3NF / BCNF** — no transitive dependencies; every non-key column depends on *the key, the whole key, and nothing but the key*.

```
NORMALIZED (3NF)
  orders(id, customer_id, created_at)
  customers(id, name, email)
  order_items(order_id, product_id, qty)
  products(id, name, price)

  "Show order #42 with customer + items + product names"
  → JOIN orders ⨝ customers ⨝ order_items ⨝ products
```

**Why normalize:** a customer renames themselves once, in one row. No update anomalies, no contradictory copies, minimal storage. This is correct, and for OLTP systems that fit on one (replicated) primary, it is usually the *right default*. Most apps never outgrow a well-indexed Postgres instance — see the war stories in §11.

**Denormalization** deliberately reintroduces redundancy to avoid a join: copy `customer_name` onto the order, or store a JSON blob of items on the order row. You trade write complexity and consistency risk for read speed.

| | Normalized | Denormalized |
|---|---|---|
| Storage | Minimal | Larger (duplicated facts) |
| Write path | Single write, clean | Must update N copies (write amplification) |
| Read path | Joins at query time | Pre-joined, single fetch |
| Consistency | Strong by construction | Risk of stale/divergent copies |
| Ad-hoc queries | Excellent | Poor (only pre-modeled shapes) |
| When to use | OLTP, evolving queries, moderate scale | Read-heavy hot paths, known queries, scale-out |

---

## 3. Why joins die at scale

A join on a single machine is cheap: hash-join or merge-join over local pages, O(n+m). The problem is **distributed joins**. Once `orders` lives on shard A (keyed by `order_id`) and `customers` lives on shard B (keyed by `customer_id`), joining them requires shipping rows across the network — a *shuffle*.

Back-of-envelope: a hash join of two 10 M-row tables co-located in RAM is ~milliseconds. The same join across a 20-node cluster must repartition both tables over the network. At 100 bytes/row that's ~1 GB shuffled each side; at 10 Gbps that's ~1.6 s *just for data movement*, plus tail-latency from the slowest node (see `08-latency-tail-percentiles.md`). The join cost grows with fan-out and the slowest shard, not the average. This is why analytics engines (Spark, Presto/Trino) treat the shuffle as the dominant cost and why OLTP systems avoid cross-shard joins entirely.

**The scale-out resolution:** don't join at read time. Either (a) pick a partition key so related rows co-locate (all of a customer's orders on one shard), or (b) pre-join at write time (denormalize). NoSQL chooses (b) aggressively.

---

## 4. The NoSQL families

"NoSQL" is four different things with different physics. Pick the family by *access pattern*, not by hype.

```
KEY-VALUE          DOCUMENT            WIDE-COLUMN              GRAPH
 key → blob         key → JSON tree     row → sparse columns     nodes + edges
 [k]:[......]       {id, nested[...]}    rowkey | cf:col=val ...   (A)-[REL]->(B)
 O(1) by key        O(1) by id +         range scan by rowkey,     traverse adjacency
 no query inside    secondary indexes    columns grouped on disk   index-free hops
```

| Family | Data model | Reads it's great at | Reads it's bad at | Real systems |
|---|---|---|---|---|
| **Key-value** | Opaque value by key | Point get/put by key | Anything not by key | Redis, DynamoDB (core), Riak, memcached |
| **Document** | Nested JSON per id | Fetch whole aggregate by id; some secondary-index queries | Cross-document joins, multi-doc transactions (historically) | MongoDB, Couchbase, Firestore |
| **Wide-column** | Rows of sparse, grouped columns; range scans within a partition | Time-series, "give me row X cols A–F", range scans | Ad-hoc filters on non-key columns | Cassandra, ScyllaDB, HBase, Bigtable |
| **Graph** | Nodes + edges, index-free adjacency | Multi-hop traversals (friends-of-friends, paths) | Bulk aggregation, full scans | Neo4j, Neptune, JanusGraph |

Key insight per family:

- **Key-value** is the substrate everything else is built on. DynamoDB and Redis are key-value at heart; richer models are layers on top.
- **Document** stores reward the *aggregate* pattern (Domain-Driven Design): store the whole consistency boundary (order + its items + shipping) as one document so the common read is one fetch and the common write is one atomic update.
- **Wide-column** is built on the **LSM-tree** (log-structured merge-tree): writes append to a memtable + commit log, flush to immutable SSTables, and compact in the background. This gives huge write throughput (sequential I/O) at the cost of read amplification and compaction load. Cassandra's data model is literally "a distributed, sorted, sparse map indexed by `(partition key, clustering columns)`." See the Bigtable paper.
- **Graph** stores precompute adjacency so a hop is a pointer-follow, not an index lookup — "index-free adjacency." A 5-hop traversal that would be five self-joins in SQL is five pointer hops in Neo4j.

> Note on the LSM-tree vs B-tree split: relational engines (Postgres, InnoDB) default to **B-trees** — read-optimized, in-place updates, lower write throughput. LSM engines (Cassandra, RocksDB, modern DynamoDB internals) are **write-optimized**. This is the deepest read-vs-write trade-off in storage and is covered further in DDIA Ch. 3.

---

## 5. The access-pattern-first method (the core skill)

Relational modeling starts with *entities* ("what things exist?"). NoSQL modeling starts with *queries* ("what will the application ask, how often, and how fast?"). Reverse the process:

```
1. Enumerate EVERY access pattern (read + write) with frequency + latency target.
     e.g.  - getOrderById            (10k/s, p99 < 10ms)
           - listOrdersByCustomer    (2k/s,  newest first, paginated)
           - listOrdersByStatus      (admin, 50/s)
2. For each, decide the key (partition + sort) or index that answers it in ONE request.
3. Collapse overlapping patterns onto shared keys → minimize number of tables/indexes.
4. Only THEN draw the physical model.
```

If you can't name the access pattern, you can't model for NoSQL. This is why DynamoDB design reviews open with "list your queries," not "draw your ER diagram."

---

## 6. Choosing a partition key and sort key

This is the single highest-leverage decision in a NoSQL system. It determines both *correctness of access* and *distribution of load*.

**Partition key (PK / hash key):** hashed to pick a physical partition. It defines the unit of co-location and the unit of contention. Rules:
- **High cardinality** — many distinct values so load spreads (`user_id`, not `country`).
- **Even access distribution** — values should be hit roughly uniformly over time (avoid `status` where 90% of traffic is `status=PENDING`).
- **Matches your most frequent point/range query's grouping** — everything you fetch together must share a PK.

**Sort key (SK / range key):** orders items *within* a partition and enables range queries, pagination, and "latest N." Composite sort keys encode hierarchy:

```
PK = CUSTOMER#123
SK = ORDER#2026-06-16#A1     → range query SK begins_with "ORDER#" gives all orders, sorted by date
SK = PROFILE#                → same partition holds the profile row too
SK = ADDR#home / ADDR#work   → and the addresses
```

This is **item collocation**: one query against `PK=CUSTOMER#123` with a `begins_with` on SK returns the whole customer aggregate in a single round trip — the NoSQL replacement for a join.

| Decision | Good choice | Bad choice | Failure if wrong |
|---|---|---|---|
| Partition key | `userId` (high cardinality, even) | `tenantId` when one tenant is 90% of traffic | Hot partition, throttling |
| Sort key | `createdAt` (enables "latest", pagination) | random UUID | Can't range-scan, no ordering |
| Aggregate boundary | per-customer collocated items | one giant partition for all orders | Unbounded partition growth |

---

## 7. Single-table design (DynamoDB)

DynamoDB's most counterintuitive practice: put *multiple entity types in one table* and overload generic keys (`PK`, `SK`, `GSI1PK`...). The goal is to satisfy many access patterns with the fewest requests, because DynamoDB has no joins and charges per request/RCU.

```
  PK            | SK                  | type     | attrs...
  --------------|---------------------|----------|---------------------------
  CUSTOMER#123  | PROFILE#            | customer | name, email
  CUSTOMER#123  | ORDER#2026-06-16#A1 | order    | total, status
  CUSTOMER#123  | ORDER#2026-06-10#A0 | order    | total, status
  ORDER#A1      | ITEM#prod-9         | item     | qty, price
  ORDER#A1      | ITEM#prod-3         | item     | qty, price

  getCustomerWithOrders: Query PK=CUSTOMER#123        → profile + all orders, 1 request
  getOrderWithItems:     Query PK=ORDER#A1            → all line items, 1 request
```

**Why this is worth the cognitive cost:** the relational version of "customer dashboard" is 3–4 joins; here it's one `Query` returning a pre-sorted, collocated item collection in single-digit milliseconds at any scale. The cost is rigidity — a genuinely new access pattern may need a new index or a backfill.

When single-table is *wrong*: highly relational, ad-hoc analytical workloads; small apps where the operational simplicity of Postgres wins; or teams without DynamoDB depth (the model is unforgiving). Don't cargo-cult it. (Alex DeBrie's *DynamoDB Book* is the canonical treatment.)

---

## 8. Secondary indexes in NoSQL

A secondary index lets you query by an attribute that isn't the table's primary key — by maintaining a *second copy* of the data keyed differently.

- **Local Secondary Index (LSI):** same partition key, *different sort key*. Shares the partition, so it's strongly consistent — but bounded by the 10 GB per-partition limit and must be created at table creation.
- **Global Secondary Index (GSI):** *entirely different* partition + sort key. It's an asynchronously-replicated denormalized copy. **Eventually consistent** (typically <1 s lag, but unbounded under load), with its own provisioned capacity. The dominant tool for "query by status," "query by email," etc.

```
Base table keyed by (CUSTOMER#, ORDER#)         GSI1 keyed by (STATUS, createdAt)
  ...needs "all PENDING orders, newest first"  → write also sets GSI1PK=STATUS#PENDING
  DynamoDB async-replicates matching items into GSI1; query GSI1 to get them sorted.
```

| | LSI | GSI | Cassandra secondary index | Cassandra materialized view |
|---|---|---|---|---|
| Different partition key | No | Yes | No (queries the same node set) | Yes |
| Consistency | Strong | Eventual | Local/strong-ish | Eventual |
| Cost model | Shares table capacity | Own capacity | Cheap but scatter-gather | Extra writes |
| Pitfall | 10 GB partition cap | Hot GSI partitions, throttle propagates back | Low-cardinality index = full-cluster scatter | Can silently diverge |

**The deep failure mode:** a GSI with a low-cardinality partition key (e.g. `GSI1PK = status`) recreates the hot-partition problem on the index, and because the index shares the write path, **a throttled GSI throttles the base-table write**. Index choice can break the table it indexes.

---

## 9. Materialized views & write-vs-read optimization

You always pay the read-vs-write cost *somewhere*. The lever is **where** you do the work.

```
WRITE-TIME work (fan-out-on-write)        READ-TIME work (fan-out-on-read)
  write → compute → store N denormalized     write once → read → join/aggregate live
  copies / push to followers' feeds
  fast reads, expensive writes               cheap writes, expensive reads
  good when read:write >> 1                   good when write:read high or fan-out huge
```

This is exactly Twitter's timeline problem: fan-out-on-write (push each tweet into all followers' precomputed timelines) gives O(1) reads but explodes for celebrities with 100 M followers (one tweet = 100 M writes). Twitter uses a **hybrid**: fan-out-on-write for normal users, fan-out-on-read (merge at query time) for celebrities. (DDIA Ch. 1 walks this exact case.)

**Materialized views** are write-time precomputation managed by the datastore: a continuously-maintained, denormalized query result. Cassandra materialized views, Postgres `MATERIALIZED VIEW` (manual `REFRESH` — *not* automatic), and stream-processing views built from a Kafka changelog (see `12-stream-processing.md`) all implement this. The query that was a 4-table join becomes a single keyed read against the view.

**CQRS** (Command Query Responsibility Segregation) generalizes this: writes go to a normalized model; a stream of change events projects into many read-optimized denormalized views, each tuned to one query. Polyglot persistence (next) is CQRS taken to its logical end — different *databases* per read shape.

---

## 10. Polyglot persistence

Stop forcing one database to be good at everything. Use the right store per access pattern, kept in sync via a change stream (CDC / event log).

```
                         ┌──────────────┐  CDC / events   ┌─────────────────┐
  writes ───► Postgres ──┤  source of   ├────────────────►│ Elasticsearch   │ (full-text search)
            (OLTP truth) │   truth      ├────────────────►│ Redis           │ (session/cache)
                         └──────────────┘                 ├─────────────────┤
                                                          │ Neo4j           │ (recommendations)
                                                          │ ClickHouse      │ (analytics/OLAP)
                                                          └─────────────────┘
```

| Need | Store | Why |
|---|---|---|
| Transactions, money, source of truth | Postgres / MySQL | ACID, mature, joins |
| Full-text / faceted search | Elasticsearch / OpenSearch | inverted index, relevance |
| Session, cache, rate-limit, leaderboard | Redis | in-memory, sub-ms, sorted sets |
| Massive write-heavy time-series | Cassandra / ScyllaDB | LSM writes, range scans |
| Analytics / aggregations | ClickHouse / BigQuery / Snowflake | columnar OLAP |
| Relationships / paths | Neo4j / Neptune | index-free adjacency |

**The cost nobody budgets for:** every extra store is a copy that can drift, a separate failure/backup/security domain, and a dual-write hazard. **Never dual-write from the app** (write Postgres then Elasticsearch in the same request) — a crash between them leaves them inconsistent forever. Use **Change Data Capture** (Debezium reading the WAL) or the **transactional outbox** pattern so one atomic DB write is the single source of changes that propagate downstream. This is the bridge to `12-stream-processing.md`.

---

## 11. Common pitfalls / war stories

- **Reaching for NoSQL too early.** "We might be the next Google" — then you have 50k rows, no joins, and hand-rolled referential integrity in app code. Postgres handles millions of rows and tens of thousands of TPS on one box. Most "scale" problems are missing-index problems. Outgrow the single node *first*.
- **The hot partition / celebrity key.** A `tenant_id` partition key where one tenant (or `status=ACTIVE`, or the Justin Bieber row) takes 90% of traffic. The partition's node saturates while the cluster idles. Fixes: **write sharding** (suffix the key with `#0..#N` and scatter-gather reads), composite keys, or isolating whales onto dedicated partitions. This is the most common NoSQL production incident.
- **Modeling NoSQL like SQL.** Normalizing into many DynamoDB tables and then trying to "join" in application code = N+1 queries over the network, each adding a round trip. The whole point was collocation.
- **Unbounded partition growth.** `PK = ORDERS` (all orders in one partition) hits the 10 GB Dynamo partition limit / Cassandra's wide-row problems. Partitions must be bounded by design (per-customer, per-day buckets).
- **GSI/index throttling the base table.** §8 — a low-cardinality or under-provisioned GSI back-pressures writes to the main table.
- **Assuming GSI / replica reads are strongly consistent.** They lag. A user creates an order then immediately filters "my orders by status" and doesn't see it (read-your-writes violation; see `04-replication-consistency.md`).
- **Dual writes without an outbox.** App writes DB, then queues an event, then crashes — the event never sends and the search index is permanently stale. Outbox or CDC, always.
- **`SELECT *` of a normalized aggregate over the wire repeatedly** — the relational sibling of N+1; eager-load with `with([...])` (the codebase even mandates this — see `CLAUDE.md` "prevent n+1 queries").
- **Schema-on-read complacency.** Document stores let you skip migrations, so five years of inconsistent shapes accumulate and every reader needs defensive `?? default` everywhere. Schemaless ≠ structure-free; version your documents.

---

## 🧩 Case Study: Amazon DynamoDB & the Retail Shopping Cart

**The problem.** In the late 2000s Amazon's retail catalog and shopping-cart services ran on a sharded Oracle relational tier. Every holiday, traffic spiked: Prime Day and Cyber Monday push the platform to tens of millions of requests per second across services, and the shopping cart alone must stay available at the worst possible moment — the seconds before a customer checks out. The relational tier had two fatal properties at that scale: cross-shard **joins** got slower as the cluster grew (§3), and the system favored consistency over availability, so during a partition or a hot node, carts would error out. A cart that throws a 500 during Prime Day is lost revenue measured in millions per minute. Amazon's internal post-mortems found that ~70% of their operations were simple key-value access (get cart, get item, put item) — the join machinery was paying for flexibility nobody used.

**Applying access-pattern-first modeling.** This is the exact reversal from §5. The cart team did not draw an ER diagram; they enumerated queries and their SLOs:

```
  getCart(customerId)            ~tens of millions/s peak, p99 < 10ms, MUST be available
  addItem / updateQty / remove   high write rate, single-item, idempotent
  getCustomerOrderHistory        lower QPS, newest-first, paginated
```

Every one of these is a point or range operation rooted at `customerId`. None of them needs a join. That observation is what makes the workload a NoSQL fit rather than a relational one — and it is the §5 method in its purest form: *if you can name the access pattern, you can pick a key that answers it in one request.*

**Partition key and sort key choice (§6).** `customerId` is the partition key: extremely high cardinality (hundreds of millions of values), hit roughly uniformly, and it is the grouping shared by every frequent query. Within a customer's partition, a composite sort key collocates the cart, profile, and order history — the §6 item-collocation pattern — so the cart read is a single `Query`, not a four-table join.

```
  PK = CUSTOMER#88231 | SK = CART#                | item, qty, price  (live cart)
  PK = CUSTOMER#88231 | SK = CART#                | item, qty, price
  PK = CUSTOMER#88231 | SK = ORDER#2026-06-16#A1  | total, status     (history)
  PK = CUSTOMER#88231 | SK = PROFILE#             | name, prefs

  getCart:  Query PK=CUSTOMER#88231, SK begins_with "CART#"   → whole cart, 1 hop
```

**Avoiding hot partitions (§6, §11).** Choosing `customerId` instead of something low-cardinality like `region` or `cart_status` is the deliberate hot-partition avoidance from §6: load spreads across millions of distinct partition keys, so no single physical node carries a disproportionate share. Internally DynamoDB also adaptively splits a partition that heats up and uses **consistent hashing** (the Dynamo paper lineage) to redistribute keys when nodes are added — the same mechanism your `03-partitioning-sharding.md` covers, applied so the cart team never has to manually rebalance.

**Denormalization over joins (§2, §3).** The cart stores a *copy* of item name and price at add-time rather than joining to a live catalog table on every read. That is textbook denormalization: they accept write-time duplication and the risk of a stale price snapshot to get a single-fetch read that never shuffles data across shards. Price re-validation happens once, at checkout, instead of on every cart render — paying the consistency cost exactly where it matters and nowhere else.

```
            ┌──────────────────────────────────────────────┐
  client ──►│  getCart(customerId)                          │
            │     │                                         │
            │     ▼  hash(customerId) → partition P7        │
            │  ┌────────┐  ┌────────┐  ┌────────┐           │
            │  │  P0..  │  │   P7   │  │  ..Pn  │  3 replicas│
            │  └────────┘  └───┬────┘  └────────┘  per part. │
            │                  │  Query PK, SK begins_with   │
            │                  ▼  collocated items, 1 RTT    │
            └──────────────────────────────────────────────┘
```

**The trade-off they accepted.** DynamoDB defaults to **eventual consistency** and gives up the relational tier's ad-hoc query power and cross-entity transactions (this is the AP-leaning corner of CAP/PACELC — see `09-cap-pacelc.md`). The cart team chose availability and bounded latency over strong consistency: a read that occasionally reflects state a few hundred milliseconds stale is acceptable for a cart, while an unavailable cart is not. They also accepted the §7 rigidity tax — a genuinely new query shape needs a new GSI or a backfill, not just a fresh `WHERE` clause.

**Results.** After migrating its consumer-facing services off Oracle (completed around 2018–2019), Amazon reported single-digit-millisecond p99 reads at any scale, and DynamoDB has sustained peaks in the range of **tens of millions of requests per second** during Prime Day with high availability. The retail Oracle exit removed an entire tier of sharding-and-join operational pain; the cart stopped being the thing that fell over under peak load.

### Lessons

- **Let the queries pick the database.** ~70% key-value access meant the join engine was pure overhead. Enumerate access patterns *before* choosing relational vs NoSQL — the §5 method is the decision, not just the modeling step.
- **The partition key is a load-balancing decision, not just an addressing one.** `customerId`'s high cardinality is what prevents hot partitions at Prime-Day scale; a "natural" low-cardinality key (`region`, `status`) would have recreated the relational hot-node failure.
- **Denormalize at the boundary that matters.** Snapshotting price into the cart trades a small staleness window for join-free reads — then re-validate once at checkout. Pay the consistency cost where correctness is required, not on every read.
- **Eventual consistency is a feature you buy availability with.** They gave up strong reads and ad-hoc queries on purpose; that purchase is what kept carts answering during the highest-revenue minutes of the year.

## Test yourself

1. You must serve "get a user's 20 most recent orders, paginated" at 5k req/s, p99 < 15 ms. What partition key and sort key do you pick, and why does a random-UUID sort key fail?
   *Hint: PK groups by user; SK must be time-ordered for "recent" + pagination.*
2. Why can a single badly-chosen GSI partition key throttle writes to the *base* table?
   *Hint: GSI shares the write path and has its own (exhaustible) capacity; back-pressure propagates.*
3. Twitter timelines: when is fan-out-on-write the wrong choice, and what's the hybrid fix?
   *Hint: celebrity fan-out cost; merge-on-read for high-follower accounts.*
4. Give a concrete reason a distributed join across two shards is orders of magnitude slower than the same join co-located on one node.
   *Hint: network shuffle + tail latency of the slowest shard.*
5. Your team wants Postgres + Elasticsearch + Redis kept in sync. Why is dual-write from the app a latent data-corruption bug, and what's the correct pattern?
   *Hint: no atomicity across two systems; outbox / CDC.*
6. When is normalized 3NF Postgres the *right* answer over DynamoDB single-table, despite "scale"?
   *Hint: ad-hoc/evolving queries, transactions, sub-10 M rows, operational simplicity.*
7. Define a hot partition and list three mitigations.
   *Hint: skewed key; write-sharding suffix, composite key, whale isolation.*
8. Why does an LSM-tree (Cassandra) sustain higher write throughput than a B-tree (InnoDB), and what does it pay for it?
   *Hint: sequential appends + background compaction; read amplification + compaction cost.*

---

## 13. Further reading

- **Kleppmann, *Designing Data-Intensive Applications* (DDIA)** — Ch. 2 (data models & query languages), Ch. 3 (storage engines: B-trees vs LSM-trees). The canonical text.
- **Alex DeBrie, *The DynamoDB Book*** — single-table design, key selection, GSIs; plus AWS's "NoSQL design for DynamoDB" docs.
- **Chang et al., *Bigtable: A Distributed Storage System for Structured Data* (Google, 2006)** — origin of the wide-column model.
- **DeCandia et al., *Dynamo: Amazon's Highly Available Key-value Store* (2007)** — consistent hashing, eventual consistency, the key-value lineage.
- **O'Neil et al., *The Log-Structured Merge-Tree (LSM-Tree)* (1996)** — the write-optimized storage paper.
- **Martin Fowler — "PolyglotPersistence" and "CQRS"** (martinfowler.com) — the architectural patterns.
- **Debezium documentation** — Change Data Capture and the transactional outbox pattern.
- Cross-links: `03-partitioning-sharding.md`, `04-replication-consistency.md`, `07-caching.md`, `09-cap-pacelc.md`, `12-stream-processing.md`.
