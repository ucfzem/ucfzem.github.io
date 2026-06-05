/**
 * NanoLink — Cloudflare Worker
 *
 * Redirige les visiteurs de nanolink.to/{slug} vers l'URL cible
 * et comptabilise les clics dans Supabase.
 *
 * Variables d'environnement (wrangler secrets ou dashboard CF) :
 *   SUPABASE_URL       — https://xxx.supabase.co
 *   SUPABASE_ANON_KEY  — anon key du projet
 *   BASE_URL           — (optionnel) ex: https://nanolink.to
 */

let SUPABASE_URL, SUPABASE_ANON_KEY, BASE_URL;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
    },
  });
}

async function supaGet(path) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase error (${res.status}): ${text}`);
  }
  return res.json();
}

async function supaPatch(path, body) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  return fetch(url, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
  });
}

async function supaPost(path, body) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  return fetch(url, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
  });
}

async function handleRequest(request) {
  const url = new URL(request.url);
  const { pathname } = url;

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // Health check
  if (pathname === '/_health') {
    return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() });
  }

  // Stats endpoint: GET /_stats/{slug}
  if (pathname.startsWith('/_stats/')) {
    const slug = pathname.replace('/_stats/', '');
    try {
      const rows = await supaGet(
        `links?select=slug,url,clicks,created_at&slug=eq.${encodeURIComponent(slug)}&limit=1`
      );
      if (!rows || rows.length === 0) {
        return jsonResponse({ error: 'slug not found' }, 404);
      }
      return jsonResponse(rows[0]);
    } catch (e) {
      return jsonResponse({ error: e.message }, 500);
    }
  }

  // Extract slug
  let slug = pathname.replace(/^\/+/, '').replace(/\/+$/, '');
  if (!slug) {
    return new Response(
      `<html><head><meta http-equiv="refresh" content="0;url=${BASE_URL}"></head><body></body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html;charset=utf-8' } }
    );
  }

  // ── Lookup ──
  try {
    const rows = await supaGet(
      `links?select=slug,url,clicks&slug=eq.${encodeURIComponent(slug)}&limit=1`
    );

    if (!rows || rows.length === 0) {
      return new Response('Not Found', { status: 404 });
    }

    const link = rows[0];

    // Increment clicks (fire-and-forget)
    supaPatch(`links?slug=eq.${encodeURIComponent(slug)}`, {
      clicks: (link.clicks || 0) + 1,
    }).catch(() => {});

    // Log click event (fire-and-forget)
    supaPost('click_events', { slug }).catch(() => {});

    return Response.redirect(link.url, 301);
  } catch (e) {
    return new Response(`Redirect error: ${e.message}`, { status: 500 });
  }
}

export default {
  async fetch(request, env) {
    SUPABASE_URL = env.SUPABASE_URL;
    SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;
    BASE_URL = env.BASE_URL || 'https://nanolink.to';
    return handleRequest(request);
  },
};
