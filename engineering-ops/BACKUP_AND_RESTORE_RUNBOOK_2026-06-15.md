# Backup & Restore Runbook — Print-Flow-360

> **Audience:** On-call SRE / ops engineer. This is an operational runbook — copy-pasteable commands, decision trees, drills.
> **Last reviewed:** 2026-06-15
> **Scope:** PostgreSQL (central `live_db` + `admin_db`), object storage (S3 `printflow360` — uploaded files & print-ready PDFs), Redis (queues), secrets/env.

---

## ⚠️ Current state — read this first

A codebase scan on 2026-06-15 found **no backup tooling installed and no recovery capability**:

| Capability | State today | Risk |
|---|---|---|
| `spatie/laravel-backup` | **Not installed** | Critical |
| WAL archiving / PITR (pgBackRest / WAL-G) | **Not configured** | Critical |
| Scheduled backups | **None** (`routes/console.php` has no backup task) | Critical |
| S3 bucket versioning / replication / Object Lock | **Not verified / likely off** | High |
| Redis for queues | **Not configured** — `QUEUE_CONNECTION=sync` | High |
| Backup heartbeat / dead-man's-switch | **None** | High |
| Read replica / standby | **None** | High |

**Every section below marked `⚠️ Prerequisite: not yet set up` is the TARGET procedure.** It will not run until the prerequisite is installed/configured. Do the prerequisites in this order before relying on any restore:

1. Provision a **dedicated PostgreSQL backup repository** (separate host or S3 bucket) + install **pgBackRest** on the DB host.
2. Enable **WAL archiving** in `postgresql.conf` (`archive_command`, `archive_timeout=300`).
3. Enable **S3 versioning + cross-region replication + Object Lock** on `printflow360`.
4. Install **`spatie/laravel-backup`** as the portable logical-dump safety net.
5. Wire **backup heartbeats** to a dead-man's-switch (Healthchecks.io / Better Stack).
6. Stand up a **scratch restore environment** and schedule the **restore drill**.

---

## 1. What we back up & where

### 1.1 Inventory

| # | Asset | What it holds | Location | Backup method (target) |
|---|---|---|---|---|
| 1 | **PostgreSQL `live_db`** | Central app data + tenant metadata (`tenants` table) + all tenant business rows. 122/126 models are shared-DB with `tenant_id` (`BelongsToTenant`), so **one PITR covers all tenants at the same timestamp**. | PG host `:5432`, db `live_db` | pgBackRest base + WAL (PITR) **and** nightly `pg_dump` (portable) |
| 2 | **PostgreSQL `admin_db`** | Super-admin / SaaS-landlord operations | PG host `:5432`, db `admin_db` | Same as `live_db` (add to pgBackRest stanza + nightly dump) |
| 3 | **Object storage — uploaded files** | Customer uploads, product images, branding (`{tenant}/branding/brand.css`). DB stores **relative paths only**; bytes live here. | S3 bucket `printflow360` | Versioning + cross-region replication + Object Lock |
| 4 | **Object storage — print-ready PDFs** | Paid-order production artwork: `designs/{design_id}/files/print-ready-{ts}.pdf`, linked via `designer_documents.print_ready_file` and snapshotted onto orders. **Loss after payment = customer never gets what they bought.** | S3 bucket `printflow360` (per-tenant prefix; pdf-service may use per-tenant buckets) | Versioning + replication + Object Lock (longer retention) |
| 5 | **Redis (queues)** | In-flight BullMQ jobs (pdf-service) + Laravel queue once moved off `sync` | Redis (queue-dedicated instance) | AOF persistence; **treated as recoverable-by-replay, not as a backup of record** |
| 6 | **Secrets / env** | `.env` (all 5 apps), `APP_KEY`, `PDF_SERVICE_INTERNAL_SECRET`, AWS/Stripe/gateway keys | Host filesystem + secrets manager | Secrets manager + encrypted nightly snapshot; IaC in git |

> **Note on tenancy model:** `config/tenancy.php` ships the stancl `PostgreSQLDatabaseManager` (database-per-tenant capability), but `DatabaseTenancyBootstrapper` is **commented out** and 122/126 models carry `tenant_id` — i.e. the running model is **shared DB, row-scoped by `tenant_id`**. The runbook assumes shared-DB. If per-tenant databases are ever enabled, every restore step that names `live_db` must be repeated per tenant database, and §3.3 (single-tenant restore) changes from a row filter to a per-database restore.

