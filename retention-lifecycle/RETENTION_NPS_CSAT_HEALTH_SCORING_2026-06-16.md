# NPS / CSAT / Customer Health Scoring & At-Risk Alerting

> **Date:** 2026-06-16
> **Status:** research-only (nothing built yet)
> **Scope:** Both audiences — (1) the platform retaining its *tenant store owners* (B2B SaaS churn), and (2) each *store owner* retaining their *end-customers* (buyer churn).

## TL;DR

Print-Flow-360 currently has **no way to measure customer satisfaction or predict churn** for either audience. There is no survey/NPS/CSAT/CES spine, no composed health score, and no at-risk-tenant feed for the platform's own retention. What *does* exist is a strong foundation to build on: the **Action Center** rule engine (`app/Services/ActionCenter/`) is the exact pattern for at-risk alerting and already ships a crude end-customer churn proxy (`AtRiskCustomersRule` — 90-day recency). Survey *delivery* rails already exist (EmailService, the Automation trigger/action engine, in-app `SendAppNotification`, the daily scheduler). The recommended path: build one shared **survey spine** (`Survey` + `SurveyResponse` models + `SurveyService`), wire delivery through the *existing* email/automation/in-app rails (no new engine), compose two **HealthScoreService** classes (end-customers first, tenants second), persist nightly scores, and turn score-band changes into **Action Center alerts** so a non-technical store owner gets a "follow up with this customer" nudge with zero new screens.

---

## 1. Why this matters for a non-technical-store-owner print SaaS

The primary user is a non-technical store owner who navigates by intuition and will not configure analytics dashboards. For them, retention has to arrive as **a plain-language nudge in a place they already look**, not a metric they have to go hunt for:

- *"Acme Print Co. hasn't ordered in 112 days and has a failed payment — reach out."*
- *"Maria rated her last order 4/10 — follow up before she leaves."*

That is exactly the **Action Center** experience this codebase already ships (a computed "what needs action now" feed). Health scoring and detractor surveys only earn their keep when a score change *triggers* one of those nudges — assign a task, raise an alert, fire a win-back email — so the owner never has to read a number.

For the **platform itself**, the same logic applies one level up: the landlord (SaaS operator) needs to know which *tenants* are going quiet, failing payments, or trending toward cancellation **30–60 days before they churn**, because 70–80% of churning customers show measurable warning signs that far ahead. Today the platform is effectively blind to this — the only proactive tenant-retention touch is `NotifyTrialExpiringJob`.

---

## 2. The two audiences — and which applies where

| | **Audience 1 — Platform → Tenant** | **Audience 2 — Store owner → End-customer** |
|---|---|---|
| Who churns | A store owner cancels their subscription | A buyer stops ordering from a store |
| Who acts | Platform CS / landlord | Store owner / staff |
| Signal sources | `Tenant.status`, `Subscription` (trial/active/expired/charge_failed), staff activity, products published, orders processed, stores live | `Customer.last_login_at` / `login_count`, orders (recency/frequency/value), failed `Payment`, reviews/messages, survey sentiment |
| Surface | **NEW** landlord health dashboard (`routes/admin-api.php` + Nuxt page) + at-risk-tenant alert | **Existing** tenant Action Center feed (`AtRiskCustomersRule` evolved) |
| Instrumentation today | Least-instrumented — no health band, no at-risk feed | Partly seeded — single-signal recency rule exists |
| Survey type fit | Relational NPS 7–10d post-onboarding; CSAT post-onboarding; CSAT post-support (once support spine exists) | Transactional NPS after delivery; CSAT post-support; relational NPS at intervals |

Both audiences share **one survey spine** and the **same `HealthScoreService` shape** (different signal sets and weights). Keep the tenant-facing health surface separate from the tenant Action Center, since Action Center is tenant-scoped and the at-risk-tenant feed is for the landlord.

---

## 3. What already exists in the codebase

### 3.1 The at-risk alerting pattern is ready — copy it
- **`app/Services/ActionCenter/ActionCenterService.php`** — runs rules registered in `rules()` (currently 8: OverdueInvoices, FailedPayments, JobsDue, ProofsAwaiting, ExpiringQuotes, LowStock, **AtRiskCustomers**, B2bApprovals). **Adding a rule = 1 class + 1 line.**
- **`app/Services/ActionCenter/AlertRule.php`** — the interface. Each rule returns items with `type / severity / title / subtitle / link / icon / entity_type / entity_id / date`.
- **`readme/ACTION_CENTER.md`** — canonical doc and the rule-authoring SOP.
- **`nuxt/app/components/dashboard/DashboardActionCenterWidget.vue`** — the dashboard surface; reuse for satisfaction/health widgets.

