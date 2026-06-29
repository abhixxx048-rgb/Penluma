# Onboarding & first-run readiness for a brand-new store owner

_Launch-readiness assessment — 2026-06-15 · Audience: founder + engineers · Reviewer perspective: senior QA consultant_

## Verdict

**Not launch-ready for a self-serve, non-technical store owner.** The guided-setup scaffolding exists and is thoughtfully built — there is a real "Get your store ready" checklist (`useSetupChecklist.ts`), demo-catalog seeding, and proper empty states with CTAs on list pages. But the **first 10 minutes of a brand-new owner's life on the platform are unguided and have two silent-lie traps in the launch-critical path** (payment + shipping completion checks pass on existence-of-record, not on working-config). Combined, these mean an owner can see an all-green checklist and a "ready" store, then have **checkout fail in front of their first real customer**. There is also no automatic first store on registration and no post-creation wizard, so the very first screen a new tenant sees is an empty store list rather than a "let's get started" flow.

Priorities for launch: fix the two checkout-path silent lies (P0), close the unguided first-run gap (auto-create first store + post-creation wizard), and harden the checklist's auto-expiry so it can't hide an incomplete setup.

## Findings

| Severity | Finding | Where | Type | Confidence | Recommendation (short) |
|----------|---------|-------|------|-----------|------------------------|
| High | Payment-gateway step marks complete on flags only, never tests credentials — green check while checkout can still fail | `useSetupChecklist.ts:247-259` | silent-lie | Confirmed in code | Add "Test Connection"; complete only on a successful test, or show "configured but not tested" |
| High | Shipping step completes on `data.length > 0` — no check that a rate is active/valid | `useSetupChecklist.ts:274-285` | silent-lie | Confirmed in code | Require ≥1 active rate with a real charge / delivery promise |
| High | Checklist auto-hides on day 31 regardless of completion — can leave a store stranded mid-setup | `useSetupChecklist.ts:135-150` (`EXPIRE_DAYS=30`, line 11) | onboarding-gap | Confirmed in code | Don't expire while launch-critical steps are incomplete; or drop expiry |
| High | No contextual "what is a store / this is your first login" help on the empty store list | `store-management/stores/index.vue`; primitive at `store/Select.vue:13` | onboarding-gap | Confirmed in code | Add explanatory first-run empty state + "Create Your First Store" CTA |
| Low | No automatic first-store creation on new-tenant registration — first screen is an empty list | ABSENT (confirmed not in codebase) | onboarding-gap | Confirmed in code | Auto-create a store + seed demo data on tenant create |
| Medium | No post-creation setup wizard — owner must self-navigate to each settings page | `store-management/stores/create.vue` | feedback-gap | Likely | Add a 5-minute post-create wizard (logo → product → payment → shipping → preview) |
| Medium | Checklist step links lack plain-language help for non-technical owners (API key? which gateways?) | `useSetupChecklist.ts:67, 89` | support-gap | Confirmed in code | Add "Learn more" inline help per step |
| Medium | "Preview storefront" completion is localStorage-only — resets if browser data cleared | `useSetupChecklist.ts:95-109, 211-216, 287-292` | field-drop | Confirmed in code | Record server-side, or warn that it's local-only (it is optional) |
| Medium | Demo-products banner doesn't say deletion is permanent or that items are examples | `products/index.vue:26-59` | feedback-gap | Confirmed in code | Clarify "examples", call out irreversibility in the banner |
| Medium | Dashboard widgets load independently with no visible error/timeout fallback shown in template | `index.vue:54-62` | missing-loading-empty | Likely | Audit each widget for error + timeout end states |
| Low | Same demo catalog seeded to every store; multi-store tenants see duplicate sample products | `StoreOnboardingService.php:809-867` | feedback-gap | Likely | Document tenant-global product / per-store pivot model; show store scope in UI |

## Detail — the launch-critical items

### 1. The two checkout-path silent lies (P0 — fix before any real customer)

These are the most dangerous onboarding bugs because they violate the platform's own "never surface a fake success" rule precisely at the moment of first revenue.

**Payment gateway — `useSetupChecklist.ts:247-259`.** Step completion is:

```ts
step.completed = integrations.some((i: any) => i.is_active && i.is_configured)
```

This only proves a config form was submitted and the flags were set — it does **not** prove the stored API keys are valid, unexpired, or reachable. A non-technical owner who fat-fingers a Stripe secret key, or pastes test keys into a live store, gets a green "Payment gateway configured" check and reasonably concludes they are ready to sell. The first real order then fails with a technical gateway error. **Recommendation:** add a "Test Connection" action on the payment settings page (`/setting/third-party-services`) that does a real round-trip against the stored credentials, and only mark the checklist step complete after a successful test — or, at minimum, distinguish "configured but not tested" from "configured and verified." Re-test (or use a short-TTL cached test result) at checkout so a later credential rotation can't silently break ordering.

**Shipping — `useSetupChecklist.ts:274-285`.** Completion is simply:

```ts
step.completed = data.length > 0
```

`StoreOnboardingService` seeds two rates (Standard Shipping and Store Pickup), so this is **green by default on every new store before the owner has looked at it.** It does not check that any rate is active, that any rate carries a real charge or a delivery promise, or that `estimated_days` is set. An owner who deactivates the standard rate, or whose only option is a $0 rate with no delivery estimate, still sees green — and a customer at checkout is offered "free shipping, no delivery date," which reads as broken. **Recommendation:** require at least one `is_active` rate that has either a positive charge, a free-shipping threshold, or a delivery estimate, and surface the active/inactive count on the shipping settings page.

