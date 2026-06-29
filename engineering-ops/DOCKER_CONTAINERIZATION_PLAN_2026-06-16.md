# Docker Containerization Plan - Print-Flow-360

> **Status:** Strategy / design doc. Docker is greenfield here - nothing in this plan is built yet.
> **Audience:** Developers + ops.
> **Companion doc:** [`DOCKER_RUNBOOK_2026-06-16.md`](./DOCKER_RUNBOOK_2026-06-16.md) - the hands-on build/run/operate guide. This doc is the *why* and the *target*; the runbook is the *how*.
> **Date:** 2026-06-16

---

## 1. Why containerize - current pain & goals

Print-Flow-360 is five apps in one repo (Laravel API, admin Nuxt, storefront Nuxt, designer SPA, pdf-service) plus Postgres, Redis, and S3. Today there is **no usable container story**:

- The real production path is **bare-metal + PM2** (`deploy/deploy.sh`, PM2 process names `printflow-api/admin/store/queue/schedule`). There is no committed PM2 ecosystem file (`deploy/pm2/ecosystem.config.cjs` is referenced but missing) and no nginx config in `deploy/`.
- The one committed `docker-compose.yml` is the **stock Laravel Sail file** with a bolted-on pdf-service stack, and it is broken on its core assumption (MySQL vs PostgreSQL - see §2).
- Standing up a dev environment means manually running 4–5 processes, wiring env vars by hand, and remembering the SSR-vs-browser API split and the tenant-host quirks.

### Goals

| Goal | What "done" looks like |
|---|---|
| **One-command local environment** | `docker compose up` brings up Postgres, Redis, MinIO, the API, both Nuxt apps, and pdf-service, correctly wired. |
| **Reproducible, immutable images** | Each app builds to a self-contained image; no host bind-mounts of source in prod. |
| **Runtime-configurable images** | One image per app works across environments via injected `NUXT_*` / `DB_*` / `AWS_*` env - no rebuild to change an API URL. |
| **Correct datastore topology** | Single shared PostgreSQL 16, single Redis (logical-DB split), optional MinIO for local S3. |
| **Tenant-aware routing** | A reverse proxy handles wildcard tenant subdomains and preserves `Host` → `X-Tenant` resolution. |
| **Horizontal scalability** | Stateless web/SSR tiers scale by replica count; durable state lives only in Postgres / Redis / S3. |

---

## 2. Current state - audit of what exists

### 2.1 `docker-compose.yml` (the existing file)

It is **Laravel Sail's default `laravelnuxt.api` service** (builds from `./vendor/laravel/sail/runtimes/8.3`, image `sail-8.3/app`, bind-mounts the whole repo at `.:/var/www/html`, runs `php artisan octane:start --watch`) plus a hand-added **`pdf-service` / `pdf-worker` / `pdf-redis`** trio.

**What's WRONG or missing:**

| # | Problem | Detail | Fix |
|---|---|---|---|
| 1 | **MySQL wiring (headline bug)** | The pdf-service is wired to MySQL: `DB_HOST=${MYSQL_DB_HOST:-host.docker.internal}`, `DB_PORT=${MYSQL_DB_PORT:-3306}`, `DB_DATABASE=${MYSQL_DB_DATABASE:-printing_702}`. The platform is **PostgreSQL everywhere** (CLAUDE.md §6, `.env` `DB_CONNECTION=pgsql` on 5432). The `MYSQL_DB_*` vars don't even exist in `.env.example`. | Pass `DB_DIALECT=postgres`, `DB_HOST=postgres`, `DB_PORT=5432`, `DB_DATABASE=live_db`. |
| 2 | **No Postgres service** | `laravelnuxt.api` has `depends_on: {}` and the compose declares no database. Both Laravel and pdf-service expect an external Postgres at `host.docker.internal`. | Add a `postgres:16-alpine` service. |
| 3 | **No admin / storefront / designer containers** | The compose only covers API + pdf. The Nuxt admin (:3000), storefront (:3001), and designer SPA are absent. The API service even maps `${PORT:-3000}` as a leftover but builds nothing for Nuxt. | Add `admin`, `storefront` services; bake designer `dist` into web roots. |
| 4 | **Dev-mode-only API image** | Runs `octane:start --watch` against a bind-mount of source - a dev convenience, not a prod image. No `composer install --no-dev`, no `nuxt build`, no `config:cache`. | Build a real multi-stage PHP/Octane image. |
| 5 | **No `/api/health` route** | `deploy.sh` and any orchestrator probing `$API_URL/api/health` will **404** - that route does not exist. (Only `routes/store-api.php` has an unrelated SEO `health`.) pdf-service correctly has `/health`. | **Add a real `GET /api/health` route** before wiring a Laravel healthcheck. |
| 6 | **`admin_pgsql` port default** | `config/database.php` landlord connection `admin_pgsql` is `driver=pgsql` but `'port' => env('ADMIN_DB_PORT', '3306')` - defaults to the **MySQL** port. | Set `ADMIN_DB_PORT=5432` explicitly in every container env. |

