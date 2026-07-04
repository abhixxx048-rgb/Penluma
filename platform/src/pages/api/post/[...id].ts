import type { APIRoute } from 'astro';

// Runs on Cloudflare at request time (not prerendered).
export const prerender = false;

function kv(locals: any): KVNamespace | null {
  return locals?.runtime?.env?.BLOG_KV ?? null;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

// Deterministic per-post "seed" baseline so a brand-new post doesn't sit at
// 0 views / 0 likes (a little social proof). Derived from a hash of the post id,
// so it's STABLE across loads and visitors, and likes stay a believable small
// fraction of views. Real KV counts are added ON TOP, so the numbers still climb
// with genuine activity.
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function baseline(id: string): { views: number; likes: number } {
  const h = hashStr(id);
  const views = 180 + (h % 1500); // ~180–1,679
  const ratio = 0.018 + ((h >>> 8) % 25) / 1000; // ~1.8%–4.2% like rate
  const likes = Math.max(3, Math.round(views * ratio)); // a few dozen at most
  return { views, likes };
}

// GET /api/post/<topic>/<slug>  -> { views, likes } and increments views once.
export const GET: APIRoute = async ({ params, locals }) => {
  const id = params.id;
  if (!id) return json({ error: 'missing id' }, 400);
  const base = baseline(id);
  const store = kv(locals);
  if (!store) return json({ views: base.views, likes: base.likes, kv: false });

  const [viewsRaw, likesRaw] = await Promise.all([
    store.get(`views:${id}`),
    store.get(`likes:${id}`),
  ]);
  const realViews = (parseInt(viewsRaw || '0', 10) || 0) + 1;
  await store.put(`views:${id}`, String(realViews));
  const realLikes = parseInt(likesRaw || '0', 10) || 0;
  return json({ views: base.views + realViews, likes: base.likes + realLikes, kv: true });
};

// POST /api/post/<topic>/<slug>  body {action:'like'|'unlike'} -> { likes }
export const POST: APIRoute = async ({ params, locals, request }) => {
  const id = params.id;
  if (!id) return json({ error: 'missing id' }, 400);
  const base = baseline(id);
  const store = kv(locals);

  let action = 'like';
  try {
    const body = (await request.json()) as { action?: string };
    if (body?.action) action = body.action;
  } catch {
    /* default like */
  }

  if (!store) return json({ likes: base.likes + (action === 'unlike' ? 0 : 1), kv: false });

  const current = parseInt((await store.get(`likes:${id}`)) || '0', 10) || 0;
  const next = Math.max(0, action === 'unlike' ? current - 1 : current + 1);
  await store.put(`likes:${id}`, String(next));
  return json({ likes: base.likes + next, kv: true });
};
