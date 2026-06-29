import { OGImageRoute } from 'astro-og-canvas';
import { SITE } from '../../consts';
import postsManifest from '../../posts.generated.json';

// Build at build time, not on the Cloudflare edge.
export const prerender = true;

// Page map from a plain JSON manifest (NOT getCollection) so this prerendered
// endpoint doesn't pull the content layer into the Cloudflare worker bundle.
const pages: Record<string, { title: string; description: string }> = {
  default: { title: SITE.title, description: SITE.tagline },
};
for (const p of postsManifest as { id: string; title: string; topicTitle: string }[]) {
  pages[p.id] = { title: p.title, description: p.topicTitle };
}

const route = OGImageRoute({
  param: 'route',
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
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

// Function-declaration form so Astro's static analyzer reliably detects the
// export (the destructured `export const { getStaticPaths }` form was being
// missed, which mis-classified the route as on-demand).
export async function getStaticPaths() {
  return route.getStaticPaths();
}
export const GET = route.GET;
