---
title: "AI Evals: How to Know Your LLM App Actually Works"
metaTitle: "LLM Evals: Prove Your AI App Actually Works"
description: "Learn how AI evals replace guesswork with repeatable measurement. A plain-language guide to LLM evaluation, graders, LLM-as-a-judge, RAG, and agents."
keywords:
  - LLM evaluation
  - AI evals
  - LLM-as-a-judge
  - how to evaluate an LLM app
  - golden dataset
  - RAG evaluation
  - error analysis LLM
  - agent evaluation
  - offline vs online evaluation
  - eval-driven development
  - benchmark vs product eval
  - faithfulness RAG
  - pass@k vs pass^k
  - prompt testing
  - AI quality measurement
faq:
  - q: "What is an eval in AI?"
    a: "An eval is a systematic, repeatable measurement of how good an AI system's outputs are, judged against criteria you set in advance. It's the AI-era version of a software test suite, but it grades open-ended, probabilistic answers instead of checking for one exact result."
  - q: "What is the difference between a model eval and a product eval?"
    a: "A model eval (a benchmark like MMLU) measures a model's general capability in isolation. A product eval measures whether your specific system does your specific job. Leaderboard scores barely predict your app's real-world performance."
  - q: "Is LLM-as-a-judge reliable?"
    a: "It can be, but only after you validate it against a human expert. An unvalidated judge just produces a confident-looking number that may be meaningless. Use binary pass/fail verdicts, ask it to reason before deciding, and measure agreement with human labels."
  - q: "How do you evaluate a RAG system?"
    a: "Score retrieval and generation separately, because failures hide in both. Watch faithfulness (is the answer grounded in the retrieved text?), answer relevancy, context precision, and context recall. Remember faithfulness is not the same as truth."
  - q: "What does it mean to look at your data in LLM evaluation?"
    a: "It means reading real traces, the full record of each request, and bucketing failures by root cause. This error analysis is the highest-ROI activity in eval work and decides which metrics are even worth building."
  - q: "What is the difference between pass@k and pass^k?"
    a: "pass@k means the agent succeeds at least once in k tries. pass^k means it succeeds on all k tries. For customer-facing reliability you want pass^k, since users need it to work every time, not just sometimes."
author: Pritesh Yadav (priteshyadav444)
transformed: true
linked: true
topic: ai-llm-engineering
topicTitle: AI & LLM Engineering
category: AI & LLMs
date: '2026-06-21'
order: 1
icon: "\U0001F9E0"
sources: []
---

You change one sentence in your chatbot's instructions. Did it get better, or worse?

With normal software, you run your tests and get a clear answer. With AI, [the same input can produce a different output every time](/blog/ai-llm-engineering/01-foundations-how-llms-work-why-these-skills-endure), and there's rarely one "correct" response. So how do you actually *know*? That single question is the reason **evals** exist, and it quietly separates the teams that ship great AI products from the ones stuck fixing the same bugs forever.

## Why this matters

Without evals, you're flying blind.

You eyeball a handful of outputs, they look fine, you ship. Then a customer hits an edge case you never checked. You fix that, and you unknowingly break two other things. This is the "whack-a-mole" trap, and it swallows teams who measure quality by gut feeling.

An **eval** is a systematic, repeatable measurement of how good your AI's outputs are, judged against criteria you define in advance. Think of it as a test suite for AI. The difference: instead of "assert the result equals 42," you grade open-ended, probabilistic answers where there's no single right response.

The lesson nearly every experienced practitioner converges on is blunt. Teams that build a real evaluation system succeed. Teams that don't collapse into endless guesswork, because they have no objective way to tell whether a change helped or hurt.

> An eval is to an LLM app what a test suite is to ordinary software. You wouldn't ship a code refactor without running your tests. Don't ship a prompt change without running your evals.

## The trap of trusting benchmarks

Here's a distinction that saves teams a lot of pain: **model evals** versus **product evals**.

