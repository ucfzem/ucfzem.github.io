async function enhanceWithGemini(prompt, key) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Expand this image prompt into a detailed FLUX-ready prompt (max 80 words). Keep the original idea but add details about lighting, style, colors, composition. Return ONLY the enhanced prompt, no explanations.\n\nPrompt: ${prompt}`
          }]
        }]
      })
    }
  )
  const data = await res.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || null
}

async function enhanceWithGroq(prompt, key) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'mixtral-8x7b-32768',
      messages: [{
        role: 'user',
        content: `Expand this image prompt into a detailed FLUX-ready prompt (max 80 words). Keep the original idea but add details about lighting, style, colors, composition. Return ONLY the enhanced prompt, no explanations.\n\nPrompt: ${prompt}`
      }],
      temperature: 0.7,
      max_tokens: 200
    })
  })
  const data = await res.json()
  return data?.choices?.[0]?.message?.content || null
}

async function enhancePrompt(prompt, env) {
  const geminiKeys = [env.GEMINI_KEY1, env.GEMINI_KEY2, env.GEMINI_KEY3].filter(Boolean)

  for (const key of geminiKeys) {
    try {
      const result = await enhanceWithGemini(prompt, key)
      if (result) return result
    } catch {}
  }

  if (env.GROQ_KEY) {
    try {
      const result = await enhanceWithGroq(prompt, env.GROQ_KEY)
      if (result) return result
    } catch {}
  }

  return prompt
}

async function generateWithReplicate(prompt, width, height, apiKey) {
  const body = {
    input: {
      prompt,
      width: width || 1024,
      height: height || 1024,
      num_outputs: 1,
      num_inference_steps: 4,
      guidance_scale: 0
    }
  }

  const res = await fetch(
    'https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait'
      },
      body: JSON.stringify(body)
    }
  )

  const data = await res.json()

  if (data.output) {
    const imageUrl = Array.isArray(data.output) ? data.output[0] : data.output
    const imageRes = await fetch(imageUrl)
    const blob = await imageRes.arrayBuffer()
    return new Response(blob, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': imageRes.headers.get('content-type') || 'image/png'
      }
    })
  }

  if (data.urls?.get) {
    for (let i = 0; i < 30; i++) {
      const statusRes = await fetch(data.urls.get, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      })
      const statusData = await statusRes.json()
      if (statusData.status === 'succeeded') {
        const imageUrl = Array.isArray(statusData.output) ? statusData.output[0] : statusData.output
        const imageRes = await fetch(imageUrl)
        const blob = await imageRes.arrayBuffer()
        return new Response(blob, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': imageRes.headers.get('content-type') || 'image/png'
          }
        })
      }
      if (statusData.status === 'failed') {
        throw new Error(statusData.error || 'Replicate generation failed')
      }
      await new Promise(r => setTimeout(r, 1000))
    }
    throw new Error('Replicate generation timed out')
  }

  throw new Error(data.detail || JSON.stringify(data))
}

async function generateWithProdia(prompt, token) {
  const res = await fetch('https://inference.prodia.com/v2/job', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
      'Accept': 'image/png'
    },
    body: JSON.stringify({
      type: 'inference.flux-fast.schnell.txt2img.v2',
      config: { prompt }
    })
  })

  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('image')) {
    const blob = await res.arrayBuffer()
    return new Response(blob, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': contentType
      }
    })
  }

  const text = await res.text()
  throw new Error(text)
}

async function generateWithHuggingFace(prompt, width, height, token) {
  const res = await fetch(
    'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell',
    {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { width: width || 1024, height: height || 1024 }
      })
    }
  )

  const contentType = res.headers.get('content-type') || ''

  if (contentType.includes('image')) {
    const blob = await res.arrayBuffer()
    return new Response(blob, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': contentType
      }
    })
  }

  const text = await res.text()
  throw new Error(text)
}

async function generateWithWorkersAI(prompt, width, height, ai) {
  const inputs = { prompt, width: width||1024, height: height||1024, num_steps: 4 }
  const response = await ai.run('@cf/black-forest-labs/flux-1-schnell', inputs)
  const binary = atob(response.image)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  const magic = bytes[0]<<16|bytes[1]<<8|bytes[2]
  const ct = magic===0xFFD8FF?'image/jpeg':bytes[0]===137&&bytes[1]===80&&bytes[2]===78?'image/png':bytes[0]===71&&bytes[1]===73&&bytes[2]===70?'image/gif':bytes[0]===82&&bytes[1]===73&&bytes[2]===70?'image/webp':'image/png'
  return new Response(bytes, {
    status: 200,
    headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': ct }
  })
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }

    if (url.pathname === '/generate' && request.method === 'POST') {
      try {
        const { prompt, width, height } = await request.json()
        const enhanced = await enhancePrompt(prompt, env)

        if (env.AI) {
          try {
            return await generateWithWorkersAI(enhanced, width, height, env.AI)
          } catch (e) {
            // Workers AI failed, fall through
          }
        }

        if (env.REPLICATE_KEY) {
          try {
            return await generateWithReplicate(enhanced, width, height, env.REPLICATE_KEY)
          } catch (e) {
            if (!env.TOKEN) throw e
          }
        }

        if (env.TOKEN) {
          try {
            return await generateWithHuggingFace(enhanced, width, height, env.TOKEN)
          } catch (e) {
            // HF failed, fall through
          }
        }

        if (env.PRODIA_TOKEN) {
          try {
            return await generateWithProdia(enhanced, env.PRODIA_TOKEN)
          } catch (e) {
            // Prodia failed, fall through to Pollinations
          }
        }

        const pollUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhanced)}?width=${width||1024}&height=${height||1024}&model=flux`
        return new Response(JSON.stringify({ type: 'pollinations', url: pollUrl }), {
          status: 200,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
        })
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
        })
      }
    }

    return new Response('Not found', { status: 404 })
  }
}
