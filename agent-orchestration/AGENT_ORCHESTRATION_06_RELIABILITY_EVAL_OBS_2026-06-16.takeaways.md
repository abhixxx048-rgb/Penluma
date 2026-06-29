**This document explains why AI agents that do long, multi-step jobs are hard to keep working reliably — and what you have to do to catch problems before they cause real damage. It matters because the more steps an AI agent takes, the more chances there are for small mistakes to grow into big failures that waste money and time.**

**The main parts explained simply:**

- **Why agents fail more than simple AI calls** — A single question-and-answer AI is easy to check. But an agent that makes decisions, calls tools, and talks to other agents can fail in many of the same ways a team of workers can: one mistake early on quietly causes bigger mistakes later. The document shows the math: if each step works 95% of the time, a 20-step job only works out correctly about 36% of the time.

- **The 14 ways agents go wrong (MAST taxonomy)** — Researchers studied 1,600+ real agent runs and found 14 specific failure patterns grouped into three buckets: bad instructions/design (about 42% of failures), agents misunderstanding each other (about 37%), and agents that don't know when to stop or check their own work (about 21%). The key finding: most failures come from *how the system is designed*, not from the AI being "dumb" — so upgrading the model alone won't fix them.

- **Guardrails** — Safety fences you put around every action the agent takes: checking inputs before they go in, checking outputs before they go out, limiting how much the agent can spend, and requiring a human to approve anything risky. Think of it like putting spending limits and approval rules on a company credit card.

- **Evaluation (testing whether it actually works)** — You can't just check if the final answer is right, because two agents might take completely different paths and both be correct. The document explains three levels of testing: did the task succeed, was the path taken sensible, and which specific part broke? It also covers using another AI to judge the first AI's work — useful but not perfect on its own.

- **Observability and tracing** — Recording a detailed log of every step the agent took, like a flight data recorder. Without this, when something goes wrong you can't tell *where* it went wrong. There is an emerging industry standard (OpenTelemetry) for how these logs should be structured, though it is still changing as of 2026.

- **Testing challenges (non-determinism)** — Even with the exact same settings, an AI agent can give different answers each time it runs. This makes standard software testing very hard. The practical fix: run tests many times and compare averages, not single runs; use replay tests that re-use saved AI responses instead of calling the live AI every time.

- **Resumability and checkpointing** — Saving progress at each step so that if the agent crashes halfway through a long job, it can pick up from where it stopped instead of starting over from scratch. For expensive long jobs this is essential — restarting from zero wastes both money and time.

- **Real performance numbers** — A multi-agent setup (one lead AI directing several sub-agents) beat a single AI by over 90% on research tasks, and cut research time by up to 90%. The catch: it costs about 15 times more in AI tokens. This is why all the reliability work in this document matters — you are spending much more, so you need to be sure it is actually working.

**What to do with this:** Before running long AI agent jobs in production, put spending limits and human-approval checkpoints in place so mistakes cannot spiral out of control. Start measuring whether the agent's work is actually correct from day one — even a simple 20-case test set will show you problems early, before they cost you money.
