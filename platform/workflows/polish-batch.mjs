export const meta = {
  name: 'penluma-polish-batch',
  description: 'Adversarial-editor polish pass over posts that only got stage-1 rewrite',
  phases: [
    { title: 'Discover', detail: 'find transformed posts not yet polished' },
    { title: 'Polish', detail: 'adversarial editor improves each in place' },
  ],
};

const PLATFORM = '/home/priteshyadav/work/research-paper/platform';
const LIMIT = 200; // edit-only = 1 agent/post, well under the 1000/run cap

// Topics whose posts had their stage-2 edit fail on the session limit.
const TOPICS = [
  'system-design',
  'security-privacy-engineering',
  'systems-fundamentals',
  'systems-thinking',
  'ten-disciplines',
  'sales-customer-development',
  'retention-lifecycle',
];

const GUIDELINES = `
PENLUMA BLOG STANDARD - a blog is NOT a research paper. Transform, don't copy.
Voice: warm, clear, unhurried, conversational, no academic jargon (define unavoidable
terms). Second person, outcome-first. Must have: catchy curiosity-driven H1 (keyword-
bearing); strong hook (never "Welcome"/"In this article"); "## Why this matters"; core
ideas under ##/### with a real example/analogy each; "## Common misconceptions" if apt;
"## How to use this" numbered actionable tips; memorable "## Conclusion" + curiosity hook.
Short paragraphs, descriptive headings, bullets, **bold** key terms, clean markdown (no
raw <div>). Keep technical depth where the source is deep - clarify, don't dumb down.
SEO frontmatter: title; metaTitle (<=60); description (140-160, keyword); keywords (8-15
head+long-tail); faq (4-6 {q,a} real searched questions); author: Pritesh Yadav (priteshyadav444);
transformed: true; PRESERVE topic/topicTitle/category/order/icon/date; sources only if the
URL is certainly stable/canonical else [] (never invent a URL).
`;

const SCHEMA = {
  type: 'object',
  properties: {
    slug: { type: 'string' },
    finalScore: { type: 'number' },
    changed: { type: 'boolean' },
    verdict: { type: 'string', enum: ['publish', 'needs-work'] },
  },
  required: ['slug', 'verdict'],
};

// Discover transformed posts in the affected topics that are NOT yet marked polished.
phase('Discover');
const disc = await agent(
  `Run EXACTLY this bash and return the output lines as {paths} (an array of "topic/slug.md"):

cd ${PLATFORM}/transformed && for t in ${TOPICS.join(' ')}; do
  for f in "$t"/*.md; do [ -e "$f" ] || continue; grep -qi '^polished: true' "$f" || echo "$f"; done
done | head -${LIMIT}

These are transformed posts that still need the adversarial polish pass. If empty, return {paths: []}.`,
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

log(`Discovered ${items.length} posts needing polish.`);
if (items.length === 0) return { polished: 0, message: 'All targeted posts already polished.' };

phase('Polish');
const results = await parallel(
  items.map((it) => () =>
    agent(
      `You are a demanding editor doing the final polish on a Penluma blog draft that was
written but never edited.

READ: ${PLATFORM}/transformed/${it.topic}/${it.slug}.md

Judge it hard against this standard:
${GUIDELINES}

EDIT the file in place (Write/Edit) to fix EVERY weakness: weak/generic hook or any
"Welcome"/"In this article" opener; academic tone, jargon, or long paragraphs; a title
that isn't curiosity-driven or missing the key search term (fix title AND metaTitle);
missing/weak why-it-matters, examples/analogies, actionable tips, FAQ (4-6 real searched
Qs), or conclusion-with-curiosity-hook; description not 140-160 chars or missing keyword;
thin keywords (need 8-15); any invented source URL (remove); raw <div>/HTML (convert to
markdown). Preserve topic/topicTitle/category/order/icon/date in frontmatter.

CRUCIAL: after editing, ADD the line "polished: true" to the YAML frontmatter (so this
post is not re-processed). Leave it publish-ready.`,
      { label: `polish:${it.topic}/${it.slug}`, phase: 'Polish', schema: SCHEMA }
    )
  )
);

const done = results.filter(Boolean);
return {
  polished: done.length,
  publishReady: done.filter((r) => r.verdict === 'publish').length,
  note: 'Re-run until 0 remain.',
};
