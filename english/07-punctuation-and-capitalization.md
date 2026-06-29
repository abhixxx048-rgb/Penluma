# 07 — Punctuation & capitalization basics

*What this fixes for you: the lowercase "i", the missing full stops, and the run-on sentences that make your commits and Slack messages read as rushed. Small marks, big difference in how senior your writing looks.*

## The rule in 30 seconds

- Start every sentence with a **capital letter**, and always write **I** (the word for yourself) as a capital — never `i`.
- End every sentence with a **closing mark**: `.` for a statement, `?` for a question, `!` for strong emphasis (use `!` rarely at work).
- **Capitalize proper nouns** — names of people, products, and tools: `GitHub`, `Slack`, `PostgreSQL`, `Docker`, `Laravel`.
- Use **commas** to break up lists and clauses so a long sentence has air; use **backticks** around code so `prod` doesn't read as a typo.

## Why this trips you up

You type the way you text — lowercase `i`, no full stops, and one long line where several sentences chain together with no breaks (your own message: *"i already know but as of now i am making so much mistake"*). In code that's fine, but in a PR or standup it makes a reader work to find where one thought ends and the next begins. The fix is mechanical, not creative: capital at the start, mark at the end, comma in the middle.

## See it / fix it

| ❌ What you tend to write | ✅ Correct | Why |
|---|---|---|
| `can u do reaseach on grammer for me` | `Can you do research on grammar for me?` | Capital start, real words not `u`/`reaseach`/`grammer`, and a `?` because it's a question. |
| `i already know but as of now i am making so much mistake` | `I already know it, but right now I'm making so many mistakes.` | Capital `I` (twice), full stop, comma before `but`, and `many mistakes` (countable → plural). |
| `fixed the bug it was a null pointer` | `Fixed the bug. It was a null pointer.` | Two thoughts = two sentences. A full stop, then a new capital. |
| `i deployed to prod but it failed i rolled back` | `I deployed to prod, but it failed, so I rolled back.` | Capital `I`, commas to separate the chained clauses, no run-on. |
| `can you review my pr when ur free` | `Can you review my PR when you're free?` | `PR` is capitalized, `ur` → `you're`, and it ends with `?`. |
| `the api returns 500 check the logs` | `The API returns 500 — check the logs.` | Capitalize the sentence and the proper-ish term `API`; split the two ideas. |
| `we use postgresql and github actions` | `We use PostgreSQL and GitHub Actions.` | Product names keep their official capitalization. |
| `to open pull request run gh pr create` | `To open a pull request, run \`gh pr create\`.` | Add the article `a`, a comma after the intro clause, and backticks around the command. |
| `done with task lgtm` | `Done with the task. LGTM!` | Add `the`, end the statement, and `LGTM` (an acronym) stays uppercase. |
| `i think we need three thing migration seeder and test` | `I think we need three things: a migration, a seeder, and a test.` | Capital `I`, plural `things`, a colon to introduce the list, commas between items. |

## Patterns to remember

**Capitalize when:**
- It's the **first word** of a sentence.
- It's the word **I** (always, even mid-sentence).
- It's a **proper noun**: `GitHub`, `Slack`, `PostgreSQL`, `Redis`, `Nuxt`, `Stripe`, `Monday`, `June`.

> Tool names are not yours to lowercase. It's `GitHub`, not `github`; `PostgreSQL`, not `postgresql`. When in doubt, copy the spelling from the project's own homepage.

**End marks — pick one per sentence:**

| Sentence type | Mark | Example |
|---|---|---|
| Statement | `.` | `The build passed.` |
| Question | `?` | `Did the build pass?` |
| Strong call-out (rare at work) | `!` | `Don't merge yet!` |

**Comma — the four uses you actually need:**

| Use | Pattern | Example |
|---|---|---|
| Lists | `a, b, and c` | `Add a test, a migration, and a seeder.` |
| After an intro clause | `When X, do Y.` | `After the deploy, watch the logs.` |
| Before `but`/`and`/`so` joining two full sentences | `S1, but S2.` | `It built, but the tests failed.` |
| Around an aside | `X, which is Y, …` | `The cache, which is Redis, was stale.` |

