import type { APIRoute } from 'astro';

// Runs at request time on Cloudflare (not prerendered). Captures contact
// messages into BLOG_KV so they can be exported later with `wrangler kv key
// list`. Wire an email/webhook provider where noted to get real-time delivery.
export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request, locals }) => {
  let name = '';
  let email = '';
  let message = '';
  let hp = ''; // honeypot
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      message?: string;
      company?: string;
    };
    name = (body?.name || '').trim();
    email = (body?.email || '').trim().toLowerCase();
    message = (body?.message || '').trim();
    hp = (body?.company || '').trim();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  // Silently accept bot submissions that fill the hidden honeypot field.
  if (hp) return json({ message: 'Thanks — your message has been sent.' });

  if (!name) return json({ error: 'Please enter your name.' }, 400);
  if (!EMAIL_RE.test(email)) return json({ error: 'Please enter a valid email.' }, 400);
  if (message.length < 10)
    return json({ error: 'Please add a bit more detail to your message.' }, 400);
  if (message.length > 5000)
    return json({ error: 'That message is a little too long — please trim it.' }, 400);

  const store = (locals as any)?.runtime?.env?.BLOG_KV as KVNamespace | undefined;
  if (store) {
    const ts = new Date().toISOString();
    // Sortable key; value holds the full submission.
    await store.put(
      `contact:${ts}:${email}`,
      JSON.stringify({ name, email, message, ts })
    );
  }
  // If you wire a provider (Resend/Postmark/a Discord or Slack webhook), call it
  // here so messages reach you in real time.
  return json({ message: 'Thanks — your message has been sent. I read every one.' });
};
