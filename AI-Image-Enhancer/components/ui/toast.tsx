"use client"

import { Toaster as SonnerToaster } from "sonner"

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      toastOptions={{
        style: {
          background: "#1a1410",
          border: "1px solid #2a2012",
          color: "#f0ebdf",
        },
      }}
    />
  )
}
