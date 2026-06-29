---
title: "DevSecOps: Build Security In, Don't Bolt It On"
metaTitle: "DevSecOps & Secure SDLC: A Practical Guide"
description: "Learn how DevSecOps weaves security into every stage of the SDLC, so flaws get caught in design and code, not in a panicked review the night before launch."
keywords:
  - devsecops
  - secure sdlc
  - shift left security
  - threat modeling
  - software supply chain security
  - SAST vs DAST
  - SBOM
  - secrets scanning
  - SLSA
  - security champions
  - CI/CD security
  - OWASP Top 10 2025
faq:
  - q: What is the difference between SDLC and DevSecOps?
    a: The SDLC is the sequence of stages software moves through, from plan and design to deploy and operate. DevSecOps is the practice of building security activities into every one of those stages, automated and continuous, instead of leaving security as a final gate.
  - q: What does "shift left" mean in security?
    a: Shift left means moving security work earlier in the timeline, catching problems during design and coding rather than in production. Modern teams pair it with "shift right" (monitoring the running app) for full coverage.
  - q: What is the difference between SAST and DAST?
    a: SAST scans your source code at rest for risky patterns and runs early, but produces many false positives. DAST attacks the running app from the outside in staging and produces fewer false positives. They see different angles, so use both.
  - q: Is deleting a leaked secret from a commit enough?
    a: No. Once a credential hits git history it is compromised forever, because that history is copied to every clone. You must rotate the key, meaning revoke the old one and issue a new one. Removing it from history is not revoking it.
  - q: What is an SBOM and why do I need one?
    a: An SBOM (Software Bill of Materials) is a machine-readable inventory of every component in your software. It answers "what's in my software?" so that when the next Log4Shell hits, you can find affected systems in minutes instead of weeks.
  - q: What is a realistic DevSecOps target for a small team?
    a: Start with SCA and secret scanning on every pull request, SAST blocking only on Critical and High findings, an automatically generated SBOM, pinned dependencies, and SLSA Level 2 build provenance. These are achievable in days, not months.
topic: security-privacy-engineering
topicTitle: Security & Privacy Engineering
category: Engineering
date: '2026-06-21'
order: 8
icon: "\U0001F512"
author: Pritesh Yadav
transformed: true
sources: []
---

Picture the night before a launch. The code is done, the demo works, and then someone remembers to send it for security review. The reviewer finds a real flaw. But the deadline is tomorrow, so one of two things happens: the flaw ships anyway, or the review gets quietly skipped "to save time."

This is how most teams do security, and it almost always fails. The fix isn't a better last-minute review. It's a different idea entirely: **build security in, don't bolt it on.** Make security a property of *how* you build software, not a gate at the very end.

## Why this matters

Two terms, defined plainly, before we go further.

The **SDLC (Software Development Life Cycle)** is the path software walks through: plan, design, code, build, test, deploy, operate. **DevSecOps** is the practice of weaving security into every one of those stages, automated and continuous, so security is *everyone's* job instead of one team's final checkpoint. The "Sec" sits literally inside "DevOps" on purpose. A separate security gate at the end becomes a bottleneck, and bottlenecks get bypassed under deadline pressure.

The money makes the case better than any lecture. IBM's *Cost of a Data Breach 2025* report put the global average breach at **$4.44 million**, with the US average at a record **$10.22 million**. The average breach took **241 days** to find and contain. And a widely cited IBM/NIST figure says a flaw fixed at design time costs roughly **100 times less** than the same flaw fixed in production.

There's a newer wrinkle too: **Shadow AI**, meaning employees using AI tools the company never approved. It was a factor in 20% of breaches in 2025 and added about $670K in cost, and 97% of AI-related breaches happened at organizations with no AI access controls at all.

> A warning before we start: DevSecOps is not a product you buy. A scanner with nobody tuning it, no service-level agreements, and no culture change just produces alerts everyone learns to ignore. DevSecOps is a way of working, not a license.

## Shift left, then shift everywhere

