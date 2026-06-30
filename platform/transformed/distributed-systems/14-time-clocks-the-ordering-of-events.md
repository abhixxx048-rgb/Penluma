---
title: "Why You Can't Trust Clocks to Order Events Across Machines"
metaTitle: "Lamport Clocks & Ordering Events Explained"
description: "Wall-clock timestamps lie across machines. See how Lamport logical clocks and the happens-before relation order events in distributed systems, no shared clock."
keywords:
  - lamport clocks
  - happens-before relation
  - ordering of events in distributed systems
  - logical clocks
  - lamport timestamps
  - clock skew
  - clock drift
  - distributed systems time
  - vector clocks vs lamport clocks
  - causal ordering
  - total order vs partial order
  - distributed mutual exclusion
  - concurrent events distributed systems
  - leslie lamport paper
faq:
  - q: "What is the happens-before relation in distributed systems?"
    a: "Happens-before (written a → b) means event a could have causally influenced event b. It holds when a comes before b in the same process, when a sends a message that b receives, or through a chain of those two. It never uses real time."
  - q: "Why can't you use wall-clock timestamps to order events across machines?"
    a: "Every machine's clock drifts and disagrees with others (clock skew of 100–250 ms is common even with NTP). A later event can carry an earlier timestamp, so a timestamp comparison can put an effect before its cause."
  - q: "What is a Lamport logical clock?"
    a: "It is a simple integer counter each process keeps. The process ticks it before every event, piggybacks its value on outgoing messages, and on receive sets its clock to max(local, received) + 1. The numbers respect causality without measuring real time."
  - q: "Does a smaller Lamport timestamp mean an event happened first?"
    a: "No. If a → b then C(a) < C(b), but the reverse is not guaranteed. Two concurrent (causally unrelated) events can have any timestamps. Lamport clocks order causal events but cannot detect concurrency."
  - q: "What is the difference between Lamport clocks and vector clocks?"
    a: "Lamport clocks give one number per event and order causal events, but cannot tell whether two events are concurrent. Vector clocks track a counter per process and can detect concurrency, which is why they power systems like DynamoDB and Riak."
  - q: "What does concurrent mean in distributed systems?"
    a: "Concurrent means causally unrelated, not 'at the same instant.' Two events are concurrent when no chain of local steps and messages connects them, so neither could have influenced the other. They can be seconds apart in real time."
author: Brexis Wazik
transformed: true
linked: true
topic: distributed-systems
topicTitle: Distributed Systems
category: Engineering
date: '2026-06-21'
order: 3
icon: "\U0001F310"
sources:
  - https://en.wikipedia.org/wiki/Lamport_timestamp
  - https://en.wikipedia.org/wiki/Happened-before
---

A message arrives at its destination stamped with a time *earlier* than the moment it was sent. The effect appears to happen before the cause. No bug in your code did this. Your clocks did.

This is not a rare glitch. The moment your software runs across more than one machine, the innocent question "what happened first?" becomes [one of the hardest problems in computing](/blog/distributed-systems/13-why-distributed-systems-are-hard). And the answer, worked out by Leslie Lamport in a single 1978 paper, is that you should mostly stop asking about *time* and start asking about *cause*.

## Why this matters

If you build anything that spans more than one server, you eventually have to merge events from different machines into one story. Logs. Traces. Database writes. Chat messages. Git commits.

Get the order wrong and the consequences are not cosmetic:

- A database silently keeps the *wrong* version of a row because it trusted a timestamp.
- A distributed trace shows a response arriving before the request that caused it.
- Two servers both think it is their turn to write to a shared resource.

The instinct is to slap a timestamp on every event and sort. On one machine that works perfectly. Across many machines it quietly corrupts your data, and the worst part is it usually *looks* fine until it doesn't.

Lamport's insight is the way out: for ordering events, you almost never need real time. You need **causality** - who could have influenced whom.

## The wall-clock trap: why timestamps lie

Picture three people in three different cities writing letters to each other. No phone, no shared calendar. Each person knows only two things: the order they did their own tasks, and that a letter they received must have been written before it arrived. They can never observe a global "now."

