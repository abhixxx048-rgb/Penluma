# Design Foundation Master Plan — Storefront (2026-06-15)

> **Goal:** The storefront is fast and functional but does **not look premium**. Before building the
> shopper-retention roadmap (My Designs library, reprint reminders, notification feed), we fix the
> **design foundation across all 3 themes** and make every section follow the **CMS block concept**.
> This plan is decomposed so **multiple agents can work in parallel without colliding**.
>
> Produced by a multi-agent audit (theme system · block concept · design quality · retention surfaces)
> + synthesis. Builds on `THEME_ARCHITECTURE_MIGRATION_2026-06-11.md` and the design-audit docs.

---

## Strategy — Foundation-first

Every retention surface (My Designs page, "Pick up your designs" rail, future bell/feed) is just
**another card-grid + block**. If we build them before the token/block foundation is solid, we'll
**re-fork them three times** (default/aurora/prism) and re-litigate the same ink-on-ink / padding-crush
bugs on each theme.

The audits agree: **the system already exists and is good** — 78 `--theme-*` tokens, token-driven
`.card`/`.btn--*`, `BaseButton`/`ProductCard` already migrated. The problems are:
1. **Consumption** — blocks hardcode radius/shadow/spacing/gray instead of consuming tokens.
2. **Aurora** — a 4039-line `!important` soup that is *not* token-driven and is **immune to per-store branding** (so "one color rebrands the store" is a silent lie on aurora).
3. **Stale block docs** — the CMS-block wiring SOP is wrong, so parallel agents would collide on the wrong files.

Design + blocks + retention **share the same currency**: `--theme-*` tokens + the compliant-block
contract. Once tokens carry radius/shadow/spacing/type and the block contract is corrected and guarded,
*"make design better"* and *"add a retention surface"* become the **same low-risk operation repeated** —
not bespoke per-theme craft.

### Three-theme model
- **default** = the north star (27 lines, token-values only) and the **frozen regression canary**. Never restyled — used to prove additive tokens are visually neutral.
- **Shared base** (SCSS/CSS, primitives, base block components) is built **once**; all three themes inherit it.
- **Per-theme look** is then a thin, parallel, **one-agent-per-theme** job of filling token *values* (prism polish, aurora de-soup) — never re-forking components.

---

## Waves (execution order)

| Wave | What | Workstreams (parallel within wave) | Gate to next wave |
|------|------|-----------------------------------|-------------------|
| **0 — Safety net + contracts** | De-risk everything; almost no pixels change | W0-REG, W0-TOKENS, W0-SOP, W0-SEC, W0-DEAD | Baselines captured & green; tokens additive-neutral (default pixel-stable); SOP rewritten; customer-scope leak fixed+tested |
| **1 — Shared foundation (built once)** | Lifts all 3 themes at once | W1-PRIM, W1-PROSE, W1-ADMIN | Primitives render in `/preview/primitives` across all 3 themes; base `.prose` live; admin renderer globbed, zero blank previews |
| **2 — Block sweep + per-theme look** | Token-consumption sweep + theme polish | W2-BLOCKS-A, W2-BLOCKS-B, W2-THEME-DEFAULT (then PRISM, AURORA) | All 3 themes pass visual-regression at 375/768/1440; aurora collapsed & responds to brand.css; gray-bridge retired |
| **3 — Retention Phase 1** | My Designs library + rail (serialized pair) | W3-DESIGNS-PAGE → W3-DESIGNS-RAIL | Page + rail live, token-only, secure, 3 states, mobile-clean |
| **4 — Retention Phases 2-4** | Reminders, customer notification layer, recs/credit | W4-RETENTION (re-decomposed after Wave 3) | — |

---

## Workstreams (exclusive file ownership)

### Wave 0 — all parallel, ~no pixel change
- **W0-REG** (L) — Visual-regression + a11y harness + `/preview` galleries.
  - Owns: `frontstore/app/pages/preview/primitives.vue`, `.../preview/blocks.vue`, `frontstore/tests/e2e/theme/visual-regression.spec.ts`, `.../preview-axe.spec.ts`, `frontstore/playwright.config.ts` (visual project + baselines only).
