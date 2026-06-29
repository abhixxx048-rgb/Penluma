---
title: "Event Tracking Done Right: Why 14 Events Beat 200"
metaTitle: "Event Tracking & Funnel Analytics Guide"
description: "Learn how to design a lean event taxonomy and funnel analytics setup that actually answers questions, instead of a 200-event tracking plan nobody owns."
keywords:
  - event tracking
  - funnel analytics
  - event taxonomy
  - tracking plan
  - server-side tracking
  - product analytics
  - object action naming convention
  - identity stitching
  - PostHog vs Mixpanel
  - conversion funnel
  - SaaS analytics
  - activation funnel
  - snake_case event names
  - ad blocker data loss
topic: metrics-analytics
topicTitle: Metrics & Analytics
category: Business & Growth
date: '2026-06-16'
order: 999
icon: "\U0001F4CA"
author: Pritesh Yadav (priteshyadav444)
transformed: true
faq:
  - q: How many events should a tracking plan have?
    a: For a small team or SMB product, aim for around 12 to 15 hand-instrumented events that trace your real customer lifecycle. Amplitude's functional guidance tops out near 200, but more events almost always means more noise, not more insight.
  - q: What is the object_action naming convention?
    a: It names every event as a noun plus a past-tense verb, like order_received or store_published. Lowercase with underscores, one consistent style, enforced forever. It keeps related events grouped and stops your data from fragmenting.
  - q: Should I track events on the client or the server?
    a: Track money and lifecycle events (orders, payments, signups) on the server where ad-blockers and browser privacy can't drop them. Track low-stakes behavior like clicks and pageviews on the client, ideally with autocapture.
  - q: What is identity stitching in analytics?
    a: It's the process of merging a user's anonymous browsing history into their known profile the moment they sign up or log in. Done right, one person stays one person in your data instead of being split across many anonymous IDs.
  - q: Why do funnels show false drop-offs?
    a: The most common cause is forcing users through a step many of them legitimately skip, which inflates the apparent leak. Wrong conversion windows and mixing strict versus loose ordering also distort which users get counted.
  - q: What is the best analytics tool for a small team?
    a: PostHog is a strong default because its free tier is generous, it bundles funnels, session replay, and feature flags, and autocapture handles low-value events automatically. Mixpanel and Amplitude are solid alternatives depending on pricing model.
sources: []
---

A team sits down to "set up analytics." Three weeks later they have a 200-event tracking plan, a spreadsheet nobody updates, and dashboards that somehow never answer the one question that matters: are people actually getting value from the product?

This is the most common analytics mistake there is. And the fix is counterintuitive. You track *less*, on purpose, with discipline.

## Why this matters

Most analytics advice assumes you're running a consumer app with millions of users and a dedicated data team. If that's not you, copying that playbook is actively harmful.

When you have limited engineering time and a smaller customer base, **signal-per-event is everything**. Every event you add is something a human has to name, fire correctly, own, and maintain. A bloated tracking plan doesn't give you more insight. It buries the one funnel that matters under 190 events nobody trusts.

The payoff for getting this right is concrete: you can answer "where are people dropping off, and why?" in minutes instead of arguing about whether the numbers are even real. That single capability changes how a product team makes decisions.

So let's build the lean version. A small, reliable, well-named set of events that traces the real customer journey, and the handful of rules that keep it from rotting.

## What a funnel actually measures

A **funnel** is an ordered set of steps a user has to complete, and it tells you the **percentage of users who reach each step** within a time limit.

For example: `signup_completed` then `store_published` then `order_received`. The funnel shows you how many people made it from one stage to the next.

Two details trip people up constantly.

**Funnels count people, not events.** A user converts once per attempt. This is different from a raw event total, which counts every firing. Confusing the two means you're comparing different denominators and wondering why nothing adds up.

**Every funnel needs a conversion window.** That's the maximum time allowed between the first and last step. Mixpanel, for instance, supports windows from a 2-second floor all the way up to 90 days.

The window is not a minor setting. It's a modeling decision that quietly changes your answer:

- Too short, and you under-count slow-but-real conversions. Someone who signs up Monday and goes live Thursday looks like a failure.
- Too long, and you over-credit unrelated sessions that had nothing to do with the journey.

If your goal is something like "store live and first order within 7 days," then a 7-to-14-day window matches reality. A same-session window would lie to you.

### Strict vs loose ordering: the setting that changes everything

This is the most consequential funnel choice, and it's easy to get wrong.

- **Strict ordering** means the user must do the steps in *exact* sequence with nothing counted out of order between them. Use it for linear, must-follow flows: checkout, payment, a go-live wizard.
- **Loose (or flexible) ordering** means the user must hit all the steps in order, but can do other things in between. Use it for exploratory journeys, where someone signs up, pokes around, edits things, and *eventually* publishes and gets a first order.

Pick the wrong one and you count the wrong population entirely. A strict funnel on an exploratory journey will show a cliff that isn't real.

### The false-leak trap

