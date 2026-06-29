# Funnel Analytics & Event Taxonomy Design

> Researched 2026-06-16 via a multi-agent research workflow (parallel fan-out + adversarial verification pass). This is an internal design doc, not a vendor pitch. **Vendor-blog percentages are hypotheses to A/B-test against our own data, not guarantees** - every benchmark below carries a Confidence rating, and the most-quoted SaaS-metrics figures (ad-blocker data-loss, free-tier allowances) are explicitly flagged as drifting or unaudited. Free-tier and per-event pricing numbers are 2026 snapshots and **must be re-verified before you commit to a tool** - one of them (Mixpanel) already drifted during this very check.

---

## Executive Summary

**Headline recommendation: Adopt PostHog, fire all money/lifecycle events server-side from the Laravel service layer, identify on the tenant `uuid`, and ship a deliberately small ~14-event tracking plan whose single job is to measure ONE funnel - `signup_completed → store_published → first_order_received` within 7–14 days. Do not build a Postgres-only analytics product, and do not hand-instrument clicks.**

We are a low-ACV, self-serve SMB print SaaS selling to non-technical print-shop owners. The failure mode for a team like ours is not "too little data" - it is **event sprawl, fragmented identity, and a beautiful dashboard nobody can trust**, all built before the one funnel that matters is even measured. The single North Star from [`CONVERSION_FUNNEL_RESEARCH_2026-06-15.md`](./CONVERSION_FUNNEL_RESEARCH_2026-06-15.md) - *stores with an order within 7 days* - maps to exactly one event (`first_order_received`) on exactly one identity grain (the tenant). Everything in this doc exists to measure that reliably and cheaply.

Three opinionated calls:

1. **Server-side for truth, autocapture for everything else.** Our highest-value events (signups, orders, payments) already run in the Laravel service layer. Firing them there is simultaneously *more reliable* (un-blockable) and *less work* than wiring browser instrumentation. Client-side autocapture covers low-value clicks/pageviews for free.
2. **One identity grain: the tenant.** The North Star counts *stores*, so the tenant `uuid` is the primary analytics identity, with `user_id` carried as a property. Two-moment identity (init anonymous on load, `identify()` on auth) is non-negotiable - the failure here is silent.
3. **Measure before you optimize.** Do not touch the storefront micro-funnel until the activation funnel is instrumented, segmented, and reviewed weekly. Premature funnel optimization hides the bigger problem.

---

## 1. Funnel concepts (the parts people get wrong)

### What a funnel actually counts

A funnel is **an ordered set of events measured as the % of unique users who reach each step within a conversion window**. Two things people routinely conflate:

- Funnels count **unique users, not raw events.** A user converts once per attempt. The "Insights / Totals" view uses a *different denominator* (raw event counts) and will mislead you if you read it as a funnel rate [6].
- Per-step rate **localizes the leak**; the overall rate is the product of the step rates.

```
step_conversion = unique_users_reaching_step / unique_users_reaching_prior_step
overall         = unique_users_completing_final_step / unique_users_entering_step_1
```

### Conversion window - a modeling choice, not a detail

The conversion window is the max time allowed between the first and last funnel step. Set it too short and you under-count slow-but-real conversions; too long and you over-credit unrelated later sessions to the funnel. For **Print-Flow-360 activation, a 7–14 day window matches the "first order in 7 days" North Star** - long enough to capture a print-shop owner who signs up Friday and places a real order the following week, short enough to stay honest.

> **Folklore correction (this was the most-wrong claim we checked).** A widely repeated phrasing - *"Mixpanel's conversion window runs from a 2-second floor to 90 days"* - is **fabricated by conflation** and should never be cited. Two separate facts get mashed together:
> - The **2-second figure is the near-simultaneous-step grace period** (see below), *not* a window floor.
> - The **maximum conversion window is 366 days** (12 months / 52 weeks), or 12 sessions for session-based windows, with a **default of 7 days** - *not* 90 days [1a].
> If you have seen "2s to 90d" in a slide deck, it is wrong on both ends.

