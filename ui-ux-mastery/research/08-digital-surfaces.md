# Chapter 08 — Designing Digital Products: Websites, Apps, Dashboards, Landing Pages, E-commerce

Research notes for the chapter writer. Everything below is sourced; concrete numbers are cited inline and collected in the Sources section. The through-line: the same UX principles (clarity, hierarchy, feedback, reduced friction) apply everywhere, but each *surface* has its own conventions, failure modes, and benchmarks. This chapter is about **applying** principles per surface.

---

## 0. The cross-cutting laws you apply on every surface (plain English)

Before surface-specific advice, four psychology "laws" recur throughout. They're the reusable toolkit.

- **Jakob's Law** — Users spend most of their time on *other* sites/apps, so they expect yours to work the same way. Don't reinvent the checkout, the nav, or the hamburger icon. Familiar = intuitive. (Source: Laws of UX, UX Design Institute.)
- **Hick's Law** — The more choices you show, the longer the decision takes. Fewer, clearer options convert better. A pricing page with 3 plans converts better than one with 5. Applies to nav menus, CTAs, product filters.
- **Fitts's Law** — Time to hit a target depends on its *size* and *distance*. Bigger, closer buttons are faster to tap. This is why primary buttons are large and why mobile CTAs live in the thumb zone.
- **Miller's Law** — Working memory holds roughly **7 (±2), realistically 4–7 chunks** at once. Chunk information; don't dump 20 dashboard widgets at once. (Sources: Laws of UX; SaaS dashboard research citing "4–7 chunks.")

Rule of thumb: *"Not every law applies to every context — learn all of them, apply the ones that match what the interface asks the user to do."*

---

## 1. WEBSITES (marketing / content / corporate sites)

