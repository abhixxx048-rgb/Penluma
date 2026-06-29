---
title: "Consensus, Decoded: Raft & Paxos Without the Pain"
metaTitle: "Consensus Explained: Raft vs Paxos"
description: "A clear guide to distributed consensus: how Raft and Paxos keep replicas in sync with majority quorums, why you need 3 or 5 nodes, and how to avoid split-brain."
keywords:
  - distributed consensus
  - raft vs paxos
  - raft consensus algorithm
  - paxos explained
  - majority quorum
  - replicated state machine
  - quorum size 2f+1
  - leader election
  - distributed systems consensus
  - etcd raft
  - how raft works
  - FLP impossibility
  - split brain prevention
  - consensus latency
topic: distributed-systems
topicTitle: Distributed Systems
category: Engineering
date: '2026-06-21'
order: 9
icon: "\U0001F310"
faq:
  - q: What is consensus in distributed systems?
    a: Consensus is the problem of getting a group of independent machines to agree on a single ordered list of commands, even when some crash or the network splits. That shared agreement lets identical copies of a system stay perfectly in sync.
  - q: How many nodes do I need for consensus?
    a: To tolerate f failures you need 2f+1 nodes. Three nodes survive one failure, five survive two. Always use an odd number, because an even count raises the bar for agreement without buying extra fault tolerance.
  - q: Is Raft better than Paxos?
    a: Neither is strictly better. Raft is prescriptive and built to be understood, with one strong leader and a structured log. Paxos is minimal and general but leaves leader election and multi-value agreement up to you. In practice both converge on the same design.
  - q: What is a quorum and why does it work?
    a: A quorum is a strict majority of nodes (⌊n/2⌋ + 1). It works because any two majorities must share at least one node, so two conflicting decisions can never both win.
  - q: Can consensus algorithms handle malicious nodes?
    a: Standard Raft and Paxos are crash-fault tolerant only. They assume nodes may stop but never lie. For untrusted or malicious nodes you need Byzantine fault tolerance, such as PBFT or blockchain consensus.
  - q: Should I write my own consensus algorithm?
    a: No. Use a proven library like etcd or HashiCorp Raft. Subtle bugs in election or commit logic cause silent data loss that ordinary tests rarely catch.
author: Pritesh Yadav (priteshyadav444)
transformed: true
sources:
  - https://en.wikipedia.org/wiki/Consensus_(computer_science)
  - https://en.wikipedia.org/wiki/Raft_(algorithm)
  - https://en.wikipedia.org/wiki/Paxos_(computer_science)
---

Imagine five copies of your database, running in three different cities, all taking writes at the same time. A network cable gets cut. Two of them can't see the other three. Now: who is allowed to keep accepting writes, and who has to wait?

Get that answer wrong and you end up with two versions of reality that silently disagree forever. Get it right, and your system survives crashes, partitions, and bad weather without ever losing a confirmed write. The thing that gets it right is called **consensus**, and it is the quiet engine underneath Kubernetes, Spanner, CockroachDB, and almost every system you trust with important data.

## Why this matters

Any system that keeps more than one copy of its data has to answer a hard question: when the copies disagree, which one is correct?

You can't just trust the "first" one or the "newest" one. Clocks drift. Messages arrive out of order. A machine that looks dead might just be slow, and then come back to life mid-sentence. Without a disciplined way to agree, you get **split-brain**: two halves of your cluster both believing they're in charge, both accepting writes, quietly corrupting each other.

Consensus is the agreed-upon set of rules that prevents this. Understanding it helps you:

- Pick the right number of nodes (and stop guessing).
- Reason about why writes get slower across data centers.
- Know what your database actually guarantees when a region goes dark.
- Avoid the single most expensive mistake in this space: rolling your own.

The whole field really collapses to one sentence.

> **Consensus = agree on one ordered log of commands, using a majority quorum, so identical copies of a system stay in lockstep despite crashes and network splits.**

Everything below is just unpacking that sentence.

## The replicated log: the one idea behind everything

Picture every server in your cluster as a person copying down a list of instructions, line by line: *set X to 5, add 10 to Y, delete Z*. If every person writes down the exact same instructions in the exact same order, and they all start from the same blank page, they will all end up in identical states. Forever.

That's a **replicated state machine**. The "state machine" is your database (or queue, or config store). The trick is that you never have to copy the *state* itself — you just have to make sure everyone agrees on the *log of commands* and the *order*.

So the giant problem of "keep N machines identical" shrinks to a smaller problem: **get everyone to agree on the next line of the log.** Solve that one repeatedly and you've solved the whole thing. This is why both Raft and Paxos, despite looking different, are really doing the same job.

## What "agreement" actually has to guarantee

A working consensus algorithm has to promise three things:

- **Agreement** — no two healthy nodes ever decide on different values. (This is *safety*: nothing bad happens.)
- **Validity** — the value they agree on was actually proposed by someone, not invented out of thin air. (Also safety.)
- **Termination** — every healthy node eventually decides something. (This is *liveness*: something good eventually happens.)

Here's the catch, and it's a famous one. The **FLP result** (named after Fischer, Lynch, and Paterson) proved that in a fully asynchronous network where even one node can crash, *no* deterministic algorithm can guarantee all three at once. There is always some unlucky timing that makes the system hang.

That sounds fatal. It isn't. The escape hatch is that real systems **never sacrifice safety** — they will happily pause forever rather than decide wrong — and they get practical liveness by adding **timeouts and a little randomness**. So in the rare bad case the system stalls briefly, then a timeout fires, and it makes progress. It just can't *promise* a deadline. That tradeoff — "always correct, almost always live" — is the foundation of everything that follows.

## Why majorities: the overlap trick

The mechanism that makes consensus possible is the **quorum** — a strict majority of nodes, which is ⌊n/2⌋ + 1.

For 3 nodes, a quorum is 2. For 5 nodes, it's 3.

Why a majority specifically? Because of one beautiful property: **any two majorities must overlap in at least one node.** Think about it with 5 nodes. Any group of 3 and any other group of 3 are forced to share at least one member — there simply aren't enough nodes to form two disjoint majorities.

That shared node is the referee. If one majority already agreed "the value is A," the overlapping node *remembers* that, and refuses to let a second majority agree "the value is B." Two conflicting decisions physically cannot both gather a majority. That's the entire safety guarantee, and it's just counting.

From the overlap rule comes the famous sizing formula:

- To tolerate **f** failures, you need **2f + 1** nodes.
- 3 nodes tolerate 1 failure. 5 nodes tolerate 2. 7 nodes tolerate 3.

And a practical corollary: **always use an odd number.** Going from 3 nodes to 4 doesn't help — you still only tolerate 1 failure (a quorum of 4 is 3, so losing 2 of 4 breaks you), but now you have one more machine that can fail. The even node is pure downside.

## Raft: consensus you can actually read

Paxos came first and is notoriously hard to understand. **Raft** was designed years later with an explicit goal: be understandable. It gets there by being prescriptive — it tells you exactly how to run an election and manage the log, instead of leaving it as an exercise.

### The three roles

At any moment, every server is in one of three states:

- **Follower** — the default. Passive. It just answers requests and waits to hear from the leader. If it doesn't hear a heartbeat in time, it suspects the leader is dead and starts an election.
- **Candidate** — a follower that timed out. It bumps the **term** number, votes for itself, and asks everyone else for their vote. Win a majority and it becomes leader.
- **Leader** — the single boss. Every client write goes through it. It sends regular heartbeats so followers stay calm, and it replicates the log to everyone.

There is **at most one leader per term**, which is what kills split-brain. The term is an ever-increasing counter; a leader from an old term that wakes up late immediately notices a higher term in someone's reply and steps down.

### Just two messages

Raft's whole conversation runs on two remote calls:

- **RequestVote** — sent by a candidate during an election. You grant your vote only if you haven't already voted this term *and* the candidate's log is at least as up-to-date as yours. That second condition is crucial: it stops a node with stale data from ever becoming leader.
- **AppendEntries** — sent by the leader to replicate log entries (an empty one is just a heartbeat). A follower accepts it only if the term is current *and* the entry just before the new ones matches in both index and term. That consistency check is what keeps every log identical.

### What "committed" means

An entry is **committed** once the current leader has replicated it to a majority. After that, it is durable — it will survive in every future leader's log, no matter who crashes. Raft guarantees this with **leader completeness**: because a new leader needs an up-to-date log to win its election, it can never be missing a committed entry.

Two more pieces round it out. **Joint consensus** safely changes cluster membership by briefly requiring *both* the old and new majorities to agree, so you can't accidentally create two disjoint quorums during the swap. And **snapshots** compact a log that would otherwise grow forever, and let a brand-new node catch up by loading a snapshot instead of replaying years of history.

## Paxos: the minimal core

**Paxos** solves the same problem with fewer rules and more generality. The classic version agrees on a single value in two phases:

1. **Prepare / Promise.** A proposer picks a ballot number N and asks acceptors to "promise to ignore anything numbered below N." Each acceptor promises — and importantly, reports back any value it has *already* accepted.
2. **Accept / Accepted.** The proposer asks acceptors to accept value V at ballot N. An acceptor agrees as long as it hasn't since promised a higher number. Once a majority accepts, the value is **chosen**.

The safety magic lives in one rule:

> If any acceptor has already accepted a value, a new proposer must **re-propose that same value** — specifically the one with the highest ballot it learned about in Phase 1.

