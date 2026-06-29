---
title: 'Distributed Transactions: Sagas, Outbox & Idempotency Explained'
metaTitle: 'Distributed Transactions & Idempotency'
description: >-
  Distributed transactions break the moment data crosses two services. See how
  sagas, the transactional outbox, and idempotency keys keep systems correct.
topic: system-design
topicTitle: System Design
category: Engineering
date: '2026-06-15'
order: 11
icon: "\U0001F3D7️"
keywords:
  - distributed transactions
  - saga pattern
  - idempotency key
  - transactional outbox
  - two-phase commit
  - exactly-once delivery
  - dual write problem
  - eventual consistency
  - compensating transaction
  - change data capture
  - at-least-once delivery
  - microservices transactions
faq:
  - q: What is a saga in distributed systems?
    a: >-
      A saga replaces one all-or-nothing transaction with a sequence of small
      local transactions, one per service. If a later step fails, you run
      compensating actions that semantically undo the earlier ones - a refund
      instead of a rollback.
  - q: Why is exactly-once delivery impossible?
    a: >-
      Over a network you cannot tell a lost message from a lost acknowledgement,
      so the sender must retry, which can duplicate. You can get exactly-once
      processing by combining at-least-once delivery with idempotent consumers.
  - q: What is an idempotency key?
    a: >-
      It is a unique ID a client attaches to an operation, like a charge. The
      server stores the result under that key, so a retry returns the saved
      result instead of running the operation again and double-charging.
  - q: What is the dual-write problem?
    a: >-
      It happens when code writes to a database and then publishes an event as
      two separate steps. If one succeeds and the other fails you get data with
      no event, or an event with no data. The fix is the transactional outbox.
  - q: Why do engineers avoid two-phase commit?
    a: >-
      Two-phase commit blocks. If the coordinator crashes after a participant
      votes yes, that participant holds its locks indefinitely, freezing other
      work. Across regions it also adds heavy latency, so most systems use sagas.
  - q: What is a transactional outbox?
    a: >-
      You write your business row and an event row in the same local database
      transaction, then a separate relay ships the event to your message broker.
      This avoids the dual-write problem and guarantees at-least-once delivery.
author: Pritesh Yadav (priteshyadav444)
transformed: true
polished: true
sources: []
---

Picture a customer who just paid for an order. The money left their card. But the warehouse never heard about it, so the package never ships. No error fired. No alert woke anyone up. The system simply told a quiet lie.

This is not a rare edge case. It is the default outcome the moment your data lives in more than one place. The clean, all-or-nothing transaction you trust inside a single database does not survive the trip across a network.

Let's unpack why that happens - and the small set of patterns that real systems use to stay honest anyway.

## Why this matters

Inside one database, a transaction is a gift. You write `BEGIN`, change two rows, write `COMMIT`, and either both changes stick or neither does. You never think about it.

The instant you split those two rows across two services - billing here, the wallet there - that gift vanishes. There is no shared lock manager, no shared log, no single place that knows the truth. Now a message can be lost, delayed, or duplicated, and a service can crash at the worst possible moment.

If you build anything that spans services - orders and payments, inventory and shipping, accounts and ledgers - you will meet these failures. Get the patterns right and partial outages become recoverable hiccups. Get them wrong and you ship double charges, phantom orders, and refund storms. The difference is not luck. It is a handful of design decisions you can learn.

## The luxury you take for granted

