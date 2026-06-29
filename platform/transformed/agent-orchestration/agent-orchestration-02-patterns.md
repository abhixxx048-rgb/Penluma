---
title: "Multi-Agent Orchestration Patterns: It's the Wiring"
metaTitle: "Multi-Agent Orchestration Patterns Guide"
description: "A plain-language field guide to multi-agent orchestration patterns: prompt chaining, routing, orchestrator-worker, swarms, debate, and when to use each."
keywords:
  - multi-agent orchestration
  - agent orchestration patterns
  - LLM workflow patterns
  - orchestrator-worker pattern
  - prompt chaining
  - agent routing
  - multi-agent systems
  - supervisor vs swarm
  - blackboard architecture
  - ReAct Reflexion
  - evaluator optimizer
  - map-reduce LLM
  - when to use multi-agent
  - AI agent design patterns
faq:
  - q: What is the difference between an AI workflow and an AI agent?
    a: A workflow runs LLMs and tools through predefined code paths, so it is deterministic and predictable. An agent lets the model decide its own steps and tool use at runtime, so it is flexible but less predictable and more expensive.
  - q: When should I use a multi-agent system instead of a single agent?
    a: Use multiple agents for breadth-first tasks that split into independent directions, work that exceeds one context window, or high-value jobs worth the extra cost. Avoid them when agents need shared context, have many dependencies, or for most coding tasks.
  - q: What is the orchestrator-worker pattern?
    a: A lead LLM breaks a task into subtasks at runtime, hands each to a worker LLM with its own context and tools, then synthesizes the results. Unlike fixed parallelization, the orchestrator decides the subtasks dynamically based on the input.
  - q: How much more do multi-agent systems cost than a single chat?
    a: Roughly speaking, a single agent uses about 4 times the tokens of a normal chat, and a multi-agent system uses about 15 times. That is why they only pay off on high-value tasks.
  - q: What is the difference between a supervisor and a swarm in multi-agent design?
    a: A supervisor keeps central control and routes between agents, which makes behavior auditable but creates a bottleneck. A swarm lets agents hand off directly to each other with no central manager, which is faster but harder to trace.
  - q: Does adding more agents always improve results?
    a: No. Research shows token budget explains most of the performance gains, and at an equal compute budget a single agent can sometimes beat a multi-agent debate. More agents help only when the task genuinely benefits from parallel, independent work.
topic: agent-orchestration
topicTitle: Multi-Agent LLM Systems
category: AI & LLMs
date: '2026-06-16'
order: 999
icon: "\U0001F916"
author: Pritesh Yadav (priteshyadav444)
transformed: true
sources: []
---

You have a task that one prompt cannot quite handle, so the obvious move is to throw more AI at it: split the work, spin up helper agents, let them talk. Then the costs balloon, the agents duplicate each other's work, one of them spawns fifty helpers to answer a simple question, and you can no longer tell why any of it happened.

That is the trap. The number of agents was never the point. The way you wire them together is.

This is a field guide to the standard patterns for connecting LLM agents and workflows. For each one you will learn what it actually is, when to reach for it, and exactly how it tends to break.

## Why this matters

Most "agent" failures are not model failures. They are wiring failures.

The same model, given the same task, can be cheap and reliable or slow and chaotic depending entirely on the structure around it. Pick a rigid pipeline for an open-ended job and it shatters on the first weird input. Pick a free-roaming swarm for a job that needed one clean step and you pay fifteen times the cost to get a worse answer.

The good news: there is a small, well-understood catalogue of patterns. Once you can recognize them, you can match the shape of your problem to the shape of the solution, and you can predict the failure before it bites you. That recognition is the whole skill.

## The one axis that organizes everything

Before the patterns, hold one idea in your head. Every pattern sits somewhere on a single line that runs from **fully code-controlled** to **fully model-controlled**.

Anthropic, in its guide *Building Effective Agents*, draws the line like this:

- **Workflows** orchestrate LLMs and tools through **predefined code paths**. You wrote the steps. The model just fills in the blanks. Deterministic and reliable.
- **Agents** let the LLM **dynamically direct its own process and tool use**. The model decides the steps. Flexible and open-ended, but harder to predict.

OpenAI describes the identical split as **orchestrate via code** versus **orchestrate via the LLM**. Same axis, different words.

As you slide from the code end toward the model end, three things move together:

- **Cost goes up** (more model calls, more tokens).
- **Determinism goes down** (you control less of what happens).
- **Flexibility goes up** (the system handles messier, more open tasks).

