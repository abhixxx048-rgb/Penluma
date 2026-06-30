---
title: "Authentication vs Authorization: The Difference That Stops Breaches"
metaTitle: "Authentication vs Authorization Explained"
description: >-
  Authentication proves who you are; authorization decides what you can do.
  Learn the difference, why passkeys beat passwords, and how to stop access bugs.
keywords:
  - authentication vs authorization
  - what is authentication
  - what is authorization
  - multi-factor authentication
  - passkeys
  - FIDO2 WebAuthn
  - OAuth vs OpenID Connect
  - broken access control
  - JWT security
  - password hashing
  - zero trust
  - least privilege
  - IDOR
  - RBAC ABAC ReBAC
  - phishing-resistant MFA
faq:
  - q: What is the difference between authentication and authorization?
    a: >-
      Authentication proves who you are (like showing a passport). Authorization
      decides what you are allowed to do once you are known (like whether your
      boarding pass gets you into the lounge). You always authenticate first,
      then authorize each action.
  - q: Are two passwords considered multi-factor authentication?
    a: >-
      No. Both passwords are "something you know," so they belong to the same
      category. Real MFA combines different categories, such as a password
      (know) plus a phone tap or hardware key (have).
  - q: Are passkeys safer than passwords?
    a: >-
      Yes. Passkeys use public-key cryptography bound to a website's domain, so
      there is no shared secret to phish or steal and fake sites cannot trigger
      them. Google reports passkey sign-ins succeed about four times more often
      than passwords.
  - q: Why should I not store JWTs in localStorage?
    a: >-
      Any malicious JavaScript injected through a cross-site scripting (XSS) flaw
      can read localStorage and steal the token. An HttpOnly cookie cannot be
      read by JavaScript, which removes that theft path.
  - q: What is the most common access control mistake?
    a: >-
      Broken access control, especially IDOR, where an app fetches an object by
      a user-supplied ID without checking ownership. Changing an order number in
      a URL and seeing someone else's data is the classic example.
  - q: Should I force users to change their passwords every 90 days?
    a: >-
      No. Current NIST guidance says forced periodic rotation just produces weak
      patterns like Password1, Password2. Only require a change when there is
      evidence the password was compromised.
topic: security-privacy-engineering
topicTitle: Security & Privacy Engineering
category: Engineering
date: '2026-06-21'
order: 3
icon: "\U0001F512"
author: Brexis Wazik
transformed: true
polished: true
linked: true
sources: []
---

Two questions stand between an attacker and your data, and almost every breach is a failure to ask one of them properly. The first: **who are you?** The second: **what are you allowed to do?**

Mix those two up and you get the most expensive class of bugs in software. Someone proves they are a real user, and then the app simply forgets to check whether that user is allowed to read the file they just requested. That is not a rare edge case. It is the single most common security flaw on the web.

Get comfortable with both, and you can reason about almost any login bug. We will go from proving identity, through modern passwordless login, into how systems decide what each person is allowed to touch.

## Why this matters

If you build, run, or secure any system with a login screen, these two ideas are the foundation everything else sits on.

Get them wrong and the consequences are concrete. Credentials get stolen and replayed. An admin account with no second factor opens the whole company. A user edits a number in a URL and reads another customer's invoice.

The good news is that the fixes are well understood. You do not need to invent anything. You need to understand the difference between **authentication** and **authorization**, then apply a short list of modern defaults. By the end of this article you will know what those defaults are and why they work.

## The two questions, kept separate

**Authentication** (often shortened to **AuthN**) is the act of proving an identity is genuinely who it claims to be.

**Authorization** (**AuthZ**) is the act of granting or denying a specific action to someone whose identity is already proven.

Here is the analogy that makes it stick. **Authentication is showing your passport at the airport** - proving you are who you say. **Authorization is whether your boarding pass lets you into the first-class lounge.** The passport tells the guard *who* you are. The boarding pass tells them *what* you may do.

The order never changes. You authenticate once, then you authorize every single action. When authentication fails, a system returns **401 Unauthorized**. When authorization fails - you are known but not allowed - it returns **403 Forbidden**.

Keep that picture in mind. Most of the rest of this article is just doing each step well.

