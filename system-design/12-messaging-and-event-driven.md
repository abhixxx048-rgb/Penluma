# 12 · Messaging, Queues & Event-Driven Architecture

**What you'll learn:** How asynchronous messaging decouples services, the deep distinction between a *queue* (RabbitMQ/SQS) and a *log* (Kafka), and the full set of guarantees — delivery semantics, ordering, exactly-once — with the failure modes that break them in production. By the end you should be able to choose a partition key under pressure, design a dead-letter strategy, reason about backpressure, and defend a Kafka topology in a staff-level design review.

**Prerequisites:** Read `09-cap-pacelc-and-consistency-models.md` (consistency vocabulary), `10-replication-and-consensus.md` (ISR/Raft, leader election), and `11-idempotency-and-distributed-transactions.md` (idempotency keys, the outbox pattern). This module leans on all three.

---

## 1. Why asynchronous messaging exists (intuition)

Imagine a print shop. A customer drops off an order at the counter. The clerk does *not* make the customer stand there while the order is designed, printed, dried, and boxed. The clerk writes a ticket, drops it in a **tray**, and the customer leaves. The press operator picks up tickets from the tray when free. The tray is a **message queue**: it decouples *arrival rate* from *processing rate*, survives the operator going on break (durability), and lets you add a second operator to drain the tray faster (horizontal scale).

Synchronous RPC is the customer standing at the counter. It couples availability (if the press is down, the counter is down), couples latency (slow press = slow counter), and couples capacity (one customer at a time). Messaging breaks all three couplings. The price you pay is **eventual** processing and a whole zoo of new failure modes — duplicates, reordering, poison messages, unbounded backlogs — which is what the rest of this module is about.

```
SYNCHRONOUS (coupled)                 ASYNCHRONOUS (decoupled)
  Client ──RPC──▶ Service              Client ─▶ [ QUEUE/LOG ] ─▶ Consumer
   (blocks until done)                   (returns immediately)   (drains at its own pace)
   fate-shared availability              independent availability
```

In Print-Flow-360 terms: an order is placed → an event is published → thumbnail generation (the `pdf-service`), notification email, inventory decrement, and analytics all react *independently*. None blocks checkout; none can take checkout down.

---

## 2. Two fundamentally different primitives: Queue vs Log

This is the single most misunderstood thing in the space. They look similar (you put messages in, you get messages out) but the data model is opposite.

A **queue** (RabbitMQ, ActiveMQ, AWS SQS) is *destructive read*: a broker holds messages, hands each to one consumer, and **deletes** it on acknowledgment. The broker tracks per-message state. It is fundamentally a smart broker / dumb consumer.

A **log** (Apache Kafka, AWS Kinesis, Redpanda, Apache Pulsar) is an *append-only, replayable* ordered sequence. Reads are **non-destructive** — the consumer tracks its own position (offset). Messages stay until a retention policy evicts them, independent of who read them. It is a dumb broker / smart consumer.

```
QUEUE (RabbitMQ/SQS)                    LOG (Kafka)
 ┌──────────────┐                        partition 0: [0][1][2][3][4][5]...→ append
 │ msg msg msg  │──deliver──▶ C1            ▲              ▲
 │ (deleted on  │──deliver──▶ C2         consumer-A      consumer-B
 │  ack)        │            (compete)   offset=2        offset=5
 └──────────────┘                        (both read the SAME data independently)
```

| Dimension | Queue (RabbitMQ / SQS) | Log (Kafka / Kinesis) |
|---|---|---|
| Read model | Destructive (deleted on ack) | Non-destructive (offset cursor) |
| Replay history | No (gone after ack) | Yes (re-seek to old offset) |
| Multiple independent consumers | Needs fan-out (one queue each) | Native (each group has own offsets) |
| Ordering | Per-queue, lost under competing consumers | Strict **per partition** |
| Throughput ceiling | ~10k–50k msg/s/queue typical | Millions/s (sequential disk + batching) |
| Per-message TTL / priority / delay | First-class (RabbitMQ) | Awkward (no per-msg priority) |
| Retention model | Until consumed | Time/size/compaction based |
| Best for | Task distribution, RPC-style work, priority jobs | Event streaming, event sourcing, replayable pipelines, many subscribers |

