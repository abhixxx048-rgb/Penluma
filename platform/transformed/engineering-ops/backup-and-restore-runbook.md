---
title: "Backup & Restore Runbook: The Plan You Hope to Never Use"
metaTitle: "Backup & Restore Runbook for SaaS Apps"
description: "Learn how to build a backup and restore runbook that actually works: PostgreSQL PITR, S3 versioning, restore drills, and the consistency check teams forget."
keywords:
  - backup and restore runbook
  - database backup strategy
  - PostgreSQL point-in-time recovery
  - PITR pgBackRest
  - S3 versioning backup
  - 3-2-1 backup rule
  - RPO RTO targets
  - disaster recovery plan
  - restore drill
  - SaaS data recovery
  - backup heartbeat monitoring
  - dead man's switch backup
faq:
  - q: What is the difference between a backup and a restore runbook?
    a: A backup is the saved copy of your data. A runbook is the written, step-by-step procedure for actually bringing that data back. You can have backups and still be unable to recover if no one has documented or tested the restore.
  - q: What does the 3-2-1 backup rule mean?
    a: Keep 3 copies of your data, on 2 different types of storage, with 1 copy offsite. Modern versions add "1 immutable copy" and "0 recovery errors" so a single ransomware event or human mistake cannot wipe everything.
  - q: What are RPO and RTO in disaster recovery?
    a: RPO (Recovery Point Objective) is how much data you can afford to lose, measured in time. RTO (Recovery Time Objective) is how long you can afford to be down. A 5-minute RPO and a 4-hour RTO means you may lose 5 minutes of data and need to be back within 4 hours.
  - q: How often should I test my backups?
    a: Test critical systems weekly with an automated restore into a scratch environment, and run a full hands-on "game day" monthly. As a rule, you should drill more often than your shortest retention window.
  - q: What is point-in-time recovery (PITR)?
    a: PITR lets you restore a database to an exact moment, like one minute before a bad migration ran. It works by restoring a base backup and then replaying the database's write-ahead log up to your chosen timestamp.
  - q: Why do I need to reconcile the database and file storage after a restore?
    a: Your database stores references to files, but the files live elsewhere (like S3). If you restore the database to an earlier point, it may reference files that were added or deleted later, leaving customers with broken downloads. Reconciliation finds and fixes those mismatches.
topic: engineering-ops
topicTitle: Engineering & Ops
category: Business & Growth
date: '2026-06-15'
order: 999
icon: "\U0001F6E0️"
author: Brexis Wazik
transformed: true
linked: true
sources: []
---

Picture this: it's 2:14 on a Tuesday afternoon. A teammate runs what they think is a harmless migration. A few minutes later, paid customer orders start vanishing from the dashboard. Your stomach drops.

The question that decides everything is not "do we have backups?" It's "can we actually get the data back, to the right moment, without breaking anything else?" Those are very different questions, and most teams only discover the gap during the worst hour of their year.

This is a guide to closing that gap before it opens.

## Why this matters

A backup you have never restored is not a backup. It's a hope.

Plenty of teams sleep well because a backup job runs green every night. Then disaster strikes and they learn the hard truth: the backup was missing a database, the restore takes nine hours instead of one, or the database comes back fine but every customer's file download now returns a 404.

Here's the part that stings most for a real business. Imagine a customer pays for a custom print job. The order goes through, the money clears, and the final print-ready file gets lost. Now you have a paying customer and nothing to deliver. No amount of "but the backup ran" makes that okay.

A real runbook protects three things at once:

- **Your data** (the database rows and the files they point to)
- **Your recovery time** (how fast you're back, not just that you eventually are)
- **Your trust** (a customer who never notices anything broke)

## First, an honest audit

Before writing a single recovery step, find out what you actually have today. When one real platform ran this check, the results were sobering:

- No backup tooling installed
- No continuous database archiving
- No scheduled backups at all
- File storage versioning unverified, probably off
- No alert if a backup silently failed
- No [standby database](/blog/aws-cloud-practitioner-mcq/11-amazon-rds-managed-relational-databases)

In other words, the recovery capability was zero. And nobody knew, because nothing had ever failed loudly enough to test it.

**The lesson: assume nothing.** A runbook full of confident commands is worthless if the tools those commands call don't exist yet. Mark every step that depends on unbuilt infrastructure clearly, and treat building that infrastructure as the actual first task, in order:

1. Set up a dedicated database backup repository and install the backup tool on the database host.
2. Turn on continuous write-ahead logging so you can recover to any minute.
3. Enable versioning, cross-region copies, and immutability on your file storage.
4. Add a portable database-dump safety net as a second method.
5. Wire every backup job to a "dead man's switch" that pages you if it goes quiet.
6. Stand up a throwaway environment and schedule regular restore drills.

Do these in order. Everything below assumes they exist.

## The two ideas that make recovery work

Most of a good backup strategy comes down to two simple ideas. Get these right and the rest is detail.

### Idea 1: Keep many copies, and make one untouchable

There's a classic rule called **3-2-1**, and a stronger modern version: **3-2-1-1-0**.

- **3** copies of your data
- on **2** different kinds of storage or locations
- **1** of them offsite
- **1** of them immutable (literally cannot be deleted or overwritten for a set period)
- and **0** recovery errors (because you verify, you don't assume)

Why the immutable copy matters: ransomware and panicked humans both love to delete backups. An **immutable copy** uses a storage feature, sometimes called Object Lock, that refuses all deletion for a fixed window. Even an attacker with your admin keys can't erase it. It's the difference between a locked safe and a sticky note that says "please don't take this."

### Idea 2: Recover to a point in time, not just "the last backup"

A nightly backup means that when something breaks at 4pm, you might lose a whole day. That's often unacceptable.

The fix is **point-in-time recovery (PITR)**. Think of it like a security camera for your database. A full backup is the snapshot, and the **[write-ahead log](/blog/system-design/04-databases-internals)** (a running record of every change) is the continuous footage. To recover, you restore the snapshot and then replay the footage up to the exact second you choose.

Bad migration ran at 14:07? Recover to 14:05 and it never happened.

Here's a concrete piece of how PITR gets configured in PostgreSQL. The key setting forces a log segment to be saved at least every five minutes:

```conf
archive_timeout = 300   # save a log segment at least every 5 min -> ~5 min worst-case loss
```

That single line is what turns "we lose up to a day" into "we lose at most five minutes."

## Two numbers that define your whole plan

Before you build anything, agree on two targets. They drive every decision.

- **RPO (Recovery Point Objective):** how much data you can afford to lose, in time. A 5-minute RPO means a worst case of five minutes of lost work.
- **RTO (Recovery Time Objective):** how long you can afford to be down. A 4-hour RTO means you must be back within four hours.

These are business decisions, not technical ones. A bank needs near-zero on both and pays dearly for it. A small SaaS app might happily accept "5 minutes of data loss, back within 1 to 4 hours" because the cost of doing better isn't worth it yet.

Write your targets down. Then every backup choice has a clear test: does this help us hit our RPO and RTO, or not?

## The mistake almost everyone makes: forgetting the files

Here's the trap that catches even careful teams.

Your database doesn't store your big files. It stores *pointers* to them. The customer's uploaded artwork and the final print-ready PDF live in [object storage like S3](/blog/aws-cloud-practitioner-mcq/10-amazon-s3-object-storage); the database just holds the path: `designs/123/files/print-ready.pdf`.

Now restore your database to yesterday. The database is perfect. But it references files that were deleted today, or it doesn't know about files added today. Result: a paid order whose download link points to a file that no longer exists. The page loads. The button is there. The file 404s. The customer just sees that you failed.

This is the **silent lie** class of bug, and it's the most dangerous one because everything *looks* fine.

Two safeguards fix it:

**1. Make file storage forgive deletion.** Turn on **versioning** so a delete becomes a recoverable "delete marker" instead of a real erase, and copy files to a second region automatically:

```bash
aws s3api put-bucket-versioning --bucket your-app-files \
  --versioning-configuration Status=Enabled
```

With versioning on, "undeleting" a file is just removing the delete marker. Your customer's lost artwork comes right back.

**2. Always reconcile after a restore.** This is the step people skip and regret. After any restore, run a job that:

1. Lists every file path the database expects.
2. Checks whether each file actually exists in storage.
3. For **missing** files (database says it should be there, it isn't), tries to restore the previous version; if that fails, sets a clearly recoverable status and a plain-language recovery action, and alerts staff. Never leave a broken download facing a customer.
4. For **orphans** (a file with no database row), lists them for later cleanup but never auto-deletes.
5. Reports the counts: OK, missing, restored, orphaned.

**The golden rule of restoring:** bring the database and the file storage back to the *same* moment, then reconcile. You are not "recovered" until reconciliation passes clean. Saying "the database is back" while downloads are broken isn't recovery, it's a louder kind of outage.

## Common misconceptions

**"The backup job ran, so we're safe."**
A green backup job means data was *written somewhere*. It says nothing about whether you can *read it back* into a working system within your time budget. Only a restore test proves that.

**"Backups are our disaster recovery plan."**
Backups are one ingredient. Recovery also needs documented steps, named roles, current contact numbers, and practice. The plan is the recipe; the backup is just the flour.

**"We have versioning, so files are safe forever."**
Versioning protects against overwrites and deletes, but check your retention. If old versions expire before your database backups do, you can restore an old database that points to a file version that's already gone.

**"Recovery should be fully automatic."**
For most teams, automatic *failover* is a trap. A false alarm can trigger an unnecessary, risky failover at 3am. The sweet spot is **push-button recovery**: every step is automated and ready, but a human makes the call to pull the trigger.

**"Redis losing jobs is a backup problem."**
A queue like Redis is a durability boundary, not a backup of record. The right move isn't to "restore" it but to make your jobs **[idempotent](/blog/system-design/11-distributed-transactions-and-idempotency)**, meaning running the same job twice does no harm, so you can simply re-run anything that was in flight when it crashed.

## How to use this: building your runbook

Here's the concrete path from "we hope it works" to "we know it works."

1. **Audit honestly.** List every place data lives: each database, every file storage bucket, queues, and secrets. For each, write down today's actual backup method. Be brutally honest about gaps.

2. **Set your RPO and RTO** with the business, not just engineering. Get them in writing.

3. **Turn on continuous database archiving** so point-in-time recovery becomes possible. This is the single biggest upgrade for most teams.

4. **Add a second, portable backup method.** Continuous archiving is your primary path; a plain database dump pushed to a separate offsite bucket is your independent fallback. Two methods, two locations, two regions.

5. **Protect your files:** enable versioning, cross-region replication, immutability (Object Lock), and encryption on every bucket, including any per-tenant ones.

6. **Install a dead man's switch.** Every backup job should ping a monitor on success. If the ping doesn't arrive on schedule, the monitor pages you. A silent backup failure is the worst kind, because you only discover it the day you need the backup. Monitor the scheduler itself, too, so a dead cron job gets caught.

7. **Write the restore steps as copy-pasteable commands**, including the maintenance-mode-on step at the start so nothing writes during the restore.

8. **Build the reconciliation job** that checks database-to-storage consistency. Treat it as mandatory, not optional.

9. **Drill, on a schedule.** Weekly: an automated restore of the critical tier into a scratch environment. Monthly: a full game day where a human restores everything, boots the app, and walks through a real order end to end. Never drill against production.

10. **Record every drill:** date, operator, how long it took (your real RTO), what point you recovered to (your real RPO), every check passed or failed. Keep the log in version control. A drill that didn't report its result counts as failed.

11. **Assign incident roles before you need them.** One Incident Commander who makes the calls. Restore Operators who execute and never improvise destructive steps without sign-off. A Comms Lead who shields the operators and updates customers. A Scribe who timestamps everything. Keep contact numbers stored offline, because the system you'd normally look them up in might be the thing that's down.

12. **Run a post-incident review within 48 hours.** Compare your real recovery time against your target. Every manual step you hit is a candidate for automation next time. Update the runbook in the same pull request, while the pain is fresh.

## Conclusion

If you remember one thing, make it this: **a backup is a promise, and a restore drill is the only proof you can keep it.** The teams that recover gracefully aren't the ones with the fanciest tools. They're the ones who practiced the boring restore on a quiet Tuesday, so the loud one never had a chance to surprise them.

Start small. Pick your most precious data, restore it into a throwaway environment this week, and time yourself. That one number, your real recovery time, will tell you more about your resilience than any dashboard.

And once you can reliably recover, a tempting question appears: how do you make sure you rarely *need* to? That's where the conversation shifts to [warm standbys, replicas, and high availability](/blog/system-design/08-replication-and-partitioning), the architecture of systems that bend instead of break. But that's a story for another day, and it only makes sense once the safety net below it is real.
