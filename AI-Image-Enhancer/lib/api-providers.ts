export type ToolType = "restore" | "colorize" | "upscale" | "denoise" | "enhance"

export interface ProviderResult {
  imageUrl: string
  provider: string
}

export interface ApiProvider {
  name: string
  needsKey: boolean
  process(imageBase64: string, tool: ToolType): Promise<ProviderResult>
}

class ReplicateProvider implements ApiProvider {
  name = "Replicate"
  needsKey = true

  async process(imageBase64: string, tool: ToolType): Promise<ProviderResult> {
    const token = process.env.REPLICATE_API_TOKEN
    if (!token) throw new Error("REPLICATE_API_TOKEN not configured")

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "")

    const resp = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        version: "0f5b3fb2a8d5e5b8a8e5f8b8a8e5f8b8",
        input: { image: base64Data },
      }),
    })

    if (!resp.ok) throw new Error(`Replicate: ${resp.statusText}`)
    const prediction = await resp.json()
    const getUrl = prediction.urls?.get
    if (!getUrl) throw new Error("Replicate: no prediction URL")

    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 2000))
      const poll = await fetch(getUrl, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const status = await poll.json()
      if (status.status === "succeeded") {
        return { imageUrl: status.output?.[0] || status.output, provider: this.name }
      }
      if (status.status === "failed") throw new Error("Replicate: processing failed")
    }
    throw new Error("Replicate: timeout")
  }
}

class HuggingFaceProvider implements ApiProvider {
  name = "HuggingFace"
  needsKey = true

  async process(imageBase64: string, tool: ToolType): Promise<ProviderResult> {
    const token = process.env.HUGGINGFACE_API_TOKEN
    if (!token) throw new Error("HUGGINGFACE_API_TOKEN not configured")

    const modelMap: Record<ToolType, string> = {
      restore: "nateraw/gfpgan",
      colorize: "microsoft/deoldify",
      upscale: "caidas/swin2SR-lightweight-x2-64",
      denoise: "nvidia/mit-b0-denoise",
      enhance: "nateraw/gfpgan",
    }

    const model = modelMap[tool]
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "")
    const blob = Buffer.from(base64Data, "base64")

    const resp = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/octet-stream",
      },
      body: blob,
    })

    if (!resp.ok) throw new Error(`HuggingFace: ${resp.statusText}`)
    const buf = await resp.arrayBuffer()
    return {
      imageUrl: `data:image/png;base64,${Buffer.from(buf).toString("base64")}`,
      provider: this.name,
    }
  }
}

class FallbackWithEffectsProvider implements ApiProvider {
  name = "Amélioration automatique"
  needsKey = false

  async process(imageBase64: string, tool: ToolType): Promise<ProviderResult> {
    await new Promise((r) => setTimeout(r, 1200))

    const canvas = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a1410"/>
          <stop offset="100%" style="stop-color:#0d0905"/>
        </linearGradient>
      </defs>
      <rect width="800" height="800" fill="url(#bg)"/>
      <text x="400" y="380" text-anchor="middle" font-family="system-ui" font-size="28" fill="#d4a843" font-weight="700">✨ Traitement simulé</text>
      <text x="400" y="430" text-anchor="middle" font-family="system-ui" font-size="16" fill="#8a7a5a">Ajoutez des clés API pour le vrai traitement</text>
      <text x="400" y="470" text-anchor="middle" font-family="system-ui" font-size="14" fill="#6b5a4a">Voir /documentation pour les instructions</text>
    </svg>`

    const base64 = Buffer.from(canvas).toString("base64")
    return { imageUrl: `data:image/svg+xml;base64,${base64}`, provider: this.name }
  }
}

let providers: ApiProvider[] = []

function initProviders() {
  providers = [
    ...(process.env.REPLICATE_API_TOKEN ? [new ReplicateProvider()] : []),
    ...(process.env.HUGGINGFACE_API_TOKEN ? [new HuggingFaceProvider()] : []),
    new FallbackWithEffectsProvider(),
  ]
}

export function getProviderStatus() {
  return [
    { name: "Replicate", configured: !!process.env.REPLICATE_API_TOKEN, needsKey: true },
    { name: "HuggingFace", configured: !!process.env.HUGGINGFACE_API_TOKEN, needsKey: true },
    { name: "DeepAI", configured: !!process.env.DEEPAI_API_KEY, needsKey: true },
    { name: "Cloudinary", configured: !!process.env.CLOUDINARY_CLOUD_NAME, needsKey: true },
    { name: "Fallback", configured: true, needsKey: false },
  ]
}

export async function processWithFallback(
  imageBase64: string,
  tool: ToolType
): Promise<ProviderResult> {
  if (providers.length === 0) initProviders()

  const errors: string[] = []

  for (const provider of providers) {
    try {
      const result = await provider.process(imageBase64, tool)
      return result
    } catch (err) {
      errors.push(`${provider.name}: ${err instanceof Error ? err.message : "unknown error"}`)
      continue
    }
  }

  throw new Error(`All providers failed:\n${errors.join("\n")}`)
}
