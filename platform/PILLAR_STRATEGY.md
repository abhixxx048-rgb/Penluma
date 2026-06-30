# Penluma Pillar / Topic-Cluster SEO Strategy

> Goal: capture organic search by turning each deep curriculum into a **pillar page**
> that ranks for a head keyword and funnels link authority down to its sub-posts.
> The deep content already exists (~480 posts / 24 topics); the missing piece is the
> hub page + internal-link funnel.

## The model

Each topic folder is already an ordered curriculum, but `/topics/[topic]` is just an
auto-generated list. A **pillar page** is a long-form hub post (lives as the topic's
`00-index*` post) that:

1. H1 on the head keyword + a 2-sentence **direct answer** (wins snippets / AI Overviews)
2. "Who this is for / how to use this path"
3. The full curriculum as an **annotated, linked roadmap** — every sub-post linked
   (this is the internal-link funnel that makes the pillar work)
4. A "start here / fastest path" shortlist
5. FAQ block (emits FAQPage schema — already supported via `faq:` frontmatter)
6. CTA → newsletter

Source of truth for posts is `platform/transformed/<topic>/`. Edit there, then
`npm run import` regenerates `src/content/blog/`. Do **not** edit `src/content/blog`.

## Tier 1 — build first (high demand × deep × strong brand fit × winnable)

| # | Pillar | Head keyword | Anchor post (exists) | Status |
|---|--------|--------------|----------------------|--------|
| 1 | System Design 🏗️ | how to learn system design / interview guide | `system-design/00-index-learning-roadmap.md` | strong — link all 20 roadmap items ✅ done |
| 2 | Multi-Agent LLM Systems 🤖 | multi-agent AI systems / agent orchestration patterns | `agent-orchestration/agent-orchestration-00-index.md` | strong, timely, low competition now |
| 3 | Systems Thinking 🔄 | systems thinking | `systems-thinking/01-what-is-a-system-parts-connections-and-purpose.md` | 22 posts, ~200k searches/mo |
| 4 | Psychology of Decisions 🎯 | decision psychology / behavioral economics | `psychology-of-decisions/01-what-psychology-is-...md` | internal-link magnet across product/AI/money |
| 5 | Finance for Founders 💼 | finance for founders / startup financial literacy | `business-financial-literacy/01-how-to-use-this-guide.md` | high-intent, low competition, tight arc |

## Tier 2 — build next

- **LLM Engineering** 🧠 — companion pillar to Multi-Agent; "RAG/evals/agents" growing. Only 7 posts — grow it.
- **Sales for Founders** 🤝 — unique voice, Mom Test/SPIN have SEO weight, uncrowded.
- **Distributed Systems** 🌐 — excellent 20-post curriculum, **but fix the intro first**: it's split across two `how-to-use` files; consolidate into one hub.
- **AI Learning Platform** 🎓 — largest topic (29); needs a true overview hub post written.
- **Thinking Skills** 💡 — make it the *meta-hub* linking out to Systems Thinking + Psychology + Clear Thinking (watch for cannibalization).

## Do NOT make pillars (use as supporting clusters)

- **How to Make Money** / **Personal Money Mastery** — keywords are the most saturated on
  the internet; won't crack page 1. Link from niche-angle posts (leverage, specific
  knowledge, India-specific tax) instead.
- **Ten Disciplines** (30 posts) — too scattered for one keyword. Split into "Strategy",
  "Decision-Making Under Uncertainty", etc., or keep as a reference library.
- **Life, Money & Relationships** (30 posts) — secretly two curricula. Split into a
  Personal Finance pillar + a Networking/Relationships pillar.
- **AWS Cloud Practitioner**, **English for Developers** — high intent but narrow/off-brand;
  keep as supporting resources.

## Rollout

- Week 1: System Design + Multi-Agent (anchors exist — mostly restructure + interlink)
- Week 2: Systems Thinking + Psychology of Decisions
- Week 3: Finance for Founders + consolidate Distributed Systems intro

## Off-page (do alongside)

- Repurpose each pillar into an X/LinkedIn thread + Hacker News submission (Tue–Thu AM ET).
- Add a content upgrade (cheat sheet) per pillar, gated behind the newsletter.
- Add direct-answer sentences under each H2 across deep posts for snippet/AI-Overview capture.
</content>
</invoke>
