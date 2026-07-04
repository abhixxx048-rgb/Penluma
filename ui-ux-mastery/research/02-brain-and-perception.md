# Research Notes - Chapter 2: How the Human Brain Processes Design

Research compiled 2026-07-04 from primary/expert sources (Nielsen Norman Group, Laws of UX, published cognitive-psychology studies, WCAG). These notes are the writer's ONLY source for the chapter - everything needed is here.

---

## 1. The big idea: design for the brain you have, not the brain you wish users had

- The human visual/cognitive system is fast, lazy (efficiency-seeking), pattern-hungry, and severely capacity-limited. Users do not read, they scan; they do not memorize, they recognize; they do not see everything, they see what their goals prime them to see.
- NN/g framing: cognitive load is "the amount of mental resources required to operate the system." Human brains have limited processing power that cannot be upgraded - the interface must adapt to the brain, not vice versa (NN/g, "Minimize Cognitive Load").
- Speed of first impressions: Lindgaard, Fernandes, Dudek & Brown (2006, *Behaviour & Information Technology*, 25(2), 115–126) showed people form a reliable judgment of a web page's visual appeal within **50 milliseconds** - ratings at 50 ms correlated highly with ratings at 500 ms and with repeated exposures. Implication: aesthetics are judged before a single word is read, and via the **halo effect** that snap judgment colors later perceptions of credibility and usability.
- How the eye actually gathers information: vision alternates between **fixations** (pauses ~200–300 ms where detail is processed by the fovea) and **saccades** (rapid jumps of ~7–9 letters during reading, during which visual intake is essentially suppressed). Only a small foveal window is sharp at any moment; everything else is low-resolution periphery. Familiar words get shorter fixations than unfamiliar ones. Design consequence: what users "see" is a series of tiny high-res samples stitched together by prediction - layout must make the right things land in those samples.

---

## 2. Gestalt principles: how the brain groups what it sees

Origin: early-20th-century German psychologists (Wertheimer, Koffka, Köhler). Core insight: "the whole is other than the sum of its parts" - the brain automatically organizes visual elements into groups and wholes. NN/g treats these as foundational to UI layout.

### 2.1 Proximity
- **Rule:** Elements close together are perceived as belonging together; elements far apart are perceived as unrelated.
- NN/g calls proximity one of the most powerful grouping cues - it can **overpower competing cues like color or shape similarity**.
- Concrete examples: a form label must sit closer to its own input field than to the neighboring field (classic mistake: label floats ambiguously between two inputs); icon + caption pairs in a toolbar; navigation links grouped by section; a price placed next to the product it belongs to.
- Rule of thumb: **space between groups should be visibly larger than space within groups** (often ~2x). Whitespace is a grouping tool, not "empty" space.
- Common mistake: even spacing everywhere ("grid soup") - the eye gets no grouping information, so users must read everything to figure out relationships.

### 2.2 Similarity
- **Rule:** Elements that share a visual trait (color, shape, size, weight, orientation) are perceived as related and as having the same function.
- Examples: all hyperlinks in one blue → users learn "blue = clickable"; all primary CTAs share one accent color; NN/g's demo where a shared blue color makes people see "rows" even when items are physically arranged in columns.
- Design consequence and mistake: if non-clickable text shares the link style (color/underline), users click it; if clickable things look different from each other, users miss some. Consistency of similarity IS the affordance system of a UI.

### 2.3 Closure
- **Rule:** The brain fills in missing parts to perceive a complete, familiar shape.
- Classic examples: the panda in the WWF logo (incomplete outlines), the NBC peacock (negative space between colored feathers), IBM's logo from horizontal stripes, Picasso line drawings read as complete figures.
- UI applications: a horizontally scrolling carousel deliberately shows a **partially cut-off card** at the screen edge - closure makes users perceive "there's more" and swipe; skeleton loading screens read as a complete page; dashed-border upload zones read as a box.

### 2.4 Continuity (good continuation)
- **Rule:** Elements arranged on a line or curve are perceived as related and the eye follows the smoothest path.
- Examples: items aligned in a row/column read as one list; a progress stepper's connected dots read as one journey; alignment down a shared left edge creates a scanning "rail" for the F-pattern stem.
- Mistake: breaking alignment (slightly offset elements) severs perceived continuity and reads as sloppiness or as "different section."
- Related NN/g finding: **zigzag image–text layouts** (image left/text right, then alternating) make scanning measurably less efficient because they break continuation - users' eyes must hunt for where the next text block starts (NN/g, "Zigzag Image–Text Layouts Make Scanning Less Efficient").

