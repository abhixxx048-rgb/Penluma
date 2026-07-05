# Mixed Exam — Day 1 + Day 2 | 60 Questions
# (Real Exam Format — Some questions have MULTIPLE correct answers)

## Instructions
- Questions marked **(Choose 2)** or **(Choose 3)** require multiple answers
- Write your answer(s) in the "Your Answer" field — e.g., A or A,C
- Time yourself: Try to finish in 75 minutes
- No cheatsheets!

---

## Q1. (Choose 1)
A company wants to protect their web application hosted behind an ALB from SQL injection and cross-site scripting attacks. Which service should they use?
- A) AWS Shield Advanced
- B) AWS WAF
- C) Amazon GuardDuty
- D) Amazon Inspector

**Your Answer:** B

---

## Q2. (Choose 2)
A company needs to ensure their AWS infrastructure is secure. Which TWO services help detect threats and vulnerabilities? (Choose 2)
- A) Amazon GuardDuty
- B) AWS WAF
- C) Amazon Inspector
- D) AWS Artifact
- E) Amazon Macie

**Your Answer:** A, C

---

## Q3. (Choose 1)
A financial company stores customer data in S3. They want to automatically detect if any S3 bucket contains credit card numbers or social security numbers. Which service should they use?
- A) Amazon GuardDuty
- B) Amazon Inspector
- C) Amazon Macie
- D) AWS Shield

**Your Answer:** C

---

## Q4. (Choose 2)
Which TWO statements about IAM are correct? (Choose 2)
- A) IAM is region-specific
- B) New IAM users have zero permissions by default
- C) IAM roles are used to give temporary access to AWS services
- D) Root user should be used for daily administrative tasks
- E) IAM groups can be nested inside other groups

**Your Answer:** B, E

---

## Q5. (Choose 1)
A company has 3 EC2 instances behind an ELB. Traffic suddenly spikes 10x. Which service automatically adds more EC2 instances to handle the load?
- A) Elastic Load Balancer
- B) Auto Scaling
- C) CloudFormation
- D) Elastic Beanstalk

**Your Answer:** B

---

## Q6. (Choose 1)
A startup wants to deploy a web application without managing servers, OS, or runtime. They just want to upload their code and have AWS handle everything. Which service is BEST?
- A) EC2
- B) Lambda
- C) Elastic Beanstalk
- D) ECS

**Your Answer:** C

---

## Q7. (Choose 2)
A company is migrating to AWS and wants to understand their security responsibilities. Which TWO are the CUSTOMER'S responsibility under the Shared Responsibility Model? (Choose 2)
- A) Physical security of data centers
- B) Patching the OS on EC2 instances
- C) Managing the hypervisor
- D) Configuring IAM permissions
- E) Maintaining networking hardware

**Your Answer:** B, D

---

## Q8. (Choose 1)
Which AWS database service is best suited for storing and querying highly connected data such as social network relationships (friends of friends)?
- A) DynamoDB
- B) RDS
- C) Neptune
- D) QLDB

**Your Answer:** C

---

## Q9. (Choose 1)
A company needs a dedicated private physical connection from their on-premises data center to AWS that does NOT go over the public internet. Which service provides this?
- A) AWS VPN
- B) AWS Direct Connect
- C) Transit Gateway
- D) Internet Gateway

**Your Answer:** B

---

## Q10. (Choose 2)
Which TWO services can be used to define and provision AWS infrastructure as code? (Choose 2)
- A) Elastic Beanstalk
- B) CloudFormation
- C) CDK (Cloud Development Kit)
- D) Systems Manager
- E) CloudWatch

**Your Answer:** A, B

---

## Q11. (Choose 1)
An EC2 instance is making API calls to an external cryptocurrency mining server. Which service would detect and alert this suspicious behavior?
- A) Amazon Inspector
- B) Amazon Macie
- C) AWS WAF
- D) Amazon GuardDuty

**Your Answer:** D

---

## Q12. (Choose 1)
A company wants to cache frequently accessed database query results to reduce load on their RDS instance and improve response times. Which service should they use?
- A) DynamoDB
- B) CloudFront
- C) ElastiCache
- D) S3

**Your Answer:** C

---

## Q13. (Choose 2)
Which TWO are correct about Security Groups and NACLs? (Choose 2)
- A) Security Groups are stateless
- B) NACLs can explicitly DENY traffic
- C) Security Groups operate at the subnet level
- D) Security Groups are stateful
- E) NACLs only support Allow rules

