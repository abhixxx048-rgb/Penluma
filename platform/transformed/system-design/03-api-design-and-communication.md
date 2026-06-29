---
title: "API Design: How Services Talk Without Breaking"
metaTitle: "API Design & Service Communication Guide"
description: "Learn API design that lasts: REST vs GraphQL vs gRPC, idempotency keys, cursor pagination, versioning, and webhooks that never double-charge a customer."
keywords:
  - api design
  - rest vs graphql
  - grpc
  - idempotency key
  - cursor pagination
  - api versioning
  - webhooks vs polling
  - synchronous vs asynchronous communication
  - http status codes
  - rate limiting
  - service communication
  - backend for frontend
  - contract testing
  - api error handling
topic: system-design
topicTitle: System Design
category: Engineering
date: '2026-06-15'
order: 3
icon: "\U0001F3D7️"
author: Pritesh Yadav
transformed: true
sources: []
faq:
  - q: "What is the difference between REST, GraphQL, and gRPC?"
    a: "REST uses HTTP verbs and URLs and is ideal for public, cacheable APIs. GraphQL lets the client request exactly the fields it needs, which helps when many clients have different needs. gRPC uses a compact binary format over HTTP/2 and is best for fast internal service-to-service traffic."
  - q: "What is an idempotency key and why does it matter?"
    a: "An idempotency key is a unique ID the client attaches to a request so that retrying it never causes the action to happen twice. It turns a risky operation like charging a card into something safe to retry after a network timeout, because the server replays its first result instead of charging again."
  - q: "Why is offset pagination slow at scale?"
    a: "With OFFSET, the database generates and throws away every row before the page you want, so latency grows the deeper you page. It also skips or duplicates rows when items are inserted mid-scroll. Cursor (keyset) pagination anchors on an indexed key, so every page costs the same."
  - q: "How do you version an API without breaking existing clients?"
    a: "Treat changes as additive: add new fields and endpoints, but never remove, rename, or retype a field a live client reads. For breaking changes, add the new field alongside the old one, migrate every consumer, then remove the old field in a later release."
  - q: "Should I use webhooks or polling?"
    a: "Use webhooks when you need near-real-time updates and can host an endpoint to receive them. Use polling when volume is low, you have no public URL, or simplicity matters more than latency. Webhook receivers must verify signatures and deduplicate, because delivery is at-least-once."
  - q: "When should services talk asynchronously instead of synchronously?"
    a: "Use synchronous request/response when the caller needs the answer to continue, like loading a page. Use asynchronous messages or events when the work can happen out of band, like sending email or generating a PDF, so one slow service does not drag down the others."
---

A payment API gets a request to charge a credit card. It charges the card. Then the network drops the connection before the "success" reply arrives. The client has no idea what happened, so it retries. Now the customer has been charged twice.

This exact scenario plays out millions of times a day across the internet, and good API design is the only thing standing between it and angry customers. The difference between an API that survives a decade and one that breaks every Tuesday isn't the framework. It's a handful of decisions about how your services talk to each other.

This guide walks through those decisions in plain language: which protocol to pick, how to retry safely, how to paginate, how to change your API without breaking the apps that depend on it, and how to send notifications that never fire twice.

## Why this matters

Most of the bugs that make it to production in a connected system aren't crashes. They're conversations gone wrong. One service expected a field that another service quietly renamed. A retry charged a customer twice. A "page 500" query brought the database to its knees.

These failures are quiet and expensive. A frontend showing wrong data is worse than one showing an error, because nobody notices until a customer does. And once your API is public, every mistake is permanent: someone, somewhere, wrote code against your old behavior and will never update it.

Getting the conversation right up front means you spend your future shipping features instead of apologizing for outages.

## Start with two questions, not a protocol

Before you argue about REST versus GraphQL, separate two decisions that people constantly mix up.

**1. Should the caller wait?** This is **synchronous** versus **asynchronous**.

- *Synchronous*: the caller asks and blocks, doing nothing until the reply comes back.
- *Asynchronous*: the caller fires off the request and moves on. The answer arrives later, or never.

**2. What shape is the interaction?** This is **request/response** versus **event-driven**.

- *Request/response*: "Do this, give me that." Like ordering at a counter.
- *Event-driven*: "This just happened." A broadcast to anyone who cares.

The dangerous combination is hidden synchronous coupling. If service A blocks while waiting on service B, then B's slowness becomes A's slowness, and B's outage becomes A's outage. You've chained their fates together without meaning to.

**Rule of thumb:** Use synchronous request/response when the caller truly needs the answer to continue, like loading a product page. Use asynchronous events when the work can happen out of band, like sending a receipt email, generating a PDF, or rebuilding a search index. The email doesn't need to finish before you tell the user "order placed."

