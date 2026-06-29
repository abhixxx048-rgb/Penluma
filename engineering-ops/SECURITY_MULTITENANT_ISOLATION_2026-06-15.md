# Multi-Tenant Isolation & Access-Control Security Review — 2026-06-15

> Staff security review of how Print-Flow-360 keeps one tenant's data away from another, and where it currently fails.
> Scope: tenant resolution, Eloquent isolation, Sanctum auth, CORS, rate limiting, queue/Octane context, and IDOR.
> Audience: backend engineers + ops. Every claim is grounded with `file:line`. Anything that does not yet exist in code is labelled **RECOMMENDATION**.

---

## 1. Executive summary

**Isolation model (proven fact, not assumption):** Print-Flow-360 is **single-database, shared-schema** multitenancy. This is not a guess — **every stancl/tenancy bootstrapper is commented out** in `config/tenancy.php:31-37` (no `DatabaseTenancyBootstrapper`, no `CacheTenancyBootstrapper`, no `QueueTenancyBootstrapper`, no `FilesystemTenancyBootstrapper`). So `tenancy()->initialize()` only sets the `tenant()` context object; it never swaps the DB connection, cache prefix, or filesystem root. **All 113 tenant-owned models share one Postgres schema and 121 migrations carry a `tenant_id` column.** Isolation depends *entirely* on the `BelongsToTenant` global scope (`vendor/stancl/tenancy/src/Database/TenantScope.php:14-22`) adding `where tenant_id = tenant()->getTenantKey()` to every query.

**Two parallel tenant-resolution paths:**
- **Admin / store-admin API** — tenant comes from the *authenticated user*, not the host (`app/Http/Middleware/InitializeTenancy.php:19-20`). A stolen admin token therefore cannot be replayed against another tenant's host — the token's own tenant always wins. This is a genuine strength.
- **Storefront API** — tenant comes from the *request* (`app/Http/Middleware/InitializeStorefrontTenancy.php:55-79`): `X-Tenant` header first, then `X-Store-Id`/`store_id`, then `getHost()` last. The header is attacker-controllable and is trusted *ahead* of the real host.

**The single biggest risk:** the isolation posture is **fail-open**. `TenantScope::apply()` early-returns and filters *nothing* when tenancy was never initialized (`TenantScope.php:17-18`). Combined with two controllers that deliberately strip the scope (`OrderStatusController` / `JobStatusController` using `withoutGlobalScopes()->findOrFail($numericId)` with **no tenant ownership re-check**), there are live, exploitable **cross-tenant IDOR** holes today. Add a hardcoded `MASTER_OTP` 2FA backdoor and an inverted designer-token expiry check, and there are three independently critical findings.

**RAG verdict on cross-tenant isolation: 🔴 RED.**
The strong path (admin token → user-derived tenancy) is sound, but it is undermined by (a) two confirmed cross-tenant IDOR write paths on sequential integer IDs, (b) a fail-open scope with no DB-level backstop, and (c) a 2FA bypass and forever-valid designer tokens. None of these are theoretical — each has a concrete exploit and a concrete fix below.

| Dimension | Verdict | Why |
|---|---|---|
| Admin token tenant binding | 🟢 Green | Tenancy derived from `Auth::user()->tenant_id` (`InitializeTenancy.php:19`) — host replay can't cross tenants |
| Customer token tenant binding | 🟡 Amber | Blocked only by app-layer `EnsureCustomerBelongsToCurrentStore`; no DB token scoping |
| Eloquent scope coverage | 🔴 Red | Two controllers bypass the scope on numeric IDs; fail-open when uninitialized |
| Storefront tenant resolution | 🟡 Amber | `X-Tenant` header trusted above host, no allowlist |
| Auth hardening | 🔴 Red | `MASTER_OTP` backdoor, never-expiring `*` customer tokens, wildcard CORS |
| Rate limiting | 🟡 Amber | Admin auth throttled; customer auth surface unthrottled |

---

## 2. How tenant resolution & isolation actually work today

### 2.1 Resolution chain

