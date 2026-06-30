---
title: "Print Production Cheat Sheet: The Specs Pros Memorize"
metaTitle: "Print Production Cheat Sheet & Specs Guide"
description: "A scannable print production cheat sheet covering process selection, paper weights, bleed, CMYK, binding, and pricing formulas you can skim before any job."
keywords:
  - print production cheat sheet
  - offset vs digital printing
  - paper weight GSM chart
  - bleed and safe zone printing
  - CMYK vs RGB print
  - 4/4 printing meaning
  - print finishing and binding
  - print pricing markup margin
  - gang run printing
  - dim weight shipping
  - print preflight checklist
  - saddle stitch vs perfect bound
topic: print-production-craft
topicTitle: Print Production Craft
category: Engineering
date: '2026-06-21'
order: 16
icon: "\U0001F4D0"
author: Pritesh Yadav (priteshyadav444)
transformed: true
linked: true
sources: []
faq:
  - q: "What's the difference between offset and digital printing?"
    a: "Offset uses metal plates and has a high setup cost but a very low per-unit cost, so it wins on long runs. Digital has almost no setup, so it wins on short runs and personalized pieces. The crossover is usually somewhere between 500 and 1,500 copies."
  - q: "What does 4/4 mean in printing?"
    a: "It's ink notation for the front and back of a sheet. The first number is colors on the front, the second is colors on the back. 4/4 means full-color CMYK on both sides; 4/0 means full color on the front and a blank back."
  - q: "Should I send print files in CMYK or RGB?"
    a: "Always CMYK for print. RGB is for screens and will shift color when converted at the press. Convert to CMYK yourself so you control the result instead of letting the printer guess."
  - q: "How much bleed do I need for a print file?"
    a: "Extend your background 3 mm (0.125 inch) past the trim line on all sides, and keep important text at least 3 mm inside the trim. This prevents white slivers and cut-off text when the guillotine drifts slightly."
  - q: "What paper weight should I use for a flyer or business card?"
    a: "A quality flyer sits around 120-170 GSM, while a sturdy business card is 300-400 GSM. Specify weight in GSM rather than US pound ratings, which change meaning depending on sheet size."
  - q: "What is a gang run in printing?"
    a: "A gang run places many separate jobs on a single large sheet that shares one setup. Splitting that fixed cost across jobs is what makes short-run offset printing affordable."
---

A printer quotes you 1,000 business cards for less than 250. That isn't a typo, and it isn't a scam. It's the single most counterintuitive fact in print, and once you understand why, every confusing line on a print quote starts to make sense.

This is the cheat sheet version of everything that drives those numbers. Skim it before a meeting, a build session, or a quote, and you'll talk to any printer like you've done this for years.

## Why this matters

Print has its own language, and the people who speak it fluently get better prices, fewer reprints, and faster turnarounds. The people who don't end up paying for mistakes nobody warned them about.

A file sent in the wrong color mode comes back muddy. A design without bleed gets white slivers along the edge. A short run quoted on the wrong process costs three times what it should. None of these are hard to avoid. They just require knowing a handful of specs and rules of thumb that pros carry in their heads.

That's what this is: the carry-in-your-head version.

## Choosing the right printing process

The biggest cost decision happens before anyone touches a file. Pick the wrong process and nothing downstream can save you.

Here's the quick selector:

| Job | Volume | Best process | Why |
|---|---|---|---|
| Business cards, flyers | 1-500 | Digital | No setup; cheap short runs |
| Business cards, flyers | 1,000+ | Offset (often ganged) | Low per-unit at scale |
| Brochures, catalogs, books | High | Offset | Quality plus cost at volume |
| Personalized mail / variable data | Any | Digital (inkjet/toner) | Each piece is unique |
| T-shirts, few colors | High | Screen print | Setup per color pays off |
| T-shirts, full-color / one-off | Low | DTG / DTF | No screen setup |
| Banners, posters, signage | Any | Wide-format inkjet | Large sizes, on demand |
| Labels, flexible packaging | High | Flexography | Fast on rolls and film |

The pattern underneath all of this: **does the job have a high fixed setup cost, and can you spread it across many copies?** If yes, go with the high-setup, low-per-unit process. If not, stay digital.

### Offset vs digital: the break-even rule

This is where that "1,000 cards for cheaper" magic comes from.

