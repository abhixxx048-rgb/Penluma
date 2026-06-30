---
title: 'Load Balancing and Scaling: How Web Apps Survive Traffic Spikes'
metaTitle: 'Load Balancing & Scaling Explained Simply'
description: >-
  Learn how load balancing, stateless design, and autoscaling let one web app
  grow into a fleet that handles huge traffic spikes without crashing.
keywords:
  - load balancing
  - horizontal scaling
  - stateless design
  - autoscaling
  - L4 vs L7 load balancer
  - sticky sessions
  - power of two choices
  - read replicas
  - database sharding
  - load shedding
  - connection draining
  - health checks
  - graceful degradation
  - high availability
faq:
  - q: What is the difference between scaling up and scaling out?
    a: >-
      Scaling up (vertical) means buying a bigger server. Scaling out
      (horizontal) means adding more servers behind a load balancer. Scaling up
      is simpler but hits a ceiling and is a single point of failure; scaling out
      is effectively unbounded and survives a node dying.
  - q: What does "stateless" mean and why does it matter for scaling?
    a: >-
      A stateless server keeps no per-user data in its own memory. Sessions and
      data live in a shared store like Redis or a database. This lets any server
      handle any request, so you can add, remove, or restart servers freely
      without logging anyone out.
  - q: What is the difference between an L4 and an L7 load balancer?
    a: >-
      An L4 load balancer routes by IP address and port only, which is extremely
      fast. An L7 load balancer reads HTTP details like the URL path, headers,
      and cookies, so it can do smart routing like sending /admin to one pool and
      running canary releases.
  - q: Why do my users get logged out when I add a second server?
    a: >-
      You are almost certainly using sticky sessions stored on local disk or
      memory. When the load balancer sends a user to a different server, their
      session is not there. Move sessions to a shared store like Redis to fix it.
  - q: What is load shedding?
    a: >-
      Load shedding is deliberately rejecting requests you cannot serve, quickly
      and cheaply, to protect the requests you can. Serving 90 percent of traffic
      well beats serving 100 percent so slowly that everything times out.
  - q: Why does autoscaling on CPU often react too late?
    a: >-
      CPU is a lagging indicator and new servers take time to boot and warm up.
      By the time CPU crosses the threshold and capacity arrives, the spike may
      already have caused timeouts. Scaling on request count or queue depth reacts
      earlier.
topic: system-design
topicTitle: System Design
category: Engineering
date: '2026-06-15'
order: 7
icon: "\U0001F3D7️"
author: Brexis Wazik
transformed: true
polished: true
linked: true
sources: []
---

It is 3 a.m. Your app got featured somewhere big, traffic just went 10x, and the single server humming away in production is now a glowing brick. Requests are timing out. Pages are blank.

Here is the uncomfortable truth: no server is big enough. There is always a crowd that can overwhelm one machine. The real skill is not buying a bigger box - it is turning one app into a fleet that absorbs the crowd, shrugs off a dead machine, and keeps serving while you sleep.

This is how that fleet works, from the traffic cop out front to the database underneath.

## Why this matters

Most outages are not caused by clever attackers or rare bugs. They are caused by ordinary success: more users than the system was shaped to handle.

If you only know how to make one server faster, you will eventually hit a wall you cannot buy your way past - and that one server is also a single point of failure. The moment it dies, everything dies.

Knowing how to spread load across many machines changes the game. You get a system with **no hard ceiling**, that **survives a machine dying**, and that **grows roughly linearly with cost** instead of demanding luxury-priced hardware. Whether you are designing for an interview or keeping a real product alive, this is the foundation everything else sits on.

## One box is never enough

A single server has hard limits: CPU, memory, network bandwidth. When demand passes those limits, you have exactly two moves.

- **Scale up (vertical):** buy a bigger box.
- **Scale out (horizontal):** buy more boxes and spread the work across them.

Think of a popular restaurant with one chef. You can hire a faster chef, or you can open more kitchens and route orders between them.

The faster chef is simple, but no chef is fast enough forever - and if that one chef gets sick, dinner stops. Multiple kitchens are more complex (someone has to route orders, and what if a kitchen catches fire mid-order?) but there is no ceiling, and losing one kitchen does not close the restaurant.

### The honest trade-offs

Scaling up is dead simple - your code does not change at all - and it gives you the lowest latency because everything shares one machine's memory. But the cost curve is brutal at the top end, and you are still one failure away from a total outage.

Scaling out is the opposite. It survives failures and grows almost without limit, but it forces real engineering: you need stateless servers, a load balancer, and a way for machines to coordinate.

