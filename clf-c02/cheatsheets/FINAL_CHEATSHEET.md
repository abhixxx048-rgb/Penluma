# AWS Cloud Practitioner (CLF-C02) — Final Cheatsheet
# All 4 Domains | Exam Ready

---

## DOMAIN 1: Cloud Concepts (24%)

### 6 Benefits of Cloud Computing
| Benefit | Description |
|---------|-------------|
| Trade fixed for variable expense | Pay-as-you-go instead of buying hardware upfront (CapEx → OpEx) |
| Massive economies of scale | AWS buys for millions → passes savings to you |
| Stop guessing capacity | Scale up/down instantly based on actual demand |
| Increase speed & agility | Launch resources in minutes instead of weeks |
| Stop spending on data centers | AWS manages hardware, you focus on your app |
| Go global in minutes | Deploy in multiple regions worldwide instantly |

### CapEx vs OpEx
- **CapEx** = buying physical servers upfront (old way)
- **OpEx** = monthly AWS bill, pay only for what you use (new way)
- Cloud = converts CapEx → OpEx ✅

### Well-Architected Framework — 6 Pillars (OSRPCS)
| Pillar | Focus | Key Services |
|--------|-------|-------------|
| **Operational Excellence** | Automate, monitor, runbooks | CloudWatch, CloudTrail, Systems Manager |
| **Security** | IAM, encryption, detective controls | IAM, KMS, GuardDuty, Shield |
| **Reliability** | Recover from failures, scale to demand | Auto Scaling, ELB, Route 53, Multi-AZ |
| **Performance Efficiency** | Right resources, caching, serverless | Lambda, ElastiCache, CloudFront |
| **Cost Optimization** | Avoid waste, right-size, spot instances | Cost Explorer, Trusted Advisor, Budgets |
| **Sustainability** | Reduce energy, use managed services | Lambda, Fargate, managed services |

> Memory trick: **O**h **S**o **R**eliable **P**erformance **C**osts **S**ustainably

### Migration Strategies — 6 R's
| Strategy | What it means | Code Change? |
|----------|--------------|-------------|
| **Rehost** | Lift & shift to EC2 as-is | None |
| **Replatform** | Move to RDS/managed service, no code change | Minimal |
| **Repurchase** | Replace with SaaS (e.g., Salesforce) | None |
| **Refactor** | Redesign as cloud-native microservices | Full redesign |
| **Retire** | Shut down unused apps | N/A |
| **Retain** | Keep on-premises, revisit later | None |

### Cloud Deployment Models
| Model | Description | Example |
|-------|-------------|---------|
| **Public Cloud** | Everything on AWS | Startup running all workloads on AWS |
| **Private Cloud** | Dedicated infrastructure for one org | Government agency |
| **Hybrid Cloud** | Mix of AWS + on-premises | Bank keeps core data on-prem, website on AWS |

### AWS Global Infrastructure
| Component | Count | Purpose |
|-----------|-------|---------|
| **Regions** | 33+ | Geographic areas, independent from each other |
| **Availability Zones** | 2-6 per region | Physical data centers with independent power/networking |
| **Edge Locations** | 400+ | CloudFront caching, Route 53 DNS |

- **Region selection factors:** Compliance, Latency, Cost, Service availability
- **IAM** = global (not region-specific)
- **EC2, RDS, VPC** = region-specific
- **Multi-AZ** = high availability (survives data center failure)
- **Multi-Region** = disaster recovery (survives entire region failure)

---

## DOMAIN 2: Security & Compliance (30%)

### Shared Responsibility Model
| AWS Responsible (OF the Cloud) | Customer Responsible (IN the Cloud) |
|-------------------------------|-------------------------------------|
| Physical data centers | Data encryption |
| Networking hardware | OS patching on EC2 |
| Hypervisor | IAM configuration |
| Managed service software | Security Groups & NACLs |
| RDS OS patching | Application code |

> EC2 = more customer responsibility | RDS = less customer responsibility

