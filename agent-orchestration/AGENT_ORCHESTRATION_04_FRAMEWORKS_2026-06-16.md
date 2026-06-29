# Frameworks & SDKs Landscape

*A field guide to the agent-orchestration frameworks and interop protocols of 2025–2026 - what each one actually does, and when (and when not) to reach for it.*

> Research/reference doc · 2026-06-16 · part of the Agent Orchestration suite

---

## 0. Read this first: do you even need a framework?

Anthropic's own guidance ([*Building Effective AI Agents*](https://www.anthropic.com/research/building-effective-agents)) is blunt: **start with direct API calls.** Many useful patterns are "a few lines of code." Find the simplest viable solution and add complexity only when it *demonstrably* improves outcomes. For a large share of apps, a single optimized LLM call with retrieval and in-context examples is enough.

Why frameworks carry a tax:

- They **add abstraction layers that obscure the underlying prompts and responses**, making debugging harder.
- They make it tempting to add complexity when a simpler setup would do.
- "Incorrect assumptions about what's under the hood are a common source of customer error."

The practical rule: **if you use a framework, understand the code underneath it**, and don't hesitate to drop back to basic components in production.

### Workflows vs. Agents (the distinction everything hangs on)

| | What it is | Use when |
|---|---|---|
| **Workflow** | LLMs + tools orchestrated through **predefined code paths** (you control the flow). | The task is well-defined and predictable. |
| **Agent** | An LLM **dynamically directs its own process and tool usage**. | The problem is open-ended and you can't predict the path. |

The base building block beneath both is the **Augmented LLM** - a model enhanced with **retrieval, tools, and memory**, generating its own queries and managing what to retain.

**Five workflow patterns to build before reaching for an agent:**

1. **Prompt chaining** - sequential calls, each on the prior output (trades latency for accuracy).
2. **Routing** - classify input, dispatch to a specialized handler.
3. **Parallelization** - *sectioning* (split into parallel subtasks) or *voting* (multiple attempts).
4. **Orchestrator–workers** - a central LLM decomposes a task and dispatches to workers.
5. **Evaluator–optimizer** - one LLM generates, another critiques and feeds back to refine.

> **Bottom line:** Frameworks are *not* the starting point. Reach for one only when a real need appears - durable state, multi-agent routing, observability at scale, or org-wide standardization - and pick the lightest one that meets it.

---

## 1. The landscape, on two axes

The frameworks differ most along a **control spectrum** - how much the flow is drawn by you vs. decided by the LLM at runtime:

```
 EXPLICIT / DETERMINISTIC  <───────────────────────────────────>  EMERGENT / AUTONOMOUS
 (you draw the graph)                                              (LLMs decide control flow)

 LangGraph      CrewAI Flows     Semantic Kernel    OpenAI         CrewAI Crews   AutoGen / AG2
 (StateGraph)   (event-driven)   (plugins+fn-call)  Agents SDK     (role crews)   (conversation)
                                  Google ADK         (handoffs)     Claude Agent SDK
                                  LlamaIndex                        (coding loop)
                                  AgentWorkflow
```

A second axis worth tracking: **single-vendor vs. provider-agnostic**, and **proprietary control loop vs. open protocol**. Two standards cut across *all* of them:

- **MCP** (Model Context Protocol) - connects an agent to **tools and data**.
- **A2A** (Agent2Agent) - connects an agent to **other agents** across vendors/frameworks.

These are complementary, not competitors (see §11).

> **Naming hazard (2025–2026):** This space renamed itself constantly. Swarm → OpenAI Agents SDK; `claude-code-sdk` → Claude Agent SDK; AutoGen 0.2 → AG2 (community fork) vs AutoGen 0.4 (Microsoft rewrite), both now consolidating with Semantic Kernel into the **Microsoft Agent Framework** (announced Oct 2025). Dates are stated explicitly throughout.

---

## 2. LangGraph - graph / state-machine

**Model.** Agents are a **directed graph (`StateGraph`)**. Nodes = functions / tool calls / model calls / decision points; edges = control flow. A centralized, typed **shared state object** is threaded through every node, and **conditional edges** carry predicates over that state to choose the next node.

