---
title: "Cryptography for Engineers: Pick the Right Tool"
metaTitle: "Cryptography Made Simple for Engineers"
description: "Learn cryptography the practical way: encoding vs hashing vs encryption, AES, TLS, password hashing, and key management explained simply for working engineers."
keywords:
  - cryptography for developers
  - encoding vs hashing vs encryption
  - how to hash passwords
  - AES encryption explained
  - what is TLS handshake
  - symmetric vs asymmetric encryption
  - Argon2id password hashing
  - public key cryptography explained
  - digital signatures explained
  - key management best practices
  - post-quantum cryptography
  - forward secrecy
  - what is a salt and pepper
  - Diffie-Hellman key exchange
faq:
  - q: "What is the difference between encoding, hashing, and encryption?"
    a: "Encoding (like Base64) reformats data with no secret and is fully reversible by anyone. Hashing is a one-way fingerprint you cannot reverse. Encryption scrambles data reversibly, but only with a secret key. They are not interchangeable."
  - q: "Should passwords be encrypted or hashed?"
    a: "Always hashed, never encrypted. Encryption is reversible, so a stolen key exposes every password. Use a slow, purpose-built hash like Argon2id with a unique salt per password."
  - q: "Why is Base64 not encryption?"
    a: "Base64 has no secret key. Anyone can decode it in a single line of code. It is a transport format, not a security measure, so it hides nothing."
  - q: "What is the best algorithm for hashing passwords in 2026?"
    a: "Argon2id is the first choice because it is memory-hard and resists GPU cracking. scrypt is a solid fallback, and bcrypt is acceptable for legacy systems. Never use plain MD5, SHA-1, or SHA-256 for passwords."
  - q: "What does TLS actually do when I visit an HTTPS site?"
    a: "TLS verifies the server's identity with a certificate, agrees on a shared secret key using ECDHE key exchange, then encrypts all traffic with fast symmetric crypto like AES-GCM. TLS 1.3 does this in a single round trip."
  - q: "Is quantum computing a real threat to encryption today?"
    a: "Yes, indirectly. Attackers are recording encrypted data now to decrypt later once quantum computers mature, a tactic called Harvest Now, Decrypt Later. Long-lived secrets are already at risk, so start planning for post-quantum algorithms."
author: Pritesh Yadav (priteshyadav444)
transformed: true
polished: true
topic: security-privacy-engineering
topicTitle: Security & Privacy Engineering
category: Engineering
date: '2026-06-21'
order: 2
icon: "\U0001F512"
sources: []
---

In 2013, Adobe lost the passwords of roughly 38 million users. The algorithm they used wasn't broken. The math was fine. They simply reached for the wrong tool: they *encrypted* passwords that should have been *hashed*. Once attackers spotted the pattern, millions of passwords fell.

That is the secret most people miss about cryptography. As a working engineer, you almost never write the math. Your real job is choosing the right tool for the right goal, then not misusing it. Get that part right and you've avoided the cause of most real-world breaches.

## Why this matters

Cryptography is not an academic luxury. It is the quiet machinery behind every login, payment, and private message you build. And it fails in painfully ordinary ways.

The OWASP Top 10 still lists "Cryptographic Failures" among the leading causes of breaches. The average data breach in 2025 cost about $4.44 million. Almost none of those failures came from someone cracking a strong algorithm. They came from a developer using the wrong primitive, storing a key next to the data it protected, or trusting Base64 to "hide" a secret.

The good news: you don't need a math degree. You need a mental model. Every piece of cryptography exists to serve one of three goals.

## The three goals (start here, always)

Whenever you face a crypto decision, ask one question first: **which goal do I actually need?**

- **Confidentiality** - only the intended reader can see the content. Tool: **encryption**.
- **Integrity** - the content was not changed, not even by one bit. Tool: **hashing**.
- **Authenticity** - it really came from who it claims to be from. Tool: **digital signatures**.

That's the whole map. Everything below is just detail hanging off these three hooks. Most breaches happen because someone picked the wrong hook, not because the algorithm was weak.

## Encoding vs hashing vs encryption: the number one confusion

These three words get mixed up constantly, and the confusion has caused real breaches. They are completely different things.

**Encoding** is reversible reformatting with **no secret involved**. Base64, URL-encoding, and ASCII are all encoding. Their purpose is transport and formatting, never security. Anyone can decode them.

