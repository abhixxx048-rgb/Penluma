---
title: "Vector Clocks Explained: How Databases Detect Conflicts"
metaTitle: "Vector Clocks: Causality in Distributed Systems"
description: "Learn how vector clocks detect causality and concurrent writes in distributed systems, the trick behind Amazon Dynamo conflict detection and database siblings."
keywords:
  - vector clocks
  - causality in distributed systems
  - happened-before relation
  - concurrent writes detection
  - Lamport clocks vs vector clocks
  - Amazon Dynamo vector clocks
  - version vectors
  - distributed database conflict resolution
  - siblings Riak
  - dotted version vectors
  - logical clocks
  - eventual consistency conflicts
faq:
  - q: What is a vector clock in distributed systems?
    a: A vector clock is a list of counters, one per node, attached to each event. Your slot counts your own events; the other slots record what you have heard about everyone else. Comparing two vector clocks tells you whether one event caused the other or whether they happened concurrently.
  - q: What is the difference between a Lamport clock and a vector clock?
    a: A Lamport clock is a single number that can order events but cannot prove cause and effect. A vector clock uses one counter per node and satisfies the "strong clock condition," so it can tell you for certain whether two events are causally related or genuinely concurrent.
  - q: How do vector clocks detect concurrent writes?
    a: Compare the two clocks slot by slot. If neither clock is less-than-or-equal in every slot, each one leads somewhere, which means neither caused the other. That is concurrency, and in a database it signals a real conflict.
  - q: What are siblings in a database like Riak or Dynamo?
    a: Siblings are two versions of the same key whose vector clocks compare as concurrent. Because neither is newer, an always-available database keeps both and asks the application to merge them rather than silently overwriting one.
  - q: Why do vector clocks grow over time?
    a: A vector gains a slot for every node that writes the object, and that data travels with every message and stored version. Systems bound the size by pruning the oldest entries or by using dotted version vectors that cap the clock near the replication factor.
  - q: Do vector clocks order all events?
    a: No. They produce a partial order. Causally linked events are ordered, but concurrent events are deliberately left unordered because forcing an order would misrepresent what actually influenced what.
topic: distributed-systems
topicTitle: Distributed Systems
category: Engineering
date: '2026-06-21'
order: 4
icon: "\U0001F310"
author: Brexis Wazik
transformed: true
linked: true
sources:
  - https://en.wikipedia.org/wiki/Vector_clock
  - https://en.wikipedia.org/wiki/Dynamo_(storage_system)
---

Two people share a shopping cart. One adds milk on a phone, the other adds bread on a laptop, both at the exact same moment, on servers that haven't synced yet. When those servers finally talk, which write wins?

The honest answer is: neither. And a system that quietly picks one anyway just lost an item your customer meant to buy. Vector clocks are the small, clever tool that lets a distributed system recognize that moment for what it is: not a stale update to throw away, but a genuine fork in reality that needs care.

By the end of this article you'll be able to look at any two events in a distributed system and say one of exactly three things with certainty: this one came first, that one came first, or these two happened at the same time and nobody can break the tie.

## Why this matters

If you run anything across more than one machine, you eventually hit the same wall: there is no single clock everyone agrees on. Wall-clock time drifts. Network messages arrive out of order. Two replicas can each believe they hold the truth.

The most valuable question in a distributed database is exactly the hard one: **did these two writes happen one after another, or did they happen independently at the same time?** Get it right and you keep both meaningful updates. Get it wrong and you silently lose data, with no error and no log to explain it.

Vector clocks answer that question precisely. They're the machinery behind conflict detection in systems like Amazon's Dynamo and Riak, and the same idea quietly powers tools you already use, like Git. Understanding them changes how you think about [consistency](/blog/distributed-systems/17-consistency-models), replication, and what "newer" even means when there's no shared clock.

## First, a few plain words

Before we go further, here are the terms we'll lean on, in everyday language:

- **Node** (also called a process or replica): one independent computer in the system. It runs on its own and talks to others only by sending messages.
- **Event**: one thing that happens on a node, like doing local work, sending a message, or receiving one.
- **Causality**: a fancy word for cause and effect. Event `a` "causes" event `b` if information from `a` could have reached `b` and influenced it.
- **Happened-before** (written `a → b`): the formal name for "`a` could have influenced `b`." Two events with no such link in either direction are **concurrent**, meaning independent.

Hold onto that last word. **Concurrency is the whole point.**

## Why a single number isn't enough

In an earlier section you met [**Lamport clocks**](/blog/distributed-systems/14-time-clocks-the-ordering-of-events): simple counters that hand every event a number, written `C(e)`, so you can line events up in some order. They have one guarantee:

> If `a → b` (a happened before b), then `C(a) < C(b)`.

