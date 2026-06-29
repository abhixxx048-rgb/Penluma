# Make What We Have Better - Feature Improvement R&D, Round 2 (Wave-5)

> **Date:** 2026-06-02
> **Goal:** Same as Round 1 - not new features, make our **existing** features easier, clearer, and more useful for **current** non-technical store owners.
> **What's different this round:** Round 1 (`FEATURE_IMPROVEMENT_RD_2026-06-01.md`) found a class of "confirmed-then-discarded" lies and waves 1–4 shipped fixes. This round **first verified what those fixes actually did** (many were "strong leads," not confirmed), **then** went deeper to find what's still hard.
> **Method:** Multi-agent council, 40 agents, ~2.1M tokens, grounded in real code. Per feature: an agent ① read the current code + the relevant wave commit to mark each prior claim *fixed / partial / open* with `file:line` evidence, ② did a fresh deep usability audit of what's still painful, ③ a two-person council (owner-advocate + support-load-reducer) debated and ranked fixes. A chair then found the cross-cutting patterns.
> **Trust note:** every `file:line` below came from an agent reading real code, but confirm before you fix - and per the house rule, every bug fix needs a test that reproduces the bug first.

---

## The one finding that matters most

> **Waves 1–4 fixed the *visible* lies and left the *write-path* lies intact.** Across all 13 features the sharpest remaining friction is some variant of: the UI says *"Saved," "Sent," "Activated," "Configured,"* or *"You're all caught up,"* while the underlying action silently failed, reached nobody, or committed a destructive change the owner never confirmed. We added scaffolding (badges, status fields, empty states) but in several places the actual save, mount, migration, or guard was never wired.

The two most damaging concrete instances - both cheap to fix:

- **Kanban silent-state lie** - a Kanban drop commits a status change (which can **email the customer** and notify the team) with no confirm; on success it only `console.log('success')` (`KanbanBoard.vue:579`), and on a `200`-with-`ok:false` it leaves the card moved on screen while the DB never changed (`KanbanBoard.vue:581`), no rollback.
- **Products "Save & Back" lie** - `saveGeneralAndBack` (`AdminProductTabs.vue:613-619`) navigates to the list whenever `!isSubmitting`, but `isSubmitting` is reset in `finally` *before* the check, so the guard is **provably always false** - the owner is bounced to the list believing a failed (e.g. duplicate-SKU) save succeeded.

---

## ⚠️ Prior "fixes" that were incomplete or false (re-do list)

These were believed done after waves 1–4 - the highest trust-risk items because nobody is watching them anymore. Re-verify each rather than trusting the commit message.

| Prior claim | Reality (verified this round) | What's actually needed |
|---|---|---|
| **Pricing calculator "mock" fixed** | The component was rewired to the real engine but is **dead code, mounted nowhere** - while `guide.vue:735` still tells owners to use it. | Mount it on the pricing-rules screen. |
| **New signups auto-approved trial** | **False by default.** `auto_approve_signups` column **was never migrated** → resolves null→false; every signup lands in pending-approval. | Migration + cast + default-on. |
| **Onboarding "checklist that can never complete" fixed** | **Re-broken in the default no-store state:** `resolveStore()→null` disables 4 of 5 steps, reviving the dead-end. | Add a gated "Create your store" step 0. |
| **Analytics currency fixed (a13bb391)** | **Partial** - only the main dashboard widget; the dedicated Store Analytics page is **untouched**, still en-US/USD everywhere. | Currency sweep on the analytics page + pricing API + AI builder. |
| **Order badges colored by real status** | **Partial** - tenant override added, but the fallback `getStatusColor()` has **no paid/void/refunded case** → all gray out of the box; job table still prints raw `void`. | Delegate both `getStatusColor`s to `statusColor.ts`; render `statusLabel()`. |
| **AI Builder orphan-product fixed** | **Half** - now store-assigned, but the "Open in Designer" button passes the **numeric PK** where a **store UUID** is required (`AiProductBuilderController.php:64`), so the studio silently fails. Also no idempotency on re-submit. | Pass `getCurrentStore()->uuid`; add dedup. |
| **B2B over-credit error has numbers + next step** | **Partial** - the figures live on `CreditLimitExceededException` but are **never interpolated** into the message; no recovery step. | Interpolate available/attempted + recovery copy. |
| **Integrations per-field help shipped** | **Plumbing present, content absent** - `:help` is bound but **0 of ~40** seeded attributes carry a `description`. | Seed descriptions + "where to find this." |
| **Save-as-Template (Storefront Builder)** | **Open** - write-only dead end; `getBlockTemplates` is never imported, nothing re-inserts a saved template. | Close the round-trip. |
| **Designer layer-naming / "Material" tab / mobile Preview** | **Mostly open** - manual rename added, but no auto-derivation from content; rows still show `textbox`/nanoid; "Material" still mislabeled; mobile Preview still downloads PNGs. | Auto-name from content; rename tab; in-editor Preview modal. |
| **All four Payment Gateway claims** | **All open** - `git log --since=2026-06-01` touched no gateway file. Webhook URL unshown, secret optional, no activation guard, sandbox mode invisible at checkout. | See Tier 0–2 gateway items. |

