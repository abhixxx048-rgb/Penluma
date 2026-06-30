---
title: 'How AI Agents Talk to Each Other: MCP, A2A & Handoffs'
metaTitle: 'How AI Agents Communicate: MCP, A2A, Handoffs'
description: >-
  A plain-English guide to how AI agents share state, hand off control, and use
  tools - covering MCP, A2A, handoffs, and structured outputs that actually work.
keywords:
  - how AI agents communicate
  - MCP protocol
  - Model Context Protocol
  - A2A protocol
  - agent2agent protocol
  - agent handoffs
  - multi-agent systems
  - agent orchestration
  - structured outputs LLM
  - blackboard architecture
  - message passing agents
  - LangGraph state
  - tool calling
  - agent coordination
faq:
  - q: What is the difference between MCP and A2A?
    a: >-
      MCP (Model Context Protocol) connects one agent to its tools and data -
      the vertical link. A2A (Agent2Agent) connects agents to each other so they
      can delegate tasks - the horizontal link. They are complementary, not
      competing, and most production systems use both.
  - q: What is an agent handoff?
    a: >-
      A handoff is when one agent passes control of a task to another, more
      specialized agent. Two things can move: control (who is driving) and
      context (what information the new agent receives). Good systems use an
      explicit handoff primitive rather than letting agents call each other
      directly.
  - q: Why do AI agents need structured outputs?
    a: >-
      When agents pass each other free-form text, parsing is fragile and breaks
      silently. Plain JSON without schema enforcement fails 8–15% of the time,
      while schema-enforced structured outputs push that failure rate below 0.2%.
  - q: When should you use a multi-agent system instead of a single agent?
    a: >-
      Use multiple agents for broad, parallelizable work like research, where
      independent subagents explore different angles at once. Avoid it for tasks
      that need tightly shared context or heavy back-and-forth - and remember it
      can cost roughly 15× the tokens of a normal chat.
  - q: What is the blackboard architecture in multi-agent systems?
    a: >-
      A blackboard is a shared, globally accessible knowledge base that agents
      read from and write to instead of messaging each other directly. It cuts
      message traffic and adds transparency, but introduces consistency and
      concurrency challenges when several agents touch the same state at once.
author: Pritesh Yadav (priteshyadav444)
transformed: true
linked: true
topic: agent-orchestration
topicTitle: Multi-Agent LLM Systems
category: AI & LLMs
date: '2026-06-16'
order: 999
icon: "\U0001F916"
sources:
  - https://www.anthropic.com/news/model-context-protocol
  - https://en.wikipedia.org/wiki/Model_Context_Protocol
  - https://www.anthropic.com/engineering/built-multi-agent-research-system
  - https://a2a-protocol.org/latest/specification/
---

Build one AI agent and it feels like magic. Build five and wire them together, and you discover the real work was never the intelligence - it was the plumbing.

A team of agents is only as good as the way they talk to each other and to the outside world. Get the wiring wrong and they duplicate effort, lose track of who is in charge, and quietly corrupt each other's data. Get it right and you can cut a research task's time by up to 90%.

This is a guide to that plumbing: how agents share information, pass control, split a big job and reassemble it, and which open protocols - **MCP** and **A2A** - are becoming the standard wiring.

## Why this matters

An "agent" here just means [a software helper, powered by a large language model](/blog/agent-orchestration/agent-orchestration-01-foundations), that can take actions on its own - searching the web, querying a database, calling another agent. One agent is a chatbot with hands. Several agents working together is a small organization, and organizations live or die by communication.

If you are building anything beyond a single prompt - a research assistant, a customer-support flow, a coding helper that delegates - you will hit these exact questions:

- How do agents pass information without drowning each other in noise?
- When one agent hands off to another, what actually moves?
- How do you split a task so workers don't trip over each other?
- How do agents from different vendors even find each other?

The answers have crystallized fast in 2024–2025, and they are surprisingly learnable. Two simple layers run through everything below. Keep them in your head:

- **The capability layer (vertical):** an agent reaching down to its tools and data. This is where **MCP** lives.
- **The coordination layer (horizontal):** agents talking sideways to each other. This is where **handoffs** and **A2A** live.

Almost every confusing thing about agent communication gets clearer once you know which layer you're looking at.

## How agents share information: two foundational styles

There are two classic ways to make a group of agents communicate. Everything else is a remix of these.

### Message passing: agents talk directly

In **message passing**, agents converse one-to-one, like coworkers sending each other emails. Each agent keeps its own private memory and shares only what it chooses to, through explicit messages.

