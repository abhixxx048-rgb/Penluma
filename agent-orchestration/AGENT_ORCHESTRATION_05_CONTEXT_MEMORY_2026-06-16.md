# Context Engineering & Memory for Agents

*How to spend a finite attention budget: curate the smallest high-signal token set, offload the rest, and cache the stable prefix.*

> Research/reference doc · 2026-06-16 · part of the Agent Orchestration suite

---

## 0. The one idea this doc is built on

More context is not free, neutral, or harmless. It costs **money**, adds **latency**, and - past a point - **degrades accuracy**. The discipline of context engineering is finding *"the smallest set of high-signal tokens that maximize the likelihood of your desired outcome"* (Anthropic).

Four recurring tactics organize everything below. Manus names these dimensions explicitly; they map cleanly onto the rest of this doc:

| Tactic | What it does | Sections |
|---|---|---|
| **Reduce** | Shrink what's in the window (compaction, tool-result clearing, summarization) | §4 |
| **Offload** | Move state out of the window (files, memory tool, vector store, scratchpads) | §5, §6, §9 |
| **Retrieve just-in-time** | Keep identifiers, load data at runtime via tools | §7 |
| **Isolate** | Give subtasks their own clean window | §8 |

A fifth lever - **caching** - is orthogonal: it doesn't reduce the tokens the model sees, but it slashes the cost/latency of the *stable prefix*, which rewards append-only, byte-stable context design (§10).

---

## 1. The context window as a scarce budget

Anthropic frames context as a *"finite resource with diminishing marginal returns."* Like a human's limited working memory, an LLM has an **attention budget** that depletes with every token added.

**Why it's mechanical, not a soft preference.** Transformer attention computes over **n² pairwise relationships** between tokens. As the sequence grows, a fixed attention capacity is spread across more relationships, so focus on any individual token weakens. The governing tension: *more context length ⇄ less attention focus.*

**The stakes, in tokens.** Token usage is the dominant lever on both cost and quality:

- Agents use **~4× more tokens** than a chat interaction.
- Multi-agent systems use **~15× more tokens** than a chat.
- In Anthropic's BrowseComp evaluation, **token usage alone explained 80% of the performance variance** (tool calls and model choice explained the rest).

The practical restatement, applied to every component of the payload (system prompt, tools, examples, history): keep it **"informative, yet tight."**

---

## 2. Context rot / lost-in-the-middle

**Context rot** (Anthropic): *"As the number of tokens in the context window increases, the model's ability to accurately recall information from that context decreases."* This is measured degradation, not just hitting a hard limit.

### The empirical backbone - Chroma "Context Rot" (2025)

Chroma tested **18 frontier LLMs** across four labs (Claude, OpenAI, Gemini, Qwen) on extended Needle-in-a-Haystack variants, LongMemEval (~113k-token conversational Q&A), and a "Repeated Words" task. Headline: *"Models do not use their context uniformly; instead, their performance grows increasingly unreliable as input length grows."* **Every model degraded at every input-length increment tested.**

| Finding | Detail |
|---|---|
| **Needle–question similarity matters** | Lower semantic similarity between the question and the target fact degrades faster as context grows. |
| **Distractors compound** | *"Even a single distractor reduces performance relative to the baseline (needle only), and adding four distractors compounds this degradation further."* |
| **Haystack structure (counterintuitive)** | Models do *worse* when surrounding text has coherent logical flow; **shuffling** the haystack (removing local coherence) **improved** performance. |
| **Position effects** | In Repeated Words, accuracy is highest when the unique token sits near the **beginning** - classic lost-in-the-middle. |
| **LongMemEval gap** | Large accuracy drop between focused prompts (~300 tokens) and full prompts (~113k tokens), across all model families. |

Central conclusion: *"What matters more is how that information is presented"* than its mere presence.

### The foundational paper - "Lost in the Middle" (Liu et al., 2023; TACL 2024)

Varying the **position** of the relevant fact in multi-document QA and key-value retrieval produces a **U-shaped curve**: accuracy is highest when the relevant info is at the **beginning or end**, and degrades significantly (often **>30%**) when it's in the **middle** - *"even for explicitly long-context models."*

Later (2025) refinements: the U-shape holds mainly when the context is **< 50% full**; above ~50% full, degradation is by **distance from the end** (recency bias: recent > middle > early). Degradation also shows up on broader, more complex task types with **far fewer tokens** than needle tasks need.

