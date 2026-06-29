---
title: "When Postgres Says No: Search, Geo & Time-Series Stores"
metaTitle: "Specialized Databases: Search, Geo, Time-Series"
description: "Learn when a standard database can't answer your query, and which specialized database to reach for instead: search, geospatial, time-series, or analytics."
keywords:
  - specialized databases
  - inverted index
  - Elasticsearch BM25
  - geospatial database
  - PostGIS
  - geohash edge problem
  - time-series database
  - Prometheus cardinality
  - columnar OLAP
  - polyglot persistence
  - when to use Elasticsearch
  - data warehouse vs lake vs lakehouse
  - Uber H3 spatial index
  - star schema OLAP
topic: system-design
topicTitle: System Design
category: Engineering
date: '2026-06-15'
order: 19
icon: "\U0001F3D7️"
author: Pritesh Yadav (priteshyadav444)
transformed: true
polished: true
faq:
  - q: "When should I stop using Postgres and reach for a specialized database?"
    a: "When the query shape doesn't fit a B-tree lookup: ranked text search, nearest-by-distance, metrics over time, or aggregating billions of rows across a few columns. For fetching and updating a few rows by key, stay on Postgres."
  - q: "Why is Elasticsearch a bad primary database?"
    a: "It's near-real-time (a ~1 second refresh delay before writes are searchable), has no real transactions, and reshuffles data during segment merges. Treat it as a derived, rebuildable index over a durable source of truth."
  - q: "What is the geohash edge problem?"
    a: "Two points a few meters apart can land in cells with different prefixes when they sit on a cell boundary, so a naive 'same prefix means nearby' query misses neighbors across the seam. The fix is to query your cell plus its 8 neighbors, then filter by true distance."
  - q: "What causes a time-series database to run out of memory?"
    a: "Cardinality explosion. Every distinct combination of label values is a separate series with its own index entry and in-memory chunk. Adding a high-cardinality label like user_id or request_id can turn 1,000 series into millions and OOM-kill the server."
  - q: "Why are columnar databases faster for analytics?"
    a: "They read only the columns a query touches, compress each column heavily because it holds one data type, and process columns as contiguous arrays using SIMD. The trade-off is that inserting a single row touches every column file, so they're poor for transactions."
  - q: "What is polyglot persistence?"
    a: "Using more than one type of data store, each matched to a query shape, with one relational database as the source of truth. For example, orders live in Postgres and are streamed into Elasticsearch for search and ClickHouse for analytics."
sources: []
---

Your `WHERE col LIKE '%red business cards%'` query worked fine in development. Then the table hit ten million rows, and now it takes nine seconds and pegs a CPU. You add an index. It doesn't help. You add more RAM. It doesn't help.

Here's the thing nobody tells you: the problem isn't your database being slow. It's that you're asking it a question it was never shaped to answer.

This is a guide to the four most common "my Postgres can't do this efficiently" moments, and the purpose-built tool that fixes each one.

## Why this matters

A regular database like PostgreSQL or MySQL is brilliant at exactly one job: **find or change a few rows by their key.** Its internal index (a B-tree) is a sorted list, perfect for "give me the row where `id = 42`" or "orders between March and April."

But a lot of real questions don't fit that shape:

- "Find documents containing these words, ranked by how relevant they are."
- "Find the 50 nearest coffee shops to where I'm standing."
- "Show me average CPU per minute, across a million servers, for the last 30 days."
- "Total revenue by region by month, across two billion orders."

Each of these forces a regular database to do something catastrophic, usually scanning the entire table. The cost shows up as slow pages, blown budgets, and 3 a.m. pages. Knowing which specialized store to reach for, and *why*, is one of the clearest signals of a senior engineer. It's also one of the most common system design interview topics.

The single mental model that ties it all together:

> **An index is shaped like a question. When your question changes shape, you need a differently shaped index.**

Let's walk through the four shapes.

## Search: the inverted index

### The trick is a book's index

Flip to the back of any textbook. There's a list that maps each *word* to the *page numbers* where it appears. That's an **inverted index**.

A normal database stores the "forward" direction: document number one contains these words. An inverted index flips it around: the word "card" appears in documents 12, 88, and 204. Now "find documents containing card" is a quick lookup instead of reading every document.

That single flip is why search engines like Elasticsearch and OpenSearch (both built on a library called **Lucene**) can search millions of documents in milliseconds while `LIKE '%card%'` crawls.

### The pipeline that decides whether search works at all

Before text can go into the index, it gets cleaned up by a pipeline Lucene calls an **analyzer**:

1. **Tokenize** - split "Red Business Cards!" into separate words.
2. **Filter** - lowercase everything, strip punctuation, reduce words to their root ("cards" becomes "card"), and drop noise words like "the" and "a".
3. **Index** - store the result as a list of which documents contain each term.

