// ---------------------------------------------------------------------------
// book-to-pillar.mjs
//
// Reusable "book folder -> Penluma pillar" workflow. Turns any raw book folder
// (e.g. ui-ux-mastery, money-guide-2026) into a finished Penluma pillar the same
// way knowing-doing-gap was published:
//   1. Transform each raw chapter into an SEO blog post (full frontmatter,
//      Penluma voice) written to platform/transformed/<topicSlug>/<nn>-<slug>.md
//   2. Adversarial-editor pass on every post.
//   3. Build the pillar hub 00-index-<topicSlug>.md (roadmap funnel down to every post).
//   4. Add two-way internal links (outbound within the pillar + inbound from
//      neighbouring existing topics) and mark posts `linked: true`.
//
// This is a Claude Code Workflow script: it uses the injected globals
// `phase()`, `agent()`, `parallel()`, `pipeline()`, `log()` and RETURNS a
// summary object. It does NOT run the build/deploy and does NOT touch any
// shared file (topics.config.mjs, the research-root folder). Those are the
// manual follow-ups documented in README-book-to-pillar.md.
//
// ---------------------------------------------------------------------------
// HOW TO RUN
//   Either fill CONFIG below and run the workflow, OR invoke it with an `args`
//   object of the exact same shape (args wins when it has a postDefs array).
// ---------------------------------------------------------------------------

const RESEARCH_ROOT = '/home/priteshyadav/work/research-paper';
const PLATFORM = `${RESEARCH_ROOT}/platform`;
const DATE = new Date().toISOString().slice(0, 10); // e.g. 2026-07-04
const EXAMPLE_POST = `${PLATFORM}/transformed/knowing-doing-gap/01-why-you-dont-do-what-you-know.md`;
const EXAMPLE_HUB = `${PLATFORM}/transformed/knowing-doing-gap/00-index-knowing-doing-gap.md`;

// ---------------------------------------------------------------------------
// CONFIG - fill this for the book you're publishing. (Copy the block, don't
// guess slugs: `slug` becomes the permanent URL /blog/<topicSlug>/<nn>-<slug>.)
//
//   bookDir     - folder name under the research root that holds chapters/ (raw md)
//   topicSlug   - the pillar's URL slug + transformed/<topicSlug>/ dir name
//   topicTitle  - human topic title (goes in every post's topicTitle)
//   category    - MUST be one of CATEGORIES in topics.config.mjs (or add it there)
//   icon        - one emoji, reused on every post + the topic
//   postDefs[]  - one entry per chapter you want to publish, in reading order:
//                   n            -> order + numeric filename prefix (1..N)
//                   slug         -> URL slug (kebab-case, keyword-bearing, stable)
//                   src          -> raw chapter filename inside <bookDir>/chapters/
//                   workingTitle -> a hint for the writer (final title is rewritten)
// ---------------------------------------------------------------------------
const CONFIG = {
  bookDir: 'ui-ux-mastery',
  topicSlug: 'ui-ux-mastery',
  topicTitle: 'UI/UX Mastery',
  category: 'Design', // <-- ensure this exists in topics.config.mjs CATEGORIES
  icon: '🎨',
  postDefs: [
    // { n: 1, slug: 'what-is-ux-design', src: '01-intro.md', workingTitle: 'What UX design really is' },
    // { n: 2, slug: '...',               src: '02-....md',   workingTitle: '...' },
    // ...one entry per chapter...
  ],
};

const CFG =
  typeof args !== 'undefined' && args && Array.isArray(args.postDefs) && args.postDefs.length
    ? args
    : CONFIG;

// --- normalise + validate config -------------------------------------------
const { bookDir, topicSlug, topicTitle, category, icon } = CFG;
const postDefs = (CFG.postDefs || [])
  .map((p) => ({
    n: Number(p.n),
    slug: String(p.slug || '').trim(),
    src: String(p.src || '').trim(),
    workingTitle: String(p.workingTitle || '').trim(),
  }))
  .filter((p) => p.n && p.slug && p.src)
  .sort((a, b) => a.n - b.n);

