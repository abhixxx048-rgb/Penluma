---
title: "CAP Theorem Explained (and Why PACELC Matters More)"
metaTitle: "CAP Theorem and PACELC Explained Simply"
description: "A plain-English guide to the CAP theorem and PACELC: what consistency, availability, and partition tolerance really mean, and how to choose CP vs AP databases."
topic: distributed-systems
topicTitle: Distributed Systems
category: Engineering
date: '2026-06-21'
order: 5
icon: "\U0001F310"
transformed: true
linked: true
author: Brexis Wazik
keywords:
  - CAP theorem
  - PACELC
  - CAP theorem explained
  - consistency vs availability
  - partition tolerance
  - CP vs AP databases
  - distributed systems
  - eventual consistency
  - linearizability
  - Cassandra vs etcd
  - Google Spanner CAP
  - tunable consistency
faq:
  - q: What does the CAP theorem actually say?
    a: It says that when a network partition splits your nodes apart, a distributed data store must choose between consistency (every read sees the latest write) and availability (every request gets an answer). It cannot guarantee both during the partition.
  - q: Is the CAP "C" the same as the ACID "C"?
    a: No. CAP's consistency means linearizability, where all replicas agree on the most recent value. ACID's consistency means a transaction leaves the database obeying its rules and constraints. They share a letter but are unrelated guarantees.
  - q: Can you build a CA system that gives up partition tolerance?
    a: Not on a real multi-machine network. Partitions are caused by hardware and network failures you do not control, so a system that cannot tolerate them simply breaks when the network blinks. True CA only exists on a single node.
  - q: What is the difference between CP and AP databases?
    a: During a partition, a CP system (like etcd or ZooKeeper) refuses or blocks requests to keep data correct, while an AP system (like Cassandra or DynamoDB) keeps answering and reconciles the diverged copies later.
  - q: What does PACELC add to the CAP theorem?
    a: PACELC covers the case CAP ignores. If Partitioned, you trade Availability vs Consistency. Else (normal network), you trade Latency vs Consistency, because keeping replicas in sync always costs time.
  - q: Did Google Spanner break the CAP theorem?
    a: No. Spanner is a CP / PC-EC system that chooses consistency over availability during partitions. Its private network makes partitions so rare and short that it only looks always-available. It still obeys the theorem.
sources:
  - https://en.wikipedia.org/wiki/CAP_theorem
  - https://en.wikipedia.org/wiki/PACELC_theorem
---

The moment your data lives on more than one machine, you inherit a rule you cannot negotiate your way out of. When the network between those machines breaks, you have to choose: keep answering requests, or keep your data correct. You do not get both.

That rule is the **CAP theorem**, and it is the most quoted idea in [distributed systems](/blog/distributed-systems/12-what-is-a-distributed-system). It is also the most misquoted. Almost everyone learns the catchy "pick two of three" slogan, and almost everyone learns it wrong.

This article fixes that. You will learn what CAP really claims, why the popular version is misleading, and why a newer model called **PACELC** describes the trade-off you actually pay every single day.

## Why this matters

If you ever pick a database, design an API, or get paged at 3 a.m. because half your cluster stopped responding, this trade-off is already shaping your life. It decides whether your shopping cart stays available during an outage or whether your bank balance stays correct.

Choose the wrong side and you either show customers stale or conflicting data, or you take your service offline at the worst possible moment. Most teams make this choice by accident, copying whatever database a blog post recommended. Understanding CAP and PACELC lets you make it on purpose, per feature, with your eyes open.

## First, the problem CAP is about

A **distributed data store** is a database whose data lives on several computers (called **nodes** or **replicas**) instead of one.

We split data this way for two good reasons: so the system survives one machine dying, and so it can handle more traffic. But the instant data is copied to several machines, two new problems appear. The copies can disagree with each other, and the network connecting them can fail.

CAP is about what you do when that network fails.

## The three letters, in plain words