**Primitives.** Nodes, edges, conditional/branching edges, the State schema, **checkpointers** (durable persistence for long-running, resumable runs), loops/cycles, retries, human-in-the-loop interrupts, streaming, parallel execution.

```text
        ┌──────────┐   condition?   ┌──────────┐
 START ─▶  node A   ├──────true────▶│  node B   │──▶ END
        └────┬─────┘                └──────────┘
             │ false      (shared, typed State threaded through all nodes;
             ▼             checkpointer persists it for resume/HITL)
        ┌──────────┐
        │  node C   │──loop back──▶ node A
        └──────────┘
```

| Use it when | Avoid / reconsider when |
|---|---|
| You need explicit, auditable control over complex flows with **loops, retries, branching, long-running/durable state**, and multi-actor orchestration. | You want a quick prototype or simple linear flow; the team can't absorb graph/state-schema modeling. |

**Strengths:** most explicit and controllable; first-class cycles (not just DAGs), durable memory, multi-agent topologies; production-grade observability when paired with LangSmith. **Weaknesses:** steepest conceptual ramp - you architect nodes, edges, and state schemas deliberately; heavier than a few API calls for simple tasks.

---

## 3. CrewAI - role-based crews (+ Flows)

**Model.** Two complementary modes:

- **Crews** - teams of autonomous agents, each defined by **role, goal, and backstory** (a metaphor that maps to how humans think about teams). Agents collaborate and decide autonomously, in a sequential or hierarchical process.
- **Flows** - **event-driven, production-oriented** workflows that chain crews with conditional logic, state, and event triggers for precise, deterministic control. Flows can embed crews as steps.

**Primitives.** Agent (role/goal/backstory), Task, Crew, Process (sequential/hierarchical), Tools; Flows add events, state, conditional routing.

| Use it when | Avoid / reconsider when |
|---|---|
| **Crews:** work decomposes into human-team-like roles that collaborate (research → write → review). | You need strict, predictable control paths - use **Flows** or LangGraph instead. |
| **Flows:** you need event-driven, deterministic orchestration that can also embed autonomous crews. | A single autonomous crew already suffices (over-engineering risk). |

**Strengths:** the most intuitive mental model → fast to prototype collaborative systems; Crews (autonomy) + Flows (determinism) give both adaptive problem-solving and auditable execution. **Weaknesses:** autonomous crews are harder to constrain than an explicit graph; the role-play abstraction can obscure exact control flow.

---

## 4. Microsoft AutoGen / AG2 - conversational agents

**Model.** **Multi-agent conversation.** Agents are customizable and "conversable," combining LLMs, human input, and tools. Work happens through structured chat between agents (assistant + user-proxy + group-chat patterns).

**Primitives.** Conversable agents, group chat / chat managers, human-in-the-loop (`UserProxyAgent`), tool/code execution, conversation patterns.

**Ecosystem timeline (this is the adoption risk):**

| Date | Event |
|---|---|
| 2023 | Original AutoGen research framework (Microsoft Research). |
| Jan 2025 | **AutoGen 0.4** - full architectural rewrite: modular components, async, scalable, built-in debugging/monitoring, TypeScript support, distributed agents. |
| 2024–25 | **AG2** = community fork continuing **AutoGen 0.2**, maintained by the original creators after they left Microsoft. |
| Oct 2025 | Microsoft announces **AutoGen + Semantic Kernel consolidating into a unified Microsoft Agent Framework** - AutoGen's orchestration + SK's enterprise plugins/security/Azure. Official AutoGen→Agent Framework migration guide published. |

| Use it when | Avoid / reconsider when |
|---|---|
| You want **conversational multi-agent** problem-solving / code-execution loops and can track the ecosystem. | You need long-term stability *now* - watch the AutoGen + SK → **Microsoft Agent Framework** consolidation before committing. |

