---
title: "Amazon CloudFront Explained: Faster Sites at the Edge"
metaTitle: "Amazon CloudFront CDN Explained Simply"
description: "Learn how Amazon CloudFront caches content at edge locations to cut latency, offload your origin, and stop confusing it with CLF-C02 look-alikes."
keywords:
  - amazon cloudfront
  - cloudfront cdn
  - aws edge locations
  - cloudfront vs global accelerator
  - cloudfront signed urls
  - cloudfront cache ttl
  - cloudfront vs route 53
  - s3 transfer acceleration vs cloudfront
  - cloudfront origin access control
  - aws clf-c02 cloudfront
  - cloudfront invalidation
  - cloudfront waf shield
topic: aws-cloud-practitioner-mcq
topicTitle: AWS Cloud Practitioner
category: Certifications
date: '2026-06-28'
order: 8
icon: ☁️
author: Brexis Wazik
transformed: true
linked: true
sources: []
faq:
  - q: What is Amazon CloudFront in simple terms?
    a: CloudFront is AWS's content delivery network (CDN). It stores cached copies of your files at hundreds of edge locations near users, so requests travel a short distance instead of all the way back to your origin server.
  - q: What's the difference between CloudFront and S3 Transfer Acceleration?
    a: CloudFront speeds up downloads to viewers by caching content at the edge. S3 Transfer Acceleration speeds up uploads into a single S3 bucket over long distances. One is for serving content out, the other for getting data in.
  - q: When should I use Global Accelerator instead of CloudFront?
    a: Use Global Accelerator for non-cacheable TCP or UDP traffic that needs static anycast IPs, like real-time games or APIs. Use CloudFront for cacheable HTTP/HTTPS web content.
  - q: How do I force CloudFront to serve a new version of a file?
    a: Create a cache invalidation for the affected file paths. This removes the stale objects from edge caches before their TTL expires, so the next request fetches a fresh copy from the origin.
  - q: How do I restrict CloudFront content to paying users?
    a: Use signed URLs or signed cookies. They grant time-limited access to specific files, so only authorized users can download them and the link expires automatically.
  - q: Is CloudFront only for static content?
    a: No. CloudFront caches static assets aggressively at the edge, and it can also accelerate dynamic, per-user responses by routing them over the AWS network with short or zero caching.
---

A user in Singapore clicks your product page. If your files live in a single bucket in Virginia, that request crosses an ocean and back before a single image appears. That round trip is why the page feels slow, and it is exactly the problem Amazon CloudFront was built to erase.

CloudFront is AWS's content delivery network. Instead of forcing every visitor to reach your one origin server, it keeps cached copies of your content at hundreds of edge locations around the world and serves each person from the one nearest them.

## Why this matters

Speed is not a nice-to-have. Slow pages lose sales, frustrate users, and quietly punish you in search rankings. A global audience makes it worse: the farther a user is from your server, the longer they wait.

CloudFront fixes this in two ways at once. It cuts **latency** by serving content from a nearby edge, and it reduces load on your origin because repeated requests never reach it. For the AWS Certified Cloud Practitioner exam (CLF-C02), it is also one of the most heavily tested services and one of the easiest to mix up with its look-alikes. Get the distinctions clear and you will pick up easy points instead of falling for traps.

## What CloudFront actually does

Think of a popular book. The publisher prints it once, but bookstores all over the world stock copies. You do not fly to the printer to buy one. You walk to a shop down the street.

CloudFront works the same way. Your **origin** is the printer: an [S3 bucket](/blog/aws-cloud-practitioner-mcq/10-amazon-s3-object-storage), an Application Load Balancer, or any custom web server holding the original content. The **edge locations** are the bookstores: a large network of sites in many cities that hold cached copies close to readers.

When someone requests a file:

1. CloudFront checks the nearest edge location for a cached copy.
2. If it has one (a **cache hit**), it serves it instantly. The origin never hears about it.
3. If it does not (a **cache miss**), CloudFront fetches the file from your origin, serves it, and stores a copy at the edge for next time.

