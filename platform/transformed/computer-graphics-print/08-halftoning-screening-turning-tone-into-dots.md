---
title: 'Halftoning Explained: How Printers Fake Every Shade of Gray'
metaTitle: 'Halftoning & Screening Explained for Print'
description: >-
  Printers can only lay ink on or off, yet your photo prints in smooth tone.
  Halftoning is the trick. Learn AM vs FM screening, LPI, dot gain, and more.
keywords:
  - halftoning
  - what is halftoning in printing
  - screening in printing
  - AM vs FM screening
  - stochastic screening
  - LPI vs DPI vs PPI
  - screen angles CMYK
  - dot gain
  - moire in printing
  - rosette pattern printing
  - halftone dot shapes
  - trapping in print
  - line screen frequency
  - 300 dpi for print
topic: computer-graphics-print
topicTitle: Computer Graphics for Print
category: Engineering
date: '2026-06-21'
order: 7
icon: "\U0001F5A8️"
faq:
  - q: What is halftoning in printing?
    a: >-
      Halftoning converts a smooth, continuous-tone image into a pattern of tiny
      dots. Because a press can only print ink or no ink at full strength, it
      varies how much of the white paper the dots cover so your eye blends them
      into shades of gray and color.
  - q: What is the difference between AM and FM screening?
    a: >-
      AM (amplitude-modulated) screening keeps dots on a fixed grid and changes
      their size to set tone. FM (frequency-modulated, or stochastic) screening
      keeps the dots tiny and the same size, and changes how many are scattered.
      AM is stable but needs angled plates; FM avoids moire but is fussier on press.
  - q: What is the difference between DPI, LPI, and PPI?
    a: >-
      PPI is the resolution of your image file, LPI is the fineness of the
      halftone screen, and DPI is the resolution of the output device. They are
      three different things that beginners constantly confuse.
  - q: Why is 300 DPI the standard for print?
    a: >-
      Most commercial printing uses a 150 LPI screen, and the rule of thumb is to
      supply images at about twice the LPI. 2 times 150 equals 300, which is
      where the famous "300 dpi for print" guideline comes from.
  - q: What is dot gain and why does it matter?
    a: >-
      Dot gain (also called TVI, tone value increase) is when printed dots end up
      larger than they were in your file, so the print looks darker and muddier.
      It is worst in the midtones and is corrected with a compensation curve tuned
      to a printing standard.
  - q: Why are printing plates set at different angles?
    a: >-
      If two screens overlap at the same angle, their grids clash and create an
      ugly wavy pattern called moire. Rotating each color to a different angle
      (cyan 15, magenta 75, yellow 0, black 45) turns that clash into a tidy,
      intended pattern called a rosette.
author: Brexis Wazik
transformed: true
linked: true
sources:
  - https://en.wikipedia.org/wiki/Halftone
---

Hold a printed newspaper photo up to a magnifying glass and something strange happens. The smooth face you saw a moment ago dissolves into a field of tiny black dots - fat ones in the shadows, pinpricks in the highlights, all sitting on bare white paper.

That photo on your phone has millions of real shades. The printed one has exactly two: ink, and no ink. So how does a machine that can only stamp "black" or "nothing" reproduce a soft gray sky or a gentle blush on a cheek?

The answer is one of the oldest and cleverest tricks in printing, and once you see it you cannot unsee it.

## Why this matters

If you ever send a design to a real printing press - a book, a magazine, a brochure, a poster - your file does not print the way it looks on screen. It gets translated into dots first. Understanding that translation is the difference between a piece that looks crisp and the way you intended, and one that comes back dark, muddy, soft, or shimmering with a weird plaid pattern.

This is also why "300 dpi" gets repeated like a magic spell, why your printer asks for "continuous-tone CMYK," and why a photo that looks perfect on your monitor can plug into flat black shadows on paper. All of it traces back to halftoning.

Get the ideas here and you stop guessing. You hand the press clean files, you know what to ask for, and your prints come out looking like you meant them to.

## The core trick: ink is either on or off

Two quick words to know, because the rest of the article leans on them:

- **Continuous tone** (or "contone") is an image where tone slides smoothly with no visible steps - a photographic gradient, or the glowing screen in front of you.
- **Halftoning** (also called **screening**) is the process of turning that smooth image into a pattern of dots that your eye reads back as smooth tone.

