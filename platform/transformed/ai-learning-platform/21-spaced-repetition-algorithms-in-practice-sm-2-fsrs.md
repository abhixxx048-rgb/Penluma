---
title: 'Spaced Repetition Algorithms: From Leitner to SM-2 and FSRS'
metaTitle: 'Spaced Repetition Algorithms: SM-2 vs FSRS'
description: >-
  How spaced repetition algorithms decide when you review a flashcard next.
  A plain-language tour of Leitner boxes, SM-2, Anki, and FSRS, and which to use.
keywords:
  - spaced repetition algorithm
  - SM-2 algorithm
  - FSRS algorithm
  - spaced repetition
  - Anki scheduling
  - Leitner system
  - flashcard scheduling algorithm
  - forgetting curve
  - SM-2 vs FSRS
  - how Anki schedules cards
  - active recall
  - memory retention algorithm
  - ease factor Anki
  - optimal review interval
faq:
  - q: What is the difference between SM-2 and FSRS?
    a: >-
      SM-2 is a simple 1980s formula that multiplies your review interval by a
      single "ease" number each time you pass a card. FSRS is a modern model
      that predicts your actual probability of recall using three separate
      factors and learns from millions of real reviews, so it schedules more
      accurately and with fewer reviews.
  - q: Which spaced repetition algorithm is best?
    a: >-
      For most people in 2026, FSRS is the best choice because it targets a
      retention rate you pick and adapts to your real memory. SM-2 is still
      perfectly good and easier to understand, and the paper Leitner system is
      great if you want zero software.
  - q: How does spaced repetition actually work?
    a: >-
      It schedules each review for the moment a memory is about to fade. Recalling
      something right as it starts to slip strengthens it the most and makes it
      decay more slowly, so each successful review buys a longer gap before the next.
  - q: Does Anki use SM-2 or FSRS?
    a: >-
      Anki used a modified version of SM-2 for years and now ships FSRS as a
      built-in option. You can switch to FSRS in the deck settings, and it will
      reschedule your existing cards based on their history.
  - q: What is a good retention target for spaced repetition?
    a: >-
      Around 85 to 90 percent is the usual sweet spot. Higher retention means
      more reviews for diminishing returns, while lower retention saves time but
      lets too much slip away. FSRS lets you set this number directly.
author: Pritesh Yadav (priteshyadav444)
transformed: true
linked: true
topic: ai-learning-platform
topicTitle: AI Learning Platform
category: AI & LLMs
date: '2026-06-28'
order: 20
icon: "\U0001F393"
sources:
  - https://en.wikipedia.org/wiki/Spaced_repetition
  - https://en.wikipedia.org/wiki/Leitner_system
---

You learn a new word today. By tomorrow most of it is gone. Review it the moment it starts slipping, though, and something strange happens: it sticks longer, and the next gap before you forget stretches out further. Do this a handful of times and a fact you once needed daily reminders for now needs one nudge a year.

That single trick is the engine behind every flashcard app you've ever used. But it hides a hard question: **exactly when** should you see a card again? Too soon wastes your time. Too late and you've already forgotten. This is the question that spaced repetition algorithms exist to answer, and they've gotten remarkably good at it.

## Why this matters

Whether you're learning a language, memorizing anatomy for a med-school exam, or building an AI tutor that [schedules reviews for thousands of learners](/blog/ai-learning-platform/20-sequencing-what-comes-next-and-when-to-review), the scheduling rule is the whole game. Get it right and a learner retains years of material with minutes a day. Get it wrong and they either burn out from over-reviewing or watch knowledge quietly leak away.

The same idea powers Duolingo streaks, Anki decks used by medical students worldwide, and [the memory systems inside modern learning platforms](/blog/ai-learning-platform/18-learner-models-teaching-the-machine-what-the-student-knows). Understanding how these algorithms decide "when next" tells you which app to trust, how to tune it, and why some setups feel magical while others feel like a treadmill.

Here's the reassuring part. The four systems below are not four rival inventions. They are **one idea getting sharper** over fifty years.

