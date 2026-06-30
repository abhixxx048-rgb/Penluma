---
title: 'Raft vs Paxos: Which Consensus Algorithm Wins?'
metaTitle: 'Raft vs Paxos: The Honest Comparison'
description: >-
  Raft vs Paxos explained in plain language: how Multi-Paxos, Raft, and real
  systems like etcd and Spanner agree on a replicated log, and when you need it.
topic: distributed-systems
topicTitle: Distributed Systems
category: Engineering
date: '2026-06-21'
order: 6
icon: "\U0001F310"
keywords:
  - raft vs paxos
  - multi-paxos
  - consensus algorithm
  - replicated log
  - state machine replication
  - raft consensus
  - paxos explained
  - etcd raft
  - distributed consensus
  - leader election
  - quorum
  - epaxos
  - byzantine fault tolerance
  - when to use consensus
faq:
  - q: Is Raft faster than Paxos?
    a: >-
      No. Raft was deliberately designed to match Multi-Paxos's guarantees and
      common-case performance. Both commit a command in one round trip to a
      majority when a stable leader is in charge. Raft's only intended advantage
      is being easier to understand and implement correctly.
  - q: What is the difference between Paxos and Multi-Paxos?
    a: >-
      Basic Paxos agrees on a single value. Multi-Paxos runs a Paxos instance per
      log slot to agree on an ordered stream of commands, and adds a stable-leader
      optimization so each command commits in one round trip instead of two phases.
  - q: Should I implement Raft or Paxos myself?
    a: >-
      Almost never. Even the expert teams who shipped production Paxos found
      turning the paper into correct, fault-tested code brutally hard. Use a
      proven system like etcd, ZooKeeper, or Consul instead.
  - q: What is a replicated log in distributed systems?
    a: >-
      A replicated log is an ordered list of commands that every replica stores in
      the same order. If each replica applies the same commands in the same order,
      they all end in the same state. Consensus is the tool that agrees on that order.
  - q: Do I need consensus for my application?
    a: >-
      Often no. A single database primary already gives a consistent, ordered
      source of truth. You need consensus mainly for critical metadata like leader
      election, locks, or cluster config, which off-the-shelf tools handle for you.
  - q: When should I use Byzantine fault tolerance like PBFT?
    a: >-
      Only when participants might lie or act maliciously, such as a public
      blockchain shared by distrusting parties. Inside your own data center, nodes
      crash but don't lie, so cheaper crash-fault consensus (Raft/Paxos) is correct.
author: Brexis Wazik
transformed: true
linked: true
sources:
  - 'https://en.wikipedia.org/wiki/Paxos_(computer_science)'
  - 'https://en.wikipedia.org/wiki/Raft_(algorithm)'
---

You have probably read that "Raft is better than Paxos." It is one of the most repeated claims in distributed systems, and it is also misleading. The two algorithms give you the exact same correctness and the exact same speed. The real difference is whether a human can read the spec and build it without quietly introducing a bug that corrupts your data months later.

That is what this article is really about: how a beautiful piece of theory becomes a working system, and how you choose between the options without falling for the marketing.

## Why this matters

[Consensus](/blog/distributed-systems/02-the-consensus-problem) is the machinery that lets a handful of computers behave like one reliable computer, even when some of them crash or the network hiccups. It is the quiet engine under Kubernetes, under globally distributed databases, under service discovery, under the locks that stop two servers from running the same billing job twice.

If you have ever picked etcd over ZooKeeper, wondered why your cluster needs three nodes and not two, or felt a vague guilt about "rolling your own" [leader election](/blog/distributed-systems/04-raft-leader-election), this is the topic that turns that fog into clear decisions. Getting it wrong does not crash loudly. It corrupts state silently and shows up as a 3 a.m. data inconsistency you cannot explain.

## The one idea everything is built on: the replicated log

Before comparing algorithms, you need the goal they are both chasing. It is simpler than the algorithms themselves.

A **replicated log** is an ordered list of commands, numbered 1, 2, 3, 4, and so on, where every replica stores the *same* commands in the *same* order. Each numbered position is a **log slot**.

A **state machine** is just your application. It starts in some state and changes only by applying commands one at a time.

Put those together and you get the whole trick, called **[state machine replication](/blog/distributed-systems/03-replicated-state-machines-the-log)**: if every replica starts in the same state and applies the same commands in the same order, they all end up in the same state. Consensus is simply the referee that decides "what is the command in slot 1? slot 2? slot 3?" Agree on the log, and the whole cluster behaves like one dependable machine.