```
DETERMINISTIC / code-controlled            AUTONOMOUS / model-controlled
Prompt chaining → Routing → Parallelization → Orchestrator-worker → Swarm
            cost up, determinism down, flexibility up  →
```

The single most important habit, straight from Anthropic: **start with the simplest thing that could work, and add complexity only when the simpler version demonstrably fails.** A sharper prompt beats a workflow. A workflow beats an agent. An agent beats a swarm. Move right only when forced.

Why so cautious? Because agents carry **higher cost and the risk of compounding errors**. A bad early step quietly poisons everything downstream. Three principles keep that in check: keep it simple, keep it transparent (surface the planning steps so you can see what happened), and carefully design the tools the agent uses, with clear docs and testing.

Now, the patterns, roughly from the code end to the model end.

## Prompt chaining: a fixed assembly line

**What it is.** Break the task into **fixed sequential steps**. Each LLM call works on the previous call's output. Between steps you can add small programmatic checks, "gates," that validate the intermediate result before moving on.

Think of it as a factory line. Station one builds, station two refines, an inspector waves it through or pulls it off the belt.

**A real example.** Write an outline, validate that the outline covers the brief, then draft the full document from it. Or: generate marketing copy, then translate it into five languages.

**When to use it.** The task cleanly splits into the same fixed steps every time, and you are happy to trade a little speed for higher accuracy at each step.

**When not to.** The steps change depending on the input. A rigid line is brittle the moment the work stops being predictable.

**How it breaks.** Latency stacks up linearly because every step is a full round-trip. Worse, errors travel downstream: a bad step-one output ruins every later step unless a gate catches it.

## Routing: send each input to the right specialist

**What it is.** Classify the incoming request first, then **send it to a specialized prompt or model** built for that category.

**A real example.** A support system reads each ticket and routes billing questions, bug reports, and refund requests to three different specialist prompts. A second flavour routes by difficulty: easy questions go to a small cheap model, hard ones go to a powerful expensive model. That difficulty split is one of the simplest cost levers you have.

**When to use it.** Inputs fall into **distinct categories** that are genuinely better handled apart, and your classifier is accurate.

**When not to.** The categories blur into each other or you cannot classify reliably. Then misroutes dominate, and a misrouted request gets a confidently wrong specialist.

**How it breaks.** Misclassification is the headline failure. The router is also a single point of failure and a bottleneck: if it stalls, nothing moves.

## Parallelization: run several at once, then combine

**What it is.** Run multiple LLM calls **at the same time** and merge the results with code. Two flavours:

- **Sectioning** splits the task into **independent pieces**, runs them in parallel, and combines the outputs.
- **Voting** runs the **same task several times** (different prompts or temperatures) and aggregates by majority or threshold.

**Real examples.** Sectioning: run a safety guardrail check alongside the main response, in parallel, so screening adds no extra wait. Voting: have several independent reviewers scan code for vulnerabilities, and flag anything a threshold of them agree on.

**The key distinction.** Parallelization uses **fixed, predefined** parallel paths that you decided in advance. That is what separates it from the orchestrator-worker pattern coming up next, where the model decides the paths at runtime.

**How it breaks.** Aggregation is the hard part. Voting can wash out a correct minority answer that got outvoted. Cost multiplies by the number of runs. And it only works when the pieces are truly independent; hidden dependencies between them produce inconsistent merges.

There is a well-known reasoning-level cousin here called **self-consistency**: sample several chains of thought for one problem and take the answer they converge on. Same idea, applied inside one model's reasoning.

## Orchestrator-worker: a lead agent that improvises the plan

**What it is.** A central **lead LLM breaks the task into subtasks it decides on the fly**, hands each to a worker LLM, then **synthesizes** their results. The defining trait, and the line between this and plain parallelization: the subtasks are **not predetermined**. The orchestrator reads the specific input and chooses them.

```
        Input
          │
    ┌─────▼──────┐
    │Orchestrator│  plans, decides subtasks at runtime
    └──┬──┬──┬───┘
       │  │  │      spawns workers (count chosen dynamically)
     ┌─▼┐┌▼┐┌▼─┐
     │W1││W2││W3│   each worker: own context + own tools
     └─┬┘└┬┘└┬─┘
       └──┼──┘
    ┌─────▼──────┐
    │Orchestrator│ → synthesize → Output
    └────────────┘
```

**When to use it.** Complex tasks where you genuinely cannot predict the subtasks in advance, like multi-file code changes or gathering and weighing many sources.

