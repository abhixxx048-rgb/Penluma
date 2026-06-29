---
title: 'Print Shop Pricing: Why 250 Cards Cost Almost as Much as 1,000'
metaTitle: 'Print Shop Pricing & Costing Explained'
description: 'Learn how print shops really price jobs: make-ready, setup amortization, markup vs margin, waste, and the offset-vs-digital break-even that decides cost.'
keywords:
  - print shop pricing
  - print job costing
  - make-ready cost
  - markup vs margin
  - offset vs digital break-even
  - quantity price breaks
  - budgeted hourly rate
  - print quoting software
  - screen printing pricing
  - square foot banner pricing
  - print spoilage and waste
  - cost-plus pricing print
faq:
  - q: Why does printing get so much cheaper per piece when you order more?
    a: Most of a print job's cost is a one-time setup (plates and make-ready) plus a tiny per-piece cost. Order more copies and that fixed setup spreads across all of them, so the cost per piece falls fast.
  - q: What is the difference between markup and margin?
    a: Markup measures profit against your cost; margin measures it against your selling price. A 50% markup is only a 33.3% margin, so to actually earn a 50% margin you must add 100% markup.
  - q: When is offset cheaper than digital printing?
    a: Offset wins once the run is big enough for its cheap per-copy cost to overcome its high setup cost. For standard color work the break-even is often around 3,000 to 5,000 pieces, but you should calculate it from real setup and click costs.
  - q: What is make-ready in printing?
    a: "Make-ready is all the one-time work to prepare a press for a specific job before any sellable copies print: mounting plates, registering color, balancing ink, and running test sheets. It is a fixed per-job cost."
  - q: Why do print shops charge for more pieces than I ordered?
    a: Some sheets are always ruined during setup and the run, so shops buy and bill extra material to guarantee your full count. Sheet-fed jobs average around 7.5% running waste plus make-ready spoilage.
  - q: What is a Budgeted Hourly Rate?
    a: It is the all-in cost of running one machine for one productive hour, including wages plus benefits, rent, utilities, supplies, and depreciation. Anything charged above that rate is profit.
topic: print-production-craft
topicTitle: Print Production Craft
category: Engineering
date: '2026-06-21'
order: 10
icon: "\U0001F4D0"
author: Pritesh Yadav (priteshyadav444)
transformed: true
sources: []
---

Order 250 business cards and they cost nearly as much as 1,000. That is not a rip-off, and it is not a typo on the quote. It is the single most important fact about how print shops make money, and once you see it, every "weird" thing about print pricing suddenly makes sense.

A print job is mostly a big one-time setup cost plus a tiny cost per copy. Understand that, and you understand quantity discounts, minimum orders, the offset-versus-digital debate, and why so many busy shops quietly go broke.

## Why this matters

If you run a print shop, build software for one, or just want to stop feeling cheated by print quotes, the money model is the thing to learn. Every quote, every price-break table, every order total is really a small piece of accounting.

Get it right and your prices hold up when the accountant looks at them. Get it wrong and you hand customers confident numbers that quietly lose money on every job. That is the worst kind of mistake, because nobody notices until the year-end books come in red.

This article walks through the one idea that explains print pricing, the full stack of costs behind a quote, the margin math people get wrong, the offset-vs-digital decision, and the pricing models a real shop needs.

## The one idea behind everything: high fixed cost, low variable cost

Printing, especially traditional offset printing, is a **high fixed cost, low variable cost** business. You spend a lot of money *before* the first good copy comes off the press, and then each extra copy costs almost nothing.

Two plain definitions to anchor the rest of this:

- **Fixed cost:** money you spend that does *not* change with how many pieces you print. Print 50 flyers or 5,000 and this cost is the same.
- **Variable cost:** money that scales *with* the number of pieces. Print twice as many, pay roughly twice as much of this.

Think of baking cakes to sell slices. Buying the oven and turning it on is a fixed cost; it costs the same whether you bake one cake or ten. The flour and eggs are variable; more cakes, more ingredients.

A print shop is an extreme version of that. The "oven" (press, plates, setup) is hugely expensive, but the "flour" (ink on one more sheet) costs almost nothing. So the cost per slice plummets the more slices you sell.

