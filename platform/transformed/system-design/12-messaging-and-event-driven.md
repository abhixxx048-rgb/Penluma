---
title: 'Message Queues vs Kafka: Event-Driven Architecture Explained'
metaTitle: 'Message Queues vs Kafka Explained'
description: >-
  Message queues vs Kafka, delivery guarantees, ordering, and dead-letter
  queues, explained in plain language so you can design event-driven systems.
topic: system-design
topicTitle: System Design
category: Engineering
date: '2026-06-15'
order: 12
icon: "\U0001F3D7️"
keywords:
  - message queue
  - event-driven architecture
  - Kafka vs RabbitMQ
  - queue vs log
  - at-least-once delivery
  - exactly-once processing
  - dead letter queue
  - Kafka partitions
  - consumer groups
  - backpressure
  - idempotent consumer
  - pub/sub vs point to point
faq:
  - q: What is the difference between a message queue and a log like Kafka?
    a: >-
      A queue (RabbitMQ, SQS) deletes a message once a consumer acknowledges it,
      so each message is read once. A log (Kafka) keeps messages until a
      retention policy removes them, and each consumer tracks its own position,
      so many consumers can read the same stream and replay it later.
  - q: Is exactly-once delivery possible?
    a: >-
      Not over a network. The sender can never be sure its message arrived, so it
      must retry, which creates duplicates. Instead you build effectively-once
      processing by making consumers idempotent so repeating a message is safe.
  - q: When should I use RabbitMQ or SQS instead of Kafka?
    a: >-
      Use a queue when a message is a command to do one unit of work once, when
      you need per-message priority, delay, or TTL, and when you do not need to
      replay history. Use Kafka when many consumers care about the same events
      and may want to re-read them.
  - q: What is a dead-letter queue?
    a: >-
      A dead-letter queue is where messages go after they fail processing too
      many times. It stops a single broken message from blocking the queue, and
      lets you alert, inspect the failure, and replay it once the bug is fixed.
  - q: Why add jitter to retry backoff?
    a: >-
      Without jitter, thousands of clients retry at the exact same moments and
      form a synchronized spike that re-crashes the recovering service. Random
      jitter spreads those retries out so the downstream can recover.
  - q: What does a Kafka partition key control?
    a: >-
      The partition key decides which partition a message lands on, and Kafka
      only guarantees order within a partition. Keying by entity (like order_id)
      keeps that entity's events in order but risks a hot partition.
author: Pritesh Yadav (priteshyadav444)
transformed: true
polished: true
sources:
  - https://en.wikipedia.org/wiki/Apache_Kafka
  - https://en.wikipedia.org/wiki/Message_queue
  - https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
  - https://kafka.apache.org/documentation/
---

Picture a busy print shop. A customer drops off an order, the clerk writes a ticket, drops it in a tray, and the customer walks out. Nobody stands at the counter waiting for the job to be designed, printed, and boxed. That tray is doing something quietly profound, and it is the same trick that lets giant software systems stay fast and stay up.

The tray is a message queue. It separates how fast work *arrives* from how fast it gets *done*. Get this idea right and your services stop dragging each other down. Get it wrong and you ship duplicate charges, lost orders, and outages that cascade.

## Why this matters

Most outages are not caused by one service being slow. They are caused by one slow service freezing everything connected to it.

When service A calls service B directly and waits for a reply, the two are fused together. If B is down, A is down. If B is slow, A is slow. If B can handle one request at a time, so can A. You have coupled their availability, their latency, and their capacity, all at once.

Messaging breaks those three links. The sender drops a message and moves on. The receiver works through the backlog at its own pace. Checkout never waits for the email to send, the thumbnail to render, or analytics to update. Each of those can be slow, restart, or fall behind without taking the order button down with it.

The price you pay is that work happens *eventually* instead of instantly, and a new set of failure modes shows up: duplicate messages, reordered messages, messages that can never succeed, and backlogs that grow without limit. The rest of this article is about understanding those trade-offs well enough to design around them.

## The one distinction everyone gets wrong: queue vs log

This is the most misunderstood idea in the whole space. Queues and logs look identical from the outside. You put messages in one end and take them out the other. Underneath, their data models are opposites.

