# Chapter 07: The Design Process: From Idea to Tested Product

## Why this chapter matters

Previous chapters answered "what does good design look like?" This chapter answers a bigger question: **how do you actually make one?**

Here is the secret that surprises every beginner: professional designers do not draw beautiful screens from imagination. They follow a repeatable process - closer to detective work and science than to art. You gather evidence about real people, define the real problem, try several rough solutions, test them with real users, and improve based on what you see. By the end of this chapter you will be able to take a vague idea ("we should build an app for students") and turn it into a tested, evidence-backed design - step by step.

## Design Is a Process, Not a Talent

Let's kill the biggest myth first: "I can't design because I'm not artistic."

Design is **structured problem-solving, not decoration**. Stanford's d.school - one of the world's most famous design programs - describes design ability as "the skills and the confidence to know how to show up when you're thrown a problem you don't know much about." You learn quickly about people and their situation, then run small experiments and test rough prototypes. Drawing skill is optional. Curiosity is not.

The whole process is a **loop, not a line**:

```
understand → define → ideate → prototype → test
     ↑                                        |
     └────────────── repeat ──────────────────┘
```

Every famous framework - Design Thinking, Double Diamond, Lean UX, Google's Design Sprint - is a variation of this same loop with different labels.

### The five mindset shifts of a designer

You "think like a designer" the moment you adopt these habits:

1. **Fall in love with the problem, not your solution.** Assume your first idea is wrong in some way you cannot see yet. It usually is.
2. **Externalize early.** A bad sketch on paper beats a perfect idea in your head, because a sketch can be criticized and improved. An idea in your head cannot.
3. **Evidence over opinion.** "I like it" is not an argument. "3 of 5 test users couldn't find checkout" is.
4. **Diverge before you converge.** Generate many options before committing to one. Never marry the first idea.
5. **Tolerate ambiguity.** Design problems are open-ended, with no single right answer. Getting comfortable with that is a trainable skill.

One honest nuance: critics like design theorist Hugh Dubberly argue "design = problem solving" is too narrow - design also *frames* problems. In practice, designers spend as much time deciding **what** problem to solve as solving it - which is why the first half of this chapter is about understanding, not drawing.

**In short:** design is a learnable loop of understanding, trying, and testing - not a magical artistic gift.

## The Double Diamond: A Map of the Whole Process

Before we walk through the steps, you need the map. The **Double Diamond** was created by the **British Design Council in 2005** and is now the most widely taught model of the design process.

Picture two diamond shapes side by side. Each diamond opens wide, then narrows to a point:

```
   PROBLEM SPACE              SOLUTION SPACE
      (Diamond 1)                (Diamond 2)

        /\                          /\
       /  \                        /  \
      /    \                      /    \
     / DIS- \  DEFINE            / DEV- \  DELIVER
     \ COVER/  (narrow to        \ ELOP /  (narrow to
      \    /   the problem)       \    /   the solution)
       \  /                        \  /
        \/                          \/
   explore widely,             explore widely,
   then decide WHAT            then decide HOW
   problem to solve            to solve it
```

Two new terms, defined plainly:

- **Divergent thinking** = opening up. Explore broadly, generate many options, hold off on judging them. Like brainstorming twenty restaurant ideas for dinner.
- **Convergent thinking** = narrowing down. Compare, decide, commit. Like picking the one restaurant you'll actually go to.

Each diamond is one diverge-then-converge cycle:

| Phase | Diamond | Thinking | What you do |
|---|---|---|---|
| **Discover** | 1 (problem) | Diverge | Interviews, field visits, analytics. Understand the issue instead of assuming it. |
| **Define** | 1 (problem) | Converge | Turn the research into one clear, agreed problem statement. |
| **Develop** | 2 (solution) | Diverge | Generate many candidate solutions; sketch, borrow ideas, co-design. |
| **Deliver** | 2 (solution) | Converge | Test at small scale, reject what fails, iterate, ship what works. |

