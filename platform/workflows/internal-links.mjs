export const meta = {
  name: 'penluma-internal-links',
  description: 'Add contextual in-body internal links across posts for topical SEO',
  phases: [
    { title: 'Discover', detail: 'find posts not yet internally linked' },
    { title: 'Link', detail: 'insert 3-6 contextual links per post' },
  ],
};

const PLATFORM = '/home/priteshyadav/work/research-paper/platform';
const LIMIT = 240; // 1 agent/post; resumable via the `linked: true` marker

const SCHEMA = {
  type: 'object',
  properties: {
    slug: { type: 'string' },
    linksAdded: { type: 'number' },
    ok: { type: 'boolean' },
  },
  required: ['slug', 'ok'],
};

// Discover transformed posts that don't yet have `linked: true`.
phase('Discover');
const disc = await agent(
  `Run EXACTLY this bash and return the output lines as {paths} ("topic/slug.md", max ${LIMIT}):

cd ${PLATFORM}/transformed && for f in */*.md; do grep -qi '^linked: true' "$f" || echo "$f"; done | head -${LIMIT}

If empty, return {paths: []}.`,
  {
    label: 'discover',
    phase: 'Discover',
    schema: { type: 'object', properties: { paths: { type: 'array', items: { type: 'string' } } }, required: ['paths'] },
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

log(`Discovered ${items.length} posts needing internal links.`);
if (items.length === 0) return { linked: 0, message: 'All posts already internally linked.' };

phase('Link');
const results = await parallel(
  items.map((it) => () =>
    agent(
      `Add contextual internal links to one Penluma blog post for topical-authority SEO.

POST TO EDIT: ${PLATFORM}/transformed/${it.topic}/${it.slug}.md
LINK INDEX (all publishable posts, JSON of {id,title,topicTitle}): ${PLATFORM}/src/posts.generated.json

Task:
1. Read the post body and the link index.
2. Find 3-6 places in the BODY where a phrase naturally refers to a concept that another
   post covers. Turn that phrase into a markdown link: [phrase](/blog/<id>) where <id> is the
   other post's "id" from the index (e.g. /blog/system-design/06-caching-deep).
3. Rules:
   - Link to GENUINELY relevant posts only — prefer same topic or a directly related concept.
   - NEVER link a post to itself. Use real ids from the index only (no invented URLs).
   - Link a given target at most once. Don't over-link: 3-6 total is the target.
   - Link natural noun phrases in prose; do NOT put links in headings, code blocks, the FAQ,
     or existing links. Keep the surrounding sentence unchanged otherwise.
   - Do not touch the YAML frontmatter except to ADD a line "linked: true" (so this post
     isn't reprocessed).
4. Save the file in place (Edit/Write).

Return how many links you added.`,
      { label: `link:${it.topic}/${it.slug}`, phase: 'Link', schema: SCHEMA }
    )
  )
);

const done = results.filter(Boolean);
return {
  linked: done.length,
  totalLinksAdded: done.reduce((s, r) => s + (r.linksAdded || 0), 0),
  note: 'Re-run until 0 remain.',
};
