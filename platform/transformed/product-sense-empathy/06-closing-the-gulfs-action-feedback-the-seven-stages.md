---
title: 'Why Your App Feels Broken (Even When the Code Works)'
metaTitle: 'Why Apps Feel Broken: The Two Gulfs'
description: >-
  Your code works, but users still call it broken. Learn Don Norman's two gulfs
  and seven stages of action to find exactly where a screen confuses people.
topic: product-sense-empathy
topicTitle: Product Sense & Empathy
category: Thinking & Decisions
date: '2026-06-21'
order: 5
icon: ❤️
keywords:
  - why apps feel broken
  - gulf of execution
  - gulf of evaluation
  - seven stages of action
  - Don Norman design
  - visibility of system status
  - UI feedback best practices
  - loading empty error states
  - signifiers vs affordances
  - jobs to be done
  - usability heuristics
  - response time limits UX
faq:
  - q: What is the gulf of execution?
    a: It is the gap between what a user wants to do and what the system lets them do. When someone stares at a screen thinking "how do I even start this?", the gulf of execution is too wide.
  - q: What is the gulf of evaluation?
    a: It is the gap between what the system did and whether the user can tell what happened. If you click Save and nothing visibly changes, you can't evaluate the result, so the app feels broken even if it saved.
  - q: What are the seven stages of action?
    a: Goal, plan, specify, perform, perceive, interpret, and compare. They are a diagnostic checklist for finding exactly where a task breaks, not a rigid sequence to memorize.
  - q: Why does my app feel broken when the code works fine?
    a: Usually because the user can't evaluate the outcome. Silence after an action, a status code instead of plain words, or a spinner that never resolves all leave the user guessing whether it worked.
  - q: How fast does UI feedback need to be?
    a: Under about 0.1 seconds feels instant. Past 1 second, signal that the system is working. Past 10 seconds, show a progress bar and a way to cancel, or users assume it froze.
  - q: What is the difference between an affordance and a signifier?
    a: An affordance is what an object lets you do, like a button affording a press. A signifier is the visible cue that the affordance exists, like the raised look that tells you it is clickable.
author: Pritesh Yadav
transformed: true
sources:
  - https://en.wikipedia.org/wiki/The_Design_of_Everyday_Things
  - https://en.wikipedia.org/wiki/Seven_stages_of_action
---

A user clicks Save. Nothing visibly changes. No message, no movement, just the same screen staring back. So they click again. And again. Then they email you: "Your app is broken."

Here is the strange part. Behind the scenes, the save worked perfectly the first time. The code did its job. The database updated. And yet, to the person at the keyboard, the software failed.

This is the gap at the heart of almost every "this feels broken" complaint. The good news: there's a precise vocabulary for finding exactly where and why a screen confuses people, and a short checklist to fix it.

## Why this matters

You can ship flawless code and still ship a frustrating product. Users don't experience your code. They experience the screen, the wait, and the answer to one nervous question: "Did that work?"

When the answer isn't obvious, people re-click, submit twice, abandon carts, and churn. They blame the product, and they're not wrong to, because their job didn't get done in a way they could trust.

The frameworks below come from **Don Norman**, the cognitive scientist (someone who studies how the mind thinks and learns) who wrote *The Design of Everyday Things* and later coined the term "user experience." His core insight is simple: bad design opens up two **gulfs**, wide gaps the user has to leap across. Your job is to close them.

## The two gulfs that cause most confusion

Think of every interaction as a small drama. The user wants something, guesses how to get it, acts, then waits to see what happened. Things break down in two specific places.

### Gulf of Execution: "How do I do this?"

This is the gap between what the user **wants to do** and what the system lets them do. They stare at the screen trying to figure out what actions are even possible.

A shop owner wants to save their store settings but can't find a Save button, or can't tell whether the form is even submittable. That gulf is wide. The user is stuck before they've done anything.

### Gulf of Evaluation: "What just happened?"

This is the gap between what the system **did** and whether the user can **tell** what happened. They clicked Save, nothing visibly changed, no message appeared, so they have no idea if it worked.

This is the gulf in our opening story. And it's the one that makes a UI *feel broken* even when it isn't.

> **The key idea:** A screen feels broken not mainly because it *failed*, but because the user can't *evaluate* the outcome. Silence after an action is the classic symptom. Good design narrows both gulfs until they almost disappear.

