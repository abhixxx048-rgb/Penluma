---
title: "Trapping in Print: How to Kill Ugly White Gaps"
metaTitle: "Trapping in Print Explained Simply"
description: "Trapping in print stops ugly white gaps where two colors meet. Learn spread vs choke, the lighter-color rule, overprinting black, and when to skip it."
keywords:
  - trapping in print
  - what is trapping prepress
  - spread vs choke
  - misregistration printing
  - overprint vs knockout
  - in-RIP trapping
  - trap width
  - spot color trapping
  - prepress trapping
  - choke and spread trapping
  - black overprint
  - CMYK trapping
topic: computer-graphics-print
topicTitle: Computer Graphics for Print
category: Engineering
date: '2026-06-21'
order: 8
icon: "\U0001F5A8️"
faq:
  - q: What is trapping in printing?
    a: Trapping is deliberately overlapping two adjacent colors by a tiny amount so that if the press misaligns the inks slightly, no bare white paper shows at the seam between them.
  - q: What is the difference between spread and choke?
    a: Spread grows the foreground object outward over the background; choke grows the background inward over the object. Both create the same overlap zone — they differ only in which color moves.
  - q: Should lighter or darker color spread in trapping?
    a: The lighter color always spreads into the darker one. The dark color defines the edge your eye sees, so moving the light color keeps the shape looking crisp while hiding the overlap.
  - q: Why do you overprint black text instead of trapping it?
    a: Black ink is opaque enough to cover whatever sits beneath it, so printing it on top with no knockout means a press shift can never reveal white. It is simpler and needs no trap math.
  - q: When should you not trap?
    a: Skip trapping on continuous-tone photographs, process colors that already share a lot of common ink, and high-quality digital or tightly registered presses, where trap artifacts can look worse than the rare misalignment.
  - q: How wide should a trap be?
    a: Very small — roughly 0.24 to 0.48 points (0.08 to 0.16 mm) at 150 lpi. Black and dark traps run 1.5 to 2 times wider because dark ink hides the overlap.
author: Pritesh Yadav (priteshyadav444)
transformed: true
sources: []
---

A printing press never lays all its colors down at once. Cyan goes on, then magenta, then maybe a special blue — each from its own plate, each in its own pass. And here is the uncomfortable truth: those plates never line up perfectly. They drift by a fraction of a hair.

Leave that drift unmanaged and your finished print shows thin white slivers where two colors should meet. Trapping is the quiet prepress trick that hides them.

## Why this matters

Picture a logo printed a hundred thousand times on glossy packaging. Two flat colors sit edge to edge. The press shifts by the width of a thread, and suddenly there is a hairline of bare paper glowing along the seam of every single box.

That is not a rare disaster. Misregistration — inks failing to line up exactly — is normal. Paper stretches. A plate sits a thread off. A web press whips stock through at speed. **Trapping** is how professionals make those unavoidable shifts invisible, so the print looks clean no matter how the press behaves on a given run.

If you design anything that gets printed — labels, packaging, business cards, posters — understanding trapping is the difference between art that survives the press and art that comes back with white halos.

## The white-gap problem, in plain terms

Imagine a blue shape sitting next to a yellow shape. To print this, the press usually **knocks out** the yellow: it cuts a yellow-shaped hole in the blue so the two inks do not mix into mud. The blue plate prints around the hole; the yellow plate fills it.

If both plates land in exactly the right spot, the edges meet perfectly. But they never do. When they miss, neither ink covers the seam — and the bare white paper peeks through.

> **Think of a child coloring a cartoon.** They draw a balloon outline and fill it in, but leave a thin unpainted ring just inside the line. White shows through that ring. Trapping is like telling the child: "bleed your fill a little bit *past* the outline." Now even if your hand wobbles, no bare paper ever shows.

Here is the same idea as a sketch:

```
NO TRAP — press shifts, white gap appears:

   BLUE |  | YELLOW       ( the "|  |" = bare paper )

WITH TRAP — colors overlap, no gap can show:

   BLUE [##] YELLOW        ( "[##]" = shared overlap zone )
```

