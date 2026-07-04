import type { APIRoute } from 'astro';

// TEMPORARY diagnostic. Delete this file once the forms work.
//
//   GET /api/diag           → which bindings the function can see (booleans only)
//   GET /api/diag?test=1     → actually calls KV + Buttondown + Discord and
//                              reports the real status codes / response bodies,
//                              so we can see WHY a provider call fails. This adds
//                              a test subscriber + posts a test Discord message
//                              (both safe to delete afterwards). No secret values
//                              are ever included in the output.
export const prerender = false;

export const GET: APIRoute = async ({ locals, url }) => {
  const runtime = (locals as any)?.runtime;
  const env = runtime?.env ?? {};

  const out: Record<string, unknown> = {
    runtimePresent: !!runtime,
    hasKV: !!env.BLOG_KV,
    hasButtondownKey: !!env.BUTTONDOWN_API_KEY,
    hasDiscordWebhook: !!env.DISCORD_WEBHOOK_URL,
    envKeys: Object.keys(env).sort(),
  };

  if (url.searchParams.get('test') === '1') {
    // --- KV round-trip ---------------------------------------------------
    try {
      const key = 'diag:test';
      await env.BLOG_KV?.put(key, 'ok');
      const got = await env.BLOG_KV?.get(key);
      out.kvTest = { ok: got === 'ok', readBack: got ?? null };
    } catch (e: any) {
      out.kvTest = { ok: false, error: String(e?.message || e) };
    }

    // --- Buttondown ------------------------------------------------------
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

    // --- Discord ---------------------------------------------------------
    try {
      const res = await fetch(env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ content: '✅ Penluma diagnostic — the Discord webhook works.' }),
      });
      out.discord = { status: res.status, body: (await res.text()).slice(0, 300) };
    } catch (e: any) {
      out.discord = { error: String(e?.message || e) };
    }
  }

  return new Response(JSON.stringify(out, null, 2), {
    status: 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
};