**The rule of thumb:** scale *up* the things that are hard to distribute (your main database), and scale *out* the things that are easy (your stateless app servers). Most real systems do both. A quick vertical bump buys you breathing room this afternoon; going horizontal is the long game.

## The traffic cop out front: load balancers

A **load balancer** sits in front of your fleet and decides which server handles each incoming request. The big distinction is *how much it looks at*.

- An **L4 load balancer** works at the [transport layer](/blog/system-design/02-networking-and-protocols). It only sees the IP address and port - like a mail sorter routing envelopes by postcode without opening them. It is blisteringly fast and handles millions of connections, but it cannot make smart decisions about *what* the request is.
- An **L7 load balancer** works at the application layer. It reads the actual HTTP request - the URL path, the headers, the cookies. It is the receptionist who reads each letter and routes it to the right department. Slower and more CPU-hungry, but far smarter.

Why does that smartness matter? An L7 balancer can send `/admin` to a hardened pool of servers, send `/render` requests to expensive GPU machines, and quietly route 5 percent of traffic to a new version to test it (a **canary release**). An L4 balancer sees none of that - it only knows "packets headed for port 443."

Many serious systems stack both: a fast L4 layer for raw throughput up front, with a smart L7 layer behind it for clever routing. Google's famous **Maglev** system, which we will return to at the end, is a pure L4 balancer handling the entire edge of Google.

## How to pick a server: balancing algorithms

Once a request arrives, the load balancer has to choose a backend. The choices range from naive to surprisingly clever.

- **Round-robin:** just cycle through servers 1, 2, 3, 1, 2, 3. Dead simple. The flaw: it ignores how *expensive* each request is, so a slow, struggling server still gets its full share.
- **Least-connections:** send the next request to whichever server has the fewest requests in flight. It adapts to slow servers, but it can stampede a freshly added empty server - which has zero connections, so it suddenly gets *all* the new traffic before its caches warm up.
- **Consistent hashing:** route the same user or key to the same server every time, so that server's [cache stays warm](/blog/system-design/06-caching-deep). The bonus: when you add or remove a server, only a small fraction of traffic gets reshuffled instead of everything.

### The surprising winner: pick two at random

Here is one of the most beautiful results in this whole field, and it sounds like a trick.

If you assign requests to servers **purely at random**, the busiest server ends up noticeably more loaded than average - the distribution is lumpy. But if you **pick two servers at random and send the request to the less busy of the two**, the imbalance almost vanishes. The busiest server is now barely above average.

That is it. One extra random glance, and the result improves *exponentially*. This is the **power of two choices**, and it is why modern proxies like NGINX, Envoy, and HAProxy default to it.

So why not just always use global least-connections, which sounds even smarter? Because at scale, your load balancer is *itself* many machines, and none of them has a perfect global view. Sharing exact connection counts between them is expensive and the data is always slightly stale. The power of two choices needs only two quick local samples - no coordination, no global view, no stale-data trap. It degrades gracefully where the "smart" option falls apart.

## Don't route to the dead: health checks

A server can die quietly - the process is still running, but the app is hung. The load balancer's job is to *notice and stop sending it traffic*.

It does this by pinging each server periodically (say, a `GET /healthz` every few seconds) and ejecting any server that fails repeatedly. Simple idea, dangerous detail.

There is a trap that has caused real, large outages: the **deep health check that takes down everything**. Imagine your health check, to be thorough, also pings the database. Now the database has a one-second hiccup. *Every* server's health check fails at once. The load balancer dutifully ejects *all* of them. A minor blip just became a total outage.

The fix is to separate two questions:

1. **Liveness - am I running?** A shallow, cheap check.
2. **Readiness - can I serve traffic right now?** A deeper check, but a *bounded* one.

Never let a shared-dependency check eject your entire fleet. Many load balancers also **fail open**: if more than half the servers report unhealthy, they assume the check itself is lying and route to everyone anyway - because a half-broken fleet still beats zero capacity. (Envoy calls this its panic threshold; Kubernetes formalizes the liveness-vs-readiness split with separate probes.)

One more nicety: **slow-start.** A freshly healthy server has cold caches and empty connection pools. Smart balancers ramp its traffic up gradually over a window rather than slamming it at full load instantly.

## The keystone trick: stateless design

This is the single most important idea in the whole article. Everything above only works because of it.

**The tempting wrong path is sticky sessions.** The load balancer pins each user to one specific server because that server holds their login session in its local memory. User A always goes to server 1; user B always goes to server 2.

It feels easy, and it bites you three ways:

- **You can't balance load freely.** A few heavy users pin to one box and overload it.
- **Every deploy logs people out.** Restart server 1, and every user pinned to it loses their session and their shopping cart.
- **Autoscaling fights you.** Removing a server evicts its users; adding a server gets ignored because existing users stay pinned to the old ones.

**The right path is stateless servers.** Each server holds *no* per-user data. Every request carries or can fetch everything it needs, and shared state lives in an external store:

- **Sessions** go in Redis or the database.
- **Data** goes in the database.
- **Uploaded files** go in object storage like S3.
- **Login claims** can ride inside the request itself, in a signed token (a **JWT**) the server simply verifies.

Now every server is identical and disposable. Any one can serve any request. Round-robin works perfectly, adding and removing servers is free, and a machine can die mid-deploy and nobody notices.

The cost is small and worth it: an extra hop of about half a millisecond to a couple of milliseconds to reach the shared store. (In Laravel, this is literally one setting - moving `SESSION_DRIVER` from `file` to `redis` turns a sticky app into a horizontally scalable one.)

**The honest exception is WebSockets.** A live socket connection genuinely *is* tied to one server - you cannot make it stateless. The trick there is to externalize the *fan-out* instead: use something like Redis pub/sub or a dedicated push service so any server can deliver a message to any user's open socket.

## Growing and shrinking the fleet: autoscaling

A fleet is only useful if its size tracks demand. There are two philosophies.

- **Reactive** scaling watches a metric and adds servers when it crosses a threshold ("CPU above 60 percent? add a machine").
- **Predictive** scaling forecasts load ahead of time and provisions *before* the spike, which works well when your traffic has a strong daily or weekly rhythm.

### The detail that catches everyone: the boot-time gap

Reactive scaling reacts to load you *already have*. But a new server is not instant - it takes time to boot, warm its caches, and report healthy. Say that takes 90 seconds.

Now traffic doubles in an instant while you are already at 70 percent CPU. You saturate immediately, but help is 90 seconds away. For those 90 seconds your users get timeouts and errors. This is a **brownout** - not a full crash, but a painful sag.

A few ways to avoid it:

1. **Scale on a leading indicator, not CPU.** Request count or queue depth climbs *before* CPU maxes out, giving you a head start.
2. **Keep headroom.** Run at 50 percent, not 80 percent, so you have slack while new servers boot.
3. **Use predictive scaling for known patterns** like a 9 a.m. login surge or Black Friday.
4. **Make cold starts faster** with pre-baked machine images or a warm pool of standby servers.

And watch out for **flapping**: scale out, CPU drops, scale in, CPU spikes, scale out again, forever. The fix is a cooldown period and asymmetric thresholds - scale out quickly, scale in slowly.

## Leaving gracefully: connection draining

When you remove a server - for a deploy, a scale-in, or a replacement - its in-flight requests must finish instead of getting cut off mid-sentence.

The right sequence is: first tell the load balancer to **stop sending new requests** to that server, but keep the server alive long enough to finish the requests it is already handling. Only then shut it down.

The bug almost everyone hits: the app shuts down the *instant* it is told to stop, before the load balancer has noticed. The balancer sends one more request to a now-dead server, and the user gets a 502 error. The fix is to drain first and exit second, with a grace period in between. (Kubernetes does this with a `preStop` delay and a termination grace period; AWS calls it a deregistration delay.)

This is also why important operations should be **idempotent** - safe to retry. Pair draining with [idempotency keys](/blog/system-design/11-distributed-transactions-and-idempotency) and a severed checkout request will not turn into a double charge.

## Scaling the database is a different beast

App servers scale out easily once they are stateless. The database is the hard part, because the database *is* the state - you cannot just make it stateless. There are two main techniques, and they solve different problems.

### Read replicas scale reads

You keep one **primary** database that takes all the writes, and you add **replicas** that copy the primary's data and serve reads.

This works beautifully for read-heavy apps, which is most apps - the typical web app reads far more than it writes. But notice what it *doesn't* fix: writes. Every write still goes through the single primary.

The classic gotcha is **replication lag**. A user saves something, then immediately reads it back from a replica that has not caught up yet - and sees their change vanish. "I just saved that, where did it go?" The fix is to route a user's reads to the primary for a few seconds right after they write.

### Sharding scales writes

When even the writes are too much for one primary, you **shard**: split the data itself across several independent databases by some key, like `user_id`. Each shard owns a slice of the data and takes a fraction of the writes.

This is the only thing on the list that truly scales writes - but it is the most painful. Queries that span multiple shards become hard or impossible, rebalancing is a chore, and a badly chosen shard key creates a **hot shard** that takes all the load while the others sit idle. Reach for it only when you genuinely need it.

