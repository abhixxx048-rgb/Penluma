# Chapter 10 - Case Studies: How Apple, Google, Airbnb, Stripe, Notion & Figma Design

Research notes for the chapter writer. The goal of this chapter is not to show *what* these companies' products look like, but to reverse-engineer *why* their design decisions work - the psychology, the business logic, and the technical bets underneath the surface. Each company is a self-contained mini case study with (a) the concrete decision and (b) the reasoning behind it. The chapter ends with cross-cutting lessons that apply to any designer.

Framing line for the writer: **Great design is not decoration - it is a series of hard trade-offs made in favor of the user, defended over time.** Every company below is famous for a different trade-off.

---

## 1. APPLE - Design as Focus and Restraint

### The core idea: clarity, deference, depth
Apple's **Human Interface Guidelines (HIG)** are built on three foundational principles (Apple's own language):
- **Clarity** - text is legible at every size, icons are precise, adornment is subtle and appropriate, and a sharpened focus on functionality motivates the design.
- **Deference** - fluid motion and a crisp interface help people understand and interact with content while *never competing with it*. The UI gets out of the way. "Content over chrome."
- **Depth** - visual layers and realistic motion convey hierarchy, impart vitality, and help people understand relationships between elements.

Plain English: the interface should disappear so the content can shine. Every element must earn its place. This is why Apple software feels calm - cognitive load is deliberately minimized.

### The decision that defines Apple: saying NO
The single most important design lesson from Apple is **focus through subtraction.**
- Steve Jobs, WWDC 1997: *"Focus is about saying no… Innovation is saying no to 1,000 things."* He argued focus is not saying yes to the thing you work on - it's saying no to the hundred *other good* ideas.
- Concrete proof: when Jobs returned to Apple in 1997, the company had **~350 products**. Within about a year he cut the line to **~10 products** organized on a simple 2x2 grid (consumer/pro × desktop/portable). Instead of 350 mediocre products, Apple shipped 10 exceptional ones.
- The design lesson: a product with fewer features, each perfected, beats a product with many features each half-done. Restraint is a feature.

### Hardware–software integration (the "whole widget")
Apple controls the entire stack - silicon, hardware, OS, and apps. This vertical integration means the software can assume exact hardware, and the hardware is designed around the software's needs. Result: predictable performance, tight animations, and details competitors relying on fragmented ecosystems (e.g., Android across many OEMs) cannot match. The design philosophy of simplicity extends *unbroken* from silicon to packaging.

### Packaging and the unboxing ritual
Apple treats the box as the first screen of the product - UX begins before power-on.
- The near-silent, slow slide of a perfectly-fitted lid creates **anticipation** - Apple even tunes the friction/air resistance so the lid descends at a controlled speed. Everything is perfectly aligned; the device is the hero, revealed first.
- Psychology: this is *theater*. A deliberate "ritual of unpacking" makes the product feel special and premium, building an emotional connection and reinforcing perceived value before the customer has used a single feature. Apple has obsessed over unboxing since the original 1984 Macintosh.
- Business reasoning: unboxing is free, high-emotion marketing (millions of unboxing videos) and it justifies premium pricing by signaling craft. (Note the modern tension: since ~2020 Apple has shifted packaging toward sustainability/efficiency - a smaller box, no charger - showing that even ritual bows to a bigger value.)

### Why it works (psychology/business)
- **Hick's Law** - fewer choices = faster decisions and less anxiety. Apple's restraint is Hick's Law applied at company scale.
- **Jakob's Law / consistency** - HIG enforces platform consistency so users transfer knowledge between apps.
- Premium positioning: perceived quality of the *whole* experience (box, first boot, defaults) supports margins.

---

## 2. GOOGLE - Systematizing Design at Planetary Scale

### The problem Material Design solves
Google ships across billions of devices, thousands of screen sizes, Android/iOS/web, and hundreds of internal teams. Without a system, the experience fractures. **Material Design (2014, now Material 3 / "M3 Expressive" in 2025)** is a *shared language* that lets thousands of engineers and designers produce coherent, accessible UI without a designer in every room.

### The metaphor: "material" from the physical world
Material uses the physical world - surfaces, edges, light, shadow, depth - as its metaphor. By borrowing rules from physical reality (objects have thickness, cast shadows, move with momentum), interfaces feel *familiar and intuitive*: users already know how physical things behave, so digital "material" is instantly legible.