**Rule of thumb:** if the message is a *command to do one unit of work once* ("generate this thumbnail"), a queue fits. If it's a *fact that many parties care about and may want to re-read* ("order #123 was placed"), a log fits. Real systems often use both: Kafka as the event backbone, SQS/Celery for discrete worker jobs.

---

## 3. Pub/Sub vs Point-to-Point

Two delivery topologies, orthogonal to the queue/log choice:

- **Point-to-point (competing consumers):** one message → exactly one of N consumers. This is how you *parallelize* work. N workers pull from one queue; each message handled once. Add workers to scale throughput linearly (until the broker or downstream DB is the bottleneck).
- **Publish/subscribe (fan-out):** one message → *every* subscriber gets a copy. This is how you *decouple* independent reactions to the same fact.

```
COMPETING CONSUMERS (point-to-point)      PUB/SUB (fan-out)
  Q ─▶ W1  (gets msg 1,4,7)               topic ─▶ EmailSvc   (all get every msg)
  Q ─▶ W2  (gets msg 2,5,8)                     ─▶ InventorySvc
  Q ─▶ W3  (gets msg 3,6,9)                     ─▶ AnalyticsSvc
  → scale THROUGHPUT                            → DECOUPLE reactions
```

Kafka unifies both with the **consumer group**: consumers *in the same group* compete (point-to-point — each partition goes to one member); consumers in *different groups* each see the full stream (pub/sub). RabbitMQ models it with exchanges: a `direct` queue gives competing consumers; a `fanout` exchange copies to every bound queue. SNS→SQS on AWS is the canonical cloud fan-out (SNS publishes, multiple SQS queues subscribe, each drained by its own worker fleet).

---

## 4. Kafka internals (the depth interviewers probe)

### Topics, partitions, offsets

A **topic** is a named stream. It's split into **partitions** — that's the unit of parallelism, ordering, and storage. Each partition is an ordered, immutable, append-only log of records, each with a monotonically increasing **offset** (0, 1, 2, …). A partition lives entirely on one broker's disk (plus replicas).

```
Topic "orders" (3 partitions)
  P0: [0][1][2][3][4]──▶ (leader on broker-1, replicas on broker-2,3)
  P1: [0][1][2]──────▶   (leader on broker-2)
  P2: [0][1][2][3]──▶    (leader on broker-3)
Producer hashes key → picks partition.  Order guaranteed WITHIN a partition only.
```

**The throughput ceiling is the partition count.** A topic with 6 partitions can be drained by at most 6 active consumers in a group — partition #7's consumer sits idle. Pick partition count for your *peak future* parallelism; you can increase but never decrease, and increasing breaks key→partition stability (see §5).

### Consumer groups, rebalancing, offset commits

Each consumer group gets each partition assigned to **exactly one** member. The group coordinator (a broker) runs the **rebalance protocol** when membership changes. Classic ("eager") rebalancing is *stop-the-world*: everyone revokes all partitions, then reassigns — pauses can be seconds. **Cooperative incremental rebalancing** (KIP-429, default since Kafka 2.4+) only moves the partitions that actually need to move. Use **static membership** (`group.instance.id`) so a pod restart inside `session.timeout.ms` doesn't trigger a rebalance at all.

Consumers **commit offsets** (to the internal `__consumer_offsets` topic) to record progress. The semantics hinge on *when* you commit relative to *when* you process:

```
At-least-once:  process(msg) ──▶ then commit(offset)
                 crash between = reprocess on restart = DUPLICATE   (safe default)
At-most-once:   commit(offset) ──▶ then process(msg)
                 crash between = message LOST                       (rarely acceptable)
```

`enable.auto.commit=true` commits on a timer regardless of processing — a quiet source of *both* loss and duplicates. For correctness, **disable auto-commit and commit explicitly after processing.**

### Replication: ISR, acks, and the durability dial

