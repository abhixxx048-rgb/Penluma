# Frontstore Design R&D - 2026-06-02

> Design-only council on the customer storefront (`frontstore/`, Nuxt 4, `printdesign.localhost:3001`).
> 10 agents (~780k tok, workflow `wf_f62d081a-cdc`) each critiqued one surface for **visual quality** -
> hierarchy, spacing, typography, color/contrast, consistency, mobile, motion, conversion, state-polish.
> **Scope = look & feel only.** Functional fake-success/dead-button bugs are owned by
> [`FRONTSTORE_FEATURE_RD_2026-06-02.md`]. Cross-checked against a live browser pass at 1440px + 390px.

## Headline
The storefront has a **capable theme-token system and several genuinely premium surfaces** (post-purchase
pages, cart/checkout bones, the product card, the form primitives) - but it reads as **several designers'
work stitched together** because the most-shipped components **bypass the tokens** and the **same UI exists
in 2–4 drifted copies**, and the cheaper copy is usually the one that renders.

## Cross-cutting themes (fix these → many pages improve at once)
1. **Hardcoded Tailwind grays/colors bypass the token system** → themed/branded/dark stores render half-styled.
   `BaseButton` (352 usages) leaks `bg-gray-100/border-gray-300/bg-red-600`; `FeaturedProductBlock`/`TestimonialBlock`/
   footer/login/order-success all hardcode gray. **Single highest-leverage fix.**
2. **Radius free-for-all** - `rounded-xl/2xl/3xl/full/theme` coexist, often in one component → on a sharp or pill
   theme, cards and buttons disagree and the page looks "half-themed and broken."
3. **Duplicated-but-divergent components** - 4 footers, 3 headers, 2 MiniCart/LiveSearch generations, 3 skeleton
   systems, 3 star ratings, 2 badge systems. Each fork has a polished and a cheap side; the cheap side often ships.
4. **Micro-typography floor too low** - `text-[8px]/[9px]/[10px]` and `text-gray-400` body (≈2.8:1, below WCAG AA)
   pervade cart/orders/footer/badges → "cheap template" + illegible on the mobile-first audience.
5. **Hover-only affordances + hardcoded fake/demo content** - gallery arrows/Quick View/wishlist/address edit gated
   behind `group-hover` (invisible on touch); homepage ships a fabricated Black Friday promo, `10,000+/2,847` stats,
   `WELCOME10` coupon, fixed `2026-12-31` countdown; MegaMenu ships emoji "Special Offer" + fake `1-800-PRINT`.

## Live browser pass confirmed (printdesign.localhost:3001)
- **Mobile hero = black void.** Hero is a raster JPG (with a literal `https://printdesign.app/` baked into the art);
  `object-contain` + dark overlay letterboxes on desktop and renders an **empty black box at 390px**. (Theme 5 + HeroBlock finding.)
- **Three overlapping, starved product rails** - *Featured Products* shows **one lonely card** in a white void;
  *New Additions* is **six "No Image Available"** placeholders; redundant with *Most Popular*.
- **Off-brand promo bar** - "Diwali offer - *Click me →*" in default underlined link-blue on black.
- **Trust-eroding seeded stats** - "On-time Delivery 25%", "4 out of 5", "2,847 Orders This Week."
- **Flat product cards** in the live grids (markup says the card *can* hover-lift; the rails/skeletons undercut it).

