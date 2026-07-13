export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { image, style, medium, detail, mood } = req.body;
  if (!image) return res.status(400).json({ error: 'Image is required' });

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return res.status(500).json({ error: 'GROQ_API_KEY not configured' });

  const detailInstruction = detail === 'Low' ? 'brief overview' : detail === 'Medium' ? 'moderate detail' : 'very detailed, high-resolution';

  const systemPrompt = `You are an expert prompt engineer. Analyze the uploaded image and generate a structured AI art prompt.

Return ONLY a single paragraph prompt in this format:
"A [detail level] [art style] [medium] depiction of "[subject]", [mood] atmosphere, [composition details], [lighting details], [color palette], [texture details], masterpiece, sharp focus, trending on ArtStation, 8k resolution."

Fill in the bracketed sections based on the actual image content. Use these user preferences:
- Art Style: ${style}
- Medium: ${medium}
- Level of Detail: ${detailInstruction}
- Mood/Atmosphere: ${mood || 'as depicted in the image'}

Describe what you actually see in the image. Be specific about the subject, composition, lighting, colors, and textures.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.2-11b-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: systemPrompt },
              { type: 'image_url', image_url: { url: image, detail: 'high' } }
            ]
          }
        ],
        max_tokens: 1024,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || 'Groq API error'
      });
    }

    return res.status(200).json({
      prompt: data.choices[0].message.content
    });
  } catch (err) {
    return res.status(500).json({ error: 'Network error contacting Groq API' });
  }
}
