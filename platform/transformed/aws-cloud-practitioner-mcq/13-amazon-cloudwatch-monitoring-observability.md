---
title: 'CloudWatch vs CloudTrail: The AWS Exam Trap Explained'
metaTitle: CloudWatch vs CloudTrail Explained
description: >-
  Learn Amazon CloudWatch the simple way: metrics, logs, alarms, and the
  CloudWatch vs CloudTrail difference that trips up AWS Cloud Practitioner exam
  takers.
keywords:
  - amazon cloudwatch
  - cloudwatch vs cloudtrail
  - cloudwatch metrics
  - cloudwatch alarms
  - cloudwatch logs
  - cloudwatch agent memory metric
  - aws cloud practitioner clf-c02
  - cloudwatch billing alarm
  - eventbridge scheduled rule
  - cloudwatch detailed monitoring
  - aws monitoring and observability
  - cloudwatch logs insights
topic: aws-cloud-practitioner-mcq
topicTitle: AWS Cloud Practitioner
category: Certifications
date: '2026-06-28'
order: 12
icon: ☁️
faq:
  - q: What is the difference between CloudWatch and CloudTrail?
    a: >-
      CloudWatch monitors performance and health - metrics, logs, alarms, and
      dashboards that answer "is my system busy and healthy?" CloudTrail records
      a history of API calls that answers "who did what, when, and from where?"
  - q: Why can't I see EC2 memory usage in CloudWatch by default?
    a: >-
      Memory lives inside the guest operating system, which AWS cannot see from
      outside the instance. You must install the CloudWatch agent to collect and
      publish memory and disk-space-used as custom metrics.
  - q: Does a CloudWatch alarm send the email itself?
    a: >-
      No. An alarm only changes state when a threshold is crossed. To notify a
      person it needs an Amazon SNS topic as its action; to scale it needs an
      Auto Scaling policy.
  - q: What does detailed monitoring actually change?
    a: >-
      It increases how often standard EC2 metrics report - from every 5 minutes
      to every 1 minute - for an added cost. It does not add new metric types
      like memory or disk space.
  - q: How do I get alerted when my AWS bill crosses a dollar amount?
    a: >-
      Create a CloudWatch billing alarm on the estimated-charges metric (in the
      us-east-1 region) and point it at an SNS topic with an email subscription.
      AWS Budgets is another supported option.
  - q: What is the difference between CloudWatch Logs and Logs Insights?
    a: >-
      CloudWatch Logs is the storage layer that centralizes your log text. Logs
      Insights is the interactive query tool that runs on top of that storage to
      filter, aggregate, and group those logs.
author: Brexis Wazik
transformed: true
linked: true
sources: []
---

A security auditor walks over to your desk and asks, "Which user deleted that [S3 bucket](/blog/aws-cloud-practitioner-mcq/10-amazon-s3-object-storage) last Tuesday, and from what IP address?" You open Amazon CloudWatch, scroll through graphs of CPU and memory, and find... nothing useful. You picked the wrong service.

This single mix-up - CloudWatch versus CloudTrail - is the most-tested confusion on the AWS Cloud Practitioner exam, and it trips up smart people every time. The good news: once you understand what CloudWatch is actually *for*, the answers become obvious.

CloudWatch is AWS's eyes on how your resources are *performing*. It collects numbers, stores logs, raises alarms, and reacts to events. Let's make it click.

## Why this matters

If you run anything on AWS, two questions come up constantly: **"Is my system healthy and busy right now?"** and **"Who changed what in my account?"**

These feel similar, but they are answered by two completely different services. Confuse them and you waste time looking in the wrong place during an outage or an audit - and you lose easy points on the exam.

- **CloudWatch** = performance and operations. Metrics, logs, alarms, dashboards.
- **CloudTrail** = governance and audit. A trail of who called which API, when, and from where.

A simple memory hook: **Watch** is the performance you *watch*. **Trail** is the *trail* of who did what. Almost every tricky exam question is just a disguised version of this one distinction.