## REST, GraphQL, gRPC, and tRPC: who wins when

All four move structured data between programs. They differ in who controls the shape of the data, what format travels over the wire, and how tightly the two sides are coupled.

### REST: the dependable default

REST models your system as **resources** (nouns like `orders` and `customers`) addressed by URLs, with HTTP verbs expressing the action. Its superpower is that it rides plain HTTP, so browsers, CDNs, and proxies already understand it. Caching, conditional requests, and status codes all work for free.

Reach for REST for public APIs and anything CRUD-shaped (create, read, update, delete). Stripe, GitHub, and Twilio all built their reputations on REST-style APIs.

### GraphQL: when clients want different things

With GraphQL, the **client** writes a query describing exactly which fields it wants, and the server returns precisely those. This kills two classic problems at once:

- **Over-fetching**: downloading a fat object when you only needed the name.
- **Under-fetching**: making five separate calls just to fill one screen.

GraphQL shines when one backend serves many clients with different appetites, like a data-hungry web dashboard and a bandwidth-conscious mobile app, or when a single screen pulls from several sources. The cost: HTTP caching gets hard (everything is one POST to one URL), and a careless setup can quietly fire one database query per item in a list. GitHub's v4 API is GraphQL.

### gRPC: for services talking to services

gRPC sends compact binary data over HTTP/2 and generates typed client code in nearly every language. It's fast, supports streaming in both directions, and is the standard choice for internal traffic between your own services. The downside: browsers can't speak it directly, and you can't casually poke at it with `curl`.

### tRPC: for all-TypeScript teams

In a TypeScript codebase where both the frontend and backend are TS, tRPC lets the client import the server's types directly. No schema files, no code generation, no drift between the two sides. The catch is right there in the name: it only works when both ends are TypeScript.

Here's the short version:

| If you're building... | Reach for |
|---|---|
| A public or CRUD API with broad reach | **REST** |
| One backend feeding many different clients | **GraphQL** |
| Fast internal service-to-service calls | **gRPC** |
| A full-stack TypeScript monorepo | **tRPC** |

## REST done right: nouns, verbs, and the right status code

The most common REST mistake is putting the action in the URL: `POST /createOrder`. That's a remote procedure call wearing a REST costume. Real REST uses nouns in the path and lets the HTTP verb carry the action.

```
GET    /orders?status=open&page=2     # a filtered list
POST   /orders                        # create one
GET    /orders/9f3a-uuid              # read one
PATCH  /orders/9f3a-uuid              # partial update
DELETE /orders/9f3a-uuid              # remove
POST   /orders/9f3a-uuid/refunds      # an action, modeled as a sub-resource
```

That last line is the trick for actions that don't fit neatly into create/read/update/delete: model the **outcome** as a resource. A refund is a thing, so you create one with `POST /refunds` rather than inventing `POST /order/refund`.

Two properties of these verbs quietly drive everything else:

- **Safe** means no side effects. A GET never changes anything.
- **Idempotent** means running it ten times has the same effect as running it once. PUT and DELETE qualify; POST usually does not.

These matter because they decide what's safe to retry. GET, PUT, and DELETE can be repeated freely. POST cannot, which is the whole reason idempotency keys exist (more on that below).

### Pick the precise status code

Status codes are a contract with the client's retry logic, and the category matters as much as the exact number.

