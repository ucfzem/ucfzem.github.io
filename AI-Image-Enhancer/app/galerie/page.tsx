import { Sparkles } from "lucide-react"

const examples = [
  {
    title: "Restauration",
    desc: "Photo ancienne restaurée avec GFPGAN",
    before: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=60",
    after: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=90",
  },
  {
    title: "Coloriage",
    desc: "Noir & blanc colorisé automatiquement",
    before: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=60",
    after: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=90",
  },
  {
    title: "Upscaling",
    desc: "Agrandissement 4x sans perte",
    before: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&q=30",
    after: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=90",
  },
  {
    title: "Défloutage",
    desc: "Netteté restaurée sur photo floue",
    before: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&q=30",
    after: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=90",
  },
]

export default function GaleriePage() {
  return (
    <>
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 via-amber-600 to-orange-700 bg-clip-text text-transparent">
          Galerie d&apos;exemples
        </h1>
        <p className="text-stone-400 max-w-2xl mx-auto">
          Résultats avant / après obtenus avec notre outil.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {examples.map((ex, i) => (
          <div key={i} className="rounded-2xl border border-stone-800 bg-stone-900 overflow-hidden">
            <div className="grid grid-cols-2">
              <div className="p-2">
                <p className="text-xs text-stone-500 text-center mb-1">Avant</p>
                <img src={ex.before} alt="Avant" className="w-full aspect-square object-cover rounded-lg" />
              </div>
              <div className="p-2">
                <p className="text-xs text-amber-500 text-center mb-1">Après</p>
                <img src={ex.after} alt="Après" className="w-full aspect-square object-cover rounded-lg" />
              </div>
            </div>
            <div className="p-4 border-t border-stone-800">
              <h3 className="font-semibold text-stone-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> {ex.title}
              </h3>
              <p className="text-sm text-stone-500 mt-1">{ex.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
