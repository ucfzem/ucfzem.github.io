export function ProcessingStatus({ status }: { status: string }) {
  return (
    <div className="absolute inset-0 bg-stone-900/90 flex flex-col items-center justify-center z-10 rounded-xl">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 border-4 border-stone-700 rounded-full" />
        <div className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin" />
      </div>
      <p className="text-amber-400 font-medium animate-pulse">{status}</p>
    </div>
  )
}
