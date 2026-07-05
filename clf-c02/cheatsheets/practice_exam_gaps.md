# Practice Exam Gap Training — Must-Know Concepts

## 1. AWS Artifact
- A portal to download **compliance reports** (SOC 1/2/3, PCI DSS, ISO 27001)
- Also manage **agreements** (BAA - Business Associate Agreement for HIPAA)
- FREE service
- **Exam keyword:** "compliance reports", "audit documents", "agreements" → AWS Artifact

---

## 2. AWS Organizations + SCPs

### AWS Organizations
- Manage **multiple AWS accounts** from one central place
- **Consolidated Billing** — single bill for all accounts
- **Volume discounts** — aggregated usage across all accounts = cheaper
- **OUs (Organizational Units)** — group accounts (e.g., Dev OU, Prod OU)

### SCPs (Service Control Policies)
- Restrict what services/actions accounts in the organization CAN use
- Applied to OUs or individual accounts
- Does NOT grant permissions — only restricts (like a guardrail)
- Example: "No account in Dev OU can launch EC2 instances larger than t3.medium"

**Exam keyword:** "centrally manage multiple accounts" → AWS Organizations
**Exam keyword:** "restrict services across accounts" → SCPs

---

## 3. AMI (Amazon Machine Image)
- A **template/snapshot** of an EC2 instance (OS + software + config)
- Use it to launch identical copies of an instance
- Can be shared across accounts or made public
- Can copy AMIs across regions

**Exam keyword:** "create identical copies of EC2", "template for launching instances" → AMI

---

## 4. Reserved Instance Types

### Payment Options (more upfront = more discount):
| Option | Discount Level |
|--------|---------------|
| All Upfront | Highest discount |
| Partial Upfront | Medium discount |
| No Upfront | Lowest discount (but still cheaper than On-Demand) |

### RI Types:
| Type | Can Change? |
|------|-------------|
| **Standard RI** | Cannot change instance type (locked in) |
| **Convertible RI** | CAN change instance type, OS, tenancy (less discount than Standard) |

**Exam keyword:** "change instance type during reservation" → Convertible RI
**Exam keyword:** "maximum discount for reserved" → All Upfront + Standard RI

---

## 5. Shared Responsibility — Service-Specific Rules

The responsibility SHIFTS based on how managed the service is:

| Service | Customer Manages | AWS Manages |
|---------|-----------------|-------------|
| **EC2** | OS patching, firewall, data, apps | Hardware, hypervisor, physical |
| **RDS** | Data, schema, access control | OS patching, DB patching, backups, HA |
| **Lambda** | Code, data, IAM | Everything else (OS, scaling, patching, servers) |
| **S3** | Data, access policies, encryption config | Infrastructure, durability, availability |

**Key rule:** "Responsibilities vary depending on the services used" — TRUE!

---

## 6. AWS Support Plans — Response Times

| Severity | Business | Enterprise |
|----------|----------|------------|
| General guidance | 24 hours | 24 hours |
| System impaired | 12 hours | 12 hours |
| Production system impaired | 4 hours | 4 hours |
| Production system down | 1 hour | 1 hour |
| Business-critical system down | N/A | **15 minutes** |

### Key Features:
| Feature | Basic | Developer | Business | Enterprise |
|---------|-------|-----------|----------|------------|
| Trusted Advisor (full) | ❌ | ❌ | ✅ | ✅ |
| 24/7 phone/chat | ❌ | ❌ | ✅ | ✅ |
| TAM | ❌ | ❌ | ❌ | ✅ |
| Concierge | ❌ | ❌ | ❌ | ✅ |
| Infrastructure Event Mgmt | ❌ | ❌ | Extra fee | ✅ |

**Exam keyword:** "15 minute response" → Enterprise only
**Exam keyword:** "TAM" → Enterprise only
**Exam keyword:** "Concierge (billing help)" → Enterprise only
**Exam keyword:** "24/7 phone support minimum" → Business

---

## 7. Security Groups vs NACLs (Deep)

| Feature | Security Group | NACL |
|---------|---------------|------|
| Level | Instance | Subnet |
| Stateful/Stateless | **Stateful** (return traffic auto-allowed) | **Stateless** (must allow both directions) |
| Rules | Allow only | Allow AND Deny |
| Default Inbound | All DENIED | All ALLOWED |
| Default Outbound | All ALLOWED | All ALLOWED |
| Rule evaluation | All rules evaluated together | Rules evaluated by number (lowest first, first match wins) |

