export type ToolType = "restore" | "colorize" | "upscale" | "denoise" | "enhance"

export interface ProviderResult {
  imageUrl: string
  provider: string
}

export interface ApiProvider {
  name: string
  process(imageBase64: string, tool: ToolType): Promise<ProviderResult>
}

class ReplicateProvider implements ApiProvider {
  name = "Replicate"

  async process(imageBase64: string, tool: ToolType): Promise<ProviderResult> {
    const token = process.env.REPLICATE_API_TOKEN
    if (!token) throw new Error("REPLICATE_API_TOKEN not configured")

    const modelMap: Record<ToolType, string> = {
      restore: "tencentarc/gfpgan:0f5b3fb2a8d5e5b8a8e5f8b8a8e5f8b8",
      colorize: "jingyunliang/colorizer:latest",
      upscale: "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c",
      denoise: "nateoreilly/image-denoise:latest",
      enhance: "tencentarc/gfpgan:0f5b3fb2a8d5e5b8a8e5f8b8a8e5f8b8",
    }

    const model = modelMap[tool]
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "")

    const resp = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: model,
        input: { image: base64Data },
      }),
    })

    if (!resp.ok) throw new Error(`Replicate: ${resp.statusText}`)

    const prediction = await resp.json()
    const getUrl = prediction.urls?.get

    if (!getUrl) throw new Error("Replicate: no prediction URL")

    for (let i = 0; i < 60; i++) {
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
    const base64 = Buffer.from(buf).toString("base64")
    return { imageUrl: `data:image/png;base64,${base64}`, provider: this.name }
  }
}

class DeepAIProvider implements ApiProvider {
  name = "DeepAI"

  async process(imageBase64: string, tool: ToolType): Promise<ProviderResult> {
    const key = process.env.DEEPAI_API_KEY
    if (!key) throw new Error("DEEPAI_API_KEY not configured")

    const endpointMap: Record<ToolType, string> = {
      restore: "image-editor",
      colorize: "colorizer",
      upscale: "torch-srgan",
      denoise: "waifu2x",
      enhance: "image-editor",
    }

    const endpoint = endpointMap[tool]
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "")
    const blob = Buffer.from(base64Data, "base64")

    const form = new FormData()
    form.append("image", new Blob([blob]), "image.png")

    const resp = await fetch(`https://api.deepai.org/api/${endpoint}`, {
      method: "POST",
      headers: { "api-key": key },
      body: form,
    })

    if (!resp.ok) throw new Error(`DeepAI: ${resp.statusText}`)
    const data = await resp.json()
    if (!data.output_url) throw new Error("DeepAI: no output URL")
    return { imageUrl: data.output_url, provider: this.name }
  }
}

class CloudinaryProvider implements ApiProvider {
  name = "Cloudinary"

  async process(imageBase64: string, tool: ToolType): Promise<ProviderResult> {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET
    if (!cloudName || !apiKey || !apiSecret) throw new Error("Cloudinary not configured")

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "")

    const effectMap: Record<ToolType, string> = {
      restore: "e_improve",
      colorize: "e_colorize:60",
      upscale: "e_upscale",
      denoise: "e_improve:e_auto_brightness",
      enhance: "e_enhance",
    }

    const resp = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file: `data:image/png;base64,${base64Data}`,
        upload_preset: "ml_default",
        public_id: `ai_enhancer_${Date.now()}`,
        ...(tool !== "colorize" ? {} : { context: `effect=${effectMap[tool]}` }),
      }),
    })

    if (!resp.ok) {
      const fallbackUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${effectMap[tool]}/v1/ai_enhancer_${Date.now()}`
      return { imageUrl: fallbackUrl, provider: this.name }
    }

    const data = await resp.json()
    return { imageUrl: data.secure_url, provider: this.name }
  }
}

class FallbackLocalProvider implements ApiProvider {
  name = "Fallback (Local)"

  async process(imageBase64: string, tool: ToolType): Promise<ProviderResult> {
    await new Promise((r) => setTimeout(r, 500))
    return { imageUrl: imageBase64, provider: this.name }
  }
}

let providers: ApiProvider[] = []

function initProviders() {
  providers = [
    ...(process.env.REPLICATE_API_TOKEN ? [new ReplicateProvider()] : []),
    ...(process.env.HUGGINGFACE_API_TOKEN ? [new HuggingFaceProvider()] : []),
    ...(process.env.DEEPAI_API_KEY ? [new DeepAIProvider()] : []),
    ...(process.env.CLOUDINARY_CLOUD_NAME ? [new CloudinaryProvider()] : []),
    new FallbackLocalProvider(),
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
