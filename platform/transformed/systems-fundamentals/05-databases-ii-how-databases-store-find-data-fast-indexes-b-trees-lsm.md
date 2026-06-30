---
title: 'How Databases Find One Row in a Billion (Without Reading Them All)'
metaTitle: 'How Database Indexes Work: B-Trees & LSM'
description: 'How database indexes find one row in a billion almost instantly. A clear guide to pages, B-trees, LSM-trees, and writing queries that stay fast.'
keywords:
  - how database indexes work
  - what is a B-tree index
  - LSM tree vs B-tree
  - database index explained
  - full table scan
  - clustered vs secondary index
  - covering index
  - composite index leftmost prefix
  - EXPLAIN ANALYZE
  - why is my query slow
  - write-ahead log
  - database buffer pool
faq:
  - q: Why is my database query slow even on a small table?
    a: Usually the database is doing a full table scan because there's no index on your WHERE, JOIN, or ORDER BY column. Run EXPLAIN ANALYZE to confirm, then add an index on the filtered column and re-check the plan.
  - q: What is a B-tree index in simple terms?
    a: It's a sorted, balanced tree of pages where each node points to hundreds of children. That width keeps the tree shallow, so the database reaches any row in just three or four page reads, even across a billion rows.
  - q: What's the difference between an LSM-tree and a B-tree?
    a: A B-tree updates data in place with random writes and gives predictable read speed. An LSM-tree appends writes sequentially for very high write throughput, but reads may check several files. B-trees suit general apps; LSM-trees suit write-heavy ingest.
  - q: Do more indexes always make a database faster?
    a: No. Indexes speed up reads but slow down every insert, update, and delete, and they consume space. An unused index is pure overhead. Index for the queries you actually run, then drop the rest.
  - q: Why does my index get ignored by the query planner?
    a: Common causes are wrapping the column in a function like lower(email), casting its type, a leading wildcard such as LIKE '%abc', stale statistics, or a query that returns most of the table. Match the column exactly and run ANALYZE.
  - q: What does a covering index do?
    a: A covering index contains every column a query needs, so the database answers from the index alone and never touches the table. In PostgreSQL this is an index-only scan, and it's dramatically faster for hot read queries.
topic: systems-fundamentals
topicTitle: Systems Fundamentals
category: Engineering
date: '2026-06-21'
order: 4
icon: ⚙️
author: Brexis Wazik
transformed: true
polished: true
linked: true
sources: []
---

You ask your database for one user out of a billion. It comes back in a millisecond. That should feel impossible: a billion rows, and it found the right one before you blinked.

It isn't magic. It's a handful of clever ideas working together: **pages**, **indexes**, **B-trees**, and **logs**. Once you understand them, you'll know exactly why some queries feel instant and others grind your app to a crawl, and you'll know how to fix the slow ones.

## Why this matters

The gap between a fast app and a slow one is almost never the language you wrote it in. It's whether the database can *jump* to your data or has to *hunt* for it.

A query that reads three pages and a query that reads three hundred thousand pages can return the same single row. One takes a millisecond. The other takes seconds and pegs your CPU under load. The difference is entirely about how the data is stored and indexed.

Learn this, and you can:

- Diagnose a slow query instead of guessing.
- Add the *right* index instead of scattering them everywhere.
- [Pick the right database for a write-heavy versus read-heavy job](/blog/systems-fundamentals/11-putting-it-together-designing-a-real-system-trade-offs).

Let's open the hood.

## Data lives in pages, not rows

Here's the first surprise: a database never reads a single row from disk. Storage is carved into fixed-size chunks called **pages** (sometimes called blocks). A page is the smallest unit the database ever reads or writes.

To fetch one row, the engine reads the *entire page* that holds it into memory. To change one byte, it eventually writes the whole page back.

Real sizes: **PostgreSQL** uses 8 KB pages, **MySQL/InnoDB** uses 16 KB. Why bother with pages at all? Because disks and SSDs are far quicker at moving one big chunk than thousands of tiny scattered reads. A page packs in a small header, pointers to rows, and the rows themselves.

This leads to the single most important mental shift in this whole article:

> **The cost of a query is measured in pages read, not rows read.**

A thousand rows packed into 20 pages is cheap. The same thousand rows scattered across 1,000 pages is 50 times more expensive, even though the row count is identical.

## Why a full table scan is slow

A **full table scan** (also called a sequential scan) reads *every page* of a table to find matches.

