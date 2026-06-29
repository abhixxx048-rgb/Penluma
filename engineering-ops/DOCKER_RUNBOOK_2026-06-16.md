# Docker Runbook - Print-Flow-360

> Hands-on runbook for containerizing the **whole** Print-Flow-360 stack: concrete Dockerfiles, a corrected `docker-compose.yml`, the env-var matrix, build/run commands, a reverse-proxy sketch, and a troubleshooting table.
>
> **Status disclaimer.** Today the repo has **no usable container story**. The single committed `docker-compose.yml` is the stock Laravel Sail file with a bolted-on pdf-service stack, and it is **wired to MySQL/3306** even though the platform is **PostgreSQL** everywhere. The only correct, finished Dockerfile in the repo is `pdf-service/Dockerfile`. The real prod path the team uses today is **bare-metal via `deploy/deploy.sh` + PM2**, not Docker. Everything below marked **RECOMMENDED** is greenfield; items marked **EXISTING** already live in the repo.
>
> Audience: developers + ops. Read alongside `CLAUDE.md`, `SETUP.md`, and `readme/PDF_SERVICE.md`.

---

## 0. The one bug that blocks everything

The committed compose wires the database clients to **MySQL** (`DB_HOST=${MYSQL_DB_HOST}`, `DB_PORT=3306`, `DB_DATABASE=printing_702`). The platform runs on **PostgreSQL 16**, single shared database, isolation by `tenant_id` column only (all `stancl/tenancy` bootstrappers are commented out - there is **no per-tenant database**).

Before anything in this runbook works you must:

1. Add a `postgres` service (none exists today).
2. Pass `DB_DIALECT=postgres`, `DB_HOST=postgres`, `DB_PORT=5432`, `DB_DATABASE=live_db` to **pdf-service** (its code defaults to Postgres anyway; the compose env actively overrides it wrong).
3. Set `ADMIN_DB_PORT=5432` explicitly - `config/database.php` `admin_pgsql` defaults its port to `3306` (latent MySQL bug).
4. Add a real `GET /api/health` route (it does not exist - orchestrator probes 404 today).

---

## 1. Per-service Dockerfile recommendations

All Dockerfiles below are **RECOMMENDED** (new), except `pdf-service/Dockerfile` which is **EXISTING** and good - reuse it as-is.

### 1.1 Laravel API (Octane) - `deploy/docker/api.Dockerfile` (RECOMMENDED)

Multi-stage: composer deps → PHP runtime with the extensions listed in `SETUP.md §2` plus `pdo_pgsql`, `gd`/`imagick`, `zip`, `pcntl`/`posix`, `redis`. Octane defaults to **RoadRunner** (`config/octane.php` → `env('OCTANE_SERVER','roadrunner')`); the cleanest single-binary container option is **FrankenPHP**, shown here. (Alternative: install the RoadRunner binary, or set `OCTANE_SERVER=swoole` + the swoole extension.)

The designer SPA (static, **build-time API URL baked**) is built in its own stage and copied into `public/designer/`.

```dockerfile
# ---- designer build stage (static SPA, baked API URL) ----
FROM node:22-bookworm-slim AS designer
WORKDIR /designer
COPY designer/package*.json ./
RUN npm ci
COPY designer/ ./
# VITE_APP_BASE_API is BAKED at build time - pass the prod storefront API URL.
ARG DESIGNER_BASE_API=https://api.printflow360.com/api/v1/storefront
ENV VITE_APP_BASE_API=$DESIGNER_BASE_API
RUN npm run build          # -> designer/dist

# ---- composer / PHP deps stage ----
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --ignore-platform-reqs

# ---- runtime: FrankenPHP (PHP 8.2+, Octane) ----
FROM dunglas/frankenphp:php8.3-bookworm AS runtime
# Required PHP extensions (SETUP.md §2 + Postgres + image + zip + queue + redis)
RUN install-php-extensions \
      pdo_pgsql pgsql bcmath gd zip exif pcntl intl opcache redis
WORKDIR /var/www/html

# App source + vendored deps + designer dist
COPY . .
COPY --from=vendor /app/vendor ./vendor
COPY --from=designer /designer/dist ./public/designer

# dompdf needs a writable font cache; storage/bootstrap must be writable
RUN chown -R www-data:www-data storage bootstrap/cache public/designer \
 && mkdir -p storage/fonts && chown -R www-data:www-data storage/fonts

ENV OCTANE_SERVER=frankenphp
EXPOSE 8000
# Prod: NO --watch (that's the Sail dev convenience). Caches built at deploy time (see §4).
CMD ["php", "artisan", "octane:start", "--host=0.0.0.0", "--port=8000"]
```

