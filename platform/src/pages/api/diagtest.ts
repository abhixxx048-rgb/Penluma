import type { APIRoute } from 'astro';

// TEMPORARY live-call diagnostic. Delete once the forms work.
// Visiting GET /api/diagtest ALWAYS fires KV + Buttondown + Discord and reports
// the real status codes / bodies (no secret values). It adds a test subscriber
// and posts one Discord message — both safe to delete afterwards.
export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const env = (locals as any)?.runtime?.env ?? {};
  const out: Record<string, unknown> = {
    hasKV: !!env.BLOG_KV,
    hasButtondownKey: !!env.BUTTONDOWN_API_KEY,
    hasDiscordWebhook: !!env.DISCORD_WEBHOOK_URL,
  };

  // --- KV round-trip -----------------------------------------------------
  try {
    await env.BLOG_KV?.put('diag:test', 'ok');
    const got = await env.BLOG_KV?.get('diag:test');
    out.kvTest = { ok: got === 'ok', readBack: got ?? null };
  } catch (e: any) {
    out.kvTest = { ok: false, error: String(e?.message || e) };
  }

  // --- Buttondown --------------------------------------------------------
  try {
    const res = await fetch('https://api.buttondown.email/v1/subscribers', {
      method: 'POST',
      headers: {
        Authorization: `Token ${env.BUTTONDOWN_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ email_address: 'diagnostic-test@penluma.com' }),
    });
    out.buttondown = { status: res.status, body: (await res.text()).slice(0, 600) };
  } catch (e: any) {
    out.buttondown = { error: String(e?.message || e) };
  }

  // --- Discord -----------------------------------------------------------
  try {
    const res = await fetch(env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content: 'Penluma diagnostic — the Discord webhook works.' }),
    });
    out.discord = { status: res.status, body: (await res.text()).slice(0, 300) };
  } catch (e: any) {
    out.discord = { error: String(e?.message || e) };
  }

  return new Response(JSON.stringify(out, null, 2), {
    status: 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
};