That is the whole loop. Most requests become fast, local cache hits, and your origin only does real work occasionally.

### Edge locations are not Regions

This trips people up constantly. AWS **Regions** are big geographic areas, each containing isolated data centers called **Availability Zones** that exist for high availability. **Edge locations** are a completely separate, far more numerous network of sites whose only job is to cache and deliver content close to users.

There are many more edge locations than Regions, in many more cities. That proximity is the entire point of a CDN. An edge location is not an Availability Zone, and there is no rule of one edge per Region.

## CloudFront vs the services people confuse it with

Most exam mistakes (and real-world misconfigurations) come from picking a look-alike service. Here is the clean split.

### Route 53 is DNS, not caching

**Amazon Route 53** is a DNS service. It translates a domain name into an address and can use routing policies, like latency-based or geolocation routing with health checks, to point a user at the nearest healthy endpoint you actually have.

But DNS only chooses among endpoints that exist. If you have one bucket in one Region, Route 53 cannot conjure a closer one. It never caches content. CloudFront is the service that creates nearby copies.

A useful one-liner: *"Send users to the nearest endpoint by DNS" is Route 53. "Cache and deliver content near users" is CloudFront.*

### S3 Transfer Acceleration is for uploads

**S3 Transfer Acceleration** speeds up moving large files *into* (or out of) a single S3 bucket over long distances. It routes the transfer through a nearby edge location and then over Amazon's fast internal network to the bucket.

Here is the sneaky part: Transfer Acceleration uses CloudFront's edge locations under the hood, so people answer "CloudFront" when asked about fast uploads. But the named feature for accelerating S3 uploads is Transfer Acceleration. CloudFront is about serving content out to viewers.

### Global Accelerator is for non-cacheable traffic

**AWS Global Accelerator** gives you static anycast IP addresses and routes traffic over the AWS global network to the best endpoint. It is built for TCP and UDP traffic that *cannot* be cached, like a real-time multiplayer game or a latency-sensitive API.

Both CloudFront and Global Accelerator "use the AWS global network for speed," which is why they get confused. The split is simple:

- **Cacheable HTTP/HTTPS content** goes to CloudFront.
- **Non-cacheable TCP/UDP needing static IPs** goes to Global Accelerator.

### Elastic Load Balancing balances inside one Region

An **Application Load Balancer** spreads requests across servers (like [EC2 instances](/blog/aws-cloud-practitioner-mcq/06-amazon-ec2-instances-purchasing-options)) within a single Region. It does nothing about geographic distance.

CloudFront and an ALB are not interchangeable; they are teammates. Put CloudFront at the edge to cache content globally, and use the ALB as its origin to balance the backend. CloudFront does not distribute traffic across EC2 instances, and it does not replace the load balancer.

## Controlling the cache: TTL and invalidations

A CDN is only useful if you can control how fresh the content is. CloudFront gives you two levers.

### TTL decides how long a copy stays fresh

**Time to Live (TTL)** tells CloudFront how long an object may be served from the edge before it is treated as stale and re-checked against the origin. A long TTL means great performance but slow updates. Change a CSS file with a long TTL and users keep getting the old version for hours.

Watch out for the two-TTLs trap. **CloudFront cache TTL** controls how long content is cached at the edge. **Route 53 DNS TTL** controls how long a name-to-address mapping is cached. The exam loves to swap them.

### Invalidations push urgent changes now

When you cannot wait for the TTL to expire, create a **cache invalidation** for the affected file paths. This removes those objects from the edge caches immediately, so the next request fetches a fresh copy from the origin.

That is the right tool for an urgent fix, not deleting the distribution (drastic and it breaks your links) and not touching DNS TTL (wrong layer entirely).

## Security at the edge

CloudFront sits in front of your application, which makes it a natural place to add protection. Three services pair with it, and they do different jobs.

### Signed URLs lock content to specific users

Want only paying subscribers to download a premium PDF, with the link expiring after a set time? Use **signed URLs** or **signed cookies**. They grant time-limited, controlled access to specific content.