### 1.2 Retention & 3-2-1(-1-0)

Target: **3** copies, on **2** media/locations, **1** offsite, **1** immutable (Object Lock), **0** errors (heartbeat-verified).

| Asset | Daily | Weekly | Monthly | Offsite / immutable |
|---|---|---|---|---|
| PG base backup (pgBackRest) | full daily | — | — | repo in 2nd region; Object Lock |
| PG WAL (PITR) | continuous (`archive_timeout=300s`) | — | — | same repo, immutable |
| PG logical dump (spatie/pg_dump) | 7 days | 4 weeks | 12 months | separate S3 bucket, different region, Object Lock |
| S3 file objects | versioned (every write) | — | — | cross-region replica + Object Lock |
| Secrets/env snapshot | nightly | — | 12 months | secrets manager + encrypted offsite |

- **RPO targets:** DB ≈ **5 min** (WAL); object files ≈ **near-zero** (versioning + replication).
- **RTO targets:** core DB + storefront ≈ **1–4 hrs** (backup-restore tier; no warm standby yet).
- **Encryption:** all backups encrypted at rest (pgBackRest `--repo-cipher-type=aes-256-cbc`; S3 SSE).

---

## 2. Backup procedures

### 2.1 PostgreSQL — continuous archiving + PITR (pgBackRest)

> ⚠️ **Prerequisite: not yet set up.** Requires pgBackRest installed, a repo (S3 or 2nd host), and WAL archiving enabled in `postgresql.conf`.

**Step A — enable WAL archiving** in `postgresql.conf` (then `systemctl restart postgresql`):

```conf
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'pgbackrest --stanza=printflow archive-push %p'
archive_timeout = 300            # forces a WAL segment at least every 5 min -> ~5 min RPO
max_wal_senders = 3
```

**Step B — pgBackRest config** (`/etc/pgbackrest/pgbackrest.conf`):

```ini
[global]
repo1-path=/var/lib/pgbackrest
repo1-type=s3
repo1-s3-bucket=printflow360-pgbackrest
repo1-s3-region=us-east-1
repo1-s3-endpoint=s3.us-east-1.amazonaws.com
repo1-retention-full=4              # keep 4 full backups (≈ weekly fulls -> ~1 month)
repo1-cipher-type=aes-256-cbc
repo1-cipher-pass=<from secrets manager>
start-fast=y

[printflow]
pg1-path=/var/lib/postgresql/16/main
pg1-port=5432
```

**Step C — create stanza & first full backup:**

```bash
sudo -u postgres pgbackrest --stanza=printflow stanza-create
sudo -u postgres pgbackrest --stanza=printflow --type=full backup
sudo -u postgres pgbackrest --stanza=printflow check     # verifies archive_command works
```

**Step D — schedule** (cron on the DB host). Heartbeat ping wraps each run (see §2.4):

```cron
# Weekly full (Sun 02:00), daily incremental (02:00 other days)
0 2 * * 0  postgres  pgbackrest --stanza=printflow --type=full backup && curl -fsS https://hc-ping.com/<PG_FULL_UUID> || curl -fsS https://hc-ping.com/<PG_FULL_UUID>/fail
0 2 * * 1-6 postgres pgbackrest --stanza=printflow --type=incr backup && curl -fsS https://hc-ping.com/<PG_INCR_UUID> || curl -fsS https://hc-ping.com/<PG_INCR_UUID>/fail
```

### 2.2 PostgreSQL — portable logical dumps (safety net)

WAL/PITR is the primary recovery path; logical dumps are the **portable, schema-version-independent** net and the basis for single-tenant extraction. Two ways to run them:

**Option 1 — `spatie/laravel-backup` (preferred; ships DB + app files to offsite S3):**

> ⚠️ **Prerequisite: not yet set up.** `composer require spatie/laravel-backup`, publish config, point `backup.destination.disks` at a **separate** offsite S3 bucket (different region, Object Lock), set `backup.backup.source.databases => ['pgsql','admin_pgsql']`.

