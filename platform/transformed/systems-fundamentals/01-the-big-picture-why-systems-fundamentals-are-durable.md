---
title: 'Systems Fundamentals: The Skills That Outlast Every Framework'
metaTitle: 'Systems Fundamentals That Stay Relevant'
description: >-
  Why systems fundamentals like latency, storage, and the four pillars stay
  useful for decades while frameworks churn - and how to use them to build faster.
topic: systems-fundamentals
topicTitle: Systems Fundamentals
category: Engineering
date: '2026-06-21'
order: 0
icon: ⚙️
keywords:
  - systems fundamentals
  - data engineering basics
  - latency numbers every programmer should know
  - bandwidth vs latency
  - storage hierarchy
  - distributed systems explained
  - N+1 query problem
  - find the bottleneck
  - computer memory hierarchy
  - why fundamentals matter
  - cache miss cost
  - performance optimization basics
faq:
  - q: What are systems fundamentals in computing?
    a: >-
      They are the layer beneath your code: how a computer physically moves data
      through the CPU, memory, disk, and network, and how separate machines and
      threads coordinate. They explain why a design choice is fast or slow.
  - q: Why do systems fundamentals stay relevant for decades?
    a: >-
      Because they are bounded by physics and information theory, not fashion.
      The speed of light and the cost of a cache miss do not change when a new
      framework ships, so what you learn keeps paying off.
  - q: What is the difference between bandwidth and latency?
    a: >-
      Bandwidth is how much data you can move per second; latency is how long one
      round trip takes. You can buy more bandwidth, but you cannot buy latency
      below the speed of light - to cut latency, cut distance.
  - q: What is the N+1 query problem?
    a: >-
      It is when code loops over items and makes one separate database call per
      item instead of one batched query. Each call is a slow network round trip,
      so 100 items can mean seconds of waiting. The fix is a single query.
  - q: Do AI and LLMs make systems fundamentals obsolete?
    a: >-
      No. LLMs are strongest at boilerplate and weakest at deep system reasoning.
      They will happily write slow, chatty code. Fundamentals are how you catch
      those mistakes and supervise AI output instead of trusting it blindly.
  - q: What is the most important systems skill to learn first?
    a: >-
      Finding the bottleneck resource - CPU, memory, disk, network, or time -
      before optimizing anything. Speeding up a resource that is not the
      constraint buys you nothing.
author: Brexis Wazik
transformed: true
polished: true
linked: true
sources: []
---

A reference table of computer latency numbers was popularized back in 2012. It is still essentially correct in 2026. In an industry where the "framework of the month" expires before your coffee gets cold, that is almost unheard of.

So here is a question worth answering before you touch a single database or network protocol: why learn this stuff at all, and why will it still be useful in twenty years? Think of what follows as the map for everything else. Stick with it and the rest will hang off a few ideas you already understand.

## Why this matters

Every interesting decision an engineer makes is secretly a bet on a physical resource. Batch or stream? Add an index or scan the whole table? Copy the data or split it across machines? Use a lock or a queue?

Each of those is a wager about *what the machine is physically doing* and how much that costs. If you do not understand the resource, you are guessing. And guessing is how you end up with a page that takes five seconds to load and a team that cannot explain why.

The payoff is durability. Time spent memorizing one tool's exact function names depreciates within a couple of years. Time spent understanding *why* a cache miss is expensive pays off for your entire career.

## Two terms, in plain language

**Data engineering** is the job of moving, storing, shaping, and serving data reliably and at scale. "At scale" just means it keeps working when the data or the number of users gets very large. A data engineer builds the pipes and storage that other people use - the analysts making charts, the apps customers click, the machine-learning models that need feeding. Think of it as plumbing for information.

**Systems fundamentals** are the layer *underneath* that work: how a computer actually executes a task. How bytes move through the CPU, the memory, the disk, and the network. How separate machines and separate threads of work coordinate without stepping on each other.

The whole thesis is one sentence: **you cannot build good data systems without understanding the machine underneath them.** Data engineering is the *what*. Systems fundamentals are the *why and how*. The second is what makes the first reliable.

## The four pillars (and the secret they share)

Almost everything in computer systems rests on four load-bearing topics. Picture them as four faces of a single problem: *get the right data to the right place, correctly, fast enough.*

- **Databases - the storage pillar.** How data is saved on durable media (storage that survives a power cut), organized so you can find things fast, queried, and kept correct. [Indexes, transactions, and the on-disk structures behind them](/blog/systems-fundamentals/05-databases-ii-how-databases-store-find-data-fast-indexes-b-trees-lsm).
- **Distributed systems - the scale and failure pillar.** What you do when one machine is not enough: [copy data to several machines, split data across them, get machines to agree, and survive crashes](/blog/systems-fundamentals/09-distributed-systems-many-computers-working-as-one).
- **Networking - the movement pillar.** How bytes physically travel between machines: packets, [the TCP/IP protocols](/blog/systems-fundamentals/07-networking-i-how-data-travels-ip-tcp-udp-dns), the hard limit set by the speed of light, and the difference between bandwidth and latency.
- **Concurrency - the coordination pillar.** Doing many things at once on *one* machine without corrupting your data: [threads, locks, race conditions, and async input/output](/blog/systems-fundamentals/03-concurrency-parallelism-doing-many-things-at-once).

