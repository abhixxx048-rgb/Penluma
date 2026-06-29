# Applied: Agent Orchestration in Print-Flow-360

_How the orchestration patterns from this suite map onto the AI that actually ships in this codebase - and the realistic seams where multi-agent work could land._

> Research/reference doc · 2026-06-16 · part of the Agent Orchestration suite

---

## 0. Read this first

This is the **applied** chapter. Parts 01–07 covered the general theory (single-agent loops, orchestrator-worker, prompt chaining, evaluator-optimizer, routing, tool-use, evaluation). This part grounds all of that in `app/Services/AI/` as it exists today.

Two rules govern everything below:

1. **Code is ground truth, docs are intent.** `readme/AI_PRODUCT_BUILDER.md` and `readme/AI_PRODUCT_MODULE_CONTEXT.md` describe a catalog-*matcher* flow. The shipped code does **not** match a catalog - it *creates* products. Where doc and code disagree, the code wins and this doc says so.
2. **Nothing in §4 is built.** The opportunity mapping is research-only. No orchestration work has been done.

---

## 1. What AI ships today

All AI lives under `app/Services/AI/`. There are **7 AI/LLM consumers**, every one routed through a single shared runner. (The `AI_FEATURE_SOP.md` "registry" table is stale - it lists only `product_builder` and `seo_meta`; the code has five more.)

| Feature slug | Service chain | What it does | Backend |
|---|---|---|---|
| `product_builder` | `IntentParserService` → `AiProductBuilderOrchestrator` → `AiProductCreatorService` | NL prompt ("black hoodie") → full draft `Product` (sizes, options, pricing rule) saved as `INACTIVE` draft + designer URL | LLM JSON |
| `seo_meta` | `SeoMetaGeneratorService` (`SeoMetaContext`, `SeoMetaDto`) | Product name/desc → meta title, description, keywords | LLM JSON |
| `product_description` | `ProductDescriptionGeneratorService` | Generate / rewrite product copy | LLM JSON |
| `email_template` | `EmailTemplateGeneratorService` | Generate / improve HTML email body, preserves `{merge_tags}` | LLM raw text (`expectsJson:false`) |
| `designer_image_gen` | `DesignerImageGeneratorService` (`DesignerImageContext`) | LLM optimizes prompt → DALL-E / `gpt-image-1` → tenant S3 | LLM + OpenAI image API |
| `designer_design` | `DesignGeneratorService` (`DesignContext`) | LLM as "design director": picks layout *template* per page + words/colors/fonts; geometry owned by designer's `utils/aiDesignMapper.ts` | LLM JSON, `maxTokens:4000` |
| `background_removal` | `BackgroundRemovalService` | remove.bg API (not an LLM, but logged through the AI usage spine) | remove.bg |

Routes split by audience:

- **Admin AI** (`routes/api.php:678-687`): `/ai/status`, `/ai/product-builder`, `/ai/seo-meta`, `/ai/product-description`, `/ai/email-template`, `/ai/usage*`.
- **Designer/studio AI** (`routes/store-api.php:403-406` → `DesignerAiController`): `status`, `generate-image`, `generate-design`, `remove-background`.

**What does NOT exist today:** no support-triage AI, no chat/conversational agent, no content/blog pipeline. (Grep for `ticket`/`support` in `app/Services/AI` only hits the unrelated `Support/` JSON-helper namespace and code comments.)

---

## 2. The real architecture: one stateless runner, thin feature layers

The design is a clean **thin feature layer over a feature-agnostic runner**. Every call is **single-shot, single-turn, stateless** - one `system` prompt + one `user` message in, one completion out.

```
Controller (FormRequest → ... → successResponse)
        │
        ▼
  Per-feature Service / Orchestrator
        │  builds AiTaskRequest { feature, Context, maxTokens, expectsJson }
        ▼
  AiTaskRunner::run(AiTaskRequest): AiTaskResponse
        │  1. LlmManager resolves provider (per-tenant key)
        │  2. provider->complete($system, $user, $maxTokens)
        │  3. optional JsonExtractor::extract()
        │  4. write EXACTLY ONE ai_usage_logs row
        ▼
  AiTaskResponse  ──► orchestrator patches domain outcome
                       onto the SAME log row (forceFill->save)
```

### The components

