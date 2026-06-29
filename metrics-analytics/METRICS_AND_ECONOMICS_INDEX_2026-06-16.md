# Print-Flow-360 Metrics & Economics: Index and Operating System

> Internal index/synthesis doc. Researched 2026-06-16 via a multi-agent workflow (five parallel
> research streams - SaaS unit economics, cohort retention, funnel/event taxonomy, MRR/ARR/NRR,
> and low-ACV SMB attribution - each independently fact-checked, then synthesized here). Benchmarks
> in the five companion docs are flagged by confidence; treat vendor-blog percentages as
> **hypotheses to A/B-test on our own data**, not guarantees. Several widely-repeated SaaS-metrics
> "folklore" numbers were found to be mis-attributed or fabricated - each companion doc carries an
> explicit folklore-warnings section, and the worst offenders are summarized below.

## Executive Summary

Five companion research docs were written for the Print-Flow-360 team covering the full span of SaaS metrics and economics. Read together, they argue for **one coherent operating system**, not five separate dashboards. The unifying thesis: Print-Flow-360 is a **low-ACV, self-serve SMB print SaaS** sold to non-technical print-shop owners, so almost every "standard" SaaS metric you read about on vendor blogs is calibrated for the wrong company - enterprise-ACV, sales-led, $15M+ ARR public-company benchmarks that will mislead a cash-constrained team if adopted as targets.

The opinionated headline, consistent across all five streams: **at this stage, track a deliberately tiny set of metrics, built almost entirely in plain Postgres SQL on data you already have, and tie every one of them to the existing North Star - "store live + first order in 7 days."** Specifically: make **margin-adjusted CAC Payback (in months)** your single headline economic metric; make a **store-signup-month retention cohort triangle** your single headline retention artifact; keep **one clean MRR/ARR base** (subscription fees only, GMV reported separately); measure acquisition channels by **activated stores via a self-reported "How did you hear about us?" survey + first-touch UTM** (skip multi-touch attribution entirely); and instrument a **~14-event server-side funnel** whose only job is to measure activation. Everything else - Rule of 40, Rule of X, Magic Number, NRR-chasing toward enterprise 120%, multi-touch/DDA/MMM attribution, ChartMogul/Amplitude/Mixpanel - is **defer until later**. The cheapest tooling path (Postgres + a survey field + optionally PostHog) carries you a long way before any paid analytics platform earns its keep.

---

## Companion docs - table of contents

| # | Doc | Headline recommendation |
|---|-----|------------------------|
| 1 | [SaaS Unit Economics (CAC, LTV, Payback, Rule of 40)](./METRICS_SAAS_UNIT_ECONOMICS_2026-06-16.md) | Make **margin-adjusted CAC Payback (months)** the single headline economic metric on a fully-loaded CAC (founder time + free design tool serving cost), read alongside cohort churn; ignore Rule of 40 / Rule of X / Magic Number until repeatable measured S&M spend at ~$5M+ ARR. |
| 2 | [Cohort Analysis & Retention Curves](./METRICS_COHORT_RETENTION_2026-06-16.md) | Kill the single blended churn %; make a **store-signup-month retention triangle** in plain Postgres SQL, with "retained" defined on the print **reorder cadence** (not logins), the headline retention artifact - don't buy ChartMogul/Amplitude/Mixpanel until that view is genuinely the bottleneck. |
| 3 | [Funnel Analytics & Event Taxonomy](./METRICS_FUNNEL_EVENT_TAXONOMY_2026-06-16.md) | Adopt **PostHog**, fire all money/lifecycle events **server-side from the Laravel service layer**, identify on the **tenant uuid**, and ship a deliberately small **~14-event** plan whose single job is to measure `signup_completed → store_published → first_order_received` within 7–14 days. |
| 4 | [MRR / ARR / NRR Mechanics](./METRICS_MRR_ARR_NRR_2026-06-16.md) | Keep **ONE clean recurring-revenue base**: MRR/ARR = subscription plan fees only (normalized monthly); report platform **GMV and any take-rate revenue on a separate line**; accept **~97% NRR** as healthy for low-ACV SMB rather than chasing the wrong 120% enterprise target. |
| 5 | [Attribution for Low-ACV SMB](./METRICS_ATTRIBUTION_LOW_ACV_SMB_2026-06-16.md) | **Skip multi-touch attribution entirely**: ship a plain-language **"How did you hear about us?"** field + **first-touch UTM** capture, report channels by **activated stores** (North Star), and run a **holdout test** only when about to scale spend on a channel. |