Real systems combine these. PostgreSQL and MySQL do primary-plus-replica out of the box. Systems like Vitess shard MySQL, while Spanner and CockroachDB shard *and* replicate automatically with strong consistency. The order of moves is almost always: bigger box first, then read replicas, and sharding only when you must.

## Failing on purpose: graceful degradation

Here is the mindset shift that separates resilient systems from fragile ones. When demand exceeds *all* your capacity, you have two options: **degrade on purpose, or collapse by accident.**

A queue that grows without limit does not "handle" overload. It just adds delay until every request times out and the whole system drowns. Engineers call this congestion collapse, and "we never reject a request" is often how you get there.

**Load shedding** is the cure: drop the work you cannot serve, quickly and cheaply, to protect the work you can. It is better to serve 90 percent of users well and instantly reject the other 10 percent than to serve everyone so slowly that all of it times out.

You have a whole ladder of options, from gentle to brutal:

- **Graceful degradation:** turn off non-essential features under load - drop personalized recommendations and serve a generic cached page.
- **Rate limiting:** cap how many requests each client can make.
- **Brownout:** reduce quality, not availability - smaller images, shorter result lists.
- **Circuit breaker:** when a dependency keeps failing, stop calling it and fail fast instead of piling up.
- **Load shedding:** reject the excess outright with a fast "try again later."

The staff-level move is **prioritized shedding**: not all requests are equal, so drop the cheap-to-lose ones first. Shed a background prefetch before you ever shed a checkout.

## Common misconceptions

**"I just need a bigger server."** A bigger server delays the wall; it does not remove it. And it is still a single point of failure. Real resilience comes from many servers, not one giant one.

**"Sticky sessions are fine, they're simpler."** They are simpler until your first rolling deploy logs everyone out and your autoscaler starts fighting you. Externalizing state is a small cost paid once; sticky sessions are a tax paid on every deploy and every node failure.

**"Smarter routing is always better."** The power of two choices proves otherwise. A tiny bit of randomness with no coordination beats a "globally optimal" algorithm that depends on a perfect view nobody actually has.

**"Read replicas will scale my writes."** They will not. Replicas only scale reads. If writes are your bottleneck, you need sharding, which is a much bigger commitment.

**"Never reject a request."** Refusing to shed load is how you guarantee that *every* request fails. A bounded queue that sheds is healthier than an unbounded one that drowns.

**"Health checks should be as thorough as possible."** A health check that pings shared dependencies can eject your entire fleet the instant that dependency hiccups, turning a blip into an outage. Keep the basic liveness check shallow.

## How to design a system that survives a spike

A practical checklist, roughly in the order you would build it:

1. **Make your app tier stateless.** Move sessions, files, and data out of local server memory and into Redis, object storage, and the database. This unlocks everything else.
2. **Put a load balancer in front** - and run more than one so the balancer itself is not a single point of failure.
3. **Use the power of two choices** (or least-connections with slow-start) rather than plain round-robin.
4. **Split your health checks:** a shallow liveness check that stays up during dependency blips, plus a bounded readiness check.
5. **Autoscale on a leading indicator** like request count or queue depth, keep real headroom, and add a cooldown to avoid flapping.
6. **Drain connections on shutdown** and make critical operations idempotent so retries and double-charges are harmless.
7. **Scale the database deliberately:** bigger box first, then [read replicas](/blog/system-design/08-replication-and-partitioning) for read-heavy load (and route post-write reads to the primary), and shard only when writes truly outgrow one machine.
8. **Build in load shedding from the start.** Decide what to drop first, reject excess fast, and add [circuit breakers](/blog/system-design/16-rate-limiting-and-resiliency) plus retries with backoff and jitter so a slow dependency cannot trigger a retry storm.

## Conclusion

If you remember one thing, make it this: **statelessness is the keystone.** The moment your servers stop holding per-user state in their own memory, almost every scaling problem softens. Any server can serve any request, so balancing, autoscaling, deploys, and recovering from a dead machine all become routine instead of terrifying.

Everything else - the algorithms, the health checks, the draining, the load shedding - is in service of that one idea: build a fleet of identical, disposable machines and route work across them gracefully.

For a real-world masterclass, look up **Google's Maglev** load balancer. It pushes these principles to their limit: a fleet of ordinary servers, each completely stateless, each independently computing the *same* routing decision with zero coordination - so even when traffic gets rerouted between balancers mid-connection, the request still lands on the right backend. It is the clearest proof that the way to handle staggering scale is not a bigger box, but a smarter crowd of small ones.
