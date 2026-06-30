---
title: "Why Distributed Systems Are Hard (and How to Survive It)"
metaTitle: "Why Distributed Systems Are Hard"
description: "Why distributed systems are hard: partial failure, unreliable networks, no shared clock, plus the timeouts, retries, and idempotency that save you."
keywords:
  - why distributed systems are hard
  - partial failure
  - eight fallacies of distributed computing
  - two generals problem
  - idempotency key
  - distributed systems for beginners
  - network is unreliable
  - clock skew distributed systems
  - timeouts and retries
  - a note on distributed computing
  - distributed systems concurrency
  - last write wins clock drift
faq:
  - q: Why are distributed systems so much harder than single-machine programs?
    a: "Because three guarantees you rely on quietly disappear: shared memory, a shared clock, and shared fate. Parts can fail independently while the rest keeps running, and a crashed machine looks identical to a slow one."
  - q: What is partial failure in distributed systems?
    a: It is when some parts of a system fail while others keep running, unaware. On one computer a crash stops everything together. Across machines, one node can die while the rest carry on, and you often cannot tell whether your request succeeded.
  - q: What is an idempotency key and why does it matter?
    a: It is a unique ID a client attaches to a request so the server can recognize duplicates. If a reply gets lost and the client retries, the server sees the same key and returns the original result instead of doing the work twice, making retries safe.
  - q: What is the Two Generals Problem?
    a: A proof that two parties communicating over an unreliable channel can never become 100 percent certain they agree, because every message needs a confirmation and every confirmation needs another. You must act under residual uncertainty.
  - q: What are the Eight Fallacies of Distributed Computing?
    a: Eight false but tempting assumptions, such as "the network is reliable" and "latency is zero." Each feels obviously true, is actually false, and carries a real cost when you build on it.
  - q: Why can't I just order events by timestamp across servers?
    a: Because every machine's clock differs and drifts. Two timestamps from two clocks can disagree by more than the time gap you are measuring, so "last write wins" by wall-clock time can silently discard the newer write.
topic: distributed-systems
linked: true
topicTitle: Distributed Systems
category: Engineering
date: '2026-06-21'
order: 12
icon: "\U0001F310"
author: Pritesh Yadav (priteshyadav444)
transformed: true
sources: []
---

You text a friend "Still on for dinner?" and hear nothing back. Did the message fail to send? Did they read it and not reply? Are they driving? Did they drop their phone in a lake? From your side, all four feel exactly the same: silence.

Now imagine your entire business runs on guessing correctly. That is distributed computing in one sentence.

[A distributed system is a group of separate computers that work together over a network](/blog/distributed-systems/12-what-is-a-distributed-system) but appear, to the user, as one system. Building one is hard for a reason most tutorials skip: the rules you have trusted your whole career quietly stop being true the moment a network gets involved.

## Why this matters

On a single machine, all your code shares three comforts: the same memory, the same clock, and the same fate. If the program crashes, everything stops together. You never write code that asks "what if assigning this variable only half-worked?" because it cannot half-work.

A distributed system throws away all three. The parts are physically separate, with their own power, memory, and operating systems. Nothing forces them to fail together, agree on the time, or take turns.

If you ignore that, your system does not gently warn you. It corrupts data, double-charges customers, or hangs forever the first time a packet goes missing in production. The good news: the failure modes are well understood, and the survival tools are simple once you see why they exist.

A few plain-English words we will use throughout:

- **Node** - one computer or running process in the system (a server, a database replica, a microservice).
- **Network** - the cables, routers, and software that carry messages between nodes. The postal service between computers.
- **Message** - a chunk of data one node sends another: a request, a reply, a heartbeat.
- **State** - the data a node holds right now: account balances, sessions, counters.

## Partial failure: the problem with no single-machine equivalent

**Partial failure** means some parts of the system break while others keep running, unaware. One server out of ten dies, or one network link drops, and the rest carry on as if nothing happened.

On a single computer, failure is total. There is no awkward state where half your variables are alive and half are dead. In a distributed system, that in-between state is the *normal* case.

Picture node A asking node B to "save this order":

1. A sends the request across the network.
2. B receives it and saves the order.
3. B sends "done!" back, but the reply is lost on the way.
4. A waits, and waits, and hears nothing.

Look at A's situation. It sent a request and got silence. A genuinely cannot tell which of these happened:

- The request never reached B, so nothing was saved.
- B saved the order, but the reply was lost, so it *was* saved.
- B is just slow and the reply is still coming.
- B crashed completely, so maybe saved, maybe not.

