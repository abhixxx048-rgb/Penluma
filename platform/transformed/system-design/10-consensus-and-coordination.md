---
title: "How Computers Agree When Some Crash, Lie, or Freeze"
metaTitle: "Consensus & Coordination in Distributed Systems"
description: "Learn how distributed systems reach agreement when nodes crash or stall — Paxos, Raft, distributed locks, fencing tokens, and why consensus is hard."
keywords:
  - distributed consensus
  - Raft consensus algorithm
  - Paxos explained
  - distributed locks
  - fencing tokens
  - leader election
  - FLP impossibility
  - etcd Kubernetes
  - ZooKeeper vs etcd
  - distributed coordination
  - quorum consensus
  - linearizable reads
  - state machine replication
  - vector clocks
faq:
  - q: What is consensus in distributed systems?
    a: Consensus is how a group of computers agree on a single value or an ordered list of decisions, even when some machines crash, slow down, or lose messages. It underpins leader election, distributed locks, and replicated databases.
  - q: What is the difference between Paxos and Raft?
    a: Both solve the same problem and give the same guarantees. Paxos is flexible but famously hard to implement, while Raft is built around a single strong leader and a contiguous log, making it far easier to reason about and code correctly. Most modern systems like etcd and CockroachDB use Raft.
  - q: Are distributed locks safe?
    a: Not on their own. A lock holder can pause past the lock's expiry, letting two clients believe they hold it at once. The only real fix is a fencing token — a monotonically increasing number the protected resource checks to reject stale writers.
  - q: Why do consensus clusters use 3 or 5 nodes?
    a: Odd numbers give clean majorities. A 3-node cluster tolerates 1 failure and a 5-node cluster tolerates 2. Adding more nodes barely improves fault tolerance and slows writes, because every write needs a larger majority to acknowledge it.
  - q: How does Raft beat the FLP impossibility result?
    a: It does not beat it — it sidesteps it. Raft always stays safe (never decides two different values) but gives up guaranteed liveness. Randomized timeouts make permanent stalling astronomically unlikely, so progress resumes once the network behaves.
  - q: Why does Kubernetes use etcd?
    a: Kubernetes needs exactly one linearizable source of truth for cluster state. It concentrates all consensus in a small etcd cluster running Raft, which lets the apiserver, scheduler, and controllers stay stateless and easy to scale.
topic: system-design
topicTitle: System Design
category: Engineering
date: '2026-06-15'
order: 10
icon: "\U0001F3D7️"
author: Pritesh Yadav
transformed: true
sources:
  - https://en.wikipedia.org/wiki/Consensus_(computer_science)
  - https://en.wikipedia.org/wiki/Raft_(algorithm)
  - https://en.wikipedia.org/wiki/Paxos_(computer_science)
---

Picture three bank tellers sharing one ledger. They can only pass paper notes, the notes sometimes get lost or arrive late, and any teller can faint mid-sentence. Yet they must never both hand out the last $100.

That impossible-sounding office is every distributed database, every Kubernetes cluster, every replicated service you have ever used. The protocol that keeps those tellers honest has a name: **consensus**. And once you understand it, a huge swath of "distributed systems magic" stops being magic.

## Why this matters

Almost every hard problem in distributed systems quietly reduces to one question: *how do a bunch of unreliable machines agree on a single answer?*

- Electing one leader out of many replicas.
- Committing a transaction across shards without tearing it in half.
- Deciding which node holds a lock right now.
- Agreeing on who is even still in the cluster.

If you can get machines to agree on an **ordered list of commands**, you can build essentially any reliable system on top. Feed the same commands, in the same order, to identical deterministic replicas, and they stay perfectly in sync. That single idea — called **state machine replication** — is why people say "consensus is just a replicated log."

Get this right and your system survives crashes without losing data. Get it subtly wrong and you ship a corruption bug that only fires under load, at 3 a.m., when two machines both think they're in charge.

## What "agreement" actually requires

A consensus protocol has to satisfy three plain-English promises:

- **Agreement** — no two healthy nodes decide different values. Nobody hands out the last $100 twice.
- **Validity** — the decided value was actually proposed by somebody. No node gets to invent a number.
- **Termination** — every healthy node eventually decides. The meeting can't run forever.

Hold onto those three. The entire field is a story about how hard it is to keep all three at the same time.

## The impossibility you have to respect

Here is the uncomfortable truth, proven in 1985 by Fischer, Lynch, and Paterson (the **FLP result**):

> In a fully asynchronous system — where messages can take *any* amount of time — if even **one** machine might crash, then **no** deterministic protocol can guarantee consensus every single time.

You cannot have safety, liveness, and fault tolerance, all three, all the time, in pure asynchrony.