**Shift left** means moving security activities earlier on the timeline, toward the left, so you catch problems in design and code instead of in production.

But design-time review can't catch a deployment misconfiguration or a bug that only appears at runtime. So good teams also **shift right**: they monitor the running app in production. The combination has a name, **shift everywhere**, and it's the whole game.

Think of a car factory. Shift left is catching a defect on the assembly line before the car is built. Shift right is monitoring cars already on the road and issuing a fast recall when something slips through. You need both. Fixing it on the line is far cheaper, but some faults only show up when real drivers hit real roads.

Here's roughly where each activity lands across the lifecycle:

- **Plan:** risk requirements
- **Design:** threat modeling (STRIDE)
- **Code:** secure IDE hints, pre-commit hooks, early SAST and SCA
- **Build / CI:** SAST, SCA, secrets scanning, infrastructure-as-code scanning
- **Test:** DAST, IAST
- **Deploy:** artifact signing, build attestation, admission control
- **Operate:** runtime monitoring, web application firewall, SBOM watch

Everything from Plan through Test is shift left. Deploy and Operate are shift right.

## Threat modeling: asking "what could go wrong?" before you build

**Threat modeling** is a structured conversation, held during architecture and *before* code, that asks one question: what could go wrong? The most common framework is Microsoft's **STRIDE**, where each letter is a category of threat that maps to a defense you want.

| STRIDE threat | Plain meaning | Property you want |
|---|---|---|
| **S**poofing | Pretending to be someone else | Authentication |
| **T**ampering | Altering data or code | Integrity |
| **R**epudiation | Denying you did something | Non-repudiation (logging) |
| **I**nformation disclosure | Leaking private data | Confidentiality |
| **D**enial of service | Making the system unavailable | Availability |
| **E**levation of privilege | Gaining rights you shouldn't have | Authorization |

If STRIDE feels heavy, Adam Shostack's **four questions** capture the spirit: *What are we building? What can go wrong? What are we going to do about it? Did we do a good job?*

Keep it collaborative. Developers know the code, product managers know the business context, and security people know the threats. The output isn't a brainstorm that evaporates by Friday. It's a list of threats where **each one has a mitigation, an owner, and a tracking ticket.** Re-run it when the architecture changes. Good free and commercial tools include OWASP Threat Dragon, the Microsoft Threat Modeling Tool, and IriusRisk.

## The four scanners, and what each one actually sees

Four automated scanners show up again and again. Each sees a different angle, and none is enough alone. Use them layered.

| Type | What it scans | When | False positives |
|---|---|---|---|
| **SAST** (Static) | Your source code at rest (SQL injection, XSS patterns) | On pull request / build | High (15–60%) |
| **SCA** (Composition) | Third-party dependencies vs. known-flaw databases | On PR / build / continuous | Low (2–10%) |
| **DAST** (Dynamic) | The running app, attacked from outside | In staging | Low–medium |
| **IAST** (Interactive) | Running app, instrumented from inside | During tests | Very low (heavy setup) |

A **CVE (Common Vulnerabilities and Exposures)** is a public catalogue entry for a known flaw. SCA has low false positives because it does exact version matching against those CVE entries, not pattern guessing, which makes it your supply-chain frontline (Dependabot, Snyk, Trivy, OWASP Dependency-Check). SAST has high false positives because it *infers* bugs from code patterns. The classic free DAST tool is OWASP ZAP.

## The CI/CD rule that keeps developers on your side

**CI/CD** stands for Continuous Integration / Continuous Delivery, the automated pipeline that tests and ships every code change. The single most important rule here is counterintuitive: **don't fail the build on everything.**

If a low-severity finding blocks a release, developers will learn to disable or route around the scanner. So:

- **Block** only on Critical and High severity findings that are confirmed and actually reachable.
- **Warn and track**, but don't block, on Medium and Low.

Then tune out false positives aggressively. Otherwise you get **alert fatigue**, and once developers stop trusting the tool, the tool is dead.

