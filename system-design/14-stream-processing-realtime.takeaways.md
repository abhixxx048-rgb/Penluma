**This document explains how computer systems can react to information the moment it arrives - instead of waiting until the end of the day to run a report. It matters because things like catching fraud, showing live order counts, or updating a leaderboard require answers in seconds, not hours. Understanding this helps you design (or choose) systems that stay fast and accurate even under heavy load.**

**The main parts explained simply:**

- **Batch vs Stream** - A batch job is like waiting until the end of the day to count all your orders at once. A stream job is like counting every order the moment it comes in, continuously, with no stopping point. Batch is simpler and great for daily reports; streaming is needed when delays cost money.

- **Lambda vs Kappa architecture** - Two ways to build a streaming system. Lambda runs two separate pipelines side by side (one fast but rough, one slow but accurate) - this is a headache because you write the same rules twice and they slowly drift apart. Kappa runs just one pipeline and replays saved history to correct mistakes. Kappa is the recommended approach for new systems.

- **Event time vs processing time** - An event's "event time" is when it actually happened (e.g. a customer clicked at 2:03 PM). "Processing time" is when your server saw it (e.g. 2:07 PM because of a network delay). If you use the wrong clock, replaying old data gives different totals each time. Always use event time for anything where the numbers need to be consistent.

- **Windowing** - Because a stream never ends, you slice it into time buckets to do calculations. A "tumbling" window is non-overlapping fixed buckets (every 1 minute). A "sliding" window overlaps (last 5 minutes, checked every 1 minute). A "session" window closes automatically after a quiet gap (like a browser session). Choosing the wrong window type wastes memory or gives wrong results.

- **Watermarks and late data** - A watermark is the system's best guess that all events up to a certain moment have arrived. When the watermark passes the end of a time bucket, the system publishes that bucket's result. Events that arrive after the watermark are "late." You can drop them, route them aside for separate handling, or update the result - each option trades speed for accuracy.

- **Stateful processing and checkpointing** - Some calculations need to remember things (e.g. running totals per customer). This stored memory is called "state." If a server crashes, the system must restore that memory from a saved snapshot (checkpoint) and re-read events from where it left off - otherwise counts are wrong. Flink (a popular engine) does this without stopping the flow of data.

- **Exactly-once processing** - This means each event is counted exactly once in the final output, even if the network delivers it twice or a server crashes and replays it. Achieving this requires either writing results in a way that duplicates overwrite each other (idempotent), or using database-style transactions.

- **Stream-table duality** - A stream is a list of changes over time ("add 5", "subtract 3"). A table is the current total ("balance = 2"). They are two sides of the same coin. Modern systems like ksqlDB let you write a simple SQL query and the engine keeps the answer table up to date automatically as new events arrive - no scheduled refresh needed.

- **Joins on streams** - Combining two streams (e.g. matching an ad click to a later purchase) is tricky because both streams are infinite. You must set a time window ("only match events within 30 minutes of each other") to cap how much data the system has to remember. Without a window, memory grows forever and the system crashes.

- **Choosing an engine** - Flink is the most powerful tool for complex, low-latency work. Kafka Streams is simpler and runs inside your existing app with no separate server to manage. Spark Streaming is good if your team already uses Spark. SQL-based tools (ksqlDB, Materialize) are easiest if your team thinks in SQL.

**What to do with this:**

If you are building anything that needs real-time totals, fraud alerts, or live dashboards - always timestamp events at the source (event time), not at the server (processing time). Start with Kappa (one pipeline, replayable log) rather than Lambda (two pipelines) to avoid maintaining the same logic in two places.