This is why a small order feels expensive per piece, why shops set minimum charges, and why every real price list shows the per-unit price *dropping* as quantity climbs. It is not a sales gimmick. It is the arithmetic of spreading one big fixed cost over more pieces.

## The three cost buckets

In practice, shop costs fall into three buckets, not two. The third one is the one most people forget, and it is the heart of everything.

| Bucket | Plain meaning | Examples | Changes with quantity? |
| --- | --- | --- | --- |
| **Fixed / overhead** | Cost of being open at all | Rent, equipment loans, depreciation, salaries, insurance, base utilities | No, same every month |
| **Per-job setup** | One-time work to get ready for *this* job | Make-ready, plate creation, screen burning, file prep | No, paid once per job |
| **Variable / per-piece** | Cost of each extra copy | Paper, ink or toner, blank garments, click charges, run labor, packaging | Yes, scales with quantity |

The middle bucket, **per-job setup**, is the one that gets **amortized**, which simply means spread out across the whole run. Hold onto that word; it is the engine of quantity pricing.

Here is a quick example. A shop pays $4,000 a month rent (fixed), spends $700 making plates for your business-card job (per-job setup), and spends about one cent of paper and ink per card (variable).

Order 500 cards and that $700 setup spreads over only 500 pieces. Order 50,000 and the *same* $700 spreads over 50,000 pieces. Same job, wildly different cost per card.

> **The trap in software:** never lump setup into the per-piece price. If a calculator treats the $700 plate cost as "$1.40 per card" and then multiplies by quantity, a 5,000-card order gets charged $7,000 in setup instead of $700. Setup must be a *flat per-job* line you divide by quantity, never a per-unit rate you multiply.

## What a machine really costs per hour

A serious shop does not guess its costs. It calculates a **Budgeted Hourly Rate (BHR)** for each machine: the all-in cost, in dollars, of running that machine for one productive hour with every expense accounted for.

In plain words, take *every* dollar the shop spends in a year, assign each dollar to the machine it belongs to, then divide by the hours that machine actually produces work. The result is the true cost per hour. Anything you charge above it is profit.

What rolls into a BHR:

- Wages **plus** benefits (payroll taxes, workers' comp, health insurance), not just the hourly wage.
- Building, rent, leases, property taxes, insurance.
- Equipment **depreciation** (more on this below).
- Repairs and maintenance.
- Utilities, often split by the floor space each machine uses.
- Supplies, sales expense, and general admin.

### Depreciation, in plain English

**Depreciation** means spreading the cost of an expensive machine across the years you will use it, instead of pretending you spent it all in one month. The simplest method is **straight-line depreciation**:

```
Annual depreciation = (Cost - Salvage Value) / Useful Life

Salvage value = what the machine is worth when you're done with it
Useful life   = how many years you expect to use it
```

Say a digital press costs $200,000 and you expect five years of use. Straight-line depreciation is $200,000 / 5 = **$40,000 a year**. If that press runs about 2,000 productive hours a year, depreciation alone is roughly **$20 an hour**, before you even add labor, rent share, and supplies.

### Do not divide by all the clock hours

A machine is not productive every hour it is plugged in. There is maintenance, cleaning, idle time, and waiting for jobs. Shops multiply available hours by a **productivity factor** (around 85% is common) to get real productive hours, then divide costs by *that*.

```
BHR =  (all annual costs assigned to a machine)
       ------------------------------------------
       (available hours  x  ~85% productivity)
```

If you assume the press is busy 100% of the time, your hourly rate comes out too low, and every quote built on it quietly underprices the work. Always divide by *productive* hours, not calendar hours.

## Make-ready: the cost that makes price drop with quantity

**Make-ready** (also called setup) is all the one-time work to get a press ready for a specific job before any sellable copies appear: mounting plates, registering color, balancing ink and water, loading stock, and running test sheets until the output is right.

For offset, make-ready typically eats **2 to 4 hours of press time and roughly $500** in labor and materials, on top of the plates. And plates are not cheap: an offset plate set runs about **$300 to $800**, averaging around $700. A full-color (CMYK) job needs four plates, one per ink.

**Amortization** is just spreading that one-time cost across all the pieces in the run. Watch what happens to a $700 plate cost as the run grows:

| Quantity | Setup per piece ($700 / qty) | Variable per piece | Total per piece |
| --- | --- | --- | --- |
| 500 | $1.40 | ~$0.01 | **~$1.41** |
| 5,000 | $0.14 | ~$0.01 | **~$0.15** |
| 50,000 | $0.014 | ~$0.01 | **~$0.024** |

Same product. The variable cost barely moves, but the setup-per-piece collapses, so the total cost per piece drops about **60 times** from the small run to the big run.

That is exactly why real price lists show **quantity breaks**: discrete bands where the per-unit price steps down. Offset discounts typically kick in around 5,000 units and get dramatic by 50,000, where per-unit cost can fall 30 to 40%.

```
Per-unit cost vs. quantity (offset)

$/unit
 1.40 | *
      |  *
      |   *
      |     *
      |        *
 0.15 |            * .
      |                 * .  .
 0.02 |                          * . . . . . .
      +----------------------------------------- qty
       500     2k      5k       20k      50k

Setup ($700) dominates on the left, vanishes on the right.
```

The takeaway: quantity discounts are not generosity. They are the math of amortizing a fixed setup over more pieces. The clean formula is `(setup / qty) + variable_per_piece`, then add margin.

## The variable costs: materials, clicks, ink, and labor

**Materials are usually the biggest single cost.** Paper, substrate, or blank garments are typically **40 to 50% of total job cost**, the largest line on most jobs. Substrate prices move with the market, so a quote built on last year's paper cost can be wrong by the time it is accepted.

**Digital "click charges" are flat per copy.** A **click charge** is how digital presses bill: a flat cost for every impression printed (a "click"), covering toner or ink plus the maintenance contract. The key feature is that it is *flat per piece* and does **not** drop with quantity. Click charges run roughly **$0.11 to $0.22+** per impression.

| | Offset | Digital |
| --- | --- | --- |
| Upfront setup | High (plates + make-ready, ~$700+) | Near zero (no plates) |
| Cost per copy | Very low (~$0.002 to $0.01) | Flat click (~$0.11 to $0.22) |
| Unit price as qty rises | Falls sharply | Stays flat |

Offset is like a bulk membership: a steep entry fee, then near-free per item. Digital is pay-as-you-go: no entry fee, but the same price per item forever. For a few items, pay-as-you-go wins. For a warehouse-load, the membership wins.

**Labor spans the whole chain**, not just the press operator: file prep, plate or screen making, make-ready, the run, finishing and bindery (cutting, folding, binding), cleanup, and packing. Always cost **loaded labor**, meaning wages plus benefits plus the operator's share of overhead, which is exactly what the BHR already captures.

## Waste, spoilage, and overs

Here is a hard truth that catches new shops: you must *buy and charge for more material than the customer ordered*, because some of it gets ruined. The industry has precise words for this.

| Term | Plain meaning | Typical amount |
| --- | --- | --- |
| **Make-ready waste** | Sheets burned reaching the first good copy | ~100 for a simple leaflet; 400 typical; 500+ for tricky color |
| **Running waste / spoilage** | Bad sheets during the run itself | ~7.5% average on sheet-fed; 1% to 17.5% range |
| **Overs / unders** | Extra copies to guarantee the ordered count | Often 1 to 2% extra |

Apparel shops apply a similar cushion: add roughly **15% on top of wholesale blank garments** to cover damaged or misprinted goods.

If a customer orders 5,000 flyers and you buy exactly 5,000 sheets, the ~400 make-ready sheets plus running spoilage mean you deliver short, and reprinting eats your whole profit. Always pad materials by a waste percentage in both your purchasing and your quote. Waste is not an accident to ignore; it is a planned, quantifiable cost.

## How a quote is built: the cost stack

A professional quote is a stack of cost elements, summed, with overhead recovered and markup added. The dominant approach is **cost-plus pricing**: add up your true cost, then add a markup to reach your target profit.

```
THE QUOTE STACK (bottom = cost, top = price)

+-----------------------------------------------+
|  8. Add-ons: rush premium, shipping, design   |
+-----------------------------------------------+
|  7. MARKUP  -> reaches target margin          |
+-----------------------------------------------+
|  6. Overhead recovery (often inside the BHR)  |
+-----------------------------------------------+
|  5. Finishing / bindery (cut, fold, grommets) |
+-----------------------------------------------+
|  4. Run labor  (machine BHR x run hours)      |
+-----------------------------------------------+
|  3. Click / ink / consumables                 |
+-----------------------------------------------+
|  2. Materials (+ waste %)  ~40-50% of cost    |
+-----------------------------------------------+
|  1. Setup / make-ready (one-time, /qty)       |
+-----------------------------------------------+
     = TRUE COST  ->  + markup  ->  SELLING PRICE
```

Itemize the quote so the customer sees setup, materials, finishing, and shipping as separate lines. A buyer who sees a $700 setup line instantly understands why 250 cards cost nearly as much as 1,000: the setup is the same. Transparency justifies the price and heads off the "why so expensive?" argument.

## Markup vs margin: the math that quietly bankrupts shops

This is the single most important piece of arithmetic here, and the one shop owners and developers confuse most. Both describe profit, but they measure it against different bases.

- **Markup** = profit measured against **cost**.  `Markup% = (Price − Cost) / Cost`
- **Margin** = profit measured against **selling price**.  `Margin% = (Price − Cost) / Price`

Because cost is smaller than price, the markup percentage is always a *bigger* number than the margin percentage for the same job. They are never equal (except at zero).

| If your markup is… | Your margin is actually… | What happens to a $10 cost |
| --- | --- | --- |
| 50% | **33.3%** | Price $15, profit $5 is a third of $15 |
| 100% | **50%** | Price $20, profit $10 is half of $20 |
| 200% | **66.7%** | Price $30, profit $20 is two-thirds of $30 |
| 300% | **75%** | Price $40, profit $30 is three-quarters of $40 |

### Common misconceptions

**"I want a 50% margin, so I'll add 50% markup."** Adding 50% to a $10 cost gives $15, but $5 profit on a $15 sale is only a **33.3% margin**, not 50%. To actually get a 50% margin you must add **100% markup** (price $20). This off-by-a-denominator slip silently underprices a shop on every job and overstates how profitable it thinks it is. It is a leading reason print shops slowly go broke while looking busy.

**"Quantity discounts are just marketing."** No. They are the unavoidable result of spreading a fixed setup cost over more pieces. A shop that does not amortize setup either loses money on small runs or loses the bid on large ones.

**"Process choice is a matter of preference."** Offset versus digital is a break-even calculation (next section), not a habit.

For sane defaults, industry norms run roughly **200 to 400% markup (50 to 70% gross margin)** on general print jobs, and **30 to 50% markup** on screen printing and apparel, where a common rule of thumb is to mark up at least 50% over cost.

The reliable approach: decide your target as a **margin**, then convert to the markup you need with `markup = margin / (1 − margin)`.

## Offset vs digital: the break-even, in dollars

The membership-vs-pay-as-you-go idea becomes a concrete decision. Offset has high fixed cost and a tiny per-piece cost; digital has near-zero fixed cost and a flat per-piece click. The **break-even quantity** is the run size where offset's falling per-unit cost finally drops below digital's flat per-unit cost.

```
Break-even Qty =        Offset Setup Cost
                 ---------------------------------------
                 (Digital per-unit  -  Offset per-unit)
```

Worked example: setup (plates + make-ready) = $700. Digital click = $0.22 per unit. Offset per unit (paper + ink) = $0.11.

Break-even = $700 / ($0.22 − $0.11) = $700 / $0.11 = **~6,364 units**.

Below about 6,364 copies, digital is cheaper because you skip the $700 setup. Above it, offset wins because the setup has been amortized away.

| Run size | Usually cheaper | Why |
| --- | --- | --- |
| Under ~500 to 1,000 | Digital | No plates or make-ready to pay for |
| ~1,000 to 3,000 | It depends, run the math | The crossover zone |
| Over ~3,000 to 5,000 | Offset | Setup spread thin; cheap per-impression cost dominates |

You will hear rules of thumb like the "500-copy rule," but the honest answer is that the break-even depends on the actual setup cost and click rate. For standard CMYK work the crossover is often cited around 3,000 to 5,000 units. The point is not the exact number; it is that you should *calculate* the break-even from real inputs, not hard-code a habit.

## Rush premiums and turnaround

Time is a sellable variable. A tight deadline forces overtime labor, bumps other paying jobs, and dedicates press time, all real costs. Shops legitimately charge a **rush premium**, usually a percentage surcharge or a higher rate for expedited tiers like same-day or next-day.

Model turnaround as an explicit pricing input alongside paper grade and complexity. A standard 5-day job, a 2-day rush, and a same-day rush should be selectable tiers, each with its own multiplier, so the premium is consistent and visible rather than negotiated ad hoc.

## The pricing models worth supporting

**1. Per-piece / per-unit.** A flat price each. Simple and transparent, common for digital short runs and business cards. It hides the setup-vs-variable structure, so it works best where setup is small.

**2. Tiered quantity breaks.** The dominant model. Quantity is split into bands, each with a lower unit price, which encodes setup amortization directly into the price list. A real-shaped screen-printing table (price per shirt, one ink color):

| Quantity band | Price per shirt (1 color) |
| --- | --- |
| 1 to 12 | $3.50 |
| 13 to 24 | $2.50 |
| 25 to 48 | $1.75 |
| 49 to 72 | $1.25 |
| 73 to 144 | $0.90 |

Around 50 shirts is often the sweet spot where unit cost drops roughly half versus the smallest band, because the screen-burning setup is finally spread thin enough.

**3. Square-foot (wide / large format).** For banners, signage, and posters, price = area in square feet × a rate per square foot. Rates run **$1.99 to $8.99 per sq ft**, with a market standard near **$8 per sq ft** for digitally printed vinyl banners. A 6 ft × 3 ft banner is 18 sq ft, so at $8 that is **$144**; at a $3 budget rate it is **$54**. Finishing (grommets, hemmed edges) and design fees are usually added on top.

**4. Cost-plus / BHR-driven.** The most rigorous: estimate from machine BHR × time + materials + waste, then add markup to hit the target margin. This is how print MIS (Management Information System) software and professional estimators work, and it produces the most defensible numbers.

A note that applies to all of them: set a **minimum order charge** on every product so small jobs at least recover their setup. Without it, a 25-card order quoted purely per-piece can sell below the cost of making the plates.

## How to use this

If you are pricing jobs or building a quoting engine, here is the checklist:

1. **Separate setup from per-unit cost.** Store setup as a flat per-job value, divide by quantity, and never multiply a "per-unit setup."
2. **Cost machines at their BHR.** Include wages plus benefits, rent share, utilities, supplies, and depreciation, divided by *productive* hours (about 85% of available).
3. **Add a waste percentage to materials.** Pad both purchasing and the quote; let it vary by job complexity and run length.
4. **Set your target as a margin, then convert to markup** with `markup = margin / (1 − margin)`. Never treat a "50%" field as ambiguous.
5. **Calculate the offset-vs-digital break-even** from real setup and click costs, and use the cheaper process at the chosen quantity.
6. **Itemize every quote** so setup, materials, finishing, and shipping are visible lines.
7. **Price rush as explicit tiers** with their own multipliers, and never bundle design into the print price for free.
8. **Set a minimum order charge** on every product so tiny runs recover their setup.

Watch for the classic margin killers: confusing markup with margin, forgetting waste, not amortizing setup, ignoring overhead and depreciation, choosing the wrong process by habit, stale substrate costs, and under-charging rush.

## Conclusion

The one thing to remember: a print job is a big one-time setup cost plus a tiny cost per copy, and almost everything else, from quantity discounts to the offset-vs-digital choice, falls out of that single fact. Price on materials and wages alone and you will look busy while quietly bleeding money.

The deepest version of this lives one layer down, in machine costing. The Budgeted Hourly Rate hides a whole discipline of capacity, throughput, and bottleneck math borrowed from manufacturing. Once you can put a true dollar figure on one productive press-hour, you stop asking "what should I charge?" and start asking the far more powerful question: "which job earns the most per hour of the machine I already own?"