> Think of encoding as translating English into Morse code. There's no secret. Anyone with the chart reads it instantly.

**Hashing** is a **one-way fingerprint**. The same input always produces the same fixed-length output, and you cannot reverse it back to the original. SHA-256, for example, turns any input into 256 bits (64 hex characters). Change a single character of the input and most of the output bits flip. That's the **avalanche effect**.

> Think of hashing as blending fruit into a smoothie. You cannot un-blend it back into the original fruit.

**Encryption** is a **reversible scramble that needs a key**. Without the key, the output (called **ciphertext**) is useless gibberish. With the key, you recover the exact original.

> Think of encryption as a locked box. The right key opens it; nobody else can.

**The trap to avoid:** treating Base64 as "encryption." Base64 hides nothing. Dropping a Base64 string into a token or config file gives you zero security, because anyone decodes it in one line.

And back to Adobe: they encrypted passwords with reversible 3DES instead of hashing them, and reused one key in the broken ECB mode for everyone. Identical passwords produced identical ciphertext, so once the pattern leaked, millions were recoverable. **Passwords must be hashed (one-way), never encrypted (reversible).**

## Symmetric encryption (AES): one shared key

**Symmetric encryption** uses **one secret key** for both locking and unlocking. It's fast, which is why it protects bulk data: files, disks, the body of a web request. The standard is **AES (Advanced Encryption Standard)**, and **AES-256** is the everyday workhorse.

But *how* you run AES matters enormously. This is called the **mode of operation**, and one choice can quietly ruin everything.

Never use **ECB (Electronic Codebook)** mode. It encrypts each block independently, so identical plaintext blocks produce identical ciphertext, leaking the data's patterns. The famous "ECB Penguin" demo encrypts an image with ECB and you can *still clearly see the penguin*. That's how much leaks.

Instead, use **authenticated modes** like `AES-256-GCM` or `ChaCha20-Poly1305`. These give you confidentiality *and* integrity at once: they not only hide the data, they detect if anyone tampered with it.

**One more landmine:** never reuse a **nonce** (a "number used once" that makes each encryption unique). Reusing a nonce with GCM is catastrophic. It can leak the key stream and even the authentication key. Generate a fresh random nonce every single time.

Symmetric crypto has one big limitation, though. Two strangers on an open network need to agree on the same secret key without an eavesdropper learning it. How? That's where public-key crypto comes in.

## Asymmetric crypto and key exchange: the open padlock

**Asymmetric encryption** uses a **key pair**: a **public key** you can share with anyone, and a **private key** you keep secret. Anyone can encrypt a message to you using your public key, but only your private key can decrypt it.

> Picture your public key as an open padlock you mail out to people. They snap it shut on a box and send it back. Only you hold the key that opens it. They never needed your key to lock it.

Two algorithms dominate. **RSA** relies on the difficulty of factoring huge numbers and needs big keys (2048 or 4096 bits): secure but slow. **ECC (Elliptic Curve Cryptography)** gives the same strength with far smaller keys (a 256-bit ECC key roughly equals a 3072-bit RSA key), so it's faster and now dominates TLS.

Here's the practical twist: asymmetric crypto is slow, so we rarely use it to encrypt actual data. Instead, we use it only to **set up a shared symmetric key**, then let fast AES do the heavy lifting. This combination is called **hybrid encryption**, and it's how essentially every secure connection works.

### Agreeing on a secret in public

**Diffie-Hellman key exchange** lets two parties derive the *same* shared secret over a public channel *without ever sending it*.

> Imagine mixing paint. Both sides start with the same public color. Each privately adds a secret color, then they swap mixtures. Each adds their private color again. Both end with an identical final blend, but an eavesdropper who saw the swapped mixtures cannot un-mix them to find the secret.

Modern TLS uses **ECDHE** (Elliptic-Curve Diffie-Hellman *Ephemeral*). "Ephemeral" means a fresh throwaway key for every session. This gives you **forward secrecy**: even if the server's long-term private key is stolen later, past recorded sessions stay safe, because each used its own random, discarded key. ECDHE is the default in TLS 1.3.

A quick way to keep encryption and signatures straight: with **encryption**, the sender locks with your *public* key and you unlock with your *private* key (goal: confidentiality). With a **signature**, the signer locks with their *own private* key and anyone verifies with the *public* key (goal: authenticity). Signatures are encryption run backwards.

