---
title: "Verb Tenses for Developers: Stop Writing \"I Am Fix the Bug\""
metaTitle: "Verb Tenses for Developers (Plain Guide)"
description: "Learn which verb tense to use in commits, standups, and PRs - and stop your sentences drifting between past and present. A clear guide for developers."
keywords:
  - verb tenses for developers
  - english for developers
  - present perfect vs past simple
  - commit message tense
  - standup english grammar
  - "I am fixing grammar"
  - imperative commit message
  - PR description grammar
  - present continuous
  - past simple vs present perfect
  - dev english grammar
  - how to write commit messages
  - third person singular verb s
  - English grammar for programmers
faq:
  - q: "Should commit messages be past tense or present tense?"
    a: "Neither - use the imperative (command) form: \"Fix the login bug\", not \"Fixed\" or \"Fixing\". Git treats the title as the end of the sentence \"If applied, this commit will...\"."
  - q: "When do I use present perfect instead of past simple?"
    a: "Use present perfect (\"I have pushed it\") when the action is done but still matters now. Use past simple (\"I pushed it yesterday\") when you name a finished time."
  - q: "Why is \"I am fix the bug\" wrong?"
    a: "After am, is, or are, the next verb needs an -ing ending: \"I am fixing the bug.\" If you don't want -ing, drop the helper: \"I fixed the bug.\""
  - q: "What tense should I use in code comments and docs?"
    a: "Present simple, because comments describe what the code does every time it runs: \"Returns the cached value if present.\" Not \"Returned\" or \"Will return\"."
  - q: "Which tenses should I use in a standup update?"
    a: "Three: past simple for yesterday (\"I fixed the webhook\"), present continuous for today (\"I'm writing tests\"), and present simple for blockers (\"I need staging access\")."
topic: english
topicTitle: English for Developers
category: Communication
date: '2026-06-15'
order: 4
icon: "\U0001F4DD"
author: Pritesh Yadav (priteshyadav444)
transformed: true
linked: true
sources: []
---

You write code that compiles, ships, and scales. Then you type "i am fix the login bug now" in Slack, and somehow that one line undoes a little of the trust your work just earned.

It is not a knowledge gap. You know what you mean. The problem is that English verb tenses follow a few small mechanical rules, and when you are typing fast during a standup, those rules quietly break. The good news: there are really only four tenses you need at work, and one trap that catches almost everyone.

## Why this matters

Your tenses are a status signal whether you want them to be or not.

A reviewer reading "I have pushed the fix yesterday" doesn't think *grammar mistake* - they think *rushed, maybe careless*. And if the writing feels careless, the reader starts wondering whether the code was too. That is unfair, but it is how humans read.

The flip side is the opportunity. Clean, correctly-tensed updates make you sound like someone who is in control of their work. Same effort, better signal. And because most of your professional writing is short - commit titles, [PR descriptions](/blog/english/10-professional-dev-writing), standups, bug reports - fixing a handful of patterns covers almost everything you write all day.

## The four tenses you actually need

Forget the grammar textbook with its twelve tenses. At work, you reach for four, and each one maps to a clear situation.

**Present simple** - how code works, habits, and schedules.
*"The function returns a UUID." "We deploy on Fridays."*

**Past simple** - a finished action at a finished time.
*"I fixed the bug yesterday." "The build failed last night."*

**Present perfect** (`have`/`has` + past participle) - done, and it still matters right now.
*"I have pushed the fix." "The build has finished."*

**Present continuous** (`am`/`is`/`are` + verb-**ing**) - happening right now, in progress.
*"I am working on it." "The tests are running."*

Here it is as a cheat sheet you can keep nearby:

| Tense | Shape | Use it for | Example |
|---|---|---|---|
| Present simple | `verb` (+s) | how code works, habits, schedules | "The API **caches** the response." |
| Past simple | `verb-ed` / irregular | finished action, finished time | "I **reverted** the commit." |
| Present perfect | `have`/`has` + participle | just done / still relevant now | "I **have merged** the branch." |
| Present continuous | `am`/`is`/`are` + `verb-ing` | in progress right now | "CI **is running**." |

Think of it like log levels. You don't agonize over which one to use - the situation tells you. *Finished, with a timestamp?* Past simple. *Still running?* Present continuous. Once you see the situation, the tense is automatic.

## The "I am ___" trap

This is the single most common mistake, so it gets its own section.

After `am`, `is`, or `are`, the next verb almost always ends in **-ing**.

- "I am **fixing**" - not "I am fix"
- "It is **running**" - not "It is run"
- "The tests are **passing**" - not "The tests are pass"

Here is the simple mental model: `am`/`is`/`are` is a helper. A helper needs an `-ing` verb to do anything. On its own, "I am fix" is like calling a function with the wrong argument type - the pieces don't fit.

And if you don't want the `-ing` form? Then you don't need the helper at all. Drop it and use past simple:

> "I **fixed** it." (clean and done)

So whenever "I am fix..." starts to come out, you have two correct exits: add `-ing` ("I am fixing") or remove the helper ("I fixed"). Pick whichever matches your meaning.

## Present perfect vs. past simple: the time-word test

This is the second big confusion, and there's a one-second test that settles it almost every time.

**Does the sentence name a finished time?** Words like *yesterday, last week, at 3pm, on Monday.* If yes, use **past simple**.

> "I **deployed** it on Monday."

**Is it about now - relevance, not a timestamp?** Words like *already, just, so far, now.* If yes, use **present perfect**.

> "I've **already** deployed it."

That is why "I have pushed the fix **yesterday**" sounds wrong to native speakers - present perfect and a finished-time word ("yesterday") can't share a sentence. You have to choose one lane: either "I pushed it yesterday" (past) or "I've already pushed it" (perfect).

