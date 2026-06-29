---
title: 'AWS IAM Explained: Users, Roles, Policies, and the Deny Rule'
metaTitle: AWS IAM Explained Simply for Beginners
description: >-
  A plain-English guide to AWS IAM: users, groups, roles, and policies, why
  explicit deny always wins, and the patterns that pass the Cloud Practitioner exam.
keywords:
  - AWS IAM
  - identity and access management
  - IAM roles vs users
  - IAM policies
  - explicit deny
  - least privilege AWS
  - IAM Identity Center
  - Amazon Cognito
  - AWS root user
  - IAM groups
  - cross-account access AWS
  - AWS Cloud Practitioner IAM
  - resource-based policy
  - MFA AWS
faq:
  - q: What is AWS IAM in simple terms?
    a: >-
      IAM (Identity and Access Management) is how you control who can do what in
      your AWS account. It is free, global, and built from users, groups, roles,
      and policies.
  - q: What is the difference between an IAM user and an IAM role?
    a: >-
      A user is a permanent identity with a password or long-term access keys. A
      role is a temporary identity you assume; AWS hands out short-lived
      credentials that expire and there is no stored password or key.
  - q: Why does an explicit deny always win in IAM?
    a: >-
      IAM evaluates every policy together. The order of precedence is explicit
      deny, then explicit allow, then a default implicit deny. A single deny
      anywhere blocks the action no matter how many allows exist.
  - q: Is AWS IAM free?
    a: >-
      Yes. Creating users, groups, roles, and policies costs nothing extra. You
      only pay for the AWS resources those identities actually use.
  - q: What can only the root user do?
    a: >-
      A few account-level tasks stay locked to root, such as closing the account,
      changing the root email, and changing the support plan. An admin IAM user
      can do almost everything else but not these.
  - q: When should I use Amazon Cognito versus IAM Identity Center?
    a: >-
      Use Cognito for your app's external customers signing in with social or
      email logins. Use IAM Identity Center for your own employees signing in to
      AWS accounts.
topic: aws-cloud-practitioner-mcq
topicTitle: AWS Cloud Practitioner
category: Certifications
date: '2026-06-28'
order: 3
icon: ☁️
author: Pritesh Yadav (priteshyadav444)
transformed: true
sources: []
---

Picture this: a developer saves an AWS access key in a file on a server "just to get things working." Six months later that key leaks, and an attacker has a permanent skeleton key to the account. This single mistake is one of the most common ways cloud accounts get breached, and it is exactly what IAM is designed to prevent.

IAM is the part of AWS that answers one question for every single request: **who are you, and are you allowed to do this?** Get it right and your account is locked down tight. Get it wrong and one stolen password can sink everything.

## Why this matters

Every action in AWS, launching a server, reading a file, deleting a database, passes through IAM first. It is the front door to your entire account.

For the **AWS Cloud Practitioner exam**, IAM is one of the most heavily tested topics, and the questions are written to trip you up. They blur the line between users and roles, ask what only the root user can do, and lean hard on one unforgiving rule: an explicit deny always wins.

For real work, IAM is the difference between "a contractor's leaked laptop exposed our customer database" and "the leak was contained because that identity could only do its narrow job." This guide makes the whole model click.

## The four building blocks

IAM is built from four pieces. Get these straight and most of the exam falls into place.

- **User** — a permanent identity for one person or one application. It has a password (for console login) and/or access keys (for code).
- **Group** — a bucket of users that share the same permissions. You attach permissions once and every member inherits them.
- **Role** — a temporary identity you *assume* when needed. AWS hands out short-lived credentials that expire. No stored password, no long-term keys.
- **Policy** — a JSON document that says what is allowed or denied. You attach policies to users, groups, roles, or resources.

A simple analogy: think of an office building. A **user** is an employee badge. A **group** is a department (everyone in "Finance" gets the same door access). A **role** is a temporary visitor pass that expires at 5 PM. And a **policy** is the printed rulebook taped to each door listing who may enter.

These four work together, but they are not interchangeable, and the exam loves to swap one for another in the answer choices.

### Groups: the fix for "30 people, same access"

Say 30 new developers all need the same permissions, and people join and leave often. The wrong instinct is to attach the same policy to each user one by one, that is tedious and easy to get wrong.

The clean answer is a **group**. Attach the policy once to the group, then drop users in or pull them out. Two limits the exam tests:

1. **Groups cannot be nested.** You cannot put a group inside another group.
2. **A user can belong to many groups** at once and inherits the combined permissions.

Never solve this by creating one shared login that everyone uses. That destroys accountability, you can no longer tell who did what.

### Roles: temporary credentials, no stored keys

Here is the single most important pattern in IAM, and it shows up in exam question after question.

When **AWS compute needs to talk to another AWS service**, use a role, not stored keys.

- An EC2 instance needs to read an S3 bucket? Attach a **role** to the instance.
- A Lambda function needs to write logs and read S3? Give it an **execution role**.

The role supplies temporary credentials that AWS rotates automatically. The application never stores a password or access key, so there is nothing on disk for an attacker to steal. This is why the answer "create an IAM user and save the access keys on the server" is almost always wrong.

Roles also power **cross-account access**. If an app in Account A needs a DynamoDB table in Account B, Account B creates a role with a *trust policy* naming Account A. Account A assumes the role and gets temporary credentials. No keys are emailed around. Whenever a question says "cross-account access without sharing long-term credentials," the answer is a role.

### Policies: identity-based vs resource-based

A **policy** is just a JSON document listing the *effect* (allow or deny), the *actions*, and the *resources*. There are two flavors:

- **Identity-based policy** — attached to a user, group, or role. It says what *that identity* can do.
- **Resource-based policy** — attached directly to a resource. It says *who* may access that resource.

The textbook example of a resource-based policy is an **S3 bucket policy**. If a policy "lives on the bucket," it is resource-based. Both types are always JSON, never YAML.

## The rule that decides everything: deny always wins

If you remember one thing from this article, make it this. When IAM evaluates a request, it combines every applicable policy and follows a strict order of precedence:

> **Explicit deny  >  Explicit allow  >  Default (implicit) deny**

This has two big consequences:

**1. Silence means no.** A brand-new user with no policies attached can do nothing, not because S3 or any service is specially blocked, but because nothing has been *allowed* yet. Permissions start at "deny everything." Allowing all EC2 actions does nothing for S3, because each action is granted independently. No allow, no access.

**2. One deny beats any number of allows.** Imagine a user is in a group that *allows* deleting S3 objects, but the user also has a policy that *explicitly denies* it. The result is not random and does not depend on which policy is read first. The deny wins. Period.

This makes a targeted deny the **surgical tool** for IAM. Suppose your developer group has `AdministratorAccess`, but you want one developer blocked from deleting production databases. Don't tear down the group. Just attach a policy to that one developer with an explicit deny for the delete action. Everyone else keeps full admin; that one person is carved out.

## The root user: powerful, permanent, and not for daily use

Every AWS account has a **root user**, the original identity created with the account. It has unlimited power, and it cannot be deleted. It is tied to the account forever.

A handful of tasks are reserved for root and **cannot** be done even by an IAM user with full administrator access:

- Closing the AWS account
- Changing the root account's email address
- Changing the support plan and certain billing settings

This is a favorite exam trap: "full administrator" does **not** equal root. An admin IAM user can create users, attach policies, and launch servers, all routine, but it cannot do the root-only account actions above.

Because root is so powerful, the best practice is simple:

1. **Turn on MFA** for the root user (a second login code on top of the password).
2. **Stop using root** for everyday work, create IAM users instead.
3. **Delete root access keys** entirely. Don't put them on a rotation schedule; remove them.

You cannot, and should not try to, "delete the root user." You protect it with MFA and disuse.

## Common misconceptions

**"IAM is Regional, so I need separate users per Region."**
False. IAM is **global**. A user, group, role, or policy you create exists for the whole account and works in every Region. Many AWS services are Regional, so people assume IAM is too, but it sits alongside global services like Route 53, CloudFront, and WAF.

**"Adding MFA changes what a user can do."**
No. MFA is about **authentication** (proving who you are), not **authorization** (what you can do). It means a stolen password alone is not enough to log in. It does not grant permissions, encrypt data, or exempt anyone from a deny.

**"A role is basically a user with extra steps."**
No. A user is a **permanent** identity with a password or long-term keys. A role is **temporary** and assumed, with short-lived credentials and no stored secrets. If a scenario describes a permanent human who logs in daily, that is a user. If it describes temporary or service access, that is a role.

**"Cognito and IAM Identity Center are the same thing."**
They solve opposite problems. **Amazon Cognito** handles sign-in for *your app's customers* (think millions of mobile-game players logging in with Google or Facebook). **IAM Identity Center** (the successor to AWS SSO) handles *your employees* signing in once to multiple AWS accounts using the corporate directory.

**"IAM costs money per user."**
No. Core IAM is **free**. You only pay for the resources identities use. (Note: some related services like AWS Directory Service can cost money, but IAM itself does not.)

## How to use this

When you hit an IAM question, on the exam or at work, run through this checklist:

1. **AWS compute calling AWS services?** Use a **role** (EC2 instance role, Lambda execution role), never stored access keys.
2. **Cross-account access?** Use a **role with a trust policy**, not emailed keys.
3. **Many users, same permissions?** Use a **group**, attach the policy once.
4. **A permanent human logging in daily?** Use an **IAM user** with console access and least-privilege permissions.
5. **An external or on-prem script that can't assume a role?** Use an **IAM user's access keys** (access key ID + secret), kept least-privilege and rotated.
6. **See a conflict between allow and deny?** The **deny wins**, always.
7. **A new identity can't do anything?** That is the **implicit deny**, no allow has been granted yet.
8. **Apply least privilege everywhere:** grant each identity only the permissions it needs for its job, and nothing more. If a leak happens, the blast radius stays small.
9. **Enforce strong passwords** with the account **password policy** (minimum length, character types, expiration), it is a built-in setting, not a JSON policy.

## Conclusion

The one idea that unlocks IAM: **deny always wins, and silence is a deny.** AWS starts everything at "no" and only opens the doors you explicitly allow, while a single deny can slam any door shut. Once that clicks, users, groups, roles, and policies stop feeling like trivia and start feeling like a system that makes sense.

Here is the thread worth pulling next: roles hand out *temporary* credentials that expire on their own, which raises a deeper question, how does AWS actually mint and rotate those short-lived keys behind the scenes? That is the world of the Security Token Service (STS), and understanding it is where casual AWS users start becoming genuinely dangerous in the best way.
