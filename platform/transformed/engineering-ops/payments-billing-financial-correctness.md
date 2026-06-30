---
title: "When Your App Says 'Refund Processed' But No Money Moved"
metaTitle: "Payment Correctness: Avoid Silent Money Bugs"
description: "Learn how payment systems silently lose money through PCI violations, broken refunds, and currency bugs, and the practical checks that keep your billing honest."
topic: engineering-ops
topicTitle: Engineering & Ops
category: Business & Growth
date: '2026-06-15'
order: 999
icon: "\U0001F6E0️"
author: Brexis Wazik
transformed: true
linked: true
keywords:
  - payment system correctness
  - PCI DSS compliance
  - storing credit card data
  - refund processing bugs
  - payment webhook idempotency
  - currency rounding errors
  - sales tax nexus software
  - silent payment failures
  - SAQ-A vs SAQ-D
  - chargeback handling
  - financial software bugs
  - tokenization payments
faq:
  - q: Is it ever okay to store a customer's CVV number?
    a: No. Storing the CVV (the 3 or 4 digit security code) after a transaction is authorized is forbidden by PCI DSS rules, no matter how well you encrypt it. It must never touch your database, logs, or cache.
  - q: Why does my payment system show "refund processed" when no money was returned?
    a: Usually because the refund form collects fields the backend silently ignores, so it never calls the payment provider. The UI reports success on any non-error response, even though no money actually moved.
  - q: What is the difference between SAQ-A and SAQ-D compliance?
    a: SAQ-A is the lightest PCI path, available only if card data never touches your servers (you redirect to Stripe or Razorpay). The moment your code can see a raw card number you fall into SAQ-D, which has 300+ requirements.
  - q: Why does multiplying a payment amount by 100 cause bugs?
    a: Most currencies have two decimal places, but some have zero (Japanese yen) or three (Kuwaiti dinar). Hardcoding times-100 overcharges yen customers 100x and undercharges dinar customers 10x.
  - q: Should I trust the payment provider's instant response or wait for the webhook?
    a: Wait for the webhook. Refunds and disputes resolve asynchronously and can fail or reverse days later. The webhook is the source of truth; the instant response is just an acknowledgment.
  - q: Can I use one flat tax rate for an online store?
    a: Only if you sell in a single jurisdiction. Tax is destination-based, so a single flat rate systematically over- or under-charges across US states, EU VAT, and India GST, and can create compliance liability.
sources: []
---

A staff member clicks "Refund," sees a green "Refund processed" message, and moves on. The customer never gets their money. Nobody notices for weeks.

That is not a hypothetical. It is one of the most common and most damaging bugs in payment software, and the reason is almost always the same: the system **reported a success it never actually performed**. Money code fails quietly. A wrong currency, a dropped form field, a stored card number that should never have existed, these don't crash anything. They just sit there, costing you money and trust, until an auditor or an angry customer finds them.

This article walks through the handful of places where payment systems lie to you, why they matter, and what "correct" actually looks like.

## Why this matters

When ordinary code breaks, you get an error, a stack trace, a red alert. When money code breaks, you often get a green checkmark.

That asymmetry is the whole problem. A payment bug can:

- **Lose real money** every day without anyone realizing (a refund that never fires, a fee silently added, a charge in the wrong currency).
- **Create legal and compliance liability** that surfaces only during an audit, a breach, or a tax filing, long after it's expensive to fix.
- **Destroy trust** instantly. People forgive a slow checkout. They do not forgive being overcharged or having their card data leaked.

The good news: there are only a few categories where this goes wrong, and each has a clear, well-understood "right answer." You don't need to be a payments expert to spot them. You need to know where to look.

## Insight 1: Never let card data touch your servers

There is a [security standard](/blog/security-privacy-engineering/02-core-security-foundations) called **PCI DSS** (Payment Card Industry Data Security Standard). Think of it as the rulebook every business that handles card payments has to follow. The single most important idea in it is brutally simple:

**The safest card data is the card data you never touch.**

If your customer types their card number directly into a form served by Stripe or Razorpay (a redirect to their page, or an embedded box that comes straight from them), then the raw number never reaches your servers. You get back a harmless **token**, a stand-in like `tok_1a2b3c` that you can charge later but that's useless to a thief. This lightweight path is called **SAQ-A**, and it's the cheapest, simplest way to be compliant.