Picture 10 million users and the query `WHERE email = 'sam@x.com'` with no index. The engine reads hundreds of thousands of pages, even though exactly one row matches. The work grows in direct proportion to table size, what engineers call **O(n)**: double the table, double the work.

**The analogy:** finding one word in a 900-page book by reading every page from the start. That's a full scan. The index at the back of the book, a sorted list of terms with page numbers, lets you jump straight to the right page. A database index does exactly that.

### But scans aren't always the villain

Here's the nuance most people miss. If your query returns *most* of the table ("give me all orders"), reading every page in order is actually the *fastest* option. Sequential reads are friendly to both the disk and the cache, so the planner deliberately picks a scan.

A scan only hurts on **selective** queries, the ones that return a tiny slice of rows, where reading the whole table to find a handful of matches is enormous waste.

## Indexes: the core idea

An **index** is a separate, sorted structure that lets the engine *jump* straight to matching rows instead of scanning everything.

Each index entry stores the indexed value plus a **pointer** to where the full row lives. The index stays sorted by value, so the engine can binary-search it. Find the value fast, follow the pointer, done.

Indexes trade **space and write cost** for **read speed**, a deal that's almost always worth it for the columns you actually search on.

## B-trees: how "three reads in a billion rows" actually happens

The default index in PostgreSQL, MySQL, SQL Server, Oracle, and SQLite is the **B-tree** (technically a B+tree). It's a tree of pages with three key properties:

- **Balanced.** Every leaf at the bottom sits the same distance from the top. So every lookup costs the same number of steps, no matter which value you search.
- **High fanout.** Each node is one page, and a page holds *hundreds to ~1,000* keys. "Fanout" means how many children a node points to. High fanout makes the tree very wide and very shallow.
- **Sorted, linked leaves.** All the real keys live in the leaves, and the leaves are chained left to right in sorted order.

Now the magic, with real numbers. Suppose each node holds about 1,000 keys. A tree just **three levels deep** reaches 1,000 × 1,000 × 1,000 = **one billion rows**.

A lookup walks root → internal node → leaf, doing a quick binary search inside each node. That's only **three page reads to find one row among a billion**. And the top one or two levels are almost always cached in memory, so often only the final leaf is a real disk read.

```
                 [   ROOT page   ]              level 1 (cached)
               /        |         \
       [internal]   [internal]   [internal]    level 2 (cached)
        /  |  \       /  |  \       /  |  \
     [leaf][leaf] ... sorted (key -> row pointer) ...   level 3
       <-->  <-->  <-->  leaves linked for range scans  -->
       ~1000 x 1000 x 1000 = ~1 billion rows in 3 reads
```

That walk takes **O(log n)** time, which grows incredibly slowly. Going from a million rows to a billion adds only *one* extra level. Compare that to the scan's O(n): from "read every page" to "read three or four."

**Bonus:** because the leaves are sorted and linked, a B-tree also handles **range queries** for free, `BETWEEN`, `>`, `<`, `ORDER BY`, and prefix searches like `LIKE 'abc%'`. It finds the first matching leaf and walks sideways. A hash index, which only does exact "equals" lookups, can't do this.

## Two ways to connect the index to the row

Databases differ on how the index relates to the actual data, and the two most popular engines pick opposite strategies.

**Clustered index (InnoDB / MySQL).** The *table itself* is stored physically sorted by the **primary key** (the column that uniquely identifies each row). The leaf nodes *are* the rows. There's exactly one clustered index per table, and a primary-key lookup lands directly on the row, no second hop.

**Secondary index.** A separate B-tree whose leaves hold the key plus a pointer back to the row. In InnoDB, that pointer is the primary-key value. So searching by, say, email does *two* tree walks: the email index gives you a primary key, then the clustered index turns that key into the actual row. This is the **double lookup**.

**PostgreSQL does it differently.** It stores the table as an unordered **heap** (a pile of rows in no order) and makes *all* indexes secondary, pointing at a heap location. There's no clustered index.

A concrete InnoDB example for `WHERE email = 'sam@x.com'`:

1. Walk the email index → it returns `user_id = 42`.
2. Walk the clustered primary-key index for `42` → that lands on the real row.

Two traversals. (A covering index, coming up next, can erase the second.)

## Composite and covering indexes

A **composite index** covers multiple columns, say `(last_name, first_name)`. It's sorted by `last_name` first, then by `first_name` within each last name, exactly like a phone book.

