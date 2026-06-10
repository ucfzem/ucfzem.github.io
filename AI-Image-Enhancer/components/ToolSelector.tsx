"use client"

import type { ToolType } from "@/lib/api-client"
import { ScanLine, Palette, Maximize, Focus, Sparkles } from "lucide-react"

interface ToolSelectorProps {
  selected: ToolType
  onSelect: (tool: ToolType) => void
}

const tools: { id: ToolType; name: string; desc: string; icon: typeof ScanLine }[] = [
  { id: "restore", name: "Restauration", desc: "Rayures, déchirures, vieilles photos", icon: ScanLine },
  { id: "colorize", name: "Coloriage", desc: "Noir & blanc → couleurs réalistes", icon: Palette },
  { id: "upscale", name: "Upscaling (4x)", desc: "Agrandissement sans perte", icon: Maximize },
  { id: "denoise", name: "Défloutage", desc: "Correction flou et bruit", icon: Focus },
  { id: "enhance", name: "Amélioration", desc: "Exposition, netteté, visages", icon: Sparkles },
]

export function ToolSelector({ selected, onSelect }: ToolSelectorProps) {
  return (
    <div className="space-y-3">
      {tools.map((tool) => {
        const active = selected === tool.id
        const Icon = tool.icon
        return (
          <button
            key={tool.id}
            onClick={() => onSelect(tool.id)}
            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-4 group ${
              active
                ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                : "border-stone-800 bg-stone-900 hover:border-stone-600 hover:bg-stone-800"
            }`}
          >
            <div className={`p-2 rounded-lg ${
              active ? "bg-amber-500/20 text-amber-400" : "bg-stone-800 text-stone-400 group-hover:text-stone-200"
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium text-stone-100">{tool.name}</div>
              <div className="text-sm text-stone-500 mt-0.5">{tool.desc}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
