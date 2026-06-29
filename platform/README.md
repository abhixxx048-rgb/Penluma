# Research Notes — blog platform

A fast, SEO-friendly blog built with **Astro** and deployed on **Cloudflare Pages**.
It turns the research markdown/HTML/JSON in this repo's topic folders (`../system-design`,
`../economics-from-first-principles`, …) into **446+ posts across 23 topics**, with dynamic
view counts, likes, full-text search, and newsletter signup.

```
../<topic>/*.md | *.json | *.html   →   import script   →   Astro content   →   Cloudflare Pages
```

## Quick start

```bash
cd platform
npm install
npm run dev          # imports content, then starts http://localhost:4321
```

`npm run dev` runs `scripts/import-research.mjs` first, which regenerates
`src/content/blog/` from the research folders. The generated content is **not**
committed (see `.gitignore`) — the research folders are the source of truth.

## How content is imported

`scripts/import-research.mjs` walks every folder in the repo root and, per folder, uses
whichever source exists:

1. **Markdown** (`system-design`, `english`, `agent-orchestration`, …) — one `.md` → one post.
2. **Build JSON** (`economics`, `psychology-of-decisions`, …) — each chapter/section → one post.
3. **Built HTML** (`distributed-systems`, `thinking-skills`, …) — split on `<section>` → one post.

Titles, dates, ordering and plain-English excerpts (from the `*.takeaways.md` siblings) are
derived automatically.

### Choosing what's published

Edit **`topics.config.mjs`**:

- Any folder **not listed** is auto-published with a prettified title — so when you add a
  brand-new research folder later, **it appears on the blog automatically**.
- The internal PrintFlow360 business/strategy folders are listed with `published: false`
  to keep them private. Flip to `true` to share one.
- List a folder to give it a nice `title`, `description`, `category`, `icon`, and `order`.

Add a new post = drop a `.md` in a topic folder and re-run `npm run dev`.

## Dynamic features (Cloudflare KV)

| Feature | Endpoint | Storage |
|---|---|---|
| View counts | `GET /api/post/<topic>/<slug>` | `views:<id>` in `BLOG_KV` |
| Likes | `POST /api/post/<topic>/<slug>` | `likes:<id>` in `BLOG_KV` |
| Newsletter | `POST /api/subscribe` | `subscriber:<email>` in `BLOG_KV` |
| Search | `/search` (Pagefind) | static index built at deploy |

These run as Cloudflare functions (`export const prerender = false`). Without a KV binding
they degrade gracefully (return zeros), so local `astro dev` works fine.

## Deploy to Cloudflare Pages

1. **Create the KV namespace** and copy the id into `wrangler.toml`:

   ```bash
   npx wrangler kv namespace create BLOG_KV
   # paste the printed id into wrangler.toml → [[kv_namespaces]] id = "..."
   ```

2. **Push to GitHub**, then in the Cloudflare dashboard:
   *Workers & Pages → Create → Pages → Connect to Git*.
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `platform`
   - Add the **KV binding** `BLOG_KV` under *Settings → Functions → KV namespace bindings*.

3. Set your domain in `astro.config.mjs` (`SITE`) and `src/consts.ts` (title/social), then
   redeploy.

> Prefer the CLI? `npm run build && npx wrangler pages deploy dist`.

### Test the production build locally

```bash
npm run cf:preview   # build + wrangler pages dev (simulates KV locally)
```

## Customize

- **Site name / tagline / social:** `src/consts.ts`
- **Colors / typography / callout styles:** `src/styles/global.css`
- **Topic titles, icons, categories, what's published:** `topics.config.mjs`
- **Newsletter provider:** wire Buttondown/ConvertKit/Resend in `src/pages/api/subscribe.ts`
  (emails are stored in KV in the meantime — export with `wrangler kv key list`).

## Exporting newsletter subscribers

```bash
npx wrangler kv key list --binding BLOG_KV | grep subscriber:
```