Both of these are the exact "confirmed-then-discarded / fake-success" bug class this codebase has repeatedly flagged — here it lands on the two steps that gate the ability to take money.

### 2. Checklist auto-expiry can hide an incomplete setup — `useSetupChecklist.ts:135-150`

`isExpired` (line 135-139) is true once 30 days (`EXPIRE_DAYS`, line 11) have passed since `first_shown_at`, and `shouldShow` (line 142-150) hides the banner when expired:

```ts
const shouldShow = computed(() =>
  stateLoaded.value && isEligible.value &&
  !state.value.manually_dismissed &&
  !state.value.all_completed &&
  !isExpired.value &&
  !allComplete.value,
)
```

**Stale-doc correction:** the findings draft described this as an "OR condition." Re-verified — it is actually an AND of negated guards, and `shouldShow` also re-checks live `allComplete.value` alongside the persisted `all_completed` flag. The **behavioral conclusion still holds and is the real problem:** because `!isExpired.value` is one of the ANDed guards, the banner disappears on day 31 *whether or not setup is finished*. A new owner who gets busy for a month — exactly the realistic case for a small print shop — loses their only guidance and is left with a half-configured store and no prompt to finish. **Recommendation:** do not expire while any launch-critical (required, non-optional) step is incomplete; reserve expiry, if kept at all, as an escape hatch only once the store is genuinely sellable, and lengthen the window. Note the redundancy between the persisted `all_completed` flag and the live `allComplete` computed — keep one as the source of truth to avoid drift.

### 3. First-run is unguided: empty list, no auto-store, no wizard

A brand-new tenant's **first screen is an empty store list**, not a welcome flow. The list page does render a proper empty state with an "Add Store" CTA (the shared `store/Select.vue:13` primitive shows "No stores yet - create a store first."), so this is not a blank-screen bug. The gap is **contextual guidance**: nothing explains that a store is a branded storefront, that creating one is the expected first action, or what gets configured next. To a non-technical owner this can read as "the app is empty/broken."

Compounding it: **there is no automatic first-store creation on registration** (confirmed absent), and **no post-creation wizard** (`store-management/stores/create.vue` collects name/subdomain/logo/domain then drops the owner onto the dashboard to self-navigate). The pieces to do better already exist — `StoreOnboardingService` can seed demo catalog, FAQs, pages, and a working `WELCOME10` coupon. **Recommendation:** on tenant creation, auto-create a first store named after the owner and run the onboarding seeder, so the very first login lands on a ready-to-customize store with the checklist visible; and add a short post-creation wizard (logo → first product → payment → shipping → preview) that walks the required steps in order with inline help, rather than leaving discovery to the owner.

## Detail — secondary items

- **Step help is too technical (`:67, :89`).** "Connect a payment provider" / "Configure shipping rates" with bare links assume the owner knows what a gateway, API key, or shipping rate is. Add per-step "Learn more" cards listing supported gateways, an estimated time, and the one gotcha that matters ("your secret key is private — never share it").

- **Preview-storefront completion is localStorage-only (`:95-109, :211-216, :287-292`).** The code comment (line 105-108) is candid that it can't be verified server-side. Since the step is `optional` and never blocks auto-hide, this is acceptable — but clearing browser data silently flips the ✓ back off. Either persist a server-side timestamp or, given it's optional, simply note it's a local convenience marker.

- **Demo banner copy (`products/index.vue:26-59`).** The "Remove samples" confirmation does state irreversibility (verified), but the banner itself doesn't, and it invites owners to "customise" samples without clarifying these are illustrative examples, not their real catalog. Tighten the copy to say "examples," and surface the irreversibility hint before the owner reaches the dialog.

- **Dashboard widgets (`index.vue:54-62`).** Widgets fetch independently and the excerpt shows no error/timeout fallback in the template; with the previously-noted ~10s full load, a slow or 500-ing endpoint could leave a widget skeleton-bound. _Recommendation (labelled): audit each `Dashboard*Widget` for explicit error + timeout end states; verify with delayed/500 mocks._

- **Demo catalog per store (`StoreOnboardingService.php:809-867`).** Confirmed: `seedSampleCatalog` is idempotent per store (`StoreProduct::where('store_id', ...)->exists()` guard) and products are created tenant-global via `firstOrCreate` on SKU then attached per store via the pivot. Correct architecturally, but a multi-store tenant sees the same four samples in each store and may not understand the tenant-global / per-store-assignment model. Document the design in-code and show the active store scope on the products page.

## Readiness recommendations (labelled — additive, not findings)

1. **Recommendation:** treat "can this store actually take an order?" as a single server-computed readiness signal (payment verified AND ≥1 active valid shipping rate AND ≥1 published product), and drive both the checklist and a storefront "not yet open for orders" guard from it — so the owner-facing state and the customer-facing state can never disagree.
2. **Recommendation:** add a launch smoke path the owner can trigger ("Place a test order") that exercises payment + shipping end-to-end and reports plain-language pass/fail, converting the two silent lies into an explicit, owner-visible check.
3. **Recommendation:** add lightweight onboarding tests asserting the checklist does **not** report complete when credentials are invalid or no active shipping rate exists — this is the exact silent-lie class the project's own conventions require a reproducing test for.
