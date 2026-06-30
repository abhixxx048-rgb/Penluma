---
title: "Paxos Explained Simply: How Machines Agree Under Chaos"
metaTitle: "Paxos Consensus Algorithm Explained Simply"
description: "Paxos is the consensus algorithm behind modern distributed systems. Learn how unreliable machines agree on one value, in plain English with clear examples."
keywords:
  - paxos algorithm
  - paxos consensus
  - paxos explained
  - consensus algorithm
  - distributed consensus
  - single-decree paxos
  - paxos vs raft
  - multi-paxos
  - leslie lamport paxos
  - how does paxos work
  - paxos prepare promise accept
  - quorum majority consensus
  - distributed systems consensus
faq:
  - q: "What does the Paxos algorithm actually do?"
    a: "Paxos lets a group of unreliable machines agree on a single value, even when some crash, messages are lost, and several machines propose different values at once. Once a value is agreed, it can never be changed."
  - q: "Why is Paxos considered so hard to understand?"
    a: "Lamport first published it as a joke story about a fictional Greek parliament, which buried the algorithm in metaphor. The core idea is small but packed tightly, so most people need to read it several times. Raft was created largely to be easier to follow."
  - q: "What is the difference between Paxos and Raft?"
    a: "They solve the same problem, consensus, but Raft is designed to be understandable, with a strong leader and a clear log. Multi-Paxos with a stable leader ends up looking very similar to Raft in practice."
  - q: "Does Paxos always reach a decision?"
    a: "No. Paxos guarantees safety (never two different values) but not liveness. Competing proposers can livelock forever. A single leader plus randomized backoff fixes this in practice."
  - q: "Why does Paxos need a majority of acceptors?"
    a: "Any two majorities of a group must share at least one member. That single overlapping machine remembers the agreed value and forces every future proposal to honor it, which is what keeps Paxos safe."
  - q: "Is Paxos still used today?"
    a: "Yes, directly and indirectly. Google's Chubby and Spanner, Microsoft Azure storage, and many others build on Paxos or close relatives. Even Raft and ZAB inherit ideas Paxos proved correct first."
author: Brexis Wazik
transformed: true
linked: true
topic: distributed-systems
topicTitle: Distributed Systems
category: Engineering
date: '2026-06-21'
order: 5
icon: "\U0001F310"
sources:
  - https://en.wikipedia.org/wiki/Paxos_(computer_science)
---

Imagine five computers that can crash at any moment, on a network that randomly drops and delays messages, all trying to agree on one tiny fact: who is the leader? It sounds impossible. Yet a single algorithm has been quietly making that agreement happen for decades, inside Google, Microsoft, and Amazon.

That algorithm is **Paxos**. It is famous for two opposite things at once: it is provably correct, and it is notoriously hard to understand. The good news is that the core idea is actually small. It is just packed very tightly. By the end of this article, you will see why agreement is even possible when everything around you is unreliable.

## Why this matters

Almost every system you rely on needs machines to agree on something. Which server is the primary? What is the next entry in the database log? Did this transaction commit or not?

Get this wrong and you get the worst kind of bug: two machines that each believe they are in charge, quietly corrupting your data. This is called "split-brain," and it is the nightmare that [consensus algorithms](/blog/distributed-systems/02-the-consensus-problem) exist to prevent.

Paxos was the first algorithm to solve this and **prove** it could never choose two conflicting answers. You may never write raw Paxos yourself, but understanding it teaches you *why* consensus is possible at all, and that intuition shows up every time you reason about [replication](/blog/distributed-systems/03-replicated-state-machines-the-log), [leader election](/blog/distributed-systems/04-raft-leader-election), or distributed databases.

## A short history (and one famous joke that backfired)

Leslie Lamport, the same researcher behind [logical clocks and the happens-before relation](/blog/distributed-systems/14-time-clocks-the-ordering-of-events), first described Paxos in a 1990 paper called *The Part-Time Parliament*.

He wrote it as a comedy. The setting was a fictional Greek island, Paxos, whose parliament kept passing laws even though legislators wandered in and out of the chamber at random. The wandering legislators were a metaphor for unreliable machines.

The joke backfired spectacularly. Readers found the story so confusing that almost nobody noticed the brilliant algorithm hidden inside it. The paper sat ignored for years.

In 2001 Lamport gave up on the bit and published *Paxos Made Simple*, a plain-English do-over. Its famous opening line is roughly: "The Paxos algorithm, when presented in plain English, is very simple." Many readers still disagreed about the "simple" part, which is exactly why the **Raft** algorithm was later created with the explicit goal of being understandable.

