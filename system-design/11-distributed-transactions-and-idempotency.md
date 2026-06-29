# Module 11 - Distributed Transactions, Sagas & Idempotency

**What you'll learn:** Why the ACID transaction you take for granted in a single Postgres database becomes nearly impossible the moment your write spans two services or two databases, and what real systems do instead. You'll learn 2PC/3PC and why they block, the Saga pattern with compensations, the Transactional Outbox + CDC pattern that fixes the dual-write problem, the three delivery semantics, and how idempotency keys turn an unreliable at-least-once world into something you can reason about.

**Prerequisites:** Read `09-cap-pacelc-and-consistency-models.md` (consistency models, linearizability vs eventual) and `10-replication-and-consensus.md` (Raft/Paxos, why consensus is expensive) first. Familiarity with `08-message-queues-and-streaming.md` (Kafka, delivery guarantees) helps for the Outbox/CDC section.

---

## 1. Intuition: why a single-DB transaction is a luxury

In a monolith on one Postgres instance you write:

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
```

Either both rows change or neither does. The database gives you **atomicity** (all-or-nothing) and **isolation** (concurrent transactions don't see each other's half-done state) for free, because one process - the storage engine - owns all the data, the write-ahead log, and the lock manager. There is a single point that knows the truth.

Now split `accounts` across two services - `BillingService` (Postgres A) and `WalletService` (Postgres B), each with its own database. There is no shared lock manager and no shared WAL. You want "debit A, credit B, all-or-nothing," but you now face the **two generals problem**: any message between the two can be lost, delayed, or duplicated, and a service can crash *between* doing its work and telling the other side. There is no protocol that gives you guaranteed agreement over an unreliable network with crash faults in bounded time - this is the FLP impossibility result in practical clothing.

**The analogy:** A single-DB transaction is two people in the same room signing a contract - one person watches both pens touch paper. A distributed transaction is two people signing by mail, where letters get lost and either signer might have a heart attack mid-signature. You cannot make "both sign or neither signs" bulletproof; you can only make it *recoverable* and *eventually consistent*.

---

## 2. The dual-write problem (the bug behind 80% of these incidents)

The most common naive attempt:

```php
// Inside one request handler - looks innocent, is broken
DB::transaction(fn () => $order->save());   // write 1: local DB
Kafka::publish('order.created', $order);     // write 2: message broker
```

These are **two separate systems with no shared transaction.** Four failure interleavings:

```
            DB commit OK      DB commit FAIL
Kafka OK    ✅ consistent      ❌ event without data (phantom)
Kafka FAIL  ❌ data without    ✅ consistent
            event (silent
            lost update)
```

The two failure cells are the killers. "Data without event" means inventory never gets reserved and the customer's paid order silently never ships - exactly the *silent-lie* bug class this codebase guards against (see `CLAUDE.md §5`). Retrying after a partial failure doesn't help: if the DB committed but Kafka failed, retrying the whole block double-saves the order.

**There is no ordering of two independent writes that is safe.** Whichever you do first can succeed while the second fails. The fix is to make one of them the source of truth and *derive* the other from it - that's the Transactional Outbox (§6).

---

## 3. Two-Phase Commit (2PC) and why it blocks

2PC is the textbook attempt at real distributed atomicity. A **coordinator** drives all participants through two phases.

```
        Coordinator                Participant A      Participant B
            |  --- PREPARE ------------>  |                |
            |  --- PREPARE --------------------------->    |
            |  <-- VOTE YES ------------- |                |
            |  <-- VOTE YES ---------------------------    |   (both flush
            |        (decision: COMMIT, logged to disk)    |    to WAL,
            |  --- COMMIT -------------->  |                |    hold locks)
            |  --- COMMIT ---------------------------->    |
            |  <-- ACK ------------------  |                |
            |  <-- ACK -------------------------------     |
