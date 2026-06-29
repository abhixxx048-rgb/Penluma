---
title: "Stream Processing Explained: React the Moment Data Arrives"
metaTitle: "Stream Processing Explained Simply"
description: "Learn how stream processing reacts to data the instant it arrives. Event time, watermarks, exactly-once, Lambda vs Kappa, and real pipelines made simple."
keywords:
  - stream processing
  - real-time data processing
  - event time vs processing time
  - watermarks streaming
  - exactly-once processing
  - Lambda vs Kappa architecture
  - Apache Flink
  - Kafka Streams
  - windowing in stream processing
  - stream-table duality
  - late data handling
  - real-time fraud detection
faq:
  - q: What is the difference between batch and stream processing?
    a: Batch processing runs over a fixed chunk of data with a known start and end, like a nightly report. Stream processing runs continuously over data that never stops arriving, updating results within milliseconds to seconds as new events flow in.
  - q: What is the difference between event time and processing time?
    a: Event time is when something actually happened, stamped on the event by its producer. Processing time is when your system finally sees it. They diverge because of network delays and offline devices, and using event time is what makes your results reproducible.
  - q: What is a watermark in stream processing?
    a: A watermark is the engine's best guess that it has now seen all events up to a certain point in time. When the watermark passes the end of a time window, the engine emits that window's result and can free its memory.
  - q: Does exactly-once mean an event is never delivered twice?
    a: No. Networks can always deliver the same message twice. Exactly-once means the effect, your stored state and output, reflects each event exactly once, even if it was physically delivered multiple times.
  - q: What is the difference between Lambda and Kappa architecture?
    a: Lambda runs two pipelines, a slow accurate batch one and a fast approximate streaming one, which means maintaining the same logic twice. Kappa keeps only the streaming pipeline and reprocesses by replaying the log, avoiding the duplicate-code problem.
  - q: When should I use stream processing instead of a nightly batch job?
    a: Use streaming when stale data costs money or safety, such as fraud detection, live dashboards, leaderboards, and alerting. Stick with batch for daily reports, model training, and backfills that tolerate hours of lag.
author: Pritesh Yadav
topic: system-design
topicTitle: System Design
category: Engineering
date: '2026-06-15'
order: 14
icon: "\U0001F3D7️"
transformed: true
sources: []
---

A trip happens in San Francisco at 14:03. The driver's phone is in a parking garage, so the event sits buffered and arrives at your servers at 14:09. Now answer a simple question: how many trips happened between 14:00 and 14:05?

If your system counts events as they arrive, you just got the wrong answer. Worse, you'd get a *different* wrong answer if you ran the same data again tomorrow. This is the whole drama of real-time systems in one example, and it's why stream processing exists as its own craft.

This article walks you through that craft, from the big mental model down to the specific tricks that make live pipelines correct instead of merely fast.

## Why this matters

Most software waits. It collects a pile of data, then runs a job at midnight to make sense of it. That's fine for a sales report nobody reads until morning.

But some decisions can't wait. A fraudulent card has to be blocked **before** the charge settles, not flagged in tomorrow's report. A surge-pricing signal that's an hour old is useless. A live leaderboard that updates once a day isn't a leaderboard.

Stream processing is how you react to information the instant it arrives. Get it right and you unlock fraud detection, live dashboards, alerting, and real-time personalization. Get it wrong and you ship numbers that are jittery, irreproducible, and quietly off by a few percent in ways that only surface when finance reconciles the books. The difference between those two outcomes is a handful of ideas you can actually learn.

## From snapshots to a river

Here's the cleanest way to feel the difference.

**Batch is a photograph.** You gather a bounded chunk of data, like yesterday's orders, run a job over the whole thing, and emit a result. There's a known start and a known end. A nightly report cron job is batch.

**A stream is a river.** Data never stops. There is no "end of input," so you can't wait for "all the data" because there is no "all." Instead you run a *standing query* that consumes events forever and continuously updates its output.

The easy part is processing events one at a time. A simple loop does that. The hard part is doing **stateful math over time** correctly, things like "count failed logins per user in any 5-minute window," when events show up out of order, arrive late, get duplicated, and your machine crashes halfway through.

Here's a quick comparison of when each fits:

| | Batch | Stream |
|---|---|---|
| Input | Bounded, known end | Unbounded, never ends |
| Latency | Minutes to hours | Milliseconds to seconds |
| Correctness | Easy, you see all the data | Subtle, time and ordering bite |
| Best for | Daily reports, model training, backfills | Fraud, leaderboards, alerts, live dashboards |

One lovely insight ties them together: **batch is just a special case of streaming**, a stream that happens to end. A well-built streaming engine can run batch jobs by treating a file as a finite stream. That's why "unify batch and streaming" became an industry goal, and why engines like Apache Flink are built on exactly this premise.

## Two ways to build it: Lambda vs Kappa

Early streaming engines were fast but only gave *approximate* answers. So one popular design, called **Lambda architecture**, ran two pipelines side by side:

- A **batch layer** that recomputed everything from scratch, accurate but slow (hours).
- A **speed layer** that processed recent events fast but approximately.

A serving layer merged them: old accurate data from batch, recent fast data from the speed layer. The batch results periodically overwrote the approximations.

It works, but it has a fatal flaw. You write and maintain **the same business logic twice**, once in a batch framework and once in a streaming framework, often in different languages with different rules. The two versions drift apart. Your dashboard flickers when the batch view overwrites the speed view because they rounded or deduplicated slightly differently. This is operational misery.

**Kappa architecture** deletes the batch layer entirely. The bet: if your stream engine is correct and your log (think Kafka) keeps enough history, you never needed batch. To "reprocess" data, you replay the log from the beginning through a new version of your job into a fresh output table, then swap over.

One codebase. One set of semantics. No divergence bugs. Today, with engines that give correct results and cheap long-term log storage, **Kappa is the default recommendation for new systems.** Lambda mostly survives in legacy stacks.

## The deepest idea: event time vs processing time

If you remember one thing from this article, make it this. It's the concept that separates toy stream code from production-grade pipelines.

- **Event time** is when the event *actually happened*. The producer stamps it: "user clicked at 14:03:01."
- **Processing time** is when your system *finally sees* the event. The worker's wall clock: "I read this at 14:07:22."

These two drift apart constantly, because of network lag, queueing, retries, phones going offline, and backpressure. A phone in a tunnel buffers events and dumps them twenty minutes later. Same event time, wildly later processing time.

Why does this matter so much? Because "count purchases between 14:00 and 14:05" only has a stable meaning if it means *event* time. If you bucket by processing time, your numbers become nondeterministic. Run the job again on the identical data and you get different counts, because arrival timing changed. **Processing-time windows are not reproducible.**

The rule of thumb:

- Use **event time** for anything where correctness matters.
- Use **processing time** only when you genuinely mean "what I happen to have seen so far," like a rough system-health counter where exactness doesn't matter.

The price of event time is that events arrive out of order and late. A window for 14:00 to 14:05 might still receive a straggler at 14:09. So when do you decide the window is done and emit a result? That's the next idea.

## Slicing the river into windows

You can't aggregate an infinite stream, so you cut it into finite **windows**. There are a few shapes worth knowing:

- **Tumbling windows** are fixed-size and non-overlapping. "Revenue per 1-minute bucket." Every event lands in exactly one window.
- **Sliding windows** are fixed-size but overlap. "Failed logins in the last 5 minutes, updated every 1 minute." An event can belong to several windows at once.
- **Session windows** are gap-based and dynamic. "A user's browsing session, closed after 30 minutes of inactivity." Their boundaries depend on the data itself.

A practical warning on sliding windows: a 24-hour window sliding every minute means each event technically belongs to 1,440 overlapping windows. A naive implementation explodes your memory. Good engines compute small partial aggregates once per slide interval and combine them, so each event is processed once, not 1,440 times.

Session windows are the trickiest, because a single late event can **merge two existing sessions into one**. The engine has to support that merging in its state storage.

## Watermarks: deciding when a window is done

A **watermark** is the engine making a promise: *"I believe I've now seen all events with a timestamp at or before time T."* It's a moving marker on event time that flows through the pipeline alongside the real data.

When the watermark passes the end of a window, the engine fires that window, emits its result, and can free the memory.

But here is the unavoidable tension, and there's genuinely no free lunch:

| Watermark strategy | Latency | Completeness |
|---|---|---|
| **Aggressive** (small lag) | Low, fires fast | Lower, more late events miss the window |
| **Conservative** (large lag) | High, holds windows open longer | Higher, catches more stragglers |

When data can be arbitrarily late, you simply cannot have both instant results and full completeness. You choose. Most teams pick a **bounded out-of-orderness** rule: set the watermark to the latest event time seen minus a fixed delay, say 30 seconds. Simple and effective.

What about events that arrive *past* the watermark, the true latecomers? You have three options:

1. **Drop them.** The default. Totally fine for a dashboard where losing 0.1% of events is irrelevant.
2. **Send them to a side channel.** Route late events to a dead-letter stream for separate handling or a later backfill.
3. **Keep the window alive and emit a correction.** Hold the window's state a bit longer, and when a late event lands, re-fire and emit an updated result. This is the gold standard for correctness, but it needs a downstream store that can handle updates.

## Surviving crashes: state, checkpoints, and exactly-once

A stateless step like a filter is trivial to recover. Just reprocess. The hard part is **stateful** operators, the counts, windows, joins, and dedup sets that accumulate memory which must survive a crash.

Engines keep this state in a fast local key-value store next to each worker. Flink, for example, uses RocksDB so state can spill beyond RAM. The challenge: if a worker dies, you must restore its memory *and* resume reading input at exactly the right spot, so you neither lose events nor count them twice.

The elegant trick is **barrier checkpointing** (based on a classic 1985 distributed-systems algorithm by Chandy and Lamport). The source periodically injects a special "barrier" marker into the stream. When an operator sees the barrier on all its inputs, it snapshots its own state to durable storage and passes the barrier downstream. When every operator has acknowledged, that checkpoint is complete. On a crash, everyone restores to the last checkpoint and rewinds the input to match.

The beauty is that the barrier carves a consistent snapshot **without stopping the data flow**, and the snapshots are written in the background, so throughput barely dips.

### What "exactly-once" actually means

This phrase confuses almost everyone, so let's be precise.

Networks duplicate messages. "Exactly-once *delivery*" is impossible in general. What good systems actually give you is **exactly-once *effect***: your stored state and output reflect each event exactly once, even though the event might be physically delivered several times.

You get there with two pieces:

- **Checkpointed state** that rewinds atomically, which keeps your internal state exactly-once.
- **A well-behaved sink**, which is the part people forget. Either make writes **idempotent** (key by a deterministic ID so a replay overwrites instead of duplicating) or use a **transactional sink** that commits only when the checkpoint completes.

That second point is the crucial misconception buster, so it gets its own section.

## Common misconceptions

**"Exactly-once means my database never sees a duplicate."** No. It means exactly-once *effect*. If your sink isn't idempotent or transactional, a crash-and-replay will happily write duplicates, no matter what the engine guarantees internally.

**"Processing time is good enough."** Until someone backfills the same data and gets different per-window counts, and nobody can explain why. Default to event time for anything correctness-sensitive.

**"Dropping a few late events is harmless."** One mobile-heavy product had 4% of events arriving past its 30-second watermark. Revenue dashboards quietly undercounted for weeks until finance caught it. If you drop late data, at least *count* what you drop and alert on it.

**"A stream join is just like a SQL join."** A SQL join assumes both sides are finite. Join two unbounded streams without a time window and you must remember every event forever, which guarantees an out-of-memory crash. Stream-stream joins must be windowed.

**"Batch and streaming are fundamentally different worlds."** Batch is just a bounded stream. Modern engines run both with one model.

## A mental model that ties it together: stream-table duality

This is the single most useful idea in modern stream processing, and it's surprisingly simple.

- A **stream** is a log of *changes*: "balance += 5", "balance -= 3", "balance += 1".
- A **table** is a *snapshot*: the current state after folding all those changes together, "balance = 3".

They're two views of the same thing. A changelog and a materialized state.

- **Stream to table:** aggregate the stream by key, a `GROUP BY` that never ends, and you get a continuously updated table. That's a **materialized view**.
- **Table to stream:** emit the table's change events as they happen. That's exactly what change-data-capture tools do when they tail a database's write log.

This duality is why "materialized-view databases" exist. You write a SQL `SELECT ... GROUP BY`, and the engine keeps the result table incrementally up to date as the input changes, with no manual refresh. Under the hood it's a streaming job; the SQL is just a friendlier surface.

