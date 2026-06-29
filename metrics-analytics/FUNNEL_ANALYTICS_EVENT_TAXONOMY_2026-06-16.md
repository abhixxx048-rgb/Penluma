# Print-Flow-360 Funnel Analytics & Event Taxonomy Design

> Internal analytics/instrumentation strategy doc. Researched 2026-06-16 via a multi-agent workflow
> (funnel-analytics, event-taxonomy, identity-stitching, server-vs-client, tooling, and starter-plan
> streams — each web-researched against primary sources and cross-checked). Benchmarks are flagged by
> confidence; **treat every vendor-blog percentage as a hypothesis to A/B-test on our own funnel, not a
> guarantee.** This doc is the instrumentation companion to `readme/CONVERSION_FUNNEL_RESEARCH_2026-06-15.md`
> (which defines the AARRR strategy and the North Star: *store live + first order in 7 days*). Where that
> doc said "instrument the activation funnel," this one says exactly *how*.

## Executive Summary

For a low-ACV, non-technical SMB print SaaS, the single most common analytics mistake is **over-instrumentation**: a 200-event tracking plan that nobody owns, fires inconsistently, and obscures the one funnel that matters. Our buyers are print-shop owners, not a million-MAU consumer app — we have **limited eng time and a small customer base**, so signal-per-event is everything. The opinionated recommendation: **instrument a deliberately small, server-side-anchored event set (~12–15 events) that traces the real lifecycle — signup → store setup → product added → store live → first order → reorder — written in one strict `object_action` snake_case convention, governed by a single one-page tracking plan with a named owner per event, and fire every revenue/order event SERVER-SIDE so ad-blockers and browser privacy can never punch a hole in the numbers we'll make decisions on.** Pick **PostHog** (generous free tier, bundles funnels + session replay + feature flags, self-hostable, EU/data-control friendly) as the default tool; its autocapture covers low-value clicks for free so we only hand-instrument the high-value lifecycle events. Build the funnel **strict-ordered with a generous conversion window (7–14 days)** for activation, and resist adding events until an existing one has answered a real question.

> **A note on the numbers.** The *principles* here are well-grounded across Amplitude, Mixpanel, PostHog, and Segment primary docs. The *precise percentages* — especially ad-blocker data-loss (the widely-repeated "25–40%") and "X% of revenue events lost" — trace to vendor blogs and are explicitly **unaudited**. Ad-blocker *adoption* (~29–33% of users) is well-measured; ad-blocker *analytics-data-loss* (20–40%) is a directional estimate. Treat tool free-tier limits as current-as-of-2026 and re-verify before committing.

---

## 1. Funnel analytics — defining, windowing, and segmenting funnels

**What a funnel is.** An ordered set of events a user must complete (e.g. `signup_completed` → `store_published` → `order_received`), measured as the **% of users who reach each step** within a **conversion window**. Funnels count **unique users**, not raw events — a user converts once per attempt [1][2].

**Conversion window.** The maximum time allowed between the first and last step. Mixpanel allows windows from a **2-second floor (strict) up to 90 days**; loose-mode windows run **1–90 days** [1][3]. The window is a *modeling choice*, not a detail: too short and you under-count slow-but-real conversions; too long and you over-credit unrelated sessions. For an activation funnel where owners may sign up Monday and go live Thursday, **a 7–14 day window matches our North Star** rather than a same-session window.

**Strict vs. loose (flexible) ordering — the most consequential funnel setting.**
- **Strict**: the user must do the steps in *exact* sequence with nothing in between counted out of order. Use for **linear, must-follow flows: checkout, payment, the go-live wizard.** [2][3]
- **Loose / flexible**: the user must hit all steps *in order* but may do other actions between them. Use for **exploratory journeys** (signup → eventually published → eventually first order, with browsing/editing in between) [2][3].
- Mixpanel applies a **2-second tolerance**: consecutive steps within 2s of each other are treated as interchangeable (handles events that fire near-simultaneously) [1].

**Multi-path funnels.** Real products have more than one route to value. The pitfall: forcing a single linear funnel through a step many users legitimately skip — it **inflates the drop-off at that step and produces a false leak** [2][4]. Fix by (a) making questionable steps optional in the funnel definition, or (b) modeling separate funnels per path and comparing.

**Segmentation is where funnels earn their keep.** A blended funnel hides the leak. Always break the same funnel down by **acquisition channel, persona ("what do you sell?"), device, and signup cohort** to localize *where* and *for whom* it leaks [4][5].

**Common funnel pitfalls (cross-checked):**

