**This document is a catalogue of the different ways you can wire multiple AI "agents" together to get work done. Think of it like choosing the right factory floor layout - depending on the job, you arrange workers differently. Knowing these patterns helps you pick the right one instead of defaulting to the most complicated (and expensive) option.**

**The main parts explained simply:**

- **Workflows vs. Agents** - A workflow follows a fixed script you write in advance; an agent figures out its own next steps on the fly. Fixed scripts are cheaper and more predictable. Agents are more flexible but cost more and make more mistakes. The advice: start simple, only add agent-style thinking when the fixed script clearly isn't good enough.

- **Prompt chaining (step-by-step pipeline)** - Pass the output of one AI call straight into the next, like an assembly line. Good for tasks with clear, fixed steps (write → translate → check). Fragile if an early step goes wrong, because the mistake flows through every step after it.

- **Routing / dispatch** - A first AI reads the incoming request and sends it to the right specialist. Like a receptionist who decides which department handles your call. Breaks down when the categories are fuzzy and the receptionist keeps sending people to the wrong desk.

- **Parallelization** - Run several AI calls at the same time and combine the results. Two flavours: split a big task into independent chunks (faster), or run the same task multiple times and take the majority answer (more accurate). Only works when the pieces genuinely don't depend on each other.

- **Orchestrator-worker (lead agent + helpers)** - A lead AI plans the job, splits it into subtasks on the fly, hands each to a helper AI, then combines everything. Anthropic's internal research tool uses this and runs up to 90% faster than doing it in sequence. Downside: it can wildly over-spawn helpers, helpers duplicate each other's work, and it uses roughly 15× more tokens (and cost) than a simple chat.

- **Evaluator-optimizer (writer + critic loop)** - One AI writes a draft; a separate AI critiques it; the writer revises. Loops until the critic is satisfied. Good when you can clearly define what "good enough" looks like. Risks: the loop never ends without a hard stop, and the two AIs can settle on a mediocre answer they both agree on.

- **Hierarchical / supervisor trees** - A top manager routes tasks to team supervisors, who each manage a group of specialist workers. Easy to audit and trace, but every extra level adds delay, and the top manager is a single point of failure.

- **Blackboard / shared-state** - All agents read and write to a shared noticeboard. No one talks directly to anyone else - agents just post updates and pick up whatever they can help with. Efficient for discovery-style tasks, but the scheduling logic (who writes next) is the hard part to get right.

- **Network / handoff (swarm)** - Agents hand control directly to each other, no manager in the middle. Faster and simpler than a supervisor tree for conversational tasks where the specialist should just answer the user directly. Hard to trace when something goes wrong because there is no central record of decisions.

- **Debate & ensemble voting** - Multiple AIs each give an answer, then critique each other's reasoning over several rounds until they agree. Reduces hallucination on hard factual or maths questions. Expensive. Research also shows a single AI with the same token budget can sometimes beat a whole debate panel.

- **Map-reduce over large documents** - Break a huge document into chunks, summarize each chunk independently, then combine the summaries. The only practical way to handle content that is too long to fit in one AI call. Loses cross-document connections that only become visible when you read the whole thing.

- **Reflection / self-improvement loop (ReAct, Reflexion)** - A single AI acts, checks its own result, criticizes itself, and tries again - repeating until it meets a quality bar or hits a retry limit. Useful when there is a clear right/wrong signal (tests pass or fail). Risk: the AI may not see its own blind spots, and the loop can reinforce a wrong approach rather than escape it.

**What to do with this:**

Always start with the simplest pattern (a plain step-by-step chain or a single prompt). Only move to multi-agent, orchestrator-worker, or debate patterns when simpler approaches have clearly failed - those advanced patterns cost 10–15× more and introduce new ways to go wrong. When you do pick a more complex pattern, choose one where every decision is traceable (supervisor trees beat swarms for anything you need to audit).
