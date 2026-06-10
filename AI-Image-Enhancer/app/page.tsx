"use client"

import { useState, useCallback } from "react"
import { Sparkles, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { UploadZone } from "@/components/UploadZone"
import { ToolSelector } from "@/components/ToolSelector"
import { BeforeAfter } from "@/components/BeforeAfter"
import { ProcessingStatus } from "@/components/ProcessingStatus"
import { processImage, type ToolType } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [tool, setTool] = useState<ToolType>("restore")
  const [processing, setProcessing] = useState(false)
  const [statusText, setStatusText] = useState("")
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [provider, setProvider] = useState<string | null>(null)

  const handleFile = useCallback((f: File) => {
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
    setResultUrl(null)
    setProvider(null)
  }, [])

  const handleProcess = async () => {
    if (!file) return
    setProcessing(true)
    setStatusText("Envoi au serveur...")
    setResultUrl(null)
    setProvider(null)

    try {
      const res = await processImage(file, tool)
      setResultUrl(res.imageUrl)
      setProvider(res.provider)
      toast.success("Image traitée avec succès via " + res.provider)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec du traitement")
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setPreviewUrl(null)
    setResultUrl(null)
    setProvider(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }

  return (
    <>
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium">
          <Sparkles className="w-4 h-4" /> Propulsé par l'IA
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 via-amber-600 to-orange-700 bg-clip-text text-transparent">
          AI Image Enhancer
        </h1>
        <p className="text-stone-400 max-w-2xl mx-auto">
          Restaurez, colorez et améliorez vos images en un clic grâce à l&apos;IA.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-stone-200">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Choisir un outil
          </h2>
          <ToolSelector selected={tool} onSelect={setTool} />

          {provider && (
            <Card className="p-4 text-center">
              <p className="text-xs text-stone-500">Traité par</p>
              <p className="text-sm text-amber-400 font-medium">{provider}</p>
            </Card>
          )}
        </div>

        <div className="lg:col-span-8 space-y-6">
          {!previewUrl ? (
            <UploadZone onFileSelected={handleFile} />
          ) : (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-stone-400 flex items-center gap-2">
                      Original
                    </span>
                    <Button variant="destructive" size="sm" onClick={handleReset}>
                      Supprimer
                    </Button>
                  </div>
                  <div className="relative rounded-xl overflow-hidden border border-stone-800 bg-stone-900 aspect-square shadow-inner">
                    <img src={previewUrl} alt="Original" className="w-full h-full object-contain" />
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-sm font-semibold text-stone-400 flex items-center gap-2">
                    Résultat IA
                  </span>
                  <div className="relative rounded-xl overflow-hidden border border-stone-800 bg-stone-900 aspect-square flex items-center justify-center">
                    {processing && <ProcessingStatus status={statusText} />}
                    {resultUrl ? (
                      <img src={resultUrl} alt="Résultat" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-center p-6">
                        <p className="text-stone-600 text-sm">En attente du traitement</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {resultUrl && previewUrl && (
                <Card className="p-4">
                  <h3 className="text-sm font-medium text-stone-200 mb-3">Comparaison avant / après</h3>
                  <BeforeAfter beforeUrl={previewUrl} afterUrl={resultUrl} />
                </Card>
              )}

              <Button onClick={handleProcess} disabled={processing || !file} className="w-full py-4 text-base">
                {processing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Traitement en cours...</>
                ) : (
                  <><Sparkles className="w-5 h-5" /> Lancer l&apos;amélioration IA</>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
