---
title: 'How a PDF Becomes Printed Ink: The RIP, Press & Color'
metaTitle: 'The RIP, Press & Color Measurement Explained'
description: >-
  A printing press cannot read a PDF or lay down 50% gray ink. Learn how the RIP,
  press operation, and color measurement turn your file into ink that matches.
keywords:
  - what is a RIP in printing
  - raster image processor
  - halftone screening
  - LPI vs DPI
  - screen angles CMYK
  - offset lithography
  - densitometer vs spectrophotometer
  - Delta E 2000
  - ISO 12647-7 contract proof
  - dot gain TVI
  - G7 calibration
  - M1 measurement condition
  - color management RIP
  - print color matching
  - moire rosette pattern
faq:
  - q: What does a RIP do in printing?
    a: >-
      A RIP (Raster Image Processor) reads your PDF and converts everything on the
      page into a high-resolution pattern of ink dots a press can physically print.
      It does four jobs in order: interpret the file, render it to a bitmap, apply
      color management, and screen it into on/off dots.
  - q: What is the difference between DPI and LPI?
    a: >-
      DPI (dots per inch) is how finely the output device can place marks, like 2400
      dpi. LPI (lines per inch) is how coarse the visible halftone dot grid is, like
      150 lpi. Many tiny device dots build each single halftone dot.
  - q: What is the difference between a densitometer and a spectrophotometer?
    a: >-
      A densitometer measures how much ink is down (optical density) but does not
      measure color. A spectrophotometer measures the actual color a human sees as
      CIE L*a*b* values, which is what you need for brand matching and sign-off.
  - q: What is a good Delta E value for print?
    a: >-
      A Delta E of about 1.0 is the just-noticeable difference. ΔE 2 to 3 is the
      standard acceptable range for professional commercial print, ΔE under 1 is for
      luxury and branding, and ΔE above 5 is usually a reject.
  - q: Why do CMYK plates print at different screen angles?
    a: >-
      If all four colors used the same dot angle they would clash into a wavy pattern
      called moire. Rotating each color (Cyan 15, Magenta 75, Yellow 0, Black 45)
      creates a clean rosette pattern instead.
  - q: What is an ISO 12647-7 contract proof?
    a: >-
      It is a physical, color-accurate print made through the press ICC profile and
      certified to the ISO 12647-7 standard. Once the client signs it, it becomes the
      legally binding color agreement that the press must match.
topic: computer-graphics-print
topicTitle: Computer Graphics for Print
category: Engineering
date: '2026-06-21'
order: 16
icon: "\U0001F5A8️"
author: Pritesh Yadav (priteshyadav444)
transformed: true
sources: []
---

You designed a file, picked your colors, and exported a clean PDF. Then you sent it to print and the reds came back muddy, or the gray went green. What happened in between?

Here is the part nobody tells you: a printing press cannot read a PDF. It cannot lay down "50% gray ink." It only knows two things, ink-here and no-ink-here. Something has to translate your beautiful page into that brutally simple language, and then prove the result actually matches what you agreed to.

This is the story of that journey, from PDF to a printed sheet, and the tools that prove it matched.

## Why this matters

If you ever hand artwork to a commercial printer, you are trusting a chain of machines and standards you cannot see. When the color is wrong, the bill is still due, and the reprint costs you time you do not have.

Understanding this pipeline does three concrete things for you:

- You stop blaming the wrong step. Soft text is a file problem; a muddy shadow is an ink-limit problem; a green gray is a measurement problem.
- You learn what to ask your printer for, like an **ISO 12647-7 contract proof** and a **ΔE** report, so "it looks fine to me" stops being the standard.
- You finally understand why a 250-piece run costs almost as much as 1,000. Most of the cost is hidden in setup.

Let's follow your file.

## The RIP: the engine that turns your file into dots

A **RIP (Raster Image Processor)** is the software (sometimes software plus dedicated hardware) that reads a page-description file like PDF, PostScript, or the print-safe flavor PDF/X, and turns *everything* on it, the text, the vector shapes, the photos, into one high-resolution map of dots the output device can physically print.