```

**Phase 1 (prepare/voting):** coordinator asks everyone "can you commit?" Each participant does the work, writes it to its WAL in a *prepared* (durable but uncommitted) state, holds its locks, and votes YES - a promise it can no longer back out of. **Phase 2 (commit):** if all voted YES, coordinator logs COMMIT and tells everyone to finalize; any NO → ABORT.

### The fatal flaw: blocking on coordinator failure

If the coordinator crashes *after* a participant voted YES but *before* delivering the decision, the participant is stuck. It promised to commit, so it cannot unilaterally abort; it doesn't know the decision, so it cannot commit. It **holds its locks indefinitely**, blocking every other transaction touching those rows. This is the **uncertainty window**, and it is why 2PC is called a *blocking protocol*.

Concrete cost: each commit needs at minimum 2 round trips + 2 forced WAL flushes per participant. On a LAN that's ~2–10 ms; across regions (~70 ms RTT) a 2PC commit costs **150 ms+** and pins locks the whole time, collapsing throughput. This is why high-scale systems banned 2PC for the request path.

### 3PC and why nobody uses it

Three-Phase Commit inserts a **pre-commit** phase so participants learn the decision is imminent before committing, removing the indefinite block. But 3PC assumes **synchronous, bounded-delay networks** and is *not* safe under network partitions (it can produce split-brain commits). Modern systems either accept 2PC's blocking with a highly-available consensus-backed coordinator, or abandon distributed atomicity entirely.

| Protocol | Round trips | Blocking? | Partition-safe? | Real use |
|---|---|---|---|---|
| 2PC | 2 | Yes (coordinator crash pins locks) | No | XA/JTA, Postgres `PREPARE TRANSACTION`, Spanner intra-commit |
| 3PC | 3 | No (in theory) | **No** (split-brain) | Essentially none in production |
| Saga | n (async) | No | Yes | Microservices everywhere |
| Consensus-backed 2PC | 2 + Paxos | No (coordinator is replicated) | Yes | **Google Spanner**, CockroachDB, FoundationDB |

**Spanner's trick:** it still runs 2PC, but the coordinator and each participant are themselves Paxos groups (see `10-replication-and-consensus.md`). A "coordinator crash" no longer loses the decision because the decision is replicated by consensus. It buys real cross-shard ACID at the cost of TrueTime atomic clocks and ~10 ms commit-wait. Most teams cannot afford that, which is why sagas dominate.

---

## 4. The Saga pattern: give up atomicity, keep recoverability

A **saga** replaces one ACID transaction with a *sequence of local transactions*, each in its own service/DB. If step N fails, you run **compensating transactions** for steps N-1 … 1 to semantically undo them. There is no global rollback - there is forward progress or backward un-doing.

The key shift in thinking: a saga is **ACD, not ACID - it drops Isolation.** Intermediate states are visible to other transactions. An order can be "payment captured, inventory not yet reserved" for a moment, and another reader can see that. You manage the missing isolation with application-level techniques (semantic locks, status fields, commutative updates), covered in §8.

Compensations must be **semantic, not physical**. You can't "un-send" an email or "un-charge" a captured card - you send an apology / issue a refund. A compensation is a new business fact that counteracts a prior one.

### Orchestration vs Choreography

```
ORCHESTRATION (central brain)            CHOREOGRAPHY (event chain, no brain)

   ┌───────────────┐                      OrderSvc --order.created--> [bus]
   │  Saga         │                          [bus] --> PaymentSvc
   │  Orchestrator │                      PaymentSvc --payment.ok--> [bus]
   └──┬───┬───┬────┘                          [bus] --> InventorySvc
      │   │   │                            InventorySvc --reserved--> [bus]
   cmd│cmd│cmd│  (explicit commands           [bus] --> ShippingSvc
      ▼   ▼   ▼     + replies)             (each svc reacts to events,
   Pay  Inv  Ship                          no one owns the flow)
