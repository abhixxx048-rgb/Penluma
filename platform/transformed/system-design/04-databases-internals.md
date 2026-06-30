---
title: "Database Internals: Why Your Queries Are Slow (and How to Fix Them)"
metaTitle: "Database Internals: Storage, Indexes & ACID"
description: "A clear guide to database internals: how storage engines, indexes, transactions, and MVCC really work, and why understanding them makes your queries fast."
keywords:
  - database internals
  - b-tree vs lsm-tree
  - how database indexes work
  - storage engine
  - ACID transactions explained
  - MVCC
  - write-ahead log
  - isolation levels
  - read EXPLAIN plan
  - lost update problem
  - write skew
  - composite index leftmost prefix
  - why is my query slow
  - covering index
topic: system-design
topicTitle: System Design
category: Engineering
date: '2026-06-15'
order: 4
icon: "\U0001F3D7️"
author: Brexis Wazik
transformed: true
polished: true
linked: true
faq:
  - q: "What is the difference between a B-tree and an LSM-tree database?"
    a: "A B-tree updates data in place and gives fast, predictable reads, so it suits read-heavy or balanced workloads. An LSM-tree only appends and merges files later, giving very high write throughput at the cost of slower, more variable reads. Postgres and MySQL use B-trees; Cassandra and RocksDB use LSM-trees."
  - q: "Why is my SQL query suddenly slow as the table grew?"
    a: "Almost always a missing index. A query that scans the whole table is fine at ten thousand rows and a disaster at ten million. Run EXPLAIN; if you see a Seq Scan on a large table with a selective filter, add an index on the filtered column."
  - q: "Does adding more indexes make a database faster?"
    a: "Indexes speed up reads but slow down writes, because every INSERT, UPDATE, and DELETE must update every affected index. Treat indexes as a read tax paid on writes: add them deliberately and drop unused ones."
  - q: "What does ACID actually mean?"
    a: "Atomicity (all-or-nothing transactions), Consistency (the database respects your declared rules), Isolation (concurrent transactions do not corrupt each other's view), and Durability (committed data survives a crash). The 'C' is not the same 'C' as in CAP."
  - q: "What is the lost update problem and how do I fix it?"
    a: "Two transactions read the same value, both add to it, and one update silently overwrites the other. Fix it with an atomic update like SET balance = balance + 10, a SELECT ... FOR UPDATE lock, or a version column with retry. A plain read-then-write in app code is not safe."
  - q: "Why does an idle transaction make unrelated tables slow in Postgres?"
    a: "An open transaction pins the oldest snapshot, so autovacuum cannot reclaim dead row versions newer than it. Tables and indexes bloat across the whole database, queries crawl, and disk fills. Watch for 'idle in transaction' connections."
sources: []
---

A query that ran in two milliseconds last year now takes thirty seconds. The code did not change. The query did not change. The only thing that changed is that the table grew from ten thousand rows to ten million.

That single story explains why database internals are worth your time. Underneath the friendly SQL, a database is a machine that turns rows into bytes on a disk and back, fast and without losing anything. When you understand how that machine works, slow queries stop being mysteries and start being problems you can predict and fix.

This is a guided tour of that machine: how data is stored, how indexes really speed things up (and sometimes sabotage you), and how transactions stay correct when thousands of people hit the same rows at once.

## Why this matters

You do not need to write a database to benefit from knowing how one works. You need to use one well.

The difference between an engineer who guesses and one who knows usually comes down to a handful of internals:

- **Why is this query slow?** Because it scans the whole table instead of using an index, and you can see exactly that in an `EXPLAIN` plan.
- **Why did two users overwrite each other's changes?** Because of a concurrency anomaly your isolation level allowed.
- **Why is the database fine in the morning and crawling by afternoon?** Because a forgotten open transaction is causing dead rows to pile up.
- **Should we [use Postgres or Cassandra](/blog/system-design/05-data-modeling-sql-nosql) here?** Because one is built for reads and the other for writes, and your workload leans one way.

Every one of those answers comes from the same small set of ideas. Learn them once and they pay off for your whole career.

## How a database stores data on disk

Strip away SQL and two physical facts shape every decision a database makes.

