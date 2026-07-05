# Training Progress - Day 4

## Topics Covered

### Domain 4: Billing & Support ✅
- [x] EC2 Pricing Models (On-Demand, Reserved, Spot, Savings Plans, Dedicated Hosts)
- [x] Reserved Instances vs Savings Plans (deep dive)
- [x] Billing & Cost Management Tools (Cost Explorer, Budgets, Pricing Calculator, CUR)
- [x] AWS Support Plans (Basic, Developer, Business, Enterprise On-Ramp, Enterprise)
- [x] AWS Organizations & Consolidated Billing & SCPs

## Quiz Scores (During Training)
- EC2 Pricing Models Quiz: 4/4 ✅
- Reserved vs Savings Plans Quiz: 4/4 ✅
- Billing Tools Quiz: 4/4 ✅
- Support Plans Quiz: 4/5 (confused Developer vs Business for 24/7 support)
- Organizations Quiz: 4/4 ✅

## Key Mistakes to Review
1. **Support Plans 24/7** — 24/7 phone/email/chat starts at Business plan, Developer = email only during business hours
2. **Reserved vs Savings Plans** — Reserved = specific instance/region, Savings Plans = commit $/hour, more flexible

## Key Concepts to Remember

### EC2 Pricing
- **On-Demand** = no commitment, most expensive, unpredictable workloads
- **Reserved** = 1 or 3 year commit, up to 72%, specific instance/region
- **Spot** = up to 90% discount, can be interrupted, batch jobs only
- **Savings Plans** = commit $/hour, up to 72%, flexible (EC2+Lambda+Fargate)
- **Dedicated Hosts** = physical server for you, compliance/BYOL

### Billing Tools
- **Cost Explorer** = analyze past spending, forecast future costs
- **Budgets** = alert when spending exceeds threshold
- **Pricing Calculator** = estimate costs BEFORE deploying
- **CUR** = most detailed line-by-line billing report

### Support Plans
| Plan | Price | 24/7 | TAM | Critical Response |
|------|-------|------|-----|-------------------|
| Basic | Free | ❌ | ❌ | ❌ |
| Developer | $29/mo | ❌ | ❌ | ❌ |
| Business | $100/mo | ✅ | ❌ | 1 hour |
| Enterprise On-Ramp | $5,500/mo | ✅ | Pool | 30 minutes |
| Enterprise | $15,000/mo | ✅ | Dedicated | 15 minutes |

### AWS Organizations
- **Consolidated Billing** = one bill for all accounts + volume discounts
- **SCPs** = restrict what accounts can do (does NOT grant permissions)
- **Management Account** = pays for all accounts

## Still Remaining
- [ ] Full practice tests
- [ ] Review all weak areas across all domains