## Hashing for integrity vs hashing for passwords

This distinction trips up even experienced engineers, so slow down here.

General-purpose hashing uses **SHA-256**, and it's perfect for verifying file downloads, powering digital signatures, and deduplication. The key trait: **SHA-256 is fast by design.** That speed is great for integrity checks.

But that same speed is a disaster for passwords. An attacker with a GPU can try *billions* of SHA-256 guesses per second. For passwords, you actually *want* slowness.

So for passwords, use a purpose-built **password KDF (Key Derivation Function)**: an intentionally slow, memory-hungry hash.

| Algorithm | Use it? | Notes |
|---|---|---|
| **Argon2id** | First choice | Memory-hard, resists GPU and ASIC attacks. The current NIST/OWASP/RFC 9106 recommendation. |
| **scrypt** | Good fallback | Also memory-hard. |
| **bcrypt** | OK for legacy | Work factor 12+. Warning: silently truncates passwords past 72 bytes. |
| **PBKDF2** | Only if forced | Use only for strict FIPS compliance, with very high iteration counts. |
| MD5 / SHA-1 / plain SHA-256 | NEVER for passwords | Too fast; MD5 and SHA-1 are also cryptographically broken. |

Two more ingredients make password storage solid:

- A **salt** is a unique random value per password, stored next to the hash. It defeats **rainbow tables** (precomputed hash lookup tables) and ensures two users with the same password get different hashes. It's non-negotiable, and modern KDFs add it automatically.
- A **pepper** is a single secret value shared across all passwords, stored *separately* from the database (in a key vault or app config). Even if the entire database leaks, the hashes can't be cracked without the pepper.

The 2012 LinkedIn breach is the cautionary tale. They used unsalted SHA-1. Millions of hashes leaked and were cracked en masse with rainbow tables. A salted Argon2id store would have made that mass cracking infeasible.

## Digital signatures: proving who sent it

A **digital signature** proves a message truly came from a sender and wasn't altered. Note that it does *not* hide the content; that's not its job.

Here's how it works. The signer **hashes** the message, then **encrypts that hash with their private key**. That encrypted hash is the signature. Anyone can use the signer's **public key** to decrypt the signature and compare it to a fresh hash of the message. If they match, the message is authentic and unaltered.

A bonus property is **non-repudiation**: the signer can't later deny they signed it. Signatures power TLS certificates, code signing, and software updates.

> Think of a wax seal pressed with a unique signet ring. Anyone can see the seal and recognize the ring (public), but only the ring's owner could have made it (private), and a broken seal proves tampering.

## TLS and HTTPS: where it all comes together

**TLS (Transport Layer Security)** is the protocol behind the padlock in `https://`. It combines everything above into one smooth handshake. Simplified, TLS 1.3 looks like this:

1. Your browser says hello and offers its cipher options plus a Diffie-Hellman share.
2. The server replies with its chosen cipher, its own DH share, and its **certificate**.
3. Both sides independently compute the same shared key via ECDHE.
4. The browser verifies the certificate chains back to a trusted authority.
5. From there, all traffic is encrypted with fast symmetric crypto (AES or ChaCha20).

**TLS 1.3** finishes this in a single round trip, much faster than the old TLS 1.2, and it removed all the legacy broken options (no RSA key transport, no ECB, no SHA-1). As of early 2026, it carries roughly 95% of encrypted web traffic.

A **certificate** binds a public key to a domain name, vouched for by a **Certificate Authority (CA)**. Your browser ships with a **trust store** of root CAs, and the **chain of trust** runs from root CA to intermediate CA to your site's certificate.

> A certificate is like an ID card. You trust someone's ID because a government you already trust vouched for it. Your browser trusts a site because a root CA in its trust store signed the chain.

**Let's Encrypt** made certificates free and automated through the **ACME protocol**, and it now backs a huge share of the web. One practical heads-up: certificate lifetimes are shrinking toward roughly 47 days by 2029. That makes **automated renewal mandatory**. Never plan to renew certificates by hand.

## Guarding the keys (the actually hard part)

Here's a truth that surprises newcomers: the hardest part of cryptography is not the algorithm. It's **protecting the keys**. A perfect cipher with a leaked key is worthless.

The golden rules:

- Never hardcode keys in source code or commit them to Git.
- Never store keys next to the data they protect.
- Rotate keys periodically.
- Restrict who and what can access them.

Two tools do the heavy lifting. An **HSM (Hardware Security Module)** is a tamper-resistant physical device that generates and stores keys so they *never leave the hardware in plaintext*. A **KMS (Key Management Service)** like AWS KMS, Azure Key Vault, or GCP KMS is a managed cloud version that handles keys through an API and can rotate them automatically.

The pattern that ties them together is **envelope encryption**: a *data key* encrypts your data, a *master key* inside the KMS encrypts that data key, and you store the encrypted data key beside the data. Only the KMS can unwrap it, so a database leak alone exposes nothing usable.

> An HSM is like a bank vault that lets you *use* the valuables inside but never lets the keys leave the building.

## The three states of data

A useful checklist: data lives in three states, and each needs its own protection.

| State | Meaning | How to protect it |
|---|---|---|
| **At rest** | Stored on disk, in a database, or in backups | AES-256 with KMS-managed keys |
| **In transit** | Moving across a network | TLS 1.3 |
| **In use** | Being processed in memory or CPU | Confidential computing (TEEs) |

That last row used to be the gap. To compute on data, you usually had to decrypt it in memory. **Confidential computing** closes that gap with hardware **Trusted Execution Environments (TEEs)** (Intel SGX/TDX, AMD SEV-SNP, AWS Nitro Enclaves) that encrypt memory and isolate the computation, so even the cloud provider can't read your data while it's being processed. A hot use case right now is confidential AI on GPUs.

## A word on quantum: closer than you think

A large **quantum computer** running Shor's algorithm would break RSA and ECC, today's public-key crypto. Symmetric AES-256 and SHA-256 stay largely safe with big enough sizes. In August 2024, NIST finalized the first post-quantum standards, including **ML-KEM** for key exchange and **ML-DSA** for signatures.

Don't file this under "a 2030 problem." Attackers are already recording encrypted traffic *today* to decrypt once quantum is ready, a tactic called **Harvest Now, Decrypt Later**. Long-lived secrets are at risk right now, which is why browsers like Chrome already ship hybrid post-quantum key exchange in TLS.

## Common misconceptions

- **"Base64 is a kind of encryption."** No. It has no secret and hides nothing.
- **"I'll just encrypt the passwords."** Encryption is reversible. A stolen key exposes everything. Hash them instead.
- **"A fast hash like SHA-256 is fine for passwords."** Its speed is exactly the problem. Use a slow KDF like Argon2id.
- **"Quantum is a far-future concern."** Harvest-now-decrypt-later means the recording is happening today.
- **"I can write my own cipher."** Anyone can design a cipher *they* can't break. That's not the same as one *no one* can break. Use vetted libraries.

## How to use this

A practical checklist you can apply on your next project:

1. **Name the goal first.** Confidentiality, integrity, or authenticity? Pick the matching tool before writing any code.
2. **Encrypt with authenticated modes.** Use AES-256-GCM or ChaCha20-Poly1305, and a fresh random nonce every time.
3. **Hash passwords with Argon2id.** Lean on the KDF's built-in per-password salt, and add a pepper stored in a KMS.
4. **Use TLS 1.3 everywhere.** Automate certificate renewal through Let's Encrypt and ACME, ahead of shrinking lifetimes.
5. **Keep keys in a KMS or HSM.** Never beside the data. Rotate them, and use envelope encryption.
6. **Protect all three data states**, and consider TEEs for sensitive in-use workloads.
7. **Start a post-quantum inventory** for long-lived secrets, and adopt hybrid key exchange where it's available.
8. **Never roll your own crypto.** Reach for libsodium or your platform's vetted crypto API.

## Conclusion

If you remember one thing, remember this: cryptography is "pick the right tool for the goal, then guard the keys." Encode for transport, hash for integrity and passwords, encrypt for confidentiality, and sign for authenticity. Almost every famous breach was a tool-selection mistake, not a broken algorithm.

The deeper you go, the more you notice that the algorithms are the easy part. The keys, the certificates, and the human decisions around them are where security actually lives or dies. So here's the thread worth pulling next: if a leaked key can undo perfect math, how do real teams detect that a key has been compromised, and how fast can they rotate it before the damage spreads? That question is where cryptography quietly becomes incident response.
