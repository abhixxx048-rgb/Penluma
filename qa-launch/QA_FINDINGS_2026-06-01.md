# QA Findings - Manual Test Pass (2026-06-01)

> First exploratory QA pass against local dev (admin :3000, storefront :3001, API :8000).
> Goal: surface bugs before real users do. Tester: automated browser walkthrough.
> Status legend: 🔴 blocker · 🟠 high · 🟡 medium · 🔵 low/polish

---

## 🔴 1. Shipping cost & total change between Cart and Checkout (same items)

**Where:** Storefront (`printdesign.localhost:3001`) → Cart → Checkout
**Steps:** Add Professional Letterhead (qty 1) + Vinyl Banners (qty 2) to cart → view cart → click Checkout.

| Page | Subtotal | Shipping | Total |
|------|---------|----------|-------|
| Cart (`/cart`) | $108.65 | **$49.00** | **$157.65** |
| Checkout (`/checkout?mode=order`) | $108.65 | **$100.00** | **$208.65** |

Subtotal is identical, but **shipping silently jumps $49 → $100** and the total rises **$51** with no explanation. This is the classic conversion-killer: the price the customer agreed to in the cart is not the price at payment.

**Why it matters:** Directly violates the price-calculator-sync rule (cart and checkout must agree). Erodes trust; will cause abandonment and chargebacks/disputes.
**Likely cause:** Shipping is calculated differently on the cart page vs the checkout page (different default method, or checkout recomputes shipping without the cart's rule). Needs investigation in the shipping/estimate logic on both surfaces.
**Fix direction:** Single source of truth for shipping - compute once (server-side) and carry the same value through cart → checkout. Add a test that asserts cart total === checkout total for the same cart.

---

## 🟠 2. Same product shows two different prices on one screen ($77 vs $75) - ✅ FIXED

**Where:** Storefront product page - Professional Letterhead.
**Detail:** Header and Estimated Total show **$77.00**; the "Recently Viewed" widget on the same page lists Professional Letterhead at **$75.00**.
**Why it matters:** Two prices for the same product on the same screen looks broken and untrustworthy. Likely a base-price vs from-price mismatch, or a stale cached price in the Recently Viewed component.
**Fix direction:** Make the listing/recently-viewed price use the same "from" price source as the product page.

**Root cause (`frontstore/app/components/product/ProductInfoPage.vue`):** the header headline bound `formatted-price="store.totalPrice > 0 ? store.formattedPrice : formatBasePrice"` while keeping the **"From"** label (`show-starting-from="hasOptions"`). Once `calculate-price` returned, the header swapped from the base price ($75) to the **configured total** ($77 = base + the default-selected Paper Stock / Print Type options) but still read "From $77" - duplicating the separate ESTIMATED TOTAL panel and contradicting the catalog listing + Recently Viewed, which both show the $75 base.
**Fix applied:** added a `headerPrice` computed - when the product has options, the header always shows `formatBasePrice` (the stable "From" starting price), so it stays $75 and matches everywhere; the live configured price keeps its own ESTIMATED TOTAL panel. Products without options (no "From" concept) still show the resolved price.
**Verified live:** header now reads "FROM $75.00", ESTIMATED TOTAL "$77.00", Recently Viewed "$75.00" - all consistent. Pure display fix; calculation logic unchanged, so no admin mirror needed.

---

## 🟠 3. API returns 429 (Too Many Requests) under normal concurrent use - ✅ FIXED

**Where:** Admin - observed on `/business-accounts/:uuid` (and a transient `500` on `/store-management/stores/:uuid`).
**Detail:** With a few tabs open, page loads intermittently failed: one rendered the full-screen **"429 Too Many Requests"** Nuxt error page; on reload it loaded fine. A store page showed a bare **"500 internal server error"** then recovered on reload.
**Why it matters:** Real usage = multiple tabs/users = concurrent requests. If the rate limiter trips this easily in single-user testing, it will trip constantly with real traffic. (Note: a second dev server was running during the test, which may have inflated load - but the limiter threshold still looks too low for normal app boot, which fires many parallel calls.)
**Fix direction:** Review the API rate-limit thresholds for authenticated admin traffic; the app's own boot/dashboard makes many parallel calls and should not self-trip. Exclude or raise limits for first-party authenticated requests.

**Root cause:** The `api` rate limiter in `AppServiceProvider` was a flat `Limit::perMinute(60)` for everyone. The admin dashboard boots ~a dozen widgets (each its own request) in parallel; with 2-3 tabs open a single admin exceeds 60/min in normal use and self-trips.
**Fix applied (`app/Providers/AppServiceProvider.php`):** split the limit - an **authenticated** user (keyed by user id) now gets **300/min**, generous enough for the app's own parallel boot; **anonymous** traffic stays at **60/min per IP** to preserve abuse protection. If 300/min still proves tight under heavy multi-tab use, raise further or move the heaviest dashboard reads behind a single batched endpoint.

---

## 🟠 4. Frontend handles API failure with infinite skeletons / raw error pages (no retry) - ✅ FIXED

**Where:** Admin - business-account detail page (when the API 429'd).
**Detail:** On the failed load, the page sat on **grey skeleton boxes forever** (never resolved to content or an error state). Separately, the store page showed a **raw "500 internal server error"** with no recovery action.
**Why it matters:** Violates the mandatory loading/empty/**error** state rule and "never surface raw technical output." A skeleton that animates forever reads as "broken"; a bare 500 gives the user nowhere to go.
**Fix direction:** Every data view needs a real error state with a **Retry** action and plain-language message. Skeletons must resolve to content or a proper empty/error state - never spin indefinitely.

**Investigation + fix:**
- *Infinite skeletons (business-account detail):* the page already had a proper loading skeleton **and** an error card with a plain-language message + "Try again" retry, with `loading=false` in `finally`. The "forever" skeleton was the **in-flight 429** (request neither resolved nor failed while rate-limited), not a missing error state - resolved by the #3 rate-limit fix.
- *Raw error / wrong empty state (store detail, `nuxt/app/pages/store-management/stores/[uuid]/index.vue`):* `fetchStore` had no error branch - on any failure (incl. 500, which the composable flattens to `{ok:false}`) it fell through to the **"Store not found"** empty state, falsely telling the owner the store doesn't exist, with only a "Back" link and no retry. Added an `errored` state + try/catch/finally and a distinct recoverable error card ("We couldn't load this store" + **Try again** + Back to stores), separate from the true not-found empty state.

---

## 🟡 5. Dashboard takes ~10s to fully load; long blank "Setting things up…" splash - ✅ RESOLVED (verify)

**Where:** Admin `/` (dashboard).
**Detail:** Full-screen "Setting things up please wait…" splash for several seconds, then dashboard widgets each show "Loading metrics… / Loading jobs… / Loading leads…" for ~10s total before resolving.
**Why it matters:** First impression of the whole product. Not broken, but slow enough to feel broken; the long blank splash is risky (looks hung).
**Fix direction:** Render the dashboard shell immediately and let widgets fill in independently (they mostly do already). Investigate why the initial splash holds so long - likely the auth/bootstrap blocking on a slow or rate-limited call (see #3).

**Re-verified live (after the #3 rate-limit fix):** the dashboard shell now renders immediately and each widget fills in independently and resolves (Overview, Invoices, Quotes, Action Center, Job Board, Web Leads, Reports, metrics) - no long blank splash observed, no widgets stuck loading, **and no duplicates** (also confirms #8). The earlier ~10s/long-splash behaviour was driven by the boot's parallel calls self-tripping the 60/min limiter and retrying; with authenticated traffic now at 300/min that contention is gone. Keep an eye on it under heavier multi-tenant load.

---

## 🔵 6. Minor: stray "Hover Hover" text in Products table

**Where:** Admin `/products` - Options column, e.g. Bookmarks row.
**Detail:** The text "Hover  Hover" appears to leak into the cell (likely a tooltip label rendering inline instead of on hover).
**Fix direction:** Check the options/variants tooltip in the products table cell.

---

## 🔴 7. Roles/Users (Team) page was completely broken - 500 + raw error leaked to UI - ✅ FIXED

**Where:** Admin → Settings → Team (`/setting/team`). Endpoint `GET /api/v1/roles`.
**Symptom:** Roles and Users both showed "0 records"; a red toast appeared with the raw text **"Class name must be a valid object or a string."** Tenant could not view or manage any roles/permissions.

**Root cause (two compounding bugs):**
1. **Config:** Sanctum registers a `sanctum` guard at runtime with `provider => null` (config/auth.php only defined web/api/customer). During a Sanctum-authenticated request, `sanctum` becomes the active default guard. Spatie's `Role::users()` morph relation (used by `withCount(['permissions','users'])` in `RolesAndPermissionsController::index`) resolves its model via `getModelForGuard(config('auth.defaults.guard'))` → `getModelForGuard('sanctum')` → **null** → `morphedByMany(null, …)` → PHP `Error`: "Class name must be a valid object or a string." (Reproduced deterministically: set default guard to `sanctum` then `Role::withCount('users')` throws; only happened over HTTP, not tinker, because tinker's default guard is `api`.)
2. **Error handling:** the controller's `catch (\Exception $e)` did not catch this - it's a PHP `\Error`, not `\Exception` - so it escaped as an unhandled 500 with the raw message instead of the intended "Failed to fetch roles."

**Fix applied:**
- `config/auth.php` - added explicit `sanctum` guard with `provider => 'users'`.
- `RolesAndPermissionsController::index` - `catch (\Exception)` → `catch (\Throwable)` so model/relation `Error`s never leak raw to the UI.

**Verified:** Team page now loads 7 roles (Admin/Designer/Sales Rep/Project Manager/Manager/…); roles endpoint returns 200.
**Follow-up to check:** any OTHER controller that does `catch (\Exception)` around model/relation resolution has the same raw-leak risk; and audit other Spatie/role queries that rely on the default guard.

---

## 🟡 8. Dashboard renders duplicate widgets - ✅ FIXED

**Where:** Admin dashboard `/`.
**Detail:** "Quotes (4)" status widget appears **twice**; "Invoices (7)" table appears **twice**; the Invoices summary block repeats. Likely a default/seeded widget-layout with duplicates, or the widget list renders dupes.
**Why it matters:** A brand-new tenant's first screen looks broken/redundant.

**Root cause:** `useDashboardLayout.mergeWithDefaults()` only scanned the left/right/bottom columns, **not** the nested `twoColumnGridWidgets`. When a user dragged the Invoice or Quote widget into the two-column grid, it left its original column; on the next layout-version merge the widget looked "missing" and was re-added to the column - so it rendered in both the grid and the column.
**Fix applied (`nuxt/app/composables/useDashboardLayout.ts`):** (1) merge now treats ids present in *any* zone (grid included) as already-placed, so nothing gets re-added; (2) added `dedupeLayout()` in `applyLayout()` - a single id can only appear in the first zone it's found in, so layouts already saved with duplicates self-heal on next load and the clean version is persisted on the next save.

---

## 🔵 9. Account Settings preview shows wrong website URL - ✅ FIXED

**Where:** Admin → Settings → Account. The customer-facing "Preview" card links the website to `http://localhost:3000/register` (the admin register page) instead of the tenant's storefront URL.

**Root cause:** The Preview card bound `:href="businessFormData.website_url"` raw. When the stored value has no scheme (a non-technical owner typing `yourbusiness.com`, or a value like `localhost:3000/register`), the browser treats it as a relative path or a bogus custom scheme - so the link resolves against the admin origin (`localhost:3000`) and goes nowhere useful.
**Fix applied (`nuxt/app/components/account/Business/Form.vue`):** added a `websiteHref` computed that prepends `https://` when the value lacks `http(s)://`, used in both the mobile and desktop preview cards (with `rel="noopener noreferrer"` since they open in a new tab). The displayed text still shows exactly what the owner typed.

---

## 🟠 10. Test suite won't run - syntax error blocks ALL PHPUnit tests - ✅ FIXED

**Where:** `tests/Feature/Storefront/CartEdgeCasesTest.php` (PHP reports line 162, but it's likely an invalid string interpolation elsewhere in the file).
**Detail:** `vendor/bin/phpunit` (full suite, or any `--filter`) aborts with "syntax error, unexpected string content" before running anything, because PHPUnit parses every test file. Net effect: **the whole test suite is currently un-runnable** via the normal entrypoint. (Individual dirs can still be run by explicit path, e.g. `phpunit tests/Feature/Auth` - which passes 14/14.)
**Why it matters:** CI/regression safety net is effectively down. Per the project's own "tests are required" rule, this should be fixed first so fixes can be verified.
**Fix direction:** Repair the syntax in CartEdgeCasesTest (look for a double-quoted string with a quoted array key like `"$arr['key']"`, a smart-quote, or an unterminated heredoc).

**Fix applied:** A stray backtick (`` ` ``) sat alone on line 129 - a PHP shell-exec string opener that was never closed, so the parser swallowed everything after it and misreported the failure at line 162. Removed it. The suite now loads **290 tests** (was 0 discoverable); CartEdgeCasesTest passes 4/4. Verified with `php -l` across all of `tests/` (all clean) and `phpunit --list-tests`.

---

## 🟢 11. Tenant isolation review - NO LEAK FOUND (verified)

**Context:** Part of the tenant-lifecycle pass - the critical security question is whether one tenant can read another's data. Triggered by noticing the admin sends `tenant_id` as a **query parameter** (e.g. `GET /api/v1/roles?...&tenant_id=<uuid>`), and that ~30 controllers filter with `->when(request()->tenant_id, fn($q) => $q->where('tenant_id', request()->tenant_id))` - i.e. they trust a client-supplied tenant id.

**Why it's still safe (defense-in-depth, all three layers present):**
1. **Tenant context is derived server-side from the authenticated user, not the request.** `app/Http/Middleware/InitializeTenancy.php` calls `tenancy()->initialize(Auth::user()->tenant_id)` - the tenant comes from the logged-in user, so it can't be spoofed via query param or host header. This middleware wraps the whole `api/v1` group (`routes/api.php:83`).
2. **`BelongsToTenant` global scope enforces it on every tenant-owned model.** Spot-checked: User, Customer, Address, Tag, Note, NoteType, Task, TaskTemplate, Category, Role all `use BelongsToTenant`. With tenancy initialized to the auth tenant, every query gets an automatic `where tenant_id = <auth tenant>`.
3. **The client-supplied `tenant_id` can only narrow, never widen.** A spoofed `?tenant_id=<other tenant>` yields `tenant_id = mine AND tenant_id = theirs` → **empty**, never another tenant's rows. Cross-tenant reads (campaign targeting in `RolesAndPermissionsController`) are explicitly gated on `is_system_admin`, with a dev comment naming exactly this attack.

**Residual notes (hygiene, not vulnerabilities):**
- The admin frontend sending `tenant_id` in query strings is unnecessary and against the CLAUDE.md convention ("never pass tenant IDs in query params"). Harmless today, but worth removing so it can't become a foot-gun.
- The `where('tenant_id', request()->tenant_id)` pattern is a **latent** risk: it's only safe because the global scope is the real guard. If a future change adds `withoutTenancy()` or runs the query outside an authenticated/tenancy-initialized context, the client value would become the sole filter. Recommend dropping the client-`tenant_id` trust from these controllers entirely and relying on the global scope.
- Product **sub-entity** models (ProductOption, OptionGroup, PricingRule, ProductSize, etc.) don't use `BelongsToTenant` - they're scoped *through* their parent product (which is tenant-scoped). Fine as long as they're always loaded via the product and never queried directly by a client-supplied id; none of the audited controllers do.

---

## 🟢 12. "0 roles / 0 stores / 0 users" - NOT an onboarding gap (investigated)

**Trigger:** During tenant testing the admin showed a tenant (Pritesh Yadav (priteshyadav444), `a1bb81a2`) with **0 roles**, **0 stores**, and **0 users** - looked like onboarding failed to seed.

**Reality - the data is all there and loads fine:**
- DB for this tenant: **7 roles** (admin/designer/sales-rep/project-manager/manager/prepress-manager/production-manager), **2 active stores** (Printdesign + B2B store; 7 more are soft-deleted), **1 user** (the owner-admin). Dashboard invoice/quote numbers (7 invoices / 4 quotes) matched this tenant exactly.
- The "0" displays were **transient**: (a) the #3 rate-limit (429) made list endpoints return empty, which the composables render as "0 records"; and (b) reading the screen before the async lists resolved. After the #3 fix, Roles shows **7** and Stores shows **All 2** live. Verified roles/users/stores queries return the right counts in tinker under this tenant, and confirmed the `/stores` endpoint resolves `tenant_id` correctly (debug-logged `count_for_tenant=2`, then removed the logging).

**Genuine secondary findings surfaced by this dig:**
1. **Non-admin roles seed with ZERO permissions (by design, but an onboarding UX gap).** `TenantOnboardingService::seedRolesAndPermissions` creates roles and permissions but **never links them** (`role_has_permissions` is empty for every role in every tenant), and `config/permission.php` defines no role→permission mapping. The `admin` role still has full access via `Gate::before(fn($u) => $u->hasRole(['system-admin','admin']) ?: null)`. But **Designer / Sales Rep / Project Manager / etc. have no permissions at all** - assign a teammate one of those roles and they can access nothing, with no on-screen hint that the owner must configure the role first. Decision needed: seed sensible per-role defaults, or add UX guidance on the Roles screen ("This role has no permissions yet - assign some so members can work").
2. **List pages conflate failure and empty, with raw empty states.** Team Users/Roles and Stores render **"0 records / You've reached the end"** both when truly empty *and* when the request fails (429/error). For a non-technical owner, "0 roles" reads as "my data is gone." Lists need the same loading/empty/error discipline as detail pages: a helpful empty state ("You haven't added team members yet - invite your team") and a distinct error+retry, never a bare "0 records" on failure.
3. **`routes/store-api.php` does not run `InitializeTenancy`.** `tenant()` is null on all store-api routes; every store-api controller compensates with the `tenant()->id ?? auth()->user()->tenant_id` fallback (consistently, so it's not currently a bug). Worth aligning with `routes/api.php` (which wraps everything in `InitializeTenancy`) so `tenant()` is reliable and the per-controller fallbacks can be dropped.

---

## 🟠 13. Orders show "Deleted customer" even though a full customer snapshot was saved - ✅ FIXED

**Where:** Admin → Orders (`nuxt/app/components/order/List.vue` customer block, lines 235–254).
**Detail:** All 28 orders for the test tenant render **"Deleted customer / - / - / -"**. The 2 customers behind those orders were soft-deleted (2026-05-31), so the live `customer` relation is null and the UI falls back to "Deleted customer". *Technically* the null-guard is working - **but** every order also carries a populated `customer_snapshot` captured at order time:
```json
{"id":6,"uuid":"…","name":"Pritesh Yadav (priteshyadav444)","email":"abhixxx048@gmail.com","phone":"1231231231","company_name":"Company Name"}
```
The order list (and the order resource) **ignore the snapshot entirely** - `customer_snapshot` is not exposed by any API Resource and not referenced anywhere in `nuxt/app`. So a print shop that removes a customer instantly loses the name, email, and phone on **every past order** from them, even though the data was deliberately snapshotted to prevent exactly that.

**Why it matters:** Orders are financial records. "Who placed this $540 order and how do I reach them?" must survive a customer being deleted. Showing "Deleted customer / -" when the snapshot has the name+email+phone is both worse UX and a fulfillment/dispute risk.
**Fix direction:** (1) expose `customer_snapshot` in the order list/detail API resource; (2) in `List.vue` (and order detail), when `row.customer` is null, fall back to `row.customer_snapshot` (name / company_name / email / phone), ideally with a subtle "(deleted)" tag - never drop to a bare "Deleted customer / -" when the snapshot exists.

### Minor order-list observations (same screen)
- 🔵 **Raw option identifiers leak** on some items: ORDER-#0023 "Custom Water Bottle" shows `Options: Option 55: 178, Option 56: 181, Option 57: 182…` - internal option/value IDs instead of human labels (other products show proper labels like "Paper Type: Glossy"). The product's options were never named; the UI should not render `Option 55: 178`.
- 🔵 **"Product Name" placeholder** - ORDER-#0001 contains an item literally named "Product Name" ($110) - seeded placeholder data leaking into a real order.
- 🔵 **Coupon code "NEW10" leaks** into the order header/timeline area (ORDER-#0008/#0009) between "Initiated" and the date.
- 🔵 **Every order is "OVERDUE"** with Due date == order date - likely a default due-date (no lead-time) issue or seed data.
- 🔵 **Placed orders labelled "ESTIMATED TOTAL"** - once an order exists the figure is the actual total, not an estimate.

---

## 🟡 14. List screens show "Loading…" and "No results" at the same time (and look empty for 3–5s) - ✅ FIXED (invoices/quotes)

**Where:** Admin list screens - confirmed on **Invoices** (`/invoices`), and the same pattern drives the transient "0 records" seen on Roles, Stores, and Orders during this pass.
**Detail:** On first navigation the Invoices table renders **"Loading…"** and **"No results"** simultaneously, and the header reads **"0 total"**, for ~3–5 seconds - then resolves to all 7 invoices (verified the API returns `200` with `data: array(7)`/`meta.total: 7` the whole time; a manual **Refresh** also fixes it instantly). So the data is never missing - the list just renders its **empty state while it is still loading**.
**Why it matters:** A store owner opening Invoices/Orders sees "No results / 0 total" and reasonably concludes they have none (or that data was lost). This is the list-screen version of the mandatory loading/empty/error rule: while loading, show **only** a skeleton/spinner - never the "No results" empty state - and only show empty once the request has resolved with zero rows. (Also: 3–5s to first paint of a 7-row list is slow; worth profiling the invoices list query/serialization.)
**Note:** This is the same root cause behind several "0 roles / 0 stores / 0 records" observations earlier in this document - they were the empty state showing before the async list resolved (compounded earlier by the #3 429). Fixing the loading/empty precedence removes a whole class of "looks broken but isn't" reports.

### Minor invoices observations
- 🔵 5 of 7 invoices show **"$0.00"** total (#0001–#0004, #0007) - likely empty drafts, but worth confirming the invoice total computes from line items rather than defaulting to 0.

---

## ✅ Flows that worked

- **Login / session** - already authenticated; dashboard reachable.
- **Dashboard data** - Invoices ($2,570 total, 4 new), Quotes (4) rendered correctly once loaded.
- **Products list** (`/products`) - 47 products, stats cards, table all correct.
- **Business account detail** - Overview / Contacts / Departments / Catalog & Pricing / Account & Credit tabs render (when not rate-limited).
- **Add to cart** - storefront, with options and quantity, fires "Item added to cart" toast and updates cart badge.
- **Cart** - line items, quantities, per-unit price, subtotal/shipping/total all math-correct (subtotal $108.65 ✓).
- **Checkout form** - clean 2-step flow; Place Order correctly disabled with a plain-language reason ("Please add a delivery address…"). *(Did not place a real order.)*

---

## Not yet tested (next pass)

Orders list & detail · Quotes create/convert · Invoices & payment recording · Customers CRUD · Designer studio · Store management CMS/blocks · Settings (templates edit - recently changed) · Mobile (375px) on all of the above · the actual Place Order → payment → order-created → print-job path.