CAP stands for three properties a distributed store might try to guarantee. Each has a precise technical meaning that is narrower than the everyday word, so read these slowly.

### C is for Consistency

Every read sees the **most recent** write. If I save `balance = 100` and you read the balance one nanosecond later from *any* replica, you must see `100`, never the old value.

The formal name for this is **linearizability**, the strongest of the [consistency models](/blog/distributed-systems/17-consistency-models). It means the whole cluster behaves *as if* there were only one copy of the data, and every operation happened instantly, in one clear order. As Eric Brewer (who first proposed CAP) put it, consistency here is "equivalent to having a single up-to-date copy of the data."

### A is for Availability

Every request sent to a working node gets a non-error response. It does not hang forever, and it does not reply "sorry, I cannot serve you right now."

The catch: an available system is allowed to return data that is slightly **stale** (out of date). Availability promises you *an* answer, not the *freshest* answer.

### P is for Partition tolerance

The system keeps working even when the network between nodes **drops or delays messages**.

A **network partition** is when the connection between groups of nodes breaks, so node A can no longer talk to node B even though both machines are alive and healthy. Think of a cut undersea cable, a misconfigured firewall, or a switch silently dropping packets. The nodes are fine. The *wire between them* is the problem.

> **Analogy.** Picture two branches of the same bank, in two cities, that must always show the same account balance. *Consistency* means both branches always show the identical, latest balance. *Availability* means you can always walk into either branch and get served. A *partition* is when the phone line between the branches goes dead, so they can no longer tell each other about new deposits.

## The actual claim: during a partition, choose C or A

Here is the theorem in one sentence: **when a network partition happens, a distributed system must choose between Consistency and Availability. It cannot have both.**

Why is that forced? Walk through it. The network has split your two replicas into two groups that cannot talk. A write request arrives at one side. That side faces a fork with only two doors.

1. **Door 1 - stay Consistent, sacrifice Availability.** Refuse the request, because this side cannot safely confirm the change with the other side. It returns an error or just waits. Data stays correct everywhere, but the user was not served.
2. **Door 2 - stay Available, sacrifice Consistency.** Accept the write anyway and reply "OK." The user is served, but now the two sides hold *different* values for the same data. They have diverged.

There is no third door. You cannot both accept the write *and* keep both replicas identical when those replicas physically cannot communicate. That impossibility *is* the theorem.

> **Example.** A shopping site stores your cart on two replicas, and the cable between them is cut. You add "blue shoes," and replica A takes the write. A **CP system** refuses or blocks the write so the cart never disagrees, and you might see "try again later." An **AP system** accepts "blue shoes" on A, lets B stay unaware for now, replies "Added!", and reconciles the two carts after the network heals. Same partition, two opposite choices.

## Why "P" is not really optional

Beginners read "pick two of three" and think: fine, I will pick C and A and drop P. I will build a CA system.

In the real world, that is not a real option.

Partitions are caused by the *network*, and you do not control the network. Cables get cut, routers reboot, packets vanish, a cloud availability zone loses connectivity. These things *will* happen to any system whose nodes sit on separate machines. You cannot choose to make partitions stop, any more than you can choose for it to never rain.

So partition tolerance is not a feature you opt into. It is a fact of life you have to survive. That means **P is effectively mandatory**, and the real choice is only ever **C versus A, and only during a partition**.

A truly "CA" system would be one that simply gives up the instant the network hiccups. That is not a useful distributed system. It is a single-machine database, where there is no network between replicas and so no partition can happen.

## CP systems vs AP systems, with real examples

We label systems by what they choose *when a partition strikes*.

| Type | During a partition it... | Good for | Real systems |
|------|--------------------------|----------|--------------|
| **CP** (Consistency + Partition tolerance) | Keeps data correct; refuses or blocks requests on the side that cannot confirm. Sacrifices availability. | Coordination, locks, config, balances, where wrong data is worse than no data. | ZooKeeper, etcd, HBase, Google Spanner, traditional RDBMS in strict mode |
| **AP** (Availability + Partition tolerance) | Keeps answering on every reachable node; lets replicas diverge, reconciles later. Sacrifices consistency. | Shopping carts, social feeds, sensor data, sessions, where an answer now beats a perfect answer. | Cassandra, Amazon DynamoDB (eventually-consistent mode), Riak, CouchDB |

