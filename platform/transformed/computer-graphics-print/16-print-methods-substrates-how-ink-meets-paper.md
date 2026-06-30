---
title: 'Print Methods Explained: Which One Fits Your Job?'
metaTitle: 'Print Methods & Substrates Explained'
description: >-
  Offset, digital, screen, DTG, or flexo? Learn how each print method works, its
  cost sweet spot, and how paper and ink choices decide which one wins your job.
topic: computer-graphics-print
topicTitle: Computer Graphics for Print
category: Engineering
date: '2026-06-21'
order: 15
icon: "\U0001F5A8️"
keywords:
  - print methods explained
  - offset vs digital printing
  - screen printing vs DTG
  - what is a substrate in printing
  - paper weight gsm vs lb
  - coated vs uncoated paper
  - flexography printing
  - run length break even
  - Pantone spot color vs CMYK
  - total ink coverage TAC
  - wide format printing
  - rich black CMYK values
faq:
  - q: What is a substrate in printing?
    a: A substrate is simply the material you print onto, whether that is paper, card, a T-shirt, vinyl, or a cardboard box. It is the industry word for the surface that receives the ink.
  - q: When should I use offset instead of digital printing?
    a: Offset wins on long runs because its low per-piece cost eventually swamps the high setup fee. On paper jobs the break-even is roughly 2,000 pieces. Below that, digital is cheaper because it has no plates or setup.
  - q: What is the difference between screen printing and DTG?
    a: Screen printing pushes thick ink through a stencil and gets cheaper per shirt as quantity rises, so it suits larger orders (around 24+). DTG sprays ink directly into the fabric with no screens, so its cost stays flat, which is ideal for small or one-off orders.
  - q: Why does 80 lb paper come in two very different weights?
    a: The US "lb" rating depends on a paper category's basic sheet size, which differs between text and cover stock. So 80 lb text is light brochure paper (around 104 gsm) while 80 lb cover is heavy card (around 218 gsm). Always specify gsm and category.
  - q: What is dot gain and why does paper coating change it?
    a: Dot gain is the tendency of printed dots to spread and print larger than intended, making the result darker. Coated paper seals the surface so ink sits on top and dots stay sharp (low dot gain), while uncoated paper soaks ink in and spreads it (high dot gain).
  - q: What is total ink coverage and why does it matter?
    a: Total Area Coverage (TAC) is the maximum combined CMYK percentage allowed in your darkest shadows. Go over the limit, around 300% on coated offset, and the ink will not dry properly, causing smearing. Build rich blacks like 60/40/40/100 to stay safe.
author: Brexis Wazik
transformed: true
linked: true
sources: []
---

Two print shops quote the same 5,000 flyers. One says 28 cents a piece. The other says 48 cents a piece. Neither is lying, cheating, or wrong. They are simply using different machines, and the machine decides the price.

That single fact is the secret most people never learn about printing. There is no "best" press. There is only the right press for a specific quantity, on a specific material, at a specific quality bar. Get those three right and the method almost picks itself.

## Why this matters

If you ever order printed work, design it, or sell it, you are constantly making a choice you may not even notice. Business cards, T-shirts, packaging, banners, a book, a wall mural: each one has a method that makes it cheap and a method that makes it painfully expensive.

Pick wrong and you overpay, or you get muddy color, smeared ink, or a shirt design that cracks after two washes. Pick right and the same job costs less and looks better.

The good news is that the whole decision comes down to two plain ideas:

- **Substrate** is the thing you print *onto*. Paper, card, a T-shirt, vinyl, a cardboard box. That is all "substrate" means.
- **Run length** is how many copies you need. Fifty business cards is a "short run." Fifty thousand catalogs is a "long run."

Every method has a **sweet spot**: the quantity range where its cost per piece beats every rival. Learn the sweet spots and you can route any job in your head.

## The two cost shapes behind every press

Before the methods themselves, understand the one pattern that drives all of it. Print methods come in two cost shapes.

**High setup, cheap per piece.** These methods need expensive preparation: metal plates, calibration, screens. That cost is fixed, so the more you print, the more it spreads out and the cheaper each piece gets. Offset and flexography work this way.