### Strict vs loose (flexible) ordering

| Ordering mode | Means | Use for |
|---|---|---|
| **Strict** | Steps occur in exact sequence; out-of-order actions break the funnel | Linear flows: checkout → payment, the go-live wizard |
| **Loose (flexible)** | Steps occur in order, but other actions are allowed in between | Exploratory journeys: browse → configure → publish |

Choosing wrong **counts the wrong population entirely**. Our storefront purchase funnel is linear → strict. Our activation funnel allows wandering (a user explores products, tweaks themes, leaves, comes back) → strict-ish/loose. Mixpanel additionally applies a **2-second grace period**: consecutive steps with timestamps within 2 seconds of each other are interchangeable, so near-simultaneous events (e.g. a page-view firing microseconds before a click) don't falsely fail the order check [1].

### Multi-path funnels & segmentation - the two silent leak-fakers

- **Multi-path:** products have more than one route to value. Forcing one linear funnel through a step many users *legitimately skip* inflates that step's drop-off and produces a **false leak**. Fix: make questionable steps optional, or model separate funnels per path.
- **Segmentation:** a blended funnel hides the leak. **Always break the same funnel down** by acquisition channel, persona/vertical, device, and signup cohort to localize *where* and *for whom* it leaks [2][3]. For us: segment by `store_vertical` and `first_touch_source` at minimum.

---

## 2. Funnel benchmarks & platform facts

| Metric | Value | Confidence | Source |
|---|---|---|---|
| Mixpanel conversion-window **max** | **366 days** (12 months / 52 weeks) or 12 sessions; **default 7 days** | Solid (corrected from a fabricated "90 days") | Mixpanel Docs - Funnels Advanced [1a] |
| Mixpanel near-simultaneous-step tolerance | **2-second grace** (steps within 2s are interchangeable) | Verified | Mixpanel Docs - Funnels FAQ [1] |
| Mixpanel identity-merge lag | **up to 24 hours** (a ceiling, not a typical value) between anon and known cohorts | Verified | Mixpanel Docs - Funnels FAQ [1] |
| Amplitude tracking-plan guideline | ~10–200 events; ≤20 properties/event - *recommendation, not a hard limit* | Solid | Amplitude via Digital Applied [7] |
| GA4 hard limits | event names ≤40 chars (must start with a letter), 25 params/event, 50 event-scoped custom dimensions | Verified | GA4 platform limits via Digital Applied [7] |

> **The "2-second floor to 90 days" range is gone on purpose.** We split it into its two real facts above. The 2-second number lives *only* in the grace-period row; the window max is 366 days, default 7. Cite [1a] (Funnels Advanced) for the window - the Funnels FAQ does **not** document the range.

---

## 3. Event taxonomy - naming that won't rot

### Object-Action (`verb_noun` → `noun_verb`) naming

An event is **object (noun) + action (verb)** - e.g. `order_received`, `product_added`. The Amplitude/Mixpanel/PostHog house style is **lowercase, underscores, past tense**.

> **Folklore flag.** The "Object-Action framework" has **no single canonical inventor** - it's a shared convention documented across Amplitude [6], Mixpanel, and PostHog [8]. Don't attribute it to one vendor as proprietary IP.

### The four naming axes - lock once, enforce forever

| Axis | Our choice |
|---|---|
| **Casing** | `snake_case` (casing drift *alone* fragments metrics into duplicates) |
| **Format** | `object_action` so related events cluster alphabetically (`order_received`, `order_refunded`) |
| **Tense** | past simple (`added`, not `add`/`adding`) |
| **Vocabulary** | approved verb list (below) |

**PostHog's default restricted verb list (a strong default, not hard enforcement):** `view, click, submit, create, add, update, delete, remove, start, end, cancel, fail, send, invite, generate` [8]. *(Confidence: Solid.)*

### Two rules that prevent taxonomy explosion

