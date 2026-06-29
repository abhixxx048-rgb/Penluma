---
title: "Dockerizing a Multi-Service App Without Breaking Prod"
metaTitle: "Docker Multi-Service App: A Real Runbook"
description: "Learn how to containerize a real multi-service web app with Docker Compose — the database bug, build-time env traps, queues, and tenant routing that bite teams."
keywords:
  - docker compose multi-service
  - containerize laravel app
  - dockerize nuxt ssr app
  - docker compose postgres redis
  - build-time vs runtime env vars
  - docker healthcheck compose
  - reverse proxy multi-tenant docker
  - queue worker docker compose
  - migrate from sail to docker
  - docker environment variable matrix
  - frankenphp octane docker
  - nitro redis isr cache
topic: engineering-ops
topicTitle: Engineering & Ops
category: Business & Growth
date: '2026-06-16'
order: 999
icon: "\U0001F6E0️"
author: Pritesh Yadav
transformed: true
faq:
  - q: "Why does my app connect to the wrong database in Docker?"
    a: "Almost always because a stale environment variable from a starter template (like Laravel Sail) is still pointing at the wrong host or port — for example MySQL on 3306 when you actually run PostgreSQL on 5432. Compose env values silently override your app's own defaults, so audit them first."
  - q: "What is the difference between build-time and runtime environment variables in Docker?"
    a: "Build-time variables (ARG/ENV used during a build) get baked permanently into the image — changing them means rebuilding. Runtime variables are read when the container starts, so you can swap them per environment. Frontend frameworks often bake API URLs and keys at build time, which surprises people."
  - q: "Why do my background jobs stop running after moving to containers?"
    a: "If your queue connection was set to 'sync', jobs ran inline inside the web request. In containers you usually switch to a Redis-backed queue, which means jobs only run when a separate worker container is actually consuming them. No worker, no jobs."
  - q: "Why does server-side rendering break while the browser works fine?"
    a: "Server-side rendering runs inside the container, so 'localhost' points at the container itself, not your API. SSR needs an internal service name like http://api:8000, while the browser needs the public URL. Getting only one right gives you a blank page on load but a working app after."
  - q: "How do I route multiple tenant subdomains to one container?"
    a: "Use a reverse proxy (Traefik or nginx) with a wildcard host rule, and make sure it forwards the real Host header. Multi-tenant apps resolve the tenant from that header, so if the proxy rewrites it to 'localhost' tenancy silently breaks."
  - q: "Should I add a health check route before containerizing?"
    a: "Yes. Orchestrators and deploy scripts probe a health endpoint to decide if a container is ready. If that route does not exist, every probe returns 404 and your service is treated as unhealthy even when it works."
sources: []
---

A single wrong line in a config file can keep a database client knocking on a door that does not exist — speaking PostgreSQL to a MySQL port, forever. The app looks fine. The build passes. And then nothing connects.

That is the kind of bug that hides inside a half-finished Docker setup. Containerizing one service is easy. Containerizing a whole stack — a PHP API, two frontend apps, background workers, a PDF engine, a database, a cache, and object storage — is where the quiet traps live.

This is a field guide to those traps, drawn from a real migration of a multi-service platform from bare-metal servers to Docker. You do not need to know that specific app. The patterns repeat in almost every system that grew past one container.

## Why this matters

Most teams reach Docker the same way: someone copies a starter template, bolts on a couple of services, and it "mostly works" on their laptop. Then it ships, and the gaps surface in production where they are expensive.

The cost is rarely a dramatic crash. It is **silent wrongness** — jobs that never run, a frontend that renders blank on first load, a database client pointed at the wrong engine, secrets baked into an image you cannot rotate without rebuilding.

Getting the containerization right buys you three things that matter:

- **Reproducibility** — the stack runs the same on every laptop and every server.
- **Safe scaling** — you can run two copies of a service without them fighting over cache or jobs.
- **Honest failure** — health checks and clear boundaries mean a broken service announces itself instead of hiding.

If you are about to put a real multi-service app in containers, the rest of this article is the checklist you wish you had read first.

## The one bug that blocks everything

Start with the database, because a wrong database connection makes every other fix pointless.

