---
title: AWS VPC Networking Made Simple (CLF-C02 Guide)
metaTitle: AWS VPC Networking Fundamentals Explained
description: >-
  Confused by AWS VPC networking? Learn Internet Gateway vs NAT Gateway, security
  groups vs network ACLs, and Direct Connect vs VPN in plain language for CLF-C02.
keywords:
  - AWS VPC
  - VPC networking
  - Internet Gateway vs NAT Gateway
  - security group vs network ACL
  - AWS Direct Connect vs VPN
  - VPC peering vs Transit Gateway
  - gateway vs interface endpoint
  - AWS PrivateLink
  - public vs private subnet
  - CLF-C02 networking
  - AWS Cloud Practitioner exam
  - stateful vs stateless firewall
faq:
  - q: What is the difference between an Internet Gateway and a NAT Gateway?
    a: >-
      An Internet Gateway allows two-way internet traffic for resources in public
      subnets. A NAT Gateway allows private subnet resources to start outbound
      connections (like downloading patches) while blocking anyone from connecting in.
  - q: Are security groups stateful or stateless?
    a: >-
      Security groups are stateful. If they allow outbound traffic, the return traffic
      is automatically allowed back in. Network ACLs are stateless, so you must allow
      both directions explicitly.
  - q: When should I use Direct Connect instead of a Site-to-Site VPN?
    a: >-
      Use Direct Connect when you need a dedicated private link with consistent,
      low-latency, high bandwidth. Use a Site-to-Site VPN when you want a quick,
      cheap, encrypted connection over the public internet.
  - q: What makes a subnet public or private in a VPC?
    a: >-
      The route table decides. A subnet is public only if its route table sends
      internet-bound traffic to an Internet Gateway. Without that route, it is private.
  - q: Which VPC endpoint type should I use for S3?
    a: >-
      Use a Gateway VPC endpoint for S3 and DynamoDB. It is free and adds a route to
      your route table. All other services use Interface endpoints (PrivateLink), which
      carry hourly and data charges.
  - q: Is VPC peering transitive?
    a: >-
      No. If VPC-A peers with VPC-B, and VPC-B peers with VPC-C, that does not let A
      reach C. For many interconnected VPCs, use a Transit Gateway hub instead.
author: Brexis Wazik
transformed: true
linked: true
topic: aws-cloud-practitioner-mcq
topicTitle: AWS Cloud Practitioner
category: Certifications
date: '2026-06-28'
order: 6
icon: ☁️
sources: []
---

Picture two AWS components. One gives your servers internet access. The other also touches the internet. On the exam, they look almost identical, the clock is ticking, and you pick the wrong one.

That is what makes VPC networking the quiet killer on the CLF-C02 exam. The concepts are not hard. The look-alikes are. Internet Gateway versus NAT Gateway. Stateful versus stateless. Direct Connect versus VPN. Once you can tell each pair apart by its job, the questions almost answer themselves.

## Why this matters

A **VPC (Virtual Private Cloud)** is your own private network inside AWS. You carve it into **subnets**, place servers in them, and control how traffic moves in and out. Almost every AWS workload runs inside one, so this is foundational knowledge, not exam trivia.

The trouble is that AWS gives you several tools that all sound vaguely like "networking" and "internet." Mix them up in real life and you either expose a database to the world or block your own app from responding. The exam tests this on purpose because the mistakes are expensive.

The good news: there are only a handful of confusable pairs. Learn the one-line difference for each, and you have covered the bulk of the topic.

## The internet doors: Internet Gateway vs NAT Gateway

These two are the most confused pair on the whole subject.

An **Internet Gateway** is the front door for both directions. Attach it to your VPC, add a route to it, and resources in that subnet can both send traffic out to the internet and receive traffic from it. That two-way access is exactly what makes a subnet "public."

A **NAT Gateway** is a one-way valve. It lets servers in a private subnet start outbound connections (to download OS patches, pull updates, call an API) while blocking anyone on the internet from starting a connection back in.

Think of it like a hotel.

- The **Internet Gateway** is the main lobby entrance: people walk in and out freely.
- The **NAT Gateway** is the staff door that only opens from the inside. Employees can step out for supplies, but no stranger can walk in through it.

So when a private subnet of app servers must download patches but must *never* be reachable from the internet, the answer is a **NAT Gateway**, not an Internet Gateway. The Internet Gateway would make the subnet fully public and break the "never reachable" rule.

One more detail the exam likes: a NAT Gateway is a **fully managed** AWS service. AWS scales it and keeps it available, so there are no servers to patch. Its older cousin, the **NAT instance**, is just an [EC2 instance](/blog/aws-cloud-practitioner-mcq/06-amazon-ec2-instances-purchasing-options) you run and maintain yourself. When a question says "highly available, no servers to patch," that is the NAT Gateway talking.

## The two firewalls: security groups vs network ACLs

AWS gives you two layers of traffic filtering, and they differ in two ways that get tested constantly: **scope** and **state**.

### Scope: where they sit

- A **security group** attaches to an instance's network interface. It hugs the instance.
- A **network ACL** attaches to a subnet. It guards the subnet's door.

Anchor it like this: the security group hugs the server; the network ACL guards the gate.

### State: do they remember connections?

- A **security group is stateful**. If it allows traffic out, it automatically allows the reply back in. You do not write a matching inbound rule.
- A **network ACL is stateless**. It remembers nothing. If you allow inbound on port 443 but leave outbound at "deny all," the *response* gets blocked, and your app silently fails to answer.

A simple memory hook: **Security group = Stateful** (both start with S and both "remember").

### One more difference: allow vs deny

Security groups can only **allow** traffic. There is no deny rule. So if a question asks you to **block a specific malicious IP range** with an explicit DENY at the subnet level, the answer is a **network ACL**, because only ACLs support explicit deny rules.

And here is a clever security group trick the exam rewards: a security group can reference *another security group* as its source. So a database's security group can allow traffic only from instances in the web server's group, no IP addresses required. Network ACLs cannot do this; they only understand IP ranges.

## Connecting your data center: Direct Connect vs VPN

Two ways to link your on-premises network to AWS, and the keywords in the question tell you which to pick.

**AWS Direct Connect** is a dedicated, private physical line between your data center and AWS. Because it never touches the public internet, it delivers consistent latency, steady bandwidth, and low jitter. It often lowers data-transfer costs too. The trade-off: it takes time to provision and costs more upfront.

**AWS Site-to-Site VPN** is an encrypted tunnel that runs over the *existing public internet*. It is quick to set up (minutes) and cheap, but performance rides on the unpredictable internet, so latency and bandwidth vary.

Match the clue to the answer:

| The question stresses... | The answer is... |
|---|---|
| Dedicated, private, consistent, low jitter, "not over the public internet" | **Direct Connect** |
| Quick, cheap, encrypted, "set up now," no guaranteed bandwidth | **Site-to-Site VPN** |
| Consistent throughput AND lower transfer cost for big daily uploads | **Direct Connect** |

A favorite exam design pattern: **Direct Connect as the primary path, with a VPN as the encrypted backup**. If a latency-sensitive app already uses a VPN and needs a more reliable primary, you *add Direct Connect*. Adding a second VPN tunnel does not help, because it still rides the same unpredictable internet.

## Connecting VPCs: peering vs Transit Gateway

**VPC peering** is a direct, private, one-to-one link between exactly two VPCs. It is simple and cheap, with no hub charges. For two VPCs that need to talk and nothing more, peering wins.

But peering has a famous limitation: it is **not transitive**. If VPC-A peers with VPC-B, and VPC-B peers with VPC-C, traffic from A *cannot* hop through B to reach C. Every pair that must communicate needs its own direct connection.

That is why a mesh of peering connections becomes a nightmare at scale. With 15 VPCs all needing to talk, you would manage dozens of links.

The fix is **AWS Transit Gateway**, a central hub that connects many VPCs and on-premises networks through a single point. It is hub-and-spoke instead of a tangled web, and it scales cleanly.

The rule of thumb:

- **Two VPCs, simple, cheap** → VPC peering.
- **Many VPCs, growing, unmanageable mesh** → Transit Gateway.

Read the question for the *number* of VPCs. That number is the tell.

## Staying private: Gateway vs Interface endpoints

A **VPC endpoint** lets resources in your VPC reach AWS services privately, without the traffic ever leaving the AWS network and without a NAT Gateway or internet path. There are two flavors, and the difference is small but heavily tested.

**Gateway VPC endpoint**

- Works for **only two services: S3 and [DynamoDB](/blog/aws-cloud-practitioner-mcq/12-amazon-dynamodb-managed-nosql)**.
- Works by adding an entry to your **route table**.
- Is **free** - no hourly or data charges.

**Interface VPC endpoint (AWS PrivateLink)**

- Works for **most other AWS services** (CloudWatch, Systems Manager, SNS, SQS, and many more).
- Works by placing a **private network interface** in your subnet.
- **Charges** per hour and per GB.

So the decision tree is short:

1. Is the service **S3 or DynamoDB**? Use a **Gateway endpoint** (free, route table).
2. Anything else? Use an **Interface endpoint** (PrivateLink).

For private [S3 access](/blog/aws-cloud-practitioner-mcq/10-amazon-s3-object-storage) from a private subnet, the Gateway endpoint is the most cost-effective answer because it is free, while an Interface endpoint would add charges.

PrivateLink has one more standout use: you can publish *your own* application as a private **endpoint service** that a partner's VPC connects to, without peering and without internet exposure. When a question says "expose my app as a private service to another VPC," that is PrivateLink, not peering.

## What actually makes a subnet "public"

Here is a concept people quietly get wrong: a subnet is not public because it has a public IP, or because a security group opens port 80.

A subnet is **public only when its route table has a route to an Internet Gateway.** Remove that route, and the subnet is private. The route table is the switch.

And remember the scope rules while you are here:

- A **VPC spans an entire Region.**
- A **subnet lives in exactly one Availability Zone** - never two.

For high availability you create *multiple* subnets in *different* AZs and spread resources across them. A single subnet can never span two AZs, so if a teammate claims it can, they are mistaken.

One last role to keep straight: a **route table decides where traffic goes** (to an Internet Gateway, a NAT Gateway, a peer, or local). It does not decide *whether* traffic is allowed - that is the firewalls' job. Direction versus permission is the classic mix-up.

## Common misconceptions

- **"The Internet Gateway is the outbound-only one."** Reversed. The Internet Gateway is two-way; the *NAT Gateway* is outbound-only.
- **"Security groups can block an IP."** They cannot. Security groups only allow. To deny, use a network ACL.
- **"A VPN is more secure than Direct Connect because it's encrypted."** Direct Connect is private and never touches the public internet. Encryption is not the only measure of a reliable, secure link.
- **"Peering can be chained through a middle VPC."** No. Peering is non-transitive.
- **"Interface endpoints are the free ones."** Reversed. *Gateway* endpoints (S3, DynamoDB) are free; Interface endpoints cost money.
- **"A public IP makes a subnet public."** No. The route to an Internet Gateway does.
- **"A subnet can span two AZs for resilience."** Never. One subnet, one AZ.

## How to use this

When you hit a VPC question on the exam, work it in this order:

1. **Find the keyword.** "Outbound only" = NAT Gateway. "Two-way internet" = Internet Gateway. "Not over the public internet" = Direct Connect. "Quick and cheap" = VPN.
2. **Check direction vs permission.** If it is about *where traffic goes*, think route table. If it is about *whether traffic is allowed*, think security group or network ACL.
3. **Decide the firewall layer.** Need explicit deny or subnet-wide filtering? Network ACL. Need to reference another group or auto-allow replies? Security group.
4. **Count the VPCs.** Exactly two → peering. Many → Transit Gateway.
5. **Match the endpoint.** S3 or DynamoDB → Gateway (free). Anything else → Interface (PrivateLink).
6. **Remember scope.** VPC = Region. Subnet = one AZ. Public subnet = has a route to an Internet Gateway.

Memorize the two short lists - the **Gateway endpoint list (S3, DynamoDB)** and the **stateful/stateless pairing (security group / network ACL)** - and you have neutralized most of the traps.

## Conclusion

If you take one thing away, take this: **every VPC component has exactly one job, and the exam tests whether you can name it under pressure.** The Internet Gateway is the front door, the NAT Gateway is the staff exit, the security group hugs the instance, the network ACL guards the subnet, and the route table decides where everyone goes.

Once these clicks, a natural next question appears: how do you watch all this traffic and prove your network is actually behaving the way you designed it? That is where VPC Flow Logs, [CloudWatch](/blog/aws-cloud-practitioner-mcq/13-amazon-cloudwatch-monitoring-observability), and the [AWS shared responsibility model](/blog/aws-cloud-practitioner-mcq/03-the-shared-responsibility-model) come in - and they are the perfect next stop on your CLF-C02 journey.
