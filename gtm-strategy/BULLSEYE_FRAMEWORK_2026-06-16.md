# The Bullseye Framework, Applied Broadly to Print-Flow-360

> **Date:** 2026-06-16
> **Topic:** Using *Traction*'s Bullseye Framework — a method built for picking acquisition **channels** — as a general-purpose decision discipline across Print-Flow-360's hardest open strategic questions (beachhead segment, GTM motion, expansion/reseller timing, and which features earn focus next).
> **Method:** Re-grounded the framework in its canonical sources (Weinberg's essay + *Traction* + Balfour's breakdown), re-verified every load-bearing statistic against a primary source, and applied it to PF360's *real* features, segments, and prior research. Corrections from the verification pass are noted inline.

## TL;DR — the decisive call

Bullseye's real lesson is not "do one channel" — it is a **discipline for resource concentration under uncertainty**: enumerate broadly, test cheaply in parallel, then pour everything into the single thing that's working and ignore the runners-up. Applied to Print-Flow-360, the decisive calls are: **(1) Beachhead = small apparel/screen-print + sign/promo shops that lack online ordering** (a small, mostly-single-owner, enumerable market — ~22k–28k US commercial printers, the bulk of them <5 employees); **(2) GTM motion = product-led self-serve as the engine, founder-led outreach as the cold-start primer** — *not* an outbound sales org, because at PF360's sub-$1k ACV the CAC math favors self-serve; **(3) the one feature ring to win first is the order-to-production spine** (preflight → fulfillment → tracking), the chain prior research already identified as broken. The channel question itself is already settled in `ACQUISITION_CHANNELS_2026-06-15.md` (founder-led outreach + 2 print communities, with BOFU SEO + a free design tool secondary) — this doc does **not** re-litigate it; it applies the *same selection logic* to the decisions that are still open.

---

## 1. The framework, accurately