In the real migration this guide is based on, the committed Compose file came from a starter template and still wired every database client to **MySQL on port 3306**, pointing at a database name that no longer existed. The actual platform ran on **PostgreSQL 16**.

Here is the part that catches people: the application's own code defaulted to PostgreSQL correctly. The Compose environment variables **overrode those defaults with the wrong values**. The app was right; the container config was wrong; and Compose wins.

The lesson generalizes far beyond one project:

> Environment variables in your orchestration layer silently override your application's sensible defaults. When something connects to the wrong place, audit the env first — not the code.

There was a second, sneakier version of the same bug. A secondary "admin" database connection defaulted its port to `3306` deep inside a config file, even though everything else used PostgreSQL. Nothing pointed at it until that connection was used — then it failed on a port nobody set on purpose. **Latent defaults are landmines.** Set the value explicitly even when you think the default is fine.

### Before anything else works, you need a health route

The deploy tooling probed `GET /api/health` to decide whether a container was ready. That route did not exist, so every probe returned a 404 and the orchestrator treated a perfectly healthy service as broken.

A health check is not optional plumbing — it is how the rest of your system learns that a container is alive. Add a real endpoint that returns 200 **before** you wire up any `healthcheck` block.

## Build-time versus runtime: the trap nobody warns you about

This is the single most confusing thing about containerizing modern frontend apps, so it gets its own section.

Some configuration is **baked into the image when you build it**. Some is **read fresh when the container starts**. Mixing them up causes bugs that feel impossible.

Think of it like a printed book versus a whiteboard. A build-time value is **printed** — to change it you reprint the whole book (rebuild the image). A runtime value is the **whiteboard** — you wipe and rewrite it each time you start, no reprint needed.

In the real stack:

- The static design tool baked its API URL at build time. Point it at the wrong API and **rebuilding is the only fix** — no env swap will help.
- One frontend app baked its public URL, a maps key, and a content-security-policy domain at build time, but read its API addresses at runtime. Half print, half whiteboard, in the same app.

The practical rule:

1. Anything a **browser** needs (public URLs, public keys, CSP domains) is often baked at build time by frontend frameworks. Pass it as a build argument and accept that changing it means a rebuild.
2. Anything the **server** needs to reach internally (database hosts, internal service URLs, secrets) should be runtime env, so you can vary it per environment.
3. When in doubt, check whether the framework reads the value during `build` or during `start`. That single fact tells you everything.

### Server-side rendering breaks "localhost"

Here is the classic symptom: the app works in the browser but renders a **blank page on first load**, or the reverse.

Server-side rendering (SSR) runs **inside the container**. So when SSR code asks for `localhost`, it gets the container itself — not your API. The browser, running on a real person's machine, means something completely different by `localhost`.

That is why these apps need **two API addresses**:

- **SSR (internal):** an in-network service name like `http://api:8000`.
- **Browser (public):** the real public URL of your API.

Get only one right and you get "works after load, blank on load" — a bug that wastes an afternoon if you do not know to look for it.

## When you containerize, queues stop being free

On a single server, many apps run background jobs **inline** — the "sync" queue. The job just runs as part of the web request. Convenient, and invisible.

Move to containers and you almost always switch to a **Redis-backed queue** so work can spread across machines. The moment you flip that switch, a hard truth appears:

> Jobs only run if a separate worker container is actually consuming the queue. No worker, no jobs — and no error either. They just pile up.

So containerizing a queue is really two changes, not one:

1. Point the queue connection at Redis.
2. Run dedicated **worker** and **scheduler** containers — usually the same image as your API, just started with a different command.

A common, frustrating outcome is "everything deploys, nothing processes." It is almost always a missing worker.

## Don't run six containers when you can run one image six ways

A neat pattern from this migration: most services did **not** need their own Dockerfile.

- The API, the queue worker, and the scheduler were the **same image** started with different commands.
- The PDF service and its background worker were **one image** toggled by a single `WORKER_ENABLED` flag.

One image, many roles, chosen by command or environment variable. This keeps builds fast, guarantees the worker and the web process run identical code, and shrinks the surface you have to maintain.

You only need a separate Dockerfile when the **runtime is genuinely different** — a PHP service and a Node service obviously cannot share a base image, but a web server and its own worker almost always can.

## Secrets that must match exactly