**First, disks work in blocks, not bytes.** You cannot read or write a single byte. You read and write a whole **page**, usually 4 KB, 8 KB, or 16 KB at a time. Postgres uses 8 KB pages; MySQL's InnoDB engine uses 16 KB. The page is the smallest unit the database reads, writes, and caches. Think of it like a library that only lets you check out and return entire shelves, never single books.

**Second, jumping around a disk is far slower than reading it in order.** On a spinning hard drive, random access is roughly a hundred times slower than sequential. Even on a fast SSD, writing in long sequential runs is gentler on the hardware and faster overall. This one fact is the reason an entire family of databases exists, as you will see in a moment.

A bare append-only file of records gives you instant writes but painfully slow lookups, because finding one record means scanning everything. To get fast lookups you need an **index**: a separate structure that maps a key to a location. The kind of index a database is built around is, more or less, its whole identity.

One more distinction matters. A **heap** (used by Postgres) stores rows in no particular order, just wherever there is free space. A **clustered index** (used by InnoDB) stores the actual rows inside the index itself, physically sorted by primary key. That choice ripples through everything else.

## The two great families: B-trees and LSM-trees

Almost every database you will ever touch picks one of two storage strategies. Knowing which is which tells you most of what you need to predict its behavior.

### B-trees: built for reading

A **B-tree** (technically a B+tree) is a balanced search tree with a very wide fan-out. The top and middle layers hold only keys and pointers; the bottom layer (the leaves) holds the actual data, and the leaves are linked together so you can walk through them in order.

Because each node points to hundreds of children, the tree is extremely shallow. A few billion rows fit in just three or four levels. To find any row, you start at the top and follow pointers down, typically three or four page reads, most of which are already cached in memory.

Here is how a B-tree behaves:

- **Single lookups** are fast and predictable, just a few hops down the tree.
- **Range scans** ("give me everything between X and Y") are excellent, because the leaves are sorted and linked.
- **Writes happen in place.** The database finds the right leaf and modifies it. If the leaf is full, it **splits** into two, which can ripple upward. These writes land in random spots on disk and change existing pages.

Postgres, MySQL/InnoDB, SQLite, and Oracle are all B-tree databases. If you mostly read data, or read and write in roughly equal measure, this is your family.

### LSM-trees: built for writing

A **Log-Structured Merge tree** flips the strategy. It never modifies data in place. Instead:

1. A write goes into a small sorted structure in memory (the **memtable**) plus an append-only log on disk.
2. When the memtable fills up, it is flushed to disk in one long sequential write as an immutable file called an **SSTable** (Sorted String Table).
3. In the background, a process called **compaction** merges these files together, throwing away old and deleted values.

The payoff is the headline feature: **writes are sequential, fast, and never overwrite anything.** That is exactly what disks love.

The cost shows up on reads. A key could live in the memtable, or in any of several layers of SSTables, so a read may have to check many places. Databases soften this with **[Bloom filters](/blog/system-design/15-probabilistic-structures-and-algorithms)**, a clever structure that can instantly say "this key is definitely not in this file," letting reads skip most files. Deletes are also indirect: they write a **tombstone** marker, and the real removal happens later during compaction. Too many tombstones, and reads start wading through dead keys.

Cassandra, ScyllaDB, RocksDB, and HBase are LSM databases. If you are ingesting a firehose of writes (logs, metrics, events, time series), this is your family.

### The three amplifications

The trade-off between these families comes down to three numbers worth memorizing.

| Amplification | What it measures | B-tree | LSM-tree |
|---|---|---|---|
| **Write** | Bytes written to disk per byte of real data | Low, around 2 to 3 times | High, often 10 to 30 times (keys get rewritten on every compaction) |
| **Read** | Disk reads per logical lookup | Low and predictable | Higher and variable, cut down by Bloom filters |
| **Space** | Disk used per byte of real data | Moderate, around 1.3 to 2 times | Often tight (around 1.1 times with leveled compaction) |

The pattern is clear: B-trees pay a little on writes to stay cheap and predictable on reads. LSM-trees pay on reads and space to win big on write throughput.

### Choosing between them

