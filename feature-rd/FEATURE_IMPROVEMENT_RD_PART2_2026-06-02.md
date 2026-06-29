# Make What We Have Better - Feature Improvement R&D (Part 2)

> **Date:** 2026-06-02
> **Goal:** Same as Part 1 - not new features, but making our **existing** features easier, clearer and more useful for our **current** non-technical users. Part 2 covers the modules Part 1 didn't.
> **Method:** Multi-agent council. For each of 13 features: an audit agent **read the real code** (file + line), then a two-person council (non-technical-owner advocate + UX/support-load reducer) debated, then the chair synthesized. 40 agents, ~2.2M tokens, grounded in this codebase.
> **Companion doc:** `readme/FEATURE_IMPROVEMENT_RD_2026-06-01.md` (Part 1 - Products, Pricing, Orders, Designer, B2B, Storefront, AI Builder, Action Center, Integrations, Payments, Onboarding, Analytics, Campaigns). Part 1's Wave 1 is already implemented.
> **Features covered here:** Imposition, Packaging, Proofs & Approval, Inventory, Quotes & Invoices, Subscription/Plan Billing, Roles & Permissions, Notifications, 3D Preview, Cart & Checkout, Customer Management, Automation Builder, Store Settings.
> **Verification:** The three headline silent-lie bugs (invoice Mark-as-Paid, Packaging unreachable, customer mass-assignment) were hand-verified against source before publishing. Other `file:line` citations are strong leads - confirm before fixing.

---

## The same villain, in new rooms

Part 1 found that features quietly **lie** - the screen says success while the real value is dropped. Part 2 confirms this is the platform's dominant failure mode, and it now touches **money, inventory, and orders** directly:

### ✅ Three headline bugs, verified by hand

**1. Invoice "Mark as Paid" records no payment (Quotes & Invoices)**
`InvoiceController::markAsPaid` calls the bare model method `$invoice->markAsPaid()` - which flips the status to "paid" but **creates no Payment row**. Meanwhile `InvoiceController::show` derives `amount_paid` and `balance_due` from the payments relation. So an owner who takes cash, clicks "Mark as Paid," sees the invoice flip to Paid - and then sees **"$0.00 paid / full balance due in red"** and an empty Payments list. The correct code already exists in `InvoiceService::markAsPaid` (creates the Payment, sends the receipt, accepts the linked quote, audit-logs). **Fix = delegate the controller to the service.** This is wiring, not new logic.

**2. The entire Packaging feature is unreachable (Packaging)**
`PRODUCT_TYPE_OPTIONS` in `nuxt/app/utils/productLabels.ts` lists `printing / tshirt / ecommerce / service / hybrid` - **`packaging` is missing**. The whole built-and-working chain (Packaging config tab, per-panel designer view, 3D box preview, dieline math, storefront Outside/Inside surface toggle) only activates when `product_type === 'packaging'`, which an owner can never select. **Fix = add ~6 lines** (one label + one option). Cheapest line-for-line win on the platform.

**3. Customer update can silently corrupt protected data (Customer Management)**
`CustomerController::update` calls `$customer->update($request->all())` **twice** (lines 402 & 412), and `Customer` has `$guarded = []`. So editing a phone number can silently overwrite `account_number`, `source`, `is_active`, or even `tenant_id`, and the double-write corrupts the audit baseline. **Fix = whitelist** to the editable contact fields with a single `update($request->only([...]))`. Pure correctness/security, no UX change.

---

## The 7 recurring patterns (fix once, help everywhere)

### Pattern 1 - Confirmed-then-discarded silent lies *(the worst, highest-leverage)*
The UI shows Saved/Paid/Approved while the real value is dropped, mis-routed, or not honored. **The correct behavior almost always already exists in code - the wrong path is just wired in.**
**Where:** Invoices (Mark-as-Paid records no Payment) · Inventory (restock writes `products.stock`, cart reads `settings.stock_quantity`) · Cart→Checkout (agreed total silently changes at payment) · Notifications (toggles flip in UI before a POST with no error handling) · Automation (Artwork/Quote&Artwork approval rules save green but can never fire) · Proofs (admin can still edit/re-send artwork a customer already approved) · Customer update (mass-assignment overwrite) · Store Settings (Business Tax Rate accepts `"GST"`/`"10%"` strings into pricing math).
**Fix:** Hunt every "save then toast" path and make the toast tell the truth - delegate to the code that actually persists, read/write ONE field end-to-end, snapshot-and-rollback optimistic toggles on failure, and only offer choices that can actually fire.

### Pattern 2 - Fully-built-but-unreachable features *(cheapest high-impact wins)*
Working code shipped dead because of one missing wiring line.
**Where:** Packaging (missing dropdown entry) · Plan limits (`usePlanLimits` composable imported in **zero** `.vue` files) · Buyer AR (`ProductARViewer.vue` imported nowhere, package not installed) · Imposition's New-modal Recalculate button wired to `@plan="()=>{}"` · a dead frontstore proof mock that fakes success.
**Fix:** Add the one missing line to light up the built code - or delete the dead component so it can never ship a broken empty tag.