Each partition has one leader and N-1 followers. The **In-Sync Replica (ISR)** set is the followers caught up within `replica.lag.time.max.ms`. Durability is a producer/broker negotiation:

| `acks` | Guarantee | Failure cost | Throughput |
|---|---|---|---|
| `0` | Fire-and-forget | Loses data on any hiccup | Highest |
| `1` | Leader persisted | Loses data if leader dies before replication | Medium |
| `all` (-1) | All ISR persisted | No loss while ≥1 ISR survives | Lowest (still fast) |

`acks=all` alone isn't enough: if ISR shrinks to just the leader, "all" means "the one". Pair it with **`min.insync.replicas=2`** (on a replication-factor-3 topic) so a write fails fast rather than silently risking loss. And set **`unclean.leader.election.enable=false`** — otherwise a stale out-of-sync replica can be elected leader and *silently truncate committed data* (the famous availability-vs-durability knob; see consensus trade-offs in `10-replication-and-consensus.md`).

### Retention vs log compaction

Two eviction policies, often confused:

- **Retention** (`cleanup.policy=delete`): drop segments older than `retention.ms` (default 7 days) or beyond `retention.bytes`. Time-series / events.
- **Compaction** (`cleanup.policy=compact`): keep the *latest value per key* forever, garbage-collecting superseded versions. Turns the log into a durable, replayable **changelog / snapshot** — perfect for "current state of every order keyed by order_id". Kafka Streams' state stores and `__consumer_offsets` rely on it. A `null` value is a **tombstone** that deletes the key after `delete.retention.ms`.

```
Compaction of key=user42:
  before: [u42=A][u7=X][u42=B][u42=C][u7=Y]
  after:  [u7=Y][u42=C]    ← only the newest per key survives
```

---

## 5. Ordering guarantees and partition-key choice

**Kafka guarantees order only within a partition.** Across partitions, all bets are off. So the partition key is the most consequential design decision you'll make. Records with the same key always land on the same partition (key hash mod partition count), so they're ordered relative to each other.

- **Order matters per entity** (all events for `order_123` must apply in sequence): key by `order_id`. Now status transitions never race. The cost: an order with a hot stream of events can hot-spot one partition.
- **Order doesn't matter / you want max parallelism:** key by something high-cardinality and uniform (e.g. a random/round-robin key), or null key (round-robin batches).

The **partitioning skew trap:** keying by `tenant_id` in a multi-tenant SaaS (like this codebase) means one whale tenant saturates a single partition while others idle — a classic hot-partition incident. Mitigation: composite key (`tenant_id:order_id`) when per-order ordering is enough, or salt the key.

**Subtle producer gotcha:** even single-partition order can break. With `retries>0`, a failed batch retried *after* a later batch succeeded reorders records — unless **`max.in.flight.requests.per.connection ≤ 5` with the idempotent producer enabled** (Kafka then preserves order on retry via sequence numbers). With the idempotent producer *off*, you need `max.in.flight=1` for strict order, which kills pipelining throughput.

---

## 6. Delivery semantics: at-most / at-least / exactly-once

```
                 duplicates?   loss?     use when
at-most-once     no            possible  metrics you can lose, max throughput
at-least-once    POSSIBLE      no        default; pair with idempotent consumers
exactly-once     no            no        money, dedup-expensive side effects
```

The honest senior take: **in a distributed system you get at-least-once delivery, and you engineer *effectively-once processing* by making consumers idempotent.** The Two Generals problem means the producer can never *know* its message arrived without an ack, and the ack itself can be lost — so it must retry, so duplicates are inevitable on the wire. See `11-idempotency-and-distributed-transactions.md`.

### Idempotent consumers (the real-world EOS)

Make processing safe to repeat: dedup on a business key (`event_id`/`order_id`) stored in a `processed_events` table with a unique constraint, or design naturally idempotent operations (`SET status='paid'` is idempotent; `balance = balance + 10` is *not*). This is the technique you reach for 95% of the time.

### Kafka exactly-once (EOS) — what it actually covers

Kafka offers genuine exactly-once *within Kafka* via two mechanisms:

1. **Idempotent producer** (`enable.idempotence=true`, default in modern clients): the broker assigns each producer a PID and tracks per-partition sequence numbers, so a retried duplicate batch is dropped broker-side. Kills producer-retry duplicates — but only within a single producer session, single partition.
2. **Transactions** (`transactional.id` + `initTransaction`/`beginTransaction`/`sendOffsetsToTransaction`/`commitTransaction`): atomically write to multiple partitions **and** commit consumer offsets in one transaction. Consumers set `isolation.level=read_committed` to skip aborted records. This makes the **consume→process→produce** loop atomic — the foundation of Kafka Streams EOS (`processing.guarantee=exactly_once_v2`).

**The crucial caveat:** Kafka EOS is exactly-once *for the Kafka→Kafka path*. The moment your consumer does a side effect outside Kafka — write to Postgres, call Stripe, send an email — Kafka transactions don't cover it. For that boundary you still need the **transactional outbox** + idempotency keys (covered in module 11). Don't let "Kafka has exactly-once" lull you into skipping consumer idempotency on external effects.

---

## 7. Backpressure, retries, DLQs, and poison messages

### Backpressure

Producers can outrun consumers. What happens to the backlog?

- **Log (Kafka):** the backlog just sits on disk (cheap — TBs are fine). Backpressure surfaces as **consumer lag** (offset distance behind the log head). Alert on lag *trend*, not absolute value: rising lag = consumers losing the race. Kafka has effectively no producer-side backpressure beyond buffer-full blocking (`buffer.memory`, `max.block.ms`).
- **Queue (RabbitMQ):** unbounded queues swell RAM until the broker hits its memory high-watermark and **blocks publishers** — backpressure propagates to producers. Use bounded queues / `x-max-length` with an overflow policy (drop-head or reject-publish), and consumer **prefetch** (`basic.qos`) so one greedy consumer doesn't hoard 10k unacked messages.
- **Pull vs push:** Kafka consumers *pull* (natural flow control — fetch when ready). RabbitMQ *pushes* (must bound with prefetch or you flood the consumer). Pull-based is generally more robust under backpressure.

**The cascade failure:** an unbounded queue in front of a slow DB hides the problem until the queue's storage fills, then *everything* upstream blocks at once — a thundering collapse. Bounded buffers + load shedding fail *gracefully* instead. "An unbounded queue is a memory leak with extra steps."

### Retry with exponential backoff + jitter

A poison/transient failure shouldn't hammer a struggling downstream. Back off exponentially, and **always add jitter** to avoid the retry **thundering herd** (10k consumers all retrying at exactly t+1s, t+2s … synchronize into traffic spikes that re-kill the service).

```
delay = min(cap, base * 2^attempt)         # exponential
delay = random_between(0, delay)           # FULL JITTER (AWS-recommended)
# base=100ms, cap=20s, attempt 0..6 → ~100ms,200,400,800,1.6s,3.2s,6.4s (then randomized)
```

AWS's "Exponential Backoff and Jitter" article showed **full jitter** minimizes both contention and completion time vs naive backoff. Cap total attempts; infinite retry of a permanent error is a tight loop in disguise.

### Dead-letter queues & poison messages

A **poison message** can never succeed — malformed payload, a referenced row that was deleted, a bug. Retrying it forever blocks the partition/queue (head-of-line blocking) and burns CPU. After N attempts, **route it to a Dead-Letter Queue (DLQ)** and move on.

```
main queue ──process──┐ fail
                      ▼  attempt < N? ──yes──▶ retry (backoff queue)
                   retry?                       │
                      │  attempt ≥ N            ▼
                      └──────────────────▶ [ DLQ ]  (alert + human/automated triage)
```

- **SQS:** native — set a redrive policy with `maxReceiveCount`; after N receives the message auto-moves to the DLQ.
- **RabbitMQ:** `x-dead-letter-exchange`; messages dead-lettered on reject/nack/TTL-expiry. Delayed-retry tiers via per-queue TTL + DLX chaining.
- **Kafka:** no native DLQ — *you* publish failed records to a `topic.DLT` (Spring Kafka / Kafka Connect do this for you). Critically, **never block the partition** on a poison record; commit past it and side-line it, or you stall every key behind it.