Here is the punchline that ties them together: **a distributed database is all four pillars at once.** It is a database (one), copied over a network (three), accessed by many users concurrently (four), spread across many machines (two). Learn the four pillars and you can reason about the hardest systems out there.

> **An analogy.** Think of one click on a website as a parcel's journey. It travels down a road (networking), is handled by busy workers sorting many parcels at once (concurrency), arrives at a warehouse with branches in several cities (distributed systems), and is finally placed on a physical shelf (the database). One click touches all four.

## Why these skills barely change in 30 years

Programming languages, cloud providers, and tools churn constantly. Yet the gap between the fastest and slowest places a computer can store data has stayed roughly the same for *decades*.

The reason is simple: fundamentals are bounded by **physics and information theory, not by fashion.**

- The speed of light is a hard floor.
- The cost of a **cache miss** - asking for data, finding it is not in the fast nearby memory, and having to fetch it from somewhere slower - is a hard floor.
- The impossibility of instantly agreeing across an unreliable network is a hard floor.

Nobody buys their way past these with money or a newer library. When the famous latency table was popularized around 2012, only disks and networks got faster since - and only by a constant factor, not by changing category. The shape of the world is the same.

## The mental model: a computer as a stack of layers

The cleanest way to picture a computer is as a stack you pass *through* to get work done. Each layer up adds abstraction (hiding messy detail) and, usually, more delay.

```
+-----------------------------------------------+
|  DATA      tables, files, messages, objects   |  what we care about
+-----------------------------------------------+
|  NETWORK   sockets, TCP/IP, other machines    |  slowest hops live here
+-----------------------------------------------+
|  PROCESS   your program: threads, heap, stack |  concurrency lives here
+-----------------------------------------------+
|  OS        scheduler, virtual memory, syscalls|  the referee
+-----------------------------------------------+
|  HARDWARE  CPU, caches, RAM, SSD, network card|  physics lives here
+-----------------------------------------------+
        (reaching DOWN or ACROSS = slower)
```

Three ideas to lock in:

- **The operating system is a referee.** It shares one CPU and one pool of memory among many running programs, taking turns so fast it looks simultaneous, while stopping programs from corrupting each other.
- **A system call is a controlled trip down to the OS** - "open this file," or "send this on the network." It costs roughly a microsecond or more. Cheap compared to disk, but expensive compared to a plain function call inside your program.
- **Crossing a layer boundary costs time.** Reading a variable touches just the CPU and RAM. Reading a row from a database on another continent touches *every* layer, network included. **Most performance bugs are simply "we accidentally reached across an expensive boundary inside a loop."**

## The latency numbers worth knowing

**Latency** means "how long until I get an answer" - the delay before a single operation completes. Below are the canonical numbers, from the Jeff Dean and Peter Norvig lineage.

Do not memorize the exact figures. Memorize the **orders of magnitude** - the powers of ten and the ratios.

| Operation | Approx. time | Relative to L1 |
|---|---|---|
| L1 cache read (tiny on-chip memory) | 0.5 ns | 1× |
| Branch mispredict | 5 ns | ~10× |
| L2 cache read | 7 ns | ~14× |
| Mutex lock/unlock | 25 ns | ~50× |
| Main memory (RAM) read | 100 ns | ~200× |
| Send 1 KB over 1 Gbps network | ~10 µs | ~20,000× |
| Random 4 KB read, SSD (NVMe today ~10–70 µs) | ~150 µs | ~300,000× |
| Round trip, same datacenter | ~0.5 ms | ~1,000,000× |
| HDD (spinning disk) seek | ~10 ms | ~20,000,000× |
| Round trip, Virginia ↔ Ireland | ~68 ms | ~130,000,000× |
| Round trip, California ↔ Netherlands | ~150 ms | ~300,000,000× |

The shape that matters: roughly **every step down the storage hierarchy is about 10–100× slower than the one above it.** RAM is ~100× slower than L1 cache. SSD is ~1000× slower than RAM. A disk seek and an intercontinental round trip are *millions* of times slower than L1.

> **Make it human.** Multiply every time by a billion, so one CPU cycle feels like one second. Now L1 cache = half a second. RAM = under two minutes. An SSD random read = about 1.7 days. A same-datacenter round trip = ~6 days. A disk seek = ~4 months. A California-to-Netherlands round trip = ~4.8 *years*. Suddenly "never call the network inside a loop" feels obvious. You would never run a years-long errand a hundred times in a row.

