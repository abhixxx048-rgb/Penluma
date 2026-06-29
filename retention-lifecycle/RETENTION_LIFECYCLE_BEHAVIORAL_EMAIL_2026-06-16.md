# Lifecycle & Behavioral Email (Triggered Journeys) for Print-Flow-360

> **TL;DR** — Print-Flow-360 has strong *broadcast* email (one-shot campaigns with RFM-style segmentation) and a *single-shot* event→action automation engine, but it has **no journey/drip engine** at all: no multi-step sequences, no time-delay steps, no per-recipient enrolment state, and no behavioral lifecycle triggers (abandoned cart, post-delivery, win-back, trial activation). The single highest-ROI gap is abandoned-cart recovery (industry: ~76% of automation revenue). The recommended path is to **extend the existing automation substrate** (reuse `ActionExecutor.php` + the `[token]` parser) into a new tenant-scoped `Journey` / `JourneyStep` / `JourneyEnrolment` model trio, add lifecycle triggers, add a `journeys:tick` cron, and ship abandoned-cart recovery as the flagship journey — gated behind a global frequency-cap / suppression layer so the three independent senders can't collectively spam a buyer.
>
> **Status: research-only (nothing built yet).** This document is an implementation map for a later engineer. No code, migrations, or seeders have been created.

---

## 1. Why this matters for a non-technical-store-owner print SaaS

Print-Flow-360's primary users are non-technical print-shop owners who do not run marketing-ops the way a SaaS growth team would. They will never hand-build a 5-email drip in a journey canvas. The product's job is to ship **opinionated, pre-seeded, opt-in default journeys** that recover revenue and retain customers automatically — the owner flips one toggle, not configures a state machine.

Two things make this acute for a print SaaS specifically:

1. **Print is a consumable-reorder business.** Business cards, flyers, letterheads, banners, and stationery reorder on predictable cycles. A reorder-reminder timed to a consumable is free revenue that today nobody collects — the order conversation literally ends at `ORDER_SHIPPED` (see Gaps).
2. **Cart abandonment is structural in custom-print checkout.** Configuring a product (size, stock, finish, uploading artwork, proofing) is high-friction; shoppers bail mid-flow constantly. Cart rows already accumulate in `app/Models/Cart.php` and are **never acted on**. Abandoned-cart recovery is the single highest-leverage automation in e-commerce and it is entirely absent here.

Because the audience is non-technical, every journey must obey CLAUDE.md §0: plain-language delay labels ("Wait 1 day", not `delay_minutes: 1440`), human empty/loading/error states, opt-in defaults seeded **disabled** so nobody is surprised by sends, and confirmation-with-consequences on enable ("This will email customers who abandon a cart, up to 3 times over 3 days.").

---

## 2. The two audiences — and which applies

Lifecycle email in this platform splits cleanly into two audiences that **cannot share plumbing**:

| Audience | Direction | Who sends → who receives | Tenant context | Existing engine |
|---|---|---|---|---|
| **Audience 1** | Platform → Tenant (landlord-side) | Print-Flow-360 → store owner | **Landlord / central DB.** Tenant-scoped engines cannot serve this. | Only `NotifyTrialExpiringJob` + a handful of `app/Jobs/System/*` one-shots driven by `AccountStatusService` |
| **Audience 2** | Tenant → End-customer (store-side) | A store → its shoppers | **Tenant-scoped** (`BelongsToTenant`, host-resolved) | Broadcast campaigns + single-shot Automation engine |

**Both apply, and both have journey gaps — but they need separate engines.** The tenant `Automation`/`Journey` engine is `BelongsToTenant` and runs inside tenant context; it physically **cannot** enrol or email a store owner (Audience 1). Audience-1 lifecycle (welcome/activation, go-live nudges, dunning, post-trial win-back) must be built as **landlord-side scheduled System jobs** alongside `NotifyTrialExpiringJob` — not bolted onto the tenant journey engine.

A third, separate concern is **transactional email** (order placed, payment failed, shipped). That is `EmailService` + `EmailTemplateEnum` and must stay **exempt from frequency capping** — never throttle a payment-failed or order-shipped mail.

---

## 3. What already exists in the codebase

