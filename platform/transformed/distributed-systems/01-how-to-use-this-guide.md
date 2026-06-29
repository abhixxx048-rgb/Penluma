---
title: "Consensus in Distributed Systems, Explained Simply"
metaTitle: "Distributed Consensus Explained Simply"
description: "Consensus is how separate computers agree on one decision even when some crash. Here's why it's the hardest problem in distributed systems, in plain English."
keywords:
  - distributed consensus
  - consensus algorithm
  - Raft consensus
  - Paxos algorithm
  - replicated state machine
  - distributed systems agreement
  - FLP impossibility
  - leader election
  - quorum majority
  - how does Raft work
  - consensus explained simply
  - etcd ZooKeeper Spanner
topic: distributed-systems
topicTitle: Distributed Systems
category: Engineering
date: '2026-06-21'
order: 0
icon: "\U0001F310"
author: Pritesh Yadav (priteshyadav444)
transformed: true
sources: []
faq:
  - q: What is consensus in distributed systems?
    a: Consensus is the problem of getting a group of independent computers to agree on a single value or decision - like the order of events - even when some of them crash or lose contact. It's the foundation under databases, lock services, and configuration stores.
  - q: Why is distributed consensus so hard?
    a: Because networks can delay, drop, or reorder messages, and a crashed machine looks exactly like a slow one. There's no reliable way to tell "dead" from "just quiet," so algorithms must stay correct without ever knowing the full truth.
  - q: What is the difference between Raft and Paxos?
    a: Both solve consensus, but Raft was designed to be understandable, organizing everything around a single elected leader and a replicated log. Paxos is the older, more theoretical foundation that's powerful but famously hard to reason about.
  - q: What does FLP impossibility mean?
    a: The FLP result proves that in a fully asynchronous network where even one node can fail, no algorithm can guarantee it will always reach consensus. Real systems work around it by assuming the network is usually well-behaved.
  - q: Why does consensus need a majority?
    a: Requiring agreement from a majority (a quorum) means any two decisions must share at least one node, which prevents the cluster from splitting into two groups that each think they're in charge.
  - q: Where is consensus actually used in production?
    a: Systems like etcd, ZooKeeper, and Google Spanner use consensus to keep replicated data consistent. They power Kubernetes, service discovery, distributed locks, and globally consistent databases.
---

Imagine five computers in five different buildings, and they all need to agree on one thing: who holds the lock right now. Not "mostly agree." Not "agree until the network hiccups." Agree, perfectly, even if two of them crash mid-sentence and the cables between them drop messages at the worst possible moment.

That problem has a name - **consensus** - and it is the single hardest thing in distributed systems. It also happens to be the thing almost every modern backend quietly depends on.

## Why this matters

When you run more than one server, you trade a single point of failure for a single point of confusion. Now two machines can disagree about what the truth is.

Your database has replicas - which one is authoritative? Your service mesh needs a leader - who is it? Your config store just got two conflicting writes - which one wins?

Every one of those questions is a consensus question. Get it wrong and you get the nightmare scenarios: two nodes both convinced they're the leader, a payment counted twice, a cluster that splits into two halves that each keep operating as if the other is dead.

Get it right, and something remarkable happens. **Your system stays correct and available while its parts fail underneath it.** That's the whole promise of distributed computing, and consensus is what makes it real. This is why people call it the crown jewel of the field - databases, lock services, schedulers, and configuration stores all rest on it.

## What consensus actually means

Strip away the jargon and consensus asks for one decision that everyone can rely on. Formally, a correct solution has to deliver three things at once:

- **Agreement** - no two nodes ever decide on different values. This is the non-negotiable one.
- **Validity** - the value they agree on was actually proposed by someone. They can't just invent an answer.
- **Termination** - they eventually decide. An algorithm that's "always safe" by never deciding anything is useless.

Here's the catch that makes it hard. The network can lose, delay, or reorder your messages. And **a machine that has gone silent is indistinguishable from one that is merely slow.** You send a message, you hear nothing back. Is the node dead? Overloaded? Is the reply on its way right now? You genuinely cannot tell - and you have to stay correct anyway.

### A quick analogy

Picture a group chat where messages sometimes arrive hours late, sometimes never, and friends occasionally drop offline without warning. Now try to get everyone to commit to one restaurant - with an ironclad guarantee that no two people show up at different places. That awkward, uncertain coordination is consensus. The algorithms in this series are just very disciplined ways of playing that game.

## Why a majority is the magic number

The clever move at the heart of nearly every consensus algorithm is the **quorum** - requiring agreement from a majority of nodes, not all of them, and not just a few.

Why a majority specifically? Because **any two majorities of the same group must overlap in at least one node.** If three out of five nodes approve decision A, and later three out of five approve decision B, at least one node was in both groups - and it remembers. That single shared witness is what stops the cluster from quietly splitting into two factions that each believe they're in charge.

Requiring a majority (rather than everyone) is also what lets the system keep going when machines die. Five nodes can lose two and still form a majority of three. You don't need everyone present - you need more than half.

## The hard limit nobody can beat

There's a famous result called **FLP impossibility** (named after Fischer, Lynch, and Paterson) that's worth knowing because it humbles every consensus design.

