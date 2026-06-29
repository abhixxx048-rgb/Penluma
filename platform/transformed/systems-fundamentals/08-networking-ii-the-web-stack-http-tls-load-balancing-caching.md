---
title: 'How the Web Really Works: HTTP, TLS, Load Balancing & Caching'
metaTitle: 'How the Web Works: HTTP, TLS, Caching'
description: >-
  A clear, practical tour of the web stack: how HTTP requests work, why HTTPS is
  safe, what load balancers and CDNs do, and how caching makes sites fast.
topic: systems-fundamentals
topicTitle: Systems Fundamentals
category: Engineering
date: '2026-06-21'
order: 7
icon: ⚙️
keywords:
  - how HTTP works
  - HTTP status codes explained
  - HTTP/2 vs HTTP/3
  - what is TLS handshake
  - load balancer L4 vs L7
  - HTTP caching headers
  - idempotency in REST APIs
  - what is a CDN
  - exponential backoff jitter
  - 401 vs 403 status code
  - cookies sessions and tokens
  - rate limiting token bucket
faq:
  - q: What is the difference between HTTP and HTTPS?
    a: HTTPS is plain HTTP carried inside a TLS-encrypted channel. TLS adds privacy, tamper-detection, and proof that you are talking to the real server, while the HTTP request and response themselves stay the same.
  - q: What is the difference between a 401 and a 403 status code?
    a: A 401 means "we don't know who you are" (you are not logged in). A 403 means "we know who you are, but you are not allowed to do this." 401 is about identity, 403 is about permission.
  - q: Is HTTP/3 faster than HTTP/2?
    a: Often, yes. HTTP/2 fixed application-layer head-of-line blocking with multiplexing, but it still rides on TCP, so one lost packet stalls every stream. HTTP/3 runs over QUIC (UDP) so a lost packet only stalls its own stream, and it also handles network switches more gracefully.
  - q: When is it safe to retry a failed web request?
    a: Only retry idempotent requests such as GET, PUT, and DELETE, and only on transient errors like timeouts or 502/503/504. Retrying a POST can run it twice, so use an Idempotency-Key header if you must retry it.
  - q: What is the difference between latency and bandwidth?
    a: Latency is how long one trip takes (delay). Bandwidth is the maximum capacity of the connection. Buying more bandwidth never shortens a single trip, just like adding highway lanes never makes your own drive faster.
  - q: What does a load balancer do?
    a: A load balancer spreads incoming traffic across many backend servers. This adds capacity (more servers handle more requests) and high availability (it routes around servers that have failed).
author: Pritesh Yadav (priteshyadav444)
transformed: true
polished: true
sources: []
---

You type an address, hit Enter, and a page appears in a fraction of a second. Behind that instant is a conversation between machines that might cross an ocean, pass through a dozen middlemen, get encrypted and decrypted, and dodge a lost packet or two along the way.

Most of it is invisible, and most of the time you never need to think about it. But the day a page loads slowly, a login mysteriously breaks, or your app charges a customer twice, the only people who can fix it are the ones who understand how this layer actually works.

This is that layer: the **application layer** of the web. The roads underneath (IP addresses, TCP, DNS) move the packets. Up here is the part you touch every day.

## Why this matters

If you build, run, or debug anything that talks over the internet, this is the floor you stand on. Get it right and your service is fast, private, and survives a traffic spike. Get it wrong and you ship double charges, leak private data into a public cache, or watch a recovering server get knocked over again by your own retry storm.

The good news: the core ideas are surprisingly few, and they fit together. Here is a mental model that holds the whole thing together.

> **The restaurant analogy.** Picture the web stack as a busy restaurant. The **CDN/edge** is a food truck on your street with popular dishes already made, so you skip the trip downtown. The **reverse proxy** is the host at the door who checks your ID and points you the right way. The **load balancer** seats you at whichever kitchen line is shortest. The **kitchens** are the backend servers. And **statelessness** means the kitchen forgets who you are between courses unless you hand back your table number (a cookie).

Hold that picture. Everything below is one piece of it.

## How a request and response actually work

**HTTP** (HyperText Transfer Protocol) is a text-based, **request/response** protocol. A **client** (a browser, a phone app, or a tool like `curl`) sends a request, and a **server** sends back a response.

One detail shapes everything: HTTP is **client-driven**. The server never speaks first. Nothing happens until the client asks. That single limitation is exactly why WebSockets and Server-Sent Events were later invented, so servers could finally push data to you.

A request has four parts:

1. A **request line** (the method, path, and version).
2. **Headers** (key-value metadata about the request).
3. A **blank line**.
4. An optional **body** (form data, JSON, an uploaded file).

