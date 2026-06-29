**This document explains how to decide whether to split a software system into smaller, separate pieces — and how to do it safely if you do. It matters because splitting too early wastes time and money, while splitting at the right time (and in the right way) lets a growing team ship changes faster without breaking things for customers.**

**The main parts explained simply:**

- **Monolith vs Modular Monolith vs Microservices** — A monolith is one big app doing everything together. Microservices break it into many small apps that talk over a network. The middle option — a modular monolith — keeps one app but draws strict internal fences between areas. For most teams this middle option is the right answer and avoids most of the headaches.

- **Don't split too early** — Splitting a small system into microservices before you need to creates a lot of extra work (networking, debugging, deployments) without solving any real problem. Most companies should wait until they have 15–20+ engineers or a part of the system that needs to scale or fail independently.

- **Bounded contexts — split by business area, not by technology** — The safest place to draw a dividing line is where the same word means two different things. "Order" means something different to the sales team versus the shipping team — that natural difference is where to split, not along technical lines like "a separate database service."

- **Strangler Fig — how to migrate without a risky rewrite** — Instead of throwing away the old system and building a new one from scratch (very risky), you grow the new pieces around the old one, move traffic piece by piece, and slowly retire the old parts. The hardest part is moving the data, not the code.

- **API Gateway and BFF — the front door** — An API gateway is a single entry point that handles security and routing for all clients. A BFF (Backend-for-Frontend) is a tailored version of that for a specific screen (mobile vs web), so each screen gets exactly the data shape it needs.

- **Service Mesh — networking on autopilot** — A service mesh (tools like Istio) handles retries, timeouts, encryption between services, and traffic routing automatically, without changing your app code. It is only worth the complexity when you have many services; for small systems a good HTTP library is enough.

- **Service Discovery — finding services automatically** — When services start and stop constantly, you cannot use fixed addresses. Discovery tools (like Kubernetes) give each service a stable name and automatically route traffic to healthy copies.

- **Database-per-service — each service owns its own data** — No two services should share the same database. If they do, changing one service's data structure forces changes in the other — they become secretly coupled even if deployed separately. Keeping data separate is what makes services truly independent.

- **Sagas — multi-step actions without a shared transaction** — When an action spans multiple services (reserve stock, charge card, create shipment), you cannot rely on a single database rollback if something fails. A saga runs each step separately and has a "undo" step ready for each one if something goes wrong later.

- **Distributed Monolith — the costly mistake** — This is when a team splits into microservices but the services still all depend on each other synchronously (one calls the next, which calls the next). You pay all the costs of separate services but get none of the benefits. Signs: services must deploy together, they share a database, one slow service makes everything slow.

- **Cell-based architecture — limiting damage when things go wrong** — Instead of one big shared system serving all customers, you run many identical small copies (cells) and pin each customer to one. If a bug or bad request hits cell 3, only cell 3's customers are affected — not everyone.

- **Shuffle Sharding — making damage even smaller** — Instead of one fixed cell per customer, each customer gets a random small set of servers from a shared pool. The chance two customers share all the same servers is very small, so a problem with one customer rarely fully affects another. Amazon uses this for Route 53 to protect customers from each other.

**What to do with this:**

Start with a modular monolith — strict internal boundaries, one deployment — and only extract a separate service when one part has a clearly different scaling or failure need (like a heavy file-processing job). When you do split, draw the line where business meaning changes naturally, move data carefully using the strangler approach, and always ask: "can I deploy this one piece alone right now?" If the answer is no, you have not really split yet.
