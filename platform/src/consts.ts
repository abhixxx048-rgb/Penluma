export const SITE = {
  name: 'Penluma',
  title: 'Penluma',
  tagline: 'Deep, worked-through writing on systems, AI, money, and thinking clearly.',
  // Short <title> for the homepage (SERP-friendly, ≤60 chars). The long
  // `tagline` above is still used for on-page hero copy.
  homeTitle: 'Penluma — Deep writing on systems, AI & clear thinking',
  // brand story - pen + lumen (light)
  story:
    'Penluma - *pen* + *lumen*, the light of the pen. Writing is how unspoken thoughts come into view. This is a growing library of deep research, each topic taken from plain-language intuition to precise mechanics to the failure modes that show up in the real world.',
  description:
    'Penluma is a growing library of deep-dive research: staff-level system design, multi-agent LLM systems, economics, business, and clear thinking - each topic taken from intuition to mechanics to failure modes.',
  author: 'Brexis Wazik',
  // Public contact address shown on the Contact page and used as the mailto
  // fallback. Point this at a real inbox before launch.
  contactEmail: 'brexiswazik@gmail.com',
  // Cloudflare Turnstile (spam protection on the forms). PUBLIC site key — safe
  // to commit. Leave EMPTY to disable the widget entirely; when set, the forms
  // render a Turnstile challenge and the API routes verify it (they also need
  // the private TURNSTILE_SECRET_KEY set as a Cloudflare secret). Get both keys
  // at: Cloudflare dashboard → Turnstile → Add site.
  turnstileSiteKey: '0x4AAAAAADvmdYT2pk0TpVMF',
  // BCP-47 locale, used for og:locale and the html lang attribute.
  locale: 'en_US',
  // Default social-share image. Lives in /public.
  // Falls back to this whenever a page doesn't supply its own image.
  ogImage: '/logo.png',
  // Google Analytics 4 measurement ID. Only loaded in production builds.
  gaId: 'G-3P5Z6TRP9Y',
  // TODO: set these to your real handles before launch.
  // twitter: bare handle WITHOUT the leading @ (e.g. 'penluma').
  social: {
    twitter: '',
    github: '',
    linkedin: '',
  },
};
