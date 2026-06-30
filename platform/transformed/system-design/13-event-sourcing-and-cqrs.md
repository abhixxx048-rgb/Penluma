---
title: "Event Sourcing & CQRS: Store What Happened, Not Just the Result"
metaTitle: "Event Sourcing & CQRS Explained Simply"
description: "Event sourcing stores every change as an immutable fact, and CQRS splits reads from writes. Learn how both work, when they pay off, and when they're overkill."
topic: system-design
topicTitle: System Design
category: Engineering
date: '2026-06-15'
order: 13
icon: "\U0001F3D7️"
keywords:
  - event sourcing
  - CQRS
  - event sourcing vs CRUD
  - what is CQRS
  - event store
  - read model projection
  - eventual consistency
  - aggregate design
  - event sourcing example
  - when to use event sourcing
  - outbox pattern
  - event versioning
  - audit log architecture
  - domain driven design aggregate
keywords_count: 14
faq:
  - q: "What is event sourcing in simple terms?"
    a: "Instead of saving only the current state of something, you save every change that ever happened as an immutable record. The current state is calculated by replaying those changes in order, like deriving your bank balance from a list of transactions."
  - q: "What is the difference between CQRS and event sourcing?"
    a: "CQRS just means using separate models for writing and reading data. Event sourcing means storing events as the source of truth. They are independent: you can do CQRS with a normal database, but event sourcing almost always pushes you toward CQRS."
  - q: "When should you use event sourcing?"
    a: "Use it when an accurate history is part of the product itself, such as finance, healthcare, or order lifecycles, and when you genuinely need to answer 'why is this value what it is?' Avoid it for simple CRUD apps like blogs, settings pages, or content management."
  - q: "What is the main downside of event sourcing?"
    a: "It carries a large permanent tax: eventual consistency leaks into the UI, old event formats must be supported forever, debugging means replaying streams, and deleting data conflicts with an append-only log. Most apps should not adopt it everywhere."
  - q: "What is a read model or projection?"
    a: "A read model is a query-optimized table built by consuming the event log. It is derived, disposable data: if it gets corrupted or you need a new shape, you delete it and rebuild it by replaying events from the beginning."
  - q: "Can you do CQRS without event sourcing?"
    a: "Yes, and it is the common case. You keep a normal CRUD database for writes, emit change events through the outbox pattern or change data capture, and build separate read models from those events. No event store required."
author: Brexis Wazik
transformed: true
polished: true
linked: true
sources:
  - https://en.wikipedia.org/wiki/Event-driven_architecture
  - https://martinfowler.com/eaaDev/EventSourcing.html
---

Your bank doesn't store your balance. It stores every transaction, and the balance is just arithmetic on top of that list.

That one design choice, applied to software, is **event sourcing**: keep the history of everything that happened, and calculate the current state from it. Pair it with **CQRS** (splitting how you write data from how you read it) and you get a powerful pattern that also carries one of the heaviest operational taxes in software.

This article walks you through both ideas in plain language, with real examples, and gives you an honest answer to the question that actually matters: when is this worth it?

## Why this matters

Most apps overwrite data. You withdraw $20, and the database runs `UPDATE balance = balance - 20`. The old number is gone forever. The current value tells you *what* the balance is, but never *why* it got there or *when* it changed.

For a blog or a settings page, that's perfectly fine. But for money, medical records, legal documents, or anything an auditor will one day examine, "the old value is gone forever" is a disaster. You can't answer "why is this number what it is?" if you threw away every step that produced it.

Event sourcing flips the default. And once you understand the flip, a lot of confusing architecture decisions, like why teams run separate databases for reading and writing, suddenly make sense.

## The core idea: store the change, not the result

Think of your bank statement versus your account balance.

A normal app stores the balance: one row, one number, overwritten on every change. A bank stores the **ledger**, an append-only list of facts:

```
+5000  salary          2026-01-01
 -200  rent            2026-01-03
  -20  atm withdrawal   2026-01-05
```

The balance `4780` is **derived** by adding up the ledger. The ledger is the truth. The balance is just a cached summary of it.

You never edit a past transaction. To fix a mistake, you append a *correcting* entry (a reversal). That's the whole philosophy:

> CRUD stores the state and throws away the transitions. Event sourcing stores the transitions and derives the state. Everything else follows from that single decision.

### What counts as an "event"

An **event** is an immutable, past-tense fact: `MoneyWithdrawn`, `OrderShipped`, `ProductPriceChanged`. It already happened. It cannot fail, be rejected, or be undone.