### 3.2 An end-customer churn proxy already ships (the seed to evolve)
- **`app/Services/ActionCenter/Rules/AtRiskCustomersRule.php`** — `info` severity; customers with orders ever but none in 90+ days, using `withMax` last_order_at + `withCount` orders. This is a **single-signal recency heuristic, not a composed health score** — but it is exactly the rule to evolve into a band-driven alert.

### 3.3 End-customer signals already captured
- **`app/Models/Customer.php`** + **`database/migrations/2026_06_04_000002_add_last_login_to_customers_table.php`** — `last_login_at` + `login_count`. (Per **`readme/CUSTOMER_ACTIVITY_AND_SOURCE.md`**: must increment via `login_count`, `[last_login_at => now()]` or it silently drops.)
- Orders relationship → count / recency / value. `Payment.status = failed` feeds **`app/Services/ActionCenter/Rules/FailedPaymentsRule.php`**.

### 3.4 Tenant (platform-churn) signals already captured
- **`app/Models/Tenant.php`** — `status` (ACTIVE/TRIAL/INACTIVE), `trial_approval_date`, `subscriptions()`.
- **`app/Models/Subscription.php`** — `status` (trial/active/expired/cancelled/charge_failed), `trial_ends_at`, `ends_at`, `renewal_at`.
- **`app/Services/Admin/AccountStatusService.php`** — drives tenant lifecycle.
- **`app/Jobs/System/NotifyTrialExpiringJob.php`** — the **only** proactive tenant-retention nudge today.

### 3.5 Survey delivery rails already exist (no new engine needed)
- **Email:** `app/Services/EmailService.php` → EmailProviderManager; templates via **`app/Services/Email/EmailTemplateResolverService.php`** + **`app/Enums/EmailTemplateEnum.php`**, seeded by `SeedTenantEmailTemplates`.
- **Triggered single-shot:** Automation engine **`app/Services/Automation/TriggerDispatcher.php`** (~25 call sites incl. `OrderService:82`, `status_changed`/`paid_in_full`) → `ProcessAutomationJob` → **`app/Services/Automation/ActionExecutor.php`** (`send_email_text`).
- **In-app multi-channel:** **`app/Jobs/Notification/SendAppNotification.php`** (email/sms/push).
- **Scheduler:** **`routes/console.php`** (`action-center:digest` dailyAt 07:30 / weeklyOn Mon) — where a time-based survey/health cron slots in.

### 3.6 Supporting pieces
- **`app/Models/Activity.php`** (`user_id`, `subject`, `description`) — the mechanism to log health-band changes and survey sends (CLAUDE.md audit rule).
- **`app/Services/Onboarding/StoreOnboardingService.php`** — `seedAll` is the anchor for a post-onboarding CSAT timer.

### 3.7 Feedback signals that currently rot (should feed a score, but go to a void)
- **`ProductReview`** — `status = pending`, no owner notification.
- **`OrderMessage`** thread — customer messages reach a void, no admin reply panel.
- Storefront contact form → `StoreFormSubmission` (write-only; no ticket, no ref number) — confirming **no support spine** to source CSAT from.

---

## 4. Gaps

