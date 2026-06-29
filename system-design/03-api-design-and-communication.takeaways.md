**This document is about how different parts of a software system talk to each other — and how to design those conversations so they are reliable, easy to change, and hard to break. If you have ever wondered why a website sometimes charges you twice after a slow connection, or why changing one thing in a backend can silently break something in an app, this document explains the rules engineers follow to prevent that.**

**The main parts explained simply:**

- **Wait-for-reply vs fire-and-forget** — When your app asks for something, it can either wait for the answer before doing anything else (like a phone call), or send the request and move on, picking up the reply later (like a text message). Waiting is fine for small fast tasks like loading a page. Fire-and-forget is better for slow jobs like generating a PDF or sending an email — it keeps the app feeling fast.

- **REST, GraphQL, gRPC, tRPC — four ways to ask** — These are four different "languages" software services use to talk. REST is the most common and works like a simple menu of web addresses. GraphQL lets the asking side pick exactly which pieces of data it wants, cutting waste. gRPC is a fast, compact option used between internal services. tRPC works only when both sides are written in the same language (TypeScript). For most projects, REST is the right default.

- **Clean web addresses and correct reply codes** — A well-designed API uses neat address patterns (like `/orders/123`) and sends back the right status number: `200` means success, `404` means not found, `422` means the data you sent was wrong, `500` means the server itself broke. Using the right code matters because it tells the app whether to retry or not.

- **Versioning — how to improve an API without breaking old users** — When you change an API, old apps that rely on it can break silently (they just show wrong data with no error). The safe rule: only add new fields; never rename or remove existing ones. When you must break something, add the new field alongside the old one, update every user of the old field, then remove it later.

- **Pagination — avoiding the "show all" trap** — Loading thousands of records at once crashes databases. Offset-based paging (page 1, page 2…) slows down badly on large tables and can show duplicate or skipped rows when new data arrives. Cursor-based paging solves both problems: it always costs the same and stays stable even as new data is added.

- **Idempotency keys — preventing double charges** — If a network request times out, the app does not know whether it succeeded. For dangerous actions like charging a card, sending the same "key" (a unique ID) with every try lets the server recognize a repeat and return the original result instead of running the action again. This is how Stripe prevents double charging.

- **Rate limits and error messages** — APIs protect themselves by capping how many requests one caller can send per minute. When a limit is hit, the server returns `429` and tells the caller how long to wait before trying again. Error messages should always be structured and consistent so apps can handle them automatically — never just a raw number or vague phrase.

- **API gateway and BFF (Backend-for-Frontend)** — A gateway is a single entry door that handles security, routing, and logging before requests reach the real services. A BFF is a thin custom layer built specifically for one type of user (the admin panel gets one, the customer storefront gets another), so each gets exactly the data shape it needs without wasted effort.

- **Webhooks — letting the server call you back** — Instead of asking "is it done yet?" every few seconds (polling), webhooks let the server send a message to your app the moment something happens. The receiver must verify the message is genuine (using a secret signature), handle duplicates gracefully (the same event can arrive more than once), and reply quickly.

- **Long-running jobs — accept now, finish later** — For slow tasks (PDF export, bulk import), the API should accept the request instantly with a `202 Accepted` reply and give back a link the caller can check for progress. Never hold the connection open while slow work finishes.

**What to do with this:** Always add new API fields without removing old ones until every consumer is updated — silent breakage from a renamed field is one of the most common bugs. For any action that charges money or has real consequences, use idempotency keys so retries never cause double side-effects.
