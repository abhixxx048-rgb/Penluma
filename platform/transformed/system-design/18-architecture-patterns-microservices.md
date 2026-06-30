---
title: 'Monolith vs Microservices: When to Split (and When Not To)'
metaTitle: 'Monolith vs Microservices: When to Split'
description: >-
  A clear guide to monolith vs microservices: how to find real service
  boundaries, migrate safely with strangler-fig, and cap blast radius with cells.
topic: system-design
topicTitle: System Design
category: Engineering
date: '2026-06-15'
order: 18
icon: "\U0001F3D7️"
author: Brexis Wazik
transformed: true
polished: true
linked: true
keywords:
  - monolith vs microservices
  - when to use microservices
  - microservices boundaries
  - bounded context
  - strangler fig pattern
  - distributed monolith
  - database per service
  - saga pattern
  - cell-based architecture
  - shuffle sharding
  - modular monolith
  - service mesh
  - api gateway vs bff
  - active-active multi-region
faq:
  - q: Should a startup use microservices?
    a: Usually no. Below roughly 15-20 engineers you almost never need them. Start with a modular monolith and extract a service only when it has a distinct scaling or failure profile.
  - q: What is the difference between a monolith and a microservice?
    a: A monolith is one deployable unit with one database and in-process function calls. Microservices are many independently deployable units, each owning its own database and talking over the network.
  - q: What is a distributed monolith?
    a: It is microservices that still depend on each other to deploy or share a database. You pay the full cost of distribution (network failure, latency, complexity) but get none of the independence.
  - q: How do you migrate a monolith to microservices safely?
    a: Use the strangler-fig pattern. Put a proxy in front of the monolith, carve out one bounded context at a time, route its traffic to the new service, and delete the old code. Never do a big-bang rewrite.
  - q: How do you handle transactions across microservices?
    a: You cannot use a single database transaction across services. Use a saga, a sequence of local transactions where each step has a compensating action that undoes it if a later step fails.
  - q: What is cell-based architecture?
    a: It partitions your entire stack into identical, isolated copies (cells) and pins each customer to one. A bad deploy or poison request in one cell only hurts that cell's slice of users instead of everyone.
sources: []
---

A six-person startup once split their product into twelve microservices "to be ready to scale." A year later they were spending 80% of their time on deployment pipelines, service discovery, and distributed debugging - and they still had zero traffic problems.

They solved an organizational problem they did not have, and inherited every cost of solving it.

This is the most expensive mistake in modern backend design. The good news: once you understand *what* microservices actually buy you, the decision gets simple. This guide walks you through when to split a system, where the real boundaries live, how to migrate without a rewrite, and the advanced isolation tricks that keep a bad day from becoming a company-wide outage.

## Why this matters

"Microservices" became a status symbol. Teams adopted them because big companies did, not because they had the problem big companies were solving.

Here is the truth that saves you years of pain: **microservices solve an organizational and isolation problem, not a clean-code problem.** They let many teams ship without stepping on each other, and they let one part of a system fail without taking down the rest.

If you do not have those problems, splitting your system gives you all the costs - network failures, eventual consistency, deploy orchestration, on-call rotations multiplied by N - and none of the benefits. Getting this decision right is the difference between a team that ships features and a team that babysits infrastructure.

## The core idea: a restaurant kitchen

The whole spectrum makes sense if you picture a kitchen.

A **monolith** is one chef cooking every dish at one big station. It is fast and simple when there is one chef - no coordination, everything within arm's reach. But you cannot add a second chef to the *same* station without collisions. To go faster, you have to clone the entire chef and their whole station, even if only the desserts are busy.

**Microservices** are specialized stations - grill, salad, pastry - each with its own tools and its own fridge, passing tickets to each other. You can staff the busy stations independently. But a dish that touches three stations now needs tickets to flow correctly, and if the pastry fridge dies, anyone who needed cream is stuck.

**Cells** are the realization that one giant kitchen serving 10,000 guests is a single point of catastrophe. So you build many identical *small* kitchens and route each table to exactly one. A fire in kitchen #7 ruins dinner for one-tenth of your guests, not all of them.

The whole progression trades **simplicity for independence and isolation** - and you pay in coordination, latency, and operational surface area. The senior skill is knowing how little of that trade you actually need.

## The option junior engineers skip: the modular monolith

Most people frame this as a binary: monolith or microservices. The crucial middle option is the **modular monolith**.

It is one deployable unit and one database, but with hard *internal* boundaries - separate schemas, no cross-module SQL joins, modules talking only through clean in-process interfaces. You get most of the design discipline of microservices with none of the network.

Here is how the three compare on the dimensions that actually decide things:

