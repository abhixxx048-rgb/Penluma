---
title: "Consensus Algorithms: A Plain-English Glossary"
metaTitle: "Distributed Consensus Glossary (Raft & Paxos)"
description: "A plain-English glossary of distributed consensus terms. Understand Raft, Paxos, quorums, terms, leaders, safety, and liveness without the academic jargon."
keywords:
  - distributed consensus glossary
  - Raft vs Paxos
  - consensus algorithm terms
  - what is a quorum
  - Raft term explained
  - Paxos ballot number
  - safety vs liveness
  - leader election
  - replicated state machine
  - FLP impossibility
  - Byzantine fault tolerance
  - Multi-Paxos
  - commit index
  - distributed systems vocabulary
faq:
  - q: "What is the difference between Raft and Paxos?"
    a: "Both solve the same problem: getting nodes to agree on one ordered log of commands. Paxos came first and is famously hard to follow; Raft was designed later to be understandable, with an explicit single leader and clear election rules. Most new systems pick Raft for that reason."
  - q: "What is a quorum in distributed systems?"
    a: "A quorum is the minimum set of nodes whose agreement counts as the whole cluster's decision, almost always a strict majority. Because any two majorities must share at least one node, requiring a quorum for every decision makes conflicting decisions impossible."
  - q: "What is the difference between safety and liveness?"
    a: "Safety means nothing bad ever happens, like two nodes never committing different values at the same position. Liveness means something good eventually happens, like a decision getting made. When forced to choose, consensus protocols keep safety and pause liveness."
  - q: "What is a term in Raft?"
    a: "A term is Raft's logical clock: a number that only ever increases and marks one leadership period. At most one leader exists per term, and a higher term always beats a lower one, which is how the cluster spots and rejects a stale leader."
  - q: "What does the FLP impossibility result actually say?"
    a: "It proves that in a fully asynchronous system where even one node might crash, no deterministic algorithm can always guarantee consensus is reached. Real systems work around it using timeouts and randomization to get practical, good-enough progress."
  - q: "What is a replicated state machine?"
    a: "It is the core pattern behind these systems: identical state machines on every node that stay in lockstep because they process the same commands in the same order. Consensus is the machinery that agrees on what that order is."
topic: distributed-systems
topicTitle: Distributed Systems
category: Engineering
date: '2026-06-21'
order: 17
icon: "\U0001F310"
author: Brexis Wazik
transformed: true
linked: true
sources: []
---

You open a paper on Raft, hit the word "ballot" in the third paragraph, then "quorum," then "leader completeness," and within a page you are quietly drowning. The ideas are not hard. The vocabulary is.

Distributed consensus has a reputation for being impenetrable, and most of that reputation comes from terms that sound scarier than they are. Once you have a clear, plain-English handle on each one, the algorithms snap into focus.

This is that handle. A working glossary you can keep open in another tab.

## Why this matters

Almost every serious system you rely on leans on consensus underneath. The database that never loses a write. The service registry that always agrees on who is alive. The configuration store that hands the same answer to every server. Tools like **etcd**, **Consul**, **ZooKeeper**, and **CockroachDB** all run a consensus algorithm at their core.

When one of these systems misbehaves at 3 a.m., the logs and dashboards speak this exact language: terms, elections, commit indexes, split votes. If the words are fog to you, the incident is fog too.

Learn the vocabulary and two things happen. You can read the original papers and source code without constant detours. And you can reason about real failures, why a cluster lost its leader, why writes paused during a network partition, why a node fell behind, instead of just guessing.

## The big picture in one breath

Before the definitions, here is the story they all serve.

You want several machines to behave like one reliable machine, even though some of them will crash and the network between them will drop and delay messages. The trick is the **[replicated state machine](/blog/distributed-systems/03-replicated-state-machines-the-log)**: give every node an identical program, feed all of them the exact same commands in the exact same order, and they stay perfectly in sync.

Everything else is detail in service of that one order. **Consensus** is how the nodes agree on the order. **Raft** and **[Paxos](/blog/distributed-systems/06-paxos-the-original-consensus-algorithm)** are two ways to run consensus. The rest of this glossary is the supporting cast.

## The core problem

These terms describe what consensus is trying to do at all.

- **Consensus** - Getting multiple nodes to agree on a single value, or a single ordering of events, despite crashes and an unreliable network. This is the whole game.
- **Replicated State Machine (RSM)** - Identical state machines on each node that stay in lockstep because they process the same commands in the same order. Consensus exists to agree on that order.
- **Log / log entry** - The ordered, append-only list of commands each node stores. An entry holds a command plus the term it was created in. Agreeing on the log is how nodes stay identical.

Think of an RSM like a row of people transcribing the same dictation. If everyone writes the same words in the same order, every page comes out identical. The hard part is the dictation arriving out of order, or the speaker occasionally vanishing mid-sentence.

## Safety, liveness, and the four guarantees

Consensus protocols make promises. These terms name them precisely.

