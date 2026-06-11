export type ToolType = "restore" | "colorize" | "upscale" | "denoise" | "enhance"

export interface ProcessResponse {
  imageUrl: string
  provider: string
}

export interface ProcessError {
  error: string
  details?: string
}

export async function processImage(
  file: File,
  tool: ToolType
): Promise<ProcessResponse> {
  const formData = new FormData()
  formData.append("image", file)
  formData.append("tool", tool)

  const resp = await fetch("https://ai-image-enhancer-api.azer-tyu199p.workers.dev/api/process", {
    method: "POST",
    body: formData,
  })

  if (!resp.ok) {
    const err: ProcessError = await resp.json().catch(() => ({
      error: resp.statusText,
    }))
    throw new Error(err.error || "Erreur inconnue")
  }

  return resp.json()
}
