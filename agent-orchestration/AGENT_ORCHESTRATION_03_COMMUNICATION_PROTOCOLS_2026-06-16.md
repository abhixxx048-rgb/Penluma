# Communication, Coordination & Interop Protocols (MCP, A2A, handoffs)

*How agents pass control, share state, and talk to tools and to each other — message passing vs. blackboards, handoff semantics, MCP, A2A, and structured-output reliability.*

> Research/reference doc · 2026-06-16 · part of the Agent Orchestration suite

---

## 0. Orientation

A multi-agent system (MAS) is only as good as the plumbing between its agents. This doc covers the **wire-level and coordination-level questions**: how do agents exchange information, who is "driving" at any moment, how is a big task split and re-assembled, and what open protocols (MCP, A2A) standardize agent↔tool and agent↔agent communication.

Two mental layers run through everything below:

```
            ┌─────────────────────────────────────────────┐
  agent ↔ agent (horizontal)   handoffs, A2A, blackboard   │  COORDINATION layer
            ├─────────────────────────────────────────────┤
  agent ↔ tools/data (vertical)   tool calling, MCP        │  CAPABILITY layer
            └─────────────────────────────────────────────┘
```

Keep that split in mind — MCP lives on the vertical layer, A2A on the horizontal one, and they are complementary (§9).

---

## 1. How agents communicate: message passing vs. shared memory (blackboard)

Two foundational coordination paradigms underlie all MAS.

### Message passing (peer-to-peer / conversational)

Agents communicate **directly**, negotiating tasks and sharing information through conversational exchanges — dialogue histories and task-specific protocols. Early MAS frameworks relied on **isolated local memories plus explicit message passing**.

- **Pros:** flexible; agents keep their own state, so they don't interfere with each other.
- **Cons:** every handoff adds overhead. As team size and task horizon grow, you get **redundancy, fragmented context, and high communication overhead**.

### Blackboard architecture (shared memory)

A **globally accessible shared knowledge base** ("blackboard") is the sole memory and message-passing hub. Agents with different roles **independently monitor** the shared state and contribute when they can add value.

