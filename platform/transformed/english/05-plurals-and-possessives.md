---
title: "Its vs It's: The Apostrophe Rules Developers Get Wrong"
metaTitle: "Its vs It's & Plurals: A Dev's Quick Guide"
description: "Stop writing API's for plurals and mixing up its vs it's. A clear, dev-friendly guide to plurals, apostrophes, and possessives in commits, PRs, and Slack."
keywords:
  - its vs it's
  - plurals and possessives
  - apostrophe rules
  - when to use apostrophe s
  - plural possessive
  - its or it's
  - APIs or API's
  - English for developers
  - possessive apostrophe
  - plural of acronyms
  - grammar for commit messages
  - countable nouns English
faq:
  - q: "What is the difference between its and it's?"
    a: "\"It's\" is short for \"it is\" or \"it has.\" \"Its\" (no apostrophe) shows possession, like \"its config.\" If you can expand it to \"it is,\" use \"it's.\""
  - q: "Do you put an apostrophe in plurals like APIs or PRs?"
    a: "No. Plain plurals never take an apostrophe. Write APIs, PRs, repos, and IDs. An apostrophe only signals possession or a contraction."
  - q: "Where does the apostrophe go for plural possessives?"
    a: "After the -s. \"The developers' commits\" means commits belonging to many developers. Add the -s first, then just an apostrophe."
  - q: "Is it 2020s or 2020's?"
    a: "It's 2020s. The plural of a decade or number takes no apostrophe, just like APIs and 500s."
  - q: "How do I make plurals of words ending in y?"
    a: "If a consonant comes before the y, change y to -ies: query becomes queries, dependency becomes dependencies. If a vowel comes before the y, just add -s: key becomes keys."
author: Pritesh Yadav (priteshyadav444)
transformed: true
topic: english
topicTitle: English for Developers
category: Communication
date: '2026-06-15'
order: 5
icon: "\U0001F4DD"
sources: []
---

You merge three PRs, close a few tickets, and type "fixed so much bug today" into Slack. The code is flawless. The sentence is not.

Tiny apostrophe slips like "API's are down" or "its failing in prod" are the most common writing mistakes in engineering teams, and they stick around forever in commit history. The good news: there are really only three rules, and once they click, they stay clicked.

## Why this matters

Your writing is part of your work. Commit messages, PR descriptions, and standup notes are read by teammates, reviewers, and sometimes hiring managers scrolling your public repos.

A stray apostrophe doesn't break the build, but it quietly signals "rushed" or "careless" to careful readers. And unlike a typo in a chat message, a wrong **it's** in a code comment lives in the codebase for years.

The fix costs almost nothing. Learn three patterns and a one-second test, and you'll get plurals and possessives right on autopilot, the same way you stopped having to think about indentation.

## The whole thing in 30 seconds

Here are the three rules. Everything else in this article is just examples and edge cases.

- **Plain plural = add `-s` (or `-es`). No apostrophe, ever.** More than one thing: `APIs`, `PRs`, `repos`, `bugs`, `IDs`.
- **Possessive = apostrophe + `s`.** Something belongs to someone or something: `the server's logs`, `the team's decision`, `Pravin's branch`.
- **Plural possessive = `-s` first, then just an apostrophe.** Belongs to many things: `the developers' commits` (the commits of many developers).

And the famous one:

- **`it's` = "it is" or "it has." `its` = belongs to it.** If you can't expand it to "it is," use `its`.

## Why this trips you up

You write fast. Commits, PRs, and Slack messages get typed on autopilot, so apostrophes get sprinkled where they feel natural. "API's are down" *feels* right because your brain hears the **s** sound and reaches for the apostrophe key.

If English isn't your first language, two extra things make it harder. You may drop the plural `-s` entirely ("so much mistake" instead of "so many mistakes"), which hides the difference between one and many. And `its` versus `it's` sounds **identical** out loud, so you have no audio clue to lean on. It really is a coin flip until you learn the test.

## Rule 1: Plain plurals just add -s

A plural means "more than one." That's it. No ownership, no apostrophe.

- `merged 3 PR's today` should be `merged 3 PRs today`
- `the API's return JSON` (meaning many APIs) should be `the APIs return JSON`
- `closed all the ticket's` should be `closed all the tickets`
- `we deployed in the 2020's` should be `we deployed in the 2020s`

**The trap:** acronyms and numbers feel like they "need help" because they look unusual. They don't. `APIs`, `IDs`, `URLs`, `500s`, and `the 90s` all follow the plain rule. Add `-s` and walk away.

### A quick spelling cheat sheet

Most plurals are simple, but a few spellings shift:

| Word ends in… | Add | Example |
|---|---|---|
| most words | `-s` | bug → bugs, repo → repos |
| `s, x, z, ch, sh` | `-es` | branch → branches, class → classes |
| consonant + `y` | `-ies` | query → queries, dependency → dependencies |
| acronym / number | `-s` only | API → APIs, ID → IDs, the 90s |

A handful of words ignore the `-s` pattern completely. These are worth memorizing:

| Singular | Plural |
|---|---|
| index | indexes / indices |
| matrix | matrices |
| schema | schemas (sometimes schemata) |
| datum | data |
| person | people |
| child | children |

