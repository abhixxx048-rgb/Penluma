# Support / Help-Desk Readiness

**Assessment date:** 2026-06-15
**Scope:** Store-owner (admin) and end-customer (storefront) support paths — in-app help, contact/chat channels, ticketing, FAQ/KB discoverability, and the escalation path for a non-technical owner who gets stuck.

---

## Verdict

**Not launch-ready.** The platform has no support spine. Customer contact-form submissions are write-only — they land in a `StoreFormSubmission` table that no workflow consumes, with no ticket, no reference number returned to the customer, no confirmation email, and no SLA tracking. The primary users (non-admin store owners) are locked out of their own error logs by an `is_admin` permission wall, so when a customer reports a broken checkout the owner has zero ability to self-diagnose. There is no in-app way for an owner to escalate a problem to Print-Flow support, no dashboard health signal when the storefront throws 500s, and no discoverable help documentation despite 20+ guides sitting offline in `/readme/docs/content/`. Three blockers and five high-severity gaps below must close before real users arrive — each one converts a routine support moment into a dead end for a non-technical owner.

A useful framing for the founder: today, a customer who hits a problem submits into a black box, and an owner who hits a problem has no logs, no ticket queue, and no escalation button. Both ends of the support loop are open.

---

## Prioritized Findings

| Severity | Finding | Where | Type | Confidence | Recommendation (summary) |
|---|---|---|---|---|---|
| **Blocker** | Store owners cannot access error logs or diagnostics — total blind spot during incidents | `nuxt/app/pages/setting/log/index.vue:230`; `app/Http/Controllers/Api/LogController.php:18` | support-gap | Confirmed in code | Tenant-scoped diagnostics page for non-admins (own errors + audit only) |
| **Blocker** | Storefront contact submissions are silent — no confirmation, reference number, or status tracking | `frontstore/app/components/storefront/blocks/DynamicFormBlock.vue:28-36`; `StorefrontFormController.php:192-198` | feedback-gap | Confirmed in code | Surface submission UUID as reference, confirmation email, public status page |
| **Blocker** | No ticket system — submissions never become tickets, no escalation, no SLA | ABSENT — `StorefrontFormController.php:163-198` stores only | support-gap | Confirmed in code | `Ticket` model + Support Queue + SLA + action-center alert |
| **High** | Storefront 500s not escalated to support staff; owners can't see them | `frontstore/.../useErrorReporter.ts:47-61`; `StorefrontErrorLogController.php:19-30`; `setting/log/index.vue:230` | support-gap | Likely | Alert rule on 5xx spike + dashboard health card + owner-scoped visibility |
| **High** | In-app help minimal and inconsistent — no help on Designer, Forms, Shipping; no Help menu | `nuxt/.../shared/HelpTooltip.vue`, `HelpIcon.vue`; `layouts/store-management.vue:299-354` | onboarding-gap | Confirmed in code | Context help on complex pages + global Help menu + first-run tour |
| **High** | 500 error page has no support contact or error reference | `frontstore/app/error.vue:65-68` | support-gap | Confirmed in code | Error ID + visible Contact Support + status link |
| **High** | Help docs not discoverable from admin UI — 20+ guides exist offline, unlinked | ABSENT — `layouts/store-management.vue:299-354`; `/readme/docs/content/1.store-owner/` | onboarding-gap | Confirmed in code | Add "Help & Docs" sidebar section / header Help menu |
| **High** | FloatingChat is internal messaging only — not wired to customer support | `nuxt/app/components/chat/FloatingChat.vue:1-100+` | support-gap | Likely | Add Support Inbox tab or storefront support-chat widget |
| **Medium** | Contact form promises SLA but sends no customer confirmation | `frontstore/app/pages/contact.vue:79-88`; `StorefrontFormController.php:173-185` | feedback-gap | Confirmed in code | Customer confirmation email with reference + status link |
| **Medium** | No dashboard health/alert widget — owner gets no heads-up on error spikes or pending messages | ABSENT — `nuxt/app/pages/index.vue`; `action-center/index.vue` | support-gap | Likely | "Support & Health" dashboard card + critical-alert banner |
| **Medium** | No in-app way for owners to escalate to Print-Flow support | ABSENT — no Report-to-Support action; `LogController` has no export/send | support-gap | Likely | "Report Issue to Print-Flow" modal with auto-filled diagnostics |

