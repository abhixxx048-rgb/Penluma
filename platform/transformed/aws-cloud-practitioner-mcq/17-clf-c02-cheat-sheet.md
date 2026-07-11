---
title: "The AWS Cloud Practitioner Cheat Sheet (CLF-C02): Every Service on One Page"
metaTitle: "AWS Cloud Practitioner Cheat Sheet (CLF-C02)"
description: >-
  The one-page AWS Cloud Practitioner cheat sheet for CLF-C02: all 4 domains,
  every service that shows up, and a keyword-to-answer trap table for the exam.
keywords:
  - aws cloud practitioner cheat sheet
  - clf-c02 cheat sheet
  - aws ccp cheat sheet
  - aws certification cheat sheet
  - clf-c02 exam notes
  - aws services list clf-c02
  - aws exam traps
  - well-architected six pillars
  - ec2 pricing models
  - aws support plans comparison
faq:
  - q: Is this cheat sheet enough to pass the AWS Cloud Practitioner (CLF-C02) exam?
    a: >-
      It is enough for a final review, not a first pass. Use it to consolidate
      and memorize the last 48 hours before the exam. To actually understand
      why each answer is right, read the linked deep-dives and take the practice
      quiz first, then use this page to lock it all in.
  - q: How many questions is the CLF-C02 exam and what score do I need?
    a: >-
      The exam is 65 questions in 90 minutes. Only 50 are scored; 15 are
      unscored trial questions. You need roughly 700 out of 1000 (about 70%) to
      pass, and there is no penalty for guessing, so never leave a question
      blank.
  - q: What is the single most useful thing to memorize for CLF-C02?
    a: >-
      The keyword-to-service map. AWS writes questions around trigger phrases:
      "SQL injection" means WAF, "audit trail" means CloudTrail, "5x faster
      than MySQL" means Aurora. The trap table on this page is built entirely
      from those triggers.
  - q: How is billing and pricing weighted on the exam?
    a: >-
      Billing, pricing and support is Domain 4, worth about 12% of the exam -
      the smallest domain. Technology and services (Domain 3) is the largest at
      34%, followed by security and compliance at 30% and cloud concepts at 24%.
author: Brexis Wazik
transformed: true
linked: true
topic: aws-cloud-practitioner-mcq
topicTitle: AWS Cloud Practitioner
category: Certifications
date: '2026-07-05'
order: 17
icon: "☁️"
---

Two nights before the CLF-C02, you don't need another 40-minute video. You need one page that fits the whole exam in your head - every service, every trap, in the order AWS actually tests them.

This is that page. It covers all four exam domains, weighted the way the exam weights them, and ends with the part that quietly wins you the most marks: a keyword-to-answer table built from the exact trigger phrases AWS hides in its questions.

A cheat sheet is for *consolidating*, not learning cold. If a row here makes you go "wait, why?", that's a signal - follow the link into the full explanation, take the [practice quiz](/topics/aws-cloud-practitioner-mcq/quiz), then come back and this page will finally stick.

## How to use this cheat sheet

- **48 hours out:** read it top to bottom once, slowly. Anything fuzzy, click through to the deep-dive.
- **The morning of:** skim only the **Quick Exam Traps** and **Exam Day Tips** at the bottom.
- **The rule that matters:** AWS tests *recognition*, not recall. You don't need to describe GuardDuty - you need to hear "unusual API activity" and think *GuardDuty*. Train the triggers.

---

## Domain 1 - Cloud Concepts (24%)

The gentlest domain, but it hides the distinctions the exam loves: CapEx vs OpEx, elasticity vs scalability, high availability vs fault tolerance. If those feel slippery, the full breakdown lives in [cloud concepts and cloud economics](/blog/aws-cloud-practitioner-mcq/01-cloud-concepts-value-proposition-cloud-economics).

### 6 benefits of cloud computing

