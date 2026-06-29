---
title: 'CAP, PACELC & Consistency Models, Finally Made Clear'
metaTitle: 'CAP & PACELC Consistency Models Explained'
description: >-
  CAP theorem and PACELC explained in plain language. Learn what your database
  really guarantees during a network partition, and how to pick the right
  consistency model.
topic: system-design
topicTitle: System Design
category: Engineering
date: '2026-06-15'
order: 9
icon: "\U0001F3D7️"
keywords:
  - CAP theorem
  - PACELC
  - consistency models
  - eventual consistency
  - linearizability
  - strong vs eventual consistency
  - distributed database consistency
  - quorum W R N
  - Google Spanner consistency
  - DynamoDB consistency
  - causal consistency
  - read your writes
  - tunable consistency
  - distributed systems trade-offs
faq:
  - q: What is the difference between CAP and PACELC?
    a: >-
      CAP only describes what happens during a network partition: you trade
      consistency for availability. PACELC adds the part CAP ignores, that even
      when the network is healthy you still trade latency for consistency.
      PACELC is the more useful everyday framework.
  - q: Does the CAP theorem mean you pick 2 of 3?
    a: >-
      No. Partition tolerance is not optional on a real network because networks
      will fail. The genuine choice is between consistency and availability, and
      only during a partition. The rest of the time you can have both.
  - q: Is strong consistency always better than eventual consistency?
    a: >-
      No. Strong consistency costs latency on every request and becomes
      unavailable during partitions. Most reads, like view counts or feeds, are
      fine with weaker models. Reserve strong consistency for invariants like
      balances, inventory, and locks.
  - q: What is the strongest consistency a highly available system can offer?
    a: >-
      Causal consistency. It guarantees that cause comes before effect for
      everyone, and it is the strongest model that stays available during a
      partition. Anything stronger needs coordination that a partition can
      block.
  - q: What does W + R > N mean in quorum systems?
    a: >-
      It is the rule for strong quorum consistency. If your write quorum plus
      your read quorum exceeds the number of replicas, every read is guaranteed
      to touch at least one node that saw the latest write.
  - q: Why can Google Spanner be strongly consistent across the globe?
    a: >-
      Spanner uses TrueTime, a clock that returns a time interval with bounded
      uncertainty. It waits out that uncertainty before confirming a commit, so
      every transaction lands in a globally agreed real-time order.
author: Pritesh Yadav
transformed: true
sources:
  - https://en.wikipedia.org/wiki/CAP_theorem
  - https://en.wikipedia.org/wiki/PACELC_theorem
  - https://en.wikipedia.org/wiki/Consistency_model
---

Two ticket clerks sell seats for the same concert. One sits in London, one in Tokyo, joined by a single phone line. There are 100 seats. Then the phone line drops.

Now each clerk has only two choices. Keep selling and risk both of them selling seat 42 to different people. Or stop selling and turn away paying customers until the line comes back. There is no third option that keeps the booth open *and* never oversells.

That tiny, frustrating moment is the entire heart of the CAP theorem. Everything else in this article is just getting precise about it, and that precision is exactly where real engineering mistakes hide.

## Why this matters

When you store the same data in more than one place, the copies can disagree. Pick the wrong rule for handling that disagreement and you get silent data loss, vanishing user edits, double charges, or an outage that looks like a crash even though nothing crashed.

The trouble is that database marketing pages love the word "consistent" and almost never tell you what they mean by it. "Strongly consistent" can mean five different things. "Eventually consistent" tells you almost nothing about what you will actually see right now.

By the end of this you will be able to read any datastore's claims, place it on a precise spectrum, and predict exactly how it behaves when a replica lags or the network splits. That is the skill that separates a confident architecture review from a hopeful one.

## The real cost: agreeing across a gap

Back to the clerks. To *never* oversell, every sale has to be confirmed by both before it counts. That confirmation is **consistency**, and it costs a round trip on every single sale, even when the phone line works perfectly.

When the line drops, that is a **partition**: messages between your nodes are lost or delayed. Now the clerks must choose.

- **Keep selling** and stay **available**, accepting that they might both sell the same seat.
- **Stop selling** and stay **consistent**, accepting angry customers.

Hold on to that picture. Both famous frameworks below are just careful versions of these two clerks.

## CAP, stated precisely

Eric Brewer proposed CAP in 2000, and Gilbert and Lynch proved it in 2002. The careful version says: on a network that can drop or delay messages, a system cannot guarantee all three of these at once.

