# Research Notes — Chapter: Visual Design (Typography, Color, Spacing, Layout)

Research date: 2026-07-04. Sources: NN/g, W3C/WCAG, WebAIM, Material Design, Apple HIG, IBM Design Language, Adobe Spectrum, USWDS, Learn UI Design, Refactoring UI (Wathan & Schoger), Smashing Magazine, IxDF, plus credible 2025–2026 practitioner articles. Full URL list at the end.

---

## 1. The Big Idea: Visual Design Is Communication, Not Decoration

Visual design is the layer of UI/UX that decides *what users see first, what they read next, and what they trust*. NN/g's framing: a design "looks good" when it communicates clearly — hierarchy, alignment, contrast, and consistency do the work; aesthetics are a byproduct of order. Every rule below is really about reducing cognitive load: fewer fonts, fewer colors, predictable spacing = less for the brain to decode.

A useful mental model for the chapter: **the four levers of visual design are typography, color, space, and layout** — and all four are used to build one thing: **visual hierarchy** (the deliberate order in which the eye consumes a screen).

---

## 2. Typography

### 2.1 Font categories (plain English)
- **Serif** (Times New Roman, Georgia, Playfair Display): small "feet" on letter ends. Connotations: tradition, authority, editorial, warmth. Fine on modern high-res screens (NN/g: serif is acceptable now that displays are sharp).
- **Sans-serif** (Helvetica, Inter, Roboto, SF Pro): no feet. Connotations: modern, clean, neutral. The default for UI text and most body copy on screens.
- **Slab serif** (Rockwell, Roboto Slab): heavy blocky serifs — sturdy, assertive; headlines/branding.
- **Monospace** (JetBrains Mono, Courier): every character same width — code, numbers, tabular data.
- **Display/Script/Decorative** (handwriting, gothic, novelty): headlines and logos ONLY, never body text. NN/g explicitly warns "strangely shaped fonts (handwriting, gothic)" have reduced legibility.

### 2.2 How many fonts, and how to pair them
- **Rule of thumb: 1–2 typefaces per product; 2 is the sweet spot; 3 only if one is a monospace for code/numbers.** More than three signals a design without a system (NN/g: "limit your design to 1–2 fonts; always use the same type variant for the same purpose").
- **The most reliable pairing pattern: serif headline + sans-serif body (or the reverse).** The style contrast itself signals hierarchy; serif reads "trustworthy/established," sans reads "modern/efficient."
- Pairing craft rules:
  - **Contrast in shape**: tall narrow serif → pair with wider, rounder sans.
  - **Match x-heights** so the two fonts feel like one system.
  - **Limit weights to 2–3 per font** (e.g., Regular 400 + Semibold 600 + Bold 700).
  - Avoid pairing two fonts that are *almost* the same — near-misses look like mistakes; pick clearly different or identical.
- A safe modern one-font strategy: a large-family sans (Inter, Roboto, IBM Plex) using weight + size alone for hierarchy.

