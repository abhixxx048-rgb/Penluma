# Moats & Defensibility for Vertical SaaS — Print-Flow-360

> **Date:** 2026-06-16
> **Topic:** Which durable competitive advantages ("moats") Print-Flow-360 can actually build as a low-ACV, multi-tenant, web-to-print vertical SaaS — graded against Hamilton Helmer's *7 Powers*, with the moats ranked, made segment-specific, and turned into a build sequence.
> **Method:** Framework grounded in Helmer's *7 Powers* (primary), applied to the codebase via the repo's own gap/pricing/audit docs; quantitative claims verified against primary earnings/benchmark sources (cited inline). Companion to the four sibling 2026-06-16 strategy docs (see cross-references).

## TL;DR — the decisive call

**Print-Flow-360's only winnable durable moat is *switching costs*, earned by becoming the system-of-record for the highest-config-depth segments (commercial / copy-shop / B2B-corporate printers), and then compounded by *embedded fintech* (payments + B2B trade credit) which lifts gross retention toward the ~96% fintech-product benchmark.** Counter-positioning against high-touch incumbents (Aleyant Pressero, OnPrintShop, DesignNBuy, Printavo) is the *wedge* that gets you in the door, not a standing moat. Network effects and brand are out of reach today — with one exception worth seeding for Wave 3: a cross-tenant **trade-printer supply network** whose two sides (shops vs trade printers) are different populations, so the "our tenants are competitors" objection does not apply. **Hard precondition, stated up front:** the embedded-fintech moats are *blocked* until PCI-grade card handling and money-path correctness ship — today the platform stores plaintext PAN/CVV per the repo's own `PAYMENTS_BILLING_FINANCIAL_CORRECTNESS` audit. You cannot become merchant-of-record on that stack. Fix that first, or the flagship moat is a legal non-starter.

---

## 1. The framework: Hamilton Helmer's *7 Powers*

The canonical reference for "what is a durable moat" is Hamilton Helmer's *7 Powers: The Foundations of Business Strategy* (2016). It is the standard lens VCs and operators use to test defensibility, so we use it as the spine here.

### 1.1 The Benefit + Barrier test (the only test that matters)

Helmer defines **Power** as the set of conditions that creates the potential for *persistent differential returns*. Every Power must have **both**:

- a **Benefit** — it improves your cash flow (raises price, lowers cost, or both), **and**
- a **Barrier** — something that prevents competitors from arbitraging that benefit away.

