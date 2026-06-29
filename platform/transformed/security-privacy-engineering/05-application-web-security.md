---
title: "Web Security 101: Why Your App Trusts the Wrong Data"
metaTitle: "Web App Security: The OWASP Top 10 Made Simple"
description: "Most breaches start with code that trusts hostile input. Learn web application security, the OWASP Top 10, and how to stop injection, XSS, and IDOR."
keywords:
  - web application security
  - OWASP Top 10 2025
  - secure coding
  - SQL injection prevention
  - XSS prevention
  - broken access control
  - IDOR vulnerability
  - CSRF protection
  - SSRF attack
  - input validation
  - security headers
  - parameterized queries
  - least privilege
  - content security policy
faq:
  - q: What is the most common web application security vulnerability?
    a: "Broken Access Control is ranked #1 in the OWASP Top 10. It happens when an app confirms who you are but never checks whether you are allowed to touch a specific record, which leads to bugs like IDOR."
  - q: How do I prevent SQL injection?
    a: Use parameterized queries (prepared statements) so the database treats your input as data, never as part of the query structure. Avoid string concatenation and raw SQL builders that let input change the query's meaning.
  - q: What is the difference between authentication and authorization?
    a: Authentication proves who you are, like logging in. Authorization checks whether you are allowed to do a specific action. Most access-control bugs come from authenticating correctly but skipping the per-request authorization check.
  - q: Does using an ORM protect me from SQL injection?
    a: Mostly, because ORMs parameterize queries by default. But the protection disappears the moment you hand-build raw SQL with string concatenation, even inside an ORM. Raw queries reopen the hole.
  - q: What are security headers and do they matter?
    a: Security headers are HTTP response headers like Content-Security-Policy and Strict-Transport-Security that add cheap, high-leverage defense. They reduce the damage from XSS, clickjacking, and protocol downgrade attacks.
  - q: What was the Capital One breach and how did it happen?
    a: In 2019 an SSRF flaw tricked a misconfigured firewall into requesting the AWS metadata endpoint, which returned temporary credentials. Combined with an over-privileged role, the attacker accessed data on 106 million customers.
author: Pritesh Yadav (priteshyadav444)
transformed: true
polished: true
topic: security-privacy-engineering
topicTitle: Security & Privacy Engineering
category: Engineering
date: '2026-06-21'
order: 4
icon: "\U0001F512"
sources: []
---

Picture a restaurant kitchen with an open window onto a busy public street. Anyone walking by can slip a note through the window, and the cooks act on whatever the note says. Most notes read "one burger, please." But one note says "set the stove on fire" — and if the kitchen trusts every note's good intentions, it burns down.

That open window is your web application. The notes are user input. And here is the uncomfortable truth: almost no breaches happen because someone cracked your encryption with a supercomputer. They happen because ordinary application code trusted data it should never have trusted.

## Why this matters

The cost is not theoretical. IBM's *Cost of a Data Breach 2025* report puts the global average breach at **$4.44 million**, and the average organization still took around **241 days** to even find and contain it. Web-application attacks remain one of the top breach channels year after year.

But the deeper reason this matters is that **you, the person writing the code, are the last line of defense.** Firewalls and security teams help, but the bugs that leak millions of records live inside everyday application logic — a missing ownership check, a string glued into a query, a user's HTML rendered without sanitizing it.

The good news: the same handful of mistakes cause most breaches. Learn to recognize them and you eliminate the majority of your risk. The mindset shift that makes it all click is simple to state and hard to live by: **treat all external input as hostile until you have proven it safe.**

And "external" is broader than you think. It includes request parameters, HTTP headers, cookies, uploaded files, responses from third-party APIs — even database rows that another customer wrote.

## The OWASP Top 10: your industry checklist

Before diving into specific bugs, you need a map. The **OWASP Top 10** is it.

OWASP (the Open Worldwide Application Security Project, a non-profit) maintains a community-built list of the most critical web-app security risks. It is assembled from real-world breach data, not opinion. The **2025 edition** is the current authoritative list, built by analyzing roughly 175,000 catalogued vulnerabilities across about 2.8 million applications.

Here is the current ranking, in plain terms:

| # | Risk | What it means |
|---|------|---------------|
| A01 | **Broken Access Control** | Still #1. You can reach data you shouldn't. Now also absorbs SSRF. |
| A02 | **Security Misconfiguration** | Default passwords, debug mode on, open buckets. Jumped from #5. |
| A03 | **Software Supply Chain Failures** | Bugs you inherit from your dependencies. |
| A04 | **Cryptographic Failures** | Weak or missing encryption of sensitive data. |
| A05 | **Injection** | Input treated as code: SQL injection, command injection, XSS. |
| A06 | **Insecure Design** | The flaw is in the plan, not the code. |
| A07 | **Authentication Failures** | Weak logins, sessions, and password handling. |
| A08 | **Software or Data Integrity Failures** | Trusting unsigned updates or serialized data. |
| A09 | **Security Logging & Alerting Failures** | You can't see the attack happening. |
| A10 | **Mishandling of Exceptional Conditions** | **New.** Bad error handling, fail-open logic, leaked stack traces. |

Two headline changes in 2025: SSRF was folded into Broken Access Control, and two new themes joined the list — supply-chain integrity and exception handling. When you need exact wording, trust `owasp.org` over secondary blogs.

The rest of this article walks through the bugs you'll actually meet.

## Broken Access Control and IDOR: the #1 risk

This is the most common serious vulnerability on the web, and it comes from confusing two words that sound similar.

- **Authentication** proves *who* you are. (You logged in.)
- **Authorization** checks whether you are allowed to touch *this specific record*.

The bug is authenticating you correctly, then forgetting to authorize. The classic form is **IDOR** (Insecure Direct Object Reference). The URL reads `/orders/1043`. You change it to `/orders/1044`. You see someone else's order — because the server fetched the row by ID and never checked who owned it.

**The fix is one line of discipline:** scope every data fetch to the current user on the server.

```sql
SELECT * FROM orders WHERE id = ? AND owner_id = current_user
```

Using unguessable IDs like UUIDs makes it harder for an attacker to guess the next record, but a UUID is *defense in depth* — never a substitute for the ownership check. The same rule applies to multi-tenant apps: never trust a `tenant_id` sent in a query parameter. Derive the tenant from the session or host, server-side.

### The mistake almost everyone makes

Hiding the "Admin" button in the UI and assuming the endpoint behind it is now safe.

Attackers do not use your buttons. They call the endpoint directly — a technique called **forced browsing**. If the only thing stopping a normal user from deleting all accounts is that the button isn't visible, you have no security at all.

Watch also for **mass assignment**, where a user adds `is_admin=true` to a form submission and your model blindly saves it. Deny by default, and authorize *every* request on the server.

## Injection: when input becomes code

**Injection** happens when attacker input gets interpreted as *code* instead of *data*. The classic example is **SQL injection**, and it's worth seeing the bug and the fix side by side.

```js
// VULNERABLE — input becomes part of the SQL command
query("SELECT * FROM users WHERE email = '" + email + "'");
// attacker types:  ' OR '1'='1' --   ->  returns every row / login bypass

// FIXED — parameterized query: the ? is always data, never code
query("SELECT * FROM users WHERE email = ?", [email]);
```

**Parameterization** is the real fix. The database compiles the query *structure* first, then binds your input purely as a value. Input can never change the query's meaning, no matter what the attacker types.

Modern frameworks parameterize by default through their query builders and ORMs (Laravel Eloquent, Django ORM). But there's a trap: the moment you reach for **raw queries** (`DB::raw`, `.raw()`) and concatenate a string into them, the hole reopens. An ORM does not protect you if you hand-build raw SQL.

SQL injection is a 25-year-old bug class, and yet it still bites. In January 2025, a PostgreSQL string-quoting flaw was chained through a remote-support tool to breach the U.S. Treasury. A study that same year found roughly 68% of small businesses still don't properly use parameterized queries.

### Command injection: the shell's cousin

The same bug appears when code builds an operating-system command from input:

```js
exec("ping " + host);   // attacker sets host = "8.8.8.8; rm -rf /"
```

The fix order, from CISA's secure-by-design guidance:

1. **Don't shell out at all** — use a native library API instead.
2. If you must, use an API that passes arguments as an **array**, not one big shell string: `execFile("ping", ["-c", "4", host])`.
3. **Allow-list** validate the input with a strict pattern, like `^[a-z0-9]{3,10}$`.

Do not try to "escape" dangerous shell characters. Both PortSwigger and CISA are blunt about this: escaping is bypassable. Decide what is *permitted* and reject everything else.

## XSS: running your JavaScript in someone else's browser

**Cross-Site Scripting (XSS)** injects JavaScript that runs in another user's browser, where it can steal their session, log their keystrokes, or read everything on the page. There are three flavors:

- **Stored (the worst):** the payload is saved in your database — say, a product review containing a `<script>` tag — and then served to every visitor.
- **Reflected:** the payload rides in a URL or parameter and bounces straight back in the response. Delivered through a malicious link.
- **DOM-based:** purely client-side. Your JavaScript writes untrusted data into the page with `innerHTML`, and the server never even sees the payload.

The fix is **context-aware output encoding**: encode data for the exact place it lands. An HTML body, an HTML attribute, a JavaScript string, a URL, and a CSS value each need *different* encoding. One encoder does not fit all.

Vue and React auto-escape text in their templates, which handles most cases for free. The danger is opting out with `v-html` or `dangerouslySetInnerHTML`. If you genuinely must render user-supplied HTML, sanitize it with **DOMPurify** first. For DOM-based XSS, prefer `textContent` over `innerHTML`. And a modern browser layer called **Trusted Types** can make unsafe DOM operations throw an error unless the data passed through a vetted policy.

## CSRF: riding your logged-in session

**Cross-Site Request Forgery (CSRF)** tricks your already-logged-in browser into firing a state-changing request — change your email, transfer money — to a site where you're authenticated. Your cookies ride along automatically, so the request looks legitimate.

Defend in layers:

- **The SameSite cookie attribute.** The modern browser default, `Lax`, blocks your cookies from being sent on cross-site POST requests while still allowing normal top-level navigation. `Strict` is tighter but logs users out when they arrive from an inbound link.
- **An anti-CSRF token.** A cryptographically random, unpredictable value tied to the session, sent in a hidden field or header and verified server-side. Frameworks ship it: Laravel's `@csrf`, Django's `csrf_token`.

SameSite alone is defense in depth, not a complete fix — mutating requests and sibling-domain trust still need tokens. And a simple rule prevents a whole category of trouble: make every state change a POST, PUT, or DELETE. Never a GET.

## SSRF: making the server fetch the wrong URL

**Server-Side Request Forgery (SSRF)** happens when your app fetches a URL the user supplies — think image-from-URL, webhooks, or a PDF renderer — and the attacker points it at internal infrastructure that the *server* can reach but they cannot.

```
Attacker --> "fetch http://169.254.169.254/..." --> YOUR SERVER
                                                       |
                       (server can reach internal IPs) v
                         cloud metadata endpoint -> temporary credentials
```

The textbook case is **Capital One, 2019**. A misconfigured firewall was tricked into requesting the AWS metadata endpoint at `169.254.169.254`, which handed back temporary cloud credentials. The attacker used them to read storage buckets and steal data on **106 million customers**.

Notice there were *two* root causes: the SSRF flaw *and* an over-privileged role. With least privilege, the blast radius would have been tiny — which is exactly why the principle matters.

To defend against SSRF: allow-list the destinations your app is permitted to fetch; block private and link-local IP ranges (`169.254.x`, `10.x`, `127.x`, and the metadata IP); don't blindly follow redirects; and on AWS, require token-based metadata (IMDSv2).

## Misconfiguration, supply chain, and secrets

Three risks round out the picture, and all three are about trusting things you shouldn't.

