# Dunning & Involuntary Churn Recovery — Failed/Expired-Card Payment Recovery on SaaS Subscriptions

> **TL;DR** — Print-Flow-360 charges store-owner tenants a recurring SaaS subscription ($149/mo + $39/user, 14-day trial), and Stripe even creates a real native recurring subscription that retries failed cards. But **nothing in the codebase reacts to a failed charge**: no subscription webhooks are consumed, the `charge_failed` status is never written by any code path, `BillingService::renew()` is never called by any scheduler, there is no card-expiry warning, no dunning email sequence, no self-serve "update your card" recovery flow, and the grace window is a token 1 day. A tenant's card can silently expire or decline for weeks while the access middleware keeps reading `active`. Since failed payments cause 20–40% of SaaS churn and good dunning recovers 50–65% of it, this is high-leverage, mostly-additive revenue-recovery work built on substrate that already exists (the unified webhook dispatcher, the subscription models, the system-mail/cron pattern).
>
> **Status: research-only (nothing built yet).** This document is a plan and a map, not a record of shipped work.

---

## 1. Why this matters for a non-technical-store-owner print SaaS

Our paying customers are **non-technical print-shop owners**. When their saved card expires (cards expire on a schedule nobody remembers) or a bank declines a renewal, three things happen today:

1. **They get no warning.** No card-expiry email, no failed-payment email. The first signal would be losing access — except that doesn't even fire reliably (see §4).
2. **We lose revenue we would have kept.** Most of these failures are *involuntary* — the owner still wants the product, the card just lapsed. Industry data puts involuntary churn at **20–40% of all SaaS churn** (ProfitWell / State of Retention). Recovering it is pure margin: no new acquisition spend, the customer already wants to stay.
3. **It reads as "the software broke."** A non-technical owner whose store suddenly 402s with no explanation will assume the product failed, not that their card lapsed. That is exactly the failure mode CLAUDE.md §0 forbids ("a blank screen reads as broken"; "tell the user what to do next"). Recovery must be a plain-language, one-click "update your card" path — never a silent block.

Dunning is one of the highest-ROI features a subscription business can ship: typical dunning ROI is **10–15×** because it recovers revenue that already exists. For a print SaaS whose buyers are busy, non-technical, and not watching their billing, the *pre-dunning* warning (before the card even fails) is the single highest-value, lowest-effort piece — the data is already stored.

---

## 2. The two audiences — which one this doc is about

Print-Flow has **two completely separate billing relationships**, and dunning means something different for each. Getting this wrong is the #1 implementation trap here.

