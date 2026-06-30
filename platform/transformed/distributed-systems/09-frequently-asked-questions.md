---
title: "Raft vs Paxos and 16 Consensus Questions, Answered Plainly"
metaTitle: "Raft vs Paxos: Consensus Questions Answered"
description: "Raft vs Paxos, quorums, split-brain, and partitions explained in plain language. The consensus answers engineers actually search for, without the math."
keywords:
  - raft vs paxos
  - distributed consensus
  - what is a quorum
  - why odd number of nodes
  - split brain
  - network partition consensus
  - replicated state machine
  - FLP impossibility
  - leader election
  - how many nodes for fault tolerance
  - committed entry raft
  - byzantine fault tolerance
  - CAP theorem consistency
  - raft heartbeat election timeout
topic: distributed-systems
topicTitle: Distributed Systems
category: Engineering
date: '2026-06-21'
order: 8
icon: "\U0001F310"
faq:
  - q: "Should I use Raft or Paxos for a new system?"
    a: "Use a battle-tested Raft library like etcd's or HashiCorp's. Raft was designed to be understandable and operable, and the tooling around it is rich. Only choose Paxos if you're adopting a system already built on it."
  - q: "Why do consensus systems need a majority instead of all nodes?"
    a: "Requiring all nodes means one slow or failed machine halts everything. A majority lets the cluster keep deciding while a minority is down, and any two majorities always overlap on at least one node, which prevents conflicting decisions."
  - q: "How many nodes do I need to tolerate failures?"
    a: "To survive f failures you need 2f+1 nodes. So 3 nodes tolerate 1 failure and 5 tolerate 2. These are the common production sizes."
  - q: "Why do consensus clusters use odd numbers of nodes?"
    a: "An even extra node raises the majority threshold without adding fault tolerance. A 4-node cluster tolerates the same single failure as a 3-node one but has more machines that can break, so odd sizes give better resilience per node."
  - q: "Does consensus survive a network partition?"
    a: "Safety always survives, so you never get conflicting commits. Availability does not: only the side holding a majority keeps making progress, while the minority side pauses writes until the partition heals."
  - q: "If the FLP result proves consensus is impossible, how do real systems work?"
    a: "FLP only rules out a deterministic guarantee of termination in a fully asynchronous network. Real systems add timeouts and randomness, assuming the network is usually timely. They never break safety; they only risk a brief stall in rare conditions."
author: Pritesh Yadav (priteshyadav444)
transformed: true
linked: true
sources:
  - https://en.wikipedia.org/wiki/Raft_(algorithm)
  - https://en.wikipedia.org/wiki/Paxos_(computer_science)
  - https://en.wikipedia.org/wiki/Consensus_(computer_science)
---

A handful of machines, scattered across data centers, somehow agree on the exact same list of facts in the exact same order, even while some of them crash, freeze, or fall off the network. That quiet miracle is what keeps your bank balance correct and your database from inventing two versions of the truth.

The machinery behind it has a reputation for being impenetrable. It isn't. Most of [distributed consensus](/blog/distributed-systems/02-the-consensus-problem) comes down to one idea repeated in different costumes: get a majority to agree on an ordered log. This article answers the questions engineers actually type into a search bar, in plain words, no proofs required.

## Why this matters

If you run a database, a queue, a config store, or anything that must not lose data when a server dies, you are relying on consensus whether you wrote it or not. etcd, ZooKeeper, Consul, CockroachDB, and Spanner all live or die by these rules.

Get the mental model right and a dozen confusing operational decisions become obvious: how many nodes to provision, why a "4-node cluster for extra safety" is a trap, why one side of a partition goes read-only, and why you should never write your own consensus from scratch. Get it wrong and you'll either over-provision, under-protect, or chase phantom "split-brain" bugs that the protocol was specifically built to prevent.

Here are the answers, grouped by the questions people ask most.

## Raft or Paxos: which should you actually use?

**Reach for a proven Raft library.** etcd's implementation and HashiCorp's are both battle-tested, and Raft was explicitly designed to be understandable and operable. The surrounding ecosystem of tools, docs, and war stories is large.

[Plain Paxos](/blog/distributed-systems/06-paxos-the-original-consensus-algorithm) is famously hard to implement correctly. The version people actually deploy is **Multi-Paxos**, which ends up structurally close to Raft anyway, a stable leader feeding a replicated log.

