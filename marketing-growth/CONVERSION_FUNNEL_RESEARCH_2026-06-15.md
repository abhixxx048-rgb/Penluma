# Print-Flow-360 Growth Strategy: Landing Page → Free Trial → Paying Customer

> Internal growth/CRO strategy doc. Researched 2026-06-15 via a multi-agent workflow (5 research
> streams — AARRR metrics, landing-page CRO, trial-model selection, onboarding/activation, pricing
> pages — each independently fact-checked, then synthesized). Benchmarks are flagged by confidence;
> treat vendor-blog percentages as **hypotheses to A/B-test on our own funnel**, not guarantees.

## Executive Summary

Print-Flow-360 sells a hosted storefront + design studio + print-order pipeline to **non-technical print-shop and small-business owners** — buyers who navigate by intuition, won't read docs, and judge the product by whether it *visibly works fast*. The single highest-leverage decision in our funnel is therefore not the landing page or the pricing table; it is **how fast we get a new owner to their activation moment: store live + first sale/order**. Across the research, one conclusion is robust and repeated: **activation speed (time-to-value) is the dominant predictor of trial-to-paid conversion** [1][3][4], far more than trial length, copy, or model choice on their own. This document synthesizes five research streams — AARRR metrics, landing-page CRO, trial-model selection, onboarding/activation, and pricing-page design — into one opinionated plan. Headline recommendation: ship a **no-credit-card, 14-day reverse trial** with a **pre-seeded demo store and a ≤5-step "go-live" checklist**, instrument **"store live + first order"** as the North Star activation event, and trigger the upgrade prompt **on that behavior, not on a calendar day**.