A **model eval** (also called a benchmark) measures a model's general ability in isolation. These are standardized tests like MMLU for general knowledge or GSM8K for grade-school math. They're great for ranking models on a leaderboard.

A **product eval** measures whether *your* system does *your* job. For example: "Does the support bot extract the correct order number 95% of the time?"

The hard truth is that leaderboard scores barely predict your application's real performance. A model that tops a benchmark can still flunk your specific extraction task.

> A model eval is like a chef's culinary-school grade. A product eval is whether *this* chef makes good food at *your* restaurant for *your* customers. A high grade doesn't guarantee your diners are happy.

## Define "good," then look at your data

You can't measure quality until you've **defined** it.

The advice from teams who do this well is to write **success criteria** that are specific and measurable. Not "classify sentiment well," but "score at least 0.85 on a held-out set of 10,000 diverse tweets, a 5% improvement over our baseline." Most real systems need *several* criteria at once: correctness, tone, format, safety, speed, and cost, because a single number hides the trade-offs between them.

To grade against those criteria, you need a **golden dataset**: a set of inputs paired with their correct expected outputs, labeled by someone you trust (usually a domain expert). This is your answer key.

> A golden dataset is the answer key to an exam. Without it, you can grade vibes but never assign an objective score, and two graders will disagree forever.

### Reading your data is the real work

Now the part that sounds boring and is actually the most valuable thing you'll do: **look at your data**.

Experienced teams report spending 60 to 80% of their development time reading real **traces**. A trace is the full record of one request: the input, any documents the system pulled, tool calls, intermediate steps, and the final output. They read these traces and do **error analysis**, sorting failures by root cause.

Generic off-the-shelf metrics like "helpfulness" or "coherence" are a trap. They create an illusion of confidence without telling you what to fix. Real evals are built from the specific ways *your* system actually fails, which you only discover by reading *your* traces.

Here's a disciplined way to do it, borrowed from qualitative research:

1. **Open coding.** One expert reads traces and writes free-form notes on what went wrong, with no fixed categories yet. Log only the *first* failure in each trace, because an early error (like a bad document retrieval) cascades into misleading later symptoms (a confused, rude answer).
2. **Group the notes.** Cluster those observations into a small set of named categories, then *count* how often each happens. For example: "retrieval miss 40%, ignored constraint 30%, made up a policy 20%."
3. **Stop when you stop learning.** When about 20 traces in a row reveal no new failure type (usually after reviewing around 100), you've sampled enough.

The counts tell you exactly where to spend your effort. And often the fix is trivial: if the model was simply never *told* to do something, just edit the instructions. Don't build an elaborate eval for a one-line gap.

> **Common mistake:** Reaching for tools, frameworks, or an LLM judge *before* looking at your data. You end up measuring abstract qualities that don't matter and never see your real failures. The metric comes after the diagnosis, not before.

## The three ways to grade an output

Once you know *what* to measure, you need a way to actually grade each output. There are three families, from cheapest and most reliable to most expensive and most flexible. The golden rule: **use the cheapest grader that's reliable enough**, and layer them together.

### 1. Code-based checks (cheap, rigid)

Plain code: exact match, pattern matching, checking that the output is valid JSON, or simple assertions like "does it contain the product ID?" or "did it return five results?"

These are fast, free, and reproducible. They run on every code change. The limit is that they only work when correctness is mechanically checkable: structure, format, IDs, counts, and tool-call correctness. As one widely-shared piece of guidance from Anthropic puts it, code-based grading is "by far the best grading method if you can design an eval that allows for it."

### 2. Reference-based metrics (middle ground)

These compare your output to a gold answer. Some, like **BLEU** and **ROUGE**, measure how many word sequences your answer shares with the reference. They're cheap but shallow: they wrongly penalize "feline" when the reference says "cat," and reward overlap even when the meaning is wrong.

