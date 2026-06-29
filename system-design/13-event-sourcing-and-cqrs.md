# 13 - Event Sourcing & CQRS

**What you'll learn:** How to model state as an immutable log of *facts that happened* instead of a mutable row you overwrite, why splitting your write model from your read model (CQRS) is a natural consequence, and - most importantly - the brutal operational costs these patterns impose so you can tell when they pay for themselves and when they're résumé-driven over-engineering.

**Prerequisites:** Read `06-replication-and-consistency.md` (eventual consistency, log shipping), `09-cap-pacelc-and-consistency-models.md` (consistency models), and `12-message-queues-and-the-outbox-pattern.md` (the outbox pattern, exactly-once delivery) first. Event sourcing leans hard on all three.

---

## 1. Intuition: your bank statement vs your account balance

A normal CRUD app stores the *current* balance: a row `accounts(id, balance)`. When you withdraw $20, the app does `UPDATE accounts SET balance = balance - 20`. The old value is gone forever. The number "180" tells you *what* but never *why* or *when*.

A bank doesn't actually work that way. The source of truth is the **ledger** - an append-only list of transactions:

```
+5000  salary        2026-01-01
 -200  rent          2026-01-03
  -20  atm withdrawal 2026-01-05
```

The balance `4780` is **derived** by folding (summing) the ledger. The ledger is the truth; the balance is a *cached projection* of it. You can never "edit" a past transaction - to fix a mistake you append a *correcting* transaction (a reversal). This is **event sourcing**: store the events (the facts), derive the state.

> **The defining inversion:** CRUD stores state and throws away the transitions. Event sourcing stores the transitions and derives the state. Everything else follows from that one decision.

---

## 2. The event store

An **event** is an immutable, past-tense fact: `MoneyWithdrawn`, `OrderShipped`, `ProductPriceChanged`. Not a command (`WithdrawMoney` - an *intent* that may be rejected), not a row mutation. Events have already happened; they cannot fail or be rejected.

The **event store** is an append-only database of events, partitioned into **streams** - usually one stream per aggregate instance (e.g. one stream per bank account, `account-7f3a...`).

```
Stream: account-7f3a              (one stream per aggregate)
+----+------------------+------------------------+---------+
| #  | event type       | payload                | version |
+----+------------------+------------------------+---------+
| 1  | AccountOpened    | {owner: "Jo", ccy:USD} |   1     |
| 2  | MoneyDeposited   | {amount: 5000}         |   2     |
| 3  | MoneyWithdrawn   | {amount: 200}          |   3     |
| 4  | MoneyWithdrawn   | {amount: 20}           |   4     |
+----+------------------+------------------------+---------+
                                          ^ append-only, never UPDATE/DELETE
```

**Core operations** (this is the *entire* write-side API):
- `append(streamId, events, expectedVersion)` - append with optimistic concurrency.
- `readStream(streamId)` - read all events for one aggregate, in order, to rebuild it.
- `readAll(fromPosition)` - read the global ordered log to build projections.

**Optimistic concurrency is non-negotiable.** Two requests both load account version 4, both decide a withdrawal is valid, both try to append version 5. The store enforces "append only if current version == expectedVersion (4)"; the second `append` fails with a concurrency conflict and the command is retried against fresh state. This is how you preserve the aggregate's invariants without locking. It's a compare-and-swap on the stream tail.

