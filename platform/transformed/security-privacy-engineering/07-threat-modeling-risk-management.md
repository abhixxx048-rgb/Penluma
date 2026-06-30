---
title: "Threat Modeling: Find the Cracks Before They Break"
metaTitle: "Threat Modeling & Risk Management Guide"
description: >-
  Threat modeling lets you catch security flaws at design time, when fixing them
  is nearly free. Learn the Four Questions, STRIDE, and how to score real risk.
topic: security-privacy-engineering
topicTitle: Security & Privacy Engineering
category: Engineering
date: '2026-06-21'
order: 6
icon: "\U0001F512"
keywords:
  - threat modeling
  - STRIDE
  - risk management
  - data flow diagram
  - trust boundary
  - CVSS
  - risk register
  - LINDDUN privacy threats
  - attack trees
  - shift left security
  - likelihood times impact
  - residual risk
faq:
  - q: What is threat modeling in simple terms?
    a: It is the practice of thinking ahead, in a structured way, about what could
      go wrong with a system before you build it. You sketch how data moves, ask what
      an attacker could do, and decide how to respond.
  - q: What are the four questions of threat modeling?
    a: What are we working on? What can go wrong? What are we going to do about it?
      And did we do a good job? Everything else, including STRIDE and attack trees,
      is just a tool for answering question two.
  - q: What does STRIDE stand for?
    a: Spoofing, Tampering, Repudiation, Information disclosure, Denial of service,
      and Elevation of privilege. Each letter names a category of threat that violates
      one core security property.
  - q: Is CVSS the same as risk?
    a: No. CVSS measures how severe a vulnerability is in the abstract, not how risky
      it is for you. A 9.8 score with no known exploit and no exposure in your setup
      may be low real risk. Pair it with exploit data and your own context.
  - q: When should I do threat modeling?
    a: Early, during design, when changing the diagram costs nothing. Then re-run it
      whenever the system changes meaningfully, such as a new feature, a new integration,
      or more sensitive data.
  - q: What is a risk register?
    a: A living log with one row per risk, recording its description, owner, likelihood,
      impact, chosen treatment, and review date. It proves risks were considered, not
      ignored.
author: Brexis Wazik
transformed: true
polished: true
linked: true
sources: []
---

A crack in a building costs almost nothing to fix on the architect's drawing. The same crack costs a fortune once the concrete has set and the floors are stacked on top.

Software works the same way. A flaw you spot in a design sketch is a five-minute conversation. The same flaw, found after launch, is an incident, a 2 a.m. page, and sometimes a breach notification to millions of people.

Threat modeling is how you find the crack on paper. It is the deliberate habit of asking "what could go wrong here?" before anything has gone wrong at all.

## Why this matters

You have probably already done the tactical work: validating input, hashing passwords, scoping database queries so one customer can't read another's data. That is essential, but it is one fix at a time, reacting to problems as you notice them.

Threat modeling is the step up. Instead of patching holes you stumble into, you map the whole system and hunt for the holes on purpose, in advance.

This is what people mean by **"shift left"**: move security thinking earlier in the build, toward the design stage. IBM's *Cost of a Data Breach Report 2025* keeps making the same point year after year. The faster a problem is caught and contained, the less it costs. And the earliest possible catch, at design time, is the cheapest fix you will ever make.

Here is the single most important mindset shift: **threat modeling is a verb, not a document.** It is an activity you repeat, not a PDF you file once and forget.

## The Four Questions: the whole discipline in four lines

Acronyms come and go. The durable skill is a habit captured by security researcher Adam Shostack as the **Four Questions**, later codified in the *Threat Modeling Manifesto*. If you remember nothing else from this article, remember these:

1. **What are we working on?** Draw the system: its parts, how data flows, and where trust changes.
2. **What can go wrong?** List the threats. STRIDE, attack trees, and the rest are just tools that help you answer this one question.
3. **What are we going to do about it?** For each threat, choose to fix it, accept it, hand it off, or remove the risky thing entirely.
4. **Did we do a good job?** Check that the model is complete and the fixes actually work. Then feed what you learned back in.

