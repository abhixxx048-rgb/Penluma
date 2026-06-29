# Production Readiness & Reliability Reference

> Canonical reliability reference for Print-Flow-360 (Laravel 11 + PostgreSQL, admin Nuxt, storefront Nuxt, Vue designer, Node pdf-service with BullMQ).
> Authored 2026-06-15. Based on a current-state codebase scan + web best-practice research.
> **Why this doc is serious:** print jobs are PHYSICAL. A lost order, a missing print-ready file, or a re-run of a paid job costs real money and ships the wrong thing (or nothing) to a paying customer. Reliability here is part of the fulfillment contract, not an ops nicety.

---

## 1. Executive summary

In plain language: **the platform can currently lose paying customers' data and their print-ready files with no way to get them back.** The code is well-structured (clean tenancy, services, snapshots) but the reliability *infrastructure* around it is mostly absent or wired to development-grade defaults. One app (`pdf-service`) is genuinely well-instrumented; almost nothing else is.

### Top risks, most dangerous first

1. **No database backups at all (CRITICAL - data loss).** No backup package is installed (`spatie/laravel-backup` is absent from `composer.json`), no `pg_dump`/`pg_basebackup`/WAL archiving, no scheduled backup task in `routes/console.php`, and no restore path. A search of the codebase for backup/restore/dump/snapshot returns zero matches. If either PostgreSQL instance (`live_db` central, `admin_db`) is lost or corrupted, **every tenant's orders, customers, payments, and products are gone permanently.** This is the single most dangerous finding.

2. **`QUEUE_CONNECTION=sync` (CRITICAL - paid-job loss).** All 18 queued jobs run *inline inside the web request* (`.env:57`, `.env.example:57`). There is no async execution, no retry, no `failed_jobs` capture on a mid-request crash, and a PHP timeout silently destroys the work with no trace. For anything that produces or notifies about a paid customer's file, a transient hiccup = permanently lost work, possibly *after* payment succeeded.

3. **Paid orders can be downloaded without their print-ready PDF, silently (CRITICAL - wrong/incomplete fulfillment).** `OrderController.downloadArtwork()` checks each file exists and **silently `continue`s past missing ones** (`OrderController.php:504-513`). If the `print_ready_file` link is lost (the DB update is "best-effort" and never throws - `printReadyPersistService.js:39-59`), the customer's ZIP is missing the production artwork with no warning, and the print job can proceed without production-grade files.

4. **Error monitoring is one-app-only (HIGH - blind to failures).** Only `pdf-service` has real observability (Sentry + Prometheus + health checks + correlation IDs). Laravel has local file logs + an `error_logs` DB table but **no Sentry/APM**. The storefront has Honeybadger (deferred-load, possibly unwired). The designer and docs apps have **zero** error monitoring. Backend API and designer failures are effectively invisible.

5. **Single PostgreSQL host, no replica, no failover, no PITR (HIGH).** `config/database.php` has no `read` replica array and no secondary connection; central and admin DBs sit on the same `localhost:5432`. There is no point-in-time recovery, so even with a future nightly dump the best achievable RPO would be a full day.

6. **Redis not configured; BullMQ effectively off (HIGH).** No `REDIS_*` vars in either app; cache driver is `database`. The pdf-service has full BullMQ retry/backoff infrastructure but it is **disabled by default** (no `REDIS_HOST`), so PDF generation also runs synchronously.

**Environment note:** `.env` shows `APP_ENV=development`, `APP_DEBUG=true`, file cache/session, but contains real AWS/Stripe credentials - i.e. this is a dev-configured environment in active use. The recommendations below assume you will stand up a properly-configured production environment; do not ship these dev defaults.

---

## 2. Current state

### 2.1 Backups / Disaster Recovery

