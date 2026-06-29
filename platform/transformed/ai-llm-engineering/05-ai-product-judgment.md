---
title: "When to Use AI (and When Plain Code Wins)"
metaTitle: "When to Use AI vs Plain Code"
description: "Most AI products fail before the model is even chosen. Learn when to use AI, when plain code wins, and how to climb the ladder of escalation wisely."
keywords:
  - when to use AI
  - AI product judgment
  - LLM vs deterministic code
  - when not to use AI
  - AI vs traditional code
  - LLM product design
  - AI agent vs workflow
  - hallucination design
  - human in the loop AI
  - AI evals
  - prompt injection
  - augmentation vs automation
  - AI product strategy
  - RAG vs agent
faq:
  - q: When should you use an LLM instead of regular code?
    a: Use an LLM only for fuzzy, language-shaped tasks like summarizing, classifying free text, or extracting fields from messy documents. If a task has one correct, checkable answer (validation, math, lookups, fixed rules), plain code is cheaper, faster, and reliable.
  - q: What is the difference between an AI workflow and an AI agent?
    a: A workflow runs LLM steps along paths your code controls in advance. An agent lets the model decide its own steps and tools at runtime. The rule of thumb is simple: if you can describe the steps ahead of time, build a workflow; use an agent only when you genuinely cannot hardcode the path.
  - q: Can you eliminate AI hallucinations?
    a: No. Hallucination is a permanent property of how language models work, since they predict likely text rather than store verified facts. Techniques like RAG and lower randomness reduce confident wrongness but never reach zero, so design your product to catch and recover from wrong answers cheaply.
  - q: Why do most AI products fail?
    a: Most fail not because the model was weak but because the team started with the wrong question, skipped the non-AI baseline, or never built domain-specific evals. They chased "we use AI" instead of solving the actual problem better.
  - q: Does adding an explanation reduce overreliance on AI?
    a: Surprisingly, no. Research shows a plausible-looking explanation does not reliably reduce overreliance and can even increase it, because a confident rationale makes a wrong answer more persuasive. What works is a cognitive forcing function that makes the user think before accepting.
  - q: What is prompt injection and can it be fixed?
    a: Prompt injection is when untrusted text hijacks an LLM because instructions and data share one channel, like SQL injection for natural language. There is no complete fix. You mitigate it with least privilege, defense-in-depth, input and output filtering, and human approval for risky actions.
topic: ai-llm-engineering
topicTitle: AI & LLM Engineering
category: AI & LLMs
date: '2026-06-21'
order: 4
icon: "\U0001F9E0"
author: Pritesh Yadav
transformed: true
sources: []
---

Most failed AI products do not fail because the model was weak. They fail because someone started with the wrong question. They asked "what cool thing can we build with AI?" instead of "what problem are we solving, and what is the simplest thing that solves it?"

That single swap in thinking is the most durable skill in this entire field. A clever prompt trick for one model is obsolete in six months. The judgment to know a task did not need a model at all is forever.

## Why this matters

Every time you reach for an AI model, you quietly pay three taxes.

- **A cost tax.** You pay per word, and that multiplies across every user, every request, forever.
- **A latency tax.** A round-trip to a model takes 300 milliseconds to several seconds. Local code finishes in microseconds.
- **A reliability tax.** Models are non-deterministic and can be confidently wrong, producing bugs that are painful to reproduce.

When you use AI on a task that plain code could solve, you pay all three taxes and get nothing back. The headline you actually want is not "we use AI." It is "we solved the problem better."

A **large language model** (a system trained to predict the next word in text, which lets it understand and generate human language) is genuinely powerful. But power tempts misuse. When you have a hammer, everything looks like a nail. Good product judgment is the ability to look at a problem and see which parts are nails (fuzzy, language-shaped) and which are screws (exact, rule-shaped) that need an entirely different tool.

## Use AI for judgment, not arithmetic

Here is the core distinction that decides everything.