Here is the problem in one sentence. A printing press is **fundamentally binary**: at any single spot on the paper, ink is either there or it isn't. A film of cyan ink prints at one fixed strength. It cannot lay down "50% cyan" as a thinner, paler film the way a screen simply glows dimmer. Full strength, or nothing.

So how do you show a pale sky with an ink that only knows on and off? You break the image into a grid of tiny dots and vary **how much of the white paper those dots cover**. Tiny dots floating on white read as a light tone. Dots so fat they almost touch read as a dark tone. Zero coverage is paper white; full coverage is solid ink.

The real magic is in your eye. At a normal viewing distance you **cannot resolve the individual dots**, so your eye averages them - it blends the black dots and the white gaps into a single gray. Engineers call this **optical mixing**. (The technique was first patented by William Henry Fox Talbot back in 1852.)

> **Think of it like a stadium card stunt.** Thousands of fans each hold up one solid-colored card. Up close it is just colored squares. From across the stadium your eye fuses them into a smooth picture of a flag or a face. A halftone is the same idea, shrunk down to dots - it is essentially pointillism for machines.

**The key takeaway:** a press can only print ink or no ink, at full strength. Halftoning fakes every shade in between by varying how much paper the dots cover, and your eye does the blending for free.

## Two ways to arrange the dots: AM vs FM

There are two completely different strategies for laying out those dots, and they behave very differently on press.

### AM screening - grow the dots

In **AM (amplitude-modulated)** screening, the dots sit on a **fixed, evenly spaced grid**, and only the **dot size changes**. ("Amplitude" just means size here.) Highlights get tiny dots, shadows get big dots, but every dot lives on the same lattice.

This is the traditional, conventional screen, and it is still the default for most offset printing. It gives smooth, predictable, stable midtones. Its one real weakness: that regular grid is exactly what creates an interference pattern called **moire** when several colors overlap - which is why the plates have to be rotated to different angles (more on that soon).

### FM screening - scatter the dots

In **FM (frequency-modulated)** screening - also called **stochastic** screening - the dots are all the **same tiny size**, and only the **number and spacing** changes. Highlights get a few scattered microdots; shadows get a dense crowd of them, placed in a pseudo-random pattern.

The microdots are roughly 10 to 30 microns across - smaller than the width of a human hair. Because the pattern is random, there is **no grid, no line frequency, and no screen angle**. And with no grid, **moire essentially disappears**. That makes FM excellent for tricky subjects like fabric weaves, fine detail, and sharp diagonal lines, and for printing with six or seven inks for [a wider color range](/blog/computer-graphics-print/05-gamut-out-of-gamut-handling-deep-dive).

The cost: those tiny dots are fragile. They are harder to hold on press, more prone to fattening up, and they can look slightly grainy.

```
AM (size varies, grid fixed)        FM (spacing varies, size fixed)
  highlight    shadow                 highlight       shadow
  . . . .      @ @ @ @                 .   .  .        ..::..::
  . . . .      @ @ @ @                  .  .            .:..::.:
  . . . .      @ @ @ @                 .    . .         :.::..::
  (same lattice, dots grow)           (random scatter, count grows)
```

### Hybrid (XM) screening - the best of both

Modern platemaking software often blends the two: **AM in the midtones** for stability, switching to **FM in the extreme highlights and shadows** where AM dots would be too small to hold or too merged to tell apart. This is called hybrid or cross-modulated (XM) screening, and it gives you the best of both worlds.

Here is the quick comparison:

| Aspect | AM (conventional) | FM (stochastic) |
| --- | --- | --- |
| What varies | Dot size | Dot spacing / count |
| Dot placement | Fixed regular grid | Pseudo-random |
| Has angle / frequency? | Yes | No (none needed) |
| Moire risk | Yes - needs angled plates | Essentially none |
| Detail / sharpness | Good | Excellent |
| Press stability | High, predictable | Harder; fattens more |

**The key takeaway:** AM keeps dots on a grid and grows them; FM keeps dots tiny and scatters more of them. AM is stable but needs angled plates to dodge moire; FM sidesteps moire entirely but is fussier on press.

## Screen frequency: what LPI really means

**LPI (lines per inch)** is the number of rows of halftone dots packed into one inch. You will also hear it called the ruling, the line screen, or the screen frequency. Higher LPI means finer, smaller, more numerous dots and more detail - **but only if the paper and press can hold those tiny dots without smearing them together.**

