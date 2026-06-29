---
title: "Its or It's? The Tiny Word Mix-Ups That Make Code Look Sloppy"
metaTitle: "Commonly Confused Words for Developers"
description: "Its vs it's, login vs log in, then vs than - the small word mix-ups that make a clean PR look careless, and the quick tricks to never get them wrong again."
keywords:
  - commonly confused words
  - its vs it's
  - login vs log in
  - then vs than
  - affect vs effect
  - your vs you're
  - fewer vs less
  - English for developers
  - grammar for commit messages
  - whose vs who's
  - accept vs except
  - i.e. vs e.g.
topic: english
topicTitle: English for Developers
category: Communication
date: '2026-06-15'
order: 9
icon: "\U0001F4DD"
author: Pritesh Yadav (priteshyadav444)
transformed: true
sources: []
faq:
  - q: "Is it 'its' or 'it's'?"
    a: "Use 'it's' only when you mean 'it is' or 'it has' - 'it's failing' = it is failing. Use 'its' (no apostrophe) for ownership, like 'its config.' If you can't expand it to two words, drop the apostrophe."
  - q: "When is it 'login' and when is it 'log in'?"
    a: "'Login' is one word as a noun (a login screen, your login). 'Log in' is two words as a verb (please log in). The same split applies to setup/set up and backup/back up."
  - q: "What's the difference between 'then' and 'than'?"
    a: "'Than' (with an a) is for comparison - 'faster than before.' 'Then' (with an e) is for time or sequence - 'first this, then that.'"
  - q: "Affect or effect?"
    a: "'Affect' is usually the verb - to change something ('this won't affect the API'). 'Effect' is usually the noun - the result ('what's the effect?'). A is for Action, E is for End result."
  - q: "Is it 'fewer' or 'less'?"
    a: "Use 'fewer' for things you can count with a plural -s (fewer errors, fewer retries). Use 'less' for things you can't count (less traffic, less memory)."
  - q: "What's the difference between 'i.e.' and 'e.g.'?"
    a: "'E.g.' means 'for example' and introduces a sample from a larger set. 'I.e.' means 'that is' and restates one specific thing. Put a comma after both."
---

You ship clean code. The migration is solid, the tests are green, the logic is tight. Then your reviewer reads the PR description: *"the API returns it's status code."*

Nothing is broken. But something small just shifted. That stray apostrophe whispers *moving fast, not checking* - and it does it on the one part of your work that managers, recruiters, and teammates actually read end to end.

These tiny word mix-ups are the cheapest possible upgrade to how senior you sound. Fix a handful of them and your writing instantly reads as more careful, without changing a single line of code.

## Why this matters

Your code gets reviewed by a compiler. Your writing gets reviewed by humans - and humans judge fast.

A commit message, a PR title, a Slack standup, a doc comment: these are tiny, high-frequency windows into how you think. Get the small words right and people unconsciously trust the big decisions more.

The good news is that none of this requires "knowing grammar." It requires knowing about ten specific pairs and one or two tricks for each. That's it. You already move fast and write all day - you just need a quick self-check that runs in the background.

## The 30-second rule that covers most of them

Before the details, here's the shortcut that catches the majority of mistakes:

- **Apostrophe = two words.** If you can expand it (*it is, you are, they are, who is*), use the apostrophe version (*it's, you're, they're, who's*). If you can't, use the plain one (*its, your, their, whose*).
- **then = time, than = comparison.** First this, *then* that. Faster *than* before.
- **affect = the verb, effect = the noun.** This will *affect* the cache. The *effect* on the cache is small.
- **One word for the thing, two words for the action.** A *login* screen, but please *log in*. The *setup* is done, but *set up* the env.

If you only remember those four lines, you've fixed most of what trips developers up. The rest of this article is the why - the part that makes it stick.

## The apostrophe test: "can I expand it to two words?"

This single test handles the most common and most embarrassing errors at once.

The apostrophe in English usually marks a **missing letter** - a squished-together pair of words. So when you see one, ask: *what two words is this short for?*

| Word | Expands to | Use when |
|---|---|---|
| **it's** | it is / it has | "it's failing" = it *is* failing |
| **its** | - (no expansion) | "its config" = the config belonging to it |
| **you're** | you are | "you're blocked" |
| **your** | - | "your branch" |
| **they're** | they are | "they're merging" |
| **their** | - | "their service" |
| **there** | - | "deploy it there" / "there is a bug" |
| **who's** | who is / who has | "who's on call?" |
| **whose** | - | "whose PR broke main?" |

The trap is *its* and *your* and *their*. These feel like they should take an apostrophe because they show ownership, and ownership usually does (*the API's status, Sarah's branch*).

But possessive pronouns are the exception. We don't write *hi's* or *her's* - and *its* follows the same family. **Its** is to **it** what **his** is to **he**.

So: "the API returns it**s** status code" (ownership, no apostrophe). "it**'s** returning a 500" (it *is* returning).

## One word or two? The space tells you it's an action

English loves to take a verb and freeze it into a noun. When it does, the space disappears.

| Noun (one word) | Verb (two words) |
|---|---|
| a **login** screen | please **log in** |
| the **setup** is done | **set up** the env |
| run a **backup** | **back up** the DB |

The reliable trick: **try to slip a word between the two halves.** If it still makes sense, it's a verb, so keep the space.

