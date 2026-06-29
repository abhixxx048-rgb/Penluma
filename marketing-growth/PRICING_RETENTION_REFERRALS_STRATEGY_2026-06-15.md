# Print-Flow-360 — SaaS Growth Strategy: Pricing, Retention & Referrals

> **Scope:** This doc is about the **Print-Flow-360 business itself** — how we price, retain, and grow our own base of paying print-shop owners (subscribers). It is **not** about the product's internal print-pricing engine (that lives in `readme/PRICING_MODULE.md`). When this doc says "price", it means *our subscription price*, not what a shop charges for business cards.
>
> _Last updated: 2026-06-15. Status: reference + proposal, open to debate. Audience: founders / GTM / product leadership. Treat every benchmark as **directional** — instrument our own funnel before locking targets. Several widely-quoted figures are fact-check-flagged below; we use the corrected/nuanced version, not the myth._

## Why this doc

Print-Flow-360 is a textbook **low-ACV, SMB-focused, vertical SaaS** sold to non-technical print-shop owners — the single highest-churn, lowest-paid-acquisition-tolerance segment in software. That profile dictates almost everything: we cannot afford paid ads, our churn will be structurally high (3–5%/month for SMB self-serve), most of our churn is decided in the first 90 days, and our cheapest, highest-quality growth comes from one shop owner telling another. This document pulls the research-backed playbook for SaaS pricing, churn/retention, unit economics, referrals, social proof, and lifecycle email — and translates each into concrete moves for **this audience** and **this codebase** (which already has a strong billing/subscription spine and a mature email/notification system, but no referral system, no lifecycle automation, and thin plan tiers).

## TL;DR — the 10 highest-leverage moves

1. **Charge per shop/location, not per seat or revenue-share.** The owner is the buyer *and* the user; per-location is the value metric they can budget. Layer light order-volume usage only as accounts grow (hybrid, not pure usage).
2. **Ship Good-Better-Best (3 tiers) with a "hero" middle tier** in plain shop-language ("Solo Shop / Growing Shop / Multi-Location"). Target 60–70% of paid users on the middle tier.
3. **Default to a 14-day free trial with structured in-app Day-3 / Day-7 nudges** — not a 30-day trial. The optimum depends on trial type and time-to-value; pair it with a permanent thin free tier (reverse trial) so hesitant owners downgrade instead of churning.
4. **Build dunning / failed-payment recovery first.** 20–40% of churn will be involuntary (expired cards, declines) and it is the cheapest revenue you'll ever recover — plan for **~40–60% recovery** (not the vendor-marketed 60–80%).
5. **Make onboarding end in a live storefront + first product/order.** 60–70% of annual churn is decided in the first 90 days; define one explicit **activation metric** and drive every onboarding email toward it.
6. **Build a dead-simple two-sided referral mechanic** ("Invite another shop — both get a free month"), reward in product credit (not cash), trigger at a real success moment, pay only on the referred shop's first paid invoice.
7. **Wire behavior-triggered lifecycle email**, not broadcast. Triggered emails convert ~10x better than batch. We already have the campaign/notification infra — what's missing is *triggered journeys*.
8. **Collect named, metric-rich case studies of real shops** and put a customer count + star rating on the pricing page. Skeptical SMB owners trust peers, not pitches.
9. **Push annual at "2 months free" (16.7% off)** prominently — annual lock-in is the single biggest lever against high SMB churn.
10. **Build a lightweight churn health score** from data we already have (login recency, has-published-a-product, orders in last 30 days) to flag drift 60–90 days before cancellation, and attach a signal-matched save play.

---

## 1. SaaS Pricing Strategy

### Research-backed principles

