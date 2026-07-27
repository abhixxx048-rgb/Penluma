---
title: "Hick's Law: Why Fewer Choices Make People Decide Faster"
metaTitle: "Hick's Law: Why Fewer Choices Convert Better"
description: >-
  Hick's Law says every extra option adds decision time. Learn the formula, the famous jam
  study, and how to use it to design menus, forms, and CTAs that convert.
keywords:
  - hick's law
  - hicks law ux
  - hick's law examples
  - hick-hyman law
  - paradox of choice
  - decision time and number of choices
  - progressive disclosure
  - reduce choices to increase conversions
  - too many options ux
faq:
  - q: "What is Hick's Law in simple terms?"
    a: "Hick's Law says the time it takes someone to make a decision grows as you add more choices. Two options are quick; twenty options force people to scan, compare, and hesitate. The relationship is logarithmic, so each extra option adds a little less delay than the one before, but the delay never stops growing."
  - q: "What is the formula for Hick's Law?"
    a: "RT = a + b·log2(n + 1), where RT is reaction time, n is the number of equally likely choices, a is the fixed time before deciding, and b is how much each additional option costs. The log means decision time rises with the number of choices but with diminishing steepness."
  - q: "Does Hick's Law mean I should always reduce options?"
    a: "No. Hick's Law applies to simple, comparable choices made in one glance. It does not mean dumb everything down. Removing options past what users genuinely need just relocates the complexity into confusion elsewhere. Use progressive disclosure, grouping, and smart defaults instead of blindly deleting features."
  - q: "What is the difference between Hick's Law and Miller's Law?"
    a: "Hick's Law is about decision speed - how long it takes to choose among visible options. Miller's Law is about working memory - how many chunks you can hold in your head at once. A long on-screen menu is a Hick's Law problem (scanning cost), not a Miller's Law problem, because nothing has to be memorized."
  - q: "What is the jam study and what does it prove?"
    a: "In a 2000 supermarket experiment by Iyengar and Lepper, a table with 24 jams attracted more browsers than a table with 6 - but the smaller display led to roughly ten times more purchases. It is the classic real-world illustration that more choice can lower action, often called the paradox of choice."
author: Brexis Wazik
transformed: true
linked: false
sources:
  - title: "Laws of UX - Hick's Law (Jon Yablonski)"
    url: https://lawsofux.com/hicks-law/
topic: laws-of-ux
topicTitle: Laws of UX
category: Design
date: '2026-07-14'
order: 1
icon: "🎨"
---

Open a food-delivery app and you order in a minute. Open a 12-page diner menu and you're still flipping pages when the waiter comes back a second time. Same hunger, same appetite - but ten times the effort to decide. That gap isn't indecisiveness. It's a measurable law of human behavior, and it's quietly deciding whether people finish or abandon everything you design.

## Why this matters

Every screen you build asks the user to choose something: which button, which plan, which field to fill first. **Hick's Law says the more options you put in front of them, the longer that choice takes - and the more likely they are to give up before making it.**

That's not a soft opinion about "clean design." It's the difference between a signup form people complete and one they close, a pricing page that converts and one that stalls, a navigation menu people breeze through and one they bounce off of. If you've ever watched analytics show people dropping off at the exact step where you offered the most choices, you've already seen Hick's Law at work.

Understanding it lets you do three concrete things:

- **Predict** where users will hesitate before you ship, just by counting options.
- **Design** menus, forms, and calls to action that feel effortless.
- **Defend** a decision in a room - "we cut this from nine options to four because of Hick's Law" - instead of arguing about taste.

## What Hick's Law actually says

In 1952, British psychologist William Hick, and shortly after him Ray Hyman in 1953, ran experiments measuring how long people took to react as the number of possible choices went up. Together they gave us the **Hick-Hyman Law**, usually shortened to Hick's Law.

Their finding, in plain English: **decision time grows as you add choices, but logarithmically** - each new option adds a little less delay than the one before it, yet the total keeps climbing. The formula looks like this:

> **RT = a + b · log₂(n + 1)**

You don't need the math. Here's what each piece means in human terms:

- **RT** is reaction time - how long the person takes to decide.
- **n** is the number of equally likely choices.
- **a** is the fixed cost before deciding at all (noticing, focusing).
- **b** is how expensive each additional option is for this particular decision.

The single takeaway hiding in that equation: **going from 2 choices to 4 hurts a lot; going from 20 to 22 barely registers.** The first few options are cheap. It's the jump from "a couple" to "a wall of them" that kills momentum.

### The restaurant in your pocket

Picture two menus. A café with six dishes: you read the list once and order. A mega-diner with 120 dishes across nine categories: you flip back and forth, ask the waiter for a recommendation, and second-guess your pick after ordering. Nothing about your hunger changed. The *number of options* changed, and with it, the effort.

