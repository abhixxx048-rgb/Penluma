# Cohort Analysis & Retention Curves (vs. Simple Churn %)

> Researched 2026-06-16 via a multi-agent research workflow (fan-out search + adversarial fact-check). The vendor-blog and benchmark percentages below are **hypotheses to A/B-test against our own cohort data, not guarantees** - every external SaaS number is context-dependent (ARPA, segment, buyer type) and most of the published medians come from B2B mixes that look nothing like a low-ACV, self-serve print-shop SMB. Treat the benchmarks as orientation, the *methods* (cohorts, curves, the right retention window) as the durable takeaway.

---

## Executive Summary

**Headline recommendation: Kill the single blended churn %. Make an acquisition-cohort retention triangle - built in plain SQL on our existing Postgres, cohorted by store-signup month, with "retained" defined on the print reorder cadence (not a login) - the headline retention artifact for Print-Flow-360. Do not buy ChartMogul/Amplitude/Mixpanel until that SQL view is genuinely the bottleneck.**

A company-wide churn or retention number is a lagging vanity metric. It can stay flat and reassuring while the business quietly rots, because it averages over segments and cohorts that behave very differently. There are three specific ways it lies:

1. **Mix shift / Simpson's paradox** - the blended number can *rise* even as every individual cohort retains *worse*, simply because the customer mix tilted toward stickier segments. [1][11]
2. **Survivorship bias** - measuring expansion/retention from *today's* customers looking backward silently excludes everyone who already left. Kellblog's illustrative example: the same data reads **111% net expansion (survivor-biased)** but **71% (unbiased, full starting cohort)**. [2]
3. **New-cohort masking** - fast-churning recent signups get hidden behind a large base of loyal old cohorts that hold the blended number steady. [1][4]

Cohorts are the diagnostic; the blended % is the symptom. For an infrequent-purchase product like print reorders, the second mistake - **using the wrong retention window** (N-day login retention) - is just as damaging: it labels perfectly healthy, low-frequency customers as "churned" and pushes the team to build pointless re-engagement nudges. [9][10]

Two non-negotiable principles for our context:

- **The retention curve must flatten above zero.** A curve that decays toward zero with no plateau is a leaky bucket / no-PMF signal - pouring our founder-led outreach and BOFU-SEO acquisition (per `ACQUISITION_CHANNELS_2026-06-15.md`) onto a leaky bucket is wasted spend. [4]
- **Do not import enterprise/high-ARPA benchmarks.** For low-ACV self-serve SMB, monthly logo churn of **2.5–5%** is *normal/"good"*, and **NRR above 100% is rare** (only ~2.7% of sub-$10/mo-ARPA products beat 100%). This is consistent with the "NRR likely below 100%" note in `CONVERSION_FUNNEL_RESEARCH_2026-06-15.md`. [3][6]

---

## Why a single blended churn % lies

A blended retention figure averages over groups that behave very differently, so it can look healthy while the business deteriorates. Three failure modes, each with a fix:

| Failure mode | What goes wrong | The fix |
|---|---|---|
| **Mix shift / Simpson's paradox** | Aggregate retention rises even as *every* segment/cohort falls, because the mix shifted toward stickier customers (and vice versa). | Never trust an aggregate. Always segment by ICP, plan, and signup cohort before believing any blended number. [1][11] |
| **Survivorship bias** | Measuring retention/expansion from *today's* customers backward excludes everyone already churned, inflating the number (111% → 71% on identical data). | Fix the starting cohort *in the past* and follow it *forward*; keep the denominator equal to the original cohort size. [2] |
| **New-cohort masking** | A fast-churning recent cohort is hidden by a big base of loyal old cohorts that hold the blended % steady. | Read each cohort's own decay curve, not the company-wide roll-up. [1][4] |

---

## Core concepts

### Acquisition cohorts
Group customers by the period they first signed up ("signed up Feb 2026"), then track each cohort forward through its own lifetime. This lets you compare January's signups at month 3 against February's signups at month 3 on equal footing, isolating the single most important growth question a blended churn number cannot answer: **are newer customers retaining better or worse than older ones?** For Print-Flow-360, cohort by **store-signup month**.

### Retention triangle / heatmap
A table where each **row** is a cohort (signup month) and each **column** is months-since-signup (month 0 = signup). Cells show retention (or churn) %, color-coded green = high, red = low. It's triangular because recent cohorts haven't lived long enough to fill the right-hand columns.

