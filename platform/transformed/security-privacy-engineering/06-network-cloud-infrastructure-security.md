---
title: "Cloud Security: Why 99% of Breaches Are Your Fault"
metaTitle: "Cloud & Infrastructure Security Basics"
description: "Most cloud breaches aren't broken encryption — they're misconfigs, leaked keys, and poisoned dependencies. Here's how cloud security actually fails, and how to fix it."
keywords:
  - cloud security
  - infrastructure security
  - shared responsibility model
  - cloud misconfiguration
  - secrets management
  - supply chain security
  - kubernetes security
  - defense in depth
  - zero trust network access
  - least privilege IAM
  - public S3 bucket breach
  - TLS and mTLS
  - SBOM software bill of materials
  - container image scanning
faq:
  - q: "Who is responsible for security in the cloud?"
    a: "Both you and your provider, split by the shared responsibility model. The provider secures the cloud itself — data centers and hardware. You secure what you put in it: your data, access, configuration, and code. Most breaches happen on your half."
  - q: "What causes most cloud security breaches?"
    a: "Not broken encryption. Attackers walk in through misconfigured settings, leaked passwords or API keys, and poisoned software dependencies. Roughly 99% of cloud security failures trace back to customer mistakes, not provider flaws."
  - q: "What is the difference between a VPN and ZTNA?"
    a: "A VPN puts a remote worker 'inside' the network, often with broad access once connected. ZTNA (Zero Trust Network Access) grants access to one specific application at a time and verifies every request, so a stolen login doesn't unlock everything."
  - q: "Why shouldn't I store secrets in my code or .env file?"
    a: "Once a secret is committed to git, assume it's burned forever — the history persists even after you delete it. Use a secrets manager like Vault or AWS Secrets Manager, and add pre-commit scanning so keys are caught before they ever land."
  - q: "What is an SBOM and why does it matter?"
    a: "An SBOM (Software Bill of Materials) is a full ingredient list of every dependency, version, and checksum in your software. It lets you instantly answer 'are we affected?' when a new vulnerability or backdoor is discovered in a library you use."
  - q: "How should I decide which security patches to apply first?"
    a: "Prioritize by real-world risk, not just severity. Patch anything in CISA's Known Exploited Vulnerabilities (KEV) catalog first — those are being attacked right now — then use CVSS and EPSS scores to rank the rest."
author: Pritesh Yadav
topic: security-privacy-engineering
topicTitle: Security & Privacy Engineering
category: Engineering
date: '2026-06-21'
order: 5
icon: "\U0001F512"
transformed: true
sources: []
---

Attackers almost never break the encryption. They don't need to. They walk in through a setting someone forgot to flip, a password that leaked two years ago and still works, or a software update that was quietly poisoned upstream.

That's the uncomfortable truth about modern security. Your application code can be flawless and you can still lose everything — because the real battle is over *where the code runs*. The network it talks across. The cloud account that hosts it. The build pipeline that produced it.

This article is about defending that ground, and most of it comes down to discipline rather than cryptography.

## Why this matters

Through 2025 and 2026, roughly **99% of cloud security failures are the customer's fault** — not the cloud provider's. That number, originally from Gartner, has held up year after year.

The cost is not abstract. IBM's 2025 *Cost of a Data Breach* report puts the global average breach at **USD 4.44 million**. Credential-based breaches — someone using a stolen login — take about **292 days** to detect and contain. That's nearly ten months of an intruder having the run of your systems.

Here's the reassuring flip side: if almost every failure is a customer mistake, then almost every failure is *preventable* with the right habits. You're not up against unbeatable math. You're up against open doors that nobody bothered to close.

**Think of it like a medieval castle.** Your code is the treasure in the vault. The network is the moat and walls. The cloud account is whoever holds the keys. The supply chain is the food the cooks carry in. You can build a perfect vault and still lose everything if a guard hands over his key or the food is poisoned.

## Defense in depth: many layers, no single point of failure

**Defense in depth** means stacking overlapping protections so that one failure doesn't expose everything. Picture the watertight compartments in a ship's hull — flood one and the vessel stays afloat.

Here are the layers, in plain terms.

