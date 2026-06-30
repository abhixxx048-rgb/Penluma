---
title: 'MRR, ARR and NRR Explained: The SaaS Metrics That Lie'
metaTitle: 'MRR, ARR & NRR: The SaaS Metrics Guide'
description: >-
  MRR, ARR and net revenue retention decide what your SaaS is worth. Learn the
  definitions investors check and the myths that quietly wreck your numbers.
keywords:
  - what is MRR
  - what is ARR
  - net revenue retention
  - NRR vs GRR
  - MRR movement waterfall
  - SaaS quick ratio
  - good NRR for SMB SaaS
  - expansion vs contraction MRR
  - how to calculate ARR
  - deferred revenue SaaS
  - gross revenue retention benchmark
  - subscription revenue vs GMV
faq:
  - q: What is the difference between MRR and ARR?
    a: >-
      MRR is your normalized monthly recurring subscription revenue. ARR is
      simply MRR multiplied by 12 - a snapshot of your current run rate
      annualized. ARR is not the cash you collected over the past year or the
      total value of contracts you signed.
  - q: What counts as a good net revenue retention rate?
    a: >-
      It depends entirely on who you sell to. For low-price SMB software around
      97% is the median and perfectly healthy. Enterprise SaaS often sits near
      118% because big accounts expand more. Chasing an enterprise number with
      an SMB product is the wrong target.
  - q: What is the difference between NRR and GRR?
    a: >-
      NRR (net revenue retention) includes expansion from existing customers,
      so it can exceed 100%. GRR (gross revenue retention) excludes expansion
      and only measures losses from churn and downgrades, so it caps at 100%.
      Read them together - a few big upsells can hide heavy churn.
  - q: Why should you not include one-time fees in MRR?
    a: >-
      Setup fees, custom work and usage overages are real revenue but they are
      not recurring. Mixing them into MRR inflates the number and corrupts every
      retention and efficiency metric you calculate from it.
  - q: How do you account for an annual prepayment in MRR?
    a: >-
      Spread it evenly. A $600 annual plan contributes $50 of MRR each month for
      the full term. The upfront cash sits as deferred revenue and is recognized
      one-twelfth at a time - it is never a single-month revenue spike.
  - q: What is the MRR movement waterfall?
    a: >-
      It breaks your monthly MRR change into five parts - new, expansion,
      reactivation, contraction and churn. Instead of just showing net growth,
      it tells you which lever is actually moving so you fix the right problem.
topic: metrics-analytics
topicTitle: Metrics & Analytics
category: Business & Growth
date: '2026-06-16'
order: 999
icon: "\U0001F4CA"
author: Brexis Wazik
transformed: true
linked: true
sources: []
---

A subscription business can post a giant revenue number and still be quietly dying. It can post a small one and be one of the healthiest companies in its market.

The difference is almost never in the math. It is in the definitions. Blend two kinds of revenue into one figure, count an annual prepayment as a single fat month, or chase a retention target meant for someone else's business, and you will steer by a broken compass without ever seeing the crack.

This is a plain-language tour of the metrics that actually describe a subscription company's health - and the popular myths that wreck them.

## Why this matters

Recurring revenue is worth more than the same dollar of one-time revenue. A lot more. Investors pay high multiples for revenue that shows up reliably every month and far lower multiples for revenue that might or might not return.

So how you *define* your recurring revenue isn't an accounting footnote. It sets your valuation, tells you whether to spend on sales or on fixing churn, and decides whether your board trusts your numbers.

Here is the uncomfortable part: the most damaging mistakes in this whole field are definitional, not arithmetic. Nobody fat-fingers a spreadsheet. They quietly fold the wrong revenue into "ARR," and every downstream number inherits the lie. Get the definitions right and the rest mostly takes care of itself.

## MRR and ARR: get these right first

**MRR (Monthly Recurring Revenue)** is the predictable subscription money that contractually keeps arriving each month. Nothing else.

The key word is *normalized*. If a customer pays $600 for a year up front, that is not $600 of revenue in the signup month. It is **$50 of MRR every month** for twelve months, recognized evenly across the term.

```
MRR = sum of the normalized monthly value of every active subscription
      annual plan    → annual price / 12
      quarterly plan → quarterly price / 3

ARR = MRR x 12
```

**ARR (Annual Recurring Revenue)** is just MRR multiplied by twelve - a snapshot of your current run rate, annualized. That's the whole definition.

ARR is **not** the cash you collected last year. It is **not** the total value of contracts you signed. It is a forward-looking picture of "if nothing changed, this is what the next year looks like."

### What does NOT count as MRR

This is where most of the damage happens. The following are real revenue, but they are not *recurring* revenue, so they stay out of the base:

| Excluded item | Why it's out |
|---|---|
| One-time setup, onboarding or implementation fees | They happen once |
| Usage, overage or consumption charges | Variable and unpredictable |
| Custom professional services or ad-hoc work | Billed when needed, not on a cadence |
| Hardware or physical-goods sales | Not a subscription |
| Temporary promo discounts | Shouldn't artificially move the base |
| Per-transaction or per-order revenue | Non-recurring, even if it's most of your cash |

Including any of these makes MRR look bigger and instantly breaks every retention and efficiency metric you calculate from it. A clean base is the foundation everything else stands on.

**Quick analogy:** MRR is the salary you can count on. The bonus, the side gig, the tax refund - all real money, but you don't plan your rent around them.

## The MRR movement waterfall: find the real problem

Net MRR growth tells you the score. It does not tell you the story. The **waterfall** does, by splitting each period's change into five movements:

```
End MRR = Start MRR
          + New MRR           (brand-new customers)
          + Expansion MRR     (existing customers upgrading or adding seats)
          + Reactivation MRR  (churned customers coming back to paid)
          - Contraction MRR   (existing customers downgrading but staying)
          - Churned MRR       (customers canceling completely)
```

These five have to reconcile exactly from your starting MRR to your ending MRR. By convention, the three positives sit above the line and the two negatives below it.

Why this beats a single growth number: two companies can both grow MRR by $10,000 this month. One did it with healthy new sales. The other masked heavy churn with a couple of lucky upsells. The net number looks identical. The waterfall exposes which company you actually are.

### The overlooked middle

Most teams fixate on New and Churn and ignore the two movements in between. That's a mistake.

- **Reactivation** - winning back a lapsed customer - is often cheaper than landing a brand-new one. They already know your product.
- **Contraction is an early-warning signal.** A customer who downgrades is frequently a customer about to leave. Watch it weekly and you get a head start on saving the account *before* the full cancellation lands.

## NRR and GRR: how leaky is the bucket?

Imagine your existing customers as a bucket of water. Churn and downgrades are leaks. Upsells are someone topping it back up. Two metrics measure this, and you need both.

### Net Revenue Retention (NRR)

How much recurring revenue you keep from your **existing customers** over a period - including their expansion, but excluding any brand-new logos.

```
NRR = (Starting MRR + Expansion - Contraction - Churn) / Starting MRR
      same group of customers, no new logos counted
```

- **Above 100%** means your existing base grows on its own. The bucket refills itself faster than it leaks. This is the holy grail of efficient SaaS.
- **Below 100%** means you have to win new customers just to stand still.

### Gross Revenue Retention (GRR)

The honest leak-only number. GRR strips out expansion entirely and measures just the damage from churn and contraction. It mathematically caps at 100%.

```
GRR = (Starting MRR - Contraction - Churn) / Starting MRR
```

**Always read them together.** A handful of big upsells can prop NRR up to look wonderful while GRR quietly bleeds. Picture **115% NRR sitting on top of 82% GRR**: the headline looks fantastic, but underneath, nearly a fifth of your revenue is walking out the door - papered over by a few expansions that may not repeat. Around 90% GRR is widely treated as table stakes.

### What's a "good" number? Read your own row

This is the single most misused idea in SaaS metrics, so slow down here. The right NRR target depends entirely on who you sell to:

| Who you sell to | Typical NRR (median) |
|---|---|
| **SMB / low-price software** | **~97%** (top performers above 105%) |
| Mid-market | ~102–108%, rising with deal size |
| Enterprise | ~118% (top performers above 130%) |
| All private SaaS, blended | ~101% |

If you sell affordable, self-serve software to small businesses, **NRR below 100% is normal and healthy**, not a failure. The ceiling on how much a small customer can expand is simply lower. Holding that business to an enterprise number is comparing a corner café to an airport food court - same trade, totally different physics.

## The SaaS Quick Ratio

One more glance-level metric, invented by investor Mamoon Hamid. It answers: is your growth efficient, or are you frantically refilling a leaky bucket?

```
Quick Ratio = (New MRR + Expansion MRR) / (Churned MRR + Contraction MRR)
```

A common rule of thumb is that a healthy company adds about **$4 for every $1 it loses**, so a Quick Ratio near 4 is the informal bar.

One honest caveat: very young companies post enormous Quick Ratios simply because they've barely lost anything yet - the denominator is tiny, so the number is near-meaningless. It only becomes useful once your churn base is big enough to mean something. Don't obsess over it at small scale.

## Hybrid businesses: keep subscription and transaction revenue apart

Some companies earn two completely different kinds of money. A platform might charge a **monthly subscription** *and* take a cut of the transactions flowing through it. These obey different math:

```
Subscription revenue  = customers x plan price              → this is your MRR/ARR
Transaction revenue   = buyers x transactions x value x take-rate
```

**Folding transaction revenue into MRR is the classic distortion.** It makes MRR look huge and wildly volatile, breaks every retention metric, and quietly tanks [your valuation](/blog/business-financial-literacy/12-funding-dilution-the-cost-of-capital) - because transactional revenue earns a much lower multiple than recurring revenue. Investors who spot the blend either discount it heavily or treat it as a red flag.

