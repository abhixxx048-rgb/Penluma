---
title: "AI Agents Explained: From One LLM Call to Multi-Agent Systems"
metaTitle: "AI Agent Architecture & Orchestration Guide"
description: "Learn how AI agents really work: the ReAct loop, tools, workflow patterns, and when to go multi-agent. A clear, practical guide to agent architecture."
keywords:
  - AI agent architecture
  - agent orchestration
  - ReAct pattern
  - LLM tool calling
  - multi-agent systems
  - agentic workflows
  - function calling
  - augmented LLM
  - prompt chaining
  - orchestrator workers
  - Model Context Protocol
  - agent reliability
  - context window management
  - LLM as judge
faq:
  - q: What is the difference between a workflow and an agent?
    a: In a workflow, you write the steps in code and the model fills in the blanks at each fixed point. In an agent, the model itself decides what to do next and when it is finished, so the number of steps is not known ahead of time. Workflows are cheaper and more predictable; agents are more flexible.
  - q: What is the ReAct pattern in AI agents?
    a: ReAct stands for Reason plus Act. The agent loops through Thought (plan the next move), Action (call a tool), and Observation (read the real result), repeating until it is done. The observation step grounds the model in real data and curbs hallucination.
  - q: Does the language model actually run the tools itself?
    a: No. The model only emits a structured request to call a function, like a chef writing an order ticket. Your application code validates the arguments, runs the real function, and feeds the result back. This separation is what keeps the system safe and controllable.
  - q: When should I use a multi-agent system?
    a: Only for breadth-first, parallelizable, read-heavy tasks where the extra cost pays off, like researching many sources at once. Multi-agent setups can burn roughly 15 times the tokens of a single chat and hurt on coding-style tasks that need tightly shared context.
  - q: Why do long AI agent tasks fail so often?
    a: Because errors compound. If each step is 95 percent reliable, a 20-step task succeeds only about 36 percent of the time. Push each step to 99 percent and end-to-end success jumps to about 82 percent. Fewer steps and verified intermediate results matter most.
  - q: What is the Model Context Protocol (MCP)?
    a: MCP is an open standard from Anthropic that lets an agent discover and securely call external tools and data through one uniform interface, instead of hand-coding glue for each integration. It is often described as the USB-C for AI tools.
author: Brexis Wazik
transformed: true
linked: true
topic: ai-llm-engineering
topicTitle: AI & LLM Engineering
category: AI & LLMs
date: '2026-06-21'
order: 3
icon: "\U0001F9E0"
sources: []
---

The moment you let a language model *do things* in the world, search the web, run code, edit a file, send an email, and let it decide *what* to do and *when*, something changes. You are no longer "calling a model." You are building an agent.

That sounds exciting, and it is. It is also where most teams trip. They reach for a swarm of autonomous agents when a single well-aimed prompt would have done the job for a fraction of the cost. This guide walks you up the ladder from one model call to full multi-agent systems, so you know exactly which rung your problem actually needs.

## Why this matters

Agents are powerful and expensive, and the gap between the two is huge. A naive agent can turn a 40-cent request into a 5-dollar runaway, loop forever, or cheerfully tell you it finished a job it botched.

Get the architecture right and you ship systems that are reliable, cheap, and debuggable. Get it wrong and you get unpredictable bills, silent failures, and a product you cannot trust in front of users.

The single most important idea, repeated by nearly every serious practitioner, is simple: **start with the simplest thing that works, and add complexity only when it measurably earns its place.**

## The complexity ladder, one rung at a time

Choosing the right level of autonomy is the first and most consequential decision you will make. Here are the rungs, in plain words.

**A single LLM call** is one prompt in, one response out. No memory, no outside access, one step. This is the right tool for *most* tasks: summarize a document, classify an email as billing or sales, rewrite a paragraph, pull fields out of text. If a good prompt with a few examples solves your problem, you are done.

**An augmented LLM** is a plain model given three new powers. It is the building block of everything agentic:

- **Retrieval** is the model's ability to look things up, [generating its own search query and reading the result](/blog/ai-llm-engineering/03-context-engineering-retrieval). Think of it as a list of facts it never memorized.
- **Tools** are the model's hands, letting it call external functions like a weather API or a database query.
- **Memory** is the model's notepad, letting it jot down what matters and re-read it later.

**A workflow** orchestrates models and tools through code paths that *you*, the developer, write. The control flow is fixed; the model just fills in the blanks. Workflows are predictable, testable, cheaper, and faster.

**An agent** is a system where the *model itself* directs its own process, deciding what to do next, in what order, and when it is finished. The number of steps is not known in advance. You trade predictability and cost for flexibility on open-ended problems. A useful slogan: **capability equals tools times planning ability.**

**A multi-agent system** is the top rung: a lead agent that plans and spawns parallel worker agents, then stitches their results together.

