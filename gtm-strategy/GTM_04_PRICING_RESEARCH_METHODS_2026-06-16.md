# What Will Maria Pay? — Van Westendorp, Gabor-Granger & conjoint pricing research for Print-Flow-360

## Why this matters first

At pre-PMF, the single most expensive mistake you can make is pricing on a hunch. Print-Flow-360 sells a subscription to non-technical local print-shop owners who are paying $0–$50/mo today for a generic Wix/Shopify site plus a pile of spreadsheets — so the question is not "what's our software worth in the abstract," it's "what monthly number makes Maria say yes without a long negotiation, and at what number does she balk?" Pricing research at this stage is not about precision to the dollar; it's about finding the *acceptable range* and the *value metric* (per-store? per-order? per-seat?) before you hard-code a pricing page, a Stripe plan, and a sales script you'll be stuck defending. Get the range and the metric right now and every downstream lever — trials, packaging, upsell — has room to work. Get them wrong and you either leave a large slice of revenue on the table or you price yourself out of the only segment that will talk to you.

## TL;DR — Key Recommendations

- **Run Van Westendorp + Gabor-Granger NOW, park conjoint until post-PMF.** You don't have the ~200–300+ qualified respondents that choice-based conjoint needs for stable estimates, and you don't yet know your attribute set well enough. Van Westendorp needs only ~30–50 responses to be directional and tells you the *acceptable range*; Gabor-Granger on top tells you the *revenue-maximizing point*. That combo is the right tool for your stage and sample size.
- **Anchor the survey on a concrete monthly per-store number, not "value."** Frame respondents around the tier ladder **$29 / $49 / $99 / $199 per store / month**. These bracket the likely sweet spot for a 1–30-staff shop replacing a ~$29 Shopify plan plus manual quoting labor.
- **Your value metric should almost certainly be `per store / month`, with a soft usage gate on orders.** It maps to how Maria thinks ("I have one shop"), it's honest, and multi-store is your natural expansion lever. Resist per-seat (her staff count is volatile and small) and pure per-order (feels like a tax on her success and is unpredictable for her).
- **Price on the labor + lost-sales you replace, not on your cost.** Maria's reference point is "hours a week of phone-and-email quoting" and "the orders my static site can't take after hours." Anchor every price conversation there. A $99/mo plan that saves 6 quoting hours/week is a rounding error against a $20–25/hr loaded cost.
- **Validate cheaply this week with a fake-door price page + ~10 sales-call price-anchoring tests** before you commission any survey. Stated WTP lies; a click on "Start 14-day trial" under a visible price, or a real "that's reasonable" in a call, is worth ten survey answers.
- **Expect 3 tiers.** Use Van Westendorp to center the *middle (most-popular) tier* near the OPP/IPP, push the headline number just below the PME ceiling, fence a cheaper "Solo" tier near/below the PMC floor only if it's a deliberate land-and-expand play, and put a "Multi-store/B2B" tier above the range for the corporate-portal buyers who price-shop on capability, not on dollars.

---

## 1. Van Westendorp's Price Sensitivity Meter (PSM) — find the *acceptable range*

### What it is, done correctly

The PSM, developed by Dutch economist Peter van Westendorp, asks four open-ended price questions per respondent. Crucially it frames **price as a signal of perceived quality**, which catches the "too cheap to be any good" effect that plain WTP surveys miss — a real risk for you, since a $9/mo print storefront would read as a toy to a shop owner. The four questions (use this exact wording structure):

1. **Too expensive:** "At what monthly price would Print-Flow-360 be *so expensive* that you would not consider it?"
2. **Too cheap:** "At what monthly price would Print-Flow-360 be *so cheap* that you'd doubt it could really run your store properly?"
3. **Expensive / getting pricey:** "At what monthly price would Print-Flow-360 *start to feel expensive* — not out of the question, but you'd have to think hard before buying?"
4. **Cheap / bargain:** "At what monthly price would Print-Flow-360 feel like a *bargain — a great deal* for what it does?"

A clean response obeys the logical order **Too Cheap < Bargain < Expensive < Too Expensive**. Enforce it (see fielding rules below).

