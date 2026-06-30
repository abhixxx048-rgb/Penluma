---
title: 'Why AI Agents Fail on Long Tasks (and How to Catch It)'
metaTitle: 'Why AI Agents Fail on Long Tasks'
description: >-
  AI agents that do long, multi-step work fail in ways single prompts never do.
  Learn why reliability decays, how to evaluate agents, and how to see inside them.
topic: agent-orchestration
topicTitle: Multi-Agent LLM Systems
category: AI & LLMs
date: '2026-06-16'
order: 999
icon: "\U0001F916"
keywords:
  - AI agent reliability
  - why multi-agent systems fail
  - agent evaluation
  - LLM observability
  - agent guardrails
  - compounding errors AI agents
  - LLM as judge
  - agent tracing OpenTelemetry
  - durable execution AI agents
  - trajectory evaluation
  - tool hallucination
  - long-horizon agent failure
faq:
  - q: Why do AI agents fail more on long tasks than short ones?
    a: >-
      Reliability decays geometrically with the number of steps. If each step is
      95% reliable, a 20-step task is only about 36% reliable, because every step
      is another chance to go wrong and early mistakes cascade into later ones.
  - q: What is the most common reason multi-agent systems fail?
    a: >-
      Bad design, not weak models. In a study of 1,600+ traces, roughly 42% of
      failures came from specification and system-design problems and 37% from
      agents miscommunicating with each other. You cannot model-upgrade your way
      out of a bad orchestration design.
  - q: Why can't I just use exact-match testing for agents?
    a: >-
      Agents take many valid paths to the same goal. If your reference uses one
      tool and the agent picks a different but equally correct one, exact match
      wrongly flags a success as a failure. You need outcome-based and fuzzy or
      semantic checks instead.
  - q: What is LLM-as-judge and is it reliable?
    a: >-
      It is using one model to score another agent's output against a rubric. It
      scales well and aligns reasonably with humans, but no judge is good
      everywhere and they miss a meaningful share of failures. Treat it as
      necessary but not sufficient.
  - q: How do I avoid restarting a long agent run from scratch when it fails?
    a: >-
      Use checkpointing and durable execution. Save state after each logical step
      so the agent resumes from the failure point instead of the start. Wrap
      non-deterministic LLM calls as journaled steps so they are never re-run on
      replay.
author: Pritesh Yadav (priteshyadav444)
transformed: true
linked: true
sources:
  - https://www.anthropic.com/engineering/built-multi-agent-research-system
  - https://arxiv.org/abs/2503.13657
  - https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans/
---

Picture an AI agent two hours into a forty-step job. It has called a dozen tools, handed work to other agents, and quietly made one small mistake near the beginning. That mistake distorted the next step, which distorted the one after that, and now the whole run is heading off a cliff. Nobody noticed, because the answer it eventually returns will look perfectly confident.

This is the uncomfortable truth about agents that do long, multi-step work: the failures are rarely loud. They compound. And a single fault deep into a run can waste everything that came before it.

## Why this matters

A simple AI call is easy to reason about. One input, one output, success or failure. You can read the result and trust your eyes.

The moment an agent starts to **plan, call tools, hold state, and talk to other agents**, that simplicity is gone. You inherit every classic failure of complex software - race conditions, partial failures, inconsistent state, cascading errors - and then you bolt a probabilistic engine on top.

The result is a system that can be impressively capable and quietly unreliable at the same time. If you are building anything that runs for more than a few steps, the hard part is no longer "can the model do it?" It is "will it keep doing it correctly, and will I know when it doesn't?"

## The long-horizon cliff

Here is the pattern that should reshape how you think about agents.

Frontier models hit near-perfect success on tasks a human could finish in under about four minutes. But success drops **below 10%** on tasks that need more than roughly four hours of human-equivalent work.

As you push agents into longer work, the dominant source of cost and unreliability is not raw model intelligence. It is **time** - the sheer number of chances to go wrong.

### The compounding-error math

Think of each step as a dice roll. Even good dice fail sometimes, and the rolls multiply.

If each step is independently 95% reliable, a 20-step run is only `0.95²⁰ ≈ 36%` reliable. Reliability decays geometrically:

```
steps:        1     5     10     20     40
@95%/step:   95%   77%   60%    36%    13%
@99%/step:   99%   95%   90%    82%    67%
```

Notice the second row. Pushing each step from 95% to 99% reliable takes a 40-step run from a hopeless 13% to a usable 67%. **Small per-step gains pay off enormously over long horizons.**