| | Offset | Digital |
|---|---|---|
| Setup cost | High (plates + make-ready) | Almost none |
| Per-unit cost | Very low | Flat per page |
| Cheaper when | Long runs | Short runs / variable data |

The crossover point lands around **500 to 1,500 copies**, depending on size, stock, and shop. Below it, digital wins. Above it, offset pulls ahead and keeps widening the gap.

Two terms explain the whole curve:

- **Make-ready** is the fixed setup cost of an offset job: mounting plates, getting ink and registration dialed in before a single good sheet comes off. It's the reason short offset runs feel weirdly expensive.
- A **gang run** packs many different jobs onto one big sheet so they share a single make-ready. Split that fixed cost ten ways and short-run offset suddenly becomes cheap. This is exactly how [online printers sell those impossibly low card prices](/blog/print-production-craft/11).

## Paper: weight tells you everything

[Paper weight](/blog/print-production-craft/08) is the fastest signal of quality and the easiest spec to get wrong.

| Use | GSM | Rough US equivalent |
|---|---|---|
| Copy / letterhead | 80-100 | 20-24 lb bond |
| Quality flyer / text page | 120-170 | 32 lb bond / 60-70 lb text |
| Poster / brochure cover | 170-250 | 80-100 lb text / 65-80 lb cover |
| Postcard / menu | 250-300 | 90-110 lb cover |
| Business card / premium | 300-400 | 110-140 lb cover |
| Folding carton / packaging | 350-450+ | 12-18 pt board |

**GSM** means grams per square meter. It's a clean, honest number: higher GSM, heavier and stiffer paper.

Always **specify in GSM**. US "pound" ratings are ambiguous because they depend on the original sheet size, so 80 lb text and 80 lb cover are completely different papers. The shortcut: **text/book** stock bends; **cover/card** stock stays rigid.

## Getting the file right: prepress in plain terms

Most reprints trace back to a file problem nobody caught. Run through this list before anything goes out.

- **Color mode:** CMYK for print, never RGB. RGB is built for glowing screens and shifts when converted at the press.
- **Bleed:** extend the background 3 mm (0.125 in) past the trim on all sides, so a slightly drifting cut never leaves a white edge.
- **Safe zone:** keep text at least 3 mm inside the trim line so nothing important gets shaved off.
- **Resolution:** 300 DPI at final size for photos. Large signage viewed from a distance is fine at 72-150 DPI.
- **Pantone / spot color:** use it when you need an exact brand color, a metallic, or a fluorescent that CMYK can't mix.
- **Total ink coverage:** keep it at or below roughly 300% so wet ink doesn't smear onto the next sheet.
- **Fonts:** embed or outline them so the printer's machine doesn't substitute something ugly.
- **Black text:** set it to 100% K (pure black), not rich black, or small type goes blurry.
- **File format:** a print-ready PDF (PDF/X) is the gold standard.

Think of **bleed, trim, and safe zone** as three nested rectangles. The trim is where the blade cuts. Bleed is the cushion outside it. The safe zone is the no-fly area for text inside it. The blade is never perfectly accurate, and these margins absorb the wobble.

### Reading ink notation

That "X/Y" on a quote is just front-and-back shorthand. First number is colors on the front, second is colors on the back.

| Notation | Meaning |
|---|---|
| 4/4 | Full color (CMYK) front and back |
| 4/0 | Full color front, blank back |
| 4/1 | Full color front, black-only back |
| 1/0 | One ink, front only |

A 4/1 brochure (full color outside, black text inside) is a classic way to cut cost without anyone noticing.

## Finishing and binding: where cheap becomes premium

The print is only half the job. [Finishing is what makes a piece feel expensive](/blog/print-production-craft/09), and it's where the upsells live.

- **Coatings:** gloss, matte, or soft-touch lamination; spot UV for shiny accents; aqueous for a light protective layer.
- **Folds:** half, tri-fold (the letter fold), Z-fold, gate, roll fold.
- **Binding:**
  - **Saddle-stitch** (folded and stapled) works up to about 64 pages, and page count must be divisible by 4.
  - **Perfect bound** glues a flat spine, ideal for thicker books and magazines.
  - **Spiral / wire-o** lets a book lay flat, great for manuals and cookbooks.
  - **Case / hardcover** for the premium, built-to-last feel.