Here is the transaction everyone trusts:

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
```

Either both balances change or neither does. You get **atomicity** (all-or-nothing) and **isolation** (other transactions never see the half-finished state) for free, because one process owns all the data, the log, and the locks. There is a single source of truth.

Now split those two accounts across two databases, each owned by a different service. There is no shared log and no shared lock manager. You still want "debit one, credit the other, all-or-nothing" - but any message between them can vanish, and either side can crash mid-step.

**A simple analogy.** A single-database transaction is two people in the same room signing a contract, each watching both pens touch paper. A distributed transaction is two people signing by mail - letters get lost, and either signer might have a heart attack mid-signature. You cannot make "both sign or neither signs" bulletproof. You can only make it *recoverable*.

That shift - from bulletproof to recoverable - is the whole game.

## The dual-write problem

Most distributed-data incidents trace back to one innocent-looking pattern:

```php
// Inside one request handler - looks fine, is broken
DB::transaction(fn () => $order->save());   // write 1: the database
Kafka::publish('order.created', $order);     // write 2: the message broker
```

These are **two separate systems with no shared transaction**. Walk through the four ways it can play out:

- Database saves, event publishes. Everything is consistent.
- Database fails, event also fails. Annoying, but consistent.
- Database saves, event **fails**. The order exists, but inventory never reserves and the paid order silently never ships.
- Database fails, event **publishes**. A phantom event for an order that does not exist.

Those last two cells are the killers. And retrying does not save you: if the database committed but the broker failed, retrying the whole block saves the order *twice*.

The hard truth: **there is no safe order for two independent writes.** Whichever you do first can succeed while the second fails. The only fix is to stop doing two writes. Make one of them the source of truth and *derive* the other from it. We'll get there with the outbox pattern.

## Two-phase commit, and why it freezes

The textbook attempt at real distributed atomicity is **two-phase commit (2PC)**. A **coordinator** drives every participant through two phases.

1. **Prepare.** The coordinator asks each participant, "Can you commit?" Each one does the work, writes it to disk in a *prepared but not committed* state, holds its locks, and votes yes - a promise it can no longer take back.
2. **Commit.** If everyone voted yes, the coordinator records the decision and tells each participant to finalize. Any no means abort.

It sounds airtight. Here is where it breaks.

If the coordinator crashes *after* a participant votes yes but *before* delivering the decision, that participant is trapped. It promised to commit, so it cannot abort on its own. It does not know the decision, so it cannot commit either. So it **holds its locks indefinitely**, blocking every other transaction that touches those rows. This is the **uncertainty window**, and it is why 2PC is called a *blocking* protocol.

The cost is real even when nothing crashes. Each commit needs at least two round trips plus forced disk flushes per participant. On a local network that is a few milliseconds. Across regions, a single 2PC commit can cost **150 milliseconds or more** while pinning locks the entire time. That collapses throughput, which is exactly why high-scale systems banished 2PC from the request path.

There is a three-phase variant that tries to remove the indefinite block, but it assumes a fast, well-behaved network and is **not safe under network partitions** - it can produce split-brain commits. Almost nobody runs it in production.

### The expensive exception

Some systems - Google Spanner, CockroachDB, FoundationDB - *do* run 2PC and get genuine cross-shard atomicity. Their trick is that the coordinator itself is replicated by consensus, so a coordinator crash no longer loses the decision. The price is steep: atomic clocks, consensus on every commit, and a built-in commit delay. Most teams cannot afford that. So most teams reach for sagas instead.

## The saga pattern: trade atomicity for recovery

A **saga** replaces one big ACID transaction with a *sequence of local transactions*, each living in its own service and database. If step four fails, you run **compensating transactions** to semantically undo steps three, two, and one. There is no global rollback - only forward progress, or backward undoing.

The mental shift is this: a saga is **ACD, not ACID - it drops Isolation**. Intermediate states are visible. An order can briefly be "payment taken, inventory not yet reserved," and another part of the system can see that in-between state. You manage that missing isolation with application-level tricks, not with database magic.

One rule matters most: **compensations are semantic, not physical.** You cannot "un-send" an email or "un-charge" a captured card. You send an apology, or you issue a refund. A compensation is a *new* business fact that counteracts an old one.

### Orchestration versus choreography

There are two ways to coordinate the steps.

- **Orchestration** uses a central brain. One orchestrator issues commands - pay, reserve, ship - and reacts to replies. The whole flow lives in one place, so it is easy to trace and audit. The orchestrator runs compensations explicitly when a step fails.
- **Choreography** has no brain. Each service listens for events and reacts by emitting its own. The order service publishes "order created," the payment service hears it and publishes "payment ok," and so on. Maximum decoupling, but the flow is emergent - nobody owns it, and it is hard to see end to end.

**A rule of thumb:** choreography for short, stable flows of two or three steps. **Orchestration once it gets complex** - four or more steps, branching, and the need to debug a stuck order at 2 a.m. A central state machine earns its keep the moment things go wrong. Battle-tested engines for this include AWS Step Functions, Temporal and Cadence, Netflix Conductor, and Camunda.

## A worked example: order to payment to inventory

This is the canonical saga. An order flows through authorize payment, reserve inventory, schedule shipping, capture payment. If inventory is out of stock, you compensate backward: void the authorization, cancel the order.

Two design choices in this flow are worth memorizing.

**The pivot transaction.** This is the step after which the saga *must* finish and can no longer be cleanly undone. Order your steps so all the easily-compensated actions come first, then the pivot, then the must-eventually-succeed actions. Once you have truly committed to taking the customer's money, you push forward - retry shipping - rather than unwind.

**Authorize before you capture.** If you *capture* the payment in step one and inventory fails in step two, your only compensation is a refund - slow, fee-incurring, and a bad experience. If you merely *authorize* first, the compensation is a cheap *void*. This one sequencing decision is the difference between a clean cancel and a refund-storm incident.

And two properties keep the orchestrator safe:

- **Durable state.** Persist the saga's progress after every step. A crashed orchestrator then resumes mid-flight instead of restarting from step zero and double-charging.
- **Idempotency keys on every external call.** So a retry never executes twice. That deserves its own section.

## The correct fix for dual-write: the outbox

Remember the dual-write problem - you cannot atomically write your database *and* publish to your broker. So stop trying. **Write only the database**, and include the event as a row in the *same local transaction*:

```sql
BEGIN;
INSERT INTO orders (...) VALUES (...);
INSERT INTO outbox (id, topic, payload, created_at)
  VALUES (uuid(), 'order.created', '{...}', now());
