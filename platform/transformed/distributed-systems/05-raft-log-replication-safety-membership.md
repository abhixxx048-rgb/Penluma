---
title: 'How Raft Keeps Every Server in Perfect Sync'
metaTitle: 'Raft Log Replication & Safety Explained'
description: >-
  A clear, plain-English guide to Raft log replication, the commit majority rule,
  the Figure-8 safety bug, cluster membership changes, and snapshotting.
topic: distributed-systems
topicTitle: Distributed Systems
category: Engineering
date: '2026-06-21'
order: 4
icon: "\U0001F310"
keywords:
  - raft consensus
  - raft log replication
  - appendentries rpc
  - raft commit majority
  - log matching property
  - raft figure 8 problem
  - raft cluster membership change
  - joint consensus
  - raft snapshot installsnapshot
  - leader completeness
  - state machine safety
  - distributed systems consensus
faq:
  - q: What does "committed" mean in Raft?
    a: An entry is committed once it is stored on a majority of servers. After that point Raft guarantees it can never be lost, overwritten, or reordered, so it is safe to apply and reply to the client.
  - q: Why can't a Raft leader commit an old-term entry just because it's on a majority?
    a: Because a different server with a shorter log can still win a future election and overwrite it. This is the Figure-8 problem. A leader only counts replicas to commit entries from its own current term; older entries commit indirectly once a current-term entry on top of them commits.
  - q: How does Raft fix a follower whose log has diverged?
    a: The leader backs up a per-follower pointer called nextIndex until it finds the last index where the two logs agree, then ships its own entries forward. The follower deletes any conflicting tail and copies the leader exactly.
  - q: What is the safest way to change a Raft cluster's membership?
    a: Change one server at a time, or use joint consensus (a transitional config that needs majorities from both the old and new sets). Both methods make two disjoint majorities, and therefore split brain, impossible.
  - q: Why does Raft need snapshots?
    a: The log grows forever, one entry per command. Snapshots dump the current state machine so old entries can be discarded, keeping disk use and restart time bounded. InstallSnapshot brings a far-behind follower up to date when needed entries are already gone.
  - q: How does Raft decide which candidate is "up-to-date" enough to win an election?
    a: It compares the last log term first; the higher term wins. If the last terms are equal, the longer log wins. A shorter log with a higher last term counts as more up-to-date.
author: Brexis Wazik
transformed: true
linked: true
sources:
  - https://en.wikipedia.org/wiki/Raft_(algorithm)
---

Five servers. One of them just told a customer "your order is saved." A second later, that server catches fire. Did the order survive?

With Raft, the answer is a confident yes, and not by luck. Raft is the [consensus algorithm](/blog/distributed-systems/02-the-consensus-problem) behind etcd, Consul, and the brains of countless Kubernetes clusters. In the last piece you saw how it [elects a single leader](/blog/distributed-systems/04-raft-leader-election). This piece covers the harder half: how that leader copies a stream of commands to every machine so they all end up identical, and stay identical through crashes, lag, and live membership changes.

## Why this matters

If you run anything stateful across more than one machine, you are trusting some protocol to answer one brutal question: when a server says "done," is it actually done, even if half the cluster dies the next instant?

Get this wrong and you get the worst kind of bug, the silent one. A write that looked committed quietly vanishes. Two servers each believe they're the leader and accept conflicting writes. Your data forks.

Raft is popular precisely because it makes these guarantees easy to reason about. Once you understand its few moving parts, you can read a cluster's behavior, debug a stuck commit, and configure membership changes without bricking production. That understanding is what this article gives you.

## The one idea everything rests on: the replicated log

Picture a shared notebook that a team copies by hand. Only one person, the **leader**, is allowed to write a new line. Everyone else copies the leader's notebook, line for line, in order.

That notebook is the [**replicated log**](/blog/distributed-systems/03-replicated-state-machines-the-log). A few terms you'll need, in plain words:

- **Log entry** - one line in the notebook. It holds a **command** (the actual operation, like `set x = 5`), the **term** it was created in (a numbered period with at most one leader), and its position number, the **index**.
- **State machine** - your application's data, built by applying the commands in log order. Same commands, same order, same final state on every server. That is the entire point of consensus.
- **Committed** - an entry is committed once Raft guarantees it can never be lost. Only then is it safe to apply and reply to the client.
- **Majority** - more than half the servers. In a 5-server cluster, that's 3. Here's the magic: any two majorities always share at least one server. That overlap is the mathematical trick the whole protocol leans on.