| Reach for a **B-tree** when... | Reach for an **LSM-tree** when... |
|---|---|
| Reads dominate, or reads and writes are balanced | Writes dominate (high-volume logs, metrics, events) |
| You need fast lookups and range scans | Sequential write throughput is your bottleneck |
| You want predictable, low read latency | You can trade slower tail reads for write speed |
| You update small fields in place often | You mostly append and rarely update |

## How indexes actually work

An index is simply a *second* structure (usually a B-tree) sorted by some key, whose leaves point back to the real rows. Understanding three things about indexes will solve most of your performance puzzles.

### Covering indexes skip the table entirely

Normally, an index gets you to the right row, then the database fetches that row to read the other columns. But if the index already contains *every column the query needs*, the database never touches the table at all. This is called an **index-only scan** (Postgres) or a **covering index** (InnoDB), and it is dramatically faster for hot read paths.

```sql
-- Query: SELECT plan FROM stores WHERE tenant_id = ?;
CREATE INDEX ix_stores_tenant_plan ON stores (tenant_id) INCLUDE (plan);
-- 'plan' rides along in the index, so no table lookup is needed.
```

### The leftmost-prefix rule for composite indexes

A composite index on `(a, b, c)` is sorted by `a`, then by `b`, then by `c`. Picture a phone book sorted by last name, then first name. You can find everyone named "Smith" instantly, and "Smith, John" too. But you cannot efficiently find everyone named "John" regardless of last name, because the book is not organized that way.

So an index on `(a, b, c)` can serve:

- `WHERE a = ?` ✅
- `WHERE a = ? AND b = ?` ✅
- `WHERE a = ? AND b = ? AND c = ?` ✅
- `WHERE a = ? AND c = ?` ⚠️ uses only the `a` part, then filters the rest
- `WHERE b = ?` ❌ cannot use the index at all, because there is no leftmost prefix

One more rule: a range condition stops the index from being used for anything after it. In `WHERE a = ? AND b > ? AND c = ?`, the index seeks on `a` and `b`, but `c` cannot help the seek. The practical takeaway: **put equality columns first and the range or sort column last.**

### Why an index can hurt you

Here is the part people forget. Every index is a copy that must stay in sync. Every `INSERT`, `UPDATE`, and `DELETE` has to update *every* affected index, which means extra random writes, more logging, and more page splits.

Ten indexes on a write-heavy table can make writes several times slower. Indexes are a **read tax paid on writes.** Add them on purpose, and hunt down the ones nothing uses (in Postgres, `idx_scan = 0` in `pg_stat_user_indexes` is a prime suspect).

## How a database never loses your data

When a transaction commits, the data is supposed to survive a power cut one millisecond later, even though writing it to its final home on disk is slow and random. How?

The trick is the **write-ahead log (WAL)**, and the rule is simple: **log the intent before changing the data.** Before touching any data page, the database appends a short record describing the change to a sequential log and forces it to disk. Only then does it apply the change to pages in memory, which get written to their final spots later, lazily and in batches.

This works because:

- The log write is **sequential and small**, so it is fast.
- The slow, random data-page writes can be **deferred and batched** for efficiency.
- A commit is durable the instant its log record hits disk, *not* when the data pages do. If the server crashes, the database **replays the log** on restart: redo committed changes, undo half-finished ones, and the database is whole again.

As a bonus, that same log is how databases ship changes to replicas and how they support point-in-time recovery. One elegant mechanism, several jobs.

## ACID, in plain language

ACID is the promise a transactional database makes. Four letters:

- **Atomicity** - a transaction is all-or-nothing. Transfer money and the system crashes halfway? Either both the debit and credit happen, or neither does.
- **Consistency** - the database moves from one valid state to another, respecting the rules you declared (foreign keys, uniqueness, checks). Part of this is your job; the database enforces the rules you give it.
- **Isolation** - concurrent transactions do not corrupt each other's view of the world. This is the slippery one, covered next.
- **Durability** - once committed, it survives a crash. That is the WAL.

One warning that trips people up constantly: the **"C" in ACID is not the "C" in CAP.** ACID consistency is about your declared rules. [CAP consistency](/blog/system-design/09-cap-pacelc-consistency-models) is about replicas agreeing with each other. Different ideas, same unfortunate word.