How to read it:
- **Scan DOWN a column** → are successive cohorts retaining better (onboarding/product improving) or worse (quality declining)?
- **Scan ACROSS a row** → one cohort's decay curve over its lifetime.
- **Pattern direction matters**: *horizontal* red bands = a cohort-specific event (e.g. a bad acquisition campaign); *diagonal* bands = a calendar event hitting every cohort at once (outage, release, price change, theme regression); *vertical* bands = renewal/anniversary cycles.

### Retention curve and the flattening "smile"
Plot retention % (y) against time-since-signup (x). Three archetypes: [4]
1. **Healthy** - steep early drop that then **flattens to a stable horizontal asymptote**. A durable base keeps coming back; the *higher* the plateau, the stronger the PMF.
2. **No-PMF "leaky bucket"** - declines continuously toward zero with no flattening. Users pass through without sticking; acquisition on top is wasted spend.
3. **Exceptional "smile"** - dips then **rises** as lapsed users return (network effects / expanding value).

The non-negotiable PMF signal is that **the curve flattens above zero.** If it doesn't, fix the product before scaling acquisition.

### Logo retention vs revenue (dollar) retention
- **Logo (customer/count) retention** - what fraction of customers are still active.
- **Gross Revenue Retention (GRR)** - counts only losses (churn + downgrades), caps at 100%; the honest "are we keeping the money we had?" floor.
- **Net Revenue Retention (NRR)** - adds expansion (upsell/usage growth); can exceed 100%.

A business can lose many small logos yet hold revenue if survivors expand - so always read logo **and** dollar curves together. For low-ACV SMB with little expansion, GRR and logo retention track closely and NRR rarely beats 100%.

### N-day vs unbounded (rolling) vs bracketed retention
- **N-day** - active in *exactly* period N. Strict; right for high-frequency daily products. **Wrong for us.**
- **Unbounded / rolling** - active in period N *or any period after*; counts anyone not permanently lapsed. Right for long, irregular cadence.
- **Bracketed** - custom windows (e.g. days 1–7, 8–30, 31–90), counting a return anywhere inside the bracket. Purpose-built for lumpy reorder usage.

Choosing N-day for an infrequent product makes a healthy product look dead, because most periods will correctly show zero activity. [9]

### Choosing the window for an infrequent-purchase product
Reforge's rule: align the retention metric with the product's **natural usage frequency** - the cadence at which the customer re-experiences the problem you solve. [10] For print reorders that's quarters or longer, not days. Practical approach for Print-Flow-360:
1. Measure the actual **median inter-order gap** from order data.
2. Use **bracketed or unbounded** retention over quarterly/biannual windows.
3. Define "active" as a **value event on the store's real cadence** (an order placed/received, or a storefront still live and published), *not* a daily login.

### SaaS Quick Ratio
A one-line growth-efficiency check: how much revenue you add for every dollar you lose. ≥4 is the oft-cited bar (Mamoon Hamid / Social Capital). [8] Useful, but it can **mask a leaky bucket** - strong new-logo inflow can produce a fine Quick Ratio even with terrible retention. Read it *alongside* cohort curves, never instead of them.

### Cheap cohorts on existing Postgres
You don't need Amplitude/Mixpanel to start. With SQL on the existing Postgres: [12][13]
1. Build a per-tenant "first activity" table (first order month, or store-go-live month) as the cohort key.
2. Generate a month spline with `generate_series`.
3. **LEFT JOIN** activity onto the spline (never INNER - an unretained customer must stay in the denominator or you silently inflate retention).
4. Compute `months_since_cohort = activity_month − cohort_month` and pivot `count(active)/cohort_size` into a triangle.
5. Materialize it as a nightly view.

Two gotchas: keep the denominator fixed to the original cohort size (survivorship guard), and filter out activity months before the cohort month.

---

## Benchmarks

> **Vintage & sourcing note:** The ChartMogul figures span report editions (the 2023 "Retention Report" and the 2024 "New Normal" edition) - they are labelled "ChartMogul, recent editions," not a single 2024 dataset. The KeyBanc medians are co-published with Sapphire Ventures (2024 Private SaaS Survey: 104 companies, ~$26M median ARR). The Lenny/Casey Winters "good/great" bands are **~2020 expert-panel** figures, not 2024 market data. **None of the high-ARPA / enterprise rows should be imported onto our print-shop SMB base** - see the low-ARPA rows for the relevant reality.

### Industry-wide medians (for orientation only - NOT our targets)