A quick way to feel the difference:
- "The build **failed** at 2pm." - a fact about a past moment.
- "The build **has failed**." - and that's why we're not deploying right now.

## Commit messages are imperative on purpose

Here is a rule that surprises people: a good commit or PR title is neither past nor present. It is the **imperative** - the bare command form.

Git is built around the sentence *"If applied, this commit will ___."* Your title completes it:

- "If applied, this commit will **Add rate limiting to the login endpoint**." Correct.
- "If applied, this commit will **Added rate limiting**." Broken.

So write the command: **Add**, **Fix**, **Remove**, **Refactor**, **Update**.

- `Add rate limiting to login endpoint`
- `Fix null pointer in cart total`
- Not `Added rate limiting`, not `Fixing login`, not `Adds endpoint`

This is also why your editor's auto-generated "Fixed the typo" feels slightly off in a clean history - it's the wrong mood. One small word swap ("Fixed" to "Fix") makes your commit log read like the rest of the project.

## Common misconceptions

**"Present perfect is just a fancier past tense."**
No. They mean different things. Past simple closes the door on a moment ("I fixed it Monday"). Present perfect keeps it open and relevant ("I've fixed it" - so you can deploy now). Using them interchangeably changes your meaning.

**"Commit titles should describe what I did, so past tense."**
Intuitive, but wrong by convention. Git history reads as a list of instructions, not a diary. Imperative ("Fix") is the standard across almost every major project.

**"Adding -ing always means right now."**
Mostly, but present continuous can also signal something temporary or trending ("The tests are getting flaky lately"). The core idea is *in progress / not settled*, which usually means now.

**"Small spelling slips don't matter if the grammar is right."**
They do. A lowercase "i", "u" for "you", or "grammer" for "grammar" makes even a perfectly-tensed sentence read as rushed. Tense and polish are judged together.

## How to use this in your daily writing

Match the tense to the surface you're writing on:

1. **Commit messages / PR titles** - imperative mood. "Fix", "Add", "Update", "Remove". One line, capital first letter, no full stop on the subject line.
2. **PR descriptions** - present perfect or past for what you did ("I've moved validation into the service layer"), and present simple for what the code now does ("The service now rejects empty payloads").
3. **Standups** - three clean tenses. *Yesterday* is past simple ("I fixed the webhook retry"). *Today* is present continuous ("I'm writing tests for it"). *Blockers* are present simple ("I need access to the staging DB").
4. **Code comments and docs** - present simple, because they describe behavior every time the code runs. "Returns the cached value if present." Not "Returned" or "Will return".
5. **Bug reports** - past simple for what happened ("The page crashed when I clicked Save"), present simple for the steady behavior ("The error appears on every submit").
6. **Before you hit send** - scan for three things: a capital "I", [a full stop](/blog/english/07-punctuation-and-capitalization), and an `-ing` after any `am`/`is`/`are`. That three-second check catches most slips.

### Before and after

A few real examples of the rough version and the clean one:

| You tend to write | Cleaner version | Why |
|---|---|---|
| i am fix the login bug now | I am fixing the login bug now. | `am` needs an `-ing` verb; capitalize "I" and the start; end with a full stop. |
| yesterday i am fixing the bug | Yesterday I fixed the bug. | "Yesterday" is finished time, so past simple. |
| I have pushed the fix yesterday | I pushed the fix yesterday. | Present perfect can't take "yesterday"; use past simple. |
| the build finish, you can deploy | The build has finished, so you can deploy. | Just done and relevant now, so present perfect. |
| this function return a token | This function returns a token. | How code works is present simple; third person adds **-s**. |
| we are deploy every friday | We deploy every Friday. | A schedule is present simple, not continuous. |

## Try it yourself

Fix each line. Answers below - no peeking.

1. `i am fix the failing test right now`
2. `yesterday i have deployed the new version`
3. Commit title - choose: `Added / Add / Adding` pagination to the orders list.
4. This function (A) *return* / (B) *returns* the user's UUID.
5. `the migration finish so u can run the seeder`
6. Right now I (A) *work* / (B) *am working* on the checkout flow.
7. `i already fix the bug but i still make so much mistake in the tests`
8. I ____ (just push) the hotfix, can you review it?

### Answer key

1. **I am fixing the failing test right now.** After "I am", the verb takes `-ing`.
2. **Yesterday I deployed the new version.** "Yesterday" is finished time, so past simple.
3. **Add** pagination... Commit titles use the imperative.
4. **B - returns.** Present simple, and [third person singular](/blog/english/03-subject-verb-agreement) adds **-s**.
5. **The migration has finished, so you can run the seeder.** Just done and relevant now, so present perfect; "u" becomes "you".
6. **B - am working.** "Right now" plus in progress is present continuous.
7. **I already fixed the bug, but I still make so many mistakes in the tests.** Past simple for the done fix; **many** + plural **mistakes** (it's [countable](/blog/english/02-countable-uncountable-much-many)).
8. **I've just pushed** the hotfix... "Just" plus still relevant is present perfect.

## Conclusion

If you remember one thing, make it this: **let the situation pick the tense, not your mood while typing.** Finished with a timestamp is past simple. Still running is present continuous. Done but it matters now is present perfect. A command for the commit log is imperative.

Master those four, and the verbs stop fighting you - they just describe what is actually happening.

There's one more layer worth noticing, though. Tense tells the reader *when*; tone tells them *how to feel about it*. A standup that says "I'm still blocked" lands very differently from "I'm unblocked on everything except staging access." Same facts, different read. That gap between what's true and what's heard is where the next jump in your writing lives.
