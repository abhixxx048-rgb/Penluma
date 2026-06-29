# 05 - Plurals, apostrophes & possessives (its vs it's)

*What this fixes for you: you'll stop writing "API's" for plain plurals, you'll get "the server's logs" vs "the developers' commits" right, and you'll never again mix up **its** and **it's** in a commit message or PR.*

## The rule in 30 seconds

- **Plain plural = just add `-s` (or `-es`).** More than one thing. No apostrophe ever: `APIs`, `PRs`, `repos`, `bugs`, `IDs`.
- **Possessive = apostrophe + `s`.** Something belongs to someone: `the server's logs`, `the team's decision`, `Pravin's branch`.
- **Plural + possessive = `-s` first, then just an apostrophe:** `the developers' commits` (commits of many developers).
- **`it's` = "it is" / "it has".** `its` (no apostrophe) = belongs to it. If you can't expand it to "it is", use **its**.

## Why this trips you up

You write commits, PRs, and Slack messages fast, so apostrophes get sprinkled on autopilot - "API's are down" feels natural but is wrong. As a non-native speaker you also sometimes drop the plural `-s` entirely ("so much mistake" instead of "so many mistakes"), which hides the difference between one and many. And `its` vs `it's` is a coin-flip right now because both sound identical out loud.

## See it / fix it

| ❌ What you tend to write | ✅ Correct | Why |
|---|---|---|
| `merged 3 PR's today` | `merged 3 PRs today` | Plain plural of an acronym - no apostrophe. |
| `the API's return JSON` (meaning many APIs) | `the APIs return JSON` | "More than one API" is a plural, not a possessive. |
| `its failing in prod` | `it's failing in prod` | "It is failing" → use **it's**. |
| `the service lost it's connection` | `the service lost its connection` | The connection belongs to it → **its** (no apostrophe). |
| `the developers commits are messy` | `the developers' commits are messy` | Commits of many developers → plural possessive, apostrophe after the `-s`. |
| `i fixed so much bug in this PR` | `I fixed so many bugs in this PR` | Bugs are countable → **many** + plural `-s`; also capital **I**. |
| `the server logs is too noisy` | `the server's logs are too noisy` | Logs belong to the server → `server's`; logs is plural → **are**. |
| `closed all the ticket's for this sprint` | `closed all the tickets for this sprint` | Plain plural - drop the apostrophe. |
| `the team decision was to revert` | `the team's decision was to revert` | The decision belongs to the team → possessive. |
| `we deployed in the 2020's` | `we deployed in the 2020s` | Plural of a number/decade - no apostrophe. |

## Patterns to remember

**The apostrophe test (run this every time):**

1. Am I just talking about *more than one*? → **no apostrophe**. `repos`, `PRs`, `IDs`, `URLs`.
2. Does something *belong to* one thing? → **`'s`**. `the bug's root cause`, `Redis's config`.
3. Does it belong to *many* things already ending in `-s`? → **just `'`**. `the users' sessions`, `the developers' commits`.

**Plurals cheat sheet:**

| Word ends in… | Add | Example |
|---|---|---|
| most words | `-s` | bug → bugs, repo → repos |
| `s, x, z, ch, sh` | `-es` | branch → branches, patch → patches, class → classes |
| consonant + `y` | `-ies` | query → queries, dependency → dependencies |
| acronym / number | `-s` only | API → APIs, ID → IDs, the 90s |

**Common irregulars (no `-s` rule):**

| Singular | Plural |
|---|---|
| index | indexes / indices |
| matrix | matrices |
| schema | schemas (sometimes schemata) |
| datum | data (treat "data" as plural or as a mass noun) |
| person | people |
| child | children |

**its vs it's - the only mnemonic you need:**

> **`it's`** always unzips into **"it is"** or **"it has"**. If it won't unzip, it's **`its`**.
> "It's broken" → "It is broken" ✅. "Its README" → "It is README"? ❌ → so use **its**.

(Same trick works for `you're`/`your` and `they're`/`their` - the apostrophe version always expands.)

## In your daily writing

- **Commit messages:** `Fix the API's rate limiter` only if you mean *one* API's limiter. For many: `Fix the APIs' rate limiters`. For a plain count: `Update 4 endpoints`.
- **PR titles:** `Refactor the worker's retry logic` (one worker) vs `Standardize the workers' retry logic` (all of them). Never `worker's` when you just mean several workers.
- **Slack standups:** "All the tests are green" - not "test's". "It's deployed" (it is) vs "its config changed" (the config belonging to it).
- **Code comments:** `// the cache stores its own TTL` - possessive, no apostrophe. A wrong `it's` here survives forever in the codebase.
- **Bug reports:** "The endpoint returns 500s" (plural of a number, no apostrophe). "The server's response is malformed" (possessive).

## Drills

Fix the sentence, fill the blank, or choose A or B. (Answers below - don't peek.)

1. Fix: `i merged 5 PR's and closed 3 ticket's today`
2. Choose: The build failed because (A) **its** (B) **it's** missing a dependency.
3. Choose: We should cache (A) **its** (B) **it's** response to cut latency.
4. Fill the blank: All three ______ (microservice) share one database.
5. Fix: `the developers commits broke the pipeline` (you mean several developers)
6. Fix: `i fixed so much typo in the docs`
7. Choose: The queue lost (A) **its** (B) **it's** ordering after the restart.
8. Fill the blank: We migrated all the ______ (legacy API) last quarter.
9. Fix: `the server log's are full of 500's`
10. Choose: (A) **Its** (B) **It's** been flaky since the 2020s.
11. Fix: `the team decision is final and the user's data is safe` (the decision belongs to the team; data belongs to many users)
12. Fill the blank: I ran the ______ (query) against two ______ (index).

---

## Answer key

1. **I merged 5 PRs and closed 3 tickets today.** - Capital **I**; plain plurals take no apostrophe.
2. **B - it's.** "It is missing a dependency" expands cleanly, so use **it's**.
3. **A - its.** The response belongs to it → possessive **its**, no apostrophe.
4. **microservices.** Plural of a regular noun - add `-s`.
5. **The developers' commits broke the pipeline.** - Several developers → plural possessive, apostrophe *after* the `-s`.
6. **I fixed so many typos in the docs.** - Typos are countable → **many** + plural `-s`; capital **I**.
7. **A - its.** "The queue lost it is ordering"? No - the ordering belongs to it → **its**.
8. **legacy APIs.** Acronym plural - just `-s`, never `API's`.
9. **The server's logs are full of 500s.** - Logs belong to the server (`server's`); `logs` is plural so use **are**; plural of a number (`500s`) has no apostrophe.
10. **B - It's.** "It has been flaky" / "It is" expands → **it's**; and `2020s` (decade plural) takes no apostrophe.
11. **The team's decision is final and the users' data is safe.** - `team's` (one team owns it); `users'` (data belonging to many users → apostrophe after the `-s`).
12. **queries / indexes.** "query" → `-ies` (consonant + `y`); "index" → **indexes** (or *indices*) is irregular.

---

*Part of the Developer English course - see [00-index.md](./00-index.md).*