**Strengths:** strong research lineage; flexible conversation patterns; good for emergent problem-solving and code-execution loops. **Weaknesses:** fragmented ecosystem (0.2 vs 0.4 vs AG2 vs forthcoming Agent Framework) - version/naming confusion is a genuine risk in this window; conversation-driven control is hard to constrain.

---

## 5. OpenAI Agents SDK - handoffs & guardrails, lightweight

**History.** Successor to **Swarm** (experimental/educational, Oct 2024). Released production-ready on **March 11, 2025**.

**Model & primitives** (from the official docs):

1. **Agents** - LLMs equipped with instructions and tools.
2. **Handoffs** - delegate/transfer control to another specialized agent without manually wiring routing or state.
3. **Guardrails** - input/output validation that runs before/after the model (block prompt injection at the boundary, enforce schema/policy).

Plus **Sessions** (persistent memory) and **Tracing** (every run emits a structured trace - which agents ran, which tools were called, which handoffs occurred; built-in tracing UI + exporters to third-party observability).

**Design philosophy (quoted):** "(1) Enough features to be worth using, but few enough primitives to make it quick to learn. (2) Works great out of the box, but you can customize exactly what happens."

**Provider support:** OpenAI by default but **not locked in** - non-OpenAI providers via adapters (LiteLLM, Any-LLM).

| Use it when | Avoid / reconsider when |
|---|---|
| You're on/near **OpenAI models** and want a **lightweight** layer with **handoffs**, **guardrails**, sessions, and built-in **tracing**, minimal abstraction. | You need a rich graph engine or heavy non-OpenAI orchestration. |

**Strengths:** minimal learning curve; handoffs remove routing boilerplate; built-in guardrails + tracing are production-friendly; little hidden abstraction. **Weaknesses:** OpenAI-centric defaults; fewer heavy orchestration primitives than LangGraph (no rich graph/checkpoint model); newer, smaller ecosystem.

---

## 6. Anthropic Claude Agent SDK - the harness behind Claude Code

**What it is.** Anthropic's official SDK exposing the **same agent loop, tools, and context-management infrastructure that powers Claude Code**. Ships in **Python and TypeScript**.

**Naming/history.** Stable **1.0 on Sept 29, 2025**; renamed from `claude-code-sdk` → `claude-agent-sdk` (Python) and `@anthropic-ai/claude-code` → `@anthropic-ai/claude-agent-sdk` (TS/JS). The Claude Code CLI is bundled and driven under the hood.

**Primitives** (verified):

- **Agent-loop control** - interactive/bidirectional conversation via `ClaudeSDKClient`, or one-shot `query()`.
- **Built-in tools** - Claude Code's full toolset (Read, Write, Edit, Bash, …).
- **In-process MCP servers** - define custom tools as Python/TS functions running *inside* your app (`create_sdk_mcp_server`), no separate subprocess; mix with external MCP servers.
- **Hooks** - functions invoked at specific points in the loop for deterministic processing, automated feedback, or blocking dangerous commands.
- **Subagents** - delegate to specialized child agents.
- **Permission modes** - fine-grained tool-access gating.
- **Context management & sessions** - working dir, system prompts, config.

| Use it when | Avoid / reconsider when |
|---|---|
| You're building **coding / computer-use / file-operating agents on Claude** and want the proven Claude Code loop + in-process MCP tools, hooks, subagents, permission gating. | You're not on Claude, or you want a vendor-neutral general orchestration toolkit. |

**Strengths:** inherits a battle-tested coding-agent harness (context compaction, tool orchestration); strong on filesystem/coding/computer-use; first-class MCP, hooks (deterministic safety), and subagents; runs inside your own program. **Weaknesses:** Claude/Anthropic-centric; the bundled Claude Code CLI dependency + harness assumptions are a heavier substrate than a thin SDK; more an agent-*runtime* than a general graph toolkit.

---

## 7. Google Agent Development Kit (ADK) + A2A

**ADK.** Open-source agent framework on the **same stack that powers Google Agentspace / Customer Engagement Suite** agents. Multi-language: **Python, Java (1.0), and Go** (Go added A2A support). Integrates with Vertex AI Agent Engine for managed deployment.