### Pattern 3 - Two unsynced sources of truth for the same fact
The number the owner edits is not the number the system honors.
**Where:** Inventory (`products.stock` vs `settings.stock_quantity`) · Cart vs Checkout totals (two independent shipping computations) · Store identity (name/address/logo editable in both `/setting/account`→tenants AND per-store settings) · Proof status (literal strings written outside `ProofStatusEnum`).
**Fix:** Pick ONE source per fact, repoint all readers, remove/lock the duplicate editor, add a regression test asserting the two surfaces agree.

### Pattern 4 - Missing loading / empty / error states (a failure reads as "all clear")
**Where:** Inventory history (error → "No changes recorded yet", implies a wiped log) · Notification bell (error → "all caught up") · Roles list & editor (console-error-only → blank form) · Proof public review page (blank white card on error) · Store settings (try/finally with no catch → empty Currency dropdown) · Packaging tab.
**Fix:** Every data view gets three distinct branches - skeleton, helpful empty, plain-language error + Retry. An error must never render as empty/"all clear."

### Pattern 5 - Raw technical output & unexplained dangerous controls
**Where:** Imposition (UUID as a press-sheet label; Bleed/Gutter/Creep with no help; unitless money like `2.04` / `0.0610`) · Inventory (`add`/`deduct` enum badges) · RBAC (Void Order / Show Line Item Price render as plain toggles beside harmless ones) · Automation (`[customer.primary_contact_name]` bracket tokens → typo yields "Hi ,") · Customer list (raw `guest`/`registered`).
**Fix:** Map every enum/ID to a plain label, add the store currency via the shared `formatMoney` util, add inline help to jargon, flag financially dangerous permissions with a consequence string + confirm, give owners presets and an "Insert info" picker instead of blank slates and raw tokens.

### Pattern 6 - Destructive/committing actions with no consequence-aware confirmation
**Where:** Proof Approve (one tap commits a paid print run) · Invoice Mark-as-Paid (no amount/method/date, no confirm) · Role delete · Store Settings Reset (silently discards unsaved edits) · Customer archive (tied to live orders/revenue).
**Fix:** Restate the exact consequence + count affected; the confirm button restates the action ("Approve & Send to Print", "Archive Customer"). For payments, capture amount/method/date instead of one irreversible click.

### Pattern 7 - Unconfigured-integration dead-ends instead of guidance
**Where:** Subscription "no payment gateway" → "contact support" dead end · Checkout when shipping required but none configured → silent disabled Place Order · Notifications SMS column permanently greyed with no reason · Imposition PDF failure → blind Regenerate forever.
**Fix:** Replace dead ends with a plain explanation + a concrete next step (Request setup, Contact store, link to Settings, or the captured failure reason mapped to a fix).

---

## Roadmap - 4 waves, ordered by money-and-trust risk

> **Founder's rule of thumb:** anything where "the screen says X but the system does Y" jumps the queue - that's the failure that turns a non-technical owner into a support ticket they can't even diagnose.

### 🌊 Wave 1 - Stop the bleeding (silent-lie quick wins, ship first)
1. **Invoices** - `Mark as Paid` → delegate to `InvoiceService::markAsPaid` so a Payment row is recorded.
2. **Imposition** - block the no-fit `0×0` plan: show the already-computed reason and disable Save/Approve.
3. **Notifications** - wrap settings toggles + bell actions in try/catch with snapshot-and-rollback.
4. **Customer** - whitelist the update endpoint; remove the double `update($request->all())`.
5. **Automation** - remove the approval options that can never fire (Artwork / Quote & Artwork) + the dead `task_completed` trigger.
6. **Checkout** - move the "Order placed" success toast to *after* payment; pass the real grand total (not subtotal) to the success page.

### 🌊 Wave 2 - Make the dead reachable + close obvious dead-ends (quick wins)
7. **Packaging** - add `packaging` to `PRODUCT_TYPE_OPTIONS`/`PRODUCT_TYPE_LABELS`.
8. **Subscription** - give plan-limit 403s a machine code + an "Upgrade Plan" toast/button; add a fallback so `/auth/subscription` is never a blank lockout screen.
9. **Store Settings** - add a "Currency & Region" entry to the global Settings sidebar (deep-link to per-store regional controls); validate Business Tax Rate as a number.
10. **Everywhere** - add the mandatory loading/empty/error states (Inventory history, bell, Roles, Proof public page, Store settings).
11. **Cleanup** - delete the dead AR viewer and the fake frontstore proof mock so they can't ship broken.