| Area | Exists today | Evidence | Missing / risk |
|---|---|---|---|
| Backup tooling | **Nothing** | `composer.json` (no `spatie/laravel-backup`); `app/Console/Commands` (26 commands, none backup); grep backup/restore/dump/snapshot = 0 hits | No logical or physical backup of any DB |
| Scheduled backups | **None** | `routes/console.php:1-71` (only auth-clear, sanctum-prune, reminders, campaigns, invoices) | No backup window; nothing offsite |
| PITR / WAL archiving | **None** | `config/database.php` (no `read`/replica/failover); grep WAL = 0 | Cannot recover to a point in time |
| Read replica / HA | **None** | `config/database.php` (single host `localhost:5432`) | DB host is a single point of failure |
| File (S3) durability | S3 is primary disk | `config/filesystems.php:48-59`, `.env:56`, bucket `printflow360` | Versioning/replication/Object-Lock **not verified/enabled**; tenancy filesystem bootstrapper disabled (`config/tenancy.php:34`) so tenants likely share a bucket without disk-level isolation |
| Test DB sandbox | Separate `printflow360_test` | `.env.testing:35-45` | Useful as a restore-drill target (not yet used as one) |
| Recovery capability | **None** | grep results; no backup packages | Only recovery is manual DBA intervention |

### 2.2 Error monitoring / observability

| App | Exists today | Evidence | Missing / risk |
|---|---|---|---|
| pdf-service | **Excellent**: Sentry (uncaught/unhandled/5xx), Prometheus `/metrics`, `/health` + `/health/ready` + `/health/startup`, X-Request-Id correlation, Pino JSON logs | `pdf-service/src/lib/sentry.js:1-105`, `index.js:43,79,87-98`, `lib/metrics.js`, `routes/health.js:13-54`, `middleware/requestLogger.js:8-28` | None significant |
| Laravel API | **Moderate**: 11 log channels, `ErrorLogService` persists 5xx + unhandled to `error_logs` table, built-in `/up` health, partial X-Request-Id (forwarded *to* pdf-service only) | `bootstrap/app.php:27,82-134`, `config/logging.php`, `app/Services/ErrorLog/ErrorLogService.php:1-165`, `PdfServiceClient.php:303-305` | **No Sentry/APM**, no global request-id middleware, no `request_id` on `error_logs`, `/up` has no custom checks |
| Storefront (Nuxt) | **Weak**: Honeybadger, deferred-loaded on idle; client-error ingest endpoint exists | `frontstore/.../honeybadger.client.ts:1-24`, `StorefrontErrorLogController.php`, `package.json:40` | Honeybadger may not be reporting; no Sentry; no confirmed client→backend error flow |
| Admin (Nuxt) | (not separately evidenced) | - | No confirmed error monitoring |
| Designer (Vue) | **None** | `designer/package.json` (no Sentry/Honeybadger) | Zero visibility into a customer-facing editor |
| Docs | **None / unknown** | `docs/package.json` | Likely none |
| Distributed tracing | Partial: X-Request-Id pdf↔Laravel only | `PdfServiceClient.php:280-309` | No Sentry/Datadog/Jaeger trace stitching across the stack |

### 2.3 Queues & background work

| Area | Exists today | Evidence | Missing / risk |
|---|---|---|---|
| Laravel queue driver | `sync` (inline, no async) | `.env:57`, `.env.example:57` | No retries, no isolation, mid-request crash = silent loss |
| failed_jobs table | Defined but only fed on thrown exceptions | `0001_01_01_000002_create_jobs_table.php:37-45`, `config/queue.php:106-110` | Useless under `sync` for crashes/timeouts |
| Per-job retry/backoff | Almost none (2/18 set anything) | `SendEmailCampaignJob.php:23,25` (`$tries=1`), `CampaignDispatcherJob.php:22` (`$timeout=300`) | 16 jobs have no tries/backoff/timeout |
| Horizon | Not installed | `composer.json` (no `laravel/horizon`) | No queue UI, retry, or worker health |
| Redis | Not configured | no `REDIS_*` in `.env`/`.env.example`; `config/cache.php:18` default `database` | No persistent/Redis queue; BullMQ can't run |
| pdf-service BullMQ | Built (3 attempts, exp backoff, 7d failed / 24h completed retention) but **disabled** | `pdf-service/src/queue/pdfQueue.js:35-40`, `config/env.js:43-53` | No `REDIS_HOST` → PDF jobs run sync |
| Laravel → pdf-service calls | Synchronous HTTP, retry only on connection error (2x, 5s connect/30s req) | `PdfServiceClient.php:268-275` | No recovery on generation failure/timeout; imposition also sync (`:235-239`) |
| pdf-service flags | All delegation flags default **off**; silent fallback to DOMPDF (`strict_mode=false`) | `config/pdf_service.php:46-57` | No print jobs use pdf-service yet |
| Cross-system job tracking | None | `pdf-service/src/db/models/PDFJob.js` (own DB, not linked to `failed_jobs`) | No end-to-end job recovery between Laravel and Node |
| Worker concurrency | `WORKER_CONCURRENCY=2` (unused while BullMQ off) | `pdf-service/src/config/env.js:51` | Potential bottleneck for bulk print once enabled |