That single rule is what prevents two different values from ever being chosen. A new proposer isn't free to push its own idea if the cluster has already started leaning one way; it's forced to carry the existing choice forward.

Paxos splits the work into roles: the **proposer** drives, the **acceptor** votes, and the **learner** finds out the result. And just like Raft, nobody runs the full protocol forever. **Multi-Paxos** elects a stable leader once and then skips Phase 1 for every subsequent slot, so a steady-state commit costs a single round trip — exactly like Raft.

## Raft vs Paxos: same mountain, different trail

People love to frame this as a rivalry. It mostly isn't.

- They solve the **same problem** on the **same majority-quorum foundation**, and both reduce to agreeing on a log.
- **Raft** is prescriptive: one strong leader, a structured log, designed so a human can hold the whole thing in their head.
- **Paxos** is minimal and general — leaderless in theory — but it leaves leader election and multi-value agreement as do-it-yourself work.
- In real deployments, **Multi-Paxos and Raft converge** on the same shape: a stable leader replicating a log.
- The increasing number that exposes a stale leader has three names for the same idea: **term** (Raft) = **epoch** = **ballot** (Paxos).

One shared limitation matters a lot: **both are crash-fault tolerant only.** They assume a node may stop, but never *lie*. If a node can send malicious or contradictory messages, you've left their world entirely and need **Byzantine** fault tolerance (PBFT, blockchain-style consensus). That's a different, more expensive game.

## Where this runs in the real world

You're already depending on these algorithms, probably right now:

- **etcd** (Raft) — the config and state store behind Kubernetes. When your cluster "remembers" anything, this is where it lives.
- **Consul** (Raft) — service discovery, configuration, and distributed locks.
- **CockroachDB / TiKV** (Raft, one group per shard) — distributed SQL and key-value stores.
- **ZooKeeper** (ZAB, a Raft-like protocol) — coordination, locks, and leader election for countless big-data systems.
- **Google Spanner / Chubby** ((Multi-)Paxos) — a globally distributed database and the lock service it grew from.
- **PBFT and blockchains** (Byzantine consensus) — agreement among nodes that don't trust each other.

## Common misconceptions

**"More nodes means more reliability."** Up to a point. Past 5 or 7 nodes, every write still needs a majority to acknowledge, so adding nodes makes writes *slower* without meaningfully improving durability. The fix for scale is sharding into many consensus groups, not one giant group.

**"Consensus makes my system faster."** It does the opposite. Consensus trades latency for correctness. Every committed decision costs at least one majority round trip. It buys you safety, not speed.

**"During a partition, both sides keep working."** No. Only the side with a majority makes progress. The minority side deliberately pauses — it chooses consistency over availability rather than risk a conflicting decision.

**"An even number of nodes is safer than odd."** A 4-node cluster tolerates the same single failure as a 3-node one, with more hardware to break. Odd numbers are the sweet spot.

**"I can write a quick consensus layer myself."** This is the costly one. The edge cases around elections and commit safety are exactly the ones tests miss, and the failure mode is silent data loss.

## How to use this

1. **Default to 3 nodes** to survive one failure. Step up to **5** when you need to survive two failures, or one failure *during* planned maintenance. Don't go past 7 in a single group.
2. **Always pick an odd number.** Treat an even count as a configuration smell.
3. **Never roll your own.** Reach for a battle-tested library — etcd's Raft or HashiCorp's Raft. This is not where you want to be original.
4. **Budget for a majority round trip on every write.** If your nodes span data centers, you pay WAN latency on each commit. Keep the quorum geographically tight, or knowingly accept the cost.
5. **Scale reads and writes separately.** Add follower reads and leader leases to spread out reads; **shard into multiple consensus groups** to spread out writes.
6. **Cap the log with snapshots.** Bootstrap new nodes from a snapshot rather than replaying the entire history.
7. **Decide your partition behavior on purpose.** Know that the minority side stops. If your business can't tolerate that pause, you have an architecture conversation to have *before* the outage, not during it.

## Conclusion

Strip away the jargon and consensus is one stubborn idea: **make a majority agree on the next line of a shared log, and never let two disagreeing majorities both win.** Quorum overlap guarantees it. Raft and Paxos are just two well-worn paths up the same mountain.

The single thing worth remembering: consensus buys you *correctness under failure*, and it pays for it in *latency*. Once you internalize that trade, most distributed-systems design decisions get a lot clearer.

And here's the thread worth pulling next. Every algorithm above assumes nodes might *die* but never *lie*. The moment you drop that assumption — untrusted participants, adversarial networks, real money on the line — you enter the strange and fascinating world of Byzantine fault tolerance, where agreement is still possible but the math, and the cost, change completely.