- **W0-TOKENS** (M) — Additive token expansion (type scale `--text-h1..body/label`, `--theme-section-spacing`, aspect-ratio, confirm radius/shadow). **Strictly additive**, defaults == current values.
  - Owns: `frontstore/theme-styles/base/storefront.scss`.
- **W0-SOP** (M) — Rewrite stale `CMS_BLOCK_SOP.md` to real wiring; codify 7-point compliance gate; eslint rule banning new hardcoded `bg-*-NNN`/`text-*-NNN` + visual scoped `<style>` in base blocks; extend color-budget ratchet.
  - Owns: `readme/CMS_BLOCK_SOP.md`, `frontstore/eslint config` (restricted-syntax rule only), `frontstore/scripts/check-color-budget.mjs`.
- **W0-SEC** (M) — **Security prerequisite.** Re-enable `applyContextScope` in `DesignerController::getDesigns` (~line 198) and `getDesign` (~line 231). `DesignResource` returns human name (design → product → "Untitled design", never UUID) + `updated_at`. Feature test: customer A cannot read customer B's design.
  - Owns: `app/Http/Controllers/Api/Storefront/DesignerController.php`, `app/Http/Resources/Api/Storefront/DesignResource.php`, `tests/Feature/Storefront/DesignCustomerScopeTest.php`.
