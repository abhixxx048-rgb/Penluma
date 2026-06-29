# Make What We Have Better - Feature Improvement R&D

> **Date:** 2026-06-01
> **Goal:** Not new features - make our **existing** features easier, clearer, and more useful for our **current** non-technical store owners.
> **Method:** Multi-agent R&D council. For each of 13 core features: an audit agent **read the real code** (file + line), then a two-person council (a non-technical-owner advocate + a UX/support-load reducer) debated the friction, then a chair found the cross-cutting patterns and ranked fixes. 40 agents, ~2.1M tokens, grounded in this codebase.
> **Verification:** The two headline bugs below were hand-verified against the actual source before publishing this doc. Treat every other `file:line` citation as a strong lead to confirm before fixing - but the audit read real code, not guesses.

---

## The one finding that matters most

> **Our biggest problem isn't missing features - it's that several features quietly LIE to the owner.** The screen says *"Saved"* / *"Success"* / *"Active"* while the real work silently didn't happen. For a non-technical shopkeeper this is the worst possible failure: positive feedback followed by invisible data loss, with no error to investigate and no way to self-diagnose. Every one of these is a guaranteed support ticket - and the kind that destroys trust.

We call this pattern **"confirmed-then-discarded"** and it shows up across the whole product. Fixing these comes before everything else.

### ✅ Two confirmed-in-code examples (verified by hand)

**1. The phantom Markup field (Products) - worst bug in the platform**
The owner types a profit markup, watches the big green **"Effective Price"** box update to confirm it, clicks Save, sees *"Pricing saved successfully"* - **and the value is silently thrown away.** The product keeps selling at base price (i.e. at cost).
- `PricingHub.vue:47` binds `form.markup`; line 239 computes `base * (1 + markup/100)` for the green box.
- `AdminProductTabs.vue:625` sends `markup` in the save payload.
- But `StoreProductRequest.php:39` and `UpdateProductRequest.php:40` only accept `profit_margin` - `markup` is never validated, so Laravel **drops it before it touches the database.**
- The owner cannot diagnose this. They just see lower revenue and never connect it to a field that "looked saved."
- **Fix:** wire the UI field to the real `profit_margin` end-to-end (create + update + savePricing payloads, and seed it back on load), OR delete the field and the green box entirely. Never ship the in-between state.

**2. AI Product Builder creates products that vanish (verified)**
*"Product created successfully"* with a green check and a confidence score - but `AiProductCreatorService.php:47` creates the product as `ACTIVE_STATUS` and **never assigns it to the owner's store** (no `syncProductStores` / `stores()->attach` / `store_id`). So it's "live" but attached to nothing, and never appears in the shop. Owners assume the tool is broken and re-run the prompt, piling up orphan duplicates.
- **Fix:** auto-assign the new product to the current store, and create it as **Draft** ("Saved as a draft - review the price and add a photo, then publish") so an AI-guessed price/photo never goes live by accident.

---

## The 6 recurring patterns (fix once, help everywhere)

These show up across many features. Each one, built as a **shared building block**, repairs dozens of screens at once - the highest leverage per hour of work.

### Pattern 1 - Confirmed-then-discarded (the success message must be TRUE)
**Where:** Products (Markup), Orders (Mark-as-Paid never fires the receipt), Payment Gateways/Integrations ("Active" on a half-configured gateway that never collects money), AI Builder ("created" but unassigned), Email Campaigns (0-recipient send marked "sent"), Storefront Builder ("Save as Template" succeeds but can never be re-inserted; "Set as Homepage" does nothing).
**Fix:** Make every on-screen confirmation tell the truth. Wire fields to real saved values, route status changes through the lifecycle methods that fire automations, block "Active" until a real Test Connection passes, auto-assign AI products, never report a send/save as successful when nothing went out. **Make "the success message must be true" a hard review gate.**

