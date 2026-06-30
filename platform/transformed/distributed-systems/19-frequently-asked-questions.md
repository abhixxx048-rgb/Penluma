---
title: "Distributed Systems FAQ: The Questions Everyone Asks"
metaTitle: "Distributed Systems FAQ: Clear, Honest Answers"
description: "Plain-language answers to the distributed systems questions that trip people up: clocks, CAP, consistency, quorums, and why the network keeps lying to you."
keywords:
  - distributed systems FAQ
  - what makes a system distributed
  - clock skew
  - Lamport clock vs vector clock
  - CAP theorem explained
  - eventual consistency
  - linearizability
  - quorum more than half
  - idempotent retries
  - fault vs failure
  - PACELC
  - consistency models
faq:
  - q: What actually makes a system "distributed"?
    a: A system becomes distributed the moment two or more separate machines cooperate to provide one service and can only learn about each other by sending messages over a network. That network can be slow, drop messages, or split in two, and that single fact is the source of all the difficulty.
  - q: Is the CAP theorem still relevant?
    a: Yes, but it is often quoted too simply. CAP only describes what happens during a network partition, and even then the real choice is just consistency versus availability. PACELC is the more honest modern framing because it also covers the latency-versus-consistency trade-off when nothing is broken.
  - q: Does "eventually consistent" mean my data is wrong?
    a: No. It means a read might return an old-but-valid value before all copies catch up. Eventual consistency promises that if writes stop, every copy converges to the same correct value. The data is never garbage, it is just possibly behind.
  - q: Why do retries need to be idempotent?
    a: On an unreliable network you often cannot tell whether your request failed or just the reply got lost. Idempotency means repeating the operation has no extra effect, so retrying is always safe, even for actions like charging a card.
  - q: What is a quorum, and why "more than half"?
    a: A quorum is the minimum number of nodes that must agree for a decision to count. More than half is popular because two different majorities can never exist at once, so the system can never make two conflicting decisions, even during a network split.
  - q: Should I use a Lamport clock or a vector clock?
    a: Use a Lamport clock when you only need one agreed order of events. Use a vector clock when you need to know whether two events were truly causally related or just concurrent, for example to detect write conflicts. Vector clocks cost more space because they store one number per node.
author: Pritesh Yadav (priteshyadav444)
transformed: true
topic: distributed-systems
linked: true
topicTitle: Distributed Systems
category: Engineering
date: '2026-06-21'
order: 18
icon: "\U0001F310"
sources: []
---

You can read every textbook chapter on distributed systems and still freeze up when someone asks, "wait, so does eventual consistency mean my data is wrong?" The hard part was never the definitions. It is the handful of stubborn questions that keep resurfacing in design reviews, interviews, and 2 a.m. incident calls.

This is the answer key. No jargon dumps, no proofs, just the questions people actually ask and the clearest answers I can give.

## Why this matters

Most production outages are not caused by exotic algorithms. They are caused by someone quietly assuming the network is reliable, or that two clocks agree, or that "eventually consistent" is close enough for a bank balance.

Get the mental models right and you make better calls everywhere: choosing a database, designing a retry, reasoning about a race condition. These ideas are the difference between "the system is slow today" and "the system silently charged a customer twice." Let's clear up the questions that cause the most confusion.

## What makes a system "distributed"?

A single server running everything is **not** distributed, even if it powers a huge website.

It becomes [distributed](/blog/distributed-systems/12-what-is-a-distributed-system) the moment two or more separate machines, called **nodes**, cooperate to provide one service. The defining feature is that those nodes can only learn about each other by **sending messages over a network**. And that network can be slow, drop messages, or split in two.

That one fact is where all the difficulty comes from. Once machines can only talk by passing notes that might get lost, simple things like "what time is it?" and "what's the latest value?" become genuinely hard.

## Clocks and time: why you can't just sort by timestamp

### Why not put a timestamp on everything?

Because every machine's clock is slightly wrong, and they are all wrong by **different amounts**. This gap is called **clock skew**.

Two events a millisecond apart on two machines can easily get timestamps in the wrong order. So sorting by wall-clock time can tell you event B came "before" event A, even when A actually *caused* B. That is why [logical clocks](/blog/distributed-systems/14-time-clocks-the-ordering-of-events) exist: to order events correctly without trusting the wall clock.

### Doesn't NTP fix this?

NTP (the protocol that syncs clocks over the internet) **narrows** the gap. It does not close it.

After syncing, machines are still typically a few milliseconds apart, and network delay means the correction itself arrives a little late. A few milliseconds sounds tiny, but in computing it is an eternity. Thousands of events can happen in that window. NTP makes timestamps "good enough for humans," not "good enough to safely order events."

### Lamport clock or vector clock?

Both are logical clocks, but they answer different questions.

- Use a **Lamport clock** when you only need to put events into one agreed order and you do not care *why* they are ordered that way. It is just one number.
- Use a [vector clock](/blog/distributed-systems/15-vector-clocks-causality) when you need to know whether two events were truly **causally related** or just happened independently (**concurrent**). For example, to detect and resolve conflicting writes.

The one-sentence difference: a Lamport clock guarantees "if A caused B, then A's number is smaller" but a smaller number does not *prove* causation. A vector clock can actually tell you "A caused B," "B caused A," or "they're concurrent" with certainty.

The trade-off is cost. A Lamport clock is a single number. A vector clock keeps **one number per node**, so it takes more space and grows as your cluster grows.

## CAP, PACELC, and the trade-offs

### Is the CAP theorem outdated?

Still relevant, but usually quoted too simply.

