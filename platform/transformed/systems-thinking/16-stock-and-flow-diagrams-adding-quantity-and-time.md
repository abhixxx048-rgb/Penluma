---
title: 'Stock and Flow Diagrams: The Bathtub That Explains Everything'
metaTitle: 'Stock and Flow Diagrams Explained Simply'
description: >-
  Stock and flow diagrams add quantity and time to systems thinking. Learn the
  bathtub model, the famous stock-flow error, and how to build your first one.
keywords:
  - stock and flow diagram
  - stock and flow diagram explained
  - what is a stock in systems thinking
  - difference between stock and flow
  - system dynamics
  - bathtub model systems thinking
  - causal loop diagram vs stock and flow
  - behavior over time graph
  - reinforcing and balancing loops
  - how to build a stock and flow model
  - Donella Meadows stock and flow
  - integral of net flow
faq:
  - q: What is the difference between a stock and a flow?
    a: A stock is a quantity that accumulates and would still exist if time froze, like water in a tub or money in an account. A flow is a rate that fills or drains a stock and is measured "per time," like litres per minute. Stocks are nouns; flows are verbs.
  - q: How do you tell if something is a stock or a flow?
    a: Ask one question, "If time stopped right now, would this thing still exist?" Stocks persist; flows vanish. A second check is units, stocks have no "per time" while flows always do.
  - q: Why does cutting CO2 emissions not immediately lower CO2 levels?
    a: Because the level of CO2 is a stock, and it keeps rising as long as emissions (inflow) exceed natural absorption (outflow). Slowing emissions only slows the rate of increase. The level falls only once emissions drop below absorption.
  - q: What is the bathtub error in systems thinking?
    a: It is the common mistake of assuming the stock graph mirrors the flow graph, so people think the water level drops when the faucet is turned down. In reality the level keeps rising as long as inflow beats outflow.
  - q: Do I need special software to build a stock and flow model?
    a: No. A spreadsheet handles small models perfectly. Use columns for time, stock, inflow, outflow, and net, then apply Stock_next = Stock_now + (inflow − outflow) × dt down the page.
  - q: What is a stock and flow diagram used for?
    a: It models how things accumulate and change over time, turning a vague causal loop diagram into a precise, runnable model with units and equations. It is the core tool of system dynamics.
topic: systems-thinking
topicTitle: Systems Thinking
category: Thinking & Decisions
date: '2026-06-22'
order: 15
icon: "\U0001F504"
author: Pritesh Yadav
transformed: true
sources:
  - 'https://en.wikipedia.org/wiki/Stock_and_flow'
  - 'https://en.wikipedia.org/wiki/System_dynamics'
---

Turn your faucet from a gush to a trickle. The water in the tub keeps rising. It rises more slowly, sure, but it still rises. Most people, including MIT graduate students, get this wrong and predict the level will drop.

That tiny mistake is one of the most expensive errors in human reasoning. It shows up in climate policy, in business growth, in personal savings, and in why your company's headcount keeps climbing even after a hiring slowdown. The cure is a single, beautifully simple diagram.

## Why this matters

You already know how to draw arrows between causes and effects. A causal loop diagram (CLD) does that well, showing what affects what and in which direction.

But arrows have a quiet weakness. They cannot tell you **how much** of anything there is, or **how fast** it is changing. No numbers, no units, no sense of time.

That gap is where bad decisions live. "We cut emissions, so the problem is shrinking." "Signups are up, so the business is growing." Both can be flatly false, and you cannot see why until you add the two missing ingredients: **quantity** and **time**.

The **stock-and-flow diagram** (SFD) adds exactly those. It is the working heart of a field called **system dynamics**, and once you learn to read it, you will spot bathtubs everywhere.

## The two characters: stocks and flows

Everything in this tool comes down to two roles.

A **stock** is a quantity that piles up or drains over time. It is the **noun** of the system. You can measure it at a single frozen instant, and its units never contain "per time."

- Water in a tank (litres)
- Money in an account (dollars)
- Active customers (people)
- CO2 in the air (gigatonnes)

A **flow** is a rate that adds to or removes from a stock. It is the **verb** of the system, and its units always contain "per time."

- A faucet (litres per minute)
- Deposits (dollars per month)
- New signups (people per month)

A flow that adds to a stock is an **inflow** (births, deposits, signups). A flow that removes from a stock is an **outflow** (deaths, withdrawals, churn). A flow cannot exist without a stock to fill or drain.

As Donella Meadows put it in *Thinking in Systems*, "A stock is just what it sounds like: a store, a quantity, an accumulation of material or information that has built up over time." More precisely, a stock is the system's **memory** of every flow that has ever happened.