### 2.4 Print-file durability & integrity

| Area | Exists today | Evidence | Missing / risk |
|---|---|---|---|
| Generation & storage | 300-DPI PDFs (PDFKit+sharp) → per-tenant S3 or local; new timestamped file per regen | `pdfStorageService.js:40-66`, `S3Storage.js:54-69` | Old files never deleted → file proliferation on retries |
| Link to design | `persistPrintReadyFile()` writes `designer_documents.print_ready_file`; order snapshots it at checkout w/ live fallback | commit `12847afa`, `printReadyPersistService.js:28-60`, `StorefrontCheckoutController::resolveDesignPrintReadyFile()` | DB link write is **best-effort, never throws** (`:39-59`) → silent link loss |
| Corruption validation | Only `buffer.length > 0` | `pdfStorageService.js:82-84`, `pdfGenerator.js:205-211` | Malformed-but-nonzero PDF can be stored & marked complete |
| Idempotency | None - each retry regenerates a NEW file | `pdfQueue.js:36-39`, `pdfStorageService.js:25-26,81-94` | No dedup; orphan files accumulate |
| Order download w/ missing file | **Silently skipped** | `OrderController.php:504-513` | Customer ZIP missing print PDF, no indication (CRITICAL) |
| Paid-order-without-file scenario | Snapshot may be null + link may be lost → no artwork, no alert | `OrderController.php:428-440,504-513`, `printReadyPersistService.js:56-59` | Print job runs without production artwork (CRITICAL) |
| Secret coupling | `APP_KEY` + `INTERNAL_API_SECRET` must match Laravel exactly | `tokenService.js`, `internalAuth.js`, `config/env.js:22,41,88-89` | Mismatch → 401 on all `/internal/*` (ops footgun) |

### 2.5 Health / uptime

| Area | Exists today | Evidence | Missing / risk |
|---|---|---|---|
| pdf-service probes | liveness/readiness/startup with per-dependency status + latency | `routes/health.js:13-54`, `lib/healthcheck.js:17-124` | None |
| Laravel health | Built-in `/up` only | `bootstrap/app.php:27` | No readiness check (DB/Redis/queue/disk/backup), no token-gated JSON |
| Nuxt apps | - | - | No `/livez`/`/readyz` evidenced |
| External uptime/synthetics | None evidenced | - | No UptimeRobot/Better Stack, no checkout/PDF synthetic, no backup/scheduler heartbeat |

### 2.6 Deploy / infrastructure

| Area | Exists today | Evidence | Missing / risk |
|---|---|---|---|
| Environment posture | Dev-grade config in active use | `.env:1-50,161` (`APP_ENV=development`, `APP_DEBUG=true`, file cache/session, `SUBSCRIPTION_MODE=local`) | Not a hardened production env |
| Tenancy DR nuance | DB-per-tenant via stancl; `DatabaseTenancyBootstrapper` disabled | `config/tenancy.php:32,42-78`, `app/Models/Tenant.php:12-19` | Restore plan must cover central + tenant data consistently |
| IaC / secrets backup | None evidenced | - | No infra-as-code / config backup tier |
| Migration rollback strategy | 274 central migrations, no documented rollback/backup-before-migrate | `database/migrations` | Risky schema changes have no safety net |