### How you analyze it (the part most people get wrong)

For each of the four questions you build a **cumulative distribution** across the price axis. The trick is which way each curve runs — and you must invert two of the four so they're comparable on one chart:

| Curve | Cumulative direction | Why |
|-------|---------------------|-----|
| **Too Expensive** | Ascending (% who say price ≤ X is "too expensive") | More people call it too expensive as price rises |
| **Expensive** | Ascending (% who say price ≤ X is "expensive") | Same logic |
| **Cheap / Bargain** | **Inverted** (% who say price ≥ X is "cheap/bargain") | More people call it a bargain as price *falls* |
| **Too Cheap** | **Inverted** (% who say price ≥ X is "too cheap") | Same logic |

With all four on one chart you read off **four intersection points**. These definitions are the standard, canonical ones (the most common mistake is swapping the curve pairs — they are exactly):

| Point | Intersecting curves | What it means | Role |
|-------|--------------------|----------------|------|
| **PMC** — Point of Marginal Cheapness | **Too Cheap × Expensive** | Below here, "too cheap to be trusted" outweighs "starting to feel pricey" | **Lower bound** of acceptable range |
| **PME** — Point of Marginal Expensiveness | **Too Expensive × Cheap/Bargain** | Above here, "too expensive" outweighs "a bargain" | **Upper bound** of acceptable range |
| **OPP** — Optimal Price Point | **Too Cheap × Too Expensive** | Equal share reject as too-cheap and too-expensive | Point of lowest *resistance*; common launch anchor |
| **IPP** — Indifference Price Point | **Expensive × Cheap/Bargain** | Equal share call it "cheap" and "expensive" — the perceived "normal/median" price | Where the median buyer sits; often where market leaders price |

The span **PMC → PME is the Range of Acceptable Pricing.** You price inside it. There's no universal rule that OPP < IPP or vice-versa; their order tells you whether the market currently skews cheap-conscious or premium — read it, don't assume it.

**A correctness caveat you'll hit in practice:** because "too cheap" thresholds usually sit well below "too expensive" thresholds, the Too-Cheap and Too-Expensive curves often both sit at/near 0% across a wide middle band — so the OPP frequently lands in a low, flat zone rather than at a sharp X. Read it as the price where the two are equal (often where Too-Expensive lifts off zero), and don't over-interpret a single dollar. The PMC, IPP, and PME usually cross more crisply.

**Hard limit to respect:** Van Westendorp tells you what prices are *acceptable*, not how many units sell or what revenue you make. It has **no demand or volume dimension.** That's exactly why you pair it with Gabor-Granger (§3) — or use the **Newton-Miller-Smith (NMS) extension**, which bolts two purchase-intent questions onto the PSM to estimate a revenue curve:

- "At [the price you called *expensive*], how likely are you to subscribe in the next 6 months?" (1 = very unlikely … 5 = very likely)
- "At [the price you called a *bargain/cheap*], how likely are you to subscribe in the next 6 months?" (1 … 5)

You convert the 1–5 likelihoods into purchase probabilities, interpolate across the price range, multiply probability × price to get a relative revenue curve, and read the revenue-maximizing price. NMS is more work and shakier on small samples; for your stage I'd run plain Van Westendorp for the *range* and Gabor-Granger for the *revenue point* rather than NMS.

### Worked example — Print-Flow-360, n = 12 (illustrative fake dataset)

Twelve shop owners answer the four questions (monthly price per store). The raw responses below are illustrative but each row obeys the logical order Too Cheap < Bargain < Expensive < Too Expensive:

| Respondent | Too Cheap | Bargain | Expensive | Too Expensive |
|-----------|-----------|---------|-----------|---------------|
| R1  | 39 | 59  | 89  | 129 |
| R2  | 49 | 79  | 109 | 159 |
| R3  | 29 | 49  | 69  | 89  |
| R4  | 59 | 99  | 129 | 179 |
| R5  | 39 | 69  | 99  | 129 |
| R6  | 69 | 109 | 139 | 189 |
| R7  | 49 | 79  | 109 | 159 |
| R8  | 39 | 59  | 79  | 99  |
| R9  | 79 | 99  | 129 | 169 |
| R10 | 59 | 89  | 119 | 149 |
| R11 | 49 | 69  | 89  | 109 |
| R12 | 69 | 89  | 119 | 149 |

