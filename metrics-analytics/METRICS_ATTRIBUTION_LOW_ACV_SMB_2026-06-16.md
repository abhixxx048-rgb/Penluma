# Attribution Models for Low-ACV SMB (Why Multi-Touch Is Often Overkill)

> Researched 2026-06-16 via a multi-agent workflow (research → adversarial fact-check → synthesis). This doc is grounded in vendor and analyst material from 2024–2026. **Treat every vendor-blog percentage as a hypothesis to A/B-test against our own data, not a guarantee.** Several widely-repeated "SaaS-metrics folklore" numbers are explicitly flagged below - do not launder them into our planning decks as hard benchmarks. Where a stat survived independent verification it is marked Verified/Solid; where it traces to a single vendor self-test or a mutually-cited blog chain it is marked Directional or Fabricated-avoid.

---

## Executive Summary

**Headline recommendation: Skip multi-touch attribution entirely. Ship a plain-language "How did you hear about us?" field + first-touch UTM capture, report channels by *activated* stores (North Star), and run a holdout test only when you're about to scale spend on a channel.**

Print-Flow-360 is a low-ACV, self-serve print SaaS sold to non-technical print-shop owners, with a deliberately concentrated acquisition strategy (founder-led outreach + print communities as PRIMARY; BOFU SEO + free design tool as SECONDARY - see `readme/ACQUISITION_CHANNELS_2026-06-15.md`). For that shape of business, the multi-touch attribution (MTA) industry is selling us a solution to a problem we don't have:

- **Our sales cycle is days, not months, with few touchpoints.** There is almost nothing for a multi-touch model to split credit across. Single-touch (first/last) is genuinely sufficient.
- **We don't have the conversion volume** to make data-driven/algorithmic attribution anything but a noise-fitter (it wants ~600–1,000 conversions/month to be stable [7][8]).
- **Cookies are gone.** Roughly **40–60% of conversions are now invisible to cookie-based tracking** [1][3], so an MTA platform would give us a confident-looking but half-blind picture - and our highest-priority channels (word-of-mouth in print communities, the free design tool) are exactly the "dark social" that tracking can't see at all.
- **We have ~2 engineers.** The maintenance tax of an attribution model would exceed its decision value.

The single highest-ROI attribution upgrade for a team like ours is **self-reported attribution (SRA)** - one survey field on a high-intent form - corroborated by clean first-party UTMs. This mirrors the strongest, most-cited industry position (Refine Labs / Chris Walker, adopted across 100+ B2B companies [4]) and aligns one-for-one with the channels our acquisition doc told us to bet on. Build the lightweight stack; ignore MTA, DDA, and MMM.

---

## 1. The attribution-model zoo (and where it stops being worth it)

Attribution assigns conversion credit to marketing touchpoints. The models form a spectrum from trivial to heavyweight:

| Model | Rule | Best for | Fit for Print-Flow-360 |
|---|---|---|---|
| **First-touch** | 100% credit to the discovery channel | Seeing what *drives demand* | ✅ Yes - pairs with SRA + signup UTM |
| **Last-touch** | 100% credit to the final channel before conversion | Seeing the *closing* channel | ✅ Yes - cheap default; pair with first-touch |
| **Linear** | Equal credit to every touch | Simple multi-touch | ❌ Flattens influence; little to model in short cycles |
| **Time-decay** | More credit the closer a touch is to conversion | Longer considered purchases | ❌ Overkill for fast self-serve |
| **U-shaped / position-based** | 40% first + 40% last + 20% across the middle | Rules-based MTA, 3–6 mo cycles | ❌ Adds nothing over first/last for us |
| **W-shaped** | 30% first + 30% lead-creation + 30% opp-creation + 10% middle | Multi-stage *sales-led* motions | ❌ We have no lead/opp stages |
| **Data-driven (DDA)** | ML/Shapley-style credit from observed paths | High-volume conversion data | ❌ Below volume threshold it models noise |

The first three rows (first/last/linear) are single-touch or trivial. U-shaped, W-shaped, and DDA are the heavyweight **"multi-touch attribution" (MTA)** end - and that's the end that is overkill for us.

### Single-touch formulas (the only two we'll actually use)

```
First-touch:  Credit(channel) = 1.0 if channel == first touchpoint, else 0
Last-touch:   Credit(channel) = 1.0 if channel == last touchpoint before conversion, else 0
```

First-touch maps cleanly to a self-reported survey and a UTM captured at signup - it answers *"what made them discover us?"* Last-touch is the de-facto default in nearly every analytics tool and answers *"what closed them?"* Use both; rely on neither alone.