**No setup, flat per piece.** These methods print straight from your file. There is nothing to prepare, so a single copy and a thousand copies cost roughly the same *per piece*. Digital and DTG work this way.

> **Think of it like cake.** Offset is a wedding cake baked from scratch: slow and costly to set up, but dirt cheap per slice once you are serving hundreds. Digital is a cupcake vending machine: instant, no setup, but pricier per unit. That fixed-versus-variable difference is the entire run-length story.

Now the methods.

## Offset lithography: the long-run champion

**How it works.** Your image is burned onto a thin metal **plate**. The plate is inked, the ink is transferred (or "offset") onto a soft rubber **blanket**, and the blanket presses the image onto the paper. The plate never touches the paper directly. It always goes through the rubber middleman.

The clever part is the physics: **oil and water repel each other**. The image areas accept oily ink. The blank areas are kept damp with a water-based solution, so they reject the oily ink. Oil and water refuse to mix, which keeps image and background cleanly separated.

**The cost shape.** High setup (plates, calibration, ink washups) but very low cost per unit.

- **Sweet spot:** long runs, roughly **2,000 pieces and up**.
- **Turnaround:** slow to start, often 2 to 5 days just to prep and plate.
- **Quality:** the gold standard for color fidelity, fine type, large flat solid areas, and [exact Pantone matching](/blog/computer-graphics-print/06-ink-on-the-page-spot-colors-overprint-black-generation). It also prints far bigger sheets than digital.

This is the press behind your books, catalogs, brochures, and packaging.

## Digital toner: the short-run, print-anything-now method

**How it works.** A light-sensitive **drum** gets an electric charge. A laser or LED "writes" the image by discharging spots on the drum. Charged **toner** (a fine powder) sticks only to the image areas, transfers to the paper, then gets **fused**, meaning melted on with heat and pressure.

There are two flavors. **Dry toner** is powder and can leave a slight sheen. **Liquid toner**, like HP Indigo's ElectroInk, uses ink particles just 1 to 2 microns across, giving a thin, sharp, glossy result that looks remarkably **offset-like**.

**The defining advantage:** no plates means no setup cost. And because the image is rebuilt from your file for every single sheet, **every print can be different**. This is called variable data, and it is how you print 1,000 postcards each with a different name.

- **Sweet spot:** short runs, **under about 2,000 pieces**, down to a single copy.
- **Turnaround:** prints straight from the file. The fastest method there is.

## Production inkjet: speed at scale

**How it works.** Tiny nozzles fire microscopic ink droplets straight at the substrate, [building the image as a dot pattern](/blog/computer-graphics-print/08-halftoning-screening-turning-tone-into-dots). No plate, no drum.

**Production inkjet** is very high-speed, roll-fed printing. Its quality has caught up to coated paper, but heavy ink coverage can be slow to dry, so these machines run large drying systems.

A simple rule for the two digital families: **toner** is sharp on smaller formats with consistent gloss (great for short office and marketing runs), while **production inkjet** is faster at huge scale (better for very long variable runs like direct mail, statements, and books).

## Screen printing: thick, punchy ink on almost anything

**How it works.** Ink is pushed with a **squeegee** through a stencil sitting on a fine **mesh** screen, onto the material below. You need **one screen per color**.

**Mesh count** is the number of threads per inch. Lower count lets more ink through (bold and opaque); higher count lets less through (fine detail).

- **110 to 160 mesh:** thick, opaque deposits, like white ink on a dark shirt.
- **200 to 305 mesh:** fine lines, halftones, detailed art.

The apparel standard is **plastisol ink**, a PVC-based ink that will not dry at room temperature. It must be **heat-cured at roughly 320 to 350 degrees F**. Store it below 90 degrees F or it can harden right in the bucket.

Because you burn a screen per color, the cost falls as quantity rises and climbs as color count rises.

- **Sweet spot:** medium to large runs. About **24 garments** is the classic break-even versus DTG.
- **Use cases:** T-shirts, posters, signage, promo goods, and odd surfaces like glass, metal, and plastic.

## DTG: full-color shirts, one at a time