---

## Cross-cutting patterns that survived waves 1–4

Each appears in many features - which is why one-off patches keep missing them. Fix the *pattern* once.

**A. Success/empty states that are actually silent failures.** Orders/Jobs (`KanbanBoard.vue:570-590`), Products (`AdminProductTabs.vue:613-619`), Integrations (green "Activated" on blank keys, `index.vue:434-443`), Payment ("saved" ≠ "works"), Email (empty audience → "Sent to 0", `SendEmailCampaignJob.php:41-48`), Analytics (failed load = all-zero dashboard, error UI unreachable at `index.vue:55-59`), Action Center ("Critical (5)" → green "all caught up"), AI Builder (Designer URL passes PK not UUID).

**B. Destructive actions with no confirmation / stated consequence** (a direct CLAUDE.md §0 violation). Kanban drop-to-Cancelled + one-click Archive (`KanbanBoard.vue:275,408`); Designer layer/image deletes; B2B `removeContact/removeDepartment/removePriceRow` (direct API calls *while account-delete right above them has a full modal*, `business-accounts/[id].vue:697,766,854`); Action Center permanent Dismiss; Storefront Builder list-delete uses native `confirm()` while the editor has a styled modal.

**C. Raw identifiers / jargon / untranslated keys leaking to owners.** Email product picker is a textarea of raw DB IDs (`Upsert.vue:86-88`); Products header `ecommerce`, Options raw `pricing_type`, "Slug"; Orders raw `void`; Designer `textbox`/nanoid rows + literal `message.exportError` toast (missing i18n keys); Integrations/Payment raw `service_key`; Analytics raw enum statuses.

**D. The error state is the one always skipped.** Teams added loading + empty but swallowed the error path into `console.error`: Jobs (`job/List.vue:611-613`), Storefront pages list (`index.vue:337-339`), Analytics, Designer clipart (`IllustrationTab.vue:104-105`).

**E. Confirmed-then-discarded / "looks done but isn't wired"** (the Round-1 class, still recurring). Save-as-Template write-only; `emitUpdate` hard-codes `data_binding: undefined` so any edit wipes a block's binding (`BlockSettingsEditor.vue:333-341`); the real PricingCalculator is mounted nowhere; quantity-tier rules can't save (field-name mismatch `form.vue:564` vs `StorePricingRuleRequest.php:36-38`).

**F. Currency hardcoded to `$`/USD** (the known currency-flow gap). Analytics page (`index.vue:347-351,122,441,472,484`), pricing calculate-price API (`ProductController.php:473,526-528`), AI Builder (`product-builder.vue:204,295`).

**G. Two parallel code paths for one concept** (they drift and disagree). Pricing inline modal vs full-page editor; Email old `Campaign` vs new `EmailCampaign`; Orders list `void→Cancelled` vs detail modal raw; Products base-price/margin in General + PricingHub.

**H. Guards that don't gate** (incompleteness *shown* but not *enforced*). Integrations `configuration_status` computed but `toggle()/update()` never block activation; Payment `webhook_secret` still `required:false`; Onboarding `auto_approve_signups` never migrated.

**I. Whole-feed vs current-page mismatch** (counts lie relative to rows). Action Center tab badges from whole-feed `meta.counts` while rows are one page; B2B restricted-catalog names capped at `per_page:25` → fall back to "Product."

---

## Wave-5 roadmap - easiest-and-most-damaging first

### 🟥 Tier 0 - one-line / hours, stops active lies or page crashes. Ship immediately.