Some problems are **deterministic**: they have one correct, checkable answer. Validation, formatting, arithmetic, lookups, fixed business rules. Plain code solves these perfectly. Same input, same output, every time, near-zero cost, and zero chance of making something up.

LLMs are **probabilistic**: they produce a *likely* answer that can vary between runs and can be wrong while sounding certain. As one practitioner puts it, "business is deterministic by design; generative AI is probabilistic by nature."

So the first job is not building. It is sorting.

**LLMs shine on tasks that are ambiguous, open-ended, or need interpretation:** summarizing a messy report, classifying support tickets written in free text, pulling structured fields out of a sloppy PDF, answering questions in plain language.

**They are the wrong tool when a rules engine, a database query, or a bit of math would do it instantly and reliably.** Calculating a customer's debt breakdown with a generative model has been called "a grave architectural error." It is arithmetic with one right answer. Use code.

> Think of an LLM as a brilliant, fast intern who occasionally makes things up with total confidence. Wonderful for first drafts, summaries, and judgment calls. But you would never let them run payroll math or wire money without a deterministic check and a second set of eyes. A calculator, by contrast, is boring and never wrong. Pick the intern for interpretation. Pick the calculator for math.

## The ladder of escalation

Once you know AI belongs in a task, the next question is *how much* AI. The answer is a simple rule: **climb only as high as the problem forces you.** Anthropic's guidance is to "find the simplest solution possible and only add complexity when it demonstrably improves outcomes."

Picture your options as rungs on a ladder. Each rung up buys more capability but costs more money, adds more delay, and adds more ways to fail.

- **Rung 0 — No AI.** Code, regex, SQL, rules, classical machine learning. Cheapest, fastest, most predictable.
- **Rung 1 — Single LLM call.** One good prompt, maybe a few examples.
- **Rung 2 — RAG.** One call plus retrieved private or current facts.
- **Rung 3 — Workflow.** LLM steps running on predefined, hardcoded paths.
- **Rung 4 — Agent.** The LLM decides its own steps and tools at runtime.
- **Rung 5 — Multi-agent.** Several agents with separable ownership. Most teams never need this.

The decision flow, in order:

1. **Frame the problem, not the tech.** Write down the user's job-to-be-done and how you will measure success *before* you mention AI. If you cannot state the problem and the metric, you are not ready to pick a tool.
2. **Try the non-AI baseline.** Can code, a regex, a database query, a lookup table, a rules engine, or a simple classical model solve it acceptably? If yes, stop.
3. **Check if the task is genuinely AI-shaped.** Use AI only when the work involves natural language, fuzzy judgment, generation, or pattern-matching that resists explicit rules.
4. **Start at Rung 1:** a single LLM call with a good prompt. Build evals immediately so you can tell if it is good enough.
5. **Add RAG (Rung 2)** only if the model needs current, private, or domain-specific facts it does not reliably know. **RAG** (Retrieval-Augmented Generation) fetches relevant documents at question time and feeds them into the prompt, so answers are grounded in real data instead of the model's memory, and you can cite sources.
6. **Add a workflow (Rung 3)** when the task has multiple distinct steps you can describe in advance.
7. **Escalate to an agent (Rung 4)** only when the path cannot be hardcoded because the steps depend on intermediate results.
8. **Consider multi-agent (Rung 5)** only when one agent's responsibilities genuinely do not fit in one loop.

### Workflow versus agent: the sharpest line

This is where teams most often overshoot, so it deserves a clean rule.

A **workflow** is a system where LLM steps follow predefined code paths that *your* code controls. Predictable, testable, cheaper, faster.

An **agent** is a system where the LLM dynamically decides how to accomplish the task, choosing its own sequence of tool calls over many turns.

The test: **if you can describe the steps in advance, build a workflow. Use an agent only when you genuinely cannot hardcode the path.**