And the errors do not stay local. An early mistake cascades into later steps, distorting reasoning and compounding misjudgments until the whole trajectory derails. Once a cascade starts, it is hard to reverse. As Anthropic puts it, "minor system failures can be catastrophic for agents."

Two design instincts follow from this, and everything below builds on them:

1. **Cut the horizon.** Fewer steps means fewer dice rolls. Shorten and simplify wherever you can.
2. **Detect and correct mid-run.** Catching a problem early beats repairing it afterward, and it beats restarting from scratch.

## Why agents fail: a field guide

A landmark study, *Why Do Multi-Agent LLM Systems Fail?*, built the first real catalog of agent failures from over 1,600 annotated execution traces across seven popular [agent frameworks](/blog/agent-orchestration/agent-orchestration-04-frameworks). Expert annotators agreed strongly on the labels, so this is not hand-waving.

Its central, slightly deflating finding: **most failures come from design, not model weakness.** Roughly 42% trace back to specification and system-design problems, and another 37% to agents miscommunicating with one another. You cannot buy your way out of these with a smarter model.

The failures cluster into three families.

### Bad instructions and missing stop signs

These are specification problems - the agent was never set up to succeed.

- It **ignores stated constraints** or acts **outside its assigned role**.
- It **needlessly redoes** completed work, or **loses earlier context** and reverts to an old state.
- It **doesn't know when to stop**, so it loops forever.

That last one is worth dwelling on. An agent with no clear termination condition will happily ping-pong on a goal, reinterpreting it slightly each time. The fix is unglamorous but effective: explicit **max-step and max-cost budgets**, loop detection that spots repeated identical actions, and a forced stop.

### Agents talking past each other

When agents collaborate, new failure modes appear that no single agent has.

- One agent **fails to ask for clarification** and proceeds on a guess.
- One **withholds information** a teammate needed, or **ignores a teammate's input** entirely.
- An agent's **reasoning and its actual action diverge** - it explains one plan and executes another.

Here is the dangerous part. A misaligned agent produces an output, the next agent accepts it as authoritative, and the verification step that should have caught the problem never fires. Multi-agent systems **amplify** errors across agents rather than averaging them out. Treat every [handoff between agents](/blog/agent-orchestration/agent-orchestration-03-communication-protocols) as an untrusted boundary: check the shape and origin of what you received, and never assume the upstream agent actually did what it claimed.

### Nobody checks the work

The third family is about endings.

- The agent **stops too early**, before the objective is met.
- It **skips verification**, so errors slip through unchallenged.
- It **verifies, but badly** - going through the motions without actually catching anything.

### When tools get hallucinated

There is one more failure worth its own callout, because it has a security edge. Agents sometimes misuse tools: they call a function that doesn't exist, invent parameter names, or pass malformed values.

That sounds like a mere bug until you consider this scenario. An agent told never to read secrets can **hallucinate a `read_secret` capability**. If a function by that name happens to exist in the environment, the call executes. A made-up tool name becomes real **privilege escalation**.

The defenses are concrete: strict schemas for every tool, argument validation *before* execution, **fail closed** on anything invalid, and precise tool descriptions with examples so the model is less tempted to improvise.

## Guardrails: layers that keep agents in bounds

**Guardrails** are the controls that constrain what an agent can do - blocking harmful outputs, rejecting adversarial inputs, and keeping the agent inside its authorized scope. Think of them as guard rails on a mountain road, not a destination.

The practical pattern is to layer them:

- **Input validation.** Before the agent acts, screen the request. Detect prompt injection and jailbreak attempts, block requests carrying sensitive data, and filter for relevance with classifiers and blocklists.
- **Action guardrails on every tool call.** Wrap *each* tool call with an authorization check, argument validation, a rate limit, a **cost ceiling**, and a kill switch. A budget cap on spend is what stops a misconfigured agent from spiraling into a huge bill.
- **Output validation.** Before anything downstream consumes the agent's output, enforce the expected format. Validate first, consume second.
- **Permission gating.** Least privilege per tool. The agent can only act within the scope you explicitly granted.
- **Human-in-the-loop checkpoints.** When risk crosses a threshold, pause the run and ask a person. This matters most **early in deployment**, when you are still discovering edge cases.

Both OpenAI and LangGraph ship primitives for this - relevance and safety classifiers, tool scoping, and interrupt-and-approve flows that literally pause a run until a human signs off. The shape is consistent across vendors, so you can adopt the pattern even if you switch tools.

## Evaluation: judging agents that won't follow a script

### Why exact-match testing breaks

Traditional testing checks output against a known-correct answer. That falls apart for agents, because **agents take many valid paths to the same goal.** Even from identical starting points, two runs might reach the right answer completely differently.

