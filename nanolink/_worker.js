/**
 * NanoLink — Cloudflare Pages _worker.js
 *
 * Single entry point for Cloudflare Pages + D1.
 * - API routes → D1 queries
 * - /:slug     → 301 redirect
 * - other      → serve static files (Pages Assets)
 *
 * Dépendances :
 *   wrangler.toml avec [[d1_databases]] binding = "DB"
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/html;charset=utf-8' },
  });
}

// ── Slug helpers ──
const SLUG_CHARS = 'abcdefghijkmnpqrstuvwxyz23456789';
function randomSlug(len = 6) {
  let s = '';
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < len; i++) s += SLUG_CHARS[bytes[i] % SLUG_CHARS.length];
  return s;
}

// ── API Handlers ──

async function handleShorten(request, env) {
  const { url, slug: customSlug } = await request.json();
  if (!url) return json({ error: 'url required' }, 400);

  try { new URL(url); } catch { return json({ error: 'invalid url' }, 400); }

  const slug = customSlug || randomSlug();

  // Check duplicate
  const existing = await env.DB.prepare(
    'SELECT slug FROM links WHERE slug = ?'
  ).bind(slug).first();
  if (existing) return json({ error: 'slug already taken' }, 409);

  const now = new Date().toISOString();
  await env.DB.prepare(
    'INSERT INTO links (slug, url, clicks, created_at) VALUES (?, ?, 0, ?)'
  ).bind(slug, url, now).run();

  return json({ slug, url, clicks: 0, created_at: now }, 201);
}

async function handleListLinks(env) {
  const rows = await env.DB.prepare(
    'SELECT slug, url, clicks, created_at FROM links ORDER BY created_at DESC LIMIT 20'
  ).all();
  return json(rows.results || []);
}

async function handleOverviewStats(env) {
  const total = await env.DB.prepare('SELECT COUNT(*) as n FROM links').first();
  const clicks = await env.DB.prepare(
    "SELECT COALESCE(SUM(clicks), 0) as n FROM links"
  ).first();
  const today = await env.DB.prepare(
    "SELECT COUNT(*) as n FROM click_events WHERE date(clicked_at) = date('now')"
  ).first();
  const avgRow = await env.DB.prepare(
    "SELECT ROUND(COUNT(*) * 1.0 / MAX(1, julianday('now') - julianday(MIN(clicked_at)))) as avg FROM click_events"
  ).first();
  const clicksByDay = await env.DB.prepare(`
    SELECT date(clicked_at) as day, COUNT(*) as count
    FROM click_events
    WHERE clicked_at >= datetime('now', '-7 days')
    GROUP BY date(clicked_at) ORDER BY day ASC
  `).all();

  return json({
    total_links: total?.n || 0,
    total_clicks: clicks?.n || 0,
    today_clicks: today?.n || 0,
    avg_clicks: Math.round(avgRow?.avg || 0),
    clicks_by_day: clicksByDay.results || [],
  });
}

async function handleLinkStats(slug, env) {
  const link = await env.DB.prepare(
    'SELECT slug, url, clicks, created_at FROM links WHERE slug = ?'
  ).bind(slug).first();
  if (!link) return json({ error: 'not found' }, 404);

  const clicksByDay = await env.DB.prepare(`
    SELECT date(clicked_at) as day, COUNT(*) as count
    FROM click_events WHERE slug = ?
    GROUP BY date(clicked_at) ORDER BY day ASC
  `).bind(slug).all();

  return json({ ...link, clicks_by_day: clicksByDay.results || [] });
}

async function handleRedirect(slug, env) {
  const link = await env.DB.prepare(
    'SELECT slug, url, clicks FROM links WHERE slug = ?'
  ).bind(slug).first();
  if (!link) return null; // Let pages serve 404

  // Increment clicks + log event (fire-and-forget)
  env.DB.prepare(
    'UPDATE links SET clicks = clicks + 1 WHERE slug = ?'
  ).bind(slug).run().catch(() => {});

  env.DB.prepare(
    "INSERT INTO click_events (slug, clicked_at) VALUES (?, datetime('now'))"
  ).bind(slug).run().catch(() => {});

  return Response.redirect(link.url, 301);
}

// ── Router ──

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    try {
      // ── Health ──
      if (pathname === '/_health') {
        return json({ status: 'ok', timestamp: new Date().toISOString() });
      }

      // ── API routes ──
      if (pathname.startsWith('/api/')) {
        const parts = pathname.split('/').filter(Boolean);

        if (request.method === 'POST' && parts[1] === 'shorten') {
          return handleShorten(request, env);
        }
        if (request.method === 'GET' && parts[1] === 'links' && parts.length === 2) {
          return handleListLinks(env);
        }
        if (request.method === 'GET' && parts[1] === 'stats' && parts.length === 2) {
          return handleOverviewStats(env);
        }
        if (request.method === 'GET' && parts[1] === 'stats' && parts.length === 3) {
          return handleLinkStats(parts[2], env);
        }

        return json({ error: 'not found' }, 404);
      }

      // ── Slug redirect ──
      const slug = pathname.replace(/^\/+/, '').replace(/\/+$/, '');
      if (slug && !slug.includes('.')) {
        const result = await handleRedirect(slug, env);
        if (result) return result;
      }

      // ── Serve static (fallback through to Pages Assets) ──
      return env.ASSETS.fetch(request);
    } catch (e) {
      return json({ error: e.message }, 500);
    }
  },
};