Think of a relay race. Each runner holds the baton alone, then deliberately hands it over.

- **The upside:** flexibility and independence. Agents keep their own state, so they don't accidentally step on each other.
- **The downside:** overhead. Every handoff costs a message, and as the team grows the conversation fragments. You get redundancy, scattered context, and a lot of chatter.

### The blackboard: agents share one whiteboard

In a **blackboard architecture**, there is no direct messaging. Instead, every agent reads from and writes to a single shared knowledge base - the "blackboard." Each agent watches the board, and whenever it can add value, it posts its contribution back.

Picture a detective squad around one big whiteboard. Nobody emails anybody. They watch the board, add a clue when they have one, and the case advances when the board says it's solved.

- **The upside:** far less message traffic, high transparency, and loose coupling. Anyone can see the whole picture.
- **The downside:** it's a shared resource, so you need versioning and access control. When several agents read and edit the same spot at once, you get the classic concurrency headaches - two agents overwriting each other's work, or reading half-finished state.

### The trade-off in one glance

| | Message passing | Blackboard (shared memory) |
|---|---|---|
| Coordination | Explicit, per message | Implicit - watch and update |
| Message traffic | High, grows with team size | Low |
| Main failure mode | Fragmented context, overhead | Concurrency and consistency bugs |
| Visibility | Hard to see the whole | High transparency |

Shared state cuts the chatter but adds concurrency complexity. Message passing keeps agents independent but multiplies overhead. There's no free lunch - just a choice that fits your problem.

### The practical middle: LangGraph's state object

Most production systems don't pick a pure style. The popular framework **LangGraph** is built around a shared **state object** - a structured "collaborative whiteboard" every step can read and update - combined with an explicit, graph-shaped control flow that decides who acts next.

It supports both completely overwriting a value and simply appending to it, which keeps the shared data consistent. That blend - blackboard-style memory plus explicit routing - is why it has become a default choice for real graphs.

## Handoffs: what actually moves when one agent takes over

A **handoff** is the moment one agent delegates to another. The key insight that trips people up: two completely different things can move during a handoff, and you should track them separately.

- **Control transfer** - *which* agent is now driving the conversation.
- **Context transfer** - *what* information the receiving agent gets to see.

You can move one without the other, and deciding what to pass is where good systems separate from fragile ones.

### How the major frameworks do it

In the **OpenAI Agents SDK**, a handoff transfers control entirely: the receiving agent becomes the active agent and replies to the user directly. The clever part is how it's represented - a handoff to a "Refund Agent" shows up to the model as a tool literally named `transfer_to_refund_agent`. To the model, handing off to a colleague looks exactly like calling a tool. (This SDK is the production successor to Anthropic-independent "Swarm," an experimental prototype that is no longer maintained.)

**LangGraph** has the same shape with different mechanics. Agents transfer control through an explicit primitive - `Command(goto=...)` routes to a named node - rather than calling each other directly. It also offers an `interrupt` primitive for clean human-in-the-loop pauses.

### The one rule both frameworks agree on

> **Use an explicit handoff primitive. Never let agents call each other directly.**

This sounds bureaucratic until you've debugged the alternative. Direct agent-to-agent function calls create tangled webs nobody can reason about. Explicit handoffs enforce **ownership boundaries** - clear "this is now your job" checkpoints - so at any moment you know exactly who is responsible.

A simple mental model:

```
[Triage Agent] --transfer_to_refund_agent--> [Refund Agent]
       ^                                            |
       └──────────────  handoff back  ─────────────-┘
(control moves to Refund; Triage goes idle until handed back)
```

**Use a handoff when** there's a clear specialization and a clean boundary. **Don't** reach for one when the work needs tight back-and-forth on shared context - that's a tool call or sub-agent inside one owner, not a control transfer.

## Splitting a big job: the orchestrator-worker pattern

The clearest real-world example of task decomposition is Anthropic's multi-agent research system. It uses an **orchestrator-worker** (also called lead-and-subagent) pattern, and the lessons from building it are gold.

Here's the shape:

```
                ┌──────────────┐
                │ Lead agent   │  plan → spawn → synthesize → need more?
                └──────┬───────┘
        ┌──────────────┼──────────────┐
   ┌────▼───┐     ┌────▼───┐     ┌────▼───┐
   │ Sub A  │     │ Sub B  │ ... │ Sub N  │   (each in its own isolated context)
   └────────┘     └────────┘     └────────┘
        └──────── findings ──────-┘
                       ▼
                [Citation pass]   (separate step to attribute claims to sources)
```

