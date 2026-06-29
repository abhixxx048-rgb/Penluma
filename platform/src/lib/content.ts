import { getCollection, type CollectionEntry } from 'astro:content';
import topicsManifest from '../topics.generated.json';
import featuredManifest from '../featured.generated.json';

export type FeaturedPost = {
  title: string;
  description: string;
  topicTitle: string;
  icon: string;
  id: string;
};

export const featuredPosts = featuredManifest as FeaturedPost[];

export type Topic = {
  slug: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  order: number;
  featured: boolean;
  postCount: number;
};

export const topics = topicsManifest as Topic[];

export function topicBySlug(slug: string): Topic | undefined {
  return topics.find((t) => t.slug === slug);
}

export function topicsByCategory(): { category: string; topics: Topic[] }[] {
  const map = new Map<string, Topic[]>();
  for (const t of topics) {
    if (!map.has(t.category)) map.set(t.category, []);
    map.get(t.category)!.push(t);
  }
  return [...map.entries()].map(([category, ts]) => ({
    category,
    topics: ts.sort((a, b) => a.order - b.order),
  }));
}

export async function allPosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function postsForTopic(slug: string): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog', ({ data }) => data.topic === slug && !data.draft);
  // numbered courses read in order; otherwise newest first
  return posts.sort((a, b) => {
    if (a.data.order !== b.data.order) return a.data.order - b.data.order;
    return b.data.date.getTime() - a.data.date.getTime();
  });
}

/** Related posts for "Continue reading": same topic first, then same category. */
export async function relatedPosts(
  post: CollectionEntry<'blog'>,
  limit = 3
): Promise<CollectionEntry<'blog'>[]> {
  const all = await getCollection('blog', ({ data }) => !data.draft);
  const others = all.filter((p) => p.id !== post.id);
  const sameTopic = others.filter((p) => p.data.topic === post.data.topic);
  const sameCategory = others.filter(
    (p) => p.data.category === post.data.category && p.data.topic !== post.data.topic
  );
  const pool = [...sameTopic, ...sameCategory];
  return pool.slice(0, limit);
}
