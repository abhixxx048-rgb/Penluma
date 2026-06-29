**This document explains how software systems pass work between their parts without making everything wait for everything else. Think of it like a print shop tray: a customer drops off an order and leaves, while the press operator picks it up when ready — nobody blocks anyone. Understanding this matters because it is the foundation of how large systems stay fast and reliable even when parts fail.**

**The main parts explained simply:**

- **Message queue vs message log** — A queue (like RabbitMQ or Amazon SQS) hands a job to one worker and deletes it once done — good for one-time tasks like "generate this thumbnail." A log (like Apache Kafka) keeps all messages in order and lets many different readers each read at their own speed — good for events that many systems care about, like "an order was placed."

- **Pub/Sub vs Competing workers** — You can send one message to every interested system at once (pub/sub, like broadcasting), or split work across many workers so each one handles a different piece (competing consumers, like a team sharing a task list). Most systems use both depending on the situation.

- **Kafka internals: topics, partitions, and offsets** — Kafka splits a stream into "partitions" (buckets), each handled by one worker at a time. A worker tracks how far it has read using an "offset" (like a bookmark). More partitions = more workers = more speed, but there are trade-offs.

- **Partition key — your most important Kafka decision** — Which bucket a message goes into depends on the key you choose. Choosing badly can overload one worker while others sit idle (called a "hot partition"). Choose a key that spreads work evenly or groups related events correctly.

- **Delivery guarantees** — Systems can promise: "maybe deliver once" (fast but lossy), "deliver at least once" (safe but may duplicate), or "deliver exactly once" (hard and complex). In practice, build for "at least once" and make your code safe to run twice instead of trusting "exactly once."

- **Backpressure and bounded queues** — When messages arrive faster than workers can handle them, the backlog grows. An unbounded backlog eventually crashes the system. The fix: limit the queue size, monitor how far behind workers are falling, and fail gracefully rather than silently.

- **Retries with jitter** — When something fails, do not retry immediately and all at once. Spread retries randomly over time (called "jitter") to avoid all workers hammering a recovering system at the same second, which would just break it again.

- **Dead-letter queues (DLQ)** — Some messages can never be processed (bad data, a deleted record, a bug). After a set number of failed attempts, move them to a "dead-letter" holding area instead of retrying forever. Always monitor this area and build a way to replay those messages once the problem is fixed.

- **Kafka exactly-once — what it really covers** — Kafka can guarantee a message is processed exactly once within Kafka itself, but the moment your code writes to a database or calls another service, that guarantee does not cross over. You still need to make those external actions safe to repeat.

- **LinkedIn and the origin of Kafka** — LinkedIn invented Kafka because they had dozens of systems all trying to share the same data, wired together in a tangled mess. A central replayable log collapsed that mess from "every pair wired separately" to "everyone reads from one place." The lesson: a shared event log simplifies integrations and lets late-arriving systems catch up by replaying history.

**What to do with this:** When building any feature that fires off background work (emails, thumbnail generation, order processing), use a queue or log rather than doing it inline — it keeps the user-facing response fast and the system resilient. Always make background workers safe to run twice on the same job, and always set up alerts on failed/stuck messages so problems surface immediately rather than silently.
