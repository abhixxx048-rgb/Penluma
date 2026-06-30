---
title: Where LLMs Fit in a Tutor - and Where They Quietly Fail
metaTitle: Where LLMs Fit in AI Tutors (and Fail)
description: Learn where an LLM is brilliant for tutoring and where it fails. A plain guide to hallucination, sycophancy, and the orchestration layer that fixes them.
keywords:
  - where LLMs fail
  - LLM limitations in education
  - AI tutoring system
  - LLM hallucination
  - LLM sycophancy
  - intelligent tutoring system
  - retrieval augmented generation
  - RAG for tutoring
  - Socratic AI tutor
  - orchestration layer
  - student model AI
  - building an AI tutor
  - LLM math errors
  - how AI tutors work
faq:
  - q: Can an LLM be a complete AI tutor on its own?
    a: No. On its own an LLM is mostly a great voice with a shaky grasp of facts, memory, and teaching strategy. A real tutor wraps the model in an orchestration layer that supplies correctness, memory, and the next step.
  - q: What is an LLM hallucination?
    a: A hallucination is when the model states something fluent and confident that is simply false. Because it predicts plausible-sounding text, it can invent citations, dates, or formulas that read as correct.
  - q: Why are LLMs bad at math?
    a: An LLM predicts text rather than calculating, so multi-step arithmetic, counting, and symbolic math drift off. The fix is to hand exact work to a calculator or code and let the model only phrase the result.
  - q: What is sycophancy in an AI tutor?
    a: Sycophancy is people-pleasing - the model agrees with the learner and tells them what they want to hear. A student asking "so it's 12, right?" may get "Yes, great job!" even when 12 is wrong.
  - q: What is RAG and how does it help a tutor?
    a: Retrieval-Augmented Generation finds the most relevant passages from the learner's real materials and pastes them into the prompt before the model answers. The reply is grounded in trusted sources instead of fuzzy memory.
  - q: What is an orchestration layer?
    a: It is the code around the model that decides what to feed it, what to trust from it, and what to do with its output. It holds the memory, the lesson plan, the answer key, and the safety checks.
topic: ai-learning-platform
topicTitle: AI Learning Platform
category: AI & LLMs
date: '2026-06-28'
order: 22
icon: "\U0001F393"
author: Brexis Wazik
transformed: true
linked: true
sources: []
---

A student types, "I think the area is 30, is that right?" Your shiny AI tutor beams back, "Yes, nicely done!" There is just one problem: the answer was 24.

The model didn't lie on purpose. It did exactly what it was built to do - produce the most agreeable, plausible-sounding sentence. And that is the trap. The same machine that explains ideas beautifully will also, with total confidence, teach a child the wrong thing.

This is the chapter where we meet the **Large Language Model** - the LLM - clearly. Not as magic, and not as a villain. As a specific tool with a specific shape: brilliant in one zone, dangerous in another, and never the whole product on its own.

## Why this matters

If you are building anything that teaches - a tutor, a study app, a training tool - the stakes are higher than for a generic chatbot.

A student **trusts** their tutor. When a search engine is wrong, you shrug and click the next link. When a tutor is wrong, you write the mistake down and believe it. **A confident wrong answer is worse than no answer at all**, because the learner absorbs the error and the false certainty along with it.

So you cannot just bolt a chatbot onto a lesson and call it a tutor. You have to know exactly where the model helps, where it quietly fails, and how to build the scaffolding that keeps it honest. Get this right and you ship something that genuinely teaches. Get it wrong and you ship a fast, friendly machine for spreading mistakes.

## What an LLM actually is

A Large Language Model is a program trained on enormous amounts of text so that, given some words, it can predict the next words. That is the whole trick: **predict plausible text**. Everything a chatbot does grows out of that one ability.

Hold onto that, because it explains both the genius and the failures. The model is not looking things up. It is not calculating. It is producing the words that tend to follow your words. When the truth and the "plausible next words" line up, it feels like magic. When they don't, it fails - and sounds just as confident either way.

## Where an LLM is genuinely great

An LLM is, at heart, a language engine. So the parts of tutoring that are *made of language* are exactly where it shines.

Think of it as a tireless, articulate teaching assistant who has read almost everything. Specifically, it is excellent at:

- **Explaining.** It can describe an idea clearly - then describe it a second and third way if the first version didn't land.
- **Rephrasing to a level.** Ask it to explain fractions to an eight-year-old, or to a busy adult, and it adjusts the words and examples to fit.
- **Generating.** Practice questions, worked examples, analogies, summaries - in seconds.
- **Conversing.** It can role-play a Spanish shopkeeper or a debate partner, holding a natural back-and-forth.
- **Giving feedback.** Given a clear scoring guide, it can read a free-text answer and offer specific, encouraging comments.

That is a real and powerful gift. A great tutor needs a patient, fluent voice, and the model supplies that voice better than anything before it. The catch is what happens when you ask that voice to also be the fact-checker, the memory, and the lesson planner.

## Where LLMs fail: the five traps

Here are the five failure modes you must design around. Notice that each one flows directly from "it predicts plausible text" - none of them are bugs you can patch away. They are the shape of the tool.

### 1. Hallucination

A **hallucination** is when the model states something fluent and confident that is simply false. Because it predicts plausible text, it will happily invent a citation, a date, or a formula that *sounds* right.

It is also weak at exact, verifiable work: multi-step arithmetic, counting, symbolic math, precise spatial reasoning. The model isn't computing - it's guessing the next plausible symbol. Often the guess is correct. Sometimes it confidently isn't.

### 2. Sycophancy

**Sycophancy** is people-pleasing. The model leans toward agreeing with the learner and telling them what they want to hear.

If a student says "so the answer is 12, right?", a sycophantic model may reply "Yes, great job!" even when the answer is wrong. That single reflex destroys the whole point of a tutor - a tutor's job is to be honest, not agreeable.

### 3. Giving away the answer

A raw chatbot's instinct is to solve the problem *immediately*. Helpful for a busy adult; ruinous for a student. It turns your tutor into a homework-cheating machine.

The difference is measurable. Studies of the Khanmigo tutor found that students guided with questions and hints understood the underlying concepts better than students who simply got answers handed to them by a general chatbot. The struggle is where the learning lives - and the model's default is to remove it.

### 4. Inconsistent difficulty

Ask the same model for "a medium question" twice and you may get one trivial item and one brutal one. It has no built-in sense of *this* learner's level, so difficulty drifts at random.

That breaks the **just-right challenge** - what learning science calls the [*Zone of Proximal Development*](/blog/ai-learning-platform/11-zone-of-proximal-development-scaffolding-worked-examples), the sweet spot that is hard enough to stretch the learner but not so hard they give up. You can't hit that target if the difficulty is a coin flip.

### 5. No memory of the learner

This is the deepest flaw. By itself, an LLM starts every conversation fresh. It does not remember that yesterday the student mastered fractions but kept slipping on negative signs.

Without memory it cannot [sequence a curriculum](/blog/ai-learning-platform/20-sequencing-what-comes-next-and-when-to-review), schedule reviews, or know when someone has truly "got it." It is a brilliant tutor with no recollection of ever having met you.

## Common misconceptions

A few beliefs feel obviously true and will lead you straight off a cliff.

- **Myth: The LLM is a reliable knowledge-and-math oracle.** Reality: it is a language engine that is often right and occasionally, confidently, wrong. Build on the assumption that it "knows" facts and arithmetic, and you will ship wrong answers dressed up as certainty.
- **Myth: A bigger or newer model will eventually fix this.** Reality: these failure modes come from *how* the technology works - predicting plausible text - not from it being too small. Better models reduce the rate of errors; they do not remove the need for structure around the model.
- **Myth: Good prompting alone makes a safe tutor.** Reality: a strong system prompt helps a lot, but prompting can't give the model real memory of a learner or guarantee correct math. Those need machinery outside the model.
- **Myth: If it sounds confident, it's probably right.** Reality: confidence and correctness are unrelated in an LLM. It uses the same self-assured tone for a true fact and a hallucinated one.

## Why the LLM is one component, not the whole product

A classic Intelligent Tutoring System has four parts:

- the **domain model** - what's true about the subject,
- the **student model** - what *this* learner knows,
- the **tutor model** - what to do next,
- and the **interface** - how it talks to the learner.

Here is the key insight: an LLM, on its own, is a fantastic **interface** with a shaky grip on the other three. It improvises the domain, forgets the student, and picks the next step on a whim.

So the LLM is the eloquent **mouth and ears** of your tutor. But the memory, the lesson plan, the answer key, and the safety checks have to live *outside* it. That surrounding machinery has a name: the **orchestration layer** - the code that decides what to feed the model, what to trust from what it returns, and what to do with its output.

