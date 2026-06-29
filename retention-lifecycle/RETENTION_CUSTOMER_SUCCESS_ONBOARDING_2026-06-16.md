# Customer Success & Onboarding for Non-Technical Store Owners

**Date:** 2026-06-16
**Status:** research-only (nothing built yet)

## TL;DR

Print-Flow-360 already ships a genuinely good *first half* of new-tenant onboarding: a real, API-verified 5-step "Get your store ready" checklist on the dashboard, a seeded demo catalog so a store can transact on day one, and robust seeding services for roles/automations/CMS/shipping/payments. What it lacks is the *second half* — the part that actually drives retention. Onboarding progress lives only in browser `localStorage`, so it resets per device and is **completely invisible to the platform/landlord**; the "definition of done" is setup completion rather than the activation event that predicts retention (**the first real order**); there is no place-a-test-order path to reach that aha-moment without waiting on a real customer; there is no in-app help, tour, or contextual explainer for non-technical owners; and there is no tenant health score or proactive nudge sequence beyond a single trial-expiry email. This doc maps what exists, the gaps, the benchmarks, and a concrete P0→P3 build plan that follows the codebase's UUID / `BelongsToTenant` / controller→service→resource / composable conventions.

---

## 1. Why this matters for a non-technical-store-owner print SaaS

The primary users of Print-Flow-360 tenant admin are **non-technical print-shop owners** (see `CLAUDE.md §0`). They don't read docs, they navigate by intuition, and they judge the product in the first session. For a SaaS aimed at this audience, onboarding *is* the product experience that decides whether they stay:

- **70% of B2B SaaS churn happens in the first 90 days** (ProductLed). The single biggest lever on retention is shortening **time-to-first-value (TTV)** — getting the owner to a real "this works for my business" moment fast.
- Non-technical owners stall on exactly the steps Print-Flow's checklist surfaces — "Connect a payment gateway," "Configure shipping rates" — because they don't know what those things *are*, not because the UI is broken. They need explainers and guidance, not just links.
- For this audience the aha-moment is concrete and emotional: **seeing an order land in their admin.** A checklist that turns all-green but never produces that moment will still churn (Candu/Userpilot 2025).
- The platform owner (landlord) currently flies blind: there is no way to see which tenants activated, which stalled, or which are at risk — so there is no way to run proactive customer success at all.

---

## 2. The two audiences — and which this doc is about

Print-Flow-360 has **two distinct onboarding/CS audiences**. They are routinely confused; keep them separate.

| | **Audience 1 — Platform → Tenant** | **Audience 2 — Store owner → End-customer** |
|---|---|---|
| Who | The landlord/SaaS helping a new print-shop owner activate their store | The store owner engaging *their* retail customers |
| Surface | Admin dashboard (`nuxt/`), landlord/super-admin area, tenant lifecycle emails | Storefront (`frontstore/`), customer notifications, the 5 seeded automations |
| Existing assets | SetupChecklist, onboarding seeders, trial-expiry email | 5 default automations seeded per tenant, end-customer emails |
| **This doc** | ✅ **PRIMARY FOCUS** | ❌ out of scope (covered by storefront retention roadmap) |

**This doc is about Audience 1.** A key gap below is that the 5 default automations seeded for a tenant serve *their end-customers* (Audience 2) — there is **no welcome/education drip to the tenant** (Audience 1) beyond one account-created email and the trial-expiry email.

---

## 3. What already exists in the codebase

Note: an earlier grounding map claimed there was no guided setup; **that was stale/wrong.** Verified state below.

### 3.1 Guided setup checklist (built and wired)
- Component: `nuxt/app/components/dashboard/SetupChecklist.vue`
- Logic/composable: `nuxt/app/composables/useSetupChecklist.ts`
- Mounted on the dashboard: `nuxt/app/pages/index.vue:30` (`<DashboardSetupChecklist/>`)

It is a real "Get your store ready" checklist with: a 5-step list, a progress bar (`completedCount/requiredCount` + %), a dismiss button, a completion congrats banner, and a per-step loading state (meets `CLAUDE.md §0` loading/empty/error rules).

**The 5 steps are launch-critical and verified against real API endpoints — not fake checkmarks:**

| Step | Verified via | Notes |
|---|---|---|
| 1. Upload store logo | `store.logo_url` | |
| 2. Connect a payment gateway | `GET /stores/{id}/integrations?category=payment` (`is_active && is_configured`) | |
| 3. Add your first product | `GET /products` total > 0 | |
| 4. Configure shipping rates | `GET /stores/{id}/shipping-rates` length > 0 | |
| 5. Preview your storefront | — | marked **optional** |