- **W0-DEAD** (S) — Delete `frontstore/app/utils/brandTokens.ts` (confirm zero importers); remove unused `store_themes` color columns/resource fields; fix `StoreThemeController::reset()` 500 (calls `applyPreset('modern')` which doesn't exist).
  - Owns: `frontstore/app/utils/brandTokens.ts`, `app/Http/Controllers/Api/Store/StoreThemeController.php`, `app/Http/Resources/Api/Store/StorefrontThemeResource.php`.

### Wave 1 — shared foundation, all parallel
- **W1-PRIM** (L) — Named primitives (`AppButton`/`AppInput`/`AppSelect`/`AppTab`/`AppQtyStepper`) + new shared retention primitives (`RailShell`, `DesignCard`, `ActionMenu`, `ConfirmDialog`). All token-driven, zero per-theme hooks. Depends: W0-TOKENS, W0-REG.
  - Owns: `frontstore/app/components/storefront/ui/{AppButton,AppInput,AppSelect,AppTab,AppQtyStepper,RailShell,ActionMenu,ConfirmDialog}.vue`, `frontstore/app/components/storefront/profile/DesignCard.vue`.
- **W1-PROSE** (M) — Install `@tailwindcss/typography` scoped to `.storefront-layout`; one token-driven base `.prose`; collapse `blog/[slug].vue` fork; fix bare `[slug].vue` prose. Depends: W0-TOKENS.
  - Owns: `frontstore/package.json`, `frontstore/nuxt.config.ts`, `frontstore/app/pages/[slug].vue`, `frontstore/app/pages/blog/[slug].vue`.
- **W1-ADMIN** (L) — Convert `nuxt/.../store/BlockRenderer.vue` from 50 static imports to glob (parity w/ frontstore); backfill ~10+ missing admin previews. Depends: W0-SOP.
  - Owns: `nuxt/app/components/store/BlockRenderer.vue`, `nuxt/app/components/store/blocks/`, `nuxt/app/utils/blockPreviewSamples.ts`, `nuxt/app/components/store/BlockSampleHint.vue`.

### Wave 2 — block consumption + per-theme look
- **W2-BLOCKS-A** (L) — Commerce blocks: Hero/FeaturedProduct/ProductGrid/BestSellers/ShopByCategory/NewArrivals → tokens/primitives, shadow-theme only, section-spacing, AppButton, skeletons mirror aspect-ratio, 3 states. Depends: W1-PRIM, W1-PROSE.
- **W2-BLOCKS-B** (L) — Content blocks: Testimonial/Newsletter/FeatureList/Faq/CtaBanner/Stats/TrustBadges (+ cms util set). Disjoint file set from A. Depends: W1-PRIM, W1-PROSE.
- **W2-THEME-DEFAULT** (S) — **Not a restyle.** Frozen canary; verify pixel-stable; add token values only if a new base token needs an explicit default. Depends: W0-TOKENS.
  - Owns: `frontstore/theme-styles/default/theme.scss`.
- **W2-THEME-PRISM** (M) — Tighten prism (1046 lines / 54 `!important`) toward token-values-only; clean brand ramp from `--brand-primary`; keep 3 data-personality variants. Depends: W2-BLOCKS-A/B.
  - Owns: `frontstore/theme-styles/prism/theme.scss`, `frontstore/app/themes/prism/`.
- **W2-THEME-AURORA** (L) — **The big one.** Collapse aurora (4039 lines / 1092 `!important` / 431 `[class*=]`) toward ~30-80 token-value lines; derive palette from `--theme-color-*` via color-mix so brand.css recolors aurora; de-fork 11 component forks (keep only structural ones thin via shared composables). Every step gated by W0-REG suite. Depends: W2-BLOCKS-A/B, W0-REG.
  - Owns: `frontstore/theme-styles/aurora/theme.scss`, `frontstore/app/themes/aurora/`.

### Wave 3 — retention Phase 1 (serialized pair)
- **W3-DESIGNS-PAGE** (L, run first) — `profile/designs.vue` mirroring `wishlist.vue` grid; `DesignCard` + `ActionMenu` (Resume/Reprint/Make a copy/Delete) + `ConfirmDialog`; Recently-deleted sub-view (Restore); ProfileSidebar entry; extend `useDesignerApi` (delete/restore/duplicate + claim-on-login). Depends: W0-SEC, W1-PRIM.
  - Owns: `frontstore/app/pages/profile/designs.vue` (+`designs/`), `frontstore/app/composables/storefront/useDesignerApi.ts`, `routes/frontstore.php` (designer recently-deleted/restore/duplicate), `tests/Feature/Storefront/DesignClaimOnLoginTest.php`, `ProfileSidebar.vue`.
- **W3-DESIGNS-RAIL** (M, run second) — `PickUpDesignsBlock.vue` (modeled on RecentlyViewedBlock): customer-scoped fetch, RailShell + DesignCard, auto-hide via `emit('no-content')`, 3 states, token-only. Register as a **compliant block** (blockTypes.ts schema + admin preview + same key). Consumes `useDesignerApi` read-only. Depends: W0-SEC, W1-PRIM, W1-ADMIN, W0-SOP.
  - Owns: `frontstore/app/components/storefront/blocks/PickUpDesignsBlock.vue`, `nuxt/app/components/store/blocks/MyDesignsRailBlock.vue`.

### Wave 4 — retention Phases 2-4 (re-decompose after Wave 3)
Opt-in observed-interval reprint reminders; **new customer-recipient notification layer** (existing
Notification is admin/User-only) → customer bell + activity feed; server-side recently-viewed / recs /
store credit. Each new surface is a compliant block or account page reusing W1 primitives — no per-theme forks.

---

## Collision rules (so parallel agents never conflict)

1. **Exclusive ownership** — each workstream's `ownsFiles` is its sole edit territory for its wave. No two parallel streams in a wave share a file.
2. **Base SCSS is single-owner** — `theme-styles/base/storefront.scss` owned only by W0-TOKENS, then the design lead. Block/theme agents **consume** tokens, never edit base. New shared class = a serialized base-only commit *between* waves.
3. **Token names are a public API** — brand.css + `injectThemeHtml` SSR plugin depend on exact `--theme-*` names. No renames (deprecation cycle only). W0-TOKENS only ADDS, defaults == current.
4. **SSR plugin single-owner** — `frontstore/server/plugins/injectThemeHtml.server.ts` (brand-after-theme-before-custom order) touched by ≤1 stream at a time; high blast radius (cross-tenant brand leak).
5. **Admin BlockRenderer collision eliminated by W1-ADMIN** (glob conversion). Until it merges, block work that would touch it is blocked behind W1-ADMIN.
6. **blockTypes.ts split protocol** — hot shared file. Wave 3: only W3-DESIGNS-RAIL registers a new type. Multiple later streams → append-only edits (each appends its block object at the end, never reformat) OR split the registry into per-category modules first (recommended one-time refactor in Wave 1).
7. **Data-bound block key pairing** — a data-bound block adds its key in **both** `CmsBlockRenderer.resolvedProps` AND `StorePageService::resolveBlockDataFromModel`, in one commit by the single introducing stream (W3-DESIGNS-RAIL).
8. **ProfileSidebar.vue** edited only by W3-DESIGNS-PAGE.
9. **W3 pair serialization** — `useDesignerApi` assigned exclusively to W3-DESIGNS-PAGE; rail consumes read-only. Run page first so methods exist before the rail uses them.

---

## CMS block compliance — the 7-point gate (every new/changed section)

1. **Defined once** — registered in `blockTypes.ts` with full `settings_schema`, sensible defaults, correct category, honest `supports_data_binding`/`supports_conditions`.
2. **Admin preview exists** — `nuxt/.../store/blocks/{Type}Block.vue` resolvable (post-W1-ADMIN: auto-globbed). Empty → `blockPreviewSamples` + `StoreBlockSampleHint`, never blank.
3. **Frontstore block auto-resolves** — `frontstore/.../blocks/{Name}Block.vue` (PascalCase + `Block`, NOT `SectionXxx`), `defineProps<{settings, styles}>`, resolved by `useComponentResolver` glob — no map edit.
4. **Same-key end-to-end** — identical settings keys in schema, admin preview, frontstore block; proven by placing a value and seeing it render. Data-bound → key in both renderer + StorePageService.
5. **Theme-correct without forking** — consume `--theme-*` tokens + shared primitives. No hardcoded `bg-*-NNN`/`text-*-NNN` (eslint), no raw `shadow-lg/xl/2xl` (shadow-theme-* only), no scattered `rounded-2xl/3xl` (rounded-card/button/input). Fork = documented exception.
6. **All three states** — skeleton mirrors final aspect-ratio (no jump); empty → `emit('no-content')` collapses section padding; error contained by per-block `NuxtErrorBoundary`. Never blank/raw-error/untranslated key.
7. **Non-technical + responsive** — plain-language labels (human names from content, never UUID/"textbox"); clean at 375/768; destructive actions confirm with stated consequences via shared `ConfirmDialog`.

---

## How to run with agents

- **Fan-out:** one agent per workstream ID in the wave, each given **only** its `ownsFiles` + compliance + collision rules.
- **Worktree isolation REQUIRED** for any wave running 2+ parallel streams. Branch each worktree from the **same verified HEAD** of `store-theme-change` — **explicitly pass the base SHA and verify merge-base before merging** (per the known agent-worktree-base bug). File-exclusive ownership makes merges conflict-free by construction.
- **CI gate between every wave:** Playwright visual-regression + axe/contrast at 375/768/1440 across all 3 themes, color-budget ratchet, eslint no-hardcoded-color. A wave doesn't open until green.
- **Aurora gets the longest leash** and must run against the W0-REG suite on every commit (431 broad selectors over-match).
- **Wave 3 is NOT fanned out** — run W3-DESIGNS-PAGE to completion (owns `useDesignerApi` + ProfileSidebar), then W3-DESIGNS-RAIL.
- Recycle `dev:all` workers after any token/config change (doesn't auto-restart).

---

## Open questions for the founder (decide before/while executing)

1. **blockTypes.ts** — accept append-only edits to the 1688-line monolith, or split into per-category modules in Wave 1? *(Recommended: split, since Phases 2-4 register several blocks.)*
2. **Gray-bridge retirement** — end of Wave 2 (after all blocks consume tokens) vs a dedicated cleanup wave; add dark on-surface tokens in W0-TOKENS or a follow-up?
3. **Aurora de-fork QA** — is there a live aurora tenant to verify server-side resolution against, or do we stand one up? (The migration log's injection-simulation never verified real SSR.)
4. **Customer notification layer (Phase 3)** — confirm a customer-scoped *sibling* system (not retrofitting admin Notification); is the activity feed an account page, a CMS block, or both?
5. **My Designs delete semantics** — confirm Delete = soft-delete to Recently-Deleted, 30-day window (stated in confirm copy); who purges after 30 days (scheduled job)?
6. **Visual-regression baseline authority** — who signs off the first baselines as "correct premium"? Every later wave is gated against them, so a wrong baseline locks in a wrong look.
7. **Feature flag** — ship My Designs behind a flag until Phase 1 (claim-on-login + recently-deleted) is complete, per §0 "no half-built UI"?
