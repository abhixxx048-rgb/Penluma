# Orchestration Patterns & Topologies

*A field guide to the standard ways LLM agents and workflows are wired together - what each pattern is, when to reach for it, and how it fails.*

> Research/reference doc · 2026-06-16 · part of the Agent Orchestration suite

---

## 0. Framing: workflows vs. agents (read this first)

The single most useful distinction in the literature, from Anthropic's *Building Effective Agents*:

- **Workflows** - "systems where LLMs and tools are orchestrated through **predefined code paths**." Deterministic, reliable, built for well-defined tasks.
- **Agents** - "systems where LLMs **dynamically direct their own processes and tool usage**, maintaining control over how they accomplish tasks." Flexible, model-driven, built for open-ended tasks.

Every pattern below sits somewhere on a single master axis running from **fully code-orchestrated** (deterministic, top of the list) to **fully LLM-orchestrated** (autonomous, bottom). OpenAI frames the identical axis as **orchestrate via code** (deterministic control flow; you control speed/cost/quality) vs. **orchestrate via LLM** (the agent plans its own next steps; best for open-ended work but needs heavy prompt/eval investment).

**Anthropic's overarching guidance - keep this in front of you the whole time:**

- Start with the **simplest optimized prompt**; add complexity (chaining → workflows → agents) **only when simpler approaches demonstrably underperform**.
- Three principles for agents: **maintain simplicity**, **prioritize transparency** (surface the planning steps), **carefully craft the agent–computer interface (ACI)** through good tool docs and testing.
- Agents carry **higher cost and the potential for compounding errors** - a bad early step poisons everything downstream.

```
DETERMINISTIC / code-orchestrated                  AUTONOMOUS / LLM-orchestrated
│ Prompt chaining → Routing → Parallelization → Orchestrator-worker → Swarm/Blackboard │
│ cost ↑ , determinism ↓ , flexibility ↑ as you move right                              │
```

---

## 1. Prompt chaining / sequential pipeline

**What it is.** Decompose a task into **fixed sequential steps**, where each LLM call processes the previous call's output. Optional **programmatic gates** between steps validate intermediate results before continuing.

```
Input → [LLM call 1] → (gate/check) → [LLM call 2] → (gate) → [LLM call 3] → Output
            │ fail
            ▼
         exit / fix
```

**When to use.** The task cleanly decomposes into **fixed subtasks**, and you're happy to trade latency for higher per-step accuracy. E.g. generate marketing copy → translate it; write an outline → validate it → draft the full document.

> **When NOT to use.** The task isn't actually decomposable into fixed steps, or the steps vary by input. A rigid pipeline is brittle for open-ended work.

**Failure modes.**
- Latency accumulates **linearly** - every step is a full round-trip.
- Errors **propagate downstream**; a bad step-1 output poisons all later steps unless a gate catches it.
- Over-rigid for tasks whose shape varies per input.

---

## 2. Routing / dispatch

**What it is.** Classify the input, then **direct it to a specialized follow-up prompt / model / task**. Gives you separation of concerns and per-category optimization.

```
                  ┌→ [Specialist A]
Input → [Router / │
         Classify] ┼→ [Specialist B]
                  └→ [Specialist C]
```

**When to use.** Inputs fall into **distinct categories** better handled separately, **and** classification is accurate. Two flavours:
- **By category** - e.g. customer-service query types route to specialized prompts.
- **By difficulty / cost** - easy → cheap model (Haiku), hard → strong model (Sonnet/Opus). A simple, effective cost lever.

> **When NOT to use.** Category boundaries are fuzzy or overlapping, or classification can't be done reliably - misroutes will dominate.

**Failure modes.**
- **Misclassification** sends input down the wrong branch - the dominant failure.
- The router is a **bottleneck and single point of failure**.
- Fuzzy/overlapping categories degrade accuracy.

---

## 3. Parallelization (sectioning + voting)

