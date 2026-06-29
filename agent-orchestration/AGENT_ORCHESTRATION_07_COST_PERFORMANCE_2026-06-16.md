# Cost, Performance & Economics of Multi-Agent Systems

*When is fanning out across many agents worth the token bill - and how do you stop it running away?*

> Research/reference doc · 2026-06-16 · part of the Agent Orchestration suite

This is part 07 of an 8-part suite. It focuses on the **money and latency** of multi-agent systems: what they cost, when the cost is justified, and the concrete levers (tiering, caching, batching, budget caps) that bring the bill down without losing quality.

---

## 1. The headline number: ~15× a chat

Anthropic's own production research-agent measurements anchor the whole discussion. On the same scale:

```
chat (1×)  →  single agent (~4×)  →  multi-agent (~15×)
            tool use & loops      parallel fan-out + per-subagent context
```

- "Multi-agent systems use about **15× more tokens** than chats." (Anthropic)
- "Agents typically use about **4× more tokens** than chat interactions." (Anthropic)

So most of the multiplier is *spending more total tokens on purpose* - every subagent runs its own context window, its own tool calls, and its output is (often) reprocessed by the orchestrator.

### What actually drives performance

In Anthropic's eval, **three factors explained 95% of performance variance**:

| Factor | Share of variance |
|---|---|
| Total token usage | ~80% |
| Number of tool calls | ~10% |
| Model choice | ~5% |

**Takeaway:** outcomes are dominated by *how much thinking/searching you spend*, not by clever topology. Multi-agent architecture is mostly a way to **spend more tokens productively in parallel** - it does not conjure quality from a fixed budget.

### The economic gate

> "These architectures burn through tokens fast. For economic viability, multi-agent systems require tasks where the value of the task is high enough to pay for the increased performance." - Anthropic

Token cost is typically the single largest line item in a production agentic system. An unconstrained agent can cost **$5–$8 per task** to solve a single software-engineering issue (Stevens). A single agentic task can fan out to hundreds of model calls and exceed 1M tokens.

> **Verification flag:** Third-party overhead estimates (≈58% overhead for decentralized, ≈285% for centralized supervisors that reprocess everything) are illustrative secondary-source figures, not Anthropic measurements. Use them for intuition only.

---

## 2. When multi-agent is worth it - and when it's waste

### Worth it

> "Multi-agent systems excel at valuable tasks that involve heavy parallelization, information that exceeds single context windows, and interfacing with numerous complex tools." - Anthropic

> "Multi-agent research systems excel especially for **breadth-first queries** that involve pursuing multiple independent directions simultaneously." - Anthropic

The repeatedly-named economic sweet spot is **high-value research**: legal due diligence, competitive/market intelligence, biomedical literature review. Each subagent's own context window effectively multiplies usable context and enables true parallel exploration.

### Poor fit / waste

> "Most coding tasks involve fewer truly parallelizable tasks than research, and LLM agents are not yet great at coordinating and delegating to other agents in real time." - Anthropic

Poor fits: **coding**, real-time coordinated work, and any task where subtasks share state or depend on each other's intermediate results (handoffs lose fidelity).

### Counter-evidence: single agent can win even on hard tasks

A controlled study (arXiv 2604.02460) found that **single-agent LLMs outperform multi-agent systems on multi-hop reasoning under *equal* thinking-token budgets** (HotpotQA, MuSiQue). Mechanisms of waste:

- **Redundant reasoning** - agents independently re-solve the same subproblems.
- **Coordination overhead** - orchestration messages cost tokens and add no reasoning.
- **"Context rot"** - information degrades across handoffs; a single focused agent keeps better contextual coherence on interdependent chains.

> **The rule this gives you:** multi-agent pays off only when you're willing to spend *more* total tokens to buy parallelism/breadth - **not** as a way to get more out of a *fixed* budget. Under a constrained budget on interdependent reasoning, consolidate into one agent.

### The distractor-domain nuance (LangChain benchmark)

| Condition | Single agent | Multi-agent |
|---|---|---|
| 0–1 distractor domains | slightly **better**, far cheaper | unnecessary overhead |
| 2+ distractor domains | accuracy **falls off sharply** | accuracy holds; token use stays **flat** |

Single-agent token use climbs with context bloat as irrelevant domains accumulate; supervisor/swarm token use stays flat. Multi-agent's efficiency edge appears **specifically under high irrelevant-context / many-domain conditions**.

---

## 3. Latency vs. throughput

