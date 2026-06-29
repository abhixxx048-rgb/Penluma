---
title: "AWS Shared Responsibility Model, Made Simple"
metaTitle: "AWS Shared Responsibility Model Explained"
description: "Confused about who secures what in AWS? Learn the Shared Responsibility Model with clear examples for EC2, RDS, S3, and Lambda so you never miss a question."
keywords:
  - aws shared responsibility model
  - security of the cloud vs in the cloud
  - aws cloud practitioner shared responsibility
  - who patches ec2 vs rds
  - s3 bucket security responsibility
  - aws lambda security responsibility
  - iam customer responsibility
  - aws encryption responsibility
  - shared responsibility model examples
  - aws clf-c02 shared responsibility
faq:
  - q: What is the AWS Shared Responsibility Model in simple terms?
    a: AWS secures the cloud itself (data centers, hardware, network, and the host software behind managed services). You secure what you put in the cloud (your data, access controls, and configurations). The split shifts by service, but your data and who can access it are always yours.
  - q: Who patches the operating system on EC2 versus RDS?
    a: On EC2 you patch the guest operating system yourself because it is Infrastructure as a Service. On RDS, a managed service, AWS patches the OS and database engine for you during maintenance windows.
  - q: Does AWS encrypt my data automatically?
    a: No. AWS gives you the tools, like KMS and built-in encryption options, but you decide what data is sensitive and whether to turn encryption on. Classification and the choice to encrypt stay with you.
  - q: If S3 is fully managed, why was a public bucket leak my fault?
    a: "\"Fully managed\" covers the infrastructure, not your access decisions. Bucket policies, access control lists, and Block Public Access settings are configured by you, so exposure from a public bucket is a customer responsibility."
  - q: What does the customer always own, no matter the service?
    a: "Two things never shift to AWS regardless of how managed the service is: your data and who can access it through IAM. Even with serverless services like Lambda or DynamoDB, those remain your job."
topic: aws-cloud-practitioner-mcq
topicTitle: AWS Cloud Practitioner
category: Certifications
date: '2026-06-28'
order: 2
icon: ☁️
author: Pritesh Yadav (priteshyadav444)
transformed: true
sources: []
---

A developer flips one S3 setting, a private bucket goes public, and customer records spill onto the open internet. Was that AWS's fault for not stopping it? The exam wants you to say yes. The right answer is no, and the reason is the single most tested idea on the AWS Cloud Practitioner exam: the **Shared Responsibility Model**.

Get the dividing line wrong and a whole cluster of questions falls like dominoes. Get it right and they become some of the easiest points on the test.

## Why this matters

AWS security is a partnership, and a lot of real-world breaches happen because someone assumed the other party had it covered. The cloud provider was patching servers while the customer left a door wide open, each thinking the other was responsible.

For the exam, this one concept shows up again and again, dressed in different services: EC2, RDS, S3, Lambda, DynamoDB. The wording changes, the trap stays the same. Learn the underlying rule once and you stop memorizing answers and start reasoning to them.

For your actual job, the same clarity keeps you from shipping a misconfiguration that AWS will never save you from.

## The one sentence that anchors everything

There is a classic phrasing worth burning into memory:

> **AWS is responsible for security _of_ the cloud. You are responsible for security _in_ the cloud.**

That is the whole model in one line. The hard part is that the words "of" and "in" are easy to flip under pressure, so anchor them with a plain-language version:

- **AWS protects the cloud itself** - the buildings, the hardware, the network cables, the hypervisor, and the host software that runs managed services.
- **You protect what you do inside it** - your data, who can access it, and how you configure things.

Think of it like renting an apartment in a secure building. The landlord guards the lobby, the locks on the front entrance, the foundation, and the wiring. But what you keep inside your unit, who you hand a key to, and whether you bolt your own door are entirely on you. AWS is the landlord. You are the tenant.

## The sliding scale: responsibility shifts by service

Here is the nuance most people miss. The split is not fixed. It slides depending on how much of the work AWS is doing for you.

Picture a dial that runs from "you manage almost everything" to "AWS manages almost everything."

### EC2 - you manage the most

EC2 is **Infrastructure as a Service** (raw virtual servers). AWS secures the physical host and the hypervisor (the software that carves one big machine into many virtual ones). Everything from the operating system upward is yours.

So when a new flaw appears in the Linux OS running inside your EC2 instance, **you** apply the patch. AWS owning the hardware does not make the guest OS theirs; the line is drawn at the hypervisor. The same goes if you run containers on EC2 you manage yourself: you own the guest OS and the container images, AWS owns the host underneath.

