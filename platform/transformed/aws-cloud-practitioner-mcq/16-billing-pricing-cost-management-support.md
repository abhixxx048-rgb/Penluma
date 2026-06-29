---
title: 'AWS Cost Tools Made Simple: Calculator vs Cost Explorer'
metaTitle: 'AWS Cost Tools & Support Plans Explained'
description: >-
  Confused by AWS Pricing Calculator, Cost Explorer, Budgets, and CUR? Learn
  which AWS cost tool to use when, plus how Support plans really differ.
keywords:
  - aws pricing calculator vs cost explorer
  - aws cost management tools
  - aws budgets vs cost explorer
  - aws cost and usage report
  - aws support plans explained
  - aws business vs enterprise support
  - aws technical account manager
  - aws free tier always free
  - data transfer out charges aws
  - aws savings plans vs reserved instances
  - consolidated billing aws organizations
  - cloud practitioner cost management
faq:
  - q: What is the difference between AWS Pricing Calculator and Cost Explorer?
    a: >-
      The Pricing Calculator estimates costs before you build anything, using a
      proposed architecture. Cost Explorer analyzes and visualizes spending that
      has already happened. One looks forward, the other looks back.
  - q: Which AWS Support plan includes a Technical Account Manager?
    a: >-
      A designated Technical Account Manager (a named person assigned to your
      account) starts at the Enterprise plan. Enterprise On-Ramp gives you a
      shared pool of TAMs, and Business and below have none.
  - q: Is data transfer into AWS free?
    a: >-
      Yes, data transferred into AWS from the internet is generally free.
      Transfer out to the internet is what costs money once you pass the free
      allowance, which is why it is one of the three core pricing drivers.
  - q: Which AWS Support plan first gives 24/7 access to engineers?
    a: >-
      The Business plan is the first tier with 24/7 phone, chat, and email access
      to Cloud Support Engineers and the full set of Trusted Advisor checks.
      Developer is business-hours only with a limited check set.
  - q: What does "always free" mean in the AWS Free Tier?
    a: >-
      Always-free offers never expire as long as you stay under the published
      monthly limits, regardless of how old your account is. The 12-month free
      tier, by contrast, ends one year after you create your account.
  - q: What is the difference between a Savings Plan and a Reserved Instance?
    a: >-
      A Savings Plan commits you to a steady dollar amount of spend per hour for
      1 or 3 years. A Reserved Instance commits you to a specific instance
      configuration. Savings Plans are usually more flexible.
topic: aws-cloud-practitioner-mcq
topicTitle: AWS Cloud Practitioner
category: Certifications
date: '2026-06-28'
order: 15
icon: ☁️
author: Pritesh Yadav (priteshyadav444)
transformed: true
sources: []
---

Four AWS tools have "cost" in their name, and they all do something subtly different. Pick the wrong one and you either get a number for the wrong moment in time or miss the alert that would have saved you a nasty bill. The good news: once you learn the one-line job each tool does, you can never confuse them again.

This guide untangles AWS billing, pricing, and support, the same way the Cloud Practitioner exam tests it, but in plain language you can actually use at work.

## Why this matters

AWS does not send you a monthly invoice you can ignore. It bills you for what you use, by the hour and the gigabyte, across dozens of services. That flexibility is the whole point of the cloud, but it also means a forgotten instance or a misjudged data transfer can quietly run up a bill.

Knowing which tool answers which question is the difference between **planning your spend** and **explaining a surprise charge after the fact**. And if something does go wrong, the Support plan you chose decides whether you can reach a human at 2 a.m. or just read the docs.

## The four cost tools, and the one job each one does

Here is the mental model that makes everything else click. Think of the four tools as points on a timeline of your spending.