1. **Honor the server result in `updateJobStatus` + roll back on `ok:false`** *(Orders/Jobs, hours)* - `KanbanBoard.vue:570-590`; `showSuccess`/`showError` instead of `console.log`.
2. **Fix Save & Back silent navigation** *(Products, hours)* - `submit()` returns a success boolean; only `navigateTo(list)` on true.
3. **Null-guard `job/List.vue:getStatusColor`** *(Orders/Jobs, hours)* - `(status||'').toLowerCase()` stops a page-blanking crash (`List.vue:424`).
4. **Stop the empty-audience "Sent to 0"** *(Email, hours)* - status `failed`/`sent_to_none` with a plain reason (`SendEmailCampaignJob.php:41-48`).
5. **Make `loadSummary`/`loadChart` surface failures** *(Analytics, hours)* - set `error.value=true` so the existing error UI renders instead of a fake all-zero dashboard.
6. **Scope B2B suspension to ALL payment paths** *(B2B, day - top severity)* - `isActive()` guard on the gateway-paid checkout (`StorefrontCheckoutController.php:459` reads only `company_account_id`). *Add a feature test.*
7. **Block activation of incomplete integrations + gateways** *(Integrations + Payment, day)* - completeness check in `IntegrationService::toggle()/update()`; tie `is_active=true` to `webhook_secret`. One pattern fixes both features' "green Activated, can't work" lie.
8. **AI Designer URL: pass store UUID not PK** *(AI Builder, hours)* - `AiProductBuilderController.php:64` → `getCurrentStore()->uuid`.
9. **Header status badge: "Active"/"Hidden", not invented "Draft"; reuse `productTypeLabel()`** *(Products, hours)* - `AdminProductTabs.vue:15,534-539`.
10. **Add the three missing Designer i18n keys** *(Designer, hours)* - `exportError`/`saveError`/`previewPdfReady` so toasts stop showing literal `message.*`.

### 🟧 Tier 1 - hours-to-a-day, closes a blocked core task or a destructive trap.

11. **Quantity-tier save mismatch** *(Pricing, hours)* - align field names end-to-end + `StorePricingRuleRequest extends BaseRequest`; the most common print rule can't save today. Add a backend test.
12. **Empty-state "Create Custom Rule" → real navigation** *(Pricing, hours)* - bind to the same `getProductPath(.../form)`; delete the undefined `addRule`.
13. **Server-side severity filtering** *(Action Center, day)* - send `severity` param; one change retires the false-green, vanishing-pager, and drifting-count frictions at once.
14. **Consequence-stating confirm on destructive actions, batched** *(Orders/Jobs, Designer, B2B, Action Center, Storefront Builder - day each, shared pattern)*.
15. **Add the missing error state to lists** *(Orders/Jobs, Storefront Builder, Analytics chart, Designer clipart - day, one shared `fetchError` + retry pattern)*.
16. **`data_binding: undefined` wipe** *(Storefront Builder, hours)* - only emit `data_binding` when it changed (`BlockSettingsEditor.vue:333-341`).
17. **Per-store unique slug** *(Storefront Builder, day)* - validation rule + DB constraint so the second page can't silently shadow the first.

### 🟨 Tier 2 - day-to-days, completes a half-built or dead feature.

18. **Mount the real PricingCalculator** *(Pricing, day)* - render it so `guide.vue:735`'s instruction is followable.
19. **Close the Save-as-Template round-trip** *(Storefront Builder, days)* - import `getBlockTemplates`, add a "My Templates" category.
20. **Currency threading sweep** *(Analytics, Pricing API, AI Builder, day total)* - port the `CurrencyHelper::settingsForStore` pattern already on the main dashboard.
21. **Settings toggle for B2B + migrate `auto_approve_signups`** *(B2B + Onboarding, days)* - both are "feature invisible because a flag/column was never made reachable."
22. **Onboarding "Create your store" gate + stop demo products satisfying the product step** *(Onboarding, days)* - exclude `is_demo` from `checkProductStep`; non-dismissible store step; empty-state for storeless tenants.
23. **Test Connection / Send-a-test-to-myself** *(Payment, Integrations, Email, days)* - one "verify before you go live" pattern missing in three features.
24. **In-editor Preview modal** *(Designer, days)* - reuse `fabricStore.isPreview` so Preview shows the design instead of downloading a file.

