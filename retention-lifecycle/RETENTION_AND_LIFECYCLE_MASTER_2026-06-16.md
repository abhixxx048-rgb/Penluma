# Retention & Lifecycle - Master Index & Cross-Cutting Roadmap

> **Date:** 2026-06-16 · **Status:** Research-only. Nothing in this master or its five linked docs has been built. This is a planning spine, not a changelog.
> **Theme:** How Print-Flow-360 keeps the customers it already has - both the **tenants** it sells the SaaS to, and the **end-customers** those tenants sell print to. Retention is cheaper than acquisition and compounds into NRR; this master ties five independent research streams into one sequenced plan so we build shared infrastructure once instead of five times.

---

## TL;DR

Five 2026-06-16 research docs each tackle a slice of retention and lifecycle: **onboarding/activation**, **lifecycle & behavioral email**, **dunning / involuntary churn**, **NPS/CSAT & health scoring**, and a **community moat**. Read individually they look like five separate builds. Read together, they collapse onto **two shared platforms** - a triggered **journey/automation engine + event bus**, and a **health-score/signals layer** - that nearly every topic depends on. The revenue-protective work (onboarding activation, dunning) is P0; the shared lifecycle-email engine is the P1 platform that unblocks NPS delivery, win-back, and nudges; health scoring is P1; community is the P2 long-horizon NRR play. Everything is framed by **two audiences**: the platform retaining tenants (Audience-1) and store owners retaining their end-customers (Audience-2) - and the docs are strict about never letting Audience-1 plumbing leak into Audience-2 tenant-scoped engines (or vice versa).

---

## Index - the five docs

| # | Doc | One-line hook |
|---|-----|---------------|
| 1 | [`RETENTION_CUSTOMER_SUCCESS_ONBOARDING_2026-06-16.md`](./RETENTION_CUSTOMER_SUCCESS_ONBOARDING_2026-06-16.md) | The setup checklist exists but onboarding "done" stops at setup, not the first-order activation event - and its state lives in browser localStorage with zero landlord visibility. |
| 2 | [`RETENTION_LIFECYCLE_BEHAVIORAL_EMAIL_2026-06-16.md`](./RETENTION_LIFECYCLE_BEHAVIORAL_EMAIL_2026-06-16.md) | Strong broadcast campaigns + a one-shot automation engine, but no journey/drip engine, no behavioral triggers (abandoned cart, win-back), and no per-recipient enrolment or frequency cap. |
| 3 | [`RETENTION_DUNNING_INVOLUNTARY_CHURN_2026-06-16.md`](./RETENTION_DUNNING_INVOLUNTARY_CHURN_2026-06-16.md) | Stripe retries cards, but nothing local consumes the failure webhooks - `charge_failed` is never written, `BillingService::renew()` is never scheduled, and there's no card-expiry warning or self-serve card update. |
| 4 | [`RETENTION_NPS_CSAT_HEALTH_SCORING_2026-06-16.md`](./RETENTION_NPS_CSAT_HEALTH_SCORING_2026-06-16.md) | No survey or health-score spine for either audience today; the Action Center rule engine + a 90-day at-risk proxy + existing delivery rails are a strong foundation for a shared survey spine and two HealthScoreService classes. |
| 5 | [`RETENTION_COMMUNITY_MOAT_2026-06-16.md`](./RETENTION_COMMUNITY_MOAT_2026-06-16.md) | The two hardest raw materials for a community moat already exist (the designer template engine over one shared `designer_documents` table, and a half-built `PlatformInquiry` intake) - turning them into a community template library + public roadmap/voting is mostly additive. |

---

## The two-audiences lens (the organizing frame)

Every retention decision in this master sorts into exactly one of two audiences. Confusing them is the recurring failure mode the docs warn against.

| | **Audience-1 - Platform ↔ Tenant** | **Audience-2 - Store owner ↔ End-customer** |
|---|---|---|
| Who churns | The store owner (our paying SaaS tenant) | The shopper buying print from a tenant's store |
| Churn metric | Logo churn / NRR / MRR | Repeat-purchase rate / customer LTV |
| Owned by | Landlord / System jobs (`app/Jobs/System`, `resources/views/emails/system`) | Tenant-scoped engines (`Automation`, `Journey`, campaigns) |
| Topics that serve it | Onboarding activation, dunning, **tenant** health, community | Lifecycle/behavioral email (abandoned cart, win-back), **customer** health, NPS/CSAT to shoppers |
| Hard rule | Never run landlord dunning/nudges through the tenant `Automation` engine or `PAYMENT_FAILED` template (wrong audience) | Never let cross-tenant community data leak past `BelongsToTenant`; never show tenant UUIDs as authorship |

