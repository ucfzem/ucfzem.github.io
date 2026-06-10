import type { Metadata } from "next"
import { Nav } from "@/components/Nav"
import { Toaster } from "@/components/ui/toast"
import "./globals.css"

export const metadata: Metadata = {
  title: "AI Image Enhancer — Traitement d'images par IA",
  description: "Restaurez, colorez, upscalez et améliorez vos images gratuitement grâce à l'intelligence artificielle.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className="min-h-screen font-sans antialiased">
        <Nav />
        <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  )
}
