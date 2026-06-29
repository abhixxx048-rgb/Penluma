---
title: "Distributed Systems Explained: Why Many Computers Act as One"
metaTitle: "Distributed Systems Explained Simply"
description: "A distributed system makes many computers behave as one. Learn partial failure, CAP, consistency, consensus, and idempotency in plain, practical language."
keywords:
  - distributed systems
  - distributed systems explained
  - CAP theorem
  - eventual consistency
  - partial failure
  - network partition
  - quorum
  - Raft consensus
  - idempotency
  - exactly-once delivery
  - PACELC
  - vector clocks
  - two-phase commit
  - saga pattern
  - horizontal scaling
topic: systems-fundamentals
topicTitle: Systems Fundamentals
category: Engineering
date: '2026-06-21'
order: 8
icon: ⚙️
author: Pritesh Yadav
transformed: true
faq:
  - q: What is a distributed system in simple terms?
    a: It's a group of separate computers connected over a network that work together so they look and behave like a single system to the user. When you open Netflix or search Google, you're really talking to thousands of machines pretending to be one.
  - q: What is the hardest problem in distributed systems?
    a: Partial failure. Some machines work and some don't, and you often can't tell the difference between a node that is slow, one that is dead, and a message that got lost. Almost every hard idea in the field is a strategy for staying correct despite that uncertainty.
  - q: What does the CAP theorem actually say?
    a: During a network partition you must choose between consistency (refusing possibly-wrong answers) and availability (answering with possibly-stale data). You cannot have both at that moment. Partitions are unavoidable, so the real decision is consistency versus availability during one.
  - q: Is exactly-once delivery possible?
    a: No. Exactly-once delivery over an unreliable network is provably impossible. What real systems achieve is exactly-once processing, which is at-least-once delivery plus idempotent handling that safely ignores duplicates.
  - q: Why shouldn't I order events using server timestamps?
    a: Because wall clocks on different machines drift, and time-sync protocols can even jump a clock backward. Comparing two server timestamps can give the wrong order and silently lose data. Use logical or vector clocks to track cause and effect instead.
sources: []
---

You open your banking app and check your balance. It feels like you tapped a single computer that simply knew the number. You didn't. Behind that one screen, hundreds or thousands of separate machines just coordinated across cables, switches, and continents to give you one clean answer.

That illusion of oneness is the entire job of a **distributed system**: a group of separate computers (each one called a **node**) that work together over a network so that, to you, they look and behave like a single machine.

The computer scientist Leslie Lamport described the pain of building these systems perfectly: *"A distributed system is one in which the failure of a computer you didn't even know existed can render your own computer unusable."* This article unpacks why we build them anyway, and why they are so famously hard to get right.

## Why this matters

Almost every product you use at scale is distributed. Netflix, Google, your bank, your messaging app, the game you play online. If you build software that needs to grow, survive failures, or feel fast to users far away, you will end up distributing it.

The trouble is that distributed systems break in ways single machines never do. Code that works perfectly on one laptop can corrupt data, double-charge customers, or freeze entire products once it spans multiple machines. The bugs are subtle, intermittent, and expensive.

Understanding a handful of core ideas, even without writing the low-level code, lets you reason about these systems, ask the right questions, and avoid the mistakes that take down real services. That is what you'll get here.

## Why build a distributed system at all?

Running on one machine is simple. We give up that simplicity for three concrete reasons.

- **Scale.** A single machine has a fixed ceiling of processing power, memory, and storage. When your traffic or data grows past the biggest single machine money can buy, you spread the work across many machines. Adding more boxes instead of buying one giant box is called **horizontal scaling**.
- **Reliability.** One machine is a **single point of failure**: when it dies, everything dies. With copies of your service running on many machines, the system survives any one machine dying. Oddly, more machines means *more* total failures happen, but the system keeps running through them.
- **Geography.** **Latency** means delay. A user in Tokyo and a user in London both want fast replies, but data can't travel faster than light, so a round trip around the world always takes hundreds of milliseconds. Putting servers near each region cuts that delay.

In short, we accept the hard problems of distribution to get three things one machine can't give: more capacity, survival through hardware failure, and speed for distant users.

## The one problem that changes everything: partial failure

On a single machine, things either work or the whole thing crashes. Failure is total and obvious. In a distributed system, the defining new problem is **partial failure**: some nodes work, some don't, and *you often cannot tell which*.

Here is the heart of the difficulty. You send a request to another node and hear nothing back. There are four possible reasons, and from where you sit they look **identical**:

1. Your request never arrived (it got lost on the way).
2. It arrived and was processed, but the reply got lost coming back.
3. The other node is just slow and is still working on it.
4. The other node is dead.

**An analogy you've lived.** You text a friend and get no reply. Did the text not arrive? Did they read it and not answer yet? Is their phone dead? You honestly cannot tell from your side. That uncertainty *is* partial failure. Nearly every hard idea below is a strategy for staying correct despite not knowing the answer.

### Network partitions and the timeout guess

A **network partition** is when the network splits so that two groups of perfectly healthy nodes can no longer talk to each other. Each group is fine; they just can't reach the other side. Worse, each side may wrongly conclude that the other side has died.

```
   Group A (healthy)         Group B (healthy)
   +-----------+   broken     +-----------+
   |  A1   A2  |---- X -------|  B1   B2  |
   +-----------+   link       +-----------+
        |                          |
   "B must be dead"          "A must be dead"
   (both wrong - the LINK died, not the nodes)
```

Your only practical tool for detecting failure is a **timeout**: "if I don't hear back in X seconds, assume it's dead." But a timeout is only ever a *guess*.

- **Too short**, and you wrongly declare healthy-but-slow nodes dead, then retry needlessly, sometimes flooding the system.
- **Too long**, and you hang for ages waiting on nodes that are genuinely dead.

There is no perfect timeout. In fact, reliably deciding "is that node down?" on a network with no guaranteed delivery time is provably impossible to do perfectly. A famous 1985 result, the **FLP impossibility** (named after Fischer, Lynch, and Paterson), proves that no algorithm can *guarantee* all nodes reach agreement on such a network if even one node may fail. Real systems get around this with timeouts and a bit of luck. They work in practice, just not with a mathematical guarantee.

## Common misconceptions

A few beliefs cause more distributed-systems outages than almost anything else. Here are the big ones, myth versus reality.

### "The network is reliable and fast"

This is the most expensive myth of all. Decades ago, Peter Deutsch and James Gosling at Sun Microsystems catalogued it as part of the **8 Fallacies of Distributed Computing**: false assumptions developers make when they treat a remote call like a local one.

| Fallacy | Reality |
|---|---|
| The network is reliable | Packets drop, cables get cut. |
| Latency is zero | Remote calls are far slower than local ones. |
| Bandwidth is infinite | Big payloads choke the link. |
| The network is secure | Assume it's hostile; encrypt and authenticate. |
| Topology doesn't change | Nodes, routes, and IPs change constantly. |
| There is one administrator | Many teams and configs; coordination is hard. |
| Transport cost is zero | Moving data costs money and CPU. |
| The network is homogeneous | Mixed hardware, protocols, and versions are normal. |

The practical lesson: a remote call is nothing like a local function call. "Chatty" designs that make hundreds of tiny network calls are one of the top performance killers. And never skip encryption or login checks between your own internal services just because they're "behind the firewall." Assume the network is hostile.

### "You can pick CA from the CAP theorem"

The **CAP theorem** (proposed by Eric Brewer in 2000, proved by Gilbert and Lynch in 2002) names three properties:

- **Consistency** — every read sees the most recent write, as if there were a single copy of the data.
- **Availability** — every request to a working node gets a real, non-error answer, even if that answer might be slightly out of date.
- **Partition tolerance** — the system keeps working even when messages between nodes are dropped or delayed.

People summarize it as "pick 2 of 3," but here's the honest framing: in any real network, partitions *will* happen, so partition tolerance is not optional. You don't get to "pick CA." Saying "we chose CA" really means "we didn't think about what happens during a partition." The only real decision is what to do *during* one:

- **CP** — refuse to answer rather than risk giving wrong data.
- **AP** — keep answering with possibly-stale data rather than go down.

A bank ATM picks **CP**: during a partition, "try again later" beats showing a wrong balance and letting you withdraw money twice. A social-media like-count picks **AP**: a slightly stale count is fine, but the page going down is not.

### "Eventual consistency means a few milliseconds"

**Eventual consistency** only promises that *if writes stop*, all copies will *eventually* settle on the same value. It says nothing about how long that takes. Reads can be arbitrarily stale in the meantime. Where users will notice, such as seeing their own freshly posted comment, you add stronger guarantees on purpose (more on that below).

### "Order events by their timestamps"

It's tempting to sort events across machines by the time on each server's clock. Don't. Each machine's **wall clock** drifts, and the protocol that syncs clocks over the internet (**NTP**) can even jump a clock *backward* to correct it. There is no single global "now." Comparing two timestamps from two servers can produce the wrong order and silently lose data.

## Consistency is a spectrum, not a switch

Consistency isn't all-or-nothing. It runs from strongest (easiest to reason about, most expensive) to weakest (cheapest and fastest, hardest to reason about).

- **Strong (linearizable)** — behaves as if there's one single copy; a read always returns the latest committed write. Simplest to think about, highest coordination cost.
- **Causal** — operations with a cause-and-effect link (like a reply to a comment) appear in that order everywhere, while unrelated operations may be seen in different orders on different nodes. A pleasant middle ground that keeps things that "make sense together" in order without forcing global agreement.
- **Eventual** — if writes stop, all copies eventually converge. Until then, reads may be stale or out of order. Cheapest and most available.

