# Product-Led Growth & Virality Strategy - Print-Flow-360

> **Provenance.** Synthesized 2026-06-16 from a 5-stream multi-agent research workflow (PLG/self-serve, viral loops & network effects, activation/aha engineering, growth-experiment discipline, freemium economics), each independently grounded in the actual codebase. Benchmarks are flagged by confidence (`solid` / `directional` / `vendor-blog/weak`). **Treat every external number as a hypothesis to test against our own funnel, not a forecast** - most of the "reverse trial converts ~24%" and "branding loop k-factor" figures are vendor-sourced and self-reported. This doc *builds on* the existing GTM research in `readme/` (cross-referenced in its own section); it does not restate it.

---

## Executive Summary

Print-Flow-360 is a textbook **product-led-growth** candidate - low ACV ($99–$199/mo), a one-person buying committee (Maria the print-shop owner), and a product whose value is self-evident the moment a store goes live and an order lands. The good news: roughly 80% of the PLG machinery already exists in the code (a Plan/Subscription spine with JSON feature flags, `PlanLimitsService` enforcing per-tenant caps, a `usePlanLimits` composable that already returns plain-English upgrade reasons, and a `SetupChecklist` that tracks the exact activation signals a product-qualified-lead needs). The bad news: none of it is wired into a growth *motion*. Activation lives in `localStorage` and stops at "preview your store" - it never reaches the actual aha (a real order). Plan limits **fail open** when no plan is present and fire as hard blocks rather than contextual upsells. There is no funnel instrumentation, no trial countdown, no PQL signal, and zero "Powered by Print-Flow-360" attribution on the most-trafficked surfaces a web-to-print tool could dream of.

Four opinionated conclusions cut across all five streams:

1. **Reverse trial, not freemium.** Start every signup on the top (Pro) plan for 14 days. Freemium converts at ~2–5%; a no-card reverse trial converts ~18–32% (directional) for this profile - and a *permanent open free tier is actively wrong here* because every live store costs real per-tenant infra (hosting + S3 + PDF compute) with no compensating viral upside.
2. **The post-trial fallback is a *dormant/parking* tier, not a usable free product.** Keep the owner's designs, catalog, and pricing rules alive and editable (the habit/lock-in layer), but take the public storefront **offline** (no hosting cost, can't cannibalize the cheapest paid plan). The paid fence is the *live, order-taking, publicly-hosted storefront* - the one thing a shop owner actually pays to get.
3. **Instrument the funnel before optimizing anything.** We literally cannot measure activation today. This is the #1 unblocker for the PQL, the reverse-trial card-capture, *and* any experiment program.
4. **Ship the "Powered by Print-Flow-360" attribution loop now** - it's the highest-volume, lowest-effort growth surface we have, and it's currently 0% built. But be honest with stakeholders: it is **sub-viral amplification (k ≈ 0.15–0.4), not a self-sustaining engine**, and it is not a network effect.

---

## TL;DR - Highest-Leverage Moves (ordered by impact ÷ effort)

| # | Move | Effort | Impact | One-line why |
|---|------|--------|--------|--------------|
| 1 | **Ship "Powered by Print-Flow-360 · Build your own store →"** on every tenant storefront footer | S | High | Free impressions on the highest-traffic surface we own; zero owner behavior change |
| 2 | **Add a `remove_branding`/`white_label` flag to the Plan features JSON** and gate footer + proof page + exports on it | S | High | One flag monetizes the loop *and* gives the clearest plain-language upgrade reason ("remove the badge") |
| 3 | **Reframe pre-seeded defaults as "You can already take orders"** on the dashboard | S | High | Offline payment + sample catalog + shipping are *already seeded*; surfacing it compresses time-to-value to minutes |
| 4 | **Convert to a no-card 14-day reverse trial on the Pro plan** | M | High | ~24% _(directional)_ vs ~4.5% freemium _(solid)_; status enum already supports trial→active |
| 5 | **Instrument the activation funnel server-side** (signup → product → publish → first-order events + persisted milestones) | M | High | Nothing else can be optimized until this is measured; unblocks PQL, card-capture, experiments |
| 6 | **Extend the checklist to the real aha**: add "place a test order" + a first-real-order celebration | M | High | Today the checklist ends at "preview" - owners never reach the value moment that predicts retention |
| 7 | **Turn hard plan-limit blocks into contextual "value-then-fence" paywalls** rendered at the point of friction | M | High | The block UX reads as "broken" (violates §0); make it explain value + offer a path |
| 8 | **Build the dormant/parking tier** (data alive, storefront offline) as the reverse-trial fallback | L | High | Cannibalization fence + cost-to-serve fix in one move; replaces the dead-end `no-plan.vue` lockout |
| 9 | **Fix the fail-open hole**: free/dormant tier must be a real Plan row with explicit caps, never the absence of a plan | M | High | `PlanLimitsService` returns `allowed=true` with no plan - a naive free tier would be silently unlimited |
| 10 | **Wire the PQL card-capture trigger** to fire on `first_order_received`, not on trial day-N | S | High | Behavioral triggers convert ~2.5× calendar triggers _(directional)_; willingness-to-pay peaks at the aha. **Depends on landlord-side subscription billing + card-on-file actually working - see §9** |
| 11 | **Run a 30-min weekly growth meeting off an ICE backlog**; default to fake-door/qualitative, reserve true A/B for landing + pricing only | S | High | We're too low-traffic for classic A/B; velocity of cheap experiments is the real lever |
| 12 | **Add a thin product-led-sales assist gated on the PQL** - an in-app "book 15 min", no SDR team | M | Med | Captures the ~20–30% high-intent accounts without inverting the unit economics of a $99–199 tool |

---

## 1. Product-Led Growth (PLG) & the Self-Serve Motion

### Frameworks

