# Research Notes: Usability Laws, Heuristics, and Mental Models

Chapter research for the UI/UX study guide. Sources: Nielsen Norman Group (NN/g), lawsofux.com (Jon Yablonski), Baymard Institute, W3C/WCAG, Apple HIG, Material Design, original academic papers. Compiled 2026-07.

---

## 1. Why laws and heuristics matter (framing for the chapter)

- Heuristics are **broad rules of thumb**, not step-by-step checklists. Jakob Nielsen calls his 10 principles "heuristics" precisely because they are general guides that require judgment to apply.
- They give designers a **shared vocabulary and research-backed justification** for decisions ("we made the button bigger because of Fitts's law," "we killed 4 of the 9 menu options because of Hick's law") — critical when defending design choices to stakeholders.
- Jon Yablonski's *Laws of UX* (O'Reilly, 2020; lawsofux.com) curates 21+ laws into four buckets: **heuristics, principles, Gestalt laws, and cognitive biases**.
- Rule of thumb for the chapter: laws describe *human constants* (perception, memory, motor control); heuristics describe *interface qualities* that respect those constants; mental models explain *why* violations hurt.

---

## 2. Nielsen's 10 Usability Heuristics (each with violation examples)

**History:** Developed by Jakob Nielsen and Rolf Molich in 1990; refined by Nielsen in 1994 via a **factor analysis of 249 usability problems** to maximize explanatory power. The 10 have remained essentially unchanged for 30+ years. (Source: nngroup.com/articles/ten-usability-heuristics/)

### H1 — Visibility of system status
Keep users informed about what is going on through appropriate, timely feedback. Users who know the current state can learn the outcome of prior interactions and decide next steps; predictable communication builds trust.
- **Good:** progress bars, "You are here" map markers, "Saving…/Saved" indicators in Google Docs, order-tracking steps in food-delivery apps.
- **Violation:** clicking "Submit" and nothing visibly happens, so the user clicks again and double-orders; a file upload with no progress indicator; a spinner with no explanation for a 30-second process.

### H2 — Match between system and the real world
Speak the users' language; use familiar words and concepts, not internal jargon; make information appear in a natural, logical order.
- **Good:** trash can icon for delete; stovetop controls arranged to mirror burner layout (natural mapping); e-commerce "cart."
- **Violation:** error message "SQLSTATE 23000 integrity constraint violation"; a bank app saying "ACH origination failed" instead of "Your transfer didn't go through"; airline sites using "GDS fare class" codes.

### H3 — User control and freedom
Users perform actions by mistake and need a clearly marked "emergency exit" — undo, redo, cancel, back — without an extended process.
- **Good:** Gmail's "Undo send" (5–30 s window); Ctrl+Z everywhere; a visible "X" on modals; "Remove item" in carts.
- **Violation:** wizards you can't back out of without losing all input; subscription flows with no obvious cancel; modal dialogs that trap the user; "roach motel" dark patterns (easy in, hard out).