## Isolation levels and the anomalies they prevent

When many transactions run at once, things can go wrong in specific, named ways. Knowing these names lets you reason about correctness instead of hoping.

- **Dirty read** - you read a change another transaction made but has not committed, and then it rolls back. You read a value that never truly existed.
- **Non-repeatable read** - you read a row, someone else updates and commits it, you read again in the same transaction and get a different value.
- **Phantom read** - you run a query that returns five rows, someone inserts a sixth matching row, you rerun the query and now see six. A new row appeared inside your range.
- **Lost update** - you and I both read `count = 10`, both write `11`. One of those updates vanishes. This is the classic read-modify-write bug.
- **Write skew** - the subtle one. You and I each read an overlapping set of data, each check a rule that still holds, then each change a *different* row. Individually fine; together we broke the rule. Example: two doctors each check "at least one doctor is on call" (true), each takes themselves off call, and now nobody is on call.

Isolation levels are defined by which of these they forbid:

| Level | Dirty read | Non-repeatable | Phantom | Lost update | Write skew |
|---|---|---|---|---|---|
| **Read Uncommitted** | allowed | allowed | allowed | allowed | allowed |
| **Read Committed** | prevented | allowed | allowed | allowed | allowed |
| **Repeatable Read** | prevented | prevented | prevented* | prevented* | allowed |
| **Serializable** | prevented | prevented | prevented | prevented | prevented |

Read Committed is the default in Postgres and Oracle and is fine for most everyday work. Serializable is what you want for money, inventory, and any rule that spans rows, accepting a hit to throughput for correctness.

One critical gotcha: **"Repeatable Read" means different things in different databases.** Postgres implements it as full snapshot isolation, which blocks phantoms but still allows write skew. MySQL/InnoDB uses gap locks to block phantoms too. Know your engine.

Postgres also offers a clever **Serializable Snapshot Isolation (SSI)** that runs at snapshot speed but watches for dangerous patterns and aborts one transaction with error code `40001` if it detects a conflict. The catch: your app must **retry** when it sees that error.

## MVCC: how readers and writers stop fighting

Old databases made readers and writers wait for each other with locks. Modern ones use **Multi-Version Concurrency Control (MVCC)**, and the slogan is "readers don't block writers, and writers don't block readers."

The idea: instead of overwriting a row, the database keeps **multiple versions** of it and shows each transaction a consistent **snapshot** of the data as it looked when the transaction started.

In Postgres, every row secretly carries two markers: which transaction created it and which transaction deleted or replaced it. An `UPDATE` does not overwrite the old row. It writes a *new* version and marks the old one as superseded.

```
History for store id=42:

  v1  created=100  deleted=105   plan='free'   (seen by older snapshots)
  v2  created=105  deleted=none  plan='pro'    (current version)
```

This is wonderful for concurrency, but it has a consequence: **dead rows pile up.** Once no live transaction can see an old version, it is garbage, but it still takes up space. Postgres cleans this up with a process called **`VACUUM`** (which runs automatically). Neglect it and your tables bloat and slow down.

MySQL/InnoDB does MVCC differently: it updates the row in place and keeps old versions in a separate **undo log**, which readers walk backward through to reconstruct an older snapshot. Same goal, different bookkeeping.

### Pessimistic vs optimistic locking

When you genuinely need to coordinate writers, you have two styles:

- **Pessimistic**: lock the rows up front (`SELECT ... FOR UPDATE`) and hold them. Safe when conflicts are likely, but risks deadlocks and reduces concurrency. Good for hammering the same inventory counter repeatedly.
- **Optimistic**: do not lock; assume no conflict, then check at commit time (often with a `version` column) and retry if you lost. Cheap when conflicts are rare, wasteful when they are common.

Optimistic locking with a version column is the portable, correct fix for the lost-update bug. A bare read-modify-write in application code is not.

## Reading an EXPLAIN plan

SQL tells the database *what* you want; the **query planner** decides *how* to get it. It considers different strategies (which index, which join order, which join algorithm) and picks the cheapest, guided by **statistics** it gathers about your data.

