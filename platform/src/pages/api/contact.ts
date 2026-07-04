import type { APIRoute } from 'astro';

// Runs at request time on Cloudflare (not prerendered). Captures contact
// messages, pings a Discord webhook so you see them instantly, and keeps a copy
// in BLOG_KV as a backup.
//
// Progressive enhancement: the page's JS posts JSON and gets JSON back. If JS is
// unavailable, the form still POSTs (form-encoded) — never a GET — so data is
// never leaked into the URL; those requests get a redirect instead of raw JSON.
export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Read the body whether it's JSON (fetch) or form-encoded (native submit). */
async function readBody(request: Request): Promise<Record<string, string>> {
  const ct = request.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(b).map(([k, v]) => [k, String(v ?? '')]));
  }
  const form = await request.formData();
  const out: Record<string, string> = {};
  for (const [k, v] of form.entries()) out[k] = typeof v === 'string' ? v : '';
  return out;
}

async function notifyDiscord(
  webhookUrl: string,
  data: { name: string; email: string; message: string }
): Promise<void> {
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        username: 'Penluma Contact',
        embeds: [
          {
            title: `New message from ${data.name}`,
            description: data.message.slice(0, 4000),
            color: 0x141414,
            fields: [{ name: 'Email', value: data.email, inline: true }],
          },
        ],
      }),
    });
  } catch (err) {
    console.error('Discord webhook failed', err);
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  // AJAX (our JS) sends `accept: application/json`; a native form submit doesn't.
  const wantsJson = (request.headers.get('accept') || '').includes('application/json');
  const fail = (msg: string, status = 400) =>
    wantsJson
      ? json({ error: msg }, status)
      : new Response(null, { status: 303, headers: { Location: `/contact?error=${encodeURIComponent(msg)}` } });

  let body: Record<string, string>;
  try {
    body = await readBody(request);
  } catch {
    return fail('Invalid request.');
  }

  const name = (body.name || '').trim();
  const email = (body.email || '').trim().toLowerCase();
  const message = (body.message || '').trim();
  const hp = (body.botcheck || '').trim();

  const ok = () =>
    wantsJson
      ? json({ message: 'Thanks — your message has been sent. I read every one.' })
      : new Response(null, { status: 303, headers: { Location: '/contact?sent=1' } });

  // Silently accept bot submissions that fill the hidden honeypot field.
  if (hp) return ok();

  if (!name) return fail('Please enter your name.');
  if (!EMAIL_RE.test(email)) return fail('Please enter a valid email.');
  if (message.length < 10) return fail('Please add a bit more detail to your message.');
  if (message.length > 5000) return fail('That message is a little too long — please trim it.');

  const env = (locals as any)?.runtime?.env ?? {};
  // Trim to survive a stray newline/space pasted into `wrangler secret put`.
  const webhookUrl = (env.DISCORD_WEBHOOK_URL as string | undefined)?.trim() || undefined;
  const store = env.BLOG_KV as KVNamespace | undefined;

  if (webhookUrl) await notifyDiscord(webhookUrl, { name, email, message });

  if (store) {
    const ts = new Date().toISOString();
    await store.put(`contact:${ts}:${email}`, JSON.stringify({ name, email, message, ts }));
  }

  return ok();
};
