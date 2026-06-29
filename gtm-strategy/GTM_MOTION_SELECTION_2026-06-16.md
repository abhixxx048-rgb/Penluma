# GTM Motion Selection - Matching Motion to ACV and Buyer

> **Date:** 2026-06-16
> **Topic:** Which *go-to-market motion* (self-serve PLG / inside sales / field / channel) Print-Flow-360 should run, decided by matching motion economics to the price point (ACV) and the buyer in the print vertical.
> **Method:** Framework grounded in its canonical sources (Christoph Janz's "Five Ways to Build a $100M Business" and a16z's sales-threshold work), verified against 2025–2026 practitioner cost data, then applied concretely to Print-Flow-360's real segments, features, and channels. Every load-bearing number is sourced inline; placeholder ACVs are flagged as such.
> **Sibling docs (this set, all `readme/*_2026-06-16.md`):** read alongside the acquisition-channel, conversion-funnel, pricing/retention/referral, and positioning docs. Where the others answer *which channels* and *how the funnel converts*, this one answers *what selling motion the company is structurally allowed to run at its price point.*

---

## TL;DR - the decisive call

**Run a clean two-motion hybrid, cleanly segmented by buyer - never blended on the same customer.**
1. **Self-serve, product-led (PLG)** owns the *Rabbits*: solo and growing print shops at low ACV. No human in the loop below ~$2K ACV; the product and an in-app go-live checklist must absorb 100% of onboarding.
2. **Founder-led sales** owns the *Deer*: multi-location / B2B / franchise-HQ accounts at higher ACV, where a buying committee and pay-on-account justify a human.
3. **No paid search, no SDR/AE hire, no field sales** at today's price points - the unit economics forbid them ([a16z](https://a16z.com/the-20m-to-500m-question-adding-top-down-sales/): you need ~**$5,000 ARPA** before an inside-sales team can even pay for itself, and only the multi-location/B2B/franchise tier clears that line).
4. **Trade/wholesale printers are a *channel input*, not a self-serve customer; franchise/multi-unit brands (Minuteman Press, Sir Speedy, AlphaGraphics) are the one true founder-led-toward-field, multi-stakeholder sale and the only plausible >$15K ACV logo.**

The single existential risk to the whole plan is named explicitly in §7: **a print storefront may be too configuration-heavy (catalog + print options + pricing engine + designer + payment gateway) for a non-technical owner to truly self-onboard.** If that proves true, the business is forced into low-touch onboarding for *everyone*, which breaks sub-$2K self-serve economics - a strategic fork this doc names but cannot yet resolve.

---

## 1. The framework, explained (and why it is the right lens)

GTM-motion selection is not a matter of taste; it is arithmetic. Two canonical pieces define the arithmetic.

### 1.1 Janz's "Five Ways to Build a $100M Business" - ACV dictates how many customers you must reach, which dictates the motion

Christoph Janz's [*Five Ways to Build a $100 Million Business*](https://medium.com/point-nine-news/five-ways-to-build-a-100-million-business-82ac6ea8ffd9) (Point Nine, 2014; [five-years-later update](https://medium.com/point-nine-news/five-years-later-five-ways-to-build-a-100-million-saas-business-49ebca14825c), 2019) frames the whole question with a hunting metaphor. To reach $100M ARR you can hunt any one of five animal sizes, each defined by annual revenue per account (ARPA):

| Animal | ARPA (per year) | Customers needed for $100M | Required motion |
|---|---|---|---|
| **Elephants** | $100K+ | ~1,000 | Field sales, named accounts, long cycles |
| **Deer** | $10K+ | ~10,000 | Inside sales / sales-assisted |
| **Rabbits** | $1K+ | ~100,000 | Self-serve, low-touch, marketing-driven |
| **Mice** | $100+ | ~1,000,000 | Pure self-serve, viral, freemium |
| **Flies** | $10+ | ~10,000,000 | Massive-scale consumer / ad-monetized |