You close the execution gulf by making actions **visible and obvious**. You close the evaluation gulf with **feedback**: telling the user, in plain words, what just happened.

## The seven stages of action: a map of where things break

Norman breaks that little drama into seven stages. Don't memorize them as a strict order. Real action jumps around and is often subconscious. Instead, treat them as a **diagnostic checklist**, a list of points where a design can fail.

Let's walk through one concrete task: **saving changes to your store settings.**

1. **Goal** — what you want: "I want to keep my changes."
2. **Plan** — the approach: "I'll save it."
3. **Specify** — the concrete steps: "I'll click the Save button" (or press Ctrl+S).
4. **Perform** — actually do it: move the mouse, click.
5. **Perceive** — notice what changed: a "Saved successfully" message appears, the little "unsaved changes" dot disappears.
6. **Interpret** — make sense of it: "green message in plain words means it worked."
7. **Compare** — check against the goal: "Yes, saved. Done." (Or: "An error, I'll try again.")

Stages 2 to 4 (plan, specify, perform) bridge the **Gulf of Execution**. Stages 5 to 7 (perceive, interpret, compare) bridge the **Gulf of Evaluation**. One goal sits at the top, and the whole loop either repeats or stops.

Each stage is really a question the user asks: *What do I want? What can I do? How do I do it?* Then: *What happened? What does it mean? Is this okay?*

The power of this list is that it lets you point at the exact failure:

- **No visible or obviously clickable Save button?** The user is stuck at stage 3. That's a Gulf-of-Execution failure.
- **Click does nothing visible, or shows only "200 OK", or a spinner that never resolves?** The user is stuck at stage 5 or 6. That's a Gulf-of-Evaluation failure. The save may have *succeeded*, but the screen still feels broken.

Same complaint ("it's broken"), two completely different fixes. The seven stages tell you which one you're looking at.

## Feedback: the heart of it all

Feedback is how you close the evaluation gulf. **Jakob Nielsen**, Norman's co-founder at the Nielsen Norman Group, makes it his very first usability rule, *Visibility of System Status*: the design should always keep users informed about what's going on, through appropriate feedback within a reasonable amount of time.

Without it, users can't tell if an action succeeded, failed, or is still running. So they re-click, or give up.

Good feedback is **immediate**, **plain-language**, and **proportionate**. Immediacy matters more than people expect. *Delayed feedback is often worse than none*, because the user assumes failure and clicks again, sometimes submitting the form twice.

### Say "Saved successfully," never "200 OK"

Here's the most common feedback mistake: showing the user a developer artifact.

`200 OK` is an HTTP status code, internal plumbing that means "the request succeeded." It's meaningless to a print-shop owner. It forces them to decode developer language just to find out if their settings saved.

`Saved successfully` is human, goal-referenced feedback they can compare against what they wanted. The rule of thumb is blunt and worth pinning above your desk: **never surface raw technical output.** Say "Saved successfully," not "200 OK."

### How fast must feedback be?

Three classic response-time thresholds (first measured by Robert Miller in 1968, later restated by Nielsen) tell you when to show a spinner:

| Response time | How it feels | What to show |
|---|---|---|
| ~0.1s (100ms) | Instant, like touching a real object | Nothing special needed |
| ~1.0s | Noticeable, but thought stays unbroken | Past ~1s, signal the system is working |
| ~10s | The limit of holding attention | A percent-done progress bar plus a way to cancel |

Use these numbers to decide between instant feedback and a loading indicator. A button that selects in under 100ms just needs a color change and a checkmark. A 12-second PDF export needs a progress bar and a Cancel option, otherwise the user assumes it froze and walks away.

## Norman's seven principles: your execution-side checklist

If feedback closes the evaluation gulf, these seven principles close the execution gulf. Use them as a checklist when reviewing any screen.

1. **Discoverability** — Can the user figure out what's possible just by looking? Is the primary action obviously present and reachable?
2. **Feedback** — Is every action's result communicated immediately and in plain words? (This is Nielsen's heuristic number one.)
3. **Conceptual model** — Does the design tell a coherent story, so the user's mental picture matches reality? Would the labels and structure make sense to a shopkeeper?
4. **Affordances** — The properties of an object that determine how it *could* be used. A button affords pressing, a link affords clicking.
5. **Signifiers** — The perceivable *cue* that an affordance exists: the underline on a link, the raised look of a button. Norman's big point: worry more about signifiers than affordances. Does the clickable thing actually *look* clickable?
6. **Mappings** — The relationship between a control and its effect should be natural: up means more, and the control sits next to what it changes.
7. **Constraints** — Limit possible actions to prevent errors. Disable or hide what can't be done now, instead of warning after the fact. Have you made the wrong action impossible?