> **Gotchas**
> - `--watch` is dev-only. Production uses the plain `octane:start`.
> - Run `migrate --force` + `config:cache route:cache view:cache event:cache` at **deploy time** (an entrypoint or a one-shot job), not in the image build - they need live env/DB. See §4.
> - **dompdf needs fonts** and a writable cache dir in the image (`storage/fonts` above).
> - **Never bake `.env`** - the committed `.env`/`.env.example` contain real-looking secrets. Mount env at runtime.

### 1.2 Queue worker + scheduler (REUSE API image, different command) (RECOMMENDED)

No separate Dockerfile. Same image as the API, override the command. Required because the move to containers means flipping `QUEUE_CONNECTION=sync` → `redis` (jobs no longer run inline).

```dockerfile
# queue-worker  (deploy/deploy.sh PM2 name: printflow-queue)
CMD ["php", "artisan", "queue:work", "--tries=3", "--timeout=90"]

# scheduler     (deploy/deploy.sh PM2 name: printflow-schedule)
CMD ["php", "artisan", "schedule:work"]
```

(Both set as `command:` overrides in compose - see §2.)

### 1.3 Nuxt 3 Admin (`nuxt/`, :3000) - `deploy/docker/admin.Dockerfile` (RECOMMENDED)

Multi-stage node build → slim runtime serving the self-contained Nitro output.

> **Critical gotchas for this app**
> - Deps come from the **ROOT** `package.json` + root `nuxt.config.ts` (`rootDir: 'nuxt/'`). The `nuxt/package-lock.json` is a stub - build context must include repo-root files.
> - Output is **`nuxt/.output/`**, not `.output/` (because of `rootDir`).
> - SSR uses `API_LOCAL_URL` (internal), browser uses `APP_URL` (public). Both required, different in Docker.
> - `GOOGLE_MAPS_PLACE_API_KEY` + the `meet.printflow360.com` Jitsi script are **baked at build** from `import.meta.env` - not runtime-swappable. `APP_URL` is also baked into `image.domains` + CSP.
> - Build is memory-heavy (fullcalendar/apexcharts/tiptap/quill/firebase/pdfjs) - set `--max-old-space-size=4096`.

```dockerfile
# ---- build stage ----
FROM node:22-bookworm-slim AS build
WORKDIR /app
# Root files drive the build (rootDir: 'nuxt/').
COPY package.json package-lock.json nuxt.config.ts tsconfig.json ./
RUN npm ci                                  # postinstall runs `nuxt prepare`
COPY nuxt/ ./nuxt/
# Build-time bakes: APP_URL (CSP/image domains), maps key, env label, timezone.
ARG APP_URL=https://api.printflow360.com
ARG GOOGLE_MAPS_PLACE_API_KEY=
ARG ENVIRONMENT=PRODUCTION
ARG APP_TIMEZONE=Asia/Kolkata
ENV APP_URL=$APP_URL \
    GOOGLE_MAPS_PLACE_API_KEY=$GOOGLE_MAPS_PLACE_API_KEY \
    ENVIRONMENT=$ENVIRONMENT \
    APP_TIMEZONE=$APP_TIMEZONE \
    NUXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS=--max-old-space-size=4096
RUN npm run build                           # -> nuxt/.output/  (NOTE: under nuxt/)

# ---- runtime stage ----
FROM node:22-bookworm-slim AS runtime
WORKDIR /app
RUN useradd -m -u 10001 app
# Nitro output is self-contained - no node_modules needed at runtime.
COPY --from=build /app/nuxt/.output ./nuxt/.output
USER app
ENV PORT=3000 HOST=0.0.0.0
EXPOSE 3000
# Runtime-overridable (set per env): NUXT_API_LOCAL, NUXT_PUBLIC_API_BASE, etc. (see §3)
CMD ["node", "nuxt/.output/server/index.mjs"]
```

### 1.4 Nuxt 4 Storefront (`frontstore/`, :3001) - `deploy/docker/storefront.Dockerfile` (RECOMMENDED)

Own `package.json`. The `build:themes` step compiles per-theme CSS and runs **automatically via the prebuild hook**, so `nuxt build` triggers it - but run it explicitly to be safe. Copies the designer `dist` into `frontstore/public/designer` (static, iframe-embedded).

> **Critical gotchas**
> - Set **`NITRO_REDIS_URL`** at runtime for shared/persistent ISR cache - without it every restart cold-starts and replicas don't share cache.
> - Per-tenant cache key varies on `x-tenant-host` + `x-device-type` (`server/plugins/tenant-cache-key.ts`). The proxy **must preserve the real `Host`**.
> - `FRONTSTORE_CACHE_PURGE_INTERNAL_URL` must hit the Nuxt process **directly** (`http://storefront:3001`), never via the proxy/Cloudflare (returns 403).