> The principle: keep "blocking gates" (hard stops) very few and high-confidence, and let everything else be "informational findings" that are visible and tracked but never blocking. A pipeline with 200 hard gates is a pipeline everyone routes around.

## Secrets scanning: three layers, and the mistake everyone makes

A **secret** is a credential like an API key, password, or token. The de-facto open-source scanner is **gitleaks**, a single binary with 700-plus patterns for things like AWS keys (`AKIA...`), Stripe keys (`sk_live_...`), and GitHub tokens (`ghp_...`). To put the scale in perspective, GitGuardian found **28.65 million secrets leaked on public GitHub in 2025** alone.

Defend in depth, across three layers:

1. **Pre-commit hook** (`gitleaks protect`) blocks the secret locally before it's ever committed. Best experience, because nothing leaves the laptop.
2. **CI job** on push or pull request is your backstop for when someone skips the hook.
3. **Platform protection** (such as GitHub Push Protection) blocks supported secret types before they leave the machine.

> The mistake nearly everyone makes: deleting a leaked secret from a commit and assuming you're safe. Once a secret hits git history it is compromised forever, because that history is copied to every clone. You must **rotate the key**, meaning revoke the old one and issue a new one. Removing it from history is not revoking it.

## Your software is mostly other people's software

This is the hottest security topic of the moment, and for good reason. Supply-chain attacks **more than doubled in 2025**; Sonatype counted over 454,600 new malicious packages that year. The **OWASP Top 10 2025** (OWASP is a respected nonprofit that publishes security guidance) added a brand-new category, **A03: Software Supply Chain Failures**, with the highest incidence rate of any category but very low CVE coverage. In plain terms: the attacks are outrunning the scanners' signatures.

Three landmark incidents each teach a different lesson.

### Log4Shell: you can't fix what you can't find

In December 2021, a trivially exploitable remote-code-execution flaw (the maximum severity, CVSS 10.0) surfaced in Log4j, a logging library that's everywhere. It had been dormant since 2013. Organizations with no inventory spent *weeks just finding where Log4j was* before they could even start patching. The lesson: **you can't fix what you can't find.** You need an SBOM.

### SolarWinds: a signature is worthless if the build is compromised

In 2020, attackers compromised the **build server** itself. Their malware watched for the compiler and swapped source files at compile time, so malicious code got *legitimately signed* and shipped to around 18,000 customers through a trusted update. The lesson: **signing a build doesn't help if the build itself is compromised.** Defend the pipeline and signing keys as hard as you defend production.

### xz-utils: trust itself is exploitable

In March 2024, a backdoor (again CVSS 10.0) granting remote SSH access was slipped into a critical compression library by a patient attacker who spent two to three years social-engineering their way into co-maintainer status on an under-resourced project. It was caught by luck, when a Microsoft engineer noticed 500 milliseconds of extra SSH latency, just before it reached stable Linux distributions. The lesson: **a single-maintainer open-source project is a national-security-grade attack surface, and trust itself is exploitable.**

> One more, because it shows where this is heading: the 2025 npm "Shai-Hulud" worm was the first *self-replicating* npm worm. It phished a maintainer's token, injected malware through post-install scripts, then used the stolen token to auto-poison that maintainer's *other* packages and republish them, spreading with no human in the loop and poisoning 500-plus packages. The lesson: long-lived tokens plus auto-running install scripts are worm fuel. Use 2FA, scoped short-lived tokens, `--ignore-scripts`, and lockfiles.

## The modern supply-chain toolkit

Four tools and practices directly answer the lessons above.

