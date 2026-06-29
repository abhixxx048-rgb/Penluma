# Storefront (Customer) R&D - Make the Shopping Journey Easy to Trust & Complete

> **Date:** 2026-06-02
> **Scope:** The **customer storefront** (`frontstore/`, Nuxt 4) - the shopper-facing app at e.g. `printdesign.localhost:3001`. NOT the admin.
> **Goal:** Not new features - make our **existing** storefront features easier, clearer, and more trustworthy for our **current users: non-technical, mostly-mobile shoppers** buying printed products.
> **Method:** 25-agent R&D council (~1.3M tokens), code-grounded. Per feature: an agent read the real `frontstore/` code for shopper friction, then a customer-advocate vs conversion/support-load council debated and ranked improvements. A chair synthesized across the whole journey (land → browse → configure/price → design → cart → checkout → pay → confirm → account/reorder).
> **Plus:** a **live browser walkthrough** of the running storefront (home, search, category, cart, checkout, login, track-order) to confirm findings at runtime.

---

## Live walkthrough - what a real session showed

Walked the running store at `printdesign.localhost:3001`. **No JavaScript console errors on any page** - the storefront is stable. But two things stood out at runtime, both confirming council findings:

1. **Hardcoded promo baked into every page (confirmed live).** A black top-bar **"Diwali offer - Click me →"** shows on the home, cart, checkout, login, category and search pages of a store whose owner never set up a Diwali offer. This is the council's #1 finding (fake day-one promos/stats) seen in the wild.
2. **Cart & checkout line-item thumbnails are blank grey boxes.** On the Cart and the Checkout "Order Summary", *Vinyl Banners* and *Yard Signs* show an empty image placeholder - even though the same products show a real image on the homepage product cards. The cart line-item image binding is not resolving the product thumbnail. (New finding from the live pass; not in the council list - worth a quick fix.)

Everything else rendered correctly: search ("12 of 43", working filters), cart totals, checkout stepper ("Customer Details → Delivery & Payment", SSL badge), login (Sign In / Create Account), category pages with counts.

---

## 1. The single most important finding

**The storefront's biggest problem isn't missing features - it confidently lies, then goes silent.** The same shape recurs at every stage: the UI presents something as real and finished when it isn't, and when it actually breaks it says nothing useful. A non-technical shopper can't tell the working parts from the fake parts, so they stop trusting *all* of it.

The clearest form is the **"confirmed-then-nothing-happens" silent lie** on the highest-intent actions:

- **Request a Quote** on the product page runs a fake timer and always says "sent": `setTimeout(…1500)` then `toast.success('Quote request sent…')` with **no API call** (`frontstore/app/pages/product/[slug].vue:497-517`).
- The **`/quote` calculator's** "Request Formal Quote" / "Add to Cart" only flash success - no quote, no contact captured (`quote.vue:157-171`).
- **Category/search "Add to Cart"** is an empty TODO stub (`category/[slug].vue:820-822`).
- **Wishlist "Add to Cart"** silently navigates instead of adding (`profile/wishlist.vue:63-66`).
- **Order confirmation** declares "Order Placed Successfully!" and invents a fake order number with `Math.random().toString(36)` when payment was never verified (`order-success.vue:331-337,770-797`).
- A whole **fake `/profile-unified`** page ships live with "John Doe", invented orders, and dead buttons.

> **If you fix one thing:** make every "success" correspond to a real backend result, and never show fabricated data (prices, stats, order numbers, identities) as the shopper's own. A shopper lied to once - a failed WELCOME10 coupon, a quote that never arrives, an order number that can't be found - distrusts the whole store, including the parts that work.

---

## 2. Recurring cross-cutting patterns (fix once, help everywhere)