**Mechanism, in one line:** quadratic attention dilution - as softmax attention spreads over a long sequence, signal-to-noise drops and salient mid-context tokens get drowned out.

**Design implications:** put the most load-bearing instructions at the **start or end** of the window; minimize distractors; don't assume a long-context model "just handles it."

---

## 3. Context engineering vs prompt engineering

| | Prompt engineering | Context engineering |
|---|---|---|
| Definition | *"Writing and organizing LLM instructions for optimal outcomes"* | *"Strategies for curating and maintaining the optimal set of tokens (information) during LLM inference, including all the other information that may land there outside of the prompts"* |
| Scope | Words/phrasing of one prompt | The whole inference-time payload: system prompt, tools, examples, history, retrieved data, tool outputs, memory |
| Cadence | One-time authoring act | **Iterative curation**, *"each time we decide what to pass to the model"* |

Context engineering is *"the natural progression of prompt engineering."*

### The "right altitude" principle (system-prompt design)

Aim between two failure modes:

1. **Too specific** - *"hardcoding complex, brittle logic"* → fragile.
2. **Too vague** - *"high-level guidance that fails to give the LLM concrete signals."*

Best prompts are *"specific enough to guide behavior effectively, yet flexible enough to provide the model with strong heuristics."* Structure with **XML tags or Markdown headers**; target the *"minimal set of information that fully outlines your expected behavior."*

**Method:** start with the best model + a minimal prompt, then add instructions/examples *to patch observed failure modes* - not speculatively.

### Tools and examples

- **Tools** should be self-contained, token-efficient, and minimally overlapping. *"If a human engineer can't definitively say which tool should be used in a given situation, an AI agent can't be expected to do better."* Avoid bloated tool sets with ambiguous decision points.
- **Few-shot examples**: don't stuff edge cases. Curate *"a set of diverse, canonical examples that effectively portray the expected behavior"* - for an LLM, *"examples are the 'pictures' worth a thousand words."* (But beware mimicry - see §9.)

---

## 4. Compaction & summarization (Reduce)

**Compaction** (Anthropic): when a conversation nears the context limit, **summarize and reinitialize** with a compressed summary. Pass the message history back to the model to compress; *"the model preserves architectural decisions, unresolved bugs, and implementation details while discarding redundant tool outputs or messages."*

**Tuning method:** maximize **recall first** (capture every relevant detail), then iterate on **precision** (cut superfluous content).

**Cheapest variant - tool-result clearing:** drop raw tool outputs once their results are recorded. The lightest form of compaction; the cleared content is *removed*, not summarized.

### Productized on the Claude Developer Platform (Sonnet 4.5+ launch; public beta, also on Amazon Bedrock and Google Vertex AI)

