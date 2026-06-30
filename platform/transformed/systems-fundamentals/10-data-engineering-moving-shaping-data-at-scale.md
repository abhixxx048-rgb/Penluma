---
title: "Data Engineering Explained: How Data Moves at Scale"
metaTitle: "Data Engineering: Moving Data at Scale"
description: "Learn how data engineering moves and shapes data at scale - OLTP vs OLAP, ETL vs ELT, Kafka, lakehouses, and idempotent pipelines, explained in plain English."
keywords:
  - data engineering
  - ETL vs ELT
  - OLTP vs OLAP
  - columnar storage
  - Apache Kafka basics
  - data lakehouse
  - Parquet vs Iceberg
  - idempotent data pipeline
  - batch vs stream processing
  - data warehouse vs data lake
  - Airflow DAG
  - schema evolution
  - data quality testing
  - feature store
topic: systems-fundamentals
topicTitle: Systems Fundamentals
category: Engineering
date: '2026-06-21'
order: 9
icon: ⚙️
author: Brexis Wazik
transformed: true
polished: true
linked: true
faq:
  - q: What is data engineering in simple terms?
    a: Data engineering is the craft of building the "plumbing" that moves, cleans, combines, and delivers data. The product it ships isn't a screen or feature - it's a trustworthy, on-time, well-shaped dataset that analysts and machine-learning models can rely on.
  - q: What is the difference between OLTP and OLAP?
    a: OLTP (Online Transaction Processing) is the live app database doing many tiny reads and writes, like inserting one order. OLAP (Online Analytical Processing) is the analytics database doing a few huge queries that scan millions of rows. They use opposite storage layouts, so you copy data from one to the other.
  - q: What is the difference between ETL and ELT?
    a: Both move data into an analytics system. ETL transforms data before loading it; ELT loads raw data first, then transforms it inside the warehouse. ELT now dominates because cloud storage is cheap and keeping raw data lets you re-derive metrics or fix bugs later.
  - q: Is Parquet the same as Iceberg or Delta Lake?
    a: No. Parquet is a columnar file format - the actual files on disk. Iceberg and Delta Lake are table formats that store data as Parquet files and add a metadata layer for ACID transactions, schema evolution, and time travel. They work together, not as replacements.
  - q: Why must data pipelines be idempotent?
    a: Systems like Kafka deliver at-least-once, meaning a record can be processed twice after a crash or retry. If your pipeline isn't idempotent, those duplicates double-count your data. Overwriting by partition or upserting by key keeps results identical no matter how many times a job runs.
  - q: What is the difference between batch and stream processing?
    a: Batch processing handles a finite chunk of data on a schedule, like all of yesterday's orders at 2am - high throughput, higher latency. Stream processing handles an endless flow of events within seconds. A batch is really just a bounded slice of a stream.
sources: []
---

Every dashboard you trust, every "customers also bought" suggestion, every fraud alert that fires in real time - none of it works without an invisible supply chain running behind the scenes. The app creates the data. Something else has to collect it, clean it, reshape it, and deliver it on time.

That "something else" is data engineering. And once you see how it works, a lot of mysterious failures - wrong numbers on a report, a model that quietly gets worse, a query that takes down production - suddenly make sense.

## Why this matters

A software engineer builds the app that *creates* data: every order placed, every button click, every sign-up. A data engineer builds the systems that *collect, reshape, and deliver* that data to the people and programs making decisions.

The difference matters because the failures are different. When app code breaks, you get an error message. When a data pipeline breaks, you often get something worse: numbers that look fine but are silently wrong. A dashboard that double-counts revenue. A model trained on data that no longer matches reality.

Getting this layer right is what separates a toy script from a system a business can bet on. Here's the supermarket version of the idea: the farms (your apps) grow the food (your data). Data engineering is the entire supply chain in between - the trucks, the cold storage, the washing, the sorting, the shelves. The shopper only sees neat shelves. None of it works without the chain behind them.

## Two kinds of database work: OLTP vs OLAP

The first thing to understand is that databases serve two very different **workloads** - two different patterns of how data gets read and written.

