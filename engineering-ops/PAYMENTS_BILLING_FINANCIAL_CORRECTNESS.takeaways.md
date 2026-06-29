**This document is a detailed audit of every way the platform handles money — taking payments, issuing refunds, charging the right amount in the right currency, and collecting the correct tax. It matters because several serious bugs mean customers can be charged the wrong amount, refunds that appear to go through never actually move any money, and sensitive card details are stored in a way that breaks security rules.**

**The main parts explained simply:**

- **Card data security (PCI-DSS)** — There are strict industry rules about how card numbers and the 3-digit security code (CVV) on the back of a card may be stored. Right now, the platform stores both in plain text in the database, which is a serious violation. The customer-facing checkout is safe (it redirects to Stripe), but an older admin payment path is not.

- **Refunds — the silent-lie bug** — When a store admin clicks "Refund" on an order, the screen says "Refund processed." No money is actually returned to the customer. The button does nothing except show a success message. Only stores using one specific old payment provider (Authorize.Net) can issue real refunds at all.

- **Chargebacks (disputed payments)** — When a customer disputes a charge with their bank, the platform only changes a status label. The store owner is never notified, no deadline is surfaced, and orders in dispute keep moving to print. This is the most financially urgent problem.

- **Currency and charge amounts** — When a customer checks out, the platform charges in whatever currency the payment gateway happens to be configured for, not necessarily the currency of the order. For some currencies (like Japanese Yen), a hardcoded calculation also multiplies the amount by 100 too many times, causing a 100x overcharge.

- **Tax calculation** — The platform uses a single flat tax rate for all products in all locations. It does not account for different tax rules by region (US states, EU VAT, India GST) and incorrectly charges tax on products that are marked as tax-exempt when purchased through the storefront.

- **Hidden surcharge** — An older payment path silently adds a 3.5% fee on top of the invoice amount with no disclosure to the customer or the store owner.

- **Webhook reliability** — Webhooks are automated messages from the payment provider confirming what happened to a payment. The platform's webhook handling is mostly solid, but a gap means a webhook from one store could accidentally update the wrong store's records.

**What to do with this:** The two most urgent fixes are (1) stop storing card security codes (CVV) immediately — this is a legal violation — and (2) fix the refund button so it actually moves money. Everything else in the document is ordered by urgency in the action plan at the end.