**Your Answer:** B, D

---

## Q14. (Choose 1)
A company needs to store financial transaction records that are immutable and cryptographically verifiable for audit purposes. Which database service should they use?
- A) DynamoDB
- B) RDS
- C) Neptune
- D) QLDB

**Your Answer:** D

---

## Q15. (Choose 1)
A company wants to run AWS services like EC2 and S3 inside their own on-premises data center due to strict data residency requirements. Which service enables this?
- A) Direct Connect
- B) AWS Outposts
- C) Lightsail
- D) Local Zones

**Your Answer:** B

---

## Q16. (Choose 2)
A company wants to protect sensitive data in their AWS environment. Which TWO services help with encryption? (Choose 2)
- A) AWS KMS
- B) Amazon GuardDuty
- C) AWS CloudHSM
- D) Amazon Inspector
- E) AWS Shield

**Your Answer:** A, C

---

## Q17. (Choose 1)
Which service records ALL API calls made in your AWS account, including who made the call, from which IP, and at what time?
- A) Amazon CloudWatch
- B) AWS CloudTrail
- C) AWS Config
- D) AWS Trusted Advisor

**Your Answer:** B

---

## Q18. (Choose 1)
A company wants to see the configuration history of their Security Groups over the past 6 months — how they looked and what changed. Which service provides this?
- A) CloudTrail
- B) CloudWatch
- C) AWS Config
- D) Trusted Advisor

**Your Answer:** C

---

## Q19. (Choose 2)
Which TWO statements about AWS KMS and CloudHSM are correct? (Choose 2)
- A) CloudHSM uses dedicated physical hardware
- B) KMS gives AWS zero access to your keys
- C) KMS is cheaper than CloudMHS
- D) CloudHSM is managed entirely by AWS
- E) Both KMS and CloudHSM store keys in software

**Your Answer:** A, C

---

## Q20. (Choose 1)
A company needs to physically transport 80 TB of data to AWS because their internet bandwidth is too limited. Which Snow Family device is MOST appropriate?
- A) Snowcone
- B) Snowball Edge
- C) Snowmobile
- D) DMS

**Your Answer:** B

---

## Q21. (Choose 1)
A company wants to connect 15 VPCs and their on-premises network through a single centralized hub instead of creating individual peering connections. Which service should they use?
- A) VPN
- B) Direct Connect
- C) Transit Gateway
- D) Internet Gateway

**Your Answer:** C

---

## Q22. (Choose 2)
Which TWO services are used for application integration and decoupling microservices? (Choose 2)
- A) SQS
- B) CloudFormation
- C) SNS
- D) CloudTrail
- E) Systems Manager

**Your Answer:** B,E

---

## Q23. (Choose 1)
A company needs to run 6 Lambda functions in a specific order where each step depends on the previous step's output. Which service orchestrates this workflow?
- A) SQS
- B) SNS
- C) EventBridge
- D) Step Functions

**Your Answer:** D

---

## Q24. (Choose 1)
Which service provides best practice recommendations across 5 categories: cost optimization, performance, security, fault tolerance, and service limits?
- A) AWS Config
- B) CloudWatch
- C) Trusted Advisor
- D) Security Hub

**Your Answer:** C

---

## Q25. (Choose 2)
A company wants to migrate their on-premises MySQL database to AWS with minimal downtime. Which TWO services would help with this migration? (Choose 2)
- A) Snow Family
- B) DMS (Database Migration Service)
- C) Migration Hub
- D) CloudFormation
- E) Direct Connect

**Your Answer:** A,B

---

## Q26. (Choose 1)
Which AWS service uses machine learning to automatically detect threats by analyzing VPC Flow Logs, CloudTrail logs, and DNS logs?
- A) Amazon Inspector
- B) Amazon Macie
- C) Amazon GuardDuty
- D) AWS Security Hub

**Your Answer:** C

---

## Q27. (Choose 1)
A company wants to convert customer support audio call recordings into searchable text documents. Which service should they use?
- A) Amazon Polly
- B) Amazon Translate
- C) Amazon Transcribe
- D) Amazon Comprehend

**Your Answer:** C

---

## Q28. (Choose 2)
Which TWO are correct about the Shared Responsibility Model for Amazon RDS? (Choose 2)
- A) Customer is responsible for patching the database OS
- B) AWS is responsible for patching the database engine
- C) Customer is responsible for managing database users and access
- D) AWS is responsible for configuring Security Groups for RDS
- E) Customer is responsible for the physical hardware

