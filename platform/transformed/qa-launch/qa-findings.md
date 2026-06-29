---
title: The Pre-Launch QA Pass That Catches Trust-Killing Bugs
metaTitle: Pre-Launch QA Checklist for SaaS Apps
description: A real pre-launch QA pass uncovered price mismatches, infinite loading, and broken pages. Here is the QA checklist that catches trust-killing bugs first.
keywords:
  - pre-launch QA checklist
  - software testing before launch
  - cart and checkout price mismatch
  - loading empty error states
  - QA testing for SaaS
  - manual testing best practices
  - conversion killing bugs
  - first impression bugs
  - multi-tenant data isolation
  - launch readiness checklist
  - exploratory testing
  - API rate limiting errors
faq:
  - q: What is a pre-launch QA pass?
    a: It is a careful walk through your live product as a real user would, before customers arrive. The goal is to surface bugs, confusing states, and trust-eroding glitches while they are still cheap to fix.
  - q: Why do cart and checkout totals sometimes differ?
    a: Usually because the two pages calculate shipping or tax separately instead of sharing one source of truth. Compute the total once on the server and carry that exact value through every step.
  - q: What are loading, empty, and error states?
    a: They are the three things a screen can show besides real data. A good screen shows a skeleton while loading, a friendly message when there is genuinely nothing, and a clear retry option when something failed.
  - q: How many bugs should a first QA pass find?
    a: More than you expect. A first exploratory pass on a fresh build commonly surfaces a dozen or more issues, most of them small but trust-damaging. Finding many is a sign the pass is working, not that the product is doomed.
  - q: What is the most damaging type of launch bug?
    a: Anything that makes an honest product look dishonest or broken, such as a price that changes at payment, a page stuck loading forever, or a screen that says your data is gone when it is not.
topic: qa-launch
topicTitle: QA & Launch Readiness
category: Business & Growth
date: '2026-06-01'
order: 999
icon: ✅
author: Pritesh Yadav (priteshyadav444)
transformed: true
sources: []
---

A customer fills their cart. Subtotal looks right. They click "Checkout" and the total quietly jumps fifty dollars. No explanation. They close the tab.

That bug was not theoretical. It was the very first thing a single pre-launch QA pass uncovered on a real platform, sitting in plain sight, waiting for paying customers to find it instead. This is the story of what one careful walkthrough catches, and how you can run the same kind of pass on your own product.

## Why this matters

Most launch-day disasters are not dramatic crashes. They are small, quiet glitches that make an honest product look broken or dishonest. A price that shifts at payment. A page that spins forever. A screen that announces "0 records" when your data is perfectly fine.

You will never see these the way a customer does, because you know how the product is *supposed* to work. Your eyes slide right past the rough edges. A deliberate QA pass forces you to look at the product as a stranger would, and that change in perspective is where the value lives.

The payoff is concrete: fewer abandoned carts, fewer "is this thing broken?" support tickets, and a first impression that earns trust instead of spending it.

## The bug that kills conversions: when the price changes on you

The single most damaging bug found in this pass was a total that disagreed with itself.

- **Cart page:** subtotal $108.65, shipping $49, total $157.65
- **Checkout page:** same subtotal, shipping $100, total $208.65

Same items. Same subtotal. Yet shipping silently doubled and the total rose by $51 with no reason given.

This is the classic conversion-killer. The price the customer agreed to in the cart is not the price they are asked to pay. Even when the higher number is "correct," the *change* reads as a bait-and-switch, and trust does not survive it.

**The root cause is almost always the same:** two pages calculating the same number in two different places. The cart figures shipping one way, checkout recomputes it another way, and nobody notices because each page looks fine on its own.

The fix is a principle worth tattooing on every project: **one source of truth.** Compute the total once, on the server, and carry that exact value all the way through the journey. Then add a test that simply asserts cart total equals checkout total for the same cart. Cheap test, expensive bug.

### The cousin: two prices on one screen

A related issue showed the same product at **$77** in the page header and **$75** in the "Recently Viewed" widget, on the same screen, at the same time.

The cause was subtle. The header started at the base "from" price ($75), then swapped to the configured total once options loaded ($77) while still wearing the "From" label, contradicting the catalog. The fix kept the header showing the stable "From $75" and let the live configured price live in its own clearly labeled "Estimated Total" panel.

The lesson: **decide what each number means, label it honestly, and never let the same product wear two price tags in one view.**

## The three states every screen must have

The second big theme was screens that did not know how to fail gracefully. This is the most common, most fixable category of QA bug, and it comes down to one rule.

Every screen that loads data can be in one of these states. It must handle all three:

1. **Loading** - show a skeleton or spinner, and *only* that.
2. **Empty** - the request succeeded and there is genuinely nothing yet. Show a warm, helpful message ("You haven't added team members yet - invite your team").
3. **Error** - the request failed. Show a plain-language message and a **Retry** button.

The pass found nearly every variation of getting this wrong:

- A detail page sat on **grey skeleton boxes forever** because a request never resolved. An infinite skeleton reads as "broken."
- A store page showed a raw **"500 internal server error"** with nowhere to go.
- A list screen rendered **"Loading…"** and **"No results"** at the same time, with a "0 total" header, for three to five seconds before the data appeared.

That last one is especially nasty. A store owner opening their Invoices and seeing "No results / 0 total" reasonably concludes they have none, or that their data vanished. The data was there the whole time. The screen just showed its empty state *while still loading*.