### The flagship case study: Anthropic's research system

The clearest real-world version of this pattern is Anthropic's multi-agent research system, and its numbers are worth remembering.

**How it is built.** A **lead agent** (Claude Opus 4) analyzes your query, forms a strategy, saves that plan to memory, and spins up **subagents** (Claude Sonnet 4). Each subagent gets its **own context window and own tools** and acts as an intelligent filter: it searches on its own, judges what is worth keeping, and returns only refined findings. The lead then decides whether more digging is needed and writes the final answer.

**Two layers of parallel work.** The lead launches three to five subagents at once instead of one at a time, and each subagent fires off three or more tool calls in parallel. Together this cut research time by **up to 90 percent** on complex queries, turning hours into minutes.

**The payoff and the price.** The multi-agent setup beat a single Opus 4 agent by **90 percent** on Anthropic's internal research eval. But the cost is real: a single agent uses about **4 times** the tokens of a normal chat, and this multi-agent system uses about **15 times**. Anthropic found that **token usage alone explained around 80 percent** of the performance differences on one benchmark. Sit with that: most of the gain came from spending more tokens, not from cleverness in the topology.

**What went wrong in production.** This is the most useful part. They watched the system:

- spawn **50 subagents for a simple query**, then search endlessly for sources that did not exist;
- do **duplicate work**, with subagents exploring the same topic instead of dividing it;
- compound small errors, because agents are stateful and "minor system failures can be catastrophic";
- favor **SEO-optimized content farms** over authoritative but lower-ranked sources like academic PDFs.

Because runs are non-deterministic, debugging required **full production tracing**. You cannot fix what you cannot see.

**How they tamed it.** A few principles did most of the work:

1. **Delegate in detail.** Give each subagent a clear objective, output format, tool guidance, and boundaries. A vague brief like "research the semiconductor shortage" causes misreads and duplicate searches.
2. **Scale effort to complexity.** Write explicit rules into the prompt: a simple fact-find gets one agent, a comparison gets a few, a sprawling task gets ten or more with divided responsibilities.
3. **Design tools carefully.** "Bad tool descriptions can send agents down completely wrong paths." A tool-testing agent that rewrote those descriptions produced a **40 percent drop in task completion time**.
4. **Go broad, then narrow.** Start wide, evaluate, then focus.

**When multi-agent is the right call:** breadth-first questions that fan out in independent directions, work that overflows a single context window, and high-value tasks worth heavy parallelization.

**When it is the wrong call:** tasks where every agent needs the **same shared context**, jobs with many dependencies between steps, real-time tight coordination, **most coding tasks** (fewer parts to parallelize), and any low-value task where paying 15 times the tokens makes no sense.

## Evaluator-optimizer: a writer and a separate critic

**What it is.** One LLM **generates**, a **second LLM critiques and gives feedback**, and they loop until the critic is satisfied.

**A real example.** Literary translation, where a draft gets reviewed for nuance and tone, revised, reviewed again. Anything with clear quality criteria and room to improve through rounds.

**When to use it.** You have **clear evaluation criteria**, and feedback measurably improves the output. The tell: a knowledgeable human would also improve this through review, and the model can produce a meaningful critique.

**The distinction to remember.** Here a **separate** critic judges the generator. That is different from reflection (below), where the **same** agent critiques itself.

**How it breaks.** It can loop forever without a stopping cap. The critic is only as good as its criteria, so vague criteria give useless feedback. Two model calls per round multiply cost. And the two can quietly settle on a mediocre answer they both find acceptable.

## Hierarchical supervisor trees: managers of managers

**What it is.** A **supervisor agent controls all communication and delegation**, choosing which agent to invoke. Make it hierarchical and you get supervisors of supervisors: agents grouped into teams, each team with its own supervisor, and a top supervisor routing between teams. It is orchestrator-worker stretched across multiple levels.

**When to use it.** You have many specialists that group naturally into domains, and you need a clear, **auditable** control structure. As the LangGraph team puts it, a supervisor tree is "easier to reason about: one routing node, clear control flow, every decision visible in traces." Choose it when control and observability matter more than raw speed.

**How it breaks.** The supervisor is a bottleneck and a single point of failure. Every level adds a model call, so deep trees pile on latency. And a top supervisor that mis-routes between teams compounds the error across levels.

## Blackboard: agents that coordinate through shared memory