To make eventual consistency feel sane for a single user, systems layer on **session guarantees**:

- **Read-your-writes** — after *you* change something, *you* always see your own change (you post a comment and immediately see it).
- **Monotonic reads** — once you've seen a value, you never see an older one. No "going back in time."
- **Monotonic writes** — your writes are applied in the order you made them.

### PACELC: the fuller picture

CAP only describes what happens during a partition and ignores the everyday cost of consistency. Daniel Abadi's **PACELC** (2010) fills the gap. Read it as: *if* there's a **P**artition, choose **A**vailability or **C**onsistency; **E**lse, during normal operation, choose **L**atency or **C**onsistency.

The insight that surprises people: even on a perfectly healthy network, keeping copies strongly consistent requires extra coordination round-trips, and those round-trips add delay. **Strong consistency always costs latency.** Cassandra and Riak favor availability and speed with weaker consistency; Google Spanner, CockroachDB, and classic ACID SQL databases pay latency for strong consistency always.

## Keeping copies in agreement: quorums and consensus

**Replication** means keeping copies of data on several nodes, for durability, availability, and faster reads. The hard part is keeping the copies *agreeing* while nodes and networks misbehave.

A **quorum** is a voting trick. With **N** copies, require **W** nodes to confirm a write and **R** nodes to serve a read. If **R + W > N**, the read set and write set must overlap by at least one node, so a read is guaranteed to see the latest write.

```
  N = 3 replicas   W = 2 (write reaches 2)   R = 2 (read asks 2)
  Since 2 + 2 = 4 > 3, the sets MUST share a node.

   Write went to:  (n1, n2)
   Read asks:           (n2, n3)
                         ^^ overlap => read sees the fresh value
```

A **majority quorum** means more than half. It tolerates a minority failing and prevents two separate groups from both committing, which would cause **split-brain**: two halves each believing they're in charge and accepting conflicting writes.

**Consensus** is the act of making many nodes agree on a single ordered sequence of operations (a **replicated log**, the same append-only list in the same order on every node) despite crashes. Two algorithms dominate:

- **Paxos** (Leslie Lamport) — correct and foundational, but famously hard to understand and build.
- **Raft** (Ongaro and Ousterhout, 2014) — deliberately designed to be understandable. At any moment one node is the **leader** and the rest are followers. If the leader goes quiet, a follower times out, becomes a candidate, asks for votes, and whoever gets a majority becomes the new leader. Clients send writes to the leader, which appends each entry and forwards it to followers; once a majority confirms, the entry is committed.

```
 Follower --(no heartbeat, times out)--> Candidate
 Candidate --(asks for votes, gets a majority)--> Leader
 Leader --(sends heartbeats)--> Followers
 Leader crashes --> a Follower times out --> new election
```

Raft powers etcd, Consul, CockroachDB, and TiKV; Paxos-family algorithms underpin Google's Chubby and Spanner, and ZooKeeper. Because consensus needs a majority alive, it tolerates ⌊(N−1)/2⌋ failures: 3 nodes tolerate 1, 5 nodes tolerate 2.

A practical tip worth memorizing: **use an odd number of nodes** (3, 5, 7). A 4-node cluster gives no more fault tolerance than 3 and makes tie votes possible. And never confuse replication (just copying data) with consensus (agreeing on one order). You can replicate without consensus, but then you have no agreed order, which is exactly how split-brain and conflicting writes happen.

## Why retries need idempotency

Because the network is unreliable, clients **retry**. But a retry can duplicate work: maybe your first request *did* succeed and only the reply got lost. The fix is **idempotency**, meaning doing the operation twice has the same effect as doing it once.

Consider the difference. `SET balance = 100` run twice still leaves 100, so it's safe to retry. But `ADD 100 to balance` run twice adds 200; a lost-reply retry just double-charged the customer. The cure is an **idempotency key**: the client attaches a unique ID (say `order-abc123`), and the server records which IDs it has already processed and ignores duplicates.

This is also why systems describe how hard they try to deliver a message:

- **At-most-once** — never retry; may lose messages. Simple but lossy.
- **At-least-once** — retry until confirmed; may deliver duplicates. The common, practical default.
- **Exactly-once delivery** over an unreliable channel is **impossible**.

That impossibility is captured by the classic **Two Generals Problem**: two armies on opposite hills must attack at the same time, but every messenger crossing the valley might be captured. Even a confirmation can be lost, and so can the confirmation of the confirmation. Neither general can ever be 100% certain the other received the message.

