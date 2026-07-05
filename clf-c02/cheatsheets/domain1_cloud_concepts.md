# Domain 1: Cloud Concepts (24%)

## 6 Advantages of Cloud Computing
1. **Trade CapEx for OpEx** - Pay only for what you consume
2. **Benefit from massive economies of scale** - Lower prices due to aggregated usage
3. **Stop guessing capacity** - Scale up/down as needed
4. **Increase speed & agility** - Resources in minutes, not weeks
5. **Stop spending money on data centers** - Focus on business, not infrastructure
6. **Go global in minutes** - Deploy worldwide with few clicks

## Cloud Computing Models
| Model | What You Manage | Example |
|-------|----------------|---------|
| IaaS | OS, Apps, Data | EC2 |
| PaaS | Apps & Data only | Elastic Beanstalk |
| SaaS | Nothing (just use it) | Gmail, Salesforce |

## Deployment Models
- **Public Cloud** - AWS, Azure, GCP (fully cloud)
- **Private Cloud** - On-premises (e.g., VMware)
- **Hybrid Cloud** - Mix of public + private

## Well-Architected Framework (6 Pillars)
1. **Operational Excellence** - Run & monitor systems
2. **Security** - Protect data & systems
3. **Reliability** - Recover from failures
4. **Performance Efficiency** - Use resources efficiently
5. **Cost Optimization** - Avoid unnecessary costs
6. **Sustainability** - Minimize environmental impact

## 6 R's of Migration
1. **Rehost** - Lift & shift (move as-is)
2. **Replatform** - Lift & reshape (minor optimizations)
3. **Refactor** - Re-architect (cloud-native)
4. **Repurchase** - Move to SaaS (e.g., CRM to Salesforce)
5. **Retire** - Turn off what's not needed
6. **Retain** - Keep on-premises (not ready to migrate)

## AWS Global Infrastructure
- **Regions** - Geographic areas (e.g., us-east-1)
- **Availability Zones (AZs)** - 2+ data centers in a region
- **Edge Locations** - CDN endpoints for CloudFront (200+)
- **Local Zones** - Extensions of regions closer to users

### How to Choose a Region?
1. Compliance/data governance
2. Proximity to customers (latency)
3. Available services
4. Pricing (varies by region)

## Key Concepts
- **Elasticity** - Auto scale resources up/down
- **Scalability** - Ability to handle growth (vertical/horizontal)
- **High Availability** - System remains accessible (multi-AZ)
- **Fault Tolerance** - System operates despite failures
- **Agility** - Quickly provision resources