That is [a distributed system](/blog/distributed-systems/12-what-is-a-distributed-system). The machines are the people. The messages are the letters. And like those letters, messages take an unknown, variable time to arrive - but they can never arrive before they were sent. That one rule of reality is the only thing we get to keep.

So why not just read each machine's clock? Three reasons.

### Clocks drift

**Drift** means a clock runs slightly fast or slightly slow and slowly wanders from true time. Computer clocks are driven by a cheap quartz crystal whose rate shifts with temperature and age. A typical one drifts by about **one second every 11–12 days**. Two machines aligned at boot can be seconds - eventually minutes - apart.

### Clocks are skewed

**Skew** is the gap between two clocks *at one instant*. Because each machine drifts at its own pace, right now machine A might read `14:03:07.100` while machine B reads `14:03:07.230`. That 130-millisecond difference is skew.

### Even NTP doesn't fully fix it

**NTP** (Network Time Protocol) is the standard service machines use to ask time servers "what time is it?" and nudge their clocks toward agreement. It helps enormously, but it can only *estimate* network delay, never erase it. Under good conditions NTP holds skew to about **10 milliseconds**; in real data centers **100–250 milliseconds** is common, and clocks can even jump *backward* when NTP corrects them.

Here is the killer scenario. Suppose `P1` sends a message that *causes* something on `P2`. If `P1`'s clock runs fast and `P2`'s runs slow, the receive on `P2` can be stamped *earlier* than the send on `P1`:

```
P1 (clock runs FAST)          P2 (clock runs SLOW)
14:03:07.300  send msg --------> receive msg  14:03:07.250

Sort by timestamp: 07.250 (receive) comes BEFORE 07.300 (send)
=> the system believes the message was received before it was sent. WRONG.
```

Sort by timestamp and you conclude the message was received before it was sent. The numbers flatly contradict reality.

## Happens-before: ordering by cause, not by clock

Lamport's first move is bold: throw physical time away entirely. Define order purely in terms of what *could have influenced what*. He calls this the **happens-before** relation and writes it with an arrow. Read `a → b` as "a happens before b."

It rests on exactly three rules:

1. **Same process:** if `a` and `b` happen in the same process and `a` comes first locally, then `a → b`. (A process runs its own steps in a known sequence - that order is free.)
2. **Send before receive:** if `a` sends a message and `b` receives it, then `a → b`. (Reality guarantees a message can't be received before it's sent.)
3. **Transitivity:** if `a → b` and `b → c`, then `a → c`. (Causality chains together.)

That is the whole definition. Notice it never mentions seconds or clocks. It uses only local order and message send/receive - two things every process can actually observe.

When `a → b`, we say `a` **causally precedes** `b`: information *could have* flowed from `a` to `b`. It might not have actually influenced `b`, but it had the opportunity.

### Concurrent means "unrelated," not "simultaneous"

Now the crucial twist. What if *neither* `a → b` *nor* `b → a` holds? Then `a` and `b` are **concurrent**.

Concurrent does **not** mean "at the same instant." It means **causally unrelated** - no chain of local steps and messages connects them, so no information could have flowed either way. Two events seconds apart in real time can still be concurrent.

This is why happens-before is a **partial order**: some pairs are ordered, but concurrent pairs simply aren't ordered relative to each other at all. Real time is a *total* order - every pair is comparable. Causality is only partial, and that is an honest reflection of reality. Two unrelated things on two machines genuinely have no "true" order.

Think of a family group chat. If Mom posts and Dad replies, Mom's post happened-before Dad's reply - his reply was caused by reading hers. But if Mom and your sister both post without seeing each other's message, those posts are **concurrent**. Arguing over which was "really first" is meaningless. Happens-before captures only the orderings that real information flow actually created.

## Lamport clocks: counters that respect causality

Happens-before is a beautiful idea, but to *use* it each process needs a cheap, local way to stamp events so the stamps honor the arrows. That mechanism is the **Lamport logical clock** - and it is almost insultingly simple.

Every process keeps one integer counter `C`, starting at 0. Two rules update it (Lamport calls them IR1 and IR2):

- **IR1 - tick before every event.** Increment your counter by 1 before each event you perform. Every internal step and every send bumps it. `C := C + 1`.
- **IR2 - piggyback the timestamp on messages.** When you send, include your current counter value `t` in the message. When you receive, set `C := max(C, t) + 1` - take the larger of your clock and the message's stamp, then add one.

