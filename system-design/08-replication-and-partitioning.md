# 08 — Replication & Partitioning (Sharding)

**What you'll learn:** How to keep multiple copies of data correct across machines (replication) and how to split a dataset too big for one machine across many machines (partitioning), plus the failure modes — stale reads, write conflicts, hot shards, rebalancing storms — that turn a clean diagram into a 3 a.m. incident. By the end you should be able to reason about Dynamo-style quorums, Postgres streaming replication, and Cassandra's ring the way an interviewer or an on-call engineer would.

**Prerequisites:** Read `02-data-models-and-storage.md` (how a single node stores data) and `09-cap-pacelc-and-consistency-models.md` (consistency vocabulary — linearizability, causal, eventual). This module assumes you know what a leader, a commit, and a write-ahead log are. Replication conflict semantics lean on `10-distributed-consensus-and-time.md` (vector clocks, Lamport time).

---

## 0. Two orthogonal axes

These are different problems people constantly conflate:

- **Replication** = keep the *same* data on *multiple* nodes. Goals: availability (survive a node death), read throughput (serve reads from many copies), latency (serve from a geographically near copy).
- **Partitioning / sharding** = split *different* data across *multiple* nodes. Goal: scale beyond one machine's disk/RAM/CPU.

Real systems do **both**: partition the keyspace into N shards, then replicate each shard R times.

```
            DATASET (10 TB, 1M writes/s)
                      |
        ┌─────────────┼─────────────┐   PARTITIONING (split)
        ▼             ▼             ▼
     Shard A       Shard B       Shard C
    (keys 0-3)    (keys 4-6)    (keys 7-9)
        |             |             |
   ┌────┼────┐   ┌────┼────┐   ┌────┼────┐    REPLICATION (copy each shard)
   ▼    ▼    ▼   ▼    ▼    ▼   ▼    ▼    ▼
  A1   A2   A3  B1   B2   B3  C1   C2   C3
 (leader)        (leader)       (leader)
```

A failure of A2 loses one replica of shard A (no data loss). A failure of *all* of shard C's replicas loses 1/3 of the dataset. This is why replica placement (rack/AZ awareness) matters: never put all replicas of a shard in one fault domain.

---

# PART 1 — REPLICATION

## 1.1 Single-leader (master–slave / primary–replica)

**Intuition:** One node is the boss. All writes go to the boss; the boss tells everyone else what changed. Like a teacher dictating notes — only the teacher writes the canonical version, students copy.

**Mechanics:** The leader appends every write to a *replication log* and ships it to followers. The log can be:

| Log type | What ships | Pro | Con | Used by |
|---|---|---|---|---|
| Statement-based | The SQL string | Compact | Non-determinism (`NOW()`, `RAND()`, autoincrement) breaks replicas | Old MySQL `statement` mode |
| Write-ahead log (WAL) | Physical disk pages/byte changes | Exact, simple | Coupled to storage engine version → no rolling upgrades | Postgres streaming replication |
| Logical (row-based) | Logical row changes (this row, these new values) | Decoupled from engine, allows version skew + CDC | More bytes | MySQL `row` binlog, Postgres logical replication |

Real: **Postgres** ships WAL records to standbys over a TCP stream (`walsender` → `walreceiver`). **MySQL** ships binlog events. This is the workhorse of 90% of OLTP web apps — including most Laravel deployments (one primary, read replicas behind a connection proxy).

### Sync vs async — the durability/latency knife-edge

The single most consequential replication choice. When does the leader tell the client "committed"?

| Mode | Leader waits for… | Durability on leader failure | Write latency | Availability |
|---|---|---|---|---|
| Fully sync | ALL followers ack | Zero data loss | Worst (bounded by slowest follower; one slow node stalls *all* writes) | Worst (one dead follower blocks writes) |
| Semi-sync | ≥1 follower acks | No loss if leader+that follower don't both die | Medium | Medium |
| Async | nobody — ack on local commit | **Loss window** = unreplicated tail of the log | Best | Best |

