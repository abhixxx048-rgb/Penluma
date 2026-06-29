**This document is a plan for building automatic, timed email sequences that send themselves based on what customers do — or don't do. Right now the platform can only send one-off blast emails or a single triggered message. There is no system to send "reminder → follow-up → final offer" over a few days, and that missing piece costs stores real money every day.**

**The main parts explained simply:**

- **Why this matters for print shops** — Print products like business cards and flyers get reordered on a regular schedule, and online print checkouts are long and complicated, so many shoppers leave halfway. Both situations are perfect for automatic follow-up emails — but today the platform sends nothing after a customer walks away.

- **Two separate email directions** — Emails going from the platform to store owners (like "your trial expires soon" or "payment failed") need completely different plumbing than emails going from a store to its shoppers. The document keeps these two apart and plans separate solutions for each.

- **What already works** — There is already a system for sending one-shot automated emails when something happens (like an order status change), plus broadcast campaigns to groups of customers. This plan reuses those existing pieces rather than starting from scratch.

- **Abandoned cart recovery** — When a shopper adds items to their cart but leaves without buying, the platform currently does nothing. Research shows a 3-email series sent over 3 days (first within an hour) can recover a large share of these sales. This is listed as the single most valuable thing to build first.

- **Multi-step journeys** — A "journey" is a series of emails sent over days with waits in between, that stops automatically if the customer takes action (like placing an order). Today there is zero ability to do this. The plan introduces three new database records to track: the journey definition, its steps, and which customers are currently in it.

- **Post-purchase emails** — After an order is delivered, the platform currently goes silent. The plan adds automatic emails asking for a review, gathering feedback, and reminding the customer to reorder when their supply runs low.

- **Frequency cap (spam guard)** — Without a limit, three separate parts of the system (campaigns, automations, journeys) could each email the same customer with no coordination. The plan adds a shared gate that enforces a monthly per-person limit and quietly stops emailing people who have not opened anything in 60–90 days. Order and payment emails are always exempt from this limit.

- **Platform-to-owner lifecycle** — Store owners on a trial or with a failed payment currently get almost no automatic outreach. The plan adds welcome sequences, setup nudges, payment-failure retry emails (dunning), and win-back messages for lapsed owners.

- **Phased build order** — Fix the background job queue first (a technical blocker that makes timed delays impossible), then build the journey engine with abandoned-cart recovery, then add the safety cap and post-purchase emails, then build the admin interface for store owners to manage journeys.

**What to do with this:** The first priority is the abandoned-cart recovery sequence — it is the highest-revenue gap and uses data that already exists in the system. Before building anything, the background job queue must be switched from "sync" mode to a real queue (Redis), because timed email delays are physically impossible without it.