**What it is.** Run LLMs **simultaneously** and aggregate the outputs **programmatically**. Two variants:
- **Sectioning** - split into **independent subtasks**, run in parallel, then combine.
- **Voting** - run the **same task multiple times** (varied prompts/temperatures), then aggregate (majority / threshold).

```
SECTIONING                              VOTING
        ┌→ [subtask 1] ┐                       ┌→ [run A] ┐
Input →split [subtask 2]→[Aggregate]→Out  Input→fan-out[run B]→[Vote/threshold]→Out
        └→ [subtask 3] ┘                       └→ [run C] ┘
```

**When to use.** Speed (independent chunks) or higher confidence (multiple perspectives). Sectioning examples: a guardrail content-screen running alongside the main response; multi-aspect evaluation. Voting examples: code-vulnerability review by several reviewers; content-appropriateness behind a vote threshold.

> **Distinction vs. orchestrator-worker:** parallelization uses **pre-defined, fixed** parallel paths. Orchestrator-worker decides the subtasks **dynamically at runtime**.

**Failure modes.**
- Aggregation is non-trivial - voting can **wash out a correct minority** answer.
- Cost multiplies by N (voting especially).
- Valid **only when subtasks are truly independent**; hidden dependencies cause inconsistent merges.

*Academic analog:* self-consistency decoding (aggregating multiple chain-of-thought samples) is the reasoning-level version of voting - it lowers individual error and raises confidence when paths converge.

---

## 4. Orchestrator-worker (lead agent spawns subagents)

**What it is.** A **central lead LLM dynamically breaks the task into unpredictable subtasks**, delegates each to a worker LLM, then **synthesizes** the results. The defining difference from parallelization: the subtasks are **not predetermined** - the orchestrator chooses them from the specific input.

```
                  ┌──────────────┐
        Input →   │ Orchestrator │  plans, decides subtasks dynamically
                  └──┬───┬───┬───┘
            spawns   │   │   │      (parallel, dynamic count)
                  ┌──▼┐ ┌▼─┐ ┌▼──┐
                  │ W1│ │W2│ │W3 │  workers: own context + own tools
                  └──┬┘ └┬─┘ └┬──┘
                     └───┼────┘
                  ┌──────▼───────┐
                  │ Orchestrator │ → synthesize → Output
                  └──────────────┘
```

**When to use.** Complex tasks where subtasks **can't be predetermined** - multi-file coding changes, multi-source gathering and analysis.

**Failure modes (generic).** Dynamic task count can explode; coordination overhead; the synthesis step can lose detail. See §4a for what this looks like in production.

### 4a. Anthropic's multi-agent research system - the flagship case study

This is the production instantiation of orchestrator-worker. The numbers here are worth memorizing.

**Architecture.**
- **Lead agent (orchestrator):** analyzes the query, develops a strategy, **saves its plan to memory**, spawns subagents, synthesizes their results, decides whether more research is needed, compiles the final answer.
- **Subagents (workers):** each gets its **own context window** and **own tools**; they act as "intelligent filters" - search independently, evaluate quality, identify gaps, return refined findings.
- **Models:** Claude Opus 4 as lead, Claude Sonnet 4 as subagents.

**Two levels of parallelism.**
1. Agent-level: lead "spins up 3–5 subagents in parallel rather than serially."
2. Tool-level: each subagent fires **3+ parallel tool calls**.
→ cut research time by **up to 90%** on complex queries (minutes vs. hours).

**Performance numbers.**
- Multi-agent (Opus lead + Sonnet subagents) **beat single-agent Opus 4 by 90.2%** on the internal research eval.
- On BrowseComp, **3 factors explain 95% of performance variance; token usage alone explains 80%.**
- **Token economics:** agents use **~4×** the tokens of chat; **multi-agent systems use ~15×** the tokens of chat.
- "Upgrading to Claude Sonnet 4 is a larger performance gain than doubling the token budget on Sonnet 3.7."

