---
title: "Replicated State Machines: The One Idea Behind Raft & Paxos"
metaTitle: "Replicated State Machines & the Log Explained"
description: "Learn how replicated state machines and the log let Raft, Paxos, and etcd keep database copies identical across crashes, lost messages, and no global clock."
keywords:
  - replicated state machine
  - what is a replicated state machine
  - the log in distributed systems
  - Raft consensus explained
  - Paxos vs Raft
  - committed vs applied
  - leader election distributed systems
  - log matching property
  - consensus algorithm basics
  - how etcd keeps replicas in sync
  - idempotency distributed systems
  - term number Raft
  - distributed log replication
faq:
  - q: What is a replicated state machine?
    a: It is a set of identical, deterministic copies of a program that all start in the same state and apply the same commands in the same order. Because they are deterministic, they stay byte-for-byte identical forever without ever copying each other's data.
  - q: What is "the log" in consensus systems?
    a: The log is an append-only, numbered list of commands. Every replica replays it in the same order to reach the same state. Agreeing on this one ordered list is exactly what a consensus algorithm does.
  - q: What is the difference between committed and applied?
    a: Committed means a majority of servers have stored the entry, so it is final and can never be lost. Applied means a server has actually run the command against its own data. Commit happens first and triggers apply.
  - q: Why do most consensus systems elect a single leader?
    a: With one leader, the order of the log is simply the order the leader received requests, so there is no argument about sequencing. This makes the system easier to reason about and fast in the common case, which is why Raft, etcd, ZooKeeper, and Consul all use a leader.
  - q: Does consensus give you exactly-once execution?
    a: No. Consensus guarantees the log is identical everywhere, but a retried client request can still be committed twice. You need client sessions with request ids so the state machine skips commands it has already applied.
  - q: What is the term number in Raft?
    a: A term is a monotonically increasing integer that labels each leadership period. Higher terms always win and lower terms are rejected, which makes a stale, returning leader harmless instead of catastrophic.
topic: distributed-systems
topicTitle: Distributed Systems
linked: true
category: Engineering
date: '2026-06-21'
order: 12
icon: "\U0001F310"
author: Brexis Wazik
transformed: true
sources:
  - https://en.wikipedia.org/wiki/State_machine_replication
  - https://en.wikipedia.org/wiki/Raft_(algorithm)
  - https://en.wikipedia.org/wiki/Paxos_(computer_science)
---

How do five database servers in five different cities stay perfectly in sync when machines crash, messages vanish, and there is no shared clock to agree on what happened first?

The answer is not "they copy each other's data." It is one quietly brilliant idea that powers Raft, Paxos, ZooKeeper, etcd, Consul, and Google's Spanner. Learn it once, and every consensus system you ever meet becomes a variation on a theme you already understand.

That idea is the **Replicated State Machine**, usually shortened to **RSM**. Let's build it up slowly.

## Why this matters

If you run anything important on more than one server, you are trusting a consensus system, whether you realize it or not. Kubernetes stores its cluster state in etcd. Service discovery runs on Consul or ZooKeeper. Distributed databases lean on Raft or Paxos under the hood.

When these systems behave in ways that surprise you, it is almost always because of a misunderstanding about how they keep copies in sync. People assume replicas gossip their data back and forth. They assume a write is "done" the moment it is committed. They assume consensus means a request runs exactly once.

All three assumptions are wrong, and each wrong assumption causes a different production outage. The good news: one mental model clears up all of them at once.

## A state machine, in plain words

A **state machine** is a fancy name for something simple: a thing that has some **current state** (data) and a fixed set of **commands** that change that state. You feed it a command, it updates, and it may hand back a result.

The one property that makes everything work is that a state machine is **deterministic**. Deterministic means no randomness and no surprises: given the same starting state and the same command, it always produces the exact same new state and the exact same result. Every single time. No reading the clock, no random numbers, no peeking at the network. Just `(old state + command) → (new state + result)`.