That last part is the whole story. Coarse, absorbent paper soaks up ink and makes dots spread, so it forces a *lower* LPI. Smooth, coated paper holds fine dots, so it permits a higher one.

| Application | Typical LPI | Why |
| --- | --- | --- |
| Newspaper | 85–110 | Rough, absorbent paper can't hold fine dots |
| Magazines / general commercial | 133–175 (150 is the workhorse) | Coated stock holds finer dots |
| Coated commercial sheetfed | 150–200 | Smooth surface, controlled press |
| Fine art / high end | 200–300 | Best paper, best plates |

### The three letters everyone mixes up: LPI, PPI, DPI

These look alike and trip up beginners constantly. Keep them straight:

- **PPI (pixels per inch)** is the resolution of your *image file* at its final printed size.
- **LPI (lines per inch)** is the fineness of the *halftone screen* the press uses.
- **DPI (dots per inch)** is the resolution of the *output device* - how many tiny laser spots the platemaker can place per inch.

Now the practical rule. Supply your images at about **1.5 to 2 times the LPI**, measured in PPI at the final printed size. For a 150 LPI job, that means **300 PPI** images. This is the actual origin of the famous "300 dpi for print" rule of thumb - it is not magic, it is just twice 150.

And here is why platemakers run at 2400 DPI or higher while the screen is only 150 LPI: each halftone dot is itself built from a little grid of device spots, and you need lots of spots per dot to vary the dot's size in fine steps. The number of gray shades you can reproduce works out to:

```
gray levels = (device DPI / LPI) squared + 1

  2400 / 150 = 16
  16 squared + 1 = 257 gray levels   (256+ wanted for smooth tone)
```

That is *why* a 2400 DPI device is needed to drive a mere 150 LPI screen smoothly. Never confuse the device's DPI with the screen's LPI - they are genuinely different numbers doing different jobs.

## How dot shape causes the "50% problem"

Halftone dots come in several shapes: round, square, elliptical (oval, sometimes called a "chain dot"), and diamond. A dot keeps its shape as it grows - until it gets big enough to touch its neighbors. *When* it touches is where the drama happens.

As dots grow toward the dark tones, around **50% coverage** adjacent dots suddenly connect. The instant they join, the geometry changes abruptly, and that can produce a visible step or jump in a smooth midtone gradient - a kind of banding sometimes called the "dot-gain cliff."

Different shapes handle that moment differently:

- **Round dots** connect with all four neighbors at almost the same instant near 50%, producing the most abrupt, most violent midtone jump.
- **Square dots** touch at the corners first, giving sharp, snappy detail, but still a hard transition through 50%.
- **Elliptical / chain dots** connect along their short axis first, then later along their long axis - two gentle transitions instead of one harsh one. That gives the **smoothest midtones**, which is why they are the go-to choice for general commercial work and especially for skin tones.

**Best practice:** for photographs and anything with skin tones, elliptical or chain dots give the gentlest midtone transition and avoid the sudden tonal jump that round dots show right at 50%.

## Screen angles: why every plate is rotated

This is the heart of color halftoning. If two screens with the same LPI overlap at the same angle, their grids beat against each other and create a large, ugly, wavy interference pattern - that's **moire**. Picture a faint shimmering plaid laid over your image. Even a hair of misalignment makes it worse.

The fix is to **rotate each color's screen to a different angle** so the grids interleave instead of clashing. The standard CMYK set is:

| Ink | Screen angle | Why |
| --- | --- | --- |
| Black (K) | 45° | The most visible ink; the eye notices diagonal patterns least, so 45° hides it best |
| Cyan | 15° | A strong ink; kept 30° from the others |
| Magenta | 75° | A strong ink; 30° from both cyan and black |
| Yellow | 0° | So pale its pattern is nearly invisible, so it takes the weak angle |

The principle: the three **strong, dark inks (cyan, magenta, black) are spaced 30° apart** at 15, 45, and 75 degrees. That 30° separation is the "magic number" that shrinks any leftover moire to its smallest, least visible scale. Black takes 45° because it is the most visible ink and the diagonal is where our eyes least notice a pattern. Yellow takes 0° because it is so faint that even though it sits only 15° from cyan and magenta, its moire is essentially invisible anyway.

### Rosettes: the good pattern you actually want

When all four correctly angled screens print over each other, the dots arrange themselves into tiny, repeating, flower-like clusters called **rosettes**. This is the intended, healthy result - it is what your eye blends into smooth color.