**Path 1 — Admin & store-admin** (`routes/api.php`, `routes/store-api.php`)
- `routes/tenant.php:20` wraps `routes/api.php` in `InitializeTenancy::class`; `routes/api.php:101` wraps the same content *again* in `InitializeTenancy` (dual loading — see §7).
- `InitializeTenancy.php:19-20`: `if (Auth::check() && Auth::user()->tenant_id) tenancy()->initialize(Auth::user()->tenant_id)`. **Host/header/subdomain are irrelevant here.**
- Admin route stack: `['auth:sanctum','valid.auth','tenant.subscription','tenant.approved']` (`routes/api.php:122`).

**Path 2 — Storefront** (`routes/frontstore.php`)
- `InitializeStorefrontTenancy.php:55-79` resolves a domain string in priority order: (1) `X-Tenant` header (`:58`), (2) `X-Store-Id`/`store_id` → `Store.uuid` → linked domain (`:63`), (3) `getHost()` (`:78`).
- Resolved domain → `domains` table (cached 5 min, `:93-97`), then subdomain fallback against `{sub}.{app.base_domain}` (`:136-156`).
- On success: `tenancy()->initialize($tenant)` and stashes `store_id`/`store_uuid`/`store` on request attributes (`:33-37`).
- A third fallback exists: `initFromBearerToken` (`:183-208`) initializes tenancy from an admin api-guard token when no header is present (designer cross-origin case). Scoped to the user's own tenant, so not cross-tenant.

### 2.2 Model scoping (the only real enforcement layer)

- Tenant-owned models use `BelongsToTenant` (e.g. `Order.php:24`, `OrderStatus.php:10`, `Notification.php:11`). `bootBelongsToTenant()` (`vendor/.../BelongsToTenant.php:22-34`) adds `TenantScope` and **auto-stamps `tenant_id` on create** from `tenant()->getTenantKey()`.
- `TenantScope::apply()` (`vendor/.../TenantScope.php:14-22`) adds the `where(tenant_id = …)` clause **only if `tenancy()->initialized` is true** — otherwise it is a no-op and **nothing is filtered**.
- Models are UUID-keyed via `HasUuid` / `HasUuids` (`app/Traits/HasUuid.php:26-29` sets `getRouteKeyName()='uuid'`), so route-model-bound endpoints bind by UUID and inherit the scope. **The exception is the status controllers, which take a raw numeric `{id}`** (`routes/api.php:458-459`, `491-492`).

### 2.3 Cache isolation (application-level, NOT stancl-level)

- `CacheTenancyBootstrapper` is **off** (`config/tenancy.php:33`), so there is no automatic per-tenant cache tag.
- `CacheService` prefixes every key with `store_{id}:v{ver}:` (`app/Services/CacheService.php:44-49`) and tags `store_{id}` (`:60-63`). Store id comes from `StoreHelper::getCurrentStore()` (`CacheService.php:21`).
- **Fallback hazard:** unset store context resolves to the literal `'default'` (`CacheService.php:21`, `:25-26`), collapsing two tenants into a shared `store_default:` namespace.

### 2.4 Storage isolation

- `FilesystemTenancyBootstrapper` is **off**, so disk roots are *not* tenant-suffixed automatically. Isolation of files depends on application-level per-tenant paths (e.g. store-theme-branding writes `{tenant base}/branding/brand.css`). Verify those paths are relative and tenant-prefixed; an absolute path defeats isolation.

### 2.5 Queue isolation

- `QueueTenancyBootstrapper` is **off** (`config/tenancy.php:35`), so **queued jobs do NOT auto-restore tenant context.** Any Eloquent query on a `BelongsToTenant` model inside a job that did not call `tenancy()->initialize()` runs **unscoped across all tenants** (because `TenantScope` is a no-op when uninitialized).
- Only `ProcessInboundEmail.php:46` and `SendEmailCampaignJob.php:71` call `tenancy()->initialize()`. `SendAppNotification.php` does **not** — it relies on hand-written `tenant_id` filters.

### 2.6 Auth scoping

