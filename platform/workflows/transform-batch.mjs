export const meta = {
  name: 'penluma-transform-batch',
  description: 'Transform the next batch of raw research posts into SEO blogs (resumable)',
  phases: [
    { title: 'Discover', detail: 'find the next untransformed posts' },
    { title: 'Rewrite', detail: 'research → engaging SEO blog' },
    { title: 'Edit & QA', detail: 'adversarial editor improves each draft' },
  ],
};

const PLATFORM = '/home/priteshyadav/work/research-paper/platform';
const LIMIT = 240; // posts per run → ~480 agents, under the 1000/run cap

const GUIDELINES = `
PENLUMA BLOG STANDARD — a blog is NOT a research paper. Transform, don't copy.

Voice: warm, clear, unhurried, conversational, quietly confident. Plain words, short
sentences, no academic jargon (define any unavoidable term in plain language). Lead with
the reader's outcome. Second person ("you"). A thoughtful friend who writes well.

Every article MUST have, in this order:
1. A catchy, curiosity-driven H1 title (frontmatter 'title') that targets a real search
   phrase AND accurately reflects the content. No misleading clickbait.
2. A strong 2-4 sentence HOOK opening (surprising fact, vivid scenario, or sharp question)
   — never "Welcome" or "In this article we will".
3. "## Why this matters" — why the reader should care, concretely.
4. The core insight(s) in simple language, each under its own "##"/"###" heading, with at
   least one real-world example, analogy, or mini case study per major idea.
5. "## Common misconceptions" (if applicable) — myths vs reality.
6. "## How to use this" / actionable tips — concrete, numbered, do-this steps.
7. A memorable "## Conclusion" with the single key takeaway + a curiosity hook toward a
   related topic (do NOT just summarize the article).
8. The article must STAND ALONE — complete value even if it's the only thing they read.

Formatting: short paragraphs (1-3 sentences), descriptive H2/H3, bullet/numbered lists,
**bold** key terms. Keep the research's substance and accuracy, but drop methodology,
excessive stats, and unexplained jargon. Use markdown (not raw <div> HTML). Match the
article's depth to the source — a deep technical topic stays substantive; don't dumb it
down, just make it clear and engaging.

SEO frontmatter (ALL required):
- title: curiosity-driven, keyword-bearing, <= ~65 chars if possible
- metaTitle: <= 60 chars, primary keyword near the front
- description: 140-160 chars, compelling, contains the primary keyword
- keywords: 8-15 real search terms (mix head + long-tail)
- faq: 4-6 entries of {q, a}. q = a real searched question; a = concise 1-3 sentence answer.
- author: Pritesh Yadav (priteshyadav444)
- transformed: true
- PRESERVE from the source file exactly: topic, topicTitle, category, order, icon, date.
- sources: optional. ONLY include if certain the URL is stable/canonical (e.g. an
  https://en.wikipedia.org/wiki/... page, or a famous book/paper by exact title). If
  unsure use [] and cite works by name in the body. NEVER invent a URL.
`;

const WRITE_SCHEMA = {
  type: 'object',
  properties: {
    slug: { type: 'string' },
    title: { type: 'string' },
    ok: { type: 'boolean' },
    words: { type: 'number' },
  },
  required: ['slug', 'ok'],
};

const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    slug: { type: 'string' },
    finalScore: { type: 'number' },
    changed: { type: 'boolean' },
    title: { type: 'string' },
    verdict: { type: 'string', enum: ['publish', 'needs-work'] },
  },
  required: ['slug', 'finalScore', 'verdict'],
};

// --- Discover the next untransformed posts -------------------------------
phase('Discover');
const disc = await agent(
  `Run EXACTLY this bash command and report its output:

cd ${PLATFORM} && comm -23 <(cd src/content/blog && ls */*.md | sort) <(cd transformed 2>/dev/null && ls */*.md 2>/dev/null | sort) | head -${LIMIT}

It lists raw research posts that have NOT yet been transformed, as "topic/slug.md" path
lines. Return them verbatim as an array of strings in {paths}. If the output is empty,
return {paths: []}.`,
  {
    label: 'discover',
    phase: 'Discover',
    schema: {
      type: 'object',
      properties: { paths: { type: 'array', items: { type: 'string' } } },
      required: ['paths'],
    },
  }
);

const items = (disc?.paths || [])
  .map((p) => String(p).trim())
  .filter((p) => p.endsWith('.md') && p.includes('/'))
  .map((p) => {
    const rel = p.replace(/\.md$/, '');
    const i = rel.indexOf('/');
    return { topic: rel.slice(0, i), slug: rel.slice(i + 1) };
  });

log(`Discovered ${items.length} untransformed posts this batch.`);
if (items.length === 0) {
  return { batch: 0, message: 'Nothing left to transform — all posts are done.' };
}

// --- Rewrite → adversarial edit (pipeline, per post) ---------------------
phase('Rewrite');
const results = await pipeline(
  items,
  (it) =>
    agent(
      `Transform a raw research post into a polished Penluma blog article.

READ the source: ${PLATFORM}/src/content/blog/${it.topic}/${it.slug}.md
It has YAML frontmatter (topic, topicTitle, category, date, order, icon) then a research
body (often raw HTML). Preserve those frontmatter values exactly.

${GUIDELINES}

Now WRITE the finished article to: ${PLATFORM}/transformed/${it.topic}/${it.slug}.md
(Use the Write tool; it creates directories. Keep the SAME slug/filename.)
The file = YAML frontmatter (all SEO fields) + a blank line + the markdown body.
Make it genuinely excellent and useful. Return the result object.`,
      { label: `write:${it.topic}/${it.slug}`, phase: 'Rewrite', schema: WRITE_SCHEMA }
    ),
  (_w, it) =>
    agent(
      `You are a demanding editor doing the final pass on a Penluma blog draft.

READ: ${PLATFORM}/transformed/${it.topic}/${it.slug}.md

Judge it hard against this standard:
${GUIDELINES}

Then EDIT the file in place (Write/Edit) to fix EVERY weakness: weak/generic hook or any
"Welcome"/"In this article" opener; academic tone, jargon, or long paragraphs; a title
that isn't curiosity-driven or is missing the key search term (fix title AND metaTitle);
missing/weak why-it-matters, examples/analogies, actionable tips, FAQ (need 4-6 real
searchable Qs), or a conclusion-with-curiosity-hook; a description not 140-160 chars or
missing its keyword; thin keywords (need 8-15); any invented source URL (remove it); raw
<div>/HTML left from the research (convert to clean markdown). Verify the frontmatter still
preserves topic/topicTitle/category/order/icon/date.

Leave it publish-ready. Only mark 'publish' if it now fully meets the standard.`,
      { label: `edit:${it.topic}/${it.slug}`, phase: 'Edit & QA', schema: REVIEW_SCHEMA }
    )
);

const done = results.filter(Boolean);
const byTopic = {};
for (const r of done) {
  const t = (r.slug || '').split('/')[0] || 'unknown';
}
return {
  batchTransformed: done.length,
  publishReady: done.filter((r) => r.verdict === 'publish').length,
  avgScore:
    done.length
      ? Math.round((done.reduce((s, r) => s + (r.finalScore || 0), 0) / done.length) * 10) / 10
      : 0,
  needsWork: done.filter((r) => r.verdict !== 'publish').map((r) => r.slug),
  note: 'Re-run this workflow to transform the next batch until 0 remain.',
};
