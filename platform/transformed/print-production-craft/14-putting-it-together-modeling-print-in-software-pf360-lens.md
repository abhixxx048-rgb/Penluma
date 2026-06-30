---
title: How to Model a Print Product in Software (Not as a SKU)
metaTitle: Modeling Print Products in Software
description: A print job is a recipe, not a product row. Learn how to model print products in software with priced options, proof gates, pricing strategies, and shipments.
keywords:
  - modeling print products in software
  - web-to-print data model
  - print MIS software
  - print job pricing model
  - configurable product pricing
  - proof approval workflow
  - preflight file requirements
  - gang run printing
  - print turnaround SLA
  - GSM vs lb paper weight
  - square foot pricing banners
  - partial shipment order model
keywords_count: 12
faq:
  - q: Why can't I model a print product as a normal SKU?
    a: A SKU is one fixed item with a looked-up price. A print product is a configured recipe where price, weight, file rules, and turnaround all change with the chosen size, paper, ink sides, quantity, and finishing. There is no shelf and no pre-known price, so the software has to compute everything from the configuration.
  - q: What does 4/4 mean in printing?
    a: It describes ink coverage as front-over-back counts. The 4 stands for full-color CMYK, so 4/4 is full color on both sides, 4/0 is full color front with a blank back, and 4/1 is full color front with a single ink (usually black) on the back.
  - q: Should I store paper weight in GSM or lb?
    a: Store GSM canonically because it is unambiguous. The US lb system is category-dependent, so 100 lb text and 100 lb cover are completely different weights. Show friendly lb and pt equivalents in the interface, but compute and ship from GSM.
  - q: When does the print turnaround clock start?
    a: At proof approval, not at order placement, and it is counted in business days. Keep production turnaround and shipping transit as two separate clocks so a carrier delay never gets blamed on the print shop.
  - q: What is a gang run and why does it matter for the data model?
    a: A gang run places several separate jobs on one shared press sheet to split setup and paper cost. Your model needs a batch entity that groups jobs by shared stock, color, and size, because jobs flow individually through proof, merge at printing, then split again for finishing and shipping.
  - q: What is preflight in print production?
    a: Preflight is the automated validation of a customer's file before printing, checking resolution, color mode, bleed, and fonts. If a file fails, production cannot start until it is corrected, and the software should return a plain-language reason plus a re-upload path.
author: Brexis Wazik
transformed: true
linked: true
topic: print-production-craft
topicTitle: Print Production Craft
category: Engineering
date: '2026-06-21'
order: 13
icon: "\U0001F4D0"
sources: []
---

A barista does not look up "large oat-milk two-shot extra-hot" on a shelf. They build it from rules, and the price falls out of the combination. Print software works exactly the same way, which is why a normal e-commerce data model quietly breaks the moment you try to sell a business card.

If you have ever tried to fit a print product into a Shopify-style product table, you already felt the friction. The price would not sit still. The "double-sided" checkbox did not capture what the shop actually charges for. And there was nowhere to put the most important moment in the whole order: the customer saying "yes, print it."

This is the synthesis chapter. Everything earlier in this series taught you a piece of the physical craft: paper, color, presses, finishing, files, shipping. Now we ask the one question a software builder has to answer. **What does the data model need to look like so the screen tells the truth about the factory?**

## Why this matters

Get the model wrong and the damage is not cosmetic. You quote a price the shop cannot honor. You accept an order that physically cannot be made. You tell a customer their job is "shipped" when half of it is still on the bindery floor. You eat a reprint because nobody can prove which proof was approved.

Get it right and the payoff is the industry's stated dream: an online order becomes a factory work order automatically, with zero re-entry and zero errors. The storefront sells the configurable product, the back office tracks it through production, and the two never disagree.

Two plain definitions before we go further, because they show up everywhere:

- **Data model** is the shape of the information your software stores: which fields exist, what type they are, and how records connect (an order has many line items, a line item has one spec).
- **Spec** is the full description of exactly what is being printed: size, paper, colors, finishing, quantity. In print, the spec is the heart of the order.

## The core insight: a print job is a recipe, not a product row

Normal e-commerce models a **SKU** (Stock Keeping Unit), which is one fixed sellable thing with a known price sitting on a shelf. A t-shirt comes in small, medium, and large. You pick one, and the price gets looked up from a table. That model works because the variants are finite and the price already exists.

