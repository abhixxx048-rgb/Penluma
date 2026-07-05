# Quick Recap — Day 1 + Day 2 | 30 Questions
# (Before starting Day 3)

## Instructions
- Write your answer(s) in the "Your Answer" field
- Questions marked (Choose 2) require 2 answers
- No time limit — this is just a recap!

---

## Q1. (Choose 1)
Which service automatically adds or removes EC2 instances based on traffic demand?
- A) ELB
- B) Auto Scaling
- C) CloudFormation
- D) Elastic Beanstalk

**Your Answer:**A

---

## Q2. (Choose 1)
Which service records ALL API calls in your AWS account — who did what and when?
- A) CloudWatch
- B) AWS Config
- C) CloudTrail
- D) Trusted Advisor

**Your Answer:**C

---

## Q3. (Choose 1)
A company wants to see how their Security Group configuration looked 3 months ago. Which service?
- A) CloudTrail
- B) CloudWatch
- C) AWS Config
- D) Systems Manager

**Your Answer:**C

---

## Q4. (Choose 1)
Which database is best for storing immutable, cryptographically verifiable financial records?
- A) DynamoDB
- B) Neptune
- C) Aurora
- D) QLDB

**Your Answer:**D

---

## Q5. (Choose 2)
Which TWO services are Infrastructure as Code (IaC)? (Choose 2)
- A) Elastic Beanstalk
- B) CloudFormation
- C) CDK
- D) Systems Manager
- E) Trusted Advisor

**Your Answer:**B,C

---

## Q6. (Choose 1)
An EC2 instance is communicating with a known malicious IP address. Which service detects this?
- A) Inspector
- B) Macie
- C) GuardDuty
- D) WAF

**Your Answer:**C

---

## Q7. (Choose 1)
A company wants to scan EC2 instances for open ports and outdated software vulnerabilities. Which service?
- A) GuardDuty
- B) Inspector
- C) Macie
- D) Shield

**Your Answer:**B

---

## Q8. (Choose 1)
Which service discovers sensitive data like credit card numbers stored in S3?
- A) GuardDuty
- B) Inspector
- C) Macie
- D) WAF

**Your Answer:**C

---

## Q9. (Choose 2)
Which TWO are the customer's responsibility under the Shared Responsibility Model? (Choose 2)
- A) Physical security of data centers
- B) Patching OS on EC2 instances
- C) Managing the hypervisor
- D) Configuring IAM permissions
- E) Maintaining networking hardware

**Your Answer:**B,D

---

## Q10. (Choose 1)
A bank needs full control over encryption keys and AWS should have zero access. Which service?
- A) KMS
- B) Shield
- C) CloudHSM
- D) Macie

**Your Answer:**C

---

## Q11. (Choose 1)
Which service is a NoSQL database with single-digit millisecond performance at any scale?
- A) RDS
- B) Aurora
- C) DynamoDB
- D) Redshift

**Your Answer:**C

---

## Q12. (Choose 1)
A company needs to physically transport 80 TB of data to AWS. Which Snow Family device?
- A) Snowcone
- B) Snowball Edge
- C) Snowmobile
- D) DMS

**Your Answer:**B

---

## Q13. (Choose 1)
Which service connects multiple VPCs and on-premises networks through a single central hub?
- A) VPN
- B) Direct Connect
- C) Internet Gateway
- D) Transit Gateway

**Your Answer:**D

---

## Q14. (Choose 2)
Which TWO services decouple microservices? (Choose 2)
- A) SQS
- B) CloudFormation
- C) SNS
- D) CloudTrail
- E) Step Functions

**Your Answer:**A,C

---

## Q15. (Choose 1)
A company needs to run 5 Lambda functions in a specific sequence. Which service?
- A) SQS
- B) SNS
- C) Step Functions
- D) EventBridge

**Your Answer:**C

---

## Q16. (Choose 1)
Which service caches content at edge locations worldwide to reduce latency for global users?
- A) Route 53
- B) API Gateway
- C) CloudFront
- D) Transit Gateway

**Your Answer:**C

---

## Q17. (Choose 1)
A developer built a Lambda function and wants to expose it as a REST API. Which service?
- A) Route 53
- B) CloudFront
- C) API Gateway
- D) Transit Gateway

**Your Answer:**C

---

## Q18. (Choose 1)
Which compliance standard applies to protecting European customer personal data?
- A) HIPAA
- B) PCI DSS
- C) SOC 2
- D) GDPR

**Your Answer:**D

---