So when a product advertises "exactly-once," what it really delivers is **exactly-once processing**: at-least-once delivery *plus* idempotent handling on the receiving end. There is never true network-level exactly-once. The takeaway: make your handlers idempotent *before* you add retries, and always write idempotent consumers regardless of marketing claims.

## Ordering events without trusting the clock

Since wall clocks lie, distributed systems use **logical clocks** that order events by cause and effect rather than by time.

- **Lamport timestamps** — each node keeps a counter, bumps it on every event, and on receiving a message sets its counter to `max(local, received) + 1`. The guarantee: if A caused B, A's number is smaller. But the reverse isn't true; a smaller number does *not* prove a causal link.
- **Vector clocks** — each node tracks a list of counters, one per node. By comparing two vectors you can tell whether two events are causally ordered or genuinely **concurrent** (neither caused the other). This is how systems detect conflicting writes that must be reconciled. The cost is that the vector grows with the number of nodes.

Picture three people editing a shared document. A Lamport number can say "edit 5 came after edit 3" but can't tell you whether two edits happened independently. Vector clocks like `[A:2, B:1, C:0]` versus `[A:1, B:2, C:0]` reveal that neither came before the other; they're concurrent and conflict, so a human or a merge rule must resolve them.

The rare exception is Google **Spanner**'s **TrueTime**, which tames physical clocks using GPS and atomic clocks, then deliberately waits out a small uncertainty window to give globally consistent timestamps. Most systems don't have that hardware, so the rule stands: never do "last write wins" by system clock.

## Transactions across services: 2PC versus Sagas

A **transaction** is a group of operations that must all succeed or all fail together. Inside one database this is easy. Spanning several services or databases is hard, and there are two main approaches.

**Two-Phase Commit (2PC)** uses a central **coordinator**. First it asks every participant "can you commit?" and each locks its resources and votes yes or no. Then, if everyone said yes, it tells them all to commit; otherwise it tells them all to abort. This gives atomicity, but it is **blocking**: participants hold their locks while waiting, and if the coordinator crashes after the vote, they can be stuck holding locks indefinitely. The coordinator is a single point of failure, which makes 2PC a poor fit for microservices.

The **Saga pattern** takes a different path. Instead of one global transaction, it runs a *sequence of local transactions*, each committing on its own in its own service. If a later step fails, the system runs **compensating transactions** that semantically undo the earlier ones, rather than rolling everything back at once.

For an e-commerce order: (1) reserve inventory, (2) charge the card, (3) book shipping. If shipping fails, run the compensations in reverse: refund the card, release the inventory. No global locks are ever held.

The trade-off is real. Sagas are far more scalable and available than 2PC, but you give up isolation. Other operations can briefly see half-finished state, and every step needs a genuine undo action. So the mistake to avoid is reaching for 2PC "for safety" across microservices and then watching it block, or designing only the happy path of a Saga and forgetting the compensations.

## How to use this

You don't need to implement Raft to apply these ideas. Here's a practical checklist for the next time you design or debug something distributed.

1. **Assume partial failure everywhere.** Treat "no response" as ambiguous, never as "dead." Design for the case where you simply don't know.
2. **Tune timeouts with backoff and jitter.** Pair every timeout with retries that wait longer each attempt, add small random delays so clients don't all retry in lockstep, and add circuit breakers that stop calling a failing service for a while.
3. **Decide CP versus AP per feature, on purpose.** Money and inventory usually want CP. Likes, view counts, and feeds usually want AP. Write the choice down so it isn't an accident.
4. **Make handlers idempotent before adding retries.** Use idempotency keys, deduplication, or upserts so a duplicated request can't double-charge or double-send.
5. **Add session guarantees where users watch.** Read-your-writes and monotonic reads keep eventual consistency from feeling broken on the screens people stare at.
6. **Use odd node counts for anything that votes.** Three, five, or seven. A 4-node cluster buys you nothing extra and invites tie votes.
7. **Never order events by server clocks.** Reach for logical or vector clocks when causality matters; treat "last write wins" by timestamp as a known data-loss bug.
8. **Prefer Sagas over 2PC across services**, and write a real compensating action for every step.

## Conclusion

If you remember one thing, make it this: the root of every hard problem in distributed systems is that **you cannot tell "slow" from "dead."** That single ambiguity, partial failure, is what forces timeouts, quorums, consensus, idempotency, logical clocks, and Sagas into existence. Once you see them as different answers to the same uncertainty, the whole field clicks into place.

So here's a question to carry forward. We've talked about making many machines *agree* and *survive failure*, but we mostly assumed those machines were honest, just slow or crashed. What happens when a node lies, sends different answers to different peers, or is actively malicious? That's the world of **Byzantine fault tolerance**, the problem at the heart of everything from aircraft systems to blockchains, and it's where this story gets even stranger.