**Your Answer:** B, C

---

## Q29. (Choose 1)
A company needs a shared file system that multiple Linux EC2 instances across different Availability Zones can mount and access simultaneously. Which service should they use?
- A) EBS
- B) S3
- C) EFS
- D) Instance Store

**Your Answer:** C

---

## Q30. (Choose 1)
Which EC2 pricing model provides the HIGHEST discount (up to 90%) but can be interrupted by AWS with a 2-minute warning when capacity is needed?
- A) On-Demand
- B) Reserved Instances
- C) Spot Instances
- D) Savings Plans

**Your Answer:** C

---

## Q31. (Choose 2)
A company needs to ensure compliance with HIPAA regulations on AWS. Which TWO actions should they take? (Choose 2)
- A) Download the AWS HIPAA compliance report from AWS Artifact
- B) Sign a Business Associate Agreement (BAA) through AWS Artifact
- C) Enable AWS Shield Advanced
- D) Use AWS WAF to block all traffic
- E) Enable Amazon Inspector on all instances

**Your Answer:** A,B

---

## Q32. (Choose 1)
A company wants to analyze customer reviews and automatically determine if the sentiment is positive, negative, or neutral. Which service should they use?
- A) Amazon Rekognition
- B) Amazon Lex
- C) Amazon Comprehend
- D) Amazon Textract

**Your Answer:** C

---

## Q33. (Choose 1)
Which service acts as a centralized hub that aggregates and prioritizes security findings from GuardDuty, Inspector, Macie, and other AWS security services?
- A) CloudWatch
- B) AWS Config
- C) AWS Security Hub
- D) Trusted Advisor

**Your Answer:** C

---

## Q34. (Choose 2)
Which TWO statements about NACLs are correct? (Choose 2)
- A) NACLs are stateful
- B) NACLs are stateless
- C) NACLs are applied at the instance level
- D) NACLs are applied at the subnet level
- E) NACLs only support Allow rules

**Your Answer:** B, D

---

## Q35. (Choose 1)
A company wants to build a conversational chatbot for their customer service portal. Which AWS AI service should they use?
- A) SageMaker
- B) Polly
- C) Lex
- D) Comprehend

**Your Answer:** C

---

## Q36. (Choose 1)
A company's security team wants to scan their container images in ECR and EC2 instances for known software vulnerabilities (CVEs). Which service should they use?
- A) GuardDuty
- B) Macie
- C) Inspector
- D) WAF

**Your Answer:** C

---

## Q37. (Choose 2)
Which TWO services provide DNS and traffic routing capabilities on AWS? (Choose 2)
- A) CloudFront
- B) Route 53
- C) Transit Gateway
- D) API Gateway
- E) Direct Connect

**Your Answer:** B, C

---

## Q38. (Choose 1)
A company deleted a CloudFormation stack by mistake. What happens to all the AWS resources that were created by that stack?
- A) Resources remain running but are unmanaged
- B) Resources are stopped but not deleted
- C) Resources are automatically deleted
- D) Resources are moved to a default stack

**Your Answer:** C

---

## Q39. (Choose 1)
Which service would you use to install patches on 1000 EC2 instances simultaneously without connecting to each instance individually?
- A) CloudFormation
- B) Trusted Advisor
- C) Systems Manager
- D) AWS Config

**Your Answer:** C

---

## Q40. (Choose 2)
A company wants to protect their AWS account from unauthorized access. Which TWO are security best practices for the root account? (Choose 2)
- A) Use root account for daily administrative tasks
- B) Enable MFA on the root account
- C) Share root credentials with the security team
- D) Avoid using root account for daily tasks
- E) Create access keys for the root account for CLI use

**Your Answer:** B, D

---

## Q41. (Choose 1)
A company needs a fully managed data warehouse service to run complex analytical queries on petabytes of structured data. Which service should they use?
- A) RDS
- B) DynamoDB
- C) Aurora
- D) Redshift

**Your Answer:** D

---

## Q42. (Choose 1)
Which service provides a content delivery network (CDN) that caches content at edge locations worldwide to reduce latency for global users?
- A) Route 53
- B) API Gateway
- C) CloudFront
- D) Transit Gateway

**Your Answer:** C

---

## Q43. (Choose 2)
Which TWO statements correctly describe the difference between CloudTrail and AWS Config? (Choose 2)
- A) CloudTrail tracks WHO made API calls and WHEN
- B) CloudTrail tracks HOW resources changed over time
- C) AWS Config tracks WHO made API calls and WHEN
- D) AWS Config tracks HOW resource configurations changed over time
- E) Both services do the same thing