- **Consistency (C)** here means **linearizability**: every read sees the most recent completed write, as if there were a single copy of the data updated in one instant.
- **Availability (A)** means every request to a working node eventually gets a non-error answer.
- **Partition tolerance (P)** means the system keeps working even when the network drops messages between nodes.

The proof fits in one breath. Split the network into two halves. A client writes `x = 1` to the left half. Another client reads `x` from the right half, which never heard about the write. The right side must either return the stale old value (so it is **not** consistent) or refuse to answer (so it is **not** available). You cannot escape.

### What CAP does NOT say

This is where careers wobble. CAP is widely misquoted.

- **"Pick 2 of 3" is the wrong framing.** You do not choose P. The network imposes partitions on you whether you like it or not. The real choice is C versus A, and *only while a partition is happening*. When the network is healthy, you get both.
- **CAP's C is not ACID's C.** CAP consistency is linearizability, a freshness-and-ordering property on a single item. ACID consistency means "transactions keep your data rules valid," which is something you define yourself. They are unrelated ideas that happen to share a letter.
- **"CP means always strongly consistent" is false.** A CP system only promises linearizability when you read through the right path. Read from a lagging follower and you get stale data no matter what label the database wears.
- **CAP only describes partitions.** It says nothing about the 99.9% of the time the network is fine, where latency, not partitions, dominates your design. That blind spot is exactly why the next framework exists.
- **"Available" does not mean fast.** In CAP, a node that answers in 30 seconds is "available." Useful to a theorem, useless to your users.

The headline: **CAP describes one narrow failure (the partition) and one narrow flavor of consistency (linearizability).** It is true, but far too coarse to design with.

## PACELC: the framework you should actually use

Daniel Abadi's 2012 refinement fixes CAP's biggest blind spot, which is latency. Read it as a sentence:

> **If** there is a **P**artition, choose **A**vailability or **C**onsistency. **E**lse (normal operation), choose **L**atency or **C**onsistency.

The second half is the gift. Even on a perfectly healthy network, **being linearizable costs latency**. To guarantee everyone sees the newest write, your nodes must coordinate, and coordination has a price on every request, partition or not.

Here is the quiet truth most people miss: you spend almost your entire latency budget in the "else" world, not the partition world. Partitions are rare. The consistency tax is paid all day, every day.

### Where real systems land

PACELC sorts databases into four useful buckets instead of CAP's two. The shorthand reads as "partition behavior / normal behavior."

| System | Under partition | Normal operation | In short |
|---|---|---|---|
| **DynamoDB / Cassandra** (defaults) | Stays available | Favors low latency | PA / EL |
| **Google Spanner** | Refuses to split-brain | Pays coordination latency | PC / EC |
| **MongoDB** (majority writes) | Blocks rather than diverge | Coordinates on writes | PC / EC |
| **Cosmos DB** | You pick per request | You pick per request | Tunable |
| **PNUTS** (Yahoo) | Stays consistent | Optimizes latency | PC / EL |

The two ends most people know are PA/EL (DynamoDB) and PC/EC (Spanner). The interesting designs live in the cross corners, like PNUTS staying consistent under partition but latency-first when healthy.

## The consistency spectrum: "strong vs eventual" is too coarse

"Eventual consistency" only promises that *if writes ever stop, the copies will eventually match*. It says nothing about what you see in the meantime, and the meantime is your entire production lifetime.

Between fully strong and fully eventual sits a ladder of genuinely useful guarantees. From strongest to weakest:

- **Linearizability** — every read returns the latest completed write, in real-time order. Strongest, most expensive, unavailable under partition. *Used by etcd, ZooKeeper, Spanner.*
- **Sequential** — everyone agrees on one order of operations, but that order need not match the wall clock. Mostly a theoretical baseline.
- **Causal** — if A caused B, everyone sees A before B. Unrelated events can appear in any order. *This is the strongest model a still-available system can offer.*
- **Session guarantees** (the practical sweet spot, explained below).
- **Eventual** — the copies converge someday, with no promise about now. Cheapest, always available. *Used by DNS and Dynamo's default reads.*

### Session guarantees: the practical sweet spot

Four client-focused guarantees (from Terry and colleagues, 1994) kill the bugs users actually notice, and they are cheap, often just a sticky session or a version cookie.

