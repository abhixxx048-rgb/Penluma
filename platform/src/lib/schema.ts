/**
 * schema.ts — pure JSON-LD builders for richer Google results.
 *
 * These are framework-agnostic: every function returns a plain JSON-LD object
 * (a `Record<string, unknown>`) or `null` when the data needed to make a valid
 * node is missing. Nothing here imports Astro, reads the filesystem, or emits a
 * <script> tag — the call site (`blog/[...slug].astro`, a pillar hub page) is
 * responsible for assembling the array and handing it to `BaseLayout`'s
 * existing `jsonLd` prop, which renders one
 * `<script type="application/ld+json">` per entry (see BaseLayout.astro).
 *
 * Because a `null` in that array would break `JSON.stringify` at render time,
 * ALWAYS filter before passing on, e.g.:
 *
 *   const jsonLd = [ ...existing, courseJsonLd({ … }) ].filter(Boolean);
 *
 * This mirrors the "render nothing when data is absent" convention used across
 * the components — a hub with no siblings, or a how-to with no headings, simply
 * contributes no structured data instead of an empty/invalid node.
 */

/** A single lesson/sibling link inside a pillar course. */
export interface SchemaPost {
  /** Human-readable lesson title. */
  title: string;
  /** Absolute URL to the lesson (e.g. https://penluma.com/blog/topic/01-slug/). */
  url: string;
}

/** A single ordered step inside a how-to/playbook. */
export interface SchemaStep {
  /** Short step name — typically an h2 heading text. */
  name: string;
  /** The step body/summary. Falls back to `name` when empty. */
  text?: string;
  /** Optional deep link to the step (e.g. the heading anchor `#slug`). */
  url?: string;
}

/** Minimal shape of the bits of post frontmatter these predicates read. */
export interface SchemaFrontmatter {
  order?: number;
  /** Optional opt-in: set to the string "howto" to emit a HowTo node. */
  schemaType?: string;
  [key: string]: unknown;
}

/**
 * A pillar is a free, multi-part course; its hub (order 0) is the course page.
 * Returns a schema.org `Course` whose `hasPart` lists every sub-post as an
 * ordered lightweight `Course`, plus a free `Offer` so Google can surface it as
 * a (free) course result.
 *
 * Derive `posts` at the call site from the pillar siblings:
 *
 *   import { postsForTopic } from '../lib/content';
 *   const siblings = await postsForTopic(topicSlug);           // sorted by order
 *   const posts = siblings
 *     .filter((p) => p.data.order !== 0)                       // drop the hub itself
 *     .map((p) => ({
 *       title: p.data.title,
 *       url: new URL(`/blog/${p.id}/`, Astro.site).toString(), // ABSOLUTE urls
 *     }));
 *
 * @returns the Course node, or `null` if there is no title or no parts.
 */
export function courseJsonLd(opts: {
  title: string;
  description?: string;
  url: string;
  /** Provider/organization name, e.g. SITE.name. */
  provider: string;
  posts: SchemaPost[];
}): Record<string, unknown> | null {
  const { title, description, url, provider, posts } = opts;
  const parts = (posts ?? []).filter((p) => p && p.title && p.url);
  if (!title || parts.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: title,
    ...(description ? { description } : {}),
    ...(url ? { url } : {}),
    ...(url ? { mainEntityOfPage: { '@type': 'WebPage', '@id': url } } : {}),
    provider: { '@type': 'Organization', name: provider },
    // Free multi-part course → advertise it as such for course rich results.
    offers: {
      '@type': 'Offer',
      category: 'Free',
      price: 0,
      priceCurrency: 'USD',
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: `PT${Math.max(1, parts.length) * 10}M`,
    },
    numberOfLessons: parts.length,
    hasPart: parts.map((p, i) => ({
      '@type': 'Course',
      position: i + 1,
      name: p.title,
      url: p.url,
      provider: { '@type': 'Organization', name: provider },
    })),
  };
}

/**
 * A playbook/how-to post as a schema.org `HowTo`, whose `step` list drives the
 * "steps" rich result.
 *
 * Derive `steps` at the call site from the rendered post's h2 headings — Astro's
 * `render(post)` returns a `headings` array of `{ depth, slug, text }`:
 *
 *   const { Content, headings } = await render(post);
 *   const steps = headings
 *     .filter((h) => h.depth === 2)                            // top-level sections
 *     .map((h) => ({
 *       name: h.text,
 *       text: h.text,                                          // no per-section body available here
 *       url: `${canonicalUrl}#${h.slug}`,                      // deep link to the anchor
 *     }));
 *
 * If you have richer per-step copy (e.g. the first paragraph after each h2),
 * pass it as `text`; otherwise `name` is reused so the node stays valid.
 *
 * @returns the HowTo node, or `null` if there is no title or no steps.
 */
export function howToJsonLd(opts: {
  title: string;
  description?: string;
  url?: string;
  steps: SchemaStep[];
}): Record<string, unknown> | null {
  const { title, description, url, steps } = opts;
  const clean = (steps ?? []).filter((s) => s && s.name);
  if (!title || clean.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    ...(description ? { description } : {}),
    ...(url ? { mainEntityOfPage: { '@type': 'WebPage', '@id': url } } : {}),
    step: clean.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text || s.name,
      ...(s.url ? { url: s.url } : {}),
    })),
  };
}

/**
 * A schema.org `LearningResource` — useful on an individual pillar lesson to
 * mark it as part of the parent course. Optional and additive; safe to emit
 * alongside the existing BlogPosting node.
 *
 * At the call site, `isPartOf` should point at the pillar hub:
 *
 *   learningResourceJsonLd({
 *     title: post.data.title,
 *     description: post.data.description,
 *     url: canonicalUrl,
 *     isPartOf: {
 *       name: topic.title,
 *       url: new URL(`/blog/${topicSlug}/00-index-${topicSlug}/`, Astro.site).toString(),
 *     },
 *   });
 *
 * @returns the LearningResource node, or `null` if there is no title.
 */
export function learningResourceJsonLd(opts: {
  title: string;
  description?: string;
  url?: string;
  /** e.g. "Lesson", "Article", "Guide". */
  learningResourceType?: string;
  educationalLevel?: string;
  /** The parent course/pillar this lesson belongs to. */
  isPartOf?: { name: string; url: string };
}): Record<string, unknown> | null {
  const { title, description, url, learningResourceType, educationalLevel, isPartOf } = opts;
  if (!title) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: title,
    ...(description ? { description } : {}),
    ...(url ? { url } : {}),
    learningResourceType: learningResourceType || 'Article',
    ...(educationalLevel ? { educationalLevel } : {}),
    ...(isPartOf
      ? { isPartOf: { '@type': 'Course', name: isPartOf.name, url: isPartOf.url } }
      : {}),
  };
}

/**
 * True when a post is a pillar HUB (the `00-index-*` page, `order: 0`).
 * Use this at the call site to decide whether to emit `courseJsonLd`.
 */
export function isHubPost(frontmatter: SchemaFrontmatter | undefined | null): boolean {
  return !!frontmatter && frontmatter.order === 0;
}

/**
 * True when a post has explicitly opted into HowTo structured data via the
 * optional `schemaType: howto` frontmatter field. Use this to decide whether to
 * emit `howToJsonLd` instead of (or in addition to) the default BlogPosting.
 */
export function shouldBeHowTo(frontmatter: SchemaFrontmatter | undefined | null): boolean {
  return !!frontmatter && frontmatter.schemaType === 'howto';
}