| | **Audience 1 — Platform → Tenant** | **Audience 2 — Store-owner → End-customer** |
|---|---|---|
| Who pays whom | The print-shop owner (tenant) pays **us** the SaaS fee | A shopper pays the **store** for a print order |
| Billing engine | `BillingService` + `SubscriptionGatewayRegistry` (recurring subscription) | Order checkout, payment gateways per store |
| Audience scope | **Landlord / system** — NOT tenant-scoped | **Tenant-scoped** (lives inside one store's data) |
| Failure today | Silently ignored (this doc) | Surfaced passively via `FailedPaymentsRule` + `PAYMENT_FAILED` tenant email template |
| Mail path | `app/Jobs/System/*` + `resources/views/emails/system/*` (e.g. `NotifyTrialExpiringJob`) | Tenant Automation engine + tenant email templates |

**This document is about Audience 1 — platform-to-tenant subscription dunning.** That is the gap.

The existing failed-payment touchpoints are all Audience 2 and are **the wrong audience** to reuse:
- `app/Services/ActionCenter/Rules/FailedPaymentsRule.php` — internal owner alert for a *store's* failed order payments. Tenant-scoped. Not us retaining the tenant.
- `EmailTemplateEnum::PAYMENT_FAILED` (`'payment_failed'`) — fires for a store's end-customer order payment failure. Tenant-scoped. Reusing it for SaaS dunning would leak landlord billing into a store's email system.
- The per-tenant **Automation engine** has no time-delay steps and is tenant-scoped — it cannot drive a multi-step landlord dunning sequence.

**Consequence for the build:** all dunning jobs and Blade views must live on the **landlord side** (`app/Jobs/System/`, `resources/views/emails/system/`), mirroring `NotifyTrialExpiringJob`. Do **not** route platform dunning through tenant-scoped machinery.

---

## 3. What already exists in the codebase

There is a surprising amount of reusable substrate — the gap is the reactive/recovery layer on top of it, not the foundation.

### Billing engine (orchestration)
- **`app/Services/BillingService.php`** — orchestrates `subscribe()` / `renew()` / `cancel()` behind `SubscriptionGatewayInterface`. Writes `SubscriptionTransaction` rows **only on success** (no failed rows — a key gap).
- **`app/Services/Billing/SubscriptionGatewayRegistry.php`** — 6 adapters: Stripe, Razorpay, PayPal, AuthorizeNet, PayTM, Cheque.
- **`app/Services/Billing/StripeBillingGateway.php`** — the **only** adapter that creates a real native recurring Stripe Subscription (`stripe->subscriptions->create`, `interval=month`, `default_payment_method` attached). So Stripe *itself* retries cards and emits `invoice.payment_failed` / `invoice.paid` — but **nothing local consumes those events**. The other 5 gateways do a one-time charge with **no native recurring/retry** (Cheque is manual).

### Status enforcement (the only active "involuntary churn" touchpoint — purely defensive)
- **`app/Http/Middleware/EnsureTenantHasActiveSubscription.php`** — reads a resolved status, returns **402** for `charge_failed` / `expired` / `no_subscription`. Has a grace window (`BillingSettings.grace_period_days`, **default 1**) that allows access and sets an `X-Grace-Period` header (amber banner). Grace is **computed inline** from `ends_at + grace_period_days` — there is no grace *state*. This middleware **blocks** access; it does not **recover**.
- **`app/Services/Subscription/SubscriptionStatusCache.php`** — resolves + caches status (`SUBSCRIPTION_MODE` local|remote, 15-min Redis cache, **fail-open** on outage). Remote mode calls central platform `POST /api/v1/internal/subscription/verify` (`routes/admin-api.php` → `SubscriptionVerifyController`).

### Models & schema
- **`app/Models/Subscription.php`** — status enum includes `'charge_failed'`; uses `$guarded = []`. Helper `isActiveForAccess`.
- `SubscriptionTransaction`, `SubscriptionPlanChange`, `Plan`, `BillingSettings`, `TenantPaymentProfile`.
- **`PlanSeeder`** — $149/mo + $39/user, 14-day trial.
- **`tenant_payment_profiles`** (migration `2026_05_25_000004_add_gateway_fields_to_tenant_payment_profiles_table.php`) — stores `expiration_date`, `last_four`, `card_brand`, `gateway_customer_id`, `gateway_payment_profile_id`. **This is the pre-dunning goldmine — `expiration_date` is already captured.** ⚠️ `card_number` + `cvv` are stored **plaintext** — separate P0 security bug already logged; do not build on top of plaintext card data, use the gateway tokens (`gateway_customer_id`) instead.

### Reusable webhook substrate (the key enabler)
- **`routes/public-api.php`** — `POST /api/v1/webhooks/payments/{gateway_key}` → `PaymentWebhookController` → **`app/Services/Payment/PaymentEventDispatcher.php`**: signature verification, **idempotent** `PaymentWebhookEvent` dedup (`gateway_key + event_id`), clean two-phase claim/dispatch. This is a clean, reusable substrate — but its `EVENT_MAP` only maps **order-payment** events and `resolveOrderId()` **requires an Order**, so subscription events are silently dropped (`ignored_unknown`).
- **`app/Models/PaymentWebhookEvent.php`** — idempotency ledger.

### Proactive nudge pattern to mirror
- **`app/Jobs/System/NotifyTrialExpiringJob.php`** — scheduled `dailyAt('08:00')`, renders `resources/views/emails/system/trial-expiring.blade.php`, sent via the system mail path. **This is the exact template to copy** for card-expiry and dunning jobs.
- **`app/Services/Admin/AccountStatusService.php`** + `app/Jobs/System/*` — account lifecycle emails (approved/blocked/deactivated/reactivated/signup).

---

## 4. Gaps (what's missing or broken)

1. **No retry/dunning engine at all.** `BillingService::renew()` exists but **nothing calls it** — `routes/console.php` has no renewal/retry entry; nothing in `app/Console` or `app/Jobs` calls `renew()`. No recurring-charge cron, no retry schedule, no escalation.
2. **`charge_failed` is a dead write path.** It appears only in the enum migration (`2026_05_26_000001`) and in **read** sites (middleware, `isActiveForAccess`). **No code ever SETS** `Subscription.status = 'charge_failed'`. The middleware branch that blocks `charge_failed` tenants can therefore **never trigger from a real failure**.
3. **Subscription webhooks are not handled.** `PaymentEventDispatcher::EVENT_MAP` maps only order events (`payment.authorized/captured/failed/refunded/disputed`) and `resolveOrderId()` requires an Order. Stripe's `invoice.payment_failed`, `invoice.paid`, `customer.subscription.updated/deleted`, `invoice.upcoming` carry no `order_id` → **silently ignored**. Stripe can dunning-fail a card for weeks; the local `Subscription.status` never changes; middleware keeps reading `active`.
4. **Latent correlation bug — missing `gateway_subscription_id` column.** `StripeBillingGateway` reads `$subscription->gateway_subscription_id` and stores `'stripe_subscription_id'` in its result, but **no migration adds `gateway_subscription_id` to `subscriptions`**. So `cancel()` / lookups read `null`; the Stripe subscription cannot be reliably correlated to the local record. Fixing this is a prerequisite for webhook matching.
5. **No pre-dunning.** No card-expiry warning job despite `tenant_payment_profiles.expiration_date` being available. Card silently expires → the first failed charge is the first signal.
6. **No platform→tenant dunning emails.** `resources/views/emails/system/` has `trial-expiring`, `account-*`, `signup` — no `payment-failed` / `past-due` / `final-notice`. No multi-step nurture. (The tenant Automation engine is the wrong audience and has no delay steps.)
7. **No formal account state machine.** States are ad-hoc strings spread across `Subscription.status`, `Tenant`'s `AccountStatusEnum`, and the middleware's inline branches. No `active → past_due → suspended → cancelled` lifecycle, no soft-vs-hard suspension, no grace *state* column — grace is recomputed on the fly with a **1-day default**, far below the 7–14 day norm.
8. **No self-serve recovery flow.** Middleware whitelists billing routes, but there is no recovery landing page, no Stripe SetupIntent / Billing-Portal handoff, no one-click "update card" link anywhere.
9. **No recovery instrumentation.** No recovered/failed metrics, no voluntary-vs-involuntary split. `SubscriptionTransaction` rows with `status='failed'` are **never written** (only `'success'`).
10. **Multi-gateway reality unaddressed.** Only Stripe is natively recurring. Razorpay/PayPal/AuthorizeNet/PayTM do one-time charges with no native retry → for those, *even passive Stripe-style retries don't exist*. A unified retry policy must live **in Print-Flow**, not be delegated per-gateway.
11. **Reliability risk: `QUEUE=sync` in prod** (per memory). Any retry/dunning job needs a Redis queue first, or scheduled charges run inline and can wedge web requests.

---

## 5. Best practices & benchmarks (with sources)

- **Involuntary churn is huge.** Failed payments cause **20–40% of all SaaS churn**; dunning ROI is typically **10–15×**. (ProfitWell/State of Retention; baremetrics.com/blog/dunning-management; getmonetizely.com)
- **Retry schedule.** A fixed **Day 1 / 3 / 5 / 7** schedule recovers **~58%** of failed payments with *no* communication; ~5 retries is the sweet spot. Smart/ML retries (Stripe default ~4 attempts over 2–3 weeks, configurable up to "8 tries within 2 weeks") add 10–15% by timing to timezone, historical success, and decline code. (slickerhq.com; payproglobal.com; churndog.com; docs.stripe.com/billing/revenue-recovery/smart-retries)
- **Realistic recovery rate.** Good dunning recovers **50–70%** (AI/optimized 65–85%); vendor "90%" claims are inflated — FlexPay real-world data shows 25–52%. **Plan for ~50–65%.** (slickerhq.com/.../reality-check; ustechautomations.com)
- **Pre-dunning wins.** Warn **~30 days before card expiry** and prompt an update — higher action rate than any post-failure email; recovers an additional **15–22%** of at-risk revenue by preventing the failure entirely. (sequenzy.com; ustechautomations.com)
- **Three-part recovery system.** (1) processor smart-retry timing, (2) a **6–7 email dunning sequence over ~30 days**, each with a one-click billing-update link, (3) escalation that **pauses rather than cancels** high-value accounts + personal outreach for the largest. (ustechautomations.com; sequenzy.com)
- **Stripe owns the charge, you own the rest.** `invoice.payment_failed` starts dunning; Stripe Smart Retries handles attempts but **explicitly does NOT** handle comms sequencing, grace periods, fallback payment methods, or engagement — the app must own those. Restrict features for `past_due` via webhook to create urgency. (docs.stripe.com/billing/subscriptions/webhooks)
- **Grace window 7–14 days** (Print-Flow's 1-day default is far too short). Use a distinct `past_due`/`grace` state with **soft suspension** (read-only + banner) before **hard suspension**. (docs.stripe.com/invoicing/automatic-collection; viprasol.com)
- **Canonical state machine:** `active → past_due (retrying + dunning) → grace/paused (soft) → unpaid/suspended (hard) → canceled`, with recovery edges back to `active` on successful card update/charge. (baremetrics.com)
- **Tailor by decline type:** hard declines (lost/stolen/closed) → stop retrying, go straight to "update card"; soft declines (insufficient funds) → time-spaced retries aligned to pay cycles (1st/15th in US). (payproglobal.com; churndog.com)

---

## 6. Recommended architecture for THIS codebase

Design principles, all per CLAUDE.md: **landlord-side** plumbing (not tenant Automation), **controller → service → resource** layering, business logic in `app/Services/{Module}/`, **audit-log** every state transition, **UUID** routes/URLs, Postgres-compatible migrations, plain-language UX, no dead buttons.

### 6.1 Data model changes (Postgres)

| Change | Table | Notes |
|---|---|---|
| **Add `gateway_subscription_id`** (string, nullable) | `subscriptions` | New migration. Fixes the latent `StripeBillingGateway` null-read (gap #4). Prerequisite for webhook correlation + `cancel()`. Persist in `BillingService::activateSubscription()` from `gatewayResult['gateway_transaction_id']`. `$guarded=[]` so no `$fillable` edit needed. |
| **Add explicit lifecycle state** | `subscriptions` | Either widen the existing `status` enum (Postgres: drop `{table}_status_check` CHECK constraint, `->change()` to string, re-add) to include `past_due`, `grace`, `suspended`, or add a dedicated `lifecycle_state` column. Prefer reusing/widening `status` to avoid two sources of truth. |
| **Add `past_due_since` (timestamp, nullable)** | `subscriptions` | Anchors the Day 1/3/5/7 retry clock and grace expiry. |
| **Add `recovered_at` (timestamp, nullable)** | `subscriptions` | Recovery-rate instrumentation (metric §8). |
| **Add `grace_period_days` already exists** | `billing_settings` | Change default 1 → configurable 7–14; surface in admin billing settings UI. |
| **Write `status='failed'` / `'retried'` rows** | `subscription_transactions` | Currently only `'success'` is written. Needed for the funnel metric. |

> Do **not** add new card columns — use the existing `gateway_customer_id` / `gateway_payment_profile_id` tokens. Never build on the plaintext `card_number`/`cvv` (separate P0).

### 6.2 New services (`app/Services/Subscription/`)

**`SubscriptionStateService`** — the single owner of lifecycle transitions. Methods like `markPastDue($subscription, $declineCode)`, `enterGrace()`, `suspend(soft|hard)`, `recover()`, `cancel()`. Each transition must:
1. Update `Subscription.status` + `past_due_since` / `recovered_at`.
2. **Invalidate `SubscriptionStatusCache`** (15-min Redis cache, else stale 402/active).
3. **Write an audit log** (CLAUDE.md significant-action rule: who/what before→after/when).
4. Emit a domain event (e.g. `SubscriptionEnteredPastDue`) that the dunning jobs + Action Center subscribe to.

Distinguish **soft suspension** (read-only + recovery banner; middleware allows `GET` + billing routes) from **hard suspension** (full 402). `EnsureTenantHasActiveSubscription` should read these explicit states instead of recomputing grace inline.

**`SubscriptionDunningService`** — drives the retry policy (Print-Flow-owned, not per-gateway). Knows the schedule (Day 1/3/5/7 + optional 14), the per-attempt cap (~5), jitter, and the decline-type branch (hard → skip retries, jump to update-card; soft → time-spaced). Calls `BillingService::renew()` with the stored gateway profile. Gate per gateway via a **capability flag on `SubscriptionGatewayInterface`** (e.g. `isNativelyRecurring(): bool`): for Stripe, trust Stripe Smart Retries + webhooks and run no Print-Flow retries; for Razorpay/PayPal/AuthorizeNet/PayTM, Print-Flow drives the retries.

### 6.3 Webhook handling (extend existing dispatcher)

In **`app/Services/Payment/PaymentEventDispatcher.php`**:
- Extend `EVENT_MAP` with subscription-scoped events: `invoice.payment_failed`, `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.upcoming`.
- Add **`resolveSubscriptionId()`** alongside `resolveOrderId()` — match Stripe `invoice.subscription` / `customer` to the local `Subscription` via `subscriptions.gateway_subscription_id` (new column) or `TenantPaymentProfile.gateway_customer_id`.
- Handlers: `invoice.payment_failed` → `SubscriptionStateService::markPastDue()` + write a `SubscriptionTransaction status='failed'`; `invoice.paid` → `recover()` + extend `renewal_at`.
- Reuse the existing **idempotent `PaymentWebhookEvent` dedup** and the signature-verified, no-auth-middleware webhook conventions (CLAUDE.md). Route stays `POST /api/v1/webhooks/payments/{gateway_key}`.

### 6.4 Scheduled jobs (`app/Jobs/System/` — landlord side, mirror `NotifyTrialExpiringJob`)

- **`NotifyCardExpiringJob`** (pre-dunning) — `dailyAt`, reads `tenant_payment_profiles.expiration_date`, emails tenants ~30 days out with an update-card link. **Highest ROI, lowest effort** — data already stored.
- **`RetrySubscriptionChargeJob`** — driven by a console command `billing:run-dunning` scheduled in `routes/console.php` (hourly). For each `past_due` subscription on a non-recurring gateway, attempt `BillingService::renew()` on the Day 1/3/5/7 cadence keyed off `past_due_since`.
- **Dunning email jobs** — `SendDunningEmailJob` (or discrete jobs), triggered by `SubscriptionStateService` transitions, rendering new Blade views in `resources/views/emails/system/`:
  - `dunning-1-soft` (Day 0, friendly "your payment didn't go through")
  - `dunning-2` (Day 3)
  - `dunning-3` (Day 5, urgency)
  - `dunning-final` (Day 7, suspension warning)
  - Each carries a **one-click recovery link** to the self-serve page. Send via the system mail path used by `NotifyTrialExpiringJob`.

### 6.5 Self-serve recovery flow (`nuxt/` admin)

- New billing-recovery page in `nuxt/` reachable from the 402/grace amber banner **and** every dunning email link.
- Backed by a **Stripe SetupIntent / Billing Portal session** (and equivalent re-auth for other gateways). On success: immediately retry the charge, transition state back to `active`, invalidate the cache.
- Wrap the API call in a **composable**; state in **Pinia**; never `$fetch` in a `.vue`.
- **Whitelist its route** in `EnsureTenantHasActiveSubscription::EXCLUDED_PATHS` so a suspended tenant can reach it.
- UX (CLAUDE.md §0): plain-language banner — *"Your payment failed — update your card to avoid interruption"* — reserve layout space for the async Stripe element, show a loading state in its slot, never a dead/greyed button without explanation, handle failure with retry.

### 6.6 Remote-mode parity

`SubscriptionVerifyController` (central, `routes/admin-api.php`) must return the new `past_due` / `grace` / `suspended` states so `SubscriptionStatusCache` + middleware behave identically in remote and local modes. Keep the three host-resolution/verify code paths consistent (per memory). Update `readme/PAYMENT_GATEWAYS.md` + `readme/DEPLOYMENT_REMOTE_SUBSCRIPTION.md` per the docs-maintenance rule.

---

## 7. Phased roadmap

### P0 — Prerequisites + make failures observable (the floor)
*Without this, nothing downstream can work; a card can fail for weeks unnoticed.*

| Item | Effort |
|---|---|
| **Move `QUEUE=sync` → Redis** before shipping any job (else scheduled charges run inline and wedge web requests). | S (ops) |
| **Migration: `subscriptions.gateway_subscription_id`** + persist it in `BillingService::activateSubscription()`. Fixes latent null-read. | S |
| **Wire subscription webhooks** — extend `PaymentEventDispatcher` `EVENT_MAP` + `resolveSubscriptionId()`; `invoice.payment_failed` → mark `charge_failed`/`past_due` + write `SubscriptionTransaction status='failed'`; `invoice.paid` → `active`. Reuse idempotent dedup. | M |
| **`SubscriptionStateService`** with explicit `active → past_due → grace → suspended → cancelled`, cache-invalidation + audit log; soft vs hard suspension; configurable 7–14 day grace; middleware reads explicit states. | M |

**Outcome of P0:** the `charge_failed` middleware branch can finally fire from real failures; state is explicit and audited.

### P1 — Recover the revenue
| Item | Effort |
|---|---|
| **`NotifyCardExpiringJob`** (pre-dunning, ~30 days out). Highest ROI / lowest effort. | S |
| **Print-Flow retry loop** — `RetrySubscriptionChargeJob` + `billing:run-dunning` command + scheduler; Day 1/3/5/7 keyed off `past_due_since`; cap ~5; decline-type branch; capability flag on `SubscriptionGatewayInterface` (Stripe trusts Smart Retries, others driven by Print-Flow). | M–L |
| **Platform→tenant dunning email sequence** — 4 Blade views in `resources/views/emails/system/` + jobs driven by state transitions; one-click recovery link each. Landlord-side only. | M |
| **Self-serve recovery page** (`nuxt/`) — SetupIntent/Billing-Portal, retry-on-success, route whitelisted, plain-language banner. | M |

### P2 — Measure & harden
| Item | Effort |
|---|---|
| **Recovery instrumentation** — persist failed/retried `SubscriptionTransaction` rows; `recovered_at`; landlord admin dashboard tile (past_due count, recovery rate, $ at risk) Action-Center-style. | M |
| **Remote-mode parity** — `SubscriptionVerifyController` returns new states; keep verify paths in sync; update `readme/PAYMENT_GATEWAYS.md` + `readme/DEPLOYMENT_REMOTE_SUBSCRIPTION.md`. | S–M |

---

## 8. Success metrics to track

- **Involuntary-churn recovery rate** = recovered tenants ÷ failed-payment tenants. Target the **50–65%** benchmark; flag if below 40%.
- **Pre-dunning save rate** — % of card-expiry-warned tenants who update before any failure (target the 15–22% at-risk-revenue lift).
- **Recovered MRR / $ recovered per period** (the headline number for ROI; expect 10–15× on dunning spend).
- **Funnel counts** — `past_due` count, `grace` count, `suspended` count, `cancelled-after-dunning` count (where the sequence ended). Sourced from the new explicit states + `SubscriptionTransaction` failed/retried rows.
- **Retry success by attempt #** (Day 1/3/5/7) and **by decline type** (hard vs soft) — tune the schedule.
- **Voluntary vs involuntary churn split** — proves how much of total churn dunning is addressing.
- **Time-to-recovery** (`recovered_at − past_due_since`).

---

## 9. Key file references

| Area | Path |
|---|---|
| Billing orchestration | `app/Services/BillingService.php` |
| Stripe recurring adapter (latent bug) | `app/Services/Billing/StripeBillingGateway.php` |
| Gateway registry (6 adapters) | `app/Services/Billing/SubscriptionGatewayRegistry.php` |
| Access enforcement (only churn touchpoint) | `app/Http/Middleware/EnsureTenantHasActiveSubscription.php` |
| Status resolve + cache | `app/Services/Subscription/SubscriptionStatusCache.php` |
| Subscription model | `app/Models/Subscription.php` |
| **Webhook dispatcher (extend this)** | `app/Services/Payment/PaymentEventDispatcher.php` |
| Webhook controller | `app/Http/Controllers/Api/Payment/PaymentWebhookController.php` |
| Idempotency ledger | `app/Models/PaymentWebhookEvent.php` |
| Webhook route | `routes/public-api.php` |
| Remote verify route | `routes/admin-api.php` (→ `SubscriptionVerifyController`) |
| Scheduler (no renewal entry today) | `routes/console.php` |
| **Pattern to mirror for new jobs** | `app/Jobs/System/NotifyTrialExpiringJob.php` |
| Account lifecycle emails | `app/Services/Admin/AccountStatusService.php` |
| Tenant-scoped failed-payment rule (wrong audience) | `app/Services/ActionCenter/Rules/FailedPaymentsRule.php` |
| Tenant email enum (wrong audience) | `app/Enums/EmailTemplateEnum.php` |
| Subscriptions table migration | `database/migrations/2025_05_31_182507_create_subscriptions_table.php` |
| Status/gateway enum migration | `database/migrations/2026_05_26_000001_add_gateway_key_and_statuses_to_subscriptions_table.php` |
| Payment-profile gateway fields (pre-dunning data) | `database/migrations/2026_05_25_000004_add_gateway_fields_to_tenant_payment_profiles_table.php` |
| Trial-expiring email view (template to copy) | `resources/views/emails/system/trial-expiring.blade.php` |
| Docs to update (maintenance rule) | `readme/PAYMENT_GATEWAYS.md`, `readme/DEPLOYMENT_REMOTE_SUBSCRIPTION.md`, `readme/PAYMENTS_BILLING_FINANCIAL_CORRECTNESS.md` |