```

| | Orchestration | Choreography |
|---|---|---|
| Control flow | Central orchestrator issues commands | Each service reacts to events |
| Visibility | Whole saga in one place - easy to trace/audit | Flow is emergent; hard to see end-to-end |
| Coupling | Orchestrator knows all participants | Services only know event contracts |
| Failure handling | Orchestrator runs compensations explicitly | Each service must emit failure events; compensation logic scattered |
| Cyclic-dependency risk | Low | High (events triggering events) |
| Best when | ≥4 steps, complex branching, need audit trail | 2–3 steps, simple linear flow, max decoupling |

**Rule of thumb:** choreography for short, stable flows; **orchestration once it gets complex** - the central state machine is worth its weight when you're debugging a stuck order at 2 a.m. Real implementations: **AWS Step Functions**, **Temporal/Cadence** (durable orchestration with automatic retries + compensation), **Netflix Conductor**, **Camunda/Zeebe**.

---

## 5. Worked example: Order → Payment → Inventory saga (orchestrated)

This is the canonical interview question and maps directly to this project's order/payment/inventory chain (see `readme/ORDER_AND_JOB_WORKFLOW.md`, `readme/PAYMENT_GATEWAYS.md`).

### Happy path + state machine

```
[PENDING] --create--> [PAYMENT_AUTHORIZING]
   payment.authorize OK -> [INVENTORY_RESERVING]
      inventory.reserve OK -> [SHIPPING_SCHEDULING]
         shipping.schedule OK -> [CONFIRMED]   ✅ terminal success

Failure at inventory step (out of stock):
[INVENTORY_RESERVING] --reserve FAIL--> [COMPENSATING]
   -> payment.refund (compensate step 1)
   -> [CANCELLED]                              ✅ terminal failure
```

### Steps, compensations, and the tricky asymmetry

| Step | Forward action | Compensation | Notes |
|---|---|---|---|
| 1 | `payment.authorize` (hold, don't capture) | `payment.void` / `refund` | Authorize-then-capture lets you void cheaply before capture |
| 2 | `inventory.reserve` (decrement available) | `inventory.release` | Reserve, don't deduct stock outright |
| 3 | `shipping.schedule` | `shipping.cancel` | Pivot point - see below |
| 4 | `payment.capture` | (none - past the pivot) | After capture, no compensation; only forward fixes |

**Pivot transaction:** the step after which the saga *must* complete and can no longer be compensated. Order steps so all **compensatable** actions come first, then the **pivot**, then **retriable** (must-eventually-succeed) actions. Capturing payment after inventory is reserved is the classic pivot: once you've committed to the customer's money, you push forward (retry shipping) rather than unwind.

**Why authorize-before-capture matters:** if you *capture* in step 1 and inventory fails in step 2, your compensation is a refund - slow, fee-incurring, and a bad customer experience. Authorizing first makes the compensation a cheap *void*. This sequencing decision is the difference between a clean saga and a refund-storm incident.

### Pseudocode for the orchestrator (idempotent + durable)

```php
function runOrderSaga(string $orderId): void {
    $saga = SagaState::loadOrCreate($orderId);     // durable, resumable
    try {
        $saga->step('payment.authorize', fn() =>
            $payments->authorize($orderId, key: "$orderId:auth")); // idempotency key
        $saga->step('inventory.reserve', fn() =>
            $inventory->reserve($orderId, key: "$orderId:reserve"));
        $saga->step('shipping.schedule', fn() =>
            $shipping->schedule($orderId, key: "$orderId:ship"));
        $saga->step('payment.capture', fn() =>           // pivot
            $payments->capture($orderId, key: "$orderId:capture"));
        $saga->complete();
    } catch (StepFailed $e) {
        $saga->compensateInReverse();  // void/release only the completed steps
    }
}
```

Every external call carries an **idempotency key** (§7) and the saga state is **persisted after each step** so a crashed orchestrator resumes mid-flight instead of restarting the saga and double-charging.

---

## 6. Transactional Outbox + CDC - the correct fix for dual-write

You cannot atomically write your DB *and* publish to Kafka. So **only write the DB**, and include the event as a row in the *same local transaction*:

```sql
BEGIN;
INSERT INTO orders (...) VALUES (...);
INSERT INTO outbox (id, topic, payload, created_at)
  VALUES (uuid(), 'order.created', '{...}', now());