```dockerfile
# ---- designer build stage (reuse same as API) ----
FROM node:22-bookworm-slim AS designer
WORKDIR /designer
COPY designer/package*.json ./
RUN npm ci
COPY designer/ ./
ARG DESIGNER_BASE_API=https://api.printflow360.com/api/v1/storefront
ENV VITE_APP_BASE_API=$DESIGNER_BASE_API
RUN npm run build

# ---- storefront build stage ----
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY frontstore/package*.json ./frontstore/
WORKDIR /app/frontstore
RUN npm ci
COPY frontstore/ ./
ENV NUXT_TELEMETRY_DISABLED=1 NODE_OPTIONS=--max-old-space-size=4096
RUN npm run build:themes && npx nuxt build   # prebuild hook also runs build:themes
# Designer SPA served as static from frontstore web root
COPY --from=designer /designer/dist ./public/designer

# ---- runtime stage ----
FROM node:22-bookworm-slim AS runtime
WORKDIR /app
RUN useradd -m -u 10002 app
COPY --from=build /app/frontstore/.output ./frontstore/.output
USER app
ENV PORT=3001 HOST=0.0.0.0
EXPOSE 3001
CMD ["node", "frontstore/.output/server/index.mjs"]
```

### 1.5 Designer SPA (`designer/`, build-only) (RECOMMENDED, as a stage)

**Not a runtime service.** It is a Vite SPA whose `VITE_APP_BASE_API` is **baked at build time** (`DESIGNER_BASE_API` env). In prod it is built once and the `dist/` is copied into both the Laravel `public/designer/` and the storefront `frontstore/public/designer/` web roots (mirrors `scripts/publish-designer.sh`). It is shown above as the `designer` build stage inside both the API and storefront Dockerfiles - there is no standalone designer container.

> Do **not** run a designer build casually (CLAUDE.md §5 - a hook even blocks it). Only build it in CI/image build for a release.

### 1.6 pdf-service (`pdf-service/`, :4000) - `pdf-service/Dockerfile` (EXISTING - reuse)

The **only correct, finished Dockerfile in the repo.** Multi-stage `node:20-alpine`, build deps `vips-dev build-base python3 pkgconfig` (for `sharp`/canvas), runtime libs `vips tini curl`, non-root `app` user, `tini` as PID 1, `HEALTHCHECK` on `/health`. **Do not rewrite it.**

One image serves two roles via env:
- **API**: `WORKER_ENABLED=false`, HTTP :4000.
- **Worker**: `WORKER_ENABLED=true`, BullMQ consumer, `WORKER_CONCURRENCY`.

The only **fix needed** is the *compose env* (not the Dockerfile): pass `DB_DIALECT=postgres`, `DB_HOST=postgres`, `DB_PORT=5432`, `DB_DATABASE=live_db` (see §0 and §2).

---

## 2. Corrected, complete `docker-compose.yml` (dev) (RECOMMENDED)

Replaces the broken Sail file. Fixes the MySQL→PostgreSQL bug, adds postgres/redis/minio/proxy, splits pdf API vs worker, adds queue-worker + scheduler sidecars, uses YAML anchors for shared env, and adds healthchecks + named volumes.