The beauty is that the framework is **method-agnostic**. Every fancy named technique simply plugs into question two. The Manifesto's spirit is worth absorbing too: it values "people and collaboration over processes and tools," and treats security as "a journey of understanding," not a one-time snapshot.

So when should you run the loop? **Early**, during design, when redrawing the diagram costs nothing. Then **again** whenever something meaningful changes: a new feature, a new third-party integration, a jump in how sensitive the data is, or a new trust boundary. It is a loop, not a one-off.

## Question 1: draw the map

You can't defend a system you can't see. The classic tool for "what are we working on" is a **Data Flow Diagram**, a simple picture of how data moves around. It has just four kinds of pieces:

- **External entities** (drawn as squares): things outside your control, like a user or a third-party API.
- **Processes** (circles): your code and services that do something with data.
- **Data stores** (parallel lines): where data rests, like databases, caches, or storage buckets.
- **Data flows** (arrows): data moving between all of the above.

The piece that turns a doodle into a security tool is the **trust boundary**: a dotted line drawn wherever the level of trust changes. The internet meeting your server. Your app talking to its database. And, crucially for any system serving multiple customers, the line between **tenant A and tenant B**.

Here is the rule of thumb that earns its keep: **most threats live where data crosses a trust boundary.**

Picture a multi-tenant online store. There is a boundary between the customer's browser and your server, and another boundary between one tenant's data and another's. That second dotted line is exactly where the nasty bugs hide, the kind where someone changes an ID in a URL and suddenly reads a different company's orders. (That specific bug has a name, **IDOR**, short for Insecure Direct Object Reference, and we will meet it again in a moment.)

Your diagram does not need to be beautiful. A whiteboard sketch counts. Free tools like **OWASP Threat Dragon** and the **Microsoft Threat Modeling Tool** can even suggest threats for each piece automatically. The goal is good-enough-and-current, which always beats perfect-but-stale.

## Question 2: STRIDE, the workhorse method

Once you have a map, you walk every piece of it and ask "what can go wrong here?" The most popular tool for developers is **STRIDE**, created at Microsoft. Each letter is a category of threat, and each one breaks a specific security promise.

### S is for Spoofing: pretending to be someone else

This breaks **authentication**, your system's ability to know who's really there. Think of an attacker stealing a session cookie to impersonate a logged-in user. In the 2024 Snowflake breaches, attackers simply logged in with stolen credentials to accounts that had no multi-factor authentication, hitting major companies and hundreds of millions of records. The fix: [strong authentication](/blog/security-privacy-engineering/04-authentication-authorization), MFA, and signed tokens.

### T is for Tampering: changing data you shouldn't

This breaks **integrity**. Examples include [SQL injection](/blog/security-privacy-engineering/05-application-web-security) or quietly editing a price in a request before it reaches the server. The 2023 MOVEit incident was a tampering flaw, a single injection bug exploited across thousands of organizations. The fix: validate input, use parameterized queries, and protect data in transit.

### R is for Repudiation: "I never did that"

This breaks **non-repudiation**, your ability to prove who did what. A user denies placing an order, or an attacker deletes the logs that would have caught them. The fix is almost always the same: **tamper-evident audit logs.** This is the direct line from threat modeling to the discipline of [audit logging](/blog/security-privacy-engineering/08-security-testing-auditing). Whenever you write down an R threat, the answer is usually a trustworthy log.

### I is for Information disclosure: leaking what should stay private

This breaks **confidentiality**. Verbose error pages that dump stack traces, that IDOR bug from earlier, a misconfigured storage bucket open to the world, or unencrypted personal data. The fix: [encryption](/blog/security-privacy-engineering/03-cryptography-made-simple), access control, least privilege, and boring generic error messages.

### D is for Denial of service: knocking the system over