COMMIT;   -- one atomic local transaction. No dual write.
```

Now a separate **relay** ships those outbox rows to the broker and marks them sent. Two ways to run the relay:

1. **Polling.** A background job selects unsent rows and publishes them. Simple, no extra infrastructure, but it adds poll-interval latency.
2. **Change data capture (CDC).** A tool like Debezium tails the database's own write-ahead log and publishes changes directly. Near-zero load on the database and latency in the tens of milliseconds, at the cost of running more infrastructure.

There is one property you must internalize: **the outbox guarantees at-least-once delivery, never exactly-once.** The relay can crash *after* publishing but *before* marking the row sent, so it republishes on restart and consumers see duplicates. This is unavoidable. It is also precisely *why idempotent consumers are mandatory, not optional*. Outbox plus idempotent consumers gives you effectively-once processing - the best you can actually get.

## Delivery guarantees, demystified

There are exactly three delivery semantics, and knowing which one you have is half the battle.

- **At-most-once.** Fire and forget. May drop messages. Cheapest. Fine for metrics where a little loss does not matter.
- **At-least-once.** Retry until acknowledged. May duplicate. This is **the default for any reliable system**.
- **Exactly-once.** Delivered and processed exactly one time. Expensive, and across a network, largely a myth.

Here is the deep truth that confuses everyone: **exactly-once *delivery* over a network is impossible.** You cannot distinguish a lost message from a lost acknowledgement, so the sender must retry, which risks a duplicate.

What you *can* achieve is **exactly-once *processing*** - at-least-once delivery plus consumers that quietly ignore duplicates. When you hear "Kafka exactly-once," it works only because the producer, broker, and consumer offsets all live inside Kafka's own boundary. The moment your side effect leaves that boundary - you charge a card, you send an email - you are back to needing your own idempotency.

## Idempotency keys: the trick that tames retries

An **idempotency key** is a unique ID the client attaches to an *operation* - not a record. The server records the result under that key. A retry carrying the same key gets the stored result back instead of running the operation again.

```
POST /charges    Idempotency-Key: 9f3c-...    amount=100

server:
  is there a stored result for key 9f3c-...?
    yes -> return it, do not charge again
    no  -> record the key as "in progress" (under a UNIQUE constraint),
           do the charge, store the result, return it
```

That looks simple. The details are where people get burned.

## Common misconceptions

**"Exactly-once Kafka means my whole pipeline is exactly-once."** No. That guarantee covers Kafka-to-Kafka only. Your `sendEmail()` inside the consumer is a side effect outside Kafka, so it is at-least-once - and your customer gets two emails. Add a dedup store.

**"I can use the order ID as the idempotency key."** Tempting, and wrong. The key must scope to the *operation*, not the record. If the key is just `order_id`, a legitimate second, different operation on that same order gets silently swallowed. Stripe, for example, scopes the key to one operation and returns the *original* response - even the original error - for 24 hours.

**"A quick SELECT, then INSERT, will deduplicate fine."** That is a race. Two concurrent retries both pass the SELECT and both charge. Use a **UNIQUE constraint** as the gate so one of them loses, plus an "in progress" status, instead of check-then-act.

**"I'll record the key after the charge succeeds."** If you crash after charging but before recording, the retry charges again. **Persist the key first**, then perform the side effect.

**"Two-phase commit will just make it correct."** Adding 2PC to the hot path triples your tail latency, and a coordinator crash freezes the table. It is a last resort, not a default.

## How to use this

When you next design a flow that crosses services, walk this checklist:

1. **Hunt for dual writes.** Any place that writes a database and then publishes an event in two steps is a latent incident. Replace it with the transactional outbox.
2. **Model the flow as a saga.** List the steps, and for each one write down its compensation. If a step has no clean compensation, it is your pivot.
3. **Order the steps around the pivot.** Put all easily-undone actions first. Authorize money early, capture it late, so failures compensate with a cheap void rather than a refund.
4. **Make every external call idempotent.** Generate a per-operation key, persist it under a UNIQUE constraint *before* the side effect, and store the result to return on retries.
5. **Make consumers deduplicate.** Because the outbox is at-least-once, every consumer needs a dedup store keyed by message offset or business key.
6. **Persist saga state after every step.** So a crashed orchestrator resumes instead of restarting. Reach for Temporal, Cadence, or Step Functions once you hit four-plus steps with branching.
7. **Build reconciliation.** Run a periodic job that compares systems of record - say, gateway-settled amounts against your orders - and repairs or alerts on drift. Treat the live flow as best-effort and reconciliation as the eventual truth. Idempotency is what makes those repairs safe to re-run.

## Conclusion

The single idea to carry away: **stop trying to make distributed writes atomic, and start making them recoverable.** You give up the all-or-nothing guarantee on purpose, and you buy back correctness with three tools - the outbox so you never dual-write, sagas so failures undo cleanly, and idempotency so retries never double-apply.

That trade - eventually consistent and recoverable, instead of atomic and blocking - is the central bargain of nearly every large system you use. DoorDash routes billions of orders a year on exactly this combination: outbox plus change data capture feeding idempotent consumers, with a durable orchestrator running compensations when a Dasher cannot be found or a restaurant closes.

There is a deeper rabbit hole waiting underneath all of this. Every one of these patterns quietly depends on services *agreeing* on what happened - which is the problem of consensus, and why algorithms like Raft and Paxos exist. That is where the real magic, and the real cost, lives. Worth a look next.
