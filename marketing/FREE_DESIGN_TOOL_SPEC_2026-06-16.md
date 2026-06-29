# Free Standalone Design Tool — Engineering-as-Marketing Spec

> **Type:** Product-build spec for Bet 2's top-of-funnel magnet (the highest-leverage SEO + demo asset).
> **Companion:** strategy `readme/ACQUISITION_CHANNELS_2026-06-15.md` · kit `readme/ACQUISITION_EXECUTION_KIT_2026-06-16.md` §8.
> **Thesis:** Expose the existing **Fabric.js design studio** (`designer/`) as a free, no-login tool (a business-card / flyer maker). It is simultaneously (a) a search-traffic magnet for high-volume "free X maker" queries, (b) a live, hands-on demo of our single biggest differentiator, and (c) the top of a funnel that converts a slice of designers into store trials. This is the Ahrefs/Canva "free tool" playbook applied to our own engine.
>
> **Status:** spec only — not built. This documents *what to build and why*, grounded in what already exists in the repo. Hand to engineering as the brief.

---

## 1. Why this asset (and why it's cheap)

We already own the hard part. The `designer/` app (Vue 3 + Fabric.js, port 5174) is a battle-tested editor with text, shapes, images, filters, multi-page templates, undo/redo with IndexedDB crash recovery, and export to PNG/JPG/SVG/PDF. A free standalone tool is mostly **packaging + gating + SEO surface**, not a new product.

