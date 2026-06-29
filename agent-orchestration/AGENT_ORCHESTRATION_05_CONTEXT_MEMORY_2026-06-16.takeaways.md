**This document is about how AI agents manage the information they hold in mind while working. Every AI has a limit on how much it can pay attention to at once — and jamming more in does not help, it actually makes performance worse. This doc explains the smart ways to keep agents fast, cheap, and accurate despite that limit.**

**The main parts explained simply:**

- **The attention budget** — An AI can only focus on a certain amount of text at once. More text does not mean better answers; past a point it gets confused, misses details, and costs more money. Think of it like a person trying to read 50 pages of notes at once vs a clean one-page summary.

- **Context rot / "lost in the middle"** — Research on 18 AI models found that every single one got worse as more text was loaded in. Facts buried in the middle of a long document were the most likely to be missed. Important instructions should go at the very start or the very end, never buried in the middle.

- **Context engineering** — The skill of choosing *what* to put in front of the AI, not just *how* to phrase it. It covers the whole package: instructions, examples, tool descriptions, history, retrieved data — everything the AI sees.

- **Compaction / summarization** — When a long task is running and the AI's "notepad" fills up, the system summarizes the old work into a short digest and discards the raw details. This frees up space without losing the key decisions made so far.

- **Memory tiers** — Short-term memory lasts only for one conversation. Long-term memory persists across sessions and stores facts about users, past tasks, and rules the agent should always follow. Using both together lets agents feel consistent and "remember" returning customers.

- **Saving to files (offloading)** — Instead of keeping everything in mind, smart agents write notes to files and read them back only when needed. This is like keeping a running to-do list rather than trying to memorize everything.

- **Just-in-time retrieval** — Rather than loading a full database up front, the agent looks up only what it needs, right when it needs it. Faster and cheaper than pre-loading everything.

- **Sub-agents with separate workspaces** — For big research tasks, you can run several smaller agents in parallel, each focused on one slice of the problem, then combine their summaries. Each agent gets a clean, focused workspace. For tasks where agents must share and write to the same data, a single agent works better.

- **Prompt caching** — If the opening part of every AI request is identical (the instructions, the tool list), the system can reuse the computed result instead of processing it again. This cuts costs by up to 90% and speeds up responses significantly.

**What to do with this:** Keep AI instructions short, structured, and placed at the start. Use file-based notes for long tasks so the agent doesn't lose track of earlier steps. Enable prompt caching for any repeated workflow — it is the single cheapest performance win available.
