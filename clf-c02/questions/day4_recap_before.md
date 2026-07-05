# Quick Recap — Day 1 + Day 2 + Day 3 | 30 Questions
# (Before starting Day 4)

## Instructions
- Write your answer(s) in the "Your Answer" field
- Questions marked (Choose 2) require 2 answers
- No time limit — this is just a recap!

---

## Q1. (Choose 1)
Which service automatically distributes incoming traffic across multiple EC2 instances?
- A) Auto Scaling
- B) CloudFront
- C) ELB
- D) Route 53

**Your Answer:**C

---

## Q2. (Choose 1)
A company moves their app to AWS without any changes. Which migration strategy?
- A) Replatform
- B) Rehost
- C) Refactor
- D) Repurchase

**Your Answer:**B

---

## Q3. (Choose 1)
Which Well-Architected pillar focuses on recovering from failures and scaling to meet demand?
- A) Security
- B) Operational Excellence
- C) Cost Optimization
- D) Reliability

**Your Answer:**D

---

## Q4. (Choose 1)
A company wants to protect their web app from SQL injection attacks. Which service?
- A) Shield
- B) GuardDuty
- C) WAF
- D) Inspector

**Your Answer:**C

---

## Q5. (Choose 2)
Which TWO are the customer's responsibility under the Shared Responsibility Model? (Choose 2)
- A) Physical security of data centers
- B) Patching OS on EC2 instances
- C) Managing the hypervisor
- D) Configuring IAM permissions
- E) Maintaining networking hardware

**Your Answer:**B, D

---

## Q6. (Choose 1)
Which database is best for storing graph relationships like social networks?
- A) DynamoDB
- B) QLDB
- C) Neptune
- D) Redshift

**Your Answer:**C

---

## Q7. (Choose 1)
A company keeps sensitive data on-premises but runs their website on AWS. Which deployment model?
- A) Public Cloud
- B) Private Cloud
- C) Hybrid Cloud
- D) Multi-cloud

**Your Answer:**C

---

## Q8. (Choose 1)
Which service detects threats by monitoring CloudTrail logs, VPC Flow Logs, and DNS logs using ML?
- A) Inspector
- B) Macie
- C) WAF
- D) GuardDuty

**Your Answer:**D

---

## Q9. (Choose 1)
A company redesigns their monolithic app into microservices using Lambda. Which migration strategy?
- A) Rehost
- B) Replatform
- C) Refactor
- D) Repurchase

**Your Answer:**C

---

## Q10. (Choose 2)
Which TWO services are Infrastructure as Code? (Choose 2)
- A) Elastic Beanstalk
- B) CloudFormation
- C) CDK
- D) Systems Manager
- E) Trusted Advisor

**Your Answer:**B,C

---

## Q11. (Choose 1)
Which service records ALL API calls in your AWS account — who did what and when?
- A) CloudWatch
- B) CloudTrail
- C) AWS Config
- D) Trusted Advisor

**Your Answer:**B

---

## Q12. (Choose 1)
A company needs full control over encryption keys and AWS should have zero access. Which service?
- A) KMS
- B) CloudHSM
- C) Shield
- D) Macie

**Your Answer:**B

---

## Q13. (Choose 1)
Which AWS infrastructure component is used by CloudFront to cache content closer to users?
- A) Regions
- B) Availability Zones
- C) Edge Locations
- D) Local Zones

**Your Answer:**C

---

## Q14. (Choose 1)
A company discovers 25% of their apps are unused during migration. Which strategy applies?
- A) Retain
- B) Rehost
- C) Repurchase
- D) Retire

**Your Answer:**D

---

## Q15. (Choose 2)
Which TWO services decouple microservices? (Choose 2)
- A) SQS
- B) CloudFormation
- C) SNS
- D) Step Functions
- E) CloudTrail

**Your Answer:**A,C

---

## Q16. (Choose 1)
Moving from buying physical servers (CapEx) to monthly AWS bills (OpEx) is an example of which cloud benefit?
- A) Economies of scale
- B) Go global in minutes
- C) Trade fixed expense for variable expense
- D) Stop guessing capacity

**Your Answer:**C

---

## Q17. (Choose 1)
Which service scans EC2 instances for software vulnerabilities and open ports?
- A) GuardDuty
- B) Macie
- C) Inspector
- D) WAF

**Your Answer:**C

---

## Q18. (Choose 1)
A company needs to run 5 Lambda functions in a specific order. Which service?
- A) SQS
- B) SNS
- C) EventBridge
- D) Step Functions

**Your Answer:**D

---

