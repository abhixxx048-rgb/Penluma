---
title: "Distributed Systems Glossary: 40 Terms, Made Simple"
metaTitle: "Distributed Systems Glossary (Plain English)"
description: "A plain-English distributed systems glossary covering CAP, consistency, consensus, clocks, and more. Learn the 40 core terms without the academic jargon."
keywords:
  - distributed systems glossary
  - distributed systems terms
  - CAP theorem explained
  - eventual consistency
  - linearizability vs serializability
  - what is a quorum
  - happens-before relationship
  - vector clock vs Lamport clock
  - idempotency meaning
  - network partition
  - consistency models
  - clock skew vs clock drift
faq:
  - q: "What is the CAP theorem in simple terms?"
    a: "When the network between your machines breaks, you must choose: keep showing everyone the same data (consistency) or keep answering every request (availability). You cannot have both during the break."
  - q: "What is the difference between latency and throughput?"
    a: "Latency is how long one request takes to travel and complete. Throughput is how many requests the system handles per second. A system can have high throughput while each individual request is still slow."
  - q: "What does eventual consistency mean?"
    a: "If writes stop, all copies of the data will eventually become identical. It does not promise when, and reads in the meantime may return an old value."
  - q: "What is the difference between a fault and a failure?"
    a: "A fault is a single thing going wrong, like one disk dying. A failure is when the whole system stops doing its job. The goal of fault tolerance is to stop faults from turning into failures."
  - q: "Why is idempotency important in distributed systems?"
    a: "Networks drop and retry messages, so the same request can arrive twice. An idempotent operation has the same effect whether it runs once or ten times, which prevents bugs like double charging a customer."
  - q: "What is the difference between linearizability and serializability?"
    a: "Linearizability is about a single object always being current in real time. Serializability is about multi-step transactions appearing to run one at a time. They are different guarantees and often confused."
author: Brexis Wazik
transformed: true
linked: true
topic: distributed-systems
topicTitle: Distributed Systems
category: Engineering
date: '2026-06-21'
order: 17
icon: "\U0001F310"
sources: []
---

You read a sentence like "the system favors availability over consistency under partition," and your brain quietly checks out. Not because the idea is hard, but because four words in that sentence are doing heavy lifting you were never taught.

Distributed systems are not actually complicated. The vocabulary is. Once a handful of terms click into place, most of the field reads like plain English.

This is that handful. No equations, no hand-waving, just clear definitions and the one example that makes each term stick.

## Why this matters

Almost every system you touch today is distributed. Your bank, your chat app, your shopping cart, the API you ship on Monday. The moment data lives on more than one machine, a new class of problems shows up, and the people who debug them fastest are the ones who share a precise vocabulary.

When an engineer says "that's a stale read from a lagging replica," they have just described a bug, its cause, and roughly where to look, in six words. Without the words, you are stuck saying "sometimes the number is wrong," and nobody knows where to start.

Learn the terms and you stop guessing. You can read the docs, follow the postmortem, and ask the question that actually unblocks you.

## The one idea behind everything: you cannot trust the network

Start here, because the rest follows from it.

On a real network, a message can take any amount of time to arrive, or never arrive at all. This is an **asynchronous network**, and the internet is the classic example. The cruel part: when a reply is slow, you cannot tell whether the other machine is busy, dead, or the message got lost. A slow message and a lost message look identical.

That single uncertainty is the root of nearly every hard problem below.

- **Latency** is the time one message takes to travel from sender to receiver. It is always greater than zero, and always unpredictable on a real network.
- **Throughput** is how much work the system handles per unit of time, like requests per second. It is not the same as latency. A system can push huge throughput while each individual request still feels slow.
- **Node** is a single machine in the system: a server, process, or instance. "Distributed" just means more than one node, which is when the trouble starts.

The eight **fallacies of distributed computing** are a famous list of false assumptions beginners make without noticing, like "the network is reliable" and "latency is zero." Believing any of them quietly is how systems break in production at 3am.

## When things go wrong: faults, failures, and partitions

These three get muddled constantly, and keeping them straight is half the battle in any incident review.

A **fault** is one component misbehaving: a disk dies, a message is dropped, a process pauses. Faults are local and expected. Good systems are built to **tolerate** them.

