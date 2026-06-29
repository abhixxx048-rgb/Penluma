import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    topic: z.string(),
    topicTitle: z.string(),
    category: z.string(),
    date: z.coerce.date(),
    order: z.number().default(999),
    icon: z.string().default('📚'),
    draft: z.boolean().default(false),

    // --- SEO / blog-format fields (populated by the transform workflow) ---
    /** Optional <title> override (≤60 chars); falls back to `title`. */
    metaTitle: z.string().optional(),
    /** Target search keywords for this article. */
    keywords: z.array(z.string()).default([]),
    /** FAQ entries — rendered as a section + FAQPage schema. */
    faq: z
      .array(z.object({ q: z.string(), a: z.string() }))
      .default([]),
    /** Trusted external sources — rendered as "Further reading".
        Accepts either a bare URL string or a {title, url} object. */
    sources: z
      .array(
        z.union([
          z.string(),
          z.object({ title: z.string().optional(), url: z.string() }),
        ])
      )
      .default([])
      .transform((arr) =>
        arr.map((s) => {
          if (typeof s === 'string') {
            // derive a readable title from the URL's last path segment
            const seg = s.split(/[/#?]/).filter(Boolean).pop() || s;
            const title = decodeURIComponent(seg).replace(/[-_]/g, ' ').trim();
            return { title: title || s, url: s };
          }
          return { title: s.title || s.url, url: s.url };
        })
      ),
    /** Byline. */
    author: z.string().optional(),
    /** True once a post has been rewritten from raw research into blog form. */
    transformed: z.boolean().default(false),
  }),
});

export const collections = { blog };