### Firewalls — the gatekeepers

A **firewall** decides what traffic is allowed to cross a boundary. They've grown smarter over three generations:

- **Packet-filtering** firewalls check only the address and port — crude but fast.
- **Stateful** firewalls remember the conversation, so they know "this is a reply to a request we sent out."
- **Next-Generation Firewalls (NGFW)** are application-aware. They can tell "this is traffic to Facebook," not just "this is port 443."

The golden rule across all of them is **default-deny**: block everything, then explicitly allow only what's needed. It's the difference between a bouncer with a guest list and a door propped open with a brick.

### Segmentation — don't build one big flat room

If your whole network is one open space, an attacker who gets in anywhere can reach everything. **Segmentation** splits it into isolated zones. A **DMZ** (demilitarized zone) is a buffer area where internet-facing servers live, kept well away from the crown jewels like your database.

The classic cautionary tale is the **2013 Target breach**. Attackers stole credentials from an air-conditioning vendor, slipped onto Target's network, and reached the payment systems — because the vendor's network was never walled off from the payment network. One flat space, 40 million card numbers gone.

**Microsegmentation** takes this to the extreme: every individual workload gets its own walls. It's the foundation of zero trust.

### Remote access — VPN versus ZTNA

A **VPN** builds an encrypted tunnel so a remote worker appears to be "inside" the network. The problem: once inside, they often get broad access. And VPN gateways themselves became favorite targets — Ivanti, Fortinet, and Citrix appliances all had serious, actively-exploited flaws through 2023–2025.

**ZTNA** (Zero Trust Network Access) flips the model. Instead of dropping you inside the whole network, it grants access to one specific application at a time and re-checks every request. A stolen login unlocks one door, not the building.

### Detection and filtering — IDS, IPS, and WAF

- An **IDS** (Intrusion Detection System) watches and *alerts* but doesn't block — like a security camera.
- An **IPS** (Intrusion Prevention System) sits in the traffic's path and can *block* it — like a guard who steps in.
- A **WAF** (Web Application Firewall) is a filter built specifically for web apps. It stops common attacks like SQL injection and cross-site scripting. The OWASP Core Rule Set is the standard ruleset.

One honest caveat: a WAF buys time, it doesn't cure the problem. It's a bandage over vulnerable code, not a replacement for fixing the code.

### DDoS — the 2025 escalation

A **DDoS** (Distributed Denial of Service) attack floods you with junk traffic from thousands of machines to knock you offline. The scale in 2025 became almost cartoonish: Cloudflare blocked a record **31.4 terabits-per-second** attack in November 2025 — over 700% larger than the previous year's records, driven by a massive botnet of hijacked internet-of-things devices.

You cannot absorb a flood like that on a single server. You need an always-on, distributed "scrubbing" network sitting at the edge in front of you, filtering the junk before it reaches your door.

## Encrypt everything in motion: TLS and mTLS

**TLS** (Transport Layer Security) is the encryption that protects data while it travels — the padlock in your browser bar. **TLS 1.3** is the current standard: faster, with the old weak ciphers stripped out. Turn off the ancient versions (TLS 1.0, 1.1, and SSL) entirely. As of March 2025, PCI DSS v4.0 makes a modern TLS minimum mandatory for anyone handling card payments.

Ordinary TLS only proves the *server's* identity. You verify your bank's certificate, but the bank doesn't verify yours — your password does that.

**mTLS** (mutual TLS) makes *both* sides present a certificate, so each end cryptographically proves who it is. This is the backbone of zero trust *inside* a system: when hundreds of small services talk to each other, none of them trusts a request just because it "came from inside the network." Every service proves its identity, every time. That's the core principle of zero trust architecture in five words: **never trust, always verify.**

## The shared responsibility model: your half is the dangerous half

This is the single most misunderstood idea in cloud security, so let's make it crisp.

- The provider handles **security OF the cloud** — the physical data centers, the hardware, the underlying platform.
- You handle **security IN the cloud** — your data, your user access, your network settings, your patching, your code.

Where exactly the line falls depends on what you're renting:

| What you're using | Provider handles | You handle |
| --- | --- | --- |
| **IaaS** (a raw virtual machine) | Hardware, network fabric | OS patching, app, data, access, network config |
| **PaaS** (a managed database or app platform) | The above, plus OS and runtime | App code, data, access, config |
| **SaaS** (email, CRM) | Almost everything | Your data, who can access it, settings |

The trap is assuming "the cloud is secure" and quietly skipping *your* half. In 2025, misconfigurations caused about 23% of cloud incidents — and 82% of those were human error, not provider flaws.

**The provider hands you safe building materials and a front door with a good lock.** If you leave the door open, that's on you. Most failed compliance audits stumble at exactly this gap.

## Identity is the new perimeter

In the cloud, the old idea of a network "edge" you can defend mostly dissolves. What matters now is **identity** — who can do what. **IAM** (Identity and Access Management) is the real control plane.

The guiding rule is **least privilege**: give every person and service the minimum access they need, and nothing more. The common rot looks like this:

- Wildcard policies that effectively say "anyone can do anything to everything."
- Old, over-powered roles nobody uses anymore but never removed.
- Long-lived access keys that never expire.
- No multi-factor authentication on accounts that can do real damage.

The fix: prefer **short-lived, auto-expiring credentials** over permanent static keys, and require MFA on every privileged identity. A credential that expires in an hour is far less useful to a thief than one that works forever.

### The public bucket: the cloud's most embarrassing failure

A storage **bucket** is just a cloud folder. Set it to public-readable, and anyone with the link downloads everything — no exploit, no skill, no hacking required. It's leaving a filing cabinet on the sidewalk.

This keeps happening. In late 2025, a single public bucket exposed **273,000+ Indian bank-transfer documents** — names, addresses, phone numbers, account numbers. Earlier that year, one exposed server leaked over **158 million** cloud secret-key records. And the textbook case, **Capital One in 2019**, combined a web flaw with an over-permissive role to pull 100 million+ records out of cloud storage.

It happens so often that AWS now turns on "Block Public Access" by default. Don't undo that without a very good reason.

## Keep secrets out of your code

**Never** hardcode secrets — API keys, passwords, tokens — into your source, and never commit a `.env` file to git. Once it's in the git history, assume it's burned forever. Deleting the file doesn't help; the history remembers.

Instead, use a **secrets manager** — HashiCorp Vault, AWS Secrets Manager, Azure Key Vault, or Google's Secret Manager. These give you encrypted, access-controlled, *audited* storage, plus automatic rotation and short-lived secrets.

The scale of this problem is genuinely alarming. GitGuardian found **28.65 million** new secrets leaked on public GitHub in 2025, and **70% of leaked secrets are still active two years later**. AI-assisted commits leak secrets at roughly double the normal rate — a fresh risk from the "vibe-coding" era of letting AI write code fast.

One real example of the stakes: the December 2024 US Treasury breach traced back to a *single* leaked API key. Attackers strolled past millions of dollars of security spending through one exposed credential.

**Do this:** add pre-commit secret scanning (tools like gitleaks, TruffleHog, or GitGuardian) so a key is caught *before* it ever lands. And if one does leak, rotate it immediately — don't just delete the commit.

## Containers, Kubernetes, and infrastructure as code

If you ship software in containers, a few habits cover most of the risk:

- **Scan your images** for known vulnerabilities (Trivy is the go-to tool).
- **Start from minimal base images** — less code means less to attack.
- **Run as a non-root user**, and never bake secrets into the image.
- **Pin to a specific version** rather than the moving `:latest` tag, and **sign your images** so you can verify they weren't tampered with.

For **Kubernetes** (the system that orchestrates containers at scale), the priorities are least-privilege access controls, locked-down pod settings for production, and **NetworkPolicies** with a default-deny stance so one compromised container can't freely chat with everything else. That's network segmentation again, applied inside the cluster — it limits how far an attacker can spread. The CIS Kubernetes Benchmark gives you a concrete checklist.

**Infrastructure as code** (Terraform, CloudFormation, and friends) means your servers and settings are defined in files. The big win is that you can *scan those files for mistakes before anything is deployed* — catching public buckets and wide-open firewalls in review instead of in production. Tools like Checkov and Trivy do this. Two traps to watch: secrets can leak into the Terraform state file in plaintext (store it encrypted), and live infrastructure can quietly **drift** away from what the code says.