## Tier 1 - high impact, low effort (do first)
1. **Tokenize `BaseButton`** non-primary variants (neutral/outline/ghost/danger + hover tints) → theme vars; drop per-variant `active:scale-95`. `base/BaseButton.vue:101-114`. *One file fixes 352 buttons.*
2. **Collapse 3 skeletons → 1** tokenized `BaseSkeleton` (shimmer); `AppSkeleton`/`BaseImage` inline/`HeroSkeleton` render it. *One loading language.*
3. **Gate homepage fake promo/stats/coupon/countdown behind real store settings**; trust-badge copy from store policy. `pages/index.vue:269`. *Removes the most embarrassing content.*
4. **Replace raw gray-* with tokens** in `FeaturedProductBlock`/`TestimonialBlock`. *Two product sections stop looking like different products.*
5. **`FeaturedProductBlock` → shared `SectionHeader`** (badge + accent line). *Fastest homepage cohesion win.*
6. **Listing/search skeletons** - category page → `ProductGridSkeleton`; search skeleton `aspect-[4/3]`→`aspect-square` (kills CLS). `category/[slug].vue:111`, `search.vue:176`.
7. **Unify product badges on `AppBadge`**; drop rainbow `ProductBadges` + `animate-pulse "Hot"`; show discount once. `ProductBadges.vue:71`, `shared/ProductCard.vue:93`.
8. **Fix hardcoded `$`** - thread `currencySymbol` into aurora MiniCart + LiveSearch + search price filter. `MiniCart.vue:11`, `search.vue:110`.
9. **Gut MegaMenu demo content** (emoji banner, `1-800-PRINT`, repeated slugs, fake checkmarks) or delete if `DynamicMenu` covers it. `MegaMenu.vue:233`.
10. **aurora LiveSearch** - add no-results empty state + content-shaped skeleton (copy `shared/LiveSearch.vue`). `aurora/.../LiveSearch.vue:31`.
11. **Stop raw `{{ order.status }}`** on order detail - reuse `statusLabel()/statusDot()`; one shared `statusColor.ts` badge everywhere. `profile/orders/[id].vue:23`.
12. **Raise micro-type floor** - kill `text-[8px/9px/10px]` body → ≥`text-xs`; `text-gray-400` readable copy → `gray-500/600` (AA). `cart.vue:64`, `orders/index.vue:51,110`, `AppBadge.vue:36`.
+ **Hero fit** - default full-bleed heroes to `object-cover center` (fix the mobile black-void/desktop letterbox). `HeroBlock.vue:26`.

## Global token / primitive changes (lift the whole store at once)
- Expose `text-theme-muted/subtle` + add `--theme-skeleton` + `--theme-color-surface-soft`; one find-replace moves `gray-400/500`, `bg-gray-50`, `slate-200` skeletons onto tokens (color correctness + AA).
- Tokenize all `BaseButton` variants; single `.theme-button-base:active` press.
- One `Skeleton` primitive; one shimmer color/tempo.
- Radius contract: cards=`rounded-theme-card`, inputs/chips=one nested token, pills=`rounded-full`.
- Type floor 12px (10px only for bold uppercase eyebrows); one price scale (tabular-nums, drop `font-serif`); one `AppBadge` font scale; one `statusColor.ts`.
- Collapse accent palette to primary + 1 success + 1 warning + 1 danger + neutral.

## SHIPPED (2026-06-02, uncommitted, browser-verified, nothing broken)
Wave 1 - homepage professionalism + one global consistency lever:
1. **Disabled 3 fabricated demo blocks** at the source (`pages/index.vue`): promo_banner ("Black Friday 25% Off" + fixed countdown), stats ("10,000+ / 2,847 Orders This Week"), cta_banner ("WELCOME10"). They were hardcoded literals shown regardless of the admin toggle - fake metrics/offers undermine a real store. `is_active: false` + comments to re-enable once wired to real data. (Flag-default change in `useTheme.ts` was reverted - flags are shared, content was the real problem.)
2. **`FeaturedProductBlock` → shared `SectionHeader`** (eyebrow badge "● FEATURED" + accent line) so it matches the Most Popular / New Additions rails instead of a hand-rolled `<h2>`. Added `badge: "Featured"` in index.vue.
3. **Few-items no-void layout** in `FeaturedProductBlock`: rails with fewer products than a full row render left-aligned at natural card width (was 1 tiny card stranded in a 6-col void).
4. **Promo bar link → pill button** (`PromotionalBar.vue` topbar): "CLICK ME →" is now a compact uppercase pill matching the floating/bottom/inline bar CTAs, not raw underlined link-blue text.
5. **Type floor (global, one place)**: `storefront.css` lifts all sub-11px text (`text-[7/8/9/10px]`) to an 11px minimum - kills "cheap micro-text" across every page in a single scoped rule. Verified cart/footer/cards/reviews unaffected.
6. **Hidden 0% review metrics** (`CustomerReviewsShowcaseBlock.vue`): empty "On-time Delivery 0%" bars filtered out; whole block hides when no real data.

