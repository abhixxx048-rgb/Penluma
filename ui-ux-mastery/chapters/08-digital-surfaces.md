# Chapter 08: Designing Digital Products: Websites, Apps, Dashboards, Landing Pages, E-commerce

## Why this chapter matters

So far you have learned the *rules* of good design: clarity, hierarchy, feedback, and low friction. Those rules never change. But where you apply them does.

Think of a chef. A chef learns one set of skills: heat, salt, timing, balance. But a breakfast diner, a wedding banquet, and a food truck each demand a different menu, layout, and pace. The skills are the same. The *surface* is different.

Digital design works the same way. A website, a dashboard, a phone app, a landing page, an online shop, and a form are six different "restaurants." Each has its own habits that users already expect, its own common ways to fail, and its own hard numbers that tell you what "good" looks like. This chapter teaches you how to take the principles you know and apply them correctly on each surface. When you finish, you will be able to look at any screen and know both what to build and what to avoid.

---

## The four laws you carry everywhere

Before we split into surfaces, here are four psychology "laws" that show up on every one of them. Think of them as the four knives every chef carries. Learn all four. Use the ones the situation calls for.

- **Jakob's Law.** Users spend most of their time on *other* sites and apps, not yours. So they expect yours to work the same way. A door with a handle should pull; a door with a flat plate should push. When you copy familiar patterns (logo top-left, cart top-right, hamburger menu), your product feels "intuitive" only because it matches what people already know. Reinventing the checkout or the menu icon costs you comprehension.
- **Hick's Law.** The more choices you show, the longer a decision takes. Fewer, clearer options win. A pricing page with 3 plans usually beats one with 5. This applies to menus, buttons, and filters alike.
- **Fitts's Law.** The time to hit a target depends on its *size* and *distance*. Bigger and closer is faster to tap. This is why primary buttons are large, and why mobile buttons sit near the thumb.
- **Miller's Law.** Working memory (the small mental "desk" where you hold things you are actively thinking about) holds only about **4 to 7 chunks** at once. Do not dump 20 items on someone at once. Group them.

Rule of thumb: not every law fits every screen. Learn all of them, and apply the ones that match what you are asking the user to do.

**In short:** The same handful of human limits shape every surface; master them once and reuse them everywhere.

---

## Websites: marketing, content, and corporate sites

A website is like the front of a shop on a busy street. People walk past in seconds. Your job is to tell them, fast, what is inside and why they should step in.

### Navigation patterns

Navigation is the set of links that let people move around your site. It is the store directory at a shopping mall. If people cannot find it, they cannot shop.

