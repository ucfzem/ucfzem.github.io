// Endpoint Serverless Vercel — /api/chat
// Utilise OpenRouter (GitHub Models retiré le 30/07/2026).
// Réponses tronquées = max_tokens trop bas (512) → corrigé à 2048,
// + repli automatique sur d'autres modèles ':free' si l'un échoue.
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
    { role: 'system', content: 'Tu es un assistant IA utile, concis et professionnel. Réponds en français sauf si l\'utilisateur écrit dans une autre langue. Termine toujours tes phrases.' },
    ...(history || []),
    { role: 'user', content: message }
  ];

  // Modèles gratuits : le premier est le principal, les suivants servent de repli.
  const models = [
    'nvidia/nemotron-3-super-120b-a12b:free',
    'google/gemma-4-31b-it:free',
    'openai/gpt-oss-20b:free',
    'nvidia/nemotron-3-nano-30b-a3b:free'
  ];

  let lastError = null;
  for (const model of models) {
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
            max_tokens: 2048,
            temperature: 0.7,
            stream: false
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        lastError = data.error?.message || `OpenRouter (${model})`;
        continue; // essaie le modèle suivant
      }

      const reply = data.choices?.[0]?.message?.content;
      if (!reply || !reply.trim()) {
        lastError = `Réponse vide (${model})`;
        continue;
      }

      return res.status(200).json({ reply, model });
    } catch (err) {
      lastError = err.message || 'Erreur réseau';
      continue;
    }
  }

  return res.status(502).json({ error: lastError || 'Erreur réseau' });
}