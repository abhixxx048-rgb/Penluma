**This document explains what happens when a software system needs to save data in two different places at the same time — and why that is much harder than it sounds. It matters because when this goes wrong, customers get charged twice, orders disappear silently, or stock never gets reserved — exactly the kind of invisible damage that kills trust in a store.**

**The main parts explained simply:**

- **The dual-write problem** — Writing to two systems (say, your database and a message queue) in a row is never safe. If the first write succeeds and the second one fails, your data is out of sync. This causes orders that were paid for but never fulfilled. There is no simple fix — you have to change how you write data in the first place.

- **Two-Phase Commit (2PC)** — An old approach where a "coordinator" asks all involved systems "are you ready?" before everyone commits together. The fatal flaw: if the coordinator crashes mid-way, every system is stuck, holding locks and blocking all other work. Expensive and unreliable at scale — avoided on critical paths.

- **The Saga pattern** — Instead of one big all-or-nothing transaction, you break the work into small steps. If a later step fails, you run "undo" steps in reverse to clean up. Think of it like a paper trail of receipts — if something goes wrong, you issue a refund or cancel rather than pretending it never happened.

- **Orchestration vs Choreography** — Two ways to coordinate saga steps. Orchestration means one central "brain" directs each step (easier to trace and debug). Choreography means each service reacts to events from the previous one (simpler but harder to follow when something goes wrong). Use orchestration once you have four or more steps.

- **Transactional Outbox** — The correct fix for the dual-write problem. Instead of writing to the database and sending a message separately, you write both into the database in one step. A background process then reads the database and sends the message. One write, no split.

- **Idempotency keys** — A unique ID attached to each operation so the system can recognise a retry and ignore it instead of running the action again. Without this, a customer clicking "Pay" twice, or a network timeout triggering a retry, results in a double charge.

- **Reconciliation** — A background job that periodically compares your records against external systems (like a payment gateway) and flags or fixes mismatches. Treat your live system as "best effort" and reconciliation as the safety net that catches drift before it becomes a serious problem.

**What to do with this:** Never write to two separate systems in the same code block without using the Outbox pattern. Always attach idempotency keys to payment and order operations so retries are safe and double-charges are impossible.