**Real implementations:** [EventStoreDB / Kurrent](https://www.kurrent.io/) is purpose-built for this. Most teams instead use **Postgres** (`events` table, `(stream_id, version)` unique constraint = optimistic concurrency for free), **DynamoDB** (conditional writes on a sort key), or **Kafka** (one topic-partition per aggregate type, log-compacted - but Kafka makes single-aggregate reads and concurrency checks awkward, so it's better as the *projection transport* than the system of record). Marten (Postgres + .NET) and Axon (JVM) are popular frameworks.

### Rebuilding state (the "fold")

To get the current state of an aggregate, you read its stream and replay events through a pure function:

```
state = events.reduce(apply, emptyState)

// apply is a pure (state, event) -> state function:
apply(s, AccountOpened e)  => { ...s, balance: 0, owner: e.owner }
apply(s, MoneyDeposited e) => { ...s, balance: s.balance + e.amount }
apply(s, MoneyWithdrawn e) => { ...s, balance: s.balance - e.amount }
```

This is a left fold - functional programmers will recognize `foldl`. The `apply` functions **must never reject** an event or run validation; the event already happened. Validation lives in the *command handler* (see §5), not in `apply`.

### Snapshots: the replay-cost problem

Replaying 4 events is free. Replaying an aggregate with **500,000 events** (a hot account, a long-lived shopping cart, a 10-year-old loan) on every command is not - you'd read half a million rows to decide one withdrawal.

A **snapshot** is a serialized copy of the folded state at a known version, written periodically (e.g. every 100 events):

```
load(streamId):
  snap = latestSnapshot(streamId)          // state @ version 400
  tail = readStream(streamId, from=snap.v) // events 401..427 only
  return tail.reduce(apply, snap.state)
```

Back-of-envelope: at ~0.1 ms per event applied in memory, replaying 500k events ≈ **50 ms of pure CPU** *plus* the cost of reading 500k rows from disk/network (easily hundreds of ms). With a snapshot every 100 events, you replay ≤100 events ≈ **10 ms + a single snapshot read**. Snapshots are a *cache*, not truth - you must be able to delete every snapshot and rebuild from events alone. Never let a snapshot become load-bearing.

---

## 3. CQRS: why reads and writes must diverge

**CQRS = Command Query Responsibility Segregation.** Separate the model you write through (commands) from the model(s) you read from (queries). It's older and simpler than event sourcing (Greg Young / Bertrand Meyer's CQS scaled up) and does *not* require event sourcing - but ES forces it, because a stream of events is a terrible thing to query.

Try answering "show me all accounts with balance > $10,000, sorted by balance" from an event store. You'd have to replay *every* stream. Impossible at scale. So you build **read models** (a.k.a. **projections** / materialized views): denormalized, query-optimized tables built by consuming the event log.

```
                WRITE SIDE                          READ SIDE
   command                                   query
      |                                         |
      v                                         v
+-----------+   append   +-----------+     +-----------------+
| Command   |----------->| Event     |     | Read model A    |  (SQL: balances)
| Handler   |            | Store     |     | Read model B    |  (Elastic: search)
| (aggregate|<-- load ---| (truth)   |     | Read model C    |  (Redis: dashboards)
|  invariant)|           +-----+-----+     +--------^--------+
+-----------+                  |                    |
                               |  event stream      |  projections
                               +--------------------+  (async, eventually consistent)
```

Key consequences:
- **One write model, many read models.** The same events feed a SQL table for transactional reads, an Elasticsearch index for search, a Redis hash for a dashboard, a data-warehouse table for analytics. Each is shaped for *its* query. No more compromising one schema to serve five access patterns.
- **The link between sides is asynchronous and eventually consistent.** A projection lags the write by the time it takes to process the event - usually milliseconds, but it *can* fall behind (see §6). This lag is the single biggest source of bugs and UX surprises.
- **Read models are disposable.** They're derived data. If a projection is corrupt or you need a new shape, you delete it and **rebuild from the event log** (see §7).

### CQRS without event sourcing

You can do CQRS with a plain CRUD write DB that emits change events (via the **outbox pattern** or CDC) into read models. This is the pragmatic 80% case. Conflating "CQRS" with "event sourcing" is the most common conceptual mistake - keep them separate in your head.

| Pattern | Write store | Read store | Complexity | Gives you |
|---|---|---|---|---|
| Plain CRUD | Mutable rows | Same rows | Lowest | Simplicity |
| CQRS only | Mutable rows | Separate projections | Medium | Read scaling, polyglot reads |
| Event Sourcing only | Event log | Replay aggregate | High | Audit, time-travel, no read scaling |
| ES + CQRS | Event log | Many projections | Highest | All of the above; the "full" pattern |

---

## 4. When it helps - and when it's overkill