---

## Recommended metrics stack for Print-Flow-360

The point of this index is restraint. A small team serving non-technical SMB owners should resist the temptation to build the dashboard a Series-B company has. Below is the short list that actually earns its keep at this stage.

### The single North Star (reuse, do not reinvent)
**Store live + first order within 7 days of signup.** This is already established in `CONVERSION_FUNNEL_RESEARCH_2026-06-15.md` as the activation event and `ACQUISITION_CHANNELS_2026-06-15.md` as the channel-quality yardstick. Every metric below should be read *through* this event - channels are judged by activated stores, cohorts are keyed on signup month, the funnel terminates on `first_order_received`, and CAC payback is computed against revenue from activated stores.

### Track these - weekly
| Metric | Source doc | Why now |
|---|---|---|
| New signups → stores published → first order (the activation funnel, by cohort week) | [3] | The North Star, instrumented; your single biggest leak lives here |
| Activation rate (% of signups hitting North Star within 7 days) | [3] | Leading indicator of everything downstream |
| Net new MRR + the 5-part movement (new / expansion / contraction / churn / reactivation) | [4] | One clean recurring-revenue base; catch churn early |
| Self-reported "How did you hear about us?" tally, by activated stores | [5] | Cheapest honest channel signal; no MTA needed |

### Track these - monthly
| Metric | Source doc | Why now |
|---|---|---|
| Margin-adjusted CAC Payback (months), fully-loaded CAC | [1] | The headline economic metric for a cash-constrained team |
| Store-signup-month retention cohort triangle (reorder-cadence "retained") | [2] | Replaces the blended churn %; shows whether the bucket leaks |
| GRR and NRR (SMB-calibrated: ~90% GRR, ~97% NRR are healthy) | [2][4] | Health of the base; do NOT target enterprise 120% |
| GMV and any take-rate revenue (separate line, never blended into MRR) | [4] | Keeps the recurring-revenue base clean and honest |

### Ignore until later (explicitly)
- **Rule of 40, Rule of X, Magic Number** - meaningful only with repeatable measured S&M spend at ~$5M+ ARR (most reliable $15–20M+/public). [1]
- **NRR-chasing toward 120%** - that's an enterprise/expansion-led target; ~97% is the right SMB number. [4]
- **Multi-touch attribution, data-driven attribution (DDA), media mix modeling (MMM)** - all overkill for a few-channel self-serve motion. [5]
- **Paid analytics platforms** (ChartMogul, Amplitude, Mixpanel) - don't buy until a Postgres view is genuinely the bottleneck, not before. [2][3]
- **N-day / fixed-window retention curves** - use unbounded/bracketed retention on the reorder cadence instead. [2]

### The cheapest tooling path
1. **Postgres SQL on data you already have** - the cohort triangle, MRR waterfall, GRR/NRR, and CAC payback are all plain queries against existing tables. Start with one **materialized cohort view + a simple admin heatmap**. This is ~90% of the value at ~0% of the platform cost. [2][4]
2. **A self-reported attribution field** - a single "How did you hear about us?" question at signup, plus first-touch UTM capture. No attribution vendor required. [5]
3. **PostHog (only when you need event-level funnel granularity)** - server-side events from the Laravel service layer, identified on tenant uuid, ~14-event plan. Defer even this until the SQL funnel can't answer your activation questions. [3]
4. **Defer heavy analytics platforms indefinitely** - revisit only when a specific question can't be answered cheaply.

---

## Sequencing - what to instrument first → last

The companion docs agree on order. Do not parallelize; each step makes the next cheaper and tells you whether the next is even needed.