Several topics have **both** an Audience-1 and an Audience-2 face (notably health scoring and lifecycle journeys). The plan keeps them as separate code paths sharing a common substrate, never one engine straddling both.

---

## Cross-cutting view - build once, reuse many

The five docs independently converge on the same two pieces of shared infrastructure. Building these first turns four of the five topics from "new system" into "new caller."

### Shared platform A - Triggered journey/automation engine + event bus

The single highest-leverage shared build. It extends the existing one-shot automation substrate (reuse `ActionExecutor.php` and its `[token]` parser **verbatim**) into a multi-step, delayed, per-recipient journey engine.

**Depends on it:**
- **Doc 2 (lifecycle email)** - *is* this engine: `Journey` / `JourneyStep` / `JourneyEnrolment` (HasUuid + BelongsToTenant), `ProcessJourneyStepJob` with delayed dispatch, abandoned-cart recovery as the flagship journey.
- **Doc 4 (NPS/CSAT)** - delivers transactional surveys via the same rails: add an `order_delivered` trigger, embed the first question in email; no new delivery engine.
- **Doc 1 (onboarding)** - proactive nudge sequences (Day 3 / Day 7 stalled-onboarding) ride the same trigger/job pattern, on the **landlord** side as System jobs.
- **Doc 3 (dunning)** - the landlord dunning email sequence is structurally the same delayed-step pattern, again as System jobs (Audience-1), explicitly **not** the tenant journey engine.
- **Doc 5 (community)** - close-the-loop voter notifications and changelog posts ride the same notification rails.

**Two hard prerequisites called out by multiple docs:**
1. **`QUEUE=sync` → Redis.** Delayed steps are *impossible* on the sync driver. Docs 2, 3, and 5 all gate their first shippable journey/job on this. Do it first.
2. **A shared `CommunicationGuard` (frequency-cap + suppression).** Consulted by campaigns, automations, AND journeys before any non-transactional send; enforces a per-recipient monthly cap and 60–90 day sunset (`EmailSuppression` + `EmailSendLedger`). Transactional sends (dunning, order, NPS-on-delivery) are exempt. Build it alongside the engine so the first journey can't spam.

### Shared platform B - Health-score / signals layer

A weighted-signal scoring service that persists nightly bands and drives Action Center alerts - built **twice** (one per audience) but as one pattern.

**Depends on it / feeds it:**
- **Doc 4** owns the build: `CustomerHealthService` (Audience-2: Activity 40 / Engagement 30 / Milestones 20 / Recency 10, bands Green 75–100 / Yellow 40–74 / Red 0–39) and `TenantHealthService` (Audience-1).
- **Doc 1** asks for exactly a `TenantHealthService` for first-90-day at-risk detection - same service Doc 4 specifies. Build once.
- **Doc 3** contributes a signal both ways: a `charge_failed` / card-failure event is 20–40% of churn and must fold into both health scores.
- **Doc 4** evolves the existing `AtRiskCustomersRule.php` to read the persisted band instead of the lone 90-day recency check - richer at-risk feed, zero new frontend.

### Smaller shared primitives
- **Event taxonomy** - `cart_abandoned`, `order_delivered`, `first_order_placed`, `customer_dormant`, `order_delivered` (NPS), `charge_failed`, `onboarding_step_completed`, `first_order_at`. Defining these once in `TriggerTypeEnum` (and the System-side equivalents) lets journeys, surveys, health signals, and Action Center rules all subscribe.
- **Action Center as the universal "now what"** - onboarding (`OnboardingIncompleteRule`), at-risk customers (health band), and detractor NPS responses all surface through the existing rule engine. One alert surface, many producers.

---

## Unified phased roadmap (P0 → P2, sequenced across all five docs)

Ordering principle: **protect revenue first**, then **build the shared platform that unblocks everything**, then **instrument**, then **moat**. Within a phase, dependencies dictate order.

### P0 - Revenue-protective + foundations (do these first)