**Concrete:** Async cross-region replication has a lag of typically 10–500 ms (network RTT dominated). If your leader in us-east dies, you can lose every write from the last ~lag-window. For an order checkout that's unacceptable; for a "last seen" timestamp it's fine. **Semi-synchronous** (one sync follower in the *same AZ* + async to other regions) is the standard production compromise: sub-millisecond local sync ack, no single-machine data loss, async fan-out for geo. See `09-cap-pacelc-and-consistency-models.md` for why this is a PACELC "else latency" decision.

### Failover — where the bodies are buried

Leader dies → promote a follower. The hard parts:

1. **Detecting death** — timeout-based, so you tune the false-positive/MTTR trade-off. Too short → flapping; too long → downtime.
2. **Choosing the new leader** — pick the most up-to-date follower (smallest replication lag) to minimize loss. Needs consensus (`10-distributed-consensus-and-time.md`) or it splits.
3. **Lost writes** — async writes not yet replicated are *gone*. GitHub's famous 2012 outage: a promoted replica was behind, and when the old leader rejoined, its un-replicated writes were discarded — autoincrement IDs got reused and pointed at the wrong rows.
4. **Split brain** — two nodes both think they're leader and both accept writes. Fence the old leader (STONITH — "shoot the other node in the head") or use a lease/epoch number so the cluster rejects writes from a stale leader.

---

## 1.2 Multi-leader (active–active)

**Intuition:** Multiple bosses, usually one per region. Each accepts writes locally and they sync to each other. Like two editors editing a shared doc offline, then merging.

**When:** Multi-datacenter (write locally, low latency, survive a whole DC outage), offline clients (your phone's calendar is a leader; it syncs later), collaborative editing.

```
   Region US                         Region EU
  ┌──────────┐   async bidirectional ┌──────────┐
  │ Leader-US│◄─────────────────────►│ Leader-EU│
  └────┬─────┘    (conflicts!)        └────┬─────┘
   followers                            followers
```

**The catch: write conflicts.** Two leaders concurrently write the same key with no global order. Now you must resolve. See §1.4. This is why multi-leader is a "use only if you must" topology — the conflict tax is real. Avoid it when single-leader-per-region with home-region routing works.

---

## 1.3 Leaderless (Dynamo-style)

**Intuition:** No boss at all. The client (or a coordinator) writes to *several* nodes and reads from *several* nodes, and uses overlap to stay correct. Like asking 3 of your 5 friends what time the party is and trusting the majority/newest answer.

Real: **Amazon Dynamo** (2007 paper), **Cassandra**, **Riak**, **ScyllaDB**, **Voldemort**.

### Quorums — the core formula

- **N** = replication factor (copies per key)
- **W** = nodes that must ack a write
- **R** = nodes that must respond to a read

**If R + W > N, every read overlaps every write by ≥1 node** → you'll see the latest write *among acked nodes*.

```
N=3, W=2, R=2.  R+W=4 > 3 ✓
Write to nodes {1,2}.  Read from nodes {2,3}.
Overlap = node 2 → read sees the write.
```

Tunable knobs (per request in Cassandra via consistency level):

| Choice | Effect | When |
|---|---|---|
| W=N, R=1 | Fast reads, slow/fragile writes | Read-heavy, rare writes |
| W=1, R=N | Fast writes, slow reads | Write-heavy logging |
| W=R=quorum (⌊N/2⌋+1) | Balanced strong-ish | Default |
| R+W ≤ N | **No overlap guarantee** → may read stale | Max availability, eventual-consistency OK |

**Crucial caveat:** quorum gives you *staleness bounds*, **not linearizability**. Concurrent reads during a write can see different values; writes can be lost on certain failure interleavings; sloppy quorums (below) break the overlap entirely. For real linearizability you need consensus (Raft/Paxos), not quorums — see `09` and `10`.

### Anti-entropy: how stale replicas catch up

A node that was down or missed a write must heal:

- **Read repair** — on a read, if the coordinator sees one replica is stale, it writes the fresh value back. Fixes hot keys passively.
- **Hinted handoff** — if a target node is down at write time, another node holds a "hint" and delivers it when the node returns. (This + cross-DC reads is the "sloppy quorum": the W acks may come from *non-home* nodes, so R+W>N no longer guarantees overlap — availability over consistency.)
- **Merkle trees** — periodic background full-replica comparison. Hash tree over key ranges; compare root hashes, recurse only into differing subtrees → cheap diff of huge datasets. Cassandra `nodetool repair` uses these.

---

## 1.4 Replication lag & its anomalies

Async replication means followers trail the leader. Three classic read anomalies and their fixes:

| Anomaly | Symptom | Guarantee needed | Fix |
|---|---|---|---|
| Read-your-own-writes | User posts a comment, refreshes, it's gone (read hit a lagging replica) | Read-your-writes | Route a user's reads to the leader for N seconds after their write; or track the user's last-write log position and only read replicas caught up past it |
| Monotonic reads | Time appears to go backwards — refresh shows newer data, refresh again shows older (two replicas at different lag) | Monotonic reads | Pin each user to one replica (e.g. hash userID → replica) |
| Consistent prefix reads | You see an answer before its question (cross-partition causal violation) | Consistent prefix | Keep causally-related writes in one partition, or track causal deps |

**Concrete bug class for this codebase:** Laravel apps reading from a read replica after a write are a textbook read-your-writes trap. If a store owner edits a product price and the next request reads a lagging replica, they'll see the *old* price and think "Saved" was a lie — exactly the silent-lie / fake-success bug class this project obsesses over. The fix is "sticky to primary after write." (We currently run single-DB, so this is latent, not live — but it's the first thing that breaks when read replicas get added.)

