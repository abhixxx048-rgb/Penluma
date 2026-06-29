# 09 — CAP, PACELC & Consistency Models

**What you'll learn:** How to reason precisely about what a distributed datastore guarantees, why "strong vs eventual" is a beginner's framing, and how to read a database's marketing page and know exactly what it will do to your data during a network partition or a slow replica. You'll leave able to place any system (Spanner, Dynamo, Cosmos DB, Postgres-with-replicas) on a precise consistency spectrum and defend the choice in an interview or a postmortem.

**Prerequisites:** Read `08-replication-and-partitioning.md` first (leader/follower, quorums, replication lag are assumed). Helpful: `07-distributed-time-and-ordering.md` (logical clocks, happens-before) and `10-distributed-transactions-and-consensus.md` (Raft/Paxos, 2PC) as a follow-on.

---

## 1. Intuition first: the cost of agreeing across a gap

Imagine two ticket-counter clerks for the same concert, one in London, one in Tokyo, connected by a phone line. There are 100 seats. To *never* oversell, every sale must be confirmed by both clerks before it's final — that's **consistency**, and it costs a round-trip every time. Now the phone line drops (a **partition**). Each clerk faces a choice:

- **Keep selling** (stay **available**) — but now they might both sell seat 42. They've chosen availability over consistency.
- **Stop selling** until the line is back (stay **consistent**) — customers walk away angry. They've chosen consistency over availability.

There is no third option that both stays open *and* never oversells while the line is down. That impossibility is the entire content of the CAP theorem. Everything else is precision about what "consistent," "available," and "partition" actually mean — and that precision is where every real engineering mistake hides.

---

## 2. CAP stated precisely (and what it does NOT say)

Brewer conjectured it (2000); Gilbert & Lynch proved it (2002). The precise statement:

> In an asynchronous network, a system cannot simultaneously guarantee all three of:
> - **C (Consistency)** = **linearizability** — every read sees the most recent completed write, as if there were a single copy of the data updated atomically.
> - **A (Availability)** = *every* request to a *non-failing* node returns a non-error response, eventually.
> - **P (Partition tolerance)** = the system keeps working when the network drops or delays messages between nodes arbitrarily.

The proof is a one-paragraph argument: partition the network into `{N1}` and `{N2}`. Client writes `x=1` to `N1`. Another client reads `x` from `N2`. `N2` cannot have heard the write (the partition blocks it). It must either return stale `x=0` (not linearizable → **not C**) or block/error (**not A**). QED.

### The misinterpretations that get people fired

| Myth | Reality |
|---|---|
| "Pick 2 of 3." | **Wrong framing.** P is not optional — networks *will* partition. You don't choose P; the network imposes it. The real choice is **C vs A, but only during a partition.** When there's no partition, you get both. |
| "CAP's C = ACID's C." | No. CAP-C is **linearizability** (a recency/ordering property on single objects). ACID-C is "transactions preserve invariants" (a *you-write-the-constraints* property). They are unrelated. See §6. |
| "My system is CP, so it's always strongly consistent." | CP only promises linearizability *when reachable*. A CP system can still serve stale reads from a follower if you read the wrong node, or if it's misconfigured. |
| "CAP applies all the time." | CAP only describes behavior **during a partition.** It says nothing about the 99.9% of the time the network is healthy — which is where latency, not partitions, dominates your design. That gap is why PACELC exists. |
| "Availability means low latency / high uptime." | CAP-A is binary and theoretical: *every* non-failing node *always* answers. A system that answers in 30 seconds is "available" to CAP and useless to you. |

The headline: **CAP is a statement about one narrow failure mode (the partition) and one narrow consistency level (linearizability).** It is necessary but far too coarse to design with.

---

## 3. PACELC — the framework you should actually use

Daniel Abadi's 2012 refinement fixes CAP's biggest blind spot: latency. Read it as a sentence:

```
        if (Partition)            else (normal operation)
        ┌─────────────┐          ┌──────────────┐
P  →    │  A   vs  C   │   E  →   │  L    vs  C   │
        │ available    │         │ low-latency   │
        │  -or-        │         │  -or-         │
        │ consistent   │         │ consistent    │
        └─────────────┘          └──────────────┘
```

**If Partition, choose A or C; Else, choose L (latency) or C (consistency).** The `ELC` half is the insight: even with a perfectly healthy network, **linearizability costs latency** — to be linearizable you must coordinate (a quorum round-trip, a leader hop, a clock-wait), and coordination has a price every single request, partition or not. Most of your latency budget is spent in the `ELC` world, not the `PAC` world.

### Classifying real systems with PACELC

| System | PAC (partition) | ELC (normal) | One-line rationale |
|---|---|---|---|
| **DynamoDB / Cassandra** (default) | **PA** | **EL** | Stays up under partition; tunable but defaults favor latency. AP/EL. |
| **Google Spanner** | **PC** | **EC** | Refuses to violate external consistency even under partition; pays commit-wait latency normally. PC/EC. |
| **MongoDB** (default majority) | **PC** | **EC** | Leader-based, majority writes; blocks rather than split-brain. |
| **Cosmos DB** | **tunable** | **tunable** | Five consistency levels you pick per request (§7). |
| **Postgres single-node** | n/a (one node) | **EC** | No partition between replicas of the primary; CAP doesn't apply to a single node. |
| **PNUTS (Yahoo)** | **PC** | **EL** | Abadi's classic example of the "weird" PC/EL corner — consistent under partition but latency-optimized normally. |

PACELC gives you **four meaningful buckets** (PA/EL, PA/EC, PC/EL, PC/EC) instead of CAP's two. PA/EL (Dynamo) and PC/EC (Spanner) are the two ends most people know; the cross corners (PC/EL, PA/EC) are where interesting designs live.

---

## 4. The consistency spectrum: "strong vs eventual" is too coarse

"Eventual consistency" only promises that *if writes stop, replicas eventually converge.* It says nothing about what you see *in the meantime* — and the meantime is your whole production lifetime. Between linearizable and eventual lies a lattice of useful guarantees. From strongest to weakest:

```
 STRONGEST  Linearizability  ── single-object, real-time order ("most recent write")
            Sequential       ── one global order, but not tied to real time
            Causal           ── if A happened-before B, everyone sees A before B
   ┌── Session guarantees (client-centric) ──┐
   │   Read-your-writes   Monotonic reads     │
   │   Monotonic writes   Writes-follow-reads │
   └──────────────────────────────────────────┘
 WEAKEST    Eventual         ── converges someday; no ordering promise meanwhile
```