## How you prove who you are: the three factors

Proof of identity comes from **factors**, and there are three classic kinds:

- **Something you KNOW** - a password, a PIN, a security question. A secret in your head.
- **Something you HAVE** - your phone, a hardware key like a YubiKey, or an authenticator app that generates rotating six-digit codes (called **TOTP**, time-based one-time passwords).
- **Something you ARE** - biometrics: your fingerprint, face, or iris.

**Multi-factor authentication (MFA)** means requiring proof from two or more *different* categories. That difference is the whole point.

A password plus a phone tap is real MFA, because an attacker who phishes your password still does not have your phone. **Two passwords are not MFA** - they are both "something you know," so one successful phishing attack gets both. This is a genuinely common mistake, and it quietly defeats the entire purpose.

## Why passwords are the weak link

A password is a shared secret the server has to store, and humans handle them badly. People reuse one password across dozens of sites, so a single breach lets attackers replay those stolen logins everywhere - an attack called **credential stuffing**. People pick guessable passwords. People type them into fake login pages.

The numbers back this up. IBM's *Cost of a Data Breach 2025* report found phishing has overtaken stolen credentials as the number one way attackers first get in. And breaches that used stolen or compromised credentials took the longest to clean up - nearly **ten months** on average to detect and contain.

So passwords are not going away tomorrow, which means you need to handle them correctly. Two things matter: the rules you set, and how you store them.

### Modern password rules (and the old advice to drop)

For years, security advice did real harm. The latest NIST guidance reverses much of it:

- **Stop forcing periodic rotation.** No 60- or 90-day expiry. Forced changes just produce `Password1` then `Password2`. Require a change only when you have evidence the password leaked.
- **Drop composition rules.** Mandatory "one uppercase, one symbol" pushes people toward predictable patterns. Length matters far more.
- **Allow long passphrases** - support at least 64 characters, and allow spaces and any character a user wants.
- **Screen new passwords against breach lists** like Have I Been Pwned, so nobody can choose a password already known to attackers.
- **Allow paste**, because it helps password managers, which are the single best habit a user can have.

### Storing passwords so a breach is survivable

If your database is stolen, the way you stored passwords decides whether it is a disaster or a shrug.

Never store passwords in plain text. Never use a plain fast hash like MD5 or SHA-256 - modern graphics cards crack billions of those per second. And never *encrypt* passwords, because encryption is reversible by design.

Instead, use a slow, **memory-hard password hashing function** with a unique random **salt** for each password. (A salt is random data mixed into each password before hashing, stored alongside it, which defeats precomputed lookup tables.) OWASP currently recommends **Argon2id**. Acceptable alternatives are **bcrypt** or **PBKDF2**. Always use a trusted library - this is never something to hand-roll.

## MFA is strong, but not bulletproof

Adding a second factor stops the overwhelming majority of account takeovers. But not all factors are equal, and attackers have adapted. From weakest to strongest:

**SMS codes** are the weakest. In **SIM swapping**, an attacker convinces your carrier to move your phone number to their SIM, and your text-message codes arrive on their phone instead.

**Authenticator apps and push approvals** are better, but still beatable. Two attacks stand out:

- **MFA fatigue** (also called push bombing) - the attacker, who already has your password, spams approval prompts to your phone until a tired or distracted user finally taps "approve."
- **Adversary-in-the-Middle** - a fake login page sits between you and the real site, relaying your password *and* your one-time code to the real site in real time. Off-the-shelf phishing kits make this easy.

A real-world example: the group known as *Scattered Spider* chained SIM swaps, push fatigue, and help-desk social engineering to break into major companies. The lesson is not that MFA is pointless. It is that *legacy* MFA reduces risk without eliminating it - which is exactly why the industry is moving to something an attacker in the middle cannot capture.

## Passkeys: login that cannot be phished

The clearest direction the whole industry is heading is **passwordless login built on [public-key cryptography](/blog/security-privacy-engineering/03-cryptography-made-simple)**. The technology is called **FIDO2**, built from a browser standard (**WebAuthn**) and a device protocol (**CTAP**). You will mostly hear it called by its friendly name: **passkeys**.