But Paxos remains the bedrock. Google's Chubby lock service and Spanner database, Microsoft's Azure storage, and countless internal systems are built on Paxos or close relatives. Even systems that use Raft or ZAB instead are standing on ideas Paxos established and proved correct first.

## The cast: three jobs, often one machine

Paxos splits the work into three **roles**. A role is just a job a machine performs, and one physical machine usually plays all three at once. We separate them only to explain the logic cleanly.

- **Proposer** - the one who suggests a value. It drives the whole protocol by sending requests, trying to get a value agreed.
- **Acceptor** - the voter and the memory. It votes on proposals and *remembers* what it has promised and accepted, even across crashes. The acceptors are the system's durable memory.
- **Learner** - the one who finds out the result. It learns which value was finally chosen so it can act on it, like applying it to a database.

The goal is precise and it has two halves.

**Safety, which must always hold:** only a value that was actually proposed can be chosen, only *one* value is ever chosen, and once chosen it stays chosen forever. Nobody can un-choose it or swap in a different one.

**Liveness, best effort:** if the network settles down, some value eventually gets chosen and the learners find out. As you will see, Paxos cannot *guarantee* this in a fully chaotic network, so it settles for "eventually, once things behave."

### The one trick that makes it all work: majorities

A value becomes "chosen" only when a **majority** of acceptors accept it. A majority means more than half. For 5 acceptors, that is 3.

Here is the magic property. *Any two majorities must overlap in at least one acceptor.* Pick any group of 3 from 5, then pick another group of 3, and they are guaranteed to share at least one member. That single overlapping acceptor is the secret behind everything. Hold onto it.

> **Analogy.** Think of the acceptors as a row of notaries. A proposer is a lawyer trying to get a contract notarized. The contract is "official" only when a majority of notaries stamp the *same* contract. Because any two majorities share at least one notary, and a notary refuses to contradict a stamp they already gave, you can never end up with two different official contracts.

## Proposal numbers: giving every attempt a unique ID

Several proposers might be active at once, and one proposer may retry after a failure. To bring order to the chaos, every attempt is tagged with a **proposal number** (also called a ballot number).

Two rules govern these numbers:

1. **They are totally ordered.** Given any two, you can always say which is bigger. Bigger means newer and takes priority.
2. **They are globally unique.** No two proposers ever pick the same number. If they did, the tie-breaking that keeps Paxos safe would collapse.

How do you make numbers unique across machines with no shared clock? The standard trick is to build each number from two parts: a local counter plus the server's own ID, written as the pair `(counter, serverId)` and compared counter-first, breaking ties by serverId. Server A produces 1.A, 2.A, 3.A while Server B produces 1.B, 2.B, 3.B. They can never collide.

A simpler picture: give proposer A only odd numbers and proposer B only even numbers. Either way, each proposer can always pick a number higher than any it has seen, and no two numbers are ever equal.

**Important:** the proposal number is *not* the value being agreed on. The number is a priority tag on an *attempt*. The value is separate data, like "set leader = node-7." One value can be carried by many attempts with different numbers. The number decides whose attempt wins, not what gets stored.

## Phase 1: Prepare and Promise

Paxos runs in two phases. Phase 1 is about **claiming priority and discovering history**. The proposer is essentially asking: "Can I have a turn at number n? And by the way, has anything already been agreed that I need to honor?"

**Prepare (proposer to acceptors).** The proposer picks a brand-new number `n`, higher than any it has used, and sends `Prepare(n)` to at least a majority of acceptors. Notice it sends *no value yet*, only the number.

**Promise (acceptor to proposer).** When an acceptor receives `Prepare(n)`:

- If `n` is higher than every number it has already responded to, it replies with a **Promise**: "I will never again accept any proposal numbered less than n." It is raising the floor.
- Along with the promise, it reports back **any value it has already accepted**, tagged with the number it accepted under, as `(accepted_number, accepted_value)`. If it has accepted nothing, it says so. This is how already-agreed history travels forward.
- If `n` is not higher than something it already promised, it ignores the request or sends a quick "no" so the proposer gives up faster.
- Before replying, the acceptor **writes the promise to disk**. If it crashes and restarts, it must still remember the floor it raised.

```
PHASE 1: Prepare / Promise   (proposer P, acceptors A1 A2 A3)

   P                 A1            A2            A3
   |---Prepare(n)--->|             |             |
   |---Prepare(n)------------------>|            |
   |---Prepare(n)------------------------------->|
   |   (each acceptor: is n > my highest seen number?)
   |   (none had accepted a value yet -> promise, report "none")
   |<--Promise(n, none)|           |             |
   |<--Promise(n, none)-------------|             |
   |<--Promise(n, none)---------------------------|
   |
   |  P heard from a MAJORITY (3 of 3) -> proceed to Phase 2.
   |  No prior value reported -> P may use its OWN value.
```

