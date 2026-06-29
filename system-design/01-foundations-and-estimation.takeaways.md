**This document explains how engineers estimate whether a system can handle a given number of users - before they build anything. It gives you the key numbers to know (how fast things are, how big data gets, how much traffic a server can take) and a step-by-step method for checking if your design will hold up. Understanding this helps you ask the right questions and make better decisions when building or scaling software.**

**The main parts explained simply:**

- **How fast things are (latency)** - Reading from computer memory is nearly instant. Reading from a hard disk is 20 million times slower. Sending data across the world takes 150 milliseconds, and no amount of code can make it faster - physics sets the limit. Knowing these gaps tells you where to focus: keep hot data in fast memory (called a cache) to avoid slow disk or network reads.

- **How big data gets (data sizes)** - Simple rules help you go from "one user does X" to "1 million users means Y gigabytes." A photo is roughly 1–5 MB; a year of photos from many users adds up to terabytes fast. Images almost always dwarf text in storage cost.

- **How much traffic a server handles (QPS)** - QPS means "requests per second." You work it out from how many users you have and what they do per day. Always plan for the busiest moment (peak), not the daily average - a lunchtime spike or a product launch can be 3–10 times the normal rate.

- **The four things that run out (bottlenecks)** - Every server has four limited resources: processing power (CPU), working memory (RAM), disk space and speed, and network speed. Find which one fills up first and fix only that - adding more CPU to a server that's running out of disk space does nothing.

- **Little's Law** - A simple equation: if 2,000 requests arrive per second and each takes 50 ms to finish, then at any moment 100 requests are in progress. This tells you how many database connections or worker threads you actually need - too few and things queue up, slow down, and crash.

- **Why averages lie (percentiles)** - An "average response time of 40 ms" can hide the fact that 1 in 100 users waits 4 seconds. Your best, most active customers hit those slow cases most often. Good engineering sets targets using percentiles (e.g. "99% of requests finish under 200 ms"), not averages.

- **The fan-out trap** - When one request splits into calls to many services at once and waits for all of them, even a tiny slowness in any one service shows up most of the time. Twitter solved this by pre-building each user's feed when a tweet is posted, so reading it is instant instead of gathering from hundreds of sources on every page load.

- **Capacity planning method** - A seven-step checklist: state your assumptions, calculate requests per second (average and peak), calculate storage, calculate bandwidth, find the bottleneck, count servers needed, then sanity-check against known limits.

**What to do with this:** When sizing any new feature, always compute peak traffic (not average) and check storage after multiplying by replication (usually 3×) and index overhead (2×). Set performance targets in percentiles (p99), not averages - averages always make things look better than they are.