A better option, **BERTScore**, turns each word into a list of numbers that captures its meaning in context, then compares by similarity. It correlates much better with human judgment, but it still can't tell you whether an answer is factually true or whether it followed instructions.

### 3. LLM-as-a-judge or human (flexible, expensive)

Here an LLM (or a person) grades the output against a rubric. This handles nuance, tone, and open-ended quality that code can't touch. The cost: it's slower, non-deterministic, biased, and must be validated against humans before you trust it.

> **Climb the ladder.** Use deterministic code first, reference-based metrics next, and an LLM judge or human only for genuinely subjective qualities. Then layer them: a code check for structure *plus* an LLM judge for tone.

## LLM-as-a-judge: powerful, but validate it first

Using one LLM to grade another's output has become the go-to technique for scoring open-ended text at scale. But an LLM judge is not free truth. An unvalidated judge is just another untested model output that happens to produce a number that *feels* objective while being meaningless.

> An LLM judge is like a teaching assistant grading essays. You give the TA a clear rubric and answer key, then spot-check their grades against the professor's. An uncalibrated TA's scores tell you nothing.

### Design principles that work

- **Prefer binary pass/fail over 1-to-5 scales.** Nobody agrees on what makes a 3 versus a 4. As practitioner Hamel Husain puts it, scoring everything on a 1-to-5 scale means "you're doing it wrong." Binary forces you to define what actually matters, and it's far more consistent and actionable.
- **Reason first, then decide.** Ask the judge to think through its reasoning, then emit a clean `correct` or `incorrect`, and parse only the verdict. Reasoning before labeling measurably improves accuracy; you throw the reasoning away.
- **Pairwise beats absolute.** Asking "which of A or B is better?" is easier and more reliable (often over 80% agreement with humans) than asking the judge to assign each one an absolute score.
- **Use a different model to judge** than the one that generated the output, where you can.

### Validate the judge against a human

The workflow practitioners follow: appoint a single **principal domain expert** who owns the definition of "good." They make binary pass/fail judgments *with written critiques* on a labeled sample. You build the judge's prompt using those critiques as examples, run it on the same items, and measure agreement.

But not with raw accuracy. On imbalanced data (say 95% of outputs pass), a judge that always says "pass" scores 95% while being completely useless. Instead, measure two things separately: how often the judge **catches real failures**, and how often it **correctly passes good output**. Iterate the prompt until both are high, then lock away a held-out test set you touch only once.

### Neutralize the judge's biases

Judges have predictable biases:

- **Position bias:** favoring whichever answer comes first or last.
- **Verbosity bias:** preferring longer answers even when they're wrong.
- **Self-preference bias:** favoring text from its own model family.

The standard fix for position bias in pairwise comparison is to run both orderings (A then B, and B then A) and only accept a verdict that's consistent both ways. If swapping the order flips the answer, that's bias, and you discard it.

> **Common mistake:** Trusting an LLM judge without validating it against humans, and using raw accuracy on imbalanced data. An uncalibrated judge gives you a confident number that means nothing. Who validates the validators? You do.

## Special cases: RAG and agents

### Evaluating RAG systems

A **[RAG](/blog/ai-llm-engineering/03-context-engineering-retrieval)** system (Retrieval-Augmented Generation) fetches relevant documents, then writes an answer from them. Failure can hide in *retrieval* (it grabbed the wrong documents) or in *generation* (good documents, bad answer), so you must evaluate them separately. The widely-used RAGAS framework names the core metrics:

- **Faithfulness:** what fraction of the answer's claims are actually supported by the retrieved text.
- **Answer relevancy:** does the answer actually address the question asked?
- **Context precision:** were the retrieved chunks relevant, with the useful ones ranked near the top?
- **Context recall:** did retrieval bring back everything the correct answer needs?

The central trap: **faithfulness is not truth.** If the retriever returns a wrong document and the model faithfully repeats it, faithfulness looks high but the answer is wrong.