COMMIT;   -- one atomic local transaction. No dual write.
```

A separate **relay** then ships outbox rows to the broker and marks them sent. Two ways to relay:

```
WRITE PATH (atomic)             RELAY PATH (at-least-once)
                                 ┌────────────────────────┐
 App ──tx──> [orders]           │  Polling publisher:     │
        └──> [outbox] ──────────┼─> SELECT unsent ──> Kafka│
                                 │   mark sent (or delete)  │
                                 └────────────────────────┘
                                 ── OR ──
                     CDC: Debezium tails Postgres WAL ──> Kafka
                          (no app polling, lower latency)
```

| Relay method | Latency | Load | Ops cost | Use when |
|---|---|---|---|---|
| Polling publisher | 100 ms–1 s (poll interval) | Periodic SELECTs | Low - just your app | Small scale, no CDC infra |
| **CDC (Debezium tailing WAL)** | 10–50 ms | Near-zero on DB | Higher (Kafka Connect) | High throughput, low latency |

**Critical property:** the outbox guarantees **at-least-once** delivery, never exactly-once. The relay can crash *after* publishing but *before* marking the row sent → it republishes on restart → consumers see duplicates. This is unavoidable, and it's *why idempotency on the consumer is mandatory*, not optional. Outbox + idempotent consumers = effectively-once processing.

**Real systems:** Debezium (the de-facto CDC tool), DynamoDB Streams, MongoDB change streams, Postgres logical replication slots. The "listen to the log" idea is the same one behind Kafka itself - see `08-message-queues-and-streaming.md` and Kleppmann's "Turning the database inside-out."

---

## 7. Delivery semantics & idempotency keys

### The three guarantees

| Semantic | What it means | Cost | Reality |
|---|---|---|---|
| **At-most-once** | Fire and forget; may drop | Cheapest, no retries | OK for metrics/logs where loss is fine |
| **At-least-once** | Retries until ack; may duplicate | Moderate | **The default for any reliable system** |
| **Exactly-once** | Delivered+processed exactly 1× | Expensive / often a myth | Only *within* a closed system (Kafka EOS) |

The deep truth: **exactly-once *delivery* over a network is impossible** (you can't distinguish a lost message from a lost ack - the two generals problem again). What you *can* get is **exactly-once *processing*** = at-least-once delivery **+ idempotent / deduplicated consumers**. Kafka's "exactly-once semantics" works only because producer, broker, and consumer offsets are all inside Kafka's transactional boundary; the moment your side effect leaves Kafka (charge a card, send an email), you're back to needing idempotency.

### Idempotency keys & the dedup store

An **idempotency key** is a client-supplied unique ID for an *operation* (not a record). The server records the result keyed by it; a retry with the same key returns the stored result instead of re-executing.

```
POST /charges    Idempotency-Key: 9f3c-...    amount=100

server:
  SELECT result FROM idem WHERE key='9f3c-...';
  if found -> return stored result (no re-charge)
  else:
     BEGIN;
       INSERT INTO idem(key, status='in_progress') -- UNIQUE constraint!
       ... do the charge ...
       UPDATE idem SET status='done', result=...;
     COMMIT;
     return result
