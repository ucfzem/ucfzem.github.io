import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getEstablishment, getEstablishmentPools, getPoolAvailability } from '../lib/api'
import { isDemoMode, DEMO_ESTABLISHMENT, DEMO_POOLS, DEMO_SLOTS } from '../lib/demo'
import BookingForm from '../components/BookingForm'
import SlotPicker from '../components/SlotPicker'
import DatePicker from '../components/DatePicker'

export default function BookingPage() {
  const { slug } = useParams()
  const [establishment, setEstablishment] = useState(null)
  const [pools, setPools] = useState([])
  const [selectedPool, setSelectedPool] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const demo = isDemoMode()

  // Load establishment + pools
  useEffect(() => {
    setLoading(true)

    if (demo) {
      setEstablishment(DEMO_ESTABLISHMENT)
      setPools(DEMO_POOLS)
      setLoading(false)
      return
    }

    async function load() {
      try {
        const est = await getEstablishment(slug)
        setEstablishment(est)
        const pl = await getEstablishmentPools(slug)
        setPools(pl || [])
      } catch (e) {
        setError('Établissement introuvable. Vérifiez l\'URL ou démarrez le backend.')
      }
      setLoading(false)
    }
    load()
  }, [slug, demo])

  // Load availability when pool + date selected
  useEffect(() => {
    if (!selectedPool || !selectedDate) return

    if (demo) {
      setSlots(DEMO_SLOTS.filter(s => s.pool_id === selectedPool.id).map(s => ({
        ...s,
        available: !(selectedDate === new Date().toISOString().split('T')[0] && s.name.includes('Matin'))
      })))
      setSelectedSlot(null)
      return
    }

    async function checkAvailability() {
      try {
        const data = await getPoolAvailability(selectedPool.id, selectedDate)
        setSlots(data || [])
      } catch (e) {
        console.error(e)
      }
      setSelectedSlot(null)
    }
    checkAvailability()
  }, [selectedPool, selectedDate, demo])

  const primaryColor = establishment?.primary_color || '#3b82f6'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm max-w-sm">
          <span className="text-4xl block mb-4">😕</span>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{error}</h2>
          <p className="text-gray-500 text-sm">Vérifiez le lien et réessayez.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12" style={{ '--pc': primaryColor }}>
      {/* Demo banner */}
      {demo && (
        <div className="bg-yellow-100 border-b border-yellow-200 text-center py-2 px-4">
          <p className="text-xs text-yellow-800 font-medium">
            🧪 Mode démo — Lancez le backend pour des données réelles
          </p>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          {establishment?.logo_url && (
            <img src={establishment.logo_url} alt="" className="h-10 w-10 rounded-full object-cover" />
          )}
          <div>
            <h1 className="font-bold text-gray-800">{establishment?.name}</h1>
            <p className="text-xs text-gray-500">Réservez en quelques clics</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto mt-4 px-4 space-y-4">
        {/* Step 1: Pool Selection */}
        {pools.length > 0 && (
          <Step number={1} title="Choisissez l'espace">
            <div className="grid gap-3">
              {pools.map(pool => (
                <button
                  key={pool.id}
                  onClick={() => { setSelectedPool(pool); setSelectedSlot(null); setSelectedDate(''); }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    selectedPool?.id === pool.id
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{pool.name}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{pool.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <span className="text-lg font-bold" style={{ color: primaryColor }}>
                        {pool.price_per_slot} <span className="text-xs font-normal text-gray-500">MAD</span>
                      </span>
                      <p className="text-xs text-gray-400">/ créneau</p>
                    </div>
                  </div>

                  {/* Deliverables checklist */}
                  <div className="mt-3 bg-gray-50 rounded-xl p-3">
                    <p className="text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Ce qui est inclus :</p>
                    <ul className="space-y-1">
                      <li className="text-xs text-gray-600 flex items-center gap-1.5">
                        <span className="text-green-500">✓</span> Accès privé à la piscine pendant {pool.max_capacity}h
                      </li>
                      <li className="text-xs text-gray-600 flex items-center gap-1.5">
                        <span className="text-green-500">✓</span> Vestiaires & douches inclus
                      </li>
                      <li className="text-xs text-gray-600 flex items-center gap-1.5">
                        <span className="text-green-500">✓</span> Transfert WhatsApp de confirmation
                      </li>
                      <li className="text-xs text-gray-600 flex items-center gap-1.5">
                        <span className="text-green-500">✓</span> Annulation gratuite 24h avant
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Tag>🌊 {pool.max_capacity} pers. max</Tag>
                    <Tag>📍 {pool.currency || 'MAD'}</Tag>
                  </div>
                </button>
              ))}
            </div>

            {/* Policy transparency */}
            <div className="mt-3 bg-green-50/50 border border-green-100 rounded-xl p-3">
              <p className="text-xs text-green-700 font-medium flex items-center gap-1.5">
                <span>✨</span>
                Zéro risque : reportez ou annulez en 1 clic jusqu'à 24h avant votre réservation.
              </p>
            </div>
          </Step>
        )}

        {/* Step 2: Date */}
        {selectedPool && (
          <Step number={2} title="Choisissez la date">
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              primaryColor={primaryColor}
            />
          </Step>
        )}

        {/* Step 3: Slots */}
        {selectedPool && selectedDate && (
          <Step number={3} title="Choisissez le créneau">
            <SlotPicker
              slots={slots}
              selected={selectedSlot}
              onSelect={setSelectedSlot}
              primaryColor={primaryColor}
            />
          </Step>
        )}

        {/* Step 4: Client Form */}
        {selectedPool && selectedDate && selectedSlot && (
          <Step number={4} title="Vos informations">
            <BookingForm
              pool={selectedPool}
              slot={selectedSlot}
              date={selectedDate}
              primaryColor={primaryColor}
              whatsappPhone={establishment?.whatsapp_phone}
              demo={demo}
              onSuccess={() => {
                setSelectedSlot(null)
                setSelectedDate('')
              }}
            />
          </Step>
        )}

        {/* Footer */}
        <div className="text-center py-6 text-xs text-gray-400">
          <p>Powered by BookingSaaS</p>
        </div>
      </div>
    </div>
  )
}

function Step({ number, title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="h-6 w-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
          {number}
        </span>
        <h2 className="font-semibold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Tag({ children }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
      {children}
    </span>
  )
}
