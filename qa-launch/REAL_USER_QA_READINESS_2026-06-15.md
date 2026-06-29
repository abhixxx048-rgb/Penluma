# Real-User QA, Onboarding & Support Readiness - Print-Flow-360

> **Date:** 2026-06-15
> **Scope:** Pre-launch readiness for a platform that has **not yet been used by real users**, whose primary users are **non-technical store owners** who will not file good bug reports.
> **Method:** 13 read-only code-mapping sweeps + adversarial QA probes against **current code** (not docs), then synthesis. 26 agents, ~2.0M tokens. Every finding cites `file:line` and a confidence rating; runtime-only suspicions are marked `needs-runtime-check`.
> **Why this doc exists:** the older `readme/QA_*`, `PRE_LAUNCH_PLAN.md`, and `PLATFORM_GAP_ASSESSMENT_2026-06-07.md` are explicitly flagged stale in `GOAL.md`. This is a fresh re-verification plus deep coverage of three areas none of those docs really tackled: **first-run onboarding, support/help-desk, and feedback capture.**

---

## 0. TL;DR - Verdict

**Not launch-ready for self-serve, non-technical store owners.** The platform can browse, configure, cart, and place an order - but the money path leaks in ways the user is never told about, there is **no support spine**, and there is **no way to learn from real users** once they hit a problem.

**107 findings: 🔴 8 blockers · 🟠 36 high · 🟡 40 medium · 🔵 23 low.**

The single most important pattern, again, is the house **"silent-lie"** class (25 of 107 findings): the UI says *Saved / Paid / Successful / link sent* while the write silently failed or never happened. Two are outright **security backdoors**, both re-verified by hand in current code:

- A **hardcoded master OTP `702702`** logs in as *any* admin if the `MASTER_OTP` env var is unset (`AuthController.php:368`).
- **Customer password reset is a stub** that logs a TODO and returns *"you will receive a password reset link shortly"* - no email is ever sent (`CustomerAuthController.php:496-501`). A locked-out customer is permanently locked out and told help is on the way.

### Readiness scorecard

| Area | 🔴 | 🟠 | 🟡 | 🔵 | Total | Verdict |
|------|----|----|----|----|-------|---------|
| **Money path** (signup→…→fulfillment) | 4 | 19 | 22 | 14 | 59 | 🔴 Not ready - money moves/misreports + 2 auth backdoors |
| **Loading/empty/error states + mobile** | 0 | 5 | 6 | 1 | 12 | 🟠 Critical pages blank on failure; no shared ErrorState |
| **Onboarding / first-run** | 0 | 4 | 5 | 2 | 11 | 🟠 Unguided first-run; setup checklist gives false "done" |
| **Support / help-desk** | 3 | 5 | 3 | 0 | 11 | 🔴 No support spine at all (no tickets, no owner diagnostics) |
| **Feedback capture** | 1 | 3 | 4 | 6 | 14 | 🔴 Platform can transact but cannot listen |

### Section deep-dives (companion files)

- **`readme/qa_section_money_paths.md`** - the 7-stage money path, stage by stage.
- **`readme/qa_section_onboarding.md`** - brand-new store-owner first-run experience.
- **`readme/qa_section_support.md`** - store-owner + customer support readiness.
- **`readme/qa_section_feedback.md`** - reviews, surveys/NPS, proactive problem detection.

---

## 1. The 8 blockers (fix before any real user touches this)

| # | Blocker | Area | Where | Class |
|---|---------|------|-------|-------|
| 1 | **Hardcoded master OTP `702702` bypasses admin 2FA** if `MASTER_OTP` env unset | Auth | `app/Http/Controllers/AuthController.php:368` | security / silent-lie |
| 2 | **Customer password reset is non-functional** - returns "link sent", sends nothing (TODO stub) | Auth | `app/Http/Controllers/Api/Storefront/CustomerAuthController.php:496-501` | silent-lie |
| 3 | **Stock is never decremented** at order placement or payment → unlimited oversell | Fulfillment | `StorefrontCheckoutController.php` (no `deductStock`); `UpdatePaymentAndOrder.php:155-166` | money-mismatch |
| 4 | **Required file-upload product options silently dropped from validation** → buyer orders a print job with no artwork, UI says OK | PDP | `frontstore/app/stores/productInfo.ts:139-146, 709-714` | silent-lie |
| 5 | **Store owners cannot see their own error logs** (gated to `is_admin`) → blind during incidents | Support | `nuxt/.../setting/log/index.vue:230`; `LogController.php:18` | support-gap |
| 6 | **Contact-form submissions are silent** - no reference number, no confirmation email, no status | Support | `DynamicFormBlock.vue:28-36`; `StorefrontFormController.php:192-198` | silent-lie |
| 7 | **No support ticket system exists** - submissions are write-only, no escalation/SLA | Support | ABSENT (no `Ticket` model/controller; only `StoreFormSubmission`) | support-gap |
| 8 | **No post-delivery satisfaction/NPS loop** - platform cannot learn it shipped a bad job | Feedback | ABSENT (no survey model/job/template) | feedback-gap |

