export type ToolType = "restore" | "colorize" | "upscale" | "denoise" | "enhance"

export interface ProcessResponse {
  imageUrl: string
  provider: string
}

export interface ProcessError {
  error: string
  details?: string
}

function hsl2rgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x }
  else if (h < 120) { r = x; g = c }
  else if (h < 180) { g = c; b = x }
  else if (h < 240) { g = x; b = c }
  else if (h < 300) { r = x; b = c }
  else { r = c; b = x }
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255]
}

function canvasColorize(imageData: ImageData): ImageData {
  const d = imageData.data
  const w = imageData.width, h = imageData.height
  const len = w * h

  // STEP 1: Convert to true grayscale (discard original color)
  for (let i = 0; i < d.length; i += 4) {
    const gray = Math.round(d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114)
    d[i] = gray; d[i + 1] = gray; d[i + 2] = gray
  }

  // STEP 2: Histogram stretch for contrast
  let mn = 255, mx = 0
  for (let i = 0; i < d.length; i += 4) {
    if (d[i] < mn) mn = d[i]
    if (d[i] > mx) mx = d[i]
  }
  const rng = mx - mn || 1
  for (let i = 0; i < d.length; i += 4) {
    const v = Math.round((d[i] - mn) / rng * 255)
    d[i] = v; d[i + 1] = v; d[i + 2] = v
  }

  // STEP 3: Luminance map + local variance (7x7 window)
  const lum = new Float32Array(len)
  for (let i = 0; i < len; i++) lum[i] = d[i * 4] / 255

  const localMean = new Float32Array(len)
  const localVar = new Float32Array(len)
  const R = 3
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0, sum2 = 0, cnt = 0
      const y0 = Math.max(0, y - R), y1 = Math.min(h - 1, y + R)
      const x0 = Math.max(0, x - R), x1 = Math.min(w - 1, x + R)
      for (let ky = y0; ky <= y1; ky++) {
        for (let kx = x0; kx <= x1; kx++) {
          const v = lum[ky * w + kx]
          sum += v; sum2 += v * v; cnt++
        }
      }
      const mean = sum / cnt
      localMean[y * w + x] = mean
      localVar[y * w + x] = sum2 / cnt - mean * mean
    }
  }

  // STEP 4: Per-pixel zone classification + HSL colorization
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x
      const i4 = idx * 4
      const n = lum[idx]
      const lv = localVar[idx]
      const lm = localMean[idx]

      const isFlat = lv < 0.004
      const isBright = n > 0.65
      const isMid = n > 0.30 && n <= 0.65
      const isDark = n <= 0.30

      let hue: number, sat: number, lightness: number

      if (isFlat && isBright) {
        hue = 200 + n * 20
        sat = 0.45 + lm * 0.3
        lightness = 0.45 + n * 0.3
      } else if (isDark && isFlat) {
        hue = 225 + n * 30
        sat = 0.25 + lv * 10
        lightness = 0.08 + n * 0.4
      } else if (isDark) {
        hue = 100 + n * 40
        sat = 0.30 + lv * 8
        lightness = 0.10 + n * 0.5
      } else if (isMid && !isFlat) {
        const t = (n - 0.30) / 0.35
        hue = 25 + t * 15
        sat = 0.40 + lv * 6
        lightness = 0.30 + n * 0.4
      } else if (isMid && isFlat) {
        hue = 35
        sat = 0.15
        lightness = 0.30 + n * 0.35
      } else {
        hue = 42 + (1 - n) * 15
        sat = 0.20 + lv * 3
        lightness = 0.60 + n * 0.35
      }

      sat = Math.max(0, Math.min(1, sat))
      lightness = Math.max(0.05, Math.min(0.95, lightness))

      const rgb = hsl2rgb(hue, sat, lightness)
      const orig = n * 255

      d[i4] = Math.round(rgb[0] * 0.75 + orig * 0.25)
      d[i4 + 1] = Math.round(rgb[1] * 0.75 + orig * 0.25)
      d[i4 + 2] = Math.round(rgb[2] * 0.75 + orig * 0.25)
      d[i4 + 3] = 255
    }
  }

  return imageData
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
      canvasColorize(imageData)
      ctx.putImageData(imageData, 0, 0)
      const blur = document.createElement("canvas")
      blur.width = img.width; blur.height = img.height
      const blurCtx = blur.getContext("2d")!
      blurCtx.filter = "blur(0.6px) saturate(1.15)"
      blurCtx.drawImage(canvas, 0, 0)
      const blob = await new Promise<Blob | null>((r) => blur.toBlob(r, "image/png"))
      if (!blob) throw new Error("Canvas fallback: failed to generate image")
      return { imageUrl: URL.createObjectURL(blob), provider: "Canvas" }
    }
    throw e
  }
}