| Framework | What it says | How it applies to us |
|-----------|-------------|---------------------|
| **PLG flywheel + PQL** (Wes Bush) | Product is the primary acquisition/conversion/expansion vehicle; a PQL is a user who *experienced value in-product*, not a form-fill | Define the PQL as **"storefront live + first real customer order within 14 days."** The existing `SetupChecklist` already operationalizes the activation half |
| **Activation vs PQL** (OpenView) | Activation = reached core value; PQL = showed buying intent. Track them as *separate* events | Activation = checklist 100% (store previewable). PQL = activation **plus** a real order. Today neither is captured as an event |
| **Reverse trial** (Verna/Poyar) | Start on the full paid tier, time-boxed; at expiry convert or downgrade to a constrained free state | We already seed `trial_days:14`. Make the trial start on **Pro** so owners build habits with white-label/custom-domain, then convert or downgrade |
| **Value vs fence gating** (Poyar/OpenView) | Value gates cap *how much* core value you get (scale with success); fences lock peripheral features | `max_products/max_stores/max_users` are value gates; `white_label/custom_domain/api_access` are fences. Free keeps the core loop open, fences the growth features |
| **PLG growth loops** (Reforge) | Self-reinforcing in-product loops (content/collaboration/integration) replace the linear funnel | Our two-level structure creates a *content loop*: every storefront carries a "Powered by" link. Removing branding is both fence and loop fuel |
| **Product-led sales / PQL handoff** (ProductLed) | Layer light sales only above an intent threshold; pure self-serve breaks down >~$30K ACV | At $99–199, **do not build an SDR team**. Add a thin "talk to us" assist triggered only by the PQL |

### Benchmarks

| Metric | Value | Confidence |
|--------|-------|-----------|
| Freemium free-to-paid (median) | ~4.5% (2–8%) | solid |
| Opt-in no-card trial conversion (median) | ~14% (8–22%) | solid |
| Reverse-trial conversion (SMB self-serve) | ~24% (18–32%) | directional |
| Card-required / opt-out trial conversion | ~44% (35–60%) | solid |
| Best-in-class PLG activation rate | ~33% (band 20–40%) | solid |
| Median NRR (SMB segment, ChartMogul 2024) | ~108% | solid |
| Uplift in odds of fast growth from tracking PQLs | +61% | vendor-blog/weak |
| ACV where pure self-serve breaks down | >~$30K | directional |

### What this means for Print-Flow-360

The plumbing is largely built and just needs connecting:

- **`app/Models/Plan.php` + `app/Models/Subscription.php`** - JSON `features` column, status enum `{active, trial, expired, charge_failed, cancelled}`, `trial_ends_at` logic. A reverse trial needs **no schema change** to the status model.
- **`app/Services/Subscription/PlanLimitsService.php`** - enforces `max_products/max_users/max_stores` server-side, returns plain-language messages, `-1 = unlimited`. Already wired into `ProductController`, `UserController`, `StoreController`. **Critical flaw: it fails *open* when no plan is found** (returns `allowed=true`).
- **`nuxt/app/composables/usePlanLimits.ts`** - the client mirror (`canUseFeature`, `checkProductLimit`, `isTrial`, `isExpired`, `hasNoplan`, a `FEATURE_LABELS` map). It computes reasons but **nothing renders an upgrade CTA** - this is the natural hook for contextual paywalls.
- **`database/seeders/PlanSeeder.php`** - already a Good-Better-Best ladder: Starter $99, Pro $199 (+ white_label/custom_domain/remove_branding/themes/api/priority_support), Enterprise $0/`is_contact_us:true`. **There is NO permanently-free tier** - required as the reverse-trial downgrade target.
- **`nuxt/app/components/dashboard/SetupChecklist.vue`** - tracks logo, payment gateway, first product, shipping, storefront preview. The activation event source; missing only a "first order" step and any analytics emission.
- **`nuxt/app/layouts/no-plan.vue`** - the hard lockout surface. This is the dead-end a reverse-trial *downgrade* should replace.

**Missing:** PQL event capture/scoring, in-app trial countdown, contextual paywall component, a free Plan row, a "first order" activation signal, and any sales-assist trigger.

### Recommendations

| Move | Effort | Impact | Why |
|------|--------|--------|-----|
| Convert to a reverse trial: start every signup on Pro for 14 days, downgrade (not lock out) at expiry | M | High | Highest-converting model for this profile; replace the `no-plan.vue` dead-end with a downgrade so an activated-but-unpaid owner keeps a live store and a reason to return |
| Define + instrument the PQL: "store live + first real order within 14 days" | M | High | The most predictive intent signal - it means *their* customers are transacting. The only honest trigger for any sales assist |
| Turn hard limit-blocks into contextual "value-then-fence" paywalls at the point of friction | M | High | Build one reusable component - **new `nuxt/app/components/billing/UpgradePrompt.vue`** - fed by `usePlanLimits` reasons, rendered inline at each call site that today throws a hard block (`ProductController`/`UserController`/`StoreController` consumers). Value gates soft-warn near the cap; fences show a one-line benefit + Upgrade link. Matches the §0 amber-banner pattern |
| Add a persistent, non-nagging trial-state strip in the admin shell + Action Center | S | High | "X days left on your Pro trial - what you'll keep / what you'll lose." Render in the **admin layout shell** (the default authenticated layout that wraps the dashboard, alongside where `no-plan.vue` is swapped in) so it shows on every page, plus an Action Center widget. Plain-language loss-framing for Maria |
| Keep "Powered by Print-Flow-360" ON for free/trial tiers deliberately | S | Med | Fuels the content loop *and* creates a genuine upgrade reason. Don't give branding removal away free |
| Add a thin product-led-sales assist gated on the PQL - no SDR team | M | Med | Capture the ~20–30% high-intent accounts with an in-app "book 15 min"; route multi-store interest to the seeded Enterprise tier |
| Instrument activation rate + time-to-value as first-class metrics off the checklist | S | Med | Leading indicators of the whole funnel; ties to the North Star already chosen in `CONVERSION_FUNNEL_RESEARCH` |

### Risks

- **Hard-gating a non-technical owner mid-task reads as "broken," not "upsell"** - violates §0's "never leave a dead UI." Paywalls must explain value + offer a path.
- **A reverse trial backfires if the downgrade tier is too generous** (no urgency, cannibalizes paid) **or too stingy** (owner loses their live store and leaves angry). Keep the store-data alive but fence the growth features.
- **A PQL on a vanity signal** ("logged in 3×") over-counts and wastes sales budget - the only honest PQL is a real order, which depends on the *still-incomplete production spine* working end-to-end (QUEUE=sync, partial fulfillment, carrier/tracking).
- **Any sales motion below ~$30K ACV usually loses money** - resist staffing SDRs off PQLs.
- **Free-tier abuse/cost** - free stores still consume storage, PDF compute, and S3. Tie limits to `PlanLimitsService`.