- **Safety** - Nothing bad ever happens. Two nodes never commit different values at the same position. Crucially, protocols hold safety even during network partitions; they will pause progress rather than risk it.
- **Liveness** - Something good eventually happens. A decision gets reached, progress gets made.

That tension is the heartbeat of the whole field: **when you cannot have both, you keep safety and sacrifice liveness.** A database that stalls is annoying. A database that hands two clients contradictory answers is broken.

Consensus is usually defined by four properties:

1. **Agreement** - No two correct nodes ever decide different values. One outcome, not several.
2. **Validity** - The decided value must be one some node actually proposed. You cannot agree on something nobody asked for.
3. **Termination** - Every correct node eventually decides. The algorithm does not run forever.
4. **Integrity / single decision** - A node decides at most once.

### The FLP impossibility result

This one sounds like a doorway slamming shut, and it almost is.

**FLP**, named for Fischer, Lynch, and Paterson, proves that in a fully asynchronous system where even one node might crash, no deterministic algorithm can *guarantee* consensus is always reached. There is no perfect solution. Full stop.

So why does anything work? Because real systems cheat, gracefully. They add **timeouts** and **randomization** to get practical liveness, progress that is overwhelmingly likely rather than mathematically certain. FLP says you cannot promise progress in every theoretical universe. It does not say you cannot make progress essentially all the time in this one.

## Raft: the understandable one

Raft was deliberately designed to be teachable, by splitting consensus into [leader election](/blog/distributed-systems/04-raft-leader-election), log replication, and safety. These are its working parts.

### Server states

- **Follower** - The default, passive state. Followers do nothing on their own; they just answer messages from leaders and candidates.
- **Candidate** - A follower whose patience ran out. It times out waiting for a leader, bumps the term, votes for itself, and asks everyone else for votes.
- **Leader** - The single elected server that handles all client writes and is the only source of new log entries. Everything flows leader to followers.

### How leaders get chosen and stay in power

- **Term** - Raft's logical clock. A number that only increases, marking one leadership period. At most one leader per term, and higher terms always beat lower ones, which is how stale leaders get exposed.
- **Election timeout** - The randomized wait a follower endures without hearing from a leader before starting an election. The randomization is the clever bit; it staggers timeouts so candidates rarely clash.
- **RequestVote** - The message a candidate sends to collect votes. A server grants its vote only if it has not voted this term and the candidate's log is at least as current as its own.
- **Split vote** - An election where votes scattered and nobody got a majority, forcing a do-over. Randomized timeouts make repeated split votes rare.
- **AppendEntries** - The message a leader sends to copy new log entries to followers. Sent empty, it doubles as the heartbeat.
- **Heartbeat** - A periodic empty AppendEntries that says "I'm still here," resetting follower timeouts and preserving the one-leader rule.

A useful mental image: a classroom where the teacher must constantly say "still here, still here." The moment students stop hearing it, one of them stands up and calls a vote to become the new teacher. The random wait keeps two students from standing at the exact same second.

### Keeping the logs honest

- **Committed entry** - A log entry stored on a majority of servers by the current leader. Once committed, it will never be lost and will eventually appear, in the same slot, on every node.
- **Commit index** - The index of the highest entry known to be committed. It only moves forward.
- **Log matching** - If two logs share an entry with the same index and term, they are identical up to that point. This lets a follower's log be repaired with a simple backward check.
- **Leader completeness** - Any entry committed in one term shows up in the logs of all later leaders. The voting rules guarantee only an up-to-date server can win, so committed history is never lost.
- **Snapshot** - A compacted image of the state machine at a moment in time. It lets you throw away old log entries and fast-forward a server that fell behind or just joined.
- **Joint consensus** - Raft's safe way to add or remove members. The cluster passes through a transition that needs majorities from *both* the old and new member sets, so there is never a moment when two separate majorities could each elect their own leader.

## Paxos: the original

Paxos came first and is famous for being hard to follow. The roles split differently from Raft, but the goal is identical.

### The roles

- **Proposer** - Drives the protocol. Picks a ballot number, proposes a value, and tries to win over a majority.
- **Acceptor** - A voting member. A value is chosen only when a majority of acceptors accept it. Acceptors remember the highest proposal they have promised and the last value they accepted.
- **Learner** - Finds out which value was chosen and acts on it, without voting. In practice, learners often catch the application's state machine up.

### The mechanics

- **Ballot (ballot number)** - A globally ordered, unique proposal number used to rank competing proposals. Paxos's equivalent of Raft's term.
- **Prepare / Promise (Phase 1)** - The proposer asks acceptors to "promise" not to accept any lower-numbered proposal. They reply with that promise plus any value they have already accepted, so the proposer respects choices already made.
- **Accept / Accepted (Phase 2)** - The proposer asks acceptors to accept a specific value. If a majority accept, it is chosen.
- **Multi-Paxos** - Paxos tuned for a continuous stream of decisions. Elect a stable leader once, then skip the prepare phase for later slots so steady-state commits take a single round trip. This is what real "Paxos" deployments actually run.
- **EPaxos (Egalitarian Paxos)** - A leaderless variant where any node can commit commands. Non-conflicting commands commit in one round trip with no fixed leader, trading complexity for better latency and balance.