**What it is.** Instead of messaging each other directly, agents coordinate through a **shared workspace, the "blackboard."** A control agent posts a request describing what is needed, and any agent watching the board decides for itself whether it can contribute. The board holds the task posts, partial solutions, and history.

Picture detectives around a literal corkboard. Nobody is assigned a lane. Whoever has a relevant clue steps up and pins it.

**When to use it.** Open-ended problems where you do not know in advance which specialist matters, like information discovery or data-science exploration. It is also notably **token-efficient**: the board keeps compact, high-salience notes rather than full conversations, which lowers cost.

**How it breaks.** The scheduling policy (who writes next) is the genuinely hard part; a bad one causes thrashing or stalls. Shared state can grow without bound and pressure the context. Concurrent writes create contention. And because coordination is indirect, causality is harder to trace than in a tidy supervisor tree.

## Network and handoff: a leaderless swarm

**What it is.** A **decentralized** topology with **no central orchestrator**. Agents hand control directly to one another based on who is the right specialist. A "swarm" remembers which agent was last active, so the conversation simply resumes with that agent on the next turn.

In practice, a triage agent reads the request and **hands off** to a specialist, who then becomes the active agent and answers you directly, no manager narrating in between. (In the OpenAI Agents SDK, released in March 2025, a handoff is literally a function that returns the next agent.)

**When to use it.** When the specialist should answer the user directly and you want focused, per-agent prompts. Swarms are faster than supervisor trees: no intermediary, direct handoffs, fewer model calls.

**A clean way to remember the fork.** OpenAI contrasts two approaches:

- **Manager (agents-as-tools):** a central manager calls specialists as tools, keeps control, and owns the final answer. This is essentially centralized orchestrator-worker.
- **Handoffs:** control transfers to the specialist for that turn. This is the swarm.

**How it breaks.** No agent sees the whole picture, so enforcing an overall goal is hard. Agents can ping-pong, handing off back and forth in a loop. With no supervisor to catch a routing error, mistakes just propagate. And it is harder to trace than centralized control.

## Debate and ensemble voting: a society of minds

**What it is.** Several agents independently propose answers, then **critique each other across rounds** until they converge. Ensemble voting is the lighter cousin: run several models or paths and aggregate by majority. The idea is that diverse reasoning, cross-checked, catches errors a single line of thinking would miss.

**When to use it.** Reasoning-heavy tasks like math or factual question-answering where cross-verification reduces hallucination, and judge-style ensembles where robustness matters.

**How it breaks (and the recent research caveats).** Debates suffer **"problem drift"**: over rounds they wander away from the original question. Cost is heavy, since it scales with rounds times agents. And, importantly, it is **not always worth it**. A 2026 paper found that on multi-hop reasoning, a **single agent can beat a multi-agent debate at an equal thinking-token budget**. The likely reason ties back to our earlier theme: the gains often come from spending more compute, not from the debate structure itself. Agents can also converge on a confidently wrong consensus.

## Map-reduce: divide a corpus too big to read

**What it is.** The classic map-reduce idea applied to content that exceeds the context window. **Split** the corpus into chunks, **map** the LLM over each chunk independently (summarize or extract), then **reduce** by combining those intermediate outputs, recursively, until one consolidated result remains.

**When to use it.** The content far exceeds the context window, the chunks are largely independent, and you want parallel throughput. Summarizing or classifying across many documents is the bread-and-butter case.

It helps to know the alternatives for long content. **Stuffing** puts everything in one prompt, but only works if it fits. **Refine** goes sequentially, carrying a running summary chunk by chunk, which gives better continuity but less parallelism. Map-reduce is the parallel, scalable middle.

**How it breaks.** The big one is **loss of cross-chunk context**: the map step cannot see other chunks, so a theme or entity that spans documents gets lost. Too many intermediate summaries can overflow the reduce step, forcing a recursive reduce. And information dilutes a little at each reduce level.

## Loop-until-done: a single agent that learns from itself

**What it is.** One agent **iterates**, act, observe, self-critique, refine, until it hits a quality threshold or a stop condition. The well-known family members:

- **ReAct** interleaves reasoning with acting (tool calls), which improves planning and makes the agent's thinking legible.
- **Reflection / Self-Refine** makes the model both writer and editor: it critiques its own output and revises, with no extra training.
- **Reflexion** goes further: the agent reflects on its whole trajectory, stores verbal reflections in persistent memory, and restarts with that critique in context, learning across multiple attempts.

