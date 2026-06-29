---
title: 'How AI Really Works Inside a Print Shop SaaS (Case Study)'
metaTitle: 'AI Agent Orchestration: A Real Codebase Case Study'
description: 'See how AI agent orchestration really ships in a print-shop SaaS: what works today, the four constraints that block multi-agent flows, and where to grow next.'
keywords:
  - agent orchestration
  - multi-agent LLM systems
  - LLM orchestration example
  - AI in SaaS
  - orchestrator-worker pattern
  - prompt chaining
  - LLM tool use
  - evaluator-optimizer loop
  - AI usage logging
  - stateless LLM runner
  - per-tenant API keys
  - LLM router pattern
faq:
  - q: What is agent orchestration in plain terms?
    a: It is the practice of coordinating multiple AI steps — or multiple specialist AI "workers" — to finish a job that a single prompt cannot handle well. Think of it as a manager handing pieces of a task to the right helpers and combining their results.
  - q: Do you need a multi-agent setup to ship useful AI?
    a: No. Most production AI is a single, stateless call — one prompt in, one answer out. Multi-agent orchestration earns its keep only when a task genuinely needs several coordinated steps, and it adds real cost and complexity.
  - q: What is the orchestrator-worker pattern?
    a: A lead step decides what needs doing, then dispatches the work to focused specialist steps (workers) and assembles their outputs. It suits tasks with clearly separable sub-jobs, like "match a product, then price it, then write its description."
  - q: Why does a synchronous job queue block multi-step AI?
    a: With a synchronous queue, every AI call runs inside the web request itself. A multi-step flow would make the user wait for all the calls in a row, often timing out. Moving to background jobs is the usual fix.
  - q: What is the evaluator-optimizer loop?
    a: The model generates an answer, a checker scores it against a rubric, and if it fails the model tries again. It improves quality but needs a clear scoring standard and the ability to run several calls.
  - q: Should each AI sub-step write its own usage log?
    a: Usually no. Writing one row per request and patching outcomes onto it keeps cost and quality tracking clean. Logging a new row per sub-step fragments your per-customer reporting.
topic: agent-orchestration
topicTitle: Multi-Agent LLM Systems
category: AI & LLMs
date: '2026-06-16'
order: 999
icon: "\U0001F916"
author: Pritesh Yadav
transformed: true
sources:
  - 'https://www.anthropic.com/engineering/building-effective-agents'
---

Most articles about AI agents show you a tidy diagram of robots passing notes to each other. Real production code rarely looks like that.

Here is what a working print-shop SaaS actually ships: seven AI features, every one of them a single prompt in and a single answer out. No multi-agent swarm. No autonomous loops. And it works.

This is a field report from inside one real codebase — what the AI does today, the four hard constraints that quietly decide what is possible, and the honest places where smarter orchestration would pay off. If you have ever wondered how the theory of "agent orchestration" survives contact with a shipping product, this is that story.

## Why this matters

There is a huge gap between AI demos and AI in production.

Demos show agents reasoning, calling tools, and looping until they get it right. Production systems are usually far simpler — and that simplicity is often the *correct* engineering choice, not a shortcut.

If you build software, lead a team, or make roadmap calls, this case study gives you three things:

- A realistic picture of what "AI features" look like once they ship to paying customers.
- A checklist of the infrastructure constraints that decide whether multi-agent work is even feasible.
- A sober way to spot where orchestration genuinely helps versus where it is complexity for its own sake.

The product here is **Print-Flow-360**, a platform for print shops (think custom hoodies, designed mugs, branded merch). The lessons generalize to almost any SaaS adding AI.

## The first surprise: almost everything is one simple call

All the AI lives behind a single shared "runner." Every feature — generating a product, writing SEO text, drafting an email — follows the same path:

1. A feature builds a request: which feature, what context, how many tokens, do we expect JSON back.
2. The runner picks the AI provider, sends **one system prompt plus one user message**, and gets **one completion** back.
3. It optionally extracts JSON from the reply.
4. It writes **exactly one usage log row** recording the feature, provider, model, tokens, latency, and status.

That is it. The calls are **single-shot, single-turn, and stateless** — no memory of past turns, no back-and-forth conversation, no chain of dependent steps.

**Why this is good design, not laziness:** a thin, feature-agnostic runner with thin feature layers on top means every new AI feature reuses the same plumbing, the same logging, and the same provider handling. You add value at the edges without touching the core. It is the AI equivalent of a well-built kitchen — you can cook many dishes because the stove, sink, and counters are already in place.

### The seven things the AI does today

To make it concrete, here is what actually ships:

- **Product builder** — you type "black hoodie" and it drafts a full product (sizes, options, a pricing rule) saved as an inactive draft, plus a designer link.
- **SEO meta** — turns a product name and description into a meta title, description, and keywords.
- **Product description** — writes or rewrites product copy.
- **Email template** — generates or improves an HTML email body, carefully preserving merge tags like `{first_name}`.
- **Designer image generation** — an AI refines your prompt, then an image model renders it to storage.
- **Designer "design director"** — the AI picks a layout template and chooses words, colors, and fonts; the actual geometry math stays in the front-end code.
- **Background removal** — not an AI model at all, but it rides the same usage-logging spine.

Notice what is *missing*: there is no support-ticket AI, no chatbot, and no blog/content pipeline. Knowing what you have not built is as important as knowing what you have.

## The most "agent-like" feature is the one that trusts the model least