Now build cumulative % at each price gridpoint. **Too Expensive** and **Expensive** are *ascending* (% of respondents whose threshold is ≤ that price). **Too Cheap** and **Bargain** are *inverted* (% whose threshold is ≥ that price):

| Price | Too Cheap (≥) | Bargain (≥) | Expensive (≤) | Too Expensive (≤) |
|------:|---:|---:|---:|---:|
| $29  | 100% | 100% | 0%   | 0%   |
| $39  | 92%  | 100% | 0%   | 0%   |
| $49  | 67%  | 100% | 0%   | 0%   |
| $59  | 42%  | 92%  | 0%   | 0%   |
| $69  | 25%  | 75%  | 8%   | 0%   |
| $79  | 8%   | 58%  | 17%  | 0%   |
| $89  | 0%   | 42%  | 33%  | 8%   |
| $99  | 0%   | 25%  | 42%  | 17%  |
| $109 | 0%   | 8%   | 58%  | 25%  |
| $119 | 0%   | 0%   | 75%  | 25%  |
| $129 | 0%   | 0%   | 92%  | 42%  |
| $149 | 0%   | 0%   | 100% | 58%  |
| $179 | 0%   | 0%   | 100% | 92%  |
| $199 | 0%   | 0%   | 100% | 100% |

Reading the crossings off this data (linear-interpolated between the two grid prices that straddle each crossing):

- **PMC (Too Cheap × Expensive):** Too-Cheap falls through 8% at $79 while Expensive climbs through 17% there — they cross around **$76**. Below ~$76, "too cheap to trust" dominates. → **floor ≈ $76**.
- **OPP (Too Cheap × Too Expensive):** Too-Cheap is 8% at $79 and 0% by $89; Too-Expensive lifts to 8% at $89, 17% at $99. They meet as Too-Cheap descends to zero and Too-Expensive lifts off — around **$84**, the lowest-resistance launch anchor.
- **IPP (Expensive × Bargain):** Bargain falls through 25% at $99 while Expensive climbs through 42% there; they cross around **$92** → **IPP ≈ $92**, the perceived "normal" price.
- **PME (Too Expensive × Bargain):** Bargain is ~8% by $109 and 0% by $119; Too-Expensive climbs through 25% there — crossing around **$102**. → **ceiling ≈ $102**.

**Acceptable range ≈ $76 → $102. Lowest-resistance ≈ $84, perceived-normal ≈ $92.** That's a clean read for the tier skeleton:

- **Growth (most-popular) tier at $99** — a hair below the $102 PME ceiling. This is the standard "anchor the headline tier slightly high, then discount on the annual plan" move, and it sits right where Gabor-Granger (§3) puts the revenue peak.
- **Solo tier at $49** — deliberately below the PMC floor. Only ship this if it's a conscious land-and-expand play; fence it with reduced features (1 store, basic studio) so it doesn't read as cheap-and-nasty and drag the brand down.
- **Multi-store/B2B tier at $199** — above the range, sold on the corporate portal / pay-on-account / approvals value, not on price-sensitivity. These buyers price-shop on capability.

Note how OPP ($84) < IPP ($92): this market skews slightly cheap-conscious, which fits a non-technical owner replacing a $29 Shopify plan. That's a signal to lead messaging with value/ROI, not features.

### Copy/paste survey block — Van Westendorp for Print-Flow-360