> **Another picture: the storage hierarchy as a library.** A fact in your head = L1 cache (instant). A book open on your desk = RAM (a glance). A book across the room = SSD (get up and walk). A book in another building = a spinning disk (drive across town). A book mailed from another country = a cross-region network call. Every step is dramatically slower than the last.

## Bandwidth is not latency

This trips up nearly everyone, so slow down here.

- **Bandwidth** is *how much* data you can move per second.
- **Latency** is *how long* one round trip takes.

They are two separate budgets. You can *buy* bandwidth - add more or fatter pipes. You **cannot** buy latency below the speed of light.

Light in fiber travels at about two-thirds the speed of light, roughly 4.9 microseconds per kilometer one-way. So a 5,500 km link from Virginia to Ireland can never beat about 27 ms one-way - roughly 54 ms round trip. The measured cloud round trip is ~68 ms: physics plus a little routing overhead. No CDN, no upgrade, no money removes that floor.

> **An analogy.** A cargo ship versus a sports car. The ship has huge bandwidth but terrible latency. The car carries little but arrives fast. Mailing a truck full of SSDs across the country can beat the internet on *bandwidth* - but it is hopeless on *latency*. Pick the right tool for the budget that is actually tight.

## The five resources, and the one skill that matters most

Every system runs against a fixed budget of physical resources. Engineering is deciding which to spend and which to conserve.

- **CPU** - compute cycles. Tight when you are CPU-bound: hashing, compression, parsing, ML inference. Add cores, but then you need concurrency to use them.
- **Memory (RAM)** - fast, but small, expensive, and *volatile* (wiped when power is lost). Tight when the data you are actively using does not fit. Overflowing spills to disk - a 1000×+ cliff.
- **Disk / storage** - durable, large, cheap, slow. Tight on capacity and especially on random operations per second. *Sequential* access (reading data laid out in order) is far cheaper than *random* access (jumping around). This is why databases love append-only logs and big ordered scans.
- **Network** - two budgets again: bandwidth (scalable) and latency (physics-bound).
- **Time** - the meta-constraint, the one users actually feel. A budget like "respond within 200 ms" forces every other trade-off.

The core craft is this: **find the bottleneck resource first.** Optimizing anything else buys nothing.

> **A worked example.** An API endpoint loops over 100 items and makes one database call per item. Each call is a ~50 ms network round trip. 100 × 50 ms = **5 seconds**, almost all of it spent waiting on the network. Doubling the CPU speed changes nothing - the CPU is idle, waiting. The fix is to replace 100 calls with *one batched query*. This is the famous **[N+1 query](/blog/system-design/04-databases-internals)** bug, and it is the single most common performance problem in real systems.

## Common misconceptions

**"AI and LLMs make fundamentals obsolete."** The opposite is true. LLMs are great at the churny surface - boilerplate, glue between APIs - and weakest at deep system reasoning, the *why is this slow or wrong* part. An AI will happily write code that gets dramatically slower as input grows, or makes a network call inside a loop. Only someone with the mental model catches it. Fundamentals are how you *supervise* AI output instead of being misled by it. And modern machine learning is itself a brutal systems problem: its bottleneck is usually data movement, not the math.

**"A faster CPU makes everything faster."** A request stuck waiting on a 50 ms database call is not helped by a faster CPU - the CPU is already idle. Measure first, then optimize the constraint you actually have.

**"Buy a faster pipe to fix slowness."** A bigger pipe only helps bandwidth. If latency is your problem, more bandwidth does nothing.

## How to use this

1. **Measure before you optimize.** Identify which of the five resources - CPU, memory, disk, network, time - is actually the bottleneck. Do not guess.
2. **Hunt for boundary crossings inside loops.** The classic killer is a network or disk call repeated per item. Replace many calls with one batched call.
3. **To cut latency, cut distance.** Use edge servers, CDNs, or regional copies of your data closer to users. Buying a faster pipe only helps bandwidth.
4. **Reduce round trips.** Batch and pipeline requests instead of making fifty chatty back-and-forth calls.
5. **Reach for sequential over random.** When you control how data is laid out, ordered scans beat scattered random access by a wide margin.
6. **Think in orders of magnitude.** Before writing code, ask which layer of the stack it touches. RAM is ~100× L1, SSD is ~1000× RAM, the network is millions× L1. That instinct catches most slow designs on a whiteboard.

## Conclusion

If you remember one thing, make it this: **the master skill is finding the bottleneck resource before you touch anything else.** Everything in systems is a fight to get good behavior out of a resource that is scarce, slow, or unreliable - and the latency table is the cheat sheet you will mentally consult every time.

This was the map. The territory is the four pillars, and the first one we walk into is storage - where a single, deceptively simple question waits: when a database needs to find one row among a billion, how does it avoid reading all billion? The answer is an idea so good it has barely changed in fifty years.
