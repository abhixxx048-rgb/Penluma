# Day 2 Revision Test — 25 MCQs

## Instructions
- Write your answer (A/B/C/D) in the "Your Answer" field
- Time yourself: Try to finish in 30 minutes
- Don't look at cheatsheets!

---

## Q1. Who is responsible for patching the OS on an RDS instance?
- A) Customer
- B) AWS
- C) Both
- D) Third-party vendor

**Your Answer:** A

---

## Q2. A company wants to give 100 developers the same permissions. What is the BEST approach?
- A) Create 100 IAM users with individual policies
- B) Share one IAM user among all developers
- C) Create an IAM Group, attach policy, add all users
- D) Use root account for all developers

**Your Answer:** C

---

## Q3. An EC2 instance needs to upload files to S3. What should you assign?
- A) IAM User with access keys
- B) IAM Role attached to EC2
- C) IAM Group
- D) Root user credentials

**Your Answer:** B

---

## Q4. Which service protects web applications from SQL injection and XSS attacks?
- A) Shield
- B) GuardDuty
- C) WAF
- D) Inspector

**Your Answer:** C

---

## Q5. Which DDoS protection service is FREE for all AWS customers?
- A) Shield Advanced
- B) WAF
- C) GuardDuty
- D) Shield Standard

**Your Answer:** D

---

## Q6. An EC2 instance is secretly mining cryptocurrency. Which service detects this?
- A) Inspector
- B) Macie
- C) GuardDuty
- D) WAF

**Your Answer:** A

---

## Q7. A company wants to scan EC2 instances for open ports and outdated software before going live. Which service?
- A) GuardDuty
- B) Inspector
- C) Macie
- D) Shield

**Your Answer:** B

---

## Q8. Which service discovers credit card numbers accidentally stored in S3 buckets?
- A) GuardDuty
- B) Inspector
- C) WAF
- D) Macie

**Your Answer:** D

---

## Q9. A bank needs full control over encryption keys and AWS should have ZERO access. Which service?
- A) KMS
- B) CloudHSM
- C) IAM
- D) Artifact

**Your Answer:** B

---

## Q10. Which service manages encryption keys for S3, EBS, and RDS?
- A) CloudHSM
- B) Shield
- C) KMS
- D) Macie

**Your Answer:** C

---

## Q11. Data moving between a user's browser and an AWS server is protected by which encryption type?
- A) At-rest encryption
- B) CloudHSM
- C) In-transit encryption
- D) KMS

**Your Answer:** C

---

## Q12. A company needs to download AWS's SOC 2 compliance report for their auditor. Where do they find it?
- A) AWS Config
- B) AWS Trusted Advisor
- C) AWS Security Hub
- D) AWS Artifact

**Your Answer:** D

---

## Q13. Which compliance standard is specifically for protecting healthcare data in the USA?
- A) PCI DSS
- B) HIPAA
- C) GDPR
- D) ISO 27001

**Your Answer:** B

---

## Q14. Which compliance standard is specifically for protecting credit card data?
- A) HIPAA
- B) GDPR
- C) PCI DSS
- D) SOC 2

**Your Answer:** C

---

## Q15. A company wants to explicitly DENY traffic from a specific IP address in their VPC. Which should they use?
- A) Security Group
- B) IAM Policy
- C) NACL
- D) WAF

**Your Answer:** C

---

## Q16. Security Groups are stateful. What does this mean?
- A) Rules are evaluated in numbered order
- B) Both inbound and outbound rules must be defined separately
- C) If inbound is allowed, outbound response is automatically allowed
- D) Only deny rules are supported

**Your Answer:** C

---

## Q17. Where should a database server be placed in a VPC for maximum security?
- A) Public Subnet
- B) Internet Gateway
- C) NACL
- D) Private Subnet

**Your Answer:** D

---

## Q18. Which firewall operates at the subnet level in a VPC?
- A) Security Group
- B) NACL
- C) WAF
- D) Shield

**Your Answer:** B

---

## Q19. A new IAM user is created. What permissions do they have by default?
- A) Full admin access
- B) Read-only access
- C) Zero permissions
- D) Access to S3 only

**Your Answer:** C

---

## Q20. Which IAM entity should NEVER be used for daily tasks and should always have MFA enabled?
- A) IAM User
- B) IAM Role
- C) IAM Group
- D) Root User

**Your Answer:** D

---

## Q21. A company needs to sign a Business Associate Agreement (BAA) with AWS for HIPAA. Where do they do this?
- A) AWS IAM
- B) AWS KMS
- C) AWS Artifact
- D) AWS Security Hub

**Your Answer:** C

---

## Q22. Which service aggregates security alerts from GuardDuty, Inspector, and Macie into one dashboard?
- A) CloudWatch
- B) AWS Config
- C) Security Hub
- D) Trusted Advisor

**Your Answer:** C

---

## Q23. An IAM user is making unusual API calls from an unknown country at midnight. Which service alerts you?
- A) Inspector
- B) Macie
- C) WAF
- D) GuardDuty

**Your Answer:** D

---

## Q24. Which principle says you should give users only the minimum permissions they need?
- A) Shared Responsibility
- B) Least Privilege
- C) Zero Trust
- D) Defense in Depth

**Your Answer:** B

---

## Q25. A company uses EC2 instances. Who is responsible for applying OS security patches?
- A) AWS
- B) Both AWS and Customer
- C) Customer
- D) AWS Support team

**Your Answer:** C

---

## Score Card
| Question | Your Answer | Correct? |
|----------|-------------|----------|
| Q1  | A | ❌ (Correct: B) |
| Q2  | C | ✅ |
| Q3  | B | ✅ |
| Q4  | C | ✅ |
| Q5  | D | ✅ |
| Q6  | A | ❌ (Correct: C) |
| Q7  | B | ✅ |
| Q8  | D | ✅ |
| Q9  | B | ✅ |
| Q10 | C | ✅ |
| Q11 | C | ✅ |
| Q12 | D | ✅ |
| Q13 | B | ✅ |
| Q14 | C | ✅ |
| Q15 | C | ✅ |
| Q16 | C | ✅ |
| Q17 | D | ✅ |
| Q18 | B | ✅ |
| Q19 | C | ✅ |
| Q20 | D | ✅ |
| Q21 | C | ✅ |
| Q22 | C | ✅ |
| Q23 | D | ✅ |
| Q24 | B | ✅ |
| Q25 | C | ✅ |

**Total Score: 23/25**