- **AWS Pricing Calculator** — *estimates costs before you build.* Nothing is running yet, so there is no usage to analyze. You describe a proposed setup (say, some EC2 instances, an RDS database, and an S3 bucket) and it gives you a forward-looking monthly estimate.
- **AWS Cost Explorer** — *analyzes and visualizes spend that already happened.* Interactive graphs let you slice your bill by service, region, tag, and time to answer "why did last quarter go up?"
- **AWS Budgets** — *alerts you when spend crosses a threshold.* Set a limit, and it emails you (or fires an SNS notification) when actual or forecasted spend reaches it.
- **Cost & Usage Report (CUR)** — *the most granular, line-item billing data.* It exports hourly, resource-level detail to an S3 bucket so a data team can crunch it in Athena, QuickSight, or Redshift.

A quick way to remember it: **Calculator = before, Cost Explorer = after, Budgets = warn me, CUR = give me everything.**

### A real example

Imagine a company in its design phase, before launching anything. They want a monthly cost estimate for a proposed architecture. That is the **Pricing Calculator**, full stop. Cost Explorer would have nothing to show because no usage exists yet.

Now fast-forward a year. The finance manager wants an email the moment actual spend hits 80% of $5,000. That is **Budgets**. The analyst trying to understand why the bill jumped? **Cost Explorer.** The data team that needs every line item exported to S3 for custom analysis? **CUR.** Same company, four different questions, four different tools.

## The three things you actually pay for

AWS frames almost every bill around three fundamental drivers:

1. **Compute** — what you run (EC2, for example).
2. **Storage** — what you keep (S3, EBS).
3. **Data transfer out** — what you send out of AWS to the internet.

Notice what is *not* on the list. IAM users and roles are free. Tags are free. Availability Zones do not carry a charge by themselves. And pricing models like Reserved Instances, Savings Plans, and Spot are ways to *pay* for compute, not separate cost categories.

### The data transfer trap everyone falls for

Here is the rule that surprises people: **data transfer into AWS is generally free, but data transfer out to the internet costs money** (beyond the free allowance).

Say you move 500 GB from your data center into AWS and serve 500 GB out to internet users. The inbound half is free. The outbound half is what shows up on your bill. Transfer is not symmetric, so do not assume the two directions cost the same. *Into AWS is usually free, out to the internet costs money.*

## The Free Tier has three flavors

People treat "free tier" as one thing. It is actually three, and the exam loves the distinction:

- **Always Free** — never expires as long as you stay under the limits. Examples: a monthly allotment of AWS Lambda requests, or DynamoDB storage.
- **12-Month Free** — free only for the first year after you create your account. Examples: the small EC2 and RDS allowances.
- **Trials** — short-term offers that expire after 30 or 60 days.

This is behind a classic surprise bill. A small EC2 instance under the 12-month tier runs continuously, and in **month 13** the charges appear, because the free year ended and it now bills at standard On-Demand rates. AWS does not bill retroactively for the free months; it just starts charging once the clock runs out. Forgetting to stop a 12-month-tier resource after a year is one of the most common ways beginners get burned.

## Support plans: what each tier really unlocks

There are five plans, but two boundaries matter most.

| Plan | Engineer access | Trusted Advisor | TAM |
|------|----------------|-----------------|-----|
| **Basic** (free) | Customer service only, no engineers | Limited checks (service limits + basic security) | None |
| **Developer** | Business-hours, associate-level | Limited subset | None |
| **Business** | 24/7 phone, chat, email | **Full** check set | None |
| **Enterprise On-Ramp** | 24/7 | Full | A **pool** of TAMs |
| **Enterprise** | 24/7 | Full | A **designated** TAM |

Two lines are worth memorizing:

- **Business is the first plan with 24/7 access to Cloud Support Engineers and the full set of Trusted Advisor checks** — without a dedicated TAM. If a company needs round-the-clock engineers and complete Trusted Advisor but not a personal account manager, Business is the lowest-cost fit.
- **A *designated* TAM (a named person who knows your environment) starts at Enterprise.** Enterprise On-Ramp gives you a *pool* of TAMs, not a single assigned one. The exam tests this exact wording difference.

Even the free **Basic** plan is not nothing: it includes a limited set of Trusted Advisor checks (service limits and a few basic security ones) plus 24/7 customer service for account and billing questions. What it does not include is technical help from engineers — that requires a paid plan.

