export type ToolType = "restore" | "colorize" | "upscale" | "denoise" | "enhance"

export interface ProcessResponse {
  imageUrl: string
  provider: string
}

export interface ProcessError {
  error: string
  details?: string
}

function canvasColorize(
  imageData: ImageData,
  preserveColor: boolean
): ImageData {
  const d = imageData.data
  const w = imageData.width
  const h = imageData.height
  const out = new ImageData(new Uint8ClampedArray(d), w, h)
  const o = out.data

  const skinPixels: Array<[number, number, number]> = []
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const r = d[i], g = d[i + 1], b = d[i + 2]
      const lum = 0.299 * r + 0.587 * g + 0.114 * b
      const s = Math.max(r, g, b) - Math.min(r, g, b)

      if (preserveColor && s > 30) {
        o[i] = r; o[i + 1] = g; o[i + 2] = b; o[i + 3] = 255
        continue
      }

      const nl = lum / 255
      let cr: number, cg: number, cb: number

      if (nl < 0.1) {
        cr = 20 + nl * 100; cg = 25 + nl * 80; cb = 45 + nl * 150
      } else if (nl < 0.25) {
        const t = (nl - 0.1) / 0.15
        cr = 30 + t * 40; cg = 33 + t * 50; cb = 60 + t * 80
      } else if (nl < 0.4) {
        const t = (nl - 0.25) / 0.15
        cr = 55 + t * 80; cg = 50 + t * 70; cb = 90 + t * 30
      } else if (nl < 0.55) {
        const t = (nl - 0.4) / 0.15
        cr = 110 + t * 70; cg = 95 + t * 60; cb = 85 + t * 10
      } else if (nl < 0.7) {
        const t = (nl - 0.55) / 0.15
        cr = 160 + t * 50; cg = 140 + t * 50; cb = 90 - t * 20
      } else {
        const t = Math.min((nl - 0.7) / 0.3, 1)
        cr = 200 + t * 55; cg = 180 + t * 75; cb = 100 + t * 155
      }

      const tr = Math.max(0, Math.min(255, Math.round(cr + (lum - cr) * 0.3)))
      const tg = Math.max(0, Math.min(255, Math.round(cg + (lum - cg) * 0.3)))
      const tb = Math.max(0, Math.min(255, Math.round(cb + (lum - cb) * 0.3)))

      if (r > 60 && g > 40 && b > 30 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && r > b) {
        skinPixels.push([tr, tg, tb])
      }

      o[i] = tr; o[i + 1] = tg; o[i + 2] = tb; o[i + 3] = 255
    }
  }

  if (skinPixels.length > w * h * 0.02) {
    const avgR = skinPixels.reduce((a, p) => a + p[0], 0) / skinPixels.length
    const avgG = skinPixels.reduce((a, p) => a + p[1], 0) / skinPixels.length
    const avgB = skinPixels.reduce((a, p) => a + p[2], 0) / skinPixels.length
    const skinLum = 0.299 * avgR + 0.587 * avgG + 0.114 * avgB
    if (skinLum > 80 && skinLum < 220) {
      for (let i = 0; i < o.length; i += 4) {
        const rC = o[i], gC = o[i + 1], bC = o[i + 2]
        const dist = Math.abs(rC - avgR) + Math.abs(gC - avgG) + Math.abs(bC - avgB)
        const l = 0.299 * rC + 0.587 * gC + 0.114 * bC
        const nL = l / 255
        if (dist < 80 && nL > 0.15 && nL < 0.85) {
          const f = 0.25 + 0.5 * (1 - dist / 80)
          o[i] = Math.round(rC + (avgR + 15 - rC) * f)
          o[i + 1] = Math.round(gC + (avgG + 10 - gC) * f)
          o[i + 2] = Math.round(bC + (avgB - 5 - bC) * f)
        }
      }
    }
  }

  return out
}

export async function processImage(
  file: File,
  tool: ToolType
): Promise<ProcessResponse> {
  const formData = new FormData()
  formData.append("image", file)
  formData.append("tool", tool)

  try {
    const resp = await fetch("https://ai-image-enhancer-api.azer-tyu199p.workers.dev/api/process", {
      method: "POST",
      body: formData,
    })

    if (resp.ok) return resp.json()

    const err: ProcessError = await resp.json().catch(() => ({
      error: resp.statusText,
    }))
    throw new Error(err.error || "Erreur inconnue")
  } catch (e) {
    if (tool === "colorize" && typeof document !== "undefined") {
      const img = new Image()
      img.src = URL.createObjectURL(file)
      await new Promise((r) => { img.onload = r; img.onerror = r })
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(img.src)
      const imageData = ctx.getImageData(0, 0, img.width, img.height)
      let hasColor = false
      for (let i = 0; i < imageData.data.length; i += 40) {
        const p = Math.floor(i / 4) * 4
        if (Math.abs(imageData.data[p] - imageData.data[p + 1]) > 25 ||
            Math.abs(imageData.data[p + 1] - imageData.data[p + 2]) > 25) {
          hasColor = true; break
        }
      }
      const result = canvasColorize(imageData, hasColor)
      ctx.putImageData(result, 0, 0)
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"))
      if (!blob) throw new Error("Canvas fallback: failed to generate image")
      return { imageUrl: URL.createObjectURL(blob), provider: "Canvas" }
    }
    throw e
  }
}
