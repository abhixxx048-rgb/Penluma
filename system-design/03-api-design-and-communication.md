# API Design & Service Communication

**What you'll learn:** How to choose between REST, GraphQL, gRPC, and tRPC, and when each genuinely wins; how synchronous request/response and asynchronous event-driven styles trade off; and the senior-level mechanics that keep an API healthy at scale — proper resource modeling, versioning without breaking consumers, cursor pagination, idempotency keys for safe retries, structured error contracts, BFFs and gateways, contract testing, webhooks, and long-running async operations.

**Prerequisites:** Read [`01-fundamentals-and-scalability.md`](./01-fundamentals-and-scalability.md) (latency, throughput, scaling axes) and [`02-...`](./02-network-and-protocols.md) (HTTP, TCP, TLS, DNS). This module assumes you know what an HTTP request/response is and how connections work. It builds directly on those primitives.

---

## 1. The two big axes

Before picking a protocol, separate two independent decisions. People conflate them and pick badly.

1. **Communication style** — *synchronous* (caller blocks waiting for a reply) vs *asynchronous* (caller fires and continues; reply arrives later or never).
2. **Interaction shape** — *request/response* (RPC-like: "do X, give me Y") vs *event-driven* ("X happened" broadcast to whoever cares).

```
                 request/response            event-driven
            ┌───────────────────────┬──────────────────────────┐
 sync       │ REST GET, gRPC unary, │  (rare — blocking on an   │
            │ GraphQL query         │   event is an anti-pattern)│
            ├───────────────────────┼──────────────────────────┤
 async      │ 202 + status URL,     │ message queues, Kafka,     │
            │ webhooks (callback)   │ pub/sub, domain events     │
            └───────────────────────┴──────────────────────────┘
```

Synchronous coupling is the silent killer of distributed systems: if service A *blocks* on B, then B's latency and downtime become A's. Async (queues, events) decouples availability — A enqueues and returns even if B is down. See [`10-message-queues-and-streaming.md`](./10-message-queues-and-streaming.md) and [`15-microservices-and-decomposition.md`](./15-microservices-and-decomposition.md).

**Rule of thumb:** Use sync request/response when the caller *needs the answer to proceed* (loading a product page). Use async/events when the work can happen out-of-band (send email, generate a PDF, rebuild a search index).

---

## 2. REST vs GraphQL vs gRPC vs tRPC

All four move structured data between processes; they differ in *who controls the shape*, the *wire format*, and the *coupling*.

| Dimension | REST | GraphQL | gRPC | tRPC |
|---|---|---|---|---|
| Transport | HTTP/1.1 or 2, JSON | HTTP, JSON (single endpoint) | HTTP/2, Protobuf binary | HTTP, JSON |
| Schema/contract | OpenAPI (optional) | Strongly typed schema (SDL) | `.proto` (strict) | TS types (compile-time only) |
| Who picks fields | Server | **Client** (per-query) | Server | Server |
| Streaming | SSE / chunked (awkward) | Subscriptions | Native bidi streaming | Limited |
| Over-/under-fetching | Common | Solved by design | Minimal (binary) | Minimal |
| Caching | HTTP caching just works | Hard (POST, one URL) | App-level only | App-level |
| Cross-language | Excellent | Good | Excellent (codegen) | **TS-only** |
| Browser-friendly | Yes | Yes | No (needs grpc-web proxy) | Yes |
| **When it wins** | Public APIs, CRUD, broad reach, HTTP caching | Many clients with divergent needs (mobile vs web), aggregating many sources | Internal service-to-service, low latency, polyglot, streaming | Full-stack TS monorepo, no codegen overhead |

**REST** is the default for public and CRUD-shaped APIs. It rides HTTP semantics (verbs, status codes, caching, conditional requests) so intermediaries — CDNs, proxies, browsers — understand it for free. Stripe, GitHub, and Twilio are REST(ish).

**GraphQL** shines when one backend serves many clients that each want different field subsets, and when a single screen aggregates several backend sources. The client sends a query; the server returns *exactly* those fields, eliminating the over-fetch (download fields you ignore) and under-fetch (N requests to assemble one screen) problems. Cost: caching is hard (everything is `POST /graphql`), and a naive resolver layer reintroduces N+1 queries (mitigated by DataLoader batching). GitHub's v4 API is GraphQL.