**Core tension:** parallel fan-out cuts wall-clock time but raises total token cost; deep hierarchies and reflection loops add serial latency.

| Pattern | Approx. wall-clock |
|---|---|
| Single LLM call | ~800 ms |
| Orchestrator-worker + Reflexion loop | ~10–30 s |
| 3-level hierarchy (2 s/level) | **≥6 s before any worker even starts** |

```
SERIAL (latency stacks)            PARALLEL (latency = longest path)
orchestrator ─┐                     orchestrator ─┬─ subagent A ─┐
              ↓                                   ├─ subagent B ─┤→ synthesize
           subagent ─┐                            └─ subagent C ─┘
                     ↓
                  sub-subagent
critical path = SUM of stages       critical path = MAX single path
```

- Anthropic's lead agent "spins up **3–5 subagents in parallel** rather than serially; the subagents use **3+ tools in parallel**. These changes **cut research time by up to 90%** for complex queries."
- LangGraph framing: parallelism reduces critical-path latency from the *sum* of agent times to the *max* path through the dependency graph.
- **Compounding cost warning:** "a Reflexion loop that runs for 10 cycles can consume **50× the tokens** of a single linear pass" (Stevens).

> **Rule of thumb:** parallel fan-out trades money for wall-clock time - use it when latency matters and the task is genuinely parallel. Avoid deep serial hierarchies and unbounded reflection loops when cost matters.

---

## 4. Model tiering - strong orchestrator, cheap workers

Anthropic's production config: **Claude Opus** as lead/orchestrator + **Claude Sonnet** subagents.

> "Multi-agent system with Claude Opus 4 as the lead agent and Claude Sonnet 4 subagents **outperformed single-agent Claude Opus 4 by 90.2%** on our internal research eval." - Anthropic

And a key spending heuristic:

> "Upgrading to Claude Sonnet 4 is a larger performance gain than doubling the token budget on Claude Sonnet 3.7." - Anthropic

**General principle:** route smaller / specialized / high-volume subtasks to cheaper models (Haiku, open-source), reserve the frontier model for orchestration and final synthesis. **Spend on a better model before spending on more tokens.**

### Reference pricing (per million tokens, standard sync rates)

| Model | Input | Output |
|---|---|---|
| Opus (4.x) | $5.00 | $25.00 |
| Sonnet (4.x) | $3.00 | $15.00 |
| Haiku (4.5) | $1.00 | $5.00 |

> **Verification flag:** Exact per-model prices are time-sensitive - confirm against Anthropic's live pricing page before relying on them. The durable point is the **ratio**: Haiku input is ≈1/5 the cost of Opus input. That ratio is what makes worker-tiering pay.

---

## 5. Prompt caching & batching - the biggest levers

### Prompt caching

| Operation | Multiplier vs. standard input | Effect |
|---|---|---|
| Cache write (5-min TTL) | 1.25× | small premium to write |
| Cache write (1-hour TTL) | 2.0× | larger premium, longer life |
| **Cache read / hit** | **0.10×** | **90% discount** |

Applied to Sonnet ($3 base input): write costs $3.75 (5-min) or $6.00 (1-hr); a **hit costs $0.30**. Caching reduces input cost ~90% and latency ~75%.

**Why it's the #1 lever in fan-out systems:**
- An orchestrator spawning ~50 workers that share the same prefix (system prompt, task brief, tool definitions, shared corpus) pays full price once and ~10% thereafter - caching "effectively eliminates the redundancy penalty."
- **Cached tokens do not count toward ITPM rate limits** → 5–10× effective throughput. This rate-limit exemption is often more valuable than the cost saving itself.
- Anthropic calls prompt caching "the single highest-ROI optimization available" for reused-context workloads. Example RAG pipeline: **$150/day → ~$22/day (−85%)**.

### Batch API (Message Batches)

- **50% discount on both input AND output**, all Claude models, in exchange for async completion (up to 24h).
- Sonnet batched: **$1.50 input / $7.50 output**.
- Use for latency-tolerant work: overnight research sweeps, bulk subagent jobs. **Not** for interactive orchestration.

### Stacking

Caching (−90% input) and batch (−50%) reportedly compound - a corpus/RAG pipeline can bill at **~5% of base rate card** (~95% total reduction).

> **Verification flag:** Stacking to ~5% of rate card is asserted by secondary sources (codewords / aicostcheck), **not** confirmed on Anthropic's own pricing page. Verify before stating as fact in customer-facing material.