**Security Misconfiguration** (now #2) means default passwords, debug mode left on in production, verbose stack traces, open storage buckets, and missing security headers. It climbed the list because continuous deployment now ships faster than continuous scanning can keep up.

**Software Supply Chain Failures** mean you inherit every bug in your dependencies. The icon here is **Log4Shell** (2021): a feature in the popular Log4j logging library let attackers run arbitrary code simply by getting a malicious string logged. Around 7,000 packages depended on it, so the vulnerability stayed exploitable deep in the dependency tree long after a patch existed. Defend with dependency scanners (Dependabot, Snyk, `npm audit`), pinned and verified dependencies, and fast patching.

**Hardcoded secrets** are the quiet epidemic. API keys, database passwords, and tokens committed into source code leak through Git history, public repos, and client bundles. GitGuardian's 2026 report counted **28.65 million new hardcoded secrets** pushed to public GitHub in a single year — and AI-assisted commits leaked them at roughly double the human rate.

The critical detail most people get wrong: **deleting the commit does nothing.** A leaked key is compromised forever. You must *rotate* it — revoke the old one and issue a new one. Keep secrets in environment variables or a secrets manager, and run pre-commit scanners like gitleaks.

## Common misconceptions

A few beliefs feel safe but quietly leave you exposed.

- **"My ORM protects me from injection."** Only until you write raw SQL with string concatenation. The protection is in parameterization, not in the ORM's logo.
- **"I hid the admin button, so the feature is protected."** UI is not security. Attackers call endpoints directly. Authorization must live on the server.
- **"I escaped the dangerous characters."** Escaping shell and SQL input is bypassable. Allow-list what's permitted instead.
- **"I deleted the leaked secret from Git, so I'm fine."** A leaked secret is compromised the instant it's pushed. Rotate it; don't just delete it.
- **"SameSite cookies fully stop CSRF."** They're a strong layer, not a complete fix. Pair them with anti-CSRF tokens for state changes.
- **"A strict Content-Security-Policy on day one makes me secure."** It's the fastest way to break your own site. Roll it out in report-only mode first.

## How to use this

Here's a practical checklist you can apply to almost any feature you build.

1. **Validate input with allow-lists at every boundary.** Define what's permitted — type, length, format, range — and reject everything else. Deny-lists are always bypassable.
2. **Parameterize every query, to every interpreter.** SQL, OS shell, LDAP, XPath. Never concatenate user input into a command.
3. **Encode output for its exact context.** HTML, attribute, JavaScript, and URL each need their own encoding. Sanitize with DOMPurify if you must render user HTML.
4. **Scope every data fetch to the current user or tenant, server-side.** Deny by default. Add the `WHERE owner_id = ?` check, every time.
5. **Layer your CSRF defenses.** SameSite cookies plus anti-CSRF tokens, and make every state change a non-GET request.
6. **Grant least privilege everywhere.** Minimal rights for every database user, cloud role, and service account, so a single breach stays contained.
7. **Keep secrets out of code.** Use environment variables or a secrets manager, scan your dependencies, and rotate any key the moment it's exposed.
8. **Add security headers as cheap defense in depth.** Start with these:
   - **Content-Security-Policy** — allow-lists where scripts may load from; the strongest XSS backstop. Deploy in report-only mode first.
   - **Strict-Transport-Security** — forces HTTPS and blocks downgrade attacks.
   - **X-Content-Type-Options: nosniff** — stops the browser from executing an uploaded "image" as a script.
   - Round out with `frame-ancestors` (anti-clickjacking), `Referrer-Policy`, and `Permissions-Policy`. Grade your set with a tool like Mozilla Observatory.

If you remember nothing else, remember the chain that ties every fix together: **validate input → parameterize for interpreters → encode output for context → enforce least privilege → fail closed → add security headers.**

## Conclusion

Strip away the jargon and nearly every web breach tells the same story: code trusted input it shouldn't have. The fixes aren't exotic. They're a handful of habits applied relentlessly, on every request, with no exceptions for "internal" data or "trusted" users.

The single takeaway: **treat all external input as hostile until you've proven it safe, and authorize every action on the server.** Do that consistently and you've already closed the doors that let in most of the breaches in the news.

Here's the thread worth pulling next. Notice how often "an over-privileged role" turned a small bug into a catastrophe — Capital One being the clearest example. Application security stops the attacker from getting in; **least privilege and good identity design decide how far they can go once they do.** That second half of the story is where the most expensive breaches are really won or lost.