That's different from a **command** like `WithdrawMoney`, which is an *intent* that might be refused (insufficient funds, frozen account). Commands can be rejected. Events never can, because they're history.

### The event store

The **event store** is an append-only database of events, grouped into **streams**, usually one stream per thing (one stream per bank account, for example):

```
Stream: account-7f3a
 #  | event type      | payload                | version
----+-----------------+------------------------+--------
 1  | AccountOpened   | {owner: "Jo"}          |   1
 2  | MoneyDeposited  | {amount: 5000}         |   2
 3  | MoneyWithdrawn  | {amount: 200}          |   3
 4  | MoneyWithdrawn  | {amount: 20}           |   4
                                        ^ append-only, never UPDATE or DELETE
```

To get the current state, you read the stream and **fold** the events through a simple function, starting from an empty state and applying each event in turn:

```
apply(state, AccountOpened)  => balance: 0
apply(state, MoneyDeposited) => balance + amount
apply(state, MoneyWithdrawn) => balance - amount
```

That's it. Replay the four events and you get the current balance. This replay function must *never* reject an event or run validation, because the event already happened. Validation lives earlier, when a command is being decided.

### Two practical problems, two practical fixes

**Replaying millions of events is slow.** A decade-old loan account might have 500,000 events. Reading all of them to decide one withdrawal is wasteful. The fix is a **snapshot**: a saved copy of the folded state at a known version, written periodically (say every 100 events). You load the latest snapshot and replay only the handful of events after it.

The critical rule: a snapshot is a *cache*, never the truth. You must be able to delete every snapshot and rebuild from events alone. The moment a snapshot becomes load-bearing, you've quietly reinvented CRUD with extra steps.

**Two people change the same thing at once.** Two requests both load account version 4, both decide a withdrawal is valid, both try to write version 5. The store enforces **optimistic concurrency**: "append only if the current version is still 4." The second write fails, reloads fresh state, and retries. No locks, and the account's rules stay intact. It's a compare-and-swap on the end of the stream.

You don't need exotic infrastructure for any of this. [Postgres works beautifully](/blog/system-design/04-databases-internals): an `events` table with a unique constraint on `(stream_id, version)` gives you optimistic concurrency for free. DynamoDB, Kafka, and purpose-built stores like EventStoreDB are all options too.

## CQRS: why reading and writing pull apart

Now try to answer this from an event store: "show me all accounts with a balance over $10,000, sorted by balance." You'd have to replay *every* stream. That's hopeless at scale.

A stream of events is great for rebuilding one thing accurately and terrible for querying across many things. So you build **read models** (also called **projections**): denormalized, query-friendly tables built by consuming the event log.

This split has a name: **CQRS, Command Query Responsibility Segregation.** Separate the model you write through from the model(s) you read from.

```
   WRITE SIDE                      READ SIDE
  command                         query
     |                              |
     v                              v
 Command handler  --append-->  Event store  --stream-->  Read model A (SQL balances)
 (enforces rules)               (the truth)              Read model B (search index)
                                                         Read model C (dashboard cache)
```

Three consequences fall out of this:

- **One write model, many read models.** The same events feed a SQL table, a search index, a dashboard cache, and an analytics warehouse, each shaped for *its* query. You stop forcing one schema to serve five conflicting access patterns.
- **The two sides connect asynchronously.** A projection lags the write by the time it takes to process the event, usually milliseconds. This lag is the single biggest source of bugs and surprises (more below).
- **Read models are disposable.** They're derived data. If one is corrupt or you need a new shape, you delete it and rebuild from the event log.

### The most common mix-up

CQRS and event sourcing are *not* the same thing, and conflating them is the classic mistake.

You can do CQRS with a plain CRUD database that emits change events (via the [outbox pattern or change data capture](/blog/system-design/11-distributed-transactions-and-idempotency)) into separate read models. No event store required. That's the pragmatic version most teams actually want.

| Pattern | Write store | Read store | Complexity | What you get |
|---|---|---|---|---|
| Plain CRUD | Mutable rows | Same rows | Lowest | Simplicity |
| CQRS only | Mutable rows | Separate projections | Medium | Read scaling, multiple read shapes |
| Event sourcing only | Event log | Replay aggregate | High | Audit, time-travel |
| ES + CQRS | Event log | Many projections | Highest | All of the above |

## When it helps, and when it's overkill

Here's the honest part most tutorials skip: **most apps should not do event sourcing.** It's a specialist tool with a large, permanent tax.

**Reach for event sourcing when:**

