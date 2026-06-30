---
title: Print Production FAQ Every Software Builder Should Know
metaTitle: Print Production FAQ for Builders
description: >-
  A plain-English print production FAQ for software builders: offset vs digital,
  CMYK, GSM, bleed, preflight, gang runs, and how print pricing really works.
keywords:
  - print production FAQ
  - offset vs digital printing
  - RGB vs CMYK
  - what is GSM paper
  - what is bleed in print
  - preflight print files
  - gang run printing
  - print pricing tiers
  - dimensional weight shipping
  - Pantone spot color
  - DPI for printing
  - print on demand SaaS
faq:
  - q: When is digital printing cheaper than offset?
    a: >-
      Digital wins on short runs because it has almost no setup cost. Offset wins
      on long runs because its fixed make-ready is spread thin. The crossover is
      usually somewhere around 500 to 1,500 copies.
  - q: Why doesn't my screen color match the print?
    a: >-
      Screens emit light and mix Red, Green, Blue; print absorbs light and mixes
      Cyan, Magenta, Yellow, Black. CMYK can't reproduce some of the vivid colors
      a screen can glow, so neon blues print duller. It's physics, not a bug.
  - q: What is bleed and why do print files need it?
    a: >-
      Bleed is extra image area, usually 3 mm, that extends past the final trim
      edge. Because cutting blades shift slightly, bleed stops thin white slivers
      from appearing along the edges of your printed piece.
  - q: What does 4/4 or 4/0 mean in printing?
    a: >-
      It is shorthand for ink colors front over back. 4/4 is full color on both
      sides, 4/0 is full color on the front with a blank back, and 1/0 is one ink
      on the front only.
  - q: What is preflight in printing?
    a: >-
      Preflight is the automated check of a customer's file before it goes to
      press, like a spell-checker for print. It verifies bleed, resolution, color
      mode, fonts, and page size so flaws are caught before thousands print.
topic: print-production-craft
topicTitle: Print Production Craft
category: Engineering
date: '2026-06-21'
order: 15
icon: "\U0001F4D0"
author: Pritesh Yadav (priteshyadav444)
transformed: true
linked: true
sources: []
---

A customer uploads a glowing neon-blue flyer, approves the proof, and then emails you furious because the printed version looks "muddy." Nothing went wrong. The press did exactly what physics demands. You just didn't have the vocabulary to warn them.

Print has its own language, and if you're building software around it, that language is your spec sheet. This is the plain-English FAQ that software builders almost always reach for in their first month. No jargon left undefined, and where it helps, a note on what to store in your data model.

## Why this matters

Print looks deceptively simple from the outside: upload a file, pick a quantity, get boxes. Underneath, every one of those choices touches a cost, a constraint, or a quality risk that your software has to model correctly.

Get the model right and your quotes are accurate, your previews are honest, and your support inbox stays quiet. Get it wrong and you ship 5,000 flawed pieces, eat the reprint, and lose the customer.

The good news: you don't need to run a press. You need to understand a handful of concepts well enough to capture the right fields and warn people at the right moment.

## Offset vs digital: where the money flips

**Offset** presses transfer ink from metal plates onto a rubber blanket, then onto paper. Making those plates and tuning the press, a step called **make-ready**, costs real time and money before a single good sheet appears. But once it's running, each extra sheet is almost free.

**Digital** printing (toner or inkjet) has almost no setup. It works like a giant office printer, so the cost is roughly the same per page whether you print 1 or 500.

The rule of thumb: short runs are cheaper digital, long runs are cheaper offset. For typical color jobs the crossover sits somewhere around **500 to 1,500 copies**, depending on size, paper, and shop. Below that, go digital. Well above it, go offset.

Think of it like cooking. Offset is a catering kitchen: huge effort to set up, then cheap per plate. Digital is a home microwave: instant, but the per-plate cost never drops.

## Why your screen lies about color (RGB vs CMYK)

Your screen makes color by emitting **light**, mixing Red, Green, and Blue (**RGB**). That's an *additive* system, and bright glowing colors come easily.

Print makes color by laying down **ink** that absorbs light, mixing Cyan, Magenta, Yellow, and Black (**CMYK**). That's a *subtractive* system, and it simply can't reproduce some of the [vivid blues, greens, and oranges](/blog/computer-graphics-print/05-gamut-out-of-gamut-handling-deep-dive) a screen can glow. So a neon screen-blue prints duller. Normal physics, not a defect.

The fix is threefold: design and proof in CMYK, use a shared [**color profile**](/blog/computer-graphics-print/03-color-management-icc-profiles-the-pipeline) (like GRACoL in the US or FOGRA in Europe) so everyone aims at the same target, and have your software warn customers the moment they upload an RGB file.

## Picking paper: GSM in plain terms

