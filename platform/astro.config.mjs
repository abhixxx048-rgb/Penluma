// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Production domain. Override per-environment with SITE_URL if needed.
const SITE = process.env.SITE_URL || 'https://penluma.com';

// Computed once at build time for sitemap <lastmod> entries.
const LASTMOD = new Date().toISOString();

export default defineConfig({
  site: SITE,
  // Hybrid: pages are static by default; routes that opt into
  // `export const prerender = false` run on Cloudflare at request time
  // (used for view counts, likes and the newsletter endpoint).
  output: 'static',
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/api/'),
      serialize(item) {
        let priority = 0.5;
        let changefreq = 'monthly';

        const path = new URL(item.url).pathname.replace(/\/$/, '') || '/';

        if (path === '/') {
          priority = 1.0;
          changefreq = 'daily';
        } else if (
          path === '/topics' ||
          path === '/blog' ||
          path.startsWith('/topics/')
        ) {
          priority = 0.8;
          changefreq = 'weekly';
        } else if (path.startsWith('/blog/')) {
          priority = 0.7;
          changefreq = 'monthly';
        }

        return {
          ...item,
          lastmod: LASTMOD,
          priority,
          changefreq,
        };
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    // Keep the OG-image deps as real Node modules during prerender instead of
    // bundling them into the ESM Cloudflare worker (canvaskit-wasm relies on
    // __dirname, which doesn't exist in the bundled ESM worker).
    ssr: { external: ['canvaskit-wasm'] },
  },
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
