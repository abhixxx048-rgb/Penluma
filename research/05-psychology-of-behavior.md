# Research Notes - Chapter 5: The Psychology of Trust, Decisions, and Clicks

Working material for the chapter writer. Everything below is sourced; URLs in the Sources section at the end. Scope: why users click, hesitate, ignore, or abandon - decision psychology, trust signals, friction, abandonment research, emotional design, familiarity, dark patterns, and the ethics line between persuasion and manipulation.

---

## 1. The core premise: users don't decide rationally

Interfaces are decision environments. Every screen asks the user to make micro-decisions (click, scroll, ignore, abandon), and those decisions are made mostly by fast, automatic, heuristic-driven thinking - what Kahneman calls System 1 - not slow deliberate reasoning (System 2). Behavioral economics (Kahneman & Tversky's prospect theory, 1979) established that people:

- Judge options relative to reference points, not in absolute terms (anchoring, framing).
- Feel losses roughly **2x as intensely** as equivalent gains (loss aversion; magnitude-dependent - it emerges most strongly for larger prospective losses).
- Stick with whatever is pre-selected (default effect / status quo bias).
- Use social evidence as a shortcut when uncertain (social proof).
- Overweight scarce or time-limited options (scarcity).

Design implication: you can't "educate" users out of these biases. You design *with* them - ethically - or you fight them and lose conversions, or you exploit them and eventually lose trust (and possibly get sued; see §9).

---

## 2. Decision psychology: why people click (or freeze)

### 2.1 Hick's Law - more choices, slower decisions
- Hick's Law (Hick & Hyman, 1950s): decision time increases **logarithmically** with the number and complexity of choices. Formula: RT = a + b·log2(n).
- UI application: every added menu item, plan tier, or CTA increases time-to-decision; past a threshold, users don't decide slower - they don't decide at all.
- Rules of thumb (Laws of UX / lawsofux.com): minimize choices when response time is critical; break complex tasks into smaller steps (progressive disclosure); highlight recommended options; avoid oversimplifying to the point of hiding necessary options (abstraction has costs too).
- Classic examples: Google's one-search-box homepage vs. cluttered 90s portals; TV remotes vs. Apple TV remote; checkout flows split into steps.

### 2.2 Choice overload - the jam study
- Iyengar & Lepper (2000), the famous "jam study" at a gourmet grocery: a tasting booth displayed either **24 jams or 6 jams**.
  - 24-jam table attracted more browsers (60% stopped vs. 40%).
  - But **only ~3% of the 24-jam group bought**, vs. **~30% of the 6-jam group** - roughly a **10x conversion difference** (some summaries report the purchase split as 30% vs 3%; others as 60% vs 30% of samplers - use the canonical 3% vs 30% of those who stopped).
- Lesson pattern that repeats in UX research: **more options attract attention but depress action.** Big menus increase engagement metrics while killing conversion.
- Caveat for accuracy: later meta-analyses (Scheibehenne et al., 2010) found choice overload is real but conditional - it appears when options are hard to compare, users lack expertise, and there's no dominant/default option. Mitigations: defaults, recommendations ("Most popular" plan badges), filters, comparison tables, curation.

### 2.3 Defaults - the strongest nudge in the toolbox
- Johnson & Goldstein, "Do Defaults Save Lives?" (Science, 2003): flipping organ-donation consent from opt-in to opt-out raised effective consent from **42% to 82%** in their experiment; in the field, **Germany (opt-in) ~12% donor registration vs. Austria (opt-out) ~99%**. Opt-out countries average about **6x higher** registration rates.
- Same effect in 401(k) auto-enrollment: participation jumps dramatically when enrollment is the default.
- Why defaults win: (1) effort - changing costs something; (2) implied endorsement - users read the default as the recommended choice; (3) loss framing - the default becomes the reference point, and deviating feels like a loss.
- UX applications: sensible pre-filled form values, pre-selected shipping options, recommended plan pre-highlighted, privacy-respecting defaults.
- Ethics flag: defaults are so powerful that pre-checked "subscribe/add-on" boxes are a canonical dark pattern ("sneak into basket") and are illegal in the EU for consumer purchases.

### 2.4 Anchoring
- Tversky & Kahneman: the first number encountered biases all subsequent judgments, even when the anchor is arbitrary; robust even among experts.
- Pricing UX: strikethrough "was $99, now $49"; three-tier pricing where the expensive "decoy" tier makes the middle one look reasonable (decoy effect / asymmetric dominance); "most popular" plan placed against a premium anchor.
- Also applies to non-price judgments: the first design shown in a review anchors feedback; a suggested donation amount anchors giving.

### 2.5 Loss aversion & framing
- Losses loom ~2x larger than gains (prospect theory). Copy framed as avoiding loss ("Don't lose your progress", "Free shipping - you're $8 away") outperforms equivalent gain framing in many tests.
- Endowment effect: once users feel ownership (free trial with their data in it, a configured product, a cart), giving it up feels like a loss - the basis of freemium and trial design.
- Ethics flag: scarcity + loss framing is where legitimate persuasion most often tips into manipulation (see Booking.com case, §9.4).

### 2.6 Cialdini's principles of influence (from *Influence*, 1984; 7th principle "Unity" added in *Pre-Suasion*, 2016)
1. **Reciprocity** - people feel obliged to return favors. UX: free value first (guide, template, free tier, generous trial) before the ask. Works when the gift is genuinely useful.
2. **Commitment & consistency** - small initial commitments increase follow-through on bigger ones. UX: progressive onboarding, wishlist → cart → buy, "foot in the door" micro-conversions, saved progress.
3. **Social proof** - under uncertainty, people copy others. UX: ratings, review counts, testimonials, "10,000 teams use X", usage stats, logos of known customers. Most powerful when the "others" resemble the user.
4. **Authority** - credentials, expert endorsements, certifications, security badges, press mentions.
5. **Liking** - we say yes to people/brands we like: friendly tone, attractive design, similarity, shared values.
6. **Scarcity** - limited quantity/time increases perceived value via loss aversion. UX: stock counters, deadlines, limited editions. The most abused principle (must be TRUE to be ethical/legal).
7. **Unity** - shared identity ("designers like us", community membership).
- These operate largely below conscious deliberation; they're heuristics, not arguments.

### 2.7 Social proof numbers worth quoting (BrightLocal Local Consumer Review Survey and related 2025–2026 data)
- **~93–97% of consumers read online reviews** before purchase (varies by study).
- **49% trust online reviews as much as personal recommendations** from friends/family.
- **~68% will only use a business rated 4+ stars**; ~31% demand 4.5+.
- 74% check at least two review sites; Google is the most-trusted platform (~83% read reviews there).
- Design detail: reviews with specifics and a few negatives are perceived as more credible than uniform 5-star walls (perfect scores trigger skepticism).

### 2.8 Why users IGNORE things: selective attention & banner blindness
- **Banner blindness** (term coined by Benway & Lane, 1998): users learn to ignore anything that *looks like* an ad - regardless of whether it is one. NN/g eyetracking studies (original research + 2018 "Banner Blindness Revisited") confirm it persists on mobile and desktop.
- Mechanism: selective attention. Users attend only to elements related to their goal (nav, search, headlines) and filter out ad-shaped, right-rail, or heavily styled promotional regions ("right-rail blindness").
- Average display-ad click-through rate: **~0.06%** (6 clicks per 10,000 impressions).
- Practical consequence: if your legitimate content (a key CTA, an important notice) is styled like a banner - bright box, image-heavy, right rail, carousel - users will not see it. NN/g also found auto-forwarding carousels and accordions reduce visibility of content.
- Related concept: **information scent** (Pirolli & Card's information foraging theory) - users click links whose labels smell strongly of their goal; weak, vague, or clever-but-unclear labels get ignored. People don't read, they scan (F-pattern), and they satisfice: they click the first plausible option, not the best one.

---

## 3. Trust signals: what makes a site feel credible

### 3.1 Stanford Web Credibility Project (B.J. Fogg, Persuasive Technology Lab)
- 3 years of research, 1999–2002, **4,500+ participants** - still the foundational work on web trust.
- Headline finding: **people judge credibility first by visual design.** In Fogg's studies, ~46% of consumers assessed credibility based on overall visual appeal (layout, typography, images, consistency); the often-cited derived stat: **75% of consumers judge a company's credibility by its website design**.
- Fogg's "Prominence-Interpretation Theory": credibility assessment = what users notice x how they interpret it.
- **The 10 Stanford Web Credibility Guidelines** (credibility.stanford.edu):
  1. Make it easy to verify accuracy (citations, references, links to evidence).
  2. Show there's a real organization behind the site (address, photos, memberships).
  3. Highlight expertise (credentials, affiliations; don't link to non-credible sites).
  4. Show honest, trustworthy people are behind the site (bios, photos).
  5. Make it easy to contact you (phone, address, email).
  6. Design the site to look professional (or appropriate to purpose) - visual design is the first credibility test.
  7. Make it easy to use - and useful (usability *is* a trust signal).
  8. Update content often (visible freshness = credibility).
  9. Use restraint with promotional content (few ads, clearly separated; avoid pop-ups).
  10. Avoid errors of all types (typos, broken links, downtime) - small errors do outsized credibility damage.

### 3.2 Trust signals in practice (modern synthesis)
- **Security/trust badges near payment**: Baymard finds ~19% of abandoners cite "didn't trust the site with my credit card." Perceived security matters more than technical security - users trust visual cues (padlock, familiar badge like Norton/McAfee/PayPal, professional form styling) over actual TLS details. Baymard: users feel data entered inside a visually "boxed and badged" section is safer even though the whole page has identical encryption.
- **Transparent pricing** - hidden costs are the #1 avoidable abandonment cause (§5).
- **Reviews with volume + recency**; real photography over stock; specific numbers ("14-day returns, no questions") over vague claims.
- **Consistency and polish**: mismatched fonts, broken images, or a 2010-era design read as "this company might not still exist."
- **Familiar patterns** themselves are a trust signal (Jakob's Law, §7): a checkout that behaves strangely feels fraudulent even when it isn't.

---

## 4. Friction: good vs. bad

### 4.1 Bad friction
Anything that impedes a motivated user's progress without protecting them: unnecessary form fields, forced account creation, unclear errors, slow loads, CAPTCHAs at the wrong moment, re-entering data, surprise steps. Fogg's Behavior Model (B = MAP: Behavior happens when Motivation, Ability, and a Prompt converge) frames it: friction reduces Ability, so behavior fails unless motivation is very high.

### 4.2 Good (intentional) friction
Deliberate obstacles at critical moments to prevent errors, ensure informed consent, or improve security. Grounded in NN/g heuristics "Error prevention" and "User control and freedom."
- **Type-DELETE-to-confirm** for destructive irreversible actions (GitHub repo deletion is the canonical example).
- **Two-factor authentication** and re-auth before sensitive changes.
- **Netflix-style verification**: email confirm ("Verify Phone") after account-detail changes, blocking unauthorized modifications.
- **Slack's warning** before @channel notifications to large groups - makes consequences visible and educates.
- **Undo instead of confirm** where reversibility is possible (Gmail's "Undo send") - friction after the fact, not before.
- **Ethical/cooldown friction**: purchase confirmations for in-app purchases (what Epic Games *lacked* - see §9), screen-time prompts, "are you sure you want to send this?" toxicity checks.
- Rule of thumb: **friction should be proportional to the stakes and irreversibility of the action.** Zero friction for browsing; maximum friction for "delete everything."
- Case study for good-friction ROI in reverse - **Amazon 1-Click** (patented 1999): removing checkout friction was worth billions; the patent's expiry in 2017 was industry news. Removal of friction where stakes are low = value.

---

## 5. Cart & form abandonment (Baymard Institute - the authoritative source)

Baymard Institute has run large-scale checkout usability research since 2010 (tens of thousands of hours of testing; they audit top e-commerce sites against 650+ checkout guidelines).

### 5.1 The headline numbers (Baymard, updated Sept 2025)
- **Average documented cart abandonment rate: 70.22%** (average of 50 studies; range across years: 59.8% in 2006 → ~71.7% in 2025).
- **Mobile abandonment ~80% vs desktop ~66%** - smaller screens amplify every friction point.
- **43% of US shoppers** abandoned simply because they were "just browsing / not ready to buy" - unavoidable; design can't fix intent.
- **Reasons for abandonment during checkout** (excluding the just-browsing segment):
  - 39% - extra costs too high (shipping, taxes, fees)
  - 21% - delivery too slow
  - 19% - didn't trust the site with credit card information
  - 19% - site required account creation
  - 18% - checkout process too long/complicated
  - 15% - unsatisfactory returns policy
  - 15% - website errors/crashes
  - 14% - couldn't see/calculate total order cost up front
  - 10% - insufficient payment methods
  - 8% - card declined
- **Recoverable value**: Baymard estimates **~$260 billion** of the ~$738B US+EU e-commerce sales is recoverable through better checkout design alone; the average large site can lift conversion **~35%** purely through checkout UX improvements.

### 5.2 Form design findings
- The **average US checkout shows 23.48 form elements** by default; an ideal checkout needs only **12–14 elements (7–8 actual fields)**. Most checkouts can cut 20–60% of what they display.
- Key Baymard guidelines: guest checkout by default (offer account creation *after* purchase); single "Full name" field instead of first/last; hide "Address line 2" and "Company" behind links; use inline validation with specific error messages; show a total-cost estimator early; clearly mark optional fields (not just required ones).
- **Expedia's $12M form field** (classic case study, reported 2010): one optional "Company" field on the payment form confused users - they typed their bank's name, then their bank's address, cards failed address verification, transactions died. **Deleting that single optional field added ~$12M/year in profit.** Lesson: even optional fields carry cost; every field must justify its existence.
- Hesitation psychology in forms: asking for sensitive info (phone number) too early triggers "why do you need this?" distrust; explain the reason inline ("for delivery questions only").

---

## 6. Emotional design - Don Norman's three levels

From Norman's *Emotional Design: Why We Love (or Hate) Everyday Things* (2004). Core claim (with the "attractive things work better" research by Norman, and Kurosu & Kashimura / Tractinsky's ATM studies): **aesthetically pleasing designs are perceived as easier to use and are more tolerated when they fail** - positive affect broadens thinking and increases tolerance of minor difficulties.

1. **Visceral level** - immediate, pre-conscious, biological reaction to appearance: color, shape, motion, sound, first impression ("good/bad, safe/dangerous" in milliseconds). Norman's example: the 1961 Jaguar E-Type. UX: landing-page first impressions form in **~50ms** (Lindgaard et al., 2006 - "you have 50 milliseconds to make a good first impression"); this visceral judgment then anchors credibility (ties directly to Fogg's finding that design look = first credibility test).
2. **Behavioral level** - the experience of use: function, performance, usability, the feel of interactions. Mostly subconscious during skilled use. Good behavioral design = the product does what you expect, effectively (knife that dices well; app that responds instantly). This is where classic usability lives.
3. **Reflective level** - conscious, after-the-fact meaning: self-image, memories, pride of ownership, what the product says about me, whether I'd recommend it. Apple products and luxury brands trade heavily here; so do "I hit my streak" moments in Duolingo.
- The levels interact and can conflict: a beautiful (visceral) product with poor usability (behavioral) can still be loved reflectively - and vice versa. Great products win on all three.
- Chapter link: clicks are driven viscerally (does this look trustworthy/attractive?), behaviorally (is it effortless?), and reflectively (do I want to be someone who uses this?).

---

## 7. Familiarity and Jakob's Law

- **Jakob's Law** (Jakob Nielsen, NN/g, 2000): "Users spend most of their time on *other* sites. This means users prefer your site to work the same way as all the other sites they already know." Users spend roughly **95–99% of their time elsewhere**, so their mental models are formed by the aggregate of the web, not by your product.
- **Mental models** (NN/g): users act on their beliefs about how a system works; when the interface violates the model, they make errors, blame themselves, hesitate, or leave. Familiar patterns let users spend cognitive budget on their task, not on learning your UI.
- Practical rules: put the logo top-left linking home; cart icon top-right; underline links or make them clearly interactive; use conventional icons; follow platform conventions (Material Design on Android, Apple HIG on iOS).
- Innovation guidance: innovate in your core value, be conventional in the chrome around it. When you must change a familiar pattern, offer a transition (Google/YouTube commonly ship "use the old version for a while" toggles - the book *Laws of UX* by Jon Yablonski cites this as the standard mitigation).
- Familiarity is also a trust/fluency effect: **processing fluency** - things that are easy to perceive and understand are judged as truer, safer, and better (mere-exposure effect: repeated exposure alone increases liking). Unfamiliar checkout = "is this a scam?"

---

## 8. Why people hesitate or abandon - a unifying checklist

Synthesis for the chapter (each maps to research above):
1. **Too many choices / unclear next step** → Hick's Law, choice overload.
2. **Surprise costs or surprise steps** → loss aversion + fairness violation (Baymard #1 avoidable cause).
3. **Trust gap at the moment of commitment** → missing credibility signals exactly where risk is felt (payment, personal data).
4. **Effort exceeds motivation** → Fogg B=MAP; too many fields, forced registration.
5. **Violated expectations** → Jakob's Law; unfamiliar patterns read as broken or fraudulent.
6. **No urgency or reason to act now** → absence of (honest) scarcity/momentum; "just browsing" is 43% - capture them with wishlists, email save-carts, retargeting instead of forcing conversion.
7. **Fear of irreversibility** → no visible undo, unclear returns policy → hesitation. Reversibility messaging ("free cancellation") is one of Booking.com's most effective *legitimate* persuasion tools.

---

## 9. Dark patterns (deceptive design)

### 9.1 Definition & taxonomy
- Term coined by **Harry Brignull in 2010** (darkpatterns.org → now **deceptive.design**; his 2023 book: *Deceptive Patterns*). Definition: interface tricks that make users do things they didn't mean to do, benefiting the business at the user's expense.
- Brignull's canonical types (know these by name):
  - **Sneak into basket** - items/add-ons added without an explicit action (pre-checked boxes).
  - **Roach motel** - easy to get in, hard to get out (subscriptions you can cancel only by phone).
  - **Confirmshaming** - guilt-tripping decline options ("No thanks, I hate saving money").
  - **Hidden costs** - fees revealed only at the last step (drip pricing).
  - **Bait and switch** - user sets out to do one thing; a different thing happens.
  - **Disguised ads** - ads styled as content or navigation (fake "Download" buttons).
  - **Forced continuity** - silent conversion of free trials into paid subscriptions, no reminder, hard cancellation.
  - **Privacy Zuckering** - tricking users into sharing more data than intended (named after Facebook).
  - **Misdirection** - visual emphasis steering attention away from the honest choice (bold "Accept", grey whisper "Reject").
  - **Trick questions** - confusing double negatives in opt-outs ("Uncheck this box if you do not want to not receive emails").
  - **Price comparison prevention**, **friend spam** (harvesting contacts then spamming them - LinkedIn paid a $13M settlement for this in 2015), **fake urgency/scarcity** (invented countdowns and stock levels), **nagging**.

### 9.2 Why avoid them (beyond ethics)
- They work short-term and poison long-term metrics: chargebacks, refunds, support load, churn, review bombing, brand distrust. Research and FTC materials note users who discover manipulation retaliate and don't return.
- They are increasingly **illegal** (below), and "the designer was following orders" is not a defense reputationally - individual designers are named in case studies at deceptive.design's Hall of Shame.

### 9.3 Legal enforcement - headline cases (know the numbers)
- **Epic Games / Fortnite (FTC, Dec 2022, finalized Mar 2023): $520M total** - $275M COPPA penalty + **$245M in consumer refunds for dark patterns**. FTC found counterintuitive, inconsistent button layouts caused purchases while waking the game from sleep or from loading screens; Epic used internal testing to deliberately obscure cancel/refund options, and locked accounts of customers who disputed charges.
- **Amazon Prime "Iliad" case (FTC, settled Sept 2025): $2.5 billion** - the largest dark-pattern enforcement in history ($1B civil penalty + $1.5B refunds). Amazon enrolled users in Prime without clear consent and built a deliberately labyrinthine cancellation flow internally code-named **"Iliad"** (multi-page, multi-step, repeated retention offers). Also triggered by the FTC's **"click-to-cancel" rule-making** push (Negative Option Rule: cancellation must be as easy as sign-up).
- **Booking.com / travel urgency**: UK CMA enforcement (2019) against pressure selling, misleading discounts and hidden charges across booking sites; investigations found some "only 1 room left" claims misleading (rooms available elsewhere/other dates); **Spain fined Booking.com €413M (2024)** (competition/transparency; widely reported alongside its dark-pattern criticism); ongoing EU/Dutch consumer suits cite fabricated scarcity as prohibited dark patterns.
- **EU law**: GDPR (consent must be freely given - asymmetric cookie banners fined: France's CNIL fined **Google €150M and Facebook €60M in 2022** for making "reject cookies" harder than "accept"); **Digital Services Act Art. 25 explicitly bans dark patterns** on platforms (fines up to 6% of global turnover; 2025 preliminary findings against Meta and TikTok include dark-pattern appeal flows); TikTok ordered by EDPB (2023) to eliminate unfair design in consent flows. California's CPRA also invalidates consent obtained via dark patterns.
- Takeaway for the chapter: dark patterns moved from "shady growth hack" to **regulated, fineable conduct** in ~a decade (2010 term coined → 2022–2025 nine- and ten-figure penalties).

### 9.4 Case-study contrast for the chapter
Booking.com is the perfect two-sided example: legitimate persuasion (real reviews, real "free cancellation" reversibility, genuine popularity data) interleaved with pressure tactics regulators found misleading (ambiguous scarcity counts, anxiety-inducing urgency everywhere). Same psychological principles; the difference is truthfulness and user benefit.

---

## 10. Persuasion vs. manipulation - the ethics line

- Working definition: **persuasion helps users make informed decisions aligned with their own goals; manipulation exploits biases to serve business goals at the user's expense.** When business goals override user well-being, persuasion has crossed the line.
- Two useful academic axes (ACM DIS 2023, "Ethical Tensions in UX Design Practice"): **salience** (is the influence mechanism visible to the user?) and **force** (does the user retain a real, practical alternative path?). Low salience + low freedom = dark pattern; high salience + preserved agency = persuasion.
- Practical tests a designer can apply (synthesized from NN/g, Brignull, UX Mag's "Towards an Ethics of Persuasion"):
  1. **Truth test** - is every claim (stock, timer, review count, "most popular") literally true?
  2. **Transparency test** - would the design still work if the user fully understood what it was doing? Would you be comfortable explaining it on stage?
  3. **Symmetry test** - is "no" as easy as "yes"? Is cancel as easy as subscribe? (Now literally the legal standard in FTC click-to-cancel and the EU DSA.)
  4. **Regret test** - after acting, will users feel they made the choice, or that it was made to them? Monitor refund/chargeback/uninstall rates as a manipulation smoke alarm.
  5. **Vulnerability test** - does it hold up when the user is a child, elderly, stressed, or not fluent? (Epic's case was aggravated by targeting children.)
- Nudge ethics (Thaler & Sunstein): a legitimate nudge must be transparent, easy to opt out of, and welfare-improving for the person nudged - Thaler calls exploitative nudges "sludge" (a handy term for the chapter: sludge = friction engineered *against* the user's interests; the Amazon Iliad flow is textbook sludge).
- B.J. Fogg's own lab ethics stance: persuasive technology must not be used to deceive or to target vulnerable groups - notable because the same Stanford lab produced both the credibility guidelines and many growth practitioners.

---

## 11. Expert rules of thumb (quick-fire list for the chapter)

1. Every added option costs decision time (Hick); every added field costs conversions (Expedia's $12M); every surprise cost costs trust (Baymard's 39%).
2. Show total cost as early as possible; never let price grow at the last step.
3. Default = decision. Set defaults you'd defend publicly.
4. One primary CTA per screen; visually demote everything else.
5. Social proof must be specific, recent, and relevant (peer similarity beats volume).
6. Scarcity/urgency only when literally true - and even then, use sparingly.
7. Match friction to stakes: none for browsing, some for spending, lots for deleting.
8. Prefer undo to confirm; prefer guest checkout to forced signup.
9. Look professional or die: visual polish is the first credibility test (Stanford), formed in ~50ms.
10. Be conventional where users are habituated (nav, checkout, forms); be novel only in your core value (Jakob's Law).
11. Don't style important things like ads (banner blindness kills legitimate content too).
12. If a pattern needs to be hidden to work, it's manipulation. Salience + user agency = the ethics line.

## 12. Common mistakes to warn beginners about

- Adding features/options/tiers because "more choice = more value" (choice overload says otherwise).
- Copying dark patterns from big brands ("Amazon does it") - those same tactics produced record fines.
- Treating trust as a badge you paste at the end instead of a property of the whole experience (errors, staleness, weird patterns all leak distrust).
- A/B-testing only short-term conversion, never measuring regret (refunds, churn, support tickets).
- Removing ALL friction, including protective friction (accidental purchases, destructive actions).
- Fake social proof / fabricated counters - now explicit FTC territory (fake-review rule, 2024).
- Ignoring mobile: 80% abandonment means every desktop-era friction is worse on phones.
- Confusing "users didn't complain" with "users consented" - most manipulation is discovered later, at churn time.

---

## Sources

- Laws of UX - Hick's Law & Jakob's Law: https://lawsofux.com/hicks-law/ , https://lawsofux.com/jakobs-law/
- IxDF, Hick's Law overview: https://www.interaction-design.org/literature/topics/hick-s-law
- Iyengar & Lepper jam study discussion (UX Psychology): https://uxpsychology.substack.com/p/lost-in-navigation-overcoming-the
- Johnson & Goldstein, "Defaults and Donation Decisions" (PDF): https://hods.org/pdf/Defaults%20and%20Donation%20Decisions.pdf ; SSRN "Do Defaults Save Lives?": https://papers.ssrn.com/sol3/papers.cfm?abstract_id=1324774
- Stanford Web Credibility Project guidelines: https://credibility.stanford.edu/guidelines/index.html ; Wikipedia overview: https://en.wikipedia.org/wiki/Stanford_Web_Credibility_Project
- Baymard Institute - Cart Abandonment Rate statistics: https://baymard.com/lists/cart-abandonment-rate ; Checkout usability research: https://baymard.com/research/checkout-usability
- Expedia $12M form field case: https://www.ppc.org/expedia-removes-one-form-field-and-makes-12-million-in-profit/ ; https://uxmovement.com/thinking/the-12-million-optional-form-field/
- Norman's Three Levels of Design (IxDF): https://www.interaction-design.org/literature/article/norman-s-three-levels-of-design ; NN/g video: https://www.nngroup.com/videos/3-levels-emotional-processing/ ; Emotional Design (Wikipedia): https://en.wikipedia.org/wiki/Emotional_Design
- NN/g - Mental Models: https://www.nngroup.com/articles/mental-models/ ; Jakob's Law video: https://www.nngroup.com/videos/jakobs-law-internet-ux/
- NN/g - Banner Blindness Revisited (2018): https://www.nngroup.com/articles/banner-blindness-old-and-new-findings/ ; original eyetracking: https://www.nngroup.com/articles/banner-blindness-original-eyetracking/
- NN/g - Designing for Friction and Flow: https://www.nngroup.com/videos/friction-flow-customer-journeys/ ; Smashing Magazine, Designing Friction: https://www.smashingmagazine.com/2018/01/friction-ux-design-tool/ ; UXPin cognitive friction: https://www.uxpin.com/studio/blog/cognitive-friction-good-or-bad/
- Cialdini principles applied to conversion (CXL): https://cxl.com/blog/cialdinis-principles-persuasion/ ; https://www.cognitigence.com/blog/cialdini-7-principles-of-persuasion
- BrightLocal Local Consumer Review Survey: https://www.brightlocal.com/research/local-consumer-review-survey/ ; review statistics: https://www.brightlocal.com/resources/online-reviews-statistics/
- Brignull, Deceptive Design (types + Hall of Shame): https://www.deceptive.design/ ; Epic case page: https://www.deceptive.design/cases/in-the-matter-of-epic-games-inc ; Wikipedia dark pattern: https://en.wikipedia.org/wiki/Dark_pattern
- FTC - Epic Games $520M press release: https://www.ftc.gov/news-events/news/press-releases/2022/12/fortnite-video-game-maker-epic-games-pay-more-half-billion-dollars-over-ftc-allegations ; $245M finalized order: https://www.ftc.gov/news-events/news/press-releases/2023/03/ftc-finalizes-order-requiring-fortnite-maker-epic-games-pay-245-million-tricking-users-making
- Amazon Prime / FTC $2.5B settlement & dark-pattern law roundup: https://www.terms.law/2025/12/05/dark-patterns-subscriptions-and-ai-designed-flows-where-the-law-draws-the-line-now/ ; https://www.pageauditors.com/blog/dark-patterns-ftc-enforcement-guide
- Booking.com pressure selling (The Caterer / CMA): https://www.thecaterer.com/news/booking-com-pressure-selling ; lawsuits over scarcity tactics: https://gulfnews.com/travel/only-one-room-left-bookingcom-faces-massive-lawsuits-over-anti-competitive-practices-market-abuse-deceptive-pricing-fabricated-scarcity-tactics-1.500230124
- EU DSA enforcement vs Meta/TikTok (European Commission, Oct 2025): https://ec.europa.eu/commission/presscorner/detail/en/ip_25_2503 ; EDPB TikTok order: https://www.edpb.europa.eu/news/news/2023/following-edpb-decision-tiktok-ordered-eliminate-unfair-design-practices-concerning_en
- Ethics: ACM DIS 2023, "Ethical Tensions in UX Design Practice": https://dl.acm.org/doi/10.1145/3563657.3596013 ; UX Magazine, "Towards an Ethics of Persuasion": https://uxmag.com/articles/towards-an-ethics-of-persuasion ; Learning Loop, Persuasion vs Manipulation: https://learningloop.io/blog/persuasion-vs-manipulation
- Anchoring/loss aversion review (behavioral economics): https://www.researchgate.net/publication/396628381_Loss_Aversion_and_Anchoring_Effect_A_Review_of_Behavioral_Economics