```bash
php artisan backup:run            # dump DB(s) + bundle to timestamped zip -> offsite S3
php artisan backup:run --only-db  # DB only (faster, what the nightly cron uses)
php artisan backup:clean          # apply retention (daily 7 / weekly 4 / monthly 12)
php artisan backup:list           # show what exists + health
```

Schedule in `routes/console.php` (this is the missing piece today):

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('backup:clean')->dailyAt('01:30');
Schedule::command('backup:run --only-db')->dailyAt('02:00')
    ->onSuccess(fn () => Http::get('https://hc-ping.com/<SPATIE_DB_UUID>'))
    ->onFailure(fn () => Http::get('https://hc-ping.com/<SPATIE_DB_UUID>/fail'));
Schedule::command('backup:run')->weeklyOn(0, '03:00');   // full DB+files weekly
```

> ⚠️ **Prerequisite gotcha:** `Schedule::` only fires if the system cron runs `php artisan schedule:run` every minute, **and** the scheduler itself is heartbeat-monitored (§2.4). With `QUEUE_CONNECTION=sync`, `backup:run` runs inline — acceptable for nightly batch, but move queues to Redis before relying on async backup jobs.

**Option 2 — raw `pg_dump` (no extra packages; use when spatie isn't installed yet):**

```bash
# Custom format (-Fc) = compressed, parallel-restorable, selective. Run as a role with read on all schemas.
TS=$(date +%Y%m%dT%H%M%SZ)
PGPASSWORD=$DB_PASS pg_dump -h "$DB_HOST" -p 5432 -U "$DB_USER" -Fc -Z6 -f "/backups/live_db-$TS.dump" live_db
PGPASSWORD=$ADMIN_DB_PASS pg_dump -h "$ADMIN_DB_HOST" -p 5432 -U "$ADMIN_DB_USER" -Fc -Z6 -f "/backups/admin_db-$TS.dump" admin_db
# Encrypt + push offsite (different region bucket with Object Lock)
gpg --encrypt --recipient ops@printflow ... "/backups/live_db-$TS.dump"
aws s3 cp "/backups/live_db-$TS.dump.gpg" s3://printflow360-db-backups/daily/ --region eu-west-1
```

### 2.3 Object storage (S3) — versioning, replication, Object Lock

> ⚠️ **Prerequisite: not yet set up.** Enable on bucket `printflow360`. Object versioning makes a point-in-time bucket view reconstructable and turns deletes into recoverable delete-markers — this is what keeps DB-referenced print files restorable.

```bash
# Versioning (delete becomes a recoverable delete-marker, not a real delete)
aws s3api put-bucket-versioning --bucket printflow360 \
  --versioning-configuration Status=Enabled

# Cross-region replication to a 2nd-region bucket (near-zero object RPO)
aws s3api put-bucket-replication --bucket printflow360 \
  --replication-configuration file://replication.json

# Object Lock (immutability) — must be enabled at/after bucket creation with versioning on
aws s3api put-object-lock-configuration --bucket printflow360 \
  --object-lock-configuration '{"ObjectLockEnabled":"Enabled","Rule":{"DefaultRetention":{"Mode":"GOVERNANCE","Days":35}}}'

# Server-side encryption
aws s3api put-bucket-encryption --bucket printflow360 \
  --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"aws:kms"}}]}'
