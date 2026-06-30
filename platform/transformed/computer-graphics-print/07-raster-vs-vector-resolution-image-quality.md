---
title: 'Raster vs Vector: Why Your Print Comes Out Blurry'
metaTitle: 'Raster vs Vector & Print Resolution Explained'
description: >-
  Raster vs vector decides whether your print comes out crisp or blurry. Learn
  PPI, the real 300 dpi rule, and how to keep logos and photos sharp at any size.
keywords:
  - raster vs vector
  - what is the difference between raster and vector
  - print resolution
  - 300 dpi for print
  - PPI vs DPI vs LPI
  - effective resolution after scaling
  - image resampling
  - bicubic vs lanczos
  - vector logo for printing
  - why is my print blurry
  - bit depth banding
  - PDF/X-4 transparency
faq:
  - q: What is the difference between raster and vector?
    a: >-
      A raster image is a fixed grid of colored pixels, so its detail is baked in
      and blurs when enlarged. A vector image is math (points and curves), so it
      stays razor-sharp at any size because the printer redraws it fresh.
  - q: Is 300 dpi always the right resolution for print?
    a: >-
      No. The 300 figure comes from a 150-line halftone screen times two.
      Newspapers need only about 170 ppi, fine-art books need 400 ppi, and
      banks viewed from far away can use far less.
  - q: Can I turn a blurry logo into a sharp vector?
    a: >-
      Not automatically. Once a logo is a low-resolution JPEG, the detail is
      gone. You need the original vector file (AI, EPS, SVG, or PDF) or someone
      has to redraw it by hand.
  - q: What is the difference between PPI, DPI, and LPI?
    a: >-
      PPI is the pixel density of your file, LPI is the halftone screen ruling on
      the press, and DPI is the physical ink dots the printer lays down. Only PPI
      is something you control in your artwork.
  - q: Why does enlarging an image make it look worse but shrinking it does not?
    a: >-
      Enlarging asks software to invent detail that was never captured, so it can
      only guess or blur. Shrinking discards surplus pixels, which is clean and
      always safe.
  - q: Should I edit photos in 8-bit or 16-bit?
    a: >-
      Edit your master in 16-bit to avoid banding (visible steps in smooth
      gradients like skies), then convert to 8-bit only at final export.
topic: computer-graphics-print
topicTitle: Computer Graphics for Print
category: Engineering
date: '2026-06-21'
order: 6
icon: "\U0001F5A8️"
author: Pritesh Yadav (priteshyadav444)
transformed: true
linked: true
sources: []
---

Someone emails you their logo for a three-foot banner. You drop it in, zoom to fit, and send it to print. A week later the banner arrives looking like it was photographed through a fogged window. The file wasn't corrupted. The press wasn't faulty. The logo was simply the wrong *kind* of picture for the job.

Every image headed to a printing press is, at heart, one of two things: **a grid of colored dots, or a set of math instructions.** Knowing which is which, and how each behaves when you scale and output it, is the single biggest skill separating crisp print files from blurry ones.

## Why this matters

Blurry print is almost never the printer's fault. It's a decision made hours earlier, when someone picked the wrong file type or stretched an image past what it could support.

Get this right and you stop guessing. You'll know instantly whether a file will print sharp, why "just bump it to 300 dpi" doesn't work, and which format to ask a client for before the deadline panic. It's the difference between confidently approving artwork and crossing your fingers at the press.

## The two ways to describe a picture

Everything starts with one fork in the road.

### Raster: a grid of pixels

A **raster** image (also called a bitmap) is stored as a grid of tiny squares. Each square is a **pixel** ("picture element") holding one color. The whole picture is just rows and columns of these squares.

Because the number of pixels is locked the moment the image is created, raster is **resolution-dependent**. The detail is baked in and can never be increased later.

- **Formats:** JPEG, PNG, TIFF, PSD, RAW
- **Made by:** cameras, scanners, Photoshop
- **Best for:** photographs, gradients, anything with subtle color shifting from one pixel to the next

### Vector: a set of instructions

A **vector** image is stored as math: points, lines, curves, and fills. There are no squares, only instructions like "draw a circle of radius r, fill it blue."

Because it's math, it's **resolution-independent**. At output time it's redrawn at whatever resolution the device needs, so it stays knife-sharp at any size.

- **Formats:** AI, EPS, SVG, PDF (vector content), CDR
- **Made by:** Illustrator, CorelDRAW, Inkscape
- **Best for:** logos, icons, type, line art, packaging die-lines

> **The mosaic and the recipe.** A raster image is a tile mosaic: zoom in and you see the tiles, and you can't add detail that was never laid. A vector is a recipe ("draw a circle radius r") that can be re-baked at any size and is always perfectly smooth.

### The plain rule for print