### The "Norman door" test

A well-designed door needs no "Push / Pull" sign. A flat metal plate *signifies* push. A handle *signifies* pull.

When a door has a pull-handle but you must push it, you get the dreaded **Norman door**: you yank, it doesn't move, you feel stupid. That's a Gulf of Execution opened by a misleading signifier.

A Save button styled like plain gray text is the same door. It can be pressed, but nothing tells the eye that it can. Fix the signifier, and the gulf closes.

## Loading, empty, and error: the states that keep a screen alive

Any screen that loads data must handle three states. Each one is really *feedback about system status*. Leave one out, and the evaluation gulf reopens.

- **Loading** — Show a skeleton (greyed placeholder shapes) or a spinner, never a blank page. A blank screen reads as "broken," and the uncertainty makes users repeatedly re-check whether it's still working.
- **Empty** — Never show a raw "No data." Give a next action: *"You haven't added any products yet. Click 'Add Product.'"* An empty state is an onboarding moment that answers "what do I do now?"
- **Error** — Plain-language message plus a recovery action. Never a status code, stack trace, or untranslated text key. State the problem and suggest a fix. (The best error, of course, is the one a constraint prevented entirely.)

## Common misconceptions

**"If the code returned success, the feature works."** Not for the user. If they can't perceive and interpret that success, the feature failed where it counts. Working code is necessary, not sufficient.

**"Users want our features."** They want their *job* done. **Clayton Christensen**, the Harvard professor behind *The Innovator's Dilemma*, framed this as **Jobs-to-Be-Done**: customers "hire" a product to do a job. The classic line is that people don't want a quarter-inch drill, they want a quarter-inch hole.

Christensen's team once tried to sell more milkshakes. Tweaking the recipe by customer demographic did nothing. Then they spent hours watching *when* shakes were actually bought. Around 40% sold before 8:30am, to solo commuters who bought only a shake and drove off. The real job: survive a long, boring drive with something one-handed, mess-free, and slow to finish (a thick shake lasts about 20 minutes). Its real rivals weren't other shakes. They were bananas, bagels, and donuts.

If you misread the goal, you can optimize every later stage perfectly and still build the wrong thing.

**"More feedback is always better."** Feedback should be proportionate. A confirmation dialog on every harmless click trains people to dismiss dialogs without reading, which hurts you when a warning actually matters.

## How to use this

When a screen feels off, run this checklist:

1. **Name the gulf.** Is the user stuck *before* acting (execution) or *after* acting (evaluation)? This tells you whether to fix discoverability or feedback.
2. **Find the broken stage.** Walk the seven stages on one real task. The first stage that has no clear answer is your bug.
3. **Make the primary action obvious.** Check the signifier: does the clickable thing look clickable? Fix Norman doors first.
4. **Add immediate, plain feedback.** Every action gets a human-language result. Replace any `200 OK`, status code, or stack trace with words a shopkeeper understands.
5. **Apply the response-time rule.** Under 100ms, just confirm. Past 1 second, show activity. Past 10 seconds, show progress and a Cancel button.
6. **Handle all three data states.** Design the loading, empty, and error states deliberately. A missing state is the most common way a working screen feels broken.
7. **Start from the job.** Before any of this, ask what the user is actually trying to accomplish. A store owner's goal isn't "configure the checkout form." It's "get paid for an order without confusing my customer."

## Conclusion

The single thing to remember: **a screen feels broken when the user can't tell what happened.** Close the gulf of evaluation with immediate, plain-language feedback, and most "your app is broken" emails simply stop arriving, often without you changing a single line of backend logic.

Do this well and the user walks all seven stages without ever noticing the work you did. Which raises a deeper question worth chasing next: if great design is invisible when it works, how do you ever get credit, or even feedback, for the gulfs you quietly closed? That tension, between craft no one sees and impact everyone feels, is where product sense really begins.
