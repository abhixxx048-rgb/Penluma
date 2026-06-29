---
title: "Distributed Systems Cheat Sheet: The Ideas You Actually Need"
metaTitle: "Distributed Systems Cheat Sheet (Core Concepts)"
description: "A plain-English distributed systems cheat sheet: the 8 fallacies, CAP vs PACELC, logical clocks, and consistency models you can remember under pressure."
keywords:
  - distributed systems cheat sheet
  - 8 fallacies of distributed computing
  - CAP theorem explained
  - PACELC theorem
  - Lamport clock vs vector clock
  - consistency models
  - eventual consistency
  - happens-before relationship
  - quorum distributed systems
  - idempotency retries
  - linearizability
  - causal consistency
topic: distributed-systems
topicTitle: Distributed Systems
category: Engineering
date: '2026-06-21'
order: 19
icon: "\U0001F310"
author: Pritesh Yadav (priteshyadav444)
transformed: true
sources: []
faq:
  - q: What is the most important fallacy of distributed computing?
    a: "\"The network is reliable\" is the one to never forget. Messages can be slow, lost, duplicated, reordered, or cut off, and a slow message looks identical to a lost one."
  - q: What is the difference between CAP and PACELC?
    a: "CAP says that during a network partition you must choose consistency or availability. PACELC adds the rest of the time: even with no partition, you trade latency against consistency. The cost of strong consistency never fully goes away."
  - q: When should I use a Lamport clock versus a vector clock?
    a: "Use a Lamport clock when you only need a consistent ordering of events and want it cheap (one number per node). Use a vector clock when you need to detect whether two events were concurrent or causally related."
  - q: Does eventual consistency mean my data is wrong?
    a: "No. Stale is not the same as wrong. Eventually consistent data is just behind the latest write, not corrupted. If writes stop, all copies converge to the same value."
  - q: Why does every retried operation need to be idempotent?
    a: "Because you cannot tell a lost request from a lost reply. If you retry and the original actually succeeded, an idempotent operation makes the duplicate harmless."
  - q: What is a quorum and why does it matter?
    a: "A quorum is a required majority, usually more than half the nodes, that must agree before a decision counts. Because two majorities always overlap, two conflicting decisions can never both win."
---

You ship a feature. It works on your laptop. It works in staging. Then it goes live across three data centers and starts doing things that should be impossible: a user sees their own comment vanish, a counter goes backwards, a payment fires twice.

Nothing is broken. No exception, no red alert. This is just what happens when computers talk over a network. The good news is that the whole field of distributed systems rests on a small set of ideas. Learn those, and most of these "impossible" bugs become predictable.

This is your cheat sheet for those core ideas, in plain language.

## Why this matters

Almost every system you touch today is distributed. A web app talks to a database on another machine. Microservices call each other. Your phone syncs to the cloud. The moment two programs communicate over a network, the rules change.

The trap is that distributed systems mostly *look* fine. They pass tests. They run for weeks. Then a switch reboots, a cable gets bumped, or traffic spikes, and the cracks show. The bugs are rare, hard to reproduce, and expensive.

The engineers who stay calm during those incidents are not smarter. They just carry a mental model of what a network can and cannot promise. That is exactly what this page gives you.

## The 8 fallacies: assumptions that will burn you

Decades ago, engineers at Sun Microsystems noticed that newcomers kept making the same wrong assumptions about networks. They wrote them down. Every single one is **false**:

1. The network is reliable
2. Latency is zero
3. Bandwidth is infinite
4. The network is secure
5. Topology doesn't change
6. There is one administrator
7. Transport cost is zero
8. The network is homogeneous

You don't have to memorize all eight. Memorize the first one.

**"The network is reliable" is false.** Assume any message can be slow, lost, duplicated, reordered, or cut off entirely. And here is the part that trips people up: a slow message is indistinguishable from a lost one. When you send a request and hear nothing back, you genuinely cannot know whether it never arrived, arrived but the reply got lost, or is still in flight.

Think of mailing a letter with no tracking. Silence tells you nothing. Maybe it's still in transit, maybe it was delivered and the reply is lost, maybe it fell off the truck. Your code has to be correct in all three cases.

## Fault vs failure: the distinction that shapes your design

These two words sound alike and get used interchangeably in casual talk. In distributed systems they mean very different things, and the difference is the whole game.

| Term | Meaning | Your goal |
|------|---------|-----------|
| **Fault** | One component goes wrong (a disk, a packet, a node) | Tolerate it |
| **Failure** | The whole system stops doing its job | Prevent it |

Faults are constant and normal. At any real scale, something is always a little broken: a disk is dying, a packet dropped, a node is slow. You are not trying to stop faults from happening; that's impossible.

Your actual job is to **stop faults from turning into failures**. One bad disk should not take down the service. One unreachable node should not freeze every request. Good design absorbs faults so the system keeps doing its job.

## Time is a lie: ordering events without a clock

Here's a question that sounds trivial until it isn't: did event A happen before event B?

On a single machine, easy. There's one clock and one timeline. Across machines, there is no shared "now." Every server's clock drifts slightly, and you cannot trust wall-clock time to order events. (NTP, the protocol that syncs clocks, narrows the gap but never closes it. Assume milliseconds of error, always.)

So instead of physical time, distributed systems use **logical ordering** based on cause and effect. The rule is called **happens-before**, written A → B:

- **Same node, in order:** if A runs then B runs on one machine, then A → B.
- **Messages:** sending a message → receiving that message. The send always comes before the receive.
- **Transitive:** if A → B and B → C, then A → C.
- **Concurrent:** if neither A → B nor B → A, the events are concurrent - independent, with no defined order.