The trouble is that copiers crash, lose pages, and copy stale versions. So the leader needs a disciplined way to detect "your page 4 doesn't match mine" and fix it, without ever tearing out a line the team has already officially agreed on.

## How the leader copies entries: AppendEntries

Raft uses just two message types between servers (an RPC, "remote procedure call," is simply a message that says "run this and tell me the result"). You already met `RequestVote` in elections. The workhorse here is **`AppendEntries`**.

The leader sends it to every follower to copy new entries, and, when there's nothing new, as a **heartbeat**: an empty `AppendEntries` that just says "I'm still alive, stay quiet."

The clever part is two fields the leader includes:

- **`prevLogIndex`** - the index of the entry *immediately before* the new ones.
- **`prevLogTerm`** - the term of that entry.

Together these act as a **fingerprint** of the follower's log up to the join point. When a follower receives the message, it checks its own entry at `prevLogIndex`. If it's missing, or the term doesn't match, the follower replies `false`: "our logs disagree here, don't append yet." Otherwise it appends the new entries, deletes anything that conflicts, and advances how far it can safely apply.

### Why checking a single entry is enough

This looks suspicious. The follower checks *one* entry, yet somehow trusts the entire history before it. How?

Because Raft maintains an invariant called the **Log Matching Property**:

> If two logs contain an entry with the same index and the same term, then they store the same command there, and they are identical in every entry before it.

It holds because a leader creates at most one entry per index per term, and entries never move once written. So matching at the join point implies matching all the way back. This is the load-bearing trick: it turns the expensive question "are these two long logs identical?" into a single cheap comparison.

**Key takeaway:** `prevLogIndex` + `prevLogTerm` is a checksum for everything before the new entries. Match it, and the whole prefix matches. That's what lets Raft verify and repair logs one entry at a time.

## Fixing a follower that fell out of sync

After a crash, a follower's log can be wrong two ways. It can be **missing** entries the leader has, or it can have **extra** entries from a previous leader that were never committed and must be thrown away. Raft fixes both with one mechanism.

The leader keeps a number per follower called **`nextIndex`**: "the next index I'll try to send you." When the follower rejects an `AppendEntries`, the leader **decrements** `nextIndex` and retries, backing up until it finds the last index where the two logs agree. From there, its entries flow in, and the follower deletes any conflicting tail. Eventually the follower's log is byte-for-byte the leader's.

Here's the interesting case. Say a follower has extra entries from old terms 2 and 3 at indexes 4, 5, 6, but the real leader (term 4) has different entries there:

```
                 idx: 1    2    3    4    5    6    7
   Leader (term 4) [ 1 ][ 1 ][ 1 ][ 4 ][ 4 ][ 4 ][ 4 ]   (numbers = TERM of entry)
   Follower X      [ 1 ][ 1 ][ 1 ][ 2 ][ 2 ][ 3 ]
                                    ^^^^^^^^^^^^^^
                          extra, UNCOMMITTED entries from old terms 2 & 3

   Leader backs up nextIndex: 7 -> 6 -> 5 -> 4 (all rejected) -> 3 (MATCH!)
   Leader sends entries[4..7] = (4,4,4,4).
   Follower deletes its stale 4,5,6 and writes the leader's.

   Result -> Follower X [ 1 ][ 1 ][ 1 ][ 4 ][ 4 ][ 4 ][ 4 ]   identical.
```

Throwing away those "extra" entries feels alarming, but it's correct. They were never on a majority, so they were never committed, and no client was ever told they succeeded. Deleting them loses nothing the system ever promised.

**One practical warning:** decrementing `nextIndex` by one per round-trip is correct but painfully slow for a far-behind follower, one RPC per missing entry. Production systems use the paper's optimization: a rejecting follower returns the term of the conflicting entry and the first index it has for that term, letting the leader skip a whole term in one jump. etcd does this. Don't ship the naive one-at-a-time version under load.

## Commitment: the majority rule, and one famous trap

An entry is **committed** the moment it's stored on a **majority** of servers. Once committed it's durable: even if any minority crashes, every future leader will still have it.