```

Design rules that bite people:

- **Scope the key to the operation, store the response.** Stripe returns the *original* response (even the original error) for 24 h. The key must capture intent so a retry of "charge $100" doesn't accidentally satisfy a later "charge $200."
- **Use a UNIQUE constraint as the dedup gate**, plus a "in_progress" state with a TTL/lease, so two *concurrent* retries don't both execute (the constraint makes one lose). Don't rely on `SELECT then INSERT` - that's a race.
- **Persist before side effect.** Write the `in_progress` row *before* charging; otherwise a crash after charging but before recording the key lets the retry charge again.
- **Dedup store choices:** Redis `SETNX key … EX ttl` (fast, bounded window - fine if your retries arrive within the TTL); a relational table with UNIQUE (durable, slower); Kafka consumer = `(topic, partition, offset)` or a business key in a processed-IDs table.

> This project's payments audit flagged exactly this gap - see `readme/PAYMENTS_BILLING_FINANCIAL_CORRECTNESS.md`: a missing idempotency key on charge means a retried checkout can double-charge.

---

## 8. Eventual consistency, reconciliation & distributed deadlocks

### Sagas leak intermediate state - manage it

Because sagas have no isolation, you need countermeasures (from the saga literature, Garcia-Molina & Salem 1987):

- **Semantic lock:** mark the record `PENDING`/`reserved` so other transactions know it's mid-saga and either wait or skip it.
- **Commutative updates:** design operations so order doesn't matter (`balance += x` commutes; `balance = x` doesn't).
- **Reread / version check:** before compensating, reread to handle the case where another actor changed the row (optimistic concurrency, version columns).
- **By-value vs by-status:** decide whether a reader trusts the in-flight value or waits for terminal status.

### Reconciliation: the safety net you must build

Distributed state drifts. A reserve succeeds but the "reserved" event is lost; a refund fires twice. **Run a periodic reconciliation job** that compares systems of record (e.g. payment-gateway settled amounts vs your orders) and emits a repair or an alert. Treat your live flow as best-effort and reconciliation as the eventual truth - every serious payments/inventory system has a nightly recon. Idempotency makes repair re-runnable; without it, recon itself can double-apply.

### Distributed deadlocks

When transactions hold locks across services, you can deadlock with no single lock manager to detect the cycle:

```
Saga A: holds lock(order-1) on SvcX, waits lock(inv-9) on SvcY
Saga B: holds lock(inv-9) on SvcY, waits lock(order-1) on SvcX
        → cycle spanning two services, nobody sees it
