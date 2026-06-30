---
title: "Consistency Models Explained: From Strong to Eventual"
metaTitle: "Consistency Models in Distributed Systems"
description: "A plain-English guide to consistency models in distributed systems, from linearizability to eventual consistency, and how to pick the right one per data type."
keywords:
  - consistency models
  - linearizability
  - eventual consistency
  - causal consistency
  - sequential consistency
  - strong consistency vs eventual
  - distributed systems consistency
  - read your writes
  - session guarantees
  - CAP theorem consistency
  - PACELC
  - quorum consistency
  - DynamoDB consistency
  - Cassandra tunable consistency
faq:
  - q: "What is a consistency model in distributed systems?"
    a: "It is a contract between a storage system and your code about which values a read is allowed to return given the writes that happened. It defines exactly which read results are correct and which are bugs."
  - q: "What is the difference between strong and eventual consistency?"
    a: "Strong consistency (linearizability) means every read sees the latest write, as if there were one single copy of the data. Eventual consistency only promises replicas converge to the same value after writes stop, so reads may be stale in the meantime."
  - q: "Is eventual consistency fast?"
    a: "Yes. A read can be answered by the nearest replica with no coordination, often around a millisecond, and the system stays available even during network failures. The trade-off is that reads can return stale data."
  - q: "Does eventual consistency have a time guarantee?"
    a: "No. 'Eventually' has no deadline. It is usually milliseconds, but under heavy load or a network partition it can stretch to seconds or longer. Never assume a write you just made is already visible elsewhere."
  - q: "Which consistency model should I use?"
    a: "Pick the weakest model that is still correct for that specific data. Use linearizability for money, inventory, locks, and identity. Use causal or eventual for feeds, carts, counters, and caches."
  - q: "What is read-your-writes consistency?"
    a: "It is a session guarantee promising that after you write something, your own later reads will see it (or something newer). It prevents the 'I saved my change but it disappeared on reload' bug without forcing global coordination."
topic: distributed-systems
topicTitle: Distributed Systems
category: Engineering
date: '2026-06-21'
order: 6
icon: "\U0001F310"
author: Brexis Wazik
transformed: true
linked: true
sources:
  - "https://en.wikipedia.org/wiki/Consistency_model"
  - "https://en.wikipedia.org/wiki/Linearizability"
  - "https://en.wikipedia.org/wiki/Eventual_consistency"
  - "https://jepsen.io/consistency/models/linearizable"
---

You change your password, log out, and immediately log back in with the new one. It fails. The old password still works. You did everything right, so why is the system lying to you?

It is not lying. Your login request just landed on a copy of your data that has not heard about the change yet. In a distributed system your data lives on many machines at once, and those copies do not always agree on what is true right now.

The rule that decides which answer you are allowed to get back is called a **consistency model**. Once you understand it, a whole category of baffling bugs stops being mysterious.

## Why this matters

Any system that stores data on more than one machine has to make a choice. When you write a value to one copy (called a **replica**), the other replicas do not learn about it instantly. The new value has to travel across the network, and the network is slow and sometimes broken.

So at any moment, your replicas can disagree. That raises one sharp question: **when you read the data, which value are you allowed to get back?** The newest one? An old one? Something in between?

A consistency model is the precise answer. It is a written promise from the storage system to you, the programmer, about what reads can legally return. And the model you pick decides three things at once:

- **Correctness** - how fresh and well-ordered the data your code sees will be.
- **Latency** - how long a read or write takes. Strict promises force machines to talk to each other before answering, which is slow.
- **Availability** - whether the system can still answer you when the network is partly broken.

Stronger promise means easier to reason about, but slower and more fragile. Weaker promise means faster and more available, but your code has to tolerate surprises. That tension is the entire game.

## "Consistency" means several different things

Before going further, clear up one source of endless confusion. The word "consistency" is overloaded, and three common uses have nothing to do with each other.

- The **C in ACID** (database transactions) means "the database never breaks its own rules," like "an account balance can't go negative."
- The **C in the CAP theorem** means linearizability - every read sees the latest write.
- The **consistency models** in this article are a third, broader idea: across many replicas, what ordering of reads and writes is each observer allowed to see?