Read that carefully. The guarantee runs in only **one** direction. Causality forces the numbers to climb. But it does not promise the reverse.

So if someone hands you two numbers and you see `C(a) < C(b)`, you **cannot** conclude that `a` caused `b`. Two totally unrelated events on two different machines can easily land at `C(a) = 3` and `C(b) = 7` even though neither knew the other existed. The smaller number might be pure coincidence.

In plain terms: `a → b` *implies* `C(a) < C(b)`, but `C(a) < C(b)` does *not* imply `a → b`. The arrow only points one way.

### An analogy: the shuffled book

Imagine a giant printed book where many authors wrote on separate typewriters, then someone shuffled all the pages and stapled them into one pile.

If page 12 *quotes* page 5, you know page 5 came first. Quoting proves a real link. But if page 5 and page 30 simply sit in that order in the pile, that tells you nothing. Page 30 might have been typed years earlier by an author who never read page 5.

The page numbers order the pile. They do not prove who influenced whom. That's a Lamport clock: it sorts events into a line, but it can't tell a real influence from an accident of ordering.

**The takeaway:** a Lamport clock can *order* events but cannot *detect concurrency*. To answer the shopping-cart question, we need a clock that captures causality in **both** directions.

## What a vector clock actually is

Here's the upgrade. Instead of one number per event, a **vector clock** is a whole *list* of numbers, with one slot for every node in the system.

If there are three nodes, call them A, B, and C, then every vector clock has three slots, like `[2, 5, 1]` once we agree on a fixed order.

Each node owns exactly one slot, its own:

- The number in A's own slot counts **how many events have happened on A so far**.
- The numbers in the other slots are A's best knowledge of **how many events have happened on B and C, as far as A has heard**.

So a vector clock is really a little summary that says: *"Here is everything I've personally done, plus everything I've heard about that everyone else has done."*

And here's the magic property. Vector clocks satisfy what's called the **strong clock condition**: `a → b` is true **if and only if** `VC(a) < VC(b)`. That "if and only if" runs both ways, which is exactly what Lamport clocks could never do. (This was worked out independently in 1988 by Colin Fidge and Friedemann Mattern.)

## The three rules that run everything

A vector clock changes by exactly three simple rules. Say node `i` holds a vector `V`, and `V[i]` is its own slot:

1. **On a local event** (the node does internal work): bump your own slot by one. `V[i] = V[i] + 1`. Nothing else changes.
2. **On sending a message**: first bump your own slot, then attach a copy of your *entire* vector to the outgoing message. The receiver will need it.
3. **On receiving a message** carrying a vector `M`: first bump your own slot, then for every slot `k`, set `V[k] = max(V[k], M[k])`. Take the bigger of your number and the sender's, slot by slot.

That last step, the **element-wise maximum**, is where the cleverness lives. It means "merge in everything the sender knew that I didn't." If the sender had heard about 5 events on node C and you'd only heard about 2, after the merge you know about 5. You've absorbed their knowledge.

### An analogy: the gossip ledger

Picture three friends keeping a shared gossip ledger. Each friend's ledger has a row per friend: "stories I've personally lived" plus "stories I've heard each other friend has lived."

When you do something noteworthy, you bump your own row. When you phone a friend, you read them your whole ledger. They bump their own row, then update each row to the higher of the two counts, so nobody ever *loses* a story they'd already heard.

The ledger isn't a wall clock. It's a record of **who knows about what.**

## Watching it work: three nodes, step by step

Let's run three nodes, A, B, and C, all starting at `[0, 0, 0]`. Slots are in the order `[A, B, C]`.

1. **a1 on A** (local event): A's slot goes 0 to 1. A = `[1,0,0]`.
2. **c1 on C** (local event): C = `[0,0,1]`. A and C have never talked, so they know nothing of each other.
3. **b1 on B** (local event): B = `[0,1,0]`.
4. **a2 on A, then A sends message m1**: this is a send, so A bumps its own slot to 2. A = `[2,0,0]`. The message carries the stamp `[2,0,0]`.
5. **B receives m1**: B first bumps its own slot (1 to 2), giving `[0,2,0]`, then takes the element-wise max with `[2,0,0]`. Result: B = `[2,2,0]`. B now knows A has done 2 events.
6. **b2 on B, then B sends m2**: bump B's own slot. B = `[2,3,0]`. The message carries `[2,3,0]`.
7. **C receives m2**: C bumps its own slot (1 to 2), giving `[0,0,2]`, then maxes with `[2,3,0]`. Result: C = `[2,3,2]`.

Look at C's final vector, `[2,3,2]`. It "contains" both A's work and B's work, because information flowed `A → B → C`. The happened-before chain is recorded right there inside the numbers. C didn't have to ask anyone; the history travelled with the messages.