**DLQ discipline:** a DLQ with no alarm and no owner is a black hole where data goes to die silently. Monitor DLQ depth, capture the failure reason + stack on the message, and build a *redrive* path (fix bug → replay DLQ back to main). For Kafka, replayability means you can also just re-seek the offset.

---

## 8. Throughput tuning (concrete knobs & numbers)

Kafka's speed comes from **sequential disk I/O**, the OS page cache, **zero-copy** (`sendfile`), and **batching**. The producer-side levers:

| Knob | Effect | Typical |
|---|---|---|
| `batch.size` | Bytes per partition batch | 64KB–256KB (up from 16KB default) |
| `linger.ms` | Wait to fill a batch | 5–50ms (trade latency for throughput) |
| `compression.type` | Shrink payload | `lz4`/`zstd` (zstd best ratio) |
| `buffer.memory` | Producer send buffer | bump for bursty load |
| consumer `fetch.min.bytes` | Wait for N bytes before returning | raise to batch fetches |

Back-of-envelope: 1KB messages, 100MB/s/broker sustained sequential write → ~100k msg/s/broker, and a partition tops out around 10–50MB/s. Need 1M msg/s? ~10–20 partitions across enough brokers, batched and lz4-compressed. **More partitions ≠ free**: each adds open file handles, replication overhead, longer rebalances, and higher end-to-end latency; thousands of partitions per broker degrade controller failover. Size partitions for required parallelism plus headroom, not "as many as possible."

The dominant real bottleneck is rarely the broker — it's the **downstream the consumer writes to** (Postgres, an API). Tune consumer concurrency and downstream batching together; a faster broker just fills your DB's queue sooner.

---

## 9. Common pitfalls / war stories

- **Auto-commit ate my messages.** `enable.auto.commit=true` committed offsets on its 5s timer mid-batch; a crash skipped the un-processed tail. Fix: manual commit *after* processing.
- **The hot partition.** Keyed events by `tenant_id`; the biggest customer's traffic pinned one consumer at 100% while five sat idle. Lag climbed only for that tenant. Fix: composite/salted key.
- **Reordered writes despite one partition.** Idempotent producer was off and `max.in.flight=5`; a retried batch overtook a later one, applying an old status after a new one. Fix: `enable.idempotence=true`.
- **The retry storm.** A flaky payment API blipped; 50k consumers retried in lockstep (no jitter) and turned a 2s blip into a 20-minute self-DDOS. Fix: full jitter + circuit breaker.
- **The silent DLQ.** Poison messages piled into a DLQ nobody watched; finance noticed missing orders a week later. Fix: alarm on DLQ depth, store failure reason, build redrive.
- **Treating Kafka like a database.** Querying by scanning a topic, or keeping infinite retention as a "source of truth" without compaction or an external store. Kafka is a *log*, not a queryable DB.
- **"We have exactly-once."** Enabled Kafka transactions, then a consumer also charged Stripe — double charges on rebalance reprocessing because the external call wasn't idempotent. Kafka EOS doesn't cross the Kafka boundary.
- **The dual-write.** Service writes to Postgres *and* publishes to Kafka in two steps; a crash between them leaves DB and stream inconsistent. Fix: the **transactional outbox** + CDC/Debezium (see module 11).
- **Rebalance storms.** Aggressive `session.timeout.ms` + GC pauses caused constant rebalances; throughput collapsed under stop-the-world reassignment. Fix: cooperative rebalancing + static membership + tuned timeouts.

---

## 🧩 Case Study: LinkedIn's creation of Apache Kafka (the central log)

