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

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://ucfzem.eu.org',
        'X-Title': 'Mon Assistant IA'
      },
      body: JSON.stringify({
        model: 'google/gemma-4-26b-a4b-it:free',
        messages,
        max_tokens: 512,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const meta = data?.error?.metadata;
      const msg = meta?.raw || data?.error?.message || 'Erreur API';
      return res.status(429).json({ error: msg, retryAfter: meta?.retry_after_seconds });
    }

    return res.status(200).json({ reply: data.choices[0].message.content });
  } catch {
    return res.status(500).json({ error: 'Erreur réseau' });
  }
}
