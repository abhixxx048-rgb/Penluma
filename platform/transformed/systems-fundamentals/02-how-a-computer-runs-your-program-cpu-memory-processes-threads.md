---
title: 'How a Computer Actually Runs Your Code: CPU, Memory & Threads'
metaTitle: 'How a Computer Runs Your Code'
description: >-
  See how a computer runs your program from source code to CPU, memory, and
  threads. Learn the fundamentals that turn guesswork about performance into real
  understanding.
keywords:
  - how a computer runs a program
  - CPU fetch decode execute
  - process vs thread
  - stack vs heap
  - memory hierarchy
  - cache locality
  - virtual memory and paging
  - compiled vs interpreted
  - JIT compilation
  - context switch
  - race condition
  - what does the CPU do
faq:
  - q: What is the difference between a process and a thread?
    a: A process is a running program with its own private, isolated memory. A
      thread is a line of execution inside a process. Threads in the same process
      share memory, which makes them fast but also the source of concurrency bugs.
  - q: Is compiled code always faster than interpreted code?
    a: No. Modern just-in-time engines like V8 and the JVM's HotSpot compile
      frequently used code to native machine code while the program runs, often
      rivaling or beating ahead-of-time compiled code. Languages like Python are
      slow for other reasons, not simply because they are interpreted.
  - q: Why is the stack faster than the heap?
    a: Allocating on the stack is just moving a pointer, and memory is freed
      automatically when a function returns. The heap needs an allocator to hunt
      for free space and must be freed manually or by a garbage collector.
  - q: What is a cache miss and why does it matter?
    a: A cache miss happens when the CPU cannot find the data it needs in its fast
      caches and must wait for slower main memory. RAM is roughly 100 times slower
      than L1 cache, so misses can dominate a program's runtime.
  - q: What is virtual memory in simple terms?
    a: Virtual memory gives each program the illusion that it owns one large,
      private, continuous block of memory. The CPU and operating system translate
      these virtual addresses into real physical RAM locations behind the scenes.
  - q: What causes a race condition?
    a: A race condition happens when two threads read and write the same shared
      data without coordination, and the unpredictable order of execution produces
      a wrong result. Locks and atomic operations exist to prevent this.
topic: systems-fundamentals
topicTitle: Systems Fundamentals
category: Engineering
date: '2026-06-21'
order: 1
icon: ⚙️
author: Pritesh Yadav
transformed: true
sources: []
---

You write a line of Python, Java, or JavaScript and it just works. But the chip doing the actual work has never heard of any of those languages. It speaks only one thing: long strings of 1s and 0s, each a precise instruction for one specific kind of hardware.

So how does your readable text become something a silicon chip can run? And once it is running, where does your data live, and how does one machine juggle dozens of programs at once?

This is the layer most developers never look at. It is also the layer that separates someone who *guesses* why their code is slow from someone who *knows*.

## Why this matters

You can write working software for years without understanding any of this. Plenty of people do. But the moment your code needs to be fast, handle real load, or stop crashing under concurrency, the abstractions leak.

Two programs can do the exact same amount of work and one runs ten times slower. A function that worked perfectly in testing corrupts data in production the instant two users hit it at once. A loop that looks innocent brings a server to its knees.

None of that is magic. It all comes from how the machine underneath actually behaves. Once you can see that machine, performance stops being superstition and becomes something you can reason about.

## From your code to machine code

Your **source code** is just text. Before anything runs, it has to be translated into **machine code** — the binary instructions a specific chip understands. There are three core strategies, and real languages mix them.

**Compilation (ahead of time).** A compiler translates your *whole* program into machine code *before* it runs. C, C++, Rust, and Go work this way. You get a standalone **executable** that is fast and needs no translator while running. The trade-off: it is tied to one type of chip and operating system, and the compiler catches many errors before the program ever starts.