1. **Event names are fixed strings - never build a name from a variable.** `order_${status}` creates a new "event" for every status and detonates the taxonomy. Variable data goes in **property values**, not names.
2. **Events vs event-properties vs user-properties:**
   - **Event** = a discrete action (`product_added`).
   - **Event property** = context of *that occurrence* (`product_type`, `price_set`).
   - **User property** = persistent attribute of the person/store (`plan`, `store_vertical`, `is_b2b`).
   - If you're tempted to split `product_added_business_cards` vs `product_added_flyers`, those are **two property values of one event**. Properties prevent sprawl.

### Event sprawl avoidance

Track **outcomes tied to business goals, not every interaction.** Over-tracking inflates volume and obscures patterns. Let **autocapture** handle low-value clicks/pageviews for free; hand-instrument **only lifecycle events.** For an SMB team, **stay near 12–15 events.**

> **Folklore flag.** Amplitude's "10–200 events / ≤20 properties per event" is **functional guidance, not an enforced platform limit** [7] - don't cite it as a rule that will reject your data. The **inverse** is true for GA4: its 40-char name and 25-param limits are **real, load-bearing constraints** - exceed them and data is dropped *silently*. If we ever dual-ship to GA4, names must fit.

### Governance - the part that actually fails

Taxonomies rot from **no enforcement gate, not from a bad spreadsheet.** The highest-cost decay modes throw **no error**: silent identity fragmentation, and orphaned events whose author left the team. Minimum viable governance:

- A **living tracking plan checked into the repo** with a **named owner per event**.
- A **PR checklist** for any tracking change.
- **Version labels** (`proposed / active / deprecated / removed`) - **never silent renames or deletes**; deprecations get a migration plan.

---

## 4. Identity - the error that throws no error

### Identity stitching (anonymous → identified)

Every browser gets an **anonymous/device id**. On signup/login you call `identify(user_id)`, which **binds the anon id to the real id and retroactively merges prior anonymous events** into that profile [9][10].

### The two-moment identity rule (non-negotiable)

1. **Init identity on first load** - bind the anonymous session.
2. **Call `identify()` after login/signup** - merge anon → known.

Skip either and you get the **highest-cost, error-free failure**: cohorts are silently wrong because one human is split across multiple ids, or many humans collapse onto one shared device. There is no exception, no log line, no red dashboard - just quietly false numbers. (Note Mixpanel's *up to 24-hour* merge lag [1] when reconciling anon vs known cohorts - don't panic at a same-day discrepancy.)

### `$set` vs `$set_once`

- `$set` **overwrites** - use for **mutable** attributes (`plan`, current subscription state).
- `$set_once` **preserves** - use for **immutable acquisition context** (`first_touch_source`).
- **Overwriting acquisition source destroys attribution permanently.** First-touch is `$set_once`, always.

### Multi-tenant identity grain (Print-Flow-360 specific)

We have **two grains: tenant/store and individual user.** Because the North Star is *stores with an order in 7 days*:

- **Primary analytics identity = tenant `uuid`.**
- Carry `user_id` as a **property**, not the identity.
- **Never expose raw uuids in user-facing labels** (per CLAUDE.md §0 - derive a human store name).

---

## 5. Server-side vs client-side capture

Client-side events pass through the browser, where **ad-blockers, ITP, and JS failures drop them**. Server-side events go straight from the backend and **cannot be blocked.** The cruel part: **the most-lost events are the highest-value ones** - signups, orders, payments [11][12][13].

**Our model is hybrid:** client-side **autocapture** for low-stakes data (pageviews, clicks, inputs - free, no manual work); **server-side** for money/lifecycle truth. Our lifecycle/revenue events already execute in the Laravel service layer, so server-side capture is both more reliable *and* less work.

```
loss_pct = (server_event_count - client_event_count) / server_event_count
```

Treat the **server count as source of truth**; the gap approximates blocker/ITP/JS loss. **Directional, not exact.**