```yaml
# docker-compose.yml - dev stack for Print-Flow-360 (RECOMMENDED, replaces Sail stub)
x-laravel-env: &laravel-env
  APP_KEY: ${APP_KEY}                       # MUST match pdf-service APP_KEY exactly
  DB_CONNECTION: pgsql
  DB_HOST: postgres
  DB_PORT: 5432
  DB_DATABASE: ${DB_DATABASE:-live_db}
  DB_USERNAME: ${DB_USERNAME:-printflow}
  DB_PASSWORD: ${DB_PASSWORD:-secret}
  ADMIN_DB_CONNECTION: admin_pgsql
  ADMIN_DB_HOST: postgres
  ADMIN_DB_PORT: 5432                       # FIX: config default is wrongly 3306
  ADMIN_DB_DATABASE: ${ADMIN_DB_DATABASE:-admin_db}
  REDIS_HOST: redis
  REDIS_PORT: 6379
  REDIS_CLIENT: phpredis
  CACHE_STORE: redis                        # was: database
  QUEUE_CONNECTION: redis                   # was: sync (so workers become mandatory)
  SESSION_DRIVER: redis                     # was: file
  FILESYSTEM_DISK: s3
  AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID:-printflow}
  AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY:-printflow-secret}
  AWS_DEFAULT_REGION: ${AWS_DEFAULT_REGION:-us-east-1}
  AWS_BUCKET: ${AWS_BUCKET:-printflow360}
  AWS_ENDPOINT: http://minio:9000           # MinIO for local S3
  AWS_USE_PATH_STYLE_ENDPOINT: "true"
  PDF_SERVICE_INTERNAL_SECRET: ${PDF_SERVICE_INTERNAL_SECRET}  # == pdf INTERNAL_API_SECRET

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${DB_USERNAME:-printflow}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-secret}
      POSTGRES_DB: ${DB_DATABASE:-live_db}
    volumes:
      - pgdata:/var/lib/postgresql/data
      # one-shot: create the landlord DB too (admin_db) - both live in one instance
      - ./deploy/docker/initdb:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME:-printflow}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks: [printflow]

  redis:
    image: redis:7-alpine
    command: ["redis-server", "--appendonly", "yes"]
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    networks: [printflow]

  minio:                                    # dev only - real S3 in prod
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${AWS_ACCESS_KEY_ID:-printflow}
      MINIO_ROOT_PASSWORD: ${AWS_SECRET_ACCESS_KEY:-printflow-secret}
    volumes:
      - minio-data:/data
    ports: ["9000:9000", "9001:9001"]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/ready"]
      interval: 15s
      timeout: 5s
      retries: 5
    networks: [printflow]

  api:
    build:
      context: .
      dockerfile: deploy/docker/api.Dockerfile
    environment:
      <<: *laravel-env
      APP_URL: ${APP_URL:-http://api.localhost}
      OCTANE_SERVER: frankenphp
    depends_on:
      postgres: { condition: service_healthy }
      redis:    { condition: service_healthy }
      minio:    { condition: service_healthy }
    volumes:
      - api-storage:/var/www/html/storage   # logs (durable local state when S3 is on)
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]  # ADD this route
      interval: 15s
      timeout: 5s
      retries: 5
    networks: [printflow]

  queue-worker:
    build: { context: ., dockerfile: deploy/docker/api.Dockerfile }
    command: ["php", "artisan", "queue:work", "--tries=3", "--timeout=90"]
    environment:
      <<: *laravel-env
      APP_URL: ${APP_URL:-http://api.localhost}
    depends_on:
      postgres: { condition: service_healthy }
      redis:    { condition: service_healthy }
    networks: [printflow]

  scheduler:
    build: { context: ., dockerfile: deploy/docker/api.Dockerfile }
    command: ["php", "artisan", "schedule:work"]
    environment:
      <<: *laravel-env
      APP_URL: ${APP_URL:-http://api.localhost}
    depends_on:
      postgres: { condition: service_healthy }
      redis:    { condition: service_healthy }
    networks: [printflow]

  admin:
    build:
      context: .
      dockerfile: deploy/docker/admin.Dockerfile
      args:
        APP_URL: ${APP_URL:-http://api.localhost}        # baked (CSP/image domains)
        GOOGLE_MAPS_PLACE_API_KEY: ${GOOGLE_MAPS_PLACE_API_KEY:-}
        ENVIRONMENT: ${ENVIRONMENT:-DEV}
        APP_TIMEZONE: ${APP_TIMEZONE:-Asia/Kolkata}
    environment:
      NUXT_API_LOCAL: http://api:8000                    # SSR / internal
      NUXT_PUBLIC_API_BASE: ${APP_URL:-http://api.localhost}  # browser / public
      NUXT_PUBLIC_WS_URL: ${NUXT_PUBLIC_WS_URL:-ws://localhost:3001}
      NUXT_PUBLIC_ENVIRONMENT: ${ENVIRONMENT:-DEV}
      NUXT_PUBLIC_STORAGE_BASE: ${NUXT_PUBLIC_STORAGE_BASE:-}
      NUXT_PUBLIC_DESIGNER_APP_URL: /designer/
    depends_on:
      api: { condition: service_healthy }
    healthcheck:
      test: ["CMD-SHELL", "node -e \"fetch('http://localhost:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))\""]
      interval: 20s
      timeout: 5s
      retries: 5
    networks: [printflow]

  storefront:
    build:
      context: .
      dockerfile: deploy/docker/storefront.Dockerfile
    environment:
      FRONT_STORE_APP_BASE_API_URL: http://api:8000      # SSR/internal Laravel
      FRONT_STORE_APP_API_PREFIX: /api/v1/storefront
      FRONT_STORE_APP_STORAGE_BASE: ${NUXT_PUBLIC_STORAGE_BASE:-}
      DESIGNER_APP: /designer/
      NITRO_REDIS_URL: redis://redis:6379/4              # shared ISR cache across replicas
      FRONTSTORE_CACHE_PURGE_TOKEN: ${FRONTSTORE_CACHE_PURGE_TOKEN}
      FRONTSTORE_CACHE_PURGE_INTERNAL_URL: http://storefront:3001  # bypass proxy/CDN
      BASE_DOMAIN: ${BASE_DOMAIN:-localhost}
    depends_on:
      api:   { condition: service_healthy }
      redis: { condition: service_healthy }
    healthcheck:
      test: ["CMD-SHELL", "node -e \"fetch('http://localhost:3001/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))\""]
      interval: 20s
      timeout: 5s
      retries: 5
    networks: [printflow]

  pdf-service:
    build: { context: ./pdf-service, dockerfile: Dockerfile }   # EXISTING Dockerfile
    environment:
      WORKER_ENABLED: "false"
      DB_DIALECT: postgres            # FIX: compose previously passed MySQL
      DB_HOST: postgres
      DB_PORT: 5432
      DB_DATABASE: ${DB_DATABASE:-live_db}
      DB_USERNAME: ${DB_USERNAME:-printflow}
      DB_PASSWORD: ${DB_PASSWORD:-secret}
      APP_KEY: ${APP_KEY}                          # == Laravel APP_KEY
      INTERNAL_API_SECRET: ${PDF_SERVICE_INTERNAL_SECRET}  # == Laravel PDF_SERVICE_INTERNAL_SECRET
      REDIS_HOST: redis
      REDIS_PORT: 6379
      AWS_ENDPOINT: http://minio:9000
      AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID:-printflow}
      AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY:-printflow-secret}
      AWS_BUCKET: ${AWS_BUCKET:-printflow360}
      STORAGE_BASE_URL: ${STORAGE_BASE_URL:-http://minio:9000/printflow360}
    depends_on:
      postgres: { condition: service_healthy }
      redis:    { condition: service_healthy }
    volumes:
      - ./pdf-service/fonts:/app/fonts
      - pdf-tmp:/app/tmp
    networks: [printflow]            # /health is built into the existing Dockerfile

  pdf-worker:
    build: { context: ./pdf-service, dockerfile: Dockerfile }
    environment:
      WORKER_ENABLED: "true"
      WORKER_CONCURRENCY: ${WORKER_CONCURRENCY:-2}
      DB_DIALECT: postgres
      DB_HOST: postgres
      DB_PORT: 5432
      DB_DATABASE: ${DB_DATABASE:-live_db}
      DB_USERNAME: ${DB_USERNAME:-printflow}
      DB_PASSWORD: ${DB_PASSWORD:-secret}
      APP_KEY: ${APP_KEY}
      INTERNAL_API_SECRET: ${PDF_SERVICE_INTERNAL_SECRET}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      AWS_ENDPOINT: http://minio:9000
      AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID:-printflow}
      AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY:-printflow-secret}
      AWS_BUCKET: ${AWS_BUCKET:-printflow360}
      STORAGE_BASE_URL: ${STORAGE_BASE_URL:-http://minio:9000/printflow360}
    depends_on:
      redis:       { condition: service_healthy }
      pdf-service: { condition: service_started }
    volumes:
      - ./pdf-service/fonts:/app/fonts
      - pdf-tmp:/app/tmp
    networks: [printflow]

  proxy:
    image: traefik:v3
    command:
      - --providers.docker=true
      - --providers.docker.exposedbydefault=false
      - --entrypoints.web.address=:80
    ports: ["80:80", "8080:8080"]
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    depends_on: [api, admin, storefront]
    networks: [printflow]

volumes:
  pgdata:
  redis-data:
  minio-data:
  api-storage:
  pdf-tmp:

networks:
  printflow:
    driver: bridge
```

