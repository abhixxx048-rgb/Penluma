**This document is about knowing when a customer is about to stop buying from you - before they actually leave. It explains how to measure whether customers are happy, spot warning signs early, and automatically nudge the store owner to take action. Right now the platform has none of this in place, so it is effectively flying blind.**

**The main parts explained simply:**

- **NPS (Net Promoter Score)** - A single question: "How likely are you to recommend us?" scored 0–10. Promoters (9–10) are loyal fans; detractors (0–6) are unhappy and likely to leave. The gap between the two is your score. Send this a week or two after a customer receives their order.

- **CSAT (Customer Satisfaction Score)** - A quick rating right after a specific moment: finishing setup, getting help, or placing an order. Tells you how that one experience felt. A good target is 75–85% positive; top businesses aim for 90%+.

- **CES (Customer Effort Score)** - Measures how easy or hard it was to do something (like placing an order). Lower effort = happier customers = more repeat business.

- **Health Score** - A single number (0–100) that combines several signals about a customer: how often they order, how recently they logged in, whether a payment has failed, and how they rated past experiences. Green (75–100) = healthy; Yellow (40–74) = watch this person; Red (0–39) = act now. The key insight is that 70–80% of customers who eventually leave show warning signs 30–60 days before they go.

- **Two audiences** - The platform needs to track two groups separately: (1) store owners who might cancel their subscription to the platform, and (2) buyers who might stop ordering from a store. Both need health scores; both need early warnings.

- **At-Risk Alerts** - Instead of making a store owner read charts, a score drop automatically creates a plain-language nudge in the Action Center ("Maria rated her last order 4/10 - follow up before she leaves"). No new screens; the store owner just acts on the prompt they already see.

- **What already exists** - The codebase already has the alert system (Action Center), email sending, and a basic "hasn't ordered in 90 days" check. The missing pieces are: a way to send surveys, a proper multi-signal health score, and the logic to turn a low score into an alert.

- **Survey timing matters** - Send NPS 1–2 weeks after a delivery. Send CSAT right after setup or support. Embedding the first survey question directly in the email (not just a link) gets far more replies.

**What to do with this:** Build the survey system and health score first (P0 priority), then wire low scores to automatic Action Center alerts so store owners get a plain-English prompt to follow up - without ever needing to look at a dashboard. Do not turn on nightly background jobs until the queue system is switched to Redis (currently it runs in a mode that is not reliable enough for scheduled tasks).