Here's the rule that trips up almost everyone the first time:

> **The same analyzer must run when you index AND when you search.**

If you reduce "cards" to "card" while indexing but not while searching, then a search for "cards" looks for "cards" and finds nothing, because the index only contains "card." The symptom is maddening: exact matches work, but obvious matches don't. We'll come back to this in the misconceptions section because it's that common.

### Ranking: not just matches, but the *best* matches

Finding documents is half the job. You also want the most relevant ones on top. Two simple ideas drive this:

- **How often does the word appear?** A document mentioning "card" five times is probably more about cards than one that mentions it once. (Called *term frequency*.)
- **How rare is the word?** "Card" appearing in every document tells you nothing. "Lenticular" appearing in three documents is a strong signal. Rare words carry more weight. (Called *inverse document frequency*.)

The classic formula combining these is **TF-IDF**. The modern default in Elasticsearch is its smarter successor, **BM25**, which fixes two real problems:

- **Diminishing returns on repetition.** The 20th mention of a word shouldn't count as much as the 2nd. BM25 flattens the curve.
- **Fairness across document length.** A 10,000-word article naturally contains more of every word, so BM25 discounts long documents to keep the playing field level.

You don't need the math to use it. You just need to know that BM25 is why a good search engine puts the genuinely relevant result first, not the longest document that happened to repeat your keyword.

### Things about Elasticsearch that bite people

- **It's near-real-time, not real-time.** A new document isn't searchable for about one second (a setting called the refresh interval). So if a user posts a comment and you immediately re-query Elasticsearch to show it, it won't be there yet. Read it back from your real database instead.
- **Segments are immutable.** Updating a document doesn't edit it in place; it marks the old one deleted and writes a new one. Space is reclaimed later, during background merges. This is the same family of design as log-structured storage.
- **Shard count is fixed when you create the index.** A shard is a self-contained piece of the index. Too few and you can't scale; too many and every search has to fan out to all of them and pay overhead on each. A good rule of thumb is **10 to 50 GB per shard**.

### Typeahead, typo tolerance, and "did you mean"

| What you want | How it works | Trade-off |
|---|---|---|
| Typo tolerance ("buisness" finds "business") | Match words within 1-2 character edits | Keep the edit limit small or matches get noisy |
| As-you-type autocomplete | Pre-index every prefix: c, ca, car, card | Fast, but inflates the index a lot |
| Sub-millisecond suggestions | A compact in-memory structure | Can't match in the middle of a word |
| Name search ("Smith" finds "Smyth") | Index words by how they *sound* | Only useful for names and similar |

A common war story: as-you-type autocomplete makes the index much bigger, and changing how it works forces a full reindex. Plan for it up front.

## Geospatial: making "near me" fast

### Why a regular index can't do "nearby"

A B-tree sorts on one dimension. But "shops within 5 km of me" is fundamentally two-dimensional: a point that's close in latitude can be far away in longitude. You can't line up a 2-D map on a single sorted axis.

Unless... you **flatten 2-D into 1-D while keeping nearby things nearby.** If you can turn a coordinate into a single key such that points close on the map get close keys, the problem becomes solvable again. That's the entire field of geospatial indexing in one sentence.

### The four ways people do it

- **Geohash** - Carve the world into a grid and encode each cell as a short string like `9q8yy`. Points in the same area share a prefix. Dead simple, works in any key-value store. Its weakness is the **edge problem** (more on that next).
- **Quadtree** - Recursively split a square into four smaller squares wherever there are too many points. Dense cities get a deep, detailed tree; empty oceans stay shallow. Great for loading map tiles in a viewport.
- **R-tree** - Group nearby objects into bounding rectangles, nested in a tree. The only one of the four that handles real shapes and polygons, not just points. This is what **PostGIS** uses.
- **S2 (Google) and H3 (Uber)** - Project the round Earth onto a solid shape and tile each face. They fix the distortion geohash suffers near the poles and give you uniform, comparable cells. S2 uses squares; H3 uses hexagons.

### The edge problem (a classic interview trap)

With plain geohash matching, two points **10 meters apart** can end up in cells with totally different prefixes, simply because they sit on opposite sides of a cell boundary. A naive "same prefix means nearby" search **misses neighbors across that seam.**

The fix is simple and worth memorizing: **query your cell plus its 8 surrounding neighbors, then filter the results by true distance.** Redis does this for you inside its `GEOSEARCH` command.

### PostGIS: the workhorse

PostGIS turns Postgres into a serious spatial database. You get a real distance-aware index and a query like "shops within 5 km, nearest first" that walks the index in nearest-first order instead of scanning every row.

Two practical tips that save real pain:

- Use the **`geography`** type for real-world distances in meters. Using the planar **`geometry`** type and asking for kilometers gives you nonsense, because it's measuring distance in degrees.
- A single PostGIS node comfortably handles tens of millions of points and returns the 50 nearest in single-digit milliseconds. Beyond that you shard by region, which quietly reintroduces the edge problem at the shard boundaries.

For "where are my drivers right now" leaderboards, **Redis GEO** is blazing fast and in-memory, but points-only and not your durable source of truth.

## Time-series: data that only ever grows

### Why metrics break a normal database

Metrics, sensor readings, and telemetry have a peculiar shape. They're **append-only** (you never edit yesterday's CPU reading), **time-ordered**, and almost always queried as "this range of time, grouped by which thing." You might write a million points per second and care far more about the last five minutes than a single point from 90 days ago.

A regular database treats every one of those points as a precious, editable row with its own index entry. At a million points a second, that's a firehose of tiny writes that grinds the database into the floor. A **time-series database (TSDB)** treats time as the main axis and is built for exactly this firehose.

### What a TSDB does differently

- **Heavy compression.** Timestamps arrive at near-regular intervals, so the gaps barely change and compress to almost nothing. Values get specialized compression too. Facebook's famous "Gorilla" approach squeezed each point down to roughly **1.4 bytes** instead of 16. Tenfold compression is normal.
- **Downsampling.** Keep raw 10-second data for a short window, then roll it up into 1-minute and 1-hour summaries and discard the fine detail. You rarely need per-second data from last year.
- **Dropping data by the chunk.** To expire old data, a TSDB drops whole time-partitioned chunks at once, instead of deleting rows one at a time (which would fragment and choke the engine).

### The #1 way people blow up a TSDB: cardinality

This one deserves its own warning sign.

A **series** is one unique combination of labels, like `http_requests{method="POST", route="/checkout", status="500"}`. The number of distinct series is the *product* of all your label values:

```
method (4) x status (5) x route (50)  = 1,000 series          fine
add user_id (1,000,000 users)         = 1 billion series      it crashes
```

Each series needs an index entry and an open chunk in memory. Add one high-cardinality label like `user_id`, `request_id`, or a URL with a query string, and you go from a thousand series to millions. This is the single most common reason Prometheus runs out of memory and dies.

**The rule:** metric labels must be a small, bounded set of categories. High-cardinality IDs belong in logs and traces, never in metric labels.

### The big three at a glance

- **Prometheus** - Pulls metrics by scraping your servers. Deliberately simple and single-node so it keeps working when everything else is on fire. Bolt on Thanos or Mimir for long-term, global storage. The wall you hit is RAM, which scales with the number of active series.
- **InfluxDB** - Push-based, general-purpose IoT and metrics, with its own query language.
- **TimescaleDB** - It *is* Postgres, with time-series superpowers. Pick it when you want plain SQL and the ability to join your metrics against relational data.

## Analytics: counting billions of rows

### OLTP vs OLAP, the foundational split

There are two completely different jobs a database might do:

- **OLTP (transactional)** - Read and write a handful of rows by key, in milliseconds. Checkout, login, posting a comment. This is MySQL and Postgres.
- **OLAP (analytical)** - Read millions or billions of rows, touch only a few columns, and aggregate. "Revenue by region by month." Seconds are fine. This is BigQuery, Snowflake, and ClickHouse.

The deepest difference is how they store data on disk.

### Why columnar storage wins for analytics

A normal database stores data **row by row**: all the fields of order #1 sit together, then all the fields of order #2. Great for fetching one whole order. Terrible for "sum the amount column across two billion orders," because you have to read every column of every row just to get to the one you care about.

An analytics database stores data **column by column**: all the amounts together, all the regions together. Now "sum amount, grouped by region" reads just those two columns and skips the other 198.

Three wins stack on top of each other:

1. **Less reading.** A 5-column query over a 200-column table reads about 2.5% of the data.
2. **Better compression.** A single column is all one data type with low variety, so it compresses tenfold or more. Less data on disk means even less reading.
3. **Faster processing.** A column is a tight array the CPU can chew through with one instruction over many values at once.

The catch: columnar storage is **terrible at transactions.** Inserting one row means touching every column file. So never point your checkout flow at a data warehouse, and never run a giant analytics query against your live transactional database.

### Star schemas, in one breath

Analytics data is usually modeled as a **star**: one big central **fact table** (one row per order line, mostly numbers and references) surrounded by small **dimension tables** that add context (product, customer, date, region). It's called a star because of the shape when you draw it.

One subtle trap worth knowing by name: **Slowly Changing Dimensions.** When a customer moves from London to Paris, don't overwrite their region. Add a new row with valid-from and valid-to dates, so a report about last year still attributes their old orders to London. Overwrite it and you silently corrupt every historical report. It's a real and painful war story.

### Warehouse vs lake vs lakehouse

