---
title: "Replication and Sharding: How Big Sites Never Go Down"
metaTitle: "Replication & Partitioning Explained"
description: "Learn how replication keeps copies of your data alive and how partitioning (sharding) splits huge datasets across machines, plus the failures that bite at 3am."
keywords:
  - replication
  - database partitioning
  - sharding
  - consistent hashing
  - quorum
  - leaderless replication
  - read replica lag
  - single leader replication
  - multi-leader replication
  - hot key problem
  - secondary index sharding
  - Amazon Dynamo
  - last write wins
  - vector clocks
topic: system-design
topicTitle: System Design
category: Engineering
date: '2026-06-15'
order: 8
icon: "\U0001F3D7️"
faq:
  - q: "What is the difference between replication and partitioning?"
    a: "Replication keeps the same data on multiple machines so the system survives a failure. Partitioning (sharding) splits different data across machines so you can store more than one machine can hold. Most large systems do both."
  - q: "What does the quorum rule R + W > N mean?"
    a: "N is how many copies you keep, W is how many must confirm a write, and R is how many must answer a read. When R + W is greater than N, every read overlaps at least one node that has the newest write, so reads can find the latest value."
  - q: "Why is hash(key) mod N a bad way to shard data?"
    a: "When you add or remove a node, the number N changes, which changes the result for almost every key. That forces nearly all your data to move at once. Consistent hashing only moves about 1/N of the data instead."
  - q: "Why did I save a change but still see the old value?"
    a: "Your read probably hit a replica that had not yet received your write. This is the read-your-writes problem. The common fix is to route a user's reads to the primary for a short window right after they write."
  - q: "What is the hot key problem in sharding?"
    a: "When one key gets far more traffic than the rest (a viral product, a celebrity account), even perfect sharding cannot help, because a single key lives on a single shard. You fix it by splitting that key across many sub-keys or caching it separately."
  - q: "Is last-write-wins safe for resolving conflicts?"
    a: "Often not. It relies on synchronized clocks, and clock skew across machines is commonly 10 to 100 milliseconds, so a 'later' timestamp can belong to an earlier write. It silently drops the loser. Use it only for fields where losing a write is acceptable."
author: Pritesh Yadav (priteshyadav444)
transformed: true
polished: true
sources:
  - https://en.wikipedia.org/wiki/Consistent_hashing
  - https://en.wikipedia.org/wiki/Dynamo_(storage_system)
  - https://en.wikipedia.org/wiki/Quorum_(distributed_computing)
---

A single server can die at 3 a.m. and take your whole site with it. It can also run out of disk on a Tuesday and refuse another byte. Two simple ideas keep the biggest websites in the world from suffering either fate: **keep copies of your data on several machines**, and **split data too big for one machine across many**.

That is replication and partitioning. They sound like plumbing. But they decide whether your users see a stale cart, lose an order, or get an outage during your busiest hour.

## Why this matters

Every system that grows past one box eventually hits a wall. Either the data is too big for one machine, or one machine failing is too risky to allow. Replication and partitioning are how you climb over both walls.

Get them right and your site survives a dead server, serves reads from a copy close to the user, and scales past any single machine's limits. Get them wrong and you get the quiet failures that are hardest to debug: a write that vanishes with no error, a user who "saved" something that isn't there, one melting server while the rest sit idle.

This is also the bread and butter of system design interviews and on-call life. If you can reason about copies and splits clearly, most distributed systems stop feeling like magic.

## The two ideas are not the same thing

People constantly mix these up, so let's pin them down.

- **Replication** means keeping the *same* data on *multiple* machines. The goals: stay up when a machine dies, serve more reads by spreading them across copies, and answer faster from a copy that is geographically near the user.
- **Partitioning** (also called **sharding**) means splitting *different* data across *multiple* machines. The single goal: hold more than one machine's disk, memory, or CPU can handle.