It proves that in a fully asynchronous network - one with no guarantees about timing - where even a single node can fail, **no algorithm can guarantee it will always reach consensus.** There is always some unlucky sequence of delays that stalls it forever.

This sounds like a dead end. It isn't. Real systems sidestep it by assuming the network is *usually* well-behaved: messages mostly arrive, clocks mostly tick at similar rates. Algorithms like Raft and Paxos guarantee they'll never give a *wrong* answer (safety), and they'll make progress whenever the network is reasonably healthy (liveness). They trade "always terminates" for "always correct, and terminates in practice." That's the bargain the whole field is built on.

## The one trick that makes it all tractable: the log

Agreeing on a single value is hard enough. Real systems need to agree on a never-ending stream of decisions. How do you scale from one agreement to millions?

The answer is one of the most elegant ideas in computer science: the **replicated state machine**.

The insight is this. If every node starts in the same state and applies **the same commands in the same order**, they will end up identical. Always. So you don't need to replicate the *data* - you replicate the *list of commands*, in order. That ordered list is called the **log**.

Think of it like a recipe. Hand the exact same recipe, step by step, to ten cooks in ten kitchens, and they all produce the same dish. Nobody has to compare the finished plates - they just have to agree on the recipe.

Suddenly the whole problem collapses into something cleaner: **consensus is just agreeing, one entry at a time, on what the next line of the shared log should be.** Master that, and you can replicate a database, a queue, a lock service - anything.

## The algorithms that ship this for real

Two names dominate this space, and they make a fascinating contrast.

**Raft** was designed with an unusual goal: be *understandable*. It organizes everything around electing a single leader for a period of time (a "term"), so there's always one clear source of truth for the log. The leader copies entries to followers, commits them once a majority has them, and a new election kicks in the moment the leader goes quiet. Most of the time, when you reach for consensus today, you reach for something Raft-shaped.

**Paxos** is the original - older, deeply influential, and famously hard to wrap your head around. It works through proposers and acceptors performing a careful two-phase "prepare, then accept" dance. Raft was, in many ways, a reaction to how painful Paxos is to teach and implement correctly.

And this isn't academic. These algorithms run underneath tools you may already use:

- **etcd** (Raft) is the brain behind Kubernetes, storing cluster state.
- **ZooKeeper** coordinates countless distributed systems with a Paxos-like protocol.
- **Google Spanner** uses Paxos to offer a globally distributed database that still behaves consistently.

## Common misconceptions

A few myths trip up almost everyone the first time:

- **"More servers means more reliability, automatically."** Not without consensus. More servers without coordination just means more ways to disagree. Reliability comes from *agreeing*, not from quantity.
- **"If a node stops responding, it has crashed."** You can never be sure. It might be slow, or the reply might be in flight. Treating "silent" as "dead" is how split-brain bugs are born.
- **"You need every node to agree."** You need a majority. Demanding unanimity means a single dead node freezes the entire system.
- **"Consensus makes everything slow, so avoid it."** It does add coordination cost, so you use it for the decisions that must be consistent - leadership, commits, config - not for every read. Used well, it's a scalpel, not a sledgehammer.

## How to use this guide

This is **Series 2: Consensus**. It assumes you've met the basics from Series 1 (Foundations): nodes, messages, latency, replication, failure models, and why "just use one server" eventually breaks. We build on that rather than re-teaching it.

The six sections are ordered so each one earns the next:

1. **The Consensus Problem** - what agreement really requires, why a majority is magic, and why FLP says perfection is impossible.
2. **Replicated State Machines and the Log** - the universal trick: same commands, same order, identical nodes. Consensus reduces to agreeing on a log.
3. **Raft - Leader Election** - picking one leader per term so there's a single source of truth.
4. **Raft - Log Replication, Safety and Membership** - how the leader copies entries, commits by majority, stays safe, and changes cluster membership without breaking.
5. **Paxos - The Original Consensus Algorithm** - proposers, acceptors, and the two-phase prepare/accept dance.
6. **Multi-Paxos, Raft vs Paxos and the Real World** - running Paxos for a stream of decisions, an honest comparison, and the systems that ship it.

A few practical tips:

- **Read in order on your first pass.** The narrative flows: the problem, then the log abstraction, then Raft (election before replication), then Paxos, then the real world.
- **Short on time?** Read sections 1–4 (Raft) for a complete working mental model, then skim 5–6.
- **Use the supporting material as you go** - the Glossary for unfamiliar terms, the FAQ when something feels contradictory, and the Cheat Sheet to revise before an interview or a design review.
- **Watch for the callouts** - *key* ideas (the one thing to remember), *tips* (practical guidance), and *warnings* (the traps that bite real engineers).

## Conclusion

If you take one thing from this entire series, make it this: **consensus turns a pile of unreliable machines into one reliable system by getting them to agree on an ordered log of decisions - and it does this without ever truly knowing which machines are alive.**

That last part is the quiet genius of it. The whole field is built on staying correct in the face of permanent uncertainty.

Which raises the question we'll spend the next sections answering: if you can never be sure a silent node is dead, how do you ever safely elect a single leader - without accidentally electing two? That's where Raft begins.
