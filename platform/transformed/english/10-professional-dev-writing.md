---
title: 'Write Like a Senior Dev: Commits, PRs, and Code Reviews'
metaTitle: 'Write Like a Senior Dev: Commits & PRs'
description: >-
  Learn to write professional commit messages, pull requests, and code review comments.
  Small writing fixes that make your engineering work read as senior.
keywords:
  - how to write a commit message
  - commit message best practices
  - pull request description template
  - code review comment examples
  - imperative mood commit
  - professional developer communication
  - writing better PR descriptions
  - much vs many grammar
  - developer English
  - Slack standup format
  - code comment style
  - present tense docstring
faq:
  - q: How should I write a good commit message?
    a: Use the imperative mood, capitalize the first word, be specific, and skip the trailing period. "Fix cart total when quantity is zero" reads better than "fixed the bug." A good subject finishes the sentence "If applied, this commit will…"
  - q: Why is the imperative mood used in commit messages?
    a: Git itself generates imperative messages (like "Merge branch" and "Revert"), so matching that style keeps your history consistent. It also reads as an instruction the commit carries out, which is clearer than past tense.
  - q: What should a pull request description include?
    a: Answer three questions in complete sentences — what the change does, why it is needed, and how a reviewer can test it. The title acts as a commit-style summary.
  - q: How do I write a code review comment without sounding harsh?
    a: Name the specific problem and suggest a fix, ideally as a question. "This will fail for empty arrays — can we default to []?" feels collaborative, while "wrong" feels like an attack.
  - q: When do I use "much" versus "many"?
    a: Use "many" for things you can count (many bugs, many tests) and "much" for things you cannot (much code, much progress). If you can put a number in front of it, use "many" and add the -s.
author: Pritesh Yadav (priteshyadav444)
transformed: true
topic: english
topicTitle: English for Developers
category: Communication
date: '2026-06-15'
order: 10
icon: "\U0001F4DD"
sources: []
---

Two engineers ship the exact same fix. One writes `fixed the bug in cart`. The other writes `Fix cart total when quantity is zero`. A year later, someone scrolling the git history instantly understands the second one — and quietly trusts the person who wrote it.

Here's the uncomfortable truth: most of what your teammates know about your skill, they learn from your **writing**, not your code. Commit messages, pull requests, review comments, and standups are the parts of your work that other people actually read. Get the writing right and solid engineering reads as *senior* — no matter your accent or first language.

## Why this matters

You write all day, and almost none of it is code.

Every commit, PR description, review comment, Slack standup, and code comment is a small public sample of how you think. None of these break the build. But together, sloppy writing makes good engineering look unpolished — and clean writing makes ordinary work look deliberate and trustworthy.

The good news: the fixes are **mechanical**. These aren't subtle style judgments. They're patterns. Once you see a pattern, you stop making the mistake forever.

## The 30-second version

If you remember nothing else, remember these four:

- **Commits:** imperative mood, capitalized first word, no period at the end of the subject. *"Fix null guard on checkout"* — not *"fixed the null guard."*
- **PRs, comments, Slack, docs:** write **complete sentences.** Capital letter at the start, full stop at the end, no texting shortcuts (`u`, `ur`, `pls`).
- **Reviews:** be specific, not blunt. Say what's wrong *and* suggest the fix. *"This throws when input is null"* beats *"this wrong."*
- **Code comments and docstrings:** present tense, full sentence. *"Returns the cached price."* — not *"return cached price."*

The rest of this article shows you exactly how, with examples you can copy today.

## The commit message: your most-read sentence

A commit subject has a formula:

> `<Verb in imperative> <what> [<where or condition>]`

The simplest test: your subject should finish the sentence **"If applied, this commit will…"**

- *"…Fix cart total when quantity is zero."* — reads perfectly.
- *"…fixed the bug."* — grammatically wrong, and tells you nothing.

Start with an imperative verb in its base form: **Add, Fix, Remove, Update, Refactor, Rename, Bump, Document, Revert.** Not *Added*, not *Fixes*, not *Fixing* — just *Add*, *Fix*.

| Instead of this | Write this |
|---|---|
| `fixed the bug in cart` | `Fix cart total when quantity is zero` |
| `Update readme.` | `Update README with setup steps` |
| `adding new endpoint for invoices` | `Add invoices endpoint` |

Two small rules that catch most people:

1. **No period at the end of the subject.** It's a title, not a sentence. Periods are fine in the body.
2. **Keep the subject under about 50 characters.** Tools truncate long subjects, so front-load the important words.

**And the body?** If the *why* isn't obvious, leave a blank line and explain it in full sentences. The diff already shows *what* changed — the body's job is to answer *why* it needed changing. Future-you, debugging at 2 a.m., will be grateful.

## The pull request: answer three questions

A PR title is just a commit-style summary. The description is where you save your reviewer twenty minutes of guessing.

Good descriptions answer three questions in complete sentences:

1. **What** does this change?
2. **Why** is it needed?
3. **How** did you build it — and how can a reviewer test it?

That's it. You don't need an essay. You need a reviewer who can open your PR and immediately know what they're looking at and what to click to verify it.

## Code review comments: collaborate, don't command

This is where careless writing does the most damage to relationships.

A comment like `this wrong` or `no` lands like a slap. It names no problem and offers no path forward. Compare:

- `this wrong, change it`
- `This looks like it will throw when input is null — should we guard it?`

The second one does three things: it **names the specific problem**, it **suggests a fix**, and it **asks a question** instead of issuing an order. Questions feel like teamwork. Commands feel like a verdict.

A handy template: *"This will fail for empty arrays — can we default to `[]`?"* State the issue, then propose a direction.

## Slack and standups: it's a report, not a text

Standup messages are tiny status reports, so write them like reports — not like a text to a friend.

- ❌ `done with cart, starting checkout now, blocked on payment gateway`
- ✅ `Yesterday I finished the cart. Today I'm starting checkout. I'm blocked on the payment gateway.`

Three full sentences: yesterday, today, blockers. Capital letters, full stops, no `u` or `ur`. It takes ten extra seconds and reads twice as clearly.

## Code comments: present tense, please

A comment describes what code *does*, right now, every time it runs. So use the **present tense**, write a full sentence, and capitalize it.

- ❌ `// return cached price`
- ✅ `// Returns the cached price.`
- ❌ `// this is checking if the user is logged in`
- ✅ `// Checks whether the user is logged in.`

Notice the second fix also drops the wordy *"this is checking."* Present-tense verbs are shorter and clearer: *Validates the upload and returns the relative path.*

## Common misconceptions

**"Texting shortcuts are fine — everyone gets it."** They do get it. They also register, half-consciously, that you didn't slow down. `pls review when u get time` quietly signals less care than `Please review when you get a chance.` In professional channels, spell out the words.

**"A trailing period in a commit subject doesn't matter."** It's small, but the convention exists for a reason — the subject is a title, and `Update README.` against a hundred clean subjects reads as an inconsistency.

**"Past tense is more accurate for commits because the work is done."** Git disagrees. Git's own auto-generated messages ("Merge branch…", "Revert…") are imperative, so the imperative mood keeps your history consistent and reads as an instruction the commit carries out.

**"Blunt reviews are just being honest and efficient."** Specificity is efficient. Bluntness without specifics (`wrong`, `no`) forces a back-and-forth to discover what you actually meant — slower *and* harsher.

## The small words that trip everyone up

These are the leaks that make otherwise-clean writing look hurried.

**Much vs. many.** Use **many** for things you can count, **much** for things you can't.

| Uncountable → `much` | Countable → `many` |
|---|---|
| much code, much work, much progress | many bugs, many mistakes, many tests |
| much feedback, much research | many commits, many endpoints, many files |

The quick test: if you can put a number in front of it (*3 bugs*), it's countable — use **many** and add the `-s`. So *"so much mistake"* becomes *"so many mistakes."*

**Articles (a / an / the).** A singular countable noun almost always needs one in front of it.

- Use **a/an** for one unspecified thing: *open **a** pull request.*
- Use **the** for a specific, known thing: *merge **the** PR you opened.*

So *"i opened pull request"* becomes *"I opened **a** pull request."*

**Spelling watchlist.** A handful of words show up misspelled constantly: *grammar* (not *grammer*), *research* (not *reaseach*), *separate*, *definitely*, *occurred*, *received*, *environment*, *length*.

## How to use this

Don't try to fix everything at once. Build the habits in order:

1. **This week, fix only commits.** Start every subject with an imperative verb (Add, Fix, Update). Capitalize it. Drop the trailing period. Keep it under 50 characters.
2. **Next, upgrade PR descriptions.** Before you click create, write three sentences: what, why, and how to test.
3. **Reframe one review comment per day.** Catch yourself before typing *"wrong"* — instead name the problem and ask a question.
4. **Punctuate your standups.** Three complete sentences: yesterday, today, blockers. No texting shortcuts.
5. **Clean comments as you write them.** Present tense, full sentence, capitalized.
6. **Keep the watchlist nearby.** When you hit *much/many*, an article, or a word from the spelling list, pause for one second and check.

A quick self-test you can run on any commit: does the subject finish *"If applied, this commit will…"*? If yes, ship it.

## Conclusion

The single takeaway: **the writing around your code is the part most people actually read, so make it deliberate.** A clear commit, a specific review comment, a punctuated standup — each is a tiny signal that you slow down and care. Stack those signals and your work reads as senior.

And here's the curious part: none of this required you to become a better *writer* in some literary sense. You just learned a handful of mechanical patterns. The next frontier is tone — the difference between a message that gets a fast "yes" and one that gets ignored. How do you ask for a review, push back on a decision, or say "I disagree" in a way that keeps the room with you? That's where good engineers become people others *want* to work with.
