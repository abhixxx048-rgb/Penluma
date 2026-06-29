**This document is a deep audit of 18 features already built into Print-Flow-360. It was written to help the team understand why non-technical shop owners get confused or stuck — and what to fix first. The central finding is simple: the platform is powerful but speaks "developer language" to people who just want to run a print shop.**

**The main parts explained simply:**

- **Silent lies** — Several buttons and pages look like they work but actually do nothing. The pricing calculator always shows the wrong price (it ignores your rules). Three dashboard "Report" buttons spin and go nowhere. Customer notification switches in the storefront save nothing. Fake phone numbers and fake "Recent Quotes" appear on the customer-facing quote page. These destroy trust and can cost real money — a shop owner believes their price is right, or their customer got an email, when neither is true.

- **Developer words shown to shopkeepers** — Internal codes like "ecommerce", "hybrid", "Manual", "Unposted", "Slug", "Option Key", "Critical", "Info", and "void" show up all over the admin. A print-shop owner cannot tell a printed banner ("printing") from a physical mug ("ecommerce") just by reading those words. Every label needs to be in plain shop language.

- **Wrong defaults that force extra setup** — Built-in staff roles (Designer, Sales Rep, etc.) are created with zero permissions, so new team members log in to a blank screen and think the app is broken. Guest checkout is turned off by default, so first-time buyers hit a login wall and leave. The daily alert summary email is off by default, so owners miss overdue invoices. The fix is: ship the settings most shops want already turned on.

- **Blank screens that look like "all clear"** — When the internet is slow or a request fails, many pages just show nothing — no message, no retry button. The dashboard "Action Center" widget shows a green "nothing needs attention" even when it failed to load. An overdue invoice behind a failed request looks like no problem at all.

- **No guidance when something isn't set up** — When a payment gateway isn't connected, customers can't pay but the owner only finds out from a complaint. The Stripe "Pay now" button on invoices leads to a dead error page. The webhook URL (needed for paid orders to be marked as paid) is never shown anywhere. Every dead end should explain what's missing and link to the exact place to fix it.

- **Destructive actions with no warning** — Deleting a product, a staff role, or an automation shows a generic "Are you sure?" with no details about what gets wiped. A single click can erase hours of pricing setup or lock out active staff with no explanation of consequences.

- **Wrong currency on screen** — Stores using euros, rupees, or pounds see dollar signs in several places — on product pages before the price loads, in the admin product list, and in the pricing calculator. Every price must use the store's actual currency from the first moment.

- **Onboarding that doesn't finish** — After signing up, no store is created automatically, so the "Get your store ready" checklist points at a store that doesn't exist. The demo products count as "your first product" so the step appears done when the owner hasn't added anything real. Placeholder fake stats ("10,000+ orders delivered", "4.9 rating") get seeded and can accidentally go live.

- **Pricing engine confusion** — The pricing rules form uses terms like "Adjustment vs Replacement" and strategy names like "Area Based" and "Conditional" that don't match any goal a shop owner would have. Choosing the wrong default silently doubles the price. The guided fix: offer plain-language choices ("Add to the price" vs "Set the whole price") and a "What do you want to do?" shortcut for common goals.

- **B2B pricing not showing up** — A logged-in business buyer sees full store prices on every product card even if the owner promised them 15% off. The discounted price only appears deep inside the product configurator, which makes the shop look untrustworthy to corporate clients.

- **Artwork quality hidden from the owner** — Customer files (up to 200MB) land on the order as a bare download link with no check on whether they're print-ready. A 72-DPI screen-resolution file looks the same as a 300-DPI print file until the job fails on press.

**What to do with this:**

Fix the "silent lies" first — the fake pricing calculator, dead payment buttons, and non-saving notification toggles destroy trust and can cause real financial errors. Then apply plain-language labels and sensible defaults platform-wide; these are small code changes with outsized impact for every shop owner who uses the product every day.
