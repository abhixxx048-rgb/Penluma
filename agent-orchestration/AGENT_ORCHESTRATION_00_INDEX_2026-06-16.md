# Agent Orchestration & Multi-Agent Systems - Suite Index

_Entry point and reading map for an 8-part deep dive on building, running, and paying for multi-agent LLM systems._

> Research/reference doc · 2026-06-16 · part of the Agent Orchestration suite

---

## Executive summary

**Agent orchestration** is the discipline of coordinating one or more LLM-driven agents - each running a `perceive → plan → act → observe` loop over tools - to accomplish a task that a single model call cannot reliably finish on its own. "Multi-agent" specifically means splitting that work across several agents (an orchestrator plus workers, a supervisor tree, a debate, a handoff swarm) rather than one agent grinding through every step.

The core insight that runs through every part of this suite:

> **Add agentic complexity only when it pays for itself.** Climb the ladder one rung at a time - a single well-prompted LLM call beats a workflow, a workflow beats an agent, and a single agent beats a multi-agent system - *until the task's structure forces you up*. Most production "AI features" should be a prompt or a fixed workflow, not an autonomous agent, and almost never a swarm.

The single biggest tradeoff you are buying when you go multi-agent:

> **Roughly a 15× token cost versus a single chat turn** (Anthropic measured ~4× for a single agent and ~15× for their multi-agent research system). You only recoup that when the work is **high-value and parallelizable** - breadth-first research, fan-out over many independent sources, sweeps with disjoint ownership. For interdependent reasoning under a fixed budget (most coding, most tightly-coupled planning), a single agent wins on both cost *and* quality, because splitting it just multiplies coordination failures.

Everything else in the suite is the detail behind those two sentences: which pattern fits which task (02), how agents talk to each other and to tools (03), what framework to reach for (04), how to keep a finite context window useful across a long run (05), how to make a non-deterministic long-horizon system reliable and observable (06), how to control the cost (07), and how all of it lands on Print-Flow-360's actual code (08).

---

## Read in this order

| # | File | What it covers |
|---|------|----------------|
| 01 | [Foundations: Agents, Agentic Loops & When to go Multi-Agent](./AGENT_ORCHESTRATION_01_FOUNDATIONS_2026-06-16.md) | Vocabulary + decision framework: the three-rung ladder (call → workflow → agent), the augmented LLM, the ReAct loop, the four "agentic" properties, Anthropic's five workflow patterns, and the single-vs-multi gate with measured costs. **Start here.** |
| 02 | [Orchestration Patterns & Topologies](./AGENT_ORCHESTRATION_02_PATTERNS_2026-06-16.md) | Eleven patterns along the determinism→autonomy axis - chaining, routing, parallelization, orchestrator-worker, evaluator-optimizer, supervisor trees, blackboard, handoff swarms, debate, map-reduce, reflection loops - each with an ASCII topology, when-to-use/when-not, and failure modes. |
| 03 | [Communication, Coordination & Interop Protocols](./AGENT_ORCHESTRATION_03_COMMUNICATION_PROTOCOLS_2026-06-16.md) | How agents coordinate: message-passing vs shared-memory blackboards vs LangGraph state, handoff semantics, task decomposition + result aggregation, and the open standards **MCP** (agent↔tools) and **A2A** (agent↔agent), plus structured-output messaging pitfalls. |
| 04 | [Frameworks & SDKs Landscape](./AGENT_ORCHESTRATION_04_FRAMEWORKS_2026-06-16.md) | Nine frameworks (LangGraph, CrewAI, AutoGen/AG2, OpenAI Agents SDK, Claude Agent SDK, Google ADK, Semantic Kernel, LlamaIndex) on an explicit→emergent control spectrum, with "use it when / avoid when" and a selection algorithm. Opens with "do you even need a framework?" |
| 05 | [Context Engineering & Memory for Agents](./AGENT_ORCHESTRATION_05_CONTEXT_MEMORY_2026-06-16.md) | Managing the finite attention budget: reduce / offload / retrieve / isolate, context rot & lost-in-the-middle, memory tiers (short/long, semantic/episodic/procedural), RAG vs agentic retrieval, sub-agent isolation, and prompt-caching mechanics. |
| 06 | [Reliability, Evaluation & Observability](./AGENT_ORCHESTRATION_06_RELIABILITY_EVAL_OBS_2026-06-16.md) | Why compounding per-step error breaks long runs, the MAST 14-failure-mode taxonomy, layered guardrails, outcome vs trajectory evals + LLM-as-judge, OpenTelemetry GenAI tracing, non-determinism testing, and resumable/durable execution. |
| 07 | [Cost, Performance & Economics](./AGENT_ORCHESTRATION_07_COST_PERFORMANCE_2026-06-16.md) | The ~15× multiplier in detail, token spend as ~80% of performance variance, when multi-agent pays off, and the control levers: model tiering, prompt caching (90% input discount), Batch API (50% off), rate-limit management, and runtime budget guardrails. |
| 08 | [Applied: Agent Orchestration in Print-Flow-360](./AGENT_ORCHESTRATION_08_APPLIED_PRINTFLOW360_2026-06-16.md) | How the patterns map onto PF360's real AI code (`AiTaskRunner` + 7 consumers), the four hard constraints (no tool-use, no caching, no live-catalog injection, `QUEUE=sync`), and four realistic-but-unbuilt orchestration opportunities. **Research-only.** |

