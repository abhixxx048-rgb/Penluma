# Platform Gap Assessment - Print-Flow-360

> Senior-consultant review of what the platform is missing, benchmarked against the print-software market.
> Date: 2026-06-07 · Method: source-of-truth code review (not docs), four parallel domain sweeps, key claims verified directly.
> Companion to: `readme/PRICING_REALWORLD_GAPS.md`, `readme/PLATFORM_AUDIT_2026-05-31.md`, `readme/FEATURE_IMPROVEMENT_RD_2026-06-02.md`.

---

## 0. TL;DR

Print-Flow-360 is ~**80% complete as a web-to-print storefront** and ~**40% complete as a print MIS / production system**. It straddles two markets most competitors pick one of. That breadth is the strategic edge - and the reason the gaps are spread thin across a wide surface.

The single most important finding: **the order-to-production spine breaks in three places** - there is no preflight/print-ready validation, no partial fulfillment, and no carrier/tracking integration. An order cannot travel cleanly from "paid" to "shipped." Everything else is secondary to closing that chain.

Two findings initially flagged as "launch blockers" were **false alarms** caused by misreading commented/legacy code, and have been corrected here (see §6).

---

## 1. Method & how to read this

- Four read-only research sweeps over `app/`, `database/migrations/`, `nuxt/`, `frontstore/`, `designer/`, `pdf-service/`, and `readme/`.
- Benchmarked against the two halves of the print-software market:
  - **Web-to-print / storefront:** OnPrintShop, DesignNBuy, Inksoft, Gelato, Aleyant Pressero.
  - **Print MIS / production:** Printavo, Avanti, PrintVis, tFLOW.
- Every gap labelled **ABSENT** below was confirmed missing in code, not merely undocumented.
- Severity is ranked by **business impact**, not engineering size.

---

## 2. What's strong (leave alone; polish only)

These are genuinely above market standard - do not refactor them chasing gaps:

| Area | Why it's strong |
|---|---|
| **Pricing engine** | 7 wired strategies (fixed, %, area, quantity-tier, formula, conditional, combination-matrix), B2B contract/% overrides, frozen price snapshots on cart/quote/order. More capable than most competitors. `app/Services/Pricing/`. |
| **Payments** | Multi-gateway (Stripe, Razorpay, Authorize.Net, PayPal, PayTM, Cheque) via a registry/driver pattern; idempotent webhooks, per-gateway signature verification, dedup table, audit log. Production-grade. `readme/PAYMENT_GATEWAYS.md`. |
| **Multi-tenancy & caching** | `stancl/tenancy`, `BelongsToTenant`, tenant-safe versioned cache with `x-tenant-host` vary. `readme/STOREFRONT_CACHE_GUIDE.md`. |
| **Security** | 22-fix audit (May 2026): httpOnly cookie auth, DOMPurify `v-html`, open-redirect guard, CSP. `readme/SECURITY_GUIDELINES.md`. |
| **CMS page builder** | 50+ content blocks, drag-drop, per-store theming, menu builder. |
| **Design studio** | Fabric.js canvas, templates with locked regions, personalization mode, IndexedDB crash recovery, QR/barcode, gated AI image/background tools. |
| **B2B (further along than it looks)** | `CompanyAccount`, `CreditAccount` + append-only `CreditLedgerEntry`, `CompanyPricingResolver`, credit-limit enforcement all exist in code. Just not surfaced in the storefront yet. |

---

## 3. The gaps that matter - ranked by impact

### 🔴 Tier 1 - Revenue leaks & market blockers (fix before scaling)

| Gap | Business impact | Code evidence |
|---|---|---|
| **No carrier / shipping integration** | Can quote flat/tiered rates only. Cannot buy a label, pull a live UPS/FedEx/USPS/DHL rate, or push a real tracking number. "Track my order" is impossible. Daily expectation for every shop. | `app/Models/ShippingRate.php` is flat / free-threshold / per-item only. No carrier drivers, no shipment entity, no tracking poll. Email template with `{tracking_number}` exists but nothing populates it. |
| **No destination / jurisdiction tax** | A single flat rate per store. US sales-tax nexus, EU VAT, GST-by-region all unsupported - a compliance risk for tenants, not just a feature gap. No Avalara/TaxJar hook. | `StorefrontCheckoutController.php:360-393` - one `tax_rate` from store settings (engine is real, but single-rate). |
| **No preflight / print-ready validation / CMYK** | *The* print-specific gap. Files reach production with no resolution check, no bleed enforcement, no font-embed check, no CMYK conversion (output is RGB). Reprints and rejects come straight out of margin. | No preflight in `designer/` or `pdf-service/`; PDF path does not color-convert. |
| **No partial fulfillment / split shipments** | An order is one atomic status. Cannot ship 500 of 1000, or split a multi-product order across shipments. Blocks large runs and B2B. | `Order` has a single `status`; no per-item fulfilled counts, no shipment records. |
| **No stock reservation at checkout** | Inventory is not held/decremented when an order is placed → overselling under concurrency. | `ProductInventoryService` deducts manually; no cart→order hold. |