---

## 2. Viral Loops & Network Effects (beyond referral programs)

### Frameworks

| Framework | What it says | How it applies to us |
|-----------|-------------|---------------------|
| **Viral coefficient (k) & cycle time** | k = invites × conversion-per-invite; k>1 = self-sustaining | Honest denominator is *shop owners*, not end-customers. Inherent k among shops ≈ 0; the customer-of-customer path gives a realistic k ≈ **0.15–0.4**. Target sub-viral amplification, not virality |
| **Three loop types** (inherent / referral / word-of-mouth) | Inherent virality exposes others as a byproduct (Hotmail footer); cheaper than referral, no behavior change | The referral program is specced elsewhere (greenfield). **This research owns the inherent-virality layer - currently 0% built** |
| **NFX network-effects taxonomy** | Distinguishes true network effects from one-way distribution loops | We have **no genuine network effect today**: one shop joining doesn't make us more valuable to another. A cross-tenant *template marketplace* would be the first real one |
| **Powered-by attribution loop** (Hotmail/Shopify/Calendly) | Embed a clickable brand signal in user-facing output; pair with upgrade-to-remove | Directly actionable and 0% present. Closest analog: Shopify's footer ↔ our branded storefronts; Calendly's booking page ↔ our public proof-review page |
| **Customer-of-customer as a channel** | In two-level structures the customer's customers are a built-in free audience | Every print shop's end-customer is a free impression. Realistic target isn't "shopper becomes shop owner" but "business-minded viewer notices us" - concentrate on the proof page + invoices |

### Benchmarks

| Metric | Value | Confidence |
|--------|-------|-----------|
| Average k-factor, B2B SaaS | ~0.2 (0.3–0.7 = strong) | directional |
| Share of B2B SaaS reaching k>1 | Vanishingly rare (needs collaboration to be foundational) | directional |
| **Realistic k for our attribution loops** | **~0.15–0.4 (sub-viral)** | directional |
| Referral CAC vs others (from PRICING_RETENTION doc) | referral ~$150, inbound ~$200, SEO $480–942, paid search ~$802 | solid |
| Best-in-class referral share of new customers | 20–30% | solid |
| Dropbox K-factor (had built-in shared-folder virality we lack) | 1.5–2.0 | vendor-blog/weak |
| SMB self-serve monthly churn | 3–5%/mo | solid |

### What this means for Print-Flow-360

The verified state of play is stark: **zero "Powered by" attribution anywhere customer-facing.** A grep across `frontstore/`, `designer/src`, and `nuxt/` found only build artifacts.

