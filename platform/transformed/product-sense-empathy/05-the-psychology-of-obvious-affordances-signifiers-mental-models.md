---
title: 'Why Some Apps Feel Obvious (and Others Feel Like a Trap)'
metaTitle: 'Affordances & Signifiers: Why Apps Feel Obvious'
description: >-
  Some products feel obvious the moment you touch them. Learn how affordances,
  signifiers, and mental models make design feel effortless instead of confusing.
keywords:
  - affordances
  - signifiers
  - mental models
  - Don Norman design
  - The Design of Everyday Things
  - gulf of execution
  - gulf of evaluation
  - natural mapping
  - Norman door
  - Jakob's Law
  - usability principles
  - intuitive UI design
  - perceived affordance
  - conceptual model
faq:
  - q: What is the difference between an affordance and a signifier?
    a: >-
      An affordance is what an object lets you do — a button can be pressed. A
      signifier is the visible cue that tells you the action is possible and how
      to do it, like the button's shadow and color. Design for signifiers.
  - q: What is a Norman door?
    a: >-
      A Norman door is a door whose design tells you the wrong thing — like a
      pull handle on a door that only pushes. It's named after Don Norman and
      stands for any design whose cues lie about how to use it.
  - q: What is a mental model in UX design?
    a: >-
      A mental model is the story a user carries in their head about how a
      system works, built from past experience. People act on their mental
      model, not on your code, so the interface must express the right story.
  - q: What are the gulf of execution and the gulf of evaluation?
    a: >-
      The gulf of execution is the gap between wanting something and knowing how
      to do it. The gulf of evaluation is the gap between acting and
      understanding what happened. Signifiers bridge the first, feedback bridges
      the second.
  - q: What is Jakob's Law?
    a: >-
      Jakob's Law says users spend most of their time on other apps, so they
      expect yours to work the same way. Reusing familiar conventions lets people
      reuse a mental model they already own.
author: Pritesh Yadav
transformed: true
topic: product-sense-empathy
topicTitle: Product Sense & Empathy
category: Thinking & Decisions
date: '2026-06-21'
order: 4
icon: ❤️
sources:
  - https://en.wikipedia.org/wiki/The_Design_of_Everyday_Things
  - https://en.wikipedia.org/wiki/Affordance
---

You have met a door that beat you. It had a nice handle, so you pulled — and it didn't budge. You pulled harder, embarrassed, then noticed the small sign: **PUSH**. You weren't being slow. The door lied to you.

That tiny moment of confusion is the whole subject of this article. Some products feel obvious — you walk up, you know what to do, and it works. Others make you stop and second-guess: *Do I push or pull? Did that save? Where's the button?* The difference is almost never intelligence. It's design. And there's a small, surprisingly powerful set of ideas that explains it.

## Why this matters

When someone can't figure out your product, it's tempting to think they're not paying attention. The designer Don Norman spent years proving the opposite. In his classic book *The Design of Everyday Things* (1988, expanded 2013), he studied why ordinary objects — doors, stoves, light switches — confuse smart people. His conclusion was blunt: **when a person fails to use something, the design failed, not the person.**

The same logic runs straight through your software. When a non-technical shop owner can't find how to publish a product, the screen failed them. If you build anything people touch — an app, a form, a checkout — these ideas decide whether users feel capable or stupid. Confused users don't file bug reports. They quietly leave.

The good news: "obvious" isn't a talent. It's a handful of principles you can learn and apply on purpose.

## Affordance: what an object lets you do

Start with the raw material. An **affordance** is the set of actions an object makes possible for a particular person.

A chair affords sitting. A handle affords grasping and pulling. A flat plate on a door affords pushing. Note the word *relationship* — an affordance lives between an object and a person, not in the object alone. A door handle affords nothing to someone who can't reach it.

Here's the catch. Norman quickly noticed that an affordance that nobody can *see* is useless. So he made a sharper distinction: the **perceived affordance** is the action a user can actually recognize. If people can't tell an action is possible, it might as well not exist.