Think of the RIP as a translator and typesetter rolled into one. Your PDF is a manuscript written in a language the press cannot read. The RIP translates it into the only thing the press understands, ink dots in fixed positions, and arranges them into a clean pattern.

It does four jobs, always in this order:

1. **Interpretation.** It reads the page and resolves fonts, vector paths, embedded photos, transparency, overprint, and trapping.
2. **Rendering.** It flattens the page into a continuous-tone bitmap at the device's finest resolution, for example 2400 dpi on a platesetter.
3. **Color management.** This is where color management *actually executes*. The RIP applies ICC profiles to convert your colors into what the press can really produce.
4. **Screening.** It converts that smooth bitmap into the on/off dot pattern the press needs, because a press can only put ink down or not.

Here is the key insight most people miss. Color decisions are *made* in design, when you pick your profiles. But they are *executed* in the RIP. The RIP is the single place where your source colors actually become press colors and where flat tones become printable dots.

### DPI is not LPI (and confusing them ruins jobs)

The most common technical mix-up in this whole field: confusing the device's **addressable resolution** (dpi, e.g. 2400) with the **screen ruling** (lpi, e.g. 150).

They are different things. Many tiny device dots (2400 dpi) build up each single visible halftone dot (150 lpi). One is how finely the laser can place marks. The other is how coarse the visible dot grid looks.

### Keep text sharp, size photos right

Inside the RIP, vector and raster get treated differently:

- **Vector** (text, logos, line art) stays mathematically perfect until the very last moment, then gets rasterized at full device resolution. That is why edges stay crisp at any size, and why you should never flatten text into a low-resolution image.
- **Raster** (photos) is locked to its pixels. The rule of thumb: image **ppi should be about 2x the screen lpi**. For a 150-lpi job, supply around 300 ppi. For a 200-lpi job, around 400 ppi.

A frequent mistake is flattening sharp vector text into a 150-ppi image so the edges go soft, or expecting 300-ppi sharpness at a 200-lpi ruling. Keep text and line art as vector, and match photo resolution to roughly twice the screen ruling.

### How the RIP fakes shades of gray

A press cannot print "40% ink." So tone gets *simulated* with a pattern of dots: bigger or closer dots look darker, smaller or sparser dots look lighter. This is **halftoning**, and the RIP picks the method.

| Screening type | How it works | Strength | Weakness |
| --- | --- | --- | --- |
| **AM (conventional)** | Dots sit on a fixed grid; the dot *size* varies with tone | Predictable, easy to control | Needs different angles per color to avoid moire |
| **FM (stochastic)** | Tiny fixed-size dots; their *placement* varies | Mostly moire-free, sharper detail | Harder to control dot gain |
| **Hybrid (XM)** | AM in midtones, FM in highlights and shadows | Control plus smooth extremes | More complex to set up |

The standard screen rulings tell you a lot about a printed product:

- **Newspaper** on rough paper: about **85 lpi** (sometimes 65 to 100).
- **Magazines and commercial coated:** **150 lpi**, the everyday standard.
- **High-end art and photo books:** **175 to 200+ lpi**.
- **Screen printing and flexo:** much coarser, often 45 to 65 lpi.

### The rosette and the dreaded moire

If all four colors laid their dots at the same angle, they would clash into an ugly wavy pattern called **moire**. So the RIP rotates each color's screen.

The canonical CMYK angles are **Cyan 15, Magenta 75, Yellow 0, and Black 45**. The three most visible colors (cyan, magenta, black) are kept 30 degrees apart. Yellow, the least visible, is squeezed to just 15 degrees from cyan. Done right, this produces a pretty flower-like **rosette**. Done wrong, you get moire.

Want to see it yourself? Put a loupe (a small magnifier) on any glossy magazine photo. You will see the tiny C, M, Y, K dots forming a rosette. If a vendor accidentally re-screens an already-screened image, that rosette breaks into a wavy plaid. It is a dead giveaway of a screening error.

