---
title: 'Amazon S3 Storage Classes: The Cheat Sheet That Sticks'
metaTitle: Amazon S3 Storage Classes Made Simple
description: >-
  Learn Amazon S3 the way the exam tests it: pick the right storage class,
  separate durability from availability, and never confuse S3 with EBS or EFS.
topic: aws-cloud-practitioner-mcq
topicTitle: AWS Cloud Practitioner
category: Certifications
date: '2026-06-28'
order: 9
icon: ☁️
keywords:
  - amazon s3 storage classes
  - s3 vs ebs vs efs
  - s3 durability vs availability
  - s3 glacier instant retrieval
  - s3 intelligent-tiering
  - s3 standard-ia vs one zone-ia
  - sse-s3 vs sse-kms vs sse-c
  - s3 block public access
  - s3 bucket policy vs acl
  - aws cloud practitioner s3
  - s3 lifecycle policy
  - s3 versioning
faq:
  - q: What is the difference between durability and availability in S3?
    a: >-
      Durability is the chance your data survives without being lost or
      corrupted, and every S3 class shares the same 99.999999999% (11 nines).
      Availability is whether you can reach that data right now, and it varies
      by class.
  - q: When should I use S3 Glacier Instant Retrieval instead of Standard-IA?
    a: >-
      Use Glacier Instant Retrieval for archive data you touch maybe once or
      twice a year but still need back in milliseconds. Standard-IA suits data
      accessed a few times a month with multi-AZ resilience.
  - q: What is the difference between S3, EBS, and EFS?
    a: >-
      S3 is object storage reached over HTTP, EBS is a block disk attached to
      one EC2 instance, and EFS is a shared file system many instances can mount
      at once.
  - q: Are S3 buckets public by default?
    a: >-
      No. New buckets and objects are private by default, and Block Public
      Access is turned on. Making a bucket public requires deliberately changing
      both.
  - q: Which S3 encryption option lets me control and audit the keys?
    a: >-
      SSE-KMS. It uses AWS Key Management Service keys so you can set key
      policies, rotate keys, and audit every use through CloudTrail, while AWS
      still performs the encryption.
  - q: How do I recover a file I accidentally deleted or overwrote in S3?
    a: >-
      Enable S3 Versioning before the mistake happens. It keeps every version of
      an object, so you can restore a previous copy after an accidental delete or
      overwrite.
author: Pritesh Yadav (priteshyadav444)
linked: true
transformed: true
sources: []
---

A single misplaced word on the exam can cost you the question. "Archive" makes most people reach for Glacier Deep Archive, even when the scenario quietly demands the file back in **milliseconds**. That one habit fails more S3 questions than anything else.

Amazon S3 looks simple from the outside: you drop files into buckets and grab them over the internet. The exam, though, lives in the gaps between the storage classes, the security switches, and three storage types that all sound interchangeable but are not. Get those gaps clear once, and a whole block of questions turns into easy points.

## Why this matters

S3 is one of the most heavily tested services on the AWS Cloud Practitioner exam, and it shows up constantly in real jobs too. Companies store backups, logs, website assets, and user uploads on it, and the wrong storage class can quietly multiply a bill or break an audit requirement.

The good news: almost every S3 question is really one of five small decisions in disguise. Learn the five, and you stop memorizing trivia and start reading the scenario like a map that points straight at the answer.

Here are the five things the exam keeps poking at:

- **Which storage class** fits an access pattern and budget
- **Durability vs availability** (two numbers people constantly swap)
- **S3 vs EBS vs EFS vs Instance Store** (object, block, file, temporary)
- **Encryption choices** (SSE-S3, SSE-KMS, SSE-C)
- **Access control** (Block Public Access, bucket policies, ACLs)

Let's take them one at a time.

## What "object storage" actually means

Think of S3 as a giant valet parking lot for whole files. You hand over a complete file (an **object**), you get a ticket (a **key**), and you retrieve the whole thing later through a request over the network. You never reach in and edit the middle of a file the way you would on a hard drive.

That is the core contrast the exam tests. **Object storage** (S3) keeps each file as a complete unit, bundled with its metadata and key, reached through an API or a URL. **Block storage** (EBS) hands you raw blocks you mount and format like a physical disk, so a [database](/blog/aws-cloud-practitioner-mcq/11-amazon-rds-managed-relational-databases) can write to any spot at any time.

So when a question says "mount it," "format it," or "database needs low latency," it is pointing at block storage, not S3. When it says "share a file over a link" or "virtually unlimited capacity, no servers," it is pointing at S3.

### The four storage types, kept straight

This is the quartet that trips people up. Here is the plain-language version:

- **S3 (object):** Files over HTTP, effectively unlimited, no servers. Great for backups, static sites, sharing files via URL.
- **EBS (block):** A virtual hard drive for **one** [EC2 instance](/blog/aws-cloud-practitioner-mcq/06-amazon-ec2-instances-purchasing-options). Format it, run a database on it, and it survives the instance stopping.
- **EFS (file):** A shared file system that **many** instances across Availability Zones can mount and read/write at the same time, like a shared network drive.
- **Instance Store (temporary):** Fast local disk physically attached to the instance, but the data **vanishes** when the instance stops. Only for disposable scratch or cache data.

A quick way to lock it in: "single instance + database + must persist" means **EBS**. "Many instances sharing the same files" means **EFS**. "Fast, free, throwaway cache" means **Instance Store**. "Share a file with the world over a URL" means **S3**.

## Durability vs availability: survive vs reach

This is the distinction the exam loves most, and it is genuinely worth slowing down for.

**Durability** answers: *will my data survive?* S3 advertises **11 nines** (99.999999999%) of durability, which it achieves by quietly keeping many redundant copies of every object across multiple data centers. The chance of permanently losing an object is astronomically small.

**Availability** answers: *can I reach it right this second?* This is about uptime of access, and it differs from class to class.

Here is the key fact people miss: **every S3 storage class shares the same 11 nines of durability.** A class with lower availability is not riskier for your data. It just might be momentarily unreachable a little more often. Your files are equally safe from loss either way.

So if a question says "this class has lower availability," the correct read is "slightly harder to reach sometimes, but equally protected against loss" - never "more likely to lose my data."

## Choosing the right storage class

Almost every S3 class question comes down to two sliders: **how often do you read the data** and **how fast must it come back**. Match those to cost, and the answer falls out.

### The frequent and the unknown

- **S3 Standard** - Frequent access, instant retrieval, most expensive. The default for hot data.
- **S3 Intelligent-Tiering** - For **unpredictable or changing** access patterns. It automatically moves each object between tiers based on real usage, with no retrieval fees on the frequent and infrequent tiers. When a scenario says "we don't know the pattern" or "objects suddenly get hot again months later," this is your answer. Don't reach for Standard-IA just because the word "infrequent" appears.

### The infrequent-access pair

- **S3 Standard-IA** - Accessed a few times a month, still needs **millisecond** retrieval and **multi-AZ** resilience. Cheaper storage than Standard, but it charges a per-GB retrieval fee.
- **S3 One Zone-IA** - Same infrequent profile, but stored in a **single** Availability Zone, so it is even cheaper. Use it only for data that is easy to regenerate if that one zone is lost (think thumbnails you can rebuild from originals).

The trap here: when a scenario keeps **multi-AZ protection**, the answer is Standard-IA. When it explicitly accepts single-AZ risk for reproducible data, it's One Zone-IA.

### The archive tiers

All three are for rarely-touched data. The difference is retrieval speed versus cost:

- **S3 Glacier Instant Retrieval** - Rarely accessed (a couple times a year) but still needs the file back in **milliseconds**. This is the answer when a scenario pairs "archive" with "instant access." Most people forget it exists.
- **S3 Glacier Flexible Retrieval** - Rarely accessed, and waits of **minutes to hours** are fine. Cheaper to store than Instant Retrieval.
- **S3 Glacier Deep Archive** - The **absolute cheapest** class. For data you might never read, where restore times around **12 hours** are perfectly acceptable. Think 7-year compliance logs touched only if regulators ask.

The lever to remember: among the archive tiers, **accepting slower restores buys you cheaper storage.** Faster is not "better" - it costs more, and you only pay for speed you actually need.

> **Mini case study:** A media company stores thumbnails read a few times a month, needs them in milliseconds, and wants multi-AZ safety. That's **Standard-IA**. Now change one detail - the thumbnails are trivially regenerated and single-AZ is fine - and the right answer slides to **One Zone-IA**. Change it again - they're audit logs read maybe once a year and a 12-hour wait is fine - and it becomes **Glacier Deep Archive**. Same data, three answers, driven entirely by access frequency and speed needs.

## Lifecycle and versioning: hands-off data management

Two features handle the "over time" questions.

**Lifecycle policies** automatically move objects between classes as they age and can delete them on schedule. A classic pattern: frequent for 30 days, occasional for the next 60, then archived cheaply for 7 years, then deleted - all automatically. When a question asks for **age-based, automatic** transitions with **no manual moves**, it's a lifecycle policy. You never script tier changes by hand.

**Versioning** keeps every version of an object. Overwrite a file or delete it by mistake, and the old copy is still there to restore. This is the specific answer for **recovering accidental deletes or overwrites** - not lifecycle rules, not "backups," not encryption.

## Encryption: who holds the keys

S3 offers three server-side encryption options, and the exam tells them apart by **who manages the keys**:

- **SSE-S3** - AWS creates, rotates, and manages the keys entirely. Zero effort for you. Pick this when the scenario wants "automatic encryption with no key management."
- **SSE-KMS** - Keys live in [AWS Key Management Service](/blog/aws-cloud-practitioner-mcq/05-security-identity-compliance-services), so **you** control key policies, rotation, and get a full audit trail of every key use via [CloudTrail](/blog/aws-cloud-practitioner-mcq/14-aws-cloudtrail-auditing-api-logging). Pick this when the words "control" or "audit the keys" appear.
- **SSE-C** - **You** supply your own key with every single request. AWS uses it to encrypt and decrypt but never stores it, so you keep full custody. Pick this when "customer provides the key each request and AWS doesn't store it" shows up.

The most common mix-up is SSE-S3 versus SSE-KMS. Both use AWS-managed encryption, but SSE-S3 is hands-off and silent, while SSE-KMS exists precisely so you can govern and audit the keys.

## Access control: keeping buckets private

Three mechanisms, three jobs:

- **Block Public Access** - A top-level safety switch at the account and bucket level that **overrides** any policy or ACL trying to make data public. It's the guardrail. It's on by default, and it beats any conflicting setting.
- **Bucket policy** - A single JSON document attached to a bucket. The **modern, recommended** way to manage access at scale, including granting another AWS account read access in one centralized place.
- **ACLs** - The **legacy**, per-object grant mechanism AWS now discourages. They don't scale and can be overridden by other settings.

One scenario worth internalizing: an admin turns off Block Public Access and writes a public-read policy for a static site. Months later, someone uploads sensitive files to that same bucket and they're exposed. The lesson is that a bucket policy applies **broadly** to the bucket, so anything you add later inherits the exposure. **Mixing public and private data in one bucket is risky**, and turning off Block Public Access removed the net that would have caught it. Separate public and private data into different buckets.

## Common misconceptions

- **"S3 buckets are public by default."** False. New buckets and objects are **private**, and Block Public Access is on. Public access requires deliberate configuration.
- **"Lower availability means my data is at greater risk of loss."** No. Durability is identical across classes; availability only affects how often you might briefly be unable to reach it.
- **"Any 'archive' question means Glacier Deep Archive."** Only if slow restores are explicitly fine. If the data must come back in milliseconds, it's Glacier Instant Retrieval.
- **"Any 'infrequent' question means Standard-IA."** Not when the pattern is unknown (Intelligent-Tiering) or single-AZ is acceptable (One Zone-IA).
- **"Encryption or versioning controls who can reach my data."** It doesn't. Public exposure is governed by policies, ACLs, and Block Public Access only.
- **"S3 can be mounted as a disk for a database."** No. That's block storage (EBS). S3 is reached over HTTP.

## How to use this

When an S3 question lands, walk this checklist:

1. **Spot the storage type first.** "Mount/format/database/single instance" → EBS. "Many instances share files" → EFS. "Fast disposable cache" → Instance Store. "File over a URL, unlimited scale" → S3.
2. **For a storage class, ask two questions.** How often is it read? How fast must it return? Frequent → Standard. Unknown/changing → Intelligent-Tiering. A few times a month, fast, multi-AZ → Standard-IA. Same but single-AZ and reproducible → One Zone-IA. Rare but instant → Glacier Instant Retrieval. Rare, minutes-to-hours OK → Glacier Flexible. Almost never, 12 hours OK, cheapest → Deep Archive.
3. **Separate durability from availability.** If the question contrasts the two numbers, remember: same loss protection, different reachability.
4. **Decode encryption by key ownership.** No effort → SSE-S3. Control and audit → SSE-KMS. You supply the key each request → SSE-C.
5. **Match the access feature to the goal.** Account-wide guardrail → Block Public Access. Centralized or cross-account grant → bucket policy. Recover deleted files → Versioning. Auto-tiering over time → Lifecycle policy. Speed up far-away uploads → Transfer Acceleration.

Read every scenario for the deciding clue - "milliseconds," "single AZ," "audit the keys," "many instances" - and let that one phrase pick the answer.

## Conclusion

The single takeaway: **S3 questions aren't about memorizing services, they're about reading one decisive clue in the scenario and letting it choose for you.** Frequency and speed pick the storage class. Key ownership picks the encryption. The number of instances picks object, block, or file. Master those triggers and the trivia takes care of itself.

Here's a thread worth pulling next: durability protects a *single* copy of your data, but what happens when an entire AWS Region goes dark, or when you need that data physically close to users on another continent? That's where Cross-Region Replication and the [Region-and-Availability-Zone model](/blog/aws-cloud-practitioner-mcq/07-vpc-networking-fundamentals) come in - and they reshape how you think about "safe" all over again.