This is the cruel heart of the field: **from the outside, a crashed node looks identical to a slow one.** Silence tells you nothing. There is no signal that says "I am definitely dead." A dead node and a node stuck behind a slow link produce the exact same thing, no answer.

**The takeaway:** you can never assume "it worked" just because you saw no error. Silence is ambiguous, and every remote interaction can half-work.

## The network is unreliable, treat it like an enemy

The thing carrying your messages is not a reliable pipe. Messages can be:

- **Lost** - they never arrive.
- **Delayed** - they arrive much later than expected.
- **Duplicated** - they arrive more than once.
- **Reordered** - they arrive in a different order than you sent them.

This is not bad luck. A network is a long chain of cables, switches, and routers spanning buildings, cities, or continents. Each hop has buffers that overflow and drop packets. Routers reboot. Cables get cut. Retransmission software sometimes produces duplicates. No physical law guarantees that what you send arrives, arrives once, or arrives in order.

Here is how it bites. You send "withdraw $100" to a bank node. The network drops it. You see no response, assume it failed, and send it again. *This time* it arrives, but so does the first one, which was only delayed, not lost. The account is now debited $200. One intended action became two.

You might think TCP solves this. **TCP** (the protocol your web requests ride on) exists *precisely because* the raw network is unreliable. It adds sequence numbers, acknowledgements, and retransmission. But it only fixes loss and ordering *within one connection*. The moment a connection drops, and connections drop constantly, TCP cannot tell you whether your last message was processed. You are back to guessing.

> Think of it as mailing postcards. Most arrive. Some get lost. Occasionally the post office prints two copies. Sometimes Monday's postcard shows up after Tuesday's. You would never run a bank that way, yet that is the medium every distributed system is built on.

**The takeaway:** any code that assumes "I sent it, so it arrived exactly once" is already broken. It just has not failed yet.

## There is no shared "now"

Every machine has its own clock, and **no two clocks agree exactly.** There is no single authoritative "now" all nodes can read. Worse, clocks **drift**, speeding up or slowing down slightly over time, so the disagreement keeps changing.

The reason is physical. A clock is a tiny vibrating crystal, and no two crystals vibrate at the same rate. Temperature and age change them. Systems fight this with **NTP** (Network Time Protocol, software that periodically asks a time server for the time and nudges the local clock toward it), but NTP runs over the same unreliable, variable-delay network. It gets clocks *close*, never identical. Off by milliseconds normally, off by seconds when something goes wrong.

This quietly breaks a huge amount of ordinary logic. "Which write happened last?" "Did this token expire?" "Sort these events by timestamp." On one machine those are trivial. Across machines, [comparing two timestamps from two clocks](/blog/distributed-systems/14-time-clocks-the-ordering-of-events) is **meaningless**, because the clocks may disagree by more than the gap you are trying to measure. An event that truly happened *later* can carry a *lower* timestamp.

### A real data-loss footgun

Apache **Cassandra** historically used a "last write wins" rule based on wall-clock timestamps. If two servers had slightly skewed clocks, an *older* write with a *higher* timestamp could silently overwrite a *newer* write with a lower one, quietly losing a customer's most recent update. The root cause is exactly "there is no global now."

Systems that need true ordering use **logical clocks** (Lamport clocks, [vector clocks](/blog/distributed-systems/15-vector-clocks-causality)) or special hardware. **Google Spanner** installs GPS receivers and atomic clocks in its data centres, and its "TrueTime" API deliberately returns a time *interval* ("now is somewhere between T1 and T2") rather than a single instant, then waits out the uncertainty to stay correct. An honest admission that exact time is unknowable.

**The takeaway:** use wall-clock time for rough human display ("posted about 5 minutes ago"), never for deciding ordering or who wins.

## Concurrency is the default, not the exception

**Concurrency** means many things happen at the same time, on different nodes, with no built-in agreement about their order. Two users on two servers can act on the same data in the same instant.

That is the whole point of a distributed system, many nodes running in parallel to serve millions of users. But parallel means simultaneous, and simultaneous means there is no obvious "this came before that." On one machine you can wrap shared data in a lock cheaply because everything shares memory. Across machines there is no shared memory to lock; coordinating order requires sending messages over the slow, unreliable network.

The classic example is two customers buying the last concert ticket at the same moment:

1. User A asks Server 1 "tickets left?" and reads 1.
2. User B asks Server 2 "tickets left?" and also reads 1, at the same time.
3. User A buys one. Server 1 writes 0.
4. User B buys one. Server 2 writes 0.