Why does this map matter? Because it prevents **the most common design mistake: building the right solution for the wrong problem.** Beginners jump straight into the second diamond ("let's design screens!"). Professionals spend real time in the first.

You may also meet Nielsen Norman Group's six-phase Design Thinking model - empathize, define, ideate, prototype, test, implement. Same skeleton, different labels. Learn the Double Diamond deeply and you can map every other framework onto it.

**In short:** first figure out the right problem (diamond 1), then figure out the right solution (diamond 2) - and diverge before you converge in both.

## Step 1: Understand Your Users (Discover)

You cannot design for people you do not understand. Guessing feels faster, but it is like a doctor prescribing medicine without examining the patient.

### The four workhorse research methods

**User research** simply means gathering evidence about the people you are designing for. Nielsen Norman Group maps around twenty research methods on two axes:

- **Attitudinal vs. behavioral** - what people **say** vs. what people **do**.
- **Qualitative vs. quantitative** - a **qualitative** method explains *why* and *how* with a small number of people; a **quantitative** method measures *how many* and *how much* with large numbers.

Beginners need only four methods to be dangerous:

| Method | Say or do? | Depth or scale? | Best for | Weakness |
|---|---|---|---|---|
| **User interviews** | Say | Depth (5–8 people) | Understanding goals, context, frustrations | People misremember and misreport |
| **Surveys** | Say | Scale (hundreds) | Measuring how common something is; satisfaction | Terrible at explaining "why" |
| **Analytics** | Do | Scale | Finding WHERE users struggle (drop-offs, rage clicks) | Never tells you WHY |
| **Usability testing** | Do | Depth (5 people) | Watching where a design fails in practice | Small numbers; not for statistics |

A few practical rules for each:

- **Interviews** are one-on-one conversations, usually 30–60 minutes. NN/g's rules: treat it as a research study, not a chat - write research goals first, then a question guide. Ask **open-ended questions** ("Tell me about the last time you booked a flight"), never leading ones ("Wouldn't a filter be helpful?"). Ask about **specific past behavior**, not hypothetical futures - people are terrible predictors of what they would do. Interview 5–8 people per user group, until answers start repeating ("saturation").
- **Surveys** are cheap and scalable. Avoid leading questions and **double-barreled questions** - one question secretly asking two things ("Is the app fast and easy?"). If a user answers "no," you don't know which half failed.
- **Analytics** are like an X-ray: they show the fracture ("70% of users abandon at the shipping form") but not the cause. Pair analytics (find the wound) with usability testing (diagnose it).

The golden rule tying it all together: **watch what people do; don't only trust what they say.** Self-reported answers are distorted by memory, politeness, and self-image.

### Personas: designing for someone, not everyone

A **persona** is a fictional but research-based profile of a typical user: a name, a photo, a context, goals, behaviors, and pain points, backed by real quotes from your research.

Personas were popularized by software designer **Alan Cooper** in his 1999 book *The Inmates Are Running the Asylum* (he had prototyped the idea since around 1983). His core insight: designing for "everyone" produces mush, because "the user" is **elastic** - teams stretch this vague figure to justify any decision they already wanted to make. Designing for one specific, believable person forces honest choices.

What makes a persona useful:

- **Goals and behaviors drive design decisions.** Demographics matter least. "Priya wants to compare course workloads quickly because she fears over-committing" is useful; "Priya is 19 and likes jazz" is decoration.
- **Keep the set small.** Cooper found users typically cluster into about **three goal-based groups**. Pick ONE **primary persona** the interface must fully satisfy; others are secondary. He even defined a **negative persona** - who you are explicitly *not* designing for.
- **Match effort to evidence.** NN/g distinguishes **proto-personas** (team assumptions from a workshop - fine for alignment, must be validated), **qualitative personas** (from interviews - the sweet spot), and **statistical personas** (from large datasets - expensive, rarely necessary).

### Jobs-to-be-Done: what did they "hire" your product for?

