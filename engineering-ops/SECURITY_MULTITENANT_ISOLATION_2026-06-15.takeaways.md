**This document is a security check of how Print-Flow-360 keeps each store's data separate from every other store's data. It found several serious problems where one store owner could accidentally — or deliberately — read or change another store's data. These problems are real and confirmed in the code, not just theoretical worries.**

**The main parts explained simply:**

- **Shared database with filters** — All stores share the same database. The only thing keeping Store A from seeing Store B's data is a software filter that runs on every database query. If that filter is ever skipped or turned off, any store can read any other store's data. There is no deeper safety net.

- **Fail-open isolation** — "Fail-open" means: if the filter is not set up correctly, it does nothing and lets everything through. Right now, if a page or background job forgets to set up the filter, all data from all stores is visible. There is no fallback that blocks the leak.

- **Cross-store data tampering (IDOR)** — Two specific pages in the admin panel (for managing order statuses and job statuses) let any store admin change or delete another store's custom statuses just by guessing a number in the web address. This is confirmed and live.

- **Master backdoor OTP** — There is a hardcoded backup login code (702702) baked into the system. If the environment is not configured to override it, anyone who knows this number can bypass two-factor login for any admin account.

- **Designer access tokens never expire** — The security tokens used by the design studio have a bug where expired tokens are accepted forever instead of being rejected. Anyone with an old token keeps access indefinitely.

- **CORS wildcard** — The system allows any website on the internet to make requests to the API on behalf of a logged-in user. This means a malicious website could silently act as the user.

- **No login rate limits on the customer storefront** — The customer login page has no limit on how many times someone can try to guess a password. An attacker can try thousands of passwords automatically.

- **Designer asset library leaks** — Customers' uploaded design files are visible to all customers in the design studio, not just the person who uploaded them.

- **Background jobs run without store context** — Tasks that run in the background (like sending emails) often forget to set up the store filter, so they can accidentally query or affect the wrong store's data.

- **Security tokens do not expire** — Customer login tokens never time out. If a token is stolen, it works forever.

**What to do with this:**

Fix the three critical items first: (1) add an ownership check to the order-status and job-status edit pages so they refuse to touch another store's records, (2) remove the hardcoded master OTP backdoor entirely, and (3) fix the designer token bug so expired tokens are rejected. These three fixes close the only confirmed live exploits before any other hardening work begins.