The `max` in IR2 is the entire trick. It forces the receiver's clock to leap past the sender's send-time, so a receive event always gets a strictly larger number than its send. Causality is preserved by construction.

### Walking through it

```
   P1            P2            P3
  C=0           C=0           C=0
 e1 [1]                       f1 [1]     IR1: local tick
                g1 [1]
 e2 [2] -------> g2 [3]                  send carries t=2; max(1,2)+1 = 3
                g3 [4] -------> f2 [5]   send carries t=4; max(1,4)+1 = 5
 e3 [3]                                  P1 keeps ticking on its own
```

Trace it slowly:

1. `P1` does `e1`: tick 0→1, so `C(e1)=1`.
2. `P1` sends at `e2`: tick 1→2, so `C(e2)=2`. The message carries `t=2`.
3. `P2` receives it as `g2`. Its clock was 1. Apply IR2: `max(1, 2) + 1 = 3`. So `C(g2)=3` - strictly bigger than the send's 2. Good: `e2 → g2` and `2 < 3`.
4. `P2` sends at `g3`: tick 3→4, message carries `t=4`.
5. `P3` receives at `f2`. Its clock was 1. IR2: `max(1, 4) + 1 = 5`. So `C(f2)=5` - bigger than 4. Good.

Notice `P3`'s clock leapt straight from 1 to 5, skipping 2, 3, and 4. That is fine and expected. Logical clocks don't measure time. They only guarantee the *order* of causally-related events comes out right. Uneven jumps and skipped numbers mean nothing.

## The Clock Condition - and the one-way street

Everything above is engineered to guarantee one property, the **Clock Condition**:

> If `a → b`, then `C(a) < C(b)`.

In words: if `a` happens-before `b`, then `a`'s timestamp is strictly smaller. The numbers never violate causality. This falls right out of the rules - IR1 makes timestamps climb within a process, IR2's `max + 1` makes a receive exceed its send, and transitivity chains it along any causal path.

But here is the single most important caveat in the whole topic, the part nearly everyone gets wrong.

The implication runs **one way only**. `C(a) < C(b)` does **not** prove `a → b`. Two concurrent events can have any timestamps at all - equal, or one smaller - purely by accident of how their local counters advanced.

Look back at the diagram. `e1` on `P1` has timestamp 1, and `f1` on `P3` also has timestamp 1, yet they are concurrent. And `g1[1]` has a smaller number than `e2[2]`, but they are concurrent too. The smaller number tells you nothing about cause.

- `a → b` ⟹ `C(a) < C(b)` ✓ guaranteed
- `C(a) < C(b)` ⟹ `a → b` ✗ **not** guaranteed

So Lamport timestamps let you **order causal events correctly**, but they **cannot detect concurrency**. From two timestamps alone you can't tell whether one truly happened-before the other or whether they're unrelated. Closing that gap is exactly why **[vector clocks](/blog/distributed-systems/15-vector-clocks-causality)** were later invented.

## Manufacturing a total order with process IDs

Happens-before is a partial order, but many real algorithms need a **total order** - a single global queue where *every* pair of events has a definite, agreed position, concurrent ones included. We don't need this order to be "true." We just need every process to agree on the *same* one.

Lamport's trick is tiny. Sort all events by their Lamport timestamp. When two events tie (which only happens for concurrent events - causal ones always differ), break the tie with a fixed, arbitrary ordering of the processes, like "lowest process ID wins."

```
  event   C   pid       order key = (timestamp, process id)
   x      3    P1
   y      3    P3        => final order:  x (3,P1) ⇒ y (3,P3) ⇒ z (4,P2)
   z      4    P2
```

The result is a total order that never contradicts a real `→` arrow - it just makes a deterministic choice for concurrent pairs. Every process, fed the same events, computes the identical order. That shared agreement is precisely what [coordination algorithms](/blog/distributed-systems/02-the-consensus-problem) need.