- Sanctum Bearer tokens (not SPA cookie sessions). Stateful domains list only localhost (`config/sanctum.php:18`) — confirming token mode, not cookie mode.
- `personal_access_tokens` is a **shared** table; Sanctum's `findToken()` looks up by token-hash **globally with no tenant filter**. The custom `App\Models\PersonalAccessToken` (`AppServiceProvider.php:185`) adds only `last_used_at` throttling — **no `BelongsToTenant`, no `findToken()` override**. Cross-tenant token safety rests on (a) 40-char token randomness and (b) the app-layer middleware (`EnsureCustomerBelongsToCurrentStore.php:42-56`, `InitializeTenancy.php:19`).

---

## 3. Cross-tenant attack matrix

| # | Vector | Verdict | Current defense | Remediation |
|---|--------|---------|-----------------|-------------|
| 1 | Cross-tenant IDOR on **Order statuses** (PUT/DELETE/reorder by numeric id) | 🔴 vulnerable | NONE — `OrderStatus::withoutGlobalScopes()->findOrFail($id)` on raw numeric id, no tenant re-check (`OrderStatusController.php:86,110,142,169`) | After `findOrFail`, `abort(404)` unless `!$status->is_system && (string)$status->tenant_id === (string)tenant()->getTenantKey()` |
| 2 | Cross-tenant IDOR on **Job statuses** | 🔴 vulnerable | NONE — identical pattern (`JobStatusController.php:82,103,131,154`) | Same fix as #1 |
| 3 | Universal admin **2FA bypass via `MASTER_OTP` default 702702** | 🔴 vulnerable | NONE when env unset — `$request->otp != env('MASTER_OTP', 702702)` accepted for any user (`AuthController.php:368`) | Remove the path; if break-glass needed, fail closed on empty env, restrict to non-prod, audit-log |
| 4 | **Designer-auth token expiry inverted** — expired tokens accepted forever | 🔴 vulnerable | NONE (logic bug) — `decodeTokenInternal` returns payload when expired (`DesignerAuthTokenService.php:90-98`) | `return null` when expired under `!$allowExpired`; throttle `issueAuthToken` |
| 5 | **CORS wildcard + credentials** → any origin/XSS reads API with victim token | 🟠 likely-vulnerable | WEAK — `paths/methods/origins/headers = ['*']`, `supports_credentials=true` (`config/cors.php:18-32`); tokens in non-httpOnly cookies (`useCustomerAuth.ts:56`) | Explicit origin allowlist + `allowed_origins_patterns`; narrow `paths` to `['api/*','sanctum/csrf-cookie']`; httpOnly cookies |
| 6 | **Customer login enumeration + no rate limit** → credential stuffing | 🟠 likely-vulnerable | WEAK — distinct messages (`CustomerAuthController.php:262-275`); no throttle on storefront auth routes | Generic "Invalid email or password"; add `storefront-login` limiter keyed email+IP |
| 7 | **Designer asset library leaks** one customer's uploads to all | 🔴 vulnerable | PARTIAL — `applyContextScope` commented out in `getAssets` (`DesignerController.php:969`); returns all tenant assets | Re-enable owner scoping for customer-uploaded assets; model shared clipart separately |
| 8 | **Storefront tenant spoof via `X-Tenant`/`X-Store-Id`** (reads) | 🟠 likely-vulnerable | WEAK/by-design — header trusted ahead of host (`InitializeStorefrontTenancy.php:58`) | Require internal secret on header-based resolution; otherwise fall back to `getHost()` |
| 9 | **Storefront WRITE attributed to arbitrary tenant** via spoofed header | 🟠 likely-vulnerable | WEAK — write routes under same middleware; `BelongsToTenant` auto-stamps spoofed `tenant_id` | For unauthenticated writes, validate resolved tenant matches connecting host |
| 10 | Cross-tenant **customer token replay** | 🟡 likely-blocked | `EnsureCustomerBelongsToCurrentStore.php:42-46` (string compare on `tenant_id`) on the sole `auth:customer`+`customer.store` group (`routes/frontstore.php:362`) | Add meta-test: every `auth:customer` route must also carry `customer.store`; scope token lookup by `tenant_id` |
| 11 | Cross-tenant **admin token replay** | 🟢 likely-blocked | By design — tenancy from `Auth::user()->tenant_id` (`InitializeTenancy.php:19`) | Keep; add scope assertion test |
| 12 | **Queued/console job runs unscoped** | ⚪ unverified | FRAGILE — `QueueTenancyBootstrapper` off (`config/tenancy.php:35`); scope no-op when uninitialized | Require jobs touching tenant models to call `tenancy()->initialize()`; add static lint |
| 13 | **X-Forwarded-Host spoof** drives storefront resolution | ⚪ unverified | PARTIAL — trusts proxies from `127.0.0.1`+private ranges (`bootstrap/app.php:58-63`) | Confirm edge strips client `X-Forwarded-Host` |
| 14 | **Octane stale tenant** carried into next request | ⚪ unverified | NONE if Octane enabled — HTTP path never calls `tenancy()->end()` | Confirm Octane not in prod; if it is, reset tenancy per request |
| 15 | **Domain→tenant 5-min cache** serves old tenant after reassignment | ⚪ unverified | WEAK — keyed by domain string, no invalidation (`InitializeStorefrontTenancy.php:93-97`) | Bust `storefront_domain:{domain}` on reassignment |
| 16 | **Cache key collision** via `'default'` store fallback | ⚪ unverified | WEAK — `?? 'default'` (`CacheService.php:21`) | Fail closed (throw) instead of `'default'`; ensure `setStoreId()` before `remember()` |
| 17 | **Chat JWT forged with default key `123123`** | ⚪ unverified | NONE if default not overridden (`config/app.php:144`, `.env.example:105`) | Fail boot/mint if key equals `123123` |
| 18 | **`valid.auth` no-op** → single-session not enforced | ⚪ unverified | WEAK — `EnsureValidAuth` body commented out (`EnsureValidAuth.php:11`) | Re-enable device binding or delete misleading middleware |
| 19 | **Customer tokens never expire** with `*` abilities | 🟠 likely-vulnerable | WEAK — `expiration=null` (`config/sanctum.php:49`); `createToken('customer')` no expiry | Finite `expiration`; `sanctum:prune-expired` daily; scoped abilities |