| Dimension | Monolith | Modular Monolith | Microservices |
|---|---|---|---|
| Deploy units | 1 | 1 | many, independent |
| Cross-boundary call | function call (nanoseconds) | function call (nanoseconds) | network call (~0.5-5 ms) |
| Transactions | ACID, free | ACID, free | sagas / eventual consistency |
| Team scaling | contention on one codebase | per-module ownership | full autonomy |
| Independent scaling | no | no | yes |
| Failure isolation | none | none (shared process) | per-service |
| Operational cost | low | low | high |
| Best for | MVP, under 5 engineers | most companies | large org, proven boundaries |

**Do not split early.** Shopify, GitHub, and Stack Overflow ran enormous monoliths for years. Shopify's "modular monolith" is the canonical proof that you can get boundary discipline without paying the distribution tax. Below roughly 15-20 engineers, you almost never need microservices - you need module discipline.

### The network tax is real, and the tail is the killer

A request that touches 4 modules in a monolith is 4 function calls - microseconds total. The same 4 as microservices is 4 network round trips.

At a typical 1 ms each, that is about 4 ms. Fine. But **tail latency compounds**. If each service is slow 1% of the time (say 20 ms at the 99th percentile), a serial chain of 4 rolls that dice four times - so your slow-case latency balloons far past any single service's. This "tail at scale" effect (described by Dean and Barroso at Google) is the silent killer of naive microservice designs.

## Finding the right boundaries

The number one cause of failed microservice migrations is splitting on the wrong axis.

**Do not split by technical layer** - a "database service" or an "auth service" that everyone calls synchronously just creates a network-attached bottleneck and a single point of failure. **Do not split by org chart** either. Split by **bounded context**: a region of your domain where a word has one unambiguous meaning.

The litmus test is the word "Order."

- In **Sales**, an Order is a cart with pricing.
- In **Fulfillment**, it is a pick-list with a shipping address.
- In **Billing**, it is an invoice line.

