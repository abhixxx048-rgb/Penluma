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

// GET /api/post/<topic>/<slug>  -> { views, likes } and increments views once.
export const GET: APIRoute = async ({ params, locals }) => {
  const id = params.id;
  if (!id) return json({ error: 'missing id' }, 400);
  const store = kv(locals);
  if (!store) return json({ views: 0, likes: 0, kv: false });

  const [viewsRaw, likesRaw] = await Promise.all([
    store.get(`views:${id}`),
    store.get(`likes:${id}`),
  ]);
  const views = (parseInt(viewsRaw || '0', 10) || 0) + 1;
  await store.put(`views:${id}`, String(views));
  return json({ views, likes: parseInt(likesRaw || '0', 10) || 0, kv: true });
};

// POST /api/post/<topic>/<slug>  body {action:'like'|'unlike'} -> { likes }
export const POST: APIRoute = async ({ params, locals, request }) => {
  const id = params.id;
  if (!id) return json({ error: 'missing id' }, 400);
  const store = kv(locals);
  if (!store) return json({ likes: 0, kv: false });

  let action = 'like';
  try {
    const body = (await request.json()) as { action?: string };
    if (body?.action) action = body.action;
  } catch {
    /* default like */
  }
  const current = parseInt((await store.get(`likes:${id}`)) || '0', 10) || 0;
  const next = Math.max(0, action === 'unlike' ? current - 1 : current + 1);
  await store.put(`likes:${id}`, String(next));
  return json({ likes: next, kv: true });
};