The intuition is beautifully simple. From the outside, you can **never tell the difference** between "that node is dead" and "that node is just slow, and its reply is still in flight." A maximally unlucky network can always delay the one message that would let everyone decide, keeping the system stuck in an undecided state forever.

This sounds like bad news. It's actually a gift, because it tells you precisely *what to give up*. Real systems make a deliberate choice:

- **Keep safety always.** Never, ever decide two different values.
- **Make liveness conditional.** Accept that during a nasty network partition or an election storm, the system may simply *pause* — and resume once things calm down.

So when an interviewer asks, "How does Raft beat FLP?" the honest answer is: **it doesn't.** It sacrifices guaranteed progress and uses randomized timeouts to make a permanent stall astronomically unlikely. Safety is never on the table.

One caveat worth knowing: FLP assumes machines fail by simply *stopping* (crash faults). If machines can lie or send corrupted data — think open blockchains — you need heavier **Byzantine** consensus, which requires `3f+1` nodes to tolerate `f` liars instead of the `2f+1` for honest crashes. Most infrastructure inside a trusted datacenter only worries about crashes.

## Paxos: the classic that everyone respects and nobody enjoys

Leslie Lamport's **Paxos** was the first widely understood algorithm to solve this. The genius trick at its core is **intersecting majorities**: any two majorities of a `2f+1` cluster must share at least one node. That overlapping node is the system's memory — it forces any new proposal to discover and re-adopt any value that *might* already have been chosen.

That single rule — *"if you find a value that could have been chosen, you must re-propose it"* — is what makes Paxos unable to ever "un-decide" something. It's the heart of its safety.

The trouble is practical. Basic Paxos decides exactly **one** value, but real systems need a whole *log* of values. The extension, **Multi-Paxos**, elects a stable leader and streams commands efficiently — but Lamport's papers left the messy parts (leader election, membership changes, log cleanup) as "an exercise for the reader." Production engineers found that exercise miserable. Which is exactly why Raft was created.

## Raft: consensus you can actually build

In 2014, Ongaro and Ousterhout published a paper with a refreshingly honest title: *"In Search of an Understandable Consensus Algorithm."* The result, **Raft**, gives the same guarantees as Multi-Paxos but breaks the problem into three teachable pieces. It's what etcd, Consul, CockroachDB, TiKV, and others actually run today.

### Terms and leader election

Raft slices time into **terms** — just monotonically increasing integers that act as "epochs of leadership." Each term has at most one leader. Every node is a **follower**, a **candidate**, or the **leader**.

A follower that hears no heartbeat within its **election timeout** (randomized, say 150–300 ms) bumps the term, becomes a candidate, votes for itself, and asks everyone else for votes. Win a majority and you're the new leader.

Two details do the heavy lifting:

1. **The election restriction.** A node only grants its vote if the candidate's log is *at least as up-to-date* as its own. This is what stops a stale, far-behind node from winning and erasing data everyone else already committed.
2. **Randomized timeouts.** Because everyone waits a slightly different random amount, two candidates rarely start at once. On a tie, they back off randomly and retry. This randomness is Raft's pragmatic escape hatch around FLP's liveness limit.

### Replicating the log

The leader appends each client command to its log and ships it to followers. A follower only accepts an entry if its own log matches at the previous position — the **Log Matching Property**: if two logs agree on an entry at the same index and term, then *everything before it* is identical too. When logs diverge, the leader walks back and overwrites the follower's bad tail.

An entry becomes **committed** once two things are true: it's stored on a majority, *and* it's from the leader's current term. That second condition is subtle — it's the famous "Figure 8" rule, and skipping it is the single most common way hand-rolled Raft implementations silently corrupt data. A committed entry then gets applied to the state machine in order.

### The safety net

Raft guarantees, among other things, at most one leader per term, that leaders never rewrite their own log, and **Leader Completeness** — any committed entry is guaranteed to be present in every future leader's log. Put together, no two nodes ever apply different commands at the same slot.

### Paxos vs Raft, at a glance

| | Multi-Paxos | Raft |
|---|---|---|
| Mental model | flexible, proof-first | strong-leader, log-first |
| Leader | optional / multiple proposers | mandatory single leader |
| Log | can have holes | contiguous, no holes |
| Spec completeness | leaves a lot unspecified | full algorithm, including membership |
| Found in | Chubby, Spanner, Megastore | etcd, Consul, CockroachDB, TiKV |

For most teams building a correct, maintainable log inside one datacenter, Raft is the answer. Paxos variants (Flexible Paxos, EPaxos) shine when a single leader becomes a wide-area-network bottleneck.

## You don't implement this yourself — you rent it

Here's the good news: you almost never write Raft by hand. You run a **coordination service** and use *its* primitives. Three dominate, and all three are **CP systems** — they favor consistency and will refuse writes rather than risk disagreement during a partition.