Two tickets sold, one ticket existed. Oversold. Each server, looking only at itself, behaved perfectly. The bug lives in the *interleaving* of the two, which is invisible to either node.

**The takeaway:** any shared resource needs a deliberate coordination strategy (a database transaction, or a lock held in a service like **etcd** or **ZooKeeper**), because the order of concurrent actions is not decided for you.

## The Two Generals Problem: certainty is impossible

Here is a genuinely surprising fact, and it was the first computer-communication problem ever *proven* unsolvable.

Two generals are camped on opposite hills, enemy in the valley between them. They win *only if they attack at the same time*; if one attacks alone, that army is destroyed. They can communicate only by sending a messenger through the valley, where the messenger may be captured. Any message may be lost.

General A sends "Attack at dawn." A cannot act until A knows B received it, so B sends an acknowledgement ("got it"). But that ack might be lost, so B cannot be sure A received it, so A must ack the ack. But *that* might be lost. Every message needs a confirmation, and every confirmation needs a confirmation. There is no final message you can fully trust, because the final message might be the one that gets lost.

**No finite number of messages ever produces certainty.** That is not an engineering gap to be closed later; it is mathematically impossible.

Why does this matter to you? Every time your service calls another service, you are a general sending a messenger. When you get no reply, you are in exactly the general's dilemma. You cannot achieve certainty. What you do instead is settle for being *probably* sure, and design so the remaining doubt is harmless.

> It is read receipts. You see "Delivered," but did they read it? They send a thumbs-up, but do they know you saw it? You could volley confirmations forever and never reach perfect certainty. At some point one of you just acts, accepting a small risk.

## The survival kit: timeouts, retries, idempotency

These three tools show up in almost every distributed system. Together they are how you live with everything above.

### Timeout

A **timeout** is a maximum time you will wait for a reply before giving up. "If B has not answered in 5 seconds, stop waiting."

You need it because of partial failure: a node may never answer. Without a timeout, your code waits forever, holding memory and connections until it too falls over. The catch: a timeout cannot tell you *whether the work happened*. It only tells you that you stopped waiting. A timed-out request may have succeeded on the other side.

### Retry

A **retry** is simply sending the request again after a timeout or error.

You need it because the network loses messages and many failures are temporary. But remember the "withdraw $100 twice" story. If the first request actually succeeded and only its reply was lost, your retry does the work a *second* time. Retries turn lost-reply problems into duplicate-action problems, which is exactly why you need the next tool.

### Idempotency

An operation is **idempotent** if doing it twice has the same effect as doing it once.

- "Set status to PAID" is idempotent. Run it five times, still PAID.
- "Add $100 to the balance" is *not*. Run it five times, that is $500.

Because retries and duplicated messages mean the same request *will* arrive more than once, idempotent operations make duplicates harmless. The standard technique is an **idempotency key**: the client attaches a unique ID, and the server remembers which IDs it has already processed and ignores repeats.

**Stripe** builds its entire payments API around this. Every charge can carry an `Idempotency-Key` header. If your code times out and retries, Stripe sees the repeated key and returns the *original* result instead of charging twice. This single idea is what makes it safe to retry over an unreliable network. **Apache Kafka** added an "idempotent producer" for the same reason, so a producer retrying after a hiccup does not write the same record twice.

**The takeaway:** timeouts stop you waiting on the dead, retries recover from lost messages, and idempotency makes the inevitable duplicates harmless. You almost never want one without the other two.

## Two warnings worth knowing by name

### A remote call is not a local call

In November 1994, four Sun Microsystems engineers (Jim Waldo, Geoff Wyant, Ann Wollrath, and Sam Kendall) published *"A Note on Distributed Computing."* Its message is blunt: **a remote call is not just a local function call that happens to go over a wire, and pretending it is will eventually destroy your system.**

The fashionable idea at the time was *transparency*, making a call to another machine look exactly like a local one so developers need not think about the network. (The technique is **RPC**, Remote Procedure Call. Useful, but the *illusion of sameness* is the trap.) The paper names four differences you can never hide:

| Dimension | Local call | Remote call |
| --- | --- | --- |
| **Latency** | Nanoseconds, effectively free | Microseconds to milliseconds, thousands to millions of times slower |
| **Memory** | Shared address space; a pointer means something | No shared memory; data must be copied and sent; pointers are meaningless |
| **Partial failure** | The whole program runs or crashes together | The other side can be dead, slow, or unreachable while you keep running |
| **Concurrency** | Often one thread at a time; locks are cheap | Others act simultaneously and independently; you must design for it |