### 2.2 `pdf-service/Dockerfile` (the one good file)

The **only correct, finished Dockerfile** in the repo:

- Multi-stage `node:20-alpine`; build deps `vips-dev build-base python3 pkgconfig` (for `sharp`/canvas); runtime libs `vips tini curl`; non-root `app` user; `tini` as PID 1; `HEALTHCHECK` on `/health`.
- Deps: `sharp`, `pdfkit`, `bullmq`, `ioredis`, `@aws-sdk/client-s3`, `sequelize` + `pg`.
- One image, two roles: **API** (`WORKER_ENABLED=false`, HTTP :4000) and **worker** (`WORKER_ENABLED=true`, BullMQ consumer, `WORKER_CONCURRENCY`). The compose already splits them - good pattern, keep it.

**Reuse as-is.** Note `pdf-service/package.json` still lists both `mysql2` and `pg`/`pg-hstore`; the live path is `pg` (harmless leftover).

---

## 3. Target architecture - service topology

All services on a single user-defined bridge network (rename the existing `sail` network to `printflow`). Durable state lives **only** in named volumes on Postgres / Redis / MinIO. The web/SSR tiers are stateless and scale by replica count.

| Service | Image / base | Build context | Build steps | Runtime cmd | Port(s) | Depends on | Persistent volume | Healthcheck |
|---|---|---|---|---|---|---|---|---|
| **postgres** | `postgres:16-alpine` | - | - | `postgres` | 5432 (internal) | - | `pgdata:/var/lib/postgresql/data` | `pg_isready -U <user>` |
| **redis** | `redis:7-alpine` (`appendonly yes`) | - | - | `redis-server` | 6379 (internal) | - | `redis-data:/data` | `redis-cli ping` |
| **minio** (dev only) | `minio/minio` | - | - | `server /data --console-address :9001` | 9000 / 9001 | - | `minio-data:/data` | `/minio/health/ready` |
| **api** (Laravel/Octane) | multi-stage: composer → php8.2 (`pdo_pgsql`, `gd`/`imagick`, `zip`, `pcntl`, `redis`, RoadRunner) | repo root | `composer install --no-dev --optimize-autoloader`; `key:generate` (once); `storage:link`; `migrate --force`; `config:cache route:cache view:cache event:cache`; copy designer `dist` → `public/designer` | `php artisan octane:start --host=0.0.0.0 --port=8000` | 8000 | postgres, redis, (minio) | `storage/`, `bootstrap/cache` | **add** `GET /api/health` then probe it |
| **queue-worker** | same image as **api** | - | - | `php artisan queue:work --tries=3 --timeout=90` | - | redis, postgres | - | process up |
| **scheduler** | same image as **api** | - | - | `php artisan schedule:work` | - | redis, postgres | - | - |
| **admin** (Nuxt 3) | multi-stage `node:22-bookworm-slim` → `.output` | repo root (`rootDir: nuxt/`) | `npm ci && npm run build` (`NODE_OPTIONS=--max-old-space-size=4096`) | `node nuxt/.output/server/index.mjs` | 3000 | api | - | TCP 3000 / `GET /` |
| **storefront** (Nuxt 4) | multi-stage `node:22-slim`; copy designer `dist` → `frontstore/public/designer` | `frontstore/` | `npm ci && npm run build:themes && nuxt build` | `node frontstore/.output/server/index.mjs` | 3001 | api, redis | - | TCP 3001 / `GET /` |
| **designer** | build-stage only (Vite) - **NOT a runtime service** | `designer/` | `publish-designer.sh` (`VITE_APP_BASE_API` baked at build) → `dist` copied into **api** + **storefront** web roots | - (static) | - | - | - | - |
| **pdf-service** | `pdf-service/Dockerfile` (existing) | `pdf-service/` | `npm ci --omit=dev` (multi-stage, vips) | `node src/index.js` (`WORKER_ENABLED=false`) | 4000 | postgres, redis | `fonts/`, `tmp/` | `/health` (built-in) |
| **pdf-worker** | same image as **pdf-service** | - | - | `node src/index.js` (`WORKER_ENABLED=true`, `WORKER_CONCURRENCY`) | - | redis, pdf-service | `fonts/`, `tmp/` | process up |
| **proxy** | `traefik:v3` or `nginx` | - | - | - | 80 / 443 | api, admin, storefront | `letsencrypt/` (Traefik ACME) | dashboard / `GET /` |