## How to use this

When you sit down to design a real-time pipeline, walk through these steps in order:

1. **Decide if you even need streaming.** If hours of lag is acceptable (daily reports, model training, backfills), use batch. It's simpler and cheaper. Reach for streaming only when stale data costs money or safety.
2. **Default to Kappa, not Lambda.** One codebase over a replayable log. Only split into two pipelines if your batch logic genuinely must differ.
3. **Always use event time for correctness-sensitive aggregates.** Reserve processing time for rough "what I've seen so far" counters.
4. **Set a finite, sane watermark.** Pick a bounded out-of-orderness delay (e.g., 30 seconds). Never run with no watermark, or your state grows forever and the job dies of memory exhaustion.
5. **Measure your late data.** Emit a late-records counter and alert on it. Silent loss is how dashboards quietly lie.
6. **Window every stream-stream join.** Pick the window from the business need: too small misses real matches, too large explodes memory.
7. **Make your sink idempotent or transactional.** This is what turns "exactly-once" from a slogan into a guarantee. Key writes by a deterministic ID and upsert.
8. **Watch for hot keys.** A single viral item or whale user can route most events to one worker. Salt the key and aggregate in two stages, or use approximate sketches to bound memory.

### Picking an engine

A quick cheat sheet for the common choices:

- **Apache Flink** for serious, low-latency, large-state work and complex event patterns. The power tool.
- **Kafka Streams** when you want streaming embedded inside a microservice with no separate cluster to operate.
- **Spark Structured Streaming** when you're already a Spark shop and can tolerate slightly higher latency.
- **A SQL-over-streams engine** (Flink SQL, ksqlDB, Materialize) when SQL ergonomics matter more than raw control, and you want materialized views without the plumbing.

## How the giants do it

To see all of this working at once, look at how a large ride-hailing platform runs its real-time pipeline. Its marketplace is a feedback loop measured in seconds: surge pricing, ETAs, driver-rider matching, fraud checks, and city-ops dashboards all need fresh aggregates over an enormous flood of events, on the order of trillions of messages a day.

The events come from phones, the worst possible source for timing. A driver in a garage or a rider on the subway buffers location pings and trip events, then dumps them minutes later. So the platform standardized on **event time** for every correctness-sensitive number. A trip that happened at 14:03 but arrived at 14:09 still lands in the 14:03 bucket, which keeps replays reproducible and stops surge pricing from chasing phantom demand.

Demand and supply metrics run as **event-time tumbling and sliding windows**. Because phones are late, the platform uses **bounded watermarks** and routes stragglers to a **late-data side output** instead of dropping them silently. The trade-off they consciously accepted is the exact one from the watermark table: a few extra seconds of dashboard latency in exchange for counts that are correct and reproducible. When the numbers drive pricing and money, "a bit late but right" beats "instant but undercounting."

Large per-region and per-card state lives in Flink's RocksDB backend so it can outgrow RAM, and **barrier checkpointing** gives exactly-once effect even when workers die mid-window, with idempotent upsert sinks keyed by a deterministic ID. The whole thing is **Kappa**: Kafka is the replayable log, and reprocessing means replaying from an earlier offset through a new job version. To make this usable, they built a layer that compiles **SQL into managed Flink jobs**, leaning directly on stream-table duality so a non-specialist can ship a correct stateful pipeline. The result: time-to-ship dropped from weeks to hours, with second-scale end-to-end latency and the Lambda dual-maintenance tax gone entirely.

The lesson worth stealing: if your producers are phones, design for event time, bounded watermarks, and a *measured* late-records side output from day one. Never assume on-time arrival.

## Conclusion

The single takeaway: in a stream, **time is not when you saw the data, it's when the data happened**, and respecting that distinction is what separates pipelines that are merely fast from pipelines that are actually correct. Everything else, watermarks, windows, checkpoints, exactly-once, exists to honor event time despite a messy, delayed, duplicating world.

Once that clicks, a natural next question appears. If a stream and a table are really the same thing seen two ways, why do we still keep separate databases and streaming systems at all? That idea, sometimes called "turning the database inside out," is where stream processing stops being a tool and starts reshaping how whole systems are built. That's the rabbit hole worth falling into next.
