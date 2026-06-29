**This document is a report from a test session where someone carefully walked through the Print-Flow-360 platform — the admin panel, the customer store, and the checkout — and wrote down every problem they found. Most of the problems have already been fixed. Reading this tells you what was broken, why it mattered, and what was done to repair it.**

**The main parts explained simply:**

- **Cart price vs checkout price mismatch** — When a customer added items to their cart, the shipping cost shown in the cart was $49. But the moment they clicked "Checkout," the shipping jumped to $100 with no explanation. This is a serious trust problem — a customer who sees a different price at checkout will abandon their order or dispute the charge later. This is still open and needs a fix.

- **Same product showing two different prices on one page** — A product listed as $75 in one spot on its page showed $77 in another spot on the same page. It looked broken and untrustworthy. This was fixed so both numbers now agree.

- **Too many requests error (429) under normal use** — The system was set to allow only 60 requests per minute per person. The admin dashboard alone fires about a dozen requests when it first loads. Open a couple of tabs and you'd hit the limit just doing normal work, causing blank screens. This was fixed by raising the limit for logged-in staff to 300 per minute.

- **Screens that showed "Loading…" forever or "No results" while data was actually loading** — Several pages would spin forever or show "0 records" even when the data was there and on its way. Fixed by separating the "loading" state from the "empty" state — now a blank result only shows after the data has fully arrived.

- **Team and Roles page was fully broken** — The page for managing staff roles showed "0 records" and a raw error message instead of the list. A bug deep in the server code caused this. Fixed — the team page now loads correctly.

- **Dashboard showing duplicate widgets** — The main dashboard showed the same Quotes and Invoices boxes twice. A layout bug caused this when widgets were moved around. Fixed so each widget appears only once.

- **Orders showing "Deleted customer" even when the customer's details were saved** — When a customer account was removed, their name, email, and phone disappeared from all their past orders — even though the system had saved a copy of those details at the time the order was placed. Fixed so past orders now show the saved snapshot of customer details.

- **Security check: tenant data isolation** — A check was done to confirm that one store owner cannot see another store owner's data. No leak was found. The system has three separate layers of protection.

- **Test suite was completely broken** — A typo in one test file stopped all automated tests from running. Fixed, so the safety net is back on.

**What to do with this:**

The one remaining open issue is the **shipping price mismatch between cart and checkout** — this will cause customer confusion and lost sales and should be fixed before real customers use the store. Everything else listed here has been resolved.
