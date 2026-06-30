---
title: "Subject-Verb Agreement: Why \"The Tests Passes\" Hurts"
metaTitle: "Subject-Verb Agreement Made Simple"
description: "Learn subject-verb agreement the practical way. Stop writing 'the tests passes' or 'the users is' so your PRs, standups, and commits read clean and credible."
keywords:
  - subject verb agreement
  - subject verb agreement rules
  - singular or plural verb
  - the tests pass or passes
  - each is or are
  - there is vs there are
  - english for developers
  - common grammar mistakes
  - collective nouns singular or plural
  - many vs much
  - one of the tests fails
  - data is or data are
faq:
  - q: "Is it 'the tests pass' or 'the tests passes'?"
    a: "It's 'the tests pass.' A plural subject takes a verb with no -s. Only a singular subject ('the test passes') adds the -s."
  - q: "Is it 'each of the services need' or 'needs'?"
    a: "It's 'each of the services needs a restart.' The word 'each' is always singular, so the verb takes -s, no matter how many services follow."
  - q: "When do I use 'there is' versus 'there are'?"
    a: "Match the verb to what comes after it. 'There is one bug' (singular) but 'There are two bugs' (plural). For a mixed list, match the first item."
  - q: "Is 'data' singular or plural?"
    a: "In everyday and developer writing, treat 'data' as singular: 'the data is missing.' The strictly-plural 'data are' is now mostly limited to formal scientific papers."
  - q: "Is a team or group singular or plural?"
    a: "In American English, treat collective nouns like team, group, and staff as singular by default: 'The team is shipping today.' British writing sometimes uses plural, but singular is the safe choice."
  - q: "Why do I keep getting subject-verb agreement wrong?"
    a: "Usually because a long phrase sits between the subject and the verb, so you match the nearest word instead of the true subject. Find the real subject first, then pick the verb."
topic: english
topicTitle: English for Developers
category: Communication
date: '2026-06-15'
order: 3
icon: "\U0001F4DD"
author: Pritesh Yadav (priteshyadav444)
transformed: true
sources: []
linked: true
---

You ship a clean fix. The logic is solid, the tests are green, the review should be a formality. Then your PR description says "the tests passes now" and a reviewer's eyes snag on it. Nothing is broken, but suddenly your careful work reads as careless.

That tiny mismatch between subject and verb is one of the most common things that makes strong technical writing look sloppy. The good news: the rule behind it is small, and once it clicks, you stop second-guessing.

## Why this matters

Your code is read by machines, but your *writing* is read by people who decide things about you. PR descriptions, standup updates, [commit messages](/blog/english/10-professional-dev-writing), bug reports, design docs. Those are the surfaces where teammates and managers form an impression of how careful you are.

A line like "the users is logged out randomly" doesn't change what your code does. But it quietly tells the reader, "this person doesn't proofread." Fixing agreement is one of the highest-leverage polish moves you can make, because it's cheap to learn and it shows up everywhere you write.

## The core idea: the verb matches the doer

Every sentence has a **subject** (the thing doing the action) and a **verb** (the action). Subject-verb agreement just means: the form of the verb has to match whether the subject is *one thing* or *many things*.

- **One thing → singular verb.** "The test **passes**."
- **Many things → plural verb.** "The tests **pass**."

Here's the part that trips people up coming from many other languages: in English, the **singular** verb is usually the one with the extra **-s**, and the plural verb has no -s. It feels backwards, because on nouns the -s means "more than one." On verbs it's the opposite.

Think of it like a seesaw. The -s sits on one side or the other, never both: "the dog runs" (s on the verb) versus "the dogs run" (s on the noun). One -s per seesaw.

## Watch out: match the real subject, not the nearest noun

The single biggest source of mistakes is a phrase sitting between the subject and the verb. Your ear grabs the closest noun and matches the verb to that, even though it isn't the real subject.

> "The list of failing files **is** ready."

The subject is **list** (one list), not **files**. The list is ready. So the verb is **is**, even though "files" is sitting right next to it.

A reliable trick: **cross out the "of ..." phrase, then choose the verb.**

| Subject phrase | Real subject | Correct verb |
|---|---|---|
| the list of files | list | is / was |
| a set of rules | set | applies |
| one of the tests | one | fails |
| each of the configs | each | needs |
| the array of users | array | contains |

So "one of the migrations **fails** on prod" (the subject is *one*), not "fail." And "a set of rules **applies** here," not "apply."

## The "always singular" crew

A handful of words are singular even though they feel like they cover a lot of things. Memorize this group, because they catch almost everyone:

**each, every, everyone, everybody, someone, anyone, nobody, neither (alone), one of ...**

All of them take a singular verb (usually verb + s, or "is"/"has"):

