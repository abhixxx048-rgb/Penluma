**This document checks whether a brand-new store owner can set up their store and take a real order without hitting hidden problems. It found serious issues that could let an owner think everything is ready — only to have checkout fail in front of their first real customer.**

**The main parts explained simply:**

- **The "your store is ready" checklist** — A step-by-step list shown to new owners (like "add a product," "set up payment") that ticks green when steps are done. The problem: two of those green ticks are fake — they turn green even when the setup is broken.

- **Fake green: payment gateway** — When an owner enters their payment details (e.g. Stripe keys), the checklist marks it complete without actually testing if those details work. A typo or wrong key still shows green, and the first real order fails with a confusing error.

- **Fake green: shipping** — The checklist marks shipping as complete the moment any shipping option exists — even the example ones added automatically. It never checks if a real, active shipping rate is configured. An owner who has not touched shipping at all still sees a green tick.

- **Checklist disappears after 30 days** — Even if setup is not finished, the checklist banner hides itself after 30 days. A busy store owner who hasn't finished setting up loses their only guide and is left with a half-configured store.

- **Empty first screen** — When a new owner logs in for the first time, they see an empty list with no explanation. Nothing tells them what to do next or what a "store" actually is. It can look like the app is broken.

- **No automatic first store** — The platform does not create a starter store when someone signs up. The owner has to figure out how to create one themselves, with no guidance.

- **No setup wizard** — After creating a store, the owner is dropped onto the main dashboard and left to find each settings page on their own. There is no step-by-step walkthrough (logo → product → payment → shipping → go live).

- **Help text is too technical** — Checklist steps say things like "Connect a payment provider" with a bare link, but don't explain what an API key is, which gateways are supported, or how long it takes. Non-technical owners are left guessing.

- **Demo products aren't clearly labelled** — Sample products are added automatically to show what the catalog looks like, but the banner doesn't make it obvious they are just examples, or that deleting them is permanent.

**What to do with this:**

Fix the two fake-green steps first — payment and shipping should only show complete when they have actually been tested and are working. Then add a short, guided setup wizard so new owners are never left staring at a blank screen.
