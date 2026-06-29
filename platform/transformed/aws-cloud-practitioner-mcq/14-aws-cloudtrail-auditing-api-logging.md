---
title: "AWS CloudTrail Explained: Who Did What in Your Account"
metaTitle: "AWS CloudTrail: Audit & API Logging Guide"
description: "Learn how AWS CloudTrail logs every API call in your account — who did what, when, and from where — and how it differs from CloudWatch, Config, and Flow Logs."
keywords:
  - aws cloudtrail
  - cloudtrail vs cloudwatch
  - aws api logging
  - cloudtrail vs config
  - cloudtrail management events
  - cloudtrail data events
  - aws audit log
  - cloudtrail event history
  - aws cloud practitioner clf-c02
  - cloudtrail s3 logging
  - multi-region trail
  - log file integrity validation
topic: aws-cloud-practitioner-mcq
topicTitle: AWS Cloud Practitioner
category: Certifications
date: '2026-06-28'
order: 13
icon: ☁️
author: Pritesh Yadav (priteshyadav444)
transformed: true
sources: []
faq:
  - q: What is AWS CloudTrail used for?
    a: CloudTrail records the API calls and actions taken in your AWS account — the identity that made each call, the action, the time, and the source IP. It is the tool you reach for during a security investigation or compliance audit to prove who did what, when, and from where.
  - q: What is the difference between CloudTrail and CloudWatch?
    a: CloudTrail audits account activity (who made which API call), while CloudWatch monitors performance (how your resources are running — metrics like CPU, latency, and memory). Think "CloudTrail = trail of who did what" and "CloudWatch = watch how it performs."
  - q: What is the difference between CloudTrail and AWS Config?
    a: CloudTrail logs the action — the API event that changed something and who triggered it. AWS Config tracks the configuration state of a resource over time and whether it stayed compliant with your rules. Keywords like "configuration history" or "drift" point to Config.
  - q: How long does CloudTrail keep event history?
    a: CloudTrail Event history keeps roughly the last 90 days of management events automatically, with no setup. For longer retention you create a trail that delivers log files to an Amazon S3 bucket, where you can keep them for years.
  - q: Are CloudTrail data events free?
    a: Management events are recorded by default at no extra charge. Data events — like individual S3 object reads and writes — are high volume and typically incur additional cost, so they are turned off by default and must be opted into where you need them.
  - q: Does CloudTrail log network traffic?
    a: No. CloudTrail records API calls and account activity, not network packets. To see source IPs and whether traffic was accepted or rejected at the subnet level, you use VPC Flow Logs instead.
---

Someone just deleted a production S3 bucket. The data is gone, the team is panicking, and the only question that matters is: *who did this, and from where?*

In AWS, there is exactly one service built to answer that question with confidence — and it has been quietly recording the answer the whole time. That service is **AWS CloudTrail**.

## Why this matters

Every meaningful action in your AWS account — launching a server, changing a firewall rule, deleting a bucket, modifying an IAM policy — happens as an **API call**. CloudTrail is the always-on recorder that captures those calls: the identity behind them, the action taken, the timestamp, and the source IP address.

That single capability sits at the center of three things every organization cares about:

- **Security investigations** — reconstructing exactly what an attacker or a careless user did.
- **Compliance and auditing** — proving accountability to auditors who ask "who changed this, and when?"
- **Governance** — keeping an honest, tamper-evident record of activity across your whole account.

There's also a very practical reason to understand it well: AWS certification exams (like the Cloud Practitioner CLF-C02) love to test whether you can tell CloudTrail apart from its three look-alikes. Get that distinction right and a whole category of tricky questions becomes easy.

## The one-sentence definition

**CloudTrail is your account's audit log. It answers "who did what, when, and from where."**

If you remember nothing else, remember the word *trail* — a trail of who did what. Everything below is just detail hanging off that idea.

## The four services people constantly confuse