**Named volumes:** `pgdata`, `redis-data`, `minio-data`, plus `pdf-fonts` / `pdf-tmp` (or bind mounts as today).

### 3.1 Per-app build notes (the easy-to-get-wrong bits)

**Admin Nuxt (`nuxt/`)**
- Driven by the **repo-root** `package.json` and **repo-root** `nuxt.config.ts` (`rootDir: 'nuxt/'`). The `nuxt/` folder has only a stub `package-lock.json` - **all deps come from the root `package.json`**. The build context must include the repo-root files.
- Output is **`nuxt/.output/`**, NOT `.output/` (because of `rootDir`). Easy to break the runtime-stage `COPY`.
- Build is memory-heavy (fullcalendar, apexcharts, tiptap, quill, firebase, pdfjs) - set `NODE_OPTIONS=--max-old-space-size=4096` in the builder or it can OOM in constrained CI.
- Runtime stage copies **only `nuxt/.output/`** - Nitro output is self-contained, no `node_modules` at runtime.
- `node:22-bookworm-slim` (per `.nvmrc` = `22`); prefer Debian slim over Alpine for `sharp`-adjacent `@nuxt/image` (Alpine needs `libc6-compat`).
- SSR is ON in prod (`$production: { ssr: true }`). **Do not static-export.** `npm run generate` exists but is not how this app deploys.
- `GOOGLE_MAPS_PLACE_API_KEY` and the `meet.printflow360.com` (Jitsi) script are **baked into `<head>` at build** from `import.meta.env` - not runtime-swappable. Bake the prod maps key as a build arg.
- The admin has **no DB / Redis / S3 dependency** - it is a pure SSR frontend proxying everything through Laravel `/api/v1`.

**Storefront Nuxt (`frontstore/`)**
- Own `package.json`. `npm run build:themes` compiles per-theme CSS (runs automatically via the prebuild hook). Output `frontstore/.output/`.
- **Must set `NITRO_REDIS_URL`** for multi-replica deploys - without it, ISR/SWR cache is in-memory (lost on restart, not shared across replicas).
- Per-tenant cache key varies on `x-tenant-host` + `x-device-type` (`server/plugins/tenant-cache-key.ts`). Private routes (`/cart`, `/checkout/**`, `/profile/**`, `/order/**`, `/login`, `/api/**`) are `no-store`; public routes are ISR 600s.

**Designer SPA (`designer/`)**
- **Not a runtime service.** `publish-designer.sh` builds the Vite SPA to `designer/dist` and copies it into **both** `public/designer/` (Laravel) and `frontstore/public/designer/` (served static, embedded via iframe).
- `VITE_APP_BASE_API` is **baked at build** (`DESIGNER_BASE_API` → e.g. `https://api.printflow360.com/api/v1/storefront`). Changing the API URL requires a rebuild. Build in a build stage, copy `dist` into the api + storefront images.

---

## 4. Cross-cutting concerns

### 4.1 SSR vs browser API base (the docker-network linchpin)

The admin's `nuxt/app/plugins/app.ts → buildBaseURL()` chooses the base by render context:

```js
return baseURL
  ? baseURL
  : import.meta.server
      ? config.apiLocal + config.public.apiPrefix      // SSR  → API_LOCAL_URL
      : config.public.apiBase + config.public.apiPrefix // browser → APP_URL
```

