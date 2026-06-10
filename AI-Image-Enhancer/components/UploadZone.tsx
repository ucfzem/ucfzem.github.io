"use client"

import { useState, useRef, useCallback } from "react"
import { UploadCloud, Image as ImageIcon } from "lucide-react"
import { cn, formatBytes } from "@/lib/utils"

interface UploadZoneProps {
  onFileSelected: (file: File) => void
}

export function UploadZone({ onFileSelected }: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return
    if (file.size > 10 * 1024 * 1024) return
    onFileSelected(file)
  }, [onFileSelected])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 group",
        dragOver
          ? "border-amber-500 bg-amber-500/5"
          : "border-stone-700 hover:border-amber-500/50 hover:bg-stone-900/50"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
      <div className={cn(
        "w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300",
        dragOver ? "bg-amber-500/20 scale-110" : "bg-stone-800 group-hover:scale-110 group-hover:bg-amber-500/10"
      )}>
        {dragOver ? (
          <ImageIcon className="w-10 h-10 text-amber-400" />
        ) : (
          <UploadCloud className="w-10 h-10 text-amber-400" />
        )}
      </div>
      <p className="text-xl font-medium text-stone-200">
        {dragOver ? "Déposez votre image" : "Glissez-déposez votre image ici"}
      </p>
      <p className="text-sm text-stone-500 mt-2">
        ou cliquez pour parcourir (PNG, JPG, WebP • Max 10MB)
      </p>
    </div>
  )
}
