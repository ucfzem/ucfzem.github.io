"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-800 bg-stone-950/85 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            AI Image Enhancer
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/" className="px-3 py-2 text-stone-400 hover:text-stone-100 transition-colors">
            Accueil
          </Link>
          <Link href="/galerie" className="px-3 py-2 text-stone-400 hover:text-stone-100 transition-colors">
            Galerie
          </Link>
          <Link href="/documentation" className="px-3 py-2 text-stone-400 hover:text-stone-100 transition-colors">
            Docs
          </Link>
          <Link href="/api-docs" className="px-3 py-2 text-stone-400 hover:text-stone-100 transition-colors">
            API
          </Link>
        </nav>
      </div>
    </header>
  )
}
