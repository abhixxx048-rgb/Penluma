import rss from '@astrojs/rss';
import { topics, topicBySlug, postsForTopic } from '../../lib/content.ts';
import { SITE } from '../../consts.ts';

// One RSS 2.0 feed per published topic, mirroring the global /rss.xml shape
// but scoped to a single topic. Topics come from the same generated manifest
// the rest of the site uses, so this stays in sync automatically.
export function getStaticPaths() {
  return topics.map((topic) => ({ params: { topic: topic.slug } }));
}

export async function GET(context) {
  const topic = topicBySlug(context.params.topic);
  // Resilient: if the slug isn't a known topic, emit nothing (404).
  if (!topic) {
    return new Response(null, { status: 404 });
  }

  const posts = await postsForTopic(topic.slug);

  return rss({
    title: `${topic.title} — ${SITE.title}`,
    description: topic.description,
    site: context.site,
    items: posts.slice(0, 50).map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${post.id}/`,
      categories: [post.data.topicTitle],
    })),
  });
}