The gap problem is worst on **offset**, **flexo** (flexible-plate printing, common for packaging and labels), and **screen** printing, and on stretchy stock like newsprint or thin film. It is least on single-pass digital and toner presses, because those lay all colors down in one go with no plate-to-plate shift.

## Spread vs. choke: two ways to make the overlap

There are only two ways to build that overlap zone, and they differ only in *which color moves*.

- **Spread** (nicknamed "fattie"): the foreground object grows slightly *outward* over the background. The object gets fatter.
- **Choke** (nicknamed "skinny"): the object stays put, but the background grows slightly *inward* over it. The object effectively shrinks.

Both produce the identical result — a thin shared band where the two inks overlap. The only real question is which color grows into the other. And that question has a famous answer.

## The one rule that decides everything

If you remember nothing else, remember this:

> **The lighter color always spreads into the darker color.**

The decision is based on **neutral density** — how light or dark a color reads to the human eye. The lighter color is the one that grows.

Why? Because the **darker color defines the edge your eye sees**. Your eye reads the dark color as "the shape." Move (fatten) the lighter color, and the shape's perceived outline stays crisp — the overlap hides invisibly under the dark edge. Move the dark color instead, and you visibly distort and fatten the shape.

**Worked example.** You have light-yellow text on a dark-blue background. The blue defines the letters' outline to your eye, so you *spread the yellow outward*. Even if the press shifts, the yellow now reaches under where the blue edge sits — no white gap, and the letters still look sharp. Choke it the wrong way (spreading blue inward into the yellow) and you visibly smudge and bloat the letterforms.

## How wide is a trap?

Tiny — measured in fractions of a point. At 150 lpi (lines per inch, a common print resolution), a typical trap looks like this:

| Measure | Typical trap width |
| --- | --- |
| Inches | 1/300" to 1/150" |
| Points | 0.24 pt to 0.48 pt |
| Millimeters | 0.08 mm to 0.16 mm |

A handy rule of thumb is "about half a dot" — roughly 1/300" (0.08 mm) at 150 lpi.

A few things shift that number:

- **Black and dark traps can run 1.5x to 2x wider.** Dark ink masks misalignment well, so a wider trap simply won't be noticed.
- **Trap width should scale with press quality.** A tight, well-registered press needs a smaller trap; a sloppy press or stretchy stock (flexo, newsprint) needs a larger one.
- **There is a sweet spot.** Too wide and the trap becomes a visible dark or colored outline. Too narrow and gaps still slip through.

## When to trap — and when you must not

Trapping is not free; applied in the wrong place it makes things worse. Use this split.

**Trap it:**

- **Spot colors** (Pantone/PMS) next to anything. Each is its own plate with zero shared ink, so any shift means a white gap. Always trap.
- **Sharp, hard edges between two solid flat colors** — logos, vector art, text on a colored background, packaging. The classic trapping cases.
- **Spot color touching process color.**

**Do NOT trap it:**

- **Continuous-tone photographs** (CMYK images). Their soft edges and shared CMY inks already overlap. Trapping adds visible color fringes and degrades the image.
- **Two process colors that share enough common ink** (say, both contain a lot of cyan). The shared plate already bridges the gap, so little or no trap is needed.
- **High-quality presses with tight registration**, and most digital, toner, and inkjet output. Trap artifacts can be worse than the rare misalignment.

A counter-intuitive note: 4-color process art is often *easier* on trapping than 2-spot-color art, because the four process inks frequently share ink across the seam and bridge gaps on their own. Pure spot-to-spot is the hardest case, because the two inks share nothing.

## The shortcut for black: overprint instead of trap

There is a second tool that sidesteps trapping entirely for one very common case.

- **Knockout** (the default): the top color punches a hole in the layer beneath so the inks don't mix. This is exactly where gaps appear — knockouts are what need trapping.
- **Overprint**: the top color prints directly *on top of* the background with no hole cut beneath it. No knockout, so no gap is possible — and no spread/choke math is needed.

Black text and thin black lines are routinely set to **overprint**. Black ink is opaque enough to cover whatever sits under it, so a shift can never reveal white. This is the everyday solution for small black type.

