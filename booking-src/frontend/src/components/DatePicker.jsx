import { useState, useRef, useEffect } from 'react'

const WEEKDAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

export default function DatePicker({ value, onChange, primaryColor }) {
  const [viewDate, setViewDate] = useState(new Date())
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days = []
  // Empty slots for alignment
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d)
  }

  function selectDate(day) {
    if (!day) return
    const d = new Date(year, month, day)
    if (d < today) return
    const iso = d.toISOString().split('T')[0]
    onChange(iso)
  }

  function isToday(day) {
    if (!day) return false
    const d = new Date(year, month, day)
    return d.getTime() === today.getTime()
  }

  function isSelected(day) {
    if (!day || !value) return false
    const d = new Date(year, month, day)
    return d.toISOString().split('T')[0] === value
  }

  function isPast(day) {
    if (!day) return false
    const d = new Date(year, month, day)
    return d < today
  }

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month - 1))}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-600"
        >
          ←
        </button>
        <span className="font-semibold text-gray-800">
          {MONTHS[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month + 1))}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-600"
        >
          →
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => (
          <button
            key={i}
            type="button"
            disabled={!day || isPast(day)}
            onClick={() => selectDate(day)}
            className={`aspect-square rounded-xl text-sm font-medium transition-all
              ${!day ? 'invisible' : ''}
              ${isPast(day) ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
              ${isSelected(day) ? 'text-white shadow-md' : ''}
              ${isToday(day) && !isSelected(day) ? 'ring-2 ring-blue-400 ring-offset-1' : ''}
              ${!isSelected(day) && !isPast(day) && day ? 'hover:bg-gray-100 text-gray-700' : ''}
            `}
            style={
              isSelected(day)
                ? { background: primaryColor }
                : {}
            }
          >
            {day}
          </button>
        ))}
      </div>

      {value && (
        <p className="text-sm text-gray-500 mt-3 text-center">
          📅 {new Date(value + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      )}
    </div>
  )
}