| Rung | Who controls the steps | Cost / latency | Use when |
|---|---|---|---|
| Single LLM call | You, one shot | Lowest | Summarize, classify, extract, rewrite |
| Augmented LLM | Model, within one turn | Low | You need a fact or one external action |
| Workflow | You, fixed code | Low, predictable | Task breaks into known steps |
| Agent | The model, in a loop | High, variable | Open-ended, step count unknown |
| Multi-agent | Lead plus workers | ~15x a chat | High-value, parallel, read-heavy |

Here is an analogy that sticks. **A workflow is a train on rails you laid down. An agent is a taxi you give a destination.** The taxi picks the route live and handles detours, but it costs more and might take a wrong turn. Reaching for the taxi when the train would do is itself a failure.

## How a model reaches outside itself: tools

A model on its own can only produce text. **Tools** (also called **function calling**) are what let it act. Here is the mental model that trips up beginners: *the model never runs any code itself.*

It only emits a structured *request* to call a function. Your application executes the real function and feeds the result back. That separation is exactly what keeps the system safe, because you decide which functions exist and what arguments are allowed.

Picture a chef and a waiter. The model is the chef who writes the order ticket ("table 4: get weather, city Paris") but never leaves the kitchen. Your code is the waiter who carries it out, does the real work, and brings back the result. The chef only ever sees tickets and results, never the dining room.

A single tool turn looks like this:

1. You send a user message plus a list of tool definitions to the model.
2. The model decides a tool is needed and returns a structured call, like `get_weather({"city": "Paris"})`, each tagged with a unique id.
3. *Your* code parses the request, **validates the arguments**, and runs the real function.
4. You send the result back, referencing that same id.
5. The model uses the result to answer, or to call another tool.

That id matters once tools run in **parallel** in one turn, because it tells the model which result answers which call. A setting called **tool_choice** lets you constrain behavior: let the model decide, force it to use some tool, or force one specific tool.

The takeaway: a tool call is a *request*, not an execution. The model proposes; your code disposes. Validate every model-supplied argument before you run anything, because a model's ceiling is set by the quality and clarity of the tools you give it.

## The engine of every agent: the ReAct loop

The heartbeat of an agent is a simple loop: **perceive, reason, act, observe, repeat.** The agent reads input, decides on an action, calls a tool, reads the result, and uses that result to decide the next move.

The magic is that it gets *real feedback from the environment at every step*. That ground truth lets it self-correct instead of flying blind.

The foundational named version is **ReAct** (Reason plus Act), introduced by Yao and colleagues in 2022. It interleaves three repeating elements:

- **Thought** is the model reasoning about the current state and planning its next move.
- **Action** is the model calling a tool.
- **Observation** is the model reading the result the environment returns.

Why interleave thinking with acting? Because the observation keeps the model honest. Pure step-by-step reasoning from memory, eyes closed, suffers from hallucination and **error propagation**: one wrong turn early and the model confidently builds on a false fact. ReAct opens the model's eyes at each step.

Think of a detective working a case. Form a hypothesis (think), check a clue (act), see what you learned (observe), then update the theory. Each real observation stops the detective from spinning fiction.

In code, the loop keeps calling the model *while* the model keeps asking for tools, and exits when the model says it is done. One thing is non-negotiable: a hard **max iterations** cap, the safety valve that guarantees the loop can never run forever.

```python
messages = [user_message]
for step in range(MAX_ITERATIONS):       # hard stop, never unbounded
    resp = model(messages, tools=TOOLS)
    if resp.stop_reason != "tool_use":
        return resp                      # final answer
    for call in resp.tool_calls:
        try:
            result = run_tool(call.name, validate(call.input))
        except ToolError as e:
            result = f"Error: {e}. Try an absolute path."   # feed error BACK
        messages.append(tool_result(call.id, result))
raise Budget("hit max iterations, escalate to a human")
```

## Workflow patterns: fixed paths that do a lot

Before reaching for autonomy, know that a huge share of real systems run on a handful of *fixed* patterns where *you* write the control flow. They compose freely; a router can sit in front of chains, an orchestrator can spawn parallel workers.

### Prompt chaining

Break a task into a fixed sequence of calls, each consuming the previous output, with optional **gates** (validation checkpoints) between steps. Write ad copy, check that the length and tone are right, then translate it. Each call is simpler and more focused, so quality beats one giant prompt.

### Routing

A first model labels the input, then your code sends it to a specialized handler. A customer message gets tagged "general question," "refund," or "technical issue" and routed accordingly. A common cost trick is **model routing**: trivial questions go to a cheap fast model, hard ones escalate to a stronger one.

The catch: the whole system's quality is capped by classification accuracy. A misroute silently poisons everything downstream, the way a triage nurse who misjudges sends you to the wrong department.