## Rule 2: Possessives use apostrophe + s

When something **belongs to** one thing, add `'s`.

- `the server's logs` - the logs belonging to the server
- `the bug's root cause` - the cause belonging to the bug
- `Redis's config` - the config belonging to Redis
- `the team's decision` - the decision belonging to the team

So `the team decision was to revert` becomes `the team's decision was to revert`. The decision belongs to the team, so it earns an apostrophe.

## Rule 3: Many owners put the apostrophe after the s

This is the one people forget. When the owners are already plural and end in `-s`, you don't add another `s`. You just add the apostrophe at the end.

- `the developers' commits` - commits of many developers
- `the users' sessions` - sessions of many users
- `the workers' retry logic` - retry logic shared by all the workers

So `the developers commits are messy` becomes `the developers' commits are messy`. Add the `-s` to make "developers" plural first, then drop an apostrophe on the end.

Think of it as a two-step move: pluralize, then mark ownership.

## The its vs it's test (the only mnemonic you need)

This is the mistake that survives in code comments forever, so here's the trick that kills it:

> **`it's` always unzips into "it is" or "it has."** If it won't unzip, use **`its`**.

Try it:

- "It's broken" → "It **is** broken" ✅ → keep `it's`
- "Its README is outdated" → "**It is** README is outdated"? ❌ → use `its`
- "The service lost it's connection" → "The service lost **it is** connection"? ❌ → use `its`

The same unzip test works for two other classic mix-ups:

- `you're` = "you are"; `your` = belongs to you
- `they're` = "they are"; `their` = belongs to them

The apostrophe version always expands. If it doesn't expand, it's the possessive.

## Common misconceptions

**"An apostrophe means a word ends in s."** No. The `-s` sound at the end of a plural is exactly when you do *not* want an apostrophe. Apostrophes mean possession or contraction, never "this is plural."

**"`its` looks unfinished, so it probably needs an apostrophe."** Backwards. `its` is the possessive form, sitting right next to `his` and `hers`, which also take no apostrophe. The apostrophe belongs to the contraction `it's`.

**"Acronyms are special and take `API's`."** They aren't special. `APIs`, `PRs`, and `IDs` are plain plurals. The only time `API's` is correct is true possession: "the API's rate limiter" means the rate limiter belonging to one API.

**"`data` needs a singular verb."** In everyday tech writing, `data` is usually treated as a mass noun ("the data is stale"), but in formal or scientific writing it's plural of `datum` ("the data are noisy"). Pick one style and stay consistent.

## How to use this

Run these in order whenever you're unsure. It takes about a second.

1. **Am I just talking about more than one thing?** Then no apostrophe. `repos`, `PRs`, `IDs`, `URLs`, `500s`.
2. **Does something belong to one thing?** Then `'s`. `the bug's root cause`, `the server's logs`.
3. **Does it belong to many things that already end in `-s`?** Then just `'`. `the users' sessions`, `the developers' commits`.
4. **Seeing `its` or `it's`?** Try to expand it to "it is." If it expands, write `it's`. If not, write `its`.

A few real-world spots where this pays off:

- **Commit messages:** `Fix the API's rate limiter` only if you mean one API. For a plain count, prefer `Update 4 endpoints` and skip the ambiguity.
- **PR titles:** `Refactor the worker's retry logic` (one worker) versus `Standardize the workers' retry logic` (all of them). Never write `worker's` when you just mean several workers.
- **Standups:** "All the tests are green," not "test's." "It's deployed" (it is) versus "its config changed" (the config belonging to it).
- **Code comments:** `// the cache stores its own TTL` - possessive, no apostrophe. A wrong `it's` here outlives the feature.

## Practice drills

Fix the sentence, fill the blank, or choose A or B. Answers below, no peeking.

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

### Answer key

1. **I merged 5 PRs and closed 3 tickets today.** Capital **I**; plain plurals take no apostrophe.
2. **B - it's.** "It is missing a dependency" expands cleanly.
3. **A - its.** The response belongs to it, so possessive `its`, no apostrophe.
4. **microservices.** Plural of a regular noun, just add `-s`.
5. **The developers' commits broke the pipeline.** Several developers means plural possessive, apostrophe *after* the `-s`.
6. **I fixed so many typos in the docs.** Typos are countable, so **many** plus plural `-s`; capital **I**.
7. **A - its.** The ordering belongs to the queue.
8. **legacy APIs.** Acronym plural, just `-s`, never `API's`.
9. **The server's logs are full of 500s.** Logs belong to the server (`server's`); `logs` is plural so use **are**; plural of a number (`500s`) has no apostrophe.
10. **B - It's.** "It has been flaky" expands; and `2020s` takes no apostrophe.

## Conclusion

If you remember one thing, make it the unzip test: **`it's` only exists when you can replace it with "it is."** Everything else is just "plurals never take an apostrophe, possession always does."

Get these reflexes in place and your writing reads a notch more deliberate, which is exactly the impression you want attached to your name in a repo.

Next stop on the same path: the comma. It's the punctuation mark that decides whether "Let's eat, team" sounds like lunch or a horror movie, and developers misplace it even more often than apostrophes.