### 2.5 Figure–ground
- **Rule:** The brain instantly separates a scene into a figure (object of focus) and ground (background). The smaller area is usually read as the figure; the larger as the background.
- UI examples: modal dialogs over a dimmed scrim (dimming forces the modal to become "figure"); dropdown shadows lifting menus above the page; hero text over a darkened photo overlay.
- Mistakes: busy background images that fight text for "figure" status; insufficient contrast between card and page background so grouping collapses.

### 2.6 Common region (Palmer, 1992)
- **Rule:** "Items within a boundary are perceived as a group and assumed to share some common characteristic or functionality." Added to the classic Gestalt set by Stephen Palmer's 1992 paper in *Cognitive Psychology* 24(3).
- **Common region is a stronger cue than proximity** - a border can make two adjacent items feel unrelated, or unite two distant ones (NN/g, "The Principle of Common Region").
- Examples: cards (image + title + metadata become one unit), bordered sections in print dialogs (printer / page range / copies), header and footer bars with distinct background color, tabs and accordions, zebra-striped table rows (alternating backgrounds group each row horizontally).
- NN/g guidelines/mistakes: use boundaries **only when whitespace isn't enough**; excessive boxes create clutter and "false floors" (a strong horizontal edge that makes users think the page has ended, so they stop scrolling).

### Other Gestalt-adjacent principles worth a sentence
- **Symmetry and order:** symmetrical arrangements feel stable and are grouped as wholes.
- **Common fate:** elements that move together are grouped (why coordinated animation reads as one component; why a menu that slides in as one block feels unified).
- **Prägnanz (simplicity):** the brain prefers the simplest possible interpretation of a scene - ambiguous layouts get resolved into whatever simple structure the user first perceives, right or wrong.

---

## 3. Preattentive attributes: what the brain notices before "thinking"

- Definition: visual properties processed automatically and in parallel by early visual cortex, in roughly **under 200–250 ms** - before conscious, serial attention engages. Foundational research: Anne Treisman's feature-integration theory; Christopher Healey's perception-in-visualization work (NCSU); Colin Ware's *Information Visualization*.
- Ware's four categories:
  1. **Form** - line length, line width, orientation, size, shape, curvature, enclosure, added marks, blur/focus.
  2. **Color** - hue and intensity/saturation.
  3. **Spatial position** - 2-D location, grouping.
  4. **Motion** - flicker and movement (the strongest attention-grabber of all; evolutionarily wired for threat detection).
