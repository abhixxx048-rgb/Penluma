**This document is about what happens when a store owner's credit card payment fails for their Print-Flow-360 subscription - and how the platform should handle it. Right now, nothing happens: the card can quietly fail for weeks, no email is sent, and the store owner's access is never cut off. Fixing this is one of the highest-return improvements possible, because most of these failures are accidents (an expired card), not the owner wanting to leave.**

**The main parts explained simply:**

- **Involuntary churn** - When a paying customer loses access not because they want to cancel, but because their card expired or was declined by the bank. Industry research shows this causes 20–40% of all subscription cancellations. It is recoverable revenue - the person still wants the product.

- **Two billing relationships** - The platform has two completely separate money flows: (1) store owners pay Print-Flow-360 a monthly fee, and (2) shoppers pay each store for print orders. This document is only about the first one. The two must never be mixed up in the code.

- **What already exists** - The billing engine, payment adapters (Stripe, Razorpay, etc.), the subscription database table, and the card expiry date field are all already built. The gap is everything on top: reacting to failures, sending emails, retrying charges.

- **The gaps (what is broken)** - No code ever marks a subscription as "payment failed." No retry schedule exists. Stripe sends failure notifications but nothing reads them. The warning window before access is cut is only 1 day (industry standard is 7–14). There are no recovery emails and no "update your card" page.

- **Pre-dunning warning** - Sending a friendly email about 30 days before a card expires, before any failure even happens. The card expiry date is already stored. This single step recovers an estimated 15–22% of at-risk revenue and is the easiest improvement to ship.

- **Dunning email sequence** - A series of 4 short emails sent after a payment fails (Day 0, 3, 5, 7), each with a one-click link to update the card. Good sequences recover 50–65% of failed payments.

- **Retry schedule** - Automatically trying the charge again on Day 1, 3, 5, and 7 after failure. For Stripe, this is partly handled by Stripe itself; for other payment providers, Print-Flow-360 must do it directly.

- **Self-serve recovery page** - A simple page in the admin dashboard where a suspended store owner can update their card and immediately restore access. Plain language, no technical errors, no dead buttons.

- **Phased build plan** - P0 makes failures visible (wire Stripe notifications, fix the silent-ignore bug). P1 recovers the revenue (pre-dunning email, retry jobs, email sequence, recovery page). P2 measures results.

**What to do with this:** Start with P0 - right now a card can fail silently for weeks and the platform never knows. After that, the card-expiry warning email (pre-dunning) is the single fastest revenue win: the data is already stored, and one job prevents the failure entirely.
