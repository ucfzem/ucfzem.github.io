import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
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

  // Load establishment + pools
  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: est, error: e1 } = await supabase
        .from('establishments')
        .select('*')
        .eq('slug', slug)
        .single()

      if (e1 || !est) {
        setError('Établissement introuvable')
        setLoading(false)
        return
      }

      setEstablishment(est)

      const { data: pl } = await supabase
        .from('pools')
        .select('*')
        .eq('establishment_id', est.id)
        .eq('is_active', true)

      setPools(pl || [])
      setLoading(false)
    }
    load()
  }, [slug])

  // Load slots when pool selected
  useEffect(() => {
    if (!selectedPool) return
    async function loadSlots() {
      const { data } = await supabase
        .from('slot_configs')
        .select('*')
        .eq('pool_id', selectedPool.id)
        .eq('is_active', true)
        .order('start_time')
      setSlots(data || [])
    }
    loadSlots()
  }, [selectedPool])

  // Check availability when date + pool selected
  useEffect(() => {
    if (!selectedPool || !selectedDate) return
    async function checkAvailability() {
      const { data: booked } = await supabase
        .from('bookings')
        .select('slot_name')
        .eq('pool_id', selectedPool.id)
        .eq('booking_date', selectedDate)
        .eq('booking_status', 'confirmed')
        .neq('payment_status', 'refunded')

      const { data: blocked } = await supabase
        .from('blockades')
        .select('slot_name')
        .eq('pool_id', selectedPool.id)
        .eq('block_date', selectedDate)

      const takenSlots = new Set([
        ...(booked || []).map(b => b.slot_name),
        ...(blocked || []).map(b => b.slot_name)
      ])

      setSlots(prev => prev.map(s => ({
        ...s,
        available: !takenSlots.has(s.name)
      })))
      setSelectedSlot(null)
    }
    checkAvailability()
  }, [selectedPool, selectedDate])

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
                  <div className="flex gap-2 mt-3">
                    <Tag>🌊 {pool.max_capacity} pers. max</Tag>
                  </div>
                </button>
              ))}
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