If Raft is one teacher running the room, classic single-decree Paxos is a committee with a strict two-phase voting ritual: first lock out lower bids, then ratify a value. **[Multi-Paxos](/blog/distributed-systems/07-multi-paxos-raft-vs-paxos-the-real-world)** is that same committee finally electing a chair so it can stop re-running the opening ritual every single time.

## The shared foundation: majorities

This idea sits under both Raft and Paxos, and it is the quiet genius of the whole field.

- **Majority (quorum)** - More than half the nodes. Any two majorities must overlap in at least one node, so requiring a majority for every decision means two conflicting decisions are impossible.
- **Quorum** - The minimum set of nodes whose agreement counts as the cluster's decision, almost always a strict majority. That overlap property is exactly what makes consensus safe.

Picture a five-seat council where every motion needs three votes. There is no way to pass two contradictory motions, because any two groups of three must share at least one person, and that person will not vote both ways. The whole edifice of consensus rests on this small, stubborn fact about overlapping majorities.

## When nodes lie: Byzantine faults

Everything above assumes nodes fail by *crashing*, going silent. They do not assume nodes *lie*.

- **Byzantine Fault Tolerance (BFT)** - Tolerating nodes that behave arbitrarily or maliciously, lying or sending conflicting messages, not just crashing. Raft and classic Paxos are crash-only; BFT needs different, more expensive algorithms.
- **PBFT (Practical Byzantine Fault Tolerance)** - A landmark BFT protocol that tolerates up to f malicious nodes out of 3f+1, using multiple voting rounds. The foundation for many later blockchain and permissioned-ledger systems.

The jump in cost is real: surviving liars needs more nodes and more message rounds than surviving crashes. Use BFT when participants might be adversarial, like an open blockchain, and skip it inside your own trusted data center.

## A few more you will meet

- **Epoch** - Another name for term or ballot: a monotonically increasing number marking a leadership reign. Used in ZAB and elsewhere to detect and reject stale leaders.
- **ZAB (ZooKeeper Atomic Broadcast)** - The leader-based protocol behind Apache ZooKeeper. Like Raft, it uses a single leader and epochs to deliver a totally ordered, replicated log.

Notice the pattern: term, ballot, epoch. Three names, one idea, a number that climbs so the system can always tell new authority from old.

## Common misconceptions

**"Raft and Paxos are fundamentally different solutions."** They solve the same problem and rest on the same majority foundation. Raft just makes the leader and the rules explicit, while Paxos leaves more to the implementer. Their vocabularies map almost one-to-one: term equals ballot equals epoch.

**"Consensus means the system is always available."** No. When forced to choose, consensus protocols keep safety and pause progress. During a partition without a majority, a correct system will refuse to make progress rather than risk a conflicting decision.

**"FLP means consensus is impossible, so this is all theater."** FLP rules out a *guarantee* of progress in a fully asynchronous, failure-prone model. Real systems add timeouts and randomization and reach decisions reliably in practice. Impossible to guarantee is not the same as impossible to do.

**"More nodes means more reliable and faster."** More nodes can tolerate more failures, but every committed write still needs a majority to agree, so larger clusters often commit *slower*. Five nodes is a common sweet spot.

## How to use this glossary

1. **Anchor on the big four first.** Consensus, replicated state machine, quorum, and the safety-versus-liveness pair. Understand these and every other term has a place to attach.
2. **Read the cross-references.** Term, ballot, and epoch are the same idea. Majority and quorum are the same idea. Spotting these collapses the list to something far smaller.
3. **Map Raft and Paxos side by side.** Leader and proposer, follower and acceptor, term and ballot. Learning one algorithm gives you most of the other for free.
4. **Translate your incidents.** Next time a cluster logs a leader election or a split vote, find the term here and trace what the system was actually protecting.
5. **Keep it open while you read source code.** etcd, ZooKeeper, and CockroachDB use these exact words. Treat their code as the worked examples for these definitions.

## Conclusion

If you remember one thing, remember this: **every consensus algorithm is an elaborate machine for safely agreeing on the order of a log, built on the stubborn fact that any two majorities must overlap.** Once you see that overlap, the leaders, terms, ballots, and quorums stop being jargon and start being moves in a single, coherent game.

The natural next question is the one the **[CAP theorem](/blog/distributed-systems/16-the-cap-theorem-and-pacelc)** poses out loud: when the network splits your cluster in two, do you keep answering and risk disagreement, or stay consistent and go quiet? Consensus has already made its choice. Understanding *why* it chooses consistency, and what you give up for it, is where distributed systems get genuinely interesting.