**How it works.** Direct-to-Garment is a specialized inkjet that sprays water-based ink **straight into the garment fibers**. Dark fabric needs **pretreatment** so the ink grips, plus a **white underbase** printed first. Both add cost and time.

**The cost shape is flat.** It is mostly ink, with no screens, so there is no volume discount. A small order is not punished and a large one is not rewarded.

- **Sweet spot:** small orders, **under about 24 pieces**, including one-offs.
- **Cost example:** roughly **$1** for a white shirt versus **$3** for a dark one (the dark shirt needs pretreatment plus white ink).
- **Quality:** beautiful photographic color and fine gradients, but softer and less punchy than screen-printed plastisol, with a different feel.

## Wide-format: when the job is bigger than a desk

**How it works.** Large inkjet machines (roll-fed or flatbed) produce oversized output. The real differentiator here is the **ink**: UV-curable, eco-solvent, or latex (more on these below).

These presses print on vinyl, canvas, fabric, foam board, acrylic, wood, and aluminum composite. That is why wide-format owns banners, wall murals, window and floor graphics, vehicle wraps, and trade-show displays, indoors and out.

## Flexography: the packaging workhorse

**How it works.** Flexo is rotary printing using a **flexible photopolymer plate**, basically a raised, rubber-stamp-like image. The ink travels from an **anilox roller** (a cylinder covered in microscopic engraved cells that meter an exact volume of ink), past a **doctor blade** that wipes off the excess, onto the plate, and finally onto the material.

That anilox roller is the heart of flexo quality, because its tiny cells control precisely how much ink reaches the page.

- **Speed:** blistering, up to about 2,000 feet per minute. Setup is costly, so the economics favor **very long runs**.
- **Its big edge:** it prints **non-porous and flexible materials**, like plastic film, foil, kraft, and corrugated board, that offset cannot handle well.
- **Use cases:** packaging. Boxes, labels, food pouches, poly mailers, tape, wallpaper.

## Substrates: the paper itself changes everything

The press is only half the story. The material decides how your color actually lands.

### Paper weight: the 80 lb trap

This is where beginners get burned most, so go slowly.

**GSM (grams per square meter)** is the metric weight. It is universal and consistent across every paper type, which makes it the reliable spec, especially for international orders.

**lb (basis weight)** is the US system, and it has a catch. It is the weight of 500 sheets at that paper's "basic" size, but the basic size **differs by category**. So an "lb" number is meaningless until you name the category.

A few rough conversions:

- **20 lb bond** is about 75 gsm (everyday office paper).
- **80 lb text** is about 104 gsm (light brochure paper).
- **80 lb cover** is about 218 gsm (heavy card stock).

> **The classic mistake:** ordering "80#" paper with no category. The *same number* covers roughly **twice the weight**, depending on whether it is text or cover. Always specify gsm *and* category.

One more axis: **points (pt)** measure thickness in thousandths of an inch, like 14 pt card. Thickness is separate from weight. GSM tells you how heavy, points tell you how thick.

### Coatings: why the same ink looks different on different paper

A **coating** is a thin clay or mineral layer that seals the paper so ink **sits on top** instead of soaking in. That one difference changes both color and sharpness.

To see why, you need one term: **dot gain** is the tendency of printed dots to spread and come out larger than intended, which makes the print look darker than you designed.

| Surface | What the ink does | Color result | Dot gain |
|---|---|---|---|
| **Coated** | Sits on top, little soaks in | Crisp dots, deep, vivid, glossier | **Low** |
| **Uncoated** | Soaks into the fibers and spreads | Muted, softer, slightly darker, writable | **High** |

The finish scale, from shiniest to flattest, runs **Gloss → Silk/Satin → Dull → Matte → Uncoated**. Thicker coating means more gloss.

> **Picture it.** Coated paper is a glossy ceramic tile: ink beads on top and stays sharp and vivid. Uncoated paper is a paper towel: ink wicks in, spreads, and goes soft and muted. That single difference is exactly why dot gain and saturation behave so differently.

Beyond the basics, there are specialty stocks too: recycled, textured (linen, laid, felt), waterproof synthetics like Yupo, kraft, metallic, carbonless, backlit film, canvas, and even magnetic stock.

## Inks: matching the colorant to the job