| Feature | What it does |
|---|---|
| **Context editing** | Automatically clears stale tool calls/results as the model approaches the token limit, keeping recent ones and preserving relevant state. (Prunes - distinct from compaction's summarize.) |
| **Memory tool** (file-based) | Stores/retrieves knowledge **outside** the window, persisting across sessions. |

Reported internal results:

- Context editing alone: **+29%** on agentic search.
- Context editing + memory tool: **+39%**, plus an **84% reduction in token consumption** across 100-turn evaluations.

> On the API, server-side compaction is a beta (`compact-2026-01-12`) on Fable 5 / Opus 4.8 / 4.7 / 4.6 / Sonnet 4.6: the API summarizes earlier context as it nears a trigger threshold (default ~150K tokens) and returns a **compaction block** you must append back (the full `response.content`, not just the text) - extracting only the text silently loses the compaction state.

**Cognition's note:** for truly long tasks, introduce a dedicated LLM whose sole job is to **compress action/conversation history into key details, events, and decisions.**

---

## 5. Memory tiers

### Short-term (working) vs long-term (persistent) - LangChain/LangGraph

| Aspect | Short-term (working) | Long-term (persistent) |
|---|---|---|
| Scope | **Thread-scoped** - one conversation/session | **Across sessions**, shared across threads |
| Contents | Message history + stateful data (uploaded files, retrieved docs, generated artifacts) | User-/app-level facts, past experiences, learned rules |
| Storage | Agent **state**, persisted via a **checkpointer** so a thread can resume | JSON docs in a **store** (`BaseStore`), under a **namespace** (folder) + **key** (filename); supports semantic search + filtering |
| Management | **Trimming / summarization** (full history may not fit) | Recalled on demand in any thread |

### Long-term subtypes (the human analogy: facts / experiences / rules)

| Type | Definition | Agent use | LangGraph realization |
|---|---|---|---|
| **Semantic** | Specific **facts and concepts** | Personalization; user facts & preferences | Stored facts/profile docs |
| **Episodic** | Recalling **past events/actions** (with metadata: timestamps, participants) | Remember *how* a task was accomplished via concrete examples | Stored interaction examples / few-shot history |
| **Procedural** | The **rules / how-to** (generalized skills & behaviors) | Govern the agent's behavior | Often the **system prompt/instructions**, self-updated over time |

### When memories are written

- **Hot path** (during runtime): immediately usable, but adds complexity and **latency**.
- **Background** ("subconscious"): a separate process forms memories - **no latency** in the main loop, but you must decide **when to trigger** formation.

(LangMem layers these three types on top of LangGraph's `BaseStore`.)

**Connecting the vocabularies:** long-term memory is the *store*; context engineering decides *what to page into the window* and *when*. The store is large and persistent; the window is small and budgeted.

---

## 6. External memory stores (Offload)

**Structured note-taking / agentic memory** (Anthropic): agents write persistent notes **outside the context window** and pull them back later. This lets agents *"track progress across complex tasks, maintaining critical context and dependencies that would otherwise be lost across dozens of tool calls."*

- Example - Claude playing Pokémon keeps precise tallies across thousands of steps: *"for the last 1,234 steps I've been training my Pokémon in Route 1, Pikachu has gained 8 levels toward the target of 10."*
- `CLAUDE.md`-style files are an example of memory dropped naively into context up front.

**Manus - "filesystem as the ultimate context":** treat the file system as memory that is *"unlimited in size, persistent by nature, and directly operable by the agent."* Critical rule - **compression must be restorable:**

> Drop the webpage *content* but keep the **URL**; omit a document's *text* but keep its **file path**. Nothing is irreversibly lost while in-context tokens shrink.

**Three external-memory substrates** seen across sources:

| Substrate | Recall mode | Examples |
|---|---|---|
| **Vector DBs** | Semantic recall | LangGraph `BaseStore` (JSON + namespaces + semantic search) |
| **Files / scratchpads** | Path/name lookup | Anthropic memory tool, Manus filesystem, `todo.md` |
| **Structured state objects** | Checkpointed | LangGraph thread state via checkpointer |

---

## 7. RAG vs agentic search / just-in-time retrieval

| | Pre-retrieval (traditional RAG) | Just-in-time (agentic search) |
|---|---|---|
| When | Embed + fetch chunks **up front**, before inference | Agent loads data **at runtime** via tools as it reasons |
| What's in context | The fetched chunks | **Lightweight identifiers** (file paths, stored queries, web links) |
| Speed | Faster (pre-computed) | Slower (runtime exploration) |
| Exemplar | Classic RAG pipeline | **Claude Code** - targeted queries, `head`/`tail`/`grep` over large data *without loading full objects* |

**Metadata is signal.** *"Folder hierarchies, naming conventions, and timestamps all provide important signals"* guiding what to load and when.

**The trade-off and the winner.** Runtime exploration is slower than pre-computed retrieval; a **hybrid** (some upfront retrieval + autonomous exploration) often wins.

**Where the field is going (2025 agentic-RAG survey).** From **static, rule-based** pipelines toward **dynamic, reasoning-driven** ones that embed retrieval *decisions into the reasoning loop* - the model decides **when, what, and how** to retrieve (ReAct, Self-Ask, Search-o1 interleave generation with retrieval; RL-trained tool-invocation policies). Traditional RAG struggles with multi-step investigative queries that need reasoning, not just fact lookup. **Open problem:** agentic retrieval can over-call tools (redundant retrievals); the research direction is **adaptive retrieval** that fires only when the model's internal knowledge is insufficient.

---

## 8. Sub-agent context isolation (Isolate)

**Anthropic's multi-agent research system** (orchestrator-worker): a **lead agent** plans, **spawns 3–5 specialized subagents in parallel**, then synthesizes (with a separate citation pass).

**Each subagent has its own context window.** *"Subagents facilitate compression by operating in parallel with their own context windows, exploring different aspects of the question simultaneously before condensing the most important tokens for the lead research agent."*

- **Separation of concerns** - distinct tools, prompts, trajectories - *"reduces path dependency and enables thorough, independent investigations."*
- The **detailed search context stays isolated inside subagents**; only a **condensed, distilled summary (often 1,000–2,000 tokens)** returns to the lead.
- **Why it works:** the system can reason over **more aggregate context than a single window can hold**; ideal for **breadth-first** queries needing many independent paths (e.g., "identify all board members of IT companies in the S&P 500").

**Performance & economics.** Multi-agent (Opus 4 lead + Sonnet 4 subagents) **outperformed single-agent Opus 4 by 90.2%** on the internal research eval - at **~15× the tokens of a chat**. Only worth it for **high-value, heavily parallelizable** tasks where info exceeds a single window and tools are numerous/complex. The lead **saves its plan to Memory** because *"if the context window exceeds 200,000 tokens it will be truncated"* - it retrieves the plan rather than losing work.

### Counterpoint - Cognition, "Don't Build Multi-Agents"

> Multi-agent setups are **fragile**: subagents lack context of each other's work, decisions get dispersed, and failures *"boil down to missing context."*

- Recommends **single-threaded, linear agents** with **continuous context**.
- The **"single-writer" principle**: keep **writes/actions single-threaded**; extra agents contribute **intelligence (read-only analysis), not actions**.
- For long tasks, use a dedicated **history-compression model** rather than parallel writers.

```
            ┌──────────────────────────────────────────────────────┐
            │  WHEN ISOLATION HELPS vs HURTS                         │
            ├──────────────────────────────────────────────────────┤
            │  Independent + read-mostly    →  isolate (Anthropic)   │
            │  (breadth-first research,        clean windows win     │
            │   parallel investigations)                             │
            │                                                        │
            │  Shared state / coordinated   →  single-thread         │
            │  writes / dependencies           (Cognition)           │
            │  (refactors, write-heavy         continuous context    │
            │   pipelines)                     wins                  │
            └──────────────────────────────────────────────────────┘
```

**Reconciliation:** isolation helps when subtasks are **independent and read-mostly**; it hurts when they must **share state or coordinate writes**.

---

## 9. Structured note-taking / state files

Beyond §6's "offload to survive dozens of tool calls," Manus surfaces three sharper tactics:

**Recitation to steer attention.** Maintain a **`todo.md`**, continuously rewritten with items checked off. This *"recites objectives into the end of the context"* - pushing goals into the model's **most recent attention span** and countering drift / lost-in-the-middle over long runs (Manus averages **~50 tool calls** per task).

> ⚠️ Caveat: an early naive version spent **~one-third of all actions** just updating the todo list. Structure note-taking to be cheap, and consider a dedicated planner.

**Keep errors in context.** Don't hide failed actions, retries, or stack traces. Seeing a failure lets the model *"implicitly update internal beliefs,"* shifting priors away from repeating the mistake - error recovery is *"one of the clearest indicators of true agentic behavior."*

**Avoid few-shot mimicry.** LLMs are *"excellent mimics"*; uniform repeated context makes agents fall into a brittle "rhythm." Inject **small structured variation** (alternate templates/phrasing/ordering) to break harmful pattern-copying. (This is the tension with §3's "curate canonical examples" - diversity matters as much as quality.)

---

## 10. Prompt caching to cut cost on stable prefixes

Caching doesn't reduce tokens the model processes - it reuses the **compute** for an unchanged prefix, slashing cost and latency.

### The one invariant

**Prompt caching is a prefix match. Any byte change anywhere in the prefix invalidates everything after it.** Render order is fixed: `tools` → `system` → `messages`. Keep stable content first; put volatile content (timestamps, per-request IDs, the incoming question) **after the last `cache_control` breakpoint**.

```
[ tools ]      ← most stable      ┐
[ system ]     ← stable           │  put breakpoint on the LAST block
[ messages ]   ← grows per turn   ┘  whose prefix is identical across requests
                                     never on volatile content
```

### Mechanics (authoritative facts)

| Knob | Value |
|---|---|
| Breakpoints per request | **Max 4** (`cache_control: {type: "ephemeral"}`) |
| Auto-caching | Top-level `cache_control` on `messages.create()` auto-places on the last cacheable block |
| Default lifetime | **5-minute** ephemeral cache (refreshed free on each use) |
| Optional lifetime | **1-hour** TTL (`"ttl": "1h"`), at higher write cost |
| Minimum cacheable prefix | **Model-dependent** - Opus 4.8/4.7/4.6/4.5 & Haiku 4.5: **4096 tokens**; Fable 5 / Sonnet 4.6 / Haiku 3.5: **2048**; Sonnet 4.5/4/3.7: **1024**. Shorter prefixes silently won't cache. |
| Lookback | Each breakpoint walks back **at most 20 content blocks** to find a prior entry |

### Pricing (multipliers on base input price)

| Operation | Multiplier |
|---|---|
| Cache **read** (hit) | **0.1×** base input (~90% cheaper than fresh input) |
| 5-min cache **write** | **1.25×** base input |
| 1-hour cache **write** | **2×** base input |
| Output tokens | unaffected |

**Break-even:** with 5-min TTL, two requests break even (1.25× + 0.1× = 1.35× vs 2× uncached); with 1-hour TTL you need ≥3 requests (2× + 0.2× = 2.2× vs 3× uncached). Reported real-world savings: input-token costs cut **~70–90%**, latency cut **up to ~85%** for long prompts.

### Manus corroboration - caching as a *design constraint*

KV-cache hit rate is *"the single most important metric for a production-stage AI agent."* With Manus's ~**100:1** input:output ratio, the prefix dominates cost; a cached vs uncached input is a **10× difference**. Cache-preserving practices (which align with everything else in this doc):

- Keep the **prompt prefix byte-stable** - a single changed token invalidates everything after it.
- **Avoid timestamps** in system prompts.
- Make context **append-only**.
- Use **deterministic JSON serialization** (stable key order).
- **Mask tools, don't add/remove them** - changing the tool list invalidates the cache *and* confuses the model. Use logit masking + consistent tool-name prefixes (`browser_`, `shell_`).

### Verifying hits

Check the response `usage`: `cache_creation_input_tokens` (written this request), `cache_read_input_tokens` (served from cache), `input_tokens` (uncached remainder, *after the last breakpoint*). Total prompt size = the sum of all three. If `cache_read_input_tokens` is **zero** across repeated identical-prefix requests, a silent invalidator is at work (`datetime.now()` in the system prompt, unsorted JSON, a varying tool set) - diff the rendered prompt bytes between two requests.

---

## 11. Putting it together - a decision checklist

1. **Is the context near the window limit?** → **Reduce**: tool-result clearing first (cheapest), then compaction (maximize recall, then precision).
2. **Does state need to outlive the window or the session?** → **Offload** to files/memory tool/vector store. Make compression **restorable** (keep the path/URL).
3. **Is the data large but only partially needed?** → **Retrieve just-in-time** over identifiers (agentic search) rather than stuffing it up front.
4. **Are subtasks independent and read-mostly?** → **Isolate** in subagents with clean windows. If they share state or coordinate writes → keep a single writer (Cognition).
5. **Always, orthogonally:** design the prefix to be **append-only and byte-stable** so the cache stays warm - it's the cheapest 10× you'll get.

Underneath all five: spend the attention budget on the **smallest high-signal token set**, and put the load-bearing tokens at the **start or end** of the window where the model actually attends.

---

## Sources

- Effective context engineering for AI agents - Anthropic - https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- How we built our multi-agent research system - Anthropic - https://www.anthropic.com/engineering/multi-agent-research-system
- Managing context on the Claude Developer Platform (context editing + memory tool) - Anthropic - https://www.anthropic.com/news/context-management
- Context Rot: How Increasing Input Tokens Impacts LLM Performance - Chroma - https://www.trychroma.com/research/context-rot
- Lost in the Middle: How Language Models Use Long Contexts (Liu et al.) - arXiv - https://arxiv.org/abs/2307.03172
- Lost in the Middle - ACL Anthology (TACL 2024) - https://aclanthology.org/2024.tacl-1.9/
- Memory overview - LangChain / LangGraph docs - https://docs.langchain.com/oss/python/concepts/memory
- LangMem SDK for agent long-term memory - LangChain blog - https://www.langchain.com/blog/langmem-sdk-launch
- Prompt caching - Claude API Docs - https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- Context Engineering for AI Agents: Lessons from Building Manus - https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus
- Don't Build Multi-Agents - Cognition - https://cognition.ai/blog/dont-build-multi-agents
- Reasoning RAG via System 1 or System 2: A Survey on Reasoning Agentic RAG (2025) - arXiv - https://arxiv.org/pdf/2506.10408
- AI Agents, RAG, and Agentic Retrieval Techniques for Enterprise-Grade Search - Kore.ai - https://www.kore.ai/blog/ai-agents-rag-agentic-retrieval
