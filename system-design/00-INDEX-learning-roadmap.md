# System Design - Complete Learning Curriculum

This is a **self-study course**, not a stack of cheat-sheets. The goal is to take an
experienced web developer - someone comfortable shipping a CRUD app against one database -
all the way to **staff-level reasoning about distributed systems**: why linearizability is
expensive, why every cross-service "transaction" is a lie you have to engineer around, why
the speed of light shows up in your p99, and how to make defensible trade-offs under
uncertainty.

Each of the 20 modules is **teaching material**: it builds intuition first (plain analogies),
then precise mechanics, then the failure modes that show up in a 3 a.m. incident or a hard
interview question. Modules include back-of-the-envelope math, ASCII diagrams, comparison
tables, war stories, **Test-Yourself questions**, and pointers to the canonical papers.
They are meant to be *read in order and worked through*, not skimmed.

---

## How to use this curriculum

- **Read in tier order.** Later modules assume the vocabulary of earlier ones. The
  Distributed Systems Core (Tier 3) is the hard, load-bearing middle - don't skip to the
  interview module before it.
- **Do every Test-Yourself question before moving on.** If you can't answer in your own
  words, re-read - recognition is not understanding.
- **Build small versions.** A toy consistent-hash ring (300 lines), a token-bucket limiter
  in Redis, a tiny event-sourced ledger that rebuilds state by folding events. You learn
  replication lag by *causing* it, not by reading about it.
- **Read the cited papers.** The summaries here compress 30-page papers into paragraphs.
  Read Dynamo, Raft, and the Spanner paper in full at least once - they're more readable
  than their reputation.
- **Re-read after a real incident.** The modules land much harder once you've watched a
  retry storm take down your own service.

Budget roughly **one focused evening per module** for the fundamentals, **two** for the
Tier 3 distributed-systems modules. The whole curriculum is a multi-week effort - that's
expected.

---

## Suggested learning path

The 20 modules group into five tiers. Within a tier, modules listed as "parallel-OK" can be
read in any order; across tiers, finish the earlier tier first.

### Tier 1 - Fundamentals *(everyone, first)*
`01 → 02 → 03 → 06`
Estimation, networking, API design, and caching. This is the shared vocabulary and the
mental math (latency numbers, QPS, bytes) the whole rest of the course leans on. Module 01
is the absolute starting point.

### Tier 2 - Data & State
`04 → 05 → 07 → 08`
How a single database actually works (storage engines, indexes, transactions), how to model
data across SQL/NoSQL, then how to scale the serving tier (load balancing, stateless design)
and the data tier (replication, partitioning). **08 is the bridge into distributed systems.**

### Tier 3 - Distributed Systems Core *(the advanced heart)*
`09 → 10 → 11 → 12 → 13 → 14 → 15`
The conceptual center of gravity. CAP/PACELC and consistency models (09) and consensus (10)
are prerequisites for almost everything after. Distributed transactions/sagas (11), messaging
(12), event sourcing + CQRS (13), and stream processing (14) build directly on them.
Probabilistic structures (15) is more standalone and can be read in parallel with the others
once you have 09.

### Tier 4 - Architecture & Operating at Scale
`16 → 17 → 18 → 19`
Resiliency/rate-limiting (16) and observability/SRE (17) - parallel-OK with each other.
Then architecture patterns (18, monolith→microservices→cells) and specialized stores (19,
search/geo/time-series/OLAP), which assume Tiers 2 and 3.

### Tier 5 - Applied / Interview
`20`
The 7-step interview framework + ten worked case studies. Read it **last** - it's where every
prior concept gets exercised under a time budget. (You *can* skim it first to see where the
course is going, then return to it for real.)

```
 TIER 1 Fundamentals
 ┌──────────────────────────────────────────────┐
 │ 01 Estimation ─► 02 Networking ─► 03 APIs     │
 │        └──────────────────────► 06 Caching    │
 └───────────────────────┬──────────────────────┘
                         ▼
 TIER 2 Data & State
 ┌──────────────────────────────────────────────┐
 │ 04 DB Internals ─► 05 Data Modeling           │
 │ 07 Load Bal/Scaling ─► 08 Replication+Shard ──┼──┐  (08 = bridge)
 └──────────────────────────────────────────────┘  │
                                                    ▼
 TIER 3 Distributed Systems Core  (the hard middle)
 ┌──────────────────────────────────────────────┐
 │ 09 CAP/PACELC ─► 10 Consensus                 │
 │      │                 │                       │
 │      ▼                 ▼                       │
 │ 11 Dist Txns/Sagas   12 Messaging ─► 14 Stream│
 │                         └─► 13 EventSrc/CQRS   │
 │ 15 Probabilistic structures (parallel, needs 09)│
 └───────────────────────┬──────────────────────┘
                         ▼
 TIER 4 Architecture & Operating
 ┌──────────────────────────────────────────────┐
 │ 16 Resiliency/RateLimit ║ 17 Observability/SRE │
 │ 18 Arch Patterns (mono→micro→cells)            │
 │ 19 Specialized (search/geo/tsdb/OLAP)          │
 └───────────────────────┬──────────────────────┘
                         ▼
 TIER 5 Applied
 ┌──────────────────────────────────────────────┐
 │ 20 Case Studies & Interview Framework          │
 └──────────────────────────────────────────────┘
```