### 3.1 Broadcast campaign engine (Audience 2) — fully built, but one-shot
- `app/Services/EmailCampaign/EmailCampaignService.php` — create / schedule / send-now, with an empty-audience guard.
- `app/Services/EmailCampaign/AudienceFilterResolver.php` — already does **RFM-style segmentation**: `min_orders`, `last_order_after/before`, `order_activity`, `account_type`, `tag_ids`, `newsletter`, `verified`, product-bought. This is reusable as journey *audience scope* and *exit conditions*.
- `app/Services/EmailCampaign/CustomerSegmentService.php` — saved segments with a cached `last_count`.
- `app/Jobs/EmailCampaign/SendEmailCampaignJob.php` — dispatch worker.
- Scheduled by `email-campaigns:dispatch-scheduled` (everyMinute) in `routes/console.php`.

> This is **broadcast / one-shot**, not a multi-step journey. There is no concept of "step 2 of 3" or "wait 24h then send".

### 3.2 Single-shot automation engine (Audience 2) — closest thing to triggered email
- `app/Services/Automation/TriggerDispatcher.php::dispatch(trigger, Model, tenant)` → finds enabled `Automation` rows → `ConditionValidator` → `ProcessAutomationJob` → `ActionExecutor`. ~25 confirmed dispatch call sites (`OrderService.php:82`; Order/Invoice/Quote model boot hooks; Quote/Invoice/Order/Payment/PrintJob controllers; 3 scheduled commands).
- `app/Services/Automation/ActionExecutor.php` — does `[token]` placeholder parsing (`parse()` at line ~177) over customer/billing/shipping/job relations, sends via `EmailService::mailer` with `trigger_source='automation'` metadata; also supports SMS via `SmsService`. **Fires all actions synchronously inside one job — no delay handling.**
- `app/Jobs/ProcessAutomationJob.php` — queue worker.
- `app/Models/Automation.php` — `BelongsToTenant` + `$guarded = []`.

**Schema is thin (`database/migrations/2025_05_26_060514_create_automations_table.php`):** only `tenant_id`, `name`, `trigger` (string), `conditions` (json), `actions` (json), `action_details` (json), `enabled`, `sort_order`. The `2026_06_05` migration added `last_run_at` + `run_count`. **No delay / step / sequence / branch / enrolment columns.**

**Trigger vocabulary is business-document only** (`app/Enums/Automation/TriggerTypeEnum.php`): `status_changed`, `paid_in_full`, `approval_type_approved`, `approval_type_declined`, `task_completed`.

**Action vocabulary** (`app/Enums/Automation/ActionTypeEnum.php`): `send_email_text`, `request_approval`, `change_status` implemented; **`assign_task` + `request_payment` are DECLARED in the enum but NOT implemented** (the `ActionExecutor` `match()` has no arms for them → silent no-op). This is a §0 "no half-built UI / silent-lie" violation a journey-action expansion should fix or hide.

### 3.3 Transactional email (Audience 1 + 2)
- `app/Services/EmailService.php` → `EmailProviderManager` (SendGrid → Postmark → SMTP fallback).
- 15 templates in `app/Enums/EmailTemplateEnum.php` (`ORDER`, `ORDER_SHIPPED`, `ORDER_STATUS_UPDATE`, `PAYMENT_FAILED`, `QUOTE_EXPIRY_REMINDER`, `ACCOUNT_CREATED`, …) resolved store→tenant→none via `app/Services/Email/EmailTemplateResolverService.php`, seeded by `app/Jobs/Tenant/SeedTenantEmailTemplates.php`.

### 3.4 Platform → Tenant retention (Audience 1) — almost uninstrumented
- **The only proactive lifecycle nudge:** `app/Jobs/System/NotifyTrialExpiringJob.php` (scheduled dailyAt 08:00; notifies at the configured window + 1-day mark via `emails.system.trial-expiring`).
- Other tenant-lifecycle one-shots in `app/Jobs/System/`: `NotifyTenantApproved/Blocked/Deactivated/Reactivated`, `NotifyAdminPendingApprovals` — driven by `app/Services/Admin/AccountStatusService.php`.
- `app/Services/BillingService.php` has `renew()` but **no cron auto-invokes it**; `charge_failed` status is read by middleware but triggers **no email drip** (no dunning).