Picture a tiny in-memory key-value store, basically a dictionary. Its state is a map like `{ "x": 1, "y": 5 }`. Its commands are things like `SET x 10`, `DELETE x`, or `INCR y`.

Start it empty, apply `SET x 1`, then `SET x 2`, then `INCR x`, and you will **always** end with `{ "x": 3 }`. The outcome never depends on luck, only on the commands and the order they arrive in. Hold on to that word: **order**.

## The core trick: same start, same commands, same order

Now copy that key-value store onto five servers. Call each copy a **replica**: an independent server holding its own full copy of the data. We want all five to hold identical data forever, even as servers crash and messages get lost.

Here is the whole trick, and it is almost embarrassingly simple:

> If every replica **starts in the same initial state**, and applies the **same commands** in the **same order**, then because each replica is deterministic, they all march through exactly the same sequence of states and end up **identical**.

Sit with that for a second, because it quietly rewrites the entire problem. No replica ever needs to copy another's data. They only need to agree on the **list of commands**.

We started with a hard, vague goal: "keep five copies of a database in sync across an unreliable network." We just reduced it to a precise one: **"make all five servers agree on one single, ordered list of commands."** If they agree on the list, identical data falls out for free.

That ordered list of commands has a name: **the log**. And "make everyone agree on the ordered log" is *exactly* what a [consensus algorithm](/blog/distributed-systems/02-the-consensus-problem) does.

### An analogy: five accountants, one instruction list

Imagine five accountants in five different cities, each keeping their own copy of the same ledger by hand. You do not fax them photos of your ledger pages to keep them in sync. That is slow and error-prone.

Instead, every accountant works from the **same numbered list of instructions**: "#1: deposit $100. #2: withdraw $30. #3: transfer $20." As long as they all follow the same numbered instructions in the same order, and each does the arithmetic the same way (they are deterministic), their ledgers are guaranteed to match, without anyone ever comparing ledgers.

Agreeing on the numbered instruction list is the only hard part. That list is the log.

## The log, drawn as boxes

The **log** is an **append-only** list of **entries**. Append-only means you only ever add to the end. You never insert in the middle and never edit a committed entry.

Each log entry carries three things:

- **An index** - the entry's position: 1, 2, 3, 4. Think of it as the line number. It defines the order.
- **A command** - the actual instruction for the state machine, like `SET x 3`.
- **A term** (Raft's word), also called an **epoch** (ZooKeeper) or **ballot** (Paxos) - a number telling you which leadership period created this entry. More on that soon.

Here is one server's log. Top number is the term, bottom is the command, and the index runs left to right:

```
 index:    1        2        3        4        5
        ┌────────┬────────┬────────┬────────┬────────┐
        │ term 1 │ term 1 │ term 2 │ term 3 │ term 3 │
 LOG →  │ SET x 1│ SET y 5│ INCR x │ DEL y  │ SET z 9│
        └────────┴────────┴────────┴────────┴────────┘
                                    ▲
                                 commitIndex = 4
                                 (entries 1–4 are committed and safe;
                                  entry 5 is only proposed, not yet safe)
```

## Committed vs applied: two different milestones

This distinction trips people up constantly, so let's be precise. An entry passes through milestones on its way to being real.

1. **Appended** - the entry exists in some server's log, but might still be lost or overwritten. Not safe yet.
2. **Committed** - the entry has been safely stored on a **majority** of servers. Majority means more than half: for 5 servers, at least 3. Once committed, the entry is **permanent** and can never be lost or changed, because any future majority must overlap with this one on at least one server that still holds the entry. Committed means *this decision is final*.
3. **Applied** - the command has actually been **run against the local state machine**, changing the data. Applied means *this decision has taken effect on my copy*.

Two per-server fields track this (these are the real Raft names):

- `commitIndex` - the highest index known to be **committed**.
- `lastApplied` - the highest index this server has actually **applied**.

The rule every server runs in a loop is simply: whenever `commitIndex > lastApplied`, increment `lastApplied` and apply that next entry. So "applied" always chases "committed." **Commit is the agreement; apply is the side effect.**

Why does the gap matter? Because a follower can *know* entry 4 is committed (it saw a higher commit point from the leader) while not yet having applied it to its data. Commit decides "this is final and ordered." Apply decides "my data now reflects it." And only committed entries may ever be applied, never an uncommitted one, because an uncommitted entry could still be thrown away.

## Term numbers: a logical clock for leadership

There is no global clock in a distributed system, so we cannot [order events by wall-clock time](/blog/distributed-systems/14-time-clocks-the-ordering-of-events). We need a *logical* way to say "this happened in a later leadership period than that." That is what the **term** number is.

A **term** (Raft), also called an **epoch** (ZAB) or **ballot** (Paxos), is a **monotonically increasing integer** that labels each period of leadership. Monotonically increasing just means it only ever goes up, never down: 1, 2, 3, 4. Every time the cluster holds a new election, it bumps the number. **A new election equals a new term.**

```
   TIME (logical, not wall-clock) ──────────────────────────────►

   ┌───── term 1 ─────┐┌─ term 2 ─┐┌──────── term 3 ────────┐
   │ leader = S1      ││ election ││ leader = S4            │
   │ (normal work)    ││ (no ldr) ││ (normal work)          │
   └──────────────────┘└──────────┘└────────────────────────┘
       term goes 1 ──────────► 2 ──────────► 3   (only ever UP)
```

Why does a single ever-increasing number matter so much? Because it lets every server settle disputes locally with one comparison, and it cleanly evicts stale leaders. Two rules do almost all the work:

- **Higher term always wins.** Every message carries its sender's term. Receive a *higher* term than your own, and you adopt it and immediately step down to a plain follower. Receive a *lower* term, and you reject the message: "you're out of date, ignore me."
- **One vote per term.** A server records who it voted for this term, so it can never vote twice in the same term. Combined with "you need a majority to win," this guarantees **at most one leader per term**.

This is precisely how the system avoids the nightmare of two leaders clashing. Suppose an old leader from term 2 was cut off by a network partition while the rest of the cluster elected a new leader in term 3. When the partition heals and the stale leader tries to push entries, every healthy server sees "term 2 is less than my term 3" and rejects it. The moment the old leader hears a reply carrying term 3, it sees the higher number and steps down. No corruption. The higher term simply wins.

### An analogy: regnal numbers

Term numbers are like the numbers of monarchs: Henry I, Henry II, Henry III. Everyone obeys the highest-numbered monarch they have heard of.

If a deposed king wanders back into the throne room issuing orders, the guards just say "Sorry, we serve Henry III now" and ignore him. The instant the old king hears the number "III," he knows he has been superseded and stands down. The number alone, not a clock and not a recount, resolves who is in charge.

## Why nearly everyone elects a leader

There are two broad ways to agree on the log.

**Leader-based.** The cluster elects one server as **leader**. The leader alone decides the order of entries and pushes them to **followers**. All writes funnel through the leader. This is simple to reason about, because one server sequences everything, so the order is obvious. The downside is that the leader is a bottleneck, and if it dies you pause for [an election](/blog/distributed-systems/04-raft-leader-election). Used by Raft, Multi-Paxos, ZooKeeper/ZAB, etcd, Consul, and Chubby.

**Leaderless.** No fixed leader. Any server can propose, and servers run a voting round per log slot to agree on what goes there. There is no single bottleneck and no election pause, but you risk *dueling proposers*: two servers proposing for the same slot keep interrupting each other, causing stalls. Used by basic [single-decree Paxos](/blog/distributed-systems/06-paxos-the-original-consensus-algorithm) and EPaxos.

Why do almost all production systems pick a leader? Because once you have one, the order of the log is trivially decided. It is just "whatever order the leader received the requests in." There is no argument about sequencing, because one server is doing all the sequencing. That makes the system far easier to understand and debug, and it makes the common case fast.

## How a client actually talks to the system

Put yourself in the shoes of a **client**, say a web app that wants to write data. In a leader-based system, the happy path looks like this:

1. The client sends its command to the **leader**. (Contact a follower by mistake and it redirects you.)
2. The leader **appends** the command to its own log as a new entry.
3. The leader **replicates** the entry to followers via the `AppendEntries` message.
4. Once a **majority** have stored it, the leader marks it **committed** and **applies** it to its own state machine.
5. The leader **replies** to the client. Followers learn the entry is committed from the leader's next message and apply it too.

### Why you still need idempotency

Here is a subtle but critical problem. Suppose the leader commits your `INCR x`, applies it, and then **crashes before the reply reaches you**. Your client times out and **retries**. A new leader is elected, and now your `INCR x` risks being applied *twice*, turning a +1 into a +2.

On a replicated state machine, a double-apply corrupts the data on *every* replica identically, so you cannot even detect it by comparing replicas. Everyone is wrong in exactly the same way.

The fix is **idempotency through de-duplication**. Idempotent means "applying it twice has the same effect as applying it once." The standard technique:

- The client opens a **session** and tags every command with a unique, increasing **serial number**, like `{ requestId: 1742, cmd: "INCR x" }`.
- The state machine remembers, per client, the highest serial number it has already applied *and the result it returned*.
- If a command arrives whose serial was already applied, the system **does not re-run it**. It just returns the remembered result.

This turns "at-least-once delivery" into "exactly-once *effect*." Payment systems do exactly this with an "idempotency key": if your browser re-submits a payment form, the bank sees the same key and replies "already done, here is your original receipt" instead of charging you twice. The serial number in a consensus session is that same idea applied to log commands.

## The two messages that move the log

To make this concrete, here are the two messages a leader-based system uses. We use Raft's names because they are the clearest; Paxos and ZAB have equivalents.

**`AppendEntries`** replicates log entries and doubles as a heartbeat. When sent with an empty entry list, it just says "I'm still alive, don't start an election." Its key fields:

- `term` - the leader's current term, so a follower can reject a stale leader.
- `prevLogIndex` and `prevLogTerm` - the index and term of the entry *immediately before* the new ones. Together these form the **consistency check** (more below).
- `entries[]` - the new entries to store (empty for a heartbeat).
- `leaderCommit` - the leader's commit index, so the follower learns which entries are now safe to apply.

**`RequestVote`** is sent by a **candidate** during an election. It carries the candidate's new `term`, plus `lastLogIndex` and `lastLogTerm`, which prove the candidate's log is "up to date" enough to lead.

## Repairing a follower that has drifted

Followers can fall behind or even hold *wrong* entries, for instance a server that briefly followed a leader who crashed before its entries got committed. We need a safe way to force every follower's log back into agreement.

Raft guarantees this with the **Log Matching Property**:

> If two logs contain an entry at the **same index** with the **same term**, then those entries store the *identical command*, *and all entries before them are identical too*.

So matching just one `(index, term)` pair proves the entire history up to that point matches. That is what makes repair efficient: find one matching point, and everything before it is already correct.

Here is how the consistency check enforces it. Every `AppendEntries` says, in effect, "before these new entries, you should already have an entry at `prevLogIndex` with term `prevLogTerm`." The follower checks: do I have that exact entry?

- **Yes** - our histories match up to that point. Accept the new entries.
- **No** - **reject**. The leader then steps `prevLogIndex` back one and retries, walking backward until it finds the last point where the two logs agree. From there it ships everything forward, and the follower **overwrites** any conflicting entries.

```
  BEFORE REPAIR
  index:        1        2        3        4        5
  LEADER  S1: [T1 a ][T1 b ][T3 c ][T3 d ][T3 e ]   ← source of truth
  follower S3:[T1 a ][T1 b ][T2 x ]                 ✗ index 3 term differs

  prevLogIndex=3, prevLogTerm=3 ... reject (S3 has T2, not T3)
  prevLogIndex=2, prevLogTerm=1 ... MATCH! (both hold [T1 b])
  → agreement point is index 2. Leader ships indexes 3, 4, 5.
    S3 overwrites its bad [T2 x] at index 3.

  AFTER REPAIR
  follower S3:[T1 a ][T1 b ][T3 c ][T3 d ][T3 e ]   ✓ repaired
```

Notice what got thrown away. S3's bad `[T2 x]` came from a previous leader (term 2) that died before that entry reached a majority. So it was **never committed**, which means no client was ever told it succeeded. Discarding it loses nothing anyone was promised.

It is like two people syncing the same manuscript by flipping backward together until they hit a page that is word-for-word identical in both copies. Everything up to that page is in sync, so they recopy only from the next page on, and the person who is behind tears out their later, conflicting pages.

## Common misconceptions

**"Replicas keep in sync by copying each other's data."** They don't. They copy the *ordered log of commands* and each replays it independently. Identical data is a *consequence* of identical logs plus deterministic state machines.

**"Committed and applied are the same thing."** Committed means a majority stored it, so it is final and ordered. Applied means a server has run it against its data. Commit comes first and triggers apply, and `lastApplied` never overtakes `commitIndex`.

**"A returning old leader can corrupt the data."** It can't, thanks to terms. Its messages carry a lower term and get rejected, and the moment it hears a higher term it steps down.

**"Consensus alone gives exactly-once execution."** It makes the *log* identical everywhere, but it does not stop a retried client request from being committed twice. You need request ids and a state machine that skips already-applied serials.

**"The whole log is immutable."** Committed history is immutable. But a follower's *uncommitted* tail can be legitimately overwritten during repair, because those entries were never committed and no client relied on them.

**"Non-determinism inside the state machine is harmless."** It is the opposite. If a command reads the local clock, generates a random id, or calls an external API, replicas diverge *even with identical logs*. Any such value must be decided once by the leader and written into the log entry.

## How to use this

If you operate or build on top of a consensus system, here is the practical checklist.

1. **Keep your state machine strictly deterministic.** Forbid clock reads, randomness, and external calls inside command application. Resolve every such value at the leader and bake it into the log entry, so log `set createdAt = 2026-06-21T10:00:00Z`, never `set createdAt = now()`.
2. **Give clients sessions with monotonic request ids.** Have the state machine record "highest serial applied plus result returned" per client. This is the cheap, standard way to turn unavoidable retries into exactly-once effects.
3. **Use an odd cluster size: 3, 5, or 7.** A majority of 5 is 3, so it tolerates 2 failures. Six nodes also tolerate only 2 but cost more, so odd sizes maximize fault tolerance per node and avoid tie votes.
4. **Pair the log with snapshots.** Never let the log grow forever. A snapshot is a compact dump of the state machine at some index, so old applied entries can be discarded and a new follower can be caught up by snapshot plus tail instead of replaying from index 1.
5. **Route all writes through the leader and accept the redirect cost.** Resist "let any node accept writes" shortcuts. Single-leader sequencing is what makes the log order unambiguous, which is why etcd, ZooKeeper, Consul, and Chubby all do it.

## Conclusion

Strip away the names and the jargon, and every leader-based consensus protocol is doing just **two jobs**: agree on a leader, then [replicate the log safely](/blog/distributed-systems/05-raft-log-replication-safety-membership). The term number and majority voting make "at most one leader per term" true. The consistency check, commit index, and backward repair make committed entries permanent and identical everywhere. That is the entire ballgame.

The single takeaway worth carrying around: **replicas don't share data, they share an ordered list of commands, and identical data is the free reward for agreeing on that list.** Once that clicks, [Raft and Paxos](/blog/distributed-systems/07-multi-paxos-raft-vs-paxos) stop being two scary algorithms and become two dialects of the same sentence.

Which raises the natural next question: if a majority just needs to *overlap* to keep a decision safe, how few servers can you actually lose before the whole cluster goes silent and refuses to accept writes? That is the story of quorums and the trade-off at the heart of every distributed system, and it is where we head next.
