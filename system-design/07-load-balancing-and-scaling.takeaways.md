**This document explains how a website that runs on one computer grows into a fleet of many computers that can handle big crowds without breaking. It covers how traffic gets shared across those computers, how the system detects a broken server and stops sending it customers, and what you must do to your app before any of this works. Every serious web service relies on these ideas.**

**The main parts explained simply:**

- **Scaling up vs scaling out** — You can either buy a bigger, faster single machine (scaling up) or add more machines and split the work between them (scaling out). Scaling out is the long-term answer because it has no ceiling and keeps running even if one machine dies.

- **Load balancer** — A traffic cop that sits in front of all your machines and decides which machine handles each incoming request. Without it, every request hits the same one machine.

- **L4 vs L7 load balancer** — An L4 balancer just sees an incoming connection and sends it somewhere. An L7 balancer can actually read the web address and headers, so it can send "/checkout" to one group of servers and "/images" to another. L7 is smarter but costs more to run.

- **Balancing algorithms** — The rules the traffic cop uses to pick a machine. Round-robin takes turns evenly. "Power of two choices" picks two random machines and sends to the less-busy one — a small trick that gives nearly perfect balance with no extra coordination.

- **Health checks** — The load balancer pings each machine every few seconds. If a machine stops responding, the balancer stops sending it customers. The trap: if the check also tests the database and the database hiccups, the balancer can eject every machine at once, turning a small problem into a full outage.

- **Stateless design** — The keystone idea. If a machine holds nothing about the user in its own memory (sessions stored in Redis instead), any machine can serve any request. This is what makes adding or removing machines safe and painless. Sticky sessions (storing the session on the machine itself) fights every other scaling tool.

- **Autoscaling** — Automatically adding machines when traffic rises and removing them when it drops. The catch: new machines take time to boot, so you must trigger scale-out before you are already overloaded, not after.

- **Connection draining** — When you remove a machine (for a deploy or to shrink the fleet), you first stop sending it new requests, wait for it to finish the requests already in progress, then shut it down. Skip this and active users get errors mid-action.

- **Database scaling** — App servers are easy to scale out. Databases are harder because they hold the actual data. Read replicas let many machines answer read queries; sharding splits the data across multiple independent databases to handle more writes. Both have trade-offs.

- **Load shedding** — When every machine is already full, it is better to immediately say "sorry, try again" to 10% of requests than to slowly process 100% until all of them time out. Dropping on purpose, fast, protects the users you can still serve.

**What to do with this:** Make sure your app stores sessions in Redis or a database — not on the local disk — so any server can handle any user. When you need to handle more traffic, add more servers rather than endlessly upgrading one big one, and set your autoscaler to react to queue depth or request count, not just CPU, so new capacity arrives before the brownout starts.
