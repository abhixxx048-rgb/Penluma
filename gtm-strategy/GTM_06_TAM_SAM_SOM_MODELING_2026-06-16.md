# How big is the prize, really - TAM / SAM / SOM market sizing for Print-Flow-360

## Why this matters first

At pre-PMF, market sizing is the one piece of "research" that feels like it's *for investors* and not for you - which is exactly the trap. The number on the pitch slide is the least useful output. The useful output is the **bottom-up model underneath it**: the count of print shops you can actually reach, the price they'll actually pay, and the share your *current GTM capacity* can actually win in 18 months. Built right, that model tells you whether founder-led outreach to small print shops is a $2M-ARR hobby or a $50M business, whether you need to add geographies or just go deeper in one, and how many doors you must knock on this quarter to hit plan. Built wrong - "the print market is $26B, we'll get 1%" - it tells you nothing, and any investor who's seen a deck before will know in ten seconds that you haven't done the work. Get the math right once, reuse the spreadsheet forever.

## TL;DR - Key Recommendations

- **Lead with bottom-up, use top-down only as a sanity check.** Your defensible number is `# of reachable small print/sign shops × Print-Flow-360 ACV`. The "$26B web-to-print market" headline is a backdrop, not your TAM.
- **Your real ACV is roughly $1,400–$2,400/year per shop, not the sticker price.** Derive it from your tier pricing with realistic blended-tier and discount assumptions (worked below), then build everything on *that* number - not the top-of-page monthly price.
- **SAM is gated hard by three filters that are non-negotiable today:** Stripe/Razorpay payment regions, English-first onboarding, and "small non-technical shop, not an enterprise MIS buyer." Apply all three explicitly; each one shrinks the number and each one is *honest*.
- **Build SOM from capacity, never from a percentage.** A founder-led motion that can run ~15 real demos/week at a ~22% close rate, net of churn, caps your obtainable customers far below "1% of SAM." Show that math; it's what separates a credible deck from a fantasy one.
- **Anchor counts to real, citable sources:** US Census County Business Patterns / NAICS 323 (≈21,400 US printing establishments in 2023, 71% with 1–9 staff per WhatTheyThink/Census CBP), IBISWorld for AU (≈4,290 in 2023), ONS/BPIF for the UK. India (Razorpay) is your biggest *upside* but your *softest* data - label it an assumption, not a fact.
- **Present three numbers, not one.** Always ship a low/base/high sensitivity table. A single "magic figure" reads as guessing; a range with visible assumptions reads as rigor.
- **Use the model two ways:** investor-facing (TAM = "the prize is big," credible bottom-up SAM, conservative SOM) and internal-facing (SOM = your 18-month revenue plan, with the assumptions register as your live planning dashboard).

> **Numbers in this doc are directional and illustrative.** Hard counts (US/AU/UK establishment numbers, the web-to-print software market band) are sourced and cited in §6. Everything else - ACV, fit percentages, India, close rate, churn - is a labelled **assumption** you must replace with your own data. The deliverable is the *model and its sources*, never a single magic figure.

---

## 1. What TAM / SAM / SOM actually are - and what they are not

These three are **nested concentric circles**, biggest to smallest, and the rule is absolute: **TAM ⊃ SAM ⊃ SOM.** Each is an *annual revenue* figure (dollars/year), not a count of companies and not a lifetime value.

| Term | Plain-language meaning | The question it answers | For Print-Flow-360 |
|------|------------------------|-------------------------|--------------------|
| **TAM** - Total Addressable Market | Total annual revenue *if you sold to 100%* of everyone who could conceivably use this kind of product, everywhere, ignoring competition and your own limits | "Is the prize big enough to build a company / raise money around?" | All small print/sign shops worldwide that could use a web-to-print storefront + design studio |
| **SAM** - Serviceable Available Market | The slice of TAM you can *actually serve* given your product, languages, payment rails, and segment focus - still ignoring competition | "Of that prize, how much is even reachable by *this* product as it exists?" | Small, non-technical print/sign shops in Stripe/Razorpay regions, English-first, that aren't enterprise MIS buyers |
| **SOM** - Serviceable Obtainable Market | The slice of SAM you can *realistically win* in a defined time window given your GTM capacity, sales motion, churn, and competition | "How much can *we, specifically, with our team and channels,* capture in 12–18 months?" | The shops founder-led outreach + the channels in `ACQUISITION_CHANNELS_2026-06-15.md` can actually reach and close, net of churn |

