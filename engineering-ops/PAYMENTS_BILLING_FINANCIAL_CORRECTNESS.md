# Payments, Billing & Financial Correctness

> The canonical reference for how Print-Flow-360 takes money, what the law/standards require, and where today's code falls short.
> **Last researched: 2026-06-15**

**How to read this.** Each topic section pairs *the external standard* (what correct looks like, with citeable facts) against *what the code does today* (with `file:line` citations preserved from the audit), then lists *gaps* (severity-tagged) and *recommendations* (ordered, pointing at the exact files to change). If you only have five minutes, read the Executive Summary risk table (§1) and the Silent-Lie Watchlist (§7). If you are about to touch money code, read the relevant topic section in full first. Severity tags: **[CRITICAL]** = active money/compliance loss or violation; **[HIGH]** = realistic wrong-money or audit-failure path; **[MEDIUM]** = drift/inconsistency that will bite; **[LOW]** = hygiene.

**Disclaimer (read this).** The PCI and tax content below is *engineering guidance*, not legal, tax, or compliance advice. A real PCI assessment requires a Qualified Security Assessor (QSA); a real tax position requires a qualified tax professional in each jurisdiction. Nothing here certifies compliance — it tells engineers what to build so a QSA/tax pro has a fighting chance of signing off.

---

## 1. Executive summary

Print-Flow-360 runs **two independent payment subsystems that share no code**: (1) a SaaS/landlord subscription-billing layer (`app/Services/Billing/*`, driven by `BillingService` + `SubscriptionGatewayRegistry`, reading landlord-DB config), and (2) a tenant storefront customer-payment layer (`app/Services/Integrations/Payment/*`, driven by `PaymentGatewayInterface`/`AbstractPaymentGateway`, a registry, `CheckoutPaymentService`, and a signature-verified webhook pipeline). The storefront layer is genuinely well-engineered. The damage lives in a **third, legacy Authorize.Net path** (`app/Services/PaymentService.php`) wired into admin order/invoice/quote/customer/tenant controllers, plus several gaps where the good pipeline stops short of finishing the money story.

| Area | Current state | Risk level | Top gap |
|------|---------------|------------|---------|
| **PCI-DSS scope** | Storefront is correctly tokenized (Stripe Checkout redirect, SAQ-A); a parallel legacy Authorize.Net path accepts raw PAN+CVV over the API, **stores full PAN + CVV in plaintext**, and reveals them in the admin UI behind an eye-toggle | **CRITICAL** | CVV/PAN stored in plaintext (`PaymentService.php:269,272,181,184`); whole platform is realistically SAQ-D + a hard Req-3.2 violation |
| **Webhooks / idempotency** | Unified, signature-verified, two-phase idempotent pipeline keyed on `(gateway_key, event_id)`; genuinely good | **MEDIUM–HIGH** | Webhook runs with **tenancy NOT initialized** → gateway-config + Order lookups run unscoped across all tenants; no dead-letter sweep; no state-machine guard |
| **Refunds / chargebacks** | Admin Orders refund modal is a **pure silent-lie** (fields dropped, "Refund processed" shown, no money moves); only working refund is legacy Authorize.Net-only; 5 gateway `processRefund()` impls are dead code; dispute handling is a status-flip stub | **CRITICAL** | A non-Authorize.Net store **cannot refund at all**; chargebacks silently flip a flag nobody sees |
| **Currency / rounding** | Currency *is* now snapshotted onto documents (memory note stale); admin `formatMoney` is currency-aware | **CRITICAL** | Gateway charge currency read from **gateway config, not the order** (`CheckoutPaymentService.php:87`); hardcoded `*100` minor-unit conversion breaks JPY/KWD; `payments` table has **no currency column** |
| **Sales tax / VAT / GST** | Single flat per-store rate (`tax_enabled`+`tax_rate`+`prices_include_tax`), snapshotted per line; no `TaxService`, no destination/nexus logic | **HIGH** | No destination-based tax, no nexus/OSS/GST logic, no tax-exempt customers; storefront **ignores per-product `is_taxable`** and taxes everything |

---

## 2. PCI-DSS scope

### The standard / what correct looks like
- **Governing version:** PCI DSS **v4.0.1**, effective **1 April 2025** (superseded v4.0; v3.2.1 retired 31 March 2024). The 51 "future-dated" requirements lost their grace period on **31 March 2025** — as of 2026 *every* assessment runs against the complete v4.0.1 with no grace period.
- **Cheapest path = SAQ-A**, achievable only if the platform **never stores, processes, or transmits cardholder data** on its own systems. Qualifying patterns: redirect to the provider's hosted page, OR an iframe/embedded form where **all** payment fields originate directly from the compliant provider (Stripe Elements/Checkout served from Stripe's domain; Razorpay hosted Checkout). Both Stripe and Razorpay are PCI **Level 1** providers.
- **The dividing line:** if any merchant-served code can touch the card fields, you fall out of SAQ-A into **SAQ-A-EP** (~191 reqs) or **SAQ-D** (300+ reqs). Posting raw PAN to a gateway's server-to-server API ⇒ SAQ-D.
- **Prohibited storage (Req 3.3, formerly 3.2):** Sensitive Authentication Data (SAD) — **full track data, CVV/CVC/CID, and PINs/PIN blocks — must NEVER be stored after authorization, regardless of encryption.** CVV may never be persisted to disk, log, cache, or DB for any reason once authorized.
- **Allowed storage (Req 3.4/3.5):** provider **token**, **masked PAN** (first6 + last4), **brand**, **expiry**. Full PAN only if rendered unreadable (hash/truncation/tokenization/strong crypto) and displayed masked to ≤ first6+last4, full visible only on documented business need. Best practice and the SAQ-A model: store **only the token + last4 + brand + expiry**, never the full PAN.
- **The 2025 iframe trap (FAQ 1588):** v4.0.1 added two SAQ-A eligibility conditions — (1) all payment-page elements originate only/directly from a compliant TPSP; (2) the merchant confirms its site is not susceptible to script attacks. Condition (2) invokes **Req 6.4.3** (payment-page script inventory + integrity/authorization) and **Req 11.6.1** (payment-page + security-header tamper detection, evaluated ≥ weekly) — and **applies to embedded iframe forms** (Elements/Razorpay modal), NOT to pure redirect/hosted-page integrations. Satisfy it either by self-implementing 6.4.3/11.6.1 (SRI/CSP/monitoring) **or** by retaining the provider's written confirmation that their embedded solution protects against script attacks.
- **Always:** TLS on all payment pages; no card data in logs/Sentry/queue payloads; SAQ-A is still an annual self-assessment + AOC per acquirer (Stripe auto-generates a combined SAQ-A+AOC when Checkout/Elements is the sole collector).

### What Print-Flow-360 does today
- **Storefront path is correct (SAQ-A).** `StorefrontCheckoutController` → `CheckoutPaymentService::createPaymentSession` (`app/Services/Storefront/Checkout/CheckoutPaymentService.php:38`) → `StripeGateway::createCheckoutSession` (`StripeGateway.php:134`) returns `PaymentSessionResult::redirect($session->url)`; `getRenderMode()` is `'redirect'` (`StripeGateway.php:113`). The frontstore collects **no** card fields — `CheckoutPayment.vue:126` only shows a method selector and "You'll be securely redirected"; the embedded `StripeElementsDriver.vue:1-15` is an explicit unimplemented stub. A repo-wide grep of `frontstore/app` found no `card_number`/`cvv`/`exp_month`. Laravel stores only `gateway_reference`/`transaction_id` on the `Payment` row.
- **The legacy Authorize.Net path is non-compliant.** `PaymentService::addPaymentMethod` (`app/Services/PaymentService.php:221`) and `addPaymentMethodToTenant` (`:120`) write raw card data to the DB:
  - `PaymentProfile` created with `'card_last_four' => $cardNumber` (the **full** number into a column named last_four, `PaymentService.php:269`), `'expiration_date'`, and **`'cvv' => $cardCode`** (`:272`).
  - `addPaymentMethodToTenant` writes `'card_number' => $cardNumber` and `'cvv' => $cardCode` to `tenant_payment_profiles` (`:181`, `:184`).
  - Schema confirms plaintext: `2025_04_09_173425_add_cvv_column_in_payment_profiles_table.php` adds an unencrypted integer `cvv`; `create_payment_profiles_table.php` stores card fields as plain strings; `TenantPaymentProfile.php:16-27` lists `card_number`/`last_four` in `$fillable`. **No model anywhere uses an `encrypted` cast** (grep for `encrypted` returns nothing).