| Benefit | Description |
|---|---|
| Trade fixed for variable expense | Pay-as-you-go instead of buying hardware upfront (CapEx → OpEx) |
| Massive economies of scale | AWS buys for millions, then passes the savings to you |
| Stop guessing capacity | Scale up or down instantly based on real demand |
| Increase speed & agility | Launch resources in minutes, not weeks |
| Stop spending on data centers | AWS runs the hardware; you focus on your app |
| Go global in minutes | Deploy across regions worldwide almost instantly |

**CapEx vs OpEx:** CapEx is buying servers upfront (old way); OpEx is the monthly AWS bill, pay only for what you use (new way). The cloud converts CapEx into OpEx.

### Cloud service models - who manages what

| Model | You manage | Example |
|---|---|---|
| IaaS | OS, apps, data | EC2 |
| PaaS | Apps & data only | Elastic Beanstalk |
| SaaS | Nothing - just use it | Gmail, Salesforce |

### Well-Architected Framework - the 6 pillars

The six pillars are a guaranteed question. The full memory trick and per-pillar services are in [the six pillars, made un-confusable](/blog/aws-cloud-practitioner-mcq/02-aws-well-architected-framework-the-six-pillars).

| Pillar | Focus | Key services |
|---|---|---|
| Operational Excellence | Automate, monitor, runbooks | CloudWatch, CloudTrail, Systems Manager |
| Security | IAM, encryption, detective controls | IAM, KMS, GuardDuty, Shield |
| Reliability | Recover from failure, scale to demand | Auto Scaling, ELB, Route 53, Multi-AZ |
| Performance Efficiency | Right resources, caching, serverless | Lambda, ElastiCache, CloudFront |
| Cost Optimization | Avoid waste, right-size, spot | Cost Explorer, Trusted Advisor, Budgets |
| Sustainability | Reduce energy, use managed services | Lambda, Fargate, managed services |

> Memory trick: **O**h **S**o **R**eliable **P**erformance **C**osts **S**ustainably.

### Migration strategies - the 6 R's

| Strategy | What it means | Code change? |
|---|---|---|
| Rehost | Lift & shift to EC2 as-is | None |
| Replatform | Move to a managed service (e.g. RDS) | Minimal |
| Repurchase | Replace with SaaS (e.g. Salesforce) | None |
| Refactor | Redesign as cloud-native microservices | Full redesign |
| Retire | Shut down unused apps | N/A |
| Retain | Keep on-premises, revisit later | None |

### Global infrastructure

| Component | Count | Purpose |
|---|---|---|
| Regions | 33+ | Independent geographic areas |
| Availability Zones | 2–6 per region | Physically separate data centers |
| Edge Locations | 400+ | CloudFront caching, Route 53 DNS |
| Local Zones | select metros | Run compute/storage close to end users |

- **Region selection factors:** compliance, latency, cost, service availability.
- **IAM is global.** EC2, RDS and VPC are region-specific.
- **Multi-AZ** = high availability (survives a data-center failure). **Multi-Region** = disaster recovery (survives a whole-region failure).

### Two more concepts the exam slips in

- **AWS CAF (Cloud Adoption Framework)** plans a *migration* across 6 perspectives: Business, People, Governance, Platform, Security, Operations. (Well-Architected is for *designing workloads*; CAF is for *adopting the cloud*.)
- **Decoupling / loose coupling** = split an app into independent parts (via SQS, SNS, EventBridge) so one failure doesn't take down the rest - the opposite of a monolith.
- **TCO (Total Cost of Ownership)** compares on-premises (hardware, power, cooling, space, staff) against cloud OpEx; **Migration Evaluator** helps calculate it.

---

## Domain 2 - Security & Compliance (30%)

The second-biggest domain, and the one candidates lose most marks on. Two ideas anchor it: the [shared responsibility model](/blog/aws-cloud-practitioner-mcq/03-the-shared-responsibility-model) (who secures what) and [IAM - users, roles, and policies](/blog/aws-cloud-practitioner-mcq/04-iam-identity-access-management) (who can do what).

### Shared responsibility model

| AWS is responsible for (*of* the cloud) | You are responsible for (*in* the cloud) |
|---|---|
| Physical data centers | Data encryption |
| Networking hardware | OS patching on EC2 |
| Hypervisor | IAM configuration |
| Managed-service software | Security Groups & NACLs |
| RDS OS patching | Application code |

> EC2 = more customer responsibility. RDS = less. The more managed the service, the less is on you.

### IAM at a glance

| Entity | Purpose |
|---|---|
| Root User | Full access - never use daily, enable MFA |
| IAM User | One person or application |
| IAM Group | A set of users; attach the policy once (cannot be nested) |
| IAM Role | Temporary access for AWS services or federated users |
| IAM Policy | JSON document defining Allow/Deny |

New users start with **zero permissions**. Always use **least privilege**, use **roles** for services (never hard-code access keys), and put **MFA** on root and every admin.

### Security services - hear the trigger, name the service

The seven services below are the heart of the security domain; the reasoning behind each is in the [security, identity & compliance services](/blog/aws-cloud-practitioner-mcq/05-security-identity-compliance-services) deep-dive.

| Service | Does what | Remember as |
|---|---|---|
| WAF | Blocks web attacks (SQL injection, XSS) | Door lock 🚪 |
| Shield Standard | Free DDoS protection for everyone | Shiel**D** = **D**DoS 🛡️ |
| Shield Advanced | Paid DDoS + 24/7 response team | Premium shield 💰 |
| GuardDuty | ML threat detection (CloudTrail, VPC, DNS logs) | Security guard 👮 |
| Inspector | Scans EC2/containers for vulnerabilities | Home inspector 🔍 |
| Macie | Finds PII / card data in S3 | **M**oney in S**3** 💳 |
| Security Hub | Central dashboard of all findings | Control room 🖥️ |

> GuardDuty asks "is someone attacking me *now*?" Inspector asks "do I have weak spots *before* an attack?"

### Encryption, compliance & network security

- **At-rest** (stored data: S3, EBS, RDS) vs **in-transit** (moving data: HTTPS, TLS).
- **KMS** = software-managed keys (FIPS 140-2 **Level 2**), AWS-managed, cheap, with automatic annual rotation. **CloudHSM** = dedicated single-tenant hardware (FIPS 140-2 **Level 3**), *you* hold the keys and AWS can never access them.
- **AWS Artifact** is the compliance filing cabinet - download SOC / ISO / PCI reports, sign the BAA for HIPAA.
- **Security Group** = stateful, allow-only, attached to an EC2 instance. **NACL** = stateless, allow *and* deny, attached to a subnet. To explicitly **deny** an IP, you need a **NACL**.

### More security services the exam expects

| Service | Trigger phrase → it |
|---|---|
| Detective | "investigate / root cause" - used *after* GuardDuty flags a threat |
| Secrets Manager | "rotate database passwords / API keys automatically" |
| Parameter Store | "store config values or secrets, cheaper, no auto-rotation" |
| Cognito | "add sign-up / sign-in / social login to an app" |
| ACM | "free SSL/TLS certificate, auto-renew, HTTPS" |
| VPC Flow Logs | "capture / monitor network traffic in a VPC" |
| PrivateLink | "reach an AWS service privately, without the internet" |

---

## Domain 3 - Cloud Technology & Services (34%)

The biggest domain - a third of the exam - and mostly a memory game of "which service does X". These tables are the ones to over-learn. The most heavily tested services have their own deep-dives: [EC2 and its purchasing options](/blog/aws-cloud-practitioner-mcq/06-amazon-ec2-instances-purchasing-options), [S3 object storage](/blog/aws-cloud-practitioner-mcq/10-amazon-s3-object-storage), [RDS](/blog/aws-cloud-practitioner-mcq/11-amazon-rds-managed-relational-databases) and [DynamoDB](/blog/aws-cloud-practitioner-mcq/12-amazon-dynamodb-managed-nosql).

### Compute