- "Each endpoint **returns** JSON."
- "Everyone **has** access to the repo." (not *have*)
- "Neither of the builds **passes** lint." (not *pass*)
- "Everybody **is** here."

Mnemonic: anything ending in **-one** or **-body**, plus **each** and **every**, points at one item at a time. One at a time means singular.

## "There is" vs "there are"

When a sentence starts with "there," the real subject comes *after* the verb, so match the verb to that:

- "There **is** one failing test." (one → is)
- "There **are** two open PRs." (two → are)

For a mixed list, match the **first** item: "There **is** one error and three warnings."

## Collective nouns: team, group, staff, list

Words like **team**, **group**, **staff**, and **list** describe many people or things but act as one unit. In American English, treat them as **singular** by default:

- "The team **is** shipping today."
- "The QA team **owns** this flow."

British writing sometimes allows "the team **are**," but if you want one safe rule, stay singular.

## Common misconceptions

**"More things in the sentence means a plural verb."**
No. The number of *nouns* nearby doesn't matter, only the real subject. "The list of seventeen broken files **is** here" still uses **is**, because the subject is one list.

**"'Each of the services' is plural because there are many services."**
No. "Each" is the subject and it's always singular: "each of the services **needs** a restart."

**"'Data' must always be plural."**
Not anymore in practical writing. Treat **data** as singular: "the data **is** missing in the response." The plural "data are" now lives mostly in formal scientific papers.

**"'None' is always singular."**
Often it reads better as plural with a plural "of" phrase: "**none** of the endpoints **are** documented" sounds natural and is widely accepted.

## A related slip: many vs. much

Dropping a plural -s on the noun quietly breaks agreement too. The fix is the [**countable test**](/blog/english/02-countable-uncountable-much-many):

- **Can you count it?** → use plural -s + **many**: many mistakes, many bugs, many requests.
- **Can't count it (it's a mass)?** → use **much**: much progress, much memory, much traffic.

So "**so many mistakes** in this PR," never "so much mistake." Once the noun is correctly plural, the verb usually falls into place: "many tests **are** failing."

## How to use this

A quick checklist you can run on any sentence before you hit send:

1. **Find the doer.** Ask: who or what is doing the action? That's your subject.
2. **Cross out any "of ..." phrase** between the subject and verb so it stops distracting you.
3. **Decide: one or many?** One → singular verb (often + s, or *is/has*). Many → plural verb (no -s, or *are/have*).
4. **Check the special words.** If you see *each, every, everyone, one of, neither* → force it singular.
5. **For "there"**, look at what comes *after* the verb and match that.
6. **Spot dropped -s on nouns.** If something is countable and there's more than one, it needs the plural -s and "many."

Where it shows up in your day:

- **Commit messages:** "Fix race condition where the worker **drops** events." (one worker → drops)
- **PR titles:** "These changes **make** the build pass." (plural changes → make)
- **Standups:** "All the tests **pass** locally." / "One of my branches **is** still red."
- **Bug reports:** "The API **returns** 200 but the body **is** empty." (two singular subjects, two singular verbs)

## Practice: fix the agreement

Try these, then check yourself below. Watch for [dropped plurals](/blog/english/05-plurals-and-possessives) and [missing articles](/blog/english/01-articles-a-an-the) too.

1. the list of failing tests are getting longer.
2. each of the services run in its own container.
3. one of the env variables are missing on staging.
4. there is three open pull request on this repo.
5. everyone on the team have merge rights now.
6. the data from the webhook are not validated.
7. so much edge case is not covered by the test.
8. the API endpoints returns different shapes.

**Answers:**

1. The list of failing tests **is** getting longer. (subject is *list*)
2. Each of the services **runs** in its own container. (*each* is singular)
3. One of the env variables **is** missing on staging. (*one* is the subject)
4. There **are** three open pull **requests** on this repo. (three → are; add the plural -s)
5. Everyone on the team **has** merge rights now. (*everyone* is singular)
6. The data from the webhook **is** not validated. (treat *data* as singular)
7. So **many edge cases are** not covered by the test. (countable → many + plural → are)
8. The API endpoints **return** different shapes. (plural *endpoints* → no -s)

## Conclusion

If you remember one thing, make it this: **the verb agrees with the real subject, and the real subject is almost never the noun sitting right next to the verb.** Cross out the middle, find the doer, then choose.

Master this and your writing instantly reads more careful, which makes people trust the work behind it. Next, notice what happens to that same sentence when you switch from "the test passed" to "the test passes" to "the test is passing." Each tense sends a different message about *when* something happened and whether it's still true. That [choice of verb tense](/blog/english/04-verb-tenses) is where your bug reports go from confusing to crystal clear, and it's worth its own close look.