Here is how it works in plain terms. When you register, your device creates a pair of cryptographic keys. The **private key never leaves your device** - it is sealed in secure hardware. The server only ever stores the matching **public key**, which is useless to a thief on its own. To log in, your device signs a one-time challenge from the server, unlocked by your fingerprint, face, or PIN.

**Why this cannot be phished:** the passkey is cryptographically tied to the real site's domain. A fake site at a look-alike address simply cannot trigger it. And because the server never holds a shared secret, there is nothing to steal in a breach, nothing to phish, and nothing to reuse.

This is not theoretical. By 2025, over a billion people had activated a passkey, and roughly half of the top 100 websites supported them. Google reports passkey sign-ins succeed about **four times more often** than passwords - partly because there is nothing to forget. Passkeys are where authentication is going. If you build login systems, this is the thing to adopt.

## Remembering who you are: sessions and tokens

Once you are authenticated, the server needs to remember you across requests. There are two broad approaches.

A **stateful session** keeps the real data on the server. Your browser holds only an opaque ID, and the server looks you up on each request. Revoking access is easy - delete the session and you are out.

A **stateless token** (typically a **JWT**, JSON Web Token) carries the information inside itself, signed by the server. The server just checks the signature, with no lookup. This scales beautifully across many services, but revocation is hard: a leaked token stays valid until it expires.

A common, sensible hybrid is a short-lived **access token** (5 to 15 minutes) plus a longer-lived **refresh token** that swaps itself out on each use.

Whichever you choose, **cookie flags are the seatbelts**:

- **HttpOnly** stops JavaScript from reading the cookie, which blunts theft through [cross-site scripting (XSS)](/blog/security-privacy-engineering/05-application-web-security).
- **Secure** sends it only over encrypted HTTPS connections.
- **SameSite** controls whether the cookie is sent on cross-site requests, and is your main defense against **CSRF** (cross-site request forgery, where another site tricks your browser into making a request as you).

### A quick word on JWTs

JWTs are powerful and easy to get wrong. A few essentials:

- **A JWT is not encrypted.** The payload is just encoded text that anyone can read. Never put secrets in it.
- **Reject unsigned tokens.** The spec allows an "algorithm: none" token; a careless library will accept a forged one. Pin your server to a specific algorithm and reject the rest.
- **Always set a short expiry** and validate it. "Stateless means no revocation needed" is a myth - a leaked token is valid until it expires, so keep lifetimes short.
- **Prefer HttpOnly cookies over localStorage** for storing them, because localStorage is readable by any injected script.

## Letting other apps in: OAuth and OpenID Connect

Two protocols get confused constantly, and the confusion causes real security holes.

**OAuth 2.0 is about authorization, not login.** It lets one app get *delegated access* to your stuff without handing over your password - for example, "let this app read your Google Drive files." It grants access through **scopes** that define exactly what the app may touch.

**OpenID Connect (OIDC)** is a thin identity layer built on top of OAuth. It adds an **ID Token** that tells the app *who* just logged in. This is what powers "Sign in with Google" and "Sign in with Apple."

The mnemonic that keeps them straight: **OAuth is a valet key (access); OIDC is an ID card (who you are).** Using bare OAuth as a login system is a classic, dangerous mistake - it can grant access without ever truly verifying who the user is.

Closely related is **single sign-on (SSO)**, logging in once to reach many apps. In big companies this often runs on the older **SAML** standard; new and consumer-facing apps generally use OIDC.

## Deciding what each user can do: authorization models

Authentication is only half the job. Once you know who someone is, you have to decide what they can touch. There are a few common ways to model this:

- **RBAC (role-based):** access depends on a user's role - admin, editor, viewer. Simple and everywhere, but roles tend to multiply, and it struggles with rules like "only *your own* records."
- **ABAC (attribute-based):** decisions use attributes of the user, the resource, and the situation - "a manager in Finance, during work hours." Flexible, but harder to audit.
- **ReBAC (relationship-based):** access follows relationships - "you can view this document if you can view the folder it lives in." Powerful for the way modern apps actually share things.
- **PBAC (policy-based):** rules live in a central policy engine outside your app code, which makes them reusable and auditable.