- An audit trail is a *hard* requirement (finance, healthcare, legal) and "why is this number what it is?" must always be answerable.
- The business genuinely *thinks in events*: ledgers, order lifecycles, insurance claims, inventory movements.
- You need temporal queries: "what was the state on date X?", replays, what-if analysis.
- You need several read shapes from one write (search plus dashboard plus reporting).

**Avoid it when:**

- A simple audit-log table would satisfy compliance.
- The domain is plain CRUD: a blog, a settings page, a content management system.
- You only ever need the current state.
- One read shape is enough.

The honest cost list, learned the hard way:

- [Eventual consistency](/blog/system-design/09-cap-pacelc-consistency-models) leaks into the UI ("I saved it, why don't I see it?").
- Event formats are forever. You can never delete an old event shape; 2029 code must still read events written in 2019.
- Debugging means replaying streams, not reading a row.
- Deleting data fights an append-only log (a real headache for "right to be forgotten" requests).
- Every new engineer must learn the pattern before touching anything.

The rule of thumb that saves teams: **event-source only the one or two parts where history is genuinely the product** (the ledger, the order), and leave everything else as boring CRUD. This is a per-component decision, not an app-wide religion.

## Aggregates: where consistency lines get drawn

This is the part interviews probe and incidents expose.

An **aggregate** is a cluster of data treated as one unit for changes, with a single entry point. In event sourcing, an aggregate usually maps to one stream. And here's why it matters:

> An aggregate is your transactional consistency boundary. Everything inside it is consistent *immediately*. Everything *between* aggregates is consistent only *eventually*.

So designing aggregates *is* drawing your strong-versus-eventual consistency lines.

**A worked example.** The rule "an account may not be overdrawn" lives *inside* one account. So the account is the aggregate, and the rule is enforced immediately when its command is handled. Good.

Now: "transfer $100 from account A to account B." That rule ("don't lose money") spans *two* aggregates. You **cannot** do it in one transaction. Instead you use a **saga** (a process manager): `MoneyWithdrawn(A)` triggers `DepositMoney(B)`, which emits `MoneyDeposited(B)`. If B's deposit fails, you emit a compensating `MoneyRefunded(A)`.

Practical heuristics: keep aggregates *small* to allow concurrency, reference other aggregates by ID rather than embedding them, and let one command change exactly one aggregate. If you find yourself wanting a transaction across two aggregates, either your boundaries are wrong or you actually need a saga.

## The lag problem: "I saved it, why don't I see it?"

A user submits a change, the API returns success, they jump to the list view, and their change isn't there. The read model hasn't caught up yet.

This is the structural cost of CQRS. It's not a bug to be fixed once; it's a property to be managed. Mitigations, from weakest to strongest:

1. **Return the new state from the write side.** The command handler already knows the post-change state, so hand it back and let the UI update optimistically.
2. **Use version tokens.** The write returns a position number; the read side can wait until the projection has processed up to that number before serving the response.
3. **Read the just-changed item from the write model**, and use projections for everything else. You can always rebuild one aggregate by replay.
4. **Be honest in the UI.** "Saving..." then "Saved" beats a confident lie.

A healthy projection lags by single-digit to low-tens of milliseconds. Under load (a deploy, a hot partition, a slow downstream) it can fall seconds or minutes behind. **Always monitor projection lag and alarm on it.** A projection that silently falls six hours behind is a classic 3 a.m. page.

## Two costs you must plan for upfront

### Rebuilding read models

Because projections are derived, you *will* rebuild them: a bug shipped bad data, you need a new shape, or you're migrating stores. Rebuilding means dropping the projection and replaying the entire event log from the beginning.

This raises a dangerous trap: **replays must be free of side effects.** If your projection sends an email when it sees `OrderShipped`, then a rebuild re-sends thousands of "your order shipped!" emails to customers from 2021. This is a real, recurring outage class. Projections must be pure data transforms. Side effects belong in tracked reactors that remember what they already handled.

You also need **idempotency**: replays and at-least-once delivery mean a projection may see the same event twice. Build read models with upserts keyed by event identity, never blind `INSERT` or `balance += amount`.

### Event versioning

Events are immutable *and* immortal. The `OrderPlaced` event from 2019 will still be in the store in 2029, and your future code must still read it. You can't run a migration to "fix old events" without rewriting history, which defeats the entire purpose.

So you need a deliberate plan for schema change:

- **Add fields, never remove or rename them.** Additive-only changes are safe; make this a religion.
- **Upcasting** is the workhorse. An upcaster is a pure function that transforms an old event shape into the newest shape *as it's read*, before the replay logic ever sees it. Chain them (`v1 → v2 → v3`) so your core code only ever knows the latest version.
- For changes too big to upcast cleanly, **stop emitting the old event and introduce a new type** with an upcaster bridging them.

Stamp an explicit `event_version` into every event from day one. Retrofitting it later is misery.

## Common misconceptions

- **"Event sourcing and CQRS are the same thing."** No. CQRS is about separating read and write models. Event sourcing is about storing events as truth. You can use either without the other.
- **"Events are just a fancy change log of rows."** If your events look like `AccountUpdated {entireStateBlob}`, you've kept every cost and thrown away the value. Model real domain facts like `AddressCorrected`, which capture *intent*, not snapshots.
- **"Snapshots are the data."** Snapshots are a cache. If someone "optimizes" by keeping only snapshots and pruning events, you can no longer rebuild, version, or audit. You've quietly rebuilt CRUD.
- **"Bigger aggregates make things more consistent."** A `Company` aggregate holding 10,000 orders means every order change fights over one stream. You get constant conflicts and a bottleneck. Smaller aggregates plus sagas, every time.
- **"We should event-source the whole app."** Event-sourcing the settings page or the product catalog buys nothing and taxes everyone who touches it.

## How to use this

If you're considering event sourcing, work through these steps:

1. **Find the one or two components where history is the product.** A ledger, an order lifecycle, a claims process. If you can't name one, you probably don't need event sourcing.
2. **Keep everything else as plain CRUD.** Scope is the difference between a powerful tool and a permanent burden.
3. **Start with Postgres.** A unique constraint on `(stream_id, version)` gives you an event store and optimistic concurrency without new infrastructure.
4. **Design small aggregates around invariants.** Ask "what rule must be true the instant this changes?" That rule defines the boundary. Anything crossing two aggregates becomes a saga.
5. **Stamp `event_version` and a metadata envelope** (correlation ID, causation ID, timestamp, actor) into every event from the first commit.
6. **Keep projections pure.** No emails, no payments, no external calls. Side effects go in tracked reactors only.
7. **Make projections idempotent.** Upsert by event ID so replays and duplicate deliveries don't corrupt data.
8. **Monitor projection lag and alarm on it** before you ship, not after the first incident.
9. **Plan for deletion early.** For "right to be forgotten," the accepted answer is **crypto-shredding**: encrypt personal data in events with a per-person key, and "delete" by destroying the key, leaving the log intact but the data unreadable.

## A real system: the event-sourced ledger

TigerBeetle is a database built specifically for moving money, and it takes event sourcing to its logical end. Its only mutating operation is *append a transfer*. A transfer is an immutable, past-tense fact. Account balances are never stored as editable rows; they're a **projection** folded from the transfers that touched them, exactly the bank-statement-versus-balance inversion, in production.

A few of this article's ideas show up directly:

- **The event store is the outbox.** Because the ledger *is* the log, there's no separate "publish the event" step to lose. Replicas and read models are just subscribers reading the same ordered log.
- **The log doubles as the audit trail for free.** Every balance is provably reconstructable from first principles, which is exactly what regulators demand.
- **A strict total order became a feature, not a bottleneck.** By batching thousands of transfers per message and sequencing them all into one log, TigerBeetle made double-spends structurally impossible while reportedly hitting around a million transfers per second, far past the few-thousand ceiling of a "ledger on Postgres with row locks" design.

The trade-off they accepted is instructive: TigerBeetle gives up generality. It's not a SQL database, has no ad-hoc queries, and offers essentially one read shape (balances). For a ledger, that's the right call, because a ledger only ever asks ledger questions. The lesson: specialize ruthlessly when history *is* the product, and don't build five projections when one is the whole job.

## Conclusion

The one idea worth carrying away: **when you store what happened instead of just the result, your data stops being a snapshot and becomes a story you can replay, audit, and reshape at will.** That power is real, and so is its price, which is why the discipline lives in scoping it to the few places where history truly is the product.

There's a deeper rabbit hole waiting. Notice that "the log is the source of truth, and everything else is a derived view" isn't just an application pattern, it's how databases themselves work under the hood, and how [Kafka reframes an entire data platform](/blog/system-design/12-messaging-and-event-driven). Martin Kleppmann calls it "turning the database inside out." Once you see logs as truth, you start seeing them everywhere, including in the most familiar tool on your machine: Git is an event-sourced filesystem, where commits are immutable events and your working tree is just a projection.
