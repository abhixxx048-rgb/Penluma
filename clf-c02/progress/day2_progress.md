# Training Progress - Day 2

## Topics Covered

### Domain 2: Security & Compliance ✅
- [x] Shared Responsibility Model
- [x] IAM (Users, Groups, Roles, Policies)
- [x] Security Services (WAF, Shield, GuardDuty, Inspector, Macie, Security Hub)
- [x] Encryption (KMS, CloudHSM, at-rest vs in-transit)
- [x] Compliance & AWS Artifact (HIPAA, PCI DSS, GDPR, ISO 27001, SOC 2)
- [x] Network Security (Security Groups, NACLs, VPC, Public/Private Subnets)

## Quiz Scores (During Training)
- Shared Responsibility Quiz: 3/3 ✅
- IAM Quiz: 4/4 ✅
- Security Services Quiz: 5/5 ✅
- GuardDuty vs Inspector Deep Dive: 5/5 ✅
- Encryption Quiz: 4/4 ✅
- Compliance Quiz: 2/3 (PCI DSS vs ISO 27001 confusion)
- Network Security Quiz: 4/4 ✅

## Revision Test Scores
- Day 2 Revision Test (25Q): 23/25
- Mixed Exam Day1+Day2 (60Q): 51/60 (85%)

## Mistakes Fixed (Deep Dive Training)
1. **IAM Groups cannot be nested** — Groups are flat, use Roles for temporary/service access ✅
2. **Elastic Beanstalk is NOT IaC** — IaC = CloudFormation + CDK only ✅
3. **SQS + SNS = decouple microservices** — CloudFormation/Systems Manager have nothing to do with decoupling ✅
4. **Snow Family ≠ DB migration** — Snow = physical data transfer, DMS = database migration, Migration Hub = tracking ✅
5. **CloudFront does traffic routing** — CloudFront = CDN + edge routing, Transit Gateway = VPC connectivity ✅
6. **API Gateway ≠ Route 53** — API Gateway = create/manage APIs, Route 53 = DNS only ✅
7. **GDPR = European data privacy** — typo in exam (G instead of C) ✅
8. **Aurora = 5x faster than MySQL** — Aurora ≠ RDS MySQL, Aurora is cloud-native and faster ✅
9. **SNS + EventBridge = event-driven** — Step Functions = ordered workflow, not event-driven broadcasting ✅

## Key Concepts to Remember
- **WAF** = web attacks (SQL injection, XSS) | **Shield** = DDoS | **GuardDuty** = threat detection | **Inspector** = vulnerability scan | **Macie** = sensitive data in S3
- **KMS** = AWS helps manage keys | **CloudHSM** = you fully manage keys, dedicated hardware
- **Security Group** = stateful, instance level, allow only | **NACL** = stateless, subnet level, allow + deny
- **SQS** = queue (1→1) | **SNS** = broadcast (1→many) | **EventBridge** = event trigger | **Step Functions** = ordered workflow
- **CloudTrail** = WHO did what | **Config** = HOW resource changed over time
- **Aurora** = 5x faster MySQL, cloud-native | **RDS** = standard managed DB

## Still Remaining
- [ ] Domain 1: Cloud Concepts (Well-Architected Framework, 6 R's, deployment models)
- [ ] Domain 4: Billing (pricing models, support plans, Cost Explorer, Organizations)
- [ ] Full practice tests