Think of timing race finishers with a stopwatch that shows only whole seconds. Several runners tie at "12 s." To still produce one ranked finishing list, you break ties by bib number. The bib number is arbitrary and says nothing about who was truly faster - but it gives one consistent, reproducible ranking everyone agrees on. The process ID is the bib number.

## Where this shows up in real systems

This is not museum-piece theory. Lamport's three ideas run underneath software you use every day.

**Distributed mutual exclusion** - the paper's headline example. *Mutual exclusion* means only one process at a time may hold a shared resource. Using only the total order, Lamport built a fully distributed lock with no central coordinator: each process broadcasts a timestamped `REQUEST`, everyone queues requests in the same total order, and a process enters its critical section only when its own request sits at the front and it has heard a later message from every peer. Because all processes order the queue the same way, they agree on whose turn is next - with no lock manager. This was the original proof that logical time alone can coordinate a distributed system.

**Databases.** Distributed stores like **Apache Cassandra** attach timestamp metadata to writes so replicas can deterministically resolve "which write wins" ([last-write-wins](/blog/distributed-systems/17-consistency-models)). The descendants of Lamport's idea - **vector clocks** - power **Amazon DynamoDB** and its ancestor **Riak** to *detect* when two writes were concurrent and must be reconciled rather than silently overwritten.

**Git.** Every commit records its parent commit IDs. "Parent → child" *is* a happens-before relation. A linear history is a causal chain; two branches edited independently are **concurrent** events - and `git merge` is literally reconciling two concurrent histories, with a two-parent merge commit as the join point. Git's commit graph is a partial order you can look at.

**Coordination services.** Systems like **etcd** and **ZooKeeper** expose a monotonically increasing revision number on every change - a logical clock in spirit - so clients can reason about ordering without trusting wall clocks.

## Common misconceptions

**"A later wall-clock timestamp means it happened later."** Not across machines. With 100–250 ms of skew even under NTP, a later event can carry an earlier timestamp, and an effect can be stamped before its cause.

**"`C(a) < C(b)` proves `a → b`."** No. The Clock Condition runs one way only. A smaller Lamport timestamp does not imply happens-before - the events may be concurrent.

**"Concurrent means at the same instant."** It means causally unrelated. Two events seconds apart in real time can still be concurrent if no chain of messages connects them.

**"Logical clock numbers measure elapsed time."** They don't. They jump unevenly and skip values. Only their relative order for causal events carries meaning.

**"You only update the clock on receive."** IR1 says *every* event ticks the counter, including internal and send events. Skipping those breaks the strict-increase guarantee.

**"The manufactured total order is the real order."** It isn't. Tie-breaking by process ID is arbitrary. Its only virtue is that every process computes the same one.

## How to use this

1. **Order by cause, not by clock.** Whenever correctness depends on the *order* of events across machines - replication, conflict resolution, distributed locking - use logical clocks, not wall-clock time.
2. **Always carry the sender's stamp and apply `max(local, received) + 1`.** The `max` is what preserves causality. Never just increment the receiver's clock and ignore the message's timestamp.
3. **Tick on every event.** Internal, send, *and* receive. Forgetting internal and send ticks quietly breaks the strict-increase property.
4. **Reach for vector clocks when you must detect concurrency.** If you need to know that two writes conflict and must be merged, plain Lamport clocks can't tell you - they order causality but can't spot concurrency.
5. **Break ties with a fixed rule** (like process ID) when you need one global order, so every node deterministically computes the identical sequence.
6. **Keep NTP running - but don't depend on it.** Use wall-clock time for human-readable logs and rough debugging. Never let business logic rely on cross-machine timestamps being accurate to the millisecond.

## Conclusion

Here is the one idea to keep: in a distributed system, **order comes from cause, not from clocks**. Lamport's happens-before relation defines what is causally ordered, logical clocks turn that into comparable numbers that obey the Clock Condition, and process-ID tie-breaking makes a usable total order everyone agrees on - all without a shared clock.

But you've also seen the crack in the foundation: Lamport timestamps can *order* causality yet can't *detect* concurrency. From two numbers alone, you cannot tell "happened before" from "unrelated." That single limitation is what gave rise to **vector clocks** - a clever upgrade that finally lets a system look at two events and say, with certainty, "these two are concurrent, and you must reconcile them." That is where the story goes next.