**GSM** means grams per square meter, the weight of one square meter of the paper. Higher GSM generally means thicker, stiffer, more premium-feeling stock. It's the cleanest way to specify paper because it doesn't depend on sheet size, unlike the US "pound" system, which does.

A quick map:

- **80 to 120 gsm** - letterhead, copy paper, cheap flyers
- **130 to 170 gsm** - quality flyers, posters, magazine pages
- **200 to 300 gsm** - postcards, menus, light covers
- **300 to 400 gsm** - business cards, premium cards, packaging

If you've ever felt a restaurant menu that bends like cardboard versus one that flops like a napkin, that difference is GSM.

## Bleed, trim, and safe zone

**Bleed** is extra image area that extends past the final trimmed edge, usually **3 mm** (about 0.125 in) on each side. Cutting blades and folded sheets shift by tiny amounts, so if your background stopped exactly at the edge, you'd get thin white slivers. Bleed gives the cutter a safety margin so ink runs all the way to the edge.

There are three zones to think about:

- **Bleed** - the area that gets cut into
- **Trim** - the final size
- **Safe zone** - keep important text about 3 mm inside the trim so it isn't sliced off

Your [preflight](/blog/computer-graphics-print/13-preflight-validating-a-file-before-it-prints) code should confirm uploaded files actually include [bleed](/blog/computer-graphics-print/15-finishing-document-geometry-bleed-trim-safe-area). Most don't, unless you tell people to add it.

## Reading printer shorthand: "4/4" and "4/0"

This is printer code for **ink colors front / back**. The "4" means full-color CMYK (four inks).

- **4/4** - full color both sides
- **4/0** - full color front, blank back
- **1/0** - one ink (e.g. black) on front only
- **4/1** - full color front, black-only back (common for flyers)

In software, model this as two fields, `front_colors` and `back_colors`. It drives both pricing and plate/press setup.

## Gang runs: why 500 business cards cost so little

**Ganging** means combining several different jobs, often from different customers, onto one big press sheet so they share the same make-ready and run together. It slashes the per-job setup cost, which is exactly how online "trade printers" sell 500 business cards for the price of a sandwich.

The trade-off: ganged jobs run on standard sizes and stocks, on the shop's schedule. You give up customization and speed control in exchange for the low price.

## How a print job is actually priced

A quote is built from layers, not a single number:

1. **Setup / make-ready** - fixed cost per job (plates, press tuning, file prep), spread across the run
2. **Materials** - paper plus ink, scaled by quantity and size
3. **Running / click cost** - press time on offset, or per-impression "click" charges on digital
4. **Finishing** - cutting, folding, binding, lamination, and so on
5. **Overhead and margin** - the shop's fixed costs and profit

Because setup is fixed, the **per-unit price drops as quantity rises**. That's why print uses quantity-tier pricing instead of one flat unit price, and why your pricing engine should think in tiers from day one.

### What make-ready really is

**Make-ready** is all the work to get a press producing good sheets: mounting plates, loading paper, balancing ink and water, and running waste sheets until the color is correct. It's mostly a fixed cost per job and the single biggest reason short runs are expensive on offset. Digital has almost no make-ready, which is its whole advantage.

## Finishing options worth offering

Offer the common, high-demand options and tie each to a price modifier:

- **Lamination / coating** - gloss, matte, or soft-touch (protects and changes the feel)
- **Folding** - half, tri-fold, gate, and others for brochures
- **Binding** - saddle-stitch (stapled), perfect bound (glued spine), spiral or wire
- **Cutting / shaping** - rounded corners, die-cut shapes
- **Embellishments** - foil stamping, embossing, spot UV (premium upsells)
- **Drilling, scoring, perforation** - for hang tags, tear-offs, easy folds

Model finishing as a list of selectable options, each with its own pricing rule and any constraints. Saddle-stitch, for example, needs a page count divisible by four.

## Preflight: the spell-checker for print

**Preflight** is the automated check of a customer's file *before* it goes to press. It verifies bleed, resolution (DPI), color mode (CMYK vs RGB), embedded fonts, correct page size, and overprint settings.

Good preflight catches problems while they're still cheap to fix, instead of after 5,000 flawed pieces have printed. For a SaaS, preflight-on-upload is one of the highest-value features you can build, full stop.

### DPI: how many dots you need

**DPI** (dots per inch) measures how much detail an image holds at its print size. Too few dots and it looks blurry or blocky, what people call "pixelated." The press standard is **300 DPI at final print size** for photos.

Large signage viewed from far away can use far less (72 to 150 DPI) because distance hides the dots. Your uploader should compute the effective DPI from pixel dimensions versus placement size, then warn when it's too low.

### Pantone and spot colors

CMYK builds colors by overlapping four inks, which can drift slightly batch to batch. A [**Pantone / spot color**](/blog/computer-graphics-print/06-ink-on-the-page-spot-colors-overprint-black-generation) is a single pre-mixed ink with a standardized recipe (a PMS number), so a brand red is identical everywhere.

You need spot colors for brand consistency, metallics, fluorescents, or colors CMYK simply can't reach. They add a press unit and cost, so treat them as a paid option, mostly on offset.

## Apparel printing: DTG vs DTF vs screen

| Method | How it works | Best for |
| --- | --- | --- |
| **Screen printing** | Ink pushed through a stencil/mesh, one screen per color | High volume, few colors, durable |
| **DTG (direct-to-garment)** | Inkjet prints directly onto fabric | Full-color, photo designs, low quantities |
| **DTF (direct-to-film)** | Print on film, then heat-press transfer | Many fabric types, small batches, vivid color |

Notice the pattern: screen printing has a setup cost per color, much like offset's make-ready, so it wins at volume. DTG and DTF have little setup, so they win for one-offs and full-color art. It's the same economics as paper printing, wearing a t-shirt.

## Shipping: parcel, freight, and the weight trap

**Parcel** is individual boxes shipped via carriers like UPS, FedEx, or USPS, fine for small, light orders. **Freight** (often **LTL**, short for "less-than-truckload") is for heavy or bulky shipments on pallets: large poster runs, boxes of catalogs, signage. The break point is usually around **68 to 70 kg (150 lb)** or when goods go on a pallet.

The trap is **dimensional (volumetric) weight**. Carriers bill the *greater* of actual weight or a size-based weight, because a truck fills up by space, not just by mass. A typical formula is `(L × W × H in cm) ÷ 5000 = dim weight in kg`, though the divisor varies by carrier and units.

Light, bulky print like banners, foam board, and packaging is often billed on dim weight. So a big box of foam signs can cost far more than the scale suggests, which means your shipping estimator must store box **dimensions**, not just weight.

## Common misconceptions

A few beliefs that quietly cause trouble:

- **"Digital printing is always greener."** Not always. Digital is greener for short runs (no plates, less make-ready waste, print on demand), but offset can be greener per unit at high volume. The bigger levers are FSC-certified or recycled paper, vegetable or soy-based inks, water-based or UV-LED curing, and right-sizing quantities. Back "eco" claims with certifications, not vibes.
- **"Markup and margin are the same thing."** They aren't. **Markup** is profit as a percentage of *cost*; **margin** is profit as a percentage of *selling price*. A 50% markup is only a 33% margin. Mixing them up quietly erodes profit, so pick one convention and label it clearly.
- **"The screen proof is what I'll get."** Only if it's a calibrated, CMYK soft-proof. A raw RGB screen will almost always look more vivid than the print.

For reference, the two pricing formulas:

- `Markup % = (Price − Cost) ÷ Cost × 100`
- `Margin % = (Price − Cost) ÷ Price × 100`

## How to use this when you build

If you're modeling print in software, here's a concrete starting checklist:

1. **Store color as two fields** - `front_colors` and `back_colors` so pricing and press setup both have what they need.
2. **Price in quantity tiers**, never a flat unit price, because fixed setup makes per-unit cost fall as volume rises.
3. **Run preflight on upload** - check bleed, effective DPI (target 300), color mode, fonts, and page size; warn loudly on RGB and low resolution.
4. **Capture dimensions, not just weight**, so your shipping estimator can handle dimensional weight on bulky items.
5. **Model finishing as options with constraints** - for example, enforce page counts divisible by four for saddle-stitch.
6. **Use a clear status spine** customers understand: `Order Received → File Check (Preflight) → Approved / Proof Sent → In Production → Finishing → Quality Check → Shipped → Delivered`. Add side states for **Action Needed**, **On Hold**, and **Cancelled/Refunded**, and log every transition (who, what, when) for support and disputes.

You don't need to do [**imposition**](/blog/computer-graphics-print/14-imposition-binding-arranging-pages-on-the-sheet) math (arranging pages on a big sheet so they end up in the right order after folding and cutting) or **batching** (grouping same-stock, same-size jobs to share setup). But capture the attributes that let a shop do it: size, stock, color setup, and finishing.

## Conclusion

If you remember one thing, make it this: **almost every cost in print comes down to setup spread across quantity.** Make-ready, plates, screens per color, gang runs, quantity tiers, even the offset-vs-digital decision all orbit that single idea. Once it clicks, the rest of the vocabulary stops feeling like trivia and starts looking like one consistent system.

Which raises the next question worth chasing: if setup is the enemy of short runs, how far can on-demand and automated workflows push that setup cost toward zero before "printing one" costs the same as "printing a thousand"? That's where the most interesting print software is being built right now.