**Three returns from one build:**
1. **SEO / traffic** — "free business card maker", "free flyer maker", "online [product] designer" are high-volume, evergreen queries. Free tools are link magnets (Ahrefs' free tools out-pull its blog).
2. **Live demo** — instead of a screenshot, the prospect *uses* the studio. The "wow" of our differentiator is experienced, not described.
3. **Funnel** — a soft, well-placed gate converts a fraction of designers into account/trial signups, attributable end-to-end.

---

## 2. What's already there vs. what's new

| Capability | Exists in `designer/`? | Work for the free tool |
|---|---|---|
| Canvas editor (text/shapes/images/filters) | ✅ | Reuse as-is |
| Templates / clipart / asset library | ✅ | Curate a free starter set per product |
| Multi-page (front/back) | ✅ | Limit to 1–2 pages for v1 |
| Undo/redo + crash recovery | ✅ | Reuse |
| Export PNG/JPG/SVG/PDF | ✅ | Gate export (see §4) |
| **No-login / anonymous session** | ⚠️ designer assumes a product/template context | **New:** standalone entry, anonymous local draft |
| **Public marketing route + SEO** | ❌ | **New:** indexable landing pages per tool |
| **Soft signup gate at export/save** | ❌ | **New:** account-create wall on export |
| **Analytics / attribution** | ⚠️ | **New:** UTM + event instrumentation (§6) |
| **Tenant-less mode** | ❌ (designer runs in tenant context) | **New:** a landlord/marketing context, no tenant required |

**Architectural note (important):** the studio normally runs embedded in a tenant storefront. The free tool runs on the **marketing/landlord** surface with **no tenant**. Decide early where it's hosted (marketing site subpath, e.g. `/tools/business-card-maker`) and ensure the anonymous design path does not require `InitializeTenancy` or a tenant-scoped upload pipeline. Anonymous uploads should go to a **landlord/marketing bucket with short TTL auto-cleanup**, not a tenant bucket.

---

## 3. Scope — v1 (ship small)

**Product types:** start with **2** — business card + flyer. (Highest search volume, simplest geometry.) Add t-shirt and poster in v2.

**Per tool:**
- A dedicated, indexable landing page (`/tools/business-card-maker`, `/tools/flyer-maker`).
- "Start designing — free, no signup" CTA opening the canvas with that product's dimensions + bleed/safe guides preset.
- A curated gallery of **free starter templates** for that product.
- Editor: text, fonts, shapes, image upload, the free clipart/template set, undo/redo. (Hide tenant-only / pro-only controls.)
- Export gated behind a one-field account create (§4).

**Explicitly out of v1:** multi-page beyond front/back, 3D preview (save for the in-product demo), pricing, checkout, payment, ordering. The free tool's job is *design → signup*, not *order*.

---

## 4. The gate (where the funnel converts)

Let people **design freely with no friction** — gating too early kills the SEO/UX value. Gate only at the **moment of value capture**: export / download / save.

- Designing: 100% open, no login, anonymous local draft (reuse IndexedDB).
- On **Export / Download / Save**: show a single-field "Create a free account to download your design" wall (email + password, or Google). On success: deliver the file **and** persist the design to the new account.
- Post-signup CTA (soft, never blocking): *"Want to sell designs like this from your own print store? Start your free trial →"* → the store-trial onboarding.
- Carry the anonymous draft across the signup boundary so nothing is lost (the silent-drop rule applies: design in → design out).

**Conversion path to instrument:** `tool visit → design started → export attempted → account created → store trial started`.

---

## 5. SEO surface

- **Target queries:** `free business card maker`, `free flyer maker`, `online [product] designer`, `[product] template free`. High volume; the gate converts a slice to product trials. (Stay off saturated head terms per the kit's guardrails.)
- **One indexable landing page per tool** with: H1 matching the query, a live "start designing" embed/CTA above the fold, the template gallery (each template a thumbnail with its own crawlable detail), a short "how it works", and a single soft CTA to the store trial.
- **Programmatic/template SEO:** generate a crawlable page per starter template (e.g. `/tools/business-card-maker/templates/minimal-bold`) — the Notion/Canva template-directory playbook. Seed from product/template data; keep thin pages out (only index templates with a real preview).
- Internal-link these pages from the relevant BOFU comparison pages and JTBD guides, and vice-versa.

---

## 6. Analytics & attribution (build in from day one)

Per the metrics work, instrument server-side where possible and tag everything:
- UTM on every outbound link from a tool page to the trial.
- Events: `tool_page_view`, `design_started`, `template_selected`, `image_uploaded`, `export_attempted`, `account_created` (source=`free_tool:<product>`), `store_trial_started`.
- A single funnel report: tool → design → export → account → trial, sliced by tool (business-card vs flyer) and by source query/UTM.
- This is the data that tells you whether the free tool earns a place as a focus channel (CAC/Volume/Fit) or stays a background asset.

---

## 7. Guardrails (house rules that apply)

- **Anonymous uploads:** route through a marketing/landlord upload path with **short-TTL auto-cleanup**; never into a tenant bucket. Store relative paths only.
- **No raw technical output:** loading/empty/error states required; plain-language messages; no UUIDs/slugs/engine type names on screen (a text layer is named by its text, an image by its filename — already the designer's standard).
- **Mobile:** the canvas must be usable (or gracefully degrade) at 375px; if full editing isn't viable on phone, offer template pick + text edit and prompt desktop for full design — never a broken canvas.
- **Abuse/cost control:** rate-limit anonymous exports and uploads; cap canvas size/upload size; the tool is a magnet, not free unlimited rendering.
- **Don't leak tenant features:** hide pro/tenant-only controls; the free tool is intentionally a subset.

---

## 8. Build sequence (matches kit week 2–6 front-load sprint)

1. **Standalone anonymous entry** — render the existing canvas outside tenant context, with business-card dimensions + guides preset; anonymous local draft. *(De-risk the architecture first — this is the only genuinely new plumbing.)*
2. **Landing page #1** (`/tools/business-card-maker`) — indexable, live CTA, curated free templates.
3. **The export gate** — single-field account create on export; carry the draft across; post-signup trial CTA.
4. **Instrumentation** — events + UTM + the funnel report.
5. **Landing page #2** (flyer) — reuse everything; second product type.
6. **Template-detail pages** — programmatic SEO from the seeded template set.

**Definition of done (v1):** a stranger can land from Google on the business-card maker, design with no login, hit export, create an account, receive their file, see the "start your store trial" CTA — and every step shows up in the funnel report.

---

## 9. What this is NOT

- Not a second product to maintain — it's a thin marketing skin over the existing `designer/`.
- Not an ordering/checkout flow — design→signup only.
- Not a place to ship the 3D preview or pricing engine — those stay as the *in-product* demo that rewards the trial.

---

*Spec only. Grounded in the shipped `designer/` (Fabric.js) capabilities; the only net-new engineering is tenant-less anonymous mode, the indexable marketing pages, the export gate, and instrumentation. Sequenced to fit the execution kit's week 2–6 front-load sprint.*