> The Traefik routing labels (Host rules + X-Tenant header injection) are sketched in **§5**; add them onto the `api`/`admin`/`storefront` services.

---

## 3. Env-var matrix - who needs what, and what MUST match

### 3.1 Secrets that MUST be byte-identical across services

| Var | Laravel | pdf-service | storefront | Failure if mismatched |
|---|---|---|---|---|
| `APP_KEY` | `APP_KEY` | `APP_KEY` | - | silent **401** on every delegated file op |
| `PDF_SERVICE_INTERNAL_SECRET` ↔ `INTERNAL_API_SECRET` | `PDF_SERVICE_INTERNAL_SECRET` | `INTERNAL_API_SECRET` | - | **401** between Laravel ↔ pdf-service |
| `FRONTSTORE_CACHE_PURGE_TOKEN` | set | - | `FRONTSTORE_CACHE_PURGE_TOKEN` | cache purge rejected |
| `INTERNAL_API_SECRET` (subscription `X-Internal-Secret`) | set | - | set (if used) | subscription verify fails |

### 3.2 Per-service env

| Service | Key env it reads | Notes |
|---|---|---|
| **api** | `APP_KEY`, `APP_URL`, `DB_*` (pgsql/5432), `ADMIN_DB_*` (**5432**, not 3306), `REDIS_*`, `CACHE_STORE=redis`, `QUEUE_CONNECTION=redis`, `SESSION_DRIVER=redis`, `FILESYSTEM_DISK=s3` (+`AWS_ENDPOINT`/`AWS_USE_PATH_STYLE_ENDPOINT` for MinIO), `OCTANE_SERVER`, `PDF_SERVICE_*` | switch sync/database/file → redis for containers |
| **queue-worker / scheduler** | same as api | different command only |
| **admin** (Nuxt 3) | **build-time** `APP_URL`, `GOOGLE_MAPS_PLACE_API_KEY`, `ENVIRONMENT`, `APP_TIMEZONE`; **runtime** `NUXT_API_LOCAL` (SSR/internal → `http://api:8000`), `NUXT_PUBLIC_API_BASE` (browser/public → public Laravel URL), `NUXT_PUBLIC_WS_URL`, `NUXT_PUBLIC_STORAGE_BASE`, `NUXT_PUBLIC_DESIGNER_APP_URL`, `NUXT_PUBLIC_ENVIRONMENT`, `NUXT_PUBLIC_TIMEZONE` | API prefix fixed at `/api/v1`. Maps key + Jitsi script baked at build |
| **storefront** (Nuxt 4) | `FRONT_STORE_APP_BASE_API_URL` (internal → `http://api:8000`), `FRONT_STORE_APP_API_PREFIX`, `FRONT_STORE_APP_STORAGE_BASE`, `DESIGNER_APP`, **`NITRO_REDIS_URL`**, `FRONTSTORE_CACHE_PURGE_TOKEN`, `FRONTSTORE_CACHE_PURGE_INTERNAL_URL`, `BASE_DOMAIN`/`FRONTSTORE_BASE_URL_WITHOUT_PROTOCOL` | `NITRO_REDIS_URL` mandatory for multi-replica; purge URL must bypass proxy |
| **designer** | `DESIGNER_BASE_API` / `VITE_APP_BASE_API` (**build arg only**) | rebuild to change the API URL |
| **pdf-service / pdf-worker** | **`DB_DIALECT=postgres`**, `DB_HOST=postgres`, `DB_PORT=5432`, `DB_DATABASE=live_db`, `APP_KEY`, `INTERNAL_API_SECRET`, `REDIS_*`, `AWS_*`, `STORAGE_BASE_URL`, `WORKER_ENABLED`, `WORKER_CONCURRENCY`, `SENTRY_DSN` | feature flags `PDF_SERVICE_FEAT_*` default **OFF** (Laravel keeps using dompdf) |