> ⚠️ **Blockers 1 & 2 are security/credential issues** - they should be treated as the top priority regardless of launch timing. Both were re-verified by hand in current code for this report.

---

## 2. Critical money path - stage by stage

Full detail and the complete 73-row deduped findings table are in **`readme/qa_section_money_paths.md`**. Summary of where each of the 7 stages stands:

| Stage | State | Headline issues |
|-------|-------|-----------------|
| **1. Signup & Auth** | 🔴 | Master-OTP backdoor; dead password reset; OTP-resend endpoints unthrottled. |
| **2. Product config / PDP / pricing** | 🟠 | Pricing *math* is largely sound (good news), **but** required file-upload options dropped from validation (🔴), and per-size pricing never applied to base price (money-mismatch). |
| **3. Cart** | 🟠 | Cart↔checkout **tax** formula differs (cart store-wide rate vs checkout per-item); cart shows first flat-rate method, checkout lets customer pick another; guest cart key not tenant-scoped (localStorage collision on shared domains). |
| **4. Checkout** | 🟠 | New shipping/billing address arrays have **no FormRequest validation** → fields silently set to empty string; `CheckoutCustomFieldsTest` failing (possible live regression); shipping cost can resolve to **$0** for any non-`flat_rate_` method. |
| **5. Payment & gateways** | 🟠 | Offline (cheque/bank/pickup) orders show **"Payment Successful"** while `payment_status='pending'`; missing `webhook_secret` hangs orders in pending forever; cheque orders never auto-reconcile. |
| **6. Order creation & confirmation** | 🟠 | Confirmation **email sent at draft** (before payment) saying "received and being processed"; email shows **item subtotal only**, not the real total with shipping/tax/coupons. |
| **7. Fulfillment / production / shipping** | 🔴 | Structurally incomplete: **no PRODUCTION/FULFILLED/SHIPPED statuses**, EasyPost integration built but **never wired** into checkout, preflight validation disabled, print-ready PDF can be **NULL** at checkout (blocks later production download), no partial fulfillment, tracking entered by hand. The "paid → shipped" spine does not exist. |

**Money-math truth (the launch gate):** the platform does **not** currently guarantee `cart total === checkout total === order total === invoice`, and inventory does not decrement. The cart/checkout **tax** and **shipping-method** divergence and the **$0-shipping** path are the live money-mismatch risks; the older "$49→$100 shipping" symptom from `QA_FINDINGS_2026-06-01.md` is superseded by these (see §6).

---

## 3. Onboarding & first-run readiness

Full detail in **`readme/qa_section_onboarding.md`**. Verdict: 🟠 **a brand-new owner is not guided to a working store.**

- **No guided first-run.** A freshly registered tenant lands on an empty store list with **no auto-created first store** and **no post-registration wizard** (`store/Select.vue:13` lacks an empty state).
- **The setup checklist gives false "done" signals (silent-lie class).** The payment-gateway step marks complete on `is_active`/`is_configured` flags **without testing credentials** (`useSetupChecklist.ts:247-259`); the shipping step completes on `data.length > 0` **without checking any rate is active/valid** (`:274-285`) - and `StoreOnboardingService` seeds 2 rates, so it shows green by default.
- **The checklist auto-expires at day 31 regardless of completion** (`useSetupChecklist.ts:135-150`, `EXPIRE_DAYS=30`) - a half-configured store loses its only guidance.
- Empty states across admin mostly exist with CTAs, but lack contextual help on the hard features (Designer, Form Builder, Pricing Rules, Shipping).

**Key recommendation:** a **server-computed "can this store take a real order?" signal** (payment gateway verified + ≥1 published product + valid shipping + store info) that drives both the checklist and a "you're ready to sell" state - replacing the current existence-only flag checks.

---

## 4. Support / help-desk readiness

Full detail in **`readme/qa_section_support.md`**. Verdict: 🔴 **there is no support spine.**

- **Owner blind spot (🔴):** non-admin store owners are walled out of their own error logs (`setting/log/index.vue:230`, `LogController.php:18`). When their storefront 500s, they cannot see why and cannot self-diagnose.
- **Silent contact form (🔴):** customer submissions return no reference number, no confirmation email, no status - `DynamicFormBlock.vue` even **drops the returned UUID**.
- **No ticketing (🔴):** submissions write to `StoreFormSubmission` and stop. No `Ticket` model, no escalation, no SLA, no reply panel.
- **High gaps:** storefront 500s never alert anyone (errors persist to `error_logs` but only admins ever look); no global Help/Docs/Support menu in admin (`store-management.vue:299-354`); the 500 error page has **no contact info or error reference** (`frontstore/app/error.vue:65-68`); ~20 store-owner help docs exist in `readme/docs/content/` but are **not linked anywhere in-product**; `FloatingChat` is internal-messaging only, not wired to customer support.