> **The watering-can analogy.** Picture a plant. Water it while the soil is still wet and you waste effort. Wait until it's bone-dry and the plant may die. The sweet spot is watering right as the leaves begin to wilt. Every algorithm here is just a different way of guessing when each fact "begins to wilt."

## Leitner boxes: the paper ancestor

In 1972, German journalist Sebastian Leitner described a system that needs no computer and no math. You set up a row of physical boxes, say five, each reviewed on its own schedule: Box 1 daily, Box 2 every few days, Box 3 weekly, Box 4 every two weeks, Box 5 monthly.

Every new flashcard starts in Box 1. The rule is delightfully simple:

- **Got it right?** The card moves **up** one box, so you'll see it less often.
- **Got it wrong?** The card drops all the way back to **Box 1** for daily drilling again.

```
 RIGHT -> move up a box (review less often)
 WRONG -> back to Box 1 (review daily)

 [Box 1]   [Box 2]   [Box 3]   [Box 4]   [Box 5]
  daily     ~3 day    weekly    2 weeks   monthly
   ^  \_______________________________________/
   |          a wrong answer sends any card here
   \--- new cards start here
```

**Why it works:** cards you know well drift toward the back and rest. Cards you keep missing stay up front where you grind them. The schedule expands automatically without you tracking a single date.

**Where it falls short:** every card in a box gets the *same* interval, no matter how easy or hard it is for you personally. A word you find trivially obvious and one that trips you up every time are treated identically once they share a box. That bluntness is exactly what the next system fixes.

## SM-2: giving every card its own memory

In the 1980s, Polish researcher Piotr Woźniak built SuperMemo and published the **SM-2** algorithm, the formula that still underlies a huge chunk of flashcard software today. Its big leap: instead of fixed boxes, every card carries its own growing interval and its own difficulty rating.

After each review you grade your recall, typically on a 0-to-5 scale (Anki simplifies this to buttons like *Again, Hard, Good, Easy*). SM-2 tracks three numbers per card:

1. **Interval** - how many days until the next review.
2. **Ease factor** - a multiplier, starting around 2.5, that says how fast this card's interval should grow.
3. **Repetitions** - how many times in a row you've passed it.

When you pass a card, the next interval is roughly the old interval times the ease factor. So a card at 10 days with an ease of 2.5 jumps to about 25 days, then ~62, then ~156. The gaps balloon as the memory hardens.

The clever bit is the **ease factor adjusting itself**. Grade a card as easy and its ease creeps up, so future intervals grow faster. Grade it hard and the ease shrinks, so it comes back sooner. Miss it entirely and the card resets to short intervals. Over time, easy cards practically schedule themselves out of your way while stubborn cards get the attention they need.

> **Mini case study.** Two medical students learn 2,000 drug facts. With Leitner, both review the same number of cards per box. With SM-2, the student who finds pharmacology intuitive sees their easy cards stretch to months apart within weeks, freeing huge amounts of time, while their genuinely hard cards keep surfacing. Same effort budget, far better aim.

**Where it falls short:** SM-2 leans on one number, the ease factor, to capture everything about a card. In practice, a single missed review can crater a card's ease and trap it in a punishing loop of short intervals, a well-known frustration users call **"ease hell."** And SM-2's intervals come from a hand-tuned formula, not from data about how people *actually* forget.

## Anki: SM-2, refined by millions of reviews

Anki, the free flashcard app beloved by language learners and medical students, ran for years on a **modified SM-2**. It kept the core idea (per-card intervals and an ease factor) but added practical touches: friendlier grading buttons, **fuzz** that randomly jitters intervals so cards don't all pile up on the same day, configurable limits on new and review cards, and gentler handling of lapses.

This is the version most people picture when they think "spaced repetition." It's robust, well understood, and good enough that millions of people have learned enormous amounts with it. But it inherited SM-2's blind spot: it doesn't truly *model* memory. It applies sensible rules and hopes they match how you forget.

That gap is what the newest system closes.

## FSRS: predicting forgetting from real data