### 3.3 SSR-vs-browser API base (the docker-network linchpin)

`nuxt/app/plugins/app.ts → buildBaseURL()` chooses:

```js
import.meta.server
  ? config.apiLocal  + config.public.apiPrefix   // SSR  → API_LOCAL_URL  (NUXT_API_LOCAL)
  : config.public.apiBase + config.public.apiPrefix // browser → APP_URL (NUXT_PUBLIC_API_BASE)
```

- **SSR (inside the admin container)** → `NUXT_API_LOCAL` must be the in-network service name (`http://api:8000`). `localhost` here is the admin container itself → white-screen on SSR.
- **Browser** → `NUXT_PUBLIC_API_BASE` must be the publicly reachable Laravel URL.
- Getting only one right yields "works in browser, blank on SSR" (or vice-versa).

### 3.4 Secrets hygiene

The committed `.env` / `.env.example` contain **real-looking live secrets** (AWS keys, Stripe keys, Brevo SMTP password, Google Maps key, Zoho refresh token). **Never bake these into image layers.** Use Docker secrets / an env-file kept out of the image, and rotate the leaked ones.

---

## 4. Build & run commands

> All commands run from repo root. `APP_KEY`, `PDF_SERVICE_INTERNAL_SECRET`, etc. should live in an out-of-image `.env` consumed by compose, not in the images.

```bash
# 0. One-time: generate an APP_KEY if you don't have one (reuse it for pdf-service)
docker compose run --rm api php artisan key:generate --show   # copy into your .env

# 1. Build all images
docker compose build

# 2. Bring up datastores first, then the rest
docker compose up -d postgres redis minio
docker compose up -d

# 3. Create the MinIO bucket (dev S3) - one-shot
docker compose exec minio sh -c \
  "mc alias set local http://localhost:9000 $AWS_ACCESS_KEY_ID $AWS_SECRET_ACCESS_KEY && \
   mc mb -p local/printflow360"

# 4. Laravel deploy-time steps (run AFTER postgres is healthy)
docker compose exec api php artisan migrate --force
docker compose exec api php artisan storage:link
docker compose exec api php artisan config:cache route:cache view:cache event:cache

# 5. Storefront per-theme CSS is built during the image build (build:themes via prebuild
#    hook). To rebuild after a theme change:
docker compose build storefront

# 6. Designer is built INTO the api + storefront images (static dist, baked API URL).
#    Mirrors scripts/publish-designer.sh. To change its API URL, rebuild with the build arg:
docker compose build --build-arg DESIGNER_BASE_API=https://api.example.com/api/v1/storefront \
  api storefront

# 7. Tail logs
docker compose logs -f api
docker compose logs -f storefront admin
docker compose logs -f pdf-service pdf-worker

# 8. Check pdf-service wiring + feature flags (Artisan helper, EXISTING)
docker compose exec api php artisan pdf-service:status
```

