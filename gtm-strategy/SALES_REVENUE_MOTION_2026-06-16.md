# Sales & Revenue Motion - Research & Playbook (2026-06-16)

> **Scope:** the sales & revenue *motion* that runs **after a lead or trial already exists** - not acquisition (covered in `ACQUISITION_CHANNELS_2026-06-15.md`) and not funnel shape (covered in `CONVERSION_FUNNEL_RESEARCH_2026-06-15.md`). This doc answers: once a print-shop owner is in the funnel, **how do we sell, qualify, forecast, trial, and onboard them to paid** - given a low-ACV product, a non-technical buyer, and a tiny founder-led team.
>
> **Status:** research-only. No code changed. Recommendations are prioritized but not yet built.
>
> **Method:** multi-agent web research (5 parallel streams), each written and then adversarially critiqued for "generic-enterprise-advice that won't survive a low-ACV SMB reality." Benchmarks are directional - treat as starting priors to A/B against our own cohort, not gospel.

## Who we're selling to (the constraint that decides everything)

- **Buyer:** a non-technical, time-poor print-shop owner. They are the economic buyer, champion, decision-maker, and "procurement department" in one person - deciding alone, often on their phone, between print jobs.
- **ACV:** SMB-scale (likely ~$30–100/mo). A $49/mo plan ≈ $588/yr gross. This is **a fifth of the ~$3K ACV floor** that justifies a dedicated salesperson.
- **Team:** founder-led, 1–3 people. No SDRs, no CS org, no enterprise procurement track.
- **Already decided (validated by this research):** no-card 14-day **reverse** trial; North Star = **store live + first order in 7 days**; ≤5-step go-live checklist + demo store; primary acquisition = founder-led outreach + print communities.

## Executive summary - the one-paragraph answer

Run a **self-serve PLG spine with a founder-run, PQL-triggered sales-assist layer on top.** Do **not** build a sales-led motion, hire reps, or adopt enterprise methodology - the arithmetic forbids it. The product is the closer; the founder's scarce human hours go **only** to high-intent accounts the product has already half-sold (PQLs). Forecast as **two stacks summed** (self-serve run-rate + a hand-counted list of assisted deals). Activation - not trial length - drives ~60–75% of conversion, and it's decided in the **first 72 hours**, so front-load everything there. Build the **capped-but-alive free tier** (the reverse trial's prerequisite) and **default the pricing step** (the most likely stall for a non-technical owner) before anything else.

### The 10 highest-leverage moves (consolidated, in rough build order)

1. **Build the capped-but-alive free tier** the reverse trial downgrades into (store stays live, ~3 products, "Powered by" badge, cost caps). Without it, the reverse trial is just a free trial. *(§4.6)*
2. **Default pricing on the seeded sample product** so owners can publish before mastering the pricing engine - pricing is the most probable cliff. *(§5.7A, §5 P1)*
3. **Move the activation target to "first *test* order in days 1–3."** End the ≤5-step checklist on "place a test order," not "tax settings." *(§4.2, §5.2)*
4. **Define Print-Flow-360's PQL signals** (first real order, store live, products+pricing configured, B2B/departments turned on) - translate Slack/Zendesk playbooks to print-shop behavior. *(§1.4)*
5. **Ship two product-event automations:** a **stalled-trial alert** (no setup/first order by day 3) and a **PQL alert** (store-live + first-order). These *are* the sales process. *(§3, §4.4)*
6. **Sales-assist = the founder, fired only on HOT PQLs**, within 24h, as *coaching* ("want a 15-min call to dial in your pricing?"), not a pitch. *(§1.5, §2)*
7. **Capture 2–3 intent questions at first-run and actually use them** to seed the sample catalog + frame copy (the PLG "context pack"). *(§5.5)*
8. **Forecast as two stacks summed:** self-serve trailing-3-mo run-rate + cohort churn; assisted = hand-listed named deals (don't fake stage-weighting under ~20 closed deals). *(§3.5)*
9. **One 30-min Friday review** (stalled trials → PQLs → assisted deals → run-rate + activation check). CRM = Google Sheet or HubSpot Free; Attio only if technical and you'll wire product signals. *(§3.4, §3.7)*
10. **Don't stop at "store published."** Drive **real orders for 2–4 weeks** (the habit moment) - that's the retention seed and it feeds word-of-mouth acquisition. *(§5.2, §5.6)*

### What to explicitly NOT do

SDR team · MQL lead-scoring · scripted demos · per-account reps · enterprise procurement/security track · MEDDIC/MEDDPICC · card-up-front trials · 30-day trials · product tours · dedicated CSMs · open-ended POCs · bespoke pilot builds · a full analytics platform before the five core events exist.

---

## Table of contents

1. [Sales-led vs. Self-serve vs. Hybrid (PLG) for SMB](#1-sales-led-vs-self-serve-vs-hybrid-plg-for-smb)
2. [Discovery & Objection-Handling Frameworks (SPIN, Sandler, Challenger, MEDDIC…)](#2-discovery--objection-handling-frameworks-spin-sandler-challenger-meddic-etc)
3. [Pipeline / CRM Hygiene & Forecasting](#3-pipeline--crm-hygiene--forecasting)
4. [Trials & POCs - Structuring Trials That Convert](#4-trials--pocs--structuring-trials-that-convert)
5. [Onboarding-to-Paid Handoff (activation → first value → retained customer)](#5-onboarding-to-paid-handoff-activation--first-value--retained-customer)
6. [Consolidated sources](#6-consolidated-sources)

---

## 1. Sales-led vs. Self-serve vs. Hybrid (PLG) for SMB

This section answers one question for Print-Flow-360: **once a print-shop owner is in your trial, who closes them - the product, the founder, or a salesperson?** The acquisition and conversion-funnel work is already settled (no-card 14-day reverse trial, North Star = store live + first order in 7 days). This is about the *revenue motion* layered on top of that trial. The short answer, defended below: **self-serve spine + founder-run, PQL-triggered sales-assist. No sales-led motion, no hires until the founder is the bottleneck.**

### 1.1 The three motions are one spectrum, not a menu

The useful mental model (consensus across OpenView, Decibel VC, Userpilot) is a **touch spectrum** ordered by how much human involvement each account needs:

| Motion | A.k.a. | Human touch | Who decides | Typical ACV band |
|---|---|---|---|---|
| **Self-serve / PLG** | "no-touch" | None - sign up, activate, pay by card | One person, alone | < $5K–$10K |
| **Hybrid / Product-Led Sales** | "low-touch", sales-assist | Sales *assists* only when the user signals intent (a PQL) | Self-serve user → optional nudge | ~$5K–$50K |
| **Sales-led / SLG** | "high-touch", enterprise | Rep drives demo → trial → procurement → close | Buying committee | > $25K–$50K |

The reframe that matters: **PLG and sales-led are not opposites - they're two ends of one continuum, and hybrid is where most B2B SaaS actually lives.** Slack, Atlassian, Dropbox, and Zoom all carry 30–50% sales headcount - but that sales team sits *downstream* of a self-serve flywheel, catching the highest-intent accounts. It is not bolted on in front of the funnel. (Evidence: strong - multiple independent sources, named companies. The ACV cutoffs are widely-cited rules of thumb, not laws; sources draw the line anywhere from $10K to $50K.)

The trap for a founder is reading "Slack has a big sales team" as "I should hire a salesperson." That's backwards. Their sales team is a *destination after a flywheel exists* - not a starting template for a low-ACV print SaaS. **At your stage there is no "sales team" line in the org chart at all; there is the founder, an inbox, and a calendar.**

### 1.2 The ACV math that decides it for you

The canonical source is **Tomasz Tunguz (Theory Ventures, ex-Redpoint), "The Smallest ACV to Justify an Inside Sales Team."** The math:

- A fully loaded inside-sales rep costs **~$100K/yr** and should carry a **~$500K quota**.
- At **$500 ACV**, that quota means closing **1,000 deals/year ≈ 4.2 deals every single working day** - Tunguz's word: "stratospheric."
- To make close rates realistic at low ACV you must *cut* quotas, which roughly **doubles the cash** needed to hit the same bookings.
- **Tunguz's practical floor: ~$3,000+ ACV** before a dedicated rep is sustainable.

Triangulating sources agree: **LTV under ~$1,000 → a sales team is almost certainly not a fit** (Close.com); a common "lanes" rule routes **dedicated humans only above ~$25K ACV**, everything below to automated onboarding + self-service.

**Read for Print-Flow-360 - make this concrete.** A typical SMB print-shop plan is a low *monthly* subscription. Run your own number before reading further: **ACV = monthly price × 12 × (gross margin) ÷ (annual logo churn).** As a sanity check, a **$49/mo plan = $588/yr gross**; even at zero churn that's a fifth of Tunguz's $3K floor, and at the ~3–5%/mo logo churn that's normal for self-serve SMB it's lower still. The unit economics **forbid a dedicated sales rep per account** - this isn't a preference, it's arithmetic. Combined with your buyer profile (a non-technical, time-poor shop owner who decides *alone*, on their phone, between print jobs), you have the textbook PLG / low-touch profile. The only ACV that could ever clear $3K is a **multi-location / franchise / B2B** account (§1.5, P1) - and even those start self-serve. The only question left is *where* to spend the founder's scarce human hours - and the answer is PQLs (§1.4).

### 1.3 Unit-economics guardrails (hold yourself to these)

For a cash-constrained team, **payback period beats theoretical LTV.** GrowthSpree's line is the one to tape to your wall: *"a $50K-LTV customer who takes 24 months to pay back CAC is worse than a $30K-LTV customer who pays back in 8 months. Cash flow trumps theoretical lifetime value."* At your ACV the absolute numbers are smaller, but the rule is identical - you cannot float months of negative cash per logo.

| Metric | Healthy benchmark (low-ACV SMB) | What it tells you |
|---|---|---|
| **CAC payback** | **< 12 mo; aim 6–9 mo** | The number that matters most at founder scale. SMB self-serve should pay back fast or not at all. |
| **LTV:CAC** | ≥ 3:1 (SMB averages only ~2.5:1 early - acceptable) | < 3:1 = overspending to acquire |
| **CAC (absolute)** | **$200–$600 / account** (cap near 1× annual contract value at this ACV) | Above this, the no-touch model is leaking. The $300–$800 enterprise-SMB figure is too high for a $49/mo plan. |
| **Logo churn** | **< 3–5% / mo** early; trending down | The silent CAC-payback killer at low ACV - a fast payback means nothing if they leave in month 4. |
| **SaaS Magic Number** = (Net New ARR × 4) / prior-Q S&M | **> 0.75 = pour more in; < 0.5 = fix the motion** | Whether to spend more on acquisition at all. *Caveat: noisy until you have a real S&M spend line - at founder-time-only it's directional, not a dashboard metric.* |
| **Trial → paid** (no-card, sub-$5K ACV) | **8–15%** (no-card trials run low; "great" = 15%+) | If you're under ~8%, the problem is time-to-value, not sales. |

(Evidence: directional. No-card reverse trials convert lower than opt-in/with-card trials - calibrate to single-to-low-double digits, not 20%+. Treat all numbers as ranges.)

### 1.4 PQLs - the primitive that makes hybrid affordable for a tiny team

The concept that lets a one-person sales effort work is the **Product-Qualified Lead (PQL)**, popularized by **OpenView**. A PQL is *a user who has already experienced real value in the product* - intent inferred from **usage**, not from marketing actions (email opens, downloads = MQL noise). PQLs convert at **15–30%** to paid versus single digits for MQLs.

Why this is the whole game for you: with a PQL system, **you apply the founder's human touch only where the math works, and only after the product has already done the selling.** You're not pitching - they've felt the value. You're removing the last obstacle.

OpenView / ProductLed score three signal types:

1. **Fit** - matches your ICP (a real print shop, right size).
2. **Value** - reached the "aha" moment (meaningful usage).
3. **Intent** - hand-raising (visited pricing/billing, clicked "Upgrade," "Talk to us").

Real, named playbooks (strong evidence), and the *translation* you actually need:
- **Slack:** sign up → **invite teammates within 72 hrs** → hit message thresholds (~2,000 messages = "activated" workspace) → integrate tools. Free users hitting limits get upgrade prompts ("positive pressure"). *Translate to: store published + first order, not "messages."*
- **Zendesk:** trial users who **set up a help center + configured ticketing** (high-effort setup = high intent). *Translate to: configured a product with real pricing - high-effort setup a tire-kicker won't do.*
- **Atlassian:** Jira project creation signals Confluence cross-sell. *Translate to: a single-shop owner who turns on departments / business accounts is signalling B2B scale = your only real upsell lane.*

Practitioner calibration rule (Pocus / OpenView): **don't over-engineer scoring on day one.** Set one or two thresholds, **watch your first ~50 PQLs for two weeks, then adjust.** At founder volume you can eyeball every signup at first - formal scoring comes *after* you've learned which signal predicts a paid, retained customer.

### 1.5 The hybrid playbook - Wes Bush's three legitimate reasons to insert a human

**Wes Bush (ProductLed, author of *Product-Led Growth* and *The Product-Led Playbook: how to win with a tiny team*)** gives the canonical low-touch rules. There are only three legitimate reasons to put a human into a self-serve flow:

1. **Coach to value** - the human is a *coach* who spots where a user is stuck, not a pitcher.
2. **Facilitate expansion** - reach the decision-maker to add seats / multi-location.
3. **Guide the buying process** - put "Talk to us / Book a call" CTAs in-product so handraisers self-select.

His two load-bearing rules for you:
- *"Design onboarding to start when someone gets a quick win, and end when they become a PQL."* Deploy sales-assist **the moment** a user becomes a PQL - not before.
- *"Where most people mess up is trying to monetize too quickly. Get the user to value first; revenue follows."* Directly relevant to a non-technical buyer who needs to *see their own store take a real order* before they'll pay.

The **reverse trial** (start on the premium tier, downgrade/pay at trial end) is the recommended default when "aha" needs **more than one session** - exactly the print-shop case (set up products → publish → wait for a customer order spans days). Your existing no-card 14-day reverse-trial decision is well-supported; nothing here changes it.

The mechanic that scales without headcount: **automation handles the volume of low-intent trials; the founder touches only high-score PQLs.** For a print-shop buyer, "automation" means in-app nudges, plain-language emails, and one-click "book a call" - *not* a drip sequence of feature jargon they'll ignore.

### How this applies to Print-Flow-360

**Recommendation (opinionated): run a self-serve PLG spine + a founder-run, PQL-triggered sales-assist layer. Do NOT build a sales-led motion, an SDR team, MQL scoring, or per-account reps. The ACV forbids it and your buyer - a solo, non-technical shop owner - neither expects nor wants a salesperson.** Prioritized:

**P0 - Define Print-Flow-360's PQL signals now (single highest-leverage action).**
Translate the Slack/Zendesk playbooks into print-shop behavior. Start with the two HOT signals only; add the rest once you've watched ~50 trials.

| Signal type | Print-Flow-360 signal | Weight |
|---|---|---|
| **Fit** | Real print shop; ≥1 product + category created (filters tire-kickers) | gate |
| **Value** | **First real order received** (= your North Star = hottest single signal) | hot |
| **Value** | Storefront published / made live | hot |
| **Value** | ≥1 product fully configured *with pricing* | warm |
| **Value** | Design studio used to create/save a design | warm |
| **Value** | Invited a team member (Slack's 72-hr-invite analog) | warm |
| **Intent** | Visited pricing/billing; clicked "Upgrade"; opened final go-live step | hot |
| **Intent** | Turned on departments / business accounts (B2B = bigger ACV) | hot + route to B2B path |

Scoring bands (keep it this simple at first):
- **HOT** - first order OR store live → **founder reaches out within 24 hrs.**
- **WARM** - products + pricing configured but not live → **automated nudge + a one-click "book a 15-min setup call."**
- **COLD** - signup only, nothing configured → **automation only; do not spend founder time.**

**P0 - Make sales-assist = the founder, triggered only by HOT PQLs.** Concrete cadence:
- **Hot PQL fires (store live / first order)** → founder sends a personal message (email or in-app, whatever channel they signed up with) within 24 hrs. This is coaching, not pitching:
  > *"Saw your store just went live / took its first order - congrats. Want a quick 15-min call to make sure your pricing and print-job flow are dialed in before you push volume?"*
  This de-risks churn at peak intent, when a non-technical owner is most likely to hit a setup wall and quietly give up.
- **Stuck-but-trying (products configured, no store live by day 5)** → automated nudge + a **"Book a 15-min setup call"** CTA. This is the **highest-ROI human touch**: time-poor non-technical owners stall on the last 10% of go-live, and one screen-share converts them. Day-5 trigger leaves 9 days of the trial to recover them.
- Persistent **"Need help going live? Book a call"** CTA in the trial UI so handraisers self-select - you only spend time on people who ask. Use a free booking link (Calendly/Cal.com); do not build scheduling.

**P1 - Use billing/checkout to split the 90% from the few bigger accounts.** Self-serve card checkout for solo/small shops (the default; no human touches it). A **"Talk to us"** path for **multi-location / franchise / B2B** prospects - your B2B module (companies, departments, pay-on-account) is the upsell hook. These are the *only* accounts whose ACV could approach the ~$3K rep-justifying floor, so they're the *only* ones worth a longer conversation. Everyone else must be able to pay by card without ever talking to you.

**P1 - Hold the unit-economics guardrails:** CAC payback **< 12 mo (aim 6–9)**, LTV:CAC **≥ 3:1** (accept ~2.5:1 early), CAC **$200–$600/account** (cap near 1× annual contract value at this ACV), logo churn **< 3–5%/mo and falling**. If `(Net New ARR × 4) / prior-Q S&M < 0.5` *once you have a real S&M line*, stop spending on acquisition and fix activation first. Calibrate trial→paid to the **8–15%** no-card range; under ~8% means time-to-value, not sales.

**Sequencing - don't skip ahead:**
1. **Now:** founder hand-sells/onboards **every HOT PQL** → *learn which signals actually predict paid + retained.* This doubles as your highest-value research - every call tells you where non-technical owners get stuck.
2. **Next (once a pattern is obvious):** encode the winning signals into automated PQL scoring + a "Hot trial - reach out" alert. You already have the **Action Center** pattern in-product (computed "needs action now" feed) - **extend it with a "Hot trial / PQL" rule rather than building new machinery.**
3. **Later (only when founder bandwidth is the *proven* bottleneck *and* the motion is repeatable):** one **low-touch onboarding / customer-success hire** - someone who runs setup calls and keeps trials moving, **not** an enterprise AE. A CS/onboarding person pays back at this ACV; a quota-carrying rep does not.

**Explicitly do NOT:** build an SDR team, MQL lead-scoring, scripted sales demos, dedicated per-account reps, an enterprise procurement/security-review track, or a CRM-heavy pipeline process. The ACV won't pay for any of it, and a print-shop owner who just wants to sell business cards will bounce off all of it.

---

## 2. Discovery & Objection-Handling Frameworks (SPIN, Sandler, Challenger, MEDDIC, etc.)

> **TL;DR for the founder:** Don't bolt an enterprise sales methodology onto a sub-$2K, non-technical, self-serve SMB sale - it will slow your tiny team to a crawl and read as "salesy" to a print-shop owner who just wants their evenings back. Instead, steal four parts: **SPIN's** Problem→Implication→Need-payoff questions, **Sandler's** Up-Front Contract and Pain Funnel, **Challenger's** "Teach" (but *not* "Take Control"), and **LAER** for objections. Qualify with a **GPCT-ordered, BANT-lite** sniff test, never MEDDPICC. The whole motion must compress into one **20–30 min call** that ends by dropping the prospect into a *guided, seeded trial* - ideally with their store half-built before they hang up. The product is the closer; discovery just clears the path and confirms the pain is real.

This section complements (not repeats) the prior funnel research. The funnel work decided the *shape* (no-card 14-day reverse trial, North Star = store live + first order in 7 days, ≤5-step go-live checklist + demo store). This section is about what the founder actually *says and asks* on the high-intent assist calls and in async objection-handling once a lead or trial exists.

**Scope guard - when to even take a call.** At this price point most signups should *never* get a 1:1 call; the trial is the motion. Reserve founder-led assist calls for: (a) inbound demo requests, (b) trials that activated but stalled before first order, and (c) your top outbound-sourced targets. Everything else self-serves. If you find yourself on calls with users who'd convert anyway, you're spending founder hours that don't move the number.

### 2.1 The frameworks, fit-rated for your buyer

A print-shop owner is the economic buyer, champion, decision-maker, and "procurement department" all in one person, spending low-to-mid monthly on a self-serve subscription. That single fact disqualifies most enterprise methodology. Here's the verdict on each:

| Framework | Type | Evidence | Fit | Take this / leave that |
|---|---|---|---|---|
| **SPIN** (Rackham, Huthwaite) | Discovery questions | **Strong** - built on ~35,000 calls over 12 yrs | **HIGH** | Take **P-I-N**; minimize Situation |
| **Sandler** (David Sandler) | Full system | Moderate (practitioner-reported) | **HIGH (2 parts only)** | Take **Up-Front Contract + Pain Funnel**; skip the 7-step "Submarine" |
| **Challenger** (Dixon & Adamson, CEB/Gartner) | Engagement model | **Strong** but for *complex* deals | **PARTIAL** | Take **Teach**; drop **Take Control** |
| **Consultative / Solution** (Bosworth) | Philosophy | Moderate | HIGH as mindset | Diagnose before you prescribe - but operationalize it with SPIN/Sandler |
| **MEDDIC / MEDDPICC** (Napoli & Dunkel, PTC) | Qualification checklist | Strong, but in the **>$100K** niche | **LOW** | Take only **Metrics + Identify Pain**; **do not adopt MEDDPICC** |
| **BANT** (IBM) / **GPCT** (HubSpot) | Qualification | Moderate | **HIGH (as a 60-sec sniff test)** | **BANT-lite opened in GPCT order** |

**Why SPIN is the backbone (strong evidence).** Rackham's Huthwaite research - the most empirically grounded item on this list - found top performers ask roughly **4× more Implication questions** than average reps, spend **<15% of the call on Situation** questions, and **>50% on Implication + Need-payoff**. The magic is *buyer self-discovery*: the owner talks *themselves* into the problem, which is far stronger than being pitched and never requires them to understand your software - only their own pain. The single highest-ROI skill on this entire list is the **Implication** move (quantify and expand the cost of the pain).

**Why Sandler's Up-Front Contract earns its place (moderate evidence, high leverage).** For a founder who can't afford to chase ghosts, opening every call with a mutually-agreed agenda + a stated decision point ("at the end you'll tell me yes, no, or what's missing - all three are fine") kills the "let me think about it" stall *before* it forms. The Pain Funnel deepens pain from **surface symptom → business impact → personal consequence** - and "personal consequence" (lost evenings, stress, missing your kid's game to re-price a job) is what actually moves a one-person shop, not ROI math.

**Why Challenger is partial.** "Teach" is gold *as positioning* - owners genuinely don't know what slow quoting and lost jobs cost them, and reframing that is your wedge. But Challenger's edge is documented to be **weakest in transactional/simple sales** (its own ~6,000-rep study), and "Take Control / push them out of their comfort zone" reads as aggressive to a nervous, software-anxious shopkeeper. Soften it to **confident guidance** - you're the calm expert who's set up 50 shops, not the rep pushing back.

**Why MEDDIC/MEDDPICC is mostly wrong here.** It's a deal-inspection checklist for enterprise: ~**73% of SaaS firms selling >$100K ARR** use a version, and the practitioner rule of thumb is **MEDDPICC only for >$100K deals, 6+ stakeholders, formal procurement.** "Paper process," "decision committee," and "champion-building" don't exist in your one-person, self-serve deal. Adopting it will cost you speed and gain you nothing. Borrow exactly two letters - **M**etrics (quantify their pain in dollars/hours) and **I**dentify Pain - and discard the rest.

### 2.2 The discovery question bank (print-shop specific, SPIN order)

Target a **30/70 talk ratio - you talk 30%.** Pull Situation facts from signup/trial data instead of asking, so you spend the call where it pays: Implication and Need-payoff. React to answers; don't interrogate. **Aim to have a quantified pain number ($/yr or hrs/wk in *their* figures) by the ~10-minute mark** - if you don't, you're spending too long on Situation/Problem.

**SITUATION - keep to <15% of the call (2–3 max):**
- "Walk me through what happens from the moment a customer asks for a quote to the day the job ships."
- "How are you taking orders today - phone, email, walk-in, a form?"
- "Who in the shop touches a job - you, a designer, the press operator?"

**PROBLEM - surface the print-shop hot buttons:**
- "When a quote request comes in, how long until you get a price back to them?"
- "How often does a job slip through - an email gets buried, a deadline missed?"
- "What happens when you're at the press or out of the shop and a quote request lands?"
- "Can customers reorder or place an order themselves online today, or does everything route through you?"
- "How do you track who owes you what - is billing ever the thing that falls through?"

**IMPLICATION - the highest-ROI move; quantify and expand (ask 3–4×):**
- "If a quote takes you a day and a competitor answers in an hour - how many of those do you lose a month?"
- "When a deadline slips, what does that cost - the reprint, the refund, or the customer never coming back?"
- "You said you spend evenings re-pricing jobs - how many hours a week, and what would you rather do with them?"
- "If one missed $500 job a month is normal, that's ~$6,000 a year walking out the door - sound about right?" *(Anchor on their stated job sizes, not this number - let them confirm or correct the figure so it's theirs.)*

**NEED-PAYOFF - let *them* say the value out loud:**
- "If customers could place and reprint orders online without you touching it, what would that free you up to do?"
- "If every quote went out in two minutes instead of a day, what would that do to your win rate?"
- "What would it be worth to never again wonder whether a job got lost?"

### 2.3 Objection handling: LAER + a ready-to-use table

**Primary framework: LAER** (Jack Carew / Carew International, 1976): **L**isten → **A**cknowledge → **E**xplore → **R**espond. The killer step is **Explore** - diagnose the *real* objection before you answer. One process beats 20 memorized rebuttals.

**Secondary tool: Feel-Felt-Found** - "I understand how you *feel*; other shop owners *felt* the same; what they *found* was…" Reserve it for *emotional* objections (the "I'm not techie" anxiety), and only *after* LAER's Explore, because on its own it skips diagnosis. (Used too often it sounds like a script - once per call, max.)

**The benchmark that should change your reflex:** practitioner data suggests only a minority of "it's too expensive" objections are actually about budget - most mask value, risk, or priority concerns. (Often cited as ~77% non-price; treat it as directional, not gospel.) So **always Explore before you discount.** Best probe: *"When you say too expensive - compared to what? Your budget, another tool, or the return you're expecting?"*

| Objection | What it usually *really* means | LAER response (Explore → Respond) |
|---|---|---|
| **"It's too expensive."** | Value unclear (most of the time) | "Compared to what?" Then reframe against the failure mode: "Lose one $500 quote a month to slow turnaround and that's $6K/yr. The plan is $X/mo - it pays for itself on the first saved job." |
| **"I already use [X] / spreadsheets / pen & paper."** | Inertia; the spreadsheet *technically* works | **Don't list features** - spreadsheets fake any feature list. Demo the *workflow*: "Show me how a reprint happens today," then show the same flow self-serve in 30 sec. Price against the spreadsheet's failure mode: missed orders, no online ordering, double entry. |
| **"It's too complicated - I'm not techie."** | Software anxiety - the #1 blocker for this buyer | Acknowledge sincerely, then **shrink the ask**: "You won't set anything up - I'll build your store *with* you on this call. If you can use email, you can use this." Show the demo store, not the settings panel. Feel-Felt-Found fits here. |
| **"I don't have time to switch."** | Fear of disruption + migration pain | "You keep running exactly as you do today - nothing breaks. We turn on online ordering for one product first; the rest waits." Offer to do setup *for* them; quantify time *saved* per week. |
| **"Will my customers actually use it?"** | Risk of wasted effort | Point to the demo store + first-order-in-7-days proof; offer to seed it with their top 3 repeat products. "You're not betting the shop - turn it on for one product and watch." |
| **"What about my data / is it secure?"** | Trust, not a real audit | Plain language, no jargon: "Your store and customer list are yours, isolated from every other shop, backed up, exportable any time." Don't over-engineer it. |
| **"Let me think about it."** | An un-surfaced objection | This is what the **Up-Front Contract prevents.** If it surfaces anyway: "Totally fair - what specifically would you want to be sure of before deciding?" Then Explore the real blocker. Set a concrete next step before you hang up (calendar a 10-min follow-up), never "I'll check back sometime." |

### 2.4 The economics that force this design (and the activity benchmarks)

This is the math that says you cannot staff a sales floor - your discovery is a *founder-led assist on top of a product-led trial*, full stop.

- **Minimum ACV to justify a salesperson ≈ (fully-loaded rep cost) ÷ (deals/yr)** (Tunguz / SaaS rule of thumb). A $100K rep closing 100 deals/yr ⇒ **$1,000 minimum ACV before any marketing/admin overhead.** At a ~$500 ACV a rep would need to close **~1,000 customers/yr - ~4.2 every working day.** Impossible by hand. **Verdict: self-serve / product-led with founder-led *assist*, not a staffed SDR motion.** (Even with PLG efficiency, sub-$1K ACV almost never supports dedicated reps - a frequently-cited inflection is that human-touch sales starts paying off somewhere around **$1–2K+ ACV**, and dedicated AEs around **$5K+**.)
- **Small-team activity benchmarks (when the founder is actively selling, *as planning ranges, not targets to hit*):** ~**5–10 discovery calls/week** off ~**20–40 outreach touches/week**; expect ~**40–60% genuine fit**, ~**50–70% of qualified → trial**, ~**30–50% of trials → paid.** Use these to *size pipeline*, not to justify a hire. Track your *own* real numbers within two weeks and replace these - every market's are different.
- **Talk ratio 30/70**, and *give value inside the call* (a quick win, an insight, the half-built store) - or it reads as extractive. The single best "value given" for this buyer is leaving the call with their store partially set up.

### How this applies to Print-Flow-360

**The recommended stack (do these in this order on every assist call):**

1. **Qualify with a 60-second GPCT-ordered, BANT-lite sniff test.** Lead warm and buyer-first (Goals/Challenges), confirm Timeline + rough Budget lightly *before* you invest a hands-on demo. This is a *quick gut-check*, not a gate - at this price you're filtering for "is this a real print shop with a real workflow problem," not running a qualification gauntlet. **Skip MEDDIC/MEDDPICC entirely** - there's no committee, no paper process, no champion to build. The owner is all of them.
2. **Open every call with the Sandler Up-Front Contract.** Verbatim starter: *"This'll take 20 minutes. I'll learn how your shop runs, show you exactly how it'd work for you, and at the end you tell me yes, no, or what's missing - any of those is a fine answer."* This single habit is your highest-leverage tactic as a founder who can't afford to chase ghosts.
3. **Discover with SPIN, weighted to Problem → Implication → Need-payoff.** Minimize Situation questions - **pull facts from signup/trial data, not from the buyer.** Spend the call quantifying lost-order/slow-quote cost in *their* numbers (the Implication move), and reach a confirmed pain figure by ~minute 10. Hold a 30/70 talk ratio.
4. **Position with Challenger's "Teach," softened to confident guidance.** Most owners have never added up what slow quoting and lost jobs cost them - reframing that with their own figures is your wedge. **Never use "Take Control"** on a nervous, non-technical buyer; it triggers software-anxiety and backfires. You're the calm expert who's done this 50 times, not the rep pushing back.
5. **Handle objections with LAER - Explore before you Respond.** Most price objections aren't really about price, so probe "compared to what?" before you ever discount. Reserve **Feel-Felt-Found** for the one objection it's tailor-made for: *"I'm not techie."*
6. **Don't "close" - drop them into a guided, seeded trial** toward store-live-in-7-days, with a concrete next step booked before they hang up. The product is the closer; discovery's only job is to confirm the pain is real, clear 2–3 objections, and hand off into the trial.

**The two product-specific moves that matter most for this buyer:**

- **"I'll set it up *with* you on this call" is your single most powerful objection-killer.** Software anxiety is fear of *configuration*, not usage. This maps directly to your existing North Star (store live + first order in 7 days) and ≤5-step go-live checklist - so use the **demo store as the proof artifact during discovery, not after**, and ideally get *their* store half-built on the call. Offer to seed the trial with their top 3 repeat products so the very first reorder is frictionless.
- **Sell the outcome, never the software.** They will never care about "multi-tenant storefront + pricing engine." They care that *quotes go out instantly, orders stop getting lost, customers reorder without calling me, and I get my evenings back.* Every question and every objection response stays in *their* language - jobs, quotes, deadlines, repeat customers, the press - never yours.

**One-line operating principle:** the best founder-led sales here isn't selling - it's being genuinely useful in 20 minutes, half-building their store on the call, then letting the seeded trial do the closing.

**Build this as a one-page call card** (Up-Front Contract script → 3 Situation prompts → 5 Problem prompts → 4 Implication prompts → 3 Need-payoff prompts → the 7-row objection table), keep your own funnel ratios in a sheet next to it, and you've operationalized the entire motion for a small team.

---

## 3. Pipeline / CRM Hygiene & Forecasting

> Scope: the sales & revenue *motion* after a lead or trial exists. This assumes the prior decisions hold - no-card 14-day trial, North Star = *store live + first order in 7 days*, founder-led primary acquisition. The job here is to make that motion legible and forecastable **without** building a sales org you don't have. The single biggest mistake a founder-led PLG company makes is importing an enterprise pipeline model onto a self-serve, low-ACV business. We won't do that - and at this stage you should be able to run the entire operation in one spreadsheet tab plus a free CRM, in under an hour a week.

### 3.1 First principle: you don't have a sales pipeline - you have a trial-conversion pipeline

Most of your revenue is self-serve. So your CRM's #1 job is **not** managing a long deal funnel - it's tracking trials and the *handful* of founder-led deals (multi-location shops, high-volume accounts). Forecast these as **two separate stacks, summed** (detailed in §3.5). Forcing signups into deal stages - giving a self-serve trial a "Negotiation" stage - is the classic PLG forecasting error.

**Reality check for your stage:** if you're doing <$20K MRR and <5 founder-led deals a month, you do not yet have enough closed assisted deals to compute a credible stage-weighted forecast. Until you have ~20+ closed assisted deals, **Stack B is a manual judgment call, deal-by-deal** (see §3.5), and your "forecast" is really just *Stack A run-rate + a hand-counted list of named deals you believe will close this month.* Don't pretend to more rigor than your sample size supports.

### 3.2 Stage design - a stage is a *buyer action*, not a seller activity

The most-cited fix across the literature: **stages must describe what the buyer has done, not what you did.** "Demo sent" / "Proposal sent" happen regardless of buyer interest. "Buyer confirmed the use case" / "Buyer asked for pricing" are real commitments. Buyer-aligned stages are broadly reported to correlate with higher win rates (directional/anecdotal - treat as a *reason*, not a number to bank).

**A defensible stage has four parts:**

1. **Past-tense name** - a completed buyer *state* ("Problem Confirmed", not "Discovery").
2. **Entry condition** - what qualifies a deal to enter.
3. **2–4 objective exit criteria** - verifiable buyer actions, never "felt good about it".
4. **A forecast category** - Pipeline / Best Case / Commit.

**Sweet spot: 5–7 stages.** Fewer than 5 hides risk; more than 7 is admin overhead a tiny team won't sustain.

For Print-Flow-360 the "stages" should map to your **North Star milestones**, which a non-technical shop owner generates simply by *using the product* - no rep data entry required. Critically, **these are product-instrumented events, not CRM fields someone updates by hand** - the moment they require a human to type, a solo founder will stop doing it:

| Stage (past-tense buyer state) | Exit criterion (product-emitted event) | Forecast category |
|---|---|---|
| Trial Started | Account created | Pipeline |
| Store Set Up | First product published | Pipeline |
| Store Live | Store is publicly reachable | Best Case |
| First Order Placed | A real order ran end-to-end | Commit |
| Subscribed (Paid) | Trial converted to paid | Won |
| Stalled / At Risk | No product activity by day 3 | (triggers outreach) |

A trial that hits **store live + first order in 7 days** is your activation gate *and* your strongest leading indicator - treat it as ~Commit-grade. Note the asymmetry: a shop owner who has *taken a real order* through your platform has switched their actual business onto you, which is a far stronger signal than any enterprise "verbal commit." Let the *product* set the stage, not a rep's mood.

### 3.3 CRM hygiene - the rules that actually move the number

Hygiene fails not because of the tool but because discipline lapses ("when training stops, reps revert"). For a solo/duo team, **most enterprise hygiene advice is overhead you should ignore.** Enforce only these four:

- **Two-field lost-reason capture, ≥90% coverage.** Replace free text with a **dropdown**. For Print-Flow-360: `No time to set up · Price · Missing feature · Went with competitor · Just browsing · Switched back to manual/paper`. This is your product roadmap *and* your win-back list - it's the single highest-value field you'll capture. Aim for ≥90% coverage (95% is an enterprise luxury; don't let the last 5% cost you an hour). Backfill weekly while volume is low.
- **The stalled view (the single highest-ROI automation).** For your PLG slice this is **"trial with no store setup OR no first order by day 3"** → your personal nudge list. (Day 3, not day 5 - in a 14-day trial, a buyer who hasn't touched the product by day 3 is almost certainly gone; you have ~10 days of runway and the first 72 hours decide it.) For the handful of assisted deals, recut as `Open AND last activity > 7 days`.
- **Close-date discipline (assisted deals only).** Every assisted-deal close date links to a real buyer event (trial end, their stated decision date) - never a round-number guess. Add a **Push Counter** that increments on each slip; **2 pushes with no new buyer evidence → mark it lost.** (2, not 3 - at <5 deals/month a deal that's slipped twice is dead weight inflating your judgment.) Self-serve trials don't get a close date; they get a trial-end date the product already knows.
- **No happy ears - but only once you have data.** This only works after ~20+ closed assisted deals. Until then, *assume your assisted forecast is optimistic and discount it by feel.* Once you have history, check optimism against your *own* stage→close rates: if Stage-3 deals historically close 35% but you're forecasting 60%, you're the one who's wrong.

**Hygiene cadence:** Weekly - stalled view + lost-reason backfill (5 min). Monthly - dedupe + stage-definition sanity. That's it. Skip the quarterly "field audit" theater until you have a second salesperson.

### 3.4 CRM pick - start on HubSpot Free; switch to Attio only if you're technical

Opinionated recommendation, not a survey:

- **Default: HubSpot Free.** Contacts, deals, email tracking, meeting scheduler, tasks at **$0**. Since the majority of revenue is self-serve, the CRM only needs to track the *minority* assisted deals + post-trial nudges - a kanban + email + tasks is plenty. Scales to a second seat with no migration. **Watch the upsell trap:** HubSpot's paid tiers jump to ~$15–20/seat/mo (Starter) and then to several hundred/mo, and automation/reporting you'll be tempted by is gated. Stay on Free until a *specific* limit blocks revenue - not before.
- **A spreadsheet is a legitimate v0.** If you have <30 active trials and <5 assisted deals, a single Google Sheet (one row per trial, columns = the seven fields in §3.7) genuinely outperforms a half-configured CRM. Move to HubSpot when manual entry becomes the bottleneck, not on principle.
- **Switch to Attio only if the founder is technical** and will actually wire product-usage signals (`store live`, `first order`, weekly order count) from the multi-tenant app to flag **product-qualified accounts**. Attio's free tier covers a solo founder; its custom data model is the cleanest way to surface "which trial should I personally call today" - the single highest-leverage move in a founder-led motion. But unwired, it's just a prettier HubSpot - don't pay for it for the logo.
- **Skip folk** (won't scale past contact capture) and **skip Pipedrive** (a sales-led tool priced per seat for a motion you don't run).

(The reasoning - match tool to motion, and don't pay before a limit bites - holds regardless of which comparison source you read.)

### 3.5 Forecasting - the hybrid, as two stacks summed

This is the core recommendation. **Do not** run one pipeline. Run two models and add them:

**Stack A - Self-serve (70–90% of the number): run-rate + cohort.**
- Base = trailing-3-month new-MRR run-rate, **+ expansion − cohort-projected churn.** (Skip a "seasonality factor" until you have 12+ months of data - at <1 year you're inventing precision.)
- Decompose MRR into New + Expansion − Churn so you see which lever drives growth.
- **The "rebase" rule (the most credible quant method here):** measure cohort retention against **month 3, not month 0**. By month 3 the trial "tourists" have churned; the M3 curve reflects real committed users. Forecast steady-state off M3, never the inflated M0 curve. *Caveat:* you need ~6 months of cohorts before this is meaningful - before that, just track raw logo + dollar retention and don't over-model.
- **Leading indicators lead revenue by ~1–3 months:** activation rate, time-to-value, PQL conversion. For you these *are* the North Star - if "store live / first order in 7d" dips this month, new MRR dips next month *regardless of signup count*. This is your real forecast; watch it like a hawk.
- **NRR target:** elite multi-product PLG runs 120–140%, but that assumes per-account expansion headroom you don't have at low ACV with a near-flat price. **Treat 95–105% as realistic** for a single-plan SMB tool - net-negative-churn is a *later* goal that requires seat/usage expansion or tiers you haven't built. Don't anchor on 120%.

**Stack B - Sales-assisted overlay (the handful of founder deals).**
- **With <20 closed assisted deals: forecast by hand, deal by deal.** List each named deal, write the dollar amount and the specific buyer evidence ("signed for 3 locations, awaiting their IT sign-off, verbal yes"), and bucket each as **Commit** (you'd bet on it) or **Best Case** (could go either way). Sum only Commit for your low number, Commit + Best Case for your high. That's an honest forecast at small N.
- **Once you have ~20+ closed deals:** switch to stage-weighting - multiply each deal by the **historical close rate of its current stage** (*your own measured rate, not a benchmark*). Keep forecast categories strictly separate by evidence: **Pipeline** ~10–25% · **Best Case** ~30–50% · **Commit** ~90% *with a documented close plan and buyer evidence*.

**Forecast = Stack A + Stack B.** That's it.

### 3.6 Benchmarks (SMB-realistic - directional, not gospel)

- **Coverage ratio:** Coverage needed = 1 ÷ win rate; high-velocity SMB typically runs **2.5–3x weighted coverage**. But for you this barely matters - with <10 assisted deals in flight, coverage math is noise. Your real "coverage" is *trial volume × activation rate.* Watch that instead.
- **Win rate (assisted SMB, <$10K ACV): plan for ~30%**, with 40%+ being good and 45%+ elite. Below ~25%, your targeting or qualification is off.
- **Sales cycle (low ACV):** your *assisted* deals should close in **2–4 weeks**; self-serve has effectively no cycle (it's the 14-day trial clock). If an assisted deal runs past 6 weeks, it's stalling - apply the Push Counter.
- **Trial-to-paid (feeds Stack A) - your most important number:** sub-$5K ACV, **opt-in/no-card trials convert at ~15–25%** (vs. opt-out/card-required at ~40–50%+). This is the deliberate trade in your no-card 14-day choice: you sacrifice conversion *rate* for top-of-funnel *volume* - correct for a high-volume/low-ACV strategy, but it means **you must drive signup volume hard, because ~3 of every 4 trials won't pay.** Model Stack A at the low end (~15–18%) until your own data proves better.
- **Activation → paid linkage:** trials that hit your North Star (store live + first order in 7 days) should convert at *multiples* of the blended rate. The gap between activated and non-activated trial conversion is the single most actionable number you'll have - measure it from day one.
- **Use your own numbers as soon as you have them.** Cross-segment benchmarks vary too much to use as forecast *inputs*; they're sanity checks, not plug-ins.

### 3.7 Minimum-viable tracking + cadence

**Track exactly these seven fields per trial/deal - no more:**
1. Stage (product-event defined) · 2. MRR/amount · 3. Trial-end or close date (+ Push Counter on assisted) · 4. Last product activity (drives stalled view) · 5. Forecast category · 6. Lost reason (dropdown) · 7. Source (which channel fed it).

**One 30-minute Friday review** (consistent time, consistent agenda, at-risk first, end with written next actions). For you, in priority order:
1. **Stalled-trial list** - trials with no setup/first order by day 3: who do I personally nudge *today*?
2. **PQL list** - trials that hit store-live + first-order: who do I personally help convert/expand?
3. **Assisted deals** - anything slipped twice → mark lost.
4. **Run-rate check** - this month's new-MRR pace vs. last; and *did activation dip?* (your early-warning light).

**Monthly:** recut the cohort curve (once you have ≥6 cohorts) + lost-reason backfill. That is the *entire* forecasting operation a founder-led team needs - resist building heavier.

### How this applies to Print-Flow-360

Prioritized, concrete, do-this-now:

1. **Build a trial-conversion pipeline, not a sales pipeline.** Use the six product-event stages in §3.2 (`Trial Started → Store Set Up → Store Live → First Order Placed → Subscribed`, plus `Stalled/At Risk`). Stages advance when the *shop owner acts in the product*, not when a rep updates a field - so a non-technical buyer and a time-poor founder both generate clean data for free. **The print-shop buyer will never log into your CRM and never reply to a "where are you in your decision?" email - only their product actions tell you the truth.**

2. **Forecast as two stacks (§3.5), honest to your sample size.** Self-serve = trailing-3-month new-MRR run-rate + expansion − cohort churn (this is 70–90% of your number); model conversion at **~15–18%** until your data says otherwise. Assisted = with <20 closed deals, **hand-list named deals** (don't fake stage-weighting); switch to weighting later. Never cram signups into deal stages. Target NRR **95–105%**, not 120%+.

3. **CRM: a Google Sheet or HubSpot Free today.** Sheet if <30 trials/<5 deals; HubSpot Free the moment manual entry hurts. $0 either way. **Move to Attio only if you're technical** *and will actually pipe* `store live` / `first order` / weekly-order signals from the app - that's the highest-leverage move in a founder-led motion: let the product tell you which trial to call. Skip folk and Pipedrive. Don't pay any tier until a specific limit blocks revenue.

4. **Ship two automations before anything else - they *are* your sales process.** (a) **Stalled-trial alert** - trials with no store setup / no first order **by day 3** → your personal nudge. (b) **PQL alert** - trials that hit store-live + first-order → your call-to-convert list. Both should fire off product events you already emit in the multi-tenant app; if they require manual tagging, they won't run.

5. **Enforce three cheap-now / painful-later habits.** (a) **Lost-reason dropdown** (`No time to set up · Price · Missing feature · Went with competitor · Just browsing · Switched back to manual/paper`) at **≥90% coverage** - your roadmap + win-back list. (b) **Trial-end = the trial-end date** for self-serve; a **real-event close date + Push Counter (2 strikes → lost)** for assisted. (c) Defer the **no-happy-ears stage-rate check** until you have ~20+ closed assisted deals; until then, knowingly discount your assisted forecast.

6. **Watch activation as your real forecast, not signups.** "Store live + first order in 7 days" leads MRR by 1–3 months. If it dips this month, brace for lower new MRR next month - and fix onboarding *now*, in the trial's first 72 hours, while you still can. Track activated-vs-non-activated conversion as your single most actionable metric.

7. **Cadence: one 30-minute Friday review** (stalled trials → PQLs → assisted deals → run-rate + activation check) + a monthly cohort recut once you have ≥6 cohorts. Resist anything heavier; the engine is self-serve volume, and your scarcest resource is founder time.

---

## 4. Trials & POCs - Structuring Trials That Convert

This section is about the *revenue motion* once a trial exists - not how leads arrive (acquisition) or how the funnel is shaped (conversion funnel), both covered elsewhere. The short version: the existing internal plan - **no-card, 14-day reverse trial; North Star = store live + first order in 7 days; ≤5-step checklist + demo store** - is the right call, and the external evidence backs every piece of it. The job here is to sharpen it on three points a founder can act on this quarter:

1. **The activation window is days 1–3, not the 7-day deadline.** That's where 60–75% of the conversion outcome is decided.
2. **One lightweight human touchpoint is the single highest-ROI lever** a small team has - but only when fired on signal, not for everyone.
3. **For the occasional bigger shop, run a time-boxed "first-job pilot" with written success criteria** - never an open-ended POC.

> **Reality check for a 1–3 person, sub-$100/mo-ACV team:** ignore anything that assumes a sales team, a CS org, or a buyer who reads docs. Our buyer is a print-shop owner running the counter while the trial clock ticks. Default to automation; spend the founder's scarce hours only where a signal says it'll pay back. Every benchmark below is directional - treat as a starting prior to A/B against your own cohort, not gospel.

### 4.1 The trial model - why reverse trial, no card, 14 days

There are five trial archetypes, and their *ordering* by conversion is consistent across GrowthSpree's 2026 B2B compilation, Userpilot, and First Page Sage (treat the exact percentages as directional - these are aggregated blog datasets, not one audited source):

| Model | Trial→paid (median) | What it is |
|---|---|---|
| Freemium | ~4.5% | Permanent free, feature-capped; upgrade when capped |
| Opt-in free trial (no card) | ~14% | Time-boxed full access, no card, reverts to nothing |
| **Reverse trial** | **~24%** | Full access on signup → **downgrades to free tier** at trial end |
| Opt-out free trial (card up front) | ~44% | Card required, auto-charges unless cancelled |
| Sales-assisted hybrid | ~55% | A human helps the trial along |

The two facts that matter for us:

- **Opt-out (card) converts ~3–4× opt-in** - but only because "friction-to-cancel exceeds friction-to-convert." Its headline rate counts forgot-to-cancel revenue and suppresses signups at the top. **The card is a quality filter, not a magic lever** - and for a buyer pool this small, throttling top-of-funnel is the wrong trade.
- **For a non-technical, low-ACV SMB buyer, opt-in (no card) wins on total paying customers and on trust.** Our buyer is a time-poor print-shop owner who has been burned by "free trials that secretly charge." Asking for a card before they've seen *their own storefront live* is the single biggest trust-killer at the top of this funnel. At low ACV the math is simple: more trials beat a higher per-trial rate, and forgot-to-cancel revenue churns hard and generates the chargebacks/refund tickets a tiny team can't afford.

**The reverse trial** (Kyle Poyar, OpenView / *Growth Unhinged* - "Your guide to reverse trials"; canonical examples Airtable, Notion, Canva, Loom, HubSpot) gives the full paid product immediately, then **downgrades to a permanent free tier** instead of cutting the user off. It front-loads the "aha" while the owner is fresh and motivated, but removes the cliff-edge loss aversion at the end - they don't lose everything, so they don't churn in anger, they stay reachable and can convert later. Poyar's oft-cited figure (1,000+ products): **~10 paying conversions per 1,000 visitors for reverse trials vs ~5 for free trial and ~4 for freemium.** Evidence strength: medium - widely repeated but single-author dataset.

**The catch - and it's a real product decision:** a reverse trial needs a *viable free tier to downgrade into*. Without one, you've just built a plain free trial. (See §4.6.)

**On length:** shorter generally wins - 7–14-day trials with urgency cues outperform 30-day by up to ~71% (RevenueCat/Userpilot), and most conversions happen in week one *regardless* of trial length. But length must exceed time-to-value. GrowthSpree's by-model optimum puts **opt-in at 14 days**. **Keep 14, do not extend to 30** - 30 days breeds procrastination, lowers urgency, and doesn't raise conversion. The lever isn't length; it's compressing time-to-value into days 1–3.

### 4.2 Activation beats everything - and it happens in days 1–3

This is the most important finding in the section. **Activation, not trial length, drives conversion.** Per GrowthSpree's synthesis, activation explains **60–75% of trial-conversion variation**: activated trials convert at 35–65%, un-activated at 2–8% - roughly a **5–10× swing**. Everything else in this doc is downstream of getting the shop owner to their milestone.

And activation is a **first-72-hours phenomenon**:

- **Intercom:** 40–60% of signups never return after day one. The window to create value is brutally short.
- **Baremetrics:** users who complete key setup within 3 days are 3–4× more likely to convert.
- **Appcues** (2026 study, 2.1M trial users): a Day-1 success checklist (≥3 core activations in 24h) converted **52.7% vs 40.4% baseline.**
- **GrowthSpree:** un-activated trials in days 1–3 rarely activate later. The purchase decision comes later, but the *capacity* to convert is set in the first 72 hours.

(Vocabulary, all well-sourced: **Time to Value / TTV** = login → activation milestone; **aha moment** = first experience of core value, à la Facebook's "7 friends in 10 days," Dropbox's "1 file in 1 folder on 1 device"; **activation rate** median 35–45%, top quartile 55%+.)

#### The laddered activation model for web-to-print

The internal North Star ("store live + first order in 7 days") is well-formed but should be instrumented as a ladder so you can intervene at each rung:

| Rung | Milestone | What it proves | Target |
|---|---|---|---|
| 0. Signup | Account created | Intent | Day 0 |
| 1. Setup aha | Store published + 1 product live (logo + SKU + price) | "I have a real storefront" | **Day 1** |
| 2. **Value aha** | **First test order end-to-end** (design → cart → checkout → print job appears) | "The whole machine works for *my* shop" | **Days 1–3** |
| 3. North Star | First *real* customer order (or share/invite a customer) | "This makes me money" | **Day 7** |

**Make Rung 2 - first test order - the instrumented "aha" you optimize TTV against.** It's the moment the value loop closes for a non-technical owner, and it's achievable in the first session. Rung 3 (real order) is the number you *report* on, but it partly depends on the owner's own customers, so don't make it the only activation gate. **The last step of the go-live checklist must be "place a test order," not "fill in tax settings."**

**Minimum instrumentation (build this, it's cheap):** fire one analytics event per rung (`store_published`, `product_live`, `test_order_placed`, `real_order_placed`) plus `returned_day_n`. That's the entire data layer §4.3–4.5 needs - four events drive every trigger, email, and PQL signal below. Don't build a full analytics stack first; you need these five events and a daily list of "who hit Rung 1 but not Rung 2."

### 4.3 Conversion tactics, ranked by ROI-per-founder-hour

For a founder-led team, sequencing matters more than completeness. Ranked - and **for a 1–3 person team, realistically do #1–#3 this quarter and treat #4–#6 as fast-follows**, not a parallel build:

1. **One human touchpoint - highest ROI by far.** A single 20-min onboarding call / Loom walkthrough / founder DM consistently lifts trial conversion **6–12 percentage points** (PartnerStack/Storylane; strong, repeated). Don't do it for everyone - fire it on signal (§4.4). Budget rule of thumb: ~15 min/PQL; if PQLs exceed ~2/day, switch the call to an async Loom + Calendly link so it doesn't eat the build week.
2. **Day-1 onboarding checklist, ≤5 steps, quick-win first.** Checklists + progress bars lift completion 20–30% (Userpilot/Userflow; strong); broader activation lift 30–75% (context-dependent; medium). **Caveat that's CLAUDE.md-aligned: a completed checklist that doesn't reach real value still churns.** Tie each step to value, end on the test order.
3. **Behavior-triggered milestone emails, not calendar drips** (Correlated, ProductLed). Trigger on the five events from §4.2 - published store, added product, no product after 24h - not on the clock. Sequence in §4.5.
4. **In-app guidance + a pre-populated demo/seed store.** Lets a non-technical owner *see the finished thing* before building. Directly cuts TTV; the internal demo-store idea is exactly right. Cheapest high-impact item here - seed the demo store once and every trial benefits.
5. **Honest trial-end urgency.** "Your trial ends tomorrow - here's exactly what happens to your store" beats manufactured scarcity (Baremetrics, FluentCRM). **Most common mistake: starting the expiry sequence too late** - start 3–4 days out, not on the last day.
6. **Trial extensions only as a save, never a default.** A large randomized field experiment (Frontiers in Psychology, 2025) found extensions raised adoption +11% but *delayed* conversion +42% with **no effect on immediate conversion** - they shift timing and risk cannibalization. Offer an extension *only inside the cancel/expiry flow*, equal to the original length.

### 4.4 PQLs and low-touch sales-assist - the motion for a small team

A **Product-Qualified Lead (PQL)** is a trial user who has *experienced value* and shows buying-readiness behavior. PQLs convert **5–10× better than MQLs** (Refiner, Dock, Appcues - strong consensus). **For a founder, the PQL list is your only sales prospect list.** Don't chase cold signups; chase activated ones.

Adopt **"low-touch with option to escalate"** (PartnerStack/Storylane): self-serve by default, a human reaches in *only* when a behavioral signal fires. Best CAC-to-conversion ratio for sub-$200K-MRR teams. Two phases (ProductLed/Appcues): automation handles the 80% (in-app onboarding, triggered emails, Loom, docs); human touch is reserved for PQLs. **For us, "the PQL list" is one daily filtered view in your analytics/CRM - not a tool to buy.** If you don't have a CRM yet, it's a spreadsheet the five events write to.

**Concrete PQL triggers for Print-Flow-360** - reach out personally when a trial hits any of:

- [ ] Published store **+ placed a test order** but hasn't invited a customer → *they're convinced; nudge to go live.*
- [ ] Added **3+ products or set up pricing rules** → *real catalog, high intent.*
- [ ] **Returned 3+ days in a row** or invited a team member → *active small team, higher value.*
- [ ] **Started payment-gateway/checkout setup but didn't finish** → *blocked; a 10-min Loom unblocks.*

The touch is cheap and personal - a 60-sec Loom beats a scheduled call for this buyer (a print-shop owner won't book a calendar slot for a $X/mo tool, but will watch a 60-sec video addressed to them by name):

> **PQL Loom script (≤60s):** "Hey [name] - I saw you got your storefront built and ran a test order, that's the hard part done. The one thing left is taking your first *real* order - want me to show you the 2-minute way to share your store link / set up checkout? Happy to hop on for 10 minutes, or just reply here."

That's the 6–12pt lever from §4.3, applied surgically to the 20% who'll pay back the hour.

### 4.5 Ready-to-ship email sequence (no-card 14-day reverse trial)

Rule of thumb: 14-day trial → **5–7 emails, each tied to a milestone, not just a date** (FluentCRM/Sequenzy). Behavioral triggers override the calendar baseline.

| When | Trigger | Goal / subject line |
|---|---|---|
| Day 0 | Signup | "Your store is ready - let's get your first product live (2 mins)." → deep-link to the ≤5-step checklist. |
| Day 1 | **If no product published** | "Most shops have a live storefront in under 10 minutes - here's a 90-sec walkthrough." (Loom) |
| Day 2–3 | **If store live, no test order** | "Place a test order - see exactly what your customer sees." *(Aha-completing email - highest priority.)* |
| Day 3 | **If activated (test order placed) → PQL** | *Personal* founder Loom/DM, not a broadcast: "Want me to help you take your first *real* order?" |
| Day 7 | Mid-trial | "You're halfway - here's what other print shops do next." (invite a customer / share link / custom domain) |
| Day 11 | Pre-expiry | "Your trial ends in 3 days - here's exactly what happens to your live store." (Explain the **downgrade**, not a shutdown.) |
| Day 13 | Final | "Tomorrow your store moves to the free plan - keep [paid features] for $X." (Extension offer in the cancel flow only.) |
| Day 14+ | Downgraded to free | Reverse-trial advantage: they're still a user. Re-trigger on next high-intent event (real order on free tier → "ready to unlock X?"). |

Principles: **honest urgency** (state facts), **start expiry 3 days out**, **behavioral over calendar**, **every email points at the next milestone**. The Day-3 PQL email is the one that must be personal. Plain-text, from the founder's address, reply-to a monitored inbox - for this buyer that out-converts a branded HTML template every time.

### 4.6 The free tier you downgrade into (the prerequisite)

A reverse trial is only as good as the floor beneath it. Define a **capped-but-alive** plan before you ship the model - downgrade must mean *keep your store, lose some power*, never *shutdown*:

- Store stays **live and reachable** (this is what keeps churned trials convertible).
- Capped at e.g. **3 products**, no custom domain, **"Powered by Print-Flow-360"** footer badge.
- Paid features (more products, custom domain, badge removal, B2B/advanced pricing) become the upgrade trigger - which re-fires the moment a free-tier shop lands a real customer order.

**Cap on cost, not just features:** the free tier must not let a dormant shop run up storage/PDF-render/egress bills. Cap stored designs and monthly orders too, so a forgotten free store costs you near-zero - at low ACV, free-tier infra cost is the thing that quietly breaks unit economics.

This is a product decision, not a marketing one, and it's the **first thing to build** - without it the rest of §4 is a plain free trial.

### 4.7 POCs for the bigger / sales-assisted print shop

Most accounts are pure self-serve, and **for the first ~6 months you can ignore this entire subsection** - your volume is too low and your time too scarce to run pilots. Revisit it only once inbound from multi-location/B2B-heavy shops is real. When it is, the risk is **"POC purgatory"**: the pilot drags, never converts (Recapped/Mark Fershteyn, Dock, Flowla). The fix is structure agreed **up front**:

1. **Written success criteria tied to *their* business outcome**, not "evaluate the software." e.g. *"By day 21, [Shop] has its storefront live, processes ≥5 real customer orders through Print-Flow-360, and confirms the print-job workflow replaces [current tool]."*
2. **Mutual Action Plan (MAP)** - a shared checklist with owners + dates on both sides. Keep it to one page (template below); a heavyweight enterprise MAP is overkill at this ACV.
3. **Time-box hard.** Standard B2B POCs run 30–90 days; **compress to 14–21 days** for SMB economics. Long pilots breed complacency.
4. **Name a champion + a "what if it succeeds" step.** Agree the purchase decision and date *before* kickoff, so success → signature, not success → "let's discuss next quarter."
5. **Never custom-build for a pilot.** At low ACV, bespoke work destroys the unit economics. If the standard product can't win the pilot, walk. (Concrete floor: if a pilot would take more than ~2–3 days of founder time, it's not worth it at this ACV - push them onto the self-serve trial instead.)

**One-page MAP template:**

> **Goal:** [Shop] live on Print-Flow-360 taking real orders by [date].
> **Success =** store published · ≥5 real orders processed · print-job workflow confirmed · pricing matches current quotes.
> **Plan:** Day 1 kickoff (us) → Day 2 store built (them, we assist) → Day 3 first test order (them) → Day 5 go live (them) → Day 14 review orders (both) → **Day 14 decision: subscribe (them).**

### How this applies to Print-Flow-360

The prior internal plan is **validated** - no-card, 14-day reverse trial, North Star = store live + first order in 7 days, ≤5-step checklist + demo store. Refinements, in build order for a founder-led team:

1. **Build the capped-but-alive free tier first (§4.6).** A reverse trial without a viable free tier is just a free trial. Define it: store stays live, ~3 products, no custom domain, "Powered by Print-Flow-360" footer, and a cap on stored designs/monthly orders so dormant free stores cost near-zero. Downgrade ≠ shutdown. *This is the prerequisite - nothing else in this section works without it.*

2. **Move the activation target from "day 7" to "first *test* order in days 1–3."** That's where 60–75% of conversion is decided. Make the ≤5-step checklist **end on "place a test order"** so the value loop closes in the first session. Ship the five-event instrumentation (§4.2) and obsess over two numbers above all others: % reaching Rung 1 (store live, day 1) and % reaching Rung 2 (test order, day 3).

3. **Reserve founder time for PQLs only.** Don't hand-onboard everyone. Wire the 3–4 triggers in §4.4 (test order placed; 3+ products; payment setup started-not-finished; returned 3 days) into one daily filtered list. When one fires, send the personal 60-sec Loom or a 15-min call offer; if PQLs exceed ~2/day, default to async Loom. This is the 6–12pt lever applied to the 20% who repay the hour.

4. **Ship the §4.5 behavioral email sequence** - 7 emails, milestone-triggered, plain-text from the founder, honest urgency, expiry sequence starting **day 11**. Automate the 80%; keep the day-3 PQL email personal.

5. **Defer the §4.7 pilot motion until inbound is real.** For the occasional bigger shop, run a 14–21-day "first-job pilot" with the one-page MAP - written success criteria tied to *their* orders, a decision date agreed before kickoff, no custom builds, ≤2–3 days of founder time or walk.

6. **Use trial extensions only as a save inside the expiry/cancel flow**, equal to the original length - never by default (extensions delay rather than create conversions).

**What NOT to do:** don't require a card up front (kills trust with this buyer for a low-ACV gain, and forgot-to-cancel revenue churns + generates chargebacks a tiny team can't service); don't go to 30 days (lower urgency, no conversion gain); don't measure success by checklist *completion* (measure first-test-order); don't run open-ended POCs, build bespoke for a pilot, or stand up a CS/sales motion before PQL volume justifies it; don't build an analytics platform before the five events that actually drive the triggers above.

---

## 5. Onboarding-to-Paid Handoff (activation → first value → retained customer)

The prior funnel work set the *goalposts* - no-card 14-day reverse trial, North Star = "store live + first order in 7 days," ≤5-step go-live checklist, demo store. This section is about the **motion that runs between those goalposts**: how an automated, founder-led product gets a non-technical, time-poor print-shop owner from "I made an account" to "this is now how I run my shop." There is no sales-to-CS handoff to design here - and that's exactly the trap.

> **Operator's note on this section.** Most onboarding/activation literature is written for $15k+ ACV SaaS with a CS function. Print-Flow-360 is low-ACV (likely ~$30–100/mo), self-serve, founder-led, selling to a buyer who will not read a tooltip tour and may not finish setup in one sitting (they run a print shop during the day). Where the source advice assumes a CSM, a calendar-based sequence, or a buyer who'll tinker, it's been cut or rewritten. The throughline: **build the product to do the activation work, default the hard steps so nobody can get trapped, and spend the founder's scarce hours only on accounts that hit a stall trigger.**

### 5.1 The handoff cliff: nobody owns the moment, so it dies

In a self-serve model there's no human handoff - which sounds simpler but is actually *worse*, because **nobody owns the moment between signup and value.** The classic sales→CS failure modes (Rocketlane, OnRamp, Default) transfer directly:

- The context about **why the owner signed up, what they were promised, and what success looks like to them** is never captured at all. A blank dashboard that asks the owner nothing about their shop is the self-serve equivalent of an amnesiac kickoff call.
- The biggest early trust-killer is **making the customer start from scratch / repeat themselves.** (Rocketlane)
- The fix the high-touch world calls a "customer context pack" has a PLG analog: **a 2–3-question signup-intent capture that personalizes everything downstream** (§5.5).

**Wes Bush's "value gap"** (via Productboard) names the core risk: the gap between *perceived value* (what your site promised - "run my whole print shop online") and *experienced value* (day-1 reality - an empty store, no products, no pricing). Conversion lives or dies in that gap. For Print-Flow-360 the empty store *is* the cliff.

**The starkest numbers in the field** (treat as orders-of-magnitude, not precision):

| Claim | Number | Evidence strength |
|---|---|---|
| Signups that log in once and never return | **40–60%** | Wes Bush / Productboard - *strong* |
| Users who churn without strong onboarding | **~90%** | Userpilot/ShnO - *directional* |
| Early churn attributable to poor onboarding | **40–60%** | SaaSFactor - *directional* |
| Voluntary churn linked to onboarding | **>20%** | Userpilot - *directional* |

**Bottom line:** onboarding is the #1 churn lever - the most consistent finding in the literature. For a small team that means activation is not a nice-to-have program; it's the single highest-ROI place to spend engineering and founder time. **If you fix one thing this quarter, fix the path from signup to first order.**

### 5.2 The activation framework to build around: Reforge's three moments

The most useful mental model is **Reforge's three-moment journey** (Brian Balfour / Elena Verna). Design onboarding to march people through *all three*, not just the first.

| Moment | Definition | Print-Flow-360 translation |
|---|---|---|
| **Setup moment** | Config work done before value is possible | Catalog imported, pricing set, store branded & published |
| **Aha moment** | First experience of core value | A **real (or test) order flows through the store** to a print job |
| **Habit moment** | Aha repeated at natural frequency until it sticks | Owner runs **their actual order volume** through the product for ~2–4 weeks |

**Elena Verna's key warning (high signal):** *the biggest mistake companies make is stopping activation at the setup moment.* Most teams celebrate "store published" and go quiet. But **setup ≠ value.** Your activation program must push past "store is live" → "an order flowed through it" → "this replaced their old email-and-spreadsheet way of working."

**Wes Bush's "Bowling Alley"** is the best tactical complement for *how* to move people through the gates. Two of its three bumpers translate well; the third needs adapting for this buyer:

1. **Straight-line onboarding (the lane):** for every step ask - *eliminate it, delay it, or is it mission-critical?* Strip everything else out of the first session. (Snappa delayed email confirmation → MRR +20% - a *cited* example.)
2. **Product bumpers (in-product guardrails):** checklists and one-line empty-state guidance. **Checklists alone lift activation to ~40%+ vs the 25–30% norm - a ~60% relative gain from one pattern** (Wes Bush, corroborated by Userpilot/Appcues - *strong*). **Caveat for this buyer: skip the multi-step product tour.** Non-technical owners click through or dismiss guided tours; a persistent checklist + good empty states out-performs a tour and is cheaper to build.
3. **Conversational bumpers (behavior-triggered messages):** congratulate on milestones, nudge on skipped steps - based on *product signals, not a calendar.*

### 5.3 Benchmark numbers to target

Goalposts, not precision. Strong-evidence items flagged.

**Time-to-First-Value (TTFV)** - best-in-class tools deliver first value in 2–5 min; full onboarding 5–15 min. **But that's for simple tools.** A web-to-print storefront's true aha (an order flowing) *cannot* happen in 5 minutes - it needs a catalog and pricing. So Print-Flow-360 needs **two TTFV targets**:
- **Micro-aha ≤10 min:** "see my branded store live with a sample product." This is what the seeded sample data + default pricing exist to make possible.
- **Real aha ≤7 days:** first test/real order - = your existing North Star.

**Activation & completion**
- Industry-average activation **15–20%**; healthy **30–50%**; top performers **40%+**. For a low-ACV self-serve trial, **aim 30%+ trial→activated** as the first milestone; below ~20% the funnel is broken upstream, not in messaging.
- Onboarding completion: avg **40–60%**, top **70–80%**.
- Keep core onboarding to **3–7 steps**; past ~20 steps, completion drops **30–50%** (*strong, consistent*). Your ≤5-step go-live checklist is already in the right band - protect it; don't let feature requests grow it.

**Activation → retention (the money argument)**
- First value within **14 days → ~80%+ retention at M12**; miss past 30 days → **35–50%** (directional).
- TTFV **<7 days → ~50% lower churn** (directional).
- No engagement in **first 3 days → ~90% churn** (directional). For a 14-day trial, **the first 72 hours decide the outcome** - front-load everything there.
- **Cutting TTV 20% lifted ARR growth 18%** (Amplitude 2024 mid-market study - *cited study, stronger*).

**Habit / stickiness leading indicators (your churn early-warning system)**
- **D30 stickiness** (key action on ≥3 of last 7 days, 30 days post-signup) predicts expansion better than logins (SaaSFactor). For a print shop, "key action" = an order processed, not a login.
- **7-day streak → ~90% D30 retention** vs ~20% without (directional).
- Canonical milestone: **Slack - team sends 2,000 messages → 93% stay active** (*cited*). The lesson is to find *your* numeric threshold. A reasonable starting hypothesis for Print-Flow-360: **"≥3 active products + ≥1 order in first 7 days, then ≥1 order/week by D30."** Validate it against your own retention data within the first ~50 activated trials - don't treat the threshold as gospel until you've checked it.

### 5.4 The right onboarding model for low-ACV SMB (a recommendation, not a menu)

A dedicated CSM is impractical below ~**$500/month ACV** (Chameleon, EverAfter, ProductLed) - and at a likely ~$30–100/mo, a single onboarding call that runs long *erases the account's annual gross margin*. Print-Flow-360 is squarely in **tech-touch-by-default** territory. **Do not build a CS org. Build a tech-touch spine with trigger-based human exceptions.**

**Recommended stack, in build order:**

1. **Self-serve guided onboarding = the backbone (build first).** In-product setup checklist (your ≤5-step go-live checklist) with progress + celebration; **demo/sample data** (you have a demo store) clearly bannered ("This is a sample to show you around - replace it with your products to go live"); **empty-state guidance everywhere** (every blank screen = one-line explanation + one primary action - which §0 of CLAUDE.md already mandates).
2. **Tech-touch lifecycle messaging = the nudge layer (build second).** Automated, **behavior-triggered** email + in-app (§5.7B).
3. **Leveraged 1-to-many human = the safety net (build third, cheap).** A weekly/biweekly **group onboarding webinar** ("Get your print shop online in 30 minutes - live"), recorded as an evergreen asset; async in-app chat/email (reactive).
4. **Trigger-based 1:1 founder intervention = the exception (build fourth).** Reserve scarce founder time for stall triggers (§5.5) - never blanket outreach.

**Explicitly NOT recommended for this ACV / team size:** dedicated CSMs, scheduled 1:1 onboarding calls for *every* trial, in-app product tours, high-touch implementation, and full PQL lead-scoring infrastructure. The math doesn't work at this ACV with a small team - and most of it doesn't fit the buyer either.

### 5.5 Capturing context & owning activation with no CS team

**Who owns activation: the founder owns it, the product executes it.** Don't wait to hire. Activation is a product + lifecycle-messaging responsibility, with the founder as the escalation path of last resort.

**Capture intent at signup → carry it into onboarding (the PLG "context pack").** Ask **2–3 questions max** at first-run, then *actually use the answers* (capturing intent you never act on is worse than not asking - it trains the owner that the product doesn't listen):

| Question | What it powers |
|---|---|
| "What do you mainly print?" (business cards / large format / apparel / booklets…) | Seeds the **sample catalog** so the demo store reflects *their* world |
| "How do you take orders today?" (email/phone / spreadsheet / another tool / nothing) | Frames the value message ("replace the email-and-spreadsheet scramble") |
| "What's the first thing you'd want live?" | Sets the checklist's first concrete goal |

Personalizing onboarding by role/intent **lifts 7-day retention ~35%** (Userpilot - directional). The handoff principle applies exactly: *don't make them repeat themselves; build on what they told you.*

**Stall triggers (PQL thinking at low-ACV): act because something happened, not because N days passed** (uladshauchenka, jimo.ai). You won't build full PQL scoring - but **3–4 hand-coded triggers capture most of the value** (PQL-scored funnels are cited at ~25–30% conversion vs single digits unscored - *directional*). These are simple `WHERE last_event = X AND hours_since > Y` queries, not an ML model. Define:

- Signed up but **no product imported within 48h** → founder concierge offer.
- **Catalog imported but no pricing set in 72h** → *this is your likely #1 stall point.* Pricing is the hardest step for a non-technical owner; treat it as the headline hypothesis to validate (§5.7D).
- **Store published but zero test orders in 5 days** → push to the aha.

### 5.6 Expansion & retention are seeded *during* onboarding, not bolted on later

The activation work *is* the retention work (SaaSFactor, Userlens). Get them to the **habit moment** and retention largely takes care of itself; miss it and no win-back saves you.

- **Plant the habit, not just setup.** The retention seed is real order volume flowing in weeks 2–4. A store that's "live" but processes zero real orders will churn at trial-end - so your program must drive **real orders**, not just a published store.
- **Expansion seeds** (once habit forms): more SKUs, more staff seats, B2B/company accounts, higher order-volume tiers, the design studio as an upsell. The expandability signal is the same **D30 stickiness** - owners running 3+ days/week are your expansion base *and* your word-of-mouth base. Since print-community word-of-mouth is your primary acquisition channel, **activation quality literally feeds acquisition.**

**Churn early-warning dashboard:**
- 🟢 **Healthy:** catalog imported + pricing set + ≥1 order in first 7d; ≥3 active days/week by D30.
- 🔴 **At-risk:** single login then silence (first 3 days); catalog in but no pricing; published but zero orders by D7; activity declining week-over-week.

### 5.7 Ready-to-use playbook for Print-Flow-360

**A. The activation spine (in-product) - first-run wizard, ≤5 steps, each with a lazy-path escape hatch:**

| Step | Owner's job | Friction-killer to build |
|---|---|---|
| 1. Tell us about your shop | 2–3 intent questions (§5.5) | Pre-selects sample catalog + tailors copy |
| 2. Add products | Import catalog | **Pre-loaded sample product** in their category so the store is never empty; "I'll add real ones later" allowed |
| 3. Set pricing | Set prices / rules | **Hardest step - default it.** Ship sensible default pricing on the sample product so they can publish *before* mastering the pricing engine. Offer concierge "send us your price list, we'll set it up" on stall |
| 4. Brand & publish | Name / logo / color, publish | One color rebrands the whole store (already built); publish in one click |
| 5. Place a test order | Walk through customer order → print job | This is the **aha** - guided + celebrated |

Design rules: persistent **checklist widget** with progress bar (~60% relative activation lift - *strong*); **celebrate the test order** in plain language ("Your first order just flowed through - this is exactly how it'll work for real customers"); 3–7 steps; never blank-screen the owner; **no forced product tour** (let the checklist + empty states carry it). Per §0 of CLAUDE.md, keep all copy in shopkeeper language - "Set your prices," not "Configure pricing rules."

**B. Lifecycle messaging** - behavior-triggered, founder-voiced, plain-text, reply-inviting (these out-perform designed HTML templates for onboarding; ProductLed/Encharge). Three tracks, each gated on behavior with an **auto-stop** so finishers stop getting nudged. Keep total volume low - this buyer's inbox is busy and noise gets the sender filed as spam.

- **Track 1 - Quick Win** (signup → "store published"):
  - *T0 Welcome:* "Let's get your shop online. Start here →" Set the expectation: live store + first test order this week.
  - *Trigger: no product 48h →* "Stuck on adding products? Reply and I'll import your catalog for you." (concierge)
  - *Trigger: catalog in, no pricing 72h →* "Pricing is the trickiest part - here's a 2-min walkthrough, or send me your price list and I'll set it up."
  - *Trigger: published →* celebrate + push to the test order.
- **Track 2 - Getting Hooked** (after first order, drives habit): "Your store works! Now let's get a *real* order through it - here's how to share your store link with a customer." Nudge toward repeat volume.
- **Track 3 - Conversion** (trial-end nears, gated on activation state):
  - *Activated:* "You've processed N orders - keep your shop running, pick a plan." (soft, value-anchored)
  - *Setup-but-stalled:* founder personal email + group webinar / quick call offer (the segment worth scarce human time).
  - *Never-activated:* low-effort win-back + a one-question "what got in the way?" survey to learn the friction (this is research, not rescue - don't over-invest).

**C. Leveraged human layer:** weekly live "Get your print shop online in 30 min" group webinar (recorded → evergreen onboarding + BOFU-SEO asset); stall-triggered founder DMs only; **concierge catalog/pricing setup** as the escape hatch for the hardest steps. Concierge is cheap at early volume and often the difference between activation and abandonment for this buyer - but it doesn't scale, so treat it as a *learning tool*: every concierge session tells you which product step to default or auto-fix next, so you can retire the manual touch.

**D. Instrument from day one:** North Star (store live + first order in 7d, already set) + both TTFV targets + **step-by-step checklist drop-off** (this is the highest-value instrument - it tells you *your* real #1 stall, which is a hypothesis, not a fact, until the funnel report confirms it; pricing is the leading guess) + D30 stickiness + activation→trial-conversion correlation. You can't fix the cliff you haven't measured.

### How this applies to Print-Flow-360

Prioritized for a low-ACV SMB product, a non-technical buyer, and a small founder-led team. Roughly ordered by payoff-per-build-hour:

1. **Default pricing on the sample product so owners can publish before they understand the pricing engine.** Highest payoff-per-hour. Pricing is the most probable cliff for a non-technical owner, and §0 already forbids empty/broken states. Ship sensible defaults on the seeded sample product so the wizard's step 3 can never trap them - and add a concierge "send us your price list" fallback for the rest. *Validate the assumption that pricing is the #1 stall with the checklist-drop-off report (item D) before over-investing.*
2. **Build the activation spine first, the CS org never.** A persistent ≤5-step checklist widget (mirroring the go-live checklist) with a progress bar and a *celebrated test order* is worth more than any human-touch program at this ACV. Expect ~60% relative activation lift from the checklist alone - and skip the product tour; it's wrong for this buyer.
3. **Capture 2–3 intent questions at first-run and actually wire them in** - seed the sample catalog from "what do you mainly print," frame copy from "how do you take orders today." This is your PLG context pack; skipping it makes the owner start from scratch (the #1 trust-killer) and forfeits ~35% of 7-day retention. Don't ask anything you won't use.
4. **Don't stop at "store published."** Per Verna, that's the most common and most expensive mistake. Your messaging and metrics must explicitly drive **real orders flowing for 2–4 weeks** (the habit moment) - a published-but-zero-order store churns at trial-end.
5. **Replace blanket outreach with 3–4 hand-coded stall triggers** (no product 48h / no pricing 72h / no test order 5d) - simple time-since-last-event queries, not a PQL scoring system. Behavior-triggered, founder-voiced, plain-text, with an auto-stop. Reserve live founder time only for the *setup-but-stalled* segment near trial-end.
6. **Run one weekly group "Get your shop online in 30 min" webinar and record it.** The only human touch that scales at low ACV - and it doubles as a BOFU-SEO/community content asset feeding your primary acquisition channel.
7. **Stand up the churn early-warning dashboard now** (the 🟢/🔴 signals in §5.6) and obsess over two numbers: % of trials that hit *catalog + pricing + 1 order in 7 days*, and D30 active-days/week. These predict both retention and which accounts are expandable references. **Front-load all of it into the first 72 hours** - that window decides the trial.

---

## 6. Consolidated sources

Grouped by section. Evidence strength noted inline above; treat all benchmark numbers as directional priors to validate against Print-Flow-360's own cohort data.

**§1 - Motion model:**
- Tomasz Tunguz (Theory Ventures, ex-Redpoint) - "The Smallest ACV to Justify an Inside Sales Team" (~$3K ACV floor; $100K rep / $500K quota math)
- OpenView Partners - Product-Qualified Lead (PQL) framework; reverse-trial guidance; PLG benchmarks
- Wes Bush (ProductLed) - *Product-Led Growth* & *The Product-Led Playbook: How to Win With a Tiny Team* (three reasons to insert a human; onboarding-to-PQL rule)
- Close.com - SMB sales-team fit rule of thumb (LTV under ~$1,000 → no sales team)
- GrowthSpree - CAC payback over theoretical LTV ("cash flow trumps lifetime value")
- Pocus / OpenView - PQL scoring calibration (watch first ~50 PQLs, then tune)
- Decibel VC / Userpilot - touch-spectrum (self-serve ↔ hybrid ↔ sales-led) framing
- Slack, Zendesk, Atlassian - named PQL activation playbooks (72-hr invite, ~2,000-message activation, high-effort setup, Jira→Confluence cross-sell)

**§2 - Discovery & objection-handling:**
- Neil Rackham, *SPIN Selling* (Huthwaite research, ~35,000 calls) - Situation/Problem/Implication/Need-payoff; the Implication-question finding
- David Sandler, Sandler Selling System - Up-Front Contract and Pain Funnel (surface symptom → business impact → personal consequence)
- Matthew Dixon & Brent Adamson, *The Challenger Sale* (CEB/Gartner, ~6,000-rep study) - Teach/Tailor/Take Control; weakest in transactional sales
- Jack Carew / Carew International - LAER objection model (Listen, Acknowledge, Explore, Respond), 1976
- Jack Napoli & Dick Dunkel (PTC) - MEDDIC/MEDDPICC enterprise qualification checklist; practitioner >$100K rule of thumb
- IBM - BANT (Budget/Authority/Need/Timeline); HubSpot - GPCT (Goals/Plans/Challenges/Timeline) qualification ordering
- Michael Bosworth, *Solution Selling* / consultative selling - diagnose before prescribe
- Feel-Felt-Found - classic objection-handling rebuttal (sales folklore, widely attributed)

**§3 - Pipeline / CRM / forecasting:**
- Fullcast - PLG forecasting playbook (forecast self-serve and sales-assisted as separate models)
- a16z - cohort retention and the "rebase to month 3" method for SaaS retention/forecasting
- Forecastio - forecast categories (Pipeline / Best Case / Commit) and category-separation discipline
- Avoma / Prospeo / SiftHub - buyer-action (past-tense) pipeline stage design
- ReWork / Praiz - CRM hygiene cadence and structured lost-reason capture
- Sybill / Salesforce / Ebsta - weekly pipeline-review meeting format
- Waveup / Lightfield / M Accelerator - HubSpot vs Attio vs Pipedrive CRM-for-startups comparisons
- ChartMogul / Lenny's Newsletter - opt-in (no-card) vs opt-out (card-required) trial-to-paid conversion benchmarks
- Benchmarkit / SaaS Capital - SMB NRR and trial-to-paid benchmark ranges by ACV band

**§4 - Trials & POCs:**
- Kyle Poyar, OpenView / *Growth Unhinged* - "Your guide to reverse trials" (~10 paid conversions per 1,000 visitors for reverse trial vs ~5 free trial vs ~4 freemium; examples Airtable, Notion, Canva, Loom, HubSpot)
- GrowthSpree - 2026 B2B trial-model conversion compilation (trial-archetype median rates; activation explains 60–75% of conversion variance; opt-in optimal at 14 days)
- Userpilot - trial-model conversion benchmarks & onboarding-checklist completion lift (20–30%)
- First Page Sage - B2B SaaS free-trial conversion-rate benchmarks by model
- Appcues - 2026 study (2.1M trial users): Day-1 ≥3-activation checklist 52.7% vs 40.4% baseline; PQL/activation benchmarks
- Intercom - 40–60% of signups never return after day one
- Baremetrics - 3-day setup → 3–4× conversion; honest trial-end urgency
- RevenueCat / Userpilot - 7–14-day trials outperform 30-day by up to ~71%
- Refiner / Dock / Appcues - PQLs convert 5–10× better than MQLs
- PartnerStack / Storylane - single human touchpoint lifts conversion 6–12pts; "low-touch with option to escalate" best CAC ratio sub-$200K MRR
- ProductLed - two-phase automation-plus-PQL onboarding motion
- Correlated - behavior-triggered (not calendar) milestone emails
- Frontiers in Psychology (2025) - randomized field experiment: trial extensions +11% adoption, +42% conversion delay, no effect on immediate conversion
- FluentCRM / Sequenzy - 14-day trial → 5–7 milestone-triggered emails
- Recapped (Mark Fershteyn) / Dock / Flowla - POC purgatory, Mutual Action Plans, time-boxing pilots
- Facebook ("7 friends in 10 days") & Dropbox ("1 file in 1 folder on 1 device") - canonical aha-moment milestones

**§5 - Onboarding-to-paid handoff:**
- Wes Bush - *Product-Led* (value gap, Bowling Alley framework, checklist activation lift); via Productboard
- Reforge - Brian Balfour & Elena Verna (three-moment activation: setup/aha/habit; "don't stop at setup" warning)
- Amplitude - 2024 mid-market study (cutting TTV 20% → ARR growth 18%)
- Userpilot - onboarding personalization (~35% 7-day retention lift); churn/voluntary-churn benchmarks
- SaaSFactor - early churn attributable to onboarding; D30 stickiness as expansion predictor
- Slack activation benchmark - 2,000 messages → 93% retained (canonical milestone)
- Snappa - delayed email confirmation → MRR +20% (Bowling Alley straight-line example)
- Rocketlane / OnRamp / Default - sales-to-CS handoff failure modes (start-from-scratch trust-killer, context pack)
- Chameleon / EverAfter / ProductLed - CSM viability threshold (~$500/mo ACV); tech-touch model
- Encharge / ProductLed - plain-text founder-voiced lifecycle email out-performs HTML templates
- uladshauchenka / jimo.ai - PQL / behavior-trigger thinking for self-serve funnels

---

## Related internal docs

- `readme/CONVERSION_FUNNEL_RESEARCH_2026-06-15.md` - landing→trial→paid funnel shape (the goalposts this doc operates between)
- `readme/ACQUISITION_CHANNELS_2026-06-15.md` - which channels feed the top of this funnel
- `readme/B2B_MODULE.md` / `readme/B2B_GUIDE.md` - the multi-location/company-account layer that defines the only "Talk to us" sales-assist lane
- `readme/ACTION_CENTER.md` - the in-product "needs action now" alert pattern to extend with a "Hot trial / PQL" rule
