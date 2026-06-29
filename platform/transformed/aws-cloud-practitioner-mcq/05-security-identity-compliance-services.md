---
title: 'AWS Security Services Decoded: Stop Confusing the Look-Alikes'
metaTitle: 'AWS Security Services: Tell Them Apart'
description: >-
  A plain-language guide to AWS security and identity services. Learn to tell
  KMS, GuardDuty, Inspector, Macie, CloudTrail, and Config apart with confidence.
keywords:
  - AWS security services
  - KMS vs CloudHSM
  - GuardDuty vs Inspector vs Macie
  - CloudTrail vs Config
  - AWS Shield vs WAF
  - Secrets Manager vs Parameter Store
  - AWS Artifact vs Audit Manager
  - CLF-C02 security
  - AWS encryption at rest vs in transit
  - Amazon Cognito vs IAM
  - AWS identity and compliance
  - AWS Cloud Practitioner exam
topic: aws-cloud-practitioner-mcq
topicTitle: AWS Cloud Practitioner
category: Certifications
date: '2026-06-28'
order: 4
icon: ☁️
faq:
  - q: What is the difference between AWS KMS and CloudHSM?
    a: >-
      KMS is a managed, multi-tenant key service where AWS runs the hardware and
      you control key policies and rotation. CloudHSM gives you a single-tenant,
      dedicated hardware device that no other customer shares - pick it only when
      a regulation demands exclusive hardware.
  - q: What is the difference between GuardDuty, Inspector, and Macie?
    a: >-
      GuardDuty detects threats from your account logs, Inspector scans compute
      for software vulnerabilities, and Macie discovers sensitive data like PII in
      S3. One watches behavior, one checks for weaknesses, one classifies stored data.
  - q: How is CloudTrail different from AWS Config?
    a: >-
      CloudTrail records who did what - the identity, time, and source IP of every
      API call. Config records what a resource looked like over time and whether it
      stays compliant. CloudTrail is the action log; Config is the configuration history.
  - q: When should I use Secrets Manager instead of Parameter Store?
    a: >-
      Use Secrets Manager when you need automatic secret rotation with built-in
      database integration. Use Parameter Store for plain config values and simple
      secure strings when rotation is not needed and cost matters.
  - q: Is AWS DDoS protection free?
    a: >-
      Yes. Shield Standard is automatically enabled for every AWS account at no cost
      and defends against common network-layer DDoS attacks. Shield Advanced is the
      paid tier that adds cost protection and the AWS DDoS Response Team.
  - q: What is the difference between AWS Artifact and Audit Manager?
    a: >-
      Artifact is where you download AWS's own pre-made compliance reports (SOC, ISO,
      PCI) for free. Audit Manager continuously collects evidence about your own
      environment and maps it to frameworks to prepare for an audit.
author: Pritesh Yadav (priteshyadav444)
transformed: true
sources: []
---

Picture the exam clock ticking. The question describes a security tool that "continuously monitors" your account, and four AWS service names stare back at you. Three of them sound right. Only one is.

This is the trap at the heart of AWS security on the CLF-C02 exam. The names blur together: KMS or CloudHSM? GuardDuty or Inspector? CloudTrail or Config? Most of these services do something genuinely similar to a neighbor, and that overlap is exactly what the questions probe.

Here is the good news. Each service does **one defining job**. Once you can name that job in a single sentence, the look-alikes stop being confusing - and you start picking the right answer in seconds.

## Why this matters

Getting these wrong on the exam costs you points. Getting them wrong in real life costs you money, time, or a breach.

If you reach for CloudHSM when KMS would do, you pay far more and manage hardware you never needed. If you expect CloudTrail to tell you whether a bucket is encrypted, you will stare at the wrong logs while the auditor waits. If you assume DDoS protection costs extra, you might buy a tier you already get for free.

These services are the security backbone of nearly every AWS account. Knowing which tool answers which question is a skill you will use long after the exam is over.

## The deciding word is everything

Before the details, here is the single most useful exam habit: **find the deciding word in the question**.

AWS security questions are written so that several answers are partly true. The question then drops one phrase that only the correct service can claim - "single-tenant hardware," "automatic rotation," "who deleted the bucket," "download SOC reports." That phrase is the key. Train your eye to spot it, and most of these questions solve themselves.

Let's walk through the services, grouped by the confusion they cause.

## Keys and secrets: KMS, CloudHSM, Secrets Manager, Parameter Store

These four all "deal with sensitive values," which is why they get mixed up. Each one handles a different sensitive value.

### KMS - the everyday key manager

**AWS Key Management Service (KMS)** creates and manages the encryption keys that protect data at rest in services like S3 and EBS. It is **multi-tenant**: AWS runs the underlying hardware and shares it across customers, while you still control key policies, rotation, and the ability to disable a key.

