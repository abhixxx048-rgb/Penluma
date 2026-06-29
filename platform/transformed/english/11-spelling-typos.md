---
title: "Spelling Mistakes Developers Make (and How to Fix Them)"
metaTitle: "Spelling Mistakes Developers Make Daily"
description: "Stop the typos that sneak into commits, PRs, and Slack. Learn the spelling mistakes developers get wrong most and simple tricks to fix them fast."
keywords:
  - spelling mistakes developers make
  - common developer typos
  - how to spell separate
  - i before e except after c
  - commit message spelling
  - professional writing for developers
  - definitely vs definately
  - recommend spelling
  - occurred spelling
  - English for developers
faq:
  - q: Why do I keep misspelling the same words even though I know them?
    a: Most repeated spelling mistakes are muscle-memory typos, not knowledge gaps. Your fingers move faster than your attention, so the same slips repeat. A two-second re-read plus spell-check retrains the habit.
  - q: How do you spell "separate" correctly?
    a: It is s-e-p-a-r-a-t-e. Remember "there's a rat in separate" - the tricky middle is sep-a-RAT-e, not "seper".
  - q: Is using spell-check cheating?
    a: No. Spell-check is a professional tool, like a linter for your writing. Turn it on in your editor, your PR box, and Slack so the machine catches what your eyes skim past.
  - q: What does "i before e except after c" actually mean?
    a: Use "ie" in most words (believe, achieve, field), but flip to "ei" after the letter c (receive, deceive, ceiling). A few exceptions like "weird" exist, but the rule covers the words you type most.
  - q: Is it okay to write "u", "ur", or "plz" at work?
    a: In a quick chat with a friend, sure. In commit messages, PRs, and team channels, spell out "you", "your", and "please" - full words read as careful and professional.
  - q: When do I double the last letter before adding -ing or -ed?
    a: "Double it when a short word is stressed on its last syllable: run becomes running, commit becomes committed. Do not double when the stress is elsewhere: open becomes opening, offer becomes offered."
topic: english
topicTitle: English for Developers
category: Communication
date: '2026-06-15'
order: 11
icon: "\U0001F4DD"
author: Pritesh Yadav (priteshyadav444)
transformed: true
sources: []
---

You ship clean code, then write "this seperate module" in the PR description. Nobody fails the build over it, but a reviewer notices. A misspelled commit message lives in the git history forever. And "plz check ur PR thx" reads fine to a friend and slightly unserious in a team channel.

Here is the good news: these are not knowledge gaps. They are muscle-memory typos, and muscle memory is easy to retrain.

## Why this matters

You write all day. Commits, standups, review comments, bug reports. Each one is a tiny signal about how careful you are.

"**Separate** the **environment** config" reads as someone who pays attention. "Seperate the enviroment config" reads as someone who was rushing. Same person, same skill, different impression.

The fix costs you about two seconds per message. No slowing down your typing, no memorizing a dictionary. Just a quick re-read and a spell-checker doing the boring part.

## The handful of words almost everyone gets wrong

A small set of words trips up nearly every developer. Learn these as fixed shapes - don't sound them out, just memorize the picture.

- **separate** - there's *a rat* in sep-a-RAT-e
- **definitely** - the word *finite* is hiding inside: de-FINITE-ly
- **recommend** - one c, two m: re-COMM-end
- **occurred** - double everything: oc-CURR-ed
- **necessary** - one c, two s: "one collar, two sleeves"
- **environment** - keep the n before -ment: enviro**N**-ment
- **parameter** - a *meter* measures it: para-METER
- **maintenance** - ends in -enance, not "-ainance"
- **receive** - i before e, except after c

Pin that list somewhere you can see it. After a week of glancing at it, your fingers learn the shapes on their own.

## Two rules that cover most of the rest

You don't need a grammar textbook. Two small rules handle the majority of spelling slips.

### i before e, except after c

Most words use "ie":

- bel**ie**ve, ach**ie**ve, retr**ie**ve, f**ie**ld

But after the letter c, flip it to "ei":

- rec**ei**ve, dec**ei**ve, c**ei**ling

Yes, English has rebels - "weird" and "seize" break the rule. But the rule still covers the words you actually type at work, so use it.

