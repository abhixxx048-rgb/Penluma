**This document explains how AI "agents" (software helpers that do tasks on their own) talk to each other and to outside tools. When you build a system with multiple AI agents working together, they need clear rules for passing work, sharing information, and connecting to databases or services — this doc covers all those rules. Understanding this helps you build AI systems that don't break, waste money, or produce wrong results.**

**The main parts explained simply:**

- **Two ways agents share information** — Agents can either send direct messages to each other (like email), or write to a shared "whiteboard" that everyone reads. Direct messages give independence but create a lot of back-and-forth noise. A shared whiteboard is cleaner but needs careful access rules to avoid two agents overwriting each other at the same time.

- **Handoffs (passing the job to another agent)** — When one AI agent finishes its part and hands the task to another, this is called a handoff. Both OpenAI and LangGraph (two popular AI frameworks) say the same thing: always use a formal handoff step, never let agents call each other directly. This keeps it clear who is in charge at any moment.

- **Breaking big tasks into smaller pieces** — Anthropic's research system shows how a "lead" AI agent splits a big question into many smaller questions, sends each to a separate "worker" agent running in parallel, then collects and combines all the answers. This can cut research time by up to 90%, but costs about 15 times more than a simple chat — so it's only worth it for genuinely complex, high-value tasks.

- **MCP (Model Context Protocol)** — A standard created by Anthropic in 2024 that gives AI agents a single, consistent way to connect to tools and data sources (databases, files, apps). Instead of building a custom connector for every combination, you build one MCP connector and it works everywhere.

- **A2A (Agent2Agent Protocol)** — A standard created by Google in 2025 that lets AI agents made by different companies discover and delegate tasks to each other. Each agent publishes a public "Agent Card" saying what it can do, without revealing how it works inside.

- **Tool calling** — The basic action an AI agent takes when it needs to do something (run a search, query a database, or pass work to another agent). In practice, handing off to another agent looks exactly the same as calling a tool — the AI just picks the right one.

- **Structured outputs (enforcing message shape)** — When agents send results to each other, those results must follow a strict format (like a form with fixed fields), not free-form text. Without this enforcement, messages fail to parse correctly about 8–15% of the time. With proper schema enforcement, failure drops below 0.2%.

- **Context and state pitfalls** — Jamming too much information into one agent's memory degrades its performance. Errors from one agent can also ripple out and break the whole system. The fix: give each agent only the information it needs for its specific job, and save the overall plan to memory before splitting work across many agents.

- **MCP vs A2A — they work together, not against each other** — MCP connects each agent to its own tools and data (vertical). A2A connects agents to other agents (horizontal). A well-built multi-agent system uses both at the same time.

**What to do with this:** If you are building or overseeing an AI system with multiple agents, use MCP to connect each agent to its tools, and A2A to let agents coordinate with each other. Always enforce a strict message format between agents — free-form text breaks too often. Reserve expensive multi-agent setups for tasks that are genuinely complex and can run in parallel; for simple tasks, a single agent is cheaper and good enough.
