---
title: How AI Tutors Decide What to Teach You Next
metaTitle: Knowledge Graphs for AI Tutors Explained
description: >-
  A knowledge graph maps which concepts must come first so an AI tutor can build
  a personal learning path. Here is how that works and where humans must check it.
topic: ai-learning-platform
topicTitle: AI Learning Platform
category: AI & LLMs
date: '2026-06-28'
order: 18
icon: "\U0001F393"
keywords:
  - knowledge graph
  - curriculum generation
  - AI tutor
  - adaptive learning
  - prerequisite mapping
  - personalized learning path
  - knowledge components
  - topological sort learning
  - Zone of Proximal Development
  - LLM curriculum design
faq:
  - q: What is a knowledge graph in education?
    a: It is a map of a subject broken into small concepts, with arrows showing which concepts you must learn before others. It lets an AI tutor decide what to teach next based on what you already know.
  - q: What is curriculum generation?
    a: It is the process of turning a learner's goal into an ordered, step-by-step path across a knowledge graph, tailored to where that learner is starting from.
  - q: Can an AI build a knowledge graph on its own?
    a: An AI can draft a strong first version fast, but it invents wrong prerequisites and misses dependencies. A human expert must verify the structure before learners see it.
  - q: What is a prerequisite in a learning path?
    a: A prerequisite is a concept you need to understand before another one makes sense, like learning what a variable is before learning loops.
  - q: Why do AI tutors trace failures backward?
    a: Because the real cause of a wrong answer is often a missing foundation, not the topic being drilled. Following prerequisite arrows backward finds the actual gap to fix.
author: Pritesh Yadav
transformed: true
sources: []
---

Hand a smart but disorganized friend a giant pile of facts about Python and say "teach me to code in four months." If they read the pile back in whatever order it happens to be stacked, you'll drown. You'll hit "decorators" before you know what a function is, or "databases" before you can write a loop.

Good teaching isn't just *having* the knowledge. It's knowing **what depends on what**, then laying it out in the right order, sized to where the learner is right now. This is the part most AI tutors get wrong, and the part that separates a chatbot from a tutor that actually moves you forward.

## Why this matters

The hardest question in tutoring is also the most ordinary one: *what should I learn next?*

Get it right and every lesson lands on solid ground. Get it wrong and the learner spends weeks confused, blames themselves, and quits. A tutor that picks the next step well feels almost magical. A tutor that picks it badly feels like being handed a textbook opened to a random page.

Two connected ideas make the good version possible:

- A **knowledge graph** — a map of a subject's concepts and which ones must come first.
- **Curriculum generation** — turning one learner's personal goal into a step-by-step path across that map.

And because letting an AI draw the map unsupervised is genuinely risky, we'll also see exactly where a human has to step in.

## What a knowledge graph actually is

A **knowledge graph** is a map of a subject broken into small concepts, with arrows showing which concepts you need *before* you can learn another.

Each small concept is a **knowledge component** — a single teachable idea, like "what a variable is" or "how a for-loop repeats." The arrows are **prerequisites**. An arrow from A to B means "understand A before B."

**Think of a video-game skill tree.** You can't unlock the fireball spell until you've earned the basic-magic node that feeds into it. A knowledge graph is that skill tree for a subject. The tutor walks you up it, never offering a branch whose earlier nodes aren't lit yet.

Here's a tiny slice of a Python graph. Read each arrow as "comes before":

```
   Variables
      |
      v
   Data types ---> Lists & loops ---> Functions
                        |                 |
                        v                 v
                   Dictionaries      Decorators
```

This structure isn't a nice-to-have. It's what turns "what should I learn next?" into a **principled** decision instead of a guess.

Real systems prove the point. The adaptive math platform **ALEKS** maps middle-school math into roughly 1,000 linked concepts. China's **Squirrel AI** broke the same subject into over 10,000 fine-grained "knowledge points" so it could pinpoint a learner's exact gap. Finer maps diagnose more precisely, but each extra node costs real expert effort to build and maintain.

**Granularity is a dial, not a free upgrade.** Start coarse — a few dozen concepts a human can actually verify — then split nodes only where learners keep getting stuck and you need finer aim.

## Why prerequisites are the heart of it

The single most useful thing a graph does is help the tutor find the **root cause** of a failure.

Suppose a learner keeps getting fraction *equations* wrong. A naive tutor drills more fraction equations, and the learner keeps failing and gets demoralized. A graph-aware tutor follows the arrows backward, discovers the real weakness is plain *adding fractions*, and teaches that instead.

You fix the foundation, and the upper floor stops collapsing.

This is also how a good tutor stays in the **Zone of Proximal Development** — the sweet spot just beyond what you can already do alone. Hard enough to grow, reachable with a little help. The graph tells you which steps are even *reachable* (all their prerequisites are met). The learner model tells you which ones are still *needed*. ALEKS calls this reachable-and-needed set the **outer fringe**: the concepts you're ready to learn right now.

## Turning a goal into a personal path

Now the second half: **curriculum generation**.

A learner shows up with a goal in plain English — "become a Python web developer in four months, I already know a little HTML." Your job is to turn that into an ordered path. Here's the recipe:

1. **Pin down the destination.** Translate the fuzzy goal into concrete, checkable objectives. Not "understand Python" but "can build and deploy a small web app with a database." Use observable verbs (build, write, debug) so the tutor knows when the learner has actually arrived.
2. **Find the start.** A short diagnostic quiz marks which concepts the learner already owns, so you don't burn their four months re-teaching HTML.
3. **Select the needed concepts.** Walk the graph backward from the goal, collecting every prerequisite that isn't already mastered. This is the learner's personal slice of the map.
4. **Order them safely.** Sort that slice so every concept comes *after* everything it depends on. (Computer scientists call this a topological sort. In plain terms: never teach B before its arrow-parents.)
5. **Pace it.** Cut the ordered list into weeks that fit the time budget and respect working memory — a few new ideas at a time, not ten.

**A quick example.** Two learners give the identical goal: "Python web developer in 4 months." One already codes in JavaScript; the other has never programmed. Same destination, same graph — but the diagnostic produces two very different paths. The first skips loops and functions and starts near web frameworks. The second begins at variables. The graph is shared. The curriculum is personal.

## Sequencing: the one rule you can't break

If your path ever places a concept before something it depends on, every lesson built on it wobbles.

The topological sort guarantees a *valid* order. But there's usually more than one valid order, and that's where judgment comes in. Once the foundations are solid, you can:

- **Interleave** related skills — mix problem types instead of drilling one to death, so the learner practices *choosing* the right approach.
- **Space out reviews** of shaky earlier concepts so they don't quietly fade.

The graph defines the legal orders. Good teaching picks the best one.

## Common misconceptions

**"More concepts always means a better tutor."** Not quite. A 10,000-node map diagnoses finely but is brutal to author and verify. A graph nobody has checked is worse than a smaller one that's correct.

**"The AI can just figure out the order itself."** Large language models are weak at the precise, structural reasoning a dependency graph demands. They'll happily place an advanced topic before its foundation.

**"A diagnostic quiz wastes the learner's time."** The opposite. Skipping the diagnostic is what wastes time, because you end up re-teaching things the learner already knows.

## Where AI helps, and where it must be checked

Building a knowledge graph by hand is slow, expert work. This is exactly where a **large language model (LLM)** — an AI trained to read and write human language — earns its keep.

Ask it to draft the first version of the map: list the concepts, propose the prerequisite arrows, even sketch a week-by-week curriculum. It's a tireless junior author that produces a complete first draft in seconds.

But a first draft is not a finished map. LLMs **hallucinate** — they state wrong things with total confidence. Left alone, an LLM will invent a backwards prerequisite, miss a crucial dependency, or place an advanced topic far too early. In a learning product, a confident wrong answer is *worse* than no answer, because the learner trusts it and builds on the mistake.

**The cautionary tale here is Knewton**, the heavily funded "robot tutor in the sky." Confident algorithms and big claims are not the same as real learning; a government study found its adaptive course produced no significant gains. The systems that lasted, like Carnegie Mellon's **Cognitive Tutor**, were slow, theory-grounded, and independently checked.

So the workflow is a partnership, not a handoff:

| Step | LLM does the heavy lifting | Human expert verifies |
| --- | --- | --- |
| List concepts | Drafts the full set of knowledge components | Removes duplicates, fills real gaps |
| Draw arrows | Proposes prerequisite links | Fixes backwards or missing dependencies |
| Generate path | Sequences a curriculum for the goal | Confirms order is sound and well-paced |
| Write lessons | Drafts explanations, examples, quizzes | Checks facts, fixes quiz answers |

One practical safeguard: don't let the model improvise from memory. Use **retrieval-augmented generation (RAG)** — feed it the actual source material (a textbook, a syllabus) and tell it to build the graph and lessons *only* from that text, with citations back to the page. That sharply cuts invented prerequisites and gives a human a fast way to spot-check each claim.

## How to use this

If you're building or evaluating an AI tutor, work through these in order:

1. **Start with a coarse graph.** A few dozen concepts you can verify end to end beats a giant map nobody has read.
2. **Make the arrows explicit.** Have the LLM output prerequisites as a plain list of "A must come before B" statements a teacher can skim and tick off. Reviewing a clean list beats auditing a tangled diagram.
3. **Always run the diagnostic first.** Find the learner's true starting point before generating any path.
4. **Sequence by prerequisites, no exceptions.** Then layer interleaving and spaced review on top.
5. **Ground the AI in real sources.** Use RAG and require citations so every claim is checkable.
6. **Put human review where it counts most.** That's the prerequisite arrows and the quiz answers, not every word of prose.

## Conclusion

A knowledge graph turns the most important question in learning — *what next?* — from a guess into a principled choice: the next step that's reachable, still needed, and just a small stretch.

The graph is the stable, reusable map of a whole subject. The curriculum is the personal, throwaway route across it for one learner with one goal. Let the AI draft both, fast. Let a human guard the foundations.

Here's the thread worth pulling next: that "running estimate of what each learner knows" is doing quiet, heavy lifting in everything above. How does a tutor actually *measure* what's in your head from a handful of answers — and how does it stay honest when you guess right by luck? That's the learner model, and it's where this all gets personal.