Choose Paxos only when you're adopting a system already built on it (Google's Spanner, for instance) or you need a specific variant like EPaxos. Either way, the real rule is simpler: **don't roll your own.** Use a battle-tested implementation. Consensus is one of those areas where "I'll just write a quick version" has ended careers.

### Is Raft just Paxos with a friendlier face?

Roughly, yes, and that's not an insult. They solve the same problem on the same majority-quorum foundation, and Multi-Paxos and Raft converge on the same "stable leader plus replicated log" shape.

The difference is framing. Raft prescribes a single strong leader, a structured log with a strict matching rule, and explicit membership changes, all chosen for clarity. Classic Paxos is more minimal and general but leaves [leader election](/blog/distributed-systems/04-raft-leader-election) and the multi-decision machinery as an exercise for the reader. That's exactly why real Paxos deployments end up reinventing most of what Raft already spells out.

## The replicated log: the one idea under everything

Every explanation keeps circling back to "the log" for a reason. It's the core trick.

A [**replicated state machine**](/blog/distributed-systems/03-replicated-state-machines-the-log) works like this: if every node runs the same deterministic program and applies the exact same commands in the exact same order, every node ends up in an identical state. Think of it as several people following the same recipe, step by step, in the same sequence. They all bake the same cake.

So the only thing the cluster ever has to agree on is the **order of commands**, which is just the contents of an append-only log. Both Raft and Paxos are, at heart, machines for agreeing on a log. Everything else is plumbing around that.

## Quorums: why a majority, and why odd numbers

### Why a majority and not all nodes?

Requiring *all* nodes to respond means a single failure, or even one slow node, stops all progress. That's zero fault tolerance, the opposite of what you wanted.

A majority lets the cluster keep deciding while a minority is down. Safety still holds because of a beautiful little fact: **any two majorities must share at least one node.** That overlapping node remembers the previous decision and refuses to let a second, conflicting one win.

### How many nodes do you need?

The formula is **2f + 1** to tolerate *f* failures:

- **3 nodes** tolerate **1** failure
- **5 nodes** tolerate **2** failures

Three is the cheapest cluster that survives any single failure. Five buys more resilience and lets you take one node down for maintenance while still surviving an unplanned failure. These two sizes cover the vast majority of production clusters.

### Why odd numbers?

Because an even extra node gives you no extra fault tolerance but raises the majority you need.

A **4-node cluster** still tolerates only 1 failure, because its majority is 3, exactly the same as a 3-node cluster, yet you now have one more machine that can break and one more tie waiting to happen. Odd sizes give the best resilience per node and avoid tie-prone votes. Adding the even node literally makes things slightly worse.

## Failures, partitions, and the dreaded split-brain

### What if two leaders exist at once?

It can briefly happen. Imagine an old leader gets cut off by a network hiccup and doesn't yet know a new one was elected.

It's still safe, thanks to ever-increasing **terms** (also called epochs). The new leader works in a higher term. The instant the old leader contacts any node carrying the newer term, it learns it's stale and steps down. Critically, the old leader can't commit anything, because committing needs a majority, and the majority has already moved on. Two leaders, zero damage.

### Does consensus survive a network partition?

**Safety always survives.** You will never get split-brain with two conflicting commits.

**Availability does not always survive.** Only the side of the partition that still holds a majority can make progress. The minority side pauses writes until the partition heals. This is the [**CAP trade-off**](/blog/distributed-systems/16-the-cap-theorem-and-pacelc) in the flesh: when forced to choose between consistency and availability, these systems choose consistency every time.

### How does the cluster change membership without breaking?

Naively swapping the member list is dangerous. For a brief moment, the old set and the new set could each form their own majority and elect rival leaders, real split-brain.

Raft prevents this with **joint consensus**: a transitional configuration where every decision needs a majority from *both* the old and new sets at once. Because there's never a window with two disjoint majorities, two rival leaders can't emerge. Once everyone has acknowledged the joint config, the cluster slides over to the new one.

## Heartbeats, elections, and commitment

### What's a heartbeat versus an election timeout?

The **heartbeat** is the leader's periodic "I'm alive" message, an empty AppendEntries call, that keeps followers calm.

The **election timeout** is how long a follower waits with no heartbeat before concluding the leader is gone and becoming a candidate. The clever part: this timeout is **randomized per node**, so when a leader dies, one follower usually times out first and wins cleanly, instead of everyone shouting "I'll be leader" at once and splitting the vote.

### When is an entry "committed," and can it ever be lost?