Wave 2 - cross-page correctness/consistency:
7. **Currency symbol** now from store settings (was hardcoded `$`): aurora `MiniCart.vue` (3×, via `formatPrice`), aurora `LiveSearch.vue` (via `formatPrice`), `search.vue` price-range filter (via `currencySettings.symbol`). Correctness for non-USD stores.
8. **Humanized order status** - new shared `app/utils/orderStatus.ts` (`orderStatusLabel`) used in `profile/orders/[id].vue` + `profile/orders/index.vue` (list + modal). Customers see "In Progress" not raw "open"; same label everywhere. Mirrors track-order's map + title-cases unknowns.

Wave 3 - IMPACTFUL premium-minimal homepage redesign (user picked: Homepage first impression + Premium-minimal vibe):
9. **Shop-by-Category tiles redesigned** (`ShopByCategoryBlock.vue`) - dropped the heavy dark gradient + white-text-over-image; now clean photo frames with a subtle ring, slow 700ms zoom + gentle −1 lift on hover, and the **label below the image** in refined dark type ("Business Stationery / 5 items"). Bigger quiet heading (title-size sm→md), more whitespace (py + gaps up). Browser-verified: real photos load, hover works, zero console errors.
10. **Product card refined premium-minimal** (`ProductCard.vue`) - border gray-200→gray-100 (airier); removed the loud orange inline "−X%" (badge + strikethrough already convey discount). Card keeps its own token radius/shadow/−3px hover lift.
11. **Removed double-framing** in `FeaturedProductBlock.vue` - each card was wrapped in a *second* card (bg-white rounded-xl border hover:shadow); now the ProductCard supplies its own frame and breathes. Gaps bumped to gap-5/6.
Verified clean on home + category (zero console errors).

**HMR note:** editing `index.vue` (destructure removal + ref changes together) caused a *transient* `showPromoBanner is not defined` during dev hot-reload churn. Source is clean (grep-verified) and the homepage renders fully on a clean reload - not a real bug. When removing a destructured name, the same-file refs must be gone too (they are).

**Deferred (flagged, NOT changed):** hero `object-fit` - the store's banner has **text baked into the raster image**, so the council's "use object-cover" would crop it on mobile. The mobile black-void is really a content problem (desktop-only banner + dark overlay over letterbox bars). Needs a content fix (proper mobile banner / HTML-text hero), not a blind code change.

**Still queued:** radius consistency sweep; currency-symbol hardcoding (search/MiniCart/LiveSearch); raw order-status labels; aurora LiveSearch empty state; MegaMenu demo content; per-page polish on product-detail / category / checkout.

## Already good - DO NOT regress
- Form primitives (`BaseButton/Input/Select/Textarea`) are genuinely token-driven with a real focus-ring system.
- The **product card** itself (token radii/shadow, -3px hover lift, glass Quick View, composed price row).
- **Post-purchase** (`order-success`, `track-order`) - status state machines, gradient orbs, steppers, timelines. **This is the visual target for the rest of the funnel.**
- **Cart/checkout bones** - sticky summary, free-ship progress bar, mobile action bar + safe-area, "why disabled" microcopy.
- Standardize ON the newer shared parts: `SectionHeader`, `shared/LiveSearch`, `ProductGridSkeleton`, `AppBadge`, `CheckoutSectionCard`, `statusColor.ts` - route everything through these, don't rebuild.
