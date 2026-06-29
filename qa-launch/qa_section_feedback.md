# Feedback Capture Readiness

**Assessment date:** 2026-06-15
**Audience:** Founder + engineering
**Scope:** How well the platform captures customer satisfaction signals, friction signals, and operational error signals — given that the primary users are **non-technical store owners who will not file good bug reports** and have **never used the product in production**.

---

## Verdict

**NOT READY — the platform is effectively blind to customer satisfaction and on-platform friction.**

Today the system can *transact* (orders, payments, shipping notifications all exist) but it cannot *listen*. There is no mechanism to ask a customer "how did we do?", no signal when a checkout fails, no recovery for abandoned carts, and no plain-language health surface for the owner. The one inbound channel that does exist for customers — order messages and product reviews — has **no admin-side delivery**: a customer can write "my order has color banding" or leave a 1-star review, and the store owner is never notified. Combined with an error console that dumps raw `SQLSTATE` stack traces at a non-technical SMB owner, the net effect is that **problems will accumulate silently until they show up as churn or chargebacks**, which is the worst possible failure mode for a first-cohort launch.

The single must-fix before onboarding real stores is the **post-delivery satisfaction loop** (blocker), because without it the founder has no instrument to learn whether the product is actually working for end customers. The cluster of "owner is never notified" gaps (pending reviews, inbound order messages, error spikes) is the next tier — each one converts a recoverable issue into a silent abandonment.

One stale-doc correction up front: earlier notes implied no shipping/payment-failure email scaffolding exists. **Re-verified — `EmailTemplateEnum.php` does ship `ORDER_SHIPPED` (line 29) and `PAYMENT_FAILED` (line 33).** Those are transactional, not feedback-capture, templates — but the email-template plumbing they ride on is the recommended insertion point for the missing survey/recovery templates, so the lift is smaller than previously assumed.

---

## Prioritized findings

| Severity | Finding | Where | Type | Confidence | Recommendation |
|---|---|---|---|---|---|
| **Blocker** | No post-delivery satisfaction survey or NPS mechanism | ABSENT (no model/job/template); `EmailTemplateEnum.php:8-37` | feedback-gap | confirmed-in-code | Add post-delivery survey job + email template + `OrderFeedback` model (rating, reason_category, raw text) |
| **High** | Checkout & payment errors not tracked as friction | `useGtm.ts:274-310`; `StorefrontCheckoutController.php:128-140` | silent-lie | confirmed-in-code | Add `trackCheckoutError`/`trackPaymentFailure` GTM helpers; fire on validation, gateway, inventory failures |
| **High** | Abandoned-cart recovery flow missing entirely | ABSENT (no model/job/template); `EmailTemplateEnum.php:8-37` | feedback-gap | confirmed-in-code | Track cart-abandoned timestamp, daily `AbandonedCartRecoveryJob`, `cart_recovery` template + GTM event |
| **High** | No friction/health analytics for owners | `analytics/index.vue:1-236` | feedback-gap | confirmed-in-code | Add "Friction & Health" card: checkout error rate, top error types (plain English), cart-abandon rate, review trend, zero-result searches |
| **Medium** | Review backlog invisible; no pending-review notification | `StorefrontProductReviewController.php:79-105`; `reviews/index.vue` | support-gap | confirmed-in-code | `ReviewSubmittedNotification` to owner; nav badge; per-store auto-approve; 60-day auto-publish |
| **Medium** | No error-monitoring alerts; errors require manual log grep | `ErrorLogService.php:47-69`; `setting/log/index.vue:37-118` | support-gap | confirmed-in-code | Email owner on >5 identical errors/hr; 7-day trend; plain-English summaries; conditional Sentry |
| **Medium** | Order messages wired in storefront but no admin reply panel | `OrderMessageThread.vue:1-320`; `profile/orders/[id].vue:204-206`; `OrderMessage.php:33` | missing-loading-empty | likely | Build admin order-message panel with reply, new-message notification, resolve/close, audit trail |
| **Medium** | Validation failures silently dropped, not logged | `CheckoutRequest.php:25-60`; `ErrorLogService.php:35` | silent-lie | confirmed-in-code | Log validation failures as `source=validation`; GTM `checkout_validation_error`; surface most-failed field |
| **Low** | No review sentiment/category tagging | `ProductReview.php:18-35`; migration `:22-25` | feedback-gap | confirmed-in-code | Auto-tag on create (keyword → category); `review_categories` JSON; breakdown card |
| **Low** | No helpdesk/support-ticket system | ABSENT (no Ticket/SupportCase model) | support-gap | confirmed-in-code | Add `SupportTicket` model (status/priority/category/SLA timestamps) + storefront "Contact Support" |
| **Low** | No auto-flagging of at-risk orders | ABSENT (no `Order.risk_level`) | feedback-gap | confirmed-in-code | `Order.risk_flags` JSON + `RiskScoringService` + "At-Risk Orders" list + daily digest |
| **Low** | No heatmap / session-replay integration | ABSENT (no Hotjar/Clarity/LogRocket) | feedback-gap | confirmed-in-code | Optional: replay-service ID in `StoreAnalyticsSetting`, conditional SDK load |
| **Low** | Raw technical error output shown to owners | `setting/log/index.vue:71,93-97` | bad-error-state | confirmed-in-code | `ErrorSummaryService` maps exceptions → plain English; full trace in collapsed "Debug Info" |
| **Low** | No GTM events on checkout/payment errors (funnel) | `useGtm.ts:274-310`; `checkout.vue` | feedback-gap | confirmed-in-code | Add `checkout_abandoned`/`checkout_error`/`payment_error` with abandonment-point field |