| Model | Plain guarantee | What it forbids | Cost | Real example |
|---|---|---|---|---|
| **Linearizability** | Every read returns the latest completed write; operations appear instantaneous in real-time order. | Stale reads, observing operations out of real-time order. | Coordination per op (quorum/leader/clock-wait). Highest latency; unavailable under partition (CP). | etcd, ZooKeeper, Spanner, single-key Dynamo with `ConsistentRead` |
| **Sequential** (Lamport '79) | All clients agree on *one* order of all ops, consistent with each client's program order — but that order needn't match wall-clock time. | Different clients seeing different orders. | Cheaper than linearizable (no real-time tie). | Rarely sold directly; theoretical baseline |
| **Causal** | Causally-related ops (A→B via happens-before) are seen in that order everywhere; concurrent ops may be seen in any order. | Seeing an effect before its cause (e.g., a reply before the message). | No coordination on writes; track dependencies (vector clocks). **Highest consistency still available under partition** (Mahajan et al.). | COPS, MongoDB causal sessions, Cosmos "Consistent Prefix"+session |
| **Read-your-writes** | You always see your own prior writes. | "I saved my profile, refreshed, it's gone." | Sticky routing or version token. | Cosmos "Session" |
| **Monotonic reads** | Time never goes backward for a reader: once you've seen v5, you won't later see v3. | Refresh showing an *older* value. | Pin reads to one replica or carry a version. | Session-level guarantee in most stores |
| **Monotonic writes** | Your writes are applied in the order you issued them. | Reorder of your own updates. | Per-client write serialization. | — |
| **Writes-follow-reads** | A write you make after reading v5 lands *after* v5 everywhere. | Replying to a comment that "predates" the comment. | Causal metadata. | — |
| **Eventual** | Replicas converge if writes stop. Nothing about now. | Nothing meaningful in the interim. | Cheapest; always available. | Dynamo default, DNS, Cassandra ONE |

The four session/client-centric guarantees (Terry et al., Bayou, 1994) are the **practical sweet spot**: they're cheap (often implemented with sticky sessions or a version cookie) and they kill the bugs users actually notice ("where did my edit go?"). Causal consistency is the theoretical sweet spot: it's the *strongest* model that an **always-available** (AP) system can provide — you cannot do better than causal without sacrificing availability under partition.

---

## 5. Quorum consistency: the math

Replicate each key to **N** nodes. A write must be acknowledged by **W** nodes; a read must query **R** nodes and take the freshest (highest version/timestamp).

```
              N = 3 replicas
   ┌────┐   ┌────┐   ┌────┐
   │ R1 │   │ R2 │   │ R3 │
   └────┘   └────┘   └────┘
 Write W=2: ✔ R1, ✔ R2     (R3 lags)
 Read  R=2: query any 2 → at least one overlaps the write set
```

**The strong-consistency condition is `W + R > N`.** This forces the read set and write set to **overlap by at least one node**, so any read is guaranteed to touch a replica that saw the latest acknowledged write.

- `N=3, W=2, R=2` → `4 > 3` ✓. Tolerate 1 node down for both reads and writes. The classic balanced choice.
- `N=3, W=3, R=1` → fast reads, but a single down node blocks **all** writes.
- `N=3, W=1, R=1` → `2 > 3` ✗. Fast and highly available, but **eventually consistent** — reads may miss the latest write. This is Dynamo/Cassandra's default-ish "fast" mode.
- `W = N/2 + 1` for both reads and writes = **majority quorum**, the basis for tolerating `f` failures with `2f+1` nodes (see Raft/Paxos in `10-distributed-transactions-and-consensus.md`).

**Why quorum overlap is *not* full linearizability.** Even with `W+R>N`, Dynamo-style sloppy quorums have failure modes:

- **Read overlap ≠ atomic visibility.** Two concurrent reads during an in-flight write can return *different* values (one hits the new replica, one doesn't) — non-monotonic. Overlap guarantees you *can* see the latest, not that everyone sees the *same* thing simultaneously.
- **Sloppy quorum + hinted handoff.** Under partition, Dynamo writes to *any* N reachable nodes (not the "home" nodes), so W and R sets may not overlap at all — availability over consistency, by design.
- **Last-write-wins clobbering.** With wall-clock LWW conflict resolution, a write with a skewed-backward clock silently erases a newer write. Use version vectors instead (see `07-distributed-time-and-ordering.md`).

Back-of-envelope: with `N=3` across 3 AZs in one region, a `W=2`/`R=2` majority write costs **~1–2 ms** intra-region. Stretch that quorum across two continents (e.g., us-east ↔ eu-west, ~80 ms RTT) and *every* strongly-consistent write now costs **~80 ms minimum** — the `ELC` tax made concrete. This is why cross-region strong consistency is so painful and why systems either pin a leader per region or relax to causal/eventual.

---

## 6. Isolation vs consistency: ACID-I is NOT CAP-C

This conflation derails interviews constantly. They're orthogonal axes:

| Axis | Question it answers | Spectrum | Failure it prevents |
|---|---|---|---|
| **Consistency (CAP)** | "Across *replicas* of one object, how fresh/ordered is what I read?" | linearizable → causal → eventual | Reading stale data from a lagging replica |
| **Isolation (ACID)** | "Across *concurrent transactions* on multiple objects, how much can they interfere?" | serializable → snapshot → read-committed → read-uncommitted | Lost updates, dirty reads, write skew |

A system can be **serializable but not linearizable** (e.g., serializable snapshot isolation on a single node with async replicas — perfect isolation, stale reads on a follower). It can be **linearizable but not serializable** (a single register with compare-and-swap — perfectly fresh, but no multi-object transaction semantics).

The gold standard that combines both is **strict serializability** = serializable **+** linearizable: transactions are equivalent to *some* serial order, *and* that order respects real-time. **Spanner** delivers exactly this and calls it **external consistency** (§8). When someone says "strongly consistent," ask: *do you mean linearizable (single-object recency) or strict-serializable (multi-object transactions in real-time order)?* The answer changes the architecture.

---

## 7. Cosmos DB: tunable consistency as a product

Azure Cosmos DB is the clearest teaching artifact because it exposes **five named levels** as a per-request knob, and Microsoft publishes (TLA+-verified) definitions:

```
Strong ─→ Bounded Staleness ─→ Session ─→ Consistent Prefix ─→ Eventual
(linearizable)  (lag-bounded)  (per-client)  (no gaps)        (converge)
  highest latency / lowest availability ──────→ lowest latency / highest availability
```

| Level | Guarantee | Use when |
|---|---|---|
| **Strong** | Linearizable. Reads see the latest committed write. Confined to a single region or synchronous-replica config. | Financial balances, inventory counters where overselling is unacceptable. |
| **Bounded staleness** | Reads lag the latest write by at most **K versions or T seconds** — quantified staleness. | "Near-real-time is fine, but never more than 5 s / 100 ops behind." Leaderboards, dashboards. |
| **Session** (default) | Read-your-writes + monotonic reads + consistent prefix, **scoped to a session token.** | The 90% case: a logged-in user must see their own edits. Cheap and globally available. |
| **Consistent prefix** | You never see writes out of order (no gaps), but may see an older snapshot. | Activity feeds where order matters more than recency. |
| **Eventual** | Converges; no order guarantee. Lowest latency, highest availability. | Like counts, view counters, where staleness is harmless. |

The lesson: consistency is **per-operation, not per-database.** Mature systems let you pay for strength only where it matters and bank the latency/availability everywhere else.

---

## 8. Spanner & TrueTime: buying linearizability with a clock

Spanner is the canonical PC/EC, strict-serializable, globally-distributed SQL database — the one that "shouldn't exist" by naive CAP reasoning. Its trick is **TrueTime**: instead of a single timestamp, the clock API returns an **interval** `[earliest, latest]` with a bounded uncertainty `ε` (kept to **~1–7 ms** via GPS + atomic clocks in every datacenter).

To commit a transaction at timestamp `t`, Spanner does **commit-wait**: it picks `t = TT.now().latest`, then *waits out the uncertainty* — it blocks until `TT.now().earliest > t`, i.e. for roughly `2ε ≈ 1–14 ms` — guaranteeing that when the commit is acknowledged, `t` is unambiguously in the past everywhere on Earth. That's how it gets **external consistency** (global real-time order) without a global clock.

```
T1.commit picks t=100, ε=5ms
   |── commit-wait until earliest > 100 (≈2ε) ──|
   ▼                                            ▼ ack
   t=95.....t=100.....t=105 (now certainly past)
Any later T2 anywhere gets t' > 100. Real-time order preserved.
```

The trade-offs Spanner accepts: every read-write transaction pays the `~2ε` commit-wait (the `ELC` tax, in latency form), and it needs **specialized clock hardware**. CockroachDB and YugabyteDB reproduce the design *without* GPS/atomic clocks by using a looser `~250–500 ms` max-clock-offset bound (HLCs + NTP), then handling uncertainty with read restarts instead of commit-wait — cheaper hardware, occasionally retried reads. Under partition, Spanner stays **CP**: a minority partition simply can't commit (Paxos needs a majority), so it sacrifices availability, never consistency.

---

## 9. Dynamo: the other pole

Amazon's Dynamo (2007 paper — the design DNA of DynamoDB *and* Cassandra/Riak/Voldemort) is the PA/EL archetype: **always writeable**, even during partitions, because shopping-cart adds must never fail. It achieves this with consistent hashing, sloppy quorums + hinted handoff, anti-entropy via Merkle trees, and **conflict resolution pushed to the application** via version vectors (the famous "two divergent carts get merged" example). Dynamo's lesson is the inverse of Spanner's: if your business value is *taking the write*, you accept divergence and design a merge function. (DynamoDB the AWS product later added opt-in strongly-consistent reads and transactions, moving it toward *tunable*.)

---

## 10. Common pitfalls / war stories

- **"We're CP so we never lose data."** CP sacrifices *availability*, not durability — and only guarantees linearizability *if you read through the leader/quorum.* Teams read from a follower for performance and silently reintroduce stale reads. Reading from a replica is an eventual-consistency decision *no matter what the database is labeled.*
- **The read-your-writes refresh bug.** User updates their profile, the write goes to the leader, the immediate read load-balances to a lagging follower, the UI shows the *old* value, the user re-submits → duplicate/confusion. Fix: route the user to the leader (or to the same replica) for a few seconds post-write, or pass a version token. This is *exactly* what session consistency exists to prevent.
- **Last-write-wins data loss.** LWW on physical clocks means a node with a clock 2 s in the future wins every conflict, and a backward-skewed node's newer writes vanish — silently. Cassandra users have lost data to NTP glitches this way. Prefer version vectors or app-level merges.
- **Cross-region synchronous quorum = latency outage.** Stretching a majority quorum across continents makes every write pay the inter-region RTT; under load this looks like an outage even though nothing is "down." Keep the consistency boundary inside one region; replicate across regions asynchronously.
- **Confusing ACID isolation with replica consistency** (§6): "We use serializable transactions, so reads are always fresh" — false if reads hit async replicas. Two different guarantees.
- **Believing the marketing word "consistent."** Always translate to a precise model: *linearizable? causal? bounded-stale by how much? session-scoped?* If the vendor can't say, assume eventual.
- **Choosing strong consistency by default "to be safe."** It's the most expensive default — latency on every op and unavailability under partition. Most reads (likes, feeds, counts) are happy with session or eventual; reserve linearizability for the few invariants that truly need it (balances, inventory, locks, leader election).

---

## 🧩 Case Study: Google Spanner vs Amazon DynamoDB — the same trade-off, opposite answers

By 2011 Google's ad business (AdWords) had outgrown a sharded MySQL deployment that held **tens of TB** of revenue-critical data spread over thousands of shards. Resharding it took the team **over two years of manual work**, and the application had to tolerate eventual-consistency anomalies that engineers hated — because money was at stake, an advertiser's budget read had to reflect the latest debit *exactly*, across continents. Google wanted a system that gave SQL, ACID transactions, and **external consistency** (strict serializability) at global scale. Naive CAP reasoning says this is impossible: a globally distributed store *must* drop C or A under partition. Spanner is the answer to "what if we just pay the C price everywhere, on purpose."

Amazon had faced the mirror-image problem a few years earlier. During the 2006 holiday peak, the shopping-cart service — backed by a relational store — saw availability dips that translated directly into lost sales at a scale of **millions of requests per second** across hundreds of services. Amazon's verdict: *an "add to cart" must never fail, even if the network is partitioned*, because a rejected write is a rejected dollar. Dynamo (and its product descendant DynamoDB) is the answer to "what if we just pay the A price everywhere, on purpose."

These two systems sit at the exact poles this whole module is about. Map them onto the **PACELC** framing from §3:

```
                    PARTITION (PAC)          NORMAL (ELC)
                 ┌──────────────────┐     ┌──────────────────┐
  SPANNER   →    │  C  (refuse to   │     │  C  (commit-wait │   = PC/EC
                 │   split-brain;   │     │   ~2ε per txn)   │
                 │   minority can't │     │                  │
                 │   commit)        │     │                  │
                 └──────────────────┘     └──────────────────┘
                 ┌──────────────────┐     ┌──────────────────┐
  DYNAMODB  →    │  A  (sloppy      │     │  L  (W=1/R=1 by  │   = PA/EL
                 │   quorum +       │     │   default; no    │
                 │   hinted handoff)│     │   coordination)  │
                 └──────────────────┘     └──────────────────┘
```

**Spanner applies the module's concepts as follows.** Its C is the strict-serializable gold standard from §6 — linearizable *and* serializable — which Google brands *external consistency*. It buys that with the **linearizability-costs-latency** law of the `ELC` half (§3): every read-write transaction pays **commit-wait ≈ 2ε** (§8), where TrueTime keeps `ε` to ~1–7 ms via GPS + atomic clocks. That commit-wait *is* the `ELC` tax made literal — coordination on the healthy-network common case, not just during partitions. Under partition it lands in the **PC** corner: each Paxos group needs a majority to commit, so a minority partition simply blocks (the "stop selling" clerk from §1). Spanner never serves the stale-read that would violate linearizability; it gives up availability instead.

**DynamoDB applies the *inverse* set of concepts.** Its default reads are eventually consistent — the bottom of the §4 spectrum — implemented with the `W=1, R=1` quorum from §5, where `W + R = 2 ≤ N`, deliberately *failing* the `W+R>N` overlap test so reads never wait on a coordinating replica. That's the **EL** corner: lowest latency, single-digit-millisecond reads regardless of replica count. Under partition it uses **sloppy quorums + hinted handoff** (§5, §9) to stay writeable on *any* reachable nodes — the **PA** corner, the "keep selling" clerk. The cost it accepts is divergence, resolved by version vectors and app-level merges (the two-divergent-carts example).

**The key trade-off each accepted.** Spanner gave up *latency and availability* to get *real-time global ordering*: it cannot commit a write in a minority partition, and it pays the commit-wait tax on every transaction plus needs specialized clock hardware. DynamoDB gave up *recency and single-system-image semantics* to get *unconditional write availability and flat low latency*: a default read can be stale, and concurrent writes can diverge, pushing conflict resolution onto you.

**Real numbers.** Spanner runs Google's production workloads (AdWords, Play) on databases spanning **millions of tables and trillions of rows**, with TrueTime `ε` typically **under 7 ms** and commit-wait on the order of **a few ms** — the price of external consistency. DynamoDB powers Amazon retail and serves customers like Prime Day at **tens of millions of requests per second** with **single-digit-millisecond** P99 read latency for eventually-consistent reads; opting into a strongly-consistent read (added later, moving DynamoDB toward the *tunable* column of §3) roughly **doubles** the read cost and gives up some availability — the consistency tax, billed per request.

The deepest lesson is that **neither is "better."** They answered the *same* PACELC question with opposite values because their business invariants differed: Google's invariant was "an advertiser is never double-charged and balances are globally ordered" (an invariant that *requires* linearizability); Amazon's was "a cart add never fails" (an invariant that *requires* availability). Pick the pole your invariant demands — and, as Cosmos DB (§7) shows, mature systems now let you pick per operation rather than per database.

### Lessons

- **The C-vs-A choice is dictated by your invariant, not your taste.** "Never double-charge" forces linearizability (Spanner); "never drop a write" forces availability (Dynamo). Name the invariant first, then the pole follows.
- **The `ELC` tax is the one you pay daily.** Partitions are rare; Spanner's commit-wait and DynamoDB's consistent-read surcharge are paid on the healthy network, every request. Most of your latency budget lives in `ELC`, not `PAC`.
- **Strong consistency at global scale is *achievable* but never free** — Spanner needed atomic clocks and accepts commit-wait to make naive-CAP-"impossible" SQL real. If you can't pay that, relax to causal/session (the AP ceiling, §4).
- **The market converged on tunable.** Both poles drifted toward the middle — DynamoDB added strong reads and transactions; this is why per-operation consistency (§7), not a per-database label, is the modern design stance.

## 11. Test yourself

1. **A team says their database is "CA — consistent and available, we don't need partition tolerance."** Why is this almost always a confused statement? *(Hint: P isn't a choice on a real network; "CA" only describes a single node or a system that gives up the moment the network hiccups.)*
2. **Give a concrete user-facing bug that read-your-writes prevents but monotonic-reads does not, and vice versa.** *(Hint: RYW = seeing your own edit; monotonic reads = never seeing time go backward across two reads, even of others' data.)*
3. **With `N=5`, list two `(W,R)` pairs that give strong consistency and one that doesn't, and state each pair's availability trade-off.** *(Hint: need `W+R>5`; e.g. (3,3) balanced, (5,1) fast reads/fragile writes, (1,1) eventual.)*
4. **Why does Spanner's commit-wait make latency proportional to clock uncertainty `ε`, and what would happen if `ε` were 200 ms?** *(Hint: it blocks ~2ε per commit; 200 ms ε ⇒ ~400 ms per write — why CockroachDB uses read-restarts instead.)*
5. **Is "serializable" stronger than "linearizable"? Explain the trick in the question.** *(Hint: they're different axes — multi-object isolation vs single-object recency; strict serializability is both.)*
6. **Which is the strongest consistency model an always-available (AP) system can offer, and why can't it go stronger?** *(Hint: causal — anything stronger needs coordination that a partition can block, forcing you to drop availability.)*
7. **Your shopping cart service occasionally shows two divergent carts after a network blip. Is this a bug or a design choice, and what's the standard remedy?** *(Hint: Dynamo's deliberate AP behavior; remedy is version vectors + an app-level merge function, not LWW.)*
8. **Place MongoDB (default), DynamoDB (default), and etcd in PACELC and justify each.** *(Hint: MongoDB PC/EC majority leader; DynamoDB PA/EL; etcd PC/EC Raft.)*

---

## 12. Further reading

- **DDIA (Kleppmann), Chapter 5** (Replication — leaders, quorums, read-your-writes) and **Chapter 9** (Consistency & Consensus — linearizability, the CAP debate, ordering). The single best treatment; read these two chapters in full.
- Gilbert & Lynch, *"Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services"* (2002) — the CAP proof.
- Daniel Abadi, *"Consistency Tradeoffs in Modern Distributed Database System Design"* (IEEE Computer, 2012) — the PACELC paper. Also his blog *"Problems with CAP."*
- Brewer, *"CAP Twelve Years Later: How the 'Rules' Have Changed"* (2012) — the author's own correction of the "pick 2" myth.
- Corbett et al., *"Spanner: Google's Globally-Distributed Database"* (OSDI 2012) — TrueTime & external consistency.
- DeCandia et al., *"Dynamo: Amazon's Highly Available Key-value Store"* (SOSP 2007).
- Terry et al., *"Session Guarantees for Weakly Consistent Replicated Data"* (1994) — the four client-centric guarantees.
- Lamport, *"How to Make a Multiprocessor Computer That Correctly Executes Multiprocess Programs"* (1979) — sequential consistency; and *"Time, Clocks, and the Ordering of Events"* (1978).
- Azure Cosmos DB official docs, *"Consistency levels"* — the five-level model with TLA+ specs.
- Peter Bailis et al., *"Highly Available Transactions"* (HAT, VLDB 2014) — what isolation levels survive AP. Jepsen.io analyses — empirical consistency torture-tests of real databases.

*Next: `10-distributed-transactions-and-consensus.md` builds on quorums and linearizability to cover Paxos, Raft, and 2PC — the machinery that actually implements the CP/EC corner.*