- **SSR (inside the container)** fetches Laravel via `apiLocal` (`API_LOCAL_URL`). In Docker this MUST be the **in-network service hostname**, e.g. `http://laravelnuxt.api:8000` - NOT `localhost:8000` (which is the admin container itself).
- **Browser** calls use `apiBase` (`APP_URL`) - the **publicly reachable** Laravel URL, e.g. `https://api.example.com`.
- Getting only one right yields a "works in browser, white-screen on SSR" (or vice-versa) failure. **Both are required and different.**

### 4.2 Tenant-host resolution & per-tenant subdomain routing

- Storefront requests carry the store hostname as the `X-Tenant` header (the storefront sets this via `useStorefrontHeaders()`). SSR reads request headers and must **prefer `x-tenant-host`, NOT `useRequestURL().hostname`** - behind a proxy/Nitro that returns `localhost`, which breaks tenancy ("Storefront not found"). This is a repeatedly-bitten failure mode in this codebase.
- `config/tenancy.php` `central_domains = ['127.0.0.1','localhost']` are the non-tenant (landlord/admin) hosts. Stores live on subdomains (e.g. `myshop.localhost`).
- **A reverse proxy is required (none exists).** Recommend **Traefik** (label-driven, easy wildcard + Host-rule routing, ACME auto-TLS) or **nginx** (`server_name *.domain`, `proxy_set_header Host $host`, manual certs). Routing:
  - `*.<storefront-domain>` (wildcard tenant subdomains) → storefront :3001, **passing the real `Host`** so SSR derives `x-tenant-host`. With Traefik, add a middleware that sets `X-Tenant` / `x-tenant-host` from `Host` if the client didn't.
  - `admin.<domain>` (or central domain) → admin :3000.
  - `api.<domain>` → Laravel Octane :8000 (the API also reads `X-Tenant` for `/api/v1/storefront/*`).
  - `/designer/**`, `/storage/**`, `/images/**`, `/themes/**` are static / aggressively cached.
- **Local dev:** `*.localhost` resolves to 127.0.0.1 in modern browsers, so `printdesign.localhost:3001` works without `/etc/hosts` edits - but the wildcard proxy still needs to route `myshop.localhost`.
- The admin is the **landlord/back-office app and is NOT host-resolved per tenant** - tenant context flows through API calls / store selection, not the hostname. The storefront's "SSR sees localhost" bug class does not apply to admin. The only admin host concern is `buildHeaders` forwarding `referer` / `x-forwarded-for` / `user-agent` on SSR - ensure the proxy sets `X-Forwarded-For` correctly.

### 4.3 Cache-purge loopback

`FRONTSTORE_CACHE_PURGE_INTERNAL_URL` must hit the Nuxt process **directly**, NOT the proxy/CDN (Cloudflare returns 403 on server-side purge calls). In compose, set it to `http://storefront:3001`.

### 4.4 Shared secrets (mismatches = silent 401s)

| Secret | Must match across | Failure if mismatched |
|---|---|---|
| `APP_KEY` | Laravel ≡ pdf-service (byte-identical) | Silent 401 on delegated file ops |
| `PDF_SERVICE_INTERNAL_SECRET` (Laravel) ≡ `INTERNAL_API_SECRET` (pdf-service) | Laravel ↔ pdf-service | Silent 401 |
| `INTERNAL_API_SECRET` (Laravel `X-Internal-Secret`) + `FRONTSTORE_CACHE_PURGE_TOKEN` | Laravel ↔ storefront | Cache purge / subscription calls rejected |

**Secrets hygiene:** the committed `.env` / `.env.example` contain **real-looking live secrets** (AWS keys, Stripe keys, Brevo SMTP password, Google Maps key, Zoho refresh token). **Never bake these into image layers.** Mount via Docker secrets / env-file kept out of image layers. **Rotate the leaked ones.** The designer's `VITE_APP_BASE_API` is a build arg (build-time), not a runtime env.

### 4.5 Driver defaults for containers

Current `.env` is single-box defaults: `CACHE_STORE=database`, `QUEUE_CONNECTION=sync`, `SESSION_DRIVER=file`. SETUP.md §10.2 flips all three to `redis` for production. **For containers, switch to `redis`** - and then the **queue-worker and scheduler sidecars become mandatory** (jobs no longer run inline).

### 4.6 Queue worker + scheduler containers

Run from the **same image as `api`**:
- **queue-worker:** `php artisan queue:work --tries=3 --timeout=90` (PM2 name `printflow-queue`).
- **scheduler:** `php artisan schedule:work` (PM2 name `printflow-schedule`).

