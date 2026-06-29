---
title: "LLM Engineering Cheat Sheet: The Whole Field on One Page"
metaTitle: "LLM Engineering Cheat Sheet (Evals, RAG, Agents)"
description: "A fast, plain-English LLM engineering cheat sheet covering evals, RAG, agents, and judgment — plus a decision table for picking the right technique every time."
keywords:
  - LLM engineering cheat sheet
  - LLM evals
  - RAG vs fine-tuning
  - AI agents vs workflows
  - LLM-as-a-judge
  - hybrid search reranking
  - pass@k vs pass^k
  - prompt injection
  - hallucination in LLMs
  - when not to use AI
  - golden dataset
  - lost in the middle
  - human in the loop
topic: ai-llm-engineering
topicTitle: AI & LLM Engineering
category: AI & LLMs
date: '2026-06-21'
order: 6
icon: "\U0001F9E0"
author: Pritesh Yadav
transformed: true
faq:
  - q: What is the difference between model eval and product eval?
    a: A model eval asks "is the model good?" using generic benchmarks. A product eval asks "does my feature do its job for my users?" The product eval is the one that decides whether you ship.
  - q: When should I use RAG instead of fine-tuning?
    a: Use RAG when you need to add knowledge — facts that are updatable and citable. Use fine-tuning to teach behaviour, format, or style. For getting facts right, default to RAG.
  - q: What is the difference between pass@k and pass^k?
    a: pass@k means the model succeeds at least once in k tries, which measures best-case capability. pass^k means it succeeds every single time, which measures reliability. Agents should be optimized for pass^k.
  - q: Can hallucinations in LLMs be fixed?
    a: No. Hallucination is intrinsic to how language models work, not a temporary bug. You design around it with grounding, citations, and verification rather than waiting for it to disappear.
  - q: When should I NOT use an LLM?
    a: Avoid LLMs for deterministic, exact, or correctness-critical tasks like math, lookups, and rules — anything that needs the same right answer every time. Those belong in plain code.
  - q: What is prompt injection?
    a: Prompt injection is when malicious instructions hidden inside user or retrieved content hijack the model. Treat all external text as untrusted data, keep instructions separate, and never give an agent unchecked authority.
---

You can spend months reading papers on evals, retrieval, and agents — or you can keep one page nearby that tells you exactly which technique fits the problem in front of you. This is that page.

Most AI features don't fail because the model is weak. They fail because someone reached for an agent when a single function call would do, or trusted an ungrounded answer that sounded confident and was simply wrong. Knowing the *names* of the failure modes is half the battle.

Treat this as your ten-minute review. Each pillar is distilled to its load-bearing ideas, a decision table tells you which tool fits which situation, and the golden rules are what to remember when you forget everything else.

## Why this matters

Building with large language models is less about prompting tricks and more about judgment: choosing the cheapest, simplest approach that actually works, and designing for the moment it doesn't.

The cost of getting this wrong is real. Over-engineer, and you ship a slow, expensive, unpredictable agent for a job a script could have done. Under-engineer, and you ship a feature that hallucinates private data, cites nothing, and breaks the first time a user pastes something weird.

This cheat sheet keeps the four pillars — **evals**, **retrieval**, **agents**, and **judgment** — in one place so you can reason about trade-offs instead of guessing.

## Evals in one minute

An **eval** is just a test for non-deterministic software. Without one, "the AI got better" is a vibe, not a fact.

- **Model eval vs product eval** — a model eval asks "is the model good?" on generic benchmarks. A product eval asks "does *my* feature do *its* job for *my* users?" The second is the one that matters.
- **Golden dataset** — a curated, labelled set of representative inputs plus the behaviour you expect. It's your ground truth. Build it from real usage and edge cases, not invented examples.
- **Offline vs online** — offline is measured before shipping against fixed data; online is measured in production on live traffic (A/B tests, user signals). You need both: offline gates releases, online catches reality.
- **Error analysis first** — read actual failing outputs, cluster them into failure modes, and name them. This comes *before* metrics. You can't measure what you haven't looked at.
- **LLM-as-a-judge** — use a model to score outputs at scale. It's cheap and fast, but you must validate it against human labels before you trust it.
- **Judge biases** — judges favour the **first or last** option (position), **longer** answers (verbosity), and **their own model family** (self-preference). Mitigate by randomising order, controlling for length, and using a different judge model.
- **Binary vs Likert** — pass/fail is reliable and actionable; a 1-to-5 scale is noisier and graders disagree. Prefer binary unless you genuinely need gradation.
- **The eval flywheel** — ship, observe failures, add them to the golden set, improve, re-measure. The dataset compounds into a moat competitors can't copy.