| Metric | Value | Confidence | Source |
|---|---|---|---|
| Ad-blocker adoption | ~29.5% global, ~33% US (Q2 2025) | Solid | Backlinko (GWI data) [14] |
| Ad-blocker analytics **event-loss** | ~**25–40%** of client-side traffic *in some industries* | **Directional** - vendor-stated, **not independently audited** | Digital Applied / Cometly / Snowplow [7][11][13] |

> **Folklore flags (server-side tracking justification - use directionally only):**
> - *"Ad-blockers cause 25–40% analytics data loss"* - ad-blocker **adoption** (~29–33%) is well-measured [14], but the **event-loss** figure is vendor-stated and explicitly **unaudited**. Use it to justify server-side capture (directionally true), **not as a precise target.** (The range is 25–40% per the cited source - not the "20–40%" some decks quote.)
> - *"You lose a \$5,000 sale every time a pixel is blocked"* - vendor illustration, **not data.**
> - *"One fintech lost exactly 40% of conversions to ad-blockers"* - single uncited anecdote; directional at best.

---

## 6. Tool selection

**Recommendation: PostHog.** Generous free tier covers SMB volume, **autocapture** handles low-value clicks/pageviews for free, it **bundles funnels + session replay + feature flags**, and it's **self-hostable** (a real plus for EU / multi-tenant data posture). The feature flags also operationalize the A/B tests in §7 with no extra vendor.

**Do NOT build a Postgres-only analytics product.** We have limited eng time; reinventing funnels, identity merge, and retention math is exactly the sprawl trap this doc warns against. `mcp__postgres-test` exists for *testing the app*, not as an analytics warehouse.

| Tool | Free-tier (2026 snapshot - **re-verify before committing**) | Per-event beyond free | Confidence | Source |
|---|---|---|---|---|
| **PostHog** | ~1M analytics events/mo + 5k session replays + 1M feature-flag requests, unlimited seats | ~**\$0.00005**/event (first paid 1–2M tier; cheaper with volume), ~\$0.005/session replay | Solid (free tier) / Directional (price) | AgentDeals 2026 / PostHog [16][15] |
| **Amplitude Starter** | **50k MTUs** / 10M events/mo (MTU is the binding gate), ~1,000 replays, 12-mo retention | - | Solid | AgentDeals 2026 [16] |
| **Mixpanel** | ~**1M events/mo** (unlimited seats) | - | Directional | AgentDeals 2026 [16] |

> **Folklore / drift flags (this is exactly where free-tier folklore rots):**
> - **PostHog per-event price was overstated ~6×** in the folklore we inherited (a quoted "\$0.00031/event"). The real first-paid-tier analytics price is **~\$0.00005/event** [16]; session replay at ~\$0.005/recording is confirmed.
> - **Mixpanel switched to event-based pricing in Feb 2026.** The old "**1M MTU**" free-tier phrasing is now **wrong for new accounts** - it's **~1M events/month**; legacy MTU plans are grandfathered. This is the exact drift our caveat warned about, and it happened.
> - **Amplitude's binding constraint is the 50k MTU gate**, not the headline "10M events" - most teams hit MTUs first.
> - **All three free tiers drift frequently and sources already disagree.** Re-verify before you commit budget.

---

## 7. What this means for Print-Flow-360

This section is the operational contract. It directly **operationalizes [`CONVERSION_FUNNEL_RESEARCH_2026-06-15.md`](./CONVERSION_FUNNEL_RESEARCH_2026-06-15.md)**: the North Star *"stores with an order in 7 days"* **is** the `first_order_received` event; the behavioral upgrade trigger is `card_added` with `trigger: post_first_order`. It respects [`ACQUISITION_CHANNELS_2026-06-15.md`](./ACQUISITION_CHANNELS_2026-06-15.md) by making `first_touch_source` (`$set_once`) the primary segmentation axis.

### Instrument (do this)

1. **Fire all server-side lifecycle/revenue events from the Laravel service layer** - they already run there, so this is both more reliable than blockable client events *and* less work:
   `signup_completed`, `product_added`, `price_set`, `store_published`, `order_received` / `first_order_received` / `reorder_received`, `card_added`, `subscription_changed`.