That's the seed of everything else. Knowing something *can* be done does no good if the user can't tell it's there.

## Signifier: the cue that tells you how

So what does the telling? A **signifier**.

A signifier is a perceptible cue — a shape, a label, a color, a sound — that announces "an action is possible here" and shows you *where* and *how* to act.

Norman put it sharply: *"Forget affordances; what people need, and what design must provide, are signifiers."* A door can always be pushed — that's the affordance. The flat metal plate is the signifier that says **"push, right here."**

Think of it this way: the affordance is that a room *has* an exit. The lit **EXIT** sign is the signifier. In a fire, the exit is worthless if no one can find it.

### The Norman door, explained

In the 1980s, Norman kept losing fights with doors — pulling ones meant to be pushed. That's why a door whose design tells you the wrong thing is now called a **Norman door**.

Put a graspable handle on a door that only pushes open, and the signifier *lies*. The handle says "pull." The door says "push." Your hand believes the handle, and you lose.

The honest fix is pure signifier design: a **flat plate** (nothing to grab) for push, a **bar or handle** for pull. The shape alone tells the truth — no instructions required.

And here's the test you can carry everywhere: **the moment you have to slap a "PUSH / PULL" sign on a door, the design has already failed.** The sign is a patch over a missing or wrong signifier. In software, a tooltip that explains a mystery icon is the exact same patch — proof the icon didn't communicate on its own.

## Mapping: line up controls with their effects

Some confusion isn't about whether you *can* act — it's about *which control does what*. That's a question of **mapping**: the relationship between a set of controls and the things they control.

The best kind is **natural mapping**, where spatial layout and convention make the right action obvious with no labels at all.

The classic villain is the **kitchen stove**. Four burners sit in a square. The four knobs sit in a row. Which knob runs which burner? You guess, you squint at tiny labels, you burn dinner.

```
BAD MAPPING                 NATURAL MAPPING
burners:  [A][B]            burners:  [A][B]
          [C][D]                      [C][D]
knobs:  (1)(2)(3)(4)        knobs:    (A)(B)
"which knob? read label"             (C)(D)
                            "knob sits under its burner"
```

Arrange the knobs in the same square as the burners and the problem evaporates — each knob visually belongs to its burner. A row of identical **light switches** suffers the same way; lay them out to mirror the room and it solves itself. The gold standard is the **steering wheel**: turn right, go right. Nobody had to teach you that.

On your own screens, the move is the same. In a settings page, put each toggle next to the thing it affects. A "Send order email" switch belongs beside the order-email preview — not buried in a global list where its effect is anyone's guess.

## Mental models: the story in the user's head

Now the deepest idea. A **mental model** is what a user *believes* about how your system works — the internal story they carry, built from every similar thing they've used before.

This matters more than any single button, because **people act on their model, not on your code.** If a shop owner believes "saving happens automatically when I leave the page," they will never click Save — and they'll lose their work, convinced they did everything right.

Norman frames three models that must line up:

1. **The designer's model** — how the designer *intends* the system to work, living in the designer's head.
2. **The system image** — everything the system actually shows: the UI, labels, behavior, help text. This is the only channel the designer has.
3. **The user's model** — the story the user builds, derived entirely from the system image.

```
 Designer's model  --build-->  SYSTEM IMAGE  --read-->  User's model
        (intent)                 (the UI)               (mental model)
        \___________ must converge: same story ___________/
```

Here's the quiet truth that catches teams off guard: **the designer and the user never speak.** You can't stand behind every user explaining what you meant. They build their entire understanding from what's on screen. If the system image doesn't clearly express your intent, the user builds a *wrong* model — and errors follow. Good design makes the user's model match yours, automatically.

### The two gulfs: where errors are born

Researchers Ed Hutchins, Jim Hollan, and Don Norman named two gaps every user has to cross. Mind them and most confusion disappears.