Use **vector for logos, type, and line art**. Use **raster for photos** (a photograph can't be "made vector" without losing its realism).

The dangerous middle is a logo saved as a low-resolution JPEG. It has thrown away its scalability forever.

### The handoff: how vectors actually print

Here's a detail that trips people up. Vectors don't print directly as math. At the final stage they're **rasterized**, turned into dots, by the printer's **RIP** (Raster Image Processor, the software that converts a page into the dot pattern the press lays down).

The key point: a vector logo sent to a 2400-dpi imagesetter gets **2400-dpi-sharp edges**. The exact same logo flattened earlier into a 150-ppi JPEG is stuck at 150 ppi forever, no matter how good the press is.

That banner disaster from the opening? A 400-by-400-pixel JPEG pulled off a website printed blurry. The vector .AI or .SVG of the identical logo would have printed perfectly sharp at any size, because it gets re-rasterized at the printer's full resolution.

## The math under the curves

If vectors are "math instructions," the most important instruction is the curve. Almost every smooth vector shape is built from **Bézier curves**. You don't need to do the algebra, but knowing the shape of it makes node editing far less mysterious.

Two building blocks:

- **Anchor point** - an *on-curve* point where a segment starts or ends. The line actually passes through it.
- **Control handle** - an *off-curve* point that pulls the curve like a magnet. It sets direction and tension, but the line does **not** pass through it.

The standard curve (in PDF, SVG, Illustrator, and Fabric.js) is the **cubic Bézier**: four points, `P0` to `P3`. The curve runs between the two anchors `P0` and `P3`, while `P1` and `P2` are the handles. The curve leaves `P0` heading toward `P1`, and arrives at `P3` coming from `P2`. **Handle length** controls how strongly the curve bows; **handle angle** sets its direction.

> **Magnets pulling a wire.** The two anchors pin the wire's ends. The control handles are magnets off to the side. The farther and stronger the magnet, the more the wire bows toward it, but the magnet itself never touches the wire.

When the software draws this on screen, it steps along the curve in tiny increments and joins the points with short straight lines, a process called **flattening**. Finer steps look smoother on screen, but at print time the device rasterizes the true math regardless of your preview.

**Practical tip:** when editing nodes, place anchors at the curve's *extrema* (its top, bottom, left, and right points). You get fewer, cleaner nodes that are far easier to smooth and reshape.

## Resolution: PPI, DPI, and LPI are not the same thing

These three abbreviations get thrown around interchangeably in print shops, and mixing them up is the root of most "why is it blurry?" confusion. They're three different layers of the same process.

- **PPI - Pixels Per Inch.** The pixel density of your **digital file**. This is the number that actually governs raster sharpness. When someone says "300 dpi file," they almost always mean 300 PPI.
- **DPI - Dots Per Inch.** The physical **ink dots a printer lays on paper**. Much higher than PPI (inkjet runs 1200 to 2880) because many tiny ink dots build a single image pixel.
- **LPI - Lines Per Inch.** The halftone **screen frequency** in offset printing. Newspaper is about 85 lpi; magazines run 133 to 150; fine-art books reach 175 to 200.

The flow is simple: **PPI is your file, LPI is the halftone screen, DPI is the printer's ink.** Only PPI is something you control in your artwork. Get that right and the press handles the rest.

## The real origin of the 300 dpi rule

"Use 300 dpi for print" is the most repeated rule in the business, and it isn't magic. It comes from the **Quality Factor**: the image PPI you need is roughly **1.5 to 2 times the LPI** of the press, with **2 being the industry standard**.

At the common commercial screen of 150 lpi: **150 × 2 = 300 ppi.** That's the entire origin of the rule. And because it's a ratio, it scales with the press:

| Press screen | Use case | Required image PPI |
|---|---|---|
| 85 lpi | Newspaper | ~170 ppi |
| 150 lpi | General commercial / magazines | 300 ppi |
| 175 lpi | High-end work | 350 ppi |
| 200 lpi | Fine-art books | 400 ppi |

Going below about 1.5× risks soft, artifact-prone [halftones](/blog/computer-graphics-print/08-halftoning-screening-turning-tone-into-dots). Going above 2× just wastes data; [the RIP](/blog/computer-graphics-print/17-the-rip-press-operation-color-measurement) throws away the extra pixels, leaving you with a bigger file and no visible gain.

The big exception is **large format**. Banners and billboards are viewed from far away, so 100 to 150 ppi (or far less for billboards) is plenty, because your eye can't resolve the dots at distance.

## The trap that bites experienced designers

Here's the one that catches people who should know better. When you place a raster image in a layout and resize it, **the actual pixels don't change**, but the **effective resolution** does.

```
Effective PPI = Original PPI / Scale Factor
```

Enlarging drops your resolution:

- 300 ppi at 200% = **150 ppi** (too low)
- 300 ppi at 120% = **250 ppi** (still good)

Reducing always raises it, which is why it's always safe:

- 72 ppi at 50% = 144 ppi
- 300 ppi at 50% = 600 ppi

**The drag-to-fit trap:** a designer places a 300-ppi photo in InDesign, then drags the frame corner to fill the page, scaling it to 220%. [Preflight](/blog/computer-graphics-print/13-preflight-validating-a-file-before-it-prints) flags the effective resolution at ~136 ppi. It will print soft. The only real fixes are a bigger source file or a smaller placement, never just dragging it larger.

**Rule of thumb:** enlarging up to about **120%** keeps very good quality. Beyond that, the resolution falls below target. Always check effective resolution *after scaling*, not the file's stored PPI.

## Why you can shrink but not stretch

**Resampling** means changing an image's pixel count, and the algorithm decides how the new pixels are computed. The common ones, roughly worst to best for quality:

- **Nearest neighbor** - copies the closest pixel. Fast but blocky. Only for pixel art.
- **Bilinear** - averages the 4 nearest pixels. Smoother, but soft.
- **Bicubic** - uses 16 neighbors. Smooth and detail-preserving; Photoshop's default.
- **Lanczos** - sharpest, best detail retention, heaviest to compute. The favorite for downscaling.

Why does enlarging degrade so badly? There's **no real information between the original pixels**, so the algorithm can only guess or blur. Detail gets invented, never recovered.

Why is shrinking safe? You're discarding surplus data, and a good filter averages many source pixels into each new one.

> **Books and summaries.** You can always summarize a long book into a paragraph (downscaling: discarding detail cleanly). You can never expand a paragraph back into the original book (upscaling: you can only make things up).

So when a client hands you a 72-ppi web image for a print job, "fixing" it by upsampling the PPI number adds zero real detail. The only honest fixes are a higher-resolution source or printing it smaller.

## A few quality details that quietly matter

### Bit depth and banding

**Bit depth** is how many tonal steps each color channel can hold. 8-bit gives 256 levels per channel (about 16.7 million colors), which is fine for final delivery. 16-bit gives 65,536 levels, which means vastly more headroom while editing.

Why care? Heavy edits on an 8-bit image, like big curves moves on a sky gradient, cause **banding**: visible steps where there aren't enough levels to redistribute smoothly. A sunset edited hard in 8-bit can show stripes at the press. The same edit in 16-bit stays smooth. **Edit in 16-bit, convert to 8-bit only at final export.**

### Transparency and flattening

When layers overlap, the software does real math to combine them, using each layer's **alpha** (its opacity). **Multiply** blend mode darkens and mimics real ink layering; **Screen** lightens. **Flattening** bakes all those layers and blend effects down into one opaque image, and once flattened it's permanent.

The catch: many RIPs can't render live transparency, so prepress flattens it for them. Done badly, this causes "white box" artifacts, color shifts, or hairline stitching lines wherever transparent objects overlap. Export a [**PDF/X-4**](/blog/computer-graphics-print/12-pdf-x-output-intent-page-boxes-the-print-ready-target) (it keeps transparency live) rather than **PDF/X-1a** (which forces flattening), and always [embed fonts](/blog/computer-graphics-print/11-typography-text-rendering) or outline type so the RIP can't substitute the wrong font.

## Common misconceptions

- **"300 dpi is the universal law of print."** It's just Quality Factor 2 at a 150-line screen. Newspapers want ~170 ppi; fine-art books want 400; billboards want far less.
- **"I can bump a low-res image up to 300 dpi in software."** Changing the number doesn't add detail. Upsampling invents and blurs pixels; it never recovers real information.
- **"My file says 300 ppi, so it'll print sharp."** Not if you scaled it up in layout. Effective resolution is what counts, and enlarging silently lowers it.
- **"A logo is a logo, any file will do."** A low-res JPEG logo has permanently lost its scalability. Always ask for the vector original.
- **"JPEG can hold transparency."** It can't. Use PNG or TIFF for transparent edges.

## How to use this

1. **Pick the type first.** Photos go raster. Logos, type, and line art go vector. Never let a logo live only as a JPEG.
2. **Ask for the vector original.** Before any large print job, request the AI, EPS, SVG, or vector PDF of any logo.
3. **Match PPI to the press, not a memorized number.** Roughly 2× the LPI: 300 ppi at 150 lpi, 350 at 175, ~170 for newspaper, far less for billboards.
4. **Check effective resolution after scaling.** If you enlarge a placed image past ~120%, get a bigger source or place it smaller.
5. **Never upscale to "fix" a low-res file.** Reduce when you can; it's always safe. Enlarging only invents detail.
6. **Edit masters in 16-bit.** Convert to 8-bit at final export to avoid banding in gradients.
7. **Export PDF/X-4 and embed your fonts.** Keep transparency live and stop the RIP from substituting the wrong typeface.

## Conclusion

If you remember one thing, make it this: **raster bakes its detail in at birth and can only lose quality from there, while vector carries instructions and is rendered fresh at the printer's full resolution.** Match the type to the element, and most "why is it blurry?" problems vanish before they start.

Here's the thread worth pulling next. We've talked about sharpness, but not color. Why does a glowing sunset on your screen turn muddy and dull on paper? That's the gap between [RGB light and CMYK ink](/blog/computer-graphics-print/02-color-spaces-additive-vs-subtractive-color), and it surprises designers far more often than resolution ever does.