### 🟦 Tier 3 - label/jargon polish (cheap, batch alongside the above).
Auto-derive human layer names from content *(Designer)*; de-jargon block library + "Custom HTML"/Quill mismatch *(Storefront Builder)*; option `pricing_type` + "Slug" labels *(Products)*; raw `service_key`/"seeded" copy *(Integrations/Payment)*; "Reorder threshold" wording *(Action Center)*; raw `void` in order detail modal *(Orders)*; AI confidence/reasoning + color swatches *(AI Builder)*.

---

## Per-feature - sharpest remaining friction + top fixes

Each feature's single sharpest friction (in plain owner language) and its highest-impact "do now" fixes (impact /10, effort).

### Products
**Sharpest:** Turning a finished product's "Active" switch OFF flips the header badge to **"Draft"** - the word for "never finished" - so it looks like the product reverted. And "Save & Back" can bounce you to the list even when the save *failed* (duplicate SKU), so you believe it saved when it didn't.
- *(9, hours)* Fix Save & Back silent navigation - only navigate on a real success.
- *(8, hours)* Header badge "Active"/"Hidden", not an invented "Draft".
- *(7, hours)* Map `ecommerce` → "Physical Product" (reuse `productTypeLabel()`); give PricingHub a "Save the product first" state instead of a faded dead body.
- *(6, day)* Bind the 422 field errors the API already returns onto the General-tab inputs.

### Pricing & Price Calculator
**Sharpest:** "I built my bulk-discount rule, hit Create, all it says is *'An error occurred'* - so I can't save the one rule every print shop needs, and the guide tells me to test it in a calculator that isn't on screen anywhere."
- *(10, hours)* Fix the quantity-tier field-name mismatch end-to-end + structured 422s. Add a backend test.
- *(9, hours)* Make the empty-state "Create Custom Rule" button actually navigate.
- *(8, day)* Mount the (now-real) PricingCalculator so the guide's instruction is followable.
- *(7, days)* Make the formula field authorable - insert-variable chips + a "Check Formula" button.

### Orders & Print Jobs
**Sharpest:** Dragging a Kanban card to tidy up silently fires a real status change - it can email the customer, notify the team, write to the DB - with no confirm and no "Saved" feedback; and if the save is rejected the card stays moved on screen while nothing changed.
- *(9, hours)* Honor the server result in `updateJobStatus`, roll back on failure.
- *(9, day)* Confirm every status-changing drop with stated consequences; stronger warning for terminal states.
- *(8, hours)* Null-guard `getStatusColor`; route the Kanban Archive button through the void-confirm modal.
- *(6, day)* Delegate both `getStatusColor`s to `statusColor.ts` + render `statusLabel()` so Paid/Void/Refunded aren't identical gray.

### Designer Studio
**Sharpest:** At the two highest-stakes moments - saving and previewing before ordering - the tool literally shows **"message.exportError"** gibberish, and "Preview" never shows the design, it just dumps a file.
- *(9, hours)* Add the three missing i18n keys (`exportError`/`saveError`/`previewPdfReady`).
- *(9, days)* Make "Preview" show the design in an in-editor modal; keep download as a secondary button.
- *(8, day)* Confirm before deleting a layer / uploaded image, in plain language.
- *(8, days)* Auto-derive a human layer name from content, replacing `textbox`/nanoid.

### B2B / Corporate Accounts
**Sharpest:** Suspending a company shows *"Suspended (can browse, cannot order)"* - but they can still place and **pay by card**. The one safety switch an owner most needs to trust quietly doesn't work.
- *(10, day)* Add an `isActive()` guard on the gateway-paid checkout so suspension blocks ALL payment methods. Add a feature test.
- *(9, days)* Settings toggle to enable B2B instead of the env-only flag.
- *(8, day)* Show the real decline reason on the buyer's order list, not a bare red "VOID".
- *(7, hours)* Interpolate real numbers + a recovery step into the over-credit error; confirm dialogs on remove-contact/department/price.

### Storefront Builder
**Sharpest:** "I made a new page, it said saved, but customers still see my old page." Two pages can share a slug - the second is written and shows green success but the storefront resolves to the first match, so the new content is permanently invisible with no warning.
- *(10, day)* Enforce unique slug per store (validation + DB constraint) with a plain-language collision error.
- *(9, hours)* Add empty AND error states to the pages list.
- *(8, days)* Close the Save-as-Template round-trip (a "My Templates" category that re-inserts).
- *(8, hours)* Stop `emitUpdate` wiping `data_binding` on every edit.