### RDS - AWS takes over the engine and OS

Move that same database from EC2 to **Amazon RDS** (a managed database) and the dial swings toward AWS. Now AWS patches the database engine and the underlying operating system for you, on maintenance windows you can schedule.

But notice what does *not* move: the data inside the database, and the database user accounts and passwords you create. If you set a weak password for a database user, AWS patching the engine does nothing to protect you. Patching the engine and securing access are two different jobs with two different owners.

### S3 and DynamoDB - fully managed, but access is still yours

With **S3** (object storage) and **DynamoDB** (a managed database), AWS runs essentially all the infrastructure. Yet the most famous cloud mistakes happen right here, because "fully managed" never covers your access decisions.

Bucket policies, access control settings, and Block Public Access are configured by you. Store personal data in DynamoDB and the data plus access control still belong entirely to you, not "fifty-fifty," not AWS. (Worth knowing: AWS now blocks public access by default on new S3 buckets, precisely because this trips so many people up.)

### Lambda - serverless, where your slice is smallest

With **AWS Lambda** (run code without managing servers), AWS handles the servers, the OS, and the language runtime maintenance. Your remaining job shrinks to two things: the **code you write** and the **IAM permissions** that code uses to reach other resources.

The pattern across all of this: the more managed the service, the more AWS takes on, and the smaller your slice becomes. But it never shrinks to zero.

## The two things you ALWAYS own

No matter where you sit on that dial, two responsibilities never transfer to AWS:

1. **Your data.** Classifying what is sensitive, and protecting it, is your call. AWS stores it durably; it does not decide what it is or who should see it.
2. **Access to your data (IAM).** Creating users and roles and deciding what each can do is your job on every single service.

If you remember nothing else, remember this: **the word "managed" never moves your data or your access controls onto AWS's side.** That single insight answers a huge share of exam questions.

## Common misconceptions

These are the exact traps the exam is built from. Each one sounds reasonable, which is the point.

- **"AWS owns the hardware, so AWS patches everything."** Reality: on EC2 the guest OS is yours. The hardware line stops at the hypervisor.
- **"It's a managed service, so AWS owns the data too."** Reality: AWS takes over the engine, OS, and scaling, but never the data itself.
- **"AWS encrypts my data automatically by default."** Reality: AWS provides the tools (like KMS and TLS), but you decide what to classify and when to turn encryption on, both at rest and in transit.
- **"Fully managed means AWS secures access."** Reality: a public S3 bucket or an over-permissive IAM policy is a customer mistake every time.
- **"Customers can't manage their own encryption keys."** Reality: you can, for example with customer-managed KMS keys.
- **"With a managed service, my responsibility hits zero."** Reality: data and access control always stay with you.

A quick gut-check for the "who failed?" style question: a leaked S3 bucket, an over-broad IAM permission, and an unpatched EC2 OS are all *customer* mistakes. The only common scenario that lands on AWS's side is something physical, like an intruder bypassing data center access controls.

## How to use this

When a question (or a real architecture decision) lands in front of you, run this quick checklist:

1. **Spot the service type.** Is it raw infrastructure (EC2) or managed (RDS, S3, Lambda, DynamoDB)? This tells you where the OS-and-patching line falls.
2. **Ask "is this about the data or who can access it?"** If yes, the answer is almost always the customer, regardless of service.
3. **Is it physical or deep infrastructure?** Data centers, hardware disposal, the hypervisor, the network backbone, firmware. That is always AWS.
4. **Is it a configuration choice?** Security groups (virtual firewalls), IAM permissions, encryption toggles, backup retention, bucket policies. Configuration is always the customer.
5. **Watch for the word "managed" as a trap.** It pulls you toward "AWS owns it." Resist, then re-check steps 2 and 4.
6. **For audits, remember evidence follows ownership.** AWS certifies physical and infrastructure controls for you; you must demonstrate your own controls, like least-privilege IAM.

Memorize the anchor sentence, then practice flipping one variable at a time: same database, different service; same task, different layer. That is exactly how the exam stress-tests whether you know the line or just memorized a list.

## Conclusion

The whole model collapses into one durable idea: **AWS secures the cloud, you secure what you put in it, and your data plus your access controls are yours on every service, every time.** Master that and the EC2-versus-RDS-versus-S3 questions stop being tricky and start being free points.

Here is the thread worth pulling next: if IAM is the responsibility that follows you everywhere, then how AWS actually structures identities, roles, and policies is the skill that quietly underpins nearly every other service. Understand IAM deeply and you are not just passing an exam question, you are holding the master key to the entire platform.