> **Memory note for the builders:** the admin and storefront builds are memory-heavy - `NODE_OPTIONS=--max-old-space-size=4096` is set inside their Dockerfiles. Laravel's bare-metal build uses the same flag in `deploy/deploy.sh`.

---

## 5. Reverse-proxy sketch - tenant subdomains + `X-Tenant` (RECOMMENDED)

No proxy exists in the repo. Tenant resolution: **storefront requests carry the store hostname as the `X-Tenant` header** (the storefront Nuxt sets it via `useStorefrontHeaders()`; SSR reads request headers and prefers `x-tenant-host`, **not** `useRequestURL().hostname` which returns `localhost` behind a proxy and breaks tenancy). `config/tenancy.php` `central_domains = ['127.0.0.1','localhost']` are the non-tenant (admin/landlord) hosts.

Routing rules:

| Host pattern | → service | Must do |
|---|---|---|
| `*.<storefront-domain>` (wildcard tenant subdomains) | storefront :3001 | **pass real `Host` through**; inject `X-Tenant`/`x-tenant-host` from `Host` if absent |
| `admin.<domain>` (or central domain) | admin :3000 | normal proxy |
| `api.<domain>` | Laravel Octane :8000 | API also reads `X-Tenant` for `/api/v1/storefront/*` |
| `/designer/**`, `/storage/**`, `/images/**`, `/themes/**` | static / cached | aggressive cache (storefront route rules already cache `/designer/**` + `/themes/**`) |

### Traefik labels (add onto compose services)

```yaml
  storefront:
    labels:
      - traefik.enable=true
      - "traefik.http.routers.store.rule=HostRegexp(`{sub:[a-z0-9-]+}.${STOREFRONT_DOMAIN}`)"
      - traefik.http.routers.store.entrypoints=web
      - traefik.http.services.store.loadbalancer.server.port=3001
      # Set X-Tenant from the Host if the client didn't send it:
      - "traefik.http.middlewares.xtenant.headers.customrequestheaders.X-Tenant=${HOST_PLACEHOLDER}"
      - traefik.http.routers.store.middlewares=xtenant
  admin:
    labels:
      - traefik.enable=true
      - "traefik.http.routers.admin.rule=Host(`admin.${BASE_DOMAIN}`)"
      - traefik.http.services.admin.loadbalancer.server.port=3000
  api:
    labels:
      - traefik.enable=true
      - "traefik.http.routers.api.rule=Host(`api.${BASE_DOMAIN}`)"
      - traefik.http.services.api.loadbalancer.server.port=8000
```

> Traefik can't templatize a header from `Host` purely via labels - for production-grade `X-Tenant=Host` injection use a small ForwardAuth/plugin, or do it in nginx (below). The storefront Nuxt already derives the tenant from the forwarded `Host`/`x-tenant-host`, so the key requirement is **preserve the real `Host`**.

### nginx equivalent (explicit header injection)

```nginx
# wildcard tenant subdomains -> storefront, inject X-Tenant from Host
server {
  server_name ~^(?<tenant>.+)\.example\.com$;
  location / {
    proxy_pass http://storefront:3001;
    proxy_set_header Host            $host;          # preserve real Host
    proxy_set_header X-Tenant        $host;          # tenant resolution
    proxy_set_header x-tenant-host   $host;          # SSR prefers this
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
server {                       # admin
  server_name admin.example.com;
  location / { proxy_pass http://admin:3000; proxy_set_header Host $host; }
}
server {                       # api
  server_name api.example.com;
  location / {
    proxy_pass http://api:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

> **Local dev:** `*.localhost` resolves to `127.0.0.1` automatically in modern browsers, so `printdesign.localhost` works without `/etc/hosts` edits - but the wildcard proxy still needs the Host rule. `.env`: `TEST_STORE_SUBDOMAIN=printdesign.localhost:3001`, `BASE_DOMAIN=localhost:3001`.
>
> **Cache-purge loopback:** `FRONTSTORE_CACHE_PURGE_INTERNAL_URL=http://storefront:3001` must hit Nuxt **directly**, never the proxy/Cloudflare (returns 403).

---