The response mirrors it: a status line, headers, a blank line, and a body.

```
REQUEST                          RESPONSE
GET /products/5 HTTP/1.1         HTTP/1.1 200 OK
Host: shop.com                   Content-Type: application/json
Accept: application/json         Content-Length: 48
<blank line>                     <blank line>
                                 { "id": 5, "name": "Mug" }
```

**Methods** (also called verbs) tell the server your intent:

- `GET` — read or fetch a resource (no body).
- `POST` — create something or submit data.
- `PUT` — replace a whole resource with what you send.
- `PATCH` — partially update a resource.
- `DELETE` — remove a resource.
- `HEAD` — like GET, but headers only, no body (great for "did this change?").
- `OPTIONS` — ask what the server allows (used in CORS preflight checks).

### Status codes, grouped by their first digit

Every response starts with a three-digit code, and the first digit tells you the family:

- **1xx informational** — e.g. `103 Early Hints`.
- **2xx success** — `200 OK`, `201 Created`, `204 No Content`.
- **3xx redirection** — `301` (moved permanently), `302/307` (temporary), `304 Not Modified` (used by caches, more on that later).
- **4xx client error** — *you* made a mistake: `400`, `401`, `403`, `404`, `409`, `422`, `429`.
- **5xx server error** — the *server* failed: `500`, `502`, `503`, `504`.

Two pairs trip people up constantly, so memorize them:

- **`401 Unauthorized`** = "we don't know *who* you are" (not logged in). **`403 Forbidden`** = "we know who you are, but you're *not allowed* to do this."
- **`502 Bad Gateway`** = a proxy got a *broken* answer from the server behind it. **`504 Gateway Timeout`** = the proxy waited and got *no* answer in time.

## Why servers forget you (and why that's a feature)

HTTP is **stateless**. The server keeps no memory of your previous requests. Each request must carry everything needed to handle it.

That sounds like a handicap, but it is the secret to **horizontal scaling**, running many identical servers side by side. Because no single server "remembers" you, *any* server can handle *any* request. Need more capacity? Add more servers. No coordination required.

But real apps do need to remember "I'm logged in." The trick is to make the **client** carry an identifier on every request. The most common way is a **cookie**: the server sends `Set-Cookie: session=abc123`, the browser stores it, and it automatically attaches `Cookie: session=abc123` to every later request to that site.

There are three common flavors of "remember me," each with a trade-off:

| Approach | What it is | Trade-off |
|---|---|---|
| **Cookie** | A small value the browser stores and auto-sends | Easy, but you must protect it |
| **Session** | Server-side data (in Redis/DB) keyed by the cookie's id | Needs shared storage across servers |
| **Token (JWT)** | A signed token that *carries* the user's claims itself | No server lookup, but hard to revoke early |

Whichever you use, three cookie flags are non-negotiable for security:

- **`HttpOnly`** — JavaScript can't read it, which blocks theft via XSS attacks (XSS = injecting malicious scripts into a page).
- **`Secure`** — only sent over HTTPS.
- **`SameSite`** — limits cross-site sending, which blocks CSRF attacks (CSRF = tricking your browser into sending a request you didn't mean to).

Skip these flags and a session cookie can be stolen by a script or ridden by a forged request. They are five minutes of work that prevent a very bad day.

## The web got faster: HTTP/1.1 vs 2 vs 3

The first enemy of a fast web is **head-of-line (HOL) blocking**: one slow item stuck at the front of a line holds up everything behind it, like one slow shopper jamming the only open checkout lane.

Each version of HTTP chipped away at it.

**HTTP/1.1 (1997)** is text-based, and one connection handles one request at a time. `Connection: keep-alive` lets a connection be reused for several *sequential* requests, but they still go one after another. To fake parallelism, browsers cheated by opening about **six connections per host**.

**HTTP/2 (2015)** keeps the same meaning but changes the wire format. Its wins:

- **Binary framing** — machine-friendly, not text.
- **Multiplexing** — many requests (called *streams*) interleaved over *one* TCP connection, killing the six-connection hack.
- **HPACK** header compression — strips out repeated header bytes.

(Server Push existed here but is now deprecated; Chrome removed it in 2022. Use `103 Early Hints` instead.)

**HTTP/3 (2022)** runs over **QUIC**, a new transport built on **UDP** instead of TCP. QUIC handles reliability and ordering *per stream*, so one lost packet only stalls its own stream. It also folds the TLS handshake into setup (faster connections) and supports **connection migration** — a phone switching from Wi-Fi to cellular keeps the same connection via a Connection ID instead of its IP address.

```
HTTP/1.1:  [Req A]--wait--[Req B]--wait--[Req C]   one at a time

HTTP/2:    one TCP pipe:  A1 B1 A2 C1 B2 ...   interleaved
           BUT a dropped packet stalls the WHOLE pipe (TCP)

HTTP/3:    lane A | lane B | lane C   independent
           a drop in lane B stalls ONLY lane B
```

Here is the subtlety worth knowing: HTTP/2 did not fix *all* head-of-line blocking. It fixed the **application-layer** kind. Because it still rides on TCP, one lost packet stalls every stream, which is **transport-layer** blocking. Only HTTP/3 over QUIC truly solves it.

## REST APIs and the idempotency rule that prevents double charges

**REST** is a style for designing web APIs. The rules are short: name **resources** with URLs (`/users/42`), act on them with HTTP **methods**, transfer **representations** (usually JSON), and stay **stateless**. Use nouns in paths and verbs as methods. Write `GET /users/42`, never `GET /getUser?id=42`.

Two properties drive safe API design:

- **Safe** = read-only, changes nothing on the server: `GET`, `HEAD`, `OPTIONS`.
- **Idempotent** = doing it many times has the same effect as doing it once: `GET`, `HEAD`, `OPTIONS`, `PUT`, `DELETE`. **Not** idempotent: `POST`, `PATCH`.

Why does this matter? Because networks fail. When a request times out, you genuinely don't know whether it succeeded. You can safely *retry* an idempotent call. Retrying a `POST` might run it twice.

> **A real example.** You `POST /charge` a credit card. The response times out. Your code retries, and the customer is charged *twice*. The fix is an `Idempotency-Key: 7f3a...` header, a unique id for that operation. The server remembers the key and ignores the duplicate. This is the pattern Stripe popularized, and it has saved countless engineers from angry customers.

One more trap: never design a `GET` with side effects, like `GET /delete?id=5`. GET must be safe, because search crawlers and browser prefetchers will happily call it and quietly delete your data. Use the correct verb.

## TLS and HTTPS: keeping it private and trustworthy

**HTTPS** is just HTTP carried inside a **TLS**-encrypted channel. TLS (Transport Layer Security) gives you three guarantees:

- **Confidentiality** — eavesdroppers see only scrambled ciphertext.
- **Integrity** — if anyone tampers with the data, it's detected.
- **Authentication** — you're really talking to the right server, proven by its certificate.

That last one leans on an **X.509 certificate**, a document that binds a domain name to a public key, signed by a **Certificate Authority (CA)** your browser already trusts. This forms a **chain of trust** up to a root CA stored in your operating system. (Let's Encrypt made these certificates free and automatic, which is a big reason the whole web moved to HTTPS.)

```
TLS 1.3 handshake (1 round trip):

Client --ClientHello: ciphers + key share-->         Server
Client <--ServerHello: cert + key share, encrypt now-- Server
        both derive the SAME session key (ECDHE),
        then application data flows. Done in 1 RTT.
```

The key idea is a clever hand-off. Slow **asymmetric** crypto (public/private keys) is used only to *agree on a shared secret key*. Then fast **symmetric** crypto (AES-GCM, ChaCha20) encrypts the actual bulk data.

TLS 1.3 finishes this handshake in **one round trip** (TLS 1.2 needed two). It also requires **forward secrecy** via ephemeral keys: even if someone later steals the server's long-term key, they *cannot* decrypt traffic they captured in the past. There is also **0-RTT resumption** for returning clients, which is even faster but replay-vulnerable, so only use it for idempotent requests.

One myth to drop: HTTPS does *not* make a request safe to retry. TLS is about encryption and authentication. Retry safety is idempotency, a completely separate property.

## Latency, throughput, and bandwidth are not the same thing

These three get blurred together constantly, and the confusion leads to expensive wrong fixes.

- **Latency** — time for *one* trip (delay), measured in milliseconds.
- **Throughput** — actual work done per second (e.g. requests/sec achieved).
- **Bandwidth** — the *maximum capacity* of the pipe (bits/sec).

> **The highway analogy.** A highway's number of lanes is bandwidth. How long your single car takes end-to-end is latency. Cars arriving per minute is throughput. Adding lanes never makes *your* drive shorter. Likewise, a cargo ship full of hard drives has *huge* bandwidth but terrible latency (it takes days to arrive); a tiny ping packet has almost no bandwidth but arrives in milliseconds.

Latency has a hard physical floor. Light travels about 1ms per 100km over fiber, so a cross-continent round trip is naturally around 150ms, and no amount of money changes physics. Every engineer should have a rough feel for these numbers:

| Operation | Rough time |
|---|---|
| Main memory read | ~100 nanoseconds |
| SSD random read | ~16–20 microseconds |
| Same-datacenter round trip | ~0.5 ms |
| Cross-continent round trip | ~150 ms |

Sit with that for a second: **a remote network call is roughly a million times slower than reading from memory.** So the winning strategy is always the same: minimize round trips, batch requests together, cache aggressively, and move data physically closer to users.

The classic mistake is trying to fix a slow, round-trip-heavy app by buying more bandwidth. A fatter pipe doesn't shorten the trip.

## Caching everywhere

**Caching** means storing a copy of a result closer to whoever needs it, so you avoid redoing the work. It happens at every single layer of the stack:

```
User
  -> [Browser cache]        governed by Cache-Control: max-age
  -> [CDN edge PoP]         governed by Cache-Control: s-maxage
  -> [Reverse proxy/Varnish]
  -> [App + Redis cache]
  -> [DB buffer pool]
```

HTTP gives you headers to steer it:

- `Cache-Control: max-age=N` — fresh for N seconds.
- `s-maxage` — overrides max-age, but only for *shared* caches like a CDN.
- `no-cache` — may store, but must revalidate before using.
- `no-store` — never store at all (for private/sensitive data).
- `private` — browser only, never a shared cache. `public` — anyone may cache.

When a cached copy might be stale, the cache **revalidates** using a **validator**. An **ETag** is a fingerprint of the content. The cache asks `If-None-Match: "v7"`; if nothing changed, the server replies `304 Not Modified` with *no body*, saving the bandwidth of resending it. The `stale-while-revalidate` directive serves the old copy instantly while quietly refreshing in the background, hiding the delay entirely.

A practical caching playbook:

- **Static files (JS/CSS):** fingerprint the filename (`app.a1b2c3.js`) and cache forever with `max-age=31536000, immutable`. A new deploy is simply a new URL, so there is nothing stale to fight.
- **HTML/API responses:** short `max-age` plus ETag revalidation.
- **Private, logged-in responses:** never cache them in a shared CDN.

There are two opposite ways to get caching wrong, and both are common. One is slapping `no-store` everywhere out of fear, which destroys performance. The other is caching a logged-in user's private response in a shared CDN, which leaks one user's data to everyone. Cache invalidation is famously hard, and stale cache is the number-one cause of "I deployed but users still see the old version." Plan your TTLs, ETags, and purge strategy up front.

## Load balancers: scale and survival

A **load balancer (LB)** spreads incoming traffic across many backend servers. That buys you two things: *scale* (more servers, more capacity) and *high availability* (route around a dead server).

The first big decision is **L4 vs L7** (those are OSI layer numbers):

| | L4 (transport) | L7 (application) |
|---|---|---|
| Routes by | IP + port only | URL path, host, header, cookie |
| Reads payload? | No (payload-blind) | Yes (content-aware) |
| Speed | Very fast, low CPU | Smarter, more CPU |
| Can it terminate TLS? | No | Yes |
| Example | AWS NLB | AWS ALB, Nginx, Envoy |

Then there is the **balancing algorithm**:

- **Round Robin** — cycle through servers evenly. Fine when requests are uniform.
- **Weighted** — bigger servers get more traffic.
- **Least Connections** — send to the server with the fewest active requests. Best when request durations vary.
- **IP Hash / Consistent Hashing** — the same client always lands on the same server, with minimal reshuffling when servers come and go. Vital for sharded caches.

**Health checks** keep traffic away from broken servers. *Active* checks probe on a schedule ("does `GET /health` return 200?"). *Passive* checks watch real traffic for errors. Use both.

**Sticky sessions** pin a client to one server so its session state stays reachable, but they unbalance load and break when that server dies. The common mistake is using round robin when request costs are wildly uneven (some take 50ms, some take 5s), letting slow requests pile up unfairly; reach for least connections instead. And don't lean on sticky sessions as your scaling plan. Prefer stateless servers plus shared session storage (Redis) or tokens, so any server can serve any request.

## Reverse proxies, CDNs, and the edge

A **forward proxy** sits in front of *clients* (think of a company's outbound gateway). A **reverse proxy** sits in front of *servers* (Nginx, HAProxy, Envoy).

The reverse proxy is your single front door. It terminates TLS, caches, compresses, routes requests, load-balances, and filters attacks. Clients never touch your app servers directly.

A **CDN** (Content Delivery Network, like Cloudflare, Fastly, or CloudFront) is a globally distributed network of reverse-proxy caches. Users connect to the nearest **edge PoP** ("point of presence," a server cluster near them). A cache **hit** is served straight from the edge; a **miss** is fetched from your **origin** (your main server), cached, then served.

The payoff is lower latency (content is physically near users), far less load on your origin, DDoS absorption, and TLS handled at the edge. "**Edge computing**" goes one step further, pushing actual *code* (edge functions) out to those PoPs so even dynamic logic runs close to users.

## Rate limiting, timeouts, retries, and backoff

**Rate limiting** caps how many requests a client may make in a time window. It protects you from abuse, buggy clients, and overload. Over-limit requests should return `429 Too Many Requests` with a `Retry-After` header telling the client exactly when to come back.

```
TOKEN BUCKET (allows bursts):
  +1 token / 100ms refills the bucket
  10 saved tokens -> a burst of 10 passes instantly,
  then throttles to the refill rate.

LEAKY BUCKET (smooths bursts):
  pour in fast -> drips out exactly 1 / 100ms,
  a steady constant stream no matter the input.
```

Other algorithms include *Fixed Window* (count per clock window; simple, but allows a 2x burst at the boundary) and *Sliding Window* (which smooths that boundary problem). Token bucket allows controlled bursts and is the most common choice for APIs.

**Timeouts** are mandatory. Never wait forever; every network call needs a deadline. Without one, a single hung dependency can consume all your threads and connections and take the whole system down.

**Retries** must be careful. Only retry *idempotent* requests (or those with an Idempotency-Key), and only on *transient* errors (timeouts, `502/503/504`, `429`-with-Retry-After). Never retry permanent client errors like `400/401/404`. Use **exponential backoff** (wait 1s, 2s, 4s, 8s...) plus **jitter** (randomize the delay).

```
THUNDERING HERD (no jitter):
  1000 clients fail at t=0, ALL retry at t=1,2,4...
  -> each wave re-crashes the recovering server

WITH JITTER:
  each client picks a random delay in [0, backoff]
  -> retries spread out, the server recovers
```

That jitter is not optional polish. Retrying at a fixed interval makes thousands of clients retry in perfect lockstep, a **thundering herd** that re-crashes the very service it's waiting on. Add a retry cap and a **circuit breaker** too: after N failures, stop calling for a cooling-off period and give the service room to breathe.

## Common misconceptions

- **"HTTPS means a request is safe to retry."** No. HTTPS gives you encryption and authentication. Retry safety is idempotency, an unrelated, method-level property.
- **"HTTP/2 killed head-of-line blocking."** Only the application-layer kind. It still rides on TCP, so a single lost packet stalls every stream. HTTP/3 over QUIC is what fixes the rest.
- **"A slow app needs more bandwidth."** Usually not. If the app is round-trip-heavy, a fatter pipe changes nothing. Fewer round trips, caching, and proximity are the fix.
- **"401 and 403 are basically the same."** 401 is about *identity* (you're not logged in). 403 is about *permission* (you're logged in but not allowed).
- **"Sticky sessions are a scaling strategy."** They're a crutch. They unbalance load and lose state when a server dies. Stateless servers plus shared storage scale far better.

## How to use this

1. **Pick the right verb and status code.** Nouns in URLs, verbs as methods, and a status code that tells the truth (`429` for rate limits, `401` vs `403` correctly).
2. **Make writes safe to retry.** Add an `Idempotency-Key` to any `POST` that moves money or creates records, so a timeout-and-retry can't run it twice.
3. **Lock down your cookies.** Set `HttpOnly`, `Secure`, and `SameSite` on every session cookie. It's free and it stops whole classes of attacks.
4. **Cache deliberately, not fearfully.** Fingerprint static assets and cache them forever; use short `max-age` plus ETags for dynamic content; never cache private responses in a shared CDN.
5. **Minimize round trips before you upgrade hardware.** Batch requests, move data closer with a CDN, and measure latency before assuming bandwidth is the problem.
6. **Choose the load-balancing algorithm to match your traffic.** Round robin for uniform requests, least connections when durations vary, consistent hashing when caches are sharded.
7. **Make every network call defensive.** A timeout on everything, retries only on idempotent and transient failures, exponential backoff plus jitter, and a circuit breaker behind it all.

## Conclusion

If you remember one thing, remember this: **statelessness is the quiet hero of the whole web stack.** Because servers refuse to remember you, you can run a thousand identical ones, route around the dead ones, and serve millions of people at once. Almost every other technique here, from tokens to load balancing to caching at the edge, exists to make statelessness practical.

Which raises the next question. If servers forget everything, where does all the state actually live, and how do you keep a database consistent when a hundred servers are hammering it at once? That is the world of databases, replication, and consistency models, and it is where the web stack you just learned meets some genuinely hard trade-offs. That's the next floor down.
