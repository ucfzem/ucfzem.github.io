import { Card } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, ExternalLink } from "lucide-react"

const quotas = [
  { name: "Replicate", limit: "~50 appels gratuits initiaux", status: "actif" },
  { name: "Hugging Face", limit: "Quota quotidien limité (gratuit)", status: "actif" },
  { name: "DeepAI", limit: "~20 appels gratuits au départ", status: "actif" },
  { name: "Cloudinary", limit: "Free tier généreux (transformations)", status: "actif" },
  { name: "Fallback local", limit: "Illimité (aucun traitement réel)", status: "actif" },
]

export default function DocumentationPage() {
  return (
    <>
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 via-amber-600 to-orange-700 bg-clip-text text-transparent">
          Documentation
        </h1>
        <p className="text-stone-400 max-w-2xl mx-auto">
          Comment fonctionne l&apos;outil, ses limites et ses technologies.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-stone-200">Comment ça marche</h2>
          <ol className="space-y-3 text-sm text-stone-400">
            <li className="flex gap-3"><span className="text-amber-400 font-bold">1.</span> Uploadez une image (PNG, JPG, WebP)</li>
            <li className="flex gap-3"><span className="text-amber-400 font-bold">2.</span> Choisissez un outil (restauration, coloriage, upscaling, etc.)</li>
            <li className="flex gap-3"><span className="text-amber-400 font-bold">3.</span> L&apos;image est envoyée à notre proxy backend qui masque les clés API</li>
            <li className="flex gap-3"><span className="text-amber-400 font-bold">4.</span> Le proxy tente les APIs dans l&apos;ordre (Replicate → HuggingFace → DeepAI → Cloudinary)</li>
            <li className="flex gap-3"><span className="text-amber-400 font-bold">5.</span> Si une API échoue, la suivante est essayée automatiquement</li>
            <li className="flex gap-3"><span className="text-amber-400 font-bold">6.</span> Le résultat s&apos;affiche avec un comparateur avant/après</li>
          </ol>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-stone-200">APIs et Quotas</h2>
          <div className="space-y-2">
            {quotas.map((q) => (
              <div key={q.name} className="flex items-center justify-between p-3 rounded-lg bg-stone-800/50">
                <div>
                  <p className="text-sm font-medium text-stone-200">{q.name}</p>
                  <p className="text-xs text-stone-500">{q.limit}</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold text-stone-200">Limitations</h2>
            <ul className="mt-2 space-y-2 text-sm text-stone-400">
              <li>• <strong>10 traitements par jour</strong> par IP (pour éviter les abus)</li>
              <li>• APIs gratuites = files d&apos;attente et latence variables</li>
              <li>• Résultats non garantis : les modèles IA peuvent échouer sur certains types d&apos;images</li>
              <li>• Taille max : 10MB par image</li>
              <li>• Formats supportés : PNG, JPG, WebP</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-stone-200">Technologies</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {["Next.js 15", "Tailwind CSS", "shadcn/ui", "Lucide Icons", "Replicate", "HuggingFace", "DeepAI", "Cloudinary"].map((tech) => (
            <div key={tech} className="p-3 rounded-lg bg-stone-800/50 text-center">
              <p className="text-sm text-stone-200">{tech}</p>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}