### Parallelization

Run model work at the same time, in two flavors. **Sectioning** splits independent subtasks (one model answers the user while another runs a safety check on the same input). **Voting** runs the *same* task several times and aggregates, like three independent passes hunting for security bugs, flagging a file if *any* pass raises a concern.

### Orchestrator-workers

A lead model reads the input and *dynamically* decides what subtasks are needed, spawns a worker for each, then synthesizes the results. The difference from plain parallelization is that the number and nature of subtasks are decided *at runtime*.

The classic case: a coding change that must touch an unknown set of files. The orchestrator inspects the repo, decides which files need edits, dispatches a worker per file, then assembles the diff. You could not have hardcoded that list. It is a newsroom editor assigning stories on the spot, then stitching the pieces into one article.

### Evaluator-optimizer

A generator produces a candidate, an evaluator critiques it against criteria and gives concrete feedback, the generator revises, and the loop continues until it passes. This pays off when articulating feedback would clearly improve the output, such as refining a literary translation over rounds for rhythm and imagery.

## The hard part: making agents reliable

Autonomy brings the defining reliability problem of multi-step systems: **compounding error.** Per-step reliability multiplies.

[A 20-step task at 95 percent reliability per step](/blog/agent-orchestration/agent-orchestration-06-reliability-eval-obs) succeeds only about **36 percent** of the time (0.95 to the 20th power). Push each step to 99 percent and you get about **82 percent**, more than doubling end-to-end success. So the levers that matter most are *fewer steps*, *verifying intermediate results*, and *isolating work* so one bad step cannot poison the rest.

Here are the practices that fight it:

- **Plan, then validate, then execute.** Generate a plan and check it *cheaply* before spending real tool calls. Does it use only real tools? Is it under the step limit? This avoids an unchecked agent burning hours and dollars chasing a bad plan.
- **Reflection and self-critique.** The named framework is **Reflexion** (Shinn and colleagues, 2023). On failure, the agent writes a plain-language post-mortem and prepends it to the context on the next try. Attempt one fails the tests; the agent notes "I assumed the list was sorted; it wasn't, so sort before binary search"; attempt two reads that note and passes. No retraining happened, the fix lived entirely in context.
- **Hard termination limits.** Enforce *multiple independent* stop conditions: max iterations, max total tokens, a wall-clock timeout, and a per-turn retry budget. On exhaustion, return a graceful message and escalate, never a raw stack trace.
- **Feed errors back.** When a tool fails, catch it and return a readable error to the model rather than crashing the loop. The model reads `Error: No file at './data.csv'. Use an absolute path` and adapts.

## Common misconceptions

A few myths quietly cause most agent disasters.

**"More agents means more intelligence."** Reality: multi-agent setups [multiply cost roughly 15-fold](/blog/agent-orchestration/agent-orchestration-07-cost-performance) and fragment work across separate context windows. They shine on parallel research and hurt on tasks needing shared context, like most coding.

**"The model executes its own tools."** Reality: it only requests them. Your validated code runs everything. If you skip validation, you hand a model direct control over your systems.

**"If the agent says it's done, it's done."** Reality: asked to staff a 50-person event, an agent will assign 40 and confidently declare success. Without an explicit evaluator that checks the goal's real constraints, agents declare confident-but-wrong victories all the time.

**"Just retry on failure."** Reality: blindly retrying a payment or any state-changing write creates duplicate charges. Only auto-retry **idempotent** operations (ones safe to repeat), and attach an **idempotency key** to anything that changes state.

**"Prompt wording is the main lever."** Reality: Anthropic reports spending *more* time designing the tools (their names, parameters, and docs) than the top-level prompt. The interface is the lever.

## Mistake-proof your tools and curate your context

Two design ideas punch far above their weight.

The first is **poka-yoke**, a manufacturing term for "mistake-proofing": design so an error is structurally *impossible*. Anthropic's coding agent kept making path errors with *relative* file paths, so they changed the tool to require *absolute* paths, erasing the entire error class by construction instead of hoping the model would remember.

