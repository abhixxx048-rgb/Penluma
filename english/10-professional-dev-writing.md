# 10 — Professional dev writing: commits, PRs, Slack, comments

*What this fixes for you: this is the capstone. It takes every grammar rule from the earlier lessons and applies it to the things you actually type all day — commit messages, pull requests, code review comments, Slack standups, code comments, and emails. Get these right and your work reads as senior, no matter your accent or first language.*

## The rule in 30 seconds

- **Commits:** imperative mood, capitalized first word, no period at the end of the subject line. *"Fix null guard on checkout"* — not *"fixed the null guard."* or *"fixes null"*.
- **PRs, comments, Slack, docs:** write **complete sentences** — capital letter at the start, full stop at the end, no texting shortcuts (`u`, `ur`, `pls`).
- **Be specific, not blunt:** in reviews, say what's wrong *and* suggest the fix. *"This throws when input is null"* beats *"this wrong."*
- **Code comments and docstrings:** **present tense**, full sentence. *"Returns the cached price."* — not *"return cached price"* or *"this is returning..."*

## Why this trips you up

You're a fast typist under deadline, so texting habits leak into work writing — lowercase `i`, `u` for *you*, no full stops, and long run-on sentences that chain clauses with no commas. You also tend to drop the small words: articles (`open pull request` instead of *open **a** pull request*) and plural `-s` (*"so much mistake"* instead of *"so **many** mistake**s**"*). None of these break the build, but together they make solid engineering work look unpolished. The fixes are mechanical — once you see the pattern, you stop making the mistake.

## See it / fix it

| ❌ What you tend to write | ✅ Correct | Why |
|---|---|---|
| `fixed the bug in cart` | `Fix cart total when quantity is zero` | Commit subject: imperative mood, capitalized, specific, no period. |
| `Update readme.` | `Update README with setup steps` | Drop the trailing period in the subject; say *what* changed. |
| `i opened pull request for review` | `I opened a pull request for review.` | Capital `I`; add the article `a`; end with a full stop. |
| `this wrong` (review comment) | `This looks like it will throw when input is null — should we guard it?` | Complete sentence, names the problem, suggests a fix politely. |
| `u need to handle ur error here` | `You need to handle your error here.` | No texting (`u`/`ur`); capital first word; full stop. |
| `i did reaseach on the grammer issue` | `I did research on the grammar issue.` | Spelling: *research*, *grammar*; capital `I`. |
| `there is so much mistake in this PR` | `There are so many mistakes in this PR.` | Countable noun: *many mistakes*; verb agrees (*are*). |
| `// return cached price` | `// Returns the cached price.` | Code comment: present tense, full sentence, capitalized. |
| `standup: did login fix, doing cart, blocked on api` | `Yesterday I finished the login fix. Today I'm working on the cart. I'm blocked on the API.` | Full sentences with punctuation read as a clear update. |
| `plan grammar docs for as per that` | `I'll plan the grammar docs based on that.` | Fix word order and the awkward *"for as per that"*. |
| `pls review when u get time thanks` | `Please review when you get a chance. Thanks!` | No `pls`/`u`; add the article; clean sign-off. |
| `error: cannot process` (error message) | `Could not process the file. Please try again.` | User-facing text: complete sentence, plain-language recovery. |

## Patterns to remember

**The commit subject formula:** `<Verb in imperative> <what> [<where/condition>]`
- Test: the subject should finish the sentence *"If applied, this commit will…"*. → *"…Fix cart total when quantity is zero."* ✅
- Imperative verbs to start with: **Add, Fix, Remove, Update, Refactor, Rename, Bump, Document, Revert.**
- ❌ `Added`, `Fixes`, `Fixing`, `fix` → ✅ `Add`, `Fix` (capitalized, base form).
- No period at the end of the **subject**. Periods are fine in the **body**.

**Commit body (after a blank line):** explain *why*, in full sentences. The diff already shows *what* changed; the body should answer *why* it needed changing.

**Much vs many (your recurring one):**

| Uncountable → `much` | Countable → `many` |
|---|---|
| much code, much work, much progress | many bugs, many mistakes, many tests |
| much feedback, much research | many commits, many endpoints, many files |

