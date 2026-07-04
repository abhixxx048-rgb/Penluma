# Chapter 03: Visual Design: Typography, Color, Spacing, Layout

## Why this chapter matters

Look at a well-designed app. Now look at a clumsy one. You can *feel* the difference in one second, but most people cannot explain it. This chapter gives you the explanation - and the exact numbers professionals use.

Here is the secret up front: visual design is not decoration. It is communication. A screen "looks good" when it tells you, without words, what to look at first, what to read next, and what to click. Nielsen Norman Group puts it this way: aesthetics are a byproduct of order. Hierarchy, alignment, contrast, and consistency do the real work.

Everything in this chapter pulls one of **four levers: typography, color, space, and layout**. And all four levers build one thing: **visual hierarchy** - the deliberate order in which the eye consumes a screen. Think of a good screen like a well-run supermarket. The signs hanging from the ceiling are big (departments). The shelf labels are medium (categories). The price tags are small (details). You never confuse one for the other, and you find the milk without thinking. That is visual hierarchy. Bad design is a supermarket where every sign is the same size.

One more idea to carry through the chapter: every rule below is really about **reducing mental effort**. Fewer fonts, fewer colors, predictable spacing - less for the brain to decode, more attention left for your actual content.

---

## Typography: The Voice of Your Interface

**Typography** is the craft of arranging text: which fonts you use, how big, how spaced, how bold. It matters more than anything else in UI because most interfaces are mostly text. If your product had a voice, typography would be its tone.

### Font categories (the five families you need to know)

A **typeface** (often loosely called a "font") is a designed set of letterforms. There are thousands, but they fall into a handful of families:

| Category | Examples | Feels like | Use for |
|---|---|---|---|
| **Serif** | Georgia, Times, Playfair | Tradition, authority, editorial warmth | Long articles, headlines, "established" brands |
| **Sans-serif** | Helvetica, Inter, Roboto, SF Pro | Modern, clean, neutral | UI text, body copy on screens - the default |
| **Slab serif** | Rockwell, Roboto Slab | Sturdy, assertive | Headlines, branding |
| **Monospace** | JetBrains Mono, Courier | Technical, precise | Code, numbers, tables of data |
| **Display / script / decorative** | Handwriting, gothic, novelty fonts | Personality, drama | Logos and big headlines ONLY - never body text |

A **serif** is the small "foot" at the end of a letter's strokes - like the little base on the letter *I* in a newspaper. **Sans-serif** simply means "without serifs." **Monospace** means every character takes the same width, which is why columns of numbers line up perfectly in it.

Two practical notes. First, the old rule "serifs are hard to read on screens" is dead - NN/g confirms serifs are fine on today's sharp displays. Second, NN/g explicitly warns that strangely shaped fonts (handwriting, gothic) have reduced legibility. Decorative fonts are like novelty doorbells: fun at the front door, maddening if every door in the house had one.

### How many fonts, and how to pair them

**Rule of thumb: 1–2 typefaces per product. Two is the sweet spot. Three only if the third is a monospace for code or numbers.** More than three signals a design with no system behind it.

The most reliable pairing pattern: **serif headline + sans-serif body** (or the reverse). The contrast in style itself signals hierarchy - the serif says "trustworthy, established," the sans says "modern, efficient."

Craft rules for pairing:

- **Contrast in shape.** A tall, narrow serif pairs well with a wider, rounder sans. Clearly different shapes read as intentional.
- **Match x-heights.** The **x-height** is the height of a lowercase "x." When two fonts share it, they feel like one system.
- **Limit weights to 2–3 per font.** For example: Regular (400), Semibold (600), Bold (700).
- **Avoid near-misses.** Two fonts that are *almost* identical look like a mistake, the way two slightly different whites on a wall look like a painting error. Pick clearly different, or use one font.

The safest modern strategy of all: **one large sans family** (Inter, Roboto, IBM Plex) and create all hierarchy with weight and size. You cannot mismatch a font with itself.

### The numbers designers actually use

These are not folklore. They come from measured practice (Learn UI Design's data-driven guidelines, WCAG accessibility standards, and typographic canon going back to Bringhurst's *Elements of Typographic Style*).

