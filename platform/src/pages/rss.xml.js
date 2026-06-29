import rss from '@astrojs/rss';
import { allPosts } from '../lib/content.ts';
import { SITE } from '../consts.ts';

export async function GET(context) {
  const posts = await allPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
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
