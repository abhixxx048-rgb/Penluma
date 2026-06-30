---
title: "Raft Leader Election Explained: How Servers Pick a Boss"
metaTitle: "Raft Leader Election Explained Simply"
description: "Learn how Raft leader election works: terms, heartbeats, election timeouts, and majority voting that keep a server cluster agreeing without a single boss."
keywords:
  - raft leader election
  - raft consensus algorithm
  - how raft works
  - raft terms explained
  - election timeout raft
  - raft heartbeat
  - split vote raft
  - randomized election timeout
  - distributed consensus
  - raft vs paxos
  - replicated log
  - majority quorum voting
  - requestvote rpc
  - raft state machine
topic: distributed-systems
topicTitle: Distributed Systems
category: Engineering
date: '2026-06-21'
order: 13
icon: "\U0001F310"
faq:
  - q: What is leader election in Raft?
    a: It is the process Raft uses to pick exactly one server to be in charge of a cluster. When servers stop hearing from the current leader, one becomes a candidate, asks the others to vote, and becomes leader if it wins a majority.
  - q: How does Raft prevent two leaders at the same time?
    a: Each server can vote only once per term, and a candidate needs votes from more than half the cluster. Since any two majorities must share at least one server, and that server cannot vote twice, only one candidate can win a given term.
  - q: What is a term in Raft?
    a: A term is a numbered period of time that starts with an election and acts as a logical clock. Every message carries a term number, so servers can instantly spot and ignore stale information from older terms.
  - q: Why does Raft use randomized election timeouts?
    a: Random timeouts spread out when servers decide to start an election, so usually one server wakes first and wins uncontested. This makes split votes rare and self-correcting instead of repeating forever.
  - q: How does a Raft leader stay in power?
    a: The leader continuously sends heartbeats (empty AppendEntries messages). Each heartbeat resets the followers' election timers, so as long as they keep arriving, no follower starts a new election.
  - q: Is Raft easier to understand than Paxos?
    a: Yes, that was its explicit design goal. Raft splits consensus into leader election, log replication, and safety, making each piece easier to reason about than the monolithic Paxos algorithm.
author: Brexis Wazik
transformed: true
linked: true
sources:
  - https://en.wikipedia.org/wiki/Raft_(algorithm)
---

A leader server in a cluster freezes mid-request. No alarm goes off. No dying gasp gets broadcast. Yet within a few hundred milliseconds, the remaining servers quietly notice the silence, hold an election, and crown a new leader - all without a referee in the room.

That self-organizing trick is the heart of **Raft**, the consensus algorithm that powers systems like etcd, Consul, and the coordination layer behind countless databases. This article walks you through the most important part: how Raft elects a leader, and how it guarantees there's never more than one.

## Why this matters

If you run anything across more than one machine - a database replica set, a key-value store, a service registry - you eventually hit the same brutal question: **when machines crash and networks misbehave, how do the survivors agree on what's true?**

Agreement is hard because there's [no shared clock](/blog/distributed-systems/14-time-clocks-the-ordering-of-events) and no trustworthy referee. Messages arrive late, get dropped, or show up out of order. A server that looks dead might just be slow.

Raft's answer is to elect a single **leader** that owns all the decisions, and to make electing (and re-electing) that leader fast and unambiguous. Understand leader election and you understand the foundation that keeps modern distributed systems consistent. Get it wrong, and you get the nightmare scenario: two leaders, each confidently rewriting history in different directions.

## The problem Raft is solving

Raft keeps a [**replicated log**](/blog/distributed-systems/03-replicated-state-machines-the-log) in agreement across a cluster of servers. A replicated log is just an ordered list of commands - "set x = 3", then "set y = 9" - that every server must store in the same order so they all end up in the same state.

The hard part is agreeing on that order when machines crash, restart, and the network drops or delays messages. That agreement problem is called [**consensus**](/blog/distributed-systems/02-the-consensus-problem).

Raft was created by Diego Ongaro and John Ousterhout at Stanford in 2014 with one unusual goal: **understandability**. The older standard, [Paxos](/blog/distributed-systems/06-paxos-the-original-consensus-algorithm), is famously hard to reason about. So Raft deliberately breaks consensus into three smaller, mostly independent pieces:

1. **Leader election** - pick exactly one server to be in charge. (This article.)
2. **Log replication** - the leader copies its log to everyone.
3. **Safety** - guarantee the leader can never overwrite already-agreed history.

The central design choice is the **strong leader**: at any moment there is one leader, and *all* changes to the log flow from the leader outward. Followers never gossip with each other about log content. This single rule removes a mountain of complexity - but it means everything depends on reliably electing a leader, and re-electing one the instant the old one dies.

> **The scribe analogy.** Picture a group writing a shared document by phone. If everyone dictates at once, chaos. So they agree: one person is the "scribe" at a time. The scribe is the only one who writes; everyone else listens and copies. If the scribe goes silent, the group must quickly - and with no referee on the call - pick a new scribe, while *never* ending up with two scribes writing different things at once. Raft is the precise protocol for choosing that scribe.

## The three roles every server plays

At any moment, each Raft server is in exactly one of three **states** (a "state" is just the role it's currently playing):

- **Follower** - Passive. It issues no requests on its own; it only *responds* to leaders and candidates, and redirects clients to the leader. Usually every server but one is a follower.
- **Candidate** - A follower that has decided to try to become leader and is asking the others to vote for it. This role exists only briefly, during an election.
- **Leader** - Handles all client requests, owns the log, and continuously tells followers it's alive. There's at most one per term.

In healthy operation, there is **exactly one leader and every other server is a follower**. The candidate state only appears during the brief moment of electing a new leader.

Servers move between roles based on what they hear - or fail to hear - from the network:

- **Follower → Candidate:** a follower hears nothing from any leader for too long (its *election timeout* fires), so it starts an election.
- **Candidate → Leader:** the candidate collects votes from a *majority* of the cluster.
- **Candidate → Follower:** the candidate discovers a legitimate leader, or any message with a higher term, so it steps down.
- **Candidate → Candidate:** the election timed out with no winner (a *split vote*), so it starts fresh.
- **Leader → Follower:** the leader learns of a higher term than its own, realizes a newer election happened, and steps down immediately.

There's no central coordinator deciding who leads. The servers self-organize entirely through these transitions.

## Terms: Raft's logical clock

Before you can run an election, you need the concept of a **term**.

A term is a numbered period of time. Terms count up with consecutive integers - term 1, term 2, term 3 - and **each term begins with an election**. If the election produces a winner, that server leads for the rest of the term. If it fails, the term ends with no leader and the next term begins with a fresh election.

Here's why terms are so clever. There is no global clock in a distributed system; servers can't agree on wall-clock time. But they *can* agree on "which election are we on?" The term number is a **logical clock** - a counter that only moves forward - that lets any server instantly detect stale information. A message from an old term is obviously out of date.

Two rules make terms powerful:

- **At most one leader per term.** A term might have zero leaders (a failed election) but never two.
- **Every message carries the sender's term number.** Each server stores its own `currentTerm`. When two servers talk, they compare:
  - If a server sees a term *larger* than its own, it updates `currentTerm` and - if it was a candidate or leader - reverts to **follower**. It's been left behind by a newer election.
  - If a server receives a request with a *smaller* (stale) term, it **rejects** it.

> **The presidential-term analogy.** A term is like a numbered presidential term, and every official letter is stamped with the term it was written in. Get a letter stamped "Term 4" when you thought it was still Term 2? You realize you missed an election, accept Term 4 as current, and stand down from any office you held. Someone hands you a letter stamped "Term 2" today? You ignore it as obsolete.

## Heartbeats: how the leader holds power

How do followers know the leader is still alive? Through **heartbeats**.

The leader periodically sends an `AppendEntries` message to every follower. (This is technically an **RPC**, or "remote procedure call" - just a message asking another server to do something and reply.) `AppendEntries` is the same message used to replicate log entries, but when it carries no entries, it works purely as a heartbeat: an "I'm still here, stay calm" signal.

Each time a follower receives a valid heartbeat from the current leader, it **resets its election timer**. As long as heartbeats keep arriving, no follower times out, no follower starts an election, and the leader keeps its job. The leader sends heartbeats even when idle, precisely to keep followers calm.

The beautiful consequence: **silence, not an explicit "I'm dying" message, is what triggers a new election.** A leader that crashes, a leader that freezes, and a leader that gets cut off by a network partition all look *identical* to followers - they simply stop hearing heartbeats and react the same way.

## What kicks off an election

The **election timeout** is how long a follower waits, hearing nothing from a leader, before it gives up and tries to become leader itself.

When that timeout elapses with no heartbeat (and no vote granted to someone else), the follower does four things, in order:

1. **Becomes a candidate.**
2. **Increments its `currentTerm`** - starting a brand-new term.
3. **Votes for itself** - recording its own id in `votedFor` and counting one vote.
4. **Resets its election timer** and sends `RequestVote` messages, in parallel, to every other server.

The `RequestVote` message asks, "please vote for me as leader." It carries the candidate's term, its id, and two fields describing how up-to-date its log is - `lastLogIndex` (how long its log is) and `lastLogTerm` (how recent its newest entry is). Hold onto those last two; they become the eligibility gate we'll get to shortly.

## Winning the election: majority rule

A candidate **wins** if it receives votes from a **majority of all servers in the cluster** - not just a majority of those who replied. Majority means more than half. In a 5-server cluster, that's 3.

The voting rule on each server is strict and simple:

- Each server may vote for **at most one candidate per term**, on a **first-come, first-served** basis. Once it votes in term *T*, it refuses every other candidate in term *T*.
- A server rejects any `RequestVote` whose term is older than its own.

The moment a candidate gathers a majority, it becomes **leader** and immediately starts sending heartbeats - asserting authority and stopping any other elections before they can start.

### Why two leaders can never share a term

This is the elegant core of Raft. Suppose, for contradiction, that two candidates both won the *same* term. Each would need votes from a majority of the cluster. But **any two majorities of the same group must overlap in at least one server** - two groups each bigger than half simply can't be disjoint. That overlapping server would have had to vote *twice* in one term, which the "one vote per term" rule forbids. Contradiction. So at most one candidate can win a term. This is the **Election Safety** property.

> **The pizza-vote analogy.** Five club members elect a president. Each gets one ballot per round and can spend it on only one candidate. To win you need 3 ballots. Two candidates can't *both* collect 3, because 3 + 3 = 6 ballots and only 5 exist - at least one member would have to vote twice. So at most one winner per round.

A typical election plays out fast: the leader dies, a follower times out, becomes a candidate in a new term, sends `RequestVote` to everyone, collects a majority, becomes leader, and its heartbeats restore calm. Total time is usually a few hundred milliseconds.

## Split votes and the randomness that fixes them

There's a third possible outcome of an election: the candidate **neither wins nor loses**. That's a **split vote**.

It happens when several followers time out at nearly the same instant. They all become candidates in the same new term and all beg for votes simultaneously. The votes get divided, nobody reaches a majority, and each candidate sits stuck - having voted for itself, unable to win, unwilling to vote for anyone else this term.

Without a fix, this could repeat forever: everyone times out together, splits again, term after term. Raft's solution is delightfully simple - **randomized election timeouts**.

Instead of every server using the same fixed timeout, each picks its timeout **randomly from a fixed range** (the paper uses 150–300 ms as an example). The timeouts spread out, so usually *one* server times out clearly before the others, wins uncontested, and sends heartbeats before anyone else even wakes up. After a split, each candidate re-rolls a fresh random timeout, so the next round rarely ties again.

> **The pizza-slice deadlock.** Two people reach for the last slice at the exact same instant, freeze, and both say "you take it - no, you." The fix: each silently counts to a random number before reaching again. Whoever finishes first just takes it cleanly while the other is still counting. Randomized waiting breaks the symmetry that caused the deadlock.

This is a **probabilistic** guarantee, not a hard one. A tie is *possible* in any single round, but its odds shrink fast because two independent random picks rarely match closely, and each retry re-rolls the dice. In practice, elections resolve in one or two rounds.

## The hidden eligibility rule: an up-to-date log

So far, a follower grants its vote to the first candidate that asks. But there's one more condition, and it's the bridge to Raft's safety guarantees: **a server grants its vote only if the candidate's log is at least as up-to-date as its own.**

Why? The leader is the single source of truth for the log, and Raft never lets a leader overwrite committed history. So we must never elect a leader that's *missing* entries others have already committed - otherwise the new leader's incomplete log becomes official, and agreed-upon commands vanish. The vote is the gate that keeps a behind server from ever leading.

"Up-to-date" is compared in two steps (this is exactly why `lastLogTerm` and `lastLogIndex` ride along in `RequestVote`):

1. Compare the **term of the last entry** first. The log whose last entry has the *higher* term is more up-to-date.
2. If the last terms are **equal**, the **longer** log (higher index) wins.

A voter grants its vote only when the candidate's `(lastLogTerm, lastLogIndex)` is greater than or equal to its own.

**A concrete example.** Voter S3's last log entry is *index 5, term 4*. Two candidates ask:

- **Candidate A:** last entry index 6, term 4. Same last term, longer log → at least as up-to-date → S3 **grants** the vote.
- **Candidate B:** last entry index 8, term 3. Longer log, but its last term (3) is lower than S3's (4). Term is compared first, so B is **behind** despite being longer → S3 **refuses**.

This is why term beats length: a long log full of old-term entries can still be missing newer, already-committed ones. Elections aren't just popularity contests - a candidate must prove its log is current before anyone votes for it. Majority voting decides *who* leads; the log comparison decides *who is even eligible*.

## Common misconceptions

**"A candidate needs a majority of the servers that *respond*."** No - it needs a majority of the **entire cluster** (fixed size, e.g. 3 of 5). Unreachable servers count as non-votes, not as a smaller denominator. This is exactly what stops a cut-off minority from wrongly electing a leader.

**"A dying leader announces its death."** It doesn't. Detection is purely the **absence of heartbeats**. A crashed, frozen, and network-isolated leader all look identical to followers - which is why one timeout mechanism handles all three.

**"Every term has a leader."** A term can end with **no leader at all** if its election split. Raft just rolls into the next term and tries again. A leaderless term is normal and harmless.

**"Randomized timeouts prevent split votes."** They don't *prevent* them - they make repeated splits exponentially unlikely and each one resolve fast. Raft only needs splits to be rare and short, not impossible.

**"The first or most popular candidate always wins."** A candidate with a stale log gets **refused** by up-to-date voters thanks to the `lastLogTerm`/`lastLogIndex` check, even if it asked first. Eligibility comes before popularity.

## How to use this when you build or tune Raft

If you're implementing Raft or configuring a system that runs it, here are the concrete moves:

1. **Size your timeouts by the rule `broadcastTime ≪ electionTimeout ≪ MTBF`.** Set the election timeout well above your round-trip time so transient slowness doesn't trigger needless elections. 150–300 ms suits a fast LAN; use larger values across datacenters.
2. **Send heartbeats far more often than the election timeout** - commonly 10x faster (e.g. every ~50 ms against a 150–300 ms timeout) - so a single dropped heartbeat never costs you a leader.
3. **Re-randomize the timeout per server and per attempt.** Re-roll the random value at the start of every election. A fixed or poorly seeded timeout brings back the synchronized split votes randomization was meant to kill.
4. **Persist `currentTerm` and `votedFor` to stable storage before replying to any RPC.** If a server crashes and restarts within a term, it must remember it already voted - otherwise it could vote twice and break the at-most-one-leader guarantee.
5. **Prefer an odd cluster size (3, 5, 7).** Odd sizes give a clean majority and the best fault tolerance per node. Five servers tolerate two failures; going to six still tolerates only two while making every quorum larger and slower.

## Conclusion

The single idea worth carrying away: **Raft elects a leader not with a central authority, but with two interlocking rules - one vote per server per term, and a majority to win.** Quorum overlap turns those humble rules into an ironclad guarantee that two leaders can never coexist, while randomized timeouts keep elections fast and self-healing.

But electing a leader is only the opening act. Once a leader is in charge, it has to copy its log to every follower, survive followers that fall behind or feed it conflicting history, and *never* erase a command the cluster already agreed on. How Raft pulls that off - the [log replication and safety machinery](/blog/distributed-systems/05-raft-log-replication-safety-membership) that the up-to-date-log check quietly set up here - is where the real magic lives. That's the next thread to pull.