- **Body text: 16px is the web default and the safe floor.** For interaction-heavy apps, desktop body text runs 14–20px. For text-heavy pages like articles, go bigger: **18–24px**. On mobile, 16–20px (around 17px is a good start). Secondary and caption text sits about 2px smaller than body (13–14px).
- **Form inputs on mobile: minimum 16px.** Below that, iOS Safari auto-zooms the whole page when the user taps the field. This is a real, common bug - not a style preference.
- **Page titles (H1): roughly 32–50px on desktop.**
- **Line length: 45–75 characters per line; about 66 is the classic ideal.** **Line length** (typographers call it "measure") is how many characters fit on one line. Under ~45, the eye ping-pongs between lines too often. Over 75, the eye gets lost on the long journey back to the start of the next line - like reading a road sign stretched across an eight-lane highway. The one-line CSS fix: `max-width: 65ch`.
- **Line height: 1.4–1.6× the font size for body text; 1.5 is the accessibility baseline** (WCAG assumes 1.5 for paragraphs). So 16px text gets a 24px line height. **Line height** (or "leading") is the vertical distance from one line of text to the next. Headings need *less* - 1.1 to 1.3 - because big text with big gaps falls apart visually. Key interplay: longer lines need more line height; shorter lines need less.
- **Paragraph spacing:** put more space *between* paragraphs than between lines (a gap of roughly 0.75–1em). And never both indent *and* space paragraphs - pick one signal.
- **Type scale: don't invent sizes ad hoc.** A **type scale** is a small, fixed menu of font sizes generated by multiplying a base size by a ratio. Common ratios: **1.25 (the "Major Third," best for apps and content sites)**, 1.333 ("Perfect Fourth"), and 1.5 for dramatic marketing pages. A 1.25 scale from a 16px body gives you roughly 16 → 20 → 25 → 31–40. The tool everyone uses is typescale.com.
- **Use as few sizes as possible - ideally about 4:** header, body, secondary, tertiary.

### Hierarchy through weight, size, and color - the expert move

Here is the single biggest gap between beginners and professionals, straight from the book *Refactoring UI* (Wathan & Schoger).

Beginners create hierarchy with **size alone**: giant headings, microscopic captions. Experts use **three dials at once: size, weight, and color/opacity.** The rule: instead of many sizes, use **2–3 text colors** (dark for primary text, grey for secondary, lighter grey for tertiary) **and 2 weights** (400 normal, 600–700 semibold/bold). A 16px semibold dark label beats a 24px light one - quieter, clearer, more professional.

Supporting rules:

- **Don't use weights under 400 for UI text.** Thin weights vanish at small sizes. They are acceptable only for very large display text.
- **De-emphasize to emphasize.** Sometimes the way to make the key element pop is to make everything *around* it quieter - grey out the secondary text instead of shouting with the primary. Turn the room lights down instead of making the lamp brighter.
- **All-caps:** fine for short labels at 11–13px with a little extra letter-spacing (+0.05em). Terrible for sentences - uppercase destroys the word shapes we recognize at a glance. (Interestingly, NN/g's glanceability research found uppercase *single words* are recognized faster at a glance - context matters: labels yes, paragraphs no.)
- **Alignment: left-align body text.** Centered text is only for headlines and short blocks, because centered paragraphs force the eye to hunt for a new starting position on every line. Avoid justified text on the web - without hyphenation it creates ugly "rivers" of white space.

One last vocabulary pair, courtesy of NN/g: **legibility** is whether you can decode the letterforms (a visual property of the font); **readability** is whether you can comfortably read and understand passages (font *plus* content complexity). You control both, with different tools.

**In short:** one or two fonts, 16px+ body, 45–75 characters per line, 1.5 line height, a 1.25 type scale - and build hierarchy with weight and color, not size alone.

---

## Color: Meaning, Mood, and Attention

Color is the loudest lever you have. Used with discipline it directs attention and carries meaning; used carelessly it turns a screen into noise.

### The color wheel and its vocabulary

Three words describe any color:

- **Hue** - the color itself: red, blue, green. Its position on the color wheel.
- **Saturation** - the intensity. High saturation is vivid; low saturation is muted, greyish.
- **Lightness** - how light or dark it is.

Designers work in **HSL** (Hue, Saturation, Lightness) rather than hex codes, because HSL maps to how we actually think: "same hue, just lighter."

**Color harmonies** are recipes for picking hues that work together, based on their positions on the wheel:

| Harmony | Recipe | Character | Best for |
|---|---|---|---|
| **Monochromatic** | One hue, varied lightness/saturation | Always cohesive; easiest | Beginners - NN/g calls it the safest start |
| **Analogous** | Neighbors, ~30–60° apart | Harmonious, calm | Backgrounds, ambient UI |
| **Complementary** | Opposites (180°) | Maximum contrast; each makes the other vivid | Accents and CTAs - never 50/50 splits |
| **Split-complementary** | Base + the two neighbors of its opposite | High contrast, less tension | The most forgiving high-contrast scheme |
| **Triadic** | Three hues 120° apart | Vibrant but hard to tame | Pick one dominant hue |
| **Tetradic** | Four hues | Expert mode | Rarely needed in product UI |

The practical default for products: **a monochromatic or analogous base plus one complementary accent.**

### The 60-30-10 rule

Borrowed from interior design and endorsed by NN/g, this is the proportion recipe for any screen:

```
[############ 60% dominant ############]  usually a neutral: white,
                                          off-white, or dark surface
[###### 30% secondary ######]             another neutral or a muted
                                          brand tone
[## 10% accent ##]                        the brightest, most saturated
                                          color - CTAs, links, key states
```

Why it works: the eye gets one clear focal system instead of colorful chaos. The 10% accent has power *precisely because it is scarce*. If everything is accent-colored, nothing is - the same way a room where everyone shouts has no loud voice.

NN/g's companion rule: keep the working palette to **about 3 core colors** (neutrals + brand + accent), with functional colors like error-red sitting alongside. And one caveat every serious source repeats: 60-30-10 is about *proportions*, not accessibility. You still must check text contrast on every surface.

### Color psychology and cultural meanings

Colors carry associations, and brands lean on them. Common Western associations:

- **Red** - urgency, passion, danger, appetite (sale badges, food brands)
- **Blue** - trust, calm, competence (the number-one color in finance, tech, and healthcare: PayPal, Chase, IBM)
- **Green** - growth, nature, money, "go" and success states
- **Yellow** - optimism, caution
- **Orange** - energy, affordability, friendliness
- **Purple** - luxury, creativity
- **Black** - premium, sophistication; **White** - simplicity, cleanliness

Now the mandatory warning, which NN/g states explicitly: **these meanings are not universal.** Cultural variation is huge:

- **Red** means danger in the West but **prosperity, luck, and celebration in China** - red envelopes, wedding dresses. Western checkouts use red for errors; Chinese platforms like Taobao use red as the celebratory primary color. Same hue, opposite emotional register.
- **White** means purity and weddings in the West, but **mourning and funerals across much of East Asia**. Global bridal brands sometimes run two entirely separate visual identities for Western and Eastern markets.
- **Blue** reads masculine in the West but feminine in China; it carries protective, sacred meaning in parts of the Middle East.
- **Green** means eco and money in the West and is sacred in Islam - but in China, a green hat implies a cheating spouse. A genuine localization landmine for apparel and avatar products.

An honest note: the effect of any single hue on conversion is weaker and more context-dependent than pop articles claim. What *is* well supported is **consistency** - the same color meaning the same thing everywhere in your product beats any "magic" hue.

### Building a working palette, step by step

The Refactoring UI method, which underlies systems like Tailwind CSS:

1. **Pick a primary brand hue.** Define it in HSL.
2. **Build 8–10 shades of it** (named 50 through 900, Tailwind-style) by varying lightness - and nudging saturation up at the light and dark extremes, or the shades look washed out.
3. **Build a neutral grey ramp** of 8–10 steps. Greys do more than 60% of the work in any UI. Tint them slightly toward your brand hue (warm or cool) for cohesion.
4. **Add semantic colors:** green = success, red = error, amber = warning, blue = info. Keep these conventional - users have already learned them.
5. **Add one accent** only if the brand color can't serve as the CTA color.
6. **Don't use pure black (#000) on white.** Most systems use very dark grey (#111–#333; Material uses roughly 87% black) to soften the harshness.

### Contrast: the non-negotiable numbers

**Contrast ratio** measures the brightness difference between text and its background, from 1:1 (invisible) to 21:1 (black on white). The WCAG accessibility standard sets legal-grade minimums:

| Level | Normal text | Large text (≥24px, or ≥18.66px bold) |
|---|---|---|
| **AA (the standard target)** | **4.5:1** | 3:1 |
| **AAA (stricter)** | 7:1 | 4.5:1 |
| **Non-text UI** (icons, input borders, focus rings) | 3:1 | - |

Why these exact numbers? 4.5:1 compensates for the contrast sensitivity of roughly 20/40 vision - typical for older adults. 7:1 covers roughly 20/80 vision.

Two facts every designer must internalize:

- **About 4.5% of the world has a color-vision deficiency** - roughly 8% of men and 0.5% of women, most commonly red-green. Therefore: **never encode meaning by color alone.** A red dot and a green dot look identical to millions of users. Add an icon, a label, or a pattern.
- The classic failure is trendy light-grey text: **#999 on white is about 2.8:1 - it fails AA.** Trendy is not readable. The WebAIM Million survey finds low-contrast text is the single most common accessibility error on the web, appearing on roughly 80% of home pages.

Check with the WebAIM Contrast Checker, the Stark plugin, or Chrome DevTools - and check **both light and dark modes**, because a grey that passes on white often fails on a dark surface.

**In short:** 60-30-10 proportions, about 3 core colors, meanings that vary by culture, and 4.5:1 contrast on all normal text - with color never carrying meaning alone.

---

## Whitespace and Spacing Systems

**Whitespace** (also called negative space) is the empty area between things. It is not wasted space - it is the design. There are two kinds: **macro space** (between big sections) and **micro space** (line height, padding inside buttons, gaps between list items).

### Why whitespace works (the evidence)

- A 2004 study by Lin found that proper whitespace between paragraphs and in margins **improves reading comprehension by up to ~20%**. It also reduces perceived effort and eye strain.
- A frequently quoted survey stat: **about 84% of users prefer simple, clean designs** over crowded ones (treat as directional, but the direction is clear).
- Whitespace signals value. Compare Apple's product pages - one product, oceans of space - with a discount retailer's flyer crammmed edge to edge. Density itself is a brand message: generous space whispers "premium," crowding shouts "cheap."

The most-quoted advice from Refactoring UI: **"Start with too much whitespace, then remove."** Beginners cram. It is far easier to tighten a spacious layout than to rescue a cramped one.

### The 8-point grid: the industry-standard spacing system

Instead of choosing spacing values freely (13px here, 19px there), professionals pick from a tiny fixed menu: **all spacing, padding, margins, and component sizes are multiples of 8px, with 4px as the half-step:**

```
4   8   12   16   24   32   40   48   64   96
```

Why 8?

1. It divides evenly into common screen dimensions and scales cleanly across 1x/2x/3x pixel densities - no half-pixel blur.
2. The underrated reason: **it removes decisions.** You choose from ~10 values instead of 100. Ten values used consistently create rhythm; a hundred values create noise.

Who uses it: Google Material Design (8dp grid, 4dp for icon internals), IBM Carbon (the 8px "mini unit"), Apple's HIG (effectively 8/4pt rhythms), Atlassian, Shopify Polaris. This is as close to a universal industry convention as design gets.

Related numbers you must know - **touch targets** (the tappable area of a button or icon): **Apple requires 44×44pt minimum, Material requires 48×48dp, and WCAG 2.2 sets a legal-ish floor of 24×24px.** Aim for 44–48.

### The proximity rule: every spacing decision is a grouping decision

This is the single most useful spacing law, and it comes from Gestalt psychology (the study of how the brain groups what it sees): **space within a group must be smaller than space between groups.** The brain reads gaps as grouping *before* it reads any words.

Concrete example - a form:

```
Email                      <- label sits 4–8px above its input
[________________]
                           <- 24–32px gap before the next pair
Password
[________________]
```

If every gap were equal, users could not tell which label belongs to which field - like a parking lot where the lines are evenly spaced between *and* within spots.

A companion heuristic: **inner padding ≤ outer margin.** If a card has 16px of internal padding, cards should sit at least 16px apart (usually 24px).

**In short:** start with too much whitespace, snap every gap to the 8pt scale, and make gaps inside a group smaller than gaps between groups.

---

## Layout and Grids

A **grid** is an invisible skeleton of columns that everything on the page aligns to. It is the shelving system of your supermarket: shoppers never see the shelf brackets, but without them the goods would be a pile on the floor.

### The 12-column grid

**The desktop default is 12 columns.** Why 12? It is the most flexible number, because it divides evenly by 2, 3, 4, and 6. All of these snap to it:

```
|-----6-----|-----6-----|      two halves
|---4---|---4---|---4---|      three cards
|--3--|--3--|--3--|--3--|      four tiles
|-------8-------|---4---|      content + sidebar
```

Grid anatomy:

- **Columns** - the vertical strips content spans (fluid width).
- **Gutters** - the fixed gaps between columns, commonly **16–24px** (sometimes 32px on wide screens).
- **Margins** - the outer edges, equal to or wider than gutters.

The responsive convention (Material Design's canonical version): **12 columns on desktop, 8 on tablet, 4 on mobile.** (Bootstrap keeps 12 everywhere and just spans them differently - same idea.) **Breakpoints** - the screen widths where the layout reorganizes - typically fall around <600px (mobile), 600–905 (tablet), 905–1240 (small desktop), 1240+ (large desktop).

One number matters more than filling the screen: **content max-width.** Containers commonly cap at **1140–1280px**, centered. And reading content should wrap at ~65–75 characters, because full-width text on a 27-inch monitor produces 150+ character lines that destroy the line-length rule from the typography section. Big screens earn bigger margins, not longer lines.

### Alignment

**Everything should align to something.** A box that is 3px off is the number-one "this looks unprofessional but I can't say why" tell. Alignment is the level of craft users feel without seeing.

- Prefer **strong left edges.** A shared left alignment creates an invisible vertical line the eye scans down - this line is exactly the stem of the F-pattern you'll meet in a moment.
- **Optical beats mathematical.** Icons and triangular shapes (like a play button) need a small manual nudge to *look* centered even when the pixel math says they are. Trust your eye.
- Don't mix centered and left-aligned blocks arbitrarily within one section. Pick an alignment style and hold it.

**In short:** build on a 12-column grid, cap content around 1200px and text at ~70 characters, and align everything to strong shared edges.

---

## Visual Hierarchy: How the Eye Is Guided, Step by Step

Now the four levers come together. **Visual hierarchy** is the deliberate ranking of elements so the eye visits them in the order you intend. Every mechanism of hierarchy is a form of **contrast**:

- **Size** - big is seen first
- **Weight** - bold is seen first
- **Color/saturation** - vivid is seen first
- **Position** - top-left first (in left-to-right cultures)
- **Whitespace/isolation** - a lone element draws the eye
- **Imagery** - faces and photos beat text

### What eyes do when you give them no guidance: the F-pattern

NN/g's famous eye-tracking research (first published in 2006 with 45+ participants, re-confirmed since - including on mobile) found that on text-heavy pages, users read in an **F shape**:

```
█████████████████████    1. full sweep across the top
████
█████████████            2. shorter second sweep
████
████                     3. vertical scan down the left edge
████
```

The consequence is brutal: **content on the right side and lower down gets skipped - and users don't know they missed it.** NN/g's countermeasures: front-load key words (the first two words of every heading and link carry the weight), bold key phrases, use bullets, cut filler.

Crucial nuance: the F-pattern is what users do **when the design gives them no better guidance**. Strong visual hierarchy overrides it. The F-pattern is the default path of a shopper with no signage; your job is to build the signage.

For sparse layouts - landing pages, ads - the eye follows a **Z-pattern** instead: top-left (logo) → top-right (nav/CTA) → diagonal through the hero → bottom-right (final CTA). Design hero sections so the end of the Z lands on your primary action.

### A worked example: walking the eye down a pricing page

Watch hierarchy operate, step by step:

1. The eye lands on the **largest, darkest element** - the H1 ("Simple pricing").
2. It drops to the **highlighted "recommended" plan card** - an accent border and a slight size increase make it contrast with its siblings.
3. Inside the card, the **price is the biggest thing**; the feature list is grey secondary text.
4. The **single saturated CTA button** is the only 10%-accent element on the whole screen - it cannot be missed.
5. The footnotes are small, light grey - deliberately read last.

Every level is exactly one notch quieter than the previous. That **"one notch quieter" staircase IS visual hierarchy.**

Two tools to verify yours:

- **The squint test.** Blur your eyes (or apply a 5px blur to a screenshot). You should still see what matters most. If everything blurs into equal grey mush, you have no hierarchy.
- **One primary action per screen.** Only one high-emphasis (filled, accent-colored) button per view; secondary actions get outlined or plain-text styles. Material Design formalizes this as contained/outlined/text button tiers. Two screaming CTAs cancel each other out.

**In short:** the eye follows contrast; rank every element one notch quieter than the one above it, and confirm with the squint test.

---

## Consistency and Design Tokens

**Consistency means: same value, same meaning, everywhere.** If bright blue is the CTA color on one screen, it must be the CTA color on every screen. Inconsistency forces users to re-learn your interface page by page, and it quietly erodes trust - like a hotel where every floor's light switches work differently.

### Design tokens: consistency you can enforce

A **design token** is a named key-value pair that stores a design decision:

```
color.primary     = #2563EB
spacing.md        = 16px
font.size.body    = 1rem
radius.sm         = 4px
```

The name carries the *intent*; the value is just the implementation detail. Why this matters:

- **Change once, update everywhere.** Rebrand the primary color by editing one line - no drift between design files and code.
- **Shared vocabulary.** "Use `spacing.lg`" is unambiguous in design–dev handoff; nobody measures screenshots.
- **Theming.** Light mode, dark mode, or multiple brands become just different value sets under the same names.

Mature systems organize tokens in **three tiers**: (1) **primitive** tokens - raw values like `blue-600`, `space-4`; (2) **semantic** tokens - purpose, like `color-action-primary` or `surface-background`; (3) **component** tokens, like `button-padding-x`. Nathan Curtis's naming taxonomy (namespace → category → property → variant/state) yields names like `color-background-interactive-hover`. Material Design 3, Salesforce Lightning, Adobe Spectrum, and the U.S. government's USWDS all publish full token systems, and the W3C is drafting a standard JSON format.

The beginner-sized version of all this: **one type scale, one spacing scale, one corner-radius set (e.g., 4/8/16), one shadow set (3–4 elevations), one icon set at one stroke weight - then never deviate ad hoc.**

**In short:** decide each value once, give it a name, and reuse the name everywhere.

---

## Imagery and Iconography

### Imagery rules

- **Real and specific beats generic stock.** NN/g research has long shown users ignore decorative stock photos ("business people shaking hands") but engage with informative images - real product photos, real team members. Generic stock actively hurts credibility.
- **Faces attract eyes powerfully - and gaze directs attention.** People look where a pictured person is looking. The classic James Breeze eye-tracking study with a baby's face showed it: when the baby faced the camera, viewers stared at the baby; when the baby looked toward the text, viewers read the text. Point your model's gaze at your CTA or headline. A face staring straight out competes with your content.
- **One visual treatment.** Keep the same filter, tone, and saturation family across all photos; don't mix illustration styles with photography arbitrarily.
- **Text over images still needs 4.5:1 contrast** - over the *busiest* area of the photo. Use a dark scrim (30–60% black overlay), a text-protection gradient, or a blur.
- **Performance is a design rule.** Compress images, serve responsive sizes, and reserve layout space so content doesn't jump as photos load.

### Iconography rules

- **Standard UI icon size: 24×24px** (Material, IBM), with supporting sizes at 16/20/32/40/48. Design on a keyline grid so different shapes (circle vs. square vs. tall) look optically equal.
- **Icon ≠ touch target.** A 24px icon needs padding to reach the 44pt (Apple) / 48dp (Material) interactive size.
- **Label your icons.** NN/g's rule: only a handful of icons are universally understood - magnifier, house, cart, play. Everything else is ambiguous. Apply the **5-second test**: if users can't guess an unlabeled icon's meaning in about 5 seconds, it needs a visible text label. The hamburger menu's well-documented discoverability problems are the canonical case study. Unlabeled icons are "mystery meat" - nobody orders it twice.
- **One family, one style.** Consistent stroke weight (all 1.5px or all 2px), consistent corner radii, all-outlined or all-filled. Randomly mixing filled and outlined icons is a classic amateur tell. (Systematic mixing is fine - e.g., filled variant marks the active nav item.)

**In short:** use real images with one consistent treatment, keep icons in one 24px family, and label anything a stranger couldn't name in five seconds.

---

## Common Mistakes

1. **Low-contrast grey text** (#aaa or #999 on white). Fails 4.5:1, unreadable in sunlight - and the #1 detected accessibility error on ~80% of home pages (WebAIM Million). *Fix:* test every text/background pair; body text at #333 or darker on white.
2. **Too many fonts, weights, and sizes.** More than 2 typefaces or 4–5 text sizes is visual noise. *Fix:* one or two fonts, 2–3 weights, ~4 sizes from a 1.25 scale.
3. **Centered body paragraphs.** Fine for headlines; painful for reading blocks. *Fix:* left-align anything longer than two lines.
4. **Hierarchy by size alone** - giant H1s and 10px captions. *Fix:* layer the three dials: size + weight + text color.
5. **Even spacing everywhere.** Users can't tell which label belongs to which field. *Fix:* the proximity rule - tighter inside groups, looser between them.
6. **Random spacing values** (13px here, 19px there). No rhythm. *Fix:* adopt the 8pt scale and never leave it.
7. **Full-width text lines on desktop** - 150+ characters per line. *Fix:* `max-width: 65ch` on reading content.
8. **Pure black on pure white** (harsh) - or its opposite sin, grey-on-grey (invisible). *Fix:* very dark grey text (#111–#333) on off-white, checked against 4.5:1.
9. **Color as the only signal** - red/green status dots with no icon or label are invisible to ~8% of male users. *Fix:* always pair color with an icon, label, or pattern.
10. **More than one screaming CTA per screen.** Competing accents cancel out. *Fix:* one filled accent button per view; everything else outlined or text-style.
11. **Unlabeled mystery-meat icons.** *Fix:* the 5-second test; add labels, especially in navigation.
12. **Decorative stock photos** pushing real content below the fold. *Fix:* informative images only, or none.
13. **Designing only light mode** and discovering contrast failures in dark mode later. *Fix:* verify every color pair on both light and dark surfaces from day one.

---

## Best Practices Checklist

- [ ] Body text is at least 16px (18–24px for long-form reading; ≥16px in mobile form inputs)
- [ ] Lines of text run 45–75 characters (`max-width: 65ch`)
- [ ] Body line height is 1.4–1.6; headings 1.1–1.3
- [ ] Font sizes come from one modular scale (e.g., 1.25 ratio); about 4 sizes total
- [ ] Maximum 2 typefaces (3 only with a monospace); 2–3 weights each, none below 400
- [ ] Hierarchy uses size + weight + text color together, not size alone
- [ ] Palette follows 60-30-10; ~3 core colors plus neutrals and semantic colors
- [ ] All normal text hits 4.5:1 contrast (3:1 for large text and UI elements) - in both light and dark mode
- [ ] No meaning is carried by color alone - icons/labels back it up
- [ ] Every spacing value is a multiple of 8 (or 4 for fine adjustments)
- [ ] Space within groups is visibly smaller than space between groups
- [ ] Layout sits on a 12-column grid; content container caps around 1140–1280px
- [ ] Every element aligns to a shared edge; left edges are strong
- [ ] Touch targets are at least 44×44pt / 48×48dp
- [ ] Exactly one high-emphasis CTA per screen
- [ ] Icons are one family, one stroke weight, 24px base - labeled unless universally understood
- [ ] Design decisions are captured as named tokens (or at minimum, one written scale for type, spacing, radius, shadows)
- [ ] The screenshot passes the squint test: the most important element still wins when blurred

---

## Key Takeaways

- Visual design is communication, not decoration: four levers - typography, color, space, layout - all serve one goal, visual hierarchy.
- Typography's core numbers: 16px+ body, 45–75 characters per line, 1.5 line height, ~4 sizes from a 1.25 scale, 1–2 typefaces.
- Experts build hierarchy with three dials at once - size, weight, and text color - and often emphasize by making everything else quieter.
- Color follows 60-30-10: a scarce accent is a powerful accent. Keep ~3 core colors, and remember meanings flip across cultures (red = danger in the West, celebration in China).
- Contrast is non-negotiable: 4.5:1 for normal text, 3:1 for large text and UI parts - and never encode meaning with color alone, because ~8% of men can't see the difference.
- Whitespace improves comprehension by up to ~20% (Lin 2004). Start with too much, then remove.
- The 8-point grid turns a hundred spacing decisions into ten - and the proximity rule makes every gap a grouping decision.
- Layouts live on a 12-column grid (8 tablet, 4 mobile) with everything aligned to strong shared edges.
- Eyes default to the F-pattern when a design gives no guidance; strong hierarchy - one notch quieter at each level - overrides it. Verify with the squint test.
- Consistency scales through design tokens: decide each value once, name it, and reuse the name everywhere.
