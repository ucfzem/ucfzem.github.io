export async function onRequest(context) {
  const { env } = context;

  const linkCount = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM links'
  ).first();

  const clickCount = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM click_events'
  ).first();

  const todayClicks = await env.DB.prepare(
    "SELECT COUNT(*) as count FROM click_events WHERE date(clicked_at) = date('now')"
  ).first();

  const clicksByDay = await env.DB.prepare(`
    SELECT date(clicked_at) as day, COUNT(*) as count
    FROM click_events
    WHERE clicked_at >= datetime('now', '-7 days')
    GROUP BY day
    ORDER BY day
  `).all();

  const firstLink = await env.DB.prepare(
    'SELECT created_at FROM links ORDER BY created_at ASC LIMIT 1'
  ).first();

  let avgClicks = 0;
  if (firstLink && firstLink.created_at) {
    const created = new Date(firstLink.created_at + 'Z').getTime();
    const daysActive = Math.max(1, Math.ceil((Date.now() - created) / 86400000));
    avgClicks = Math.round((clickCount?.count || 0) / daysActive);
  }

  return new Response(JSON.stringify({
    total_links: linkCount?.count || 0,
    total_clicks: clickCount?.count || 0,
    today_clicks: todayClicks?.count || 0,
    avg_clicks: avgClicks,
    clicks_by_day: clicksByDay?.results || [],
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  });
}
