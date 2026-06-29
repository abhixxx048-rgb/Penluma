# 04 — Verb tenses & keeping them consistent

*What this fixes for you: you'll stop writing "I am fix the bug", you'll pick the right tense for commits and standups, and your sentences will stop jumping between past and present halfway through.*

## The rule in 30 seconds

- **Present simple** = states, habits, and how code works. *"The function returns a UUID." "We deploy on Fridays."*
- **Past simple** = a finished action at a finished time. *"I fixed the bug yesterday." "The build failed last night."*
- **Present perfect** (`have/has` + past participle) = done, and it still matters now. *"I have pushed the fix." "The build has finished."*
- **Present continuous** (`am/is/are` + verb-**ing**) = happening right now, in progress. *"I am working on it." "The tests are running."*
- Stay in **one tense** per thought. Don't start in the past and drift into the present in the same sentence.

## Why this trips you up

You reach for "I am" and then attach a plain verb — "I am fix" — but `am/is/are` must be followed by an **-ing** verb (`am fixing`) or you should drop the helper and use past simple (`I fixed`). You also slide between tenses inside one sentence because, in the moment of writing a standup or PR, the timeline in your head shifts and the verbs follow it. And small slips pile up — a lowercase "i", a missing full stop, "u" for "you" — which make even correct tenses read as rushed.

## See it / fix it

| ❌ What you tend to write | ✅ Correct | Why |
|---|---|---|
| i am fix the login bug now | I am fixing the login bug now. | `am` needs an **-ing** verb; also capitalize "I" and the sentence start, and end with a full stop. |
| yesterday i am fixing the bug | Yesterday I fixed the bug. | "Yesterday" is finished time → past simple, not present continuous. |
| I have pushed the fix yesterday | I pushed the fix yesterday. | Present perfect can't take a finished-time word like "yesterday"; use past simple. |
| the build finish, you can deploy | The build has finished, so you can deploy. | "Just done, matters now" → present perfect (`has finished`); add the article/connector and full stop. |
| this function return a token | This function returns a token. | How code works = present simple; third person singular needs **-s** (`returns`). |
| i already fix it but i make so much mistake | I already fixed it, but I'm making so many mistakes. | Past simple for the done action; **many** + plural **mistakes** (countable); fix "i". |
| Fixed the typo in readme (PR title) | Fix the typo in README (PR title / commit). | Commit/PR titles use the **imperative** ("Fix"), not past tense. |
| we are deploy every friday | We deploy every Friday. | Habit/schedule = present simple, not continuous; capitalize "Friday". |
| can u do reaseach on grammer for me | Can you do research on grammar for me? | Spelling: research, grammar; "u" → "you"; it's a question → "?". |
| open pull request and i review it | Open a pull request and I'll review it. | Missing article "a"; capitalize "I"; "I'll" (future) reads cleaner here. |

## Patterns to remember

**The four workhorse tenses, as a cheat sheet:**

| Tense | Shape | Use it for | Example |
|---|---|---|---|
| Present simple | `verb` (+s) | how code works, habits, schedules | "The API **caches** the response." |
| Past simple | `verb-ed` / irregular | finished action, finished time | "I **reverted** the commit." |
| Present perfect | `have/has` + participle | just done / still relevant now | "I **have merged** the branch." |
| Present continuous | `am/is/are` + `verb-ing` | in progress right now | "CI **is running**." |

**The "I am ___" trap:** after `am / is / are`, the next verb almost always ends in **-ing**.
- ❌ I am fix → ✅ I am **fixing**
- ❌ It is run → ✅ It is **running**
- If you don't want -ing, drop the helper: "I **fixed** it."

**Perfect vs. past — the time-word test:** if the sentence names a finished time (*yesterday, last week, at 3pm, on Monday*), use **past simple**. If it's *already / just / so far / now*, use **present perfect**.
- "I **deployed** it on Monday." (named time → past)
- "I've **already** deployed it." (relevance now → perfect)