A **queue** (RabbitMQ, ActiveMQ, AWS SQS) uses a **destructive read**. The broker holds each message, hands it to one consumer, and *deletes it* once that consumer says "done." The broker is smart and tracks every message; the consumer is simple. Think of it like a to-do list where you tear off a sticky note when you finish it. Once it is torn off, it is gone.

A **log** (Apache Kafka, AWS Kinesis, Redpanda, Pulsar) is an **append-only, replayable sequence**. Reading does *not* delete anything. Each consumer remembers its own position, called an **offset**. Messages stick around until a retention policy ages them out, no matter who has read them. Think of it like a shared diary: ten people can read the same page, each with their own bookmark, and the page stays put.

That difference drives everything else:

| What you care about | Queue (RabbitMQ / SQS) | Log (Kafka / Kinesis) |
|---|---|---|
| Read model | Deleted on acknowledgment | Kept; you track your own offset |
| Replay old messages | No, gone after ack | Yes, just rewind the offset |
| Many independent readers | Needs a separate copy each | Built in, each group has its own offset |
| Ordering | Easily lost with multiple workers | Strict, but only within a partition |
| Throughput ceiling | Tens of thousands/sec per queue | Millions/sec |
| Per-message priority, delay, TTL | First-class | Awkward or unsupported |
| Best for | One-off jobs, task distribution | Event streams, many subscribers, replay |

**The rule of thumb:** if a message is a *command to do one unit of work once* ("generate this thumbnail"), reach for a queue. If it is a *fact that many parties care about and might re-read* ("order #123 was placed"), reach for a log. Plenty of real systems use both: Kafka as the event backbone, a queue like SQS for discrete worker jobs.

## Two ways to deliver: point-to-point vs pub/sub

Separate from the queue-versus-log choice, there are two ways a message can reach consumers.

**Point-to-point (competing consumers):** one message goes to exactly one of several workers. This is how you *parallelize* work. Put ten workers on a queue and each message is handled once by whichever worker is free. Add workers, get more throughput.

**Publish/subscribe (fan-out):** one message goes to *every* subscriber. This is how you *decouple* independent reactions to the same fact. An "order placed" event fans out to the email service, the inventory service, and the analytics service, each reacting on its own.

Kafka does both with the **consumer group**. Consumers in the *same* group compete (each partition goes to one member, so work splits up). Consumers in *different* groups each see the full stream (so they fan out). RabbitMQ expresses the same idea with exchanges, and on AWS, SNS publishing to multiple SQS queues is the classic cloud fan-out.

The simple way to remember it: **competing consumers scale throughput, pub/sub decouples reactions.**

## Inside Kafka: partitions, offsets, and consumer groups

Kafka gets probed hard in design reviews, so it is worth understanding the moving parts.

A **topic** is a named stream of events. Each topic is split into **partitions**, and the partition is the unit of three things at once: parallelism, ordering, and storage. Each partition is an ordered, append-only sequence of records, each stamped with an increasing offset (0, 1, 2, and so on).

Here is the rule that trips people up: **a topic with 6 partitions can be drained by at most 6 active consumers in a group.** A seventh consumer just sits idle. Partition count is your throughput ceiling, and while you can add partitions later, doing so scrambles which key lands on which partition. So pick a number that fits your *future peak* parallelism, with headroom.

Consumers record progress by **committing offsets**. The trickiest part is *when* you commit relative to *when* you actually finish the work:

- **At-least-once:** process the message, *then* commit. If you crash in between, you reprocess on restart, so you might get a **duplicate**. This is the safe default.
- **At-most-once:** commit first, then process. If you crash in between, the message is **lost** forever. Rarely acceptable.

A common mistake is leaving `enable.auto.commit=true`, which commits on a timer regardless of whether the work finished. That quietly causes both duplicates and loss. For correctness, turn auto-commit off and commit explicitly after the work is done.

### The durability dial

Each partition has one leader replica and several followers. When a producer sends a message, the `acks` setting controls how many replicas must confirm before the write counts:

- `acks=0`: fire and forget. Fastest, loses data on any hiccup.
- `acks=1`: the leader confirmed. Loses data if the leader dies before followers catch up.
- `acks=all`: every in-sync replica confirmed. No loss as long as one in-sync replica survives.

