export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders() });
    }

    try {
      const { message, history } = await request.json();
      if (!message) {
        return jsonResponse({ error: 'Message is required' }, 400, corsHeaders());
      }

      const messages = [
        { role: 'system', content: 'Tu es un assistant IA utile, concis et professionnel. Réponds en français sauf si l\'utilisateur écrit dans une autre langue.' },
        ...(history || []),
        { role: 'user', content: message }
      ];

      const ai = env.AI;
      const response = await ai.run('@cf/meta/llama-3.2-3b-instruct', { messages, max_tokens: 512 });

      return jsonResponse({ reply: response.response }, 200, corsHeaders());
    } catch (err) {
      return jsonResponse({ error: err.message || 'Internal error' }, 500, corsHeaders());
    }
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function jsonResponse(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' }
  });
}
