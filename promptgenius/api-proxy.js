// PromptGenius API Proxy
// Déploiement : Cloudflare Worker (copier-coller dans le dashboard)
// ou Render/Railway (Node.js)
// La clé API Gemini est lue depuis la variable d'environnement GEMINI_API_KEY

// --- Mode Cloudflare Worker ---
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/v1/chat' || request.method !== 'POST') {
      return new Response('Not Found', { status: 404 });
    }

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      const body = await request.json();
      const { contents } = body;

      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents }) }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Gemini API error');

      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500, headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};

// --- Mode Node.js (Render / Railway / Vercel) ---
// Décommente pour déploiement Node.js :
/*
const express = require('express');
const app = express();
app.use(express.json({ limit: '10mb' }));
app.post('/v1/chat', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });
  try {
    const { contents } = req.body;
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents }) }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Gemini API error');
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Proxy running on port', port));
*/
