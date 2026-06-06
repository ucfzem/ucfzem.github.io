export async function onRequest(context) {
  const { request, params, env } = context;
  const slug = params.slug;

  if (!slug || slug.includes('.')) {
    return new Response('Not Found', { status: 404 });
  }

  try {
    const link = await env.DB.prepare(
      'SELECT url FROM links WHERE slug = ?'
    ).bind(slug).first();

    if (!link) {
      return new Response('Not Found', { status: 404 });
    }

    await env.DB.prepare(
      "UPDATE links SET clicks = clicks + 1 WHERE slug = ?"
    ).bind(slug).run();

    await env.DB.prepare(
      "INSERT INTO click_events (slug, clicked_at) VALUES (?, datetime('now'))"
    ).bind(slug).run();

    return Response.redirect(link.url, 301);
  } catch (e) {
    return new Response('Internal Error', { status: 500 });
  }
}