## What CloudWatch actually does

Think of CloudWatch as the dashboard and warning-light system in your car. It doesn't keep a logbook of who drove it - it tells you how fast you're going, whether the engine is overheating, and flashes a light when something needs attention.

CloudWatch has a few core pieces. Learn these five and most questions answer themselves.

### Metrics: the numbers

A **metric** is a time-ordered series of numeric data points - CPU utilization, network traffic, database connection count. If a manager says, *"Just give me a number showing how busy the database is, graphed over the last hour,"* they are describing a metric.

A metric is the *measurement*. That's it. It doesn't decide anything or notify anyone - it's just the number being plotted.

### Alarms: the watcher

An **alarm** watches a single metric and changes state when it crosses a threshold you set - for example, CPU above 70%.

Here's the part people miss: **an alarm by itself does nothing visible.** It flips from OK to ALARM silently. To make something happen, you attach an *action*:

- Point it at an **Amazon SNS** topic to notify people (email, SMS).
- Point it at an **Auto Scaling** policy to add or remove servers.

So if an alarm "fires" but no email arrives and no scaling happens, the cause is almost always the same: **no action was configured.** The alarm detects; SNS or Auto Scaling responds.

### Dashboards: the single screen

A **dashboard** is a customizable page that shows many metrics from many services together - EC2 CPU, [RDS connections](/blog/aws-cloud-practitioner-mcq/11-amazon-rds-managed-relational-databases), and Lambda errors on one auto-refreshing screen. This is your "single pane of glass" for the on-call engineer.

Don't confuse it with alarms. *"Notify me when X crosses a line"* is an alarm. *"Show me everything at once"* is a dashboard.

### Logs: the text

Metrics are numbers, but applications also produce **logs** - lines of text like request traces and error messages. **CloudWatch Logs** is where you centrally store and view that text, including your own custom application logs (usually shipped via the CloudWatch agent).

On top of that storage sits **CloudWatch Logs Insights**, an interactive query tool. Already have gigabytes of logs and want to *"count errors per hour grouped by API path"*? That's Logs Insights - it filters, aggregates, and groups your log data on the fly.

Quick distinction: **Logs = storage. Logs Insights = the query layer on top.**

### Events: the reactor

**Amazon EventBridge** (formerly CloudWatch Events) routes events to targets in near real time. When an EC2 instance changes state to "stopped," EventBridge can match that event against a rule and trigger a Lambda function, SNS message, or Step Function.

It also handles **scheduled rules** - cron-style triggers. Want a Lambda to clean up temp files every day at 6 AM UTC, with no servers to manage? That's an EventBridge scheduled rule, not an alarm. (Alarms react to metric thresholds, not the clock.)

## The big one: CloudWatch vs CloudTrail

This deserves its own section because the exam leans on it hard.

| Question you're asking | Service |
|---|---|
| Is my server overloaded *right now*? | **CloudWatch** |
| Who deleted that bucket, and from what IP? | **CloudTrail** |
| Show me CPU trends over the last hour | **CloudWatch** |
| Prove which API calls happened in the last 90 days | **CloudTrail** |

A real scenario: a compliance officer needs to prove which API calls were made over the last 90 days, *and* the operations team needs to know if servers are overloaded. These are two needs, two services - [**CloudTrail**](/blog/aws-cloud-practitioner-mcq/14-aws-cloudtrail-auditing-api-logging) for the audit history, **CloudWatch** for live load. Don't try to force one tool to do both jobs. They're complementary, not interchangeable.

The trap is simple to spot once you know it: any *"who / when / which API / from where"* question is **CloudTrail**, never CloudWatch.

## What you get for free vs what needs the agent

This is the second most common exam trap, so it's worth slowing down.

AWS watches your [EC2 instances](/blog/aws-cloud-practitioner-mcq/06-amazon-ec2-instances-purchasing-options) **from the outside** - at the hypervisor level. From out there it can see:

- **CPU utilization**
- **Network** traffic in/out
- **Disk I/O** (read/write *activity*)
- **Status checks**

These are the **default, free** metrics. With basic monitoring they report every **5 minutes**.

But AWS **cannot see inside** the operating system. Two values live in there and are invisible by default:

- **Memory used**
- **Disk space used** (how *full* a volume is - different from disk I/O activity)

To collect those, you install the **CloudWatch agent**, which runs inside the instance and publishes them as custom metrics.

> Analogy: AWS can stand outside your house and see the lights on and the car in the driveway (CPU, network). It can't see how full your fridge is (memory, disk space) unless you put a sensor *inside* - that's the agent.

And **detailed monitoring**? It does *not* add memory or disk-space metrics. It only makes the existing standard metrics report every **1 minute** instead of 5, for an extra cost. It changes *frequency*, not the *list* of metrics.

## Custom metrics: your own business numbers

CloudWatch isn't limited to infrastructure. Want to track **"active shopping carts"** so you can alarm on it? AWS has no idea what a shopping cart is, so your application (or the CloudWatch agent) **pushes that number in** as a **custom metric**. Once it's there, you can graph it and alarm on it exactly like a built-in metric.

The takeaway: not every number in CloudWatch is "default." Standard infrastructure metrics come free; anything app-specific or business-specific is a custom metric *you* publish.

## Common misconceptions

- **"An alarm sends the email."** No - the alarm only changes state. SNS delivers the notification; Auto Scaling performs scaling. Without an action attached, the alarm flips silently.
- **"CPU and memory work the same way."** They don't. CPU is free and default; memory and disk-space-used always need the CloudWatch agent.
- **"Detailed monitoring unlocks memory metrics."** It only changes how *often* the same metrics are sampled (5 min to 1 min).
- **"CloudWatch is only for metrics."** It's a full observability suite: Metrics, Logs, Alarms, Dashboards, and Events. Your app's text logs belong in CloudWatch Logs.
- **"CloudTrail can trigger automation when something happens."** CloudTrail *records* the event for audit. EventBridge is the one that *reacts* and triggers action.
- **"AWS can cap my spending if I ask."** It can't hard-cap spending. The supported path is alerting - a CloudWatch billing alarm or [AWS Budgets](/blog/aws-cloud-practitioner-mcq/16-billing-pricing-cost-management-support).

## How to use this on the exam (and at work)

When a question lands, run it through these steps:

1. **Spot the keyword.** "Who / when / which API / audit / from what IP" → **CloudTrail**. Everything about performance, health, busy-ness → **CloudWatch**.
2. **Separate detect from act.** If something needs to *notify* or *scale*, remember the alarm only detects - look for **SNS** (notify) or **Auto Scaling** (act) as the second half of the answer.
3. **Check inside vs outside the OS.** Memory or disk-*space*-used in the question? The answer involves the **CloudWatch agent**, not detailed monitoring.
4. **Match the log task.** *Store* application logs → **CloudWatch Logs**. *Query* them interactively → **Logs Insights**.
5. **Visualize vs alert.** "One screen showing many metrics" → **Dashboards**. "Tell me when X crosses a line" → **Alarms**.
6. **React vs schedule.** "When this event happens, run that" or "every day at 6 AM" → **EventBridge** rules.
7. **Set a billing alert** in real life: create a billing alarm on estimated charges in **us-east-1**, point it at an SNS topic, subscribe your email. Done.

## Conclusion

Here's the one line to carry with you: **CloudWatch watches how your systems are performing; CloudTrail keeps the trail of who did what.** Anchor on that and the alarms, dashboards, logs, and agent details all fall into place around it.

But notice how often the *real* answer was a pairing - an alarm plus SNS, a metric plus Auto Scaling, an event plus Lambda. AWS is built out of small services that hand off to each other. So the natural next question is: when an alarm fires and SNS sends the message, *who's listening* - and how does one notification fan out to email, SMS, and a Lambda function at the same time? That's where Amazon SNS earns its keep, and it's worth a closer look.
