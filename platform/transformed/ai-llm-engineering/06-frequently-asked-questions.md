---
title: "LLM Engineering FAQ: RAG, Agents, Evals, and More"
metaTitle: "LLM Engineering FAQ: RAG, Agents & Evals"
description: "Clear answers to the questions every LLM engineer asks: RAG vs fine-tuning, agents vs workflows, evals, hallucinations, tokens, context windows, and more."
keywords:
  - llm engineering faq
  - rag vs fine-tuning
  - what is an llm agent
  - llm evaluations
  - llm as judge
  - what is a hallucination
  - context window explained
  - prompt vs context engineering
  - do i need a vector database
  - llm temperature setting
  - tokens and llm cost
  - when not to use ai
faq:
  - q: What is the difference between RAG and fine-tuning?
    a: RAG fetches relevant documents at query time and feeds them to the model, so it can reason over fresh facts without changing its weights. Fine-tuning adjusts the model's weights to change its style or skill. Use RAG for changing knowledge, fine-tuning for consistent behavior.
  - q: Is an AI agent just a fancy workflow?
    a: No. A workflow follows steps you defined in advance. An agent decides for itself which steps to take, in what order, and when to stop. If you can draw the flowchart ahead of time, build a workflow.
  - q: Why do evaluations matter in LLM engineering?
    a: Evals turn "it feels better" into a repeatable score, so you can tell whether a prompt or model change actually helped or quietly broke something. They are the unit tests of LLM engineering and the single highest-leverage thing you can build.
  - q: What is a hallucination and why does it happen?
    a: A hallucination is confident, fluent text that is factually wrong or unsupported. It happens because language models predict plausible words, not verified truth, so they fill gaps with something that merely sounds right.
  - q: Do I actually need a vector database for RAG?
    a: Not always. Vector databases shine for large corpora needing semantic search. For small or stable document sets, keyword search or a plain database is often simpler and good enough. Add a vector store only when scale demands it.
  - q: What is the most important habit for new LLM engineers?
    a: Look at your data. Read real model outputs, especially the failures, before theorizing about fixes. The actual failure modes are almost never the ones you would guess.
author: Pritesh Yadav (priteshyadav444)
transformed: true
linked: true
topic: ai-llm-engineering
topicTitle: AI & LLM Engineering
category: AI & LLMs
date: '2026-06-21'
order: 5
icon: "\U0001F9E0"
sources: []
---

You are halfway through building something with a large language model when the same questions start stacking up. Should this be an agent or just a workflow? Do you need a vector database, or are you over-engineering? Is your eyeballing of outputs actually telling you anything?

These are the questions that separate people who ship reliable AI from people who ship demos that fall apart in production. Here are clear, honest answers to the ones that come up most.

## Why this matters

Most costly mistakes in LLM engineering are not bugs. They are wrong decisions made early, with confidence, because nobody paused to ask the right question.

Reaching for a fully autonomous agent when a simple workflow would have been more reliable. Trusting a prompt that worked once. Skipping [evaluations](/blog/ai-llm-engineering/02-evaluation-measurement) because the outputs "looked fine." Each of these feels reasonable in the moment and expensive three months later.

Getting these fundamentals right is the difference between a feature users trust and one they learn to route around.

## Architecture: prompt, workflow, or agent?

### Is an agent just a fancy workflow?

No, and the distinction is the most important one in this whole article.

A **workflow** follows a fixed, pre-defined sequence of steps that you wrote, even if some of those steps call a model. An **agent** decides for itself which steps to take, in what order, and when to stop, usually by choosing tools in a loop based on what it finds along the way.

The practical rule: **if you can draw the control flow as a flowchart ahead of time, build a workflow.** Reach for an agent only when the path genuinely cannot be known in advance.

### How do I choose between a single prompt, a workflow, and an agent?

Climb the ladder only as far as the problem forces you.

1. **Start with a single prompt.** Most tasks need nothing more.
2. **Move to a workflow** when the task needs multiple reliable steps you can predefine. Chain prompts and code together.
3. **Reach for an agent** only when the steps genuinely cannot be planned ahead, because they depend on what gets discovered during the run.

Each rung up adds power but also adds cost, latency, and unpredictability. The most common and expensive mistake in the field is building [an autonomous agent](/blog/ai-llm-engineering/04-agent-architecture-orchestration) for a job a simple workflow would have done more reliably.

### How do tools and function calling fit into agents?

**Tools** (also called function calling) let a model do things beyond generating text: search the web, query a database, run code, or call an API.