## On the press: oil, water, and a lot of setup

Once the RIP has its dots, that pattern gets imaged onto a plate, and the plate goes on the press.

### Plates and CTP

Modern prepress is **CTP (Computer-to-Plate)**: a laser images the RIP's one-bit bitmap *directly onto an aluminum plate*, skipping film entirely. It is more precise and faster. After developing, the image areas become ink-loving and the non-image areas become water-loving. There is one plate per color: CMYK plus any spot colors.

The whole principle of offset lithography is surprisingly simple. Image and non-image areas sit on the *same flat plane*. Printing works because **oil and water repel each other**, not because anything is raised or carved.

### Makeready: the expensive part

**Makeready** is all the setup before a single good sheet runs: mounting plates, loading ink, setting ink keys, balancing ink and water, getting the colors to register, and bringing density to target.

This is where the money goes. A 4-color sheetfed job typically burns through 150 to 300 spoilage sheets before the first sellable one. That fixed cost is exactly why a 250-piece run costs nearly as much as 1,000, and why combining jobs onto one sheet ("gang runs") saves money.

### Ink and water balance

The dampening system feeds **fountain solution** (water plus additives) to keep the non-image areas clean. The operator rides a narrow window:

- **Too much water:** color goes weak, dots get fuzzy, ink emulsifies, drying slows.
- **Too little water:** the background starts taking ink, leaving a dirty tint called scumming.

### The color bar steers the ship

**Registration** means getting all the plates to line up exactly so the rosette forms and edges stay crisp. The operator watches the **color bar**, a strip of test patches printed in the trim edge: solid patches for density, tints for dot gain, gray-balance patches, and registration marks.

On modern presses, a scanner reads this color bar automatically every few sheets and adjusts the ink keys on its own. This **closed-loop control** holds the color steady and cuts waste, without the operator guessing.

## Proofing: the color you actually agreed to

Before the press matches anything, somebody has to define the target. That is the proof, and there are two kinds.

A **contract proof** (hard proof) is a physical, color-accurate print, usually from a calibrated inkjet driven through the press profile. It is certified to **ISO 12647-7**, and once the client signs it, it is *legally binding*. The press operator's whole job becomes matching that signed proof.

A **soft proof** is an on-screen simulation. It is cheap, instant, and great for collaboration, but it is only trustworthy on a hardware-calibrated wide-gamut monitor set to D50 (5000K) and a good brightness, in a controlled viewing environment. Get a certified setup right and a soft proof can even serve as the contract proof.

The takeaway: the contract proof is the agreement. Color measurement is how everyone proves the match really happened.

## Measuring color: the tool that can fool you

This is where most "the color is wrong but the numbers say fine" disasters live.

### Densitometer vs spectrophotometer

A **densitometer** measures **optical density**, how much of a band of light the ink film absorbs. It tells you *how much ink* is down per channel. It is fast, cheap, and perfect for an operator holding ink steady on a long run. But here is the catch: **it does not measure color.** It is a process gauge, not a perception gauge.

A **spectrophotometer** measures reflectance across the whole visible spectrum, then computes the actual **color a human sees** as **CIE L\*a\*b\*** values and **ΔE** differences. It tells you the real color, independent of which ink produced it. That is what you need for brand QC, spot-color checks, and proof-to-press agreement. A combined tool that does both is a **spectrodensitometer**.

Think of it this way. Density is a thermometer: one number in range tells you how much ink is down. The spectrophotometer is the doctor's full diagnosis: it tells you whether the actual color is genuinely healthy. A densitometer can fool you into thinking you are printing the right color. A spectrophotometer will not.

### Why bright paper breaks old measurements

Modern papers contain **optical brighteners** that glow under UV light, which skews readings. So the **ISO 13655 M-series** defines lighting conditions:

- **M0:** undefined UV, the legacy setting. Not recommended when paper fluoresces or when sharing data between sites.
- **M1:** D50 daylight with defined UV. The **modern preferred standard**, because it correctly handles brightened papers. Current specs reference M1.
- **M2:** UV-cut, excluding fluorescence.