Real products have more than one path to value. The classic mistake is forcing a single linear funnel through a step that many users legitimately skip.

The result: those skippers look like drop-offs, the step shows a huge fake leak, and you spend a sprint "fixing" a problem that doesn't exist.

Two fixes. Make optional steps actually optional in the funnel definition, or model separate funnels for separate paths and compare them.

### Always segment

A blended funnel hides the leak. The aggregate looks fine while one channel quietly bleeds out.

Break the same funnel down by acquisition channel, by persona, by device, and by signup cohort. Segmentation is where funnels stop being a vanity chart and start telling you *where* and *for whom* things break.

## Naming events so they don't rot

A taxonomy is just a **controlled vocabulary** for your events and their properties. It rots when engineers invent names ad hoc under deadline pressure, and one person's `OrderPlaced` becomes another's `order_complete` becomes a third's `purchase`.

The fix is a convention you lock down once and enforce forever. The industry consensus, shared across Amplitude, Mixpanel, PostHog, and Segment, is the **object_action** style.

An event is an *object* (a noun, the thing) plus an *action* (a verb, what happened to it). Think `button_clicked`, `checkout_completed`, `order_received`. Lock down four axes:

1. **Casing.** Pick one. `snake_case` is recommended because it survives export to a data warehouse better than camelCase. Casing drift alone fragments your metrics.
2. **Format.** `object_action`, so related events naturally cluster together.
3. **Tense.** Past simple. `order_received`, not `receive_order`. It reads like a historical record, which is exactly what it is.
4. **Vocabulary.** Restrict your verbs to an approved list. PostHog's default set (view, click, submit, create, add, update, delete, remove, start, end, cancel, fail, send, invite, generate) is a strong starting point.

### The single most important code rule

**Event names are fixed strings. Never build them from a variable.**

This one rule prevents more pain than any other. If you write `order_${status}`, then every order status spawns a brand-new "event," and your taxonomy explodes into hundreds of near-duplicates.

Variable data belongs in **property values**, not event names.

### Events, properties, and user properties

These three are easy to blur, and keeping them straight is what prevents sprawl.

- **Event** is the discrete action: `product_added`.
- **Event property** is the context of that specific occurrence: `product_type: "business_cards"`, `price_set: 24.00`.
- **User property** is a lasting attribute of the person or account: `plan: "growth"`, `is_b2b: true`.

Here's the rule of thumb that saves you. If you're tempted to create `product_added_business_cards` and `product_added_flyers` as separate events, stop. That's *one* event with two values of a `product_type` property. Properties are how you describe variety without multiplying events.

A few property habits worth adopting: prefix booleans with `is_` or `has_`, suffix dates with `_date` or `_timestamp`, and keep each property's *type* stable. Sending the same property as a string one day and a number the next will silently break your aggregations with no error to warn you.

## Governance is a one-page doc and an owner per event

Here's the uncomfortable truth: taxonomies don't fail because of a bad spreadsheet. They fail because there's **no enforcement gate**.

And the worst failure modes throw no error at all. An event whose author left the company. Identity that fragments silently. A property that quietly changed type. Nothing breaks loudly. The numbers just slowly become fiction.

Minimum viable governance for a small team looks like this:

1. A **living tracking plan**, one table, where every event lists its name, its trigger, its key properties, a **named owner**, and whether it fires client-side or server-side.
2. A **pull-request checklist** for any tracking change: name passes the convention, properties are typed, the owner field is set, and any deprecation gets a migration plan instead of a silent rename.
3. **Version labels** (proposed, active, deprecated, removed) instead of deleting events outright.

That's it. The owner field is the quiet hero here. An event with a name on it is an event someone will fix when it breaks.

## Identity: the silent killer

Most of the events you care about happen *before* you know who the user is. Landing on the page. Starting signup. At that point they're just an anonymous browser.

**Identity stitching** is the job of merging that anonymous history into the real, known profile the moment the person identifies themselves.

The model is simple. Every browser gets an anonymous device ID. When the user signs up or logs in, you call `identify(user_id)`, which binds the anonymous ID to their real one and retroactively pulls all that earlier anonymous activity into their profile.

There's a two-moment rule, and you have to do both:

1. Initialize identity **on first load**, binding the anonymous session.
2. Call `identify()` **after login or signup**, merging anonymous into known.

Skip either one and you get the highest-cost, error-free failure in all of analytics: cohorts that are silently wrong because one human got split across many IDs, or many humans got collapsed into one shared device.

One more nuance worth knowing. Use your tool's "set" operation for things that change (current plan), and "set once" for things that must never be overwritten, like **first-touch acquisition source**. Overwrite someone's original referral source and you've destroyed that attribution permanently.

## Fire revenue events on the server

This is the single highest-return instrumentation decision you can make, so it's worth understanding clearly.

Client-side events travel through the user's browser. That means **ad-blockers, browser privacy features, and plain old JavaScript failures drop a chunk of them.** Server-side events go straight from your backend and simply cannot be blocked.