**Three things people get wrong:**

1. **TAM/SAM/SOM is investment math, not a targeting tool.** It tells investors (and you) whether the opportunity justifies the effort and capital. It does *not* tell your sales team who to call Monday - that's your **ICP** (see `GTM_01_ICP_AND_POSITIONING_2026-06-15.md`). Your ICP - "Maria, the non-technical local print/sign-shop owner" - is the high-fit *core* inside SAM/SOM. Don't conflate "who we could bill" with "who we should chase first."
2. **They are revenue, consistently per-year.** Mixing a one-time number into an annual one (or LTV into ACV) silently inflates everything downstream. Pick *annual recurring revenue* and stay there.
3. **The single number is the least important thing.** The math, the sources, and the assumptions are the deliverable. A defensible $41M SAM with a visible model beats a confident $4B TAM with no math.

> One more circle you'll sometimes see: **PAM (Potential Addressable Market)** - TAM *plus* adjacent markets you could expand into later (e.g., print-on-demand merch sellers, sign-only shops, in-plant/corporate print departments). Useful for the "where this goes in 5 years" slide; keep it clearly separate from today's TAM so you're not caught padding the core number.

---

## 2. Method 1 - Top-down (industry report × filters), and why it's a sanity check, not your headline

**What it is:** Start from a big published market figure and multiply it down by filter percentages until you reach your slice.

```
Top-down SAM = Published market size
             × % in your geographies
             × % in your segment (size/type of shop)
             × % addressable by your product
```

**The credibility problem.** Top-down numbers come from research firms whose definitions vary wildly and whose methods you can't inspect. Look at the spread for "web-to-print" that surfaces in minutes of searching (all figures as published by each firm - see §6 for links):

| Source framing | Stated size | Stated CAGR | What it actually measures |
|----------------|--------------|------|---------------------------|
| Web-to-print **software** (Verified Market Research) | ~$1.19B (2024) | 7.8% | SaaS/software licenses only |
| Web-to-print **software** (market.us) | (software-only) | 7.8% | Software only |
| Web-to-print **software** (Market Growth Reports) | ~$1.47B (2024) | ~7.4% | Software only |
| Web-to-print **market** (Mordor Intelligence) | ~$26.6B (2025) | ~5.7% | Includes print *services*, not just software |
| Web-to-print **software** (Prophecy Market Insights) | ~$7.5B (2024) | ~15.7% | Broader services-leaning bundle |

The tight software-only numbers (~$1.1–1.5B) and the services-inclusive numbers (~$7.5–27B) differ by **roughly 20×** - same words, opposite worlds. If you put "$26B TAM" on a slide and your product is *software*, a sharp investor will ask whether you're counting the ink and paper. **You are.** That's the trap.

**How to use it correctly for Print-Flow-360:** Use the software-only figure (~$1.1–1.5B today, growing ~7–8%/yr) as your TAM *backdrop* and as a **cross-check** on your bottom-up TAM. If your bottom-up TAM lands wildly outside the published software market, one of you is wrong - go find out which. Never lead the deck with the $26B services number.

**Worked top-down sanity check (directional - every % is an assumption):**
```
Published W2P software market (global)         ≈ $1.3B / yr   (mid of $1.1–1.5B band)  [SOURCED band]
× share addressable by a non-technical,
  storefront+studio product (vs. enterprise
  MIS / heavy-prepress tools)         × ~45%  = $585M   [ASSUMPTION]
× share in Stripe/Razorpay English-first
  regions                             × ~55%  = $322M   [ASSUMPTION - this is our SAM-ish band]
```
Hold that **~$300–600M top-down SAM band** in your head. In §4 we'll build the *same* SAM bottom-up and check whether the two methods agree. (Spoiler: they should land in the same order of magnitude, and bottom-up should be a *fraction* of the top-down band. If bottom-up exceeds it, an assumption above is broken.)

---

## 3. Method 2 - Bottom-up (units × ACV), the method you actually present

**What it is, and why it wins.** You build up from things you can count and price:

```
Bottom-up TAM = (# of target accounts) × (Average Annual Contract Value)
```