2. **Adopt PostHog.** Autocapture for low-value events; self-hostable; bundles funnels + replay + flags.
3. **Wire identity in two moments:** init anon id on first load, call `identify(tenant_uuid)` at signup/login, `$set_once` the `first_touch_source`. Tenant `uuid` = primary grain, `user_id` = property, **never raw uuids in labels.**
4. **Build the activation North Star funnel:** `signup_completed → store_published → first_order_received`, **strict-ish ordering, 7–14 day window**, segmented by `store_vertical` and `first_touch_source`. **Review the worst-converting step weekly.**
5. **Build a second strict, short-window storefront purchase funnel:** `landing_viewed → product_added → checkout → order_received` (checkout is linear → strict).
6. **Encode variation in properties, not events** - `product_type`, `customer_type` (`guest`/`b2b`), `source` (`demo_seed`/`manual`). This connects to the existing **B2B** and **demo-seed onboarding** work without minting new events.

### The starter tracking plan (~14 events - checked in, owned, PR-gated)

Snake_case, past-tense, object_action. `S` = server-side (truth), `C` = client-side (autocapture/context). Every event has a named owner; add a new event **only when an existing one cannot answer a real question.**

| Event | Side | Key properties | User properties touched | Funnel | Owner |
|---|---|---|---|---|---|
| `landing_viewed` | C | `path`, `first_touch_source` | `$set_once first_touch_source` | purchase | Growth |
| `signup_completed` | S | `source`, `store_vertical` | `$set plan`, `$set store_vertical` | activation | Growth |
| `store_configured` | S | `step`, `fields_completed` | - | activation | Onboarding |
| `product_added` | S | `product_type`, `source` (`demo_seed`/`manual`), `price_set` (bool) | - | activation | Catalog |
| `price_set` | S | `product_type`, `strategy` | - | activation | Pricing |
| `store_published` | S | `time_since_signup_hours`, `product_count` | - | activation | Onboarding |
| `checkout` | S | `cart_value`, `customer_type` (`guest`/`b2b`) | - | purchase | Commerce |
| `order_received` | S | `product_type`, `customer_type`, `amount`, `currency` | - | purchase | Commerce |
| `first_order_received` | S | `time_since_publish_hours`, `store_vertical` | `$set activated true` | **North Star** | Commerce |
| `reorder_received` | S | `days_since_last_order` | - | retention | Commerce |
| `card_added` | S | `trigger` (`post_first_order`/`manual`) | - | monetization | Billing |
| `subscription_changed` | S | `from_plan`, `to_plan`, `reason` | `$set plan` | monetization | Billing |
| `support_requested` | S | `channel`, `topic` | - | support | Support |
| `design_saved` | C/S | `template_used` (bool) | - | retention | Studio |

### Time-to-value (surface as properties, not new events)

```
ttv = timestamp(first_order_received) - timestamp(signup_completed)
```

Carry `time_since_signup_hours` / `time_since_publish_hours` as event properties. This is our core activation latency and the reason the window is 7–14 days.

```
activation = stores reaching store_published AND first_order_received within 7-14d / signups
```

The **one funnel to review weekly**, segmented by `store_vertical` and `first_touch_source`.

### Ignore (do NOT do this - it's the sprawl trap)

- **Do NOT hand-instrument** per-button clicks, scroll depth, heatmaps, or per-field form analytics. **Autocapture + session replay cover these for free**; manual instrumentation here *is* the sprawl.
- **Do NOT optimize the storefront micro-funnel** before the activation funnel is measured and healthy - premature funnel optimization hides bigger problems [8].
- **Do NOT build a Postgres-only analytics product.**
- **Do NOT build event names from variables** (`order_${status}`) or split one action into per-value events.

### A/B test (on our own funnel only - these are hypotheses, not facts)