Real systems do **both**. You split your data into shards, then keep several copies of each shard.

Picture a 10 TB dataset. First you partition it into Shard A, Shard B, and Shard C, each holding a slice of the keys. Then you replicate each shard three times, so Shard A lives on machines A1, A2, A3, and so on.

Why bother with both? If machine A2 dies, you lose one copy of Shard A, but no data is lost. But if *all* of Shard C's copies die together, you lose a third of your dataset. That is why **where you place copies matters**: never put every copy of a shard in the same rack or the same data center. Spread them across failure zones so one bad rack can't take down a whole shard.

The rest of this article walks through replication first, then partitioning, then the famous case study that ties it all together.

## Replication: who is allowed to write?

The whole personality of a replicated system comes down to one question: which machines accept writes? There are three answers.

### Single-leader: one machine is the boss

One node is in charge. All writes go to it. It then tells every other copy what changed.

Think of a teacher dictating notes. Only the teacher writes the canonical version; the students copy it down. The leader records every change in a **replication log** and ships that log to its followers.

This is the workhorse behind most web apps. **PostgreSQL** streams its write log to standby servers. **MySQL** ships a similar event log. A typical setup is one primary database with a few read-only replicas behind it.

The crucial decision here is **when the leader tells the client "done."**

- **Synchronous:** the leader waits for a follower to confirm before saying done. No data loss if the leader dies, but every write is only as fast as the follower, and a slow follower stalls everyone.
- **Asynchronous:** the leader says done as soon as it writes locally, then ships changes in the background. Fast and resilient, but if the leader dies, any writes not yet shipped are simply *gone*.

Cross-region async replication typically lags 10 to 500 milliseconds. For a "last seen online" timestamp, losing that tail is fine. For an order checkout, it is a disaster. The common compromise is **semi-synchronous**: one synchronous follower in the same local zone (sub-millisecond confirm, no single-machine data loss) plus async copies shipped to other regions.

The genuinely hard part of single-leader is **failover** - what happens when the boss dies:

1. **Detecting the death.** You decide it's dead after a timeout. Too short and you get false alarms; too long and you sit in downtime.
2. **Picking a successor.** You want the follower that is most caught up, to lose the least data.
3. **Lost writes.** Async writes the old leader never shipped are gone. GitHub's well-known 2012 outage came from exactly this: a promoted replica was behind, and when the old leader rejoined, its un-shipped writes were discarded, causing ID reuse that pointed records at the wrong rows.
4. **Split brain.** Two nodes both believe they are the leader and both accept writes. The fix is to forcibly fence the old leader off, or give leaders a numbered lease so the cluster rejects writes from a stale one.

### Multi-leader: several bosses, one per region

Now multiple nodes accept writes, usually one per region. Each takes local writes and they sync to each other. Like two editors changing a shared document offline, then merging later.