**Interpretation.** An interpreter reads your program and runs it one statement at a time, translating as it goes. This is flexible and portable — the same code runs anywhere the interpreter exists — but slower, because the code gets re-analyzed every time it runs.

**Bytecode plus a virtual machine.** Java and Python first compile to **bytecode**: a compact, portable middle-step that is not machine code for any real chip. Bytecode runs on a **virtual machine**, a piece of software that pretends to be a CPU. Java's `javac` produces `.class` bytecode for the **JVM** to run. Python produces `.pyc` bytecode for **CPython**. This is what "write once, run anywhere" means.

**JIT (just-in-time) compilation.** Modern virtual machines are clever. They start by interpreting bytecode, watch which functions run over and over — the "hot" paths — and compile *just those* into native machine code *while the program is still running*. The JVM's HotSpot engine and every modern JavaScript engine, like Google's **V8**, do this.

Here is the whole journey at a glance:

```
C:       hello.c   --compiler--> native executable --> CPU
Java:    Hello.java --javac--> .class bytecode --> JVM (interprets, then JIT-compiles hot methods)
Python:  hello.py  --> .pyc bytecode --> CPython interprets
```

The key insight: **everything ends up as machine code.** The only question is *when* the translation happens — before running, during running, or piece by piece every time.

## The CPU: a fetch-decode-execute loop

At its heart, a CPU does one thing in a loop, forever:

1. **Fetch** — read the next instruction from memory. The CPU tracks where it is using the **program counter**, a special slot holding the address of the next instruction.
2. **Decode** — figure out what the instruction means and what data it needs.
3. **Execute** — the **ALU** (the part that does math and logic) performs the operation and stores the result.
4. **Advance** to the next instruction, then repeat.

This loop is driven by the **clock**, an electronic pulse ticking billions of times per second. A 3 GHz CPU ticks 3 billion times a second, so one tick takes about 0.3 nanoseconds — a third of a billionth of a second.

Real chips are far cleverer than "one instruction at a time." **Pipelining** overlaps the stages of several instructions like an assembly line. **Superscalar** designs run several instructions in one tick. But fetch-decode-execute is the right mental model to start from.

### Registers: the fastest storage that exists

**Registers** are a tiny handful of storage slots *inside* the CPU itself — the fastest memory there is. A typical chip has about 16 general-purpose ones.

Here is the crucial fact: **all computation happens in registers.** To add two numbers, the CPU loads them from memory into registers, adds them, and writes the result back. The CPU spends much of its life just shuttling data between slow memory and these few fast slots.

## The memory hierarchy: why location decides speed

There is one unbreakable trade-off in hardware: **fast memory is small and expensive; large memory is slow and cheap.** So computers stack layers, each bigger and slower than the one above.

```
Registers    <1 ns       hundreds of bytes
L1 cache     ~1 ns       32-64 KB per core
L2 cache     ~3-5 ns     256 KB-2 MB per core
L3 cache     ~10-20 ns   tens of MB (shared)
Main memory  ~100 ns     gigabytes (RAM)
SSD          ~150 us     hundreds of GB-TB
Hard disk    ~10 ms      terabytes
```

The exact numbers vary by machine — **the ratios are what matter.** RAM is roughly 100 times slower than L1 cache. An SSD is about 1,000 times slower than RAM. A spinning hard-disk seek is about 100,000 times slower than RAM.

These numbers are too small to feel, so scale every one up by a billion until it lands in human terms. One CPU cycle becomes 1 second. Reaching L1 cache: a few seconds. Reaching RAM: about 6 minutes. Reading from an SSD: about 2 days. A hard-disk seek: about a year. Suddenly "just read it from disk" sounds as reckless as it really is to the CPU.

**Caches** (L1, L2, L3) hold copies of data the CPU recently used or will likely need soon. When the CPU needs something it checks L1, then L2, then L3, then RAM. Finding it early is a **cache hit**; not finding it is a **cache miss**, which stalls the CPU while it waits for a slower layer. Caches move data in fixed chunks called **cache lines** — usually 64 bytes — so touching one byte pulls in its whole neighborhood.

