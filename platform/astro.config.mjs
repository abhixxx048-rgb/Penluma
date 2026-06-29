// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Production domain. Override per-environment with SITE_URL if needed.
const SITE = process.env.SITE_URL || 'https://penluma.com';

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
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