Same word, three different models. Each meaning is a bounded context, and the seam between them is a natural service boundary. (This idea comes from Eric Evans's *Domain-Driven Design*.)

### Heuristics for good boundaries

- **High cohesion, low coupling.** Things that change *together* belong together. If every feature touches two services, they are really one service wearing a costume.
- **Data ownership.** A service owns its data exclusively. If two services need to write the same table, you drew the line wrong.
- **Async over sync at the seam.** Contexts should integrate through *events* ("OrderPlaced") rather than synchronous queries where possible. This decouples their availability - one can be down without freezing the other.
- **Anti-corruption layer.** When one context consumes another's model, translate it at the edge so upstream changes do not leak in.

The right reason to extract a service is a **different operational profile** - a piece that has heavy CPU, different scaling, or a different failure mode than the rest. "It felt cleaner" is not a reason.

## How to migrate without a rewrite

If you decide to split, there is exactly one safe way to do it: the **strangler-fig pattern**.

It is named after the fig vine that grows around a host tree until the tree dies and only the fig's hollow shell remains. You grow the new system around the monolith and route traffic over to it piece by piece.

The opposite - the **big-bang rewrite** - is the most reliable way to fail. By the time your shiny "v2 from scratch" catches up to v1, the requirements have moved and you are maintaining two systems. (Joel Spolsky's essay "Things You Should Never Do" and the Netscape 6 collapse are the famous cautionary tales.)

The strangler steps:

1. Put a **facade or proxy** in front of the monolith so the boundary becomes movable.
2. Carve out *one* bounded context behind it.
3. Route that path to the new service.
4. **Replicate the data** during the transition.
5. Backfill and verify.
6. Cut reads over to the new service.
7. Delete the dead code in the monolith.

Then repeat. Each step is independently shippable and reversible.

### The hard part is data, not code

You will run a period where both old and new own a slice of the data. Three patterns help, in order of safety:

- **Change-data-capture (CDC).** A tool like Debezium tails the monolith's database log and feeds the new service. Reliable and decoupled.
- **The outbox pattern.** Write the business row and an event row in one local transaction; a relay process publishes the event. Atomic, with no fragile distributed transaction.
- **Dual writes.** Write to both the old and new store directly. Avoid this - if the process crashes between the two writes, you get silent inconsistency.

## The infrastructure that holds it together

Once you have multiple services, a few pieces of plumbing become necessary. The trick is to add each one only when you actually need it.

### API Gateway vs Backend-for-Frontend

An **API Gateway** is the single front door: authentication, rate limiting, routing, TLS termination. You usually run one (or one per region).

A **Backend-for-Frontend (BFF)** is a per-client API tailored to one frontend - one for web, one for iOS, one for Android. It exists because a mobile screen and a web dashboard need *different shapes* of the same data, and you do not want every backend service to know about UI concerns.

Keep the gateway dumb (cross-cutting concerns only) and push data-shaping into BFFs. The classic anti-pattern is a gateway that slowly grows business logic until it becomes a monolith you cannot deploy independently.

### Service mesh

A **service mesh** moves networking concerns *out of your application code* into a **sidecar proxy** (usually Envoy) running next to each instance. Your code makes a plain local call; the sidecar handles retries, timeouts, encryption between services (mTLS), load balancing, and [circuit breaking](/blog/system-design/16-rate-limiting-and-resiliency).

What it buys you: encryption everywhere, traffic shaping (roll a release out to 5%, then 50%, then 100%), and uniform resilience - all without recompiling your apps. Istio and Linkerd are the well-known options.

**But a mesh is overkill below roughly 10-15 services.** Sidecars add latency and real memory and CPU overhead per pod, and the control plane is notoriously complex. Start with a good HTTP client library that does timeouts, retries, and circuit breaking (like resilience4j or Polly), and graduate to a mesh only when polyglot services or compliance-grade encryption force your hand.

### Service discovery

Services come and go as they autoscale and redeploy, so hardcoded IP addresses are dead on arrival. Something has to track which instances are alive.

If you run on Kubernetes, this is mostly invisible: a `Service` gives you a stable DNS name and virtual IP, and traffic is load-balanced to healthy pods. The deep gotcha: **your health checks must reflect real readiness** - can this instance actually serve traffic, and are its dependencies up? Otherwise discovery will happily route requests to a zombie.

## The rule that makes it all work: database-per-service

Each service owns its database, and no other service touches it directly. This is the rule that makes services independently deployable - you can change one service's schema without coordinating a global migration.

Break it (share a database between services) and you have a **distributed monolith**: separate deploys but coupled at the data layer, so nothing is actually independent. The shared schema becomes a global contract nobody can change.

This rule creates two real problems. Here is how the field solves them.

### No cross-service joins

You cannot `JOIN` across a network. Two solutions:

- **API composition.** Fetch from each service and join in memory. Simple, but it means several calls and no database-level filtering.
- **CQRS.** Maintain a [read-optimized view that is fed by events](/blog/system-design/13-event-sourcing-and-cqrs). Fast reads, at the cost of eventual consistency and more moving parts.

### No distributed transactions - use a saga

"Reserve inventory AND charge the card AND create the shipment" spans three services. You cannot wrap that in one transaction at scale.

Instead you use a **saga**: a sequence of local transactions, each with a **compensating action** to undo it if a later step fails. Reserve inventory; charge the card; create the shipment - and if the shipment fails, refund the card, then release the stock, walking backward.

There are two styles:

- **Choreography** - services react to each other's events. No central coordinator, but the logic gets smeared across services and is hard to follow.
- **Orchestration** - one coordinator drives the steps. Explicit and debuggable, but it is a new component to run. Tools like Temporal, AWS Step Functions, and Camunda do this.

Sagas trade **atomicity for availability**, and they expose *intermediate* states to the world - an order can sit in "payment pending." You must design for that. Critically, **every step must be idempotent**, because at-least-once delivery means each step will eventually run more than once. A non-idempotent "charge card" step will double-charge someone. Give every step an [idempotency key](/blog/system-design/11-distributed-transactions-and-idempotency).

## Common misconceptions

**"Microservices make code cleaner."** No. Module boundaries make code cleaner, and you can have those in a monolith. Microservices add a network between your modules - that is a cost, not a cleanliness feature.

**"More services means more reliable."** Often the opposite. Four services at 99.9% availability in a synchronous chain give you about 99.6% combined - roughly 35 hours of downtime a year instead of 8.7. Serial sync chains multiply availability *down*.

**"We'll share the database now and split it later."** "Later" rarely comes, and until it does you have a distributed monolith. Fix the data ownership *during* the migration, not after.

**"A service mesh is best practice."** Installing Istio for 5 services and then spending a quarter debugging Envoy config is a cargo cult. Earn the mesh.

**"Microservices need to be tiny."** Size is not the goal. A service should be as big as its bounded context. Splitting into ever-smaller pieces just multiplies the network calls.

## The distributed monolith: the trap to avoid

This is the failure mode that gives microservices a bad name. You paid the full distribution tax and got none of the independence. Watch for these symptoms:

- **Synchronous call chains.** A calls B calls C calls D, each blocking on the next. Availability multiplies down and tail latency compounds.
- **A shared database** behind multiple services.
- **Lock-step deploys.** "You cannot release orders until pricing ships v2." If services must deploy together, they are one service.
- **Shared-library hell.** A change to a common data type forces a coordinated rollout of everyone.
- **Chatty interfaces.** One user action triggers 30 internal calls.

The fixes follow directly:

1. **Integrate via async events**, not synchronous calls, at the seam. This decouples services in time - B can be down when A acts.
2. **Enforce independent deployability** as a hard gate. Ask out loud: "Can I deploy this service alone, right now?" If not, you have work to do.
3. **Version your contracts** and never break consumers.
4. **Collapse chatty chains by moving the boundary.** If A always calls B, maybe A and B are one context.

## Capping the blast radius: cells and shuffle sharding

Here is the frontier that even good microservice shops miss. Even with perfect services, a single bad deploy, a poison-pill request, or one greedy tenant can take down a shared service for *everyone*.

**Cell-based architecture** fixes this by partitioning the *entire stack* into independent, identical copies - each with its own services and its own database - and pinning each customer to one cell.

The math is simple and powerful. With one shared stack, a fatal bug means 100% impact. With 10 equal cells, a cell-local failure means about 10% impact. Deploys roll out cell by cell, so a regression gets caught in one small cell before it reaches the rest.

The one shared piece is the **router** that maps each customer to a cell. Keep it dead simple - ideally a cached lookup table, never a smart service - because it is the only thing everyone depends on.

### Shuffle sharding: near-private isolation, cheaply

Plain cells still mean all the customers in cell #2 share a fate. **Shuffle sharding** (popularized by Colm MacCárthaigh at AWS) does something cleverer: it gives each customer a *random small subset* of nodes from a shared pool instead of one fixed cell.

A toy example: take 8 worker nodes and give each customer a random pair. There are 28 possible pairs. A customer who melts *both* of their nodes only fully knocks out the handful of other customers who happen to share that *exact same pair* - and the odds of any two customers sharing both nodes are tiny.

```
 Customer A -> {n1, n4}
 Customer B -> {n2, n7}   shares 0 nodes with A
 Customer C -> {n1, n7}   shares only 1 node with A (still served by n4)
```

You get isolation approaching "private infrastructure per customer" from a *shared* pool - at a fraction of the cost. AWS uses this in Route 53; it runs cell-based architecture across S3, DynamoDB, and Lambda; and Slack has publicly moved to cells.

### Multi-region, briefly

Cells generalize to whole regions. **Active-passive** (one region serves, another on warm standby) is simple but wastes capacity and carries failover risk. **Active-active** (all regions serve writes) maximizes availability but forces you to confront the hardest problem in the field: multi-region data consistency.

Active-active needs one of three approaches:

- **Partitioned writes** - each region owns a tenant's data. Easiest, and it maps perfectly onto cells.
- **Conflict-tolerant replication** (CRDTs or last-writer-wins) - eventual consistency, as in DynamoDB Global Tables.
- **A globally consistent store** like Google Spanner or CockroachDB - strong consistency, but cross-region commits pay the speed of light (tens to over a hundred milliseconds per round trip).

You cannot have low-latency global writes *and* strong consistency *and* partition tolerance. Physics and the [CAP theorem](/blog/system-design/09-cap-pacelc-consistency-models) both say no.

## How to use this

A practical decision path:

1. **Default to a modular monolith.** One deployable, one database, hard internal boundaries. Get the discipline before the distribution.
2. **Count your engineers and your real problems.** Under ~15-20 engineers with no scaling or isolation pain? Stay put. Spend the energy on features.
3. **Extract a service only for a distinct profile.** Heavy CPU work, different scaling, or a failure you need to isolate - that is a reason. "It feels cleaner" is not.
4. **Find boundaries by bounded context**, never by technical layer or org chart. Use the "what does this word mean here" test.
5. **Migrate with strangler-fig**, one context at a time. Never a big-bang rewrite. Solve the data with CDC or the outbox pattern, not dual writes.
6. **Make every service own its data.** No shared databases, ever. This is the rule that keeps deploys independent.
7. **Add infrastructure only when it hurts.** A resilient HTTP client before a service mesh; a gateway before BFFs; cells only when blast radius actually matters.
8. **Make saga steps idempotent** with idempotency keys, and prefer async events over synchronous chains at every seam.

## Conclusion

If you remember one thing, remember this: **independent deployability is the whole prize.** Ask "Can I deploy this service alone, right now?" If the answer is no, you do not have microservices - you have a distributed monolith, and you are paying full price for nothing.

Amazon proved both halves of this story. Jeff Bezos's famous service mandate forced every team to talk only through APIs and own its own data, which unlocked a deploy cadence measured in *seconds*. Then AWS pushed further into cells and shuffle sharding, turning what would have been platform-wide outages into incidents that touched a sliver of customers.

Notice that the moment you split a system, you inherit a new and unavoidable problem: keeping data consistent when it crosses a service boundary. That is where the real depth lives - the CAP theorem, eventual consistency, and the [messaging patterns](/blog/system-design/12-messaging-and-event-driven) that make async seams trustworthy. Those are the next doors to open, and they are the ones that separate engineers who *use* distributed systems from the ones who can actually keep them up.
