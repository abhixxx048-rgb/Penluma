# Foundations: Agents, Agentic Loops & When to go Multi-Agent

*The vocabulary, the loop mechanic, and the decision ladder you climb before ever spawning a second agent.*

> Research/reference doc · 2026-06-16 · part of the Agent Orchestration suite

---

## Why this doc exists

"Agent" and "multi-agent" are thrown around loosely. Before you build anything, you need a precise mental model of (1) what separates a plain LLM call from a workflow from an agent, (2) the loop that makes something "agentic," and (3) the hard economic and reliability gates that decide whether you need *one* agent, *many* agents, or *no* agent at all.

The unifying thesis across every serious source (Anthropic, OpenAI, Google) is the same: **use the simplest thing that works; add agentic complexity only when it clearly pays off.** This doc gives you the framework to make that call deliberately rather than by hype.

---

## 1. The three-rung ladder: plain call → workflow → agent

There is a spectrum of increasing autonomy. The sharpest industry line (Anthropic) is drawn between **workflows** and **agents** — both of which sit under the umbrella term **agentic systems**.

| Term | Definition | Who controls the flow | Predictability |
|------|-----------|----------------------|----------------|
| **Plain LLM call** | A single model invocation (optionally augmented with retrieval/tools/memory), one turn, no loop. Apps that "integrate LLMs but don't use them to control workflow execution — think simple chatbots, single-turn LLMs, or sentiment classifiers — are **not** agents." (OpenAI) | Developer / code | Highest |
| **Workflow** | "Systems where LLMs and tools are **orchestrated through predefined code paths**." (Anthropic) The developer fixes the sequence; the LLM fills in steps. | Developer-defined code path | High |
| **Agent** | "Systems where LLMs **dynamically direct their own processes and tool usage**, maintaining control over how they accomplish tasks." (Anthropic) | The LLM (model-driven) | Lowest / dynamic |

**The three canonical definitions, side by side:**

- **Anthropic:** "Workflows are systems where LLMs and tools are orchestrated through predefined code paths. Agents, on the other hand, are systems where LLMs dynamically direct their own processes and tool usage, maintaining control over how they accomplish tasks."
- **OpenAI:** "Agents are systems that **independently** accomplish tasks on your behalf." Two defining traits: (1) it "leverages an LLM to manage workflow execution and make decisions… recognizes when a workflow is complete and can proactively correct its actions"; (2) it "has access to various tools… and dynamically selects the appropriate tools depending on the workflow's current state."
- **Google (Agents whitepaper):** "A Generative AI Agent… is an application that attempts to achieve a goal by **observing the world and acting upon it using tools** that it has at its disposal." The differentiator from a bare model is an **orchestration layer** enabling "iterative reasoning and multi-step problem-solving," unlike models that "operate on single-turn predictions."

> **Takeaway:** "Agentic" is a spectrum, not a binary. A plain call *answers*; a workflow *follows a script the developer wrote*; an agent *decides its own path at runtime*.

---

## 2. The building block underneath everything: the augmented LLM

Every agentic system — workflow or agent — is composed from one foundational unit: the **augmented LLM**, an LLM enhanced with **retrieval, tools, and memory** (Anthropic). Modern models "actively generate search queries, select appropriate tools, and determine what information to retain."

The same idea appears as a three-part cognitive architecture across vendors:

| Anthropic | Google ("cognitive architecture") | OpenAI ("core components") | Role |
|-----------|-----------------------------------|----------------------------|------|
| The model + tools + memory | **Model** — the "brain," central decision-maker | **Model** — reasoning/decision-making | Decide |
| (tools) | **Tools** — "hands and eyes" (Extensions, Functions, Data Stores) | **Tools** — external functions/APIs to take action | Act |
| (memory/loop) | **Orchestration Layer** — the "nervous system": memory, state, reasoning, planning; drives the loop via ReAct / Chain-of-Thought / Tree-of-Thought | **Instructions** — guidelines & guardrails defining behavior | Govern / loop |

If a single well-engineered augmented-LLM call (good prompt + retrieval + in-context examples) solves your task, **stop there.** Everything below is added complexity you must justify.

---

## 3. The agentic loop (perceive → plan → act → observe)

The defining mechanic of an agent is a **loop, not a pipeline.**

```
        ┌──────────────────────────────────────────────┐
        │                                                │
        ▼                                                │
   ┌─────────┐   ┌──────────────┐   ┌───────┐   ┌─────────────┐
   │ Perceive│ → │ Plan / Reason│ → │  Act  │ → │   Observe   │ ──┘
   │(task +  │   │(decide next  │   │(call  │   │(read result,│
   │ env)    │   │  step)       │   │ tool) │   │ error, etc.)│
   └─────────┘   └──────────────┘   └───────┘   └─────────────┘
                                                       │
                              repeat until goal met OR stop-condition hit
```