This breaks **availability**. A flood of traffic, or one cleverly expensive query that ties up the whole database. The fix: rate limiting, quotas, throttling, and autoscaling.

### E is for Elevation of privilege: gaining powers you shouldn't have

This breaks **authorization**. The classic move is editing a token to set your role to admin. In the 2024 Change Healthcare breach, attackers got in through a portal with no MFA, then escalated their access, leading to a record-setting healthcare breach affecting nearly 193 million records. The fix: check authorization on the server for every single request, grant least privilege, and deny by default.

A quick shortcut for where to look: external entities mostly face **S** and **R**; your processes can face all six; data stores and data flows mostly face **T, I, and D**.

## Other tools for question 2

STRIDE is the default, but a few other methods are worth knowing by name.

**Attack trees** flip the view to the attacker's side. You write the attacker's goal at the top, then branch downward into the different ways to reach it, all the way to concrete steps. Branches are either "any one of these works" or "you need all of these." Label the bottom steps with cost or difficulty, add them up, and the cheapest path to the goal is exactly where you should reinforce. Security writer Bruce Schneier's classic example is a goal of "open the safe," with branches like pick the lock, learn the combination, or just cut it open.

**PASTA** is the heavyweight, business-focused option: seven stages that tie technical threats all the way back to business impact, so executives can prioritize. It is thorough and slow. Save it for genuinely high-stakes systems.

**LINDDUN** is the **privacy** counterpart to STRIDE. Where STRIDE asks how an attacker could break in, LINDDUN asks how a system could harm people's privacy. Two of its ideas are especially useful: **linking**, where you correlate two records back to the same person without ever naming them, and **identifying**, where you unmask who they are. There is even a lightweight card-deck version called "LINDDUN GO" to make a session feel like a game.

## Common misconceptions

A few beliefs quietly sabotage good threat modeling. Here is the myth, and here is the reality.

- **"It's a document we write once."** Reality: it is a recurring activity. A model from before three major features shipped describes a system that no longer exists.
- **"A high CVSS score means high risk."** Reality: CVSS measures a vulnerability's *severity* in the abstract, not your actual *risk*. More on this below.
- **"STRIDE covers everything."** Reality: STRIDE will never warn you that two anonymous records can be linked back to one real person. That is a [privacy threat](/blog/security-privacy-engineering/10-privacy-engineering-fundamentals), the kind LINDDUN catches, and under [laws like GDPR](/blog/security-privacy-engineering/11-privacy-laws-compliance) it can become a legal problem.
- **"We bought insurance, so the risk is gone."** Reality: you can transfer cost, but you can't outsource trust. If customer data leaks, the reputational damage stays with you.
- **"Accepting a risk means ignoring it."** Reality: a real acceptance is a documented, signed-off decision by a named owner. Silently tolerating a risk is not acceptance, it is negligence.

## Deciding what to fix: risk is likelihood times impact

You cannot fix everything, so you prioritize. The most important formula in this whole field is simple:

**Risk = Likelihood x Impact.** How probable is the threat, multiplied by how much damage it would do.

There are two ways to apply it.

**Qualitative** risk uses ratings like Low, Medium, and High, often plotted on a colored grid of likelihood against impact. It is fast, a bit subjective, and great for ranking threats and talking to non-technical stakeholders.

**Quantitative** risk uses real money. The classic formula is **Annual Loss Expectancy = Single Loss Expectancy x Annual Rate of Occurrence**. In plain terms: how much one incident costs, times how many you expect per year. It is rigorous and lets you justify spending ("a 50,000 dollar control prevents 400,000 dollars of expected loss per year"), but it needs data you often don't have.

The practical norm is to use qualitative ratings to triage everything quickly, then run the money math on only the top few risks. To make "impact" feel real, anchor it: IBM's 2025 report puts the global average breach at about **4.44 million dollars**, with the United States far higher.

## Writing it down: the risk register