You describe each tool's purpose and inputs. The model chooses when to invoke one and with what arguments, reads the result, and continues. This is what lets an agent act in the world instead of just talking about it.

Clear tool descriptions matter as much as the prompt. A confused model will call the wrong tool or pass bad arguments, so keep tools well-scoped, safe, and obvious in what they do.

## Knowledge: RAG, fine-tuning, and context

### What is the difference between RAG and fine-tuning?

**RAG (Retrieval-Augmented Generation)** fetches relevant documents at query time and inserts them into the model's context. The model reasons over fresh, external knowledge without its weights ever changing.

**Fine-tuning** adjusts the model's weights on examples to change its behavior, tone, or format.

- Use **RAG** when you need up-to-date or proprietary facts that change often.
- Use **fine-tuning** when you need a consistent style, structure, or skill the base model handles poorly.

They are complementary, not competing. A fine-tuned model can still pull in fresh context through RAG.

### Do I actually need a vector database?

Not always. A vector database shines when you have a large corpus and need **semantic search**, finding passages by meaning rather than exact keywords.

But for small or stable document sets, keyword search, a plain database, or even stuffing everything into the context window can work fine and be far simpler.

Start with the simplest retrieval that meets your accuracy bar. Add a vector store only when scale or semantic matching demands it. Many "we need a vector DB" projects really just needed better chunking and a basic search.

### What is the difference between prompt engineering and context engineering?

**Prompt engineering** is crafting the instructions you give the model: the phrasing, role, examples, and output format.

**Context engineering** is the broader discipline of deciding what information enters the model's window at all: which retrieved documents, prior messages, tool results, and system instructions, in what order and amount.

Prompt engineering is one piece of [context engineering](/blog/ai-llm-engineering/03-context-engineering-retrieval). As systems grow, the question shifts from "what should I say?" to "what should the model see, and what should I leave out?"

### What does "context window" mean, and is a bigger one always better?

The **context window** is the maximum amount of text, measured in tokens, the model can consider at once. That includes your prompt, retrieved data, conversation history, and the answer it is writing.

A bigger window lets you include more, but it is not a free win. Cost and latency rise with length, and models often pay less attention to information buried in the middle of a long context.

**More relevant context beats more context.** Curating what goes in usually outperforms dumping everything in and hoping the model finds the needle.

### What is the difference between retrieval quality and generation quality?

In a RAG system, **retrieval** is finding the right source material and **generation** is the model writing a good answer from it.

These fail independently. The model can write beautifully from the wrong documents, or botch an answer despite having perfect sources.

Diagnosing problems means checking both separately. Did we fetch the correct passages? Did the model use them faithfully? Most RAG failures trace back to retrieval, so evaluate that stage first before blaming the model.

## Reliability: evals, hallucinations, and randomness

### Why do evaluations matter so much? Can't I just eyeball the outputs?

Eyeballing works for a demo but collapses at scale. You cannot manually re-check hundreds of cases every time you tweak a prompt or swap a model.

**Evals** turn "it feels better" into a repeatable, measurable score. They tell you whether a change actually improved things or quietly broke something. Without them, small regressions ship silently and you are flying blind.

Think of evals as the unit tests of LLM engineering, the single highest-leverage investment you can make.

### How do I even start building an eval set?

Start small and concrete.

1. **Collect 20 to 50 real or realistic inputs** that represent the cases you care about, including a few hard or edge cases.
2. **Define what a good answer looks like** for each: an exact match, a checklist of required facts, or a rubric.
3. **Run your system over the set** and look at the failures by hand.
4. **Only then automate the scoring.**

A scrappy 30-case eval you actually run beats a perfect 1,000-case eval you keep meaning to build.

### What is "LLM-as-judge" and can I trust it?

**LLM-as-judge** means using a language model to score another model's output against a rubric. It scales evaluation far beyond what humans can review by hand.

It is useful but not automatically trustworthy. Judges can be biased toward longer answers, toward the first option shown, or toward outputs that simply sound confident.

To trust it, calibrate the judge against a sample of human-labeled cases, give it a clear rubric with examples, and ask for a short justification before the score. Treat the judge as an instrument you must validate, not an oracle.

### What exactly is a hallucination, and why does it happen?

A **hallucination** is when the model produces confident, fluent text that is factually wrong or unsupported by its sources.

It happens because [language models predict plausible next words](/blog/ai-llm-engineering/01-foundations-how-llms-work-why-these-skills-endure), not verified truth. When they lack the right information, they fill the gap with something that merely sounds right. They do not "know what they don't know" by default.