> Note: the "high" finding on checkout-error tracking and the "low" finding on missing GTM funnel events are two views of the same root cause (`useGtm.ts` has no error/abandon helpers). They are listed separately because the high item is about *missing the friction signal entirely* and the low item is about *funnel-step attribution*; fixing the high item should be scoped to deliver both.

---

## Detail on the most important items

### 1. Blocker — there is no way to ask a customer if they were happy

This is the defining gap for a pre-launch readiness review. `EmailTemplateEnum.php` enumerates 15 templates (lines 8–37) and **none** is a satisfaction, NPS, or post-delivery feedback email. There is no `PostDeliverySurvey`/`CustomerSatisfactionSurvey` model, no job in `app/Jobs/` to send a feedback request, and no `OrderDelivered` listener to trigger one. The order lifecycle runs to completion — the `ORDER_SHIPPED` template (line 29) even fires — and then the conversation simply ends.

For a first cohort this is not a "nice to have": it is the founder's only instrument for learning whether the product works for the people who actually receive the printed goods. Store owners are non-technical and will not build their own survey tooling.

**Recommendation:** add an `OrderFeedback` model (`rating`, `reason_category` ∈ {quality, speed, price, service}, free-text), an email template, and a job dispatched 3–5 days after `ORDER_SHIPPED`. Make it a 1-click NPS (0–10) with an optional reason field. Because the email-template and shipped-event plumbing already exist, this rides existing rails rather than introducing a new subsystem.

### 2. High — checkout and payment failures vanish; they look like cart abandonment

`useGtm.ts` instruments the *happy path* — `trackBeginCheckout` (line 274), `trackAddShippingInfo` (287), `trackAddPaymentInfo` (301), `trackPurchase` (315) — but has **no** `trackCheckoutError` or `trackPaymentFailure` helper. On the backend, `StorefrontCheckoutController.php` catches `PaymentSessionException` and returns a 422 (line 139) without emitting any analytics event or metric. And `ErrorLogService::shouldPersist()` explicitly excludes `ValidationException` (line 35), so a customer who fails checkout validation leaves **no trace anywhere** — not in GTM, not in `error_logs`.

The consequence is a *silent lie* in the owner's data: a customer who enters a bad card at the payment step, sees a toast, and leaves is indistinguishable from a customer who casually abandoned a cart. The owner sees "abandonment" and may "fix" it with discounts when the real problem is a broken payment gateway.

**Recommendation:** add `trackCheckoutError(reason, stepName)` / `trackPaymentFailure` firing a `checkout_error` event with `step` (shipping/payment/validation), `reason_code`, and `error_message`; emit on validation failure, gateway timeout, and inventory failure. Track these distinctly from generic 500s so conversion blockers are isolable. This is the same work that closes the low-severity "no funnel-drop events" finding.

### 3. High — abandoned carts are never recovered

No `AbandonedCart`/`CartAbandonment` model exists; none of the 18+ jobs in `app/Jobs/` reference cart recovery; and `EmailTemplateEnum.php` (re-verified lines 8–37) has no `cart_recovery` template. A cart can sit in the database indefinitely with no order and no follow-up. For a print-on-demand store where carts carry custom-designed, high-intent items, this is direct revenue left on the floor and — relevant to this section — a lost signal about *where* purchase intent breaks down.

**Recommendation:** stamp a `cart_abandoned` timestamp when a cart is >24h old with no order; schedule a daily `AbandonedCartRecoveryJob`; add a `cart_recovery` template (optionally with a discount code); and fire a `cart_abandoned` GTM event so the abandonment point is visible alongside finding #2.

