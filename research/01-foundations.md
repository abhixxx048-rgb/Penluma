# Research Notes — Chapter 1: Foundations — What UI and UX Really Are

Research date: 2026-07-04. Sources: Nielsen Norman Group, jnd.org (Don Norman's own site), Laws of UX, Interaction Design Foundation, jjg.net (Jesse James Garrett's original PDF), Vitsoe/Design Museum (Dieter Rams), GOV.UK Design System, plus published stats from Forrester and McKinsey. All URLs in Sources section at the end.

---

## 1. Precise definitions: UX vs UI

### The canonical definition of UX (Nielsen Norman Group)
Don Norman and Jakob Nielsen's official definition, published on nngroup.com:

> "User experience encompasses **all aspects of the end-user's interaction with the company, its services, and its products**."

Key implications of this definition (from NN/g's "The Definition of User Experience"):
- UX is NOT just the app or website. It includes marketing emails, packaging, customer support calls, onboarding, billing, the unboxing, the return process — the entire journey.
- Exemplary UX = "meeting the exact needs of the customer, without fuss or bother," followed by "simplicity and elegance that make products a joy to own, a joy to use."
- True UX goes **beyond giving customers what they say they want or providing checklist features**. It requires seamless merging of engineering, marketing, graphic/industrial design, and interface design.

### The definition of UI
UI (user interface) = the set of components (buttons, links, inputs) and design elements (images, icons, typography, headers, layout) through which a person actually operates a product. UI is **how the product looks and how the user physically/visually interacts with it**. It is the touchpoint layer.

### How they differ — the NN/g movie-review example
NN/g's classic illustration: imagine a movie-review website with a flawless interface — beautiful, fast, easy to search. **If the database doesn't contain the movie you're looking for, the UX is still bad.** Perfect UI, failed UX. This one example cleanly separates the concepts: UI is a component of UX; UX is the whole outcome.

### UX vs usability (a second important distinction)
- **Usability** = a quality attribute of the UI: is it easy to learn, efficient to use, error-tolerant, pleasant? (Nielsen's classic five components of usability: learnability, efficiency, memorability, errors, satisfaction.)
- **UX** = the broader umbrella. Usability is necessary but not sufficient for good UX. Something can be usable but pointless (fails "useful"), or usable but untrustworthy (fails "credible").

### How they overlap
- UI decisions directly shape the experience: a confusing button placement is both a UI defect and a UX problem.
- In small teams one person often does both; in mature orgs UX splits into research, information architecture, content design, interaction design, and UI/visual design.
- Useful analogy set (use with caution, but popular in teaching): UX is the architecture/floor plan of a house; UI is the paint, fixtures, and door handles. Or: UI is the saddle, stirrups, and reins; UX is the feeling of riding the horse.

### Peter Morville's UX Honeycomb (7 facets of good UX)
Information architect Peter Morville's framework — a checklist of what "good UX" must satisfy, designed to push conversations beyond mere usability:
1. **Useful** — fulfills a real need
2. **Usable** — easy to use and understand
3. **Desirable** — evokes emotion/appreciation; visually attractive
4. **Findable** — content is navigable and locatable
5. **Accessible** — usable by people with disabilities (~1 in 6 people worldwide have a significant disability, per WHO)
6. **Credible** — users trust the product and company
7. **Valuable** — delivers value to the business AND the user
Teams use the honeycomb during research, wireframing, and critique to expose trade-offs explicitly.

---

## 2. History of the field

### Industrial-design and human-factors roots (pre-computer)

**1900s–1910s — Taylorism and early ergonomics.** Frederick Taylor's time-and-motion studies (and Frank/Lillian Gilbreth's work) were the first systematic attempts to optimize the interaction between workers and their tools — proto-UX, albeit efficiency-first rather than human-first.

**1920s–1930s — Birth of industrial design in the US.** Design offices founded in New York by Norman Bel Geddes, Walter Dorwin Teague, Henry Dreyfuss, and Raymond Loewy created the profession.
- **Raymond Loewy (1893–1986)** — "father of industrial design" (Coca-Cola fountain, Lucky Strike pack, Studebaker Avanti, Air Force One livery, Greyhound bus). His **MAYA principle: "Most Advanced Yet Acceptable"** — the best design balances innovation against what the public is ready to accept. Push too far past users' familiarity and they reject the product. MAYA is essentially Jakob's Law 60 years early, and is still cited for adoption of new UI paradigms (e.g., AI interfaces).
- **Henry Dreyfuss** — designed "for people": brought **anthropometrics** (systematic body-measurement charts of men, women, and children, published in *Designing for People*, 1955, and *The Measure of Man*, 1960) into product design — the Bell telephone handset, Honeywell round thermostat. His charts ("Joe and Josephine") are the direct ancestor of touch-target-size guidelines.

**WWII (1940s) — Human factors is born from plane crashes.** Psychologist **Alphonse Chapanis** investigated why trained pilots of B-17s, B-25s, and P-47s kept retracting the landing gear instead of the flaps after landing. Finding: the two controls were **identical switches, placed side by side**. It wasn't "pilot error" — it was **designer error**. Fix: a small rubber wheel shape on the gear lever and a wedge shape on the flap lever (shape coding). Crashes of that type stopped; the shape-coded controls were standardized worldwide after the war. Chapanis published the first ergonomics textbook, *Applied Experimental Psychology: Human Factors in Engineering Design* (1949). Teaching point: **"human error" is usually design error** — the founding insight of the entire field.

- **Dieter Rams (b. 1932, Braun/Vitsoe)** — the design-philosophy bridge from industrial design to modern UI. His **Ten Principles of Good Design**: good design is (1) innovative, (2) useful, (3) aesthetic, (4) makes a product understandable, (5) honest, (6) unobtrusive, (7) long-lasting, (8) thorough down to the last detail, (9) environmentally friendly, (10) as little design as possible. Motto: **"Weniger, aber besser" — less, but better.** Apple's Jony Ive openly cited Rams; compare the Braun T3 pocket radio (1958) to the original iPod. Principle 4 ("makes a product understandable — ideally self-explanatory") is essentially the definition of intuitive UI.

### Human-computer interaction (HCI) roots

- **1968 — "The Mother of All Demos."** Douglas Engelbart (Stanford Research Institute), Dec 9, 1968, San Francisco: a 90-minute live demo of the **NLS (oN-Line System)** showing the **computer mouse, windows, hypertext, real-time collaborative editing, and video conferencing** — decades ahead of adoption.
- **1970s — Xerox PARC.** Engelbart's collaborators (incl. Bill English) moved to Xerox PARC; the **Xerox Alto (1973)** developed the GUI as we know it: icons, folders, overlapping windows, the desktop metaphor, WYSIWYG editing.
- **1983 — "The Psychology of Human-Computer Interaction"** (Card, Moran, Newell) formalizes HCI as an academic field; Fitts's Law (1954, originally a motor-control study) becomes an interface law.
- **1984 — Apple Macintosh** commercializes the mouse + GUI for a mass market (following the 1983 Lisa and 1981 Xerox Star).
- **1988 — Don Norman publishes *The Psychology of Everyday Things*** (renamed *The Design of Everyday Things*, revised 2013) — the field's most-recommended book.
- **1990 — Nielsen & Molich publish heuristic evaluation; 1994 — Jakob Nielsen finalizes the 10 Usability Heuristics** (at Bell Communications Research, via factor analysis of a database of real usability problems). Still the most widely used UX checklist today.
- **1993 — Don Norman coins "user experience" as a job title at Apple.** Details below.
- **1998 — Nielsen Norman Group founded** by Jakob Nielsen and Don Norman.
- **2000 — Jesse James Garrett publishes the Elements of UX diagram (book 2002).**
- **2007 — iPhone** makes touch UI mainstream; UX becomes a mass profession in the 2010s.

### Don Norman coining "UX" — the accurate story (from Norman's own jnd.org)
- Norman joined Apple in **1993 as an Apple Fellow**. He felt existing terms were too narrow. His own words: *"I thought Human Interface and usability were too narrow: I wanted to cover all aspects of the person's experience with a system, including industrial design, graphics, the interface, the physical interaction, and the manual."*
- With **Tom Erickson and Harry Saddler** he formed the **"User Experience Architect's Office"** — the first time "user experience" appeared in a job title. Norman modestly says: "I do not know how we arrived at the name, so I prefer to give credit to the group."
- **Nuance most articles miss:** Norman himself credits **Brenda Laurel**, whose 1986 essay "Interface as Mimesis" (in a book Norman edited) used the phrase "user experience" years earlier. Norman popularized and institutionalized the term rather than inventing the words.
- Structural impact at Apple: UX was elevated to **equal status with Engineering and Marketing** — no product shipped without sign-off from all three.
- Norman also says the abbreviation "UX" wasn't used at Apple in his time — and he has repeatedly complained since that the term is now overused/applied too narrowly ("I invented the term... and it's often used for things it was never meant for" — paraphrase of his frequent public remarks).
- Jakob Nielsen's "100 Years of UX" essay estimates the field at ~1% of its eventual size in 1950, ~“halfway” maturity around 2017, projecting ~100 million UX professionals by 2050 — useful for a "young field" framing.

---

## 3. UX is universal — not just screens

Core teaching claim: **anything a human interacts with has a user experience — designed or accidental.** Norman's book is about *everyday things* precisely because the principles predate computers.

### Named non-screen examples
1. **Norman Doors.** A "Norman door" = a door whose design signals the wrong action (you pull when you should push). Norman's rule: **when a door needs a sign saying PUSH or PULL, the design has already failed.** Flat plate = push; graspable bar = pull. The term is now generic vocabulary (IxDF has a whole article, "Your Gateway to UX Design: Norman Doors"). Great classroom exercise: find one in your own building.
2. **The butterfly ballot (Palm Beach County, Florida, 2000 US presidential election).** A two-column punch-card ballot misaligned candidate names with punch holes; analyses estimate thousands of Gore-intended votes went to Buchanan or were spoiled — in an election decided by **537 votes in Florida**. Probably the most consequential form-design failure in history; it spurred the founding of civic-design organizations (e.g., Center for Civic Design) and ballot-design guidelines.
3. **The B-17 flap/gear switch** (above) — cockpit control layout as UX.
4. **OXO Good Grips (1990).** Sam Farber founded OXO after watching his wife Betsey, who had arthritis, struggle with a metal peeler. Smart Design created the fat, ribbed rubber handle with thumb fins (fins act as a signifier for grip placement). Designing for an "extreme user" produced a product better for **everyone** — the flagship case study of **inclusive/universal design**. Ranked #6 of the 100 most important designs of modern times (Fortune / IIT Institute of Design).
5. **Heinz upside-down ketchup bottle (2002).** Repackaging: storing the bottle cap-down with a valve solved the "whack the glass bottle" experience — packaging UX. (Widely cited; pairs well with OXO.)
6. **GOV.UK.** The UK Government Digital Service treats **forms and public services** as UX: the GOV.UK Design System publishes tested patterns for questions, addresses, error messages. Their Government Design Principles start with **"Start with user needs"** and include "Do less," "Design with data," and **"Do the hard work to make it simple."** GOV.UK won the UK Design of the Year award in 2013 — a website of mostly text forms beating physical products.
7. **Everyday micro-examples for the chapter:** restaurant menus (ordering by scanning patterns and price anchoring), airport wayfinding signage, hotel shower controls (Norman's favorite complaint), stove burner-to-knob mapping (natural mapping), IKEA instructions, tax forms, parking meters.

Framing sentence for the writer: *UX design existed for millennia before the name — a well-balanced Roman sword, a well-laid-out medieval market. What's new is treating it as a deliberate, testable discipline.*

---

## 4. The five planes of UX — Jesse James Garrett's "Elements of User Experience"

From *The Elements of User Experience* (book 2002; diagram 2000; original chapter PDF at jjg.net). Five planes, **bottom (abstract) to top (concrete)**, each dependent on the plane below. Garrett's ripple rule: choices on each plane constrain the planes above; misalignment between planes is why "projects derail, deadlines get missed, costs skyrocket."

1. **Strategy (most abstract).** *Why are we making this?* User needs (from research) + product/business objectives. Deliverables: user research, personas, success metrics, value proposition.
2. **Scope.** *What will we make?* Strategy translated into **functional requirements** (features) and **content requirements** (text, images, data). This is where you say no to features.
3. **Structure.** *How does it behave and how is it organized?* **Interaction design** (how the system responds to user actions, flows, error handling) + **information architecture** (how content is categorized, hierarchies, navigation logic).
4. **Skeleton.** *Where does everything go?* Interface design (arrangement of buttons/controls), navigation design, information design. Deliverables: **wireframes**, prototypes. Optimizes placement for findability and efficiency.
5. **Surface (most concrete).** *What does it look/feel like?* Sensory design: color, typography, imagery, spacing, motion — the plane most people mistake for "the design."

Key teaching points:
- Garrett originally split every plane into a **functionality/software side and an information/hypertext side** (the famous two-column diagram) — worth a mention, often omitted.
- **UI lives mostly on the top two planes (skeleton + surface); UX spans all five.** This diagram is arguably the cleanest answer to "what's the difference between UI and UX."
- Decisions get more concrete and more expensive to change as you move up. Fixing a strategy error at the surface stage means repainting a house built on the wrong foundation. (Pairs with the stat: defects fixed post-launch cost up to **100× more** than defects fixed during design — a figure tracing to IBM/Boehm software-economics research, widely repeated in UX ROI literature.)

---

## 5. Design thinking — overview

**Stanford d.school / Hasso Plattner Institute five-stage model** (popularized by IDEO's David Kelley, rooted in Herbert Simon's *The Sciences of the Artificial*, 1969):
1. **Empathize** — field research, interviews, observation; understand users' real context.
2. **Define** — synthesize research into a sharp problem statement / point of view ("How might we...").
3. **Ideate** — generate many divergent solutions before converging (quantity first, judgment deferred).
4. **Prototype** — cheap, fast, tangible versions of the best ideas.
5. **Test** — put prototypes in front of real users; feed learnings back into any earlier stage.

Critical caveats (from IxDF and d.school themselves):
- The stages are **non-linear and iterative** — modes, not a waterfall; teams routinely run them in parallel or loop back.
- **IDEO's own model is three phases**: Inspiration → Ideation → Implementation. Don't present the 5-stage version as the only formulation.
- Relationship to the chapter: design thinking is the general problem-solving process; UX design is design thinking applied to products/services, and the double-diamond (Design Council UK, 2005: Discover→Define→Develop→Deliver) is the sibling framework worth naming.
- Core philosophy: **human-centered design** — desirability (people) ∩ feasibility (tech) ∩ viability (business).

---

## 6. What makes design feel intuitive vs confusing (highest level)

### The mental-model account
A design feels intuitive when the user's **mental model** (their internal prediction of how the thing works, built from prior experience) matches the **conceptual model the design presents**. Confusion = model mismatch. Norman's framing: the designer's model must reach the user *through the system image* (the product itself, docs, marketing) — the designer isn't there to explain it.

### Norman's core vocabulary (from *The Design of Everyday Things*)
- **Affordances** — the possible actions the object allows relative to a user (a bar affords grasping; a chair affords sitting). Borrowed from psychologist J.J. Gibson; relational, not absolute (a door doesn't afford opening to a toddler who can't reach the handle).
- **Signifiers** — perceivable signals of where/how to act (added in the 2013 revision because "affordance" was being misused). Flat plate = push signifier; underlined blue text = link signifier. Bad design needs stick-on labels; good design signifies inherently.
- **Mapping** — spatial correspondence between controls and effects (stove knobs laid out like the burners = natural mapping).
- **Feedback** — immediate, informative response to every action (button press states, progress bars).
- **Constraints** — physical/logical/cultural limits that prevent wrong actions (USB-C fits either way — removing a constraint problem; a form disabling submit until required fields are filled).
- **The Gulf of Execution** (how do I make it do what I want?) and the **Gulf of Evaluation** (what state is it in — did my action work?) — intuitive design narrows both gulfs.

### Jakob's Law (lawsofux.com / Nielsen, 2000)
> "Users spend most of their time on **other** sites. This means users prefer your site to work the same way as all the other sites they already know."
Familiar patterns (logo top-left → home, cart icon top-right, underlined links) transfer users' existing mental models. Innovation budget idea: you can afford to be novel only where your product's core value lies; be boring everywhere else. This is Loewy's MAYA restated for the web.

### Nielsen's 10 usability heuristics (list them; they operationalize "intuitive")
1. Visibility of system status; 2. Match between system and real world; 3. User control & freedom (undo/exit); 4. Consistency & standards; 5. Error prevention; 6. Recognition rather than recall; 7. Flexibility & efficiency of use; 8. Aesthetic & minimalist design; 9. Help users recognize/diagnose/recover from errors; 10. Help & documentation. (Derived 1990 with Rolf Molich, finalized 1994 via factor analysis of real usability problems; NN/g research: ~3–5 expert evaluators find roughly 60% of usability issues at a fraction of a user test's cost.)

### The aesthetic–usability effect (why "pretty" gets mistaken for "usable")
Kurosu & Kashimura, Hitachi Design Center, **1995**: tested **26 ATM interface variations**; ratings of *apparent* ease-of-use correlated far more strongly with aesthetic appeal than with actual usability. Implications: (a) attractive design buys tolerance for minor flaws; (b) in user testing, beautiful UIs mask real problems — users report satisfaction while failing tasks. Steve Jobs's corrective quote (NYT, 2003): **"Design is not just what it looks like and feels like. Design is how it works."**

### High-level principles that separate intuitive from confusing
- **Reduce cognitive load**: recognition over recall; progressive disclosure; Hick's Law (more choices → longer decisions); Miller's 7±2 as a chunking metaphor (not a literal UI limit — common misuse to flag).
- **Consistency** (internal and with platform conventions) makes behavior predictable.
- **Immediate feedback** for every action; visibility of system status.
- **Forgiveness**: undo, confirmation for destructive actions, good error recovery.
- **Fitts's Law**: bigger, closer targets are faster to hit (why touch targets have minimums — Apple HIG: 44×44 pt; Material Design: 48×48 dp).

---

## 7. Numbers, studies, and statistics (with sources)

- **UX ROI**: Forrester-attributed figure — **every $1 invested in UX returns up to $100** (9,900% ROI); realistic range reported $2–$100 depending on context. Treat as directional, not gospel; the $100 figure is widely cited but loosely sourced.
- **McKinsey "The Business Value of Design" (2018)**: tracked 300 companies over 5 years; top-quartile design performers (McKinsey Design Index) had **32 percentage points higher revenue growth and 56 pp higher total returns to shareholders** than industry peers.
- **Fixing defects late costs up to 100× more** than during design (IBM/Boehm lineage, cited across UX-ROI literature).
- **88% of online consumers are less likely to return after a bad experience** (widely cited, orig. Gomez/Amazee research).
- **Better UI can raise conversion up to 200%; better full UX up to 400%** (Forrester, cited by UW and UX-stats roundups).
- **Kurosu & Kashimura 1995**: 26 ATM variants, aesthetics dominated perceived usability.
- **Heuristic evaluation**: 3–5 evaluators catch ~60% of usability problems (Nielsen).
- **2000 butterfly ballot**: Florida margin 537 votes; peer-reviewed analyses (e.g., Wand et al., *American Political Science Review* 2001) estimate 2,000+ misvotes attributable to ballot layout.
- **Timeline anchors**: Engelbart demo 1968; Xerox Alto 1973; Macintosh 1984; *Design of Everyday Things* 1988 (rev. 2013); heuristics 1994; "user experience" title at Apple 1993; NN/g founded 1998; Garrett's Elements 2000/2002; iPhone 2007.
- **Nielsen's 100-years-of-UX projection**: from ~10 UX pros in 1950 to ~1M by 2017 to ~100M projected by 2050.

## 8. Expert rules of thumb (quotable)
- "If a door needs a sign, the design has failed." — Norman-door lesson.
- "Human error is usually design error." — Chapanis/Norman framing.
- "Less, but better." — Dieter Rams.
- "Most Advanced Yet Acceptable." — Loewy's MAYA.
- "Start with user needs" / "Do the hard work to make it simple." — GOV.UK design principles.
- "Users spend most of their time on other sites." — Jakob's Law.
- "Design is how it works." — Steve Jobs.
- "The details are not the details. They make the design." — Charles Eames (bridge to later chapters).
- Every plane of Garrett's model answers one question: Why → What → How it behaves → Where things go → What it looks like.

## 9. Common mistakes / misconceptions to warn beginners about
1. **Conflating UI with UX** — believing UX = wireframes + pretty screens. (Use the movie-database example and the 5 planes.)
2. **Thinking UX is only digital** — it applies to doors, ballots, peelers, forms, packaging.
3. **"Don Norman invented the words 'user experience'"** — he institutionalized the term (Apple 1993); Brenda Laurel used the phrase in 1986; Norman credits her.
4. **Treating design thinking's 5 stages as a linear waterfall** — they're iterative modes.
5. **Trusting beauty in user tests** — aesthetic-usability effect makes users under-report problems on attractive UIs.
6. **Blaming users ("user error")** instead of the design.
7. **Innovating on conventions for novelty's sake** — violates Jakob's Law/MAYA; spend innovation budget only on core value.
8. **Skipping strategy/scope and starting in Figma at the surface plane** — the #1 process error Garrett's model exposes.
9. **Quoting the $1→$100 ROI stat as precise science** — it's directional.
10. **Misusing "affordance" to mean any visual hint** — that's a signifier (Norman added the term in 2013 specifically to fix this misuse).

## Sources
- NN/g — The Definition of User Experience: https://www.nngroup.com/articles/definition-user-experience/
- NN/g — What Is User Experience (and What Is It Not): https://www.nngroup.com/articles/what-is-user-experience/
- NN/g — UX vs. UI video: https://www.nngroup.com/videos/ux-vs-ui/
- NN/g — 10 Usability Heuristics: https://www.nngroup.com/articles/ten-usability-heuristics/
- NN/g — A 100-Year View of UX (Jakob Nielsen): https://www.nngroup.com/articles/100-years-ux/
- Don Norman, jnd.org — Where did the term UX come from?: https://jnd.org/where-did-the-term-user-experience-ux-come-from/
- IxDF — Who is Don Norman: https://ixdf.org/literature/topics/don-norman
- IxDF — Norman Doors: https://ixdf.org/literature/article/your-gateway-to-ux-design-norman-doors
- IxDF — Affordances: https://ixdf.org/literature/topics/affordances
- Wikipedia — The Design of Everyday Things: https://en.wikipedia.org/wiki/The_Design_of_Everyday_Things
- Jesse James Garrett — Elements of UX chapter 2 PDF: http://www.jjg.net/elements/pdf/elements_ch02.pdf
- UX Design Institute — 5 elements of UX: https://www.uxdesigninstitute.com/blog/5-elements-of-ux-design/
- Vitsoe — Dieter Rams' 10 principles: https://www.vitsoe.com/us/about/good-design
- Design Museum — Dieter Rams' Ten Principles: https://designmuseum.org/discover-design/all-stories/what-is-good-design-a-quick-look-at-dieter-rams-ten-principles
- Raymond Loewy official biography: https://www.raymondloewy.com/about/biography/
- UX Magazine — Pilot Error, Chapanis: https://uxmag.com/articles/pilot-error-chapanis-and-the-shape-of-things-to-come
- Wikipedia — Alphonse Chapanis: https://en.wikipedia.org/wiki/Alphonse_Chapanis
- Wikipedia — The Mother of All Demos: https://en.wikipedia.org/wiki/The_Mother_of_All_Demos
- IxDF — 5 Stages in the Design Thinking Process: https://ixdf.org/literature/article/5-stages-in-the-design-thinking-process
- IxDF — What is Design Thinking: https://ixdf.org/literature/topics/design-thinking
- Laws of UX — Jakob's Law: https://lawsofux.com/jakobs-law/
- Laws of UX — Aesthetic-Usability Effect: https://lawsofux.com/aesthetic-usability-effect/
- Codecademy — UX Honeycomb (Morville): https://www.codecademy.com/resources/docs/uiux/design-methodologies/ux-honeycomb
- GOV.UK — Government Design Principles: https://www.gov.uk/guidance/government-design-principles
- GOV.UK Design System: https://design-system.service.gov.uk/
- User Vision — The UX of Voting (butterfly ballot): https://uservision.co.uk/thoughts/the-user-experience-of-voting
- Universal Design Centre — OXO Good Grips case: https://universaldesign.ie/what-is-universal-design/case-studies-and-examples/examples/oxo-good-grips/
- Smart Design — OXO partnership: https://smartdesignworldwide.com/projects/oxo-partnership/
- Maze — 40+ UX stats 2026: https://maze.co/blog/ux-statistics/
- UX Crush — UX ROI statistics: https://uxcrush.com/ux-roi-statistics
- McKinsey — The Business Value of Design (via stats roundups above)
- University of Washington — Why invest in UX: https://uxdesign.uw.edu/why_do_ux.html
- Userfocus — Steve Jobs on 6 key principles of UX: https://www.userfocus.co.uk/articles/Steve-Jobs-on-6-key-principles-of-ux.html
- CareerFoundry — History of UX timeline: https://careerfoundry.com/en/blog/ux-design/the-fascinating-history-of-ux-design-a-definitive-timeline/
- UX Design Institute — History of UX: https://www.uxdesigninstitute.com/blog/history-of-ux/
