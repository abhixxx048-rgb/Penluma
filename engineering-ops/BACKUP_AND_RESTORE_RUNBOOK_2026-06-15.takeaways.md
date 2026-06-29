**This document is a step-by-step guide for how to back up all the data in Print-Flow-360 and how to bring it back if something goes wrong. It matters because right now the platform has NO backups set up at all — if the database crashed today, every order, customer, and uploaded file would be permanently lost.**

**The main parts explained simply:**

- **Current state (critical warning)** — A check done on 15 June 2026 found that zero backup tools are installed. There are no scheduled backups, no database recovery tools, and no protection on uploaded files. This is the most urgent finding in the whole document.

- **What gets backed up** — Four things need protection: the main database (all tenant orders, customers, products), the admin database, uploaded files and print-ready PDFs stored in Amazon S3 (cloud file storage), and the app's secret keys. If the print-ready PDF for a paid order is lost, that customer never gets what they bought.

- **Database backup with pgBackRest** — A tool called pgBackRest saves a copy of the database every day and also records every change made in between. This means you can roll the database back to any point in the last few days — even to one minute before a mistake happened. Target: at most 5 minutes of data lost.

- **Database backup with logical dumps** — A simpler backup method (called pg_dump or spatie/laravel-backup) that saves a plain copy of the database once a day. Less powerful than pgBackRest but portable and easy to move offsite. Acts as a safety net.

- **File storage backup (Amazon S3)** — Uploaded images and print PDFs live in a cloud bucket. Turning on "versioning" means every file change is kept, so deleted or overwritten files can be recovered. Replication copies everything to a second region automatically.

- **Backup heartbeat (dead-man's switch)** — A small monitoring service that expects a "ping" every time a backup runs. If the ping does not arrive, it sends an alert. Without this, a backup can silently stop working for weeks and nobody notices.

- **Restore: full database** — Step-by-step commands to bring the whole database back from the latest good backup. Takes 1–4 hours.

- **Restore: point-in-time (PITR)** — Roll the database back to an exact date and time, for example "just before a bad migration ran at 14:07." Only possible once pgBackRest and WAL archiving are set up.

- **Restore: one tenant's data** — If a single store owner accidentally deletes their records, you can recover just their rows from a backup without touching any other tenant's data.

- **Post-restore reconciliation** — After any restore, the database and the file storage may be out of sync (the database says a file exists but the file is gone). A reconciliation check compares the two and flags missing files before any customer sees a broken download.

- **Restore drills** — A backup that has never been tested is not a real backup. The runbook says to do a practice restore every week (automated) and a full game-day drill every month. Results must be recorded.

- **Disaster scenarios** — Ready-made decision trees for five situations: database corruption, one tenant's data accidentally deleted, a paid order's print file going missing, Redis (the job queue) losing jobs, and the whole hosting region going down.

- **Incident roles** — During an outage, four roles are assigned: Incident Commander (makes all decisions), Restore Operator (runs the commands), Comms Lead (writes status updates for customers), and Scribe (timestamps everything for the review after).

**What to do with this:** The most urgent action is to install backup tooling before anything else — start with pgBackRest and S3 versioning, then wire the daily schedule and heartbeat monitors. Until at least one verified backup exists and has been successfully restored in a drill, the platform has no recovery capability at all.
