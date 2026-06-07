const ADMIN_PASSWORD = 'freelance2026'

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        }
      })
    }

    // Admin: list all emails
    if (url.pathname === '/admin' && request.method === 'GET') {
      const pw = url.searchParams.get('password')
      if (pw !== ADMIN_PASSWORD) {
        return jsonResponse({ error: 'Unauthorized' }, 401)
      }
      const list = await env.EMAILS.list()
      const entries = []
      for (const key of list.keys) {
        const val = JSON.parse(await env.EMAILS.get(key.name))
        entries.push(val)
      }
      entries.sort((a, b) => b.ts - a.ts)
      return jsonResponse({ total: entries.length, entries })
    }

    // Collect email
    if (request.method === 'POST') {
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

    return jsonResponse({ error: 'Not found' }, 404)
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
}
