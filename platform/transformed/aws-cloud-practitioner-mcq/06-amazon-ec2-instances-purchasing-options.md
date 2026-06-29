---
title: 'EC2 Purchasing Options Explained: Pick the Right One'
metaTitle: 'AWS EC2 Purchasing Options Explained Simply'
description: >-
  Confused by EC2 purchasing options? Learn when to use On-Demand, Reserved,
  Spot, and Savings Plans, plus how AMIs, EBS, and Auto Scaling really work.
keywords:
  - ec2 purchasing options
  - on-demand vs reserved instances
  - spot instances
  - aws savings plans
  - reserved instances vs savings plans
  - dedicated hosts vs dedicated instances
  - instance store vs ebs
  - ec2 instance types
  - aws cloud practitioner ec2
  - ec2 auto scaling vs load balancer
  - ec2 vs lambda
  - aws fargate serverless containers
topic: aws-cloud-practitioner-mcq
topicTitle: AWS Cloud Practitioner
category: Certifications
date: '2026-06-28'
order: 5
icon: ☁️
author: Pritesh Yadav
transformed: true
faq:
  - q: What is the cheapest EC2 purchasing option?
    a: >-
      Spot Instances are the cheapest, up to about 90% off On-Demand, because
      they use spare AWS capacity. The catch is that AWS can reclaim them with
      about two minutes' notice, so they only suit interruptible workloads.
  - q: What is the difference between Reserved Instances and Savings Plans?
    a: >-
      Reserved Instances commit you to specific instance attributes for a deep
      discount, and Standard RIs can even be resold on the RI Marketplace.
      Savings Plans commit you to a steady dollar-per-hour spend instead, and
      Compute Savings Plans flex across families and even Lambda and Fargate.
  - q: What is the difference between instance store and EBS?
    a: >-
      Instance store is temporary storage attached to the physical host, so its
      data is wiped when you stop or terminate the instance. EBS volumes are
      network-attached, persist independently, and can be backed up with
      snapshots.
  - q: Does a stopped EC2 instance still cost money?
    a: >-
      You stop paying for compute hours when an EBS-backed instance is stopped,
      but you keep paying for the attached EBS volumes until you delete them.
  - q: What is the difference between Auto Scaling and a load balancer?
    a: >-
      EC2 Auto Scaling changes how many instances are running based on demand.
      Elastic Load Balancing spreads incoming traffic across the instances that
      already exist. They are often used together but do different jobs.
  - q: When should I use EC2 instead of AWS Lambda?
    a: >-
      Use EC2 for steady, always-on workloads that need full operating-system
      control. Lambda is best for short, event-driven tasks where you want no
      servers to manage and pay only for the milliseconds your code runs.
sources: []
---

Two teams run the exact same web app on AWS. One pays $4,000 a month. The other pays $600. Same servers, same traffic, same region. The only difference is which **EC2 purchasing option** each team picked.

That gap is not a trick. It is the single most testable idea in the AWS world, and it is also one of the easiest places to quietly overspend in real life. The good news: once you understand a handful of clear choices, the right answer almost always picks itself.

## Why this matters

Amazon EC2 gives you virtual servers in the cloud, called **instances**. You can rent them by the hour with no strings attached, or you can commit ahead of time for a steep discount, or you can grab leftover capacity for pennies and accept that it might vanish.

Choosing well does two things at once. It saves real money, sometimes 70 to 90 percent. And it is the part of the AWS Cloud Practitioner exam that shows up again and again, dressed up in different business scenarios.

The whole skill is matching a workload to a pricing model. So let's make each option obvious.

## The four ways to pay for EC2

Think of EC2 pricing like booking a hotel room.

- **On-Demand** is walking up to the front desk and paying the rack rate. No commitment, leave whenever you want, but you pay the most per night.
- **Reserved Instances and Savings Plans** are booking a full year in advance for a big discount. Cheaper, but you've committed.
- **Spot** is a last-minute, deeply discounted room the hotel couldn't fill, on the condition that they can ask you to leave with two minutes' notice if a full-price guest shows up.
- **Dedicated Hosts and Dedicated Instances** are renting the whole floor so no other guest shares your hardware, usually for compliance or licensing reasons.

Now the detail that wins exam questions.

### On-Demand: flexible but pricey

On-Demand has **zero commitment**. You start, stop, and change instance types freely, and you pay only for what you use.

That flexibility is exactly why it costs the most per hour. It shines in one situation above all: **when you don't yet know what you need.**