The moment your own code can see a real card number, even for a split second on its way to the payment provider, you fall off that cliff into **SAQ-D**: 300+ requirements, annual deep audits, and a much bigger blast radius [if you're ever breached](/blog/security-privacy-engineering/06-network-cloud-infrastructure-security).

### The lines you must never cross

Two storage rules are absolute, and encryption does not save you:

1. **Never store the CVV.** That's the 3 or 4 digit code on the card. After a payment is authorized, it must vanish, no database, no log file, no cache, ever. There is no business reason that justifies keeping it. This is the rule people break most often, usually by accident, and it's the one that fails an audit on sight.
2. **Never store the full card number.** You're allowed to keep a **token**, the **last four digits**, the **brand** (Visa, Mastercard), and the **expiry**. That's enough to show "Visa ending 4242" and to charge the saved card again. The full number buys you nothing and costs you everything.

A real-world version of how this goes wrong: a developer adds a "save card" feature, writes the full card number into a column literally named `card_last_four`, stores the CVV as a plain integer, and then builds an admin screen with an eye-icon toggle to reveal it. Every one of those decisions feels reasonable in isolation. Together they turn the entire company into a breach waiting to happen, and a guaranteed audit failure.

A quieter version of the same mistake: **storing your payment provider's secret keys in plaintext** in a config table. If someone reads a database backup, they now have live keys to charge cards and read every transaction. [Encrypt secrets at rest](/blog/security-privacy-engineering/03-cryptography-made-simple).

## Insight 2: The webhook is the source of truth, not the instant reply

When you charge a card, the payment provider sends back an immediate response. It is tempting to treat that as "done." It isn't.

Refunds, disputes, and even some captures finish **asynchronously**. A card refund can succeed today and *fail and re-credit you up to 30 days later*. A dispute debits your account now and may reverse if you win weeks from now. The instant response is a receipt that says "I heard you," not "the money has moved."

The real answer arrives later, as a **webhook**: a message the provider sends to your server when the final state is known. Building this correctly means three things:

- **Verify the signature.** Every webhook is signed. Check that signature against the raw message body before you trust a single byte. If the secret is missing, fail closed, reject it, don't wave it through.
- **Handle duplicates (idempotency).** Providers resend webhooks. If you process the same refund event twice, you double-count it. The fix is a unique constraint on the event ID so the second copy is recognized and ignored. **Idempotency** just means ["doing it twice has the same effect as doing it once."](/blog/system-design/11-distributed-transactions-and-idempotency)
- **Survive [out-of-order delivery](/blog/system-design/12-messaging-and-event-driven).** A stale "failed" message can arrive *after* a "captured" message. Without a guard, it can drag a paid order back to unpaid. Derive status from the cumulative amounts (how much was captured, how much refunded), never from "the last event that happened to arrive."

And when a webhook permanently fails? Providers retry only a finite number of times, then give up. If you have no **dead-letter sweep**, a scheduled job that catches events stuck unprocessed, that payment is silently never reconciled. It just falls through the floor.

There's also a subtle multi-tenant trap here. Webhooks often arrive *before* your app knows which customer or store they belong to. If you look up the matching record without scoping it correctly, you can resolve the **wrong tenant's** configuration, charge against the wrong account, or mutate the wrong order. After you verify the signature, figure out who the event belongs to, scope to them, and *then* act.

## Insight 3: Refunds and chargebacks are where systems lie the loudest

This is the category that produces the green-checkmark-no-money bug from the opening.

### The silent refund

The classic failure: a refund modal collects an amount, a reason, and a "notify customer" toggle. The form sends them to the backend. The backend's update logic has a list of fields it accepts, and none of the refund fields are on it. So they're **silently dropped**. No payment provider is called. No record is written. Nothing happens. But the response code is 200, so the UI cheerfully says "Refund processed."

The customer is out their money. Your staff believe it was returned. The mismatch surfaces only when the customer complains, and now you have a furious person *and* a trust problem.

The fix is a discipline, not a clever trick: **prove the round trip.** Every money action should have a test that submits the request, reads the data back, and asserts the money actually moved. If a field can be silently dropped, it eventually will be.

### Partial refunds that lie about being full

Refund $10 on a $100 order and your system should say "partially refunded." A common bug flips the whole order to fully `REFUNDED` even though only a tenth came back. The accounting is now wrong, and so is every report built on it. Always derive refund status from cumulative amounts: partial until the refunded total equals the captured total.

### Chargebacks that nobody hears

A **chargeback** (also called a dispute) is when a customer's bank yanks the money back and asks you to justify the charge. It is the most financially urgent event in the whole system, and it comes with a deadline, often just 7 to 21 days. Miss it and you automatically lose.

A surprising number of systems handle a chargeback by flipping a single status flag and doing nothing else. No alert to the store owner. No countdown to the response deadline. No pause on the order, so the disputed item keeps shipping. No accounting entry for the money that just left your account, plus the non-refundable dispute fee. The single most time-sensitive financial event in the business arrives, and *nobody finds out*.

Real chargeback handling notifies a human immediately, surfaces the respond-by deadline, freezes fulfillment on the disputed order, records the debit and fee, and logs the whole thing for the audit trail.

## Insight 4: Currency and rounding bugs hide in plain sight

Two small assumptions cause most money-math bugs.

**Assumption one: "everything has two decimal places."** Most currencies do, so you convert to the smallest unit (cents) by multiplying by 100. But **Japanese yen** has zero decimals, you pass the amount as-is. **Kuwaiti dinar** has three, you multiply by 1000. Hardcode times-100 and you overcharge a yen customer by 100x and undercharge a dinar customer by 10x. The amount looks plausible on screen, which is exactly why it survives.

**Assumption two: "charge in our default currency."** A dangerous pattern reads the charge currency from the *gateway's configuration* instead of from the *order itself*. If your store totals an order in euros but the gateway config says USD, you charge the euro number labeled as dollars. There's no validation, no comparison, and often **no currency column on the payment record at all**, so the mistake is invisible after the fact. You literally cannot detect it from your own data.

The rules are simple:

1. Charge in the **order's** currency, and check the gateway actually supports it before you try.
2. Convert to minor units using **that currency's** decimal count, not a hardcoded 100.
3. **Store the currency** on every payment record, including what the provider says it actually captured, so you can reconcile.
4. Round to the currency's real number of decimals, not always two.

For the math itself, prefer integer minor units or decimal arithmetic over floating point. Float math drifts by a cent on large multi-item orders, and a cent that doesn't reconcile is a cent someone has to chase.

## Insight 5: Sales tax is destination-based, and one flat rate won't cut it

Tax is the area people most underestimate. The instinct is a single setting: "tax rate: 8%." That works only if you sell in exactly one place.

The reality:

- **Tax is destination-based.** You compute it from where the customer is, not where you are. There is no single national US sales tax rate; it varies by state, county, and city.
- **Nexus thresholds decide whether you owe anything.** In the US, you generally start owing a state's tax once your sales there cross a threshold (commonly $100k). Cross it and you must register and collect; below it you may not.
- **Different regions, different rules.** The EU uses destination VAT with an OSS scheme; the UK has zero threshold for overseas sellers (you register from your very first sale); India splits tax by place of supply; Canada and Australia each have their own thresholds.
- **Display rules differ too.** EU, UK, and Australian consumers must see **tax-inclusive** prices by law. US and Canadian customers expect **tax-exclusive**. A single global display setting is non-compliant somewhere.

There's also a trap unique to software that lets each line item be taxable or not. If the admin screen correctly honors a "this product is tax-exempt" flag but the storefront checkout ignores it and taxes everything, then the *same product* gets taxed differently depending on how the order was entered. Customers notice when the website charges them tax the back office wouldn't have.

The pragmatic answer: don't hand-code jurisdiction tables that rot the moment a law changes (and they change constantly). Put tax behind a single service in your code, and let a maintained **tax engine** like Stripe Tax, Avalara, or TaxJar handle the rates and nexus tracking. Snapshot the computed tax onto the invoice so history never silently rewrites itself.

## Common misconceptions

- **"If we encrypt the card data, we can store it."** False for the CVV, it must never be stored, encrypted or not. And storing the full card number, even encrypted, keeps you in the heavy compliance scope you're trying to avoid.
- **"The payment succeeded because the API returned 200."** A 200 means your request was received. For refunds and disputes, the real outcome arrives later by webhook and can still fail or reverse.
- **"We'll register for tax once we hit the limit."** For overseas sellers into the UK and parts of the EU, the threshold is zero. "Wait until we're big" logic is wrong the day you make your first cross-border sale.
- **"Multiplying by 100 turns dollars into cents, so it's fine everywhere."** Only for two-decimal currencies. Yen and dinar break it.
- **"Our refund button works, I clicked it and it said success."** The button saying success and money actually moving are two completely different claims. Only one of them pays the customer back.

## How to use this

A practical checklist you can run against any payment system, including your own:

1. **Grep for card fields.** Search your codebase for `cvv`, `card_number`, and full PAN handling. Any hit in a database column, log, or request body is a problem to fix today.
2. **Confirm card data never reaches your server.** Verify checkout is a redirect or provider-hosted form, and that you store only token, last four, brand, and expiry.
3. **Encrypt provider secrets at rest.** API keys and webhook secrets should not sit in plaintext config.
4. **Verify and dedupe every webhook.** Signature check on the raw body, unique constraint on the event ID, fail closed on a missing secret.
5. **Write a round-trip test for every money action.** Submit, read back, assert the money moved. This single habit kills the silent-success bug class.
6. **Wait for the webhook before declaring refunds and disputes final.** Record an intent, finalize on the success event.
7. **Build real chargeback handling.** Alert a human, show the deadline, freeze fulfillment, record the debit, log it.
8. **Charge in the order's currency, store the currency, convert with the right decimals.** Never read the charge currency from gateway config.
9. **Put tax behind one service and a real tax engine.** Honor per-product taxability identically across every entry path.

Prioritize by damage: anything storing card data or silently losing money is "do now." Correctness gaps that produce wrong numbers are "do next." Hardening is "later."

## Conclusion

If you remember one thing, make it this: **money code fails with a green checkmark, not a red error.** The dangerous bugs aren't the ones that crash, they're the ones that confidently report a success that never happened. Your defense is to never trust a claim of success without proof that the money actually moved, and to keep raw card data off your servers entirely.

The deeper lesson is that correctness here is mostly about *honesty between layers*: the UI must not claim what the backend didn't do, the stored record must reflect what the provider actually charged, and the report must reflect what truly happened to the cents. Get that honesty right and most of these bugs simply can't exist.

Once your payments tell the truth, the next frontier is **reconciliation**, the quiet discipline of matching every charge, refund, and fee in your system against what the bank actually settled. That's where the last hidden pennies live, and where the most mature finance teams catch what everyone else misses.