### The multi-touch formulas (for reference - we are not building these)

```
Linear:        Credit(each touch) = 1 / N        (N = number of touchpoints)
Time-decay:    Credit(touch_i) ∝ 2^(-Δt_i / halflife),  normalized so Σ credit = 1
U-shaped:      40% first + 40% last + 20% split across middle touches
W-shaped:      30% first + 30% lead-creation + 30% opp-creation + 10% across the rest
DDA:           Algorithmic / Shapley-value credit from converting vs non-converting paths
```

---

## 2. MTA vs MMM vs Incrementality - three different jobs, not three brands of the same thing

A common mistake is treating these as competing products. They answer different questions:

| Method | What it is | Proves causation? | Data appetite | Verdict for us |
|---|---|---|---|---|
| **MTA** (multi-touch attribution) | User-journey, click-path credit splitting | ❌ Correlational | High conversion volume; privacy-fragile | **Least valuable job for us** |
| **MMM** (marketing-mix modeling) | Top-down regression of aggregate spend vs revenue | ❌ Correlational | ~2+ years of weekly spend/revenue data | **Too data-hungry - skip** |
| **Incrementality / holdout** | Controlled experiment: withhold a channel, measure lift | ✅ **Yes - the only causal method** | A control group + a few weeks | **Highest-signal test we can run** |

Marketers themselves rate MMM as more reliable than MTA - in eMarketer's survey, **MMM was rated most reliable by ~28% vs MTA's ~19%** [6]. But MMM needs years of weekly data we don't have, and MTA can't prove causation. That leaves **incrementality** as the method that actually earns its keep for an early SMB: a cheap, periodic holdout that answers the only question that matters before scaling spend - *"would this conversion have happened anyway?"*

### Incrementality formula

```
Incremental lift %     = (ConvRate_exposed − ConvRate_control) / ConvRate_control
Incremental conversions = (ConvRate_exposed − ConvRate_control) × exposed_population
```

Run a randomized holdout (or geo-split) for at least a few weeks with a properly sized control group, then compare. Adoption is mainstream and growing: **~52% of US marketers use incrementality testing and ~36% plan to invest more in it over the next year** [6].

---

## 3. Why heavy MTA is overkill (and often misleading) for low-ACV SMB

Four structural reasons, all of which apply to Print-Flow-360:

1. **Short, cheap sales cycles.** A self-serve print-shop owner has a handful of touchpoints over days or weeks. There is little journey to model, so credit-splitting adds complexity without insight. Single-touch is *genuinely* sufficient - not a compromise.

2. **Low data volume per channel.** Data-driven/algorithmic models need hundreds of conversions *per conversion type* to be statistically reliable (see §4). An early SMB SaaS won't hit that, so the "model" fits noise and hands you confident garbage.