A **failure** is when the system as a whole stops doing its job. A failure is a fault that escaped containment. The entire goal of fault tolerance is to stop faults from becoming failures.

A **partition** (or network partition) is a specific, nasty fault: the network splits your nodes into groups that cannot talk to each other, even though every group is still running and healthy. Each side thinks the other side might be dead. **Partition tolerance** is the ability to keep working despite this. On real networks, partitions are not optional, so partition tolerance is something you simply must have.

## The famous trade-off: CAP, and its sequels

This is the most quoted idea in the field, and the most misquoted.

The [**CAP theorem**](/blog/distributed-systems/16-the-cap-theorem-and-pacelc) says that when a partition happens, a distributed system must choose between two things:

- **Consistency** (in the CAP sense): every read sees the most recent write, so all machines show the same data at the same instant.
- **Availability**: the system answers every request it receives, even if the answer might be a little out of date.

During a partition you cannot have both. If the two halves cannot talk, you either refuse some requests to stay consistent, or you keep answering and let the halves drift apart. That is the whole theorem.

A handy analogy: two shop tills lose their shared connection. They can either stop selling the last item (consistent, but unavailable) or both sell it and sort out the double-sale later (available, but inconsistent). There is no third option while the line is down.

**PACELC** extends this with the part CAP leaves out. *If* there is a Partition, trade Availability versus Consistency. *Else*, in normal healthy operation, you still trade **Latency** versus Consistency. The point: keeping data perfectly consistent has a cost even when nothing is broken, because the machines have to wait for each other.

**BASE** is the informal counterpart to ACID. It stands for **B**asically **A**vailable, **S**oft state, **E**ventually consistent. It describes systems that would rather stay up and converge over time than be flawless at every instant.

## How fresh is your data? Consistency models

A [**consistency model**](/blog/distributed-systems/17-consistency-models) is the specific promise a system makes about how current and well-ordered your data looks. Think of it as a menu, from strictest to loosest.

**Linearizability** is the strongest model for a single piece of data. The system behaves as if there is exactly one copy and every operation happens instantly at a single point in time. It is the closest a distributed system gets to feeling like one machine. **Strong consistency** is the umbrella term for models like this, where reads always reflect the latest write.

**Eventual consistency** is the loosest common promise: if writes stop, all copies will *eventually* match. It does not say when, and until they catch up your reads may be old.

In between sit several practical guarantees that are easy to want and easy to lose:

- **Read-your-writes**: after you make a change, you always see your own change, even if other people do not yet. (Why your comment shows up instantly for you.)
- **Monotonic read**: once you have seen a newer value, you never later see an older one. Time only moves forward from your point of view.
- **Stale read**: the opposite of what you want. You read an old value because the newer write has not reached your replica yet.

One classic confusion deserves its own callout. **Linearizable versus serializable** are different guarantees. Linearizable is about a *single object* being up to date in real time. **Serializable** is about *multi-step transactions* appearing to run one at a time. You can have one without the other.

## Copies and agreement: replicas, quorums, consensus

The reason consistency is hard at all is that we keep copies.

A **replica** is a copy of the data on another node. **Replication** is the act of making those copies so data survives failures and can be read from somewhere nearby. The catch: the more copies you keep, the harder it is to keep them agreeing. A **write conflict** happens when two nodes change the same data independently and the system must later decide which change wins, or how to merge them. This is everyday life under eventual consistency.

To make safe decisions without waiting for every node, systems use a **quorum**: a minimum number of nodes that must agree before an action counts, often "more than half." If a majority agrees, the system can move forward even if some nodes are slow or dead.

[**Consensus**](/blog/distributed-systems/02-the-consensus-problem) is the deeper problem underneath: getting several machines to agree on a single value, like "who is the leader?" or "what is the next entry in the log?", even while some machines and messages are failing. It sounds simple. It is one of the hardest problems in the field.

## Ordering events without a shared clock

Here is a problem you might not expect: in a distributed system, you often cannot tell what happened first.

The obvious fix, "just check the timestamps," fails. **Wall-clock time** is the ordinary time-of-day a machine reports, like 10:42:07. It is convenient for humans and untrustworthy for ordering events across machines, because of two gremlins:

- **Clock skew**: the difference between two machines' clocks at a single moment. Even well-synced servers are off by a few milliseconds, which is plenty to order two events wrongly.
- **Clock drift**: a single machine's clock gradually speeding up or slowing down, wandering away from real time until something corrects it.

**NTP (Network Time Protocol)** is the standard service that nudges clocks back toward real time. It helps, but it only narrows skew. It never eliminates it. A **timestamp** based on wall-clock time is therefore a shaky basis for [ordering anything across machines](/blog/distributed-systems/14-time-clocks-the-ordering-of-events).

So instead of asking "what time was it?", we ask "what *could have caused* what?"

**Causality** is the relationship where one event could have influenced another. The formal version is **happens-before**, written A → B: either A and B happened on the same machine in order, or A was the sending of a message that B received. If neither happened before the other, the events are **concurrent** events. They ran independently and neither could have caused the other.

To track this without real clocks, we use a **logical clock**: a counter that tracks order, not seconds. There are two main kinds:

- A **Lamport clock** is a single counter per machine, bumped on every event and carried along with messages. It guarantees that if A happened before B, A's number is smaller. But the reverse is not true: a smaller number does *not* prove causality.
- A [**vector clock**](/blog/distributed-systems/15-vector-clocks-causality) is a list of counters, one per node, carried with each event. By comparing two vectors you can tell whether one event happened before the other *or* whether they were concurrent. It carries more information than a Lamport clock, at the cost of more bookkeeping.

This is also where **total order** versus partial order comes in. A total order means every pair of events has a definite "this one is first" answer. Lamport clocks can produce one, using a tie-breaker. But real causality only gives a *partial* order, because genuinely concurrent events have no natural "first."

## One more term that saves you in production: idempotency

**Idempotency** is the property where doing an operation twice has the same effect as doing it once. Pressing a lift button a second time does not summon two lifts.

This matters because retried messages are everywhere. Remember, a slow reply is indistinguishable from a lost one, so clients retry constantly. If your "charge the customer" operation is idempotent, a retry is harmless. If it is not, you just billed someone twice. Designing for idempotency is one of the highest-leverage habits in distributed engineering.

## Common misconceptions

A few myths that trip up almost everyone:

- **"CAP means pick two of three."** No. Partition tolerance is mandatory on real networks, so CAP is really a choice between C and A, and only *during* a partition.
- **"The C in CAP is the C in ACID."** Different ideas entirely. CAP's consistency is "every read sees the latest write." ACID's consistency is about database invariants staying valid. Same word, unrelated meanings.
- **"NTP makes clocks accurate enough to order events."** It narrows the gap but never closes it. Use logical clocks when ordering across machines matters.
- **"Eventually consistent means slightly delayed."** It means *eventually*, with no promise of when. Under load or partition, "eventually" can be a long time.
- **"A smaller Lamport number means A caused B."** It does not. Lamport clocks preserve causal order in one direction only.

## How to use this glossary

You do not need to memorize all of this today. Do this instead:

1. **Anchor on the root cause.** Reread the asynchronous-network idea until it is automatic. Most other terms are just consequences of "you cannot tell slow from dead."
2. **Group, don't list.** Hold the terms in clusters: failure (fault, failure, partition), trade-offs (CAP, PACELC, BASE), freshness (the consistency models), agreement (replica, quorum, consensus), and time (the clocks). Clusters stick; flat lists do not.
3. **Match each term to a system you use.** Your database's docs almost certainly state its consistency model. Go find it. Seeing "read-your-writes" in real documentation cements it faster than any definition.
4. **Reach for idempotency first.** When you design any operation that can be retried, ask "is this safe to run twice?" before anything else.
5. **Use the words out loud.** In your next review or postmortem, name things precisely: "stale read," "write conflict," "quorum." Precision spreads, and it makes the whole team faster.

## Conclusion

If you keep just one thing: in a distributed system, you can never tell a slow message apart from a lost one, and almost every term here is humanity's response to that single uncomfortable fact. Get that, and the jargon stops being a wall and starts being a map.

The natural next question is how real systems *actually* reach agreement when machines are dropping and messages are vanishing. That is the world of consensus algorithms like Paxos and Raft, where a cluster of unreliable machines somehow decides on one truth. Once the vocabulary here feels easy, that is the conversation worth having next.
