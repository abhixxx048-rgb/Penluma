# Chapter 4 Research Notes: The Economics of Now — Why Comfort Beats Goals

Research compiled 2026-07-04. Every claim attributed. Sections mirror the chapter brief: present bias & hyperbolic discounting, System 1/System 2, loss aversion & status quo bias, friction & defaults, commitment devices, temptation bundling, and why "just use willpower" is bad economics.

---

## 1. Present Bias and Hyperbolic Discounting

### The core idea
Standard economics assumed people discount the future *exponentially* — at a constant rate per unit of time, so preferences stay consistent. Real humans discount *hyperbolically*: value falls off a cliff for delays in the near future, then flattens out for distant delays. The result is **time-inconsistent preferences** — the choices your "planning self" makes for the future get reversed by your "experiencing self" when the moment arrives.

### The worked example ($50 now vs $100 in a year)
The classic demonstration (used across the behavioral-economics literature, popularized in explanations of hyperbolic discounting, e.g., Nir Eyal's write-up and the behavioral finance literature):

- **Choice A:** $50 today vs. $100 one year from now → a large share of people take the $50 now. Implicitly they're accepting a 100% annual "interest rate" penalty just to avoid waiting.
- **Choice B:** $50 in five years vs. $100 in six years → almost everyone chooses the $100. Yet it is the *identical* trade — $50 more for one extra year of waiting. The only difference is that both options are far away, so the "now" bonus doesn't apply.

Preference reversal is the signature: when year five arrives, the same people will want to flip back to the smaller-sooner reward. This is exactly the structure of "I'll start the diet Monday" — Monday's diet is a distant trade-off (easy to prefer), until Monday becomes *now*.

### The formal model: beta-delta (quasi-hyperbolic) discounting
- **David Laibson (1997, QJE, "Golden Eggs and Hyperbolic Discounting")** formalized present bias with the β-δ model: every future period gets a one-time extra discount β (typically estimated around **β ≈ 0.7**, meaning anything not-now is instantly worth ~30% less), then normal discounting δ after that.
- A meta-analysis of quasi-hyperbolic discounting (Cheung, Tymula & Wang, *Management Science*, 2024; also IZA DP 14625) confirms present-bias parameters below 1 across the experimental literature — present bias is one of behavioral economics' most robust findings, though the size varies with whether rewards are money vs. real effort/consumption.
- George Ainslie's earlier work (1975, pigeon experiments; *Picoeconomics*, 1992) showed even pigeons show preference reversals — hyperbolic discounting appears to be a deep feature of animal reward systems, not a human quirk.

### Vivid real-world illustrations
1. **Paying not to go to the gym.** DellaVigna & Malmendier (2006, *American Economic Review*, "Paying Not to Go to the Gym") tracked 7,752 members of three US health clubs over three years. Members who chose a flat monthly contract of ~$70+ attended on average **4.3 times per month — over $17 per visit** — when a $10-per-visit pass was available. Average forgone savings: **~$600 per membership**. People bought the membership as a (failed) commitment device, overconfident about their future selves. Monthly members were also 17% more likely to linger past a year than annual members — inertia again.
2. **Payday lending / credit cards:** present bias explains why people simultaneously hold high-interest credit card debt and low-interest savings — the now-self borrows against the future-self's paycheck.
3. **"Future self as a stranger":** Hal Hershfield (UCLA, fMRI studies ~2009-2011) found that when people think about their future selves, brain activity resembles thinking about *a stranger*. Showing people age-progressed photos of themselves increased hypothetical retirement allocations — you save more for someone you recognize.

---

## 2. Kahneman: System 1 vs System 2

- **Daniel Kahneman, *Thinking, Fast and Slow* (2011)** (terminology from Stanovich & West, 2000): **System 1** is fast, automatic, effortless, associative, always on; **System 2** is slow, deliberate, effortful, lazy — it endorses System 1's suggestions unless forced to work.
- **The bat-and-ball problem** (Shane Frederick's Cognitive Reflection Test, 2005): "A bat and a ball cost $1.10 total. The bat costs $1.00 more than the ball. How much does the ball cost?" Intuition screams 10¢; correct answer is 5¢. Roughly **50% of students at MIT, Princeton and Harvard gave the wrong intuitive answer**; at less selective universities error rates ran 80%+. A 2023 *Cognition* meta-analysis covering 59 studies and 70,000+ participants confirms the error is massively prevalent. Kahneman's point: this shows "how lightly System 2 monitors the output of System 1."
- **Chapter relevance:** goals are set by System 2 (deliberate, future-oriented); daily behavior is executed by System 1 (cue-driven, present-oriented, comfort-seeking). The knowing-doing gap is partly a System 2 → System 1 handoff failure. Knowledge lives in System 2; behavior is dispatched by System 1.
- **Caution for the book:** Kahneman himself acknowledged (2017) that Chapter 4 of *Thinking Fast and Slow* (priming studies) relied on research that later failed replication. The System 1/System 2 framing survives as a useful *model*, but present it as a metaphor for dual-process cognition, not literal brain anatomy. The CRT/bat-and-ball findings themselves replicate robustly.

---

## 3. Loss Aversion and Status Quo Bias

### Loss aversion
- **Kahneman & Tversky, Prospect Theory (1979, *Econometrica*)**: "losses loom larger than gains." Tversky & Kahneman (1992) estimated the loss-aversion coefficient **λ = 2.25** — a loss feels roughly 2.25x as intense as an equal gain.
- **Current consensus (important honesty point):** Gal & Rucker (2018, *Journal of Consumer Psychology*, "The Loss of Loss Aversion") argued the effect was overstated and context-dependent, especially for small stakes. But the largest meta-analysis to date — **Brown, Imai, Vieider & Camerer (2024, *Journal of Economic Literature*), 607 estimates from 150 articles** — found strong evidence for loss aversion with **mean λ = 1.955 (95% interval 1.82–2.10)**. Bottom line: loss aversion is real and roughly 2:1, but not a universal constant; it weakens for small amounts and certain contexts, and the endowment effect/status-quo-bias evidence has competing explanations (Simonson & Kivetz 2018 commentary).

### Status quo bias
- **Samuelson & Zeckhauser (1988, *Journal of Risk and Uncertainty*, "Status Quo Bias in Decision Making")** coined the term: in experiments and field data (Harvard health-plan choices, TIAA-CREF retirement allocations), people disproportionately stick with defaults/incumbent options even when alternatives are objectively comparable or better. The more options offered, the stronger the pull of the status quo.
- Mechanisms: loss aversion (any change involves losses that loom larger), decision costs, regret avoidance, and omission bias (harm from inaction feels less blameworthy than harm from action).
- **Chapter relevance:** your current life *is* the status quo. Any goal is, by definition, a proposed change — so every goal starts with a ~2:1 psychological handicap. Comfort isn't laziness; it's the default winning a rigged referendum.

---

## 4. Tiny Friction, Massive Behavior Change: Defaults

### Organ donation defaults
- **Johnson & Goldstein (2003, *Science*, "Do Defaults Save Lives?")**: effective organ-donor consent rates in opt-in countries vs opt-out neighbors: **Germany (opt-in) ~12% vs Austria (opt-out) 99.98%; Denmark 4.25% vs Sweden 85.9%; Netherlands 27.5% vs Belgium 98%**. Culturally similar neighbors, 60-90 percentage-point gaps, and the moving variable is a checkbox default.
- **Honest caveat:** later analyses (e.g., Arshad et al. 2019, *Kidney International*; Dallacker/medRxiv 2021) show presumed-consent countries do **not** reliably have higher *actual deceased-donation/transplant* rates — family veto, ICU infrastructure, and procurement organization matter more. Spain leads the world through logistics, not just its opt-out law; the UK raised deceased donation 63% since 2007 through infrastructure before changing its default. So: defaults powerfully move *registrations/stated consent*; converting that to outcomes needs systems. (Good nuance for the book: friction design is necessary, not sufficient.)

### 401(k) auto-enrollment
- **Madrian & Shea (2001, *Quarterly Journal of Economics*, "The Power of Suggestion")**: one Fortune 500 company switched from opt-in to automatic enrollment. Participation among new hires jumped from ~37% to ~86% — a rise of **~50 percentage points**; participation among those with under a year of tenure roughly **doubled**. Strikingly, **76% of auto-enrolled participants stayed at the default 3% contribution rate and default conservative fund** — the default is sticky in both directions (it got them in, and it anchored them low).
- Follow-on: Choi, Laibson, Madrian & Metrick (2002-2004) replicated across firms; auto-enrollment became standard, and the **US SECURE 2.0 Act (December 2022)** made auto-enrollment plus auto-escalation the legal default for most new 401(k) plans starting 2025 — a behavioral-economics finding turned federal law.

### Save More Tomorrow (SMarT)
- **Thaler & Benartzi (2004, *Journal of Political Economy*, "Save More Tomorrow")**: employees commit *today* to raising their savings rate *at each future pay raise* (so take-home pay never visibly drops — sidestepping both present bias and loss aversion at once).
- Results at the first company: only **28%** of employees accepted an advisor's suggestion to raise savings immediately, but **78%** of those who declined agreed to SMarT. Over 40 months / four pay raises, participants' average savings rate rose from **3.5% to 13.6%** — nearly quadrupled. ~80% stayed through four raises; only ~2% dropped out in year one.
- This is the flagship demonstration that redesigning *when* and *how* a choice is framed beats exhorting people to save.

### Everyday friction: the Google M&M study
- **Google "Project M&M" (2012-2013, New York office, reported in Washington Post/TIME 2013)**: M&Ms moved from clear bins into opaque containers; healthy snacks put in glass jars at eye level. Over 7 weeks, the 2,000-person office consumed **3.1 million fewer calories from M&Ms** (~9 vending-size bags per employee). Proportion of snack calories from candy fell from 29% to 20%. Nobody's willpower changed — three seconds of added friction did the work.
- Related classics: Brian Wansink's cafeteria/plate-size work is now largely discredited (17+ retractions, resigned from Cornell 2019) — **do not cite Wansink**; the Google case and Johnson/Goldstein-style default studies are safer ground.

---

## 5. Commitment Devices

### The archetype: Ulysses and the Sirens
- Homer's *Odyssey*: Ulysses wants to hear the Sirens' song but knows his future self will steer into the rocks. He has his crew bind him to the mast and plug their own ears with wax — he removes the *option* to yield, in advance. 
- Intellectual lineage: **Robert Strotz (1955-56)** modeled why a rational agent would constrain future choices ("myopia and inconsistency in dynamic utility maximization"); **Thomas Schelling (1956 "An Essay on Bargaining"; 1960 *The Strategy of Conflict*; 1980s "egonomics" essays)** analyzed self-command as bargaining with your future self; philosopher **Jon Elster, *Ulysses and the Sirens* (1979)** made precommitment a general theory of rationality.
- Definition: a commitment device is a voluntarily self-imposed constraint or penalty that changes the future self's incentives, chosen because you predict your own preference reversal.

### Evidence: deposit contracts work (with caveats)
- **CARES smoking study — Giné, Karlan & Zinman (2010, *American Economic Journal: Applied Economics*, "Put Your Money Where Your Butt Is")**: 2,000 smokers in the Philippines offered a savings account; deposits forfeited to charity if a urine test at 6 months showed nicotine. **11% took it up**; being offered the contract raised the likelihood of passing the 6-month test by **3.3–5.8 percentage points**, an effect that *persisted at a surprise 12-month test* (roughly a 30-60% relative improvement over baseline quit rates). Caveat: ~66% of contract-takers ultimately forfeited their money — commitment devices help on average but many individual users lose their stake.
- **Volpp et al. (2008, *JAMA*)** weight-loss RCT (57 participants, Philadelphia VA): over 16 weeks, deposit-contract group lost **14.0 lb** and lottery group **13.1 lb** vs **3.9 lb** for control; ~47-53% of incentive groups hit the 16-lb target vs 10.5% of controls. Key caveat: weight was substantially regained after incentives ended — incentives start behavior; maintenance needs habit/environment redesign.
- **stickK.com** — founded 2008 by Yale economists **Dean Karlan** and Ian Ayres (with Jordan Goldberg), directly out of the CARES research. Users sign contracts, optionally stake money (often to an "anti-charity" they despise — e.g., a rival team's booster club), and appoint a referee. Company-reported figures claim success rates roughly triple when money + referee are attached vs. a bare pledge (company data, not peer-reviewed — flag as such). Karlan is stickK's president; Zinman advises.
- **Systematic reviews (honest picture):** a Cochrane-style systematic review of commitment devices for weight loss (2019, PMC6591991) found a statistically significant but *small* short-term effect (~1.5 kg across 3 trials, n=409), with variable study quality; behavioral-economics incentives for physical activity show small effects that often fade at follow-up. Commitment contracts appear most effective when **public** and when targeting discrete, verifiable behaviors. Financial incentives overall roughly **double the odds** of short-term health-behavior change (reviews of incentive literature), but effects decay when incentives stop.
- **Ariely & Wertenbroch (2002, *Psychological Science*, "Procrastination, Deadlines, and Performance")**: MIT students *voluntarily* self-imposed costly deadlines to fight procrastination, and self-imposed deadlines improved performance vs a single end deadline — but externally imposed, evenly spaced deadlines worked best; people don't set their own deadlines optimally. **Replication caveat:** a 2024 replication (Hyndman & Bisin) failed to reproduce Study 2's performance results — cite the original directionally, not as gospel.
- Everyday commitment devices: cutting up credit cards; Christmas club accounts (illiquid by design); handing your phone to a friend; website blockers (Freedom, Cold Turkey); buying small snack packages; Victor Hugo allegedly having his valet hide his clothes so he'd stay in and finish *The Hunchback of Notre-Dame* (well-worn anecdote — label as legend).

---

## 6. Temptation Bundling (Katy Milkman)

- **Milkman, Minson & Volpp (2014, *Management Science*, "Holding the Hunger Games Hostage at the Gym")**: 226 university gym members. Full-treatment group got iPods loaded with addictive audio novels (*The Hunger Games*, etc.) **accessible only at the gym**. Result: **51% more gym visits than control** (and 29% more than a group merely encouraged to self-restrict). Effect decayed over the 9-week study (Thanksgiving break hurt everyone), but at the end **61% of participants were willing to pay** for gym-restricted audiobook access — evidence of demand for commitment.
- Definition: pair a "want" (instantly gratifying, guilt-inducing) with a "should" (delayed benefit, effortful) so the want is only available during the should. You convert the activity's *now-cost* into a *now-reward* — fighting present bias with present bias.
- Follow-up: Kirgios, Milkman et al. (2020, *Organizational Behavior and Human Decision Processes*): even simply *teaching* temptation bundling in a large field experiment (n≈6,800 24 Hour Fitness members) modestly boosted gym attendance — cheap to deploy.
- Everyday examples Milkman gives (*How to Change*, 2021): only watch your favorite trashy show while ironing/on the treadmill; favorite podcast only while doing chores; favorite burrito place only while catching up on difficult emails; pedicure only while reading overdue work reports.

---

## 7. Why "Just Use Willpower" Is Bad Economics

### Ego depletion: the collapse of the willpower-as-muscle model
- Original claim: **Baumeister et al. (1998, radish/cookie experiment)** — self-control draws on a limited resource that depletes with use ("ego depletion"). A 2010 meta-analysis (Hagger et al.) claimed a medium effect (d ≈ 0.62) across ~200 studies.
- **Replication reality:** the 2016 Registered Replication Report (**Hagger & Chatzisarantis, 23 labs, 2,000+ participants**) found an effect **indistinguishable from zero** — despite 22 of 23 labs predicting success. A second multi-lab effort (**Vohs et al. 2021, 36 labs, n=3,531**) also found essentially nothing. The glucose "willpower fuel" account is likewise dead. Carter & McCullough (2014) showed the earlier meta-analysis was riddled with publication bias.
- Consensus now: willpower is not a depletable tank, but *relying on in-the-moment inhibition is still a losing strategy* — for economic reasons, not muscular ones.
- Related honesty note: the **marshmallow test** (Mischel, 1972; Shoda, Mischel & Peake 1990 follow-ups) — the famous delay-of-gratification-predicts-life-outcomes story shrank dramatically on replication. **Watts, Duncan & Quan (2018, *Psychological Science*, n≈900 diverse sample)**: correlation with age-15 achievement was **half** the original, and fell by **two-thirds** with controls for family background and early cognition. Delay ability partly reflects the child's *environment and rational trust* (Kidd et al. 2013: kids wait longer for reliable adults), not raw willpower.

### The economic reframe
- People who *appear* highly self-controlled largely don't fight temptation — they avoid it. **Hofmann, Baumeister et al. (2012, experience-sampling)** and **Milyavskaya & Inzlicht (2017)**: trait self-control predicts *experiencing fewer temptations*, not winning more battles; effortful resistance barely predicted goal attainment.
- Economics framing for the chapter: willpower is asking people to repeatedly "pay" an in-the-moment cost with no change in the price structure. Incentive/friction design *changes the prices*: defaults make the good choice free (Madrian & Shea), deposit contracts make the bad choice expensive (Karlan), temptation bundling pays an immediate wage for the good choice (Milkman), and SMarT schedules the cost into the future where hyperbolic discounting shrinks it (Thaler & Benartzi).
- Thaler's dictum (*Nudge*, Thaler & Sunstein 2008): "If you want to encourage some activity, **make it easy**" — channel factors beat exhortation (echoing Kurt Lewin, 1940s).
- Closing stat pairing for the chapter: telling employees to save (education seminars) moved participation by ~a few percentage points at best (Duflo & Saez 2003; Choi et al. financial-education literature); flipping the default moved it ~50 points (Madrian & Shea 2001). Same knowledge, ~10-25x the effect — the gap between knowing and doing is priced in friction, not information.

---

## Source list (primary)
- Kahneman & Tversky (1979) Prospect Theory, *Econometrica*; Tversky & Kahneman (1992) λ=2.25.
- Brown, Imai, Vieider & Camerer (2024) *JEL* meta-analysis, λ=1.955.
- Gal & Rucker (2018) *JCP*; Simonson & Kivetz (2018) reply.
- Samuelson & Zeckhauser (1988) *JRU*.
- Laibson (1997) *QJE*; Cheung/Tymula/Wang (2024) *Management Science* meta-analysis.
- Johnson & Goldstein (2003) *Science*; Arshad et al. (2019) *Kidney International* (caveat).
- Madrian & Shea (2001) *QJE*.
- Thaler & Benartzi (2004) *JPE*; SECURE 2.0 Act (2022).
- DellaVigna & Malmendier (2006) *AER*.
- Giné, Karlan & Zinman (2010) *AEJ: Applied*.
- Volpp et al. (2008) *JAMA*.
- Milkman, Minson & Volpp (2014) *Management Science*; Milkman *How to Change* (2021).
- Ariely & Wertenbroch (2002) *Psych Science*; Hyndman & Bisin (2024) failed replication.
- Hagger et al. RRR (2016); Vohs et al. (2021); Watts, Duncan & Quan (2018).
- Frederick (2005) CRT; *Cognition* (2023) bat-and-ball meta-analysis.
- Schelling (1956, 1960); Strotz (1955-56); Elster (1979).
- Google Project M&M (2013 press coverage: Washington Post, TIME, The Decision Lab).