In Raft, an entry is **committed** once the current leader has replicated it to a **majority** of servers. After that it's permanent. The voting rules guarantee that every future leader already has it, so it can never be overwritten or lost.

**Uncommitted** entries, ones that reached only a minority, *can* be discarded if leadership changes. That's correct behavior, not a bug: no client was ever told those writes succeeded, so dropping them breaks no promises.

### Why does one leader handle all writes? Isn't that a bottleneck?

A single leader makes ordering trivial to reason about, which is the entire point of Raft's design.

Yes, it's a throughput ceiling. Systems scale around it in well-worn ways:

- **Sharding** into many Raft groups, each with its own leader
- **Batching and pipelining** entries to amortize the cost
- **Serving some reads from followers** using leases

Leaderless variants like EPaxos remove the single leader entirely, but you pay for it in complexity.

## Common misconceptions

- **"FLP proves consensus is impossible, so this is all theoretically broken."** The FLP result only says no *deterministic* algorithm can *guarantee* termination in a *fully asynchronous* network where you can never distinguish "crashed" from "merely slow." Real systems sidestep it with timeouts and randomness, assuming the network is *usually* timely. They never violate safety; they only risk a brief stall in pathological conditions, an entirely acceptable trade.

- **"More nodes always means more safety."** Adding an even node can hurt, as the 4-node example shows. Resilience comes from the 2f+1 math, not from raw machine count.

- **"A second leader means split-brain corruption."** Terms and majority quorums make a stale leader harmless. It can't commit, and it steps down the moment it sees a newer term.

- **"Raft and Paxos protect against malicious nodes."** They don't. Both assume the **crash-fault (non-Byzantine)** model: nodes may stop, slow down, or restart, but they never lie or send conflicting messages on purpose. Defending against malicious or buggy-Byzantine participants needs **Byzantine Fault Tolerant** protocols like PBFT (and the mechanisms behind many blockchains), which demand more nodes (**3f + 1**) and far more communication.

- **"I should always add consensus for safety."** Not if you don't need high availability or multi-machine durability. A single database is simpler and consistent. The catch is that it's a single point of failure: when it goes down, everything goes down, and a crash can lose recent writes. Consensus exists precisely to replicate that database across machines so it survives failures without ever serving conflicting data. Add it when you need it, not as a reflex.

## Safety versus liveness: which one wins?

Two words run through every design decision:

- **Safety** means "nothing bad ever happens," as in no two conflicting decisions.
- **Liveness** means "something good eventually happens," as in a decision actually gets made.

Consensus protocols **always prioritize safety.** If forced to choose, they would rather stop making progress than risk a wrong agreement. That single rule explains the behavior you see everywhere: a minority partition halts instead of inventing its own answer.

## How to use this

1. **Default to a proven Raft library.** Use etcd's or HashiCorp's. Never write consensus from scratch for production.
2. **Size with 2f + 1.** Pick 3 nodes for "survive one failure" or 5 for "survive two, or one while one is in maintenance."
3. **Always use odd node counts.** Even numbers cost you machines without buying tolerance.
4. **Spread nodes across failure domains.** Different racks, zones, or regions, so one outage can't take out your majority.
5. **Expect the minority side to go read-only during a partition.** That's the system protecting your data, not failing. Design clients to tolerate it.
6. **Scale a hot leader with sharding and batching** before reaching for exotic leaderless designs.
7. **Reach for BFT only against untrusted participants.** If every node is yours and merely crash-prone, crash-fault consensus is enough and far cheaper.
8. **Keep your logs bounded with snapshots.** Otherwise the log grows forever.

That last point deserves its own note.

### Why snapshots exist

The log grows without end unless you do something. A **snapshot** captures the state machine's current state so all the older log entries that produced it can be thrown away, a process called **log compaction**. This keeps disk usage and replay times under control.

Snapshots have a bonus: a brand-new or badly lagging server can catch up almost instantly by installing the snapshot, instead of replaying the entire history from the beginning of time.

## Conclusion

If you remember one thing, make it this: **consensus is just a majority of machines agreeing on the order of an append-only log, and it will always choose to stop rather than be wrong.** Quorums, terms, heartbeats, and joint consensus are all in service of that single promise.

Once that clicks, a natural next question appears. These protocols assume your nodes are honest but crash-prone. What changes when some of them might actively lie, as on a public blockchain or across organizations that don't trust each other? That's the world of Byzantine Fault Tolerance, where the node count jumps to 3f+1 and the real adversary isn't failure, it's deception. It's a fascinating place to head next.
