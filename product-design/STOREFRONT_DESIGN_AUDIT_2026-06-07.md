# Storefront Design / Professionalism Audit - 2026-06-07

> Multi-agent design audit of the customer storefront (`frontstore/`, Nuxt 4 + Tailwind).
> Trigger: owner feedback - "all features work but the design looks basic / not professional."
> Method: 6 specialist agents (one per page-group + design system) + 1 synthesis pass. All 38 pages + global shell + design system reviewed.
> Benchmark feel: Myntra, Vistaprint, Moo, Shopify premium themes, Stripe-grade polish.

---

## Root cause - why it reads as "basic"

Not one bad page - all six areas scored 4–6/10 for the *same four compounding reasons*:

1. **Depth is flat.** Almost everything sits on `shadow-sm` + `border-gray-100` → the whole site looks like one flat sheet. Premium shops earn their feel through elevation hierarchy + hover-lift. Biggest single gap.
2. **Weak type hierarchy.** Headings/body/labels too close in size+weight. Labels are `text-xs font-medium text-gray-600` everywhere (they vanish); hero jumps `text-sm` → `text-7xl`.
3. **Design system broken at the consumption layer.** `storefront.css` has a *good* token system, but **53 blocks ignore it**: 257 hardcoded paddings, 92 inline `rounded-*`, 7 competing shadow conventions, raw `<button>` instead of `AppButton`. Feels like 20 designs stitched together.
4. **Arbitrary spacing.** Section padding `py-8` → `py-20`, no rhythm.

**Implication:** fix depth + type + component consistency *systemically* and every page lifts at once - no need to redesign 38 pages.

---

## Per-area scorecard

| Area | Score | Verdict |
|------|-------|---------|
| Design system (tokens/primitives) | **4/10** | Great token foundation, but blocks ignore it - root cause of everything else |
| Homepage & global shell | **5/10** | Cramped header, flat hero with no depth, arbitrary section rhythm, dense footer |
| Content/marketing & forms | **5/10** | Bare unstyled blog/CMS prose, raw-Tailwind 404/maintenance, inconsistent fields |
| Product discovery & detail | **6/10** | Good bones; fragmented hover/quick-view, mixed glassmorphism, one-off filter/sort |
| Conversion funnel (cart/checkout) | **6/10** | Complete but weak depth; order summary cramped, success page under-celebrated |
| Login & account | **6/10** | Works but minimal - flat cards, scattered inline badges, admin-style tables |

---

## Top 10 highest-impact changes (impact ÷ effort, systemic first)

1. **Extend Tailwind with `shadow-theme-*` + `rounded-card/button/input` utilities, then enforce ONE shadow/radius system.** `frontstore/nuxt.config.ts` Tailwind `extend`, then sweep `app/components/storefront/blocks/*`. Add a CI grep guard. *Biggest lever.* (hours)
   ```js
   extend: {
     boxShadow: { 'theme-sm': 'var(--theme-shadow-sm)', 'theme-md': 'var(--theme-shadow-md)', 'theme-lg': 'var(--theme-shadow-lg)' },
     borderRadius: { card: 'var(--theme-card-radius)', button: 'var(--theme-button-radius)', input: 'var(--theme-input-radius)' },
   }
   ```
2. **Real type scale + label standard.** `--text-h1/h2/body` tokens; headings `font-bold`, labels → `text-sm font-semibold text-gray-900` with styled required `*`; hero `leading-[1.1] tracking-tight`. (low)
3. **Card elevation + hover-lift everywhere.** Resting `shadow-theme-sm border border-gray-100`, interactive `hover:shadow-theme-lg hover:-translate-y-1 transition-all duration-200`; accent/active cards `shadow-theme-lg`. Make blocks use `AppCard` (currently used in 0 blocks). (medium)
4. **Install `@tailwindcss/typography` + style `.prose`.** Fixes all blog/CMS pages (`blog/[slug].vue`, `[slug].vue`). `max-width: 65ch`, heading contrast, `line-height:1.75`. (~1 hr, 80% fix from one package)
5. **Migrate blocks to `AppButton`/`AppInput`** - kill raw inline buttons. Start `FormBlock`, `DynamicFormBlock`, `ProductGridBlock`, `PageHeaderBlock`, `BestSellersBlock`. Core consistency fix. (medium, incremental)
6. **Redesign the hero** (`HeroBlock.vue`) - text-shadow, replace busy `ping`+`pulse` badge with one scale-pulse, visible bordered nav arrows, subtle gradient backdrop instead of flat `#f8f8f8`, CTA `shadow-theme-lg hover:scale-105`. (hours)
7. **One `StatusBadge.vue`** (`app/components/storefront/ui/`) driven by `statusColor` util - replaces hand-rolled status colors across `profile/index.vue`, `profile/orders/*`, `profile/quotes/*`, track-order. (~0.5 day)
8. **Upgrade checkout Order Summary + step indicators** (`CheckoutSummary.vue`, `CheckoutSectionCard.vue`, `cart.vue`) - total `text-2xl→text-3xl`, roomier padding, subtle gradient, active step `w-10→w-12` + `shadow-theme-lg`, completed steps green, animated connector. (hours)
9. **Standardize section rhythm** - all major sections `py-12 md:py-16`, consistent `px-4 md:px-6 lg:px-8`. Define `--section-spacing-*` tokens. (low, mechanical)
10. **Polish empty states + input focus states globally** - empty-state icon circles `bg-gradient-to-br from-primary-50 to-primary-100` + encouraging copy + CTA; all inputs `focus:ring-2 focus:ring-primary-500 transition-all`, darken leading icons to `text-gray-500`; migrate login/signup raw `<input>` to `BaseInput`. (low-medium)

