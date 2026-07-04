# Research Notes — Chapter 6: Accessibility and Inclusive Design

Research date: July 2026. Sources: W3C/WAI, WebAIM, Nielsen Norman Group, Microsoft Inclusive Design, Apple HIG, Material Design, litigation trackers, WHO. All statistics carry source attribution; URLs in Sources section.

---

## 1. Why Accessibility Matters

### 1.1 The human scale
- **1.3 billion people — about 16% of the world's population (1 in 6)** — live with a significant disability (WHO). That figure EXCLUDES temporary disabilities (broken arm, eye surgery), undiagnosed conditions, and situational limitations (bright sunlight, holding a baby), so the real pool of people who benefit is far larger.
- In the US, the CDC estimates **~1 in 4 adults (27%)** has some type of disability.
- Disability is not an edge case — it is a normal part of being human. Nearly everyone will experience temporary or permanent disability at some point in life (aging alone guarantees declining vision, hearing, dexterity, memory).
- Key categories of disability designers must consider: **visual** (blindness, low vision, color blindness), **auditory** (deafness, hard of hearing), **motor** (limited dexterity, tremors, paralysis, amputation), **cognitive** (dyslexia, ADHD, memory issues, autism, learning disabilities), **speech**, **vestibular/seizure** (motion sensitivity, photosensitive epilepsy).

### 1.2 The Microsoft Persona Spectrum: permanent → temporary → situational
Microsoft's Inclusive Design Toolkit reframes disability as a **mismatch between a person and their environment**, not an attribute of the person. Every permanent disability has temporary and situational cousins:
- **One arm** (permanent) → **arm injury** (temporary) → **new parent holding a baby** (situational)
- **Blind** → **cataract surgery recovery** → **distracted driver / glare on screen**
- **Deaf** → **ear infection** → **loud bar / quiet library**
- Scale example (Microsoft): ~26,000 Americans per year suffer permanent upper-limb loss, but counting temporary and situational impairments, **more than 20 million** people in the US at any time can't use one arm.
- Core principle: **"Solve for one, extend to many."** Design for the person with the permanent disability and everyone in the spectrum benefits.

