**This document is a testing log from one session where every page of the store's admin panel and customer-facing shop was visited, clicked through, and checked for errors. It records what was broken, what got fixed on the spot, and what still needs attention. It matters because it shows the real state of the platform before going live with real customers and real money.**

**The main parts explained simply:**

- **Pages visited and checked** — The tester opened every admin screen (customers, orders, products, settings, accounting, marketing, and more) and watched for errors in the background. Nearly all pages passed with no errors.

- **Fixes made during the session** — Four problems were found and fixed on the spot: error messages that crashed the activity log every time a newsletter was saved; a live-chat crash that was silently breaking every admin page; order item images that showed broken picture links; and a "Transactions" page that was an empty stub now redirected to the correct Accounting page.

- **Minor issues left open** — Three small cosmetic or data problems were noted but not yet fixed: a status label using an hourglass emoji while everything else uses a colored dot; a web inquiry that accidentally saved a form-validation message instead of the customer's real message; and an AI usage counter where about 70 requests do not appear in any summary bucket.

- **End-to-end flows tested** — The tester actually created a customer, a quote with a line item, an email campaign, and changed an order status — all the way through, with no backend errors. Audit logs (the record of who did what and when) were confirmed to be working.

- **Storefront pricing verified** — All five pricing methods (fixed price, area-based, quantity tiers, percentage, and formula) were tested on real product pages and produced correct prices.

- **Full purchase from shop to admin** — A guest customer added a product to the cart and checked out. The order appeared correctly in the admin panel with the right customer, product, and payment method.

- **Shipping cost bug (critical — fixed)** — When a customer checked out, the shop correctly showed a shipping charge (for example $100) but the admin order recorded $0 shipping, meaning the store was losing that revenue on every order. This was found, root-caused, and fixed. New orders now save the correct shipping cost. Coupon discounts were also not being subtracted from the order total — this was fixed at the same time. Tests were written to confirm the fix.

- **Zero-price item checkout bug (fixed)** — A product with no calculable price could still be added to the cart from an old session and slip through to checkout. The checkout page now blocks this and tells the customer to request a quote or remove the item.

- **Other small storefront issues (not yet fixed)** — The default payment method shown to customers is one that doesn't work yet (Authorize.Net); a better default like Cheque or Stripe should be set. The order success page tells a customer "Payment Successful" even for cheque orders where payment hasn't actually been received yet — the wording should say "Order placed, payment pending." Removing an item from the cart updates totals immediately but the item card stays visible until the page is refreshed.

**What to do with this:**

The shipping + coupon fix is the most important one — it was causing real revenue loss and is now resolved. Before launch, also fix the default payment method so the first thing customers see actually works, and update the cheque success page message so it doesn't falsely promise that payment was received.
