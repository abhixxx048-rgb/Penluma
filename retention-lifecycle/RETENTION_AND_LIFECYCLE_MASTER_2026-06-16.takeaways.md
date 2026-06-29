**This document is a plan for keeping customers - both store owners who pay for Print-Flow-360, and the shoppers who buy from those stores. Losing a customer costs far more than keeping one, so this plan maps out what to build, in what order, to stop customers from leaving. Nothing in this plan has been built yet - it is a research and planning document.**

**The main parts explained simply:**

- **Onboarding (getting new store owners started)** - Right now, a store owner is marked "done with setup" even if they have never received a real order. This section fixes that: a store owner is only truly "started" when their store is live and they have received their first order. It also proposes a "place a test order" shortcut so new owners can see the full experience within 24 hours.

- **Lifecycle emails (sending the right message at the right time)** - Today the platform can send bulk email campaigns, but it cannot automatically send a follow-up email hours after someone abandons their shopping cart, or nudge a customer who has not bought in months. This section plans a "journey engine" - a system that watches what customers do and sends the right message at the right moment, without anyone pressing a button.

- **Dunning (recovering failed payments)** - When a store owner's subscription payment fails, nothing happens today - the failure is invisible to the platform. This section plans a proper process: warn owners before their card expires, retry the charge over several days, send plain-language emails asking them to update their card, and only suspend their account as a last resort. Good dunning recovers more than half of all failed payments.

- **Health scoring and feedback surveys (spotting trouble early)** - This section plans a simple "health score" for both store owners and their shoppers: a traffic-light system (green/yellow/red) based on activity. A red score triggers an alert so someone can step in before the customer leaves. It also plans short, one-question satisfaction surveys sent automatically after an order is delivered.

- **Community features (giving store owners a reason to stay)** - This section plans two things: a public place where store owners can vote on features they want, and a shared library of design templates that any store owner can use. Both take a long time to pay off but make the platform harder to leave.

- **Two shared building blocks** - Almost everything above depends on the same two pieces of foundation: (1) a "journey engine" that can send delayed, behaviour-triggered messages, and (2) a "health signals layer" that scores customers nightly. Building these once means every other feature just plugs in, instead of each feature reinventing its own version.

**What to do with this:**

Start by switching the background job system from "sync" to Redis (a technical prerequisite that unlocks everything) and fix the payment-failure pipeline so failed charges are visible. These two steps protect revenue immediately and unblock every other item in the plan.
