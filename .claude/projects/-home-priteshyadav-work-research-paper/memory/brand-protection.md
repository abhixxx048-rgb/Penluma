---
name: brand-protection
description: PROTECTBRAND - public persona is "Pritesh Yadav (priteshyadav444)"; keep real name + PrintFlow360 off the live site
metadata:
  type: project
---

The public-facing author persona for [[penluma-brand]] is **Pritesh Yadav (priteshyadav444)** (not the real name Pritesh Yadav - that lowercase `priteshyadav` only legitimately appears in home-directory paths). All bylines + `SITE.author` use Pritesh Yadav (priteshyadav444).

**PrintFlow360** is the user's real web-to-print SaaS and must be kept OFF the published site (PROTECTBRAND). On 2026-06-30 the published footprint was scrubbed: bucket name `printflow360` → `your-app-files` in the backup runbook, the `...applied-printflow360` article slug renamed to `...applied-case-study` (both transformed + raw source), and the topics.config comment genericized. The deep PrintFlow360 references in the unpublished root research folders (engineering-ops, marketing, agent-orchestration, etc.) were intentionally left as-is per the "published site only" scope.

Google Analytics: gtag in `src/layouts/BaseLayout.astro`, **production-only** and gated on `SITE.gaId` (= **G-3P5Z6TRP9Y** in `consts.ts`), so local dev isn't counted. The site logo is `public/logo.png` (1024×1024), used in the header, favicon/apple-touch-icon, and Organization JSON-LD logo.

To keep the PrintFlow360 competitive playbook off the live site, the Business & Growth topics (gtm-strategy, marketing, marketing-growth, metrics-analytics, retention-lifecycle, engineering-ops, feature-rd, qa-launch, product-design) are set `published: false` in `topics.config.mjs` - their transformed blog versions still exist under `platform/transformed/` and can be re-published by removing the flag.