- **SBOM (Software Bill of Materials):** a machine-readable inventory of every component in your software, in formats like SPDX or CycloneDX. It answers "what's in my software?" Generate one automatically per build. Note what it *doesn't* do: it can't prove the software was actually built from the code you think.
- **SLSA** (pronounced "salsa," Supply-chain Levels for Software Artifacts): a graduated framework for build **provenance**, a verifiable record of how an artifact was built. Level 1 means provenance exists; Level 2 means signed provenance from a hosted build service; Level 3 means a hardened, tamper-resistant build. The pragmatic target is **Level 2**, achievable in a day or two on GitHub Actions or GitLab CI, and it stops most common attacks.
- **Sigstore:** free **keyless** artifact signing using short-lived certificates tied to your identity. There's no long-lived signing key for an attacker to steal, which directly answers the SolarWinds problem. Its parts are cosign (signing), Fulcio (the certificate authority), and Rekor (a transparency log).
- **Pinning:** lock exact dependency versions with lockfiles (`package-lock.json`, `go.sum`), and pin GitHub Actions to a commit SHA rather than a tag. Tags are mutable, which makes them a frequent attack vector.

There's a regulatory clock ticking, too. The EU's **Cyber Resilience Act** entered force in December 2024. By **11 September 2026**, you must report actively exploited vulnerabilities within 24 hours, and by December 2027 full secure-by-design, SBOM, and vulnerability-handling obligations apply to products sold in the EU. The practical takeaway: have SBOMs and a vulnerability-management process in place before September 2026.

## Common misconceptions

- **"DevSecOps is a tool we can buy."** It's a way of working. Tools without tuning, ownership, and culture just generate noise.
- **"Failing the build on every finding makes us safer."** It does the opposite. Developers disable scanners that cry wolf on low-severity issues.
- **"We removed the secret from the commit, so we're fine."** A leaked secret is compromised forever. You have to rotate it.
- **"A signed build is a trusted build."** Not if the build server was compromised, as SolarWinds proved.
- **"Security champions should approve releases."** Make them approvers and you've rebuilt the bottleneck you were trying to remove. They're advisors.
- **"Direct dependencies are what matter."** Indirect (transitive) dependencies and mutable tags are where many attacks live.

## How to use this: a day-one checklist

If you do nothing else, do these, roughly in order:

1. Turn on **Dependabot or another SCA** tool, plus GitHub secret scanning and push protection.
2. Add **gitleaks** as both a pre-commit hook *and* a CI job.
3. Run **SAST on pull requests**, blocking only on Critical and High.
4. Generate a **CycloneDX SBOM** automatically in CI.
5. **Pin** GitHub Actions to commit SHAs and commit your lockfiles.
6. **Threat-model** every new feature with the four questions.
7. Set **MTTR (Mean Time To Remediate) targets by severity** and verify fixes before closing tickets. Common 2025 targets: Critical under 7 days, High under 30, Medium under 90, Low under 180.
8. Appoint a **security champion** (advisor, not approver) and build a paved-road pipeline template.
9. Target **SLSA Level 2** and adopt **Sigstore** for artifact signing.

A note on culture, because this is where teams quietly fail. The goal is **guardrails, not gatekeepers.** A gate is a manual approval that blocks and breeds workarounds. A guardrail is automated and embedded, steering people toward safe paths without slowing them down. The most effective move is the **paved road**: a secure-by-default supported way to build and ship, with templates, a golden pipeline, and pre-hardened base images. Netflix reports that more than 90% of its engineers stay on the paved road, not because it's mandated, but because it's the *easiest* path. Make the secure way the easy way and most of the battle is over.

One last metric warning: when you measure MTTR and escape rates, never use the numbers to punish developers. Offensive teams find that 10–20% of "remediated" findings are still exploitable after the first patch, so verifying fixes matters. But the moment metrics become a weapon, people start hiding findings, and hidden findings are the most expensive kind.

## Conclusion

If you remember one sentence, make it this: **security is a property of how you build, not a checkpoint at the end.** Threat-model in design, scan in code and CI with layered tools, block only on what's truly critical, rotate leaked secrets, harden your supply chain, and make the secure path the easy path.

The supply-chain story is where this gets genuinely interesting, because it bends back on a question most of us never ask: not "is my code secure?" but "do I even know what's running inside my software, and who I'm trusting to write it?" The next time you run `npm install` and watch a few hundred packages stream in, that's the real frontier worth getting curious about.