When services talk to each other privately, they often share a secret to prove they are who they claim. If two services hold **different** values for that shared secret, the symptom is a flat, silent `401` — no crash, no useful log, just rejection.

In the real stack, several values had to be **byte-for-byte identical** across services:

- The application key, shared between the API and the PDF service.
- An internal API secret, named one thing on one side and another thing on the other side — same value, different variable name.

That naming mismatch is a trap of its own. The two services called the same secret by different names, so it was easy to set one and forget the other. When you see unexplained 401s between your own services, **check the shared secrets before anything else.**

And never bake secrets into image layers. Image layers are cached, shared, and surprisingly easy to inspect. Mount secrets at runtime, keep them out of the build, and rotate anything that ever lived in a committed `.env` file.

## Caching and multi-tenant routing

Two more traps show up the moment you run more than one copy of a service.

**Shared cache, or no cache.** One frontend cached rendered pages in memory by default. Run two replicas and they each keep a private cache — so users get inconsistent results depending on which replica they hit, and every restart starts cold. The fix is pointing the cache at a **shared Redis** so all replicas read and write the same store. If your app caches anything, ask where that cache lives when there are two of you.

**Preserve the real Host header.** This was a multi-tenant app: it figured out *which customer's store* a request belonged to by reading the incoming hostname. A reverse proxy that rewrites the `Host` header to `localhost` quietly destroys that — every request looks like the same tenant, or none. The rule for any host-based routing:

> Your proxy must forward the **real** `Host` header through to the app. If tenancy depends on the hostname, a rewritten Host silently breaks it.

## Common misconceptions

**"If it builds, it's configured correctly."** A clean build only proves the image assembled. It says nothing about whether your env vars point at the right database, whether a worker is running, or whether a health route exists. Most container bugs pass the build.

**"Environment variables are environment variables."** Build-time and runtime variables behave completely differently. One is printed into the image; the other is read at start. Treating them as the same thing causes the hardest-to-trace bugs in this whole topic.

**"Docker Compose from the starter template is a good baseline."** Starter Compose files (like Laravel Sail) are tuned for a generic dev experience, not your stack. They often carry the wrong database, dev-only flags like file watchers, and assumptions you will silently inherit. Read every line before you trust one.

**"localhost means the same thing everywhere."** Inside a container, `localhost` is the container. Across the Docker network, services find each other by **service name**, not by `localhost`. This single misunderstanding explains a huge share of "works on my machine" failures.

## How to use this: a de-risked rollout

You do not have to containerize everything at once. Here is the order that keeps risk low, generalized from the real migration:

1. **Stand up the data tier first.** Database, cache, and (for local dev) an object-storage stand-in like MinIO. Wait until their health checks go green before anything depends on them.
2. **Add the core API next.** Make sure it has a real health route and points at the correct database host, port, and engine. Run migrations and warm any caches at **deploy time**, not during the image build — those steps need live database access.
3. **Bring up workers and the scheduler.** Only now that the queue points at Redis. Confirm a job actually moves from "queued" to "done."
4. **Add the frontend apps.** Mind the build-time-versus-runtime split, give SSR an internal API address and the browser a public one, and point shared caches at Redis.
5. **Put a reverse proxy in front.** Preserve the real `Host` header, especially if routing is host- or tenant-based.
6. **Add the optional, low-risk services last** — anything gated behind a feature flag that is off by default can wait, because nothing depends on it yet.

Two habits that pay for themselves across all six steps:

- **Give every service a health check** so the system can tell ready from broken.
- **Keep your old deploy path working** until the container path is proven in production. A fallback you can switch back to turns a scary cutover into a calm one.

## Conclusion

If you remember one thing, make it this: **a clean build is not a working system.** The bugs that hurt — wrong database, jobs that never run, blank SSR pages, mismatched secrets, a rewritten Host header — all sail straight through a successful `docker build`. They only show up when something actually tries to connect, render, or process.

So containerize the way a careful engineer connects a new house to the grid: one tier at a time, every line checked, a health signal on every service, and the old supply still live until the new one proves itself.

The next rabbit hole worth falling into is **secrets management**. Once your stack runs in containers, "where do the secrets live, and how do we rotate the ones that leaked?" stops being a footnote and becomes the next thing standing between you and a good night's sleep.