Pretend a remote call is local and you will make far too many tiny calls (slow), assume it either succeeds or throws (no handling for "I have no idea if it worked"), and ignore that two clients can call at once. Early systems hid these cracks because they were tiny. Scale them up and the cracks become catastrophes. The fix: build the network's reality into your interfaces on purpose. Few big calls, not many small ones; explicit failure outcomes; and the programmer always knows the call is remote.

### The Eight Fallacies of Distributed Computing

These are false assumptions newcomers make, credited to Bill Joy and Dave Lyon, then L. Peter Deutsch, then James Gosling (creator of Java). Each one *feels* obviously true and is, in fact, false, and each carries a real cost.

| # | Fallacy | Reality | What believing it costs you |
| --- | --- | --- | --- |
| 1 | The network is reliable | Cables cut, switches reboot, packets drop | Hung requests, leaked resources, stalls on the first lost packet |
| 2 | Latency is zero | A round-trip across the Atlantic is ~67ms at best | "Chatty" designs crawl in production |
| 3 | Bandwidth is infinite | Links carry a finite amount per second | Big payloads cause congestion, drops, timeouts under load |
| 4 | The network is secure | Anyone on the path can read or alter traffic | Eavesdropping, tampering, breaches you assumed were impossible |
| 5 | Topology doesn't change | Servers, IPs, and routes change constantly | Hard-coded hosts break; you need service discovery |
| 6 | There is one administrator | Many teams, vendors, and clouds each control a piece | Conflicting policies and firewall rules cause mystery outages |
| 7 | Transport cost is zero | Moving bytes costs money and CPU | Surprise egress bills and serialization overhead |
| 8 | The network is homogeneous | Real systems mix OSes, languages, and protocols | Incompatibility unless you use portable formats like JSON or Protobuf |

A concrete one: a team builds a page that makes one API call per item, 200 items, 200 calls. On the developer's laptop the service is local, latency near zero (fallacy #2), and it feels instant. Deployed, that service sits 80ms away. 200 sequential calls times 80ms is 16 seconds to load one page. Nothing is "broken." They simply believed latency was zero. The fix, batching into one call, is exactly Waldo's coarse-grained-interface lesson.

## Common misconceptions

- **"No response means the request failed."** No. A timed-out or lost request may have *fully succeeded* on the other side. Silence means "unknown," not "failed." Design for the unknown.
- **"Retries are safe on their own."** Retrying a non-idempotent operation over a network that duplicates and delays messages turns one lost reply into double charges and double emails. Always pair retries with idempotency keys.
- **"I can order events by comparing server timestamps."** Clock skew and drift make cross-node timestamp comparison unreliable. "Last write wins" by timestamp can silently lose the newer write.
- **"RPC makes the network transparent."** Hiding the network does not remove latency, partial failure, or concurrency. It only removes your *handling* of them.
- **"One more confirmation will give me certainty."** The Two Generals Problem proves it will not. Accept residual uncertainty and make a wrong guess recoverable.

## How to use this

When you design or review any system where two machines talk, run through this checklist:

1. **Put a timeout on every remote call.** A request with no timeout is a resource leak waiting to take down the caller along with the callee.
2. **Make writes idempotent and use idempotency keys.** Follow Stripe's model so duplicates from retries or re-sends become harmless and you can retry freely.
3. **Use logical ordering for correctness.** Lamport clocks, vector clocks, sequence numbers, or a coordination service like etcd or ZooKeeper. Reserve wall-clock time for human-facing display only.
4. **Design coarse-grained, network-aware interfaces.** Each remote call should do meaningful work and return explicit success or failure. Never pretend it is a local function.
5. **Test your assumptions against the eight fallacies before shipping.** Ask out loud: what if the network drops this? What if it is slow? What if two of these run at once? What if the other node is dead?
6. **Inject failure on purpose.** Use dropped packets, forced timeouts, and chaos testing in staging so partial failure is something your code has already survived before a customer triggers it.

## Conclusion

If you remember one thing, remember this: **in a distributed system, silence is ambiguous.** A node that crashed and a node that is merely slow look identical from the outside, and almost every hard problem in the field flows from that single fact. You cannot reach certainty, so you design for doubt: timeouts to stop waiting on the dead, retries to recover from loss, and idempotency to make the duplicates harmless.

Notice what we have *not* solved yet. We have learned to survive uncertainty on each call, but we have not made a group of nodes actually *agree* on a single value, like who holds a lock or which write is the real one. That is [the consensus problem](/blog/distributed-systems/02-the-consensus-problem), and the algorithms that crack it (Paxos, Raft) are some of the most elegant ideas in computing. They are where this story goes next.