The strategic point - verified against Janz's own text - is **not** "pick the biggest animal." It is: **you can succeed hunting Rabbits *or* Deer, but you must commit your motion to ONE, because you cannot catch all of them with one apparatus.** Janz's named failure mode is *"hunting deer from an ACV perspective but with elephant-type effort"* - i.e. spending field-sales money to land mid-market logos. The motion (cost, touch, cycle) must match the animal (ARPA), or the math never closes. Janz's own illustrative Rabbit model (≈$2,700 LTV, therefore a max sustainable cost-per-signup of ≈$67.50) is a useful *shape* to reason with, but it is **Janz's illustrative number, not a Print-Flow-360-derived figure** - do not blend it with our own LTV math (§3) as if they were the same measurement.

This is why a *hybrid* is only legitimate if the two motions are **cleanly segmented onto different animals** (self-serve = Rabbits, founder-led = Deer/franchise), never layered onto the same customer. A blended motion on one buyer is exactly the "deer-with-elephant-effort" anti-pattern.

### 1.2 a16z - the ARPA floor below which a human sales motion cannot pay for itself

a16z's [*The "$20M to $500M" Question: Adding Top-Down Sales*](https://a16z.com/the-20m-to-500m-question-adding-top-down-sales/) and the companion [SaaS Go-to-Upmarket podcast](https://a16z.com/2020/05/29/a16z-podcast-saas-go-to-upmarket/) establish the threshold that governs motion choice from below: **~$5,000 ARPA is roughly the minimum price point needed to sell to SMBs with an inside-sales team and still have the price cover outbound costs and conversion.** Below that, a human-touch acquisition motion loses money on every deal; the only economically viable acquisition is product-led/self-serve, where the marginal cost of acquiring a customer trends toward zero. This is the hard floor the entire Print-Flow-360 mapping rests on.

### 1.3 What a human motion actually costs in 2025–2026 (the "can you afford a human?" math)

To decide *can we afford a human at this ACV*, you need real loaded costs. Verified 2025–2026 figures:

- **A fully-loaded SDR costs ~$100K–$170K/yr (mid ~$130K), i.e. ~$9.8K–$14.2K/mo per productive rep** - roughly 1.7–2.5× base salary once benefits, tooling, management overhead, recruiting, and ramp loss are included ([SalesHive, *True Cost of an SDR*, 2025](https://saleshive.com/blog/true-cost-sdr-sales-development-rep/); [Martal 2025 SDR Salary Guide](https://martal.ca/sdr-salary-lb/)). *(This corrects an earlier internal figure of "~$90K–$100K," which both understated the cost and contradicted its own "$8K–$15K/mo" range. Using the higher, correct number actually strengthens the "you can't afford a human below $X ACV" argument.)*
- **A mid-market Account Executive runs ~$90K median base / ~$180K median OTE**, with a median annual ACV quota of ~$800K and a quota-to-OTE ratio of ~4.2× ([RepVue Mid-Market AE](https://www.repvue.com/salaries/mid-market-account-executive); [Bridge Group / Everstage 2024 SaaS AE benchmarks](https://www.everstage.com/sales-compensation/saas-sales-compensation-benchmarks)). Applying the same 1.4–1.7× loading used for SDRs to a ~$180K OTE puts a **fully-loaded mid-market AE in the ~$250K–$300K/yr range, and such a rep typically must generate ~$800K–$1M in ARR to be viable** (~$2M for $100K+ ACV/Elephant motions). *(The precise loaded-AE figure varies by source; the safe, defensible statement is "a fully-loaded mid-market AE needs ~$800K–$1M ARR/rep" - that quota-per-rep number is well-corroborated; treat any single point-estimate of the loaded cost as directional.)*

**Implication for Print-Flow-360:** at low-ACV print-shop price points (see §3), a single AE would need to close *hundreds* of accounts a year to cover their own cost - impossible at the touch a real sale requires. Even an SDR at ~$130K/yr cannot be repaid by sub-$2K customers. The math is unambiguous: **humans are only affordable on the highest tier.**

---

## 2. ⚠️ Caveat banner - the ACV tiers below are reasoned placeholders, not validated prices

**Every ACV figure in §3 onward is a reasoned placeholder pending real pricing/packaging work** (which lives in the pricing sibling doc and `GOAL.md` Phase 1e - subscription tiers are not yet shipped). They are internally consistent and grounded in the print-SMB willingness-to-pay range, but they are **not validated by sales data.** Accordingly, this doc deliberately states segment economics as **directional ranges, not precise mixes.** Where an earlier draft claimed false-precision figures ("60–70% of paid shops will land in the Growing tier," "160–200 accounts per rep"), those have been stripped to directional language. Re-run the §3 mapping once real pricing exists.

---

## 3. Applying the framework to Print-Flow-360's real segments

The vertical has **five** economically distinct buyers - not three. The earlier draft's Solo / Growing / Multi-location segmentation missed two that *change the motion*: franchise/HQ brands (the one true field-adjacent sale) and trade/wholesale printers (a channel input, not a customer).

| # | Segment | Who they are | Placeholder ACV | Janz animal | Motion |
|---|---|---|---|---|---|
| 1 | **Solo shop** | One owner, screen-print/sign/copy/POD; little or no website | ~$29–49/mo → **~$350–600/yr** | Rabbit | **Pure self-serve (PLG)** |
| 2 | **Growing shop** | 2–10 staff, real order volume, wants a branded storefront + designer | ~$79–149/mo → **~$950–1,800/yr** | Rabbit (upper) | **Self-serve, PLG-led; sales-assist only on explicit ask** |
| 3 | **Multi-location / B2B** | Pay-on-account, departments, credit ledger, multiple storefronts/brands | ~$199–399/mo → **~$2,400–4,800/yr** | Deer | **Founder-led / sales-assisted** (clears the ~$5K-adjacent line) |
| 4 | **Franchise / multi-unit brand HQ** | Minuteman Press, Sir Speedy, AlphaGraphics-type corporate procurement; buys for many units | **>$15K/yr** (committee deal, custom) | Deer→Elephant edge | **Founder-led-toward-field; the ONE multi-stakeholder sale** |
| 5 | **Trade / wholesale printer** | Resells print *capacity* to other shops | n/a as a SaaS seat | - | **CHANNEL INPUT, not a self-serve customer** (see §5) |

### 3.1 Segments 1–2 (Solo & Growing shops) → Rabbits → self-serve PLG

These are the volume of the market. The [acquisition-channels doc](./ACQUISITION_CHANNELS_2026-06-15.md) enumerates ~50K–55K US print businesses, ~54% single-owner - a Rabbit population by definition. At ~$350–1,800/yr ACV they sit far below a16z's ~$5K human-sales floor, so **the only motion the math permits is self-serve.** This aligns exactly with the [conversion-funnel doc](./CONVERSION_FUNNEL_RESEARCH_2026-06-15.md)'s North Star - *store live + first order within 7 days* - which is a self-serve activation event by construction. The product, demo data, and the ≤5-step go-live checklist must do all the onboarding work; a human cannot be in this loop and still make money.

A Growing-shop LTV is *directionally* in the low-four-figures (e.g. ~$1,200–1,800/yr × a 2–3 yr SMB life ≈ ~$2,000–$4,000 LTV at SMB net-revenue-retention <100%) - comfortably PLG-shaped, and **this is our own placeholder math, kept separate from Janz's ≈$2,700 illustrative Rabbit LTV** (§1.1) to avoid double-counting.

### 3.2 Segment 3 (Multi-location / B2B) → Deer → founder-led sales-assist

This is the only *self-serve-originated* tier that clears (or approaches) a16z's ~$5K human-affordability line. The platform already has the depth this buyer needs - `CompanyAccount`, `CreditAccount` + append-only `CreditLedgerEntry`, `CompanyPricingResolver`, B2B order approvals, departments (per [`PLATFORM_GAP_ASSESSMENT`](./PLATFORM_GAP_ASSESSMENT_2026-06-07.md) §2 and `readme/B2B_MODULE.md`). The motion is **founder-led sales-assist, not a hired AE**: a warm PLG signup that trips a "company account / multiple locations / pay-on-account requested" signal gets a human (the founder) to close - exactly the [conversion-funnel doc](./CONVERSION_FUNNEL_RESEARCH_2026-06-15.md)'s "light sales-assist for larger/B2B accounts only." Do **not** hire an SDR/AE for this - at ~$2.4K–4.8K ACV a single $130K SDR or ~$250K–$300K AE cannot be repaid (§1.3).

### 3.3 Segment 4 (Franchise / multi-unit HQ) → the one true field-adjacent sale

This is the segment the earlier draft missed entirely and the **only plausible >$15K-ACV logo.** Franchise systems (Minuteman Press ~900+ locations, Sir Speedy / PIP under Franchise Services / MBE, AlphaGraphics under MBE Worldwide) buy through a **corporate-HQ procurement function with a real buying committee** (procurement + marketing + franchise-operations + IT). That committee, the multi-unit rollout, and the contract value make this the **one genuine "founder-led-toward-field" multi-stakeholder sale** in the vertical - long cycle, custom pricing, reference-dependent. It is a Deer edging toward Elephant. **But it is explicitly deferred:** it requires reference customers, a track record, and multi-location maturity the platform is still completing - pursue it *only after* the self-serve motion has produced reference logos, mirroring the partnership-timing logic in the acquisition-channels doc.

### 3.4 Segment 5 (Trade / wholesale printers) → not a customer; a channel

Trade printers sell *capacity* to other shops; they are not a per-seat SaaS buyer. They are a **channel input** - the natural reseller/OEM analog to the OnPrintShop × Ricoh model the acquisition-channels doc identifies. See §5.

---

## 4. The competitor-displacement reality - almost every customer is a *switcher*

A motion decision in a mature vertical must reckon with one fact the earlier draft under-specified: **Print-Flow-360 is not selling software to first-time adopters; nearly every paying customer is switching FROM an incumbent** - InkSoft, DecoNetwork, OnPrintShop, DesignNBuy, Aleyant Pressero, Printavo. This is a *displacement motion*, and it changes two things:

1. **BOFU comparison SEO is not optional, it is the motion's spine.** "[Incumbent] alternatives," "DecoNetwork vs InkSoft vs Print-Flow-360," "web-to-print software comparison" - these are where switchers are. The acquisition-channels doc already ranks this as the SECONDARY bet; the motion lens elevates *why*: in a switcher market, intercepting the switch is the cheapest, highest-intent acquisition there is.
2. **A "we migrate your catalog free" concierge is a real human cost that pressures the "no human under $2K ACV" rule.** Catalog + pricing-rule + theme migration off an incumbent is exactly the kind of hand-holding a non-technical owner needs to switch - and exactly the kind of human touch the Rabbit economics forbid.

**Resolution (decisive):** keep migration **product-led, not human-led.** Build a **catalog/product import tool** (CSV / structured import; later, scrapers for the top 2–3 incumbents) so the *switch itself is a self-serve action inside the go-live checklist*, not a services engagement. Reserve human migration help for **Segment 3+ only**, where the ACV can absorb it. A free *human* migration concierge for sub-$2K Rabbits **would break the self-serve economics** - so it must be a feature, not a service, for those tiers. This is the same discipline the conversion-funnel doc applies to onboarding: the product absorbs the work; humans are reserved for high-ACV.

---

## 5. The channel motion - trade printers, resellers, and equipment dealers

Channel is a *third* motion, distinct from self-serve and founder-led, and it maps to Segments 4–5 and the print vertical's dense intermediary layer:

- **Trade/wholesale printers** (Segment 5) and **regional equipment dealers / paper distributors** can resell Print-Flow-360 to the shops they already serve - the OnPrintShop × Ricoh playbook (2,000+ PSPs via Ricoh dealer distribution since 2011) the acquisition-channels doc documents.
- **This is a "test later" motion, not an early bet** - it is a 6–18-month BD play that *requires reference customers first*. Sequencing matches the acquisition-channels doc: earn 10–20 reference stores via self-serve + founder-led, then approach ONE regional dealer.
- A tasteful **"Powered by Print-Flow-360" footer** on free/low-tier storefronts is the near-zero-cost viral seed that feeds the self-serve motion in the meantime.

---

## 6. The order-to-production spine is table stakes for the self-serve North Star - do NOT tier it by ACV

The earlier draft contained a self-contradiction: it said to close the order-to-production spine gaps (carrier/tracking, preflight/CMYK, destination tax) for higher-ACV buyers, *then* said "for small shops the spine matters less." **That is wrong and it contradicts the North Star.**

Preflight/print-ready validation, shipping/tracking, and a clean paid→shipped path are **core to ANY shop fulfilling a real order.** A solo shop that can't get a print-ready file, can't compute the right tax, or can't ship an order experiences a *broken product* just as much as a franchise does. The [conversion-funnel doc](./CONVERSION_FUNNEL_RESEARCH_2026-06-15.md)'s North Star - **store live + first order within 7 days** - *requires the spine to work for the smallest self-serve shop*, because the "first order" must actually be fulfillable. The [`PLATFORM_GAP_ASSESSMENT`](./PLATFORM_GAP_ASSESSMENT_2026-06-07.md) (§3, and `GOAL.md` 2026-06-11 log) confirms the spine breaks today in exactly the places that block a first real order: no carrier/tracking auto-population, no preflight/CMYK, single-rate tax, no stock reservation, no partial fulfillment.

**Re-scoped conclusion:**
- **Spine completeness gates self-serve viability for ALL tiers.** It is not a higher-ACV nicety; it is the precondition for the self-serve North Star. (Encouragingly, the gap assessment found much of it is *dormant-but-built* - EasyPost driver, `runPreflight()`, CMYK `processImageForPrint()` exist and need wiring, not greenfield.)
- **The B2B-specific extras are the sales-assist add-on:** credit ledgers, multi-location storefronts, departments, partial fulfillment at scale, split shipments. *These* tier by ACV and belong to Segments 3–4.

---

## 7. The existential risk to a PLG-primary motion (top open question)

A PLG-primary motion has one falsifiable, business-ending assumption that must be named:

> **Is "get my print store live + take a first order" genuinely self-completable by a non-technical owner in one sitting - or does catalog + print-options + pricing-engine + payment-gateway setup inherently require assisted onboarding?**

A print storefront is *configuration-heavy by nature*: product types with print options and sizes, a pricing engine (the platform has 7 strategies, per the gap assessment), a Fabric.js designer, and a live payment gateway. The conversion-funnel doc asserts "the product must absorb the hand-holding," but it never flags the risk that **the job-to-be-done may simply be too complex to self-serve, no matter how good the checklist is.** This is THE existential risk to the whole motion:

- **If self-onboarding works** (defaults + demo data + ≤5-step checklist genuinely get a non-technical owner live in one session), the sub-$2K self-serve economics hold and the hybrid in the TL;DR is correct.
- **If it does NOT work** - if catalog/pricing/gateway setup *inherently* needs a human - then the business is forced into **low-touch onboarding for everyone**, which **breaks the sub-$2K Rabbit economics** (you cannot put a $130K SDR or even a part-time onboarder against $350–1,800/yr customers and survive). That fork would push the company *upmarket* (raise prices, shrink the addressable Rabbit population, lean on Segments 3–4) - a fundamentally different company than the one this plan describes.

**This must be validated empirically before scaling spend on the self-serve motion.** The test is concrete and cheap: put 10–20 *real, non-technical* print-shop owners (ideally from the founder-led outreach cohort) through unaided go-live and measure the activation rate against the North Star (store live + first order, unassisted). If unaided activation is healthy, proceed; if it collapses without a human, the fork above is live and pricing/segmentation must be revisited.

---

## 8. The trial model is *settled*, not an open question (resolving the prior draft's hanging A/B)

An earlier draft left "card-required vs no-card" as an undecided A/B test. **The framework resolves it; it is not open.** Verified benchmarks:

- **Opt-in (no card):** median ~14%, range ~8–22% (as low as ~8.9% in ChartMogul's 2026 cut) trial→paid; **attracts ~3–4× more signups** ([thecfoclub](https://thecfoclub.com/operational-finance/free-to-paid-conversion-strategy/); ChartMogul 2026).
- **Opt-out (card required):** median ~44%, range ~35–55% (some sources 49–60%) trial→paid, but **cuts signups by 30–50%.**
- **The cited guidance is explicit:** *unknown brands building awareness should skip the credit card; established brands with word-of-mouth flywheels should require it.*

**Print-Flow-360 is an unknown brand with no word-of-mouth flywheel yet.** Therefore **no-card is the framework-correct call** - not a coin-flip A/B. Critically for *this* doc: the **~3–4× higher signup volume from no-card is exactly the fuel a Rabbit (self-serve, high-volume) motion needs** - it maximizes the top of the funnel that Janz's Rabbit math depends on. This locks in the conversion-funnel doc's **no-card 14-day reverse trial** recommendation and explains it through the motion lens: no-card isn't just higher net conversions, it's the volume engine the Rabbit motion is built on.

---

## 9. RECOMMENDATION (decisive)

1. **Commit to a two-motion hybrid, cleanly segmented - never blended on one customer.**
   - **Self-serve PLG owns Rabbits (Segments 1–2, ~$350–1,800/yr).** No human below ~$2K ACV. Product + demo data + ≤5-step go-live checklist do all onboarding.
   - **Founder-led sales-assist owns Deer (Segment 3, ~$2.4K–4.8K ACV).** Triggered by a PLG signal (company account / multi-location / pay-on-account). The *founder* closes - **do not hire an SDR or AE.**
2. **Do NOT hire a sales team at current ACVs.** An SDR (~$130K loaded) cannot be repaid by sub-$2K customers; a mid-market AE (~$250K–$300K loaded, needing ~$800K–$1M ARR/rep) is even further out of reach. Only Segment 3+ approaches a16z's ~$5K human-affordability floor, and even there the founder is the seller until volume justifies a first hire.
3. **Do NOT run paid search as a motion.** Confirmed in the acquisition-channels doc: thin niche volume + $8–14+ CPCs + low ACV = CAC can exceed first-year revenue. Brand/competitor-term defense only, much later.
4. **Treat competitor displacement as the primary acquisition reality.** Lead with BOFU comparison SEO + a *product-led* catalog import tool so switching is self-serve. Reserve *human* migration help for Segment 3+; a free human migration concierge for Rabbits breaks the economics.
5. **Defer the channel motion** (trade printers / equipment dealers / franchise HQ) until 10–20 reference stores exist - then approach ONE regional dealer and begin the franchise-HQ committee sale. Run a "Powered by Print-Flow-360" footer now as the free viral seed.
6. **Pursue the franchise/multi-unit HQ segment as the single field-adjacent sale - later.** It is the only plausible >$15K-ACV logo and the only true multi-stakeholder/committee deal; it needs references first.
7. **Lock the no-card 14-day reverse trial.** It is framework-settled (unknown brand → skip the card) and its ~3–4× signup volume is the fuel the Rabbit motion requires - not an open A/B.
8. **Finish the order-to-production spine for ALL tiers as a self-serve precondition** - preflight/CMYK → stock reservation → carrier/tracking → destination tax. It gates the North Star for the smallest shop; only the B2B extras (credit ledger, multi-location, split shipments) tier by ACV.
9. **Validate the self-onboarding assumption before scaling.** Run 10–20 real non-technical owners through unaided go-live; if activation collapses without a human, the sub-$2K economics fork is live and pricing/segmentation must be revisited *before* spending on the self-serve motion.

---

## 10. Sequencing checklist (actionable)

**Now (0–4 weeks)**
- [ ] Ship 3-tier self-serve pricing with the *placeholder* ACVs in §3 wired (`GOAL.md` Phase 1e) - then replace placeholders with real numbers as data arrives.
- [ ] Lock the **no-card 14-day reverse trial** (conversion-funnel doc §3/§6).
- [ ] Instrument the activation funnel so unaided go-live rate is measurable (`store_published` + `first_order_received`).
- [ ] Define the **PLG→founder-led handoff signal** (company-account / multi-location / pay-on-account flag trips a founder alert).

**Validate the existential assumption (parallel, 2–6 weeks)**
- [ ] Run **10–20 real non-technical owners** through unaided go-live; measure activation vs the North Star. **Gate further self-serve spend on the result (§7).**

**Build the displacement motion (4–10 weeks)**
- [ ] Ship a **product-led catalog import tool** (CSV/structured) so switching is self-serve; later add importers for the top 2–3 incumbents.
- [ ] Publish the BOFU comparison/alternatives pages the acquisition-channels doc front-loads.

**Finish the spine (continuous, gates self-serve viability)**
- [ ] Wire the dormant-but-built spine: `runPreflight()` / CMYK output → stock reservation → EasyPost carrier + tracking → destination tax (gap-assessment §3–§7). **Not tiered by ACV.**

**Later (after 10–20 reference stores)**
- [ ] Open the **founder-led B2B sales-assist** motion in earnest (Segment 3); only consider a first SDR once repeatable volume clears ~$5K-adjacent economics.
- [ ] Approach ONE regional equipment dealer / trade printer (channel motion); begin the **franchise-HQ committee sale** (Segment 4).
- [ ] Add the "Powered by Print-Flow-360" footer as the free viral loop.

**Re-run quarterly:** re-map §3 with *real* ACVs; re-check which segment, if any, has crossed the ~$5K human-affordability line for a true hire.

---

## 11. How this doc relates to its siblings

- **Acquisition channels** (`ACQUISITION_CHANNELS_2026-06-15.md`) answers *which channels* feed the motion (founder-led outreach + communities primary; BOFU SEO + free tool secondary; skip paid). This doc answers *what motion the channels feed into* and *why no human below ~$5K ACV*.
- **Conversion funnel** (`CONVERSION_FUNNEL_RESEARCH_2026-06-15.md`) answers *how the self-serve funnel converts* (no-card reverse trial, North Star = store live + first order in 7d, ≤5-step checklist). This doc *grounds those choices in motion economics* and elevates the spine + self-onboarding risk as motion-defining.
- **Pricing / retention / referrals** (`PRICING_RETENTION_REFERRALS_STRATEGY_2026-06-15.md`) must supply the *real* ACVs that replace §2's placeholders.
- **Platform gap assessment** (`PLATFORM_GAP_ASSESSMENT_2026-06-07.md`) supplies the spine reality §6 depends on.

---

## Sources

- Christoph Janz - *Five Ways to Build a $100 Million Business* (Point Nine, 2014): https://medium.com/point-nine-news/five-ways-to-build-a-100-million-business-82ac6ea8ffd9
- Christoph Janz - *Five Years Later: Five Ways to Build a $100M SaaS Business* (2019): https://medium.com/point-nine-news/five-years-later-five-ways-to-build-a-100-million-saas-business-49ebca14825c
- a16z - *The "$20M to $500M" Question: Adding Top-Down Sales*: https://a16z.com/the-20m-to-500m-question-adding-top-down-sales/
- a16z - *SaaS Go-to-Upmarket* (podcast, the ~$5K ARPA inside-sales floor): https://a16z.com/2020/05/29/a16z-podcast-saas-go-to-upmarket/
- SalesHive - *The True Cost of an SDR* (2025, fully-loaded $100K–$170K, mid ~$130K, $9.8K–$14.2K/mo): https://saleshive.com/blog/true-cost-sdr-sales-development-rep/
- Martal - *2025 SDR Salary Guide* (in-house SDR fully-loaded $110K–$150K): https://martal.ca/sdr-salary-lb/
- RepVue - *Mid-Market Account Executive Salary* (~$90K base / ~$180K OTE median): https://www.repvue.com/salaries/mid-market-account-executive
- Everstage / Bridge Group - *SaaS Sales Compensation Benchmarks 2024* (~$800K median AE quota, ~4.2× quota-to-OTE): https://www.everstage.com/sales-compensation/saas-sales-compensation-benchmarks
- The CFO Club - *Free-to-Paid Conversion Strategy* (no-card 2–5× signups; opt-in vs opt-out conversion bands; unknown-brand guidance): https://thecfoclub.com/operational-finance/free-to-paid-conversion-strategy/
- ChartMogul - *SaaS Conversion Report* (2026 free-to-paid medians, no-card as low as ~8.9%): https://chartmogul.com/reports/saas-conversion-report/

---

*Prepared 2026-06-16 as part of the GTM strategy set. Framework verified against canonical sources; all human-motion cost figures verified against 2025–2026 practitioner data; ACV tiers are flagged placeholders pending real pricing. Treat segment economics as directional until validated on our own funnel.*