Imagine your reference solution calls `search_web`, but the agent calls `search_documentation` - and both genuinely solve the task. Exact match labels that success a failure. You need fuzzy and semantic checks, not string equality.

### Outcome evals versus trajectory evals

There are two questions you can ask, and you need both.

- **Outcome evals** ask: did the task succeed? They tolerate many valid paths and are the natural default. But an agent "can call every tool correctly and still fail," and a correct-looking answer can hide broken reasoning or a lucky-but-wrong shortcut.
- **Trajectory evals** ask: was the *path* sound? They inspect which tools were chosen and how the agent reasoned. This catches failures a correct answer would mask - for example, an agent that issued a refund **without verifying identity first.**

A good rule: run three levels together.

```
end-to-end   →  did the task succeed?               (outcome)
trajectory   →  was the path efficient and sound?   (process)
component    →  which retriever/tool/subagent broke? (isolation)
```

Use **deterministic checks** for exact things like tool names and output format, and bring in a model judge for anything free-form.

### LLM-as-judge, and its blind spot

**LLM-as-judge** means using one model to score another's output against a rubric - factual accuracy, citation accuracy, completeness, source quality, tool efficiency - producing a score and a pass/fail grade. It scales to hundreds of outputs and aligns reasonably well with human judgment.

But be honest about its limits. **No judge is good everywhere.** Production studies of transaction agents still find judges miss a meaningful share of failures. Strengthen them with structured rubrics, multiple passes that you aggregate, and regular calibration against human-labeled examples. Judges are necessary, not sufficient.

### Start small, start now

You do not need a giant test suite to begin. Anthropic started with about **20 queries** that reflected real usage - and that tiny set was enough to watch early success climb from **30% to 80%.** A change that large is easy to see with few examples. Start evaluating immediately, and resist over-engineering the infrastructure before you have any signal.

### Humans still catch what metrics miss

Automation misses subtle bias. A vivid example: human testers noticed early agents **consistently preferred SEO-optimized content farms over authoritative but lower-ranked sources.** No automated metric flagged it. Wire a feedback loop where failures become annotated examples and then regression tests, so the same bug can't reach users twice.

## Observability: you can't fix what you can't see

Watching individual model calls is not enough. **Agent failures live in multi-step causal chains, not single calls**, so you need to capture the whole session as a trace. Without it, you cannot tell a bad search query from poor source selection from a flat-out tool failure.

The emerging standard is **OpenTelemetry's GenAI conventions**, which give shared names to LLM calls, agent steps, tool calls, token usage, and cost. A trace looks like a tree:

```
invoke_agent                  (the whole agent run)
├── chat                      (one per model call)
│   └── execute_tool          (one per tool call)
├── chat
└── embeddings
```

One honest caveat: most of these conventions are still **experimental** as of early-to-mid 2026. Adopt them, but pin your versions and expect some churn.

On tooling, the landscape sorts roughly like this:

- **LangSmith** - the least friction if you live in LangChain or LangGraph, with node-by-node state diffs and replay against new model versions. Managed only.
- **Langfuse** - the leading open-source path, framework-agnostic, strong on cost analytics. Self-hostable.
- **Arize Phoenix** - open-source, OpenTelemetry-native, strong on RAG evaluation and judge-based eval.
- **W&B Weave** - best when your focus is experiment and prompt tracking.

> **A pricing trap worth knowing.** Billing **per trace** punishes agent complexity. A 50-step agent costs the same as one model call if you're billed per *span* - but **50× more** if billed per *trace*. Check the billing unit before you commit; it can quietly reshape your architecture.

One thoughtful touch: Anthropic monitors **decision patterns and interaction structures** while deliberately *not* reading individual conversation content. You can do root-cause analysis without reading private messages.

## The determinism problem nobody warns you about

Here is a fact that surprises most engineers: **even at temperature 0, model output is not guaranteed to be identical run to run.** Numerical-precision effects under greedy decoding still cause drift. OpenAI's own guidance is that its API is only ever "mostly deterministic," and a `seed` improves reproducibility without guaranteeing it - because system updates and load-balancing across different hardware change the math underneath.

The same agent setup can produce different outputs from temperature sampling, model version updates, tool-latency variation, and context-window effects. That makes **reproducing a specific failure extraordinarily hard.**

So you test differently:

1. **Run a replay regression suite as your first CI gate.** Replay journaled tool and model results instead of calling live services. It's fast, cheap, and actually deterministic.
2. **Aggregate over many sessions before comparing A/B arms.** A single run can wander *within* an arm, so compare distributions, not single points - with the same seed policy on both sides.
3. **Mix assertion types.** Deterministic checks for exact things, model-judge for free-form quality.