- **[Process color (CMYK)](/blog/computer-graphics-print/02-color-spaces-additive-vs-subtractive-color)** uses cyan, magenta, yellow, and black as overlapping dots that blend into a full spectrum. Cheap (only four plates) and ideal for **photographs**.
- **Spot color (Pantone)** is a single pre-mixed ink matched to an exact standard. Used for **brand logos and colors CMYK cannot reach**, like fluorescents and metallics. It costs extra but it is dead-on every run. A common setup is CMYK plus one spot.
- **UV-curable** ink cures instantly under UV light, forms a tough film, and sticks to almost anything. A wide-format workhorse.
- **Eco-solvent** ink etches into vinyl for outdoor durability with fewer emissions. A signage staple.
- **Latex** ink is water-based, odorless, and VOC-free, so it is safe for indoor printing.
- **Plastisol** is the durable, opaque, heat-cured apparel ink for screen printing.

### Total ink coverage: don't drown your shadows

Here is a number that quietly ruins jobs. **Total Area Coverage (TAC)** is the maximum combined CMYK percentage allowed in your darkest shadow. Exceed it and the ink cannot dry or grip properly, so you get smearing and "set-off," where wet ink transfers onto the back of the next sheet.

Rough limits:

- **Coated sheetfed offset:** about 300 to 340%
- **Web offset (SWOP), coated:** 300%
- **Uncoated:** about 280%
- **Newsprint:** about 240 to 260%

> **The deep-black trap:** building black at 400% (all four inks at 100) and sending it to a press capped at 300%. The shadows come out wet and smear. Instead, build a **rich black within the limit**, like **60/40/40/100**.

## Common misconceptions

**"Digital printing is always cheaper."** Only for short runs. Past the break-even (around 2,000 on paper), offset's low per-piece cost overtakes digital's flat pricing and keeps pulling ahead.

**"Higher gsm always means thicker."** Not reliably. GSM is weight, points are thickness. A dense, compact stock can weigh more yet feel thinner than a bulky, airy one.

**"More ink makes a richer black."** Past the TAC limit, more ink just makes a wet, smeary mess. A controlled rich black like 60/40/40/100 looks deeper *and* dries clean.

**"A proof is a proof."** A proof on a coated profile tells you nothing reliable about how the job prints on uncoated stock. The dot gain is completely different.

## How to use this

When a job lands on your desk, work through it in order:

1. **Count first.** Quantity decides the method before anything else. On paper, under ~2,000 leans digital and over ~2,000 leans offset. On apparel, under ~24 leans DTG and over ~24 leans screen printing.
2. **Find the break-even.** If a digital quote is 48 cents flat and offset is 28 cents plus a $400 setup, they meet near 2,000 pieces. Route the job to whichever side of that line you fall on.
3. **Match the method to the material.** Packaging on film or corrugated points to flexo. Banners and rigid boards point to wide-format. Odd surfaces like glass or metal point to screen printing.
4. **Spec the stock properly.** Always give **gsm plus category plus finish**, never a bare "80#."
5. **Profile against the real stock.** Supply the matching ICC output profile so color and dot gain are predicted *before* plates are cut. Proof on the same surface you will actually print on.
6. **Choose ink by content.** Process (CMYK) for photos, spot (Pantone) for brand and exact-match solids, and CMYK plus a spot when a brand color falls outside what CMYK can reach.
7. **Cap your shadows.** Keep total ink under the press limit and build rich blacks like 60/40/40/100.

## Conclusion

If you remember one thing, remember this: **the method is an economics-of-volume decision married to a material decision.** Count the copies, name the surface, set the quality bar, and the right press almost chooses itself.

That is also why two honest shops can quote wildly different prices for the same flyer. They are standing on opposite sides of a [break-even point](/blog/business-financial-literacy/10-break-even-margins-profitability) you can now spot in seconds.

There is a deeper rabbit hole waiting, though. Every method above assumes your file's colors will survive the trip from screen to paper, and they often do not. The bridge that keeps a screen's glowing blue from arriving as a muddy navy is **[color management and ICC profiles](/blog/computer-graphics-print/03-color-management-icc-profiles-the-pipeline)**, and that is where the real magic (and the real headaches) live.