Caches work because of **locality**, the single most important performance idea here:

- **Temporal locality** — data you used recently, you will probably use again soon.
- **Spatial locality** — data *near* what you just used, you will probably use soon.

### A real example you can feel

Imagine summing every number in a big 2D grid.

Walk it **row by row** and you visit memory in order. Each 64-byte cache line gets fully used before you move on. Fast.

Walk it **column by column** and you jump far between every access, wasting most of each cache line you load. Same amount of arithmetic, identical Big-O complexity — but the column version can run 5 to 10 times slower, purely from poor spatial locality.

This is why arrays usually beat pointer-chasing linked lists in practice: arrays keep data packed together, exactly what caches reward.

## Virtual memory: the private-room illusion

Every running program is handed an illusion: it owns one huge, private, continuous block of memory called its **virtual address space**. In reality, physical RAM is shared among many programs and scattered into fragments.

A hardware unit on the CPU called the **MMU** (Memory Management Unit), working with the operating system, translates the **virtual address** a program sees into the real **physical address** in RAM.

- Memory is split into fixed-size **pages** (virtual) and matching **frames** (physical), almost always 4 KB each.
- Each process has a **page table** mapping its pages to physical frames.
- Walking that table on every access would be slow, so the MMU keeps a **TLB** — a small hardware cache of recent translations. A hit is instant; a miss forces a slower lookup.
- If a page is not in RAM at all, the CPU raises a **page fault**, and the OS loads it (sometimes from disk **swap** space) and retries. When this happens constantly, performance collapses — a state called **thrashing**.