Why care so much? Because agents add **compounding errors**. Small mistakes at each step accumulate down the chain. Three steps that are each 90% reliable give you only about 73% accuracy end to end (0.9 times 0.9 times 0.9). Every extra hop multiplies failure.

## The model is not the product

A common trap is confusing the model for the product. An LLM is a *component*, not a finished thing.

> An LLM is an engine, not a car. By itself it is powerful but goes nowhere useful until you bolt on a chassis (workflow integration), steering (guardrails and policies), and a dashboard (evals and metrics). Shipping the raw model and calling it a product is shipping an engine on a stand.

A real productized AI system solves a defined business problem, fits into existing workflows, respects policy and compliance, and delivers measurable outcomes. The hard 80% of the work is the surrounding evals, guardrails, data plumbing, and UX, not the model call.

This is why a demo at roughly 60% quality is easy, while the journey from 60% to 95%-plus is where almost all the effort hides. LinkedIn reportedly hit 80% quality on generative features in about a month, then needed four more months to pass 95%. Plan your roadmap around that **last-mile curve**, not the demo.

> Going from 60% to 95% is the last mile of delivery. The package crosses 99% of the distance easily on the highway. The final stretch to the doorstep, hallucinations and edge cases and latency and endless input combinations, is where most of the cost and time live.

## Designing for wrong answers

Here is a fact that will not go away: **hallucination is permanent.**

A model is a statistical fill-in-the-blank machine. It stores patterns about which words tend to follow which words, not a verified store of facts. RAG and lower randomness settings reduce confident wrongness, but never to zero.

So the design conclusion is not "wait for a better model." It is: *assume the model will be confidently wrong sometimes, and build the product so a wrong answer is cheap to catch and cheap to recover from.*

### Augmentation vs automation: decide per action

The core product decision is **augmentation vs automation**.

- **Augmentation** keeps the human central. The AI proposes, drafts, or surfaces. The human decides, edits, or approves.
- **Automation** lets the AI act without per-action review.

Crucially, this is not one setting for the whole product. You choose *per action*, scoring each on two axes:

- **Reversibility:** can a wrong action be undone cheaply?
- **Blast radius:** how much damage if it is wrong?

Reading a file is reversible and low-blast: let it auto-run. Deleting records or charging a card is irreversible and high-blast: require approval. A single agent can mix rungs. *Read* a file equals auto; *write, delete, or charge* requires a human.

The autonomy spectrum, from least to most autonomous, runs:

1. AI suggests, human does it.
2. AI drafts, human edits before sending.
3. AI acts but pauses for approval on risky actions (**human-in-the-loop**).
4. AI acts on its own while a human watches aggregate behavior and can step in (**human-on-the-loop**).
5. Full automation.