Think of it as a high-security shared vault. You get your own locked drawer and full say over who opens it, but the building belongs to AWS. It is simpler and cheaper than running your own vault - the right default for most encryption needs. Every key use can be audited through CloudTrail.

### CloudHSM - your own dedicated vault

**AWS CloudHSM** gives you a **single-tenant, dedicated hardware security module** - a physical device that no other AWS customer ever shares.

The deciding words are "dedicated" and "single-tenant hardware." Some regulations literally require that no other party touches the device holding your keys. That is the only time CloudHSM beats KMS. More control, but more cost and more management.

> Exam tip: "Control over keys" alone does **not** mean CloudHSM - KMS already gives you policy and rotation control. Only the word *hardware* (exclusive, dedicated) points to CloudHSM.

### Secrets Manager - secrets that rotate themselves

**AWS Secrets Manager** stores secrets like database passwords and **automatically rotates them on a schedule**, with native integration for databases like RDS. Automatic rotation is its signature feature. No human ever has to log in and update the password.

### Parameter Store - the cheap config drawer

**Systems Manager Parameter Store** holds configuration values (like an environment name "production") and simple secure strings. Its standard parameters are **free**, but it does not rotate secrets automatically.

So the Secrets Manager vs Parameter Store question hinges on one phrase:

- **"Automatic rotation"** → Secrets Manager
- **"Lowest cost, no rotation, config values"** → Parameter Store

### And ACM - certificates, not keys

**AWS Certificate Manager (ACM)** provisions and auto-renews public **TLS/SSL certificates** for free, so you can turn on HTTPS for an Application Load Balancer or CloudFront. People blur ACM and KMS because both touch encryption. The clean split:

- **ACM** = certificates for encryption **in transit** (HTTPS)
- **KMS** = keys for encryption **at rest** (stored S3/EBS data)

## Detection and discovery: GuardDuty, Inspector, Macie

This trio is the most confused group on the whole exam. All three "look for security problems." Here is the one-line job for each, plus a memory hook.

### GuardDuty - guards against threats in your logs

**Amazon GuardDuty** is the threat-detection service. It continuously reads **CloudTrail, VPC Flow Logs, and DNS logs** to spot suspicious behavior - crypto-mining, contact with a known malicious IP - without you installing anything.

Memory hook: *GuardDuty guards against threats from logs.* If the question mentions watching logs for unusual activity, it's GuardDuty.

### Inspector - inspects machines for weaknesses

**Amazon Inspector** scans EC2 instances, container images, and Lambda functions for known software vulnerabilities (CVEs) and unintended network exposure. It assesses **weaknesses before they are exploited**.

Memory hook: *Inspector inspects machines.* The key contrast with GuardDuty: GuardDuty detects active threats happening now; Inspector assesses vulnerabilities that could be exploited later.

### Macie - the data detective for S3

**Amazon Macie** uses machine learning to scan **S3** and find sensitive data - personal info, credit card numbers, passport numbers, credentials - then reports where it lives.

Memory hook: *Macie is the data detective for S3 PII.* If a question mentions PII or sensitive content in S3, it's Macie. Full stop.

A quick way to lock the trio in:

| Service | Job | Trigger words |
|---|---|---|
| GuardDuty | Threat detection from logs | malicious IP, crypto-mining, VPC Flow Logs |
| Inspector | Vulnerability scanning of compute | CVE, EC2, software vulnerabilities |
| Macie | Sensitive-data discovery | PII, S3, credit card numbers |

## After the alert: Security Hub and Detective

Once detection services raise findings, two services help you handle them - and they're often swapped.

**AWS Security Hub** is the **single pane of glass**. It aggregates and prioritizes findings from GuardDuty, Inspector, Macie, and others into one dashboard, and checks them against standards like CIS benchmarks. Think: *collect and prioritize many findings.*

**Amazon Detective** helps you **investigate one finding deeply**. After GuardDuty raises an alert, Detective builds linked visualizations so you can trace the root cause across related resources over time. Think: *now that we have an alert, let's dig in.*

The split in one line: **Hub aggregates, Detective investigates.**

## Auditing and logging: CloudTrail vs Config

This is the classic pairing the exam returns to again and again. Both produce a record. They record different things.

**AWS CloudTrail** records **who did what** - every API call, with the identity, time, and source IP of the actor. "Which IAM user deleted this S3 bucket, from what IP, and when?" That's a CloudTrail question, because a deletion is an API call.

**AWS Config** records **what changed** - the configuration state and history of your resources, and whether they stay compliant with rules like "encryption must be enabled." "Is this bucket encrypted, and show me a timeline of when its setting changed?" That's a Config question.