| Pitfall | Why it misleads | Confidence |
|---|---|---|
| Requiring an unnecessary step | Users who skip it look like drop-offs; skews the whole funnel | Solid [2][4] |
| Wrong conversion window | Too short under-counts real conversions; too long over-credits | Solid [1][3] |
| Strict where loose is correct (or vice-versa) | Counts the wrong population entirely | Solid [2][3] |
| Identity-merge lag (anon→known) | Can create ~24h discrepancies; pre-merge cohorts look wrong | Verified [1] |
| Funnel vs. raw-count confusion | Funnels need sequence; "Insights"/totals count raw events — different denominators | Verified [1] |
| Only ever looking at the blended funnel | Masks channel/persona-specific leaks | Solid [4][5] |

---

## 2. Event taxonomy design — names that won't rot

A taxonomy is a **controlled vocabulary** for events and properties. It rots when engineers invent names ad hoc under deadline. The discipline below is the consensus across Amplitude, Mixpanel, PostHog, and Segment [6][7][8].

**The `object_action` (verb_noun) convention.** An event = an *object* (noun: the thing) + an *action* (verb: what happened to it). Amplitude's house style is `button_clicked`, `checkout_completed` — **lowercase, underscores, past tense** [6]. The four naming axes to lock down once and enforce forever [7]:
1. **Casing** — pick ONE (`snake_case` recommended; survives data-warehouse export better than camelCase). Casing drift alone fragments metrics. [6][7]
2. **Format** — `object_action` (or `context_object_action`) so related events cluster.
3. **Tense** — **past simple** (`order_received`, not `receive_order`) — reads as a historical record.
4. **Vocabulary** — restrict verbs to an approved list. PostHog's default set (`view, click, submit, create, add, update, delete, remove, start, end, cancel, fail, send, invite, generate`) is a strong starting point. [7]

**The single most important code rule: event names are FIXED STRINGS.** Never build an event name from a variable (`order_${status}`). Variable data goes in **property values**, not event names — otherwise every status becomes a new "event" and the taxonomy explodes. [7]

**Events vs. properties vs. user-properties.** [6]
- **Event** = the discrete action (`product_added`).
- **Event property** = context of *that occurrence* (`product_type: "business_cards"`, `price_set: 24.00`, `source: "demo_seed"`).
- **User property** = persistent attribute of the *person/store* (`plan: "growth"`, `store_vertical: "print_shop"`, `is_b2b: true`).
- **Rule of thumb:** if you're tempted to make `product_added_business_cards` and `product_added_flyers` separate events, that's two **property values** of one event. Properties prevent sprawl. [6][7]

**Property naming.** `object_adjective` (`product_type`, `order_total`); prefix booleans `is_`/`has_`; suffix dates `_date`/`_timestamp`. Keep property *types* stable — sending the same property as a string then a number silently breaks aggregations. [7]

**Sizing guardrails (Amplitude guideline, treat as functional, not law):** ~**10–200 events** per plan and **≤20 properties per event**. Fewer than ~10 makes funnel analysis impossible; more than ~200 becomes unnavigable. For us, **stay near the low end (~12–15).** [7]

**Avoiding event sprawl — the SMB rule.** Track **outcomes tied to business goals**, not every interaction. "Tracking every interaction inflates data volume and obscures important patterns." [6] Let **autocapture** (PostHog/others) handle low-value clicks/pageviews for free, and **hand-instrument only the lifecycle events** in §6. [8]

**Governance = a one-page tracking plan + an owner per event.** The taxonomy fails not from a bad spreadsheet but from **no enforcement gate**. The highest-cost decay modes throw *no error* (silent identity fragmentation, orphaned events whose author left) [7]. Minimum viable governance for a small team:
- A living **tracking plan** (table in §6) — every event has: name, trigger, key properties, **named owner**, client/server.
- A **PR checklist** for any tracking change: name passes convention · properties typed · owner field set · deprecations get a migration plan, not a silent rename. [7]
- Use **version labels** (proposed / active / deprecated / removed) rather than deleting. [6][7]

---

## 3. Identity — anonymous → identified stitching (the silent killer)

Most value-defining events happen *before* we know who the user is (landing, signup-started). The job of identity stitching is to **merge that anonymous history into the known store-owner profile** the moment they identify [9][10].

**The model.** Each browser gets an **anonymous/device id** (PostHog `distinct_id`, Segment `anonymousId`). On signup/login you call **`identify(user_id)`**, which binds the anon id to the real **user id** and **retroactively merges** the prior anonymous events into that profile [9][10][7].

**The two-moment rule (do both or graphs fracture silently):** [7]
1. Initialize identity **on first load** (bind the anonymous session).
2. Call `identify()` **after login/signup** (merge anon → known).

