# Database Internals: Storage Engines, Indexes, Transactions

**What you'll learn.** How databases physically store rows on disk, the deep trade-off between the two dominant storage-engine families (B-trees vs LSM-trees), how indexes actually accelerate (and sometimes sabotage) queries, and how transactions stay correct under concurrency via ACID, isolation levels, MVCC, and the write-ahead log. By the end you should be able to read an `EXPLAIN`, predict why a query is slow, reason about a concurrency anomaly, and pick the right engine for a workload.

**Prerequisites.** Read [`01-fundamentals.md`](./01-fundamentals.md) first - it establishes latency numbers (memory vs SSD vs disk vs network), throughput-vs-latency thinking, and the back-of-envelope habits this module assumes. Familiarity with SQL helps but isn't required.

---

## 1. How a database stores data on disk

Strip away SQL and a database is a thing that turns logical records into bytes on a block device and back, *durably* and *fast*. Two physical facts dominate every design decision:

1. **Disks are block devices.** You cannot read or write one byte; you read/write a *page* (typically 4 KB, 8 KB, or 16 KB). Postgres pages are 8 KB; InnoDB pages are 16 KB. The page is the atomic unit of I/O and caching.
2. **Random I/O is far slower than sequential I/O.** On spinning disks the gap is ~100×; even on NVMe SSDs, sequential writes are friendlier (less write amplification, better wear). This single fact is *why* LSM-trees exist.

The naive design - a flat append-only file of records - gives O(1) writes but O(n) lookups. To get fast lookups you need an **index**: a separate data structure that maps a key to a location. The structure you pick *is* the storage engine's identity.

```
Logical row:  (id=42, name='Acme', plan='pro')
                       │  serialize
                       ▼
Page (8KB):   ┌───────────────────────────────────────────┐
              │ header │ ...row42... │ ...row17... │ free → │
              └───────────────────────────────────────────┘
                       │  one unit of read / write / cache
```

A **heap** (Postgres) stores rows in no particular order - insertion order with reuse of freed space. A **clustered index** (InnoDB) stores the rows *inside* the index leaves, physically ordered by primary key. That difference cascades through everything below.

---

## 2. B-tree vs LSM-tree: the two great families

### 2.1 B-trees (the default: Postgres, InnoDB, SQLite, Oracle)

A **B+tree** is a balanced, high-fan-out search tree. Internal nodes hold only keys + child pointers; leaves hold the data (or pointers to it) and are linked for range scans. Fan-out is huge (hundreds of keys per page), so depth is tiny: a few billion rows fit in 3–4 levels.

```
                 [ 50 | 120 ]                 internal (root)
                /     |      \
        [10|30]    [70|90]   [150|200]        internal
        /  |  \    /  |  \    /   |   \
     leaves... leaves...    leaves...         leaves (linked: → → →)
       │
   each leaf page holds sorted keys + values, ~half-to-full
```

- **Lookup**: O(log n) - descend from root, ~3–4 page reads (mostly cached).
- **Range scan**: find start leaf, walk the linked list. Excellent.
- **Write**: find the leaf, write *in place*. If the leaf is full, **split** it (and possibly propagate up). Writes are **random** (the target page can be anywhere) and **mutate existing pages**.
- **Durability hazard**: a page split can touch multiple pages; a crash mid-split corrupts the tree. Fixed by the WAL (§4) and, in Postgres, *full-page writes* to survive torn pages.

### 2.2 LSM-trees (RocksDB, LevelDB, Cassandra, ScyllaDB, HBase, modern MyRocks)

A **Log-Structured Merge tree** never updates in place. Writes go to an in-memory sorted structure (the **memtable**, often a skip list) plus an append-only WAL. When the memtable fills, it's flushed *sequentially* to an immutable on-disk file called an **SSTable** (Sorted String Table). Background **compaction** merges SSTables, dropping superseded/deleted keys.

```
write ─► WAL (append) ─► memtable (RAM, sorted)
                              │ full → flush (sequential write)
                              ▼
        L0:  [sst][sst][sst]            (may overlap key ranges)
              │  compaction merges + sorts
              ▼
        L1:  [ sst ][ sst ][ sst ]      (non-overlapping, ~10× L0)
              ▼
        L2:  [   sst   ][   sst   ] ...  (~10× L1)
              ...deeper, larger, colder
```