A **lead agent** analyzes the query, makes a plan, and spawns several **subagents** to explore different angles in parallel. Each subagent works in [its own context window](/blog/agent-orchestration/agent-orchestration-05-context-memory) - its own clean workspace - which lets them reason independently and scale past what a single agent could hold.

### The decomposition lesson: be explicit, or pay for it

Early versions of the system failed in a memorable way. Given vague instructions, multiple subagents would investigate the *same* topic, duplicating effort. Some spawned 50 subagents for a trivial question. Others scoured the web endlessly for sources that didn't exist.

The fix was precise delegation. Every subagent needs four things spelled out:

1. **An objective** - what exactly to find.
2. **An output format** - how to report back.
3. **Tool and source guidance** - where to look.
4. **Clear boundaries** - where its job ends.

They even baked scaling rules into the prompts, so the lead matches effort to the question:

| Query type | Subagents | Tool calls each |
|---|---|---|
| Simple fact-finding | 1 | 3–10 |
| Comparisons | 2–4 | 10–15 |
| Complex research | 10+ | divided responsibilities |

The single biggest lever turned out to be **prompt engineering** - small changes in wording separated efficient research from wasted effort.

### Putting the pieces back together

Subagents return their findings to the lead, which synthesizes them and decides whether more digging is needed. A separate citation pass then attributes each claim to its source. The lead even saves its plan to memory *before* launching workers, so that if context fills up near the token limit, the orchestration survives.

The payoff is real: running subagents in parallel cut research time by up to 90% on complex queries, and the multi-agent setup substantially outperformed a single agent on broad, parallelizable research.

But it isn't free - more on that below.

## The open protocols: MCP and A2A

Two open standards have emerged to replace one-off custom integrations. Knowing which is which removes most of the confusion in this space.

### MCP - connecting an agent to its tools and data

The **Model Context Protocol (MCP)**, introduced by Anthropic in November 2024, is an open standard for connecting AI systems to external data and tools. Before it, every model-plus-data-source combination needed its own custom connector - the "N×M" integration mess. MCP replaces that with a single protocol you build against once.

It uses a simple **client-server** model. You either expose your data through an **MCP server**, or build an AI app that acts as an **MCP client** and connects to those servers. When they connect, the server advertises what it can do.

MCP organizes everything into three primitives - and who controls each one is the elegant part:

| Primitive | Controlled by | What it is |
|---|---|---|
| **Tools** | The model | Functions the model can invoke - actions and queries |
| **Resources** | The app | Data the app exposes - files, records |
| **Prompts** | The user | Reusable prompt templates a person can trigger |

Under the hood it runs on JSON-RPC and borrows ideas from the Language Server Protocol that powers code editors. The adoption curve has been steep: pre-built servers exist for tools like Google Drive, Slack, GitHub, and Postgres, and MCP has gone from a niche release to one of the most widely adopted agent standards.

### A2A - connecting agents to each other

Google's **Agent2Agent (A2A)** protocol, announced in April 2025 with 50+ partners, answers the other question: how do agents *built by different vendors* discover each other and collaborate?

Its defining trait is **opacity**. Agents cooperate without exposing their internal state or tools to each other - they share only what they declare. Think contractors who agree on the deliverable without handing over their private workshops.

The pieces:

- **Agent Cards** handle discovery. Every A2A agent publishes a small JSON document at a well-known address (`/.well-known/agent-card.json`) describing its identity, endpoint, supported features, and security. It's a digital business card other agents can read before deciding to work with it.
- **Tasks** are the unit of work. Each has a unique ID and moves through a clear lifecycle - submitted, working, then a terminal state like completed, failed, or canceled - with pause points for when it needs more input or authentication. Once a task reaches a terminal state, no more messages can change it.
- **Messages vs. Artifacts.** A2A deliberately separates communication (Messages) from results (Artifacts). The back-and-forth is preserved as history; the actual outputs are delivered as artifacts. This keeps "what we said" and "what we produced" cleanly apart.

A2A speaks several transports (JSON-RPC, gRPC, REST), streams updates in real time, and ships with enterprise security like OAuth and mTLS built in.

## Why "give it a tool" and "give it a colleague" look the same

Here's a unifying idea worth sitting with. **Tool calling** - letting a model invoke a predefined function with structured parameters - is the base mechanism for an agent to act. But it quietly doubles as the coordination mechanism too.

