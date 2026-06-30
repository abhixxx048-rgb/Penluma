---
title: 'AWS Organizations: How SCPs, Billing & Control Tower Work'
metaTitle: AWS Organizations & SCPs Explained Simply
description: >-
  Learn how AWS Organizations manages many accounts with one bill, why SCPs are
  a permission ceiling that never grants access, and where Control Tower fits in.
keywords:
  - AWS Organizations
  - Service Control Policies
  - SCP vs IAM
  - consolidated billing
  - AWS Control Tower
  - multi-account strategy
  - Organizational Units
  - AWS landing zone
  - Reserved Instance sharing
  - AWS Cloud Practitioner
  - tag policies
  - management account
faq:
  - q: Do SCPs grant permissions to users?
    a: >-
      No. A Service Control Policy only sets the maximum permissions an account
      can use. It is a ceiling, never a key. You still need an IAM policy to
      actually grant the action, and the SCP simply decides whether IAM is
      allowed to grant it.
  - q: What is the difference between AWS Organizations and IAM?
    a: >-
      Organizations works at the account level - grouping accounts, billing, and
      setting SCP guardrails. IAM works inside each account to grant specific
      permissions to users and roles. Effective access is the overlap of what
      the SCP allows and what IAM grants.
  - q: How does consolidated billing save money?
    a: >-
      It combines the usage of every member account into one total, so you cross
      tiered volume-pricing thresholds faster and reach lower per-unit rates.
      It also shares Reserved Instance and Savings Plans discounts across
      accounts by default.
  - q: Does an SCP restrict the management (payer) account?
    a: >-
      No. SCPs do not restrict the management account even when attached at the
      root. The management account always keeps full control, which is exactly
      why you should not run production workloads in it.
  - q: How is AWS Control Tower different from AWS Organizations?
    a: >-
      Control Tower sits on top of Organizations. It uses Organizations under
      the hood and adds automated landing-zone setup, prebuilt guardrails,
      Account Factory provisioning, and a compliance dashboard.
author: Brexis Wazik
transformed: true
linked: true
topic: aws-cloud-practitioner-mcq
topicTitle: AWS Cloud Practitioner
category: Certifications
date: '2026-06-28'
order: 14
icon: ☁️
sources: []
---

A team attaches a policy that says "allow full S3 access" to a group of AWS accounts. A developer in one of those accounts still cannot read a single bucket. Nothing is broken. This is AWS working exactly as designed - and it trips up nearly everyone the first time.

Understand that one moment and you understand the heart of AWS Organizations: the service that lets a company run dozens of AWS accounts under one roof, with one bill and a shared set of guardrails. This guide unpacks how it really works.

## Why this matters

Most real companies do not live in a single AWS account. They split production, development, and security into separate accounts on purpose. That gives them clean isolation, clearer billing, and a smaller "blast radius" if one account is ever compromised.

But the moment you have many accounts, you need a way to govern them all at once - without manually logging into each one. That is the job of **AWS Organizations**.

For the AWS Cloud Practitioner exam, this topic shows up constantly, and the questions almost always probe the same handful of confusions: what an SCP actually does, what consolidated billing actually saves, and where Control Tower fits. Get these straight and a whole category of exam questions becomes easy points. Get them muddled and you will second-guess every answer.

## SCPs are a ceiling, never a key

This is the single most important idea, so let's make it stick.

A **Service Control Policy (SCP)** sets the *maximum* permissions an account is allowed to use. Think of it as a ceiling in a room. The ceiling defines how high you *can* reach - but it does not hand you anything. You still need a ladder.

In AWS, **IAM is the ladder**. [IAM policies](/blog/aws-cloud-practitioner-mcq/04-iam-identity-access-management) grant the actual permissions to users and roles inside an account. The SCP just decides whether IAM is even allowed to grant a given action.

So an SCP that "allows full S3 access" grants nobody anything. It only means "S3 is not blocked at the ceiling." If the developer has no IAM policy permitting S3, they still can't touch a bucket. That is the puzzle from the opening, solved.

The reverse is just as important. Imagine a developer's IAM policy clearly allows EC2 actions, but the SCP on their account's group does **not** include EC2. Result: **denied**. The action only works if *both* the SCP allows it *and* IAM grants it.

> **The one-line rule:** Effective permission = what IAM allows **AND** what the SCP allows. If either says no, the answer is no.

### A guardrail no local admin can lift

Here's where SCPs earn their keep. Suppose your security team wants an ironclad rule: no account may launch resources outside `us-east-1` and `eu-west-1`, no matter what.

You could write an IAM policy in each account denying other Regions - but a local account admin could simply change it. An SCP is different. It applies an organization-wide ceiling that account-level admins **cannot** override. Write an SCP that denies actions outside the allowed Regions, and the restriction holds everywhere, permanently.

That power even reaches the **root user** of a member account. The member account's most privileged user still cannot break through an SCP ceiling.

## Consolidated billing: one bill, real savings

Run 12 accounts and you might dread getting 12 invoices. You won't. **Consolidated billing** rolls every member account's charges into a single bill paid by the management account. Member accounts do not receive separate invoices from AWS.

But the convenience is only half the story. The savings come from pooling.