**Exam keyword:** "filter traffic at instance level" → Security Group
**Exam keyword:** "filter traffic at subnet level" → NACL
**Exam keyword:** "deny specific IP" → NACL (Security Groups can't deny)

---

## 8. AWS WAF vs Shield vs Shield Advanced

| Service | Protects Against | Cost |
|---------|-----------------|------|
| **Shield Standard** | Basic DDoS (Layer 3/4) | FREE (automatic) |
| **Shield Advanced** | Advanced DDoS + cost protection + 24/7 DRT team | $3,000/month |
| **WAF** | Application attacks (Layer 7): SQL injection, XSS, bad bots | Pay per rule/request |

**Exam keyword:** "DDoS protection" → Shield
**Exam keyword:** "SQL injection, XSS, application layer" → WAF
**Exam keyword:** "DDoS cost protection" → Shield Advanced

---

## 9. S3 Transfer Acceleration
- Uses **CloudFront edge locations** to speed up UPLOADS to S3
- Data goes to nearest edge location → then AWS backbone network → S3 bucket
- Useful for global users uploading to a single S3 bucket

**Exam keyword:** "speed up uploads to S3", "edge locations for S3 transfer" → S3 Transfer Acceleration

---

## 10. AWS X-Ray
- **Debug and trace** distributed applications (microservices)
- Shows how requests flow through your app
- Identifies performance bottlenecks and errors
- Visual service map

**Exam keyword:** "trace requests", "debug microservices", "find performance bottlenecks in distributed app" → X-Ray

---

## 11. AWS Global Accelerator
- Directs traffic to optimal AWS endpoint using **AWS global network** (not public internet)
- Improves performance for global users (up to 60% improvement)
- Provides 2 static IP addresses
- NOT caching (that's CloudFront)

**CloudFront vs Global Accelerator:**
- CloudFront = caches CONTENT at edge locations
- Global Accelerator = routes TRAFFIC through AWS network (no caching)

**Exam keyword:** "improve global application performance, static IPs" → Global Accelerator
**Exam keyword:** "cache content at edge" → CloudFront

---

## 12. ECS vs Fargate

| Service | What it is |
|---------|-----------|
| **ECS (Elastic Container Service)** | Run Docker containers ON EC2 instances (you manage EC2) |
| **Fargate** | Run Docker containers WITHOUT managing EC2 (serverless containers) |

**Exam keyword:** "containers on EC2" → ECS
**Exam keyword:** "serverless containers" → Fargate

---

## 13. SDK vs CLI vs Console

| Tool | What it is | Used by |
|------|-----------|---------|
| **Console** | Web browser GUI | Anyone (point and click) |
| **CLI (Command Line Interface)** | Terminal commands | Admins, scripts |
| **SDK (Software Development Kit)** | Programming language libraries | Developers (Python, Java, etc.) |

All three use **Access Keys** for programmatic access (CLI + SDK).
Console uses **username + password**.

---

## 14. Cost Explorer vs Cost & Usage Report vs Budgets

| Tool | Purpose |
|------|---------|
| **Cost Explorer** | VISUALIZE spending (graphs, trends, forecast future costs) |
| **Cost & Usage Report** | Most DETAILED/GRANULAR billing data (downloadable CSV) |
| **Budgets** | Set ALERTS when spending exceeds a threshold |
| **Pricing Calculator** | ESTIMATE costs BEFORE deploying |

**Exam keyword:** "visualize spending, forecast" → Cost Explorer
**Exam keyword:** "most granular/detailed billing" → Cost & Usage Report
**Exam keyword:** "alert when bill exceeds $X" → Budgets
**Exam keyword:** "estimate future costs" → Pricing Calculator

---

## 15. Well-Architected Framework — 6 Pillars

| Pillar | Focus | Example |
|--------|-------|---------|
| **Operational Excellence** | Run & monitor, improve processes | CloudFormation (IaC), automate |
| **Security** | Protect data & systems | IAM, encryption, least privilege |
| **Reliability** | Recover from failures, meet demand | Multi-AZ, Auto Scaling, backups |
| **Performance Efficiency** | Use resources efficiently | Right-sizing, serverless, caching |
| **Cost Optimization** | Avoid unnecessary costs | Reserved Instances, right-sizing |
| **Sustainability** | Minimize environmental impact | Efficient workloads, managed services |

**Common exam trap:**
- "Recover from failures" = Reliability (NOT Operational Excellence)
- "Monitor and improve processes" = Operational Excellence
- "Use serverless" = Performance Efficiency

---

## 16. Elasticity vs Scalability vs HA vs Fault Tolerance

| Concept | Meaning |
|---------|---------|
| **Elasticity** | Automatically scale UP and DOWN based on demand (dynamic) |
| **Scalability** | Ability to handle growth (can be manual) |
| **High Availability** | System stays accessible (minimal downtime, multi-AZ) |
| **Fault Tolerance** | System keeps working EVEN when components fail (zero downtime) |

**Key difference:**
- HA = "System might have brief interruption during failover"
- Fault Tolerance = "System has ZERO interruption, even during failure"

**Exam keyword:** "dynamically adjust capacity" → Elasticity
**Exam keyword:** "no downtime even when instances crash" → Fault Tolerance

---

## 17. Decoupling / Loose Coupling
- Break application into independent components
- If one component fails, others keep working
- Use SQS, SNS, EventBridge to decouple
- Opposite of "monolithic" architecture

**Exam keyword:** "reduce inter-dependencies", "failure doesn't impact other components" → Loose coupling / Decoupling

---

## 18. TCO (Total Cost of Ownership)
- Compare TOTAL cost of on-premises vs cloud
- On-premises includes: hardware, power, cooling, space, staff, maintenance
- Cloud: just pay for what you use (OpEx)
- AWS Migration Evaluator (formerly TSO Logic) helps calculate TCO

**Exam keyword:** "compare on-premises vs cloud costs" → TCO analysis
**Exam keyword:** "physical hardware, cooling, power costs" → TCO factors

---

## 19. AWS CAF (Cloud Adoption Framework)
- Framework to help organizations plan cloud migration
- 6 Perspectives:
  1. **Business** — align IT with business goals
  2. **People** — HR, training, organizational change
  3. **Governance** — IT governance, risk management
  4. **Platform** — architecture, infrastructure
  5. **Security** — security controls
  6. **Operations** — day-to-day operations

**Exam keyword:** "road map to cloud adoption", "framework for migration planning" → AWS CAF

---

## 20. Consolidated Billing & Volume Discounts
- All accounts in AWS Organization get ONE combined bill
- Usage is AGGREGATED → higher volume = lower price per unit
- Reserved Instance benefits are SHARED across all accounts in the organization
- Example: Account A buys RI → Account B can also benefit from the discount

**Exam keyword:** "share RI discounts across accounts" → Consolidated Billing
**Exam keyword:** "volume discounts across accounts" → AWS Organizations

---

## 21. Additional Services from Practice Exams

| Service | What it does |
|---------|-------------|
| **AWS OpsWorks** | Configuration management using Chef/Puppet |
| **AWS Service Catalog** | Create approved catalog of IT services for your org |
| **Amazon EMR (Elastic MapReduce)** | Big data processing (Hadoop, Spark) |
| **AWS Glue** | ETL (Extract, Transform, Load) — serverless data prep |
| **Amazon Athena** | Query S3 data using SQL (serverless) |
| **Amazon Kinesis** | Real-time streaming data processing |
| **AWS Storage Gateway** | Hybrid storage (on-prem ↔ cloud bridge) |
| **AWS DataSync** | Fast data transfer between on-prem and AWS |
| **Amazon Connect** | Cloud contact center (phone support) |
| **AWS Quick Starts** | Pre-built templates to deploy popular tech fast |
| **AWS Professional Services** | AWS team that helps with migration/adoption |
| **APN (AWS Partner Network)** | Consulting Partners + Technology Partners |
| **AWS Abuse Team** | Report malicious use of AWS resources |
| **ACM (AWS Certificate Manager)** | Free SSL/TLS certificates |
| **Amazon Cognito** | User sign-up/sign-in for apps (authentication) |
| **AWS SES (Simple Email Service)** | Send marketing/transactional emails |

---

## 22. EC2 Billing Details
- **Linux instances** — billed per SECOND (minimum 1 minute)
- **Windows instances** — billed per HOUR
- **On-Demand** — no startup fee, no commitment
- **Data Transfer IN** — always FREE
- **Data Transfer OUT** — costs money
- **Elastic IP** — FREE if attached to running instance, CHARGED if unused

---

## 23. Key Exam Traps from Practice Tests

1. "Manage agreements with AWS" → **Artifact** (not Organizations)
2. "Centrally manage billing + security across accounts" → **Organizations** (not Artifact)
3. "AWS resources you don't remember creating" → Check CloudTrail + change passwords
4. "Penetration testing" → Customer CAN do it without AWS permission (on their own instances)
5. "New IAM user can't do anything" → By default, new users have NO permissions (implicit deny)
6. "Highest level of availability" → Multi-Region + Multi-AZ (not just Multi-AZ)
7. "Cost-effective for 2 months" → On-Demand (Reserved needs 1+ year)
8. "Spot instance + recover quickly from failure" → Spot IS correct (because app is fault-tolerant, it can handle interruptions)
9. "Object-level storage" → S3 (not EBS, not EFS)
10. "Unpredictable access patterns for S3" → S3 Intelligent-Tiering