1. **First - the activation funnel in SQL + the self-reported attribution field.** With one query you get the North Star, your biggest leak, and honest channel signal. Add the "How did you hear about us?" field and first-touch UTM at signup. (Docs [3], [5].)
2. **Second - the store-signup-month cohort retention triangle (materialized Postgres view + admin heatmap).** Define "retained" on the print reorder cadence. This replaces the blended churn % and reveals whether the bucket leaks. (Doc [2].)
3. **Third - the MRR movement waterfall + GRR/NRR, one clean base.** Subscription fees only; GMV/take-rate on a separate line. (Doc [4].)
4. **Fourth - margin-adjusted CAC Payback on a fully-loaded CAC.** Requires the activation/cohort data from steps 1–2 to attribute revenue to activated stores; include founder time and the free design tool's serving cost. (Doc [1].)
5. **Fifth (only if needed) - PostHog and event-level funnel granularity.** Adopt when the SQL funnel can no longer answer activation questions. (Doc [3].)
6. **Last / maybe never - Rule of 40 / Rule of X / Magic Number, multi-touch attribution, paid analytics platforms.** Revisit at ~$5M+ ARR or when scaling spend on a channel (then run a holdout test, not an MTA build). (Docs [1], [5].)

---

## Folklore warnings (summary - see each doc for the full list)

Adopting these as fact is a common and expensive mistake; each is debunked or re-sourced in its companion doc.

- The **"5% retention increase → up to 95% profit"** stat is **Bain/Reichheld** (a 25–95% range from 1990s studies), not original HBR research - attribute carefully. [1][2]
- **NRR ~120% is "healthy"** is an **enterprise/expansion-led** target, not an SMB one - ~97% is right for us; chasing 120% optimizes the wrong thing. [4]
- **">5:1 LTV:CAC means you're under-investing"** is not actually supported by The SaaS CFO; treat as a soft caveat, not a rule. [1]
- The **Mixpanel "2-second-to-90-day attribution window"** figure is fabricated - the real mechanics are a 2-second grace period and a separate (default ~7-day, up to 366-day) window. [3]
- **Rule of 40 has a firm floor of $X ARR** - it doesn't; it's a range (~$5M+ minimum, most reliable at $15–20M+/public). [1]
- **Salesforce / "90% use last-touch"** - replaced with eMarketer's ~78% last-click; the W-shaped ACV/cycle numbers commonly cited are fabricated. [5]
- Optifai / vendor-cohort CAC-payback and various **First Page Sage** 1–7-month figures are **self-serve floors or undisclosed-methodology vendor cohorts**, not targets. [1]

---

## Sources

These are the five companion research docs, each with its own fully-cited Sources section. This index does not introduce new external citations; it synthesizes theirs.

1. [SaaS Unit Economics (CAC, LTV, Payback, Rule of 40)](./METRICS_SAAS_UNIT_ECONOMICS_2026-06-16.md) - `readme/METRICS_SAAS_UNIT_ECONOMICS_2026-06-16.md`
2. [Cohort Analysis & Retention Curves](./METRICS_COHORT_RETENTION_2026-06-16.md) - `readme/METRICS_COHORT_RETENTION_2026-06-16.md`
3. [Funnel Analytics & Event Taxonomy](./METRICS_FUNNEL_EVENT_TAXONOMY_2026-06-16.md) - `readme/METRICS_FUNNEL_EVENT_TAXONOMY_2026-06-16.md`
4. [MRR / ARR / NRR Mechanics](./METRICS_MRR_ARR_NRR_2026-06-16.md) - `readme/METRICS_MRR_ARR_NRR_2026-06-16.md`
5. [Attribution for Low-ACV SMB](./METRICS_ATTRIBUTION_LOW_ACV_SMB_2026-06-16.md) - `readme/METRICS_ATTRIBUTION_LOW_ACV_SMB_2026-06-16.md`

**Related prior research (for grounding; do not contradict):**
- `readme/CONVERSION_FUNNEL_RESEARCH_2026-06-15.md` - North Star = store live + first order in 7 days; no-card 14-day reverse trial.
- `readme/ACQUISITION_CHANNELS_2026-06-15.md` - PRIMARY founder-led outreach + print communities; SECONDARY BOFU SEO + free design tool; SKIP paid search/affiliates.