> **Think of a room of accountants**, each keeping their own copy of the same ledger. If they all write down the same transactions in the same order, every ledger matches at the end, even if they never compare totals. Consensus is the rule that decides "what is transaction #1, #2, #3" so nobody writes a different line on the same row. The state machine is the running balance; the log is the list of transactions.

[Basic Paxos](/blog/distributed-systems/06-paxos-the-original-consensus-algorithm) agrees on *one* value. But a database never wants to agree on one thing. It wants to agree on a never-ending stream: "set x=5," then "delete y," then "append to z," in a strict order every replica replays identically. So the first real-world problem is: how do you get from "agree on one value" to "agree on an endless ordered log"?

## Multi-Paxos: run Paxos for every slot, but cheat with a leader

**Multi-Paxos** is the obvious answer made efficient. The obvious part: run a separate instance of basic Paxos for *each* log slot. Slot 1 has its own run, slot 2 has its own run, and so on. Stack the chosen values in order and you have your log.

The catch is cost. Basic Paxos agrees on a value using two phases of network round-trips:

- **Phase 1 (Prepare / Promise)** - a proposer picks an ever-increasing **proposal number** and asks the other nodes for permission to lead. This phase is really about *winning the right to propose* and *learning any value that might already be chosen*. It never mentions a specific command.
- **Phase 2 (Accept / Accepted)** - the proposer sends the actual value; once a majority accepts it, the value is chosen.

If you naively ran both phases for every command, each one would pay the full cost. Worse, if several nodes try to lead at once, they keep interrupting each other with higher proposal numbers, a deadlock-by-politeness called **dueling proposers**, and make no progress.

### The stable-leader trick

Here is the insight that makes it practical. Because Phase 1 never names a command or a slot, you can run it *once* for an entire range of future slots, not once per command.

1. A node decides to become leader. It runs Phase 1 a single time, for *all log slots from the next empty one onward*. A majority promises.
2. Now it is the established leader. For each new client command, it just assigns the next free slot and sends only **Phase 2**. One round trip. No Phase 1.
3. This repeats command after command, only Phase 2 each time, as long as the leader stays alive and unchallenged.
4. If the leader crashes, another node runs Phase 1 with a higher number, learns any half-finished slots from the promises, and resumes single-round-trip operation.

In the steady state, committing a command costs **one round trip to a majority**, roughly two message delays, instead of the four you would pay for both phases. That is nearly half the latency, and dueling proposers disappear because there is normally only one proposer. Phase 1 becomes a rare event that fires only on a leader change.

> **A 3-node key-value store.** Node A wins Phase 1 with proposal number 10 and becomes leader. A client sends "SET balance=100." A puts it in slot 1 and sends one Phase-2 message; B and C accept, that is a majority of three, so slot 1 commits in one round trip. "WITHDRAW 30" goes to slot 2, again one round trip. A never re-runs Phase 1. If A then crashes, B runs Phase 1 for slots from 3 onward, learns that slots 1 and 2 are already committed, and continues.

There is a trap here, and it is the whole reason Raft exists. **"Multi-Paxos" is not a single, copy-from-the-paper protocol.** Lamport's famous write-up sketches the leader-and-log idea in a paragraph or two and leaves out the hard parts: how leader election actually works, how you fill gaps in the log, how you recover a node that fell behind, how you change cluster membership. Every production Paxos system had to invent and verify those details itself.

## Raft: the same machine, designed to be readable

**Raft** (Diego Ongaro and John Ousterhout, 2014, "In Search of an Understandable Consensus Algorithm") started from an unusual goal. Most algorithms optimize for speed or minimal assumptions. Raft optimized for *understandability*.

It gives the *same* guarantees and the *same* efficiency as Multi-Paxos. The paper says so directly: Raft "produces a result equivalent to (multi-)Paxos, and it is as efficient as Paxos." What changes is the structure. Raft starts from a strong leader and a single log and deliberately shrinks the number of states you have to reason about.

Two terms unlock the comparison:

- **Strong leader.** In Raft, log entries flow in *one direction only*: from the leader out to followers, never back. The leader is the single source of truth for log order. This is stricter than Multi-Paxos, where in principle any node may propose.
- **Term.** Raft's word for an era. A **term** is a numbered stretch of time with at most one leader; each election starts a new term. Terms play the exact role of Paxos proposal numbers: they let nodes spot a stale leader.

Raft needs just two network calls:

- **`RequestVote`** - sent by a candidate during an election. Crucially, voters only back a candidate whose log is at least as up-to-date as their own. That single rule is what keeps already-committed entries safe.
- **`AppendEntries`** - sent by the leader to replicate new entries *and* as an empty heartbeat to keep its leadership alive. It carries a consistency check (the entry just before the new ones) so a follower only accepts entries that line up with what it already has.

Now look at the mapping that demystifies everything:

> Raft's `RequestVote` is essentially **Paxos Phase 1** (win leadership for a term).
> Raft's `AppendEntries` is essentially **Multi-Paxos Phase 2** (commit a command in one round trip).

They are the same machine wearing different clothes.

### The honest comparison

| Dimension | Multi-Paxos | Raft |
|---|---|---|
| **Primary goal** | Provable correctness, minimal core | Understandability, easy correct implementation |
| **Guarantees & speed** | Safe under crashes; ~1 round trip with a stable leader | Identical safety and speed by design |
| **Leader model** | Optional performance trick; any node may propose | Mandatory strong leader; entries flow leader to follower only |
| **Log handling** | Slots can be chosen out of order; gaps allowed and filled later | Contiguous, append-only; followers must match the leader exactly |
| **Freshness tag** | Proposal (ballot) numbers | Terms (one leader per term) |
| **How it's specified** | Core proven in papers; the practical pieces under-specified | Fully specified end to end, with a formal proof and reference code |
| **Membership changes** | Described abstractly; details vary by system | Built in and spelled out (joint consensus or single-server changes) |
| **Real implementations** | Chubby, Spanner; built by expert teams, famously hard | etcd, Consul, CockroachDB/TiKV, Kafka KRaft; many independent ones |
| **Flexibility ceiling** | Higher; leaderless and flexible-quorum variants extend the family | Lower by design; trades flexibility for clarity |

The fair verdict: Raft and Multi-Paxos give you the **same correctness and the same common-case speed**. Paxos is the more general, more flexible family but is notoriously easy to get subtly wrong because the practical pieces are under-specified. Raft constrains the design to produce a complete, teachable, implementable spec, which is why so many recent systems pick it. "Raft is better" is too strong. "Raft is easier to implement correctly; Paxos is more flexible" is the truth.

## Common misconceptions

**"Raft is faster than Paxos."** It is not. The authors deliberately matched Paxos's performance. If someone shows you a throughput win, they are comparing two specific *implementations*, not the algorithms.

**"Raft is more correct or safer."** Also no. Identical guarantees were a design requirement. The only intended improvement was readability.

**"Multi-Paxos is a single algorithm I can copy."** It is a family of design ideas with the hard machinery left as an exercise. Treating it as copy-paste code is how subtle bugs get in.

**"I should re-run Phase 1 for each command."** That defeats the entire point. Phase 1 runs once per leadership term; every following command uses only Phase 2.

**"I need Byzantine fault tolerance for my internal cluster."** You almost certainly do not. Inside your own data center, nodes crash; they do not lie. Crash-fault consensus is correct and far cheaper.

## Who uses what, and what they use it for

| System | Algorithm | What consensus is for |
|---|---|---|
| **etcd** | Raft | The consistent key-value store behind Kubernetes; all cluster state lives here |
| **HashiCorp Consul** | Raft | Service discovery, health checks, and a consistent config store |
| **CockroachDB / TiKV** | Raft (per data range) | Distributed SQL; each data shard is its own small Raft group |
| **Apache ZooKeeper** | ZAB (Paxos-like) | Coordination: locks, leader election, config, naming, ordered through one leader |
| **Google Chubby** | Paxos | A lock service and small-file store; one of the first big production Paxos systems |
| **Google Spanner** | Paxos (per shard) | Global SQL; each shard is a Paxos group replicated across data centers |
| **Apache Kafka (KRaft)** | Raft | Kafka 3.0+ replaced ZooKeeper with an internal Raft log for cluster metadata |

Notice the pattern across etcd, ZooKeeper, Chubby, and Consul: they are **coordination services**. Applications rarely run consensus directly. They lean on one of these for the few things that truly need agreement (who is the leader, what is the current config, who holds this lock) and keep their high-volume data path *outside* consensus.

> **Consensus is the town notary.** You do not notarize every email you send; that would be unbearably slow. You notarize only the handful of documents where everyone must later agree on the exact wording and order: the deed, the contract, the will. etcd, ZooKeeper, and Consul are the shared notary's office, so each app doesn't have to hire its own.