**The rule:** while loading, show only a skeleton. Show "empty" only after the request resolves with zero rows. Never let "failed" and "empty" wear the same face. Getting this precedence right erased a whole cluster of "looks broken but isn't" reports in one move.

## When the system gets in its own way

Some bugs are not in the screen at all. They live in the plumbing.

This app's dashboard loads about a dozen widgets at once, each making its own request. A flat rate limit of 60 requests per minute meant that opening two or three tabs caused a single user to **trip the rate limiter and get a "429 Too Many Requests" error** during normal use. The app was attacking itself.

The fix split the limit: authenticated users got a generous ceiling sized for the app's own parallel boot, while anonymous traffic kept the tighter limit that guards against abuse. Once that landed, a separate mystery solved itself too - a dashboard that took ten seconds to load behind a long blank "Setting things up…" splash. It had been slow because its own parallel requests were tripping the limiter and retrying.

**The lesson:** measure your limits against how your app actually behaves, not against an imagined attacker. A real dashboard fires many requests at once. If your own product can trip your own defenses, real traffic will too.

## The data that quietly disappears

A subtler class of bug erases information that was deliberately saved.

When customers were deleted, every one of their past orders showed **"Deleted customer / - / - / -"**. But each order also carried a full snapshot of that customer - name, email, phone - captured at order time for exactly this reason. The screen ignored the snapshot entirely.

Orders are financial records. "Who placed this $540 order, and how do I reach them?" must survive a customer being deleted. The data was there; the interface just never reached for it. The fix was to fall back to the saved snapshot whenever the live record is gone.

**The lesson:** when you go to the trouble of preserving data, make sure something actually *shows* it. A safety net nobody looks at is not a safety net.

## The scariest check that came back clean

Not every investigation ends in a fix. The most important one in this pass ended in relief.

The question: in a system serving many separate businesses, **can one company read another company's data?** This is the question that ends companies, so it deserves paranoid attention.

The audit found the admin panel was passing a tenant ID as a query parameter - a value supplied by the client, which looks alarming. But three independent layers made a leak impossible:

1. **The real tenant is derived from the logged-in user on the server**, not from the request, so it cannot be faked.
2. **A global database scope** silently adds "where this tenant" to every query automatically.
3. Because of that scope, a forged tenant ID can only ever **narrow** results to nothing, never widen them to someone else's data.

No leak. But the report still flagged the client-supplied tenant ID as a "latent risk" - harmless today only because the global scope is doing the real work. If a future change ever bypassed that scope, the forged value would become the only guard.

**The lesson, and it is the heart of good QA:** "it works" and "it is safe" are different questions. Verify *why* something is safe, not just *that* it appears to be. Note the latent risks even when nothing is broken yet, because today's harmless shortcut is tomorrow's foot-gun.

## Common misconceptions

**"If I find a lot of bugs, the product is in bad shape."**
The opposite. A first exploratory pass that surfaces a dozen issues is a pass that is *working*. The bugs existed whether or not you looked. Finding them now, before customers do, is the entire point.

**"Automated tests mean I don't need to click through it myself."**
Automated tests check what you thought to ask. They would never catch a price that "feels" like a bait-and-switch or a splash screen that "looks" hung. Some bugs only reveal themselves to a human walking the real path. In this pass, the test suite itself was silently broken by a stray character - a reminder that even your safety nets need checking.

**"A bug that recovers on reload isn't a real bug."**
Several "0 records" displays vanished on refresh. That does not make them harmless - your customer does not know to refresh. They see "your data is gone" and they react accordingly. Transient and trust-damaging are not opposites.

## How to run your own pre-launch QA pass

You do not need a QA department. You need an hour, a fresh perspective, and a willingness to be annoyed by your own product.

1. **Walk the money path end to end.** Add to cart, view cart, checkout. At each step, write down every number you see. The total must never change without a reason the customer can read.
2. **Open three tabs at once.** Real people do. Watch for errors, slowdowns, or anything that breaks under light concurrent load.
3. **Break the connection on purpose.** Throttle or kill your network mid-load. Does each screen show a real error with a Retry button, or does it spin forever and lie about being empty?
4. **Visit every screen as a brand-new account.** Empty states are a first impression. "0 records" should never be the welcome mat.
5. **Delete something, then look for it.** Remove a customer, then open their old orders. Does the saved information survive, or does it vanish?
6. **Ask "is it safe" separately from "does it work."** For anything touching other users' data, trace *why* it cannot leak, and write down any shortcut that is only safe by luck.
7. **Read every label out loud.** Stray placeholder text, raw internal IDs ("Option 55: 178"), and debug leftovers hide in plain sight until you actually read the words on screen.
8. **Fix the things that block testing first.** If your test suite or a core page is broken, repair that before anything else, so every later fix can actually be verified.

## Conclusion

The single takeaway: **the bugs that hurt most are not the ones that crash - they are the ones that make an honest product look broken or dishonest.** A price that shifts at payment, a screen stuck loading, a page that says your data is gone. None of them throw an error. All of them spend trust you cannot easily earn back.

One careful pass, run with a stranger's eyes, catches the whole family of them before a single customer does.

And here is the thread worth pulling next: nearly every issue above traced back to a handful of root causes - one source of truth, three honest screen states, limits that match real behavior. Learn to recognize those patterns, and you stop fixing bugs one at a time and start preventing entire categories of them. That shift, from firefighting to design, is where reliable products actually come from.
