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
      // `type: regular` = added as an active subscriber (a self-serve signup),
      // not left pending.
      body: JSON.stringify({ email_address: email, type: 'regular' }),
    });
    if (res.ok) return true; // 200/201 created
    if (res.status === 400) {
      const body = (await res.json().catch(() => ({}))) as { code?: string; detail?: string };
      const code = body.code || '';
      // Duplicate → idempotent success. But DON'T match the substring "subscrib"
      // blindly: "subscriber_blocked" (firewall) also contains it and is NOT a
      // success. Match the real duplicate codes only.
      if (code === 'email_already_exists' || /already exists|already subscrib/i.test(body.detail || '')) {
        return true;
      }
      console.error('Buttondown 400', code, body.detail);
      return false;
    }
    console.error('Buttondown error', res.status, await res.text().catch(() => ''));
    return false;
  } catch (err) {
    console.error('Buttondown request failed', err);
    return false;
  }
}

/** Read email + Turnstile token, whether JSON (fetch) or form-encoded (native). */
async function readBody(request: Request): Promise<{ email: string; token: string }> {
  const ct = request.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    const b = (await request.json().catch(() => ({}))) as {
      email?: string;
      'cf-turnstile-response'?: string;
    };
    return {
      email: (b?.email || '').trim().toLowerCase(),
      token: (b?.['cf-turnstile-response'] || '').trim(),
    };
  }
  const form = await request.formData();
  return {
    email: String(form.get('email') || '').trim().toLowerCase(),
    token: String(form.get('cf-turnstile-response') || '').trim(),
  };
}

/** Verify a Cloudflare Turnstile token server-side. Returns true if valid. */
async function verifyTurnstile(token: string, secret: string, ip?: string): Promise<boolean> {
  if (!token) return false;
  try {
    const form = new URLSearchParams({ secret, response: token });
    if (ip) form.set('remoteip', ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
    });
    const data = (await res.json()) as { success?: boolean };
    return !!data.success;
  } catch {
    return false;
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  // AJAX (our JS) sends `accept: application/json`; a native form submit doesn't.
  // Native submits get a redirect (never raw JSON, never data in the URL).
  const wantsJson = (request.headers.get('accept') || '').includes('application/json');
  const back = request.headers.get('referer') || '/';
  const redirect = (params: string) =>
    new Response(null, { status: 303, headers: { Location: back.split('?')[0] + params } });

  let email = '';
  let token = '';
  try {
    ({ email, token } = await readBody(request));
  } catch {
    return wantsJson ? json({ error: 'Invalid request.' }, 400) : redirect('?subscribe=error');
  }
  if (!EMAIL_RE.test(email))
    return wantsJson ? json({ error: 'Please enter a valid email.' }, 400) : redirect('?subscribe=invalid');

  const env = (locals as any)?.runtime?.env ?? {};

  // Cloudflare Turnstile — enforced only when the secret is configured.
  const turnstileSecret = (env.TURNSTILE_SECRET_KEY as string | undefined)?.trim();
  if (turnstileSecret) {
    const ip = request.headers.get('CF-Connecting-IP') || undefined;
    if (!(await verifyTurnstile(token, turnstileSecret, ip)))
      return wantsJson
        ? json({ error: 'Verification failed — please try again.' }, 400)
        : redirect('?subscribe=captcha');
  }

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