### 🟠 Tier 2 - Operational maturity (to run real shops at volume)

| Gap | Why it matters | Evidence |
|---|---|---|
| **No production scheduling / press queue** | Imposition + press specs exist, but no scheduling engine: no job board, no capacity/sequencing, no operator assignment. The MIS half is half-built. | `app/Models/Imposition/Press.php`, `ImpositionService.php` exist; no scheduler, no operator role. |
| **No refund / credit-memo / RMA workflow** | `REFUNDED` status and `refunded_partial` exist but there is no refund *service*, no reason tracking, no inventory reversal, no return authorization. | `PaymentStatusEnum::REFUNDED_PARTIAL` unintegrated; no refund flow. |
| **No vendor / trade-printing / outsourcing** | No supplier model, no PO generation, no dropship. Most shops outsource something. | Absent. |
| **No accounting sync (QuickBooks / Xero / Zoho Books)** | Listed in the integration catalog, not implemented. Bookkeeping is manual export. High-frequency SMB ask. | Catalog entry only; no driver. |
| **No raw-material / substrate inventory** | Finished-product stock is tracked; paper/ink/substrate is not. Imposition computes material cost but it is not tied to stock. | `ProductInventoryService` is finished-goods only. |
| **One-click reorder only implicit** | Snapshots make it *possible* but there is no reorder flow. Reorders are the lifeblood of print (cards, recurring jobs). | No reorder endpoint/UI. |

### 🟡 Tier 3 - Growth & reach (new markets / less friction)

| Gap | Impact |
|---|---|
| **No i18n / multi-language storefront** | Storefront is English-only (designer has partial i18n). Blocks non-English markets. |
| **Multi-currency partial** | Single currency per store, snapshotted; no selector, no FX, no per-country pricing. |
| **No customer support layer** | No helpdesk, ticketing, live chat, or knowledge base. Per-order message threads exist, but no support surface. |
| **White-label custom domains partial** | `Store.domain` exists; no DNS-setup UI, verification workflow, or SSL automation. |
| **No PWA / offline; informal accessibility** | No service worker/manifest; ~494 aria attributes but no WCAG audit - a procurement/legal risk for enterprise & government buyers. |
| **SSO (Google/Facebook) scaffolded, not wired** | Signup/login friction for B2C. |

---

## 4. Cheap wins - code already exists, just unwired

Highest ROI-per-hour on the board. These are enum/UI work, not net-new builds:

- **Pricing strategies coded but not enabled:** `MultiplierPricingStrategy`, `PerUnitPricingStrategy`, `CharacterBasedPricingStrategy`, `HybridAreaQuantityPricingStrategy` (`app/Services/Pricing/Strategies/`).
- **Per-size base pricing:** `ProductSize.pricing_type/value/formula` columns exist; the calculator ignores them. Flagged Wave 1 in `readme/PRICING_REALWORLD_GAPS.md`.
- **B2B departments:** modeled (`app/Models/B2B/Department.php`), no management UI; B2B accounts not surfaced in storefront.
- **Imposition:** service written, not wired to the designer/order flow.

---

## 5. The strategic question

> **DECISION (2026-06-07): storefront-first.** Implementation plan in `readme/STOREFRONT_FIRST_ROADMAP_2026-06-07.md`. Scouting found most of Tier 1 is dormant-but-built (EasyPost carrier driver, `runPreflight()`, CMYK `processImageForPrint()` all exist, just unwired) - the spine is largely wiring, not greenfield.

**Are you a storefront that sells print, or the system that runs the print shop?** Today you're ~80% of the first and ~40% of the second. You cannot credibly finish both at once.