`EXPLAIN` shows you the plan it chose. The node names you will see most:

- **Seq Scan** - read the whole table. Fine for small tables; a red flag on a big table with a selective filter, meaning a missing index.
- **Index Scan** - use an index, then fetch the matching rows.
- **Index Only Scan** - the index covered everything; no table fetch needed.
- **Nested Loop / Hash Join / Merge Join** - three ways to join tables.

```
EXPLAIN ANALYZE
SELECT * FROM orders WHERE tenant_id = 7 AND status = 'paid';

 Index Scan using ix_orders_tenant_status on orders
   (cost=0.43..812.5 rows=120)
   (actual time=0.05..1.2 rows=118 loops=1)
 Execution Time: 1.4 ms
```

The single most useful habit: **compare estimated `rows` against actual `rows`.** A big gap means the statistics are stale (run `ANALYZE`) and the planner probably chose a bad plan. Also watch for `Seq Scan` on large tables and huge `loops=` counts, which signal a query doing far more work than it should.

## Common misconceptions

**"More indexes always make things faster."** No. Indexes speed up reads and slow down writes. Every index you add is another structure to maintain on every write. Index deliberately.

**"Once COMMIT returns, the data must be safely written to its final place on disk."** Not quite. The commit is durable because its log record is on disk. The actual data pages may still be in memory, waiting to be flushed. Crash recovery replays the log to make everything consistent.

**"Repeatable Read protects me from everything except dirty reads."** It allows **write skew**, the sneaky anomaly where two transactions each pass a check and together break a rule. Only Serializable catches it.

**"A random UUID is a fine primary key."** In a clustered-index database like InnoDB, random UUIDv4 keys scatter inserts across the whole index, causing page splits everywhere and bloating every secondary index. Prefer sequential IDs, UUIDv7, or ULIDs for the storage key.

**"The 'C' in ACID and the 'C' in CAP are the same thing."** They are not. One is about your declared rules; the other is about replicas agreeing.

## How to use this

Turn the theory into habits:

1. **When a query is slow, run `EXPLAIN ANALYZE` first.** Look for a `Seq Scan` on a big table or a large gap between estimated and actual rows. Do not guess; read the plan.
2. **Design composite indexes around your queries.** Put equality columns first, the range or sort column last, and remember the leftmost-prefix rule.
3. **Use a covering index for hot read paths.** If a query is run constantly, `INCLUDE` its columns so it never touches the table.
4. **Audit your indexes.** Drop the ones with zero scans. They cost you on every write and buy you nothing.
5. **Fix lost updates properly.** Use an atomic `UPDATE ... SET x = x + 1`, a `SELECT ... FOR UPDATE`, or a version column with retry. Never a plain read-then-write.
6. **Use Serializable for cross-row invariants** (last-seat booking, on-call rotas, balances), and retry on serialization failures.
7. **Watch for idle-in-transaction connections.** A forgotten open transaction stops vacuum from cleaning up and bloats the whole database. Set a timeout like `idle_in_transaction_session_timeout`.
8. **Pick the engine for the workload.** Write-heavy firehose? Lean LSM. Read-heavy or balanced with strong consistency needs? Lean B-tree.

## Conclusion

Here is the one idea to keep: a database is not magic, it is a machine making predictable trade-offs between sequential and random disk access, between fast reads and fast writes, between strict correctness and raw throughput. Once you can name those trade-offs, slow queries and strange concurrency bugs stop being spooky and start being solvable.

The story that proves it best is a real one. Discord stored chat messages in a database and grew from a hundred million messages to *trillions*, peaking past a million writes per second. Their write-heavy, append-mostly workload was a textbook case for an LSM engine, so they moved to Cassandra and later ScyllaDB, carefully designing their partition keys to bound how much data lived in one place. Every concept in this article shows up in that migration: storage families, the leftmost-prefix rule, read amplification, tombstones, hot partitions.

Which raises the next question. Once a single machine is not enough and you have to spread data across many, how do you split it without breaking correctness, and what happens when one of those machines goes dark? That is the world of [replication and partitioning](/blog/system-design/08-replication-and-partitioning), and it is where these internals meet the network.