This is the method serious investors want, because **every input is inspectable**: you can defend the shop count with a census source and defend the ACV with your own price list. There's no "trust the analyst" step. The full multiplication chain for a SaaS like ours looks like:

```
TAM  = Total # target accounts (everywhere)             × ACV
SAM  = (Total target accounts × geo% × segment% × payment% × language%) × ACV
SOM  = (SAM accounts × reachable-via-our-channels% × realistic close% × (1 − churn)) × ACV
```

Notice SOM filters on **accounts**, then multiplies by ACV - never start SOM as a flat "% of SAM dollars." The unit you can defend is *shops you can reach and close*.

### 3a. Deriving Print-Flow-360's ACV from tier pricing

You cannot do bottom-up without an ACV, and the sticker price is *not* the ACV. ACV = what an **average** customer pays per year, blended across tiers, after annual-billing discounts, and including the usage dimension (extra stores, order volume). Pricing methods live in `GTM_04_PRICING_RESEARCH_METHODS_2026-06-16.md`; here we just need a defensible blended figure.

Assume a 3-tier shape (illustrative until pricing research firms it up):

| Tier | Target shop | Sticker (mo) | Annual (≈17% annual-pay discount) | Assumed mix of paying base |
|------|-------------|-------------|------------------------------------------|----------------------------|
| **Starter** | 1–3 staff, single store | $49/mo | ~$490/yr | 45% |
| **Growth** | 4–10 staff, 1–2 stores, B2B portal | $129/mo | ~$1,290/yr | 40% |
| **Pro / Multi-store** | 10–30 staff, multi-store, accounts | $299/mo | ~$2,990/yr | 15% |

```
Blended ACV (subscription only)
 = 0.45 × $490  + 0.40 × $1,290 + 0.15 × $2,990
 = $220.50      + $516.00       + $448.50
 = $1,185 / yr

+ usage uplift (extra stores, order-volume overages, paid add-ons)
  assume avg +18% on top                = × 1.18
= $1,398 / yr  →  round to a BASE ACV of ~$1,400/yr
```

For sensitivity, carry three ACVs:

| Scenario | Logic | ACV |
|----------|-------|-----|
| **Low** | Mostly Starter, heavy discounting, little usage uplift | **$900** |
| **Base** | Mix above | **$1,400** |
| **High** | Up-market mix, more multi-store, healthy add-on attach | **$2,400** |

> Reality check the floor: at $1,400 ACV a print shop doing even $300K/yr in revenue is spending <0.5% of revenue - easily defensible as "pays for itself if it saves a few hours of rebuilt artwork a month." That's your pricing-credibility anchor.

### 3b. Counting the accounts - sourcing logic (label every step an assumption)

The count is where bottom-up earns or loses credibility. Source it from real, citable data and show the filtering.

