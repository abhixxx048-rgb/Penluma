# 14 · Stream Processing & Real-Time Systems

**What you'll learn:** How to process unbounded data continuously instead of in nightly batches - the architectures (Lambda vs Kappa), the deep semantics of *time* (event time vs processing time, watermarks, late data), how to do windowed aggregations correctly, and how systems like Flink and Kafka Streams deliver *exactly-once* results despite crashes. You'll leave able to reason about a fraud-detection or leaderboard pipeline the way a staff engineer or an interviewer would.

**Prerequisites:** Read `02-data-models-storage.md` (logs, LSM trees), `06-replication-consistency.md` (log-based replication), `11-messaging-event-driven.md` (Kafka, partitions, offsets, delivery semantics), and ideally `09-cap-pacelc...md`. Stream processing *is* event-driven architecture with stateful operators bolted on - module 11 is the foundation.

---

## 1. Intuition: from snapshots to a river

A **batch** job is a photograph. You collect a bounded chunk of data (yesterday's orders), run a job over the whole thing, and emit a result. The input has a known start and end. MapReduce, Spark, your nightly `php artisan report:generate` cron - all batch.

A **stream** is a river. Data never stops arriving; there is no "end of input." You can't wait for all the data because there is no "all." Instead you run a *standing query* that continuously consumes events and continuously updates output. Think of a Laravel queue worker that never drains and maintains running totals in memory - that's the seed of stream processing.

The hard part isn't "process events one at a time" (a `for` loop does that). The hard part is doing **stateful aggregations over time** - "count failed logins per user in any 5-minute window" - *correctly*, when events arrive out of order, late, or duplicated, and when your processing node crashes mid-window.

```
BATCH                              STREAM
 ┌──────────┐                       events ──┬──┬──┬──┬──┬──►  (never ends)
 │ bounded  │  run once             ─────────┴──┴──┴──┴──┴──
 │ dataset  │ ─────────► result     standing query continuously
 └──────────┘                       updates output as events flow
 latency: minutes–hours             latency: ms–seconds
```

---

## 2. Batch vs Stream - the real trade-off

| Dimension | Batch | Stream |
|---|---|---|
| Input boundary | Bounded (known end) | Unbounded |
| Latency | Minutes to hours | Milliseconds to seconds |
| Reprocessing | Trivial - rerun the job | Hard - must replay the log |
| Correctness model | Easy (you see all data) | Subtle (time, ordering, late data) |
| Throughput efficiency | Very high (sequential scans) | High but per-event overhead |
| Failure recovery | Re-run from input | Checkpoint + replay |
| **When to use** | Daily reports, ML training, backfills, anything tolerant of hours of lag | Fraud detection, leaderboards, alerting, live dashboards, anything where staleness costs money |

Key insight (Tyler Akidau, *The Dataflow Model*): **batch is a special case of streaming** - a bounded stream. A well-designed stream engine can run batch jobs by treating a file as a finite stream. Flink and Beam are built on exactly this premise; this is why "unify batch and streaming" became the industry goal.

---

## 3. Lambda vs Kappa architecture

Early streaming engines (Storm, ~2011) were fast but gave only *approximate*, at-least-once results. So Nathan Marz proposed **Lambda**: run two pipelines.

```
LAMBDA
                    ┌─────────── BATCH layer (Hadoop/Spark) ───────┐
                    │  recompute everything from raw log,          │
 raw events ──┬────►│  accurate but slow (hours)  ──► batch views  │──┐
              │     └──────────────────────────────────────────────┘  │  serving
              │     ┌─────────── SPEED layer (Storm/Flink) ───────┐    ├─ layer ─► query
              └────►│  process recent events, fast but approximate │────┘  (merge)
                    │  ──► realtime views (last few hours)         │
                    └──────────────────────────────────────────────┘
```

The serving layer merges: "old data from the accurate batch view + recent data from the fast speed view." The batch layer periodically overwrites the speed layer's approximations.

**The fatal flaw of Lambda:** you write and maintain *the same business logic twice* - once in your batch framework, once in your stream framework, in different languages with different semantics. Bugs diverge. This is operational hell.

**Kappa** (Jay Kreps, 2014) deletes the batch layer. Insight: if your stream engine is correct (exactly-once) and your log (Kafka) retains enough history, you don't need batch at all. To "reprocess," you just **replay the log from offset 0 through a new version of your stream job** into a new output table, then switch over.

```
KAPPA
 raw events ──► Kafka (durable, replayable log) ──► stream job ──► serving store
                         │
                         └─ to reprocess: spin up job v2 from offset 0 → new table → swap
```

| | Lambda | Kappa |
|---|---|---|
| Codebases | Two (batch + stream) | One (stream) |
| Reprocessing | Re-run batch | Replay log |
| Complexity | High (merge logic, dual maintenance) | Lower, but needs long log retention + exactly-once engine |
| Storage cost | Batch storage | Long Kafka retention (tiered storage helps) |
| **When to use** | Legacy, or batch logic genuinely differs from stream | Default for new systems with a modern engine (Flink) |

Today, with Flink/Beam giving correct exactly-once streaming and Kafka tiered storage making long retention cheap, **Kappa is the default recommendation**. Lambda survives mostly in legacy stacks.

---

## 4. The deepest idea: event time vs processing time

This is *the* concept that separates toy stream code from production-correct pipelines, and the one interviewers probe.

- **Event time** - when the event *actually happened* (timestamp baked into the event by the producer: "user clicked at 14:03:01").
- **Processing time** - when your operator *observes* the event (wall clock on the worker: "I read this at 14:07:22").

These diverge because of network delay, queueing, retries, mobile devices going offline, partition rebalancing, and backpressure. A phone in a tunnel buffers events and dumps them 20 minutes later - same event time, wildly later processing time.

```
event time:   |--e1--e2--e3--e4--e5--►   (true order, true timestamps)
                        ╲   ╲ ╲    ╲
network/queue delays     ╲   ╲ ╲    ╲
                          ▼   ▼ ▼    ▼
proc. time:   |--e1------e3--e2----e5--e4►  (out of order, delayed)
```

**Why it matters:** "Count purchases between 14:00 and 14:05" must mean *event* time, or your numbers are nondeterministic - rerun the job tomorrow on the same data and you'd get different bucketing because processing time changed. **Processing-time windows are non-reproducible.** Use event time for any correctness-sensitive aggregation; processing time only when you genuinely mean "what I've seen so far" (e.g., coarse system-health counters where exactness doesn't matter).

The price of event time: events arrive **out of order** and **late**, so a window for [14:00, 14:05) may still receive a member at processing-time 14:09. When do you *close* the window and emit a result? Enter watermarks.

---

## 5. Windowing

You can't aggregate an infinite stream; you slice it into finite **windows**.

| Window type | Shape | Example use |
|---|---|---|
| **Tumbling** | Fixed size, non-overlapping, contiguous | "Revenue per 1-minute bucket" |
| **Sliding (hopping)** | Fixed size, fixed slide < size → overlap | "Failed logins in last 5 min, updated every 1 min" |
| **Session** | Dynamic - gap-based; closes after N idle seconds | "User browsing session" (close after 30 min inactivity) |
| **Global** | One window, all time; needs a custom trigger | Custom triggering logic |

```
TUMBLING (size 5):  [0-5)[5-10)[10-15)        each event in exactly one window

SLIDING (size 10, slide 5):
                    [0-10)
                       [5-15)
                          [10-20)              an event belongs to MULTIPLE windows

SESSION (gap 5):    e e e   ....gap....   e e        two sessions (gap broke them)
                    └─sess A─┘            └sess B┘
```

Back-of-envelope on sliding-window cost: a 24-hour sliding window with a 1-minute slide means each event is replicated into `1440` window panes - naive implementations blow up memory. Production engines use **pane/incremental aggregation**: compute per-slide-interval partial aggregates once and combine them, so an event is processed once, not 1440 times.

Session windows are the hardest because their boundaries are data-dependent: a late event can *merge two existing sessions into one*. The engine must support window merging in its state backend.

---

## 6. Watermarks & late data

A **watermark** is the engine's assertion: *"I believe I have now seen all events with event-time ≤ T."* It's a moving low-water mark on event time that flows through the pipeline as a special record interleaved with data.

When the watermark passes the end of a window, the engine fires (emits) that window's result and (optionally) frees its state.

```
                 watermark W advances ──►
event times: 14:00  14:01  14:03  14:02  14:04  | W=14:05 → fire window [14:00,14:05)
                                   ▲ out of order but still ≤ W, included
later:       14:04(LATE, arrives after W) ──► dropped or sent to side output
```

**The fundamental trade-off - there is no free lunch:**

| Watermark strategy | Latency | Completeness | Risk |
|---|---|---|---|
| Aggressive (small lag, e.g. W = max_seen − 2s) | Low - fire fast | Lower - more late events miss the window | Wrong/incomplete results |
| Conservative (large lag, e.g. − 5min) | High - hold windows open longer | Higher - catch stragglers | Stale results, more state held |

You cannot have both low latency and full completeness when data can be arbitrarily late - this is a direct consequence of the unbounded-delay reality. Practical heuristics:

- **Bounded-out-of-orderness**: `watermark = maxEventTime − fixedDelay` (e.g. 30s). Simple, what most teams use.
- **Percentile/adaptive** watermarks: learn the lateness distribution.

**Handling late data (events past the watermark):**
1. **Drop** - default; fine for dashboards where 0.1% loss is irrelevant.
2. **Side output / dead-letter** - route late events elsewhere for separate handling or backfill.
3. **Allowed lateness + updates** - keep window state alive `allowedLateness` past the watermark; re-fire and *emit a correction* (retraction/update) when a late event lands. This needs a downstream sink that can handle updates (upsert), which connects to stream-table duality (§8). Flink and Beam both support this; it's the gold standard for correctness.

The **trigger** (when to emit) is orthogonal to the window (how to bucket): you can emit early/speculative results before the watermark, then a final result at the watermark, then late updates after - the *Dataflow* model's "what/where/when/how" decomposition (what to compute / where in event time / when to fire / how refinements relate).

---

## 7. Stateful processing, checkpointing & exactly-once

A stateless operator (filter, map) is trivial to recover - just reprocess. A **stateful** operator (counts, windows, joins, dedup sets) holds accumulated state that must survive crashes. This is where streaming gets genuinely distributed-systems-hard.

**State backend:** local, embedded key-value store per operator instance. Flink uses **RocksDB** (an LSM tree - see `02-data-models-storage.md`) for state that exceeds RAM, or a heap backend for small state. State is partitioned by key, co-located with the operator processing that key.

**The recovery problem:** if a worker dies, you must restore its state *and* resume input at a consistent point, so you neither lose nor double-count events.

**Checkpointing (Flink - the Chandy-Lamport asynchronous barrier snapshot algorithm):**

```
Source injects a "barrier" into the stream every N ms:
 ──e──e──[BARRIER n]──e──e──[BARRIER n+1]──►
Each operator, on receiving barrier n on ALL its inputs:
  1. snapshots its own state (async, to durable store: S3/HDFS)
  2. forwards barrier n downstream
When all operators + sinks ack barrier n → checkpoint n is COMPLETE & durable.
On crash: restore all state to checkpoint n, rewind source offsets to barrier n.
```

The barrier "cuts" the stream into a consistent global snapshot *without stopping data flow* - that's the elegance of Chandy-Lamport. Snapshots are written asynchronously so throughput barely dips.

**Exactly-once: what it actually means.** Networks duplicate; "exactly-once *delivery*" is impossible in general. What systems deliver is **exactly-once *processing semantics* / effect** - the *state and output* reflect each event exactly once, even though the event may be physically delivered multiple times. Achieved by:

- **Checkpointed state** rewound atomically (above) → internal state is exactly-once.
- **For external sinks**, you need one of:
  - **Idempotent writes** - keying by a deterministic id so a replay overwrites rather than duplicates (upsert into Postgres/Cassandra). Easiest, most common.
  - **Transactional / two-phase-commit sink** - pre-commit on checkpoint, commit on checkpoint-complete (Flink's `TwoPhaseCommitSinkFunction`; Kafka transactions with `read_committed`). End-to-end exactly-once, but adds latency and requires a transactional sink.

| Delivery semantic | Mechanism | Cost | When |
|---|---|---|---|
| At-most-once | Fire and forget | Cheapest | Lossy-tolerant metrics |
| At-least-once | Ack + retry, no dedup | Cheap | Idempotent downstream, or dupes OK |
| Exactly-once (effect) | Checkpoint + idempotent/txn sink | Higher latency, more coordination | Money, billing, fraud, counts that must be right |

War story baseline: Kafka Streams achieves exactly-once via Kafka transactions across the consume→process→produce loop (`processing.guarantee=exactly_once_v2`). Flink achieves it via barriers + transactional sinks. Spark Structured Streaming uses offset-based checkpointing in a write-ahead log + idempotent sinks (micro-batch, so higher latency).

---

## 8. Stream-table duality

The single most important mental model in modern stream processing (Kafka Streams, ksqlDB, Materialize, Flink SQL all rest on it):

- A **stream** is a log of *changes* (an append-only sequence of events: "balance += 5", "balance −= 3").
- A **table** is a *snapshot* - the current state, the result of folding all changes up to now ("balance = 2").

They are two views of the same data - **a changelog ↔ a materialized state**:

```
STREAM (changelog)                TABLE (current state, keyed)
 (k=alice, +5) ──┐
 (k=bob,   +2)   │   aggregate    ┌──────────────┐
 (k=alice, -3) ──┼──────────────► │ alice → 2    │
 (k=alice, +1)   │   (fold)       │ bob   → 2    │
                 ▼                └──────────────┘
                                      │ emit changelog of updates
                 ◄────────────────────┘   (table → stream)
```

- **Stream → Table:** aggregate/fold the stream by key (a `GROUP BY` that never ends) → a continuously updated table = a **materialized view**.
- **Table → Stream:** emit the table's change events (CDC - change data capture; see `11-messaging-event-driven.md`). This is exactly what Debezium does to your Postgres WAL.

This duality is why "materialized-view databases" (Materialize, RisingWave, ksqlDB) exist: you write a SQL `SELECT ... GROUP BY` and the engine keeps the result table *incrementally* up to date as input streams change - no periodic `REFRESH`. Under the hood it's a stream job; the SQL is sugar.

---

## 9. Joins on streams

Joins are where unbounded data bites hardest, because a SQL join assumes both sides are *finite*. Three flavors:

| Join type | What it joins | State held | Real example |
|---|---|---|---|
| **Stream-stream (windowed)** | Two streams, matched within a time window | Both sides buffered for the window duration → bounded | Match `ad_click` to `purchase` within 30 min (attribution) |
| **Stream-table (lookup/enrichment)** | Stream event ← current table snapshot | The table (kept fresh via its changelog) | Enrich `order` event with `customer` profile |
| **Table-table** | Two changelog tables | Both materialized | Keep a denormalized view in sync |

**Why stream-stream joins are dangerous:** without a window, you'd have to remember *every* event from both sides forever to catch a future match - unbounded state, certain OOM. The window bounds the state: "only try to match events within 30 minutes of each other." Watermarks then let the engine *evict* expired buffered events. Picking the window is a business decision: too small and you miss legitimate late matches; too large and state explodes.

**Temporal correctness in stream-table joins:** when enriching an order with the customer record, do you want the customer's profile *as it was at the order's event time*, or *as it is now*? Naive joins use "now," which is wrong for reprocessing (replay the log and the customer's address has since changed → historical orders get rewritten incorrectly). **Temporal/versioned table joins** (Flink's `FOR SYSTEM_TIME AS OF`) join against the table version valid at the event's event time - essential for auditable, replayable pipelines.

---

## 10. Use cases mapped to the machinery

**Real-time analytics / live dashboards.** Tumbling/sliding windows → materialized view → push to dashboard. Acceptable to drop late data (drop strategy) and use bounded-out-of-orderness watermarks. Tools: Flink SQL → Apache Pinot / Apache Druid (sub-second OLAP) → Superset. Latency target: ~1–5s end to end.

**Fraud / anomaly detection.** Stateful pattern detection over event-time windows: "≥3 transactions > $500 from ≥2 countries within 5 minutes." Needs low latency (block the transaction *before* it settles → seconds matter) but *also* correctness, so exactly-once + careful watermarks. Often combines stream-stream joins (login ↔ transaction) with a state machine (CEP - Complex Event Processing; Flink CEP). State per key (per card) can be large → RocksDB backend.

**Leaderboards / top-K / counters.** Stream → table aggregation by player key, kept in a materialized view, served from Redis (sorted sets, `ZADD`/`ZREVRANGE` give O(log n) ranked reads). Watch out: a global top-K is a *single hot key* - every event touches it. Partition by region/segment and merge, or use approximate sketches (Count-Min Sketch, HyperLogLog for unique counts) to bound memory: HLL estimates cardinality of billions of items in ~12 KB with ~2% error. Classic space-vs-accuracy trade-off.

---

## 11. Common pitfalls / war stories

- **Using processing time and wondering why numbers aren't reproducible.** Backfill the same data and get different per-window counts. Always default to event time for correctness-sensitive aggregates.
- **No watermark / infinitely conservative watermark.** Windows never close (or hold state forever) → state grows unbounded → RocksDB/heap OOM and the job dies. Always set a finite, sane out-of-orderness bound and TTL old state.
- **Silently dropping late data without measuring it.** A mobile-heavy product had 4% of events arriving past a 30s watermark; revenue dashboards undercounted and nobody knew until finance reconciled. Emit a *late-records counter* and alert on it.
- **Assuming "exactly-once" means no duplicate delivery.** It means exactly-once *effect*. If your sink isn't idempotent or transactional, replays after a crash will duplicate writes regardless of what the engine guarantees internally.
- **Unbounded stream-stream join.** Forgetting the time window → state grows forever. Always window stream-stream joins and verify state size in monitoring.
- **Hot-key skew.** One viral product / one whale user routes 60% of events to a single partition's operator → that one worker is the bottleneck while others idle. Mitigate with key salting + two-stage aggregation, or pre-aggregate.
- **Changing the job in an incompatible way and breaking state restore.** Renaming an operator or changing its state schema can make the saved checkpoint unrestorable. Use explicit operator UIDs (Flink) and state migration / savepoints.
- **Watermark stalls on an idle partition.** Event-time watermark = *min* across all partitions; if one partition goes silent, the global watermark freezes and *nothing* fires. Use idle-source detection to advance past quiet partitions.
- **Lambda divergence.** Batch and speed layers compute subtly different results (different rounding, different dedup) → the dashboard flickers when the batch view overwrites. The reason Kappa won.

---

## 12. Choosing an engine

| Engine | Model | Latency | Exactly-once | Sweet spot |
|---|---|---|---|---|
| **Kafka Streams** | Library (no cluster), reads/writes Kafka | ms | Yes (Kafka txns) | JVM apps already on Kafka; embed in a service, no separate cluster |
| **Apache Flink** | True streaming, dedicated cluster | ms, lowest | Yes (barriers + txn sinks) | Complex stateful jobs, CEP, large state, event-time correctness - the power tool |
| **Spark Structured Streaming** | Micro-batch (Continuous mode experimental) | ~100ms–seconds | Yes (WAL + idempotent) | Teams already on Spark; unified batch+stream; higher latency OK |
| **ksqlDB / Flink SQL / Materialize / RisingWave** | SQL over streams (duality) | sub-second–seconds | Yes | Materialized views, analysts who want SQL not Java |

Rule of thumb: **Flink** for serious low-latency stateful work; **Kafka Streams** when you want it embedded in a microservice with no cluster to operate; **Spark** when you're already a Spark shop; a **materialized-view DB** when SQL ergonomics beat raw control.

---

## 🧩 Case Study: Uber's real-time pipeline (AthenaX / Flink)

**The problem.** Uber's marketplace is a feedback loop measured in seconds: surge pricing, ETA, driver-rider matching, fraud, and the city-ops dashboards that humans use to keep a market healthy all need *fresh* aggregates over *enormous* event volume. By the late 2010s Uber's streaming platform processed on the order of **trillions of messages and petabytes of data per day**, with Kafka clusters handling **tens of millions of messages/sec** at peak. The events come from phones - and phones are the worst possible event source for timing: a driver in a parking garage or a rider on the subway buffers GPS pings and trip events, then dumps them minutes later. Computing "trips completed in this 1-minute bucket in San Francisco" naively on arrival gives numbers that are wrong, jittery, and *non-reproducible* - exactly the failure described in §4.

**Why event time, not processing time (§4).** A trip that *happened* at 14:03 but *arrived* at 14:09 must still land in the 14:03 bucket, or every replay produces different per-window counts and surge pricing reacts to phantom demand. Uber standardized on **event time** - the timestamp the mobile SDK stamps on the event - for all correctness-sensitive aggregates. This is precisely the "processing-time windows are non-reproducible" lesson from the module, applied at city scale.

**Windowing + watermarks (§5, §6).** Demand/supply and dashboard metrics are computed as **tumbling and sliding event-time windows** (e.g. trips per minute, sliding 5-minute supply/demand ratios per geofenced hex). Because phones are late, Uber configures **bounded-out-of-orderness watermarks** - hold the window open a bounded lag past `maxEventTime` to catch stragglers - and routes events past the watermark to a **late-data side output** rather than silently dropping them (§6, pitfall in §11). The accepted trade-off is the exact one in the §6 table: a larger watermark lag buys completeness for delayed mobile events at the cost of a few extra seconds of dashboard latency. For a surge signal, "a few seconds late but correct" beats "instant but undercounting trips stuck in a tunnel."

**Stateful processing + checkpointing (§7).** Per-geofence, per-product counters and the per-driver/per-card state behind fraud rules are large keyed state, kept in Flink's **RocksDB state backend** (the LSM-tree backend from §7/§2) so it spills past RAM. Fault tolerance is Flink's **Chandy-Lamport asynchronous barrier checkpointing** - barriers injected at the Kafka sources, async per-operator snapshots to durable storage, source offsets rewound on recovery - giving **exactly-once processing effect** even when workers die mid-window. Sinks use **idempotent/upsert writes** keyed by a deterministic id so a post-crash replay overwrites rather than double-counts (§7).

**Kappa, made usable with SQL (§3, §8).** Uber did *not* maintain twin batch+stream codebases. The platform is essentially **Kappa**: Kafka is the durable, replayable log; to reprocess you replay from an earlier offset through a new job version into a new table and swap. To make this accessible to non-streaming engineers, Uber built **AthenaX** - a self-serve layer that compiles **SQL** into managed Flink jobs. That SQL-over-streams ergonomic rests directly on **stream-table duality** (§8): a `GROUP BY` that never ends becomes a continuously updated materialized view. Output lands in OLAP stores (Pinot/Druid-class) for sub-second queries by dashboards.

```
 Mobile apps ─┐                          (event time stamped on device)
 Driver app   ├─► Kafka (durable, replayable log, ~10s of M msg/s)
 Backend svcs ┘        │
                       ▼
            ┌──────────────────────────────────────────┐
            │  Flink jobs (compiled from AthenaX SQL)   │
            │  • event-time tumbling/sliding windows    │
            │  • bounded watermarks + late side-output  │
            │  • keyed state in RocksDB                  │
            │  • barrier checkpoints ──► durable store   │
            └──────────────────────────────────────────┘
                       │ exactly-once (idempotent/upsert sinks)
                       ▼
        Pinot/Druid (sub-sec OLAP) ─► surge / ETA / ops dashboards
                       │
        reprocess: replay Kafka from offset 0 → job v2 → new table → swap (Kappa, §3)
```

**The key trade-off they accepted.** Latency vs completeness (§6), spent in favor of completeness. By holding event-time windows open for a bounded lateness rather than firing the instant an event arrives, Uber gave up a few seconds of freshness to get aggregates that are *correct and reproducible* across replays - the right call when those numbers drive pricing and money. They also accepted the operational cost of long Kafka retention and large RocksDB state (the §3 Kappa cost) to avoid Lambda's twin-codebase divergence (§11).

**Results.** AthenaX let hundreds of streaming use cases be authored as SQL instead of bespoke Flink jobs, collapsing time-to-ship from weeks to hours and removing the Lambda dual-maintenance tax. The Flink-on-Kafka platform sustained trillions of daily events with **second-scale end-to-end latency** for analytics and **sub-second** OLAP query latency on the served tables, with exactly-once correctness surviving worker failures via checkpointing.

### Lessons
- **Mobile = late data is the norm, not the exception.** If your producers are phones, design for event time + bounded watermarks + a measured late-records side output from day one; never assume on-time arrival.
- **Pick completeness over raw latency when numbers move money.** A bounded watermark lag is a cheap, explicit way to buy reproducible aggregates - make the lag a tuned knob, not an accident.
- **SQL-over-streams scales an org, not just a cluster.** Stream-table duality (AthenaX) let non-experts ship correct stateful pipelines; the duality is the leverage, not the syntax.
- **Kappa + replay beats Lambda's twin codebases.** A replayable log plus an exactly-once engine removes the divergence bug class entirely - at the price of long retention and large checkpointed state.

## Test yourself

1. Why are processing-time windows non-reproducible, and when is that actually acceptable?
   *Hint: bucketing depends on wall-clock arrival, which varies per run; OK only when "as I saw it" is the intended semantic.*
2. A window for [10:00, 10:05) - when does the engine emit its result, and what makes an event "late"?
   *Hint: when the watermark passes 10:05; late = arrives after that watermark.*
3. You want lower dashboard latency but keep missing stragglers. What's the fundamental trade-off and three ways to handle late data?
   *Hint: latency vs completeness; drop / side-output / allowed-lateness-with-retractions.*
4. Explain exactly-once *processing* vs exactly-once *delivery*. Why can your sink still see duplicates under an "exactly-once" engine?
   *Hint: effect vs physical delivery; sink must be idempotent or transactional.*
5. How does Flink take a consistent global snapshot without stopping the stream?
   *Hint: Chandy-Lamport barriers injected at the source, async state snapshot per operator.*
6. Give the stream-table duality in one sentence each direction, and name a real system for each.
   *Hint: stream→table = aggregate/materialize (ksqlDB); table→stream = CDC changelog (Debezium).*
7. Why must a stream-stream join be windowed, and what does the window's size trade off?
   *Hint: bounds otherwise-infinite state; size = match completeness vs memory.*
8. You're building a global leaderboard and one operator is pegged at 100% CPU. Diagnose and fix.
   *Hint: hot key / single top-K key; salt + two-stage aggregate, or approximate sketches.*

---

## Further reading

- **DDIA**, Martin Kleppmann - Chapter 11 *Stream Processing* (the canonical text); Chapter 12 for the "unbundled database" / derived-data view.
- **The Dataflow Model**, Akidau et al., VLDB 2015 - the what/where/when/how framework; event time, watermarks, triggers. The foundational paper.
- **Streaming 101 & 102**, Tyler Akidau (O'Reilly Radar blog) - the accessible companion to the paper.
- **Lightweight Asynchronous Snapshots for Distributed Dataflows**, Carbone et al. (Flink checkpointing) + the original **Chandy-Lamport** snapshot paper (1985).
- **Questioning the Lambda Architecture**, Jay Kreps, 2014 - the Kappa argument.
- Apache **Flink** docs: *Event Time*, *Watermarks*, *State & Fault Tolerance*. **Kafka Streams** docs: *Streams & Tables*, `exactly_once_v2`.
- **Materialize** / **RisingWave** docs - materialized-view-as-a-stream-job in practice.

*Sibling modules:* `11-messaging-event-driven.md` (Kafka, partitions, delivery semantics, CDC), `02-data-models-storage.md` (LSM/RocksDB state backends), `06-replication-consistency.md` (log replication), `09-cap-pacelc...md` (latency vs consistency framing that mirrors latency vs completeness here).