**Your Answer:** A, D

---

## Q44. (Choose 1)
A company wants to extract structured data (tables, forms, key-value pairs) from scanned PDF documents automatically. Which service should they use?
- A) Rekognition
- B) Comprehend
- C) Transcribe
- D) Textract

**Your Answer:** D

---

## Q45. (Choose 1)
Which AWS service is a fully managed NoSQL database that delivers single-digit millisecond performance at any scale?
- A) RDS
- B) Aurora
- C) DynamoDB
- D) ElastiCache

**Your Answer:** C

---

## Q46. (Choose 2)
A company wants to ensure their web application is protected from DDoS attacks. Which TWO services should they use together for the BEST protection? (Choose 2)
- A) Amazon Inspector
- B) AWS Shield Advanced
- C) AWS WAF
- D) Amazon Macie
- E) Amazon GuardDuty

**Your Answer:** B,C

---

## Q47. (Choose 1)
A company needs to move 5 Petabytes of data to AWS. Which Snow Family service is designed for this massive scale?
- A) Snowcone
- B) Snowball Edge
- C) Snowmobile
- D) DataSync

**Your Answer:** C

---

## Q48. (Choose 1)
Which service allows you to create, publish, maintain, and secure REST, HTTP, and WebSocket APIs at any scale?
- A) CloudFront
- B) Route 53
- C) Transit Gateway
- D) API Gateway

**Your Answer:** B

---

## Q49. (Choose 2)
Which TWO are correct about encryption in AWS? (Choose 2)
- A) At-rest encryption protects data being transferred over the network
- B) In-transit encryption uses protocols like TLS/SSL
- C) At-rest encryption protects stored data (S3, EBS, RDS)
- D) CloudHSM is cheaper than KMS
- E) KMS gives AWS no access to your keys

**Your Answer:** B, C

---

## Q50. (Choose 1)
A company wants to monitor their EC2 CPU usage and automatically send an alert email when it exceeds 85% for 5 minutes. Which service combination should they use?
- A) CloudTrail + SQS
- B) CloudWatch + SNS
- C) Config + SES
- D) Trusted Advisor + Lambda

**Your Answer:** B

---

## Q51. (Choose 1)
Which AWS service is a managed graph database used for applications with highly connected datasets like fraud detection and social networks?
- A) DynamoDB
- B) QLDB
- C) Neptune
- D) DocumentDB

**Your Answer:** C

---

## Q52. (Choose 2)
A company is designing a VPC. Which TWO statements about public and private subnets are correct? (Choose 2)
- A) Databases should be placed in public subnets for easy access
- B) Web servers that need internet access should be in public subnets
- C) Private subnets have direct internet access by default
- D) Databases should be placed in private subnets for security
- E) All subnets in a VPC are public by default

**Your Answer:** B, D

---

## Q53. (Choose 1)
A company wants to use AWS but needs to comply with European data privacy regulations for their customer data. Which compliance framework applies?
- A) HIPAA
- B) PCI DSS
- C) GDPR
- D) SOC 2

**Your Answer:** C

---

## Q54. (Choose 1)
Which service automatically scales a relational database, is compatible with MySQL and PostgreSQL, and is up to 5x faster than standard MySQL?
- A) RDS MySQL
- B) DynamoDB
- C) Aurora
- D) Redshift

**Your Answer:** A

---

## Q55. (Choose 2)
Which TWO services are used for event-driven architectures where one event triggers multiple downstream actions? (Choose 2)
- A) SQS
- B) SNS
- C) EventBridge
- D) Step Functions
- E) Direct Connect

**Your Answer:**  C, D

---

## Q56. (Choose 1)
A company wants to give an external auditor temporary access to specific AWS resources without creating a permanent IAM user. What is the BEST approach?
- A) Create a new IAM user and share credentials
- B) Share the root account credentials temporarily
- C) Create an IAM Role and ask the auditor to assume it
- D) Add the auditor to an existing IAM Group

**Your Answer:** C

---

## Q57. (Choose 1)
Which AWS service provides personalized product recommendations in real-time, similar to how Amazon.com recommends products to shoppers?
- A) Amazon Forecast
- B) Amazon Kendra
- C) Amazon Personalize
- D) Amazon Comprehend

**Your Answer:** C

---