- Neural basis (why they're instant): each attribute has dedicated machinery - hue via cone/parvocellular pathways, orientation via orientation-selective V1 cells, size via spatial-scale neurons, location via the retinotopic map. A target that differs on ONE of these dimensions "pops out" regardless of how many distractors surround it.
- **The pop-out effect and its limit:** one red dot among gray dots is found instantly; but a target defined by a *conjunction* of two attributes (the red AND square one among red circles and gray squares) requires slow serial search. Rule of thumb: **encode the one thing that matters with one attribute, and don't make users search on conjunctions.**
- Design applications:
  - A single accent-colored primary button among neutral buttons (also the Von Restorff effect, below).
  - Error states in red + icon so they pop out of a form.
  - Size for importance: the biggest text on the page is read as the most important, full stop.
  - Notification badges (small, saturated, high-contrast circles) exploit color + enclosure.
  - Data viz: use position/length for quantitative comparison (most accurate), hue only for categories, never rainbow ramps for ordered data.
- Common mistakes: using many saturated colors at once (nothing pops if everything pops - "when everything is emphasized, nothing is"); animating decorative elements (motion hijacks attention from the task); relying on subtle attribute differences (light gray vs slightly lighter gray) that never reach preattentive threshold.

---

## 4. Attention: selective, limited, and goal-driven

- **Selective attention:** the brain filters input by relevance to current goals. Users on a task literally do not perceive things outside the task's expected locations and appearance - even large, colorful, or animated things (the famous "invisible gorilla" inattentional-blindness study by Simons & Chabris, 1999, where ~half of viewers counting basketball passes failed to see a person in a gorilla suit walk through the scene).
- **Banner blindness** (NN/g, 1997–2018 research program; "Banner Blindness Revisited: Users Dodge Ads on Mobile and Desktop," 2018):
  - Users ignore anything that **looks like an ad, is near ads, or sits in traditional ad locations** (right rail, top banner) - on both desktop and mobile.
  - It's a **learned behavior**, like looking for the logo top-left or navigation across the top. The filtering is subconscious; users don't know they skipped it.
  - Critical trap: banner blindness hits your OWN content if it's styled like an ad - big colorful boxes, stock photos with overlay text, anything in the right rail. Real case pattern from NN/g: important calls-to-action and even search boxes get missed when they're graphic-heavy or placed in "ad zones."
  - Mitigations: make important content look like content (plain text, integrated into layout), keep critical actions in expected functional positions, avoid ad-like styling for promos of your own features.
- **Attention economics rule of thumb:** every element on the screen is bidding for a fixed attention budget; adding anything dilutes everything else. Deleting is a design tool.

---

## 5. Visual scanning patterns (NN/g eye-tracking research)

Source articles: "F-Shaped Pattern of Reading on the Web: Misunderstood, But Still Relevant (Even on Mobile)" (Pernice, 2017), original 2006 F-pattern study (Nielsen), "Text Scanning Patterns: Eyetracking Evidence," "The Layer-Cake Pattern of Scanning Content on the Web."

### F-pattern
- Discovered in NN/g's 2006 eyetracking of 232 users / re-confirmed in later studies (2006 aggregate: 45+ people; 2017 study: 47 participants). Users scan text-heavy pages as: a full horizontal sweep across the top lines, a second shorter horizontal sweep lower down, then a vertical scan down the left edge. First lines and first words on a line get far more fixations than later ones.
- Holds on **desktop and mobile**, and **mirrors** in right-to-left languages (Arabic, Hebrew).
- The F-pattern is a **failure mode, not a goal**: it appears when (1) text is a wall with no formatting, (2) the user wants efficiency, (3) motivation is low. Users scanning in an F **miss big chunks of content without knowing it**.
- Countermeasures: front-load the first two paragraphs with the key message; start headings/paragraphs/bullets with information-carrying words; bold key phrases; use bullets; cut words.

### Layer-cake pattern
- Fixations land on **headings and subheadings**, skipping body text between them, until the user finds the relevant heading and then reads the body under it. Heatmap looks like horizontal stripes (cake layers).
- NN/g verdict: aside from reading everything, the **layer-cake is the most efficient scanning pattern** - unlike the F-pattern it lets users find the relevant part reliably. Design FOR it: descriptive (not clever) subheadings, visually distinct from body text, one idea per section.

### Z-pattern
- On **visually simple, low-text pages** (landing pages, hero-driven marketing pages), eyes travel: top-left → top-right (logo, nav, headline), diagonal down to bottom-left, then across to bottom-right - where the CTA belongs.
- Note: the Z-pattern is a designer's layout convention more than an NN/g eyetracking finding; NN/g's actual data emphasizes F/layer-cake/spotted for text and warns that zigzag image–text layouts hurt scanning efficiency. Use Z-thinking only for sparse, single-goal pages; dense text triggers F-behavior regardless.

### Other patterns NN/g documented
- **Spotted:** eyes jump around hunting for a specific cue (a number, a link, a name) - supports making key facts visually distinct (numerals, bold).
- **Marking:** eyes stay fixed while the page scrolls under them (common on mobile).
- **Bypassing:** users skip the repeated first words when many lines start identically (mistake: starting every bullet with the same phrase).
- **Commitment pattern:** motivated users read nearly everything - motivation changes behavior more than layout does.

### How little users read - the numbers
- Nielsen (2008, "How Little Do Users Read?"), based on instrumented browsing of 25 users' real web use (Weinreich et al. data): on an average visit users read **at most 28% of the words; 20% is more likely**. Average page had 593 words. Users allocate roughly 4.4 seconds per additional 100 words.
- Nielsen (1997, "How Users Read on the Web"): **79% of test users scanned any new page; only 16% read word-by-word**.

---

## 6. Memory limits: working memory, chunking, recognition

### Miller's 7±2 and the modern correction
- George A. Miller (1956, *Psychological Review*, "The Magical Number Seven, Plus or Minus Two"): working memory holds about **7 ± 2 chunks**.
- Modern revision: Nelson Cowan (2001, *Behavioral and Brain Sciences*) showed that with rehearsal and chunking strategies controlled, true capacity is **~4 chunks (3–5)** in young adults. Design guidance increasingly uses 4, not 7.
- **Chunking** is the escape hatch: grouping units into meaningful wholes makes each group one "chunk." Examples: phone numbers as 3-3-4 (555-867-5309), credit-card fields grouped in 4s, chess masters who see configurations rather than 32 pieces. Chunk sizes should be meaningful, not arbitrary.
- **Correct application (per Laws of UX and Stéphanie Walter, "Your menu doesn't need Miller's 7±2 rule"):** Miller's law is about items users must HOLD IN MEMORY, not items visible on screen. A navigation menu is a recognition task - users don't memorize it - so "max 7 menu items" is a misreading. The real guideline: chunk and group long menus/lists so users scan groups, not individual items. Do apply memory limits to: multi-step flows where info from step 1 is needed at step 4, verification codes, instructions, comparison tasks across pages.
- **Serial-position effect** (Ebbinghaus): first items (primacy) and last items (recency) in a sequence are remembered best; the middle is lost. Application: put the most important nav items first and last; end flows on the message you want remembered.
- **Von Restorff (isolation) effect** (Hedwig von Restorff, 1933): the one item that differs visually from its peers is the one remembered. Application: make exactly one primary CTA visually distinct per screen; highlight the recommended pricing tier. Mistake: isolating several things at once cancels the effect.

### Recognition over recall (Nielsen's Heuristic #6)
- Statement: "Minimize the user's memory load by making elements, actions, and options visible. The user should not have to remember information from one part of the interface to another." (NN/g, 10 Usability Heuristics.)
- Psychology behind it: recognition works because the interface itself provides the retrieval cue (Tulving & Thomson's encoding-specificity work, 1973); recall forces the brain to generate its own cues - far harder. Everyday proof: "Is Lisbon the capital of Portugal?" (easy) vs "What is the capital of Portugal?" (harder).
- Why the GUI beat the command line: menus let users recognize commands instead of recalling syntax.
- Applications: visible menus over memorized shortcuts; search autocomplete and recent-search suggestions; showing previously entered data instead of asking again; date pickers over blank date fields; persistent context (cart contents, current step, applied filters) always visible; familiar icons paired with labels.
- Common mistakes: making users remember a code shown on the previous screen; hiding critical options behind unlabeled icons or deep menus; wizard steps that quiz users on earlier choices.

---

## 7. Cognitive load theory: intrinsic, extraneous, germane

- Origin: John Sweller (1988, instructional psychology). The three loads are **additive** and together must fit within working-memory capacity.
  - **Intrinsic load** - the inherent complexity of the task/content itself (element interactivity). Booking a multi-city flight is intrinsically harder than checking the weather. Can't be removed, but can be sequenced/chunked.
  - **Extraneous load** - effort wasted on HOW information is presented: clutter, inconsistent styles, poor hierarchy, low contrast, decorative noise, unfamiliar patterns. **This is the designer's enemy and is almost entirely under the designer's control.**
  - **Germane load** - desirable effort spent building understanding/mental models (schema formation). Good design ELIMINATES extraneous load so capacity is available for germane processing.
- NN/g's three practical strategies ("Minimize Cognitive Load"):
  1. **Avoid visual clutter** - remove redundant links, irrelevant images, meaningless typography variation.
  2. **Build on existing mental models** - use labels, layouts, and patterns familiar from the rest of the web (this is also Jakob's Law: users spend most of their time on OTHER sites, so they expect yours to work the same way).
  3. **Offload work from the user** - show don't tell (visuals over text), re-display previously entered info, compute things for users, smart defaults.
- Additional proven reducers:
  - **Progressive disclosure** - show only what's needed now; reveal advanced options on demand.
  - **Chunking content** - short sections, one idea each, descriptive headings (supports layer-cake scanning).
  - **Consistency** - every inconsistency (a button that looks different, a pattern that behaves differently) is a micro-lesson the user is forced to learn.
  - **Fewer choices** - Hick's Law: decision time grows logarithmically with the number and complexity of options; trim and group choices, especially for novice/hurried users.
- Symptom checklist of overload: users abandon forms, re-read the same area, hesitate before clicking, ask "where do I…?", err on tasks they've done before.

---

## 8. How the brain processes color, spacing, and typography

### Color
- Mechanics: rods handle luminance/low light; three cone types give trichromatic color. Cone distribution ≈ **60% red-sensitive (L), 30% green (M), <10% blue (S)** - one reason small blue text on dark backgrounds strains, and why luminance contrast (not hue contrast) carries legibility.
- Color blindness: **~8% of men and ~0.5% of women** have color-vision deficiency, mostly red-green (protanopia/deuteranopia). WCAG 2.2 SC **1.4.1 "Use of Color"**: color must never be the ONLY carrier of meaning - pair it with icons, labels, patterns, or position (error = red + icon + message, not red alone). Common violation: green/red status dots with no other cue; links distinguished from text by color only.
- Contrast: WCAG requires **4.5:1** contrast ratio for normal body text (3:1 for large text) at level AA - this is a perception fact as much as a compliance rule: contrast sensitivity drives reading speed.
- Attention/meaning: saturated warm colors advance and grab attention preattentively; desaturated cool colors recede - the basis of "one accent color for the one primary action." Cultural color meanings vary, but within a product, consistency of color-to-meaning mapping matters more than the specific hue.

### Spacing / whitespace
- Whitespace is information: it encodes grouping (proximity) and hierarchy, gives the eye resting points, and lowers extraneous load.
- The famous claim "whitespace increases comprehension by ~20%" traces to Lin (2004), a small study of 24 older adults (62–80) - directionally useful, weak as a universal statistic; cite cautiously as "studies suggest meaningful comprehension gains," not a hard 20% (see Carl Myhill's critique of secondary referencing).
- Practical rules of thumb: line height ≈ **1.5× font size** for body text; line length ≈ **45–75 characters** (~66 ideal; ~60 max is a common stricter preference) - longer lines make the return-sweep saccade error-prone, shorter lines break too often; paragraph spacing > line spacing; margins/gutters big enough that groups read as groups.

### Typography
- Reading mechanics: eyes saccade ~7–9 letters at a time; word recognition uses letter features and word envelope in parallel. **All-caps body text slows reading** (uniform rectangular word shapes, unfamiliar reading mode) - reserve caps for short labels/headers.
- Legibility drivers: adequate size (16px+ body on web is the modern default), x-height, letter spacing, weight contrast, and above all luminance contrast with the background.
- Hierarchy: the brain assigns importance by size, weight, and contrast before reading a word - a page should communicate its structure in a blurred "squint test." Use consistent type scale layers (display → title → subhead → body → caption); vary no more than a few faces/weights, since every unexplained style variation is extraneous load (NN/g explicitly names "different font styles that don't convey unique meaning" as extraneous load).
- Pattern recognition generally: the brain is a prediction machine - it recognizes learned interface schemas (logo top-left, nav top, search top-right, primary button bottom-right in dialogs). Violating schema costs attention and errors; innovate on the content, not on where the door handle goes.

---

## 9. Expert rules of thumb (chapter-ready list)

1. You have ~50 ms before users have judged your page - visual polish is not cosmetic (Lindgaard 2006).
2. Assume users will read ~20% of your words (Nielsen 2008); write and format for scanning: front-loaded headings, bullets, bold keywords.
3. Design for the layer-cake, defend against the F-pattern: descriptive subheadings every few paragraphs.
4. Space between groups ≥ ~2× space within groups; try whitespace before borders, borders before background fills (lightest sufficient cue wins).
5. One pop-out per screen: a single preattentive difference (one accent color, one biggest element) directs attention; multiple pop-outs cancel out.
6. Never encode meaning in color alone (WCAG 1.4.1); keep body-text contrast ≥ 4.5:1.
7. Budget working memory at ~4 chunks, not 7; never make users carry information between screens - re-display it.
8. Recognition over recall: visible options, autocomplete, defaults, pickers.
9. Kill extraneous load first: clutter, inconsistency, novelty for its own sake; save users' capacity for the intrinsically hard part of their task.
10. Don't make content look like an ad, and don't put critical content where ads live (banner blindness).
11. Motion is the strongest attention magnet - use it only for what genuinely needs attention.
12. Follow platform/web conventions (Jakob's Law): users' mental models were trained elsewhere.

## 10. Common mistakes (anti-pattern list)

- Labels equidistant between two form fields (proximity ambiguity).
- Non-clickable elements styled like links/buttons, and vice versa (similarity misuse).
- Even spacing everywhere → no visual grouping.
- Wall-of-text pages with clever, non-descriptive headings → F-pattern content loss.
- Every bullet/paragraph starting with the same words → bypassing pattern skips them.
- Multiple saturated accent colors competing → no pop-out, high extraneous load.
- Promos/CTAs styled like banners or placed in right rail → invisible via banner blindness.
- Strong horizontal rules or boxed sections creating "false floors" that stop scrolling.
- Asking users to remember codes, names, or earlier choices across steps (recall demand).
- "Max 7 menu items" cargo-culting - the fix for long menus is grouping, not truncation.
- All-caps paragraphs; sub-16px body text; sub-4.5:1 contrast; color-only status indicators.
- Citing the "20% whitespace comprehension" study as gospel (small elderly-only sample).

---

## Sources

- NN/g - F-Shaped Pattern of Reading (2017 update): https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/
- NN/g - Original F-pattern study (2006): https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content-discovered/
- NN/g - Layer-Cake Pattern of Scanning: https://www.nngroup.com/articles/layer-cake-pattern-scanning/
- NN/g - Text Scanning Patterns: Eyetracking Evidence: https://www.nngroup.com/articles/text-scanning-patterns-eyetracking/
- NN/g - How Little Do Users Read?: https://www.nngroup.com/articles/how-little-do-users-read/
- NN/g - How Users Read on the Web (1997): https://www.nngroup.com/articles/how-users-read-on-the-web/
- NN/g - Banner Blindness Revisited (2018): https://www.nngroup.com/articles/banner-blindness-old-and-new-findings/
- NN/g - The Principle of Common Region: https://www.nngroup.com/articles/common-region/
- NN/g - Proximity Principle in Visual Design: https://www.nngroup.com/articles/gestalt-proximity/
- NN/g - 5 Principles of Visual Design in UX: https://www.nngroup.com/articles/principles-visual-design/
- NN/g - Minimize Cognitive Load: https://www.nngroup.com/articles/minimize-cognitive-load/
- NN/g - Memory Recognition and Recall in User Interfaces: https://www.nngroup.com/articles/recognition-and-recall/
- NN/g - 10 Usability Heuristics: https://www.nngroup.com/articles/ten-usability-heuristics/
- NN/g - Zigzag Image–Text Layouts: https://www.nngroup.com/articles/zigzag-page-layout/
- Interaction Design Foundation - Gestalt Principles: https://ixdf.org/literature/topics/gestalt-principles
- Laws of UX - Miller's Law: https://lawsofux.com/millers-law/
- Laws of UX - Cognitive Load: https://lawsofux.com/cognitive-load/
- Laws of UX - Von Restorff Effect: https://lawsofux.com/von-restorff-effect/
- Stéphanie Walter - Your menu doesn't need Miller's 7±2 rule: https://stephaniewalter.design/blog/your-menu-doesnt-need-millers-7-plus-minus-2-rule/
- Healey (NCSU) - Perception in Visualization (preattentive processing): https://www.csc2.ncsu.edu/faculty/healey/PP/
- UX Collective - Preattentive attributes and data visualizations (Posternak): https://uxdesign.cc/preattentive-attributes-of-visual-perception-and-their-application-to-data-visualizations-7b0fb50e1375
- Lindgaard et al. (2006) - 50 ms first impressions: https://www.researchgate.net/publication/220208334_Attention_web_designers_You_have_50_milliseconds_to_make_a_good_first_impression_Behaviour_and_Information_Technology_252_115-126
- The Decision Lab - Recognition rather than Recall: https://thedecisionlab.com/reference-guide/design/recognition-rather-than-recall
- Smashing Magazine - F-Shape Pattern And How Users Read: https://www.smashingmagazine.com/2024/04/f-shape-pattern-how-users-read/
- Smashing Magazine - Improving Color Accessibility for Color-Blind Users: https://www.smashingmagazine.com/2016/06/improving-color-accessibility-for-color-blind-users/
- WCAG 2.2 - SC 1.4.1 Use of Color / SC 1.4.3 Contrast: https://www.w3.org/TR/WCAG22/
- Carl Myhill - critique of the Lin (2004) 20% whitespace claim: https://www.linkedin.com/pulse/lin-2004-did-discover-margins-white-space-increase-20-carl-myhill
- UX Planet - Z-Shaped Pattern for Reading Web Content (Babich): https://uxplanet.org/z-shaped-pattern-for-reading-web-content-ce1135f92f1c