### 4. High — the owner's analytics page can't answer a single friction question

`analytics/index.vue` (lines 1–236) renders revenue, order count, customer count, top products, order-status breakdown, and recent orders — a *vanity* dashboard. It contains no funnel, no error metrics, no review trend, and no zero-result-search view. The only place errors are visible is `/setting/log`, which (see #7) is raw technical output a non-technical owner cannot read.

So the owner can see *that* money came in, but not *why more didn't*: "What % of checkouts fail at payment?" and "Are print-quality complaints showing up in reviews?" are both unanswerable.

**Recommendation:** add a "Friction & Health" card surfacing last-7-day checkout error count and %, top 5 error categories in plain English (payment / validation / server), cart-abandonment rate, average review rating trend, and zero-result search terms. This card is the consumer for the events added in #2 and #3 and the summaries in #6/#7 — sequence it after those.

### 5–6. Medium — three "the owner is never told" gaps compound

Three findings share one failure pattern: an inbound signal exists but **never reaches the owner**.

- **Pending reviews** (`StorefrontProductReviewController.php:79-105`): a submitted review is created `status='pending'` and the customer is told "pending moderation" (line 97), but no `ReviewSubmittedNotification` fires. Reviews rot in limbo until the owner happens to visit `/reviews`. Add owner notification, a nav badge, a per-store auto-approve for verified purchases, and a 60-day auto-publish backstop.
- **Inbound order messages** (`OrderMessageThread.vue:1-320`, rendered at `profile/orders/[id].vue:205`): the *storefront* has a full send/receive/attachment thread, and `OrderMessage.php` carries a `user_id` (line 33) clearly intended for staff replies — but there is **no admin-side panel or controller** to read or answer them (confidence: likely; storefront wiring confirmed, admin absence inferred from missing route/controller). A customer reporting "color banding" gets silence, then leaves. Build the admin reply panel with new-message notification, resolve/close, and audit trail.
- **Error spikes** (`ErrorLogService.php:47-69`, `setting/log/index.vue:37-118`): all ≥500 errors persist, but there is no alerting or aggregation. Fifty identical "PDF generation timeout" errors over a week produce zero owner awareness. Add dedup-based alerting (>5 identical errors/hr → email), a 7-day trend, plain-English summaries, and conditional Sentry auto-enable. Note `pdf-service/src/lib/sentry.js` exists but is opt-in (off unless `SENTRY_DSN` is set).

### 7. Low but launch-relevant — the error console speaks developer to shopkeepers

`setting/log/index.vue` renders `exception_class` (line 71), `file:line` (line 93), and full stack traces (line 97) verbatim — e.g. `SQLSTATE[HY000]: General error: 2006 MySQL server has gone away`. This violates the project's own §0 "never surface raw technical output" rule directly in the owner-facing admin. A non-technical owner cannot tell a transient DB blip from a code defect, so they take no useful action.

**Recommendation:** an `ErrorSummaryService` that maps exception types to plain language (`SQLSTATE[HY000]` → "Database connection issue"; `PaymentGatewayException` → "Payment provider unreachable") with the full trace tucked into a collapsed "Debug Info" section for support. (Minor note: the example error string references MySQL, but this platform runs **PostgreSQL** per `CLAUDE.md §6`; the mapping table should be written against Postgres `SQLSTATE` codes.)

---

## Readiness recommendations (added — not findings)

These are obvious sequencing/launch-hygiene calls, labelled as recommendations rather than discovered defects:

1. **Minimum bar for first-cohort launch:** ship #1 (post-delivery survey) and the owner-notification half of #5/#6 (pending reviews + inbound order messages + error-spike email). Without these three, the founder is launching blind and customers' complaints land in a void.
2. **Build the analytics "Friction & Health" card last in this workstream** (#4) — it is the display surface that consumes the events and summaries created by #2, #3, #6, #7. Building it first yields an empty card.
3. **Treat the GTM helper as one change**, delivering both the high-severity friction signal (#2) and the low-severity funnel attribution (#13) from a single `useGtm` edit.
4. **Defer #9 (helpdesk), #10 (risk scoring), #11 (session replay), and #8 (review sentiment) to post-launch.** They are genuine gaps but not blockers for a first cohort, and several (replay, sentiment) are better validated against real traffic than built speculatively.
5. **Whatever feedback storage is added** (`OrderFeedback`, `cart_recovery`, validation logging) must follow the project's silent-drop invariant: every captured field must validate → save → read back → render, with a test that asserts persistence. The validation-drop finding (#7/#8 in the table) is itself an instance of this class.