| Item | Doc | Audience | Why now |
|------|-----|----------|---------|
| **Move `QUEUE=sync` → Redis** | 2,3,5 | infra | Hard prerequisite for every delayed job/journey below. Nothing lifecycle ships without it. |
| **Persist onboarding state server-side** (`StoreOnboardingProgress` + `OnboardingProgressService`, per-step timestamps, `first_order_at`); rewire `useSetupChecklist.ts` off localStorage | 1 | A1 | Fixes per-device reset; unlocks landlord CS visibility + every onboarding metric. |
| **Redefine "done" = store-live AND first-order**; add non-dismissible "Receive your first order" milestone; kill the 30-day hard expiry while not-live | 1 | A1 | The actual activation event. Stops counting setup as success. |
| **"Place a test order" path** (reuse seeded demo product + `WELCOME10` + offline payment; extend `is_demo` to orders) | 1 | A1 | Time-to-first-value <24h without waiting on a real shopper. |
| **Make subscription failures observable** - extend `PaymentEventDispatcher` to consume Stripe `invoice.payment_failed/paid`; finally write `Subscription.status='charge_failed'`; add the missing `subscriptions.gateway_subscription_id` migration | 3 | A1 | Today the failure path is dead. Can't dun what you can't see. |
| **`SubscriptionStateService`** (active→past_due→grace→suspended→cancelled) with configurable 7–14 day grace, soft-vs-hard suspension, cache invalidation, audit logs/events | 3 | A1 | Replaces the 1-day inline grace; the spine all dunning hangs off. |

### P1 - The shared lifecycle platform + instrumentation

| Item | Doc | Audience | Why here |
|------|-----|----------|---------|
| **Journey engine** - `Journey`/`JourneyStep`/`JourneyEnrolment` extending the automation substrate, reusing `ActionExecutor` + token parser; `ProcessJourneyStepJob` delayed dispatch; `journeys:tick` cron | 2 | A2 | The shared platform (A). Unblocks abandoned-cart, win-back, NPS delivery. |
| **Lifecycle triggers** in `TriggerTypeEnum` (`cart_abandoned`, `order_delivered`, `first_order_placed`, `customer_dormant`) with de-dup enrolment + exit conditions | 2 | A2 | The event taxonomy every downstream subscriber needs. |
| **Abandoned-cart recovery** as the flagship journey (3 steps ~1h/24h/72h, exit on order_placed), seeded DISABLED | 2 | A2 | ~76% of automation revenue; highest single-gap ROI. |
| **`CommunicationGuard`** frequency-cap/suppression layer | 2 | both | Gate before the first journey can spam; reused by campaigns + automations. |
| **Pre-dunning: `NotifyCardExpiringJob`** (mirror `NotifyTrialExpiringJob`, ~30 days before `expiration_date`, one-click update-card) | 3 | A1 | Highest-ROI/lowest-effort dunning; data already stored. |
| **Print-Flow-owned retry loop** - `RetrySubscriptionChargeJob` + `billing:run-dunning` (Day 1/3/5/7), gated by per-gateway capability flag (trust Stripe Smart Retries; drive Razorpay/PayPal/AuthorizeNet/PayTM) + 4-step dunning emails + self-serve recovery page | 3 | A1 | Reclaims the 50–65% of involuntary churn good dunning recovers. |
| **Landlord-side journeys** as System jobs - new-tenant welcome/activation, go-live nudges, stalled-onboarding Day 3/7 (`NotifyStalledOnboardingJob` + `ONBOARDING_NUDGE` template), dunning sequence | 1,2,3 | A1 | The tenant engine can't serve Audience-1; these are separate scheduled jobs. |
| **Shared survey spine** - `Survey` + `SurveyResponse` (UUID, BelongsToTenant, Postgres CHECK enums), `SurveyService` computing NPS/CSAT/CES + persistence Feature test (silent-lie rule) | 4 | both | The instrumentation layer; delivered via the P1 journey rails. |
| **Survey delivery via existing rails** - `order_delivered` trigger for transactional NPS (first question embedded in email); `SendTenantOnboardingCsatJob` 7–10 days after `seedAll` | 4 | both | No new engine; reuses platform A. |
| **`CustomerHealthService`** (signal-stack, nightly persist to `customer_health_scores`, bands) + evolve `AtRiskCustomersRule` to read the band | 4 | A2 | Shared platform B, Audience-2 side; richer at-risk feed, no new UI. |
| **`TenantHealthService`** for SaaS churn; fold `charge_failed` into both scores; wire detractor (NPS≤6) responses into Action Center + Activity logs | 1,3,4 | A1 | Platform B, Audience-1 side - satisfies Doc 1's request too. Score change always triggers an action. |
| **In-app Help slide-over + step explainers + 3–5-stop first-run tour**; replace 30-day expiry with Action Center escalation (`OnboardingIncompleteRule`) | 1 | A1 | Self-serve activation support; closes the onboarding loop. |

