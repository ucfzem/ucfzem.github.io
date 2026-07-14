export async function onRequest(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS')
    return new Response(null, { headers: corsHeaders });

  if (request.method !== 'POST')
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  const { image, style, medium, detail, mood } = await request.json();
  if (!image)
    return new Response(JSON.stringify({ error: 'Image is required' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  const groqKey = env.GROQ_API_KEY;
  if (!groqKey)
    return new Response(JSON.stringify({ error: 'GROQ_API_KEY not configured' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  const detailInstruction = detail === 'Low' ? 'brief overview'
    : detail === 'Medium' ? 'moderate detail'
    : 'very detailed, high-resolution';

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
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: systemPrompt },
            { type: 'image_url', image_url: { url: image, detail: 'high' } }
          ]
        }],
        max_tokens: 1024,
        temperature: 0.7
      })
    });

    const data = await response.json();
    if (!response.ok)
      return new Response(JSON.stringify({ error: data.error?.message || 'Groq API error' }), {
        status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    return new Response(JSON.stringify({ prompt: data.choices[0].message.content }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Network error contacting Groq API' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