### Why etcd and ZooKeeper are CP

**etcd** (the key-value store that holds Kubernetes' cluster state) and **ZooKeeper** (a coordination service) exist to be the single source of truth everyone agrees on.

They use a [consensus algorithm](/blog/distributed-systems/02-the-consensus-problem) (Raft for etcd, Zab for ZooKeeper) that needs a **majority**, or **quorum**, of nodes to agree before any write is accepted. If a partition leaves a group of nodes *without* a majority, that minority stops accepting writes. It would rather be unavailable than risk telling two clients different things.

Imagine if etcd let two halves of a split cluster each elect their own leader. Kubernetes would run two conflicting versions of your cluster. Unthinkable, so it picks C.

### Why Cassandra and DynamoDB are AP

**Cassandra** and **DynamoDB** both descend from Amazon's famous "Dynamo" design, built for an online store that must *never* reject a customer. Their guiding rule: an "add to cart" click must always succeed.

So during a partition, every reachable node keeps accepting reads and writes. The copies drift apart, and the system reconciles them afterward using techniques like **last-write-wins** or [**vector clocks**](/blog/distributed-systems/15-vector-clocks-causality) (a way to track which version came after which). They also offer **tunable consistency**, so you can request stronger guarantees per operation, but their default temperament is to stay available.

> **Analogy.** A CP system is a careful pharmacist: if she cannot verify your prescription against the central record, she refuses to hand over the pills. Better to send you away than risk a dangerous mistake. An AP system is a busy coffee shop during a card-network outage: it keeps serving customers and writes the orders on paper, sorting out payments once the system comes back. One refuses to be wrong. The other refuses to stop serving.

## Common misconceptions

The whole reason Brewer wrote a follow-up article in 2012, *"CAP Twelve Years Later,"* was to fix how badly "two of three" had been taught. Here are the myths worth unlearning.

- **Myth: you pick two letters forever.** Reality: P is forced on any real network, and the C-vs-A choice only fires *during* a partition. When the network is healthy, which is almost all the time, a well-built system delivers both consistency and availability at once. As Brewer noted, CAP "prohibits only a tiny part of the design space."
- **Myth: CAP's C is ACID's C.** Reality: CAP's C means linearizability (all replicas agree on the latest value). ACID's C means a transaction preserves the database's rules and constraints. Same letter, unrelated ideas.
- **Myth: you can build a CA system.** Reality: on real multi-machine networks, partitions are inevitable, so a system that cannot tolerate them just breaks when the network blinks. Genuine CA only exists on a single node.
- **Myth: AP means no consistency, ever.** Reality: AP systems are usually **eventually consistent**. They reconcile after the partition heals. They drop *strong*, immediate consistency, not all consistency.
- **Myth: Google Spanner broke CAP.** Reality: it did not, and we will see exactly why below.
- **Myth: the properties are on/off switches.** Reality: Brewer stresses they are "more continuous than binary." Consistency runs along a spectrum (linearizable to causal to eventual), and availability is a percentage. You tune where you sit; you do not flip a switch.

## PACELC: the part CAP forgot

CAP has a blind spot. It only describes what happens *during a partition*. But partitions are rare. What governs your system the other 99.9% of the time, when the network is perfectly healthy?

CAP is silent. In 2010, Yale professor **Daniel Abadi** proposed an extension to fill that gap, and called it **PACELC**.

Read the name as a sentence: if **P**artitioned, choose **A** vs **C**; **E**lse (no partition), choose **L** vs **C**.

The new insight is that right-hand branch. Even with a perfect network, keeping replicas in sync *costs time*. To guarantee a read sees the latest write, the system must contact other replicas (or wait for a majority to acknowledge) before answering, and that round trip adds **latency**. If instead you let a nearby replica answer immediately from possibly-stale data, you get speed but give up strict consistency.

So even in calm weather there is a trade: **Latency vs Consistency.** This is the cost CAP completely ignores, and it is the one you pay on every normal request.

Every system therefore carries a two-part label, like `PC/EC`: the first part is its partition-time choice, the second its normal-time choice.

| System | PACELC | Reads as... |
|--------|--------|-------------|
| Cassandra | **PA/EL** | On partition, favor Availability; else, favor Latency. Speed-first, eventually consistent. |
| Riak | **PA/EL** | Same temperament as Cassandra. |
| DynamoDB | **PA/EC** | On partition stay Available; else favor Consistency over latency. |
| MongoDB | **PA/EC** | Stays available on partition; in normal times leans consistent. |
| HBase, BigTable | **PC/EC** | Consistency always, in partitions and normal times. Never sacrifices correctness. |
| VoltDB / H-Store | **PC/EC** | Strongly consistent in all conditions. |
| Google Spanner | **PC/EC** | Consistency-first everywhere; accepts extra latency to stay linearizable. |

> **Example - Google Spanner.** Spanner is globally distributed yet linearizable, which sounds like it "beats" CAP. It does not. Spanner is **PC/EC**: when partitioned it chooses Consistency over Availability, and in normal operation it chooses Consistency over Latency, deliberately waiting out a small clock-uncertainty window (its "TrueTime" mechanism) on commits to keep ordering correct. People call it "effectively CA" only because Google's private network makes partitions so rare and so short that availability looks near-perfect. It still obeys the theorem. It just hides the cost behind excellent infrastructure.

> **Analogy.** You text a group of friends to confirm dinner. *Consistency* means you wait until *everyone* replies "yes" before booking: slow, but nobody shows up at the wrong place. *Low latency* means you book the instant the first person replies: fast, but someone might have wanted a different restaurant. No phone is broken here, no partition. The trade between waiting-for-agreement and answering-fast exists anyway. That everyday trade is exactly PACELC's "Else" branch.

## How to use this

You do not have to memorize labels. You have to make a few decisions deliberately.

1. **Decide C-vs-A per data type, not per company.** Money, inventory counts, locks, and config want CP. Carts, feeds, view counts, and sessions are happy with AP. One application can and should use both.
2. **Ask both PACELC questions before choosing a database.** "What does it do on a partition?" *and* "What latency does it cost me for consistency on a normal day?" The second question hits you constantly; do not skip it.
3. **Plan the partition-recovery path up front.** Follow Brewer's recipe: detect the partition, enter a limited mode that blocks the riskiest operations, then recover by merging diverged data when the network heals. Pick your merge strategy (last-write-wins, vector clocks, CRDTs) *before* the incident, not during it.
4. **Do not roll your own consensus.** For coordination needs like service discovery, [leader election](/blog/distributed-systems/04-raft-leader-election), and config, reach for proven CP systems like etcd or ZooKeeper. Consensus is famously easy to get subtly wrong.
5. **Treat consistency as a dial, not a switch.** Many AP databases offer tunable, per-request consistency (such as Cassandra's quorum levels). Turn it up for the few operations that need it, and leave it low for everything else.

## Conclusion

If you remember one thing, remember this: CAP describes a rare emergency, but PACELC describes your Tuesday. The partition you fear shows up for a few seconds a year. The Latency-vs-Consistency trade shows up on every request, and it shapes your users' experience far more than the outage ever will.

So stop asking "is my database CP or AP?" as if it were a permanent label on the box. Start asking, per feature, "what do I want when the network breaks, and what do I want when it does not?"

That reframing opens a deeper question worth chasing next. If "eventually consistent" really does converge, *how* does it converge without a central referee? The answers (vector clocks, quorum reads, and conflict-free replicated data types) are where distributed systems stop sounding like rules and start feeling like real engineering.