```
COMMIT BY MAJORITY (5 servers, majority = 3). Leader appends an entry.

   Leader appends [x=0] to its own log                  (1 of 5)
   Leader sends AppendEntries to A, B, C, D
       A: stored, ack   ->  2 of 5
       B: stored, ack   ->  3 of 5   *** MAJORITY reached ***
   Leader commits -> applies x=0 -> replies "OK" to client
   C and D catch up later via the next heartbeat.

   The entry is COMMITTED once 3 of 5 have it, not when everyone does.
```

Durability comes from the majority overlap, not from "everyone." That's why Raft tolerates slow and dead followers without blocking.

### The Figure-8 problem: when "on a majority" is a lie

Now the trap that catches almost everyone. Suppose a new leader finds an entry from an *earlier* term sitting in its log, already replicated on a majority. Tempting to say "it's on a majority, therefore it's committed." **This is wrong, and it can lose committed data.**

Why? Because elections compare logs by **term first, not by length** (more on that next). A different server with a shorter log can still win a future election and overwrite that majority-replicated entry. So "on a majority right now" does not, by itself, mean "permanent."

Raft's fix is the **commitment restriction**:

> A leader only counts replicas to commit entries from its *own current term*. Older-term entries commit indirectly: once a current-term entry sitting *after* them commits, the Log Matching Property drags the older ones along, safely.

In other words, a fresh leader never "re-commits" what it inherited. It commits something new in its own term, and the moment that new entry reaches a majority, everything before it is committed too. By then, no stale challenger can win, so the old entry is truly safe.

## How committed entries survive forever

All of the above only works if Raft can promise one thing: **a committed entry is never lost, never overwritten, and never shows up at a different index later.** It earns that promise with two rules.

### Rule 1: only an up-to-date candidate can win

When a candidate asks for a vote, it includes its last log's index and term. A follower grants its vote **only if the candidate's log is at least as up-to-date as its own**, judged like this:

1. Compare the **last log term**. The higher term wins.
2. If the last terms are equal, the **longer log** wins.

Here's the payoff. A candidate needs a majority of votes. Any majority overlaps the majority that stored a committed entry, so at least one voter *holds that entry*, and that voter will refuse anyone missing it. Therefore a candidate lacking a committed entry can never assemble a majority. It simply cannot win.

Think of electing a new editor for the team notebook, where the rule is "only vote for someone whose notebook is at least as complete as yours." Every agreed-upon line lives in a majority of notebooks, so at least one voter holds all of them, and they won't endorse anyone missing a line. The new editor always already has every agreed line. Nothing agreed can be lost across a handover.

### Rule 2: leaders only append

Combine that election rule with one more: a leader never deletes or overwrites its own entries, it only appends. The result is the **Leader Completeness Property**: every committed entry is present in every future leader, at the same index, forever. That is exactly **State Machine Safety**: no two servers ever apply different entries at the same index.

**Key takeaway:** The safety argument is one clean chain. Majority overlap means a voter holds each committed entry; the election rule means that voter blocks any leader missing it; so every future leader is complete; and append-only logs mean a committed entry can never be displaced. Committed equals permanent.

## Changing the cluster safely (without split brain)

Real clusters grow, shrink, and replace dead machines. The **configuration** is the set of servers that count toward a majority, and changing it is genuinely dangerous. For a brief window, servers can disagree about *who the members even are*, and that can produce **two disjoint majorities electing two leaders at once**, the split brain that consensus exists to prevent.

```
WHY A NAIVE SWITCH IS UNSAFE: growing 3 servers to 5 in one step.

   Old config = {S1,S2,S3}       majority = 2
   New config = {S1,S2,S3,S4,S5} majority = 3

   If servers adopt the new config at different times:
       S1,S2    still on old config -> {S1,S2}    = majority of old
       S3,S4,S5 on new config       -> {S3,S4,S5} = majority of new

   Two majorities, no overlap -> S1 and S3 can BOTH win. Split brain.
```

Raft offers two safe ways to avoid this.

**Joint consensus** is the general method. The cluster passes through a transitional config, `C-old,new`, in which every election and every commit needs a *separate* majority from **both** the old set and the new set, not one merged majority. That makes overlapping majorities impossible, so no two leaders can coexist. Once the joint config commits, the leader appends the final `C-new`, and after that commits, the transition is done. Clients are served the whole time, with no downtime.

**Single-server-at-a-time** is the simpler method most systems actually use. Add or remove only one server per change. Changing the count by one can never split the cluster into two non-overlapping majorities, so it's always safe. To go from 3 to 5, do two single changes in a row. etcd and Consul work this way.

