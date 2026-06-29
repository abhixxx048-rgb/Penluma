# 08 — Sentence structure: run-ons, fragments & comma splices

*What this fixes for you: your habit of writing one long sentence with no full stops, so your commits, PRs, and Slack messages read clearly the first time — no re-reading needed.*

## The rule in 30 seconds

- A **complete sentence** has three things: a **subject** (who/what), a **verb** (the action), and a **complete thought** (it can stand alone). Example: "The build failed."
- **Run-on** = two complete sentences jammed together with no break: "the build failed i pushed a fix". Wrong.
- **Comma splice** = two complete sentences joined by *only* a comma: "the build failed, i pushed a fix". Still wrong — a comma is too weak to glue two sentences.
- You have **four legal ways** to join or separate them: a full stop `.`, a semicolon `;`, a comma + conjunction (`and / but / so`), or a subordinating word (`because / when / after / if`).

## Why this trips you up

You chain everything into one breathless line and drop every full stop — exactly like your real message: *"can u do reaseach on grammer for me and teach me i already know but as of now i am making so much mistake."* That is three or four sentences with no breaks, no capitals, and a couple of spelling and count errors riding along. In code you break logic into small functions; do the same with sentences — one idea per sentence, then stop.

## See it / fix it

| ❌ What you tend to write | ✅ Correct | Why |
|---|---|---|
| `the build failed i pushed a fix` | `The build failed. I pushed a fix.` | Run-on. Two thoughts → two sentences. Capital `I`, full stops added. |
| `the tests pass, the deploy is green` | `The tests pass. The deploy is green.` | Comma splice — a comma can't join two sentences. Use a full stop. |
| `i refactored the service it is faster now` | `I refactored the service, and it is faster now.` | Run-on. Comma + `and` joins two complete thoughts. |
| `we hit a 429, we should add a retry` | `We hit a 429, so we should add a retry.` | Comma splice. Add `so` to show the cause → effect. |
| `cache was stale users saw old prices` | `Cache was stale, which made users see old prices.` | Run-on. A subordinate clause (`which…`) attaches the second idea. |
| `merged the PR` (as a standalone Slack line) | `I merged the PR.` | Fragment — missing the subject. Add `I`. |
| `because the token expired` (alone) | `The request failed because the token expired.` | Fragment — a `because` clause can't stand alone; attach it to a full sentence. |
| `i already know but as of now i am making so much mistake` | `I already know it, but right now I'm making so many mistakes.` | Run-on + count error: `mistake` is countable → `so many mistakes`. Comma + `but`. |
| `can u do reaseach on grammer` | `Can you do research on grammar?` | Texting + spelling: `u→you`, `reaseach→research`, `grammer→grammar`; it's a question → `?`. |
| `open pull request when ready it will trigger CI` | `Open a pull request when ready; it will trigger CI.` | Missing article `a`; run-on fixed with a semicolon (two related thoughts). |

## Patterns to remember

The four fixes — pick one when you have two complete sentences:

| Fix | Looks like | Use when |
|---|---|---|
| **Full stop** | `It failed. I fixed it.` | The two ideas are independent. Safest default — use this most. |
| **Semicolon** | `It failed; I fixed it.` | The ideas are closely linked and you want them in one line. |
| **Comma + conjunction** | `It failed, so I fixed it.` | You want to show the relationship: `and` (add), `but` (contrast), `so` (result). |
| **Subordinate clause** | `Because it failed, I fixed it.` | One idea depends on the other: `because / when / after / if / which`. |

Mnemonics:
- **"Two verbs, two subjects → needs a join or a stop."** If you can split the line into two standalone sentences, you must use one of the four fixes between them.
- **"A comma is not glue."** A comma alone never joins two sentences. It always needs a conjunction (`, and` / `, but` / `, so`).
- **Fragment test:** read the chunk out loud alone. If it leaves you waiting for more ("Because the token expired…"), it's a fragment — attach it.

## In your daily writing

- **Commit messages:** one line, one idea. `Fix stale cache so users see current prices` beats `fixed cache it was stale users saw old prices`.
- **PR descriptions:** write short sentences, each ending in a full stop. Reviewers scan; a wall of run-on text gets skimmed and bugs get missed.
- **Slack standups:** `Yesterday I finished the retry logic. Today I'm on the 429 handler. No blockers.` — three clean sentences, not one chain.
- **Code comments:** `// Token can expire mid-request, so we refresh before retrying.` — comma + `so` shows cause. Avoid `// token expired refresh and retry it works now`.
- **Bug reports:** separate *what happened* from *what you expected*. `The export returns an empty file. I expected the full order list.` Two sentences, instantly clear.

## Drills

Fix or choose. Don't peek at the answer key until you've tried each.

1. Fix: `the migration ran it dropped the wrong column we need a rollback`
2. Fix: `i opened the PR, the CI is still running`
3. Choose A or B: (A) `The cache was cold, so the first request was slow.` (B) `The cache was cold, the first request was slow.`
4. Fill the blank with the best join: `The API returned 500 ___ the database connection timed out.` (`. / ; / because`)
5. Fix the texting + run-on: `can u review my pr i think its ready but tests are flaky`
6. Is this a complete sentence, a fragment, or a run-on? `Restarting the worker queue.`
7. Fix: `we shipped the feature flag off by default users wont see it yet`
8. Choose A or B: (A) `I rebased onto main but there were conflicts.` (B) `I rebased onto main, but there were conflicts.`
9. Fix the count + run-on: `i made so much mistake in this commit i will clean it up`
10. Fill the blank: `___ the token expired, the request failed.` (`Because / But / So`)
11. Fix: `deploy is green metrics look normal closing the incident`
12. Fix the article + comma splice: `open pull request, it triggers the build`

---

## Answer key

1. `The migration ran. It dropped the wrong column, so we need a rollback.` — Split the first run-on with a full stop; join the cause/result with `, so`.
2. `I opened the PR. The CI is still running.` — Comma splice fixed with a full stop. Also capitalize `I`.
3. **A.** `, so` correctly joins two complete sentences. B is a comma splice (comma alone can't join them).
4. `because` (or a full stop): `The API returned 500 because the database connection timed out.` — The second clause explains the first, so `because` reads best; `.` also works.
5. `Can you review my PR? I think it's ready, but the tests are flaky.` — `u→you`, `its→it's` (it is), question mark, and `, but` joins the contrast.
6. **Fragment** — no subject or finished thought. Fix: `I'm restarting the worker queue.`
7. `We shipped the feature. The flag is off by default, so users won't see it yet.` — Break the run-on; `, so` shows the result. Note `won't` with the apostrophe.
8. **B.** When `but` joins two complete sentences ("I rebased onto main" + "there were conflicts"), put a comma before it. A is missing the comma.
9. `I made so many mistakes in this commit. I'll clean it up.` — `mistake` is countable → `so many mistakes` with the plural `-s`; split the run-on with a full stop.
10. `Because` — `Because the token expired, the request failed.` The clause sets up the cause; note the comma after the opening subordinate clause.
11. `Deploy is green. Metrics look normal. I'm closing the incident.` — Three separate thoughts → three sentences (the last needs a subject, `I'm`).
12. `Open a pull request; it triggers the build.` — Add the article `a`; replace the comma splice with a semicolon (closely linked ideas) or a full stop.

*Part of the Developer English course — see [00-index.md](./00-index.md).*
