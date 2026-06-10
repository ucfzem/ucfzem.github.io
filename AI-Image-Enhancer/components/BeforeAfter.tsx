"use client"

import { useState, useRef, useCallback } from "react"
import { MoveHorizontal } from "lucide-react"

interface BeforeAfterProps {
  beforeUrl: string
  afterUrl: string
}

export function BeforeAfter({ beforeUrl, afterUrl }: BeforeAfterProps) {
  const [pos, setPos] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMove = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((clientX - rect.left) / rect.width) * 100
    setPos(Math.max(5, Math.min(95, x)))
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square rounded-xl overflow-hidden select-none cursor-ew-resize"
      onMouseMove={(e) => e.buttons === 1 && handleMove(e.clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
    >
      <img src={beforeUrl} alt="Original" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img src={afterUrl} alt="Amélioré" className="absolute inset-0 w-full h-full object-cover" />
      </div>
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-amber-400 shadow-lg shadow-amber-500/50 z-10"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-amber-500/30 backdrop-blur-sm border-2 border-amber-400 flex items-center justify-center">
          <MoveHorizontal className="w-5 h-5 text-amber-200" />
        </div>
      </div>
    </div>
  )
}