### Pattern 2 - Missing error/empty states that read as "all clear" or "broken"
**Where:** Action Center (a failed dashboard widget shows the green "all caught up" check), Job Kanban (failed load = empty board = "my jobs vanished"), Storefront pages list (blank table looks identical to a network error), Analytics, most data views.
**Fix:** Apply the house three-state rule - **loading skeleton / helpful empty / plain-language error + Retry** - to every data view. Build **one shared empty-state + error-state component pair** and drop it into each list/board/widget. Never render the success/empty state on a failed fetch.

### Pattern 3 - Raw technical output leaking into owner-facing labels
**Where:** Designer layer list (`textbox`, `svgimage`, `V1StGXR8_Z`), Product cards (a badge literally reads `none`/`fixed`), Orders (priority shown as a bare `9`), Payment Gateways (`authorizenet` under the brand name), B2B catalog (product UUID instead of name), AI Builder (raw `ecommerce`/`quantity_tier`), Storefront editor (`yourstore.com`, slug chips, raw `rem` values).
**Fix:** Build small shared label helpers - `getLayerLabel()`, `humanizePriority()`, a product/pricing-type map, a status-color util - and use them everywhere the raw value shows today. Near-zero risk, platform-wide payoff, and it enforces the existing house standard.

### Pattern 4 - Destructive actions with no stated consequences and no undo
**Where:** Email Campaigns (one click blasts the whole list, no count, no confirm in the authoring form), Job Kanban (a one-pixel mis-drag into "Cancelled" silently kills a live job), Action Center ("Dismiss" permanently hides a still-overdue invoice with no undo), list deletes (bare browser confirm).
**Fix:** Standardize on the consequence-stating confirm modal with a restated action button ("Send to 1,240 people", "Cancel Job", "Delete Page"), show the real number/name affected, and add one-tap **Undo** where reversible.