**Coordination model.** Currently **synchronous** - the lead waits for each batch of subagents to finish before continuing. Simpler to coordinate, but it creates bottlenecks: "the lead agent can't steer subagents, subagents can't coordinate, and the entire system can be blocked while waiting for a single subagent."

**Production failure modes observed.**
- Lead **spawned 50 subagents for a simple query**; endless searching for nonexistent sources.
- **Duplicate work** - subagents exploring identical topics instead of dividing labor.
- Excessive status updates distracting agents.
- Agents are **stateful and error-prone** - "minor system failures can be catastrophic for agents"; errors compound across tool calls and phases.
- **Non-deterministic** runs make debugging hard → **full production tracing** required.
- **Tool-selection bias** - early agents "consistently chose SEO-optimized content farms over authoritative but less highly-ranked sources like academic PDFs or personal blogs."

**Seven prompt-engineering principles for orchestration.**
1. **Simulate agent behavior** with real prompts/tools to find failure modes step-by-step.
2. **Detailed delegation** - give each subagent an objective, output format, tool guidance, and boundaries. Vague briefs ("research the semiconductor shortage") cause misinterpretation and duplicate searches.
3. **Scale effort to complexity** - embed explicit rules: simple fact-find = 1 agent / 3–10 calls; comparisons = 2–4 subagents / 10–15 calls each; complex = 10+ subagents with divided responsibilities.
4. **Tool-design primacy** - distinct tool purposes; "bad tool descriptions can send agents down completely wrong paths."
5. **Agentic self-improvement** - Claude can diagnose failing prompts; a tool-testing agent that rewrote tool descriptions produced a **40% decrease in task completion time**.
6. **Breadth-first then narrow** - start broad, evaluate, then focus.
7. **Extended thinking** as a controllable scratchpad; interleaved thinking in subagents to refine queries.

> **When multi-agent is the RIGHT fit:** breadth-first queries pursuing multiple independent directions at once; high-value tasks needing heavy parallelization; information that exceeds a single context window; interfacing with many complex tools.
>
> **When it is the WRONG fit:** tasks needing **shared context** across all agents; many **inter-agent dependencies**; **most coding tasks** (fewer parallelizable parts); real-time tight coordination; **low-value tasks** where 15× token cost isn't justified. "Multi-agent systems require tasks where the value of the task is high enough to pay for the increased performance."

---

## 5. Evaluator-optimizer (generator + critic loop)

**What it is.** One LLM **generates**, a **second LLM evaluates and gives feedback**, in an **iterative loop**, until the evaluator is satisfied.

```
Input → [Generator] → draft → [Evaluator / Critic]
            ▲                        │
            └──── feedback (if not good) ─┘
                                     │ accepted
                                     ▼
                                  Output
```

**When to use.** Clear **evaluation criteria exist** and iterative refinement demonstrably improves output. Two success signals: (a) responses measurably improve with human feedback; (b) the LLM can produce meaningful critiques. Examples: literary translation needing nuanced critique; multi-round complex search/analysis.

> **Distinction vs. §11 reflection:** here a **separate** critic LLM judges the generator. In reflection, the **same agent** critiques itself.

**Failure modes.**
- Loops indefinitely without a stopping cap.
- Evaluator is only as good as its criteria - vague criteria → useless feedback.
- Two LLM calls per iteration → cost and latency multiply.
- Critic and generator can "collude" on a mediocre local optimum.

---

## 6. Hierarchical / supervisor trees

**What it is.** A **supervisor agent controls all communication and task delegation**, deciding which agent to invoke from context. **Hierarchical** = supervisors of supervisors: agents grouped into **teams**, each with its own supervisor, and a **top-level supervisor** routing between teams. Generalizes orchestrator-worker to multiple levels.

