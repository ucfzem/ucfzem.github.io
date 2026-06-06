export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'DELETE') {
    await env.DB.prepare('DELETE FROM click_events WHERE slug IN (SELECT slug FROM links)').run();
    await env.DB.prepare('DELETE FROM links').run();
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { results } = await env.DB.prepare(
    'SELECT * FROM links ORDER BY created_at DESC LIMIT 50'
  ).all();

  return new Response(JSON.stringify(results), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  });
}