- **Volume discounts stack.** AWS prices many services in tiers - the more you use, the cheaper the per-unit rate. Consolidated billing adds up usage across *all* accounts, so your combined volume crosses those discount thresholds faster than any single account could alone.
- **Reserved Instances and Savings Plans are shared by default.** If one account buys a [Reserved Instance](/blog/aws-cloud-practitioner-mcq/06-amazon-ec2-instances-purchasing-options) and only uses part of it, the leftover benefit automatically applies to matching usage in another account. Nothing is wasted, and no special setup is required.

That sharing point is a favorite exam trap. People assume a Reserved Instance is locked to the account that bought it. By default, it is shared organization-wide. Savings Plans work the same way, riding along on consolidated billing automatically.

Just be careful not to over-credit billing. Consolidated billing does **not** encrypt your data, block risky API calls, or provision accounts. Its job is cost aggregation and one tidy invoice - nothing about security or permissions.

## Organizational Units: grouping accounts to govern them

You rarely want to manage accounts one by one. **Organizational Units (OUs)** are containers that group accounts so a policy can be applied to the whole group at once.

Put your production accounts in one OU, your development accounts in another, and your security accounts in a third. Now you can attach different guardrails to each group with a single SCP rather than touching every account.

A quick distinction that catches people: an **OU groups accounts**; a **resource group** organizes resources *inside* one account. Different scope, different purpose.

## Tag policies: keeping cost reports honest

When finance wants reliable cost reports, messy tags are the enemy. One team writes `CostCenter`, another writes `cost-center`, a third forgets the tag entirely.

**Tag policies** in Organizations define standardized tag keys and value formats across accounts and flag resources that don't comply. They keep tagging consistent so cost allocation and reporting stay trustworthy.

Don't confuse tag policies with **cost allocation tags**. Tag policies standardize the *format* of tags org-wide; [cost allocation tags](/blog/aws-cloud-practitioner-mcq/16-billing-pricing-cost-management-support) mark a tag as usable in billing reports. They work together, but they are different jobs.

## Control Tower: the automation layer on top

Setting up a secure multi-account environment by hand - landing zone, baseline guardrails, centralized logging, account provisioning - is a lot of careful wiring. **AWS Control Tower** does it for you.

The key mental model: **Control Tower sits on top of Organizations.** It uses Organizations under the hood (along with AWS Config, IAM Identity Center, and others) and adds:

- An automated, well-architected **landing zone**.
- **Prebuilt guardrails** so accounts start out governed.
- **Account Factory** to provision new accounts with baselines already applied.
- A **compliance dashboard** to monitor the whole estate.

Control Tower does not replace Organizations, and you don't delete your existing organization to use it. It is the automation and governance layer; Organizations is the foundation it stands on.

## Where IAM Identity Center fits

One more service people lump in by mistake. When a company wants to centrally manage *workforce sign-in* - letting employees log in once and get access across many accounts - that is **AWS IAM Identity Center** (single sign-on), not Organizations.

Organizations manages accounts and billing. IAM Identity Center manages who your people are and what they can sign into. Two different jobs that often get conflated.

## Common misconceptions

- **"An 'Allow' SCP grants access."** No. SCPs filter what IAM is allowed to grant. They are a ceiling, never a key.
- **"Control Tower gives the volume discount."** No. The pooled-usage discount comes from consolidated billing, which exists in Organizations even without Control Tower.
- **"Reserved Instances are locked to the buying account."** No. By default they are shared org-wide through consolidated billing.
- **"SCPs can lock down the management account."** No. SCPs never restrict the management account - a key reason to keep production workloads out of it.
- **"More accounts means automatic high availability."** No. Splitting accounts gives isolation, governance, and billing clarity. Resilience comes from architecture ([Multi-AZ and Multi-Region design](/blog/aws-cloud-practitioner-mcq/11-amazon-rds-managed-relational-databases)), not from account count.
- **"Organizations handles user logins."** No. That's IAM Identity Center's job.

## How to use this

If you're setting up or studying multi-account AWS, work through these in order:

1. **Create your organization** from a dedicated management (payer) account, and run no production workloads in it.
2. **Group accounts into OUs** by function - production, development, security - so you can govern each set at once.
3. **Apply SCPs as guardrails** at the OU level (for example, restricting Regions or blocking risky services), remembering they set ceilings, not grants.
4. **Grant real permissions with IAM** inside each account, staying within the SCP ceiling.
5. **Lean on consolidated billing** for one invoice plus shared volume discounts, Reserved Instances, and Savings Plans.
6. **Standardize tags with tag policies** so cost reports stay clean.
7. **Add Control Tower** when you want automated provisioning, prebuilt guardrails, and a compliance dashboard without manual wiring.
8. **Centralize sign-in with IAM Identity Center** so people get the right access across accounts from one place.

For exam questions, run a quick triage: a permissions *ceiling* across accounts means **SCP**; actually *granting* an action means **IAM**; *one bill or shared discounts* means **consolidated billing**; *automated multi-account setup* means **Control Tower**; *workforce sign-in* means **IAM Identity Center**.

## Conclusion

If you remember one thing, make it this: in AWS Organizations, **an SCP is a ceiling and IAM is the key** - access happens only where both agree. That single idea quietly answers most of the hard questions in this topic.

Once that clicks, the natural next question is how the management account itself stays safe. If SCPs can't restrict it and it pays for everything, what stops a single compromised credential there from becoming an organization-wide problem? That is where account-level [security best practices](/blog/aws-cloud-practitioner-mcq/05-security-identity-compliance-services) - root user protection, dedicated security accounts, and least privilege - pick up the story.