for (const k of ['bookDir', 'topicSlug', 'topicTitle', 'category', 'icon']) {
  if (!CFG[k]) return { error: `CONFIG.${k} is required - fill it in (or pass it via args).` };
}
if (postDefs.length === 0) {
  return {
    error:
      'CONFIG.postDefs is empty. Add one {n, slug, src, workingTitle} per chapter you want to publish.',
  };
}

const CHAPTERS_DIR = `${RESEARCH_ROOT}/${bookDir}/chapters`;
const OUT_DIR = `${PLATFORM}/transformed/${topicSlug}`;
const HUB_FILE = `${OUT_DIR}/00-index-${topicSlug}.md`;
const pad2 = (n) => String(n).padStart(2, '0');
const postFile = (p) => `${OUT_DIR}/${pad2(p.n)}-${p.slug}.md`;
const postUrl = (p) => `/blog/${topicSlug}/${pad2(p.n)}-${p.slug}`;
const hubUrl = `/blog/${topicSlug}/00-index-${topicSlug}`;

// ---------------------------------------------------------------------------
// The Penluma blog standard (same bar as transform-batch.mjs) + the EXACT
// frontmatter schema mirrored from the knowing-doing-gap pillar.
// ---------------------------------------------------------------------------
const GUIDELINES = `
PENLUMA BLOG STANDARD - a blog is NOT a research paper. Transform, don't dump.

Voice: warm, clear, unhurried, conversational, quietly confident. Plain words, short
sentences, no academic jargon (define any unavoidable term in plain language). Lead
with the reader's outcome. Second person ("you"). A thoughtful friend who writes well.

Every article MUST have, in order:
1. A catchy, curiosity-driven H1 (frontmatter 'title') that targets a real search phrase
   AND accurately reflects the content. No misleading clickbait.
2. A strong 2-4 sentence HOOK (surprising fact, vivid scenario, or sharp question) -
   never "Welcome" or "In this article we will".
3. "## Why this matters" - concretely why the reader should care.
4. Core insights, each under its own ##/### heading, with at least one real example,
   analogy, or mini case study per major idea.
5. "## Common misconceptions" (when apt) - myths vs reality.
6. "## How to use this" / actionable, numbered do-this steps.
7. A memorable "## Conclusion" with the single key takeaway + a curiosity hook toward a
   related post (do NOT just summarise).
8. Must STAND ALONE - complete value even if it's the only thing they read.

Formatting: short paragraphs (1-3 sentences), descriptive H2/H3, bullet/numbered lists,
**bold** key terms. Keep the source's substance and accuracy, but drop methodology dumps,
excessive stats, and unexplained jargon. Clean markdown (no raw <div>/HTML). Match depth
to the source - don't dumb a deep topic down, just make it clear and engaging.
`;

// The frontmatter block every post must carry. Values in <angle brackets> are for
// the agent to fill; the rest are fixed for this pillar. This mirrors
// transformed/knowing-doing-gap/01-why-you-dont-do-what-you-know.md exactly.
const frontmatterTemplate = (p) => `---
title: "<curiosity-driven, keyword-bearing H1 - may be long>"
metaTitle: "<=60-char SERP <title>, primary keyword near the front>"
description: >-
  <~150-160 chars a searcher sees on Google; leads with substance; contains the primary keyword>
keywords:
  - <primary head keyword>
  - <8-12 realistic long-tail variants people actually search>
faq:
  - q: "<a real question people search>"
    a: >-
      <a direct, honest 1-3 sentence answer>
  # 4-6 faq entries total
author: Brexis Wazik
transformed: true
topic: ${topicSlug}
topicTitle: ${topicTitle}
category: ${category}
date: '${DATE}'
order: ${p.n}
icon: "${icon}"
sources: []
---`;