```

Mitigations: **lock ordering** (always acquire resources in a global canonical order - kills cycles), **timeouts + retry with backoff** (the pragmatic default; let one victim abort), **wait-die / wound-wait** timestamp schemes (older txn priority, prevents cycles deterministically), or **avoid cross-service locks entirely** by using sagas with semantic locks + compensation instead of holding real DB locks.

---

## 9. Common pitfalls / war stories

- **The dual-write that "worked in testing."** DB-then-publish passes every test because failures are rare in dev. In prod, the broker hiccups for 200 ms during a deploy and 4,000 paid orders never get inventory reserved. Fix: outbox.
- **Non-idempotent compensation.** Refund handler with no idempotency key; the orchestrator retries the compensation after a timeout and refunds twice. The void/refund must carry `"$orderId:refund"`.
- **Capturing before the pivot.** Capturing payment in step 1, then inventory fails → refund storm, gateway fees, angry customers. Authorize first, capture after the pivot.
- **Treating Kafka "exactly-once" as end-to-end.** EOS covers Kafka-to-Kafka. Your `sendEmail()` inside the consumer is a side effect outside Kafka - at-least-once → duplicate emails. Add a dedup store.
- **Idempotency key = the record ID.** Using `order_id` as the key means a legitimate second, different operation on the same order is silently swallowed. The key is per-*operation*.
- **Orchestrator with non-durable state.** In-memory saga state → orchestrator restarts → saga re-runs from step 0 → double charge. Persist state after every step; use Temporal/Step Functions if you can.
- **Forgetting the in_progress lease.** Two concurrent retries both pass the `SELECT`, both charge. Use the UNIQUE constraint + status, not check-then-act.
- **2PC across regions on the hot path.** Someone adds XA to "make it correct"; p99 latency triples and a coordinator crash freezes the table. 2PC is a last resort, not a default.

---

## 🧩 Case Study: DoorDash order fulfillment & payments

**The problem.** DoorDash processes on the order of **2+ billion orders a year** (peaks of millions of orders per day, tens of thousands of orders per minute during dinner rush). A single "order" is not one write - it spans a sprawl of independently-owned microservices: payment authorization, merchant order injection (the restaurant's POS), Dasher (courier) assignment, delivery routing, and post-delivery capture/payout. Each lives in its own service with its own database. There is **no shared transaction** across "charge the customer," "tell the restaurant to cook," and "assign a Dasher." Early on, DoorDash hit exactly the failure cells from §2: the classic dual-write bug where an order committed locally but the downstream event (charge, or POS injection) was lost or fired twice - producing customers charged for food never cooked, restaurants cooking orders never paid, and duplicate charges on retries.

**Applying this module's concepts.**

This is the §5 worked example at industrial scale. The fulfillment flow is a **saga** (§4): a sequence of local transactions - authorize payment, inject order to merchant, assign Dasher, deliver, capture payment - with **compensations** when a step fails (void the auth, cancel the merchant order, refund). DoorDash drops Isolation exactly as §4 describes: an order legitimately sits in "paid-but-not-yet-assigned" for seconds, visible to other systems, managed with **status fields and semantic locks** (§8) rather than cross-service DB locks.

For the control flow they moved toward **orchestration over choreography** (§4) using **Cadence** (the durable-workflow engine that Temporal forked from). This is the rule-of-thumb in action: with ≥4 steps, branching (no-Dasher-available, restaurant-rejected, customer-cancel), and a hard need to trace a stuck order at dinner-rush 7 p.m., the central state machine earns its keep. Cadence persists workflow state after every step, so an orchestrator crash **resumes mid-saga** instead of restarting from step 0 and double-charging - the "durable orchestrator" requirement from §5's pseudocode, solved by an off-the-shelf engine.

The **pivot transaction** (§5) is real money: DoorDash *authorizes* at checkout and *captures* after delivery. Authorize-then-capture means a pre-pivot failure (restaurant closed, no Dasher) compensates with a cheap **void**, not a fee-incurring **refund** - precisely the asymmetry §5 warns about.

To kill the dual-write, DoorDash adopted the **transactional outbox + CDC** pattern (§6). Services write their state row and an outbox event **in one local transaction**, and **Debezium tails the Postgres/Aurora WAL** to publish to **Kafka** - no app polling, low latency. Their internal event-bus / "Iguazu" pipeline is this idea generalized: the database log is the source of truth, events are *derived*, never dual-written.

```
 CHECKOUT (one local tx)         RELAY (at-least-once)        CONSUMERS (idempotent)
  ┌─ orders ──────┐              Debezium tails WAL           PaymentSvc  (key=order:auth)
  │ INSERT order  │   ──CDC──▶   ──▶ Kafka topic   ──fanout──▶ MerchantSvc (key=order:inject)
  │ INSERT outbox │              order.created                 DasherSvc   (key=order:assign)
  └───────────────┘                                           dedup table per consumer
        Cadence workflow orchestrates compensations on any step failure
        (void auth · cancel merchant order · release Dasher)
