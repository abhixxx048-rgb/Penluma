---
name: platform-build-pipeline
description: How Penluma generates published posts — edit transformed/, not src/content/blog (which is wiped each build)
metadata:
  type: project
---

`platform/src/content/blog/` is **generated output** — `scripts/import-research.mjs` wipes and regenerates it on every `npm run import` (and `npm run build`, which is `import && astro build && pagefind`). Editing files there does NOT persist.

Sources of truth, in overlay order:
- Root research folders (`../<topic>/*.md`) → raw import, frontmatter regenerated WITHOUT an author byline.
- `platform/transformed/<topic>/<slug>.md` → committed SEO-rewritten posts that OVERLAY the raw import at the same slug (this is where the `author:` byline + FAQ live). **Edit here to change published posts.**
- `platform/posts/*.md` → standalone hand-written posts.

Published slug = transformed filename. To rename a public URL cleanly, rename BOTH the transformed file and the matching raw root file (so the overlay still replaces it; otherwise you get a duplicate post). Global byline/author fallback is `SITE.author` in [[penluma-brand]] `src/consts.ts`.

KNOWN BLOCKER (as of 2026-06-30): ~47 files under `platform/transformed/` have invalid YAML frontmatter — unquoted FAQ `q:`/`a:` values containing `: ` (colon-space), which `astro build` rejects (`npm run import` doesn't catch it because it copies transformed files without parsing). This breaks `astro build` independent of any other change. Fix by quoting the offending FAQ strings or fixing the generator.