| Metric | Value | Confidence | Source |
|---|---|---|---|
| Median Net Revenue Retention (NRR), all SaaS, 2024 | ~101% (down from ~105% in 2021) | Solid | KeyBanc / Sapphire Ventures 2024 Private SaaS Survey [7] |
| Median Gross Revenue Retention (GRR), all SaaS, 2024 | ~90%, roughly stable | Solid | KeyBanc / Sapphire Ventures 2024 Private SaaS Survey [7] |
| Best-in-class **public** SaaS NRR (2025) | ~120–125% (top-quartile/best-in-class) | Solid | KeyBanc 2025 SaaS Benchmark Report [7] |
| Share of new SaaS revenue from expansion vs new logos (2024) | ~52% from expansion into existing accounts | Directional | Fullcast 2025 Revenue Benchmark Report [14] |

### Low-ARPA - THE relevant benchmark for Print-Flow-360

| Metric | Value | Confidence | Source |
|---|---|---|---|
| NRR, low-ARPA (<$10/mo) - top quartile | ~65%; only **~2.7%** of such businesses exceed 100% NRR | Solid | ChartMogul SaaS Retention Report [3] |
| Customer (logo) retention, low-ARPA (<$25/mo) - top quartile | ~65% (source: 64.7%) | Solid | ChartMogul SaaS Retention Report [3] |
| Monthly logo churn, B2B SMB/Mid-Market - **Good** | 2.5%–5% per month | Directional | Lenny Rachitsky, expert-sourced [5][6] |
| Monthly logo churn, B2B SMB/Mid-Market - **Great** | <1.5% per month | Directional | Lenny Rachitsky, expert-sourced [5][6] |
| NRR (12-mo), Land-and-Expand SMB/Mid-Market - Good / Great | ~90% Good / ~110% Great (**~2020 expert panel**) | Directional | Casey Winters × Lenny Rachitsky "What is Good Retention" [5] |
| User retention **at 6 months**, SMB/Mid-Market | ~60% Good / ~80% Great (**~2020 expert panel**) | Directional | Casey Winters × Lenny Rachitsky "What is Good Retention" [5] |

### High-ARPA - for contrast only (do NOT adopt as targets)

> The two ChartMogul high-ARPA rows use **different cohort thresholds** - the NRR row is `>$500/mo ARPA`, the logo-retention row is `>$1k/mo ARPA`. They are *not* the same cohort; the thresholds are stated so the rows aren't read as one population.

| Metric | Value | Confidence | Source |
|---|---|---|---|
| NRR, high-ARPA (>$500/mo) - top quartile | ~109%; **~41%** exceed 100% NRR | Solid | ChartMogul SaaS Retention Report [3] |
| Customer (logo) retention, high-ARPA (>$1k/mo) - top quartile | ~86% (source: 85.8%) | Solid | ChartMogul SaaS Retention Report [3] |

### Growth-efficiency & bias illustrations

| Metric | Value | Confidence | Source |
|---|---|---|---|
| SaaS Quick Ratio - healthy heuristic | ≥4.0 (gain $4 of MRR per $1 lost) - **rule of thumb, not a pass/fail line** | Directional | Mamoon Hamid / Social Capital, via WallStreetPrep [8] |
| Survivorship-biased vs unbiased net expansion (**illustrative**) | 111% (biased, survivors only) vs 71% (unbiased, full starting cohort) on identical data | Solid | Kellblog (Dave Kellogg) [2] |

---

## Formulas

**Gross Revenue Retention (GRR)** - the honest "money kept" floor (excludes expansion, capped at 100%):

```
GRR = (Starting MRR of cohort − Churned MRR − Contraction MRR) / Starting MRR of cohort
```
Measure off a **fixed starting cohort**, not today's survivors, to avoid survivorship bias.

**Net Revenue Retention (NRR / NDR)** - can exceed 100% if expansion outweighs losses:

```
NRR = (Starting MRR − Churn − Contraction + Expansion) / Starting MRR
```
For low-ACV SMB with little upsell, expect **NRR ≤ 100%** (ChartMogul: only ~2.7% of <$10/mo products exceed 100%).

**Logo (customer) retention rate:**

```
Logo retention (period N) = (Customers from cohort still active at period N) / (Total customers in ORIGINAL cohort)
```
The denominator is the **original cohort size and stays fixed across all N** - this is the survivorship guard. Use `LEFT JOIN` in SQL so lapsed customers remain in the count.

**SaaS Quick Ratio:**

```
Quick Ratio = (New MRR + Expansion MRR) / (Churned MRR + Contraction MRR)
```
≥4 = healthy growth efficiency. Caveat: a high ratio driven by new logos can hide weak retention - pair with cohort curves.