And like a phone book, it has a catch. Sorted by last name then first, it instantly finds "Smith" or "Smith, John." But it's *useless* for finding every "John" regardless of last name, because the sort never groups first names together.

That's the **leftmost-prefix rule**. A composite index on `(a, b, c)` serves `WHERE a=…`, `a=… AND b=…`, and all three together, but **not** `WHERE b=…` alone. Column order matters.

A solid rule of thumb for ordering columns in a composite index:

1. **Equality** columns first (`a = …`).
2. Then **sort** columns (`ORDER BY`).
3. **Range** columns (`>`, `<`, `BETWEEN`) last.

A **covering index** goes one step further: it contains *every* column a query needs, so the engine answers from the index alone and never touches the table. PostgreSQL calls this an **index-only scan**.

PostgreSQL and SQL Server let you write `CREATE INDEX … (email) INCLUDE (name, created_at)`. The `INCLUDE`d columns ride along in the leaf for retrieval but aren't sort keys. This kills the second hop and is dramatically faster for hot read queries.

## The trade-off nobody escapes: reads vs writes

Indexes speed up reads, but nothing is free.

- **They slow down writes.** Every `INSERT`, `UPDATE`, and `DELETE` must update the table *and every affected index*. Five indexes mean five extra structures to maintain on each write.
- **They cost space.** Each index is a copy of its columns plus pointers. Together, indexes can outweigh the table itself.
- **They need maintenance.** Over time they fragment and bloat, and must be vacuumed or rebuilt.

## Write-optimized storage: LSM-trees

A B-tree updates *in place*: to change a row it finds the page and rewrites it, a **random write** to a scattered location. Under very heavy write load, those random writes become the bottleneck.

The **LSM-tree** (Log-Structured Merge-tree), used by **Cassandra, RocksDB, LevelDB, ScyllaDB, and HBase**, solves this by turning random writes into fast **sequential** ones, simply appending to the end of a file. The write path:

1. The write is appended to a durable log and inserted into an in-memory sorted structure called the **memtable**.
2. When the memtable fills, it's frozen and flushed sequentially to disk as an immutable **SSTable** (Sorted String Table): key-value pairs sorted by key, plus a small index and a Bloom filter.
3. SSTables pile up, so a background **compaction** process merge-sorts overlapping ones into fewer, larger files, dropping overwritten values and deletes (a delete is recorded as a marker called a **tombstone**).

```
write -> log (durable) -> MEMTABLE (RAM, sorted)
                              | full -> flush (sequential)
                              v
      SSTable  SSTable  SSTable     <- L0 (immutable, sorted)
                 | compaction (merge-sort, drop dups + tombstones)
                 v
           larger SSTables          <- L1, L2 ... bigger, fewer
```

The catch is **reads**. A key might live in the memtable or in *any* SSTable. To avoid opening every file, each SSTable carries a **Bloom filter**, a tiny probabilistic structure that answers "definitely not in this file" or "maybe in this file." It lets the engine skip files that can't contain the key.

Here's how the two storage engines compare:

| Aspect | B-tree | LSM-tree |
| --- | --- | --- |
| Writes | Random, in-place (slower under heavy load) | Sequential append (very high throughput) |
| Reads | Predictable, usually 3–4 page reads | May check several files (read amplification) |
| Extra work | Page splits, fragmentation | Compaction rewrites data, latency spikes |
| Best for | Read-heavy, general OLTP | Write-heavy, high-ingest, time-series |

## Two unsung heroes: the WAL and the buffer pool

Two background mechanisms quietly make everything above safe and fast.

### The Write-Ahead Log (durability)

The **Write-Ahead Log (WAL)** follows one rule: *log the change before you change the data.* Before [a transaction commits](/blog/systems-fundamentals/04-databases-i-relational-databases-sql-acid), its changes are forced safely to disk (an operation called fsync) into the sequential WAL. *Only then* is the commit confirmed to the client. The actual data pages get written to disk lazily later, during a **checkpoint**.

Why this matters: if power dies mid-transaction, on restart the engine **replays the WAL**. It redoes committed changes that hadn't reached the data files yet and discards uncommitted ones. No lost committed data, no half-written "torn" pages. And because the WAL is append-only sequential I/O, it's fast.

