import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { isDemoMode, DEMO_ESTABLISHMENT, DEMO_POOLS, DEMO_BOOKINGS } from '../lib/demo'

export default function Dashboard() {
  const [view, setView] = useState('overview')
  const [establishments, setEstablishments] = useState([])
  const [selectedEst, setSelectedEst] = useState(null)
  const [pools, setPools] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncUrl, setSyncUrl] = useState('')
  const [syncPoolId, setSyncPoolId] = useState('')
  const [syncing, setSyncing] = useState(false)
  const demo = isDemoMode()

  // Load data
  useEffect(() => {
    setLoading(true)

    if (demo) {
      setEstablishments([DEMO_ESTABLISHMENT])
      setSelectedEst(DEMO_ESTABLISHMENT)
      setPools(DEMO_POOLS)
      setBookings(DEMO_BOOKINGS)
      setLoading(false)
      return
    }

    async function load() {
      const { data: est } = await supabase.from('establishments').select('*').order('created_at', { ascending: false })
      setEstablishments(est || [])

      if (est && est.length > 0) {
        setSelectedEst(est[0])
        const { data: pl } = await supabase.from('pools').select('*').eq('establishment_id', est[0].id)
        setPools(pl || [])

        if (pl && pl.length > 0) {
          const { data: bk } = await supabase
            .from('bookings')
            .select('*')
            .eq('pool_id', pl[0].id)
            .order('booking_date', { ascending: false })
            .limit(50)
          setBookings(bk || [])
        }
      }
      setLoading(false)
    }
    load()
  }, [demo])

  async function handleSync() {
    if (!syncPoolId || !syncUrl) return
    setSyncing(true)
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
      const res = await fetch(`${backendUrl}/api/sync-external`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId: syncPoolId, icalUrl: syncUrl })
      })
      const data = await res.json()
      alert(data.message || 'Sync terminée')
      setSyncUrl('')
    } catch (err) {
      alert('Erreur de synchronisation')
    }
    setSyncing(false)
  }

  async function cancelBooking(id) {
    if (demo) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, booking_status: 'cancelled' } : b))
      return
    }
    if (!confirm('Annuler cette réservation ?')) return
    const { error } = await supabase
      .from('bookings')
      .update({ booking_status: 'cancelled' })
      .eq('id', id)
    if (!error) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, booking_status: 'cancelled' } : b))
    }
  }

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.booking_status === 'confirmed').length,
    pending: bookings.filter(b => b.payment_status === 'pending').length,
    revenue: bookings.filter(b => b.payment_status === 'paid').reduce((sum, b) => sum + Number(b.total_price), 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">📊</span>
            <h1 className="font-bold text-gray-800">Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <NavBtn active={view === 'overview'} onClick={() => setView('overview')}>Vue d'ensemble</NavBtn>
            <NavBtn active={view === 'bookings'} onClick={() => setView('bookings')}>Réservations</NavBtn>
            <NavBtn active={view === 'sync'} onClick={() => setView('sync')}>iCal Sync</NavBtn>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Demo banner */}
        {demo && (
          <div className="bg-yellow-100 border border-yellow-200 rounded-2xl p-4 mb-6 text-center">
            <p className="text-sm text-yellow-800 font-medium">
              🧪 Mode démo avec données fictives — <a href="https://supabase.com" target="_blank" rel="noopener" className="underline">Créez un projet Supabase</a> pour des données réelles
            </p>
          </div>
        )}
        {/* Establishment selector */}
        {establishments.length > 0 && (
          <div className="mb-6">
            <select
              className="p-3 rounded-xl border border-gray-200 bg-white text-sm font-medium"
              value={selectedEst?.id || ''}
              onChange={e => {
                const est = establishments.find(x => x.id === e.target.value)
                setSelectedEst(est)
              }}
            >
              {establishments.map(est => (
                <option key={est.id} value={est.id}>{est.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* OVERVIEW */}
        {view === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon="📋" label="Total" value={stats.total} />
              <StatCard icon="✅" label="Confirmées" value={stats.confirmed} color="text-green-600" />
              <StatCard icon="⏳" label="En attente" value={stats.pending} color="text-yellow-600" />
              <StatCard icon="💰" label="Revenus" value={`${stats.revenue} MAD`} color="text-blue-600" />
            </div>

            {/* Quick link */}
            {selectedEst && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-2">🔗 Votre lien de réservation</h3>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-100 px-3 py-2 rounded-xl text-sm text-gray-700 overflow-x-auto">
                    {window.location.origin}/booking/{selectedEst.slug}
                  </code>
                  <a
                    href={`/booking/${selectedEst.slug}`}
                    target="_blank"
                    className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-xl hover:bg-blue-600 whitespace-nowrap"
                  >
                    Ouvrir →
                  </a>
                </div>
              </div>
            )}

            {/* Pools list */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">🏊 Vos espaces</h3>
              </div>
              {pools.length === 0 ? (
                <p className="p-5 text-sm text-gray-500">Aucun espace configuré.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {pools.map(pool => (
                    <div key={pool.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div>
                        <h4 className="font-medium text-gray-800">{pool.name}</h4>
                        <p className="text-sm text-gray-500">{pool.price_per_slot} MAD / créneau • {pool.max_capacity} pers. max</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${pool.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {pool.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* BOOKINGS */}
        {view === 'bookings' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">📋 Réservations récentes</h3>
              <select
                className="text-sm border border-gray-200 rounded-xl px-3 py-1.5"
                onChange={async (e) => {
                  if (!pools[0]) return
                  let query = supabase.from('bookings').select('*').eq('pool_id', pools[0].id).order('booking_date', { ascending: false })
                  if (e.target.value !== 'all') query = query.eq('booking_status', e.target.value)
                  const { data } = await query.limit(50)
                  setBookings(data || [])
                }}
              >
                <option value="all">Toutes</option>
                <option value="confirmed">Confirmées</option>
                <option value="cancelled">Annulées</option>
              </select>
            </div>

            {bookings.length === 0 ? (
              <p className="p-5 text-sm text-gray-500 text-center">Aucune réservation.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium text-gray-500">Client</th>
                      <th className="px-4 py-3 font-medium text-gray-500">Date</th>
                      <th className="px-4 py-3 font-medium text-gray-500">Créneau</th>
                      <th className="px-4 py-3 font-medium text-gray-500">Montant</th>
                      <th className="px-4 py-3 font-medium text-gray-500">Statut</th>
                      <th className="px-4 py-3 font-medium text-gray-500"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">{b.customer_name}</div>
                          <div className="text-xs text-gray-400">{b.customer_phone}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{b.booking_date}</td>
                        <td className="px-4 py-3 text-gray-600">{b.slot_name}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{b.total_price} MAD</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={b.booking_status} payment={b.payment_status} />
                        </td>
                        <td className="px-4 py-3">
                          {b.booking_status === 'confirmed' && (
                            <button
                              onClick={() => cancelBooking(b.id)}
                              className="text-xs text-red-500 hover:text-red-700 font-medium"
                            >
                              Annuler
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ICAL SYNC */}
        {view === 'sync' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">🔄 Synchroniser un calendrier externe</h3>
              <p className="text-sm text-gray-500 mb-4">
                Importez les disponibilités depuis Airbnb, Booking.com ou tout autre service iCal.
              </p>

              <div className="space-y-3">
                <select
                  className="w-full p-3 rounded-xl border border-gray-200 text-sm"
                  value={syncPoolId}
                  onChange={e => setSyncPoolId(e.target.value)}
                >
                  <option value="">-- Sélectionner un espace --</option>
                  {pools.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>

                <input
                  type="url"
                  placeholder="URL iCal (https://www.airbnb.com/calendar/...)"
                  className="w-full p-3 rounded-xl border border-gray-200 text-sm"
                  value={syncUrl}
                  onChange={e => setSyncUrl(e.target.value)}
                />

                <button
                  onClick={handleSync}
                  disabled={syncing || !syncPoolId || !syncUrl}
                  className="px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 disabled:opacity-50 text-sm"
                >
                  {syncing ? 'Synchronisation...' : '🔄 Synchroniser'}
                </button>
              </div>
            </div>

            {/* Export links */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">📤 Exporter vos réservations (iCal)</h3>
              <p className="text-sm text-gray-500 mb-4">
                Générez un lien iCal pour synchroniser vos réservations vers Airbnb ou Booking.com.
              </p>
              {pools.map(pool => (
                <div key={pool.id} className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-700 flex-1">{pool.name}</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-600 overflow-x-auto max-w-xs">
                    {window.location.origin}/api/export-ical/{pool.id}
                  </code>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function NavBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm font-medium rounded-xl transition-colors ${
        active ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  )
}

function StatCard({ icon, label, value, color = 'text-gray-800' }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <span className="text-2xl block mb-2">{icon}</span>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}

function StatusBadge({ status, payment }) {
  const colors = {
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-blue-100 text-blue-700',
    refunded: 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="flex gap-1 flex-wrap">
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[status] || 'bg-gray-100'}`}>
        {status}
      </span>
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[payment] || 'bg-gray-100'}`}>
        {payment}
      </span>
    </div>
  )
}
