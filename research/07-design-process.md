# Research Notes: The Design Process - From Idea to Tested Product

Chapter 07 research notes. Sources: Nielsen Norman Group (NN/g), UK Design Council, Interaction Design Foundation (IxDF), MeasuringU (Jeff Sauro), Figma design blog, Stanford d.school / GSB, Google HEART paper, Alan Cooper's persona work. All URLs in Sources section.

---

## 1. Big picture: design is a process, not a talent

- Core reframe for beginners: **design is structured problem-solving, not decoration**. Stanford d.school's position: design gives you "the skills and the confidence to know how to show up when you're thrown a problem you don't know much about" - you learn rapidly about people and context, then run small experiments and test prototypes. You do NOT need to draw well; you need to observe, question, and iterate.
- The whole process is a loop, not a line: **understand → define → ideate → prototype → test → repeat**. Every serious framework (Design Thinking, Double Diamond, Lean UX, Google Design Sprint) is a variation of this loop.
- Key mindset shifts that make someone "think like a designer" even without artistic skill:
  1. **Fall in love with the problem, not your solution.** Assume your first idea is wrong in some way you can't see yet.
  2. **Externalize early.** A bad sketch on paper beats a perfect idea in your head, because a sketch can be criticized and improved.
  3. **Evidence over opinion.** "I like it" is not an argument; "3 of 5 test users couldn't find checkout" is.
  4. **Diverge before you converge.** Generate many options before committing to one (this is the engine of the Double Diamond).
  5. **Tolerate ambiguity.** Design problems are open-ended with no single right answer; comfort with that is a trainable skill.
- Counterpoint worth one line in the chapter: some critics (Hugh Dubberly, AIGA Eye on Design) argue "design = problem solving" is too narrow - design also frames problems and creates meaning. Useful nuance: designers spend as much time deciding WHAT problem to solve as solving it.

## 2. The Double Diamond framework (UK Design Council, 2005)

- Created by the **British Design Council in 2005**; now the most-taught macro model of the design process. Two diamonds = two spaces:
  - **Diamond 1 - Problem space:** *Discover* (diverge) then *Define* (converge).
  - **Diamond 2 - Solution space:** *Develop* (diverge) then *Deliver* (converge).
- Each diamond = a cycle of **divergent thinking** (explore broadly, generate options, defer judgment) followed by **convergent thinking** (narrow, decide, commit).
- The four phases:
  1. **Discover** - understand the issue rather than assume it: field visits, interviews, analytics. Start from the issue, not from the solution you want to build.
  2. **Define** - synthesize research into a clear, actionable problem statement.
  3. **Develop** - generate many candidate solutions; co-design with different disciplines; seek inspiration elsewhere.
  4. **Deliver** - test solutions at small scale, iterate, reject what doesn't work, ship what does.
- Why it matters: it prevents "the most common design mistake - building the right solution for the wrong problem." Beginners jump straight to the second diamond; professionals spend real time in the first.
- Related: NN/g's Design Thinking model has 6 phases - **empathize, define, ideate, prototype, test, implement** - grouped as understand → explore → materialize. Same skeleton, different labels. Teach one deeply (Double Diamond) and map the others onto it.

## 3. Step 1 - Understanding users (Discover)

### 3.1 User research methods and when to use which
NN/g's landscape ("When to Use Which UX Research Methods," Christian Rohrer) maps ~20 methods on two axes:
- **Attitudinal ↔ Behavioral** (what people SAY vs what people DO)
- **Qualitative ↔ Quantitative** (why/how, small n vs how many/how much, large n)

The four workhorse methods for beginners:

1. **User interviews** (attitudinal, qualitative). 1-on-1, semi-structured, ~30–60 min. NN/g rules: treat it as a research study, not a chat; write research goals first, then an interview guide; ask open-ended questions ("Tell me about the last time you booked a flight"), not leading ones ("Wouldn't a filter be helpful?"); ask about specific past behavior, not hypothetical future behavior (people are terrible predictors of their own behavior). Typical n: 5–8 per user group until answers start repeating ("saturation").
2. **Surveys** (attitudinal, quantitative). Cheap, scalable; good for measuring prevalence ("what % of users..."), satisfaction, segmentation. Weak for "why." Common mistakes: leading questions, double-barreled questions ("Is the app fast and easy?"), asking about intentions instead of behavior.
3. **Analytics** (behavioral, quantitative). Page views, funnels, drop-off rates, rage clicks, search logs. Tells you WHERE users struggle (e.g., 70% abandon at the shipping form) but never WHY. Pair analytics (find the wound) with usability testing (diagnose the cause).
4. **Usability testing** (behavioral, qualitative). Watch real users attempt real tasks; the single highest-value method. Full treatment in section 7.

Rule of thumb: **watch what people do; don't only trust what they say.** Self-reported data is distorted by memory, politeness, and self-image.

### 3.2 Personas
- Invented/popularized by **Alan Cooper** (prototyped from ~1983; popularized in his 1999 book *The Inmates Are Running the Asylum*). Core idea: design for a single archetypal user with specific goals beats designing for "everyone" - the "elastic user" stretches to justify any decision.
- A persona = a fictional but **research-derived** archetype: name, photo, context, goals, behaviors, pain points, and (crucially) quotes and scenarios from real research. Demographics are the least important part; **goals and behaviors drive design decisions**.
- Cooper's practice: keep the set small (often ~3 groups differentiated by goals, tasks, skill level); designate ONE **primary persona** the interface must fully satisfy. His taxonomy includes primary, secondary, supplemental, customer, served, and negative (who you're explicitly NOT designing for).
- NN/g's pragmatic tiers: **lightweight/proto-personas** (assumption-based, workshop output - fine for alignment, must be validated), **qualitative personas** (from interviews - the sweet spot for most teams), **statistical personas** (from large-n data - expensive, rarely necessary).
- Common mistakes: personas invented from stereotypes with zero research; bloated with irrelevant demographics ("likes jazz"); created once then never used in decisions.