> A startup is still testing different instance types weekly and has no idea how many servers it will need in three months. On-Demand is the safe default. Committing to a discount plan this early would lock the team into guesses they haven't verified.

The rule of thumb: commitments only pay off once your usage is **predictable**. During the unknown, exploratory phase, stay On-Demand.

### Reserved Instances: commit and save

Reserved Instances (RIs) trade flexibility for a deep discount when you commit to a **1- or 3-year term**. Longer term, bigger discount, so 3-year beats 1-year.

There are two flavors:

- **Standard RIs** give the **deepest discount** but lock you to a specific instance setup. Bonus: if your plans change, you can **resell them on the Reserved Instance Marketplace**, an exit hatch nothing else offers.
- **Convertible RIs** let you change instance family later, but discount less.

> A production database must run 24/7 for the next three years on the same instance type, and the team wants the lowest price. That is a textbook **3-year Standard RI**: maximum commitment, maximum discount, and the type never changes so the extra flexibility of Convertible would just cost money.

### Savings Plans: discount by the dollar, not the instance

Savings Plans also give RI-level discounts for a 1- or 3-year commitment, but you commit to a **steady dollar-per-hour spend** rather than to specific instances. There are two kinds:

- **Compute Savings Plans** are the flexible ones. The discount automatically applies across instance families, sizes, regions, and even **AWS Fargate and Lambda**. Reserved Instances cannot touch Fargate or Lambda; this is their superpower.
- **EC2 Instance Savings Plans** give a **bigger discount** in exchange for locking to one instance family in a region. You can still flex on size, OS, and tenancy within that family.

> Want the freedom to drift between EC2, Fargate, and Lambda over the next three years while still getting a discount? **Compute Savings Plan.** Happy to stay in one family forever and want the deepest cut? **EC2 Instance Savings Plan.**

One more idea the exam loves: a Savings Plan is a **discounted floor, not a hard cap**. If you commit to $10/hour and run $13 of usage in an hour, the first $10 gets the discounted rate and the extra $3 is simply billed at normal On-Demand rates. Nothing stops, nothing is free, nothing gets rebilled.

### Spot: dirt cheap, but it can disappear

Spot Instances run on AWS's **spare capacity** at up to **90% off** On-Demand. The trade-off: AWS can reclaim them whenever it needs the capacity back, giving you only a **two-minute interruption notice** first.

That two-minute warning is the whole point. It lets a well-built app save its work or drain connections gracefully.

> A data-processing job checkpoints its progress to S3 every few minutes and can be paused and restarted anytime. That is the perfect Spot workload. Pair Spot with **Auto Scaling and a load balancer** for a stateless web fleet, and you get the cheapest possible compute that still stays resilient as individual servers come and go.

The keyword to listen for: "can tolerate interruption" or "fault-tolerant" points straight at Spot.

### Dedicated Hosts vs Dedicated Instances: the isolation pair

Both keep your hardware away from other customers, but they answer different needs.

- **Dedicated Instances** run on hardware isolated to your account. Simple physical isolation for compliance, nothing fancy.
- **Dedicated Hosts** go further: you get a whole physical server and can **see the actual sockets and cores**. That visibility is what makes "bring your own license" software, priced per physical core or socket, possible.

> A regulated bank needs to satisfy a per-socket software license. Only **Dedicated Hosts** expose the physical core and socket layout that license requires. If the bank just needed isolation with no per-core licensing, **Dedicated Instances** would be the simpler, cheaper pick.

## Storage: why your data sometimes vanishes

Purchasing options decide what you pay. **Storage type** decides whether your data survives. These are separate, and mixing them up is a classic trap.

### Instance store is temporary

An **instance store** volume is physically attached to the host your instance runs on. It's fast and free scratch space, but fragile.

Here's the subtle part that catches people:

- **Reboot** keeps the instance on the same host, so instance store data **survives**.
- **Stop and start** usually moves the instance to a different host, so all instance store data is **wiped**.

Same-looking actions, opposite outcomes.

### EBS is persistent

An **Amazon EBS** (Elastic Block Store) volume is **network-attached** and lives independently of the instance. Your data survives stop, start, and even termination if configured to, and you can take **point-in-time snapshots** (stored in S3) for backups.

And about billing: when you **stop** an EBS-backed instance, you stop paying for compute hours, but the EBS volumes still exist, so you **keep paying for that storage** until you delete them. "Stopped" never means "zero charges."

## Building and scaling instances

A few more pieces the exam bundles into this topic.