## Q58. (Choose 2)
Which TWO statements about AWS Shield are correct? (Choose 2)
- A) Shield Standard is a paid service
- B) Shield Standard is free and automatically enabled for all AWS customers
- C) Shield Advanced provides 24/7 DDoS response team support
- D) Shield Advanced protects against SQL injection attacks
- E) Shield Standard provides advanced DDoS analytics

**Your Answer:** B, C

---

## Q59. (Choose 1)
A company wants to decouple their order processing system so that if the processing server goes down, no orders are lost and they are processed when the server comes back up. Which service should they use?
- A) SNS
- B) SQS
- C) EventBridge
- D) Step Functions

**Your Answer:** B

---

## Q60. (Choose 2)
A company is reviewing their AWS security posture. Which TWO actions follow the principle of least privilege? (Choose 2)
- A) Giving all developers AdministratorAccess policy
- B) Creating specific IAM policies that allow only required actions
- C) Using the root account for all deployments
- D) Assigning IAM roles with only the permissions needed for the task
- E) Sharing IAM user credentials across the team

**Your Answer:** B, D

---

## Score Card
| Q | Type | Your Answer | Correct? |
|---|------|-------------|----------|
| Q1  | Single | B | ✅ |
| Q2  | Multi  | A,C | ✅ |
| Q3  | Single | C | ✅ |
| Q4  | Multi  | B,E | ❌ (Correct: B,C — IAM groups cannot be nested) |
| Q5  | Single | B | ✅ |
| Q6  | Single | C | ✅ |
| Q7  | Multi  | B,D | ✅ |
| Q8  | Single | C | ✅ |
| Q9  | Single | B | ✅ |
| Q10 | Multi  | A,B | ❌ (Correct: B,C — Elastic Beanstalk is not IaC) |
| Q11 | Single | D | ✅ |
| Q12 | Single | C | ✅ |
| Q13 | Multi  | B,D | ✅ |
| Q14 | Single | D | ✅ |
| Q15 | Single | B | ✅ |
| Q16 | Multi  | A,C | ✅ |
| Q17 | Single | B | ✅ |
| Q18 | Single | C | ✅ |
| Q19 | Multi  | A,C | ✅ |
| Q20 | Single | B | ✅ |
| Q21 | Single | C | ✅ |
| Q22 | Multi  | B,E | ❌ (Correct: A,C — SQS and SNS decouple microservices) |
| Q23 | Single | D | ✅ |
| Q24 | Single | C | ✅ |
| Q25 | Multi  | A,B | ❌ (Correct: B,C — Snow Family is not for DB migration) |
| Q26 | Single | C | ✅ |
| Q27 | Single | C | ✅ |
| Q28 | Multi  | B,C | ✅ |
| Q29 | Single | C | ✅ |
| Q30 | Single | C | ✅ |
| Q31 | Multi  | A,B | ✅ |
| Q32 | Single | C | ✅ |
| Q33 | Single | C | ✅ |
| Q34 | Multi  | B,D | ✅ |
| Q35 | Single | C | ✅ |
| Q36 | Single | C | ✅ |
| Q37 | Multi  | B,C | ❌ (Correct: A,B — CloudFront+Route53, not Transit Gateway) |
| Q38 | Single | C | ✅ |
| Q39 | Single | C | ✅ |
| Q40 | Multi  | B,D | ✅ |
| Q41 | Single | D | ✅ |
| Q42 | Single | C | ✅ |
| Q43 | Multi  | A,D | ✅ |
| Q44 | Single | D | ✅ |
| Q45 | Single | C | ✅ |
| Q46 | Multi  | B,C | ✅ |
| Q47 | Single | C | ✅ |
| Q48 | Single | B | ❌ (Correct: D — API Gateway, not Route 53) |
| Q49 | Multi  | B,C | ✅ |
| Q50 | Single | B | ✅ |
| Q51 | Single | C | ✅ |
| Q52 | Multi  | B,D | ✅ |
| Q53 | Single | G | ❌ (Correct: C — GDPR, typo in answer) |
| Q54 | Single | A | ❌ (Correct: C — Aurora is 5x faster than MySQL, not RDS MySQL) |
| Q55 | Multi  | C,D | ❌ (Correct: B,C — SNS+EventBridge for event-driven, not Step Functions) |
| Q56 | Single | C | ✅ |
| Q57 | Single | C | ✅ |
| Q58 | Multi  | B,C | ✅ |
| Q59 | Single | B | ✅ |
| Q60 | Multi  | B,D | ✅ |

**Total Score: 51/60**
