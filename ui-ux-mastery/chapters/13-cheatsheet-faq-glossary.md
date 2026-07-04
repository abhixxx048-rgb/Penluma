# Chapter 13: Quick Revision - Cheat Sheet, FAQs, and Glossary

This is your one-page memory. If you read nothing else before an interview, a design review, or shipping a screen, read this. It squeezes the whole guide into a form you can scan in ten minutes: the big ideas, every law and rule in a table, the process as a numbered list, the numbers worth memorizing, and a ten-question test you can run on any design. After that come honest answers to the questions every beginner asks, and a plain-English dictionary of every technical word in the book.

---

## The Master Cheat Sheet

### The ten universal principles (the whole guide in ten lines)

1. **Design for the brain you have, not the one you wish users had.** People judge a page in about 50 milliseconds, scan instead of read (~20% of words), and remember roughly 4 things at once. Adapt the interface to those limits.
2. **Hierarchy is the job.** Every screen must answer, without words: what do I look at first, next, and last? Rank each element one notch quieter than the one above it.
3. **Reduce mental effort.** Fewer fonts, fewer colors, predictable spacing, familiar patterns. Kill "extraneous load" (clutter and noise) so attention is left for the real task.
4. **Group with space and boundaries before labels.** The brain decides what belongs together from closeness, sameness, and borders before it reads a single word.
5. **Recognition over recall.** Show options; never make users remember something the interface could display.
6. **Follow convention (Jakob's Law).** Users spend ~95-99% of their time on other sites. Be boring about navigation and checkout; spend your novelty on your actual value.
7. **Never let color carry meaning alone.** About 8% of men are red-green color blind. Pair color with an icon, label, pattern, or position, and keep text contrast at 4.5:1 or better.
8. **User error is design error.** Prevent mistakes with constraints and good defaults; when they slip through, prefer undo over "Are you sure?" and never destroy the user's work.
9. **Trust is felt, mostly from visual polish.** Around 75% of people judge credibility by how a site looks. Typos, stale content, and weird patterns leak distrust long before the payment page.
10. **Design is a loop, not a talent.** Understand -> define -> ideate -> prototype -> test -> repeat. Evidence beats opinion; iterate, because you gain a median ~38% usability per cycle.

### All the key laws and heuristics, in one table

| Law / heuristic | One-line meaning | Practical use |
|---|---|---|
| **Fitts's Law** | Big, close targets are fast; small, far ones are slow | Make buttons 44-48px; put key actions at screen edges/corners; keep destructive actions far from safe ones |
| **Hick's Law** | More choices = slower decisions | Trim and group options; use progressive disclosure; highlight a recommended pick |
| **Jakob's Law** | Users expect your site to work like every other site | Follow conventions (logo top-left, cart top-right); innovate only on your value |
| **Miller's Law** | Working memory holds ~4 chunks (not 7) | Chunk long info (phone/card numbers); applies to memory, NOT to visible menus |
| **Tesler's Law** | Complexity can't be deleted, only moved | Let the software absorb complexity (autofill, auto-format), not the user |
| **Doherty Threshold** | Interactions under 400ms keep users in flow | Respond fast; use optimistic UI and skeletons when you can't |
| **Postel's Law** | Be liberal in what you accept, strict in what you send | Accept messy input (spaces in card numbers), normalize it silently |
| **Aesthetic-Usability Effect** | Pretty things feel easier and get forgiven | Polish matters; but watch what testers DO, not just what they praise |
| **Peak-End Rule** | People judge an experience by its peak and its end | Engineer a high moment; design the last screen (even cancellation) with care |
| **Von Restorff Effect** | The odd one out is remembered | One visually distinct primary action per screen |
| **Zeigarnik Effect** | Unfinished tasks stick in the mind | Progress bars and checklists; start them above 0% (goal-gradient) |
| **Serial Position Effect** | First and last items are remembered best | Put key nav items at the ends of a bar |
| **Nielsen H1 - Visibility of status** | Always show what's happening | Progress bars, "Saving.../Saved", loading states |
| **Nielsen H2 - Match the real world** | Speak the user's language | "Your transfer didn't go through," not "ACH error 402" |
| **Nielsen H3 - User control & freedom** | Give a clear exit | Undo, cancel, back, a visible X on modals |
| **Nielsen H4 - Consistency & standards** | Same word/action means the same thing | One label per action; follow platform patterns |
| **Nielsen H5 - Error prevention** | Stop errors before they happen | Constraints, disabled states, confirm-by-typing for destructive acts |
| **Nielsen H6 - Recognition over recall** | Show, don't make users remember | Menus, autocomplete, pickers, re-displayed data |
| **Nielsen H7 - Flexibility & efficiency** | Serve novices and experts | Shortcuts and bulk actions that don't clutter the basic path |
| **Nielsen H8 - Aesthetic & minimalist** | Cut irrelevant content | Every extra element dims the important ones |
| **Nielsen H9 - Help users with errors** | Plain-language, specific, constructive messages | "That username is taken. Try username_2026." Inline, next to the field |
| **Nielsen H10 - Help & documentation** | Help should be searchable and in-context | Tooltips, a "?" by hard fields, contextual onboarding |
| **Norman - Affordance** | What an action an object allows | A button affords clicking; a slider affords dragging |
| **Norman - Signifier** | The visible cue that the affordance exists | Underlined link, button shadow, drag handle |
| **Norman - Mapping** | Controls should mirror their effects | Stove knobs laid out like the burners |
| **Norman - Feedback** | Confirm that an action happened | Instant, proportionate, useful (not "Something went wrong") |
| **Norman - Constraints** | Make the wrong action impossible | Date pickers, input masks, disabled buttons |
| **Cialdini - Social proof** | People copy others when unsure | Reviews, ratings, "10,000 teams use X" - only if true |
| **Cialdini - Scarcity** | Rare feels valuable | Real stock/deadline info only; fake counters are now illegal in many places |
| **Cialdini - Reciprocity/Authority/Liking/Commitment/Unity** | The other influence levers | Free value first; credentials; friendly tone; small yeses; shared identity |

### The design process, condensed to a numbered list

1. **Discover** - Understand real users. Interview 5-8 per group (ask about specific past behavior, never leading questions), run surveys for scale, read analytics for where users struggle, watch usability tests for why.
2. **Synthesize** - Turn research into personas (who), Jobs-to-be-Done (why), and a journey map (where it hurts). Cluster notes with affinity diagramming.
3. **Define** - Write ONE agreed problem statement: "[User] needs [need] because [insight]." Then turn it into "How might we...?" questions.
4. **Structure** - Design the information architecture. Run an open card sort (~15 users) to learn how users group content; tree-test the menu before drawing screens. Navigation problems can't be fixed with visual polish.
5. **Ideate & sketch** - Generate many rough options (crazy 8s, parallel design). Diverge before you converge.
6. **Prototype up the fidelity ladder** - Sketch -> low-fi wireframe -> high-fi mockup -> interactive prototype. Test flows in low-fi; test trust, hierarchy, and visuals only in high-fi.
7. **Usability test** - 5 real users per round, realistic tasks with no interface words, think-aloud, never help or lead. Say "we're testing the design, not you."
8. **Iterate** - Fix the worst problems (rank by severity), then retest. Three rounds of 5 beat one round of 15.
9. **Evaluate** - Heuristic evaluation (3-5 experts), cognitive walkthrough for first-use tasks, and metrics (task success, SEQ, SUS, HEART).
10. **Ship and watch** - Track the 2-3 HEART metrics that match your goal; loop back with real data.

### Key numbers to remember

**Contrast (WCAG AA)**
- Normal text: **4.5:1** minimum
- Large text (24px+, or 18.66px+ bold): **3:1** minimum
- UI parts (icons, borders, focus rings): **3:1** minimum
- AAA (stricter): 7:1 normal, 4.5:1 large
- No rounding up: #777 on white = 4.47:1 = fail

**Typography**
- Body text: **16px** floor (18-24px for long reading); 16px+ on mobile form inputs (below it, iOS zooms)
- Line length: **45-75 characters** (~66 ideal); CSS: `max-width: 65ch`
- Line height: **1.4-1.6** for body (1.5 baseline); 1.1-1.3 for headings
- Type scale: ~4 sizes from a **1.25** ratio
- Fonts: **1-2 typefaces**, 2-3 weights, none below 400

**Color and layout**
- Palette proportions: **60-30-10** (dominant / secondary / accent)
- Core colors: ~3, plus neutrals and semantic (green=success, red=error, amber=warning, blue=info)
- Spacing: multiples of **8** (4 as the half-step)
- Grid: **12 columns** desktop (8 tablet, 4 mobile); content max-width ~1140-1280px
- Group spacing: gaps between groups ~2x gaps within groups

**Touch targets**
- Apple: **44x44pt** | Material: **48x48dp** | WCAG 2.2 floor: **24x24px**
- Build to 44-48; treat 24 as never-go-below

**People and behavior**
- First impression: **~50ms** | Users read: **~20% of words** | Working memory: **~4 chunks**
- Color blindness: **~8% of men**, 0.5% of women (300M people)
- Disability: **1 in 6** people (1.3 billion); 94.8% of home pages have accessibility failures
- Cart abandonment: **~70%** (~80% mobile); top cause = surprise costs (39%)
- 5 users find **~85%** of usability problems; ~40 needed for statistical numbers
- Iteration gain: **median ~38%** per cycle
- SUS score: **68 = average** (NOT a percentage); 80+ = excellent
- Response-time limits: 0.1s = instant, 1s = flow survives, 10s = attention lost

### Evaluate any design in 10 questions

1. **Squint test** - Blur the screen. Is the most important element still obvious? Is there ONE clear primary action?
2. **Hierarchy** - Does the eye move in the order you intended, one notch quieter at each step?
3. **Contrast & color** - Does all text hit 4.5:1? Is any meaning carried by color alone?
4. **Scannability** - Are there descriptive headings, front-loaded keywords, and bullets - or a wall of text?
5. **Grouping** - Is space between groups clearly bigger than space within them? Does anything float ambiguously?
6. **Convention** - Does it work like other sites (logo, nav, cart, links look clickable)? Any surprising patterns?
7. **Memory** - Does any step force users to remember info from a previous screen? Are options visible?
8. **Feedback & errors** - Does every action confirm itself? Are errors plain, specific, and next to the field? Is there an undo/exit?
9. **Keyboard & touch** - Can you complete the task with the keyboard only, focus always visible? Are targets 44-48px?
10. **Honesty** - Is every claim (scarcity, "most popular", reviews) true? Is "no" as easy as "yes"? Would you explain this design on stage?

---

## FAQs

**1. Do I need to know how to draw?**
No. Design is structured problem-solving, not art. You need curiosity, observation, and the willingness to iterate. A rough box-and-line sketch does the job; drawing skill is optional.

**2. Should I learn UI or UX first?**
They're inseparable, but start with the thinking (UX): how users behave, the design process, and usability principles. Visual polish (UI) is easier to add once you understand what the screen is trying to do. This guide deliberately builds brain and behavior before pixels.

**3. Will AI replace designers?**
No - but it's redistributing the work. AI made producing screens cheap and made judging them valuable. About 86% of creators use AI, but only 32% trust its output. Your value lives in that gap: taste, research, judgment, and ethics. UX/UI is still a top-10 fastest-growing job through 2030.

**4. How long until I'm job-ready?**
Rough guide: several months to a year of consistent practice to build a portfolio, if you ship real end-to-end projects. Entry level is the hard part right now because AI does much of what juniors used to do. The counter-move: hybrid skills (design + front-end code + AI tooling) plus real research doubled interview callbacks in one program's data.

**5. Do I need to learn to code?**
Not required, but increasingly valuable. The emblematic 2026 role is the "design engineer" who can take an idea to working code. Even basic HTML/CSS understanding makes you a better designer and a smoother collaborator - and semantic HTML is the backbone of accessibility.

**6. How many fonts and colors should I use?**
Fonts: 1-2 typefaces (3 only if the third is a monospace for code). Colors: about 3 core colors following the 60-30-10 rule, plus neutrals and standard semantic colors. When in doubt, use one font family and build hierarchy with size, weight, and color.

**7. What's the single most common mistake beginners make?**
Low-contrast gray text. It fails accessibility and appears on ~80% of home pages. Runner-up: jumping straight to designing screens without understanding the problem or the user.

**8. Is "7 items max in a menu" a real rule?**
No - it's the most famous misuse of Miller's Law. That law is about what users must hold in memory, not what's visible on screen. A menu is recognition, not recall. For long menus, group items into labeled sections instead of cutting them.

**9. Why do I need to test with users if I follow all the rules?**
Because rules predict common problems, not your specific users' behavior. People are terrible at reporting what they'll do. Watching 5 real users think aloud finds ~85% of usability problems - things no checklist catches. Rules get you a good first draft; testing makes it right.

**10. Only 5 users? That can't be enough.**
For qualitative problem-finding, it is - the math (Nielsen & Landauer) shows 5 users expose ~85% of issues, and the gains flatten fast after that. The real power is running three rounds of 5, fixing between rounds. You do need ~40 users for statistical claims like "80% preferred X."

**11. What is accessibility and is it optional?**
Accessibility means people with disabilities can use your product. It's not optional - it's the law in most of the world (ADA, EAA, Section 508) and a huge market (~$7 trillion). WCAG 2.2 Level AA is the global baseline. Bonus: it overlaps heavily with SEO and helps everyone (the curb-cut effect).

**12. Where do I even start with accessibility?**
Fix the "WebAIM six" - low contrast, missing alt text, missing form labels, empty links, empty buttons, missing page language. They cause ~96% of detected errors. Then run an automated scan (axe/WAVE/Lighthouse) and do two manual tests: keyboard-only and screen reader.

**13. What's the difference between a wireframe, a mockup, and a prototype?**
A wireframe is a grayscale blueprint (layout, no styling). A mockup adds real color, type, and content (looks like the product). A prototype is clickable and testable. Match fidelity to your question: test flows in low-fi, test trust and visuals in high-fi.

**14. What is a design system and do I need one?**
A design system is a reusable set of decisions - colors, spacing, type, components - captured as named tokens so you decide each value once and reuse the name everywhere. For a beginner, the small version is enough: one type scale, one spacing scale, one radius set, one icon family. Never deviate ad hoc.

**15. When is friction good? Isn't all friction bad?**
No. Friction should match the stakes. Zero friction for browsing and adding to cart; a little for paying (verify the total); maximum for irreversible actions (type "DELETE" to confirm). Good friction protects users; bad friction just obstructs them.

**16. What's the line between persuasion and manipulation (dark patterns)?**
Persuasion is visible and leaves a real choice; manipulation must be hidden to work. Five quick tests: Is every claim true? Would it still work if users understood it? Is "no" as easy as "yes"? Will users feel they chose, or were tricked? Does it hold up for a child or a stressed user? Dark patterns now carry billion-dollar fines (Amazon $2.5B, Epic $520M).

**17. How do I build trust in a product?**
Trust is felt in ~50ms, mostly from visual polish. Look professional and current, show a real organization (address, people, contact), fix every typo and broken link, put security cues near payment, and show real, specific, recent reviews. You can't paste trust on at the checkout step - earn it everywhere.

**18. What tools should I learn?**
Figma is the industry-standard design tool. Add a contrast checker (WebAIM), a color-blindness simulator (Stark or Color Oracle), and 2-3 AI tools matched to phases (e.g., Midjourney for direction, a coding agent for prototypes). Learn every tool; trust none of them blindly.

**19. How do I know if my design is actually "good"?**
Beyond taste, use evidence: task success rate (how many users complete the task), the Single Ease Question after each task, and SUS after the session (68 = average, 80+ = excellent). Combine with heuristic evaluation by 3-5 experts. If you can't tie a critique to a user need, a heuristic, or a goal, it's an opinion, not a finding.

**20. What skills stay valuable as AI advances?**
The ones AI structurally lacks: taste and curation, judgment and critical thinking, real user research, systems thinking, ethics, communication, and business fluency. Every durable skill is about humans, judgment, or systems - the three things a statistical average of the internet can't supply.

---

## Glossary

**A11y** - Shorthand for "accessibility" (a + 11 letters + y).

**Accessibility** - Designing so people with disabilities can perceive, understand, navigate, and use a product.

**Affinity diagramming** - Writing each research observation on a note and clustering similar ones until themes emerge.

**Affordance** - An action that an object allows (a button affords clicking); a relationship between user and object, not a property.

**Alt text** - The written description a screen reader speaks for an image; describes purpose, not appearance.

**Anchoring** - The first number you see biases every judgment after it, even if it's arbitrary.

**ARIA** - Code attributes for adding accessibility info to custom widgets; use only as a last resort ("don't use ARIA").

**Aesthetic-Usability Effect** - Users perceive attractive designs as easier to use and forgive their minor flaws.

**Assistive technology** - Tools like screen readers and magnifiers that adapt an interface for a user.

**Banner blindness** - Users' learned habit of ignoring anything that looks like an ad.

**Behavioral economics** - The study of how people actually make choices, not how they logically should.

**Breakpoint** - A screen width at which a layout reorganizes (e.g., mobile to tablet).

**Card sorting** - A method where users group topics onto cards to reveal how they organize content.

**Chunk / Chunking** - One meaningful unit in memory; grouping small items into meaningful wholes to save memory.

**Closure** - Gestalt principle: the brain completes unfinished shapes.

**Cognitive load** - The total mental effort a task demands (intrinsic + extraneous + germane).

**Cognitive walkthrough** - An evaluation that traces one task's learnability for a first-time user, step by step.

**Common region** - Gestalt principle: items inside a shared boundary are seen as a group.

**Conceptual model** - The model of how a system works that the design projects to users.

**Confirmshaming** - A dark pattern that guilt-trips the decline option ("No thanks, I hate saving money").

**Constraint** - A design limit that makes a wrong action impossible (date pickers, disabled buttons).

**Continuity** - Gestalt principle: the eye follows lines and curves, grouping items along them.

**Contrast ratio** - The brightness difference between text and background, from 1:1 to 21:1.

**Convergent thinking** - Narrowing down: comparing options and committing to one.

**Curb-cut effect** - Designs built for people with disabilities end up helping everyone.

**Dark pattern (deceptive design)** - An interface trick that makes users do things they didn't intend, for business gain.

**Default** - Whatever happens if the user does nothing; the strongest nudge in design.

**Design engineer** - A hybrid role combining UX principles with front-end coding.

**Design token** - A named key-value pair storing a design decision (e.g., color.primary = #2563EB).

**Discoverability** - Whether users can figure out what actions are possible just by looking.

**Divergent thinking** - Opening up: exploring broadly and generating many options without judging.

**Double Diamond** - A process map: a problem space (Discover, Define) and a solution space (Develop, Deliver).

**Endowment effect** - Once people feel they own something, giving it up feels like a loss.

**Extraneous load** - Wasted mental effort from clutter and poor presentation; the designer's enemy to remove.

**F-pattern** - The F-shaped scanning path users default to on unstructured text; a failure mode to defend against.

**Feedback** - Immediate confirmation that an action happened and what the result was.

**Fidelity** - How closely a design artifact resembles the finished product (low-fi to high-fi).

**Figure-ground** - Gestalt principle: the brain splits a scene into a focal object (figure) and background (ground).

**Fitts's Law** - Time to reach a target depends on its distance and size; big and close is fast.

**Fixation** - A brief pause (~200-300ms) where the eye locks on a spot and processes detail.

**Focus indicator** - The visible ring showing which element the keyboard is currently on; required by WCAG.

**Fovea** - The small central part of the eye that sees sharply; everything else is blurry.

**Friction** - Anything that slows a user down; can be good (protective) or bad (obstructive).

**Generative AI** - Software that creates new content (text, images, code, layouts) from a written request.

**Generative UI (GenUI)** - An interface assembled in real time by AI, customized per user and context.

**Gestalt principles** - Rules describing how the brain groups visual elements (proximity, similarity, closure, etc.).

**Goal-gradient effect** - Motivation increases as people get closer to a goal.

**Grid** - An invisible skeleton of columns that page elements align to.

**Gulf of Execution** - The gap between what a user wants and figuring out how to do it ("How do I work this?").

**Gulf of Evaluation** - The gap between what the system did and understanding whether it worked ("Did it work?").

**Habituation** - Repeated exposure numbs the response; why users dismiss confirmation dialogs on autopilot.

**Hallucination** - When an AI confidently states something false; a built-in behavior to design around.

**HEART framework** - Google's metric categories: Happiness, Engagement, Adoption, Retention, Task success.

**Heuristic** - A rule of thumb for judging an interface; needs human judgment, not a pass/fail checklist.

**Heuristic evaluation** - Experts (3-5) independently inspect an interface against usability heuristics.

**Hick's Law** - Decision time grows with the number and complexity of choices.

**Hierarchy (visual)** - The deliberate ranking of elements so the eye visits them in the intended order.

**HITL (human-in-the-loop)** - AI augments decisions but a human reviews, overrides, or corrects them.

**How Might We (HMW)** - A question format that turns a problem statement into ideation fuel.

**HSL** - Hue, Saturation, Lightness; a color model that matches how designers think.

**Hue** - The color itself (red, blue, green); its position on the color wheel.

**Inattentional blindness** - Failing to see something in plain sight because attention is elsewhere.

**Inclusive design** - A process that deliberately includes the full range of human diversity while designing.

**Information architecture (IA)** - The structure and labeling of content so people can find and predict where things live.

**Information scent** - How strongly a link's label "smells" of the user's goal; strong scent = clear label.

**Jakob's Law** - Users expect your site to work like the other sites they already know.

**Jobs-to-be-Done (JTBD)** - A framework: people "hire" products to get a job done ("When [situation], I want to [motivation], so I can [outcome]").

**Journey map** - A visualization of one person pursuing one goal over time, showing actions, thoughts, and emotions.

**Landmark** - A semantic region of a page (header, nav, main, footer) that screen reader users jump between.

**Layer-cake pattern** - Scanning where eyes read headings and skip body text; the efficient pattern to design for.

**Legibility** - Whether you can decode individual letterforms (a property of the font).

**Line height (leading)** - The vertical distance from one line of text to the next.

**Line length (measure)** - How many characters fit on one line (ideal 45-75).

**LLM (large language model)** - The engine behind AI tools like Claude and GPT; predicts what text comes next.

**Loss aversion** - Losses feel about twice as heavy as equal gains.

**Mapping** - The relationship between controls and their effects; natural mapping uses spatial analogy.

**Mental model** - A user's internal belief about how something works, built from prior experience.

**Miller's Law** - Working memory holds about 4 chunks (the old figure was 7 plus or minus 2).

**Monospace** - A typeface where every character is the same width; good for code and numbers.

**MVP (minimum viable product)** - The smallest working version of a product you can test with users.

**Norman door** - A door (or UI) that signals the wrong action; proof that user error is design error.

**NPS (Net Promoter Score)** - "Would you recommend this?" scored -100 to +100; measures loyalty, not usability.

**Optimistic UI** - Showing an action as done instantly, then reconciling with the server later.

**Peak-End Rule** - People judge an experience by its most intense moment and its ending.

**Persona** - A fictional but research-based profile of a typical user, centered on goals and behaviors.

**Postel's Law** - Be liberal in what you accept, conservative in what you send.

**POUR** - WCAG's four principles: Perceivable, Operable, Understandable, Robust.

**Preattentive attributes** - Visual properties (color, size, orientation, motion) the brain processes in under ~250ms.

**Progressive disclosure** - Showing only what's needed now and revealing advanced options on demand.

**Prompt** - The written instruction given to an AI.

**Proximity** - Gestalt principle: elements placed close together are seen as related.

**Prototype** - A fake but realistic version of a product, made to test.

**Readability** - Whether text is comfortable to read and understand (font plus content complexity).

**Recall** - Retrieving information from memory with no cue; harder than recognition.

**Recognition** - Identifying something when the interface provides the cue; easier than recall.

**Roach motel** - A dark pattern: easy to get in, hard to get out (easy subscribe, hard cancel).

**Saccade** - A rapid eye jump between fixations; vision briefly shuts off during it.

**Satisficing** - Users click the first plausible option, not the best one.

**Saturation** - The intensity of a color; high is vivid, low is muted.

**Scrim** - A dimming overlay that pushes a modal forward as the visual figure.

**Screen reader** - Software that converts on-screen content into speech or braille.

**Semantic HTML** - Using the code element that describes what a thing is (button, heading), not just its look.

**SEQ (Single Ease Question)** - A one-question ease rating (1-7) asked after each task.

**Serial position effect** - First and last items in a sequence are remembered best.

**Serif / Sans-serif** - Serif has small "feet" on letters (traditional); sans-serif has none (modern, default for UI).

**Signifier** - A perceivable cue that communicates where and how to act (underlined link, button shadow).

**Similarity** - Gestalt principle: elements sharing a visual trait are seen as related and same-function.

**Slip vs. mistake** - A slip is right goal/wrong execution (autopilot); a mistake is a wrong goal/plan (faulty model).

**Social proof** - People copy others' behavior when unsure (reviews, ratings, usage counts).

**Squint test** - Blurring a screen to check whether the important elements and structure still stand out.

**SUS (System Usability Scale)** - A 10-question usability score from 0-100; 68 is average (not a percentage).

**Synthetic users** - AI-generated fake personas; they reflect training averages and can't replace real research.

**System 1 / System 2** - Fast automatic gut thinking vs. slow deliberate reasoning (Kahneman).

**Task success rate** - The percentage of users who complete a task; the most fundamental usability metric.

**Tesler's Law** - Complexity can't be removed, only moved between user, developer, and platform.

**Touch target** - The tappable area of a button or icon (aim for 44-48px).

**Transcript** - The full text of audio content as a separate document; also boosts SEO.

**Tree testing** - A reverse card sort: users find items in a text-only menu to validate the structure.

**Type scale** - A small fixed set of font sizes generated by multiplying a base size by a ratio.

**Typeface** - A designed set of letterforms (loosely called a "font").

**Usability testing** - Watching real users attempt realistic tasks to find where a design fails.

**User research** - Gathering evidence about the people you're designing for.

**Vibe coding** - Describing what you want in plain language and letting an AI write the code.

**Visceral / Behavioral / Reflective** - Norman's three emotional levels: instant look, experience of use, and the story it tells about you.

**Von Restorff effect (isolation effect)** - The item that visually differs is the one remembered.

**WCAG** - Web Content Accessibility Guidelines; the international standard, with levels A, AA, AAA.

**Whitespace (negative space)** - The empty area between elements; carries grouping and hierarchy information.

**Wireframe** - A grayscale blueprint of a screen showing layout and content priority, with no styling.

**Working memory** - The brain's short-term scratchpad; holds about 4 chunks.

**Z-pattern** - A scanning path (top-left to top-right, diagonal, then across the bottom) on sparse, low-text pages.

**Zeigarnik effect** - Unfinished tasks are remembered better and stay on the mind.