> **NAICS note (get this right or you'll be challenged):** "Printing and related support activities" is **NAICS 323**; "Commercial Printing (except Screen and Books)" is **NAICS 323111**, a *subset*. Per Census County Business Patterns (via WhatTheyThink), NAICS 323 held **≈21,400 establishments in 2023** (down ~21% since 2010), and **NAICS 323111 ≈15,400 establishments** (2022). Use **323** for the broad "all printing" universe and treat 323111 as the commercial-printing core. Sign/banner/promo shops live partly outside 323 (NAICS 339950 sign manufacturing, plus retail listings), so they need a separate uplift - don't double-count.

**United States (Stripe region, English-first) - the most data-rich market.**
```
Total US printing establishments (NAICS 323, Census County Business Patterns 2023)
                                                              ≈ 21,400   [SOURCE: WhatTheyThink / US Census CBP]
× 71% with 1–9 employees (small shops - our beachhead)         × 0.71
                                                              ≈ 15,200   small printing establishments  [SOURCE: CBP size band]
+ sign/banner/promo & quick-print shops not captured in 323
  (NAICS 339950 + retail; ASSUMPTION: adds ~35%)               × 1.35
                                                              ≈ 20,500   small print/sign shops (US)   [PART ASSUMPTION]
× share that are storefront-needing & non-MIS (our ICP fit;
  ASSUMPTION ~75% - most small shops have no real web-to-print) × 0.75
                                                              ≈ 15,400   US target accounts   [ASSUMPTION on fit %]
```

**Other Stripe English-first markets (UK, Canada, Australia).**
```
UK printing enterprises  ≈ 8,000–10,000 (ONS SIC 18 business counts; BPIF reaches ~1,300 of the larger ones)  [SOURCE: ONS/BPIF - RANGE]
  small/storefront-fit (ASSUMPTION: ~75% of small-share)  ≈ 5,500   [ASSUMPTION]
Australia printing businesses ≈ 4,290 (IBISWorld, 2023; ≈4,286 in 2024)   [SOURCE: IBISWorld]
  small/storefront-fit ≈ 3,000   [ASSUMPTION]
Canada printing establishments ≈ 5,000–5,500 (StatCan business register, NAICS 3231 - directional)  [ASSUMPTION - verify StatCan]
  small/storefront-fit ≈ 3,800   [ASSUMPTION]
+ smaller English Stripe markets (Ireland, NZ, etc.)  ≈ 1,200   [ASSUMPTION]
```

**India (Razorpay region) - biggest upside, softest data.**
India has *no* clean public NAICS-equivalent count of small print/sign shops, and informal/unregistered shops dominate. Treat this as a labelled assumption with a wide band, never as a hard fact:
```
Small print/sign shops in India that are (a) digitally-payment-ready via Razorpay,
(b) English-comfortable for onboarding, (c) storefront-aspirational
  ASSUMPTION: 15,000 (low) – 40,000 (base) – 90,000 (high)   [ASSUMPTION - flag loudly]
```

**Roll-up of SAM account count (base case):**
```
US             15,400
UK              5,500
Australia       3,000
Canada          3,800
Other EN        1,200
India          40,000  (assumption-heavy; show with/without India)
                ------
SAM accounts ≈ 68,900  (with India)   |   ≈ 28,900  (ex-India, "hard-data" SAM)
```

That ex-India **~29,000** is your **conservative, well-sourced SAM count** - the one to defend line-by-line. India is the *upside* slide.

---

## 4. Putting it together - TAM, SAM, SOM with a worked model

### TAM (global, all small print/sign shops, base ACV)
To express TAM honestly, scale the SAM account base up to "all geographies, all small print/sign shops globally" (a much larger, fuzzier number). Directionally:
```
Global small print/sign shops (all geographies, all languages, all payment rails)
  ASSUMPTION: ~250,000 (the world has far more print shops than our 4–5 hard markets)  [ASSUMPTION]
TAM = 250,000 × $1,400 ACV = $350M / yr   [DIRECTIONAL]
```
**Cross-check against §2:** the published software-only W2P market is ~$1.1–1.5B and rising. A $350M bottom-up TAM for *small-shop* SaaS implies small shops are ~25–30% of all W2P software spend, with enterprise MIS taking the rest. That's plausible - so the bottom-up TAM and the top-down software figure sit in the **same order of magnitude**, which is the cross-check passing. If your bottom-up TAM had come out at $5B, you'd know an assumption was broken.

### SAM (our reachable segment, base)
```
SAM (ex-India)   = 28,900 accounts × $1,400 = $40.5M / yr
SAM (with India) = 68,900 accounts × $1,400 = $96.5M / yr
```
Both sit *inside* the ~$300–600M top-down SAM band from §2 - i.e., we are claiming a *fraction* of the addressable software spend, which is the correct, humble posture for SAM. (If your bottom-up SAM had *exceeded* the top-down band, you'd be claiming more than the whole reachable market - a red flag.)

### SOM (what *we* can win in 18 months) - built from capacity, not a percentage

This is the section that makes or breaks the deck. **Do not write "we'll get 2% of SAM."** Build it from the founder-led throughput in `ACQUISITION_CHANNELS_2026-06-15.md`.

```
GTM CAPACITY MODEL (18-month horizon, founder-led primary motion)

Demos / qualified conversations per week (founder-led, sustainable)   = 15
Working weeks in 18 months (78 wks × ~0.85 utilization)               ≈ 66
Total demos                                       = 15 × 66           = 990
× close rate (small, non-technical, one-person buying committee;
   ASSUMPTION 22%)                                × 0.22              ≈ 218 gross customers won (founder channel)
+ secondary channels (BOFU SEO + free design tool inbound;
   ASSUMPTION adds 35% on top of founder-led)     × 1.35              ≈ 294 gross customers (all channels)
− churn over the period (early-stage SaaS, ASSUMPTION ~30% logo churn
   across 18 mo)                                  × (1 − 0.30)        ≈ 206 net active customers
SOM (customers)                                                       ≈ 206 paying shops
SOM (revenue) = 206 × $1,400 ACV                                      ≈ $288K ARR
```

That's the **honest 18-month obtainable revenue** for a founder-led motion at base assumptions. As a share of SAM it's `206 / 28,900 ≈ 0.7%` - and notice you arrive at "<1% of SAM" *as an output of capacity math*, not as an input assumption. That ordering is the entire point. It also tells you the truth pre-PMF: your near-term constraint is **founder throughput and close rate**, not market size. The market is plenty big; you can't physically demo your way past ~$300K ARR solo, so the strategic questions become "raise close rate," "add a rep," or "shift weight to the inbound channels."

### Sensitivity table (always ship this - never a single number)

| Driver | Low | Base | High |
|--------|-----|------|------|
| ACV | $900 | $1,400 | $2,400 |
| SAM accounts (ex-India) | 22,000 | 29,000 | 36,000 |
| SAM accounts (with India) | 40,000 | 69,000 | 120,000 |
| Demos/week | 10 | 15 | 22 |
| Close rate | 15% | 22% | 30% |
| Secondary-channel uplift | +15% | +35% | +70% |
| 18-mo logo churn | 40% | 30% | 18% |

Working the SOM at each corner (holding utilization-adjusted weeks ≈ 66):

```
LOW   : 10×66 = 660 demos × 0.15 = 99 × 1.15 = 114 × (1−0.40) ≈ 68 logos × $900   ≈ $61K ARR
BASE  : 15×66 = 990 demos × 0.22 = 218 × 1.35 = 294 × (1−0.30) ≈ 206 logos × $1,400 ≈ $288K ARR
HIGH  : 22×66 = 1,452 demos × 0.30 = 436 × 1.70 = 741 × (1−0.18) ≈ 607 logos × $2,400 ≈ $1.46M ARR
```

| Output | Low | Base | High |
|--------|-----|------|------|
| TAM ($) | $158M | $350M | $720M |
| SAM ($, ex-India) | $19.8M | $40.6M | $86.4M |
| SAM ($, w/India) | $36.0M | $96.6M | $288M |
| SOM (net logos, 18 mo) | ~68 | ~206 | ~607 |
| SOM ($ ARR, 18 mo) | ~$61K | ~$288K | ~$1.46M |

> *TAM low/high use the low/high ACV against the 250k global base scaled ±45% for the count uncertainty; treat the TAM row as the loosest in the table.*

Read it as: **the market is not the risk; conversion and retention are.** SOM swings ~24× from low to high, driven almost entirely by close rate × churn × channel uplift × ACV, while SAM moves <2×. That's the founder's actual to-do list.

---

## 5. Method 3 - Value-theory (value-based) sizing, as a corroborating lens

**What it is:** Instead of "shops × price," you size the market by the **economic value your product creates**, then assume you can capture a slice of it via pricing. Formula:

```
Value-based TAM = (# of target accounts) × (Annual value created per account) × (Value-capture %)
```

**Why bother:** It's the strongest answer to "how do you know they'll pay?" and it pressure-tests your ACV from the *buyer's* side. If your price is a tiny fraction of value created, your ACV (and pricing) has headroom; if it's a big fraction, you'll meet resistance.

**Worked example for Print-Flow-360 - value created for one small shop (every line an assumption you'd validate in interviews, see `GTM_02`):**
```
Time saved rebuilding wrong-sized customer artwork
  (3 hrs/wk × 50 wks × $35/hr loaded)                        = $5,250/yr
Quote-turnaround speed → won jobs that would've gone cold
  (assume 1 extra $400 job/month × 12 × 40% margin)          = $1,920/yr
Reduced "unpaid designer" labor (self-serve studio)
  (2 hrs/wk × 50 × $35)                                      = $3,500/yr
After-hours online orders captured (younger customers)
  (assume +$500 revenue/mo × 12 × 40% margin)                = $2,400/yr
                                                       Total ≈ $13,070/yr value created per shop
```
```
Value-capture % (SaaS commonly captures ~10–25% of value created)
  At our $1,400 ACV:  $1,400 / $13,070 ≈ 11% capture
```
~11% capture is comfortably inside the healthy SaaS range - meaning **our base ACV is, if anything, conservative**, and pricing has upside (corroborates §3a's "pays for itself" framing). Apply that value-per-shop across the SAM account base for a value-theory SAM, and confirm it lands in the same ballpark as the units×ACV SAM. Three methods agreeing in order of magnitude is the strongest possible market-sizing claim you can make.

> **Watch the failure mode:** value-theory sizing is the easiest to inflate (every "hour saved" is a guess, and value-capture % is a lever you can crank). Use it to *corroborate* ACV, never as your headline TAM. If your value-capture % comes out <5%, your price is leaving money on the table; if it's >30%, you'll face pricing resistance - both are pricing signals for `GTM_04`, not sizing conclusions.

---

## 6. Sourcing your inputs credibly

| Input you need | Where to get it (best → acceptable) | Credibility note |
|----------------|--------------------------------------|------------------|
| US shop counts | US Census **County Business Patterns** / NAICS 323 (≈21.4k, 2023) and 323111 (≈15.4k); WhatTheyThink data series | Government source, citable, free; the gold standard |
| US shop-size split | Census CBP by employment band (71% are 1–9 staff, 2023) | Lets you isolate the *small* segment honestly |
| UK shop counts | **ONS** SIC 18 business counts; BPIF (reaches ~1,300 larger firms) | ONS is authoritative; BPIF undercounts small shops |
| Australia | **IBISWorld** "Printing in Australia" (≈4,290 businesses, 2023; ≈4,286 in 2024) | Paid but widely accepted by investors |
| Canada | **Statistics Canada** business register, NAICS 3231 | Verify the exact figure before citing |
| India (Razorpay) | MSME registrations, GST data, industry associations - **all partial** | Flag as assumption; never present as a hard count |
| Web-to-print software market | Verified MR / market.us / Market Growth Reports (~$1.1–1.5B software-only) | Use software-only, *not* the ~$26B Mordor services figure |
| Competitor customer counts | Competitor disclosures, Capterra/G2 review counts, Crunchbase, press | Review counts are a *floor* on customers, useful for cross-checks |
| ACV / pricing | Your own price list + pricing research (`GTM_04`) | The one input you fully control - make it airtight |

**Cross-check trick:** competitor review counts and disclosed customer numbers give you a reality floor. If a comparable web-to-print vendor claims ~3,000 small-shop customers, and your SAM is ~29,000 reachable shops, that vendor alone holds ~10% - useful context for how penetrable the market is and how loud the "we'll get 1%" claim really is.

**Sources used for the cited figures above:**
- [Printing Establishments 2010–2023 - WhatTheyThink (Census CBP, NAICS 323)](https://whattheythink.com/data/129682-printing-establishments20102023/)
- [Commercial Printing Establishments 2010–2023 - WhatTheyThink (NAICS 323111)](https://whattheythink.com/data/129873-commercial-printing-establishments20102023/)
- [US Printing Industry Establishments (size bands) - WhatTheyThink](https://whattheythink.com/sections/industry-data/establishments/)
- [Printing in Australia - Number of Businesses, IBISWorld](https://www.ibisworld.com/au/number-of-businesses/printing/166/)
- [Web-to-Print Software Market - Verified Market Research](https://www.verifiedmarketresearch.com/product/web-to-print-software-analysis/)
- [Web-To-Print Software Market - market.us](https://market.us/report/web-to-print-software-market/)
- [Web to Print Market (services-inclusive) - Mordor Intelligence](https://www.mordorintelligence.com/industry-reports/web-to-print-market)

---

## 7. Presenting it: investors vs. internal planning

The same model serves two audiences differently.

| | **Investor-facing** | **Internal planning** |
|-|---------------------|------------------------|
| Headline number | **TAM** - "the prize is big" (~$350M base; show the path to PAM) | **SOM** - your 18-month revenue plan (~$288K base) |
| Method emphasized | Bottom-up (credible) with top-down cross-check | Capacity-driven SOM; assumptions register is the live dashboard |
| Tone | Big-but-defensible; range, not single figure | Conservative; this *is* the operating target |
| What to hide/show | Show the math + sources; never bury India as a fact | Track every assumption as a metric to update monthly |
| Common mistake to avoid | Leading with the ~$26B services market | Treating SOM as a ceiling instead of a throughput problem to solve |

**Golden rules for the slide:** (1) one slide, three nested circles, each labelled with its number *and* its one-line method; (2) a footnoted assumptions/sources line; (3) the sensitivity range visible, not a single magic figure; (4) the SOM explicitly tied to GTM capacity so it reads as "we know how we get there," not "we'll get a percent."

---

## Reusable artifacts

### A. Bottom-up TAM/SAM/SOM spreadsheet model

```
ROW  | LABEL                                  | FORMULA / VALUE                          | SOURCE TAG
-----+----------------------------------------+------------------------------------------+-----------
A1   | Global small print/sign shops          | 250,000                                  | ASSUMPTION
A2   | Base ACV ($/yr)                        | =BlendedACV (see tab B)                  | DERIVED
A3   | TAM ($/yr)                             | =A1*A2                                    | CALC
-----+----------------------------------------+------------------------------------------+-----------
B1   | US printing establishments (NAICS 323) | 21,400                                   | CENSUS CBP 2023
B2   | × small-shop share (1–9 staff)         | =B1*0.71                                  | CENSUS CBP
B3   | × sign/quick-print uplift              | =B2*1.35                                  | ASSUMPTION
B4   | × storefront-fit / non-MIS share       | =B3*0.75                                  | ASSUMPTION
B5   | US target accounts                     | =B4                                       | CALC (~15,400)
B6   | UK fit accounts                        | 5,500                                    | ONS/ASSUMPTION
B7   | AU fit accounts                        | 3,000                                    | IBISWORLD/ASSUMP
B8   | CA fit accounts                        | 3,800                                    | STATCAN/ASSUMP
B9   | Other EN fit accounts                  | 1,200                                    | ASSUMPTION
B10  | India fit accounts                     | 40,000                                   | ASSUMPTION(WIDE)
B11  | SAM accounts (ex-India)                | =B5+B6+B7+B8+B9                           | CALC (~28,900)
B12  | SAM accounts (incl India)              | =B11+B10                                  | CALC (~68,900)
B13  | SAM $ (ex-India)                       | =B11*A2                                   | CALC
B14  | SAM $ (incl India)                     | =B12*A2                                   | CALC
-----+----------------------------------------+------------------------------------------+-----------
C1   | Demos/week (founder-led)               | 15                                       | ACQ DOC
C2   | Working weeks (18 mo, util-adj)        | =78*0.85                                  | ASSUMPTION (~66)
C3   | Total demos                            | =C1*C2                                    | CALC
C4   | Close rate                             | 0.22                                     | ASSUMPTION
C5   | Gross wins (founder)                   | =C3*C4                                    | CALC
C6   | Secondary-channel uplift               | 0.35                                     | ASSUMPTION
C7   | Gross wins (all channels)              | =C5*(1+C6)                                | CALC
C8   | 18-mo logo churn                       | 0.30                                     | ASSUMPTION
C9   | SOM accounts (net)                     | =C7*(1-C8)                                | CALC (~206)
C10  | SOM $ (18-mo ARR)                      | =C9*A2                                    | CALC (~$288K)
C11  | SOM as % of SAM (ex-India)             | =C9/B11                                   | SANITY CHECK (~0.7%)
```

### B. Blended-ACV worksheet

```
TIER      | ANNUAL PRICE | MIX %  | CONTRIBUTION (=price×mix)
----------+--------------+--------+--------------------------
Starter   | 490          | 0.45   | 220.50
Growth    | 1290         | 0.40   | 516.00
Pro       | 2990         | 0.15   | 448.50
----------+--------------+--------+--------------------------
Subtotal blended ACV                 | =SUM = 1185.00
× usage/add-on uplift (1+0.18)       | × 1.18
= BASE ACV                           | ≈ 1398  → round 1400
Low ACV  (downmix + discount)        | 900
High ACV (upmix + attach)            | 2400
```

### C. Assumptions / sourcing register (the doc investors and you both rely on)

```
ID | ASSUMPTION                          | VALUE  | RANGE (L/H)   | SOURCE / BASIS                  | CONFIDENCE | HOW TO VALIDATE
---+-------------------------------------+--------+---------------+--------------------------------+------------+--------------------------------
S1 | US small printing establishments    | 15,200 | 14k–16k       | Census CBP NAICS 323 × 71%     | HIGH       | Pull latest CBP release
S2 | Sign/quick-print uplift              | 1.35×  | 1.2–1.6×      | Estimate (outside NAICS 323)   | LOW        | Sample local listings/Yelp/Maps
S3 | Storefront-fit / non-MIS share       | 75%    | 60–85%        | Estimate from ICP work         | MED        | Interview counts (GTM_02/03)
S4 | India reachable shops                | 40,000 | 15k–90k       | No clean source                | VERY LOW   | MSME/GST pull; partner channel
S5 | Base ACV                             | $1,400 | $900–$2,400   | Tier model (B) + usage         | MED        | Pricing research (GTM_04)
S6 | Demos/week founder-led               | 15     | 10–22         | ACQUISITION doc throughput     | MED        | Track actual weekly demos
S7 | Close rate                           | 22%    | 15–30%        | Early-stage assumption         | LOW        | Measure once 20+ demos run
S8 | Secondary-channel uplift             | 35%    | 15–70%        | Early-stage assumption         | LOW        | Attribute inbound signups
S9 | 18-mo logo churn                     | 30%    | 18–40%        | Early SaaS assumption          | LOW        | Cohort tracking once live
```

### D. Sensitivity-analysis layout

```
                | LOW        | BASE       | HIGH
----------------+------------+------------+------------
ACV             | 900        | 1,400      | 2,400
SAM accts (exIN)| 22,000     | 29,000     | 36,000
TAM ($)         | 158M       | 350M       | 720M
SAM $ (ex-IN)   | 19.8M      | 40.6M      | 86.4M
SOM accts       | 68         | 206        | 607
SOM $ (18mo)    | 61K        | 288K       | 1.46M
----------------+------------+------------+------------
KEY SWING DRIVER (note under table): close rate × churn × channel uplift × ACV drive SOM ~24×;
SAM moves <2×. ⇒ Risk is conversion/retention, not market size.
```

---

## Cheap validation / first moves (this week)

- **Pull the two free anchors today:** US Census County Business Patterns NAICS 323 establishment count and the 1–9-employee share (71%). That alone makes your US SAM defensible by Friday. (WhatTheyThink summarizes both for free.)
- **Build the spreadsheet from artifact A**, plug in *your* real tier prices, and produce your own low/base/high - don't ship the illustrative numbers above; replace them.
- **Reality-check ACV from the value side (§5)** with one real shop: ask a friendly owner how many hours/week they lose rebuilding customer files and chasing approvals. One conversation validates or kills your $1,400 ACV.
- **Floor-check the market with a competitor:** find one comparable web-to-print vendor's disclosed/reviewed customer count; if they alone hold ~10% of your SAM, your "<1% in 18 months" SOM is conservative and credible.
- **Validate the SOM driver, not the market:** the model says your constraint is close rate and churn. Spend the week booking demos (per `ACQUISITION_CHANNELS_2026-06-15.md`), not refining the TAM decimal places.
- **Label India loudly.** In any deck, show SAM both with and without India so no one can accuse you of padding with a number you can't source.

## Cross-references

- `GTM_01_ICP_AND_POSITIONING_2026-06-15.md` - defines TAM/SAM/SOM as investment math (not targeting), the directional figures this doc makes rigorous, and the ICP ("Maria") that sits *inside* SAM/SOM.
- `GTM_02_JOBS_TO_BE_DONE_2026-06-16.md` - the jobs/value evidence behind the value-theory sizing (§5) and the storefront-fit assumption (S3).
- `GTM_03_WIN_LOSS_AND_CHURN_INTERVIEWS_2026-06-16.md` - real close-rate and churn signal to replace the SOM assumptions (S7, S9).
- `GTM_04_PRICING_RESEARCH_METHODS_2026-06-16.md` - firms up the tier prices and blended ACV that drive the entire bottom-up model.
- `GTM_05_COMPETITIVE_INTELLIGENCE_2026-06-16.md` - competitor customer counts for the market-floor cross-check (§6).
- `ACQUISITION_CHANNELS_2026-06-15.md` - the founder-led throughput numbers that ground the capacity-based SOM (§4).
- `PLATFORM_GAP_ASSESSMENT_2026-06-07.md` - the product gaps (preflight/CMYK, partial fulfillment, carrier/tracking) that justify the "non-MIS / small-shop" SAM filter and the storefront-fit assumption.