### Conflict resolution strategies (multi-leader & leaderless)

| Strategy | How it picks a winner | Loses data? | Notes / real systems |
|---|---|---|---|
| Last-Write-Wins (LWW) | Highest timestamp | **Yes** — silently discards concurrent writes; clock skew picks arbitrary winner | Cassandra default. Simple, dangerous. Two writes in the same millisecond → coin flip. |
| Vector clocks / version vectors | Detect *concurrent* vs *causal*; surface conflicts (siblings) to the app | No (defers to app) | Riak returns siblings; DynamoDB used vector clocks in the paper |
| CRDTs (Conflict-free Replicated Data Types) | Math guarantees merge converges (G-Counter, OR-Set, sequence CRDTs) | No (semantic merge) | Riak data types, Redis CRDT (Enterprise), Automerge/Yjs for collab editing |
| Application merge function | App-specific (e.g. union of shopping carts) | No | Dynamo's shopping cart: union carts, "deleted" item resurrects — known wart |

**Why LWW is a trap:** it relies on synchronized clocks. NTP skew is commonly 10–100 ms across machines; a "later" wall-clock timestamp can belong to an *earlier* write. Use logical clocks (Lamport/vector) when correctness matters — see `10-distributed-consensus-and-time.md`. CRDTs are the modern answer for mergeable state; LWW is fine only for truly last-value-only fields where loss is acceptable (e.g. a presence "online" flag).

---

# PART 2 — PARTITIONING (SHARDING)

Goal: no single node holds the whole dataset. Each partition is a mini-database. The two questions: **how do I assign keys to partitions** and **how do I find the partition for a key**.

## 2.1 Range partitioning vs hash partitioning

| | Range partitioning | Hash partitioning |
|---|---|---|
| Key→partition | Sorted contiguous ranges (a–f, g–m, …) | `hash(key) mod buckets` |
| Range scans | **Efficient** (`WHERE ts BETWEEN`) — contiguous | Scatter-gather across all partitions |
| Hot spots | **Severe** for sequential keys (timestamps, autoincrement) — all writes hit the last partition | Spread evenly by design |
| Rebalancing | Split/merge ranges dynamically | Harder (mod N moves everything) |
| Real systems | HBase, Bigtable, MongoDB (ranged), Spanner | Cassandra, DynamoDB, MongoDB (hashed) |