## The supply chain: attacking what you build on

The most sophisticated attackers don't target your code. They target the things your code depends on. Two stories every engineer should carry:

1. **SolarWinds (2020).** A state-backed group compromised the *build system* of a popular IT tool and slipped a backdoor into officially *signed* software updates. About 18,000 organizations downloaded the poisoned update, including multiple US government departments. The lesson landed hard: a signed file is only as trustworthy as the pipeline that built it.

2. **The xz-utils backdoor (2024).** An attacker spent roughly 2.6 years posing as a helpful volunteer maintainer on a tiny but ubiquitous compression library, earning trust, then quietly inserted a backdoor. It was caught almost by luck — a Microsoft engineer noticed SSH logins were taking half a second longer than expected. The lesson: human trust and maintainer burnout are themselves an attack surface. It was called the biggest supply-chain near-miss since Log4j.

In 2025, supply-chain attacks more than doubled, and over 70% of organizations reported at least one. The modern defense is a triad:

- **SBOM** (Software Bill of Materials) — a full ingredient list of every dependency, so when the next backdoor surfaces you can instantly answer "are we affected?"
- **Signed artifacts** (using tools like Sigstore and cosign) — cryptographic proof that what you're running is what was actually built.
- **Build provenance** (the SLSA framework) — proof that the build pipeline itself wasn't tampered with.

## Common misconceptions

**"The cloud is secure, so I'm covered."**
The cloud provider secures their half. Your data, access, and configuration are entirely yours to protect — and that's where breaches happen.

**"Encryption is the hard part of security."**
Attackers rarely bother breaking encryption. They use leaked keys, open buckets, and forgotten misconfigurations. The hard part is discipline, not math.

**"I deleted the leaked key from git, so it's fine."**
Git history persists. Once a secret is committed, treat it as compromised and rotate it immediately. Deleting the commit does nothing.

**"A signed software update is automatically safe."**
SolarWinds proved otherwise. If the build pipeline is compromised, the malware gets signed too. Trust the chain, not just the signature.

**"A WAF means my app is protected."**
A WAF buys time against attacks. It does not fix the underlying vulnerable code — you still have to patch.

## How to use this

Start with the moves that close the biggest gaps for the least effort:

1. **Audit your shared-responsibility half.** List your data, access, network settings, and patching. Assume the provider does none of it for you.
2. **Lock down public access.** Confirm no storage bucket is publicly readable. Keep "Block Public Access" on by default.
3. **Enforce least privilege and MFA.** Remove wildcard permissions and unused roles. Require MFA on every account that can do damage.
4. **Switch to short-lived credentials.** Replace permanent static keys with auto-expiring ones wherever you can.
5. **Get secrets out of code.** Move them into a secrets manager and add pre-commit secret scanning so leaks are caught before they land.
6. **Scan before you deploy.** Run image scanning, infrastructure-as-code scanning, and dependency checks inside your build pipeline — not after.
7. **Build an SBOM and sign your artifacts.** Know exactly what's in your software and prove it wasn't tampered with.
8. **Patch by real-world risk.** Apply anything in the CISA Known Exploited Vulnerabilities catalog first — those are under active attack right now.
9. **Segment aggressively.** Wall off networks and Kubernetes pods with a default-deny stance so one breach can't spread.

You don't have to do all nine this week. Even the first three meaningfully shrink your exposure.

## Conclusion

The single takeaway is this: **securing where your code runs is overwhelmingly about discipline, not cryptography.** The breaches that actually hurt come from open doors, leaked keys, and poisoned dependencies — every one of them on the customer's side of the line. Close those doors and you've handled the 99%.

But there's a deeper layer worth your curiosity. Notice how often "stolen credentials" and "leaked secrets" sit at the root of these stories. That points to a harder question: in a world without a network perimeter, how do you prove *who* and *what* gets to do *anything at all* — when even a valid login might be an impostor? That's the world of zero trust and identity-first security, and it's where the next decade of defense is being decided.
