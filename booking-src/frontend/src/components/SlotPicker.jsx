export default function SlotPicker({ slots, selected, onSelect, primaryColor }) {
  if (!slots || slots.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        Aucun créneau configuré pour cette piscine.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {slots.map((slot) => {
        const isSelected = selected?.id === slot.id
        const isAvailable = slot.available !== false
        const start = slot.start_time?.slice(0, 5)
        const end = slot.end_time?.slice(0, 5)

        return (
          <button
            key={slot.id}
            type="button"
            disabled={!isAvailable}
            onClick={() => onSelect(slot)}
            className={`relative p-4 rounded-2xl border-2 text-center transition-all ${
              !isAvailable
                ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                : isSelected
                  ? 'shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 cursor-pointer'
            }`}
            style={
              isSelected
                ? { borderColor: primaryColor, backgroundColor: primaryColor + '0d' }
                : {}
            }
          >
            {/* Availability badge */}
            {!isAvailable && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Complet
              </span>
            )}

            <div className="text-2xl mb-1">
              {slot.name?.toLowerCase().includes('matin') ? '🌅' :
               slot.name?.toLowerCase().includes('après-midi') || slot.name?.toLowerCase().includes('apres-midi') ? '☀️' :
               slot.name?.toLowerCase().includes('soir') ? '🌙' : '🕐'}
            </div>

            <h3 className={`font-semibold text-sm ${isSelected ? '' : 'text-gray-800'}`}
                style={isSelected ? { color: primaryColor } : {}}>
              {slot.name}
            </h3>

            {start && end && (
              <p className="text-xs text-gray-500 mt-1">
                {start} — {end}
              </p>
            )}
          </button>
        )
      })}
    </div>
  )
}