- **Raw PAN+CVV are POSTed to Laravel from many endpoints** and echoed back to the browser: `PaymentProfileController::store` (`:94-116`), Admin `TenantController` (`:827-841`), `OrderController` (`:1219`), `InvoiceController` (`:931-954`), `QuoteController` (`:944-947`), `PaymentController::store` (`:140-143,:356`). The admin UI `nuxt/app/components/customer/payment/profile.vue:25-43` renders `card_number`/`cvv`/`expiration_date` behind an eye/eye-slash reveal toggle.
- **All gateway secrets are stored in plaintext.** `StoreThirdPartyService` casts `configuration` only as `'array'` — no `encrypted:array` (`StoreThirdPartyService.php:30-34`); the billing layer's `Admin\ThirdPartySetting` casts `attributes` as plain `'array'`. So `stripe_secret`, `key_secret`, `webhook_secret`, `transaction_key` sit unencrypted in JSON columns.

### Gaps & risks
- **[CRITICAL]** CVV/CVV2 stored in the DB (`payment_profiles.cvv` int column; `tenant_payment_profiles.cvv`) — an absolute Req 3.2/3.3 prohibition, encryption-irrelevant.
- **[CRITICAL]** Full PAN stored unencrypted — the full number is written into `card_last_four` (`PaymentService.php:269`) and into `tenant_payment_profiles.card_number` (`:181`); violates Req 3.4.
- **[CRITICAL]** Multiple Laravel endpoints accept raw PAN+CVV in request bodies, forcing the whole app into SAQ-D and likely failing a QSA audit.
- **[CRITICAL]** All gateway API secrets (live keys, webhook secrets) stored plaintext in JSON config columns — a DB read/backup leak exposes every tenant's live payment credentials.
- **[HIGH]** Stored card data is reflected back to the admin browser behind a reveal toggle (`profile.vue:25-43`) — insider-threat / exfiltration-by-design on top of the storage violation.
- **[HIGH]** Storing full PAN (even if it were encrypted) keeps the platform in cardholder-data scope; the SAQ-A model is token+last4+brand+expiry only.
- **[MEDIUM]** Even the "new" `AuthorizeNetGateway` adapter passes raw `card_number`/`cvv` arrays server-side (`AuthorizeNetGateway.php:48-51`; `AuthorizeNetBillingGateway.php:52-54`) rather than using Accept.js tokens — so the registry path can also handle raw card data.
- **[MEDIUM]** Multi-tenant misconfig: if any tenant can be configured with a non-hosted collector, that one tenant breaks the platform's SAQ-A eligibility. Eligibility must be enforced at the platform layer.
- **[MEDIUM]** The storefront custom-field / dynamic-form engine could let a store owner add a field that captures card numbers — reserved-name + field-type controls must prevent SAD capture through custom fields.
- **[LOW]** Embedded-iframe checkout (if Elements is ever enabled) triggers the 6.4.3/11.6.1 script-inventory + tamper-detection obligation; pure redirect avoids it. SAQ-A still needs annual attestation + TLS regardless of the gateway being Level 1.

### Recommendations (ordered)
1. **Stop collecting CVV everywhere, now.** Remove `cvv` from every FormRequest (`PaymentProfileController`, `TenantController`, `OrderController`, `InvoiceController`, `QuoteController`, `PaymentController`). Drop the `cvv` columns (`payment_profiles`, `tenant_payment_profiles`) in a new migration and **purge existing rows**. Nothing in PCI permits storing it.
2. **Stop storing full PAN.** Fix `PaymentService.php:269` (`card_last_four` must receive only `substr($cardNumber,-4)`) and `:181` (`tenant_payment_profiles.card_number` should not exist — store only `last_four`). Migrate the column out and purge.
3. **Tokenize the Authorize.Net path** with Accept.js / Accept Hosted so raw PAN never reaches Laravel; route `PaymentProfileController`/admin profile creation through tokens. This is what moves the admin path back toward SAQ-A.
4. **Remove the card-reveal UI** in `profile.vue:25-43`; display only masked last4 + brand + expiry.
5. **Encrypt gateway secrets at rest.** Change `StoreThirdPartyService` `configuration` cast to `encrypted:array` (`StoreThirdPartyService.php:30-34`) and `Admin\ThirdPartySetting` `attributes` to `encrypted:array`; provide a one-time re-save/migration command.
6. **Scrub observability:** verify Laravel request logs, Sentry breadcrumbs, queue payloads, and the `*_snapshot` JSON columns never capture card fields.
7. **Lock the custom-field engine** to reject card-number-shaped field names/types.
8. **Decide redirect-vs-iframe deliberately.** Keep the storefront on **redirect** (lowest burden); if Elements is ever turned on, stand up the 6.4.3 script inventory + 11.6.1 tamper detection or hold Stripe's written attestation.

---

## 3. Webhook idempotency & failure handling