Do not confuse this with **Origin Access Control (OAC)**. OAC locks your S3 bucket so it is reachable *only* through CloudFront, protecting the path between CloudFront and the origin. Signed URLs control *which viewers* may fetch a file. Both sound like "security," but they guard different doors.

### WAF filters malicious requests

[**AWS WAF**](/blog/aws-cloud-practitioner-mcq/05-security-identity-compliance-services) (Web Application Firewall) inspects incoming HTTP/HTTPS requests and blocks things like SQL injection and cross-site scripting using rules. Attach it to your distribution and bad requests are filtered at the edge, before they ever reach your application.

### Shield defends against DDoS

**AWS Shield** protects against DDoS (flooding) attacks. **Shield Standard** is automatic and free for services like CloudFront, defending against common volumetric attacks with no agent to install. **Shield Advanced** is a paid tier adding larger-scale protection, 24/7 response support, and cost protection.

The classic exam swap: WAF filters request *content* (SQLi, XSS); Shield absorbs DDoS *floods*. Both pair with CloudFront, but they are not the same job.

## Common misconceptions

- **"CloudFront only serves static files."** It caches static assets aggressively, but it also accelerates dynamic, per-user content by routing it over the AWS backbone with short or zero TTL. You set different cache behaviors for different paths.
- **"CloudFront speeds up everything."** It accelerates content delivery to viewers. It does nothing for an internal database queried only by app servers in one Region. That is a different layer, handled by tools like ElastiCache or [read replicas](/blog/aws-cloud-practitioner-mcq/11-amazon-rds-managed-relational-databases).
- **"CloudFront just makes things faster."** A second, equally big benefit is **origin offload**. During a traffic spike, cached responses absorb repeated requests so your backend does far less work, even with the same number of visitors.
- **"Moving my bucket to a closer Region solves global latency."** One Region helps users near it. A truly global audience needs a CDN that caches everywhere.
- **"Route 53 can be a CloudFront origin."** No. An origin is a real content source: an S3 bucket, an ALB, or a custom HTTP server. DNS, security groups, and IAM roles serve no content.

## How to use this

When you are designing (or answering an exam question), walk through these steps:

1. **Name the goal.** Faster downloads to a global audience? CloudFront. Faster uploads to a bucket? Transfer Acceleration. Non-cacheable TCP/UDP with static IPs? Global Accelerator. Route users by DNS? Route 53.
2. **Pick the origin.** Static files go to an S3 bucket; a dynamic app goes behind an ALB; anything else can be a custom HTTP server.
3. **Set cache behaviors.** Cache static paths with a long TTL. Give dynamic, personalized paths a short or zero TTL.
4. **Lock the front door.** Use Origin Access Control so users cannot bypass CloudFront and hit the bucket directly. Use signed URLs or cookies to restrict premium content per user.
5. **Add protection.** Shield Standard is already on. Attach WAF if you need rule-based filtering for SQLi and XSS.
6. **Plan for updates.** Know that you invalidate the cache to push urgent changes, rather than waiting for TTL or touching DNS.

For a static site that needs lower global latency *and* no direct bucket access, the textbook answer is: put CloudFront in front of the bucket and restrict the bucket so it is reachable only via CloudFront.

## Conclusion

The single idea to carry away: CloudFront moves your content close to your users and shields your origin from repeat traffic. Everything else, the TTLs, the signed URLs, the WAF and Shield pairing, is detail hanging off that one purpose.

The deeper habit worth building is matching the *shape* of the problem to the *shape* of the service. Caching content out is CloudFront. Routing data in is Transfer Acceleration. Static IPs for raw packets is Global Accelerator. Resolving names is Route 53. Once that mental map clicks, a whole cluster of AWS questions stops being tricky. Next, try the same lens on [Route 53 routing policies](/blog/aws-cloud-practitioner-mcq/08-amazon-route-53-dns-routing), where "nearest healthy endpoint" hides a surprising amount of depth.
