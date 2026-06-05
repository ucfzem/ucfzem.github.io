export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }

  try {
    // Health
    if (path === '/_health') {
      return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    // API: POST /api/shorten
    if (path === '/api/shorten' && request.method === 'POST') {
      const { url: targetUrl, slug: custom } = await request.json();
      try { new URL(targetUrl); } catch (e) { return json({ error: 'invalid url' }, 400); }

      const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
      const slug = custom || Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

      const existing = await env.DB.prepare('SELECT slug FROM links WHERE slug = ?').bind(slug).first();
      if (existing) return json({ error: 'slug taken' }, 409);

      const now = new Date().toISOString();
      await env.DB.prepare('INSERT INTO links (slug, url, clicks, created_at) VALUES (?, ?, 0, ?)').bind(slug, targetUrl, now).run();
      return json({ slug, url: targetUrl, clicks: 0, created_at: now }, 201);
    }

    // API: GET /api/links
    if (path === '/api/links' && request.method === 'GET') {
      const rows = await env.DB.prepare('SELECT slug, url, clicks, created_at FROM links ORDER BY created_at DESC LIMIT 20').all();
      return json(rows.results || []);
    }

    // API: GET /api/stats or GET /api/stats/:slug
    if (path.startsWith('/api/stats') && request.method === 'GET') {
      const parts = path.split('/').filter(Boolean);
      if (parts.length === 3) {
        const link = await env.DB.prepare('SELECT slug, url, clicks, created_at FROM links WHERE slug = ?').bind(parts[2]).first();
        if (!link) return json({ error: 'not found' }, 404);
        const days = await env.DB.prepare("SELECT date(clicked_at) as day, COUNT(*) as count FROM click_events WHERE slug = ? GROUP BY day ORDER BY day").bind(parts[2]).all();
        return json({ ...link, clicks_by_day: days.results || [] });
      }
      const t = await env.DB.prepare('SELECT COUNT(*) as n FROM links').first();
      const c = await env.DB.prepare("SELECT COALESCE(SUM(clicks),0) as n FROM links").first();
      const td = await env.DB.prepare("SELECT COUNT(*) as n FROM click_events WHERE date(clicked_at)=date('now')").first();
      const days = await env.DB.prepare("SELECT date(clicked_at) as day, COUNT(*) as count FROM click_events WHERE clicked_at >= datetime('now','-7 days') GROUP BY day ORDER BY day").all();
      return json({ total_links: t?.n || 0, total_clicks: c?.n || 0, today_clicks: td?.n || 0, avg_clicks: 0, clicks_by_day: days.results || [] });
    }

    if (path.startsWith('/api/')) {
      return json({ error: 'not found' }, 404);
    }

    // Redirect: /:slug
    const slug = path.replace(/^\//, '').replace(/\/$/, '');
    if (slug && !slug.includes('.') && slug.length > 0) {
      const link = await env.DB.prepare('SELECT url FROM links WHERE slug = ?').bind(slug).first();
      if (link) {
        env.DB.prepare('UPDATE links SET clicks = clicks + 1 WHERE slug = ?').bind(slug).run().catch(() => {});
        env.DB.prepare("INSERT INTO click_events (slug, clicked_at) VALUES (?, datetime('now'))").bind(slug).run().catch(() => {});
        return Response.redirect(link.url, 301);
      }
    }

    return new Response('Not Found', { status: 404 });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