**Anthropic's description of the loop:** agents "begin their work with either a command from, or interactive discussion with, the human user. Once the task is clear, agents plan and operate independently, potentially returning to the human for further information or judgement." Critically, "at each step… the agent gains **'ground truth' from the environment** (such as tool call results or code execution) to assess its progress." Agents can pause for human checkpoints or on hitting blockers, and typically "terminate upon completion, but it's also common to include stopping conditions (such as a maximum number of iterations)."

**OpenAI's framing of the same loop:** a single agent "runs in a loop" until an exit condition is met. Exit conditions "include tool calls, a certain structured output, errors, or reaching a maximum number of turns."

### ReAct — the canonical instantiation of the loop

- **Paper:** *ReAct: Synergizing Reasoning and Acting in Language Models* — Yao et al., submitted Oct 6 2022 (arXiv:2210.03629), ICLR 2023.
- **Core idea:** interleave **reasoning traces** ("thoughts") with **task-specific actions**. The loop is concretely **Thought → Action → Observation**, repeated. "Reasoning traces help the model induce, track, and update action plans as well as handle exceptions, while actions allow it to interface with external sources to gather additional information."
- **Why it matters:** ReAct "overcomes issues of hallucination and error propagation prevalent in chain-of-thought reasoning by interacting with a simple Wikipedia API." Reasoning grounds action; observation from the environment corrects reasoning. Trajectories are "more interpretable" and improve "human interpretability and trustworthiness."
- **Results:** on the interactive benchmarks ALFWorld and WebShop, ReAct beat imitation/RL baselines by an absolute success rate of **34%** and **10%** respectively; also evaluated on HotpotQA and FEVER.

> **Mental model:** the generic loop (perceive → plan → act → observe) is the *spine* of every agent. ReAct is the simplest concrete recipe for it. The closed loop — observing the *result* of each action and adapting — is what separates an agent from an open-loop pipeline.

---

## 4. What actually makes something "agentic" — four properties

Synthesizing across sources, four properties distinguish agentic systems from plain LLM use. The more present, the more "agentic":

