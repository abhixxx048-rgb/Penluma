**This document is about clever shortcuts that let big software systems work fast without using too much memory. Instead of tracking every exact detail, these tools keep a tiny, rough summary and accept a small, controlled amount of error in return. Understanding these ideas explains why platforms like Reddit, Google, and Cassandra can handle billions of events without needing a warehouse full of servers.**

**The main parts explained simply:**

- **Bloom / Cuckoo filters (Is this thing already seen?)** - A tiny checklist that can confidently say "definitely not seen" but might occasionally say "yes" when the answer is actually "no." Used by databases to skip searching files that can't possibly have what you need, saving huge amounts of disk reading. Cuckoo filters work the same way but also allow removing items.

- **HyperLogLog (How many unique visitors?)** - Counts how many distinct things appeared in a stream (like unique website visitors) using only about 12 KB of memory, no matter if there were a thousand or a billion visitors. Reddit uses this for its "X views" post counter. The trade-off: you get an answer within about 1% accuracy, not an exact number - which is perfectly fine for a display counter.

- **Count-Min Sketch and Top-K (What are the most popular items?)** - A grid of counters that tracks how often each item appears. It can tell you which items are "hot" (trending searches, busy API keys, popular products) using only tens of kilobytes. It always over-counts a little, never under-counts. Pair it with a "Top-K" tracker to find the actual most popular items.

- **t-digest and DDSketch (What is my slowest 1% of requests?)** - Tools for measuring percentiles (like "what speed do 99% of orders complete within?") across many servers at once, without storing every single measurement. Normal averages don't work for this - you need these mergeable sketches. Used in monitoring dashboards and performance tracking.

- **Merkle trees (How do two copies of data stay in sync?)** - A tree of checksums that lets two database replicas quickly find which rows are different, without comparing every row. Like comparing chapter summaries before reading pages word for word. Used by Cassandra and DynamoDB to repair out-of-sync copies efficiently.

- **Consistent hashing (How do we spread data evenly across many servers?)** - A method for deciding which server stores which piece of data. When you add or remove a server, only a small fraction of data needs to move - not everything. Used by Cassandra, Memcached, and load balancers. "Virtual nodes" (multiple slots per server) make the load spread even more evenly.

- **Geohash, Quadtrees, S2 (How do we find nearby locations fast?)** - Ways to turn two-dimensional map coordinates into a single value that a normal database index can search. Geohash is simple and widely supported; quadtrees adapt to dense areas; Google's S2 is the most accurate for planet-scale apps. Used by Redis, Uber, and Google Maps for "find nearby" queries.

- **Skip lists (How do sorted lists stay fast to search and update?)** - A layered linked list with "express lanes" that jumps over many items at once, making search and insert as fast as a balanced tree but simpler to build for concurrent (multi-user) access. Redis sorted sets use this internally.

**What to do with this:**

When an exact answer is not required (view counts, visitor counts, "is this popular?"), reach for one of these sketches - they use a tiny, fixed amount of memory no matter how big the data grows. Always know which direction the error goes (over-count vs. under-count vs. false positive) before choosing one, so you pick the right tool for your situation.