Be honest: **most apps should not do event sourcing.** It is a specialist tool with a large, permanent tax.

| Use ES+CQRS when… | Avoid it when… |
|---|---|
| Audit trail is a *hard* requirement (finance, healthcare, legal) - "why is this number what it is?" must be answerable | A CRUD audit-log table would satisfy compliance |
| The business *thinks in events* (ledgers, order lifecycles, insurance claims, inventory movements) | The domain is simple CRUD (a blog, a settings page, a CMS) |
| You need temporal queries: "what was state on date X?", replay, what-if analysis | You only ever need "current state" |
| Multiple read shapes from one write (search + dashboard + reporting) | One read shape suffices |
| Read and write load differ by orders of magnitude | Read and write load are comparable and low |
| Collaboration/merge semantics matter (you can derive intent from events) | Last-write-wins is fine |

**The honest cost list** (war-tested):
- Eventual consistency leaks into the UI - "I saved it, why don't I see it?"
- Event versioning is forever - you can never delete an old event shape; you must keep code that reads v1 events written in 2019.
- Debugging requires replaying streams, not reading a row.
- No `UPDATE`/`DELETE` means GDPR "right to be forgotten" fights an append-only log (see pitfalls).
- Onboarding cost: every new engineer must learn the pattern before touching anything.
- Tooling is thinner; you'll build infrastructure CRUD gives you for free.

Rule of thumb: **event-source the 1–2 aggregates where history is genuinely the product** (the ledger, the order) and leave the rest as boring CRUD. ES is an aggregate-level decision, not an app-level one. For a print-SaaS like this codebase, an order/job lifecycle or an invoice ledger might justify it; the product catalog and CMS absolutely do not.

---

## 5. Aggregates & consistency boundaries (DDD)

This is the part interviews probe and incidents expose. An **aggregate** (Eric Evans, *Domain-Driven Design*) is a cluster of objects treated as one unit for data changes, with one **aggregate root** as the entry point. Critically:

> **An aggregate is your transactional consistency boundary.** Everything inside is consistent *immediately* (one stream, one optimistic-concurrency check). Everything *between* aggregates is consistent only *eventually*.

So aggregate design = drawing your strong-vs-eventual consistency lines. Get this wrong and you either (a) make aggregates huge to force consistency, killing concurrency, or (b) put a true invariant across two aggregates and lose it.

**Worked example.** Invariant: "an account may not be overdrawn." That invariant is *inside* one account → the account is the aggregate, the rule is enforced synchronously in its command handler on load+append. Now: "transfer $100 from account A to account B." That invariant ("don't lose money") spans two aggregates → you **cannot** do it in one transaction. You use a **process manager / saga**: `MoneyWithdrawn(A)` → triggers `DepositMoney(B)` → emits `MoneyDeposited(B)`; if B's deposit fails, emit a compensating `MoneyRefunded(A)`. (See `12-message-queues-and-the-outbox-pattern.md` for saga/compensation mechanics.)

```
Command flow (one aggregate):
  Command --> load aggregate (replay/snapshot) --> decide (validate invariants)
          --> produce events --> append(expectedVersion) --> [conflict? reload & retry]
```

**Design heuristics:** keep aggregates *small* (favor concurrency); reference other aggregates by ID, never by embedding; one command mutates exactly one aggregate; if you "need" a transaction across two aggregates, your boundaries are probably wrong *or* you actually need a saga and eventual consistency.

---

## 6. Eventual consistency between write and read

The user submits a command, the API returns `200`, the user navigates to the list view - and their change isn't there, because the projection hasn't caught up. This is the read-your-own-writes problem from `06-replication-and-consistency.md`, now structural.

Mitigations, weakest to strongest:
1. **Return the new state from the write side.** The command handler already has the post-command aggregate state; return it so the UI updates optimistically without waiting for the projection.
2. **Version/correlation tokens.** Write returns the new global position N; the read API can `wait-for(N)` (block until the projection has processed up to N) or the client polls until the projection version ≥ N.
3. **Read from the write model for the just-acted-on aggregate**, projections for everything else. (You can always load one aggregate by replay.)
4. **Accept and surface the lag** - "Saving…", then "Saved". Honest UX beats a lie.