This shines for multi-data-center setups (write locally, survive a whole region going down) and offline clients (your phone's calendar accepts edits with no signal, then syncs).

The catch is **write conflicts**. Two leaders can change the same record at the same time with no agreed order, and now someone has to decide who wins. That conflict tax is real, which is why multi-leader is a "use only if you truly must" choice. If your users mostly write within one region anyway, single-leader-per-region with home-region routing is simpler and safer.

### Leaderless: no boss at all

Here the client writes to *several* copies and reads from *several* copies, and uses the overlap to stay correct. Like asking three of your five friends what time the party starts and trusting the newest answer.

This is the **Amazon Dynamo** style, used by **Cassandra**, **Riak**, and **ScyllaDB**. The key idea is a **quorum**, and it rests on three numbers:

- **N** = how many copies you keep of each piece of data.
- **W** = how many copies must confirm a write before it counts.
- **R** = how many copies must answer a read.

The magic rule: **if R + W is greater than N, every read overlaps at least one copy that has the latest write.**

Say N = 3, W = 2, R = 2. Then R + W = 4, which is greater than 3. You write to nodes 1 and 2. Later you read from nodes 2 and 3. They overlap at node 2, which has your write, so the read can find it.

You can tune these knobs. Want fast writes for a logging system? Set W low. Want safer reads? Raise R. The balanced default is to make both R and W a majority of N.

One honest caveat: a quorum gives you a **bound on staleness**, not perfect ordering. Concurrent readers during a write can still see different values, and certain failure patterns can still lose writes. For truly strict ordering you need consensus algorithms, not quorums. Quorums buy availability and decent freshness, not perfection.

How do copies that missed a write catch up? Three mechanisms:

- **Read repair:** when a read notices one copy is stale, it writes the fresh value back on the spot.
- **Hinted handoff:** if a target node is down during a write, another node holds a "hint" and delivers it when the node returns.
- **Merkle trees:** a background process compares copies using a tree of hashes, so two machines can find their differences cheaply without shipping the whole dataset.

## Replication lag: why "I saved it but it's gone"

Because async replicas trail the leader, a few classic bugs show up. They feel like ghosts until you name them.

- **Read-your-own-writes:** a user posts a comment, refreshes, and it's missing, because the refresh hit a lagging replica. Fix: send that user's reads to the leader for a few seconds after they write.
- **Monotonic reads:** time appears to move backward. One refresh shows new data, the next shows old data, because two replicas are at different lag. Fix: pin each user to one replica.
- **Consistent prefix reads:** you see an answer before its question, because related writes landed on different partitions out of order. Fix: keep causally related writes together.

The first one is a silent-lie trap. Imagine a shop owner edits a product price, the next page reads a lagging replica, and they see the *old* price. The system said "Saved," but the screen says otherwise, and now they don't trust it. The fix has a name: **stick to the primary right after a write.**

### When two writes collide, who wins?

In multi-leader and leaderless systems, conflicts are unavoidable. Your strategy for resolving them matters a lot:

- **Last-write-wins (LWW):** the write with the highest timestamp wins. Simple, and the Cassandra default. Also dangerous: it relies on synchronized clocks, and clock skew across machines is commonly 10 to 100 milliseconds, so a "later" timestamp can belong to an *earlier* write. The loser vanishes with no error.
- **Vector clocks:** these can tell whether two writes were truly concurrent or one came after the other, and hand genuine conflicts to your application to resolve. Nothing is silently dropped.
- **CRDTs (conflict-free replicated data types):** special data structures whose merges are mathematically guaranteed to converge. This is the modern answer for mergeable state, and the foundation under collaborative editors.

Use LWW only for fields where losing a write is genuinely fine, like an "online" presence flag. For anything that accumulates, reach for vector clocks or CRDTs.

## Partitioning: splitting a dataset too big for one machine

Now the second wall. Your data won't fit on one server. So you split it, and each partition becomes a mini-database. Two questions drive everything: **how do you assign a key to a partition**, and **how do you later find which partition holds a key?**

### Range vs hash partitioning

There are two ways to assign keys.

- **Range partitioning** keeps keys in sorted, contiguous ranges (a–f on one node, g–m on the next). Great for range scans like "all events between two dates," because they sit together. The danger: **hot spots**. If you partition by timestamp, every new write lands on the newest partition, so one node melts while the rest sit idle. Used by HBase, Bigtable, and ranged MongoDB.
- **Hash partitioning** runs the key through a hash function and uses the result to pick a partition. This spreads load evenly by design, but range scans now have to ask every partition. Used by Cassandra, DynamoDB, and hashed MongoDB.

The timestamp hot spot is a classic war story. The fix is a **compound key**: prefix the timestamp with something high-variety like a sensor ID. Now writes spread across all sensors, and you can still scan one sensor's data by time. DynamoDB's advice to "use a high-variety partition key and a timestamp sort key" is exactly this trick.

### The `mod N` disaster and consistent hashing

The naive way to hash-partition is `hash(key) mod N`, where N is your node count. It works until you add or remove a node. The moment N changes, the result changes for *almost every key*, so nearly all your data has to move at once. Catastrophic.

**Consistent hashing** fixes this. Picture a circle. You place both your keys and your nodes on the ring. Each key belongs to the first node you hit going clockwise. Now add a node, and only the keys between it and its neighbor move - about 1/N of the data, not all of it. Remove a node, and only its keys shift to the next node.

There's one wrinkle. With only a few real machines, the ring is lumpy: one node randomly owns a giant arc and gets overloaded. The fix is **virtual nodes**. Each physical machine claims many points on the ring (Cassandra uses 256 by default). Load averages out, a dead node's work spreads across *all* survivors instead of dumping on one neighbor, and a more powerful machine can simply claim more points.

### Rebalancing is the dangerous part

Moving data is expensive and happens while you're still serving live traffic. A few approaches:

- **Fixed partition count:** create many more partitions than nodes up front (say 1000 partitions on 10 nodes). Adding a node just reassigns whole partitions, no re-hashing. Elasticsearch and Kafka work this way. The downside is you must guess your maximum scale in advance.
- **Dynamic splitting:** split a partition once it grows past a size threshold. Adapts to data volume automatically, but a fresh cluster starts with one partition and no parallelism until the first split.

A hard-won lesson: **keep a human in the loop for rebalancing.** Fully automatic rebalancing combined with automatic failure detection can create a feedback loop from hell - a node looks slow, so the system moves load off it, which somehow makes things worse, and it cascades. Most production systems let a human approve a rebalance even when failover is automatic.

### Finding the key, and the secondary index trap

Once data is split, something has to know which node holds key K. Three patterns: a **routing proxy** in front (Vitess, MongoDB's mongos), a **smart client** that holds the map itself (Cassandra's driver), or **any node forwards** the request internally (Cassandra, Dynamo). The genuinely hard part is keeping that map current as rebalancing moves data, usually via a coordination service like ZooKeeper or a peer-to-peer gossip protocol.

There's one more sharp edge worth knowing. Your data is partitioned by its *primary* key, but you often want to query by something else, like `WHERE color = 'red'`. If each partition indexes only its own data, a query by color must ask *every* partition and merge the results - a **scatter-gather**.

Here's why that hurts. If a single-partition query is fast 99% of the time, a scatter-gather across 100 partitions has to wait for the slowest of the hundred. The odds that *all 100* are fast is 0.99 to the 100th power, roughly 0.37. So about **63% of those queries hit at least one slow partition.** This is why "just add a secondary index" doesn't scale, and why teams either build global indexes or pre-build query-specific tables.

## Common misconceptions

A few beliefs that quietly cause outages:

- **"Replication means my data is safe."** Async replication has a loss window. If the leader dies before shipping its latest writes, they're gone. Replication helps availability; it does not guarantee zero data loss unless it's synchronous.
- **"A quorum gives me strong consistency."** It gives bounded staleness, not strict ordering. And the moment you use sloppy quorums and hinted handoff to stay available during a partition, even the overlap guarantee quietly turns off.
- **"Sharding makes everything faster."** It makes you scale, but it can make cross-shard queries and cross-shard transactions slower or far more complex. A "transfer money between two accounts" that lands on two shards suddenly needs distributed transaction machinery you didn't have before.
- **"Perfect hashing solves hot spots."** It can't split a *single* hot key. A viral product or a celebrity account lives on one shard no matter how good your hashing is.
- **"Last-write-wins is a safe default."** It silently destroys concurrent writes whenever clocks disagree, which is always.

## How to use this

When you're designing or reviewing a system that crosses one machine, walk this checklist:

1. **Separate the two questions.** Decide your replication strategy (how many copies, who writes) and your partitioning strategy (how you split) independently. Don't let them blur.
2. **Pick sync vs async deliberately.** Synchronous within a local zone for durability, asynchronous across regions for latency. Never put a synchronous replica across a region unless you're prepared for every write to pay the round-trip.
3. **Default to single-leader.** Reach for multi-leader only when you have true offline clients or genuinely active-active regions. The conflict tax is rarely worth it otherwise.
4. **Stick reads to the primary right after a write.** This kills the "I saved it but it's gone" bug class before it ships.
5. **Never partition by a sequential key alone.** Timestamps and auto-increment IDs create hot spots. Prefix with something high-variety and keep the timestamp as a sort key.
6. **Never use plain `hash mod N`.** Use consistent hashing with virtual nodes, or a fixed pool of partitions you reassign.
7. **Shard along your transaction boundary.** Co-locate data that must change together - usually all of one customer's or tenant's data - so your core invariants don't span shards.
8. **Add capacity before you reshard, and throttle rebalancing.** Don't split a shard at 95% CPU during peak; there's no spare capacity to copy data, and the movement competes with your users.

## Case study: how Amazon Dynamo never refused a cart

The cleanest way to see all of this together is Amazon's 2007 Dynamo design, the paper that seeded Cassandra, Riak, and DynamoDB.

By the mid-2000s, Amazon's shopping cart and session services were hammered by tens of millions of requests during peak shopping events, with strict latency targets measured at the 99.9th percentile. The traditional single-leader database kept failing the *availability* bar: a failover or a network split meant writes were rejected, and "you can't add this item to your cart" during the holiday rush is direct lost revenue.

So Amazon flipped the usual priority. Their hard requirement was the opposite of most databases: **the write must always succeed**, even during failures, even if a later read is slightly stale. That single business decision drove every technical choice.

- **Leaderless replication** was the whole point. With no boss, there is no leader to fail over, and so no failover-induced write outage. Any node can coordinate a request, and the cart stays writable as long as *some* nodes are reachable.
- **Consistent hashing with virtual nodes** placed keys and nodes on a ring, so adding hardware during traffic growth pulled only about 1/N of the data, spread across all survivors, with zero downtime.
- **Tunable quorums** (the canonical setup was N=3, W=2, R=2) gave bounded staleness for cart data while keeping writes cheap.
- **Sloppy quorums and hinted handoff** deliberately *broke* the clean overlap guarantee when a partition struck, accepting stale reads so that writes never stopped. Availability over consistency, on purpose.
- **Vector clocks** tracked concurrent writes instead of silently dropping one. When two versions of a cart were truly concurrent, Dynamo handed both to the application, which merged them by taking the union of the items.

That union has a famous wart: a deleted item can resurrect, because a union can't tell "never added" from "added then removed." Amazon accepted it. Re-adding a deleted item to a cart is recoverable; *refusing the write is lost money.* That trade-off - pushing conflict resolution up to the application in exchange for always-on availability - is the entire lesson of Dynamo.

The result: Dynamo met its 99.9th-percentile latency target while staying writable through node failures, disk failures, and network partitions during peak load. The goal of never rejecting a customer's write was achieved.

## Conclusion

The deepest idea here isn't a formula. It's that **your consistency choices should come from your business, not a textbook.** Dynamo chose availability over strict consistency because a rejected cart costs revenue while a slightly stale cart doesn't. A bank moving money would choose the opposite. There is no universally correct setting; there is only the cost of each failure mode in *your* world.

So the next time you reach for a read replica or a new shard, ask what happens at the edges: what does a user see when a copy lags, what moves when a node joins, what breaks when two writes collide.

And there's a thread we kept tugging without fully unspooling: every time a quorum "isn't quite linearizable" or two leaders "have no global order," we brushed up against the deepest question in distributed systems - what does it even mean for separated machines to *agree*? That's the world of consensus, logical clocks, and the CAP theorem, and it's where this story goes next.