**Key recommendation:** the cheapest high-impact win is **surfacing what already exists** - link the offline docs into a Help menu, show contact details + an error reference on error pages, and give owners a tenant-scoped diagnostics view - before building a full ticket system.

---

## 5. Feedback capture readiness

Full detail in **`readme/qa_section_feedback.md`**. Verdict: 🔴 **the platform can transact but cannot listen.**

- **No post-delivery satisfaction/NPS loop (🔴):** `EmailTemplateEnum.php` has 15 templates, none for feedback; no `OrderFeedback` model, no `OrderDelivered` listener. The platform cannot learn it shipped a bad job.
- **Checkout/payment failures are invisible as friction (🟠):** `useGtm.ts` fires only happy-path events; `ErrorLogService` excludes `ValidationException` (`:35`), so a 422 checkout failure looks identical to a cart abandon. You cannot tell "they left" from "we broke."
- **No abandoned-cart recovery (🟠)** and **vanity analytics (🟠)** that answer no friction question.
- **"Owner is never told" cluster (🟡):** pending reviews never notify the owner; inbound order messages have a storefront UI but no admin reply panel (`needs-runtime-check`); error spikes never alert.
- Note (§0 violation): raw `SQLSTATE`/stack traces are shown to non-technical owners in `setting/log/index.vue:71,93-97` - and the mapping must target **PostgreSQL** SQLSTATE codes (the platform is Postgres, not MySQL).

**Key recommendation:** the transactional email plumbing (`ORDER_SHIPPED`, `PAYMENT_FAILED` templates already exist) is the cheapest insertion point for a 1-click NPS survey and abandoned-cart recovery - the lift is smaller than previously assumed.

---

## 6. Stale-doc corrections (vs. earlier QA docs)

GOAL.md is right that the old docs are stale. Reconciled against current code:

- **Cart→checkout shipping "$49 → $100"** (`QA_FINDINGS_2026-06-01.md` §1): the *specific* symptom is not the live bug anymore - checkout no longer trusts client totals. **However**, the current live shipping risks are different and real: shipping resolves to **$0** for any non-`flat_rate_` method, and the cart shows the *first* flat-rate method while checkout lets the customer pick a *different* one. Treat the shipping path as **still not parity-safe**, just for new reasons.
- **PDP "$77 vs $75" price mismatch:** the pricing math is now largely sound; the live PDP money issue is **per-size pricing never applied to base price** (`productInfo.ts:940-946`) - a different mismatch than the old report.
- **`ORDER_SHIPPED` / `PAYMENT_FAILED` templates:** confirmed to **exist** - they are transactional, not feedback templates, but they're the recommended hook for the missing survey/recovery flows.
- **Setup-checklist `shouldShow` logic:** re-verified - it is an **AND of negated guards** (`useSetupChecklist.ts:142-150`), not the "OR condition" an early draft claimed. Behavioral conclusion (auto-hide at day 31) is unchanged.

---

## 7. Recommended launch gate + QA process

**Hard launch gate (must be green):**
1. Remove the master-OTP backdoor (#1); ship a real customer password reset (#2). *(security)*
2. Decrement inventory on payment-captured, atomically (#3); add a test.
3. Stop showing "Payment Successful" for unpaid offline orders; the success page must read the real `payment_status`.
4. Validate new address arrays + required file-upload options in their FormRequests (no silent empty-string / dropped artwork).
5. Money-truth test suite: `cart total === checkout === order === invoice` incl. shipping + tax, plus a shipping round-trip test (no $0 path).
6. A shared **ErrorState** component on the critical money-path pages (checkout, orders list, order detail) - no page blanks on fetch failure.

**Then (pre-public, churn-preventers):** server-computed "ready to sell" onboarding signal; surface existing help docs + error references + owner diagnostics (support spine v1); 1-click post-delivery NPS + abandoned-cart recovery on the existing email plumbing.

**Process going forward** (non-technical users won't report bugs - you must catch these yourself):
- Run `readme/QA_TEST_CHECKLIST.md` on desktop **and at 375px**, focusing on the all-three-states rule (loading/empty/error) and the silent-lie class.
- Add a regression test for every blocker/high in §1–§2 - a finding with no test is not fixed.
- Wire proactive detection (error-spike alerting + checkout-failure events) so the next class of bugs surfaces from telemetry, not from a churned customer.

---

*Generated from 13 code-grounded research streams on 2026-06-15. Section files: `qa_section_money_paths.md`, `qa_section_onboarding.md`, `qa_section_support.md`, `qa_section_feedback.md`. Raw findings (107) available in the workflow output.*
