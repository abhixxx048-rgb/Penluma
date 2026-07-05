# Day 1 Revision Test — 25 MCQs

## Instructions
- Write your answer (A/B/C/D) in the "Your Answer" field
- Time yourself: Try to finish in 30 minutes
- Don't look at cheatsheets!

---

## Q1. A company wants to deploy a web application without managing the underlying infrastructure. They just want to upload their code. Which service should they use?
- A) EC2 (Elastic Compute Cloud)
- B) Lambda
- C) Elastic Beanstalk
- D) CloudFormation

**Your Answer:** C

---

## Q2. Which AWS service is a fully managed NoSQL database that provides single-digit millisecond latency?
- A) RDS (Relational Database Service)
- B) Aurora
- C) DynamoDB
- D) Redshift

**Your Answer:** B

---

## Q3. A company needs to physically transport 60 TB of data to AWS because their internet connection is too slow. Which service should they use?
- A) Snowcone
- B) Snowball Edge
- C) DMS (Database Migration Service)
- D) Direct Connect

**Your Answer:** B

---

## Q4. Which service translates domain names (like www.example.com) into IP addresses?
- A) CloudFront
- B) API Gateway
- C) Route 53
- D) Transit Gateway

**Your Answer:** C

---

## Q5. A company wants to connect 20 VPCs (Virtual Private Clouds) and their on-premises network through a central hub. Which service should they use?
- A) VPN (Virtual Private Network)
- B) Direct Connect
- C) Internet Gateway
- D) Transit Gateway

**Your Answer:** D

---

## Q6. Which AWS service records ALL API calls made in your account for auditing purposes?
- A) CloudWatch
- B) CloudTrail
- C) AWS Config
- D) Trusted Advisor

**Your Answer:** B

---

## Q7. A company wants to see how their Security Group configuration has changed over the past 3 months. Which service provides this?
- A) CloudTrail
- B) AWS Config
- C) CloudWatch
- D) Systems Manager

**Your Answer:** B

---

## Q8. Which service provides best practice recommendations across cost, performance, security, fault tolerance, and service limits?
- A) AWS Config
- B) CloudWatch
- C) Trusted Advisor
- D) Health Dashboard

**Your Answer:** C

---

## Q9. A company needs to run 5 Lambda functions in a specific sequence where step 2 depends on step 1's output. Which service should they use?
- A) SQS (Simple Queue Service)
- B) SNS (Simple Notification Service)
- C) Step Functions
- D) EventBridge

**Your Answer:** C

---

## Q10. Which EC2 pricing model provides up to 90% discount but AWS can reclaim the instance at any time?
- A) On-Demand
- B) Reserved Instances
- C) Spot Instances
- D) Savings Plans

**Your Answer:** C

---

## Q11. A company wants to build a customer support chatbot on AWS. Which service should they use?
- A) SageMaker
- B) Polly
- C) Lex
- D) Comprehend

**Your Answer:** C

---

## Q12. Which service distributes incoming traffic across multiple EC2 instances?
- A) Auto Scaling
- B) ELB (Elastic Load Balancer)
- C) Route 53
- D) CloudFront

**Your Answer:** B

---

## Q13. A company wants to cache frequently accessed database queries to reduce load on their RDS instance. Which service should they use?
- A) DynamoDB
- B) S3 (Simple Storage Service)
- C) ElastiCache
- D) CloudFront

**Your Answer:** C

---

## Q14. Which service allows you to define AWS infrastructure using YAML or JSON templates?
- A) Elastic Beanstalk
- B) CDK (Cloud Development Kit)
- C) CloudFormation
- D) Systems Manager

**Your Answer:** C

---

## Q15. A company needs to migrate their on-premises Oracle database to AWS Aurora with minimal downtime. Which service helps with this?
- A) Snow Family
- B) DMS (Database Migration Service)
- C) Migration Hub
- D) DataSync

**Your Answer:** B

---

## Q16. Which database is best suited for storing financial transactions that must be immutable and cryptographically verifiable?
- A) DynamoDB
- B) Neptune
- C) QLDB (Quantum Ledger Database)
- D) RDS

**Your Answer:** C

---

## Q17. A company wants to extract text and data from scanned PDF invoices automatically. Which service should they use?
- A) Rekognition
- B) Textract
- C) Comprehend
- D) Transcribe

**Your Answer:** B

---

## Q18. Which service provides a dedicated private physical connection from your data center to AWS that does NOT go through the internet?
- A) VPN
- B) Direct Connect
- C) Transit Gateway
- D) Internet Gateway

**Your Answer:** A

---

## Q19. When an EC2 instance is terminated, a company wants to automatically trigger an alert. Which service can detect this event and take action?
- A) CloudWatch
- B) SQS
- C) EventBridge
- D) SNS

**Your Answer:** C

---

## Q20. Which AWS service is a data warehouse designed for running complex analytics queries on large datasets?
- A) RDS
- B) DynamoDB
- C) Aurora
- D) Redshift

**Your Answer:** D

---

## Q21. A company wants to install security patches on 500 EC2 instances simultaneously without SSH-ing into each one. Which service should they use?
- A) CloudFormation
- B) Systems Manager
- C) Trusted Advisor
- D) AWS Config

**Your Answer:** B

---

## Q22. Which storage type is like a hard disk attached to a single EC2 instance and exists in only one AZ (Availability Zone)?
- A) S3
- B) EBS (Elastic Block Store)
- C) EFS (Elastic File System)
- D) FSx

**Your Answer:** B

---

## Q23. A company wants to write their infrastructure as code using Python instead of YAML. Which service should they use?
- A) CloudFormation
- B) CDK (Cloud Development Kit)
- C) Elastic Beanstalk
- D) Systems Manager

**Your Answer:** B

---

## Q24. Which service is a graph database used for applications with highly connected data like social networks?
- A) DynamoDB
- B) QLDB
- C) Neptune
- D) DocumentDB

**Your Answer:** C

---

## Q25. A company wants to send a push notification to 10,000 mobile users at once when a new product launches. Which service should they use?
- A) SQS (Simple Queue Service)
- B) SNS (Simple Notification Service)
- C) EventBridge
- D) Step Functions

**Your Answer:** B

---

## Score Card
| Question | Your Answer | Correct? |
|----------|-------------|----------|
| Q1  | C | ✅ |
| Q2  | B | ❌ (Correct: C) |
| Q3  | B | ✅ |
| Q4  | C | ✅ |
| Q5  | D | ✅ |
| Q6  | B | ✅ |
| Q7  | B | ✅ |
| Q8  | C | ✅ |
| Q9  | C | ✅ |
| Q10 | C | ✅ |
| Q11 | C | ✅ |
| Q12 | B | ✅ |
| Q13 | C | ✅ |
| Q14 | C | ✅ |
| Q15 | B | ✅ |
| Q16 | C | ✅ |
| Q17 | B | ✅ |
| Q18 | A | ❌ (Correct: B) |
| Q19 | C | ✅ |
| Q20 | D | ✅ |
| Q21 | B | ✅ |
| Q22 | B | ✅ |
| Q23 | B | ✅ |
| Q24 | C | ✅ |
| Q25 | B | ✅ |

**Total Score: 23/25**