**A. Silent-lie / fake-success** *(blocks/stalls purchase, worst class)* - Product (fake quote), Orders/Quotes (`/quote`), Catalog/Search (Add-to-Cart TODO), Account (fake `/profile-unified`, wishlist add, Settings wiping name on save - `settings.vue:136-140`), Order confirmation (fake order #, false "paid"), Auth (forgot-password "success" even on failure - `login.vue:528-532`), Home (fake WELCOME10 + "2,847 Orders This Week" - `index.vue:367-387,443-451`), Content (fake contact email/phone).

**B. Missing loading/empty/error states → "broken store"** - Cart (no loading → false "empty cart" flash; `cart.vue:421-437` doesn't destructure the available `isLoading`/`error`), Catalog/Search (fetch failure → "No matches found"; `search.vue` has no catch), Home (CMS page 500 → "404 Page Not Found", no retry - `useStorePage.ts:100-104`), Account (addresses/wishlist/dashboard never read their `loading` refs), Orders/Quotes (detail load failure → dead "not found"), Checkout (config load failure → permanently dead payment section), B2B (approvals load failure → cheerful "Nothing waiting").

**C. Disabled/dead controls with no explanation** *(violates the no-disabled-button-without-a-reason rule)* - Product (Add/Design/Buy/Quote disabled, no tooltip - `ProductActions.vue:4,41,55,66`), Design studio (Add-to-Cart disabled, `validationErrors` filtered out of view), Checkout (Place Order blocked by empty State, blank reason - `checkout.vue:1206,1776-1783`), Auth (Sign In greys while reCAPTCHA loads, no helper).

**D. Raw technical output leaking to shoppers** - `e.message` rendered (`productInfo.ts:948`), raw SKU in quote modal, `Option ${product_option_id}` in cart (`cart.vue:95`), raw `new`/`open`/`void` statuses everywhere, `Block type "hero" is not yet supported` (`CmsBlockRenderer.vue:29-34`), "create the Our Store form in admin settings" shown to a buyer (`DynamicFormBlock.vue:243`).

**E. Surprise login wall at peak intent** - Product, Design studio, Cart, Checkout, Order confirmation ("View My Orders" dead-ends guests at login).

**F. Currency/price inconsistency** - hardcoded `$` (`search.vue:110,118`, `design-options.vue:461-464`), hardcoded `₹` (`QuickReorder.vue:167`, `/quote`), header "From $75" vs total "$77", cart tax baked into total with no tax line.

**G. Destructive actions with no real confirmation** - Clear Cart instant wipe (`cart.vue:570-578`), native `confirm()` address delete + backdrop-click discards typed address (`addresses.vue:401,83`), order cancel without stating refund/artwork consequences.

**H. Mobile-broken at 375px (the majority device)** - hero `text-8xl` overflow + 8px nav dots (`HeroBlock.vue:59-62`), header search crushed to a sliver, wishlist heart hover-only (`ProductCard.vue:36`), floating price bar covers content, order/quote tables force horizontal scroll, single-page checkout shows "Place Order" before payment seen.

---

## 3. Ranked roadmap - highest-leverage fixes to EXISTING features

### 🟥 Tier 1 - hours each, high impact (do first)

1. **Wire the Cart's unused `isLoading`/`error` refs** so a returning shopper doesn't see a false "Your cart is empty" flash and a failed load isn't mistaken for a wiped cart. `cart.vue:421-437`.
2. **Show the Tax line + add a coupon field on the Cart** - `applyCoupon`/`removeCoupon`/`taxAmount` already exist in the store (`cartStore.ts:88,452-486`), just unrendered, so the Estimated Total silently exceeds the visible rows.
3. **Make `login()`/`signup()` actually send `recaptcha_token`** - both call sites pass it; the composable drops it (`useCustomerAuth.ts:142-153`), so on reCAPTCHA-v2 stores **every login is wrongly rejected**. *(purchase blocker)*
4. **De-jargon block/form failures** - gate `CmsBlockRenderer` `resolveError` behind the dev flag; replace "create the Our Store form in admin settings" with a shopper-facing fallback. `CmsBlockRenderer.vue:29-34`, `DynamicFormBlock.vue:243`.
5. **Stop fabricating shopper data** - kill the fake order number (`order-success.vue:331-337`) and delete/auth-guard the live `/profile-unified` page.
6. **Explain every disabled CTA** (inline hint + tooltip) and stop filtering `validationErrors` out of view. `ProductActions.vue`, `design-options.vue:490-493`, `checkout.vue:1776-1783`.
7. **Replace hardcoded currency symbols** with the store's `formatPrice`/`currencySymbol`. `search.vue:110,118`, `QuickReorder.vue:167`, `design-options.vue:461-464`.
8. **Confirm destructive actions** - Clear Cart, address delete, address-modal backdrop-click. `cart.vue:570-578`, `addresses.vue:401,83`.
9. **(live finding) Fix the blank cart/checkout line-item thumbnails** - bind the real product image/thumbnail URL in the cart line item and checkout order-summary row.

### 🟧 Tier 2 - ~a day each, high impact

10. **Real error+retry states** on Catalog, Search, order/quote detail, CMS pages - and only return `null` on a *true* 404 (`useStorePage.ts:100-104`).
11. **Make Request-a-Quote real** on both paths - POST to the working backend, show "sent" only on 2xx (`[slug].vue:497-517`, `quote.vue:157-171`). *(purchase blocker)*
12. **Wire / hide the dead Add-to-Cart buttons** (category, search, wishlist) into the real cart store with feedback. *(purchase blocker)*
13. **Fix Settings name/phone wipe-on-save**; distinguish failed-fetch from empty across the account area.
14. **Translate raw statuses to plain stages** everywhere (orders, quotes, tracking, B2B) with a safe friendly default.
15. **Make the price configurator honest on failure** - never revert to "Select your size…" after configuration; show "We couldn't price this - Try again"; never render `e.message`.
16. **Surface the hidden Track-Order page** - link it from order-success, footer, account menu; give guests "Track this order" as the primary post-purchase CTA.
17. **Signal login/guest intent upfront**; keep Forgot-Password inline in the checkout modal.

### 🟨 Tier 3 - days each, plan for them

18. **Stop shipping fake promos & stats on day-one stores** - flip theme flags OFF until configured (`index.vue:367-387,443-451`, `useTheme.ts:94-96`). *(the live "Diwali offer" banner)*
19. **Never show "Order Placed Successfully!"/"paid" without backend verification** - order-lookup-by-reference, "Confirming your payment…" state, don't clear the cart (`order-success.vue:770-797`). *(purchase blocker)*
20. **Stop offering payment methods that can't complete** (Authorize.Net embedded) - validate render mode before drafting the order so no phantom order is created. *(purchase blocker)*
21. **Mobile sweep at 375px** as one coordinated pass (hero, header search, sticky buy bars, responsive tables, single-page checkout CTA).
22. **Replace fake About/FAQ/contact/blog-author/"Verified Customer" content** with tenant data or honest omission.
23. **De-bait B2B** - pre-submit "needs approval" banner, fix "Pay on account" redirect copy, approvals error state.

---

## 4. Top 3 purchase blockers to fix THIS WEEK

**🔴 1. Logins are silently rejected on reCAPTCHA-v2 stores.** The token is collected then thrown away before the request (`useCustomerAuth.ts:142-153`); the shopper ticks "I'm not a robot", hits Sign In, gets "Invalid credentials". **Fix: add the field to the payload. Effort: hours.**

**🔴 2. The primary buy/quote actions don't do anything.** Add-to-Cart from grids is an empty TODO (`category/[slug].vue:820-822`); Request-a-Quote is a fake 1.5s timer (`[slug].vue:497-517`, `quote.vue:157-171`). **Fix: wire to the real backend, or hide the affordance until wired so no dead button ships. Effort: day each.**

**🔴 3. Checkout/confirmation can charge nothing - or claim success on no payment.** A selectable card method fails *after* a draft order is created (`checkout.vue:1541-1548`); redirect gateways returning without an order id land on a green "Order Placed Successfully!" with the cart cleared and payment unverified (`order-success.vue:770-797`). **Fix: hide the un-completable method + validate render mode before drafting; render a neutral "Confirming your payment…" state when no verified order id is present. Effort: day for the method gate.**

---

*Across all 12 storefront features the through-line is one rule: the store must say only true things, show only the shopper's real data and currency, and - when it can't - say "something went wrong, try again" instead of going blank, green, or grey. Tiers 1–2 remove the bulk of abandonment and support load before any net-new feature work. Full per-feature audit data: workflow `wf_16721de6-530` output.*
