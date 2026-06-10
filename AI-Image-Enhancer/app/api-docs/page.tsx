import { Card } from "@/components/ui/card"
import { Code2, ExternalLink } from "lucide-react"

export default function ApiDocsPage() {
  return (
    <>
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 via-amber-600 to-orange-700 bg-clip-text text-transparent">
          API Documentation
        </h1>
        <p className="text-stone-400 max-w-2xl mx-auto">
          Intégrez notre outil de traitement d&apos;images dans vos propres applications.
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-stone-200 flex items-center gap-2">
          <Code2 className="w-5 h-5 text-amber-400" /> Endpoint
        </h2>
        <div className="p-4 rounded-lg bg-stone-800 font-mono text-sm">
          POST /api/process
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-stone-200">Paramètres</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-700">
                <th className="text-left py-2 pr-4 text-stone-400">Paramètre</th>
                <th className="text-left py-2 pr-4 text-stone-400">Type</th>
                <th className="text-left py-2 text-stone-400">Description</th>
              </tr>
            </thead>
            <tbody className="text-stone-300">
              <tr className="border-b border-stone-800">
                <td className="py-3 pr-4 font-medium">image</td>
                <td className="py-3 pr-4 text-amber-400">File</td>
                <td className="py-3">Fichier image (PNG, JPG, WebP, max 10MB)</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">tool</td>
                <td className="py-3 pr-4 text-amber-400">string</td>
                <td className="py-3">
                  Outil : <code className="text-amber-400">restore</code>, <code className="text-amber-400">colorize</code>, <code className="text-amber-400">upscale</code>, <code className="text-amber-400">denoise</code>, ou <code className="text-amber-400">enhance</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-stone-200">Exemple (fetch)</h2>
        <pre className="p-4 rounded-lg bg-stone-800 text-sm text-stone-300 overflow-x-auto">
{`const formData = new FormData()
formData.append('image', file)
formData.append('tool', 'restore')

const resp = await fetch('https://votre-site.com/api/process', {
  method: 'POST',
  body: formData
})

const data = await resp.json()
// { imageUrl: "...", provider: "Replicate" }`}
        </pre>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-stone-200">Réponse</h2>
        <pre className="p-4 rounded-lg bg-stone-800 text-sm text-stone-300">
{`{
  "imageUrl": "https://...",
  "provider": "Replicate",
  "remaining": 5
}`}
        </pre>
      </Card>
    </>
  )
}