Print breaks all of that. A print product is a **configured manufacturing spec**. The customer assembles a recipe (size times paper times ink-sides times quantity times finishing), and the price, weight, file requirements, and turnaround all change with the recipe. There is no shelf and no pre-known price. The software computes everything from the configuration.

Three specific things make print software hard, and generic models get all three wrong:

1. **Price is computed, not looked up.** It comes from many interacting attributes, not a single row.
2. **There is a mandatory human gate mid-order.** Proof approval pauses the order, waits on the customer, and legally cannot proceed without a recorded sign-off.
3. **The order produces a physical thing through a multi-stage pipeline.** That pipeline can split (a partial shipment) and merge with other customers' work (a gang run). A single "shipped: yes/no" flag cannot describe it.

### Where this kind of software lives

You will meet two industry terms when you talk to shops.

**Print MIS / Print ERP** is the back-office software a shop runs: estimating, order entry, the **job ticket** (the printable work order that follows a job through the floor), scheduling, paper and ink inventory, job costing, shipping, and invoicing.

**Web-to-print** is the customer-facing storefront that lets buyers configure and order, then feeds those orders into the MIS.

A modern platform is essentially web-to-print plus a light MIS. It must both sell the configurable product and track it through production. Hold that dual job in mind; every decision below serves one or both halves.

## The spec model: what print actually has to capture

