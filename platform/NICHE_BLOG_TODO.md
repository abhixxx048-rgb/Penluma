# Niche Blog Backlog — Research → Publish (one at a time)

> Goal: win **consistent** organic traffic by owning a low-competition, high-intent niche
> instead of fighting saturated head terms or **duplicating content we already have**.
>
> ## Why this plan changed (read once)
> The original Print/DB/RAG list was scrapped after an audit: **those posts already exist
> and are already SEO-optimized.** Writing them again would cause keyword cannibalization
> (two of our own pages fighting for one query) and *hurt* ranking. Specifically already covered:
> - CMYK vs RGB → `computer-graphics-print/02`  ·  Bleed/trim → `.../15`  ·  DPI/resolution → `.../07`  ·  Spot/Pantone → `.../06`
> - B-tree / DB indexes → `systems-fundamentals/05`  ·  RAG evals → `ai-llm-engineering/02`+`03`  ·  MCP (broad) → `agent-orchestration/03`
>
> **The real greenfield = Laws of UX.** We have a full researched book (`ui-ux-mastery/chapters/`,
> `research/04-usability-laws.md`) and **zero published UX posts**. Low competition (one dominant
> site), evergreen designer/dev traffic, no cannibalization. That is this backlog.

## Status legend
`[ ]` not started · `[~]` drafting · `[r]` ready, needs links/deploy · `[x]` live & verified

---

## SETUP (do before post #1)
- [ ] **New topic registered** in `topics.config.mjs`: slug `laws-of-ux`, title "Laws of UX",
      category `Thinking & Decisions` (or new `Design` category), icon 🎨, `featured: true` (it's a pillar).
- [ ] **Pillar hub** `00-index-laws-of-ux.md` (order 0) — H1 on "laws of ux", 2-sentence direct answer,
      annotated roadmap linking down to all 10 posts below. (Can write the hub after 2–3 posts exist,
      but register the topic first so URLs resolve.)

## The 10 posts — Laws of UX cluster 🎨
Each is one standalone post targeting its own query. Source for all: `ui-ux-mastery/chapters/04-usability-laws.md`,
`ui-ux-mastery/chapters/05-psychology-of-behavior.md`, `research/04-usability-laws.md`. Folder: `laws-of-ux/`.
Interlink every post to 3–6 siblings + the hub (both directions).

- [ ] **1. Hick's Law: why fewer choices convert better** — kw: `hick's law`, "hicks law ux"
- [ ] **2. Fitts's Law explained for UI designers** — kw: `fitts's law`, "fitts law design", target size/distance
- [ ] **3. Jakob's Law: why users expect your site to work like every other** — kw: `jakob's law`, "jakobs law ux"
- [ ] **4. Miller's Law: the truth about "7 ± 2" and chunking** — kw: `miller's law`, "magical number seven", debunk the myth
- [ ] **5. The Von Restorff (Isolation) Effect in UI design** — kw: `von restorff effect`, "isolation effect ux"
- [ ] **6. The Doherty Threshold: why 400ms decides if your app feels fast** — kw: `doherty threshold`, "perceived performance ux"
- [ ] **7. The Aesthetic-Usability Effect: why pretty feels easier** — kw: `aesthetic usability effect`
- [ ] **8. The Zeigarnik Effect: using unfinished tasks to drive engagement** — kw: `zeigarnik effect ux`, progress bars
- [ ] **9. The Serial Position Effect: primacy, recency & menu order** — kw: `serial position effect ux`, nav ordering
- [ ] **10. The Peak-End Rule: designing the moments users remember** — kw: `peak-end rule ux`

**Bonus (defensible, distinct query — optional 11th):**
- [ ] **What is MCP (Model Context Protocol) — explained simply** — kw: `what is mcp`. Folder: `agent-orchestration/`.
      Distinct from existing `agent-orchestration/03` (which targets the broad "how agents talk" query). Low overlap.

## Publishing order
Register topic → **#1 Hick's** (template post) → #2 Fitts's → #3 Jakob's → build the **hub** →
#4–#10 in listed order → interlink pass → deploy. Do **one post fully to live** before the next.

## Separate track (NOT new posts — don't duplicate)
Print, Databases, RAG/Agents already have the content. If they lack traffic, the fix is:
- [ ] Ensure each has a proper `00-index` pillar hub + full internal-link funnel (see `PILLAR_STRATEGY.md`).
- [ ] Promote (X/LinkedIn thread, HN) — not rewrite.

---

## Working rule
One post at a time, fully to live (SEO frontmatter, hook, FAQ, inbound + outbound links,
`linked: true`, `npm run build`, deploy, 200 check). A half-finished post with no inbound
links adds nothing. Tick the box and log the live URL below after each publish.

| # | Post | Live URL | Published |
|---|------|----------|-----------|
| 1 | Hick's Law |  |  |
| 2 | Fitts's Law |  |  |
| 3 | Jakob's Law |  |  |
| 4 | Miller's Law |  |  |
| 5 | Von Restorff |  |  |
| 6 | Doherty Threshold |  |  |
| 7 | Aesthetic-Usability |  |  |
| 8 | Zeigarnik |  |  |
| 9 | Serial Position |  |  |
| 10 | Peak-End |  |  |
