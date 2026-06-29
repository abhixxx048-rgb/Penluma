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

RESOLVED 2026-06-30: ~47 `platform/transformed/` files had invalid YAML frontmatter — unquoted `title`/`metaTitle`/`description`/FAQ `q:`/`a:` values containing `: ` (colon-space) or a stray leading `"`, plus 3 multi-line plain scalars. All re-quoted; `npm run build` is green. If the generation workflow re-introduces them, re-quote the offending scalars (the generator should emit quoted/block scalars for free-text fields). Note `npm run import` does NOT catch this (it copies transformed files without parsing YAML); only `astro build`/`astro dev` content-sync does — and the error points at the GENERATED `src/content/blog/...` path, so fix the matching `transformed/` source.