**A2A (Agent2Agent) - the interop story.** Open standard introduced by Google **April 2025** for cross-agent, cross-vendor, **cross-framework** communication (agents on ADK, LangGraph, CrewAI, etc. can interoperate).

- **Roles:** A2A **client** (delegates tasks) ↔ A2A **server / remote agent** (exposes an HTTP endpoint, processes tasks, returns status/results).
- **Agent Cards:** machine-readable descriptors (name, description, version, endpoint URL, transports, auth requirements) for discovery.
- **v0.3 upgrade:** more stable interface, **gRPC support**, **signed security cards**, extended Python SDK client support - aimed at enterprise adoption.

```text
   A2A client                         A2A remote agent (server)
   ┌───────────┐   discover via       ┌─────────────────────────┐
   │ orchestr- │──"Agent Card"───────▶│ HTTP endpoint            │
   │ ator agent│   delegate task ────▶│ processes task           │
   │           │◀── status/results ───│ (built on ANY framework) │
   └───────────┘                      └─────────────────────────┘
```

| Use it when | Avoid / reconsider when |
|---|---|
| You need **cross-vendor / cross-framework interoperability** (A2A) for multi-agent systems, especially on **Google Cloud / Vertex AI**. | Single-framework, single-vendor app with no interop need. |

**Strengths:** the open interop protocol (A2A) is the differentiator - escape single-vendor lock-in; enterprise Google Cloud + Vertex integration; multi-language. **Weaknesses:** newer; large protocol-and-framework surface area; deepest value tied to the Google Cloud ecosystem.

---

## 8. Microsoft Semantic Kernel - enterprise .NET-first SDK