The fix is simple: **report them on separate lines.** Track total transaction volume (often called GMV, the dollar value of everything flowing through the platform) as a health and engagement signal - a customer doing lots of volume rarely churns - but never sum it into recurring revenue. You can show both in one table for the board. You must never collapse them into a single "ARR" number.

## The annual prepayment trap

When a customer prepays a year up front, the cash is wonderful. But you cannot call it all revenue on day one.

The unearned portion sits on your books as **[deferred revenue](/blog/business-financial-literacy/05-the-balance-sheet-cash-flow-statement-why-profit-cash)** - a liability, technically, because you still owe a year of service. You recognize it gradually, about one-twelfth each month, as you actually deliver.

```
On the sale:  Cash +annual amount,  Deferred Revenue +annual amount
Each month:   recognize annual / 12 as revenue
              → MRR contribution = annual / 12 across the whole term
```

So annual plans are great for two reasons - they pull cash forward and they reduce churn (the customer is locked in). Just don't let that upfront cash masquerade as a single giant revenue month. It will overstate that month and understate all the others.

## Common misconceptions

A lot of "facts" circulate in SaaS-metrics folklore. Here are the ones to stop repeating.

- **"Every SaaS should hit 120% NRR."** No. The 100/110/120% "good/better/best" framing is real, but it's an enterprise, expansion-heavy benchmark. For low-price SMB software, ~97% is the median. Holding yourself to 120% with the wrong business model just produces bad strategy.

- **"Look at Snowflake's NRR as the target."** Snowflake's net retention was around 158% at IPO and peaked near 169% - extreme numbers driven by enterprise data-warehouse consumption that balloons as usage grows. It's irrelevant to a self-serve tool. Borrowing a metric from a wildly different business model only misleads you.

- **"ARR is the cash we collected this year."** It isn't. ARR is strictly MRR x 12, a run rate. Summing a year of collected cash - especially if it includes one-time fees - and calling it ARR is the most common and most damaging recurring-revenue misstatement there is.

- **"A 5% increase in retention boosts profits 25–95%."** The *direction* is sound - retention compounds, and the original research (Reichheld and Bain) is real. The folklore is the false precision. Use the principle, not the exact band.

- **"It's revenue, so it belongs in MRR."** Setup fees and usage overages are revenue, yes. But they're not *recurring*, and including them inflates MRR while corrupting every metric built on top of it.

## How to use this

If you're setting up subscription metrics from scratch, here's a concrete order of operations.

1. **Lock one clean recurring-revenue base.** MRR/ARR = subscription plan fees only, normalized monthly. Exclude every one-time fee, usage overage and transaction dollar. Write this definition down and defend it.
2. **Track any non-recurring revenue on its own line.** Transaction volume, services, hardware - separate dashboard, separate P&L line. Show totals as an explicit sum, never collapsed into "ARR."
3. **Emit clean subscription events.** Capture `subscription_started`, `plan_upgraded`, `plan_downgraded`, `subscription_canceled` and `subscription_reactivated`, each with the before-and-after amount. A movement you don't capture is a diagnosis you can't make.
4. **Build the MRR waterfall as your core weekly view.** New / Expansion / Reactivation / Contraction / Churn. Let it tell you which lever is actually moving.
5. **Watch contraction weekly as a churn early-warning.** Wire up a save motion - an in-app nudge or a personal message - the moment an account downgrades.
6. **Engineer one realistic expansion path.** For SMB, the durable lever is [usage-based graduation](/blog/personal-money-mastery/12-pricing-value-capture): as a customer grows, nudge them up a tier. That's how their success becomes your expansion MRR.
7. **Set targets against your own segment, not someone else's.** If you're SMB, plan around ~97% NRR and grow mostly through new logos plus modest expansion.
8. **Account for annual plans correctly.** Book as deferred revenue, recognize one-twelfth monthly, and keep the MRR contribution flat across the term.

And a short list of what to *defer* until you have real scale: the Quick Ratio (meaningless when your churn base is tiny), weekly cohort retention math (compute it monthly instead), and any blended "total revenue" figure dressed up as ARR.

## Conclusion

If you remember one thing, make it this: **the most dangerous SaaS metric mistakes are never math errors - they're definition errors.** A clean, honest MRR base, kept strictly separate from one-time and transactional revenue, is the foundation that makes every other number trustworthy.

Get that right and your metrics start working *for* you instead of flattering you.

The natural next question is what to actually *do* with a leaky bucket. Retention and expansion don't improve by watching the dashboard - they improve upstream, in how quickly a new customer [reaches their first real win](/blog/product-sense-empathy/04-jobs-to-be-done-people-hire-products-to-make-progress). That's the activation problem, and it's where the most durable retention gains are quietly made.