| Service | Use case |
|---|---|
| EC2 | Virtual servers, full OS control |
| Lambda | Serverless - run code, no servers to manage |
| Elastic Beanstalk | Deploy apps without managing infra (PaaS) |
| ECS | Run Docker containers |
| Fargate | Serverless containers (no EC2 to manage) |
| Lightsail | Simple VPS for small projects |
| Outposts | AWS services in your own data center |
| Batch | Run batch-processing / queued compute jobs |

**EC2 instance families:** General Purpose (T, M) · Compute Optimized (C - CPU-heavy) · Memory Optimized (R, X - in-memory DBs) · Storage Optimized (I, D - high I/O) · Accelerated (P, G - GPU/ML).

- **ELB** distributes traffic across instances (ALB = HTTP/Layer 7, NLB = TCP/Layer 4); **Auto Scaling** adds/removes instances by demand. Together = high availability + cost efficiency.

### Storage

| Service | Type | Use case |
|---|---|---|
| S3 | Object | Files, images, backups, static sites |
| EBS | Block | Disk for a single EC2, one AZ |
| EFS | File | Shared Linux file system across many EC2/AZs |
| FSx | File | Windows file server or Lustre (high-performance) |
| Glacier | Archive | Cheap long-term storage, slow retrieval |
| Storage Gateway | Hybrid | Bridge on-premises storage to AWS |
| Snow Family | Physical | Ship large data (Snowcone → Snowball → Snowmobile) |

**S3 storage classes** (a near-guaranteed question): Standard (frequent access) · Standard-IA (infrequent, fast retrieval) · One Zone-IA (infrequent, single AZ, cheaper) · Glacier Instant (archive, ms retrieval) · Glacier Flexible (mins–hours) · Glacier Deep Archive (cheapest, 12–48 hr) · Intelligent-Tiering (auto-moves data between tiers).

### Databases

| Service | Type | Use case |
|---|---|---|
| RDS | Relational | Managed MySQL, PostgreSQL, Oracle, SQL Server |
| Aurora | Relational | 5x faster than MySQL, auto-scales to 128 TB |
| DynamoDB | NoSQL | Single-digit-ms latency at any scale |
| ElastiCache | In-memory | Cache DB queries, cut RDS load |
| Redshift | Data warehouse | Analytics on petabytes |
| Neptune | Graph | Social networks, fraud detection |
| QLDB | Ledger | Immutable, cryptographically verifiable records |
| DocumentDB | Document | MongoDB-compatible |
| Timestream | Time-series | IoT sensor and metrics data |

### Networking

Everything runs inside a [VPC](/blog/aws-cloud-practitioner-mcq/07-vpc-networking-fundamentals) - your private network; [Route 53](/blog/aws-cloud-practitioner-mcq/08-amazon-route-53-dns-routing) resolves DNS and [CloudFront](/blog/aws-cloud-practitioner-mcq/09-amazon-cloudfront-cdn-edge-delivery) caches content at the edge.

| Service | Purpose |
|---|---|
| VPC | Your private network in AWS |
| Route 53 | DNS + routing (latency, geo, health checks) |
| CloudFront | CDN - cache at 400+ edge locations |
| API Gateway | Create, publish, secure APIs |
| Direct Connect | Private dedicated line to AWS (no internet) |
| VPN | Encrypted tunnel over the internet |
| Transit Gateway | Central hub joining many VPCs + on-prem |
| Internet Gateway | The door to the internet for a public subnet |
| NAT Gateway | Lets a private subnet reach the internet outbound-only |

### Management, integration & migration

Two services the exam constantly swaps: [CloudWatch](/blog/aws-cloud-practitioner-mcq/13-amazon-cloudwatch-monitoring-observability) watches *metrics and alarms*, while [CloudTrail](/blog/aws-cloud-practitioner-mcq/14-aws-cloudtrail-auditing-api-logging) records *who called which API*.