## Buying compute: Spot, Reserved, Savings Plans

For EC2 pricing, match the workload to the purchase option:

- **On-Demand** — no commitment, no discount. Maximum flexibility, highest price.
- **Spot Instances** — spare AWS capacity at up to ~90% off, but AWS can reclaim it on short notice. Perfect for a fault-tolerant batch job that can restart, wrong for anything that cannot tolerate interruption.
- **Reserved Instances (RIs)** — big savings in exchange for committing to a **specific instance configuration** (type, region) for 1 or 3 years.
- **Savings Plans** — commit to a steady **dollar amount of spend per hour** for 1 or 3 years and get RI-level discounts, while staying flexible across instance family, size, OS, tenancy, region, and even Fargate and Lambda.

The one-liner that keeps RIs and Savings Plans straight: **Savings Plan = commit to $/hour spend; Reserved Instance = commit to a specific instance setup.** So a steady, predictable workload that wants deep discounts *and* the freedom to change instance family or region points to **Compute Savings Plans**.

## Splitting and consolidating the bill

Two more features round out the topic, both tied to **AWS Organizations**:

- **Consolidated billing** combines usage across all member accounts onto one bill. Because volume discounts apply to the aggregated usage, you reach tiered pricing faster, and **unused RI and Savings Plan benefits can be shared** across accounts that have matching usage (sharing is on by default).
- **Cost allocation tags** are key-value labels (like `Department=Marketing`) you attach to resources to break the bill down by team or project in Cost Explorer and the CUR.

One catch worth remembering: tagging a resource is not enough. You must **activate** the tag as a cost allocation tag in the Billing console before it shows up in cost reports.

## Common misconceptions

- **"Cost Explorer estimates future architecture costs."** No. It analyzes spending that already happened. Pre-build estimates are the Pricing Calculator's job.
- **"Data transfer is symmetric."** No. Into AWS is generally free; out to the internet is the recurring charge.
- **"Only Enterprise has Trusted Advisor checks."** No. Basic has a limited set, and Business already unlocks the full set at lower cost than Enterprise.
- **"Enterprise On-Ramp gives me my own TAM."** No. It gives a shared pool. A designated TAM is an Enterprise-only benefit.
- **"AWS pricing is the same in every region."** No. The same service can cost different amounts in different regions due to differing operating costs.
- **"Budgets and Budgets actions are the same."** Plain Budgets only *alerts*. **Budgets actions** can automatically *enforce* — applying a restrictive IAM/SCP policy or stopping instances when a threshold is crossed.

## How to use this

When you face a billing question (on the exam or at work), run through this checklist:

1. **Is the resource built yet?** No → Pricing Calculator. Yes → keep going.
2. **Do I want to understand past spend?** → Cost Explorer (visual, interactive, can also forecast from trends).
3. **Do I want to be warned at a threshold?** → AWS Budgets. Need it to *act*, not just warn? → Budgets actions.
4. **Do I need every line item for deep custom analysis?** → Cost & Usage Report, exported to S3.
5. **Need a quick glance at month-to-date charges with no setup?** → The Billing Dashboard.
6. **Choosing support?** Need 24/7 engineers + full Trusted Advisor? → Business. Need a designated TAM? → Enterprise.
7. **Splitting a bill by team?** → Activate cost allocation tags. **Merging bills for volume discounts?** → Consolidated billing.

## Conclusion

If you remember one thing, make it the timeline: **Calculator before you build, Cost Explorer after, Budgets to warn you, CUR for the raw detail.** Almost every cost question collapses into "which moment on that timeline am I asking about?"

That same pay-as-you-go pricing that makes these tools necessary is also what makes the cloud so flexible — but flexibility cuts both ways. Once you are comfortable watching your spend, the natural next question is how AWS keeps that spend *secure*: who is allowed to spin up those resources in the first place, and how the shared responsibility model draws the line between what AWS protects and what you do.