They share a letter and almost nothing else. Keep them separate in your head and half the arguments about "consistency" dissolve.

## The consistency ladder

Think of consistency models as rungs on a ladder. The top rung gives the most guarantees but demands the most coordination, so it is slower and less available. Each rung down trades guarantees for speed and uptime.

From strongest to weakest:

1. **Linearizability** - behaves like one single up-to-date copy.
2. **Sequential consistency** - one agreed order, but it may lag real time.
3. **Causal consistency** - cause always comes before effect.
4. **Client-centric (session) guarantees** - sane within your own session.
5. **Eventual consistency** - agree later, if writes ever stop.

Let's climb down it, one rung at a time.

## Linearizability: pretend there's only one copy

This is the strongest model people actually use, and the promise is wonderfully simple: the whole system **behaves as if there is only one single copy of the data**, and every operation happens in one instant. There are really many replicas hiding behind the scenes, but you can never tell.

The problem it kills is this: without it, two people reading "the same" value at the same moment can get different answers, and a read that happens *after* a write finishes might still hand back the old value. That makes bank balances and locks nearly impossible to program. Linearizability removes the confusion. Once a write finishes, every later read sees it. Full stop.

The clever part is the **real-time rule**: if operation A finishes before operation B starts on the [wall clock](/blog/distributed-systems/14-time-clocks-the-ordering-of-events), then everyone must agree A came before B. You cannot reorder things that did not overlap in time. That is what makes a fleet of machines feel like one fresh copy.

> **Analogy:** Linearizability is a single shared whiteboard in one room. Whoever walks up writes on it, and the instant they step back, the next person to look sees exactly what was written. There is only one board, so stale information is impossible. The company secretly keeps synced copies of the board in other cities, but it keeps them perfectly in step, so it *looks* like one board.

**Where it shows up.** Tools like **etcd** and **ZooKeeper** use linearizability to hold distributed locks and elect leaders. If two servers both try to grab the same lock, linearizability guarantees exactly one wins and everyone agrees who - which is the whole point of a lock. **Google Spanner** pushes this even further across the globe using GPS receivers and atomic clocks to timestamp transactions, then deliberately waiting out the tiny clock uncertainty before committing. That wait is the price of strong consistency, made visible.

**The cost is real.** To honor "every read sees the latest write," replicas must coordinate, usually by reaching a majority of nodes (a **quorum**) or going through one leader. That means network round-trips on every single operation. A nearby stale read might take about 1 millisecond; a linearizable read that has to reach a leader in another region can take 50 to 200 milliseconds. And during a network partition, a linearizable system *cannot* stay available. Some nodes must stop answering rather than risk returning stale data.

## Sequential consistency: one agreed order, slightly delayed

Sequential consistency keeps one half of linearizability and throws away the other half. It still demands that **everyone agrees on one single global order** of all operations, and that each process's own operations stay in the order it issued them. But it **drops the real-time rule**. The agreed order does not have to match the wall clock.

Why bother? Because the real-time rule is the expensive part. If you only need everyone to agree on *one* order, and you don't care that the order tracks the clock exactly, you can sometimes go faster. The catch: a read might return a value that is technically "in the past," as long as every observer sees the same consistent story.

> **Analogy:** Picture a movie everyone watches on a slight broadcast delay. Everybody worldwide sees the exact same scenes in the exact same order, so nobody disagrees about what happened. But it is a few seconds behind real life. Linearizability is the live broadcast. Sequential consistency is the synchronized-but-delayed one.

Here is a concrete case. Alice posts "A" then "B"; Bob posts "X" then "Y". Under sequential consistency, every reader might see `A, X, B, Y` - Alice's A-before-B and Bob's X-before-Y are both preserved, and *everyone* sees that same interleaving. What is forbidden is one reader seeing `A, B` while another sees `B, A`. That would break the single agreed order.

## Causal consistency: cause before effect

Causal consistency is weaker than sequential, but it nails the ordering humans actually notice: **cause before effect**. The rule is simple. If one operation *causally precedes* another, every node must show them in that order. Operations that are **concurrent** - neither caused the other - may appear in different orders on different nodes, and that is allowed.