The second is treating the **context window** (the model's working memory) as a finite, degrading resource. As it fills, recall accuracy drops, a phenomenon called **context rot**. The context window is a whiteboard, not a hard drive: small, and it gets messy as you scribble. Manage it with:

- **Compaction.** Near the limit, ask the model to summarize the history, preserving decisions and open questions while discarding redundant tool output, then continue from the condensed version.
- **External note-taking.** The agent writes durable notes to storage *outside* the context window and re-reads them later, giving effectively unbounded memory at low cost.
- **Just-in-time retrieval.** Carry lightweight references like file paths and URLs, and fetch the actual content only when needed.

One more principle from security: **least privilege.** Give a tool only the access it needs, like handing a contractor one room's key instead of the master key. If a prompt injection tricks the agent, the blast radius is one room, not the whole building.

## Multi-agent systems and the protocols connecting them

The top rung is **multi-agent**: a lead agent that plans, spawns parallel **subagents** (each with its own clean context window and a bounded task), and synthesizes their short summaries.

Anthropic's production research system beat a single-agent setup by over 90 percent on internal research evals, but it burns roughly **15 times the tokens of a chat**. It wins on [breadth-first, parallelizable, read-heavy search](/blog/agent-orchestration/agent-orchestration-00-index), like "find all board members across S&P 500 IT companies." It *hurts* on tasks needing tightly shared context, like coding, where subagents in separate windows cannot see each other's work and end up duplicating or contradicting.

There are two orchestration shapes:

- **Manager (agents as tools).** A central agent calls specialists as bounded tools, keeps control, and writes *one* coherent answer. Use this when several specialists' results must combine into a single voice. It is a general contractor who hires subs, collects their work, and presents the finished house.
- **Handoff.** An agent transfers *full ownership* of the conversation to a peer specialist, who then owns the final response. Use this for clean routing, like a triage agent passing a ticket to billing. It is a relay race: once you pass the baton, the next runner owns the race to the finish.

[Two open standards](/blog/agent-orchestration/agent-orchestration-03-communication-protocols) are emerging for the plumbing. **MCP (Model Context Protocol)**, Anthropic's open standard, is the "USB-C for AI": it lets an agent discover and securely call external tools and data through one uniform interface, instead of hand-coding glue for each. **A2A (Agent2Agent)**, Google's protocol, sits a layer up, letting agents publish a capability "card" and delegate tasks to each other. In short: **MCP connects an agent to its tools; A2A connects agents to other agents.**

## You cannot ship agents on vibes: evaluation and guardrails

Agents are non-deterministic, so the same prompt can give different runs. Three disciplines make them production-worthy.

**Evaluation.** Start with [end-to-end task success](/blog/ai-llm-engineering/02-evaluation-measurement) ("did we meet the user's goal?"), then do *error analysis* to find the *first* place things went wrong. Use **LLM-as-judge**, an LLM scoring another's output against a rubric. Anthropic found a single prompt emitting a 0.0 to 1.0 score plus pass/fail more reliable than ensembles of specialized judges. You can start with just 20 realistic queries; early changes often move scores enough to see in tiny samples.

**Guardrails.** Layer them, defense in depth. *Input* guardrails sanitize incoming content on *every* turn, not just the first. *Output* guardrails filter results before the user sees them. *Tool* guardrails check each individual call. And gate irreversible, high-stakes actions, sending money, deleting data, outbound email, behind a **human-in-the-loop checkpoint**, a pause for approval that is both a safety control and cheap insurance against compounding errors.

**Observability.** You cannot reproduce a non-deterministic failure without its full trace. Assign a trace ID at the entry point and propagate it through every model call, tool call, and handoff, emitting a tree of annotated **spans** with tokens, latency, and cost. A failure you did not record is often impossible to reproduce.

## How to use this: a practical playbook

1. **Start at the lowest rung.** Try a single LLM call first. Only climb when you have *measured* that the current rung is insufficient.
2. **Make your augmented LLM solid before composing anything.** Get retrieval, tools, and memory working as one clean unit.
3. **Prefer workflows over agents when steps are known.** Reach for prompt chaining, routing, or orchestrator-workers before granting open-ended autonomy.
4. **Always validate model-supplied arguments** against your schema before running any tool.
5. **Set multiple hard stop conditions** on every agent: max iterations, max tokens, a timeout, and a retry budget.
6. **Feed errors back as readable text** instead of crashing the loop, and only auto-retry idempotent operations.
7. **Mistake-proof your tools** with poka-yoke parameters like absolute paths and enums, and write each tool description like a docstring for a brand-new junior developer.
8. **Add an explicit evaluator** that checks the goal's real constraints before the agent is allowed to declare success.
9. **Instrument from day one:** a propagated trace ID, per-step cost, a single-prompt LLM judge over about 20 realistic cases, layered guardrails, and human approval on anything irreversible.
10. **Save multi-agent for breadth-first, read-heavy work** where the roughly 15x token cost clearly pays off.

## Conclusion

If you remember one thing, remember the ladder: single call, augmented LLM, workflow, agent, multi-agent. Power and cost rise together at every rung, so climb deliberately and only when the climb earns its place. The teams that win are not the ones with the most agents; they are the ones who matched the architecture to the actual problem.

There is a deeper thread running under all of this. Every reliable agent depends on real observations from its environment to stay honest, which raises a sharper question worth chasing next: how do you design the *environment and tools* themselves so a model can succeed? That craft, shaping the agent-computer interface, is quietly where the next leap in agent reliability is being won.