**The problem.** By 2010 LinkedIn had ~90 million members and a data-integration mess that grew worse every quarter. Dozens of systems needed to know about the same events — a member viewing a profile, sending a connection request, a page impression, a search. The activity-tracking and operational-metrics pipelines fed the newsfeed, relevance/search, ad targeting, fraud detection, the data warehouse, and a fleet of Hadoop jobs. Each producer→consumer link was a bespoke point-to-point integration. With *N* sources and *M* sinks you tend toward an **O(N×M)** spaghetti of pipelines, each with its own format, batching cadence, and failure behavior. Their existing tools didn't fit: traditional message *queues* (ActiveMQ) buckled under the volume and, being destructive-read, couldn't feed both a real-time consumer *and* a batch Hadoop loader from the same stream; log-aggregation tools (Scribe/Flume) were one-directional toward HDFS and weren't built for low-latency online consumers. Volumes were already enormous — hundreds of billions of messages/day, and within a few years over a trillion/day and petabytes flowing through the cluster.

**The insight: make the *log* the primitive (not the queue).** This is exactly the **log vs queue** distinction from §2. Instead of a smart broker that deletes on ack, LinkedIn built a dumb broker holding an **append-only, replayable, non-destructive log**, with *smart consumers* tracking their own **offsets**. The same event stream could now serve a sub-second newsfeed consumer and a once-an-hour Hadoop batch loader off identical data, each at its own position. The O(N×M) web collapsed into **O(N+M)**: every producer writes once to Kafka; every consumer reads independently. That is the **decoupling of producers from consumers** the module opens with — neither knows the other exists.

```
BEFORE: O(N×M) point-to-point pipelines        AFTER: O(N+M) via the central log
 tracking ─┬─▶ search                            tracking ─┐
 db-CDC   ─┼─▶ newsfeed                           db-CDC   ─┤        ┌─▶ search    (group, offset)
 metrics  ─┼─▶ Hadoop                             metrics  ─┼─▶ KAFKA┼─▶ newsfeed  (group, offset)
 ads      ─┴─▶ fraud   ...every pair wired        ads      ─┘  LOG   ├─▶ Hadoop    (group, offset)
                                                               └─▶ fraud     (replay any time)
```

**Partitions, consumer groups, offsets — the scaling levers.** A topic like `PageViewEvent` was split into **partitions** (§4), the unit of parallelism *and* of ordering. Each **consumer group** (newsfeed, search-indexer, Hadoop ETL) gets every partition assigned to exactly one member, so members of one group *compete* (point-to-point parallelism) while different groups each see the whole stream (pub/sub) — the **consumer-group duality** from §3. Throughput scales by adding partitions and consumers; LinkedIn ran topics with hundreds of partitions to drain a single high-volume stream across many machines.