What counts as "causally precedes"? Operation A causally precedes B if they came from the same client with A first, or if B read the value A wrote, or if a chain of such links connects them. (This is the same "happens-before" relationship that [vector clocks](/blog/distributed-systems/15-vector-clocks-causality) track, if you have met those before.)

> **Analogy:** A group chat. A question and its answer must always appear in that order - an answer before its question is nonsense, because the answer was *caused* by reading the question. But two unrelated people each saying "good morning" at the same moment? It does not matter who shows first. Different phones briefly disagreeing on the order confuses no one.

Picture Alice posting "Lost my keys" and Bob replying "Found them by the door!" Bob's reply was caused by reading Alice's post, so every node must show the post before the reply. A node that shows "Found them!" with no visible post makes Bob look unhinged. Causal consistency forbids exactly that, even across continents - research systems like **COPS** do this by attaching dependency metadata to each write so a replica waits for everything that write depends on before revealing it.

Here is why this rung is special: causal consistency stays **available during network partitions**, unlike linearizability, yet still rules out the most jarring anomalies. It is often called the strongest consistency a system can offer while remaining always-available.

## Eventual consistency: agree later

This is the weakest model in common use, and its only promise is this: **if writes stop coming in, then after enough time all replicas converge to the same value.** That is it. While writes are still flowing, different replicas can return different, stale values, in no guaranteed order.

Why would anyone want so little? Because it buys maximum speed and maximum uptime. A read is answered by the nearest replica with zero coordination, around a millisecond, and the system keeps serving even when nodes are cut off from each other. You trade freshness for performance and availability.

Under the hood, replicas accept writes locally and gossip the changes to each other in the background. When two replicas discover they disagree, they resolve it with a rule, like **last-write-wins** (highest timestamp wins) or merging with conflict-free data types designed to combine cleanly.

> **Analogy:** Postal mail. If you and a friend each mail a letter, neither sees the other's instantly. They arrive after a delay, maybe out of order. But once you both stop sending, eventually you each receive every letter and agree on the full picture. The mail system is always available - you can always drop a letter in the box - but never "live."

**Where it shows up.** [**Amazon DynamoDB**](/blog/aws-cloud-practitioner-mcq/12-amazon-dynamodb-managed-nosql) defaults to eventually consistent reads because most reads tolerate slightly stale data and a strongly consistent read costs twice as much. **Apache Cassandra** is eventually consistent but *tunable*: you choose how many replicas must acknowledge each read (R) and write (W). Pick R and W so they overlap a majority (for example, quorum reads and writes with three replicas), and you regain strong consistency for that operation - at the cost of more coordination.

## Client-centric guarantees: don't gaslight one user

Plain eventual consistency is often *too* surprising. You save your profile, reload, and your change is gone, because the reload hit a different, stale replica. **Client-centric guarantees** (also called **session guarantees**) fix the worst of these surprises *for one client's own session* without paying for global coordination. A "session" is simply one client's sequence of operations over time.

There are four classic guarantees:

- **Read-your-writes** - after you write something, your own later reads will see it (or something newer). Prevents: you change your password, immediately log in, and the old one still works.
- **Monotonic reads** - once you have seen a value, you never see an older one later. Time only moves forward for you. Prevents: you refresh a thread, see 10 comments, refresh again, and see only 8.
- **Monotonic writes** - your writes apply in the order you made them. Prevents: you set name to "Bob" then "Robert," but a replica applies them backwards and you end up "Bob."
- **Writes-follow-reads** - a write you make after reading something is ordered after what you read. Prevents: you reply to a post, but your reply lands on a replica that does not have the post yet - a reply to nothing.

> **Analogy:** These are the "don't gaslight one user" rules. The rest of the world can lag and stay fuzzy, but *your own* experience must be self-consistent. What you typed is still there, your view never rewinds, your edits land in order, and your replies never precede what they replied to. It is a notebook only you write in: even if the shared library is chaotic, your personal notebook always makes sense to you.

These are cheap, often implemented by "sticking" a client to one replica or having the client carry a small note of what it has already seen. They erase the most infuriating, support-ticket-generating glitches without paying for full linearizability.

## How it ties back to CAP and PACELC

