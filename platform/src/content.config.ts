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
  }),
});

export const collections = { blog };