### The standard / what correct looks like
- **Webhook is the source of truth**, not the synchronous API response — card refunds and disputes resolve asynchronously (Stripe: card refunds can fail/re-credit up to 30 days later; Razorpay: `refund.processed` is the definitive final state).
- **Signature-verify on the raw body** with the provider SDK/HMAC (Stripe `constructEvent` validates HMAC + timestamp tolerance; Razorpay HMAC-SHA256 with timing-safe compare). Fail closed on missing/empty secret.
- **Idempotency:** dedupe on the gateway event id (Stripe `event.id`, Razorpay event id) with a DB unique constraint; a redelivered event records once. Amount-mutating ledger operations must be idempotent (don't double-add a refund).
- **Order/state safety:** derive document status from cumulative amounts, not "any event fired"; guard against out-of-order delivery (a late `failed` after `captured` must not regress a paid order).
- **Failure handling:** providers retry on non-2xx; surface a 5xx to trigger retry, but also run a **dead-letter / reconciliation sweep** for events that exhaust the provider's finite retry window. Continuous transaction-level reconciliation against bank settlement.

### What Print-Flow-360 does today
- **Single gateway-agnostic endpoint** `POST /api/v1/webhooks/payments/{gateway_key}` (`routes/public-api.php:32`), correctly excluded from auth/CSRF (`bootstrap/app.php:42-43`), → `PaymentWebhookController.php:23` → `PaymentEventDispatcher::handle` (`PaymentEventDispatcher.php:62`).
- **Signature verification is real** and runs once at `PaymentEventDispatcher.php:96` via each gateway's `verifyWebhook()`:
  - Stripe `StripeGateway.php:180-198` reads `webhook_secret`, requires `Stripe-Signature`, calls `\Stripe\Webhook::constructEvent($request->getContent(), ...)` on the **raw** body; maps `SignatureVerificationException` → `WebhookVerificationException`.
  - Razorpay `RazorpayGateway.php:346-361` requires `X-Razorpay-Signature`, computes `hash_hmac('sha256', $request->getContent(), $secret)` and compares with `hash_equals()`.
  - Missing/empty secret throws (fail-closed). Gateways without an override inherit `AbstractPaymentGateway.php:53` which throws `LogicException` — so **PayPal/Paytm/AuthorizeNet have no inbound signature verification implemented yet**. A verification failure → message `signature_invalid` → HTTP 401 (`PaymentWebhookController.php:49`).
- **Idempotency is genuine and two-phase.** Unique index `payment_webhook_events_dedup_unique` on `(gateway_key, event_id)` (`2026_05_02_000001_update_payments_system.php:66`). `processVerifiedEvent` (`PaymentEventDispatcher.php:130-266`): **Phase 1** (`:144-181`) opens a txn, `SELECT ... lockForUpdate()` (`:153`); if the row exists with `processed_at` non-null → status `duplicate` → HTTP 200; else upsert/reuse the row (incrementing `attempts` at `:170`) and commit only the audit row. **Phase 2** (`:209-265`) dispatches the domain event **outside** the dedup txn; on success sets `processed_at=now()`. A **second** idempotency layer is in the listener: `UpdatePaymentAndOrder.php:128-147` uses `Payment::firstOrCreate` keyed on `(gateway_key, idempotency_key=event_id)`, backed by `payments_gateway_idem_unique` (`migration:22`).
- **Webhook-vs-redirect race handled by design:** the redirect-return path (`RazorpayGateway::verifyReturnParams`, `:422-451`) produces the same `VerifiedPaymentEvent` and shares `processVerifiedEvent`; whichever arrives first claims the slot, the second short-circuits as `duplicate`.
- **Failure handling:** on a listener exception, `PaymentEventDispatcher.php:241-265` logs, writes `$row->error`, and **deliberately leaves `processed_at=null`** so the next gateway redelivery re-runs it (`:250-251`); surfaces HTTP 500 to signal retry. Unknown event types (`payment.unknown` or not in `EVENT_MAP`) are stamped processed + `ignored_unknown` + HTTP 200 (`:210-229`) so the gateway stops retrying noise. Customer-email side-effects are isolated in their own try/catch (`UpdatePaymentAndOrder.php:78-87`).

### Gaps & risks
- **[HIGH]** **Cross-tenant gateway-config resolution.** The webhook route runs with **no tenancy middleware**, and `StoreThirdPartyService` uses `BelongsToTenant` (`StoreThirdPartyService.php:14`) whose `TenantScope` is a no-op when tenancy is uninitialized. So the config lookup at `PaymentEventDispatcher.php:69-73` runs **unscoped across all tenants** and returns the first matching active config (`orderByRaw` at `:72` only sorts account-level first). With two tenants on the same gateway key, the webhook can resolve the **wrong** tenant's secret and stamp the event row with the wrong `tenant_id` (`:162-163`).
- **[MEDIUM]** **No webhook-to-order tenant consistency check.** `resolveOrder` (`UpdatePaymentAndOrder.php:96-121`) and `resolveOrderId` (`PaymentEventDispatcher.php:277,282`) find Orders globally with no assertion that `order.tenant_id` matches the resolved gateway-config tenant. A validly-signed payload from tenant A referencing tenant B's order id could mutate the wrong tenant's order.
- **[MEDIUM]** **No state-machine guard.** `UpdatePaymentAndOrder.php:58-65` applies any event unconditionally; an out-of-order/late delivery (stale `failed` after `captured`) can regress a PAID order. `applyRefunded` (`:179`) is non-idempotent in amount terms — safe only because the event-row dedup blocks same-`event_id` re-runs.
- **[MEDIUM]** **No dead-letter / reconciliation sweep.** Permanently-failing events stay `processed_at=null` + `error` and depend entirely on the gateway's finite retry window; once exhausted, the payment is silently never reconciled. `PaymentGatewayLogService` is not invoked in the webhook path at all.
- **[LOW]** **No rate limiting** on the webhook route (`routes/public-api.php:32` has no `throttle`). Signature verification gates abuse, but unsigned garbage still hits DB driver-resolution first.
- **[LOW]** PayPal/Paytm/AuthorizeNet have no `verifyWebhook` override — fail-closed (good) but not wired for inbound webhooks; do not enable those keys for live webhooks until implemented.

### Recommendations (ordered)
1. **Re-scope the webhook to a tenant.** After signature verification, resolve the tenant from the verified payload's order/account, `tenancy()->initialize($tenant)`, and **re-run** the config + Order lookups scoped — or enforce exactly one global account-level config per gateway key. Fixes the cross-tenant config and order risks together. (`PaymentEventDispatcher.php:69-73`, `:277-282`)
2. **Assert tenant consistency** in `resolveOrder`/`findOrCreatePayment`: the resolved Order's `tenant_id` must equal the resolved gateway-config's `tenant_id`, else reject. (`UpdatePaymentAndOrder.php:96-121`)
3. **Add a lifecycle state-machine guard** in `UpdatePaymentAndOrder.php:58-65`: never regress `PAID`→`FAILED`; derive `payment_status` from cumulative captured/refunded amounts, not from the bare event type.
4. **Add a scheduled reconciliation/dead-letter sweep** over `payment_webhook_events` where `processed_at IS NULL AND error IS NOT NULL` past the provider's retry window; alert + allow manual replay. Wire `PaymentGatewayLogService` into the webhook path for auditable history.
5. **Add `throttle` middleware** to the webhook route and reject obviously-malformed bodies before DB resolution.
6. Implement `verifyWebhook` for PayPal/Paytm/AuthorizeNet before enabling their live webhook keys.

---

## 4. Refunds & chargebacks

### The standard / what correct looks like
- **Stripe & Razorpay both support full + multiple partial refunds**; cumulative refunds may not exceed the captured amount (the gateway also enforces this). Refunds always return to the original method.
- **Refunds are asynchronous.** Stripe Refund status: `requires_action → pending → succeeded / failed / canceled` (a card refund can `fail` and re-credit the merchant up to **30 days** later). Razorpay: `created → processed / failed` (`refund.processed` is the definitive final state; a payment stays `captured` until **fully** refunded, then becomes `refunded`).
- **Webhook is source of truth.** Stripe: `refund.created/updated/failed` (fire for all refunds since the 2024-10-28 Acacia change) + `charge.refunded`. Razorpay: `refund.created/processed/failed/speed_changed`. Do **not** decrement invoice paid_amount or flip order status on the synchronous create response — wait for the success webhook.
- **Idempotency on refund creation** prevents double-refunds: Stripe `Idempotency-Key` header (≥24h retention, param-mismatch errors); Razorpay idempotent refund endpoints. Before creating: check `cumulative_refunded + new ≤ captured`. Persist + unique-constrain the gateway refund id so redelivered webhooks don't double-count.
- **Fees are NOT recovered on refunds** (both providers retain the original processing fee); a ledger assuming 100% return mis-states P&L.
- **Disputes/chargebacks debit funds immediately.** Stripe debits the disputed amount **+ a non-refundable dispute received fee** at `charge.dispute.created`; the matching "countered" fee (since 17 Jun 2025) is returned only on a win; `charge.dispute.funds_reinstated` on a win. Razorpay temporarily debits `amount_deducted` at `payment.dispute.created`.
- **Short, network-driven response window** (Stripe 7–21 days; Razorpay `respond_by` Unix timestamp). Miss it and you auto-lose. Drive an internal SLA + reminders off the deadline. Win on documentary evidence: delivery/tracking proof, signed invoice, customer comms, your refund/cancellation policy, AVS/CVC, IP/device.
- **Status from cumulative amounts:** a partially-refunded order is *partially* refunded, not fully.

### What Print-Flow-360 does today
- **The admin Orders refund modal is a pure silent-lie.** `nuxt/app/pages/orders/[id].vue:281-290` (`saveRefund`) sends `refund_amount/refund_reason/refund_note/notify_customer_refund` via `updateOrder()` → `PUT /orders/{id}` (`useOrdersApi.ts:31-42`). `OrderController::update` (`OrderController.php:618-650`) validates a whitelist that includes **none** of the refund fields, builds `$payload` from `$validated` only (`:656`) then `$order->fill($payload)` (`:701`). A grep for `refund_amount`/`refund_reason`/`refund_note`/`notify_customer_refund` across `app/` and `database/` returns **zero** hits. So all four fields are silently discarded — no gateway call, no Payment row, no status change, no audit, no notification — yet the UI unconditionally shows `showSuccess('Refund processed')` on a 200 (`orders/[id].vue:288`).
- **The only working refund is legacy + Authorize.Net-only.** `PaymentController::refund` (`PaymentController.php:478-567`, route `routes/api.php:448` `payments/{id}/refund`) hardcodes the legacy `App\Services\PaymentService` (Authorize.Net), constructed from `tenant->authorize_api_key/authorize_transaction_key` (`:480-489`), aborting 400 if unset. It supports partial refunds (rejects `amount > original` at `:502-504`; flips Invoice→REFUNDED only when full at `:525`), guards eligibility (credit_card + PAID at `:498`), requires a stored profile (`:506-511`). `PaymentService::processRefund` (`PaymentService.php:496-516`) refuses pre-settlement refunds (the void branch is commented out at `:506`). **This path is not reachable from the Orders UI.**
- **Five gateway `processRefund()` impls are dead code.** Stripe (`StripeGateway.php:77-95`, caps `refunds`+`partial_refunds` true `:125-133`), PayPal (`PayPalGateway.php:164-235`), Razorpay (`RazorpayGateway.php:195-262`), Paytm (`PaytmGateway.php:289-361`), AuthorizeNet (`AuthorizeNetGateway.php:66-91`). A grep for `->processRefund(` callers finds the **only** non-self caller is `PaymentController.php:512` calling the legacy `PaymentService` — **never** the gateway registry. So Stripe/PayPal/Razorpay/Paytm refund code is unreachable and the advertised `partial_refunds` capability is honored by no UI/endpoint.
- **Refund webhook is idempotent + additive but disconnected.** `UpdatePaymentAndOrder.php:128-147` keys Payment on `(gateway_key, event_id)` (idempotent on redelivery); `applyRefunded` (`:176-181`) sets `payment->status=REFUNDED` and **accumulates** `refunded_amount += amount`, sets `order->payment_status=REFUNDED`, in a DB txn (`:55-74`). **But:** (a) a partial-refund webhook always flips order/payment to full `REFUNDED` and never uses the existing `PaymentStatusEnum::REFUNDED_PARTIAL` (`PaymentStatusEnum.php:38`) despite accumulating a partial amount — a $10 refund on a $100 order is mislabeled fully refunded; (b) the manual `PaymentController::refund` path creates a separate `refund`-type Payment not keyed on any webhook event_id, so a later `charge.refunded` webhook creates **yet another** Payment row (no cross-path dedup); (c) the Orders-UI path writes nothing.
- **Chargeback/dispute is a status-flip stub.** `PaymentDisputed` (`app/Events/Payment/PaymentDisputed.php`) is an empty subclass. Stripe `charge.dispute.created` (`StripeGateway.php:204`) and PayPal `CUSTOMER.DISPUTE.*` (`PayPalGateway.php:382`) → `payment.disputed` → `PaymentDisputed` (`PaymentEventDispatcher.php:41`) → `applyDisputed` (`UpdatePaymentAndOrder.php:183-187`) which does **only** `payment->status=DISPUTED` and `order->payment_status=DISPUTED`. There is **no store-owner notification** (`NotificationTypeEnum` has no dispute/chargeback type — only `INVOICE_REFUNDED`/`ORDER_REFUNDED` at `:13,:31`), **no order/production freeze**, **no accounting adjustment**, **no audit log**, and **no `respond_by` deadline surfaced**.
- **Audit logging exists only on the legacy refund path.** `PaymentController::refund` logs `payment_refunded` and `refund_created` via `AuditLogger` (`PaymentController.php:551-559`). The webhook refund/dispute path writes **no** `AuditLogger` entry (only stamps the `PaymentWebhookEvent` row). `Order::markAsPaid` writes `OrderHistory` (`Order.php:190-202`) but there is no `markAsRefunded`/`markAsDisputed`.

### Gaps & risks
- **[CRITICAL]** Admin Orders refund modal silently discards all refund fields yet shows "Refund processed". Money is NOT returned but staff believe it was — the worst bug class per CLAUDE.md.
- **[CRITICAL]** Chargeback/dispute handling is a stub: only flips status. No store-owner alert (no dispute `NotificationType` exists), no `respond_by` SLA, no production freeze, no accounting, no audit. The most financially-urgent event silently flips a flag nobody sees, and disputed orders keep flowing to production.
- **[HIGH]** Gateway `processRefund()` for Stripe/PayPal/Razorpay/Paytm + advertised `partial_refunds` are dead code. **Any store not on Authorize.Net cannot issue a refund through the product at all.**
- **[HIGH]** Partial refund via webhook sets status to full `REFUNDED` and never uses `REFUNDED_PARTIAL` despite accumulating `refunded_amount` — corrupts reporting/accounting.
- **[MEDIUM]** No idempotency link between the manual refund and the gateway refund webhook → a later `charge.refunded` creates a duplicate Payment row (double-counts `refunded_amount`).
- **[MEDIUM]** `PaymentService::processRefund` refuses pre-settlement refunds (void branch commented out, `:506`) — admins can't void/refund a same-day unsettled charge; they hit a dead-end error with no void fallback.
- **[MEDIUM]** Ledger assumes refunds/disputes are final on the synchronous response; per the standard, a refund can fail/reverse up to 30 days later and a dispute debit reverses on a win — wait for webhooks and record the immediate dispute debit + reinstatement, or balance reconciliation drifts.

### Recommendations (ordered)
1. **Wire the Orders refund modal to a real refund service.** Create a `RefundService` (controller stays thin) that: resolves the gateway via `PaymentGatewayRegistry`, calls `processRefund()` with an **idempotency key**, records a pending refund Payment, and only finalizes on the success webhook. Add the refund fields to a proper FormRequest. (`OrderController.php:618-650`, `orders/[id].vue:281-290`)
2. **Route refunds through the gateway abstraction**, not the legacy `PaymentService`, so Stripe/Razorpay/PayPal/Paytm stores can refund. Keep Authorize.Net working via its adapter.
3. **Honor partial refunds:** in `applyRefunded` (`UpdatePaymentAndOrder.php:176-181`), set `REFUNDED_PARTIAL` when `cumulative_refunded < captured`, `REFUNDED` only when equal; derive order status from cumulative amounts.
4. **Treat the webhook as source of truth:** do not decrement invoice paid_amount / flip order status on the synchronous refund-create response; record an intent/pending entry and finalize on `refund.updated→succeeded` (Stripe) / `refund.processed` (Razorpay).
5. **Cross-path dedup:** when the manual refund later receives a `charge.refunded` webhook, match it to the existing refund Payment (e.g. store the gateway refund id on the manual row) rather than creating a duplicate.
6. **Build real chargeback handling:** add a `CHARGEBACK`/`DISPUTE` `NotificationType`, alert the store owner immediately with the `respond_by`/Stripe due-date countdown, freeze the order's production/print jobs, record the immediate dispute debit (+ fee) and the reinstatement on a win, and write an `AuditLogger` entry. Surface a "respond by" SLA in the admin UI. (`PaymentDisputed`, `UpdatePaymentAndOrder.php:183-187`, `NotificationTypeEnum.php`)
7. **Add `markAsRefunded`/`markAsDisputed`** to `Order` writing `OrderHistory`, and emit `AuditLogger` from the webhook refund/dispute path (satisfies the CLAUDE.md audit invariant).
8. **Add a void fallback** for pre-settlement cancellations instead of the dead-end error (`PaymentService.php:506`).

---

## 5. Currency & rounding

### The standard / what correct looks like
- Charge the customer in the **document's** currency, validated against what the gateway supports — never silently substitute a config default.
- **Minor-unit conversion is currency-specific:** most currencies have 2 decimals (×100), but **zero-decimal** currencies (JPY, KRW) pass the integer amount as-is and **three-decimal** currencies (KWD, BHD) use ×1000. A hardcoded ×100 over/undercharges by 100×/10×.
- Persist the **actual captured currency** on the payment record for reconciliation.
- Snapshot the display currency at document creation so a later store-currency change doesn't rewrite history.
- Prefer integer minor units or `bcmath`/decimal arithmetic over float; round consistently to the currency's decimal places.

### What Print-Flow-360 does today
- **The memory note is stale:** currency **is** now snapshotted onto documents. `2026_06_04_000001_add_currency_snapshot_to_documents.php` adds nullable `currency_code/currency_symbol/currency_decimals` to orders/quotes/invoices, populated in `creating()` hooks (`Quote.php:45-53`, `Order.php:61-69`, `Invoice.php:46-54` — Invoice copies from its source Quote), backfilled at read time (`OrderController.php:223-225,:370-373`). Source of truth: `store_settings.default_currency_id → currencies`, resolved via `CurrencyHelper.php:22` and `StorefrontCurrencyService.php:39`.
- **Admin `formatMoney` is currency-aware** (`nuxt/app/utils/formatMoney.ts:17` takes `(value, symbol='$', decimals=2)`; `useStoreCurrency.ts:17`). Detail pages pass the snapshot (`formatMoney(invoice.total_amount, invoice.currency_symbol, invoice.currency_decimals)`). **But** many call-sites pass only the value and fall back to `$`: `plan.monthly_charge`, `row.base_price`, `rate.rate` (shipping), `tx.amount` (billing HistoryTabs), `t.unit_price`.
- **CRITICAL: the gateway charge currency comes from the gateway config, not the order.** In `CheckoutPaymentService.php:86-101`, the amount is the order grand total (in store currency) but `currency = serviceRow->configuration['currency'] ?? 'USD'` — read from the **payment-gateway config row**, never from `$order->currency_code`. No comparison between order and gateway currency; `supportsCurrency()` (default true, `AbstractPaymentGateway.php`) is never called in checkout.
- **Hardcoded ×100** at `StripeGateway.php:45,:142` and `RazorpayGateway.php:50,:316` (`(int) round($amount * 100)`) — wrong for non-2-decimal currencies.
- **The `payments` table has no currency column** (`2025_02_05_185503_create_payments_table.php`, `2026_05_02_000001_update_payments_system.php`); `Payment.php` has no currency field. The gateway-returned captured currency (`StripeGateway.php:220`) is **discarded** rather than stored/compared.
- **Totals re-round to a hardcoded 2 decimals** ignoring `currency_decimals`: `Quote::getTotalAmountAttribute()` (`Quote.php:219,:231`) does `round(sum(line+tax), 2)`. Amounts are `DECIMAL(10–14,2)` floats; the pricing engine rounds to 4dp (`ProductPricingCalculator.php:209-210`) then the model re-rounds to 2dp; no `bcmath` anywhere.

### Gaps & risks
- **[CRITICAL]** Gateway charge currency read from config (`CheckoutPaymentService.php:87`, default `'USD'`), never from `$order->currency_code`, and `supportsCurrency()` never checked. A store totalling in currency X with a gateway configured for Y charges the X-amount **labelled** as Y — a silent wrong-currency charge with no validation.
- **[CRITICAL]** Hardcoded ×100 (`StripeGateway.php:45,:142`; `RazorpayGateway.php:50,:316`) ignores decimal places — JPY/KRW overcharged 100×, KWD/BHD undercharged 10×.
- **[HIGH]** `payments` table has no currency column and the webhook-parsed captured currency is discarded — the wrong-currency bugs above are **undetectable** from stored data; no reconciliation possible.
- **[MEDIUM]** Total accessors round to hardcoded 2 decimals (`Quote.php:231`) ignoring `currency_decimals` — mis-rounds 0-/3-decimal currencies before they ever reach the gateway.
- **[MEDIUM]** Many admin `formatMoney()` call-sites omit symbol/decimals and fall back to `$`/2 — wrong display for non-USD stores.
- **[LOW]** All money math is float-based; calculator→line→total→payment rounding can drift a cent on large multi-item orders.

### Recommendations (ordered)
1. **Charge in the order's currency.** In `CheckoutPaymentService.php:86-101`, use `$order->currency_code` (not the config default); call `$gateway->supportsCurrency($order->currency_code)` and throw a clear `PaymentSessionException` if unsupported (matches the existing "never silently degrade" pattern).
2. **Currency-decimal-aware minor units.** Add a helper that converts to minor units using the currency's `decimal_places` (0/2/3) and replace the hardcoded ×100 at `StripeGateway.php:45,:142` and `RazorpayGateway.php:50,:316`.
3. **Add a `currency` column to `payments`** and persist both the charged currency and the gateway-returned captured currency (`StripeGateway.php:220`); reconcile against `order.currency_code` in the webhook.
4. **Round totals to `currency_decimals`** in `Quote`/`Order`/`Invoice` total accessors (`Quote.php:231`), not hardcoded 2.
5. **Sweep admin `formatMoney` call-sites** (`plan.monthly_charge`, `row.base_price`, shipping `rate.rate`, billing `tx.amount`, `t.unit_price`) to pass the snapshot symbol/decimals.
6. **(Later)** Move money math to integer minor units / `bcmath` to eliminate float drift.

---

## 6. Sales tax / VAT / GST

### The standard / what correct looks like
- **Tax is destination-based** — compute at checkout from the validated **ship-to** address (place-of-supply in India). There is **no single national rate** in the US.
- **US (post-Wayfair):** per-state economic nexus, commonly **$100k** sales (some states `$100k OR 200 transactions`, the 200-count being dropped — ~16 states gone by 1 Jan 2026); CA/TX **$500k**, NY **$500k AND 100 txns**. Marketplace-facilitator rules may shift collect/remit to the platform. **Custom printing is generally taxable** tangible personal property (full retail price including labor/materials/delivery).
- **EU:** destination VAT for B2C; **€10k** micro-threshold then **OSS** (single quarterly return); **IOSS** for imports ≤€150; **reverse charge** for B2B (validate VAT no. via VIES). ViDA (adopted 11 Mar 2025) phases changes 2027–2028 (mandatory B2B reverse charge for non-established suppliers; planned abolition of the €150 IOSS threshold).
- **UK:** 20%; £90k threshold for UK businesses but **no threshold for overseas sellers** (register from first B2C sale); imports ≤£135 collected at point of sale.
- **India:** CGST+SGST (intra-state) vs IGST (inter-state) by **place-of-supply**; GSTIN + HSN on invoices; B2B e-invoicing (IRP/IRN/QR) above turnover thresholds.
- **Canada:** 5% GST + provincial HST/PST/QST; CAD $30k small-supplier threshold; destination by province.
- **Australia:** 10% GST; A$75k threshold; low-value-imports collected at sale.
- **Display mode is region-specific:** **tax-inclusive** for EU/UK/AU consumers (legally required), **tax-exclusive** for US/Canada. A single global display setting is non-compliant.
- **Snapshot** the computed tax (rate, jurisdiction, amount, taxable base, registration number) onto the invoice/order at sale time. **Use a tax engine** (Stripe Tax / Avalara / TaxJar) for nexus tracking + jurisdiction rates rather than hand-coding. Distinguish **B2B vs B2C** for reverse-charge + display.

### What Print-Flow-360 does today
- **No `TaxService` exists** anywhere in `app/`. Tax is three `store_settings` columns: `tax_enabled`, `tax_rate` (`decimal(5,2)`), `prices_include_tax`, plus display-only `tax_label`/`tax_id` (`2025_12_21_000002_create_store_core_tables.php:40-46`).
- **Flat per-store rate, snapshotted per line.** `StorefrontCheckoutController` reads `tax_enabled/tax_rate/prices_include_tax` (`:364-366`) and computes per line inclusive (`amount - amount/(1+rate/100)`, `:377`) or exclusive (`amount*rate/100`, `:380`); same for quotes (`:769-817`) and `StorefrontCartService.php:50-51`. Computed tax is snapshotted per line as `tax`/`tax_percentage`/`is_taxable`; the rate is stored on the parent (`orders.tax_rate` float + `orders.prices_include_tax`). Admin-created docs respect per-item `is_taxable` + `tax_percentage` (`OrderController.php:881`, `QuoteController.php:512`, `InvoiceController.php:547`). So tax **is** history-safe — but it's a single flat rate with no region/nexus/VAT/GST logic and no tax-exempt-customer mechanism.
- **Storefront ignores per-product `is_taxable`.** Products carry `is_taxable` (`2025_04_12_103533_add_is_taxable_in_items.php`, `ProductResource.php:22`), and admin honors it per item — but storefront checkout hardcodes `'is_taxable' => $taxEnabled` (`StorefrontCheckoutController.php:394`), taxing **all** items whenever tax is enabled. A store with exempt printed matter over-charges through storefront while admin charges correctly — divergent results for the same product by entry path.
- **No persisted order-level `tax_amount`.** `orders` has `tax_rate`+`prices_include_tax` but no `tax_amount`/`total_tax` column; `Order::getTotalAmountAttribute` (`Order.php:265-288`) recomputes from per-line `item.tax` snapshots at read time (`StorefrontCheckoutController.php:1024` references `$order->total_tax ?? null`). History-safe via line snapshots, but there's no single authoritative stored tax-total to reconcile against.

### Gaps & risks
- **[HIGH]** **Merchant-of-record / marketplace-facilitator classification is undecided** — determines whether the platform or each store bears collect/remit liability across all US states (and EU/UK/AU deemed-supplier rules). A legal/tax determination that must precede building tax logic.
- **[HIGH]** Single flat store rate, no destination/region/nexus support — systematically wrong tax (under/over-collected) for any multi-jurisdiction, US state/local, EU VAT, or India GST obligation; no tax-exempt-customer mechanism.
- **[HIGH]** Storefront ignores per-product `is_taxable` (`StorefrontCheckoutController.php:394`) — storefront taxes exempt products that the admin path correctly exempts.
- **[MEDIUM]** Tax-display mode is not region-aware — showing tax-exclusive to EU/UK/AU consumers violates price-indication rules; a single global setting is non-compliant.
- **[MEDIUM]** India place-of-supply (CGST+SGST vs IGST) and B2B e-invoicing (IRP/IRN/QR + HSN + both GSTINs) — a naive "add 18%" produces non-compliant Indian invoices.
- **[MEDIUM]** Moving regulatory targets (ViDA 2027–2028; US dropping the 200-txn count) — hardcoded rates/thresholds will rot; use a maintained engine.
- **[LOW]** Overseas-seller zero-threshold traps (UK/EU non-established B2C) — "wait until we hit the limit" logic is wrong cross-border.
- **[LOW]** No persisted order-level `tax_amount`; a future change to the total accessor or a missing line snapshot could silently change historical tax with no stored ground-truth.

### Recommendations (ordered)
1. **Resolve the merchant-of-record / facilitator question** (legal/tax) before building — it dictates who registers and remits.
2. **Honor per-product `is_taxable` in storefront checkout** now (`StorefrontCheckoutController.php:394`): set each line's `is_taxable` from the product, not the store-wide flag — closes the admin↔storefront divergence and is a small, high-value fix.
3. **Introduce a `TaxService`** (controllers stay thin) as the single tax-computation seam; have storefront + admin + cart all call it, so there's one place to evolve.
4. **Integrate a tax engine** (Stripe Tax / Avalara / TaxJar) behind that service for destination rates + nexus/threshold tracking; avoid baking jurisdiction tables into code.
5. **Snapshot the full tax detail** (rate, jurisdiction, amount, taxable base, registration number) onto orders/quotes/invoices, and **add a persisted `tax_amount`** column for reconciliation. Prove the round-trip (compute→persist→read→render) with a test, per the silent-drop invariant.
6. **Make tax-display mode region-aware** (inclusive EU/UK/AU, exclusive US/Canada); distinguish B2B vs B2C to drive reverse-charge + display.
7. **Capture/display registration numbers** (VAT/GSTIN/HSN/place-of-supply, GST-HST-PST, ABN) on invoices where required; validate EU B2B VAT numbers and apply reverse charge.

---

## 7. Silent-lie bug watchlist — the calculator → quote → invoice → payment money pipeline

The product owner's stated top fear is a rounding/currency/tax mismatch silently producing a wrong number, or a "success" the system didn't actually do. These are every place in the audit where that can happen, traced down the pipeline:

| # | Stage | What silently goes wrong | Evidence | Severity |
|---|-------|--------------------------|----------|----------|
| 1 | **Calculator → line** | Pricing engine rounds intermediate unit prices to 4dp then the model re-rounds to 2dp with float math; compounds across many items | `ProductPricingCalculator.php:209-210` → `Quote.php:231` | LOW |
| 2 | **Quote/Order/Invoice total** | Total accessor rounds to **hardcoded 2 decimals**, ignoring snapshotted `currency_decimals` — wrong for JPY(0)/KWD(3) before the gateway is ever called | `Quote.php:219,:231` | MEDIUM |
| 3 | **Tax (storefront)** | Storefront taxes **all** items (`is_taxable = tax_enabled`) ignoring per-product `is_taxable`; same product taxed differently via admin vs storefront | `StorefrontCheckoutController.php:394` vs `OrderController.php:881` | HIGH |
| 4 | **Tax total** | No persisted `tax_amount`; total tax recomputed from per-line snapshots — a missing/inconsistent line snapshot silently changes the historical total | `Order.php:265-288`, `StorefrontCheckoutController.php:1024` | LOW |
| 5 | **Order → gateway currency** | Charge currency read from the **gateway config**, not `$order->currency_code`; X-amount charged labelled as Y; `supportsCurrency()` never checked | `CheckoutPaymentService.php:86-101`, `AbstractPaymentGateway.php` | CRITICAL |
| 6 | **Amount → minor units** | Hardcoded ×100 over/undercharges non-2-decimal currencies 100×/10× | `StripeGateway.php:45,:142`; `RazorpayGateway.php:50,:316` | CRITICAL |
| 7 | **Payment record** | `payments` has no currency column; captured currency discarded — the wrong-currency charge is invisible in the DB, so it can't even be detected after the fact | `2025_02_05…create_payments_table.php`, `Payment.php`, `StripeGateway.php:220` | HIGH |
| 8 | **Surcharge** | `chargeCustomerProfile` silently adds a hardcoded **3.5%** fee with no UI disclosure — customer is charged more than the invoice and the store owner can't see why | `PaymentService.php:438-440` (`round($amount * 1.035, 2)`) | HIGH |
| 9 | **Refund (admin Orders UI)** | All refund fields dropped by `OrderController::update` whitelist; **no money moves** but "Refund processed" is shown | `orders/[id].vue:281-290,:288`; `OrderController.php:618-650,:656,:701` | CRITICAL |
| 10 | **Partial refund (webhook)** | Order/payment flipped to full `REFUNDED` for a partial refund; `REFUNDED_PARTIAL` never used though `refunded_amount` accumulates | `UpdatePaymentAndOrder.php:176-181`; `PaymentStatusEnum.php:38` | HIGH |
| 11 | **Refund double-count** | Manual refund Payment not keyed on a webhook event_id → later `charge.refunded` creates a duplicate Payment row, double-counting `refunded_amount` in reports | `PaymentController.php:512` vs `UpdatePaymentAndOrder.php:128-147` | MEDIUM |
| 12 | **Chargeback** | Dispute only flips a status flag — no alert, no `respond_by`, no accounting; the store owner never learns of it and disputed orders keep producing | `UpdatePaymentAndOrder.php:183-187`; `NotificationTypeEnum.php:13,31` | CRITICAL |
| 13 | **Cross-tenant webhook** | Unscoped gateway-config lookup can resolve the wrong tenant's config/secret and stamp the event with the wrong `tenant_id` | `PaymentEventDispatcher.php:69-73,:162-163` | HIGH |
| 14 | **Out-of-order events** | A late `failed` after `captured` can regress a PAID order (no state-machine guard) | `UpdatePaymentAndOrder.php:58-65` | MEDIUM |
| 15 | **Dead-letter** | A permanently-failing webhook stays `processed_at=null` forever once the gateway stops retrying — payment silently never reconciled | `PaymentEventDispatcher.php:241-265` | MEDIUM |
| 16 | **Display** | Admin `formatMoney` call-sites without symbol/decimals render `$` for non-USD stores | `formatMoney.ts:17`; `plan.monthly_charge`/`rate.rate`/`tx.amount` call-sites | MEDIUM |

**The common pattern** (and the one the product owner cares about most): the system reports success or a number that looks right while the real money movement either didn't happen (#9), happened in the wrong currency/amount (#5, #6), or was silently marked-up (#8), with no stored evidence to detect it later (#7). Every fix below for these rows should ship with a round-trip test (submit → persist → read back → assert), per the CLAUDE.md silent-drop invariant.

---

## 8. Prioritized action plan

Ordered by (severity, then effort). **Do now** = compliance/active-loss; **Do next** = correctness gaps that produce wrong money; **Later** = hardening.

| Priority | Fix | Severity | Effort | Files |
|----------|-----|----------|--------|-------|
| **Do now** | Stop collecting CVV (remove from all FormRequests, drop columns, purge rows) | CRITICAL | M | `PaymentService.php`, all card-accepting controllers, `payment_profiles`/`tenant_payment_profiles` migrations |
| **Do now** | Stop storing full PAN; store last4 only | CRITICAL | M | `PaymentService.php:269,:181`; `TenantPaymentProfile.php`; migration |
| **Do now** | Encrypt gateway secrets at rest (`encrypted:array` casts) | CRITICAL | S | `StoreThirdPartyService.php:30-34`, `Admin\ThirdPartySetting` |
| **Do now** | Remove admin card-reveal UI; show masked last4 only | HIGH | S | `nuxt/app/components/customer/payment/profile.vue:25-43` |
| **Do now** | Fix admin Orders refund silent-lie — wire to a real `RefundService` via the gateway registry | CRITICAL | L | `orders/[id].vue`, `OrderController.php:618-650`, new `RefundService` |
| **Do now** | Charge in the order's currency + `supportsCurrency()` check | CRITICAL | S | `CheckoutPaymentService.php:86-101` |
| **Do now** | Currency-decimal-aware minor units (kill hardcoded ×100) | CRITICAL | S | `StripeGateway.php:45,:142`; `RazorpayGateway.php:50,:316` |
| **Do now** | Real chargeback handling (alert + `respond_by` SLA + freeze + accounting + audit) | CRITICAL | L | `PaymentDisputed`, `UpdatePaymentAndOrder.php:183-187`, `NotificationTypeEnum.php` |
| **Do now** | Disclose / remove the hidden 3.5% surcharge | HIGH | S | `PaymentService.php:438-440` |
| **Do next** | Route refunds through gateway abstraction (non-Authorize.Net stores can refund) | HIGH | M | `PaymentController.php:512`, `RefundService` |
| **Do next** | Honor per-product `is_taxable` in storefront checkout | HIGH | S | `StorefrontCheckoutController.php:394` |
| **Do next** | Add `currency` column to `payments`; persist + reconcile captured currency | HIGH | S | `payments` migration, `Payment.php`, `StripeGateway.php:220` |
| **Do next** | Partial-refund status (`REFUNDED_PARTIAL`) + webhook-as-source-of-truth | HIGH | M | `UpdatePaymentAndOrder.php:176-181` |
| **Do next** | Re-scope webhook to a tenant after signature verify; assert order↔config tenant match | HIGH | M | `PaymentEventDispatcher.php:69-73,:277-282`, `UpdatePaymentAndOrder.php:96-121` |
| **Do next** | Round document totals to `currency_decimals` | MEDIUM | S | `Quote.php:231`, `Order`/`Invoice` accessors |
| **Do next** | Sweep admin `formatMoney` call-sites to pass snapshot symbol/decimals | MEDIUM | M | `formatMoney.ts` call-sites |
| **Do next** | Resolve merchant-of-record/facilitator classification (legal/tax) | HIGH | — | (decision, not code) |
| **Later** | Cross-path refund dedup (manual ↔ `charge.refunded` webhook) | MEDIUM | M | `PaymentController.php:512`, `UpdatePaymentAndOrder.php:128-147` |
| **Later** | Webhook state-machine guard (no PAID→FAILED regression) | MEDIUM | M | `UpdatePaymentAndOrder.php:58-65` |
| **Later** | Dead-letter / reconciliation sweep + wire `PaymentGatewayLogService` | MEDIUM | M | `PaymentEventDispatcher.php:241-265`, scheduled job |
| **Later** | `TaxService` + tax engine (Stripe Tax/Avalara) + region-aware display + tax-exempt customers | HIGH | XL | new `TaxService`, `StorefrontCheckoutController`, admin |
| **Later** | Void fallback for pre-settlement refunds | MEDIUM | S | `PaymentService.php:506` |
| **Later** | Throttle webhook route; verifyWebhook for PayPal/Paytm/AuthorizeNet | LOW | S | `routes/public-api.php:32`, gateway classes |
| **Later** | Integer minor-units / `bcmath` money math; consolidate the two gateway trees | LOW | XL | pricing + payment layers |

---

## 9. Sources

### PCI-DSS
- PCI SSC FAQ 1588 — new SAQ-A eligibility criteria (v4.0.1): https://blog.pcisecuritystandards.org/faq-clarifies-new-saq-a-eligibility-criteria-for-e-commerce-merchants
- PCI DSS v4.0.1 document library + Requirement 3 (Protect Stored Account Data): https://www.pcisecuritystandards.org/document_library/
- SAQ A-EP v4.0: https://listings.pcisecuritystandards.org/documents/PCI-DSS-v4-0-SAQ-A-EP.pdf
- Stripe PCI guidance + AOC: https://stripe.com/guides/pci-compliance · https://stripe.com/resources/more/pci-attestation-requirements-and-process
- Razorpay PCI/compliance: https://razorpay.com/blog/payment-gateway-compliance/ · https://razorpay.com/blog/what-is-pci-compliance-in-ecommerce/ · https://razorpay.com/blog/what-is-pci-dss-compliance/
- Reqs 6.4.3 / 11.6.1 (client-side script controls): https://datadome.co/learning-center/pci-requirements-6-4-3-and-11-6-1/ · https://www.sikich.com/insight/preparing-for-pci-dss-v4-0-1-requirements-6-4-3-and-11-6-1/ · https://jscrambler.com/blog/pci-dss-4-0-1
- SAQ-A iframe-trap analysis: https://www.akamai.com/blog/security/pci-dss-v4-0-1-changes-qualify-saq-a · https://trustedsec.com/blog/the-hidden-trap-in-the-pci-dss-saq-a-changes · https://hyperproof.io/resource/pci-dss-4-0-update-new-saq-a-eligibility-criteria/

### Refunds & disputes
- Stripe: https://docs.stripe.com/refunds · https://docs.stripe.com/api/refunds · https://docs.stripe.com/changelog/acacia/2024-10-28/refund-webhook-update · https://docs.stripe.com/api/idempotent_requests · https://docs.stripe.com/disputes · https://docs.stripe.com/disputes/how-disputes-work · https://docs.stripe.com/disputes/categories · https://support.stripe.com/questions/june-2025-pricing-updates-for-disputes
- Razorpay: https://razorpay.com/docs/payments/refunds/ · https://razorpay.com/docs/api/refunds/ · https://razorpay.com/docs/webhooks/refunds/ · https://razorpay.com/docs/payments/disputes/ · https://razorpay.com/docs/payments/disputes/submit-evidence/ · https://razorpay.com/docs/webhooks/payloads/disputes/
- Distributed-payments correctness: https://medium.com/airbnb-engineering/avoiding-double-payments-in-a-distributed-payments-system-2981f6b070bb

### Tax (sales tax / VAT / GST)
- US economic nexus: https://www.avalara.com/us/en/learn/guides/state-by-state-guide-economic-nexus-laws.html · https://www.avalara.com/blog/en/north-america/2025/06/states-eliminating-economic-nexus-transaction-thresholds.html
- Stripe Tax: https://docs.stripe.com/tax/monitoring · https://docs.stripe.com/tax/supported-countries/united-states · https://docs.stripe.com/tax/registering
- EU VAT / OSS / ViDA: https://www.vatcalc.com/eu/eu-limits-e10000-vat-e-commerce-b2c-distance-selling-threshold-use-2025-vat-in-the-digital-age/ · https://taxation-customs.ec.europa.eu/taxation/vat/vat-directive/place-taxation_en · https://hellotax.com/blog/vat-oss-schemes/ · https://www.vatcalc.com/eu/eu-2028-scraps-e150-import-consignment-threshold-and-ioss-limit/ · ViDA package, adopted 11 March 2025
- UK: https://sterlingandwells.com/blogs/uk-vat-registration-for-overseas-companies/ · UK VAT threshold £90,000 (HMRC, 2025-26)
- India GST: https://gstforecom.com/igst-vs-cgst-sgst-in-2025-a-guide-for-e-commerce-sellers/ · https://tallysolutions.com/gst/e-invoicing-threshold/
- Canada: https://www.fonoa.com/resources/blog/when-to-charge-gsthst-in-canada
- Australia: https://www.ato.gov.au/businesses-and-organisations/international-tax-for-business/gst-for-non-resident-businesses/gst-on-low-value-imported-goods
- Print-product taxability: https://www.nj.gov/treasury/taxation/pdf/pubs/sales/anj18.pdf (NJ printing-industry fact sheet; MN/VA equivalents)

---

## 10. Files audited

**Contracts & abstraction**
- `app/Contracts/PaymentGatewayInterface.php`, `app/Contracts/SubscriptionGatewayInterface.php`
- `app/Services/Integrations/Payment/AbstractPaymentGateway.php`, `PaymentGatewayRegistry.php`
- `app/Services/Integrations/IntegrationResolver.php`

**Storefront payment gateways**
- `app/Services/Integrations/Payment/{StripeGateway,RazorpayGateway,PayPalGateway,PaytmGateway,AuthorizeNetGateway,ChequeGateway}.php`

**Subscription/billing layer**
- `app/Services/BillingService.php`, `app/Services/Billing/{SubscriptionGatewayRegistry,StripeBillingGateway,RazorpayBillingGateway,AuthorizeNetBillingGateway,ChequeBillingGateway}.php`

**Legacy Authorize.Net engine + admin payment**
- `app/Services/PaymentService.php`, `app/Http/Controllers/Api/Payment/{PaymentController,PaymentWebhookController}.php`

**Webhook / event pipeline**
- `app/Services/Payment/{PaymentEventDispatcher,PaymentGatewayLogService}.php`
- `app/Listeners/Payment/UpdatePaymentAndOrder.php`
- `app/Events/Payment/{AbstractPaymentEvent,PaymentRefunded,PaymentDisputed}.php`
- `app/Support/Payment/VerifiedPaymentEvent.php`, `app/Models/PaymentWebhookEvent.php`
- `app/Providers/{AppServiceProvider,EventServiceProvider}.php`, `bootstrap/app.php`, `routes/{public-api,api}.php`, `config/payment-drivers.php`

**Checkout / pricing / currency / tax**
- `app/Services/Storefront/Checkout/{CheckoutPaymentService,CheckoutPricingService}.php`
- `app/Services/Storefront/Cart/StorefrontCartService.php`
- `app/Services/Storefront/Context/StorefrontCurrencyService.php`, `app/Helpers/CurrencyHelper.php`
- `app/Services/Pricing/ProductPricingCalculator.php`
- `app/Http/Controllers/Api/Storefront/StorefrontCheckoutController.php`
- `app/Http/Controllers/Api/{Order/OrderController,Invoice/InvoiceController,Customer/PaymentProfileController,Admin/TenantController}.php`

**Models & enums**
- `app/Models/{Payment,Order,Quote,Invoice,StoreThirdPartyService,TenantPaymentProfile,PaymentProfile}.php`
- `app/Enums/Invoice/PaymentStatusEnum.php`, `app/Enums/Notification/NotificationTypeEnum.php`

**Migrations**
- `2025_02_05_185503_create_payments_table.php`, `2026_05_02_000001_update_payments_system.php`
- `2025_03_30_104325_create_payment_profiles_table.php`, `2025_04_09_173425_add_cvv_column_in_payment_profiles_table.php`, `2025_05_31_182508_create_tenant_payment_profiles_table.php`
- `2026_06_04_000001_add_currency_snapshot_to_documents.php`
- `2025_12_21_000002_create_store_core_tables.php`, `2025_12_15_201408_create_orders_table.php`, `2025_04_12_103533_add_is_taxable_in_items.php`

**Frontend (Nuxt)**
- `nuxt/app/pages/orders/[id].vue`, `nuxt/app/composables/useOrdersApi.ts`
- `nuxt/app/utils/formatMoney.ts`, `nuxt/app/composables/store-management/useStoreCurrency.ts`
- `nuxt/app/components/customer/payment/profile.vue`
- `frontstore/app/composables/{useTheme,useThemeSettings}.ts`, `frontstore/app/utils/price.ts`
- `frontstore/app/components/checkout/CheckoutPayment.vue`, `frontstore/app/components/checkout/payment-drivers/StripeElementsDriver.vue`

**Existing docs**
- `readme/PAYMENT_GATEWAYS.md`, `readme/RAZORPAY_INTEGRATION_GUIDE.md`