This is the heart of it. Four AWS services all deal with "logs" or "monitoring," and they get muddled together. Each one answers a different question.

| Service | The question it answers | In one phrase |
|---|---|---|
| **CloudTrail** | Who did what, when, from where? | Audit / API activity |
| **CloudWatch** | How is it performing? | Metrics & performance |
| **AWS Config** | What is it set to, and has it stayed compliant? | Configuration state over time |
| **VPC Flow Logs** | What network traffic flowed in and out? | IP packet traffic |

Here's a real-world way to feel the difference. Imagine your AWS account is an office building:

- **CloudTrail** is the **security badge log** — it knows that *Priya* unlocked the server room at *2:14 p.m.* using the *east entrance*.
- **CloudWatch** is the **building's thermostat and gauges** — it tells you the server room is running hot and the AC is straining.
- **AWS Config** is the **floor-plan inspector** — it knows the room *should* have a locked door, tracks every time the lock spec changed, and flags the day someone left it propped open.
- **VPC Flow Logs** is the **CCTV at the doors** — it records every person and package that physically moved in or out, and whether they were let through or turned away.

Same building, four very different records. The exam (and real incidents) hinge on picking the right one.

### CloudTrail vs CloudWatch — the most common mix-up

People reach for CloudWatch because "it has logs." But CloudWatch Logs hold **application and system output** — your app's print statements, performance metrics like CPU and latency, the operational health of your resources.

If the question is *"who issued this API call?"*, that is never CloudWatch. CloudWatch tells you the server is slow; CloudTrail tells you who turned it off.

> **Memory hook:** CloudWatch = *watch* how it performs. CloudTrail = *trail* of who did what.

### CloudTrail vs AWS Config — action vs state

This pair overlaps in people's minds because both relate to changes. The clean split:

- **CloudTrail** records the **action** — *who called `ModifySecurityGroup` at 9:03 a.m.*
- **AWS Config** records the **state over time** — *here is how this security group was configured every day for six months, and here is the day it fell out of compliance.*

Real scenario: an auditor asks, "Show me how this EC2 security group's rules changed over the past six months, and whether it was ever non-compliant." That timeline-of-state question is **Config**. CloudTrail captured the individual events that *caused* each change, but it doesn't present a continuous compliance timeline.

Whenever you see the words **"configuration history," "compliance over time," or "drift,"** lean toward Config.

### CloudTrail vs VPC Flow Logs — API calls vs packets

CloudTrail does not see network packets *at all*. If someone wants to know which **source IP addresses** are sending traffic to an EC2 instance, and whether those packets were **accepted or rejected** at the subnet level, that's **VPC Flow Logs**.

The tell: any mention of *source/destination IPs* and *accept/reject* decisions points to Flow Logs, not CloudTrail.

## Management events vs data events

CloudTrail records two flavors of activity, and the distinction shows up constantly.

- **Management events** — control-plane operations: *configuring or managing* resources. Creating a bucket, launching an instance, changing a security setting. These are recorded **by default** at no extra charge.
- **Data events** — data-plane operations: the *high-volume* activity *inside* a resource. Reading or writing an individual S3 object, invoking a Lambda function. These are **off by default**.

Why are data events off by default? **Volume and cost.** A busy account might perform millions of S3 object reads and writes per hour. Logging every single one can add meaningful expense, so AWS makes you opt in only where you genuinely need that detail.

> **Don't fall for this:** "Data events" does *not* mean "database events." It means data-plane operations like individual file access. And it has nothing to do with IAM password changes or network packets.

## Event history vs trails — quick lookups vs long-term archive

This is the other distinction that trips people up.

**Event history** is the console view that records the last **~90 days** of management events — automatically, with zero setup. An engineer who notices suspicious sign-in activity can open Event history right now and search recent actions by user, event name, or resource. No trail required.