- **Cutting and shaping:** straight guillotine cuts, custom die-cuts, rounded corners.
- **Embellishments:** foil stamping, embossing/debossing, spot UV. These are the high-margin premium add-ons.
- **Other useful tricks:** scoring (clean creases for folds), perforation (tear-off stubs), drilling (binder holes), and sequential numbering.

A quick rule for saddle-stitch: if your page count won't divide by 4, you'll need to add or cut pages. That math catches a lot of first-timers.

## Pricing and shipping: the formulas pros keep handy

You don't need a finance degree to sanity-check a quote. A few formulas cover most of it.

- **Markup %** = (Price - Cost) / Cost x 100
- **Margin %** = (Price - Cost) / Price x 100 *(always smaller than markup on the same job)*
- **Price from a target margin** = Cost / (1 - margin)
- **Unit price** = (Setup + Materials + Run + Finishing + Overhead) / Quantity x (1 + markup)

The markup-versus-margin confusion costs people real money. A 50% markup is not a 50% margin. If you mark up a 100 cost by 50% you charge 150, and your margin on that is only 33%.

For shipping, the trap is [**dimensional weight**](/blog/print-production-craft/12). Carriers bill you on the *greater* of actual weight or the size the box takes up.

- **Dim weight (metric)** = (Length x Width x Height in cm) / 5000 = kg. The exact divisor varies by carrier.
- A big box of light foam can cost more to ship than a small box of heavy paper.

Two shipping modes cover almost everything:

| Mode | Use for | Threshold |
|---|---|---|
| Parcel (UPS/FedEx/USPS) | Small, light boxes | Under ~68 kg (150 lb) |
| Freight / LTL (pallet) | Bulky or heavy runs, signage | Palletized or over ~68 kg |

**LTL** stands for "less than truckload," meaning your pallet shares a truck with other shipments instead of booking the whole thing.

## Common misconceptions

**"Higher DPI always means a better print."** Past 300 DPI at final size, you're just bloating the file. A billboard happily prints at 72 DPI because you view it from across the street.

**"Rich black is blacker, so use it for everything."** For solid fills, fine. For small text, rich black mixes four inks that must register perfectly, and any tiny misalignment turns crisp letters fuzzy. Use 100% K for type.

**"Eco-friendly is a marketing label."** The biggest sustainability lever isn't the ink, it's **not overprinting**. Overproduction is the number one source of print waste. Right-sizing the run, then choosing FSC-certified or recycled stock and print-on-demand, does far more than a green logo. Back any eco claim with a real certification, not a slogan.

**"The printer will fix my file."** Some [catch errors at preflight](/blog/print-production-craft/07); many print exactly what you sent. Assume your file is the final word.

## How to use this

Run this sequence on your next job:

1. **Pick the process first.** Estimate your quantity and check it against the crossover (~500-1,500). Short or personalized, go digital; long, go offset, ideally ganged.
2. **Choose stock in GSM**, not pounds. Flyer around 120-170, premium card around 300-400.
3. **Set up the file:** CMYK, 3 mm bleed, text 3 mm inside trim, 300 DPI photos, fonts embedded, export as PDF/X.
4. **Decide ink coverage** with X/Y notation. Look for places a 4/1 or 4/0 saves money without hurting the result.
5. **Plan finishing** while designing, not after. Confirm saddle-stitch page counts divide by 4.
6. **Sanity-check the quote** with the markup/margin formulas, and ask whether you're billed on actual or dim weight.
7. **Right-size the run.** Order what you'll actually use; reprinting beats warehousing dead stock.

## Conclusion

If you remember one thing, make it the setup-cost rule: **whoever can spread a high fixed setup over the most copies wins on price.** That single idea explains gang runs, the offset-versus-digital crossover, why short runs feel pricey, and why 1,000 cards can undercut 250.

The deeper rabbit hole is color itself. A "red" on your screen, in CMYK ink, and in a Pantone swatch are three different reds, and the gap between what a monitor can glow and what ink can mix is called the [color gamut](/blog/computer-graphics-print/05). Understanding why some colors simply cannot be printed is the next thing that separates the pros from everyone fighting their proofs.

### Talk like a printer

A quick vocab line to keep in your back pocket: **GSM**, **bleed/trim/safe**, **4/4**, **CMYK**, **spot/Pantone (PMS)**, **make-ready**, **gang run**, **imposition**, **preflight**, **saddle-stitch**, **perfect bound**, **spot UV**, **LTL**, **dim weight**, **click cost**, **aqueous coating**, **set-off**, **variable data**.
