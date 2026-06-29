# Admin (nuxt/ :3000) - Full Page QA Coverage - 2026-06-06

Goal: reach **every** admin page, enter/submit data where applicable, watch console + Laravel logs,
and fix anything broken or sub-par along the way. Status legend:

- ⬜ not yet visited
- ✅ visited, no errors
- ⚠️ visited, minor issue (noted)
- 🔴 visited, broken / error (noted)

Dynamic routes (`[id]`, `[uuid]`, `[slug]`) are tested by visiting one real record reachable from
the corresponding list page.

## Fixes applied this session
- ✅ `config/logging.php` - added missing `audit` channel (was throwing EMERGENCY on every
  email-campaign / newsletter / segment write).
- ✅ `chat.ts` socket failure no longer bubbles to the global Vue error handler -
  `FloatingChat.vue` + `Panel.vue` now catch a failed `initSocketConnection()` and degrade gracefully.
- ✅ **Broken order-item images (Orders list + detail)** - designer order items stored a
  *double-encoded* JSON blob in `items.image_url` (`{"image":"{...inner json...}"}`), so the
  `image_url_thumbnail_url` accessor produced `s3.com/<url-encoded-json>` → 404. Fixed
  `FileHelper::parseImagePaths()` to unwrap a nested JSON path value (`flattenImagePath`,
  prefers thumbnail→image→first page); fixed `orders/[id].vue` to use the accessor instead of
  binding raw `item.image_url` into `<img src>`. Verified: thumbnails now render. NOTE: the
  write-path that double-encodes the value (designer→order item) should also be fixed so new
  data is clean - the read-side fix is defensive and covers existing + future bad rows.

- ✅ **`fetchChatList` crashed on a null socket** - after the connect-fix above, the chat launcher
  still threw `Cannot read properties of null (reading 'emit')` from its `mounted` hook on *every*
  admin page when the chat server is offline, polluting the global Vue error handler. Added a
  guard in `chat.ts#fetchChatList` to no-op when the socket isn't connected. Verified: the
  page-wide Vue error is gone.
- ✅ **`/transactions` rendered a blank page** - the route was a leftover stub (`<template>Transactions</template>`),
  not linked in the nav, with no loading/empty/error state (violates "no half-built UI"). Since
  payment transactions live on the Accounting page, the orphan route now redirects to `/accounting`.

## Findings (not yet fixed - minor / data, low priority)
- ⚠️ Dashboard **Quotes** widget shows "⏳ Expired" with an hourglass emoji while every other
  status (and the Invoices widget) uses a colored dot only - inconsistent label decoration. The
  emoji comes from backend status label data, not an obvious frontend constant.