```
INTRO (read or show before the four questions):
"Print-Flow-360 gives your print shop a branded online store where
customers design their own print-ready artwork, get an instant price,
and pay online — plus a back office for quotes, orders, and repeat
business accounts. Imagine you could switch it on for your shop today.
The questions below ask about the MONTHLY price for ONE shop location."

Q1 (Too Expensive):
  "At what monthly price would Print-Flow-360 be SO EXPENSIVE that you
   would not consider subscribing at all?"      $ ______ / month

Q2 (Too Cheap):
  "At what monthly price would Print-Flow-360 be SO CHEAP that you'd
   doubt it could really run your shop's online store properly?"
                                                 $ ______ / month

Q3 (Expensive / getting pricey):
  "At what monthly price would Print-Flow-360 START TO FEEL EXPENSIVE —
   not out of the question, but you'd have to think hard about it?"
                                                 $ ______ / month

Q4 (Bargain / cheap):
  "At what monthly price would Print-Flow-360 feel like a BARGAIN — a
   great deal for what it does for your shop?"   $ ______ / month

OPTIONAL — Newton-Miller-Smith add-on (revenue estimate):
NMS1: "At $[their Q3 'expensive' answer] / month, how likely are you to
       subscribe in the next 6 months?"  1=Very unlikely ... 5=Very likely
NMS2: "At $[their Q4 'bargain' answer] / month, how likely are you to
       subscribe in the next 6 months?"  1=Very unlikely ... 5=Very likely
```

**Fielding rules that keep the data clean:**
- Screen for real shop owners / decision-makers (not staff, not students).
- Enforce the logical order Too-Cheap < Bargain < Expensive < Too-Expensive. Reject or re-ask inconsistent answers — expect to drop a meaningful slice of raw responses to this (commonly cited at roughly 10–20%; treat that as directional, not a guarantee).
- Use open numeric entry, not a dropdown — a dropdown anchors respondents to your numbers.
- Field within your billable regions (Stripe/Razorpay) so the currency reflects buyers you can actually charge (see `GTM_06_TAM_SAM_SOM_MODELING_2026-06-16.md`).

---

## 2. Spreadsheet recipe — plot Van Westendorp yourself

You do not need a research vendor. Here's the exact Google Sheets / Excel build.

```
TAB 1 "Raw"  — one row per respondent, four columns:
   A: TooCheap   B: Bargain   C: Expensive   D: TooExpensive

TAB 2 "Curves":
  Column A: price grid (one row per price you want to plot)
            29, 39, 49, 59, 69, 79, 89, 99, 109, 119, 129, 149, 179, 199
  Let N = number of respondents = COUNT(Raw!A:A)

  B (Too Cheap, INVERTED — % who say threshold >= this price):
     =COUNTIF(Raw!$A$2:$A$1000, ">="&A2) / N

  C (Bargain, INVERTED — % who say >= this price):
     =COUNTIF(Raw!$B$2:$B$1000, ">="&A2) / N

  D (Expensive, ASCENDING — % who say <= this price):
     =COUNTIF(Raw!$C$2:$C$1000, "<="&A2) / N

  E (Too Expensive, ASCENDING — % who say <= this price):
     =COUNTIF(Raw!$D$2:$D$1000, "<="&A2) / N

PLOT: select A:E -> Line chart. X axis = price (A); four lines = B,C,D,E.
Format B,C,D,E as % .

READ THE INTERSECTIONS (where two lines cross):
   PMC = Too Cheap (B) x Expensive (D)         -> acceptable-range FLOOR
   PME = Too Expensive (E) x Bargain (C)       -> acceptable-range CEILING
   OPP = Too Cheap (B) x Too Expensive (E)     -> lowest price resistance
   IPP = Expensive (D) x Bargain (C)           -> perceived "normal" price

To get a numeric crossing instead of eyeballing, linear-interpolate between
the two grid prices (p_low, p_high) that straddle the crossing. With the two
curves A and B sampled at each, the crossing price is:
   d_low  = A_low  - B_low
   d_high = A_high - B_high
   price_cross = p_low + (p_high - p_low) * d_low / (d_low - d_high)
(Only valid when d_low and d_high have opposite signs — i.e. the lines
actually cross in that interval.)
```

Tip: keep the price grid denser ($10 steps) around your suspected sweet spot ($69–$129) so the intersections land precisely. Sparse grids smear the OPP across a flat zone.

---

## 3. Gabor-Granger — find the *revenue-maximizing* price

### What it is