```

> **Soft-delete print files** rather than hard-deleting: if the app/pdf-service ever deletes objects, route them through a lifecycle-expire quarantine (window **longer than DB backup retention**) so a restored older DB row still finds its object. Per-tenant buckets used by pdf-service must each get the same versioning + replication config — enumerate them.

### 2.4 Backup heartbeat (dead-man's-switch)

> ⚠️ **Prerequisite: not yet set up.** A silent backup failure is the worst failure. Each scheduled job pings a heartbeat on success; if the ping doesn't arrive in the expected window, the monitor pages you.

- Create one check per job in **Healthchecks.io** (or Better Stack): `pg-full`, `pg-incr`, `spatie-db-nightly`, `s3-replication-lag`, `laravel-scheduler`.
- Success ping at end of job; failure ping (`/fail` URL) in the error branch (see crons in §2.1/§2.2).
- Add a **scheduler heartbeat** so a dead `schedule:run` cron is caught:
  ```cron
  * * * * * cd /var/www/printflow && php artisan schedule:run >> /dev/null 2>&1 && curl -fsS https://hc-ping.com/<SCHEDULER_UUID>
  ```
- Recommended belt-and-braces: install `spatie/laravel-health` with the `BackupsHealthCheck` so `/up`-style readiness also reports "last backup age" and goes 503 if the newest backup is stale.

---

## 3. Restore procedures

> **Golden rule:** restore **DB and object storage to a consistent point**, then run the **reconciliation job** (§3.5). A DB restored to time *T* can reference files added/deleted after *T* → orphaned (safe) or **missing** (customer-facing breakage). Never declare "recovered" before reconciliation passes.

### 3.1 Full database restore (latest good backup, pgBackRest)

```bash
# 1. Stop the app (maintenance mode) so nothing writes during restore.
php artisan down --secret="restore-2026" --render="errors::503"

# 2. Stop Postgres and restore the latest backup into the data dir.
sudo systemctl stop postgresql
sudo -u postgres pgbackrest --stanza=printflow --delta restore

# 3. Start Postgres; it replays WAL to the end of the backup automatically.
sudo systemctl start postgresql

# 4. Sanity: connect and confirm key tables exist + row counts look sane.
psql -h localhost -U "$DB_USER" -d live_db -c "SELECT count(*) FROM tenants;"
psql -h localhost -U "$DB_USER" -d live_db -c "SELECT count(*) FROM orders;"

# 5. Reconcile files (§3.5), then bring app up.
php artisan up
```

**From a logical dump instead** (portable / cross-version):

```bash
createdb -h localhost -U "$DB_USER" live_db_restored
pg_restore -h localhost -U "$DB_USER" -d live_db_restored --jobs=4 --clean --if-exists /backups/live_db-<TS>.dump
```

### 3.2 Point-in-time recovery (PITR) to a timestamp

Use when you must recover to **just before** a bad event (e.g. a destructive migration at 14:07).

```bash
php artisan down --secret="restore-2026"
sudo systemctl stop postgresql

# Restore base + tell PG to replay WAL only up to the target time.
sudo -u postgres pgbackrest --stanza=printflow \
  --type=time --target="2026-06-15 14:05:00+00" \
  --target-action=promote --delta restore

sudo systemctl start postgresql
# PG replays WAL to 14:05:00 then promotes. Verify the bad change is gone:
psql -h localhost -U "$DB_USER" -d live_db -c "SELECT max(created_at) FROM orders;"
```

- **Target options:** `--type=time` (timestamp), `--type=xid` (transaction id), `--type=lsn`, or `--type=immediate` (end of base backup).
- After promotion the timeline diverges — take a **fresh full backup immediately** so future PITR works from the new timeline.
- **RPO note:** you can only recover to a moment covered by archived WAL; with `archive_timeout=300` the worst-case gap is ~5 min.

### 3.3 Single-tenant restore (one tenant asks to undo a deletion)

Cheaper than a full PITR. Two paths depending on blast radius:

**Path A — restore specific tenant rows from a logical dump** (shared-DB model). Restore the whole dump to a **scratch** DB, then copy back only the affected tenant's rows:

```bash
# 1. Restore yesterday's dump into a throwaway DB (does NOT touch prod).
createdb -h localhost -U "$DB_USER" live_db_scratch
pg_restore -h localhost -U "$DB_USER" -d live_db_scratch --jobs=4 /backups/live_db-<TS>.dump

# 2. Inspect the tenant's data in the scratch DB.
psql -d live_db_scratch -c "SELECT count(*) FROM orders WHERE tenant_id = '<TENANT_UUID>';"

# 3. Export just that tenant's affected table(s) and re-insert into prod.
#    (Do this per table, respecting FK order; wrap in a transaction; dry-run first.)
pg_dump -h localhost -U "$DB_USER" -d live_db_scratch \
  --data-only --table=orders \
  | ... filter to tenant_id = '<TENANT_UUID>' ... \
  | psql -d live_db   # into prod, inside BEGIN; ... COMMIT;