But `acks=all` alone has a trap. If the set of in-sync replicas shrinks to just the leader, "all" means "the one." Pair it with **`min.insync.replicas=2`** so a write fails fast instead of silently risking loss. Also set **`unclean.leader.election.enable=false`**, or a stale replica can be promoted to leader and silently throw away committed data.

### Keeping the latest value: compaction

Kafka has two ways to remove old data, and they get confused constantly.

**Retention** simply drops messages older than a time or size limit (7 days by default). Good for events and time-series data.

**Compaction** keeps the *latest value for each key* and garbage-collects the older versions. This turns the log into a durable snapshot of current state, like "the latest status of every order, keyed by order ID." A message with a `null` value acts as a tombstone that deletes the key entirely.

## Ordering and the partition key, the most consequential choice you'll make

Kafka guarantees order *only within a partition*. Across partitions, anything goes. Messages with the same key always land on the same partition, so they stay in order relative to each other. That makes the **partition key** the single most important design decision in an event-driven system.

- **Order matters per entity?** Key by that entity. All events for `order_123` go to one partition and apply in sequence, so a "shipped" status never overtakes "paid." The cost: a very active entity can hot-spot one partition.
- **Order does not matter and you want max parallelism?** Key by something high-cardinality and evenly spread, or use no key at all.

The classic landmine is the **hot partition**. In a multi-tenant app, keying by `tenant_id` sounds reasonable, until your single biggest customer saturates one partition while five others sit idle. The fix is a composite key like `tenant_id:order_id` when per-order ordering is enough, or salting the key to spread the load.

There is also a subtle producer gotcha: even *single-partition* order can break on retry. If a failed batch is retried after a later batch already succeeded, records get reordered, unless you enable the idempotent producer (`enable.idempotence=true`), which lets Kafka preserve order using sequence numbers.

## Delivery guarantees, and the honest truth about exactly-once

There are three delivery semantics:

- **At-most-once:** no duplicates, but messages can be lost. Fine for disposable metrics.
- **At-least-once:** no loss, but duplicates are possible. The sensible default.
- **Exactly-once:** no loss, no duplicates. What everyone wants for money and other costly side effects.

Here is the part senior engineers will tell you and junior ones resist: **true exactly-once delivery over a network is impossible.** This is the Two Generals problem. A sender can never *know* its message arrived without an acknowledgment, and the acknowledgment itself can get lost, so the sender must retry, so duplicates are inevitable on the wire.

What you build instead is **effectively-once processing**: accept that you will get duplicates, and make your consumer *idempotent* so handling the same message twice has the same effect as handling it once.

### Idempotent consumers, the technique you'll actually use

This is the real-world workhorse. Two approaches:

1. **Dedupe on a business key.** Store each `event_id` in a `processed_events` table with a unique constraint. If it is already there, skip it.
2. **Design operations that are naturally repeatable.** `SET status = 'paid'` is idempotent: run it twice, same result. `balance = balance + 10` is *not*: run it twice and you have a bug.

### What Kafka's exactly-once actually covers

Kafka does offer genuine exactly-once, but only *within Kafka*. Its idempotent producer drops duplicate retried batches, and its transactions can atomically write to multiple partitions and commit offsets together, which makes the consume-process-produce loop safe.

The crucial caveat: **the moment your consumer touches something outside Kafka**, a Postgres write, a Stripe charge, an email, Kafka transactions stop covering it. For that boundary you still need an idempotency key or the transactional outbox pattern. Do not let "Kafka has exactly-once" lull you into double-charging a customer.

## Backpressure, retries, and dead-letter queues

### When producers outrun consumers

What happens when messages arrive faster than they can be processed?

In a **log like Kafka**, the backlog just sits on cheap disk. The warning sign is **consumer lag**, how far behind the head a consumer is. Watch the *trend*: rising lag means your consumers are losing the race.

In a **queue like RabbitMQ**, an unbounded queue swells in memory until the broker hits a limit and starts blocking publishers. Use bounded queues with an overflow policy, and set consumer **prefetch** so one greedy consumer does not hoard thousands of unacknowledged messages.

The deeper lesson: an unbounded queue in front of a slow database hides the problem until storage fills, and then *everything* upstream blocks at once, a sudden collapse. As the saying goes, **an unbounded queue is a memory leak with extra steps.** Bounded buffers that shed load fail gracefully instead.