---

## Cheat sheet (one page)

### Decision flow - single call → workflow → single agent → multi-agent

```
Start: what is the task?
  │
  ├─ Can one well-crafted prompt do it reliably?           → PLAIN LLM CALL.  Stop.
  │     (classify, extract, rewrite, summarize, draft)
  │
  ├─ Are the steps known and fixed in advance?             → WORKFLOW.  Stop.
  │     (chain / route / parallelize / evaluator-optimizer
  │      on a predetermined graph - deterministic control flow)
  │
  ├─ Does the path depend on intermediate results,         → SINGLE AGENT (one ReAct loop, tools).
  │  needing dynamic tool use & self-correction?              Stop here unless a gate below trips.
  │
  └─ Do ALL of these hold?                                 → MULTI-AGENT (orchestrator-worker etc.)
        • the work is HIGH-VALUE (worth ~15× tokens)
        • it is genuinely PARALLELIZABLE (independent subtasks)
        • a single context window can't hold it (overload)
        • subtasks have clean, disjoint ownership
      If any is NO → stay with a single agent.
```

Two gates justify the jump to multi-agent, and you need **both**:
- **Economic gate** - the output is valuable enough to absorb a ~15× token bill.
- **Overload / parallelism gate** - one agent's context or serial latency is the bottleneck, and subtasks are independent enough to run side by side without constant coordination.

### Pattern picker (condensed - full version in part 02)

| Pattern | Parallel? | Control | Relative cost | Best for |
|---------|-----------|---------|---------------|----------|
| **Prompt chaining** | No | Deterministic | Low | Fixed multi-step transforms (outline→draft→polish) |
| **Routing** | No | Deterministic | Low | Classify input, dispatch to a specialized handler |
| **Parallelization** (sectioning / voting) | Yes | Deterministic | Medium | Independent subtasks, or N votes for reliability |
| **Orchestrator-worker** | Yes | Dynamic | High (~15×) | Breadth-first research, dynamic fan-out over sources |
| **Evaluator-optimizer** | No | Loop | Medium | Output has clear quality criteria; iterate to a bar |
| **Supervisor tree** | Yes | Hierarchical | High | Large tasks needing layered delegation |
| **Blackboard / shared state** | Yes | Emergent | High | Many agents collaborating on one evolving artifact |
| **Handoff / swarm** | No | Decentralized | Medium-High | Specialist takes full control of a phase, then hands off |
| **Debate / ensemble** | Yes | Voting | High | High-stakes judgment where diversity beats one opinion |
| **Map-reduce** | Yes | Deterministic | Scales w/ corpus | Summarize / extract over a large document set |
| **Reflection loop** (ReAct / Reflexion) | No | Loop | Medium | Single agent self-correcting until done |

Rule of thumb: **prefer the lowest row that fits, and prefer deterministic control over emergent.** Reach for the high-cost rows only when both gates above are satisfied.

### Top 8 do's