Steps resolve the store dynamically and deep-link to the right config page with plain-language labels (e.g. "Set Up Payment Gateway").

### 3.2 Demo / sample catalog (seeded, well-handled in UI)
- `app/Services/Onboarding/StoreOnboardingService.php:858` seeds **4 demo products** with `is_demo=true`, plus 4 categories, a `WELCOME10` coupon, Standard ($5) + Pickup shipping, and an **offline Cheque/Bank-Transfer payment method** — so a new store can transact on day one.
- The products list surfaces this responsibly: a sample-count banner + a **"Remove samples"** action with a proper consequence-stating confirm dialog (`nuxt/app/pages/products/index.vue:34,49,400-404`) and a per-row "Sample" badge (`:129,326`).

This is a strong day-one-value foundation and a pattern to reuse (see P0 test-order recommendation).

### 3.3 Seeding-based onboarding services (robust)
- `app/Services/Onboarding/TenantOnboardingService.php` — roles, 5 default automations, statuses, email templates.
- `app/Services/Onboarding/StoreOnboardingService.php` — settings, 8 system pages, 11-block homepage CMS, footer, nav, SEO, shipping, offline payment.
- Documented in `readme/ONBOARDING.md`. Entry commands: `app:new-tenant-registered` / `app:new-store-created`.

### 3.4 Existing proactive nudges & lifecycle emails
- `app/Jobs/System/NotifyTrialExpiringJob.php` — scheduled `dailyAt('08:00')` in `routes/console.php`; emails the tenant admin at the configured window + 1-day mark. **This is the only proactive onboarding/retention nudge today.**
- Tenant lifecycle emails: `NotifyTenantApprovedJob` / `Blocked` / `Deactivated` / `Reactivated` via `app/Services/Admin/AccountStatusService.php`.

### 3.5 Action Center (reusable proactive-alert surface)
- `app/Services/ActionCenter/` produces a computed "what needs action now" feed (e.g. `app/Services/ActionCenter/Rules/FailedPaymentsRule.php`), surfaced on the dashboard via `DashboardActionCenterWidget.vue`. This is an ideal host for onboarding/CS nudges (see P2 `OnboardingIncompleteRule`).

---

## 4. Gaps

1. **No server-side activation/onboarding tracking (the single biggest gap).** Grep confirms there are no `onboarding_progress` / `setup_progress` / `activated_at` / `first_order_at` / `onboarding_completed` columns on any model or migration. The checklist's entire state lives in browser `localStorage` (`pf360_setup_checklist_v1`, `useSetupChecklist.ts:10`). Consequences: (a) progress resets per browser/device and is invisible to a second staff user; (b) the landlord has **zero visibility** into which tenants activated — no proactive CS, no funnel metric, no at-risk detection.

2. **The aha-moment is wrong.** Per prior conversion-funnel research the North Star is "store live + **first order** in 7 days," but the checklist's definition of done is purely *setup* completion (logo/payment/product/shipping). It never tracks the activation event that actually predicts retention — the first real customer order. There is no "first order received" milestone, celebration, or signal anywhere.

3. **No demo/sandbox mode — and no place-a-test-order path.** Only `is_demo` *sample rows* are seeded into the real store. There is no isolated "try with fake data" experience and, crucially, no way for the owner to run their own checkout/order flow before a real customer does. Today the aha-moment can only happen via a real customer.

4. **No in-app guidance / product tour / help center.** Grep for `tour` / `driver.js` / `shepherd` / `intro.js` / help-center / `?`-help-menu found nothing; no `*help*` or `*support*` page under `nuxt/app/pages`. `readme/qa_section_support.md` already flags absent in-app help / Help-menu / guided tour as High gaps. Non-technical owners get a checklist but no contextual "what is a payment gateway?" explainers, no first-run tour, no searchable help.

5. **No time-to-value instrumentation.** Nothing records when a tenant registered vs. completed each step vs. first order — so TTV (the core onboarding KPI; PLG target <24h) cannot be measured, and onboarding-completion-rate (industry avg ~19%) is unknowable.

6. **No health-score / at-risk model for tenants.** No `RiskScoringService`, no tenant health/engagement score. The only churn signal is binary subscription status + the trial-expiry email — no early warning to trigger proactive outreach to a stalled new tenant.

7. **Checklist hard-expires at 30 days** regardless of whether the store went live (`useSetupChecklist.ts` `EXPIRE_DAYS=30`). A tenant who stalls on day 5 *loses their guidance* on day 30 — the opposite of proactive CS.