## Phase 2: Accept and Accepted

Phase 2 is where an actual value gets pinned down. The proposer now holds the floor and knows the relevant history.

**Accept (proposer to acceptors).** With Promises from a majority, the proposer chooses which value to push, using one strict rule:

- If *any* Promise reported an already-accepted value, the proposer **must** use the value attached to the *highest* `accepted_number` it heard. It does not get to use its own value. It is forced to carry forward the most recent already-accepted value.
- Only if *no* Promise reported any accepted value is the proposer free to propose its own value.

Call the chosen value `v`. The proposer sends `Accept(n, v)`.

**Accepted (acceptor to proposer and learners).** When an acceptor receives `Accept(n, v)`, it accepts *unless* it has, in the meantime, promised some higher number than `n`. In plain terms: "I'll accept this as long as nobody newer came along while you were gone." On accepting, it records `(n, v)` durably and notifies the learners.

When a **majority** of acceptors have accepted `(n, v)`, the value `v` is **chosen, permanently**.

```
PHASE 2: Accept / Accepted   (continuing from Phase 1)

   P                 A1            A2            A3
   |  P picks v = its own value (no prior value was reported).
   |---Accept(n, v)->|             |             |
   |---Accept(n, v)---------------->|            |
   |---Accept(n, v)------------------------------>|
   |   (each: have I promised anything > n? No -> accept, save to disk)
   |<--Accepted(n,v)-|             |             |
   |<--Accepted(n,v)----------------|             |
   |<--Accepted(n,v)------------------------------|
   |
   |  MAJORITY accepted (n,v)  ==>  v is CHOSEN, forever.
```

> **Worked example.** Five acceptors, A1 to A5. Proposer P (a config server) wants to set the cluster leader to `"node-7"`.
>
> 1. P sends `Prepare(5.P)` to all five. A1, A2, A3 reply `Promise(5.P, none)`. That is a majority of 3, and none has accepted anything.
> 2. Since no prior value came back, P uses its own value and sends `Accept(5.P, "node-7")`.
> 3. A1, A2, A3 had promised nothing higher than 5.P, so they accept and persist `(5.P, "node-7")`, then tell the learners. Three of five accepted, a majority, so `"node-7"` is now the chosen leader, irrevocably, even if P crashes one millisecond later.

## Why Paxos is safe: the heart of the algorithm

This is the part worth reading twice. Everything above exists to make one guarantee true: **once a value could possibly have been chosen, every future proposal is forced to propose that same value.** Here is the reasoning, built from two facts you already have.

**Fact 1: majorities overlap.** Suppose value `v` was chosen at number `n`. That means a majority of acceptors, call it set `M1`, accepted `(n, v)`.

**Fact 2: a later proposal must also reach a majority.** Now a later proposer arrives with a higher number `n'`. To get anywhere, it must finish Phase 1 by collecting Promises from its own majority, set `M2`. Because any two majorities overlap, `M1` and `M2` share **at least one acceptor**. Call it `X`.

**The punchline.** Acceptor `X` is in `M1`, so it accepted `(n, v)`. When the later proposer asks `X` in Phase 1, `X` reports `(n, v)` inside its Promise. Now the Phase 2 rule fires: the later proposer is *forced* to adopt the highest-numbered accepted value it heard. `X` just told it about `v`. So the later proposer cannot use its own value. It **must** re-propose `v`. The same argument applies to every higher number after that, forever. No second value can ever be chosen.

The subtle part that closes the last gap is the **promise** itself. When `X` promised not to accept anything below `n'`, it locked the door behind it: no proposal between `n` and `n'` can sneak a different value past `X`. The "raise the floor" promise and the "adopt the highest accepted value" rule work as a pair. The promise blocks the past from changing, and the adopt-rule forces the future to inherit it.

> **Key takeaway.** Paxos safety = *majority overlap* + *acceptors remember* + *every new proposer must adopt the highest already-accepted value it learns about*. Together, the first value to reach a majority becomes the permanent decision, and no higher-numbered proposal can override it.

## Common misconceptions

**Myth: the proposal number is the value.** Reality: the number is just a priority tag on an attempt. The value is separate data. Many attempts with different numbers can carry the very same value.

**Myth: the highest-numbered proposer installs its own value.** Reality: if a value was already accepted anywhere in its majority, the protocol *forces* it to re-propose that existing value. A high number wins the right to *proceed*, not the right to *overwrite*.

**Myth: Paxos always terminates.** Reality: competing proposers can livelock forever. Paxos guarantees safety always, but liveness only when the network behaves and a leader is in place.