- **Storefront-first** → prioritize shipping integration, destination tax, preflight/CMYK, reorder, i18n/currency. These convert and retain buyers directly.
- **MIS/production-first** → prioritize scheduling/press queue, partial fulfillment, materials inventory, vendor/outsourcing, accounting sync. These let a shop *operate* on you and drop their second tool.

**Recommendation:** finish the **storefront-to-production spine first** - `preflight → stock reservation → partial fulfillment → carrier + tracking` - as one continuous epic. That's the path a real order travels, it's where most investment already sits, and it's broken in exactly three places today. Closing it makes the product *whole* on the route you've already committed to, before widening scope.

---

## 6. Corrections to common misreads

Two items are frequently (and were initially) reported as broken. Both are **fine** - verified in code 2026-06-07:

| Claimed "blocker" | Reality | Evidence |
|---|---|---|
| "Tax hardcoded to $0 at checkout" | **False.** A real tax engine reads `tax_enabled`, `tax_rate`, `prices_include_tax` and handles inclusive/exclusive. The real gap is *single-rate*, not *zero* (see Tier 1). | `StorefrontCheckoutController.php:360-393`. |
| "Trial subscription auto-creation commented out" | **False.** Old inline code is commented, but replaced by `AccountStatusService::approveTrial($tenant, null)` on auto-approve, plus signup confirmation email + admin notification. | `AuthController.php:121-145`. |

Lesson for the team: grep results showing commented blocks are not proof of absence - trace the live replacement before filing a blocker.

---

## 7. Suggested sequencing

1. **Spine repair (Tier 1), in order:** preflight/CMYK output → stock reservation → partial fulfillment → carrier integration + tracking. One epic.
2. **Money correctness:** destination tax (TaxJar/Avalara) → refund/credit-memo workflow.
3. **Cheap wins in parallel:** wire dormant pricing strategies + per-size pricing; surface B2B in the storefront.
4. **Reach:** i18n + multi-currency → accounting sync → reorder flow.
5. **Operational depth:** production scheduling → materials inventory → vendor/outsourcing.

---

## 8. Domain inventory (reference)

Condensed BUILT / PARTIAL / ABSENT map. Full per-domain notes available on request.

**Product / Catalog / Pricing** - BUILT: product types (hybrid/tshirt/packaging), sizes w/ bleed-trim guides, options + constraints, combination pricing, B2B pricing, product + size inventory, categories, reviews, quotes, configurations, Fabric.js designer + templates/assets. PARTIAL: per-size pricing (unwired), several strategy classes (unwired). ABSENT: preflight, proof-approval gate, design versioning, print-ready PDF export, graduated area pricing, rush surcharge, price rounding.

**Order / Production / Fulfillment** - BUILT: order lifecycle + custom statuses, immutable snapshots, order history audit, print jobs + custom job statuses, imposition + press specs, proofs w/ signature, multi-channel notifications, automation triggers, shipping rate calc. PARTIAL: refunds, production scheduling, operator assignment. ABSENT: carrier integration, label printing, tracking, partial fulfillment, vendor/dropship, stock reservation, raw-material inventory, RMA, multi-warehouse.

**Business Ops (CRM / Reporting / Accounting / Billing / Integrations)** - BUILT: customer profiles + segments + activity, B2B accounts + credit ledger, 20+ statistics reports, Action Center alerts, invoices/quotes w/ currency snapshot, multi-gateway payments + webhooks, SaaS subscription framework, integration registry (email/SMS/shipping/payment drivers), Zoho Sign, reCAPTCHA. PARTIAL: communication thread, usage metering, embedded card forms. ABSENT: accounting sync (QB/Xero), unified inbox, GL/expense tracking, usage-based billing, dunning, most catalog integrations (Zoho CRM, Mailchimp, Klaviyo).

**Storefront / Designer / Infra** - BUILT: catalog/search/cart/checkout, account/profile/addresses/wishlist, reviews, SEO (sitemap/robots/Google Shopping), themes + CMS, multi-tenancy, onboarding + seeding, caching, security. PARTIAL: reorder, white-label domains, multi-currency. ABSENT: i18n, PWA/offline, formal WCAG, helpdesk/live chat, SSO, CMYK output, preflight.

---

*Prepared as a consulting deliverable. To convert any tier into a file-level implementation plan, start from the entry points cited above.*