---

## Table of contents

| # | Module | What you'll learn | Difficulty |
|---|--------|-------------------|:----------:|
| 01 | [Foundations & Back-of-the-Envelope Estimation](./01-foundations-and-estimation.md) | Latency/throughput/storage numbers every engineer should know; sizing a system from user counts; the napkin math that anchors every design | ★☆☆☆☆ |
| 02 | [Networking & Protocols](./02-networking-and-protocols.md) | TCP/UDP, TLS, HTTP/1.1→2→3, DNS, the OSI mental model, and where the speed of light bites your latency budget | ★★☆☆☆ |
| 03 | [API Design & Service Communication](./03-api-design-and-communication.md) | REST vs gRPC vs GraphQL, versioning, pagination, idempotency, sync vs async communication patterns | ★★☆☆☆ |
| 04 | [Database Internals: Storage Engines, Indexes, Transactions](./04-databases-internals.md) | B-trees vs LSM-trees, the WAL, MVCC, isolation levels, how an index actually speeds a query | ★★★☆☆ |
| 05 | [Data Modeling: SQL vs NoSQL & Polyglot Persistence](./05-data-modeling-sql-nosql.md) | Normalization vs denormalization, document/wide-column/KV/graph models, picking the right store per access pattern | ★★★☆☆ |
| 06 | [Caching Deep Dive](./06-caching-deep.md) | Cache patterns (aside/through/behind), eviction, invalidation, TTLs, stampedes, and the layers from CPU to CDN | ★★★☆☆ |
| 07 | [Load Balancing, Scaling & Stateless Design](./07-load-balancing-and-scaling.md) | L4 vs L7, balancing algorithms, health checks, externalized state, autoscaling, read-replicas vs sharding, load shedding | ★★★☆☆ |
| 08 | [Replication & Partitioning (Sharding)](./08-replication-and-partitioning.md) | Single/multi/leaderless replication, sync vs async durability, lag anomalies, consistent hashing, rebalancing, routing | ★★★★☆ |
| 09 | [CAP, PACELC & Consistency Models](./09-cap-pacelc-consistency-models.md) | CAP stated correctly, PACELC, the linearizable→eventual spectrum, quorum math, isolation vs consistency | ★★★★☆ |
| 10 | [Consensus & Distributed Coordination](./10-consensus-and-coordination.md) | FLP impossibility, Paxos/Raft/ZAB, ZooKeeper/etcd, distributed locks + fencing tokens, leases, clocks | ★★★★★ |
| 11 | [Distributed Transactions, Sagas & Idempotency](./11-distributed-transactions-and-idempotency.md) | Why cross-service ACID fails, 2PC/3PC blocking, sagas + compensations, the outbox+CDC fix, delivery semantics | ★★★★★ |
| 12 | [Messaging, Queues & Event-Driven Architecture](./12-messaging-and-event-driven.md) | Queues vs logs, Kafka internals, ordering/delivery guarantees, backpressure, retries, DLQs, exactly-once limits | ★★★★☆ |
| 13 | [Event Sourcing & CQRS](./13-event-sourcing-and-cqrs.md) | State as an append-only event log, folding + snapshots, read projections, versioning/upcasting, when it's overkill | ★★★★☆ |
| 14 | [Stream Processing & Real-Time Systems](./14-stream-processing-realtime.md) | Batch vs stream, Lambda vs Kappa, event vs processing time, windowing, watermarks, checkpointing, exactly-once | ★★★★★ |
| 15 | [Probabilistic Data Structures & Algorithms at Scale](./15-probabilistic-structures-and-algorithms.md) | Bloom/Cuckoo filters, HyperLogLog, Count-Min, t-digest, Merkle trees, consistent hashing, geo indexes, skip lists | ★★★★☆ |
| 16 | [Rate Limiting, Resiliency & Fault Tolerance](./16-rate-limiting-and-resiliency.md) | The five rate-limiters, distributed Redis variants, timeouts, jittered retries, circuit breakers, bulkheads, chaos | ★★★★☆ |
| 17 | [Observability, SRE & Operating Systems at Scale](./17-observability-and-operations.md) | Metrics/logs/traces, RED/USE, tracing + sampling, SLI/SLO/error budgets, burn-rate alerts, canary/blue-green deploys | ★★★☆☆ |
| 18 | [Architecture Patterns: Monolith → Microservices → Cells](./18-architecture-patterns-microservices.md) | When (not) to split, DDD bounded contexts, strangler-fig, gateway/mesh, DB-per-service, distributed-monolith trap, cells | ★★★★☆ |
| 19 | [Specialized Systems: Search, Geo, Time-Series & Analytics](./19-specialized-systems-search-geo-timeseries.md) | Inverted indexes + BM25, geohash/quadtree/S2, TSDB compression, columnar OLAP, polyglot persistence via CDC | ★★★★☆ |
| 20 | [Case Studies & the System Design Interview Framework](./20-case-studies-and-interview-framework.md) | A 7-step design loop + ten worked designs (URL shortener, feed, chat, rideshare, payments…) and their load-bearing decisions | ★★★☆☆ |