3. **Privacy / cookie decay.** Third-party cookies and mobile IDs are largely gone. Cookie consent/match rates run roughly **40–60%**, and cookie-based tracking now **misses an estimated 30–50% of conversions** [1][3]. MTA is blind to a large share of journeys - and *especially* blind to the dark-social channels (community word-of-mouth, a friend's recommendation, the free design tool) we are deliberately leaning on.

4. **Maintenance tax.** A 2-person team spends more time explaining and cleaning the attribution model than acting on it. *If you can't maintain it, it won't help you decide.*

> **Folklore flag - "you're flying blind without multi-touch attribution."** This is vendor sales pressure, not analysis. The documented reality is the opposite for our segment: MTA is over-engineered below roughly $5–20M revenue / fewer than ~5 active channels (these thresholds are reasonable rules of thumb, not sourced laws), and a simple SRA + UTM stack outperforms it on both cost and on capturing dark social.

---

## 4. Data-driven attribution: the volume reality (and the GA4 trap)

DDA is the most seductive model - "let the machine figure it out." For us it's a trap, for two reasons.

| Metric | Value | Confidence | Source |
|---|---|---|---|
| Legacy Google UA threshold to **enable** DDA | 600 conversions / 30 days (Search); + 15,000 Google Ads clicks in the Ads variant | Verified | [7] |
| Legacy Google UA threshold to **maintain** DDA | ~400 conversions per conversion action + ≥2 path interactions over the trailing window | Verified | [7] |
| Practical DDA reliability floor (incl. GA4) | ~600–1,000 conversions/month for stable results | Directional | [8] |

> **Folklore flag - "you need 600 conversions to use data-driven attribution."** This is from **sunset legacy Universal Analytics** [7]. **GA4 removed the hard threshold and made DDA the default model.** So "600 conversions" is *outdated as a hard gate*. The honest framing: GA4 will *technically let you run* DDA at any volume, but below roughly several hundred conversions/month it is unreliable - and critically, **GA4 silently falls back to a rule-based/last-click model below threshold and does not notify you** [8]. You'd think you're running DDA when you're not.

Net: at our volume, DDA is either noise (if it ran) or secretly last-click (if it fell back). Either way, it's last-click with extra steps. Just use last-click on purpose.

---

## 5. Self-reported attribution (SRA) - the SMB-grade workaround

A single survey field at signup/checkout: *"How did you hear about us?"* It is the highest-leverage attribution move for a team our size because it captures **dark social** - word-of-mouth, community/forum chatter, podcasts, events, a friend's recommendation - that no tracking can see.

Its honesty cuts both ways: it surfaces the *most memorable/meaningful* touch (often the real demand driver), but it's recall-biased, sometimes vague ("Google"), and only reflects the one person filling the form. Best practice:

- Place it on a **high-intent form** (signup/checkout), not a low-intent newsletter box.
- Use a **curated dropdown of 5–8 plain-language options** + an "Other" free-text.
- Treat it as **one corroborating signal**, not gospel.

| Metric | Value | Confidence | Source |
|---|---|---|---|
| SRA usable-response rate (single n=100 vendor self-test) | ~70 of 100 filled the field; **49 of 100 gave actionable answers (~49%)** | Solid (but n=100, one vendor) | [2] |
| Dark social is large (clean anchor) | B2B buyers complete **70–80% of research before contacting sales** - much of it untrackable | Directional | [9] |
| Hybrid (tracked + self-reported) lead-source accuracy | One vendor reported **~81%** - single-source, unverifiable | Fabricated-avoid | [5] |

> **Folklore flag - the "podcasts drove 53% of revenue self-reported but 0% in software / 90% measurement gap" anecdote.** A vivid, endlessly-repeated *single-vendor* story (Refine Labs). Use it only to *illustrate* that tracking misses dark social - the exact 53% / 0% / 90% figures are **not a generalizable benchmark**. Same caution applies to Refine Labs' "97% of net-new ARR traced to dark social" and "99% of self-reported responses differ from last-touch": directionally evocative, not laws. For the clean, citable version of "dark social is large," use Forrester's 70–80%-of-research-before-sales-contact figure [9] instead.

> **Folklore flag - "hybrid = 81% lead-source accuracy."** Could not be verified in any source; traces to one vendor study repeated across roundups. The *underlying point* (combining tracked + self-reported beats either alone) is sound; the precise **81% is not a benchmark - do not cite it as fact.**

---

## 6. UTM hygiene - the cheap, durable foundation

UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`) tagged on every outbound link, **captured at signup and stored first-touch on the store/customer record**, give you reliable *first-party* source data that survives the cookie apocalypse - because *you* store it, not a third party. Combined with a consistent naming convention, UTMs + a single first-touch capture cover the *tracked* half of attribution at near-zero ongoing cost. This is the "simple first/last touch" layer that replaces an entire MTA platform for an SMB.

The known blind spot: UTMs only see *clickable* links. They will report "direct/organic" for the print-shop owner who heard about us in a Slack group and typed the URL. That gap is exactly what the SRA field fills (§5) - which is why we run both and triangulate (§8).

---

## 7. Where last-touch and MTA actually stand in the market

Useful as a reality check on vendor hype: the "advanced" models are far less used than the marketing implies, and the boring default still dominates.

| Metric | Value | Confidence | Source |
|---|---|---|---|
| Last-click is the de-facto default | **~78.4% of marketers use last-click** attribution; only **~21.5% are confident** it reflects long-term impact | Directional | [6] |
| Perceived reliability of methods | MMM ~28% rated most reliable > MTA ~19% > unified ~19% | Solid | [6] |
| MTA adoption at sub-$5M revenue | **~44% of sub-$5M companies use MTA** | Directional | [11] |
| W-shaped fit | Suits **mid-market B2B with multi-stakeholder, multi-month cycles (commonly 6–18 mo)**; algorithmic/custom only for high-volume enterprise with enough conversion data | Directional | [12] |

> **Folklore flag - "~90% of brands use last-touch (Salesforce 2022)" and "~67% last-touch adoption."** The Salesforce/90% figure could not be located; we've **replaced it** with the verifiable eMarketer 2024 figure (~78.4% use last-click, ~21.5% trust it) [6]. The "~67%" sub-figure is unverified vendor folklore - **dropped.** The *takeaway* is unchanged: last-touch is the de-facto default, **not** a best practice.

> **Interpretation note on the 44% stat.** CaliberMind's table shows 44% of sub-$5M firms use MTA *as an adoption fact* [11]. But the same table shows enterprise ($250M–$1B) at 73% and a non-monotonic middle - so small firms do **not** lead adoption. The "many of them are over-engineering" read is **our analysis**, consistent with §3, not a CaliberMind conclusion.

> **Folklore flag - fabricated W-shaped specifics.** Earlier drafts cited W-shaped as fitting "$50K–$150K ACV / 4–8 month cycles" and algorithmic for "$250K+ / 50+ conversions over 6–12mo." Those precise numbers are **not in the cited source**, which segments by *company ARR* ($1M–$10M → W-shaped; $10M+ → algorithmic) [12], not deal ACV, and uses one illustrative example. The fabricated ranges have been **stripped.** Either way: W-shaped needs lead/opp stages we don't have.

> **Folklore flag - MTA/MMM adoption stats ("75% use MTA," "47% in 2026 up from 31%," "MMM is now free/easy with Meridian/Robyn/PyMC").** These float around vendor blogs with inconsistent denominators and conflate rules-based MTA with full algorithmic platforms. Treat as *vibe*, not data. And while the MMM libraries *are* free, MMM still needs ~2+ years of weekly spend/revenue data to mean anything - **citing it as an SMB option is a category error for an early-stage print SaaS. Skip.**

---

## 8. Hybrid corroboration beats either method alone

Tracked attribution and self-reported attribution disagree *constantly*. Rather than trust one, **triangulate**:

- **Where first-touch UTM and self-reported agree** → high confidence. Bank it.
- **Where they diverge** (tracking says "direct/organic" but buyers say "a friend told me" or "your free design tool") → the **self-reported answer usually reveals the real demand driver**, and the tracked one is just the last clickable step.

For Print-Flow-360 specifically, this is the whole ballgame: last-touch "direct" will routinely *hide* that referral and the free design tool are the actual engine - precisely the dark-social channels our acquisition strategy prioritized. The hybrid view is what stops us from defunding our best channel because a dashboard couldn't see it.

---

## What this means for Print-Flow-360

Concrete, scoped to a small non-technical customer base and ~2 engineers. **Instrument simple things well; do not model.**

### BUILD (in priority order)

1. **"How did you hear about us?" field at signup.** Curated dropdown of 5–8 plain-language options + "Other" free-text. No jargon - never the words "attribution," "channel," or "source" in the UI. Suggested options tailored to our actual bets:
   - "A friend or another print shop told me"
   - "Google search"
   - "Facebook / Instagram"
   - "A print-industry group or forum"
   - "YouTube / a video"
   - "Saw your free design tool"
   - "Other" (free text)

   This is the **highest-ROI attribution work** and directly measures the founder-led-outreach + print-communities + free-design-tool channels from `readme/ACQUISITION_CHANNELS_2026-06-15.md`.

2. **First-touch UTM capture.** Read `utm_source` / `utm_medium` / `utm_campaign` on the landing page and **persist them first-touch on the store/customer record at signup** in a small additive JSON column. Follow the existing `custom_field_values` pattern - **additive only, never repurpose an existing column** (per CLAUDE.md §5). This is the first-party tracked half that survives cookie decay.

3. **One internal "Where signups come from" report.** A weekly table joining the self-reported answer + first-touch UTM source, **segmented by whether the store hit the North Star (store live + first order in 7 days)** from `readme/CONVERSION_FUNNEL_RESEARCH_2026-06-15.md`. Reuse existing admin list/report patterns - **do not buy or build a dashboard product.** Report channels by **activated stores, not raw signups**, so a vanity channel that brings tire-kickers is visibly deprioritized.

### INSTRUMENT, don't model (engineering correctness)

- Store the **raw** self-reported answer and the **raw** first-touch UTM so they round-trip: **validate → save → read back → render.** Per CLAUDE.md's silent-lie rule, a survey field collected in the UI but missing from the FormRequest `rules()` is **silently discarded** - the owner sees "Saved" but the data is gone.
- **Write a test** asserting both fields persist, mirroring `tests/Feature/Storefront/AddressAttentionToTest.php`. A field with no such test is not done.

### A/B TEST / experiment (causal reads, periodic - not continuous)

- **Run a holdout, not a tracker.** When the founder is about to pour time or money into a channel (a specific print-community sponsorship, a paid experiment), run a lightweight **incrementality test**: pause or geo-split that channel for at least a few weeks and compare signup *and activation* rate against a control. This causal read is worth more than any attribution model for a base our size.
- **A/B the SRA field itself** if response quality is poor: dropdown order, option wording, optional vs required. Aim to beat the ~49% usable-answer baseline [2].

### IGNORE (do not spend a single sprint on)

- ❌ A multi-touch attribution platform (MTA) - overkill for short, cheap, few-touch cycles.
- ❌ Data-driven / algorithmic attribution (DDA) - we lack the ~600–1,000 conversions/month for it to be anything but noise or silent last-click [7][8].
- ❌ Marketing-mix modeling (MMM) - needs ~2+ years of weekly data; category error at our stage.
- ❌ U/W-shaped models - they assume lead/opp sales stages we don't have.

### CORROBORATE divergences (the judgment call)

When tracked says "direct/organic" but buyers say "a friend told me" or "your free design tool," **trust the self-reported demand driver** and credit word-of-mouth / the free tool. Don't let last-touch "direct" bury the fact that referral and the free design tool are the real engine - those are exactly the channels the acquisition doc told us to double down on.

---

## Sources

[1] House of Martech - *MMM vs Multi-Touch Attribution: Privacy-First Measurement Framework for 2026.* https://houseofmartech.com/blog/marketing-mix-modeling-vs-multi-touch-attribution-privacy-first-measurement-framework-for-2026

[2] Dreamdata - *We tested self-reported attribution. Here's what we learned.* (n=100 self-test: ~70% filled the field, 49/100 actionable). https://dreamdata.io/blog/self-reported-attribution-tested

[3] Improvado - *Multi-Touch Attribution Models, Tools, and Implementation Guide for 2026.* https://improvado.io/blog/multi-touch-attribution

[4] Refine Labs - *Hybrid Attribution Framework / "Attribution Mirage"* (Chris Walker, dark social). Figures (90% gap, 97% net-new ARR) are illustrative anecdote, not benchmarks. https://www.refinelabs.com/article/hybrid-attribution-framework

[5] Outbrain - *Self-Reported Attribution (or "How Did You Hear About Us?"): Guide.* Origin of the unverifiable ~81% hybrid-accuracy figure. https://www.outbrain.com/blog/self-reported-attribution/

[6] eMarketer - *FAQ on incrementality: How to prove your ads actually work in 2026* (eMarketer/TransUnion July 2025; Snap + EMARKETER 2024 for last-click). https://www.emarketer.com/content/faq-on-incrementality-how-prove-your-ads-actually-work-2026

[7] Google Analytics Help - *About MCF Data-Driven Attribution* (legacy Universal Analytics data thresholds; UA now sunset, GA4 removed the hard gate). https://support.google.com/analytics/answer/3264076?hl=en

[8] NestScale / GA4 DDA practitioner guide - *Data-Driven Attribution Explained* (~600–1,000/mo reliability floor; GA4 silent fallback below threshold). https://nestscale.com/blog/data-driven-attribution.html

[9] Forrester (2025), via Whitehat SEO - *Marketing Attribution That Actually Works* (B2B buyers complete 70–80% of research before contacting sales). https://whitehat-seo.co.uk/blog/marketing-attribution-that-works

[10] Saashero - *2026 Attribution Models Guide for B2B SaaS Performance.* https://www.saashero.net/strategy/attribution-models-performance-marketing-2026/

[11] CaliberMind - *Is Multi-Touch Attribution Right for SMB Organizations?* (44% sub-$5M MTA adoption; enterprise at 73%). https://calibermind.com/articles/multi-touch-attribution-for-b2b-small-midsize-business/

[12] Sotros Infotech - *Multi-Touch Attribution for SaaS: The W-Shaped Model Explained* (segments by company ARR, not deal ACV). https://sotrosinfotech.com/blog/multi-touch-marketing-attribution-model-saas/

[13] HockeyStack - *Understanding Different Attribution Models and When to Use Them.* https://www.hockeystack.com/blog-posts/different-attribution-models

[14] Digital Applied - *Marketing Mix Modeling 2026: MMM vs Attribution Playbook.* https://www.digitalapplied.com/blog/marketing-mix-modeling-2026-mmm-vs-attribution-playbook

---

### Related internal docs

- `readme/CONVERSION_FUNNEL_RESEARCH_2026-06-15.md` - AARRR funnel, no-card 14-day reverse trial, North Star (store live + first order in 7d). The SRA report should segment by this North Star.
- `readme/ACQUISITION_CHANNELS_2026-06-15.md` - PRIMARY founder-led outreach + print communities; SECONDARY BOFU SEO + free design tool; SKIP paid search/affiliates. The SRA dropdown options are designed to measure exactly these bets.
