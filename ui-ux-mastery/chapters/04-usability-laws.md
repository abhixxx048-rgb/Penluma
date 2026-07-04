# Chapter 04: Usability Laws, Heuristics, and Mental Models

## Why this chapter matters

Imagine walking up to a glass door with a big metal handle. You pull. It doesn't move. You push. It opens. You feel silly for a second — but you shouldn't. The handle *told* you to pull. The door lied to you.

Designers have been studying moments like this for over 70 years. Out of that study came a toolkit: **laws** (stable facts about how human bodies and brains work), **heuristics** (rules of thumb for judging whether an interface respects those facts), and **mental models** (the pictures inside users' heads that explain why some designs feel obvious and others feel broken).

This chapter gives you that professional toolkit. It is the shared vocabulary designers use to defend decisions — "we made the button bigger because of Fitts's law," "we cut the menu from nine options to five because of Hick's law." When you finish, you will be able to look at any screen, or any door, and explain precisely why it works or fails.

One framing to hold onto throughout:

- **Laws** describe *human constants* — perception, memory, motor control. They don't change.
- **Heuristics** describe *interface qualities* that respect those constants. They require judgment.
- **Mental models** explain *why* violating them hurts.

---

## Laws, heuristics, and models: three kinds of tools

Let's define the three terms carefully, because people mix them up.

A **law** in UX is a research-backed regularity in human behavior. Fitts's law predicts how long it takes your finger to reach a button, with a formula. Laws are like gravity: you can't argue with them, only design around them.

A **heuristic** (say it: *hyoo-RIS-tik*) is a rule of thumb — not a checklist you pass or fail. Jakob Nielsen, one of the most influential usability researchers alive, calls his famous 10 principles "heuristics" precisely because they are broad guides that need human judgment. Think of "look both ways before crossing": almost always right, but you still have to think.

A **mental model** is the story a user believes about how something works, built from every product they used before. Mental models are always incomplete, often wrong, and different for every person — and they decide whether your design feels intuitive or confusing.

Designer Jon Yablonski, in *Laws of UX* (O'Reilly, 2020), curates 21+ of these ideas into four buckets: heuristics, principles, Gestalt laws, and cognitive biases. This chapter covers the ones every professional is expected to know.

**In short:** laws are facts about humans, heuristics are judgment tools for interfaces, and mental models are the beliefs that connect the two.

---

## Nielsen's 10 Usability Heuristics

In 1990, Jakob Nielsen and Rolf Molich compressed everything known about usability into a short list. In 1994, Nielsen refined it using a **factor analysis of 249 real usability problems** — a statistical method for finding which small set of principles explains the most failures. The resulting 10 heuristics have stayed essentially unchanged for over 30 years, because they describe humans, and humans haven't changed. Here they are, each with real violations.

### H1 — Visibility of system status

**What it is:** the system should always tell users what is going on, through timely feedback.

**Why it matters:** think of an elevator with no floor indicator. Is it moving? Did it hear you? You press the button again. Users do the same on screens: click "Submit," see nothing happen, click again — and place a double order.

- **Good:** progress bars; "Saving… / Saved" in Google Docs; order-tracking steps in food-delivery apps; a "You are here" mall-map marker.
- **Violations:** a file upload with no progress bar; a bare spinner for a 30-second process; a Submit button that gives no visible response.

### H2 — Match between system and the real world

**What it is:** speak the user's language. Use familiar words and concepts, not internal company jargon, and present information in a natural order.

- **Good:** the trash can icon for delete; an e-commerce "cart"; stove controls arranged to mirror the burner layout.
- **Violations:** an error reading "SQLSTATE 23000 integrity constraint violation"; a bank app saying "ACH origination failed" instead of "Your transfer didn't go through"; airline sites exposing "GDS fare class" codes to travelers.

### H3 — User control and freedom

**What it is:** users make mistakes and need a clearly marked "emergency exit" — undo, redo, cancel, back — without a long ordeal.

- **Good:** Gmail's "Undo send"; Ctrl+Z everywhere; a visible "X" on every modal; "Remove item" in a cart.
- **Violations:** wizards you can't back out of; subscriptions with no findable cancel; modals that trap you. The worst is a deliberate dark pattern, the **roach motel**: easy in, hard out.

### H4 — Consistency and standards

**What it is:** users should never have to wonder whether different words or actions mean the same thing. There are two kinds:

- **Internal consistency** — within your own product. Pick one word for an action and stick to it.
- **External consistency** — follow platform and industry conventions. (This is where Jakob's law, coming up later, lives.)

- **Good:** logo in the top-left links home; cart icon top-right; consistent button styles on every screen.
- **Violations:** using "Delete," "Remove," and "Discard" interchangeably for the same action; a swipe meaning "archive" on one screen and "delete" on another.

### H5 — Error prevention

**What it is:** the best designs stop problems before they happen — like guard rails on a mountain road (Nielsen's own metaphor). Prevent **high-cost errors first**.

- **Good:** date pickers that gray out unavailable dates; Gmail's "You mentioned an attachment but didn't attach a file"; seat maps that won't let you pick an occupied seat; Submit disabled until required fields are valid.
- **Violations:** free-text date fields accepting any format; "Delete account" two millimeters from "Save changes" — NN/g calls this the **dangerous proximity** of consequential and benign options; bulk delete with no confirmation.

### H6 — Recognition rather than recall

**What it is:** minimize memory load by keeping options visible. **Recognizing** something is far easier than **recalling** it from scratch — you can recognize Lisbon as Portugal's capital more easily than produce the name from nothing.

- **Good:** menus instead of command lines; autocomplete; recently-viewed items; password rules shown *while* you type; a persistent cart summary during checkout.
- **Violations:** forcing users to memorize a coupon code from a previous page; comparison flows where item A's specs vanish when you view item B; features reachable only by hidden keyboard shortcuts.

### H7 — Flexibility and efficiency of use

**What it is:** provide **accelerators** — shortcuts invisible to beginners that let experts fly. A good interface serves both.

- **Good:** keyboard shortcuts (Gmail's "e" to archive); saved payment methods; "reorder" buttons; swipe gestures that coexist with tap paths; browser autofill.
- **Violations:** forcing a power user through the same six-step wizard for the hundredth time; an admin table with no bulk actions.

### H8 — Aesthetic and minimalist design

**What it is:** interfaces shouldn't carry irrelevant or rarely needed information. Every extra element competes with the relevant ones and dims their visibility. Important: this is about *focused content*, not about flat visuals or worshipping whitespace.

- **Good:** Google's homepage; Stripe's single-purpose checkout screen.
- **Violations:** dashboards with 40 metrics when 3 matter; promotional banners crowding the primary task; ornate decoration that interferes with function — Nielsen's example is a beautifully ornamented teapot that's miserable to pour.

### H9 — Help users recognize, diagnose, and recover from errors

**What it is:** when errors do happen, the message should be in plain language (no codes), say precisely what went wrong, and constructively suggest a fix. Use conventional visuals: red, bold, next to the problem field.

- **Good:** "That username is taken. Try username_2026 or pick another." Inline validation right beside the offending field.
- **Violations:** "Error 402"; "Invalid input"; a form that wipes every field on error; error text at the top of a long page while the broken field sits below the fold.

NN/g even publishes a scoring rubric for error messages: explicit, human-readable, polite, precise, constructive — and always preserve the user's work.

### H10 — Help and documentation

**What it is:** ideally the system needs no manual. When help is needed, it should be searchable, contextual, concrete, and delivered at the moment of need.

- **Good:** contextual tooltips; a small "?" next to a complex field; searchable help centers; guided in-app onboarding.
- **Violations:** a 90-page PDF manual; help articles describing an older version of the UI; onboarding tours that dump 12 tips at once (which also violates H8).

### Using the heuristics: heuristic evaluation

The heuristics power a formal method called **heuristic evaluation**: several experts independently inspect an interface against the list, then pool their findings and rate severity (frequency × impact × persistence).

The numbers are famous. Nielsen and Landauer (1993) found a single evaluator catches on average only about **34%** of usability problems (19–51% across six case studies). **Five evaluators together find roughly 75–85%.** Beyond five, returns fall off sharply — the "Nielsen curve." Hence the standard advice: use 3–5 evaluators, evaluate independently first, aggregate afterward. One warning: heuristic evaluation finds *expert-predictable* problems only — it is no substitute for watching real users.

**In short:** Nielsen's 10 heuristics are a 30-year-proven lens for spotting usability problems — apply them with judgment, in teams of 3–5, and never instead of real user testing.

---

## The Laws of UX

Now the laws — the human constants. Each one below tells you *what* it is, *how* it works, and *how to apply it*.

### Fitts's Law: big and close beats small and far

Psychologist Paul Fitts showed in **1954** that the time to move your hand (or cursor, or thumb) to a target depends on two things: how **far** the target is and how **big** it is. Formally: MT = a + b·log₂(2D/W). You don't need the math — the lesson is: *big, close targets are fast; small, far ones are slow and error-prone.*

Think of a dartboard. Hitting the whole board from one step away is trivial. Hitting the bullseye from across the room is hard. Every button on a screen is a dartboard.

A powerful corollary: **screen edges and corners are "infinitely deep"** — you can fling the cursor at the top edge and it stops there, impossible to overshoot. That's why macOS puts the menu bar at the top edge and Windows puts Start in a corner.

**Concrete standards worth memorizing:**

| Standard | Minimum touch target |
|---|---|
| Apple Human Interface Guidelines | 44 × 44 pt |
| Material Design 3 (Google) | 48 × 48 dp, with at least 8 dp spacing |
| WCAG 2.2, SC 2.5.8 (Level AA) | 24 × 24 CSS px |
| WCAG 2.1, SC 2.5.5 (Level AAA) | 44 × 44 CSS px |

**Violations:** the tiny "×" on mobile ads — often deliberately tiny, a dark pattern; "Delete" placed 2 px from "Reply"; footer links jammed together. And the flip side of proximity: keep **destructive actions physically distant** from safe ones.

### Hick's Law: more choices, slower decisions

William Hick (1952) and Ray Hyman (1953) — hence the "Hick–Hyman law" — showed that decision time grows **logarithmically** with the number of choices: RT = a + b·log₂(n+1). In plain terms: every extra option adds thinking time, though each addition hurts a bit less than the last.

Picture a restaurant. A menu with 6 dishes: you order in a minute. A menu with 120 dishes: you flip pages, ask the waiter, second-guess yourself. Same hunger, ten times the effort.

**Applications:** trim menu options; use **progressive disclosure** (show advanced options only when asked — like a menu's "chef's specials" card on top of the full menu); break long forms into steps; highlight a recommended option; ship smart defaults.

A famous companion finding is the **paradox of choice**: Iyengar and Lepper's jam study found that a supermarket table with 24 jams drew more browsers but roughly **10× fewer purchases** than a table with just 6.

**Caveats:** Hick's law applies to *simple, ordered* decisions. It does not mean "dumb everything down" — experts sometimes need dense choice sets, and over-simplifying collides with Tesler's law (below).

### Jakob's Law: your users live on other sites

Jakob Nielsen formulated this in *Designing Web Usability* (2000): "Users spend most of their time on **other** sites, so they expect your site to work like all the other sites they already know." Roughly **95–99% of a user's time** is spent elsewhere — so their mental model of "how websites work" was built by everyone except you.

It's like driving in a foreign country. If the steering wheel were on a different side *and* the pedals were rearranged *and* red lights meant go, you'd crash. Conventions are what let strangers operate your product instantly.

**Applications:** logo top-left goes home; cart top-right; standard checkout flows; platform-native controls. The rule of thumb: **innovate on your value, be boring about your conventions.** If you must change a familiar pattern, offer a transition — YouTube let users opt back into the old design during redesigns.

**Cautionary tale:** Snapchat's 2018 redesign relocated core actions. The backlash included a petition with **over 1.2 million signatures**.

### Miller's Law: about seven chunks — and the myth around it

George A. Miller's 1956 paper "The Magical Number Seven, Plus or Minus Two" found that the average person holds about **7±2 chunks** in **working memory** — the mental scratchpad where you hold information you're actively using. Modern research (Cowan, 2001) suggests the true number is closer to **4±1**.

The durable takeaway is **chunking**: grouping items into meaningful units expands effective capacity. That's why phone numbers are written 555-867-5309 and credit-card fields group digits in fours. Group navigation items into labeled categories for the same reason.

**Now the myth — memorize this correction:** "menus must have at most 7 items" is a *misuse* of Miller's law. A menu on screen is **recognition**, not recall — nothing needs to be held in memory, because it's all visible. Miller's law applies where users must *carry* information in their head between steps, like remembering a code from one page to enter on the next.

### Tesler's Law: complexity never disappears, it only moves

Larry Tesler of Xerox PARC argued in the mid-1980s that every application has an **irreducible amount of complexity**. You cannot delete it — the only question is *who absorbs it*: the user, the developer, or the platform. This is the **Law of Conservation of Complexity**. Tesler's argument: if a million users each waste a minute a day on complexity an engineer could have eliminated in a week, you are penalizing users to make the engineer's job easier.

**Complexity absorbed by software:** email needs a From and a To — good clients prefill "From" and autocomplete "To"; address autocomplete; auto-detecting card type from the number; Apple Pay collapsing checkout into one gesture.

**The tension:** simplifying *past* the irreducible core doesn't remove complexity — it relocates it into user confusion and support tickets. Beware "simplicity theater": a screen that looks clean but made the user do the machine's job.

### The Doherty Threshold: keep the conversation under 400 ms

In 1982, IBM researchers Walter Doherty and Ahrvind Thadani showed that productivity soars when computer and user interact at a pace under **400 milliseconds** — fast enough that neither is waiting on the other. Sub-400 ms systems produced **25–30% more transactions per hour**, and productivity improved *more than proportionally* as response time dropped.

Pair this with **Nielsen's three response-time limits**, rooted in decades of human-factors research:

| Limit | What the user experiences | What you must do |
|---|---|---|
| **0.1 s** | Feels instantaneous | No feedback needed |
| **1.0 s** | Delay noticed, but flow of thought survives | Show a cursor/spinner beyond this |
| **10 s** | Attention limit reached | Show percent-done progress and a cancel option |

**When you can't be fast, feel fast:** optimistic UI (show the "like" instantly, reconcile with the server later), skeleton screens, progress bars that never appear to stall. And sometimes *slowing down* builds trust — a security scan that animates its "work" feels more thorough than an instant result.

### The Aesthetic-Usability Effect: pretty things feel easier

Users perceive beautiful designs as more usable — and forgive minor flaws in them.

The landmark study: Masaaki Kurosu and Kaori Kashimura at Hitachi Design Center, **1995**, tested **26 ATM interface variations with 252 participants**. The correlation between aesthetic appeal and *perceived* ease of use (r ≈ 0.59) was much stronger than with *actual* ease of use. Noam Tractinsky replicated it in Israel in 1997 — the effect held, even stronger.

**Implications:** visual polish buys forgiveness and trust, but has a dangerous side in research: participants praise a pretty prototype while failing tasks in it. NN/g's warning: watch what testers *do*, not just what they say. And know the limit — aesthetics cover *minor* issues only; a serious blocker overwhelms any amount of beauty.

### The Peak-End Rule: memory keeps two snapshots

Daniel Kahneman and colleagues showed that people judge an experience by its **most intense moment (the peak)** and its **end** — not by the average or the total. Length barely matters; psychologists call that "duration neglect."

The evidence is striking. In Kahneman and Redelmeier's 1996 colonoscopy study, patients rated the whole procedure by its worst and final moments; a follow-up that added three *milder* minutes at the end made patients rate the objectively *longer* procedure as *less* unpleasant.

**UX applications:** engineer a peak (Mailchimp's high-five after you send a campaign; Duolingo's celebration animations) and stick the ending (delightful order confirmations, *generous cancellation flows*). Audit every journey for negative peaks — payment failures, error walls — because those dominate memory.

### The Von Restorff Effect: the odd one out gets remembered

Hedwig von Restorff showed in **1933** that among similar items, the one that *differs* is most remembered — also called the **isolation effect**. Think of one red apple in a crate of green ones.

**Applications:** exactly one visually distinct primary call-to-action per screen; the highlighted "Most popular" pricing tier; destructive actions in red among neutral buttons; notification badges.

**Cautions:** if everything is highlighted, nothing is — competing accents cancel out. Never rely on **color alone**: WCAG 1.4.1 requires non-color cues, because roughly 8% of men are color-blind. And overdone contrast has a cost: years of screaming ads trained users into "banner blindness."

### The Zeigarnik Effect: open loops stick in the mind

In 1927, Bluma Zeigarnik (working with Kurt Lewin) noticed a waiter who perfectly recalled unpaid orders — and forgot them the moment the bill was paid. Her experiments found interrupted tasks were recalled about **90% better** than completed ones. Unfinished business occupies the mind.

**Applications:** LinkedIn's profile-completeness meter (completion rates jumped after adding progress prompts); onboarding checklists with progress bars; Netflix's "resume watching" row; Duolingo streaks and unfinished-lesson nudges; abandoned-cart emails.

**Companion — the Goal-Gradient Effect:** motivation accelerates near the finish line (Hull, 1932). In the coffee-card study (Nunes & Drèze, 2006), customers given a 12-stamp card with 2 stamps *pre-filled* completed it faster than those with a blank 10-stamp card — same distance, but *endowed progress* pulled them forward. So start progress bars at ~20%, not 0. **Ethical caution:** this same mechanism powers manipulative FOMO loops. Use it to help users finish tasks *they* value, not to farm engagement.

### Postel's Law: be liberal in, conservative out

Jon Postel wrote it as a networking guideline in 1980 (RFC 761): "Be conservative in what you send, be liberal in what you accept." The UX translation: **accept varied, imperfect input; give back precise, well-formed output.**

A good waiter accepts "the pasta thing with the mushrooms" and brings exactly the right dish. A bad form rejects `4111 1111 1111 1111` because the user typed spaces. The machine should strip the spaces, not scold the human — that violation is also a Tesler's-law failure, shoving the machine's complexity onto the user.

**Applications:** phone and card fields that normalize spaces, dashes, and parentheses; search that tolerates typos ("did you mean…"); date fields accepting "tomorrow"; case-insensitive email login; responsive layouts and progressive enhancement (being "liberal" about devices and screen sizes).

### Quick mentions from the same family

- **Serial Position Effect:** first and last items in a list are remembered best — put key actions at the ends of navigation bars (why "Home" and "Profile" anchor mobile tab bars).
- **Gestalt laws (Proximity, Similarity, Common Region):** spatial grouping communicates relationships — covered fully in the visual-design chapter.
- **Parkinson's Law:** tasks inflate to the time available — checkout hold timers compress effort.
- **Pareto Principle:** ~80% of usage hits ~20% of features — optimize the vital few paths.
- **Occam's Razor:** among equally good solutions, ship the simplest.

**In short:** the Laws of UX are human constants — motor control (Fitts), decision load (Hick), habit (Jakob), memory (Miller, von Restorff, Zeigarnik, peak-end), complexity (Tesler), speed (Doherty), beauty (aesthetic-usability), and forgiveness (Postel) — and every good screen quietly obeys most of them.

---

## Don Norman and The Design of Everyday Things

Don Norman is a cognitive scientist who coined "user experience" at Apple in the 1990s and co-founded Nielsen Norman Group. His book *The Design of Everyday Things* (1988, revised 2013) supplies the deepest layer of the toolkit: the concepts explaining *why* the laws and heuristics work. Most of his examples are doors, stoves, and faucets — proof these ideas predate screens.

### Affordances: what an object allows

An **affordance** is a possible action that the relationship between a person and an object allows. A chair affords sitting. A handle affords pulling. A flat plate affords pushing. Norman adapted the term from psychologist J.J. Gibson.

The key nuance: affordances are **relationships, not properties**. Stairs afford climbing *for an adult* — not for an infant. The affordance lives between the object and the specific user.

Common professional misuse: designers say "add an affordance" when they mean "add a *signifier*." Norman added the signifier concept in the 2013 revision precisely to fix this confusion.

### Signifiers: what tells you the affordance exists

A **signifier** is a perceivable cue that *communicates* where and how to act: the flat push-plate on a door, a button's shadow, an underlined link, the "Push" label, a drag handle's ripple texture. Signifiers *signal* affordances.

On screens, almost everything designers make is signifier work — a link is only useful if users can *tell* it's clickable. This is why extreme flat design has a real cost: Nielsen Norman Group research found that flat UIs that removed signifiers (borders, button shadows) increased click uncertainty — users needed measurably more effort to figure out what was interactive.

### Mapping: controls that mirror their effects

**Mapping** is the relationship between controls and their effects. **Natural mapping** exploits spatial analogy: stove knobs arranged like the burners they control; a volume slider where up means louder.

The classic failure is the stove with four identical knobs in a straight row controlling four burners in a square:

```
  Burners:        Knobs:
  [1] [2]
                  (?) (?) (?) (?)
  [3] [4]
```

Which knob is which? Everyone needs labels, and everyone still turns on the wrong burner. Redraw it with the knobs in a matching square, and no labels are needed at all.

### Feedback: proof that something happened

**Feedback** is immediate, informative confirmation that an action occurred and what the result was. It must be prompt (recall the Doherty threshold and Nielsen's timing limits), proportionate (not twenty confirmations), and prioritized. And note: vague feedback — "Something went wrong" — can be worse than none, because it confirms failure without helping.

### Constraints: making the wrong action impossible

**Constraints** limit possible actions so errors can't happen. Norman names four types:

| Type | Meaning | Example |
|---|---|---|
| **Physical** | The shape prevents wrong use | A SIM card only fits one way; USB-C removed the orientation problem entirely |
| **Cultural** | Learned conventions | Red = stop/danger; checkmark = done |
| **Semantic** | Meaning dictates placement | A motorcycle windshield must face forward |
| **Logical** | Only one option remains | One piece left, one hole left; a grayed-out button says "not now" |

On screens, constraints look like date pickers, character counters, disabled states, and input masks. Constraints are the primary engine of error *prevention* — Nielsen's H5 in mechanical form.

### Conceptual models, mental models, and the system image

Here is Norman's most important idea.

- The user's **mental model** is what they *believe* about how the system works — assembled from prior experience (Jakob's law is really a mental-model claim). Always incomplete, often wrong, unique to each person.
- The designer's **conceptual model** is the model the design *projects*.
- The **system image** — the UI, docs, marketing — is the *only channel* between the two. The designer never gets to explain in person. If the system image is incoherent, users invent wrong mental models.

The classic mismatch: home thermostats. Many people hold a false "valve" model — believing that cranking the dial to 90° heats the house *faster*, like opening a tap wider. In reality a thermostat is a switch with a target: it heats at one speed until the target is reached. Cranking does nothing but overshoot.

Research summaries report that interfaces matching users' mental models cut task time by roughly 34% and errors by roughly 42%, with about 60% less training time versus novel frameworks (indicative figures, not canonical). When you find a mismatch, you have two options: **change the design to fit the dominant mental model** — the usual answer; if people look in the wrong place, move it to where they look — or **teach the user** (onboarding, labels), only when the new model genuinely pays off.

### The Seven Stages of Action and the two Gulfs

Norman models every interaction as a cycle:

```
        GOAL
         |
   ------+---------------------------
   |  EXECUTION          EVALUATION |
   |  1. Plan            5. Perceive|
   |  2. Specify         6. Interpret
   |  3. Perform         7. Compare |
   ------+---------------------------
         |
     (back to goal)
```

Two gaps can open in this cycle:

- The **Gulf of Execution** (plan → specify → perform): the gap between what the user wants to do and what the system lets them figure out how to do. *"How do I work this?"* Bridged by **signifiers, constraints, mappings, and a good conceptual model**.
- The **Gulf of Evaluation** (perceive → interpret → compare): the gap between what the system did and the user's understanding of whether it worked. *"What happened? Did it work?"* Bridged by **feedback and the conceptual model**.

Those two italicized questions are a complete diagnostic kit. Ask them of any screen.

### Norman doors

We opened the chapter with one. A **Norman door** gives wrong usability signals — a graspable pull handle on a door you must push. If a door needs a "Push" or "Pull" sticker, the design has already failed: the hardware itself should signify (flat plate = push, handle = pull). The term comes from *The Design of Everyday Things* and was popularized by a 2016 video from 99% Invisible and Vox.

The Norman door is the canonical teaching example of Norman's central moral: **blame for user error belongs to the design, not the user.** The door's maker prioritized form over function; the person who pulled did exactly what the handle told them to.

### Discoverability

**Discoverability** is Norman's umbrella quality: can users figure out *what actions are possible and how to perform them* just by looking? It is achieved through everything above — affordances, signifiers, mapping, feedback, constraints, and a coherent conceptual model.

The modern tension: gesture-driven, minimalist UIs trade discoverability for cleanliness — hidden swipe actions, hamburger menus, long-press features. NN/g findings are blunt: hidden navigation measurably reduces feature usage. Rules of thumb: keep core actions visible; for every gesture, provide one visible alternative path; use progressive disclosure for the rest.

Norman's two lines worth keeping on a sticky note: *"Two of the most important characteristics of good design are discoverability and understanding,"* and: design for how people actually behave, not how you wish they behaved.

**In short:** Norman's toolkit — affordances, signifiers, mapping, feedback, constraints, and conceptual models — bridges the Gulfs of Execution and Evaluation, and puts responsibility for "user error" where it belongs: on the design.

---

## Error prevention and recovery: a deep dive

Errors deserve their own section because they are where usability failures cost real money — and where several laws converge.

### Slips vs. mistakes

Norman's taxonomy, elaborated by NN/g, splits errors into two very different animals:

| | Slip | Mistake |
|---|---|---|
| **What went wrong** | Right goal, wrong execution | Wrong goal or plan |
| **Mental state** | Autopilot, low attention | Conscious, but working from a faulty mental model |
| **Everyday example** | Putting soap on your toothbrush | Cranking the thermostat to 90° to "heat faster" |
| **Screen example** | Tapping the adjacent button; a typo | Choosing the wrong shipping option because the labels misled you |

Counterintuitive but important: **expert users slip more** on familiar flows, because their attention is lowest where their habit is strongest. Prevention differs by type:

- **Prevent slips with:** constraints, good defaults, forgiving formatting (Postel), large well-spaced targets (Fitts), input masks, autocomplete.
- **Prevent mistakes with:** designs matching the user's mental model, previews of consequences ("This will delete 214 photos"), fewer memory burdens, clear labels, warnings *before* commitment.

### The recovery toolkit, in order of preference

1. **Undo beats confirm.** Confirmation dialogs get dismissed on autopilot — psychologists call this **habituation**: repeated exposure numbs the response. Undo (Gmail's undo send, trash-with-restore, soft delete) protects without interrupting. Reserve confirmations for rare, high-cost, irreversible actions — and make them describe the consequence, not just ask "Are you sure?"
2. **Inline, immediate validation** at the field, not after submit. Never wipe user input on error.
3. **Good error messages:** visible, human-readable, precise about what went wrong, constructive about the fix, polite — never blaming the user — with no codes or jargon, and always preserving the user's work. Anti-patterns: "Invalid input," all errors dumped at the top of the page, raw stack traces shown to end users.
4. **Safe defaults and destructive-action distance:** keep "Delete" far from "Save"; require typed confirmation for catastrophic actions — GitHub makes you type the repository's name to delete it.

### Why this is the highest-ROI usability work

The Baymard Institute's 2025 aggregate of 48+ studies puts average cart abandonment at **70.19%**; **17%** of US shoppers abandoned an order last quarter specifically because checkout was "too long / complicated"; the average US checkout shows **23.48 form elements** against an ideal of ~**12**; and better checkout design alone can lift conversion by roughly **35%** — about **$260 billion** in recoverable orders across the US and EU. Every one of those numbers is Nielsen's H5 and H9, plus Postel and Tesler, expressed in dollars.

**In short:** classify the error (slip or mistake), prevent it with constraints and forgiveness, and when it slips through, prefer undo over confirmation and never destroy the user's work.

---

## Common Mistakes

- **Capping menus at 7 items "because of Miller's law."** Menus are recognition, not recall — nothing is held in memory. *Fix:* apply Miller's law only where users must carry information between steps; group menu items with chunking instead of cutting them.
- **Saying "affordance" when you mean "signifier."** The affordance is the possible action; the signifier is the visible cue. *Fix:* use "signifier" for anything you can point at on a screen — Norman added the term for exactly this reason.
- **Treating heuristics as a pass/fail checklist.** They are lenses that need judgment, and heuristic evaluation catches only expert-predictable problems. *Fix:* use 3–5 independent evaluators, rate severity, and always pair with real usability testing.
- **Letting prettiness contaminate research.** The aesthetic-usability effect makes testers praise beautiful prototypes they can't actually use. *Fix:* measure task success and watch behavior; discount verbal praise of visuals.
- **Stripping all signifiers for minimalism.** Flat buttons without borders or shadows measurably increase click uncertainty, and hidden gestures kill discoverability. *Fix:* keep core actions visible; give every gesture a visible alternative path.
- **Over-applying Hick's law until capability disappears.** Removing options past the irreducible core just relocates complexity onto the user (Tesler). *Fix:* use progressive disclosure and smart defaults instead of deletion.
- **Relying on confirmation dialogs for safety.** Habituation makes users dismiss them on autopilot. *Fix:* provide undo; reserve confirmations — with consequences spelled out — for rare, irreversible actions.
- **Using engagement psychology against users.** Zeigarnik loops, goal gradients, and scarcity become dark patterns when they serve metrics over user goals. *Fix:* apply them only to tasks the user genuinely wants to finish.

---

## Best Practices Checklist

- [ ] Every action produces visible feedback within 1 second; anything over 10 seconds shows progress and a cancel option (H1, Doherty).
- [ ] All copy uses the user's words — no internal jargon or error codes (H2, H9).
- [ ] Every flow has a clearly marked exit: undo, cancel, back (H3).
- [ ] One word per action, used consistently; platform conventions followed unless a deviation clearly pays for itself (H4, Jakob).
- [ ] High-cost errors are prevented with constraints, previews, and confirmation-by-typing where truly irreversible (H5, Norman's constraints).
- [ ] Nothing requires users to remember information across screens; options are visible or autocompleted (H6, Miller).
- [ ] Expert accelerators exist (shortcuts, bulk actions, saved defaults) without complicating the novice path (H7).
- [ ] Each screen has exactly one visually distinct primary action, and it's never color-only (H8, von Restorff, WCAG 1.4.1).
- [ ] Touch targets are at least 44 pt / 48 dp, with destructive actions distant from safe ones (Fitts).
- [ ] Long choice sets are grouped, defaulted, or progressively disclosed (Hick).
- [ ] Forms accept messy-but-unambiguous input and normalize it silently (Postel, Tesler).
- [ ] Errors validate inline, preserve all user input, and say what went wrong plus how to fix it (H9).
- [ ] Progress indicators start above zero and unfinished states invite resumption — ethically (Zeigarnik, goal-gradient).
- [ ] The last screen of every flow — including cancellation — has been deliberately designed (peak-end).
- [ ] Design reviews ask the two Gulf questions of every screen: "How do I work this?" and "Did it work?"

---

## Key Takeaways

- **Laws describe humans, heuristics describe interfaces, mental models connect them.** Laws don't change; your designs must adapt to them.
- **Nielsen's 10 heuristics have explained usability failures for 30+ years**; applied by 3–5 independent evaluators, they catch roughly 75–85% of problems — but never replace testing with real users.
- **Fitts and Hick govern the physical and mental cost of every action:** make targets big and close (44 pt / 48 dp minimums) and keep simple choice sets small.
- **Jakob's law means convention is a feature:** users spend 95–99% of their time elsewhere, so be boring about patterns and innovative about value.
- **Complexity is conserved (Tesler):** you can only move it between the user, the developer, and the platform — move it away from the user.
- **Speed is usability:** under 400 ms keeps humans in flow (Doherty); 0.1 s / 1 s / 10 s are the three thresholds that dictate what feedback you owe.
- **Memory is biased:** people remember the peak, the end, the odd one out, and the unfinished (peak-end, von Restorff, Zeigarnik) — design those moments deliberately and ethically.
- **Norman's toolkit — signifiers, mapping, feedback, constraints, conceptual models — bridges the Gulfs of Execution and Evaluation**; if users need a "Push" sticker, the design already failed.
- **User error is design error:** prevent slips with constraints and forgiveness, prevent mistakes by matching mental models, and prefer undo to "Are you sure?"
- **Errors are where usability meets money:** with 70% average cart abandonment and ~$260B in recoverable orders, forgiving forms are the highest-ROI usability work you can do.