The slogan to remember: *"a benefit is common; a barrier is rare."* ([Lenny's Newsletter interview with Helmer](https://www.lennysnewsletter.com/p/business-strategy-with-hamilton-helmer); [Sachin Rekhi primer](https://www.sachinrekhi.com/p/7-powers-hamilton-helmer)). Almost every product feature is a *benefit*; almost none is a *barrier*. A great pricing engine is a benefit a competitor can clone. A pricing engine your customer has spent 40 hours configuring with their contract logic is a *barrier*.

### 1.2 The seven powers

| Power | One-line definition | Stage it typically arises |
|---|---|---|
| **Scale economies** | Per-unit cost falls as you get bigger; rivals at smaller scale can't match price. | Takeoff |
| **Network economies** | The product is worth more to each user as more users join. | Takeoff |
| **Counter-positioning** | A new business model the incumbent *rationally refuses* to copy because doing so damages its existing business. | Origination |
| **Switching costs** | Customers face real cost (data, retraining, process re-encoding, integrations) to leave. | Takeoff |
| **Branding** | Durable trust/affect that lets you charge more for an identical good. | Stability |
| **Cornered resource** | Exclusive access to a vital asset (patent, key talent, data rights). | Origination |
| **Process power** | Embedded organizational capability rivals can only match with sustained multi-year investment. | Stability |

Source: [7 Powers summary, blas.com](https://blas.com/7-powers/); [tyastunggal.com notes](https://tyastunggal.com/p/7-powers-the-foundations-of-business). Helmer maps the powers to three time-stages — **Origination** (counter-positioning, cornered resource), **Takeoff** (scale, network, switching costs), **Stability** (branding, process). For an early vertical SaaS, that ordering is itself the playbook: *counter-position to get in, build switching costs as you scale, defer brand/process.*

### 1.3 Counter-positioning, precisely (because it's the one people misuse)

Counter-positioning is **not** "we're different." The barrier is specifically **collateral damage**: the incumbent observes the upstart, runs the math, and *rationally concludes it is better off NOT copying* because the new model would cannibalize its existing profit pool. The classic case is Vanguard vs. Fidelity — Fidelity's active-management franchise was so profitable that migrating customers to low-fee passive funds would destroy more value than it created, so Fidelity declined to respond ([bprigent.com on counter-positioning](https://www.bprigent.com/article/counter-positioning-7-powers-benefits-barriers-examples-business-strategy); [deliberatecapital.substack.com](https://deliberatecapital.substack.com/p/counter-positioning)). The challenger's barrier is *built out of the incumbent's own strength.* This distinction governs §6: a counter-positioning claim is only real if you can **name the specific collateral damage** an incumbent would suffer by copying you.

### 1.4 Why vertical SaaS is structurally well-suited to switching-cost + fintech moats

Vertical SaaS — software for one industry — tends to show materially higher retention and command premium multiples versus horizontal software, primarily because it owns an industry workflow and the data inside it (Tidemark's *2025 Vertical & SMB SaaS Benchmark Report* is the primary benchmark; companies with **fintech and back-office control points exhibit the highest gross and net retention of any category**, [Tidemark](https://www.tidemarkcap.com/vskp-chapter/2025-vertical-smb-saas-benchmark-report); [SaaSletter summary](https://www.saasletter.com/p/vertical-saas-benchmarks-2025)). The two proven monetization+moat plays:

- **Workflow-as-fortress (switching costs):** once a business runs its daily operations on you and its records live in you, leaving means re-encoding business logic, not just exporting rows. This is the *barrier*.
- **Embedded fintech (switching costs + economics):** payments/lending layered on the workflow. **Fintech products show ~96% gross revenue retention vs ~90% for other product types** — which implies multi-decade modeled customer lives ([Gusto Embedded, citing the benchmark](https://embedded.gusto.com/blog/embedded-fintech-strategy-revenue-churn/); Tidemark 2025). Embedding payments also flips the unit economics:
  - **ServiceTitan** (trades vertical SaaS): per its S-1, revenue mix is **~71% subscription / ~25% usage-based fintech / ~4% professional services** — a quarter of revenue is fintech riding on the workflow it already owns ([Sacra](https://sacra.com/c/servicetitan/); [MostlyMetrics S-1 breakdown](https://www.mostlymetrics.com/p/servicetitan-ipo-s1-breakdown)).
  - **Toast** (restaurant vertical SaaS): **fintech (payments + Toast Capital lending) is the bulk of Toast's gross profit and its fastest-growing engine** — GAAP subscription + fintech gross profit grew 34% YoY to $490M in Q3'25, Toast Capital alone contributed ~$51M of fintech gross profit, on $51.5B GPV (+24% YoY). Note: recurring SaaS gross profit *also* grew ~33% in 2025, so "fintech is the bulk of gross profit" is the accurate framing — **not** "the majority of gross profit comes from payments" as an unqualified fact ([Toast Q3'25 8-K](https://www.sec.gov/Archives/edgar/data/0001650164/000165016425000334/tost-20250930xexhibit991.htm); [TipRanks earnings call](https://www.tipranks.com/news/company-announcements/toast-inc-earnings-call-highlights-profitable-scaling)).

The lesson for Print-Flow-360: **the subscription is the wedge; the moat is the workflow it locks in and the fintech you can layer on top.**

---

## 2. The market & why moats matter here

The **web-to-print *software* segment** is roughly **$1.9–2.0B in 2026, growing ~8–9.4% CAGR** depending on the firm — Persistence/Insight Partners track ~$2.05B in 2026 at ~8.1% to 2033; HP/Xerox/Canon-coverage (openPR) puts CAGR at 9.4%; The Insight Partners ~$1.905B in 2026 ([Persistence Market Research](https://www.persistencemarketresearch.com/market-research/web-to-print-software-market.asp); [openPR 9.4% coverage](https://www.openpr.com/news/4501185/web-to-print-software-market-size-accelerating-at-9-4-cagr); [openPR 8.1% / $3.5B-by-2033](https://www.openpr.com/news/4492170/web-to-print-software-market-to-reach-us-3-529-2-mn-by-2033-at-8-1)). **Keep this distinct from the ~$34.9B "broad web-to-print market," which bundles services and hardware — that is not our addressable software TAM.** (Estimates vary widely by definition; cite the software-only figure when sizing.)

Why this matters for moats: it is a **fragmented, mid-single-digit-to-~9%-growth software niche with dozens of vendors**. In that shape, you do not win on growth-rate land-grab; you win on **retention** — the slow accretion of switched-cost, fintech-locked accounts that competitors cannot pry loose. Low-ACV SMB is also the highest-churn segment in software (3–5%/mo logo churn for self-serve SMB per `PRICING_RETENTION_REFERRALS_STRATEGY_2026-06-15.md`), so **a moat is not a nice-to-have here — it is the only thing that makes the LTV math work.**

---

## 3. Grading the 7 Powers for Print-Flow-360

| Power | Available to PFL-360? | Verdict | Why |
|---|---|---|---|
| **Switching costs** | ✅ **Yes — the primary moat** | **BUILD FIRST** | Configured pricing rules, B2B contracts, saved designs/templates, order+reorder history, customers, integrations all accrete into a system-of-record. Barrier = re-encoding business *logic*, not exporting data. |
| **Counter-positioning** | ⚠️ **Partial — a wedge, not a moat** | **USE TO ENTER** | Self-serve, low-price, non-technical-owner UX is genuinely counter to incumbents' high-touch/per-seat/services model — *if* a named incumbent would suffer real collateral damage by copying (§6). Erodes once you're established. |
| **Embedded fintech (a switching-cost + economics power)** | ✅ **Yes — second moat, gated** | **BUILD SECOND (after PCI fix)** | Payments take-rate + B2B trade credit ride the workflow you already own; 96% GRR. **Blocked** by the plaintext-PAN/CVV money-path audit (§5). |
| **Network economies** | 🔶 **Only one variant** | **SEED FOR WAVE 3** | Template marketplace network is killed by "tenants are competitors." But a **trade-printer supply network** has two *different* populations (shops vs trade printers) — the competitor objection does not apply there. |
| **Scale economies** | ❌ Not yet | **SKIP** | At sub-scale, no per-unit cost advantage. PDF service / S3 are COGS, not a moat. Revisit only post-scale. |
| **Cornered resource** | ❌ No | **SKIP** | No patent, no exclusive data/talent. Don't pretend otherwise. |
| **Branding** | ❌ Not yet | **DEFER (Stability stage)** | Trust must be *earned* over years; today branding is a CAC lever, not a barrier. |
| **Process power** | ❌ Not yet | **DEFER (Stability stage)** | A capability rivals can't match takes sustained multi-year investment we haven't made. |

The ranking — **switching costs → embedded fintech → counter-positioning wedge → (Wave 3) supplier network** — is the rest of this document.

---

## 4. Moat #1 — Switching costs (the system-of-record), and where it actually accrues

This is the moat. But its **strength varies sharply by customer segment**, and treating "print shops" as one ICP is the single most common analytical error here. The fintech-B2B-credit moat (§5) and the "finish the spine" thesis only pay off where config-depth and recurring AR exist.

### 4.1 Per-segment moat map (rank: where switching costs *actually* accrue)

| Segment | Config depth | Recurring AR / contract pricing | Switching-cost moat strength | Why |
|---|---|---|---|---|
| **B2B / corporate / trade printers** | Very high | High (departments, pay-on-account, credit, contract price books) | **🟢 Strongest** | Recurring corporate AR, `CompanyAccount`/`CreditAccount`/`CompanyPricingResolver` (already in code) + negotiated contract pricing = months to re-encode elsewhere. Trade-credit fintech only applies here. |
| **Commercial / copy shops** | High | Medium | **🟢 Strong** | Deep product catalogs, complex option constraints, repeat business/reorders, quotes-to-orders. The system-of-record story is real. |
| **Sign shops** | Medium | Medium | **🟡 Moderate** | Fewer SKUs but area-pricing + substrate config + repeat commercial clients give some lock-in. |
| **Screen-print / apparel** | Medium-low | Low | **🟡 Moderate-weak** | Some saved artwork/designs (My Designs lock-in), but mostly transactional B2C/team-store runs; rebuildable. |
| **Promo / POD / one-off B2C apparel** | Low | Very low | **🔴 Weakest** | Transactional, shallow config, no AR; a thin storefront they could rebuild in a weekend. Don't sell "finish the spine" or "B2B credit" here — those moats don't accrue. |

**Strategic consequence:** Print-Flow-360 should bias acquisition and retention investment toward the **B2B-corporate and commercial/copy segments**, where the moat compounds — not the promo/POD long tail where it never forms. This directly qualifies the `ACQUISITION_CHANNELS_2026-06-15.md` ICP (which leans screen-print/apparel/sign because those communities are *easy to reach*): easy-to-reach ≠ easy-to-retain. Reach via communities, but **prioritize converting the high-config-depth shops.**

### 4.2 What the barrier actually is — *logic, not data*

The honest version of this moat — and the resolution to a tension in earlier drafts — is:

- **The moat is the DEPTH of configured business logic**, not the rows of catalog data. A competitor can ingest a CSV of product names. They cannot cheaply re-encode: the 7 wired pricing strategies and their per-product formulas/tiers/option constraints; B2B contract overrides and credit terms; per-customer/department price books; option-dependency rules; locked-region design templates. That re-encoding is **days-to-weeks of skilled, error-prone work the owner is terrified to redo** — and getting it wrong means mispricing real orders. *That* is the Helmer barrier.
- **Therefore an export-friendly import wizard is NOT self-sabotage** — *as long as it applies only to dumb catalog data* (product names, images, descriptions, sizes). Making *that* easy lowers entry CAC. The configured **pricing engine, contract logic, and option constraints are deliberately NOT trivially exportable** because re-encoding business logic is the barrier itself. Build the import wizard for the catalog; do not build a one-click "export my entire configured pricing engine" — that would be handing a rival the exact tool to ingest your customers. (This is the "cheap to enter, hard to leave" asymmetry, made precise.)

### 4.3 The design-specific lock-in everyone misses: transitive customer→shop→PFL-360 lock-in

The repo names the Fabric.js designer + saved **My Designs** library as a switching-cost asset. The weak framing is "designs are painful to export." The **strong, durable mechanism is two-layer transitive lock-in**:

1. **The shop's END CUSTOMER** wants to *reprint* ("print my business cards again," "reorder last year's flyer"). That reorder only works where the **design + template + spec snapshot** lives — i.e., the shop's Print-Flow-360 storefront. The customer is therefore sticky to the *shop*.
2. **Because the shop's customers are locked to the shop**, the **shop is locked to Print-Flow-360** — if the shop leaves PFL-360, it abandons the reorder relationships and design history that make its own customers loyal.

This is far more defensible than "exporting designs is annoying," because the barrier is held by a *third party* (the shop's customers) whose reorder behavior the shop cannot replicate elsewhere. It is the exact mechanism that makes the repo's planned **Reprint Ledger / reorder reminders / "My Designs"** retention work (per `PROJECT_ROADMAP` and `PRICING_RETENTION_REFERRALS_STRATEGY_2026-06-15.md`) a *moat investment*, not just a UX feature. Prioritize: locked-template reorder + design+spec snapshot persistence + customer-facing reorder.

### 4.4 "Finish the spine" is a switching-cost investment

`PLATFORM_GAP_ASSESSMENT_2026-06-07.md` identifies the order-to-production spine (preflight/CMYK → stock reservation → partial fulfillment → carrier + tracking) as broken in three places. Through the moat lens: **every step a real order can travel *inside* Print-Flow-360 is a step the shop no longer does in a second tool — which is exactly what raises switching cost.** A shop that quotes, prices, designs, takes payment, runs the job, *and* ships+tracks on you has its entire operation encoded in you. A storefront that hands off to manual production after "paid" is a thin layer they can swap. **Finishing the spine is the highest-leverage switching-cost work on the board** — and it accrues most in the commercial/B2B segments (§4.1). This is the same conclusion the gap assessment reached on workflow grounds; the moat lens confirms it on *defensibility* grounds.

---

## 5. Moat #2 — Embedded fintech (payments + B2B trade credit) — GATED

This is the second moat, and the one with the best economics (ServiceTitan 25% fintech revenue; Toast fintech = bulk of gross profit; 96% fintech GRR — §1.4). But it carries a **hard precondition that must be stated as a precondition, not a footnote.**

### 5.1 HARD PRECONDITION (read before anything in this section)

> **Embedded fintech is BLOCKED until PCI-grade card handling and money-path correctness ship.** Per the repo's own `PAYMENTS_BILLING_FINANCIAL_CORRECTNESS` audit (in project memory), the platform today has **CRITICAL silent-lie money-path bugs: plaintext PAN/CVV storage, unencrypted gateway secrets, an admin refund modal that does nothing, wrong-currency charges, and a hidden ~3.5% surcharge.** **You cannot become merchant-of-record / take a payments take-rate on a stack that stores plaintext card numbers — that is a PCI-DSS and legal non-starter, not a sequencing nicety.** Any fintech moat work that begins before this is fixed is building on a liability. **Phase 0 of this moat = fix the money-path audit. No exceptions.**

(Note the tension with `PLATFORM_GAP_ASSESSMENT`, which graded payments "production-grade" on the *gateway-driver architecture*. The architecture is good; the *money-path correctness* is not. Both are true — the registry/driver pattern is solid, the card-handling and refund/currency/surcharge behavior is broken. The fintech moat depends on the latter.)

### 5.2 The payments take-rate moat (once unblocked)

Today payments are pass-through to Stripe/Razorpay/etc. The fintech move is to become the **payments layer** (merchant-of-record or PayFac-lite via a provider like Stripe Connect) so a slice of every GPV dollar accrues to Print-Flow-360. Benefits: (a) revenue that scales with the *shop's success*, decoupled from the thin SMB subscription; (b) **96% GRR stickiness** — once the shop's money flows through you, leaving means re-plumbing how they get paid, the deepest switching cost there is. This is precisely how Toast turned a restaurant POS into a fintech business (§1.4).

### 5.3 The B2B trade-credit moat (segment-specific — B2B only)

This applies **only to the B2B-corporate / commercial segment** (§4.1), and it is the strongest single fintech play because the rails are *already in code*: `CreditAccount`, append-only `CreditLedgerEntry`, `CompanyPricingResolver`, credit-limit enforcement (`PLATFORM_GAP_ASSESSMENT` §2). The moat: **offer corporate buyers net-terms / pay-on-account credit, financed via an embedded lending partner.** This mirrors Toast Capital (~$51M fintech gross profit) and ServiceTitan's fintech layer. Once a corporate customer runs its AR and credit line through Print-Flow-360, switching means renegotiating credit elsewhere — extremely sticky. **Do not sell this to promo/POD/B2C shops; they have no recurring AR for it to attach to.**

---

## 6. Wedge — Counter-positioning, with the collateral damage named

Counter-positioning is real *only if* a specific incumbent would **rationally decline to copy** you because of collateral damage (§1.3). Generic "we go down-market" fails Helmer's bar. Here is the bar applied to the two strongest *software* incumbents — naming the concrete mechanism:

- **Aleyant Pressero** — enterprise/per-seat web-to-print sold with **implementation + onboarding services** and a sales team. **Collateral damage if they copy PFL-360's self-serve, no-card, low-price, non-technical-owner motion:** it cannibalizes their **professional-services revenue and their sales-led GTM** — a self-serve funnel undercuts the very implementation fees and seat-based ACV that fund their model. They rationally decline → barrier holds (for now).
- **Printavo** — print-shop management sold up-market with higher-touch onboarding. **Collateral damage:** a free/cheap self-serve tier and storefront-builder positioning competes with their higher-ACV managed tiers and would compress their per-account economics and confuse their sales motion. Going self-serve down-market devalues their existing book.

**Category correction:** **4over is a trade printer / wholesale print aggregator, not a web-to-print *software* vendor.** Listing it among software incumbents (Aleyant Pressero, OnPrintShop, DesignNBuy, Printavo) is a category error. 4over belongs in the **supplier/trade-network** discussion (§7) — it is the *model* for the Wave-3 network play, not a counter-positioning target.

**Honest limit:** counter-positioning is an **Origination-stage wedge**. It gets you in the door against high-touch incumbents and shapes the homepage/positioning, but it **erodes** the moment an incumbent decides the down-market loss is acceptable, or a new self-serve entrant matches your model. Convert the wedge into switching costs (§4) and fintech (§5) before it decays. Do **not** present counter-positioning as a standing moat.

---

## 7. The one real network play: a cross-tenant trade-printer supply network (Wave 3)

Earlier analysis dismissed network effects because "our tenants are competitors, so a shared marketplace can't have network value." **That objection is correct for a *template marketplace* (shops would be sharing designs with rivals) — but it is WRONG for a supplier network, and that distinction is the whole opportunity.**

A **trade-printer supply network** is two-sided with **two *different* populations**:

- **Demand side = the shops** (your existing tenants) who need to *outsource* jobs they can't run in-house (large-format, specialty substrates, overflow capacity).
- **Supply side = trade printers / wholesale aggregators** (the 4over-style population) — **NOT your tenant base, a separate recruitable non-competing group.**

Because the two sides are different populations, the "tenants are competitors" objection **does not apply**. And the chicken-and-egg is unusually solvable: the **supply side is recruitable independently** (trade printers want order flow), so you can seed supply before demand without cannibalizing anyone. This is the one place Print-Flow-360 could earn a genuine **two-sided network economy AND a fintech take-rate simultaneously** — every outsourced job is a transaction you can route, finance, and skim. It is also exactly what 4over and Gelato monetize. (`PLATFORM_GAP_ASSESSMENT` already flags "no vendor / trade-printing / outsourcing" as a Tier-2 gap — building it as a *network*, not just a PO feature, is what turns a gap-fill into a moat.)

**Sequencing:** this is **Wave 3** — it requires a base of active shops (demand) first. Seed it only after switching-cost (Wave 1) and fintech (Wave 2) moats are in place. But unlike scale/brand/cornered-resource, it is *reachable*, so design the order-routing/outsourcing data model now with this network in mind rather than as a one-off PO tool.

---

## 8. RECOMMENDATION (decisive)

1. **Commit to switching costs as the primary moat.** Become the system-of-record for **commercial/copy-shop and B2B-corporate printers** (the high-config-depth segments where the moat actually accrues). Bias acquisition+retention spend there; do not over-invest in promo/POD where no moat forms.
2. **Finish the order-to-production spine** (preflight/CMYK → stock reservation → partial fulfillment → carrier+tracking) as a *switching-cost* investment, not just a feature gap. Every step a real order travels inside PFL-360 is a step a rival can't easily pry loose.
3. **Lock in the transitive design moat:** ship locked-template reorder + design+spec snapshot persistence + customer-facing reorder/Reprint Ledger. The shop's customers' reorder behavior locks the shop to you — the most defensible lock-in available.
4. **Fix the money-path audit BEFORE any fintech work** (plaintext PAN/CVV, broken refund modal, wrong-currency charge, hidden surcharge). This is Phase 0 of the fintech moat and a standalone legal/PCI imperative regardless of moats.
5. **Then build embedded fintech, in order:** (a) payments take-rate / merchant-of-record for the 96% GRR stickiness; (b) **B2B trade credit** (rails already in `CreditAccount`/`CompanyPricingResolver`) — but **only sold into the B2B-corporate segment.**
6. **Use counter-positioning as the entry wedge only.** Position self-serve / no-card / non-technical-owner UX against Aleyant Pressero's services-revenue and Printavo's up-market book (the named collateral damage). Convert the wedge into switching costs + fintech before it erodes. Do not call it a standing moat. Do not list 4over as a software competitor.
7. **Seed the trade-printer supply network for Wave 3** — recruit supply (trade printers, a separate non-competing population) independently; design the outsourcing/order-routing model now as a future two-sided network + fintech rail, not a one-off PO.
8. **Explicitly DON'T chase:** scale economies, cornered resource, brand-as-barrier, or a template marketplace (tenants-are-competitors kills it). These are not winnable now; pretending otherwise wastes runway.

**Import-wizard guardrail (resolves the entry/exit tension):** build a polished import wizard for **dumb catalog data only** (names, images, sizes) to lower entry CAC; **never** build a one-click export of the configured pricing engine / contract logic / option constraints — re-encoding that business logic *is* the barrier.

---

## 9. Sequencing checklist

**Wave 0 — Unblock the fintech precondition (do regardless):**
- [ ] Remediate `PAYMENTS_BILLING_FINANCIAL_CORRECTNESS` P0s: stop storing plaintext PAN/CVV (tokenize via gateway), encrypt gateway secrets, fix the dead refund modal, fix wrong-currency charge, surface/remove the hidden ~3.5% surcharge.
- [ ] Establish PCI scope/posture before any merchant-of-record exploration.

**Wave 1 — Build switching costs (primary moat):**
- [ ] Finish the order-to-production spine: preflight/CMYK → stock reservation → partial fulfillment → carrier + tracking (most code is dormant-but-built per the gap assessment — wiring, not greenfield).
- [ ] Ship locked-template reorder + design+spec snapshot persistence + customer-facing reorder (Reprint Ledger) — the transitive design moat.
- [ ] Surface B2B (`CompanyAccount`/departments/contract pricing) in the storefront so corporate config-depth actually accretes.
- [ ] Build the catalog import wizard (dumb data only). Keep the configured pricing engine non-trivially exportable.
- [ ] Bias ICP/onboarding toward commercial/copy + B2B-corporate segments (§4.1).

**Wave 2 — Embedded fintech (second moat, post-Wave-0):**
- [ ] Payments take-rate / merchant-of-record (target the 96% GRR stickiness).
- [ ] B2B trade credit / net-terms on existing `CreditAccount` rails — B2B-corporate segment only.

**Wave 3 — Trade-printer supply network (the one real network play):**
- [ ] Recruit trade-printer supply independently (separate non-competing population).
- [ ] Build outsourcing/order-routing as a two-sided network + fintech take-rate, not a one-off PO.

**Always:**
- [ ] Counter-position in marketing copy against named incumbents' collateral damage; revisit as the wedge erodes.
- [ ] Track gross + net revenue retention by segment — the moat's only honest scoreboard.

---

## 10. Cross-references (this set, readme/*_2026-06-16.md)

- **Acquisition** (`ACQUISITION_CHANNELS_2026-06-15.md`): reach via founder-led outreach + print communities — but this doc qualifies the ICP: reach the easy-to-find shops, **retain the high-config-depth ones** where the moat accrues.
- **Conversion funnel** (`CONVERSION_FUNNEL_RESEARCH_2026-06-15.md`): the "store live + first order" activation North Star *is* the first switching-cost milestone — activation and moat-formation are the same event.
- **Pricing/retention/referrals** (`PRICING_RETENTION_REFERRALS_STRATEGY_2026-06-15.md`): per-location pricing, dunning, My Designs lock-in, referral program — the retention tactics that compound the switching-cost moat.
- **Platform gap assessment** (`PLATFORM_GAP_ASSESSMENT_2026-06-07.md`): the order-to-production spine — recast here as the #1 switching-cost investment.
- See also the other 2026-06-16 sibling strategy docs in `readme/` for the rest of this strategy set.

---

## Sources

- Hamilton Helmer, *7 Powers* — interview: [Lenny's Newsletter](https://www.lennysnewsletter.com/p/business-strategy-with-hamilton-helmer)
- 7 Powers primer — [Sachin Rekhi](https://www.sachinrekhi.com/p/7-powers-hamilton-helmer)
- 7 Powers summary — [blas.com](https://blas.com/7-powers/) · [tyastunggal.com](https://tyastunggal.com/p/7-powers-the-foundations-of-business)
- Counter-positioning (benefit/barrier/collateral damage) — [bprigent.com](https://www.bprigent.com/article/counter-positioning-7-powers-benefits-barriers-examples-business-strategy) · [deliberatecapital.substack.com](https://deliberatecapital.substack.com/p/counter-positioning)
- Tidemark 2025 Vertical & SMB SaaS Benchmark (retention by control point) — [tidemarkcap.com](https://www.tidemarkcap.com/vskp-chapter/2025-vertical-smb-saas-benchmark-report) · [SaaSletter summary](https://www.saasletter.com/p/vertical-saas-benchmarks-2025)
- Fintech ~96% GRR vs ~90% — [Gusto Embedded](https://embedded.gusto.com/blog/embedded-fintech-strategy-revenue-churn/)
- ServiceTitan S-1 revenue mix (~71/25/4) — [Sacra](https://sacra.com/c/servicetitan/) · [MostlyMetrics](https://www.mostlymetrics.com/p/servicetitan-ipo-s1-breakdown)
- Toast Q3'25 fintech/subscription gross profit, Toast Capital, GPV — [Toast 8-K Q3'25](https://www.sec.gov/Archives/edgar/data/0001650164/000165016425000334/tost-20250930xexhibit991.htm) · [TipRanks earnings call](https://www.tipranks.com/news/company-announcements/toast-inc-earnings-call-highlights-profitable-scaling)
- Web-to-print software market size/CAGR — [Persistence (~$2.05B, 8.1%)](https://www.persistencemarketresearch.com/market-research/web-to-print-software-market.asp) · [openPR (9.4%)](https://www.openpr.com/news/4501185/web-to-print-software-market-size-accelerating-at-9-4-cagr) · [openPR (8.1% / $3.5B by 2033)](https://www.openpr.com/news/4492170/web-to-print-software-market-to-reach-us-3-529-2-mn-by-2033-at-8-1) · [The Insight Partners (~$1.905B 2026)](https://www.theinsightpartners.com/reports/web-to-print-software-market)
- Internal: `PAYMENTS_BILLING_FINANCIAL_CORRECTNESS` audit (project memory) · `PLATFORM_GAP_ASSESSMENT_2026-06-07.md` · `PRICING_RETENTION_REFERRALS_STRATEGY_2026-06-15.md` · `ACQUISITION_CHANNELS_2026-06-15.md` · `CONVERSION_FUNNEL_RESEARCH_2026-06-15.md`
