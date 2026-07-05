I have comprehensive, well-sourced material. Here is the research brief.

## Key concepts (plain definitions)

- **Spacing effect / distributed practice:** You remember more when study sessions are spread out over time than when crammed ("massed") together. First documented by **Hermann Ebbinghaus (1885)** with his forgetting curve.
- **Spaced repetition:** A deliberate system that schedules reviews of each item just before you're likely to forget it, so each review "resets" the forgetting curve to decay more slowly.
- **Retrieval practice (active recall):** Actively pulling an answer from memory (as with a flashcard) rather than rereading. Spaced repetition combines spacing + retrieval, the two techniques Dunlosky rated highest.
- **Leitner box system:** A physical implementation using ~3–5 boxes. Correctly-recalled cards move to a higher box reviewed less often; missed cards drop back to Box 1 (reviewed daily). Invented by German journalist **Sebastian Leitner** in his 1972 book *So lernt man lernen* ("How to Learn to Learn").
- **SM-2 / SuperMemo:** The 1987 algorithm by **Piotr Woźniak** that computers use to automate the Leitner idea with per-card intervals and an "ease factor."
- **Ease factor (EF):** A per-card multiplier (SM-2 range 1.3–2.5, default 2.5) that governs how fast intervals grow.
- **Cloze deletion:** A fill-in-the-blank card ("The capital of France is [...]").
- **Leech:** A card you keep failing repeatedly; Anki auto-flags/suspends it.

## Studies & evidence (author, year, finding, numbers)

- **Cepeda, Pashler, Vul, Wixted & Rohrer (2006),** *Psychological Bulletin* - Meta-analysis of **839 comparisons across 317 experiments in 184 articles**. Spaced practice beat massed practice in **~96% of studies**; spacing raised recall from roughly **47% (massed) to 61% (spaced)** on average. Key rule: the optimal gap grows with how long you need to remember.
- **Cepeda et al. (2008),** *Psychological Science* - Tested gaps up to 105 days with 1,354 people. Optimal gap ≈ **10–20% of the retention interval** (want to remember 1 year → review roughly monthly).
- **Karpicke & Roediger (2007),** *JEP:LMC*, 33(4):704–719 - Expanding intervals gave a short-term edge (10 min later), but **equally-spaced retrieval won at 2 days.** Conclusion: the *placement and difficulty of the first retrieval* matters more than the expanding shape itself.
- **Bahrick, Bahrick, Bahrick & Bahrick (1993),** *Psychological Science* - 9-year study of Spanish vocab. **13 sessions spaced 56 days apart matched 26 sessions spaced 14 days apart** - half the work, equal retention - with recall measured 1–5 years later.
- **Woźniak (1990),** master's thesis "Optimization of Learning" - published SM-2 openly, seeding Anki, Mnemosyne, etc. EFs vary 1.3–2.5; default 2.5 produces canonical intervals of **1 day, 6 days, then ×EF.**
- **Dunlosky, Rawson, Marsh, Nathan & Willingham (2013),** *Psychological Science in the Public Interest* - Rated 10 techniques; **distributed practice and practice testing were the only two rated "high utility."**
- **Deng, Gluckstein & Larsen (2015),** *Medical Education* - Medical students: dose-response link between Anki use and **USMLE Step 1** - roughly **every ~1,700 flashcards reviewed ≈ +1 Step 1 point.**

## Myths / contested points (with honest nuance)

- **"Expanding intervals are strictly best."** Woźniak's default schedule expands, but Karpicke & Roediger (2007) showed equal spacing can beat expanding for durable memory. The honest takeaway: *any* real spacing crushes massing; the exact schedule shape matters far less than doing it at all. Modern **FSRS** (now Anki's default) uses your history to predict forgetting rather than fixed multipliers.
- **"Anki grows your knowledge."** Correlational medical-school studies (Deng 2015; Wothe et al. 2023) find associations, not proof - hard-working students self-select into Anki. Effects are real but modest and confounded.
- **"SRS lets you memorize anything."** It's excellent for facts/associations, weak for *understanding, reasoning, and skills.* Woźniak's own rule #1: "Do not learn if you do not understand."
- **"Ease hell is the algorithm's fault."** Partly a design quirk of SM-2 (repeated lapses crater the ease factor so a known card recurs forever) - but usually caused by *bad cards*, not bad math.

## Real-world examples & analogies

- **Analogy - watering a plant:** Spacing is like watering on a schedule that stretches as roots deepen. Drown it all at once (cramming) and most runs off; space it out and it takes hold.
- **Analogy - the Leitner conveyor belt:** Cards ride a conveyor of boxes. Get one right, it moves further down the line (seen less often); miss it, it falls back to the start.
- **Woźniak's own story:** A frustrated Poznań biochem student turned himself into a memory test-subject in the 1980s, logged years of his own recall data, and built SuperMemo from it - the origin of every modern SRS app.
- **Medicine:** Shared Anki decks like "AnKing" (built on First Aid) are now near-standard among US med students grinding tens of thousands of cards for USMLE boards.

## Practical how-to points

- **Follow the minimum information principle:** one fact per card. Break lists into cloze cards; enumerations are memory poison.
- **Understand first, then memorize** (Woźniak rules #1–2).
- **Use cloze deletion and images** - pictures and fill-in-blanks are faster to make and easier to recall.
- **Answer honestly** (Again/Hard/Good/Easy); gaming "Easy" to clear the queue destroys scheduling.
- **Trust the schedule, review daily.** Skipping days causes review pile-ups, the #1 reason people quit.
- **Set a realistic budget:** a mature ~200-new-card language deck settles to ~20–40 min/day; expect several seconds per card.
- **Tackle leeches:** rewrite or delete a card you've failed 8+ times rather than re-suffering it.

## Common mistakes learners make on this topic

- **Cramming disguised as SRS** - reviewing a huge batch the night before, defeating spacing.
- **Overstuffed cards / huge lists** on one card (violates minimum-information principle → constant lapses).
- **Adding too many cards** (500+ new/day), creating an unsustainable review debt and burnout.
- **Memorizing without understanding** - orphaned facts that never stick.
- **Ignoring leeches**, letting a few bad cards devour review time.
- **Abandoning the app after a backlog** builds up during a missed week.
- **Obsessing over the "perfect" algorithm/settings** instead of just writing good cards and showing up daily.
