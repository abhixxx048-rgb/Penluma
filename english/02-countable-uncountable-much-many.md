# 02 — Countable vs uncountable: much / many / few / less / fewer

*What this fixes for you: you wrote "so much mistake" when you meant "so many mistakes." This doc makes that choice automatic, so your commits, PRs, and standups stop leaking that one tell.*

## The rule in 30 seconds

- **Countable** nouns are things you can count one-by-one: one bug, two bugs, three commits. They take a plural **-s** and pair with **many / few / fewer / a number of**.
- **Uncountable** nouns are stuff you measure, not count: code, feedback, work, progress. They have **no plural -s** and pair with **much / little / less / an amount of**.
- Quick test: can you put a number in front of it? "Three bugs" ✅ → countable. "Three codes" ❌ → uncountable (say "three lines of code").
- Your flagship fix: **"so much mistake" → "so many mistakes."** A mistake is countable, so it needs **many** and the **-s**.

## Why this trips you up

In your daily writing you reach for **much** by default and you drop the plural **-s** ("so much mistake," "few bug left"). Many languages don't mark countability the way English does, so the habit is invisible to you. The fix isn't memorizing a list — it's running the 30-second number test before you pick *much* or *many*.

## See it / fix it

| ❌ What you tend to write | ✅ Correct | Why |
|---|---|---|
| i am making so much mistake | I'm making so many mistakes. | *Mistake* is countable → **many** + plural **-s**. (Also: capital *I*, full stop.) |
| there is too much bug in this build | There are too many bugs in this build. | Countable → **many bugs**; plural subject takes **are**. |
| i wrote so much code today | I wrote so much code today. | *Code* is uncountable → **much** is correct, no **-s**. (Just fix the lowercase *i*.) |
| got few feedbacks on the PR | I got some feedback on the PR. | *Feedback* is uncountable → no **-s**, and use **a little / some**, not **few**. |
| less commits this sprint | Fewer commits this sprint. | Countable → **fewer**, not **less**. |
| we have much open tickets | We have many open tickets. | Countable → **many**, not **much**. |
| there is many duplicate code | There is a lot of duplicate code. | *Code* is uncountable → **a lot of / much**, not **many**; verb stays **is**. |
| i did a lot of researches on grammer | I did a lot of research on grammar. | *Research* is uncountable (no **-s**); spelling: *research*, *grammar*. |
| only little tests are failing | Only a few tests are failing. | Countable → **a few**; **little** is for uncountable. |
| how much files did u change | How many files did you change? | Countable → **many**; spell out *you*; it's a question → **?**. |

## Patterns to remember

**The pairing table — never mix the columns:**

| Countable (count them) | Uncountable (measure it) |
|---|---|
| many bugs | much code |
| few / a few tests | little / a little time |
| fewer commits | less work |
| a number of files | an amount of data |
| too many tickets | too much feedback |

**Mnemonic:** *Many = manys → things you can count get the plural -s. Much = mush → stuff you can't pull apart.*

**`few` vs `a few` (and `little` vs `a little`):**
- *few / little* = almost none, a complaint. "Few tests cover this." (bad)
- *a few / a little* = some, a positive amount. "A few tests cover this." (fine)

**`less` vs `fewer` (the one reviewers notice):**
- **fewer** + countable plural: "fewer merge conflicts."
- **less** + uncountable: "less downtime."
- Cheat: if the noun ends in **-s**, you almost always want **fewer**.

## In your daily writing

- **Commit messages:** "Fix many flaky tests" not "Fix much flaky test." "Remove unused code" (uncountable, no -s).
- **PR titles:** "Resolve fewer-than-expected conflicts" — and "Reduce duplicate code," never "reduce duplicate codes."
- **Standups (Slack):** "I closed three bugs and got some feedback on the design." Count the bugs, measure the feedback.
- **Code review comments:** "There are too many responsibilities in this class" (countable) vs "This adds too much complexity" (uncountable).
- **Bug reports:** "Steps produce many errors in the console" — errors are countable, so plural **-s**.

A fast self-check before you hit send: find every *much / many / few / little / less / fewer*, then ask **"can I count this noun?"** If yes, you want *many / few / fewer* + **-s**. If no, you want *much / little / less*.

## Drills

Fix, fill, or choose. No answers here — scroll to the key after you try.

1. Fix: `i am making so much mistake in my commit message`
2. Fix: `there is too much bug in the login flow`
3. Choose: We need (less / fewer) database queries on this page.
4. Fill: I got a lot of ______ (feedback / feedbacks) on the pull request.
5. Choose: How (much / many) files does this migration touch?
6. Fix: `we wrote less tests this sprint than last sprint`
7. Fill: There is too ______ (much / many) duplicate code in this module.
8. Choose: Only (a little / a few) edge cases are still failing.
9. Fix: `i did a lot of researches on grammer before the refactor`
10. Fill: This release ships with ______ (fewer / less) bugs and ______ (fewer / less) downtime.
11. Choose: The API returns (much / a lot of) data, so paginate it.
12. Fix: `how much commits are in this PR`

---

## Answer key

1. **I'm making so many mistakes in my commit messages.** — *mistake* is countable → **many** + **-s**; capital *I*; messages plural too.
2. **There are too many bugs in the login flow.** — countable → **many bugs**; plural subject → **are**.
3. **fewer** — *queries* is countable (ends in -s) → **fewer**, not *less*.
4. **feedback** — uncountable → no **-s**.
5. **many** — *files* is countable → **many**.
6. **We wrote fewer tests this sprint than last sprint.** — *tests* is countable → **fewer**, not *less*; capital *W*.
7. **much** — *code* is uncountable → **much**.
8. **a few** — *edge cases* is countable → **a few**, not *a little*.
9. **I did a lot of research on grammar before the refactor.** — *research* is uncountable (no **-s**); spelling *research* and *grammar*; capital *I*.
10. **fewer** bugs and **less** downtime. — *bugs* countable → **fewer**; *downtime* uncountable → **less**.
11. **a lot of** — both work, but *much data* sounds formal; **a lot of data** is the natural dev phrasing. (Never *many data*.)
12. **How many commits are in this PR?** — *commits* is countable → **many**; question → **?**.

*Part of the Developer English course — see [00-index.md](./00-index.md).*