### 1.3 The business case (numbers to quote)
- The extended market of people with disabilities plus friends/family is estimated at **2.3 billion people controlling $6.9 trillion (nearly $7T) in annual disposable income** (W3C WAI Business Case, citing Return on Disability).
- UK **"Purple Pound"**: £249 billion annual spending power of disabled people and their families. US discretionary spending by people with disabilities: **$200+ billion/year**.
- **The Click-Away Pound (UK survey)**: majority of users with access needs abandon inaccessible sites rather than complain; UK retailers forfeit an estimated **£120 billion+**; one survey found **55% of UK consumers had abandoned a purchase** due to accessibility issues.
- **SEO overlap**: accessibility work (semantic headings, alt text, transcripts, descriptive links, fast simple pages) is largely the same work as SEO. Case study — **This American Life (NPR)** added full transcripts: **search traffic +6.86%, unique visitors +4.18%, inbound links +3.89%**; 7.23% of visitors used the transcripts (W3C WAI Business Case).
- **Innovation dividend**: accessibility research has repeatedly produced mainstream tech — the typewriter (built 1808 by Pellegrino Turri for a blind friend), the telephone, punch cards, text-to-speech, autocomplete, voice control (Google's list), Apple's VoiceOver leading to the first fully accessible touchscreen. Brands like **Barclays, Microsoft, Apple** treat accessibility as brand and innovation strategy, not compliance.

### 1.4 The legal case
- **ADA (US, 1990)**: Title III covers "places of public accommodation." Courts (notably **Robles v. Domino's Pizza**) established that this applies to websites and apps. In 2019 the Supreme Court declined to hear Domino's appeal, leaving the Ninth Circuit ruling intact: a blind customer who couldn't order pizza with a screen reader could sue — six years of litigation ended in a 2022 settlement plus $4,000 damages under California's Unruh Act. Lesson: fighting is far more expensive than fixing.
- **Target (2008 landmark, NFB v. Target)**: **$6 million class settlement plus ~$3 million+ plaintiff legal fees** and years of court-supervised oversight, for an inaccessible e-commerce site.
- **Litigation volume**: ~**3,948 federal ADA web lawsuits filed in 2025** (+23.8% vs 2024's 3,188); over **5,000** including state courts. H1 2025 alone: 2,014 cases (+37% YoY). Hotspots: New York, Florida, California; Illinois grew ~750% YoY. (EcomBack / UsableNet trackers.)
- **Accessibility overlay widgets are not a shield**: **~22.6% of 2025 lawsuits targeted sites that had an accessibility widget installed**; the FTC fined overlay vendor **accessiBe $1 million** (2025) for misleading "guaranteed compliance" marketing. Expert consensus: overlays can't fix underlying code and sometimes make things worse.
- **Section 508 (US)**: requires federal agencies (and effectively their vendors/contractors) to make ICT accessible; the refreshed rule incorporates **WCAG 2.0 AA** by reference.
- **European Accessibility Act (EAA)**: in force **June 28, 2025**. Applies to private-sector e-commerce, banking, transport, e-books, telecoms serving EU consumers — including non-EU companies selling into the EU. Technical standard: **EN 301 549**, which incorporates **WCAG 2.1 AA**.
- Other laws: UK Equality Act 2010, Canada's ACA/AODA, Norway (inaccessible commercial sites are illegal, fined), 175+ countries ratified the UN CRPD. Practical takeaway: **WCAG AA is the de facto global legal baseline.**

### 1.5 State of the web (how bad it is)
WebAIM Million (annual automated audit of top 1,000,000 home pages, 2025 edition):
- **94.8% of home pages had at least one detectable WCAG failure.**
- Average **51 errors per home page** (down 10.3% from 56.8 in 2024 — slow progress).
- **1 in every 24 page elements** (4.1%) had a detectable error.
- **Six issue types cause ~96% of all errors**: (1) low-contrast text — on **79.1% of pages**, avg 29.6 instances/page; (2) missing image alt text; (3) missing form input labels; (4) empty links; (5) empty buttons; (6) missing document language. Plain-English implication: a beginner who fixes just these six things beats most of the web.
- **ARIA paradox**: pages using ARIA averaged significantly MORE errors (59.1 vs 42 without). Hence the First Rule of ARIA: **"Don't use ARIA"** — use native HTML elements (`<button>`, `<a>`, `<nav>`) that come with semantics and keyboard behavior built in. "No ARIA is better than bad ARIA."

---

## 2. WCAG 2.2 in Plain Language

**Web Content Accessibility Guidelines** — published by the W3C's Web Accessibility Initiative (WAI). Current version: **WCAG 2.2 (October 2023)**. Structure: 4 principles → 13 guidelines → **success criteria** (testable rules), each assigned level A, AA, or AAA.

### 2.1 POUR — the four principles
1. **Perceivable** — Can everyone *get* the information? Text alternatives for images, captions for video, sufficient contrast, content that doesn't rely on one sense alone.
2. **Operable** — Can everyone *use* the controls? Everything works by keyboard; no traps; enough time; nothing that triggers seizures (no flashing >3 times/second); easy-to-hit targets.
3. **Understandable** — Can everyone *figure it out*? Readable language, predictable behavior, consistent navigation, helpful error messages that explain how to fix the problem.
4. **Robust** — Does it work with *different technologies*? Clean, valid, semantic code that browsers and assistive tech (screen readers, magnifiers, switch devices) can interpret, today and in the future.

### 2.2 Levels A / AA / AAA
- **Level A** = the floor. Failing A means some users are completely blocked (e.g., no keyboard access, no alt text). Non-negotiable minimum.
- **Level AA** = the practical, universally cited target. **WCAG 2.2 AA = 55 success criteria.** It's what the ADA settlements, Section 508, EAA/EN 301 549, and UK Equality Act reference. "Accessible website" in professional conversation means AA.
- **Level AAA** = gold standard (7:1 contrast, sign language for video, lower-secondary reading level). Not required across a whole site because some criteria are impossible for some content; treat it as aspiration for critical flows.

### 2.3 What WCAG 2.2 added (9 new criteria; the AA/A ones matter most)
- **2.4.11 Focus Not Obscured (AA)** — sticky headers/cookie banners must not hide the focused element.
- **2.5.7 Dragging Movements (AA)** — anything done by dragging (sliders, drag-and-drop, map panning) must have a non-drag alternative (buttons, taps) for people with tremors or limited dexterity.
- **2.5.8 Target Size Minimum (AA)** — interactive targets at least **24×24 CSS px** (or equivalent spacing); see §6.
- **3.2.6 Consistent Help (A)** — help (contact link, chat) appears in the same place on every page.
- **3.3.7 Redundant Entry (A)** — don't force users to retype information already provided in the same flow (auto-fill it or offer "same as shipping").
- **3.3.8 Accessible Authentication (AA)** — logins must not require a cognitive test (memorizing/transcribing); allow paste, password managers, biometrics. CAPTCHAs are a notorious barrier — the **#1 complaint of screen reader users** (WebAIM survey).
- AAA additions: Focus Not Obscured (Enhanced), Focus Appearance, Accessible Authentication (Enhanced). Also removed: 4.1.1 Parsing (obsolete).

---

## 3. Color Blindness (Color Vision Deficiency, CVD)

### 3.1 Prevalence and types
- **~8% of men and ~0.5% of women** have red-green color vision deficiency (genetic, X-linked — which is why men are affected far more). Roughly **300 million people worldwide** — about one man in twelve. In any audience of 100 men, expect ~8 who can't reliably tell red from green.
- Types (cones = L/red, M/green, S/blue photoreceptors):
  - **Protanopia / protanomaly** — L (red) cone missing/shifted. Reds look dark/black; red vs green confusion.
  - **Deuteranopia / deuteranomaly** — M (green) cone missing/shifted. Most common form; reds and greens look similar muddy yellows/browns.
  - **Tritanopia / tritanomaly** — S (blue) cone affected. Very rare (~0.003%); blue/green and yellow/pink confusion.
  - **Achromatopsia** — total color blindness; extremely rare; grayscale vision.
- "Color blind" almost never means seeing in grayscale — it means certain hue pairs collapse into each other.

### 3.2 Design implications (rules of thumb)
- **Never use color as the only carrier of meaning** (this is WCAG 1.4.1 "Use of Color", Level A). Red/green status dots, red-only error outlines, colored-line-only charts all fail.
- **Pair color with a second channel**: icon + color (✓/✕), text label ("Error:"), pattern/texture in charts, underline on links (don't rely on link color alone), shape differences on map markers.
- Danger pairs to avoid relying on: red/green (the classic), green/brown, blue/purple, light green/yellow, gray/pink.
- Form errors: don't just turn the border red — add an icon and an explicit message next to the field.
- Data viz: use color-blind-safe palettes (Okabe-Ito, viridis), direct-label lines instead of color-keyed legends, vary line style (solid/dashed).
- **Test**: simulate with **Stark** (Figma plugin), **Color Oracle** (desktop simulator), Chrome DevTools "Emulate vision deficiencies", or Photoshop's proof modes. A 30-second simulation catches most disasters.

---

## 4. Contrast Ratios

### 4.1 The numbers (memorize these)
Contrast ratio = difference in relative luminance between foreground and background, from **1:1** (white on white) to **21:1** (black on white).
- **AA, normal text: ≥ 4.5:1** (WCAG 1.4.3)
- **AA, large text: ≥ 3:1** — large = **18pt/24px+, or 14pt/18.66px+ bold**
- **AAA: 7:1 normal, 4.5:1 large** (WCAG 1.4.6)
- **UI components & meaningful graphics: ≥ 3:1** (WCAG 1.4.11 "Non-text Contrast") — form input borders, focus indicators, icons, chart elements.
- No rounding up: **#777777 gray on white = 4.47:1 → FAIL**. The classic trap of "aesthetic" light-gray text (#999, #aaa on white) fails badly — and low-contrast text is the **single most common accessibility error on the web (79.1% of home pages, WebAIM Million 2025)**.
- Exceptions: logos, purely decorative text, disabled controls, incidental text in photos.
- Who it helps: low vision (including age-related decline — contrast sensitivity drops steadily after ~40), color blindness, everyone on a phone in sunlight or a cheap washed-out display (curb-cut effect).

### 4.2 Tools
- **WebAIM Contrast Checker** (webaim.org/resources/contrastchecker/) — the standard; paste two hex codes, get pass/fail per level.
- **Colour Contrast Analyser (CCA)** by TPGi — desktop eyedropper, works on any app/screen.
- Figma plugins: **Stark**, **Contrast**. Chrome DevTools shows contrast in the color picker with AA/AAA lines.
- Note for the future: WCAG 3 is exploring **APCA** (Advanced Perceptual Contrast Algorithm), which models perceived contrast better (esp. dark mode and thin fonts), but WCAG 2.x ratios remain the legal standard today.

---

## 5. Screen Readers and Semantic Structure

### 5.1 What screen readers are
Software that converts the interface to speech or refreshable braille: **JAWS** (Windows, paid), **NVDA** (Windows, free), **VoiceOver** (built into macOS/iOS), **TalkBack** (Android), **Narrator** (Windows). WebAIM Screen Reader Survey #10 (2024, n=1,539): **91%+ of screen reader users also use one on mobile**, ~71% on iPhone/iPad.

### 5.2 How users actually navigate (evidence for why semantics matter)
- Screen reader users don't read pages top to bottom — they **jump**: by headings, landmarks, links, form fields.
- **71.6% navigate by headings first** (WebAIM 2024) — the dominant strategy, rising over time. A page without a proper `<h1>–<h3>` outline is like a book with no chapter titles.
- Landmark/region usage rebounded to **31.8%** frequent use (2024).
- **Top frustrations reported**: CAPTCHA (#1 by far), inaccessible menus/dialogs, **ambiguous links and buttons** ("click here", "read more" — screen readers can list all links out of context, so every link label must make sense alone), unexpected screen changes.

### 5.3 Semantic structure rules of thumb
- **Use real HTML elements**: `<button>` not clickable `<div>`; `<a href>` for navigation; `<label>` tied to every input; `<nav>`, `<main>`, `<header>`, `<footer>` landmarks; `<table>` with `<th>` for data tables. Native elements bring keyboard support, focus, and announcements for free.
- **One `<h1>` per page; don't skip heading levels; choose headings by structure, not font size.**
- **Alt text** (biggest single content task):
  - Describe the image's **purpose/content** concisely; put key info first; **aim under ~100 characters**.
  - Don't write "image of…" / "picture of…" — the screen reader already announces "graphic."
  - **Decorative images get empty alt (`alt=""`, no space)** so they're skipped — an omitted alt attribute is worse: the screen reader reads the file name ("IMG_4032.jpg").
  - Functional images (icon buttons, logo links) — describe the **action/destination** ("Search", "Home"), not the picture ("magnifying glass").
  - Complex charts: short alt + adjacent text/table with the data.
- Set the page language (`<html lang="en">`) — missing language is a WebAIM top-six error and makes screen readers mispronounce everything.
- ARIA: only when native HTML can't do it (custom widgets: tabs, comboboxes, live regions). See ARIA paradox in §1.5.
- **Test cheaply**: turn on VoiceOver (Cmd+F5 on Mac) or NVDA (free) and try to complete your core task with the screen off. Five minutes of this is more educational than a week of reading.

---

## 6. Keyboard Navigation and Touch Targets

### 6.1 Keyboard (WCAG 2.1.1, Level A — everything operable via keyboard)
Who depends on it: blind users (screen reader = keyboard-driven), motor impairments (tremors, RSI, paralysis using switch devices or sip-and-puff, which emulate keyboards), power users.
- **The 5-minute test anyone can run**: unplug the mouse. `Tab` moves forward, `Shift+Tab` back, `Enter` activates links/buttons, `Space` toggles checkboxes/buttons, arrows drive radios/menus/selects, `Esc` closes dialogs. Can you reach and operate everything? Can you always *see where you are*?
- **Visible focus indicator is mandatory** (WCAG 2.4.7 AA). The cardinal sin: `outline: none` in CSS with no replacement — it makes the site unusable-blind for keyboard users. Style the focus ring (high contrast, ≥3:1 against background, ideally a 2px+ ring with offset) instead of deleting it.
- **Logical tab order**: should follow visual reading order (left→right, top→bottom). Achieve it by ordering the source code correctly. **Never use positive `tabindex` values** (tabindex="1"+) — they hijack and scramble order; only `tabindex="0"` (join natural order) and `tabindex="-1"` (programmatic focus) are safe.
- **No keyboard traps** (WCAG 2.1.2 A): users must be able to tab out of any widget (embedded players and custom modals are common offenders). Modals should trap focus *inside while open* and return focus to the trigger on close.
- **Skip link**: "Skip to main content" as the first focusable element, visible on focus — spares keyboard users tabbing through 40 nav links on every page.

### 6.2 Touch target sizes (the cheat sheet)
- **Apple HIG: minimum 44×44 pt.**
- **Material Design (Google/Android): minimum 48×48 dp** (with ≥8dp spacing between targets).
- **WCAG 2.2 SC 2.5.8 (AA): minimum 24×24 CSS px** — a legal floor, not a comfort target; smaller allowed if spacing compensates or the target is inline in text.
- **WCAG 2.5.5 (AAA): 44×44 CSS px.**
- Practical rule of thumb: **build to 44–48px; treat 24px as the absolute never-go-below**. Research: targets under ~44px show roughly **3× higher error rates** (Univ. of Maryland touch research, 2023); MIT Touch Lab: average adult fingertip pad ≈ 10mm, thumb ≈ ~2.5cm — physical basis for the ~9–10mm (≈48dp) guidance.
- Who it helps: tremors, arthritis, large fingers, one-handed phone use on a train — situational disability again.
- The visual icon can stay small; expand the **hit area** with padding. Also space adjacent targets so mis-taps don't trigger the wrong destructive action.

---

## 7. Cognitive Accessibility and Plain Language

Largest and least visible disability group: dyslexia (est. ~10% of people), ADHD, autism, memory/age-related decline, low literacy, and — situationally — everyone who is tired, stressed, or reading in a second language.

Guidelines (mostly from WCAG "Understandable" + W3C COGA task force + content-design practice):
- **Write plainly**: aim for **lower-secondary reading level** (~grade 8; WCAG 3.1.5 AAA references this). Short sentences (≤~20 words), common words, active voice, front-load the point. Test with Hemingway Editor or readability formulas.
- **Chunk content**: descriptive headings, short paragraphs, bulleted lists, generous white space. Helps working memory; also helps every skimmer and mobile reader.
- **Be consistent and predictable**: navigation in the same place on every page (WCAG 3.2.3), components that look the same behave the same, no surprise context changes (don't auto-submit or open new windows unannounced).
- **Reduce load, don't test memory**: WCAG 2.2's Redundant Entry and Accessible Authentication criteria exist for this — never make memory or transcription a prerequisite for using the product. Support autofill and paste.
- **Motion and distraction**: no autoplaying video/carousels without pause controls (WCAG 2.2.2), no blinking, honor `prefers-reduced-motion`; never flash >3×/second (seizure risk, WCAG 2.3.1).
- **Time limits**: warn and allow extension (WCAG 2.2.1).
- **Errors**: say what went wrong, where, and how to fix it, in words a human uses ("Please enter your card's 3-digit security code"), not codes ("Error 422: validation failed").
- Typography help for dyslexia/low vision: clear sans-serifs (Arial, Verdana, Helvetica), 16px+ body text, line-height ~1.5, line length 45–75 characters, left-aligned (not justified), real text (not images of text — WCAG 1.4.5).

---

## 8. Captions, Transcripts, and Media

- **WCAG requirements**: captions for prerecorded video with audio (1.2.2, Level A); audio description of important visual info (1.2.5, AA); live captions (1.2.4, AA); transcript for audio-only (1.2.1, A). AAA adds sign language.
- **Captions vs subtitles**: captions include non-speech audio ("[door slams]", "[ominous music]", speaker IDs); subtitles assume you can hear and only translate speech. Closed captions can be toggled; open captions are burned in.
- **Who actually uses captions** (curb-cut evidence):
  - **80% of caption users are not deaf or hard of hearing** (Ofcom/industry research).
  - **~85% of social media videos are watched with sound off**; ~70%+ of Americans (especially Gen Z) routinely watch with subtitles on.
  - Videos with captions see large engagement lifts — viewers are far more likely to finish captioned videos (one PLYMedia study measured **+40% view time**); Verizon Media/Publicis found most consumers watch muted in public.
- **Auto-captions are a starting point, not compliance**: accuracy drops with accents, jargon, names; always review/edit. Target ≥99% accuracy for compliance-grade captions.
- **Transcripts** double as SEO content (search engines index the full text — see This American Life numbers in §1.3), are skimmable/searchable, translatable, and usable by deaf-blind users with braille displays.

---

## 9. Inclusive Design vs Accessibility vs Universal Design

Three related but distinct terms (NN/g, IxDF, UX Design Institute definitions):
- **Accessibility** = an **outcome/attribute**: can people with disabilities use this? Measured against standards (WCAG). Focused specifically on disability. It's the minimum bar.
- **Inclusive design** = a **methodology/process**: deliberately include the full range of human diversity — ability, but also language, culture, gender, age, income, device, bandwidth — throughout design. NN/g: methods to "create products that understand and enable people of all backgrounds and abilities." Accepts **multiple adaptations** (dark mode, text resize, multiple input methods) rather than one solution. Key practices: co-design with excluded users ("nothing about us without us"), recognize your own ability biases, design for one → extend to many.
- **Universal design** = a **philosophy** (from architecture, Ronald Mace): one single design usable by all people "to the greatest extent possible, without the need for adaptation." More common in physical/environmental design; inclusive design dominates digital because software adapts cheaply.
- Relationship in one line: *accessibility is a required outcome; inclusive design is the process most likely to produce it; universal design is the ideal of one-solution-for-all.*
- Microsoft's three inclusive design principles: **(1) Recognize exclusion, (2) Solve for one, extend to many, (3) Learn from diversity.**

---

## 10. The Curb-Cut Effect

- **Origin story**: early-1970s Berkeley, CA — disability activists (Ed Roberts and the independent-living movement; activists reportedly poured concrete ramps themselves at night) pushed the city to install **curb cuts** (sidewalk ramps) for wheelchair users. Result: strollers, delivery carts, cyclists, travelers with suitcases, skateboarders — everyone used them. Designing for the "edge" improved life for the middle.
- **Definition**: when designs created for people with disabilities end up benefiting everyone (also called "electronic curb cuts" in digital contexts).
- **Canonical examples to cite**:
  - **Typewriter/keyboard** — invented 1808 by Pellegrino Turri for a blind countess to write letters.
  - **Telephone** — Alexander Graham Bell's work with deaf people (his mother and wife were deaf).
  - **OXO Good Grips** — Sam Farber designed fat, soft-handled peelers for his wife Betsey's arthritis (1990); became a design-award-winning mainstream brand everyone prefers.
  - **Captions** — built for deaf viewers; now used by the muted-gym-TV and subtitles-on generation (80% of caption users hear fine).
  - **Audiobooks/text-to-speech** — from talking books for blind readers to a mainstream industry; **voice assistants** trace to speech tech for motor/speech disabilities.
  - **Autocomplete** — Google notes it was initially built for users with disabilities; now universal.
  - **High contrast & dark modes, larger text settings** — low-vision features used by everyone at night or in sunlight.
- Use in the chapter as the closing argument: accessibility is never "for the few." Fixing for the extremes debugs the design for everyone (also cited by policy writers as a metaphor for equity — Angela Glover Blackwell's 2017 essay "The Curb-Cut Effect" in *Stanford Social Innovation Review*).

---

## 11. Practical Checklist a Non-Expert Can Apply

**Content & visuals**
1. Every meaningful image has concise alt text (<100 chars, purpose-first); decorative images get `alt=""`.
2. All text contrast ≥ 4.5:1 (3:1 for large text); UI controls/icons ≥ 3:1. Check with WebAIM Contrast Checker.
3. Color is never the only signal — pair with icons, labels, patterns. Run a color-blind simulation (Stark / Chrome DevTools).
4. Body text ≥16px, line-height ~1.5, left-aligned, real text not images of text; content readable at 200% zoom without horizontal scrolling (WCAG 1.4.4/1.4.10 Reflow).

**Structure & code**
5. Logical heading outline (one h1, no skipped levels); landmarks (`<nav>`, `<main>`); page `lang` set.
6. Native HTML controls (`<button>`, `<a>`, `<label for>` on every input). ARIA only as a last resort.
7. Link/button text meaningful out of context (never "click here").

**Interaction**
8. Complete every key task with keyboard only; focus indicator always visible; no traps; skip link present; sensible tab order.
9. Touch targets ≥44×44px (never below 24px), with spacing between adjacent targets.
10. Drag interactions have a click/tap alternative; no content flashes >3×/sec; motion/carousels pausable; honor reduced-motion.

**Forms & flows**
11. Errors identified in text, next to the field, with a fix suggestion; labels never replaced by placeholder-only text (placeholders vanish on typing and often fail contrast).
12. No pure-memory logins; allow paste and password managers; avoid CAPTCHAs or offer accessible alternatives; don't force re-entry of known info.

**Media**
13. Captions on all video; transcripts for audio; audio descriptions where visuals carry meaning; nothing autoplays with sound.

**Testing habit**
14. Run automated checks (axe DevTools, WAVE, Lighthouse) — but know they catch only **~30–40% of issues** (best tools up to ~57–70% by volume); the blockers automation misses (tab order logic, focus management, meaningful alt quality) need the manual tests above.
15. Do a 5-minute screen reader pass (VoiceOver/NVDA) on your top task; better yet, include people with disabilities in usability testing.

**Common mistakes list (chapter sidebar material)**: gray-on-white "elegant" text; `outline:none`; div-buttons; placeholder-as-label; red/green-only status; unlabeled icon buttons; missing alt (or alt="logo.png"); auto-playing carousels; CAPTCHA walls; PDF-only content; relying on an overlay widget; treating accessibility as a final QA step instead of a design-stage requirement (retrofits cost far more — NN/g and Deque both stress shift-left).

---

## 12. Expert Rules of Thumb (quotable)
- "Accessibility is not a feature; it's a quality requirement — like performance or security."
- Microsoft: "Disability is a mismatch, not a personal attribute." / "Solve for one, extend to many."
- First Rule of ARIA: don't use ARIA (use native HTML). No ARIA beats bad ARIA (WebAIM data: ARIA pages avg 59.1 errors vs 42).
- WCAG AA is the target; A is the floor; AAA is aspiration for critical flows.
- If you fix only six things, fix the WebAIM six: contrast, alt text, form labels, empty links, empty buttons, document language — that's ~96% of detected errors.
- The keyboard test and the screen-reader-for-five-minutes test are the highest-ROI manual checks a non-expert can run.
- Accessibility work compounds: it overlaps ~heavily with SEO, mobile usability, performance, and conversion — the curb-cut effect in business form.

---

## Sources
- WHO — Disability key facts (1.3B / 16%): https://www.who.int/news-room/fact-sheets/detail/disability-and-health
- W3C WAI — The Business Case for Digital Accessibility (market data, Apple/Google/Barclays/This American Life/Target case studies): https://www.w3.org/WAI/business-case/
- W3C — WCAG 2.2 Recommendation: https://www.w3.org/TR/WCAG22/
- W3C WAI — What's New in WCAG 2.2: https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
- WebAIM Million 2025 (94.8%, 51 errors/page, top-six errors, ARIA data): https://webaim.org/projects/million/2025
- WebAIM Screen Reader User Survey #10 (heading navigation 71.6%, CAPTCHA complaint, mobile usage): https://webaim.org/projects/screenreadersurvey10/
- WebAIM — Contrast and Color: https://webaim.org/articles/contrast/ ; Contrast Checker: https://webaim.org/resources/contrastchecker/
- WebAIM — Keyboard Accessibility: https://webaim.org/techniques/keyboard/ ; Alternative Text: https://webaim.org/techniques/alttext/ ; Intro to ARIA: https://webaim.org/techniques/aria/
- NN/g — Inclusive Design: https://www.nngroup.com/articles/inclusive-design/ ; Keyboard-Only Navigation: https://www.nngroup.com/articles/keyboard-accessibility/ ; Alt Text: What to Write: https://www.nngroup.com/articles/write-alt-text/
- Microsoft Inclusive Design (Persona Spectrum, solve-for-one): https://inclusive.microsoft.design/
- W3C WAI — Understanding Target Size (2.5.8/2.5.5): https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html
- Apple HIG 44pt / Material 48dp target guidance via TetraLogical Foundations: https://tetralogical.com/blog/2022/12/20/foundations-target-size/ and LogRocket: https://blog.logrocket.com/ux-design/all-accessible-touch-target-sizes/
- Robles v. Domino's settlement analysis (BOIA): https://www.boia.org/blog/the-robles-v.-dominos-settlement-and-why-it-matters
- EcomBack 2025 ADA Lawsuit Annual Report (3,948 suits, widget/FTC-accessiBe findings): https://www.ecomback.com/annual-2025-ada-website-accessibility-lawsuit-report
- UsableNet lawsuit tracker & EAA trends: https://info.usablenet.com/ada-website-compliance-lawsuit-tracker ; https://blog.usablenet.com/why-eaa-compliance-and-legal-trends-are-shaping-accessibility-in-2025
- Section508.gov — Alternative text authoring: https://www.section508.gov/create/alternative-text/
- NEI/NIH — Types of Color Vision Deficiency: https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/color-blindness/types-color-vision-deficiency
- Colour Blind Awareness — Types of colour blindness (8% men / 0.5% women): https://www.colourblindawareness.org/colour-blindness/types-of-colour-blindness/
- W3C WAI — Images tutorial (decorative images, tips): https://www.w3.org/WAI/tutorials/images/
- 3Play Media — captions/transcripts SEO & engagement research: https://www.3playmedia.com/blog/7-ways-video-transcripts-captions-improve-seo/ ; Verizon Media/Publicis caption study: https://www.3playmedia.com/blog/verizon-media-and-publicis-media-find-viewers-want-captions/
- Siteimprove — Plain language, readability and WCAG: https://www.siteimprove.com/blog/readability-plain-language-wcag/
- Sketchplanations — The curb-cut effect: https://sketchplanations.com/the-curb-cut-effect ; UX Collective on curb cuts: https://uxdesign.cc/the-curb-cut-effect-universal-design-b4e3d7da73f5
- Angela Glover Blackwell, "The Curb-Cut Effect," Stanford Social Innovation Review (2017): https://ssir.org/articles/entry/the_curb_cut_effect
- IxDF — Inclusive Design / Color Blindness topics: https://ixdf.org/literature/topics/inclusive-design ; https://ixdf.org/literature/topics/color-blindness
- UX Design Institute — Accessible vs inclusive vs universal design: https://www.uxdesigninstitute.com/blog/accessible_design-inclusive_design/
- Deque — axe DevTools & automated coverage limits: https://www.deque.com/axe/devtools/ ; automated-vs-manual coverage comparisons: https://inclly.com/resources/accessibility-testing-tools-comparison
- MDN — ARIA overview ("no ARIA is better than bad ARIA"): https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA
- Accessible.org — WCAG AA plain-English guide (55 criteria, AA as legal reference): https://accessible.org/wcag-2-1-aa-guide-for-beginners-or-experts-plain-english/
- BeAccessible — 2026 accessibility statistics roundup: https://beaccessible.com/post/web-accessibility-statistics/
