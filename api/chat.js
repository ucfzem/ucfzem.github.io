export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const ghToken = process.env.GH_TOKEN;
  if (!ghToken) return res.status(500).json({ error: 'GitHub token not configured' });

  const messages = [
    { role: 'system', content: 'Tu es un assistant IA utile, concis et professionnel. Réponds en français sauf si l\'utilisateur écrit dans une autre langue.' },
    ...(history || []),
    { role: 'user', content: message }
  ];

  try {
    const response = await fetch(
      'https://models.inference.ai.azure.com/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ghToken}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          max_tokens: 512,
          temperature: 0.7
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || 'GitHub Models error'
      });
    }

    return res.status(200).json({
      reply: data.choices[0].message.content
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erreur réseau' });
  }
}