---

## Detail on the most important items

### 1. (Blocker) Owners are locked out of their own diagnostics

The System Logs page is hard-gated: `nuxt/app/pages/setting/log/index.vue:230` requires `permission: ['is_admin']`, and the backend matches it — `LogController::getErrorLogs()`, `getAuditLogs()`, and `getLogs()` all sit behind `middleware('permission:is_admin')` (`app/Http/Controllers/Api/LogController.php:18`). The primary users of this platform are non-technical, non-admin store owners. When a customer reports "checkout failed," the owner cannot view the `error_logs` table, file logs, or the audit trail for their own tenant. They are forced to relay a vague description to central support.

**Recommendation:** Build a store-owner-scoped diagnostics page (e.g. `/setting/errors-my-store`) filtered by `tenant_id`. Show an error-count trend, a recent-errors list (message / timestamp / affected user), and a "Report to Support" button that pre-fills a support request with the error details. Withhold sensitive audit fields (IP, user agent, raw trace) from non-admins, but give them enough to say "this broke May 15 at 2pm for customers in Australia," plus a "Copy diagnostic code" action. This is the single highest-leverage fix — it unblocks owner self-service and feeds every other support path below.

### 2. (Blocker) The customer contact form is a black box

On success, `DynamicFormBlock.vue:28-36` shows a generic "Thank You! Your submission has been received." and an optional redirect. The backend (`StorefrontFormController.php:192-198`) does return the submission `uuid`, but the component extracts only `success_message` and `redirect_url` (line 260) — the UUID is dropped. The customer leaves with no reference number, no email confirmation, and no way to check status or escalate.

**Recommendation:** Display the UUID as a human reference (e.g. `Reference: PF-20260615-a1b2c3d4`), send an automated confirmation email with that code and an SLA promise, and expose a public, no-auth `GET /contact/submission/:uuid` status page (submitted / read / responded) backed by `first_read_at` / `responded_at` columns. Pairs directly with finding #9 (the contact page already *promises* a one-business-day reply it never confirms).

### 3. (Blocker) There is no ticketing workflow at all

`StorefrontFormController::submit()` persists the row and fires `notify_emails` to the admin if configured (lines 173-185) — and stops. No `Ticket` model, `TicketController`, support queue, assignment, or SLA exists anywhere in the codebase. The submission is write-only; nothing consumes it. Owners see no "pending submissions" count on their dashboard, so messages can sit unread indefinitely.

**Recommendation:** Introduce a `Ticket` model (`uuid`, `form_submission_id` FK, `tenant_id`, `subject`, `priority`, `assigned_to`, `status`, `first_response_at`, `resolved_at`, `sla_due_at`). On submit: create the ticket, push to a `/support/tickets` queue, raise an action-center "Pending Submissions" alert, and optionally auto-assign. Surface SLA compliance (% replied within 24h). This is the backbone that findings #2, #4, #8, #9, and #10 all hang off — build it first.

### 4. (High) Storefront 500s reach the DB but never reach a human

The storefront auto-reports 5xx errors: `frontstore/error.vue:104-114` calls `useErrorReporter` (`useErrorReporter.ts:47-61`), which POSTs to `/api/v1/storefront/errors`; `StorefrontErrorLogController.php:19-30` tenant-scopes and persists them. But nothing fires an alert, owners can't see them (the `is_admin` wall from #1), and they're discoverable only via the admin-only log API. A storefront could be down for hours with no one notified.