### 🌊 Wave 3 - Unify duplicated truth + add the real workflows (medium)
12. **Inventory** - unify on `products.stock` as the single source the storefront reads; remove the duplicate Settings stock editor; auto-deduct on order placement (respect backorders) with order-reference history.
13. **Proofs** - show the order spec (qty/size/substrate/finishing/in-hand date) on the public review page, capture a required reject reason, confirm before Approve, make `ProofStatusEnum` authoritative (locks edit/re-send once approved).
14. **Invoices** - replace one-click Mark-as-Paid with a "Record Payment" dialog (amount/method/date, supports deposits & partials; auto-flip to Paid only when balance hits zero).
15. **RBAC** - plain-language helper text per access level, danger flags + confirm on Void/price-visibility permissions, surface the existing `config/permission.php` presets as "Start from a role…".
16. **Subscription** - wire `usePlanLimits` meters ("X of Y used" + disabled-with-reason Add button) into Products/Stores/Team list pages.

### 🌊 Wave 4 - The big investments (large)
17. **Cart & Checkout** - compute shipping + grand total **once on the server** for a cart + method; both cart and checkout read that single value; carry the cart's selected method into checkout; regression test asserting `cart total === checkout total`. *(Mandatory price-calculator-sync rule.)*
18. **Inventory** - full auto-deduct-on-order pipeline.
19. **Packaging** - surface-area pricing (charge by box size + material).
20. **Numbering** - per-tenant numbering for quotes/invoices/payments.

---

## Per-feature highlights

**Imposition** - *Sharpest:* a no-fit layout saves as a valid `0×0` "Planned" imposition the operator can Approve into a blank press sheet; the planner already computed the reason (`meta.error`) but nothing shows it. → Block + show the reason *(9)*; live Recalculate preview in the New modal *(8)*; surface the captured `pdf_error` with a recovery step *(8)*; currency symbol on all money values.

**Packaging** - *Sharpest:* unreachable (missing dropdown entry). → Add it *(10)*; validate depth so envelopes/pouches can't save broken *(7)*; later, surface-area pricing *(8)*.

**Proofs & Approval** - *Sharpest:* the buyer approves a paid print run seeing only title + images, **no spec** to check against. → Show what they're approving + capture a reject reason + confirm *(9)*; loading/already-decided/expired states on the public page *(8)*.

**Inventory** - *Sharpest:* two unsynced stock numbers; the one the owner edits isn't the one checkout honors. → Unify on `products.stock` *(10)*; auto-deduct on order *(9)*.

**Quotes & Invoices** - *Sharpest:* Mark-as-Paid records no payment (verified). → Delegate to the service *(10)*; Record-Payment dialog with deposits/partials *(9)*.

**Subscription & Plan Billing** - *Sharpest:* the "invisible wall" - owners fill a whole form then get bounced by a vanishing red toast with no upgrade path. → Plan-limit code + guided upgrade *(9)*; `/auth/subscription` fallback *(8)*; `usePlanLimits` meters *(8)*.

**Roles & Permissions** - *Sharpest:* consequential security decisions from a blank slate with zero on-screen meaning, dangerous powers shown identically to harmless ones. → Helper text per level *(9)*; danger flags + confirm *(8)*; role presets *(8)*.

**Notifications** - *Sharpest:* every settings toggle is silent fire-and-forget (no try/catch, no rollback). → Save feedback + rollback *(9)*; bell error/empty states *(8)*; gate SMS/Email/Push behind their integration *(8)*.

**3D Product Preview** - *Sharpest:* the only buyer-facing piece (AR viewer) is dead code imported nowhere, package not installed. → Honest admin toggle copy *(8)*; delete the dead viewer *(7)*; "preview only" trust line *(7)*; WebGL guard + init timeout so the spinner can't spin forever *(7)*.

**Cart & Checkout** - *Sharpest:* the agreed cart total silently becomes a higher number at payment (QA saw $157.65 → $208.65). → One server-computed total shared by both *(10)*; cart shows "calculated at checkout" until a method is chosen *(9)*; default to cheapest method *(8)*.

**Customer Management** - *Sharpest:* "Total Spent" sums cancelled/draft/unpaid orders (no status filter) so the headline value is wrong; plus the mass-assignment hole. → Lock down the update endpoint *(9)*; make Total Spent count only real revenue + label it *(9)*; surface B2B context on the detail page *(8)*.

**Automation Builder** - *Sharpest:* the most natural rule ("When Artwork approval is approved, email the customer") saves with a green toast and **can never fire** (`ConditionValidator` only matches `Quote`/`Invoice`). → Align options with what actually fires *(10)*; replace `[bracket]` tokens with an "Insert info" picker + plain when/then language *(9)*. *(Note: Part-1 Wave-1 already made Order a real trigger context here.)*

**Store Settings** - *Sharpest:* Currency - the most-searched setting - is un-findable from the global Settings sidebar, so it stays unset and invoices render in default USD. → Add "Store & Regional" to the sidebar deep-linking to Currency *(9)*; error+retry on both settings loads *(8)*; validate tax rate as a number *(7)*.

---

*Generated by a code-grounded multi-agent council (Part 2). The three headline bugs were verified by hand against the source. Other `file:line` citations are strong leads - confirm before fixing. Per the house rule, each bug fix needs a test that reproduces the bug before the fix passes.*
