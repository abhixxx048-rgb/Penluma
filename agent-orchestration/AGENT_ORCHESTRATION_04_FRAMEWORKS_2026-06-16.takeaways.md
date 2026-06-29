**This document is a plain guide to the main "toolkits" (called frameworks) that developers use when building AI agents - software that can think through a task and take actions on its own. It matters because choosing the wrong toolkit wastes months of work, and many teams pick a complicated one when a simple approach would do the job fine.**

**The main parts explained simply:**

- **Start simple - you may not need a framework at all** - Before picking any toolkit, ask whether a single AI call or a short, fixed sequence of steps can do the job. For most tasks, the answer is yes. Frameworks add hidden complexity that makes problems harder to find and fix.

- **Workflow vs. Agent** - A "workflow" follows a fixed path you draw in advance (like a flowchart). An "agent" decides its own next step as it goes. Use workflows when the task is predictable; use agents only when you truly cannot predict the path ahead.

- **LangGraph** - A toolkit where you map out every possible step and decision as a diagram (a "graph"). Best when you need full control, the ability to pause and resume long tasks, and a clear audit trail of what happened. The most powerful option, but also the hardest to learn.

- **CrewAI** - Lets you define AI agents as if they were team members with job titles (researcher, writer, reviewer). They work together automatically. Also has a "Flows" mode for more predictable, step-by-step control. Good for tasks that naturally split into team roles.

- **Microsoft AutoGen / AG2** - Agents that work by having a "conversation" with each other to solve a problem. Useful for code-writing tasks, but be cautious: the project has split into two competing versions and is merging with another Microsoft product - so the ground is shifting.

- **OpenAI Agents SDK** - A lightweight toolkit from OpenAI where one agent can hand off a task to another specialist agent (called "handoffs"). Includes built-in safety checks (guardrails) and logging. Easy to learn, but works best if you are already using OpenAI's AI models.

- **Claude Agent SDK (Anthropic)** - The same engine that powers Claude Code (the AI coding assistant). Best for tasks involving files, code, or computer use. Has built-in safety controls (hooks) and lets you add custom tools. Only works with Claude models.

- **Google ADK + A2A** - Google's toolkit for building agents, with a bonus: the A2A ("Agent2Agent") standard lets agents built on *different* toolkits talk to each other. Useful if you need agents from different systems or vendors to cooperate.

- **Microsoft Semantic Kernel** - A corporate-focused toolkit designed for teams using Microsoft's technology stack (.NET, Azure). Being merged with AutoGen into a single "Microsoft Agent Framework." Best for large enterprises already inside the Microsoft ecosystem.

- **LlamaIndex** - A toolkit built around searching and reasoning over large collections of documents. Best when the agent's main job is reading, finding, and summarizing information from big knowledge bases.

- **MCP vs. A2A protocols** - Two open standards that work together. MCP connects an agent to tools and data (what an agent can *do*). A2A connects agents to *other agents* across different systems. Think of MCP as giving an agent its hands, and A2A as letting it call a colleague.

**What to do with this:** Before choosing any toolkit, check whether a plain sequence of AI calls will do the job - it usually will. If you do need a framework, pick the lightest one that fits your situation using the comparison table in section 10, and always make sure you understand what it is doing underneath.
