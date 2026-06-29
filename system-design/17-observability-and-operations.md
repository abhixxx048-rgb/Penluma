# 17 · Observability, SRE & Operating Systems at Scale

**What you'll learn:** How to know what a distributed system is doing when you can't attach a debugger — the three pillars (metrics, logs, traces), how to define what "working" means with SLIs/SLOs/error budgets, how to alert on user pain instead of CPU graphs, and how to ship changes (canary, blue-green, feature flags) and recover (runbooks, on-call) without taking the system down. You'll leave able to reason about cardinality, sampling, and the failure modes that turn a monitoring stack into a second outage.

**Prerequisites:** Read `01-fundamentals-and-estimation.md` (latency numbers, percentiles), `09-cap-pacelc-and-consistency.md` (why partial failure is normal), and `15-microservices-and-decomposition.md` (a request now crosses 10 services, which is *why* you need tracing).

---

## 1. Monitoring vs. Observability — the core distinction

**Monitoring** answers *known* questions: "Is CPU above 80%? Is the error rate above 1%?" You decide the questions in advance and build dashboards/alerts for them.

**Observability** is the property that lets you answer questions you *didn't* anticipate — "Why are checkouts failing only for tenant `acme`, only on Android, only since 14:03?" — *without shipping new code*. The bar: any novel slice of behaviour should be reconstructable from data you already emit.

