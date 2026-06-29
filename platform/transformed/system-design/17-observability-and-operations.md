---
title: 'Observability and SRE: Knowing Your System Is Healthy'
metaTitle: 'Observability & SRE: Metrics, Logs, Traces, SLOs'
description: 'Learn observability the practical way: metrics, logs, traces, SLIs and SLOs, error budgets, smart alerting, and safe deploys that recover without a second outage.'
keywords:
  - observability
  - SRE
  - metrics logs traces
  - distributed tracing
  - SLI SLO SLA
  - error budget
  - alerting best practices
  - canary deployment
  - blue-green deployment
  - feature flags
  - cardinality
  - OpenTelemetry
  - readiness vs liveness probe
  - tail latency
  - burn rate alerting
faq:
  - q: What is the difference between monitoring and observability?
    a: Monitoring answers questions you set up in advance, like "is CPU above 80%?" Observability lets you answer questions you never anticipated, like "why are only Android checkouts failing for one customer since 2pm," using data you already emit.
  - q: What are the three pillars of observability?
    a: Metrics (numbers over time that tell you something is wrong), logs (detailed records of single events), and traces (the path of one request across many services). Modern tools like OpenTelemetry tie all three together with a shared trace ID.
  - q: What is an error budget?
    a: An error budget is one minus your reliability target. At 99.9% uptime you are allowed about 43 minutes of failure per month. While budget remains you ship fast; when it runs out you freeze features and fix reliability.
  - q: What is the difference between an SLO and an SLA?
    a: An SLO is your internal reliability target. An SLA is the contractual promise to customers, usually looser, with financial penalties if broken. You keep the SLO tighter so you get warned long before you break the customer contract.
  - q: Why should you not alert on high CPU?
    a: A server can run at 95% CPU all day while serving users perfectly. CPU is a clue you check after a real problem, not a problem itself. Alert on user-visible symptoms like a falling checkout success rate instead.
  - q: What is the safest way to deploy a database change?
    a: Use expand and contract. Add the new column, write to both old and new, backfill, switch reads to new, then drop the old later. This keeps every step reversible because code rolls back in seconds but a destructive schema change does not.
topic: system-design
topicTitle: System Design
category: Engineering
date: '2026-06-15'
order: 17
icon: "\U0001F3D7️"
author: Pritesh Yadav
transformed: true
sources: []
---

It is 3am. Checkouts are failing, but only for one customer, only on Android, only since 2:03pm. Your dashboards are green. Your CPU graphs look fine. And you have no idea where to even start looking.

That gap between "the lights are green" and "I can actually explain what broke" is the whole subject of this article. The good news: there is a well-worn playbook for closing it, built by teams running systems far too large for any one person to hold in their head.

## Why this matters

A modern app is not one program on one server. A single click can fan out across ten, fifty, even a thousand internal services. When something goes wrong, you cannot attach a debugger and step through it. The request already finished, on a machine you will never log into, milliseconds ago.

So you need two things. First, **the ability to ask new questions of your running system** without shipping new code to answer them. Second, **a shared definition of what "healthy" even means**, so you know when to panic and when to relax.

Get this right and you sleep through the night, ship changes confidently, and recover from incidents in minutes. Get it wrong and your own monitoring becomes the second outage, your team drowns in false alarms, and every deploy feels like defusing a bomb.

## Monitoring tells you the known. Observability tells you the unknown.

**Monitoring** answers questions you decided on in advance: Is the error rate above 1%? Is memory running low? You build the dashboard, you set the alert, you wait.

**Observability** is the property that lets you answer questions you never thought to ask. "Why are checkouts failing only for tenant *acme*, only on Android, only since 14:03?" The bar is simple: any new slice of behaviour should be reconstructable from data you already emit.

Think of your car. The dashboard warning lights (oil, temperature) are monitoring: someone pre-wired each one. Observability is putting the engine on a diagnostic bench and probing any sensor for a fault nobody built a light for.

The practical lesson is about the *shape* of your data. A counter that says `http_errors_total` tells you *something* broke. A rich, structured event tagged with `{tenant, route, status, device, build, region}` tells you *what* broke. Detailed, contextual data beats pre-summarized numbers when you are debugging the unexpected.

## The three pillars: metrics, logs, traces

Three kinds of data answer three different questions.

