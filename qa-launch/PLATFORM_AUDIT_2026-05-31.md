# Platform Audit - 2026-05-31

> Findings from a cross-app review (admin `nuxt/`, storefront `frontstore/`, Laravel `app/`).
> Each item lists file:line, what's wrong, and the fix. Verified items were confirmed by hand; "needs review" items still require a check before acting.

---

## ✅ False alarms ruled out (do NOT act on these)

- **"formatMoney crashes because it's never imported"** - FALSE. Nuxt auto-imports `app/utils/`. Already-committed components use `formatMoney()` with no import line and work fine.
- **".env with secrets committed to git"** - FALSE. Only `.env.example` is tracked; the real `.env` is gitignored.

---

## 🔴 P1 - Currency flow (store-level currency not threaded through display/records)

> **STATUS 2026-05-31 - display-correct fix DONE & tested.** Backend `CurrencyHelper::settingsForStore()`/`defaultStoreId()` resolve currency from `store_settings.default_currency_id` (→ legacy `currency_symbol`/`currency` → `$`). Wired into order/invoice/quote/payment list+detail responses (`currency_symbol`/`currency_code`/`currency_decimals`, additive). Admin `formatMoney(amount, { symbol: row.currency_symbol })` threaded in the 4 lists. GTM `'INR'` replaced with `currencySettings.currency` in `[slug].vue` + `index.vue`; hardcoded USD shipping formatter + INR free-shipping promo also fixed. Test: `tests/Feature/Currency/CurrencyHelperTest.php` (5 passing).
> **Correction:** the authoritative column is `store_settings.default_currency_id`, NOT `stores.default_currency_id` (the latter doesn't exist - an early relation pointing there was caught by the test before shipping).
> **Update 4 - currency snapshot DONE & tested (P1 fully complete).** Migration `2026_06_04_000001` adds `currency_code`/`currency_symbol`/`currency_decimals` to orders/quotes/invoices (nullable). Model `creating` hooks snapshot the currency at creation (order → its store; quote/invoice → tenant primary store) on every creation path. List/detail controllers now `?? `-prefer the stored snapshot and only backfill null (old) rows from live resolution - so a document keeps its original currency even if the store later changes it. Test: `tests/Feature/Currency/CurrencySnapshotTest.php` (3 passing incl. immutability). Migration applied to dev + test DBs.
> **Update 2:** financial detail/payment pages (orders/invoices/quotes detail + payment) now thread the record's `currency_symbol`/`currency_decimals`. Added `useStoreCurrency` composable (resolves `store_settings.default_currency` → legacy → `$`, SSR-safe) and wired the store-scoped product views (`store/products/List`, `menu-management/MultiProductSelector` + `PreviewDropdown`).
> **Update 3 - admin currency display COMPLETE.** Added `GET /locations/currency/default` (`CurrencyController::tenantDefault` → `CurrencyHelper`) + `useTenantCurrency` composable (SSR-safe) for views showing tenant-level pricing. Wired ALL remaining product/job pricing callers: product-editor `tabs/General`+`Pricing` (incl. raw `$` literals), `category/ProductsList`, `store/blocks/ProductGridBlock`, `admin/product/*` (CombinationCreatorModal/Form, RangePriceEditor, CombinationPricing), `products/[uuid]/*` (combinations create/quick-create, pricing-rules), `job/details`+`job/KanbanBoard`. SaaS billing callers (`subscription`/`plans`/`billing/*`/`setting/account/*`) intentionally stay platform `$`. Typecheck clean. **Only remaining P1 item: the currency snapshot migration (history robustness).**

Store currency is correctly modeled (`store_settings.default_currency_id` → `currencies.symbol/code`), but it is not carried into admin formatting or snapshotted onto transactions.

1. **Admin shows `$` for every store regardless of currency.**
   - `nuxt/app/utils/formatMoney.ts:17` defaults `symbol` to `'$'`; none of the ~20 callers pass a symbol.
   - Callers: `nuxt/app/components/order/List.vue`, `invoice/List.vue`, `quote/List.vue`, `category/ProductsList.vue`, `store/products/List.vue`, `store/products/tabs/Pricing.vue`, `billing/GatewaySelectModal.vue`, etc.
   - Fix: thread the store currency symbol into `formatMoney(value, { symbol })` from store settings.
2. **GTM/analytics hardcodes currency.** `frontstore/app/pages/[slug].vue:276` → `currency: 'INR'`. Replace with the store's actual currency from `useThemeSettings().currencySettings`.
3. **Quote & Invoice models lack `store_id`** and there is **no currency snapshot** on orders/quotes/invoices/items.
   - `app/Models/Quote.php` / `2025_02_01_095645_create_quotes_table.php` - no `store_id`.
   - `app/Models/Invoice.php` / `2025_02_06_182911_create_invoices_table.php` - no `store_id`.
   - Fix: migration to add `store_id` + a `currency_code` snapshot column; populate from store context on creation.
4. **Two currency lookup paths can disagree.** Storefront reads `useThemeSettings().currencySettings` (correct on product page); admin reads nothing and falls back to `$`.

---

## 🟠 P2 - Flow / UX breakage

> **STATUS 2026-05-31 - DONE.** (a) Added `statusLabel()` to `nuxt/app/utils/statusColor.ts` (void→Cancelled, followup→Follow-up, Title-case fallback); used in order/quote/invoice lists instead of raw `{{ row.status }}`. (b) Added error+retry states to order/invoice/quote/payment lists (and fixed a payment-list bug where `loading` never reset on error → infinite spinner). (c) `quote.vue` UUID → "Item #N". (d) Removed the dead "Payment Methods"/"Roles" coming-soon tabs from `admin/tenants/[id]`. (e) `StripeElementsDriver` blank `<div/>` → informative "choose another method" message (matches AuthorizeNet stub). Deferred: block embedded payment render_mode at gateway config (backend). (f) Also extended the error+retry state to the remaining two silent lists - `customer/List.vue` and `email/List.vue` (email's catch also now resets `loading`, fixing the same infinite-spinner bug); verified `customers` renders clean.

- **Raw status keys shown to store owners** - `nuxt/app/components/order/List.vue:143`, `quote/List.vue:172`, `invoice/List.vue:182` render `{{ row.status }}` ("open", "draft", "void"). A human-label map already exists at `frontstore/app/pages/track-order.vue:371` - reuse it.
- **Silent error states** - list components `catch` → `console.error` only (e.g. `nuxt/app/components/order/List.vue`), so an API failure = permanent blank/loading screen. Add the mandatory error state with a Retry action.
- **UUID shown to users** - `nuxt/app/pages/quote.vue:40` prints `Configuration ID: {{ item.uuid }}`. Remove or replace with `Item #{{ index + 1 }}`.
- **"Coming soon" tabs in production** - `nuxt/app/pages/admin/tenants/[id]/index.vue:117,129` (Payment Methods, Roles). Hide or gate behind a flag.
- **Dead-end payment drivers** - `frontstore/app/components/checkout/payment-drivers/AuthorizeNetEmbeddedDriver.vue` and `StripeElementsDriver.vue` are stubs. Block embedded mode at config time so checkout never dead-ends.

Already handled well: cart/checkout empty states, payment-gateway-not-configured warning, product page skeleton/error.

---

## 🟡 P3 - Convention violations (tech debt, not crashes)

> **STATUS 2026-05-31 - safe items DONE.** Localhost fallbacks: `useStorefrontUrl`/`useDesignerLink`/`chat.ts` already DEV-gated/defaulted; fixed the last two raw `apiBase || 'http://localhost:8000'` in `useProductPreview.ts` + `inquiry/Edit.vue` to fall back only when `environment === 'DEV'` (never fabricate localhost in prod).
> **Unbounded `per_page` - deliberately NOT blind-capped.** All four (`job/KanbanBoard` 10000, `job/CalendarWidget` 10000, `inquiry/KanbanBoard` 1000, editor `/categories` 500) feed *all-items* UIs (board columns / calendar / category picker); lowering `per_page` would silently drop data - a worse violation of CLAUDE.md's "no silent caps". Proper fix is per-feature (date-range scoping, lazy columns, searchable picker) - tracked as follow-up. **Update:** backend enabler for the calendar fix is DONE + tested - `PrintJobController::index` now accepts additive `date_from`/`date_to`/`date_field` (whitelisted column, always-AND, no behavior change when absent); `tests/Feature/Job/PrintJobDateRangeTest.php` (2 passing). Frontend `CalendarWidget` adoption (datesSet → bounded range refetch) deferred - it's a fetch-lifecycle refactor (always-mount calendar + de-race the immediate watchers/isJobLoading guard) needing in-browser verification across all 4 views; see task notes.
> **$fetch-in-components (~128)** - left as tracked debt (large mechanical refactor; needs a lint rule).

- **~128 components call `$fetch`/`useFetch` directly** instead of via composables (e.g. `nuxt/app/components/customer/List.vue`, `invoice/Email.vue`, `setting/product/ShopRate.vue`). Worth a lint rule.
- **Hardcoded `http://localhost` fallbacks** - `nuxt/app/composables/useProductPreview.ts:22`, `useStorefrontUrl.ts:15`, `useDesignerLink.ts:21`, `stores/chat.ts:176`, `components/inquiry/Edit.vue:57`. Remove fallbacks; require runtime config.
- **Unbounded queries** - `per_page: 10000` (`nuxt/app/components/job/KanbanBoard.vue:489`, `job/CalendarWidget.vue:252`), `per_page: 1000` (`inquiry/KanbanBoard..vue:88`), `per_page: 500` (`store-management/.../editor.vue:1302`). Violates the no-unbounded-queries invariant.

---

## 🔵 P4 - Security (needs review before acting)

- **`request()->tenant_id` from query params** - `app/Http/Controllers/Api/Category/CategoryController.php:37`, `Api/Customer/CustomerController.php:68`, and ~25 others. **REVIEWED 2026-05-31 → mostly safe.** `InitializeTenancy` sets tenancy from `Auth::user()->tenant_id` (not the request) and every model these controllers query uses `BelongsToTenant`, so the global scope limits results to the user's tenant even when a `tenant_id` is supplied (a forged id yields an empty set). The `->when(request()->tenant_id, …)` pattern is redundant-but-safe on tenant (`api.php`) routes and the legitimate tenant picker on landlord (`admin-api.php`) routes.
  - **🔴 EXCEPTION - FIXED 2026-05-31:** `RolesAndPermissionsController::index` (route `GET /roles` in `api.php`, auth+tenant middleware only, no super-admin gate) called `withoutTenancy()` and filtered by client-supplied `tenant_ids` whenever `request()->type === 'campaign'` - a client-controlled flag. Any tenant user could read other tenants' roles + tenant names via `?type=campaign&tenant_ids=1,2,3` (cross-tenant IDOR + tenant enumeration). Fix: gated the cross-tenant branch on `$isSuperAdmin` (was only used to hide the `admin` role label); non-admins now fall to the tenant-scoped branch. **Tested:** `tests/Feature/Security/AccessControlTest.php` (MTS-02) - a non-admin gets an empty result, a system admin still sees cross-tenant roles; the negative test was confirmed to FAIL against the pre-fix code (leaked the other tenant's role + tenant name).
  - **Note (not fixed, likely intentional):** `JobStatusController`/`OrderStatusController` use `withoutGlobalScopes()` on status reference tables (no client `tenant_id`); low-sensitivity config data, probably shared-by-design - confirm intent.
- **Google Maps key injected client-side at build time** - `nuxt.config.ts:43`. Normal for the Maps JS API *only if* the key is HTTP-referrer-restricted in Google Cloud. Confirm the restriction exists.

Clean: DOMPurify on all `v-html`, httpOnly+secure+sameSite cookies for auth tokens, security headers on routes, PII excluded from checkout sessionStorage.

---

## Suggested order of attack

1. P1 currency: (a) thread store symbol into `formatMoney` callers, (b) fix hardcoded `'INR'` GTM tag, (c) migration for `store_id` + `currency_code` snapshot on quotes/invoices.
2. P4 tenant_id route-group check (high-stakes, quick).
3. P2 status labels + error states (high user impact, low effort).
4. P3 cleanups as ongoing tech debt.