**Analogy.** Monitoring is the dashboard warning lights in your car (oil, temp — predefined). Observability is being able to put the engine on a dyno and probe any sensor for a fault nobody pre-wired a light for. A control system is *observable* (Kalman's original term) if its internal state can be inferred from its outputs. Same idea: emit rich enough outputs that internal state is recoverable.

The practical consequence: high-cardinality, structured, contextual data beats pre-aggregated counters. A counter `http_errors_total` tells you *something* broke; a structured event with `{tenant, route, status, user_agent, build_sha, region}` tells you *what*.

---

## 2. The three pillars: metrics, logs, traces

```
            +-----------+        +-----------+        +-----------+
            |  METRICS  |        |   LOGS    |        |  TRACES   |
            +-----------+        +-----------+        +-----------+
  question  "is it bad?"        "what exactly       "where in the
            (aggregate health)   happened on this    request did it
                                 one event?"          go wrong?"
  shape     numbers over time   timestamped lines    spans w/ parent
  cost      cheap, bounded      cheap to write,      expensive, usually
            (if cardinality      pricey to store/      sampled
            controlled)          index
  cardinality LOW (must be)     HIGH (free-form)     HIGH (per request)
```

| Pillar | Best for | Worst for | Real systems |
|---|---|---|---|
| **Metrics** | Trends, SLOs, alerting, dashboards, capacity | Explaining a single weird request | Prometheus, VictoriaMetrics, Datadog, StatsD |
| **Logs** | Forensic detail on one event, audit trails, errors with stack traces | Aggregation at scale, "what's the p99?" | Loki, ELK/OpenSearch, Splunk |
| **Traces** | Latency breakdown across services, finding the slow hop | Long-term trends (you sampled most away) | Jaeger, Tempo, Zipkin, AWS X-Ray |

These are converging. **OpenTelemetry (OTel)** is the vendor-neutral standard (CNCF, merger of OpenTracing + OpenCensus) that emits all three with one SDK and *correlates* them: a metric anomaly links to exemplar traces, a trace links to the logs of its spans via shared `trace_id`. The end state is **wide structured events** (Honeycomb's model) — one fat event per unit of work with dozens of dimensions — from which metrics and traces are derived views.

### Structured logging — non-negotiable
Don't log `"user 42 failed checkout"`. Log:
```json
{"ts":"2026-06-16T14:03:11Z","level":"error","msg":"checkout_failed",
 "trace_id":"a1b2...","tenant":"acme","user_id":42,"order_total":129.50,
 "gateway":"stripe","error_code":"card_declined","build":"sha-9f3c"}
```
Now you can `count by error_code`, `filter tenant=acme`, and jump to the trace. Free-text logs force regex archaeology. Always inject the **`trace_id`** so logs ↔ traces correlate.

---

## 3. RED and USE — two methods for what to measure

You can't measure everything. These two complementary frameworks tell you *what* matters.

**RED (request-centric, for services)** — Tom Wilkie:
- **R**ate — requests/sec
- **E**rrors — failed requests/sec (and as a ratio)
- **D**uration — latency distribution (histogram → p50/p95/p99)

**USE (resource-centric, for infrastructure)** — Brendan Gregg:
- **U**tilization — % time the resource was busy
- **S**aturation — queued/waiting work (the leading indicator)
- **E**rrors — error events

| Method | Lens | Apply to | Catches |
|---|---|---|---|
| RED | What users experience | every service/endpoint | "checkout is slow / erroring" |
| USE | What resources are doing | CPU, disk, memory, queues, connection pools | "the DB pool is saturated → checkout will be slow next" |

**Key insight: saturation leads utilization.** A disk at 100% utilization isn't necessarily a problem; a disk with a *growing queue* (saturation) is about to be. The classic example is the connection pool: utilization can read "fine" while requests pile up *waiting* for a connection. Monitor queue depth, not just busy-ness.

**Always use histograms, never averages, for duration.** A mean latency of 50ms can hide a p99 of 4s. Averages are destroyed by skew; user pain lives in the tail (see `01-fundamentals-and-estimation.md` on percentiles). And remember **tail-latency amplification**: if one request fans out to 50 services each with a 1% chance of a slow response, the probability the *overall* request hits at least one slow hop is `1 - 0.99^50 ≈ 39%`. Your p99 service makes a p60 user experience.

---

## 4. Distributed tracing — the deep mechanics

A **trace** is a tree of **spans**. Each span = one unit of work (an HTTP handler, a DB query, a cache call) with a start/end timestamp, a `span_id`, a `parent_span_id`, and a shared `trace_id` for the whole request.

```
trace_id = a1b2c3
 ┌─────────────────────────────── span: POST /checkout (320ms) ───────────────┐
 │  ┌── span: auth.verify (12ms) ──┐                                            │
 │                ┌──────── span: pricing.calc (180ms) ────────┐               │
 │                │   ┌── span: db.query products (140ms) ◀── THE CULPRIT      │
 │                                       ┌── span: gateway.charge (95ms) ──┐    │
 └─────────────────────────────────────────────────────────────────────────────┘
```
Eyeballing the waterfall, the 140ms DB query inside pricing is the bottleneck — invisible to metrics, painful to find in logs, obvious in a trace.

### Context propagation
The magic is passing `trace_id` + `span_id` across process/network boundaries. The standard is **W3C Trace Context**: HTTP headers `traceparent` (`version-traceid-spanid-flags`) and `tracestate`. Every service reads the incoming header, creates a child span, and forwards an updated header downstream. For async/queues (Kafka, SQS), you propagate the same headers as **message attributes** — miss this and your trace breaks at every queue boundary (a very common bug).

### Sampling — you cannot trace everything
At 100k req/s, full tracing is petabytes/day. Two strategies:

| Strategy | When the decision is made | Pros | Cons |
|---|---|---|---|
| **Head-based** (e.g. sample 1%) | At ingress, before you know the outcome | Cheap, simple, decided once and propagated via the `sampled` flag | Drops 99% of traces — including the rare errors you most want |
| **Tail-based** | After the trace completes, at a collector | Keep 100% of errors + slow traces, sample the boring fast ones | Needs a buffering collector holding spans until trace ends; memory + complexity |

The pragmatic answer (OTel Collector tail sampling, Jaeger adaptive): **head-sample the happy path at ~1%, tail-keep all errors and all traces over your SLO latency.** The "sampled" bit must propagate consistently or you get partial traces (some services log the trace, others don't).

---

## 5. Cardinality — the silent killer

**Cardinality** = number of unique time series = product of all label-value combinations. In Prometheus, *every unique label combination is a separate stored series* with its own memory and disk.

```
http_requests_total{method, status, route, ...}

method:  5 values
status:  6 values
route:  20 values
                    →  5 × 6 × 20 = 600 series   ✅ fine

now add label user_id (1,000,000 users):
                    →  600 × 1,000,000 = 600,000,000 series   💥 OOM
```

This is the **cardinality explosion**, and it has killed countless Prometheus instances (a label with `email`, `request_id`, `timestamp`, `full URL with query string`, or a UUID is the usual culprit). Each series costs ~1–3 KB of RAM resident; tens of millions of series exhausts memory and the TSDB falls over — your *monitoring* causes an outage during the incident you needed it for.

**Rules:**
- Metric labels must be **bounded and low-cardinality**: method, status class, route *template* (`/orders/:id`, never `/orders/8675309`), region, tenant-tier (not tenant-id if you have millions).
- High-cardinality data (`user_id`, `request_id`, `trace_id`, exact URL) belongs in **logs and traces**, not metric labels. This is the cleanest division of labour between the pillars.
- Watch out for **unbounded values sneaking into labels**: error messages with embedded IDs, raw paths, customer-supplied input. Validate/template before they become a label.

For Print-Flow-360 specifically: a `tenant_id` label across thousands of stores will blow up Prometheus. Use `tenant_tier` or top-N tenants + an `other` bucket as a label; keep per-tenant detail in logs/traces queried on demand.

---

## 6. SLI / SLO / SLA & error budgets

This is the spine of SRE — it turns "is it up?" into an engineering contract.

- **SLI** (Indicator) — a *measured* number, expressed as a ratio of good events to total: `good_requests / total_requests`. E.g. "fraction of checkout requests served <300ms with 2xx/3xx."
- **SLO** (Objective) — the *internal target* for the SLI: "99.9% of checkouts succeed <300ms over 28 days."
- **SLA** (Agreement) — the *external, contractual* promise with financial penalties, always looser than the SLO (you alert internally well before you breach a customer contract).

```
 SLI  = what you measure        →  99.94% this week
 SLO  = your internal target    →  99.9%   (you have headroom)
 SLA  = customer contract       →  99.5%   (refunds if breached)
        SLA < SLO < actual SLI   ← the healthy ordering
```

### The "nines" — know the budget in minutes
| Availability | Downtime / 30 days | Downtime / year |
|---|---|---|
| 99%   | ~7.2 hours | ~3.65 days |
| 99.9% ("three nines") | ~43 min | ~8.76 hours |
| 99.95% | ~21.6 min | ~4.38 hours |
| 99.99% ("four nines") | ~4.3 min | ~52.6 min |
| 99.999% ("five nines") | ~26 sec | ~5.26 min |

Five nines means your *entire annual* downtime budget is ~5 minutes — less than a single deploy gone wrong. Each nine is roughly 10× harder and more expensive; pick the cheapest SLO users actually need. Most products don't need more than 99.9%.

### Error budget — the killer feature
`error budget = 1 − SLO`. At 99.9%, you're *allowed* 0.1% failures = ~43 min/month of badness. This budget is a currency:
- **Budget remaining → ship fast**, take risks, do that scary migration.
- **Budget exhausted → freeze features**, only reliability work ships until the budget recovers.

This dissolves the dev-vs-ops war: reliability isn't "max uptime at all costs," it's "stay within budget." 100% is the wrong target — it forbids all change and costs infinitely. Google's SRE book is built on this. **Burn-rate alerting** is the modern form: alert when you're consuming budget too fast (e.g. "at this rate the 28-day budget is gone in 6 hours") with multi-window (fast 5m + slow 1h) to be both responsive and resistant to flapping.

---

## 7. Alerting — on symptoms, not causes

The cardinal rule: **alert on user-visible symptoms (SLO violations), not on internal causes.**

> "High CPU" is *not* an alert-worthy symptom — a box can run at 95% CPU all day serving users perfectly. "Checkout success rate dropped below 99.9%" *is*. CPU is a *diagnostic* you consult *after* the symptom page fires.

| Anti-pattern alert | Why it's bad | Symptom-based replacement |
|---|---|---|
| CPU > 80% | Often harmless; pages at 3am for nothing | Latency p99 > SLO threshold |
| Disk 70% full | Not urgent (yet); a *ticket*, not a *page* | Disk will fill in <4h (predictive) |
| "Service X restarted" | Restarts can be normal (autoscaling) | Error rate up *for users* |
| One node down | Redundancy should absorb it | Capacity/quorum at risk |

**Every page must be actionable, urgent, and real.** If a human can't do something *now*, it's a ticket or a dashboard, not a page. The failure mode here is **alert fatigue**: when 90% of pages are noise, on-call learns to ignore them — and sleeps through the real one. Track your alert→action ratio; ruthlessly delete alerts nobody acts on.

Tune for **precision vs. recall**: too sensitive → false pages → fatigue; too lax → missed outages. SLO burn-rate alerts (above) are the principled way to balance both.

---

## 8. On-call & runbooks

A page is a contract with a human who's about to lose sleep. Discipline:
- **Runbooks**: every alert links to a runbook — "what this means, how to diagnose, how to mitigate, how to escalate." A page with no runbook is a research project at 3am. Runbooks should bias toward **mitigation first** (roll back, shed load, failover) and root-cause later.
- **Sustainable load**: cap pages/shift (Google's guidance: ≤2 incidents per 12h shift). More than that means you're under-investing in reliability and burning out humans.
- **Blameless postmortems**: every significant incident gets a written postmortem focused on *systemic* causes and action items, not who fumbled. Blame → people hide incidents → you stop learning. The output is a prioritized list of fixes, tracked to completion.
- **Error budget governs the postmortem teeth**: repeated budget burn forces the freeze, which forces the fixes to actually get prioritized over features.

---

## 9. Deployment strategies — changing a running plane's engine

Most outages are *caused by changes*. Deploy strategy is how you de-risk change.

```
ROLLING        v1 v1 v1 v1 → v2 v1 v1 v1 → v2 v2 v1 v1 → v2 v2 v2 v2
               (replace instances batch by batch; both versions live briefly)

BLUE-GREEN     [BLUE v1] ← 100% traffic     [GREEN v2] idle, warmed
               flip router → [GREEN v2] ← 100%   [BLUE v1] kept for instant rollback

CANARY         v1 ████████ 95%
               v2 █         5%  → watch SLIs → 25% → 50% → 100% (or roll back)
```

| Strategy | Rollback speed | Extra cost | Blast radius of a bad deploy | Schema/state risk | Use when |
|---|---|---|---|---|---|
| **Rolling** | Slow (roll forward batch by batch) | None (in-place) | Grows as rollout proceeds | Both versions must coexist | Default k8s deploy; stateless services |
| **Blue-green** | Instant (flip back) | 2× infra during cutover | All-or-nothing per flip | DB must serve both; hard with migrations | You need instant rollback & can pay 2× briefly |
| **Canary** | Fast (route 0% to canary) | ~1 extra version's worth | Limited to the canary % | Both versions coexist | High-traffic services where you can measure SLIs on the slice |
| **Feature flags** | Instant (toggle, no deploy) | Negligible | Per-flag, per-cohort | Decouples deploy from release | Risky features, gradual exposure, A/B, kill-switch |

**Feature flags decouple deploy from release** — code ships dark, then you turn it on for 1% → 100%, and *kill it instantly* without a redeploy when it misbehaves. This is exactly Print-Flow-360's `config/pdf_service.php` "all flags off by default" pattern (per CLAUDE.md): the new Node.js path is deployed but dormant, flipped per-feature, instantly revertable. The cost is **flag debt** — stale flags become dead conditional spaghetti; budget time to remove them.

**The hard part is always state.** Code rolls back in seconds; a database migration does not. The discipline is **expand/contract (parallel-change)**: (1) add new column/table — backward compatible; (2) deploy code that writes both old+new; (3) backfill; (4) switch reads to new; (5) stop writing old; (6) drop old — *later*. Never make a deploy and its schema change mutually dependent, or you can't roll back the code without a destructive DB revert. (This mirrors the API backward-compat rule in CLAUDE.md: add new field alongside old, migrate consumers, remove later.)

---

## 10. Health checks: liveness vs. readiness vs. startup

A subtle distinction that, gotten wrong, *amplifies* outages.

| Probe | Question | If it fails… | Gotcha |
|---|---|---|---|
| **Liveness** | "Is the process wedged/deadlocked?" | **Restart** the container | Must be *shallow* — don't check the DB here |
| **Readiness** | "Can this instance serve traffic *right now*?" | **Remove from load balancer** (don't kill) | Check deps that gate serving (pool warmed, caches primed) |
| **Startup** | "Has a slow-booting app finished initializing?" | Hold off liveness until done | Prevents killing apps that boot slowly |

```
        request → LB → [ready? yes → route] [ready? no → skip, try another]
        kubelet → liveness fail → kill+restart pod
```

**The classic cascading-failure trap:** you put a DB ping in your *liveness* probe. The DB has a transient blip → liveness fails on *every* instance simultaneously → Kubernetes restarts *all* of them at once → thundering-herd of cold instances hammer the recovering DB → total outage. The DB hiccup should have failed **readiness** (drop from LB, keep the process alive, recover when DB returns). **Rule: liveness checks the process; readiness checks dependencies.** Never let a shared dependency fail all your liveness probes in lockstep.

---

## 11. Common pitfalls / war stories

- **Averages hide the tail.** "Avg latency 40ms" while p99 is 3s and 1% of users rage-quit. Always histograms. Worse: averaging percentiles across hosts is mathematically meaningless — aggregate the histograms, then compute the percentile.
- **Cardinality bomb during an incident.** Someone adds `user_id` (or a raw URL, or an error string with an ID) as a Prometheus label "just to debug." Series count explodes, Prometheus OOMs, and you lose *all* monitoring mid-incident. High cardinality → logs/traces, never metric labels.
- **The trace that ends at the queue.** Tracing works beautifully until a request hits Kafka/SQS and nobody propagated `traceparent` in message headers — the trace silently truncates and the slow async consumer is invisible. Propagate context across *every* boundary, sync and async.
- **Liveness checks a dependency → synchronized mass-restart.** (See §10.) The single most damaging health-check mistake.
- **Alert fatigue.** 200 alerts, 5 meaningful. On-call mutes the channel; the one real page is missed. Delete noisy alerts aggressively; measure actionability.
- **100% uptime as the goal.** Forbids all deploys, costs infinitely, and there's no budget to take the risks that let you move fast. Pick the SLO users need and *spend* the error budget.
- **Head-sampling away your errors.** 1% head sampling keeps 1% of *errors* too — the exact traces you need are gone. Tail-sample to keep all errors/slow traces.
- **Logging PII / secrets in structured logs.** Now they're in your log index, replicated, retained, and discoverable. Scrub at the emission layer (relevant to the plaintext-CVV findings noted in this project's memory).
- **Dashboards as the alerting strategy.** Nobody's staring at Grafana at 3am. Dashboards are for *diagnosis after a page*; SLO alerts do the waking.

---

## 🧩 Case Study: Google Dapper + the SRE SLO/error-budget model

**The problem.** By the mid-2000s a single Google web search no longer hit one server — it fanned out to *thousands* of internal services (spell-check, ads, universal-search backends, ranking shards). When a search came back slow, an engineer staring at metrics could see "search p99 regressed" but had *no way* to know **which** of the thousands of downstream calls caused it. Logs from individual services were uncorrelated — there was no thread tying one user's request together across machines. At Google scale (billions of queries/day, tens of thousands of machines, requests fanning out 1:1000+), the classic "ssh in and read the log" approach was dead. They needed observability across a system no human could hold in their head.

**Dapper: trace context propagation, applied.** Dapper (the system Jaeger, Zipkin and OpenTelemetry trace later copied) is the **distributed tracing** pillar from §2 and §4 made real. Every request gets a `trace_id` at ingress. Each unit of work is a **span** with a `span_id` and `parent_span_id`, exactly the span tree from §4. The crucial trick is **context propagation** (§4): the trace context rides along inside Google's RPC framework, so *every* RPC automatically carries the trace IDs to the next hop — this is the W3C-Trace-Context idea before the standard existed. Because it was baked into the shared RPC library, instrumentation was nearly free per-team: you got tracing without touching app code.

```
 trace_id = 7f3a (one Google search)
 ┌──────────────────── span: /search frontend (210ms) ───────────────────────┐
 │  ┌─ span: spellcheck RPC (8ms) ─┐                                           │
 │        ┌──────────── span: web-index root (190ms) ──────────────┐          │
 │        │   fan-out to ~1000 leaf shards (RPC carries trace_id)   │          │
 │        │   ┌─ leaf-shard-877 (185ms) ◀── THE STRAGGLER          │          │
 │        │   ┌─ leaf-shard-002 (12ms) ─┐  ... 998 more ...         │          │
 │        ┌──────────── span: ads backend (40ms) ───────────┐                 │
 └────────────────────────────────────────────────────────────────────────────┘
```

The waterfall makes the one slow leaf shard (out of ~1000) instantly visible — the **tail-latency amplification** problem from §3 (`1 − p^N`), now *diagnosable* because the trace stitches the fan-out back together.

**Sampling — the key trade-off.** Tracing every one of billions of requests would cost more storage and network than the service being traced. Dapper accepted a hard trade-off: aggressive **head-based sampling** (§4). In practice it traced a *tiny* fraction of requests (on high-traffic services, well under 0.1%; early versions sampled ~1/1024). They **gave up completeness to get affordability** — and the bet held, because at high QPS even a small sample contains thousands of examples of any recurring latency pattern. The cost they paid is the §4/§11 pitfall: rare one-off errors can be sampled away. (Modern OTel tail-sampling — "keep all errors + slow traces" — is the industry's later correction to exactly this gap. Dapper chose simplicity and constant overhead over error-completeness.) The sampling decision is made once at ingress and *propagated* via the sampled flag, so a trace is either fully captured or not — no partial traces.

**SLOs and error budgets — the operating contract.** Tracing tells you *where* it broke; the SRE model from §6–8 tells you *whether you should care and what to do*. Google defines an **SLI** as `good events / total events` (e.g. fraction of requests served correctly under a latency threshold), sets an internal **SLO** (commonly 99.9–99.99% depending on the service), and derives an **error budget = 1 − SLO**. That budget is the currency from §6: while budget remains, teams ship features and run risky migrations; when it's burned, a **feature freeze** kicks in and only reliability work ships. This is what dissolved Google's dev-vs-ops tension — reliability became a *number with a budget*, not an argument.

Critically, Google alerts on **symptoms, not causes** (§7): pages fire on **SLO burn rate** ("at this rate the 28-day budget is gone in hours"), using multi-window alerts (a fast 5-minute window plus a slow 1-hour window) to be both responsive and resistant to flapping — not on "CPU > 80%." And new versions roll out as a **canary** (§9): route a small slice of traffic to v2, watch its SLIs against the baseline, and auto-roll-back if the canary's error/latency SLIs degrade — spending error budget deliberately and in a bounded blast radius.

**Results.** Dapper ran at Google with single-digit-percent (often <1%) request-latency overhead thanks to sampling, while still surfacing latency regressions across thousand-way fan-outs that were previously undebuggable. It became the template for an entire industry (Zipkin, Jaeger, OpenTelemetry). The SLO/error-budget model, published in the SRE book, is now the default reliability framework across the industry. Together they let Google operate services at availability targets (three-to-four-plus nines) while still deploying constantly — the apparent contradiction §6 resolves.

### Lessons
- **Bake context propagation into shared infrastructure, not app code.** Dapper got near-universal coverage because tracing lived in the RPC library — teams opted in for free. Retrofitting per-service instrumentation never reaches full coverage.
- **Sampling is a deliberate trade, and head-sampling's blind spot is errors.** Constant-overhead head sampling buys affordability at scale; if you must keep rare errors, layer tail-sampling on top — know which one you chose and why.
- **Tie the whole loop together: traces diagnose, SLOs decide, error budgets govern, burn-rate alerts wake you, canaries gate change.** Observability is wasted if it isn't connected to an operating contract that turns signals into decisions.
- **100% is the wrong target.** Google's success came from *spending* the error budget to move fast, not hoarding it — the SLO is set to what users actually need, and headroom is fuel for change.

## 12. Test yourself

1. **Why do metric labels need low cardinality but trace attributes don't?** *Hint: each unique metric label-combo is a separately stored time series (RAM/disk per series); traces are per-event and queried, not pre-aggregated.*
2. **Your service has p99 = 100ms but a user request fans out to 20 of them. Roughly what's the chance a request hits at least one p99-slow hop?** *Hint: `1 − 0.99^20 ≈ 18%`. Tail-latency amplification — your p99 is the user's ~p82.*
3. **At 99.9% SLO, how much monthly downtime is your error budget, and what should happen when it's exhausted?** *Hint: ~43 min; freeze feature work, ship only reliability fixes until budget recovers.*
4. **Why should a DB connectivity check live in the readiness probe, not the liveness probe?** *Hint: liveness fail = restart; a shared DB blip would restart all instances simultaneously → thundering herd → cascading outage. Readiness just removes from the LB.*
5. **Head-based vs. tail-based sampling — which keeps your error traces, and what does it cost?** *Hint: tail-based keeps errors/slow traces; cost is a buffering collector holding all spans until the trace completes (memory + complexity).*
6. **You must deploy v2 plus a column rename. Why can't you do both in one shot, and what's the pattern?** *Hint: code rolls back in seconds, destructive schema doesn't. Expand/contract: add column → dual-write → backfill → switch reads → drop old later.*
7. **Why is "CPU > 80%" a bad alert and "checkout success < 99.9%" a good one?** *Hint: alert on user-visible symptoms, not causes; high CPU can be harmless, success rate is what users feel. CPU is a post-page diagnostic.*
8. **What's the difference between an SLO and an SLA, and why is SLA < SLO?** *Hint: SLO is internal target, SLA is contractual w/ penalties; you keep headroom so you breach the internal alert long before the customer contract.*

---

## 13. Further reading

- **Google SRE Book** — *Site Reliability Engineering* (free at sre.google/books). Read: Ch. 4 (SLOs), Ch. 5 (eliminating toil), Ch. 6 (monitoring distributed systems), Ch. 10 (alerting on SLOs), Ch. 15 (postmortem culture). The canonical source for everything in §6–8.
- **Google SRE Workbook** — practical SLO/error-budget implementation, multi-window burn-rate alerting.
- **DDIA (Kleinmann), *Designing Data-Intensive Applications*** — Ch. 1 (reliability/percentiles/tail latency).
- **OpenTelemetry docs** (opentelemetry.io) — spec, context propagation, Collector tail sampling.
- **W3C Trace Context** spec (w3.org/TR/trace-context) — the `traceparent` header format.
- **Prometheus docs** — instrumentation best practices, histograms, *and* the cardinality warnings; PromQL `rate()`/`histogram_quantile()`.
- **Brendan Gregg — "The USE Method"** (brendangregg.com/usemethod.html).
- **Tom Wilkie — "The RED Method"** (Weaveworks/Grafana blog).
- **Charity Majors et al., *Observability Engineering* (Honeycomb)** — wide structured events, high-cardinality debugging, the "unknown unknowns" framing.
- **Cindy Sridharan, *Distributed Systems Observability*** (free O'Reilly report) — the three pillars deep dive.

**Cross-links:** percentiles & latency math → `01-fundamentals-and-estimation.md`; partial failure & consistency → `09-cap-pacelc-and-consistency.md`; why a request crosses many services (and needs tracing) → `15-microservices-and-decomposition.md`; resilience patterns that observability validates (circuit breakers, load shedding) → `16-resilience-and-fault-tolerance.md`.
