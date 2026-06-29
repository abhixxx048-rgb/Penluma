**This document explains two related ideas for storing data in software: "Event Sourcing" (saving a history of everything that happened instead of just the current state) and "CQRS" (using a separate system for reading data vs. writing data). These ideas solve real problems in finance, order tracking, and audit trails - but they also add a lot of complexity, so the document is honest about when NOT to use them.**

**The main parts explained simply:**

- **The core idea (ledger vs. balance)** - A normal app saves only the current number (e.g. your account balance). Event Sourcing instead saves every transaction that ever happened - like a bank ledger. The current balance is calculated from the history. This means you can always answer "why is this number what it is?" and travel back in time to any past state.

- **Event Store** - A special database that only lets you add new records, never change or delete old ones. Every action is saved as a past-tense fact (e.g. "Order Shipped", "Money Withdrawn"). Each item (like one customer account) gets its own list of events.

- **Snapshots** - If an item has millions of events, replaying all of them every time is slow. A snapshot saves a "checkpoint" of the state at a point in time, so you only replay the recent events after that checkpoint.

- **CQRS (Command Query Responsibility Segregation)** - A pattern where you use one system to save/change data (the "write side") and separate, optimized systems to read and display data (the "read side"). This lets you shape the read data differently for search, dashboards, reports, etc.

- **Eventual consistency** - Because the read side catches up to the write side with a small delay, a user might save something and not see it immediately in a list. The document covers ways to handle this gracefully in the UI.

- **Rebuilding read models** - Because read data is derived from events, you can always throw it away and rebuild it from scratch. This is powerful but risky - any code that sends emails or notifications must not run again during a rebuild, or customers get duplicate messages.

- **Event versioning** - Events saved in 2019 must still be readable in 2029. The document explains how to handle changes to event formats over time without breaking old records.

- **When NOT to use this** - Most apps should not use Event Sourcing. It adds major complexity. Use it only where a full history is essential (financial ledgers, order lifecycles). Do not use it for simple things like product catalogs or settings pages.

- **Common mistakes** - Sending emails inside the read-model code (causes duplicate emails on rebuild), making events that just copy the whole record (wastes the benefit), and using it everywhere instead of only where history truly matters.

**What to do with this:** Only apply Event Sourcing to the 1–2 parts of your system where the full history is the product itself (like an order history or invoice ledger). Leave everything else as simple database rows. If you use it, plan for how you will handle old event formats from day one, and never put email-sending or other side effects inside your read-model builders.