**Free trials beat freemium for a paid-from-day-one tool.** Free-trial products convert free-to-paid at **8–12% (good) / 15–25% (great)**, vs freemium self-serve at only **3–5% (good) / 6–8% (great)** — roughly 2–3x better — and trial cash arrives in ~14 days vs 60–90 for freemium _(Lenny's Newsletter / Kyle Poyar, 1,000+ products)_.

> ⚠️ **Fact-check nuance:** Those trial bands blur **opt-in (no card)** vs **opt-out (card required)**, which swing conversion ~3x: opt-in medians ~14–18%, opt-out medians ~44–49%. Quote the split, not the blended 8–25%. Blended median B2B trial-to-paid is ~18.5%; top quartile 35–45%+ _(First Page Sage / Userpilot)_.

**14-day trials are the best *default* — but length must match motion.** 7–14-day trials with urgency outperform 30-day for most B2B SaaS _(OpenView / aggregated benchmarks)_.

> ⚠️ **Fact-check nuance:** The headline "71% better than 30-day" and "44.1%" are **study-specific artifacts, not laws**. Shorter trials win in **opt-in** motions (urgency drives activation); 30-day can convert 5–8% *higher* in **opt-out** (card-required) because there's more time to reach activation depth. The real rule: trial length must match trial type and how fast users hit the aha-moment. Extend toward 21–30 days only if setup/integration is heavy.

**Reverse trials capture both reach and loss-aversion conversion.** Users start on time-limited premium, then downgrade to free or buy. Reverse-trial conversion is **~7–11% (good) / 14–21% (great)** (2026 narrower data: 4–6% / 8–12%, small sample). Losing premium is ~2x as motivating as gaining it. Pioneered by Airtable _(Kyle Poyar, Growth Unhinged)_.

**Charge per location, not per seat or GMV.** For SMB vertical SaaS, "locations" is the most atomic value metric — it maps to actual storefronts, the buyer is the owner (singular authority), and SMBs prefer simple, predictable per-location pricing they can budget _(Tidemark / Mostly Metrics / Monetizely)_.

**Good-Better-Best with a hero middle tier is conversion-optimal.** Three tiers — a lower "decoy", a "hero" middle most should buy, and a premium "anchor" that makes the middle feel like a deal. **60–70% of paid users should land on the middle tier** _(The Good / Kalungi / Cobloom)_.

**Pure usage-based pricing is declining; hybrid dominates.** Usage-based adoption peaked at **46% (2022) → 41% (2023)**; most "usage-based" businesses are actually hybrid. Credit-based pricing jumped **+126% YoY** into 2025, and there were **1,800+ pricing changes** across the top 500 in 2025 (~3.6 per company) _(Kyle Poyar / SaaSMag)_.

**Annual plans should be incentivized at "two months free."** The most common annual discount is **16.7% (= 2 months free)**; the defensible range is **15–20%**. Annual plans show lower MRR but materially higher retention _(Recurly / OpenView / Glencoyne)_.

> ⚠️ **Fact-check nuance:** The "market avg rose to ~28% by 2025" tail reflects deeper enterprise/competitive discounting, not the SMB norm. Don't over-discount to compete — the legible "2 months free" framing beats a raw 28%.

**Enterprise earns higher retention; SMB demands radical simplicity.** Enterprise-focused products run ~8–10% higher NRR than SMB-focused. For non-technical owners, pricing must be self-explanatory: plain tier names, a recognizable value metric, **no jargon** (no "GMV %", "API calls", "seats", "metered units") _(Paddle / ProfitWell, 6,000+ companies)_.

| Metric | Value | Source |
|---|---|---|
| Free-trial free-to-paid | good 8–12% / great 15–25% (split opt-in vs opt-out!) | Lenny's / Poyar |
| Freemium self-serve | good 3–5% / great 6–8% | Lenny's / Poyar |
| Reverse-trial conversion | good 7–11% / great 14–21% | Growth Unhinged |
| Opt-in (no card) trial-to-paid | median ~14–18% | First Page Sage |
| Opt-out (card) trial-to-paid | median ~44–49% | First Page Sage |
| Best default trial length | 14 days (motion-dependent) | OpenView |
| Hero (middle) tier share | 60–70% of paid users | The Good / Kalungi |
| Usage-based adoption | 46% (2022) → 41% (2023) | Growth Unhinged |
| Annual discount (most common) | 16.7% (= 2 months free); 15–20% band | Recurly |
| NRR: enterprise vs SMB | ~8–10% higher for enterprise-focused | Paddle / ProfitWell |

### For Print-Flow-360

Print-shop owners are the classic vertical-SaaS buyer: singular authority, zero tolerance for jargon. Concretely:

- **Value metric = per shop/location**, with an optional light order-volume layer that only activates as a shop grows. Never lead with seats, GMV %, or API calls — revenue-share "feels like a tax on their own success".
- **Trial:** default 14-day, with in-app **Day-3 and Day-7 nudges**. Because onboarding here involves importing products/pricing/designs, a **guided setup matters more than extra days** — the activation milestone (live storefront + first product) is what we optimize, not trial length in isolation.
- **Reverse trial / thin free tier:** let a hesitant owner fall back to a permanent free tier rather than churn, then re-convert on loss aversion.
- **Annual at "2 months free"** displayed prominently — the single biggest lever against SMB churn.
- Every plan label, value metric, and discount must satisfy the project's **§0 non-technical-owner UX bar**: self-explanatory without a sales call, with proper loading/empty/error and "integration-not-configured" guidance around any gated paid feature (a dead paywalled feature during trial reads as "broken product" and kills conversion).

**What already exists (repo grounding):** A real subscription spine — `Plan`, `Subscription` (with `trial_ends_at` + `status` enum: `trial/active/cancelled/expired/charge_failed`), `SubscriptionPlanChange`, `SubscriptionTransaction`, `BillingSettings`, `Invoice`, `Payment`, `PaymentProfile`, `TenantPaymentProfile`, `PaymentWebhookEvent`. Trial logic is live: `AccountStatusService::approveTrial()` creates a trial from the cheapest plan (default 15 days); `BillingService`/`PaymentService` (PayPal/Razorpay under `app/Services/Billing/`) handle charging.

**What to build:**
- **Structured plan tiers + quota/feature gating.** Today `plans` is bare (`name`, `monthly_charge`, `monthly_charge_per_user`, `trial_days`, free-text `features` JSON). There's no enforcement layer. Add structured feature flags + usage limits + a **plan-tier enforcement** middleware/service.
- **Annual interval** (currently monthly-only) at 16.7% off.
- **Reverse-trial fallback** to a thin free tier instead of hard expiry.
- **Self-serve upgrade/downgrade UX** beyond raw `SubscriptionPlanChange` records.
- Align the default trial to **14 days** (currently 15) and add the Day-3/Day-7 in-app nudges (see §6).

### Recommended pricing model — **a proposal to debate**

> 🟡 **This is a starting point, not a decision.** Exact prices, quotas, and the free-tier shape are **TBD / decide** with real cost data (PDF service, S3, per-tenant infra) and willingness-to-pay research with actual shops.

**Value metric:** per shop/storefront (location), monthly base + optional order-volume overage as accounts scale.

**Trial:** 14-day free trial, **opt-in (no card)** to maximize top-of-funnel for non-technical owners — accepting that opt-in converts lower (~14–18%), so lifecycle email (§6) does heavy lifting. Reverse-trial fallback to a permanent thin free tier on expiry.

**Billing:** monthly default + annual at **"2 months free" (16.7% off)**, annual shown as the recommended option.

| | **Free (fallback)** | **Solo Shop** | **Growing Shop** *(hero)* | **Multi-Location** *(anchor)* |
|---|---|---|---|---|
| Who | Hesitant / dormant owners | One owner, low volume | Established single shop scaling online | Multiple locations / B2B |
| Price (TBD) | $0 | $ low | **$ middle** | $ premium / per-location |
| Storefronts | 1 (limited) | 1 | 1 | Multiple |
| Orders/mo | Capped (e.g. a few) | Standard | Higher + overage | Pooled / high |
| Designer + My Designs | Basic | ✓ | ✓ | ✓ |
| B2B accounts / departments | — | — | Limited | ✓ |
| Custom fields / advanced CMS | — | Limited | ✓ | ✓ |
| Priority support | — | — | ✓ | ✓ |

**Goal:** 60–70% of paid shops land on **Growing Shop**; Multi-Location anchors it as a deal. Tier names use shop-language, never "Standard/Pro/Enterprise SKU".

---

## 2. Churn & Retention

### Research-backed principles

**SMB SaaS churns 4–8x harder than enterprise.** SMB self-serve runs **3–5% monthly (22–39% annual)** logo churn vs **1–2% monthly** for enterprise (best-in-class <1%) — driven by low switching costs, short/no contracts, business mortality, and self-serve buying _(Optifai, 939-company dataset, supported)_.

**Median SMB NRR is only ~97% — the typical SMB SaaS is shrinking within its base.** SMB (ACV <$25K) NRR ~97%; mid-market ~108%; enterprise ~118%. **A 97% NRR is normal for SMB, not a failure** — benchmark to your segment _(Optifai / SaaS Capital / Benchmarkit)_.

**NRR compounds, but ARPA caps it.** Best-in-class NRR is 110%+ (net negative churn). But only **2.7% of companies with ARPA <$10/mo** exceed 100% NRR, and that band's top quartile caps ~65% net retention _(ChartMogul)_ — chasing 120% NRR with a low-ARPA shop-owner base is unrealistic.

**Onboarding/time-to-value is the #1 lever.** **60–70% of annual churn happens in the first 90 days** (largest bucket in the first 30). Reach first value <14 days → ~80%+ 12-month retention; no value by 30 days → 35–50% _(SaaS Mag / Shno)_.

> ⚠️ **Fact-check nuance:** This 60–70% / time-to-value cluster traces heavily to a single source family (SaaS Mag). Directionally true — early churn dominates, onboarding is the top lever — but treat the exact percentages as **illustrative, not measured constants**.

**Activation is the operational proxy for retention.** The aha moment is where the user first perceives value; the activation metric is the trackable event confirming it. Activated users retain **2x+ better**. Average SaaS activation ~**36% (median ~30%)**; ~1% activation gain ≈ ~2% lower churn _(Lenny's / Statsig / OpenView — supported)_.

**Involuntary churn is 20–40% of all churn — the most recoverable.** Failed payments cause **20–40%** of churn and bleed ~9% of MRR/year (some sources 5–15%). Cards fail ~3.9% of the time (ACH ~2.1%). "0% of involuntary churners intended to leave." _(Recurly / Stripe / ProfitWell — supported)_.

> ⚠️ **Fact-check verdict (DISPUTED):** "60–80% dunning recovery" is the **vendor-optimistic ceiling**. Real-world full-stack recovery is **~40–60%**; basic Stripe Smart Retries + emails + update page often land **25–50%**. **Plan against 40–60%, not 60–80%.**

**Signal-matched save flows beat generic outreach.** A 0–100 health score from behavioral signals surfaces risk **60–90 days** before cancellation; matching specific save-plays to specific signals yields **+28% save rate** vs generic outreach; programs return 5–15x ROI _(Kissmetrics / US Tech Automations / Accoil)_.

**Vertical SaaS is structurally stickier.** ~**3–8% annual churn** vs **10–25%** for horizontal, because it owns industry workflows, holds critical data, and lacks substitutes. Accounts with **10+ integrations churn ~40% less** _(SaaS Mag / Bloom VP)_.

| Metric | Value | Source |
|---|---|---|
| SMB monthly logo churn | 3–5% (22–39% annual) | Optifai |
| Enterprise monthly churn | 1–2% (<1% best-in-class) | Optifai |
| Median NRR (SMB / mid / ent) | ~97% / ~108% / ~118% | Optifai / SaaS Capital |
| NRR ceiling at ARPA <$10/mo | only 2.7% exceed 100% | ChartMogul |
| Churn in first 90 days | 60–70% (illustrative) | SaaS Mag |
| Avg SaaS activation rate | ~36% (median ~30%) | Statsig / OpenView |
| Involuntary share of churn | 20–40% | Recurly / ProfitWell |
| Dunning recovery (realistic) | **~40–60%** (not 60–80%) | corrected |
| Health-score save uplift | +28% (signal-matched) | US Tech Automations |
| Vertical vs horizontal churn | 3–8% vs 10–25% | SaaS Mag |

### For Print-Flow-360

Print-Flow-360 *is* the high-churn SMB vertical segment. Implications:

- **Time-to-value is everything.** Define one explicit activation metric — e.g. **"published first product to storefront"** or **"received first real order/quote"** — measure it, and gate onboarding so a shop reaches it in the **first session**. An onboarding wizard that ends in a live storefront + first product is the highest-ROI retention work the team can do.
- **Wire real dunning on the subscription side.** 20–40% of our churn will be involuntary; recovering ~40–60% of it is far cheaper than acquiring a new shop. The new notification infra (`SendAppNotification`, `CustomerNotificationService`) is the natural home for failed-payment and renewal-reminder flows. Plain language only — never expose decline codes to a shopkeeper.
- **Lean hard into vertical lock-in (our moat).** The more a shop's catalog, pricing rules, saved designs (My Designs), customers, B2B accounts, and order history live in Print-Flow-360, the lower the churn. Each integration (payment gateways, PDF service) raises switching cost — but **lock-in only exists if the data and workflow actually live in the product**; a thin storefront they could rebuild in a weekend won't retain them.
- **Build a lightweight health score** from data we already have: login recency, has-published-a-product, orders-in-last-30-days, last storefront edit. Flag drift 60–90 days early and trigger a plain-language re-engagement nudge with a **matched** save play (not generic at-risk outreach).
- **Benchmark to SMB, not enterprise:** a ~97–100% NRR is healthy here; don't treat it as a red flag, and report **both logo and revenue churn** (revenue churn can mask losing many small shops).

**What already exists:** Notification spine (`Notification`, `NotificationChannel`, `NotificationEventType`, `NotificationRecipient`, `NotificationUserPreference`, `NotificationService`, `SendAppNotification`, plus new `CustomerNotificationService` + `StorefrontNotificationController`). Storefront retention primitives: `profile/designs.vue` (My Designs) on `DesignLibraryService`, `profile/wishlist.vue`, reorder logic, `CouponService`. Subscription `charge_failed` status already exists.

**What to build:** dunning/retry + recovery-email sequence on the *subscription* side; an activation-tracking event + onboarding wizard; a tenant **churn health score** service + matched save plays; renewal reminders. Note: existing retention docs (`STOREFRONT_FIRST_ROADMAP`, `PROJECT_ROADMAP` Reprint Ledger) target storefront **shoppers**, not paying **store-owner** churn — the SaaS-tenant retention layer is unbuilt.

---

## 3. Unit Economics (LTV:CAC)

### Research-backed principles

**Use gross-margin-adjusted LTV.** Skok: Customer Lifetime = 1 / monthly churn; **margin-adjusted LTV = (ARPA × Gross Margin %) / monthly churn**. Raw-revenue LTV overstates health and hides unprofitable customers _(David Skok, forEntrepreneurs)_.

**Load CAC fully.** CAC = all S&M spend (salaries, commissions, ad spend, tooling, overhead) / new customers in the same period — not just media cost. Measure the trend, not a noisy month _(forEntrepreneurs)_.

**LTV:CAC ≥ 3:1 is a directional floor — the most-misapplied SaaS rule.**

> ⚠️ **Fact-check verdict (ROUGHLY-RIGHT, heavily caveated):** The 3:1 rule assumes a **mature, steady-state base, margin-adjusted LTV, ~80%+ gross margins, stable churn, and <12-month payback**. It is routinely misapplied to early-stage, high-churn SMB where economics differ. Treat **3:1 as directional** (<3 unhealthy; >5 may signal *underinvestment* in growth, not health). Stage-adjusted: pre-$2M ARR can tolerate ~2–3:1; $2M–$10M target 3–4:1; $10M+ often 5:1 via lower churn.

**CAC payback < 12 months is the *target*; the *actual* 2024 median is ~18–20 months.**

> ⚠️ **Fact-check:** Keep target vs reality distinct. Skok's <12mo is aspirational; Benchmarkit 2025 confirms ~18mo median (up from ~14). SMB (<$15K ACV) lands **~8–12 months** in practice; the research's "6–9 months" is best-in-class/optimistic — **use 8–12 months as the defensible SMB planning range**. Magic Number median fell to ~0.90 (target 1.0+, top quartile >2.0).

**Low-ACV SMB demands low CAC ($200–$900) and organic/referral acquisition.** At $1K–$15K ACV the economics can't absorb expensive paid acquisition (LinkedIn at ~$300 CPL doesn't work against a small contract). Outbound only pencils out above **~$5K ARPC** (a16z's vertical-SaaS threshold) _(GrowthSpree / a16z)_.

**Referral/word-of-mouth structurally beats paid for SMB vertical SaaS.** Channel CAC: **referral ~$150, inbound ~$200, SEO $480–$942, paid search ~$802, outbound ~$1,980**. Content marketing cuts CAC ~61% vs paid ads; organic leads convert ~3x higher. Best-in-class programs see **20–30%** of new customers from referrals; referred LTV ~16–25% higher, lower churn, ~30% better conversion, ~4x faster pipeline _(Optifai / a16z / Rewardful)_.

| Metric | Value | Source |
|---|---|---|
| Healthy LTV:CAC (floor) | 3:1 (margin-adjusted, steady-state) | forEntrepreneurs |
| Mature/leader LTV:CAC | ~5:1 (>5 may = underinvesting) | forEntrepreneurs |
| CAC payback target | <12 mo (aspirational) | forEntrepreneurs |
| CAC payback actual median (2024) | ~18–20 mo | Benchmarkit |
| CAC payback SMB (defensible) | **8–12 mo** | corrected |
| Total CAC, low-ACV SMB | $200–$900 | GrowthSpree |
| CAC referral / inbound | ~$150 / ~$200 | Optifai |
| CAC paid search / outbound | ~$802 / ~$1,980 | Optifai |
| Referral share (best-in-class) | 20–30% of new customers | a16z / Monetizely |

### For Print-Flow-360

- **Keep CAC well under ~$900; aim for 8–12-month payback.** Paid ads (Google/LinkedIn at $300+ CPL) will not pencil against a small monthly subscription — **do not build the growth model on paid.**
- **Lean on referral + word-of-mouth** (see §4). Print-shop owners cluster in tight local and trade communities, so a referral inside the vertical propagates faster and cheaper than any ad; referral CAC (~$150) is ~5–13x cheaper than outbound.
- **Compute LTV gross-margin-adjusted.** Our COGS includes the **PDF service, S3 storage, and per-tenant infra** — margin-adjust before claiming any 3:1 ratio. Don't compute LTV on early, unstable churn (1/churn lifetimes inflate wildly with only months of data).
- **Retention is the cheapest ratio fix.** At SMB churn of 1.5–2.5%/month, lifetime is short — retention features (My Designs, reprint reminders) raise LTV more cheaply than chasing new logos. **Measure CAC per channel**, never blended (blending hides that referral is profitable while paid may be underwater).
- The product's **premium-polish/UX-first standard is itself a CAC lever**: a tool that "just works" for non-technical owners generates the word-of-mouth that keeps CAC near zero.

**What to build:** instrument margin-adjusted LTV, fully-loaded CAC, per-channel CAC, and CAC payback as internal admin metrics (see §8). None of this is currently computed.

---

## 4. Referral / Word-of-Mouth Program

### Research-backed principles

**Two-sided rewards are now the standard.** Dual rewards lift participation **40–85%** and sharing ~41%; **~86% of programs are two-sided**. Reward both — the referrer needs a reason to share, the new shop a reason to act _(Rivo / Viral Loops / Cello)_.

**In-ecosystem rewards (credit, free months) beat cash for B2B.** Non-cash incentives lift referral success ~24% over cash, keep value in-product, and avoid the awkwardness that the referrer often isn't the bill-payer _(Viral Loops / BHN / Lenny Rachitsky)_.

**Ask at the verified "aha"/success moment, not at signup — and ask everywhere.** Trigger right after a win (first order shipped, NPS 9–10); asking 3–5 days after a success converts ~20% better. Lenny's rule: "pitch referrals everywhere" _(ReferralCandy / Tremendous / Lenny)_.

**Canonical cases — borrow principles, not mechanics.** Dropbox: two-sided product-credit (free storage) → **+3,900% in 15 months, K-factor 1.5–2.0** (but had built-in shared-folder virality we lack). PayPal: $10/$10 cash → viral but **~$70M burn** (inspiration for generosity, not the cash mechanic). Morning Brew: milestones + **private peer channels (SMS/WhatsApp) pulled 10x LinkedIn, 5x Twitter** signups at **$0.25 CPA** vs $3–5 on Meta _(Viral Loops / ReferralCandy)_.

**Real B2B SaaS programs post strong numbers.** Moss: referrals = 50% lower CAC; Plancraft: 47% free-to-paid, 5.7x ROI; Typeform: lowest-CAC channel; VEED: −90.4% CAC vs paid; HubSpot: +50% leads, +20% retention _(Cello)_.

**Referred customers are higher quality.** ~**16% higher LTV**, ~18% higher retention, **4x more likely to refer** others; B2B sees ~25% shorter sales cycle _(Wharton / impact.com / Cello)_.

**Build fraud prevention + clean attribution from day one.** Unique per-customer code/link (+ QR for in-person); **two-step tracking** (attribute on signup, **pay only on the referred shop's first paid invoice**); block self-referral via email matching + IP/device fingerprinting; flag existing customers as non-referable; cap redemptions _(SaaSquatch / Voucherify / Extole)_.

**In niche verticals, community + word-of-mouth structurally beats paid ads.** ~81% ignore ads, only ~11% fully trust them; communities cut CAC ~32% and members convert faster. Private peer channels carry the recommendation an ad never can _(Mention Me / community-led-growth research)_.

| Metric | Value | Source |
|---|---|---|
| Software-category referral conversion | ~7.86% | **Rivo** (not ReferralCandy — attribution corrected) |
| B2B SaaS referral conversion (planning floor) | ~3.63% avg; 8%+ leaders | Influitive |
| Participation rate | 5–15% of active customers initiate | Cello / Rivo |
| Two-sided reward uplift | +40–85% participation | Rivo / Viral Loops |
| Recommended reward value | 10–20% of first-year revenue | Cello |
| Referral share of growth (when it works) | 15–50% | Lenny |
| CAC reduction from referrals | 40–60% lower (up to −90%) | Cello |
| Referred LTV / retention lift | +16% LTV, +18–37% retention | Wharton |

> ⚠️ **Fact-check notes:** the 7.86% figure is **Rivo's**, not "ReferralCandy 2026" — fix attribution. Referral-conversion definitions vary wildly by denominator, so always state **which step** you're measuring.

### For Print-Flow-360

This is our highest-leverage acquisition channel — a tight, peer-trusting trade is ideal for referrals over ads.

- **Reward in product currency, two-sided:** "1 free month" / account credit to **both** the referring shop and the new shop. Non-technical owners grasp "get a free month" instantly; it costs near-zero marginal dollars and reinforces retention.
- **Trigger at a real success moment** the platform already knows — after a shop ships its Nth completed order, scores a glowing in-app NPS, or finishes onboarding. Surface it as a plain-language banner: *"You're getting a lot done with Print-Flow — know another shop owner who'd love this? Give them a free month, get one yourself."* Follow §0 UX rules (plain labels, immediate "Reward applied" feedback, no jargon).
- **Two-step attribution + fraud guards:** pay only on the referred shop's **first paid invoice**. Multi-tenant context makes **self-referral across tenants** a real risk — block existing customers from being "referred", match emails (including variations), fingerprint device/IP, cap redemptions, monitor failed redemptions.
- **Both a shareable code and a QR code** — owners meet face-to-face at trade shows, supplier events, and print associations. The Morning Brew lesson (private peer channels outconvert public broadcast 5–10x) maps directly onto this community.
- **Pair with a light community motion** (owner peer group, shared wins). Don't expect referrals to rescue weak PMF — they *amplify* existing word-of-mouth, they don't manufacture it.

**What already exists:** **Nothing — this is greenfield.** No referral, affiliate, invite-a-friend, loyalty, points, or rewards model anywhere (grep matches were false positives like pricing-formula vars). But `CouponService` exists (a natural rail for issuing credit), and the notification + email infra can deliver the asks.

**What to build:** `Referral` model (referrer tenant, referred tenant, code/link, status, reward), reward issuance via credit/free-month, fraud guards, in-app trigger at the aha moment, code + QR sharing, and a plain-language referral dashboard. Reward sizing ~**10–20% of first-year revenue** (a free month fits this).

---

## 5. Social Proof / Case Studies / Testimonials

### Research-backed principles

**Peer proof is the most trusted input.** Nielsen: **92% trust recommendations from friends/family above all advertising**; online reviews #2 at ~70%.

> ⚠️ **Fact-check:** This is **Nielsen 2012** (dated) and the exact scope is "above all *advertising*", not "all information sources." Directionally still true; cite with the date.

**B2B software buyers rely on third-party reviews and distrust vendors.** **86% rely on third-party reviews** to decide _(G2 2021 Buyer Behavior, via Demand Gen Report)_.

> ⚠️ **Fact-check:** Date it **2021**. The companion "4%" refers specifically to trust in info from **sales reps *or* research firms** — narrower than the flattened "only 4% trust sales reps."

**Specific, named testimonials lift conversion.** WikiJob added detailed (not generic) testimonials → **+34% conversions** (VWO). Named/titled testimonials ~double the effect of anonymous quotes; placement near the CTA is highest-impact _(VWO / Genesys Growth — one strong case study, treat as illustrative)_.

**Video testimonials — strong but variable.**

> ⚠️ **Fact-check verdict (DISPUTED):** The "+80%" is over-cited and partly debunked — **Unbounce's own data shows video often *doesn't* help (or hurts)**. Frame as "varies, sometimes 30–80%, sometimes negative", never quote +80% as expected. Still, a phone-shot shop video reads as a peer endorsement.

**Volume and recency matter.** Products with **5+ reviews are 270% more likely** to be purchased than zero-review ones; **66%** find reviews <3 months old "very valuable" (dropping to 45% at 3–6 months) — so collection must be **continuous** _(RepVigil / G2)_.

**Credible case study = named shop + specific outcome + before/after.** Challenge → solution → results, anchored by quantifiable metrics and a real customer quote; data *and* human story both required _(Salesforce / Testimonial.to)_.

**Responding to reviews is itself a trust lever.** 88% would use a business that replies to all reviews vs 47% that never responds; 56% say a thoughtful reply to a negative review improved their perception _(BrightLocal LCRS 2024)_.

**Collect via an NPS-to-review loop at a value moment.** Ask 1–2 weeks post-onboarding / after a milestone (never within 24h); route promoters (9–10) into a review/referral ask; space asks ~3 months _(AskNicely / SurveyMonkey)_.

**Trust signals on the pricing page convert** (high-anxiety zone): client logos, counts, ROI quotes. One A/B test placing a case-study ROI quote on a pricing page lifted sign-ups **+22%**; site-wide trustmarks lifted revenue +21.3% _(Prismfly / SmartBug)_.

| Metric | Value | Source |
|---|---|---|
| Trust peer recs above all advertising | 92% (Nielsen **2012**, dated) | Nielsen |
| B2B buyers relying on third-party reviews | 86% (G2 **2021**) | Demand Gen / G2 |
| Purchase-likelihood, 5+ reviews vs zero | +270% | RepVigil / G2 |
| Lift from specific named testimonials | +34% (illustrative case) | VWO / WikiJob |
| Video testimonial lift | varies (30–80%, sometimes negative) | corrected |
| Reviews <3 months "very valuable" | 66% (45% at 3–6 mo) | G2 |
| Would use a biz replying to all reviews | 88% vs 47% | BrightLocal 2024 |
| Pricing-page ROI-quote lift | +22% sign-ups | SmartBug |

### For Print-Flow-360

Print-shop owners distrust software pitches and rely on what peers in their trade already trust.

- **Build named, metric-rich case studies of REAL shops** — *"Smith Signs cut quote turnaround from 2 days to 10 minutes and grew online orders 30%"* — with owner photo, shop name, and a short phone-shot video. These read as peer endorsement and beat abstract feature claims.
- **Prioritize Capterra** (where SMB owners shop for software) over G2 (enterprise-skewed). Getting past the **zero-review threshold** (5+ reviews → +270% selection) is the first goal.
- **Put plain-language trust signals on the pricing/landing page** — a customer count ("Trusted by 400+ print shops" — only when *true* and verifiable), a star rating, recognizable shop logos (with permission). Pricing is the highest-anxiety moment for a cost-conscious owner.
- **Systematize collection in-product:** trigger an in-app NPS prompt after a real value moment (first order fulfilled, first month live — **not at signup**), auto-route promoters into a one-click review/referral ask, keep it continuous (reviews decay after ~3 months).
- **Respond to every review** in plain language. Keep all proof **concrete, attributed, recent, human** — generic/anonymous testimonials read as fake to this audience and backfire.

**What already exists:** Storefront-shopper product reviews only — `ProductReview`, `ProductReviewHelpfulVote`, `app/Services/Storefront/Review/`. **No SaaS-level** testimonial/case-study model and no aggregate social-proof surfacing.

**What to build:** an in-app NPS prompt (gated to a value milestone) feeding a promoter → review/referral loop; a SaaS testimonial/case-study content model + surfacing on the marketing pricing/landing pages; trust-signal components (count, rating, logos). Reuse the notification/email infra to time the ask.

---

## 6. Email Lifecycle Marketing

### Research-backed principles

**Triggered (behavioral) emails convert ~10x better than batch.** ~**5.9% vs 0.6%** conversion; **~14.3% vs 2.6% CTR**; $0.95 vs $0.17 revenue/send. Lifecycle should be **event-driven** (signup, first key action, inactivity, usage-limit, payment-fail), not a campaign calendar _(DesignRush / Blueshift)_.

**Onboarding welcome sequences: 4–7 emails over 7–14 days, one goal each.** ~42% avg open (first email 50–70%), 20–40% CTR; each later email drops ~3–5% opens; non-engagers within 72h carry ~90% churn probability _(Userpilot / DigitalApplied)_.

**Activation (~37% median) is the metric onboarding email targets** — where 40–60% of early churn originates; "good" is 40–60% _(Userpilot / Lenny's — supported)_.

**For a 14-day trial, send 6–8 emails on a value → confidence → urgency arc** (days ~1, 3, 7, 10, 13, 14). Users completing a core action in the first 2 days are ~3x more likely to convert; best B2B window Tue–Thu 10am–2pm local _(Sequenzy / FluentCRM)_.

**Trial *design* drives conversion more than copy:** opt-out (card) ~44% median vs opt-in (no card) ~14%. Email matters most for opt-in trials where the user must take an explicit upgrade action _(First Page Sage / Shno)_.

**Dunning is the fastest involuntary-churn win.** 20–40% of churn is involuntary; up to 4 recovery emails timed alongside retries (retries 1–4 in ~10–12 days), plus persistent in-app "past due" prompts.

> ⚠️ **Fact-check verdict (DISPUTED):** The "50%+ / 70–85% recovery" figures are vendor-optimistic ceilings — **plan against ~40–60%**. Recovery emails must be **plain ("Your card on file was declined — update it here")**, never expose decline codes.

**Win-back recovers a meaningful dormant slice and is widely neglected.** Re-engagement emails ~12% open, recover ~5–15% of inactive subscribers; win-back sequences reactivate 10–20% of dormant users; ~63% of brands never run one. Segment by inactivity depth _(Userpilot / Baremetrics)_.

**Expansion/adoption emails should be usage-triggered**, linking a feature to a paid upgrade (approaching limits, team growth, power-user behavior). Triggered/automated >> broadcast _(Ninjapromo / Userpilot / Litmus)_.

**Tooling:** account-level + Stripe-event-driven platforms (Userlist / Customer.io) fit a multi-tenant model where billing owner, store admin, and staff need different messages; Intercom when onboarding spans email+in-app+support _(Sequenzy / Userlist)_.

| Metric | Value | Source |
|---|---|---|
| Triggered vs batch conversion | 5.9% vs 0.6% | DesignRush / Blueshift |
| Onboarding open / CTR | ~42% (first 50–70%) / 20–40% | Userpilot |
| Median activation rate | ~37% (good = 40–60%) | Userpilot |
| Opt-in vs opt-out trial conversion | ~14% vs ~44% | First Page Sage |
| Involuntary share of churn | 20–40% | ProfitWell / Paddle |
| Failed-payment recovery (realistic) | **~40–60%** | corrected |
| Win-back reactivation | 10–20% of dormant | Baremetrics |
| Brands with no win-back | ~63% | Userpilot |

> ⚠️ **Apple MPP** inflates open rates — optimize on **clicks, in-product activation, and conversion**, not opens.

### For Print-Flow-360

Lifecycle email is doubly important here because non-technical owners don't read docs and won't self-onboard — triggered emails must do the activation work.

- **Onboarding:** trigger off milestones an owner understands — *"add your first product", "set up a price", "publish your storefront", "take your first order"* — one plain goal per email, with **first published storefront / first order as the activation north-star**. Front-load the most important push into emails 1–2 (the 72h window).
- **Trial:** if opt-in/no-card (likely for SMB), the **value → confidence → urgency** 6–8 email arc is essential (median opt-in ~14%). Use shop-relevant proof ("how other print shops sell more online") over generic SaaS copy.
- **Dunning first (highest ROI):** plain language only — *"Your card on file was declined — update it here to keep your store online"*, reserve UI space, link straight to the billing/payment-method page. Matches §0 "never surface raw technical output" + "guide the user when an integration is unconfigured." Plan for ~40–60% recovery.
- **Expansion/adoption:** fire off natural signals (approaching plan limits, adding staff, high order volume), framed around solving a bigger problem the shop already feels — not "buy more."
- **Account-aware:** billing owner, store admin, and staff may need different messages (a reason account-level tooling fits our multi-tenant model).

**What already exists (strong infra):** Campaign side — `EmailCampaign`, `EmailCampaignRecipient`, `EmailCampaignTemplate`, `Campaign`, `EmailLog`, `CampaignService`, `EmailService`, `app/Services/EmailCampaign/`. Templating — `EmailTemplate` + `EmailTemplateResolverService`/`EmailTemplateService`. Notifications — full spine listed in §2, plus `NewsletterSubscriber`.

**What's missing:** **automated lifecycle/drip sequences** — trial Day-N nudges, win-back, dunning recovery, renewal reminders, reprint reminders. Today campaigns are **manual broadcast**, not triggered journeys. The build is a **triggered-sequence engine** layered on the existing template + notification system, fired by product and billing events (not a calendar).

---

## 7. Phased Roadmap

Tie everything to the existing subscription, email-campaign, and notification infrastructure. Build the cheapest, highest-ROI churn/retention wins first; greenfield growth (referrals) next; polish last.

| Phase | Build | Why first / leverage | Leans on existing | Status |
|---|---|---|---|---|
| **0 — Instrument** | Activation event + funnel; margin-adjusted LTV, fully-loaded + per-channel CAC, CAC payback, NRR, logo+revenue churn (see §8) | Can't manage what you don't measure; everything below targets these | New admin metrics layer | TBD |
| **1 — Dunning / failed-payment recovery** | Retry schedule + 3–4 plain-language recovery emails + in-app "past due" prompt | 20–40% of churn is involuntary; ~40–60% recoverable; cheapest revenue | `Subscription` `charge_failed`, `PaymentWebhookEvent`, `BillingService`, `CustomerNotificationService`, `EmailTemplate` | TBD |
| **2 — Onboarding-to-activation** | Guided wizard ending in live storefront + first product; triggered onboarding email sequence (one goal each) | 60–70% of churn decided in first 90 days; activation 2x retention | Notification spine + `EmailTemplate`; existing storefront/product flows | TBD |
| **3 — Lifecycle sequence engine** | Triggered (event-driven) sequences: trial Day-3/7/13, renewal reminders, win-back, adoption/expansion nudges | Triggered email ~10x batch; replaces manual broadcast | `CampaignService` + `EmailTemplateResolverService` + notification events | TBD |
| **4 — Plan tiers + enforcement + annual** | Structured Good-Better-Best, quota/feature gating, plan-tier enforcement, annual interval (16.7% off), self-serve up/downgrade, reverse-trial fallback | Packaging is the conversion lever; annual lock-in fights SMB churn | `Plan`, `Subscription`, `SubscriptionPlanChange`, `BillingSettings` | TBD |
| **5 — Referral program** | `Referral` model, two-sided product-credit reward, aha-moment trigger, two-step attribution, fraud guards, code + QR, dashboard | Lowest-CAC, highest-quality channel for a peer-trusting vertical | `CouponService` (credit rail), notification + email infra | Greenfield |
| **6 — Social proof loop** | In-app NPS at value milestone → promoter → review/referral; SaaS case-study/testimonial model; pricing-page trust signals | Skeptical SMB buyers convert on peer proof | Notification timing; new content model | Greenfield |
| **7 — Churn health score + save plays** | 0–100 score from login recency / published-product / orders-30d / last-edit; signal-matched save plays | Surfaces risk 60–90 days early; +28% save rate when matched | Behavioral data + notification triggers | TBD |

---

## 8. Metrics to Instrument

> All targets are **directional starting points** — instrument first, then calibrate to our own cohorts. Benchmark to **SMB**, not enterprise.

| Metric | Definition | Target (starting) | Notes |
|---|---|---|---|
| **Activation rate** | % of signups hitting the aha event (e.g. first published storefront / first order) | 40–60% ("good"); ≥37% median floor | The single leading retention predictor; ~1% gain ≈ ~2% lower churn |
| **Time-to-value** | Median time signup → activation event | First **session**; hard cap <14 days | <14 days → ~80% 12-mo retention |
| **Monthly logo churn** | Cancelled shops / active shops | <3%/mo (SMB top-quartile <2%) | Report *with* revenue churn |
| **Net Revenue Retention (NRR)** | Existing-base revenue a year later incl. expansion − churn | ≥97% (SMB-healthy); stretch 100%+ | Don't chase 120% at low ARPA |
| **Involuntary churn %** | Failed-payment cancels / total cancels | Track + minimize | Should be 20–40% before dunning; drive down after |
| **Dunning recovery rate** | Recovered failed payments / total failed | **40–60%** (realistic) | NOT 60–80%; plan conservative |
| **Trial-to-paid conversion** | Paid / trials started | ~14–18% opt-in; ~44% opt-out | Split by trial type |
| **Margin-adjusted LTV** | (ARPA × GM%) / monthly churn | — | Subtract PDF/S3/infra COGS first |
| **Fully-loaded CAC (per channel)** | All S&M / new customers, by channel | Blended <$900 | Never report blended-only |
| **LTV:CAC** | margin-adjusted LTV / CAC | ≥3:1 directional (stage-adjusted) | <3 unhealthy; >5 may = underinvesting |
| **CAC payback** | CAC / (ARPA × GM%) | **8–12 months** (SMB) | <12mo aspirational; 18–20mo is industry median |
| **Referral participation** | % active shops initiating ≥1 referral | 5–15% | |
| **Referral conversion** | Referred shops paid / invites (state the step) | ~3.6% floor → 8% stretch | Definitions vary by denominator |
| **Referral share of new growth** | New shops from referral / all new | 20–30% when it works | Lowest-CAC channel goal |
| **NPS** | Standard 0–10 | Track promoters → review/referral loop | Gate ask to value moment |
| **Onboarding email open/CTR** | Triggered-sequence engagement | ~42% open / 20–40% CTR | Optimize on **clicks**, not opens (Apple MPP) |
| **Win-back reactivation** | Reactivated / dormant targeted | 10–20% | Segment by inactivity depth |
| **Churn health score coverage** | % active shops scored + flagged early | 100% scored; flag 60–90d early | Attach a matched save play, not a spreadsheet |

---

### Closing note

The throughline: **for a low-ACV vertical SaaS sold to non-technical, peer-trusting print-shop owners, growth is won on retention and word-of-mouth, not paid acquisition.** Our biggest assets are an existing billing/subscription spine and a mature email/notification system; our biggest gaps are *triggered lifecycle journeys*, *dunning*, *a referral program*, and *SaaS-level social proof*. Build dunning + activation first (cheapest churn wins), then the lifecycle engine, then referrals and social proof to compound the word-of-mouth this vertical runs on. Every owner-facing surface must clear the §0 UX bar — plain language, no raw technical output, proper loading/empty/error states — or the strategy fails on contact with a real shopkeeper.