CAP only describes what happens **during a network partition** (a moment when nodes can't reach each other). And even then it is not a clean "pick 2 of 3," because on a real network, partition tolerance is mandatory. You don't get to opt out of the network breaking.

So the real choice is just **consistency versus availability while the network is split**. [PACELC](/blog/distributed-systems/16-the-cap-theorem-and-pacelc) is the more honest, modern framing because it adds the part CAP ignores: even when nothing is broken (which is most of the time), you still trade **latency versus consistency**.

### If I "choose availability," does my data get corrupted?

No. It means that during a network split, different parts of the system may temporarily show different (stale) values, and they may have to reconcile conflicting writes afterward.

The data is not corrupt. It is just temporarily out of agreement. Choosing **consistency** instead means some requests get refused during the split, rather than risk showing a stale answer.

## Consistency models: what your database actually promises

### Does "eventually consistent" mean my data is wrong?

Not wrong, just possibly **not the latest yet**.

[Eventual consistency](/blog/distributed-systems/17-consistency-models) promises that if writes stop, every copy will converge to the same correct value. In the meantime, a read might be **stale**: an old-but-valid value. For a "likes" count, that is completely fine. For a bank balance, you would want something stronger. The data is never garbage. It is just behind.

### How stale can an eventually consistent read get?

Here is the uncomfortable part: the basic definition gives **no time bound at all**.

"Eventually" could in theory be a long time, though good systems in practice converge in milliseconds to seconds. If you need a real promise like "no more than 5 seconds behind," you need a stronger model such as **bounded staleness**. Plain eventual consistency does not give you one.

### Is linearizability the same as ACID, or "fast"?

No on both counts.

**Linearizability** is about the **freshness and ordering of a single object**. The system behaves as if there is one copy and every operation happens at one instant. It says nothing about speed (it usually *costs* latency), and it is not the same as **ACID** transactions, which are about multi-step operations being all-or-nothing and isolated.

They are different guarantees that often show up together but are not interchangeable.

### Strong consistency sounds best. Why doesn't everyone use it?

Because it costs latency and availability.

To guarantee every read is current, nodes must coordinate **before** answering, which is slower. And during a partition they may have to refuse requests entirely (the CAP choice). For data where being stale by a moment is harmless, a weaker model gives you a faster, more available system.

The rule of thumb: **pick the weakest consistency model that is still correct for your use case.**

## Faults, retries, and quorums

### What's the difference between a fault and a failure?

They sound identical, but the distinction is the whole game.

- A **fault** is one thing going wrong locally: a disk dies, a packet is lost, a node freezes.
- A **failure** is when the **whole system** stops doing its job.

The entire craft of distributed systems is stopping faults from turning into failures. That is what "fault tolerance" means. Faults are normal and constant. Failures are what you design to prevent.

### Why do retries need to be idempotent?

Because on an unreliable network, you often cannot tell whether your **request** failed or whether just the **reply** got lost.

If you resend a non-idempotent request like "charge $10," you might charge twice. **Idempotency** means doing the operation again has no extra effect, so retrying is always safe. This is exactly why so many systems use **idempotency keys**: a unique token that lets the server recognize a repeat and ignore it.

### What is a quorum, and why "more than half"?

A **quorum** is the minimum number of nodes that must agree for a decision to count.

"More than half" (a majority) is the popular choice because **two different majorities can never exist at the same time**. So the system can never accidentally make two conflicting decisions, even if the network splits in two. It is how you stay safe without needing every single node to respond.

## Common misconceptions

- **"It's distributed because it's on a server somewhere."** No. One machine is not distributed. You need two or more nodes cooperating over a network.
- **"NTP keeps clocks in sync."** It narrows skew to a few milliseconds, which is still thousands of events of uncertainty. Don't order events by wall-clock time.
- **"Eventually consistent means buggy."** It means temporarily behind, then correct. Never corrupt.
- **"Linearizability = ACID = fast."** Three different things. Linearizability is about a single object's freshness, ACID is about multi-step transactions, and neither implies speed.
- **"Choosing availability corrupts data."** It only allows temporary disagreement that gets reconciled later.

## How to use this

When you are designing or debugging a distributed system, walk this checklist:

1. **Assume the network is slow, lossy, and can split.** Start every design from "messages may be late, lost, or reordered." Most good decisions fall out of this one habit.
2. **Never order events by wall-clock time.** If ordering or causality matters, reach for logical clocks. One number (Lamport) for a single order, one-per-node (vector) when you need to detect concurrency.
3. **Name your consistency need out loud.** Ask "what's the worst that happens if this read is 2 seconds stale?" Then pick the weakest model that is still correct, and write it down.
4. **Make every retry-able operation idempotent.** Add idempotency keys to anything that mutates state, especially payments and writes. Assume replies will get lost.
5. **Use majority quorums for decisions that must be unique.** When two conflicting decisions would be a disaster, require more than half to agree.
6. **Reason in CAP during partitions, PACELC the rest of the time.** During a split, decide consciously between consistency and availability. When healthy, remember you're still trading latency for consistency.

## Conclusion

If you remember one thing, make it this: **almost every hard problem in distributed systems traces back to a single assumption being false, that the network is reliable.** Drop that assumption, and clocks, consistency, quorums, and retries stop feeling like trivia and start feeling like common sense.

The natural next question is the one this FAQ only gestures at: when nodes *must* agree despite an unreliable network, how do they actually reach that agreement? That is the world of [consensus algorithms](/blog/distributed-systems/02-the-consensus-problem) like Paxos and Raft, where machines that don't trust the clock, the network, or each other still manage to decide as one. That is where these ideas come together, and it is well worth your next afternoon.
