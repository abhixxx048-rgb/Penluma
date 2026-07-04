# Research Notes — Chapter 9: UI/UX Beyond Screens
## Presentations, Documents, Marketing, Video, Packaging, Email

> Chapter thesis: UI/UX principles are not "app design rules" — they are rules about how human attention, perception, and memory work. Hierarchy, contrast, cognitive load, feedback, affordances, and progressive disclosure drive a good slide deck, a scannable report, a thumb-stopping ad, a clickable thumbnail, an iPhone box, an airport sign, and a marketing email exactly the way they drive a good app screen. The "user interface" is anything a human has to perceive, understand, and act on.

---

## 1. The Universal Principles (the through-line of the chapter)

These five principles appear in every section below. Name them once, then show them recurring:

1. **Hierarchy** — one dominant element tells the eye where to start; everything else is subordinate. On a screen it's the H1 and primary button; on a slide it's the assertion headline; on a package it's the brand mark or key claim; in an email it's the single CTA.
2. **Contrast** — differences in size, weight, color, and space create meaning and focus. Duarte lists contrast first among her slide arrangement tools; thumbnail studies show contrast lifts CTR; shelf impact is literally a contrast-against-neighbors problem.
3. **Cognitive load** — working memory is tiny; every extraneous element taxes it. Mayer's multimedia research, Reynolds' signal-to-noise ratio, wayfinding's progressive disclosure, and "one idea per slide" are all cognitive-load management.
4. **Feedback & affordances** — objects and layouts should signal what they are and what to do, and confirm actions. Norman doors, package opening tabs, email button states, slide build animations.
5. **Time budget** — every medium has a brutal attention window: ~3 seconds for a slide (Duarte's glance test), ~1.5–3 seconds for a social ad, ~1.9 seconds at a retail shelf, ~200×113 px and a split second for a thumbnail, ~51 seconds for a whole newsletter. Design for the window, not for the ideal reader.

Useful framing for the writer: **"Everything has a UI."** A report's UI is its headings. A box's UI is its opening tab. A hallway's UI is its signage.

---

## 2. Presentations (slides)

### One idea per slide + the Glance Test (Nancy Duarte)
- Duarte (author of *slide:ology* and *Resonate*, designer of Al Gore's *An Inconvenient Truth* deck) teaches **one idea per slide**: break multi-part concepts across slides; slides are free, attention is not.
- **The Glance Test**: the audience must grasp a slide's meaning in **3 seconds or less** — she calls slides "glance media," closer to billboards than documents. If people are reading your slide, they are not listening to you (you compete with yourself).
- Duarte's six arrangement tools: **contrast, flow, hierarchy, unity, proximity, whitespace**. Note for the writer: these are the exact Gestalt/visual-design tools from earlier chapters, applied to a 16:9 canvas. Whitespace is "the oxygen of a slide."
- Duarte's diagnostic: view your deck in slide-sorter view at small size; if every slide is a wall of bullets, it's a document, not a presentation ("slideument," Garr Reynolds' term).

### Assertion–Evidence structure (Michael Alley, Penn State)
- Replace topic-phrase titles ("Results") with a **full-sentence assertion headline (max 2 lines)** stating the takeaway ("Retention doubled after we simplified onboarding"), supported by **visual evidence** (photo, diagram, chart) — not bullet lists.
- Grounded in cognitive/multimedia learning research. Penn State studies (Garner & Alley) found assertion–evidence slides produced **better comprehension and recall of complex concepts** than conventional bullet slides (e.g., an MRI-topic experiment; ASEE 2011 paper "Assertion-Evidence Slides Appear to Lead to Better Comprehension and Recall"). Later classroom studies (ERIC EJ1396370) replicate retention gains and attribute them to reduced cognitive load.
- Mini case study: many science-communication programs (Harvard Catalyst, iBiology) now teach assertion-evidence as the default for research talks.

### Garr Reynolds / Presentation Zen
- **Signal-to-noise ratio**: maximize the ratio of relevant to irrelevant elements; removing the non-essential almost always increases impact. (Same principle as Mayer's coherence, and as decluttering a UI.)
- **Picture superiority effect**: pictures are remembered far better than words, especially with brief, casual exposure (effect strengthens when recall is tested >30 seconds after exposure — cited from *Universal Principles of Design*). Practical rule: pair one strong image with a few words that reinforce the same message.
- Restraint, simplicity, and empty space as deliberate tools (Zen aesthetic); plan analog (sketch on paper/sticky notes before opening PowerPoint).

### The cognitive science underneath: Mayer's multimedia learning principles
Richard Mayer's research program (Cambridge Handbook of Multimedia Learning) supplies the evidence base:
- **Coherence**: people learn more deeply when extraneous material is excluded (cut decorative clip art, background music, tangential facts).
- **Signaling**: adding cues that highlight organization (headings, arrows, highlighting) improves learning — this is hierarchy, proven experimentally.
- **Redundancy**: graphics + narration beat graphics + narration + identical on-screen text; reading and listening to the same words overloads the verbal channel. This is the scientific argument against reading your bullets aloud.
- **Spatial/temporal contiguity**: put labels next to the thing they label; present words and pictures together in time.
- Underlying model: dual channels (visual + verbal), each with limited capacity; design fails when essential + extraneous processing exceed capacity — the formal definition of cognitive overload.

### Rules of thumb for presentations
- One idea per slide; assertion headline ≤2 lines; pass the 3-second glance test.
- If a slide must work without you (emailed decks), make a separate document version — don't compromise the live deck.
- Common mistakes: bullet walls; title-case topic labels instead of takeaways; reading slides aloud (redundancy violation); decorative stock photos that add noise; tiny fonts (a common floor: nothing below ~24 pt for rooms; Guy Kawasaki's 10/20/30 rule — 10 slides, 20 minutes, 30 pt minimum font — is a popular heuristic worth citing).

---

## 3. Documents and Reports

### People scan, they don't read (NN/g eyetracking)
- **F-pattern** (Nielsen Norman Group, 2006, re-validated since including on mobile): users scan across the top, a shorter second sweep, then down the left edge. First lines get most attention; later paragraphs get only glances at leading words.
- **How little users read** (NN/g, analysis of 45,237 page views): users read **20–28% of the words** on an average visit; time on page ≈ **25 seconds + 4.4 seconds per additional 100 words** — i.e., only ~18 extra words read per extra 100 words present. Users read ~half the content only on pages of **≤111 words**; the average page had 593 words.
- Consequence: the F-pattern is what users do when the design gives them no hierarchy. Good formatting (meaningful headings, front-loaded keywords, bullets, bolding) *breaks* the F-pattern and produces intentional reading. NN/g's fixes: front-load information-carrying words in headings/paragraph starts; bold key phrases; use bullets and numbered lists; one idea per paragraph.

### The Pyramid Principle (Barbara Minto, ex-McKinsey)
The canonical structure for business documents and executive communication:
- **Lead with the answer** (the governing thought), then grouped supporting arguments, then evidence — a pyramid, not a mystery novel. Readers grasp and remember ideas presented top-down.
- Rules: (1) ideas at any level must **summarize** the ideas below them; (2) ideas within a grouping must be **logically the same kind of thing**; (3) groupings must be **logically ordered** and **MECE** (mutually exclusive, collectively exhaustive — no overlaps, no gaps).
- **SCQA opener**: Situation → Complication → Question → Answer, to earn the reader's attention before the pyramid.
- Minto's deeper point: if you can't summarize a grouping into one takeaway, the *thinking* isn't finished — structure problems are thinking problems.

### Executive summaries & report scannability
- An executive summary is the document's "above the fold": the busiest reader must get situation, findings, recommendation, and ask without reading further. Same logic as the inverted pyramid in journalism (most newsworthy first, details after).
- Practical toolkit: descriptive headings that work as an outline when read alone; tables for anything compared across ≥2 dimensions (aligned numbers, units in headers, shading for scan lanes); figures with assertion-style captions; generous margins and line spacing (45–75 characters per line for comfortable reading — classic typography guidance); consistent styles so hierarchy is visible at a flip-through.
- Common mistakes: burying the recommendation on page 14; headings like "Background" and "Discussion" that carry zero information; paragraphs >5–6 lines; tables screenshotted as images; "wall of text" executive summaries longer than a page.

---

## 4. Marketing Creatives & Social Media Posts

### The time budget: hierarchy in ~1 second
- Facebook/Meta's own creative guidance popularized "**thumb-stopping**": you have roughly **1.5–3 seconds** of glance time in feed; Meta data has been cited that the average user attends to a post for **≤2 seconds**, and **85% of online ads get less than 2.5 seconds** of active attention.
- Meta performance data cited by practitioners: advertisers optimizing for the **first 3 seconds** see ~**23% lower cost per acquisition**; "**thumbstop rate**"/hook rate = 3-second video plays ÷ impressions — a standard creative KPI.
- Design consequence: the ad must communicate brand + benefit at a glance — one focal point, one message, oversized type, high contrast against the feed's white/dark background. If your key info is in sentence two or second four, it effectively doesn't exist.

### Hook–Value–CTA structure
The standard skeleton for social creative and short video:
1. **Hook** (0–3 s / headline): stop the scroll — bold claim, question, pattern break, before/after.
2. **Value** (middle): deliver the promised benefit fast; show, don't tell.
3. **CTA** (end + often persistent): one specific action ("Get the guide," "Shop now"). One CTA per creative — mirrors the "one primary action per screen" rule in UI.

### Platform sizes & safe zones (2026 state of play)
- Vertical-first is the shift: Meta now recommends **4:5 portrait (1080×1350)** for feed over legacy 1:1 — portrait occupies ~⅓ more mobile screen and consistently outperforms squares in reach/engagement.
- Stories/Reels/Shorts/TikTok: **9:16, 1080×1920**. **Safe zones matter more than the canvas**: keep text/logos out of roughly the **top 150–250 px** (username/UI) and **bottom 350–450 px** (caption, sound attribution, action rail) — effectively design within a centered ~1080×1350–1420 area. TikTok's right-side engagement rail also eats horizontal space.
- Teach the principle, not the pixel table (specs change): *know what the platform chrome covers, and keep the message inside the surviving window* — the social-media equivalent of designing above the fold and respecting device safe areas in app design.
- Common mistakes: repurposing a 16:9 asset into 9:16 with tiny centered content; text under the caption overlay; more than ~20% of the image as dense text (hurts readability at thumb scale, and historically hurt Meta delivery); five messages in one creative.

---

## 5. Video & Thumbnails

### YouTube thumbnails — the highest-stakes 200×113 px in design
- Thumbnail + title *is* the UI of a video; YouTube's own guidance and creator data say CTR typically ranges 2–10%, with strong videos hitting **7–15% CTR in the first 24 hours**.
- **Faces & emotion**: thumbnails featuring expressive human faces reliably outperform; vidIQ reports strong emotional faces can lift CTR **20–30%**. Mechanism: humans are hardwired to look at faces and read emotion (fusiform face area; emotional contagion).
- **Contrast & color**: a 2023 Vidooly study found thumbnails with contrasting colors saw ~**30% higher CTR**. Saturated subject against desaturated/blurred background; outline/glow separation.
- **Curiosity gap** (George Loewenstein's information-gap theory of curiosity): thumbnail + title should open a question the viewer can only close by clicking — show the *situation*, not the *resolution*. Don't resolve the gap in the thumbnail text; don't repeat the title verbatim in the thumbnail.
- **3-element rule**: limit the thumbnail to ~three elements (canonical MrBeast pattern: **one face, one object, one implied question**). More elements = unreadable at feed size. MrBeast's publicly stated advice: design for the small screen; >70% of YouTube views are on phones, where the home-feed thumbnail renders around **200×113 px** — zoom out to 10% while designing; if text isn't legible from across the room on a dim phone, it's decoration.
- The best thumbnails hit at least two of three levers: **visual (contrast), emotional (face/expression), cognitive (curiosity text)**.
- Consistency compounds: channels with consistent thumbnail styling see ~**15–20% higher CTR from subscribers** (recognition = the brand-consistency principle from UI design systems).
- Common mistakes: clickbait that the video doesn't pay off (kills retention and trust — the dark-pattern analogy); tiny text; cluttered screenshots; ignoring how the thumbnail looks next to competitors in search results (shelf impact, again).

### Retention & pacing basics
- The first **30 seconds** carry disproportionate weight; **70%+ retention at 30 s** is the commonly cited strong benchmark. Viewer decisions are emotional and near-instant.
- Hook structure: **0–5 s** attention grab (cold open, question, payoff tease) → **5–15 s** clarify the promise → **15–30 s** stakes/context. Never open with long logos/intros ("skip the intro" is the video version of removing onboarding friction).
- **Pattern interrupts**: attention drifts cyclically; insert a deliberate stimulus change (angle cut, graphic, sound, zoom, on-screen question) roughly every **90–120 seconds** — and visual changes every **10–15 seconds** early in the video (talking head → screen share → close-up → cutaway).
- Retention graphs are the analytics feedback loop: spikes = rewatch-worthy moments; cliffs = broken promises or dead air — the video equivalent of funnel drop-off analysis. Audit drop-off points across your last ~10 videos and fix patterns, not individual videos.
- Framing for the chapter: the thumbnail is the *acquisition* UI; pacing is the *retention* UX. Same funnel thinking as product design (first impression → activation → retention).

---

## 6. Physical Products, Packaging, Wayfinding

### Shelf impact
- Shoppers give a shelf product about **1.9 seconds** before deciding to engage or move on (shopper-research figure cited by Explorer Research / crowdspring); **~⅓ of purchase decisions** are attributed to packaging, and **73–85% of purchase decisions are made at the point of sale** (POPAI-lineage statistic). Packaging is a 2-second interface.
- Color as the dominant signal: people form a judgment about a product **within 90 seconds**, and **62–90% of that judgment is based on color alone** (Satyendra Singh, *Management Decision*, 2006; similar figures from the Institute for Color Research/CCICOLOR). Caveat for the writer: these are widely cited but soft numbers — present as "research suggests," and note Help Scout's point that color effects are heavily **context- and category-dependent** (there is no universal "buy color").
- Shelf design = hierarchy under distance and clutter: brand block readable at 10 feet, variant/flavor at 3 feet, claims at arm's length — progressive disclosure by viewing distance. Distinct silhouette/color block beats detailed artwork (e.g., Tiffany blue, Coca-Cola red, the Toblerone prism).

### Unboxing as UX — the Apple case study
- Apple treats packaging as a designed experience: reportedly a dedicated (secretive) packaging design room at Cupertino where designers prototype and test the opening sequence of boxes — friction-fit lids engineered so the lid glides open with a slow pneumatic drift, building a beat of anticipation.
- Principles visible in an iPhone box: **minimalism/coherence** (product photo, product name, white space — nothing else; "the product speaks for itself"); **choreographed hierarchy of reveal** (device first, then accessories hidden below — most important thing first, progressive disclosure in cardboard); **affordances** (pull-tabs, ribbons, and cutouts that show exactly where to pull — no knife required); **feedback** (the resistance and hiss of the lid, the peel of the film — tactile confirmation that something premium is happening).
- Business effect: unboxing became shareable marketing (millions of unboxing videos), and packaging strengthens brand equity — first physical touchpoint sets quality expectations before the product is powered on. Contrast case: wire-tied clamshell blister packs — "wrap rage" as literal painful UX; Amazon's "Frustration-Free Packaging" program as the corrective.

### Affordances in physical objects (Don Norman)
- *The Design of Everyday Things*: **affordances** = the actions an object makes possible (a flat plate affords pushing; a bar handle affords pulling/grasping); **signifiers** (added in the 2013 revised edition) = perceivable cues indicating where/how to act; **feedback** = immediate confirmation of the action's result; plus mapping and conceptual models.
- **Norman doors**: doors whose handles invite pulling when they must be pushed — the archetypal affordance failure. Norman's razor: **"If a door needs a sign, the design has failed."** Great transferable line for the chapter: labels are patches for broken affordances (true for tooltips in UIs too).
- Everyday examples to use: stove-burner knob mapping; USB-A's three-try insertion (bad feedback/mapping) vs USB-C (orientation-free = error prevention by design); ketchup bottles redesigned upside-down (affordance follows usage); shampoo vs conditioner bottles indistinguishable in the shower (contrast/discriminability failure).

### Wayfinding & signage
- Wayfinding = UX of physical space: airports, hospitals, campuses. Core principles: **recognizability, consistency, standardization** — one typographic and color system throughout, so each sign is instantly parsed as part of the system (a physical design system).
- Legibility rule of thumb: **1 inch of letter height per 25 feet of viewing distance** (accessibility codes like ADA add contrast, glare, and mounting-height requirements).
- **Progressive disclosure**: give only enough information to reach the *next decision point*; research on airport visual guidance found high information density and text-only signs increase cognitive load and reduce decision confidence, while **text + pictogram** formats improve navigation; signs placed **3–5 feet before intersections** cut directional errors by roughly **45%** (Taylor & Francis airport wayfinding study, 2025).
- Hospitals: color-coded zones, landmarks, and floor transitions reduce stress for users who are anxious and cognitively loaded — designing for the worst-case user state, the physical analog of designing error states.
- Named exemplars: airport pictograms (AIGA/DOT symbol set), London Underground map (schematic > geographic accuracy — abstraction serving the task), IKEA's one-way path (opinionated flow, also an example of manipulative "dark pattern" spatial design worth mentioning).

---

## 7. Email Design

### Layout constraints & scannability
- **Single column, ~600 px max width** is the enduring standard: Outlook's Word-based rendering engine and preview panes make wider/multi-column layouts unreliable; single column guarantees graceful stacking on mobile (many Android clients and old Outlooks ignore media queries).
- NN/g newsletter usability research (228 newsletters tested): after opening, users give a newsletter **~51 seconds**; they **fully read only 19%** of newsletters — scanning dominates, and 35% of the time users skim only a small portion. Jakob Nielsen: web content should be short; **email content should be "ultra-short."**
- Hierarchy in email: one headline (≈22–24 px), short front-loaded paragraphs, a single dominant **CTA button** — bulletproof HTML button (not an image), **≥44 px touch height** (Apple HIG/Google Material minimum touch target — the same number governing app buttons), high-contrast color, action verb ("Start your trial," not "Click here"). Secondary links live in footer.
- Inbox-level design: the **subject line (~30–50 characters** recommended; under ~70 for full display) + preheader are the email's "thumbnail" — they do the thumb-stopping job before the email is ever opened.
- Mobile & robustness: **55–64% of opens are on mobile**; dark-mode color inversion, image-blocking (design must survive with images off — meaningful alt text, live-text headlines instead of text baked into images), and cross-client testing (Litmus/Email on Acid across 90+ clients — the email version of cross-browser QA).
- Why it's worth doing well: email averages **~$36–42 return per $1 spent** — among the highest-ROI channels, and the returns go to senders whose design survives hostile rendering environments.
- Common mistakes: multi-column desktop layouts that shatter on mobile; one giant image as the whole email (blocked images = blank email; also a spam signal); 3+ competing CTAs; tiny links packed together (touch-target failure); ignoring plain-text/accessibility.

---

## 8. Synthesis: one principle table (chapter centerpiece)

| Principle | App/Web UI | Slides | Documents | Social ad | Thumbnail | Packaging | Wayfinding | Email |
|---|---|---|---|---|---|---|---|---|
| Hierarchy | H1 + primary button | Assertion headline | Answer-first pyramid, headings | One focal point | One face/object | Brand block at 10 ft | Destination > detail | One headline, one CTA |
| Contrast | Focus states, CTA color | Duarte's #1 tool | Bold keywords | Pop against the feed | +30% CTR (Vidooly) | Shelf differentiation | Sign vs background | Button vs body |
| Cognitive load | Progressive disclosure | 1 idea/slide; Mayer coherence | 20–28% read → cut words | 1.5 s message | 3-element rule | 1.9 s decision | Info per decision point | 51 s scan budget |
| Affordance/feedback | Buttons look pressable | Build animations | Numbered steps | CTA looks tappable | Play-promise honesty | Pull tabs, lid resistance | Arrows, pictograms | Bulletproof 44 px button |
| Consistency | Design systems | Template/theme | House style | Brand codes | +15–20% subscriber CTR | Brand color equity | Uniform sign system | Recognizable sender/template |

Key numbers to sprinkle (all sourced above): 3-second glance test; 20–28% of words read; 25 s + 4.4 s/100 words; 1.5–3 s feed attention; 85% of ads <2.5 s; 7–15% strong thumbnail CTR; 70% retention at 30 s; 1.9 s shelf decision; 62–90% color-based snap judgment (soft); 1 inch letter height per 25 ft; ~45% fewer wrong turns with well-placed signs; 51 s per newsletter; $36–42 email ROI per $1; 44 px touch targets; 600 px email width.

Closing idea for the chapter: mastering UI/UX principles makes you dangerous in *every* medium — the deliverable changes, the human doesn't.

---

## Sources

- Duarte — glance test & slide design: https://www.duarte.com/do-your-powerpoint-slides-pass-the-glance-test/ ; https://www.duarte.com/blog/perfect-your-slide-design/ ; slide:ology overview: https://www.duarte.com/resources/books/slideology/
- Assertion–Evidence: Penn State/Alley ASEE paper: https://peer.asee.org/assertion-evidence-slides-appear-to-lead-to-better-comprehension-and-recall-of-more-complex-concepts.pdf ; replication study: https://files.eric.ed.gov/fulltext/EJ1396370.pdf ; Harvard Catalyst slide guidance: https://catalyst.harvard.edu/writing-communication-center/visualize-science/slides/
- Garr Reynolds — design tips (SNR, picture superiority): https://www.garrreynolds.com/design-tips ; https://presentationzen.com/blog/the-signal-to-noise-ratio-activity
- Mayer multimedia principles: https://www.cambridge.org/core/books/abs/cambridge-handbook-of-multimedia-learning/principles-for-reducing-extraneous-processing-in-multimedia-learning-coherence-signaling-redundancy-spatial-contiguity-and-temporal-contiguity-principles/CD5B7AE1279A9AB81F8EEBB53DBEC86E ; https://www.digitallearninginstitute.com/blog/mayers-principles-multimedia-learning
- NN/g F-pattern: https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content-discovered/ ; https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/
- NN/g how little users read: https://www.nngroup.com/articles/how-little-do-users-read/
- Minto Pyramid Principle summaries: https://strategyu.co/pyramid-principle-partone/ ; https://www.tosummarise.com/book-summary-the-pyramid-principle-by-barbara-minto/ ; https://www.barbaraminto.com/
- Thumb-stopping / Meta attention: https://isonicmedia.in/creating-thumb-stopping-creatives-that-win-in-seconds/ ; https://motionapp.com/blog/key-creative-performance-metrics ; https://designshack.net/articles/business-articles/designing-for-social-media/
- Social image sizes & safe zones (2026): https://blog.hootsuite.com/social-media-image-sizes-guide/ ; https://www.digitalapplied.com/blog/social-media-image-sizes-2026-every-platform ; https://buffer.com/resources/social-media-image-sizes/
- Thumbnails: https://vidiq.com/blog/post/youtube-custom-thumbnails-ctr/ ; https://www.thumbmagic.co/blog/thumbnail-design-principles ; MrBeast analysis: https://artiphik.com/blog/mrbeast-thumbnail-analysis ; https://1of10.com/blog/how-to-make-thumbnails-like-mrbeast/
- Retention/pacing: https://uppbeat.io/blog/youtube-growth/youtube-analytics/youtube-audience-retention ; https://1of10.com/blog/how-to-hook-viewers-in-the-first-30-seconds-of-a-youtube-video/ ; https://air.io/en/youtube-hacks/advanced-retention-editing-cutting-patterns-that-keep-viewers-past-minute-8
- Packaging/shelf: https://explorerresearch.com/packaging-research-design/ ; https://www.crowdspring.com/blog/packaging-design-insights/ ; Apple packaging: https://filestage.io/blog/apple-packaging/ ; https://flickpack.com/apple-packaging/
- Color snap-judgment research (Singh 2006 et al., with context caveat): https://www.helpscout.com/blog/psychology-of-color/ ; https://pandh.com/the-role-of-color-psychology-in-packaging-design/
- Norman affordances/signifiers: https://en.wikipedia.org/wiki/The_Design_of_Everyday_Things ; https://jnd.org/books/the-design-of-everyday-things-revised-and-expanded-edition/ ; https://medium.com/@sachinrekhi/don-normans-principles-of-interaction-design-51025a2c0f33
- Wayfinding: https://www.tandfonline.com/doi/full/10.1080/13467581.2025.2589544 ; https://blinksigns.com/complete-guide-to-wayfinding-signage/ ; https://www.22miles.com/blog/fundamentals-of-hospital-wayfinding-design/ ; https://healthfacilityguidelines.com/ViewPDF/ViewIndexPDF/iHFG_part_w_wayfinding_design_principles
- Email design: https://stripo.email/blog/email-design-best-practices/ ; https://www.campaignmonitor.com/blog/email-marketing/the-really-good-guide-to-email-design-bonus-checklist/ ; https://www.digitalapplied.com/blog/email-design-size-guide-2026-templates
- NN/g email newsletter usability (51 s, 19% full reads): https://www.nngroup.com/reports/email-newsletter-design/ ; https://www.wyliecomm.com/email-newsletter-length/ ; https://www.campaignmonitor.com/blog/email-marketing/email-usability-keeping-your-email-newsletters-short-and-sweet/
- Email ROI/mobile stats: https://www.litmus.com/blog/infographic-the-roi-of-email-marketing ; https://www.mailerlite.com/blog/email-marketing-statistics