**Jobs-to-be-Done (JTBD)** is a framework associated with Harvard professor **Clayton Christensen**. Its claim: people don't buy products, they **"hire" them to get a job done**. The standard format:

> *"When [situation], I want to [motivation], so I can [expected outcome]."*

The canonical story is **the milkshake study**. A fast-food chain wanted to sell more milkshakes. They asked customers for feedback and made the shakes chocolatier, cheaper, chunkier - nothing moved sales. Christensen's team asked a different question: *what job do people hire a milkshake for?* They discovered nearly half of all shakes were bought **before 8 a.m. by solo commuters**. The job: something one-handed, non-messy, and long-lasting to make a boring drive interesting and stay full until lunch. The real competitors weren't other shakes - they were **bananas, bagels, and donuts**, all worse at the job (too fast, too messy, too dry). Make the shake thicker and the pickup faster, and sales grow. Customer feedback about the product missed the point entirely; understanding the *job* reframed everything.

**Personas vs. JTBD** - they answer different questions:

| | Personas | Jobs-to-be-Done |
|---|---|---|
| Answers | **Who** is the user? | **Why** are they here? What for? |
| Stability | Varies by group | The job is stable across demographics |
| Risk | Designing for demographics instead of goals | Ignoring differences between user groups |

Best practice (NN/g compares them directly): use JTBD to define the stable job and its success criteria; use personas to capture how different groups experience that job.

### User journey maps: the experience over time

A **user journey map** is a visualization of **one person** pursuing **one goal** through a sequence of phases - showing their actions, thoughts, and emotions at each step. Think of it as filming a customer's whole trip through a supermarket: parking, finding a trolley, hunting for aisles, queuing, paying - not just the moment at the till.

NN/g's anatomy has **three zones**:

```
┌──────────────────────────────────────────────────┐
│ ZONE A (the lens): persona + scenario + goals    │
├──────────────────────────────────────────────────┤
│ ZONE B (the experience):                         │
│   Phase 1   Phase 2   Phase 3   Phase 4          │
│   actions   actions   actions   actions          │
│   thoughts  thoughts  thoughts  thoughts         │
│   emotion curve:  ─╮   ╭─╮                       │
│                    ╰───╯ ╰──╮  ╭── 😀            │
│                             ╰──╯ ← pain point 😖 │
├──────────────────────────────────────────────────┤
│ ZONE C (insights): pain points, opportunities,   │
│ which team owns each fix                         │
└──────────────────────────────────────────────────┘
```

Rules of thumb: **one actor, one scenario per map** (a map of "all users doing everything" says nothing). You can build the map **research-first** (from interviews and analytics) or **assumption-first** (the team drafts a hypothesis map in a workshop, then validates it with research) - assumption maps are fine as long as everyone knows they are hypotheses.

The emotional low points on the curve are gold: they are your **prioritized problem list**, and the natural bridge into the next step.

**In short:** interview and observe real users, capture who they are (personas), why they came (jobs), and where their journey hurts (journey maps) - before designing anything.

## Step 2: Define the Problem

**Define** is where you converge: compress everything you learned into one clear sentence everyone agrees to solve. Skipping this step is the classic failure - teams go from "the boss wants an app" straight to drawing screens. A line often (probably apocryphally) attributed to Einstein is quoted in design courses for a reason: given an hour to save the world, spend 55 minutes defining the problem.

The output is a **problem statement** (also called a point-of-view or POV statement), in the Interaction Design Foundation's format:

> *"[User] needs [need] because [insight]."*
>
> Example: "Riya, a first-year student, needs a way to quickly compare course workloads because she fears over-committing and failing."

A good problem statement is:

- **Human-centered** - about a person's need, not technology or revenue.
- **Broad enough** for creative freedom - no embedded solution. "Riya needs a filter button" is a solution wearing a problem's clothes.
- **Narrow enough** to be actionable - "students need better education" is a speech, not a brief.

To get from a pile of research to that sentence, teams use synthesis techniques:

- **Affinity diagramming** - write every observation on a sticky note, then cluster similar notes until themes emerge. It is how you turn 200 quotes into 6 insights.
- **Empathy maps** - a quick grid of what the user *says, thinks, does,* and *feels*.
- The journey map's **pain points** - already a ranked problem list.

Finally, convert the problem statement into ideation fuel with **How-Might-We (HMW) questions**: "How might we help commuting students plan meals one-handed?" A good HMW is neither too broad ("How might we improve food?") nor too narrow ("How might we add a bigger straw?"). Generate many HMWs, vote as a team, and ideate on the winners.

**In short:** write one agreed sentence - [User] needs [need] because [insight] - then turn it into "How might we…?" questions before generating solutions.

## Step 3: Information Architecture and Card Sorting

Before drawing screens, decide how the content is **organized**. **Information architecture (IA)** is the structure and labeling of content so people can find things and predict where things live - the design equivalent of how a supermarket groups products into aisles and labels them.

Bad IA is invisible in pretty mockups but fatal in real products. If users can't answer "where would my invoices be?", no amount of visual polish saves them. A key rule: **navigation problems cannot be fixed with visual design.**

### Card sorting: discovering users' mental models

How do you know how *users* would organize your content? You ask them to do it. **Card sorting** (NN/g's standard method) works like this: write each topic on a card, hand users the deck, and watch how they group the cards.

- **Open sort:** users make their own piles AND name them. This reveals their mental categories and their vocabulary. NN/g recommends this as the default when designing a new IA.
- **Closed sort:** you provide the category names; users sort cards into them. Use this to validate a structure you already have.
- **Hybrid sort:** predefined categories, plus the option to create new ones.

How many participants? NN/g suggests about **15 users** for reliable qualitative patterns (and around 30 for their quantitative guidance); academic work (Lantz et al., 2019) puts the optimum at **10–15**. Tools like OptimalSort and UXtweak run sorts online and analyze the results with similarity matrices.

The follow-up method is **tree testing** - essentially a reverse card sort. You give users your proposed menu hierarchy as plain text (no visuals at all) and ask, "Where would you click to find X?" This validates the structure before a single screen exists.

Two rules of thumb:

- **Use the users' words as labels**, not internal jargon. "My Plan" beats "Subscription Entitlements."
- **Never design navigation from the org chart.** Your company's departments are not your users' mental model.

**In short:** organize and label content the way users think (card sorting proves how that is), and validate the structure with tree testing before drawing anything.

## Step 4: Sketching, Wireframing, and Prototyping (Develop)

Now - finally - you make things. But you climb a **fidelity ladder**, from rough to real. **Fidelity** just means how closely the artifact resembles the finished product.

1. **Sketches / paper prototypes** - pen on paper or whiteboard. Minutes to make. Perfect for exploring MANY layouts fast. A popular exercise is **crazy 8s**: fold a paper into 8 panels and sketch 8 different ideas in 8 minutes.
2. **Low-fidelity wireframes** - grayscale boxes and placeholder text. A **wireframe** is a blueprint of a screen: it shows layout, content priority, and flow, with zero styling. Like an architect's floor plan - walls and doors, no wallpaper.
3. **High-fidelity mockups** - real typography, real color, real content. Looks like the product.
4. **Interactive prototypes** - clickable flows built in tools like Figma. A **prototype** is a fake version of the product realistic enough to test. It can range from linked lo-fi wireframes to a near-real simulation.

### Why start LOW fidelity

This is evidence-backed, not just taste (NN/g and Figma both document it):

- **People critique rough work more honestly.** A polished design looks "finished," so testers and stakeholders politely withhold criticism. A sketch openly invites it.
- **Cheaper iterations.** A sketch costs 10 minutes; a hi-fi mockup costs a day. Lo-fi lets you explore more alternatives per week and get feedback earlier.
- **Less emotional attachment.** You will happily throw away 10 minutes of work. You will fight to defend a week of work - even when the evidence says it's wrong.

### Why finish HIGH fidelity

Hi-fi is not optional at the end: you need it to test **visual hierarchy** (do users notice the right things?), comprehension of real content, brand feel, and fine interactions - and developers need it to build from.

The skill is **matching fidelity to the question**:

| Question you're testing | Right fidelity |
|---|---|
| Does the flow / navigation make sense? | Lo-fi is enough |
| Do users notice this button? Trust this page? | Hi-fi required |
| Is the aesthetic right? | Hi-fi only - never judge visuals from boxes |
| Does the overall IA work? | Tree test or lo-fi |

One more evidence-backed technique: **parallel design**. Jakob Nielsen's research shows that creating several *independent* design alternatives first, then merging the best ideas, beats iterating on a single initial idea. Diverge before you converge - again.

**In short:** climb from sketch to wireframe to hi-fi prototype, testing at each rung, and never test aesthetics with boxes or navigation with a single static screen.

## Step 5: Usability Testing

This is the heart of the whole process - the moment your design meets reality.

A **usability test** (per NN/g's "Usability Testing 101"): a **facilitator** (you) gives a **participant** (a real user) realistic **tasks** to perform on the product or prototype, while the participant **thinks aloud** and observers note every struggle. Crucial framing you must say out loud to participants: *"We are testing the design, not you."* If they fail, the design failed.

The **think-aloud protocol** - Nielsen calls it "the #1 usability tool" - simply asks users to continuously verbalize their thoughts while working: "I'm looking for a cart icon… I expected it up here… hm, what does this label mean?" It is cheap, robust, and easy to learn. Your job as facilitator: prompt neutrally ("What are you thinking?" "What did you expect to happen?"), **never help, never lead, and embrace awkward silence.**

Two flavors of testing:

- **Qualitative (formative)** - find and fix problems. Small numbers, run often. This is where beginners should live.
- **Quantitative (summative)** - measure metrics (success rates, times) for benchmarking. Needs around **40 users** per NN/g for statistical reliability.

Formats: in-person moderated; **remote moderated** (video call + screen share - now the most common); and **remote unmoderated** (tools record users doing tasks alone - scales cheaply, but you cannot probe follow-up questions).

### How to run a test with 5 users - step by step

1. **Write 3–5 task scenarios.** A task scenario is a realistic goal with context - and **no interface vocabulary**. Good: "You want to send $20 to your friend for dinner. Do that." Bad: "Click the Transfers tab and use the P2P widget" - that hands over the answer.
2. **Recruit 5 representative users.** Not teammates (they know too much). For generic products, hallway or coffee-shop recruiting is acceptable. Typical incentive: $30–100 or a gift card.
3. **Pilot the session once** with a colleague to debug your tasks and timing.
4. **Run each session (30–60 min):** welcome, consent, "we're testing the design, not you," a quick think-aloud demo; then tasks one at a time; after each task, ask "How was that?" or a 1–7 ease rating; end with an open debrief.
5. **Record evidence:** success or failure per task, memorable quotes, and moments of struggle. Debrief with observers the **same day**. List every problem; rank by severity (how many users hit it × impact on the task × persistence).
6. **Fix the top problems, then test again.**

### Why 5 users is enough (the famous math)

Jakob Nielsen and Tom Landauer modeled how many usability problems a test uncovers:

> problems found = **N × (1 − (1 − L)ⁿ)**

where N is the total number of problems, n is the number of test users, and **L** is the chance that one user exposes a given problem. Across their projects, L averaged about **31%**. Plug that in:

```
users:    1     2     3     4     5     ...    15
found:   31%   52%   67%   77%   ~85%   ...  ~99%
          █     ██    ███   ████  █████
          steep gains ↑        flattening →
```

**Five users uncover roughly 85% of the usability problems** in the flows you test. User 1 teaches you the most ("zero users give zero insights"); by users 4–5 you are mostly watching repeats.

But the *real* argument is not "85% is plenty." It is **budget allocation: three rounds of 5 users beat one round of 15.** Round 1 finds ~85% of problems; you fix them. Round 2 checks whether the fixes worked and finds problems that were hidden behind the big ones. Round 3 catches issues the redesign itself introduced. Same budget, vastly more learning.

**Caveats - this rule is widely misquoted:**

- It applies to **qualitative** testing of a fairly homogeneous user group only.
- Distinct user groups (say, doctors vs. patients) need **3–4 users each**.
- Quantitative benchmarking needs **~40** users; card sorting **~15**; eye-tracking heatmaps **~39** (NN/g's "How Many Test Users?").
- Five users can never justify statistical claims like "80% of users prefer X."

**In short:** watch 5 real users think aloud through realistic tasks, fix the worst problems, and repeat - three rounds of 5 beat one round of 15.

## Step 6: Iterate

Design quality is produced by the **loop**, not by the first draft. This is measurable. Nielsen's iterative-design case studies across four projects found a **median usability improvement of 165% from first to last version - about +38% per iteration** - with the biggest gains early (version 1→2 improved a median of +45%, version 2→3 +34%) as the "usability catastrophes" get removed. NN/g's own homepage redesign case study reported a key metric improving **233% across 6 iterations** (~22% per iteration).

That makes iteration arguably the **highest-ROI activity in all of design**.

One caution from the same research: an iteration can occasionally make things **worse** - fixing one problem sometimes introduces another. That is exactly why you retest after changes instead of assuming your fixes worked.

A practical cadence for a beginner project:

```
research week → define + sketch → lo-fi test (5 users) → revise
→ hi-fi test (5 users) → revise → ship → watch analytics → repeat
```

**In short:** iterate and retest - a median +38% usability gain per cycle is waiting, but only retesting catches the cycles that regress.

## How to Evaluate Whether a Design Is Good

"Is this design good?" has real answers beyond taste. Evaluation methods come in two families: **inspection methods** (experts examine the design, no users needed) and **empirical methods** (real users plus measurements).

### Heuristic evaluation (expert inspection)

Introduced by **Jakob Nielsen and Rolf Molich in 1990** (refined 1994). Evaluators independently walk through the interface checking it against the **10 usability heuristics** - a heuristic being a broad rule of thumb, such as "visibility of system status," "match between system and the real world," "user control and freedom," "consistency and standards," "error prevention," "recognition rather than recall," "flexibility and efficiency," "aesthetic and minimalist design," "help users recognize and recover from errors," and "help and documentation." (You met these in an earlier chapter.)

How it works in practice:

- Use **3–5 evaluators**. Nielsen's data: a single evaluator finds ~35% of problems; 3 find ~60%; 5 find ~75%.
- Evaluators inspect **independently first**, then aggregate - independence prevents groupthink.
- Each finding gets a heuristic label and a **severity rating (0–4)**.

It is cheap and fast - Nielsen called this family "discount usability." But remember: it finds *expert-predicted* problems, not *user-observed* ones. It complements usability testing; it never replaces it.

### Cognitive walkthrough

Presented by **Polson, Lewis and colleagues at the same 1990 conference**. Where heuristic evaluation is a broad sweep, a **cognitive walkthrough** is a deep trace of **one task's learnability for a first-time user**. For each step of the task, evaluators ask, in essence:

1. Will the user try to achieve the right sub-goal?
2. Will they notice that the correct action is available?
3. Will they connect that action with their goal?
4. After acting, will the feedback show they made progress?

Use it when first-use success is critical: onboarding flows, ticket kiosks, medical devices - anywhere users get one shot and no training.

### Quantitative metrics

- **Task success rate** - the percentage of users who complete a task; the most fundamental usability metric. Define success criteria *in advance* and report per task ("4/5 completed checkout").
- **Time on task**, **error rate**, and **efficiency** (steps taken vs. the optimal path).
- **SEQ (Single Ease Question)** - after each task, one question: "How difficult or easy was this task?" on a 1–7 scale. Historical average is about **5.5**.
- **SUS (System Usability Scale)** - created by **John Brooke in 1986**: 10 alternating positive/negative statements ("I found the system unnecessarily complex…") rated on 5-point agreement. Scoring yields **0–100 - and it is NOT a percentage.** Benchmarks from Jeff Sauro and James Lewis's database of **5,000+ responses across roughly 500 studies**: the **mean is 68** (SD ≈ 12.5), so 68 = exactly average, the 50th percentile. Above **80.3** puts you in the top 10% - roughly a grade A, and about the point where users start recommending the product. Below **51** is the bottom 15%; under 50 is "not acceptable," 50–70 "marginal," over 70 "acceptable." Beginners routinely misread "SUS 68" as a failing grade of 68% - it is a solid average.
- **NPS (Net Promoter Score)** - "Would you recommend this?" scored −100 to +100. It measures *loyalty*, not usability, and is noisy at small sample sizes.

For choosing which metrics matter, Google's **HEART framework** (Rodden, Hutchinson & Fu, CHI 2010 - built for Gmail/YouTube-scale products) gives five categories: **H**appiness (satisfaction; SUS, NPS), **E**ngagement (frequency and depth of use), **A**doption (new users of a feature), **R**etention (return rate), and **T**ask success (completion, time, errors). You operationalize each via the **Goals → Signals → Metrics** ladder: state the goal ("reduce checkout friction"), pick observable signals ("rage clicks, abandonments"), define trackable metrics ("checkout error rate"). Pick the 2–3 HEART rows that match your product goal - chasing all five breeds vanity-metric worship.

### Design critique (evaluating with peers)

A **design critique** is a structured session where a designer presents work-in-progress for feedback. Figma's design team, which documents its practice publicly, runs them roughly one hour, two topics of 20–30 minutes each, rotating among several formats - with two non-negotiable principles:

- Critique exists to **help the presenter**, who sets the agenda and states what feedback they need: "I need feedback on the navigation model, NOT the colors - those are placeholder."
- Critique is a **safe space separated from approval decisions**. A critique is not a sign-off meeting.

Etiquette worth memorizing:

- **As presenter:** give context (problem, user, constraints, stage), ask specific questions, listen without defending, and decide later which feedback to act on.
- **As critic:** critique the work, not the person. Anchor every comment to the stated goal, user, or a principle - "does this hierarchy support the primary task?" beats "I don't like blue." Ask questions before prescribing ("what led you to put filters here?"). State problems; let the designer own solutions.

The rule of thumb: **if you can't connect a comment to a user need, a heuristic, or a project goal, it's an opinion, not a critique.**

**In short:** evaluate with experts (heuristic evaluation, cognitive walkthrough), with users and numbers (task success, SEQ, SUS, HEART), and with peers (goal-anchored critique) - each catches problems the others miss.

## Common Mistakes

1. **Starting with a solution, then doing "research" to confirm it.** That's confirmation bias, not discovery. Fix: enter Discover with questions, not answers; let the problem statement come *from* the research.
2. **Skipping Define.** No written problem statement anyone agreed to. Fix: force one sentence - [User] needs [need] because [insight] - and get it agreed before ideating.
3. **Asking users what they want or whether they'd use a feature.** The say-do gap makes answers unreliable. Fix: ask about specific past behavior; watch what people do.
4. **Stereotype personas.** Invented without research, padded with "likes jazz," then never referenced again. Fix: build personas from interviews, center them on goals, and cite them in design decisions.
5. **Testing once, at the end, with polished hi-fi.** Too late and too expensive to change anything. Fix: test lo-fi early and often - three rounds of 5.
6. **Leading test tasks.** "Click the cart icon" contains the answer. Fix: write scenarios with goals and context, zero interface vocabulary.
7. **Making quantitative claims from 5 users.** "80% of users prefer…" from 5 people is meaningless. Fix: 5 users find problems; ~40 users measure things.
8. **Shipping fixes without retesting.** Nielsen's data shows iterations sometimes regress. Fix: every fix round gets a verification round.
9. **Reading SUS as a percentage.** A 68 is dead average, not a D grade. Fix: use the Sauro/Lewis benchmarks (68 average, 80+ excellent, <51 alarming).
10. **Critiques that are secretly approval meetings, or feedback that's pure taste.** Fix: presenter states the feedback they need; critics tie every comment to a goal, user, or principle.
11. **Navigation copied from the org chart.** Users don't think in departments. Fix: open card sort with ~15 users; label things in their words.
12. **Polishing pixels on a broken IA.** Visual design cannot rescue structural confusion. Fix: tree-test the structure before wireframing.

## Best Practices Checklist

- [ ] Spend as long understanding the problem as building the solution (first diamond ≥ second).
- [ ] Interview 5–8 users per group; ask open-ended questions about specific past behavior.
- [ ] Pair analytics (where users struggle) with usability testing (why they struggle).
- [ ] Build research-based personas focused on goals; pick ONE primary persona.
- [ ] Write the job statement: "When [situation], I want to [motivation], so I can [outcome]."
- [ ] Map one actor + one scenario per journey map; treat emotional low points as your problem backlog.
- [ ] Write a problem statement - [User] needs [need] because [insight] - and get team agreement.
- [ ] Generate How-Might-We questions before generating solutions.
- [ ] Run an open card sort (~15 users) and a tree test before wireframing navigation.
- [ ] Sketch many alternatives (parallel design, crazy 8s) before committing to one.
- [ ] Test flows and IA in lo-fi; test trust, comprehension, and visuals only in hi-fi.
- [ ] Usability-test with 5 users per round, tasks written with goals and context, never interface words.
- [ ] Say "we're testing the design, not you"; use think-aloud; never help, never lead.
- [ ] Rank problems by severity (users affected × impact × persistence); fix; retest.
- [ ] Track task success rate per task; use SEQ after tasks and SUS after sessions.
- [ ] Choose 2–3 HEART metrics via Goals → Signals → Metrics; ignore vanity metrics.
- [ ] Run heuristic evaluation with 3–5 independent evaluators plus severity ratings.
- [ ] In critique, state what feedback you need; anchor all feedback to goals, users, or principles.

## Key Takeaways

- **Design is a learnable process, not artistic talent**: understand → define → ideate → prototype → test → repeat. You need observation and iteration skills, not drawing skills.
- **The Double Diamond** (Design Council, 2005) splits work into a problem space (Discover, Define) and a solution space (Develop, Deliver), each diverging before converging - protecting you from solving the wrong problem well.
- **Watch what users do; don't only trust what they say.** Interviews, surveys, analytics, and usability tests each answer different questions - combine them.
- **Personas answer who; Jobs-to-be-Done answers why.** Christensen's milkshake study shows the job (a one-handed, long-lasting commute companion) matters more than the product category.
- **Define the problem in one sentence** - [User] needs [need] because [insight] - then ideate through "How might we…?" questions.
- **Structure before surface**: card-sort (~15 users) and tree-test your information architecture, because visual polish cannot fix broken navigation.
- **Start lo-fi, finish hi-fi**: rough work invites honest criticism and cheap iteration; hi-fi validates hierarchy, trust, and real content.
- **Five users find ~85% of usability problems** (Nielsen & Landauer, L ≈ 31%) - and three rounds of 5 beat one round of 15, because you fix and re-verify between rounds.
- **Iteration is the highest-ROI design activity**: median +38% usability per iteration, 165% first-to-last in Nielsen's case studies - but retest, because some iterations regress.
- **Evaluate on evidence, not taste**: heuristic evaluation (3–5 experts), cognitive walkthroughs for first-use tasks, task success rates, SUS (68 = average, 80+ = excellent, and it's not a percentage), and goal-anchored critique.