- ⚠️ **Web Leads**: the one seeded lead's Message column reads "Phone is required." - looks like a
  form-validation string was saved as the message (likely stale test data; worth checking the public
  inquiry form doesn't persist validation text as the message body).
- ⚠️ **AI Usage**: "Total Requests 90" but Successful 20 / No-Match 0 / Errors 0 - ~70 requests fall
  into none of the displayed buckets (status classification gap in the summary cards).

## End-to-end FLOWS exercised (data entered + submitted) - all ✅, 0 backend errors
- **Create customer** → "QA Test Co" saved, redirected to detail page.
- **Add newsletter subscriber** → `qa.newsletter@example.com` saved; **audit.log** entry written
  (validates the audit-channel fix through the real controller, who/what/when captured).
- **Create category** → "QA Test Category" saved, appears active in list (7→8).
- **Create quote + add line item** → QUOTE-#0005 created and correctly linked to "QA Test Co"
  (the customer created above); A4 Poster line item auto-priced at $69.00, saved.
- **Order status change** → ORDER-#0035 Draft → Open; persisted, logged in the order Activity
  timeline; customer-email + team notifications toggled off so no external mail was sent.
- **Create email campaign** → "QA Flow Campaign 2" through the 3-step wizard (Audience → Content),
  saved as Draft (not sent); **audit.log** entry written.

Confirmed: customer→quote linkage and product→line-item auto-pricing work; status transitions
persist and are logged; audit logging works end-to-end. `grep -c ERROR|EMERGENCY laravel.log` = **0**
across the entire session.

## Storefront complex flow + pricing methods (:3001) - 2026-06-06

### Pricing methods - all verified on real PDPs
- **fixed** (Premium Business Cards) - ✅ base $35 + options → **$50.00**, breakdown correct.
- **area_based** (Custom Flyers) - ✅ computes **$100.00**, Add to Cart enabled.
- **quantity_based** (Professional Letterhead) - ✅ $77 @ qty1 → **$385 @ qty5** ("$77.00 each" shown); scales.
- **percentage** (Vinyl Banners) - ✅ computes **$28.15**.
- **formula** (Custom Booklets) - ✅ correctly shows **$0.00 + "We couldn't calculate a price…
  request a quote"**, Add to Cart **disabled**, Request-a-Quote offered. (Deeper fix - PDP collecting
  the formula's page-count input - still open; the guard is correct UX.)

### Full purchase flow: storefront → admin order - COMPLETED
Guest checkout (Premium Business Cards $50) → placed **ORD-#0036** via Cheque → **appears in admin**
with correct customer (QA Storefront Buyer), line item, options (Glossy / 20lb Bond), and gateway.

### 🔴 Confirmed bug - shipping cost dropped on order creation (revenue loss)
Storefront cart/checkout charged **$100 shipping (total $150)** and the success page said $150, but the
**admin order Grand Total is $50** and its Shipping section shows **Cost $0.00 / Method "-"**.
- Root cause: `app/Services/Storefront/Checkout/CheckoutPricingService.php` has **no shipping handling
  at all** - order totals are built without shipping. The cart shows shipping via a *different* service
  (`StorefrontCartService`). The checkout payload sends only the `shipping_method` key
  (`checkout.vue:1468`); the order-pricing service never resolves it to a cost.
- Impact: customers are shown/agree to a total that the placed order doesn't reflect; shop is undercharged.
- Fix needs backend work in CheckoutPricingService to resolve the selected shipping method → cost and
  add it to the order total + persist `shipping_cost`. **Requires a test** (pricing/checkout rule) - left
  for a focused PR rather than a blind end-of-session patch. (Matches the known cart↔checkout mismatch.)

### ✅ FIXED - order total now includes shipping + subtracts coupon discount
The bug below is now fixed (pre-launch system, so correcting the canonical total is appropriate):
- `Order::getTotalAmountAttribute()` now returns `lineItems+itemTax + shipping_cost − Σcoupon.discount_amount`
  (rounded). Uses the loaded `coupons` relation when present (eager-loaded by the order list/detail
  queries) to avoid N+1.
- `CheckoutPricingService::resolveOrderGrandTotal()` now delegates to `Order::total_amount` (single
  source of truth).
- `StorefrontCheckoutController` now **persists `shipping_cost`** on the order, resolving the selected
  `flat_rate_{uuid}` method via `ShippingRate::effectiveCharge(subtotal)` (same calc the cart uses);
  carrier/other methods resolve to 0 (documented limitation).
- Tests: `tests/Unit/Orders/OrderTotalTest.php` (4 cases: items+tax, +shipping, +coupon, unit-price
  fallback) - all green. Re-ran orders/pricing/checkout suites (58 tests) - all pass. Impact assessment:
  **0 existing orders had shipping_cost set** and only **2 dev orders have coupons** (their totals are
  now correctly reduced). Effect: new storefront orders charge the shipping the customer saw, and
  redeemed coupons actually reduce the total (payment amount, B2B credit and invoices all read this
  accessor, so they're now consistent).
- NOTE: a pre-existing, unrelated test error exists in
  `tests/Feature/Accounting/InvoicePaymentsInAccountingTest.php:119` (inserts a Payment with a numeric
  `paymentable_id` into a uuid column) - fails on clean `main` too; not caused by this change.

### (original finding, for context) order total ignored shipping AND coupon discount
Root-caused the shipping drop above to a single structural gap that ALSO affects coupons:
- `Order::getTotalAmountAttribute()` (app/Models/Order.php:264) and
  `CheckoutPricingService::resolveOrderGrandTotal()` both compute the order total as
  **`sum(line_amount + item.tax)` only** - no shipping, no discount.
- `StorefrontCheckoutController` `Order::create` (line ~453) never persists a `shipping_cost`,
  and although a coupon is *recorded* via `couponService->redeem()` (line ~504), the discount is
  **never subtracted** from the order total.
- Net effect for storefront orders: **shipping is dropped (undercharge)** and a **redeemed coupon
  shows the full, undiscounted total** (customer expected a discount; the order/admin shows full price).
  Same "recorded-but-not-applied" class as the known markup-dropped bug.
- Fix = a focused backend PR (persist shipping_cost on order; make the total accessor add shipping and
  subtract coupon discount) **with tests** - high blast radius (every order/invoice/accounting view),
  so deliberately not patched blind here. Coupon E2E was verified at the code level after the live
  storefront session got flaky (stray designer/variant tabs); the structural gap is unambiguous.

### ✅ Fixed this session - $0/price-unavailable item could be checked out
The PDP blocks adding a $0 formula product, but a stale/zero-priced line already in the cart flowed all
the way into checkout (cart had a $0 Custom Booklets → Subtotal $0 + $100 shipping = checkout-able).
Extended `checkout.vue#blockingCartIssues` to flag any line where both `total_price` and `unit_price`
are ≤ 0, mirroring the PDP guard. **Verified:** checkout now shows "We couldn't calculate a price for
Custom Booklets. Please request a quote for it or remove it to continue." with Place Order disabled;
removing the item re-enables checkout (no over-blocking).

### ⚠️ Other storefront findings (not fixed)
- **Default payment method = "Authorize.Net" which shows "inline checkout is not yet available."** A
  non-working gateway is the default; should default to an enabled one (Cheque/Stripe). It does guide
  the user to pick another, so not silently broken - but a poor default.
- **Offline (Cheque) order success page over-claims "Payment Successful / Paid"** while the admin
  correctly shows the payment as **"Initiated"** (cheque not actually received). The customer-facing
  success copy should say "Order placed - payment pending" for offline methods.
- **Cart remove** updates the count/subtotal immediately but the removed line card lingers until reload
  (minor reactive-list refresh lag).

## Pages reached & verified this session (all ✅ unless noted)
Dashboard · Action Center · Customers (list/new/view) · Quotes · Invoices · Orders (list/detail) ·
Products · Categories · Master Options · Size Guides · Imposition (Job Watch) · Jobs (board) ·
Proofs · Email Campaigns · Newsletter Subscribers · Marketing Segments · Web Leads · AI Usage ·
Store Management (+ store overview, Pages & CMS, page-builder editor) · Accounting · Business Accounts ·
Settings (Account, Payment Gateway, Team/Users/Roles) · Transactions (now redirects).
Skipped per request: Chat module.

## Dashboard & top-level
- ⬜ `/` Dashboard
- ⬜ `/action-center/`
- ⬜ `/chat/`
- ⬜ `/tasks/`  ⬜ `/tasks/[id]`
- ⬜ `/transactions/`
- ⬜ `/web-leads/`  ⬜ `/web-leads/[id]`

## Customers
- ⬜ `/customers/`  ⬜ `/customers/new/`  ⬜ `/customers/view/[id]`  ⬜ `/customers/import`
- ⬜ `/business-accounts/`  ⬜ `/business-accounts/approvals`  ⬜ `/business-accounts/[id]`

## Sales: Quotes / Invoices / Orders / Proofs / Jobs
- ⬜ `/quotes/`  ⬜ `/quotes/[id]`  ⬜ `/quote`
- ⬜ `/invoices/`  ⬜ `/invoices/[id]`
- ⬜ `/orders/`  ⬜ `/orders/[id]`
- ⬜ `/proofs/`  ⬜ `/proofs/[id]`
- ⬜ `/jobs/`  ⬜ `/jobs/new`  ⬜ `/jobs/[id]`

## Catalog: Products / Categories / Options / Sizes
- ⬜ `/products/`  ⬜ `/products/create`  ⬜ `/products/[uuid]/edit`
- ⬜ `/products/[uuid]/options/`  ⬜ `/products/[uuid]/pricing-rules/`  ⬜ `/products/[uuid]/sizes/`
- ⬜ `/categories/`  ⬜ `/categories/create`  ⬜ `/categories/[uuid]`
- ⬜ `/subcategory/`  ⬜ `/subcategory/create`
- ⬜ `/master-options/`  ⬜ `/master-options/create`
- ⬜ `/size-guides/`  ⬜ `/size-guides/create`

## Production / Imposition
- ⬜ `/imposition/`  ⬜ `/imposition/presses/`  ⬜ `/imposition/press-sheets/`
- ⬜ `/imposition/templates/`  ⬜ `/imposition/gang/new`

## Marketing
- ⬜ `/email-campaigns/`  ⬜ `/email-campaigns/new`  ⬜ `/email-campaigns/[id]`
- ⬜ `/campaign/`  ⬜ `/campaign/new`
- ⬜ `/marketing/segments/`
- ⬜ `/newsletter-subscribers/`

## AI
- ⬜ `/ai/product-builder`  ⬜ `/ai/usage`  ⬜ `/ai/preflight`

## Store management
- ⬜ `/store-management/stores/`  ⬜ `/store-management/stores/create`  ⬜ `/store-management/stores/[uuid]/`
- ⬜ stores/[uuid]/ sub-pages: banners, blog, coupons, faqs, footer, forms, menus, pages,
  promo-bars, reviews, seo, shipping, testimonials, theme, settings, analytics, regional, designer, newsletter

## Accounting
- ⬜ `/accounting/`
- ⬜ `/secret/.../expense/`

## Settings
- ⬜ `/setting/` + account, ai-usage, automation, billing, categories, console, designer,
  emails, inquiry, integrations, log, notifications, payment-gateway, security, Team (Users/Roles),
  templates, third-party-services, workflows

## Account
- ⬜ `/account/general`  ⬜ `/account/devices`