```

> ⚠️ Re-inserting rows risks PK/unique collisions and FK violations. Always: scratch-restore → diff → script the minimal `INSERT ... ON CONFLICT` / `UPDATE` → run inside a transaction → reconcile files (§3.5). If unsure, prefer full PITR to just-before-deletion (§3.2).

**Path B — if per-tenant databases are ever enabled:** restore that tenant's database from its own pgBackRest stanza / dump; no row filtering needed.

**Recover the tenant's deleted files** from S3 versioning (delete-markers):

```bash
# List versions/delete-markers under the tenant prefix and remove the delete-marker to "undelete".
aws s3api list-object-versions --bucket printflow360 --prefix "<TENANT_UUID>/" \
  --query "DeleteMarkers[].{Key:Key,VersionId:VersionId}"
aws s3api delete-object --bucket printflow360 --key "<KEY>" --version-id "<DELETE_MARKER_VERSION_ID>"
```

### 3.4 Restoring object-storage files

```bash
# Full bucket restore from cross-region replica (DR region) back to primary:
aws s3 sync s3://printflow360-replica/ s3://printflow360/ --source-region eu-west-1 --region us-east-1

# Restore a single object to a prior version (e.g. a corrupted print-ready PDF):
aws s3api list-object-versions --bucket printflow360 \
  --prefix "designs/<DESIGN_ID>/files/" --query "Versions[].{Key:Key,VersionId:VersionId,LastModified:LastModified}"
aws s3api copy-object --bucket printflow360 \
  --copy-source "printflow360/designs/<DESIGN_ID>/files/print-ready-<ts>.pdf?versionId=<GOOD_VERSION_ID>" \
  --key "designs/<DESIGN_ID>/files/print-ready-<ts>.pdf"
```

### 3.5 Post-restore reconciliation (mandatory — DB ↔ storage consistency)

> ⚠️ **Prerequisite: build this as an artisan command** (e.g. `php artisan storage:reconcile`). It is the safeguard against the project's "silent-lie" bug class — a paid order whose print file 404s on download.

What it must do, **per tenant base path**:

1. Enumerate every DB-stored relative path: `designer_documents.print_ready_file`, order `design_print_ready_file` snapshots, and every `HasImageFields` column across models.
2. Diff each against actual bucket contents (`aws s3 ls` / `Storage::exists`).
3. **Missing files** (DB row → no object): attempt restore of the object's prior version from S3 versioning; if unrecoverable, set the order/design file status to a recoverable state and surface a plain-language recovery action — **never** leave a broken download. Notify staff for paid orders.
4. **Orphans** (object → no DB row): list for later cleanup (do not auto-delete).
5. Confirm order/quote/invoice **snapshot** file references still resolve.
6. Emit a report (counts of OK / missing / restored / orphaned) to logs + alert channel.

Manual spot-check meanwhile:

```bash
psql -d live_db -t -c "SELECT print_ready_file->>'image' FROM designer_documents WHERE print_ready_file IS NOT NULL;" \
| while read p; do aws s3 ls "s3://printflow360/$p" >/dev/null 2>&1 || echo "MISSING: $p"; done
```

---

## 4. Restore DRILL / verification

> **"A backup you've never restored isn't a backup."** Validate *recoverability*, not just that backup jobs ran green.

### 4.1 Cadence

- **Weekly:** automated drill of the critical tier (DB PITR into scratch + smoke checks).
- **Monthly:** full game-day — restore DB **and** object storage into an isolated scratch env, boot the app, walk a real order. Drill more often than the shortest retention window.

### 4.2 Scratch-env drill procedure

> Use the existing test DB pattern as the sandbox: `.env.testing` → `printflow360_test` on pgsql. Never point a drill at prod.

```bash
# 1. Restore latest base + WAL to a scratch instance / DB.
sudo -u postgres pgbackrest --stanza=printflow --type=time \
  --target="$(date -u -d '10 min ago' +'%Y-%m-%d %H:%M:%S+00')" \
  --target-action=promote --delta restore   # against a scratch PGDATA, not prod

# 2. Restore a slice of object storage into a scratch bucket.
aws s3 sync s3://printflow360-replica/designs/ s3://printflow360-drill/designs/ --region eu-west-1