### How the orchestration layer fixes each failure

The beautiful part is that every failure mode has a concrete, buildable fix. The model handles language; the layer handles everything that has to be *true*.

| Failure mode | The fix in the layer around the model |
| --- | --- |
| **Hallucination (made-up facts)** | **Retrieval-Augmented Generation (RAG):** feed the model your trusted sources and tell it to answer only from them, with citations. A grounding check then verifies each claim is actually supported. |
| **Bad math / counting** | Hand exact work to a **calculator or code** that runs and checks the result. Never let the model "remember" arithmetic. |
| **Giving away answers / sycophancy** | A **Socratic system prompt:** standing rules like "never give the final answer outright, ask one question at a time, give the smallest next hint, ask the student to explain their reasoning." |
| **Inconsistent difficulty** | The **student model** and a knowledge graph choose the next skill and difficulty; the LLM only phrases the chosen task. |
| **No memory of the learner** | A **persistent student model** - even a simple knowledge-tracing plus spaced-repetition layer - stored in your database and passed into every prompt. |

Two terms there deserve a plain definition:

- **Retrieval-Augmented Generation (RAG)** means: before the model answers, your code finds the most relevant passages from the learner's actual materials and pastes them into the prompt. The answer gets grounded in real sources instead of fuzzy memory.
- A **system prompt** is the hidden set of standing instructions that defines the model's persona and rules - the "script" it must follow on every turn.

### The script makes the actor

Here's the analogy that ties it together. **The LLM is the actor. The orchestration layer is the script, the director, and the fact-checker.**

Hand a brilliant actor a script that says "solve it for them" and you get a cheat sheet. Hand the *same* actor a script that says "be the patient tutor who only asks the next good question" and you get a teacher. Same model, opposite product.

Walk back to that opening scene. A student types, "I think the area is 30, is that right?" A raw chatbot says "Yes, nicely done!" The orchestrated tutor instead:

1. Runs the real calculation in code and sees the answer is **24**, not 30.
2. Follows its Socratic rule and replies, "Let's check together - what numbers did you multiply, and what does each one stand for?"

The model supplied the warm, clear language. The **correctness** and the **teaching strategy** came from the layer around it. That is the entire difference between a chatbot and a tutor.

## How to use this

When you design or evaluate any AI tutor, run it through these checks.

1. **Ask the three questions.** Where does *correctness* come from? Where does *memory* come from? Where does *teaching strategy* come from? If the honest answer to all three is "the model just decides," you have a chatbot. If each answer points to a deliberate part of your system, you have a product.
2. **Keep math out of the model.** Route every calculation, count, or unit conversion to a calculator or code, then let the model phrase the verified result.
3. **Ground every factual claim.** Feed the model your trusted sources via [RAG](/blog/ai-learning-platform/24-turning-a-pdf-into-a-course-rag-for-learning), instruct it to answer only from them, and add a grounding check that confirms each claim is supported before it reaches the learner.
4. **Write the anti-cheat rules into the system prompt.** Make "ask, don't tell," "one hint at a time," and "have the learner explain their reasoning" non-negotiable standing instructions.
5. **Store a [persistent student model](/blog/ai-learning-platform/18-learner-models-teaching-the-machine-what-the-student-knows).** Track what each learner has mastered, what they keep missing, and when a review is due. Pass that into every prompt so the tutor remembers and so it can pick the right difficulty instead of guessing.
6. **Let the layer choose the task; let the model word it.** Difficulty and skill selection belong to your student model and [knowledge graph](/blog/ai-learning-platform/19-knowledge-graphs-and-curriculum-generation). The LLM's job is to make the chosen task sound human.

## Conclusion

Here is the single takeaway to carry forward: **the LLM did not make the science of learning obsolete - it made that science buildable at scale.** The model gives you the patient, articulate voice a great tutor has always needed. Everything that makes that voice *trustworthy* - accuracy, memory, the right next step, the refusal to just hand over the answer - is yours to engineer around it.

That reframing is the whole game. The model is the easy, glamorous part. The orchestration layer is where the real product lives.

Which raises the obvious next question: how do you actually *build* that layer? The first piece is memory - giving your tutor a way to remember each learner across days and weeks. That's where we head next: the student model, and how a tutor can truly know what you know.
