// Giscus comments configuration (privacy-friendly, no database).
// ---------------------------------------------------------------------------
// Comments are powered by Giscus, which stores every thread as a GitHub
// Discussion in a public repo you own. There is no database, no tracking
// cookie, and readers comment with their own GitHub account. It is OFF by
// default and renders NOTHING until you fill in the two IDs below and flip
// `enabled` to true. See src/components/Comments.astro for the embed.
//
// HOW TO TURN COMMENTS ON (one-time setup, ~5 minutes):
//   1. Create a PUBLIC GitHub repo to hold the discussions (a repo dedicated
//      to comments is cleanest, e.g. `penluma-comments`). It must be public,
//      or Giscus cannot read/write the threads.
//   2. In that repo: Settings → General → Features → enable "Discussions".
//   3. Install the Giscus GitHub App and grant it access to that repo:
//      https://github.com/apps/giscus
//   4. Go to https://giscus.app, enter `owner/repo`, and pick the same
//      mapping/category you see below. The page generates a `data-repo-id`
//      and a `data-category-id` for you. Copy those two values.
//   5. Paste them into `repoId` and `categoryId` below, set `repo` to
//      "owner/repo", set `enabled: true`, rebuild, and deploy.
//
// CATEGORY: create/keep a Discussions category named exactly whatever you set
// in `category` (default "Announcements"). An "Announcements"-type category is
// recommended so only maintainers can start threads (Giscus opens the mapped
// thread automatically; readers reply into it).
//
// CONTENT-SECURITY-POLICY: this site currently ships no CSP, but if a CSP is
// ever added (BaseLayout.astro / a CSP <meta> / a Cloudflare `_headers` file),
// the Giscus embed will be blocked unless you allowlist it. When enabled, add:
//   script-src   https://giscus.app
//   frame-src    https://giscus.app
//   connect-src  https://giscus.app https://github.com
//   img-src      https://*.githubusercontent.com   (avatar images)
// Do NOT loosen the CSP just to "make it work" — allowlist these exact hosts.

export interface CommentsConfig {
  /** Master switch. While false, Comments.astro renders nothing. */
  enabled: boolean;
  /** GitHub repo that stores the discussions, as "owner/repo". */
  repo: `${string}/${string}` | '';
  /** `data-repo-id` from giscus.app (starts with "R_"). */
  repoId: string;
  /** Discussions category name the threads live in. */
  category: string;
  /** `data-category-id` from giscus.app (starts with "DIC_"). */
  categoryId: string;
  /** How posts map to discussions. "pathname" = one thread per URL path. */
  mapping: 'pathname' | 'url' | 'title' | 'og:title' | 'specific' | 'number';
  /**
   * Giscus theme. "preferred_color_scheme" follows the OS; the Comments
   * component additionally syncs the embed to this site's manual dark/light
   * toggle at runtime, so this is just the pre-hydration default.
   */
  theme: string;
}

export const comments: CommentsConfig = {
  enabled: false,
  repo: '',
  repoId: '',
  category: 'Announcements',
  categoryId: '',
  mapping: 'pathname',
  theme: 'preferred_color_scheme',
};

export default comments;