## Q19. (Choose 1)
A company needs to download AWS compliance reports for their auditor. Where?
- A) AWS Config
- B) AWS Artifact
- C) Trusted Advisor
- D) Security Hub

**Your Answer:**B

---

## Q20. (Choose 2)
Which TWO are correct about Security Groups? (Choose 2)
- A) Stateless
- B) Stateful
- C) Applied at subnet level
- D) Applied at instance level
- E) Supports explicit Deny rules

**Your Answer:**B,D

---

## Q21. (Choose 1)
A company wants to explicitly DENY traffic from a specific IP in their VPC. Which service?
- A) Security Group
- B) WAF
- C) NACL
- D) GuardDuty

**Your Answer:**C

---

## Q22. (Choose 1)
Which service is a data warehouse for running complex analytics on petabytes of data?
- A) RDS
- B) DynamoDB
- C) Aurora
- D) Redshift

**Your Answer:**D

---

## Q23. (Choose 1)
A company wants to migrate their Oracle database to Aurora with minimal downtime. Which service?
- A) Snowball Edge
- B) Migration Hub
- C) DMS
- D) DataSync

**Your Answer:**C

---

## Q24. (Choose 1)
Which EC2 pricing model gives up to 90% discount but can be interrupted by AWS anytime?
- A) On-Demand
- B) Reserved Instances
- C) Spot Instances
- D) Savings Plans

**Your Answer:**C

---

## Q25. (Choose 1)
A company wants to analyze sentiment in customer reviews automatically. Which service?
- A) Rekognition
- B) Lex
- C) Comprehend
- D) Textract

**Your Answer:**C

---

## Q26. (Choose 1)
Which service provides best practice recommendations across cost, security, performance, fault tolerance, and service limits?
- A) CloudWatch
- B) AWS Config
- C── Security Hub
- D) Trusted Advisor

**Your Answer:**D

---

## Q27. (Choose 2)
Which TWO are correct about Aurora? (Choose 2)
- A) Aurora is 5x faster than standard MySQL
- B) Aurora is best for data warehousing
- C) Aurora is compatible with MySQL and PostgreSQL
- D) Aurora is cheaper than RDS
- E) Aurora is a NoSQL database

**Your Answer:**A,E

---

## Q28. (Choose 1)
When an EC2 instance is terminated, a company wants to automatically trigger a Lambda function. Which service?
- A) SQS
- B) SNS
- C) Step Functions
- D) EventBridge

**Your Answer:**D

---

## Q29. (Choose 1)
Which IAM entity gives temporary access to AWS services like EC2 accessing S3?
- A) IAM User
- B) IAM Group
- C) IAM Role
- D) IAM Policy

**Your Answer:**C

---

## Q30. (Choose 2)
Which TWO are correct about KMS and CloudHSM? (Choose 2)
- A) CloudHSM uses dedicated physical hardware
- B) KMS gives AWS zero access to your keys
- C) KMS is cheaper than CloudHSM
- D) CloudHSM is fully managed by AWS
- E) Both store keys in software

**Your Answer:**A,C

---

## Score Card
| Q | Type | Your Answer | Correct? |
|---|------|-------------|----------|
| Q1  | Single | A | ❌ (Correct: B — ELB distributes traffic, Auto Scaling adds/removes instances) |
| Q2  | Single | C | ✅ |
| Q3  | Single | C | ✅ |
| Q4  | Single | D | ✅ |
| Q5  | Multi  | B,C | ✅ |
| Q6  | Single | C | ✅ |
| Q7  | Single | B | ✅ |
| Q8  | Single | C | ✅ |
| Q9  | Multi  | B,D | ✅ |
| Q10 | Single | C | ✅ |
| Q11 | Single | C | ✅ |
| Q12 | Single | B | ✅ |
| Q13 | Single | D | ✅ |
| Q14 | Multi  | A,C | ✅ |
| Q15 | Single | C | ✅ |
| Q16 | Single | C | ✅ |
| Q17 | Single | C | ✅ |
| Q18 | Single | D | ✅ |
| Q19 | Single | B | ✅ |
| Q20 | Multi  | B,D | ✅ |
| Q21 | Single | C | ✅ |
| Q22 | Single | D | ✅ |
| Q23 | Single | C | ✅ |
| Q24 | Single | C | ✅ |
| Q25 | Single | C | ✅ |
| Q26 | Single | D | ✅ |
| Q27 | Multi  | A,E | ❌ (Correct: A,C — Aurora is relational, NOT NoSQL) |
| Q28 | Single | D | ✅ |
| Q29 | Single | C | ✅ |
| Q30 | Multi  | A,C | ✅ |

**Total Score: 28/30**
