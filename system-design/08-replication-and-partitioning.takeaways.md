**This document explains two big ideas that every large website relies on: keeping copies of your data on multiple computers (so the site stays up if one breaks), and splitting a huge amount of data across many computers (so no single machine gets overwhelmed). Understanding these ideas helps you reason about why databases sometimes show you old data, lose a write, or slow down — and what engineers do to fix it.**

**The main parts explained simply:**

- **Replication (making copies)** — Storing the same data on several machines at once. If one machine crashes, the others still have the data and the site keeps running. The trade-off: keeping all copies perfectly in sync slows things down, so most systems let copies fall a little behind.

- **Partitioning / Sharding (splitting data)** — When your data is too big for one machine, you slice it into pieces and put each piece on a different machine. This is how companies like Amazon handle billions of records.

- **Single-leader replication** — One machine is in charge of all writes; the others just follow and copy. Simple and safe, but if the leader dies someone must take over — and during that handover, recent saves can be lost.

- **Multi-leader replication** — Two or more machines each accept writes, then sync with each other. Useful when you have offices in different countries, but messy: if both machines change the same record at the same time, you have a conflict to resolve.

- **Leaderless replication (quorums)** — No single boss. A write is saved to several machines at once, and a read checks several machines and picks the freshest answer. Amazon's shopping cart was built this way so it could never refuse a write, even during outages.

- **Replication lag problems** — When copies fall behind the leader, a user might save something, refresh the page, and see the old value — as if the save never happened. This is exactly the "saved but it's gone" bug. The fix is to send that user's reads to the main machine for a short time after they write.

- **Hot spots** — If data is split by date or a sequential number, all new writes pile onto one machine while the rest sit idle. The fix is to use a smarter key that spreads writes evenly.

- **Consistent hashing** — A clever way to split data across machines so that adding or removing a machine only moves a small fraction of data, not everything at once.

- **Conflict resolution** — When two machines accept conflicting writes, someone must decide which one wins. The lazy approach (latest timestamp wins) silently throws away data when clocks differ by even a few milliseconds. Better approaches track which write came first logically, or merge both versions.

- **Secondary indexes across partitions** — Searching by something other than the main key (e.g. "find all red products") may require asking every machine and combining results — which is slow at scale.

**What to do with this:**

When adding read replicas to a database, always route a user's reads back to the main database for a moment after they save — otherwise users will see "stale" data and think their save was lost. When splitting data across machines, pick a partition key that spreads writes evenly, not one that funnels all new writes to a single machine.