So remember the difference: **moire is bad** (large, wavy, distracting) and a **rosette is good** (small, tidy, by design). The entire angle system exists to guarantee a clean rosette instead of moire.

> **Think of it like stacking two window screens.** Lay them at the same angle and you see nothing. Nudge one slightly and an ugly shimmer appears. Rotate them to deliberate angles and the interference shrinks into a tidy little flower. That flower is the rosette.

## Common misconceptions

**"Higher resolution is always better, so I'll send a 600 PPI image."** Past about twice your LPI, the extra pixels do nothing visible - the screen simply throws them away. You get a huge, slow file for no benefit. Match the image to the screen instead of maxing it out.

**"DPI and LPI are basically the same thing."** They are not, and conflating them is the single most common source of confusion in print. DPI is the machine's spot resolution; LPI is the screen's dot frequency. A 2400 DPI device printing a 150 LPI screen is normal, not a contradiction.

**"What I see on my monitor is what I'll get."** A glowing screen mixes light and can show any shade. Ink on paper cannot. Midtones in particular print noticeably darker than they look on screen, for a reason we will get to next.

**"I'll halftone my image first to be safe."** Almost never. If you screen an image yourself and the press screens it again, the two grids clash into moire. Send clean continuous-tone art and let the press do the screening exactly once.

## How to use this

If you are preparing a file for a real press, here is the short, practical checklist:

1. **Match LPI to the paper.** Ask your printer what line screen they will run. Rough or uncoated stock means a lower LPI; coated stock allows a higher one.
2. **Set image resolution to about 2x the LPI.** For a typical 150 LPI job, supply 300 PPI images at final size. More than that is wasted; much less [prints soft and pixelated](/blog/computer-graphics-print/07-raster-vs-vector-resolution-image-quality).
3. **Send continuous-tone CMYK.** Don't pre-screen, don't place an already-halftoned scan, and don't apply your own dot patterns. Let the press screen it once.
4. **Leave screening, angles, and [trapping](/blog/computer-graphics-print/09-trapping-deep-dive) to the press.** The standard angle set (cyan 15, magenta 75, yellow 0, black 45) and the trapping that hides misalignment are handled automatically. Your job is clean art plus the correct color profile.
5. **Soft-proof with the right profile.** Use your printer's [ICC profile](/blog/computer-graphics-print/03-color-management-icc-profiles-the-pipeline) so your monitor shows you the truth about how midtones and shadows will actually print, instead of an optimistic glowing version.
6. **Print to a standard and verify.** For repeatable results, the job should be printed to a recognized standard (ISO 12647, G7, or GRACoL) and checked with a control strip, so the same file looks the same from one run to the next.

## A quick word on dot gain, the glue that holds it all together

One last idea ties everything above together: **dot gain**, formally called **TVI (tone value increase)**. It simply means the printed dot ends up *larger* than it was in your file, so the print looks darker and muddier than you intended.

It happens for two reasons. **Mechanical** gain is the ink physically squashing wider under press pressure and soaking into the paper. **Optical** gain is light scattering sideways under the ink's edge inside the sheet, making each dot *look* bigger than it really is.

Dot gain is **worst in the midtones**, right around 50% - because that is where the dots have the most edge, the most perimeter, available to grow from. And notice how it connects to everything you just learned: higher LPI means more gain (smaller dots are mostly edge), FM screening means more gain (microdots are almost all edge), and the 50% touch-point is the same tonal cliff that dot shape struggles with.

The fix is **compensation**: the press applies a curve that deliberately shrinks the dots in the file, so that after the press fattens them, they land at exactly the right size. That is why designing to on-screen color and ignoring dot gain is a classic mistake - without compensation, midtones can print 15 to 30% darker than your monitor showed.

## Conclusion

The one thing to carry away: **a printing press cannot print a single shade of gray.** Every soft tone you have ever seen on paper is an illusion built from pure black-or-white dots, sized and spaced so cleverly that your own eye finishes the job. Halftoning is not a workaround bolted onto printing - it *is* printing.

And here is the thread worth pulling next. Everything in this article assumed you already had clean **CMYK** to screen. But why those four inks, and not [the red-green-blue your monitor uses](/blog/computer-graphics-print/02-color-spaces-additive-vs-subtractive-color)? The answer is a different kind of color trick entirely - one based on what light your eye *subtracts* rather than adds - and it is where the next part of the story begins.