Skip either and you get the **highest-cost, error-free failure**: cohorts that are silently wrong because one human is split across many ids, or many humans collapsed into one shared device. [7]

**`$set` vs `$set_once`.** Use `$set` for mutable attributes (current plan, store vertical) and `$set_once` for **immutable acquisition context** (first-touch channel, referral source) — overwriting acquisition source destroys attribution permanently. [7]

**Multi-tenant caveat for Print-Flow-360.** We have two identity grains: the **store/tenant** and the **individual user**. Pick the store (tenant uuid) as the primary analytics identity for lifecycle/North-Star analysis (the North Star is *stores* with an order in 7 days), and carry `user_id` as a property — never expose raw tenant uuids in any user-facing analytics label (house rule §0). Merge-lag can create ~24h discrepancies in fresh cohorts — don't panic-diagnose a day-old funnel [1].

---

## 4. Server-side vs client-side — fire revenue events on the server

**The principle:** client-side events travel through the user's browser, where **ad-blockers, Intelligent Tracking Prevention, and JS failures drop a chunk of them**; server-side events go straight from our backend and **cannot be blocked** [11][12][13]. The events most likely to be lost client-side are exactly the **high-value ones** (signups, orders, payments) because privacy-conscious/blocker users skew toward exactly those moments [11].

**Data-loss reality (confidence-flagged):**

| Claim | Value | Confidence |
|---|---|---|
| Ad-blocker *adoption* (share of internet users) | ~29.5% global, ~33% US (Q2 2025) | Solid [14] |
| Ad-blocker *analytics-data-loss* (events dropped client-side) | ~20–40% "in some industries" | **Directional / vendor-stated, unaudited** [11][13][7] |
| "One fintech lost 40% of conversion data" | single anecdote | Directional [11] |

**The hybrid model (recommended):** [7][12]
- **Client-side (autocapture)** for low-stakes behavioral data: pageviews, clicks, in-app navigation. Cheap, no eng cost, blocker-loss is acceptable here.
- **Server-side** for the **money/lifecycle truth**: `order_received`, `payment_succeeded`, `subscription_started/changed/canceled`, `store_published`, `first_order_received`. These already happen in our Laravel backend (orders, payments, tenancy) — fire the analytics event in the **service layer**, not the Vue component.
- For an event you genuinely need on both sides, give the two **different names** to avoid double-counting [7].

**Why this fits Print-Flow-360 specifically:** our order/payment/publish logic *already lives server-side* (`app/Services/...`, per CLAUDE.md layering). Emitting the revenue events from there is both more reliable **and** less work than re-deriving them from blockable client events. This is the single highest-ROI instrumentation decision in the doc.

---

## 5. Tooling trade-offs for a cost- and eng-constrained team

| Tool | Free tier (2026, re-verify) | Model | Strengths | Watch-outs | Confidence |
|---|---|---|---|---|---|
| **PostHog** | ~1M events/mo + 5k session replays + feature flags, unlimited seats | Per-event (~$0.00031/event after free) | Bundles analytics + replay + flags + A/B + surveys; **self-hostable**; autocapture; EU data option | Per-event cost scales with volume; busier UI | Solid [15][16] |
| **Mixpanel** | Up to ~1M MTU / generous event tier (free) | Per monthly-tracked-user (MTU) | Fast, PM-friendly funnels/retention | MTU pricing can surprise; less bundled | Solid [15][16] |
| **Amplitude** | Starter up to ~10M events/mo (core charts) | Event/MTU tiers | Best-in-class behavioral analytics, governance/codegen | Enterprise-priced beyond starter | Solid [15][16] |
| **GA4** | Free | — | Free, ubiquitous | Sampling, hard limits (40-char names, 25 params/event), session-not-user model, weak product funnels | Solid [7] |
| **Self-host via Postgres** | Infra cost only | Roll-your-own event table | Full control, no vendor; we already run Postgres | **Build/maintain cost is the trap** — no funnels UI, no replay, you build governance yourself | Directional |

**Recommendation for us: PostHog.** It maximizes signal-per-dollar-and-per-eng-hour for a small team — autocapture removes most manual instrumentation, the free tier comfortably covers our SMB volume, and bundled session replay is (per PostHog) *"the most useful analytical tool for early-stage startups"* for turning a "where they dropped" into a "why" [8]. Self-host option aligns with our multi-tenant/EU-data posture. **Do NOT build a Postgres-only analytics layer** — we'd reinvent funnels, retention, replay, and governance with eng time we don't have. (A lightweight Postgres `events` table is fine only as a server-side *source of truth* feeding PostHog, not as the analytics product itself.)

