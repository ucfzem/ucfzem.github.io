// Endpoint Serverless Vercel — /api/chat
// Utilise OpenRouter (GitHub Models retiré le 30/07/2026).
// Streaming SSE : les premiers mots arrivent en ~1s au lieu d'attendre toute
// la réponse (c'était la cause principale de la lenteur perçue).
// Modèles classés du plus rapide au plus lent : repli automatique en cas d'échec.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OPENROUTER_API_KEY not configured' });

  const messages = [
    { role: 'system', content: 'Tu es un assistant IA utile, concis et professionnel. Réponds en français sauf si l\'utilisateur écrit dans une autre langue. Réponds DIRECTEMENT à la question, sans jamais dévoiler ton raisonnement interne ni tes hésitations. Sois bref : 1 à 3 phrases sauf si on te demande plus de détails. Termine toujours tes phrases.' },
    ...(history || []),
    { role: 'user', content: message }
  ];

  // Modèles gratuits : le premier est le plus fiable pour suivre les consignes,
  // les suivants servent de repli en cas d'échec ou de rate-limit.
  const models = [
    'google/gemma-4-31b-it:free',
    'openai/gpt-oss-20b:free',
    'nvidia/nemotron-3-nano-30b-a3b:free',
    'nvidia/nemotron-3-super-120b-a12b:free'
  ];

  for (const model of models) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60000);
    try {
      const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://ucfzemgithubio.vercel.app',
            'X-Title': 'UcfZem AI'
          },
          body: JSON.stringify({
            model,
            messages,
            max_tokens: 512,
            temperature: 0.4,
            stream: true
          })
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.error(`OpenRouter (${model})`, data.error?.message);
        clearTimeout(timer);
        continue; // essaie le modèle suivant
      }

      res.status(200);
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders();

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === '[DONE]') continue;
          try {
            const json = JSON.parse(payload);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) res.write(`data: ${JSON.stringify({ delta })}\n\n`);
          } catch { /* chunk partiel, on ignore */ }
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
      clearTimeout(timer);
      return;
    } catch (err) {
      clearTimeout(timer);
      console.error(`OpenRouter (${model})`, err.message);
      continue;
    }
  }

  return res.status(502).json({ error: 'Erreur réseau' });
}