- **2xx (it worked):** `200 OK`, `201 Created`, `202 Accepted` (started, not finished), `204 No Content`.
- **4xx (the client's fault, don't retry as-is):** `400` malformed, `401` not logged in, `403` logged in but not allowed, `404` not found, `409` conflict, `422` validation failed, `429` too many requests.
- **5xx (the server's fault, a retry might help):** `500` internal error, `503` unavailable, `504` gateway timeout.

The split between 4xx and 5xx is a promise: well-behaved clients retry 5xx and 429, but not 400 or 422. Return a `500` for a simple validation error and you've just invited every client to hammer your server forever over a typo in an email field.

## Changing your API without breaking everyone

Here is the cardinal rule of API evolution: **never remove, rename, or retype a field that a live client reads.** Adding things is safe. Taking them away breaks people.

There are a few ways to handle versions:

| Approach | Looks like | Trade-off |
|---|---|---|
| Version in the URL | `/v1/orders`, `/v2/orders` | Obvious and easy to route, but versions pile up |
| Version in a header | `Accept: ...v2+json` | Clean URLs, but invisible and harder to test |
| No versions, additive only | Just add fields, never remove | No version sprawl, but demands real discipline |

Stripe runs the gold-standard version of the last approach. The URL stays `/v1/` forever. The real version is a **date pinned to each account**, like `Stripe-Version: 2024-06-20`. Internally, Stripe keeps one current model and a chain of small translators. A request from an integration written in 2015 hits modern code, and the response is run backward through every translator until it comes out shaped exactly the way 2015 expected. Old integrations literally never break.

When you genuinely must make a breaking change, follow this sequence:

1. Add the new field **alongside** the old one.
2. Migrate every single consumer to the new field (web app, mobile app, webhooks, partners).
3. Only then, in a later release, remove the old field.

## Pagination: why "jump to page 500" kills your database

There are two ways to page through a long list, and the difference matters enormously at scale.

**Offset pagination** (`?page=500&per_page=20`) tells the database to skip ahead. The problem is that `OFFSET 1000000` forces the database to generate and then throw away a million rows before handing you the twenty you wanted. Latency grows the deeper you go. Worse, if someone inserts a row while a user is scrolling, every later page shifts by one, so the user sees a duplicate or misses an item entirely. That's the source of the classic complaint: "I keep seeing the same order twice."

**Cursor pagination** (`?after=<cursor>&limit=20`) anchors on a stable, indexed key like a timestamp plus ID. Instead of counting from the start, it seeks straight to "the rows just after this one." Every page costs the same, no matter how deep, and inserts can't shift the ground under the user.

The cursor itself is an opaque blob the client passes back without understanding it:

```
GET /orders?limit=20
→ 200 { "data": [...], "next_cursor": "eyJjcmVhdGVkIjoiMjAyNi0wNi0xNiIsImlkIjoiOWYzYSJ9" }
```

Keep cursors opaque on purpose. If clients can't peek inside them, you stay free to change the underlying key later. Use offset pagination for small admin tables where page numbers help; use cursors for large feeds, infinite scroll, and sync APIs. Slack, Stripe, and GitHub all use cursors for their big collections.

## Idempotency keys: making retries safe

Back to the double-charge scenario from the opening. A network timeout is **ambiguous**: the client genuinely cannot tell whether the server did the work. For a GET, who cares, just retry. For `POST /charges`, a blind retry is real money lost.

The fix is elegant. The client generates a unique **idempotency key** (just a UUID) and sends it with the request. The server remembers each key it has seen and the result it produced. If the same key shows up again, the server replays the stored result instead of doing the work a second time.

```
 Client                          Server (with idempotency store)
   │  POST /charges                 │
   │  Idempotency-Key: abc-123 ───► │  Seen abc-123 before?
   │                                │   ├─ No  → run charge, store result, 201
   │  ◄──── 201 Created ─────────── │   └─ Yes → return the stored result
   │  (timeout! client unsure)      │
   │  POST /charges (RETRY)         │
   │  Idempotency-Key: abc-123 ───► │  Seen it → REPLAY stored 201
   │  ◄──── 201 Created ─────────── │  (same response, no second charge)
```

Ten identical requests, one charge. A few details separate a toy version from a production one:

- **Scope the key** to the operation and account, and give it a time limit. Stripe keeps keys for about 24 hours.
- **Handle the racing retry.** If the retry arrives before the first request finishes, lock on the key or use a unique database constraint so two charges never run at once.
- **Fingerprint the body.** If the same key arrives with a *different* payload, reject it. That's a client bug, not a retry.

The store is your guarantee. If it's flaky, your promise is flaky. Stripe, PayPal, Adyen, and Square all do exactly this.

## Rate limits and error contracts that clients can read

When a client sends too many requests, return `429 Too Many Requests` along with headers that tell a well-behaved client when to come back:

```
HTTP/1.1 429 Too Many Requests
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 30
Retry-After: 30
```

Always include `Retry-After` on both `429` and `503`, so clients back off on a schedule instead of pounding your door.

For errors, never return a bare string or an HTML page. Use one consistent, machine-readable shape across every endpoint. The standard is `application/problem+json`:

```json
{
  "type": "https://api.acme.com/errors/validation",
  "title": "Validation failed",
  "status": 422,
  "detail": "The 'email' field must be a valid email address.",
  "errors": { "email": ["must be a valid email"] }
}
```

A stable error shape lets the client branch on `type` (a fixed URI, not a translated sentence), show `detail` to the user, and map `errors` onto form fields. One important rule: the **frontend** must turn this into plain language. Never show a non-technical user a raw `422` or a `type` URL.

## Gateways, BFFs, and contract testing

Three patterns show up constantly once you have more than one service.

**API gateway:** a single front door for many backend services. It handles the cross-cutting chores once, so each service doesn't reinvent them: TLS, authentication, rate limiting, routing, logging. Keep it dumb. The moment business logic creeps into the gateway, it becomes a tangled "god object" everyone fears to touch.

**Backend-for-Frontend (BFF):** a thin, per-client API layer. Your web app and mobile app want different things. Mobile wants fewer round-trips and smaller payloads; web can afford chattier calls. Instead of one bloated API serving both badly, each frontend gets its own slim BFF that aggregates and tailors data for it.

**Contract testing:** the cure for services drifting apart. Instead of slow, brittle end-to-end tests, the *consumer* writes down the requests it makes and the responses it expects (a "pact"), and the *provider* runs those expectations against itself in its own build. If the provider removes a field the consumer depends on, the provider's build fails *before* it ships. Pact is the well-known tool here, and it catches silent breaking changes mechanically. No human has to notice.

## Webhooks vs polling, and work that takes too long

There are two ways to learn whether something happened.

**Polling** means the client asks over and over: "Done yet? Done yet?" It's trivial to build but wastes requests and adds latency up to your poll interval.

**Webhooks** flip the direction: the server calls the client back the moment the event happens. Near-real-time and no wasted requests, but the receiver now has to host an endpoint, verify it, and handle duplicates.

That last part is critical. Webhook delivery is **at-least-once**. The provider keeps retrying until it gets a `2xx`, which means the same event can arrive twice. Your handler must:

1. **Verify the signature.** The provider signs the request body with a shared secret. Check it, or anyone can POST fake events to you.
2. **Deduplicate by event ID.** If you've processed this event before, skip it. Otherwise a retried "payment succeeded" ships the order twice.
3. **Reply `2xx` fast, then work async.** Acknowledge immediately and queue the real processing. Slow handlers look like failures, and failures trigger more retries.

For work that simply can't finish inside one request (PDF generation, a bulk import, image processing), don't hold the connection open. Accept the job and hand back a status URL:

```
POST /exports
→ 202 Accepted
  Location: /exports/job-42
  { "id": "job-42", "status": "pending" }

GET /exports/job-42
→ 200 { "status": "processing", "progress": 40 }
...
GET /exports/job-42
→ 200 { "status": "done", "result_url": "https://.../export.pdf" }
```

`202 Accepted` means "I've got it, but it's not done." Never return a `200` pretending success for work that's still sitting in a queue.

## Common misconceptions

**"Putting the verb in the URL is still REST."** `POST /getUser` and `POST /order/cancel` are RPC over HTTP. You lose caching, the safe/idempotent guarantees, and the ability of proxies and CDNs to understand your traffic.

**"A 500 is fine for bad input."** It isn't. Returning a 5xx for a validation error makes clients retry forever and burns through your error budget. Bad input is `422`.

**"GraphQL is slow, so avoid it."** The slowness people blame on GraphQL is usually the N+1 query problem: a resolver fetching the author for each of 100 posts runs 101 queries. The fix is batching (the DataLoader pattern), not abandoning GraphQL.

**"If the response doesn't error, the data is fine."** The scariest failures are silent. A backend renames `total` to `grand_total`, no error fires anywhere, and the storefront cheerfully shows `$0` because the old field is now undefined. A frontend showing wrong data is worse than one showing an error, because nobody notices.

**"Webhooks arrive exactly once."** They don't. Plan for duplicates from day one.

## How to use this

When you design or review an API, walk this checklist:

1. **Separate the two axes first.** Decide synchronous vs asynchronous and request/response vs event-driven *before* you pick a protocol.
2. **Default to REST**, and switch to GraphQL, gRPC, or tRPC only for the specific reasons above.
3. **Model nouns, not verbs.** If you're tempted to write `/doSomething`, find the resource hiding inside the action.
4. **Return the precise status code.** Especially keep validation errors in the 4xx family.
5. **Add idempotency keys** to every mutating endpoint where a double-submit would hurt, like payments and order creation.
6. **Use cursor pagination** for anything that grows. Save offset for small admin tables.
7. **Evolve additively.** Add fields, never remove in place. For breaking changes: add new, migrate everyone, then delete old.
8. **Standardize your error shape** with `application/problem+json` so clients can branch on a stable field.
9. **Make webhook handlers idempotent and signature-verified.** Reply fast, process later.
10. **Add contract tests** between services so a removed field fails a build instead of a customer's checkout.

## Conclusion

If you remember one thing, make it this: **networks are ambiguous, so design every operation to be safe to retry.** That single principle is the thread running through idempotency keys, status code discipline, additive versioning, and at-least-once webhooks. You're not preventing failure, because failure is guaranteed. You're making failure boring.

The patterns here decide *how* your services talk. The next question is where all those `orders` and `refunds` and `exports` actually live: how a database stores them, indexes them, and finds one row among billions in milliseconds. That's where the real performance story begins, and it's the topic worth reading next.