### IAM (Identity & Access Management)
| Entity | Purpose |
|--------|---------|
| **Root User** | Full account access — NEVER use daily, enable MFA |
| **IAM User** | One person or application |
| **IAM Group** | Collection of users — attach policy once (cannot be nested) |
| **IAM Role** | Temporary access for AWS services or external users |
| **IAM Policy** | JSON document defining Allow/Deny permissions |

- IAM is **global**
- New users have **zero permissions** by default
- Always use **least privilege**
- Use **Roles** for AWS services — never embed access keys in code
- **MFA** should be enabled on root and all admin accounts

### Security Services
| Service | Does What | Remember As |
|---------|-----------|-------------|
| **WAF** | Blocks web attacks (SQL injection, XSS) | Door lock 🚪 |
| **Shield Standard** | Free DDoS protection for all customers | Shiel**D** = **D**DoS 🛡️ |
| **Shield Advanced** | Paid DDoS + 24/7 response team | Premium shield 💰 |
| **GuardDuty** | Detects threats using ML (monitors CloudTrail, VPC, DNS logs) | Security Guard 👮 |
| **Inspector** | Scans EC2/containers for vulnerabilities & open ports | Home Inspector 🔍 |
| **Macie** | Finds sensitive data (PII, credit cards) in S3 | **M**oney in S**3** 💳 |
| **Security Hub** | Central dashboard aggregating all security findings | Control room 🖥️ |

> GuardDuty = "Is someone attacking me NOW?" (active threat detection)
> Inspector = "Do I have weak spots?" (vulnerability scanning before attack)

### Encryption
| Type | Protects | Example |
|------|----------|---------|
| **At-rest** | Stored data | S3, EBS, RDS encryption |
| **In-transit** | Data moving over network | HTTPS, TLS, SSL |

| | KMS | CloudHSM |
|---|---|---|
| Key storage | Software-based | Dedicated physical hardware |
| AWS access to keys | Yes | No |
| Cost | Cheaper | Expensive |
| Use case | General encryption | Strict compliance, full key control |

### Compliance & AWS Artifact
| Standard | Protects |
|----------|----------|
| **HIPAA** | Healthcare data (USA) |
| **PCI DSS** | Credit card payment data |
| **GDPR** | Personal data of EU citizens |
| **ISO 27001** | Information security management |
| **SOC 2** | Security, availability, confidentiality |

- **AWS Artifact** = compliance filing cabinet 📁
  - Artifact Reports = download ISO, SOC, PCI DSS reports
  - Artifact Agreements = sign BAA for HIPAA

### Network Security
| | Security Group | NACL |
|---|---|---|
| Applied to | EC2 instance | Subnet |
| Stateful/Stateless | Stateful | Stateless |
| Allow/Deny | Allow only | Allow AND Deny |
| Level | Instance level | Subnet level |

- To explicitly **DENY** an IP → use **NACL**
- **Security Group** = bodyguard for each EC2 💂
- **NACL** = border control for subnet 🛂
- **Public Subnet** = has internet access (web servers)
- **Private Subnet** = no internet access (databases)

---

## DOMAIN 3: Cloud Technology & Services (34%)

### Compute
| Service | Use Case |
|---------|----------|
| **EC2** | Virtual servers, full control over OS |
| **Lambda** | Serverless, run code without managing servers |
| **Elastic Beanstalk** | Deploy apps without managing infrastructure (PaaS) |
| **ECS** | Run Docker containers |
| **Fargate** | Serverless containers (no EC2 management) |
| **Lightsail** | Simple VPS for small projects |
| **Outposts** | Run AWS services in your own data center |

### Auto Scaling & Load Balancing
- **ELB** = distributes traffic across existing instances
- **Auto Scaling** = adds/removes instances based on demand
- Together = high availability + cost efficiency

### Storage
| Service | Type | Use Case |
|---------|------|----------|
| **S3** | Object storage | Files, images, backups, static websites |
| **EBS** | Block storage | Hard disk for single EC2 instance, one AZ |
| **EFS** | File storage | Shared file system, multiple EC2 across AZs |
| **Glacier** | Archive storage | Long-term cheap storage, slow retrieval |