### 3.5 Building blocks already present for new lifecycle triggers
- **Abandoned cart:** `app/Models/Cart.php` + carts migration carry `tenant_id`, `customer_id`, `session_id`, `coupon_code`, `updated_at` — **sufficient to detect abandonment today.**
- **Dormancy / win-back:** `app/Models/Customer.php` has a `last_login_at` cast + `orders()` / `wishlists()` relations — sufficient for dormancy segmentation. `app/Models/Wishlist.php` exists; reorder route at `routes/frontstore.php:413`.
- **External-ESP escape hatch:** `app/Services/Integrations/Marketing/MarketingSyncService.php` → Mailchimp / Klaviyo with `trackEvent()`, pushed on `Customer::created` via `SyncCustomerToMarketingJob` (owners can run journeys in an external ESP today).
- **Scheduler seam:** `routes/console.php` already runs many everyMinute/daily crons (`email-campaigns:dispatch-scheduled`, `campaigns:dispatch-due`, `send:task-reminders`, `action-center:digest`). A new `journeys:tick` slots in here.
- **Fan-out:** `app/Jobs/Notification/SendAppNotification.php` (email/sms/push per subscription).

---

## 4. Gaps

1. **No journey/drip engine of any kind.** No model represents a multi-step sequence (trigger → wait → step → branch). The Automation engine is strictly event→one-action: no time-delay steps, no multi-step sequences, no branching, no per-recipient enrolment/state tracking.
2. **No lifecycle/behavioral triggers exist.** `TriggerTypeEnum` has no `cart_abandoned`, `order_delivered`, `customer_dormant`, `first_order_placed`, `milestone_reached`, `signup_completed`, `feature_not_adopted`. These events are never dispatched — the order conversation ends at `ORDER_SHIPPED`.
3. **No abandoned-cart recovery.** No detector job, no cart→email trigger, no recovery template, no journey. Cart rows accumulate and are never acted on. **Highest-ROI gap** (abandoned-cart ≈ 76% of automation revenue).
4. **No post-purchase / post-delivery journey.** No `order_delivered` event, no review-request email, no NPS/CSAT survey (confirmed: no model/job/template), no reorder reminder for consumable print products.
5. **No win-back / re-engagement / dormancy drip**, and **no frequency-capping or suppression layer.** Campaigns + automations + any future journey can each email the same customer with no global cap, no per-recipient send ledger, no cross-system unsubscribe/suppression check → deliverability + complaint risk.
6. **Platform→Tenant (Audience 1) is almost entirely uninstrumented.** Only `NotifyTrialExpiringJob`. No welcome/activation series, no go-live/setup-completion nudges, no feature-adoption prompts, **no dunning/failed-payment retry sequence** (`BillingService.renew()` exists but no cron invokes it; `charge_failed` triggers no email), no post-trial win-back. The tenant engine cannot serve Audience 1 — landlord-side plumbing must be built separately.
7. **Per-recipient enrolment state is absent.** No way to know a customer is on step 2 of 3, no de-dup (re-triggering re-enrols), no exit conditions (stop win-back if they order mid-sequence), no per-journey analytics (sent/opened/converted).
8. **`QUEUE=sync` in dev/prod** (project memory). Any delayed-step engine **requires Redis with delayed dispatch** — the sync driver makes delays impossible and is a reliability risk. **This must be fixed first.**
9. **`assign_task` + `request_payment` silently do nothing** — advertised in the enum/UI but the `ActionExecutor` `match()` default returns null. §0 silent-lie violation; fix or hide while expanding journey actions.

---

## 5. Best practices & benchmarks

- **Behavioral triggers beat calendar drips ~3–5× on CTR** because they fire at the moment of intent/inaction. Treat email as a behavioral channel keyed to product events, not a broadcast calendar. — *mailsoftly.com/blog/email-marketing-for-saas; tabular.email/blog/saas-email-sequences*
- **Lifecycle is a discipline:** Onboarding → Activation → Retention → Expansion/Win-back; each stage gets its own triggered sequence adapting to feature usage/milestones, with distinct messaging for engaged vs inactive users (especially trial conversion). — *growth.cx/blog/saas-email-marketing-practices; mailsoftly.com*
- **Abandoned cart cadence:** first email within **30–60 min** of abandonment, then a **2–3 email series over ~3 days** (avg ~17h gap to email 2), each with a different angle (reminder → benefit → incentive). A 3-email series lifts conversion **~34%**; cart emails drove **~76% of automation revenue**; global cart abandonment hit **~75% in 2025**. — *omnisend.com/blog/abandoned-cart-email; targetbay.com/abandoned-cart-email; rejoiner.com*
- **Frequency capping is mandatory:** enforce a global per-recipient cap (opt-in lists ~**4–8/month**; reducing promo cadence can cut complaint rate **60%+**) across **all** senders, plus sunset/suppression removing or quieting contacts after **60–90 days** of no engagement; clean lists quarterly. Capping + throttling + send-time optimization protect deliverability. — *mailreach.co/blog/email-frequency-best-practices; validity.com; machine-marketing.com*
- **A real lifecycle platform combines** full-funnel automation, visual journey mapping, real-time behavioral triggers, and **lifecycle-stage state management** — i.e. journeys need per-contact enrolment state, not fire-and-forget. — *saasemailplatforms.com/category/lifecycle-email; htmlemailbuilders.com*
- **SaaS trial-conversion sequences** should reinforce value, add social proof, and escalate urgency as the trial ends, branching on engagement — directly applicable to Print-Flow-360's 14-day trial (Audience 1). — *mailsoftly.com; growth.cx*

---

## 6. Recommended architecture for THIS codebase

**Guiding principle: extend the existing automation substrate, don't reinvent it.** Reuse `ActionExecutor.php` for step execution and the `[token]` `parse()` logic *verbatim*. Follow CLAUDE.md: `HasUuid` + `BelongsToTenant`, `FormRequest → Service → Resource`, business logic in `app/Services/Journey/`, composables in front-end, Pinia for state, `CacheServiceInterface` + `StoreHelper` (never the `Cache` facade), tests for every Service method.

### 6.1 New tenant-scoped models (Audience 2)

All three: `HasUuid` + `BelongsToTenant`. PostgreSQL schema (no MySQL-specific SQL; `enum()` compiles to a CHECK constraint).

**`Journey`** — the sequence definition.
| Column | Type | Notes |
|---|---|---|
| `id` | bigint PK | |
| `uuid` | uuid, unique | routes/URLs use uuid (CLAUDE.md) |
| `tenant_id` | fk | `BelongsToTenant` |
| `name` | string | |
| `trigger` | string | new `TriggerTypeEnum` value |
| `conditions` | jsonb | reuse `AudienceFilterResolver` shape |
| `exit_conditions` | jsonb | e.g. stop win-back on `order_placed` |
| `audience_scope` | jsonb | optional segment scope |
| `enabled` | boolean, default false | seeded **disabled** (opt-in) |
| `last_run_at`, `run_count` | timestamp / int | mirror automations |
| timestamps / softDeletes | | |

**`JourneyStep`** — ordered steps.
| Column | Type | Notes |
|---|---|---|
| `id`, `uuid`, `journey_id` (fk) | | |
| `sort_order` | int | |
| `delay_minutes` | int | wait *before* this step (0 = immediate) |
| `action_type` | string | reuse/extend `ActionTypeEnum` |
| `action_details` | jsonb | reuse `ActionExecutor` token/email/SMS path |

**`JourneyEnrolment`** — per-recipient state (the piece that's totally missing today).
| Column | Type | Notes |
|---|---|---|
| `id`, `uuid`, `journey_id` (fk) | | |
| `enrollable_type` / `enrollable_id` | morph | Customer or Cart |
| `current_step` | int | |
| `status` | string (CHECK) | `active` / `completed` / `exited` |
| `next_run_at` | timestamp, indexed | the tick query keys on this |
| `last_step_at` | timestamp | |
| `meta` | jsonb | dedup key, trigger snapshot |

> Index `(journey_id, enrollable_type, enrollable_id)` for **de-dup** (a re-trigger must not double-enrol an already-`active` recipient) and `(status, next_run_at)` for the tick query.

### 6.2 New triggers + dispatch sites
Add to `TriggerTypeEnum`: `cart_abandoned`, `order_delivered`, `first_order_placed`, `customer_dormant`. Wire `JourneyEnrolment` creation on dispatch (de-dup; honor `exit_conditions`). Keep `ProcessAutomationJob` untouched; add **`ProcessJourneyStepJob`** that executes the current step via `ActionExecutor`, advances `current_step`, computes the next step's `next_run_at = now + delay_minutes`, and **self-reschedules via delayed dispatch** (requires Redis — fix `QUEUE=sync` first).

### 6.3 Time-based detector cron
Add **`journeys:tick`** to `routes/console.php` (everyMinute, mirroring `email-campaigns:dispatch-scheduled`):
- (a) find carts with no associated order and `updated_at` older than the abandonment threshold → dispatch `cart_abandoned`;
- (b) find customers whose last order / `last_login_at` crosses a dormancy threshold → dispatch `customer_dormant`;
- (c) advance any `JourneyEnrolment` whose `next_run_at <= now` (belt-and-suspenders alongside delayed dispatch).

Use `CacheServiceInterface` + `StoreHelper`, never the `Cache` facade.

### 6.4 Service layer (`app/Services/Journey/`)
- `JourneyService` — CRUD on journeys/steps (FormRequest → Service → Resource); **audit-log enable/disable/edit** per CLAUDE.md significant-action rule.
- `JourneyEnrolmentService` — enrol (with de-dup), advance, exit, complete.
- `JourneyStepExecutor` — thin wrapper delegating to `ActionExecutor` so the token/email/SMS path is shared, not forked.
- Every method that contains business logic needs a test (CLAUDE.md). Mirror `tests/Feature/Storefront/AddressAttentionToTest.php` style: assert enrolment, delay scheduling, exit-on-purchase.

### 6.5 Frequency-cap / suppression layer (shared by all three senders)
- `EmailSuppression` model — per customer/email, `reason`, `scope`.
- `EmailSendLedger` model — `recipient`, `journey_id`/`campaign_id`, `sent_at`.
- `CommunicationGuard` service — consulted before **any non-transactional** send; enforces a per-recipient monthly cap and 60–90-day sunset. Route `SendEmailCampaignJob` **and** `ActionExecutor` through it. **Transactional email (order/payment) is exempt.**

### 6.6 Admin builder UI (`nuxt/`, Audience 2)
Mirror the existing automation form patterns (UI-consistency rule): trigger picker, ordered steps with **human delay labels** ("Wait 1 day"), live preview, per-journey analytics (enrolled / completed / converted from `JourneyEnrolment`). Plain-language empty/loading/error states (§0). Wrap all API calls in composables (never `$fetch` in `.vue`); Pinia for state. While in this code, **fix the silent `assign_task` / `request_payment` actions** (implement or hide).

### 6.7 Audience-1 landlord plumbing (separate)
Build a thin landlord journey set as **scheduled System jobs** alongside `NotifyTrialExpiringJob`:
- new-tenant welcome/activation series,
- go-live/setup-completion nudges keyed to onboarding milestones,
- **dunning sequence** on `Subscription.status = charge_failed` (`BillingService.renew()` retry + escalation emails) — currently a hard gap,
- post-trial win-back.

Reuse `emails.system.*` views + `AccountStatusService`. **Do not** try to route these through the tenant `Journey` engine.

### 6.8 External-ESP option
Expose journey trigger events through `MarketingSyncService.trackEvent()` (`cart_abandoned`, `order_delivered`, `dormant`) so owners who prefer Klaviyo/Mailchimp can fire their own flows — choice without forcing the native engine.

---

## 7. Phased roadmap

### Prerequisite (blocker)
- **Fix `QUEUE=sync` → Redis with delayed dispatch.** No delayed-step journey works on the sync driver. (See project memory: production readiness.) **~0.5–1 day** config + verification.

### P0 — Native journey engine + flagship abandoned-cart (Audience 2)
- **P0.1** Journey / JourneyStep / JourneyEnrolment models + Postgres migrations. **~2–3 days.**
- **P0.2** New lifecycle triggers (`cart_abandoned`, `order_delivered`, `first_order_placed`, `customer_dormant`) + dispatch wiring with de-dup + exit conditions; `ProcessJourneyStepJob`. **~2–3 days.**
- **P0.3** `journeys:tick` cron (abandoned-cart + dormancy detectors). **~1–2 days.**
- **P0.4** Flagship **abandoned-cart recovery journey**: 3 steps (≈1h reminder → ≈24h benefit → ≈72h incentive), exit on `order_placed`. Seed **disabled** as a default in `StoreOnboardingService.php`. Add recovery template to `EmailTemplateEnum` + `SeedTenantEmailTemplates.php`. Tests: enrolment, delay scheduling, exit-on-purchase. **~2 days.**

### P1 — Safety + post-purchase + landlord lifecycle
- **P1.1** `CommunicationGuard` + `EmailSuppression` + `EmailSendLedger`; route campaigns + automations + journeys through it (transactional exempt). **~3 days.**
- **P1.2** Post-purchase journey: `order_delivered` → review-request → NPS/CSAT survey → reorder reminder. New `OrderFeedback`/`Survey` model + template (also seeds the absent feedback loop from `readme/qa_section_feedback.md`). **~3–4 days.**
- **P1.3** Audience-1 landlord journeys: welcome/activation, go-live nudges, **dunning on `charge_failed`**, post-trial win-back. **~3–4 days.**

### P2 — Builder UI + ecosystem polish
- **P2.1** Admin journey builder UI in `nuxt/` with per-journey analytics; fix silent `assign_task`/`request_payment`. **~4–5 days.**
- **P2.2** Expose `cart_abandoned`/`order_delivered`/`dormant` via `MarketingSyncService.trackEvent()`; audit logging on journey enable/disable/edit. **~1–2 days.**

---

## 8. Success metrics to track

**Audience 2 (store → end-customer)**
- Abandoned-cart **recovery rate** (% of `cart_abandoned` enrolments that hit the `order_placed` exit) — target the ~34% conversion lift benchmark.
- Recovered **revenue** attributed to journeys (ledger-joined to orders).
- Per-journey funnel: enrolled → step-completed → converted → exited.
- Review-request response rate; NPS/CSAT volume and score.
- Reorder-reminder conversion for consumable products.

**Deliverability / safety**
- Per-recipient **send frequency** distribution vs the cap (alert on breaches).
- **Complaint rate** and unsubscribe rate before/after capping (target 60%+ complaint reduction).
- Suppression/sunset list growth; % of sends blocked by `CommunicationGuard`.

**Audience 1 (platform → tenant)**
- **Trial → paid conversion** uplift from the activation/expiry series.
- **Dunning recovery rate** (% of `charge_failed` subscriptions recovered).
- Go-live completion rate among tenants who received setup nudges.

---

## 9. Key file references

| Area | Path |
|---|---|
| Single-shot trigger dispatch | `app/Services/Automation/TriggerDispatcher.php` |
| Action execution + `[token]` parser (REUSE) | `app/Services/Automation/ActionExecutor.php` |
| Triggers enum (extend) | `app/Enums/Automation/TriggerTypeEnum.php` |
| Actions enum (silent gaps) | `app/Enums/Automation/ActionTypeEnum.php` |
| Automation worker | `app/Jobs/ProcessAutomationJob.php` |
| Automation model + thin schema | `app/Models/Automation.php`, `database/migrations/2025_05_26_060514_create_automations_table.php` |
| Broadcast campaigns | `app/Services/EmailCampaign/EmailCampaignService.php`, `.../SendEmailCampaignJob.php` |
| RFM segmentation (REUSE for scope/exit) | `app/Services/EmailCampaign/AudienceFilterResolver.php`, `.../CustomerSegmentService.php` |
| Transactional email | `app/Services/EmailService.php`, `app/Services/Email/EmailTemplateResolverService.php`, `app/Enums/EmailTemplateEnum.php`, `app/Jobs/Tenant/SeedTenantEmailTemplates.php` |
| Audience-1 retention | `app/Jobs/System/NotifyTrialExpiringJob.php`, `app/Services/Admin/AccountStatusService.php`, `app/Services/BillingService.php` |
| Trigger building blocks | `app/Models/Cart.php`, `app/Models/Customer.php`, `routes/frontstore.php:413` |
| Onboarding seed point | `app/Services/Onboarding/StoreOnboardingService.php` |
| External ESP | `app/Services/Integrations/Marketing/MarketingSyncService.php` |
| Fan-out | `app/Jobs/Notification/SendAppNotification.php` |
| Scheduler seam | `routes/console.php` |
| Feedback-loop gap | `readme/qa_section_feedback.md` |
| Queues reference | `readme/NOTIFICATIONS_AND_QUEUES.md` |