---

## 4. Prioritized gaps & remediation

### 🔴 CRITICAL

**C1 — Cross-tenant IDOR on Order AND Job custom statuses.**
`update`/`destroy`/`reorder` use `Model::withoutGlobalScopes()->findOrFail($numericId)` with no tenant ownership re-check (`OrderStatusController.php:110/142/169`, `JobStatusController.php:103/131/154`). Routes bind a raw integer `{order_status}`/`{job_status}` (`routes/api.php:458-459`, `491-492`), so a Tenant A admin can mutate/delete Tenant B's workflow statuses by guessing sequential ids.
**Fix (RECOMMENDATION):** after `findOrFail`, guard every single-row write:
```php
abort_unless(
    !$status->is_system && (string) $status->tenant_id === (string) tenant()->getTenantKey(),
    404
);
```
For `reorder`, filter each id to `(tenant_id = current OR is_system)` before updating. Keep `index()`'s `withoutGlobalScopes()` **only** to *show* `is_system` rows (`OrderStatusController.php:22-25`) — never to write across tenants. Add `tests/Feature/Security/CrossTenantIsolationTest.php` (Deliverable 2) asserting block + DB unchanged.

**C2 — Universal admin 2FA bypass via `MASTER_OTP` default 702702.**
`AuthController.php:368` accepts the hardcoded default for any user when the env is unset (it is absent from `.env`/`.env.example`).
**Fix (RECOMMENDATION):** remove the `MASTER_OTP` path entirely. If a break-glass is genuinely required: fail closed when empty (never default to `702702`), gate with `app()->environment()` (non-prod only), and audit-log every use. Separately, stop `Log::info`-ing plaintext OTPs (`AuthController.php:285,346,367`) and replace `rand()` with `random_int()` in `resendOtp` (`:339`).

**C3 — Designer-auth token expiry inverted.**
`DesignerAuthTokenService::decodeTokenInternal` (`:90-98`) returns the payload when the token *is* expired under `!$allowExpired`. Every signed designer token is valid forever, and `issueAuthToken` (unauthenticated, no throttle, `DesignerController.php:95`) re-mints from expired tokens.
**Fix (RECOMMENDATION):** change the expired branch to `return null;`; require a positive `exp`; add a throttle to `issueAuthToken`; require the `customer` guard for customer-subject tokens. Unit-test: an expired payload decodes to `null`.

