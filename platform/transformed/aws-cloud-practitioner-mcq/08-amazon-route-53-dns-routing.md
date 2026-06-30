---
title: 'Amazon Route 53 Explained: DNS & Routing Made Simple'
metaTitle: 'Amazon Route 53: DNS & Routing Policies Guide'
description: 'Learn how Amazon Route 53 routes traffic, when to use alias vs CNAME records, and how its seven routing policies work - with clear, exam-ready examples.'
keywords:
  - amazon route 53
  - route 53 routing policies
  - alias record vs cname
  - latency based routing
  - geolocation routing
  - failover routing
  - weighted routing
  - route 53 health checks
  - route 53 vs cloudfront
  - aws dns service
  - hosted zone
  - geoproximity routing
  - multivalue answer routing
  - aws cloud practitioner route 53
faq:
  - q: What is Amazon Route 53 used for?
    a: Route 53 is AWS's managed DNS service. It translates human-friendly domain names like example.com into IP addresses, routes users to the right endpoint, and can also register domains and run health checks.
  - q: What is the difference between an alias record and a CNAME?
    a: An alias record can sit at the zone apex (the bare root domain) and point straight to AWS resources at no query cost. A CNAME cannot be used at the apex and is billed as a standard DNS query.
  - q: Is Route 53 the same as CloudFront?
    a: No. Route 53 is DNS - it decides which server a name points to. CloudFront is a content delivery network that caches files at edge locations close to users. They do different jobs and often work together.
  - q: Which Route 53 policy sends users to the fastest Region?
    a: Latency-based routing. It measures actual network round-trip time and sends each user to the Region with the lowest latency, which is not always the geographically closest one.
  - q: How does Route 53 failover routing work?
    a: You mark one record as primary and one as secondary, then attach a health check to the primary. While the primary is healthy, traffic goes there; when it fails the check, Route 53 automatically shifts traffic to the standby.
  - q: Does Route 53 replace a load balancer?
    a: No. Route 53 routes domain names to endpoints at the DNS level. Spreading individual requests across the servers behind that endpoint is the load balancer's job. The two complement each other.
author: Pritesh Yadav (priteshyadav444)
transformed: true
linked: true
topic: aws-cloud-practitioner-mcq
topicTitle: AWS Cloud Practitioner
category: Certifications
date: '2026-06-28'
order: 7
icon: ☁️
sources: []
---

Type `example.com` into your browser and something invisible happens before the page even starts loading: a quiet lookup turns that name into a number a computer can actually call. On AWS, the service doing that translation is **Amazon Route 53** - named for DNS port 53.

It sounds simple. But Route 53 is one of the most misunderstood services on the AWS Cloud Practitioner exam, mostly because people confuse it with CloudFront, with load balancers, and with each other's routing policies. Get the mental model right once, and a whole cluster of exam questions becomes easy.

## Why this matters

Almost every internet request begins with a DNS lookup. If you understand what Route 53 actually decides - and what it pointedly does *not* do - you'll stop second-guessing yourself.

The exam leans hard on three confusions:

- **Route 53 vs CloudFront** - routing decisions versus content caching.
- **Route 53 vs load balancers** - picking an endpoint versus spreading requests across servers.
- **The seven routing policies** - which one fits "fastest," "closest," "by country," "split traffic," or "switch on failure."

Master those three, and you've covered the substance of this entire topic.

## What Route 53 really is (and isn't)

Route 53 is AWS's **managed DNS service**. Its core job is translating a human-friendly name into the IP address a computer needs, then deciding which endpoint a request should reach. On top of that, it can also **register domain names** and run **health checks** - which is unusual, because most AWS networking services do just one of those things.

Here's the line to memorize: **Route 53 directs names to addresses. It does not cache content, and it does not balance requests across servers.**

- Caching images, video, and files at edge locations near users? That's **CloudFront**, a [content delivery network](/blog/aws-cloud-practitioner-mcq/09-amazon-cloudfront-cdn-edge-delivery).
- Spreading individual requests across [EC2 instances](/blog/aws-cloud-practitioner-mcq/06-amazon-ec2-instances-purchasing-options)? That's **Elastic Load Balancing (ELB)**.

