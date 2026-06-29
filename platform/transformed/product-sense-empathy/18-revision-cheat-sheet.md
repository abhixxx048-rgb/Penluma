---
title: The UX Cheat Sheet to Read Before You Ship Any Screen
metaTitle: UX Cheat Sheet: Check Before You Ship
description: A fast, scannable UX cheat sheet of the laws, heuristics, and checks to run before you ship any screen — so users find it, read it, and know it worked.
keywords:
  - UX cheat sheet
  - usability checklist
  - laws of UX
  - Nielsen heuristics
  - before you ship UI
  - product design checklist
  - cognitive load
  - mental model design
  - empty and error states
  - make UI obvious
  - Hick's Law
  - Fitts's Law
faq:
  - q: What should I check before shipping a new screen?
    a: Confirm the user can find the key action, read every label in plain words, and know it worked after they act. Also handle loading, empty, and error states, and test on a 375px phone width.
  - q: What are the laws of UX in simple terms?
    a: They are short rules of thumb about how people behave. For example, more choices slow decisions (Hick's Law), people hold about seven items in mind (Miller's Law), and bigger, closer buttons are faster to hit (Fitts's Law).
  - q: What are Nielsen's 10 usability heuristics?
    a: They are ten classic design checks, including visibility of system status, matching the real world, user control with undo, consistency, error prevention, and recognition over recall.
  - q: Why does my UI confuse users when it looks fine to me?
    a: This is the curse of knowledge. You know how it works, so the gaps are invisible to you. Test with real beginners who have never seen the screen.
  - q: How do I reduce cognitive load in an interface?
    a: Show less at once, group related items, and let users recognize options instead of recalling them. Default to what most people want so they configure nothing.
topic: product-sense-empathy
topicTitle: Product Sense & Empathy
category: Thinking & Decisions
date: '2026-06-21'
order: 17
icon: ❤️
author: Pritesh Yadav
transformed: true
sources: []
---

You can feel a bad screen in about three seconds. Something is off, you hesitate, you squint, you click the wrong thing. The strange part is that the people who built it never feel it — to them, everything is obvious.

This is the cheat sheet for closing that gap. It is a fast, scannable recap of the principles, laws, and checks that turn "looks fine to me" into "anyone can use this." Read it before you ship any screen.

## Why this matters

Users do not grade your effort. They grade their experience.

A screen that confuses one person will confuse thousands. And the cost is invisible: people do not file a complaint, they just quietly fail, give up, or trust you a little less. You rarely see the abandonment — you only see the metrics drop.

The good news is that "obvious" is not a talent. It is a checklist. The teams who ship clear, calm interfaces are not more gifted; they just run the same set of questions every time before they hit deploy. This page is that set of questions.

## The core principles

These are the ideas everything else hangs on. If you only remember a handful, remember these.

- **Absorb complexity so the user doesn't have to.** Your job is to take the hard problem and give it an obvious surface. The messy work happens behind the scenes.
- **Design for the job, not the feature.** Ask what progress the person is trying to make. Nobody wants a "filter" — they want to find the one order from last Tuesday.
- **Match the mental model.** Make the thing work the way people already assume it works. Fighting their expectations is a fight you lose.
- **Close both gulfs.** Make actions easy to find (the gulf of execution) and make results easy to read (the gulf of evaluation). A button they can't find and a result they can't interpret are the same failure.
- **Cut cognitive load.** Show less, group the rest, and favor recognition over recall. Don't make people hold things in their head.
- **Default to what 90% want** so most users configure nothing. A good default is a decision you made so they didn't have to.
- **Every state is mandatory.** Loading, empty, and error are not edge cases — they are part of the screen. Design them on purpose.
- **Never show raw output.** No error codes, UUIDs, or stack traces. Plain language only, every time.

Here is the thread running through all of it: every one of these moves complexity off the user and onto you. That is the whole craft in one sentence.

## The laws of UX, in plain words

These "laws" are just reliable patterns in how people behave. Treat them as nudges, not commandments.

| Law | What it says | So you should… |
| --- | --- | --- |
| **Hick's Law** | More choices mean slower decisions | Trim the options, or reveal them in stages |
| **Miller's Law** | People hold roughly seven items in mind | Chunk and group content into small sets |
| **Fitts's Law** | Bigger, closer targets are faster to hit | Make key buttons large and easy to reach |
| **Jakob's Law** | People expect your app to work like other apps | Follow the patterns they already know |
| **Peak-end rule** | An experience is judged by its peak and its ending | Build strong high points and clean endings |
| **Curse of knowledge** | Experts forget what beginners find confusing | Test with real beginners, not your teammates |

A quick example for Jakob's Law: when you put the shopping cart icon in the top right, you are not being unoriginal — you are being kind. People already know to look there, so you spend their attention on the thing that matters instead of teaching them your layout.

And the curse of knowledge is the sneaky one. You wrote the code, so the screen can never surprise you. That is exactly why your own judgment is the least trustworthy test in the room.

## Nielsen's 10 usability heuristics

These are the field's classic ten checks — a quick audit you can run against almost any interface.

1. **Visibility of system status** — always show what's happening.
2. **Match between the system and the real world** — speak the user's language.
3. **User control and freedom** — give an easy undo and an obvious escape.
4. **Consistency and standards** — same thing, same look, same word.
5. **Error prevention** — stop mistakes before they happen.
6. **Recognition rather than recall** — show options, don't make people remember them.
7. **Flexibility and efficiency** — let beginners and experts both move fast.
8. **Aesthetic and minimalist design** — every extra element competes for attention.
9. **Help users recover from errors** — say what went wrong and how to fix it, in plain words.
10. **Help and documentation** — make it findable when someone needs it.

## The "make it obvious" checklist

When a control is confusing, the failure is almost always one of these eight things. Run down the list and you'll usually find the culprit.

- **Placement** — is it where someone would intuitively look?
- **Label** — plain words, no jargon? ("Store Name," not "slug.")
- **Signifier** — does it look clickable, draggable, or editable?
- **Default** — is it set to the common case?
- **Feedback** — does the user know it worked?
- **Constraint** — is the wrong action prevented, not just punished afterward?
- **Empty / error state** — does it offer a helpful next step instead of a blank screen or a raw error?
- **Confirmation** — for destructive actions, does it say exactly what will be lost?

## Common misconceptions

A few beliefs feel right and quietly wreck good design.

- **"More options means more power."** More options usually means more hesitation. Power comes from sensible defaults plus the ability to go deeper when you actually need to.
- **"If it looks clean, it's usable."** Pretty and usable are different things. A gorgeous screen with a hidden primary action still fails.
- **"It's obvious — I can use it fine."** You built it. Of course you can. The only test that counts is whether a first-timer can.
- **"Errors are rare edge cases."** Errors, empty states, and slow loads are part of normal life for your users. If you didn't design them, you shipped a blank wall.

## How to use this: ask before you ship

Before any screen goes out, walk through these eight questions out loud. Answer them honestly, not hopefully.

1. **What job is the user doing here?** Name it in one sentence.
2. **Where would a beginner look for this?** Is the control actually there?
3. **Is the most common action the easiest one?** The default path should be the happy path.
4. **Are loading, empty, and error all handled?** Open the screen with no data and with a failure, and look.
5. **Would a non-technical owner understand every label** without asking you?
6. **After they act, do they know it worked?** Find the feedback. If you can't, neither can they.
7. **Did you test it at 375px,** a real phone width?
8. **Are you tricking or pressuring anyone?** No fake urgency, no buried opt-outs, no dark patterns.

If a question makes you wince, that's your to-do list. Fix it before you ship, not after a user finds it.

## Conclusion

Here is the one idea to carry out of all this: **obvious is not luck — it's a checklist.**

If a user couldn't find it, the placement is wrong. If they couldn't read it, the label is wrong. If they didn't know it worked, the feedback is missing. Every confusing screen traces back to a check that got skipped.

So the real skill isn't talent — it's the discipline to run the list every single time. And the deepest item on that list is the hardest to see in yourself: the curse of knowledge, the reason your own eyes are the worst judge of your own work. The next question worth chasing is how the best teams design that blind spot away — by testing with real beginners before a single line of confusion ever reaches a real user.