Van Westendorp gives you a range but no demand. Gabor-Granger fills that hole. You show one respondent a concrete price and ask a yes/no (or 1–5 purchase-intent) question; if they're a likely buyer you show a higher price, if not a lower one, laddering until you find their personal ceiling. Aggregate across respondents and you get a **demand curve** (% who would buy at each price) and, multiplying demand × price, a **revenue curve** whose peak is your revenue-maximizing price. It also yields a rough **price elasticity** (% change in demand ÷ % change in price). It's the right complement to PSM precisely because it adds the volume dimension PSM lacks.

**Its limits:** it tests *only the prices you choose* (so a poorly chosen ladder hides the true optimum — bracket it using your Van Westendorp range), it measures *stated* intent (people over-claim — discount the absolute take-rates, trust the *shape* of the curve), and it isolates one product with no competitive context. Use it for directional revenue shape, not gospel conversion forecasts.

### Worked example — Print-Flow-360 ladder, n = 80 (illustrative)

Ladder the four tier candidates plus two checks. "Would subscribe" = top-2-box on a 1–5 intent scale, then **deflated by 50%** to correct for stated-preference over-claim (a common conservative haircut — pick your own and apply it consistently). For the revenue column, assume an illustrative reachable pool of 1,000 shops:

| Price/mo | Stated "would buy" (top-2-box) | Deflated take-rate (×0.5) | Buyers (of 1,000) | Relative revenue (buyers × price) |
|---------:|------------------:|--------------------------:|------------------:|----------------------------------:|
| $29  | 88% | 44% | 440 | $12,760 |
| $49  | 75% | 38% | 375 | $18,375 |
| $79  | 56% | 28% | 280 | $22,120 |
| **$99**  | **45%** | **23%** | **225** | **$22,275** ← peak |
| $129 | 30% | 15% | 150 | $19,350 |
| $199 | 16% | 8%  | 80  | $15,920 |

**Read:** Revenue peaks at **$99/mo** (by a hair over $79 — $22,275 vs $22,120), consistent with the Van Westendorp OPP/IPP read of ~$84–$92 (a revenue optimum at or just above the lowest-resistance point is normal). Elasticity between $79 and $99: demand falls 28%→23% (−18%) while price rises +25%, so elasticity ≈ **−0.78** (inelastic) — you can raise price from $79 to $99 and *hold or gain* revenue. Between $99 and $129, demand falls 23%→15% (−33%) while price rises +30%, elasticity ≈ **−1.1** (elastic) — pushing past $99 on the headline tier *loses* revenue. That's a strong quantitative argument for a **$99 most-popular tier**, and it triangulates with the PSM ceiling (PME ≈ $102): you're parking the headline number right under the wall.

### Copy/paste survey block — Gabor-Granger

```
INTRO: (same product description as the Van Westendorp intro)

PRESENT a price, ask:
  "Print-Flow-360 costs $[PRICE] per month for one shop.
   How likely are you to subscribe?"
     1 = Definitely would not
     2 = Probably would not
     3 = Might or might not
     4 = Probably would
     5 = Definitely would

LADDER LOGIC (randomize the STARTING price across respondents to avoid
anchoring everyone to the same number):
  - If answer is 4 or 5  -> show the NEXT HIGHER price, ask again.
  - If answer is 1,2,3   -> show the NEXT LOWER price, ask again.
  - Stop when you've bracketed their switch point or run out of rungs.
  Ladder rungs: 29 -> 49 -> 79 -> 99 -> 129 -> 199

SCORING:
  "Would buy at price P" = top-2-box (4 or 5) at P.
  take_rate(P) = (# top-2-box at P / N) * 0.5   <- 0.5 = stated-pref haircut
  revenue_index(P) = take_rate(P) * P
  Optimal price = argmax revenue_index(P)
```

### Related: monadic vs sequential price testing

Two cousins of Gabor-Granger worth knowing:

- **Monadic price test** — each respondent sees **only one** price and answers purchase intent. Cleanest read (no anchoring across prices) but needs a separate cell per price point, so it's sample-hungry — wrong for your stage.
- **Sequential monadic** — each respondent sees a couple of prices in sequence. A middle ground; Gabor-Granger's laddering is essentially an adaptive sequential design.