1. **Autonomy / dynamic control flow** — the LLM, not hard-coded logic, decides what to do next and how many steps to take. The number of steps and the solution path *cannot be predetermined.* (Anthropic: "dynamically direct their own processes"; OpenAI: "recognizes when a workflow is complete.")
2. **Tool use** — the system can *act on the world*, not just emit text (Google's "hands and eyes").
3. **Environment feedback grounding** — the agent observes the *results* of its actions (tool outputs, code execution, errors) and adapts. Anthropic calls this gaining "ground truth from the environment." This is the open-loop vs closed-loop difference.
4. **Iteration toward a goal** — operates in a loop until a goal/stop-condition is met, rather than one-shot.

| System | Dynamic control flow | Tool use | Env. feedback | Iteration |
|--------|:---:|:---:|:---:|:---:|
| Plain classifier | — | — | — | — |
| RAG call | — | ✓ | — | — |
| Workflow | — (fixed in code) | ✓ | ✓ | ✓ |
| **True agent** | ✓ | ✓ | ✓ | ✓ |

The single property that promotes a workflow to an agent is **dynamic control flow**: in a workflow the steps are fixed in code; in an agent the model chooses them at runtime.

---

## 5. The five canonical workflow patterns

Before reaching for a fully autonomous agent, Anthropic catalogs five **workflow** patterns that are more predictable and cheaper. (LangGraph implements exactly these.) Most "I need an agent" problems are actually one of these.

| Pattern | What it does | When to use |
|---------|-------------|-------------|
| **Prompt chaining** | Decompose into a fixed sequence of LLM calls; each processes the prior output; programmatic "gate" checks between steps. | Task cleanly decomposes into fixed subtasks; trade latency for accuracy. |
| **Routing** | Classify the input, then direct it to a specialized follow-up prompt/path. | Distinct input categories better handled separately; allows separate optimization per route. |
| **Parallelization** | Run subtasks simultaneously. Two forms: **Sectioning** (independent subtasks) and **Voting** (same task run multiple times for diverse/consensus output). | Subtasks are independent, or you want multiple attempts / guardrail votes for confidence. |
| **Orchestrator–workers** | A central LLM **dynamically** breaks down the task, delegates to worker LLMs, then synthesizes results. | Complex tasks where the subtasks **can't be predicted up front**. |
| **Evaluator–optimizer** | One LLM generates; a second evaluates and gives feedback; loop until criteria met. | Clear evaluation criteria exist and iterative refinement measurably helps. |

> **Key nuance — the bridge from workflow to agent:** orchestrator–workers ≠ parallelization. In parallelization the subtasks are **fixed in code**; in orchestrator–workers the lead LLM **decides the subtasks at runtime**. That runtime decision is exactly the "dynamic control flow" property — which is why orchestrator–workers is the conceptual gateway to multi-agent systems.

---

## 6. Single-agent vs multi-agent

### What multi-agent actually buys you

- **Breadth and parallel exploration.** Anthropic's multi-agent **Research** system (orchestrator–worker: a Lead Researcher spawns **3–5 subagents** in parallel, each using **3+ tools in parallel**) scored a **90.2% improvement over single-agent Claude Opus 4** on their internal research eval. It "excels at breadth-first queries that involve pursuing multiple independent directions simultaneously."
- **Context-window scaling.** Subagents have their own context windows, so the system can process information that "exceeds single context windows."
- **Speed via parallelism.** Parallel tool calling "cut research time by up to 90% for complex queries."
- **Separation of concerns.** More agents "can provide intuitive separation of concepts" (OpenAI).

### The real costs of multi-agent

| Cost | Detail (Anthropic, measured) |
|------|------------------------------|
| **Token multiplier** | Agents use **~4× more tokens** than chat. Multi-agent systems use **~15× more tokens than chat.** In their BrowseComp analysis, **token usage alone explained ~80% of the variance** in performance (model choice and tool-call count were secondary). |
| **Economic gate** | "Multi-agent systems require tasks where the **value of the task is high enough to pay for the increased performance**." Below that threshold, don't. |
| **Coordination overhead** | "LLM agents are not yet great at coordinating and delegating to other agents in real time." Lead agents currently run subagents **synchronously** (waiting for each batch), creating bottlenecks. |
| **Error compounding** | Agents "run for long periods… maintaining state across many tool calls… minor system failures can be catastrophic." Errors propagate across long trajectories. |
| **Non-determinism** | "Agents make dynamic decisions and are non-deterministic between runs, even with identical prompts. This makes debugging harder." Deployment needs care (e.g. "rainbow deployments" to avoid disrupting in-flight agents). |

### When multi-agent does NOT fit (Anthropic, explicit)

> "Some domains that require all agents to **share the same context** or involve **many dependencies between agents** are not a good fit for multi-agent systems today."

Specifically called out: **most coding tasks** "involve fewer truly parallelizable tasks than research." Good fit = high-value tasks with heavy parallelization, info exceeding one context window, and many complex tools.

### Independent evidence that multi-agent often underperforms

The Berkeley **MAST** study (*Why Do Multi-Agent LLM Systems Fail?*, Cemri, Pan, Yang et al., arXiv:2503.13657, NeurIPS 2025) analyzed **7 popular MAS frameworks** across **1,600+ annotated traces** (inter-annotator κ = 0.88) and found "performance gains on popular benchmarks are often minimal." It identifies **14 failure modes in 3 categories**:

1. **System design / specification issues** — e.g. step repetition (15.7%), unaware of termination conditions (12.4%), disobeying task spec (11.8%).
2. **Inter-agent misalignment** — communication/coordination breakdowns, **~32% of failures.**
3. **Task verification failures** — inadequate output validation, error propagation.

> **The lesson:** adding agents adds *new* failure surfaces (coordination, role confusion, premature/late termination) **on top of** all the single-agent ones. More agents is not free quality.

---

## 7. The decision ladder — do you even need an agent (or more than one)?

The unifying stance: **use the simplest thing that works; add agentic complexity only when it clearly pays off.** At every rung, the burden of proof is on the *added* complexity.

```
START
  │
  ├─ Single well-engineered LLM call (prompt + retrieval + examples) — enough?  ── YES → ship it.
  │                                                                                   (Anthropic: "this might mean not building agentic systems at all.")
  │  NO
  ▼
  ├─ Are the steps fixed & knowable?  ── YES → WORKFLOW (chaining / routing / parallelization).
  │                                              Predictable, cheaper, easier to debug.
  │  NO (path is genuinely unpredictable; needs runtime decisions)
  ▼
  ├─ SINGLE AGENT with tools in a loop.  ← maximize this first.
  │
  ├─ Is the single agent overloaded?  (>~15 distinct tools, OR overlapping/similar tools,
  │   OR sprawling if-then-else branching)  ── NO → stay single-agent.
  │  YES
  ▼
  └─ AND is the task high-value, parallelizable, and exceeding one context window?
        ── NO → fix the single agent (better tools/prompts), don't split.
        ── YES → MULTI-AGENT (manager or handoff pattern).
```

### When agents earn their keep (OpenAI's three signals)

1. **Complex decision-making** — nuanced judgment, exceptions, context-sensitive calls (e.g. refund approval).
2. **Difficult-to-maintain rules** — rule systems grown "unwieldy," costly/error-prone to update.
3. **Heavy reliance on unstructured data** — interpreting natural language, extracting from documents, conversational interaction.

If a problem hits *none* of these, a deterministic/rules-based solution is probably better than any agent.

### Workflow vs agent (Anthropic)

- Use **workflows** for "predictability and consistency for well-defined tasks."
- Use **agents** when you need "flexibility and model-driven decision-making at scale" — open-ended problems where you can't predict the number of steps or hard-code the path.

### Concrete triggers to split into multiple agents (OpenAI)

- **Tool overload / overlap:** the problem "isn't solely the number of tools, but their similarity or overlap. Some… manage more than **15 well-defined, distinct tools** while others struggle with fewer than 10 overlapping tools." When a single agent can't reliably pick the right tool → split.
- **Complex conditional logic:** when prompts fill with many if-then-else branches and templates "get difficult to scale," divide each logical segment into its own agent.

### The two multi-agent orchestration patterns (OpenAI), once you do split

| Pattern | How it works | Best when |
|---------|-------------|-----------|
| **Manager** | A central "manager" agent coordinates specialized agents **via tool calls** (agents-as-tools); one agent keeps central control and user contact. Edges = tool calls. | You want one controller synthesizing results and owning the conversation. |
| **Decentralized / handoff** | Agents "hand off" execution to one another; edges = handoffs that transfer control. | No single agent needs central control; each can take over interacting with the user. |

### The economic gate (Anthropic), restated

Even when multi-agent improves quality, only deploy it where the **task value justifies the ~15× token cost.** High-value research/analysis: yes. Routine, low-margin, or tightly-coupled tasks: no.

---

## 8. Supporting detail: tool engineering (the agent–computer interface)

Anthropic stresses the **agent–computer interface (ACI)** deserves as much investment as prompt engineering: "we've seen developers spend more effort on prompts than tools."

- Format tools to match how they appear "naturally" in text; avoid overhead like counting lines or escaping.
- Give the model enough tokens to "think" before it commits to an action.
- Write thorough tool docs with examples and edge cases; apply **poka-yoke** — design the tool so misuse is hard.
- Test extensively. In Anthropic's multi-agent system, a **tool-testing agent that rewrote flawed tool descriptions produced a 40% decrease in task completion time** for later agents.

Three core principles for agent success (Anthropic): **Simplicity**, **Transparency** (show the planning steps explicitly), and a well-crafted **ACI**.

---

## 9. One-paragraph summary to carry into parts 02–08

Start with a single, well-engineered **LLM call** + good prompt/retrieval. If the task has fixed, knowable steps → build a **workflow** (chaining / routing / parallelization). If the path is genuinely unpredictable and needs runtime decisions → build a **single agent** with tools in a loop (the perceive→plan→act→observe loop, instantiated as ReAct). Only when a single agent is overloaded (>~15 distinct tools, tool overlap, sprawling branching) **and** the task is high-value, parallelizable, and exceeds one context window → go **multi-agent** (manager or handoff). The agentic property that promotes each rung is **dynamic control flow**; the gate that stops you climbing too far is the **~15× token cost** and the **new coordination failure modes** that MAST documents. At every rung, complexity must clearly pay off.

---

## Sources

- Building Effective Agents — Anthropic Engineering — https://www.anthropic.com/engineering/building-effective-agents
- How we built our multi-agent research system — Anthropic Engineering — https://www.anthropic.com/engineering/multi-agent-research-system
- Anthropic: How we built our multi-agent research system (summary w/ token-multiplier & 90.2% quotes) — Simon Willison — https://simonwillison.net/2025/Jun/14/multi-agent-research-system/
- A practical guide to building agents (PDF) — OpenAI — https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf
- A practical guide to building agents (Markdown mirror, used for exact quotes) — https://gist.github.com/testy-cool/86cafd426ba22e3e8c1d6d2c853506c4
- A practical guide to building agents (landing) — OpenAI — https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/
- ReAct: Synergizing Reasoning and Acting in Language Models — Yao et al., arXiv:2210.03629 — https://arxiv.org/abs/2210.03629
- ReAct paper PDF — https://arxiv.org/pdf/2210.03629
- ReAct: Synergizing Reasoning and Acting in Language Models — Google Research blog — https://research.google/blog/react-synergizing-reasoning-and-acting-in-language-models/
- Workflows and Agents (tutorial, implements Anthropic's patterns) — LangGraph docs — https://langchain-ai.github.io/langgraph/tutorials/workflows/
- Google "Agents" Whitepaper (definition + Model/Tools/Orchestration cognitive architecture; summary) — https://medium.com/@penkow/summary-of-googles-ai-white-paper-agents-d5670ae495c9
- Why Do Multi-Agent LLM Systems Fail? (MAST taxonomy) — Cemri, Pan, Yang et al., arXiv:2503.13657 — https://arxiv.org/abs/2503.13657
- MAST taxonomy repo — https://github.com/multi-agent-systems-failure-taxonomy/MAST