### AI Product Builder
**Sharpest:** The "Open in Designer" button hands the store's internal number instead of its proper ID, so the studio can't find the store - canvas, uploads, and Save silently fail right after the screen said it worked.
- *(9, hours)* Pass the store UUID (not PK) into the Designer URL.
- *(8, hours)* Add a "View in your products (drafts)" deep link on the success screen.
- *(8, day)* Use the store's real currency in all three result-card spots, not hardcoded USD.
- *(6, days)* Server-side idempotency/dedup + a cost-aware "Create another" confirm.

### Action Center
**Sharpest:** Click "Critical (5)" and the screen shows a green *"You're all caught up"* - because filtering is client-side over one page while the badge counts the whole feed. The one screen meant to show what's on fire reassures you nothing is.
- *(10, day)* Make severity filtering server-side so counts, page slice, and empty-state describe the same set.
- *(8, days)* Confirm + undo on permanent Dismiss.
- *(7, hours)* Re-sync counts from the server after dismiss/snooze instead of hand-decrementing.
- *(5, days)* Distinguish "genuinely nothing wrong" from "you can't see these" (permission-filtered) empty state.

### Integrations
**Sharpest:** An owner can flip Stripe to "Active" with blank keys and get a green "Activated" - believing payments are live - then ship a broken checkout. The "Configured"/100% bar shows confident green with nothing entered.
- *(10, day)* Block activation of an incomplete integration; disable the toggle with a tooltip.
- *(9, day)* Fix the lying `configurationStatus` + the fake fixed-width progress bar.
- *(9, days)* Add a real Test Connection (provider ping) with plain pass/fail.
- *(8, days)* Seed per-field help + "where do I find this?" for every credential.

### Payment Gateways
**Sharpest:** "I typed my keys, switched it on, it said *'saved successfully'* - but when a real customer pays, the order never shows as paid and nothing warns me." The screen confirms values were *stored*, never that payments *work*; orders pile up "pending" because the webhook URL was never shown and the secret was optional.
- *(9, hours)* Show the webhook endpoint URL on each card with a copy button + one instruction.
- *(9, day)* Block `is_active=true` when `webhook_secret` is blank.
- *(9, days)* Add a "Verify connection" button hitting the gateway API with saved keys.
- *(7, day)* Surface a sandbox/"Test mode - no real charge" badge at checkout.

### Onboarding
**Sharpest:** After signup nothing tells me to create a store - yet the checklist already shows "Add your first product" ticked green (from demo data), so I think I'm done. The dashboard is full of empty charts and "Upload Logo" dumps me on a page with nowhere to upload a logo.
- *(9, hours)* Exclude `is_demo` from `checkProductStep` so the step only greens on a real product.
- *(9, days)* Add a gated, non-dismissible "Create your store" step 0 + a storeless-tenant empty state.
- *(8, hours)* Point "Upload Logo" at the real logo control, not the read-only detail page.
- *(6, day)* Migrate `auto_approve_signups` + default self-serve signups to auto-approved trial.

### Analytics Dashboard
**Sharpest:** When analytics fails to load, the page doesn't say so - it shows every figure as $0 and stops spinning, so a shopkeeper with real sales can't tell "failed to load" from "you sold nothing." And the customer counts beside the (store-scoped) revenue count the whole account.
- *(10, hours)* Make `loadSummary`/`loadChart` set `error.value=true` so the real error UI + Retry renders.
- *(9, hours)* Scope `getCustomerStats()` to the store.
- *(8, hours)* Fix Avg Order Value to divide paid revenue by a *paid*-order count, matching its label.
- *(8, day)* Thread tenant currency through the analytics page + chart.

### Email & SMS Campaigns
**Sharpest:** "I wrote my email, hit Send, the screen says it went out - but I can't know it reached anyone, can't send a test to myself first, and a campaign whose audience emptied out gets stamped green *'Sent'* to 0 people."
- *(9, hours)* Stop marking an empty-audience send as "sent" - `failed`/`sent_to_none` with a plain reason.
- *(9, day)* Add "Send a test to myself".
- *(8, days)* Replace the raw product-ID textarea with a name-based product picker.
- *(8, day)* Give failed campaigns a Retry / Edit & resend path.

---

*Generated by a code-grounded multi-agent council (40 agents, ~2.1M tokens). Companion to Round 1 (`FEATURE_IMPROVEMENT_RD_2026-06-01.md`). The re-do table and Tier-0 items are the highest-trust-risk findings - they were believed fixed. Confirm each `file:line` before fixing; every bug fix needs a reproducing test first.*
