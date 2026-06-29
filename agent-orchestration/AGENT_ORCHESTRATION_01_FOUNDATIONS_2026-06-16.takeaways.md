**This document explains what an "AI agent" actually is - and when it makes sense to build one. The word "agent" gets used loosely, so this doc gives you a clear way to think about it before you start building. The big idea: always use the simplest solution that works. Only add more complexity when the benefit is obvious.**

**The main parts explained simply:**

- **Three levels of AI systems** - There is a simple scale: (1) a single AI question-and-answer, (2) a "workflow" where the steps are fixed in code and the AI just fills in the blanks, and (3) a true "agent" where the AI decides its own next steps as it goes. Most tasks only need level 1 or 2.

- **The agentic loop** - What makes something an "agent" is that it works in a repeating cycle: look at the task → decide what to do → take an action (like searching the web or running a calculation) → read the result → repeat until done. This is different from a one-shot question you ask and get one answer.

- **ReAct: the simplest recipe for an agent** - A research paper called ReAct showed that if you let an AI write down its thinking ("thought"), take an action, then read the result ("observation"), and repeat, it makes far fewer mistakes than just asking it once. It outperformed older methods by 10–34%.

- **Five workflow patterns** - Before building a full agent, consider simpler fixed patterns: chaining steps in order, routing different inputs to different paths, running tasks in parallel, using one AI to coordinate others, or having one AI check another's work. Most "I need an agent" problems are actually one of these, which are cheaper and more predictable.

- **Single agent vs multiple agents** - Using multiple AI agents working together can improve results dramatically (one study: 90% improvement on research tasks), but it costs roughly 15 times more to run than a simple AI chat. Coordination between agents also breaks down in many ways - about a third of multi-agent failures are just agents misunderstanding each other.

- **The decision ladder** - A simple checklist to decide how much AI you actually need: Can one good AI call solve it? → stop there. Are the steps fixed? → use a workflow. Does the AI need to figure out its own path? → use a single agent. Is that agent overloaded with too many tools, and is the task high-value enough to justify the cost? → only then use multiple agents.

- **Tool design matters** - The tools an agent can use (search, calculate, send emails, etc.) need to be designed carefully. One team found that improving tool descriptions alone cut task completion time by 40%.

**What to do with this:**

Start with the simplest thing that solves your problem - a good prompt or a fixed script. Only move to agents or multi-agent systems when the task genuinely cannot be handled with simpler steps, and only when the value of the task justifies the significantly higher cost.