## A glimpse past the basics

You do not need these to build real systems, but knowing they exist sharpens your intuition.

**EPaxos (Egalitarian Paxos)** removes the single leader entirely, so no client is stuck paying a long round trip to a faraway leader. Its clever trick is **commutativity**: two commands commute if running them in either order gives the same result ("set x=1" and "set y=2" don't interfere; "set x=1" and "set x=2" do). When concurrent commands commute, EPaxos commits them fast without ordering them against each other. Only genuinely conflicting commands pay for ordering. The intuition: don't waste time ordering things whose order does not matter. The cost is real complexity in tracking those dependencies.

**Flexible Paxos** proved a sharper truth about quorums. Classic Paxos uses majorities because any two majorities overlap, and that overlap carries safety forward. Flexible Paxos showed the *only* overlap that matters is between Phase 1 (election) quorums and Phase 2 (commit) quorums, not between two commit quorums. So you can shrink the commit quorum for faster writes at the price of a larger, rarely used election quorum. Majorities were a convenient sufficient condition, not a necessary one.

**PBFT (Practical Byzantine Fault Tolerance)** handles nodes that *lie*. Everything above assumes crash faults: a node either behaves or stops. A **Byzantine fault** is worse; a bad node can send different stories to different peers and actively try to corrupt agreement. To tolerate `f` liars, PBFT needs `3f+1` total replicas (four nodes to survive one liar) and runs three all-to-all phases so the honest majority always out-votes the liars. It is far heavier than Raft or Paxos, which is why it lives mostly in **blockchains**, where mutually distrusting parties must still agree on one ledger.

## How to use this: a decision ladder

Consensus is powerful and expensive. Most features do not need it. Walk down this ladder and stop at the first rung that fits.

1. **Do you need it at all?** A single database primary (with replicas for reads and failover) already gives a consistent, ordered source of truth for free. Most CRUD apps live happily here and should *not* run their own consensus.
2. **Do you need agreement on a small piece of critical metadata?** Leader election, distributed locks, feature flags, cluster membership. These genuinely need consensus. Use an off-the-shelf service: **etcd, ZooKeeper, or Consul.** They expose simple primitives and have absorbed years of bug fixes.
3. **Do you need a consistent, sharded database across machines or regions?** Use a system that builds consensus in: **CockroachDB, Spanner, TiKV, or etcd**, rather than wiring raw Raft yourself.

Two rules to tape to your monitor:

- **Do not roll your own consensus.** This is the single most repeated advice in the field. Even Google's Chubby team reported that turning the Paxos paper into correct, fault-injected, production code was far harder than expected. It is a multi-year correctness project, not a sprint ticket.
- **Run an odd number of voting nodes (3 or 5).** It maximizes fault tolerance and avoids ties. Three nodes tolerate one failure; five tolerate two.

And budget for the price. Every committed decision needs a round trip to a *majority*. That means you cannot go faster than the latency to your median node (tens to hundreds of milliseconds per write across regions), you need that odd node count so a majority exists, and the system keeps working only while a majority is reachable. Lose the majority and writes correctly *stop* rather than risk split-brain. This is the CP corner of CAP made concrete.

> **A concrete win.** A team wants "only one worker runs the nightly billing job." The tempting wrong answer is a custom heartbeat-and-flag scheme in the app database, with a dozen subtle failure cases. The right answer is one line: `acquire("billing-leader", ttl=15s)` against etcd or ZooKeeper. Whoever holds the lease runs the job; if that node dies, the lease expires and another picks it up. You consumed consensus through an API instead of reimplementing leader election.

## Conclusion

Here is the one thing to remember: Multi-Paxos and Raft are two roads to the same destination, an agreed-upon replicated log committed in a single majority round trip when a stable leader is in charge. Raft trades flexibility for a complete, readable spec; Paxos is more general but easier to get subtly wrong. And the punchline is that you should almost never implement either. Reach for etcd, ZooKeeper, or Consul for coordination, or a consensus-backed database for data, and spend your consensus budget only on the few decisions where everyone truly must agree.

The deeper question lurking under all of this is the one CAP keeps whispering: when a network partition splits your cluster in two, and a majority cannot be formed, the system chooses to *stop accepting writes* rather than lie. Why is "correctly refusing to answer" sometimes the most reliable thing a database can do? That is the [consistency-versus-availability tradeoff](/blog/distributed-systems/16-the-cap-theorem-and-pacelc), and it is where this story goes next.
