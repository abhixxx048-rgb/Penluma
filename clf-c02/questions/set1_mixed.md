# Practice Questions - Set 1 (Mixed Domains)

## Question 1
**Which AWS service provides DDoS protection at no additional cost?**
- A) AWS WAF
- B) AWS Shield Standard
- C) AWS Shield Advanced
- D) Amazon GuardDuty

<details>
<summary>Answer</summary>
**B) AWS Shield Standard** - It's automatically enabled for all AWS customers at no extra cost. Shield Advanced is paid ($3,000/month).
</details>

---

## Question 2
**Under the Shared Responsibility Model, who is responsible for patching the guest operating system on an EC2 instance?**
- A) AWS
- B) The customer
- C) Both AWS and the customer
- D) Neither - it's automated

<details>
<summary>Answer</summary>
**B) The customer** - For EC2, the customer manages the guest OS including patching. AWS manages the underlying host/hypervisor.
</details>

---

## Question 3
**A company wants to run containers without managing servers. Which service should they use?**
- A) EC2
- B) ECS
- C) AWS Fargate
- D) Elastic Beanstalk

<details>
<summary>Answer</summary>
**C) AWS Fargate** - Serverless compute for containers. No need to provision or manage EC2 instances.
</details>

---

## Question 4
**Which pricing model offers up to 90% discount but can be interrupted at any time?**
- A) Reserved Instances
- B) On-Demand
- C) Spot Instances
- D) Savings Plans

<details>
<summary>Answer</summary>
**C) Spot Instances** - Highest discount but AWS can reclaim them with 2-minute notice. Best for fault-tolerant workloads.
</details>

---

## Question 5
**Which pillar of the Well-Architected Framework focuses on recovering from infrastructure failures?**
- A) Operational Excellence
- B) Security
- C) Reliability
- D) Performance Efficiency

<details>
<summary>Answer</summary>
**C) Reliability** - Focuses on ability to recover from disruptions, dynamically acquire resources, and mitigate disruptions.
</details>

---

## Question 6
**What is the MINIMUM AWS Support plan that provides 24/7 phone access to Cloud Support Engineers?**
- A) Basic
- B) Developer
- C) Business
- D) Enterprise

<details>
<summary>Answer</summary>
**C) Business** - First plan with 24/7 phone, chat, and email support. Developer only has email during business hours.
</details>

---

## Question 7
**Which S3 storage class is the CHEAPEST for data that rarely needs to be accessed and can tolerate retrieval times of 12-48 hours?**
- A) S3 Standard-IA
- B) S3 Glacier Flexible Retrieval
- C) S3 Glacier Deep Archive
- D) S3 One Zone-IA

<details>
<summary>Answer</summary>
**C) S3 Glacier Deep Archive** - Cheapest storage class, designed for data retained 7-10 years, retrieval in 12-48 hours.
</details>

---

## Question 8
**Which service should you use to audit ALL API calls made in your AWS account?**
- A) CloudWatch
- B) CloudTrail
- C) AWS Config
- D) Trusted Advisor

<details>
<summary>Answer</summary>
**B) CloudTrail** - Records all API calls (who, what, when, from where). CloudWatch is for metrics/logs, Config is for resource configuration history.
</details>

---

## Question 9
**A company needs a dedicated private connection from their data center to AWS that does NOT traverse the public internet. Which service should they use?**
- A) VPN
- B) Internet Gateway
- C) AWS Direct Connect
- D) NAT Gateway

<details>
<summary>Answer</summary>
**C) AWS Direct Connect** - Dedicated private network connection. VPN goes over the internet (encrypted but still public internet).
</details>

---

## Question 10
**Which of the following is an advantage of cloud computing?**
- A) Trade operational expense for capital expense
- B) Benefit from massive economies of scale
- C) You must guess your capacity needs in advance
- D) Provisioning takes weeks

<details>
<summary>Answer</summary>
**B) Benefit from massive economies of scale** - AWS aggregates usage from hundreds of thousands of customers, achieving higher economies of scale = lower prices.
</details>

---

## Score: ___/10
## Weak Areas: ___