**Recommendation (rule, confidence: likely):** When `status_code >= 500 AND source=frontend AND count > 2` in a 5-minute window, raise an action-center alert, notify assigned support contacts, and show a "System Health" card with the live error rate. Add an `ErrorLogAlert` dedupe record. Give owners a tenant-scoped 5xx count + last-error timestamp on their diagnostics page (#1).

### 5–7. (High) Help and escalation are invisible from the product

- **In-app help is thin and lopsided.** `HelpTooltip.vue` / `HelpIcon.vue` support rich popovers (title, content, examples, external link) and are used in ~81 places — but heavily concentrated in pricing-rules, with **zero** coverage in Designer, Forms, or Shipping, and no instance passes a `link` prop despite the components supporting external doc links. There is no global Help menu (`layouts/store-management.vue:299-354` defines six nav groups, none for Help).
- **The 500 error page strands the customer.** `frontstore/app/error.vue:65-68` says "please contact support" with no email, phone, link, or error reference. The customer cannot escalate without manually finding `/contact`.
- **Docs exist but are unreachable.** 20+ guides live in `/readme/docs/content/1.store-owner/` and are referenced nowhere in `nuxt/app/`. A non-technical owner will never find them.

**Recommendations:** Add context-sensitive help to the complex pages (Designer canvas, form field types, shipping rule logic, pricing conditions); add a global Help menu (Help Center link, "What's this?" inline-help toggle, Contact Support); put a reference code + visible Contact Support button on the 500 page; and add a "Help & Docs" sidebar section that surfaces the existing guides. Consider a first-7-days guided tour on Designer / Forms / Shipping.

### 8. (High) The chat widget is the wrong chat

`FloatingChat.vue` is a complete real-time messaging UI (FAB, thread sidebar, unread badges, sockets) but its own comment (line 3) scopes it to internal team messaging. It is not connected to customer tickets, has no storefront-facing widget, and no assignment/SLA model. The infrastructure for support chat largely exists — it just isn't pointed at customers.

**Recommendation (confidence: likely):** Add a "Support Inbox" tab that renders tickets (from #3) as chat threads, and/or a public storefront support widget that lets customers message support directly. Link the two so staff replies reach the customer in real time.

### 9–11. (Medium) Confirmation, visibility, and escalation finishing touches

- **Contact page over-promises (`contact.vue:79-88`).** It states "We'll get back to you within one business day," but `notify_emails` go only to the admin (`StorefrontFormController.php:173-185`) — the customer gets no confirmation. Close this together with #2.
- **No dashboard health widget.** `nuxt/app/pages/index.vue` has no error-rate, pending-tickets, or SLA card; the Action Center is internal-only (domain/payment alerts, not support/error alerts). An owner with 10 pending messages and 5 storefront errors sees nothing — and can't reach the logs anyway (#1).
- **No owner-to-Print-Flow escalation.** There is no "Report Issue" action in the admin and no way to bundle diagnostics. Owners fall back to external email/phone, losing all context.

**Recommendations:** Send a customer confirmation email with reference + status link; add a "Support & Health" dashboard card (error counts, pending tickets, SLA %, service status) plus a critical-alert banner on 5xx spikes; and add a "Report Issue to Print-Flow Support" modal that auto-fills `tenant_id`, recent error logs, current URL, and user agent into a `SupportRequest` record.

---

## Stale-doc corrections

No prior support/help-desk findings were on record to re-verify; all items above are first-pass and code-grounded against the current `store-theme-change` branch. Treat this section as the baseline for future re-verification.

---

## Readiness recommendations (clearly labelled — not findings)

1. **Recommendation:** Sequence the three blockers as one epic — the `Ticket` model (#3) is the dependency for confirmation/status (#2, #9) and owner visibility (#1, #10). Ship that backbone first.
2. **Recommendation:** Define and display an SLA from day one (e.g. "within 1 business day") only once a confirmation + status path exists — promising it without delivering (today's `contact.vue` state) erodes trust faster than no promise.
3. **Recommendation:** Add a single public status/health endpoint (`GET /api/v1/storefront/errors/:id` → `{status, message, resolved_at}`) that both the 500 page and the contact status page can consume, so customers can self-check recovery.
4. **Recommendation:** Wire the offline `/readme/docs/content` guides into the product before launch even as plain external links — undiscoverable docs are equivalent to no docs for a non-technical owner.
