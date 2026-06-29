**This document is about how to measure whether your customers are sticking around — and why the simple "churn %" number most businesses track is misleading. It explains better ways to see if your store owners keep using Print-Flow-360 or quietly walk away, so you can fix problems before they quietly destroy the business.**

**The main parts explained simply:**

- **Why the single churn number lies** — One overall "churn %" can look fine while things are quietly getting worse. Three reasons: (1) a growing share of very loyal old customers can hide the fact that new customers are leaving faster than ever; (2) it only counts the customers still here, ignoring everyone who already left, which makes the number look rosier than reality; (3) a flood of new signups can bury a leaky bucket of recent customers who drop off quickly.

- **Cohort groups** — Instead of one big number, group customers by the month they first signed up, then watch each group separately. That way you can see whether stores joining in March are sticking around better or worse than stores that joined in January — an answer the blended number can never give you.

- **Retention triangle (the heatmap table)** — A colour-coded table: each row is one signup-month group, each column is "how many months later." Green cells mean customers are still around; red means they left. Reading down a column shows whether newer signups are doing better. Reading across a row shows how one group decays over time.

- **The shape of the retention curve** — Plot how many customers from a group are still active over time. A healthy business shows a steep early drop that then levels off into a flat line above zero — meaning a loyal base stays forever. If the line keeps falling toward zero with no flattening, you have a "leaky bucket" problem: no matter how many new customers you bring in, they all leave eventually.

- **Logo vs. money retention** — Logo retention counts how many store owners are still active. Revenue (dollar) retention counts whether the money you were earning is still coming in. For a low-price product like this, both numbers will move together, and it is normal and realistic to expect to keep roughly 65% of customers per year at best — not the 100%+ numbers you see quoted for expensive enterprise software.

- **Choosing the right time window** — Daily or weekly "active user" measurements make sense for apps people use every day (like social media). Print reorders happen every few months. Measuring weekly activity makes healthy, occasional-reorder customers look like they've left when they haven't. The right approach is to measure activity over realistic windows (e.g. "did they order at least once in the last 90 days?").

- **Quick Ratio (growth efficiency check)** — A simple formula: new revenue added divided by revenue lost. A result of 4 or higher means for every £1 lost, you're gaining £4 — broadly healthy. Useful as a quick board-meeting number, but it does not replace looking at the full cohort picture.

- **Building this without expensive tools** — You do not need to buy analytics software. The same database already running the platform can produce a proper cohort retention table overnight using a short SQL script. One materialized view and a heatmap in the admin portal is enough to start.

- **Myths to ignore** — "A 5% retention improvement boosts profits 95%" is a 1990s bank statistic, not a SaaS law. "It costs 5x more to acquire than retain" has no solid source. And never multiply monthly churn by 12 to get annual churn — the real math compounds and gives a much worse (more accurate) number.

**What to do with this:** Stop tracking one blended churn percentage and instead build a simple cohort table (rows = signup month, columns = months since signup) directly in the existing database. Define "active" as a store that is live AND placed at least one order in the relevant window — not just "logged in." That single change will show, for the first time, whether the product is actually retaining customers or slowly leaking them out.