A **trail** is what you create when you need more: it continuously **delivers log files to an Amazon S3 bucket**. S3 is durable, low-cost, and built for the long haul, so this is the standard way to keep a **multi-year audit archive** for compliance.

So the rule of thumb:

- Need a **quick look at recent activity?** Event history (already on, last 90 days).
- Need **long-term retention for compliance?** Create a trail that ships logs to S3.

### Two trail features worth knowing

- **Multi-Region trail.** If your company operates in five Regions and wants *nothing* missed during an audit, you don't create five separate trails and stitch them together. A single multi-Region trail captures events from **all** Regions and delivers them to one S3 bucket.
- **Log file integrity validation.** For an audit log to be *trustworthy*, you have to prove no one altered it after the fact. CloudTrail offers integrity validation so a compliance officer can confirm the delivered log files were not changed or deleted after CloudTrail wrote them. An audit source isn't automatically trustworthy — this is what makes it tamper-evident.

## CloudTrail alone doesn't alert you

A subtle but important point: CloudTrail **records** events; it does not, by itself, send you alerts.

To get a near-real-time notification — say, whenever someone disables a critical security setting via an API call — you pair CloudTrail with CloudWatch:

1. CloudTrail delivers its events to **CloudWatch**.
2. You set up a filter that matches the specific API activity (for example, the call that disabled the setting).
3. CloudWatch fires an **alarm or notification** — often via **SNS** — to email or page your team.

That pairing combines CloudTrail's "who did what" record with CloudWatch's alerting muscle. CloudTrail is the recorder; CloudWatch is the alarm bell.

## Common misconceptions

- **"Nothing is logged until I create a trail."** False. Management events are recorded automatically, and Event history shows the last ~90 days out of the box. A trail is for durable, long-term, and broader capture.
- **"CloudTrail logs everything, including every file read."** False. Object-level data events are off by default because of their volume and cost — you must opt in.
- **"CloudTrail can alert me on its own."** False. It records events; you pair it with CloudWatch (and SNS) to actually get notified.
- **"CloudTrail replaces IAM permissions."** False. CloudTrail *records* what people did; IAM *controls* what they're allowed to do. Different jobs entirely.
- **"CloudTrail only works for S3."** False. It logs API activity across a wide range of AWS services.
- **"An audit log is automatically trustworthy."** False. That's exactly why log file integrity validation exists.

## How to use this

When you face a real scenario — or an exam question — run it through this checklist:

1. **Spot the keyword.** "Who," "audit," "API call," "identity," "source IP" → **CloudTrail**. "How fast," "CPU," "latency," "metrics" → **CloudWatch**. "Configuration history," "compliance," "drift" → **Config**. "Source IP packets," "accept/reject" → **VPC Flow Logs**.
2. **For a quick recent investigation,** open CloudTrail Event history — no setup, last 90 days, searchable by user and event name.
3. **For long-term compliance,** create a trail that delivers logs to a durable S3 bucket. If you run in multiple Regions, make it a **multi-Region trail**.
4. **For tamper-evidence,** turn on **log file integrity validation** so you can prove the logs weren't altered.
5. **For object-level detail** (who read or wrote specific S3 objects), enable **data events** — but only where you need them, because of volume and cost.
6. **For real-time alerts,** send CloudTrail events to **CloudWatch** and trigger an alarm (via SNS) on the specific API activity you care about.

## Conclusion

The single takeaway: **CloudTrail is the trail of who did what, when, and from where — your account's accountability record.** Master the difference between it and its three look-alikes (CloudWatch for performance, Config for configuration state, Flow Logs for network traffic) and both real investigations and exam questions get dramatically simpler.

Here's the thread worth pulling next: CloudTrail tells you *who changed a resource*, but it can't tell you whether that resource is *currently compliant* with your policies — or quietly drifted out last month. That's where **AWS Config** earns its keep, and understanding how the two work *together* is what separates a checkbox answer from real cloud governance.
