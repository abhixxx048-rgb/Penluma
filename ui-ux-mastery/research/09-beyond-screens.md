# UI/UX Beyond Screens: Presentations, Documents, Marketing, Video, Packaging

> Research notes for Chapter 9. THESIS: the same five design principles — **hierarchy, contrast, cognitive load management, feedback, and consistency** — that govern great software interfaces also govern great slides, documents, ads, thumbnails, packaging, and physical spaces. A "user" is anyone whose attention and comprehension you are designing for. The medium changes; the human perceptual system does not. Gestalt grouping, the fusiform face area, working-memory limits, and the picture-superiority effect operate identically whether the "screen" is a MacBook display, a conference-room projector, a supermarket shelf, or an airport corridor.

---

## 0. The Unifying Frame (state this explicitly in the chapter)

Every artifact in this chapter is a **communication interface**. The designer's job is always the same: guide a human eye/brain through information with the least friction. The recurring toolkit:

- **Hierarchy** — decide what the viewer sees 1st, 2nd, 3rd. One dominant element per view. (Slide's assertion headline, an email's primary CTA, a thumbnail's face, a package's logo, a report's executive summary.)
- **Contrast** — size, color, weight, and space separate signal from noise and create the focal point. Figure-ground separation is the same problem on a slide, a shelf, and a login screen.
- **Cognitive load** — working memory holds only a few chunks. "One idea per slide," "6×6 rule," single-column email, 3-element thumbnail, chunked reports — all are load-limiting devices.
- **Feedback** — the medium should confirm the user's action/progress: a package that "clicks" open, a video hook that rewards the first-second click, a door that visibly reveals whether to push or pull.
- **Consistency** — repetition of type, color, and layout builds a system the brain learns once and reuses (brand kits, slide masters, email templates, packaging families).

Gestalt principles (proximity, similarity, figure-ground, closure, continuity) are the *mechanism* behind visual hierarchy in **all** media — "the perceptual grouping rules don't change with the medium. A poster and a mobile app both rely on the same underlying visual perception principles." (Eleken; Toptal). Use this as the connective tissue between every section.

---

## 1. Presentations & Slides

### The core problem: slides are a "glance medium"
Garr Reynolds: "Presentations are a 'glance media' — more closely related to billboards than other media." Design for **three-second comprehension** (the billboard principle). A slide that needs study has already failed.

### One idea per slide
Nancy Duarte (*slide:ology*, 2008): the single most repeated rule is **one idea per slide**. Common traps she names: overusing bullet points, cramming multiple ideas onto one slide, and using too many colors, shapes, and fonts. Design should be **simple, not decorated**. Duarte frames slide-making as *design, not decoration* — a real presentation deck warrants **36–90 hours** of work. Her five ideas: treat the audience as king; spread ideas and move people; help them see what you're saying (think like a designer); practice design not decoration; cultivate a healthy relationship between you, your slides, and the audience. Duarte's firm created the deck behind Al Gore's *An Inconvenient Truth*.

### Assertion–Evidence structure (research-backed)
Developed by **Michael Alley** (Penn State) in the 1980s from cognitive-learning research. Structure of each slide:
- **Assertion**: a full-sentence *headline* stating the slide's single main message (max ~2 lines), NOT a topic phrase like "Results."
- **Evidence**: visual support — photo, chart, diagram, or short video — instead of bullet lists.

**Study result:** Audiences shown assertion-evidence slides *understood and remembered* the technical content significantly better than audiences shown traditional bulleted slides — same spoken words, different slides. The difference was **statistically significant (p < .01)** (Alley, Garner, Neeley et al.; published in *Technical Communication* and the *International Journal of Engineering Education*). This is the empirical backbone: **visual evidence + a claim beats a bullet list**, and it maps directly to the "picture superiority effect."

### Garr Reynolds — *Presentation Zen* principles
- **Signal-to-Noise Ratio (SNR):** ratio of relevant to irrelevant info. Rule: "Every element should be expressed to the extent necessary, but not beyond." If removing an element doesn't change the meaning, remove it. Concrete moves: kill footers, logos, decorative clip-art; lighten/thin table gridlines; delete chart junk.
- **White space (empty space):** don't fill it. Abundant empty space increases impact and clarity.
- **Contrast:** create ONE clearly dominant element; avoid equal-weight designs. Achieve via space, color (cool bg / warm fg), typeface, and position.
- **Picture Superiority Effect:** pictures are remembered better than words, *especially when exposure is brief and recall is measured after >30 seconds*. Use full-bleed images; make one big image, not many small ones. Words + pictures should reinforce the *same* message.
- **Charts:** Restrain, Reduce, Emphasize. Replace generic titles with **declarative statements** ("Cases decreased 17%" not "Reported cases 2021") — same idea as assertion-evidence.
- **Animation:** ≤2–3 transition types across the whole deck; avoid animating bullets on every slide.
- **Segmenting:** break one dense slide into 2–3 simpler ones.

### Rules-of-thumb (name them; note they're heuristics not laws)
- **Guy Kawasaki 10-20-30:** 10 slides, 20 minutes, no font smaller than 30pt. Rationale: "a normal human being cannot comprehend more than 10 concepts in a meeting" (cognitive load), and a 30pt floor *forces* less text.
- **6×6 rule:** max 6 bullets per slide, max 6 words per bullet (a load-limiter; assertion-evidence advocates would go further and kill bullets entirely).
- **Slidedocs vs slides (Duarte):** if a deck must be read without a speaker, make a **slidedoc** (a visual document) — don't create a "slideument" that fails as both.

### Common mistakes
Wall-of-text slides read aloud verbatim; topic-phrase headlines; ≥4 fonts/colors; tiny fonts; reading to the audience; decorative transitions; using slides as the speaker's notes.

---

## 2. Documents & Reports

### People scan, they don't read
Nielsen Norman Group (Jakob Nielsen), landmark **1997 study**: **79% of users scan** new pages; only 16% read word-by-word. The **average page visit lasts <1 minute**, and users read only about **20–28% of the words** on a page (Nielsen's later modeling puts realistic reading at ~28% max, often ~20%).

### The F-pattern
NN/g eye-tracking discovered the **F-shaped reading pattern**: users read the top horizontally, then a shorter horizontal sweep lower, then scan down the left edge — forming an "F." Implication: **front-load meaning** into headings, first sentences, and the left side. Also relevant: the **Z-pattern** for sparse/visual layouts. Design consequence: put keywords first, use meaningful subheads, bullet real lists, bold key phrases.

### Barbara Minto — The Pyramid Principle (BLUF: bottom line up front)
Barbara Minto — Harvard Business School's **first female MBA (1963)**, McKinsey's first female consultant — codified the **Pyramid Principle** (firm founded 1973). Structure ideas as a pyramid under a **single governing thought**:
- **Answer/recommendation at the top FIRST** (the opposite of academic build-up).
- Support with **2–4 grouped arguments** (MECE: mutually exclusive, collectively exhaustive).
- Detailed evidence/data at the base.

**SCQA** intro framework to set up the pyramid:
- **Situation** — uncontroversial facts the reader already accepts (baseline, no objection).
- **Complication** — what changed / the problem / the tension.
- **Question** — the question that naturally arises.
- **Answer** — your recommendation = apex of the pyramid.

This is the document-world equivalent of visual hierarchy: the *conclusion* is the dominant element, placed first, with supporting detail subordinated below.

### Report scannability toolkit
- **Executive summary** = the report's "above the fold": the whole argument in a paragraph for readers who read nothing else.
- **Descriptive headings & subheads** every few paragraphs (waypoints for F-pattern scanners).
- **Tables** for comparison data; keep gridlines light (SNR), align numbers right, one idea per column.
- **Bulleted/numbered lists**, **bold** for keywords, short paragraphs, generous margins/white space.
- **Chunking** — break long text into labeled sections (segmenting principle again).

---

## 3. Marketing Creatives & Social Media

### The 1-second thumb-stop
On a feed, the first job is to **stop the thumb in ~1 second**. Same principle as the billboard slide and the shelf-impact package: instantaneous figure-ground contrast and one dominant focal point win the glance.

### Hook–Value–CTA structure
Effective posts follow **Hook → Value → CTA**:
- **Hook** (first line / first frame) — pattern interrupt, curiosity gap, bold claim, or emotional face; earns the next 2 seconds.
- **Value** — the payoff/substance that justifies attention.
- **CTA** — one clear next action (follow, save, click, buy). One primary CTA, like an email or a slide's single dominant element.

### Platform image sizes (2025–2026) — get these right or the crop kills the hierarchy
- **Instagram feed:** square **1080×1080** (1:1); portrait **1080×1350** (4:5); landscape 1080×566 (16:9). As of **Jan 2025**, Instagram moved to a **3:4 "tall grid"** — safest uploads are vertical **1080×1350 or 1080×1440**.
- **Stories / Reels / TikTok:** full-screen vertical **1080×1920** (9:16).
- **Trend:** vertical, mobile-first ratios (4:5, 9:16) now **outperform square** on most networks because they occupy more screen real estate. Always design to **1080px wide minimum**.
- (Cross-reference Buffer/Hootsuite/Sprout Social cheat-sheets for a full per-network table.)

### Design principles carry straight over
Hierarchy (one dominant message), contrast (thumb-stop against a busy feed), cognitive load (one idea per creative), consistency (brand template/kit so a follower recognizes you mid-scroll). Text on creatives must be legible at **mobile thumbnail size** — the same "back of the room" legibility test Reynolds applies to slides.

### Common mistakes
Too many messages per creative; low contrast that blends into the feed; tiny/illegible text; wrong aspect ratio (auto-crop decapitates the subject); no clear CTA; inconsistent branding.

---

## 4. Video & Thumbnails (YouTube)

### Thumbnail research — the click is a UX decision
- **Faces + emotion:** thumbnails with human faces outperform object-only by **~25–30%** (A/B testing). The brain's **fusiform face area (FFA)** processes faces faster than almost any other input. Emotional expressions lift CTR **up to 30%** (VidIQ); **surprise, excitement, curiosity** perform best (emotional mirroring).
- **Contrast:** a 2023 Vidooly study found high-contrast/contrasting-color thumbnails get **~30% higher CTR**. Figure-ground again.
- **Text (the 3-element rule):** add **1–3 words** max; beyond ~4 words CTR *drops* because text becomes unreadable at mobile size. Keep to roughly **three visual elements** (e.g., face + object + 1–3 words) so the thumbnail reads in a glance.
- **Curiosity gap:** the thumbnail should open an information gap the video closes — the psychological driver of the click.
- **Before/after:** for educational/how-to content, "before → after" thumbnails get **~35% higher CTR** than showing only the finished result.

### Retention, hooks, pacing (2025 data)
- **First 15 seconds are decisive.** Videos with a clear value proposition in the first 15s see **~18% higher retention at the 1-minute mark**.
- A **steep drop in the first 15–30s then a flat line** = the hook failed; you lost most viewers before the substance.
- **Below 50% retention** signals a structural hook/pacing problem. Holding **70%+ in the first 30s** is strong and correlates with algorithmic pickup.
- **Slow intros cost casual viewers:** casual audiences drop **~60% in the first 30s** with slow intros vs **~35%** for dedicated learners.
- **Match pacing to intent:** entertainment audiences respond to varied pace + surprise; learners respond to timestamps + clear structure (+~15% completion). In ~35% of analyzed videos, pace/style conflicting with audience intent caused steep mid-video drop-offs.

**Principle mapping:** the thumbnail is the *hierarchy/contrast* problem (win the glance); the hook is the *feedback* problem (immediately reward the click so the viewer's "was this worth it?" question gets a yes); pacing is *cognitive load* management over time.

---

## 5. Physical Products & Packaging

### Shelf impact = the retail thumb-stop
On a crowded shelf a package has ~1 second to win the glance — identical to the feed and the billboard slide. Apple's answer is **radical minimalism**: no extra words, no bright colors, no busy graphics; clean lines mirror the device inside. Customers associate the visual simplicity with **reliability and elegance** — consistency between package and product builds trust.

### The unboxing experience (Apple as canonical case)
- Steve Jobs & Jony Ive treated packaging as **"theater"** and designed a **"ritual of unpacking"** to make the product feel special — investing **thousands of hours** per box. Apple reportedly maintains a dedicated packaging room for this.
- **Designed slowness:** the iPhone lid descends slowly (a precisely engineered air-cushion friction fit) to **build anticipation** — a deliberate *pacing* choice, like a video's reveal.
- **Multi-sensory / synesthesia:** humans respond positively to experiences that engage multiple senses (weight, friction, sound, texture) — packaging as feedback.
- **Curiosity gap:** the box stages the reveal to close the information gap between "what I bought" and "what I now hold."
- **Endowment effect:** high-quality packaging raises the perceived value of what you now own and feels worth keeping — which also drives free **unboxing marketing** (millions of YouTube unboxing views).
- **Materials/sustainability:** molded fiber/pulp trays secure the device and signal premium-yet-responsible values.

### Affordances & signifiers in physical objects — Norman doors revisited
Don Norman, *The Design of Everyday Things*:
- **Affordance** = a possible interaction an object offers (a flat plate *affords* pushing; a vertical bar *affords* pulling/grabbing).
- **Signifier** = a design property that *announces* where/how to act (arrow, label, handle shape). Norman coined "signifier" because designers were misusing "affordance."
- **The Norman Door:** a door whose signifiers contradict its mechanism — a pull handle on a door you must push, "solved" by slapping a **PUSH sign** on it. **The need for an instructional sign is itself proof of bad design:** "you shouldn't need a sign on a door" if affordances and signifiers are used well.
- **Mapping / feedback / conspicuity** — Norman's other everyday-things principles (natural mapping of stove-knob to burner, immediate feedback) apply to remotes, faucets, and appliances exactly as to UI.

### Wayfinding & signage
Signifiers "communicate where the action should take place" — a doorway, a stop sign, an Uber sticker; they can also be auditory (phone ring, notification ding, a bell). Good wayfinding (airports, hospitals, transit) applies the same hierarchy/contrast/consistency: a clear visual hierarchy of signs, high figure-ground contrast, consistent iconography and color-coding, and progressive disclosure of information along the route so users are never overloaded. When people get lost, it is usually a hierarchy/contrast/consistency failure — the physical analog of a confusing navigation menu.

---

## 6. Email Design

Email is a constrained, mobile-first interface — a mini-landing-page in the inbox.
- **Single-column layout:** reinforces hierarchy and scannability, and survives small screens (multi-column feels cramped and breaks on mobile). It's the email analog of "one idea per slide."
- **Visual hierarchy:** **one primary CTA** drives the main objective; secondary CTAs are visually subordinated via size/color — same "one dominant element" rule.
- **Preheader text:** the preview snippet supports the subject line; ideal length **~30–55 characters**. (Note: AI inbox summaries can override preview text, so front-load the core message.)
- **Tap targets:** buttons at least **44×44 px** (fingers are bigger than cursors — Apple HIG's touch-target minimum). Place primary CTA in **thumb-reach zones** (middle/lower half on mobile) and put the key message/CTA **near the top**.
- **White space & scannability:** reduce clutter; make it skimmable in the F-pattern.
- **Accessibility:** sufficient text/background contrast, real text over text-in-images, logical reading order — the same WCAG concerns as any UI.

---

## 7. Cross-Media Principle Matrix (use as a table/summary in the chapter)

| Principle | Slides | Documents | Social/Marketing | Video/Thumbnail | Packaging/Physical | Email |
|---|---|---|---|---|---|---|
| **Hierarchy** | One assertion headline per slide | BLUF / Minto pyramid, exec summary | One dominant message | Face + 1–3 words; hook first | Logo/brand dominant on shelf | One primary CTA |
| **Contrast** | One dominant element; SNR | Bold keywords, light gridlines | Thumb-stop vs busy feed | High-contrast thumbnail (+30% CTR) | Minimalist figure-ground | Button color pops |
| **Cognitive load** | 6×6, 10-20-30, chunking | Scanning, chunked sections | One idea per creative | Pacing; 3-element rule | Simple, few elements | Single column |
| **Feedback** | — (speaker reveals) | — | CTA response | Hook rewards the click | Box clicks/reveals; unboxing | Confirmation, clear CTA |
| **Consistency** | Slide master, ≤2–3 fonts | Heading styles | Brand kit / template | Channel branding | Packaging family, brand-device match | Email template |

---

## 8. Common Mistakes (cross-media quick list)
- Treating the artifact as storage (dumping everything) instead of communication (guiding attention).
- No single focal point / equal-weight layouts.
- Low contrast → the message drowns in noise.
- Too many fonts, colors, ideas (cognitive overload).
- Illegibility at real viewing size/distance (back-of-room, mobile crop, shelf glance).
- Requiring an instruction ("PUSH" sign, "swipe up," "read the manual") to fix a design that should be self-evident.
- Slow/weak hooks (video, email subject, slide opener) that never earn the next second.
- Inconsistency that forces the brain to re-learn the system each time.

---

## 9. Expert Rules of Thumb (name-drop bank)
- **One idea per slide** (Duarte). **Design, not decoration** — 36–90 hrs/deck.
- **Assertion–Evidence** (Alley): sentence headline + visual; +comprehension, p<.01.
- **Signal-to-Noise Ratio** & **picture superiority** (Reynolds): remove anything removable; images beat words after 30s.
- **10-20-30** (Kawasaki); **6×6 rule**; **billboard/3-second test**.
- **79% scan / <1 min / ~20–28% read** (Nielsen). **F-pattern** (NN/g).
- **Pyramid Principle + SCQA, BLUF** (Minto): answer first, 2–4 MECE groups.
- **Faces +25–30%, emotion up to +30%, contrast +30%, before/after +35%, 1–3 words** (thumbnail research).
- **First 15s → +18% retention; 70%+ at 30s = strong** (2025 retention data).
- **44×44px tap target** (Apple HIG); **1080×1350 / 9:16** (2025 social sizes).
- **Norman door**: needing a sign = design failure; **affordance vs signifier**.
- **Apple unboxing**: theater, designed slowness, endowment effect, synesthesia.

---

## Sources

**Presentations**
- Duarte, *slide:ology*: https://www.duarte.com/resources/books/slideology/ ; summary https://medium.com/@brijsethi/slide-ology-nancy-duarte-book-summary-835a3144a1c8 ; Slidedocs ebook https://1619981.fs1.hubspotusercontent-na1.net/hubfs/1619981/Duarte_Slidedocs_Ebook.pdf
- Assertion-Evidence (Michael Alley, Penn State): https://writing.engr.psu.edu/research.html ; ASEE study PDF https://peer.asee.org/assertion-evidence-slides-appear-to-lead-to-better-comprehension-and-recall-of-more-complex-concepts.pdf ; ResearchGate https://www.researchgate.net/publication/286042632 ; instruction set https://cpb-us-e1.wpmucdn.com/sites.psu.edu/dist/7/13153/files/2008/10/Assertion-Evidence-Slides-Instruction_Set.pdf
- Garr Reynolds design tips: https://www.garrreynolds.com/design-tips ; Presentation Zen SNR activity https://presentationzen.com/blog/the-signal-to-noise-ratio-activity
- Guy Kawasaki 10-20-30: https://guykawasaki.com/the_102030_rule/ ; SixMinutes https://sixminutes.dlugan.com/10-20-30-rule-guy-kawasaki-powerpoint/

**Documents**
- NN/g "How People Read Online: The Eyetracking Evidence": https://www.nngroup.com/reports/how-people-read-web-eyetracking-evidence/
- F-pattern & scanning (NN/g coverage): https://www.codecademy.com/article/how-users-scan ; https://www.acquia.com/blog/content-reading-patterns
- Minto Pyramid Principle & SCQA: https://www.barbaraminto.com/ ; https://strategyu.co/pyramid-principle-partone/ ; https://modelthinkers.com/mental-model/minto-pyramid-scqa ; Monash guide https://www.monash.edu/student-academic-success/excel-at-writing/how-to-write/business-paper-using-the-minto-approach

**Marketing / Social sizes**
- Buffer social image sizes 2026: https://buffer.com/resources/social-media-image-sizes/ ; Instagram sizes https://buffer.com/resources/instagram-image-size/
- Hootsuite July 2026 sizes: https://blog.hootsuite.com/social-media-image-sizes-guide/ ; Sprout Social https://sproutsocial.com/insights/social-media-image-sizes-guide/

**Video / Thumbnails**
- VidIQ thumbnail CTR: https://vidiq.com/blog/post/youtube-custom-thumbnails-ctr/ ; https://vidiq.com/blog/post/youtube-thumbnail-design-tips/
- Thumbnail psychology (FFA, faces): https://medium.com/@BrookhamDigital/youtube-thumbnail-psychology-why-viewers-click-1bbc7fb95199 ; best practices https://clickyapps.com/creator/thumbnails/guides/youtube-thumbnail-best-practices
- 2025 retention benchmarks: https://www.retentionrabbit.com/blog/2025-youtube-audience-retention-benchmark-report ; guide https://www.retentionrabbit.com/blog/ultimate-guide-youtube-audience-retention

**Packaging / Physical**
- Psychology of Apple packaging: https://www.readtrung.com/p/psychology-of-apple-packaging ; Fast Company "Unboxing the delightful UX of Apple's boxes" https://www.fastcompany.com/90916642/unboxing-the-delightful-ux-of-apples-boxes ; Filestage https://filestage.io/blog/apple-packaging/
- Don Norman affordances/signifiers/Norman doors: *The Design of Everyday Things* PDF https://media.aanda.psu.edu/sites/media/aa/files/documents/norman_design-of-everyday-things.pdf ; IxDF Norman Doors https://ixdf.org/literature/article/your-gateway-to-ux-design-norman-doors ; IxDF Signifiers https://ixdf.org/literature/topics/signifiers ; UX Magazine https://uxmag.com/articles/understanding-don-normans-principles-of-interaction

**Email**
- Litmus email design best practices: https://www.litmus.com/blog/email-design-best-practices ; accessibility https://www.litmus.com/blog/email-accessibility-for-designers-8-best-practices-you-should-follow
- Stripo email design guide: https://stripo.email/blog/email-design-best-practices/ ; preheader https://www.paved.com/blog/email-preheader/

**Cross-media principles / Gestalt**
- Gestalt principles: https://www.eleken.co/blog-posts/gestalt-principles ; Toptal https://www.toptal.com/designers/ui/gestalt-principles-of-design ; visual hierarchy origin https://medium.com/design-bootcamp/concept-of-visual-hierarchy-and-its-origin-from-gestalt-principle-850a295cd2ac
