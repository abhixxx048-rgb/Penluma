# Print-Flow-360 - Pricing & Packaging Strategy: Good-Better-Best + Value-Metric Selection

> **Date:** 2026-06-16
> **Scope:** How we **package and price our own subscription** to print-shop owners - the tier structure (Good-Better-Best), the value metric we charge on, the per-tier segment fit, and the expansion engine. This is about *our* SaaS price, **not** the in-product print-pricing engine (that lives in `readme/PRICING_MODULE.md`).
> **Status:** Decision-ready proposal. Treat every vendor-blog benchmark as **directional - A/B-test on our own funnel before locking.** Several headline figures are fact-check-flagged inline; we use the corrected version, not the myth.
> **Sibling docs (same 2026-06-16 set):** read alongside the conversion-funnel, onboarding/activation, retention, and referral strategy docs in `readme/`. Builds directly on `readme/PRICING_RETENTION_REFERRALS_STRATEGY_2026-06-15.md` and `readme/CONVERSION_FUNNEL_RESEARCH_2026-06-15.md`.

---

## TL;DR - the decisive recommendation

Ship a **3-tier Good-Better-Best ladder priced on the "per active storefront/location" value metric**, in plain shop language - **Solo Shop ($39/mo) · Growing Shop ($99/mo, the hero) · Multi-Location ($249/mo, the anchor)** - annual at "2 months free." Price these as a **deliberate land-grab wedge that is *higher* than the draft's earlier $29/$79/$199 floor**, because Print-Flow-360 does strictly more than Printavo (storefront + designer + order/print spine + B2B + 6 gateways) yet Printavo's hero tier is already $244/mo for five users; pricing below that while doing more is the [OpenView "43% of SaaS underprice"](https://openviewpartners.com/blog/saas-pricing-insights/) trap, not a strategy. The expansion engine is a **soft monthly-order allowance that NEVER blocks a live sale** - it nudges and auto-upgrades on consent, targeting a realistic **~100–105% NRR** (not the 120% a low-ARPA shop-owner base cannot reach, per the repo's own [ChartMogul](https://chartmogul.com/reports/saas-conversion-report/)-grounded caution). And we explicitly concede we **do not compete for the Gelato-style print-on-demand self-seller** who expects a free plan + transaction fee.

**The one tension this doc resolves up front:** the reverse trial and the GBB decoy must not fight each other. **Resolution: the reverse trial gives everyone Growing-Shop-level *capability* during the 14 days, but the upgrade moment surfaces the FULL 3-tier pricing page (all three tiers visible, Growing Shop badged "Most Popular"), with the owner's own trial usage pre-mapped to the tier that fits.** The trial sells the value; the pricing page sells the choice. See §6.

---

## 1. The frameworks, explained and cited

### 1.1 Good-Better-Best (GBB) packaging

Good-Better-Best is the dominant SaaS packaging pattern: three named tiers - a lower **"Good"** entry tier, a **"Better"** hero middle tier most customers should buy, and a premium **"Best"** anchor that makes the middle feel like a deal.

The single most-cited evidence is **OpenView's own study of 104 SaaS companies**: **72 of the 104 (≈69%) use some form of Good/Better/Best packaging** - named examples include Slack, DocuSign, Lessonly, and InsideSales.com ([OpenView, *Insights from 100 SaaS Companies: Why It's Time to Rethink Your Packaging Strategy*](https://openviewpartners.com/blog/insights-from-100-saas-companies-why-its-time-to-rethink-your-packaging-strategy/)).

> ⚠️ **Attribution correction (vs. an earlier draft).** This 72-of-104 figure is **OpenView's primary research**, not Monetizely's - Monetizely and others only re-report it. Cite OpenView. The precise figure is **72 of 104**, not "100+."

Why three works and not five: more than three or four tiers causes choice paralysis and depresses conversion; the canonical **decoy / compromise effect** (Huber, Payne & Puto; popularized by Ariely's *Economist* subscription case) makes a middle option look like the rational compromise when flanked by a cheaper-but-thinner option and a pricier anchor ([Wikipedia: Decoy Effect](https://en.wikipedia.org/wiki/Decoy_effect)). Practitioner consensus targets **~60–70% of paid customers landing on the hero middle tier** ([HBR, *How to Design a Better Pricing Structure / GBB*](https://hbr.org/2018/09/a-quick-guide-to-value-based-pricing); The Good / Kalungi / Cobloom, all directional).

> ⚠️ **Fact-check discipline.** The "60–70% on the middle tier" target and the "decoy lifts middle-tier take 1.4×" numbers are practitioner heuristics, **not measured laws** - instrument our own tier mix and treat them as directional.

### 1.2 Value-metric selection

The **value metric** is the unit you charge on - it should track the value the customer receives, scale as they grow, and be something they can predict and budget. OpenView's framework: a good value metric is (1) easy to understand, (2) aligned to the value the customer gets, and (3) grows with the customer ([OpenView, *The 7 Habits of Highly Successful Value Metrics*](https://openviewpartners.com/blog/value-metric/)). For SMB vertical SaaS, the most legible metric is usually **per location/site**, because the owner is the singular buyer-and-user and "one storefront = one location" maps to a real-world thing they already understand. Seat-based and revenue-share (GMV-%) metrics both backfire here: seats penalise the owner-operator who *is* the only seat, and a revenue-share "feels like a tax on their own success."

### 1.3 Hybrid (base + usage) is the modern default, not pure usage

Pure usage-based pricing **peaked and is receding**: adoption rose **27% → 46% (2022), then fell to 41% (2023)** - and most "usage-based" companies are actually **hybrid** (a base subscription + a usage layer) ([Kyle Poyar / Growth Unhinged](https://www.growthunhinged.com/)). The fast-growing variant is **credit-based pricing: 79 of the PricingSaaS 500 now offer a credit model, up from 35 at end-2024 (+126% YoY)**, with new adopters including Figma, HubSpot, and Salesforce ([PricingSaaS / Growth Unhinged](https://www.growthunhinged.com/)). The takeaway for us: a **predictable base + a light usage allowance** (orders/month) is the right structure - not pure metered billing, which non-technical owners cannot forecast and which risks bill-shock.

### 1.4 Value-based pricing and the expansion premise - with honest caveats

Value-based pricing (price to the buyer's perceived value, not cost-plus or competitor-minus) is repeatedly associated with better retention and expansion.

> ⚠️ **Vendor-data flags (apply the same discipline the repo's prior docs use):**
> - "Value-based pricing → ~75% less churn / ~30% more expansion revenue" is **Patrick Campbell / ProfitWell vendor data** ([ProfitWell / Paddle](https://www.paddle.com/resources/profitwell)). Directional, vendor-sourced - not an independent finding.
> - "High-growth SaaS gets ~70% of growth from expansion" is a cohort-study claim commonly cited but source-fuzzy; treat as **directional**, not a law.
> - The "40% expansion / 30% retention / 30% acquisition" roadmap split is a **single-vendor heuristic** (High Alpha / Monetizely) - directional only.
> - "a16z ~$5K-ARPC threshold for human-touch sales" is a real a16z vertical-SaaS rule of thumb but is a **heuristic**; we cite it as the boundary above which outbound/sales-assist pencils out, not a precise constant.

**Most importantly - the NRR reality check.** Print-Flow-360 at $39–$249/mo is a **low-ARPA SMB base**. The repo's own research is blunt about this: **only 2.7% of companies with ARPA <$10/mo exceed 100% NRR, and median SMB NRR is ~97%** ([ChartMogul](https://chartmogul.com/reports/saas-conversion-report/), via `PRICING_RETENTION_REFERRALS_STRATEGY_2026-06-15.md`). Our ARPA is higher than $10 but still low. **Chasing 120% NRR here is unrealistic.** The honest, achievable target is **~100–105% NRR**, reached by (a) the order-overage allowance and (b) the Solo→Growing→Multi-Location upgrade path plus B2B add-ons - *not* by assuming aggressive expansion saves a low-ARPA base.

---

## 2. The print vertical is NOT one buyer - segment the ladder before pricing it

The biggest correction to earlier thinking: **"print-shop owner" is at least four distinct segments** with radically different ACV tolerance, feature needs, and "right" tier. A single 3-tier ladder *can* serve three of them - but only if each tier is consciously aimed at a named segment, and we **concede the fourth segment we will not win.**

| Segment | Who they are | What they buy on | ACV tolerance | Our fit & target tier |
|---|---|---|---|---|
| **(a) Screen-print / apparel shops** | Printavo's core; t-shirt/merch shops running production schedules and job boards | Production scheduling, job board, per-seat staff | **Higher**, per-seat-tolerant | Partial - we lack a press/job scheduler (`PLATFORM_GAP_ASSESSMENT` Tier-2). We win the *storefront + ordering + design* half, not the production-MIS half. Land them on **Growing / Multi-Location**, but don't over-promise scheduling. |
| **(b) Trade / commercial litho printers** | Estimating-driven, B2B-account-heavy commercial printers | Estimating + B2B accounts + pay-on-account + departments | **Higher** | Strong fit on the storefront+B2B axis. For them the **Multi-Location / B2B tier is their NEED, not an upsell** - credit accounts, departments, contract pricing are table stakes. Target: **Multi-Location**. |
| **(c) Copy / quick-print / sign shops** | Lowest-ACV, most price-sensitive; want a storefront + a design tool, fast | Storefront live + design studio + simple ordering | **Lowest, price-sensitive** | **Our truest core.** This is the Solo/Growing target - the buyer the conversion-funnel and acquisition docs are written for. Target: **Solo → Growing**. |
| **(d) Pure print-on-demand / merch self-sellers** | Gelato's segment - dropship merch, no physical shop | A **free plan + per-transaction fee** | **Near-zero subscription tolerance** | **We do NOT compete here. Concede it.** Gelato 2026 = Free plan (6% transaction fee, dropping to 4% after the 21st item on paid), Gelato+ $29.99/mo (or $19.99 annual), Gelato Gold $129/mo (up to 25 stores, 20 users), Platinum custom ([Gelato pricing](https://www.gelato.com/pricing)). The free-plus-transaction-fee model is exactly what this buyer expects and exactly what we reject (we have real per-tenant serving cost). PFL360 will not win the POD self-seller - and that's the right call, not a gap. |

**Implication:** our ladder is built for **(c) as the volume engine, (b) as the high-value anchor, and (a) as an opportunistic Growing/Multi-Location fit** - and **(d) is out of scope.** Say so on the pricing page by what we *don't* offer (no "free forever + we take a cut of every sale" plan).

---

## 3. Competitive price anchoring - and why we go ABOVE the floor, on purpose

Earlier thinking positioned us "credibly *below* Printavo's mid-tier to avoid underpricing." **That logic is self-defeating** and we reject it: you cannot simultaneously claim "richer than Printavo" *and* "priced below Printavo's mid-tier" as evidence of correct pricing - that is the underpricing trap, dressed up. **OpenView found 43% of SaaS companies underprice** ([OpenView pricing insights](https://openviewpartners.com/blog/saas-pricing-insights/)); pricing a *more-capable* product below a *less-capable* competitor's hero tier is how you join that 43%.

**Verified competitor anchors (2026):**

| Competitor | What it does vs. us | Pricing (2026, verify at decision time) |
|---|---|---|
| **Printavo** | Print **MIS only** - job tracking, scheduling, invoicing. **No storefront, no design studio, no customer-facing order spine, no B2B credit accounts.** | **Lite $109/mo (2 users) · Standard $244/mo (5 users, "Most Popular") · Premium custom (20 users, +$19/extra user)**, 7-day trial ([Printavo via SoftwareConnect](https://softwareconnect.com/reviews/printavo/), [TrustRadius](https://www.trustradius.com/products/printavo/pricing)). Standard's per-seat math ≈ **$49/user**. |
| **Gelato** | POD/dropship - **not a shop platform.** | Free (6% fee) · Gelato+ $29.99/mo · Gold $129/mo · Platinum custom ([Gelato](https://www.gelato.com/pricing)). |
| **Shopify** | General e-commerce, **not print-specific** (no print pricing engine, no designer, no print-job spine). | Basic ~$39 · mid ~$105 · Advanced ~$399, **+ ~2.4–2.9% card fees** - directional; Shopify changes pricing/region often, **verify at time of pricing decision** ([Shopify pricing](https://www.shopify.com/pricing)). |

**What Print-Flow-360 does that Printavo does NOT** (per `PLATFORM_GAP_ASSESSMENT_2026-06-07.md` §2): hosted storefront + CMS page builder (50+ blocks), Fabric.js design studio with template personalization, a real print-pricing engine (7 strategies), B2B company accounts with credit/pay-on-account and departments, and 6 payment gateways. We are **broader** than Printavo (we straddle web-to-print *and* part of MIS).

**Therefore - the deliberate call:** anchor the **Growing Shop hero at $99/mo** and **Multi-Location at $249/mo**. The Multi-Location anchor sits **just above Printavo's $244 Standard hero** - correct, because it does more - while Growing Shop at $99 is **below Printavo's $244 hero but well above its $109 Lite (2-user) entry**, positioned as the value sweet spot for the copy/quick-print core. This is **a conscious land-grab wedge**: priced to win switchers from Printavo and from manual/no-software shops, *not* an accidental discount. If willingness-to-pay research with real shops supports it, raise the anchor toward $299–$349 before launch - the risk here is pricing too low, not too high.

> ⚠️ **All competitor prices: verify at the moment of the pricing decision.** Shopify and Printavo both re-price frequently; these are anchors for *reasoning*, not fixed inputs.

---

## 4. The recommended packaging

**Value metric:** **per active storefront/location**, with a **soft monthly-order allowance** as the light usage layer (§5). Never seats, never GMV-%.

**Billing:** monthly default + **annual at "2 months free" (16.7% off)**, annual shown as the recommended option. Annual lock-in is the single biggest lever against structurally high SMB churn (per the retention doc).

| | **Solo Shop** *(Good)* | **Growing Shop** *(Better - HERO)* | **Multi-Location** *(Best - anchor)* |
|---|---|---|---|
| **Price (monthly)** | **$39** | **$99** | **$249** |
| **Annual (2 mo free)** | $390/yr (~$32.50/mo) | $990/yr (~$82.50/mo) | $2,490/yr (~$207.50/mo) |
| **Primary segment** | Copy / quick-print / sign - solo owner, low volume | Established single shop scaling online (copy/quick-print + opportunistic apparel) | Commercial litho + multi-site + B2B-account shops |
| **Storefronts** | 1 | 1 | Multiple (pooled) |
| **Order allowance/mo** | ~50 (soft) | ~300 (soft) | ~1,500 pooled (soft) |
| **Design studio + My Designs** | ✓ | ✓ | ✓ |
| **Print-pricing engine** | ✓ | ✓ | ✓ |
| **B2B company accounts / credit / departments** | - | Limited (a few accounts) | ✓ Full (their core need) |
| **Custom fields / advanced CMS** | Limited | ✓ | ✓ |
| **Staff users** | 1–2 | Up to 5 | Unlimited |
| **Priority support** | - | ✓ | ✓ (+ onboarding help) |

**Goal:** **60–70% of paid shops on Growing Shop.** Multi-Location anchors it as a deal *and* is the genuine home for the B2B/commercial segment. Tier names are shop-language - never "Standard / Pro / Enterprise SKU."

**No permanent free tier as a *plan*.** The "free fallback" is the **reverse-trial down-state** (§6), not a marketed free plan - consistent with the conversion-funnel doc's rejection of freemium for a product with real per-tenant serving cost, and with our concession that we don't chase the Gelato free-plan segment.

---

## 5. The expansion engine: a soft order allowance that NEVER blocks a sale

This is the core of the NRR story, and the earlier draft left it as an unshipped hand-wave. **Decisive position, built to the repo's §0 non-technical-owner UX bar:**

1. **Soft cap, never a hard cutoff.** When a shop exceeds its monthly order allowance, **we never block, delay, or take down a live storefront or refuse an order.** A shop owner mid-sale who hits "you've exceeded your plan" and loses the sale is a catastrophic §0 failure (bill-shock + a dead store). Orders always go through.
2. **Plain-language nudge, not a metered bill-by-surprise.** When usage crosses ~80% of the allowance, show a calm in-app banner: *"Great month - you've taken 240 of your 300 included orders. Shops growing like yours usually move to Multi-Location for more headroom."* At 100%, the order still processes; the banner becomes: *"You're past your plan's included orders - nothing's blocked. Want to upgrade so you're set for next month?"*
3. **Auto-upgrade only on explicit consent.** We do **not** silently start charging overage. The owner either (a) clicks to upgrade to the next tier, or (b) opts in once to "let extra orders cost a little rather than upgrade." Default is *no surprise charge.*
4. **If overage is offered, the unit price is legible and derived from the tier step.** Overage is priced as **the next tier's effective per-order headroom cost, rounded to a clean number** - e.g. Growing Shop's $60 step over Solo buys ~250 extra orders ≈ **$0.25/order**, so overage on Solo is **$0.25/order**; Multi-Location's step implies ~$0.12/order. It is never a punitive metered rate; it is always *cheaper to just upgrade*, which is the point - the nudge is honest.
5. **The allowance is "orders," the one number an owner already tracks.** Not API calls, not "credits," not GB. Orders/month is the legible value metric a shopkeeper can forecast.

This drives expansion **without** bill-shock and is what makes ~100–105% NRR realistic for a low-ARPA base - the upgrade is triggered by the shop's *own success*, exactly when willingness-to-pay peaks.

---

## 6. Resolving the reverse-trial ↔ GBB-decoy tension (the must-fix)

The two pillars appear to fight: the conversion-funnel doc recommends a **no-card 14-day reverse trial** that drops everyone into premium capability, while *this* doc spends its length building a **GBB decoy** in which the cheaper Solo Shop tier must stay visible to make Growing Shop look like the smart compromise. If the trial silently anchors everyone on Growing Shop, **Solo Shop becomes invisible during peak willingness-to-pay** and the decoy collapses.

**Decisive reconciliation:**

- **During the trial:** everyone gets **Growing-Shop-level capability** (the full design studio, real product/order flow, no crippling) so they reach activation (store live + first order) fast. The trial is about *experiencing value*, not *choosing a plan*.
- **At the upgrade moment** (triggered behaviorally - right after the first order, not on a calendar day) and **at day-14 expiry:** surface the **FULL 3-tier pricing page - all three tiers visible at once**, Growing Shop badged "Most Popular," with the owner's **actual trial usage pre-mapped** to the recommended tier (*"Based on your 18 orders and 1 storefront this trial, Solo Shop covers you - or Growing Shop if you're scaling. Here's all three."*).
- **The decoy is preserved** because the choice screen - not the trial - is where GBB does its work. Showing all three tiers with usage-based guidance lets a true solo owner self-select Solo, a scaling shop pick the hero Growing, and a B2B/commercial shop recognise Multi-Location as their need.
- **At expiry without upgrade:** **reverse-trial down-state**, not a lockout - the store stays live, capped to Solo-Shop limits (e.g. 1 storefront, limited orders, design studio retained), so a hesitant owner downgrades-in-place instead of churning, and re-converts later on loss aversion. This is the "free fallback," delivered as a trial down-state, not a marketed free plan.

**Net:** reverse trial = how we sell *value*; full 3-tier pricing page at the decision = how we sell *the choice*. They are sequential, not in conflict.

---

## 7. RECOMMENDATION (decisive calls)

1. **Ship 3 tiers, GBB, hero middle:** **Solo Shop $39 · Growing Shop $99 (hero) · Multi-Location $249 (anchor).** Annual at "2 months free." Target 60–70% on Growing Shop.
2. **Value metric = per active storefront/location**, plus a **soft monthly-order allowance** as the light usage layer. Never seats, never GMV-%.
3. **Price ABOVE the underpricing floor on purpose.** Multi-Location ($249) sits just above Printavo's $244 hero because we do more; Growing Shop ($99) is the wedge for the copy/quick-print core. If WTP research supports it, raise the anchor to $299–$349 - the risk is pricing too low.
4. **Segment the ladder consciously:** Solo/Growing for copy/quick-print (our core), Multi-Location for commercial-litho/B2B (their *need*), opportunistic Growing/Multi-Location for apparel. **Concede we do not compete for the Gelato POD self-seller** and say so by what we don't offer.
5. **Order allowance is a soft cap that never blocks a sale**, nudges in plain language, and auto-upgrades only on consent; overage (if opted-in) is ~$0.25/order on Solo, always cheaper-to-upgrade.
6. **Reverse trial + GBB are sequenced, not conflicting:** Growing-Shop capability during the trial; full 3-tier pricing page (usage-mapped) at the upgrade moment; Solo-capped down-state on expiry, never a lockout.
7. **Target ~100–105% NRR, NOT 120%.** State the realistic number; 120% contradicts the repo's own ChartMogul caution for a low-ARPA base.
8. **No marketed free plan.** The free experience is the reverse-trial down-state only.

---

## 8. Next-steps / sequencing checklist

This maps onto Phase 4 ("Plan tiers + enforcement + annual") of the retention doc's roadmap - but **do it after** dunning + onboarding-to-activation (Phases 1–2), which are cheaper churn wins.

1. **[Prereq] Willingness-to-pay research** with 10–20 real shops across the three target segments (van Westendorp price-sensitivity or simple "what would you pay" interviews from the founder-led outreach motion). Confirm or adjust the $39/$99/$249 anchors **before** building enforcement.
2. **Build structured plan tiers + feature/quota gating.** Today `plans` is bare (`name`, `monthly_charge`, free-text `features` JSON) with no enforcement layer - add structured feature flags + usage limits + a plan-tier enforcement service/middleware (per the retention doc's "what to build").
3. **Add the annual interval** (currently monthly-only) at 16.7% off, annual shown as recommended.
4. **Implement the soft order-allowance meter** - track orders/mo per tenant, the 80%/100% in-app nudges, and consent-gated auto-upgrade. **Never block an order.** Plain-language only; no decline codes, no "limit exceeded" walls.
5. **Wire the reverse trial → full-3-tier upgrade screen** with usage pre-mapping (behavioral trigger after first order + day-14 expiry), and the **Solo-capped down-state** instead of a lockout.
6. **Build the pricing page** to the conversion-funnel doc's spec: 3 transparent tiers, middle hero badged "Most Popular," outcome-led plain-language tier descriptions, annual "2 months free," trust row, no jargon, mobile-first at 375px. Put a verified customer count / star rating near the price (high-anxiety zone).
7. **Instrument tier mix + NRR + overage take.** Confirm ~60–70% land on Growing Shop; if not, the decoy/layout is wrong - fix the pricing page, not the prices first.
8. **A/B test on our own funnel:** tier-price anchors, the "Most Popular" badge, annual framing, and the overage nudge copy. Don't trust borrowed lift percentages.

---

## Sources

- OpenView - *Insights from 100 SaaS Companies: Why It's Time to Rethink Your Packaging Strategy* (the 72-of-104 GBB study; Slack/DocuSign/Lessonly/InsideSales.com): https://openviewpartners.com/blog/insights-from-100-saas-companies-why-its-time-to-rethink-your-packaging-strategy/
- OpenView - *Pricing Insights from 2,200 SaaS Companies* (43% underprice): https://openviewpartners.com/blog/saas-pricing-insights/
- OpenView - *The 7 Habits of Highly Successful Value Metrics*: https://openviewpartners.com/blog/value-metric/
- HBR - *A Quick Guide to Value-Based Pricing / GBB structure*: https://hbr.org/2018/09/a-quick-guide-to-value-based-pricing
- Wikipedia - *Decoy Effect* (Huber/Payne/Puto; Ariely Economist case): https://en.wikipedia.org/wiki/Decoy_effect
- Kyle Poyar / Growth Unhinged - usage-based adoption 46%→41%; credit-pricing +126% YoY: https://www.growthunhinged.com/
- ChartMogul - *SaaS Conversion Report* (NRR by ARPA; 2.7% of <$10 ARPA exceed 100% NRR): https://chartmogul.com/reports/saas-conversion-report/
- ProfitWell / Paddle - value-based pricing & expansion data (vendor-sourced, directional): https://www.paddle.com/resources/profitwell
- Printavo pricing 2026 - Lite $109 / Standard $244 / Premium custom: https://softwareconnect.com/reviews/printavo/ · https://www.trustradius.com/products/printavo/pricing
- Gelato pricing 2026 - Free (6% fee) / Gelato+ $29.99 / Gold $129 / Platinum: https://www.gelato.com/pricing
- Shopify pricing (directional, verify at decision time): https://www.shopify.com/pricing

### Cross-references (internal)
- `readme/PRICING_RETENTION_REFERRALS_STRATEGY_2026-06-15.md` - subscription pricing/retention/referrals; the ChartMogul NRR caution and the per-location value-metric grounding this doc builds on.
- `readme/CONVERSION_FUNNEL_RESEARCH_2026-06-15.md` - the no-card 14-day reverse trial, activation North Star, and pricing-page CRO spec reconciled here.
- `readme/ACQUISITION_CHANNELS_2026-06-15.md` - founder-led outreach + communities; the channel that also sources the WTP interviews in step 1.
- `readme/PLATFORM_GAP_ASSESSMENT_2026-06-07.md` - what we do vs. Printavo (storefront + designer + B2B) and the production-MIS gaps that bound the apparel-segment fit.
- `readme/PRICING_MODULE.md` - the *in-product* print-pricing engine (distinct from this subscription-pricing doc).
</content>
</invoke>
