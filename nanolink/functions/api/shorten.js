export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { url, slug } = body;

  if (!url) {
    return new Response(JSON.stringify({ error: 'URL is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    new URL(url);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid URL' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const finalSlug = slug || generateSlug();
  if (finalSlug.length < 3 || finalSlug.length > 32 || !/^[a-z0-9-]+$/.test(finalSlug)) {
    return new Response(JSON.stringify({ error: 'Slug invalide (3-32 caractères, lettres/chiffres/tirets)' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const existing = await env.DB.prepare(
    'SELECT slug FROM links WHERE slug = ?'
  ).bind(finalSlug).first();

  if (existing) {
    return new Response(JSON.stringify({ error: 'Ce slug est déjà pris' }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await env.DB.prepare(
    "INSERT INTO links (slug, url, clicks, created_at) VALUES (?, ?, 0, datetime('now'))"
  ).bind(finalSlug, url).run();

  const link = await env.DB.prepare(
    'SELECT * FROM links WHERE slug = ?'
  ).bind(finalSlug).first();

  return new Response(JSON.stringify(link), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}

function generateSlug(length = 6) {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  let slug = '';
  for (let i = 0; i < length; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}