---

## 3. Target architecture & recommendations

Sized for a **small team**: prefer managed and cheap; avoid over-engineering (no active/active, no Kubernetes complexity until revenue demands it).

### 3.1 Backups / DR - adopt a 3-tier backup model

- **Tier 1 - PostgreSQL PITR (the must-have).** Use **pgBackRest** (gold-standard, all-in-one) or **WAL-G** (simplest to S3, ideal under ~100GB) for *continuous archiving*: weekly base backup + daily incremental + WAL archiving with `archive_timeout ≈ 300s`. This gives ~5-minute RPO. If you'd rather not self-host, a **managed Postgres with PITR** (RDS/Aurora 1s–35d, Cloud SQL, DigitalOcean daily+WAL 7d, Neon) removes the operational load - strongly preferred for a small team. **Avoid Supabase free tier for production data - it has no backups/PITR.**
- **Tier 2 - Offsite logical net.** Add `spatie/laravel-backup` for nightly `pg_dump` ZIPs (DB + app files) to a **separate S3 bucket in another region**, encrypted, with **Object Lock** (immutability). This is portable and easy for single-table/single-tenant restores, but is NOT a PITR replacement (only as fresh as the last dump).
- **Tier 3 - Print-file protection.** Enable **S3 bucket versioning + cross-region (or 2nd-bucket) replication + Object Lock** on the `printflow360` bucket. Make file deletion **soft** (quarantine / lifecycle-expire after a window longer than backup retention) so a restored older DB row still finds its object.
- **Follow 3-2-1-1-0:** 3 copies, 2 media, 1 offsite, 1 immutable, 0 errors. Retention: daily 7–30d / weekly 4–12w / monthly 12mo.
- **DB + object-store consistency on restore (the project's #1 trap).** The DB stores *relative paths* (`HasImageFields`/`FileHelper`); a point-in-time DB restore does NOT roll S3 back, producing orphaned files (safe) or **missing files** (the customer-facing silent-lie class this codebase guards against). Mitigate with versioning + replication + soft-deletes + a **post-restore reconciliation job** that diffs every DB file path against the bucket **per tenant base path**, restores prior versions for missing objects, and lists orphans - surfaced in plain language, never a broken download. Also re-verify order/quote/invoice *snapshot* file references resolve after restore.
- **"A backup you've never restored isn't a backup."** Automate a **weekly restore drill** (cron/CI: restore base+WAL into a throwaway DB → integrity checks: key-table row counts, FK/constraint validation, app smoke test → DB-vs-bucket path diff → report → teardown). Use `printflow360_test` as the sandbox. Measure and trend: restore duration vs RTO, recovered point vs RPO, validation pass/fail, integrity diff, manual-step count.
- **DR strategy tier:** start at robust **Backup & Restore** with continuous archiving (hits the targets below cheaply). Graduate to **Pilot Light** (always-on replicated DB + IaC-deployable app) only when an hours-long RTO becomes unacceptable.

### 3.2 Error monitoring / observability - standardize on Sentry across all apps

- **Laravel:** `composer require sentry/sentry-laravel`, `php artisan sentry:publish`, wire `Integration::handles($exceptions)` in `bootstrap/app.php`. Keep `send_default_pii=false`; redact email/phone/address/card via `before_send` + server-side Data Scrubbing. Tag **tenant/store/user by UUID only** (matches `HasUuid`) - never email/name. Add a global request-id middleware and store `request_id` on `error_logs`.
- **Both Nuxt apps:** `@sentry/nuxt` as **separate Sentry projects** (admin vs storefront). Upload source maps on production build (the most common setup failure if skipped). Session Replay: `replaysSessionSampleRate=0`, `replaysOnErrorSampleRate=1.0`, and **do not ship replay on `/checkout`, `/cart`, `/profile` without masking review** (customer PII). Server-side Sentry needs the built `sentry.server.config.mjs` loaded via `--import`.
- **Designer (Vue) and docs:** add `@sentry/vue` - currently zero visibility into a customer-facing editor.
- **pdf-service:** already excellent; just add Sentry if not on (`@sentry/node`, `instrument.js` required FIRST, `setupExpressErrorHandler` after routes).
- **Distributed tracing:** propagate `sentry-trace` + `baggage`; add the pdf-service internal host to `trace_propagation_targets` so a Laravel→pdf-service trace stitches. Use **one canonical `SENTRY_RELEASE` (git SHA) and identical `SENTRY_ENVIRONMENT`** across all four apps or traces won't stitch.
- **Cost control:** prefer a `traces_sampler` (1.0 for errors/checkout/admin/slow paths; ~0.05–0.1 normal; 0 for `/up`, health, static, and high-volume `/info`/`/promotional-bars`/ISR routes). Sample traces, not errors.
- **Alerting:** gate on rate/severity/tags, not "any new issue"; ignore expected exceptions (Validation/404/Auth/client-abort); mark `vendor/`/`node_modules` out-of-app for grouping.

### 3.3 Queues - Redis + Horizon, idempotent jobs, alerting

- **Set `QUEUE_CONNECTION=redis`** (treat `sync` as dev-only). Run **Laravel Horizon** with a **dedicated supervisor + queue for print-file generation** so an email backlog never starves file work. Keep `failed_jobs` as the dead-letter store; prune only after alerting/retry workflows exist.
- **Dedicated, persistent, HA Redis for queues** (separate instance from cache): `appendonly yes`, `appendfsync everysec`, `maxmemory-policy=noeviction` (the only policy that keeps queue correctness), plus a replica + Sentinel/cluster. Many managed Redis ship without persistence and *with* eviction - you must set these explicitly. A clean worker restart re-runs in-flight jobs (safe if idempotent); Redis data loss without AOF loses all unpersisted jobs.
- **Idempotency is the #1 correctness rule** (both Laravel & BullMQ are at-least-once). The file-producing job must key on `order_id + file_version` (or content hash): on entry, if the print-ready file already exists, **no-op and reuse** - never regenerate, double-charge, or re-notify. Persist a "generated" marker (DB unique constraint/upsert).
- **Transactional enqueue:** set `'after_commit' => true` (or `->afterCommit()`) so a job never runs before the order+payment rows commit; consider the transactional-outbox pattern for the Laravel→Node handoff.
- **Bound every job:** `$tries` (e.g. 5), array `$backoff` with jitter (`[10,30,60,120]`), `$timeout` < worker timeout, `$failOnTimeout=true`. Wrap flaky external calls (pdf-service, S3) with `ThrottlesExceptions`. Implement `failed()` to set the order's file status to `generation_failed`, notify staff, and give the customer a recovery action - never leave a paid order silently stuck.
- **BullMQ (pdf-service):** enable by setting `REDIS_HOST`; keep attempts + exponential backoff + **jitter**; bound `removeOnComplete` (e.g. `{age:3600,count:1000}`) and keep `removeOnFail` generous (failed print jobs = paid orders needing manual recovery); trap SIGTERM → `worker.close()` for graceful drain on deploy; raise `lockDuration` above worst-case render time to avoid false stalls; return only the **relative/S3 path** in `returnvalue` (repo rule). Model the pipeline (preflight → render → thumbnail → notify) with `FlowProducer` + fail-parent.
- **Alert on three signals per queue:** backlog depth, oldest-job age (>5 min on the print-file queue = paid customers waiting), and failure/dead-letter growth. Page a human on any failed paid-order job.

### 3.4 Print-file durability - close the silent-loss gaps

- **Never silently skip a missing print file.** Fix `OrderController.downloadArtwork()` (`:504-513`) to surface a plain-language error + recovery path (re-generate / contact support) instead of `continue`.
- **Make the print-ready link write reliable.** `persistPrintReadyFile()` must retry and, on persistent failure, fail the job / flag the order - not swallow the error (`printReadyPersistService.js:39-59`).
- **Add PDF integrity validation** beyond `length>0`: verify PDF header/EOF marker (and ideally a checksum) before marking a job complete.
- **Add idempotency + cleanup** so retries reuse the existing file rather than proliferating timestamped orphans.
- **Pre-fulfillment guard:** before a print job is actioned, assert the print-ready artwork resolves in storage; block/alert if not.

### 3.5 Health / uptime - 3-tier probes + external watchers

- **Laravel:** keep `/up` as liveness; add **`spatie/laravel-health`** readiness (DB, Redis, queue, disk, backup-age) returning token-gated 200/503 JSON, plus custom S3 + pdf-service checks.
- **Nuxt + Node:** expose `/livez` (process only) and `/readyz` (deps with parallel timeouts). **Never put dependencies in a liveness probe** (a DB blip must not trigger a restart loop).
- **External:** point **UptimeRobot or Better Stack** at the readiness endpoints; **Healthchecks.io heartbeats** on backups, the scheduler, and the BullMQ worker (catches "the cron silently stopped"); a **Checkly/Playwright synthetic** for checkout + PDF generation (the revenue paths). Alerts: dedup + escalate + link a runbook.

### 3.6 Deploy / infrastructure

- Stand up a real production env: `APP_ENV=production`, `APP_DEBUG=false`, Redis-backed cache/session.
- **Infra-as-code in git** + nightly config/secret backup (Tier 2 of the backup model).
- **Backup before migrate** for risky schema changes; document rollback per migration.
- Keep `APP_KEY` and `INTERNAL_API_SECRET`/`PDF_SERVICE_INTERNAL_SECRET` in sync across Laravel and pdf-service (mismatch = 401 storm).
- Write the **DR runbook**: activation criteria; named roles (Incident Commander / Restore Operator / Comms Lead) with backups; call tree (DB host, S3, payment, DNS providers); decision tree by failure type; numbered copy-pasteable restore steps (provision host → restore base+WAL to target time → repoint at S3 → run reconciliation → repoint DNS); validation checklist; post-incident actual-vs-target review. Add a **single-tenant accidental-deletion branch** (S3 versioning + `pg_dump` filtered by `tenant_id`) - far cheaper than full PITR. Keep it in version control; rehearse during game days.

### Recommended RTO/RPO targets

| Tier | Data / system | RPO target | RTO target | How achieved |
|---|---|---|---|---|
| 1 Critical | PostgreSQL (orders, customers, payments, products) | 5 min | 1–4 hrs | Daily base backup + WAL archiving (`archive_timeout=300s`) for PITR; restore to new host |
| 1 Critical | S3 print-ready files / designs / proofs | near-zero (last write) | 1–4 hrs | S3 versioning + cross-region/2nd-bucket replication |
| 2 Important | App config, IaC, secrets, queue state | 24 hrs | 4–8 hrs | Infra-as-code in git + nightly config/secret backup |
| 3 Low | Thumbnails, derived/cache assets, regenerable renders | 24 hrs+ | best-effort | Regenerate via pdf-service; replicate only if cheap |

DB RPO can tighten to ~1 min (lower `archive_timeout` or add streaming replication) but 5 min is the cost/benefit sweet spot. Sub-30-min RTO needs warm standby - overkill until revenue justifies it.

---

## 4. Prioritized action plan

P0 = data-loss / paid-job-loss risks. One ordered list.

| Priority | Item | Why it matters for this platform (paid-print-job risk) | Rough effort |
|---|---|---|---|
| **P0** | Stand up PostgreSQL backups: managed PITR **or** self-hosted pgBackRest/WAL-G (weekly base + daily + WAL to offsite S3, encrypted) | Today a DB loss wipes every tenant's orders/customers/payments permanently - there is no recovery at all | 1–3 days (managed faster) |
| **P0** | Add Tier-2 `spatie/laravel-backup` nightly dump to a 2nd-region, Object-Lock bucket | Offsite immutable copy survives ransomware/accidental drop; enables per-tenant restore | 0.5 day |
| **P0** | Enable S3 versioning + replication + Object Lock on `printflow360`; make file deletes soft | Lost/overwritten print-ready files = wrong physical product to a paying customer; lets restore find old objects | 0.5–1 day |
| **P0** | Switch `QUEUE_CONNECTION` off `sync` (→ Redis) + run Horizon with a dedicated print-file queue | Inline jobs lose paid work on any crash/timeout, sometimes after payment, with no `failed_jobs` trace | 1–2 days (+Redis) |
| **P0** | Fix silent print-file gaps: error (not silent skip) in `downloadArtwork()` (`:504-513`); make `persistPrintReadyFile()` retry/fail instead of swallow | A paid order can be "downloaded" or printed with the production PDF silently missing | 1 day |
| **P0** | First automated **restore drill** + DR runbook (incl. DB↔S3 reconciliation, per-tenant) | An untested backup is not a backup; proves you can actually recover paid-order data before you need to | 1–2 days |
| **P1** | Idempotent file-generation job (key on order+file version; reuse existing file) + `afterCommit` dispatch | At-least-once retries must not regenerate, double-charge, or re-notify; must not run before payment commits | 1 day |
| **P1** | Sentry across Laravel + both Nuxt apps + designer (UUID-only tags, PII scrubbed, shared release/env) | Backend/designer failures are currently invisible - paid-order errors go unnoticed | 1–2 days |
| **P1** | Persistent HA Redis for queues (AOF, `noeviction`, replica), separate from cache; enable BullMQ in pdf-service | Redis is the durability boundary for queued paid-order work; default eviction/no-persistence loses jobs | 1 day |
| **P1** | Failure alerting: Horizon failed jobs + BullMQ failed set + queue depth/age → page staff; set order file status + recovery path | A failed paid-order file must page a human and never leave the order silently stuck | 1 day |
| **P1** | `spatie/laravel-health` readiness + external uptime (Better Stack/UptimeRobot) + Healthchecks.io heartbeats on backups/scheduler/worker | Detects a silently-dead scheduler/worker/backup before customers do | 1 day |
| **P1** | Bound all 18 jobs (tries/backoff+jitter/timeout/`failed()` handler) | Email/SMS/notification failures currently vanish with no retry | 0.5–1 day |
| **P2** | PDF integrity validation (header/EOF/checksum) before marking complete | Prevents storing a malformed-but-nonzero "print-ready" file that prints as garbage | 0.5 day |
| **P2** | Old print-file cleanup / dedup to stop timestamped orphan proliferation | Controls storage cost from repeated regen; complements idempotency | 0.5 day |
| **P2** | Checkout + PDF-generation synthetic monitor (Checkly/Playwright) | Catches a broken revenue path before a customer hits it | 0.5–1 day |
| **P2** | Production env hardening (`APP_ENV=production`, `APP_DEBUG=false`, IaC, secret backup) + backup-before-migrate | Removes dev-grade exposure and schema-change risk | 1 day |
| **P2** | Read replica / Pilot Light DB (graduate from backup-restore) | Only when hours-long RTO becomes unacceptable; not yet warranted | 2–4 days |

---

## 5. References

**PostgreSQL backups / PITR**
- https://www.postgresql.org/docs/current/continuous-archiving.html
- https://www.kunalganglani.com/blog/postgresql-backup-tools-compared
- https://www.percona.com/blog/postgresql-backup-strategy-enterprise-grade-environment/
- https://www.jusdb.com/blog/postgresql-point-in-time-recovery-pitr
- https://dev.to/mohhddhassan/postgresql-backups-and-point-in-time-recovery-with-pgbackrest-13gp

**Backup strategy / 3-2-1 / Laravel backup**
- https://spatie.be/docs/laravel-backup/v10/installation-and-setup
- https://opsiocloud.com/blogs/cloud-backup-strategy-3-2-1-rule-guide/

**RTO/RPO & DR strategy**
- https://www.veeam.com/blog/recovery-time-recovery-point-objectives.html
- https://www.ninjaone.com/blog/define-rto-and-rpo-across-backup-tiers/
- https://acecloud.ai/blog/rto-and-rpo-disaster-recovery/
- https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html
- https://aws.amazon.com/blogs/architecture/disaster-recovery-dr-architecture-on-aws-part-i-strategies-for-recovery-in-the-cloud/
- https://learn.microsoft.com/en-us/azure/well-architected/design-guides/disaster-recovery

**Restore testing / runbooks / DB↔S3 consistency**
- https://aws.amazon.com/blogs/storage/implementing-restore-testing-for-recovery-validation-using-aws-backup/
- https://aws.amazon.com/blogs/aws/automatic-restore-testing-and-validation-is-now-available-in-aws-backup/
- https://docs.aws.amazon.com/aws-backup/latest/devguide/restore-testing.html
- https://www.baculasystems.com/blog/backup-recovery-testing/
- https://aws.amazon.com/blogs/storage/consistent-point-in-time-restore-for-amazon-s3-buckets/
- https://docs.aws.amazon.com/aws-backup/latest/devguide/point-in-time-recovery.html
- https://www.smartsheet.com/sites/default/files/IC-Disaster-Recovery-Runbook-10506_PDF.pdf
- https://matoffo.com/how-to-create-a-disaster-recovery-dr-runbook-a-comprehensive-guide/
- https://www.datto.com/blog/optimize-rto-and-rpo/

**Sentry (Laravel / Nuxt / Express / tracing)**
- https://docs.sentry.io/platforms/php/guides/laravel/
- https://docs.sentry.io/platforms/php/guides/laravel/configuration/options/
- https://docs.sentry.io/platforms/php/guides/laravel/data-management/sensitive-data/
- https://docs.sentry.io/platforms/php/guides/laravel/tracing/distributed-tracing/
- https://nuxt.com/modules/sentry
- https://docs.sentry.io/platforms/javascript/guides/nuxt/manual-setup/
- https://docs.sentry.io/platforms/javascript/guides/nuxt/sourcemaps/
- https://docs.sentry.io/platforms/javascript/guides/express/
- https://docs.sentry.io/platforms/javascript/guides/vue/tracing/configure-sampling/
- https://docs.sentry.io/concepts/data-management/event-grouping/
- https://develop.sentry.dev/sdk/foundations/state-management/scopes/
- https://blog.sentry.io/automate-group-and-get-alerted-a-best-practices-guide-to-monitoring-your

**Queues - Laravel / Horizon / idempotency / outbox**
- https://laravel.com/docs/12.x/queues
- https://laravel.com/docs/11.x/horizon
- https://medium.com/@aiman.asfia/idempotency-in-laravel-12-2025-the-complete-guide-that-will-save-you-from-double-charges-3-am-0135d93f6dea
- https://medium.com/@mohhddhassan/transactional-outbox-idempotency-in-laravel-exactly-once-effects-over-at-least-once-f4bae734d75f
- https://prateeksha.com/blog/queues-that-dont-fail-laravel-queue-design-retries-backoff-observability

**Queues - BullMQ / Redis durability**
- https://docs.bullmq.io/guide/retrying-failing-jobs
- https://docs.bullmq.io/guide/workers/stalled-jobs
- https://docs.bullmq.io/guide/going-to-production
- https://docs.bullmq.io/guide/metrics
- https://redis.io/tutorials/operate/redis-at-scale/persistence-and-durability/
- https://www.dragonflydb.io/blog/top-5-reasons-why-your-redis-instance-might-fail

**Health / uptime / monitoring**
- https://spatie.be/docs/laravel-health
- https://uptimerobot.com/ · https://betterstack.com/ · https://healthchecks.io/ · https://checklyhq.com/

**Local source-of-truth files**
- `CLAUDE.md`, `readme/PDF_SERVICE.md`, `app/Services/PdfService/PdfServiceClient.php`, `config/pdf_service.php`