### 🟠 HIGH

**H1 — CORS fully wildcard with credentials.** `config/cors.php:18-32`.
**Fix (RECOMMENDATION):** set `allowed_origins` to the explicit admin+storefront origins, `allowed_origins_patterns` to the tenant-subdomain regex, narrow `paths` to `['api/*','sanctum/csrf-cookie']`, restrict `allowed_methods`/`allowed_headers`. Move auth tokens out of non-httpOnly cookies (server-set httpOnly, or in-memory). Add a CI guard rejecting `['*']` origins with credentials.

**H2 — Customer storefront auth: no rate limit + enumeration.** `routes/frontstore.php` login/register/forgot-password unthrottled; `CustomerAuthController.php:262-275` leaks existence + provider.
**Fix (RECOMMENDATION):** add a `storefront-login` `RateLimiter` keyed email+IP: `[Limit::perMinute(500), Limit::perMinute(5)->by(strtolower($email).'|'.$ip)]`; IP throttles on register/forgot-password/google callback; Redis limiter store. Return one generic "Invalid email or password" for not-found/no-password/wrong-password; drop the Google-login hint. Surface 429 in the Vue composable with a plain-language retry message (per CLAUDE.md §0 no-raw-technical-output).

**H3 — Designer asset list leaks customer uploads.** `DesignerController.php:969` (`applyContextScope` commented out).
**Fix (RECOMMENDATION):** re-enable owner scoping for customer-uploaded assets (`saveAsset`/`uploadFile` origin). Model shared clipart as an explicit admin-curated set; return shared set + caller's own only. `deleteAsset` is already owner-scoped (`:1026-1027`) — make the list consistent.

**H4 — Storefront tenant identity selectable via attacker headers (read + write).** `InitializeStorefrontTenancy.php:58`.
**Fix (RECOMMENDATION):** only honor `X-Tenant`/`X-Store-Id` when the request carries a shared internal secret header (set by SSR/edge); otherwise fall back to `getHost()`. For unauthenticated writes, validate the resolved tenant matches the connecting host.

**H5 — Fail-open isolation across all unscoped paths.** Single-DB, all bootstrappers off (`config/tenancy.php:31-37`); jobs without `initialize()`, raw `DB::table()` missing a predicate, `withoutGlobalScopes`, and the legacy `App\Models\Admin\*` duplicates lacking `BelongsToTenant` all leak silently.
**Fix (RECOMMENDATION):** add the cross-tenant data-provider matrix test (Deliverable 2); audit every `DB::table()` on a tenant table for a `tenant_id`/`store_id` predicate (add a lint); delete or add `BelongsToTenant` to `App\Models\Admin\*` duplicates; require tenant-touching jobs to `initialize()`.

**H6 — Chat JWT default key + never-expiring customer tokens.** `config/app.php:144` (`123123`), `config/sanctum.php:49` (`null`).
**Fix (RECOMMENDATION):** fail boot/mint if chat key equals `123123`; set finite Sanctum `expiration`; schedule `sanctum:prune-expired` daily; scope abilities.

### 🟡 MEDIUM / LOW

**M1 — Defense-in-depth that is one mistake from breaking:** customer cross-tenant replay depends solely on `EnsureCustomerBelongsToCurrentStore`; `valid.auth` is a dead no-op; `X-Forwarded-Host` trust depends on the edge; the 5-min domain cache has no invalidation.
**Fix (RECOMMENDATION):** meta-test asserting every `auth:customer` route also has `customer.store`; scope token lookup by `tenant_id` on `PersonalAccessToken`; re-enable or delete `EnsureValidAuth`; confirm the LB strips client `X-Forwarded-Host`; bust `storefront_domain:{domain}` on reassignment.

**L1 — Admin `TenantController` `withoutGlobalScopes`** (`:493,526`) is legitimate landlord context — **confirm the route group is super-admin only** and unreachable by a tenant store admin.

---

## 5. OWASP A01 Broken Access Control & IDOR mapping