Virtual memory buys three big things: **isolation** (one process literally cannot read or corrupt another's memory), the **illusion of more memory** than you physically have, and a **clean, uniform address space** so every program can be written as if it owns the whole machine.

## Processes vs threads

A **process** is a running program with its own isolated virtual address space. Two processes cannot see each other's memory by default. To talk, they must use explicit channels — pipes, network sockets, or shared-memory segments — collectively called **IPC** (Inter-Process Communication).

A **thread** is a single line of execution *inside* a process. All threads in one process **share the same memory** — the same heap, globals, and code — but each thread keeps its **own stack, own registers, and own program counter**.

That shared memory is what makes threads cheap to create and fast to coordinate. It is also exactly what makes concurrency bugs possible.

```
PROCESS  (one private address space)
+------------------------------------------+
|  Code  |  Globals  |  Heap   (SHARED)     |
|------------------------------------------|
|  Thread 1:  own stack + own registers    |
|  Thread 2:  own stack + own registers    |
+------------------------------------------+
```

Think of a process as a private kitchen with its own pantry no other kitchen can touch. The threads are several cooks sharing that one kitchen and pantry — but each cook has their own cutting board (their own stack). The head chef rotating cooks on and off the single stove is the scheduler, which we will get to next.

## Stack vs heap

Inside a process's memory, two regions grow toward each other.

The **stack** holds function call frames: parameters, local variables, and return addresses. The **heap** holds dynamically sized, longer-lived data like objects and big buffers.

| Aspect | Stack | Heap |
| --- | --- | --- |
| Stores | Function call frames | Dynamic, longer-lived data |
| Speed | Very fast — just move a pointer | Slower — an allocator hunts for space |
| Freed by | Automatically, when the function returns | Manually, or by a garbage collector |
| Size | Small and fixed (often 1-8 MB) | Large and flexible |
| Typical failure | Stack overflow (e.g. infinite recursion) | Memory leaks, use-after-free |

Each function call **pushes** a frame onto the stack; returning **pops** it off. A **garbage collector** is a background helper in languages like Java, Python, and JavaScript that automatically frees heap memory no longer in use.

The practical rule: prefer the stack for small, short-lived, fixed-size data. Reach for the heap when data is large, long-lived, or its size is unknown until runtime.

## The scheduler and the cost of switching

One CPU core runs exactly one thread at any instant. The **scheduler** (part of the OS) rapidly rotates many threads onto the available cores, giving each a short **time slice** before moving on. Because it switches thousands of times a second, everything *appears* to run at once. This is **preemptive multitasking**: the OS can pause a thread without asking it.

Swapping one thread for another is a **context switch** — the CPU saves the current thread's registers and program counter, then loads another's. A switch *between threads of the same process* is cheap. A switch *between different processes* is expensive: the whole address space changes, the TLB's cached translations are now wrong and must be thrown out, and the caches go cold. Context switches are pure overhead — useful work stops while they happen.

There is one more boundary worth knowing. **User mode and kernel mode** are hardware-enforced privilege levels. Your code runs in **user mode** with no direct access to hardware. The OS **kernel** runs in **kernel mode** with full access. The only controlled doorway between them is a **system call** — a request like "open this file" or "send these bytes." System calls are relatively expensive, which is why fast code minimizes them by batching and buffering work.

## Common misconceptions

**"Compiled means fast, interpreted means slow."** Not as an absolute. Modern JIT engines compile hot code to native machine code at runtime and can match or beat naive compiled code. Python is slow for other reasons — its dynamic typing and a lock called the GIL — not simply because it is interpreted.

**"All memory access costs the same."** In textbook algorithm analysis, yes. On real hardware, no. A cache miss to RAM can dominate runtime, so two programs with identical Big-O can differ tenfold from locality alone.

**"Threads in one process have separate memory."** They share the heap, globals, and code. That is the whole point and the whole danger. Two threads writing the same variable without coordination is a recipe for corruption.

**"A virtual address is a physical address."** The pointer your program prints is virtual. The same virtual address in two different processes points to *different* physical RAM. Never assume two processes share memory just because their addresses look alike.

**"More threads means more speed."** Past your core count — or with heavy lock contention or constant context switching — adding threads makes things *slower*. **Concurrency** (interleaving tasks) is not the same as **parallelism** (truly running them at once on multiple cores).

## How to use this

You do not need to micro-optimize everything. But a handful of habits, grounded in how the machine works, pay off constantly:

1. **Lay data out for locality.** Prefer arrays and contiguous structures over pointer-chasing ones. Walk memory in the order it is stored — row by row, not column by column.
2. **Keep hot data small.** The more of your working set fits in cache, the fewer stalls you pay. Trimming a struct can speed up a loop more than a cleverer algorithm.
3. **Batch your system calls and I/O.** One buffered write beats a thousand tiny ones. Each syscall crosses into the kernel and back, and that crossing is not free.
4. **Right-size your thread pools.** Match thread count to the workload and core count. More threads is not automatically faster, and oversubscription wastes time on context switches.
5. **Protect shared mutable data.** When threads share changing data, guard it with locks or atomic operations — or design so they do not share it at all.
6. **Watch out for false sharing.** Two threads updating *different* variables that happen to sit on the same 64-byte cache line will fight over that line, quietly wrecking performance even though they never logically share anything.

## Conclusion

If you remember one thing, make it this: **everything your program does is the CPU shuttling data between a few ultra-fast registers and a hierarchy of progressively slower memory, while the scheduler quietly time-slices it all.** Performance is mostly the story of how well your code respects that hierarchy.

The single biggest lever is data layout. Code that keeps its working set close and packed runs circles around code that scatters it, even when the two are algorithmically identical.

And here is the thread worth pulling next. We saw that threads share memory and the scheduler interleaves them *unpredictably*. Combine those two facts and you get the **race condition** — the bug that vanishes the moment you look for it and reappears the moment you ship. That single problem is the doorway into the entire world of concurrency, locks, and lock-free programming. It is where systems thinking gets genuinely hard, and genuinely fun.