## 6. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| **Silent 401** on every delegated PDF/image op | `APP_KEY` differs between Laravel and pdf-service | Make `APP_KEY` byte-identical in both; restart both |
| **401 between Laravel ↔ pdf-service** (non-`APP_KEY`) | `PDF_SERVICE_INTERNAL_SECRET` (Laravel) ≠ `INTERNAL_API_SECRET` (pdf-service) | Set both to the same value |
| pdf-service **can't reach the DB** / connects to nonexistent `printing_702` or speaks Postgres to port 3306 | Compose still passes `MYSQL_DB_*` / `DB_PORT=3306` | Pass `DB_DIALECT=postgres`, `DB_HOST=postgres`, `DB_PORT=5432`, `DB_DATABASE=live_db` |
| Landlord (`admin_pgsql`) connection fails on **3306** | `config/database.php` `admin_pgsql` port default is `3306` | Set `ADMIN_DB_PORT=5432` explicitly in env |
| Storefront shows **"Storefront not found"** / tenant resolves as `localhost` | SSR fell back to `useRequestURL().hostname` (returns `localhost` behind proxy/Nitro) | Proxy must forward real `Host`; inject `X-Tenant`/`x-tenant-host`; ensure SSR reads `x-tenant-host` |
| Admin **white-screen on SSR but fine in browser** (or vice-versa) | Only one of `NUXT_API_LOCAL` / `NUXT_PUBLIC_API_BASE` is correct | SSR → `NUXT_API_LOCAL=http://api:8000`; browser → `NUXT_PUBLIC_API_BASE=` public Laravel URL |
| Orchestrator / `deploy.sh` health probe **404s** on `/api/health` | No real health route exists | **Add `GET /api/health`** returning 200 before wiring the Laravel healthcheck |
| Storefront cache **cold on every restart** / replicas show stale-vs-fresh inconsistently | `NITRO_REDIS_URL` unset → in-memory ISR cache (lost on restart, not shared) | Set `NITRO_REDIS_URL=redis://redis:6379/4` |
| **Cache purge fails / 403** | Purge call routed through proxy/Cloudflare | Set `FRONTSTORE_CACHE_PURGE_INTERNAL_URL=http://storefront:3001` (direct) |
| Admin build **OOMs** in CI | Huge dep tree (fullcalendar/apexcharts/tiptap/quill/firebase/pdfjs) | `NODE_OPTIONS=--max-old-space-size=4096` in builder stage |
| `COPY` finds **no `.output`** for the admin image | Output is under `nuxt/.output/` (because `rootDir: 'nuxt/'`), not `./.output/` | Copy `nuxt/.output`; ensure build context has root `package.json` + `nuxt.config.ts` |
| Admin missing deps at build | Deps live in **root** `package.json`; `nuxt/package-lock.json` is a stub | Build context must include repo-root files; `npm ci` at root |
| Designer iframe calls **wrong API** | `VITE_APP_BASE_API` is baked at **build time** | Rebuild with `--build-arg DESIGNER_BASE_API=...` |
| Queued jobs **never run** in containers | `QUEUE_CONNECTION=sync` (inline) carried over from `.env` | Set `QUEUE_CONNECTION=redis` and run the `queue-worker` + `scheduler` sidecars |
| dompdf **export fails / missing fonts** | Font cache dir not present/writable in the Laravel image | Ship fonts + a writable `storage/fonts` cache dir |
| Octane won't start | Image has no RoadRunner binary (`OCTANE_SERVER` default) | Install RoadRunner, or set `OCTANE_SERVER=frankenphp`/`swoole` and install that runtime |
| MinIO uploads 403 / bucket missing | Path-style/endpoint not set, or bucket not created | `AWS_ENDPOINT=http://minio:9000`, `AWS_USE_PATH_STYLE_ENDPOINT=true`, `mc mb local/printflow360` |
| pdf-service appears **dormant** (no effect) | `PDF_SERVICE_FEAT_*` flags default **OFF** - Laravel uses its own dompdf path | Expected; flip the relevant flags to route work to pdf-service |

---

## 7. Rollout order (de-risked)

Because **pdf-service feature flags default OFF**, Laravel keeps using its own dompdf path - so you can ship the **proxy + web + db tier first** and add the pdf tier later:

1. `postgres` + `redis` (+ `minio` for dev) → healthchecks green.
2. `api` (with the **new `/api/health` route** + Postgres wiring) → `migrate --force` + caches.
3. `queue-worker` + `scheduler` (now that `QUEUE_CONNECTION=redis`).
4. `admin` + `storefront` (mind SSR-vs-browser API bases; set `NITRO_REDIS_URL`).
5. `proxy` (wildcard tenant routing, preserve `Host`).
6. `pdf-service` + `pdf-worker` last (low-risk; flip `PDF_SERVICE_FEAT_*` when ready).

> Keep `deploy/deploy.sh` + PM2 as the bare-metal fallback until the container path is proven - note `deploy/pm2/ecosystem.config.cjs` is referenced but **missing**, and there is **no nginx config in `deploy/`**, so Docker here is genuinely greenfield.