```

Because the outbox is **at-least-once** (the relay can republish after a crash), every consumer is **idempotent** (§7). Each downstream action carries an **idempotency key** scoped to the *operation* (`order:auth`, `order:capture`, `order:inject`) - not the order id - backed by a UNIQUE-constrained dedup row so two concurrent retries can't both execute. This is the **exactly-once illusion** spelled out in §7: at-least-once Kafka delivery + idempotent consumers = effectively-once *processing*, even though exactly-once *delivery* over the network is impossible.

Finally, DoorDash runs **reconciliation** (§8) as the eventual truth: nightly jobs compare gateway-settled amounts against captured orders and merchant payouts, repairing drift. Idempotency is what makes those repairs safely re-runnable.

**The key trade-off.** They **gave up cross-service atomicity and Isolation** (no 2PC on the order hot path - §3's blocking cost is unaffordable at tens of thousands of orders/minute) in exchange for **availability, low latency, and horizontal scale**. The price is real: temporary inconsistency windows, compensation logic to maintain, and a hard dependency on idempotency + reconciliation being correct everywhere. They accepted "eventually consistent and recoverable" over "atomic but blocking" - the central bargain of §4.

**Results (qualitative + reported).** Moving off dual-writes to outbox/CDC + Cadence-orchestrated sagas eliminated the phantom-event and double-charge incident class; the CDC pipeline streams change events at very high throughput (their event platform handles billions of events/day) with WAL-tailing latency in the tens of milliseconds rather than poll-interval seconds. Durable workflows let a crashed orchestrator resume without re-charging, and idempotency keys collapse retry storms during partial outages instead of amplifying them into duplicate charges.

### Lessons

- **Outbox + CDC + idempotent consumers is the production-grade fix for dual-write** - at DoorDash's scale it's not optional; the moment a side effect leaves Kafka (charging a card), you're back to needing your own idempotency key.
- **Reach for a durable orchestrator (Cadence/Temporal/Step Functions) once the saga has ≥4 steps and branching** - hand-rolled in-memory saga state will eventually restart-from-zero and double-charge.
- **Order steps so all compensatable actions precede the pivot** - authorize-before-capture turns a costly refund into a cheap void, which is the difference between a clean cancel and a refund storm.
- **Treat the live flow as best-effort and build reconciliation as the real source of truth** - distributed state always drifts; idempotency is what makes nightly repair safe to run.

## 10. Test yourself

1. Why is exactly-once *delivery* impossible but exactly-once *processing* achievable? *(Hint: lost message vs lost ack are indistinguishable; idempotent consumer collapses duplicates.)*
2. A participant voted YES in 2PC and the coordinator vanished. What can the participant safely do, and what is the cost? *(Hint: nothing - it must block holding locks; this is the uncertainty window.)*
3. In the order saga, why authorize payment before reserving inventory rather than capturing it? *(Hint: cheap void vs costly refund as the compensation.)*
4. Your service does `INSERT order; publish event` in code (not the same tx). Give two distinct failure outcomes and the fix. *(Hint: phantom event / lost event; transactional outbox.)*
5. Outbox guarantees at-least-once. What *must* the consumer do, and why can't the outbox give exactly-once itself? *(Hint: relay can crash after publish before marking sent → dedup on consumer.)*
6. Design an idempotency-key flow that's safe under two concurrent retries. *(Hint: persist `in_progress` row under a UNIQUE constraint before the side effect; second insert loses.)*
7. What does a saga give up that an ACID transaction provides, and name two ways to compensate for the loss. *(Hint: Isolation; semantic locks, commutative updates, reread/version.)*
8. Two sagas deadlock across SvcX and SvcY with no global lock manager. Give two mitigations. *(Hint: global lock ordering; timeout+backoff or wound-wait.)*

---

## 11. Further reading

- **DDIA (Kleppmann)** - Ch. 7 *Transactions* (isolation levels, 2PC), Ch. 8 *The Trouble with Distributed Systems*, Ch. 9 *Consistency and Consensus* (atomic commit, FLP). The single best treatment.
- **Garcia-Molina & Salem, "Sagas" (1987)** - the original paper; compensation and semantic locks.
- **Chris Richardson, *Microservices Patterns*** - Ch. 4 (Saga), Ch. 3 (Transactional Outbox); also microservices.io patterns pages.
- **Gray & Lamport, "Consensus on Transaction Commit"** - Paxos-Commit, the consensus-backed coordinator that Spanner-class systems use.
- **Spanner paper (Corbett et al., OSDI 2012)** - TrueTime + 2PC over Paxos groups for real cross-shard ACID.
- **Kleppmann, "Turning the database inside-out"** - the log-as-source-of-truth mental model behind Outbox/CDC.
- **Stripe - "Idempotency" docs** and **"Designing robust and predictable APIs with idempotency"** (Brandur Leach) - production idempotency-key design.
- **Debezium documentation** - outbox event router + CDC patterns.
- **Confluent - "Exactly-once semantics in Kafka"** - what EOS does and doesn't cover.
- Cross-links: `09-cap-pacelc-and-consistency-models.md`, `10-replication-and-consensus.md`, `08-message-queues-and-streaming.md`.
