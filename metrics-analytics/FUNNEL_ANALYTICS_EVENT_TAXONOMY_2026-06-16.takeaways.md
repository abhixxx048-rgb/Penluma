**This document is a step-by-step plan for tracking what store owners do after they sign up — from creating their first product to receiving their first customer order. It tells the team exactly which actions to record, how to name them, and where to record them so the numbers are always reliable. Without this, you cannot see where store owners get stuck and you cannot fix what's broken.**

**The main parts explained simply:**

- **Funnels** — A funnel is a series of steps you expect a store owner (or customer) to complete in order, for example: sign up → publish store → receive first order. You measure how many people complete each step. This shows you exactly where people stop and leave, so you know where to focus your improvements.

- **Conversion window** — The maximum amount of time you allow between the first and last step. If a store owner signs up on Monday and goes live on Thursday, you need a window of at least four days or they look like they "failed" when they didn't. The document recommends 7–14 days for the sign-up-to-first-order journey.

- **Event naming rules** — Every action you record needs a clear, consistent name. The rule is simple: name every event as "thing_what-happened", all lowercase, past tense — for example `order_received` or `store_published`. If names are inconsistent, your reports become impossible to trust.

- **Events vs. properties** — An "event" is what happened (`product_added`). A "property" is the detail about it (`product_type: business cards`, `price: 24.00`). Keeping these separate prevents your list of tracked actions from growing out of control.

- **Identity stitching** — Before someone signs up, they are anonymous (the system doesn't know who they are). The moment they create an account, the system must connect their earlier anonymous steps to their new profile. If this is done wrong, one real person looks like two different people in your reports, and the numbers lie silently.

- **Server-side vs. browser-side tracking** — Tracking from the browser is easy but unreliable: browser privacy tools and ad-blockers can silently drop important events, especially orders and payments. Tracking from the server (the backend) cannot be blocked. The document says: track every money and order event from the server; let the browser handle low-importance clicks automatically.

- **Tooling choice (PostHog)** — PostHog is recommended as the analytics tool. It is free up to one million events per month, records session replays (video-like recordings of what users do), and handles funnels, feature flags, and A/B tests in one place. It can also be self-hosted for privacy control.

- **The 14-event starter plan** — Instead of tracking hundreds of actions, the document gives a focused list of 14 key events that cover the whole store-owner journey: from landing on the site, through setting up products and pricing, to publishing a store and receiving a first order. Tracking fewer, more meaningful events is far more useful than tracking everything.

**What to do with this:**

Add tracking for the seven most important server-side events (signup, product added, store published, order received, first order received, payment card added, subscription changed) inside the existing Laravel backend code — these already happen there, so it is less work than it sounds. Set up PostHog with the 14-event plan and build one weekly funnel: sign up → store published → first order, with a 7–14 day window. Review that single funnel every week to find the step where the most store owners drop off.