// Schemas returned by agents.
const WRITE_SCHEMA = {
  type: 'object',
  properties: {
    slug: { type: 'string' },
    title: { type: 'string' },
    words: { type: 'number' },
    ok: { type: 'boolean' },
  },
  required: ['slug', 'ok'],
};
const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    slug: { type: 'string' },
    finalScore: { type: 'number' },
    changed: { type: 'boolean' },
    verdict: { type: 'string', enum: ['publish', 'needs-work'] },
  },
  required: ['slug', 'verdict'],
};
const LINK_SCHEMA = {
  type: 'object',
  properties: {
    slug: { type: 'string' },
    linksAdded: { type: 'number' },
    ok: { type: 'boolean' },
  },
  required: ['slug', 'ok'],
};

// A compact roadmap of the pillar, handed to the hub + linking agents.
const ROADMAP = postDefs.map((p) => `${pad2(p.n)}. ${p.workingTitle || p.slug}  ->  ${postUrl(p)}`).join('\n');

// ===========================================================================
// PHASE 1 - Validate the source
// ===========================================================================
phase('Validate');
const check = await agent(
  `Verify a book folder is ready to transform into a Penluma pillar.

Run EXACTLY this bash and report what you see:

ls -1 ${CHAPTERS_DIR} 2>/dev/null

Then for THIS expected list of chapter source files, report which exist and which are MISSING:
${postDefs.map((p) => `- ${p.src}`).join('\n')}

Return {found: [existing src filenames], missing: [src filenames that do not exist in ${CHAPTERS_DIR}]}.`,
  {
    label: 'validate',
    phase: 'Validate',
    schema: {
      type: 'object',
      properties: {
        found: { type: 'array', items: { type: 'string' } },
        missing: { type: 'array', items: { type: 'string' } },
      },
      required: ['found', 'missing'],
    },
  }
);

if (check?.missing?.length) {
  return {
    error: `Missing chapter sources in ${CHAPTERS_DIR}: ${check.missing.join(', ')}. Fix postDefs.src and re-run.`,
    found: check.found || [],
  };
}
log(`Validated ${postDefs.length} chapter sources in ${CHAPTERS_DIR}.`);

// ===========================================================================
// PHASE 2 - Transform each chapter -> post, then adversarial edit (pipeline)
// ===========================================================================
phase('Transform');
const results = await pipeline(
  postDefs,
  (p) =>
    agent(
      `Transform ONE raw book chapter into a polished Penluma blog post for the "${topicTitle}" pillar.

READ, in this order:
- The raw chapter (the source content to transform): ${CHAPTERS_DIR}/${p.src}
- A finished Penluma post to copy STYLE + the EXACT frontmatter schema from:
  ${EXAMPLE_POST}

Working title hint (rewrite into something better if you can): "${p.workingTitle}"

${GUIDELINES}

FRONTMATTER - use EXACTLY this schema (fill the <angle-bracket> fields, keep the fixed
lines verbatim; do NOT add or remove keys, do NOT add a "linked:" line - the linking
phase adds that):

${frontmatterTemplate(p)}

Now WRITE the finished post (frontmatter + blank line + markdown body) to:
${postFile(p)}
(Use the Write tool; it creates directories. Keep this exact filename/slug.)

Keep the chapter's substance and any striking numbers/stories, but rewrite in Penluma
voice - this is a standalone blog post, not a chapter. Return the result object.`,
      { label: `write:${topicSlug}/${pad2(p.n)}-${p.slug}`, phase: 'Transform', schema: WRITE_SCHEMA }
    ),
  (_w, p) =>
    agent(
      `You are a demanding editor doing the final pass on a Penluma blog draft.

READ: ${postFile(p)}
Reference for the bar + frontmatter schema: ${EXAMPLE_POST}

Judge it hard against this standard:
${GUIDELINES}

EDIT the file in place (Write/Edit) to fix EVERY weakness: weak/generic hook or any
"Welcome"/"In this article" opener; academic tone, jargon, or long paragraphs; a title
that isn't curiosity-driven or is missing the key search term (fix title AND metaTitle);
missing/weak why-it-matters, examples/analogies, actionable tips, FAQ (need 4-6 real
searchable Qs), or a conclusion-with-curiosity-hook; description not ~150-160 chars or
missing its keyword; thin keywords (need 8-15); any invented source URL (remove it); raw
<div>/HTML left over (convert to clean markdown).

Frontmatter MUST stay exactly: author: Brexis Wazik, transformed: true, topic: ${topicSlug},
topicTitle: ${topicTitle}, category: ${category}, order: ${p.n}, icon: "${icon}", date: '${DATE}',
sources: []. Do NOT add a "linked:" line yet.

Only mark 'publish' once it fully meets the standard.`,
      { label: `edit:${topicSlug}/${pad2(p.n)}-${p.slug}`, phase: 'Transform', schema: REVIEW_SCHEMA }
    )
);