- **Write**: append to WAL + insert into memtable. **Sequential, fast, no in-place mutation.** This is the headline win.
- **Read**: check memtable, then L0 SSTables, then deeper levels - a key may live anywhere. Mitigated by per-SSTable **Bloom filters** (skip files that definitely lack the key) and block caches. Worst case touches many files.
- **Delete**: write a **tombstone** marker; the real removal happens at compaction. Range deletes + slow compaction = "tombstone hell" (reads scan dead keys).
- **Space**: old versions linger until compacted.

### 2.3 The three amplifications (memorize these)

| Amplification | Means | B-tree | LSM-tree |
|---|---|---|---|
| **Write** | bytes written to disk ÷ bytes of logical data | Lowish but page-granular; ~2–3× (WAL + page) | High: each key rewritten on every compaction level; **10–30×** typical |
| **Read** | I/Os per logical read | Low & predictable (~tree depth) | Higher & variable (memtable + N levels), Bloom-filtered down |
| **Space** | disk used ÷ logical data | Internal fragmentation; ~1.3–2× (page half-empty after splits) | Better with leveled compaction (~1.1×); worse with size-tiered |

### 2.4 When each wins

| Choose **B-tree** when… | Choose **LSM** when… |
|---|---|
| Read-heavy or balanced workloads | Write-heavy / high ingest (logs, metrics, events, time series) |
| Point lookups + range scans both matter | Sequential write throughput is the bottleneck |
| You want predictable, low read latency | You can trade read tail-latency for write throughput |
| In-place updates of small fields | Append-mostly, few updates, key-value access |
| Examples: Postgres, MySQL/InnoDB, SQLite | Examples: Cassandra, RocksDB, ScyllaDB, HBase, MyRocks |

> **Real engine choices.** Postgres = heap + B-tree secondary indexes + MVCC. MySQL InnoDB = clustered B+tree (rows live in the PK index). Cassandra/Scylla = LSM (write-optimized, eventually-consistent ring - see [`08-replication-and-partitioning.md`](./08-replication-and-partitioning.md)). RocksDB is the embeddable LSM that powers Kafka Streams state stores, CockroachDB, TiKV, and MyRocks.

---

## 3. How indexes actually work

An index is just a *second* data structure (usually a B-tree) ordered by some key, whose leaves point back to the row.

### 3.1 Clustered/primary vs secondary

