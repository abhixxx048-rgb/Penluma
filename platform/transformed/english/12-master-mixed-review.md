---
title: "Fix the Grammar Mistakes in Your Commits and Slack Messages"
metaTitle: "Developer English: Master Mixed Grammar Review"
description: "A practical grammar workout for developers: fix real commit messages, PRs, and Slack standups with drills on articles, much vs many, tenses, and run-ons."
keywords:
  - developer english grammar
  - grammar for programmers
  - much vs many
  - its vs it's
  - commit message grammar
  - affect vs effect
  - then vs than
  - fix run-on sentences
  - professional writing for developers
  - common english mistakes coding
  - grammar practice exercises
  - writing better pull requests
topic: english
topicTitle: English for Developers
category: Communication
date: '2026-06-15'
order: 12
icon: "\U0001F4DD"
faq:
  - q: "What is the difference between much and many?"
    a: "Use 'many' with things you can count, like bugs or tests ('many bugs'). Use 'much' with things you can't count, like progress or time ('much progress'). If you can add an -s and a number, it's 'many'."
  - q: "Is it 'its' or 'it's'?"
    a: "'It's' is short for 'it is' or 'it has'. 'Its' shows possession, like 'the service returns its payload'. If you can swap in 'it is' and the sentence still makes sense, use 'it's'."
  - q: "When should I use 'affect' versus 'effect'?"
    a: "'Affect' is usually the action verb: 'the deploy affected all tenants'. 'Effect' is usually the result noun: 'the change had a big effect'. Quick rule: affect = action, effect = result."
  - q: "Why does grammar matter in commit messages and pull requests?"
    a: "Clear writing makes your work searchable and your intent obvious. Teammates skim dozens of messages a day, so a clean, specific sentence saves them effort and earns trust faster than clever code alone."
  - q: "What is a run-on sentence and how do I fix it?"
    a: "A run-on jams two complete thoughts together with no proper break. Fix it with a full stop, a semicolon, or a comma plus 'and' or 'but'. For example: 'The API is slow. We should look at it.'"
  - q: "How do I stop confusing 'then' and 'than'?"
    a: "'Than' is for comparisons: 'faster than before'. 'Then' is about time or sequence: 'fix it, then deploy'. If you're comparing two things, it's always 'than'."
author: Pritesh Yadav (priteshyadav444)
transformed: true
sources: []
---

You write code that compiles, passes tests, and ships. Then you type "we are making so much mistake in the checkout flow" into Slack, and a small part of your credibility quietly leaks away.

It isn't that your teammates judge you for it. It's that fuzzy writing makes your great work harder to read, harder to search, and harder to trust. The good news: the handful of grammar slips developers make are predictable, and once you can spot them, you can fix them on autopilot.

This is the capstone of the Developer English course. One workout that mixes every rule into real commits, pull requests, and standup messages, so the rules finally stick instead of fading after each separate lesson.

## Why this matters

Your commits live forever. Six months from now, someone bisecting a bug will read your message at 2 a.m. and either thank you or curse you.

Writing isn't decoration on top of engineering. It is engineering. A pull request description, a commit subject, a standup update, these are all interfaces other humans depend on.

The mistakes below are tiny in isolation. But they pile up, and they're the difference between "this person communicates clearly" and "I have to decode everything they send." You already do the hard part. This is the cheap part.

## The mistakes developers actually make

Most grammar guides drown you in rules. You only need a short list, because the same slips show up again and again in technical writing. Here is the whole map.

| The slip | The one thing to remember |
|---|---|
| Dropping articles | "Open **a** pull request," not "open pull request." |
| Much vs many | **many** + countable ("many bugs"); **much** + uncountable ("much progress"). |
| Subject-verb agreement | "The test **passes**," "the tests **pass**." |
| Tenses | "I **fixed** it" (done), "I **have fixed** it" (done, still relevant), "I'**m fixing** it" (now). |
| its vs it's | **its** = belonging to it; **it's** = it is. |
| Prepositions | "merge **into** main," "depends **on** the API," "blocked **by** the migration." |
| Run-on sentences | Two complete thoughts need a full stop, a semicolon, or a comma + and/but. |
| Confused words | their/there/they're, then/than, affect/effect, lose/loose. |
| Spelling | grammar, research, separate, receive, occurred, definitely. |
| Texting leak | No "u," "ur," "thx" in professional writing. Write it out. |