**Model.** Code-first orchestration SDK around a central **Kernel** object that runs the model, registers/invokes **plugins**, and (historically) planners. Language-agnostic (**C#, Python, Java**) and model-agnostic (Azure OpenAI, OpenAI, others), with strong DI integration in .NET.

**Primitives.** **Plugins** (skills/functions - the tool-calling unit), **function calling** (now the recommended path), memory/connectors, and an **Agent Framework** layer for single- and multi-agent orchestration.

**2025 shift (important):** **Planners (`HandlebarsPlanner`, `FunctionCallingStepwisePlanner`) are deprecated for new agents** - use **function calling** instead for better flexibility, tool support, and simpler DX. And per §4, SK is **merging with AutoGen into the unified Microsoft Agent Framework**.

| Use it when | Avoid / reconsider when |
|---|---|
| You're a **.NET / Microsoft-stack enterprise** wanting typed, DI-friendly **plugins + function calling** with Azure integration and enterprise security. | You want autonomy-first agent framing, or you're outside the MS ecosystem. |

**Strengths:** best fit for .NET/enterprise teams; typed tooling, DI patterns, Azure integration, mature production posture. **Weaknesses:** planner deprecation + Agent Framework consolidation = ecosystem in transition; less "agentic autonomy" framing than CrewAI/AutoGen; heavier enterprise patterns than lightweight SDKs.

---

## 9. LlamaIndex Agents - data/RAG-rooted

**Model.** **AgentWorkflow** orchestrates one or more agents, built on LlamaIndex's lower-level **Workflow** (event-driven, step-based) abstraction; it handles coordination, state, and hand-off between agents.

**Agent classes.** `FunctionAgent` (LLM function/tool calling) and `ReActAgent` (ReAct loop for non-function-calling models) - both inherit from `BaseWorkflowAgent`. AgentWorkflow picks the right one based on model capability.

**Primitives.** Workflow steps/events, the AgentWorkflow orchestrator, FunctionAgent/ReActAgent, tools, shared state; single specialized agent or collaborative multi-agent teams.

| Use it when | Avoid / reconsider when |
|---|---|
| Your agent is **data/RAG-centric** - reasoning over large document/knowledge corpora is the core, orchestration layered on top. | General multi-agent control with no retrieval focus (LangGraph is stronger there). |

**Strengths:** deep roots in RAG / data ingestion / retrieval - strongest when agents reason over large corpora; flexible Workflow primitive underneath; stateful multi-agent support. **Weaknesses:** orchestration is newer/lighter than LangGraph; primary gravity is data/retrieval, not general control.

---

## 10. Master decision table - "pick X when…"

| Framework | Pick it when… | Avoid / reconsider when… |
|---|---|---|
| **None** (direct API + the 5 patterns) | The task fits a single call or one workflow pattern; you want max debuggability; you're prototyping. | You genuinely need durable state, many specialized agents, or org-wide standardization. |
| **LangGraph** | Explicit, auditable control over complex flows with loops, retries, branching, durable state, multi-actor orchestration. | Quick prototype / simple linear flow; team can't absorb graph + state-schema modeling. |
| **CrewAI (Crews)** | Work decomposes into human-team-like roles that collaborate autonomously. | You need strict, predictable control paths (use Flows or LangGraph). |
| **CrewAI (Flows)** | Event-driven, deterministic orchestration that can also embed autonomous crews. | A single autonomous crew already suffices. |
| **AutoGen / AG2** | Conversational multi-agent / code-execution loops; comfortable tracking the ecosystem. | You need stability now - watch the Microsoft Agent Framework consolidation. |
| **OpenAI Agents SDK** | On/near OpenAI models; want a thin layer with handoffs, guardrails, sessions, tracing. | You need a rich graph engine or heavy non-OpenAI orchestration. |
| **Claude Agent SDK** | Coding / computer-use / file-operating agents on Claude; want the Claude Code loop + MCP tools, hooks, subagents, permission gating. | Not on Claude, or you want a vendor-neutral general orchestration toolkit. |
| **Google ADK + A2A** | Cross-vendor / cross-framework interoperability, especially on Google Cloud / Vertex AI. | Single-framework single-vendor app with no interop need. |
| **Semantic Kernel** | .NET / Microsoft-stack enterprise; typed plugins + function calling with Azure integration. | Autonomy-first framing, or outside the MS ecosystem. |
| **LlamaIndex (AgentWorkflow)** | Data/RAG-centric agent over large corpora. | General multi-agent control with no retrieval focus. |

---

## 11. Cross-cutting protocols: A2A vs MCP

A frequent point of confusion - they solve **different** problems and are designed to be used *together*:

| | **MCP** (Model Context Protocol) | **A2A** (Agent2Agent) |
|---|---|---|
| Connects | An agent ↔ **tools and data** | An agent ↔ **other agents** |
| Question it answers | "What can this agent *do/read*?" | "How do agents *delegate to each other*?" |
| Heavily used by | Claude Agent SDK; supported broadly | Google ADK; cross-framework |
| 2025 state | Widely adopted tool standard | Google-led; v0.3 adds gRPC + signed cards |

> They are standards, not frameworks - and increasingly the interop glue between any of the frameworks above. An A2A "remote agent" can itself be built on LangGraph or CrewAI and expose MCP tools internally.

---

## 12. Choosing - a short algorithm

1. **Can a single augmented LLM call or one of the 5 workflow patterns do it?** → Use direct API calls. Stop here for most tasks.
2. **Do you need durable, resumable, looping/branching control you can audit?** → LangGraph.
3. **Is the work naturally a collaborating team of roles?** → CrewAI Crews (+ Flows for the deterministic spine).
4. **Are you committed to a vendor's models/runtime?** → OpenAI Agents SDK (OpenAI), Claude Agent SDK (Claude, especially coding/computer-use), Semantic Kernel (.NET/Azure), Google ADK (Vertex).
5. **Is retrieval over large corpora the core?** → LlamaIndex AgentWorkflow.
6. **Must agents from different teams/vendors interoperate?** → adopt **A2A** as the seam; use **MCP** for tools regardless of framework.
7. **Whatever you pick, understand the code underneath** and be ready to drop abstraction in production.

---

## Sources

**Primary / authoritative**

- Building Effective AI Agents - Anthropic - https://www.anthropic.com/research/building-effective-agents
- OpenAI Agents SDK (official docs) - https://openai.github.io/openai-agents-python/
- Guardrails - OpenAI Agents SDK - https://openai.github.io/openai-agents-python/guardrails/
- Agents SDK - OpenAI API guide - https://developers.openai.com/api/docs/guides/agents
- claude-agent-sdk-python (GitHub, Anthropic) - https://github.com/anthropics/claude-agent-sdk-python
- AutoGen to Microsoft Agent Framework Migration Guide - https://learn.microsoft.com/en-us/agent-framework/migration-guide/from-autogen/
- Microsoft Agent Framework Overview - https://learn.microsoft.com/en-us/agent-framework/overview/
- AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation - Microsoft Research - https://www.microsoft.com/en-us/research/publication/autogen-enabling-next-gen-llm-applications-via-multi-agent-conversation-framework/
- Multi-agent Conversation Framework | AutoGen 0.2 - https://microsoft.github.io/autogen/0.2/docs/Use-Cases/agent_chat/
- Semantic Kernel (GitHub, Microsoft) - https://github.com/microsoft/semantic-kernel
- What are Planners in Semantic Kernel - Microsoft Learn - https://learn.microsoft.com/en-us/semantic-kernel/concepts/planning
- Configuring Agents with Semantic Kernel Plugins - Microsoft Learn - https://learn.microsoft.com/en-us/semantic-kernel/frameworks/agent/agent-functions
- ADK with Agent2Agent (A2A) Protocol - Google ADK docs - https://google.github.io/adk-docs/a2a/
- Introduction to A2A - Google ADK docs - https://google.github.io/adk-docs/a2a/intro/
- Agent2Agent protocol is getting an upgrade (v0.3) - Google Cloud Blog - https://cloud.google.com/blog/products/ai-machine-learning/agent2agent-protocol-is-getting-an-upgrade
- What's new with Agents: ADK, Agent Engine, and A2A Enhancements - Google Developers Blog - https://developers.googleblog.com/agents-adk-agent-engine-a2a-enhancements-google-io/
- Announcing ADK for Java 1.0.0 - Google Developers Blog - https://developers.googleblog.com/announcing-adk-for-java-100-building-the-future-of-ai-agents-in-java/
- Build and manage multi-system agents with Vertex AI - Google Cloud Blog - https://cloud.google.com/blog/products/ai-machine-learning/build-and-manage-multi-system-agents-with-vertex-ai
- CrewAI (GitHub) - https://github.com/crewaiinc/crewai
- CrewAI Flows - https://crewai.com/crewai-flows
- LlamaIndex AgentWorkflow blog - https://www.llamaindex.ai/blog/introducing-agentworkflow-a-powerful-system-for-building-ai-agent-systems
- LlamaIndex Agent Classes (API ref) - https://docs.llamaindex.ai/en/stable/api_reference/agent/
- LlamaIndex Agents (module guide) - https://docs.llamaindex.ai/en/stable/module_guides/deploying/agents/

**Secondary / corroborating**

- Claude Agent SDK: Subagents, Sessions and Why It's Worth It - https://www.ksred.com/the-claude-agent-sdk-what-it-is-and-why-its-worth-understanding/
- Claude Agent SDK Complete Guide - https://hidekazu-konishi.com/entry/claude_agent_sdk_complete_guide.html
- OpenAI Agents SDK vs Swarm: Migration Guide - https://www.respan.ai/articles/openai-agents-sdk-vs-swarm
- The AI Agent Framework Landscape in 2025 (Medium) - https://medium.com/@hieutrantrung.it/the-ai-agent-framework-landscape-in-2025-what-changed-and-what-matters-3cd9b07ef2c3
- The Developer's Guide to AI Agent Frameworks in 2025 (DEV) - https://dev.to/hani__8725b7a/agentic-ai-frameworks-comparison-2025-mcp-agent-langgraph-ag2-pydanticai-crewai-h40
- Best Multi-Agent Frameworks in 2026 (gurusup) - https://gurusup.com/blog/best-multi-agent-frameworks-2026