Burn this into memory:

- **CloudTrail = who did what** (actions and identity)
- **Config = what changed** (resource state over time)

## Network and application defense: Shield, WAF, Firewall Manager

These all "protect web apps," so they cluster together. Each defends a different layer.

**AWS Shield Standard** protects against common network and transport-layer (layer 3/4) **DDoS** attacks. It is **automatically included, free, for every AWS account**. Many candidates wrongly assume DDoS protection costs extra - it doesn't, at the baseline.

**AWS Shield Advanced** is the **paid** tier. It adds enhanced DDoS mitigation, near-real-time attack visibility, **cost protection** (credits for scaling caused by an attack), and access to the **AWS DDoS Response Team**. Those last two phrases are unique to Advanced - see them, pick Advanced.

**AWS WAF** (Web Application Firewall) inspects incoming HTTP/HTTPS requests and lets you write rules to block **application-layer (layer 7)** threats like SQL injection, cross-site scripting, and bad IP ranges. Content filtering by rules is its job.

**AWS Firewall Manager** is the **multi-account manager**. Sitting on top of AWS Organizations, it centrally configures and enforces WAF rules and Shield protections across dozens of accounts at once.

The quick splits:

- **Shield = DDoS** | **WAF = rule-based request filtering (SQLi/XSS)**
- **WAF = the rule engine** | **Firewall Manager = deploys those rules across many accounts**

## Identity: IAM vs Cognito

Both manage logins, but for completely different people.

**AWS IAM** controls access for **your team and resources inside AWS** - the users and roles in your account.

**Amazon Cognito** manages **your customers** - the end users signing up and signing in to your app, including letting them log in with Google or Facebook.

In one line: *IAM is for your staff inside AWS; Cognito is for your customers using your app.* (Related: **IAM Identity Center** handles workforce single sign-on across AWS accounts, and **Directory Service** provides managed Microsoft Active Directory.)

## Compliance reports: Artifact vs Audit Manager

The final common mix-up. Both involve compliance, but they move in opposite directions.

**AWS Artifact** is a free self-service portal to **download AWS's own compliance documents** - SOC reports, ISO certifications, PCI attestations - to hand to your auditors. AWS made these; you grab them.

**AWS Audit Manager** continuously **collects evidence about your own environment** and maps it to frameworks like PCI DSS, automating your audit prep. You're proving *your* account is compliant.

The split: **Artifact = download AWS's existing reports** | **Audit Manager = gather evidence about your account.**

## Common misconceptions

A few myths that quietly cost people exam points:

- **"DDoS protection is an add-on you pay for."** False. Shield Standard is free and automatic. Only Advanced is paid.
- **"Wanting control over keys means CloudHSM."** False. KMS already gives you policy and rotation control. CloudHSM is only for exclusive, dedicated *hardware*.
- **"Continuous monitoring means Config or Inspector."** Not when it's about threats. Log-based threat detection is GuardDuty.
- **"Parameter Store and Secrets Manager are interchangeable."** They're not. Automatic rotation is Secrets Manager's line in the sand.
- **"CloudTrail can tell me if a resource is compliant."** No. CloudTrail logs actions; Config evaluates configuration compliance.

## How to use this

Here's a simple method to apply on exam day and at work:

1. **Read the question for the deciding word first.** Underline phrases like "single-tenant hardware," "automatic rotation," "who deleted," "download SOC reports," "DDoS Response Team."
2. **Match the deciding word to the one-line job.** Each service owns one defining phrase. Let that phrase, not the familiar name, choose your answer.
3. **For the detection trio, run the hook.** GuardDuty guards (logs), Inspector inspects (machines/CVEs), Macie is the data detective (S3 PII).
4. **For any "who vs what" log question, split it.** Who did it → CloudTrail. What changed → Config.
5. **For encryption, anchor on the data state.** In transit (HTTPS) → ACM. At rest (S3/EBS) → KMS.
6. **For compliance, check the direction.** Pulling AWS's reports → Artifact. Proving your own account → Audit Manager.

If you can recite each service's one-sentence job from memory, you're ready for this section of the exam.

## Conclusion

The whole secret to AWS security services is this: **don't memorize what each tool roughly does - memorize the one job no other service can claim.** GuardDuty owns log-based threat detection. CloudHSM owns dedicated hardware. Secrets Manager owns automatic rotation. The exam writes its traps around the overlap, so your defense is the deciding word.

Master that, and the crowded shelf of security services becomes a tidy row of labeled tools.

Once you can tell these apart, a natural next question appears: who is actually *allowed* to use each one? That's where IAM policies, roles, and the principle of least privilege come in - the layer that decides not what a service does, but who gets to touch it. That's worth exploring next.