| | ZooKeeper | etcd | Consul |
|---|---|---|---|
| Data model | hierarchical nodes | flat sorted key-value | key-value + service catalog |
| Liveness tool | ephemeral nodes + sessions | leases (TTL, must renew) | TTL / health-check sessions |
| Service discovery | do it yourself | mostly DIY | first-class (DNS, health checks) |
| Famously used by | Kafka, HBase, Hadoop | **Kubernetes** | HashiCorp stack, multi-DC |

A practical rule: run **3 or 5 nodes**, always odd. Three tolerates one failure, five tolerates two. Jumping to seven barely improves resilience and actively *slows* writes, because each write now needs a bigger majority to acknowledge it. These clusters are the brain stem of your architecture — keep them small, dedicated, and lightly loaded.

## The trap: a distributed lock is not a mutex

This is where confident engineers get burned, so slow down here.

A distributed lock *looks* like `mutex.lock()`. It is **nothing like one**. A local mutex lives in a single process where the operating system guarantees you still hold it. A distributed lock holder, by contrast, can be **frozen** — by a garbage-collection pause, a VM migration, CPU starvation — for longer than the lock's expiry.

Here's the disaster, step by step:

1. Client A acquires a lock with a 10-second TTL.
2. Client A suffers a 15-second stop-the-world GC pause.
3. The lock expires. Client B acquires it. So far, correct.
4. Client A wakes up, *still believing it holds the lock*, and writes.
5. Now **both** A and B write to the shared resource. Corruption.

The lock did everything right. It still failed, because it cannot reach into a paused process and revoke authority.

### Fencing tokens: the only real fix

The fix doesn't live in the lock — it lives in the **resource**.

Each time the lock service grants the lock, it also hands out a **fencing token**: a number that only ever increases. Every write to the protected resource must carry its token. The resource remembers the highest token it has seen and **rejects any write with a lower one**.

> A gets token 33, then pauses. B gets token 34 and writes — the resource is now at 34. A wakes and writes with token 33. The resource sees 33 < 34 and rejects it.

The zombie writer is fenced off automatically. Mutual exclusion across pauses can only be enforced by the resource checking tokens — never by the lock alone.

### The Redlock debate, settled simply

Redlock is an algorithm for building locks across several independent Redis servers. Martin Kleppmann's well-known critique boils down to a clean distinction:

- For **correctness** (you must *never* have two holders — money, files, billing), Redlock is **unsafe**. It assumes bounded clock drift and bounded pauses (the very things FLP says you can't assume) and provides no fencing token.
- For **efficiency** (a lock that just avoids occasional duplicate work, where a rare double-run is merely wasteful), a single `SET key val NX PX ttl` in Redis is usually plenty.

The durable takeaway: **if a lock guards correctness, you need a consensus-backed lock service (etcd, ZooKeeper) *and* fencing tokens enforced by the resource.** If you can't fence, you don't have a lock. You have a hint.

## Leader leases: fast reads without asking everyone

There's a clever middle ground called a **lease** — a lock with a built-in expiry: "you're the leader until time T, unless you renew." It turns *external* failure detection (others run a protocol to notice you died) into *time-based* self-expiry (your authority just lapses).

The payoff is speed. A leader holding a valid lease can serve **linearizable reads locally**, with no round-trip to the rest of the cluster, because the lease guarantees nobody else can have become leader yet. Spanner, CockroachDB, and TiKV all use this to turn a network hop per read into a quick clock check.

The catch, predictably, is **clocks**. Leases assume clocks don't drift too far apart. If a holder's clock runs slow, it may think its lease is still valid after the grantor expired it — and now you have two leaders. The defenses:

- **Conservative expiry:** the holder treats its lease as dead *earlier* than the grantor does, leaving a safety gap where nobody acts.
- **Bounded-uncertainty clocks:** Google Spanner's **TrueTime** reports the time as an interval `[earliest, latest]` and *waits out* the uncertainty so intervals can't overlap, using GPS and atomic clocks to keep the gap to a few milliseconds.
- **Epoch fencing:** tie the lease to the consensus term so a stale leader's writes get rejected by the log anyway.

## Keeping time without a global stopwatch

You can't order events across machines using wall clocks alone — they drift, skew, and occasionally jump backward. Distributed systems use a toolbox of logical clocks instead:

- **Lamport timestamps** (one counter): if event `a` causally happened before `b`, then `a`'s timestamp is smaller. The reverse isn't guaranteed — a smaller timestamp doesn't *prove* causality — but it's enough to build a total order for a single leader's log.
- **Vector clocks** (one counter per node): can detect when two events are genuinely **concurrent** (neither caused the other). This is exactly what systems like DynamoDB and Riak need to spot conflicting writes.
- **Hybrid Logical Clocks (HLC):** combine a physical component (timestamps that look like real time) with a logical counter (so causality is never violated). They never go backward and stay close to wall time. CockroachDB, YugabyteDB, and MongoDB use them. HLC is the pragmatic default when you want causality *and* meaningful timestamps but don't have Google's atomic-clock budget.
- **TrueTime:** Spanner's hardware clocks with explicit uncertainty, used to deliver global linearizability by paying a few milliseconds of "commit wait."

## Common misconceptions

**"A distributed lock guarantees only one writer."** Only with fencing tokens enforced at the resource. Without them, any pause can produce two simultaneous holders.

**"More nodes means more reliable consensus."** Past 5, you mostly add latency. Writes need a bigger majority, so they get *slower*, while fault tolerance barely improves. Odd, small clusters win.

**"Raft solves the FLP impossibility."** No algorithm does. Raft keeps safety always and accepts that progress can stall during bad network conditions.

**"A coordination service is just a fast database."** etcd and ZooKeeper are *not* general databases. Storing large values or high-churn data saturates the consensus log and can freeze the very cluster everything depends on. Keep entries small (kilobytes) and write rates modest.

**"NTP is good enough for ordering and leases."** A single backward clock jump (leap second, VM resume) can expire a lease in one machine's frame but not another's, producing two leaders. Always use a guard band, and prefer HLC or epoch fencing.

## How to use this

When you next reach for coordination, walk this checklist:

1. **Don't build consensus yourself.** Use a vetted service (etcd, ZooKeeper, Consul) or a vetted library (etcd/raft, Dragonboat, Atomix). Hand-rolled Raft almost always misses the current-term commit rule.
2. **Run odd, small clusters.** Three or five nodes. Never four.
3. **Decide what your lock protects.** Efficiency hint? A single Redis `SET NX` is fine. Correctness? Use a consensus-backed lock *and* fencing tokens.
4. **Push fencing to the resource.** The database, file store, or API layer must reject stale tokens. Many systems already give you this — etcd's `revision`, Kubernetes' `resourceVersion`, a database's `SELECT FOR UPDATE`.
5. **Treat clocks as suspects.** If leases or ordering depend on time, add a guard band, use HLC, and tie authority to consensus epochs.
6. **Keep the brain stem light.** Store small values, modest write rates, and watch out for watch storms. Overloading a consensus store has frozen real production clusters.

## A real example: etcd as the brain of Kubernetes

Kubernetes is a perfect case study because it makes every trade-off in this article on purpose.

A production cluster can run thousands of nodes, with hundreds of controllers — the scheduler, kubelets, autoscalers — all reading the cluster's desired state, reacting, and writing back, concurrently, forever. The hard requirement: exactly **one** linearizable source of truth. Two schedulers each "winning" the same Pod is a correctness disaster.

Kubernetes solves this by *not* baking coordination into its API server. It delegates all of it to one small, dedicated component: **etcd**, a 3-or-5-node Raft cluster. The API server, scheduler, and controllers are stateless and easy to scale precisely *because* the hard consensus problem is concentrated in that tiny brain stem.

Every concept above maps directly onto it:

- **Raft commit** guarantees that once `kubectl apply` returns success, your object survives losing any single control-plane machine.
- **Leader election** kicks in within hundreds of milliseconds when an etcd node dies — and during that window etcd refuses writes, the textbook CP choice of consistency over availability.
- **Leases** power leader election for the scheduler and controller-manager, so only one replica is ever active. Kubernetes even exposes a first-class `Lease` API object for it.
- **Fencing** appears as `resourceVersion`: every write must state the version it read, and if etcd's revision has moved on, the write is rejected with a `409 Conflict`. A zombie controller that paused and woke up carries a stale version and loses the compare-and-swap. That's a fencing token by another name, enforced by the resource.

The price they pay is real: write throughput does **not** scale by adding etcd nodes (more nodes means a bigger, slower quorum), etcd has a hard default storage quota, and overloading it has caused control-plane outages where the whole cluster freezes. Kubernetes accepted that ceiling in exchange for absolute correctness. That is engineering: choosing your trade-off on purpose, with eyes open.

## Conclusion

If you remember one thing, make it this: **a correct distributed lock is enforced by the resource, not the lock.** Everything else — Paxos, Raft, leases, fencing tokens, hybrid clocks — is machinery in service of that humble, hard-won idea that unreliable parts can still produce one trustworthy answer.

Consensus gets a handful of machines to agree on a single ordered log. But the moment your data outgrows one cluster and spans many shards, a new question appears: how do you commit a transaction that touches *several* of those logs at once, atomically, without tearing it in half? That's the world of distributed transactions, two-phase commit, and sagas — and it's where consensus becomes the foundation for something even more ambitious.