**A quick example.** Suppose your support bot answers refund questions. A benchmark score of "92% on reasoning tasks" tells you nothing. What tells you something: a golden set of 200 real refund questions, where you read the 18 wrong answers, notice 12 of them misquote the 30-day policy, and name that failure mode "stale policy." Now you have something to fix and a number to watch.

## Retrieval in one minute

**Retrieval** is how you give a model knowledge it wasn't trained on — your docs, your data, today's facts — without retraining anything.

- **Tokens and the context window** — models read and write in tokens (sub-word chunks). The context window is the finite token budget for prompt plus output. Everything you retrieve competes for that space.
- **Chunking** — splitting documents into retrievable pieces. Too big is noisy and wasteful; too small loses meaning. Chunk on semantic boundaries and keep some overlap.
- **Embeddings** — text mapped to vectors, so similar meaning becomes geometric closeness. This is the basis of meaning-based search.
- **Vector DB and similarity search** — stores embeddings and finds the nearest neighbours to your query vector. Fast, approximate, semantic lookup.
- **Hybrid search** — combine semantic (vector) search with keyword (BM25) search. It catches both meaning *and* the exact terms — names, codes, IDs — that embeddings tend to miss.
- **Reranking** — a second, more precise model reorders the top candidates from the first pass. Cheap retrieval casts a wide net; the reranker tightens precision.
- **The RAG pipeline** — retrieve relevant context, inject it into the prompt, then generate a grounded answer. This grounds output in your data without fine-tuning.
- **Query rewriting** — reshape the raw user query (expand, clarify, decompose) so it matches how your documents are actually written.
- **Contextual retrieval** — prepend each chunk with where it came from (document, section) before embedding, so an isolated snippet stays interpretable.
- **GraphRAG** — retrieve over a knowledge graph of entities and relationships, not just flat chunks. Better for multi-hop "how do these connect?" questions.
- **"Lost in the middle"** — models attend best to the start and end of a long context and skim the middle. Put the most important material at the edges; more context is not automatically better.
- **Agent memory** — persisting state across turns and sessions (scratchpads, summaries, history) so an agent isn't amnesiac. Memory is just retrieval applied to the agent's own past.

**RAG vs fine-tuning vs long-context** is the question people get wrong most often:

- **RAG** adds *knowledge* — facts that are updatable and citable.
- **Fine-tuning** teaches *behaviour, format, and style* — not facts.
- **Long-context** stuffs everything into the window — simple, but costly, and quality degrades as it fills.

Default to RAG for facts.

## Agents in one minute

An **agent** is a model that decides its own next step in a loop. That flexibility is powerful and dangerous in equal measure.

- **Agent vs workflow** — a workflow is a fixed, predefined path of model calls. An agent dynamically chooses its own steps and tools. Workflows are predictable; agents are flexible but harder to control. If the path is known, use a workflow.
- **The agent loop** — observe, think, act (call a tool), observe the result, repeat until done. That's the engine under every agent.
- **Tools and function calling** — the model emits a structured request to call a function; your code runs it and feeds the result back. This is how agents touch the real world.
- **ReAct** — interleave *reasoning* and *acting* in "thought → action → observation" cycles, so the model plans, acts, and adjusts on feedback.
- **Workflow patterns** — **prompt chaining** (sequential steps), **routing** (classify then dispatch), **parallelization** (fan out, then aggregate), **orchestrator-worker** (a lead delegates subtasks), **evaluator-optimizer** (generate, critique, revise), and **reflection** (the model reviews its own output before finalizing).
- **Single vs multi-agent** — multiple agents add coordination cost and a new surface for failure. Use one agent until a task genuinely needs separate roles or contexts. Most don't.
- **MCP (Model Context Protocol)** — an open standard for connecting models to tools and data sources, so integrations are reusable instead of rebuilt per app.
- **Failure modes** — **loops** (the agent repeats the same action forever) and **compounding errors** (a small early mistake propagates and amplifies). Long autonomous chains multiply per-step error rates.

Here's the math that should scare you: if each step is 95% reliable, a ten-step chain is only about 60% reliable (0.95 raised to the tenth). Reliability practices exist to fight that decay — cap iterations, validate every tool output, constrain the action space, add checkpoints or human approval for risky steps, log traces, and design for graceful failure.

## The escalation ladder

When you face a new problem, climb from the bottom and stop at the first rung that works:

1. **Plain code** — deterministic, fast, free, testable.
2. **A single LLM call** — one prompt, one answer.
3. **RAG** — a single call, but grounded in retrieved context.
4. **A single agent** — a tool loop with an iteration cap.
5. **Multi-agent** — separate roles and contexts coordinating.