| Service | Purpose |
|---|---|
| CloudWatch | Metrics, logs, alarms |
| CloudTrail | Records every API call - *who* did *what*, *when* |
| AWS Config | Tracks *how* a resource's config changed over time |
| Trusted Advisor | Best-practice checks (cost, security, performance, fault tolerance, limits) |
| Systems Manager | Patch/manage EC2 at scale, no SSH |
| SQS | Queue (1→1), decouple services, no message loss |
| SNS | Broadcast (1→many) to subscribers |
| EventBridge | React to AWS events automatically |
| Step Functions | Ordered, dependent workflow steps |
| Snow Family | Physical data transfer (Snowcone → Snowball → Snowmobile) |
| DMS | Migrate databases with minimal downtime |

> CloudTrail = *who* did what. Config = *how* the resource changed. Two words that flip the answer.

### AI/ML & Infrastructure as Code

| Service | Does what |
|---|---|
| Rekognition | Image & video analysis |
| Transcribe / Polly | Speech→text / text→speech |
| Translate | Language translation |
| Lex | Conversational chatbots |
| SageMaker | Build custom ML models |
| Comprehend | NLP - sentiment, entities |
| Textract | Extract text/tables from scanned docs |
| Personalize | Real-time recommendations |
| Kendra | Intelligent natural-language search across documents |
| Forecast | Time-series forecasting (demand, sales) |
| CloudFormation | AWS-native IaC (YAML/JSON) |
| CDK | IaC in Python/TypeScript/Java → compiles to CloudFormation |

### Analytics & streaming

| Service | Does what |
|---|---|
| Athena | Query data in S3 using plain SQL (serverless) |
| Glue | Serverless ETL - extract, transform, load |
| Kinesis | Ingest and process real-time streaming data |
| EMR | Big-data processing with Hadoop / Spark |

### Delivery, performance & other services

| Service | Does what |
|---|---|
| Global Accelerator | Route traffic over the AWS backbone with 2 static IPs (not caching) |
| S3 Transfer Acceleration | Speed up S3 *uploads* via CloudFront edge locations |
| X-Ray | Trace and debug requests across distributed / microservice apps |
| DataSync | Fast bulk data transfer between on-premises and AWS |
| AMI | Template (OS + software + config) to launch identical EC2 instances |
| SES | Send transactional or marketing email |
| Connect | Cloud contact centre (phone support) |
| Service Catalog | Curated catalogue of approved resources for your org |
| OpsWorks | Configuration management with Chef / Puppet |

> CloudFront **caches content** at the edge; Global Accelerator **routes traffic** through AWS's network - same edge footprint, opposite jobs.

### How you talk to AWS

| Tool | What it is | Auth |
|---|---|---|
| Console | Web GUI (point and click) | Username + password |
| CLI | Terminal commands, scripts | Access keys |
| SDK | Language libraries (Python, Java…) | Access keys |

---

## Domain 4 - Billing, Pricing & Support (12%)

The smallest domain, but easy marks if you memorize three tables. The reasoning behind pricing choices sits in the [billing, pricing & cost-management](/blog/aws-cloud-practitioner-mcq/16-billing-pricing-cost-management-support) deep-dive.

### EC2 pricing models

| Model | Discount | Commitment | Best for |
|---|---|---|---|
| On-Demand | None | None | Unpredictable, short-term |
| Reserved (Standard) | Up to 72% | 1 or 3 yr, fixed instance/region | Steady, predictable |
| Reserved (Convertible) | Lower than Standard | 1 or 3 yr | Can change instance type |
| Spot | Up to 90% | None | Batch, fault-tolerant (interruptible) |
| Savings Plan (Compute) | Up to 72% | 1 or 3 yr, commit $/hr | EC2 + Lambda + Fargate, any region |
| Dedicated Hosts | None | Optional | Compliance, BYOL |

> Sees Lambda or Fargate → **Savings Plan**, never Reserved. "Can be interrupted" → **Spot**. "Specific instance + region" → **Standard Reserved**.

### Billing & cost tools