---

## 6. Concurrency & rate limits

Anthropic enforces **three dimensions per model class**, via a **token-bucket** algorithm (continuous replenishment, not a fixed-window reset):

- **RPM** - requests per minute
- **ITPM** - input tokens per minute
- **OTPM** - output tokens per minute

### Usage tiers (deposit-gated; approximate)

| Tier | Entry | ~RPM |
|---|---|---|
| Free | - | ~5 |
| 1 | $5 | ~50 |
| 2 | - | ~1,000 |
| 3 | - | ~2,000 |
| 4 | $400+ | ~4,000 |

Tier 4 is also cited around ~2,000,000 ITPM / ~400,000 OTPM for Sonnet/Opus 4.x.

> **Verification flag:** All tier RPM/TPM numbers are time-sensitive - check Anthropic's live rate-limits doc.

### Error handling

- **429 `rate_limit_error`** = a tier limit was exceeded; the response carries a `retry-after` header (seconds).
- **529** = service overload (different cause; back off and retry).

**Multi-agent guidance:** fan-out hammers rate limits faster than anything else. When throttled:
1. **Reduce client-side concurrency** so the next minute doesn't also fail.
2. If you keep hitting it, "you have a capacity problem that retries will not fix - upgrade tier, enable prompt caching, or shed load."

> **Rule of thumb:** size max-concurrent-subagents to your tier's **ITPM/OTPM, not just RPM**; add exponential backoff + jitter on 429; cap fan-out width; cache the shared prefix to lift effective throughput.

---

## 7. Cost-control patterns

### A. Scale effort to query complexity (prompt the budget in)

Agents can't reliably self-judge effort, so the budget must be **prompted in**. Anthropic's embedded scaling rules:

| Query type | Agents | Tool calls |
|---|---|---|
| Simple fact-finding | 1 | 3–10 total |
| Direct comparison | 2–4 subagents | 10–15 each |
| Complex research | 10+ subagents | divided responsibilities |

Purpose: "prevent overinvestment in simple queries, which was a common failure mode in our early versions."

### B. Runtime budget guardrails

```
per-call token count → running total → enforce hard limits
                                       ├─ warn at threshold
                                       └─ reject above limit / dollar cap
```

Given execution state + observed usage + expected remaining work, decide: **continue · narrow · degrade · reroute · escalate · stop.** Detect **low-yield loops** (repeated retrieval retries, premium-model calls that don't reduce uncertainty) and cut that path's budget. Set caps at **agent / workflow / org** levels with hard **dollar caps** per task/run.

### C. Dynamic turn limits / early exit

"Dynamic turn limits based on the probability of success can cut costs by **24%** while maintaining solve rates" (Stevens) - stop iterating once the marginal confidence gain flattens.

### D. Loop-until-dry, but bounded

Let agents work until no new useful information appears ("dry") - but always bound by **max iterations + token/dollar cap + timeout**, so a stuck loop can't trigger the 50×-tokens reflection-loop blowup.

### E. Pass references, not payloads

> Subagents "store their work in external systems, then pass lightweight references back to the coordinator." - Anthropic

Avoid copying large outputs through conversation history. Summarize completed phases into external memory before continuing when context fills. Retrieval from cached plans can drop latency "from 30 seconds to 300 ms and reduce cost to near zero."

### F. Architecture-level savings (LangChain benchmark)

Removing handoff messages and using **direct message/tool forwarding** - letting a worker's output pass through verbatim instead of the supervisor regenerating/paraphrasing it - gave a **~50% performance increase** and cut the supervisor's "translation" token tax. The supervisor pattern is the most general but consistently costs more than a swarm unless you apply these forwarding optimizations.

---

## 8. Rules of thumb (consolidated)

1. **Default to a single agent.** Reach for multi-agent only for high-value, breadth-first, parallelizable tasks that exceed one context window or need many tools.
2. **Don't use multi-agent to stretch a fixed budget** on interdependent reasoning - under equal budgets a single agent wins (context rot kills handoffs).
3. **Spend follows value:** budget ≈ 15× a chat. Only justified when outcome value clears that bar.
4. **Tier models:** strong orchestrator + cheap workers; upgrading the model can beat doubling tokens.
5. **Cache the shared prefix** (system prompt, brief, tool defs, corpus) - 90% input discount, ~75% latency cut, and exempt from ITPM. Highest-ROI lever in fan-out.
6. **Batch latency-tolerant work** for another 50% off; caching + batch reportedly compound.
7. **Bound everything:** max subagents, max tool calls, max turns/iterations, per-task dollar cap, timeout.
8. **Match concurrency to ITPM/OTPM, not RPM;** backoff + jitter on 429; cache to lift effective throughput.
9. **Pass references, not payloads;** forward worker output verbatim; summarize to external memory.
10. **Early-exit on diminishing returns** (dynamic turn limits ≈ −24% cost at equal solve rate).

---

## 9. Cost/benefit decision checklist

**Use multi-agent when *most* are true:**

- [ ] Task value absorbs ~15× chat token cost (due diligence, competitive/market intel, biomedical lit review).
- [ ] Work decomposes into **independent, parallel** strands (breadth-first), not a tightly coupled chain.
- [ ] Required information **exceeds a single context window**, or the task spans many domains / many tools.
- [ ] Wall-clock latency matters and parallel fan-out meaningfully shortens it.
- [ ] You can supply a **strong orchestrator + cheaper workers** without losing quality at synthesis.
- [ ] A large **reusable shared context** exists to cache (system prompt, brief, corpus, tool defs).
- [ ] Your tier's ITPM/OTPM can sustain the planned concurrency (or you'll cache / batch / upgrade).
- [ ] You can enforce **hard caps** (subagent count, tool calls, turns, dollars, timeout) and early-exit.

