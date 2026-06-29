# 10 — Consensus & Distributed Coordination

**What you'll learn:** How a group of machines that can crash, pause, and lie about timing nonetheless agree on a single value or an ordered sequence of decisions — the bedrock under leader election, distributed locks, config stores, and replicated databases. We go from the FLP impossibility result through Paxos and Raft, into the real coordination services (ZooKeeper, etcd, Consul), the *dangerous* world of distributed locks, and the clock machinery (Lamport, vector, HLC) that makes ordering possible.

**Prerequisites:** Read `02-networking-and-rpc.md` (timeouts, partial failure), `08-replication-and-partitioning.md` (replicated state, quorums), and `09-cap-pacelc-and-consistency-models.md` (linearizability, the C/A trade-off) first. Consensus is the *mechanism* that buys you the strong-consistency end of CAP.

---

## 1. Why consensus at all? (intuition)

Imagine three bank tellers sharing one ledger, but they can only pass notes, notes can be lost or arrive late, and any teller can faint mid-sentence. They must never both hand out the last $100. Consensus is the protocol for the notes: a way to reach **one agreed decision** even though messages are unreliable and participants fail.

Formally, a consensus protocol over a set of nodes must satisfy:

- **Agreement** — no two correct nodes decide different values.
- **Validity (integrity)** — the decided value was proposed by some node (no inventing values).
- **Termination (liveness)** — every correct node eventually decides.

Almost everything hard in distributed systems reduces to consensus: electing a leader, committing a transaction across shards, ordering a replicated log, fencing a lock, agreeing on cluster membership. If you can totally-order a log of commands, you can build any replicated state machine (RSM) — feed the same ordered commands to deterministic replicas and they stay identical. That's the **State Machine Replication** theorem and it's why "consensus = a replicated log" in practice.

```
  Clients
     |  commands (append "x=5", "y=7", ...)
     v
+----------------------- consensus layer -----------------------+
| leader  ---->  replicated, totally-ordered log               |
|   |        idx: 1     2     3     4                           |
|   |       [x=5] [y=7] [x=9] [z=1]   <- identical on majority  |
+--------------------------------------------------------------+
     |        |        |
     v        v        v
  SM rep1  SM rep2  SM rep3     apply in order -> identical state
```

---

## 2. FLP: the impossibility you must respect

**Fischer–Lynch–Paterson (1985):** In an *asynchronous* system (no bound on message delay or relative processor speed) where even **one** process may crash, there is **no deterministic protocol that guarantees consensus**. You cannot have safety + liveness + fault tolerance all three, all the time, in pure asynchrony.

The intuition: you can never distinguish "node is dead" from "node is slow / message is in flight." A scheduler can always delay the one message that would let the system decide, holding it in an indecisive ("bivalent") state forever.

This is not a counsel of despair — it tells you *what to give up*. Real systems keep **safety always** and accept that **liveness is conditional**: progress happens only during periods of *partial synchrony* (Dwork–Lynch–Stockmeyer), i.e. when the network behaves "well enough" for long enough. Paxos, Raft, ZAB all live here: they never decide two different values (safe), but during a bad partition or a leader-election storm they may simply stall (no liveness) until things calm down. **When an interviewer asks "how does Raft beat FLP?" the answer is: it doesn't — it sacrifices guaranteed liveness, using randomized timeouts to make permanent stalling astronomically unlikely.**

> Distinction: FLP assumes crash faults. If nodes can lie/corrupt arbitrarily you need **Byzantine** consensus (PBFT, Tendermint) requiring `3f+1` nodes to tolerate `f` liars, vs `2f+1` for crash faults. Most infra (Raft/Paxos) is crash-fault-tolerant only — fine inside one trusted datacenter, not for open blockchains.

---

## 3. Paxos — the canonical algorithm (intuition over proof)

Lamport's Paxos solves consensus for a single value under partial synchrony. Roles: **proposers**, **acceptors** (the voting majority), **learners**. Decisions are made by **any majority (quorum)**; any two majorities of `2f+1` nodes intersect in ≥1 node, which is the trick that prevents two conflicting decisions.

