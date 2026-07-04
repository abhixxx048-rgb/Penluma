# Chapter 8 Research Notes — Designing Digital Products: Websites, Apps, Dashboards, Landing Pages, E-commerce

Research compiled 2026-07-04 from primary/expert sources (Nielsen Norman Group, Baymard Institute, Apple HIG, Material Design, Unbounce, CXL, Smashing Magazine, published conversion studies). These notes are the sole source for the chapter writer — everything important is included.

---

## 0. The Big Idea of This Chapter

UX principles (hierarchy, feedback, cognitive load, Fitts's Law, etc.) are universal, but **how you apply them depends on the surface**. A marketing website optimizes for orientation and trust; a SaaS dashboard optimizes for repeated efficient use; a mobile app optimizes for one thumb; a landing page optimizes for a single conversion; an e-commerce site optimizes for confidence at every step toward checkout. The same designer must switch mental models between these surfaces. A useful framing for the chapter: **each surface has (1) a dominant user goal, (2) a dominant context of use, and (3) a signature set of failure modes.**

Quick diagnostic that works on every surface — the **five-second test**: put someone unfamiliar in front of the screen and ask them to identify the most important thing on it. If they can't within five seconds, that's the first thing to fix (widely used in dashboard/landing-page practice, popularized via UsabilityHub/Lyssna and the Pencil & Paper dashboard guides).

---

## 1. Websites (Marketing / Content Sites)

### 1.1 Navigation patterns
- **Visible top navigation** (horizontal nav bar): best default for sites with ≤ 7 top-level sections. Always discoverable; costs vertical space.
- **Mega menus** (NN/G): large 2-D dropdown panels that group second-level links with headings, typography, sometimes imagery. Best for large/complex sites (retail, universities, enterprises) because users can scan many options at a glance without deep click-paths. Rules: open on click or after a short hover delay (~0.5s), group links under scannable headings, keep everything visible without scrolling inside the panel.
- **Hamburger menus / hidden navigation** — the key NN/G finding (2016 study, desktop + mobile): **hiding main navigation cuts discoverability roughly in half**, increases time-on-task, and increases perceived task difficulty. "Out of sight is out of mind" — users forget hidden menus exist. On desktop, hidden navigation is almost never justified. On mobile it's a tolerable trade-off for browse-mostly sites, but the NN/G-recommended pattern is **hybrid navigation**: expose the 3–5 most important items visibly (e.g., a partial tab bar) and tuck secondary links behind the hamburger.
- **Navigation hub pattern** (NN/G mobile primer): homepage as the hub users return to; only works for task-based sites where a session has one goal (e.g., airline: book OR check in).
- Other essentials: breadcrumbs for deep hierarchies (cheap, never hurt); footer as a "sitemap of last resort"; search prominent on content-heavy sites; current-location indicator ("you are here") in nav.
- **Information scent** (Peter Pirolli / Jared Spool's "trigger words"): link labels must match the words in users' heads. Users follow the strongest-smelling link; vague labels ("Solutions," "Resources") kill scent. Test labels with tree testing / card sorting.

### 1.2 Homepage clarity
- Jakob Nielsen published **113 homepage usability guidelines** (book: *Homepage Usability*, with Marie Tahir). The **most violated guideline**: failing to state what the site offers and how it differs from competitors — i.e., no clear value proposition. A homepage must answer in seconds: *What is this? What can I do here? Why here and not elsewhere?*
- First impressions are near-instant: Google research (Lindgaard et al. 2006; Tuch et al. 2012) shows users form aesthetic judgments of a page in **~50 milliseconds**, and those judgments color everything after (halo effect / aesthetic-usability effect).
- **Tagline rule**: a clear, benefit-oriented tagline near the logo beats clever/abstract slogans. NN/G: users should be able to identify the site's purpose without scrolling.
- **Auto-forwarding carousels/sliders** (NN/G "Auto-Forwarding Carousels Annoy Users and Reduce Visibility"): items in rotating carousels are routinely missed; movement frustrates users, hurts accessibility, and slide 1 gets nearly all clicks (industry data commonly cited: ~1% of visitors click a carousel at all, and ~85–90% of those clicks are slide 1 — Erik Runyon's nd.edu data). Rule of thumb: a static hero with one message beats a carousel with five.
- **Banner blindness** (NN/G, replicated over 10+ years of eyetracking, desktop and mobile): users have learned to ignore anything that looks like an ad — banner-shaped boxes, garish formatting, right-rail content ("right-rail blindness"). Corollary from NN/G's "Fancy Formatting Looks Like an Ad": if you style important content like a promotion (big colored box, starbursts), roughly a third of users never see it. Design important content to look like content.

### 1.3 Above the fold
- NN/G "Scrolling and Attention" (57,453 eyetracking fixations, 2018 update): **~57% of viewing time is spent above the fold; ~74% within the first two screenfuls**. Elements just above the fold get **102% more views** than the 100px just below it. Earlier 2010 study: 80% of time above the fold — users scroll more now, but the drop-off at the fold persists.
- NN/G "The Fold Manifesto": the fold still matters. What appears above the fold determines *whether* users scroll: the top screen must (a) show the highest-priority content and (b) signal that scrolling is worthwhile (avoid the **illusion of completeness** — layouts that look "done" at the fold, e.g., a full-width image ending exactly at the viewport edge, stop scrolling dead).
- **F-pattern scanning** (NN/G eyetracking): on text-heavy pages users scan across the top, shorter sweep lower down, then down the left edge. Implication: front-load headings and paragraphs with information-carrying words; left-align key content. (F-pattern is a symptom of poor formatting — good subheads/bullets break it.)
- Common website mistakes (summary list): no value proposition above the fold; hidden desktop navigation; auto-rotating carousels; vague nav labels with no information scent; content styled like ads; orphan pages with no path back; low-contrast text; treating the homepage as a dumping ground for every department (internal politics visible in the nav).

---

## 2. Web Apps & SaaS Dashboards

### 2.1 Dashboard types & data density
- NN/G/industry taxonomy: **operational dashboards** (real-time monitoring, time-sensitive decisions — favor higher density, minimal navigation, glanceable status), **analytical dashboards** (historical data, exploration, comparisons — favor drill-down and filtering), **strategic/executive dashboards** (few KPIs, lots of white space, trend direction over precision).
- Density is a dial, not a virtue or vice: Tufte's **data-ink ratio** (maximize ink spent on data, delete chartjunk) and his "data density" argument push toward richness; cognitive-load research pushes toward focus. Resolution: match density to user expertise and visit frequency. Daily expert users (traders, ops engineers) want dense screens (Bloomberg terminal is *good* design for its users); occasional users need progressive disclosure.
- Rule of thumb (Few, *Information Dashboard Design*): a true dashboard fits on **one screen** — if users must scroll or click to get the core picture, it's a report, not a dashboard. Put the single most important number top-left (scan origin in LTR languages).
- Layout heuristics from practice (Pencil & Paper, Stephen Few): 5–9 widgets max per view; group related metrics; consistent time ranges across charts (a dashboard mixing "last 7 days" and "this quarter" per widget silently lies); always show comparison context (vs. prior period, vs. target) because a lone number is meaningless.

### 2.2 Progressive disclosure
- Coined/formalized by **Jakob Nielsen (1995/2006, NN/G)**: show only the most frequently needed options initially; defer advanced/rare features to secondary screens ("Advanced options," expanders, drill-downs). Benefits: easier learning, fewer errors, serves novices and experts simultaneously.
- Nielsen's two conditions for doing it right: (1) the initial display must contain everything *frequently* needed — if you hide common features you've just relocated complexity; (2) it must be obvious how to get to the rest (clear affordance/labeling).
- Variant: **staged disclosure** (wizards — linear steps) vs. progressive disclosure (user-initiated depth).
- Impact numbers circulating in credible 2025–2026 practitioner literature: products using progressive disclosure in onboarding report **~35% fewer support tickets** (Hotjar research cited via Lollypop/UXPin), and limiting steps to 3–4 choices reduces completion time 20–40%. Treat these as directional, not gospel.

### 2.3 Empty states
- The empty state is the **first screen most new users actually see** — designing only the "full of data" state is a classic Dribbble-driven mistake.
- Anatomy of a good empty state: (1) explain what will live here, (2) explain why it's valuable, (3) give ONE clear action to fill it (CTA: "Create your first project," "Import contacts," "Connect your store"), optionally (4) offer sample/demo data so the product demonstrates itself.
- Three kinds to design separately: **first-use** (onboarding moment), **cleared/zero-results** (e.g., empty search — suggest fixes, loosen filters), **error/permission** states.
- Stakes: 2025 SaaS research (SaaS Factor / product-growth literature) reports ~**84% of users who hit a blank state with no contextual help abandon within the first session**, and well-designed empty states can lift activation dramatically (from the 25–30% norm toward 40%+). Median SaaS activation rate ≈ **37.5%** (2025 benchmarks). Directional but consistent across sources: the empty state IS the activation trigger.

### 2.4 Onboarding
- Goal: get users to the **"aha moment" / activation event** (the action correlated with retention — Facebook's famous "7 friends in 10 days" internal heuristic; Slack's 2,000 messages sent per team) as fast as possible. Onboarding is not a tour; it's a shortest-path to first value.
- Patterns (Appcues taxonomy): welcome survey/personalization (personalized flows lift activation 30–50%, Reforge-cited), product tours (keep ≤ 3–5 steps; skippable), checklists (exploit the Zeigarnik effect / goal-gradient — pre-check one completed item), tooltips/hotspots contextual to the moment, empty-state-driven onboarding (best), and "do it for them" defaults (templates, sample data).
- Retention cliff: users who don't engage within the **first 3 days** have ~90% chance of churning (UXCam/product-analytics benchmarks). Time-to-value is the metric to minimize.
- Anti-patterns: 12-step forced tours before users can touch anything; asking for configuration users can't answer yet; front-loading permission requests (notifications on first launch = reflexive "Deny").

### 2.5 Tables and charts
- NN/G "Data Tables: Four Major User Tasks": tables must support (1) finding records matching criteria, (2) comparing records, (3) viewing/editing/adding a single record, (4) taking actions on records (often bulk). Design for whichever dominate.
- Table best practices (NN/G, Pencil & Paper, Stéphanie Walter's enterprise-table corpus):
  - Right-align numbers, use tabular (monospaced) figures, consistent decimals; left-align text; align headers with content.
  - Sortable columns with a visible sort indicator; sticky/fixed header row on scroll; fixed first column for wide tables.
  - Filters + search above the table; show applied filters as removable chips; show result count.
  - Row density options (compact/comfortable) for expert vs. casual users; zebra striping or ample row spacing for horizontal tracking.
  - Progressive disclosure inside tables: expandable rows or a detail side panel rather than 25 columns.
  - Pagination vs. infinite scroll: pagination for task-driven tables (users need location and stable footing); infinite scroll only for casual browsing feeds.
  - Bulk actions: checkbox column + persistent action bar showing "N selected."
- Charts: choose form by task — trend over time → line; comparison across categories → bar (start bars at zero); part-to-whole → stacked bar (pie only for 2–3 slices); correlation → scatter. Label directly instead of legends where possible; avoid dual y-axes (they invite false correlation); avoid 3-D anything. Every chart needs a title stating the takeaway, not just the metric name ("Churn doubled after March pricing change" beats "Churn rate").
- Common dashboard/web-app mistakes: vanity-metric walls with no actionability; every widget a different time range; pie-chart abuse; no empty/loading/error states designed; settings scattered; exposing the database schema as the UI (naming fields after internal jargon); no keyboard shortcuts or bulk actions for daily users.

---

## 3. Mobile Apps

### 3.1 Thumb zones & touch targets
- **Steven Hoober's research** (2013, *Designing for Touch* / UXmatters; observed 1,333 people using phones): **49% hold with one hand**, ~36% cradle, ~15% two-handed; **~75% of interactions are thumb-driven**. His thumb-reach maps define the classic zones: **natural/easy zone** (bottom-center arc), **stretch zone** (edges/middle), **hard zone** (top corners — especially top-left for right-handed one-hand grip).
- Design consequence: put primary, frequent actions at the **bottom** (tab bars, FABs, primary buttons); put destructive or rare actions in the hard-to-reach top (a feature, not a bug — distance protects against accidents). Smashing Magazine's "The Thumb Zone" (Samantha Ingram, 2016) is the canonical practitioner article.
- Screens have grown (6.1–6.9"), making the top of the screen *less* reachable than ever — hence iOS Reachability, Android one-handed mode, and the industry-wide migration of navigation and search bars to the bottom (e.g., Safari's bottom address bar, iOS 15+).
- **Touch target sizes**: Apple HIG minimum **44×44 pt**; Material Design minimum **48×48 dp** (~9mm) with ≥ 8dp spacing between targets; WCAG 2.2 (SC 2.5.8, AA) minimum **24×24 CSS px**, with 44px as the AAA-level guidance (SC 2.5.5). MIT Touch Lab: average adult fingertip pad ≈ 10×14mm, fingertip ≈ 8–10mm — hence the ~7–10mm target consensus. Visual size can be smaller than the hit area — pad the hit area.

### 3.2 iOS vs Android conventions
- **Navigation**: iOS = bottom **tab bar**, 3–5 tabs max, back via top-left back button + edge-swipe gesture. Android/Material = **bottom navigation bar** (3–5 destinations) plus a system-level Back affordance (gesture/button) that works everywhere; navigation drawer (hamburger) for many destinations, though Material now prefers bottom nav for top destinations.
- **Design language**: Apple HIG principles = clarity, deference (UI defers to content), depth (layering, translucency/blur; 2025's "Liquid Glass" refresh continues this). Material Design 3 = "paper and ink" metaphor, elevation/shadows, bold color, **dynamic color** (theme derived from user wallpaper), design tokens, larger expressive type.
- Component/convention differences that trip up beginners: system fonts (SF Pro vs Roboto/Google Sans); title alignment (iOS centered / large-title left; Android left); action sheets vs bottom sheets; switches and pickers look/behave differently; date pickers; iOS swipe-from-left-edge = back, Android back gesture from either edge; share icons differ; settings placement conventions differ.
- Rule of thumb: **respect platform conventions for navigation, gestures, and system components; keep brand identity in color, type, illustration, and content**. A pixel-identical cross-platform app usually feels wrong on both platforms. (Cross-platform design systems like Flutter/React Native make platform-adaptive components a deliberate choice.)

### 3.3 Bottom navigation rules
- 3–5 destinations; icons + labels (icon-only nav fails recognition tests — NN/G: label everything); the active tab must be visually obvious; tabs switch views, never act as buttons; don't hide the tab bar on scroll for core destinations; badge counts sparingly.

### 3.4 Common mobile mistakes
- Touch targets < 44pt and crowded (fat-finger errors); primary actions in top corners; hamburger-only navigation for a 4-section app; asking for notification/location permissions at first launch with no context (prime with a pre-permission explainer screen instead); requiring account creation before showing value; ignoring platform back behavior on Android (breaking the back button is a one-star-review generator); text below 16px triggering iOS zoom in web forms; carousels for critical content; no offline/poor-network states.

---

## 4. Landing Pages

### 4.1 One page, one goal
- Defining property of a landing page: it exists for **one conversion action**. Unbounce's long-standing **Attention Ratio** concept: links on the page ÷ conversion goals should approach **1:1**. Their data: pages focused on a single CTA convert ~**13.5%** on average vs ~**10.5%** for pages with 5+ links; removing the site navigation from landing pages lifts conversion (pages with nav convert **10–15% lower** than nav-free equivalents).
- Message match: headline and imagery must match the ad/email that sent the visitor (scent continuity). Mismatch = instant bounce and wasted ad spend (also hurts Google Ads Quality Score).

### 4.2 Hero clarity & headline formulas
- Visitors decide relevance within **~5–20 seconds** (classic NN/G: you have ~10 seconds to communicate value; 2026 practitioner consensus says effectively ~5). Most of that judgment forms from the hero alone.
- Above-the-fold hero checklist: **headline** (the #1 conversion lever), supporting subheadline, **hero shot** (image/video showing the product in use or the outcome — context-of-use beats abstract stock art), primary CTA, and one trust signal (logo bar, rating, count).
- Headline evidence: benefit-led headlines outperform feature-led by ~**27%**; adding a concrete number (%, $, time saved) adds ~**15%** more (2026 aggregate landing-page test data, digitalapplied/seosherpa compilations — directional). The four highest-variance test elements, in order: **headline, hero image, primary CTA, form** (tests on these produce significant winners ~24% of the time, ~2× the base rate).
- Classic headline formulas to teach: value proposition ("The fastest way to X without Y"), outcome + timeframe ("Launch a store in 10 minutes"), question that names the pain, social-proof-led ("Join 40,000 teams who…"), and the "so what?" test — keep asking until the benefit is human.
- Clarity beats cleverness — the most replicated finding in conversion copy (CXL, MarketingExperiments). Puns and abstractions lose to plain statements of value.

### 4.3 CTA design
- One primary CTA action per page; repeat the same action at intervals (after hero, after value section, after social proof, at end) rather than adding different actions.
- Button copy: first person + specific value ("Get my free report" — Unbounce's classic test: changing "your" to "my" lifted clicks **90%**; ContentVerve/Michael Aagaard's original study). Avoid "Submit."
- Visual: high contrast against surroundings (contrast matters more than hue — the "big orange button" works because of isolation/Von Restorff effect, not orange); size and whitespace signal importance; support with a **click trigger** microcopy line under the button ("Free 14-day trial · No credit card required") to defuse the biggest anxiety at the moment of decision.
- Directional cues (arrows, gaze direction of photographed people toward the CTA/form) measurably shift attention in eyetracking (CXL studies).

### 4.4 Conversion research method (teach the process, not just tips)
- Serious CRO is research-first: analytics funnel analysis → session recordings/heatmaps (Hotjar-style) → user surveys & exit polls ("What almost stopped you from signing up today?") → customer interviews for voice-of-customer copy → then A/B testing hypotheses (needs enough traffic for statistical significance; underpowered tests are the #1 CRO sin). Frameworks: LIFT model (value proposition ± clarity, relevance, urgency, anxiety, distraction), PXL prioritization (CXL).
- Social proof hierarchy: specific testimonials with names/faces/numbers > logo walls > vague praise. Numbers ("4.8★ from 2,341 reviews") beat adjectives.
- Common landing-page mistakes: multiple competing CTAs; navigation bar leaking traffic; headline about the company instead of the visitor's problem; generic stock-photo hero; asking for 11 form fields for an ebook; no message match with the ad; testimonials that are obviously fabricated ("This changed my life! — J.S."); burying price when price is the visitor's first question.

---

## 5. E-commerce

### 5.1 The stakes (Baymard Institute — the field's authoritative research body; 150,000+ hours of large-scale UX testing, 650+ guidelines, benchmarks of 300+ top-grossing sites)
- Average documented **cart abandonment rate: ~70.2%** (Baymard meta-average of 50 studies, 2025–26). Mobile ≈ **80%** vs desktop ≈ 66%.
- **Reasons for abandonment** (Baymard survey, excluding the ~43% "just browsing"): extra costs too high (shipping/tax/fees) **39%**; delivery too slow **21%**; didn't trust site with card info **19%**; **site required account creation 19%** (older widely-cited figure: 26%); checkout too long/complicated **18%**; unsatisfactory returns policy **15%**; site errors/crashes **15%**; couldn't see total cost up front **14%**; insufficient payment methods **10%**; card declined **8%**.
- The prize: Baymard estimates a **35.26% average conversion lift** is achievable for large sites purely through better checkout design — **~$260B of recoverable orders** in US+EU alone.

### 5.2 Product listing pages & filtering (Baymard product-lists research: 700+ usability problems found even on multi-million-dollar sites; 93 guidelines)
- Sites with mediocre product-list UX see **67–90% list abandonment** vs 17–33% for slightly optimized toolsets — up to a **4× difference**.
- Key guidelines: provide filters for every attribute shown on list items (38% of sites don't); show applied filters persistently as removable chips at the top (42% fail); category-specific filters (size, sleeve length, wattage), not just generic ones; faceted search results should surface product-specific filters automatically; truncate long filter-option lists gracefully (32% handle badly); avoid **over-categorization** — product attributes wrongly implemented as categories instead of filters (54% of sites).
- List items need enough info to compare without pogo-sticking: image, name, price, rating + count, key variations (color swatches).

### 5.3 Product page anatomy (Baymard: **82% of e-commerce sites have "mediocre or worse" product-page UX**; benchmark of 30,000+ page scores)
- Core anatomy: image gallery; title; price (+ any discount math shown explicitly); variation selectors; add-to-cart button (high-contrast, above the fold); shipping cost + delivery date estimate near the buy button; stock status; returns summary; description; specs; reviews; Q&A; cross-sells.
- **Images**: users need **~5–8 images per product** covering Baymard's **7 image types**: cut-out (clean product shot), in-scale (product next to a reference so size is judgeable), lifestyle/in-context, feature call-outs, detail/texture zoom, compatibility, and packaging/what's-in-the-box. 52% of sites lack descriptive text/graphics overlays on images where needed. Supporting stats: 56% of shoppers go straight to images on arrival; high-quality photos ≈ **94% higher conversion** vs low-quality (industry studies); 360° views can lift add-to-cart ~22%.
- **Reviews**: display average + count near the title; allow filtering/sorting reviews; show distribution histogram; include reviewer photos (65% of shoppers prefer reviews with customer images). Conversion evidence: products with even 5 reviews are ~**270% more likely to be purchased** than zero-review products (Spiegel Research Center, Northwestern); 50+ reviews ≈ 4.6× conversion; **negative reviews help** — a 4.2–4.5 average converts better than a suspicious 5.0 (Spiegel: purchase likelihood peaks around 4.0–4.7).
- **Pricing display**: never make users hunt; show total-cost signals early (shipping calculator or "free shipping over $X" on the product page — surprise fees are the #1 abandonment cause at 39%); show strikethrough original price + % off for discounts; unit pricing where relevant; for subscriptions, show renewal terms plainly (dark-pattern territory otherwise).

### 5.4 Checkout best practices (Baymard checkout research)
- **Offer guest checkout, prominently** — forced account creation drives 19–26% of abandonment. Best pattern: complete purchase as guest, then offer account creation on the confirmation page (they only need to add a password — everything else is already captured).
- **Cut fields ruthlessly**: average US checkout has **23.48 form elements**; the ideal is **12–14 elements (7–8 actual fields)**. Techniques: single "Full name" field; hide "Address line 2" and "Company" behind links; billing = shipping by default (pre-checked); ZIP→city/state auto-fill; address autocomplete (Google Places-style).
- Show a **progress indicator**; keep users in the checkout tunnel (strip distracting nav); persistent order summary with itemized total including shipping + tax as early as possible.
- Payment: card fields formatted with spacing-as-you-type; clearly explain CVV with a graphic; wallets (Apple Pay / Google Pay / PayPal / Shop Pay) dramatically shorten mobile checkout; trust signals near the card fields (padlock, "encrypted") measurably reduce the 19% trust-based abandonment.
- Error handling: never wipe entered data on error; inline validation; specific messages.
- **The Expedia case study** (teachable classic): removing a single optional "Company" field from the booking form added **$12M/year in profit** — users were entering their bank's name and then the bank's address, causing failed card verifications. Lesson: every field is a liability; optional fields cause errors too.
- Amazon's 1-Click patent (1999–2017) as a mini case: eliminating checkout steps was worth billions; the patent's expiry is why one-tap wallets are now everywhere.

### 5.5 Common e-commerce mistakes
Hidden shipping costs until the last step; forced registration; too many fields; no address autocomplete; coupon-code box that sends users off-site hunting (mitigate: hide behind a link, or show applicable promos inline); poor product images (few, small, no zoom, no context); specs instead of benefits in descriptions; reviews absent or unfilterable; out-of-stock discovered only at checkout; mobile checkout not optimized (80% mobile abandonment); no order-confirmation clarity.

---

## 6. Forms & Surveys (cross-cutting; the conversion chokepoint of every surface)

### 6.1 Field reduction
- The single highest-leverage form intervention: **remove fields**. Every field adds friction and error surface (Expedia case above). Ask: do we need this now, at all, or can we get it later ("progressive profiling")? Never ask for information you won't use.
- Optional fields: either cut them or mark clearly. Current best practice (NN/G, Jakob Nielsen's later writing): when most fields are required, mark the *optional* ones "(optional)"; the red asterisk is acceptable but must be explained. Don't rely on placeholder text as the only label.

### 6.2 Labels & layout
- **Top-aligned labels** outperform left-aligned for completion speed (Matteo Penzo's 2006 eyetracking study — the canonical citation; single eye fixation captures label+field). Left-aligned labels are acceptable when scanning/reviewing values matters more than speed.
- **Placeholder-only labels are an anti-pattern** (NN/G "Placeholders in Form Fields Are Harmful"): the label disappears on focus, users forget what the field was, recall errors rise, accessibility breaks. Use persistent labels (or float labels as a compromise).
- Single-column layout beats multi-column (CXL/Baymard: multi-column forms get misread as separate sections and fields get skipped). Field width should hint at expected content length (ZIP field shorter than address).
- WebAIM Million 2025: **34.2% of form inputs on the top million sites lack proper labels** — an accessibility failure at massive scale; associate every input with a `<label>`.
- Match input types to the job: appropriate mobile keyboards (numeric for phone/card), autocomplete attributes, radio buttons for ≤5 visible options instead of dropdowns, steppers for small numeric ranges.

### 6.3 Validation & error messages
- **Inline validation** (validate on blur/completion, not on every keystroke, and never *before* the user has finished typing — "premature" red errors while typing are hostile): the classic Luke Wroblewski / Etre study found **22% higher success rates, 42% faster completion (some measures), 31% higher satisfaction** vs submit-then-error. Baymard's testing agrees with the caveat: validate *positively* too (checkmarks), and re-validate rewrites.
- **NN/G's 10 error-message guidelines** (condensed): the error must be (1) noticeable — color + icon + text, never color alone; (2) next to the offending field, not only a summary at top; (3) preserve the user's input; (4) written in plain human language — no codes; (5) constructive: say what went wrong AND how to fix it ("Phone numbers must have 10 digits" not "Invalid input"); (6) polite, never blaming ("we couldn't find…" not "you entered an illegal…"); (7) for screen-reader users, announced programmatically (aria-live / focus management).
- Forgiving formatting: accept phone numbers with/without dashes, spaces in card numbers, trim whitespace — parse, don't punish.

### 6.4 Multi-step vs single-step
- **Long/complex forms convert better broken into steps** (Zuko's form-analytics data; HubSpot-reported ~86% higher conversion for multi-step; mobile multi-step completion up to ~63% higher — directional vendor numbers, but the pattern is robust). Why: lower perceived effort per screen, early commitment (sunk-cost/foot-in-the-door — ask easy questions first, email early so you can recover abandons), progress indicators exploit goal-gradient.
- But: for genuinely short forms (≤ ~6 fields), a single page is faster and outperformed multi-step in a controlled healthcare usability study (JMIR 2021). Rule of thumb: **< 6–8 fields → one page; more, or logically distinct sections → steps with a progress bar**; never hide total length (a deceptive "Step 1 of ?" breeds abandonment).
- Surveys specifically: one question per screen works well on mobile (Typeform pattern); state length honestly ("3 minutes, 8 questions"); put demographics last; avoid double-barreled questions; required-everything surveys get garbage data or abandonment.

### 6.5 Common form mistakes (rapid list)
Placeholder-as-label; asking for the same info twice; premature validation while typing; wiping data on error; generic "An error occurred"; multi-column layouts; dropdowns for 2 options (use radios) or for 200 options (use autocomplete); no mobile-appropriate keyboards; disabling paste in password/confirm fields; CAPTCHA before value; "Submit" as button copy instead of stating the action's value.

---

## 7. Cross-Surface Synthesis (good chapter closer)

1. **Every surface has one job** — name it, then delete whatever competes with it (attention ratio thinking applies beyond landing pages).
2. **The first screen carries most of the weight**: 50ms aesthetic judgment, ~57% of attention above the fold, 5-second comprehension test, empty state = activation trigger, hero = conversion trigger.
3. **Friction is measurable and cumulative**: every hidden nav item halves discoverability; every form field costs conversions; every surprise cost loses 39% of carts. Great product design is largely disciplined subtraction.
4. **Conventions are user knowledge** (Jakob's Law): follow platform and category conventions (tab bars, checkout flows, table interactions) and spend innovation budget only where you differentiate.
5. **Design the unglamorous states**: empty, loading, error, offline, out-of-stock, zero-results. Portfolios show the happy path; products live in the edge cases.

---

## Sources

- Baymard Institute — Cart Abandonment Rate Statistics: https://baymard.com/lists/cart-abandonment-rate
- Baymard Institute — Checkout Usability research hub: https://baymard.com/research/checkout-usability
- Baymard Institute — Product Page UX (82% mediocre-or-worse study): https://baymard.com/blog/product-page-usability-report-and-benchmark and https://baymard.com/research/product-page
- Baymard Institute — Product Lists & Filtering research: https://baymard.com/research/ecommerce-product-lists ; filter guideline example: https://baymard.com/blog/have-filters-for-list-item-info
- Baymard Institute — Inline form validation testing: https://baymard.com/blog/inline-form-validation
- Amazon Pay / Baymard — forced sign-ups drive down sales: https://pay.amazon.com/blog/for-businesses/the-baymard-report-series-how-forcing-sign-ups-drives-down-sales
- NN/G — Scrolling and Attention: https://www.nngroup.com/articles/scrolling-and-attention/
- NN/G — The Fold Manifesto: https://www.nngroup.com/articles/page-fold-manifesto/
- NN/G — Hamburger Menus and Hidden Navigation Hurt UX Metrics: https://www.nngroup.com/articles/hamburger-menus/
- NN/G — Basic Patterns for Mobile Navigation: https://www.nngroup.com/articles/mobile-navigation-patterns/
- NN/G — Progressive Disclosure: https://www.nngroup.com/articles/progressive-disclosure/
- NN/G — Data Tables: Four Major User Tasks: https://www.nngroup.com/articles/data-tables/
- NN/G — 113 Design Guidelines for Homepage Usability / Ten Most Violated: https://www.nngroup.com/articles/113-design-guidelines-homepage-usability/ ; https://www.nngroup.com/articles/most-violated-homepage-guidelines/
- NN/G — Banner Blindness (original + revisited): https://www.nngroup.com/articles/banner-blindness-original-eyetracking/ ; https://www.nngroup.com/articles/banner-blindness-old-and-new-findings/
- NN/G — Auto-Forwarding Carousels Annoy Users: https://www.nngroup.com/articles/auto-forwarding/
- NN/G — 10 Design Guidelines for Reporting Errors in Forms: https://www.nngroup.com/articles/errors-forms-design-guidelines/
- Smashing Magazine — The Thumb Zone (Samantha Ingram): https://www.smashingmagazine.com/2016/09/the-thumb-zone-designing-for-mobile-users/
- Steven Hoober — Designing for Touch (4ourth Mobile): https://www.4ourthmobile.com/publications/designing-for-touch
- Apple Human Interface Guidelines (touch targets, tab bars): https://developer.apple.com/design/human-interface-guidelines/
- Material Design 3 (touch targets, bottom nav, dynamic color): https://m3.material.io/
- UXPin — iOS vs Android UI design differences: https://www.uxpin.com/studio/blog/ios-vs-andoid-ui-design-for-mobile/
- Unbounce — Landing Page Best Practices / high-converting examples: https://unbounce.com/landing-page-articles/landing-page-best-practices/ ; https://unbounce.com/landing-page-examples/high-converting-landing-pages/
- Landing page statistics compilations (2026): https://www.digitalapplied.com/blog/landing-page-statistics-2026-conversion-data-points ; https://seosherpa.com/landing-page-statistics/
- CXL — Form Design Best Practices: https://cxl.com/blog/form-design-best-practices/
- Expedia $12M field-removal case: https://www.duncanjonesnz.com/case-study-expedias-12-million-a-year/
- Zuko — Single-page vs multi-step forms: https://www.zuko.io/blog/single-page-or-multi-step-form
- JMIR healthcare form usability study: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8190652/
- Pencil & Paper — Data Tables and Dashboards UX pattern guides: https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-data-tables ; https://www.pencilandpaper.io/articles/ux-pattern-analysis-data-dashboards
- Stéphanie Walter — complex data tables resources: https://stephaniewalter.design/blog/essential-resources-design-complex-data-tables/
- Appcues — Onboarding UX patterns: https://www.appcues.com/blog/user-onboarding-ui-ux-patterns
- SaaS activation / empty-state research (2025 benchmarks): https://www.saasfactor.co/blogs/empty-state-ux-turn-blank-screens-into-higher-activation-and-saas-revenue ; https://uxcam.com/blog/saas-onboarding-best-practices/
- Product image / review conversion statistics: https://www.convertcart.com/blog/ecommerce-product-page-statistics ; https://capitaloneshopping.com/research/online-reviews-statistics/ ; https://letsenhance.io/blog/all/product-image-quality/