Of all seven features, the design director comes closest to acting like a real agent. And the reason it works is counterintuitive: it gives the model the *least* freedom.

The AI is boxed into an **allowlist**. It may only pick from approved templates and approved content slots. Its color and font choices are validated. And it is **never trusted to do layout geometry** — that math is owned by the host code, not the model.

This is the pattern worth tattooing on your wall:

> The model **proposes within a fixed vocabulary**. The host **validates and renders**.

It is the difference between letting a contractor pick paint colors from a pre-approved swatch book versus handing them your credit card and your house keys. The model brings creativity; the system keeps the guardrails. Any team adding more AI autonomy should copy this split *before* loosening the leash.

By contrast, the product builder is sometimes described as an "orchestrator," but it is really just a **sequential pipeline**: parse the request, create the product, patch the log. That is useful, but do not let an ambitious class name fool you into thinking genuine multi-agent orchestration is already happening. It is not.

## The four constraints that quietly decide everything

Here is the part most roadmap conversations skip. Whether you *can* add multi-agent orchestration is decided less by your AI ideas and more by four pieces of boring infrastructure. In this codebase, all four currently point toward "not yet."

1. **No native tool-use.** The model cannot call internal functions (like "search the catalog" or "calculate price") directly. Every structured result is prompt-and-parse JSON. So any orchestration step that needs to invoke a real function has no clean mechanism today.

2. **No prompt caching.** Big static instructions — like roughly 146 lines of print-domain knowledge — get re-sent in full on every single call. A chained or looped flow pays that cost again at every step.

3. **No live catalog feeding.** The product builder *invents* a new product from scratch; it does not look up and match an existing one. The "matcher" described in the docs simply does not exist in the code yet.

4. **The job queue runs synchronously.** This is the big one. Every AI call runs **inside the web request**. A multi-step or fan-out flow would make the customer sit and wait for call after call — and likely time out. Until background jobs exist, multi-step AI is effectively off the table.

The lesson generalizes: **your AI ambitions are capped by your plumbing.** Tool-use, caching, data access, and async execution are not nice-to-haves for orchestration — they are the foundation. Skip them and your clever agent design has nowhere to stand.

## Common misconceptions

**"If a class is named `Orchestrator`, it must be orchestrating multiple agents."**
Reality: here it is a straight-line pipeline. Names describe intent, not behavior. Read the code, not the label.

**"More agents means better AI."**
Reality: more agents means more calls, more latency, more cost, and more ways to fail. A single well-shaped prompt beats a fragile multi-agent flow for most jobs.

**"The product builder matches products from a catalog."**
Reality: the documentation says matcher; the shipped code says *creator*. When docs and code disagree, the code is ground truth and the docs are wishful intent.

**"The image generation is live."**
Reality: it is wired but stubbed — it currently returns a placeholder image. "Built" and "shipped" are different states. Always verify before you cite a feature as real.

## How to use this: a playbook for adding orchestration

If you are looking at your own product and wondering where multi-agent work belongs, follow these steps in order.

1. **Audit what actually ships.** List every AI call. For each, note: single-shot or multi-step? Trusted with anything risky? Logged how? You cannot plan orchestration until you know your real starting point.

2. **Check your four constraints first.** Before designing any agent, confirm you have (or can add) tool-use, prompt caching, data access, and **async execution**. If your queue is synchronous, fix that before anything else — it gates every multi-call flow.

3. **Copy the guardrail pattern early.** Make the model propose within a fixed vocabulary, and let your host code validate and render. Add this discipline *before* you add autonomy, not after.

4. **Match the pattern to the job, not the hype.** Use the right shape:
   - **Orchestrator-worker** when a task has clearly separable sub-jobs (match a product → price it → describe it). A lead step dispatches to specialists.
   - **Prompt chaining** when one output feeds the next (write a description → derive SEO from it → draft a launch email referencing both). Low risk, high value.
   - **LLM-as-router** for a clean single-purpose classifier (read an incoming support message → tag it, route it, draft a reply). This is the easiest new agent to add to a healthy system.
   - **Evaluator-optimizer loop** when quality is checkable (generate a design → score it on contrast and hierarchy → regenerate if it fails). Only works if you have a clear rubric, or your "evaluator" is just a coin flip.

5. **Keep one log row per request.** Even with orchestration, write a single usage row and patch outcomes onto it rather than logging a new row per sub-step. Otherwise your per-customer cost and quality tracking fragments into noise.

6. **Be honest about prerequisites.** For each opportunity, write down the one thing that must exist first. Support-triage AI needs a ticket data model. A looping evaluator needs async plus a rubric. The AI is often the *easy* half.

## Conclusion

The single takeaway: **good AI architecture is mostly good plumbing.** The flashy part — the agents, the loops, the swarms — only becomes possible once the unglamorous foundations are in place: async execution, tool-use, caching, and clean logging. Get those right, and orchestration is a small step. Get them wrong, and no amount of clever prompting saves you.

The deepest insight from this codebase is quieter still: the feature that behaves most like an intelligent agent is the one that trusts the model the *least*. Constraint, not freedom, is what made it reliable.

So here is the question worth chewing on next: if tight guardrails are what make a single AI step trustworthy, what does it take to keep a *whole team* of AI agents honest when they start handing work to each other? That is exactly where orchestrator-worker and evaluator-optimizer patterns earn their place — and where the real design challenge begins.