**Prefer a single agent when:**

- [ ] Budget is fixed and the task is **interdependent multi-hop reasoning** (single agent wins under equal budget).
- [ ] Task is **coding** or real-time coordinated work.
- [ ] There are **0–1 relevant domains** / low distractor context (single agent matches or beats, far cheaper).
- [ ] Outcome value can't justify the token multiple.

---

## Sources

- Anthropic Engineering - How we built our multi-agent research system - https://www.anthropic.com/engineering/multi-agent-research-system
- LangChain - Benchmarking Multi-Agent Architectures - https://www.langchain.com/blog/benchmarking-multi-agent-architectures
- LangChain Docs - Subagents (multi-agent) - https://docs.langchain.com/oss/python/langchain/multi-agent/subagents
- The Hidden Economics of AI Agents: Token Costs and Latency Trade-offs (Stevens Online) - https://online.stevens.edu/blog/hidden-economics-ai-agents-token-costs-latency/
- Single-Agent LLMs Outperform Multi-Agent Systems on Multi-Hop Reasoning Under Equal Thinking Token Budgets (arXiv) - https://arxiv.org/pdf/2604.02460
- Finout - Anthropic API Pricing 2026 (caching multipliers, batch, per-model rates) - https://www.finout.io/blog/anthropic-api-pricing
- codewords.ai - Anthropic Batch API: 50% cost - https://www.codewords.ai/blog/anthropic-batch-api
- AI Cost Check - Prompt Caching Savings: OpenAI vs Anthropic - https://aicostcheck.com/blog/ai-prompt-caching-cost-savings
- Anthropic API Docs - Rate limits - https://docs.anthropic.com/en/api/rate-limits
- Respan - Anthropic API Rate Limits + 429/529 Handling Guide (2026) - https://www.respan.ai/articles/anthropic-api-rate-limits
- DevTk.AI - AI API Rate Limits 2026 (RPM, TPM, 429) - https://devtk.ai/en/blog/ai-api-rate-limits-comparison-2026/
- Oracle Blogs - Runtime Budget Guardrails for Agentic AI - https://blogs.oracle.com/ai-and-datascience/runtime-budget-guardrails-agentic-ai
- Maisa AI - Agentic AI Cost Control - https://maisa.ai/agentic-insights/agentic-ai-cost-control/
- Portal26 - AI Agent Cost Control - https://portal26.ai/ai-agent-cost-control-stop-agents-burning-budget/
- DataRobot - Balancing cost and performance: Agentic AI development - https://www.datarobot.com/blog/cut-agentic-ai-development-costs/
- Introl - Prompt Caching Infrastructure (cost/latency reduction guide 2025) - https://introl.com/blog/prompt-caching-infrastructure-llm-cost-latency-reduction-guide-2025
- decodethefuture - Multi-Agent Systems Explained: 2026 Patterns - https://decodethefuture.org/en/multi-agent-systems-explained/
- ByteByteGo - How Anthropic Built a Multi-Agent Research System - https://blog.bytebytego.com/p/how-anthropic-built-a-multi-agent