Two phases:

```
Phase 1 (Prepare):  proposer picks ballot n, sends Prepare(n)
                    acceptor: if n > highest seen, PROMISE not to accept < n,
                              and reply with any value it already accepted
Phase 2 (Accept):   proposer picks value v (its own, OR the highest-ballot
                              value any acceptor reported back),
                              sends Accept(n, v)
                    acceptor: accept(n,v) unless it promised a higher ballot
Chosen: a value is CHOSEN once a majority has accepted it.
```

The "adopt the highest already-accepted value" rule in Phase 2 is the heart of safety: once a value *could* have been chosen, every future ballot is forced to re-propose it. So Paxos can never un-decide.

**Why people hate basic Paxos:** it decides *one* value. Real systems need a *log* of values → **Multi-Paxos**: elect a stable leader once, then skip Phase 1 for every subsequent slot (the leader's promise covers all future slots), so steady state is one round-trip per command. But Lamport's papers leave Multi-Paxos under-specified — leader election, membership changes, and log compaction are "left as an exercise," which is exactly why production engineers found it painful and why Raft exists.

---

## 4. Raft — consensus you can actually implement

Raft (Ongaro & Ousterhout, 2014, "In Search of an Understandable Consensus Algorithm") makes the same guarantees as Multi-Paxos but is decomposed into three understandable pieces: **leader election**, **log replication**, **safety**. It is what etcd, Consul, CockroachDB, TiKV, and MongoDB (variant) actually run.

### 4.1 Terms and leader election

Time is divided into **terms** (monotonic integers) — a logical clock for "epochs of leadership." Each term has at most one leader. Nodes are *follower*, *candidate*, or *leader*.

```
        times out, starts election
 +----------+  ----------------------->  +-----------+
 | FOLLOWER |                            | CANDIDATE |
 +----------+  <-----------------------  +-----------+
      ^   ^      discovers leader/term         |
      |   |      with higher term              | wins majority of votes
      |   +------------------------------------+   |
      |              steps down                    v
      |        discovers higher term         +--------+
      +--------------------------------------|  LEADER |
                                             +--------+
        (heartbeats AppendEntries to retain leadership)
```

A follower that hears no heartbeat within its **election timeout** (randomized, e.g. 150–300 ms) increments its term and becomes a candidate, votes for itself, and requests votes. A node grants its vote only if the candidate's log is **at least as up-to-date** as its own (the *election restriction* — this is what keeps a stale node from winning and erasing committed entries). Win a majority → leader. The randomized timeouts make split votes rare; on a tie, everyone backs off a random amount and retries. This randomization is Raft's pragmatic escape hatch around FLP's liveness limit.

### 4.2 Log replication & commit

The leader appends a client command to its log and sends `AppendEntries(term, prevLogIndex, prevLogTerm, entries[], leaderCommit)` to followers. A follower accepts only if its log matches at `prevLogIndex/prevLogTerm` — the **Log Matching Property**: if two logs share an entry at the same index+term, all *preceding* entries are identical. Mismatches cause the leader to walk back and overwrite the follower's divergent tail.

An entry is **committed** once it's replicated on a majority *and* it's from the leader's current term. Committed entries are applied to the state machine in index order. The subtle "current term" rule (Figure 8 in the paper) prevents a leader from considering an older-term entry committed just because it's on a majority — a later leader could still overwrite it. This is a classic source of buggy hand-rolled Raft.

### 4.3 Safety guarantees Raft enforces

| Property | What it guarantees |
|---|---|
| Election Safety | ≤1 leader per term |
| Leader Append-Only | leaders never delete/overwrite their *own* log |
| Log Matching | same index+term ⇒ identical prefixes |
| Leader Completeness | a committed entry is present in all future leaders' logs |
| State Machine Safety | no two nodes apply different commands at the same index |

### Paxos vs Raft

| Dimension | Multi-Paxos | Raft |
|---|---|---|
| Mental model | flexible, role-based, proof-first | strong-leader, log-first |
| Leader | optional / multiple proposers OK | mandatory single leader |
| Log holes | can commit out of order | log is contiguous, no holes |
| Spec completeness | leaves a lot unspecified | full algorithm incl. membership + snapshots |
| Membership change | ad-hoc | joint consensus / single-server change |
| Implementations | Chubby, Spanner, Megastore | etcd, Consul, CockroachDB, TiKV, RethinkDB |
| When to use | you need flexible quorums (see Flexible Paxos / EPaxos for WAN) | you want a correct, maintainable, single-DC log |

> **EPaxos / Flexible Paxos** are the advanced answer when a single leader is a WAN bottleneck: they exploit the fact that Phase-1 and Phase-2 quorums only need to *intersect*, allowing smaller Phase-2 quorums or leaderless commits for non-conflicting commands.

---

## 5. ZAB & ZooKeeper

**ZAB (ZooKeeper Atomic Broadcast)** predates Raft and powers Apache ZooKeeper. Same shape — a single elected leader broadcasts a totally-ordered stream of state changes to followers, committed by majority. Differences worth knowing:

- ZAB is built around **primary-order atomic broadcast** with explicit *recovery* and *broadcast* phases; on leader change it runs a **synchronization** phase to make followers' logs match the new leader before serving.
- ZooKeeper transaction IDs (**zxid**) are 64-bit: high 32 bits = epoch (leader generation, like Raft's term), low 32 bits = counter. The epoch-in-the-id trick makes stale-leader writes trivially detectable.
- ZooKeeper exposes a hierarchical **znode** filesystem, **watches** (one-shot change notifications), **ephemeral** nodes (auto-deleted when the creating session's heartbeat lapses), and **sequential** nodes (server-assigned monotonic suffixes). These four primitives are the building blocks for almost every coordination recipe.

---

## 6. Coordination services: ZooKeeper vs etcd vs Consul

You rarely implement Raft yourself. You run a coordination service and use *its* primitives. All three are CP systems (favor consistency; refuse writes during a quorum-losing partition).

| Feature | ZooKeeper (ZAB) | etcd (Raft) | Consul (Raft) |
|---|---|---|---|
| Data model | hierarchical znodes | flat sorted KV (MVCC, revisions) | KV + rich service catalog |
| Watch | one-shot watches | streaming watch from a revision | blocking queries |
| Liveness primitive | ephemeral nodes + sessions | **leases** (TTL, must renew) | TTL/health-check sessions |
| Linearizable reads | sync() then read | yes (default) / serializable opt-in | default vs stale modes |
| Service discovery | DIY | DIY-ish | first-class (DNS, health checks) |
| Built-in DNS/mesh | no | no | yes (+ Connect mTLS mesh) |
| Used by | Kafka(<3.x), HBase, Hadoop | **Kubernetes**, CoreOS, M3 | HashiCorp stack, multi-DC infra |
| When to use | mature JVM ecosystems, ZK recipes | k8s-native, simple strong KV + leases | service discovery + multi-DC + mesh |

Typical cluster size is **3 or 5 nodes** (odd, to make majorities clean): tolerates 1 or 2 failures respectively. Going to 7 buys little fault tolerance and *slows* writes (bigger quorum to ack). Keep these clusters small and dedicated; they are the brain stem.

---

## 7. Leader election as a recipe

You don't need a full RSM for "pick one coordinator." Two production patterns:

1. **Ephemeral + sequential nodes (ZooKeeper):** every contender creates an ephemeral-sequential znode under `/election/`. The one with the lowest sequence number is leader. Each other contender *watches only the node just below it* (not the leader — avoids a thundering herd of N watches firing at once). When the leader's session dies its ephemeral node vanishes, the next-lowest is notified and promotes.

2. **Lease key (etcd):** `PUT /leader value=me` bound to a lease with a TTL; the holder must `KeepAlive` the lease. If it crashes, the lease expires, the key disappears, and a watcher takes over. This is **lease-based leadership** (§9).

Both give you a single coordinator *only while the coordination service's consensus holds* — which is exactly the safety you want.

---

## 8. Distributed locks — and why they're dangerous

A "distributed lock" looks like `mutex.lock()`. It is **not** a mutex. The lethal difference: a local mutex lives in one address space where the OS guarantees you still hold it; a distributed lock holder can be **paused** (GC, VM migration, CPU starvation) past the lock's expiry, the lock gets handed to someone else, and now **two clients both believe they hold it**. Without protection they both write.

```
client A           lock service            client B          shared store
   |--acquire(ttl=10s)-->|                    |                  |
   |<----- OK ----------|                     |                  |
   | (STOP-the-world GC pause 15s ........)    |                  |
   |                     |--lease expires-->   |                  |
   |                     |<--acquire----------|                  |
   |                     |----- OK ---------->|                  |
   |  (A wakes, still "thinks" it holds lock) |                  |
   |--------------------- write X ------------------------------>|  (!!)
   |                     |                     |--- write Y ----->|  (!!)
                          two writers, corruption
```

### Fencing tokens — the only real fix

The lock service hands out a **monotonically increasing fencing token** with each grant. Every write to the protected resource carries the token; the *resource* rejects any write whose token is lower than the highest it has seen. A delayed zombie writer carries a stale, smaller token → its write is rejected. The lock *cannot* enforce mutual exclusion across pauses; the **resource** enforces it via the token.

```
A gets token 33, pauses. B gets token 34, writes (resource now at 34).
A wakes, writes with token 33  --->  resource: 33 < 34, REJECT.
```

### The Redlock debate

Redlock is an algorithm to build distributed locks across N independent Redis masters (acquire on a majority within a time bound). Martin Kleppmann's critique:

- For **correctness** (you must never have two holders, e.g. money/files), Redlock is unsafe: it relies on *bounded clock drift and bounded pauses* (assumptions FLP says you can't make), and it provides **no fencing token**. A GC pause or clock jump breaks it.
- For **efficiency** (a lock that's just an optimization to avoid duplicate work, where an occasional double-run is merely wasteful), a single Redis `SET key val NX PX ttl` is usually fine — simpler than Redlock.

Antirez's rebuttal centered on using Redis's own incrementing values as fencing-ish tokens and on practical clock assumptions. **The durable lesson for an interview:** if a lock guards correctness, you need (a) a *consensus-backed* lock service (etcd/ZooKeeper, not best-effort Redis) **and** (b) fencing tokens enforced by the resource. If you can't fence, you don't have a correct lock — you have a hint.

| Lock type | Backing | Safe for correctness? | Use when |
|---|---|---|---|
| `SET NX PX` (single Redis) | best-effort, no consensus | No (no fencing, drift) | cheap "avoid duplicate work" hint |
| Redlock (N Redis) | quorum, no fencing | No (Kleppmann) | rarely justified |
| etcd/ZK lease lock + fencing | Raft/ZAB + monotonic token | Yes | money, file writes, leader-only mutations |
| DB row lock / `SELECT FOR UPDATE` | the DB's own consensus | Yes (same transaction) | when the resource *is* the DB |

---

## 9. Lease-based leadership (advanced)

A **lease** is a lock with a built-in expiry: "you are leader/holder until time T unless you renew." It converts *external* failure detection (others must run a protocol to notice you died) into *time-based* self-expiry (your authority simply lapses).

Why leases matter for **reads**: a leader holding a valid lease can serve **linearizable reads locally without a quorum round-trip** — because the lease guarantees no other node can have become leader yet. This is the *leader lease / leader read lease* optimization in Spanner, CockroachDB, and TiKV, turning a network round-trip per read into a clock check.

The catch is **clock safety**. Leases assume bounded clock drift between grantor and holder. If a holder's clock runs slow it might think its lease is still valid after the grantor expired it → two leaders. Mitigations:

- **Conservative expiry:** the holder treats the lease as expired *earlier* than the grantor does (subtract max-drift `ε`), creating a guard band where nobody acts.
- **Bounded-uncertainty clocks:** Spanner's **TrueTime** exposes `now()` as an interval `[earliest, latest]` and *waits out* the uncertainty (commit-wait) so intervals can't overlap — hardware (GPS/atomic clocks) keeps `ε` ~a few ms.
- Tie the lease to the consensus **term/epoch** so a stale leader's writes are rejected by the log anyway (defense in depth).

> Leader leases are the bridge between §8's "locks are dangerous" and "we still want fast strong reads": same danger (clock-dependent), tamed by intervals + epochs + conservative expiry.

---

## 10. Membership & failure detection

Consensus needs to know *who is in the cluster* and *who is alive*. For small clusters (3–5) the consensus group tracks itself. For large fleets (hundreds–thousands) you use a separate, scalable layer.

### Gossip / SWIM

In **gossip** protocols each node periodically picks a few random peers and exchanges state; information spreads epidemically — full propagation in `O(log N)` rounds, traffic stays roughly constant per node regardless of cluster size. **SWIM** (Scalable Weakly-consistent Infection-style Membership) refines this: a node pings a random target; on no reply it asks `k` other nodes to *indirectly* ping it (filtering transient network blips and false positives) before marking it suspect, then dead, gossiping the verdict. Used by **Serf/Consul**, **Cassandra**, **DynamoDB**, **Akka Cluster**, **Redis Cluster** (variant).

### Phi-accrual failure detection

Binary "alive/dead" timeouts are brittle: too short → false positives, too long → slow detection. **Phi (φ) accrual** (Hayashibara et al.) outputs a *continuous suspicion level* φ derived from the statistical distribution of recent inter-arrival times of heartbeats. The app picks a threshold (e.g. act at φ=8 ≈ 1-in-10⁸ chance the node is actually alive). It self-tunes to the network's real jitter. Used by **Cassandra** and **Akka**.

```
heartbeat gaps -> running mean/variance -> phi rises as silence grows
 phi:  0 ........ 2 ........ 5 ........ 8 (SUSPECT) ........ 12 (DEAD)
```

| Concern | Gossip/SWIM | Phi-accrual | Raft heartbeats |
|---|---|---|---|
| Scale | thousands of nodes | per-link detector | small group only |
| Output | membership view (eventually consistent) | tunable suspicion score | binary leader-alive |
| Use | large dynamic fleets, service mesh | adaptive detection layer | the consensus group itself |

---

## 11. Clocks: ordering without a global stopwatch

Distributed ordering is impossible with wall clocks alone — they drift and skew. The clock toolbox, in order of power:

| Clock | Tells you | Cost | Limitation |
|---|---|---|---|
| Physical (NTP) | approximate wall time | cheap | drift/skew 10s–100s ms; can jump backward |
| Lamport (scalar) | *happens-before* (one-way) | 1 int | `a<b` doesn't prove causality (can't detect concurrency) |
| Vector clock | full causality + concurrency detection | `O(N)` per event | size grows with #nodes |
| Hybrid Logical Clock | causality **and** close-to-wall-time | 2 ints | needs loosely-synced physical clocks |
| TrueTime (Spanner) | bounded real-time interval | GPS/atomic HW | infra cost; commit-wait latency |

- **Lamport timestamps:** `L = max(L, received) + 1` on every event/receive. Guarantees: if `a → b` (causally), then `L(a) < L(b)`. The converse is *not* true — equal-or-ordered timestamps don't prove causality. Good enough to build a *total* order (break ties by node id) for things like a single leader's log.
- **Vector clocks:** each node keeps a vector `V[i]`; compare element-wise. `V(a) < V(b)` ⇒ causal; **incomparable** ⇒ **concurrent** — which is exactly what **DynamoDB/Riak** need to *detect conflicting writes* and surface siblings for resolution.
- **Hybrid Logical Clocks (HLC):** combine a physical component (so timestamps track wall time and are human-meaningful / comparable across systems) with a logical counter (so causality is never violated even when physical clocks jitter). HLC stays within a bounded distance of physical time but never goes backward. Used by **CockroachDB**, **YugabyteDB**, **MongoDB** (cluster time). HLC is the pragmatic default when you want causality *and* timestamps that look like time but you don't have Google's atomic-clock budget.
- **TrueTime:** Spanner's clocks expose uncertainty `ε`; to make an externally-consistent (linearizable) commit, Spanner **waits out** `ε` (commit-wait, typically a few ms) so no later transaction can get an earlier timestamp. This is how Spanner offers global linearizability — by paying latency to make clock uncertainty safe rather than pretending it's zero.

See `09-cap-pacelc-and-consistency-models.md` for how these clocks underpin linearizability vs causal consistency.

---

## 12. Common pitfalls / war stories

- **Treating a distributed lock like a mutex.** No fencing token → a GC pause hands the resource to two writers → silent corruption. *Always fence at the resource.*
- **Using best-effort Redis for correctness locks.** A single `SET NX` is a hint, not a guarantee; if money or file integrity rides on it, you've shipped a data-loss bug that only fires under load (when pauses happen).
- **Even-sized consensus clusters.** A 4-node cluster tolerates the *same* 1 failure as 3 but needs a larger majority and risks more split-vote pain. Always run odd numbers (3/5).
- **Putting too much in the coordination service.** ZooKeeper/etcd are not databases. Storing large values or high write-rate data there saturates the consensus log and freezes the cluster everything depends on. Keep values small (KB) and writes modest.
- **Hand-rolling Raft and missing Figure 8.** The "only commit current-term entries via the majority rule" subtlety is omitted by most blog reimplementations → committed data gets silently overwritten. Use a vetted library (etcd/raft, dragonboat, Atomix); if you must roll your own, run the **Jepsen** and TLA+/model-checked test suites.
- **Trusting NTP for ordering or leases without a guard band.** A backward clock jump (leap second, VM resume) expires a lease in someone's frame but not another's → two leaders. Subtract max-drift; prefer HLC/epoch fencing.
- **Thundering-herd watches in leader election.** N contenders all watching the leader node means N notifications + N re-elections churn on every failure. Watch only your immediate predecessor.
- **Confusing failure detection with consensus.** Gossip/SWIM gives you an *eventually-consistent* membership guess; acting on it as if it were a consensus decision (e.g. removing a node from quorum) without going through the consensus group can split-brain you.

---

## 🧩 Case Study: etcd + Raft as the brain of Kubernetes

**The problem.** Kubernetes is a cluster orchestrator: it must hold the *desired state* of everything — every Pod, Deployment, Service, Secret, Node, ConfigMap — and let dozens of controllers (the scheduler, kube-controller-manager, kubelets, autoscalers) read that state, react, and write back the *observed* state, concurrently, forever. A production cluster can run **thousands of nodes** (Kubernetes officially supports up to 5,000 nodes / 150,000 Pods / 300,000 containers per cluster) with **hundreds of controllers** all watching for changes. The hard requirement: there must be exactly **one** source of truth, it must be **linearizable** (a controller that reads "Pod X is unscheduled" must not be reading stale data and double-schedule it), and it must survive control-plane machine failures without ever losing a committed write or splitting brain. Two schedulers each "winning" the same Pod, or a stale apiserver serving a deleted Secret, is a correctness disaster.

Kubernetes solves this by **not** baking coordination into the apiserver. It delegates *all* of it to one small, dedicated component: **etcd**. This is exactly the "why a coordination service exists" argument from §6 — the apiserver and controllers are stateless and horizontally scalable precisely *because* the hard consensus problem is concentrated in a 3-or-5-node etcd cluster that is the brain stem.

```
  kubectl / controllers / scheduler / kubelets
        |  (watch + read + compare-and-swap writes)
        v
 +--------------------- kube-apiserver (stateless, N replicas) ---------+
 |   the ONLY component that talks to etcd; serializes all access       |
 +---------------------------------|-----------------------------------+
                                   | gRPC (linearizable read / txn)
                                   v
        +============ etcd cluster (Raft, 3 or 5 nodes) ============+
        |   LEADER  --AppendEntries-->  follower    follower        |
        |     |       replicated, totally-ordered Raft log          |
        |   idx: [Pod A] [Deploy B] [Lease kcm] [Node C] ...        |
        |          committed once a MAJORITY (quorum) acks          |
        +==========================================================+
```

**How the module's concepts map to it, one to one:**

- **Raft log replication & commit (§4.2)** — Every write (`kubectl apply`, a controller status update) becomes an entry the etcd **leader** appends and replicates via `AppendEntries`. It is **committed only when a majority** of etcd members have it and it's from the current term — the exact quorum + current-term rule from the module. This is what guarantees that once `kubectl apply` returns success, that object survives any single control-plane node loss.
- **Raft leader election (§4.1)** — etcd members run terms with randomized election timeouts. Lose the leader (machine dies, network blip) and a follower whose log is at-least-as-up-to-date (the election restriction) wins a new term in ~hundreds of ms. During that window etcd refuses writes — Kubernetes is a textbook **CP system** that picks consistency over availability, the C/A trade-off from §6.
- **Linearizable reads (§9 / §6)** — etcd serves linearizable reads by default; the apiserver relies on this so a `GET` never returns a value older than a prior committed write. Latency-sensitive paths (informer **list-watch**) instead stream a **watch from a revision** (etcd's MVCC revision numbers), the streaming-watch primitive from §6.
- **Leases (§9) + leader election as a recipe (§7)** — kube-controller-manager and kube-scheduler each run as multiple replicas but must have only **one active leader** (you don't want two schedulers). They implement leader election on top of an etcd-backed **Lease** object with a TTL the holder must renew (`leaseDurationSeconds`, `renewDeadline`). Lose the renew (crash, GC pause) → the lease expires → a standby acquires it. This is precisely the "lease key in etcd" pattern from §7, and etcd's own internal session liveness uses leases too. Kubernetes even exposes a first-class `coordination.k8s.io/Lease` API object for it.
- **Fencing via resourceVersion (§8)** — Kubernetes can't fence at the disk like the abstract example, but it does the equivalent at the API layer: every object carries a `resourceVersion` (backed by etcd's monotonic revision). Updates use **optimistic concurrency** — a write must state the version it read; if etcd's revision moved on, the write is **rejected with a 409 Conflict** and the controller must re-read and retry. A zombie controller that paused and woke with a stale view carries a stale `resourceVersion` and **loses the compare-and-swap** — the monotonic-token fencing idea from §8, enforced by the *resource* (etcd), not the caller.

**The key trade-off they accepted.** Kubernetes funnels *every* state operation in the entire cluster through one Raft consensus log. That gives bulletproof linearizable consistency and a single source of truth — but it makes etcd the **scalability ceiling and single brain stem** (§6's "keep it small, don't overload it"). Raft's single-leader write path means write throughput does **not** scale by adding etcd nodes (more nodes = *bigger* quorum = *slower* writes), which is why etcd clusters stay at 3 or 5. They traded write scalability and the convenience of a general database for absolute correctness, and they pay for it operationally: etcd has a hard default storage quota (**8 GiB**) and is acutely sensitive to disk fsync and network latency. Overloading it — storing huge objects, high-churn writes, or too many watches — has caused real large-cluster outages where the whole control plane freezes because the brain stem is saturated. This is §12's "putting too much in the coordination service" war story, lived at scale.

**Real numbers / results.** etcd targets and achieves ~**10,000 writes/sec** on commodity SSDs with single-digit-millisecond commit latency when disk fsync is fast; reads are far higher. The 5,000-node Kubernetes scalability target is gated largely by etcd and apiserver behavior, not the kubelets. SLO work on huge clusters consistently traces tail latency back to etcd fsync/compaction and watch fan-out — reinforcing that the consensus layer is the governor on the whole system.

### Lessons

- **Concentrate consensus, then scale the stateless parts around it.** Kubernetes is "scalable" because the *only* place that does Raft is a tiny etcd cluster; apiservers, schedulers, and controllers are cheap to replicate precisely because they own no consensus state.
- **Optimistic concurrency + a monotonic version is fencing in disguise.** `resourceVersion` 409-conflict retries are the same safety property as fencing tokens — the resource rejects stale writers — without needing a distributed mutex.
- **A consensus store is a brain stem, not a database.** Its quota, write-throughput, and latency are hard ceilings; large values, high churn, or watch storms can freeze everything that depends on it. Keep entries small and write rates modest.
- **CP is a deliberate choice.** Kubernetes would rather refuse writes during an etcd quorum loss than risk two schedulers acting on divergent state — availability sacrificed for the one-source-of-truth invariant.

## 13. Test yourself

1. Why can't a deterministic protocol guarantee consensus in a fully asynchronous system with one possible crash? What do Raft/Paxos give up to cope? *(Hint: FLP; can't distinguish slow from dead; they keep safety, make liveness conditional on partial synchrony + randomized timeouts.)*
2. Two majorities of a 5-node cluster — how many nodes must they share, and why does that guarantee agreement? *(Hint: ≥1; intersecting quorums force a later proposer to see any value that could've been chosen.)*
3. A Raft follower is far behind and a leader dies. Why can't the stale follower win the election and erase committed entries? *(Hint: election restriction — vote only for a candidate whose log is at least as up-to-date; Leader Completeness.)*
4. A client holds an etcd lease-based lock, GC-pauses 20s past the TTL, wakes, and writes. With and without fencing tokens, what happens? *(Hint: without → double-writer corruption; with → resource rejects the stale lower token.)*
5. When is a single-Redis `SET NX PX` lock acceptable, and when is it a bug waiting to happen? *(Hint: fine for efficiency/dedupe hints; unsafe for correctness — no fencing, clock/pause assumptions.)*
6. Lamport timestamp `L(a) < L(b)`. Does that prove `a` causally happened before `b`? What clock would let you detect they're concurrent? *(Hint: no, converse doesn't hold; vector clocks detect concurrency via incomparability.)*
7. How does a leader lease let a node serve a linearizable read without contacting a quorum, and what's the failure mode? *(Hint: lease guarantees no newer leader yet; failure = clock drift → two leaders; mitigate with conservative expiry / TrueTime / epoch fencing.)*
8. Why is phi-accrual detection better than a fixed heartbeat timeout, and what does φ represent? *(Hint: adaptive to network jitter; φ is the log-scale suspicion / probability the node is wrongly suspected.)*

---

## 14. Further reading

- Fischer, Lynch, Paterson — *Impossibility of Distributed Consensus with One Faulty Process* (1985).
- Lamport — *The Part-Time Parliament* (1998) and *Paxos Made Simple* (2001).
- Ongaro & Ousterhout — *In Search of an Understandable Consensus Algorithm (Raft)* (2014); plus raft.github.io visualizations.
- Junqueira, Reed, Serafini — *ZAB: High-performance broadcast for primary-backup systems* (2011); ZooKeeper paper (Hunt et al., 2010).
- Burrows — *The Chubby Lock Service* (2006).
- Corbett et al. — *Spanner: Google's Globally-Distributed Database* (2012) — TrueTime & commit-wait.
- Kulkarni et al. — *Logical Physical Clocks (HLC)* (2014).
- Lamport — *Time, Clocks, and the Ordering of Events in a Distributed System* (1978).
- Das, Gupta, Motivala — *SWIM* (2002); Hayashibara et al. — *The φ Accrual Failure Detector* (2004).
- Martin Kleppmann — *How to do distributed locking* (Redlock critique, 2016); antirez's rebuttal.
- Kleppmann, *Designing Data-Intensive Applications* — Ch. 8 (trouble with distributed systems) & Ch. 9 (consistency and consensus).
- Official docs: etcd Raft & lease docs; ZooKeeper recipes; Consul architecture; Jepsen reports (jepsen.io).

---

*Next: `11-distributed-transactions-and-sagas.md` builds on consensus to commit across shards (2PC, Percolator, sagas). Back-reference `09-cap-pacelc-and-consistency-models.md` for the consistency guarantees consensus delivers.*