- **`AiTaskRunner::run()`** (`app/Services/AI/AiTaskRunner.php`) - the single entry point. Resolves provider, calls `complete()`, optionally extracts JSON, and writes **exactly one** `ai_usage_logs` row (feature, provider, model, tokens, latency, confidence, status). Domain outcomes are *patched onto that same row* by each orchestrator rather than logged as new rows.
- **`LlmManager`** (`app/Services/AI/LlmManager.php`) - resolves the active provider from the **tenant's** `store_third_party_services` record via `ThirdPartyServiceFetcher::resolveAny(['anthropic','openai'], $storeId, activeOnly:true)`. **API keys are per-tenant, never `.env`.** Honors an `enable_debug_mode` flag that swaps in an inline **mock provider** returning canned product JSON (no credits spent). Throws plain-language "Go to Settings → Integrations" errors when unconfigured.
- **Providers** (`AnthropicProvider`, `OpenAiProvider`, `AbstractLlmProvider`) - minimal HTTP clients implementing `LlmProviderInterface::complete()`. Anthropic uses **`claude-sonnet-4-6`** (`config/ai.php`). Both send only `system` + a single `user` message.
- **Per-feature layer** - a `Context` (prompt builder: `getSystemPrompt()` + `buildUserMessage()`) + a `Dto` (lenient `fromArray()` that never throws on partial JSON) + an optional orchestrator + a thin controller + a Nuxt composable.

### Four facts that constrain orchestration (verified in code)

| # | Constraint | Evidence | Why it matters for orchestration |
|---|---|---|---|
| 1 | **No native tool-use / function calling** | grep `tools\|tool_use\|tool_choice\|function_call` in `app/Services/AI` = 0 hits | All "structured output" is prompt-and-parse JSON via `JsonExtractor`. Any orchestrator step that needs to call an internal function (catalog search, pricing calc) has no clean mechanism today. |
| 2 | **No prompt caching** | grep `cache_control` = 0 hits | Static system prompts (e.g. `ProductSystemContext`, ~146 lines of print-domain knowledge) are re-sent verbatim every call. Chained/looped flows pay full cost each step. |
| 3 | **No live-catalog injection** | `ProductSystemContext` is static domain knowledge only | The product *builder* invents a brand-new product; it does not retrieve-then-match. The documented `ProductMatcherService` is aspirational. |
| 4 | **`QUEUE_CONNECTION=sync`** | `config/queue.php:16` + `.env` | All AI runs **inline in the HTTP request**. Any multi-step or fan-out flow would block the request. This is the single biggest gating fact. |

### The most "agent-like" thing today

`DesignGeneratorService` is the closest existing precedent to a constrained agent: the LLM is boxed into an **allowlist** (`ALLOWED_TEMPLATES`, `ALLOWED_CONTENT`, palette/font validation) and is **never trusted for geometry** - layout math is owned by `aiDesignMapper.ts`. This "LLM proposes within a fixed vocabulary, host validates and renders" split is the guardrail pattern the rest of the system should copy before adding autonomy.

By contrast, the `AiProductBuilderOrchestrator` is *not* a multi-agent or LLM-loop orchestrator - it is a **sequential pipeline** (parse → create → patch log). Useful seam, but don't mistake the class name for genuine orchestration.

---

## 3. Mapping the suite's patterns onto this codebase

| Pattern (from parts 01–07) | Does it exist here? | Closest existing code |
|---|---|---|
| Single-shot completion | ✅ Everywhere | `AiTaskRunner::run()` |
| Sequential pipeline | ✅ (one case) | `AiProductBuilderOrchestrator` (parse→create→log) |
| Constrained "propose within vocabulary" | ✅ (one case) | `DesignGeneratorService` allowlists |
| Prompt chaining (output→input across calls) | ❌ | - |
| Orchestrator-worker (fan-out to specialists) | ❌ | - |
| LLM-as-router | ❌ | `IntentParserService` is the nearest seam |
| Evaluator-optimizer (generate→critique→retry) | ❌ | `sanitizePage`/`cleanPalette` are a mechanical, non-LLM precursor |
| Native tool-use | ❌ | blocked by constraint #1 |

---

## 4. Where orchestration could realistically help

Honest opportunities mapped to existing code. **None of this is built.** Each lists its real prerequisite.

### 4.1 Product Builder → true orchestrator-worker

**Today:** `product_builder` is one LLM call that *invents* a product.

**Opportunity:** the documented catalog-match design maps cleanly to **orchestrator-worker**. A lead step decides intent, then dispatches specialists:

```
IntentParser (lead)
   ├─► catalog retrieval/match worker   ← the MISSING ProductMatcherService
   ├─► pricing-rule worker
   └─► SEO + description workers         ← already exist as services
```

The existing per-feature services are already composable, and `AiProductBuilderOrchestrator.php` is the natural fan-out seam. **Best fit for native tool-use:** let the model call a `search_catalog` tool instead of prompt-stuffing the catalog.