Think of Route 53 as a receptionist who tells you which floor and which office to go to. It does not carry your packages (CloudFront) and it does not divide work among the people inside the office (ELB). It just sends you to the right door - fast, and reliably.

That single distinction answers a surprising number of questions. When a scenario says "make the site load faster by caching images near users," the service is CloudFront, not Route 53. When it says "balance requests across the instances," that's the load balancer's job. Route 53 happily works *alongside* both - an alias record often points a domain straight at a load balancer - but it does a different job.

## Hosted zones: the container for your records

A **hosted zone** is simply the collection of DNS records for one domain - the A records, CNAMEs, MX records, alias records, and so on for something like `example.com`. It's the settings container that tells Route 53 how to answer questions about that domain.

The word "zone" trips people up because it *sounds* geographic, like an Availability Zone or a Region. It isn't. A hosted zone has **no physical location** - it's a logical container of records, nothing more.

## Alias vs CNAME: the apex problem

This pair shows up constantly, so it's worth slowing down.

Both an **alias record** and a **CNAME** map one name to another. The difference is where they can live and what they cost:

- A **CNAME** cannot legally sit at the **zone apex** - the bare root domain, like `example.com` with nothing in front of it. DNS rules forbid it. CNAMEs also count as standard, billable DNS queries.
- An **alias record** is a Route 53 invention that *can* sit at the apex and point straight at AWS resources - an Application Load Balancer, a CloudFront distribution, or an [S3 website endpoint](/blog/aws-cloud-practitioner-mcq/10-amazon-s3-object-storage). And Route 53 charges **nothing** for alias lookups to AWS resources.

So when a question says "point the root domain `example.com` directly at a load balancer, but we can't use a CNAME at the top of the zone," the answer is almost always **alias record**. The apex limitation is the giveaway. People reach for CNAME out of habit - "it maps one name to another, right?" - and walk straight into the trap.

## The seven routing policies, in plain language

Route 53 doesn't just return one fixed answer. You choose a **routing policy** that decides *how* it answers. Here's each one with the scenario it's built for.

### Simple routing

The default and most basic. It maps a name to **a single resource** - one IP address, one endpoint - with no health checks, no percentages, no location logic.

Use it when the scenario says "just map `www.example.com` to one fixed IP, nothing fancy." The mistake here is over-thinking and reaching for an advanced policy. If there's no extra logic required, simple routing is correct.

### Latency-based routing

Sends each user to the Region that gives them the **fastest network response time** - the lowest round-trip latency.

The trap: "fastest" is *not* the same as "closest on a map." A geographically nearer Region can be slower on the actual network. So when you see the phrase **"fastest response time"**, think latency - even if the scenario also mentions where users are.

*Example:* European users land in Frankfurt and Asian users in Tokyo, each chosen by whichever Region answers fastest for them.

### Geolocation routing

Routes by the user's **physical or legal location** - continent, country, or even US state. This is the tool for serving different content for **licensing, compliance, or language** reasons tied to where the user actually is.

*Example:* A retailer must serve French users a French-language site and Japanese users a Japanese-language site strictly by the country they're browsing from. Latency wouldn't guarantee the legally correct content - only geolocation does. **Keywords like "licensing" or "country-specific" point here, not to latency.**

### Geoproximity routing

Routes by the **geographic distance** between users and your resources - and uniquely lets you set a **bias** that grows or shrinks the area a given resource serves, so you can deliberately pull more traffic toward one location.

Geolocation and geoproximity sound almost identical, so anchor on this:

- **Geolocation** = the user's location (country/state).
- **Geoproximity** = distance between user and resource, with an adjustable **bias**.

The word **"bias"** is the signal for geoproximity.

### Weighted routing