| Tool | Purpose |
|---|---|
| Cost Explorer | Analyze *past* spending, forecast |
| AWS Budgets | Alert *before* you overspend |
| Pricing Calculator | Estimate *before* you deploy |
| Cost & Usage Report | Most detailed line-by-line bill → to S3 |
| Cost Allocation Tags | Tag resources to break the bill down by team/project |
| Compute Optimizer | Right-size recommendations for EC2, EBS and Lambda |

### Support plans

| Plan | Price | 24/7 | TAM | Critical response |
|---|---|---|---|---|
| Basic | Free | ❌ | ❌ | ❌ |
| Developer | $29/mo | ❌ (email, biz hours) | ❌ | ❌ |
| Business | $100/mo | ✅ | ❌ | 1 hour |
| Enterprise On-Ramp | $5,500/mo | ✅ | Pool of TAMs | 30 min |
| Enterprise | $15,000/mo | ✅ | Dedicated TAM | 15 min |

- 24/7 support and full Trusted Advisor checks start at **Business**.
- **Pool of TAMs / 30-min response** = Enterprise On-Ramp. **Dedicated TAM / 15-min** = Enterprise.
- **Consolidated Billing** = one bill + volume discounts across accounts, managed with [AWS Organizations](/blog/aws-cloud-practitioner-mcq/15-aws-organizations-multi-account-governance). Organizations groups accounts into **OUs**; **SCPs** are applied per account or OU and only *restrict* services - they never grant permissions.
- **Free Tier:** Always Free (e.g. Lambda 1M requests/mo, DynamoDB 25 GB) · 12-Months Free (EC2 t2.micro, S3 5 GB, RDS) · short service Trials.
- **Data transfer IN is free; data transfer OUT costs money** - a favorite billing trick.
- **AWS Marketplace** = buy/sell third-party software (AMIs, SaaS, containers), flexible pricing including BYOL.
- Enterprise support adds a **dedicated TAM** and a **Concierge** billing team (both Enterprise-only).
- **Reserved Instance payment:** All Upfront (biggest discount) > Partial Upfront > No Upfront. RI discounts are also **shared across all accounts** in an Organization.
- **EC2 billing granularity:** Linux is billed per *second* (1-minute minimum), Windows per *hour*. An **Elastic IP** is free while attached to a running instance, but charged when left idle.
- **Penetration testing** on your own instances is allowed without asking AWS first.

---

## Quick exam traps 🚨

This is the highest-value table on the page. AWS builds questions around trigger phrases - learn the phrase, not the paragraph.