```
KNOCKOUT edge (gap-prone):

   ___YELLOW___|GAP|___BLUE___

OVERPRINT black (no gap possible):

   ___YELLOW___[ BLACK on top ]___BLUE___
```

## Common misconceptions

- **"Overprinting is safe, so overprint everything."** No. Overprinting *light* colors causes color shifts — the background bleeds through and changes them. Overprint is safe for black, risky for everything light.
- **"Overprinting white is fine."** It is the opposite of fine. **Overprinting white makes the white disappear entirely** — white "ink" set to overprint means nothing prints there. A classic, expensive disaster.
- **"Rich black follows the overprint shortcut."** It does not. "Rich black" (black plus a CMY underlay for a deeper black) follows normal black *trapping* rules, not the simple overprint trick.
- **"Acrobat's Trap Presets actually trap my PDF."** They don't. In Acrobat Pro, that feature only stores instructions a compatible RIP applies later. If your printer's RIP ignores them, nothing is trapped.

## How modern shops actually do it

Nobody traps by hand on real jobs anymore. Trapping is computed automatically by software, usually at the **RIP** (Raster Image Processor) — the engine that converts your page into the dot pattern the press prints. "In-RIP trapping" means the traps are calculated at that final raster stage.

The Adobe In-RIP Trapping engine detects contrasting color edges, reads the neutral density of the two colors, and automatically expands the lighter into the darker — even handling one object against several different backgrounds at once. To use it you need a PostScript Level 2+ device whose RIP supports it; in the print dialog you set Color to "In-RIP Separations" and Trapping to "Adobe In-RIP."

The big gotcha: if the designer manually traps *and* the RIP traps, you get a **double trap** — visibly fat, ugly seams. Trapping should happen exactly once.

## How to use this

1. **Find your hard edges.** Look for sharp boundaries between two solid flat colors — logos, text on color, packaging panels. Those are your trapping candidates.
2. **Leave photos and shared-ink process colors alone.** If two colors already share a lot of ink, or you're dealing with a continuous-tone image, don't trap.
3. **Apply the lighter-into-darker rule.** When you do trap, spread the lighter color into the darker one so the shape's edge stays crisp.
4. **Set black type to overprint.** It's the easy win — no trap math needed.
5. **Never overprint white or light colors.** Double-check this before sending; it's the most expensive mistake on this list.
6. **Decide who traps — once.** Talk to your print provider. Either you trap, or their RIP does. Confirm their RIP supports in-RIP trapping, and don't both do it.
7. **Match trap width to the press.** Smaller for tight digital and offset; larger for flexo and stretchy stock. Bump black traps up 1.5x to 2x.

## A note for RGB-only platforms

If you build or work on a design tool that outputs **RGB only** — like a browser-based design studio backed by an RGB PDF service — trapping is genuinely out of scope, but worth understanding as a known gap. RGB artwork has no concept of spot colors, overprint, knockout, or trap zones; two flat shapes are just RGB fills with no trapping intent attached. And with no RGB-to-CMYK conversion or preflight step, nothing in the platform would separate colors into plates or flag "these two adjacent spot colors will gap."

The honest position: artwork leaves the platform as RGB, and **trapping is the print provider's RIP responsibility** downstream. If you later build a production handoff, add trap-preset metadata at the PDF export layer so the RIP knows what to do — never bake traps into the RGB canvas, where they'd be wrong for any other output device.

## Conclusion

The whole craft of trapping comes down to a single instinct: when two inks meet, let them overlap a hair, and always move the *lighter* one — because the eye trusts the dark edge to define the shape. Master that, set black to overprint, and never overprint white, and you've sidestepped the most common reasons print jobs come back with halos.

Here's the thread worth pulling next: all of this assumes your colors have already been split into separate plates — cyan, magenta, yellow, black, plus spots. That split is its own deep art, full of decisions about how a vivid RGB screen color becomes ink that actually exists. Once you see how **color separation and RGB-to-CMYK conversion** work, trapping stops looking like a trick and starts looking like the last step of a much longer story.