OWASP A01:2021 is the #1 web risk; IDOR (insecure direct object reference) is its most common concrete form. How it maps here and the cheat-sheet practices to adopt:

| OWASP A01 sub-pattern | Where it shows up here | Practice to adopt |
|---|---|---|
| **IDOR — object id from the request, no ownership check** | `OrderStatusController`/`JobStatusController` numeric-id write paths (C1) | Enforce record-level ownership on *every* mutating handler; never trust `withoutGlobalScopes()` without re-adding a tenant predicate |
| **Bypassing access control by modifying the URL / internal id** | Sequential integer ids on status routes (`routes/api.php:458`) | Use UUID route binding everywhere (the platform's own `HasUuid` invariant); the status controllers are the exception to fix |
| **Acting as another user/tenant (privilege escalation)** | `X-Tenant`/`X-Store-Id` spoof (H4); `MASTER_OTP` (C2) | Resolve tenant from the trusted host, never client-controlled body/headers; deny by default |
| **Metadata manipulation (tokens) for elevation** | Forever-valid designer tokens (C3), chat JWT `123123` (H6) | Enforce token expiry; reject default signing keys; least-privilege abilities |
| **CORS misconfiguration allowing API access from untrusted origins** | Wildcard CORS + credentials (H1) | Explicit origin allowlist; never `['*']` with credentials |
| **Force browsing to authenticated pages / API as unauthenticated** | Public storefront writes under spoofable tenant (H4/H9) | Validate tenant↔host agreement on writes |

**Cheat-sheet practices we should adopt (OWASP Authorization / IDOR / Authentication / Forgot-Password):**
1. Deny by default; enforce ownership server-side on every object access (not just list endpoints).
2. Prefer a neutral **404** over 403 for resources the caller shouldn't know exist — keeps enumeration-safe behavior (already the platform convention for designs, `DesignCustomerScopeTest.php:110`).
3. Single generic auth-failure message + uniform timing (kills enumeration, H2).
4. Layer rate-limiting *and* per-account temporary lockout with backoff; MFA is the strongest control (do not ship a static-code backdoor, C2).
5. Log access-control failures and significant security events to the existing audit log (per CLAUDE.md audit-logging invariant).

---

## 6. Sanctum hardening checklist for this app

| Item | Status | Evidence / Action |
|---|---|---|
| Pick one auth mode per consumer | 🟡 PARTIAL | Token (Bearer) mode in practice; stateful domains = localhost only (`config/sanctum.php:18`). **TODO:** decide cookie mode for first-party SPAs |
| `allowed_origins` is an explicit allowlist | ❌ TODO | `['*']` with credentials (`config/cors.php:18-32`) — fix per H1 |
| `paths` narrowed to `api/*` (+ csrf-cookie) | ❌ TODO | `['*']` today |
| Auth tokens in httpOnly cookies / in-memory | ❌ TODO | Non-httpOnly cookies (`useCustomerAuth.ts:56` admits it; `nuxt/app/stores/auth.ts:33`) |
| Token expiration set | ❌ TODO | `expiration=null` (`config/sanctum.php:49`); customer `createToken` has no expiry. Admin tokens DO expire (1d/1mo, `User.php:89`) |
| `sanctum:prune-expired` scheduled | ❌ TODO | Not scheduled — table grows unbounded |
| Least-privilege token abilities | ❌ TODO | All tokens use `['*']` (`User.php:89`, `CustomerAuthController.php:331`) |
| Tokens revoked on logout | 🟢 DONE | `currentAccessToken()->delete()` (`AuthController.php:411`, `CustomerAuthController.php:350`); login wipes prior tokens (`AuthController.php:301`) |
| Tenant binding of token lookup | ❌ TODO | `personal_access_tokens` shared; no `findToken()` override (`PersonalAccessToken.php`). Add `tenant_id` scoping for defense-in-depth |
| `SESSION_SECURE_COOKIE=true` in prod | ❌ TODO | `env(...)` default false (`config/session.php`) |
| `SESSION_DOMAIN` not a shared leading-dot parent | 🟢 DONE | `.env.example` sets null (per-host) — safe for per-tenant isolation |
| CSRF cookie issued in tenant context | ❌ TODO (if cookie mode adopted) | `sanctum 'routes'=>false` + re-register `/sanctum/csrf-cookie` in `routes/tenant.php` |
| No raw 429 to users | ❌ TODO | Surface friendly retry message in Vue composables |

---

## 7. stancl/tenancy edge-case checklist

| Edge case | Status here | Action |
|---|---|---|
| Bootstrappers enabled | ❌ ALL OFF (`config/tenancy.php:31-37`) | Single-DB scope is the *only* isolation; no DB/cache/queue/filesystem backstop. Treat the global scope as a load-bearing invariant |
| `PreventAccessFromCentralDomains` on tenant routes | ⚪ N/A on storefront path | Storefront never consults `central_domains`; `localhost` falls through to subdomain parse → `abort(404)` (`InitializeStorefrontTenancy.php:141-143`). The documented SSR-`localhost` bug is real; mitigation is `x-tenant-host`. **TODO:** add a central-domain short-circuit so it fails safe |
| Identification from trusted host, never client data | ❌ Storefront trusts `X-Tenant` first (`:58`) | Fix per H4 |
| Queue context restored in jobs | ❌ `QueueTenancyBootstrapper` off | Jobs must `tenancy()->initialize()`; pass UUIDs not serialized tenant models; re-fetch in `handle()` |
| Octane state reset between requests | ⚪ `config/octane.php` exists; HTTP never `end()`s | Confirm Octane not in prod; if it is, reset tenancy per request |
| Cache isolation via per-tenant prefix/tag | 🟡 App-level only (`CacheService` store prefix) | Never use `Cache` facade directly; ensure `setStoreId()` before `remember()`; fail closed instead of `'default'` |
| Storage per-tenant root | 🟡 App-level paths only | Store relative tenant-prefixed paths; no absolute paths in DB |
| Tenant resolver cache is central + invalidated | ❌ 5-min domain cache, no invalidation (`:93-97`) | Bust on domain reassignment |
| `Tenant` model NOT using `BelongsToTenant` | 🟢 Correct | Tenant must be resolvable without tenant context |
| PDF service (Node, shared Postgres) self-isolates | ⚪ Outside Laravel bootstrappers | Every `PdfServiceClient` call must pass + honor the tenant key for DB and S3 prefixes |

---

## 8. Rate-limiting & brute-force checklist

**Protected today** (`app/Providers/AppServiceProvider.php`):
| Limiter | Definition | Applied at |
|---|---|---|
| `api` | `:122` (300/min by user id) | global api group |
| `login` (admin) | `:150` (Lockout event + ValidationException) | `routes/api.php:113` |
| admin forgot-password | inline `throttle:5,1` | `routes/api.php:117` |
| admin verify | throttle | `routes/api.php:120` |
| `verification-notification` | `:134` | verification resend |
| `uploads` | `:138` | upload routes |
| `coupon-validate` | `:144` | coupon validation |

**Unprotected — TODO:**
| Endpoint | Location | Action |
|---|---|---|
| Customer `/auth/login` | `routes/frontstore.php:345` | Add `storefront-login` limiter (email+IP); reCAPTCHA is per-store-optional (`CustomerAuthController.php:245`) so not a reliable control |
| Customer `/auth/register` | `routes/frontstore.php:344` | IP throttle (mass-signup spam) |
| Customer `/customer/forgot-password` | `routes/frontstore.php:353` | IP/email throttle |
| `/auth/google/callback` | `routes/frontstore.php:346` | IP throttle |
| `issueAuthToken` (designer) | `routes/frontstore.php:90` | Throttle token issuance |
| `proxy-image` (designer) | `routes/frontstore.php:44` | Throttle (SSRF-guarded `:1497-1505` but open amplifier) |

**Production config:** set `config/cache.php 'limiter' => 'redis'` so counters coordinate across nodes (file/array store silently lets distributed attacks through).

---

## 9. Cross-tenant penetration test plan

**File:** `tests/Feature/Security/CrossTenantIsolationTest.php` (Deliverable 2).
**Run:** `vendor/bin/phpunit --filter CrossTenantIsolation` (uses `pgsql printflow360_test` via `.env.testing`; `DatabaseTransactions` + `Queue::fake()`, mirroring `DesignCustomerScopeTest`/`AccessControlTest`).

**What it asserts:**
1. **Direct scope assertion** — with tenancy initialized to A, `Order::find(B.id) === null` and counts exclude B's rows (proves `BelongsToTenant` is the real enforcement layer, per the no-manual-`where` invariant).
2. **API route IDOR by id** — `actingAs` an A admin (`sanctum`), PUT/DELETE `/api/v1/order-statuses/{B.id}` and `/api/v1/job-statuses/{B.id}` → expect **403/404** AND assert B's DB row unchanged/present (currently 200 + mutates — the C1 reproduction).
3. **Token/host replay** — an A admin requesting a B-owned resource by UUID resolves to A's tenancy, never B's (proves `InitializeTenancy` user-derivation, vector #11).
4. **Storefront customer scope** — customer A cannot read customer B's design (`/designer/designs/{uuid}` → 404) or notifications (forged id → safe no-op), reusing the established neutral-404 convention.
5. **Body assertions, not just status** — assert the payload omits B's data (`assertJsonMissing` / field absence), catching leaky-200/empty bugs.

**Convention:** neutral **404** for resources the attacker shouldn't know exist; **403** only where existence is already public. End tenancy in `tearDown` (guard with `if (tenancy()->initialized)`) to prevent cross-test contamination.

---

## 10. Sources

**Codebase (this repo):** `config/tenancy.php`, `config/cors.php`, `config/sanctum.php`, `config/app.php`, `bootstrap/app.php`, `app/Http/Middleware/InitializeTenancy.php`, `app/Http/Middleware/InitializeStorefrontTenancy.php`, `app/Http/Middleware/EnsureCustomerBelongsToCurrentStore.php`, `app/Http/Middleware/EnsureValidAuth.php`, `app/Http/Controllers/AuthController.php`, `app/Http/Controllers/Api/Storefront/CustomerAuthController.php`, `app/Http/Controllers/Api/Order/OrderStatusController.php`, `app/Http/Controllers/Api/Job/JobStatusController.php`, `app/Http/Controllers/Api/Storefront/DesignerController.php`, `app/Services/Storefront/DesignerAuthTokenService.php`, `app/Services/CacheService.php`, `app/Helpers/StoreHelper.php`, `vendor/stancl/tenancy/src/Database/TenantScope.php`, `routes/api.php`, `routes/frontstore.php`, `tests/Feature/Storefront/DesignCustomerScopeTest.php`, `tests/Feature/Security/AccessControlTest.php`.

**External research:**
- https://laravel.com/docs/11.x/sanctum · https://laravel.com/docs/12.x/sanctum
- https://github.com/laravel/sanctum
- https://tenancyforlaravel.com/docs/v3/integrations/sanctum/
- https://tenancyforlaravel.com/docs/v3/tenant-identification/
- https://tenancyforlaravel.com/docs/v3/routes/
- https://tenancyforlaravel.com/docs/v3/queues/
- https://tenancyforlaravel.com/docs/v3/tenancy-bootstrappers/
- https://tenancyforlaravel.com/docs/v3/single-database-tenancy/
- https://tenancyforlaravel.com/docs/v3/cached-lookup/
- https://tenancyforlaravel.com/docs/v3/testing
- https://github.com/stancl/tenancy/issues/653
- https://github.com/spatie/laravel-multitenancy/issues/246
- https://laravel.com/docs/11.x/routing#rate-limiting · https://laravel.com/docs/11.x/rate-limiting
- https://owasp.org/www-community/controls/Blocking_Brute_Force_Attacks
- https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html
- https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/04-Authentication_Testing/03-Testing_for_Weak_Lock_Out_Mechanism
- https://owasp.org/API-Security/editions/2023/en/0xa2-broken-authentication/
- https://aliengiraffe.ai/blog/authentication-is-not-isolation-the-five-tests-your-multi-tenant-system-is-probably-failing/
- https://dev.to/sharjeelz/the-laravel-queue-multi-tenancy-trap-that-cost-me-3-hours-3c3d