> RAG faithfulness is like a court witness who faithfully repeats what they were told. They can be perfectly faithful to their source and still completely wrong, because the source was wrong.

### Evaluating agents

An **[agent](/blog/ai-llm-engineering/04-agent-architecture-orchestration)** plans, calls tools, and acts over several steps. Evaluate at three levels:

1. **End-to-end outcome:** did the task succeed?
2. **Trajectory:** was the path of tool calls sound and efficient?
3. **Component:** which exact tool or step broke?

The key advice from Anthropic: **grade the end-state, not the exact path.** "Agents regularly find valid approaches that eval designers didn't anticipate." Reserve strict path-matching for steps that truly must happen in order, like a banking agent that must verify identity *before* it transfers funds.

> Grading an agent by its end-state is like grading a maze runner by whether they reached the exit, not whether they took the one route you imagined. There are many valid paths.

## Common misconceptions

- **"A high benchmark score means it'll work for me."** No. Benchmarks rank general capability; only your own task-specific evals predict your product's quality.
- **"A 1-to-5 rating scale is more informative than pass/fail."** Usually the opposite. Fuzzy scales hide disagreement and are hard to act on.
- **"An LLM judge is objective."** Only after you validate it against a human. Until then it's an untested model output wearing a number.
- **"Green CI means production is healthy."** A frozen test set never sees silent model updates, shifting inputs, or new user behavior. You also need online monitoring.
- **"My agent works."** Check which metric you mean. [An agent that solves a task 6 times out of 10](/blog/agent-orchestration/agent-orchestration-06-reliability-eval-obs) has a pass@10 of about 99.99% but a pass^10 of about 0.6%. For "works every time," only the second number counts.

## How to use this

Here's a practical sequence to put this into action:

1. **Define success criteria first.** Write down what "good" means in specific, measurable terms before you build the feature. This is eval-driven development, and it's far easier than reverse-engineering criteria after launch.
2. **Log full traces from day one.** You can't evaluate what you didn't capture.
3. **Read your data and do error analysis.** Read about 100 real traces, bucket the failures by root cause, and count them. Let the counts decide what to fix.
4. **Build a golden dataset** of real inputs plus the edge cases your error analysis surfaced. Grow it over time.
5. **Pick the cheapest reliable grader per criterion.** Code checks for structure, reference metrics for closed-form answers, an LLM judge only for subjective quality.
6. **If you use an LLM judge, validate it** against a single domain expert using catch-rate and pass-rate, not raw accuracy, and de-bias it for order and verbosity.
7. **Run both offline and online.** Put a curated eval suite in CI that fails the build below a threshold (say 95%). Cache model responses so unchanged tests cost nothing. Then sample live production traffic to catch the world changing under you.
8. **Keep guardrails separate.** A **guardrail** runs instantly and inline to *block* a bad output (a data leak, a prompt injection) before it reaches the user. An eval runs afterward to *measure* quality. A guardrail is a smoke detector; an eval is a safety inspection.
9. **Close the loop.** Turn every new production failure into a permanent regression test. This is the flywheel that compounds.

One more discipline worth adopting: **an eval score is not a fact.** It's an estimate from a sample. If Model A scores 72% and Model B scores 70% on 200 questions, that 2-point gap is probably noise. Report a margin of error, the same way an election poll does. A "2-point lead" inside a 3-point band isn't a lead at all.

## Conclusion

The single takeaway: **the teams that win treat evals as core development work, not an afterthought.** Most of their effort goes into reading real data and analyzing errors, not building fancy infrastructure, and they turn every production failure into a test that never fails silently again.

That shifts evaluation from a chore you dread into a flywheel that makes your product measurably better with every change. And it raises a sharper question for your next project: if you wrote the eval *before* you built the feature, how much of the guesswork would simply disappear? That idea, eval-driven development, is where the most disciplined AI teams are heading next.