If you can put a number in front of it (*3 bugs*), it's countable → use **many** and add the `-s`.

**Articles in one line:** use **a/an** for one unspecified thing (*open **a** PR*), **the** for a specific known thing (*merge **the** PR you opened*). When in doubt with a singular countable noun, it almost always needs *a*, *an*, or *the* in front.

**Spelling watchlist:** grammar (not *grammer*), research (not *reaseach*), separate, definitely, occurred, received, environment, length.

## In your daily writing

- **Commits:** one imperative line under ~50 characters, capitalized, no period. If the *why* isn't obvious, add a blank line and a body in full sentences.
- **PRs:** the **title** is a commit-style summary. The **description** answers three questions in complete sentences: **What** does this change? **Why** is it needed? **How** did you do it (and how can a reviewer test it)?
- **Code review comments:** never just *"wrong"* or *"no."* State the issue, then propose a path: *"This will fail for empty arrays — can we default to `[]`?"* Questions feel collaborative; commands feel harsh.
- **Slack / standup:** treat it like a short report, not a text to a friend. Capital letters, full stops, no `u`/`ur`. Three sentences: yesterday, today, blockers.
- **Code comments & docstrings:** present tense, full sentence, describe behavior. *"Validates the upload and returns the relative path."*
- **Emails:** greeting (*Hi Sarah,*) → one clear ask → sign-off (*Thanks, Pravin*). Don't bury the request in the middle.

## Drills

1. Rewrite as a proper commit subject: `fixed the issue where login was failing sometimes.`
2. Rewrite as a proper commit subject: `adding new endpoint for invoices`
3. Fix this sentence: `i think there is so much bug in this function we should add test.`
4. Fix the review comment so it's polite and specific: `this wrong, change it`
5. Fix the Slack message: `done with cart, starting checkout now, blocked on payment gateway`
6. Choose A or B: We should (A) *open pull request* / (B) *open a pull request* before merging.
7. Fix spelling and capitalization: `i did reaseach on the grammer rules and made a doc.`
8. Rewrite as a present-tense code comment: `// this is checking if the user is logged in`
9. Fill the blank with *much* or *many*: There were too ______ failing tests to release today.
10. Fill the blank with *much* or *many*: We don't have ______ time before the deadline.
11. Polish this email line into a greeting + clear ask + sign-off: `pls deploy the branch when u can thanks`
12. Fix the run-on into clean sentences: `i opened the PR it has the cart fix and the null guard can u review it today.`

---

## Answer key

1. **`Fix intermittent login failure`** — imperative verb, capitalized, specific, no trailing period.
2. **`Add invoices endpoint`** — imperative *Add* (not *adding*); concise; no period.
3. **`I think there are so many bugs in this function. We should add tests.`** — capital `I`; countable *many bugs*; verb *are*; full stop splits the run-on; plural *tests*.
4. **`This looks wrong to me — I think it breaks when the list is empty. Could we guard it?`** — names the problem, suggests a fix, stays polite with a question.
5. **`Yesterday I finished the cart. Today I'm starting checkout. I'm blocked on the payment gateway.`** — three full sentences, capitalized, punctuated; adds *the*.
6. **B** — *open **a** pull request*; a singular countable noun needs an article.
7. **`I did research on the grammar rules and made a doc.`** — spelling *research* and *grammar*; capital `I`; article *the*.
8. **`// Checks whether the user is logged in.`** — present tense, full sentence, capitalized; drop the wordy *"this is checking."*
9. **many** — *tests* are countable, so *too many*.
10. **much** — *time* is uncountable, so *not much time*.
11. **`Hi [name], could you deploy the branch when you get a chance? Thanks, Pravin`** — greeting, clear ask as a polite question, sign-off; no `pls`/`u`.
12. **`I opened the PR. It has the cart fix and the null guard. Could you review it today?`** — split into three sentences; capital `I`; `you` not `u`; the last clause becomes a polite question.

---
*Part of the Developer English course — see [00-index.md](./00-index.md).*