**Ordering per key — chosen deliberately, not globally.** LinkedIn did *not* want a global total order (it doesn't scale — one partition, one disk). They accepted **ordering only within a partition** (§5) and chose partition keys to match the entity that needed ordering: events keyed by member or by entity id land on the same partition and stay in sequence, while unrelated events spread across partitions for parallelism. This is the precise trade-off the module hammers: per-key order *or* unbounded parallelism, picked per stream.

**Throughput from boring mechanics.** Kafka's numbers came from the levers in §8 — **sequential disk I/O**, the OS **page cache**, **zero-copy** (`sendfile`) straight from page cache to socket, and aggressive producer **batching** with compression. LinkedIn's published 2014 benchmark pushed **~2 million writes/sec on three cheap commodity brokers**; their production cluster carried over a trillion messages/day. Crucially they leaned on retention being *cheap on disk* — keep days of data and let consumer **lag** (not a swelling queue) be the backpressure signal (§7).

**Replay was the killer feature.** Because reads are non-destructive, a consumer that shipped a bug could fix it and **re-seek to an old offset** to reprocess history — the **replay** capability from §2/§7. A new derived dataset (say, a fresh search index) could be built by replaying the whole topic from offset 0. This same property turned the log into the backbone of **event sourcing and stream processing** (later Samza, then Kafka Streams) and of **CDC via Debezium** feeding the outbox pattern (module 11).

**The trade-off they accepted.** Kafka gave up the conveniences of a queue: **no per-message acknowledgment, priority, TTL, or selective delete**, and (originally) only **at-least-once** delivery — duplicates were the consumer's problem to dedup (the *effectively-once via idempotent consumers* stance of §6; transactions/EOS came years later in KIP-98). They also gave up *global* ordering and strong queryability — Kafka is a log, not a database (§9). In exchange they got linear horizontal throughput, replayability, and one stream feeding many independent consumers. For a data-integration backbone, that bargain was overwhelmingly correct: Kafka was open-sourced (2011), graduated from Apache incubation, and became the de-facto streaming standard, with Confluent spun out to commercialize it.

### Lessons

- **Pick the log when many parties care about the same facts and may re-read them; pick the queue when it's one-unit-of-work-once.** LinkedIn's whole win was recognizing their events were *facts*, not *commands* — so a replayable, non-destructive log beat a destructive queue.
- **A shared log turns O(N×M) integration spaghetti into O(N+M).** Standardize on one event backbone with self-tracking consumers instead of wiring every source to every sink.
- **Partition key = your ordering-vs-parallelism decision.** Order per entity costs you a hot-partition risk; global order costs you scale. Choose per stream, not platform-wide.
- **Cheap sequential disk + replay changes what's possible.** Treat the log as durable, re-readable history — it enables reprocessing, new derived views, and CDC — but don't mistake it for a queryable database or assume duplicates won't happen.

## 10. Test yourself

1. **You need per-order event ordering AND high throughput across millions of orders. What's the partition key, and what breaks it?** *Hint: key by `order_id` for per-entity order; producer `max.in.flight` + idempotence can still reorder on retry; increasing partition count later breaks key→partition stability.*
2. **Why is "exactly-once delivery" impossible, and what do we actually build instead?** *Hint: Two Generals / lost-ack; at-least-once + idempotent (effectively-once) processing.*
3. **`acks=all` is set but you still lost data. How?** *Hint: ISR shrank to the leader and `min.insync.replicas` wasn't set, or unclean leader election truncated committed records.*
4. **When do you choose RabbitMQ/SQS over Kafka?** *Hint: discrete task distribution, per-message priority/TTL/delay, no replay needed, modest throughput; vs replayable event stream with many independent subscribers.*
5. **A poison message is stuck at the head of a Kafka partition. What happens and what do you do?** *Hint: head-of-line blocking stalls every key behind it; commit past it / route to a DLT after N attempts, alert + redrive.*
6. **Why add jitter to exponential backoff?** *Hint: synchronized retries form a thundering herd that re-kills the recovering service; full jitter spreads load.*
7. **Difference between log compaction and retention, and when do you want compaction?** *Hint: retention drops old; compaction keeps latest-per-key → durable changelog / current-state snapshot; tombstones delete keys.*
8. **Your consumer does exactly-once into Kafka but also writes Postgres. Is it exactly-once end-to-end?** *Hint: no — Kafka transactions don't cover external side effects; need outbox + idempotency keys at that boundary.*

---

## 11. Further reading

- **DDIA** (Kleppmann), *Designing Data-Intensive Applications* — Ch. 11 "Stream Processing" (logs vs queues, exactly-once, fault tolerance) and Ch. 4 (message schemas). The canonical treatment.
- **Apache Kafka docs** — Design, Replication, Exactly-Once Semantics (KIP-98), Idempotent Producer, Log Compaction. <https://kafka.apache.org/documentation/>
- **Kreps, "The Log: What every software engineer should know about real-time data's unifying abstraction"** — the foundational essay on the log abstraction.
- **AWS Architecture Blog, "Exponential Backoff and Jitter"** — the definitive empirical case for full jitter. <https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/>
- **KIP-98** (Kafka transactions / EOS) and **KIP-429** (cooperative incremental rebalancing) — primary-source design rationale.
- **AWS SQS Developer Guide** — dead-letter queues, redrive policy, FIFO vs standard queues.
- **RabbitMQ docs** — Consumer Prefetch, Dead Letter Exchanges, Quorum Queues, Flow Control.
- **Confluent, "Transactions in Apache Kafka"** and **"Designing Event-Driven Systems"** (Stopford, free O'Reilly e-book).
- Sibling modules: `09-cap-pacelc-and-consistency-models.md`, `10-replication-and-consensus.md`, `11-idempotency-and-distributed-transactions.md`.
