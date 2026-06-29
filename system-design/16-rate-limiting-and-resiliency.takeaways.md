**This document explains two things every online system needs: a way to control how much traffic comes in, and a way to stay standing when something inside the system breaks. Without these, one slow database or one misbehaving customer can bring down the whole service for everyone. Understanding these ideas helps you build software that handles problems gracefully instead of collapsing.**

**The main parts explained simply:**

- **Rate limiting (traffic control)** - A "bouncer" that decides how many requests a customer or server can make in a given time. Without it, one bad actor can flood your system and slow it down for everyone else. Especially important when you have many store owners sharing the same platform.

- **Fixed window counter** - The simplest traffic counter: count requests per minute, reset at each minute boundary. Easy to build but has a flaw - a customer can sneak in double the allowed amount right at the boundary between two windows.

- **Sliding window counter** - A smarter version that looks at the recent past more smoothly, avoiding the double-admission problem. Uses very little memory and is accurate enough for most real systems. This is what most professional API services use.

- **Token bucket** - Imagine each customer gets a bucket of tokens that refills steadily. Each request uses one token. When the bucket is empty, requests are refused. Allows short bursts of activity (like a human clicking fast) then settles back to a steady rate. Used by Stripe and AWS.

- **Leaky bucket** - Like token bucket but the output is always a steady drip, no bursts allowed. Useful when the thing receiving the traffic cannot handle sudden spikes at all.

- **Timeouts** - Every call to another service must have a deadline. If there is no deadline and the other service hangs, your system keeps waiting forever, threads pile up, and everything crashes. Setting a sensible wait limit is the most basic protection you have.

- **Retries with jitter** - When a request fails, you try again - but not all at the same moment. Adding a random delay (jitter) before each retry spreads the load out. Without this, all clients retry at the exact same second, making the problem worse instead of better.

- **Circuit breaker** - Like a fuse in your house. When a dependency (database, payment service, etc.) is clearly broken, the circuit breaker "trips open" and stops all calls to it instantly, returning a safe fallback answer. After a short cooling period, it tests the water before resuming normal calls. This stops one broken dependency from dragging down everything else.

- **Bulkhead** - Named after the watertight walls in a ship. Each dependency gets its own small pool of resources. If one dependency hangs and uses up its pool, the rest of the system keeps working with their own pools. One tenant's traffic spike cannot starve other tenants.

- **Graceful degradation** - When something breaks, show a reduced but still useful experience rather than a blank error page. For example, if the recommendations service is down, show bestsellers instead. The customer can still buy; they just get less personalisation.

- **Load shedding and backpressure** - When the system is already overwhelmed, the right move is to deliberately refuse some requests (lower-priority ones first) so the important requests still get through. Backpressure means telling the caller to slow down rather than silently dropping work.

- **Cascading failures** - A small problem (one database 100ms slower than usual) can spiral into a full outage because slow calls block threads, blocked threads pile up, and the whole system tips over. Circuit breakers and timeouts exist to cut this chain before it runs away.

- **Retry storms** - If everyone retries at the same time after a problem, the retries themselves become the problem. The system can get stuck in a broken state even after the original cause is gone. Retry budgets and jitter prevent this.

- **Thundering herd** - Many clients hit the same resource at the exact same moment (for example, a popular cache key expires and a thousand users all rush to the database to rebuild it). Solutions include only letting one request rebuild the cache while the rest wait, or refreshing the cache slightly before it expires.

- **Chaos engineering** - Deliberately breaking things in a controlled way (killing a server, cutting a connection) to prove your safety nets actually work before a real incident does it for you.

**What to do with this:**

Set an explicit timeout on every external call your code makes - this alone prevents the most common cause of full outages. And add a circuit breaker around any dependency that is not under your direct control, so one slow third-party service cannot take down your whole storefront.