**The distinction to remember.** Here the **same agent** critiques itself, often with memory across attempts. That is the contrast with evaluator-optimizer, which uses a **separate** critic.

**When to use it.** Tasks with **verifiable feedback**, where tests pass or fail, a tool errors, or a rubric scores the output. The agent improves by learning from its own mistakes.

**How it breaks.** Without a hard iteration cap, it can loop forever. Self-critique is unreliable: with no external ground truth, the model may not notice its own errors. Reflection memory accumulates noise over trials. And it can entrench an initial wrong approach if each reflection just reinforces the bad frame.

## A side-by-side cheat sheet

| Pattern | Parallelism | Determinism | Relative cost | Best for |
|---|---|---|---|---|
| Prompt chaining | None | High | Low | Fixed, decomposable tasks; accuracy over latency |
| Routing | None | High | Low | Distinct input categories; cost-tiering models |
| Parallelization (sectioning) | High | High | Medium | Independent subtasks; speed; guardrails |
| Parallelization (voting) | High | Medium | Medium-High | Confidence via multiple perspectives |
| Orchestrator-worker | High | Low | High (~15x chat) | Open-ended subtasks; breadth-first research |
| Hierarchical supervisor | Medium-High | Medium | High | Many grouped specialists; auditable control |
| Blackboard | High | Low-Medium | Low-Medium | Dynamic agent selection; token-sensitive work |
| Network / swarm | Medium | Low | Low-Medium | Specialist answers directly; conversational routing |
| Debate / voting | High | Low | High | Reasoning tasks; hallucination reduction* |
| Map-reduce | Very high | High | Medium-High | Content exceeding the context window |
| Loop / reflection | None | Low | Medium-High | Verifiable-feedback tasks; self-improvement |

\* may not beat a single agent at an equal token budget.

Read it top to bottom and the master axis reappears: determinism falls and cost rises as you move from code-controlled patterns to model-controlled ones.

## Common misconceptions

**"More agents means better results."** Usually not. Token budget explains most of the measured gains, and at an equal compute budget a single agent sometimes beats a debate. Reach for more agents only when the work genuinely splits into parallel, independent parts.

**"Multi-agent is the advanced, professional choice."** It is the expensive choice, at roughly 15 times the tokens of a chat. It is only worth it when the task's value justifies that bill. For most coding tasks, where the parts are tangled together, it is the wrong tool.

**"Once it works, I'm done."** Agents are stateful and non-deterministic. The same input can take a different path next time, so you need production tracing to debug at all. Observability is not optional polish; it is part of the design.

**"Decentralized swarms are simpler."** They have fewer moving managers, but they are harder to steer and trace. No agent holds the whole picture, so enforcing a global goal and debugging a bad handoff both get harder, not easier.

## How to choose, in practice

1. **Start at the simplest end.** Try one well-crafted prompt first. Only move toward chaining, then workflows, then agents when the simpler version provably falls short.
2. **Name your spot on the axis.** Decide consciously how much control you hand to the model versus keep in code. That single choice drives your cost, predictability, and flexibility.
3. **Match the pattern to the task shape.** Fixed steps, use chaining. Distinct categories, use routing. Independent chunks, use parallelization or map-reduce. Truly unpredictable subtasks, use orchestrator-worker. Clear pass/fail feedback, use a reflection loop.
4. **Budget before you build.** If you are looking at multi-agent, confirm the task is valuable enough to justify roughly 15x the token cost. If not, collapse it back to something simpler.
5. **Delegate in detail.** Give every subagent an objective, an output format, tool guidance, and boundaries. Vague briefs are the number-one cause of duplicate work and drift.
6. **Set hard stops.** Add iteration caps to every loop, a stopping rule to every debate, and rules that scale effort to complexity so an agent cannot spawn fifty helpers for a trivial question.
7. **Invest in tools and tracing.** Write clear tool descriptions (bad ones derail agents) and turn on full tracing from day one, because you cannot fix what you cannot see.

## Conclusion

If you take one thing away, take this: **the wiring matters more than the number of agents.** The same model becomes cheap and reliable or slow and chaotic depending entirely on the structure you put around it, and the safest default is the simplest pattern that clears the bar.

There is a quieter lesson hiding in Anthropic's numbers, though. When most of your gains trace back to spending more tokens, the real question stops being "how many agents?" and becomes "how do I spend a fixed compute budget well?" That is where the next frontier lives, in the tooling, evaluation, and tracing that decide whether all that orchestration was worth it. Get the wiring right first, and those harder questions become ones you can actually answer.