**FSRS** stands for **Free Spaced Repetition Scheduler**, and it's the current state of the art, now built directly into Anki. Instead of multiplying by a single ease number, FSRS predicts the actual probability that you'll remember a card at any given moment, using a memory model trained on **hundreds of millions of real reviews**.

FSRS describes each card with three separate ideas, not one:

- **Difficulty** - how inherently hard this card is for you.
- **Stability** - how many days until your chance of recalling it drops to a set level. Higher stability means a slower [forgetting curve](/blog/ai-learning-platform/07-spaced-repetition-beating-the-forgetting-curve).
- **Retrievability** - your probability of recalling it *right now*, which falls as time passes since the last review.

The headline feature is that **you choose your target retention** directly, say 90 percent. FSRS then schedules each card for the day your predicted recall dips to that number, no sooner, no later. Want to study less and accept a bit more forgetting? Drop the target. Cramming for a high-stakes exam? Raise it. The algorithm recomputes every interval to hit your goal.

> **What this buys you.** Independent comparisons consistently show FSRS reaching the same retention as SM-2 with meaningfully fewer reviews, often 20 to 30 percent fewer, because it stops over-reviewing cards you'd have remembered anyway and stops neglecting ones you're about to lose. Same knowledge, less time at the desk.

It also dissolves "ease hell." Because difficulty and stability are tracked separately, a single bad day doesn't permanently poison a card's schedule.

## Common misconceptions

- **"Spaced repetition means reviewing on a fixed schedule."** No. The whole point is *expanding, personalized* gaps. Fixed daily review is just cramming spread thin.
- **"More reviews equal better memory."** Past a point, extra reviews are wasted effort. The goal is to review at the *last useful moment*, not constantly. That's why FSRS optimizes for fewest reviews at a chosen retention.
- **"FSRS is just a fancier SM-2."** They're different in kind. SM-2 applies a formula. FSRS predicts a probability of recall from data and schedules against a retention target you set.
- **"A higher retention target is always better."** Aiming for 99 percent retention can multiply your daily review load for tiny gains. Most people are happiest around 85 to 90 percent.
- **"You must grade every card honestly on a fine scale."** The algorithms are robust to rough grading. Consistent, quick honesty beats agonizing over whether something was a *Hard* or a *Good*.

## How to use this

1. **Pick FSRS if your tool offers it.** In Anki, open deck options and enable FSRS. It will reschedule existing cards from their history. This is the single biggest upgrade most learners can make.
2. **Set a retention target you can sustain.** Start at **90 percent**. If your daily review count feels crushing, lower it to 85. If you're prepping for a critical exam, nudge it up, knowing reviews will rise.
3. **Grade quickly and honestly.** Did you recall it without real effort? *Good* or *Easy*. Did you stall or guess? *Hard* or *Again*. Don't overthink the exact button.
4. **Cap new cards.** Adding 200 cards a day creates a review avalanche next week. A steady 10 to 30 new cards keeps the workload flat and predictable.
5. **Trust the long intervals.** When a card jumps to "8 months," resist the urge to review it early. Reviewing too soon weakens [the spacing effect](/blog/ai-learning-platform/03-how-humans-learn-a-plain-tour-of-memory) and wastes the gain.
6. **Write atomic cards.** One fact per card. The algorithms schedule a card as a single unit, so a card crammed with five facts will always feel "hard" and never settle.
7. **If you can't use software, run Leitner.** Five physical boxes and the move-up / drop-to-front rule capture most of the benefit with zero setup.

## Conclusion

The one idea to carry away: **the best moment to review something is the moment just before you'd forget it**, and these four systems are a fifty-year march toward pinpointing that moment. Leitner guessed with boxes, SM-2 gave each card its own clock, Anki polished the edges, and FSRS finally predicts your forgetting from real data so you study less and remember more.

But scheduling is only half the story. An algorithm can tell you *when* to review, yet it can't tell you *what's worth putting on a card in the first place* or how to phrase it so your brain actually grabs it. That craft of [writing memorable, recallable cards](/blog/ai-learning-platform/06-retrieval-practice-why-testing-beats-re-reading) is where good learners pull ahead of great algorithms, and it's where we head next.
