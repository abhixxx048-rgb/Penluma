---
title: "Context Engineering for AI Agents: Why More Isn't Better"
metaTitle: "Context Engineering for AI Agents"
description: "Context engineering for AI agents means feeding the model the smallest set of high-signal tokens. Learn why more context hurts accuracy, cost, and speed."
keywords:
  - context engineering
  - AI agent memory
  - context window management
  - lost in the middle
  - context rot
  - prompt caching
  - agentic RAG
  - just-in-time retrieval
  - multi-agent systems
  - long-term memory for agents
  - LLM attention budget
  - compaction and summarization
  - sub-agent isolation
  - reduce offload retrieve isolate
faq:
  - q: "What is context engineering for AI agents?"
    a: "Context engineering is the practice of curating the smallest set of high-signal information an AI agent sees at each step. Unlike prompt engineering, which polishes one prompt, it manages the entire payload: system prompt, tools, history, retrieved data, and memory."
  - q: "Why does adding more context make an AI agent worse?"
    a: "A model's attention is a finite budget spread across every token. As the input grows, focus on any single token weakens, recall drops, and distractors crowd out the signal. More context costs more money, adds latency, and past a point lowers accuracy."
  - q: "What is 'lost in the middle' in language models?"
    a: "It is a measured pattern where models recall information best when it sits at the very start or end of the context and much worse when it sits in the middle. Accuracy can fall by more than 30 percent for facts buried mid-context."
  - q: "What is the difference between short-term and long-term agent memory?"
    a: "Short-term memory is thread-scoped working memory for the current session. Long-term memory persists across sessions and threads, holding facts, past experiences, and learned rules the agent can recall on demand."
  - q: "How does prompt caching reduce costs for agents?"
    a: "Caching reuses the compute for an unchanged prefix instead of reprocessing it. A cache read can cost about 90 percent less than fresh input, but a single changed byte anywhere in the prefix invalidates everything after it."
  - q: "Should I build a multi-agent system or a single agent?"
    a: "Isolate work into sub-agents when subtasks are independent and read-mostly, like breadth-first research. Keep a single writer when tasks share state or coordinate writes, since scattered agents often fail from missing context."
topic: agent-orchestration
topicTitle: Multi-Agent LLM Systems
category: AI & LLMs
date: '2026-06-16'
order: 999
icon: "\U0001F916"
author: Pritesh Yadav
transformed: true
sources:
  - "https://arxiv.org/abs/2307.03172"
---

Pour more water into a glass and eventually it spills. An AI agent's context window works the same way, except the spill is invisible: the model keeps answering, just less accurately.

Here is the counterintuitive part. Stuffing an agent with more information often makes it dumber, slower, and more expensive all at once. The skill that separates a flaky demo from a reliable agent isn't writing a clever prompt. It's deciding, at every single step, what *not* to include.

That skill is called context engineering, and it rests on one idea: find the smallest set of high-signal tokens that gets you the outcome you want.

## Why this matters

Every token you feed a model has a price tag. It costs money, it adds delay, and beyond a certain point it actively hurts the quality of the answer.

The numbers are stark. Agents burn through roughly four times more tokens than a normal chat, and multi-agent systems use around fifteen times more. In one of Anthropic's evaluations, token usage alone explained 80 percent of the difference in performance between runs. Not the model choice. Not the tools. Just how many tokens were in play.

So if you are building anything that uses an LLM to take actions over many steps, context is your single biggest lever on both cost and quality. Get it right and you ship something fast and cheap that works. Get it wrong and you pay more for worse results.

## Context is a budget, not a bucket

Think of the context window not as a storage bucket but as an **attention budget**, like a person's working memory.

This isn't a soft preference. It's mechanical. A transformer model has to weigh the relationship between every pair of tokens in the input. As the input grows, a fixed amount of attention gets spread thinner and thinner across more relationships. Every token you add slightly weakens the model's focus on every other token.

That gives you the core tension of the whole field: **more context length means less attention focus.** You cannot escape it. You can only manage it.

The practical rule for every part of your payload, the system prompt, the tool definitions, the examples, the history, is the same three words: informative, yet tight.

## The "lost in the middle" problem

Here is a finding that surprises most people. If you bury an important fact in the middle of a long context, the model is far more likely to miss it than if the same fact sits near the beginning or the end.