```
                ┌─────────────────┐
                │  Top Supervisor │
                └───┬─────────┬───┘
            ┌───────▼──┐   ┌──▼───────┐
            │ Team A   │   │ Team B   │
            │ Supervis.│   │ Supervis.│
            └─┬──┬──┬──┘   └─┬──┬─────┘
              ▼  ▼  ▼        ▼  ▼
             a1 a2 a3       b1 b2     worker agents
```

**When to use.** Many specialized agents that group naturally into domains, and you need a clear, **auditable** control structure. LangGraph's framing: a supervisor tree is "easier to reason about - one routing node, clear control flow, every decision visible in traces." Choose it when control and observability matter more than raw speed.

**Failure modes.**
- Supervisor is a **bottleneck and single point of failure**; each hop adds an LLM call (latency + cost).
- Deep hierarchies **amplify latency** (every level = a round-trip).
- The top supervisor can **mis-route between teams**, compounding routing error across levels.

---

## 7. Blackboard / shared-state

**What it is.** Agents coordinate **indirectly through a shared memory medium - the "blackboard"** - rather than messaging each other directly. A control agent **posts a request** describing the task/info needed; **any subordinate agent watching the board independently decides whether it can contribute.** The board holds public + private spaces with all messages, intermediate inferences, and interaction history.

```
   [Agent A]   [Agent B]   [Agent C]   [Agent D]
     │  ▲        │  ▲        │  ▲        │  ▲
 write│  │read   │  │        │  │        │  │
     ▼  │        ▼  │        ▼  │        ▼  │
   ┌──────────────────────────────────────────┐
   │            BLACKBOARD (shared state)       │
   │  task posts · partial solutions · history  │
   └──────────────────────────────────────────┘
                    ▲
        [Control / scheduler decides who acts next]
```