### H4 — Consistency and standards
Users should never wonder whether different words, situations, or actions mean the same thing. Two kinds: **internal consistency** (within your product/family) and **external consistency** (follow platform and industry conventions — this is where Jakob's law lives).
- **Good:** logo top-left links home; cart icon top-right; blue underlined links; consistent button styles across screens.
- **Violation:** "Delete," "Remove," and "Discard" used interchangeably for the same action in one app; a swipe gesture meaning "archive" in one screen and "delete" in another.

### H5 — Error prevention
Best designs prevent problems before they happen: eliminate error-prone conditions or check for them and offer confirmation before commitment. Prevent **high-cost errors first**.
- **Good:** guard rails metaphor (Nielsen's example); date pickers that gray out unavailable dates; Gmail's "You mentioned an attachment but didn't attach a file"; disabled submit until required fields are valid; airline seat maps that don't let you select occupied seats.
- **Violation:** free-text date fields accepting any format; "Delete account" adjacent to "Save changes" (NN/g calls this dangerous proximity of consequential and benign options); no confirmation on bulk delete.

### H6 — Recognition rather than recall
Minimize memory load by making elements, actions, and options visible. Recognizing is far easier than recalling (e.g., recognizing Lisbon as Portugal's capital vs. producing it from memory).
- **Good:** menus instead of command lines; autocomplete; recently-viewed items; showing password requirements while typing; persistent cart summaries during checkout.
- **Violation:** forcing users to remember a coupon code from a previous page; comparison flows where specs of item A vanish when viewing item B; keyboard-shortcut-only features with no menu equivalent.

### H7 — Flexibility and efficiency of use
Provide accelerators — invisible to novices — that speed experts up: shortcuts, gestures, personalization, customization.
- **Good:** keyboard shortcuts (Gmail's "e" to archive), Photoshop actions, saved payment methods, "reorder" buttons, swipe gestures alongside tap paths, browser autofill.
- **Violation:** power users forced through the same 6-step wizard for the 100th time; no bulk actions in an admin table.

### H8 — Aesthetic and minimalist design
Interfaces shouldn't contain irrelevant or rarely needed information — every extra unit of information competes with the relevant units and diminishes their relative visibility. This is about *focused content*, not flat design or whitespace fetishism.
- **Good:** Google's homepage; Stripe Checkout's single-purpose payment screen.
- **Violation:** dashboards with 40 KPIs where 3 matter; promotional banners crowding the primary task; ornate decoration that interferes with function (Nielsen's ornamented teapot example).

### H9 — Help users recognize, diagnose, and recover from errors
Error messages in plain language (no error codes), that precisely state the problem and constructively suggest a solution. Use conventional visuals (red, bold, near the field).
- **Good:** "That username is taken. Try username_2026 or pick another." Inline validation next to the offending field.
- **Violation:** "Error 402"; "Invalid input"; a form that clears all fields on error; error text at the top of a long page while the broken field is below the fold.
- NN/g publishes an **error-message scoring rubric** and guidelines: be explicit, human-readable, polite, precise, and constructive; preserve the user's work.

### H10 — Help and documentation
Ideally the system needs no explanation; when help is needed, make it searchable, contextual, concrete, and step-by-step, presented at the moment of need.
- **Good:** contextual tooltips, "?" affordances next to complex fields, in-app guided onboarding, searchable help centers.
- **Violation:** 90-page PDF manuals; help content that describes an older UI version; onboarding tours that dump 12 tips at once (violates H8 too).

### Heuristic evaluation as a method
- A heuristic evaluation = experts independently inspecting an interface against the heuristics, then aggregating findings.
- **Numbers (Nielsen & Landauer, 1993):** a single evaluator finds on average ~**34%** of usability problems (range 19–51% across six case studies); **5 evaluators find ~75–85%**; beyond 5, sharp diminishing returns. This is the famous "Nielsen curve." (nngroup.com/articles/how-to-conduct-a-heuristic-evaluation/)
- Rule of thumb: 3–5 evaluators, evaluate independently first, aggregate afterward, rate severity (frequency × impact × persistence).
- Common mistake: treating heuristic evaluation as a replacement for usability testing — it finds expert-predictable problems, not what real users actually stumble on.

---

## 3. Laws of UX (Yablonski / lawsofux.com), one by one

### Fitts's Law (Paul Fitts, 1954)
Time to acquire a target is a function of the **distance to** and **size of** the target: MT = a + b·log₂(2D/W). Big, close targets are fast; small, far ones are slow and error-prone.
- **Applications:** make touch targets large and put them near where the thumb/cursor already is; screen **edges and corners are "infinitely deep"** for cursors (you can't overshoot them — why macOS puts the menu bar at the top edge and Windows puts Start in a corner).
- **Concrete standards (memorize these):**
  - Apple HIG: minimum **44×44 pt** hit targets.
  - Material Design 3: minimum **48×48 dp** touch targets (with ≥8 dp spacing).
  - WCAG 2.2 SC 2.5.8 (Level AA): **24×24 CSS px** minimum; WCAG 2.1 SC 2.5.5 (Level AAA): **44×44 CSS px**.
- **Violations:** tiny "×" close buttons on mobile ads (often deliberately — a dark pattern); "Delete" placed 2 px from "Reply"; links jammed together in footers.
- Related rule: put related actions near each other, but keep **destructive actions physically distant** from safe ones (NN/g "dangerous proximity" article).

### Hick's Law (William Hick 1952, Ray Hyman 1953 — "Hick–Hyman law")
Decision time increases logarithmically with the number and complexity of choices: RT = a + b·log₂(n+1). The log₂ comes from information theory; +1 accounts for the "no response" option.
- **Applications:** trim menu options; progressive disclosure (show advanced options only on demand); break long forms into steps; highlight a recommended option; smart defaults.
- **Caveats:** applies to *simple, ordered* decisions; doesn't mean "dumb everything down" — experts sometimes need dense choice sets. Don't oversimplify to the point of removing needed capability (that collides with Tesler's law).
- **Violations:** 50-item mega-menus with no grouping; settings screens that list 80 toggles alphabetically; onboarding asking 10 preference questions up front.
- Related: **choice overload / "paradox of choice"** — the often-cited Iyengar & Lepper jam study (24 vs 6 jams: more browsing but ~10× fewer purchases with 24) is a classic companion citation.

### Jakob's Law (Jakob Nielsen, 2000)
"Users spend most of their time on **other** sites, so they expect your site to work like all the other sites they already know." Formulated in *Designing Web Usability* (2000).
- Users spend roughly **95–99% of their time elsewhere**, so their mental models are built from prevalent patterns, not your innovations.
- **Applications:** conventional placement (logo → home, top-right cart, hamburger menu behavior), standard checkout flows, platform-native controls.
- **Rule of thumb:** innovate on your *value*, be boring about your *conventions*. When you must change a familiar pattern, offer a transition (e.g., let users keep the old version temporarily — YouTube's redesign opt-outs).
- **Violation example:** Snapchat's 2018 redesign relocating core actions — mass user backlash and a petition with >1.2M signatures is the standard cautionary tale.

### Miller's Law (George A. Miller, 1956)
"The Magical Number Seven, Plus or Minus Two" (*Psychological Review* 63(2), 81–97): average person holds ~**7±2 chunks** in working memory.
- The real, durable takeaway is **chunking**: meaningful grouping expands effective capacity. Phone numbers (555-867-5309), credit-card fields grouped in 4s, grouping nav items into labeled categories.
- **Common misuse (call this out):** "menus must have ≤7 items" is a myth — navigation is recognition, not recall, so Miller's law doesn't cap visible menu length. It applies where users must *hold* information in their head between steps.
- Modern research (Cowan, 2001) suggests working memory is closer to **4±1 chunks** — worth citing as nuance.

### Tesler's Law — Law of Conservation of Complexity (Larry Tesler, Xerox PARC, mid-1980s)
Every application has an inherent amount of **irreducible complexity**; the only question is who deals with it — the user, the app developer, or the platform.
- Tesler's argument: push complexity onto engineers, not users. His quote: "If a million users each waste a minute a day dealing with complexity that an engineer could have eliminated in a week… you are penalizing the user to make the engineer's job easier."
- **Examples:** email needs From/To — good clients prefill "From" and autocomplete "To" (complexity absorbed by software); address autocomplete; auto-detecting card type from the number; Apple Pay collapsing checkout complexity.
- **Design tension:** simplifying an interface beyond the irreducible core doesn't remove complexity, it just relocates it (often into user confusion or support tickets). Beware "simplicity theater."

### Doherty Threshold (Walter J. Doherty & Ahrvind J. Thadani, IBM Systems Journal, 1982)
Productivity soars when computer and user interact at a pace (<**400 ms**) where neither waits on the other. Replaced the previous 2-second standard.
- Findings: sub-400 ms systems produced **25–30% more transactions/hour** and higher satisfaction; productivity improves *more than proportionally* as response time drops.
- Pair with **Nielsen's three response-time limits** (nngroup.com/articles/response-times-3-important-limits/, rooted in ~40-year-old human-factors research):
  - **0.1 s** — feels instantaneous; no feedback needed.
  - **1.0 s** — flow of thought stays intact, delay noticed; show a cursor/spinner beyond this.
  - **10 s** — attention limit; beyond this needs a percent-done indicator and a way to cancel.
- **Techniques when you can't be fast:** optimistic UI (show success immediately, reconcile later — e.g., liking a post), skeleton screens, perceived-performance animation, progress bars that never appear to stall. Deliberately *slowing down* can build trust for "work being done" (e.g., security-scan or itinerary-search animations).

### Aesthetic-Usability Effect
Users perceive aesthetically pleasing design as more usable — and are more tolerant of minor usability flaws in beautiful products.
- **Landmark study:** Masaaki Kurosu & Kaori Kashimura, Hitachi Design Center, 1995 — **26 ATM UI variations, 252 participants**. Correlation between aesthetic appeal and *perceived* ease of use was much stronger (r ≈ 0.59) than with *actual* ease of use. Replicated cross-culturally by Noam Tractinsky (1997) in Israel — effect held, even stronger.
- **Implications:** visual polish buys forgiveness and trust; but it can **mask usability problems in research** — NN/g warns that participants praising a pretty prototype may fail tasks in it. Watch what testers *do*, not just what they say.
- **Limit:** the effect covers *minor* issues only; serious blockers overwhelm aesthetics.

### Peak-End Rule (Daniel Kahneman, Barbara Fredrickson et al.)
People judge an experience by its **most intense moment (peak)** and its **end**, not the average or sum of every moment ("duration neglect").
- **Studies:** Kahneman & Redelmeier 1996 colonoscopy study — patients rated the whole procedure by worst + final moments; a follow-up that added 3 extra *milder* minutes at the end made patients rate the longer procedure as *less* unpleasant. Cold-water experiment: 60 s at 14 °C vs 60 s + extra 30 s at slightly warmer 15 °C — subjects preferred to repeat the objectively-longer trial.
- **UX applications:** engineer the peak (Mailchimp's high-five after sending a campaign; Duolingo's celebration animations) and stick the ending (order-confirmation pages that delight, smooth offboarding, generous cancellation flows). Audit journeys for negative peaks (payment failures, error walls) — they dominate memory. Even a good product with a hostile cancellation flow leaves a bad final memory (and bad word of mouth).

### Von Restorff Effect / Isolation Effect (Hedwig von Restorff, 1933)
Among multiple similar items, the one that **differs** is most likely to be remembered.
- **Applications:** one visually distinct primary CTA per screen; "Most popular" highlighted pricing tier; destructive actions in red among neutral buttons; badge/notification dots.
- **Cautions:** if everything is highlighted, nothing is (competing accents cancel out); don't rely on **color alone** — WCAG 1.4.1 requires non-color cues for accessibility (color-blind users, ~8% of men); excessive contrast for ads trained users into "banner blindness."

### Zeigarnik Effect (Bluma Zeigarnik, 1927)
Incomplete or interrupted tasks are remembered better than completed ones.
- **Origin:** Zeigarnik and Kurt Lewin observed a waiter who perfectly recalled unpaid orders but forgot them after payment. Her experiments (15–22 tasks per participant) found interrupted tasks recalled ~**90% better** than completed ones.
- **Applications:** LinkedIn's "profile completeness" meter (classic case study — profile completion jumped after adding progress prompts); progress bars in onboarding checklists; "resume watching" rows in Netflix; Duolingo streaks + unfinished lesson nudges; abandoned-cart emails.
- **Companion:** **Goal-Gradient Effect** — motivation accelerates near completion (Hull, 1932; the coffee-card study: buyers with a 12-stamp card pre-stamped ×2 completed faster than with a 10-stamp blank card — *endowed progress*, Nunes & Drèze 2006). Start progress bars at ~20%, not 0.
- **Ethical caution:** the same mechanism powers manipulative FOMO loops; use it to help users finish valuable tasks, not to farm engagement.

### Postel's Law — Robustness Principle (Jon Postel, RFC 761, 1980)
"Be conservative in what you send, be liberal in what you accept." Originally a TCP networking guideline.
- **UX translation:** accept varied, imperfect input; give back precise, well-formed output.
- **Examples:** phone/credit-card fields accepting spaces, dashes, parentheses and normalizing them; search tolerating typos ("did you mean…"); date fields accepting "tomorrow"; case-insensitive email login; responsive layouts and progressive enhancement (be liberal about devices/viewports); voice UIs handling many phrasings.
- **Violation:** a form that rejects "4111 1111 1111 1111" because the user typed spaces — the machine should strip them, not scold the human (also a Tesler's-law failure: complexity shoved onto the user).

### Quick mentions (same lawsofux.com family, worth one line each)
- **Serial Position Effect:** first and last list items are remembered best → put key actions at the ends of nav bars (why "Home" and "Profile" anchor mobile tab bars).
- **Law of Proximity / Similarity / Common Region (Gestalt):** spatial grouping and shared containers communicate relationships — covered in the visual-design chapter but cross-reference here.
- **Parkinson's Law:** tasks inflate to the time available → deadlines/timers (checkout hold timers) compress effort.
- **Pareto Principle:** ~80% of usage hits ~20% of features → optimize the vital few paths.
- **Occam's Razor:** among equally good solutions, ship the simplest.

---

## 4. Don Norman — The Design of Everyday Things (1988; revised 2013)

Norman: cognitive scientist, coined "user experience" at Apple in the 1990s, co-founder of Nielsen Norman Group.

### Affordances
The possible actions the relationship between an agent and an object allows: a chair affords sitting, a handle affords pulling, a flat plate affords pushing. Term adapted from psychologist J.J. Gibson. Key nuance: affordances are **relationships, not properties** — stairs afford climbing for an adult, not for an infant.
- Common misuse: designers saying "add an affordance" when they mean "add a *signifier*." Norman added the signifier concept to the 2013 revision precisely to fix this confusion.

### Signifiers
Perceivable cues that **communicate** where and how to act: the flat push-plate, a button's shadow, underlined links, a drag handle's ripples, "Push" labels. Signifiers signal affordances. In screen UI almost everything we design is signifier work — a link is only clickable if users can *tell* it is.
- **Flat-design cost:** NN/g research found flat UIs that removed signifiers (borders, shadows on buttons) increased click uncertainty — users needed more effort to identify what's interactive ("flat design hides calls to action").

### Mapping
The relationship between controls and their effects. **Natural mapping** exploits spatial analogy: stove knobs laid out like the burners; volume slider up = louder; scroll direction. Bad mapping = a row of 4 identical knobs for 4 burners in a square (the classic stove diagram) — everyone needs labels, everyone still errs.

### Feedback
Immediate, informative confirmation that an action happened and what the result was. Must be prompt (see Doherty/Nielsen timings), proportionate (not 20 confirmations), and prioritized. Poor feedback is worse than none when it's vague ("Something went wrong").

### Constraints
Limit possible actions to prevent error. Norman's four types:
- **Physical:** a SIM card only fits one way; USB-C is orientation-free by design (removing a constraint problem).
- **Cultural:** red = stop/danger; checkmarks = done.
- **Semantic:** meaning-driven — the windshield on a motorcycle model must face forward.
- **Logical:** only one piece left, one hole left — it must go there; a grayed-out button logically signals "not now."
- UI examples: date pickers, character counters, disabled states, input masks — constraints are the primary engine of error *prevention* (links to H5).

### Conceptual models and mental models
- **Mental model (user's):** what the user *believes* about how the system works — built from prior experience (Jakob's law is a mental-model claim). Always incomplete, often wrong, unique per user. NN/g: "what the user believes about the system at hand." (nngroup.com/articles/mental-models/)
- **Conceptual model (designer's):** the model the design *projects* through its system image — UI, docs, marketing.
- **The system image** is the only channel between designer and user; if the projected model is incoherent, users invent wrong mental models. Classic mismatch case: thermostats — many people hold a (false) "valve" model, cranking to 90° to heat faster; the thermostat is actually a switch/target, so cranking does nothing but overshoot.
- Reported research figures: interfaces matching users' mental models cut task time ~34% and errors ~42%, with ~60% less training time vs. novel conceptual frameworks (cited via uxuiprinciples.com summary of mental-model research — treat as indicative, not canonical).
- Fixing mismatches: either change the design to fit the dominant mental model (usual answer — "if people look for something in the wrong place, move it to where they look"), or teach the user (onboarding, labels) when the new model genuinely pays off.

### The Seven Stages of Action & the two Gulfs
Cycle: **Goal → Plan → Specify → Perform → Perceive → Interpret → Compare** (then back to goal).
- **Gulf of Execution** (plan/specify/perform): the gap between what the user wants to do and what the system lets them figure out how to do. Bridged by **signifiers, constraints, mappings, and a good conceptual model**.
- **Gulf of Evaluation** (perceive/interpret/compare): the gap between what the system did and the user's understanding of whether it worked. Bridged by **feedback and the conceptual model**.
- Diagnostic questions for any screen: "How do I work this?" (execution) and "What happened? Did it work?" (evaluation).

### Norman doors
A "Norman door" gives wrong usability signals — a graspable pull handle on a door you must push. If a door needs a "Push"/"Pull" sticker, the design already failed: the hardware itself should signify (flat plate = push, handle = pull). Named after Norman via *DOET*; popularized by the 99% Invisible / Vox video (2016). It's the canonical teaching example that **blame for user error belongs to design, not users** — form was prioritized over function.

### Discoverability
Norman's umbrella quality: can users figure out **what actions are possible and how to perform them** just by looking? Achieved through the six concepts above (affordances, signifiers, mapping, feedback, constraints, conceptual model).
- Modern tension: gesture-driven and minimalist UIs trade discoverability for cleanliness (hidden swipe actions, hamburger menus, long-press features). NN/g findings: hidden navigation measurably reduces feature usage and discoverability vs. visible navigation.
- Rules of thumb: core actions visible, one gesture = one visible alternative path, progressive disclosure for the rest.

### Human-centered design & the error philosophy
Norman's core stances to quote: (1) "Two of the most important characteristics of good design are discoverability and understanding." (2) User "error" is almost always **design error** — design for how people actually behave, not how you wish they behaved.

---

## 5. Error prevention and recovery (deep dive)

### Slips vs. mistakes (Norman's taxonomy, elaborated by NN/g)
- **Slips** = right goal, wrong execution; happen on autopilot (typo, tapping the adjacent button, soap on the toothbrush). Expert users slip *more* on familiar flows because attention is low.
  - Prevent with: helpful **constraints**, good **defaults**, forgiving formatting (Postel), large well-spaced targets (Fitts), input masks, autocomplete.
- **Mistakes** = wrong goal/plan, from a faulty mental model or incomplete information; conscious errors.
  - Prevent with: matching the user's mental model, previews of consequences ("This will delete 214 photos"), removing memory burdens, clear labels, warnings before commitment.
- (Sources: nngroup.com/articles/slips/, /user-mistakes/)

### The recovery toolkit (order of preference)
1. **Undo beats confirm.** Confirmation dialogs get dismissed on autopilot (habituation); undo (Gmail's undo send, trash-with-restore, soft delete) protects without interrupting. Reserve confirmations for rare, high-cost, irreversible actions — and make them describe the consequence, not just ask "Are you sure?"
2. **Inline, immediate validation** at the field, not after submit; never wipe user input on error.
3. **Good error messages** (NN/g guidelines): visible and human-readable, precise about what went wrong, constructive about how to fix it, polite (never blame the user), no codes/jargon, preserve work. Anti-patterns: "Invalid input," all-errors-at-top-of-page, technical stack traces shown to end users.
4. **Safe defaults + destructive-action distance:** separate "Delete" from "Save"; require typed confirmation (GitHub's "type the repo name to delete") for catastrophic actions.

### Numbers to cite
- Baymard Institute (2025 aggregate of 48+ studies): average cart abandonment **70.19%**; **17%** of US shoppers abandoned an order in the past quarter because checkout was "too long / complicated"; average US checkout shows **23.48 form elements** vs an ideal of ~**12**; average large e-commerce site can lift conversion **~35%** through checkout design alone — **$260B** in recoverable orders (US+EU). (baymard.com)
- These stats make error-prone forms the highest-ROI place to apply H5/H9 + Postel + Tesler.

---

## 6. Cross-cutting rules of thumb & common mistakes (chapter sidebar material)

**Rules of thumb:**
- Speed budget: 0.1 s = instant, 1 s = flow limit, 10 s = attention limit; aim for <400 ms interaction pace (Doherty).
- Touch targets: 44 pt (Apple) / 48 dp (Material) / never under 24 px (WCAG 2.2 AA).
- One primary CTA per screen (von Restorff); destructive actions distant and distinct.
- Default to convention (Jakob); spend your novelty budget on your differentiator.
- Prefer undo to confirmation; prefer prevention to recovery; prefer recognition to recall.
- Complexity is conserved (Tesler): every field you delete either moved to code or moved into the user's head — know which.
- Endings matter disproportionately (peak-end): audit the last screen of every flow, including cancellation.

**Common mistakes to warn readers about:**
- Quoting Miller's 7±2 to cap menu items (menus are recognition, not recall).
- Using "affordance" when you mean "signifier."
- Treating heuristics as pass/fail checklists rather than lenses requiring judgment; treating heuristic evaluation as a substitute for user testing.
- Letting aesthetics mask usability failures in research (aesthetic-usability effect contaminating feedback).
- Removing all signifiers in pursuit of minimalism (flat-design uncertainty; hidden gestures killing discoverability).
- Over-applying Hick's law until capability disappears (colliding with Tesler's law).
- Ethical line: Zeigarnik/goal-gradient/scarcity mechanics turn into dark patterns when they serve engagement metrics over user goals.

---

## 7. Sources

- Nielsen, 10 Usability Heuristics — https://www.nngroup.com/articles/ten-usability-heuristics/
- NN/g, How to Conduct a Heuristic Evaluation (+ Nielsen & Landauer numbers) — https://www.nngroup.com/articles/how-to-conduct-a-heuristic-evaluation/ and https://www.nngroup.com/articles/usability-problems-found-by-heuristic-evaluation/
- NN/g, Response Time Limits — https://www.nngroup.com/articles/response-times-3-important-limits/
- NN/g, Mental Models — https://www.nngroup.com/articles/mental-models/
- NN/g, Preventing User Errors: Slips — https://www.nngroup.com/articles/slips/ ; Mistakes — https://www.nngroup.com/articles/user-mistakes/
- NN/g, Error-Message Guidelines — https://www.nngroup.com/articles/error-message-guidelines/
- NN/g, Aesthetic-Usability Effect — https://www.nngroup.com/articles/aesthetic-usability-effect/
- NN/g, Dangerous UX: Consequential Options Close to Benign Options — https://www.nngroup.com/articles/proximity-consequential-options/
- Laws of UX (Jon Yablonski) — https://lawsofux.com/ (individual pages: /fittss-law/, /hicks-law/, /jakobs-law/, /millers-law/, /teslers-law/, /doherty-threshold/, /aesthetic-usability-effect/, /peak-end-rule/, /von-restorff-effect/, /zeigarnik-effect/, /postels-law/)
- Jakob's Law origin — https://jakobnielsenphd.substack.com/p/jakobs-law and https://www.uxtigers.com/post/jakobs-law
- Larry Tesler on conservation of complexity — https://www.nomodes.com/larry-tesler-consulting/complexity-law ; https://en.wikipedia.org/wiki/Law_of_conservation_of_complexity
- Hick's law — https://en.wikipedia.org/wiki/Hick%27s_law
- Miller (1956), The Magical Number Seven — https://psychclassics.yorku.ca/Miller/
- Zeigarnik effect — https://en.wikipedia.org/wiki/Zeigarnik_effect ; https://www.simplypsychology.org/zeigarnik-effect.html
- Peak-end rule (Kahneman/Redelmeier studies) — https://en.wikipedia.org/wiki/Peak%E2%80%93end_rule ; https://thedecisionlab.com/biases/peak-end-rule
- Aesthetic–usability effect / Kurosu & Kashimura 1995 — https://en.wikipedia.org/wiki/Aesthetic%E2%80%93usability_effect
- Doherty & Thadani (IBM Systems Journal, 1982) via https://lawsofux.com/doherty-threshold/
- Norman doors — https://99percentinvisible.org/article/norman-doors-dont-know-whether-push-pull-blame-design/
- Seven stages of action — https://www.educative.io/answers/what-are-normans-seven-stages-of-action ; https://en.wikibooks.org/wiki/Models_and_Theories_in_Human-Computer_Interaction/Norman%27s_Affordances_-_Visibility_and_the_7_Stages_of_Action
- The Design of Everyday Things (revised ed.) — https://jnd.org/books/the-design-of-everyday-things-revised-and-expanded-edition/
- Touch target sizes (Apple 44 pt / Material 48 dp / WCAG) — https://blog.logrocket.com/ux-design/all-accessible-touch-target-sizes/ ; https://testparty.ai/blog/wcag-target-size-guide ; https://adrianroselli.com/2019/06/target-size-and-2-5-5.html
- Baymard Institute checkout & cart-abandonment research — https://baymard.com/blog/ecommerce-checkout-usability-report-and-benchmark ; https://baymard.com/lists/cart-abandonment-rate
- UX Design Institute, all 21 laws — https://www.uxdesigninstitute.com/blog/laws-of-ux/