### Navigation patterns
- Primary navigation must sit in a **highly noticeable place, directly adjacent to the main body** of the page. Group similar items together so users see the breadth of what's offered and can differentiate categories. (Source: NN/G, *113 Design Guidelines for Homepage Usability.*)
- **Banner blindness**: users ignore anything inside or above a rectangular banner-like shape at the top. Don't put top nav *above* a horizontal rule or banner graphic, or people will skip it. (Source: NN/G homepage guidelines.)
- Standard, expected patterns (Jakob's Law): logo top-left linking home, horizontal top nav, search top-right, footer "fat" nav for everything else. Deviating costs comprehension.
- Common desktop pattern count: keep top-level nav to a scannable handful; overflow goes into grouped dropdowns or the footer.

### Homepage clarity
NN/G's homepage research (113 guidelines) stresses the homepage must answer, within seconds: *Who are you? What do you offer? Why you over alternatives? What do I do next?* Tagline and value proposition must be explicit, not clever-but-vague.

### Above the fold ("the fold")
- The most critical elements must be visible in the first screenful, before scrolling. (Source: NN/G, *The Fold Manifesto.*)
- **~74–84% of user attention concentrates above the fold.** NN/G eye-tracking: about **74% of viewing time is spent in the top two screenfuls**; the average difference in how users treat info above vs. below the fold is **84%**. (Source: NN/G, *Scrolling and Attention.*)
- Nuance for modern design: users *do* scroll (they're used to it), so the fold is not a hard wall — but it *is* where you must earn the scroll. Put a strong value proposition + primary CTA above the fold and use visual cues (partially visible content, arrows) to invite scrolling. (Sources: NN/G Fold Manifesto; LogRocket "above the fold needs to change.")

### Common website mistakes → fixes
| Mistake | Fix |
|---|---|
| Vague hero headline ("Welcome to our site") | State the value proposition + who it's for |
| Nav buried above a banner (banner blindness) | Place nav adjacent to content, no banner above it |
| Too many top-level nav items (Hick's Law) | Group into ~5–7 categories, push rest to footer |
| Carousel/slider hero nobody reads | Static hero with one message + one CTA |
| Critical CTA below the fold | Surface it above the fold; repeat lower down |

---

## 2. WEB APPS & SaaS DASHBOARDS

### Data density & progressive disclosure
- **The #1 dashboard mistake is showing everything at once.** The old "compete on density" era (cram every chart above the fold) is over. (Source: Zynra, SaaS dashboard patterns; saasui.design.)
- **Progressive disclosure** = surface the one metric that answers *"is everything okay?"* first, then let users drill into detail on demand. Start with **5–7 summary cards**, expand on request. This respects working memory (**humans hold ~4–7 chunks**, Miller's Law). (Sources: Zynra; SaaS analytics UX 2026.)
- Layered structure: **(1) overview** — high-level KPIs; **(2) context** — hover interactions reveal trends; **(3) detail** — click into full reports. (Source: Pencil & Paper, data dashboards.)
- Activation impact: users shown a *simple, clear* day-one dashboard **activate at higher rates** than users shown a complex one — even when the complex version technically holds more value. Lead-with-summary layouts are understood correctly on first try far more often than everything-at-once layouts. (Source: SaaS dashboard research, Zynra/userpilot.)

### Empty states = onboarding
- Treat the empty state as an onboarding moment, not a dead end. Show what the populated view *will* look like + one clear next step. (Source: Zynra; multiple SaaS UX sources.)
- The blank empty dashboard "where new users see nothing" **disproportionately affects the users most likely to churn** — they get no signal the product solves their problem. Fix: skeleton/preview data, sample content, a primary "add your first X" CTA.

### Tables & charts (data-heavy UI)
Data tables serve four user tasks (NN/G): **look up a value, compare values, find related data, analyze/act.** Design so all four are easy. (Source: NN/G, *Data Tables: Four Major User Tasks.*)
- **Left-align text; right-align numbers** (right-alignment lets users compare magnitudes down a column). Align decimals; show consistent decimal places. (Source: Pencil & Paper; Justinmind.)
- **Align column headers to their content** (numeric headers right-aligned) — misalignment creates visual noise.
- Use **monospace/tabular figures for numbers** so digits line up and scan cleanly.
- Readability aids: **zebra striping** (alternating rows), bold headers, subtle color for key cells, icons/progress bars/color-coding, sticky headers, and grouping related rows.
- Pair tables with complementary charts; don't make users mentally graph the numbers.

### Onboarding
Best practice: don't force a long tour. Use contextual, progressive onboarding (empty states, tooltips, checklists) tied to the user's first "aha" action. First-run simplicity beats feature-completeness.

### Common SaaS/dashboard mistakes → fixes
| Mistake | Fix |
|---|---|
| 20+ widgets crammed above the fold | 5–7 summary cards, drill-down on demand |
| Blank empty state on day one | Preview + sample data + "add first item" CTA |
| Numbers left-aligned in tables | Right-align numbers, align decimals, tabular figures |
| Forced 8-step product tour | Contextual, just-in-time onboarding tied to first value |
| Every metric weighted equally | Establish visual hierarchy; one "is everything okay?" metric leads |

---

## 3. MOBILE APPS (iOS & Android)

### Touch target sizes (memorize these numbers)
- **iOS Human Interface Guidelines: minimum 44×44 pt.** Matches the average fingertip. (Source: Apple HIG, via Design+Code / DesignMonks.)
- **Android Material Design: minimum 48×48 dp** (≈ 9 mm physical, regardless of screen density). (Source: Material Design touch target docs; Android Accessibility Help.)
- **WCAG 2.1 (AA) Target Size:** 44×44 CSS px minimum; **WCAG 2.2 adds 24×24 px** as a lower AA floor (2.5.8). (Cross-reference the accessibility chapter.)
- **MIT Touch Lab:** average finger pad **10–14 mm**, fingertip **8–10 mm**; thumb impact area ≈ **2.5 cm (1 inch)** wide. This is *why* the minimums exist. (Source: NN/G, *Touch Target Size*; DesignMonks.)
- **Spacing:** leave **~8–12 px (up to 48 px) between targets** to prevent mis-taps.

### Thumb zones
- Steven Hoober's field study: **~49% of users hold the phone one-handed and drive with the thumb.** This defines three reach zones: **natural/easy** (bottom-center), **stretch** (reachable with effort), and **hard** (top corners, need to shift grip). (Source: Hoober study, via UXPin/DesignMonks/Smashing.)
- Consequence: put **primary actions in the bottom third** of the screen (bottom nav, primary CTA, FAB), destructive/rare actions in the hard-to-reach corners. Large phones make the top-left the worst spot.

### iOS HIG vs Android Material conventions (know the differences)
| Aspect | iOS (HIG) | Android (Material) |
|---|---|---|
| Primary nav location | **Bottom tab bar** | **Bottom navigation bar** (M3) — but historically **top tabs** for view control |
| Tab item behavior | Returns to **last screen viewed, state preserved** | Resets to destination's **top-level screen** (scroll/tab/search reset) |
| Back gesture | **Swipe left-to-right = back** to previous screen | Swipe left-to-right = **switch tabs**; system back gesture is edge-swipe |
| Section transition | — | **In-place cross-fade** recommended; lateral slides imply peer swipe that doesn't exist |
| Min touch target | 44×44 pt | 48×48 dp |
(Sources: Material Design *Bottom navigation* / *Navigation bar* docs; UXPin mobile navigation.)

### Bottom navigation rules
- Contain **3–5 items** (Material). Fewer than 3 → use tabs or nothing; more than 5 → use a drawer or "More" tab.
- Use for **top-level, mutually-exclusive destinations**, not actions.

### Gestures
- Respect platform gesture expectations (Jakob's Law): iOS edge-swipe = back; Android edge-swipe = system back. Don't hijack these.
- Provide **visible affordances** for gestures — hidden gestures are undiscoverable; always offer a visible fallback control.

### Common mobile mistakes → fixes
| Mistake | Fix |
|---|---|
| Tiny 30 px tap targets | 44 pt (iOS) / 48 dp (Android) minimum |
| Primary CTA at top of tall screen | Move to bottom-third thumb zone |
| >5 bottom-nav items | Trim to 3–5, use "More" for overflow |
| Same layout ignoring platform | Follow HIG on iOS, Material on Android (nav behavior, back gesture) |
| Gesture-only actions, no visible control | Add discoverable buttons as fallback |

---

## 4. LANDING PAGES

### One goal per page
A high-converting landing page is built around a **single conversion goal**; every element (headline, copy, imagery, CTA, form) points at one action. If alternatives exist, make them **visually secondary**. Remove the site nav so there's no escape hatch ("attention ratio" ≈ 1:1). (Sources: Lovable landing-page guide; Unbounce.)

### Hero & headline clarity
- The headline must answer *"What's in it for me?"* within **~5 seconds.** If a stranger can't explain your offer after reading the headline, you have a clarity problem. (Source: OptimizePress / KlientBoost.)
- Proven headline formulas: **"How to [achieve goal] without [pain]"**; lead with the **ultimate benefit / USP** as the headline and the "what it is" underneath as the qualifier.
- Numbers: KlientBoost cites headline optimization lifting conversions up to **67.8% better**; treat as directional, not guaranteed.

### CTA design
- **One consistent CTA**, repeated strategically: in the hero, again mid-page after building desire, again near the end.
- Copy matters: changing **"Sign up for free" → "Trial for free" lifted trial-start rate 104%** (framing the action as low-commitment/exploratory). (Source: landing page CTA case study, Unbounce.)
- Make the button visually dominant (color contrast, size — Fitts's Law), first-person or benefit-oriented verb ("Get my free plan").

### Conversion benchmarks
- **Unbounce 2024 Conversion Benchmark Report (57M+ conversions):** cross-industry **median landing-page conversion ≈ 6.6%**, ranging from **~3.8% (SaaS) to ~12.3%** by industry. Use as a reality check — "good" is industry-relative.

### Common landing-page mistakes → fixes
| Mistake | Fix |
|---|---|
| Multiple competing goals/CTAs | One goal, one primary CTA repeated |
| Full site nav present | Strip nav; keep attention on the offer |
| Clever but vague headline | State the benefit; pass the 5-second test |
| Weak/low-contrast button | Large, high-contrast, benefit-driven CTA |
| No social proof near CTA | Add testimonials, logos, ratings by the ask |

---

## 5. E-COMMERCE & PRODUCT LISTINGS

### Product page anatomy (Baymard)
- Only **~48%** of top US/EU desktop sites have "decent/good" product-page UX; **no site is "perfect."** The average site has **~24 structural usability issues** on its product pages. (Source: Baymard, *Product Page UX Best Practices 2026*; benchmark of 30,000+ scored product pages.)
- Core anatomy: gallery, title, price + savings, variant selectors (size/color), stock/availability, the **"Buy Section"** (add-to-cart, shipping, returns), description, specs, reviews, related products.
- **The Buy Section is where the decision happens — yet it's one of the weakest areas on most sites.** Show at least the **lowest possible shipping cost** here to build trust and cut abandonment.

### Images (the single biggest lever)
- **Product imagery is the most influential element on a PDP; ~67% of shoppers name image quality the top factor** in buying decisions — above descriptions, reviews, or price. (Source: Baymard-cited PDP research.)
- Provide multiple image *types*: **technical/compatibility, lifestyle ("show don't tell"), user/UGC photos, scale references, zoom.**
- **Video:** shoppers who watch product video are **~144% more likely to add to cart.**

### Reviews & social proof
Show ratings, review count, and **real customer photos/UGC**. Shoppers want to see items on real people / in real contexts. Reviews near the buy area reduce risk perception.

### Pricing display
- Show price clearly with any discount/savings framing.
- For sized goods, show **unit price** (per oz/lb/ml) so comparison is fair.
- **Show total cost early** — hidden costs are the #1 abandonment cause (below).

### Layout: tabs vs. accordions
- **Horizontal tabs cause ~27% of users to miss important details.** Use **vertical collapsed sections (accordions)** instead — they test far better and prevent overlooked content. (Source: Baymard.)

### Checkout & cart abandonment (Baymard — the headline research)
- **Average cart abandonment ≈ 70.2%** (mean of 50 studies, 2006–2025; range 55%–84.3%). **Mobile abandons more (~80%) than desktop (~66%).** (Source: Baymard, *Cart Abandonment Rate Statistics*.)
- **Top reasons users abandon (excluding "just browsing," which itself is ~43%):**
  1. **39% — extra costs too high** (shipping/tax/fees) — #1 cause for six straight years
  2. **21%** — delivery too slow
  3. **19%** — didn't trust site with card info (security)
  4. **19% — forced to create an account**
  5. **18% — checkout too long/complicated**
  6. 15% — unsatisfactory return policy
  7. 15% — site errors/crashes
  8. 14% — couldn't see total cost up front
  9. 10% — not enough payment options
  10. 8% — card declined
- **Form length:** average checkout displays **~23.5 form elements by default**; the **ideal is 12–14 elements (7–8 actual fields).** Most sites can cut **20–60%** of fields. (Source: Baymard.)
- **Opportunity:** better checkout UX could recover **~$260B** in lost orders (US+EU) and lift the average large site's conversion by **~35.3%.**

### Checkout best practices (the fixes, mapped to the data)
- **Offer guest checkout** (kills the 19% "forced account creation" abandonment).
- **Show all costs early**, including shipping, before the final step (kills the 39% + 14%).
- **Trust signals** near payment (security badges, recognizable logos) for the 19% security worry.
- **Progress bar** on multi-step checkout — people are less likely to quit when they can see the finish line.
- **Multiple payment methods** (cards, PayPal, Apple/Google Pay) — especially lifts mobile completion.
- **Reduce fields**: autofill, address lookup, combine name fields, hide optional fields.

### Common e-commerce mistakes → fixes
| Mistake | Fix |
|---|---|
| Surprise fees at final step | Show total incl. shipping/tax early |
| Forced account creation | Offer guest checkout |
| Horizontal tabs hiding specs (27% miss) | Vertical accordions |
| Low-quality / single image | Multiple image types + zoom + video |
| 23-field checkout | Trim to 12–14 elements; autofill |
| No progress indicator | Add step progress bar |

---

## 6. FORMS & SURVEYS (applies across every surface)

### Field reduction
- **Fewer fields = higher completion.** Baymard: average checkout has **~11.8 form fields**; cutting complexity yields **20–60% reduction** in default visible fields. (Source: Baymard, *Form Design*.)
- Every field is a tax — ask only what you truly need now; defer the rest.

### Label placement
- **Top-aligned labels are best in most cases** — they cut completion time by up to **~50%** vs. left-aligned, because label + field are read in a single downward eye fixation. (Source: CXL / Baymard.)
- **Never use inline (placeholder-as-label) labels**, especially on mobile — the label vanishes once typing starts, causing errors and forgotten context. (Source: Baymard, *Mobile Form Usability: Never Use Inline Labels.*)

### Inline validation
- **~31% of e-commerce sites fail to provide inline validation.** (Source: Baymard.)
- Validate each field **on blur** (after the user leaves it), giving feedback at the moment errors are cheapest to fix. NN/G: usability-optimized forms can **nearly double first-attempt completion rates** across form types, industries, and markets. (Source: NN/G, forms research.)
- Confirm success too (green check), not just errors.

### Single-step vs multi-step
- **Multi-step forms can convert ~86% higher than single-step** for long forms — *but* only with clean cross-step error handling. (Source: FormAssembly / Ivyforms, citing multi-step data.)
- Multi-step approach: validate the current step before "Next"; block advance on error; mark errored steps in the progress bar. Show a progress indicator.
- Single-step pitfall: dumping a **wall of red errors** on a 15-field form after submit is one of the fastest conversion killers.
- Rule of thumb: **short forms → single step; long/complex → multi-step with progress**, chunked by logical groups (Miller's Law).

### Error message wording
- Be **specific + actionable + polite**. "Please check your ZIP code format" beats "ZIP code is wrong"; "Invalid input" / "Error" leave users stuck.
- Place errors **inline next to the offending field**, not only in a summary at top.
- Preserve entered data; never wipe the whole form on one error.

### Common form mistakes → fixes
| Mistake | Fix |
|---|---|
| Placeholder used as the label | Persistent top-aligned label |
| Left-aligned labels (slow scan) | Top-aligned (up to 50% faster) |
| Validate only on submit | Inline validation on blur, + success ticks |
| One giant single-step form | Multi-step + progress bar for long forms |
| "Invalid input" errors | Specific, polite, actionable, inline messages |
| Asking every field "just in case" | Ruthless field reduction; defer optional |

---

## 7. Quick-reference number bank (for the chapter writer)

- Touch targets: **iOS 44×44 pt · Android 48×48 dp · WCAG 2.2 24×24 px floor · 44 px AA**
- One-handed thumb use: **~49% of users** · primary actions in **bottom third**
- Bottom nav items: **3–5**
- Above the fold: **~74% of viewing time** top two screenfuls; **84%** above/below treatment gap
- Working memory: **4–7 chunks** (Miller)
- Dashboards: start with **5–7 summary cards**
- Landing page median conversion: **6.6%** (SaaS 3.8% → high 12.3%)
- CTA copy test: **"Trial" vs "Sign up" +104%**
- Cart abandonment: **~70.2%** avg · mobile **~80%** / desktop **~66%**
- #1 abandon reason: **39% extra costs**; **19% forced account**; **18% long checkout**
- Checkout fields: **~23.5 shown → ideal 12–14 elements (7–8 fields)**; **20–60%** cut possible
- PDP: **67% rank image quality #1**; video **+144% add-to-cart**; tabs make **27% miss** content
- Forms: top labels **up to 50% faster**; **31% of sites lack inline validation**; optimized forms **~2× first-attempt completion**; multi-step **+86%**

---

## Sources

**Nielsen Norman Group (NN/G):**
- 113 Design Guidelines for Homepage Usability — https://www.nngroup.com/articles/113-design-guidelines-homepage-usability/
- Scrolling and Attention (original research) — https://www.nngroup.com/articles/scrolling-and-attention-original-research/
- The Fold Manifesto — https://www.nngroup.com/articles/page-fold-manifesto/
- Touch Targets on Touchscreens — https://www.nngroup.com/articles/touch-target-size/
- Data Tables: Four Major User Tasks — https://www.nngroup.com/articles/data-tables/
- Navigation topic hub — https://www.nngroup.com/topic/navigation/

**Baymard Institute:**
- Cart Abandonment Rate Statistics — https://baymard.com/lists/cart-abandonment-rate
- Product Page UX Best Practices 2026 — https://baymard.com/blog/current-state-ecommerce-product-page-ux
- Form Design: 6 Best Practices — https://baymard.com/learn/form-design
- Mobile Form Usability: Never Use Inline Labels — https://baymard.com/blog/mobile-forms-avoid-inline-labels

**Apple / Google platform docs:**
- Material Design — Bottom navigation — https://m2.material.io/components/bottom-navigation
- Material Design 3 — Navigation bar — https://m3.material.io/components/navigation-bar
- Material Design — Touch target — https://m2.material.io/develop/web/supporting/touch-target
- Android Accessibility — Touch target size — https://support.google.com/accessibility/android/answer/7101858
- iOS Design Handbook — Design for Touch (Apple HIG 44pt) — https://designcode.io/ios-design-handbook-design-for-touch/

**Laws of UX & principles:**
- Laws of UX — 21 laws explained (UX Design Institute) — https://www.uxdesigninstitute.com/blog/laws-of-ux/
- Laws of UX (lawsofux.com reference material)

**Landing pages / conversion:**
- Unbounce — high-converting landing page examples & 2024 Conversion Benchmark Report — https://unbounce.com/landing-page-examples/high-converting-landing-pages/
- OptimizePress — landing page headline formulas — https://www.optimizepress.com/landing-page-headlines/
- KlientBoost — landing page headlines — https://www.klientboost.com/landing-pages/landing-page-headlines/
- Lovable — Landing Page Best Practices — https://lovable.dev/guides/landing-page-best-practices-convert

**Dashboards / SaaS:**
- Zynra — SaaS Dashboard Design: 12 Patterns — https://zynra.agency/en/blog/saas-dashboard-design-patterns
- saasui.design — SaaS Analytics Dashboard UX Patterns 2026 — https://www.saasui.design/blog/saas-analytics-reporting-dashboard-ux-patterns
- Pencil & Paper — Data Dashboards UX patterns — https://www.pencilandpaper.io/articles/ux-pattern-analysis-data-dashboards
- Pencil & Paper — Enterprise Data Tables — https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-data-tables

**Forms:**
- CXL — Form Design Principles (13 empirically-backed) — https://cxl.com/blog/form-design-best-practices/
- FormAssembly — Multi-Step Form Best Practices — https://www.formassembly.com/blog/multi-step-form-best-practices/
- Ivyforms — Error message examples & multi-step vs single-step — https://ivyforms.com/blog/form-error-message-examples/

**Mobile / thumb zones:**
- DesignMonks — Perfect Mobile Button Size — https://www.designmonks.co/blog/perfect-mobile-button-size
- UXPin — Mobile Navigation Design patterns — https://www.uxpin.com/studio/blog/mobile-navigation-examples/
- Steven Hoober thumb-zone research (via UXPin/DesignMonks summaries)