Splits traffic by **percentages you set** - say 90% to the current version and 10% to a new one. This is the standard choice for **gradual rollouts, A/B testing, and canary releases**.

*Example:* A startup wants to expose a new app version to just 10% of visitors while watching for problems before a full rollout. Weighted routing with weights of 90 and 10 does exactly that. Note the trap: "split traffic" can sound like load balancing, but here it's DNS-level percentage control, not ELB.

### Failover routing

Built for **active-passive** setups. You mark one record **primary** and one **secondary**, and attach a **health check** to the primary. While the primary passes, traffic goes there; the instant it fails, traffic automatically shifts to the standby.

*Example:* A primary site in one Region with an identical standby in another, where you want the standby used **only** when the primary goes unhealthy. That word "only" rules out anything that keeps both active.

### Multivalue answer routing

Returns **several healthy records at once** (up to eight) in a single DNS response, and uses health checks to leave out any endpoint that's failing - **without** any formal primary or backup. Clients get multiple good options and pick one.

It looks like failover (both use health checks) and looks like a load balancer (it returns multiple answers), but it's neither. There's no primary/secondary, and it doesn't actively distribute load the way ELB does - it's just **health-aware DNS** handing back several answers.

## Health checks: the engine behind failover

A Route 53 **health check** periodically tests whether an endpoint is responding. If the endpoint goes silent, Route 53 can stop returning it in DNS answers and send users to healthy ones instead. That's the foundation of both failover and multivalue routing.

What a health check is *not*:

- It does **not** block malicious traffic - that's [AWS WAF, security groups, or Shield](/blog/aws-cloud-practitioner-mcq/05-security-identity-compliance-services).
- It does **not** encrypt DNS.
- It does **not** scale servers up or down - that's EC2 Auto Scaling.

"Health check" is a term load balancers and Auto Scaling use too, but in Route 53 it specifically governs **whether a DNS record gets returned**.

## Common misconceptions

**"Route 53 makes the site faster by caching content."**
No. Route 53 caches nothing. It returns DNS answers, not files. Caching content near users is CloudFront's job.

**"Route 53 load-balances across my instances."**
No. Route 53 chooses an *endpoint* (like a load balancer's address) via DNS. Spreading requests across the instances behind that endpoint is the load balancer's work. They cooperate but do different things.

**"A hosted zone is a Region or data center."**
No. It's a logical container of DNS records for one domain, with no physical location.

**"Alias and CNAME are interchangeable."**
No. CNAMEs can't sit at the zone apex and are billed per query; alias records can sit at the apex and are free for AWS-resource lookups.

**"Global Accelerator and Route 53 do the same thing."**
Both move traffic globally, but only Route 53 is the **DNS and domain-registration** service. Domain registration is the giveaway for Route 53.

## How to choose the right policy

When a scenario lands in front of you, work through it like this:

1. **Is it really a DNS question?** If it mentions caching content, think CloudFront. If it mentions spreading requests across servers, think ELB. Otherwise it's likely Route 53.
2. **"Fastest response time"?** → Latency-based routing.
3. **"By country" / licensing / language?** → Geolocation routing.
4. **"Distance" plus an adjustable "bias"?** → Geoproximity routing.
5. **"Split traffic by percentage" / canary / A/B?** → Weighted routing.
6. **"Use the backup only when the primary fails"?** → Failover routing with health checks.
7. **"Return several healthy answers, no primary/backup"?** → Multivalue answer routing.
8. **"Single fixed mapping, no extra logic"?** → Simple routing.
9. **Root domain pointing at an AWS resource?** → Alias record, not CNAME.

## Conclusion

If you remember one thing, make it this: **Route 53 directs names to addresses - it doesn't cache content and it doesn't balance requests.** Everything else, from alias records to the seven routing policies, hangs off that single idea.

Once that clicks, a natural next question appears: if Route 53 only points you to the front door, what's actually waiting behind it? That's where **CloudFront** and **Elastic Load Balancing** come in - the two services Route 53 is most often confused with, and the two that finish the journey a DNS lookup begins.