- **Put the main navigation in an obvious spot, right next to the main content.** Group similar links together so users see the full range of what you offer and can tell categories apart. This comes from Nielsen Norman Group's *113 Design Guidelines for Homepage Usability*, a landmark study of what makes homepages work.
- **Beware "banner blindness."** Over years of seeing ads, users have learned to ignore anything that sits inside or above a rectangular, banner-like shape at the top of a page. If you place your navigation *above* a horizontal line or a banner graphic, people's eyes will skip right over it. Keep the nav touching the content, with no banner floating above it.
- **Use the patterns people already expect** (Jakob's Law): logo top-left that links home, a horizontal menu across the top, search top-right, and a "fat footer" at the bottom holding everything else. Every time you deviate, you make users work harder.

### Homepage clarity

Within a few seconds, a homepage must answer four questions: *Who are you? What do you offer? Why you and not a competitor? What should I do next?* Your tagline and value proposition (a plain sentence saying what you do and for whom) must be explicit, not clever-but-vague. "Welcome to our website" answers none of those questions. "Project management software for small construction teams" answers all four.

### Above the fold

"The fold" is an old newspaper term. Papers were folded in half on the newsstand, so the top half had to sell the whole paper. On a screen, "above the fold" means everything visible in the first screenful before anyone scrolls.

Why it matters, with numbers from NN/G's eye-tracking research:

- About **74% of viewing time** happens in the top two screenfuls of a page.
- The average gap in how users *treat* information above versus below the fold is **84%** — meaning content up top gets vastly more attention.

But here is the modern nuance. People are now used to scrolling, so the fold is not a hard wall. It is the place where you must *earn* the scroll. Put a strong value proposition and one primary button above the fold, then use visual cues (a peek of the next section, a downward arrow) to invite people to keep going.

```
+------------------------------------------+
|  LOGO      Home  Product  Pricing  [Search]|  <- nav next to content
+------------------------------------------+
|                                          |
|   Clear headline: what + who for         |  <- earns the scroll
|   One short supporting line              |
|   [ Primary CTA button ]                 |
|                                          |
|   ...a peek of the next section...       |  <- visual cue to scroll
+------------------------------------------+
        ~74% of attention lives up here
```

### Website mistakes and fixes

| Mistake | Fix |
|---|---|
| Vague hero headline ("Welcome to our site") | State the value and who it is for |
| Nav buried above a banner (banner blindness) | Place nav next to content, no banner above |
| Too many top-level nav items (Hick's Law) | Group into ~5 to 7 categories; push the rest to the footer |
| Auto-rotating carousel hero nobody reads | Static hero, one message, one CTA |
| Key CTA hidden below the fold | Surface it above the fold; repeat it lower down |

**In short:** A website has seconds to say who you are and what to do next; use familiar navigation and earn the scroll with a clear value proposition up top.

---

## Web apps and SaaS dashboards

A dashboard is a screen that shows a person the state of their work or business at a glance. "SaaS" means Software as a Service, that is, software you use in a browser by subscription. Think of a dashboard as a car's instrument panel. A good panel shows speed and fuel first, and hides the engine diagnostics until you ask.

### Data density and progressive disclosure

**The single most common dashboard mistake is showing everything at once.** The old belief that a serious tool must cram every chart above the fold is over. A wall of 20 widgets does not look powerful. It looks like noise.

The fix is **progressive disclosure** — a fancy name for a simple idea: show the one thing that answers *"is everything okay?"* first, then let people drill into detail only when they want it. It is a menu that shows the dishes first and the ingredient list on request.

- Start with **5 to 7 summary cards**, then expand on demand. This respects Miller's Law (people hold about 4 to 7 chunks at once).
- Build in layers: **(1) overview** — high-level numbers; **(2) context** — hovering reveals trends; **(3) detail** — clicking opens the full report.
- This is not just tidier. It changes behavior. Research on SaaS dashboards found that users shown a *simple, clear* day-one screen **activate at higher rates** (activation means reaching the first moment of real value) than users shown a complex one — even when the complex version technically holds more information. A lead-with-the-summary layout is understood correctly on the first try far more often than an everything-at-once layout.

### Empty states are onboarding

An "empty state" is what a screen shows when there is no data yet — a brand-new account with nothing in it. Most teams leave it blank. That is a wasted moment, and a dangerous one.

The blank first-day screen, where new users see nothing, **hits hardest the very users most likely to churn** (churn means to quit and leave). They get no signal that the product solves their problem, so they leave. Treat the empty state as an onboarding moment, not a dead end:

- Show a preview of what the populated view *will* look like.
- Add sample or skeleton data so the screen feels alive.
- Give one clear next step: a primary "Add your first project" button.

### Tables and charts

A data table is a grid of rows and columns. NN/G found that tables serve four user tasks: **look up a value, compare values, find related data, and analyze or act.** Design so all four are easy.

Practical rules that make numbers scannable:

- **Left-align text; right-align numbers.** Right-aligning numbers lines up the ones, tens, and hundreds down a column, so people can compare sizes at a glance.
- **Align decimal points** and show a consistent number of decimal places.
- **Use tabular (monospace) figures** — digit shapes with equal width — so numbers line up cleanly.
- **Align column headers to their content.** A numeric header should be right-aligned to match its numbers.
- Add readability aids: **zebra striping** (shading every other row), bold headers, sticky headers that stay visible while scrolling, and light color or icons for key cells.
- Pair a table with a chart. Do not force people to graph the numbers in their head.

### Onboarding

Onboarding is the first-run experience that teaches a new user the product. Do not force an eight-step tour that people click through blindly. Use contextual, just-in-time guidance — empty states, tooltips, and checklists — tied to the user's first "aha" action. First-run simplicity beats feature-completeness.

### Dashboard mistakes and fixes

| Mistake | Fix |
|---|---|
| 20+ widgets crammed above the fold | 5 to 7 summary cards, drill down on demand |
| Blank empty state on day one | Preview + sample data + "add first item" CTA |
| Numbers left-aligned in tables | Right-align numbers, align decimals, tabular figures |
| Forced 8-step product tour | Contextual onboarding tied to first value |
| Every metric weighted equally | One "is everything okay?" metric leads the hierarchy |

**In short:** A dashboard should answer "is everything okay?" first and reveal detail on demand; lead with 5 to 7 summary cards and turn the empty state into onboarding.

---

## Mobile apps: iOS and Android

A phone is held in one hand, on the move, with a thumb doing the work. That single fact drives most mobile design decisions.

### Touch target sizes (memorize these)

A "touch target" is the tappable area of a button or link. A fingertip is blunt, so targets must be big enough to hit without missing.

- **iOS Human Interface Guidelines (Apple's rulebook): minimum 44 by 44 points.** A "point" is Apple's density-independent unit; think of it as roughly one fingertip.
- **Android Material Design (Google's rulebook): minimum 48 by 48 dp.** A "dp" is a density-independent pixel, about 9 mm of physical space no matter the screen.
- **Accessibility floor:** WCAG 2.1 asks for 44 by 44 CSS pixels; WCAG 2.2 adds a lower bound of 24 by 24 px. (More on this in the accessibility chapter.)
- **Why these numbers exist:** MIT's Touch Lab measured real fingers. The average finger pad is **10 to 14 mm**, a fingertip **8 to 10 mm**, and a thumb's contact area is about **2.5 cm (1 inch)** wide. The minimums simply match human fingers.
- **Spacing:** leave about **8 to 12 px** (up to 48 px) between targets so people do not tap the wrong one.

### Thumb zones

Steven Hoober's field study of people using phones in the wild found that **about 49% hold the phone one-handed and drive with the thumb.** That thumb can reach some places easily and others only by stretching or shifting grip. This gives three zones:

```
+---------------------+
|   HARD   |   HARD   |   <- top corners: shift grip
|          |          |
|      STRETCH        |   <- reachable with effort
|                     |
|   NATURAL / EASY    |   <- bottom third: put it here
|   [ primary action ]|
+---------------------+
```

The lesson: put **primary actions in the bottom third** — the bottom navigation bar, the main CTA, the floating action button. Put rare or destructive actions in the hard-to-reach corners, where an accidental tap is unlikely. On large phones, the top-left is the worst spot of all.

### iOS versus Android conventions

iOS and Android are two different countries with two different sets of road signs. Follow the local signs. Jakob's Law again: an iPhone user expects iPhone behavior, an Android user expects Android behavior.

| Aspect | iOS (HIG) | Android (Material) |
|---|---|---|
| Primary nav location | Bottom tab bar | Bottom navigation bar (Material 3) |
| Tab item behavior | Returns to the **last screen viewed**, state kept | Resets to the destination's **top-level screen** |
| Back gesture | Swipe left-to-right = **back** to previous screen | Swipe left-to-right = **switch tabs**; system back is an edge swipe |
| Section transition | — | In-place cross-fade preferred; a lateral slide falsely implies swiping between peers |
| Min touch target | 44 by 44 pt | 48 by 48 dp |

### Bottom navigation rules

- Hold **3 to 5 items** (Material's guidance). Fewer than 3, use tabs or nothing. More than 5, use a drawer or a "More" tab.
- Use it for **top-level, mutually-exclusive destinations** (Home, Search, Profile) — not for actions like "Share."

### Gestures

A gesture is a touch motion, like a swipe. The catch: gestures are invisible. Nobody can see a swipe the way they see a button.

- **Respect platform gestures.** iOS edge-swipe means back. Android edge-swipe is the system back. Do not hijack these.
- **Always give a visible fallback.** If an important action lives behind a hidden swipe, also offer a button people can see. Hidden-only gestures are undiscoverable.

### Mobile mistakes and fixes

| Mistake | Fix |
|---|---|
| Tiny 30 px tap targets | 44 pt (iOS) / 48 dp (Android) minimum |
| Primary CTA at the top of a tall screen | Move it to the bottom-third thumb zone |
| More than 5 bottom-nav items | Trim to 3 to 5; use "More" for overflow |
| One layout ignoring the platform | Follow HIG on iOS, Material on Android |
| Gesture-only actions, no visible control | Add a discoverable button as a fallback |

**In short:** Mobile is one-handed and thumb-driven; size targets to real fingers, put primary actions in the bottom third, and follow each platform's own conventions.

---

## Landing pages

A landing page is a single page built to make one thing happen, usually where an ad or email "lands." It is not a website. A website is a department store with many aisles. A landing page is a single sales counter with one item on it.

### One goal per page

A high-converting landing page has exactly **one conversion goal.** Every element — headline, copy, image, button, form — points at that one action. If other options exist, make them visually secondary.

A powerful trick: **remove the site navigation.** With no menu, there is no escape hatch. Designers call this the "attention ratio" — the number of things you can click versus the number of things you want people to do. A focused landing page aims for about 1:1.

### Hero and headline clarity

The hero is the top block: headline, sub-line, image, and button. The headline must answer *"What's in it for me?"* within about **5 seconds.** A simple test: if a stranger cannot explain your offer after reading only the headline, it is too vague.

Proven headline formulas:

- **"How to [achieve goal] without [pain]."** Example: "How to file taxes without spreadsheets."
- **Lead with the ultimate benefit** as the headline, and put the plain "what it is" underneath as a qualifier.

On numbers: KlientBoost cites headline optimization lifting conversions by as much as **67.8%**. Treat figures like that as directional — a sign of how much headlines matter — not a promise.

### CTA design

A CTA (call to action) is the button you want clicked. Rules:

- **Use one consistent CTA, repeated at the right moments:** in the hero, again mid-page after you have built desire, and again near the end.
- **Wording changes results.** In a well-known test, switching a button from **"Sign up for free" to "Trial for free" lifted trial-starts by 104%** — because "trial" feels low-commitment and exploratory, while "sign up" feels like a bigger step.
- **Make it visually dominant** with strong color contrast and generous size (Fitts's Law), using a benefit-driven verb: "Get my free plan."

### Conversion benchmarks

Unbounce's 2024 Conversion Benchmark Report, built on more than 57 million conversions, found the cross-industry **median landing-page conversion is about 6.6%**, ranging from roughly **3.8% for SaaS to about 12.3%** in the highest industries. Use this as a reality check: "good" depends on your industry.

### Landing-page mistakes and fixes

| Mistake | Fix |
|---|---|
| Multiple competing goals and CTAs | One goal, one primary CTA repeated |
| Full site navigation present | Strip the nav; keep attention on the offer |
| Clever but vague headline | State the benefit; pass the 5-second test |
| Weak, low-contrast button | Large, high-contrast, benefit-driven CTA |
| No social proof near the CTA | Add testimonials, logos, or ratings by the ask |

**In short:** A landing page has one job; point every element at a single goal, pass the 5-second headline test, and repeat one clear CTA.

---

## E-commerce and product listings

An online shop must do what a good salesperson and a well-stocked store do at once: show the product clearly, answer doubts, build trust, and make paying painless. The research here is the strongest in this whole chapter, thanks to the Baymard Institute, which scores tens of thousands of real product pages.

### Product page anatomy

The product page (often called the PDP, product detail page) is where a shopper decides. Baymard's benchmark of more than 30,000 scored product pages found that only about **48% of top US and EU desktop sites have "decent or good" product-page UX**, and **no site is "perfect."** The average site carries about **24 structural usability issues** on its product pages. There is enormous room to do better.

Core anatomy of a strong PDP:

- Image gallery
- Title
- Price plus any savings
- Variant selectors (size, color)
- Stock and availability
- **The "Buy Section"** — add-to-cart, shipping, returns
- Description and specifications
- Reviews
- Related products

**The Buy Section is where the decision happens, yet it is one of the weakest areas on most sites.** At minimum, show the **lowest possible shipping cost** right there. Naming a real number early builds trust and cuts abandonment.

### Images: the single biggest lever

Product images matter more than anything else on the page. Research cited by Baymard found that about **67% of shoppers name image quality the top factor** in their buying decision — ahead of description, reviews, and price.

So do not ship a single small photo. Offer multiple *types* of image:

- **Technical / compatibility** shots (what it is, how it fits)
- **Lifestyle** shots (the product in real use — show, don't tell)
- **User photos (UGC)** — real customers, real contexts
- **Scale references** so people judge size
- **Zoom** to inspect detail

And add **video.** Shoppers who watch a product video are about **144% more likely to add the item to cart.**

### Reviews and social proof

Show the star rating, the number of reviews, and **real customer photos.** Shoppers want to see an item on real people and in real settings before they trust it. Placing reviews near the buy area lowers the sense of risk right when the decision is made.

### Pricing display

- Show the price clearly, with any discount framed simply.
- For sized goods, show a **unit price** (per oz, per ml) so comparison is fair.
- **Show the total cost early.** Hidden costs are the number-one reason people abandon carts, which brings us to the headline research.

### Layout: tabs versus accordions

Many sites hide the description, specs, and reviews behind horizontal tabs. Baymard found that **horizontal tabs cause about 27% of users to miss important content** — they simply do not notice the other tabs exist. Use **vertical collapsed sections (accordions)** instead. An accordion stacks labeled sections you can expand in place, and it tests far better because nothing is hidden off to the side.

### Checkout and cart abandonment

This is the most important e-commerce research to know. "Cart abandonment" means a shopper adds items but leaves without buying.

- **The average cart abandonment rate is about 70.2%** — the mean across 50 studies from 2006 to 2025, with a range of 55% to 84.3%. In other words, roughly 7 in 10 filled carts are left behind.
- **Mobile is worse (about 80%) than desktop (about 66%).**

Why do people abandon? Setting aside "just browsing" (itself about 43% of cases), the top reasons are:

| Reason | Share |
|---|---|
| Extra costs too high (shipping, tax, fees) — #1 for six straight years | **39%** |
| Delivery too slow | 21% |
| Didn't trust the site with card info | 19% |
| Forced to create an account | **19%** |
| Checkout too long or complicated | 18% |
| Unsatisfactory return policy | 15% |
| Site errors or crashes | 15% |
| Couldn't see the total cost up front | 14% |
| Not enough payment options | 10% |
| Card declined | 8% |

On form length: the average checkout shows about **23.5 form elements by default**, but the ideal is **12 to 14 elements (7 to 8 actual fields).** Most sites can cut **20% to 60%** of their fields. Baymard estimates that better checkout UX could recover about **$260 billion** in lost orders across the US and EU, and lift the average large site's conversion by around **35.3%.**

### Checkout best practices, mapped to the data

Notice how each fix targets a specific number above:

- **Offer guest checkout.** This directly kills the 19% who abandon because they were forced to create an account.
- **Show all costs early**, including shipping, before the final step. This attacks the 39% surprised by extra costs and the 14% who couldn't see the total.
- **Add trust signals** near payment — security badges, recognizable payment logos — for the 19% worried about card security.
- **Use a progress bar** on multi-step checkout. People quit less when they can see the finish line.
- **Offer multiple payment methods** (cards, PayPal, Apple Pay, Google Pay). This especially lifts mobile completion.
- **Reduce fields** with autofill, address lookup, and combined name fields.

### E-commerce mistakes and fixes

| Mistake | Fix |
|---|---|
| Surprise fees at the final step | Show total incl. shipping and tax early |
| Forced account creation | Offer guest checkout |
| Horizontal tabs hiding specs (27% miss) | Vertical accordions |
| Low-quality or single image | Multiple image types + zoom + video |
| 23-field checkout | Trim to 12 to 14 elements; autofill |
| No progress indicator | Add a step progress bar |

**In short:** Online shoppers buy on strong images and abandon on surprise costs and forced friction; show great imagery, name all costs early, allow guest checkout, and cut the checkout to 7 or 8 fields.

---

## Forms and surveys

A form is any place where a user types information: a signup, a checkout, a survey, a contact box. Forms live on every surface above, so these rules travel everywhere. A form is a conversation. Every question you ask is a small favor you request. Ask for too many, and people walk away.

### Field reduction

**Fewer fields means higher completion.** Baymard found the average checkout has about **11.8 form fields**, and that cutting complexity yields a **20% to 60%** reduction in visible fields. Every field is a tax on the user. Ask only what you truly need right now, and defer the rest.

### Label placement

A "label" is the text that says what a field is for ("Email address"). Where you put it matters more than you would guess.

- **Top-aligned labels are best in most cases.** Placing the label directly above the field cuts completion time by as much as **50%** compared with left-aligned labels, because the eye reads the label and the field in one smooth downward glance.
- **Never use inline labels** — that is, using the faint placeholder text inside a field *as* the label. The moment someone starts typing, the label vanishes, and they forget what the field was for. This is especially harmful on mobile. Baymard is blunt about it: never use inline labels.

```
Top-aligned (good)          Placeholder-as-label (bad)
+---------------------+     +---------------------+
| Email address       |     | [ Email address   ] |  <- disappears
| [                 ] |     +---------------------+     once you type
+---------------------+
```

### Inline validation

"Inline validation" means checking a field as the user finishes it and showing feedback right there, instead of waiting for the final submit. Baymard found that about **31% of e-commerce sites fail to provide it.**

- Validate each field **on blur** — the moment the user clicks or tabs away from it. That is when an error is cheapest to fix, because the person is still thinking about that field.
- **Confirm success too.** A small green check reassures people they got it right, not just red errors when they get it wrong.
- The payoff is large: NN/G found that usability-optimized forms can **nearly double first-attempt completion rates** across many form types, industries, and markets.

### Single-step versus multi-step

A single-step form shows everything on one screen. A multi-step form breaks the questions into a few smaller screens with a progress bar.

- **Multi-step forms can convert about 86% higher** than single-step for long forms — *but only* with clean error handling across steps.
- With multi-step: validate the current step before "Next," block advancing on an error, and mark any errored step in the progress bar.
- The single-step trap: dumping a **wall of red errors** on a 15-field form after submit is one of the fastest ways to kill conversion.
- Rule of thumb: **short forms → single step; long or complex forms → multi-step with a progress bar,** chunked into logical groups (Miller's Law again).

### Error message wording

When something goes wrong, the words you choose decide whether people recover or rage-quit. Make errors **specific, actionable, and polite.**

- "Please check your ZIP code format" beats "ZIP code is wrong," which beats a useless "Invalid input" or "Error."
- Place the message **inline, next to the field it refers to** — not only in a summary at the top.
- **Preserve what the user typed.** Never wipe the whole form because of one mistake.

### Form mistakes and fixes

| Mistake | Fix |
|---|---|
| Placeholder used as the label | Persistent top-aligned label |
| Left-aligned labels (slow scan) | Top-aligned (up to 50% faster) |
| Validate only on submit | Inline validation on blur, plus success ticks |
| One giant single-step form | Multi-step with a progress bar for long forms |
| "Invalid input" errors | Specific, polite, actionable, inline messages |
| Asking every field "just in case" | Ruthless field reduction; defer optional ones |

**In short:** A form is a conversation, so ask for as little as possible, label fields clearly above them, validate as people go, and write errors that tell people exactly how to fix them.

---

## Common Mistakes

- **Reinventing familiar patterns.** Moving the cart, renaming the menu, or building a custom checkout breaks Jakob's Law. *Fix:* copy the conventions users already know; save creativity for your actual product.
- **Hiding navigation above a banner.** Banner blindness makes people skip it entirely. *Fix:* place nav directly next to content, with no banner above.
- **Cramming a dashboard with 20+ widgets.** It reads as noise and lowers activation. *Fix:* lead with 5 to 7 summary cards and use progressive disclosure.
- **Leaving the empty state blank.** It hits your most churn-prone users hardest. *Fix:* preview + sample data + an "add your first item" button.
- **Left-aligning numbers in tables.** It makes columns impossible to compare. *Fix:* right-align numbers, align decimals, use tabular figures.
- **Tap targets under 44 pt / 48 dp.** People miss and get frustrated. *Fix:* meet the platform minimums and space targets 8 to 12 px apart.
- **Primary action at the top of a tall phone screen.** The thumb cannot reach it. *Fix:* move primary actions to the bottom third.
- **Landing pages with a full menu and many goals.** Attention leaks away. *Fix:* strip the nav and commit to one goal, one repeated CTA.
- **Vague headlines.** If a stranger cannot explain your offer in 5 seconds, you lose them. *Fix:* lead with the benefit; use "How to [goal] without [pain]."
- **Surprise costs and forced accounts at checkout.** These are the #1 (39%) and a tied-top (19%) abandonment causes. *Fix:* show all costs early and offer guest checkout.
- **Horizontal tabs on product pages.** About 27% of users miss the hidden content. *Fix:* use vertical accordions.
- **Placeholder-as-label and submit-only validation.** Labels vanish and errors arrive too late. *Fix:* top-aligned persistent labels and inline validation on blur.

---

## Best Practices Checklist

**Websites**
- [ ] Value proposition and primary CTA visible above the fold
- [ ] Navigation next to content, grouped into ~5 to 7 categories, no banner above it
- [ ] Homepage answers who/what/why/next in seconds

**Dashboards / web apps**
- [ ] Lead with 5 to 7 summary cards; drill-down on demand
- [ ] One "is everything okay?" metric leads the hierarchy
- [ ] Empty states show a preview, sample data, and a next step
- [ ] Numbers right-aligned, decimals aligned, tabular figures
- [ ] Onboarding is contextual, tied to the first "aha" moment

**Mobile**
- [ ] Tap targets at least 44 pt (iOS) / 48 dp (Android), spaced 8 to 12 px
- [ ] Primary actions in the bottom third thumb zone
- [ ] 3 to 5 bottom-nav items for top-level destinations
- [ ] Platform conventions followed (back gesture, tab behavior)
- [ ] Every gesture has a visible fallback control

**Landing pages**
- [ ] One goal, one primary CTA repeated; site nav removed
- [ ] Headline passes the 5-second "what's in it for me?" test
- [ ] Button is large, high-contrast, benefit-driven
- [ ] Social proof sits near the CTA

**E-commerce**
- [ ] Multiple image types + zoom + video on the product page
- [ ] All costs, including shipping, shown early
- [ ] Guest checkout offered; trust signals near payment
- [ ] Product info in vertical accordions, not horizontal tabs
- [ ] Checkout trimmed to ~12 to 14 elements with a progress bar

**Forms**
- [ ] Only essential fields; optional ones deferred
- [ ] Top-aligned persistent labels (never placeholder-as-label)
- [ ] Inline validation on blur, with success confirmation
- [ ] Long forms split into multi-step with a progress bar
- [ ] Errors are specific, polite, actionable, and inline; typed data preserved

---

## Key Takeaways

- **The principles are constant; the surface changes the application.** Clarity, hierarchy, feedback, and low friction apply everywhere, but each surface has its own conventions, failure modes, and benchmarks.
- **Four laws travel with you:** Jakob's (be familiar), Hick's (fewer choices), Fitts's (bigger, closer targets), and Miller's (4 to 7 chunks).
- **Attention is top-heavy.** About 74% of viewing time is spent in the top two screenfuls, so earn the scroll with a clear value proposition and CTA up top.
- **Less is more on data screens.** Leading with 5 to 7 summary cards and revealing detail on demand raises activation more than showing everything at once.
- **Mobile is thumb-first.** Roughly half of users work one-handed, so honor the 44 pt / 48 dp target minimums and keep primary actions in the bottom third.
- **A landing page has exactly one job.** Remove distractions, pass the 5-second headline test, and repeat one clear CTA — wording alone (like "Trial" vs "Sign up") can shift results by 104%.
- **Images sell and hidden costs kill.** About 67% of shoppers rank image quality first, while surprise fees (39%) and forced accounts (19%) drive most of the ~70% average cart abandonment.
- **Cut the checkout and the form.** Aim for 7 to 8 real fields, use top-aligned labels (up to 50% faster), validate inline, and split long forms into steps for up to 86% higher conversion.
- **Every number here is a benchmark, not a guarantee.** Use them to know what "good" looks like, then test against your own audience.
