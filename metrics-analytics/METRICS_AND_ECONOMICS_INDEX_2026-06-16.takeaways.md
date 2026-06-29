**This document is a guide to which business numbers Print-Flow-360 should watch — and which ones to ignore. It covers five research topics at once: how much it costs to get a customer, whether customers come back to reorder, how monthly revenue moves, how to track the steps from signup to first order, and how to find out where new customers come from. The main message is simple: track a small, honest set of numbers; ignore the complicated ones that big companies use.**

**The main parts explained simply:**

- **North Star goal** — The one number everything else is built around: did a new store go live AND place its first order within 7 days of signing up? Every other metric is judged by whether it helps reach this goal.

- **CAC Payback (how long to earn back what you spent to get a customer)** — Instead of complex formulas, track one thing: how many months of subscription fees does it take to recover the full cost of winning a new customer? Include founder time and free tool costs. Keep this number as low as possible.

- **Cohort retention triangle (do customers come back to reorder?)** — Group customers by the month they signed up and track whether they placed repeat print orders. This shows clearly whether the business keeps customers or slowly loses them. Build it with plain database queries — no expensive software needed.

- **MRR / ARR / NRR (monthly and yearly subscription money)** — Count only the fixed subscription fee as recurring revenue. Keep order volume (GMV) on a separate line so the numbers stay clean and honest. For a small-business SaaS, keeping about 97% of revenue year-over-year is healthy — the 120% target you read about online is for large enterprise software, not us.

- **Funnel tracking (the steps from signup to first order)** — Set up roughly 14 key events that mark a store's journey from "just signed up" to "first order received." Fire these from the server, not the browser, so no events are missed.

- **Attribution (where do new customers come from?)** — Skip complicated tracking tools. Ask one plain question at signup: "How did you hear about us?" Also capture the first link a visitor clicked. That is enough to make good decisions.

- **Folklore warnings (popular "facts" that are actually wrong)** — Several widely-shared SaaS statistics are exaggerated or made up. This document flags the worst ones so the team does not set the wrong targets based on bad numbers.

**What to do with this:** Start by building the signup-to-first-order funnel and the "How did you hear about us?" question using your existing database — no new tools needed. Add the monthly cohort retention view next. Only buy analytics software if those plain database reports stop being enough.