- **Data warehouse** - Structured, modeled, fast SQL, governed. Snowflake, BigQuery. Powerful but pricier and more rigid.
- **Data lake** - Cheap object storage (like S3) holding raw files of any kind. Flexible and great for machine learning, but with no guarantees it can become a "data swamp."
- **Lakehouse** - The modern convergence. Keep cheap files in S3, but add a transaction layer (Apache Iceberg, Delta Lake, or Hudi) that gives you reliable commits, schema changes, and time-travel. One copy of data serves both SQL dashboards and ML, with no expensive copy-into-the-warehouse step.

## Common misconceptions

**"More Elasticsearch shards means faster search."** No. Each shard carries fixed overhead, and every search has to fan out to all of them and merge the results. Over-sharding makes things *slower*. Size shards to 10-50 GB.

**"Elasticsearch can be my main database."** It's near-real-time, has no real transactions, and reshuffles data during merges. People lose data treating it as the only store. It's a derived index you can always rebuild from a durable source.

**"My search returns nothing, so there must be no matches."** Usually it's the analyzer mismatch from earlier: you processed text one way at index time and a different way at query time. Exact matches work; obvious ones don't. Align the analyzers.

**"Adding one more label to a metric is harmless."** If that label is a user ID or request ID, you may have just multiplied your series count by a million and put the server on a path to running out of memory.

**"I'll just `DELETE` old time-series rows."** Row-by-row deletes fragment and choke the engine. Drop whole time chunks instead. Same lesson applies to Postgres partitions: drop the partition, don't delete the rows.

## How to use this: a decision guide

When a query feels slow, name its shape first, then pick the tool:

1. **Match and rank text, with typos and filters?** Reach for a search engine (Elasticsearch / OpenSearch).
2. **Near a point, or inside a region?** Reach for geospatial (PostGIS for shapes and accuracy, Redis GEO for live points, H3/S2 at huge scale).
3. **Metrics over time, downsampled?** Reach for a time-series database (Prometheus, TimescaleDB, InfluxDB).
4. **Aggregate billions of rows over a few columns?** Reach for a columnar analytics store (ClickHouse, BigQuery, Snowflake).
5. **Fetch or update a few rows by key, with transactions?** Stay right where you are, on Postgres or MySQL.

And the senior move that ties it together: **polyglot persistence.** Keep your transactional database as the single source of truth, then stream changes out (using change-data-capture tools like Debezium and Kafka) into specialized stores: Elasticsearch for search, ClickHouse for analytics. Your writes stay safe and consistent; your reads get the perfect index for each question. The price is that the derived stores lag slightly behind the source, which is almost always a fine trade.

## A real example: how Uber finds your driver

Uber tracks millions of live drivers and answers a flood of "which drivers are closest to this rider, right now?" queries every second, in every city on Earth. That's the geospatial problem at extreme scale, with two twists: surge pricing needs to group supply and demand into *zones*, and analysts need to compare how busy London is versus Lima.

A regular database fails here on every front. Two B-tree indexes intersected scan huge candidate sets. A single PostGIS node can't keep up with millions of GPS updates per second across the whole planet. And a fixed latitude/longitude grid has cells of wildly different real-world size near the poles, so cross-city comparisons become dishonest.

So Uber built **H3**: it projects the globe onto a 20-sided solid and tiles it with **hexagons**, turning any coordinate into a single 64-bit number. Hexagons are a deliberate choice over squares, because all six neighbors share an edge and sit at roughly equal distance, which makes "expand the search ring" clean and simple. Finding nearby drivers becomes: convert the rider's location to a hex, grab that hex plus a couple of surrounding rings, union the drivers in those cells, and rank by true distance. That's the edge-problem fix from earlier, built in as a first-class operation.

The trade-off they accepted is elegant: you *cannot* perfectly tile a sphere with hexagons, so every H3 grid contains exactly **12 pentagons** (placed over the oceans, where almost nobody requests a ride) and parent cells don't nest perfectly into children. Uber traded perfect hierarchy for uniform, comparable cells and clean neighbor math. For a marketplace that cares about relative density, that's a great deal. For legal property boundaries, it would be the wrong call, and you'd use PostGIS polygons instead. H3 is now open-source and used far beyond Uber.

## Conclusion

The one idea to carry out of here: **an index is the frozen shape of a question, so when your question changes shape, change your index, not your hardware.** Reaching for a specialized store isn't exotic or premature optimization; it's recognizing that you're asking a 2-D question of a 1-D tool, and answering it honestly.

The natural next question is the awkward one polyglot persistence creates: if your order lives in Postgres but your search index lives in Elasticsearch, how do you keep them in sync without losing data, and what happens during the seconds they disagree? That's the world of change-data-capture and eventual consistency, and it's where the really interesting trade-offs begin.