PostgreSQL calls it the WAL; InnoDB calls it the **redo log**, same idea. (One caution: the WAL is for crash recovery, not a backup. It's no substitute for real backups.)

### The buffer pool (caching)

The **buffer pool** (PostgreSQL's `shared_buffers`; InnoDB's buffer pool, often 50–75% of RAM) is an in-memory cache of recently used pages. Every read and write passes *through* it. When a page is already there, it's a **buffer hit**, zero disk I/O.

This is why the *second* run of a query is often dramatically faster, and why the top levels of a B-tree are effectively free: they live permanently in RAM. Keeping your **working set** (the data you actually touch) in the buffer pool is one of the highest-leverage optimizations there is.

## Common misconceptions

**"Every `Seq Scan` in a query plan is a bug."** No. For a query returning most of the table, a scan is genuinely cheaper than thousands of random index lookups. The planner is right to pick it.

**"More indexes means a faster database."** An unused index is pure overhead. It slows every write and wastes space with zero read benefit. In PostgreSQL, `pg_stat_user_indexes` reveals which ones never get used.

**"LSM-trees are universally faster."** They win on write-heavy ingest but add *read amplification* (checking multiple files) and occasional latency spikes when compaction runs. B-trees give more predictable read latency for everyday transactional apps.

**"A random UUID is a fine primary key in InnoDB."** Because the table is physically sorted by the primary key, random keys scatter inserts all over the disk (causing page splits), and since every secondary index stores the primary key, a fat random key bloats *every* index. Prefer a monotonic, always-increasing key for the clustered index.

**"Creating an index guarantees it gets used."** Stale statistics or low selectivity can make the planner ignore it. Always re-check the plan.

## How to fix a slow query

SQL is **declarative**: you say *what* you want, and the **query planner** decides *how*, which index, which scan, which join order. It leans on table **statistics** (gathered by the `ANALYZE` command) to estimate how many rows match and pick the cheapest plan. Your job is to read its mind and give it better options.

Here's the workflow:

1. **Find the slow query.** Use `pg_stat_statements` or the slow-query log. Don't optimize by vibes.
2. **Run `EXPLAIN ANALYZE`.** `EXPLAIN` shows the *estimated* plan; `EXPLAIN ANALYZE` actually runs it and shows *real* timings and row counts. Add `BUFFERS` to see pages hit in cache versus read from disk.
3. **Spot the problem.** A `Seq Scan` on a big table feeding a selective filter smells like a missing index. A big gap between *estimated* and *actual* rows means stale stats, run `ANALYZE`. A `Nested Loop` over many rows often means a missing index on the join column.
4. **Add the right index** on the `WHERE` / `JOIN` / `ORDER BY` columns, equality columns first, range columns last.
5. **Consider `INCLUDE` columns** to make the index covering, so the query never touches the table.
6. **Re-run `EXPLAIN ANALYZE`** and confirm the planner actually *uses* the new index and reads fewer buffers.

A real before-and-after on an `orders` table:

- **Before:** `Seq Scan on orders (rows=1) actual time=210ms`, reading the whole table to find one order.
- **Fix:** `CREATE INDEX idx_orders_customer ON orders(customer_id);`
- **After:** `Index Scan using idx_orders_customer ... actual time=0.3ms`, with `BUFFERS` showing reads drop from thousands to a handful. Roughly a 700× speedup from one index.

### Things that silently disable an index

Watch out for these, they look fine but quietly force a scan:

- **Wrapping the column in a function:** `WHERE lower(email) = …`. Match the column exactly, or build an expression index.
- **Casting the type:** `WHERE date_col::text = …`.
- **A leading wildcard:** `LIKE '%abc'` can't use a normal B-tree (only `'abc%'` can). Use a trigram or full-text index instead.

## Conclusion

If you remember one thing, make it this: **a database is fast not because it reads quickly, but because it reads almost nothing.** The whole game is avoiding pages, and a good index is how a billion-row table collapses into three or four reads.

Everything else, B-trees, LSM-trees, the WAL, the buffer pool, is just different machinery built around that one goal: touch as little data as possible, as sequentially as possible, as cached as possible.

So next time a page loads instantly, you'll know there's a shallow tree underneath doing three reads instead of three hundred thousand. And here's the thread worth pulling next: once a single database can't keep its hot data in RAM anymore, you have to [split it across many machines](/blog/systems-fundamentals/09-distributed-systems-many-computers-working-as-one). That's where [**sharding and replication**](/blog/systems-fundamentals/06-databases-iii-scaling-up-replication-partitioning-nosql) come in, and a fresh set of trade-offs begins.