At your sample size, the **adaptive Gabor-Granger ladder above is the right pick** — it squeezes a demand curve out of ~80 respondents that monadic would need several hundred to produce.

---

## 4. Conjoint analysis — the precise tool, for later

### What it is and the variants

Conjoint shows respondents bundles of features-at-levels (including price as one attribute) and forces tradeoff choices; from the choices it statistically derives **part-worth utilities** for every level. From those you compute each attribute's **importance** and **willingness-to-pay** (the dollar value of a feature = its utility difference ÷ the per-dollar utility of the price attribute). It's the gold standard for *packaging and feature-value* decisions because it mimics real "this bundle vs that bundle at these prices" buying.

| Method | What it is | Best when | Sample rule of thumb |
|--------|-----------|-----------|----------------------|
| **CBC** (Choice-Based Conjoint) | Pick the best bundle from a set; hierarchical-Bayes estimation derives part-worths | ≤ ~6 attributes, you know your attributes, want price + packaging | ~200–300+ completes for stable estimates (can drop toward ~100 for a small, tight target market); the common variant of conjoint |
| **ACBC** (Adaptive CBC) | Adapts the questions to each respondent; richer per-person data | Many attributes, **price-heavy** studies, smaller samples | Works at roughly ~100–250; more accurate per respondent |
| **MaxDiff** | Respondents pick "most" and "least" important from short item sets — **no price** | Prioritizing a long feature list (what to build / lead with), not pricing | ~150–300 |