**The timestamp hot-spot war story:** partition by `created_at` and 100% of your write traffic lands on the newest partition (today's range). Old partitions are read-only and idle; one node melts. Fix: **compound key** — prefix with something high-cardinality (`sensorID` then `timestamp`). Now writes spread across sensors, and you can still range-scan within one sensor. DynamoDB's "use a high-cardinality partition key, timestamp as sort key" guidance is exactly this.

## 2.2 The `hash mod N` disaster → consistent hashing

Naive `hash(key) mod N`: add or remove one node (N→N+1) and **almost every key's mod result changes** → ~all data must move. Catastrophic.

**Consistent hashing:** map both keys *and* nodes onto a ring (hash space 0…2³²). A key belongs to the first node clockwise. Add a node → only the keys between it and its predecessor move (~1/N of data). Remove a node → its keys go to the next node only.

```
        0 ───────── Node A
       /                \
   key K (→A)            \
      |                   Node B
   Node D                /
       \                /
        ──── Node C ───
  Add Node E between D and A: only keys in (D, E] move from A to E.
```

**Problem:** with few real nodes, the ring is lumpy — one node randomly owns a huge arc → imbalance. **Solution: virtual nodes (vnodes).** Each physical node claims many (e.g. 256) points on the ring. Now load averages out, and a dead node's load spreads across *all* survivors (not just its one neighbor), and a powerful node can own *more* vnodes (heterogeneous hardware). Cassandra uses 256 vnodes/node by default; Dynamo used vnodes ("tokens"); Riak too.

> Note: Dynamo's actual scheme is "consistent hashing + vnodes," but many modern systems (DynamoDB managed, MongoDB) use **fixed hash buckets / chunks** that are reassigned, decoupling partition count from node count — same goal (cheap rebalance), different mechanism.

| Scheme | Add-node data movement | Balance | Used by |
|---|---|---|---|
| hash mod N | ~100% (catastrophic) | Perfect (when static) | naïve only |
| Consistent hashing (no vnodes) | ~1/N | Poor (lumpy) | early Dynamo |
| Consistent hashing + vnodes | ~1/N, spread over all nodes | Good | Cassandra, Riak |
| Fixed # of partitions, reassign | move whole partitions | Good, predictable | Elasticsearch, Kafka, Couchbase |
| Dynamic split/merge | move on threshold | Good, adaptive | HBase, MongoDB, Bigtable |

## 2.3 Rebalancing — the dangerous part

Moving data is expensive and concurrent with serving traffic.

- **Fixed partition count (e.g. 1000 partitions for a 10-node cluster):** create *more* partitions than nodes up front; moving a node just reassigns whole partitions. Simple, no re-hashing. Elasticsearch/Kafka do this. Downside: you must guess the max scale (partitions are roughly immutable). Too many tiny partitions = overhead; too few = can't scale out.
- **Dynamic (split when partition exceeds size threshold, ~10 GB in HBase):** adapts to data volume; only the split partition moves. Risk: a cold cluster starts with one partition → no parallelism until first split (HBase "pre-splitting" mitigates).
- **Automatic vs manual:** fully automatic rebalancing + automatic failure detection is a feedback loop from hell — a node looks slow → rebalance away from it → more load on it → looks slower → cascade. Most prod systems keep a **human in the loop** for rebalancing (propose, operator approves) even if failover is automatic.

## 2.4 Request routing — "which node has key K?"

Three architectures:

```
(a) Routing tier / proxy      (b) Smart client            (c) Any-node + forward
  client → router → node        client(map) → node          client → node → (forward)
   (Vitess, mongos,             (Cassandra driver           (Cassandra coordinator;
    Twemproxy)                   token-aware)                 Dynamo any-node)
```

| Approach | Where routing logic lives | Pro | Con | Real |
|---|---|---|---|---|
| Routing tier | Dedicated proxy | Dumb clients; central control | Extra hop + a thing to scale/operate | Vitess (`vtgate`), Mongo `mongos`, Twemproxy |
| Partition-aware client | Driver holds the map | One fewer hop | Every client must learn topology | Cassandra token-aware driver, Kafka client |
| Any node forwards | Cluster itself | Simplest client | Internal redirect hop | Cassandra coordinator, Dynamo |

The hard part is **keeping the map current as rebalancing happens.** Solution: a coordination service holds the authoritative routing table — **ZooKeeper** (HBase, Kafka pre-KRaft, older Vitess), **etcd**, or a **gossip protocol** where nodes spread topology peer-to-peer (Cassandra, Dynamo). Gossip = no central dependency but eventually-consistent topology view; ZooKeeper = strongly-consistent map but an extra critical dependency. See `10` for gossip vs consensus.

## 2.5 Secondary indexes across partitions

The data is partitioned by *primary* key. But you query by something else (`WHERE color='red'`). Where does the index live?

| | Local (document-partitioned) index | Global (term-partitioned) index |
|---|---|---|
| Index lives | On each partition, covering only its own docs | Partitioned independently, by the *indexed term* |
| Write | Cheap — one partition | Expensive — index entry may be on a *different* partition (distributed write, often async) |
| Read by secondary key | **Scatter-gather** — query ALL partitions, merge (tail-latency killer) | Read one partition (the one owning that term) |
| Real | Cassandra secondary index, Elasticsearch (per-shard), MongoDB | DynamoDB Global Secondary Index, Riak search |

**Scatter-gather tail-latency math:** if a single-partition query is p99=10 ms, a scatter-gather across 100 partitions must wait for the *slowest* of 100 → its latency is governed by the p99.99 of a single node. With independent partitions, P(all 100 fast) = 0.99¹⁰⁰ ≈ 0.366 — so **~63% of scatter-gather queries hit at least one slow partition.** This is why "just add a secondary index" doesn't scale, and why global indexes (or denormalized query-specific tables, the Cassandra way) exist. DynamoDB's GSI is async, so reads can be *stale* relative to the base table — a real correctness footgun.

---

## 3. Common pitfalls / war stories

1. **LWW silent data loss.** Two clients write the same Cassandra row "simultaneously" (within clock skew); one write vanishes with no error. Engineers debug for days because nothing logged an error. Fix: don't use LWW for non-idempotent accumulating data; use counters/CRDTs or single-leader for that field.
2. **Reading from a replica right after writing.** The classic read-your-writes failure (§1.4). Manifests as "I saved it but it's not there." Pin to primary post-write.
3. **The celebrity / hot-key problem.** One key (Taylor Swift's user row, a viral product) gets 10⁶× the traffic. Even perfect hashing can't split a *single* key. Fix: app-level key splitting (`celebrityID#0..#99` random suffix on write, fan-in on read), per-key caching, or a dedicated replica for that key. DynamoDB added "adaptive capacity" partly for this.
4. **Cross-partition transactions you didn't know you had.** A "transfer money between two accounts" that land on different shards now needs 2-phase commit or a saga (`11-distributed-transactions...md`). People shard, then discover their core invariant spans shards. *Shard along the transaction boundary* (e.g. by tenant/customer so all their data co-locates).
5. **Rebalancing during peak.** Auto-rebalance kicks in under load and the data-movement traffic competes with user traffic → cascading slowdown. Throttle rebalance bandwidth; schedule manual ones off-peak.
6. **Cross-AZ sync replication tax.** Someone sets `synchronous_commit=on` with a standby in another region → every write now pays a 60–80 ms cross-region RTT and write throughput collapses. Sync within an AZ, async across.
7. **Resharding without enough headroom.** Splitting a 10 TB shard while it's at 95% CPU. There's no spare capacity to copy data. Add capacity *before* you need to reshard.

---

## 🧩 Case Study: Amazon Dynamo (the 2007 paper)

**The problem.** By the mid-2000s Amazon's e-commerce platform ran on thousands of nodes across multiple datacenters, and its core services (the shopping cart, session state, the seller catalog, "best-seller" lists) were being hammered by **tens of millions of requests at peak shopping events** with strict SLAs stated at the **99.9th percentile, around a few hundred milliseconds**. The classic relational/single-leader stack kept failing the *availability* bar: a leader failover or a network partition meant writes were rejected, and "you can't add this item to your cart" during the holiday rush is direct lost revenue. Amazon's hard requirement was the opposite of most databases: **the write must always succeed**, even during failures, even at the cost of returning a slightly stale read. That requirement is what produced Dynamo.

**Leaderless replication (§1.3) was the whole point.** Dynamo has no boss — exactly the topology from the leaderless section. There is no leader to fail over, so there is no failover-induced write outage. A client request hits any node, which acts as a **coordinator** (the "any-node + forward" routing from §2.4, gossip-backed topology, no ZooKeeper dependency). The coordinator writes to N replicas and the cart stays writable as long as *some* nodes are reachable.

**Consistent hashing with virtual nodes (§2.2).** Keys and nodes are placed on a ring; a key's N replicas are the N distinct physical nodes walking clockwise from its hash. Dynamo uses **vnodes ("tokens")** so that adding a node pulls ~1/N of the data spread across *all* survivors rather than dumping it on one neighbor, and so beefier hardware can own more tokens. This is precisely the "consistent hashing + vnodes" row of the §2.2 table — and Amazon's motivation (cheap, incremental, no-downtime capacity changes during traffic growth) is the exact reason the section says vnodes beat a plain ring.

**R + W > N quorums (§1.3), but tunable.** Dynamo exposes N, R, W per service. The canonical config was **N=3, W=2, R=2** — `R+W=4 > 3`, the overlap formula from the quorum section, giving bounded staleness for cart-class data. Write-heavy or "always-writable" services lowered W; read-mostly services raised R. Crucially Dynamo also uses **sloppy quorums + hinted handoff** (§1.4 anti-entropy): if a home replica is down, the W acks may come from the *next available* nodes, which hold a "hint" and forward it later. This deliberately **breaks the R+W>N overlap guarantee** to keep writing during a partition — the textbook "availability over consistency" sloppy-quorum trade the module warns about.

```
        Cart PUT (key = cartID)
                 │
        coordinator (any node, gossip map)
                 │  N=3, W=2
     ┌───────────┼───────────┐
     ▼           ▼           ▼
   Node-A      Node-B      Node-C        ← N replicas (next 3 vnodes clockwise on ring)
  (ack ✔)     (ack ✔)     (down ✘)
     │           │           │
     │           │     hinted handoff →  Node-D holds hint, delivers to C later
     └─ W=2 acks reached → client gets "success" (C heals via hint / Merkle repair)
```

**Conflict resolution with vector clocks (§1.4).** Because anyone can write anywhere with no global order, concurrent writes to the same cart happen. LWW would silently drop one (and clock skew makes "latest" a lie — see the §1.4 LWW trap). Dynamo instead attaches a **vector clock** `[(node, counter), ...]` to every version. On read, the coordinator compares clocks: if one descends from the other it's stale and discarded; if they're **concurrent** it returns *both versions as siblings* to the application. The shopping cart's app-level **merge is a union** of the carts — which is exactly the "application merge function" row of the §1.4 table, including its famous wart: a deleted item can resurrect because a union can't tell "never added" from "added then removed."

**Anti-entropy to heal stale replicas (§1.4).** Down or lagging nodes catch up via the same three mechanisms the module lists: **read repair** (coordinator pushes the freshest version back on a read), **hinted handoff** (above), and **Merkle trees** for periodic background range-by-range reconciliation between replicas without shipping whole datasets.

**The key trade-off they accepted.** Dynamo traded **strong consistency for always-on availability and low tail latency**. It is explicitly *not* linearizable — exactly the §1.3 caveat that "quorum gives staleness bounds, not linearizability." Amazon accepted **stale reads, sibling versions the app must merge, and resurrected cart items** because, for a cart, showing a slightly old cart or re-adding a deleted item is recoverable, whereas *refusing the write is lost money*. They pushed conflict resolution up to the application instead of solving it in the datastore.

**Results.** Dynamo met its **99.9th-percentile latency SLA (single-digit-to-low-hundreds of milliseconds)** while staying writable through node failures, disk failures, and network partitions during peak holiday load — the "never reject a customer write" goal was achieved. The design directly seeded **Cassandra, Riak, Voldemort, and ScyllaDB**, and later the managed **Amazon DynamoDB** (which swapped vector-clock siblings for simpler server-side resolution and moved to fixed partitions, per the §2.2 note).

### Lessons

- **Pick your CAP corner from the business, not the textbook.** Dynamo chose A over C because a rejected cart write costs revenue; a stale cart doesn't. Let the cost of *each* failure mode drive R/W/N and the conflict strategy — there's no universally "correct" consistency level.
- **R+W>N is a knob, and sloppy quorums quietly turn it off.** The clean overlap math holds only without hinted handoff; the moment you favor availability during partitions, you've accepted reading stale data. Know which mode you're actually in.
- **If you can't avoid conflicts, surface them — don't let LWW eat data.** Vector clocks + app-level merge keep concurrent writes; last-write-wins silently destroys them under clock skew. Choose siblings/CRDTs when the data accumulates.
- **Vnodes are what make leaderless clusters operable.** Spreading each node over many ring tokens is the difference between a rebalance that melts one neighbor and one that smoothly drains across the whole cluster.

## 4. Test yourself

1. You run N=5. What R and W give the strongest staleness guarantee while still tolerating one node being down for *both* reads and writes? *(Hint: need R≤4 and W≤4 to tolerate 1 down, and R+W>5. Try W=3,R=3.)*
2. Why does `hash(key) mod N` force a near-total reshuffle when N changes, but consistent hashing only moves ~1/N? *(Hint: mod changes the bucket for almost every key; the ring only reassigns keys between adjacent points.)*
3. A user reports "I posted, refreshed, my post vanished, refreshed again, it's back." Which two replication guarantees are being violated and what's the fix? *(Hint: read-your-writes + monotonic reads; pin user reads to one sufficiently-caught-up replica/primary.)*
4. Why does R+W>N **not** give you linearizability? *(Hint: concurrent writes have no total order; sloppy quorums + read repair timing; failure interleavings can lose writes. Quorum bounds staleness, doesn't serialize.)*
5. You partition events by `created_at`. Writes are crushing one node. Diagnose and redesign the key. *(Hint: sequential hot spot; compound key high-cardinality-prefix + timestamp sort key.)*
6. When is multi-leader replication worth its conflict cost, and when is single-leader-per-region with home routing strictly better? *(Hint: offline clients / true active-active multi-write regions vs. users that mostly write in one region.)*
7. Why is a global secondary index a distributed write but a local one isn't — and what does that cost you on reads? *(Hint: global index entry lives on the term's partition, not the doc's; local index reads scatter-gather all partitions.)*
8. Estimate the fraction of 50-way scatter-gather queries that hit a slow partition if each partition is slow 0.5% of the time. *(Hint: 1 − 0.995⁵⁰ ≈ 22%.)*

---

## 5. Further reading

- **DDIA** (Kleppmann), Chapter 5 (Replication) and Chapter 6 (Partitioning) — the canonical treatment; this module is a compressed, war-storied version of those two chapters.
- **Dynamo: Amazon's Highly Available Key-value Store** (DeCandia et al., SOSP 2007) — consistent hashing + vnodes, vector clocks, hinted handoff, read repair, sloppy quorums.
- **Cassandra** docs — tunable consistency levels, `nodetool repair`, vnodes, gossip.
- **PostgreSQL** docs — "High Availability, Load Balancing, and Replication" (streaming + logical replication, `synchronous_commit`).
- **Bigtable** (Chang et al., OSDI 2006) and **Spanner** (Corbett et al., OSDI 2012) — range partitioning, tablet splits, and (Spanner) TrueTime-backed strong consistency; pairs with `09`/`10`.
- Kleppmann, *"A Critique of the CAP Theorem"* and his CRDT papers (Automerge) for conflict-free merge depth.
- Werner Vogels, *"Eventually Consistent"* (CACM 2009) — the philosophy behind leaderless/quorum design.

*Next: `09-cap-pacelc-and-consistency-models.md` formalizes the consistency guarantees this module kept invoking; `10-distributed-consensus-and-time.md` covers Raft/Paxos and the logical clocks behind safe conflict resolution; `11-distributed-transactions-and-sagas.md` handles the cross-partition writes §3 warned about.*
