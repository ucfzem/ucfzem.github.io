export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        }
      })
    }
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }
    let body
    try {
      body = await request.json()
    } catch {
      return jsonResponse({ error: 'Invalid JSON' }, 400)
    }
    const { name, email } = body
    if (!name || !email) {
      return jsonResponse({ error: 'Name and email required' }, 400)
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ error: 'Email invalide' }, 400)
    }
    const existing = await env.EMAILS.get(email)
    if (existing) {
      return jsonResponse({ error: 'Cet email est déjà inscrit' }, 409)
    }
    const entry = JSON.stringify({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      ts: Date.now(),
      ip: request.headers.get('CF-Connecting-IP') || '',
      ua: request.headers.get('User-Agent') || ''
    })
    await env.EMAILS.put(email.trim().toLowerCase(), entry)
    return jsonResponse({ ok: true, message: 'Inscription réussie' })
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
}