This ladder is really the famous [CAP trade-off](/blog/distributed-systems/16-the-cap-theorem-and-pacelc) seen from the read side. **CAP** says that when the network partitions, you must choose Consistency or Availability. **PACELC** extends it with a sharp addition: *if Partitioned, choose Availability or Consistency; Else (normal operation), choose Latency or Consistency.*

In plain terms, the consistency-versus-latency tax is paid **even when nothing is broken**:

- **Linearizability = more coordination.** Every operation talks to a majority, so it is slower and must stop during partitions. It gives up availability to stay correct.
- **Eventual = less coordination.** Answer locally, gossip later. Fast and always available, but reads can be stale.
- **Causal** sits in the available band - the strongest contract you can keep while still answering during a partition.

## Common misconceptions

**"Consistency is binary - a database is either consistent or not."** It is a ladder of named contracts. "We need a consistent database" means nothing until you say *which* model: linearizable, causal, eventual, and so on.

**"Strong-sounding models guarantee fresh reads."** Only linearizability adds the real-time rule. Sequential consistency guarantees one *agreed* order, which can still lag reality. A reader can sit on a stale-but-consistent view indefinitely.

**"Eventual consistency means a few milliseconds, guaranteed."** "Eventually" has no deadline. Under load or partition it can stretch to seconds or longer. Never write code assuming a write you just made is already visible on another replica.

**"The C in ACID is the C in CAP."** ACID-C means the data obeys your integrity rules inside a transaction. CAP-C means linearizability across replicas. Unrelated guarantees that happen to share a letter.

**"Strong consistency is the safe default, so always use it."** It costs latency on *every* operation and sacrifices availability during partitions. Making everything linearizable can leave a system needlessly slow and fragile.

**"Different nodes showing concurrent writes in different orders is a bug."** Under causal and eventual models, that is the contract, not a defect. Your conflict-resolution logic must expect it.

## How to use this

The professional move is not "pick one model for the whole system." It is "pick the weakest model that is still correct for *this specific piece of data*." Strong where it must be, weak where you can get away with it.

1. **Map each data type to a model.** Money, inventory, locks, and identity need linearizability - a stale read here is a real money bug, like overselling the last unit. Feeds, carts, counters, and caches are fine on causal or eventual.
2. **Default to the weakest correct model, then strengthen only where a real bug appears.** Weak-by-default keeps you fast and available. Pay for strength only where staleness causes harm.
3. **Layer session guarantees onto eventual stores.** Add read-your-writes and monotonic reads to kill the "my change disappeared" and "the list went backwards" glitches. Cheap fix, huge UX win.
4. **Use tunable consistency where the database offers it.** Cassandra's per-query R/W levels and DynamoDB's optional strong reads let you pay the strong-read price only on the operations that need it.
5. **Make the chosen model explicit in code and docs.** Write it down: "inventory reads are linearizable; feed reads are causal." An accidental, undocumented consistency model is a future outage. Test it with fault-injection so you know the system honors the contract it claims.
6. **Budget for the latency strong models force.** When you must be strong and global, expect quorum round-trips and commit-waits. Place leaders and quorums near the clients that need fresh reads to keep that cost bounded.

A quick reference for the common cases:

- **Shopping cart →** eventual is fine. Merge the carts later; customers tolerate a one-second lag but not a down store.
- **Bank balance or inventory →** linearizable. Staleness here means double-spends and overselling.
- **Social feed or comments →** causal. A reply must never appear before the post it answers, but you don't need the absolute global latest.
- **"My profile edit vanished on reload" →** add read-your-writes on top of an otherwise-eventual store.

## Conclusion

If you take away one thing, make it this: **consistency is not a feature you turn on, it is a deliberate choice you make per piece of data.** Climbing up the ladder buys simpler reasoning and fresher reads, paid for in coordination, latency, and lost availability. Climbing down buys speed and uptime, paid for with staleness your code must handle. There is no free lunch - only an honest trade-off you should make on purpose.

The deepest version of that trade-off lives one layer down, in how a fleet of machines reaches agreement at all. That is the job of **consensus algorithms** like [Raft and Paxos](/blog/distributed-systems/07-multi-paxos-raft-vs-paxos-the-real-world) - the machinery that actually makes linearizability possible. Once you see how a handful of servers vote on a single source of truth, the cost of strong consistency stops being abstract and starts being something you can feel.