### Retry with backoff and jitter

When something fails transiently, do not hammer the struggling downstream. Back off exponentially, doubling the wait each attempt. And **always add jitter**, a random spread to the delay.

Why? Without jitter, ten thousand clients that all failed at the same instant will all retry at exactly t+1s, then t+2s, forming synchronized spikes that re-crash the recovering service. AWS's well-known "Exponential Backoff and Jitter" study found that **full jitter**, picking a random delay between zero and the computed backoff, minimizes both contention and total completion time. Also cap the number of attempts; retrying a permanent error forever is just a busy loop in disguise.

### Dead-letter queues and poison messages

A **poison message** can never succeed, maybe the payload is malformed, or it references a row someone deleted. Retrying it forever blocks everything behind it and wastes CPU.

The fix: after N failed attempts, route it to a **dead-letter queue (DLQ)** and move on. SQS does this natively with a redrive policy. RabbitMQ uses a dead-letter exchange. Kafka has no built-in DLQ, so you publish failed records to a separate topic yourself, and critically, you commit past the poison record so it does not stall every key behind it.

One discipline matters above all: **a DLQ that nobody watches is a black hole where data dies silently.** Alarm on its depth, store the failure reason on each message, and build a path to replay messages back to the main queue once you have fixed the bug.

## Common misconceptions

**"We enabled Kafka exactly-once, so we are safe."** Only for the Kafka-to-Kafka path. External side effects like charging a card are not covered, and a rebalance that reprocesses messages will double-charge unless that call is idempotent.

**"Kafka is just a faster database."** It is a log, not a queryable store. Scanning a topic to find a record, or keeping infinite retention as your "source of truth," is fighting the tool. Pair it with a real database or use compaction deliberately.

**"More partitions are always better."** Each partition adds file handles, replication overhead, and longer rebalances. Thousands per broker degrade failover. Size for the parallelism you need plus headroom, not "as many as possible."

**"The broker is my bottleneck."** Almost never. The real limit is usually the database or API your consumer writes to. A faster broker just fills your database's queue sooner.

**"A single partition guarantees order, so I'm fine."** Not if the idempotent producer is off and retries are on, a retried batch can overtake a newer one and apply stale data.

## How to use this

Here is a practical checklist when you design or review an event-driven system:

1. **Classify the message first.** Is it a *command* (do this once) or a *fact* (many care, may re-read)? That single question points you at a queue or a log.
2. **Choose the partition key deliberately.** Decide whether per-entity ordering or maximum parallelism matters more, and watch for hot keys like `tenant_id`. Use a composite or salted key when one entity dominates.
3. **Make every consumer idempotent.** Dedupe on a business key or use naturally repeatable operations. Assume duplicates will happen, because they will.
4. **Set the durability dial on purpose.** For data you cannot lose, use `acks=all`, `min.insync.replicas=2`, and disable unclean leader election.
5. **Commit offsets after processing, not before.** Turn off auto-commit so a crash cannot skip unprocessed messages.
6. **Bound your queues and add backpressure.** Prefer pull-based consumption or set prefetch limits, and never let a queue grow without a ceiling.
7. **Retry with exponential backoff plus full jitter,** cap the attempts, and route exhausted messages to a DLQ.
8. **Own your DLQ.** Alarm on its depth, capture the failure reason, and build a redrive path before you need it.

## Conclusion

The whole field comes down to one decision dressed up in different clothes: do you want a **queue** that hands each message to one worker and forgets it, or a **log** that remembers everything so many readers can replay it at their own pace? Almost every other choice, ordering, delivery guarantees, scaling, follows from that.

LinkedIn made exactly this call in 2010. Drowning in point-to-point pipelines, they realized their events were *facts*, not *commands*, and built a replayable log instead of a destructive queue. That log became Apache Kafka, and it now carries trillions of messages a day across the industry.

But a log that remembers everything raises a sharper question that money and correctness depend on: when a message must not be lost *and* must not be double-counted, how do you make a write to your database and a publish to your stream succeed or fail together? That is the dual-write problem, and the transactional outbox pattern that solves it, which is where this story goes next.