---

## Quick wins (this week - mostly minutes each)

1. Tailwind `shadow-theme-*` + `rounded-card/button/input` utilities (#1 foundation) - 20 min.
2. `@tailwindcss/typography` + base `.prose` - 1 hr; fixes all blog/CMS.
3. Hero text-shadow + replace `ping` badge + visible nav arrows - 30 min.
4. Form labels `text-xs font-medium` → `text-sm font-semibold text-gray-900` + styled required `*` (login, profile, checkout, contact, quote).
5. `focus:ring-2 focus:ring-primary-500 transition-all` on every `BaseInput`; leading icons → `text-gray-500`.
6. Card hover-lift on product/profile-stat/contact/blog/address cards.
7. Category card lift `-translate-y-1`→`-translate-y-3`, zoom `700ms→500ms` (`ShopByCategoryBlock`).
8. CheckoutSummary padding/total bump; active step `w-10→w-12` + `shadow-theme-lg`.
9. Order-success headline → green gradient `bg-clip-text`; hero icon `w-28→w-32` + `shadow-theme-lg`.
10. Promo bar → `bg-primary-600 text-white`; section padding `py-12 md:py-16`.
11. Table row hover `hover:bg-primary-50/30` + uppercase tracked headers (profile orders/quotes).
12. Fix `BaseSelect.vue:6` hardcoded `border-gray-200` → token; replace `bg-primary/10` opacity hacks with `--theme-primary-background` token.
13. Replace one-off review "View product" `BaseButton !px-0` hack with `.theme-link`.

---

## Strategic upgrades (premium tier)

1. **Execute `DESIGN_SYSTEM_STANDARDIZATION_PLAN.md` Phases 0–2** (drafted, never started): codify "blocks must use App*/Base* primitives" in `copilot-instructions.md`, add CI grep guards, build `/pages/dev/design-system.vue` preview, migrate top 5–10 blocks. Cure for the "20 designs" problem. (~2 wks)
2. **Semantic color + type vocabulary layer** - promote `.text-secondary/.text-muted/.bg-surface-soft/.text-h1/.text-body` to first-class utilities; sweep blocks off raw `text-gray-700`/`text-sm`. (~30 hrs)
3. **Refactor Aurora theme to token-only** - strip ~4000 lines of selector overrides to ~50 lines of `:root` vars; future themes become an afternoon. (~40 hrs)
4. **Reusable component set** - `StatusBadge`, `AppCard`/`GlassCard`, `ProductCardTitle`, `FilterCountBadge`, `PriceRangeInput`, `SortBySelect`, `ReviewCard`, `EmptyState`, `PremiumTable`, `AnimatedTabs`.
5. **Product card + PDP gallery hover/state overhaul** - unify quick-view pill (→ `AppButton`), wishlist, card lift into one `.product-card-hover`; simplify gallery thumbnail state logic to a clean three-state machine.
6. **Checkout depth + micro-interaction pass** - layered shadows per section state, focus-ring animations, `active:scale-95`, success-checkmark scale-in.
7. **Skeleton parity** - every skeleton mirrors its final card aspect-ratio to kill the load-time jump; standardize on `animate-shimmer`.
8. **Mobile premium pass** - header `h-14→h-16/h-20`, bottom nav `h-16→h-20` + `font-semibold`, 44px min tap targets, `backdrop-blur bg-white/95` nav.

---

## Related finding - perceived performance (logo-click lag)

Separate from visuals but the same theme ("finish the small interactions"). Clicking the logo feels dead for a moment because `app/pages/index.vue:104-108` does a **blocking top-level `await`** (`useAsyncData('homepage-data', …, { lazy: false })` + `await Promise.all`). On client-side navigation `<NuxtPage>` won't swap pages until that fetch resolves, so the old page stays on screen with no feedback.

**Fix:** (1) make the homepage fetch `lazy: true` + render existing skeletons (`app/components/storefront/skeletons`); (2) add a global `<NuxtLoadingIndicator>` so *every* nav gives instant top-bar feedback; (3) sweep other pages (category, product, search) for the same `lazy: false` + top-level `await` pattern.

---

*Source: workflow `storefront-design-audit` (run `wf_9681fd8d-aec`), 7 agents, 2026-06-07.*