## Q19. (Choose 1)
Which service provides a dedicated private physical connection from on-premises to AWS?
- A) VPN
- B) Internet Gateway
- C) Transit Gateway
- D) Direct Connect

**Your Answer:**D

---

## Q20. (Choose 2)
Which TWO factors should a company consider when selecting an AWS Region? (Choose 2)
- A) Number of Edge Locations
- B) Compliance and data residency
- C) Latency to end users
- D) Number of IAM users
- E) CloudFront cache size

**Your Answer:**B,C

---

## Q21. (Choose 1)
Which service discovers sensitive data like credit card numbers stored in S3?
- A) GuardDuty
- B) Inspector
- C) Macie
- D) Shield

**Your Answer:**M

---

## Q22. (Choose 1)
A company uses CloudWatch alarms and automated runbooks to fix issues automatically. Which Well-Architected pillar?
- A) Reliability
- B) Security
- C) Operational Excellence
- D) Cost Optimization

**Your Answer:**C

---

## Q23. (Choose 1)
Which service connects multiple VPCs and on-premises networks through a single central hub?
- A) VPN
- B) Direct Connect
- C) Transit Gateway
- D) Internet Gateway

**Your Answer:**C

---

## Q24. (Choose 1)
A company moves their MySQL database to RDS without changing any application code. Which migration strategy?
- A) Rehost
- B) Refactor
- C) Repurchase
- D) Replatform

**Your Answer:**D

---

## Q25. (Choose 1)
Which EC2 pricing model gives up to 90% discount but can be interrupted by AWS anytime?
- A) On-Demand
- B) Reserved Instances
- C) Spot Instances
- D) Savings Plans

**Your Answer:**C

---

## Q26. (Choose 2)
Which TWO are correct about Security Groups and NACLs? (Choose 2)
- A) Security Groups are stateless
- B) NACLs can explicitly DENY traffic
- C) Security Groups operate at subnet level
- D) Security Groups are stateful
- E) NACLs only support Allow rules

**Your Answer:**B,D

---

## Q27. (Choose 1)
AWS is able to offer lower prices because it buys hardware for millions of customers. Which cloud benefit?
- A) Increase speed and agility
- B) Stop guessing capacity
- C) Massive economies of scale
- D) Trade fixed expense for variable expense

**Your Answer:**C

---

## Q28. (Choose 1)
Which IAM entity gives temporary access to AWS services like EC2 accessing S3?
- A) IAM User
- B) IAM Group
- C) IAM Policy
- D) IAM Role

**Your Answer:**D

---

## Q29. (Choose 2)
Which TWO are correct about Aurora? (Choose 2)
- A) Aurora is 5x faster than standard MySQL
- B) Aurora is a NoSQL database
- C) Aurora is compatible with MySQL and PostgreSQL
- D) Aurora is best for data warehousing
- E) Aurora is cheaper than RDS

**Your Answer:**A,C

---

## Q30. (Choose 1)
Which service allows companies to run AWS services inside their own on-premises data center?
- A) Direct Connect
- B) VPN
- C) AWS Outposts
- D) Transit Gateway

**Your Answer:**C

---

## Score Card
| Q | Type | Your Answer | Correct? |
|---|------|-------------|----------|
| Q1  | Single | C | ✅ |
| Q2  | Single | B | ✅ |
| Q3  | Single | D | ✅ |
| Q4  | Single | C | ✅ |
| Q5  | Multi  | B,D | ✅ |
| Q6  | Single | C | ✅ |
| Q7  | Single | C | ✅ |
| Q8  | Single | D | ✅ |
| Q9  | Single | C | ✅ |
| Q10 | Multi  | B,C | ✅ |
| Q11 | Single | B | ✅ |
| Q12 | Single | B | ✅ |
| Q13 | Single | C | ✅ |
| Q14 | Single | D | ✅ |
| Q15 | Multi  | A,C | ✅ |
| Q16 | Single | C | ✅ |
| Q17 | Single | C | ✅ |
| Q18 | Single | D | ✅ |
| Q19 | Single | D | ✅ |
| Q20 | Multi  | B,C | ✅ |
| Q21 | Single | M | ❌ (Correct: C — Macie, typo in answer) |
| Q22 | Single | C | ✅ |
| Q23 | Single | C | ✅ |
| Q24 | Single | D | ✅ |
| Q25 | Single | C | ✅ |
| Q26 | Multi  | B,D | ✅ |
| Q27 | Single | C | ✅ |
| Q28 | Single | D | ✅ |
| Q29 | Multi  | A,C | ✅ |
| Q30 | Single | C | ✅ |

**Total Score: 29/30**