### Databases
| Service | Type | Use Case |
|---------|------|----------|
| **RDS** | Relational | Managed MySQL, PostgreSQL, Oracle, SQL Server |
| **Aurora** | Relational | 5x faster than MySQL, auto-scales to 128TB |
| **DynamoDB** | NoSQL | Single-digit ms latency, any scale |
| **ElastiCache** | In-memory cache | Cache DB queries, reduce RDS load |
| **Redshift** | Data warehouse | Complex analytics on petabytes |
| **Neptune** | Graph database | Social networks, fraud detection |
| **QLDB** | Ledger database | Immutable, cryptographically verifiable records |
| **DocumentDB** | Document database | MongoDB-compatible |

### Networking
| Service | Purpose |
|---------|---------|
| **VPC** | Your private network in AWS |
| **Route 53** | DNS + traffic routing (latency, geo, health checks) |
| **CloudFront** | CDN — cache content at 400+ edge locations |
| **API Gateway** | Create, publish, secure REST/HTTP/WebSocket APIs |
| **Direct Connect** | Private dedicated physical connection to AWS (no internet) |
| **VPN** | Encrypted tunnel over internet to AWS |
| **Transit Gateway** | Central hub connecting multiple VPCs + on-premises |
| **Internet Gateway** | Door to internet for public subnet resources |

### Management & Monitoring
| Service | Purpose |
|---------|---------|
| **CloudWatch** | Monitor metrics, logs, set alarms |
| **CloudTrail** | Record ALL API calls — WHO did WHAT and WHEN |
| **AWS Config** | Track HOW resource configurations changed over time |
| **Trusted Advisor** | Best practice recommendations (cost, security, performance, fault tolerance, limits) |
| **Systems Manager** | Patch/manage EC2 instances at scale without SSH |
| **Health Dashboard** | AWS service health status |

> CloudTrail = WHO did what | Config = HOW resource changed

### Application Integration
| Service | Pattern | Use Case |
|---------|---------|----------|
| **SQS** | Queue (1→1) | Decouple services, no message loss |
| **SNS** | Broadcast (1→many) | Notify multiple subscribers simultaneously |
| **EventBridge** | Event → Action | React to AWS events automatically |
| **Step Functions** | Ordered workflow | Run steps in sequence, each depends on previous |

### Migration
| Service | Purpose |
|---------|---------|
| **Snowcone** | Up to 14TB physical data transfer |
| **Snowball Edge** | Up to 80TB physical data transfer |
| **Snowmobile** | Up to 100PB physical data transfer (truck!) |
| **DMS** | Migrate databases to AWS with minimal downtime |
| **Migration Hub** | Track all migration activities in one place |

### AI/ML Services
| Service | Does What |
|---------|-----------|
| **Rekognition** | Image & video analysis |
| **Transcribe** | Speech → Text (audio to text) |
| **Polly** | Text → Speech (text to audio) |
| **Translate** | Language translation |
| **Lex** | Build conversational chatbots |
| **SageMaker** | Build custom ML models from scratch |
| **Comprehend** | NLP — sentiment analysis, entity detection |
| **Textract** | Extract text/tables/forms from scanned documents |
| **Kendra** | Intelligent enterprise search |
| **Forecast** | Time-series forecasting |
| **Personalize** | Real-time personalized recommendations |

### IaC (Infrastructure as Code)
| Service | Language | Notes |
|---------|----------|-------|
| **CloudFormation** | YAML / JSON | AWS native IaC |
| **CDK** | Python, TypeScript, Java | Converts to CloudFormation |
| **Elastic Beanstalk** | N/A | NOT IaC — deploys apps, not infrastructure |

---

## DOMAIN 4: Billing, Pricing & Support (12%)

### EC2 Pricing Models
| Model | Discount | Commitment | Use Case |
|-------|----------|------------|----------|
| **On-Demand** | None | None | Unpredictable, short-term |
| **Reserved (Standard)** | Up to 72% | 1 or 3 years, specific instance/region | Steady predictable workloads |
| **Reserved (Convertible)** | Lower than Standard | 1 or 3 years | Can change instance type mid-term |
| **Spot Instances** | Up to 90% | None | Batch jobs, fault-tolerant (can be interrupted) |
| **Savings Plans (Compute)** | Up to 72% | 1 or 3 years, commit $/hour | EC2 + Lambda + Fargate, any region |
| **Savings Plans (EC2 Instance)** | Higher than Compute SP | 1 or 3 years | Specific instance family, one region |
| **Dedicated Hosts** | None | Optional | Compliance, BYOL |

> Sees Lambda or Fargate → always Savings Plan, never Reserved Instance
> "Specific instance + specific region" → Standard Reserved Instance
> "Can be interrupted" → Spot Instances

### Billing & Cost Tools
| Service | Purpose |
|---------|---------|
| **Cost Explorer** | Analyze past spending, forecast future costs |
| **AWS Budgets** | Alert when spending exceeds threshold |
| **Pricing Calculator** | Estimate costs BEFORE deploying |
| **Cost & Usage Report (CUR)** | Most detailed line-by-line billing report → delivered to S3 |
| **Billing Dashboard** | Overview of current month charges |

> "Analyze past spending" → Cost Explorer
> "Alert before overspending" → Budgets
> "Estimate before deploying" → Pricing Calculator
> "Detailed every charge" → CUR

### AWS Support Plans
| Plan | Price | 24/7 Support | TAM | Critical Response |
|------|-------|-------------|-----|-------------------|
| **Basic** | Free | ❌ | ❌ | ❌ |
| **Developer** | $29/mo | ❌ (email only, biz hours) | ❌ | ❌ |
| **Business** | $100/mo | ✅ | ❌ | 1 hour |
| **Enterprise On-Ramp** | $5,500/mo | ✅ | Pool of TAMs | 30 minutes |
| **Enterprise** | $15,000/mo | ✅ | Dedicated TAM | 15 minutes |

- 24/7 support starts at **Business** plan
- Full Trusted Advisor checks start at **Business** plan
- **Dedicated TAM** = Enterprise only
- **Pool of TAMs** = Enterprise On-Ramp
- **30 min response** = Enterprise On-Ramp
- **15 min response** = Enterprise

### AWS Organizations & Consolidated Billing
- **AWS Organizations** = manage multiple AWS accounts from one place
- **Consolidated Billing** = one combined bill + volume discounts across all accounts
- **Management Account** = pays for all member accounts
- **SCPs (Service Control Policies)** = restrict what services accounts can use
  - SCPs do NOT grant permissions — they only restrict
  - Applied at account or OU (Organizational Unit) level

---

## DOMAIN 5: Deeper Coverage & Newer Services 🆕
> Everything below is fair game on CLF-C02 and fills the gaps most practice tests hit.

### Disaster Recovery (DR) — mirror your Region
| Concept | Meaning |
|---------|---------|
| **AWS Elastic Disaster Recovery (AWS DRS)** | Replicates servers into another Region; spins up a standby copy in **minutes** during an outage. **Replaced CloudEndure Disaster Recovery** — if you still see "CloudEndure DR" as an option, it's the same idea |
| **RPO (Recovery Point Objective)** | How much DATA you can afford to lose (measured in time) |
| **RTO (Recovery Time Objective)** | How fast you must be back UP (measured in time) |

**4 DR strategies (cheapest/slowest → priciest/fastest):**
| Strategy | RTO/RPO | How it works |
|----------|---------|-------------|
| **Backup & Restore** | Hours | Just back up; restore after disaster |
| **Pilot Light** | 10s of minutes | Core (DB) always running, rest off until needed |
| **Warm Standby** | Minutes | Scaled-down full copy always running, scale up on failover |
| **Multi-Site Active/Active** | Near-zero | Full copy running in both Regions simultaneously |

> "Standby available in minutes / mirror image in another Region" → AWS Elastic Disaster Recovery (or Warm Standby)

### Server-based vs Serverless
- **Server-based** (you pick/see an instance): **EC2, RDS, EMR, ElastiCache, Redshift, OpenSearch**
- **Serverless** (no servers to manage): **Lambda, Fargate, S3, DynamoDB, Aurora Serverless, API Gateway, SQS, SNS, Step Functions, Glue, Athena**

> "Which are server-based?" → RDS + EMR are classic answers (they run on instances under the hood)

### CloudWatch vs CloudWatch Logs (know the exact definition)
- **Amazon CloudWatch** = a **metrics repository** with customizable notification thresholds and channels (alarms → SNS). NOT a code repo, NOT a firewall.
- **CloudWatch Logs** features: **real-time monitoring** of log data + **adjustable/configurable retention** (1 day → forever).

### Analytics & Big Data
| Service | Does What | Serverless? |
|---------|-----------|-------------|
| **Athena** | Query data in S3 with SQL — pay per query | ✅ |
| **Glue** | Serverless **ETL** / data integration; auto-scales, no infra to manage | ✅ |
| **EMR** | Managed **Hadoop/Spark/Hive** big-data clusters; decouples compute & storage | ❌ (runs on EC2) |
| **Redshift** | Petabyte-scale data warehouse for complex analytics | ❌ |
| **Kinesis** | Ingest & process **real-time streaming** data | ✅ (mostly) |
| **Data Firehose** | Load streaming data into S3/Redshift/OpenSearch | ✅ |
| **QuickSight** | BI dashboards & visualizations | ✅ |
| **OpenSearch** | Search & log analytics | ❌ |
| **Lake Formation** | Build & secure a data lake quickly | ✅ |

### Generative AI & newer AI services (added to the exam)
| Service | Does What |
|---------|-----------|
| **Amazon Q** | Generative-AI assistant for work & builders (chat, code, business data) |
| **Amazon Bedrock** | Build GenAI apps with foundation models (Anthropic Claude, etc.) via one API — serverless |
| **SageMaker** | Build/train/deploy custom ML models end-to-end |

### More Security & Identity services
| Service | Does What | Exam Trigger |
|---------|-----------|-------------|
| **Secrets Manager** | Store, **auto-rotate**, retrieve DB creds / API keys / secrets | "rotate database credentials" |
| **Systems Manager Parameter Store** | Store config & secrets (free tier, no auto-rotation) | "store config values / license keys" |
| **ACM (Certificate Manager)** | Free public **SSL/TLS certificates** | "free HTTPS certificate" |
| **Cognito** | Sign-up / sign-in & identity for your apps | "user authentication for mobile/web app" |
| **IAM Identity Center** (was AWS SSO) | Single sign-on across multiple AWS accounts & apps | "one login for many accounts" |
| **Directory Service** | Managed Microsoft Active Directory in AWS | "connect on-prem AD" |
| **AWS Firewall Manager** | Centrally manage WAF/Shield/SG rules across accounts | "manage firewall rules org-wide" |

### Shared Responsibility — extra rulings
- AWS **is** responsible for: physical hardware, **EC2 host firmware**, hypervisor, global infrastructure, managed-service patching (RDS engine, Lambda runtime).
- **Configuration management** = **SHARED** between AWS and customer.
- Customer is responsible for: guest OS patching on EC2, IAM, security groups, data & encryption choices, app code.

### Penetration Testing (updated policy) ⚠️
- Customers **CAN** run pen tests on **8 approved services** (EC2, RDS, CloudFront, Aurora, API Gateway, Lambda, Lightsail, Elastic Beanstalk) **without prior approval**.
- **DDoS / stress / simulated-event testing still requires AWS approval.**
- Older practice questions may still say "request and wait for approval" — that's the legacy answer.

### AWS Marketplace, Partners & Professional help
| Thing | What it is |
|-------|-----------|
| **AWS Marketplace** | Digital catalog to **find, test, buy** third-party software; flexible pricing; software can run on AWS **or other clouds** |
| **AWS Partner Network (APN)** | Global community building on AWS; key benefit = **Partner funding**, training, co-selling |
| **AWS Professional Services** | AWS experts who help you migrate/adopt |
| **AWS IQ** | Hire AWS-certified freelancers for small projects |
| **Service Catalog** | Curate an **approved list** of products for your org to deploy |

### Self-support & Learning resources (no support plan needed)
- **AWS Documentation** (user guides), **SDK guides**, **Whitepapers**, **AWS re:Post** (community Q&A, replaced Forums), **Knowledge Center**, **AWS Trust & Safety Center** (report abuse).
- **Instructor-led** learning: **AWS Classroom Training** + **AWS Online Tech Talks** (live). Self-paced: **AWS Skill Builder**.
- **AWS Trusted Advisor** also flags **security groups with unrestricted (0.0.0.0/0) access**.

### How AWS reduces cost / frees up IT
- **Reduce TCO** = **minimize large capital expenditures** (no upfront hardware; CapEx → OpEx).
- AWS handles the "undifferentiated heavy lifting": **patching database software, backing up databases, hardware maintenance** — freeing your team for app work.
- **Consolidated billing** advantage = **volume-pricing qualification** (aggregated usage across accounts = lower unit price; shared RI/Savings Plan discounts).

### Amazon VPC essentials
- Customers have **complete control** over their VPC (IP ranges, subnets, route tables, gateways).
- **VPC Dashboard** lets you configure: **Subnets, Security Groups**, Route Tables, Internet/NAT Gateways, VPC Peering.

### Storage & DB quick rulings from tricky questions
- **Sub-millisecond latency / real-time IoT cache** → **ElastiCache for Redis**.
- **Big-data app on EC2 needing high throughput to many nodes at once** → **EFS** (shared, scales throughput).
- **Amazon S3** = an **object store** + a **highly durable** (11 nines) storage system.
- **Backup in another geographic location** → store it **in another Region**.
- **AWS-managed databases** include Neptune, RDS (MySQL/PostgreSQL/etc.), Aurora, DynamoDB, Redshift, DocumentDB, QLDB, ElastiCache, Keyspaces, Timestream.

### S3 Storage Classes (heavily tested) 🪣
| Class | Use Case | Cost / Retrieval |
|-------|----------|------------------|
| **S3 Standard** | Frequently accessed, hot data | Highest storage, free retrieval |
| **S3 Intelligent-Tiering** | **Unknown / changing access patterns** — auto-moves data | Small monitoring fee, no retrieval fee |
| **S3 Standard-IA** (Infrequent Access) | Accessed rarely, needs multi-AZ | Cheaper storage, retrieval fee |
| **S3 One Zone-IA** | Infrequent + **re-creatable** data (1 AZ only) | Cheapest IA, less durable |
| **Glacier Instant Retrieval** | Archive, need instant access (ms) | Cheap storage |
| **Glacier Flexible Retrieval** | Archive, minutes–hours retrieval | Cheaper |
| **Glacier Deep Archive** | **Cheapest**, 12-hr retrieval, 7–10 yr compliance | Lowest cost |

- **Lifecycle policies** auto-move objects between classes over time.
- **Versioning** keeps multiple copies; protects against accidental delete/overwrite.
- All classes = **11 nines (99.999999999%) durability** (One Zone-IA still 11 nines but in 1 AZ).

> "Unknown/unpredictable access" → **Intelligent-Tiering** | "Cheapest long-term archive" → **Glacier Deep Archive** | "Re-creatable, save money, single AZ" → **One Zone-IA**

### AWS Free Tier — 3 types
| Type | Meaning | Example |
|------|---------|---------|
| **12-Month Free** | Free for 12 months after signup | 750 hrs/mo t2.micro EC2, 5GB S3 |
| **Always Free** | Never expires | 1M Lambda requests/mo, 25GB DynamoDB |
| **Trials** | Free for a short period after activating a service | SageMaker, some services (30/60/90 days) |

### EC2 Instance Families (pick by workload)
| Family | Optimized For | Example Use |
|--------|--------------|-------------|
| **General Purpose** (T, M) | Balanced CPU/memory | Web servers, dev/test |
| **Compute Optimized** (C) | High CPU | Batch, gaming, HPC |
| **Memory Optimized** (R, X) | Large RAM | In-memory DBs, big data |
| **Storage Optimized** (I, D) | High disk I/O | Data warehouses, NoSQL |
| **Accelerated Computing** (P, G) | GPUs | ML training, graphics |

### Route 53 Routing Policies
| Policy | Routes By |
|--------|-----------|
| **Simple** | One record, no logic |
| **Weighted** | % split across resources (A/B testing) |
| **Latency** | Lowest-latency Region for the user |
| **Failover** | Active → standby if health check fails |
| **Geolocation** | User's physical location |
| **Geoproximity** | Location + bias adjustment |
| **Multivalue** | Returns multiple healthy records |

### AWS Control Tower & multi-account governance
- **Control Tower** = set up & govern a **secure multi-account "landing zone"** using best practices (built on Organizations).
- **Guardrails** = pre-packaged governance rules (preventive via SCPs + detective via Config).
- **Landing Zone** = the well-architected multi-account baseline it creates.

> "Set up a secure, governed multi-account environment quickly" → **Control Tower** (Organizations = the plumbing, Control Tower = the automated setup)

### Cost drivers & pricing fundamentals (recap)
- **3 fundamental cost drivers:** **Compute, Storage, Data Transfer OUT.**
- Greatest cost impact → **Compute charges** + **Data Transfer Out** (Data Transfer IN is free).
- **EBS pricing factors:** volume size (GB-month) provisioned + snapshot storage (+ provisioned IOPS/throughput).
- **Cost Explorer** forecasts spend up to **12 months** ahead.

### AWS Well-Architected pillar picker (recap)
- "Right compute resources for the workload" → **Performance Efficiency**.
- "Recover from failure / scale to demand" → **Reliability**.
- "Automate, monitor, improve process" → **Operational Excellence**.

---

## QUICK EXAM TRAPS 🚨

| If question says... | Answer is... |
|---------------------|-------------|
| "SQL injection / XSS" | WAF |
| "DDoS protection free" | Shield Standard |
| "DDoS + 24/7 response team" | Shield Advanced |
| "Threat detection / compromised instance / unusual API calls" | GuardDuty |
| "Scan EC2 for vulnerabilities / CVEs / open ports" | Inspector |
| "Sensitive data in S3 / credit cards / PII" | Macie |
| "All security findings in one place" | Security Hub |
| "Who made API call / audit trail" | CloudTrail |
| "How did resource config change" | AWS Config |
| "Best practice recommendations" | Trusted Advisor |
| "Patch 1000 EC2 without SSH" | Systems Manager |
| "Monitor metrics / CPU alarm" | CloudWatch |
| "DNS / domain name" | Route 53 |
| "Cache content globally / CDN" | CloudFront |
| "Create / manage APIs" | API Gateway |
| "Connect multiple VPCs centrally" | Transit Gateway |
| "Private dedicated connection to AWS" | Direct Connect |
| "AWS services in your data center" | Outposts |
| "Queue / no message loss / decouple" | SQS |
| "Notify many subscribers at once" | SNS |
| "React to AWS event automatically" | EventBridge |
| "Run steps in order / workflow" | Step Functions |
| "5x faster than MySQL / auto-scales" | Aurora |
| "NoSQL / single-digit ms" | DynamoDB |
| "Data warehouse / analytics / petabytes" | Redshift |
| "Graph database / social network" | Neptune |
| "Immutable / cryptographically verifiable" | QLDB |
| "Cache DB queries" | ElastiCache |
| "Physical data transfer / internet too slow" | Snow Family |
| "Migrate database / minimal downtime" | DMS |
| "Track all migrations in one place" | Migration Hub |
| "Audio to text" | Transcribe |
| "Text to audio" | Polly |
| "Chatbot" | Lex |
| "Custom ML model" | SageMaker |
| "Sentiment analysis / NLP" | Comprehend |
| "Extract text from scanned docs" | Textract |
| "Personalized recommendations" | Personalize |
| "YAML/JSON infrastructure template" | CloudFormation |
| "Infrastructure in Python/TypeScript" | CDK |
| "Deploy app without managing infra" | Elastic Beanstalk |
| "Compliance reports / SOC / ISO" | AWS Artifact |
| "Sign BAA for HIPAA" | AWS Artifact |
| "Healthcare data compliance" | HIPAA |
| "Credit card data compliance" | PCI DSS |
| "European data privacy" | GDPR |
| "Analyze past AWS spending" | Cost Explorer |
| "Alert when bill exceeds $X" | AWS Budgets |
| "Estimate cost before deploying" | Pricing Calculator |
| "Dedicated TAM" | Enterprise Support |
| "Pool of TAMs / 30 min response" | Enterprise On-Ramp |
| "Cheapest 24/7 support" | Business |
| "One bill for all accounts" | Consolidated Billing |
| "Restrict services across accounts" | SCPs |
| "EC2 + Lambda + Fargate discount" | Compute Savings Plan |
| "Batch jobs / can be interrupted" | Spot Instances |
| "Compliance / BYOL / dedicated server" | Dedicated Hosts |
| "Mirror Region / standby in minutes / DR" | Elastic Disaster Recovery (CloudEndure DR) |
| "Rotate database credentials / store secrets" | Secrets Manager |
| "Free SSL/TLS certificate" | ACM (Certificate Manager) |
| "User sign-up / sign-in for an app" | Cognito |
| "Single sign-on across many accounts" | IAM Identity Center |
| "Serverless SQL query on S3" | Athena |
| "Serverless ETL / data prep" | Glue |
| "Managed Hadoop / Spark clusters" | EMR |
| "Real-time streaming data" | Kinesis |
| "BI dashboards / visualize data" | QuickSight |
| "Build GenAI app with foundation models" | Bedrock |
| "GenAI work assistant / chat with your data" | Amazon Q |
| "Metrics repository + alarms" | CloudWatch |
| "Real-time log monitoring / adjustable retention" | CloudWatch Logs |
| "Prohibited uses of AWS" | Acceptable Use Policy |
| "SG allowing unrestricted (0.0.0.0/0) access" | Trusted Advisor |
| "Sub-millisecond latency / IoT cache" | ElastiCache for Redis |
| "High throughput to many EC2 nodes at once" | EFS |
| "Object store + highly durable" | Amazon S3 |
| "Buy 3rd-party software / runs on any cloud" | AWS Marketplace |
| "Key benefit of being an AWS Partner" | Partner funding (APN) |
| "Approved catalog of products for the org" | Service Catalog |
| "Report abuse of AWS resources" | Trust & Safety Center |
| "Instructor-led / classroom security training" | AWS Classroom Training + Tech Talks |
| "Reduce TCO" | Minimize capital expenditure (CapEx → OpEx) |
| "Volume-pricing qualification across accounts" | Consolidated Billing |
| "Configuration management responsibility" | Shared (AWS + customer) |
| "Update EC2 host firmware" | AWS responsibility |
| "Managed Active Directory" | Directory Service |
| "Manage WAF/Shield rules org-wide" | Firewall Manager |
| "Unknown/unpredictable S3 access pattern" | S3 Intelligent-Tiering |
| "Cheapest long-term archive (12hr retrieval)" | Glacier Deep Archive |
| "Re-creatable data, single AZ, save cost" | S3 One Zone-IA |
| "Govern secure multi-account landing zone" | Control Tower |
| "Split traffic % / A-B testing DNS" | Route 53 Weighted |
| "Route users to lowest-latency Region" | Route 53 Latency |
| "GPU / ML training instance" | Accelerated Computing (P/G) |
| "750 hours free EC2 / always-free Lambda" | AWS Free Tier |

---

## EXAM DAY TIPS 🎯
- Exam = 65 questions (50 scored + 15 unscored), 90 minutes
- Passing score = 700/1000 (roughly 70%)
- Read ALL options before selecting — AWS loves tricky distractors
- "MOST cost-effective" → think Spot or Reserved
- "LEAST operational overhead" → think managed services (RDS over EC2+MySQL)
- "Minimal downtime migration" → DMS
- "No code changes" → Rehost or Replatform
- "Compliance / regulations" → check if it's HIPAA, PCI DSS, or GDPR
- When stuck between 2 answers → eliminate clearly wrong ones first