- **Metrics** answer *"Is it bad?"* They are numbers over time: request rate, error rate, latency. Cheap to store, great for dashboards and alerts, useless for explaining one weird request. Tools: Prometheus, Datadog, Grafana.
- **Logs** answer *"What exactly happened on this one event?"* They are timestamped records. Perfect for forensic detail and audit trails, but terrible at answering "what's the p99?" across millions of events. Tools: Loki, OpenSearch, Splunk.
- **Traces** answer *"Where in the request did it go wrong?"* They follow one request across every service it touches. Brilliant for finding the slow hop, weak for long-term trends. Tools: Jaeger, Tempo, Zipkin.

These three are converging. **OpenTelemetry** is the vendor-neutral standard that emits all three from one toolkit and links them together: a suspicious metric points you to example traces, and a trace links to the logs of each step through a shared `trace_id`.

### Structured logging is non-negotiable

Do not log `"user 42 failed checkout"`. That forces you into regex archaeology later. Instead, log structured data:

```json
{"ts":"2026-06-16T14:03:11Z","level":"error","msg":"checkout_failed",
 "trace_id":"a1b2...","tenant":"acme","user_id":42,"order_total":129.50,
 "gateway":"stripe","error_code":"card_declined","build":"sha-9f3c"}
```

Now you can count by `error_code`, filter to `tenant=acme`, and jump straight to the trace. Always include the **`trace_id`** so a log line and the trace it belongs to connect with one click.

## What to actually measure: RED and USE

You cannot measure everything, so two simple frameworks tell you what counts.

**RED** is for services, and looks at what users experience:

- **Rate** — requests per second
- **Errors** — failed requests per second
- **Duration** — how long requests take

**USE** is for infrastructure (CPU, disk, queues, connection pools):

- **Utilization** — how busy the resource is
- **Saturation** — how much work is queued and waiting
- **Errors** — error events

The key insight is that **saturation leads utilization**. A disk at 100% busy is not necessarily a problem. A disk with a *growing queue* is about to be one. The classic trap is the database connection pool: utilization can read "fine" while requests silently pile up waiting for a free connection. Watch the queue, not just the busy-ness.

### Always use the tail, never the average

A mean latency of 50ms can hide a p99 of 4 seconds. Averages get destroyed by skew, and user pain lives in the tail. Use histograms and percentiles, not averages.

This matters more than it sounds, because of **tail-latency amplification**. If one request fans out to 50 services, each with a 1% chance of being slow, the odds that *at least one* hop is slow is `1 - 0.99^50`, about **39%**. Your individually-excellent p99 service adds up to a frustrating experience for a large chunk of users.

## Distributed tracing: following one request across the maze

A **trace** is a tree of **spans**. Each span is one unit of work (an HTTP handler, a database query, a cache lookup) with a start time, an end time, and a link to its parent. They all share one `trace_id`.

```
trace_id = a1b2c3
 POST /checkout (320ms)
   auth.verify (12ms)
   pricing.calc (180ms)
     db.query products (140ms)  <-- THE CULPRIT
   gateway.charge (95ms)
```

One glance at this waterfall and the 140ms database query inside pricing is obviously the bottleneck. That fact is invisible to metrics and painful to dig out of logs, but instantly clear in a trace.

The magic that makes this work is **context propagation**: passing the trace ID across every network boundary. The standard is W3C Trace Context, which rides along in an HTTP header called `traceparent`. Each service reads it, creates a child span, and forwards an updated header onward.

There is a notorious bug here. When a request hits a message queue like Kafka or SQS, you must propagate the same trace context as a message attribute. Miss it, and your trace silently dies at the queue, hiding the slow downstream consumer completely.

### You cannot trace everything

At 100,000 requests per second, tracing all of them is petabytes a day. So you sample. There are two approaches:

- **Head-based sampling** decides at the start, before you know the outcome (for example, keep 1%). Cheap and simple, but it throws away 99% of traces, *including the rare errors you most want to see*.
- **Tail-based sampling** decides after the request finishes. You can keep 100% of errors and slow requests while discarding the boring fast ones. More powerful, but it needs a collector that buffers spans until the request completes.

The pragmatic answer most teams land on: head-sample the happy path at around 1%, and tail-keep every error and every request slower than your target.

## Cardinality: the silent killer of monitoring

This one deserves its own warning, because it turns your monitoring into the outage.

**Cardinality** is the number of unique time series you store. In Prometheus, every unique combination of label values is a separate stored series, each with its own memory and disk cost.

```
http_requests_total{method, status, route}
  method: 5 values
  status: 6 values
  route:  20 values
  -> 5 x 6 x 20 = 600 series   (fine)

now add user_id with 1,000,000 users:
  -> 600 x 1,000,000 = 600,000,000 series   (out of memory)
```