**Myth: acceptors can keep state in memory only.** Reality: acceptors are the durable memory of the system. Every promise and acceptance must hit disk *before* the reply is sent, or a crash-and-restart can break safety.

**Myth: basic Paxos decides a whole log of commands.** Reality: single-decree Paxos decides exactly *one* value. Replicating a sequence of commands needs Multi-Paxos, a larger construction.

**Myth: two leaders at once is a correctness bug.** Reality: two leaders only threaten *progress*, never *safety*. Paxos can never choose two different values, no matter how many proposers run.

## The liveness problem: dueling proposers

Paxos is always safe, but it is not always guaranteed to finish. The classic failure is **dueling proposers**, also called livelock: the system is busy but makes no progress.

Picture two proposers, P1 and P2, retrying with ever-higher numbers, perfectly out of step:

```
DUELING PROPOSERS (livelock)   P1 and P2 over acceptors A1 A2 A3

P1: Prepare(1) ---> promise(1)
P2: Prepare(2) ---> promise(2)   (raises floor to 2)
P1: Accept(1, x) -> REJECT       (already promised 2 > 1)
P1: Prepare(3) ---> promise(3)   (raises floor to 3)
P2: Accept(2, y) -> REJECT       (already promised 3 > 2)
P2: Prepare(4) ---> promise(4)
P1: Accept(3, x) -> REJECT       (already promised 4 > 3)
   ... and so on, forever. No value is ever chosen.
```

Each proposer's Phase 1 keeps raising the floor and knocking out the other's Phase 2 before it can finish. Nobody crashed, no message was lost, yet no progress is made.

This is not a bug. It is the **FLP impossibility result** showing up in real life: in a fully asynchronous system, with no bound on message delays and no perfect way to detect failures, *no* consensus algorithm can guarantee it always terminates. Paxos deliberately sacrifices guaranteed liveness to keep absolute safety. Progress can stall, but the answer is never wrong.

> **Analogy.** Two people reach for the same door handle, both pull back politely, then both reach again, repeating forever. That is dueling proposers. The fix is the same as in real life: appoint one person to go first, and have anyone who collides wait a *random* moment before trying again so they stop colliding in lockstep.

### The fix: a leader plus backoff

The standard solution has two parts.

1. **Elect a single distinguished proposer, a "leader."** Agree, informally, that only one proposer normally issues proposals. With nobody to duel, both phases complete cleanly. Crucially, safety does not depend on the election being correct. If two leaders accidentally exist, Paxos is still safe. You only risk a temporary stall.
2. **Add randomized backoff.** When an attempt is rejected, wait a *random* amount of time before retrying, growing the wait on repeated failures. Randomness desynchronizes the duelists so one of them gets a clean window to finish. This is the same trick Ethernet and Raft elections use to break symmetric ties.

A common optimization, **Multi-Paxos**, takes the leader idea further. A stable leader runs Phase 1 just *once* to claim a range of decisions, then only does the cheap Phase 2 for each new value. In steady state that is one round-trip per decision, and it is essentially the shape Raft later formalized with a strong leader.

## How to use this

You will rarely hand-roll Paxos, but these practices apply to any consensus system you run or build on:

1. **Use an odd number of acceptors (3, 5, 7).** Five acceptors tolerate 2 failures and still form a majority, and you avoid ambiguous even-split votes.
2. **Run a single leader in steady state.** Multi-Paxos style leadership eliminates dueling and collapses each decision to one round-trip.
3. **Make proposal numbers unique by construction.** Pair a local counter with the server ID, `(counter, serverId)`. Never rely on wall-clock time alone for uniqueness.
4. **Persist before you reply.** Write every promise and acceptance to disk *before* sending the response. A reply that is not yet durable can vanish in a crash and break safety.
5. **Add randomized backoff on every rejection.** This keeps colliding proposers from dueling in lockstep.
6. **Build on battle-tested implementations.** Reach for etcd/Raft, ZooKeeper/ZAB, or a vetted Paxos library rather than rolling your own. The edge cases around durability, leader change, and message reordering are exactly where subtle safety bugs hide.

## Conclusion

If you remember one thing, remember this: **the first value to reach a majority of acceptors wins forever, because any future proposal is forced to inherit it.** That single sentence, built on majority overlap and acceptors that never forget, is the whole reason agreement is possible in an unreliable world.

Paxos buys safety at the cost of guaranteed progress, then hires a leader to win that progress back. Which raises the natural next question: if a leader makes everything cleaner, why not design the entire algorithm around a strong leader from the start? That is precisely the bet [**Raft**](/blog/distributed-systems/07-multi-paxos-raft-vs-paxos-the-real-world) makes, and it is where this story goes next.