### The speedometer and the odometer

Here is the analogy that makes it stick.

A **flow** is your car's **speedometer**. It tells you your rate right now: 60 km/h.

A **stock** is your **odometer**. It shows the total distance ever travelled.

Now the key move: when the speedometer falls (you slow down), the odometer does **not** go down. You are still moving forward, just more slowly. Confusing these two is the single most common mistake in the whole subject.

## The temporal test: how to tell them apart

Whenever you are unsure whether something is a stock or a flow, ask one question:

**"If time stopped right now, would this thing still exist?"**

- **Stocks persist.** Stop time and the water is still sitting in the tub.
- **Flows vanish.** A "faucet rate" needs time to pass to mean anything. Freeze time and there is no rate at all.

A second quick check uses units. Stocks have units with no "per time" (dollars). Flows have units with "per time" (dollars per month).

## The bathtub: the founding picture

This is the example that launched the field. Picture a bathtub with one tap and one drain.

- One **stock**: water in the tub, measured in litres.
- One **inflow**: the faucet, in litres per minute.
- One **outflow**: the drain, in litres per minute.

The level changes by one simple rule each moment:

**Water (next) = Water (now) + dt × (faucet rate − drain rate)**

Here *dt* is a small time step, say one minute. This is the **Euler method**, the simplest way software adds up a flow over time. The smaller the step, the more accurate the result.

Run the numbers and the magic appears:

- Faucet at 2 L/min, drain at 1 L/min: water rises at 1 L/min.
- Both at 1 L/min: the level holds perfectly steady, **even though water is moving the whole time.**

As Meadows said, "There's more than one way to fill a bathtub." You can raise the level by opening the tap *or* by closing the drain. That single sentence is worth more than most strategy decks.

## The mistake almost everyone makes

John Sterman at MIT studied how people reason about bathtubs. He found that most highly educated adults, including MIT students, get it wrong.

The error has a name: the **correlation heuristic**. People draw the *stock* graph as a copy of the *flow* graph. They expect the water level to fall the moment the faucet is turned down.

But the stock is the **accumulated area under the net-flow curve**, not the flow itself. As long as inflow still beats outflow, the level keeps **rising**, even while the inflow is dropping.

### The climate version of the bathtub

This is not a classroom curiosity. It governs the most important policy debate of our time.

CO2 in the atmosphere is a **stock**. Emissions add roughly 40 gigatonnes a year; nature absorbs about half. The net inflow of around 20 Gt/year keeps the stock climbing.

Even if humanity halved emissions tomorrow, net inflow would stay positive and the concentration would keep **rising**. The level stabilises only when emissions fall *below* absorption.

Confusing "we slowed the rate of increase" with "we lowered the level" is the bathtub error applied to the planet. Same mistake, much bigger stakes.

> **Key takeaway:** A stock is the running total (the integral) of its net flow. It can never jump instantly, which is why Meadows calls stocks "delays, buffers, or shock absorbers." Flows are volatile; stocks are slow and stable.

## Two worked examples you can feel

### A savings account (growth that accelerates)

Start with a balance of $1,000. Add a $200/month deposit and a 0.5%/month interest rate (6% a year), minus $50/month of withdrawals.

The interesting part is the interest. The bigger the balance, the more interest you earn; the more interest, the bigger the balance. The balance feeds itself.

That self-feeding pattern is a **reinforcing feedback loop**, and it bends a straight line into a curve that accelerates upward: exponential growth. The old **Rule of 72** captures it neatly, money doubles in roughly 72 ÷ (yearly % rate) years, so about 12 years at 6%.

### A customer base (the leaky bucket)

Start with 0 customers. Add 100 signups a month. Lose 5% of your customers each month to churn.

Picture a bucket with a hole. You pour signups in the top; churn leaks out the bottom. As the bucket fills, the leak grows, because churn is a percentage of whatever is inside. This is a **balancing feedback loop** that resists growth.

Eventually inflow equals outflow and the level holds steady, even though both are still flowing. The math is easy: 100 signups = customers × 0.05, so the system settles at **2,000 customers**.

The diagram makes your two levers obvious. To grow past 2,000, you must either pour faster (more signups) or plug the hole (lower the churn rate). Most companies obsess over the first and ignore the second.

## The four shapes on the page

Every SFD is built from just four pieces:

1. **Stock** — a **rectangle (box)**. The accumulation.
2. **Flow** — a **thick pipe with a valve** (a little tap). The valve sets the rate. Arrows into the box are inflows; arrows away are outflows.
3. **Cloud** — a **cloud shape** where a pipe crosses the edge of your model. A *source* cloud is an infinite supply outside the model; a *sink* cloud is infinite disposal outside it.
4. **Information connector** — a **thin curved arrow** from a stock to a valve. It says "the value of this thing influences that rate." It carries information, not material.

You will also constantly use an **auxiliary variable** (a small circle) that *calculates* an intermediate value for a flow equation, like a churn rate or a "fraction of market untapped." It stores nothing and changes no stock directly. Freeze time and it disappears, just like a flow.

Think of clouds as the edge of the map. When you draw your neighbourhood, it has a border, and everything beyond is simply "not drawn here." A cloud is that border, a deliberate decision about what is inside and outside your question.

## Material flows versus information flows

This distinction is real, not cosmetic.

**Material flows are conserved.** Water that leaves the tub goes somewhere.

**Information flows are not conserved.** Telling the interest formula that the balance is $5,000 costs nothing and depletes nothing.

A CLD uses the *same* arrow for both, which is exactly why it is ambiguous. An SFD draws material as thick pipes and information as thin arrows, so you always know which is which.

## Reading the output: behavior-over-time graphs

When you run a model, you get a **behavior-over-time (BOT) graph**: a stock or flow on the vertical axis, time on the horizontal. A handful of classic shapes recur:

- **Linear growth** comes from a constant net inflow.
- **Exponential growth** (the J-curve) comes from a reinforcing loop, like the savings account.
- **Goal-seeking decay** comes from a balancing loop.
- **S-curves** appear when reinforcing growth runs into a balancing limit, like the customer base hitting saturation.
- **Oscillation** and **overshoot-and-collapse** appear when feedback is *delayed*, like fisheries that boom then crash before the correction arrives.

One warning: a BOT graph shows *what* happened, never *why*. Two completely different systems can produce identical S-curves. To know whether you can change a behaviour, you must trace the loops in the diagram. Structure, not the picture, holds the answer.

## Common misconceptions

- **"Profit is a stock."** No. Profit is a flow (dollars per year). The stock it feeds is *retained earnings*. Model profit as a stock and it will wrongly pile up.
- **"Interest rate is a stock."** No. It is a constant that helps calculate a flow. Treat it as a stock and it will balloon over time for no reason.
- **"The level drops when I turn down the inflow."** Only if the inflow drops below the outflow. Until then, the level keeps rising.
- **"Boxes in a CLD make it a stock-and-flow diagram."** Not without pipes, valves, clouds, and equations. The real test: can you write an equation for every valve? If not, it has no computational meaning.
- **"A BOT graph explains itself."** It never does. The graph is the symptom; the loop structure is the cause.

## How to use this: turn a CLD into a runnable model

Follow these seven steps in order:

1. **Assign units** to every variable. Anything measured "per time" is a candidate flow.
2. **Identify the stocks** — the things that persist when time stops.
3. **Identify the flows** that raise or lower each stock, and mark each as inflow or outflow.
4. **Connect** stocks to flows with information connectors wherever a stock's level drives a rate.
5. **Add auxiliaries** — constants (market size) and calculated intermediates (fraction untapped).
6. **Write an equation** for every flow and auxiliary, then check that the units balance. A "people/month" flow cannot pour into a "dollars" stock. Unit checking is your main debugging tool.
7. **Add clouds** at the boundary, so every flow starts and ends somewhere.

And do not wait for fancy software. A spreadsheet handles 1 to 3 stock models perfectly:

- Columns: Time, Stock_t, Inflow, Outflow, Net, Stock_next.
- Set a small dt.
- Copy `Stock_next = Stock_t + (Inflow − Outflow) × dt` down the page.
- Plot the stock column to see your BOT graph.

When you outgrow the spreadsheet, free tools like **InsightMaker** (runs in a browser), **Vensim PLE**, and **STELLA** offer drag-and-drop modelling. But the five-column trick will teach you more about accumulation than any menu.

## Conclusion

If you remember one thing, remember this: **a stock is the running total of its net flow, so slowing a rate is not the same as lowering a level.** That single distinction quietly governs your savings, your customer base, and the carbon in the sky.

This tool came from Jay Forrester at MIT in the late 1950s and was made famous for managers by Peter Senge in *The Fifth Discipline*. Senge added no new shapes, but he noticed that the same stock-and-flow structures repeat across wildly different situations, naming them **systems archetypes** with names like Limits to Growth, Fixes That Fail, and Tragedy of the Commons.

Once you can spot those recurring patterns, you stop reinventing diagrams and start recognising old traps in new clothes. That is where we go next.