The spec must be structured, machine-readable data. The industry literally passes it around as JSON, XML, CSV, or a **JDF** job ticket (Job Definition Format, the print world's standard digital work-order file). Here is what every spec carries.

### Size and dimensions

Capture **width, height, and units**. Two sizes can matter at once:

- **Flat size** is the unfolded sheet. A tri-fold brochure is flat at 11 by 8.5 inches.
- **Finished size** is the size after folding and trimming. That same brochure finishes at roughly 3.67 by 8.5 inches.

For **wide-format** work (banners, posters, large prints), size is continuous. Any width by any height, not a picklist. That single fact forces a different pricing engine, which we will get to. Also store the **bleed** size, which is the trim size plus 0.125 inches on each edge.

### Stock: the paper or material

[**Substrate**](/blog/print-production-craft/08-substrates-materials-paper-gsm-coatings-specialty-stocks) just means the material you print on. Its weight is expressed in three competing systems, and this is a classic data-model trap.

| System | What it measures | Why it's tricky |
| --- | --- | --- |
| **GSM** (grams per square meter) | Weight of a 1 m² sheet | International and unambiguous; store this canonically |
| **lb** (US pounds) | Weight of a ream at a category's basis size | Ambiguous: "lb bond/text" and "lb cover" use different reference sheets, so the scales do not match |
| **pt / point / caliper** | Thickness in thousandths of an inch | Used for cardstock and business cards; measures thickness, not weight |

These reference equivalents are worth locking into your seed data:

| US weight | GSM | Typical use |
| --- | --- | --- |
| 20 lb bond | 75 GSM | Copy paper |
| 80 lb text | 118 GSM | Flyers |
| 100 lb text | 148 GSM | Brochures, booklet interiors |
| 100 lb cover | 270 GSM | Postcards, covers |
| 110 lb cover | 300 GSM (about 14 pt) | Premium cards |
| 130 lb cover | 350 GSM (about 16 pt) | Heavy premium cards |

Conversion factors to GSM: **bond times 3.76, text times 1.48, cover times 2.70.** Business cards are commonly 14 pt and 16 pt; the USPS postcard minimum is 7 pt.

Two traps live in this one field. First, **never store only the lb number.** "100 lb" is meaningless without the category: 100 lb text is a thin flyer page, while 100 lb cover is stiff cardstock. Store GSM canonically and show friendly equivalents in the interface. Second, **weight is not thickness.** A tightly pressed coated 200 GSM sheet can feel thinner than a fluffy uncoated 200 GSM sheet, so do not let your UI imply heavier equals thicker.

For heavier work, model two more fields: **grain direction** (folding against the grain on thick stock cracks it) and **coating** (gloss, matte, or uncoated, which affects which inks and finishes are compatible).

### Color and sides: the 4/4 vocabulary

Printers describe ink coverage as **front-over-back counts.** The number before the slash is the front; the number after is the back.

- [**CMYK**](/blog/computer-graphics-print/02-color-spaces-additive-vs-subtractive-color) is the four process colors: Cyan, Magenta, Yellow, and Black (the "K"). So "4" almost always means full color.
- **4/4** ("four over four") is full color both sides.
- **4/0** is full color front, blank back.
- **4/1** is full color front, single ink (usually black) back.
- **1/1** is black both sides; **1/0** is black front only.

Beyond CMYK there are **Pantone (PMS) spot colors**, which are exact branded inks mixed to a recipe (a logo red that must be identical every time). Each spot color is an extra ink, an extra plate, and extra cost.

The mistake here is modeling sides as a boolean: double-sided yes or no. The number of inks per side changes plates and press passes, and therefore price. Model sides as a **priced choice** using the 4/4 vocabulary, with front and back independent.

### Finishing: priced choices with compatibility rules

[**Finishing**](/blog/print-production-craft/09-finishing-bindery-everything-after-the-press) (also called bindery or post-press) is everything done after the ink hits the sheet. These are the high-margin add-ons. Each one can add cost, time, and weight, and each may be incompatible with certain stocks.

| Term | Plain meaning |
| --- | --- |
| **Lamination** | Plastic film over the sheet (gloss, matte, soft-touch); adds durability |
| **UV / spot UV** | Clear hard coat cured under UV light; "spot" means gloss on chosen areas only |
| **Foil stamping** | Metallic foil pressed on with a heated die; needs a one-time die; clashes with some coatings |
| **Emboss / deboss** | Raised or recessed impression |
| **Die cutting** | Cutting a custom shape with a die |
| **Scoring** | Pressing a crease so a fold is clean; mandatory on heavy stock before folding |
| **Folding** | Half, tri-fold, z-fold, gate |
| **Perforation** | A tear line |

For multi-page products, **binding** holds the pages together:

| Binding | How it works | Best for |
| --- | --- | --- |
| **Saddle stitch** | Folded sheets stapled through the spine | Booklets to about 64 pages; page count must be a multiple of 4 |
| **Perfect binding** | Pages glued at a flat spine with a wraparound cover | Thick books, catalogs |
| **Spiral / Wire-O** | Coil through punched holes | Notebooks, manuals that lie flat |
| **Case bound** | Hardcover | Premium books |

Here is the part most configurators get wrong: make finishing options **rule-based, not just priced.** The configurator must block impossible combinations (foil on a stock that cannot take it, folding heavy stock without a score, an odd page count for saddle stitch) rather than quietly accepting an order that can never be made. Prevent it, do not just price it.

### The spec, summed up

A spec equals attributes (size, stock, sides, page count) plus a set of priced options (finishing) plus compatibility rules. Every option should carry a price delta, an optional time delta, an optional weight delta, and any one-time die or setup fee.

## Pricing: where print diverges hard from e-commerce

One pricing strategy cannot serve all products. You need at least three, living side by side as interchangeable strategies rather than tangled into one formula.

### Quantity price breaks

This is the default for short-run work. The per-unit price falls as quantity rises, because the [**setup cost**](/blog/print-production-craft/11-print-shop-economics-costing-make-ready-margins-quoting) (plates, press make-ready, prepress labor) is fixed and gets spread across the run. At low quantity, setup dominates the total. At high quantity, per-piece material cost dominates.

Model it as `price = setup_fee + (per_unit × qty)` with a tier table. Breaks sit at thresholds the shop sets, such as 100 / 250 / 500 / 1000 / 5000. The steepest savings live in the low-to-mid hundreds; after 1000 the curve flattens.

Because the tiers are stepped, ordering more can sometimes cost less in total. If 500 cards land just below a big 1000-count break, the total for 1000 might be only a little higher. A good interface surfaces a gentle nudge: "Add 120 more to reach the 1000 price break and save."

One detail to pin down explicitly, because the two flavors produce different totals:

| Type | How it prices |
| --- | --- |
| **Volume pricing** | Once you hit a tier, all units price at that tier's rate |
| **Tiered / graduated** | Each tier's units price at that tier's own rate (first 100 at rate A, next 400 at rate B) |

### Square-foot pricing for wide format

Banners, signs, and posters price by area: `price = width_ft × height_ft × rate_per_sqft`. Real-world rates run from about 2 to 9 dollars per square foot; the material drives the rate, since vinyl costs more than paper or fabric.

A 6 by 3 foot banner is 18 square feet. At 8 dollars per square foot, that is roughly 144 dollars before add-ons. Two refinements: rates are often **degressive** (each successive square foot is a little cheaper, a built-in volume curve on area), and there is usually a minimum charge. This is a distinct pricing strategy, a formula sitting alongside the per-unit tier tables, not bolted onto them.

### One-time and per-color charges

Foil and die cutting need a one-time **die charge**. Offset spot colors need a **plate charge**. Finishing can be billed per piece or per job. Model these as charges amortized over the run, separate from the per-unit price.

And one rule that prevents a whole category of pain: **the customer-facing calculator and the admin estimate must produce identical numbers.** Keep a single source of pricing logic so the storefront and the back office never disagree. A quote the shop cannot honor is worse than no quote at all.

## The production status workflow

An order is not a single event. It is a journey through the shop floor, and you should model it as an explicit, ordered state machine.

The canonical path runs: order received, then prepress, then proof, then the **proof approval gate** (which loops back on every change request), then approved and scheduled, then printing, then finishing, then packaging, shipped, and delivered. Off to the side sit states like on hold, awaiting files, awaiting payment, reprint, and cancelled.

| Stage | What happens, in plain English |
| --- | --- |
| **Prepress** | File prep and color management; the **preflight** file check and [**imposition**](/blog/computer-graphics-print/14-imposition-binding-arranging-pages-on-the-sheet) (arranging pages and copies on the big press sheet so it cuts apart correctly). Bad files bounce back here. |
| **Proof** | The system generates a **proof**, a sample (a PDF "soft proof" or a printed "hard proof") for the customer to check |
| **Proof approval gate** | The customer approves or requests changes. This is the single biggest bottleneck and the timing anchor. |
| **Printing** | For offset: making plates and **make-ready** (aligning the press before the real run), then the run with quality-control checks |
| **Finishing** | Trimming, folding, scoring, lamination, foil, binding, assembly |
| **Packaging to delivered** | Pack, hand to the carrier with a tracking number, complete |

Three modeling rules matter here:

- **Keep two label sets.** Show customers plain language ("Proof ready," "In production," "Shipped") and keep internal codes for the floor. Never surface "PREPRESS_QC_HOLD" to a buyer.
- **Start the turnaround clock at proof approval,** not at order placement.
- **Audit every transition:** who changed it, from what to what, and when. Status history is business-critical for support and disputes.

### The proof approval gate deserves first-class treatment

This is the one place an order pauses on the *customer*. Make it a versioned, audit-logged gate. Store every proof version, who approved it, and the exact timestamp. That approval timestamp is what anchors the production clock.

Skip this and you are one dispute away from a loss. When a customer says "I never approved that color," the shop needs to show the exact proof version and the signed-off timestamp. Without an audit trail, the shop eats the reprint.

## File and preflight requirements

The order is not real until a valid file backs it. [**Preflight**](/blog/computer-graphics-print/13-preflight-validating-a-file-before-it-prints) is the pre-print validation of the customer's file, like a pilot's checklist before takeoff. Four core checks every print PDF must clear:

| Check | Requirement | If it fails |
| --- | --- | --- |
| **Resolution** | At least 300 DPI at final size | Blurry, pixelated print (the number-one rejection) |
| **Color mode** | CMYK, not RGB | Colors shift on conversion; bright blues and greens worst |
| **Bleed** | 0.125 inch on all four sides, plus a safe margin keeping critical content off the trim line | White slivers at the edge after cutting |
| **Fonts** | All embedded or outlined | Printer substitutes the wrong fonts and spacing |

Quick definitions: **DPI** is dots per inch, a measure of image detail. **Bleed** is artwork extended past the trim so no white edge shows after cutting. **Trim** is the final cut size. Shops run preflight automatically and reject non-compliant files with a report; production cannot start until the file is fixed and re-uploaded.

The craft is in the translation. Gate the order on a pass or fail, but turn the result into something a non-technical buyer understands. Not "RGB profile in PDF/X-1a, missing embedded glyphs," but "Your file uses screen colors (RGB); print needs CMYK, so colors may shift. Please re-export and upload again." Then offer a clean re-upload loop. This heavy file work belongs in a dedicated service, behind a feature flag, not inline in the web app.

## Turnaround and SLA: model time with two clocks

**SLA** stands for Service Level Agreement, the promised timing. The critical rule: **production turnaround and shipping transit are two separate clocks. Never merge them.** Blend them and customers will blame the shop for a carrier's delay.

- **Production turnaround** runs from proof approval to ready-to-ship, counted in business days (no weekends or holidays), starting the day after approval. The typical standard is 3 to 5 business days; rush can be 24 hours, often with a cutoff ("approve before noon or it slips a day").
- **Shipping transit** is the carrier's separate clock once the parcel leaves.

A customer approves their proof Friday at 4pm. Production is "3 business days." The clock starts *Monday* (the weekend is skipped), so ready-to-ship is end of Wednesday. Add 2-day ground shipping and delivery lands the following Friday. A single merged "5-day" number would have promised Tuesday and broken trust.

So store `production_days` and rush options per product, compute the estimated ship and delivery dates from the approval timestamp plus a business-day calendar plus the chosen shipping method, and display the two legs separately.

## Weight and shipping: derive the physical numbers

Each finished piece has a weight. Total parcel weight equals per-piece weight times quantity, plus packaging. Per-piece weight comes from the stock (GSM times sheet area) plus any weight-adding finishing like lamination. The packed parcel's dimensions drive **dimensional weight**, since carriers charge on size as well as actual weight for bulky-but-light parcels.

The best practice is to make weight derivable from the spec, allow per-product and per-option overrides, and then **snapshot** the weight onto the order at purchase time. If a stock's weight gets edited next month, last month's shipped orders must keep their original math. This is the same snapshot discipline you want for the whole spec.

## Partial fulfillment: the order can split

A print order often ships in parts. One item finishes first, or a "blind drop ship" sends pieces to several addresses, or delivery is staged. **Partial shipment** means the order arrives in fragments as items become ready, with the rest following later (and shipping may be charged per shipment).

This is where a single order-level "shipped: true/false" flag falls apart. It cannot represent "200 of the 500 booklets shipped, the banner ships tomorrow." An order needs **many shipments (one-to-many),** each with its own line-item quantities, tracking number, and status. Build this in from day one; retrofitting it later is painful.

## Gang run: orders merge at production

A **gang run** places multiple separate jobs on one shared press sheet so they split the setup, plate, and press cost and waste less paper. The sheet is cut apart after printing.

Two different 8.5 by 11 forms, 5,000 each, on the same paper and ink, ganged onto shared sheets, can save roughly a third versus two separate runs. Imposition software can gang well over a hundred different orders onto one layout, auto-rotating pieces to minimize waste.

The hard constraint: every ganged job must share the same stock and the same ink and color spec, and it runs on sheet-fed CMYK presses. The trade-offs you must be able to model and communicate:

- **Color accuracy is harder.** Roughly 10 percent color variance is "standard" in gang runs. Sensitive colors (orange, purple, brown, neutral gray, lime green) drift most.
- **Ghosting** can happen: a neighbor's heavy solid ink area faintly affects your piece.
- **Reprints cost more,** because rerunning your piece reproduces the neighbors too.
- It is **unsuitable** for special stocks, special effects, or tight brand-color jobs.

In the model, this is a **batch entity** that groups eligible jobs by shared stock, color, and size. Jobs flow individually through prepress and proof, then merge at the printing stage, then split again for finishing and shipping. Let customers opt out for brand-critical color, and disclose the variance expectation up front so a slightly-off color is never a surprise dispute.

## Three examples, end to end

**Business cards** (short-run, gang-run candidate). Spec: 3.5 by 2 inches, 16 pt gloss cover (about 350 GSM), 4/4, with matte lamination, rounded corners, and spot UV. Pricing: quantity tiers with setup amortized; lamination per piece; a one-time rounded-corner die. Production: prepress, proof, approval, gang run with other 16 pt cards, cut, laminate, ship in 3 to 5 business days. File: 3.5 by 2 plus 0.125 bleed, CMYK, 300 DPI, fonts embedded.

**Vinyl banner** (wide format, square-foot pricing, no gang). Spec: 36 by 80 inches (about 20 square feet), 13 oz scrim vinyl, 4/0, with hemmed edges and grommets every 2 feet. Pricing: about 20 square feet times 8 dollars, roughly 160 dollars, plus hem and grommet add-ons, a degressive rate on larger sizes, and a minimum charge. Production: large-format printer (no plates), then weld/hem and grommets. File: artwork often scaled, CMYK, lower DPI acceptable at viewing distance.

**Saddle-stitch booklet** (multi-page, binding, partial fulfillment). Spec: 8.5 by 11, 28 pages (a multiple of 4), 100 lb gloss text interior (148 GSM) with a 100 lb gloss cover (270 GSM), 4/4 throughout, saddle stitch, aqueous coat on the cover. Pricing: per-page plus cover plus binding plus quantity tiers; page count drives imposition into signatures. Production: prepress imposes signatures, proof checks page sequence, then print, fold, collate, stitch, trim, ship. Ordered alongside other items, the booklets may ship separately when bindery finishes, which is partial fulfillment in action.

## Common misconceptions

These are the myths that produce broken print software:

- **"A print product is just a SKU with options."** No. It is a configurable spec; fixed variants cannot represent size by stock by sides by finishing by quantity.
- **"Double-sided is a yes/no field."** The inks per side change plates, passes, and price. Use the 4/4 vocabulary with front and back independent.
- **"Price can be looked up from a table."** It is computed, and ignoring setup-fee amortization gives wrong totals at low quantity.
- **"One pricing rule fits everything."** Wide format needs square-foot pricing; cards need quantity tiers.
- **"The turnaround clock starts when they pay."** It starts at proof approval, and production time is separate from shipping.
- **"An order has one shipment."** Without one-to-many shipments you cannot do partial, backorder, or multi-address fulfillment.
- **"Storing the lb weight is enough."** It is ambiguous; store canonical GSM or you will pick the wrong stock and miscalculate shipping.
- **"Editing a stock's weight is harmless."** Not if you never snapshotted the order; later edits silently corrupt historical orders.

## How to use this

A concrete build order, in priority sequence:

1. **Model the product as a spec,** not a SKU: attributes plus priced options plus compatibility rules.
2. **Store GSM canonically** for every stock, and show lb and pt equivalents only in the UI.
3. **Make pricing strategy pluggable:** support quantity tiers and square-foot pricing and formula add-ons, behind one shared engine the storefront and admin both call.
4. **Build the status machine explicitly,** with dual labels (customer-friendly and internal) and an audit trail on every transition.
5. **Make proof approval a first-class, versioned, timestamped gate,** and anchor the production clock to it.
6. **Run automated preflight,** gate the order on the result, and always return a human-readable failure plus a re-upload path.
7. **Use two time clocks:** production business days from approval, and carrier transit, displayed separately.
8. **Snapshot spec, weight, and finishing onto the order** at purchase so later edits never rewrite history.
9. **Support one-to-many shipments** and a gang-run batch entity from the start.

And when you call a real shop to validate your model, lead with the spec in their language. Not "I need a small double-sided card in heavy paper," but: "3.5 by 2, 16-point gloss cover, 4-over-4, matte lamination both sides, rounded corners, 500 pieces. What's your standard turnaround from proof approval, and do you gang these?" That one sentence tells them you understand size, caliper, ink coverage, finishing, quantity, the SLA clock, and gang runs. Then ask the questions that fill gaps in your data model: how do you handle a file that fails preflight, do you charge shipping per shipment on partial deliveries, and what's your color variance tolerance on gang runs.

## Conclusion

The whole guide reduces to one engineering instruction. Model the print product as a **spec, a recipe with priced options and compatibility rules.** Compute price by strategy. Gate the order on a versioned proof approval and an automated preflight. Track an explicit, audited status machine. Snapshot weight and spec onto the order. Support many shipments and gang batching. Build that, and your software finally tells the truth about the factory.

Here is the thread worth pulling next: notice how often the answer was "snapshot it onto the order." That instinct, capturing the exact state of the world at the moment money changes hands, is not a print quirk. It is the same discipline that keeps invoices, tax records, and audit logs honest across every serious system you will ever build. Print just makes the cost of forgetting it impossible to ignore.