Each rung up costs more in latency, money, and unpredictability. Climb only when the rung below *provably* can't do the job — not because the higher rung sounds more impressive.

## Common misconceptions

A few beliefs quietly sink real projects.

- **"A bigger model will fix our hallucinations."** Hallucination is intrinsic to how LLMs work, not a bug awaiting a patch. You design around it with grounding, citation, and verification.
- **"More context means better answers."** Past a point, extra context dilutes attention and buries the important parts in the middle. Curate, don't dump.
- **"The model sounded sure, so it's probably right."** Confidence is not correctness. A model will state a wrong answer with the exact same fluency as a right one.
- **"Our retrieval is fine — the answer was faithful to the source."** A faithful answer drawn from the *wrong* document is still wrong. Check whether you retrieved the right context before blaming the prompt.
- **"We should use AI for this."** For tasks with one exact right answer — math, lookups, rules — an LLM is the wrong tool. Use code.

## How to use this

When you're about to build, walk through these steps in order:

1. **Ask if you need AI at all.** If the task needs the same exact answer every time, write deterministic code and stop here.
2. **Start at the bottom of the escalation ladder.** Reach for the simplest rung — a single call before RAG, RAG before an agent.
3. **Build a golden dataset before you optimize.** Read real failing outputs, cluster them, and name the failure modes. Metrics come after you've looked.
4. **Ground anything factual.** Retrieve, then generate. Never trust ungrounded output for facts, and cite the source.
5. **Diagnose retrieval and generation separately.** If answers are wrong, find out whether you pulled the wrong context or generated badly from good context.
6. **Validate your judge against humans.** Before you believe an LLM-as-a-judge score, confirm it agrees with human labels.
7. **Optimize agents for pass^k, not pass@k.** Reliability over best-case. Cap iterations and validate every tool output.
8. **Treat all external text as untrusted.** Separate instructions from data, defend against prompt injection, and keep a human on irreversible actions.
9. **Design for failure before you ship.** Add fallbacks, timeouts, and clear recovery paths. Assume the model will be wrong, slow, or unavailable.
10. **Stay model-agnostic.** Put the provider behind an interface so you can swap models as price and quality shift.

## Decision quick-reference

| Situation | Right technique |
| --- | --- |
| Answers must cite private or up-to-date documents | RAG (retrieve, ground, cite) |
| Need the same exact answer every time | Don't use an LLM — use code / deterministic logic |
| Output should match a fixed style, format, or behaviour | Fine-tuning (not RAG) |
| Subjective quality scored at scale | LLM-as-judge, validated against humans first |
| Task is a known, fixed sequence of steps | Workflow (chaining / routing), not an agent |
| Open-ended, multi-step task with an unknown path | Single agent with a tool loop + iteration cap |
| Keyword or exact terms (names, IDs) being missed | Hybrid search + reranking |
| Retrieval pulls the wrong or partial context | Query rewriting + contextual retrieval; check precision and recall |
| Multi-hop "how do these relate?" questions | GraphRAG |
| Irreversible or high-stakes action | Human-in-the-loop / augmentation, not automation |
| Untrusted external text feeding the prompt | Treat as data; defend against prompt injection |
| One agent overwhelmed by distinct roles or contexts | Multi-agent (only after single-agent fails) |

## The golden rules

When you forget everything else, remember these:

- **Look at your data before you measure** — error analysis precedes metrics. You can't fix what you haven't read.
- **An eval you don't run is worthless** — wire it into the loop or it doesn't exist.
- **Measure the product, not the model** — generic benchmarks don't tell you if your feature works.
- **Retrieve, then generate** — never trust ungrounded output for facts.
- **A faithful answer over the wrong document is still wrong** — fix retrieval, not just the prompt.
- **Prefer the simplest rung of the ladder that works** — every step up costs reliability and money.
- **Validate your judge against humans** before you believe its scores.
- **Hallucination is permanent** — design around it, don't wait for a fix.
- **Optimize for pass^k, not pass@k** — consistency beats best-case.
- **Assume the model will fail** — build the fallback before you ship the feature.

## Conclusion

If only one idea survives, make it this: **always reach for the simplest rung of the ladder that provably works, and design for the moment it fails.** Everything else — evals, retrieval, agents, judgment — is in service of that single instinct.

The engineers who ship reliable AI aren't the ones who memorized the most techniques. They're the ones who stayed disciplined about *not* using the fancy one until the boring one ran out of road.

So the next question worth chasing is the one this whole sheet circles around but never fully answers: how do you build an eval that actually predicts production failures before your users find them? Master that, and every other decision on this page gets easier.