- **`StorefrontFooterDynamic.vue`** - fully tenant-controlled, no platform-owned slot. The prime Shopify-analog surface; needs a non-removable-by-default platform footer line below tenant content.
- **`app/Mail/Proof/ApprovalMail.php`** - the proof link (`/proofs/client-review/{id}`) is a **public, guest-accessible page sent to every end-customer**. A business-context viewer (someone reviewing a print job) is a far better prospect than a random shopper. Zero attribution today.
- **`designer/src/components/FileExport/*`** - exports (PDF/SVG/PNG) carry no watermark; shared designs leave the platform invisibly (a wasted Canva-style loop).
- **`app/Services/ProofService.php`** - stamps the *tenant* logo on proof PDFs (confirming it's a branding surface), but never Print-Flow-360.
- **Internal-only "network effects":** `max_stores:3` and B2B multi-location create *within-account* lock-in but do not cross tenants. The "My Designs" library (`frontstore/app/pages/profile/designs.vue`) is a retention surface, not a shareable template gallery.

### Recommendations

| Move | Effort | Impact | Why |
|------|--------|--------|-----|
| Ship "Powered by Print-Flow-360 · Build your own store →" on every storefront footer | S | High | Highest-volume, lowest-friction surface; UTM-tagged, off only when `remove_branding=true`. **Render it as a platform-owned line *below* `StorefrontFooterDynamic.vue`'s tenant markup - not inside it - with its styles scoped/inlined so per-theme CSS can't hide or restyle it** (the codebase has a known pattern of theme `!important` rules hijacking shared components; see the Aurora-sweep memory). Verify the badge survives all three themes at 375px |
| Brand the public proof-review page + proof/order/invoice emails | S | Med | Reaches a business-context viewer; reuses existing email infra. Keep it a single subtle line, never a banner |
| Add an optional small platform credit to designer exports, removable on paid plans | M | Med | Turns shared designs into impressions; removal becomes an upgrade trigger |
| Wire `remove_branding`/`white_label` into the Plan features JSON; gate all three surfaces on it | S | High | One flag monetizes the loop *and* is the exact Shopify/Wix "remove the badge" upgrade playbook |
| Build a cross-tenant shared template gallery/marketplace (longer-term) | L | High | The **only** genuine network-effect play; start curated to avoid cold-start, then open contribution |
| Track attributed signups per surface; report a per-surface k, never a blended viral number | S | Med | UTM-tag footer vs proof vs export distinctly; set internal expectation of k ≈ 0.15–0.4 |

### Risks

- **Conflating distribution loops with network effects is dishonest** - only the template marketplace creates a real moat. Don't pitch "k>1" for the attribution loops.
- **Branding annoys owners who want their store to look like *their* brand** - must be tasteful, small, removable via upgrade, and *never* injected into checkout/cart trust moments.
- **Customer-of-customer conversion is structurally weak** - it's amplification, not a channel. Don't let it starve the proven founder-led/community + BOFU-SEO motion.
- **Template marketplace cold-start + IP/moderation risk** - an empty gallery violates §0; seed curated content and add review before opening contribution.
- **Per CLAUDE.md, the `remove_branding` flag needs a round-trip test** or it joins the silent-lie class (owner toggles white-label, nothing happens).

---

## 3. Activation & Aha-Moment Engineering ("store live + first order in 7 days")

### Frameworks

| Framework | What it says | How it applies to us |
|-----------|-------------|---------------------|
| **Setup / Aha / Habit model** | Setup = first config; Aha = the emotional "this is valuable" realization; Habit = repeated value | Our checklist engineers only **Setup**. Aha = a real order lands in admin. Habit = recurring orders via the Action Center. The aha and habit stages are **0% engineered** |
| **Empirical activation methodology** (Lenny/Amplitude) | Candidate moments → regress vs retention → confirm causally. Facebook's "7 friends" was largely correlational | We can't run this yet (no events). "Store published + first order within 7 days" is a strong *hypothesis* - validate once instrumented; don't hard-code 7 days as causal |
| **Fogg B=MAP** | Behavior = Motivation × Ability × Prompt; for low-ability users, *cut friction* beats adding motivation | Maria is high-motivation, low-ability. The codebase already cuts friction (seeded offline payment + sample catalog). Remaining cliffs: pricing-rule config + the gateway step - make both skippable |
| **AARRR activation + PQL behavioral trigger** | The activation event doubles as the PQL signal to time card-capture at peak willingness-to-pay | Requires `first_order_received` to be an observable event - today it is not. This is the prerequisite for the reverse-trial card-capture |

### Benchmarks

| Metric | Value | Confidence |
|--------|-------|-----------|
| Median B2B SaaS activation rate | ~37% | solid |
| Avg onboarding-checklist completion | 19.2% avg, 10.1% median | solid |
| Target time-to-value (median) | ~1.5 days; winners <10 min | directional |
| Early-activation retention multiplier | ~3–5× more likely to retain at D30 | vendor-blog/weak |
| Value-less user churn | >98% who never reach value churn within 2 weeks | vendor-blog/weak |
| Pre-loaded sample data effect | Roughly doubled activation in cited cases | vendor-blog/weak |

### What this means for Print-Flow-360

- **`SetupChecklist.vue` + `useSetupChecklist.ts`** are built and mounted (dashboard line ~30) with a progress bar, plain-language labels, completion banner. **But it's `localStorage`-only** (`pf360_setup_checklist_v1`) and **stops at "preview storefront"** - it engineers Setup but never the Aha. `CONVERSION_FUNNEL_RESEARCH` §4 explicitly calls for a missing "place a test order → You made your first sale!" step.
- **No activation event taxonomy.** `app/Helpers/AuditLogger.php` logs admin mutations + login, but there's no `signup → first_product → store_published → first_order` stream - the doc's #1 build item.
- **The "demo store" is shallow.** `StoreOnboardingService::seedSampleCatalog()` seeds 4 `is_demo` products + 11 CMS blocks + published system pages + a welcome coupon + shipping + **an offline Cheque/Bank-Transfer payment method**. So **a store can take an order on day one with zero config** - but this is never surfaced to the owner.
- **Friction-removal already done but underused:** because payment + shipping are seeded, those checklist steps are *technically already satisfiable*, yet the checklist still shows them as to-dos, adding false friction.
- **No activation columns** on `Store` (no `first_order_at`/`activated_at`). **Celebration plumbing exists** (`showSuccess`, the completion-banner pattern) - no new UI infra needed.

### Recommendations

| Move | Effort | Impact | Why |
|------|--------|--------|-----|
| **Instrument the activation funnel server-side FIRST** (events + persisted milestones) | M | High | Activation can't be engineered or A/B-tested while it's in `localStorage`. The doc's explicit #1 item; unblocks everything downstream |
| Extend the checklist to the aha: add "place a test order" + a real first-order celebration | M | High | Today owners never reach the value moment. Distinguish test vs real order; fire full-screen "You made your first sale!" on the *real* first order |
| Reframe pre-seeded defaults as "You can already take orders" | S | High | A store is live on day one. Mark payment/shipping "Done (using defaults - upgrade later)" so Maria isn't falsely blocked. Friction removal > motivation |
| Replace shallow `is_demo` products with a guided "add my first real product" wizard | M | Med | Pre-loaded realistic data ~doubles activation; let the owner make their first product personally theirs in <2 min; keep demo data one-click removable |
| Make the checklist server-truth + cross-device, ≤5 interactive steps, progressive disclosure | S | Med | Completion averages only 19.2%; short server-backed checklists complete best and survive device changes |
| Wire the post-aha PQL trigger: prompt card-capture right after `first_order_received` | S | High | Behavioral triggers convert ~2.5× calendar triggers; willingness-to-pay peaks at the aha |
| Validate the activation metric empirically once data accrues; don't hard-code "7 days" | S | Med | Regress days-to-first-order vs D30/D90 retention to find the real inflection |
| Connect the Action Center as the post-activation Habit hook | M | Med | Activation must hand off to a habit loop or the tenant churns |

### Risks

- **Vanity-milestone trap** - a green checklist with zero orders is a false-positive activation signal (the Facebook "7 friends" correlation-vs-causation pitfall).
- **`localStorage`-only state silently lies across devices** - an owner can look "un-onboarded" on a second device (violates the silent-lie rule).
- **Over-celebration / fake success** - firing "first sale!" on the owner's own test order cheapens it; distinguish test vs real.
- **Sample products leaking into a live store** confuse the owner's real customers; need a clear "remove demo data" affordance.
- **QUEUE=sync** means naively firing analytics inline adds latency to order creation - fire async/queued.

---

## 4. Growth-Experiment Discipline for a low-traffic, pre-PMF SMB tool

**The honest constraint:** we cannot run classic A/B tests on the core funnel. A 2-week test on a 5% baseline detecting a 20% lift needs **~25,000+ users per arm** - months at our scale. The right discipline for a tiny team is **experiment velocity using cheap, low-traffic-tolerant methods**, not more A/Bs.

### Frameworks

| Framework | What it says | How it applies to us |
|-----------|-------------|---------------------|
| **ICE** (Sean Ellis) | Impact × Confidence × Ease (1–10); omits Reach deliberately | **Primary backlog tool.** Reach is meaningless pre-PMF, so ICE beats RICE |
| **RICE** (Intercom) | (Reach × Impact × Confidence) / Effort | **Explicitly NOT recommended** here - Reach is guesswork at our traffic. Keep for later-stage roadmap only |
| **PIE** (Goward, CRO-specific) | Potential + Importance + Ease (1–10) | Use **only** for landing-page + pricing-page CRO - the only true-A/B-capable surfaces |
| **North Star + input-metric tree** | One value metric, decomposed into a small MECE tree the team can move | NSM already chosen: "store live + first order within 7 days." Inputs: signups → checklist completion → store published → first order → days-to-first-order |
| **Guardrail metrics** | Counter-metrics that must not regress while optimizing | trial-to-paid %, refund/chargeback rate, support tickets, churn, CLS, **money-path error rate** |
| **Painted-door / fake-door / Wizard-of-Oz** | Surface a CTA for an unbuilt feature; measure intent. Tolerates low traffic | **The core technique for us.** Test referral, new CMS blocks, B2B-approvals interest before coding |
| **Sequential / always-valid p-values** | Lets a small team peek + stop early without inflating false positives | Use a sequential/Bayesian tool (GrowthBook/Statsig) when we *do* run a true A/B |
| **Experiment-velocity culture** (Kohavi) | Only ~1/3 of well-designed experiments win; throughput compounds, not hit-rate | Optimize for *cheap experiments per month*, not win-rate. Expect most bets to fail; kill fast |

### Benchmarks

| Metric | Value | Confidence |
|--------|-------|-----------|
| Share of well-designed experiments that improve the key metric | ~1/3 positive, 1/3 flat, 1/3 negative | solid |
| Experiment failure rate at elite orgs | ~70% (MS) to ~90% (Google/Netflix/Airbnb) | directional |
| Annual experiment volume at mature orgs | >10,000/year each | solid |
| Min traffic for a fixed-horizon A/B (5% baseline, 20% lift) | ~25,000+ users per arm | solid |
| ICE/PIE scoring scale | each dimension 1–10 | verified |

### What this means for Print-Flow-360

- **Storefront customer analytics EXIST** (`useGtm.ts` + `gtm.ts`: GA4 e-commerce events) - but they measure the *end-customer* funnel inside a tenant store. **That's the wrong level for our growth experiments.**
- **Tenant business reporting EXISTS** (`StoreAnalyticsService.php`) - KPIs for the shop owner, not experiment/event analytics.
- **`store_analytics_events` exists but is thin** - its only writer is a generic tenant recorder; nothing emits structured activation events.
- **No landlord-side funnel/cohort analytics, no feature-flag library.** Grep found zero Pennant/GrowthBook/Statsig/PostHog/Amplitude/Segment. The raw data to *reconstruct* the funnel exists in `Subscription`/`Tenant`/`Order`; only the aggregation layer is missing.
- **`config/pdf_service.php`** uses simple on/off flags - a usable kill-switch pattern, not variant assignment.

### Recommendations

| Move | Effort | Impact | Why |
|------|--------|--------|-----|
| Instrument the funnel BEFORE any experiment (signup, store-published, checklist-step, first-order, trial, upgrade, cancel) | M | High | You can't experiment on a funnel you can't measure |
| Adopt the existing North Star; publish a one-screen input-tree + guardrails dashboard | S | High | Reuse the prior decision; give the weekly meeting a target and a "do no harm" floor |
| Run a 30-min weekly growth meeting off an ICE backlog; default to fake-door/qualitative, reserve true A/B for landing + pricing | S | High | Velocity is the lever; we're too low-traffic for funnel A/B |
| Seed the backlog with concrete experiments (fake-door referral tile; 5 onboarding interviews; PIE landing-headline A/B; cohort upgrade-timing test) | M | High | Turns discipline into a runnable list grounded in the prior docs |
| Use a sequential/Bayesian tool when a true A/B is justified; never peek on fixed-horizon | M | Med | Avoids the dominant low-traffic statistical error |
| Add a kill-switch feature-flag layer (Laravel Pennant or extend the config-flag pattern) | M | Med | Enables painted-door tests + gradual rollout per §0 "no half-built UI" |

### Risks

- **Peeking / optional stopping** inflates false positives - the dominant low-traffic failure. Use sequential methods or strict pre-registered horizons.
- **Underpowered tests declared "no difference"** - run a power calc first; if infeasible, don't A/B.
- **Fake-door backlash** - showing Maria a feature that 404s violates §0. Always capture intent gracefully ("want early access?").
- **Optimizing a local metric that hurts a global one** - guardrails are mandatory.
- **Vanity-metric drift** - GTM events measure the tenant's customers, not our funnel. Keep the two levels strictly separate.

---

## 5. Freemium Economics - when free helps vs cannibalizes

**The verdict:** for a low-ACV, high-churn SMB vertical SaaS where every live store consumes real per-tenant infra (always-on hosting + per-tenant S3 + PDF/image compute), **a permanent open free tier is the wrong default.** Freemium converts 2–5%, so 20–50 free users must be carried per payer - and unlike Slack/Dropbox/Canva, our free users are *not* a viral channel (their shoppers don't become our customers) and our cost-to-serve is high.

### Frameworks

| Framework | What it says | How it applies to us |
|-----------|-------------|---------------------|
| **Freemium vs Trial vs Reverse-Trial** | Freemium needs massive scale + near-zero marginal cost; reverse trial = full premium then auto-downgrade | High per-tenant cost + modest scale **disqualifies pure freemium.** Reverse trial is the right primary motion |
| **Cannibalization / fence design** | Free that's "good enough" lowers conversion; the fence forces an upgrade to capture scaling value | **The fence = the live, publicly-hosted, order-taking storefront.** That's the whole reason to pay |
| **Give away the habit, charge for the scale** | Free = the daily habit + lock-in; charge for the revenue-scaling layer | Habit layer (keep alive even when dormant): design studio + "My Designs" + catalog + pricing rules. Scale layer (charge): the store that actually sells |
| **Gating taxonomy** (feature/usage/seat/time) | Best practice: gate on the value metric (Slack's 10k-message history) | **Hybrid:** time-limit = 14-day reverse trial; paid fence = live-storefront gate + usage caps (orders/mo, storage). Avoid gating the designer - that kills the habit |
| **Cost-to-serve / gross-margin gate** | Freemium works only if payers cover the COGS of carrying free users | Our free user is *unusually expensive* (always-on store + S3 + PDF). **The strongest argument for taking the dormant store offline** - a dark store costs ~zero |
| **Strategic purposes of free** | Justified only if it serves acquisition / virality / network-seeding / education / sales-assist | Virality + network effects **do not apply** here. Free's only defensible job is keeping a churned/hesitant owner warm - which a *dormant tier* does without the live-hosting cost |

### Benchmarks

| Metric | Value | Confidence |
|--------|-------|-----------|
| Freemium free-to-paid (good / great) | ~2–5% / ~6–8% | solid |
| Free-trial free-to-paid (blended) | ~8–12% good / ~15–25% great | directional |
| Reverse-trial conversion | ~7–11% good / ~14–21% great | directional |

> **Reconciling the two reverse-trial figures in this doc.** §1 cites ~24% (18–32%) and this table cites ~7–21%. They are not the same measurement: the higher band is *self-reported, best-profile SMB self-serve* (the optimistic vendor case); the lower band is the *narrower 2026 blended* data across all reverse-trial products. Plan against the **conservative ~8–15%**, treat ~24% as the ceiling if everything goes right, and - as everywhere in this doc - **test it on our own funnel before trusting either.**
| Free users carried per payer at 2–5% conversion | ~20–50 | solid |
| SMB self-serve monthly logo churn | ~3–5%/mo (22–39% annual) | solid |
| NRR ceiling at ARPA <$10/mo | only ~2.7% of companies exceed 100% NRR | solid |

### What this means for Print-Flow-360

- **`PlanLimitsService` fails OPEN with no plan** (`['allowed'=>true]`, "graceful degradation"). A reverse-trial downgrade to a *no-plan* state would be silently **unlimited** - the opposite of a capped free tier. **A real free tier must be a real Plan row with explicit caps.**
- **`Subscription::isActiveForAccess()` returns false the moment a trial expires** - there is **no downgrade-to-free path today.** Trial expiry = total loss of access. The "permanent free tier" the prior docs assume is **unbuilt.**
- **`AccountStatusService::approveTrial()`** seeds a 15-day trial (prior docs want 14); no auto-transition-to-free on expiry.
- **The `plans` table is bare** - no structured limit columns (orders/mo, storage); the `features` JSON is the only place limits live and only 3 keys are read.
- **Cost-to-serve is real and per-tenant:** `FileHelper.php` configures per-tenant S3; `pdf-service/` (sharp + PDFKit + BullMQ) does heavy work; the storefront is always-on. **A live free store consumes all three; a dormant store consumes only idle storage** - the technical basis for "data-alive, store-offline."
- **No referral/network machinery exists** - removing the "free seeds virality" justification entirely.

### Recommendations

| Move | Effort | Impact | Why |
|------|--------|--------|-----|
| Keep the no-card 14-day reverse trial as the primary motion; do NOT ship open freemium | S | High | Freemium converts 2–5% and forces us to carry 20–50 expensive free users per payer with no viral upside. Align `AccountStatusService::approveTrial()` 15→14 days - **this touches a trial/money path, so per CLAUDE.md it needs a round-trip test** asserting the new trial length persists and `isActiveForAccess` flips on the right day |
| Build the post-trial fallback as a DORMANT/PARKING tier: data alive, storefront offline | L | High | Cannibalization fence + cost fix in one move. **Mechanism, grounded:** add a value to the subscription **status enum** (`app/Models/Subscription.php` - currently `{active, trial, expired, charge_failed, cancelled}`; needs a Postgres `CHECK`-constraint widen per §6 of CLAUDE.md) e.g. `dormant`; `isActiveForAccess()` treats it as **admin-read-only**; and the *public storefront* goes dark via a **tenant-level `storefront_suspended` flag checked in the `InitializeTenancy` middleware chain** (or the storefront's tenant-resolution guard), returning a branded "store is offline" page rather than 404. Both halves need tests |
| Make the paid fence = "live, publicly-hosted, order-taking storefront" and gate it explicitly | M | High | Give away the habit (designer + catalog), charge for the scale. Reuse the `PlanLimitsService` 403-message pattern for a "publish storefront" + "accept order" gate |
| Fix the fail-open hole before any free tier ships | M | High | A naive free tier would be silently unlimited - the silent-lie/cost-leak bug class. Seed an explicit Free plan with caps; add `orders_per_month`/`storage_mb` columns |
| Use a hybrid gate reconciled with Good-Better-Best (Free=offline; Solo=1 live store + caps; Growing(hero)=higher caps + designer + B2B-lite; Multi-Location=per-location) | S | Med | Time-limit + live-storefront fence + usage caps. Charge per location, never per seat or GMV |
| Wire loss-aversion reactivation + dunning off the dormant tier | M | Med | "Your store is offline - your designs are saved. Go live in one click." The cheapest re-conversion path |
| Instrument cost-to-serve per tenant before claiming any LTV:CAC | M | Med | Free's payback depends entirely on free-user COGS, which is high here. Margin-adjust LTV |

### Risks

- **Open free *live* storefront cannibalizes the cheapest paid plan** - a low-volume one-person shop gets everything for free; the classic "gave away the farm."
- **Fail-open enforcement** means a sloppy rollout grants unlimited products/users/stores - a §0 silent-lie + unbounded cost leak.
- **Cost-to-serve runaway** - the 95–97% who never pay still burn hosting + storage + compute.
- **Over-gating the design studio kills the habit/lock-in** - gate the storefront/orders, not the designer.
- **Taking a previously-live store offline reads as punitive** if handled badly - frame in plain language with one-click reactivation and clearly preserved data.
- **Assuming freemium "seeds virality" here is a category error** - a free shop's shoppers never become our tenants.

---

## 6. The "Powered by Print-Flow-360" Attribution Loop - our most distinctive growth surface (with an honest reality check)

This is the single most distinctive thing about our growth model, so it deserves its own section - and a dose of honesty.

**The opportunity is genuinely unusual.** We operate, for free, the highest-traffic acquisition surfaces a web-to-print SaaS could want:

- **Every branded tenant storefront** - pageviews from the shop's own marketing, SEO, and repeat customers (Shopify's footer analog).
- **Every public proof-approval link** (`/proofs/client-review/{id}`) - sent to *every* end-customer, landing a **business-context viewer** reviewing a print job (Calendly's booking-page analog). This is the best prospect of the three: someone already thinking about print production.
- **Every designer export** (PDF/SVG/PNG) - shared designs that currently leave the platform invisibly (Canva's UGC analog).

**Today, 100% of this exposure is wasted** - zero attribution on any of it. Adding "Powered by Print-Flow-360 · Build your own store →" to these surfaces, gated by a single `remove_branding` plan flag, is the highest-ROI growth move in this entire document: free impressions on surfaces we already run, requiring *zero behavior change* from the shop owner, that simultaneously create a clean, plain-language upgrade reason ("remove the badge - go Pro").

### The honest k-coefficient reality check

Do **not** let anyone pitch this as a "viral engine" or a "network-effect moat." Here is the unvarnished math:

- The honest denominator is **shop owners**, not end-customers. A shop owner rarely inherently invites another shop owner, so inherent **k among shops ≈ 0**.
- The customer-of-customer path (an end-customer sees the badge → becomes a shop owner) has a **tiny conversion rate** - most end-customers are *buyers of printed goods*, not aspiring print-shop owners.
- **Cycle time is long** - someone has to decide to open a print shop.
- Net realistic **k ≈ 0.15–0.4: sub-viral amplification, not self-sustaining growth.** It *lowers blended CAC* and *compounds the founder-led/referral motion* - it does not replace a channel.

> **The one-line back-of-envelope** (so this is a defensible estimate, not a vibe - all inputs are guesses to replace with measured UTM data): say an active shop's badge earns ~500 badge-impressions/month across its storefront + proof links; assume ~1% click through to our landing page (5 visitors), and that ~1–2% of those *business-context* viewers are plausible shop-owner prospects who eventually sign up (~0.05–0.1 signups/shop/month). Over a ~6-month consideration window that's ~0.3–0.6 referred signups per active shop - i.e. **k ≈ 0.15–0.4** once you discount for long cycle time. Every term here is a placeholder; the point is the *shape* (well under 1), not the digits. Measure impressions→clicks→signups per surface and recompute.

And critically: **this is a one-way distribution loop, not a network effect.** One shop displaying our badge does not make the product more valuable to another shop. The *only* move that would create a genuine two-sided/data network effect is a **cross-tenant template marketplace** (more shops → more shared templates → more valuable to all shops). That's the long-term moat; the badge is the cheap, immediate amplifier. Label them honestly to stakeholders or you'll set false expectations.

**Where to concentrate the badge:** the proof page and invoices (business-context viewers) over the storefront footer (random shoppers) for *conversion quality* - but ship the footer first for *volume*. UTM-tag each surface distinctly so you measure which loop actually converts shop owners, and report a per-surface k, never a blended viral number.

---

## 7. How this fits the existing GTM docs

This doc **extends** four existing research docs. Read them; don't re-derive them.

| Doc | Where we AGREE | Where we EXTEND or DISAGREE |
|-----|----------------|----------------------------|
| `readme/CONVERSION_FUNNEL_RESEARCH_2026-06-15.md` | No-card 14-day reverse trial; North Star "store live + first order in 7d"; ≤5-step go-live checklist; funnel instrumentation as #1 build item | **EXTEND:** the doc's "permanent thin free tier" fallback should be reframed as a **dormant/parking tier (storefront offline)**, not an open freemium - because free *live* stores cannibalize the cheapest plan and burn infra. **EXTEND:** the checklist must reach the *aha* (first real order + celebration), not stop at "preview." **EXTEND:** "7 days" is a hypothesis to validate empirically, not a causal constant |
| `readme/PRICING_RETENTION_REFERRALS_STRATEGY_2026-06-15.md` | Good-Better-Best with a hero middle tier; dunning; per-location pricing; referral as a future build | **EXTEND:** before building the referral system, ship the cheaper **inherent-virality (Powered-by) loop** - it needs zero owner behavior change and is complementary. **EXTEND:** wire `remove_branding` as the fence that monetizes both the loop and the Pro tier |
| `readme/ACQUISITION_CHANNELS_2026-06-15.md` | Founder-led outreach + print communities primary; BOFU SEO + free design tool secondary | **AGREE & bound:** the customer-of-customer attribution loop is **amplification, not a channel** - it feeds the proven motion, never replaces it. Don't let it starve founder-led outreach |
| `readme/GTM_01_ICP_AND_POSITIONING_2026-06-15.md` | ICP = "Maria," non-technical SMB print-shop owner, one-person buying committee; category = online storefront + design studio | **EXTEND:** every PLG decision here (reverse trial, value-then-fence paywalls, plain-language trial countdown, dormant-tier framing) is downstream of "Maria is high-motivation, low-ability" - friction removal beats persuasion at every step |

---

## 8. Sequencing - Phase 0 → 1 → 2 (with hard gates)

The TL;DR is ordered by impact ÷ effort, **not** by dependency. Shipping in raw impact order is dangerous here - e.g. dropping a reverse-trial *downgrade* into the current fail-open `PlanLimitsService` would silently grant unlimited usage, and calling "first real order" a PQL is dishonest if the production spine can't fulfill that order. Build in this order; each gate is a "do not ship the next phase until this is true."

| Phase | Ship | Gate that must hold first |
|-------|------|---------------------------|
| **Phase 0 - Foundations (no growth promises yet)** | (a) Server-side activation events + landlord funnel/cohort dashboard (§10 #1–2); (b) **fix the `PlanLimitsService` fail-open hole** - no-plan must mean *capped*, not unlimited; (c) confirm landlord-side subscription billing + card-on-file works end-to-end; (d) per-tenant cost-to-serve instrumentation | Nothing. This is the prerequisite layer. |
| **Phase 1 - Cheap amplifiers + activation (no model change)** | (a) "Powered by Print-Flow-360" footer + `remove_branding` flag (with its round-trip test); (b) extend checklist to the real aha + first-order celebration; (c) reframe seeded defaults as "you can already take orders"; (d) contextual `UpgradePrompt` replacing hard blocks; (e) weekly ICE growth meeting | **Phase 0 done:** events exist (so activation/aha is measurable), and the fail-open hole is closed (so gating is safe). |
| **Phase 2 - Model change + structural moats** | (a) Convert to the no-card 14-day reverse trial (15→14, with test); (b) build the dormant/parking tier as the downgrade target; (c) wire PQL card-capture on `first_order_received`; (d) thin product-led-sales assist; (e) (longer-term) cross-tenant template marketplace | **Phase 0(b) + 0(c) done:** the reverse-trial downgrade requires a real capped Free/dormant plan (never the fail-open absence of a plan) **and** working subscription billing. **PQL honesty gate:** do not call "first real order" a PQL until the production spine (QUEUE=sync, partial fulfillment, carrier/tracking) can actually fulfill it end-to-end. |

**The three gates, stated bluntly:**
1. **Instrument before optimize** - no activation/experiment work lands before Phase 0 events exist.
2. **Close fail-open before any free/dormant tier** - or the tier is silently unlimited (a §0 silent-lie + unbounded cost leak).
3. **Working fulfillment + working billing before the order-based PQL** - or we're triggering an upsell on a value moment we can't deliver or can't charge for.

---

## 9. Sources

**Internal (build on, do not duplicate):**
- `readme/CONVERSION_FUNNEL_RESEARCH_2026-06-15.md`
- `readme/PRICING_RETENTION_REFERRALS_STRATEGY_2026-06-15.md`
- `readme/ACQUISITION_CHANNELS_2026-06-15.md`
- `readme/GTM_01_ICP_AND_POSITIONING_2026-06-15.md`
- `readme/ACTION_CENTER.md`, `readme/ONBOARDING.md`, `readme/B2B_MODULE.md`

**Codebase grounding:**
- `app/Models/Plan.php`, `app/Models/Subscription.php`, `database/seeders/PlanSeeder.php`
- `app/Services/Subscription/PlanLimitsService.php`, `app/Services/Admin/AccountStatusService.php`
- `nuxt/app/composables/usePlanLimits.ts`, `nuxt/app/composables/useSetupChecklist.ts`, `nuxt/app/components/dashboard/SetupChecklist.vue`, `nuxt/app/layouts/no-plan.vue`
- `app/Services/Onboarding/StoreOnboardingService.php`, `app/Helpers/AuditLogger.php`, `app/Helpers/FileHelper.php`
- `frontstore/app/components/storefront/layouts/StorefrontFooterDynamic.vue`, `frontstore/app/pages/profile/designs.vue`
- `app/Mail/Proof/ApprovalMail.php`, `app/Services/ProofService.php`, `designer/src/components/FileExport/*`
- `frontstore/app/composables/storefront/useGtm.ts`, `app/Services/Analytics/StoreAnalyticsService.php`, `app/Models/Store/StoreAnalyticsEvent.php`, `config/pdf_service.php`

**External (treat numbers as hypotheses):**
- Wes Bush, *Product-Led Growth* - productled.com/book/product-led-growth
- OpenView - activation vs PQL, +61% fast-growth correlation; value-vs-fence gating (Kyle Poyar)
- Elena Verna / Kyle Poyar - Reverse Trial (amplitude.com/blog/reverse-trial; growthunhinged.com)
- Reforge - PLG activation loops; "The Hidden Freemium Advantage"
- NFX - network-effects taxonomy (nfx.com/post/network-effects-manual)
- ChartMogul - SaaS Conversion Report; First Page Sage / Userpilot / ADV.me - trial & freemium benchmarks
- Lenny's Newsletter - activation methodology; "why SaaS freemium playbooks don't work in AI"
- Mode / Geckoboard - Facebook "7 friends" correlation-vs-causation
- Ronny Kohavi - experiment win-rates & volume (abtasty 1000-Experiments-Club; bytepawn)
- ICE/PIE/RICE - productlift.dev, statsig.com, weblics.agency; fake-door - userpilot.com, amplitude.com
- Low-traffic A/B - absmartly, vwo, convert.com; sequential - growthbook.io
- Cost-to-serve / unit economics - CloudZero, Monetizely "hidden costs of freemium"

---

## 10. Open Questions / What to Instrument FIRST

**Instrument first (in order) - nothing below the line can be optimized until these exist:**

1. **Server-side activation events** - `signup`, `first_product_added`, `store_published`, `first_order_received`, `trial_started`, `upgraded`, `cancelled`. Fire async (QUEUE=sync caveat). Persist milestone timestamps on `Store` (or a `tenant_onboarding_progress` record).
2. **A landlord-side funnel + cohort dashboard** - signups → checklist completion → store published → first order → days-to-first-order, with the guardrail metrics overlaid. Events without a dashboard are dead weight.
3. **Per-tenant cost-to-serve** - storage GB, PDF/image job volume, hosting cost - so any LTV:CAC or free-tier-payback claim is margin-adjusted and honest.

> **Current baseline: unmeasured.** We do not today have signup, activation, trial-conversion, or churn numbers for our *own* (landlord-side) funnel - there is no instrumentation (see §4). Every impact estimate, conversion %, and k-factor in this doc is therefore a **directional target, not a delta off a known baseline.** The first job is to make the baseline real; only then are "lift" claims meaningful.

**Hard dependency to verify before promising behavioral card-capture (#10 in the TL;DR):**

- **Does landlord-side subscription billing + card-on-file actually work?** The reverse-trial PQL move assumes we can capture a card and charge the *tenant* for their Print-Flow-360 subscription (this is the SaaS billing, distinct from the shop's *own* customers paying for prints, which run through the per-tenant payment gateways). Memory flags severe money-path bugs in the customer-side gateways; the landlord-side subscription-charge path must be confirmed end-to-end (card capture → store → recurring charge → dunning) **before** we trigger card-capture on `first_order_received`, or we promise a conversion we can't collect.

**Open questions to resolve with data, not opinion:**

- **What is the *real* activation inflection?** Is it "first order within 7 days," 72 hours, or "3 products published"? Regress against D30/D90 tenant retention once events accrue. Don't hard-code 7 days as causal.
- **What is the actual attribution-loop k?** UTM-tag footer vs proof vs export; measure signups attributed to each. Confirm or revise the 0.15–0.4 estimate.
- **Does the dormant tier reactivate anyone?** Track reactivation rate from offline-store dunning before investing further in it.
- **What's the right dormant-tier generosity?** Too generous → cannibalizes Solo; too stingy → angry churn. A/B the offline-vs-read-only framing once volume allows; until then, run 5 qualitative interviews.
- **Does the production spine actually close the loop?** A PQL on "first real order" is only honest if order → fulfillment → tracking works end-to-end (known gap: QUEUE=sync, partial fulfillment, carrier/tracking). Verify before trusting the PQL.
- **Will the template marketplace clear cold-start?** Decide the curated-seed strategy and moderation/IP policy before committing to the only genuine network-effect play.