Every button, link, and form field on your screen is an item on that menu. A page with one obvious next step is the café. A dashboard with forty controls competing for attention is the mega-diner.

## The jam study: proof that more choice sells less

The most famous demonstration of Hick's Law in the wild isn't in a lab - it's in a grocery store. In 2000, psychologists Sheena Iyengar and Mark Lepper set up a tasting table with sample jams.

- With **24 jams** on display, more shoppers stopped to look.
- With just **6 jams**, far fewer stopped - but roughly **ten times as many actually bought**.

The big display drew a crowd and then paralyzed it. The small display converted. This is the **paradox of choice**: abundance is attractive but action-killing. People *want* to believe more options are better, then freeze when handed them.

That single result should change how you think about pricing tiers, product grids, and feature lists. Attracting attention and driving action are different jobs, and past a certain point, more choice trades the second for the first.

## How to apply Hick's Law

You don't apply Hick's Law by ripping features out. You apply it by controlling how many choices hit the user *at one moment*. Five techniques do almost all the work:

1. **Trim to the genuinely necessary.** For each option, ask: does this serve a real user goal, or is it here because we couldn't decide what to cut? Every option you remove speeds up every decision that remains.
2. **Use progressive disclosure.** Show the common path first; tuck advanced options behind "More options," an accordion, or a second step. It's the "chef's specials" card sitting on top of the full menu - most people never need to open the big one.
3. **Break long forms into steps.** A single screen with 20 fields reads as overwhelming. The same 20 fields across four short, labeled steps feels easy, because each step is a small decision. (Just show a progress indicator so people know how far they've come.)
4. **Highlight a recommended choice.** On a pricing page, marking one tier "Most popular" gives the eye a default to anchor on. You're not removing choices - you're lowering the cost of making one.
5. **Ship smart defaults.** The fastest decision is the one already made well on the user's behalf. Pre-select the option most people should pick, and let the minority change it.

Notice that big, clearly separated targets also make the *acting* part faster once the choice is made - which is where Hick's decision-cost law hands off to [Fitts's Law, the physics of hitting a target](/blog/laws-of-ux/02-fitts-law-target-size-and-distance).

## Common misconceptions

**"Hick's Law means always show fewer options."** No. It applies to *simple, comparable, glance-and-pick* decisions. Experts sometimes need dense control panels - a pilot's cockpit or a pro video editor isn't a failure of Hick's Law. The goal is to reduce *unnecessary* choice at each moment, not to strip capability.

**"So I should cut features to obey Hick's Law."** Careful. Cutting real capability doesn't delete complexity - it shoves it onto the user, who now has to work around what's missing. The fix for "too many options" is usually *organization* (grouping, disclosure, defaults), not *amputation*.

**"A menu shouldn't have more than 7 items because of Hick's Law."** Two laws are getting mixed up here. A visible menu is a *scanning* problem (Hick's Law), not a *memory* problem. The "7 items" rule comes from a misreading of [Miller's Law, which is about working memory](/blog/laws-of-ux/04-millers-law-seven-plus-minus-two), and it's one of the most repeated myths in design. A well-organized 12-item menu can beat a cramped 6-item one.

**"Fewer choices always convert better."** Only up to the point where you've removed something people actually wanted. Under-offering has its own cost - a store with two products loses the customer who needed the third. Hick's Law is a dial, not a switch.

## How to use this today

Do a five-minute audit of your most important screen:

1. **Count the choices.** Every button, link, field, and menu item the user could act on. Write down the number.
2. **Find the single primary action.** If more than one thing is fighting to be "the main thing," you have a Hick's Law problem.
3. **Sort the rest into "now" and "later."** Push the "later" options behind progressive disclosure.
4. **Group what remains** into labeled clusters so the eye scans categories, not a flat list.
5. **Add a default or a recommendation** so the user has an easy starting point.

Then watch where people hesitate. Hesitation almost always lives exactly where you offered the most choices at once.

## Conclusion

Hick's Law is one line worth remembering: **every option you add is a small tax on every decision the user makes.** Sometimes that tax is worth paying - real choice has real value. But most interfaces charge it by accident, piling options onto a single screen and then wondering why people stall.

Design the choice, don't just dump it. Trim, group, disclose, default - and watch decisions get faster.

Here's the twist, though. Making a choice fast is only half the battle. Once a user has *decided* which button to press, a second law takes over: how quickly and reliably their finger or cursor can actually land on it. Miss that, and a fast decision still ends in a fumbled tap. That's the domain of [Fitts's Law](/blog/laws-of-ux/02-fitts-law-target-size-and-distance) - the reason every button on your screen is really a dartboard.