**gRPC** is the standard for *internal* east-west traffic. Protobuf is compact and fast; HTTP/2 gives multiplexing and bidirectional streaming; codegen produces typed stubs in every language. It's poor for browsers (needs a grpc-web proxy) and unfriendly to ad-hoc curl debugging.

**tRPC** removes the schema-duplication tax in a TypeScript monorepo: the client imports the server's *types* directly, so there's no codegen and no drift — but it only works when both ends are TS. For your Nuxt+Laravel stack, tRPC isn't applicable (Laravel isn't TS); REST is the right backbone.

---

## 3. REST done properly: resources, verbs, status codes

REST models **resources** (nouns) addressed by URLs; verbs express the operation. The classic mistake is putting verbs in the path (`POST /createOrder`) — that's RPC wearing a REST costume.

| Verb | Meaning | Safe? | Idempotent? |
|---|---|---|---|
| GET | Read | ✅ | ✅ |
| POST | Create / non-idempotent action | ❌ | ❌ |
| PUT | Replace whole resource | ❌ | ✅ |
| PATCH | Partial update | ❌ | ❌ (usually) |
| DELETE | Remove | ❌ | ✅ |

*Safe* = no side effects. *Idempotent* = running it N times == running it once. These properties drive what's safe to retry (§6) and cache.

**Resource modeling.** Use plural collection nouns and nest sub-resources:

```
GET    /orders?status=open&page=2     # filtered collection
POST   /orders                        # create
GET    /orders/9f3a-uuid              # one resource (use uuid, not int id)
PATCH  /orders/9f3a-uuid              # partial update
DELETE /orders/9f3a-uuid
GET    /orders/9f3a-uuid/line-items   # sub-collection
POST   /orders/9f3a-uuid/refunds      # "action" modeled as a sub-resource
```

That last line is the trick for actions that don't fit CRUD: model the *outcome* as a resource (`POST /refunds`) rather than `POST /order/refund`.

**Status codes — use the precise one.** The category matters as much as the exact number:

- `2xx` success — `200 OK`, `201 Created` (+ `Location` header), `202 Accepted` (async, §9), `204 No Content`.
- `3xx` redirect/conditional — `304 Not Modified` (ETag hit).
- `4xx` *client's fault, don't retry as-is* — `400` (malformed), `401` (unauthenticated), `403` (authenticated but forbidden), `404`, `409` (conflict), `422` (validation failed), `429` (rate limited).
- `5xx` *server's fault, retry may help* — `500`, `503` (unavailable, often with `Retry-After`), `504` (gateway timeout).

The 4xx/5xx split is a *contract with retry logic*: clients retry 5xx and 429, not 400/422. Returning `500` for a validation error makes clients hammer you pointlessly.

---

## 4. Versioning & schema evolution without breaking consumers