As one nice mantra puts it: "temperature defines how wild the model can be; seeds make that wildness replayable" - a partial fix, not a complete one.

## Don't restart. Resume.

Remember the compounding-error math. If a long run fails at step 38, restarting from step 1 is wasteful and, frankly, demoralizing. The fix is to persist progress and resume from the failure point.

The production playbook looks like this:

- **Don't restart on failure - resume from where the error happened.** Pair retry logic with regular checkpoints so the agent recovers gracefully when a tool fails.
- **[Manage the context window](/blog/agent-orchestration/agent-orchestration-05-context-memory) for very long runs.** Have agents summarize finished phases, push essential details to external memory, and spawn fresh agents with clean context before hitting limits.
- **Deploy without disrupting in-flight runs.** Because these systems run almost continuously, shift traffic from old to new gradually while both versions run, so agents mid-task aren't cut off.

**Durable execution** is the deeper version of this idea: state is saved after every logical step, so a crash resumes from the **last checkpoint, not the start.** A few frameworks do it differently:

- **LangGraph** saves graph state as checkpoints organized into threads, and its interrupt feature pauses, saves, and waits indefinitely - perfect for human approval. Watch out: it saves state *between* nodes, not inside them.
- **Temporal** replays a durable event log to rebuild state after a crash. The catch - and it's the key insight - is that workflow code must be deterministic. Since **LLM calls are not deterministic, you wrap them as "activity" steps** whose results are journaled on first run and never re-executed on replay. That single discipline is what makes durable execution and probabilistic models coexist.

One caveat to keep you honest: **plain checkpointing is not full durable execution.** A checkpoint gives you a save point but leaves detection, coordination, and de-duplication to you. Production-grade fault tolerance usually wants a real durable-execution runtime, not just snapshots.

## Common misconceptions

- **"A smarter model will fix our reliability problems."** Mostly no. The largest share of failures comes from design and coordination, which a model upgrade does not touch.
- **"If the final answer is right, the agent worked."** Not necessarily. A correct answer can hide skipped verification, broken reasoning, or a lucky wrong tool call. That's exactly what trajectory evals exist to catch.
- **"Temperature 0 makes runs reproducible."** No. Output can still drift run to run, so design your tests around distributions and replay, not exact equality.
- **"An LLM judge will catch our failures."** It catches many, misses a meaningful fraction, and needs calibration. Keep humans in the loop.
- **"More agents means more reliability through redundancy."** Often the opposite. Independent agents amplify errors across handoffs rather than averaging them out.

## How to use this

1. **Shorten the horizon.** Audit your longest workflows and cut steps. Every step removed is a dice roll you don't have to win.
2. **Set hard budgets.** Give every run explicit max-step and max-cost limits, plus loop detection, so a confused agent can't run forever or rack up a huge bill.
3. **Validate every tool call.** Enforce strict argument schemas, check authorization, and fail closed on anything invalid. Put a kill switch on the action layer.
4. **Evaluate outcomes and trajectories.** Don't trust a correct-looking answer alone; check whether the path was sound, especially around verification steps.
5. **Start with ~20 real queries.** Build your eval set from actual usage today, not a perfect suite next quarter.
6. **Capture full-session traces.** Adopt OpenTelemetry GenAI conventions, pin versions, and confirm whether your vendor bills per span or per trace.
7. **Test with replay first.** Make a deterministic replay suite your first CI gate, then aggregate across many sessions before trusting A/B results.
8. **Checkpoint for resume, not restart.** Persist state after each step and journal LLM calls so a failure resumes from the failure point.
9. **Keep a human in the loop early.** Require approval for high-stakes actions until your evals have earned your trust.

## Conclusion

If you remember one thing, make it this: **with agents, reliability is a horizon problem, not an intelligence problem.** The math of compounding errors means small per-step gains and early detection beat any amount of raw model power on long tasks.

There's a reason this discipline is worth the effort. [Multi-agent setups](/blog/agent-orchestration/agent-orchestration-00-index) can deliver large quality gains on broad, parallelizable work - but at roughly **[15× the token cost](/blog/agent-orchestration/agent-orchestration-07-cost-performance)** of a single chat. When you're spending that much, you had better be able to tell whether it actually worked.

Which raises the next question worth chasing: if a slow subagent can stall an entire synchronous pipeline, when is it worth the added hazards of running agents in parallel - and how do you coordinate them without trading one failure mode for three new ones?