### Double the last letter (sometimes) before -ing and -ed

When a short word is **stressed on its last syllable**, double the final consonant:

- run becomes ru**nn**ing
- set becomes se**tt**ing
- commit becomes commi**tt**ed
- refer becomes refe**rr**ed

When the stress is *not* on that last syllable, leave it alone:

- open becomes opening (not "openning")
- offer becomes offered
- enter becomes entered

Say the word out loud. If the punch lands on the last part, double up. If it lands earlier, don't.

## Words that sound alike but mean different things

Spell-check won't catch these, because each one is a real word. You have to know which is which.

- **which** vs **witch** - "the branch *which* broke CI" (the witch is for Halloween, never your PR)
- **parameter** vs **perimeter** - "pass the timeout *parameter*" (a perimeter is a boundary length, that's geometry)
- **a lot** vs "alot" - "fixed *a lot* of typos" is two words; "alot" is not a word at all

## The texting habits that leak into work

Your phone trained you to type "u", "ur", "plz", and "thx". Those shortcuts are fast and friendly. They also quietly make professional writing look careless.

| What slips out | What to write |
|---|---|
| can u do reaseach on grammer | can you do **research** on **grammar** |
| ur branch is out of date | **your** branch is out of date |
| plz review thx | **please** review, **thanks** |
| this is depricated, dont use it | this is **deprecated**, **don't** use it |

It's not about being formal. It's about a team channel and a PR being shared, semi-permanent records - worth a few full words.

## Common misconceptions

**"If I misspell a word, people think I don't know it."** Not really. Everyone knows their typos for what they are. The cost isn't looking unintelligent; it's looking rushed. A clean message just reads as more trustworthy, especially in a bug report.

**"Slowing down to check spelling kills my speed."** The fix is not slower typing. It's a two-second re-read of the subject line and a spell-checker running in the background. You keep your speed and lose the slips.

**"Spell-check is for people who can't spell."** Spell-check is a tool, the same way a linter is a tool. Senior developers leave it on. It catches the thing your eyes skim past when you already know what the sentence is supposed to say.

## How to use this today

1. **Turn on spell-check everywhere you write.** Your editor (enable it for Markdown and code comments), your browser's PR box, and Slack. Let the machine do the boring catching.
2. **Re-read every commit subject line once before you save.** A typo there is permanent in git history. "fix: handle null **parameter** in webhook **receive** handler" - five seconds, zero regret.
3. **Pin the "always misspelled" list** near your screen: separate, definitely, recommend, occurred, necessary, environment, parameter, maintenance, receive. Glance at it until it sticks.
4. **Spell out you, your, please, and thanks** in any shared channel. Save "u" and "thx" for direct messages with friends.
5. **Treat code comments like docs.** They live in the codebase forever. `// receive the response, then retry if it occurred to fail` deserves the same care as a commit.
6. **Say the word out loud** when you're unsure about doubling a letter. The stress tells you whether to double.

## Quick self-test

Fix the issue in each. Answers below.

1. "can u do reaseach on grammer for me"
2. "this needs a seperate enviroment for testing"
3. "I definately recomend we merge this"
4. The error (A) occured or (B) occurred during the retry?
5. "plz review ur branch thx"
6. "this api is depricated and the dependancy is old"
7. open becomes ____ing; run becomes ____ing
8. "the maintainance window will continue untill the migration succeds"

**Answers:** 1. "Can you do research on grammar for me?" 2. "this needs a **separate environment** for testing" 3. "I **definitely recommend** we merge this" 4. **B, occurred** 5. "Please review your branch. Thanks!" 6. "this **API** is **deprecated** and the **dependency** is old" 7. **opening; running** (open isn't stressed on the last part, run is) 8. "the **maintenance** window will continue **until** the migration **succeeds**"

## Conclusion

The single takeaway: your spelling slips are habits, not flaws, and habits respond to a pinned list plus a two-second re-read. Fix the same nine words and turn on spell-check, and most of the problem disappears this week.

And once the spelling is clean, the next thing reviewers notice is the *shape* of your sentences - whether a commit message and a PR description actually read clearly. That's where punctuation and tense start doing real work, and it's worth a closer look next.