1. **Activation conversion-window length** - does 7 vs 14 days materially change the measured activation rate, and which better predicts retained stores?
2. **Behavioral vs calendar `card_added` trigger** - `trigger: post_first_order` (behavioral) vs a calendar-day prompt.
3. **Demo-seed vs blank-start** - effect of a seeded demo store on the `product_added → store_published` step (use the `source: demo_seed` property, no new event).

### Governance gate (the PR checklist)

Any tracking change must, in the PR:

- [ ] Use a **fixed-string** event name (no variables); `snake_case`, past-tense, approved verb.
- [ ] Type every property; encode variation as **property values**, not new events.
- [ ] Set the **owner** field.
- [ ] For changes: apply a **version label** (`proposed / active / deprecated / removed`) - **no silent renames**; deprecations include a migration plan.
- [ ] Confirm identity: anon-init present, `identify(tenant_uuid)` on auth, `first_touch_source` via `$set_once`.

---

## Sources

1. Mixpanel Docs - Funnels FAQ (2-second grace period, up-to-24h merge lag): https://docs.mixpanel.com/docs/reports/funnels/funnels-faq
1a. Mixpanel Docs - Funnels Advanced (conversion-window range: max 366 days / 12 sessions, default 7 days): https://docs.mixpanel.com/docs/reports/funnels/funnels-advanced
2. Amplitude - Three Steps to Increase Your Conversion Rate Using Funnels: https://amplitude.com/blog/three-steps-to-increase-your-conversion-rate-using-funnels
3. CleverTap - Funnel Analysis: Increase Conversions with funnel analytics: https://clevertap.com/blog/funnel-analysis/
4. Quadratic - Funnel Analysis 101: From Signup to Activation (and Beyond): https://www.quadratichq.com/blog/funnel-analysis-from-signup-to-activation-and-beyond
5. UXCam - Conversion Funnel Analysis: A Complete Guide for 2026: https://uxcam.com/blog/conversion-funnel-analysis/
6. Amplitude - What Is Event Taxonomy: Complete Definition & Framework: https://amplitude.com/explore/data/event-taxonomy
7. Digital Applied - Product Analytics: An Event Taxonomy That Won't Rot (Amplitude guidance, GA4 limits, ad-blocker loss): https://www.digitalapplied.com/blog/product-analytics-event-taxonomy-tracking-plan-2026
8. PostHog - The 80/20 of early-stage startup analytics (verb list, premature optimization): https://posthog.com/founders/early-stage-analytics
9. Statsig Docs - ID Resolution (ID Stitching): https://docs.statsig.com/statsig-warehouse-native/features/id-resolution
10. Snowplow - Identity Stitching: A Q&A for Data Engineers: https://snowplow.io/blog/identity-stitching-in-snowplow-a-q-a-for-data-engineers
11. Cometly - Why Server-Side Tracking Is More Accurate: https://www.cometly.com/post/why-server-side-tracking-is-more-accurate
12. Twilio Segment - Server-side vs client-side: when to use each: https://www.twilio.com/en-us/resource-center/when-to-track-on-the-client-vs-server
13. Snowplow - Server-Side vs Client-Side Tracking: A Simple Guide: https://snowplow.io/blog/server-side-vs-client-side-tracking
14. Backlinko - Ad Blocker Usage and Demographic Statistics: https://backlinko.com/ad-blockers-users
15. Medium (Justine) - Amplitude vs Mixpanel vs PostHog: The Honest 2026 Comparison: https://talking-tech-with-j.medium.com/amplitude-vs-mixpanel-vs-posthog-the-honest-2026-comparison-25696721d9c5
16. AgentDeals - Analytics & Product Analytics Free Tier Comparison 2026 (re-verify; drifts): https://agentdeals.dev/analytics-free-tier-comparison-2026

---

*Maintenance: free-tier and per-event pricing in §6 are 2026 snapshots and drift often - re-verify before budgeting. If you change the tracking plan in §7, update this doc in the same PR (the plan is the source of truth, not a screenshot of the PostHog UI).*