const written = results.filter(Boolean);
log(`Transformed ${written.length}/${postDefs.length} posts into ${OUT_DIR}.`);

// ===========================================================================
// PHASE 3 - Build the pillar hub (00-index-<topicSlug>.md)
// ===========================================================================
phase('Hub');
const hub = await agent(
  `Build the PILLAR HUB (roadmap/funnel page) for the "${topicTitle}" pillar.

READ these for structure + the EXACT frontmatter schema:
- Example hub to mirror 1:1 in structure and tone: ${EXAMPLE_HUB}
- The posts this hub links down to live in: ${OUT_DIR}/ (read a couple to get their
  final titles + one-line value hooks; the URLs are listed below).

The pillar's posts, in reading order (final URL each hub link must point to):
${ROADMAP}

WRITE the hub to: ${HUB_FILE}

Requirements (mirror the example hub exactly):
- Frontmatter identical in shape to the example hub: title, metaTitle, description (>-),
  keywords (10-ish), faq (5-6 {q,a}), author: Brexis Wazik, transformed: true, topic: ${topicSlug},
  topicTitle: ${topicTitle}, category: ${category}, date: '${DATE}', order: 0, icon: "${icon}",
  sources: []. (Do NOT add a "linked:" line; the linking phase adds it.)
- order: 0 and the "00-index-" filename are what make this the hub - keep both.
- Body: a strong hook, an "## In short" bolded summary, "## Who this is for",
  "## Why it matters", "## The full roadmap" that lists EVERY post above as a markdown
  link "[Final Title](${'/blog/' + topicSlug + '/<nn-slug>'})  ::  one-line value hook",
  grouped into 2-4 sensible tiers, a "## Start here" short path, a "## The bottom line",
  and a closing newsletter CTA line.
- Use ONLY the exact URLs listed above for the down-links. Never invent URLs.

Return {ok: true, title, links: <number of down-links added>}.`,
  {
    label: `hub:${topicSlug}`,
    phase: 'Hub',
    schema: {
      type: 'object',
      properties: { ok: { type: 'boolean' }, title: { type: 'string' }, links: { type: 'number' } },
      required: ['ok'],
    },
  }
);
log(`Hub built at ${HUB_FILE} (${hub?.links ?? '?'} down-links).`);

// ===========================================================================
// PHASE 4a - Outbound internal links inside the pillar (+ mark linked: true)
// ===========================================================================
phase('Link');
const allTargets = [{ url: hubUrl, file: HUB_FILE }, ...postDefs.map((p) => ({ url: postUrl(p), file: postFile(p) }))];

const outbound = await parallel(
  allTargets.map((t) => () =>
    agent(
      `Add contextual in-body internal links to ONE Penluma post for topical-authority SEO.

POST TO EDIT: ${t.file}
LINK INDEX (all publishable posts, JSON of {id,title,topicTitle}): ${PLATFORM}/src/posts.generated.json
This pillar's own posts (URLs you can also link to, they are brand-new so not in the index yet):
${allTargets.map((x) => `- ${x.url}`).join('\n')}

Task:
1. Read the post body, the link index, and the pillar URL list above.
2. Find 3-6 places where a natural noun phrase already refers to a concept another post
   covers, and turn that phrase into a markdown link [phrase](/blog/<id-or-pillar-url>).
   Prefer same-pillar links first, then genuinely relevant posts from other topics.
3. Rules:
   - Link GENUINELY relevant targets only. NEVER link a post to itself. Use real ids from
     the index or the exact pillar URLs above - no invented URLs.
   - Link each target at most once; 3-6 links total; never two links back-to-back.
   - Link natural phrases in prose only - NOT in headings, code blocks, the FAQ, or inside
     existing links. Keep the surrounding sentence otherwise unchanged.
   - Do not touch the YAML frontmatter EXCEPT to add the single line "linked: true"
     (so this post isn't reprocessed by the internal-links workflow).
4. Save the file in place.

Return how many links you added.`,
      { label: `out:${t.url}`, phase: 'Link', schema: LINK_SCHEMA }
    )
  )
);
log(`Added outbound links to ${outbound.filter(Boolean).length} pillar pages.`);

