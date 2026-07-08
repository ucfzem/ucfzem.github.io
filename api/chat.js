export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const messages = [
    { role: 'system', content: 'Tu es un assistant IA utile, concis et professionnel. Réponds en français sauf si l\'utilisateur écrit dans une autre langue.' },
    ...(history || []),
    { role: 'user', content: message }
  ];

  const models = [
    'meta-llama/llama-3.2-3b-instruct:free',
    'google/gemma-4-26b-a4b-it:free',
    'qwen/qwen3-coder:free'
  ];

  for (const model of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://ucfzem.eu.org',
            'X-Title': 'Mon Assistant IA'
          },
          body: JSON.stringify({ model, messages, max_tokens: 1024, temperature: 0.7 })
        });

        const data = await response.json();

        if (response.ok && data.choices?.[0]?.message?.content) {
          return res.status(200).json({ reply: data.choices[0].message.content, usage: data.usage });
        }

        const retryAfter = data?.error?.metadata?.retry_after_seconds || 5;
        await new Promise(r => setTimeout(r, retryAfter * 1000));
      } catch {
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  }

  return res.status(503).json({ error: 'Aucun modèle disponible pour le moment. Réessaie dans quelques secondes.' });
}