**When to use.** Open-ended problems with **dynamic agent selection** (you don't know in advance which specialist is relevant); information-discovery / data-science tasks; **token-sensitive settings** - the board keeps "compact, high-salience messages," reducing inference cost and propagating info efficiently. Supports robust consensus mechanisms.

**Failure modes.**
- The **control/scheduling policy** (who writes next) is the hard part - poor control → thrashing or stalls.
- Shared state can grow unboundedly (history bloat) → context pressure.
- **Concurrency / write-contention** and consistency issues on the shared store.
- Harder to trace causality than a supervisor tree (coordination is indirect).

---

## 8. Network / handoff (peer-to-peer swarm)

**What it is.** A **decentralized** topology - agents **hand off control directly to one another** based on specialization, with **no central orchestrator**. "Network" = many-to-many (any agent can call any other). A **swarm** remembers which agent was last active, so the conversation **resumes with that agent** next turn.

- **LangGraph mechanism:** handoff via a `Command` object - `Command(goto=<agent>, graph=Command.PARENT)` navigates to a different node in the parent graph; state travels along.
- **OpenAI Agents SDK mechanism:** primitives are **Agents** (instructions + tools) and **handoffs** (a function returning another Agent). A triage agent routes to a specialist who **becomes the active agent** and replies directly. (The experimental *Swarm* was the predecessor; the production successor is the **OpenAI Agents SDK**, released March 2025, adding guardrails, tracing, sessions.)

```
   [Agent A] ⇄ [Agent B]
       ⇅    ✕    ⇅          any agent can hand off to any other;
   [Agent C] ⇄ [Agent D]     no central coordinator
```

**When to use.** When the specialist should **answer the user directly** without a manager narrating results, and you want focused per-agent prompts. Swarms are "faster - no intermediary, direct agent-to-agent handoffs, fewer LLM calls" than supervisor trees.

> **Manager (agents-as-tools) vs. handoffs - OpenAI's explicit contrast:**
> - **Manager / agents-as-tools:** a central manager calls specialists via `Agent.as_tool()`, **keeps control**, owns the final answer. (≈ centralized orchestrator-worker.)
> - **Handoffs:** decentralized; control **transfers** to the specialist for that turn. (≈ swarm/network.)
> - **Hybrid:** a triage agent can hand off to a specialist that simultaneously calls other agents as tools.

**Failure modes.**
- **No global view** - no agent sees the whole picture; hard to enforce overall goals.
- **Handoff loops / ping-ponging** between agents.
- Harder to trace and debug than centralized control.
- Routing errors propagate with no supervisor to catch them.

---

## 9. Debate & ensemble voting

**What it is.** Multiple agents **independently propose answers, then critique each other's reasoning across rounds to reach consensus** ("society of minds"). Ensemble voting is the lighter cousin: run multiple models/paths and **aggregate by majority/vote**. Debate induces an ensemble-like effect - diverse reasoning paths explored in parallel and **cross-verified**.

```
Round 1:  [A answer]   [B answer]   [C answer]
                │ exchange + critique │
Round 2:  [A revises]  [B revises]  [C revises]
                │   ... repeat ...    │
            → converge → [Aggregate / Judge] → Output
```

**When to use.** Reasoning-heavy tasks (math, factual QA) where cross-verification reduces hallucination; LLM-as-judge ensembles where robustness matters.

**Failure modes (2024–2026 research, treat as caveats).**
- **"Problem drift"** - debates lose focus and wander off the original question over rounds (arXiv 2502.19559).
- **Cost/efficiency:** rounds × agents = heavy token spend. *EMS: Majority-then-Stopping* (arXiv 2604.02863) and adaptive stability detection (arXiv 2510.12697) exist specifically to cut voting cost and decide when to halt.
- **Not always worth it:** "Single-Agent LLMs Outperform Multi-Agent Systems on Multi-Hop Reasoning Under Equal Thinking-Token Budgets" (arXiv 2604.02460) - at a fixed token budget, a single agent can beat debate. **Key caveat: gains may come from extra compute, not the topology itself.**
- Agents can converge on a **confidently-wrong consensus**.

---

## 10. Map-reduce over large corpora

**What it is.** Distributed map-reduce adapted for content that exceeds the context window. **Split** the corpus into token-bounded chunks → **Map:** apply the LLM independently to each chunk (summarize/extract) → **Reduce:** combine the intermediate outputs, recursively feeding them back until a single consolidated result remains.

```
Doc ──split──┬─ chunk1 → [LLM map] → s1 ┐
             ├─ chunk2 → [LLM map] → s2 ┼→ [LLM reduce] → (recurse if needed) → Final
             └─ chunk3 → [LLM map] → s3 ┘
```

**Contrast set (long-content strategies).**
- **Stuffing** - everything in one prompt; only if it fits.
- **Map-reduce** - parallel, scalable.
- **Refine** - sequential; carry a running summary chunk by chunk. Better continuity, less parallelism.

**When to use.** Corpus far exceeds the context window; chunks are largely independent; you want **parallel** throughput. Summarization, large-scale extraction/classification over many docs.

**Failure modes.**
- **Loss of global/cross-chunk context** - the map step can't see other chunks (cross-document entities/themes lost).
- Reduce step can itself overflow if there are too many intermediate summaries → needs **recursive/hierarchical reduce**.
- **Information dilution** compounding across reduce levels.
- Inconsistent map outputs are hard to merge cleanly.

---

## 11. Loop-until-done / reflection (ReAct, Self-Refine, Reflexion)

**What it is.** A single agent **iterates** - act, observe, **self-critique, refine** - until a quality threshold or stop condition is met. Family members:
- **ReAct** - interleaves reasoning (chain-of-thought) with acting (tool calls); improves interpretability and planning.
- **Reflection / Self-Refine** - the model is both writer and editor: critiques its own output and revises across loops, **no extra training**.
- **Reflexion** - extends ReAct: the agent decides whether to stop, **reflects on its entire trajectory**, stores **verbal reflections in persistent memory**, and **restarts** with that critique in-context. Learns across **multiple trials**.

```
        ┌───────────────────────────────────┐
Input → │ [Act / Generate] → [Observe] →     │
        │ [Self-critique] → good? ──no──┐    │
        └───────────────────────────────┘    │
                       │ yes      ▲ reflection (in-context / memory)
                       ▼          └───────────┘
                    Output
```

> **Distinction vs. §5 evaluator-optimizer:** here **the same agent** critiques itself, often with persistent cross-trial memory; evaluator-optimizer uses a **separate** critic.

**When to use.** Tasks with **verifiable feedback** (tests pass/fail, tool errors, rubric); the agent benefits from learning from its own mistakes within or across attempts; iterative quality improvement on a single deliverable.

**Failure modes.**
- **Infinite / non-terminating loops** without a hard iteration cap.
- Self-critique is unreliable - the model may not recognize its own errors (no external ground truth).
- Reflection memory accumulates **noise**; cost grows per trial.
- Can **entrench an initial wrong approach** if reflections reinforce a bad frame.

---

## 12. Comparison table

| Pattern | Parallelism | Determinism | Relative cost | Best for |
|---|---|---|---|---|
| **Prompt chaining / pipeline** | None (sequential) | High (fixed path) | Low | Fixed, decomposable tasks; accuracy > latency |
| **Routing / dispatch** | None (one branch) | High (after classify) | Low | Distinct input categories; cost-tiering models |
| **Parallelization - sectioning** | High (fixed branches) | High (predefined) | Medium (N×) | Independent subtasks; speed; guardrails |
| **Parallelization - voting** | High (same task ×N) | Medium (aggregation) | Medium–High (N×) | Confidence via multiple perspectives |
| **Orchestrator-worker** | High (dynamic count) | Low (LLM decides) | High (~15× chat) | Open-ended subtasks; breadth-first research; multi-file coding |
| **Hierarchical / supervisor** | Medium–High (per team) | Medium (visible flow) | High (hop per level) | Many grouped specialists; auditable control |
| **Blackboard / shared-state** | High (opportunistic) | Low–Medium (scheduler) | Low–Medium (token-efficient) | Dynamic agent selection; info discovery; token-sensitive |
| **Network / handoff (swarm)** | Medium (one active) | Low (decentralized) | Low–Medium (fewer calls) | Specialist answers directly; conversational routing |
| **Debate / ensemble voting** | High (agents parallel) | Low (consensus) | High (rounds × agents) | Reasoning/factual tasks; hallucination reduction* |
| **Map-reduce over corpora** | Very high (map) | High (structured) | Medium–High (per-chunk) | Content exceeding context window; summarization at scale |
| **Loop-until-done / reflection** | None (single loop) | Low (iterates) | Medium–High (per trial) | Verifiable-feedback tasks; iterative self-improvement |

\* *may not beat a single agent at equal token budget - see §9.*

**Reading the table.** Determinism falls and cost rises as you move from code-orchestrated (top) to LLM-orchestrated (bottom). Anthropic's rule of thumb threads through every row: **use the simplest pattern that works; add agency only when simpler approaches demonstrably fail; pay for high parallelism/cost only on high-value tasks.**

---

## 13. Cross-cutting themes

- **Determinism ↔ flexibility is the master axis** (Anthropic workflows-vs-agents; OpenAI code-vs-LLM orchestration). Choose your spot deliberately.
- **Cost scales with autonomy and parallelism:** agents ≈ 4× chat tokens; multi-agent ≈ 15× chat tokens. Multi-agent is "economically viable" only on high-value tasks.
- **Token budget may explain the gains, not the topology:** 80% of performance variance traces to token usage; a single agent can match multi-agent at equal budget on some reasoning tasks. Don't assume more agents = better.
- **Observability is first-class:** non-determinism makes multi-agent debugging hard → full production tracing required. Supervisor trees are often chosen precisely because "every decision is visible in traces."
- **Coordination failure modes recur everywhere:** duplicate work, over-spawning, drift, loops, lost shared context. Standard mitigations: detailed delegation, complexity-scaled effort rules, distinct tool descriptions, explicit stopping criteria.
- **Centralized vs. decentralized is the topology fork:** orchestrator / supervisor / manager (control + observability, but a bottleneck) vs. swarm / network / blackboard (speed + resilience, but harder to trace).

---

## Sources

- Building Effective AI Agents - Anthropic - https://www.anthropic.com/engineering/building-effective-agents
- How we built our multi-agent research system - Anthropic - https://www.anthropic.com/engineering/built-multi-agent-research-system
- Multi-agent orchestration (manager vs. handoffs; LLM vs. code orchestration) - OpenAI Agents SDK - https://openai.github.io/openai-agents-python/multi_agent/
- Agents (primitives: instructions, tools, handoffs) - OpenAI Agents SDK - https://openai.github.io/openai-agents-python/agents/
- OpenAI Swarm (educational multi-agent framework) - https://github.com/openai/swarm
- LangGraph Multi-Agent Supervisor (reference) - https://reference.langchain.com/python/langgraph-supervisor
- langgraph-supervisor-py (supervisor pattern) - https://github.com/langchain-ai/langgraph-supervisor-py
- langgraph-swarm-py (swarm/handoff pattern, Command/goto) - https://github.com/langchain-ai/langgraph-swarm-py
- Multi-Agent Orchestration in LangGraph: Supervisor vs Swarm - DEV - https://dev.to/focused_dot_io/multi-agent-orchestration-in-langgraph-supervisor-vs-swarm-tradeoffs-and-architecture-1b7e
- Swarm vs. Supervisor: Multi-Agent Architecture Guide - Augment Code - https://www.augmentcode.com/guides/swarm-vs-supervisor
- LLM-based Multi-Agent Blackboard System for Information Discovery in Data Science - arXiv 2510.01285 - https://arxiv.org/html/2510.01285v1
- Collaborative Problem-Solving in Multi-Agent Systems with the Blackboard Architecture - https://notes.muthu.co/2025/10/collaborative-problem-solving-in-multi-agent-systems-with-the-blackboard-architecture/
- Scaling Document Summarization with LLMs: Stuffing, Map-Reduce, and Refine - Medium - https://medium.com/@sonimegha1602/scaling-document-summarization-with-llms-stuffing-map-reduce-and-refine-a8a468d479c3
- Summarizing Too Big for Context with MapReduce and LLMs - Google Cloud Community - https://medium.com/google-cloud/summarizing-too-big-for-context-with-mapreduce-and-llms-6d2acc7a2ed0
- Reflexion - Prompt Engineering Guide - https://www.promptingguide.ai/techniques/reflexion
- Reflection Agent Pattern - Agent Patterns docs - https://agent-patterns.readthedocs.io/en/stable/patterns/reflection.html
- Reflexion Agent Pattern - Agent Patterns docs - https://agent-patterns.readthedocs.io/en/stable/patterns/reflexion.html
- How Do Agents Learn from Their Own Mistakes? The Role of Reflection in AI - Hugging Face - https://huggingface.co/blog/Kseniase/reflection
- Stay Focused: Problem Drift in Multi-Agent Debate - arXiv 2502.19559 - https://arxiv.org/pdf/2502.19559
- EMS: Multi-Agent Voting via Efficient Majority-then-Stopping - arXiv 2604.02863 - https://arxiv.org/pdf/2604.02863
- Multi-Agent Debate for LLM Judges with Adaptive Stability Detection - arXiv 2510.12697 - https://arxiv.org/html/2510.12697v1
- Single-Agent LLMs Outperform Multi-Agent Systems on Multi-Hop Reasoning Under Equal Thinking Token Budgets - arXiv 2604.02460 - https://arxiv.org/html/2604.02460v1
- Cloudflare Agents - Anthropic patterns guide - https://github.com/cloudflare/agents/blob/main/guides/anthropic-patterns/README.md
