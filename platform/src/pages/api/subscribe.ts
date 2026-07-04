import type { APIRoute } from 'astro';

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Add a subscriber to Buttondown. Returns true if the email is now on the list
 * (created, or already existed), false on a real failure. Never throws — a
 * provider hiccup must not lose the signup (we still fall back to KV).
 *
 * Set the key once with:  wrangler secret put BUTTONDOWN_API_KEY
 */
async function addToButtondown(email: string, apiKey: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.buttondown.email/v1/subscribers', {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ email_address: email }),
    });
    if (res.ok) return true; // 200/201 created
    // 400 = already subscribed / duplicate → treat as success (idempotent).
    if (res.status === 400) {
      const body = await res.text().catch(() => '');
      if (/already|exists|subscrib/i.test(body)) return true;
    }
    console.error('Buttondown error', res.status, await res.text().catch(() => ''));
    return false;
  } catch (err) {
    console.error('Buttondown request failed', err);
    return false;
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  let email = '';
  try {
    const body = (await request.json()) as { email?: string };
    email = (body?.email || '').trim().toLowerCase();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }
  if (!EMAIL_RE.test(email)) return json({ error: 'Please enter a valid email.' }, 400);

  const env = (locals as any)?.runtime?.env ?? {};
  const apiKey = env.BUTTONDOWN_API_KEY as string | undefined;
  const store = env.BLOG_KV as KVNamespace | undefined;

  // Primary: the email service provider (the real list you broadcast from).
  if (apiKey) await addToButtondown(email, apiKey);

  // Backup/export: keep a copy in KV so you never lose a signup even if the
  // provider is mid-outage. Exportable with `wrangler kv key list`.
  if (store) {
    await store.put(`subscriber:${email}`, new Date().toISOString());
  }

  return json({ message: 'Thanks - you’re subscribed!' });
};