- **AMI (Amazon Machine Image)** is a complete bootable template: the OS, patches, and pre-installed apps baked in. Launch from a custom AMI to spin up **identical instances fast**. (An EBS snapshot is just disk data, not a launchable template.)
- **User data** is a script that runs **automatically on first boot**, so instances install software and configure themselves with no manual login. The AMI bakes config in ahead of time; user data customizes at launch.
- **EC2 Auto Scaling** changes **how many** instances run, adding capacity when busy and removing it when idle.
- **Elastic Load Balancing (ELB)** spreads incoming traffic across the **healthy instances you already have**.

Keep these last two straight: **Auto Scaling changes the number of servers; ELB distributes traffic across them.** They're often used together but never do each other's job.

## Picking the right instance family

EC2 instances also come in families tuned for different work:

- **General purpose** — balanced CPU, memory, and networking. The right default for typical web and app servers.
- **Burstable (T-family)** — cheap instances that bank **CPU credits** while idle and spend them during short spikes. Ideal for a mostly-quiet server with occasional bursts.
- **Compute optimized (C-family)** — sustained high-CPU work.
- **Memory optimized (R-family)** — large in-memory datasets, like an in-memory database or analytics cache.
- **Storage optimized (I-family)** — heavy disk throughput and IOPS.
- **Accelerated computing** — GPUs for machine learning and graphics.

A quick gotcha: "occasional CPU burst" means **burstable (T-family)**, not compute-optimized. Sustained high CPU is the C-family. And a "large dataset" sitting in RAM means **memory optimized**, while large data on fast disks means storage optimized.

## When EC2 isn't even the answer

Sometimes the cheapest, simplest option is to not run a server at all.

- **AWS Lambda** is **serverless**: upload code, it runs in response to events, scales automatically, and you pay only for the **milliseconds** it runs. Perfect for short, event-driven tasks like reacting to a file upload. But Lambda has a maximum execution time per invocation.
- **AWS Fargate** runs your **containers** without you provisioning or patching any EC2 hosts. (Running ECS or EKS on the EC2 launch type still leaves you managing servers; only Fargate removes them.)
- **EC2** still wins when you need **full operating-system control** or a steady, always-on, long-running process. Lambda's time limit and lack of OS control rule it out for those.

The lesson: serverless is not automatically cheaper or better. Lambda shines for short, bursty work; EC2 shines for steady, controlled, always-on work.

## Common misconceptions

- **"Convertible Reserved Instances are better than Standard."** Flexibility costs money. If the instance type never changes, Standard is cheaper.
- **"Spot just disappears with no warning."** You get a two-minute notice, which is exactly what makes graceful shutdown possible.
- **"A commitment is a spending cap."** It's a discounted floor. Run more and you simply pay On-Demand for the excess.
- **"Stopped means no charges."** Compute stops billing, but EBS storage keeps billing until you delete it.
- **"The root volume is always persistent."** It depends on storage type (EBS persists, instance store doesn't), not on your purchasing option.
- **"Serverless is always cheaper."** For always-on workloads, a steady EC2 instance often beats per-millisecond Lambda.

## How to use this

When a scenario lands in front of you, walk these steps:

1. **Read for the commitment signal.** "Unknown / testing / no commitment" → On-Demand. "Steady for 1–3 years" → Reserved or Savings Plans.
2. **Read for the interruption signal.** "Fault-tolerant, can be paused, checkpoints work" → Spot.
3. **Check for flexibility needs.** Need Lambda/Fargate coverage or to roam across families? Compute Savings Plan. Locked to one family for a deeper cut? EC2 Instance Savings Plan. Want resale rights? Standard RI.
4. **Check for isolation or licensing.** Per-core/socket license → Dedicated Hosts. Plain hardware isolation → Dedicated Instances.
5. **Separate pricing from storage.** Decide persistence by storage type (EBS vs instance store), never by purchasing option.
6. **Ask if a server is even needed.** Short event-driven task → Lambda. Containers with no servers → Fargate. Steady, OS-level control → EC2.

## Conclusion

If you remember one thing, make it this: **EC2 pricing is a trade between commitment and flexibility, and the workload tells you which way to lean.** Steady and predictable buys discounts; uncertain and bursty buys freedom; throwaway and fault-tolerant buys Spot's bargain.

Master that, and the per-hour rate you pay starts to feel like a choice instead of a surprise on the bill. Next, it's worth asking the question that quietly shapes every one of these decisions: how does AWS actually divide the world into Regions and Availability Zones, and why does that map decide both your resilience and your latency?