## The payoff: three possible answers

This is what it was all for. Given two vector clocks `U` and `V`, compare them **slot by slot**. There are exactly three outcomes.

| Result | The test (check every slot) | What it means |
| --- | --- | --- |
| **Equal** (`U = V`) | Every slot matches. | The same point in time. |
| **Happened-before** (`U < V`) | Every slot of `U` is `≤` the matching slot of `V`, **and at least one is strictly smaller**. | `U` came first: `U → V`. `V` is a descendant of `U`. |
| **Concurrent** (`U ∥ V`) | Neither direction passes the test: each clock leads in some slot. | Independent. Neither caused the other. **Potential conflict.** |

The one rule to memorize: **less-than-or-equal in every slot, and strictly less in at least one, means happened-before.** If you can't say that about either direction, the events are concurrent.

Three quick comparisons:

- `[1,0,0]` vs `[2,2,0]`: every slot of the first is `≤` the second, and at least one is strictly smaller. **First happened before second.**
- `[2,0,0]` vs `[0,1,0]`: the first leads in slot A, the second leads in slot B. Each beats the other somewhere. **Concurrent.** (These are exactly events a2 and b1 from above, before A and B ever talked.)
- `[2,3,0]` vs `[2,3,2]`: `2≤2`, `3≤3`, `0≤2`, one strictly smaller. **First happened before second.**

## Common misconceptions

A few traps catch nearly everyone learning this. Worth knowing them before they bite you in production.

- **Myth: a smaller Lamport number proves causation.** Reality: `C(a) < C(b)` never proves `a` caused `b`. The implication only runs the other way. Only a vector clock gives you the "if and only if."
- **Myth: you can compare vector clocks by adding up the slots.** Reality: summing throws away the per-node detail that detects concurrency. `[2,0,0]` (sum 2) and `[0,1,0]` (sum 1) have different totals but are actually *concurrent*. Always compare slot by slot.
- **Myth: on a receive, you just take the max.** Reality: you increment your own slot *first*, then take the max. A receive is itself a new local event and has to be counted.
- **Myth: concurrent versions are an error to auto-overwrite with "last write wins."** Reality: that silently discards a real, intentional update, like an item vanishing from a cart. Concurrency means *reconcile*, not *discard*.
- **Myth: vector clocks order every event into one line.** Reality: they produce a *partial* order. Concurrent events are deliberately left unordered, because forcing an order would be a lie about causality.

## From theory to a real database: siblings

Now connect this to a real key-value store, the kind that keeps copies of your data on several nodes so the system stays up even when one machine dies. Each stored *version* carries a vector clock. When a node receives a write, it compares the incoming clock to the version it already holds:

- **New clock is greater than the old one:** a clean causal update. Overwrite. No conflict.
- **New clock is less than the old one:** the write is stale, an old update arriving late. Keep what you have.
- **The two clocks are concurrent:** two clients updated the same key independently on replicas that hadn't synced. Neither is "newer." The database **keeps both versions.**

Those coexisting concurrent versions have a name: **siblings.**

The database can't decide which sibling is right, because that's a business question. Which shopping cart? Which profile? So it hands all the siblings back to the application at the next read and asks it to merge them. This is **semantic reconciliation**: the app applies a domain rule (for example, "union the two carts so no item is lost") and writes back one reconciled value whose new vector clock *descends from both* siblings, healing the branch.

### Amazon Dynamo's shopping cart

This is precisely what Amazon described in their landmark 2007 **Dynamo** paper. Dynamo chose *availability* over [strong consistency](/blog/distributed-systems/16-the-cap-theorem-and-pacelc), because the cart must *always* accept an "add to cart," even during network trouble. That means two replicas can take writes independently and disagree, so Dynamo uses vector clocks (it calls them **version vectors**, stored as a list of `(node, counter)` pairs) to tell genuine updates apart from real conflicts.

Here's the classic example. Servers Sx, Sy, and Sz handle writes to one cart object:

1. A write hits Sx. Version D1 = `[(Sx,1)]`.
2. Another write hits Sx. Version D2 = `[(Sx,2)]`, which cleanly descends from D1.
3. Now the network splits. One write lands on Sy: D3 = `[(Sx,2),(Sy,1)]`. Another lands on Sz: D4 = `[(Sx,2),(Sz,1)]`. The two replicas can't see each other.
4. A client read later sees **both** D3 and D4.

Compare D3 and D4 slot by slot. For the Sy slot, D3 has 1 and D4 has 0 (a missing entry counts as 0), so D3 leads. For the Sz slot, D4 has 1 and D3 has 0, so D4 leads. Each beats the other somewhere, so neither happened before the other. They are **concurrent**: a real conflict. Dynamo returns both as siblings.

