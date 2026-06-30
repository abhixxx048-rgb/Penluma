import { SITE } from '../consts';
import topics from '../topics.generated.json';
import posts from '../posts.generated.json';

export const prerender = true;

const SITE_URL = 'https://penluma.com';
const MAX_POSTS_PER_TOPIC = 8;

type Post = { id: string; title: string; topicTitle: string };

export async function GET() {
  const allPosts = posts as Post[];

  // Group posts by their topic title for quick lookup.
  const postsByTopic = new Map<string, Post[]>();
  for (const post of allPosts) {
    const list = postsByTopic.get(post.topicTitle);
    if (list) list.push(post);
    else postsByTopic.set(post.topicTitle, [post]);
  }

  const lines: string[] = [];

  // H1 + one-line blockquote description (llms.txt spec).
  lines.push(`# ${SITE.name}`);
  lines.push('');
  lines.push(`> ${SITE.tagline}`);
  lines.push('');
  lines.push(SITE.description);
  lines.push('');
  lines.push(
    `Written by ${SITE.author}. Each entry below is a full article taken from plain-language intuition to precise mechanics to the failure modes that show up in the real world.`
  );
  lines.push('');

  // Topics section.
  lines.push('## Topics');
  lines.push('');

  for (const topic of topics) {
    const topicPosts = postsByTopic.get(topic.title) ?? [];
    if (topicPosts.length === 0) continue;

    lines.push(`### ${topic.title}`);
    lines.push('');
    if (topic.description) {
      lines.push(topic.description);
      lines.push('');
    }
    for (const post of topicPosts.slice(0, MAX_POSTS_PER_TOPIC)) {
      lines.push(`- [${post.title}](${SITE_URL}/blog/${post.id})`);
    }
    lines.push('');
  }

  // About section.
  lines.push('## About');
  lines.push('');
  lines.push(`- [About ${SITE.name}](${SITE_URL}/about)`);
  lines.push('');

  const body = lines.join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