Here's the cruel twist: the events most likely to be lost client-side are exactly the **high-value ones**. Signups, orders, payments. Privacy-conscious users (precisely the ones running blockers) skew toward exactly those moments.

So the answer is a **hybrid**:

- **Client-side** for low-stakes behavior: pageviews, clicks, in-app navigation. Cheap, often free via autocapture, and a little loss here is fine.
- **Server-side** for the money and lifecycle truth: orders received, payments succeeded, subscriptions started or canceled, store published. These usually already happen in your backend, so fire the analytics event right there in the service layer rather than re-deriving it from a blockable browser event.

If you genuinely need the same event on both sides, give the two versions **different names** so you don't double-count.

A quick word on the famous "ad-blockers cause 25 to 40% data loss" stat: treat it with suspicion. Ad-blocker *adoption* (around 29 to 33% of users) is well measured. The specific *analytics data-loss* figure is a directional, vendor-stated estimate, not an audited fact. It's a good reason to capture revenue on the server. It is not a precise target to plan around.

## Choosing a tool without overthinking it

Here's how the main options actually differ for a small, cost-conscious team:

- **PostHog.** Generous free tier, and it bundles analytics, session replay, feature flags, A/B testing, and surveys in one place. Self-hostable, autocapture included. The per-event cost scales with volume, and the UI is busier. A strong default.
- **Mixpanel.** Fast, product-manager-friendly funnels and retention. Priced per monthly tracked user, which can surprise you as you grow.
- **Amplitude.** Best-in-class behavioral analytics and governance tooling. Gets enterprise-priced once you outgrow the starter tier.
- **GA4.** Free and everywhere, but it samples data, imposes hard limits (40-character event names, 25 parameters per event), and models sessions rather than users. Weak for product funnels.
- **Roll your own on Postgres.** Full control, no vendor. Also a trap: you'll be reinventing funnels, retention, session replay, and governance with engineering time you don't have.

For most small teams, **PostHog** maximizes signal per dollar and per engineering hour. Autocapture removes most manual instrumentation, the free tier covers typical SMB volume, and bundled session replay turns a "where did they drop off" into a "*why* did they drop off."

A lightweight Postgres events table is fine as a server-side source of truth that *feeds* your analytics tool. It is not a substitute for the analytics product itself.

## Common misconceptions

**"More events means more insight."** The opposite. Past a point, more events means more noise, more maintenance, and less trust. Track outcomes tied to business goals, not every interaction.

**"Ad-blockers wipe out a precise, known percentage of my data."** Adoption is measured; the data-loss percentage is a directional estimate. Use it as a reason to go server-side, not as a number to optimize against.

**"The blended funnel tells me how I'm doing."** It hides channel- and persona-specific leaks. The aggregate can look healthy while one segment quietly fails.

**"We'll just clean up the tracking plan later."** Taxonomies decay silently, with no errors. Later never comes, and by then the data is already fiction. Governance has to exist from day one or it never exists.

**"Tracking every click gives us a fuller picture."** Autocapture and session replay already cover clicks and micro-interactions for free. Hand-instrumenting them is the sprawl trap.

## How to use this

Here's the concrete sequence to set up analytics you'll actually trust:

1. **Design a small plan, around 12 to 15 events**, that traces your real lifecycle from first visit to repeat purchase. Resist adding an event until an existing one has genuinely failed to answer a question.
2. **Pick one naming convention** (`object_action`, snake_case, past tense) and write it down. Make event names fixed strings, never built from variables.
3. **Sort each event into client or server.** Put every money and lifecycle event on the server, fired from your backend service layer.
4. **Wire identity in two moments:** initialize the anonymous ID on first load, then call `identify()` at signup and login. Use "set once" for first-touch source so attribution can't be overwritten.
5. **Adopt one tool with autocapture** (PostHog is a safe default) so low-value clicks and pageviews are handled for free and you only hand-instrument the lifecycle events.
6. **Build your one headline funnel first.** For an activation journey, that's something like signup, then store published, then first order, with a 7-to-14-day window, segmented by persona and channel. Review the worst-converting step weekly.
7. **Make the tracking plan a checked-in document with a PR checklist.** Owner field required, deprecations get migration plans, version labels instead of deletions.
8. **A/B test on your own funnel,** never on borrowed numbers from a vendor blog. Test your conversion-window length, your upgrade triggers, your onboarding variations.

## Conclusion

The whole discipline collapses into one idea: **a small, well-owned, server-anchored event set beats a sprawling one every single time.** Fourteen events that fire reliably and trace your real lifecycle will out-decide two hundred events that nobody trusts.

Start with the one funnel that matters, name everything consistently, fire the money events from the server, and put a human's name on each event. Everything else is a refinement of that.

Now here's the thread worth pulling next. Once your activation funnel is healthy, the question shifts from *getting* people to value to *keeping* them there. That's a different beast entirely, measured by retention curves and cohort decay rather than a one-time funnel. And retention, it turns out, is where most of the durable growth actually hides.
