**This document explains how databases physically store data, why some databases are better for reading versus writing, how indexes speed up (and sometimes slow down) queries, and how databases keep data safe and consistent when many users work at the same time. Understanding this helps you pick the right tool, spot why a query gets slow, and avoid silent data bugs.**

**The main parts explained simply:**

- **Pages (how data lives on disk)** - Databases read and write data in fixed-size chunks called pages (usually 8–16 KB), not one row at a time. Reading in order is far faster than jumping around the disk, and this single fact shapes every design decision below.

- **B-tree vs LSM-tree (two storage engine families)** - B-trees (PostgreSQL, MySQL) are great for mixed reads and writes; they update data in place. LSM-trees (Cassandra, RocksDB) suit constant heavy writes; they only append, making writes very fast but reads slightly slower.

- **Indexes** - Like a book index, they let the database find rows without scanning everything. But every index also slows down inserts and updates, since the database must update each index too. Add them where they speed up reads; remove ones nobody uses.

- **Write-ahead log (WAL)** - Before changing any data, the database writes a note about the change first. If power fails, it replays that note on restart to finish or undo the change safely. This is how committed data survives crashes.

- **Buffer pool (page cache)** - Databases keep hot data in RAM. If the data you use most fits in RAM, queries are fast. If not, every miss reads from disk, which is much slower.

- **ACID** - Four guarantees every reliable database makes: changes are all-or-nothing, they respect declared rules, multiple users don't corrupt each other's work, and committed data survives a crash.

- **Isolation levels and concurrency bugs** - When two users change data at the same time, subtle bugs can occur (one reads outdated data, two overwrite each other silently). Higher isolation levels block more of these bugs but cost more speed. Serializable isolation is safest for money and inventory.

- **MVCC (Multi-Version Concurrency Control)** - The database keeps multiple versions of a row so readers never block writers. Old versions pile up and need regular cleanup (called VACUUM in PostgreSQL); skipping it causes bloat and gradual slowdowns.

- **Query planner and EXPLAIN** - The database picks a plan for how to run each query. The EXPLAIN command shows you that plan. A "Seq Scan" on a large table usually means a missing index.

- **Discord case study** - Discord grew from millions to trillions of messages and migrated from MongoDB to Cassandra, then to ScyllaDB. Their write-heavy, append-mostly workload was a perfect fit for LSM-trees. Key lesson: group data by how you read it, keep those groups bounded in size, and solve extreme hot-spot problems above the database layer.

**What to do with this:** When a query gets slow as data grows, run EXPLAIN and look for a missing index first. For high-write features like logs, events, or chat, consider an LSM-based database over a traditional SQL one.