8. **Empty-state nudges aren't tied to onboarding.** Module list pages have good empty states (products especially), but there's no cross-app contextual "you haven't connected a payment gateway yet → here's why it matters" nudge outside the dashboard checklist. Once the checklist is dismissed, guidance disappears everywhere.

9. **No welcome/education drip to the tenant (Audience 1).** The 5 seeded automations serve *end-customers* (Audience 2). For the tenant there is only a single account-created email (`SendNewUserEmailJob`) and the trial-expiry email — no Day 1 / Day 3 / Day 7 finish-setup sequence, and the landlord-side email engine has no time-delayed multi-step journeys to build one on.

---

## 5. Best practices & benchmarks (cited)

- **Define ONE observable activation event before designing onboarding.** Activation (real value reached) beats checklist completion — a user who finishes every step without a value moment still churns. — Candu, 2025 (https://www.candu.ai/blog/best-saas-onboarding-examples-checklist-practices-for-2025)
- **Keep the checklist to 3–5 steps centered on core value.** 15-step tours convert <20%. Checklists work via the Zeigarnik effect (open loops) + visible progress. — Candu / Flowjam 2025 (https://www.flowjam.com/blog/saas-onboarding-best-practices-2025-guide-checklist)
- **Benchmarks:** onboarding completion averages ~19.2% (median 10.1%); >40% is good, >60% exceptional. TTV target for PLG is <24h, <1h strong, <5min world-class. — Candu, 2025
- **Show non-technical users only what they need to activate; defer non-essentials; personalize by role.** — insaim.design / Candu 2025 (https://www.insaim.design/blog/saas-onboarding-best-practices-for-2025-examples)
- **70% of B2B SaaS churn happens in the first 90 days** — improving time-to-first-value has the most direct retention impact; instrument and intervene early. — ProductLed (https://productled.com/blog/saas-low-touch-customer-onboarding)
- **Use a mixed model:** self-serve onboarding for everyone, automated proactive outreach when a user gets stuck, human help reserved for high-value/at-risk accounts. — Gainsight 2026 (https://www.gainsight.com/essential-guide/customer-success/); LowChurn 2025 (https://www.lowchurn.com/blog/customer-success-strategies)
- **Health scores combine product-usage + engagement + sentiment + business signals** to flag Healthy / Stable / At-Risk weeks before churn. — EverAfter 2025 (https://www.everafter.ai/glossary/customer-health-score); Accoil (https://www.accoil.com/blog/customer-health-score)
- **Self-serve education** (searchable help center + templates/examples) lets non-technical users unblock themselves at scale and is a prerequisite for low-touch CS. — Userpilot (https://userpilot.com/blog/customer-success-tools/)

---

## 6. Recommended architecture for THIS codebase

All new work must follow `CLAUDE.md §5` invariants: `HasUuid`, `BelongsToTenant`, controller→`FormRequest`→service→resource→`successResponse()`, business logic only in `app/Services/{Module}/`, every `$fetch` wrapped in a composable, Pinia for state, tests for any service method with business logic. Database is **PostgreSQL** — write Postgres-compatible schema.

### 6.1 Server-side onboarding/activation record (foundation for everything)

New migration + model. One row per store (tenant-scoped). Postgres notes inline.

```
Table: store_onboarding_progress   (tenant-scoped; HasUuid + BelongsToTenant)
  - id              bigint PK
  - uuid            uuid (HasUuid)
  - tenant_id       uuid  (BelongsToTenant — do NOT add manual where('tenant_id'))
  - store_id        uuid  FK -> stores
  - registered_at            timestamptz NULL
  - logo_done_at             timestamptz NULL
  - payment_done_at          timestamptz NULL
  - product_done_at          timestamptz NULL
  - shipping_done_at         timestamptz NULL
  - storefront_previewed_at  timestamptz NULL
  - first_order_at           timestamptz NULL   -- the activation event
  - activated_at             timestamptz NULL   -- store live AND first order
  - dismissed_at             timestamptz NULL
  - timestamps
  unique(store_id)
```

Use nullable `timestamptz` per step (a timestamp answers both "is it done?" and "when?", enabling TTV measurement) rather than booleans.

- **Model:** `app/Models/StoreOnboardingProgress.php` — `use HasUuid, BelongsToTenant;`.
- **Service:** `app/Services/Onboarding/OnboardingProgressService.php`
  - `computeProgress(Store $store): array` — **business logic ⇒ requires a test (`CLAUDE.md §5`)**. Reuse the exact same checks `useSetupChecklist.ts` already performs server-side: logo via `store.logo_url`, payment via the payment integrations active+configured check, product count > 0, shipping rates length > 0. Persist each `*_done_at` the first time its check passes.
  - `recordFirstOrder(Store $store): void` — sets `first_order_at` (idempotent) and, when setup is also complete, `activated_at`. Called from `app/Services/OrderService.php` at the same ~25 automation-dispatch sites that already fire on order creation.
- **Controller/route:** `GET /onboarding/progress` (tenant store-api) → `OnboardingResource`.
- **Frontend:** rewrite `useSetupChecklist.ts` to read/write the API; keep `localStorage` only as a fast-paint cache. This fixes per-device reset, makes progress visible to all staff, and unlocks landlord visibility.

### 6.2 First-order milestone + aha-moment celebration
- Add a 6th, **non-dismissible** step "Receive your first order" to `SetupChecklist.vue`, driven by `first_order_at`.
- On first order, fire a celebration: toast (`showSuccess()`) + a dashboard banner in plain language ("You got your first order! 🎉"). Detect the transition client-side from the progress API, or push via the existing notification mechanism.
- Stop hard-expiring guidance at 30 days while the store isn't live (see 6.7).

### 6.3 "Place a test order" path (cheapest TTV win)
- Reuse the seeded demo product + `WELCOME10` + the offline payment method so the owner runs their **own** checkout end-to-end and sees an order land in admin.
- Extend the existing `is_demo` concept to orders so the test order is clearly labeled and removable alongside "Remove samples" (mirror `nuxt/app/pages/products/index.vue:34,49,400-404`).
- Surface it as a checklist sub-action ("Try placing a test order") that deep-links into the storefront checkout pre-loaded with the demo product.

### 6.4 Landlord-side onboarding visibility + nudges (Audience 1)
- Surface the new activation record in the super-admin/landlord area as a **funnel** (registered → setup complete → first order) and a **per-tenant status** (Activated / Stalled / At-Risk). New admin components under `nuxt/` (landlord area).
- Add a scheduled job in `routes/console.php` alongside `NotifyTrialExpiringJob` — `app/Jobs/System/NotifyStalledOnboardingJob.php` — that emails tenants who registered but haven't completed setup / placed a first order by **Day 3 / Day 7**, using `app/Services/EmailService.php` + a new `EmailTemplateEnum` slug `ONBOARDING_NUDGE` (`app/Enums/EmailTemplateEnum.php`). This is the minimum proactive-CS layer; today only the trial-expiry job exists.

### 6.5 In-app Help / guidance surface
- (a) A persistent **Help** entry in the admin layout (`nuxt/app/layouts/store-management.vue`) opening a slide-over with searchable articles + links into the relevant `readme/` docs.
- (b) Contextual one-line explainers on each checklist step honoring `§0` plain language: e.g. "A payment gateway lets customers pay you online — we'll walk you through it."
- (c) A lightweight **first-run tour** (3–5 stops max: Products → Storefront → Orders). Tours >15 steps convert <20%, so stay minimal. A small dependency (driver.js) or a hand-rolled spotlight; gate behind the onboarding-progress state so it shows once.

### 6.6 Tenant health score (early at-risk detection)
- `app/Services/CustomerSuccess/TenantHealthService.php` — score from: days-since-registration vs steps-completed, `first_order_at` presence, login recency (`Tenant` already tracks `last_used_at`, `app/Models/Tenant.php`), order-volume trend, subscription status.
- Output Healthy / Stable / At-Risk; surface on the landlord dashboard and drive the stalled-onboarding nudge job (6.4). Combines usage + engagement + business signals per EverAfter/Accoil; targets the first-90-day churn window.

### 6.7 Smart escalation instead of 30-day expiry
- In `useSetupChecklist.ts`, don't hide guidance at 30 days if the store isn't live; **escalate** the dashboard nudge and feed the **Action Center** via a new `app/Services/ActionCenter/Rules/OnboardingIncompleteRule.php` (mirror `FailedPaymentsRule.php`) so "Finish setup to start selling" stays visible until activation. Reuses the Action Center surface already on the dashboard.

### 6.8 Self-serve education content
- Seed a small library of print-shop product templates/examples (business cards, flyers) the owner can one-click-add — lowers "add your first product" friction. Templates + examples are a proven low-touch activation lever (Userpilot).
- Seed a starter help-center article set for the Help slide-over (6.5).

---

## 7. Phased roadmap

| Phase | Item | Effort | Why now |
|---|---|---|---|
| **P0** | 6.1 Persist onboarding state server-side + `first_order_at` activation milestone (migration, `StoreOnboardingProgress`, `OnboardingProgressService` + test, `GET /onboarding/progress`, rewire `useSetupChecklist.ts`) | **L** (~3–5 d) | Fixes the single biggest gap; unblocks all landlord CS visibility and metrics |
| **P0** | 6.2 Redefine "done" as store-live-AND-first-order; non-dismissible "Receive your first order" step; aha-moment celebration; stop 30-day hard expiry | **S–M** (~1–2 d) | Aligns onboarding with the retention-defining event |
| **P0** | 6.3 "Place a test order" path reusing demo product + offline payment + `is_demo` on orders | **M** (~2–3 d) | Cheapest way to deliver TTV <24h without a real customer |
| **P1** | 6.4 Landlord funnel + per-tenant status + `NotifyStalledOnboardingJob` (Day 3 / Day 7) + `ONBOARDING_NUDGE` template | **M** (~2–4 d) | Minimum proactive-CS layer; today only trial-expiry exists |
| **P1** | 6.5 In-app Help slide-over + step explainers + 3–5-stop first-run tour | **M** (~3 d) | Non-technical owners can self-unblock; flagged High in `qa_section_support.md` |
| **P2** | 6.6 `TenantHealthService` (Healthy/Stable/At-Risk) on landlord dashboard | **M** (~2–3 d) | Early warning for the first-90-day churn window |
| **P2** | 6.7 `OnboardingIncompleteRule` in Action Center; replace hard expiry with escalation | **S** (~1 d) | Keeps guidance alive until activation; reuses existing surface |
| **P3** | 6.8 Product-template library (one-click-add) + starter help articles | **M** (~2–3 d) | Low-touch activation lever; lowers first-product friction |

Effort key: S ≈ ≤1 day, M ≈ 2–4 days, L ≈ 3–5 days (single engineer, includes tests).

---

## 8. Success metrics to track

Once 6.1 lands, the following become measurable for the first time:

- **Activation rate** — % of registered tenants that reach `first_order_at` (North Star: store live + first order within 7 days).
- **Time-to-value (TTV)** — `first_order_at − registered_at`. Target <24h (PLG); track median + p90.
- **Onboarding completion rate** — % reaching all required steps `*_done_at`. Benchmark: avg ~19%; aim >40%, exceptional >60%.
- **Per-step drop-off** — distribution of last-completed step (which step stalls non-technical owners — likely payment or shipping).
- **Test-order adoption** — % of tenants who place a test order before their first real order.
- **Stalled-tenant recovery** — % of Day-3/Day-7 nudge recipients who subsequently activate.
- **First-90-day retention** — cohort retention split by activated vs. not (validates the activation hypothesis).
- **Tenant health distribution** — Healthy / Stable / At-Risk counts trend; correlate At-Risk → churn to tune the score.

---

## 9. Key file references

- `nuxt/app/components/dashboard/SetupChecklist.vue` — the checklist UI
- `nuxt/app/composables/useSetupChecklist.ts` — checklist logic (localStorage state, `EXPIRE_DAYS=30`)
- `nuxt/app/pages/index.vue` — dashboard mounting the checklist (`:30`)
- `nuxt/app/pages/products/index.vue` — sample banner + "Remove samples" pattern to mirror (`:34,49,129,326,400-404`)
- `app/Services/Onboarding/TenantOnboardingService.php` — tenant seeding (roles, automations, statuses, templates)
- `app/Services/Onboarding/StoreOnboardingService.php` — store seeding; demo products `is_demo` at `:858`
- `app/Jobs/System/NotifyTrialExpiringJob.php` — only existing proactive nudge
- `app/Services/Admin/AccountStatusService.php` — tenant lifecycle emails
- `app/Services/EmailService.php` — email engine for the new `ONBOARDING_NUDGE`
- `app/Enums/EmailTemplateEnum.php` — add `ONBOARDING_NUDGE` slug
- `app/Services/OrderService.php` — call `recordFirstOrder()` at the order-creation/automation-dispatch sites
- `app/Services/ActionCenter/Rules/FailedPaymentsRule.php` — pattern for `OnboardingIncompleteRule`
- `routes/console.php` — register `NotifyStalledOnboardingJob` alongside trial-expiry
- `app/Models/Tenant.php` — `last_used_at` login-recency signal for health score
- `nuxt/app/layouts/store-management.vue` — host for the Help entry
- `readme/ONBOARDING.md` — existing seeding documentation
- `readme/qa_section_support.md` — flags absent in-app help / tour as High gaps