That is a **cardinality explosion**, and it has killed countless monitoring systems. The usual culprit is someone adding a label like `user_id`, `request_id`, an email, or a raw URL. Series count detonates, Prometheus runs out of memory, and you lose all your monitoring during the exact incident you needed it for.

The rule is a clean division of labour:

- **Metric labels must be low and bounded:** method, status class, the route *template* (`/orders/:id`, never `/orders/8675309`), region, customer tier.
- **High-cardinality data belongs in logs and traces:** `user_id`, `request_id`, exact URLs, error messages with embedded IDs. These are queried on demand, not pre-aggregated.

## SLIs, SLOs, SLAs, and the error budget

This is the spine of Site Reliability Engineering. It turns the vague question "is it up?" into an engineering contract.

- **SLI (Indicator)** — a number you actually measure, as a ratio of good events to total. For example, "the fraction of checkouts served in under 300ms with a success code."
- **SLO (Objective)** — your internal target for that number. "99.9% of checkouts succeed under 300ms over 28 days."
- **SLA (Agreement)** — the external promise to customers, with financial penalties, always looser than your SLO.

The healthy ordering is **SLA < SLO < actual performance**. You keep internal headroom so you get warned long before you break a customer's contract.

### Know your budget in minutes

| Availability | Downtime per 30 days | Downtime per year |
|---|---|---|
| 99% | ~7.2 hours | ~3.65 days |
| 99.9% (three nines) | ~43 min | ~8.76 hours |
| 99.99% (four nines) | ~4.3 min | ~52.6 min |
| 99.999% (five nines) | ~26 sec | ~5.26 min |

Five nines means your *entire annual* downtime budget is about five minutes, less than a single bad deploy. Each extra nine is roughly ten times harder and more expensive. Most products do not need more than 99.9%, so pick the cheapest target your users genuinely need.

### The error budget is the killer idea

Your **error budget** is simply `1 - SLO`. At 99.9%, you are *allowed* roughly 43 minutes of badness per month. Treat that budget as a currency:

- **Budget remaining?** Ship fast, take risks, run that scary migration.
- **Budget exhausted?** Freeze features. Only reliability work ships until the budget recovers.

This single idea dissolves the old developers-versus-operations war. Reliability is no longer "maximum uptime at all costs," it is "stay within budget." Targeting 100% is the wrong goal: it forbids all change and costs infinitely.

The modern form is **burn-rate alerting**: page someone when the budget is being spent too fast (for example, "at this rate the 28-day budget is gone in six hours"), using both a fast and a slow window so it is responsive without flapping.

## Alert on symptoms, not causes

Here is the cardinal rule of alerting: **page on user-visible symptoms, not internal causes.**

"High CPU" is not page-worthy. A box can run at 95% CPU all day and serve everyone perfectly. "Checkout success rate dropped below 99.9%" *is* page-worthy. CPU is a diagnostic you consult *after* the symptom alert fires.

| Bad alert | Why it's bad | Symptom-based replacement |
|---|---|---|
| CPU > 80% | Often harmless; wakes you for nothing | Latency p99 above your target |
| Disk 70% full | Not urgent yet; a ticket, not a page | Disk will fill within 4 hours |
| "Service restarted" | Restarts can be normal | Error rate up *for users* |
| One node down | Redundancy should absorb it | Capacity or quorum at risk |

The failure mode to fear is **alert fatigue**. When 90% of pages are noise, on-call learns to ignore the channel, then sleeps through the one that matters. Track how often each alert leads to a real action, and ruthlessly delete the ones nobody acts on.

## On-call and runbooks: respecting the human

A page is a contract with a person who is about to lose sleep. A few disciplines keep that humane and effective:

- **Every alert links to a runbook:** what this means, how to diagnose, how to mitigate, how to escalate. A page with no runbook is a research project at 3am. Runbooks should favour *mitigation first* (roll back, shed load, fail over) and root cause later.
- **Cap the load:** Google's guidance is no more than two incidents per 12-hour shift. More than that means you are under-investing in reliability and burning people out.
- **Blameless postmortems:** every serious incident gets a written review focused on *systemic* causes, not who fumbled. Blame makes people hide incidents, and then you stop learning.

## Deploying without taking the plane down

Most outages are *caused by changes*. Your deploy strategy is how you de-risk change.