- **Read-your-writes** — you always see your own latest change. This is the cure for "I saved my profile, refreshed, and it was gone."
- **Monotonic reads** — time never goes backward for you. Once you have seen version 5, you will not later see version 3.
- **Monotonic writes** — your own writes apply in the order you made them.
- **Writes-follow-reads** — a write you make after reading version 5 lands after version 5 everywhere. No replying to a comment that appears to predate it.

A simple way to remember the whole ladder: session guarantees are the **practical** sweet spot (cheap, kills visible bugs), and **causal consistency is the theoretical ceiling** for any system that wants to stay available during a partition. You cannot do better than causal without giving up availability.

## Quorum consistency: the one piece of math worth knowing

Many systems copy each key to **N** nodes. A write must be confirmed by **W** of them, and a read must ask **R** of them and take the freshest answer.

The rule for strong consistency is delightfully simple:

> **W + R > N**

This forces the read set and the write set to overlap by at least one node, so every read is guaranteed to touch a replica that saw the latest write. A worked example with three replicas:

- **N=3, W=2, R=2** gives `4 > 3`, true. Strong, and you can lose one node and still read and write. The classic balanced choice.
- **N=3, W=3, R=1** gives fast reads, but one node down blocks every write.
- **N=3, W=1, R=1** gives `2 > 3`, false. Fast and very available, but **eventually consistent**. This is the fast default in Dynamo-style stores.

A back-of-the-envelope number makes the latency tax real. Three replicas across availability zones in one region cost roughly **1 to 2 milliseconds** for a strong write. Stretch that same quorum across two continents, say a round trip of about 80 milliseconds, and *every* strongly consistent write now costs **at least 80 milliseconds**. That is why cross-region strong consistency hurts, and why teams keep the consistency boundary inside one region and replicate across regions in the background.

One trap: quorum overlap is not full linearizability. Two reads during an in-flight write can still return different values, and "sloppy" quorums that write to any reachable node during a partition may not overlap at all. Overlap means you *can* see the latest write, not that everyone sees the same thing at the same instant.

## Isolation is not the same as consistency

This confusion derails interviews constantly. Two different questions, two different axes.

- **Consistency (the CAP kind)** asks: across *replicas of one object*, how fresh and well-ordered is what I read? It prevents stale reads from a lagging replica.
- **Isolation (the ACID kind)** asks: across *concurrent transactions on many objects*, how much can they step on each other? It prevents lost updates, dirty reads, and write skew.

A system can be serializable but not linearizable (perfect transaction isolation on a single node, but stale reads on a follower). It can be linearizable but not serializable (one perfectly fresh value with no multi-object transactions).

The gold standard that combines both is **strict serializability**: transactions behave like some serial order, *and* that order respects real time. Google Spanner delivers exactly this and brands it **external consistency**. So when someone says "strongly consistent," the sharp question is: do you mean *linearizable* (one object, freshest value) or *strict-serializable* (multi-object transactions in real-time order)? The answer changes your whole architecture.

## Two poles: Spanner and Dynamo

The clearest way to feel these trade-offs is to look at the two systems built at opposite extremes, for opposite business reasons.

### Spanner: pay the consistency price everywhere, on purpose

By 2011, Google's ad business had outgrown a sharded MySQL setup holding tens of terabytes of revenue-critical data. An advertiser's budget read had to reflect the latest charge *exactly*, across continents, because money was on the line. Naive CAP reasoning says a globally distributed database cannot do this. Spanner is the answer to "what if we just pay the consistency price everywhere, deliberately?"

Its trick is **TrueTime**. Instead of giving one timestamp, the clock returns an *interval* with a bounded uncertainty, kept to roughly 1 to 7 milliseconds using GPS and atomic clocks in every datacenter. To commit, Spanner does a **commit-wait**: it picks a timestamp and then waits out the uncertainty before confirming. That brief wait guarantees the commit time is unambiguously in the past everywhere on Earth, which is how it gets global real-time ordering without a single global clock.

The bill: every read-write transaction pays that commit-wait (a few milliseconds), and it needs special clock hardware. Under partition, Spanner stays consistent and gives up availability. A minority partition simply cannot commit, just like the clerk who stops selling. CockroachDB and YugabyteDB copy the idea without atomic clocks by using a looser clock bound and retrying reads instead.

### Dynamo: never refuse a write, on purpose