### Pattern 5 - Integrations that fail silently and can't be self-verified
**Where:** Integrations & Payment Gateways (no per-field help, no Test Connection, webhook URL surfaced nowhere, can activate while incomplete), B2B (gated by a `.env` flag the owner can't touch), Action Center & Email (silently inert when no gateway/provider is configured).
**Fix:** Three shared moves - (a) seed plain-language help text + real placeholders + a "where to find this" link for every credential field; (b) add a real **Test Connection** per driver and block "Active" until it passes; (c) surface the **webhook URL** with a Copy button. Reuse the house "unconfigured integration → explain + link to setup" pattern everywhere.

### Pattern 6 - Two divergent UIs / two parallel systems for the same task
**Where:** Pricing rules (a weaker modal editor vs the full-page editor), Email/SMS (two unrelated campaign systems), Onboarding (two register routes + a legacy fake-numbers dashboard), Products pricing (base price + markup duplicated across General and the Pricing hub).
**Fix:** Pick one canonical implementation per task, delete/redirect the other, and keep single-source-of-truth data (one home for base price + margin). Fewer surfaces means future fixes can't miss a copy.

---

## The roadmap - 4 waves, easiest-and-most-damaging first

### 🌊 Wave 1 - Stop the silent lies (days, not weeks)
Small fixes that each kill a whole category of undiagnosable ticket. Ship in this order:
1. **Products** - fix or remove the phantom Markup field.
2. **Orders** - make "Mark as Paid" actually fire the receipt automation (route through `markAsPaid()`/`finalize()`/`markAsVoid()` + `STATUS_CHANGED`, not a raw status write).
3. **AI Builder** - auto-assign the product to the store + save as Draft.
4. **Email Campaigns** - Send-Now confirm with a real recipient count; refuse to send to a 0-person audience.
5. **Action Center** - give the dashboard widget a real error state so a failed load stops showing the green "all caught up."

> Together these restore the basic promise: *when the screen says it worked, it worked.*

### 🌊 Wave 2 - Ship the shared building blocks (1–2 weeks, highest leverage)
Build four small reusable pieces, apply platform-wide:
- **(a)** Plain-language label/status helpers (layer names, priority words, product/pricing-type maps, status colors).
- **(b)** Standard empty-state + error-state-with-Retry pair in every list, board, and widget.
- **(c)** Consequence-stating confirm modal + Undo for destructive actions.
- **(d)** Integration help-text seed + Test Connection + visible webhook URL + "can't activate while incomplete" guard.

### 🌊 Wave 3 - The big experience investments (multi-week)
Now that trust is restored and the product is de-jargoned:
- **Onboarding** - auto-create the owner's first store at signup (fire the storefront-seeding pipeline), default to auto-approved trial, show a focused first-run setup screen instead of the empty 10-widget BI dashboard. *(Root cause of the worst first impression: today no store exists after signup and nothing tells the owner to create one.)*
- **Pricing** - replace the **mock** `PricingCalculator` (it fakes a result, never calls the API) with the real `calculate-pricing` endpoint, embedded in the rule editor, previewing the **unsaved draft rule live**. *(Today the module tells owners "test your rule before activating" but sends them to a stub that always says "no rules applied" - so they save live rules blind.)*
- **B2B** - replace the developer-only `B2B_MODULE_ENABLED` `.env` gate with an owner-facing setting + a guided explainer. *(An owner who paid to sell to businesses sees no menu and no explanation.)*
- **Email** - a friendly rich-text/template editor + "Send a test to myself" instead of a raw HTML textarea and a product-ID textarea.
- **Integrations/Payments** - a real per-driver Test Connection that blocks going Active until it passes; persistent "Test mode" banner.

### 🌊 Wave 4 - De-duplicate and document (ongoing cleanup)
Collapse the two pricing-rule editors into one, unify the two campaign systems, remove the duplicate register route and legacy fake-numbers dashboard, bring size/option editing inline, refresh stale designer + AI docs.

> **Guiding rule throughout:** treat *"the success message must be true"* and *"every data view needs loading + empty + error states"* as non-negotiable review gates, so these patterns stop re-entering the product as new features ship.

---

## Per-feature highlights

Each feature's single sharpest friction + its top "do now" fixes (impact /10).

### Products
- **Sharpest:** the phantom Markup field (verified above).
- Replace silently greyed-out tabs on a new product with a clear "save the basics first to unlock" step *(imp 9)*; block Create until SKU + Subcategory are filled with inline errors *(imp 8)*; humanize pricing/type badges - never render `none`/`fixed` *(imp 7)*; one "How this product is priced" summary at the top of the Pricing tab, de-duplicating base price + margin into one home *(imp 8)*.

### Pricing & Price Calculator
- **Sharpest:** the module tells owners to "test your rule before activating," but the calculator they're sent to is a **mock that always says 'no rules applied'** - so they save live rules blind.
- Replace the fake calculator with the real one *(imp 10)*; preview the **unsaved** rule, not just saved ones *(imp 9)*; make Formula authorable with insert-variable chips + a "Check formula" button *(imp 8)*; hide Priority/Replacement under "Advanced" with sensible defaults *(imp 7)*.

### Orders & Print Jobs
- **Sharpest:** "Mark as Paid" never fires the receipt/notification automations the owner set up (raw status write bypasses `markAsPaid()`).
- Make Mark-as-Paid fire the receipt *(imp 10)*; confirm before a drag cancels a real job *(imp 9)*; color order badges by real status so Paid/Void/Refunded are distinguishable *(imp 8)*; show job priority as a word (Rush/High/Normal/Low), not a bare number *(imp 7)*.

### Designer Studio
- **Sharpest:** the layer list speaks developer - `textbox` / `svgimage` / `V1StGXR8_Z` - so nobody can tell which row is their logo.
- One `getLayerLabel()` so every row shows a human name *(imp 9)*; ensure **buyers** get readable names too *(imp 8)*; rename the "Material" tool tab to "Shapes" *(imp 6)*; on mobile, "Preview" should show the design, not download PNGs *(imp 7)*.

### B2B / Corporate Accounts
- **Sharpest:** the only enable switch is a `.env` flag - an owner who bought B2B sees no menu and no explanation.
- Let owners turn B2B on from Settings *(imp 10)*; put real numbers + a next step in the over-credit-limit checkout error *(imp 8)*; show real product names (not UUIDs) in the restricted-catalog list *(imp 7)*; link the "no business store" warning straight to the store-type setting *(imp 6)*.

### Storefront Builder
- **Sharpest:** owners can't do the one thing they came for - "make THIS my homepage" - and "Save as Template" silently does nothing (the saved template can never be re-inserted).
- Stop promising "Save as Template" until it round-trips *(imp 9)*; add a plain "Set as Homepage" button + badge *(imp 9)*; add empty + error states to the pages list *(imp 7)*; let owners upload images instead of pasting a URL *(imp 7)*.

### AI Product Builder
- **Sharpest:** "Product created" but it's never assigned to a store, so it vanishes (verified above).
- Auto-assign to the current store *(imp 10)*; create as Draft and say so *(imp 9)*; fix the success wording + the empty Designer trap *(imp 7)*; guard against duplicate orphan products on re-submit *(imp 6)*.

### Action Center
- **Sharpest:** the trust feature has two silent ways of saying "nothing's wrong" when something is - a failed widget load shows green "all caught up," and the severity tabs filter only the current page while the count is whole-feed.
- Real error state on the widget *(imp 9)*; make Critical/Warning/Info tabs filter the whole feed server-side and never falsely say "all caught up" *(imp 9)*; confirm permanent Dismiss + one-tap Undo *(imp 8)*.

### Integrations
- **Sharpest:** paste a wrong credential, see "Saved," flip to Active, walk away - nothing tests it, no help text, failure is invisible until checkout.
- Fill in help text + placeholders + "where do I find this?" per field *(imp 9)*; stop an unconfigured integration from switching On *(imp 9)*; add a Test Connection with plain pass/fail *(imp 10)*; show the webhook URL with a Copy button *(imp 8)*.

### Payment Gateways
- **Sharpest:** the webhook URL is shown nowhere and the Webhook Secret is marked optional, so customers pay real money while orders sit "pending" forever.
- Show the webhook URL + Copy button + one instruction per card *(imp 10)*; point the onboarding checklist at the dedicated gateway page *(imp 8)*; make the gateway un-saveable into a broken state (webhook secret required) *(imp 9)*; make "Test mode" impossible to miss (amber banner + checkout badge) *(imp 8)*.

### Onboarding
- **Sharpest:** after signup no store exists and nothing tells the owner to create one - they land in an empty BI dashboard with a checklist that can never complete.
- Auto-create the first store at signup *(imp 10)*; default new signups to auto-approved trial *(imp 9)*; focused first-run screen, not the empty command-centre *(imp 9)*; can't-skip "Set up your store" step *(imp 8)*.

### Analytics Dashboard
- **Sharpest:** the numbers lie in the owner's own terms - INR/GBP stamped with `$`, one store's revenue next to all-stores' customer counts, "avg per paid order" that includes drafts.
- Show every figure in the store's own currency *(imp 9)*; scope Customer cards to the store being viewed *(imp 8)*; make "Avg Order Value / per paid order" actually true *(imp 7)*; honest "vs last month" at the zero baseline *(imp 6)*.

### Email & SMS Campaigns
- **Sharpest:** one click can email the entire customer base with no confirmation and no recipient count - the exact "sent to everyone by mistake" disaster, and irreversible.
- Last-chance confirm stating the real recipient count *(imp 10)*; always show recipient count + refuse empty audiences *(imp 9)*; product picker by name instead of a raw product-ID textarea *(imp 8)*; "Send a test to myself" that matches the real inbox email *(imp 8)*.

---

*Generated by a code-grounded multi-agent council. The two headline bugs (phantom Markup, AI-product-not-assigned) were verified by hand against the source. Other `file:line` citations are strong leads - confirm before fixing. Per the house testing rule, each bug fix needs a test that reproduces the bug before the fix passes.*
