import type { APIRoute } from 'astro';

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request, locals }) => {
  let email = '';
  try {
    const body = (await request.json()) as { email?: string };
    email = (body?.email || '').trim().toLowerCase();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }
  if (!EMAIL_RE.test(email)) return json({ error: 'Please enter a valid email.' }, 400);

  const store = (locals as any)?.runtime?.env?.BLOG_KV as KVNamespace | undefined;
  if (store) {
    // Stored as subscriber:<email>; export later with `wrangler kv key list`.
    await store.put(`subscriber:${email}`, new Date().toISOString());
  }
  // If you wire a provider (Buttondown/ConvertKit/Resend), call it here.
  return json({ message: 'Thanks — you’re subscribed!' });
};
