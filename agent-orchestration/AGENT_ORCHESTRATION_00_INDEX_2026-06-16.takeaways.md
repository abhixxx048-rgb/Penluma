**This document is a reading guide for an 8-part research series about how to use AI assistants (called "agents") to do complex work automatically. It explains when to use one AI versus many AIs working together, and why using more AIs is not always better. It matters because it helps you make smarter, cheaper decisions before building anything with AI.**

**The main parts explained simply:**

- **When to use AI at all** — Not every task needs a smart AI. Sometimes a simple, fixed set of steps works better and costs far less. This series shows you a four-rung ladder: plain question → fixed steps → one AI assistant → many AI assistants working together. Always start at the bottom rung.

- **The 15x cost warning** — Using multiple AI assistants at once costs roughly 15 times more than asking one AI a single question. You only get that money's worth if the job is genuinely valuable AND the parts can be done at the same time without interfering with each other. Most tasks do not meet this bar.

- **Patterns — ways to arrange AI assistants** — There are 11 named ways to set up AI assistants (for example: one AI hands work to another, or several AIs vote on an answer). Each pattern fits certain jobs and fails at others. The series explains when to use each one and what can go wrong.

- **How AI assistants talk to each other and to tools** — Agents need to share information and use outside tools (like searching the web or reading a file). This part covers the rules and formats that make that work reliably.

- **Memory and attention limits** — An AI can only "hold" a certain amount of information in its head at one time. This part explains how to keep that space clean and useful so the AI does not get confused on long tasks.

- **Reliability and catching mistakes** — The longer an AI works on a task, the more small errors can pile up into a big problem. This part covers how to catch mistakes early, test AI systems, and make sure a long job can recover if something goes wrong midway.

- **Controlling the cost** — Token usage (the unit you pay for with AI APIs) can spiral fast. Techniques like caching repeated instructions (90% discount) and batching requests (50% off) can change the economics significantly.

- **How this applies to Print-Flow-360 (PF360)** — This part maps all the abstract ideas onto the actual AI code already in this platform. It also lists four realistic improvements that could be built, and flags what must be fixed first before any of them are possible.

**What to do with this:**

Read part 01 (Foundations) first — it gives you the decision framework you need before anything else makes sense. If you want to know what is possible in this codebase right now, jump to part 08 (Applied) directly after.