## ΔE: how close are two colors, really?

**ΔE (Delta E)** is the numerical distance between two colors. Bigger means more different. There are several flavors:

- **ΔE76** is simple straight-line distance in L\*a\*b\*. Easy, but it overstates differences in blues and saturated colors.
- **ΔE94** adds weighting and handles saturated colors better.
- **ΔE2000** corrects lightness, chroma, hue, and the blue region. It is the **current gold standard**, the one to use for specs and tolerances.

The benchmarks worth memorizing:

- **ΔE around 1.0** is the **just-noticeable difference**. Below 1, basically no one can tell the colors apart.
- **ΔE under 1:** luxury, branding, and proofing.
- **ΔE 2 to 3:** the standard acceptable range for professional commercial print. Brand spot colors on prime labels often demand ΔE2000 under 2.0.
- **ΔE 3 to 5:** noticeably different.
- **ΔE over 5:** clear mismatch, reject.

Here is the classic trap in one story. A brand red prints at "correct density," yet the spectrophotometer reads ΔE2000 = 4 against the brand standard. Why? The paper's brighteners, measured under M0 instead of M1, shifted the white point. The densitometer said fine. The spectrophotometer caught the reject. Right density, wrong color.

## Common misconceptions

**"Higher DPI means a sharper-looking print."** Not directly. Sharpness of tone comes from the LPI screen ruling and how well the press holds dots, not from the raw device DPI alone.

**"If the density is on target, the color is right."** This is the big one. Density controls *how much* ink. Only colorimetry (L\*a\*b\* and ΔE) controls *what color* it is. The same density can produce different colors on different paper or ink batches.

**"A monitor proof is good enough to sign off on."** Only if that monitor is hardware-calibrated to D50 in a controlled room. On an uncalibrated screen in normal office light, you are guessing.

**"My PDF is fine, so the color is the printer's problem."** Often the file is the problem: untagged RGB, a missing ICC profile, no ink limit set. That makes shadows fill in and spot colors convert wrong, and the proof and press disagree.

## How to use this

If you are handing artwork to a commercial printer, do this:

1. **Export PDF/X with the right profile embedded.** Tag your colors, embed fonts, and set a **total ink limit** (around 300% on coated paper, 240 to 260% on uncoated). Untagged files are where color goes to die.
2. **Keep text and line art as vector.** Never flatten them into low-resolution images.
3. **Size your photos to about 2x the screen ruling.** Roughly 300 ppi for a 150-lpi job, 400 ppi for 200 lpi.
4. **Ask for an ISO 12647-7 contract proof and sign it.** That signed proof is your color agreement and your protection.
5. **Ask for a ΔE2000 report against your spec or proof.** "It looks fine" is not a measurement; a ΔE number is.
6. **Insist on M1 measurement** if your paper has optical brighteners, which most coated stock does.
7. **For brand colors, set a tolerance up front,** for example ΔE2000 under 2.0, so everyone knows what passing means before the press rolls.

The pro workflow underneath all this is short: **calibrate, then characterize, then control.** Linearize the device, build and apply correct ICC profiles in the RIP, run **G7 or ISO 12647** gray-balance targets, then verify with **ΔE2000** against the contract proof, measuring under M1.

## Conclusion

If you remember one thing, make it this: **right density never guarantees right color.** A densitometer tells you how much ink is down; only a spectrophotometer reading L\*a\*b\* tells you the color a human actually sees. Most "the print looks wrong but the numbers were fine" stories collapse on exactly that gap.

The whole pipeline, from RIP to plate to press to ΔE, exists to close that gap and make a printed sheet match a signed proof.

Now here is the thread worth pulling next: every standard above assumes your colors *fit* inside what the press can physically reproduce. But your screen can show colors no CMYK press can touch. What happens at that boundary, where a glowing screen color has to become ink, is the art of **gamut mapping and rendering intents**, and it decides whether your vivid blues survive the trip to paper at all.