---

## 6. DELIVERABLE — Print-Flow-360 starter tracking plan

A deliberately **small (~14-event) plan** mapping the real lifecycle. One convention: `object_action`, snake_case, past tense. **S = server-side (reliable), C = client-side (autocapture-OK).** Every event has an owner. This *is* the governance doc — keep it living; add an event only when an existing one can't answer a real question.

| Event name | Trigger (when it fires) | Key properties | Owner | Side |
|---|---|---|---|---|
| `landing_viewed` | Marketing/landing page load | `source`, `utm_*`, `device` | Marketing | C |
| `signup_started` | Owner opens signup form | `source` | Growth | C |
| `signup_completed` | Account/tenant created | `store_vertical` (from "what do you sell?"), `source` | Growth | **S** |
| `onboarding_question_answered` | "What do you sell?" answered | `store_vertical` | Product | C |
| `product_added` | First/any product saved | `product_type`, `is_first_product`, `price_set` (bool), `source` (`demo_seed`/`manual`) | Product | **S** |
| `price_set` | Owner sets/changes a product price | `product_type`, `used_default` (bool) | Product | **S** |
| `store_published` | Store goes live | `products_count`, `time_since_signup_hours` | Product | **S** |
| `store_link_shared` | Owner shares/copies storefront link | `channel` | Growth | C |
| `order_received` | Any order placed on a storefront | `order_total`, `currency`, `is_first_order`, `customer_type` (guest/b2b) | Orders | **S** |
| `first_order_received` | The store's first-ever order (North Star) | `order_total`, `currency`, `time_since_publish_hours` | Orders | **S** |
| `reorder_received` | Returning customer reorders | `order_total`, `days_since_last_order` | Orders | **S** |
| `studio_used` | Owner/customer uses design studio | `is_template`, `personalize_mode` (bool) | Product | C |
| `card_added` | Payment method captured (the upgrade ask) | `trigger` (`post_first_order`/`calendar`/`manual`) | Billing | **S** |
| `subscription_changed` | Trial→paid, plan change, or cancel | `from_plan`, `to_plan`, `mrr_delta`, `reason` (on cancel) | Billing | **S** |

**User properties to `$set`:** `plan`, `store_vertical`, `is_b2b`, `store_status` (trial/live/downgraded). **`$set_once`:** `first_touch_source`, `signup_date`.

**The two headline funnels to build from this plan:**
1. **Activation (North Star), strict-ish, 7–14d window:** `signup_completed` → `store_published` → `first_order_received`. Segment by `store_vertical` and `source`. This is the *one* funnel to review weekly.
2. **Storefront purchase, strict, short window:** `landing_viewed`(storefront) → `product_added`(cart) → checkout → `order_received`. Strict because checkout is linear.

**What to A/B test (on our funnel, never on borrowed lift %):** conversion-window length for activation; behavioral (`post_first_order`) vs. calendar `card_added` trigger; demo-seed vs. blank-start effect on `product_added`→`store_published`.

**What to deliberately NOT instrument now:** per-button clicks, scroll depth, hover/heatmap events, micro-interactions inside the studio, per-field form analytics. Autocapture + session replay cover these for free; hand-instrumenting them is the sprawl trap.

---

## 7. What this means for Print-Flow-360

**Instrument (do now):**
1. **Fire all 7 server-side events** (`signup_completed`, `product_added`, `price_set`, `store_published`, `order_received`/`first_order_received`/`reorder_received`, `card_added`, `subscription_changed`) **from the Laravel service layer** — they already run there; this is reliable *and* less work.
2. **Adopt PostHog**, turn on autocapture (covers all the client-side low-value events for free), and hand-instrument only the ~14 plan events.
3. **Wire identity correctly:** init anon id on first load; call `identify(tenant_uuid)` at signup/login; `$set_once` the first-touch source. This prevents the silent-cohort bug.
4. **Build the activation funnel** (`signup_completed → store_published → first_order_received`) strict-ordered, 7–14 day window, segmented by vertical and channel. Review the worst-converting step weekly.
5. **Make the tracking plan (§6) a checked-in doc with a PR checklist** — owner field required, names are fixed strings, deprecations get migration plans.

**Ignore (resist the temptation):**
- Don't build a Postgres-only analytics product — reinventing funnels/retention/replay wastes the eng time we don't have.
- Don't optimize the storefront micro-funnel before the **activation** funnel is measured and healthy (PostHog: premature funnel optimization "hides bigger problems" [8]).
- Don't track every click manually — autocapture exists; sprawl is the enemy.
- Don't trust borrowed lift/data-loss percentages as targets.