---

## Mental models / first principles

These big ideas recur across nearly every module. If you internalize only ten things, make
it these:

1. **There is no free lunch - every choice is a trade-off.** Latency vs consistency, space
   vs accuracy, throughput vs durability. "Best" is meaningless without a workload.
2. **You can't beat the speed of light.** Cross-region round trips cost tens of
   milliseconds no matter how fast your code is. Geography sets the floor on your p99.
3. **Failure is the normal case, not the exception.** At scale, *something* is always
   broken. Design for partial failure, not for the happy path.
4. **State is the enemy of scaling.** Stateless services scale trivially; the hard problems
   all live where state must be shared, replicated, or agreed upon.
5. **Consistency, availability, and partitions force a choice** (CAP/PACELC) - and even
   without a partition you still trade latency against consistency on every request.
6. **Coordination is expensive; avoid it when you can.** Consensus, distributed locks, and
   linearizable reads cost round trips. The cheapest distributed system is one that needs
   no agreement.
7. **The dual-write problem is everywhere.** You cannot atomically update two systems. The
   answer is almost always *one* atomic write plus the outbox/log/CDC pattern.
8. **Idempotency is the antidote to "exactly-once."** True exactly-once delivery doesn't
   exist across a network; at-least-once + idempotent handlers is how production gets it.
9. **Indexes (and data layouts) are shaped like queries.** The right store/index is the one
   whose structure mirrors your read pattern - that's why polyglot persistence exists.
10. **Bound everything: timeouts, retries, queues, blast radius.** Unbounded anything
    becomes a cascading or metastable failure. Backpressure and isolation keep failures
    local.
11. **Eventual consistency is a UX problem as much as a data problem.** Read-your-writes and
    monotonic reads are often what users actually need - not full linearizability.
12. **Don't over-engineer.** A modular monolith on one Postgres handles more than most teams
    ever reach. Distribute only when a concrete forcing function demands it.

---

## Canonical resources

The course stands on these. Read the book; read the papers at least once each.

**Books**
- **Designing Data-Intensive Applications** (Kleppmann) - *the* companion to Tiers 2–3. If
  you read one book, read DDIA.
- **Google SRE Book** (+ *The SRE Workbook*) - backs Module 17; SLOs, error budgets, on-call.
- **The System Design Primer** (GitHub, donnemartin) - breadth review + interview drilling.

**Foundational papers**
- **Dynamo** (Amazon, 2007) - leaderless replication, quorums, consistent hashing, vector
  clocks (Modules 08, 09, 15).
- **Spanner / TrueTime** (Google, 2012) - external consistency via bounded-uncertainty clocks
  (Modules 09, 10).
- **Raft - In Search of an Understandable Consensus Algorithm** (Ongaro & Ousterhout, 2014)
  (Module 10).
- **MapReduce** (Google, 2004) and the **Kafka** paper (LinkedIn, 2011) - batch + the log
  (Modules 12, 14).
- **Bigtable** (Google, 2006) - wide-column/LSM design (Modules 04, 05).
- *Also worth it:* the **Paxos Made Simple** note, the **CAP** retrospective (Brewer, 2012),
  the **FLP impossibility** result, and the **HyperLogLog** paper.

**Courses**
- **MIT 6.824 Distributed Systems** - lectures + labs (build Raft yourself). The single best
  practical complement to Tier 3.

---

## Self-assessment milestones

You've internalized the curriculum when you can honestly check these off:

- [ ] I can **size a system for 10M users** - estimate QPS, storage, and bandwidth on a
      napkin and know the key latency numbers from memory. *(01)*
- [ ] I can explain **why linearizability is expensive** and when eventual/causal/session
      consistency is the right call instead. *(09)*
- [ ] I can **design a rate limiter that works across N servers** without a single hot
      counter, and reason about its accuracy/memory trade-off. *(16)*
- [ ] I can describe **how a write becomes durable** - WAL, replication, quorum - and what
      data you lose in each failover mode. *(04, 08)*
- [ ] I can explain **why you can't have a distributed transaction** across two services and
      design a saga with compensations + idempotency keys instead. *(11)*
- [ ] I can choose **the right datastore for an access pattern** and justify polyglot
      persistence wired via CDC. *(05, 19)*
- [ ] I can reason about a **retry storm / metastable failure** and name the mechanisms
      (jitter, budgets, circuit breakers, load shedding) that prevent it. *(16)*
- [ ] I can **operate** a service: define an SLO, set a burn-rate alert, and run a canary
      deploy with a safe schema migration. *(17)*
- [ ] I can decide **when NOT to use microservices** and recognize a distributed monolith
      from its symptoms. *(18)*
- [ ] I can walk into a **system design interview**, drive the 7-step framework, and defend
      the two or three load-bearing decisions of any design. *(20)*

Welcome in. Start with **[Module 01](./01-foundations-and-estimation.md)** and work forward.
