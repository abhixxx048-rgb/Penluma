# Chapter 8 Research Notes: Luck, Privilege, and Personal Responsibility

Research compiled 2026-07-04 for "The Knowing-Doing Gap." Every claim attributed. Sources listed at end of each section.

---

## 1. Robert Frank - "Success and Luck: Good Fortune and the Myth of Meritocracy" (Princeton University Press, 2016)

**Core thesis.** Cornell economist Robert H. Frank argues chance plays a far larger role in life outcomes than most people believe, and that this matters more than ever because modern economies are increasingly **winner-take-all markets**: technology lets the very best product/performer capture almost the entire market, so trivial initial advantages and chance events compound into enormous income differences.

**Frank's tournament simulation (book appendix).** Frank modeled winner-take-all contests where each contestant gets three scores from 0–100: talent, effort, and luck. He varied contestant pools from 1,000 to 10,000 to 100,000 and the luck weighting from 1% to 20%. Key result: **even when luck counts for only 1–2% of total performance, the contestant with the highest combined talent+effort almost never wins in large pools.** The winner is almost always someone with near-maximum skill who was also unusually lucky. With 100,000 contestants and luck at just 2%, the most-skilled person wins only a vanishingly small share of the time. Intuition: when thousands of competitors are all near the talent ceiling, the only remaining differentiator is luck.

**Psychology of denial.** Frank draws on behavioral economics to show winners systematically downplay luck: memories of one's own hard work are cognitively more "available" (availability heuristic) than memories of lucky breaks - you vividly remember grinding through the all-nighters, not the fact that your resume happened to land on the right desk. Frank also notes a headwind/tailwind asymmetry (with Tom Gilovich): we notice headwinds (obstacles) because we must fight them; tailwinds (advantages) are invisible because they require no attention.

**Frank's personal stories (vivid, usable):**
- In 2007 Frank suffered **sudden cardiac arrest while playing tennis** - a condition roughly 90% of victims don't survive (some accounts: he was given a ~2% survival chance). He lived only because an ambulance happened to be minutes away on an unrelated call. He calls his entire subsequent life "luck."
- He also nearly drowned once in a **windsurfing accident**, trapped under the sail.
- Career luck: he became an economist partly through accidents of being overlooked and redirected (e.g., missed by his baseball coach despite ability).

**Policy angle** (worth one line in chapter): Frank argues underestimating luck has a social cost - winners who think they earned everything become reluctant taxpayers; people who acknowledge luck report more gratitude and more willingness to contribute to the common good.

Sources: Princeton UP book page (2016); LSE Review of Books review (2016); IMF Finance & Development review (Sept 2016); Cornell Chronicle "Luck looms larger in success" (July 2016); SIAM News "Luck Versus Skill"; EconTalk interview with Russ Roberts (2016).

---

## 2. The Pluchino/Biondo/Rapisarda "Talent versus Luck" simulation (2018)

**Paper:** A. Pluchino, A. E. Biondo, A. Rapisarda, "Talent vs Luck: the role of randomness in success and failure," *Advances in Complex Systems* 21(3-4), 2018 (arXiv:1802.07068). University of Catania. Won the 2022 Ig Nobel Prize in Economics.

**Setup.** Agent-based model: **1,000 agents**, each with talent drawn from a normal (Gaussian) distribution - **mean 0.6, SD 0.1** - and identical starting capital (10 units). Simulated **40-year working life (age ~20–60) in six-month steps**. Random event points move through the environment; when a **lucky event** hits an agent, their capital **doubles with probability proportional to their talent** (talent lets you exploit luck); an **unlucky event halves capital** regardless of talent.

**Results (the numbers to quote):**
- Final wealth follows a **power law / Pareto "80-20" pattern**: roughly **80% of total capital ends up held by 20% of agents** - even though talent was normally distributed. (Real-world wealth follows a power law; talent doesn't. Randomness plus multiplicative dynamics explains the gap.)
- **The most successful agents are almost never the most talented.** In a representative run, the top individual finished with **capital 2,560 and talent 0.61 - barely above the population average of 0.6** - while **the most talented agent (talent 0.89) finished with less than 1 unit of capital (0.625)**. Maximum success "never coincides" with maximum talent across runs.
- Conclusion in the authors' words: talent is **"necessary but not sufficient"**; mediocre-but-lucky individuals routinely overtake the most talented.
- Funding-policy simulations: distributing research funding **equally to everyone, or randomly**, produced more successful outcomes than concentrating funds only on the previously most-successful ("meritocratic" funding) - because past success is a noisy signal contaminated by luck.

**Critiques (be honest):** It's a toy model, not an empirical measurement - parameter choices (doubling/halving, event rates) drive the drama of the results; critics (e.g., J. B. Whitmore's "Talent vs Luck: A Critical Response," 2019) note the model's assumptions guarantee luck-dominance and that real careers give talent more channels to act. Use it as an intuition pump about multiplicative processes, not proof of the exact talent/luck split.