Remember how the OpenAI SDK exposes a handoff as a tool named `transfer_to_<agent>`? That means delegating to a colleague is *mechanically identical* to calling a tool. MCP tools are model-controlled functions; A2A delegations are tasks. At the API level, "give the agent a tool" and "give the agent a colleague" look the same - the model just picks which one to invoke, and the framework routes control accordingly.

That's not an accident. It's the substrate that makes the whole ecosystem composable.

## Making messages reliable: structured outputs

None of this works if agents can't reliably understand each other. When one agent sends another free-form text, parsing is fragile and fails silently. The fix is **structured outputs** - forcing a model's response to match a defined schema, so the receiver can parse it deterministically.

The numbers make the case better than any argument:

| Approach | Schema compliance |
|---|---|
| Structured outputs with a full schema attached | ~99.8–99.9% |
| Plain JSON mode, no schema enforcement | **fails 8–15% of the time** |

An 8–15% silent failure rate is a disaster when one broken message can derail a whole workflow. Schema enforcement pushes that under 0.2%, for a small token cost. There are two related mechanisms worth distinguishing:

- **Structured outputs** guarantee the *shape of the response* - perfect for typed messages between agents.
- **Function/tool calling** has the model pick a function and supply parameters - perfect for taking actions.

Both A2A's structured Parts and MCP's JSON payloads lean on this. Typed, validated exchange is what makes agent collaboration dependable instead of hopeful.

## Common misconceptions

**"MCP and A2A compete - I should pick one."**
No. They live on different layers. MCP wires an agent *down* to its tools and data; A2A wires agents *across* to each other. A typical production system uses MCP under each agent and A2A between them. Most serious deployments use both.

**"More agents always means better results."**
Not even close. [Multi-agent systems](/blog/agent-orchestration/agent-orchestration-00-index) shine on broad, parallelizable work like research. For tasks with heavy interdependencies or shared context - including most coding tasks, which have fewer truly parallel parts than research - a single agent is often better.

**"A blackboard is simpler than message passing because there's less chatter."**
Less traffic, yes - but you trade it for concurrency and consistency problems. Simpler on the surface, trickier underneath.

**"Agents can just talk to each other directly."**
They can, and you'll regret it. Direct calls create tangles nobody can reason about. Explicit handoffs keep ownership boundaries clean.

**"Structured outputs are a nice-to-have."**
At an 8–15% failure rate for unenforced JSON, they're load-bearing infrastructure for any multi-agent system.

## How to use this

If you're designing or debugging a multi-agent system, here's a concrete checklist.

1. **Choose a coordination model on purpose.** Use a shared-state/blackboard approach (like a LangGraph state object) for transparency and low traffic; use message passing when you need agents fully decoupled. Most production systems land on the hybrid.
2. **Make every handoff an explicit primitive.** Never let agents call each other directly. This is the one rule [both major frameworks](/blog/agent-orchestration/agent-orchestration-04-frameworks) agree on.
3. **Decide per handoff what context to pass.** The receiving agent should get *exactly* what its sub-task needs - no more (which causes context pollution and spreads errors) and no less (which causes duplicated work and hallucinated gaps).
4. **Write explicit contracts for subagents.** Spell out objective, output format, tools, and boundaries. Vague delegation is how you end up with 50 subagents on a trivial query.
5. **Budget tokens like money.** Multi-agent work can [cost roughly 15× a normal chat](/blog/agent-orchestration/agent-orchestration-07-cost-performance). Reserve it for high-value, breadth-first, parallelizable tasks.
6. **Enforce a schema on every inter-agent message.** Turn on structured outputs. Don't ship raw JSON mode and hope.
7. **Isolate context per agent.** Give each its own workspace to cap the blast radius of any one error, and persist the orchestration plan before spawning workers.
8. **Wire MCP under each agent, A2A between agents.** Apply least-privilege auth at each layer.

## Conclusion

The single takeaway: **the intelligence is in the models, but the reliability is in the wiring.** A multi-agent system succeeds or fails on how deliberately you manage who is driving, what context moves, and how messages are validated - not on how clever any individual agent is.

Keep the two layers straight - MCP reaching *down* to tools, A2A reaching *across* to peers - and most of the confusion dissolves. The rest is discipline: explicit handoffs, tight contracts, enforced schemas, isolated context.

And here's the thread worth pulling next. We've assumed the agents in a system mostly trust each other. But once agents from different vendors start discovering and delegating to strangers across the open internet, a new question takes over: how do you know the agent you just handed a task to is honest, authorized, and safe? That - trust, identity, and security between autonomous agents - is where this story gets genuinely interesting.