| If the question says… | The answer is… |
|---|---|
| "SQL injection / XSS" | WAF |
| "Free DDoS protection" | Shield Standard |
| "DDoS + 24/7 response team" | Shield Advanced |
| "Threat detection / unusual API calls" | GuardDuty |
| "Scan EC2 for vulnerabilities / open ports" | Inspector |
| "Sensitive data / PII / cards in S3" | Macie |
| "All security findings in one place" | Security Hub |
| "Investigate / root-cause a security finding" | Detective |
| "Rotate DB passwords / API keys automatically" | Secrets Manager |
| "Add sign-in / social login to an app" | Cognito |
| "Free SSL/TLS certificate / HTTPS" | ACM |
| "Reach a service privately, no internet" | PrivateLink |
| "Monitor network traffic in a VPC" | VPC Flow Logs |
| "Who made the API call / audit trail" | CloudTrail |
| "How did the resource config change" | AWS Config |
| "Best-practice recommendations" | Trusted Advisor |
| "Patch 1000 EC2 without SSH" | Systems Manager |
| "Monitor metrics / CPU alarm" | CloudWatch |
| "DNS / domain name" | Route 53 |
| "Cache content globally / CDN" | CloudFront |
| "Create / manage APIs" | API Gateway |
| "Connect multiple VPCs centrally" | Transit Gateway |
| "Private dedicated connection to AWS" | Direct Connect |
| "AWS services in your own data center" | Outposts |
| "Queue / no message loss / decouple" | SQS |
| "Notify many subscribers at once" | SNS |
| "React to an AWS event automatically" | EventBridge |
| "Run steps in order / workflow" | Step Functions |
| "5x faster than MySQL / auto-scales" | Aurora |
| "NoSQL / single-digit ms" | DynamoDB |
| "Data warehouse / petabyte analytics" | Redshift |
| "Graph / social network" | Neptune |
| "Immutable / cryptographically verifiable" | QLDB |
| "Cache DB queries" | ElastiCache |
| "Physical data transfer / internet too slow" | Snow Family |
| "Bridge on-prem storage to the cloud" | Storage Gateway |
| "Windows file share / Lustre" | FSx |
| "Private subnet needs outbound internet" | NAT Gateway |
| "Run batch / queued compute jobs" | Batch |
| "Query S3 with SQL" | Athena |
| "Serverless ETL / prepare data" | Glue |
| "Real-time streaming data" | Kinesis |
| "Big data / Hadoop / Spark" | EMR |
| "Improve global performance / static IPs" | Global Accelerator |
| "Speed up uploads to S3" | S3 Transfer Acceleration |
| "Trace / debug microservices" | X-Ray |
| "Fast on-prem to AWS data transfer" | DataSync |
| "Template to launch identical EC2s" | AMI |
| "Send email" | SES |
| "Cloud call centre" | Connect |
| "Road map for cloud adoption / migration planning" | AWS CAF |
| "Right-size EC2 recommendations" | Compute Optimizer |
| "Migrate a database / minimal downtime" | DMS |
| "Audio to text" | Transcribe |
| "Text to audio" | Polly |
| "Chatbot" | Lex |
| "Custom ML model" | SageMaker |
| "Sentiment analysis / NLP" | Comprehend |
| "Extract text from scanned docs" | Textract |
| "Personalized recommendations" | Personalize |
| "Natural-language search across documents" | Kendra |
| "Forecast future demand / sales" | Forecast |
| "YAML/JSON infra template" | CloudFormation |
| "Infra in Python/TypeScript" | CDK |
| "Deploy an app without managing infra" | Elastic Beanstalk |
| "Compliance reports / SOC / ISO" | AWS Artifact |
| "Healthcare data" | HIPAA · "Card data" | PCI DSS · "EU privacy" | GDPR |
| "Analyze past AWS spending" | Cost Explorer |
| "Alert when the bill exceeds $X" | AWS Budgets |
| "Estimate cost before deploying" | Pricing Calculator |
| "Dedicated TAM" | Enterprise Support |
| "Pool of TAMs / 30-min response" | Enterprise On-Ramp |
| "Cheapest 24/7 support" | Business |
| "One bill for all accounts" | Consolidated Billing |
| "Restrict services across accounts" | SCPs |
| "EC2 + Lambda + Fargate discount" | Compute Savings Plan |
| "Batch jobs / can be interrupted" | Spot Instances |

---

## Exam day tips 🎯

- **Format:** 65 questions (50 scored + 15 unscored), 90 minutes. Pass ≈ 700/1000. No penalty for guessing - never leave one blank.
- **Read every option.** AWS writes distractors that are *almost* right.
- **"MOST cost-effective"** → think Spot or Reserved.
- **"LEAST operational overhead"** → think managed services (RDS over EC2 + MySQL).
- **"Minimal downtime migration"** → DMS. **"No code changes"** → Rehost or Replatform.
- **Stuck between two answers?** Eliminate the clearly wrong ones first, then pick the more *managed* / more *specific* service.
- **Pace:** about 1.4 minutes per question. Flag the hard ones, keep moving, and circle back - most people finish with 15–20 minutes to spare.

## Now prove it stuck

A cheat sheet only works if you can recall it under pressure - reading it feels like knowing it, which is exactly the trap. Close this page and run the [AWS Cloud Practitioner practice quiz](/topics/aws-cloud-practitioner-mcq/quiz): every question you miss points you straight back to the row you thought you had. Do that twice, and the exam stops being a memory test and starts feeling like recognition.