A mature human-in-the-loop gate offers four choices, not a yes/no: **approve** (run as-is), **edit** (change the arguments, then run), **reject** (refuse with feedback so the agent retries), and **respond** (the human's answer becomes the tool result). And you gate *conditionally*, pausing only when an action crosses a real risk threshold, so people are not drowned in approvals they will rubber-stamp.

```python
interrupt_on = {
    "read_record":    {"auto": True},
    "send_refund":    {"allowed": ["approve", "edit", "reject"],
                       "when": lambda req: req.args["amount"] > 50},
    "delete_records": {"allowed": ["approve", "reject"]},
}
# a $20 refund auto-runs; a $2,000 refund pauses for a human
```

Pausing for a human requires **checkpointing**: durably saving the agent's full state, keyed to a conversation id, so when the human responds minutes or days later you resume mid-task instead of losing all the in-progress work.

### Trust calibration and the explanation trap

The goal is not to *maximize* trust. It is to **calibrate** it. You want users to rely on the AI exactly where it is reliable, and to use their own judgment where it is not.

Two failure modes bracket the target:

- **Overtrust (automation bias):** accepting wrong output without checking. Even 80 to 90% accurate systems introduce *new* errors because users stop checking, and it gets worse under time pressure and when the AI sounds authoritative.
- **Undertrust:** ignoring a correct answer and losing the AI's value entirely.

> Trust calibration is like trusting a weather app. You have learned it is great about tomorrow and unreliable at ten days out, so you pack accordingly. Miscalibration is either carrying an umbrella every day because it once rained (undertrust) or planning an outdoor wedding on a ten-day forecast (overtrust).

## Common misconceptions

**"More AI means a better product."** No. Every rung up the ladder adds cost, latency, and failure surface. The best products use the *lowest* rung that works and let plain code own everything exact.

**"A better model will fix hallucinations."** It will reduce them, never remove them. Design for wrong answers as a certainty, not an accident.

**"Adding an explanation cures overreliance."** This one surprises people. Replicated research shows that simply adding a plausible-looking explanation does *not* reliably reduce overreliance, and can *increase* it. A confident rationale makes a wrong answer more persuasive. What actually works is a **cognitive forcing function**: a design that compels the user to think before accepting. Make them commit to their own decision first and reveal the AI second. Hide the suggestion behind a click. Insert a deliberate pause. The catch is that users rate these designs as harder and like them least, so reserve them for high-stakes decisions.

**"A 100% eval pass rate means we are done."** It almost always means your tests are too easy. As Hamel Husain notes, "your pass rate is a product decision, depending on the failures you are willing to tolerate." A meaningful suite around 70% is healthier than a trivial one at 100%.

**"The model is the product."** The model is one component. The product is the evals, guardrails, integration, and UX wrapped around it.

## Build the safety net: UX, evals, and security

### Make uncertainty visible

Surface uncertainty *at the point of decision*: first-person hedging ("I'm not sure, but..."), categorical confidence (High / Medium / Low rather than fake-precise "87.3%"), clickable inline citations that invite verification, and surfacing disagreement when you run the model several times.

Every AI feature also needs an explicit failure design:

- **Graceful degradation:** fall back to a simpler tool, a cached result, or a read-only mode instead of crashing.
- **Abstention:** let the model say "I don't know" and route onward.
- **Human escalation:** "Talk to a person" as an always-visible, first-class action.

A blank or broken output reads as "the product is broken." A fabricated answer is worse than an honest error.

### Build evals from real failures

If there is one root cause behind failed AI products, it is the absence of robust **evals**: systematic tests of whether the system meets its quality bar. And evals must be *domain-specific*. A generic "helpfulness" score tells you almost nothing about *your* app.

The durable practice is **error analysis**:

1. Gather around 100 real traces.
2. Have a domain expert write free-text notes on what went wrong (*open coding*).
3. Cluster those notes into a failure taxonomy like "wrong tone" or "hallucinated field" (*axial coding*).
4. Only then write narrow, mostly **binary (pass/fail)** evals for the failures you actually observed. Binary beats a 1-to-5 scale because it forces clearer judgments and needs smaller samples.

For failures only a human could judge, you can use an **LLM-as-a-judge** (one model grading another's output). But you must *validate* it against a human expert through *critique shadowing*, where the expert's written critiques become examples in the judge prompt. Measure its true-positive and true-negative rates separately, not just raw agreement. One team reached over 90% agreement with their expert in three iterations this way.

> Evals are unit tests for a non-deterministic function. You cannot assert exact equality, so you assert properties: "contains the legal disclaimer," "never names a competitor," "the judge says pass." You write a test for each bug you actually saw, just as you add a regression test after a real incident.

### Defend against prompt injection and data leakage

**Prompt injection** is a structural limitation, not a patchable bug. An LLM reads trusted instructions and untrusted data in the same stream of words, so *any* text it ingests (a user message, a web page, a retrieved document, an email) can hijack it. It is the natural-language cousin of SQL injection, and OWASP ranks it the number-one LLM risk.

There is no complete fix. You use **defense-in-depth** and **least privilege**: separate instructions from data, give each tool the minimum permissions (a summarizer agent should not have a "send email" or "delete" tool), filter inputs and outputs, and require human approval for high-risk actions.

Privacy is a first-class risk too. Models can memorize and repeat secrets, so mask personal data on the way in, guardrail outputs on the way out, send the minimum data needed, and secure zero-retention or no-training terms for sensitive workloads.

> Prompt injection is SQL injection for natural language. Because instructions and data share one channel, untrusted text can take over, and the mitigations rhyme: isolate, least-privilege, validate, and never fully trust the input.

### Build for model churn

Models get deprecated, repriced, and behave differently across versions. Treat model choice as a swappable dependency behind a **model abstraction layer** (an AI gateway): a single internal interface so swapping providers is a config change, not a rewrite.

```python
class LLMGateway:
    def complete(self, messages, *, task):
        model = ROUTING[task]          # easy -> small, hard -> large
        return PROVIDERS[model.provider].call(model, messages)
# App code calls gateway.complete(...), never a vendor SDK directly,
# so changing models is config, not a rewrite.
```

Treat prompts as versioned production assets (in git or a registry, never inline strings) with a frozen **regression testbed** so you can diff old-versus-new outputs and catch regressions before users do.

## How to use this

When a new AI idea lands on your desk, run it through this checklist:

1. **Write the problem and the metric first.** No mention of AI until you can state both.
2. **Try the non-AI baseline.** If code, regex, SQL, or a rules engine solves it acceptably, ship that and stop.
3. **Start at Rung 1.** A single LLM call with a good prompt. Add RAG, then a workflow, then an agent only when each higher rung earns its keep with a measured improvement.
4. **Prefer a workflow over an agent** whenever you can describe the steps in advance.
5. **Set autonomy per action.** Score each action on reversibility and blast radius. Auto-run the safe ones; gate the risky ones with a human.
6. **Design for the wrong answer.** Build in graceful degradation, an abstention path, and an always-visible "talk to a person."
7. **Build evals from 100 real traces** before you trust any quality claim, and treat a 100% pass rate as a warning, not a win.
8. **Lock down security early.** Least privilege on every tool, defense-in-depth against prompt injection, and masking for sensitive data.
9. **Hide the model behind a gateway** and version your prompts so the next model release is a config change, not a fire.

A quick map of where common tasks land:

- **Email validation, snake_case to camelCase:** Rung 0, plain code. One right answer.
- **Routing support tickets to billing, technical, or sales:** Rung 1, a single LLM call. Messy free-text classification.
- **Support bot answering from your help docs:** Rung 2, RAG. Needs current, private facts and citations.
- **"Translate, then summarize, then format as JSON":** Rung 3, a workflow. The steps are known in advance.
- **"Debug why this server is failing using whatever logs help":** Rung 4, an agent. The path depends on what it finds.
- **Invoice-total extraction from PDFs:** AI wrapped in a deterministic check (line items must sum to the total), with human review on mismatch.
- **Coding agents like Claude Code, Cursor, or Copilot:** read files freely, but propose-and-confirm before writing, running shell commands, or pushing.
- **Legal or financial research:** a specialized tool with citations. General models have fabricated cases, and real lawyers have been sanctioned for citing them.

## Conclusion

If you remember one thing, remember this: **start from the problem, not the technology.** The most expensive AI mistakes are not bad prompts. They are good prompts solving problems that never needed a model. Reserve probabilistic AI for genuinely fuzzy, language-shaped work, let deterministic code own anything with one checkable answer, and climb the ladder only as high as the problem forces you.

The judgment you just built has a quiet superpower: it outlasts every model release, framework, and price change. Tools will keep churning. The discipline of matching tool to task will not.

There is a deeper rabbit hole waiting underneath all of this, though. Once you accept that hallucination is permanent and wrong answers are a certainty, evaluation stops being a final exam and becomes the engine that drives everything. How exactly do you turn 100 messy real-world traces into a test suite that catches tomorrow's failures? That is where the real craft of AI engineering begins.