1. **No survey model/migration/job/template** for NPS (relational or transactional), CSAT, or CES — for either audience. Satisfaction cannot be measured at all today.
2. **No composed health score.** `AtRiskCustomersRule` uses one 90-day recency signal — no feature-adoption, payment-health, support-ticket, or sentiment inputs combined.
3. **No tenant health score at all** (the platform's own B2B SaaS churn — the least-instrumented audience). No band, no at-risk-tenant alert, no dunning beyond the `EnsureTenantHasActiveSubscription` block + grace banner.
4. **No survey-timing trigger.** `TriggerTypeEnum` has only `status_changed`/`paid_in_full`/approval/task_completed — **no `order_delivered`** → transactional NPS can't fire on fulfilment without a new trigger + dispatch site. No onboarding-complete or post-support trigger.
5. **No support ticket spine** → post-support CSAT has nothing to attach to (`readme/qa_section_support.md`: no Ticket model/controller/SLA).
6. **No response storage, aggregation, trend, or satisfaction/health dashboard** on either side.
7. **No Action Center rule consuming health bands or detractor responses**; no CS/landlord-facing at-risk-tenant surface (`routes/admin-api.php` has no health/metric route — only dashboard-welcome settings).
8. **Reliability risk:** `QUEUE=sync` per memory (must be Redis in prod) before scheduling nightly score jobs; failed-payment/dunning is passive and not folded into any score, despite card failure causing 20–40% of SaaS churn.
9. **Thin adoption signal:** `login_count`/`last_login_at` is the only persisted end-customer adoption signal; there is no per-tenant feature-adoption signal (would be computed from existing `products`/`orders`/published pages).

---

## 5. Best practices & benchmarks

**Use all three metrics, each for a different moment** (Delighted; Balto; Armatis 2025):
- **CSAT** immediately after a discrete interaction (onboarding, support resolution).
- **CES** immediately after task completion.
- **NPS** for loyalty at broader intervals.
Don't pick one.

**Survey timing that maximizes response** (Zonka Feedback tNPS guide 2025):
- Transactional NPS 0–24h for quick events; **1–2 weeks after a delivery**.
- SaaS relational NPS **7–10 days post-onboarding**.
- Relational NPS quarterly for B2B, semi-annual for B2C.

**Channel response-rate benchmarks** (Zonka Feedback 2025):
| Channel | Response rate |
|---|---|
| SMS | 40–50% |
| In-app mobile | 27–36% |
| In-app web survey | 20–27% |
| Email, embedded first question | 15–25% |
| Email, link only | 6–15% |
Transactional NPS gets **8–12 pts higher** response than relational (25–40% vs 15–25%). **Embed the first question in the email**; prefer in-app for the captive moment.

**CSAT target:** 75–85% is good; SaaS top performers target 90%+ (Balto/Delighted 2025).

**Health score = weighted multi-signal, not a single metric.** Signal-Stack model: **Activity 40% / Engagement 30% / Milestones 20% / Recency 10%** — usage decline is the single strongest churn predictor, ahead of NPS, tickets, and sentiment. Low NPS + declining usage *together* is far stronger than either alone (EverAfter 2025; Accoil; customerscore.io).

**Payment/dunning health is a first-class input** — card failures cause **20–40% of SaaS churn**; fold failed-payment / charge_failed / expired-card state into the score and act on it (customerscore.io; EverAfter).

**Health bands (3-tier):** Green 75–100 / Yellow 40–74 / Red 0–39 (variant: Green 70–100 / Yellow 40–70 / Red <40). Pick one and **backtest against historical churn** (hellopm.co; HubSpot; Custify 2025).

**A score only earns its place when a change TRIGGERS an action** — for each threshold define action / owner / channel / timing and automate it (triggered email, alert, CSM assignment) (DigitalApplied 2026; Totango).

**Leading-indicator timing:** ~70–80% of churning customers show measurable warning signs **30+ days before** cancelling; activity decline precedes cancellation by **30–60 days**; predictive models give 60–90 days warning. **Score nightly and alert on the down-trend, not just the current value** (DigitalApplied 2026; EverAfter).

**Maintain the model:** re-weight monthly, review accuracy quarterly, reassess metrics semi-annually, full re-baseline annually; backtest weights against past churn (mean.ceo 2026; EverAfter).

---

## 6. Recommended architecture for THIS codebase

All new code follows CLAUDE.md: UUID routes (`HasUuid`), `BelongsToTenant` for tenant-scoped models, `Controller → FormRequest(BaseRequest) → Service → Resource → successResponse()/errorResponse()`, business logic in `app/Services/{Module}/`, composables wrapping every API call in Nuxt, Pinia for state, Postgres-compatible migrations (`enum()` → CHECK constraint per §6), and a Feature test proving each submitted field round-trips (silent-lie rule).

### 6.1 Shared survey spine — `app/Services/Feedback/`

**New tenant-scoped models (`BelongsToTenant` + `HasUuid`):**

- **`Survey`** — `id`, `uuid`, `tenant_id`, `type` (`nps|csat|ces` → Postgres CHECK), `audience` (`end_customer|tenant`), `trigger` (`order_delivered|post_onboarding|post_support|relational`), `schedule` (nullable cadence), `is_active`, timestamps.
- **`SurveyResponse`** — `id`, `uuid`, `tenant_id`, `survey_id`, `customer_id` *or* `tenant_subject_id` (one set), `score` (0–10 NPS / 1–5 CSAT-CES), `comment` (text), `source_channel` (`email|in_app|sms`), `context_snapshot` (JSON — snapshot of trigger context so a renamed product/trigger doesn't lose meaning; snapshot rule), `responded_at`, timestamps.

**Service:** **`app/Services/Feedback/SurveyService.php`** — compose surveys, store responses, compute:
- NPS = `%promoters (9–10) − %detractors (0–6)`.
- CSAT = `% scoring 4–5 (or top-2-box)`.
- CES = mean effort score.
- Classification helper: `isDetractor(response)` (NPS ≤6 or CSAT ≤2) → drives §6.5 action wiring.

**API:** `SurveyController` + `SurveyResponseController` (UUID routes), `StoreSurveyRequest`/`StoreSurveyResponseRequest` extending `BaseRequest`, `SurveyResource`/`SurveyResponseResource`. **Feature test:** submit a response, assert it persists (model `Survey.php`-style test mirroring `tests/Feature/Storefront/AddressAttentionToTest.php`).

### 6.2 Survey delivery via existing rails (no new engine)

- **Transactional end-customer NPS:** add **`order_delivered`** to `app/Enums/Automation/TriggerTypeEnum.php` + a `TriggerDispatcher::dispatch('order_delivered', ...)` call site where a job/order hits its terminal/delivered status. Then send via a survey action — extend `ActionExecutor` with a `send_survey` action *or* reuse `send_email_text` carrying a survey link.
- **In-app + email channel:** render via `EmailTemplateResolverService` (new `EmailTemplateEnum` slug) **and** a storefront one-question NPS widget in `frontstore/` (embed the first question per benchmarks). Multi-channel send through `SendAppNotification`.
- **Post-onboarding CSAT (store owner):** new **`app/Jobs/System/SendTenantOnboardingCsatJob.php`** (sibling of `NotifyTrialExpiringJob`), fired **7–10 days after** `StoreOnboardingService::seedAll`, delivered via `EmailService`.

### 6.3 `CustomerHealthService` — Audience 2 (end-customers) — **P0**

**`app/Services/Health/CustomerHealthService.php`** composing weighted signals already available:
| Signal group (Signal-Stack weight) | Source |
|---|---|
| Activity 40% | `orders_count`, `last_order_at`, `last_login_at`, `login_count` |
| Engagement 30% | reviews / `OrderMessage` activity, survey responses |
| Milestones 20% | order totals (monetary), repeat-purchase |
| Recency 10% | days since last order/login |
Negative weight for failed `Payment` count (dunning input).

**Persist nightly** to a new Postgres table **`customer_health_scores`** (`uuid`, `tenant_id`, `customer_id`, `score`, `band`, `signals` JSON, `computed_at`). New cron in `routes/console.php` next to `action-center:digest`. Bands: **Green 75–100 / Yellow 40–74 / Red 0–39**.

### 6.4 Evolve `AtRiskCustomersRule` into a health-driven alert — **P0**

Augment **`app/Services/ActionCenter/Rules/AtRiskCustomersRule.php`** to read the persisted band (Red → `warning`, Yellow → `info`) instead of the lone 90-day check, with a richer subtitle: *"Health: At risk · last order 112d · 1 failed payment."* Pure Action Center pattern — one class, **names not ids**, `->limit(50)`, null-guard deleted relations (`relation?->field ?: 'Deleted X'`), `CurrencyHelper` for money. Gives the store owner a CS-style at-risk feed with **zero new frontend**.

### 6.5 Wire detractor responses into action — **P1**

When `SurveyService::isDetractor()` is true:
- (a) Create an Action Center alert (*"Detractor: Acme rated 4/10 — follow up"*) for the store owner.
- (b) Log to `Activity` (audit rule).
- (c) For tenant surveys, alert the platform CS/landlord.

### 6.6 `TenantHealthService` — Audience 1 (platform's own churn) — **P1**

**`app/Services/Admin/TenantHealthService.php`** (landlord side). Signals from `Tenant.status`/`trial_approval_date`, `Subscription` (`charge_failed`/`expired`/`trial_ends_at`), staff last-activity, tenant productivity (products published, orders processed, stores live). Bands + nightly cron → new Postgres table `tenant_health_scores`. Surface in a **new landlord health dashboard**: add a route to `routes/admin-api.php` (none exists today) + a Nuxt page in `nuxt/` with an at-risk-tenant list (separate from tenant Action Center).

### 6.7 Feed dunning into both scores — **P1**

Card failure = 20–40% of churn. **Tenants:** detect `charge_failed`/`expired` and trigger a "payment failed — update your card" email sequence via the scheduler (`renew()` has no auto-cron today). **End-customers:** add failed-`Payment` count as a weighted negative in `CustomerHealthService` (`FailedPaymentsRule` already alerts).

### 6.8 Post-support CSAT — **P2** (blocked)

Blocked on building a `Ticket` model (`readme/qa_section_support.md`). When a ticket resolves, fire a 1-question CSAT via `SurveyService`. Until then, attach CSAT to `OrderMessage` thread resolution and `ProductReview` submission — and **wire the missing owner-notification** so reviews/messages stop rotting.

### 6.9 Trend dashboards — **P2**

- **Tenant-side:** satisfaction widget (NPS trend, response rate, detractor list) reusing the `DashboardActionCenterWidget.vue` pattern.
- **Landlord-side:** tenant health distribution (Green/Yellow/Red counts) + at-risk list.
Both must ship loading/empty/error states (CLAUDE.md §0) and **paginate** the at-risk lists (pagination-required rule). Every API call wrapped in a composable; state in Pinia.

---

## 7. Phased roadmap & effort sizing

| Phase | Deliverable | Effort | Depends on |
|---|---|---|---|
| **P0** | Survey spine: `Survey` + `SurveyResponse` models/migrations, `SurveyService`, controllers/requests/resources, Feature test | **M** (3–5d) | — |
| **P0** | Survey delivery: `order_delivered` trigger + dispatch site, `send_survey`/`send_email_text` action, email template slug, in-app NPS widget, `SendTenantOnboardingCsatJob` | **M** (3–5d) | survey spine |
| **P0** | `CustomerHealthService` + `customer_health_scores` table + nightly cron | **M** (3–4d) | — (uses existing signals) |
| **P0** | Evolve `AtRiskCustomersRule` to read health band | **S** (1d) | health scores persisted |
| **P1** | Detractor → Action Center alert + Activity log | **S** (1–2d) | survey spine + Action Center |
| **P1** | `TenantHealthService` + `tenant_health_scores` + landlord health dashboard (admin-api route + Nuxt page) | **L** (5–8d) | — |
| **P1** | Dunning/payment-health into both scores + tenant card-failure email sequence | **M** (3–4d) | tenant health |
| **P2** | Post-support CSAT | **M** | Ticket model (separate epic) |
| **P2** | Satisfaction + health trend dashboards | **M** (3–5d) | scores + responses |
| **Cross-cutting** | `QUEUE=redis` before nightly jobs; log every band transition + survey send to `Activity`; snapshot survey context; re-weight monthly + backtest | ongoing | — |

> **Reliability gate:** do **not** schedule the nightly score crons until `QUEUE=redis` is confirmed in prod (sync queue is a reliability risk per memory).

---

## 8. Success metrics to track

**Measurement coverage (does the spine work):**
- Survey response rate by channel vs benchmarks (in-app 20–27%, email-embedded 15–25%, SMS 40–50%).
- % of delivered orders that trigger a transactional NPS; % of onboardings that fire CSAT.

**Satisfaction (the numbers themselves):**
- End-customer & tenant **NPS** (%promoters − %detractors), trended monthly.
- **CSAT** (target 75–85%, stretch 90%+) post-onboarding and post-support.
- Detractor follow-up rate (% of ≤6/≤2 responses that get an Action Center alert *and* an owner action logged in `Activity`).

**Health-score efficacy (does it predict churn):**
- Band distribution (Green/Yellow/Red counts) per audience, trended.
- **Backtest accuracy:** of customers/tenants who churned, what % were Red/Yellow 30–60 days prior (target the 70–80% leading-indicator benchmark).
- Lead time: median days between first Red band and churn (target 30–60+).

**Retention outcome (the point of it all):**
- End-customer repeat-order rate and tenant subscription renewal/retention rate, segmented by whether an at-risk alert fired and was actioned.
- Reduction in payment-failure-driven churn after the dunning sequence ships.

---

## 9. Key file references

- `readme/ACTION_CENTER.md`
- `app/Services/ActionCenter/ActionCenterService.php`, `AlertRule.php`, `Rules/AtRiskCustomersRule.php`, `Rules/FailedPaymentsRule.php`
- `app/Models/Customer.php` · `readme/CUSTOMER_ACTIVITY_AND_SOURCE.md` · `database/migrations/2026_06_04_000002_add_last_login_to_customers_table.php`
- `app/Models/Tenant.php` · `app/Models/Subscription.php` · `app/Services/Admin/AccountStatusService.php` · `app/Jobs/System/NotifyTrialExpiringJob.php`
- `app/Services/EmailService.php` · `app/Services/Email/EmailTemplateResolverService.php` · `app/Enums/EmailTemplateEnum.php`
- `app/Services/Automation/TriggerDispatcher.php` · `app/Services/Automation/ActionExecutor.php` · `app/Enums/Automation/TriggerTypeEnum.php`
- `app/Jobs/Notification/SendAppNotification.php` · `app/Models/Activity.php`
- `routes/console.php` · `routes/admin-api.php` · `app/Services/Onboarding/StoreOnboardingService.php`
- `readme/qa_section_feedback.md` · `readme/qa_section_support.md`
- `nuxt/app/components/dashboard/DashboardActionCenterWidget.vue`