- **OLTP (Online Transaction Processing)** is the live database behind your app. A "transaction" here means one small unit of business work: "insert this new order," "fetch user 42." OLTP does *many tiny reads and writes*, each touching just a few rows, and it has to stay fast for lots of users at once. Think PostgreSQL or MySQL.
- **OLAP (Online Analytical Processing)** is the analytics database. It does *a few enormous queries* that scan millions of rows but look at only a handful of columns - "what was the average order value by region last quarter?" Think Snowflake or BigQuery.

Quick vocabulary, since the rest of the article leans on it: a **row** is one whole record (one entire order). A **column** is one field across all records (every order's price).

### Why storage layout decides everything

How data is physically laid out on disk decides which workload is fast. There are two layouts.

**Row-oriented** keeps each whole record together:

```
[id1,name1,price1][id2,name2,price2][id3,name3,price3]
  ^-- one whole record sits together --^
```

**Columnar** keeps each column together:

```
ids:    [id1,   id2,   id3  ]
names:  [name1, name2, name3]
prices: [price1,price2,price3]
  ^-- each column sits together --^
```

Now imagine the query `SUM(price)` over a million orders. On the row layout, the computer must read every byte of every record - names, addresses, everything - just to pull out the price. On the columnar layout, it reads *only the price block* and ignores the rest.

Columnar storage wins for analytics for three reasons that stack on top of each other:

1. **Less data read from disk.** A query touching 3 of 50 columns reads only those 3 - often 90% less data.
2. **Better compression.** When values of the same type sit together (every country in one block), patterns repeat and squeeze down tightly - typically 5–10x smaller, sometimes far more on columns with few distinct values.
3. **Faster processing.** Because same-type values sit in a tidy array, the CPU can apply one instruction to many values at once. Aggregations that take minutes on a row store can finish in milliseconds.

The catch: columnar is **terrible at updating a single row**, because that one row is now scattered across many column blocks. That's exactly why OLTP databases stay row-oriented. You can't have it both ways in one system - so you *copy* data from the OLTP system into an OLAP system. That copying is the heart of data engineering.

## Getting data across: ETL vs ELT

Both terms describe moving data from a source into an analytics system. They differ only in the order of two steps. **E** = Extract (pull data out), **T** = Transform (clean and reshape), **L** = Load (put it into the warehouse).

- **ETL (Extract → Transform → Load):** clean and reshape the data on a separate machine *first*, then load the finished result. This was standard when storage and compute were expensive.
- **ELT (Extract → Load → Transform):** dump the *raw* data into cheap storage or a powerful cloud warehouse first, then transform it *inside* that warehouse using SQL.

Here's the kitchen version. ETL is washing and chopping your vegetables *before* putting them in the fridge. ELT is stocking the fridge raw and prepping each vegetable only when you cook that recipe. ELT keeps the raw ingredients around - so if you discover a better recipe later, you still have everything you need.

ELT now dominates. Cloud warehouses have cheap storage and elastic compute (you rent power on demand), so loading raw and transforming later is both fast and flexible. The real prize is that you **keep the raw data**: find a bug in a transform, or need a new metric, and you can re-derive it from scratch. A popular tool called **dbt** lets analysts write these transforms as version-controlled SQL with built-in tests.

## Where the data lives: warehouse, lake, lakehouse

| Type | What it is | Strength | Weakness |
| --- | --- | --- | --- |
| **Data warehouse** | Structured, cleaned, modeled data. The shape must be defined *before* loading. Snowflake, BigQuery, Redshift. | Fast, reliable SQL analytics for business reports. | Historically rigid and pricey for messy or unstructured data. |
| **Data lake** | Cheap object storage (Amazon S3, Google Cloud Storage) holding *any* file format. Shape is decided *when you query*. | Cheap, flexible, stores images, JSON, logs - anything. | With no rules it becomes a "data swamp": no transactions, no quality, unreliable to query. |
| **Lakehouse** | The lake's cheap storage *plus* warehouse-grade management - transactions, schema rules, time travel. The modern default. | Cheap and flexible *and* reliable. | More moving parts to understand. |

### File formats vs table formats - the point everyone confuses

This distinction trips up almost every beginner, so go slowly.

- **Parquet** and **ORC** are **columnar file formats**. A Parquet file is a single, unchangeable file that stores columns together *and* embeds small statistics (the min and max value in each chunk) so a query engine can skip files it doesn't need. Parquet is the de facto standard.
- **Delta Lake**, **Apache Iceberg**, and **Hudi** are **table formats**. They are *not* a new way to store data - they store the data *as Parquet files* and add a **metadata and transaction-log layer on top**. That layer records "which files make up this table right now," and it gives you ACID transactions (all-or-nothing safe writes), schema evolution (the table's shape can change safely), and time travel (query the table as it looked last Tuesday).

Picture the lakehouse as a layer cake, read bottom to top:

```
  Query engines   | Spark, Trino, Snowflake, DuckDB
  ----------------+---------------------------------
  Table format    | Iceberg / Delta: ACID, time
                  | travel, schema, "which files?"
  ----------------+---------------------------------
  File format     | Parquet (columnar files + stats)
  ----------------+---------------------------------
  Object storage  | S3 / GCS (cheap, holds the files)
```

**Delta Lake** is centered on Spark and Databricks. **Iceberg** is *engine-agnostic* - Spark, Trino, Flink, Snowflake, and DuckDB can all read the same Iceberg table, which is its defining advantage. The two formats have been converging; Databricks' Delta "UniForm" can even expose a Delta table *as* Iceberg.

## Batch vs stream - and the log that unifies them

- **Batch processing:** handle a finite, bounded chunk of data on a schedule - "all of yesterday's orders, every night at 2am." High throughput, higher latency. The main tool is **Apache Spark**.
- **Stream processing:** handle an endless flow of events as they arrive, within seconds or less. Tools include **Apache Kafka** (the pipe that carries events) plus a processor like **Apache Flink**.

There's a deep idea here, made famous by Martin Kleppmann in *Designing Data-Intensive Applications*: **an append-only, ordered log unifies batch and streaming**. A "log" here means a record book you only ever add to the end of, never edit.

A *batch is just a bounded slice of a stream*. If every change is an immutable, ordered, **replayable** event in a [durable log](/blog/distributed-systems/03-replicated-state-machines-the-log), then real-time consumers and historical reprocessing can run the *exact same logic*. You just choose where in the log to start reading.

### Kafka basics - the log in practice

Kafka is a **distributed, durable, append-only commit log**. Unlike a [traditional queue](/blog/system-design/12-messaging-and-event-driven), messages are *not* deleted when read - they're kept so many readers can re-read them.

- **Topic** - a named stream of records, like "orders."
- **Partition** - a topic is split into ordered shards. Order is guaranteed only *within* a partition, never across the whole topic. Partitions are the unit of parallelism. Records with the same key (say, the same customer ID) always land in the same partition, so per-customer order is preserved.
- **Offset** - a record's sequential position within a partition. A consumer's offset is how far it has read.
- **Consumer group** - a team of consumers splitting a topic's partitions. Each partition is read by exactly one consumer in the group. More partitions means more parallel consumers.

```
Topic "orders"
  Partition 0: [off0][off1][off2] -> Consumer A
  Partition 1: [off0][off1]       -> Consumer B
  Partition 2: [off0]             -> Consumer C
  (add a 4th consumer -> it sits IDLE, no partition left)
```

An offset is like a bookmark in a book that's never thrown away. The book - the log - keeps all its pages forever. If you crash before saving your bookmark, you simply reopen to the last saved page and re-read. That re-reading is exactly where duplicates come from.

Which brings us to **delivery semantics**. Kafka's default is **at-least-once**: a consumer processes a record, *then* saves (commits) its offset. Crash in between, and that record gets delivered again and **processed twice**. The practical consequence is enormous: because duplicates *can* happen, everything downstream must be [idempotent](/blog/system-design/11-distributed-transactions-and-idempotency).

## Common misconceptions

A few myths cause real outages and wrong dashboards. Worth clearing up.

- **"I'll just run analytics on the production database."** The storage layout is wrong (row, not columnar), *and* the giant scan steals CPU and memory from live customer transactions, slowing your whole app. Copy the data into an OLAP system and query there.
- **"Iceberg and Delta replace Parquet."** They don't. They store Parquet files and wrap them in a metadata and transaction layer. File format and table format are two different jobs.
- **"Kafka guarantees global ordering and exactly-once delivery."** Order holds only within a partition - use a key to keep related events together. And at-least-once means you *will* see duplicates. Design for them.
- **"Streaming is just the modern, better way to do everything."** [Streaming](/blog/system-design/14-stream-processing-realtime) adds real operational cost. If a nightly batch job meets your latency requirement, use it. Reach for streaming only when low latency is genuinely needed.

## How to build pipelines that survive production

These disciplines are what separate a toy script from real data engineering. Treat them as a checklist.

1. **Make every job idempotent.** Running the same input twice should give the *same* result - no duplicates, no double-counts. The simplest trick is to overwrite a target chunk instead of blindly adding to it. A daily job written as `DELETE FROM orders WHERE day='2026-06-20'; INSERT yesterday's orders;` can run five times and the table is identical every time. A naive `INSERT` with no delete double-counts on the second run - a time bomb.
2. **Keep raw data so you can replay.** Because the raw log is retained, you can re-run a pipeline from a past point to fix a bug or rebuild a downstream table.
3. **Backfill one isolated period at a time.** Backfilling means re-populating or correcting *historical* data - you added a column, fixed a transform, or onboarded a new source. Re-run one idempotent period at a time (for example, keyed on an `event_time` column) so reprocessing a date range never double-counts.
4. **Handle schema changes deliberately.** Sources change shape over time. *Additive* changes (a new optional column) should be absorbed automatically. *Breaking* changes (a renamed, removed, or retyped column) should halt the pipeline and alert a human - never silently drop a field, or your dashboard quietly shows wrong numbers.
5. **Test data quality at every stage.** Check null-rate thresholds, uniqueness and primary keys, referential integrity (every order points to a real customer), value ranges (price > 0), and row-count anomalies (today shouldn't be 10x yesterday). Tools like **dbt tests** and **Great Expectations** automate this.
6. **Partition files on a column you actually filter.** In lakes and lakehouses, big tables are split into folders, usually by date: `.../orders/year=2026/month=06/day=20/part-000.parquet`. A query filtering on `day='2026-06-20'` then reads only that folder and skips every other day - "partition pruning." Pick a *low-cardinality* column you filter on (a date is ideal). Avoid over-partitioning by something like `user_id`, which creates millions of tiny files and crushes performance.

### Orchestration: the conductor, not the band

A real pipeline is many steps that must run in the right order, on a schedule, with retries when something fails. An **orchestrator** coordinates this. The classic tool is **Apache Airflow**, where you describe your pipeline as a **DAG (Directed Acyclic Graph)** in Python. "Directed" means arrows point one way (this step before that). "Acyclic" means no loops, so no step can depend on itself.

```
extract_orders
      |
   +--+--+
   v     v
validate dedupe
   |     |
   +--+--+
      v
 load_warehouse -> build_marts -> refresh_dashboard
```

The key thing to remember: Airflow *orchestrates* but does not *process* the data itself. It schedules, triggers, and tracks success or failure - the heavy lifting happens in Spark, Flink, dbt, or the warehouse. (Modern alternatives include Dagster, Prefect, and Mage.)

## Why this is the foundation of AI

Models are only as good as the data feeding them, which makes data engineering the supply chain that makes machine learning possible.

**Feature pipelines** - often organized in a *feature store* - compute the inputs a model uses, such as "average order value over the last 7 days." **Training datasets** are assembled by exactly the batch jobs described here, run over warehouse and lakehouse tables. And replayability lets you reproduce the precise dataset a model was trained on.

There's a subtle failure mode worth naming: **training/serving skew**. If you compute a feature one way in nightly batch training and a slightly different way in real-time serving, the model sees inputs at serving time that don't match what it learned from - and quietly gets worse. Sharing the same logic through a feature store and the same log keeps the two in agreement.

## Conclusion

If you remember one thing, make it this: **the job of data engineering is to deliver data you can trust, on time, in the right shape** - and almost every technique here exists to protect that trust. Idempotency protects it against retries. Replay protects it against bugs. Schema checks protect it against silent drift. Quality tests protect it against bad numbers reaching a human or a model.

The deeper you go, the more one idea keeps reappearing: the humble append-only log. It's the thread connecting batch and streaming, the reason backfills are safe, and the quiet backbone of reproducible AI. So here's a question to chew on next - if a log of immutable events can rebuild any table on demand, why do we still store the "current state" at all? That question leads straight into [event sourcing and CQRS](/blog/system-design/13-event-sourcing-and-cqrs), where the log isn't just the pipeline. It's the source of truth.
