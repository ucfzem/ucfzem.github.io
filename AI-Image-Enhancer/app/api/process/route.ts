import { NextRequest, NextResponse } from "next/server"
import { processWithFallback } from "@/lib/api-providers"
import { checkRateLimit } from "@/lib/rate-limiter"

export const runtime = "nodejs"
export const maxDuration = 120

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
  
  const { allowed, remaining } = checkRateLimit(ip)
  if (!allowed) {
    return NextResponse.json(
      { error: "Limite quotidienne atteinte (10 traitements/jour). Réessayez demain." },
      { status: 429 }
    )
  }

  try {
    const formData = await req.formData()
    const file = formData.get("image") as File | null
    const tool = formData.get("tool") as string | null

    if (!file || !tool) {
      return NextResponse.json(
        { error: "Paramètres manquants : image et tool requis" },
        { status: 400 }
      )
    }

    const validTools = ["restore", "colorize", "upscale", "denoise", "enhance"]
    if (!validTools.includes(tool)) {
      return NextResponse.json(
        { error: "Outil invalide. Choisir parmi : " + validTools.join(", ") },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = `data:${file.type || "image/png"};base64,${buffer.toString("base64")}`

    const result = await processWithFallback(base64, tool as any)

    return NextResponse.json({
      imageUrl: result.imageUrl,
      provider: result.provider,
      remaining,
    })
  } catch (err) {
    console.error("[API/process]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur serveur" },
      { status: 500 }
    )
  }
}