# 3. Boot the app against scratch DB + scratch bucket.
APP_ENV=drill DB_DATABASE=live_db_drill FILESYSTEM_DISK=s3 AWS_BUCKET=printflow360-drill \
  php artisan optimize:clear && php artisan up && curl -fsS http://localhost:8000/up
```

### 4.3 What to verify (record every value, trend over time)

| Check | How | Pass criteria |
|---|---|---|
| **Restore duration** (RTO) | wall-clock of steps 1–3 | ≤ 4 hr target; flag regressions as data grows |
| **Recovered point** (RPO) | `SELECT max(created_at) FROM orders;` vs intended | gap ≤ 5 min |
| **Key row counts** | `tenants`, `orders`, `customers`, `designer_documents`, `invoices` | within expected delta of prod |
| **Constraint/FK integrity** | `psql -d live_db_drill -c "SET CONSTRAINTS ALL IMMEDIATE;"` + sample joins | no violations |
| **A known order's print file opens** | pick a paid order UUID; resolve its `design_print_ready_file`; download from scratch bucket; open the PDF | valid, non-zero, opens in a reader |
| **App boots** | `curl /up` 200; load a storefront page; log in to admin | no 5xx |
| **DB↔storage diff** | run reconciliation (§3.5) against scratch | 0 missing for the restored slice |
| **Manual-step count** | count steps needing a human | trend down (each = future automation target) |

### 4.4 Recording results

> ⚠️ **Prerequisite: not yet set up.** Append each drill to a tracked log + push the pass/fail to the heartbeat monitor so a silent drill failure is impossible.

Record per drill: date, operator, backup-set used, restore duration, recovered point, every check pass/fail, anomalies, follow-up actions. Keep the log in version control (e.g. `readme/drills/` or an ops sheet). A drill that didn't report its result counts as **failed**.

### 4.5 Teardown

```bash
dropdb live_db_drill; aws s3 rb s3://printflow360-drill --force
```

---

## 5. Disaster scenarios playbook

> Decision entry point: identify the scenario, declare severity, page the Incident Commander, then follow the branch. Default to **manually-initiated, push-button** recovery (automated steps, human decision) — no auto-failover on false alarms.

### 5.1 Prod DB corrupted / data loss
- **RTO 1–4 hr · RPO ≤ 5 min**
1. `php artisan down` — stop writes immediately.
2. Determine corruption time. If a specific bad event → **PITR to just-before** (§3.2). If general corruption → **full restore latest** (§3.1).
3. Take a fresh full backup post-promotion.
4. Run reconciliation (§3.5).
5. `php artisan up`; verify §4.3 checks; post status update.

### 5.2 Accidental tenant data deletion (one tenant)
- **RTO 1–2 hr · RPO ≤ 24 hr (last dump) or ≤ 5 min (PITR)**
1. Identify `tenant_id` + tables affected + deletion time.
2. Scratch-restore yesterday's dump (§3.3 Path A); do **not** touch prod yet.
3. Diff scratch vs prod for that tenant; script minimal re-insert/update inside a transaction.
4. Undelete the tenant's files from S3 versioning (§3.3).
5. Reconcile (§3.5); confirm with the tenant.
- If the deletion also corrupted shared data or the scope is large → escalate to full PITR (§3.2).

### 5.3 Lost/corrupt print file after payment
- **RTO < 1 hr · RPO near-zero (versioning)** — customer-facing; high priority.
1. Resolve the order's `design_print_ready_file` (or live `designer_documents.print_ready_file`).
2. Restore the object's prior good version from S3 versioning (§3.4).
3. If no prior version exists → **regenerate** via pdf-service for that design (idempotent, keyed on design/order), then re-link.
4. Run reconciliation for that order; confirm the customer download opens; notify the print shop.
5. Never let the customer see a silently-missing file — set a recoverable status + recovery action meanwhile.

### 5.4 Redis loss (in-flight queue jobs)
- **RTO < 30 min · RPO = unpersisted jobs (minimize with AOF)**
1. Redis is the **durability boundary**, not a backup of record. With AOF (`appendfsync everysec`) + `noeviction`, a clean restart recovers persisted jobs; BullMQ stalled-job recovery re-runs in-flight jobs (safe **only if jobs are idempotent**).
2. If Redis data is truly lost: identify paid orders whose print-file job was in-flight (cross-check `orders`/`designer_documents` file status against expected). Re-enqueue generation for any order missing its print-ready file (idempotent → no double work).
3. Verify queue depth/age return to normal; alert if oldest waiting job > 5 min.
> ⚠️ **Prerequisite:** Redis must be configured with AOF + `noeviction` on a **dedicated, HA (replica + Sentinel)** instance separate from cache. Today queues run `sync` — there is nothing to recover, but a crashed web request silently loses the job. Moving critical file work to Redis + Horizon is a precondition for this scenario to even be recoverable.

### 5.5 Region outage
- **RTO 1–4 hr · RPO ≤ 5 min (DB WAL) / near-zero (S3 replica)**
1. Declare DR; Incident Commander activates failover.
2. Provision DB host in the DR region; restore from the cross-region pgBackRest repo + replay WAL (§3.1/§3.2).
3. Point app at the **cross-region S3 replica** bucket (`AWS_BUCKET`).
4. Restore secrets/env from secrets manager; redeploy app from IaC/git.
5. Repoint DNS / health checks to DR; run §4.3 verification; run reconciliation (§3.5).
6. Communicate ETA via status page.
> This is the **Backup & Restore** DR tier. Sub-30-min RTO would require Pilot Light / Warm Standby (always-on replicated DB + IaC-deployable app) — not warranted at current scale; revisit when an hours-long RTO becomes unacceptable.

---

## 6. Roles & comms during an incident

### 6.1 Roles (assign by expertise; name a backup for each)

| Role | Responsibility |
|---|---|
| **Incident Commander (IC)** | Declares the incident + severity, decides activation/failover, owns the decision tree, ends the incident. Single decision-maker — removes "who calls it" ambiguity. |
| **Restore Operator(s)** | Executes §3 restore steps; reports progress/blockers to IC; never improvises destructive steps without IC sign-off. |
| **Comms Lead** | Owns status page + customer/staff updates; shields operators from inbound questions. |
| **Scribe** | Timestamps every action/decision for the post-incident review and actual-vs-target RTO/RPO. |

### 6.2 Call tree / contacts

> ⚠️ **Prerequisite: fill in real contacts and keep current.** Store offline (not only in the system that may be down).

- Internal: IC, Restore Operator, Comms Lead (phone + escalation order).
- Vendors: DB host / managed PG support, S3 provider support, DNS provider, payment gateways (Stripe/Razorpay), pdf-service host.
- Monitoring: Healthchecks.io / Better Stack, Sentry (once installed) — link to the alert that fired.

### 6.3 Flow

1. Alert fires (heartbeat miss, health 503, or human report) → on-call acknowledges.
2. On-call pages **IC**; IC declares severity and assigns roles.
3. Comms Lead posts initial status ("investigating") within 15 min.
4. Restore Operator follows the relevant §5 branch; Scribe logs.
5. IC declares recovery **only after §4.3 verification + §3.5 reconciliation pass**.
6. Comms Lead posts resolution.
7. **Post-incident (within 48 hr):** compare actual vs target RTO/RPO, log lessons, file follow-ups (automate manual steps, fix gaps). Update this runbook in the same PR.

---

## Appendix — quick command reference

```bash
# Backups
pgbackrest --stanza=printflow --type=full backup        # full
pgbackrest --stanza=printflow --type=incr backup        # incremental
pgbackrest --stanza=printflow check                     # verify archiving
php artisan backup:run --only-db                         # spatie logical dump (once installed)

# Restore
pgbackrest --stanza=printflow --delta restore           # latest
pgbackrest --stanza=printflow --type=time --target="YYYY-MM-DD HH:MM:SS+00" --target-action=promote --delta restore  # PITR
pg_restore -d live_db --clean --if-exists --jobs=4 file.dump   # from logical dump

# Object storage
aws s3api list-object-versions --bucket printflow360 --prefix "<prefix>/"
aws s3 sync s3://printflow360-replica/ s3://printflow360/ --source-region eu-west-1

# App
php artisan down --secret="restore-2026"  /  php artisan up
curl -fsS http://localhost:8000/up                       # liveness
```