// ===========================================================================
// PHASE 4b - Inbound links: existing neighbour posts should point AT the pillar
// (the step that always gets skipped). One agent, edits a handful of neighbours.
// ===========================================================================
const inbound = await agent(
  `Add INBOUND internal links so existing Penluma posts point AT the brand-new "${topicTitle}"
pillar (a new pillar with zero inbound links is invisible to internal PageRank).

NEW PILLAR URLs you may link TO:
- Hub: ${hubUrl}
${postDefs.map((p) => `- ${postUrl(p)}`).join('\n')}

Steps:
1. Read the link index ${PLATFORM}/src/posts.generated.json to find EXISTING posts in
   genuinely related topics (neighbours) - e.g. same category "${category}" or adjacent
   themes. Category list + topic map: ${PLATFORM}/topics.config.mjs.
2. Pick 4-8 strong neighbour posts. For each, open its file under
   ${PLATFORM}/transformed/<topic>/<slug>.md, find ONE natural noun phrase that genuinely
   refers to a concept this new pillar covers, and turn it into a markdown link to the most
   relevant NEW url above (prefer deep-linking to a specific post over the hub).
3. Rules: descriptive anchor text on real words in a sentence (never "click here"); one
   link per neighbour; only where it reads naturally - skip if nothing fits; never edit the
   FAQ, headings, code, or frontmatter of the neighbour; use ONLY the exact new URLs above.
4. Save each edited neighbour in place.

Verify at the end by conceptually running:
  grep -rl "/blog/${topicSlug}/" ${PLATFORM}/transformed --include='*.md' | grep -v "/${topicSlug}/"
It should be non-empty. Return {inboundAdded: <number of neighbour files edited>, files: [paths edited]}.`,
  {
    label: `inbound:${topicSlug}`,
    phase: 'Link',
    schema: {
      type: 'object',
      properties: {
        inboundAdded: { type: 'number' },
        files: { type: 'array', items: { type: 'string' } },
      },
      required: ['inboundAdded'],
    },
  }
);

// ===========================================================================
// Summary + the manual follow-ups the workflow deliberately does NOT do.
// ===========================================================================
return {
  pillar: topicSlug,
  transformedDir: OUT_DIR,
  postsTransformed: written.length,
  postsExpected: postDefs.length,
  needsWork: written.filter((r) => r.verdict && r.verdict !== 'publish').map((r) => r.slug),
  hubBuilt: !!hub?.ok,
  outboundLinkedPages: outbound.filter(Boolean).length,
  inboundNeighboursLinked: inbound?.inboundAdded ?? 0,
  manualFollowUps: [
    `Register the topic in ${PLATFORM}/topics.config.mjs (title, description, category:"${category}", icon:"${icon}", order, featured:true for a pillar).`,
    `GOTCHA: copy the transformed md into the research-root folder so the importer REGISTERS the topic:  cp ${OUT_DIR}/*.md ${RESEARCH_ROOT}/${topicSlug}/  (create ${RESEARCH_ROOT}/${topicSlug}/ first if needed).`,
    `Verify inbound links exist:  cd ${PLATFORM} && grep -rl "/blog/${topicSlug}/" transformed --include='*.md' | grep -v "/${topicSlug}/"`,
    `Then from ${PLATFORM}: npm run build  (verify no frontmatter errors), then npm run deploy (ONLY when the owner asks).`,
  ],
  note: 'See workflows/README-book-to-pillar.md for the full checklist.',
};