Sources: arXiv:1802.07068 (2018); Advances in Complex Systems published PDF (Univ. of Catania repository); Improbable Research summary (Feb 2018); jbwhit.github.io critical response.

---

## 3. Survivorship bias - the WWII bomber story and why winner advice misleads

**Abraham Wald and the bombers.** Wald (b. 1902, Kolozsvár/Cluj, Transylvania; PhD in mathematics, University of Vienna, 1931; fled Nazi-controlled Europe) worked in the **Statistical Research Group (SRG) at Columbia University** during WWII. The military examined returning bombers, mapped where bullet holes clustered (fuselage, wings), and proposed armoring those areas. Wald's insight: **the data came only from planes that made it home**. Holes on survivors marked places a plane could be hit *and still fly*; the planes hit in the unmarked areas (engines, cockpit) never returned. Recommendation: **armor where the returning planes show no damage.**

**Caveat for accuracy:** historians (see the American Mathematical Society feature column "The Legend of Abraham Wald," 2016) note the popular anecdote is partly reconstruction - Wald's actual memoranda ("A Method of Estimating Plane Vulnerability Based on Damage of Survivors") were about estimating survival probabilities, and the bullet-hole-diagram story as usually told is embellished. The statistical principle is real; the cinematic scene is legend. A study guide should tell the story and add this footnote.