*(Sample figures are widely cited rules of thumb, not hard cutoffs; the rigorous CBC rule is Johnson's n·t·a·c ≥ 500 minimum exposures, i.e. respondents × tasks × alternatives-per-task × analysis-cells.)*

### Why NOT now, for Print-Flow-360

You're pre-PMF. Conjoint demands (a) a stable, well-understood attribute set — you're still discovering which features close deals; (b) ~200–300+ qualified respondents — you can't reach that many real shop owners yet; and (c) real money and time to field and analyze. Spending founder attention here now is premature optimization. **Park it.** Once you've got ~50+ paying tenants and a stable feature menu, ACBC (it handles price well at modest samples) is the right call to optimize packaging.

### What a future Print-Flow-360 conjoint would test (sketch, for when you're ready)

| Attribute | Levels |
|-----------|--------|
| Price | $49 / $99 / $149 / $199 per store/mo |
| Design studio | Basic templates / Full self-serve design studio |
| B2B portal | None / Corporate accounts + pay-on-account + approvals |
| Production tools | Storefront only / + preflight & CMYK check / + carrier tracking |
| Stores included | 1 / 3 / unlimited |

That structure would tell you, e.g., "the B2B portal is worth +$60/mo of WTP but the design studio is worth +$110/mo" — pure packaging gold, and it directly informs which of the known gaps (preflight/CMYK, carrier tracking) are worth building first. Just not yet. Until then, **MaxDiff** on the feature list is a cheaper, lighter way to learn what to *lead with* in messaging (ties to GTM_01 positioning).

---

## 5. Practical pre-PMF alternatives — what to actually do before any survey

Stated WTP is the weakest evidence there is; **revealed** preference (a real click, a real card, a real "yes" in a call) beats it every time. At your stage, lean here first.

### 5a. The "very disappointed" PMF question + a pricing chaser

Sean Ellis's test: ask current trial / early users **"How would you feel if you could no longer use Print-Flow-360?"** — Very disappointed / Somewhat / Not disappointed / N/A. The widely-used benchmark is **≥ 40% "Very disappointed"** as a signal of product-market fit (you need ~40+ responses for it to mean anything; 100+ for confidence). Pair it with a value/price chaser so you learn pricing in the same breath:

```
Q1: "How would you feel if you could no longer use Print-Flow-360?"
    [ ] Very disappointed   [ ] Somewhat disappointed
    [ ] Not disappointed    [ ] N/A - I no longer use it

Q2 (everyone): "What is the main benefit you get from Print-Flow-360?"
    [open text]   <- mine this for messaging

Q3: "What would you have used instead if Print-Flow-360 didn't exist?"
    [open text]   <- reveals your real competitor + their price anchor

Q4: "If Print-Flow-360 were no longer free/discounted, what monthly
    price for one shop would feel fair to you?"   $ ____ /month
```

Filter Q2 and Q4 to the **"Very disappointed" segment only** — their answers are the messaging and WTP signal that matters; the indifferent crowd's numbers are noise.

### 5b. Fake-door / price-page A/B test (the cheapest revealed-preference test you can run)

Put up a real pricing page with the Stripe checkout / "Start 14-day trial" button live, and split traffic across price variants. Measure **clicks-to-trial** at each price.

| Variant | Headline tier shown | Metric watched |
|---------|--------------------|----------------|
| A | $49/mo | trial-start CTR, then trial→paid |
| B | $99/mo | same |
| C | $149/mo | same |

If billing isn't wired yet, a "fake door" (button → "we're onboarding in batches, join the list") is acceptable **for prospects** — just be honest and follow up fast, or it burns trust. (Note the boundary: your own §0 "no half-built UI" rule governs what your *paying tenants* see in-product; a waitlist on a public pricing page shown to *prospects* is a legitimate demand test, not a half-built feature.) The signal: if $99 holds CTR within ~20% of $49, you're underpricing at $49.

### 5c. Sales-conversation price anchoring

In every founder-led sales call (your primary channel per GTM_03 / `ACQUISITION_CHANNELS_2026-06-15.md`), run a scripted anchor:

```
After demoing value, BEFORE stating price:
  "Most shops your size spend [X hours/week] quoting by phone and email,
   and lose orders when the shop's closed. What's that costing you
   roughly each month?"   -> let THEM anchor on their pain in dollars.

Then state price as a fraction of that:
  "Print-Flow-360 is $99/month for your shop — less than [fraction] of
   that. How does that land?"

LISTEN for the tell:
  - "That's nothing" / "reasonable"      -> you're underpriced, test higher
  - pause, "let me think"                -> at/near their ceiling (good)
  - "that's a lot" / immediate flinch    -> above ceiling OR value unclear
```

Log every reaction in a sheet (price stated, reaction, shop size, what they use today). Ten honest calls beat a 100-person survey of strangers.

### 5d. Value-based pricing logic — the frame behind all of it

Price off the **value you create / cost you replace**, not your hosting bill. Maria's quantifiable references (figures illustrative, assuming a $22/hr loaded labor cost and 4.3 weeks/month):

| Value lever | Conservative monthly value to Maria |
|-------------|------------------------------------|
| Quoting labor saved (6 hrs/wk × $22 loaded × 4.3 wk) | ~$570 |
| After-hours orders captured (2 orders/wk × $80 margin × 4.3 wk) | ~$688 |
| Repeat-business / B2B accounts retained | (varies; often the biggest line) |
| Replaces Shopify/Wix + plugins | ~$40–80 |

Even crediting a fraction of that, a $99/mo price is trivially defensible — which is exactly why your *messaging* (GTM_01) must make these numbers vivid, and why your *floor* should never dip below the PMC: cheap reads as "toy," and toys don't replace a shop's revenue engine.

---

## 6. Decision guide — which method, given your stage

| Your situation | Use | Don't use |
|----------------|-----|-----------|
| Pre-PMF, < 50 reachable shops, no stable feature set (**you, today**) | **Sales-call anchoring + fake-door price page + Van Westendorp (n ≥ 30) + Gabor-Granger** | Conjoint, NMS |
| 40+ early users to survey | Add the **"very disappointed" + price chaser** | — |
| Want the revenue-max point, have ~80 survey responses | **Gabor-Granger** (bracket the ladder with your VW range) | Monadic (too sample-hungry) |
| Post-PMF, 50+ paying tenants, stabilizing packaging | **ACBC** (price-heavy) or **CBC**; **MaxDiff** for feature priority | — |
| Deciding *what to build/lead with*, not pricing | **MaxDiff** | Van Westendorp / Gabor-Granger (price-only) |

**Sequence I'd run:** (1) this week — fake-door + ~10 anchored sales calls; (2) next 2–3 weeks — Van Westendorp survey to fix the acceptable range and tier skeleton; (3) immediately after — Gabor-Granger to pick the revenue-max headline tier; (4) feed all of it into the packaging in `PRICING_RETENTION_REFERRALS_STRATEGY_2026-06-15.md`; (5) revisit with ACBC once you're post-PMF.

---

## 7. Tie to value metric & packaging

Pricing *research* is upstream of two product decisions, both of which land in your existing strategy doc:

- **Value metric (the thing you charge per).** Candidates: per **store** (recommended — matches Maria's mental model, honest, multi-store = clean expansion); per **order** (feels like a success tax, unpredictable for her — use only as a soft fair-use cap, e.g. "up to N orders/mo included, then a small overage"); per **seat** (her staff count is volatile and small — avoid as primary). Your Van Westendorp and Gabor-Granger numbers above are *per store*, so they directly set the per-store price.
- **Packaging (the tier fences).** Use §1's read: **Solo $49** (near/below the PMC floor, deliberately fenced down — 1 store, basic studio); **Growth $99** (the OPP/IPP/revenue-max sweet spot — your "most popular," full design studio); **Pro/B2B $199** (above the range, sold on the corporate portal / pay-on-account / approvals — the price-insensitive buyer). Gate the known product gaps (preflight/CMYK, carrier tracking) as future **Pro-tier** value so they *pull upgrades* rather than block deals — see `PLATFORM_GAP_ASSESSMENT_2026-06-07.md`.

Keep regional reality in view: because billing is Stripe/Razorpay, your serviceable market is those regions — run the survey *within* them so the dollar/rupee numbers reflect buyers you can actually charge (see `GTM_06_TAM_SAM_SOM_MODELING_2026-06-16.md`).

---

## Cheap validation / first moves (this week)

- **Stand up a fake-door price page** with three variants ($49 / $99 / $149 headline tier) and a live trial/waitlist button; split your existing landing traffic. Watch click-to-trial. Zero survey cost.
- **Run the ~10-call anchoring script** (§5c) on your next founder-led sales conversations. Log price stated, reaction, shop size, current tool. This is your highest-signal, lowest-cost WTP data.
- **Build the Van Westendorp Google Sheet** from the §2 recipe now (empty), so the moment you collect ~30 responses the four points compute automatically. Send the §1 survey block to your warm list of shop owners and any print-community contacts (see `ACQUISITION_CHANNELS_2026-06-15.md`).
- **Add the "very disappointed" + price chaser (§5a)** to your trial onboarding email at day 14. Free, recurring, and doubles as your PMF gauge.
- **Do NOT** commission conjoint or hire a research vendor yet. Spend the saved attention closing the next five tenants.

---

## Cross-references

- `GTM_01_ICP_AND_POSITIONING_2026-06-15.md` — who Maria is, the category claim, and the value props your price must be anchored to.
- `GTM_02_JOBS_TO_BE_DONE_2026-06-16.md` — the jobs that define "value created," i.e., the labor / lost-sales your price replaces.
- `GTM_03_WIN_LOSS_AND_CHURN_INTERVIEWS_2026-06-16.md` — interview infrastructure to reuse for the sales-call anchoring (§5c) and price-objection capture.
- `GTM_05_COMPETITIVE_INTELLIGENCE_2026-06-16.md` — competitor price anchors (Shopify/Wix + web-to-print rivals) that set Maria's reference price.
- `GTM_06_TAM_SAM_SOM_MODELING_2026-06-16.md` — the addressable-shop pool that turns Gabor-Granger take-rates into a revenue model; Stripe/Razorpay region gating.
- `PRICING_RETENTION_REFERRALS_STRATEGY_2026-06-15.md` — where the value-metric and tier decisions from this research get implemented.
- `PLATFORM_GAP_ASSESSMENT_2026-06-07.md` — the gaps (preflight/CMYK, partial fulfillment, carrier/tracking) to fence as upgrade value rather than let them block deals.