The analogy: changing a board of directors mid-meeting. If half the room thinks Alice was just removed and half thinks she still votes, you can ratify two contradictory motions. Joint consensus says a motion must pass under *both* the old and new bylaws at once. The single-at-a-time rule says "seat or unseat only one director per meeting." Both make competing majorities impossible.

## Keeping the log from eating the disk: snapshots

The log grows forever, one entry per command. Left alone it fills the disk, and restarts (which replay the whole log) crawl. The fix is a **snapshot**: a compact dump of the state machine's *current* state. Once you snapshot up to index N, you can delete entries 1 through N, because their combined effect is already captured.

Each server snapshots independently and keeps two bookkeeping values, `lastIncludedIndex` and `lastIncludedTerm`, so the Log Matching consistency check still works at the boundary after the entries are gone.

This creates one corner case. What if a follower is so far behind that the leader already discarded the entries it needs? The leader can't send what it no longer has. So Raft adds a third RPC, **`InstallSnapshot`**: the leader ships its whole snapshot to the lagging follower, who installs it wholesale and resumes normal `AppendEntries` from the snapshot's end.

For example: a 5-server cluster has processed a million commands and snapshotted at index 950,000, deleting everything older. A follower that was offline for an hour comes back asking for index 200,000, which no longer exists anywhere. The leader sends an `InstallSnapshot`, the follower replaces its stale log in one shot, then catches up the last few thousand entries normally. Far faster than replaying a million.

## Common misconceptions

- **"The consistency check compares whole logs."** No, it checks a *single* entry at `prevLogIndex`. The Log Matching Property is what makes that one check imply the entire prefix matches.
- **"Replicated on a majority always means committed."** Only for entries in the leader's *current* term. Committing an older-term entry by counting replicas is the Figure-8 bug, and it can lose data.
- **"The longest log always wins an election."** Raft compares the *last term first*; length is only a tie-breaker. A shorter log with a higher last term is more up-to-date.
- **"A follower's discarded extra entries were data loss."** Those entries were never on a majority and no client was ever told they succeeded. Deleting them is correct.
- **"You can change membership by editing a config file and restarting nodes."** That's how you create two majorities and two leaders. Use joint consensus or single-at-a-time changes.
- **"Snapshotting is optional."** Without it, restart time and disk use grow without bound. It's mandatory for any real deployment.

## How to use this

If you're running or building on Raft, here are the concrete moves that matter:

1. **Persist before you acknowledge.** Write `currentTerm`, your vote, and new log entries to stable storage *before* replying to any RPC. Acking an entry you haven't durably stored breaks the majority-durability guarantee the instant a server crashes.
2. **Use fast log backtracking.** On a rejection, have the follower return the conflicting term plus the first index of that term, so the leader jumps per-term instead of per-entry. Never ship the decrement-by-one repair under load.
3. **Onboard new servers as non-voting learners.** Let a fresh, empty member catch up via `AppendEntries` before promoting it to a voter. An empty newcomer counted in a majority can stall commits or trigger spurious elections. etcd's "learner" and Consul's non-voting members exist for exactly this.
4. **Change membership one server at a time** (or implement proper joint consensus). Never do a multi-server swap in a single step.
5. **Snapshot on a schedule and tune the trigger** (every N entries or M bytes). Keep `lastIncludedIndex` and `lastIncludedTerm`, and stream large snapshots in chunks.
6. **When you debug a stuck commit, check term ownership first.** If the leader is waiting on an inherited older-term entry, remember it can only commit indirectly, once a fresh current-term entry on top of it commits.

## Conclusion

The whole of Raft collapses into one promise: **committed means permanent.** Once an entry lands on a majority and the leader has committed something in its own term, that entry is in every future leader, at the same index, applied identically everywhere, no matter who crashes. Every rule above, the fingerprint check, the Figure-8 restriction, the election filter, joint consensus, exists to protect that single word.

Here's the thread worth pulling next. Raft buys its clarity by funneling every write through one leader, which is also its ceiling: that leader is a throughput bottleneck. So what happens when one leader isn't fast enough? That question leads straight into multi-leader and [leaderless systems like Dynamo and CRDTs](/blog/distributed-systems/17-consistency-models), where the rules you just learned get bent in fascinating, dangerous ways.