> **When to use:** once stores have real catalogs and "match my existing product" beats "invent a new one."
> **When NOT to:** for the cold-start / empty-catalog tenant, invent-a-product is correct - don't force a matcher with nothing to match.
> **Prereq:** add tool-use to `AnthropicProvider::complete()` (currently text-only) + a multi-step request model + async (constraint #4).

### 4.2 Content/SEO chaining (chaining, not multi-agent)

**Today:** `SeoMetaGeneratorService`, `ProductDescriptionGeneratorService`, `EmailTemplateGeneratorService` are independent one-shot calls.

**Opportunity:** a **prompt-chaining pipeline** - *generate description → derive SEO meta from it → draft a launch email referencing it* - reuses all three under a thin coordinator. Low risk, high value for store-owner onboarding; could also drive the not-yet-existent CMS-block/blog content.

> **Prereq:** a 3-call chain is a multi-second blocking request under `QUEUE=sync`. Make it a queued job once Redis lands.

### 4.3 Support triage (greenfield - strongest "new agent" case)

**Today:** no support/ticket spine and no support AI (consistent with the known "no support/ticket spine" launch blocker).

**Opportunity:** a triage classifier/router is the textbook single-purpose agent - classify inbound message → route / tag / draft reply. It plugs into the existing spine trivially: a new `feature: 'support_triage'`, a `SupportTriageContext`, a DTO, then `AiTaskRunner::run(...)`. The cleanest place to introduce an **LLM-as-router** without touching anything fragile.

> **Prereq:** a support/ticket data model must exist first. The AI is the *easy* half.

### 4.4 Design-studio assist → evaluator-optimizer loop

**Today:** `DesignGeneratorService` constrains the model to templates and validates output, but does not loop.

**Opportunity:** an **evaluator-optimizer loop** - generate a design spec → score it (contrast / safe-margin / hierarchy checks, partly mechanizable like the JS contrast audits from the Aurora QA work) → regenerate if it fails. The existing sanitization layer (`sanitizePage`, `cleanPalette`, `cleanColor`) is the natural seam for an automated evaluator.

> **Prereq:** looping = multiple LLM calls = must be async (Redis). Also needs a defined acceptance rubric so the evaluator isn't itself a coin-flip.

### 4.5 Cross-cutting enablers (every pattern above depends on these)

| Enabler | Current state | Unblocks |
|---|---|---|
| **Async execution** (flip `QUEUE_CONNECTION` off `sync` → Redis) | `sync` | #1 prerequisite for *every* >1-call flow; today they'd block the request |
| **Native tool-use** in `AnthropicProvider` (+ OpenAI function calling) | absent | orchestrator steps that must call internal functions (catalog search, pricing, inventory) |
| **Prompt caching** on large static system prompts | absent | cuts cost/latency of chained/looped flows that re-send `ProductSystemContext` etc. verbatim |
| **`ai_usage_logs` observability spine** | ✅ already exists | already a real asset - keep the "one row, patch outcomes" discipline rather than logging per sub-step |

---

## 5. Honest caveats

- **All of §4 is research-only.** Nothing was implemented.
- **Image gen is stubbed.** `DesignerImageGeneratorService::callDallE()` exists, but `generate()` currently returns a `placehold.co` placeholder (line 52). Wired, not shipped - flag this before citing it as live.
- **Matcher docs ≠ shipped code.** `AI_PRODUCT_BUILDER.md` / `AI_PRODUCT_MODULE_CONTEXT.md` describe a catalog *matcher*; the code *creates* products. Treat those docs as design intent; treat `app/Services/AI/*` as ground truth.
- **The one observability discipline to keep:** an orchestrator should still write one `ai_usage_logs` row and patch outcomes onto it (`AiProductBuilderOrchestrator` is the canonical example), not fan out into a row per sub-step - otherwise per-tenant cost/quality tracking fragments.

---

## 6. Key file citations

| Area | Files |
|---|---|
| Runner / manager / request | `app/Services/AI/AiTaskRunner.php`, `LlmManager.php`, `AiTaskRequest.php` |
| Providers / config | `app/Services/AI/Providers/{AnthropicProvider,OpenAiProvider,AbstractLlmProvider}.php`, `config/ai.php` |
| Consumers | `app/Services/AI/{IntentParserService,AiProductBuilderOrchestrator,AiProductCreatorService,SeoMetaGeneratorService,ProductDescriptionGeneratorService,EmailTemplateGeneratorService,DesignGeneratorService,DesignerImageGeneratorService,BackgroundRemovalService}.php` |
| Contexts / DTOs | `app/Services/AI/Context/*`, `app/DTO/AI/*` |
| Routes | `routes/api.php:678-687`, `routes/store-api.php:403-406` |
| Queue gating | `config/queue.php:16` + `.env` `QUEUE_CONNECTION=sync` |
| Docs (intent, not ground truth) | `readme/AI_FEATURE_SOP.md`, `readme/AI_PRODUCT_BUILDER.md`, `readme/AI_PRODUCT_MODULE_CONTEXT.md` |

---

## Sources

This part is grounded in the Print-Flow-360 codebase itself (files cited in §6) rather than external URLs. The orchestration-pattern vocabulary it maps onto comes from the rest of this suite, which draws on:

- Anthropic - Building effective agents - https://www.anthropic.com/engineering/building-effective-agents
- Anthropic - Tool use (function calling) overview - https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview
- Anthropic - Prompt caching - https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching
