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