> **Canonical sources:** Gabriel Weinberg, ["The Bullseye Framework for Getting Traction"](https://medium.com/@yegg/the-bullseye-framework-for-getting-traction-ef49d05bfd7e) (Medium) and the book *Traction: How Any Startup Can Achieve Explosive Customer Growth* (Weinberg & Mares, 2015). Modern refinement: Brian Balfour, ["Traction: The Bullseye Framework"](https://brianbalfour.com/essays/traction-the-bullseye-framework).

Bullseye is a **meta-method for picking a channel**, not a channel itself. Its purpose is to counteract the predictable founder failure mode: spreading a small team across many channels, or fixating on the 2–3 channels the founder personally likes (usually paid ads). The image is a dartboard with three rings ([Weinberg](https://medium.com/@yegg/the-bullseye-framework-for-getting-traction-ef49d05bfd7e); structure confirmed by [FourWeekMBA](https://fourweekmba.com/bullseye-framework/)):

- **Outer ring — "what's possible."** Brainstorm at least one concrete, plausible test idea for **all 19 traction channels**. The brainstorm is the antidote to bias — you must consider channels you'd never naturally pick.
- **Middle ring — "what's probable."** Take the ~3 most promising and run **cheap, fast, parallel tests**. Each test answers three questions: **CAC** (cost per customer here?), **Volume** (how many customers are reachable?), and **Fit** (are these the customers you want *now*?). Weinberg's budget bar: get "a rough idea of a channel's effectiveness with at most a thousand dollars and a month of time." Balfour sharpens this into parallel discipline — *"run four ads, not forty"* — i.e., test enough to read signal, not so much you've already committed.
- **Inner ring — "what's working."** Concentrate effort on the single channel with the best CAC/Volume/Fit and drive it until it saturates. Ignore the runners-up while it works.
- **Repeat.** When the winner plateaus, re-run the loop. Weinberg ran it *"six or seven times"* at DuckDuckGo. Practitioners observe most teams **drop off around the third channel** — they get one channel working, then never re-run the loop and stall when it saturates.

**The 19 channels** (verified complete and correctly ordered): Viral Marketing · PR · Unconventional PR · Search Engine Marketing (paid search) · Social & Display Ads · Offline Ads · SEO · Content Marketing · Email Marketing · Engineering as Marketing (free tools) · Targeting Blogs · Business Development (partnerships) · Sales · Affiliate Programs · Existing Platforms · Trade Shows · Offline Events · Speaking Engagements · Community Building.

**Companion prioritization — ICE scoring** (Sean Ellis / GrowthHackers): score each idea on **I**mpact × **C**onfidence × **E**ase (each 1–10), multiply, rank. Use it to make the outer→middle ring cut objective ([airfocus ICE model](https://airfocus.com/glossary/what-is-the-ice-scoring-model/)).

**The one-channel thesis and its modern softening.** *Traction* echoes Peter Thiel's claim that a single channel usually dominates at each stage. In practice (Balfour, and how most 2023–2026 growth teams run it) the rule is softened to **test ~3 in parallel and often run 1–2 complementary channels** — e.g., SEO plus the community where that content gets shared. The deeper point survives: **concentration beats diffusion.** Bullseye is channel *discovery*, not channel *execution* — completing the diagram is not doing the work.

### 1.1 Why extend it beyond channels

Bullseye's core mechanic — *enumerate broadly → test cheaply in parallel on CAC/Volume/Fit-style criteria → concentrate on the one winner → re-run when it saturates* — is a general antidote to the diffusion that kills small teams. Print-Flow-360's hardest open questions have the same shape: a tempting menu of options, a small team, and a strong pull toward doing a little of everything. So this doc applies the *logic* (not a literal dartboard) to: **beachhead segment, GTM motion, expansion/reseller timing, and feature focus.** Where a decision has *already* been made by prior research, we state the inner-ring result in one line and move on — re-deriving settled questions is exactly the diffusion Bullseye warns against.

---

## 2. The market, sized honestly (this number anchors everything below)

Three of this doc's recommendations lean on the claim that PF360's market is **small, mostly single-owner, and enumerable**. That claim is true — but the headline count must be stated correctly, because an inflated number distorts every downstream call.

- **US printing establishments (NAICS 323, "Printing and Related Support Activities"): ~22,301 (2023 County Business Patterns), ~22,651 (2022 Census)** ([WhatTheyThink / Census CBP analysis](https://whattheythink.com/sections/industry-data/establishments/); cross-checked against [BLS QCEW](https://www.bls.gov/iag/tgs/iag323.htm), which shows ~28k private printing establishments depending on quarter/scope). Treat the defensible range as **~22k–28k commercial printers**, with the lower number being the narrow Census count and the higher number a broader BLS/QCEW frame.
- The bulk of these are **small** — most have **fewer than 5 employees** (Census CBP size-class data), which *does* support the "mostly small-owner shop" thrust this strategy depends on.
- **Important correction:** earlier internal drafts used "~50k–55k US print shops, ~54% single-owner." That ~50k–55k figure is roughly **2× the actual commercial-printer count** and was unsourced. It only approaches reality if you deliberately *bundle* adjacent verticals — sign/wide-format shops, copy/quick-print shops, and promotional-products distributors — into the universe. If you do bundle them, say so and show the math; do not present a bundled number as "print shops." For PF360's beachhead reasoning we use the **honest commercial-printer count (~22k–28k)** plus an explicitly-labeled adjacent pool (sign/apparel/promo) that the product can also serve. The "~54% single-owner" stat had no source and is **dropped**; the defensible, sourced version is "the majority are <5-employee shops."

**Why the corrected number still supports the strategy.** A ~22k–28k universe (plus an adjacent sign/apparel/promo pool) is still **finite, enumerable, and scrapeable** from Google Maps, Yelp, trade directories, and Printing United Alliance / SGIA lists. The strategic implication — *you can build a list and reach the whole market by hand* — holds at 22k just as it did at the inflated 50k. It does **not** need the bigger number to be true.

---

## 3. Decision 1 — Beachhead segment (apply the rings to *who*)

**Outer ring (enumerate the candidate segments):**

| Candidate segment | Approx. scale | Online-ordering gap | Demo-ability of PF360 |
|---|---|---|---|
| Apparel / screen-print shops | Large, very active online communities (r/SCREENPRINTING, pro FB groups) | High — many take orders by text/email | Very high (design studio + storefront) |
| Sign / wide-format shops | ~46k-member forums (Signs101) | High | High |
| Promotional-products distributors | Dense intermediary layer | Medium (some use ASI/SAGE tools) | Medium |
| Commercial / offset printers | ~22k–28k (the Census core) | Mixed — larger ones already run Pressero/OnPrintShop | High but more demanding (MIS expectations) |
| Copy / quick-print shops | Many, fragmented | High | Medium |
| Photo / specialty (books, packaging) | Niche | Low (often on Gelato/Printful rails) | Medium |

**Middle ring (CAC / Volume / Fit, tested cheaply):**
- **CAC:** lowest where the buyer self-identifies in a free community and the product demos itself in a 60-second Loom — i.e., apparel/screen-print and sign/promo. Commercial-offset CAC is higher: those buyers expect MIS depth PF360 only partly has (`PLATFORM_GAP_ASSESSMENT_2026-06-07.md` rates PF360 ~80% as a storefront but ~40% as a print MIS).
- **Volume:** the *reachable* volume is the adjacent apparel/sign/promo pool, not just the ~22k–28k Census core — those owners gather in enumerable communities and have the sharpest "I still take orders over text" pain.
- **Fit *now*:** PF360's strengths (Fabric.js design studio, CMS storefront, multi-theme branding, pricing engine) map cleanly onto **visual, customer-self-serve products** (apparel, cards, flyers, signage) — and *away from* deep production-MIS shops that need preflight/imposition/CMYK PF360 doesn't yet have.

**Inner ring — decisive call:** **Beachhead = small apparel/screen-print and sign/promo shops (<5 staff) that currently have no online ordering.** They are the intersection of *enumerable*, *community-reachable*, *visually demo-able*, and *fit-now*. Commercial-offset printers are the **expansion ring**, opened only after the order-to-production spine (Decision 4) is closed. This matches the channel doc's ICP and the conversion doc's "non-technical owner" persona — it is not a new bet, it is the same bet stated as a Bullseye inner-ring result.

---

## 4. Decision 2 — GTM motion (the genuinely open variable)

This is where the Bullseye logic adds the most, because the *motion* (how the product is bought) is less settled than the *channel* (where prospects are found).

**Outer ring (the motion candidates):** (a) self-serve PLG (sign up → trial → self-activate → pay); (b) founder-led manual sales; (c) an outbound SDR/AE sales org; (d) reseller/OEM distribution.

**Middle ring (CAC reasoning, not a fake precise threshold):**
- PF360 is **low-ACV SMB vertical SaaS** — prior pricing research targets per-location subscription pricing in the **low hundreds of dollars per shop per year** (Solo/Growing/Multi-Location tiers; `PRICING_RETENTION_REFERRALS_STRATEGY_2026-06-15.md`).
- a16z's own GTM benchmarking puts **CAC payback for SMB-sold products at ~6–12 months** (vs 18–24 for enterprise) and frames CAC payback as the gating metric for which motion is affordable ([a16z, *16 Startup Metrics*](https://a16z.com/16-startup-metrics/); [a16z, *11 Key GTM Metrics for B2B Startups*](https://a16z.com/11-key-gtm-metrics-for-b2b-startups/)). The general rule that holds across this literature: **a dedicated outbound sales org (loaded SDR+AE cost) cannot pay back inside that window at sub-$1k ACV** — the math forces self-serve.
  > **Correction:** an earlier draft attributed a precise *"outbound only pencils above ~$5K ARPC, per a16z"* threshold. That exact figure is **not present in any a16z source** and has been removed. The defensible claim is the CAC-payback reasoning above (low-ACV SMB favors self-serve over outbound), not a manufactured dollar line.
- Founder-led manual outreach is *not* the same as an outbound org: it has near-zero tooling cost and doubles as customer discovery (it produces the messaging every other channel reuses — see channel doc §3.1). It is a **cold-start primer**, not a scale engine.

**Inner ring — decisive call:** **Product-led self-serve is the engine; founder-led outreach is the cold-start primer; do NOT build an outbound sales org at this ACV.** Concretely:
1. **PLG engine:** no-credit-card 14-day reverse trial, pre-seeded demo store, ≤5-step go-live checklist, North Star = *store live + first order in 7 days* (this is the conversion doc's settled result — `CONVERSION_FUNNEL_RESEARCH_2026-06-15.md`).
2. **Founder-led primer:** hand-picked Looms to ~100–200 shops to land the first 10–50 reference stores and harvest objections (the channel doc's PRIMARY bet).
3. **Reseller/OEM** is a *later* ring (Decision 3), not a current motion.

The PLG vs sales split is justified by **CAC-payback math at this ACV**, with no fabricated threshold.

---

## 5. Decision 3 — Expansion & reseller timing (one channel at a time)

Bullseye's "ignore the runners-up until the winner saturates, then re-run" maps directly onto **when to open reseller/OEM partnerships** — the print niche's highest-ceiling channel (the OnPrintShop × Ricoh model: 2,000+ print service providers via dealer distribution; channel doc §3.4).

- **Inner-ring result (already decided in the channel doc):** reseller/OEM is **TEST LATER**, after 10–20 reference stores exist. It's a 6–18-month BD play that needs a track record PF360 doesn't have pre-traction.
- **What Bullseye adds:** the *trigger* to re-run the loop. Open the reseller ring **only when the PLG + founder-led engine plateaus or saturates the community-reachable pool** — not on a calendar. Pre-test it (one regional equipment dealer or paper distributor, hands-off rev-share) *before* the current motion fully stalls, so there's no gap. This is exactly the "drop-off around the third channel" trap to avoid.

No new market-size argument is needed here; the corrected ~22k–28k core + adjacent pool simply tells you the community-reachable segment is finite, so plan the next ring before it runs dry.

---

## 6. Decision 4 — Feature focus (the most valuable extension)

The most useful re-use of Bullseye is on **product**: with a small team and a long backlog (`GOAL.md` has 6 phases), which work earns the inner ring? Use CAC/Volume/Fit's product analogues — **Impact on activation/retention, Reach across the base, and Fit with the beachhead** (i.e., ICE).

**Outer ring (candidate feature investments, from `PLATFORM_GAP_ASSESSMENT_2026-06-07.md` and `GOAL.md`):**
- Order-to-production spine: preflight/CMYK validation → partial fulfillment → carrier/tracking
- Silent-lie correctness debt (Phase 0): mark-as-paid truth, analytics fake-zero, AI builder store-assign
- Activation onboarding: demo data on signup, go-live checklist, real dashboard data (Phase 1c)
- Dunning / failed-payment recovery (retention)
- Standing orders / print subscriptions (flagship differentiator)
- Gang-run autopilot board (flagship differentiator)

**Middle ring (ICE-style read):**

| Investment | Impact | Reach | Fit-with-beachhead | Verdict |
|---|---|---|---|---|
| **Order-to-production spine** | High — "paid → shipped" is currently broken; blocks the whole value loop | All order-taking shops | High | **INNER RING** |
| Phase-0 silent-lie fixes | High — a lying foundation poisons every new feature | All | High | **Prerequisite gate** (clear first per `GOAL.md`) |
| Activation onboarding (demo store + checklist) | High — activation speed is the #1 predictor of trial→paid | All new signups | High | **High** |
| Dunning recovery | Medium-high — recovers cheap revenue | All paying shops | Medium | **Next-ring** |
| Standing orders / gang-run | High *ceiling*, low *near-term reach* | Subset | High | **Later ring** |

**Inner-ring result:** clear the **Phase-0 correctness gate first** (a lie-free foundation is non-negotiable — `GOAL.md` North Star), then make the **order-to-production spine** the single feature focus. It is the chain `PLATFORM_GAP_ASSESSMENT_2026-06-07.md` calls "the key broken chain" (no preflight, no partial fulfillment, no carrier/tracking — an order can't travel cleanly from *paid* to *shipped*). Differentiators (standing orders, gang-run) are deliberately **runners-up** until the spine works — exactly the concentration Bullseye prescribes.

---

## 7. The open variables (where to actually spend the words)

Prior docs have settled the channel question, the pricing model, and the trial model. The Bullseye lens leaves four **genuinely open** variables worth instrumenting — each stated with the embedded statistics now **inline-cited**:

1. **Will founder-led outreach clear its kill-criterion?** The channel doc sets >8–10% positive-reply + closes. If it can't, *no* text-outreach scaling will (SaaS is the lowest-replying cold-email vertical), and the loop should re-run toward community + SEO. **Open — instrument it.**
2. **Will PLG activation actually convert at this persona?** Benchmarks to beat, cited: **median product activation ~37.5%** and **onboarding-checklist completion mean 19.2% / median 10.1%** ([Userpilot 2024 benchmark](https://userpilot.medium.com/customer-onboarding-checklist-completion-rate-2024-benchmark-report-8ebabebefb1f)). *Label carefully:* the "37%" figure is the activation **mean**; the "19%" figure is the checklist-completion **mean** (its median is 10.1%). A no-card trial typically yields ~27% more total paying users than a card-required trial but a lower per-trial rate (ChartMogul / Poyar bands, cited in `CONVERSION_FUNNEL_RESEARCH_2026-06-15.md`) — **open: which net wins for non-technical print owners.**
3. **How much involuntary churn can dunning recover?** **20–40% of SaaS churn is involuntary** and a **full multi-channel dunning stack recovers ~55–65% of failed payments** (smart retries ~35% + dunning email +15–20% + pre-dunning card-expiry alerts preventing 30–40% of failures) ([Baremetrics 2026 dunning guide](https://baremetrics.com/blog/dunning-management); [Recurly failed-payment data](https://recurly.com/blog/failed-payment-recovery-data-based-strategy/)). The prior pricing doc's "~40–60% recovery" was deliberately conservative; the verified ceiling is higher (~55–65%) — **plan for ~50–60%, instrument actual.**
4. **When does the reseller ring open?** Trigger is engine-saturation, not a date. **Open — set the saturation tripwire now.**

> Every percentage above carries an inline source. The "two-sided referral → 20–40% of signups" and "10+ integrations → ~40% less churn" claims from earlier drafts are **not** restated as facts here because they trace to single-vendor blogs — treat them as hypotheses in `PRICING_RETENTION_REFERRALS_STRATEGY_2026-06-15.md`, not load-bearing numbers.

---

## 8. RECOMMENDATION (decisive)

1. **Beachhead:** small apparel/screen-print + sign/promo shops (<5 staff) with no online ordering. The ~22k–28k commercial-printer core plus the adjacent sign/apparel/promo pool is finite and enumerable — reach the *whole* market by hand.
2. **GTM motion:** **PLG self-serve engine + founder-led cold-start primer. Do not hire an outbound sales org** — sub-$1k ACV cannot pay back loaded SDR/AE cost inside the ~6–12-month SMB CAC-payback window (a16z GTM metrics). No fabricated dollar threshold; the CAC-payback logic is the justification.
3. **Channel (already settled — stated once, not re-derived):** founder-led outreach + 2 print communities PRIMARY; BOFU SEO + free design tool SECONDARY; skip paid search. See `ACQUISITION_CHANNELS_2026-06-15.md`.
4. **Feature inner ring:** clear the Phase-0 correctness gate, then concentrate on the **order-to-production spine** (preflight → partial fulfillment → carrier/tracking). Differentiators wait.
5. **Expansion ring:** open reseller/OEM **only when the PLG + founder engine saturates** the community-reachable pool — pre-test one regional dealer before that happens.
6. **Discipline:** re-run the loop quarterly. The failure mode to avoid is the documented "drop-off around the third channel" — concentrate, saturate, then re-run; never spray.

---

## 9. Next-steps checklist (sequenced)

- [ ] **Set kill-criteria + tripwires up front.** Outreach: >8–10% positive-reply. PLG: activation vs the 37.5%-mean / 19.2%-mean-checklist benchmarks. Reseller: define the engine-saturation tripwire that opens the next ring.
- [ ] **Build the enumerable list** from Google Maps / Yelp / Printing United + SGIA directories, filtered to apparel/sign/promo shops with weak/no online ordering (the corrected ~22k–28k core + adjacent pool).
- [ ] **Clear the Phase-0 correctness gate** (`GOAL.md`) before any new feature — a lie-free foundation is the prerequisite for everything in §6.
- [ ] **Make the order-to-production spine the single feature focus** after the gate: preflight/CMYK → partial fulfillment → carrier/tracking (`PLATFORM_GAP_ASSESSMENT_2026-06-07.md` §3).
- [ ] **Ship the PLG activation path** (no-card 14-day reverse trial, demo store, ≤5-step go-live checklist, North Star = store live + first order in 7d) per `CONVERSION_FUNNEL_RESEARCH_2026-06-15.md`.
- [ ] **Run founder-led outreach + 2 communities** as the cold-start primer (channel doc) — log every objection as the feed for SEO/onboarding copy.
- [ ] **Build dunning recovery** to the verified ~55–65% multi-channel ceiling (plan ~50–60%) before scaling acquisition.
- [ ] **Pre-test one reseller dealer** before the PLG engine plateaus; do not wait for a calendar date.
- [ ] **Re-run the full loop quarterly**, re-scoring with ICE; re-open the outer ring when the inner-ring winner saturates.

---

## 10. Cross-references (this 2026-06-16 set + siblings)

- `readme/ACQUISITION_CHANNELS_2026-06-15.md` — the settled channel decision (Bullseye applied to *channels*; this doc deliberately does not re-run it).
- `readme/CONVERSION_FUNNEL_RESEARCH_2026-06-15.md` — the no-card reverse-trial + North Star activation event used in Decision 2 and §9.
- `readme/PRICING_RETENTION_REFERRALS_STRATEGY_2026-06-15.md` — per-location pricing, dunning, referral mechanics (the open-variable statistics in §7).
- `readme/PLATFORM_GAP_ASSESSMENT_2026-06-07.md` — the order-to-production spine (Decision 4's inner ring).
- `GOAL.md` — the Phase-0 correctness gate that precedes feature focus.

---

## Sources

- Gabriel Weinberg, "The Bullseye Framework for Getting Traction" — https://medium.com/@yegg/the-bullseye-framework-for-getting-traction-ef49d05bfd7e
- Brian Balfour, "Traction: The Bullseye Framework" — https://brianbalfour.com/essays/traction-the-bullseye-framework
- FourWeekMBA, "Bullseye Framework" (three-ring structure) — https://fourweekmba.com/bullseye-framework/
- airfocus, "ICE Scoring Model" — https://airfocus.com/glossary/what-is-the-ice-scoring-model/
- WhatTheyThink, US Printing Industry Establishments (Census CBP, NAICS 323) — https://whattheythink.com/sections/industry-data/establishments/
- BLS, "Printing and Related Support Activities: NAICS 323" — https://www.bls.gov/iag/tgs/iag323.htm
- a16z, "16 Startup Metrics" — https://a16z.com/16-startup-metrics/
- a16z, "11 Key GTM Metrics for B2B Startups" — https://a16z.com/11-key-gtm-metrics-for-b2b-startups/
- Userpilot, "Customer Onboarding Checklist Completion Rate: 2024 Benchmark Report" (checklist mean 19.2% / median 10.1%; activation mean ~37.5%) — https://userpilot.medium.com/customer-onboarding-checklist-completion-rate-2024-benchmark-report-8ebabebefb1f
- Baremetrics, "Dunning Management: The Complete Guide for SaaS (2026)" (20–40% involuntary; 55–65% multi-channel recovery) — https://baremetrics.com/blog/dunning-management
- Recurly, "Failed Payment Recovery: What the Data Shows" — https://recurly.com/blog/failed-payment-recovery-data-based-strategy/

---

*Framework scholarship verified against primary sources (rings, 19 channels, DuckDuckGo "six or seven times," Thiel one-channel thesis, Balfour parallel-test refinement, ICE = Impact×Confidence×Ease). Market-size and embedded statistics corrected and inline-cited per the 2026-06-16 verification pass. The channel and pricing/trial decisions are treated as settled by the sibling docs and are referenced, not re-derived.*