Amazon faced the mirror image. During the 2006 holiday peak, the shopping-cart service saw availability dips that turned directly into lost sales across millions of requests per second. Amazon's verdict: an "add to cart" must *never* fail, even during a partition, because a rejected write is a rejected dollar. Dynamo (the design DNA behind DynamoDB, Cassandra, and Riak) is the answer to "what if we just stay writeable everywhere, deliberately?"

It stays always-writeable using sloppy quorums and hinted handoff, writing to any reachable node during a partition. The cost it accepts is divergence. Two people adding to the same cart during a network blip can produce two versions, which the application merges back together later using version vectors. That is the famous "two divergent carts get merged" behavior, and it is a feature, not a bug.

### Same question, opposite answers

Neither system is "better." They answered the identical PACELC question with opposite values because their invariants differed.

- Google's invariant was "an advertiser is never double-charged, and balances are globally ordered." That *requires* linearizability, so Spanner is PC/EC.
- Amazon's invariant was "a cart add never fails." That *requires* availability, so DynamoDB is PA/EL.

Name the invariant first, and the pole follows. You do not pick consistency by taste.

## Tunable consistency: the modern stance

The most useful lesson from Azure Cosmos DB is that consistency is **per operation, not per database**. It exposes five named levels you choose per request, from strongest to weakest:

1. **Strong** — linearizable. For balances and inventory where overselling is unacceptable.
2. **Bounded staleness** — reads lag by at most K versions or T seconds, a *quantified* staleness. For leaderboards and dashboards.
3. **Session** (the default) — read-your-writes plus monotonic reads, scoped to a user's session. The 90% case: a logged-in user must see their own edits. Cheap and globally available.
4. **Consistent prefix** — you never see writes out of order, but may see an older snapshot. For activity feeds.
5. **Eventual** — converges, no order promise, lowest latency. For like counts and view counters where staleness is harmless.

Mature systems let you buy strength only where it matters and bank the latency and availability everywhere else.

## Common misconceptions

- **"We're CP, so we never lose data."** CP gives up *availability*, not durability, and only guarantees freshness if you read through the leader or quorum. Read from a follower for speed and you have quietly made an eventual-consistency decision, no matter the label.
- **"Serializable transactions mean my reads are always fresh."** False if those reads hit async replicas. Isolation and replica consistency are different guarantees.
- **"Last-write-wins is a safe conflict rule."** With physical clocks, a node whose clock is two seconds fast wins every conflict, and a backward-skewed node's newer writes vanish silently. Teams have lost data this way to ordinary clock glitches. Prefer version vectors or app-level merges.
- **"The marketing word 'consistent' is enough."** Always translate it. Linearizable? Causal? Bounded-stale by how much? Session-scoped? If the vendor cannot say, assume eventual.
- **"Strong consistency by default is the safe choice."** It is the *most expensive* default: latency on every operation and unavailability under partition. Most reads are happy with session or eventual.

## How to use this

A practical checklist for your next design or review:

1. **Name the invariant out loud first.** "Never double-charge" demands linearizability. "Never drop a write" demands availability. The invariant picks the pole, not your preference.
2. **Reserve strong consistency for the few things that need it** — balances, inventory counts, locks, leader election. Let likes, feeds, and counters run on session or eventual.
3. **Translate every "consistent" claim** into a precise model before you trust it: linearizable, causal, bounded-stale, or session-scoped.
4. **Default to session consistency for logged-in users.** Read-your-writes plus monotonic reads kills the bugs people actually notice, for the price of a sticky session or a version token.
5. **Check the quorum math** when tuning N, W, and R. Want strong reads? Make sure `W + R > N`. Want speed and availability? Knowingly break it.
6. **Keep the strong-consistency boundary inside one region.** Replicate across regions asynchronously, or every write pays the inter-region round trip and your latency graph looks like an outage.
7. **Never resolve conflicts with last-write-wins on physical clocks.** Use version vectors or an explicit merge function.

## Conclusion

Here is the one thing to carry away: the choice between consistency and availability is dictated by your business invariant, not your taste, and you mostly pay for it on the healthy network, not during the rare partition. Spanner and Dynamo answered the very same question in opposite ways simply because "never double-charge" and "never drop a write" are different promises.

So the next time a database calls itself "strongly consistent," you will know to ask the better question: strong in which of the five senses, and what does that cost me on every single request?

And there is a deeper rabbit hole waiting. How do these systems actually *agree* on a single order of events when machines fail mid-decision? That machinery, the algorithms named Paxos and Raft, is what quietly powers the consistent corner of everything you just read.