A landmark example is Google's **Zanzibar** system, which models authorization as simple relationship tuples and answers millions of permission checks per second across Google's products. It inspired a wave of open tools. The broader lesson: instead of scattering `if` checks throughout your code, modern systems increasingly move authorization into one dedicated, auditable place.

## Least privilege and zero trust

Two principles tie the authorization story together.

The **[principle of least privilege](/blog/security-privacy-engineering/02-core-security-foundations)** means giving each person and service the minimum access they need, for the shortest time they need it. If an account is compromised, this shrinks the "blast radius." It pairs naturally with regular access reviews - forgotten, orphaned accounts are a top way attackers get in.

**[Zero trust](/blog/security-privacy-engineering/06-network-cloud-infrastructure-security)** means "never trust, always verify." It throws out the old idea that being "inside the network" makes you trustworthy. Every request gets authenticated, authorized, and encrypted on its own merits, no matter where it comes from. The old castle-and-moat model - hard shell, soft inside - does not survive a single stolen laptop. Zero trust assumes the attacker is already inside and checks everything anyway.

## Common misconceptions

- **"Authentication and authorization are basically the same thing."** They are two separate steps. Proving identity is not the same as checking permission, and forgetting the second is the most common breach there is.
- **"Two passwords give me MFA."** Both are "something you know." Real MFA crosses categories.
- **"Forcing password changes every 90 days improves security."** It mostly produces predictable patterns. Modern guidance says only change on evidence of compromise.
- **"A JWT is encrypted, so it's safe to put data in it."** It is only encoded. Anyone can read the payload.
- **"Stateless tokens don't need revocation."** A leaked token works until it expires. Keep lifetimes short.
- **"Unguessable IDs keep records private."** Hoping nobody guesses the link is not access control. Check ownership on every lookup.

## The number one mistake: broken access control

If you remember one threat from this entire article, make it this one. **Broken access control sits at the top of the OWASP Top 10** - almost every application tested has some form of it.

The classic case is called **IDOR** (insecure direct object reference): an app fetches an object by an ID the user controls, *without checking who owns it*. Change `GET /api/orders/12345` to `12346` in the URL and you read someone else's order. The root cause is always the same - an authorization check that was done on the client, forgotten on one endpoint, or replaced with the hope that nobody would notice.

A real example shows how authentication failures compound this. In 2024, around 165 organizations were breached on a single cloud platform because attackers reused stolen credentials to log into accounts that had **no MFA enforced**. A pure authentication-hygiene failure, at scale. The platform's response was to make MFA mandatory.

## How to use this

Here is the modern playbook, as concrete steps:

1. **Check authorization on every request, server-side, deny-by-default.** Never trust the client to enforce permissions.
2. **Verify ownership on every object lookup.** Before returning order 12346, confirm it belongs to the person asking. This single habit closes the most common hole on the web.
3. **Hash passwords with Argon2id** (or bcrypt / PBKDF2) using a trusted library, and screen new passwords against breach lists.
4. **Roll out passkeys / FIDO2** for phishing-resistant login, and require MFA on every privileged or admin account without exception.
5. **Use short-lived access tokens** with rotating refresh tokens, stored in HttpOnly, Secure, SameSite cookies.
6. **Validate every JWT** - signature, algorithm, and expiry - and reject unsigned tokens.
7. **Centralize authorization** in one auditable place instead of scattering ad-hoc checks through your code.
8. **Apply least privilege** with just-in-time access and routine cleanup of unused accounts.

## Conclusion

The whole subject collapses into one sentence: **prove who you are, then check what you may do - and never let the second step be optional.** Most real breaches are a gap in one of those two steps: stolen credentials with no second factor, or a missing ownership check.

The modern answer is clear. Phishing-resistant passkeys for proving identity, properly hashed passwords as a fallback, short-lived validated tokens to hold sessions, and centralized, deny-by-default authorization checked on every single request.

There is one frontier this opens up that is worth your attention next. As more authorization logic moves out of application code and into dedicated policy engines, a new question appears: how do you *test* and *prove* that those policies are correct before an attacker tests them for you? That is where the future of access control gets genuinely interesting.