**Why success advice misleads.** The sample of available advice is systematically skewed: failed founders don't write memoirs, dead companies don't give keynotes. Phil Rosenzweig, *The Halo Effect* (2007), documents the companion error in business books: when a company performs well, observers retroactively attribute success to its culture/leadership/strategy (halo effect), so books like *Good to Great* and *In Search of Excellence* profiled "excellent" companies many of which subsequently underperformed the market. "Drop out like Gates/Jobs/Zuckerberg" advice samples three survivors from millions of dropouts. Rule of thumb for the chapter: **for every visible winner following strategy X, ask how many invisible people followed X and failed** - the graveyard is silent (Taleb's "silent evidence" in *Fooled by Randomness*, 2001).

Sources: AMS Feature Column (2016); Cantor's Paradise/Bazzi; War History Online; The Decision Lab "Survivorship bias"; Rosenzweig *The Halo Effect* (2007); Entrepreneur.com "How Survivorship Bias Distorts Our View of Successful Entrepreneurs."

---

## 4. The birth lottery: country, family, era

**Buffett's "ovarian lottery."** Warren Buffett's thought experiment (laid out at the 1997 Berkshire Hathaway meeting; recounted in Alice Schroeder's *The Snowball*, 2008): imagine, 24 hours before birth, a genie lets you design the world's economic rules - but you don't know whether you'll be born rich or poor, male or female, able or disabled, in the US or elsewhere. Buffett says when he and Charlie Munger were born (1930/1924), **the odds were more than 30-to-1 against being born in the United States**; elsewhere he put his odds of being born an American male at ~80-to-1. He calls himself "in the luckiest 1% of the world." The idea descends from philosopher **John Rawls's "veil of ignorance"** (*A Theory of Justice*, 1971).

**Milanovic's citizenship premium (the hardest numbers in this chapter).** Economist Branko Milanovic (*Global Inequality*, 2016; earlier World Bank work) estimates that **roughly 80% of a person's income is explained by just two things fixed at birth: country of birth (~60%) and parental income position (~20%)** - leaving ~20% for effort, choices, luck-within-life, gender, race, and everything else. About **97% of people live their lives in the country they were born in**. An average American earns on the order of **90+ times** what a person born in the world's poorest country earns, purely by location. In 1820 only ~20% of global inequality was between countries; by the mid-20th century ~80% was.

**Family: intergenerational income elasticity (IGE).** In the US the IGE is roughly **0.4–0.5**: a 10% difference in parents' income predicts a ~5% difference in children's income; the US is *less* mobile than most other rich countries (the "Great Gatsby Curve," named by Alan Krueger, 2012: more inequality → less mobility).

**Raj Chetty's "Lost Einsteins"** (Bell, Chetty, Jaravel, Petkova, Van Reenen, *QJE* 2019; NBER w24062, 2017): children from **top-1% income families are 10x more likely to become patent-holding inventors** than children from below-median-income families. Third-graders in the top math percentiles become inventors at high rates **only if they're from rich families**; equally high-scoring poor kids mostly don't ("lost Einsteins"). 82% of young inventors were male; exposure to inventors in childhood strongly predicts inventing. Authors estimate the US would have ~4x as many inventors if women, minorities, and low-income children invented at the same rate as high-income white men.

**Era.** Chetty, Grusky, Hell, Hendren, Manduca, Narang, "The Fading American Dream" (*Science*, 2017): the fraction of children earning more than their parents fell from **~90% for the 1940 birth cohort to ~50% for the 1980s cohorts**. Which decade you're born into is itself a lottery ticket.

**Timing within an era - recession graduates.** Lisa Kahn (*Labour Economics*, 2010): white male college graduates who entered the labor market in the early-1980s recession suffered persistent wage losses - roughly **6–7% lower initial wages per 1-percentage-point rise in unemployment at graduation**, with losses of ~2.5% still visible **15 years later**; related literature puts cumulative losses at 6–9% of annual earnings persisting a decade-plus. Graduation year = pure luck, measurable career damage.

Sources: Sloww.co and Conversable Economist (Nov 2022) on the ovarian lottery; Schroeder, *The Snowball* (2008); Milanovic interviews (Politikum; Demos; IMF F&D March 2019); Chetty et al. NBER w24062/QJE 2019; Brookings "Lost Einsteins" slides (Dec 2017); Chetty et al. *Science* 2017 / Opportunity Insights; Kahn (2010) via Econofact "Lasting Scars from Graduating in a Recession."

---

## 5. Timing and compounding: the Matthew effect

**Origin.** Sociologist **Robert K. Merton (1968, *Science*)** coined the "Matthew effect" (from Matthew 25:29 - "to everyone who has, more will be given") to describe cumulative advantage in science: famous scientists get disproportionate credit, which brings grants, students, and more fame.

**Relative age effect in hockey (the classic illustration).** Psychologist **Roger Barnsley (1985)** noticed elite Canadian hockey rosters were dominated by January–March birthdays. With a January 1 age cutoff, a boy born January 2 competes against boys nearly a year younger - bigger, faster, more coordinated at age 9 - so he's selected for all-star teams, gets more ice time, better coaching, tougher competition, and the small initial (random) advantage compounds. In the Ontario Junior Hockey League Barnsley found **roughly 5x as many players born in January as in November**; the pattern held for elite 11–13-year-olds and the NHL. Popularized in Malcolm Gladwell's *Outliers* (2008), ch. 1. Same mechanism documented in European soccer academies and in school cohorts (oldest-in-class kids more likely to be labeled "gifted").

**Silicon Valley 1955.** Gladwell's second timing example: **Bill Gates (Oct 28, 1955), Steve Jobs (Feb 24, 1955), Paul Allen (1953), Eric Schmidt (1955), Bill Joy (1954)** - old enough to be in their early 20s at the 1975 dawn of personal computing, young enough not to be settled at IBM. Gates's extra edge: **Lakeside School's Mothers' Club bought a computer terminal in 1968** (an ASR-33 Teletype linked to a Seattle mainframe) when most universities lacked one, giving 13-year-old Gates thousands of practice hours almost no teenager on Earth could get. Gates himself: "I had a better exposure to software development at a young age than I think anyone did in that period of time, and all because of an incredibly lucky series of events."

**Kahneman's formula.** Daniel Kahneman, *Thinking, Fast and Slow* (2011): "**Success = talent + luck. Great success = a little more talent + a lot of luck.**" Also implies regression to the mean: extreme outcomes are extreme partly because of extreme luck, which doesn't repeat.

Sources: Merton, *Science* 159:56-63 (1968); Barnsley et al. (1985) via Wikipedia "Relative age effect" and Frontiers in Sports & Active Living (2021); Gladwell, *Outliers* (2008); MeasuringU "Were most software millionaires born around 1955?"; Kahneman (2011).

---

## 6. Locus of control (Rotter, 1966) - the agency evidence

**The construct.** **Julian Rotter (1966)**, "Generalized expectancies for internal versus external control of reinforcement," *Psychological Monographs* 80(1) - one of the most-cited papers in psychology. **Internal locus**: outcomes depend mainly on my own actions. **External locus**: outcomes depend on luck, fate, powerful others.

**Evidence internals do better:**
- **Ng, Sorensen & Eby (2006)**, *Journal of Organizational Behavior* 27:1057-1087, meta-analysis (135+ studies): internal locus of control positively associated with job satisfaction, job performance, motivation, and well-being; externals respond worse to job stress.
- **Gale, Batty & Deary (2008)**, *Psychosomatic Medicine*, using the **1970 British Cohort Study (n=11,563 children tested at age 10; 7,551 followed to age 30)**: children with more internal locus at age 10 had, at 30, lower risk of obesity (OR ≈ 0.86 per SD), overweight (0.87), poor self-rated health (0.89), and psychological distress (0.86) - effects independent of childhood IQ.
- Employed vs unemployed youth differ on internality with a medium-to-large effect (Cohen's d ≈ 0.62 in one study).

**Caveats (be honest):**
- Almost all of this is **correlational**; success also *causes* internality (win a few times and you'll believe you control outcomes). Twin studies (e.g., Australian twin data, *Journal of Economic Behavior & Organization*, 2020) show locus of control is partly heritable and fairly stable in adulthood, so it's not a free dial you simply turn.
- Extreme internality can be harmful: blaming yourself for genuinely uncontrollable events (illness, layoffs, recessions) breeds guilt and depression. The healthy version is internality about *behavior*, realism about *outcomes*.
- Related agency constructs have replication baggage the chapter should flag: **grit** (Credé, Tynan & Harms 2017 meta-analysis, 88 samples, n=66,807: modest correlation with performance, largely redundant with conscientiousness); **growth mindset** (Sisk et al. 2018, 129 studies: mindset explains ~1% of achievement variance; intervention d ≈ 0.08, though targeted interventions for at-risk students show small benefits - Yeager et al. 2019 national study, ~0.1 grade-point effect for lower achievers). Original claims were oversold; small real effects for some groups remain.

**Bandura's self-efficacy (1977, 1997)** is the mechanism argument: belief in one's capability is "the foundation of human agency" - people who believe they can act set bigger goals, persist longer, and recover faster from setbacks; Bandura explicitly endorsed *slightly* optimistic self-belief ("if not unrealistically exaggerated") as adaptive.

Sources: Rotter (1966); Ng/Sorensen/Eby (2006) JSTOR 4093903; Gale/Batty/Deary (2008) PubMed 18480188; Credé et al. (2017) PubMed 27845531; Sisk et al. (2018) *Psychological Science*; Bandura via APA "Self-efficacy: the theory at the heart of human agency."

---

## 7. Making your own luck - Wiseman

**Richard Wiseman, *The Luck Factor* (2003)**, University of Hertfordshire: ~10 years studying **400+ self-described lucky and unlucky people**. Famous **newspaper experiment**: participants counted photos in a newspaper; page 2 contained a half-page notice in giant type: "**STOP COUNTING - THERE ARE 43 PHOTOGRAPHS IN THIS NEWSPAPER**" (a second insert offered £250 for spotting it). "Lucky" people tended to spot it in seconds; "unlucky" people, more anxious and narrowly focused, ground through the whole count. Wiseman's four principles: lucky people (1) maximize chance opportunities (open, sociable, relaxed - anxiety narrows attention), (2) listen to hunches, (3) expect good fortune (persist), (4) reframe bad luck ("counterfactual downward comparison"). His "luck school" training reportedly left ~80% of participants happier and feeling luckier. Caveat: small samples, self-report, pop-science framing - treat as suggestive, but it's the best experimental bridge between "luck is real" and "behavior changes your exposure to luck."

Source: Wiseman, *The Luck Factor* (2003); *Scientific American* "As Luck Would Have It"; successpodcast.com interview.

---

## 8. The practical resolution: outcomes are luck-influenced; behavior is 100% yours

**Stoic dichotomy of control.** Epictetus, *Enchiridion* (c. 125 AD), opening line: "Some things are within our power, others are not. Within our power are opinion, motivation, desire, aversion... not within our power are our body, property, reputation, status." The original outcome/behavior split.

**Covey's circles.** Stephen Covey, *The 7 Habits of Highly Effective People* (1989): **Circle of Concern** (everything you care about - economy, other people's opinions, the past) vs **Circle of Influence** (what you can actually affect). Proactive people spend energy in the influence circle, and it *expands*; reactive people fixate on the concern circle, and their influence *shrinks*. Modern versions add an inner **Circle of Control** (your thoughts, decisions, actions, responses).

**The synthesis for the chapter** (process over outcomes):
- Luck is real and large (Milanovic: ~80% of income fixed at birth globally; Frank/Pluchino: luck picks winners among the talented). Personal agency is also real and measurable (locus of control, self-efficacy, Wiseman's exposure-to-luck behaviors).
- Resolution: **judge yourself by inputs (behavior, process, effort - controllable), not outputs (outcomes - luck-contaminated).** Poker player Annie Duke (*Thinking in Bets*, 2018) calls judging decisions by outcomes "**resulting**"; in luck-heavy domains a good decision can lose and a bad one can win.
- **Believing in agency is instrumentally useful even though luck is real**: internals try more, persist longer, and expose themselves to more lucky events (each attempt is a lottery ticket; effort buys tickets even if it can't rig the draw). Conversely, *acknowledging* luck is useful too - it produces gratitude, humility, compassion for the unlucky, and protects against survivorship-biased strategy copying.
- Two errors to avoid: (a) "It's all merit" → arrogance, bad advice, contempt for the unlucky; (b) "It's all luck" → learned helplessness, zero tickets bought.

**Changeable vs fixed success factors (rough ledger for the book):**
- **Fixed / lottery**: country of birth, parents' wealth and education, era and cohort, genes (IQ heritability rises to ~0.6–0.8 in adulthood; height; temperament baseline), birth month vs cutoffs, macro events (recessions, pandemics).
- **Sticky but movable**: skills and knowledge (deliberate practice works, though Macnamara et al. 2014 meta-analysis found practice explains ~12% of performance variance overall, ~26% in games, ~1% in professions - the "10,000-hour rule" is a Gladwell simplification Ericsson himself disowned), network, location (moving is one of the highest-leverage legal "luck hacks" - Chetty's Moving to Opportunity follow-up (2016): children who moved to lower-poverty areas before age 13 earned ~31% more as adults), credentials, health habits, personality (Big Five shifts modestly with age and deliberate effort).
- **Fully yours, today**: number of attempts, effort per attempt, response to setbacks, what you practice, who you ask, whether you show up, how you interpret failure.

Sources: Epictetus, *Enchiridion*; Covey (1989); Duke (2018); Macnamara/Hambrick/Oswald (2014) *Psychological Science*; Chetty/Hendren/Katz (2016) *American Economic Review*; positivepsychology.com "Circles of Influence."

---

## 9. Story bank (2–3 vivid examples per concept)

1. **Frank's tennis-court cardiac arrest** - an economist of luck saved by a coincidentally nearby ambulance (2% survival odds).
2. **The 0.61-talent tycoon** - in the Catania simulation, the richest agent was almost exactly average in talent; the most talented finished near the bottom.
3. **Wald's missing bullet holes** - armor the places without holes (plus the honesty footnote that the anecdote is polished legend around a real method).
4. **Buffett's genie** - design the world before you know which body you'll be born into; Buffett: 30-to-1 against being born American.
5. **January hockey players** - 5x more January than November births in Ontario junior hockey; a calendar cutoff manufactures "talent."
6. **The Lakeside terminal, 1968** - a mothers' rummage sale buys teenage Bill Gates a head start almost no one on Earth had.
7. **43 photographs** - Wiseman's newspaper: the "lucky" saw the giant answer on page 2; the anxious counted every photo.
8. **Class of 2009 vs class of 2005** - identical resumes, ~6–7% wage gap per point of unemployment at graduation, scars visible 15 years on (Kahn).
9. **Lost Einsteins** - a poor third-grader who's brilliant at math is far less likely to patent than a mediocre-at-math rich kid.
10. **Resulting at the poker table** - Annie Duke: the worst players judge every decision by the last river card.

## 10. Suggested chapter throughline

Open with Frank's cardiac arrest or the bomber story → establish luck is bigger than it feels (Frank simulation, Pluchino numbers, Kahneman's formula) → the birth lottery ladder: planet-level (Milanovic 60%), family-level (IGE 0.5, Lost Einsteins), era/timing (Fading American Dream, Kahn, hockey birthdays, 1955) → the trap both ways (survivorship-biased advice vs learned helplessness) → evidence agency still pays (Rotter/Ng/Gale, Bandura, Wiseman) → the resolution: dichotomy of control, circles, "resulting," buy more tickets → the changeable-vs-fixed ledger as the actionable close.