### 2.3 The numbers designers actually use
- **Body text: 16px is the web default and the safe floor.** Learn UI Design's data-driven guidelines: desktop body 14–20px for interaction-heavy apps, **18–24px for text-heavy pages** (articles); mobile body 16–20px (start around 17px). Secondary/caption text ≈ 2px smaller than body (13–14px).
- **Form inputs on mobile: minimum 16px**, otherwise iOS Safari auto-zooms the page when the field is focused (a real, common bug).
- **Page titles/H1: roughly 32–50px on desktop** (Learn UI Design: 35–50px for headers).
- **Line length (measure): 45–75 characters per line, ~66 is the classic ideal; 50–75 is the working target.** Under ~45–50 chars the eye ping-pongs between lines too often; over 75 the eye loses its place returning to the next line (Smashing Magazine, Pimp my Type, typographic canon from Bringhurst's *Elements of Typographic Style*). CSS trick: `max-width: 65ch`.
- **Line height (leading): 1.4–1.6× font size for body text; 1.5 is the accessibility baseline** (WCAG 1.4.12 assumes 1.5 for paragraph text). So 16px body → 24px line height. Headings need LESS: 1.1–1.3. Key interplay: **longer lines need more line height; shorter lines need less.**
- **Paragraph spacing:** more space between paragraphs than between lines (a blank ~0.75–1em); never indent AND space — pick one.
- **Type scale:** don't invent sizes ad hoc; use a modular ratio. Common ratios: **Major Third 1.25** (used in Material-style balanced hierarchies, best for apps/content sites), **Perfect Fourth 1.333**, **1.5 for dramatic marketing pages**. Example 1.25 scale from 16px body: 16 → 20 (H3) → 25 (H2) → 31–40 (H1). Tool everyone uses: typescale.com.
- Practical size-count rule: **as few font sizes as possible — ideally about 4** (header, body/default, secondary, tertiary).

### 2.4 Hierarchy through weight, size, and color (Refactoring UI's key insight)
- Beginners create hierarchy with size alone → giant headings and microscopic captions. **Experts use three dials: size, weight, and color/opacity.**
- Refactoring UI rule: instead of many sizes, use **2–3 colors (dark for primary text, grey for secondary, lighter grey for tertiary) and 2 weights (400/normal, 600–700/semibold-bold)**. E.g., a 16px semibold dark label beats a 24px light label.
- Don't use font weights under 400 for UI text (thin weights disappear at small sizes; acceptable only for large display text).
- De-emphasize to emphasize: sometimes the way to make the key element pop is to make everything *around* it quieter (grey out secondary text) rather than making the key element louder.
- **All-caps**: fine for short labels/overlines at 11–13px with added letter-spacing (+0.5 to 1.5px / 0.05em); terrible for sentences (uppercase blocks word-shape recognition and reads slower — though NN/g's glanceability research found uppercase *single words* are recognized faster at a glance; context matters: labels vs. running text).
- **Alignment**: left-align body text (ragged right). Centered text is only for headlines and short blocks — centered paragraphs force the eye to find a new start position every line. Avoid justified text on the web (creates "rivers" of uneven spacing without hyphenation).
- **Legibility vs readability** (NN/g distinction): legibility = can you decode the letterforms (a typography/visual property); readability = can you comfortably read and comprehend passages (typography + content complexity). Designers control both, with different tools.

---

## 3. Color

### 3.1 Color wheel & harmonies (the vocabulary)
- **Hue** = the color itself (position on wheel); **saturation** = intensity; **lightness/value** = light-dark. Designers manipulate colors in **HSL/HSB** because it maps to how we think ("same hue, lighter").
- Harmonies (IxDF, Sessions College, supercharge.design):
  - **Monochromatic**: one hue, varied lightness/saturation — easiest for beginners, always cohesive; NN/g calls it the safest starting point.
  - **Analogous**: neighbors within ~30–60° on the wheel — harmonious, calm; good for backgrounds/ambient UI.
  - **Complementary**: opposites (180°) — maximum contrast; each makes the other look more vivid ("simultaneous contrast"); use for CTAs and accents, not 50/50 splits.
  - **Split-complementary**: base + the two neighbors of its complement — high contrast, less tension; most forgiving high-contrast scheme.
  - **Triadic**: three hues 120° apart — vibrant, balanced; hard to keep tasteful; pick one dominant.
  - **Tetradic/square**: four hues — expert-mode, rarely needed in product UI.
- Practical default: **analogous or monochromatic base + one complementary accent.**

### 3.2 The 60-30-10 rule
- Borrowed from interior design; endorsed by NN/g ("Using Color to Enhance Your Design"): **60% dominant color (usually a neutral — white/off-white/dark surface), 30% secondary (often another neutral or muted brand tone), 10% accent (the brightest, most saturated color — reserved for CTAs, links, key states).**
- Why it works: gives the eye one clear focal system; prevents "colorful chaos." The 10% accent gets its power precisely *because* it's scarce — if everything is accent-colored, nothing is.
- NN/g's companion rule: **max ~3 colors in the working palette** (neutrals + brand + accent; functional colors like error-red sit alongside).
- Caveat repeated by every serious source: 60-30-10 is proportions, **not** accessibility — you still must check text contrast on every surface.

### 3.3 Color psychology & cultural meanings (with the mandatory caveat)
- Western associations commonly used in branding (Uxcel, POLA, iMotions): **red** = urgency, passion, danger, appetite (sales badges, food brands); **blue** = trust, calm, competence (the #1 color in finance/tech/healthcare — PayPal, Chase, Facebook, IBM); **green** = growth, nature, money, "go"/success states; **yellow** = optimism, caution; **orange** = energy, affordability, friendliness; **purple** = luxury, creativity; **black** = premium, sophistication; **white** = simplicity, cleanliness.
- **Cultural variation is huge — never assume universality (NN/g explicitly warns this):**
  - **Red**: danger/passion in the West; **prosperity, luck, celebration in China** (red envelopes, wedding color).
  - **White**: purity/weddings in the West; **mourning and funerals in much of East Asia**.
  - **Blue**: masculine in the West, perceived as feminine in China; associated with protection/sacredness in parts of the Middle East; immortality in some Eastern traditions.
  - **Green**: eco/money in the West; sacred in Islam; but in China a green hat implies infidelity — a real localization landmine for apparel/avatar products.
  - Case-study framing: global brands (e.g., bridal campaigns) sometimes run **two separate visual identities** for Western vs. Eastern markets.
- Honest note for the chapter: color-psychology effects on conversion are weaker and more context-dependent than pop articles claim; the *consistency* of color use (same color = same meaning everywhere in the product) is better supported than any single hue's magic.

### 3.4 Building a working UI palette (step-by-step, Refactoring UI style)
1. Pick a **primary/brand hue**; define it in HSL.
2. Build **8–10 shades of it** (50→900, Tailwind-style) by varying lightness AND nudging saturation up at the extremes (pure lightness changes look washed out).
3. Build a **neutral grey ramp** (8–10 steps) — greys do 60%+ of UI work; slightly tint greys toward the brand hue (warm or cool) for cohesion.
4. Add **semantic/functional colors**: green = success, red = error/destructive, yellow/amber = warning, blue = info. Keep these conventional — users have learned them.
5. Add ONE accent if the brand color can't serve as the CTA color.
6. Don't use pure black (#000) for text on white — most systems use very dark grey (e.g., #111–#333, Material's ~87% black) to reduce harshness.

### 3.5 Contrast & accessibility (the non-negotiable numbers)
- **WCAG 2.x Level AA: 4.5:1 minimum contrast for normal text; 3:1 for large text** (large = ≥24px regular or ≥18.66px bold; i.e., 18pt / 14pt-bold). (W3C SC 1.4.3)
- **Level AAA: 7:1 normal text, 4.5:1 large text** (SC 1.4.6).
- **Non-text UI: 3:1** for interactive component boundaries, focus indicators, icons, and meaningful graphics (SC 1.4.11).
- Why those numbers: 4.5:1 compensates for contrast-sensitivity loss at ~20/40 vision (typical for older adults); 7:1 for ~20/80 vision (W3C Understanding docs).
- **~4.5% of the world (about 8% of men, 0.5% of women) has some color-vision deficiency**, most commonly red-green → **never encode meaning by color alone** (add icons, labels, patterns; WCAG SC 1.4.1 "Use of Color").
- Classic failure: light grey text (#999 on white ≈ 2.8:1 — fails AA). Trendy ≠ readable.
- Tools: WebAIM Contrast Checker, Stark plugin, Chrome DevTools contrast inspector. Also design and verify in **both light and dark modes** — a passing light-mode grey often fails on dark surfaces.

---

## 4. Whitespace & Spacing Systems

### 4.1 Why whitespace matters (evidence)
- Whitespace (negative space) = macro space (between big sections) + micro space (line-height, padding inside components, gaps between list items).
- **Lin (2004) study: proper whitespace between paragraphs and in margins improves reading comprehension by up to ~20%** (widely cited via Loop11/UX Planet/IxDF). Also reduces perceived effort/eye strain.
- Survey stat often quoted: **~84% of users prefer simple, clean designs over crowded ones** (cited in whitespace literature; treat as directional).
- Luxury/perceived value: generous whitespace signals premium (compare Apple's product pages vs. a discount retailer — density itself is a brand message).
- Refactoring UI's most quoted advice: **"Start with too much whitespace, then remove"** — beginners cram; it's easier to tighten a spacious layout than to rescue a cramped one.

### 4.2 The 8-point grid (the industry-standard spacing system)
- **All spacing, padding, margins, and component sizes are multiples of 8px (with 4px as the half-step for fine adjustments): 4, 8, 12, 16, 24, 32, 40, 48, 64, 96.**
- Why 8: divides evenly into common screen dimensions; scales cleanly across 1x/2x/3x pixel densities without half-pixel blur; and — the underrated reason — **it removes decisions** (pick from ~10 values, not 100).
- Adopters: **Google Material Design (8dp grid, 4dp for icon-internal spacing), IBM Carbon (8px "mini unit"), Apple HIG effectively aligns to 8/4pt rhythms**, Atlassian, Shopify Polaris.
- Touch/click targets: **Apple HIG: minimum 44×44pt; Material: 48×48dp; WCAG 2.5.8 (AA, WCAG 2.2): minimum 24×24 CSS px** (24 is the legal-ish floor; 44–48 is the good-practice target).
- **The proximity rule (the single most useful spacing law): space WITHIN a group must be smaller than space BETWEEN groups.** Gestalt law of proximity — the brain reads gaps as grouping before it reads any words. Concrete example: form label sits 4–8px above its input; 24–32px separates that pair from the next field. "Every spacing decision is a grouping decision."
- Related ratio heuristic: inner padding ≤ outer margin; if a card has 16px internal padding, cards should sit ≥16px (usually 24px) apart.

---

## 5. Layout & Grids

### 5.1 The 12-column grid
- **Desktop default: 12 columns** — the most flexible number because it divides by 2, 3, 4, and 6 (layouts of 6+6, 4+4+4, 3+3+3+3, 8+4 sidebar all snap to it).
- **Responsive convention: 12 columns desktop, 8 tablet, 4 mobile** (Material Design's canonical breakdown; Bootstrap keeps 12 everywhere and spans differently).
- Anatomy: **columns** (fluid width), **gutters** (fixed gaps between columns — commonly 16–24px, sometimes 32px on wide screens), **margins** (outer edges — equal to or wider than gutters; wider on large screens).
- **Breakpoints** (typical, per Bootstrap/Material/Spectrum): ~<600px mobile, 600–905 tablet, 905–1240 small desktop, 1240+ large desktop; content containers commonly max out at **1140–1280px** with centered margins.
- Content max-width matters more than filling the screen: full-width text on a 27" monitor destroys the 45–75ch line length rule; wrap reading content at ~65–75ch.

### 5.2 Alignment
- **Everything should align to something.** Misalignment (a box 3px off) is the #1 "looks unprofessional but I can't say why" tell.
- Prefer **strong left edges** — shared left alignment creates the invisible line the eye scans down (this is exactly the stem of the F-pattern).
- Optical vs. mathematical alignment: icons and triangular shapes (play buttons) need optical nudging to *look* centered; trust your eye over the pixel numbers.
- Consistency of alignment style: don't mix centered and left-aligned blocks arbitrarily within one section.

### 5.3 Visual hierarchy — how the eye is guided, step by step
- Mechanisms of hierarchy (all are forms of **contrast**): size (big first), weight (bold first), color/saturation (vivid first), position (top-left first in LTR cultures), whitespace/isolation (a lone element draws the eye), imagery (faces and photos beat text).
- **F-pattern (NN/g eyetracking, first identified 2006 with 45+ participants, re-confirmed since including on mobile):** on text-heavy pages users make a horizontal sweep across the top, a shorter second sweep, then a vertical scan down the left edge. Consequence: **content on the right side and lower down gets skipped**; users don't know they missed it. Countermeasures (NN/g): front-load key words in headings and first paragraphs, information-bearing first 2 words of each heading/link, bold key phrases, bullets, cut filler. Important nuance: the F-pattern is what users do **when the design gives them no better guidance** — strong visual hierarchy overrides it.
- **Z-pattern**: for sparse layouts (landing pages, ads): eye goes top-left (logo) → top-right (nav/CTA) → diagonal through the hero → bottom-right (final CTA). Design hero sections so the terminal of the Z lands on the primary action.
- Step-by-step worked example for the chapter (a pricing page): (1) eye lands on the largest, darkest element — the H1; (2) drops to the highlighted "recommended" plan card (accent border + slight scale = contrast); (3) inside the card, price is biggest, features are grey secondary text; (4) the single saturated CTA button is the only 10%-accent element on screen; (5) footnotes are small, light grey — deliberately last. Every level is one notch quieter than the previous: that "one notch quieter" staircase IS visual hierarchy.
- Squint test: blur your eyes (or apply a 5px blur to a screenshot) — you should still see what's most important. If everything blurs into equal grey mush, there's no hierarchy.
- One primary action per screen: only one high-emphasis (filled, accent-colored) button per view; secondary actions are outlined/ghost/text buttons (Material's contained/outlined/text button emphasis tiers formalize this).

---

## 6. Consistency & Design Tokens

- **Consistency = same value, same meaning, everywhere.** If bright blue is the CTA color on one screen, it must be the CTA color on all screens (NN/g). Inconsistency forces users to re-learn the interface per page and erodes trust.
- **Design tokens** = named, platform-agnostic key-value pairs storing design decisions: `color.primary = #2563EB`, `spacing.md = 16px`, `font.size.body = 1rem`, `radius.sm = 4px`. The name carries the *intent*; the value is the implementation detail.
- Why tokens matter: change once, update everywhere (no drift between design files and code); shared vocabulary in design-dev handoff (`spacing.lg` is unambiguous — no measuring screenshots); enables theming (light/dark, brands) by swapping value sets under the same names.
- **Token hierarchy in mature systems (3 tiers):** (1) **primitive/global** tokens = raw values (`blue-600`, `space-4`); (2) **semantic/alias** tokens = purpose (`color-action-primary`, `surface-background`); (3) **component** tokens (`button-padding-x`). Naming taxonomy (Nathan Curtis/EightShapes): namespace → category → property → variant/state, e.g., `color-background-interactive-hover`.
- Shipping examples: **Material Design 3, Salesforce Lightning, Adobe Spectrum, USWDS** all publish token systems; W3C has a Design Tokens Community Group draft format (JSON) for tool interop.
- Practical consistency checklist for beginners: one type scale, one spacing scale, one corner-radius set (e.g., 4/8/16), one shadow set (3–4 elevations), one icon set at one stroke weight — then *never* deviate ad hoc.

---

## 7. Imagery & Iconography

### Imagery rules
- Use real, specific photos over generic stock (stock "business people shaking hands" actively hurts credibility; NN/g research has long shown users ignore decorative stock but engage with informative images — e.g., real product photos, real team members).
- **Faces attract eyes powerfully.** Eye-tracking practice: people look where a pictured person is looking (gaze-cueing) — pointing a model's gaze toward your CTA/headline directs attention there; a face staring straight out competes with your content. (Classic James Breeze "baby eye-tracking" study; treat the effect as directional practice wisdom backed by gaze-cueing research.)
- Keep one visual treatment: same filter/tone/saturation family across all photos; don't mix illustration styles with photography arbitrarily.
- Text over images needs a contrast strategy: dark overlay/scrim (30–60% black), text protection gradient, or blur — the WCAG 4.5:1 rule still applies over the busiest area of the photo.
- Performance is a design rule too: compress, serve responsive sizes, reserve layout space (no content jumping).

### Iconography rules
- **Standard UI icon size: 24×24px grid** (Material, IBM); supporting sizes 16/20/32/40/48. Design on a keyline grid so different shapes (circle vs. square vs. tall) look optically equal.
- Icon ≠ touch target: a 24px icon needs padding to reach the **44pt (Apple) / 48dp (Material)** interactive size.
- **Label your icons.** NN/g's rule: only a handful of icons are universally understood (magnifier=search, house=home, cart, play); everything else is ambiguous. The 5-second test: if users can't guess the meaning in ~5 seconds unlabeled, the icon has failed and needs a visible text label (especially in navigation — the hamburger menu's discoverability problems are the canonical case study).
- One family, one style: consistent stroke weight (e.g., all 1.5px or 2px), consistent corner radius, all-outlined or all-filled — mixing filled and outlined icons randomly is a common amateur tell (use the filled variant systematically, e.g., for the active nav state).

---

## 8. Common Mistakes (chapter's "what beginners get wrong" section)

1. **Low-contrast grey text** (#aaa on white) — fails 4.5:1, unreadable in sunlight, ages badly. The most common accessibility failure on the web (WebAIM Million survey repeatedly finds low-contrast text is the #1 detected error, on ~80% of home pages).
2. **Too many fonts/weights/sizes** — >2 typefaces or >4–5 text sizes = visual noise.
3. **Centered body paragraphs** — fine for headlines, painful for reading blocks.
4. **Hierarchy by size alone** — giant H1s and 10px captions instead of weight+color layering.
5. **Even spacing everywhere** — violates proximity; users can't tell which label belongs to which field.
6. **Random spacing values** (13px here, 19px there) — no rhythm; adopt the 8pt scale.
7. **Full-width text lines** on desktop — 150+ characters per line.
8. **Pure black on pure white at max harshness, or its opposite sin, grey-on-grey.**
9. **Color as the only signal** (red/green status dots with no icon/label) — invisible to ~8% of male users.
10. **More than one screaming CTA per screen** — competing accents cancel out.
11. **Unlabeled mystery-meat icons.**
12. **Decorative stock photos** that push real content below the fold.
13. **Designing only light mode** and discovering contrast failures in dark mode later.

---

## 9. Quick-Reference Number Table (for the chapter)

| Thing | Number | Source |
|---|---|---|
| Body text (web) | 16px floor; 18–24px for long-form | Learn UI Design |
| Mobile input font | ≥16px (prevents iOS zoom) | Learn UI Design / iOS behavior |
| Line length | 45–75 chars, ~66 ideal (`max-width: 65ch`) | Bringhurst / Smashing |
| Body line height | 1.4–1.6 (1.5 baseline); headings 1.1–1.3 | WCAG 1.4.12 / practice |
| Type scale ratios | 1.25 (Major Third), 1.333, 1.5 | typescale convention / Material |
| Typefaces per product | 1–2 (3 with monospace) | NN/g / practice |
| Text contrast AA | 4.5:1 normal; 3:1 large (≥24px or ≥18.66px bold) | WCAG 1.4.3 |
| Text contrast AAA | 7:1 normal; 4.5:1 large | WCAG 1.4.6 |
| Non-text/UI contrast | 3:1 | WCAG 1.4.11 |
| Palette proportion | 60% dominant / 30% secondary / 10% accent | NN/g |
| Colors in palette | ≤3 core (+ neutrals + semantic) | NN/g |
| Spacing scale | multiples of 8 (4 half-step): 4,8,12,16,24,32,48,64 | Material / Carbon |
| Touch target | 44pt (Apple), 48dp (Material), 24px legal min (WCAG 2.5.8) | HIG / Material / W3C |
| Grid columns | 12 desktop / 8 tablet / 4 mobile; gutters 16–24px | Material / Bootstrap |
| Content max width | ~1140–1280px container; ~65–75ch for text | Bootstrap / typography canon |
| Icon base size | 24×24px; label if not understood in ~5s | Material / IBM / NN/g |
| Whitespace effect | up to ~20% better comprehension (Lin 2004) | UX literature |
| Color-blindness | ~8% of men, 0.5% of women | vision-science consensus |
| F-pattern | NN/g eyetracking, 45+ users (2006), reconfirmed 2017 incl. mobile | NN/g |

---

## 10. Mini Case Studies / Named Examples

- **Google Material Design**: the fullest public spec of everything above — 8dp grid, 4dp icon keylines, 12/8/4 column grids, type scale roles (Display/Headline/Title/Body/Label), M3 design tokens.
- **Apple HIG**: 44pt touch minimum; SF Pro's optical sizes (Text vs. Display cuts) demonstrate "different fonts for different sizes"; dynamic type as accessibility-driven type scaling.
- **IBM Carbon**: 8px "mini-unit" spacing tokens (`spacing-01…13`), IBM Plex as a bespoke single-family strategy.
- **Stripe**: widely cited by designers as hierarchy done right — near-monochrome UI, one vivid accent (blurple), extreme whitespace discipline, gradient hero as the only expressive element.
- **Tailwind CSS default theme** (from the Refactoring UI authors): the codified version of these notes — 4px-based spacing scale, 50–900 color ramps, constrained font-size scale; arguably the most-used spacing/color system in the world now.
- **China/red case**: e-commerce localization — Western checkout patterns use red for errors/warnings, but Chinese platforms (Taobao/JD) use red as the celebratory primary; same hue, opposite emotional register.
- **NN/g TigersinCrisis eyetracking (47 participants)**: the modern F-pattern replication — the study behind "front-load your first two words."

---

## Sources

- NN/g — Legibility, Readability, and Comprehension: https://www.nngroup.com/articles/legibility-readability-comprehension/
- NN/g — F-Shaped Pattern of Reading on the Web: https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/
- NN/g — Using Color to Enhance Your Design: https://www.nngroup.com/articles/color-enhance-design/
- NN/g — Typography for Glanceable Reading: https://www.nngroup.com/articles/glanceable-fonts/
- NN/g — Why Does a Design Look Good?: https://www.nngroup.com/articles/why-does-design-look-good/
- W3C — Understanding SC 1.4.3 Contrast (Minimum): https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
- WebAIM — Contrast and Color Accessibility: https://webaim.org/articles/contrast/
- WebAIM — Contrast Checker: https://webaim.org/resources/contrastchecker/
- Learn UI Design — Font Size Guidelines for Responsive Websites: https://www.learnui.design/blog/mobile-desktop-website-font-size-guidelines.html
- Smashing Magazine — Balancing Line Length and Font Size: https://www.smashingmagazine.com/2014/09/balancing-line-length-font-size-responsive-web-design/
- Pimp my Type — Ideal Line Length & Line Height: https://pimpmytype.com/line-length-line-height/
- USWDS — Typography component: https://designsystem.digital.gov/components/typography/
- USWDS — Design tokens: https://designsystem.digital.gov/design-tokens/
- Material Design 3 — Design tokens: https://m3.material.io/foundations/design-tokens
- Adobe Spectrum — Responsive grid: https://spectrum.adobe.com/page/responsive-grid/
- Bootstrap — Grid system: https://getbootstrap.com/docs/4.0/layout/grid/
- IBM Design Language — UI icons: https://www.ibm.com/design/language/iconography/ui-icons/usage/
- Hype4 Academy — 60-30-10 Colors in UI Design: https://hype4.academy/articles/design/60-30-10-rule-in-ui
- UX Planet — 8-Point Grid System in UX Design: https://uxplanet.org/everything-you-should-know-about-8-point-grid-system-in-ux-design-b69cb945b18d
- Cieden — Spacing best practices (internal ≤ external rule): https://cieden.com/book/sub-atomic/spacing/spacing-best-practices
- Refactoring UI key points (Wathan & Schoger summaries): https://medium.com/design-bootcamp/top-20-key-points-from-refactoring-ui-by-adam-wathan-steve-schoger-d81042ac9802 and https://www.sglavoie.com/posts/2023/09/09/book-summary-refactoring-ui/
- Nathan Curtis / EightShapes — Naming Tokens in Design Systems: https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676
- UXPin — What Are Design Tokens (2026): https://www.uxpin.com/studio/blog/what-are-design-tokens/
- IxDF — Color Symbolism: https://ixdf.org/literature/topics/color-symbolism
- IxDF — Complementary Colors / Color Harmony: https://ixdf.org/literature/article/complementary-colors-and-color-wheel and https://ixdf.org/literature/topics/color-harmony
- Design Dash — Western vs Eastern Color Psychology: https://designdash.com/design/how-western-and-eastern-color-psychology-differ-what-you-need-to-know-as-a-designer/
- Eriksen — How Color Is Perceived by Different Cultures: https://eriksen.com/marketing/color_culture/
- Loop11 — The Power of White Space in UX Design (Lin 2004 comprehension stat): https://www.loop11.com/the-power-of-white-space-in-ux-design/
- IxDF — Negative Space / Power of White Space: https://ixdf.org/literature/topics/negative-space
- TestParty — WCAG 2.5.8 Target Size guide: https://testparty.ai/blog/wcag-target-size-guide
- LogRocket — All accessible touch target sizes: https://blog.logrocket.com/ux-design/all-accessible-touch-target-sizes/
- ColorPark — Practical Icon Size Guidelines (2026): https://www.colorpark.io/blog/practical-icon-size-guidelines-for-ui-ux-design
- Supercharge Design — Color Harmonies in UI / 20 Common Typography Mistakes: https://supercharge.design/blog/color-harmonies-in-ui-in-depth-guide and https://supercharge.design/blog/20-common-typography-mistakes-in-ui-design
- 99designs — F and Z patterns in landing pages: https://99designs.com/blog/tips/visual-hierarchy-landing-page-designs/