**Commits & PR titles are imperative on purpose.** Git wants the title to complete the sentence *"If applied, this commit will ___"*. So write the bare command form: **Fix**, **Add**, **Remove**, **Refactor** — never "Fixed", "Adds", or "Fixing".
- ✅ `Add rate limiting to login endpoint`
- ✅ `Fix null pointer in cart total`
- ❌ `Added rate limiting` / ❌ `Fixing login` / ❌ `Adds endpoint`

## In your daily writing

- **Commit messages / PR titles:** imperative mood. "Fix", "Add", "Update", "Remove". One line, capital first letter, no full stop needed on the subject line.
- **PR description (body):** present perfect or past for what you did — "I've moved the validation into the service layer" or "Moved validation into the service layer." Present simple for what the code now does — "The service now rejects empty payloads."
- **Standup (Slack):** three clean tenses. *Yesterday* → past simple ("I fixed the webhook retry"). *Today* → present continuous ("I'm writing tests for it"). *Blockers* → present simple ("I need access to the staging DB").
- **Code comments / docs:** present simple, because they describe how the code behaves every time it runs. "Returns the cached value if present." Not "Returned" or "Will return".
- **Bug reports:** past simple for what happened ("The page crashed when I clicked Save"), present simple for the steady behavior ("The error appears on every submit").

## Drills

For each, fix the sentence, fill the blank, or choose A/B. Write professional dev English — capitals, full stops, real spelling.

1. Fix: `i am fix the failing test right now`
2. Fix: `yesterday i have deployed the new version`
3. Fill the blank (commit title): `____ pagination to the orders list endpoint` (choose: *Added / Add / Adding*)
4. Choose A or B: This function (A) *return* / (B) *returns* the user's UUID.
5. Fix: `the migration finish so u can run the seeder`
6. Choose A or B: Right now I (A) *work* / (B) *am working* on the checkout flow.
7. Fix: `i already fix the bug but i still make so much mistake in the tests`
8. Fill the blank: I ____ (just push) the hotfix, can you review it? (use the right tense)
9. Choose A or B: We (A) *are releasing* / (B) *release* every two weeks, like clockwork.
10. Fix (PR title): `Fixed the race condition in the queue worker`
11. Fix the run-on: `the build broke i looked at the logs the error was a missing env var i added it now its green`
12. Fill the blank: The endpoint ____ (cache) the response for 60 seconds. (how the code works — pick the tense)

---

## Answer key

1. **I am fixing the failing test right now.** — After "I am", the verb takes **-ing** (`fixing`); capitalize "I" and the start, add a full stop.
2. **Yesterday I deployed the new version.** — "Yesterday" is finished time, so use **past simple**, not present perfect.
3. **Add** pagination... — Commit titles use the **imperative**: "Add", not "Added" or "Adding".
4. **B — returns.** — How the code works = present simple, and third person singular adds **-s**.
5. **The migration has finished, so you can run the seeder.** — Just done / relevant now → present perfect (`has finished`); "u" → "you"; add article-less connector "so" and a full stop.
6. **B — am working.** — "Right now" + in progress = present continuous.
7. **I already fixed the bug, but I still make so many mistakes in the tests.** — Past simple for the done fix; **many** + plural **mistakes** (countable); fix "i".
8. **I've just pushed** the hotfix... — "Just" + still relevant = present perfect (`have/'ve` + past participle `pushed`).
9. **B — release.** — A regular schedule/habit = present simple.
10. **Fix the race condition in the queue worker.** — PR/commit titles use the **imperative** ("Fix"), not past tense.
11. **The build broke. I looked at the logs, and the error was a missing env var. I added it, and now it's green.** — Split the run-on into sentences with full stops/commas; keep past simple for the finished steps; "its" → "it's" (it is).
12. **caches** — Steady behavior of the code = present simple; third person singular adds **-s** (`caches`).

*Part of the Developer English course — see [00-index.md](./00-index.md).*