The durable artifact of all this is the **risk register**. It is a living log with one row per risk, capturing the description, the owner, the likelihood, the impact, the chosen response, the status, and a review date.

Its quiet superpower is that it proves risks were *considered*, not ignored. For each risk, you pick one of four responses:

1. **Mitigate.** Add controls to lower the likelihood or the impact. This is the default. Just remember it leaves *residual risk* behind, so check that what remains is acceptable.
2. **Avoid.** Don't do the risky thing. Drop the feature. Sometimes this really is the safest answer.
3. **Transfer.** Push the cost elsewhere, through insurance or contracts. Useful, but the reputational damage and leftover risk still stay with you.
4. **Accept.** Knowingly tolerate it, because it is below your tolerance or because fixing it costs more than it's worth. This must be a documented, signed-off decision by a named owner. Never silent.

Two terms tie this together: **inherent risk** is the danger before any controls, and **residual risk** is what remains after them. You keep treating a risk down until the residual fits your **risk appetite**, the level of danger your organization is willing to live with.

## A note on scoring: DREAD and CVSS

You may run into two scoring systems, and it helps to know how to treat each.

**DREAD** is an older method that rates five factors and averages them. Microsoft created it, then abandoned it, and for good reason. It is hopelessly subjective, two people score the same threat wildly differently, and one of its factors actually rewards security-through-obscurity by implying a hard-to-find bug is safer. Treat DREAD as a teaching example for "rate likelihood and impact," not something to ship with.

**CVSS** (the Common Vulnerability Scoring System) is the industry standard for rating how severe a *known* vulnerability is, on a scale from 0 to 10. It is genuinely useful, but here is the trap worth repeating: **CVSS measures severity, not your risk.** A vulnerability scored 9.8 might have no public exploit and might not even be exposed in your particular setup, making its real risk low. Pair the score with exploit intelligence, such as the CISA list of known-exploited vulnerabilities and EPSS (which estimates the chance of exploitation soon), plus your own environment. Never patch purely by the number.

## How to use this

Here is a concrete starting routine you can run on your next feature.

1. **Block 30 minutes at design time.** Threat modeling on a whiteboard before code exists is the highest-leverage half hour in security.
2. **Draw the data flow diagram first.** Squares for outsiders, circles for your code, parallel lines for storage, arrows for data.
3. **Draw the trust boundaries next.** Dotted lines wherever trust changes, especially between customers. Then aim your attention where data crosses them.
4. **Walk every piece with STRIDE.** For each part of the diagram, ask whether spoofing, tampering, repudiation, information disclosure, denial of service, or elevation of privilege could happen there.
5. **Add a privacy pass with LINDDUN** whenever personal data is involved. Ask specifically whether records could be linked or people identified.
6. **Score and triage.** Rate each threat by likelihood and impact on a simple grid. Run the money math only on the worst few.
7. **Record every decision in a risk register**, and make every "accept" a documented choice with a named owner and a review date.
8. **Right-size the effort.** Lightweight STRIDE for most features. The heavyweight PASTA only for high-stakes systems. Don't bring a seven-stage process to a small feature.
9. **Re-run the whole loop** whenever the system or its data sensitivity changes.

## Conclusion

If you take one thing away, take the loop itself: **decompose the system, list what can go wrong, prioritize by likelihood times impact, decide what to do, write it down, and review it again later.**

Methods will keep churning around you. DREAD fell out of favor, CVSS keeps getting new versions, and AI-specific frameworks are arriving fast, with regulations like the EU AI Act now baking risk-based thinking straight into law. But the underlying discipline is permanent. Master the loop and you can secure any system, in any era, no matter which acronym is fashionable that year.

And notice where this naturally points next. Every threat model produces artifacts, the diagram, the threat list, the risk register, and every "accept" decision needs an owner and a paper trail. That is no longer just good hygiene. It is exactly what an auditor walks in and asks to see, which is a very different muscle worth building on its own.