**A/B test (on our own funnel):** activation conversion-window length · `post_first_order` vs calendar `card_added` trigger · demo-seed vs blank-start on the product→publish step.

**Connects to prior research:** this operationalizes `CONVERSION_FUNNEL_RESEARCH_2026-06-15.md` §7-8 (the North Star *stores with an order in 7 days* is the `first_order_received` event; the behavioral upgrade trigger is the `card_added` `trigger: post_first_order` property).

---

## 8. Folklore warnings — stats commonly mis-attributed or fabricated

- **"Ad-blockers cause 25–40% analytics data loss."** Ad-blocker *adoption* (~29–33% of users) is well-measured [14]; the *event-loss* figure is **vendor-stated and explicitly unaudited** [7][11][13]. Use it to justify server-side capture (directionally true), not as a precise target.
- **"You lose a $5,000 sale every time a pixel is blocked."** Vendor illustration, not data [11].
- **"One fintech lost exactly 40% of conversions to ad-blockers."** Single uncited anecdote [11]. Directional at best.
- **Amplitude's "10–200 events / ≤20 properties"** is *functional guidance*, not a hard platform limit — don't cite it as a rule [7].
- **GA4 hard limits ARE real and load-bearing** (40-char event names, 25 params/event, name must start with a letter) — these are platform constraints, not folklore [7]. If we ever dual-ship to GA4, names must fit.
- **"Object-Action framework" attribution.** It's a shared industry convention documented by Amplitude, Mixpanel, and PostHog — fine to cite, but it has no single canonical inventor; don't attribute it to one vendor as if proprietary [6][7].
- **Tool free-tier numbers drift.** The PostHog/Mixpanel/Amplitude free-tier figures here are 2026 snapshots [15][16] — re-verify before committing; vendors change them frequently.

---

## Sources

1. Mixpanel Docs — Funnels FAQ (strict/loose ordering, 2-second tolerance, conversion window, identity-merge lag). https://docs.mixpanel.com/docs/reports/funnels/funnels-faq
2. Amplitude — Three Steps to Increase Your Conversion Rate Using Funnels. https://amplitude.com/blog/three-steps-to-increase-your-conversion-rate-using-funnels
3. CleverTap — Funnel Analysis: Increase Conversions with funnel analytics (strict vs flexible, conversion window). https://clevertap.com/blog/funnel-analysis/
4. Quadratic — Funnel Analysis 101: From Signup to Activation (and Beyond). https://www.quadratichq.com/blog/funnel-analysis-from-signup-to-activation-and-beyond
5. UXCam — Conversion Funnel Analysis: A Complete Guide for 2026. https://uxcam.com/blog/conversion-funnel-analysis/
6. Amplitude — What Is Event Taxonomy: Complete Definition & Framework (object-action, events vs properties, sprawl, governance). https://amplitude.com/explore/data/event-taxonomy
7. Digital Applied — Product Analytics: An Event Taxonomy That Won't Rot (naming axes, decay vectors, identity rule, hybrid capture, governance gate). https://www.digitalapplied.com/blog/product-analytics-event-taxonomy-tracking-plan-2026
8. PostHog — The 80/20 of early-stage startup analytics (autocapture, premature-optimization warning, session replay). https://posthog.com/founders/early-stage-analytics
9. Statsig Docs — ID Resolution (ID Stitching). https://docs.statsig.com/statsig-warehouse-native/features/id-resolution
10. Snowplow — Identity Stitching: A Q&A for Data Engineers. https://snowplow.io/blog/identity-stitching-in-snowplow-a-q-a-for-data-engineers
11. Cometly — Why Server-Side Tracking Is More Accurate (revenue events, ad-blocker anecdotes). https://www.cometly.com/post/why-server-side-tracking-is-more-accurate
12. Twilio Segment — Server-side vs client-side: when to use each. https://www.twilio.com/en-us/resource-center/when-to-track-on-the-client-vs-server
13. Snowplow — Server-Side vs Client-Side Tracking: A Simple Guide. https://snowplow.io/blog/server-side-vs-client-side-tracking
14. Backlinko — Ad Blocker Usage and Demographic Statistics (2025-2026 adoption). https://backlinko.com/ad-blockers-users
15. Medium (Justine) — Amplitude vs Mixpanel vs PostHog: The Honest 2026 Comparison. https://talking-tech-with-j.medium.com/amplitude-vs-mixpanel-vs-posthog-the-honest-2026-comparison-25696721d9c5
16. AgentDeals — Analytics & Product Analytics Free Tier Comparison 2026 (PostHog vs Mixpanel vs Amplitude). https://agentdeals.dev/analytics-free-tier-comparison-2026