Researchers (Liu and colleagues, in the paper *Lost in the Middle*) varied where a key fact appeared in a long document and watched accuracy trace a **U-shape**: high at the start, high at the end, and sagging badly in the middle. The drop for mid-context facts often exceeded 30 percent, even for models marketed as handling long contexts.

A separate large study tested 18 frontier models from four different labs. Its blunt conclusion: models do not read their context evenly, and performance grows steadily more unreliable as the input gets longer. **Every model degraded at every length increment they tested.**

A few details from that work are worth keeping in mind:

- **Distractors compound.** Even a single irrelevant-but-related passage lowered accuracy. Add four, and the damage stacks up.
- **Similarity matters.** When the question and the buried fact share little wording, the model loses the fact faster as context grows.
- **Neat prose can hurt.** Counterintuitively, models sometimes did *worse* when the surrounding filler text flowed coherently, and better when it was shuffled.

The takeaway is short. It's not just whether the information is present. It's *how* and *where* you present it.

## The five moves that manage context

Almost every good technique fits into one of five buckets. Four shrink or relocate what the model sees. The fifth makes the stable part cheaper.

### 1. Reduce: shrink what's in the window

When a conversation creeps toward the window limit, you have two options.

The cheapest is **tool-result clearing**: once you've used a tool's raw output, drop it. You recorded what mattered, so the bulky original is just dead weight.

The richer option is **compaction**: summarize the conversation so far and restart with the compressed version. A good summary keeps the load-bearing stuff, like architectural decisions, unresolved bugs, and key implementation details, while discarding redundant tool dumps. When tuning a summarizer, chase **recall first** (capture everything relevant) and then tighten **precision** (cut the fluff).

Anthropic reports that automatic context editing alone lifted agentic search performance by 29 percent, and pairing it with a memory tool pushed that to 39 percent while cutting token use by 84 percent across long, 100-turn tasks.

### 2. Offload: move state out of the window

The window is small and budgeted. A file system is, in the words of the Manus team, unlimited, persistent, and directly usable by the agent. So treat files as the agent's external memory.

One rule makes this safe: **compression must be restorable.** Drop a webpage's content but keep its URL. Omit a document's text but keep its file path. You shrink the in-context tokens without ever losing the ability to fetch the full thing back.

A vivid example: Claude playing Pokemon keeps running notes across thousands of steps, tracking things like "for the last 1,234 steps I've been training in Route 1, Pikachu has gained 8 levels toward the target of 10." No single context window could hold that history, but a note file can.

### 3. Retrieve just-in-time: load data only when needed

Traditional retrieval (classic RAG) fetches chunks of data up front and pastes them in before the model even starts. Fast, but it fills the window whether or not the model needs all of it.

The agentic approach keeps only **lightweight identifiers** in context, like file paths, saved queries, or links, and loads the actual data at runtime when the reasoning calls for it. This is how a coding agent works: instead of loading an entire codebase, it runs targeted `grep`, `head`, and `tail` commands over the files it actually cares about.

Metadata is a real signal here. Folder names, naming conventions, and timestamps all help the agent decide what to pull and when. The field is moving from static, rule-based retrieval toward systems that *decide* when, what, and how to retrieve as part of their reasoning. The trick is restraint: agents that retrieve too eagerly waste tokens on redundant lookups.

### 4. Isolate: give subtasks their own clean window

For a broad research question, one agent can spawn several specialized **sub-agents**, each with its own fresh context window, each exploring a different angle in parallel. Each sub-agent does messy, detailed work in private and hands back only a condensed summary, often just 1,000 to 2,000 tokens, to the coordinator.

The payoff is that the overall system can reason over far more total information than any single window could hold. Anthropic's multi-agent research setup outran a strong single agent by more than 90 percent on its internal evaluation.

But isolation has a famous counterpoint. The Cognition team argues that multi-agent setups are fragile precisely because sub-agents can't see each other's work, so decisions drift apart and failures, in their words, boil down to missing context. Their advice for write-heavy or tightly coupled work: keep a single agent, with continuous context, doing the actual writing. Let extra agents contribute read-only analysis, never conflicting actions.

The reconciliation is clean:

- **Independent and read-mostly** work (broad research, parallel investigations) → isolate into sub-agents.
- **Shared state or coordinated writes** (refactors, write-heavy pipelines) → keep one writer.

### 5. Cache: make the stable prefix nearly free

This one is different. Caching doesn't change what the model sees. It reuses the *computation* for an unchanged prefix, so you skip paying full price to reprocess the same opening tokens every turn. A cache hit can cost roughly 90 percent less than fresh input.

There is exactly one rule to internalize: **caching is a prefix match, and any byte change anywhere in the prefix invalidates everything after it.** Put your stable content first (tools, then system prompt) and your volatile content last (timestamps, request IDs, the new question).

For the Manus team, cache hit rate is *the* single most important production metric, because with their roughly 100-to-1 ratio of input to output tokens, the prefix dominates the bill. A cached versus uncached input is a tenfold cost difference.

## Memory: short-term, long-term, and the human analogy

It helps to split an agent's memory the way we split our own.

**Short-term (working) memory** is thread-scoped. It holds the current conversation and session state, and gets trimmed or summarized when it won't fit.

**Long-term (persistent) memory** lives in an external store and survives across sessions. Borrowing from how psychologists describe human memory, it comes in three flavors:

- **Semantic memory** holds facts and preferences, like remembering a user works in healthcare and prefers concise answers.
- **Episodic memory** holds past events, like a concrete example of how a similar task was completed before.
- **Procedural memory** holds the rules and how-to, often baked into the system prompt and refined over time.

A key design choice is *when* to write a new memory. Do it on the **hot path** (immediately, during the run) and it's instantly usable but adds latency. Do it in the **background** (a separate process, like a subconscious) and the main loop stays fast, but you have to decide when to trigger memory formation.

The clean mental model: the store is large and persistent; the window is small and budgeted. Context engineering is the discipline of deciding what to page from the store into the window, and when.

## Common misconceptions

**"A bigger context window solves the problem."** It doesn't. Long-context models still lose facts buried in the middle and still degrade as input grows. A larger window raises the ceiling; it does not change the slope.

**"Adding relevant background can only help."** Even useful-looking extra material acts as a distractor. A single related-but-off-target passage measurably lowered accuracy in testing.

**"Context engineering is just prompt engineering with a new name."** Prompt engineering is a one-time act of wording a single prompt well. Context engineering is ongoing curation of the entire inference-time payload, repeated every time you decide what to pass the model.

**"More example shots make the agent more reliable."** Up to a point. But models are excellent mimics, and uniform, repeated context can trap an agent in a brittle rhythm. A little structured variation in your examples actually helps.

**"Hiding errors keeps the agent on track."** The opposite. Leaving a failed action and its stack trace in context lets the model update its own beliefs and avoid repeating the mistake. Recovering from visible errors is one of the clearest signs of real agentic behavior.

## How to use this

Work through this checklist whenever you design or debug an agent's context:

1. **Near the window limit?** Reduce. Clear stale tool results first (it's the cheapest move), then compact: capture every relevant detail, then trim for precision.
2. **Does state need to outlive the window or session?** Offload to files, a memory tool, or a vector store, and make every compression restorable by keeping the path or URL.
3. **Is the data large but only partly needed?** Retrieve just-in-time over lightweight identifiers instead of dumping it all up front.
4. **Are subtasks independent and read-mostly?** Isolate them in sub-agents with clean windows. If they share state or coordinate writes, keep a single writer.
5. **Always, in parallel:** keep the prefix append-only and byte-stable so the cache stays warm. Avoid timestamps in the system prompt, serialize JSON deterministically, and mask tools instead of adding and removing them mid-run.

Two more habits worth building in: put your most load-bearing instructions at the **start or end** of the window, where the model actually pays attention, and keep a continuously updated `todo.md` so the agent's goals stay near the most recent part of the context and don't drift over a long run.

## Conclusion

If you remember one thing, make it this: context is an attention budget, not a storage bucket. Spend it on the smallest high-signal set of tokens you can get away with, and place the tokens that matter most where the model actually looks.

The reflex to add more is almost always wrong. The discipline is in the cut.

And here's the thread worth pulling next. Once you accept that no single window can hold everything, the real architecture question becomes how several agents should divide the work without losing the plot, which is exactly where the debate between isolated sub-agents and a single continuous writer gets interesting.