That last case is the key insight. Two events can be genuinely *concurrent*, meaning neither caused the other. Trying to force an order on them is where many bugs are born.

### Lamport clocks vs vector clocks

To track happens-before in code, you attach a small counter to events. There are two flavors, and choosing the right one matters.

| | Lamport clock | Vector clock |
|---|---|---|
| **Size** | One number per node | A list: one number per node, *per node* |
| **On local event** | counter += 1 | increment your own slot |
| **On send** | send the counter with the message | send the whole list |
| **On receive** | counter = max(local, received) + 1 | take the max of each slot, then increment your own |
| **Can prove A → B?** | Partly: A → B means A < B, but A < B does *not* prove A → B | Yes, fully |
| **Detects concurrency?** | No | Yes |

A **Lamport clock** is cheap: just one number. It gives you a consistent total order, which is often all you need. Its limit is that it can't tell you whether two events were concurrent or causally linked.

A **vector clock** carries more (a number for every node), but in exchange it can tell you exactly how any two events relate: A before B, B before A, or concurrent.

To compare two vectors: if every slot of V1 is ≤ V2 and at least one is strictly less, then A → B. If some slots are bigger and others smaller, the events are **concurrent**. That comparison is how systems detect conflicting writes that need merging.

## CAP and PACELC: the trade-off you cannot escape

This is the most quoted and most misquoted idea in the field. Here's the honest version.

**CAP:** during a network **partition** (when nodes can't reach each other), you must choose between **consistency** (every read sees the latest write) and **availability** (every request gets an answer). You cannot have both while the network is split.

On real networks, partitions *will* happen, so partition tolerance isn't optional. That means CAP really boils down to one choice during a split: **C or A**.

- A **CP system** refuses some requests during a partition rather than serve stale data. It prefers being correct over being available.
- An **AP system** always answers, even if the data might be stale, and reconciles later. It prefers being available over being perfectly fresh.

**PACELC** completes the picture. It says: *if there's a Partition, choose A vs C; Else (normal operation), choose Latency vs C.* In plain terms: even when nothing is broken, keeping copies strongly consistent costs you latency. The price of consistency never fully disappears - it just shows up as availability during partitions and as latency the rest of the time.

A real example: a shopping cart is usually built **AP**. If two data centers briefly disagree about your cart, the system would rather show you *something* and merge later than show an error. A bank ledger leans **CP**: better to reject a transaction than to risk double-spending.

## The consistency ladder: from strict to relaxed

"Consistency" isn't one thing. It's a ladder, from strongest and most expensive at the top to weakest and cheapest at the bottom.

| Model | The promise, in plain English |
|-------|-------------------------------|
| **Linearizable** (strongest) | Acts like a single copy. Every read sees the latest write, instantly. |
| **Sequential** | Everyone sees operations in the same order, but not necessarily in real time. |
| **Causal** | Cause is always seen before effect. Unrelated events may appear in different orders. |
| **Read-your-writes / monotonic reads** | You always see your own changes and never go backwards in time. |
| **Eventual** (weakest) | If writes stop, all copies eventually match. Reads may be stale in the meantime. |

The instinct is to reach for the top of the ladder, because "latest data, always" sounds obviously correct. But every step up the ladder costs you latency and availability. The skill is picking the *lowest* rung that still keeps your feature correct.

A social feed is fine with **causal** consistency: you just need to see a reply after the comment it answers. Forcing linearizability there would slow everything down for no real benefit.

## Common misconceptions

**"Stale data is wrong data."** No. Stale means behind, not broken. Eventually consistent data is simply a few moments out of date, and it converges once writes settle. Corrupt is a different problem entirely.

**"Stronger consistency is always better."** It's safer in the narrow sense of freshness, but it isn't free. You pay in latency, and during partitions you pay in availability. Strong consistency where you don't need it is just self-inflicted slowness.

**"A timeout means the operation failed."** A timeout means you didn't hear back. The operation may have fully succeeded and only the reply got lost. This is why blind retries are dangerous.

**"Better clocks will fix ordering."** Tighter clock sync helps, but skew never reaches zero. If your correctness depends on wall-clock ordering across machines, it is already broken. Use logical clocks.

## How to use this

When you design or debug a distributed system, walk through these checks:

1. **Assume the network drops messages.** Never write code that's only correct when every packet arrives. Lost, slow, duplicated, reordered - design for all of it.
2. **Never order cross-machine events by wall-clock time.** Use logical clocks (Lamport or vector) when order matters across nodes.
3. **Make every retried operation idempotent.** Since you can't tell a lost request from a lost reply, retrying must be safe to do twice. Use unique request IDs so duplicates are ignored.
4. **Pick the weakest consistency model that's still correct.** Start at the bottom of the ladder and climb only as far as your use case forces you.
5. **Use a quorum for decisions.** Require more than half the nodes to agree. Because two majorities always overlap, two conflicting decisions can never both win.
6. **Treat faults as normal.** Build so that one bad disk, slow node, or dropped packet degrades gracefully instead of cascading into a full outage.

## Conclusion

If you take one thing from this page, take this: **the network is not reliable, and a slow message looks exactly like a lost one.** Almost every hard distributed systems problem unfolds from that single fact. Design as if silence tells you nothing, because it doesn't.

Once that clicks, a natural next question appears: if nodes can't trust the network or each other, how do they ever *agree* on anything - like who's the leader, or what the next entry in the log is? That's the world of consensus algorithms like Paxos and Raft, and it's where these fundamentals turn into real machinery worth exploring next.
