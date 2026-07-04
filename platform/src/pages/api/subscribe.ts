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
 * (created, or already existed), false on a real failure. Never throws - a
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

/** Read the body whether it's JSON (fetch) or form-encoded (native submit). */
async function readEmail(request: Request): Promise<string> {
  const ct = request.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    const b = (await request.json().catch(() => ({}))) as { email?: string };
    return (b?.email || '').trim().toLowerCase();
  }
  const form = await request.formData();
  return String(form.get('email') || '').trim().toLowerCase();
}

export const POST: APIRoute = async ({ request, locals }) => {
  // AJAX (our JS) sends `accept: application/json`; a native form submit doesn't.
  // Native submits get a redirect (never raw JSON, never data in the URL).
  const wantsJson = (request.headers.get('accept') || '').includes('application/json');
  const back = request.headers.get('referer') || '/';
  const redirect = (params: string) =>
    new Response(null, { status: 303, headers: { Location: back.split('?')[0] + params } });

  let email = '';
  try {
    email = await readEmail(request);
  } catch {
    return wantsJson ? json({ error: 'Invalid request.' }, 400) : redirect('?subscribe=error');
  }
  if (!EMAIL_RE.test(email))
    return wantsJson ? json({ error: 'Please enter a valid email.' }, 400) : redirect('?subscribe=invalid');

  const env = (locals as any)?.runtime?.env ?? {};
  // Trim to survive a stray newline/space pasted into `wrangler secret put`.
  const apiKey = (env.BUTTONDOWN_API_KEY as string | undefined)?.trim() || undefined;
  const store = env.BLOG_KV as KVNamespace | undefined;

  // Primary: the email service provider (the real list you broadcast from).
  if (apiKey) await addToButtondown(email, apiKey);

  // Backup/export: keep a copy in KV so you never lose a signup even if the
  // provider is mid-outage. Exportable with `wrangler kv key list`.
  if (store) {
    await store.put(`subscriber:${email}`, new Date().toISOString());
  }

  return wantsJson
    ? json({ message: 'Thanks - you’re subscribed!' })
    : redirect('?subscribe=ok');
};