- Each agent typically reads the *entire* blackboard before acting; all outputs are posted back as new blackboard entries.
- Agent selection **emerges from current content** — repeated execution rounds run until consensus.
- **Pros:** transparency; far less message traffic; loose coupling (agents post intermediate results and read others' contributions without tight coupling).
- **Cons:** needs **strong versioning and access control**; **consistency and concurrency** problems when multiple agents read/modify the same state at once (requires locks, transactions, or optimistic concurrency control).

### The core trade-off

| | Message passing | Blackboard / shared memory |
|---|---|---|
| Coupling | Loose (decoupled agents) | Loose, but via shared substrate |
| Coordination | Explicit, per-message | Implicit (observe + update state) |
| Message traffic | High, grows with team size | Low |
| Main failure mode | Context fragmentation, overhead | Concurrency / consistency bugs |
| Visibility | Hard to see the whole picture | High transparency |

Shared state **reduces explicit message passing** but trades it for concurrency complexity. Message passing keeps agents independent but multiplies overhead.

### Practical hybrid: LangGraph state object

LangGraph is built around a **state object** with a defined **state schema**, accessible at each agent step. The state behaves like a "collaborative whiteboard" (a blackboard) — all nodes can read/modify shared info — while supporting both **complete attribute override** and **additive (append) updates**, keeping data consistent. This blends blackboard-style shared memory with explicit graph-based control flow, which is why it's the default choice for production graphs.

---

## 2. Handoff semantics: control transfer vs. context transfer

A **handoff** is the primitive by which one agent delegates to another. Two distinct things can move during a handoff — keep them separate in your head:

- **Control transfer** — *which* agent is active / driving the conversation.
- **Context transfer** — *what* information (history, task data) the receiving agent gets.

### OpenAI Agents SDK (production successor to Swarm)

- A **handoff** lets an agent delegate a task to another agent — useful when agents specialize.
- Handoffs **transfer control entirely**: the receiving agent **becomes the active agent** and responds directly to the user.
- Crucially, handoffs are **represented to the LLM as tools**. A handoff to a "Refund Agent" surfaces as a tool named `transfer_to_refund_agent`. This unifies handoffs with the tool-calling mechanism (see §6).
- History: **Swarm** (open-source, Oct 2024) was the lightweight prototype; the **Agents SDK** (Mar 2025) is its production evolution. Swarm is no longer maintained.

### LangGraph

- Same conceptual shape: agents **transfer control through an explicit handoff primitive instead of calling each other directly**.
- Implemented via **`Command(goto=...)`** for dynamic flow — route to a named node, rather than OpenAI's "handoff-as-tool" framing.
- `langgraph-swarm-py` provides swarm-style handoff patterns; the **`interrupt`** primitive supports cleaner human-in-the-loop pauses.

### Design principle: explicit handoff, not direct calls

Both major frameworks converge on the same rule: **use an explicit handoff primitive, never direct agent-to-agent function calls.** This enforces **ownership boundaries** — clear control-transfer points instead of tangled mutual calls that nobody can reason about.

```
[Triage Agent] --transfer_to_refund_agent--> [Refund Agent]  (control moves; triage goes idle)
       ^                                            |
       └────────────── handoff back ───────────────┘
```

> **When to use handoffs:** distinct specializations, clear "this is now someone else's job" boundaries.
> **When NOT to:** tasks needing tight back-and-forth or shared working context — that's a sub-agent/tool call within one owner, not a control transfer.

---

## 3. Task decomposition & result aggregation (Anthropic multi-agent research system)

The canonical production case study is Anthropic's Research feature — an **orchestrator-worker (lead + subagent)** pattern.

### Architecture: orchestrator-worker (hierarchical)

- A **lead agent (Lead Researcher)** analyzes the query, develops strategy, and **spawns multiple subagents** to explore different aspects in parallel.
- Production config: **Claude Opus 4 as lead, Sonnet 4 as subagents.**

```
                ┌──────────────┐
                │ Lead (Opus)  │  plan → spawn → synthesize → decide-more?
                └──────┬───────┘
        ┌──────────────┼──────────────┐
   ┌────▼───┐     ┌────▼───┐      ┌────▼───┐
   │Sub A   │     │Sub B   │ ...  │Sub N   │   (Sonnet, isolated context windows)
   └────────┘     └────────┘      └────────┘
        └──────── findings ───────┘
                       ▼
               [CitationAgent]  (separate citation pass)
```

### Task decomposition

The lead breaks complex queries into subtasks with **explicit guidance**. Each subagent needs **an objective, an output format, guidance on which tools/sources to use, and clear task boundaries**. Without this, subagents **duplicate effort** — early versions had multiple agents investigating identical topics from vague directives.

**Scaling rules embedded in prompts** to control effort:

| Query type | Subagents | Tool calls each |
|---|---|---|
| Simple fact-finding | 1 | 3–10 |
| Comparisons | 2–4 | 10–15 |
| Complex research | 10+ | divided responsibilities |

### Context & result aggregation

- **Isolated context windows:** each subagent runs in its own context window — enabling parallel reasoning and scaling past a single agent's limit. Performance gains are strongly linked to spreading reasoning across **multiple independent context windows**.
- **Persistent memory:** the lead **saves its research plan to memory** before launching subagents, so it survives nearing the **200,000-token limit**.
- **Synthesis:** subagents return findings to the lead, which synthesizes and decides whether more research is needed.
- **Separate citation pass:** a dedicated **CitationAgent** processes documents afterward to attribute claims to sources.
- **Parallel tool calling:** subagents issue 3+ tool calls simultaneously; the lead spins up 3–5 subagents in parallel — cutting research time by **up to 90%** on complex queries.

### Performance & cost

- The multi-agent system **outperformed single-agent Claude Opus 4 by 90.2%** on internal research evals (especially breadth-first / parallelizable queries).
- **Token economics:** multi-agent uses **~15× the tokens** of an ordinary chat (chat agents already use ~4×). **Token usage alone explains ~80% of performance variance** — so this is only viable for high-value tasks.

### Failure modes found (and fixes)

- Spawning **50 subagents for a trivial query**; scouring the web endlessly for sources that don't exist. Fixed with explicit scaling rules, teaching delegation granularity, and using extended thinking as a "controllable scratchpad".
- **Prompt engineering was the single biggest lever** — small phrasing changes separated efficient research from wasted effort.

> **When NOT to use multi-agent:** domains needing **shared context across agents** or **heavy interdependencies** are poor fits. "Most coding tasks involve fewer truly parallelizable tasks than research." Synchronous execution (lead waits for subagent batches) creates bottlenecks but simplifies coordination — a deliberate trade.

---

## 4. Model Context Protocol (MCP)

**Creator / date:** Anthropic, **November 2024**. Open standard, open-source.

### What it standardizes

A **universal, open standard for connecting AI systems to data sources**, replacing fragmented one-off integrations with a single protocol. It enables **secure, two-way connections** between data/tools and AI applications, and solves the **N×M integration problem**: instead of a custom connector for every model × every data source, developers **build against one protocol**. The framing: models were "trapped behind information silos and legacy systems."

### Client-server model

- **Two tiers:** developers either **expose data via MCP servers**, or **build AI applications (MCP clients)** that connect to them. The AI app is the client; servers deliver external data/capabilities.
- **Discovery:** a protocol handshake — the client connects and the server **registers/advertises its capabilities**.

### Three core primitives

| Primitive | Controlled by | What it is |
|---|---|---|
| **Tools** | **Model-controlled** | Executable functions the model can invoke (actions, queries) |
| **Resources** | **App-controlled** | Data/content the app exposes (files, records) |
| **Prompts** | **User-controlled** | Reusable prompt templates the user can invoke |

### Transport & technical

- Built on **JSON-RPC 2.0**; re-uses message-flow ideas from the **Language Server Protocol (LSP)**.
- Transports: **stdio** (local) and **SSE / HTTP** (remote).
- SDKs provided (e.g. JS `@modelcontextprotocol/sdk`). Anthropic shipped pre-built servers for Google Drive, Slack, GitHub, Git, Postgres, Puppeteer; Claude Desktop supports local servers.
- Latest referenced spec revision: **2025-11-25**.
- **Code execution with MCP** is an emerging efficiency pattern — agents call MCP tools via generated code rather than many slow round-trips.

### Adoption

From **100,000 → 97 million** monthly SDK downloads in 16 months; **78% of enterprise AI teams** report at least one MCP-backed agent in production.

---

## 5. Agent2Agent (A2A) protocol

**Creator / date:** Google, announced **April 2025**, with **50+ partners**. Open standard.

### Purpose

Lets AI agents **built by different vendors discover each other, delegate tasks, and coordinate** across enterprise systems — interoperability **without shared direct access** to each other's resources. Agents stay **opaque** about their internal state and tools.

### Agent Cards (discovery)

Every A2A agent publishes an **Agent Card** — a JSON metadata document at the well-known URL **`/.well-known/agent-card.json`**. It describes:

- identity (name/description), version, service endpoint
- supported modalities/interfaces
- authentication/security schemes
- capability flags (streaming, push notifications, extended cards)

Cards may be **signed and cached**. Capabilities are advertised **without exposing implementation details**.

### Roles (asymmetric)

- **A2A Client (client agent):** initiates requests on behalf of users.
- **A2A Server (remote agent):** processes tasks, publishes capabilities via its Agent Card.

This asymmetry is what lets agents collaborate while staying opaque.

### Task lifecycle

The **Task** is the fundamental unit of work and has a unique ID. States:

```
SUBMITTED ──> WORKING ──> COMPLETED   (terminal)
                 │    └──> FAILED      (terminal)
                 │    └──> CANCELED    (terminal, user-initiated)
                 │    └──> REJECTED    (terminal, agent declined)
                 ├──> INPUT_REQUIRED   (interrupted, needs user input)
                 └──> AUTH_REQUIRED    (interrupted, needs auth)
```

Plus `unknown`. **Terminal states prevent further messages.**

### Messages & Artifacts

- **Message** = one unit of communication, with a **role** (user or agent) and **Parts** (text, files, or structured data).
- **Artifact** = a task **output**, composed of Parts.
- Deliberate separation: **communication (Messages) vs. results (Artifacts)**; task history preserves the full interaction record.

### Transport & technical

- Three bindings: **JSON-RPC 2.0, gRPC, HTTP/REST**.
- Updates via **Server-Sent Events** (real-time streaming), **polling** (Get Task), and **async push notifications to webhooks**. Clients can manage one or many concurrent streams per task.
- Enterprise security: **OAuth 2.0, API keys, mTLS**.
- Capability pillars: discovery, task management, message-based collaboration, artifact handling, UX negotiation.

---

## 6. Function/tool calling as a coordination primitive

Function/tool calling lets a model **invoke predefined functions with structured parameters** — the base mechanism for an agent to act on the world. It also doubles as a **coordination primitive**:

- In the OpenAI Agents SDK, **handoffs are exposed as tools** (`transfer_to_<agent>`), so delegating to another agent is mechanically identical to calling a tool.
- MCP **tools** are likewise model-controlled functions.

The unification: tool calling is the substrate for **both** agent→tool access (MCP) **and** agent→agent delegation (handoffs / A2A tasks). The model decides *which* tool/handoff to invoke; the framework routes control accordingly. This is why "give the agent a tool" and "give the agent a colleague" look the same at the API level.

---

## 7. Structured outputs / schemas for reliable inter-agent messages

Reliable coordination requires messages that conform to a schema so the receiver can parse them **deterministically**. Free-form text between agents is a recipe for fragile parsing and silent breakage.

### State of the art (2025)

| Provider / mode | Schema compliance |
|---|---|
| OpenAI Structured Outputs (full JSON Schema attached) | **99.9%** |
| Anthropic Structured Outputs (beta) | **99.8%** (tool use), <0.2% failure, ~150–300 token overhead |
| Gemini schema | ~99.7% |
| Plain JSON mode, no schema enforcement | **fails 8–15%** of the time |

- **Anthropic Structured Outputs** (public beta, late 2025) require responses to strictly conform to a JSON schema or a tool spec, activated via the **`structured-outputs-2025-11-13`** beta header.
- The 8–15% failure rate of unenforced JSON is precisely why schema enforcement matters for inter-agent reliability.

### Two distinct mechanisms

- **Structured outputs** = guarantee the *shape of the model's response* matches a schema → good for typed inter-agent messages/artifacts.
- **Function/tool calling** = model selects a predefined function and supplies structured parameters → good for actions.

Both feed the same goal: cleaner, stricter, machine-parseable output that wires into downstream software/agents without brittle parsing.

**Relevance to protocols:** A2A's **Parts** (text/file/structured-data) and MCP's structured JSON-RPC payloads both depend on this reliability. Typed, schema-validated exchange is what makes artifact handling between agents dependable rather than hopeful.

---

## 8. State & context-passing pitfalls

From LangChain/LangGraph "context engineering" guidance and MAS analyses.

### The failure modes

- **Context window pollution** — cramming too many tools/instructions into one prompt **degrades performance**, and the degradation is **hard to predict or reproduce**. In a flat-context orchestrator, concurrent agents' partial outputs and domain state **compete for one context window**.
- **Error propagation / blast radius** — **without isolation boundaries, one bad tool call or hallucination can derail the entire workflow**. Isolation limits the blast radius of a single agent's error.
- **State-management complexity** — coordination adds consistency/concurrency overhead (the same blackboard problem from §1).

### Mitigations (LangGraph-centric)

- **Context isolation** — store tool-call context in dedicated **state fields**, hidden from the LLM until needed; **split context across sub-agents** so each owns its sub-task with its own tools/instructions/context window (mirrors Anthropic's isolated context windows in §3).
- **Defined state schema** — the shared state object enforces structure and supports both override and additive updates while staying consistent.
- **Newer primitives** — `Command` (dynamic flow / `goto`), `interrupt` (human-in-the-loop), **semantic search** for long-term memory, **cross-thread memory** for state across conversations.
- **Persistent plan storage** (Anthropic) — save the plan to memory *before* spawning workers, so context-window overflow doesn't wipe the orchestration state.

> **Rule of thumb:** the receiving agent should get *exactly* the context it needs for its sub-task — no more (pollution, blast radius) and no less (duplicated work, hallucinated gaps). Decide per-handoff what context transfers.

---

## 9. MCP vs A2A — comparison

| Dimension | **MCP (Model Context Protocol)** | **A2A (Agent2Agent)** |
|---|---|---|
| **Core question** | "How does an agent talk to **tools/data**?" | "How do **agents talk to each other**?" |
| **Creator / date** | Anthropic, **Nov 2024** | Google + 50+ partners, **Apr 2025** |
| **Layer / direction** | **Vertical** — agent ↔ tools & data | **Horizontal** — agent ↔ agent (peers) |
| **Primary unit** | Tools, Resources, Prompts | **Task** (with lifecycle), Messages, Artifacts |
| **Discovery** | Handshake; server **registers capabilities** | **Agent Card** at `/.well-known/agent-card.json` |
| **Transport** | JSON-RPC 2.0 over stdio / SSE / HTTP (LSP-inspired) | JSON-RPC 2.0 / gRPC / HTTP+REST; SSE, webhooks, polling |
| **Opacity model** | Server exposes concrete tools/data to client | Agents stay **opaque** — declared capabilities only |
| **Security** | Per server/transport | **OAuth 2.0, API keys, mTLS** built in |
| **The "other" side** | Non-agent resources | A **peer agent** that owns the task lifecycle |
| **Analogy** | Powers an agent **internally** with context & tools | Connects agents **externally** for collaboration |

### Relationship: complementary, not competing

They operate at **different layers of the same stack**. A production multi-agent system typically uses **MCP for each agent's data/tool access** and **A2A for coordination between agents**. Most enterprise deployments implement **both**, applying least-privilege/auth at each layer.

```
[Agent A] --A2A task--> [Agent B]      (horizontal: peers coordinate)
    │                       │
   MCP                     MCP          (vertical: each reaches its own tools/data)
    ▼                       ▼
[Postgres, Slack]      [GitHub, Drive]
```

---

## 10. Practical takeaways

- **Pick a coordination model deliberately.** Shared-state/blackboard (LangGraph state object) for transparency and low traffic; message passing for decoupling. Most production graphs use the hybrid: a typed shared state with explicit control flow.
- **Make handoffs explicit primitives**, never direct agent-to-agent calls — this is the one rule both OpenAI and LangGraph agree on, and it's what keeps ownership boundaries clean.
- **Decompose with explicit per-subagent contracts** (objective, output format, tools, boundaries). Vague delegation causes duplicated work and runaway subagent counts.
- **Budget tokens like money** — multi-agent is ~15× the cost of chat; reserve it for high-value, parallelizable, breadth-first work.
- **Enforce schemas on every inter-agent message.** Unenforced JSON fails 8–15% of the time; structured outputs push that under 0.2%.
- **Isolate context per agent** to cap the blast radius of errors and avoid context pollution; persist the orchestration plan before spawning workers.
- **MCP and A2A are not rivals** — wire MCP under each agent and A2A between agents.

---

## Sources

- Introducing the Model Context Protocol — https://www.anthropic.com/news/model-context-protocol
- MCP Specification (2025-11-25) — https://modelcontextprotocol.io/specification/2025-11-25
- Model Context Protocol (Wikipedia) — https://en.wikipedia.org/wiki/Model_Context_Protocol
- Code execution with MCP (Anthropic engineering) — https://www.anthropic.com/engineering/code-execution-with-mcp
- How we built our multi-agent research system (Anthropic engineering) — https://www.anthropic.com/engineering/built-multi-agent-research-system
- Agent2Agent (A2A) Protocol Specification — https://a2a-protocol.org/latest/specification/
- Announcing the Agent2Agent Protocol (Google Developers Blog) — https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/
- A2A vs. MCP (Descope) — https://www.descope.com/blog/post/mcp-vs-a2a
- MCP vs A2A Protocol: Architecture, Differences and When to Use (Atlan) — https://atlan.com/know/mcp/mcp-vs-a2a-protocol/
- A2A vs MCP — How These AI Agent Protocols Actually Differ (DigitalOcean) — https://www.digitalocean.com/community/tutorials/a2a-vs-mcp-ai-agent-protocols
- Handoffs — OpenAI Agents SDK docs — https://openai.github.io/openai-agents-python/handoffs/
- langgraph-swarm-py (LangChain) — https://github.com/langchain-ai/langgraph-swarm-py
- Multi-Agent Handoff With Ownership Boundaries (dev.to) — https://dev.to/gabrielanhaia/multi-agent-handoff-with-ownership-boundaries-nobody-crosses-nll
- Context Engineering for Agents (LangChain blog) — https://www.langchain.com/blog/context-engineering-for-agents
- Multi-Agent Systems: Design Patterns and Orchestration (Tetrate) — https://tetrate.io/learn/ai/multi-agent-systems
- Multi-agent systems: Why coordinated AI beats going solo (Redis) — https://redis.io/blog/multi-agent-systems-coordinated-ai/
- bMAS: Blackboard LLM Multi-Agent System (EmergentMind) — https://www.emergentmind.com/topics/blackboard-based-llm-multi-agent-system-bmas
- Structured outputs — Claude API Docs — https://platform.claude.com/docs/en/build-with-claude/structured-outputs
- Anthropic boosts Claude API with Structured Outputs (Tessl) — https://tessl.io/blog/anthropic-brings-structured-outputs-to-claude-developer-platform-making-api-responses-more-reliable/
- Structured Output and JSON Mode Guide 2026 (TokenMix) — https://tokenmix.ai/blog/structured-output-json-guide
- From Glue-Code to Protocols: Critical Analysis of A2A and MCP (arXiv 2505.03864) — https://arxiv.org/pdf/2505.03864
