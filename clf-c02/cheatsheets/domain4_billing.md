# Domain 4: Billing, Pricing & Support (12%)

## EC2 Pricing Models

| Model | Description | Best For |
|-------|-------------|----------|
| **On-Demand** | Pay per hour/second, no commitment | Short-term, unpredictable workloads |
| **Reserved (1 or 3 yr)** | Up to 72% discount | Steady-state, predictable usage |
| **Spot Instances** | Up to 90% discount, can be interrupted | Fault-tolerant, flexible workloads |
| **Savings Plans** | Commit $/hr for 1-3 years | Flexible across instance types |
| **Dedicated Hosts** | Physical server for you | Compliance, licensing requirements |

## Free Tier Types
1. **Always Free** - Lambda (1M requests/month), DynamoDB (25GB)
2. **12 Months Free** - EC2 t2.micro, S3 5GB, RDS t2.micro
3. **Trials** - Short-term free trials of services

## Billing & Cost Management Tools

| Tool | Purpose |
|------|---------|
| **AWS Billing Dashboard** | Overview of charges |
| **Cost Explorer** | Visualize & forecast costs |
| **AWS Budgets** | Set alerts when costs exceed threshold |
| **Cost & Usage Report** | Most detailed billing report |
| **Pricing Calculator** | Estimate costs before deploying |
| **Cost Allocation Tags** | Tag resources to track costs by project/team |
| **Compute Optimizer** | Right-size EC2 recommendations |

## AWS Support Plans

| Feature | Basic | Developer | Business | Enterprise |
|---------|-------|-----------|----------|------------|
| Price | Free | $29+/mo | $100+/mo | $15,000+/mo |
| Trusted Advisor | 7 core checks | 7 core checks | Full checks | Full checks |
| Support | Forums only | Email (business hrs) | 24/7 phone/chat | 24/7 + TAM |
| Response Time | - | 12 hrs (general) | 1 hr (production down) | 15 min (critical) |
| TAM | ❌ | ❌ | ❌ | ✅ |
| Concierge | ❌ | ❌ | ❌ | ✅ |

**TAM** = Technical Account Manager (Enterprise only)
**Concierge** = Billing & account experts (Enterprise only)

## AWS Organizations
- **Consolidated Billing** - Single bill for all accounts
- **Volume Discounts** - Aggregated usage across accounts
- **SCPs** - Service Control Policies (restrict what accounts can do)
- **OUs** - Organizational Units (group accounts)

## Other Pricing Concepts
- **Data Transfer IN** = Free (always)
- **Data Transfer OUT** = Costs money
- **S3 Pricing** = Storage + requests + data transfer out
- **Lambda Pricing** = Requests + duration (GB-seconds)
- **EC2 Pricing** = Instance hours + data transfer + EBS

## AWS Marketplace
- Buy/sell third-party software
- AMIs, SaaS, containers
- Flexible pricing (hourly, monthly, annual, BYOL)

## Key Billing Concepts
- **CapEx** - Capital Expenditure (upfront, on-prem)
- **OpEx** - Operational Expenditure (pay-as-you-go, cloud)
- **TCO** - Total Cost of Ownership (compare on-prem vs cloud)