You reduce hallucination by grounding answers in retrieved sources, asking the model to cite or say "I don't know," and verifying claims against the provided context.

### My prompt works once but fails unpredictably later. What's going on?

LLMs are **non-deterministic**. The same input can yield different outputs, so a prompt that works in one test is not proven reliable. A single success is anecdote, not evidence.

The fix is to run the prompt across many varied inputs and measure how often it succeeds, which is exactly what an eval set gives you. Treat reliability as a percentage you measure, not a binary you assume from one happy demo.

### What is "temperature," and when should I change it?

**Temperature** controls randomness in the model's word choices. Lower values make outputs more focused and repeatable; higher values make them more varied and creative.

- For factual tasks, extraction, classification, or anything you want consistent and testable, use a **low temperature**.
- For brainstorming, copywriting, or generating diverse options, **raise it**.

When building evals, keep temperature low so results are reproducible enough to compare.

### How are tokens related to cost and limits, and why should I care?

Models read and write in **tokens**, chunks of text roughly three-quarters of a word, and you are billed per token for both input and output.

Long prompts, big retrieved documents, and verbose answers all cost money and add latency. Caring about tokens keeps you efficient: trimming redundant context, summarizing history, and capping output length can cut cost dramatically without hurting quality. It also explains why "just send everything" is rarely the right design.

## Product judgment: knowing when not to

### When should I not use AI or an LLM at all?

Avoid LLMs when a deterministic rule, a database query, or [simple code would do the job more reliably](/blog/ai-llm-engineering/05-ai-product-judgment) and cheaply, such as math, exact lookups, or strict business logic.

Be cautious in high-stakes domains like medical, legal, and financial work without a human in the loop and strong guardrails. Skip them when you cannot tolerate the variability and occasional errors inherent to generative models.

The mature engineer's instinct is to ask "does this genuinely need probabilistic language understanding?" before reaching for a model.

### What is "AI product judgment" and why is it a core skill?

**AI product judgment** is deciding *whether* and *how* AI should be used in a product, not just how to make a model respond.

It covers choosing the right use case, designing for graceful failure, setting user expectations, and knowing when a simpler non-AI solution wins.

It matters because the hardest mistakes are rarely technical. They are shipping AI where it does not belong, or exposing raw model uncertainty to users who cannot handle it. Good engineering cannot rescue a bad product decision.

### How should an AI feature handle being wrong?

Design for failure from the start, because a probabilistic system will produce errors no matter how good it is.

- Give the model an escape hatch. "I'm not sure" beats a confident wrong answer.
- Show sources so users can verify.
- Keep a human in the loop for consequential actions.
- Make mistakes recoverable. Prefer drafts the user approves over actions taken automatically.

The goal is not zero errors. It is that errors are visible, correctable, and low-stakes.

## Common misconceptions

- **"Bigger context window means better results."** Not on its own. Models lose track of information in the middle of long contexts, and length costs you money and speed. Relevance beats volume.
- **"It worked in my test, so it's reliable."** One success is anecdote. Reliability is a percentage you measure across many inputs.
- **"An agent is more capable, so it's the better choice."** More autonomy means more cost, latency, and unpredictability. Use the least powerful option that solves the problem.
- **"We need a vector database."** Often you need better chunking and basic search. Reach for the vector store when scale actually demands it.

## How to use this

When you start your next LLM project, walk through these checks before writing much code:

1. **Ask if it needs a model at all.** If a rule or query is more reliable, use that.
2. **Pick the lowest rung that works:** single prompt, then workflow, then agent. Only climb when forced.
3. **Build a 20 to 50 case eval set early** so every change is measured, not vibed.
4. **Choose your knowledge strategy deliberately:** RAG for changing facts, fine-tuning for consistent behavior, the simplest retrieval that hits your accuracy bar.
5. **Set temperature to match the task** and keep it low while you are evaluating.
6. **Design for being wrong:** escape hatches, visible sources, human approval for anything consequential.
7. **Watch your tokens** so cost and latency stay under control.

## Conclusion

If you remember one thing, remember this: **look at your data.** Read the actual model outputs, especially the failures, before theorizing about fixes. The real failure modes are almost never the ones you would guess, and a small eval set plus genuine curiosity about your outputs will beat clever architecture every time.

That habit raises a sharper question, though. Once you can measure quality, how do you build an eval set that catches the failures that matter most, instead of the ones that are easy to score? That is where LLM engineering stops feeling like guesswork and starts feeling like a craft.
