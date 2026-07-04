# book-to-pillar workflow

Publish any remaining book folder (e.g. `ui-ux-mastery`, `money-guide-2026`) as a
Penluma pillar the same way `knowing-doing-gap` was published - in one workflow run
plus three small manual steps.

The workflow script is `workflows/book-to-pillar.mjs`. It:

1. **Validates** the raw chapter sources exist in `<bookDir>/chapters/`.
2. **Transforms** each chapter into a polished Penluma post with full SEO frontmatter
   (mirrored 1:1 from `transformed/knowing-doing-gap/01-...md`) and runs an adversarial
   editor pass over each. Output: `platform/transformed/<topicSlug>/<nn>-<slug>.md`.
3. **Builds the pillar hub** `00-index-<topicSlug>.md` (roadmap funnel down to every post).
4. **Links both ways** - outbound links inside the pillar (and marks each post
   `linked: true`) plus inbound links from neighbouring existing posts.

It deliberately does **not** edit any shared file, register the topic, or build/deploy.
Those are the manual follow-ups below.

---

## 1. Fill the args for a new book

Open `workflows/book-to-pillar.mjs` and edit the `CONFIG` block (or invoke the workflow
with an `args` object of the exact same shape - `args` wins when it has a non-empty
`postDefs` array):

```js
const CONFIG = {
  bookDir: 'ui-ux-mastery',      // folder under the research root holding chapters/
  topicSlug: 'ui-ux-mastery',    // permanent URL slug + transformed/<topicSlug>/ dir
  topicTitle: 'UI/UX Mastery',   // topicTitle on every post
  category: 'Design',            // MUST exist in topics.config.mjs CATEGORIES (add it if not)
  icon: '🎨',                    // one emoji, reused on every post + the topic
  postDefs: [
    { n: 1, slug: 'what-is-ux-design', src: '01-intro.md',   workingTitle: 'What UX design really is' },
    { n: 2, slug: 'design-thinking',   src: '02-process.md', workingTitle: 'The design-thinking loop' },
    // ...one entry per chapter you want to publish, in reading order...
  ],
};
```

Field notes:

- **`postDefs[].n`** - reading order; also the `01-`, `02-` numeric filename prefix and
  the frontmatter `order`. The hub is always `order: 0`.
- **`postDefs[].slug`** - the URL slug. Make it kebab-case and keyword-bearing, and
  **keep it stable once live** (it becomes `/blog/<topicSlug>/<nn>-<slug>`).
- **`postDefs[].src`** - the raw chapter filename inside `<bookDir>/chapters/`. Get the
  real names with: `ls -1 <bookDir>/chapters/`.
- **`postDefs[].workingTitle`** - just a hint for the writer; the final title is rewritten
  to be curiosity-driven and keyword-bearing.
- **`category`** - if it isn't already in `topics.config.mjs`'s `CATEGORIES`, add it there
  (a manual step, see below) or the topic renders under "Other".

To find the chapter files for a book:

```bash
ls -1 /home/priteshyadav/work/research-paper/<bookDir>/chapters/
```

> **Note on `money-guide-2026`:** at time of writing that folder holds only a PDF and has
> **no `chapters/` directory**. You must first extract its chapters into
> `money-guide-2026/chapters/*.md` (one file per chapter) before this workflow can run -
> the workflow reads markdown, not PDF.

---

## 2. Manual follow-ups (the workflow does NOT do these)

### a) Register the topic in `topics.config.mjs`

Add an entry under `TOPICS` so the pillar gets a curated title/description/icon/order
(unregistered folders still publish, but with a prettified auto-title and no featured slot):

```js
'ui-ux-mastery': {
  title: 'UI/UX Mastery',
  description: 'A plain-English pillar on interface and experience design: research, IA, visual craft, and shipping usable products.',
  category: 'Design',   // add 'Design' to CATEGORIES too if it isn't there yet
  icon: '🎨',
  order: 1,
  featured: true,       // put a real pillar on the homepage
},
```

### b) THE GOTCHA - copy the transformed md into the research-root folder

**This is the step that silently breaks a new pillar.** The importer
(`scripts/import-research.mjs`) builds the **topic registry** (topics index, nav, topic
page, sitemap, `topics.generated.json`) by walking the **research-root folders** and their
top-level `.md` files - *not* the `transformed/` overlay. The overlay is applied **on top**
of that walk (same path = clean replace, stable URLs).

Consequences if you skip the copy:

- A folder with **no top-level `.md`** (like `ui-ux-mastery` today, which only has
  `chapters/`, an HTML build, and a PDF) is treated as a **book folder**: the importer
  auto-generates posts from the HTML/JSON build with **different, unstable slugs** that do
  **not** match your `transformed/` overlay - so your polished posts don't line up and the
  hub's links 404.
- Even when the overlay writes your posts into `src/content/blog/<topicSlug>/`, the **topic
  itself** may not be registered (it's driven by the folder walk), so the pillar can be
  missing from `/topics`, nav, and the sitemap.

The fix: copy the finished markdown into the research-root topic folder so the importer
walks real `.md` files (registering the topic + stable slugs), then the overlay replaces
them with the polished versions. This is exactly why `knowing-doing-gap/` has `00-index-…md`
… `12-…md` sitting at its top level alongside `chapters/`.

```bash
# create the research-root topic folder if it doesn't exist, then copy the md in
mkdir -p /home/priteshyadav/work/research-paper/<topicSlug>
cp /home/priteshyadav/work/research-paper/platform/transformed/<topicSlug>/*.md \
   /home/priteshyadav/work/research-paper/<topicSlug>/
```

Concretely for `ui-ux-mastery`:

```bash
mkdir -p /home/priteshyadav/work/research-paper/ui-ux-mastery
cp /home/priteshyadav/work/research-paper/platform/transformed/ui-ux-mastery/*.md \
   /home/priteshyadav/work/research-paper/ui-ux-mastery/
```

(The filenames must match the transformed ones exactly - `00-index-<topicSlug>.md`,
`01-<slug>.md`, … - so the overlay lands on the same path. Copying straight from
`transformed/` guarantees that.)

### c) Verify inbound links landed

A new pillar with zero inbound links is invisible to internal PageRank. The workflow adds
some, but confirm:

```bash
cd /home/priteshyadav/work/research-paper/platform
grep -rl "/blog/<topicSlug>/" transformed --include='*.md' | grep -v "/<topicSlug>/"
```

If that's empty, hand-add a few links from obvious neighbours (same category) into the new
pillar and re-check.

---

## 3. Build & deploy

```bash
cd /home/priteshyadav/work/research-paper/platform
npm run build     # = import + astro build + pagefind; fails loud on bad frontmatter
# npm run deploy  # ONLY when the owner has explicitly asked - never auto-deploy
```

- **Dev-server gotcha:** if `astro dev` is already running and you re-import separately,
  `/blog/...` routes 404 until you restart it (`pkill -f "astro dev" && npm run start`).
- **Verify after deploy:** the pillar appears in `/topics` and `/sitemap`, the hub
  (`/blog/<topicSlug>/00-index-<topicSlug>`) and a sample sub-post return 200, and internal
  links resolve (no 404s).

See `platform/CLAUDE.md` for the canonical publishing checklist and `PILLAR_STRATEGY.md`
for the hub/funnel template.