**Unbounded (rolling) retention** - the right metric for low-frequency products:

```
Unbounded retention (period N) = (Users active in period N OR any later period) / (Cohort size)
```

**Bracketed retention** - purpose-built for irregular reorder cadence:

```
Bracket retention = (Users with ≥1 value event inside window [a,b]) / (Cohort size)
e.g. windows [1–30d], [31–90d], [91–180d], [181–365d] around the observed median inter-order gap
```

**Churn ↔ retention identity** (true only within a single cohort/period):

```
Period retention = 1 − Period churn
```
Do **NOT** annualize monthly churn by multiplying ×12. Churn compounds:

```
Annual retention = (1 − monthly churn)^12
```

---

## What this means for Print-Flow-360

Concrete, prioritized, and scoped to a small non-technical SMB customer base with limited eng time.

### Instrument (in priority order)

1. **Ship ONE materialized Postgres view + a simple heatmap in the admin portal first.** Do NOT buy ChartMogul/Amplitude/Mixpanel until the cohort base is large enough that the SQL view is genuinely the bottleneck.
2. **Make the acquisition-cohort retention triangle the headline retention artifact.** Rows = store-signup month, columns = months since signup. Cohort by **month** (not week) - the install base is small and weekly cohorts will be too noisy.
3. **Define "active/retained" on the print product's real cadence, not a login.** A store is retained for a period if it (a) stays published/live **AND** (b) places or receives ≥1 order within the window.
4. **Use UNBOUNDED or BRACKETED retention, never N-day.** First measure the actual median inter-order gap from order data, then set brackets around it (e.g. 0–30d, 31–90d, 91–180d, 181–365d).
5. **Track logo AND dollar retention separately.** Expect GRR and logo retention to track closely and NRR to sit at/below 100%.
6. **Instrument a monthly Quick Ratio** = `(new + expansion MRR)/(churned + contraction MRR)` as a one-line board metric, target ≥4 - but never let it substitute for the cohort curve.

**SQL hygiene to bake into the cohort view:**
- `LEFT JOIN` activity to a `generate_series` month spline (**never INNER** - keeps lapsed stores in the denominator).
- Keep each cohort's denominator **fixed to its original size** (survivorship guard).
- Filter out activity months **earlier than** the cohort month.
- Materialize **nightly, per tenant**.

### Read it every month, two ways
- **DOWN columns** → are newer cohorts retaining better than older ones? (Is onboarding improving?)
- **ACROSS rows** → each cohort's decay curve.
- **Diagonal red bands** = a platform-wide event (outage, pricing change, theme regression). **Horizontal red bands** = a bad batch of signups from one campaign.

### Tie it to the existing North Star
The conversion-funnel doc set the North Star as **store live + first order in 7 days**. Cohort the **activation event** and check whether stores that hit activation in week 1 show the flattening curve, while non-activated stores leak to zero. This validates (or kills) the activation hypothesis with real cohort evidence.