> Test for the "joining" comma: if both sides could stand alone as their own sentence, put a comma before `but`/`and`/`so`. `It built` ✅ + `the tests failed` ✅ → `It built, but the tests failed.`

**Colon vs semicolon:**
- **Colon `:`** introduces a list or an explanation. `We need three things: a migration, a seeder, and a test.`
- **Semicolon `;`** joins two closely related full sentences without `and`/`but`. `The deploy finished; the alerts cleared.` (When unsure, just use a full stop — it's never wrong.)

**Quotes and code:**
- Wrap commands, file names, branches, and values in **backticks**: `run \`npm run build\``, `the \`main\` branch`, `set \`status\` to \`paid\``.
- Use "quotes" for actual spoken/written phrases or UI labels: `Click "Save changes".`

## In your daily writing

- **Commit messages:** capital first word, no full stop on the short summary line (git convention), backticks in the body. `Fix null pointer in OrderService` then a blank line, then `The \`customer\` relation was null after a soft delete.`
- **PR titles & descriptions:** title is capitalized; the description is full sentences with end marks. End any direct question to reviewers with `?` — `Should I split this into two PRs?`
- **Slack standups:** still capitalize `I` and start sentences with a capital. `Yesterday I shipped the cache fix. Today I'm on the migration. No blockers.` reads far better than `yesterday i shipped... today i...`.
- **Code comments:** capitalize the first word and end with a full stop. `// Guard against a null tenant after deletion.` — a comment is a sentence, treat it like one.

## Drills

Fix, fill, or choose. Answers are at the bottom — try first, then check.

1. Fix: `i pushed the branch can u check it`
2. Fix: `we use postgresql in dev and sqlite in test`
3. Fix: `the deploy failed i checked the logs it was a config issue`
4. Choose A or B: `It built ( A: , but / B: but ) the tests failed.`
5. Fill the blank with `:` or `;` — `We need three things___ a test, a migration, and a seeder.`
6. Fix: `can you open pull request for this`
7. Fix: `i think we have so much bug in this release`
8. Choose A or B: `After the deploy ( A: watch / B: , watch ) the error rate.`
9. Fix: `done lgtm ship it`
10. Fix: `the api returns 500 when ur token is expired`
11. Fill the blank with the right end mark — `Did the migration run on staging___`
12. Fix: `i did reaseach on grammer like u asked`

---

## Answer key

1. **`I pushed the branch. Can you check it?`** — Capital `I`, split into two sentences, `u` → `you`, and the second is a question (`?`).
2. **`We use PostgreSQL in dev and SQLite in test.`** — Capitalize the sentence and the product names (`PostgreSQL`, `SQLite`); add the full stop.
3. **`The deploy failed. I checked the logs — it was a config issue.`** — Three thoughts; don't chain them. Capital start, capital `I`, end mark. (A dash or full stop both work for the last break.)
4. **A — `It built, but the tests failed.`** — Both sides are full sentences, so a comma goes before `but`.
5. **`:` — `We need three things: a test, a migration, and a seeder.`** — A colon introduces a list.
6. **`Can you open a pull request for this?`** — Add the article `a`, and end with a `?` because it's a request/question.
7. **`I think we have so many bugs in this release.`** — `bug` is countable, so `many bugs` (plural), not `much bug`; capital `I`.
8. **B — `After the deploy, watch the error rate.`** — A comma follows an introductory clause.
9. **`Done. LGTM — ship it!`** — Separate the statements; `LGTM` stays uppercase. (`Ship it!` may take a `!` since it's a strong go-ahead.)
10. **`The API returns 500 when your token is expired.`** — Capitalize `The` and `API`; `ur` → `your`; add the full stop.
11. **`?` — `Did the migration run on staging?`** — A direct question always ends with a question mark.
12. **`I did research on grammar like you asked.`** — Capital `I`, fix the spelling `reaseach` → `research` and `grammer` → `grammar`, and `u` → `you`.

*Part of the Developer English course — see [00-index.md](./00-index.md).*
