import { OGImageRoute } from 'astro-og-canvas';
import { getCollection } from 'astro:content';
import { SITE } from '../../consts';

// Generate these PNGs at build time (not on the Cloudflare edge at runtime).
export const prerender = true;

// Build a page map: one branded OG card per blog post, plus a site default.
const posts = await getCollection('blog', ({ data }) => !data.draft);

const pages: Record<string, { title: string; description: string }> = {
  // /og/default.png — used by the home page and any page without its own image
  default: { title: SITE.title, description: SITE.tagline },
};
for (const p of posts) {
  pages[p.id] = {
    title: p.data.title,
    description: p.data.topicTitle,
  };
}

export const { getStaticPaths, GET } = OGImageRoute({
  param: 'route',
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    // Penluma palette: warm ink base, lumen-gold edge light
    bgGradient: [
      [11, 10, 15],
      [21, 19, 28],
    ],
    border: { color: [245, 181, 68], width: 24, side: 'inline-start' },
    padding: 70,
    logo: { path: './public/logo.png', size: [84] },
    font: {
      title: { color: [247, 243, 234], size: 64, weight: 'Bold', lineHeight: 1.15 },
      description: { color: [156, 149, 164], size: 30, weight: 'Normal' },
    },
  }),
});