### 4.7 Octane server

`config/octane.php` defaults to **RoadRunner** (`'server' => env('OCTANE_SERVER','roadrunner')`). Either install the RoadRunner binary in the image, or set `OCTANE_SERVER=swoole`/`frankenphp` and install that extension. **FrankenPHP is the cleanest single-binary option for a container.**

### 4.8 Datastore details

- **Postgres:** one Postgres 16 service, **shared-schema, single database**. Every `stancl/tenancy` bootstrapper in `config/tenancy.php` is commented out - **no per-tenant database, no schema switching**; isolation is by `tenant_id` column only. Two logical DBs in env: tenant `DB_DATABASE=live_db` and landlord `ADMIN_DB_DATABASE=admin_db` (`admin_pgsql`) - both can live in the same instance.
- **Redis:** one instance with separate logical DBs - Laravel cache/queue/session (db 0/1) + BullMQ (db 2/3). BullMQ technically prefers its own instance for eviction policy (`allkeys-lru maxmemory 256mb`) vs Laravel cache (`noeviction`); for strict isolation use two Redis services, otherwise one with per-prefix keys is fine for small deployments. Also feeds storefront `NITRO_REDIS_URL`.
- **S3 / MinIO:** `FILESYSTEM_DISK=s3`, tenant files as **relative paths** under per-tenant prefixes in **one bucket** (no per-tenant bucket). pdf-service writes to the same S3. For local, `config/filesystems.php` supports `AWS_ENDPOINT` + `AWS_USE_PATH_STYLE_ENDPOINT` → use a **MinIO** container (`AWS_ENDPOINT=http://minio:9000`, path-style true, create the `printflow360` bucket on boot). Real S3 in prod.
- **dompdf fonts:** the Laravel image needs fonts + a writable font-cache dir; the pdf-service mirror needs its `fonts/` volume.

---

## 5. Phased migration plan

### Phase 0 - Fix the compose & stand up Postgres

The current compose is actively wrong; make it *correct* before adding apps.

- [ ] Add a `postgres:16-alpine` service with `pgdata` volume + `pg_isready` healthcheck.
- [ ] Rip out the **MySQL wiring**; point pdf-service at Postgres: `DB_DIALECT=postgres`, `DB_HOST=postgres`, `DB_PORT=5432`, `DB_DATABASE=live_db`.
- [ ] Set `ADMIN_DB_PORT=5432` explicitly (fixes the `admin_pgsql` `3306` default).
- [ ] Add a **real `GET /api/health` route** in Laravel (does not exist today).
- [ ] Confirm pdf-service + pdf-worker + pdf-redis still come up green against Postgres.
- [ ] Rename the `sail` network to `printflow`.

### Phase 1 - Backend + infra tier

- [ ] Build a **multi-stage Laravel/Octane image** (composer stage → php-runtime with `pdo_pgsql`, `gd`/`imagick`, `zip`, `pcntl`, `redis`, RoadRunner *or* FrankenPHP).
- [ ] Build steps: `composer install --no-dev`, `key:generate` (once), `storage:link`, `migrate --force`, `config/route/view/event:cache`.
- [ ] Switch driver defaults: `CACHE_STORE=redis`, `QUEUE_CONNECTION=redis`, `SESSION_DRIVER=redis`.
- [ ] Add **redis** service (`appendonly yes`, `redis-data` volume, `redis-cli ping` healthcheck).
- [ ] Add **queue-worker** and **scheduler** sidecars (same image as api).
- [ ] Add **minio** (dev) with bucket-create on boot; set `AWS_ENDPOINT` + path-style.
- [ ] Verify shared `APP_KEY` + `PDF_SERVICE_INTERNAL_SECRET` across Laravel ↔ pdf-service.
- [ ] Probe `GET /api/health` from the orchestrator.

### Phase 2 - Frontends

- [ ] Build the **designer** build-stage (`publish-designer.sh`, `VITE_APP_BASE_API` baked); copy `dist` into the api + storefront web roots.
- [ ] Build the **admin** image (multi-stage node:22-slim, `rootDir: nuxt/`, `NODE_OPTIONS=--max-old-space-size=4096`; runtime copies only `nuxt/.output/`).
  - [ ] Set `NUXT_API_LOCAL=http://laravelnuxt.api:8000` (SSR) and `NUXT_PUBLIC_API_BASE`=public Laravel URL (browser).
  - [ ] Bake `GOOGLE_MAPS_PLACE_API_KEY` + prod `APP_URL` as build args.
