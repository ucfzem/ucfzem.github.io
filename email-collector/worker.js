const ADMIN_PASSWORD = 'freelance2026'
const FROM_EMAIL = 'onboarding@resend.dev'
const PDF_URL = 'https://ucfzem.github.io/email-collector/guide-freelance.pdf'
const SITE_URL = 'https://ucfzem.github.io/email-collector/'
const OWNER_EMAIL = 'azer.tyu199p@gmail.com' // email où tu reçois les notifs d'achat
const YOUR_RIB = '164 640 2111115567830011 27' // Banque Populaire - RIB virement Maroc

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

    // Buy route: notify owner of a purchase request
    if (url.pathname === '/buy' && request.method === 'POST') {
      let body
      try { body = await request.json() } catch { return jsonResponse({ error: 'Invalid JSON' }, 400) }
      const { name, email, product } = body
      if (!name || !email || !product) return jsonResponse({ error: 'Name, email and product required' }, 400)

      // Notify owner via Resend
      const notifyHtml = `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:2rem">
<h2>🛒 Nouvelle demande d'achat</h2>
<p><strong>Produit:</strong> ${escapeHtml(product)}</p>
<p><strong>Nom:</strong> ${escapeHtml(name)}</p>
<p><strong>Email:</strong> ${escapeHtml(email)}</p>
<p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
<hr>
<p style="color:#666">Envoie le PDF à ${escapeHtml(email)} dès réception du virement.</p>
</body></html>`

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: OWNER_EMAIL,
          subject: `🛒 Achat: ${escapeHtml(product)} - ${escapeHtml(name)}`,
          html: notifyHtml,
        })
      }).catch(() => {})

      return jsonResponse({ ok: true, rib: YOUR_RIB })
    }

    // Collect email + send via Resend
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

      // Send welcome email via Resend (fire-and-forget)
      sendEmail(env, name.trim(), email.trim().toLowerCase()).catch(() => {})

      return jsonResponse({ ok: true, message: 'Inscription réussie' })
    }

    return jsonResponse({ error: 'Not found' }, 404)
  }
}

async function sendEmail(env, name, to) {
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;padding:2rem 1rem;margin:0">
<table align="center" style="max-width:520px;width:100%;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,.05)">
<tr><td style="padding:2rem;text-align:center">
<img src="https://ucfzem.github.io/images/avatar.png" alt="" style="width:64px;height:64px;border-radius:50%;margin-bottom:1rem">
<h1 style="font-size:1.25rem;color:#0f172a;margin:0 0 .25rem">Merci ${escapeHtml(name)} !</h1>
<p style="color:#64748b;font-size:.875rem;margin:0 0 1.5rem">Ton guide est prêt à être téléchargé.</p>
<a href="${PDF_URL}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#6366f1);color:#fff;text-decoration:none;padding:.75rem 1.5rem;border-radius:.75rem;font-size:.875rem;font-weight:600;margin-bottom:1.5rem">📄 Télécharger le guide (PDF)</a>
<p style="color:#94a3b8;font-size:.75rem;margin:0">Si le bouton ne marche pas : <a href="${PDF_URL}" style="color:#818cf8">${PDF_URL}</a></p>
</td></tr>
<tr><td style="padding:1rem 2rem;text-align:center;background:#f8fafc;border-radius:0 0 12px 12px">
<p style="color:#94a3b8;font-size:.75rem;margin:0">Reçu via <a href="${SITE_URL}" style="color:#818cf8;text-decoration:underline">${SITE_URL}</a></p>
</td></tr>
</table>
</body>
</html>`

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      subject: '🎉 Ton guide freelance est prêt !',
      html,
    })
  })
}

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, function(m) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m] })
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
}