- "log quickly **in**" → works → verb → **log in**
- "set the env **up**" → works → verb → **set up**
- You can't say "a log quickly in screen," so the noun stays welded: **login**.

In practice this means: *"please log in to the dashboard"* (action) but *"the login page is broken"* (thing).

## then vs than, affect vs effect, and the small comparisons

A few pairs aren't about apostrophes or spaces - they're just two words that look almost identical. Each has a one-letter memory hook.

**then vs than** - **a** for compare (th**a**n / comp**a**re), **e** for sequence (th**e**n / first th**e**n n**e**xt). "This build is slower **than** the last one." "Run the tests, **then** deploy."

**affect vs effect** - **A**ffect = **A**ction (the verb). **E**ffect = **E**nd result (the noun). "Will this **affect** the cache?" "What's the **effect** on the cache?"

**fewer vs less** - if you can count them with an **-s** plural (3 errors, 5 retries) → **fewer**. If you can't (traffic, memory, downtime) → **less**. "We had **fewer** errors after the fix." "There's **less** downtime now."

**accept vs except** - acc**ept** = take it in; **ex**cept = **ex**clude it. "**Except** for the timeout, all tests pass" (leaving one out). "The endpoint will **accept** the payload" (receive it).

**to / too / two** - **too** = also, or excessive ("too slow," "me too"). **two** = the number 2. **to** = everything else, the default. "The retry count is **too** high."

**into vs in to** - **into** = movement or result, one word ("merge it **into** main"). **in to** = the two words just happen to land next to each other ("log **in to** the box" = log in + to the box).

**i.e. vs e.g.** - **e.g.** = *for example* (one sample from many). **i.e.** = *that is* (restating one exact thing). Put a comma after both. "Retry on transient errors, **e.g.**, 502 and 503" (examples). "Use the canonical store, **i.e.**, the Postgres primary" (the one specific thing).

## Common misconceptions

**"Ownership always takes an apostrophe."**
Not for pronouns. *Its, your, their, whose, his, hers* show ownership with no apostrophe at all. The apostrophe versions (*it's, you're, they're, who's*) are always short for two words.

**"affect and effect are interchangeable if you're close."**
They're different parts of speech, and reviewers notice. Mixing them is the grammar equivalent of a type error - it usually still compiles, but it signals you didn't check.

**"less and fewer mean the same thing."**
Casually, people use *less* for everything. But *fewer errors* vs *less memory* is the kind of precision that reads as senior, and it's an easy win.

**"login/log in is too pedantic to matter."**
It's one of the most common splits in technical writing, and getting it wrong shows up constantly - in buttons, docs, error messages, and tickets. "Please login" on a real UI is a small tell that nobody proofread it.

## How to use this in your daily writing

You don't need to slow down. You need a five-second scan before you hit send.

1. **Spot any apostrophe word** (*it's, you're, they're, who's*). Expand it in your head. If "it is / you are" doesn't fit, drop the apostrophe.
2. **Spot any login/setup/backup.** Ask: *is it a thing or an action?* Thing = one word. Action = two words.
3. **In commit messages, scan the big four:** its/it's, lose/loose, then/than, login/log in. Example: `fix: prevent session from being lost on log in`.
4. **In PR titles, watch comparisons:** "smaller bundle **than** before," never "then."
5. **In Slack standups, kill the texting leak:** write "your PR is ready," not "ur PR is ready"; "they're reviewing," not "there reviewing." Capitalize **I** and the first word.
6. **In comments and docs, use e.g. for examples and i.e. to restate** - with a comma after each.

Do this for two weeks and it stops being a checklist. It becomes the way you write.

## Quick drills (cover the answers first)

Test yourself. Fix or choose, then check below.

1. Fix: `your going to want to rebase before you push`
2. Choose: The new query is faster (then / than) the old one.
3. Fix: `the cache keeps it's value after restart`
4. Choose: Please (login / log in) and run the seeder.
5. Fix: `we have less open tickets then last sprint`
6. Choose: This change won't (affect / effect) the public API.
7. Fix: `accept for one flaky test, the suite is green`
8. Fill in: `____ branch is this, and ____ reviewing it?` (whose / who's)
9. Choose: Merge the hotfix (into / in to) main.
10. Choose: The retry count is (to / too / two) high.

**Answers:** (1) **You're** going to want to rebase before you push. (2) **than** - a comparison. (3) the cache keeps **its** value - belonging to it, no apostrophe. (4) **log in** - a verb, two words. (5) we have **fewer** open tickets **than** last sprint. (6) **affect** - the verb. (7) **Except** for one flaky test - leaving one out. (8) **Whose** branch is this, and **who's** reviewing it? (9) **into** - movement into main. (10) **too** - excessive.

## Conclusion

Here's the one thing to keep: **an apostrophe almost always means two words got squished together.** Master that single test and you've solved its/it's, you're/your, they're/their, and who's/whose in one move - the bulk of what makes writing look rushed.

The deeper lesson is that clarity compounds. The same instinct that makes you write *log in* instead of *login* is the instinct that makes your variable names readable and your error messages helpful. Small precision, everywhere, is what "senior" actually feels like up close.

Now that the words are clean, the next leak to plug is structure: why does *"This breaks when you click."* land so much harder than a 40-word run-on? That's where short sentences and the rhythm of good technical writing come in - and it's an even bigger upgrade than the apostrophe.