The cardinal rule (from [`CLAUDE.md`'s backward-compat section]): **never remove, rename, or retype a field that a live consumer reads.** Additive changes are safe; subtractive ones break.

**Strategies:**

| Strategy | Example | Pros | Cons |
|---|---|---|---|
| URI versioning | `/v1/orders`, `/v2/orders` | Obvious, cacheable, easy to route | Version sprawl; URLs lie about "the" resource |
| Header versioning | `Accept: application/vnd.acme.v2+json` | Clean URLs | Invisible, harder to test in a browser |
| Content negotiation | `Accept` media type | RESTful purity | Same invisibility issue |
| **No versioning + additive evolution** | Add fields, never remove | No version explosion | Requires discipline + deprecation tooling |

Stripe famously uses **date-based versions pinned per account** (`Stripe-Version: 2024-06-20`) and runs request/response *transformers* that translate between the account's pinned version and the current internal model — so old integrations never break while the core schema evolves. That's the gold standard: one internal model, compatibility shims at the edge.

**Safe evolution checklist:**
- ✅ Add an optional field, add a new endpoint, add a new enum value *only if clients tolerate unknowns*.
- ❌ Remove/rename a field, tighten validation, change a type, change default behavior of a `200`.
- For breaking changes: add the new field *alongside* the old, migrate every consumer (admin, storefront, designer, webhooks), then remove the old field in a later release.

**Protobuf schema evolution** (for gRPC/Kafka payloads): each field has a numeric *tag*. Rules — never reuse or change a tag number; new fields must be `optional`/have defaults; you can rename a field freely (the tag, not the name, is on the wire); to remove a field, `reserve` its tag so it's never reused. Readers ignore unknown tags (forward compatibility) and supply defaults for missing ones (backward compatibility). This is exactly the encoding-evolution material in DDIA Ch.4.

---

## 5. Pagination: why offset breaks at scale

| Aspect | Offset/Limit (`?page=3&per_page=20`) | Cursor/Keyset (`?after=<cursor>&limit=20`) |
|---|---|---|
| SQL | `LIMIT 20 OFFSET 40` | `WHERE (created_at,id) < (?,?) ORDER BY ... LIMIT 20` |
| Cost at deep pages | O(offset) — DB scans+discards N rows | O(limit) — index seek, constant |
| Stable under inserts/deletes | ❌ rows shift; you skip/duplicate | ✅ anchored to a key |
| Random page access | ✅ "jump to page 500" | ❌ sequential only |
| Total count | Easy | Expensive/omitted |
| **When to use** | Small/admin tables, need page numbers | Large feeds, infinite scroll, sync APIs |

The offset failure mode: `OFFSET 1000000` forces the database to *generate and throw away* a million rows before returning 20 — latency grows linearly with depth. Worse, if a row is inserted while a user paginates, every subsequent `OFFSET` shifts by one, so they re-see a row or skip one entirely.

**Keyset** anchors on a stable, indexed, unique sort key (e.g. `(created_at, id)`). The cursor is an opaque, base64-encoded encoding of the last row's sort key:

```
GET /orders?limit=20
→ 200 { "data":[...], "next_cursor":"eyJjcmVhdGVkIjoiMjAyNi0wNi0xNlQxMDoxMiIsImlkIjoiOWYzYSJ9" }
GET /orders?after=eyJ...&limit=20    # next page, constant-time
```

Slack, Stripe, and the GitHub API all use cursor pagination for large collections. **Make cursors opaque** — encode them so clients can't construct or assume their internals, leaving you free to change the underlying key.

---

## 6. Idempotency keys & the POST-retry problem

A network timeout is **ambiguous**: the client doesn't know whether the server processed the request. For a `GET` you just retry (it's idempotent). For a `POST /charges` (a credit-card charge), a blind retry risks **double-charging**.

The fix: the client generates a unique **idempotency key** (a UUID) and sends it on the request. The server stores `(key → first result)` and *replays* the stored result for any retry with the same key — so N identical requests cause one side effect.

```
 Client                          Server (+ idempotency store)
   │  POST /charges                 │
   │  Idempotency-Key: abc-123 ────►│  key abc-123 seen before?
   │                                │   ├─ no  → run charge, store(abc-123, result), 201
   │  ◄──── 201 Created ────────────┤   └─ yes → return stored result (no re-charge)
   │  (timeout! client unsure)      │
   │  POST /charges (RETRY)         │
   │  Idempotency-Key: abc-123 ────►│  key abc-123 seen → REPLAY stored 201
   │  ◄──── 201 Created ────────────┤   (same body, no second charge)
```

Mechanics that matter at staff level:
- **Scope the key** to the operation + account, with a TTL (Stripe keeps keys ~24h).
- **Handle the concurrent retry** (client fires the retry before the first finishes): take a per-key lock or rely on a unique DB constraint on the key; return `409` or block until the first completes. Never run two bodies for the same key.
- **Fingerprint the body** — if the same key arrives with a *different* payload, reject (`422`), because that's a client bug, not a retry.
- The store *is* the idempotency guarantee; if it's flaky, your guarantee is flaky.

Stripe's `Idempotency-Key` header is the canonical reference. PayPal, Adyen, and Square do the same. Deep dive: [`11-distributed-transactions-and-idempotency.md`](./11-distributed-transactions-and-idempotency.md).

---

## 7. Rate-limit headers & error-contract design

**Rate limiting** protects you from abuse and noisy neighbors (deep dive: [`16-rate-limiting-and-resiliency.md`](./16-rate-limiting-and-resiliency.md)). The *API-design* part is the response contract. On a limited request return `429 Too Many Requests` plus headers so a well-behaved client can self-throttle:

```
HTTP/1.1 429 Too Many Requests
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 30          # seconds until the window resets
Retry-After: 30
```

(GitHub uses `X-RateLimit-*`; the IETF is standardizing the un-prefixed `RateLimit-*` fields.) Always send `Retry-After` on `429` and `503` so clients back off deterministically instead of hammering.

**Error contracts.** Don't return bare strings or HTML. Standardize on **`application/problem+json`** (RFC 9457), a single machine-parseable shape across every endpoint:

```json
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/problem+json
{
  "type": "https://api.acme.com/errors/validation",
  "title": "Validation failed",
  "status": 422,
  "detail": "The 'email' field must be a valid email address.",
  "instance": "/orders/9f3a-uuid",
  "errors": { "email": ["must be a valid email"] }
}
```

A stable error contract lets clients branch on `type` (a URI, not a translated string), show `detail` to users, and field-map `errors`. Per `CLAUDE.md`'s UX rules, the *frontend* must turn this into plain language — never surface `"422"` or raw `type` URIs to a non-technical store owner.

---

## 8. BFF, API gateways, and contract testing

**API gateway** — a single front door for many backend services. It centralizes cross-cutting concerns so each service doesn't reimplement them: TLS termination, authn, rate limiting, routing, request logging, and response shaping. Kong, AWS API Gateway, and Envoy are typical. The risk is the gateway becoming a "god object" with business logic in it — keep it dumb (routing + policy), keep logic in services.

**Backend-for-Frontend (BFF)** — a *per-client* API layer. Your web app and mobile app have different needs (mobile wants fewer round-trips and smaller payloads; web can do more chatty calls). Instead of one bloated API serving both poorly, each frontend gets a thin BFF that aggregates and tailors. Your **storefront** (`frontstore/`) and **admin** (`nuxt/`) are effectively two BFF-shaped consumers of the Laravel API — and Nuxt's server routes (Nitro) can act as a true BFF, hiding internal endpoints and composing calls server-side.

```
 mobile ─► Mobile BFF ─┐
                       ├─► [order svc] [catalog svc] [pricing svc]
 web    ─► Web BFF ────┘
```

**Contract testing** — the antidote to integration drift in microservices. Instead of slow end-to-end tests, the *consumer* declares the requests it makes and the responses it expects (a "pact"); the *provider* runs those expectations against itself in CI. If the provider removes a field the consumer relies on, the provider's build fails *before* deploy. Pact is the well-known tool. This catches the §10 silent-breaking-change class mechanically. See [`14-testing-distributed-systems.md`](./14-testing-distributed-systems.md).

---

## 9. Webhooks vs polling & long-running operations

**Polling vs webhooks** — two ways to learn "did X happen yet?"

| | Polling | Webhooks |
|---|---|---|
| Direction | Client asks repeatedly | Server calls client (callback) |
| Latency | Up to poll interval | Near-real-time |
| Wasted requests | Many empty polls | None |
| Complexity on receiver | Trivial | Must host an endpoint, verify, dedupe |
| **When** | Simple, low-volume, no public URL | Event-driven, many consumers, low latency |

**Webhook flow** and its hard parts:

```
 Provider (Stripe)                         Your server
   │  event: payment.succeeded                │
   │  POST /webhooks/stripe ──────────────────►│ 1. verify HMAC signature (Stripe-Signature)
   │  Stripe-Signature: t=..,v1=<hmac>        │ 2. check event id seen? (dedupe — at-least-once!)
   │                                           │ 3. enqueue job, return 200 FAST
   │  ◄──── 200 OK (within seconds) ───────────┤ 4. process async; non-200 ⇒ provider retries
```

Webhook delivery is **at-least-once**: providers retry until they get a `2xx`, so the *same* event can arrive twice — your handler must be **idempotent** (dedupe by event id). Always **verify the signature** (HMAC of the raw body with a shared secret) or anyone can POST fake events. Return `2xx` immediately and do work asynchronously, or slow processing triggers retries and duplicates. This is exactly the event-driven async style from §1.

**Long-running operations (202 + status URL).** When work can't finish within a request (PDF generation, bulk import, image processing — your `pdf-service`), don't hold the connection. Accept and hand back a status resource:

```
POST /exports
→ 202 Accepted
  Location: /exports/job-42
  { "id":"job-42", "status":"pending" }

GET /exports/job-42
→ 200 { "status":"processing", "progress":40 }
...
GET /exports/job-42
→ 200 { "status":"done", "result_url":"https://.../export.pdf" }
```

The client polls the status URL (or you fire a webhook on completion — best to offer both). `202` means "accepted, not done"; never return `200` with a fake "success" for work that's still queued.

---

## 10. Common pitfalls / war stories

- **The silent breaking change.** A backend renames `total` → `grand_total` in a `200` response. No error fires anywhere; the storefront just shows `$0` because `order.total` is now `undefined`. *A frontend showing wrong data is worse than one showing an error.* This is the exact class `CLAUDE.md` calls out — and contract tests (§8) catch it mechanically. Always: add new field, migrate consumers, remove old later.
- **The silent dropped field.** A form sends `attention_to`; the backend's FormRequest `rules()` doesn't list it, so it's discarded. User sees "Saved", data is gone. Every input must round-trip validate→save→read→render, proven by a test. (Same `CLAUDE.md` "silent-lie" class.)
- **500 for validation.** Returning `5xx` on bad input makes clients retry forever and pollutes your error budget. Validation = `422`.
- **Offset pagination on a growing feed.** Users report "I keep seeing the same order twice." Cause: inserts shifting offsets mid-scroll. Switch to keyset.
- **Non-idempotent webhook handler.** Stripe retries `payment.succeeded`; your handler ships the order twice. Dedupe by event id.
- **GraphQL N+1.** Resolver fetches the author for each of 100 posts → 101 queries. Fix with DataLoader batching, not by abandoning GraphQL.
- **Verb-in-URL "REST".** `POST /getUser`, `POST /order/cancel` — you've built RPC over HTTP and lost caching, idempotency semantics, and intermediary understanding.

---

## 🧩 Case Study: Stripe API

Stripe's whole business is one promise: developers integrate the API *once* and it keeps working — through retries, network failures, and years of schema changes — without ever double-charging a customer. At Stripe's scale that promise is non-trivial. The API handles **billions of requests per day**, processes **hundreds of billions of dollars** in annual payment volume, and serves **millions of businesses** whose integrations were written across more than a decade. A single one of those integrations might have been deployed in 2015 and never touched since. It must still work today, and a charge that runs twice is real money lost. The problem statement is therefore: *every concept in this module, applied at once, with money on the line.*

### Idempotency: the POST-retry problem, in production

The motivating failure is exactly §6's ambiguous timeout. A merchant's server sends `POST /v1/charges`, the connection drops *after* Stripe charged the card but *before* the `201` came back. The client has no idea whether it worked. Retry blindly and you double-charge; don't retry and you might lose a successful payment from your records.

Stripe's answer is the canonical **idempotency key** pattern from this module. The client generates a UUID and sends `Idempotency-Key: <uuid>`. Stripe stores `(key → first response)` and **replays** the stored response for any retry carrying the same key — N requests, one charge.

```
 Merchant server              Stripe API + idempotency store
   │ POST /v1/charges              │
   │ Idempotency-Key: a1b2 ───────►│ seen a1b2?
   │                               │  └ no → charge card, store(a1b2, 201+body)
   │  ◄─── 201 {id: ch_x} ─────────┤
   │  ✗ TCP reset — unsure!        │
   │ POST /v1/charges  (retry)     │
   │ Idempotency-Key: a1b2 ───────►│ seen a1b2 → REPLAY stored 201 (no 2nd charge)
   │  ◄─── 201 {id: ch_x} ─────────┤
```

Stripe implements every staff-level mechanic §6 lists: keys are **scoped per account** with a **~24h TTL**; concurrent retries (the retry fires before the first finishes) are serialized by a **per-key lock** that returns a `409` rather than running two bodies; and Stripe **fingerprints the request body** — reuse a key with a *different* payload and you get an error, because that's a client bug, not a retry. The idempotency store is the guarantee, so it's backed by their durable datastore, not an in-memory cache.

### Dated versioning: backward-compat without version sprawl

This is §4's gold-standard example made concrete. Stripe does **not** use `/v1/`, `/v2/` URL sprawl. The path stays `/v1/` forever; the real version is a **date pinned per account** — `Stripe-Version: 2024-06-20`. When an account first calls the API its version is frozen to that day's schema. Internally Stripe keeps **one current model** and a chain of **request/response transformers**: an integration pinned to 2018 hits the modern code, and the response is run *backwards* through every transformer between today and 2018 before it ships. A 2015 integration literally receives 2015-shaped JSON from 2026 code. This is precisely the "one internal model, compatibility shims at the edge" pattern §4 describes — additive-only core, edge translation for olds clients — and it's why Stripe almost never forces a migration.

### Cursor pagination & the error contract

Listing objects (`GET /v1/charges`) uses **cursor pagination** (§5), not offset — `?starting_after=ch_abc&limit=100`. With merchants holding millions of charges, `OFFSET 2000000` would scan-and-discard millions of rows per page; the cursor is an opaque object id that anchors a keyset seek, so deep pages cost the same as shallow ones. Errors follow a **stable, typed contract** (§7): every error is a JSON object with a machine-branchable `type` (`card_error`, `invalid_request_error`, `rate_limit_error`), a `code`, and a human `message`, plus `429` responses that carry backoff guidance — exactly the "branch on a stable field, never parse the prose" discipline from the error-contract section.

### The trade-off they accepted

Dated versioning is **expensive to operate**. Every breaking schema change requires writing — and *keeping forever* — a transformer that downgrades the new shape to every prior version. Years in, that's a long, permanently-maintained, well-tested chain of shims that every response passes through, adding latency and engineering toil. Stripe deliberately took on **enormous, perpetual internal complexity** to buy **zero forced migrations for customers**. For most APIs that trade is wrong (just cut a `/v2/`); for a payments API whose moat is "integrate once, trust forever," reducing customer-facing breakage to near-zero is worth any amount of internal plumbing. Same logic on idempotency: they accept the cost of a durable, locked, body-fingerprinted key store on the hot path of *every* mutating request to guarantee no double-charge ever.

### Lessons

- **Make the unsafe operation safe to retry, don't tell clients "don't retry."** Networks are ambiguous by nature; the idempotency-key + server-side replay pattern turns a dangerous `POST` into something a client can retry without thinking — which is the only retry policy clients actually follow.
- **Pay the versioning cost at the edge, once, so consumers never pay it.** One internal model plus per-version transformers beats URL version sprawl when your value proposition is long-lived integrations — but it's a real, permanent operational tax, so only spend it where backward-compat is the product.
- **A typed error/version/cursor contract is a promise to machines, not humans.** Clients branch on `type`, pin a `Stripe-Version`, and pass opaque cursors back verbatim — every one of those is a stable surface you can evolve behind without breaking the consumer.

## 11. Test yourself

1. A `POST /charges` times out. Is it safe to retry blindly? What mechanism makes it safe? *(Hint: ambiguous outcome; idempotency key + server-side replay.)*
2. Why does `LIMIT 20 OFFSET 1000000` get slow, and what fixes it? *(Hint: DB scans+discards a million rows; keyset on an indexed sort key.)*
3. You must rename a JSON field consumed by three frontends. What's the safe sequence? *(Hint: add new alongside old → migrate all consumers → remove old later; never rename in place.)*
4. When does GraphQL beat REST, and what does it cost you? *(Hint: many clients with divergent field needs / aggregation; cost = HTTP caching, resolver N+1.)*
5. Webhooks are delivered at-least-once. What two properties must your receiver have? *(Hint: idempotent dedupe by event id; signature verification.)*
6. Which status code for: bad input, not logged in, logged in but not allowed, too many requests, async accepted-but-not-done? *(Hint: 422, 401, 403, 429, 202.)*
7. In a Protobuf schema, why must you never reuse a field's tag number, and how do you safely remove a field? *(Hint: tag is the wire identity; `reserve` the tag.)*
8. Why is synchronous service-to-service coupling dangerous, and what reduces it? *(Hint: B's downtime/latency becomes A's; async queues/events decouple availability.)*

---

## 12. Further reading

- **Stripe API docs** — idempotency keys, date-based versioning, cursor pagination, error objects. The canonical real-world reference.
- **Roy Fielding's dissertation, Ch. 5** — the original definition of REST and its constraints (read it once to see how much "REST" in the wild isn't).
- **RFC 9457** — Problem Details for HTTP APIs (`application/problem+json`).
- **gRPC docs + Protocol Buffers language guide** — service definitions, streaming, schema evolution rules.
- **DDIA (Kleppmann), Ch. 4 — Encoding and Evolution** — backward/forward compatibility, Protobuf/Avro/Thrift, the definitive treatment of schema evolution.
- **GitHub & Slack API docs** — production cursor pagination and rate-limit header conventions.
- **Pact docs** — consumer-driven contract testing.

**Next:** [`04-...`](./04-data-storage-and-databases.md) — how the resources you just modeled are actually stored, indexed, and queried.