The client merges the carts and writes back via Sx: D5 = `[(Sx,3),(Sy,1),(Sz,1)]`. That clock is `≥` both D3 and D4 in every slot, so D5 unambiguously supersedes both. The branch is healed and nothing was lost.

**Riak**, the open-source database inspired by Dynamo, uses the same idea and exposes siblings when its `allow_mult` setting is on. Riak later improved on plain vector clocks with **dotted version vectors (DVV)**, a refinement that stops naive client-id vectors from growing without bound and producing "false siblings." With DVV the clock size stabilizes around the replication factor instead of ballooning with the number of clients.

## Causality cousins you already use

You track causality every day without thinking about it: in **Git**.

Git doesn't use vector clocks, but it captures the same happened-before idea with a **DAG** (a Directed Acyclic Graph, meaning nodes connected by one-way arrows with no loops). Each commit points back to its parent. "Commit X is an ancestor of commit Y" is Git's version of "X happened before Y."

When two people branch from the same commit and both commit independently, neither is an ancestor of the other. Those commits are *concurrent*, which is exactly why Git asks you to **merge** (and sometimes flags a conflict). A merge commit with two parents is Git's reconciliation, a new node descending from both branches, just like Dynamo's D5.

A vector clock and a Git history are two ways of telling the same story. The vector clock is the *summary* ("I've seen 2 of Sx's edits and 1 of Sy's"). The Git DAG is the *full family tree* drawn out with arrows. Both let you ask the same question: is this version an ancestor, a descendant, or a cousin? A cousin (a fork, two siblings, a concurrent pair) is the one that needs a human or a merge rule.

A more modern relative is the **CRDT** (Conflict-free Replicated Data Type), a data structure designed so that concurrent updates *always* merge automatically, with no human reconciliation needed. Where a vector clock *detects* a conflict and hands it to your app, a CRDT bakes a safe merge rule into the data type itself. A "grow-only set," for instance, merges by union, so concurrent additions can never conflict, no matter what order they arrive in. CRDTs often still use vector-clock-style version info internally; they just add a mathematically guaranteed merge on top.

## The catch: clocks grow with the cluster

Vector clocks aren't free. The vector gains a slot for **every node that has ever written the object**, and it travels with every message and every stored version: more bytes on the wire and on disk.

It gets worse if you assign a slot per *client* rather than per *server*. With millions of clients, the vector can grow without limit, and the Dynamo paper specifically warns that writes during failures and partitions make it swell.

The fix is **pruning**: once the vector exceeds a threshold, drop the oldest `(node, counter)` pairs. Dynamo attaches a timestamp to each pair and discards the least recently updated entries when the count crosses a limit. Pruning trades a tiny, rare risk of an *inaccurate* causality judgment (you might miss that two versions were actually related, producing an unnecessary sibling) for a bounded clock size. In practice it's a sound trade, because the discarded entries are old and almost never relevant.

## How to use this

If you're building or operating a replicated system, here's the practical playbook:

1. **Give each stable server replica one slot, not each client.** This bounds the vector by your cluster size instead of your traffic, and avoids the "false sibling" explosion.
2. **Always cap the vector with a pruning threshold**, and store a last-updated timestamp per entry so you can drop the oldest entries safely during failures and partitions.
3. **Decide your merge rule per data type, up front.** Union for carts, max for counters, latest-by-field for profiles. Never lean on a blind last-write-wins for data that matters.
4. **Model data as a CRDT where you can**, so concurrent updates merge automatically and your application never sees siblings. Reserve manual reconciliation for data that genuinely needs human judgment.
5. **When debugging "which write should have won?", log the full vector clock of every version.** The slot-by-slot comparison tells you instantly whether you had a clean causal update or a true concurrent conflict.
6. **For client-facing writes that can race, prefer dotted version vectors (DVV)** over naive client-id vector clocks, to dodge unbounded growth and false siblings.

## Conclusion

Here's the one idea worth keeping: **"newer" is not a fact you can read off a clock; it's a relationship you have to prove.** A vector clock proves it by recording who knew about what, so the system can tell a clean update from a genuine fork, and never silently throw away an update someone meant to keep.

That single shift, from ordering time to tracking causality, quietly underpins always-available databases, Git merges, and CRDTs alike.

But notice what we've been assuming the whole time: that nodes are honest, that a message saying `[2,3,0]` really did come from a node that did those things. What happens when a node can lie, or when a few machines flat-out disagree about reality on purpose? That's where [consensus](/blog/distributed-systems/02-the-consensus-problem) and Byzantine fault tolerance come in, and it's a very different kind of hard.