| Gulf | The question | Bridged by |
|------|-------------|------------|
| **Execution** | "How do I make it do what I want?" | Affordances, signifiers, constraints |
| **Evaluation** | "Did it work? What state is it in now?" | Feedback, visible system status |

A real example from the Nielsen Norman Group: a Windows Bluetooth toggle whose on/off state was ambiguous. Users couldn't *evaluate* whether Bluetooth was actually off — but the moment that became clear, they instantly knew how to *execute* turning it on.

Notice the order. Successful action usually depends on correctly reading the current state first. If people can't tell *where they are*, they can't reliably decide *what to do next*.

## Conceptual models and metaphors

How do you deliberately plant the right story? With a **conceptual model** — a simplified picture the design projects on purpose so users form a correct mental model.

**Metaphors** are the main tool. They let people carry knowledge from a familiar real-world thing into a new interface:

- The **desktop** — files and folders you already understand.
- The **trash can** — drag to delete; it fills up; you can empty it or pull something back out.
- The **shopping cart** — add items, review, check out.

Each one hands the user both a picture *and* an action script for free.

But metaphors come with a warning, and it's in the next section.

## Common misconceptions

**"If it's pretty, it's intuitive."** Beauty and clarity are different things. A gorgeous flat button with no shadow or fill can leave users unsure it's even clickable. That uncertainty *is* a gulf of execution.

**"Users will read the instructions."** Mostly they won't, and you shouldn't need them to. If the only thing keeping people on track is a label, tooltip, or onboarding tour, the underlying signifier is missing.

**"A familiar metaphor always helps."** Only when the digital behavior matches the real-world expectation. A "cart" that silently drops items, or a "trash" that deletes forever with no recovery, builds a *false* model — which is worse than no metaphor at all. The user trusts the story you implied, then gets punished for it.

**"Confused users are careless users."** This is the big one. When people fail, the instinct is to blame them. Norman's whole career argues the reverse: failure is feedback about your design, not their character.

## How to use this

You can turn all of this into a short checklist for anything you build.

1. **Make interactive things look interactive.** A button needs fill, padding, shadow, and contrasting color — those are the signifiers of the "click" affordance. A link needs an underline or distinct color. Strip those, and you've hidden the very thing you want people to use.
2. **Place each control near what it changes.** Use natural mapping. Group a toggle beside its effect, order steps the way the task actually flows, and you'll need far fewer labels.
3. **Confirm every action, immediately and in plain words.** "Saved." "Added to cart." Never silence, never a raw error code. Feedback is how you close the gulf of evaluation.
4. **Match the user's model of the goal.** A checkout should follow the obvious story: cart → review → address → pay → confirmation. Surprises — hidden costs revealed late, steps out of order, no "it worked" screen — break the model and spike anxiety.
5. **Reuse conventions on purpose.** Remember **Jakob's Law** (from usability expert Jakob Nielsen): people spend most of their time on *other* apps, so they expect yours to behave the same. Logo upper-left, search up top, cart upper-right. Borrowing conventions means borrowing a mental model the user already owns — so they spend their effort on the task, not on decoding your screen.
6. **Watch a real person use it.** The fastest way to find a missing signifier is to sit beside someone and stay silent. Every hesitation is a gulf you can now see.

## Conclusion

If you remember one thing, make it this: **"obvious" is something you design, not something users are born with.** Affordances make actions possible, signifiers make them visible, mapping makes them clear, and feedback proves they worked — all so the story in the user's head matches the story in yours.

And there's a deeper layer worth chasing next. The most important model of all isn't the user's model of your buttons — it's their model of *their own goal*. Clayton Christensen's famous milkshake study found that a surprising share of milkshakes were bought early in the morning by solo commuters, "hired" to make a dull drive interesting and hold off hunger until mid-morning. The fix that worked wasn't a new flavor — it was making the shake thicker so it lasted the whole commute. (Treat the figures as an oft-told anecdote, but the lesson is solid.)

Which raises a question worth sitting with: do you actually know what job your users are hiring your product to do? That's where great product sense begins.