1. **Start at the simplest rung** that could plausibly work; add complexity only when you've watched the simpler version fail for a structural reason.
2. **Make control flow as deterministic as the task allows** - a workflow you can read beats an agent you have to debug.
3. **Tier your models** - a strong orchestrator with cheap workers captures most of the quality at a fraction of the cost (part 07).
4. **Engineer the context, not just the prompt** - reduce / offload / retrieve / isolate to keep the window's signal high (part 05).
5. **Give subagents disjoint ownership** and clear contracts so their outputs merge cleanly without conflict.
6. **Instrument from day one** - OpenTelemetry GenAI traces, trajectory + outcome evals, small high-signal eval sets (part 06).
7. **Design for resume-not-restart** - checkpoint state so a long run can recover from a failed step (part 06).
8. **Exploit caching and batching** - a stable cached prefix (90% input discount) and the Batch API (50% off) change the economics materially (part 07).

### Top 8 don'ts

1. **Don't reach for multi-agent by default** - it's the most expensive and failure-prone option, not the impressive one.
2. **Don't split interdependent reasoning** across agents - coordination overhead and context loss will cost you quality (coding is the classic trap).
3. **Don't let context rot** - never assume more tokens = better; mid-context info degrades ("lost in the middle").
4. **Don't share one mutable context across agents** carelessly - context pollution and error blast radius compound silently.
5. **Don't ship without guardrails** - input/action/output/permission checks and human-in-the-loop on irreversible actions.
6. **Don't treat a multi-agent system as deterministic** in tests - design for non-determinism and assert on outcomes/invariants.
7. **Don't pick a heavyweight framework before you need one** - Anthropic's own advice: start without one (parts 01, 04).
8. **Don't ignore the bill** - token spend is ~80% of performance variance; a runaway loop is a runaway invoice (part 07).

---

## How this maps to Print-Flow-360

If you're here to ship something in this codebase rather than to study the field, **read [part 08](./AGENT_ORCHESTRATION_08_APPLIED_PRINTFLOW360_2026-06-16.md)** after part 01. It grounds every abstract pattern in PF360's actual AI surface: the single stateless `AiTaskRunner` wrapping per-tenant Claude Sonnet / OpenAI providers behind seven feature consumers, and the four hard constraints that shape what's even possible today - **no native tool-use, no prompt caching, no live-catalog injection, and `QUEUE=sync` forcing inline runs.** It then sketches four realistic-but-unbuilt orchestration opportunities (orchestrator-worker product builder, content/SEO chaining, support triage, evaluator-optimizer design loop), each tied to a concrete code seam and gated on the same shared enablers (Redis async, tool-use, prompt caching).

Part 08 is **explicitly research-only** - nothing in this suite has been built into PF360. It also flags two correctness traps: image generation is stubbed, and the AI matcher docs describe *intent*, not shipped code.

---

## Sources

This index summarizes the eight parts; each part carries its own full source list. The load-bearing primary sources across the suite:

- Building effective agents - Anthropic - https://www.anthropic.com/research/building-effective-agents
- How we built our multi-agent research system - Anthropic - https://www.anthropic.com/engineering/built-multi-agent-research-system
- Effective context engineering for AI agents - Anthropic - https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Why Do Multi-Agent LLM Systems Fail? (MAST taxonomy) - Cemri et al. - https://arxiv.org/abs/2503.13657
- ReAct: Synergizing Reasoning and Acting in Language Models - Yao et al. - https://arxiv.org/abs/2210.03629
- Lost in the Middle: How Language Models Use Long Contexts - Liu et al. - https://arxiv.org/abs/2307.03172
- Context Rot - Chroma Research - https://research.trychroma.com/context-rot
- Model Context Protocol (MCP) - https://modelcontextprotocol.io/
- Agent2Agent (A2A) Protocol - https://a2aproject.github.io/A2A/
- OpenTelemetry GenAI semantic conventions - https://opentelemetry.io/docs/specs/semconv/gen-ai/
- Prompt caching - Anthropic docs - https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching
- LangGraph documentation - https://langchain-ai.github.io/langgraph/
- OpenAI Agents SDK - https://openai.github.io/openai-agents-python/
