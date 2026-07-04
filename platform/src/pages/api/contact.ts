import type { APIRoute } from 'astro';

// Runs at request time on Cloudflare (not prerendered). Captures contact
// messages, pings a Discord webhook so you see them instantly, and keeps a copy
// in BLOG_KV as a backup/export.
export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Post the message to a Discord channel webhook. Never throws — a webhook
 * failure must not lose the message (we still store it in KV).
 *
 * Set the URL once with:  wrangler secret put DISCORD_WEBHOOK_URL
 */
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

  const env = (locals as any)?.runtime?.env ?? {};
  const webhookUrl = env.DISCORD_WEBHOOK_URL as string | undefined;
  const store = env.BLOG_KV as KVNamespace | undefined;

  // Real-time notification.
  if (webhookUrl) await notifyDiscord(webhookUrl, { name, email, message });

  // Backup/export copy. Sortable key; value holds the full submission.
  if (store) {
    const ts = new Date().toISOString();
    await store.put(`contact:${ts}:${email}`, JSON.stringify({ name, email, message, ts }));
  }

  return json({ message: 'Thanks — your message has been sent. I read every one.' });
};