- **Rolling** replaces instances batch by batch. It is the default, free, and fine for stateless services, but rollback is slow.
- **Blue-green** runs two full environments and flips traffic between them. Rollback is instant, but you pay for double the infrastructure during the cutover.
- **Canary** sends a small slice of traffic (say 5%) to the new version, watches its metrics, and ramps up only if it looks healthy. Limited blast radius, ideal for high-traffic services.
- **Feature flags** decouple deploying code from releasing it. The code ships dark, then you turn it on for 1% of users, then 100%, and you can kill it instantly with no redeploy.

Feature flags are powerful, but they carry **flag debt**: stale flags rot into tangled dead conditionals, so budget time to remove them once a feature is fully live.

### The hard part is always state

Code rolls back in seconds. A database migration does not. So never tie a deploy and its schema change together in a way you cannot reverse. Use **expand and contract**:

1. Add the new column or table (backward compatible).
2. Deploy code that writes to both old and new.
3. Backfill existing data into the new shape.
4. Switch reads to the new column.
5. Stop writing the old one.
6. Drop the old column *later*, once you are sure.

Each step is independently reversible, so a bad deploy never forces a destructive, irreversible database revert.

## Liveness vs. readiness: the probe that amplifies outages

This subtle distinction, gotten wrong, turns a small blip into a full outage.

- A **liveness** probe asks "is the process wedged or deadlocked?" If it fails, the orchestrator *restarts* the container. Keep it shallow.
- A **readiness** probe asks "can this instance serve traffic right now?" If it fails, the instance is *removed from the load balancer* but kept alive.

Here is the classic cascading-failure trap. You put a database ping in your *liveness* probe. The database has a brief hiccup, so liveness fails on *every* instance at once, so Kubernetes restarts *all of them simultaneously*, and a thundering herd of cold instances hammers the recovering database into total collapse.

That database blip should have failed *readiness* instead: each instance quietly drops out of the load balancer, stays alive, and rejoins when the database recovers. The rule: **liveness checks the process, readiness checks dependencies.** Never let a shared dependency fail all your liveness probes in lockstep.

## Common misconceptions

- **"The average latency is fine, so we're fine."** Averages hide the tail. A 40ms average can sit on top of a 3-second p99 that makes 1% of users rage-quit. Always use histograms, and never average percentiles across hosts, which is mathematically meaningless.
- **"I'll just add user_id as a label to debug this."** That is the cardinality bomb that takes down your monitoring mid-incident. High-cardinality data goes in logs and traces, never metric labels.
- **"100% uptime is the goal."** It forbids all change, costs infinitely, and leaves no budget to take the risks that let you move fast. Pick the SLO users need and *spend* the budget.
- **"We'll watch the dashboards."** Nobody is staring at Grafana at 3am. Dashboards are for diagnosis *after* a page. SLO-based alerts do the waking.
- **"Sampling 1% is fine."** Head-sampling at 1% keeps only 1% of your errors too, throwing away the exact traces you need. Tail-sample to keep all errors and slow requests.

## How to use this

1. **Make logs structured today.** Emit JSON with a `trace_id` on every line. This is the cheapest, highest-leverage change you can make.
2. **Adopt OpenTelemetry** so metrics, logs, and traces correlate through a shared trace ID instead of living in three disconnected silos.
3. **Audit your metric labels for cardinality.** Hunt down any `user_id`, `request_id`, raw URL, or unbounded error string and move it to logs or traces.
4. **Define one SLI and SLO** for your most important user journey. Start with checkout success rate or end-to-end latency, not infrastructure metrics.
5. **Replace cause-based alerts with symptom-based ones.** Delete the CPU page; add a burn-rate alert on your SLO.
6. **Attach a runbook to every alert** that survives. If a page has no runbook and no action, make it a ticket or delete it.
7. **Pick a safe deploy strategy** (canary or feature flags) and adopt expand-and-contract for every schema change.
8. **Fix your health probes.** Move dependency checks out of liveness and into readiness before they cause a synchronized mass restart.

## Conclusion

If you remember one thing, make it this: **observability and SRE only pay off when signals turn into decisions.** Traces tell you *where* it broke, SLOs tell you *whether to care*, the error budget tells you *what to do about it*, and burn-rate alerts decide *when to wake someone up.* Disconnected, each is just data. Wired together, they let you operate a system no human could hold in their head while still shipping every day.

The deeper rabbit hole from here is resilience: circuit breakers, load shedding, and bulkheads, the patterns that stop a single slow dependency from dragging down everything around it. Observability is how you *prove* those patterns are working, which raises a sharper question: if your system is designed to degrade gracefully under failure, how would you even know it just saved you?
