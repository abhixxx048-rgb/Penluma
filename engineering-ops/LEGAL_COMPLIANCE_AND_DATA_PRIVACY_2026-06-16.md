# Legal, Compliance & Data Privacy

> **This is internal research and guidance, not legal advice.** It maps what the Print-Flow-360 codebase actually does today against GDPR/UK GDPR, CCPA/CPRA, ePrivacy/cookie law, and US/EU copyright-and-trademark law for print-on-demand. Every item marked "needs a lawyer" must be reviewed by qualified counsel before relying on it. Dated **2026-06-16**.
>
> **Audience:** founders, engineering leads, and ops. Plain-language where possible; file paths included so engineers can find the exact code.
>
> **Related docs:** `readme/SECURITY_GUIDELINES.md`, `readme/PAYMENT_GATEWAYS.md`, `readme/NOTIFICATIONS_AND_QUEUES.md`, `readme/CUSTOM_FIELDS_AND_ADDRESS_ATTENTION_SCOPE_2026-06-07.md`, `CLAUDE.md` §5 (tenancy + data-integrity invariants).

---

## Table of Contents

1. [TL;DR — non-negotiables before onboarding real customers](#1-tldr--non-negotiables-before-onboarding-real-customers)
2. [Our data-processing model](#2-our-data-processing-model)
3. [GDPR / CCPA obligations](#3-gdpr--ccpa-obligations)
4. [Terms of Service & Privacy Policy](#4-terms-of-service--privacy-policy)
5. [Cookie consent](#5-cookie-consent)
6. [IP / copyright liability for uploaded designs](#6-ip--copyright-liability-for-uploaded-designs)
7. [DPA (Data Processing Agreement)](#7-dpa-data-processing-agreement)
8. [Action checklist](#8-action-checklist)
9. [What needs a qualified lawyer](#9-what-needs-a-qualified-lawyer)

---

## 1. TL;DR — non-negotiables before onboarding real customers

Ranked by risk. The first item is the one that can produce a six-or-seven-figure judgment against the **company itself**, not just a tenant.

| # | Risk | Why it's the top of the list | Status today |
|---|------|------------------------------|--------------|
| **1** | **Printing customer-uploaded copyrighted/trademarked artwork.** | Print-Flow-360 doesn't just *host* images — it **manufactures physical goods** bearing them (the pdf-service builds print-ready PDFs; orders go to production). US courts have repeatedly held that the DMCA "safe harbor" that protects an online *host* does **not** protect the *manufacture and sale* of a t-shirt/poster/card bearing an infringing image (*Greg Young Publishing v. Zazzle*).[^zazzle] Trademark has **no** DMCA safe harbor at all. Because the SaaS operator runs the print pipeline for **every** tenant store, it structurally sits in the "manufacturer" seat (the *Zazzle/RageOn* loser seat), not the "passive marketplace" seat. | **No DMCA agent, no takedown workflow, no upload ownership attestation, no prohibited-content policy, no repeat-infringer policy.** The "I agree to Terms" checkbox at signup is UI-only and never saved. **P0.** |
| **2** | **Storing card CVV in plaintext.** `payment_profiles` has a `cvv` integer column (migration `2025_04_09_173425`), and full `card_number` + `cvv` are accepted server-side in `PaymentProfileController.php`, `InvoiceController.php`, and `Admin/TenantController.php` and relayed to Authorize.Net with no client-side hosted-fields tokenization. Reading nulls the CVV (`PaymentProfileController.php:49`) — but **storing CVV at all, even transiently, is a hard PCI-DSS prohibition.** | This is a contractual breach with the card networks and a major breach-liability multiplier. | Live in code. **P0 — stop storing CVV; move to gateway hosted fields / tokenization.** See `readme/PAYMENT_GATEWAYS.md`. |
| **3** | **No Data Processing Agreement (DPA) with merchant tenants.** Each merchant is the **controller** of their shoppers' data; the platform is the **processor**. GDPR Art. 28 makes a written DPA **mandatory** before processing.[^art28] | Without it, every EU/UK merchant you onboard is technically non-compliant *and so are we*. Enterprise/B2B merchants will demand it in procurement. | None exists. **P0 (Legal).** |
| **4** | **No way to honor a data-subject request.** No data export, no self-service account deletion, no erasure that respects order/invoice snapshots. GDPR requires a response within **one month**; CCPA within **45 days**. | A single "delete my data" email we can't action is a reportable failure. | None exists. **P0–P1 (Engineering).** |
| **5** | **No cookie-consent banner.** Source search is clean — no banner, no consent manager, no GPC handling. EU/UK visitors require **prior opt-in** before any non-essential script; US visitors require a **Do-Not-Sell/Share** path + Global Privacy Control handling. | Direct ePrivacy/PECR and CCPA exposure; the FR regulator has issued nine-figure fines for banner design alone. | None exists. **P1.** |
| **6** | **Marketing data leaves the platform with no consent gate.** `Customer::booted()` auto-dispatches `SyncCustomerToMarketingJob` on every customer create (`app/Models/Customer.php:105`) — customer PII flows to an external marketing system the moment a record is created, with no recorded consent. | Third-party data sharing without a lawful basis. | Live in code. **P1.** |
| **7** | **Tenant isolation is row-level only.** Single shared PostgreSQL DB; all `stancl/tenancy` DB/cache/filesystem bootstrappers are commented out in `config/tenancy.php`. One missing `BelongsToTenant` scope = cross-tenant PII leak. Per-tenant S3 is opt-in; otherwise artwork shares one local `public` disk. | A leak here is a breach across *many* merchants at once. | High-trust invariant; needs automated cross-tenant tests. **P1.** |

**Bottom line:** items 1 and 2 are existential and must be fixed before real customer traffic. Items 3–4 are launch-blockers for any EU/UK or California-touching merchant.

---

## 2. Our data-processing model

The single most important legal fact about this architecture is the **controller/processor split**, and Print-Flow-360 runs **two roles in parallel**.

### 2.1 Two roles, decided by *who chooses the purpose*

The line is set by **who determines the purposes and means** of the processing (GDPR Art. 4(7)/(8)), not by who holds the data or who is bigger.[^art28]

| Data | Controller | Processor | Contract needed |
|------|-----------|-----------|-----------------|
| **A merchant's storefront shoppers** — their customers' names, emails, addresses, orders, designs | **The merchant tenant** (they decide why/how) | **The platform** (acts on the merchant's instructions) | **Art. 28 DPA** (platform ← merchant) |
| **The platform's own business data** — merchant account holders, store-owner contact/billing, platform analytics, marketing to merchants, support tickets, staff | **The platform** | — | Platform's **own privacy notice + lawful basis** (not a DPA) |

> **The trap:** the moment the platform uses *tenant customer data for its own purposes* — cross-tenant analytics, training models, marketing — it stops being a processor and becomes a **controller** for that processing, inheriting full controller liability.[^controller] The `SyncCustomerToMarketingJob` auto-sync (gap #6 above) and any cross-tenant analytics are exactly the kind of processing that can flip this switch. Keep tenant customer PII walled to the merchant's purposes.

### 2.2 The PII we actually hold (from the survey)

**Tenant-scoped (merchant is controller, platform is processor):**

| Category | Where | Notable fields |
|----------|-------|----------------|
| Customers | `app/Models/Customer.php`; migrations `2025_01_26_112622`, `2026_02_14_100001`, `2026_06_04_000002` | company_name, primary_contact_name/email/number(+ext), additional_contacts, account_number, hashed password, email_verified_at, remember_token, OAuth provider/provider_id, last_login_at, login_count, **custom_field_values** (JSON), notification_preferences |
| Addresses | `app/Models/Address.php`; migrations `2025_01_26_131218`, `2026_03_15_100003` | address_line1–4, city, region, zip, country, **attention_to** (recipient name), latitude/longitude, custom_field_values |
| B2B accounts | `app/Models/B2B/*` | company accounts, departments, b2b_role |
| Extra contacts | `Contact` / `ContactEmail` / `ContactPhone` | named contacts with emails + phones |
| Quotes & orders | migrations `2025_02_01`, `2025_12_15_201408` | customer_note, special_info, billing/shipping/install attention_to, address snapshots |
| Newsletter | `newsletter_subscribers` (`2026_03_15_100002`) | email, subscribed_at, unsubscribed_at |
| Reviews / logs | `ProductReview` (customer_id), `StorefrontErrorLog` context | customer-linked content |
| **Uploaded artwork & designs** | `uploads` (`2025_07_26_222949`), `designer_documents` (`app/Models/Design.php`) | customer artwork (PDF/AI/EPS/PSD/TIFF up to 200 MB), designer_json, preview_image_url, print_ready_file, customer_id — **may contain third-party creative IP** |

**Central/landlord (platform is controller) — note these have *no* `tenant_id`:**

| Category | Where | Notable fields |
|----------|-------|----------------|
| Staff | `users` | email, hashed password |
| Store-owner businesses | `tenants` (`2019_09_15_000010`) | business name, street/city/state, logo, **allowed_ips**, **Authorize.Net keys**, bucket_name |
| Payment data | `payment_profiles` (`2025_03_30_…`, `+ cvv 2025_04_09_173425`), `payments` (`2025_02_05_…`) | card_last_four, card_type, expiration_date, billing_information (JSON), **`cvv` ← remove**; payments store transaction_id/amount/status/payload |
| Gateways | `payment_gateways` (`2025_11_02`) | per-tenant gateway config (JSON) |

### 2.3 Sub-processors (must be disclosed and flow-down-bound)

Every external service that touches tenant customer PII is a **sub-processor** under Art. 28(4) and must be (a) bound to obligations equivalent to our merchant DPA, and (b) listed publicly with advance notice of changes.

| Sub-processor | Role | Data it sees | Notes |
|---------------|------|--------------|-------|
| **Payment gateways** — Authorize.Net (order/invoice CIM), Stripe, Razorpay, PayPal, PayTM (billing) | Payment processing | Card data, billing info | `app/Services/PaymentService.php`, `app/Services/Billing/SubscriptionGatewayRegistry.php`. **PCI: move to their hosted fields so PAN/CVV never transit our app.** |
| **Email / SMS provider** | Transactional + marketing delivery | Names, emails, phone | See `readme/NOTIFICATIONS_AND_QUEUES.md` |
| **External marketing system** | `SyncCustomerToMarketingJob` target | Customer PII | **No consent gate today — gap #6.** |
| **Cloud storage / S3** | File storage | Artwork, designs, snapshots | Per-tenant bucket `tenants.bucket_name` *only if configured*; else shared local `public` disk |
| **pdf-service (Node, port 4000)** | Print-ready PDF + thumbnail generation | Artwork + design data | Shares the same PostgreSQL DB (read-only) and per-tenant S3. **In-scope sub-processor/internal processing component** — must inherit the same encryption, isolation, access control. `pdf-service/src/services/tenant/tenantContext.js`, `pdf/pdfStorageService.js`, `storage/S3Storage.js`. |

---

## 3. GDPR / CCPA obligations

For each obligation: the rule, then **"what we must build"** tied to this codebase.

### 3.1 Data-subject rights — access, export (portability), rectification, erasure

- **GDPR:** respond within **one month** (extendable +2 months for complex requests).[^erasure] As a **processor**, our duty is to give the **merchant-controller the tooling** to action these; the merchant decides and replies to their shopper.
- **CCPA/CPRA:** rights to **K**now, **D**elete, **C**orrect, **O**pt-out of sale/share, **L**imit sensitive-PI, **E**qual treatment. Confirm receipt in **10 business days**, substantive response in **45 days** (extendable to 90).[^ccpa]

**What we must build:**
- **Per-tenant DSAR export** — an action in the *merchant store admin* (not global settings — UX rule: a setting about a customer belongs near customers) that exports one shopper's full record as machine-readable JSON/CSV: profile, addresses, order/quote history, reviews, **and `custom_field_values`**. Reuse the existing tenant-scoped query layer so it stays controller-isolated. *Round-trip test (per the silent-drop rule): assert every collected field, including custom fields, is in the export.*
- **Self-service preference + request entry** in the storefront profile (request export / deletion / correction).
- **Tenant-isolation guard on every DSAR/export/delete path** so one merchant can never read or erase another merchant's customer — extend `BelongsToTenant` and add a test proving cross-tenant access **fails** (this is the design-API customer-scope leak risk class).

### 3.2 Erasure vs. snapshots — the hard part, call it out

GDPR's right to erasure is **not absolute**. Data kept for a **legal obligation** (tax/accounting on invoices) or for the **establishment/exercise/defence of legal claims** is **exempt**.[^erasure] Today we only have `SoftDeletes` on Customer/Quote/Invoice — that **retains** data, it does not erase it, and there is no hard-delete/anonymization path.

**The correct mechanic (do NOT hard-DELETE everything):**
1. **Anonymize the live `Customer` record** — replace name/email/phone and linked address fields with placeholders, sever auth (password, remember_token, OAuth ids).
2. **Retain the legally-required snapshots** — order/invoice `*_address_snapshot` and `customer_snapshot` stay, in **minimised** form, for the statutory tax/dispute window only.
3. This intersects the existing snapshot-aware code paths (`CLAUDE.md` §5 "records that snapshot data") — **extend** them, don't bypass them.

**What we must build:** an erasure workflow on the Customer model that anonymizes live PII, retains minimised snapshots, and is covered by a test asserting **live PII is gone but the legally-required snapshot persists**.

### 3.3 Consent & lawful basis

- **Order fulfilment** rests on **contract** or **legitimate interest** (the latter needs a documented 3-part balancing test).[^consent]
- **Marketing email/SMS and non-essential cookies** require **opt-in consent** — specific, informed, freely given, unambiguous, **no pre-ticked boxes**, withdrawable.[^consent]
- Today: the signup "I agree to Terms/Privacy" checkbox (`login.vue`, `LoginModal.vue`) is **UI-only, never persisted** — no consent column/table/timestamp/version anywhere.

**What we must build:**
- A **consent record** (purpose, timestamp, source, notice version) for marketing and cookies.
- A **storefront preference centre**; wire **withdrawal** to suppress future sends.
- **Gate `SyncCustomerToMarketingJob` and the email-campaign module on recorded marketing consent** — fixes gap #6.

### 3.4 Breach notification — the 72-hour chain

- A breach = accidental/unlawful destruction, loss, alteration, or unauthorised disclosure/access.[^breach]
- **Controller** notifies the supervisory authority **within 72 hours** of becoming aware (unless unlikely to be a risk); high-risk breaches also require notifying affected individuals.
- **We are the processor** → we must notify the affected merchant-controller **"without undue delay"** (contract this to 24–48h). *That* starts the merchant's 72-hour clock.

**What we must build:** breach-detection logging + an internal incident workflow recording **who/what/when** that can generate a per-tenant notification. **Reuse the existing audit/activity-log mechanism** (`CLAUDE.md` §5) — do not invent a new one.

### 3.5 Retention & minimisation

GDPR Art. 5 requires keeping PII no longer than necessary. Today, soft-deletes retain data indefinitely and there's no retention mechanism.

**What we must build:** per-category retention timers (scheduled jobs) — anonymize inactive customers after a defined period, purge abandoned-cart PII, enforce the invoice-retention window — and surface the schedule in an admin-visible setting. **Retention values are a lawyer input** (statutory tax/dispute periods).

### 3.6 CCPA specifics (only if thresholds are crossed)

CCPA/CPRA applies to a for-profit business doing business in California meeting **any** of: >$25M revenue; buys/sells/shares PI of **100,000+** CA residents/households; or **≥50%** of revenue from selling/sharing PI.[^ccpa-thresh] We may not cross these yet — **but a merchant tenant might**, and will demand contractual support. Routine processing under our merchant contracts makes us a **"service provider"** (the CCPA analogue of a processor), which keeps tenant transfers from being "sales" — *provided we never use tenant data for our own purposes.*

---

## 4. Terms of Service & Privacy Policy

There are **two tiers** of agreement, and today neither is properly implemented (the `/privacy-policy` and `/terms` links resolve only via the generic store-authored CMS `[slug].vue` page renderer — content may be **absent or empty by default**).

### 4.1 Tier 1 — Platform ⟷ Merchant (the store owner signs up)

- **Master Services Agreement / Platform ToS** — service scope, fees, acceptable use, **IP ownership and indemnity flow-down** (merchants must attest their customers own uploaded artwork and indemnify the platform), liability caps, termination/data-return.
- **Data Processing Agreement** — see §7. Mandatory, separate document, referenced by the ToS.
- **Where to surface:** merchant onboarding / store-creation flow, with a **persisted acceptance record** (who, which version, when).

### 4.2 Tier 2 — Store ⟷ Shopper (per storefront)

- **Storefront Terms of Sale** + **Privacy Policy** + **Acceptable-Use / Prohibited-Content** + **DMCA / IP policy** + **Cookie Policy**.
- The merchant is the controller, so these are nominally the *merchant's* documents — but the platform must (a) provide sensible **default templates**, (b) make them real, reachable pages, and (c) **persist shopper acceptance** at signup/checkout.

**What we must build:**
- Replace the UI-only checkbox with a **persisted consent/acceptance record** (purpose, ToS/Privacy version, timestamp, source) at storefront signup and checkout.
- Ship **default Privacy/ToS/Acceptable-Use templates** so a store is never live with empty legal pages; render the DMCA agent + prohibited-content policy as real footer-linked pages (see §6).
- **Lawyer drafts the actual wording** for both tiers.

---

## 5. Cookie consent

**There is no cookie-consent banner, consent manager, or GPC handling anywhere** (source-clean; the only "consent"-like UI is the non-persisted login checkbox). Cookies/storage in use today:

- **Cookies:** `customer_token` (Sanctum auth, 30d, secure+strict), `token`, `dismissed_promo_bars`.
- **localStorage:** `tenant`, `storefront-cart-session`, `storefront-designer-auth-token`, `tax_rate`, `chat_token`, `exitPopupSeen`.
- **sessionStorage:** `offerBannerDismissed`, product config snapshots, checkout drafts, category cache.

### 5.1 What's required

- **EU/UK (ePrivacy Art. 5(3) — this is what triggers the banner, not GDPR alone):** **prior, granular, per-category opt-in** before any non-essential cookie or script. **Reject-All must be as easy as Accept-All** on the first layer; no pre-ticked boxes; persistent "Cookie preferences" link; re-prompt no sooner than ~6 months (FR) / ~12 months (general).[^banner][^reject]
- **US (CCPA/CPRA + ~12 states):** opt-**out** model — cookies may fire by default, but provide a **"Do Not Sell or Share My Personal Information"** link and **automatically honor the Global Privacy Control (GPC)** signal (`Sec-GPC: 1` header / `navigator.globalPrivacyControl`). GPC **overrides** a banner "accept". From **Jan 1 2026**, California requires a user-facing **confirmation** that the opt-out was applied.[^gpc]

### 5.2 Categories

| Category | Consent? | Examples |
|----------|----------|----------|
| Strictly necessary | **No** (disclose only) | `customer_token`, cart session, the consent record itself |
| Functional / preferences | Yes (EU) | `dismissed_promo_bars`, UI prefs |
| Analytics | Yes (EU) | GA/GTM |
| Marketing / advertising | **Always** | ad pixels, retargeting |

### 5.3 Nuxt storefront implementation note

- Build a **geo-aware gate**: EU/UK → opt-in (block scripts pre-consent); US → opt-out + Do-Not-Sell + GPC; **default to opt-in when geo is unknown.**
- **Block all non-essential scripts until the matching category is accepted** — use Nuxt Scripts `useScriptTriggerConsent()` / `defaultConsent` with Google Consent Mode v2; never hardcode `<script>` tags that fire on load.[^nuxt]
- **SSR-safe:** `document.cookie` is unavailable during SSR — guard client reads (`import.meta.client` / `<ClientOnly>` / `onMounted`) to avoid hydration mismatch; read the consent cookie server-side for consistent SSR tag output. **Keep consent paths `no-store`** so one visitor's choice can't be cached per-tenant and served to another (mind `frontstore/nuxt.config.ts` route-cache rules).
- Reserve layout space + show a loading state for the banner per the project's **async third-party-widget UX rule** (`CLAUDE.md` §0); test at **375px / 768px**.
- A **GPC listener** (server header + client property) that auto-applies and persists the opt-out and overrides a conflicting accept.

---

## 6. IP / copyright liability for uploaded designs

**This is the central risk.** Print-Flow-360 reproduces customer-uploaded artwork onto physical goods for every tenant — it is a **manufacturer**, not a passive host.

### 6.1 Who is liable

Three parties can be liable when an infringing upload is printed: the **customer** (uploader, primarily responsible for owning rights), the **merchant** (lists/sells it), and the **platform** (hosts **and manufactures**). The uploader remains primarily liable, but the printer's liability is real and fact-dependent — it is **not** a blanket rule that the printer is always responsible. Outcomes split sharply on **how active the platform is**.

### 6.2 The DMCA nuance that matters for *physical print*

- **DMCA §512(c) safe harbor can protect the online *display* of a user image — but multiple courts have held it does NOT protect *manufacturing and selling* a physical good bearing that image**, because making a t-shirt/poster is not "storage at the direction of a user" (*Greg Young Publishing v. Zazzle*).[^zazzle] **Caveat:** this rests on **district-court rulings**, not a uniform circuit rule — *Pixels* (a truly passive POD operator) *kept* the §512(c) harbor.[^pixels] The honest posture: the physical-manufacture-isn't-storage theory is **real and has succeeded**, but it is fact-dependent. Because we run the print pipeline for every tenant, we should assume we sit on the **exposed** side.
- **What kills the harbor:** direct profit + right/ability to control what's sold + slow takedowns (*Feingold v. RageOn* — 18–23 day removals, **one** factor alongside control/profit);[^rageon] **stripping copyright metadata** on upload and curating/pricing/syndicating user content (*Gardner v. CafePress*);[^cafepress] and **willful blindness** to obvious red flags.
- **Trademark has NO DMCA safe harbor.** A platform that "brings trademark-offending products into being" can face **direct** "use in commerce" liability (*Ohio State v. Redbubble*, 6th Cir.)[^osu] — but a marketplace with a **real, enforced** takedown + repeat-infringer process **can still win** (*Atari v. Redbubble* jury verdict).[^atari] Counterfeit marks carry **statutory damages up to $2M per mark** (willful) and risk **customs seizure**.
- **Right of publicity / likeness** (celebrity faces, athletes) is a **separate state-law tort** with **no** DMCA process — a classic POD exposure, handled via the prohibited-content policy.
- **§512(f) over-removal liability:** acting on **bad-faith or fair-use-blind** takedowns creates its *own* liability (*Lenz v. Universal*). Don't auto-strike legitimate parody/fair-use/public-domain art — the **counter-notice path must be genuinely available**.

### 6.3 Required safeguards

**Process/legal:**
- **Register a Designated DMCA Agent** with the U.S. Copyright Office and **renew every 3 years** (an expired registration voids the harbor); publish name, physical address, phone, email on every storefront.[^512]
- **Notice-and-takedown** that removes flagged material **expeditiously** (hours/days), a **counter-notice** path, and an **adopted *and enforced* repeat-infringer termination** policy.[^512]
- A clear **prohibited-content / acceptable-use policy** (copyright, trademarks/logos, counterfeits, rights of publicity), surfaced where users upload.
- **Do NOT strip image metadata** in the upload/thumbnail/pdf pipeline (it defeated CafePress) — preserve original or audit.

**What we must build:**
- **Upload-time ownership attestation** — "I own or am licensed to use this artwork," timestamped and logged, before the upload enters the print pipeline. **Wire it through the two-step `Upload::consumeUpload` flow** so it round-trips and persists (no silent drop). Files: `app/Http/Controllers/Api/Storefront/StorefrontArtworkUploadController.php`, `app/Models/Upload.php`.
- **Public IP-complaint intake form** (unauthenticated, under `routes/public-api.php`) capturing all statutory notice fields, validated server-side, routed to a moderation queue.
- **Moderation/takedown dashboard** for staff: view a flagged design, see which orders/jobs reference it, disable it + block new prints, notify merchant/customer in plain language, record who/what/when (**reuse the audit log**).
- **Design state machine** on `app/Models/Design.php` — `flagged` / `under_review` / `removed_ip` / `restored` — so a flagged file is blocked from new jobs but history (snapshots) is preserved. Plus an **order/job IP-hold** to pause fulfilment.
- **Repeat-infringer strike counter** on customer (and merchant) with a configurable suspension threshold.
- **Designated-agent + policy pages** rendered as real footer-linked storefront pages.
- Optional **proactive screening hook** in the pdf-service (perceptual-hash / brand deny-list) — but **gate carefully**: building detection can create "red-flag knowledge" that *defeats* the harbor. This is a legal-strategy call (see §9), not an engineering default.
- **EU DSA parity:** the same intake usable for "illegal content / infringing goods" reports, plus trader-info capture for B2B merchants.

### 6.4 Contractual shields (intent of the clauses — lawyer writes the wording)

- **User reps/warranties:** the uploader owns or is licensed to use everything uploaded; it infringes no copyright, trademark, privacy, or publicity right.
- **Indemnification:** the uploader (and, realistically, the **merchant** — individual-customer indemnities are often uncollectable) defends/indemnifies the platform against third-party IP claims.
- **Content licence:** a non-exclusive, worldwide, royalty-free licence to the platform/merchant to **reproduce, print, and fulfil** the work — broad enough to *manufacture goods*, not just display.

---

## 7. DPA (Data Processing Agreement)

A written **Art. 28 DPA is mandatory** with every merchant tenant before processing their shoppers' data.[^art28]

### 7.1 Art. 28(3) required-contents checklist

The DPA must state subject-matter, duration, nature/purpose, data types, and categories of data subjects — then bind the platform (processor) to:

- [ ] (a) process **only on the controller's documented instructions** (incl. transfers)
- [ ] (b) ensure **personnel confidentiality**
- [ ] (c) implement **Art. 32 security** (encryption in transit + at rest, tenant isolation, RBAC, resilience/restore, periodic testing)
- [ ] (d) respect **sub-processor** authorisation rules
- [ ] (e) **assist the controller with data-subject requests** (the §3.1 tooling)
- [ ] (f) assist with **Art. 32–36** (security, breach notice, DPIAs)
- [ ] (g) **delete or return** all personal data at end of service
- [ ] (h) make available info to **demonstrate compliance** and allow **audits**

### 7.2 Sub-processor list + change notification

- Publish and maintain a **`/sub-processors` page** (name, purpose, location, "last updated"): payment gateways, email/SMS, external marketing system, S3/storage, **pdf-service** (§2.3).
- Use **general written authorisation** with **advance notice (≈30 days)** before adding/replacing a sub-processor + a mechanism for merchants to **object**.
- Every sub-processor must be **flow-down-bound** to equivalent obligations; the platform stays **fully liable** for their failures.

### 7.3 International transfers (post-Schrems II)

If any host or sub-processor is outside the EEA/UK, a transfer mechanism + documented assessment is required:[^transfer]
- **EU → US:** rely on **EU-US Data Privacy Framework** self-certification, **or** EU SCCs (2021 modular) + a **Transfer Impact Assessment**.
- **UK:** the **UK IDTA** or the **UK Addendum** to EU SCCs + a Transfer Risk Assessment. (UK→ serving both EU and UK merchants may need both.)
- **Engineering input:** a **data-flow inventory** — which fields each sub-processor receives and where it's hosted — feeds the sub-processor list and the transfer assessments. **Lawyer selects/executes the mechanism.**

### 7.4 Engineering to support the DPA

- **Per-merchant data export** ("return all data") + **hard-delete on offboarding** (Art. 28(3)(g)) — cascade deletes to S3 + pdf-service artifacts.
- **Prove tenant isolation** with automated cross-tenant-denial tests; TLS everywhere + at-rest encryption for Postgres and per-tenant S3; **RBAC + access logging** for staff touching tenant data; **breach-detection pipeline** that can identify affected tenants.

---

## 8. Action checklist

Separated into **Engineering build tasks** and **Legal/Ops tasks**. Priority: **P0** = before onboarding real customers · **P1** = soon after launch · **P2** = ongoing hardening.

### 8.1 Engineering

| # | Item | Owner | Priority |
|---|------|-------|----------|
| E1 | **Stop storing CVV** — drop the `cvv` column; move card capture to gateway **hosted fields/tokenization**; remove plaintext PAN/CVV handling in `PaymentProfileController`/`InvoiceController`/`Admin/TenantController` | Engineering | **P0** |
| E2 | **Upload-time ownership attestation** wired through `Upload::consumeUpload` (timestamped, persisted, no silent drop) | Engineering | **P0** |
| E3 | **DMCA intake form** (public route) + **takedown/moderation dashboard** + **Design state machine** (flagged/removed/restored) + **order/job IP-hold** | Engineering | **P0** |
| E4 | **Repeat-infringer strike counter** + suspension threshold (customer + merchant) | Engineering | P1 |
| E5 | **Per-tenant DSAR export** (JSON/CSV incl. `custom_field_values`) in store admin + round-trip test | Engineering | **P0–P1** |
| E6 | **Erasure-by-anonymization** workflow respecting order/invoice snapshots + test (live PII gone, snapshot kept) | Engineering | **P0–P1** |
| E7 | **Cross-tenant isolation tests** on every DSAR/export/delete + general scope audit | Engineering | **P0–P1** |
| E8 | **Consent record + storefront preference centre**; persist signup/checkout ToS acceptance (replace UI-only checkbox) | Engineering | P1 |
| E9 | **Gate `SyncCustomerToMarketingJob` + email campaigns on recorded consent** | Engineering | P1 |
| E10 | **Cookie-consent banner** (geo-aware opt-in/opt-out, script gating, GPC listener, CA confirmation, preference centre) | Engineering | P1 |
| E11 | **Breach-detection logging + incident workflow** (reuse audit log) | Engineering | P1 |
| E12 | **Retention timers** (inactive customers, abandoned carts, invoice window) + admin-visible schedule | Engineering | P1–P2 |
| E13 | **`/sub-processors` page** + change-notification mechanism; data-flow inventory | Engineering | P1 |
| E14 | **Per-merchant export + hard-delete on offboarding** (cascade to S3 + pdf-service) | Engineering | P1 |
| E15 | **Default Privacy/ToS/Acceptable-Use/DMCA storefront page templates** so stores are never live with empty legal pages | Engineering | P1 |
| E16 | **Do NOT strip image metadata** in upload/pdf pipeline (audit current behavior) | Engineering | P1 |
| E17 | **Enforce per-tenant S3 + at-rest encryption + RBAC/access logging**; treat pdf-service as in-scope sub-processor | Engineering | P2 |

### 8.2 Legal / Ops

| # | Item | Owner | Priority |
|---|------|-------|----------|
| L1 | **Draft + sign the Art. 28 DPA** (platform ← every merchant) and the platform↔merchant Master Services Agreement | Legal | **P0** |
| L2 | **Register the Designated DMCA Agent** with the U.S. Copyright Office; calendar the **3-year renewal** | Legal/Ops | **P0** |
| L3 | **Draft the contractual shields** — upload reps/warranties, indemnity (incl. merchant flow-down), content licence to print/fulfil | Legal | **P0** |
| L4 | **Draft customer-facing Privacy Policy, ToS, Acceptable-Use/Prohibited-Content, Cookie Policy, DMCA policy** (both tiers) | Legal | **P0–P1** |
| L5 | **Lawful-basis determination** per purpose + Legitimate Interests Assessment sign-off | Legal | P1 |
| L6 | **CCPA threshold + "sale/share" analysis** (platform and per-merchant); GPC/Do-Not-Sell applicability | Legal | P1 |
| L7 | **Statutory retention periods** (tax/dispute) → feed E12 timer values | Legal | P1 |
| L8 | **Transfer mechanism** (DPF / EU SCCs + TIA / UK IDTA + TRA) selection + signing | Legal | P1 |
| L9 | **Art. 30 Records of Processing** (processor-side + platform controller-side) + sub-processor list maintenance | Legal/Ops | P1 |
| L10 | **DPIA / DPO / EU-UK representative** scoping | Legal | P1 |
| L11 | **DSA scope determination** (hosting service / online marketplace / KYBC / EU point of contact) | Legal | P1–P2 |
| L12 | **Proactive-screening posture** decision (detection vs. red-flag-knowledge trade-off) | Legal | P2 |

---

## 9. What needs a qualified lawyer

> **Reminder: this document is research and engineering guidance, not legal advice.** The items below require sign-off from privacy / IP / internet counsel before the company relies on them.

1. **Drafting + signing the Art. 28 DPA, Master Services Agreement, and Standard Contractual Clauses / IDTA** — engineering cannot author binding contract text.
2. **The contractual IP shields** — exact wording of upload reps/warranties, indemnification scope (and merchant flow-down + insurance), and the content-licence grant broad enough to *manufacture goods*.
3. **DMCA agent registration** and a candid assessment that **§512(c) likely does not shield the physical-manufacture step** — so the company knows its real exposure.
4. **Proactive-vs-reactive moderation posture** — how much screening to do without creating "knowledge"/red-flag awareness that *defeats* the safe harbor (a legal-strategy call).
5. **Trademark + counterfeit + right-of-publicity strategy** (no safe harbor) — brand allow/deny lists, counterfeit handling, celebrity-likeness rules.
6. **Lawful-basis determination** per processing purpose and Legitimate Interests Assessment sign-off.
7. **CCPA/CPRA threshold + "sale/share" classification**, GPC obligations, and applicability of other US state laws (Virginia, Colorado, etc.).
8. **Cookie classification** (necessary vs. functional vs. analytics vs. marketing — the main legal failure mode), cookie-wall/legitimate-interest edge cases, FR 6-month vs. UK post-DUAA divergences, and consent-banner wording.
9. **Statutory retention periods** that override erasure → set the values engineering implements.
10. **International-transfer mechanism selection** + TIA/TRA conclusions and supplementary measures.
11. **DPIA / DPO / EU-UK representative** requirements; **DSA scope** (hosting service / online marketplace / KYBC / EU point of contact).
12. **Privacy policy + all customer-facing notice wording** (both tiers).
13. **Liability allocation and breach-notification responsibilities** between platform and merchants.

---

### Footnotes / sources

[^zazzle]: DMCA safe harbor disappears once infringing images are printed on physical items — https://techdirt.com/articles/20170629/16141537702/court-says-dmca-safe-harbors-disappear-once-infringing-images-are-printed-physical-items.shtml
[^pixels]: POD website not directly liable due to lack of volitional conduct (Sid Avery v. Pixels) — https://advertisinglaw.fkks.com/post/102gsj3/print-on-demand-website-not-liable-for-direct-copyright-infringement-due-to-lack
[^rageon]: POD vendor denied DMCA safe harbor (Feingold v. RageOn) — https://blog.ericgoldman.org/archives/2020/07/print-on-demand-vendor-doesnt-qualify-for-dmca-safe-harbor-feingold-v-rageon.htm
[^cafepress]: Gardner v. CafePress (metadata stripping + active control defeat 512(c)) — https://cdas.com/cafepress-cannot-beat-copyright/
[^osu]: Ohio State University v. Redbubble (direct "use in commerce", 6th Cir.) — https://malloylaw.com/ohio-state-university-v-redbubble-inc-a-potential-sigh-of-relief-for-trademark-owners/
[^atari]: Jury finds for online marketplace over Atari — https://www.morganlewis.com/pubs/2021/11/jury-finds-for-online-marketplace-over-atari-in-trademark-infringement-case
[^512]: U.S. Copyright Office §512 — designated agent + repeat-infringer policy — https://www.copyright.gov/512/
[^art28]: GDPR Art. 28 (DPA + processor obligations) — https://gdpr-info.eu/art-28-gdpr/
[^controller]: ICO — what it means to be a processor (and when you become a controller) — https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/controllers-and-processors/controllers-and-processors/what-does-it-mean-if-you-are-a-processor/
[^erasure]: ICO — right to erasure (and its exemptions) — https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/individual-rights/right-to-erasure/
[^consent]: ICO — when is consent appropriate — https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/consent/when-is-consent-appropriate/
[^breach]: GDPR Art. 33 — breach notification — https://gdpr.eu/article-33-notification-of-a-personal-data-breach/
[^ccpa]: CPPA FAQ — CCPA rights + timelines — https://cppa.ca.gov/faq.html
[^ccpa-thresh]: California AG — CCPA thresholds + service-provider status — https://oag.ca.gov/privacy/ccpa
[^banner]: ePrivacy / GDPR cookie consent 2026 — https://www.consenteo.com/knowledge-hub/GDPR/gdpr_cookie_consent_2026
[^reject]: "Reject All" must be as easy as "Accept All" (EDPB task force) — https://techgdpr.com/blog/data-protection-digest-3062025-the-reject-all-button-is-a-must-legitimate-interest-as-the-data-controllers-initiative/
[^gpc]: Global Privacy Control 2026 — https://www.didomi.io/blog/global-privacy-control-gpc-2026
[^nuxt]: Nuxt Scripts — consent management — https://scripts.nuxt.com/docs/guides/consent
[^transfer]: European Commission — new Standard Contractual Clauses Q&A — https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/new-standard-contractual-clauses-questions-and-answers-overview_en