### Motion as meaning (not decoration)
Google's key principle: **motion is a system-level affordance that communicates continuity and causality**, not eye candy.
- Animation shows where a thing came from and where it went (spatial continuity), directs attention, expresses hierarchy, and confirms that an action registered.
- M3 Expressive (2025) introduced a **motion-physics system** - spring-based animations that bounce, stretch, and respond organically to touch - while staying subtle. Motion is tokenized so it stays predictable and consistent across platforms.

### Design tokens - the "new design API"
- **Tokens** name and manage color, typography, spacing, and motion *by purpose, not by appearance* (e.g., `color-primary` or `surface-container` rather than "#6750A4"). Change the token once and the whole system updates.
- Why it matters: tokens decouple *decision* from *value*. Theming (light/dark, dynamic color, brand skins) becomes a data swap, not a redesign. M3's **Dynamic Color** can generate an entire accessible palette from a single seed color (e.g., a user's wallpaper).
- Tokens are how Google achieves consistency across teams and platforms at scale - the token layer is the contract.

### Accessibility at scale - baked in, not bolted on
- In M3, accessibility is a *core design value integrated by default*, not an afterthought. The system supports **text resizing up to 200%**, and the color system **algorithmically guarantees accessible contrast ratios** (it won't let you pick an inaccessible primary/on-primary pair). Components ship with proper touch targets and assistive-tech support.
- Business reasoning: at Google's scale, even a 1% accessibility gain is tens of millions of people; and accessible defaults reduce legal/ethical risk and expand the addressable market.

### Why it works
- Design systems trade a little individual expressiveness for enormous **consistency, speed, and quality floor**. A junior team using Material can't easily ship something broken.
- Tokens + components = the same reason engineering uses shared libraries: don't rebuild, don't diverge.

---

## 3. AIRBNB - Designing Trust Between Strangers

### The founder-designer DNA
Airbnb's founders **Joe Gebbia and Brian Chesky** are RISD-trained *designers*, not engineers - rare among tech founders. Design thinking is in the company's bones. This shows up in an obsession with the end-to-end guest experience, not just the app screens.

### "Do things that don't scale" - the photography turning point
Airbnb's most famous design/growth story:
- In 2009 Airbnb was nearly dead (~$200/week revenue). Studying listings, the founders (guided by Paul Graham / Y Combinator) realized the *photos were terrible* - hosts shot dark, blurry phone pics that didn't represent the spaces.
- The unscalable fix: Chesky and Gebbia personally flew to New York, went door-to-door, and shot **professional photos** of listings themselves. Monthly revenue **doubled** almost immediately in the test market.
- This became the **Airbnb Pro Photography Program**. Modern data (Airbnb, 14,700+ global listings, 2024–2025): pro photography drove a **~19% net uplift in bookings** and a **~21% increase in host earnings** over the following 365 days vs. comparable listings.
- Lesson for the writer: the "design fix" wasn't in the UI at all - it was in the *content quality* that the UI displays. Sometimes the highest-leverage design work is off-screen. And insight came from doing manual, unscalable work face-to-face with users.

### The 11-Star Experience thought exercise
Chesky's signature design framework, learned from Paul Graham:
- Take any moment of the experience and imagine it at escalating star levels. **5 stars** = they showed up, opened the door, nice stay. **6 stars** = host greets you, welcome gift. **7 stars** = a surfboard and restaurant reservations waiting. **9–10 stars** = Elon Musk-level surprises. **11 stars** = you land and Brian Chesky is there to take you into space.
- The point isn't that 11 stars is feasible - it's that by designing the *absurd extreme* and walking backward, you discover the achievable "sweet spot" that's far more magical than the obvious 5-star baseline. It forces teams past incrementalism.
- Companion idea - the **Ricardo experiment**: Airbnb filmed a lonely solo traveler ("Ricardo") in SF, then designed a fully bespoke trip (airport pickup, curated dining, mystery bike tour, dinner party). Ricardo cried thanking Chesky - proof that they could design a trip that "deeply moved somebody," validating the emotional ceiling worth aiming at.

### Trust design between strangers
Airbnb's real product is **trust** - convincing strangers to sleep in each other's homes. Design decisions that manufacture trust:
- **Reviews / two-way reviews** - both host and guest review each other, creating mutual accountability. Reputation is the currency.
- **High-quality photos + verified profiles + real names/faces** - reduce the anonymity that breeds fear.
- **Structured, warm UI** - friendly copy, human photography, and clear policies lower the perceived risk of a fundamentally scary transaction.
- Business reasoning: trust is the bottleneck to the entire marketplace; every point of trust converts directly to bookings.
- Design listens to users: an early host handed Chesky a binder of feature requests that literally became the product roadmap - "the roadmap often exists in the minds of the users you're designing for."

### DLS - the Design Language System
- In 2016, Principal Designer **Karri Saarinen** (with Bek Stone, Adam Michela) led the creation of Airbnb's **DLS** - a unified component library spanning iOS, Android, React Native, and web.
- Key philosophy: treat components not as static "atoms" but as elements of a **living organism** - each has a function and personality, is defined by properties, coexists with others, and can evolve independently.
- Mechanics: a master Sketch library, updated via git/GitHub pull requests with changelogs - engineering discipline applied to design. Released mid-April 2016 alongside a major app redesign.
- Why: unify a fragmented cross-platform experience, drive efficiency through reuse, and let design scale with the company.

---

## 4. STRIPE - Developer Experience IS the User Experience

### The insight: for a developer tool, the UX *is* the API and the docs
Stripe's users are developers integrating payments. So Stripe treats the **API, the documentation, and the CLI** as its primary interface - the "screens" that matter most are code editors and doc pages, not a dashboard. Stripe's DX is "the result of a decade of compounded discipline across docs, design, API behavior, and dashboard."

### The clean API as an interface
- Stripe obsesses over **consistency and predictable patterns** across the entire API surface. Once you learn one resource, every other resource behaves the same way. This lowers the learning curve to near-zero for each new product.
- Reliability primitives designed for humans: **idempotency keys** (retry a request safely without double-charging), clear error objects, and failure-mode tables. Stripe designs for the *unhappy path*, which is where trust in a payments API is won or lost.
- The famous promise: get a working payment integration in a handful of lines of code - **time-to-first-success** is the metric Stripe optimizes.

### World-class documentation design
- The signature **three-column layout**: left = product navigation, middle = prose/concepts/step-by-step, right = runnable code in *your chosen language*. Everything a developer needs is in view at once - no context-switching.
- **Hover-and-highlight**: hovering a paragraph highlights the exact code it describes (and vice versa), eliminating the mental effort of mapping concept → implementation.
- **Live, personalized code**: when logged in, docs inject *your* test API keys into samples; you can run the call from the page and see the response inline, with test-mode safeguards.
- Built on **Markdoc** (Stripe's open-sourced framework, 2022): custom components, conditionals, variables, and build-time validation - docs are engineered like software, not free-typed in a CMS.
- 2026 update: OpenAPI `operationId`/`summary`/`description` fields double as user-facing copy for both human developers *and* AI agents navigating the docs - designing for machine readers too.
- Principle for the writer: **docs are a product**, staffed and iterated like one. "Answer the developer's questions in the order they ask them, not in the order of your internal product hierarchy."

### The gradient / brand craft
- Stripe makes a "not-so-pretty process" (payment plumbing) feel premium. Its site is the gold standard of fintech design - "simultaneously technical and luxurious, precise and warm."
- Craft details: a **custom variable typeface** (sohne-var) with an activated stylistic set (`ss01`) for a geometric, modern feel; a clean white canvas, deep navy headings, and a signature saturated **violet/purple** that reads confident and premium rather than clinical enterprise-blue; and the iconic angled **gradients** that create hierarchy and personality without clutter.
- Reasoning: the visual craft signals *this company sweats every detail* - which is exactly the trust signal you want from the company holding your payments. Beauty here is a proxy for reliability.
- Caution to include: "Make it like Stripe" is a trap - imitating the gradient without the underlying substance (deep user knowledge, real problem-solving) fails. Stripe's design works because it makes complexity *feel simple*, not because it's pretty.

---

## 5. NOTION - Flexibility vs. Simplicity, Solved with Blocks

### The central tension
Most tools pick a side: **simple but rigid** (does one thing well) or **flexible but complex** (does anything, overwhelming). Notion's bet was to resolve the tension with one primitive - the **block** - that is simple to understand yet endlessly composable.

### The block mental model
- **Everything in Notion is a block**: text, an image, a to-do, a heading, a database row - even a *page* is a block. One mental model covers the entire product.
- Each block has four attributes: **ID** (UUID), **Type** (how it renders/behaves), **Properties** (its data, e.g., title/checked), and **Relationships** (a content array of child block IDs + a parent pointer).
- **Nesting**: blocks contain other blocks via downward "content" pointers (forming a *render tree*), while an upward *parent* pointer is used for permissions. This lets content nest infinitely with a clean permission model.
- **Structure separated from presentation**: changing a block's *type* (e.g., to-do → heading) keeps its properties/content - only rendering changes. Indentation is *structural*, not cosmetic: it re-parents blocks in the tree. This "preserves as much user intention as possible," which matters especially during real-time collaboration.
- Design payoff: users learn *one* concept and can build a note, a wiki, a database, a kanban board, or a CRM - the LEGO-brick model. Power emerges from composition, not from feature count.

### The cost of flexibility (be honest about the trade-off)
- Flexibility is a **double-edged sword**: a blank Notion is intimidating; users often spend **2–4 hours** setting up a workspace, and undisciplined use produces messy, unmaintainable spaces. The freedom that's Notion's strength is also its onboarding weakness (the "blank canvas problem").

### Templates and network effects
- Notion solved the blank-canvas problem with **templates**. Its gallery hosts **10,000+ community templates**. A user can clone a "startup operating system" in ~3 hours instead of building for 2 weeks.
- Network effect: because blocks are composable, creators build and share templates → new users get instant value → some become creators → the library compounds. (Explicit analogy: like WordPress's simple post-loop enabling a themes/plugins ecosystem.) Templates turn a flexible-but-empty tool into an instantly useful one, and the community becomes a moat.

### Why it works
- **Progressive disclosure** - Notion looks like a simple doc on day one; the database/relation power reveals itself only when you need it.
- One primitive = low cognitive load + high ceiling. The rare product that is both approachable *and* deep.

---

## 6. FIGMA - Multiplayer as the Core Insight, the Browser as the Bet

### The reframe that created a category
Figma's founding insight wasn't "make a better Photoshop." It was: **design should be multiplayer and live in the browser.** Before Figma, designers worked in isolated native files (Sketch/Photoshop) and shared static exports. Figma reframed design as a *collaborative, always-live, shareable-by-URL* activity - "software is culture," and design is a team sport.

### The browser-first technical bet
- Figma bet the company on the **browser** when serious creative tools were assumed to require native apps. This was contrarian and hard.
- Enabling tech: advances in **WebGL** let Figma bring professional-grade tooling online. Figma wrote a **custom rendering pipeline on top of WebGL** (plus WebAssembly for the C++ core), optimized for vector shapes, text, and images - not the standard DOM.
- Payoff: zero install, one link to share, always the latest version, cross-platform (Mac/Windows/Linux/Chromebook) for free. "Being browser-first is more than a feature, it's a responsibility." The URL *is* the file - the distribution model itself is the product advantage.

### Real-time multiplayer - building it their way
- Figma deliberately **rejected Operational Transforms (OT)** - the algorithm behind Google Docs - because OTs are "very complicated and hard to implement correctly," with error-prone formal proofs and a combinatorial explosion of states. As a speed-focused startup, OT was "unnecessarily complex for our problem space" (design objects, not character-by-character text).
- Instead they built a **simpler, CRDT-inspired system** with a **centralized server authority** (server decides final state), **last-writer-wins** per property, and **fractional indexing** to order objects in the tree. Guiding principle: *"no more complex than necessary to get the job done."*
- Reliability result: **95% of edits get saved within 600ms**, so collaboration feels instant and work scales with the team.

### Dev Mode and the handoff problem
- Design's other broken seam is **designer → developer handoff**. Figma launched **Dev Mode** (open beta at Config 2023; a discounted **Developer seat**) to make files a live, code-oriented source of truth: inspect specs, copy style code, see design-token → code translation, and **annotations** for callouts that update live as designs change.
- Momentum signal: Figma shipped **200+ requested updates** in Dev Mode's first two months of beta. It reduces developers' reliance on designers and speeds implementation - closing the loop from idea to shipped code inside one tool.

### Plugins ecosystem
- Figma opened a **plugin/extension API**, letting the community extend the tool (icons, content, accessibility checkers, design-system tooling). Enterprises can pin default plugins for Dev Mode across an org. Like Notion templates, the ecosystem creates lock-in and compounding value - the platform becomes more valuable as others build on it.

### Why it works
- Figma won on a **structural insight about collaboration**, not a feature checklist. Once a team's whole design lives in shared Figma URLs, switching away is painful (network-effect moat). Sketch had a better native-app head start; Figma changed the game the incumbent was playing. (Adobe agreed to acquire Figma for ~$20B in 2022; deal abandoned 2023 over regulators - cite the *scale* of the bet's payoff, not a completed deal.)

---

## CROSS-CUTTING LESSONS (the chapter's payoff section)

1. **Design is trade-offs, not decoration.** Each company is famous for one hard trade-off defended over time: Apple → subtraction (say no); Google → consistency over individual expression; Airbnb → trust over friction-free signup; Stripe → developer clarity over feature marketing; Notion → composability over pre-built rigidity; Figma → collaboration/openness over native-app performance orthodoxy.

2. **Know who your user really is - then design for their actual medium.** Stripe's user is a developer, so the API and docs *are* the UI. Airbnb's user is a nervous stranger, so trust cues *are* the UI. Design where the user actually feels the pain.

3. **The highest-leverage work is often off-screen.** Airbnb's photography and Apple's packaging aren't "app UI," yet they moved the metrics most. Zoom out from the screen to the whole experience (the 11-star exercise).

4. **Do things that don't scale first.** Airbnb's door-to-door photography and Chesky's host visits surfaced insights no analytics dashboard would. Manual, unscalable, face-to-face work is a research method, not a failure.

5. **A single strong primitive beats a pile of features.** Notion's block and Figma's shared-canvas each unlocked enormous range from one well-chosen concept. Simplicity at the primitive level enables complexity at the composition level.

6. **Systematize to scale quality.** Google's tokens/components, Airbnb's DLS, and Apple's HIG are all *design systems* - they raise the quality floor, speed teams up, and keep a growing org coherent. Tokens decouple design *decisions* from *values*.

7. **Sweat the details to signal trust.** Stripe's gradient and Apple's lid-friction aren't vanity - perceived craft is a proxy for reliability and justifies premium positioning. Emotion and business value are linked.

8. **Accessibility and the unhappy path are core, not afterthoughts.** Google bakes contrast/resizing into the token system; Stripe designs idempotency and error tables for when things fail. Robustness under stress is where trust is earned.

9. **Design a moat.** Notion templates, Figma plugins/URLs, and Airbnb reviews all create compounding network effects - good design decisions that get *stronger* with more users.

10. **Beware cargo-culting the surface.** "Make it like Stripe" (copy the gradient) or "add multiplayer like Figma" fails without the underlying substance - deep user knowledge and a real structural insight. Copy the *reasoning*, never just the *look*.

### Common mistakes these cases warn against
- Adding features to look competitive instead of removing them to gain focus (anti-Apple).
- Letting each team/screen diverge because there's no shared system (anti-Google/Airbnb-DLS).
- Treating docs, error states, and onboarding as second-class (anti-Stripe).
- Shipping a powerful blank canvas with no templates/guidance (the Notion onboarding tax).
- Bolting collaboration/accessibility on late instead of designing from that premise (anti-Figma/Google).
- Imitating a famous aesthetic without the substance beneath it.

### Expert rules of thumb (quotable)
- "Innovation is saying no to 1,000 things." - Steve Jobs (Apple).
- "Content over chrome" / clarity, deference, depth. - Apple HIG.
- "Motion is meaning, not decoration." - Material Design.
- Tokens = "the new design API": name things by purpose, not appearance.
- "Design the 11-star experience, then find the achievable sweet spot by walking back." - Brian Chesky (Airbnb).
- "Do things that don't scale." - Paul Graham / Airbnb.
- "Docs are a product." / "Answer questions in the order the developer asks them." - Stripe DX.
- "Everything is a block." - Notion.
- "No more complex than necessary to get the job done." - Figma multiplayer.
- "Being browser-first is a responsibility, not just a feature." - Figma.

---

## SOURCES

**Apple**
- Apple Human Interface Guidelines - Design Principles: https://developer.apple.com/design/human-interface-guidelines/design-principles
- Apple HIG overview: https://developer.apple.com/design/human-interface-guidelines/
- Steve Jobs "saying no to 1,000 things" (ZURB): https://zurb.com/blog/steve-jobs-innovation-is-saying-no-to-1-0
- Steve Jobs on focus (CNBC): https://www.cnbc.com/2018/10/02/steve-jobs-heres-what-most-people-get-wrong-about-focus.html
- Unboxing UX of Apple's boxes (Fast Company): https://www.fastcompany.com/90916642/unboxing-the-delightful-ux-of-apples-boxes
- The Psychology of Apple's Packaging (Trung Phan): https://www.readtrung.com/p/psychology-of-apple-packaging
- The Essence of Apple Design (Encyclopedia.design): https://encyclopedia.design/2025/02/03/the-essence-of-apple-design-a-deep-dive-into-human-centered-innovation/

**Google / Material Design**
- Material 3 - Motion overview: https://m3.material.io/styles/motion/overview/how-it-works
- Material 3 - Accessibility principles: https://m3.material.io/foundations/overview/principles
- Material 3 tokens explained (Seenode): https://seenode.com/blog/what-is-material-3-and-why-it-matters-in-2025
- Material 3 Expressive (Supercharge): https://supercharge.design/blog/material-3-expressive
- What is Material Design (Interaction Design Foundation): https://ixdf.org/literature/topics/material-design

**Airbnb**
- Reid Hoffman - "How to Scale a Magical Experience: 4 Lessons from Brian Chesky" (11-star, photography, do-things-that-don't-scale, Ricardo): https://reid.medium.com/how-to-scale-a-magical-experience-4-lessons-from-airbnbs-brian-chesky-eca0a182f3e3
- 11-Star Experience framework (Product Frameworks): https://www.product-frameworks.com/11-Star-Experience.html
- Masters of Scale - "Do things that don't scale" (Chesky): https://mastersofscale.com/brian-chesky/
- Airbnb Pro Photography impact data (19% bookings / 21% earnings, 14,700 listings): https://www.airbnb.com/e/pro-photography
- Snappr - "Photography that launched an empire" (revenue doubled): https://www.snappr.com/blog/photography-that-launched-an-empire-how-airbnb-transformed-their-business-with-professional-photography
- Karri Saarinen - "Building a Visual Language" (DLS): https://medium.com/airbnb-design/building-a-visual-language-behind-the-scenes-of-our-airbnb-design-system-224748775e4e
- Karri Saarinen - Creating the Airbnb Design System: https://karrisaarinen.com/posts/building-airbnb-design-system/

**Stripe**
- Moesif - Stripe Developer Experience & Docs Teardown (three-column, hover-highlight, Markdoc, OpenAPI): https://www.moesif.com/blog/best-practices/api-product-management/the-stripe-developer-experience-and-docs-teardown/
- Apidog - Why Stripe's API docs are the benchmark: https://apidog.com/blog/stripe-docs/
- Kenneth Auchenberg - Insights from building Stripe's developer platform: https://kenneth.io/post/insights-from-building-stripes-developer-platform-and-api-developer-experience-part-1
- "Behind the Gradient: Design at Stripe" (UW/UX, sohne-var, ss01, violet, gradients): https://uwux.medium.com/behind-the-gradient-design-at-stripe-476dcf61a51a
- Eleken - "Make It Like Stripe" (imitation caution): https://www.eleken.co/blog-posts/making-it-like-stripe
- Stripe API Reference: https://docs.stripe.com/api

**Notion**
- Notion - "The data model behind Notion's flexibility" (blocks, IDs, nesting, parent pointers): https://www.notion.com/blog/data-model-behind-notion
- Notion Free Plan / flexibility trade-off & templates (SaaSPricePulse): https://www.saaspricepulse.com/tools/notion

**Figma**
- Figma - "How Figma's multiplayer technology works" (rejecting OT, CRDT-inspired, fractional indexing): https://www.figma.com/blog/how-figmas-multiplayer-technology-works/
- Figma - "Making multiplayer more reliable" (95% saved within 600ms): https://www.figma.com/blog/making-multiplayer-more-reliable/
- Figma - "Software is Culture: Multiplayer collaboration": https://www.figma.com/blog/software-is-culture/multiplayer-collaboration/
- Figma - Everything you need to know about Dev Mode (Config 2023, 200+ updates, Developer seat): https://www.figma.com/blog/everything-you-need-to-know-about-dev-mode/
- Figma - Guide to Dev Mode: https://help.figma.com/hc/en-us/articles/15023124644247-Guide-to-Dev-Mode
- Figma's Collaborative Canvas / $20B (Product Brief): https://medium.com/@productbrief/figmas-collaborative-canvas-how-real-time-design-built-a-20-billion-creative-empire-efefc6126a93