- [ ] Build the **storefront** image (`npm run build:themes && nuxt build`); copy designer `dist` into `frontstore/public/designer`.
  - [ ] Set `NITRO_REDIS_URL` for shared ISR cache.
  - [ ] Set `FRONTSTORE_CACHE_PURGE_INTERNAL_URL=http://storefront:3001`.
- [ ] Map `admin 3000:3000`, `storefront 3001:3001`; `depends_on: [api]` (storefront also `redis`).

### Phase 3 - Reverse proxy + tenant routing

- [ ] Add a **Traefik (or nginx)** service on 80/443.
- [ ] Route `*.<storefront-domain>` → storefront :3001, preserving `Host`; inject `X-Tenant`/`x-tenant-host` if absent.
- [ ] Route `admin.<domain>` → admin :3000; `api.<domain>` → api :8000.
- [ ] Cache `/designer/**`, `/storage/**`, `/themes/**`.
- [ ] Ensure `X-Forwarded-For` is set for admin SSR `buildHeaders`.
- [ ] Verify end-to-end: a tenant subdomain renders SSR'd storefront (no "Storefront not found").

### Phase 4 - Prod hardening

- [ ] Move all secrets to Docker secrets / external env-file (out of image layers); **rotate leaked `.env` secrets**.
- [ ] Choose Octane server (RoadRunner vs FrankenPHP) and validate under load.
- [ ] Add ACME/TLS (Traefik) or managed certs (nginx); `letsencrypt/` volume.
- [ ] Healthchecks on every service; restart policies; replica counts for stateless tiers.
- [ ] Decide single-Redis vs split-Redis for BullMQ eviction isolation.
- [ ] Switch MinIO → real S3 in prod env; verify per-tenant relative-path uploads round-trip.
- [ ] Flip pdf-service feature flags (`PDF_SERVICE_FEAT_*`) only after the service is proven (default OFF = Laravel dompdf path; safe to ship the proxy+web+db tier first and add pdf later).
- [ ] Commit a CI pipeline that builds/pushes all images with `NUXT_TELEMETRY_DISABLED=1` for hermetic builds.

---

## 6. Open questions / decisions needed

| # | Question | Notes / lean |
|---|---|---|
| 1 | **Octane server: RoadRunner, Swoole, or FrankenPHP?** | Default is RoadRunner. FrankenPHP is the cleanest single-binary for a container - recommend evaluating it first. |
| 2 | **One Redis or two?** | One with logical-DB split + per-prefix keys is fine for small deployments. BullMQ prefers `allkeys-lru` eviction vs Laravel cache `noeviction` - split only if isolation matters. |
| 3 | **Storefront domain & TLS model** | Wildcard cert for `*.<storefront-domain>` (ACME DNS-01 or a wildcard cert). Decide the apex/subdomain scheme for tenants vs `admin.`/`api.`. |
| 4 | **Where do secrets live?** | Docker secrets vs external env-file vs a secrets manager. **Must rotate the committed real-looking secrets regardless.** |
| 5 | **MinIO in dev only, real S3 in prod - or MinIO in prod too?** | Lean: MinIO for local, real AWS S3 in prod. Confirm bucket naming (`printflow360`) and per-tenant prefix convention. |
| 6 | **Migrations on boot vs separate job** | Running `migrate --force` in the api build vs a one-shot init container/job. A separate job avoids racing multiple api replicas. |
| 7 | **Designer rebuild trigger** | `VITE_APP_BASE_API` is build-time. Decide how a prod API-URL change re-triggers the designer build + recopy into both web roots. |
| 8 | **Keep PM2 bare-metal as the prod target, or migrate fully to containers?** | The team's real prod path is PM2 today. Decide whether Docker is for local/CI only, or the new prod runtime. |
| 9 | **Health route shape** | `GET /api/health` must exist; decide whether it also checks Postgres/Redis reachability (deeper probe) vs a flat 200. |

---

> See [`DOCKER_RUNBOOK_2026-06-16.md`](./DOCKER_RUNBOOK_2026-06-16.md) for the concrete Dockerfiles, compose snippets, build/run commands, and troubleshooting.