### What to A/B test (hypotheses, not guarantees)
- **Activation lever:** does pushing stores to *first order in 7 days* (the funnel doc's bet) measurably raise the cohort plateau vs control? Cohort both arms and compare flattened retention.
- **Onboarding changes:** ship onboarding improvements one cohort at a time, then scan DOWN the column to see if successive post-change cohorts retain better.
- **Re-engagement nudges:** only worth building if bracketed retention (not N-day) shows real lapse inside a *natural-cadence* window. Test a nudge against a hold-out and measure return rate inside the next bracket.

### What to ignore
- **A single blended churn/retention %** as a health signal - it lies via mix shift and survivorship.
- **NRR > 100% as a target.** For our low-ACV SMB base it's unrealistic (ChartMogul: <$10/mo top-quartile NRR ~65%). The realistic growth lever is **more new logos + per-store order-volume/product expansion**, not seat upsell.
- **Enterprise/high-ARPA benchmarks** (the >$500/mo and >$1k/mo rows, "negative churn," "best-in-class 120% NRR"). They describe a different business.
- **Daily/weekly login retention** as a signal for an infrequent-reorder business.

---

## Folklore & mis-attributed stats - flagged explicitly

These recur in SaaS-metrics writing and are wrong, mis-sourced, or mis-applied. **Do not present any of them as a hard SaaS law.**

- **"A 5% increase in retention boosts profits 25–95%."** From Bain / Fred Reichheld (Reichheld & Sasser, "Zero Defections"), **not** an original HBR study, and the 25–95% is a wide **1990s cross-industry range**, not a SaaS-specific law (the 85% figure came from one bank's branch system). Cite carefully; never present "95%" as the expected number.
- **"Acquiring a new customer costs 5x (or 7x, or 25x) more than retaining one."** Folklore with no robust primary source; the multiplier varies wildly and is often invented. Directional reminder only, not a benchmark.
- **A flat blended NRR/churn number presented as proof of health** is itself a folklore trap. Simpson's paradox means the aggregate can improve while every cohort worsens (and vice versa). Demand the segmented/cohort view before believing any blended figure. [11]
- **Survivorship-biased retention reported as if unbiased.** Kellblog's identical-data example: 111% (biased) collapses to 71% (unbiased). Be skeptical of any NRR computed from "current customers looking back." [2]
- **"Quick Ratio ≥ 4 = good company."** A useful heuristic (Mamoon Hamid / Social Capital), **not a validated threshold**; a high ratio can mask a leaky bucket fueled by new logos. Don't treat 4.0 as a pass/fail line. [8]
- **"Good SaaS churn is 5–7% annually" / "best-in-class is negative churn."** Lifted from enterprise/high-ARPA contexts; do **not** apply to low-ACV self-serve SMB, where monthly logo churn of **2.5–5%** is normal/"good" and NRR > 100% is rare.
- **Annualizing monthly churn by multiplying ×12.** A common arithmetic error - churn **compounds**; use `(1 − monthly churn)^12`.
- **"<40% Day-1 retention guarantees <15% 12-month retention"** (and similar precise D1→annual coupling claims) is fabricated/unsourced. The defensible version is only that *early value delivery correlates with stronger long-term retention.*

---

## Sources

1. ChartMogul - SaaS Metrics Refresher #6: Cohort Analysis. https://chartmogul.com/blog/saas-metrics-refresher-cohort-analysis/
2. Kellblog (Dave Kellogg) - Survivor Bias in Churn Calculations: Say It's Not So! https://kellblog.com/2015/04/27/survivor-bias-in-churn-calculations-say-its-not-so/
3. ChartMogul - SaaS Retention Report (benchmarks by ARPA segment; recent editions). https://chartmogul.com/reports/saas-retention-report/
4. Sequoia Capital - Retention (retention curves, flattening, smile, PMF). https://articles.sequoiacap.com/retention
5. Lenny Rachitsky / Casey Winters - "What is Good Retention" benchmark study & NRR benchmarks thread (~2020 expert panel). https://x.com/lennysan/status/1278352679786303488
6. Lenny's Newsletter - What is good monthly churn (benchmarks by segment). https://www.lennysnewsletter.com/p/monthly-churn-benchmarks
7. Benchmarkit 2025 SaaS Performance Metrics + KeyBanc / Sapphire Ventures 2024 Private SaaS Survey (NRR/GRR medians). https://www.benchmarkit.ai/2025benchmarks
8. WallStreetPrep - SaaS Quick Ratio (formula, Social Capital / Mamoon Hamid origin, benchmark). https://www.wallstreetprep.com/knowledge/saas-quick-ratio/
9. Amplitude - 3 Ways To Measure User Retention (N-day vs unbounded vs bracketed). https://medium.com/@amplitudeHQ/3-ways-to-measure-user-retention-2af5e4e82a45
10. Reforge - Visualizing With Retention Curves & natural frequency. https://www.reforge.com/c/growth-series-eg/retention-and-engagement/measuring-analyzing/visualizing-retention-curves
11. Mixpanel - Simpson's paradox and the importance of segmenting data. https://mixpanel.com/blog/avoiding-data-fallacies-and-biases-simpsons-paradox-and-the-importance-of-segmenting-data/
12. Holistics - Quick Guide: Calculate Cohort Retention Analysis with SQL. https://www.holistics.io/blog/calculate-cohort-retention-analysis-with-sql/
13. Stripe - SaaS cohort analysis as a framework for improving churn, expansion, and revenue. https://stripe.com/resources/more/saas-cohort-analysis
14. Fullcast 2025 Revenue Benchmark Report (52% of new revenue from expansion, 2024 data).

---

*Related internal docs: `readme/CONVERSION_FUNNEL_RESEARCH_2026-06-15.md` (North Star = store live + first order in 7d; reverse trial), `readme/ACQUISITION_CHANNELS_2026-06-15.md` (founder-led outreach + print communities + BOFU SEO). This doc is research/strategy only - no code changes.*
