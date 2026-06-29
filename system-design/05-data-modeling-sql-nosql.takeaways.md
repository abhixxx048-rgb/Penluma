**This document explains how to decide where and how to store data in a software system — and when a traditional database is the right choice versus a modern "NoSQL" database. Getting this wrong early leads to slow apps, expensive fixes, and systems that break under heavy traffic. Getting it right means your app stays fast no matter how many customers show up.**

**The main parts explained simply:**

- **Traditional (SQL) databases — the meticulous library** — Store each piece of information in exactly one place and look it up by joining different tables together. Great for most apps. A well-run Postgres database handles millions of records without any problem. Only look elsewhere when you've truly outgrown it.

- **Normalization — no repeated facts** — A design rule that says each piece of data (like a customer's name) lives in exactly one place. When the customer updates their name, only one record changes. The flip side is you sometimes need to combine multiple tables to answer a question.

- **Why big databases can't always join tables** — When data is split across many machines (to handle huge traffic), combining tables requires moving data across the network, which is very slow. This is the core reason companies move away from joins at massive scale.

- **Four types of NoSQL databases** — Each is built for a different job: key-value stores (fast single-item lookup, like a dictionary), document stores (store a whole related group — like an order plus all its items — as one record), wide-column stores (fast for time-series or sensor data), and graph databases (mapping connections between things, like a social network).

- **Design around your questions, not your data** — NoSQL requires you to decide upfront exactly what questions you'll ask the database. If you know "I'll always look up orders by customer," build the storage around that. If you don't know your questions yet, a traditional database is safer.

- **Partition keys and sort keys — the most important NoSQL choice** — The "partition key" decides which machine stores your data; pick one with many distinct values (like user ID, not order status) so load spreads evenly and no single machine gets overwhelmed.

- **Single-table design** — A DynamoDB technique where many different types of records (customers, orders, addresses) share one table, organized by smart key choices so one database call returns everything you need, with no joins.

- **Pre-computing results to make reads faster** — Instead of calculating answers at read time, you can store pre-built answers at write time. Fast to read, more work to write. Twitter does this for most users but skips it for celebrities with 100 million followers because writing to 100 million places per tweet is too expensive.

- **Using multiple databases together (polyglot persistence)** — Large systems often use Postgres for reliable storage, Elasticsearch for search, Redis for speed, and others — each doing what it does best. The hard part: keeping them in sync safely using a "change stream" rather than writing to both at once (which breaks if the app crashes mid-write).

- **Common mistakes** — Switching to NoSQL too early (most apps never need it), picking a bad partition key that sends all traffic to one machine, or treating NoSQL like SQL and ending up with slow app-side joins.

**What to do with this:** Start with a standard Postgres database — it handles far more than most people think. Only consider NoSQL when you can clearly name every query your app will run and traditional joins are provably too slow. When you do use NoSQL, the partition key choice (spread load evenly, use a high-variety field like user ID) is the single most important decision you'll make.