### 3.3 Jobs-to-be-Done (JTBD)
- Framework associated with **Clayton Christensen**: people "hire" products to get a "job" done. Format: *"When [situation], I want to [motivation], so I can [expected outcome]."*
- **The milkshake case study** (must include - it's the canonical story): a fast-food chain tried improving milkshake sales via customer feedback (chocolatier, cheaper, chunkier) - nothing worked. Christensen's team asked instead "what job do people hire a milkshake for?" and discovered ~half of shakes were bought before 8am by solo commuters who needed something one-handed, non-messy, and long-lasting to make a boring drive interesting and keep them full till lunch. Competitors weren't other shakes - they were bananas, bagels, donuts (all worse at the job). Fix the job (thicker shake, faster grab-and-go) and sales grow.
- **Personas vs JTBD** (NN/g has a direct comparison article): personas answer *who*, JTBD answers *why/what for*. JTBD is deliberately persona-agnostic - the job is stable across demographics. Best practice: use JTBD to define the stable job + success outcomes; use personas to capture how different groups experience that job. Avoids the trap of designing for a persona's demographics instead of the job's success criteria.

### 3.4 User journey maps
- A journey map = a visualization of one **actor** pursuing one **goal** through a sequence of phases, showing actions, thoughts, and emotions over time.
- NN/g's anatomy - **three zones**:
  - **Zone A (the lens):** persona + scenario + goals/expectations. One actor, one scenario per map.
  - **Zone B (the experience):** journey phases; within each phase the user's actions, thoughts (quotes from research), and an **emotion curve** (ups and downs).
  - **Zone C (the insights):** pain points, opportunities, and internal ownership (which team fixes what).
- Process (NN/g): compile goals/actions into a timeline skeleton → flesh out with thoughts and emotions to form a narrative → condense into a visualization that communicates insights.
- Two legitimate starting points: **research-first** (map built from primary research) or **assumption-first** (cross-functional workshop builds a hypothesis map, then research validates it). Assumption maps are fine as long as everyone knows they're hypotheses.
- The emotional low points ("pain points") are your prioritized problem list - the bridge into Define.

## 4. Step 2 - Defining the problem (Define)

- Output of Define = a **problem statement / point-of-view (POV) statement**: *"[User] needs [need] because [insight]."* Example: "Riya, a first-year student, needs a way to quickly compare course workloads because she fears over-committing and failing." (IxDF format.)
- Qualities of a good problem statement (IxDF): **human-centered** (about people, not tech or revenue), **broad enough** for creative freedom (no embedded solution: not "needs a filter button"), **narrow enough** to be actionable.
- **How-Might-We (HMW) questions** convert the POV into ideation fuel: "How might we help commuting students plan meals one-handed?" Good HMWs are neither too broad ("HMW improve food?") nor too narrow ("HMW add a bigger straw?"). Generate many HMWs, vote, ideate on the winners.
- Synthesis techniques feeding Define: **affinity diagramming** (cluster research observations on sticky notes until themes emerge), empathy maps (says/thinks/does/feels), and the journey map's pain points.
- Classic failure: skipping Define entirely - teams go from "the boss wants an app" straight to screens. Einstein-attributed line often quoted in design courses: given an hour to save the world, spend 55 minutes defining the problem.

## 5. Step 3 - Information architecture and card sorting

- **Information architecture (IA)** = how content is organized, labeled, and structured so people can find things and predict where things live. Bad IA is invisible in mockups but fatal in products ("where do I find my invoices?!").
- **Card sorting** is the standard method to discover users' mental models (NN/g "Card Sorting: Uncover Users' Mental Models"):
  - **Open sort:** users group cards (topics) into piles and NAME the piles themselves → reveals their mental categories and vocabulary. NN/g recommends this as the default for designing a new IA.
  - **Closed sort:** you provide the categories; users sort cards into them → validates an existing/proposed structure.
  - **Hybrid:** predefined categories + option to create new ones.
- Sample sizes: NN/g suggests ~**15 users** for reliable qualitative card-sort patterns (their quantitative guidance goes higher, ~30); academic work (Lantz et al., 2019) puts the optimum at **10–15 participants**. Tools: Optimal Workshop (OptimalSort), UXtweak; analysis via similarity matrices and dendrograms.
- Follow-up method: **tree testing** (reverse card sort) - give users the proposed menu hierarchy as plain text and ask "where would you click to find X?" Validates the IA before any visual design exists.
- Rules of thumb: use users' words for labels, not internal jargon ("My Plan" not "Subscription Entitlements"); test the IA before wireframing, because navigation problems can't be fixed with visual polish.

## 6. Step 4 - Sketching, wireframing, prototyping (Develop)

### Fidelity ladder (NN/g "UX Prototypes: Low Fidelity vs High Fidelity")
1. **Sketches / paper prototypes** - pen on paper or whiteboard. Minutes to make. Great for exploring MANY layouts fast (crazy 8s: 8 sketches in 8 minutes) and for early team/user reactions.
2. **Low-fidelity wireframes** - grayscale boxes, placeholder text, real hierarchy but no styling. Communicate layout, content priority, and flow.
3. **High-fidelity mockups** - real typography, color, content; looks like the product.
4. **Interactive prototypes** - clickable flows (Figma, etc.); can range from linked lo-fi wireframes to near-real hi-fi simulations.
- Why start LOW fidelity (evidence-backed points from NN/g and Figma):
  - **Users critique rough work more honestly** - polished designs feel "finished," so people withhold criticism; sketches invite it.
  - **Cheaper iterations**: less time preparing means more design alternatives explored per week; lo-fi feedback arrives earlier, so you iterate faster.
  - You (and stakeholders) are less emotionally attached to something that took 10 minutes.
- Why finish HIGH fidelity: hi-fi is needed to test visual hierarchy, comprehension of real content, brand feel, and fine interactions; stakeholders and developers need it for sign-off and build.
- Matching fidelity to question (Axure/NN/g guidance): testing the FLOW or IA? lo-fi is enough. Testing whether users notice a button or trust the page? hi-fi. Never test aesthetics with a lo-fi prototype or navigation strategy with a single static screen.
- **Parallel design**: Nielsen's research shows creating several independent design alternatives first and merging the best ideas beats iterating on a single initial idea ("Parallel & Iterative Design + Competitive Testing = High Usability").

## 7. Step 5 - Usability testing (the heart of the chapter)

### What it is (NN/g "Usability Testing 101")
- A **facilitator** gives a **participant** realistic **tasks** to perform on the product/prototype while thinking aloud; observers note where the participant struggles. You test the DESIGN, not the user - say exactly that to participants to relax them.
- **Think-aloud protocol** - Nielsen calls it "the #1 usability tool": ask users to continuously verbalize thoughts while working. Cheap, robust, flexible, easy to learn. Facilitator prompts neutrally: "What are you thinking?" "What did you expect to happen?" Never help, never lead, embrace awkward silence.
- **Qualitative (formative)** testing = find and fix problems, small n, run often. **Quantitative (summative)** = measure metrics (success rate, time), needs ~**40 users** per NN/g for statistical reliability. Beginners should live in the qualitative world.
- Formats: in-person moderated; **remote moderated** (video call + screen share - now the most common); **remote unmoderated** (tools record users doing tasks alone - scales cheaply, but you can't probe).

### How to run one with 5 users (step-by-step for the chapter)
1. Define 3–5 **task scenarios** - realistic goals with context, no interface vocabulary. Good: "You want to send $20 to your friend for dinner. Do that." Bad: "Click the Transfers tab and use the P2P widget" (gives away the answer).
2. Recruit 5 representative users (not teammates; hallway/coffee-shop testing is acceptable for generic products; incentives ~$30–100 or a gift card).
3. Pilot-test the session once with a colleague to debug tasks and timing.
4. In session (30–60 min): welcome + consent + "we're testing the design, not you" + think-aloud demo; run tasks one at a time; ask post-task questions ("How was that?" / SEQ 1–7 rating); finish with open debrief.
5. Record success/failure per task, quotes, and struggle moments. Debrief with observers the same day; list problems; rank by severity (how many users hit it × impact on task × persistence).
6. Fix top problems, then test again.

### Why 5 users is enough (NN/g - include the math)
- Nielsen & Landauer's model: problems found = **N(1 − (1 − L)^n)**, where L = probability one user exposes a given problem. Across their projects **L ≈ 31%** on average, so **5 users uncover ~85%** of the usability problems in the tested flows.
- Diminishing returns: user 1 teaches you the most ("zero users give zero insights"); by users 4–5 you're mostly watching repeats.
- The REAL argument isn't "85% is plenty" - it's budget allocation: **three rounds of 5 users beat one round of 15**. Round 1 finds ~85%; you fix them; round 2 checks the fixes, finds problems that were hidden behind the big ones; round 3 catches issues the redesign introduced.
- Caveats (must state, this rule is widely misquoted): applies to **qualitative** testing of a fairly homogeneous user group only. Distinct user groups (e.g., doctors vs patients) need 3–4 users EACH. Quantitative benchmarking needs ~40. Card sorting needs ~15. Eyetracking heatmaps need ~39 (NN/g "How Many Test Users?").

## 8. Step 6 - Iteration

- Design quality is produced by the LOOP, not by the first draft. Nielsen's iterative-design case studies (4 projects): **median usability improvement of 165% from first to last version; median +38% per iteration**; biggest gains in early iterations (v1→v2 median +45%, v2→v3 +34%) as "usability catastrophes" get removed. NN/g's own homepage redesign case study reported a KPI improving **233% across 6 iterations (~22%/iteration)**.
- Caution from the same research: an iteration can occasionally make things WORSE (fixing one problem introduces another) - which is exactly why you retest after changes instead of assuming fixes worked.
- Practical cadence for a beginner project: research week → define + sketch → lo-fi test (5 users) → revise → hi-fi test (5 users) → revise → ship → watch analytics → repeat.

## 9. How to EVALUATE whether a design is good

Two families: **inspection methods** (experts, no users) and **empirical methods** (users + metrics).

### 9.1 Heuristic evaluation (expert inspection)
- Introduced by **Jakob Nielsen and Rolf Molich, 1990; refined 1994**. Evaluators independently walk the interface checking it against the **10 usability heuristics** (visibility of system status; match with the real world; user control & freedom; consistency & standards; error prevention; recognition over recall; flexibility & efficiency; aesthetic & minimalist design; help users recognize/recover from errors; help & documentation).
- Staffing: **3–5 evaluators**; single evaluator finds ~35% of problems; 3 find ~60%; 5 find ~75%. Evaluators inspect independently first, then aggregate (independence avoids groupthink). Each finding gets a heuristic label + severity rating (0–4).
- Cheap and fast ("discount usability"), but it finds expert-predicted problems, not user-observed ones - it complements, never replaces, usability testing.

### 9.2 Cognitive walkthrough
- Presented by **Polson, Lewis et al. at the same 1990 conference**. Task-specific inspection focused on **learnability for first-time users**: for each step of a task the evaluators ask, essentially: Will the user try to achieve the right sub-goal? Will they notice the correct action is available? Will they connect the action with their goal? After acting, will the feedback show progress?
- Use when first-use success matters (onboarding, kiosks, medical devices). Heuristic evaluation = broad sweep against principles; cognitive walkthrough = deep trace of one task's learnability.

### 9.3 Quantitative metrics
- **Task success rate** - % of users completing a task; the most fundamental usability metric. Define success criteria in advance; report per task ("4/5 completed checkout").
- **Time on task**, **error rate**, **efficiency** (steps taken vs optimal).
- **SEQ (Single Ease Question)** - post-task 1–7 "How difficult/easy was this task?"; historical average ≈ 5.5.
- **SUS (System Usability Scale)** - **John Brooke, 1986**; 10 alternating positive/negative statements, 5-point agreement scale; scoring yields 0–100 (NOT a percentage). Benchmarks from Sauro & Lewis's database of **5,000+ responses across 400–500+ studies**: **mean = 68 (SD ≈ 12.5)** → 68 = 50th percentile; **>80.3 = top 10%** (roughly grade A; also the threshold where users tend to recommend the product); **<51 = bottom 15%**; <50 "not acceptable," 50–70 "marginal," >70 "acceptable."
- **NPS** - "would you recommend?" (−100..+100); a loyalty metric, not a usability metric; noisy for small samples.
- **Google's HEART framework** (Rodden, Hutchinson & Fu, Google, CHI 2010 - built for Gmail/YouTube-scale products): **H**appiness (satisfaction, SUS/NPS), **E**ngagement (frequency/depth of use), **A**doption (new users of feature), **R**etention (return rate), **T**ask success (completion, time, errors). Operationalized via the **Goals → Signals → Metrics** ladder: state the goal ("reduce checkout friction"), pick observable signals ("rage clicks, abandonments"), define trackable metrics ("checkout error rate"). Prevents vanity-metric worship: pick the 2–3 HEART rows that match your product goal, not all five.

### 9.4 Design critique (evaluating with peers)
- A structured session where designers present work-in-progress for feedback. Figma's design-team practice (Figma blog "How we run design critiques"):
  - Critique exists to **help the presenter**, who sets the agenda and states what feedback they need ("I need feedback on the navigation model, NOT the colors - those are placeholder").
  - It's a **safe space separated from roadmap/approval decisions** - critique ≠ sign-off meeting.
  - Format: ~1 hour, usually 2 topics × 20–30 min; Figma rotates among ~6 critique formats to fit the work's stage.
- Universal critique etiquette to teach:
  - Presenter: give context (problem, user, constraints, stage), ask specific questions, listen without defending, decide later which feedback to act on.
  - Critics: critique the WORK not the person; anchor feedback to the stated goal/user/principles, not personal taste ("does this hierarchy support the primary task?" beats "I don't like blue"); ask questions before prescribing ("what led you to put filters here?"); state problems, let the designer own solutions.
- Rule of thumb: feedback should be tied to an objective - if you can't connect a comment to a user need, a heuristic, or a project goal, it's an opinion, not a critique.

## 10. Common mistakes checklist (for a callout box)

1. Starting with a solution and doing "research" to confirm it (confirmation bias).
2. Skipping Define - no written problem statement anyone agreed to.
3. Asking users what they want / whether they'd use a feature (say-do gap) instead of watching behavior.
4. Personas invented from stereotypes, then never referenced again.
5. Testing only at the end, once, with polished hi-fi - too late and too expensive to change anything.
6. Leading tasks in usability tests that contain the answer ("click the cart icon").
7. Treating the 5-user rule as license to make quantitative claims ("80% of users prefer...") from 5 people.
8. Fixing problems and shipping without retesting (iterations can regress - Nielsen's data shows some do).
9. Confusing SUS with a percentage (a 68 is average, not a D grade).
10. Critique sessions that are actually approval meetings, or feedback that's pure personal taste.
11. Designing navigation from the org chart instead of card-sort-derived user mental models.
12. Polishing pixels on a flow whose IA is broken - visual design can't rescue structural confusion.

## 11. Mini case studies to use in the chapter

- **Christensen's milkshake** (JTBD) - section 3.3 above; the commuter job reframe.
- **NN/g homepage redesign** - iterative design + prototype testing case study; KPI +233% over 6 iterations; demonstrates lo-fi→hi-fi progression and retesting.
- **Nielsen & Landauer 5-user math** - the L=31% curve; use as a graph in the chapter.
- **Sauro/Lewis SUS benchmark database** - 5,000+ responses; mean 68; use as the grading scale figure.
- **Cooper's three user groups** - early persona work found users clustered into ~3 goal-based groups; justifies "design for one primary persona."

## 12. Expert rules of thumb (quick-reference)

- Spend as long understanding the problem as building the solution (first diamond ≥ second).
- 5 users per round, 3 rounds > 15 users in 1 round (Nielsen).
- ~15 participants for card sorting; ~40 for quantitative benchmarks; 3–5 expert evaluators for heuristic evaluation.
- Test lo-fi for flows/IA; hi-fi for comprehension, trust, and visual hierarchy.
- Write task scenarios with goals and context, never interface words.
- One actor + one scenario per journey map.
- Problem statement formula: [User] needs [need] because [insight]; then "How might we...?"
- SUS: 68 average, 80+ excellent, <51 alarm bells.
- Median +38% usability per design iteration - iteration is the highest-ROI activity in design.
- In critique: presenter states what feedback they need; critics tie every comment to a goal, user, or principle.

---

## Sources

- NN/g - Why You Only Need to Test with 5 Users (Nielsen, 2000): https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/
- NN/g - How Many Test Users in a Usability Study?: https://www.nngroup.com/articles/how-many-test-users/
- NN/g - Usability (User) Testing 101: https://www.nngroup.com/articles/usability-testing-101/
- NN/g - Thinking Aloud: The #1 Usability Tool: https://www.nngroup.com/articles/thinking-aloud-the-1-usability-tool/
- NN/g - Remote Usability Tests: Moderated and Unmoderated: https://www.nngroup.com/articles/remote-usability-tests/
- NN/g - User Interviews 101: https://www.nngroup.com/articles/user-interviews/
- NN/g - Design Thinking 101: https://www.nngroup.com/articles/design-thinking/
- NN/g - Journey Mapping 101: https://www.nngroup.com/articles/journey-mapping-101/
- NN/g - Customer Journey Maps: When and How to Create Them: https://www.nngroup.com/articles/customer-journey-mapping/
- NN/g - Personas vs. Jobs-to-Be-Done: https://www.nngroup.com/articles/personas-jobs-be-done/
- NN/g - Card Sorting: Uncover Users' Mental Models: https://www.nngroup.com/articles/card-sorting-definition/
- NN/g - UX Prototypes: Low Fidelity vs. High Fidelity: https://www.nngroup.com/articles/ux-prototype-hi-lo-fidelity/
- NN/g - Case Study: Iterative Design and Prototype Testing of the NN/g Homepage: https://www.nngroup.com/articles/case-study-iterative-design-prototyping/
- NN/g - Iterative Design of User Interfaces: https://www.nngroup.com/articles/iterative-design/
- NN/g - Parallel & Iterative Design + Competitive Testing: https://www.nngroup.com/articles/parallel-and-iterative-design/
- Nielsen (1993) - Iterative User-Interface Design (paper PDF): https://simson.net/ref/2006/csci_e-180/ref/nielsen-93.pdf
- Design Council - Framework for Innovation (Double Diamond): https://www.designcouncil.org.uk/resources/framework-for-innovation/
- Wikipedia - Double Diamond (design process model): https://en.wikipedia.org/wiki/Double_Diamond_(design_process_model)
- IxDF - Stage 2 in Design Thinking: Define the Problem: https://www.interaction-design.org/literature/article/stage-2-in-the-design-thinking-process-define-the-problem-by-synthesising-information
- IxDF - POV and How Might We: https://ixdf.org/literature/article/define-and-frame-your-design-challenge-by-creating-your-point-of-view-and-ask-how-might-we
- MeasuringU (Jeff Sauro) - Measuring Usability with the System Usability Scale: https://measuringu.com/sus/
- Google HEART framework (Rodden, Hutchinson, Fu - CHI 2010) overview: https://uxdesign.cc/googles-heart-framework-choosing-the-right-metrics-for-your-product-112bd7300d55
- Figma Blog - How We Do Design Critiques at Figma: https://www.figma.com/blog/design-critiques-at-figma/
- Cooper - Users, Personas and Goals (chapter PDF): https://www.cs.cmu.edu/~jhm/Readings/cooper_personas.pdf
- Alan Cooper - Defending Personas: https://mralancooper.medium.com/defending-personas-2657fe26dd0f
- Wikipedia - Persona (user experience): https://en.wikipedia.org/wiki/Persona_(user_experience)
- Stanford GSB - Got a Problem? Think Like a Designer: https://www.gsb.stanford.edu/insights/got-problem-think-designer
- Dubberly Design Office - Why We Should Stop Describing Design as "Problem Solving": https://www.dubberly.com/articles/why-we-should-stop-describing-design-as-problem-solving.html
- Optimal Workshop - Open vs Closed vs Hybrid Card Sorts: https://support.optimalworkshop.com/en/articles/2626850-choose-between-an-open-closed-or-hybrid-card-sort
- Lantz et al. (2019) card sorting sample size, discussed in: https://arxiv.org/pdf/2509.03232
- UXtweak - Nielsen's 10 Usability Heuristics: https://blog.uxtweak.com/usability-heuristics/
- Gapsy Studio - Heuristic Evaluation vs Cognitive Walkthrough: https://gapsystudio.com/blog/cognitive-walkthrough-vs-heuristic-evaluation/
- Axure - How to Choose the Correct Level of Fidelity: https://www.axure.com/blog/how-to-choose-the-correct-level-of-fidelity-for-your-prototype
- Christensen milkshake JTBD retelling: https://uxdesign.cc/job-to-be-done-to-understand-customer-personas-better-3963eff273f8