Numbers to internalize: a healthy projection lags **single-digit to low-tens of milliseconds**. Under a backlog (deploy, hot partition, slow downstream) it can hit **seconds to minutes**. *Always* monitor projection lag (current global position − projection's processed position) and alarm on it; an unmonitored projection that silently falls 6 hours behind is a classic 3 a.m. page.

---

## 7. The read-model rebuild problem

Projections are derived, so you *will* rebuild them: a bug shipped wrong data, you need a new read shape, or you migrate stores. Rebuild = drop the projection, replay the entire event log through the projection handler from position 0.

The problem is **scale and side effects**:
- A 2-billion-event log at 50k events/sec replay = **~11 hours**. During that window the read model is stale or absent.
- **Replays must be side-effect-free.** If your projection handler sends an email on `OrderShipped`, a rebuild re-sends ten thousand "your order shipped!" emails to customers from 2021. *This is a real outage class.* Side effects belong in process managers/reactors that track "already handled", never in idempotent projections.
- **Idempotency:** rebuilds and at-least-once delivery mean a projection may see an event twice. Project with upserts keyed by event/aggregate identity, never blind `INSERT`/`+=` without dedup.

Strategies to make rebuilds survivable:

| Strategy | How | Trade-off |
|---|---|---|
| Blue/green projection | Build new version in a parallel table, atomically swap when caught up | Double storage; cleanest zero-downtime |
| Catch-up subscription | Replay from 0 to "now", then switch to live tail | Standard; needs a defined cutover point |
| Snapshot the projection | Periodic checkpoints so partial rebuilds resume | Adds projection-side snapshot machinery |
| Partition the replay | Parallelize by stream/partition key | Faster; only if per-partition ordering suffices |

Kafka users get this semantics for free-ish: reset a consumer group's offset to 0 and reprocess (the log-compaction + offset model is literally designed for replay).

---

## 8. Event versioning & upcasting

Events are immutable *and immortal*. The `OrderPlaced` event you wrote in 2019 will still be in the store in 2029, and your 2029 code must still read it. You cannot run a migration to "fix old events" without rewriting history (which defeats the point and breaks hash chains/audits). So you need a deliberate **schema evolution** strategy.

| Technique | What it does | When |
|---|---|---|
| **Tolerant reader** | New code ignores unknown fields, defaults missing ones | Most additive changes |
| **Weak schema / additive only** | Only ever *add* optional fields; never rename/remove/retype | Default discipline - follow it religiously |
| **Upcasting** | On read, transform old event shape → newest shape before `apply` sees it | Structural changes (rename, split, type change) |
| **New event type** | Stop emitting `V1`, emit `OrderPlacedV2`; keep an upcaster `V1→V2` | Semantic change too big to upcast cleanly |
| **Copy-and-transform stream** | Write a brand-new stream from old events via a one-off migration | Last resort; breaks immutability/audit guarantees |

**Upcasting** is the workhorse. An upcaster is a pure function `oldEvent -> newEvent` applied as events are deserialized, *before* they reach `apply`. Chain them (`v1→v2→v3`) so `apply` only ever knows the latest shape:

```
raw bytes --> deserialize --> [upcast v1->v2] --> [upcast v2->v3] --> apply()
```

This mirrors the **forward/backward compatibility** discipline from `12-message-queues-and-the-outbox-pattern.md` and the schema-registry world (Avro/Protobuf). Same rules: never remove or repurpose a field; adding optional fields is safe; renaming requires an upcaster or a new type. Store an explicit `event_version` in every event from day one - retrofitting it later is misery.

---

## 9. Relationship to the outbox pattern

The hardest correctness problem in ES+CQRS is the **dual-write**: you must (a) persist the event as truth *and* (b) publish it so projections/sagas react - atomically. Persist-then-publish risks losing the publish if you crash between them; publish-then-persist risks publishing an event you never durably stored.

The **outbox pattern** solves this (full mechanics in `12-message-queues-and-the-outbox-pattern.md`): write the event and an outbox row in **one local transaction**, then a relay/CDC process publishes the outbox to the broker. In event sourcing this is especially clean because **the event store itself is the outbox** - projections are just catch-up subscriptions reading the same ordered log the writes go into. There's no separate publish step to lose; consumers track their own position in the log.

```
+------------------+     same log      +-------------------+
| append event     |------------------>| projection reads  |
| (atomic, truth)  |  (no dual write)  | from log position  |
+------------------+                   +-------------------+
```

When you do CQRS *without* ES (CRUD write DB), you bolt the outbox on: state row + outbox event in one transaction, relay to broker, projections consume. Either way the invariant is the same - **never do two independent writes and pray**. (See `12` for at-least-once + idempotent consumers; ES inherits all of it.)

---

## 10. Real systems

- **Banking/ledgers:** the canonical fit. [TigerBeetle](https://tigerbeetle.com/) is a purpose-built double-entry accounting database that is event-sourced/log-structured to the core. Traditional core-banking and brokerage systems are ledgers.
- **EventStoreDB / Kurrent:** the reference event-store database - streams, optimistic concurrency, catch-up subscriptions, projections.
- **Kafka:** "turning the database inside out" (Martin Kleppmann) - the log *as* the source of truth; Kafka Streams/ksqlDB build projections. Great transport, awkward single-aggregate system-of-record.
- **Postgres:** the pragmatic default event store (unique `(stream, version)` = OCC; `LISTEN/NOTIFY` or logical replication to drive projections). Marten productizes this.
- **Akka Persistence / Axon (JVM), EventFlow / Marten (.NET):** application frameworks implementing aggregates, snapshots, upcasting.
- **Datomic:** a database whose entire model is immutable facts (datoms) with time built in - event sourcing's ideas at the DB layer.
- **Git:** an event-sourced filesystem - commits are immutable events, the working tree is a projection, `git checkout` is time-travel.

---

## 11. Common pitfalls / war stories

- **Side effects in projections → email storms.** A rebuild re-fires every `SendShipmentEmail` since launch. Projections must be pure data transforms; side effects go in tracked reactors. The most expensive ES mistake.
- **Events as CRUD in disguise** (`AccountUpdated {fullStateBlob}`). You've kept all the costs and thrown away the value - no intent, no auditability of *why*. Model real domain facts (`AddressCorrected`), not snapshots.
- **Aggregates too big** to "make things consistent." A `Company` aggregate holding 10,000 orders means every order change contends on one stream's version → constant concurrency conflicts and a serialization bottleneck. Smaller aggregates, sagas across them.
- **No `event_version` from day one.** First structural change becomes a heroic migration. Always stamp version + a metadata envelope (correlation id, causation id, timestamp, actor).
- **GDPR vs immutability.** "Right to be forgotten" meets an append-only log. The accepted answer is **crypto-shredding**: encrypt PII in events with a per-subject key; to "delete," destroy the key, rendering those events unreadable while the log stays intact. Don't discover this requirement after launch.
- **Unbounded streams.** A 5-year shopping cart with millions of events. Use snapshots, and *close* aggregates whose lifecycle has ended (an order eventually reaches a terminal state).
- **Treating snapshots as truth.** Someone "optimizes" by writing only snapshots and pruning events. Now you can't rebuild, version, or audit - you've reinvented CRUD with extra steps.
- **Forgetting projection idempotency.** At-least-once + replays guarantee double-processing; non-idempotent `balance += amount` projections drift. Upsert by event id.
- **Adopting it everywhere.** Event-sourcing the CMS/settings/catalog buys nothing and taxes everyone. Scope it to the aggregates where history *is* the product.

---

## 🧩 Case Study: TigerBeetle - an event-sourced double-entry ledger

**The problem.** Payment processors, neobanks, exchanges, and energy markets all need to move money correctly, and they were doing it on general-purpose databases (Postgres/MySQL) wrapped in application code. At a real-time payments scale - think tens of thousands of transfers per second, each one a debit on one account and a credit on another that must balance to the cent - that stack falls apart. The TigerBeetle team measured incumbent ledgers handling roughly **1,000–2,000 transfers/sec** before lock contention and row-level coordination on hot accounts (the "settlement account" every transfer touches) became the wall. Worse, money systems carry the *hardest* correctness bar: you can never lose a transfer, never double-apply one, and you must be able to prove, years later, exactly how a balance became what it is. That last requirement is **events as source of truth + an immutable audit log** - the central thesis of this module - promoted to a non-negotiable product feature.

**Applying the module's concepts.** TigerBeetle is event sourcing taken to its logical end: the only mutating operation is *append a transfer*. A transfer is an immutable, past-tense fact - `MoneyTransferred {debit_account, credit_account, amount}` - exactly the kind of event from §2. Accounts are not rows you `UPDATE`; an account's balance is a **projection** (§3) folded from the transfers that touched it - the bank-statement-vs-balance inversion from §1, in production. There is no `UPDATE`/`DELETE` anywhere; a correction is a *new compensating transfer*, preserving the append-only log.

Because the ledger *is* the log, the dual-write problem of §9 disappears: **the event store is the outbox.** Replicas and downstream read models are catch-up subscribers on the same ordered log the leader commits - no separate publish step to lose.

The write path is one strict total order - a single global stream, not one-stream-per-account - so the "won't overdraw" invariant (§5) is enforced *synchronously* against the authoritative balance the instant a transfer is appended. This is the §2 optimistic-concurrency idea pushed to a serialized log: instead of compare-and-swap per stream, every transfer is sequenced into one consensus-ordered log, so two concurrent debits on the same account can never both pass the balance check.

```
         clients (banks, PSPs, exchanges)
                       |
                       v   batched commands (up to 8k transfers / message)
        +------------------------------+
        |   LEADER (state machine)     |   validate invariants
        |   append to ORDERED LOG  ----+--> debit/credit must balance
        +------------------------------+        (rejected before append)
                       |  replicate via consensus (VSR, f+1 of 2f+1)
        +--------------+--------------+
        v              v              v
    replica 1      replica 2      replica 3      <- log = source of truth
        |              |              |
        +------ in-memory account balances -------+  <- PROJECTION (the "fold")
                   (derived, rebuildable)
```

The in-memory balances are a **read model** (§3) and a **snapshot** (§2): rather than re-folding the entire transfer history on restart, TigerBeetle periodically checkpoints state so recovery replays only the tail - the §2 `snapshot + tail` load path, where the snapshot is a *cache*, never truth. Wipe every checkpoint and the cluster rebuilds balances from the log alone, satisfying the rule "never let a snapshot become load-bearing."

**The trade-off they accepted.** TigerBeetle gives up generality. It is **not** a SQL database - no ad-hoc queries, no arbitrary schema, only accounts and transfers with fixed 128-bit fields. It deliberately rejects the "many polyglot read models" flexibility of full CQRS (§3): the read side is essentially *one* shape (balances), because a ledger only needs to answer ledger questions. It also accepts a **single serialized write order** - sacrificing the per-aggregate concurrency §5 recommends - because for money, a strict total order *is* the feature: it makes double-spends and lost transfers structurally impossible. You trade the freedom to model anything for the guarantee that the one thing you model is always correct. Crucially, the write side here is **strongly consistent, not eventually consistent** - the eventual-consistency lag of §6 is pushed entirely onto downstream analytics/reporting consumers, never the balance check.

**Results.** By batching thousands of transfers per message, packing the hot data path into cache-friendly fixed-size records, and removing per-row locking in favor of one sequenced log, TigerBeetle reports on the order of **1,000,000 transfers/sec** on commodity hardware - roughly a **1000×** improvement over the few-thousand/sec ceiling of a transfer-on-Postgres design - while replicating across nodes for durability. The immutable log doubles as the audit trail for free: every balance is provably reconstructable from first principles, which is exactly what auditors and regulators demand.

### Lessons
- **When history *is* the product (money, ledgers), event sourcing stops being optional architecture and becomes the spec.** The append-only log isn't overhead - it's the audit trail, the recovery mechanism, and the correctness proof in one.
- **Specialize the read model to the domain.** TigerBeetle skips polyglot CQRS because a ledger asks only ledger questions. Don't build five projections when one is the whole job - and don't reach for a general DB when a purpose-built one fits the invariant.
- **A strict total order can be a feature, not a bottleneck.** Serializing all writes sounds slow, but batching + cache-friendly layout made it *faster* than lock-coordinated row updates - and it made double-spends impossible by construction.
- **Push eventual consistency to where it's harmless.** Keep the invariant (the balance check) strongly consistent on the write log; let lag live only in downstream reporting projections, per §6.

## 12. Test yourself

1. Why must the `apply(state, event)` function never contain validation or reject an event? *(Hint: the event already happened; rejecting it would mean state can't be rebuilt deterministically. Validation belongs in the command handler before the event is created.)*
2. You replay the event log to rebuild a read model and customers receive thousands of duplicate "order shipped" emails. What's the design rule that was violated, and where should that code have lived? *(Hint: projections must be side-effect-free; emails belong in a tracked reactor/process manager that records what it already handled.)*
3. An aggregate has 800,000 events and command latency is 600 ms. What do you add, and what invariant must it never violate? *(Hint: snapshots; they're a cache - you must still be able to rebuild from events alone with snapshots deleted.)*
4. How does an event store enforce that two concurrent withdrawals don't both succeed past the balance, without locking? *(Hint: optimistic concurrency - `append(expectedVersion)` is a compare-and-swap on the stream tail; the loser retries against fresh state.)*
5. You must rename a field used in a 2019 event type. Give two valid strategies and one forbidden one. *(Hint: valid = upcaster `oldEvent→newEvent` on read, or emit a new event type with an upcaster; forbidden = mutating historical events in place.)*
6. Distinguish CQRS from event sourcing, and give a CQRS-without-ES architecture. *(Hint: CQRS = separate read/write models; ES = events as truth. CRUD write DB + outbox/CDC → projections is CQRS with no ES.)*
7. "Transfer $100 from A to B" spans two account aggregates. Why can't this be one transaction, and what pattern handles it? *(Hint: aggregates are the transactional boundary; cross-aggregate = eventual consistency via a saga with compensating events.)*
8. Why is "the event store is the outbox" a cleaner solution to the dual-write problem than a CRUD app bolting on an outbox table? *(Hint: there's no separate publish step to lose - projections are catch-up subscriptions on the same ordered log the write commits to.)*

---

## 13. Further reading

- **DDIA** (Kleppmann), *Designing Data-Intensive Applications* - Ch. 11 (Stream Processing: event sourcing, change capture, "the database inside out") and Ch. 5 (Replication / logs).
- Martin Kleppmann, **"Turning the Database Inside Out with Apache Samza"** (talk + essay) - the foundational mental model for logs-as-truth.
- Greg Young - **"CQRS Documents"** and the EventStore talks; originator of the modern CQRS+ES framing.
- Eric Evans, **Domain-Driven Design** - aggregates, aggregate roots, consistency boundaries (Ch. 6).
- Vaughn Vernon, **Implementing Domain-Driven Design** - "Effective Aggregate Design" essays (the small-aggregates argument).
- Martin Fowler - **"Event Sourcing"**, **"CQRS"**, **"Domain Event"** articles (martinfowler.com) - concise canonical definitions.
- **EventStoreDB / Kurrent docs** - streams, optimistic concurrency, catch-up subscriptions, projections.
- **TigerBeetle docs** - a production event-sourced ledger; excellent on why finance needs this.
- Pat Helland, **"Immutability Changes Everything"** (CIDR 2015) - the deep argument for append-only systems.
- Cross-links: `12-message-queues-and-the-outbox-pattern.md` (outbox, sagas, idempotency), `06-replication-and-consistency.md` (logs, eventual consistency), `09-cap-pacelc-and-consistency-models.md` (read-your-writes, consistency models).