> **A note on the numbers.** The fact-check across all five streams found that the *principles* are well-grounded but many *precise percentages* trace to a small cluster of mutually-citing vendor blogs. Where a figure is solid (e.g. ChartMogul's ~8% median free-to-paid and the ~3–5× card-vs-no-card multiplier; Unbounce's 6.6% all-industry vs 3.8% SaaS landing median; NN/G's 57% above-the-fold), it's cited as a benchmark. Everything else is framed as a **directional best-practice hypothesis to A/B test on our own funnel**, not a guaranteed lift.

---

## 1. AARRR "Pirate Metrics" — the framework that forces focus

**What it is.** Dave McClure's AARRR breaks the lifecycle into five measurable stages — **A**cquisition, **A**ctivation, **R**etention, **R**eferral, **R**evenue — so we fix our *single biggest leak* instead of chasing vanity metrics [1][2]. The discipline: if users drop right after signup, fix Activation; if revenue lags, fix Revenue — one stage at a time.

**The critical distinction: activation ≠ retention.**
- **Activation** is a *one-time* first-value milestone ("the moment the product becomes worth paying for").
- **Retention** is a *recurring* habit.
- You **cannot** fix a leaky retention bucket with more acquisition spend [2]. For PLG SaaS this is why some teams reorder to "RARRA" (Retention first).

**Benchmarks worth anchoring on (verified or directional):**

| Metric | Benchmark | Confidence |
|---|---|---|
| Trial-to-paid, blended | ~14–18% avg; top quartile ~25% | Directional [1] |
| Opt-in (no card) trial → paid | ~8–18% | Solid range [1] |
| Opt-out (card-required) → paid | ~30–48% (best-case band 40–60%) | Solid direction; 2025 medians nearer ~31% [1] |
| Freemium → paid | ~2–5% (top performers 10%+) | Solid [1] |
| Median product activation rate | ~37% (Userpilot, 547 products) | **Verified** [1][4] |
| PQL → paid | ~20–30%; PQLs convert 5–6× MQLs | Directional [1] |
| LTV:CAC | 3:1 minimum healthy; ~3.2:1 median | Solid [1] |
| SMB Net Revenue Retention | ~97% (below 100%) | Decision-relevant [1] |
| Viral coefficient (k) | k≥1 self-sustaining; rare in B2B | Solid [1] |

**Cautions flagged in fact-check:** the "5% retention → up to 95% profit" stat is Bain/Reichheld (a 25–95% range from 1990s industry studies), *not* original HBR research — attribute carefully. The "<40% D1 retention → <15% 12-mo retention" coupling appears fabricated; the defensible version is **users who reach first value within ~14 days retain ~80%+ at 12 months** [1].

### What this means for Print-Flow-360
- **Define ONE activation event:** *store published live AND first order received.* It is simultaneously the owner's real "aha," a Product-Qualified-Lead (PQL) trigger, and our North Star candidate.
- **Two separate dashboards:** Activation = % of new signups that go live + get a first order within X days. Retention = % of activated stores still receiving orders at D7/D30/D90.
- **Accept the SMB reality:** our buyers are SMB, so NRR will likely sit **below 100%** — offset churn with new logos *and* design expansion (more products, order volume, add-ons). Don't assume expansion alone saves us.
- **Referral is a nudge, not an engine:** k>1 is implausible for a print-shop tool. Layer an incentivized referral *only after* retention is solid.

---

## 2. The Landing Page — win the decision in the hero

**The math:** SaaS landing pages convert at a **~3.8% median (Unbounce)** vs **6.6% all-industry**; best-in-class reach 10–18% [2 (LP)]. The entire CRO opportunity is closing that gap. **~57% of viewing time is above the fold** (NN/G) [2 (LP)] — the hero decides the page.

**Well-grounded levers (cite the direction, A/B-test the magnitude):**
- **Benefit/outcome headline**, under ~8 words, that a shopkeeper instantly gets — sell the *after* state, not the feature list.
- **Real product screenshot or a single bold stat** as the hero visual. **Avoid autoplay video and stock photos** (both measured net-negative in the vendor study).
- **Exactly ONE primary CTA**, repeated down the page + a sticky-bottom CTA for mobile. Multiple competing CTAs (Demo + Trial + Pricing + Contact) split attention and suppress conversion.
- **Short form — email only.** Form length is the single highest-impact friction lever; capture store details *inside* onboarding, not on the landing form. (Real, repeatedly-cited case: 11→4 fields ≈ +120%.)
- **Specific, named social proof near the CTA** — a named store owner with photo + business + a concrete result beats generic "trusted by thousands" (which now converts like *no* proof at all).
- **Message-match:** each ad/email source gets a matched headline variant.
- **Speed:** faster pages convert materially better (Portent, 27k+ pages); target **LCP < 2.5s** (Google "good"). *Note: the per-LCP conversion table in the research conflates total-load-time data with LCP — use the direction, not the exact bands.*
- **Mobile-first at 375px:** ~79% of SaaS landing visits are mobile (Unbounce) — single-column hero, big tap targets, sticky CTA.

> **Danger flagged in fact-check:** nearly every eye-catching per-element lift % (single-stat hero +18%, named-proof +22%, sticky-CTA +11%, "Start free trial" +9%, single-CTA 13.5% vs 10.5%) traces to **one self-published vendor blog (digitalapplied)**. Treat them as hypotheses, not benchmarks.

### What this means for Print-Flow-360

**Hero (above the fold):**
- Headline: *"Sell print online. Get your first order this week."* (outcome, plain language)
- Subhead: *"For print shops and small businesses — your store goes live in minutes. No coding."*
- Visual: real screenshot of a live storefront + an order coming in (show the product, don't describe it).
- CTA: **"Launch my store free"** (first-person, benefit-framed, no card).
- Trust line under CTA: *"No credit card required."*

**Down the page:** named print-shop-owner testimonial with a first-sale metric → 3 outcome blocks (storefront live · accept orders · design studio) → repeat CTA → sticky mobile CTA. Reserve feature/spec detail for a secondary, scannable section. Never surface internal language (CMS blocks, S3, multi-tenant, SKU).

---

## 3. Trial vs Freemium vs Demo — the model choice

Two variables govern everything: **time-to-value** and **credit-card friction**.

| Model | Median trial→paid (directional) | Fit for us |
|---|---|---|
| Sales-assisted | ~55% | No — low-ACV SMB, kills self-serve volume & TTV |
| Demo + trial hybrid | ~48% | Only for larger/B2B accounts |
| **Opt-out (card-required) trial** | ~30–48% | Higher rate, **but cuts signups 30–50%** |
| **Reverse trial** | ~15–24% | **Strong fit** — urgency + safety net |
| **Opt-in (no-card) trial** | ~8–18% | Fit for our intuition-led buyers |
| Freemium | ~2–8% | **Wrong** — needs massive scale; we have real per-tenant cost |

**Key, verified directional findings:**
- **Card requirement is the single biggest lever** — opt-out converts **~3–5× higher** than opt-in (ChartMogul: card-required ~30%, >5× no-card) — *but* it slashes signup volume, so **net paying customers per visitor can be comparable**, and in one ChartMogul cut no-card yielded **~27% more total paying customers** [3][5].
- **Freemium is the wrong default** for a tool with real per-tenant serving cost (hosting, storage, file processing). ~95–97% of free users never pay [3].
- **Reverse trial** (full premium at signup → auto-downgrade to a capped-but-useful free tier at trial end) keeps non-converters as warm, re-activatable users instead of churned ghosts. Toggl's reverse trial reportedly *doubled* premium revenue [3].
- **Shorter trials (7–14 days) beat 30-day** by creating urgency; pair with structured Day-1/Day-3/Day-7 check-ins.

> **Removed as unsupported:** the "EU 72-hour pre-billing mandate dropped opt-out 58% → 41.3%" claim is unverified and should not be cited. The *risk* that regulation (e.g. EU Digital Fairness Act proposals) tightens card-required trial economics is real; the specific stat is not. The precise trial-type median table is vendor-authored — use it for *ordering*, not hard numbers.

### What this means for Print-Flow-360
**Recommendation: a no-credit-card, 14-day reverse trial.**
- **No card up front** — our buyers abandon over exactly this friction; the headline 44% opt-out rate hides 30–50% fewer signups, and no-card likely nets *more* total paying customers for an intuition-led audience.
- **Capture the card mid-trial, at the aha** — prompt for payment/upgrade *right after the first order is placed*, when willingness-to-pay peaks (behavioral trigger, ~2.5× calendar triggers).
- **Reverse, don't lock out** — at day 14, downgrade to a capped free tier (store stays live, products/orders limited) so the gap to paid is the owner's *own success*, not a wall.
- **Light sales-assist for larger/B2B accounts only** — PLG is 3–5× cheaper CAC for SMB; reserve human touch for high-ACV.

---

## 4. Onboarding & Activation — where the real conversion lives

This is the highest-leverage area in the whole funnel. **Activation predicts conversion** more than any other factor [1][3][4].

**Verified / solid:**
- **Average activation rate is only ~37%** (Userpilot, 62 B2B cos; median 37%) — large headroom [4]. *(The "good = 40–60% / below 40% = problem" threshold was added by repeaters, not the source.)*
- **Onboarding checklist completion is low** — avg **19.2%**, median 10.1% (Userpilot, 188 cos) — so keep checklists **short (4–5 interactive steps)** [4].

**Directional (single-vendor, treat as hypotheses):** activated trials convert far higher than unactivated; time-to-value in minutes matters; pre-loaded demo data can roughly double activation; behavioral upgrade triggers beat calendar ones.

**Proven qualitative patterns:**
- **Pre-load realistic sample data** so the dashboard is *never blank* — empty screens read as "broken" to non-technical owners (Autopilot doubled activation by swapping empty states for templates; Pipedrive ships a sample pipeline) [4].
- **Replace docs with in-app guidance** — tooltips, inline hints, plain labels ("Add your first product," not "Configure SKU").
- **Celebrate milestones** — "Your store is live!" / "You made your first sale!" in plain language, never silent transitions.
- **Aha-moment exemplars** (Facebook 7-friends-in-10-days, Slack 2,000 messages, Dropbox 1 file) are *illustrative lore, not transferable targets* — derive our own magic number from data.

### What this means for Print-Flow-360 — the activation checklist to build
A **≤5-step, plain-language, interactive go-live checklist** with a visible progress bar, each step linking *directly* to the action (never to a help page):

1. **"What do you sell?"** — one question at signup that personalizes the rest.
2. **Add your first product** — pre-seeded with a demo product (e.g. "Premium Business Cards") already filled in, editable in place.
3. **Set your price** — sensible default already applied (90%-of-shops default).
4. **Publish your store** — one-click "go live," then celebrate: *"Your store is live!"*
5. **Share your link / place a test order** — drive to the first order; celebrate: *"You made your first sale!"*

**Reduce signup to ≤3 fields.** Defer all non-essential config. Set defaults so nothing *must* be configured to go live. Offer optional human help (chat) within the first few hours for owners who stall. Every empty state is an onboarding surface: one-line explanation + one primary action. Aim for the aha **within the first session, and certainly within 24 hours.**

---

## 5. The Pricing Page — transparent, 3-tier, anchored

**Well-grounded principles** (the *numbers* are mostly vendor-blog — use as direction):
- **Three self-serve tiers** is the conversion-optimal default; 5+ tiers cause choice paralysis. Add an optional "Contact Sales" only for a true enterprise/custom tier.
- **Make the middle tier the hero** — "Most Popular" badge, distinct color/border, slight scale-up. The **decoy/compromise effect** is real (Huber/Payne/Puto; Ariely's Economist case), though it doesn't *always* push the middle — design the layout to favor the tier you want to sell.
- **High-priced anchor** makes the mid-tier read as smart value.
- **Show real prices for every self-serve tier** — transparent pricing outperforms gated "contact us"; hidden prices send self-qualifying buyers to competitors.
- **Annual/monthly toggle**, annual framed as **"2 months free" (~16.7% off)** shown as monthly-equivalent. Annual lowers churn; avoid deep blanket discounts (erode LTV and attract churn-prone buyers).
- **Trust signals at the decision point** — "No credit card required," cancel-anytime / money-back guarantee in *benefit* framing, ROI-oriented proof. Guarantees reduce purchase anxiety (Baymard).
- **First-person, benefit-framed CTA** — "Start my free trial" / "Launch my store free." (The famous ContentVerve "+90%" stat is unverified/outdated — keep the *my-vs-your* lesson, drop the number.)
- **Mobile-first** — ~40–60% of pricing traffic is mobile; stacked cards, accordion comparison, 44px+ tap targets.

**The two genuinely solid quantitative anchors:** ChartMogul's **~8% median free-to-paid** and the **~3–5× card-vs-no-card multiplier** (both Jan 2026, 200 B2B products) [5]. Everything else (41.4% use 3 tiers, 1.4× three-tier lift, +32% guarantee badge) did *not* survive verification — treat as anecdote.

### What this means for Print-Flow-360
- **3 tiers + Contact Sales:** e.g. **Starter** (one storefront, accept orders) · **Growth** ← *Most Popular*, the hero (design studio, more products/volume) · **Pro** (anchor: B2B accounts, higher limits) · **Contact Sales** (custom/enterprise only).
- Lead each tier with the **1–2 outcomes that matter** (storefront live · accept orders · design studio) in plain language; collapsible full feature table below for detail-seekers. **No jargon** (no "multi-tenant," "API seats," "SKU").
- Annual default, framed "2 months free." Trust row with "No credit card required" + cancel-anytime, placed *next to* the price/CTA.
- Treat the pricing page as a continuous A/B surface (tier order, badge, CTA copy, annual framing).

---

## 6. The Opinionated Recommendation

| Decision | Recommendation | Why |
|---|---|---|
| **Model** | No-card **reverse trial** (PLG self-serve; light sales-assist for larger accounts only) | Highest-converting self-serve model short of sales; keeps non-converters warm; PLG is 3–5× cheaper CAC for SMB [3] |
| **Trial length** | **14 days** with Day-1/3/7 nudges | Short trials create urgency and convert better than 30-day [3] |
| **Credit card** | **Not required up front**; capture at the aha (first order) | Card 3–5× the rate but halves signups; no-card likely nets more *total* paying customers for intuition-led SMB; behavioral capture beats calendar [3][5] |
| **Activation event (North Star)** | **Store live + first order received within 7 days** | The real "aha," a PQL trigger, a leading revenue indicator [1] |
| **Activation checklist** | **≤5 interactive steps** (see §4), pre-seeded demo data, milestone celebrations, in-app guidance | Short checklists complete better (avg only 19.2%); demo data beats blank screens [4] |
| **Landing page** | Outcome hero + 1 CTA ("Launch my store free") + email-only form + named social proof + <2.5s LCP + mobile-first | Closes the SaaS-median (3.8%) → best-in-class (10–18%) gap [2 (LP)] |
| **Pricing page** | 3 transparent tiers, middle = hero, annual "2 months free," trust row, no jargon | 3-tier default + transparency + anchoring; ~8% median free-to-paid baseline [5] |

---

## 7. Funnel Instrumentation — exact events to track

Instrument every AARRR transition as one funnel, then segment cohorts by acquisition channel and persona to localize leaks. Track these discrete events:

| AARRR Stage | Events to fire | Key metric |
|---|---|---|
| **Acquisition** | `landing_view` (with source), `signup_started`, `signup_completed` | Visitor→signup %, CAC by channel |
| **Activation** | `onboarding_q_answered`, `first_product_added`, `price_set`, `store_published`, `first_order_received` | **Activation rate** = % signups reaching `store_published` + `first_order_received` within 7 days; **time-to-first-value** (signup → first_order) |
| **Retention** | `order_received` (recurring), `login`, `studio_used` | % activated stores receiving ≥1 order at D7 / D30 / D90 |
| **Referral** | `referral_link_shared`, `referred_signup`, `referred_first_order` | k-factor (expect <1; nudge only) |
| **Revenue** | `card_added`, `trial_upgraded`, `plan_changed`, `subscription_canceled` | Trial→paid %, MRR, LTV:CAC (target ≥3:1), SMB NRR |

### 🌟 North Star Metric
**Number of stores that received ≥1 order in the last 7 days.**
It (1) captures the value owners get, (2) is within product+marketing control, and (3) is a leading indicator of revenue. Every team metric should be a contributor to it.

**Instrumentation discipline (the "silent-lie" guard):** an unmeasurable funnel can't be diagnosed. Ensure each event above is actually fired, captured, and threaded into analytics — a field collected but not persisted is a dropped diagnosis. Use session replay to turn a "where" leak into a fixable "why."

---

## 8. Next Steps — prioritized build checklist (highest-leverage first)

1. **[Activation — highest leverage] Instrument the activation funnel.** Fire and verify every event in §7, especially `store_published` and `first_order_received`. *Nothing else can be optimized until this is measured.*
2. **Pre-seed every trial store with demo data** — a ready theme, a demo product ("Premium Business Cards"), a sample order — so no screen is ever blank on first login.
3. **Build the ≤5-step go-live checklist** (§4) with visible progress, plain labels, each step linking to the action, and milestone celebrations ("Your store is live!" / "You made your first sale!").
4. **Cut signup to ≤3 fields** (email-first); move all store config into the guided checklist.
5. **Wire the behavioral upgrade prompt** — trigger the card-capture/upgrade ask *immediately after `first_order_received`*, not on a calendar day.
6. **Implement the no-card 14-day reverse trial** — at day 14, downgrade to a capped-but-useful free tier (store stays live; products/orders limited), not a lockout.
7. **Rebuild the landing page hero** — outcome headline, one CTA ("Launch my store free"), email-only form, real screenshot, "No credit card required," named owner testimonial; ship mobile-first at 375px; target LCP <2.5s.
8. **Ship the 3-tier pricing page** — middle tier as hero, transparent prices, annual "2 months free," trust row, plain-language outcomes, no jargon.
9. **Add Day-1/Day-3/Day-7 lifecycle nudges** for stores that haven't gone live yet, plus optional human chat within the first few hours for stalled owners.
10. **Stand up two dashboards** — Activation (signup → live → first order) and Retention (activated stores still receiving orders at D7/D30/D90) — and review the single worst-converting step weekly.
11. **[Later] Layer an incentivized referral** once retention is solid; measure k-factor but treat it as amplification, not a growth engine.
12. **[Continuous] A/B test** landing hero, CTA copy, pricing tier order/badge, and the card-required vs no-card decision on our *own* funnel — don't trust borrowed lift percentages.

---

## References

1. Product Compass — AARRR (Pirate) Metrics: The 5-Stage Framework for Growth. https://www.productcompass.pm/p/aarrr-pirate-metrics
2. Userpilot — Pirate Metrics For Product-Led SaaS. https://userpilot.com/blog/pirate-metrics-saas/
3. ADV.me — SaaS Free Trial Conversion Rate Benchmarks 2025. https://adv.me/articles/conversion-optimization/saas-free-trial-conversion-rate-benchmarks-2025/
4. Amplitude — Find your North Star. https://amplitude.com/north-star-hub
5. Amplitude — Leading vs. Lagging Indicators. https://amplitude.com/blog/leading-lagging-indicators
6. OpenView — 2023 SaaS / Product Benchmarks Report. https://openviewpartners.com/2023-saas-benchmarks-report/
7. Userpilot — Funnel Drop in SaaS: How to Find and Reduce Drop-Offs. https://userpilot.com/blog/funnel-drop/
8. Wall Street Prep — Viral Coefficient: SaaS Formula + Calculator. https://www.wallstreetprep.com/knowledge/viral-coefficient/
9. Optifai — B2B SaaS LTV Benchmarks (939 Companies by Segment & LTV:CAC). https://optif.ai/learn/questions/b2b-saas-ltv-benchmark/
10. Digital Applied — Net Revenue Retention Benchmarks 2026. https://www.digitalapplied.com/blog/net-revenue-retention-benchmarks-2026-saas-expansion-data
11. daydream — Landing Page Conversion Rate Benchmarks for SaaS. https://www.withdaydream.com/library/insights/average-landing-page-conversion-rate
12. Foundry CRO — Landing Page Conversion Rate Benchmarks by Industry 2026. https://foundrycro.com/blog/landing-page-conversion-rate-benchmarks-2026/
13. DigitalApplied — Landing Page Conversion: 2,000 Pages Tested 2026. https://www.digitalapplied.com/blog/landing-page-conversion-study-2000-pages-tested-2026
14. Lenny's Newsletter — What is a good free-to-paid conversion. https://www.lennysnewsletter.com/p/what-is-a-good-free-to-paid-conversion
15. KlientBoost — Message Match: Critical Component For Ad Success. https://www.klientboost.com/cro/message-match/
16. UserEvidence — Increase landing page conversions with 3 types of social proof. https://userevidence.com/blog/how-to-increase-your-landing-page-conversions-by-adding-3-types-of-social-proof/
17. Nielsen Norman Group — Scrolling and Attention (above-the-fold eyetracking). https://www.nngroup.com/articles/scrolling-and-attention/
18. Unbounce — Conversion Benchmark Report. https://unbounce.com/conversion-benchmark-report/
19. Portent — Site Speed & Conversion Rate study. https://www.portent.com/blog/analytics/research-site-speed-hurting-everyones-revenue.htm
20. GrowthSpree — B2B SaaS Trial-to-Paid Conversion Benchmarks 2026. https://www.growthspreeofficial.com/blogs/b2b-saas-trial-to-paid-conversion-rate-benchmarks-2026-by-trial-type-acv-length-credit-card
21. Amplitude (Elena Verna) — Trial or Freemium? Get the Best of Both with a Reverse Trial. https://amplitude.com/blog/reverse-trial
22. Kyle Poyar (Growth Unhinged) — Your Guide to Reverse Trials. https://www.growthunhinged.com/p/your-guide-to-reverse-trials
23. Inflection — A Complete Guide to Reverse Trials. https://www.inflection.io/post/complete-guide-to-reverse-trials
24. ProductLed — Freemium vs. Free Trial (MOAT framework). https://productled.com/blog/freemium-vs-free-trial
25. Ordway Labs — 14 Days vs. 30 Days: SaaS Free Trial Length. https://ordwaylabs.com/blog/saas-free-trial-length-conversion/
26. ChartMogul — The SaaS Conversion Report (free-to-paid benchmarks). https://chartmogul.com/reports/saas-conversion-report/
27. Userpilot — User Activation Rate Benchmark Report 2024. https://userpilot.com/blog/user-activation-rate-benchmark-report-2024/
28. Userpilot — Customer Onboarding Checklist Completion Rate Benchmark Report. https://userpilot.com/blog/onboarding-checklist-completion-rate-benchmarks/
29. 1Capture — Free Trial Conversion Benchmarks 2025. https://www.1capture.io/blog/free-trial-conversion-benchmarks-2025
30. Userpilot — Demo Content 101: How to Use It Correctly in Your SaaS. https://userpilot.com/blog/demo-content/
31. Mode — Facebook's "Aha" Moment Was Simpler Than You Think. https://mode.com/blog/facebook-aha-moment-simpler-than-you-think/
32. Intercom — Understanding the "aha" moments in your product. https://www.intercom.com/blog/understanding-your-aha-moments-and-putting-them-to-work/
33. Userpilot — 13 Pricing Page Best Practices to Boost Conversion Rates. https://userpilot.com/blog/pricing-page-best-practices/
34. Monetizely — The Anchoring Effect in SaaS Pricing. https://www.getmonetizely.com/articles/the-anchoring-effect-in-saas-pricing-using-high-prices-to-drive-sales
35. Paddle — SaaS discounting lowers LTV by over 30%. https://www.paddle.com/blog/saas-discounting-strategy
36. ProfitWell (Paddle) — Why every SaaS company needs an annual plan. https://blog.profitwell.com/here-is-why-every-saas-company-needs-an-annual-plan
37. Pace Pricing — Hidden Prices, Lost Buyers. https://www.pacepricing.com/blog/hidden-prices-lost-buyers-why-b2b-saas-companies-should-embrace-transparency
38. Baymard Institute — money-back guarantee / trust research. https://baymard.com/
39. Sixteen Ventures (Lincoln Murphy) — SaaS Free Trial Conversion Benchmarks. https://sixteenventures.com/saas-free-trial-benchmarks
40. Wikipedia — Decoy Effect (Huber/Payne/Puto; Ariely). https://en.wikipedia.org/wiki/Decoy_effect