### P2 - Long-horizon moat (12–18 month payoff)

| Item | Doc | Audience | Why last |
|------|-----|----------|----------|
| **Public Roadmap + Feature Voting** - extend `platform_inquiries` (plain-language status enum) + new `feature_votes` table + `votes_count`; `RoadmapService`; one-click vote; mandatory close-the-loop voter notifications | 5 | A1 | Highest-ROI community primitive; data model half-built; rides P1 notification rails. |
| **Cross-Tenant Community Template Library** on `DesignerTemplate` - additive `is_published_to_community` / `author_tenant_id` / `community_status` (default-false = byte-identical), `CommunityTemplateService` bypassing `BelongsToTenant` via `withoutGlobalScope`, clone-to-account, `usage_count` ranking | 5 | A1 | Cheap (one shared `designer_documents` table) but value compounds slowly. |
| **Moderation + silent-leak test shipped WITH the library** - pending/approved/rejected, landlord review queue, store-name attribution (never tenant UUIDs), explicit cross-tenant invisibility test | 5 | A1 | Non-negotiable safety; not a follow-up. |
| **Changelog + peer Q&A/comments on community templates** (~73% support-deflection potential), Ambassador badge from `usage_count`; then anonymized cross-tenant benchmarking metrics via nightly `routes/console.php` command | 5 | A1 | Longest horizon; feeds the (absent) support spine. |
| **DEFER standalone forum** (Discord/Slack/Circle) - validate any chat community off-platform first | 5 | A1 | Community needs 12–18 months; lead with in-product primitives. |

---

## Success metrics rollup

**North Star (Audience-1):** **% of new tenants reaching store-live + first order within 7 days** - the activation event Doc 1 redefines "done" around. Retention compounds from this single moment.

**Supporting North Star (Audience-2):** **end-customer repeat-purchase rate** within tenant stores - the downstream metric the lifecycle engine, win-back journeys, and customer health scores all move.

| Topic | Primary metric(s) |
|-------|-------------------|
| Onboarding / CS (Doc 1) | Activation rate (live + first order ≤7d); time-to-first-value (<24h target via test order); % tenants Activated vs Stalled vs At-Risk; first-90-day churn. |
| Lifecycle / behavioral email (Doc 2) | Abandoned-cart recovery rate (target ~the ~76%-of-automation-revenue gap); journey-attributed revenue; per-recipient send frequency within cap; win-back reactivation rate. |
| Dunning / involuntary churn (Doc 3) | Involuntary-churn recovery rate (target 50–65%); failed-payment → recovered %; card-expiry pre-dunning save rate; dunning email → update-card conversion. |
| NPS/CSAT/Health (Doc 4) | NPS / CSAT / CES scores + response rate (email-embedded first question lift); health-band distribution (Green/Yellow/Red) and band-transition rate; detractor → Action Center → resolved loop. |
| Community moat (Doc 5) | Feature-vote participation + close-the-loop notification rate; community templates published/cloned; `usage_count`-ranked adoption; support-deflection % from peer Q&A; tenant NRR lift over 12–18 months. |

---

## How to use this master

1. **Start at P0.** `QUEUE→Redis` first, then the onboarding-activation and dunning-observability builds - they protect revenue and unblock everything.
2. **Build the two shared platforms (A: journey engine + event bus, B: health/signals) once.** Resist building topic-specific versions; four of five topics are callers, not owners.
3. **Keep the two audiences in separate code paths** sharing the substrate - never one engine straddling both, never landlord plumbing in the tenant engine.
4. **Read the source doc before building any item** - each links to concrete models, services, routes, and file paths following the codebase's UUID / `BelongsToTenant` / service-layer / silent-lie-test conventions. This master sequences; the source docs specify.