Keep that table nearby. Everything below is just practice applying it.

## How to practice (the drills)

This is mostly a workout, not a lecture. Below are mixed exercises, then a full answer key with one-line explanations.

Three rules make this actually work:

1. **Don't peek at the answers** until you've tried the whole set.
2. **Write your fix out in full.** Don't just think "yeah, I know that one." The point is to train your fingers, because you write commits and Slack messages on autopilot, and autopilot is exactly where mistakes slip through.
3. **Note which topics you missed most**, then re-read that one lesson.

Grab a scratch file or a pen. Start now, then check yourself.

### Part A: Fix the sentence

Each line has one or more errors. Rewrite it correctly.

1. `i pushed the fix to ur branch can u review it`
2. `we are making so much mistake in the checkout flow`
3. `the migration are still running, it has not finished yet`
4. `please open pull request against main branch`
5. `i did a lot of reaseach on grammer before writing this doc`
6. `the API return 500 when the cart is empty we should add a guard`
7. `your right, the cache key was wrong its fixed now`
8. `there is to many open tickets in the backlog this sprint`
9. `the deploy effected all tenants because the config was shared`
10. `i think this approach is more better then the old one`

### Part B: Fill the blank

Choose the right word and write the full sentence.

11. The pricing service depends ______ the tenant context being initialized first. *(on / from / to)*
12. We merged the hotfix ______ main and tagged a release. *(into / in / to)*
13. There ______ three failing tests in the payment suite right now. *(is / are)*
14. ______ the queue worker still running, or did it crash? *(Is / Are)*
15. I've reviewed the PR; ______ ready to merge once CI passes. *(its / it's)*
16. Please update ______ local `.env` before running the seeder. *(your / you're)*
17. We didn't have ______ time to write tests for the edge cases. *(much / many)*
18. There were ______ duplicate rows after the bad import. *(much / many)*
19. The bug only appears ______ the user has more than one address. *(then / when)*
20. This fix is faster ______ the previous one by about 40 ms. *(then / than)*

### Part C: Choose A or B

21. (A) "The endpoint returns it's payload as JSON." (B) "The endpoint returns its payload as JSON."
22. (A) "Each tenant have their own subdomain." (B) "Each tenant has its own subdomain."
23. (A) "I have already deployed it yesterday." (B) "I deployed it yesterday."
24. (A) "We need to separate the read and write paths." (B) "We need to seperate the read and write paths."

### Part D: Clean up the messy dev message

Rewrite each so a teammate could read it without effort.

25. **A run-on Slack standup:**
`yesterday i worked on the cart bug today i am doing the checkout flow i found so much issue in the validation also the API is slow we should look at it tmrw can u help`

26. **A sloppy commit message:**
`fixed stuff in pricing also some other thing, broke the test but its fine i think will fix latter`

27. **A confusing PR description:**
`this PR change the order service so it dont crash when address is missing i also did some refactor and remove dead code there is still much bug but this is good for now plz review`

28. **The line that started this whole course:**
`can u do reaseach on grammer for me and teach me i already know but as of now i am making so much mistake`

## Common misconceptions

A few beliefs keep developers stuck. Let's clear them up.

- **"Good code speaks for itself, so writing doesn't matter."** Code speaks to compilers. Your commit message and PR speak to humans, and humans decide whether to trust, merge, and build on your work.
- **"Each tenant feels like many, so I should say 'each tenant have.'"** "Each" is always singular, no matter how many things it scans across. It's "each tenant **has** **its** own subdomain."
- **"More better is more emphatic."** It's doubled up. "Better" already means "more good." Just say **better**.
- **"'It's' looks like possession, like the dog's bowl."** Apostrophes usually mean possession, but **its** is the one exception you have to memorize. **it's** only ever means "it is" or "it has."

## The answer key

Try the drills before reading on. Here's how each one resolves, with the reason in one line.

### Part A

1. **"I pushed the fix to your branch. Can you review it?"** Capital **I**, "your" not "ur," "you" not "u," split into two sentences, and a question ends with **?**.
2. **"We are making so many mistakes in the checkout flow."** "Mistake" is countable, so **many** + plural **mistakes**. This is the signature slip.
3. **"The migration is still running; it hasn't finished yet."** "Migration" is singular, so **is**. Two complete thoughts need a semicolon or full stop, not a lone comma.
4. **"Please open a pull request against the main branch."** Add **a** before "pull request" and **the** before "main branch." Dropped articles are easy to miss.
5. **"I did a lot of research on grammar before writing this doc."** Capital **I**, "research" (not "reaseach"), "grammar" (not "grammer"). Memorize both, they show up constantly.
6. **"The API returns a 500 when the cart is empty. We should add a guard."** "The API" is singular, so **returns**; add **a** before "500"; split the run-on.
7. **"You're right. The cache key was wrong; it's fixed now."** "You're" = "you are"; "it's" = "it is." New sentence after "right."
8. **"There are too many open tickets in the backlog this sprint."** "Tickets" is plural, so **are**; **too** (excessive), not "to"; **many** with countable tickets.
9. **"The deploy affected all tenants because the config was shared."** **affected** (verb), not "effected." Remember: *affect = action, effect = result.*
10. **"I think this approach is better than the old one."** "More better" is doubled, just **better**; **than** for comparison, not "then."

### Part B

11. **on** — "depends **on** something." A fixed pairing.
12. **into** — you merge changes **into** a branch (movement toward a target).
13. **are** — "three failing tests" is plural.
14. **Is** — "the queue worker" is singular; capital at the start of the sentence.
15. **it's** — "it's ready" = "it is ready."
16. **your** — possessive: the `.env` belonging to you.
17. **much** — "time" is uncountable.
18. **many** — "rows" is countable.
19. **when** — the bug appears **when** a condition is met. ("then" = next/after.)
20. **than** — comparisons use **than**.

### Part C

21. **B** — "its payload" (belonging to it). "it's" would mean "it is payload," which is nonsense.
22. **B** — "Each tenant" is singular, so **has** + **its**.
23. **B** — "yesterday" is a finished time, so use simple past **deployed**. Don't mix "already... yesterday."
24. **A** — **separate** is correct. Mnemonic: there's **a rat** in sep**a**rate.

### Part D

25. **The standup, cleaned up:**

> Yesterday I worked on the cart bug. Today I'm on the checkout flow. I found many issues in the validation. The API is also slow, we should look at it tomorrow. Can you help?

Full stops between thoughts, **many issues** not "so much issue," "tomorrow" not "tmrw," and a real **?**.

26. **The commit message, cleaned up:**

> Fix pricing rounding bug; also adjust the tier lookup. One test is failing, will fix in a follow-up.

Say *what* you fixed instead of "stuff," so the log is searchable. Note "latter" means the second of two things; you wanted **later** (afterward). A good commit subject is imperative ("Fix...", "Add..."), short, and specific.

27. **The PR description, cleaned up:**

> This PR changes the order service so it doesn't crash when the address is missing. I also refactored and removed some dead code. There are still a few known bugs, but this is a good checkpoint. Please review.

"PR **changes**" (singular subject), "**doesn't**" not "dont," add **the** before "address," and **a few bugs** (countable), not "much bug."

28. **The original line, corrected:**

> Can you do research on grammar for me and teach me? I already know it, but right now I'm making so many mistakes.

It's a request, so it ends with **?**; "I already know" needs an object ("know **it**"); and **so many mistakes** instead of "so much mistake." When you can count it, use **many** and add the **-s**.

## How to use this every day

You don't need to memorize all twenty-eight drills. You need three habits that catch most slips before you hit send.

1. **End every sentence with a full stop.** This single move breaks up almost every run-on you'd otherwise write.
2. **Capitalize "I," always.** No exceptions, no thinking required.
3. **Count it before you choose much vs many.** If you can put a number in front of it, use **many** and add the **-s**.

Then add one slower habit:

4. **Reread before you send.** One pass over a commit, PR, or Slack message catches the obvious ones. It costs ten seconds and saves your teammates real effort.

Bookmark this file and redo the drills in a week. If you score the same set clean twice, the rules have stuck.

## Conclusion

Here's the one takeaway: clear writing is not a soft skill bolted onto engineering. It is the interface your teammates actually touch, and the cheapest credibility you'll ever buy.

The fix isn't becoming a grammar expert. It's catching the same five or six slips on autopilot, the way you already catch a missing semicolon.

And once your sentences are clean, a bigger question opens up: not just *correct* writing, but *persuasive* writing. How do you frame a PR so reviewers say yes? How do you write a design doc that gets buy-in before the meeting even starts? That's where good grammar stops being defense and starts being leverage.