- **Clustered (InnoDB)**: the primary key B-tree *is* the table - leaves contain the full row. There is exactly one (the table's physical order). A secondary index leaf stores the **indexed columns + the primary key value**, not a physical pointer. So a secondary-index lookup that needs other columns does *two* B-tree descents: secondary → PK → row. (This is why a huge/random PK like a UUIDv4 hurts InnoDB: it bloats every secondary index and randomizes inserts. Prefer sequential keys or UUIDv7.)
- **Heap + secondary (Postgres)**: rows live in the heap; *every* index (including the PK) is secondary and stores a `ctid` (page, offset) pointer into the heap. No "clustered" table unless you run `CLUSTER` (a one-shot reorder, not maintained).

### 3.2 Covering index & index-only scans

If an index contains *every column a query needs*, the engine never touches the table - an **index-only scan** (Postgres) / **covering index** (InnoDB). Hugely faster for hot read paths.

```sql
-- Query: SELECT plan FROM stores WHERE tenant_id = ?;
CREATE INDEX ix_stores_tenant_plan ON stores (tenant_id) INCLUDE (plan);
-- 'plan' rides in the leaf → index-only scan, no heap fetch.
```

(In Postgres, index-only scans also require the page's visibility map bit to be set - i.e. recently `VACUUM`ed - or it still visits the heap to check tuple visibility. §6.)

### 3.3 Composite indexes and the leftmost-prefix rule

A composite index on `(a, b, c)` is sorted by `a`, then `b`, then `c` - like a phone book by (last, first). It can serve:

- `WHERE a = ?`  ✅
- `WHERE a = ? AND b = ?`  ✅
- `WHERE a = ? AND b = ? AND c = ?`  ✅ (and an `ORDER BY` matching the order)
- `WHERE a = ? AND c = ?`  ⚠️ uses only the `a` prefix, then filters `c`
- `WHERE b = ?`  ❌ **cannot use the index** - no leftmost prefix.

A range on a column *stops* prefix usage for everything after it: `WHERE a = ? AND b > ? AND c = ?` uses `a,b` for seeking but `c` cannot be used for the seek. Order columns: **equality first, then the range/sort column last.** See [`05-data-modeling-sql-nosql.md`](./05-data-modeling-sql-nosql.md) for designing these around access patterns.

### 3.4 Why an index can hurt

Every index is a copy that must be kept in sync. An `INSERT`/`UPDATE`/`DELETE` must update **every** affected index - extra random writes, more WAL, more page splits, more space. Ten indexes on a hot write table can make writes several times slower. Indexes are a **read tax paid on writes**: add them deliberately, drop unused ones (`pg_stat_user_indexes.idx_scan = 0` ⇒ suspect).

---

## 4. The write-ahead log (WAL) and durability

**Rule: log the intent before mutating the data.** Before any change touches a data page, the engine appends a record describing the change to a sequential **WAL** (Postgres WAL / InnoDB redo log) and `fsync`s it. Only then can the change be applied to in-memory pages and lazily flushed.

Why it works:
- The WAL write is **sequential** (fast) and small; the data-page writes can be **deferred and batched**.
- On crash, **replay** the WAL from the last checkpoint: redo committed changes, undo uncommitted ones. The database is restored to a consistent state.
- A **commit** is durable the instant its WAL record is `fsync`ed - *not* when data pages hit disk. This decouples durability from random data-page I/O. (`synchronous_commit = off` trades a few ms of possible loss for throughput - a knob, not a default.)

```
T writes row → [WAL: "set page P, off O, val V"] fsync ✓  → commit returns
                                  │ later, async
                                  ▼
                        dirty page P flushed at checkpoint
crash → reread WAL from last checkpoint → redo/undo → consistent
```

The WAL is also the backbone of **replication** (ship WAL to replicas) and **point-in-time recovery** - see [`08-replication-and-partitioning.md`](./08-replication-and-partitioning.md).

---

## 5. The page cache / buffer pool

Databases keep hot pages in RAM: InnoDB's **buffer pool**, Postgres's **shared_buffers** (plus the OS page cache underneath). Reads check the pool first; misses fault a page in from disk. Dirty pages accumulate and are flushed at **checkpoints**. Sizing this is the single biggest perf lever for a B-tree DB: if the working set fits in RAM, lookups are CPU-bound tree walks; if not, you pay SSD/disk latency on misses (recall the numbers from `01`). LSM engines lean on **block caches** + Bloom filters instead, since their files are immutable.

---

## 6. ACID, precisely

- **Atomicity** - a transaction is all-or-nothing. Implemented via undo info (Postgres: old tuple versions; InnoDB: undo log) + WAL.
- **Consistency** - it moves the DB from one valid state to another *per declared constraints* (FKs, CHECKs, uniqueness). This is partly the app's job; the DB enforces declared rules.
- **Isolation** - concurrent transactions don't corrupt each other's view. The slippery one; §7–8.
- **Durability** - once committed, survives a crash. The WAL (§4).

"Consistency" here is **not** the "C" in CAP - that's a different word for replica agreement. Don't conflate them; see [`09-cap-pacelc-consistency-models.md`](./09-cap-pacelc-consistency-models.md).

---

## 7. Isolation levels and concurrency anomalies

The SQL standard defines four isolation levels by which anomalies they forbid. The anomalies:

- **Dirty read** - T2 reads a row T1 wrote but hasn't committed; T1 rolls back ⇒ T2 read a value that never existed.
- **Non-repeatable read** - T1 reads a row, T2 commits an update to it, T1 reads again and gets a *different value* within the same transaction.
- **Phantom read** - T1 runs `SELECT ... WHERE status='open'` (5 rows), T2 inserts a matching row + commits, T1 reruns and now sees 6 - a *new row* appears in a range.
- **Lost update** - T1 and T2 both read `count=10`, both write `11`; one update is silently lost. Classic with read-modify-write.
- **Write skew** - T1 and T2 read an overlapping set, each checks an invariant that still holds, each writes a *different* row; together they break the invariant. Example: two doctors each check "≥1 doctor on call" (true), each books themselves off - now zero on call. Snapshot isolation does **not** prevent this; only serializable does.

| Isolation level | Dirty read | Non-repeatable | Phantom | Lost update | Write skew | When to use |
|---|---|---|---|---|---|---|
| **Read Uncommitted** | ✅ allowed | ✅ | ✅ | ✅ | ✅ | Almost never (Postgres treats it as Read Committed anyway) |
| **Read Committed** | ✗ prevented | ✅ allowed | ✅ allowed | ✅ allowed | ✅ allowed | Default in Postgres/Oracle; OLTP where each statement sees fresh committed data |
| **Repeatable Read** | ✗ | ✗ | ✗ in PG (snapshot)* | ✗ in PG | ✅ allowed | Reports/multi-read consistency; PG calls snapshot isolation this |
| **Serializable** | ✗ | ✗ | ✗ | ✗ | ✗ prevented | Money, inventory, invariants across rows; correctness over throughput |

\* The standard *allows* phantoms at Repeatable Read; **Postgres's Repeatable Read is full snapshot isolation and blocks phantoms** but still permits write skew. MySQL InnoDB's Repeatable Read uses next-key (gap) locks to block phantoms too. **Know your engine - "Repeatable Read" means different things.**

Postgres **Serializable Snapshot Isolation (SSI)** runs at snapshot-isolation speed but *monitors* for dangerous read-write dependency cycles and **aborts** one transaction with a serialization failure (`40001`) - so your app must **retry** on `40001`. This is optimistic serializability, not heavy locking.

---

## 8. MVCC vs locking; optimistic vs pessimistic

### 8.1 MVCC (Multi-Version Concurrency Control) - "readers don't block writers"

Instead of locking rows for reads, the DB keeps **multiple versions** of each row and shows each transaction a consistent *snapshot*. In Postgres, every row (tuple) carries hidden system columns `xmin` (the txid that created it) and `xmax` (the txid that deleted/superseded it). An `UPDATE` does **not** overwrite - it writes a **new tuple** and marks the old one's `xmax`.

```
tuple history for store id=42:

  v1  xmin=100 xmax=105   plan='free'   ← visible to snapshots < 105
  v2  xmin=105 xmax=0     plan='pro'    ← current, visible to snapshots ≥ 105
            ▲
   each transaction's snapshot decides which version it sees,
   by comparing xmin/xmax against the set of committed txids
```

Consequences:
- Reads never block writes and vice versa - huge concurrency win.
- **Dead tuples accumulate.** Old versions become invisible to all live transactions but still occupy pages = **bloat**. **`VACUUM`** reclaims them (autovacuum runs continuously); `VACUUM FULL` rewrites the table (takes a lock). Without vacuuming, tables and indexes bloat and slow down.
- **Transaction ID wraparound**: txids are 32-bit; Postgres must "freeze" old tuples before the counter wraps. A neglected DB can hit emergency anti-wraparound vacuum (or, historically, refuse writes). Monitor `age(datfrozenxid)`.

InnoDB also does MVCC, but differently: it **updates the row in place** in the clustered index and keeps old versions in the **undo log**; readers reconstruct an old snapshot by walking undo records. So InnoDB has undo bloat, not heap dead-tuple bloat, and "purge" threads clean undo. (See [`05-data-modeling-sql-nosql.md`](./05-data-modeling-sql-nosql.md) for how this shapes schema choices.)

### 8.2 Pessimistic vs optimistic concurrency control

- **Pessimistic**: take locks up front and hold them (`SELECT ... FOR UPDATE`, row/gap locks). Safe under contention; risks **deadlocks** (the DB detects a cycle and aborts a victim) and reduced concurrency. Use when conflicts are likely (decrementing the same inventory row repeatedly).
- **Optimistic**: don't lock; assume no conflict, validate at commit (or via a `version` column / `WHERE updated_at = ?`), and **retry** on conflict. Cheap when conflicts are rare; wasteful (rollbacks) when they're common. Postgres SSI is optimistic; app-level "version column then `UPDATE ... WHERE version = N`" is the portable pattern. *This is the correct fix for the lost-update bug* - a bare read-modify-write in app code is not.

---

## 9. The query planner / optimizer and reading EXPLAIN

SQL is *declarative*: you state *what*, the **planner** decides *how*. It enumerates execution plans (which index, join order, join algorithm) and picks the **cheapest** by a cost model fed by **statistics** (`ANALYZE` gathers row counts, distinct values, histograms, most-common-values).

Key plan nodes:
- **Seq Scan** - read the whole table. Fine for small/most-of-table queries; a red flag on a large table with a selective filter (⇒ missing index).
- **Index Scan** - descend an index, then fetch matching heap rows.
- **Index Only Scan** - index covers all needed columns; no heap fetch (§3.2).
- **Bitmap Heap Scan** - gather many matches via index into a bitmap, then read heap pages in physical order (good for medium selectivity).
- **Nested Loop / Hash Join / Merge Join** - three join strategies; the planner picks by sizes and available indexes.

```
EXPLAIN ANALYZE
SELECT * FROM orders WHERE tenant_id = 7 AND status = 'paid';

 Index Scan using ix_orders_tenant_status on orders
   (cost=0.43..812.5 rows=120 width=240)
   (actual time=0.05..1.2 rows=118 loops=1)
   Index Cond: (tenant_id = 7 AND status = 'paid')
 Planning Time: 0.2 ms
 Execution Time: 1.4 ms
```

How to read it: compare **estimated `rows`** vs **`actual rows`** - a big gap means stale statistics (run `ANALYZE`) and probably a bad plan. Watch for `Seq Scan` on big tables, huge `loops=` on a Nested Loop (an N+1 inside the DB), and `Rows Removed by Filter` (the index brought too much; tighten it). `EXPLAIN (ANALYZE, BUFFERS)` adds page-hit/read counts so you see cache behavior.

---

## 10. Common pitfalls / war stories

- **The missing index.** A `WHERE email = ?` with no index = Seq Scan; fine at 10k rows, a meltdown at 10M. Symptom: a query that "got slow as we grew." Fix: index the predicate; verify with `EXPLAIN`.
- **The long-running transaction that bloats MVCC.** An idle-in-transaction connection (a forgotten `BEGIN`, a slow report, an ORM that left a txn open) holds back the MVCC horizon: autovacuum *cannot* remove dead tuples newer than the oldest live snapshot. Tables bloat, queries crawl, disk fills. Watch `pg_stat_activity` for `idle in transaction`; set `idle_in_transaction_session_timeout`.
- **SELECT N+1.** ORM loads 100 parents, then fires 100 child queries in a loop. 101 round-trips where 1–2 would do. (This codebase's `CLAUDE.md` calls it out: eager-load with `with([...])`.) The DB is fine each time; the *network round-trips* kill you. Fix: eager-load / join / batch.
- **Lost update via read-modify-write.** `balance = balance + 10` done as app read → compute → write under Read Committed loses concurrent increments. Fix: atomic `UPDATE ... SET balance = balance + 10`, or `SELECT ... FOR UPDATE`, or a version column with retry.
- **Write skew at snapshot isolation.** "Check then act" across rows (last-seat booking, on-call rota) passes under Repeatable Read and still corrupts. Fix: `SERIALIZABLE` (+ retry on `40001`) or an explicit lock on a guard row.
- **Random UUID primary keys in InnoDB.** UUIDv4 PKs randomize clustered-index inserts (page splits everywhere) and fat-fill every secondary index. Fix: sequential IDs or UUIDv7/ULID. (Tenancy still uses UUIDs in *URLs* - that's an exposure choice, not necessarily the storage key.)
- **Too many indexes on a write-hot table.** Each insert pays for every index. Audit `idx_scan = 0` and drop the dead weight.
- **Tombstone / compaction storms (LSM).** Mass deletes in Cassandra leave tombstones that reads must scan and compaction must process; latency spikes. Model around it (TTLs, partition design).

---

## 🧩 Case Study: Discord's message store (MongoDB → Cassandra → ScyllaDB)

By 2015 Discord stored messages in a single MongoDB replica set and crossed **100 million messages**. The working set no longer fit in RAM, so reads fell off the cliff §5 describes: every lookup that missed the buffer pool paid SSD latency, and p99s became unpredictable. By 2017 they were at **billions of messages**; by 2022, **trillions** - peaking past **a million messages written per second** at busy hours. This is the textbook signal from §2.4: a write-heavy, append-mostly, time-ordered workload where sequential write throughput, not in-place updates, is the bottleneck. A B-tree's random in-place writes (§2.1) were exactly the wrong tool. They moved to **Cassandra** - an LSM-tree engine (§2.2).

**Designing the partition + clustering key.** Discord's dominant access pattern is "give me the most recent messages in a channel, scrollable backwards." In Cassandra/Scylla the primary key is `(partition_key, clustering_key...)`: the partition key picks which node owns the data, and the clustering key sets the sorted order *within* that partition on disk - exactly the leftmost-prefix, equality-then-range idea from §3.3, but applied to an LSM SSTable layout. A naive `PARTITION KEY = channel_id` would put an entire channel's lifetime in one partition. Megachannels would grow unbounded - an LSM partition that never stops accumulating SSTables, so reads have to merge across more and more files (§2.2 "a key may live anywhere"). Their fix was a **composite, bucketed partition key**:

```
PRIMARY KEY ((channel_id, bucket), message_id)
            └──── partition ────┘  └ clustering ┘
  bucket   = fixed time window (≈10 days) derived from the message's Snowflake ID
  message_id = Snowflake → time-sortable, so rows arrive in clustering order
                            (sequential appends to the memtable, no re-sort)

Read "latest in channel":
   pick newest bucket ─► one partition ─► SSTables already sorted by message_id
                                          ─► take tail rows (range scan §3.3)
```

Bucketing bounds each partition's size, so compaction stays cheap and a channel read touches a handful of SSTables, Bloom-filtered (§2.2) down to the few that matter.

**The hot-partition pain.** Even bucketed, one partition lives on one set of replicas. When a celebrity or `@everyone` announcement made a single channel red-hot, all reads and writes for that `(channel_id, bucket)` slammed the same nodes - the **hot-partition** problem flagged in §2.2/§10. Cassandra made it worse for two reasons rooted in this module:

1. **Read latency from LSM read amplification (§2.3).** Fan-out reads on a hot partition had to check the memtable plus many SSTable levels; Bloom filters help, but the tail still touched several files, and Discord saw p99s blow out into **hundreds of milliseconds**, occasionally seconds.
2. **Tombstones and compaction storms (§2.2, §10).** Deletes write tombstones, not real removals. Heavy edit/delete traffic plus Cassandra's JVM **garbage-collection** pauses meant compaction couldn't keep up; reads scanned dead keys, and GC stalls added latency spikes on top.

**The ScyllaDB migration.** ScyllaDB is wire-compatible with Cassandra and keeps the *same* LSM model, partition/clustering keys, and data layout - so none of the §3.3 key design changed. What changed is the runtime: C++ instead of the JVM (no GC pauses), a shard-per-core architecture, and a tighter compaction scheduler. Discord also put a **Rust "data services" layer** in front of the store that does **request coalescing**: if 10,000 users request the same hot channel page simultaneously, it issues **one** database query and fans the result back out - directly attacking the hot-partition read storm above the storage engine.

```
  10k concurrent reads for hot channel
            │
            ▼
   Rust data service ── coalesce identical in-flight reads ──► 1 query
            │                                                    │
            └──────────── shared result fanned back ◄───────────┘
                                   │
                              ScyllaDB (LSM, no GC pauses)
```

**The trade-off they accepted.** They stayed on an LSM engine and *kept paying read amplification and eventual-consistency semantics* (no cross-partition transactions, no serializable invariants §7) in exchange for write throughput and horizontal scale. They explicitly chose **denormalization + bounded partitions over a normalized, transactional B-tree store** - the §2.4 trade in its purest form. They also accepted operational complexity (a bespoke Rust coalescing tier) rather than asking the database to absorb hot-key load it fundamentally can't.

**Results.** After the ScyllaDB move, Discord reported the cluster shrinking from **177 Cassandra nodes to 72 ScyllaDB nodes** while holding more data, p99 read latencies dropping from the hundreds-of-milliseconds range to roughly **15 ms (reads) / 5 ms (writes)**, and the GC-pause tail latency disappearing entirely. The migration backfilled **trillions of rows** in about nine days using a fleet of Rust migrator workers.

### Lessons

- **The partition/clustering key is the whole design in an LSM store.** Pick it from your dominant access pattern (§3.3) and *bound partition size* - an unbounded partition is a latent hot-partition and compaction time bomb. Bucketing a time-ordered key is the canonical fix.
- **LSM buys write throughput and pays in read amplification and tombstones (§2.3).** Know which side of the §2.4 trade your workload is on before you migrate; Discord's write-heavy, append-mostly traffic was textbook LSM.
- **Some load can't be fixed in the storage layer.** A single hot partition lives on one replica set; solve it *above* the database with caching and request coalescing.
- **Same data model, different runtime can be the win.** Cassandra → ScyllaDB kept the LSM design intact and removed JVM GC pauses - proof that tail latency is often an engine/runtime problem, not a data-model one.

## 11. Test yourself

1. Why do LSM-trees achieve higher *write* throughput than B-trees, and what do they pay for it on reads? *(Hint: sequential appends + immutable SSTables vs in-place random page writes; reads must check memtable + multiple levels, mitigated by Bloom filters.)*
2. Given an index on `(tenant_id, status, created_at)`, which of these can seek the index: `WHERE status='paid'`? `WHERE tenant_id=7 AND created_at > ?`? `WHERE tenant_id=7 AND status='paid'`? *(Hint: leftmost-prefix; the second uses only the `tenant_id` prefix for seeking.)*
3. A `COMMIT` returned successfully but the modified data pages were not yet on disk when the server lost power. Is the data safe? Why? *(Hint: WAL fsync at commit + crash recovery redo.)*
4. Postgres Repeatable Read prevents phantoms but allows write skew. Explain the difference with the on-call-doctors example. *(Hint: snapshot consistency vs cross-row invariant; only Serializable/SSI catches the rw-dependency cycle.)*
5. Why does an idle-in-transaction connection make *unrelated* tables slow? *(Hint: it pins the oldest snapshot; autovacuum can't reclaim dead tuples ⇒ bloat.)*
6. When would you prefer optimistic concurrency over `SELECT ... FOR UPDATE`? *(Hint: low conflict rate; cost of occasional retry < cost of holding locks; portability.)*
7. `EXPLAIN ANALYZE` shows `rows=5` estimated but `actual rows=50000` on a Nested Loop. What's wrong and what do you do? *(Hint: stale stats ⇒ `ANALYZE`; the underestimate likely picked a bad join; maybe needs a hash join / better index.)*
8. Why does adding a covering/`INCLUDE` index speed reads but slow writes? *(Hint: index-only scan avoids heap fetch; every write must also maintain the larger index.)*

---

## 12. Further reading

- **Designing Data-Intensive Applications** (Kleppmann) - **Ch. 3** (Storage and Retrieval: B-trees vs LSM, indexes) and **Ch. 7** (Transactions: isolation levels, anomalies, SSI). The single best companion to this module.
- **Database Internals** (Alex Petrov) - Part I (storage engines, B-trees, LSM, page layout, WAL) in depth.
- **PostgreSQL documentation** - *Transaction Isolation*, *MVCC*, *Routine Vacuuming*, *Using EXPLAIN*, *Index Types*. Authoritative and precise.
- **MySQL Reference Manual** - *InnoDB Locking and Transaction Model* (clustered index, gap/next-key locks, undo, MVCC).
- **RocksDB wiki** - compaction styles (leveled vs universal), Bloom filters, write/space amplification trade-offs.
- Then continue: [`05-data-modeling-sql-nosql.md`](./05-data-modeling-sql-nosql.md), [`08-replication-and-partitioning.md`](./08-replication-and-partitioning.md), [`09-cap-pacelc-consistency-models.md`](./09-cap-pacelc-consistency-models.md).
