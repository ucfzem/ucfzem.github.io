import { useState } from 'react'
import { createBooking } from '../lib/api'

export default function BookingForm({ pool, slot, date, primaryColor, whatsappPhone, demo, onSuccess }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', guests: 1 })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  const totalPrice = pool.price_per_slot
  const deposit = Math.round(totalPrice * 0.5)

  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)

    // Demo mode: simulate success
    if (demo) {
      await new Promise(r => setTimeout(r, 1200))
      setResult({
        type: 'success',
        msg: `[DEMO] Réservation enregistrée ! Acompte : ${deposit} MAD`,
        bookingId: 'demo-' + Date.now()
      })
      setForm({ name: '', phone: '', email: '', guests: 1 })
      setSubmitting(false)
      if (onSuccess) setTimeout(onSuccess, 3000)
      return
    }

    try {
      const data = await createBooking({
        pool_id: pool.id,
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        booking_date: date,
        slot_name: slot.name,
        start_time: slot.start_time,
        end_time: slot.end_time,
        guests_count: form.guests,
        total_price: totalPrice
      })

      setResult({
        type: 'success',
        msg: `Réservation confirmée ! Acompte à payer : ${deposit} MAD`,
        bookingId: data.id
      })

      setForm({ name: '', phone: '', email: '', guests: 1 })
      if (onSuccess) setTimeout(onSuccess, 3000)
    } catch (err) {
      if (err.message?.includes('duplicate') || err.message?.includes('disponible')) {
        setResult({ type: 'error', msg: 'Ce créneau vient d\'être réservé. Choisissez un autre.' })
      } else {
        setResult({ type: 'error', msg: 'Erreur lors de la réservation. Réessayez.' })
      }
    }
    setSubmitting(false)
  }

  if (result?.type === 'success') {
    return (
      <div className="text-center py-6">
        <span className="text-5xl block mb-3">✅</span>
        <h3 className="font-bold text-lg text-gray-800 mb-2">Réservation enregistrée !</h3>
        <p className="text-sm text-gray-600 mb-4">{result.msg}</p>

        <div className="bg-gray-50 rounded-xl p-4 text-left text-sm space-y-1 mb-4">
          <Row label="Client" value={form.name || '—'} />
          <Row label="Date" value={formattedDate} />
          <Row label="Créneau" value={slot.name} />
          <Row label="Total" value={`${totalPrice} MAD`} />
          <Row label="Acompte" value={`${deposit} MAD`} bold />
        </div>

        {/* WhatsApp quick link */}
        {whatsappPhone && (
          <a
            href={`https://wa.me/${whatsappPhone.replace(/^0/, '212')}?text=${encodeURIComponent(`Bonjour, je confirme ma réservation du ${formattedDate} (${slot.name}) pour ${pool.name}.`)}`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-2xl hover:bg-green-600 transition-colors"
          >
            💬 Confirmer via WhatsApp
          </a>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Price summary */}
      <div className="bg-blue-50 rounded-xl p-4 mb-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Prix du créneau</span>
          <span className="font-bold text-gray-800">{totalPrice} MAD</span>
        </div>
        <div className="flex justify-between items-center text-sm mt-1">
          <span className="text-gray-600">Acompte à payer maintenant (50%)</span>
          <span className="font-bold" style={{ color: primaryColor }}>{deposit} MAD</span>
        </div>
        <div className="flex justify-between items-center text-sm mt-1 text-gray-400">
          <span>Solde sur place</span>
          <span>{totalPrice - deposit} MAD</span>
        </div>
      </div>

      <input
        type="text"
        placeholder="Nom complet"
        required
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
        className="w-full p-3.5 rounded-xl border border-gray-200 bg-white text-sm"
      />

      <input
        type="tel"
        placeholder="Numéro WhatsApp (ex: 0612345678)"
        required
        value={form.phone}
        onChange={e => setForm({ ...form, phone: e.target.value })}
        className="w-full p-3.5 rounded-xl border border-gray-200 bg-white text-sm"
      />

      <input
        type="email"
        placeholder="Adresse email"
        required
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
        className="w-full p-3.5 rounded-xl border border-gray-200 bg-white text-sm"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de personnes</label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setForm({ ...form, guests: Math.max(1, form.guests - 1) })}
            className="h-10 w-10 rounded-xl border border-gray-200 bg-white text-lg font-bold text-gray-600 hover:bg-gray-50"
          >
            −
          </button>
          <span className="font-bold text-lg w-8 text-center">{form.guests}</span>
          <button
            type="button"
            onClick={() => setForm({ ...form, guests: Math.min(pool.max_capacity, form.guests + 1) })}
            className="h-10 w-10 rounded-xl border border-gray-200 bg-white text-lg font-bold text-gray-600 hover:bg-gray-50"
          >
            +
          </button>
          <span className="text-xs text-gray-400 ml-1">max {pool.max_capacity}</span>
        </div>
      </div>

      {result?.type === 'error' && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{result.msg}</p>
      )}

      {/* Next steps explicit copy */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs text-gray-600 space-y-2">
        <p className="font-semibold text-gray-800 flex items-center gap-1.5">
          <span>🚀</span> Que se passe-t-il ensuite ?
        </p>
        <ul className="space-y-1.5 pl-1">
          <li className="flex items-start gap-1.5">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Une confirmation WhatsApp vous est envoyée instantanément.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Un récapitulatif complet (date, horaire, prix) est envoyé par email.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Le solde ({totalPrice - deposit} MAD) se paie sur place le jour J.</span>
          </li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl active:scale-[0.98]"
        style={{ background: primaryColor }}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
            Réservation en cours...
          </span>
        ) : (
          `🔒 Payer ${deposit} MAD — Confirmer`
        )}
      </button>

      {/* Trust anchors */}
      <div className="space-y-2 pt-1">
        <p className="text-center text-[11px] text-gray-400 font-medium">
          🔒 Paiement 100% sécurisé • 🚫 Aucun engagement • ✨ Annulation gratuite 24h
        </p>
        <p className="text-center text-[10px] text-gray-300">
          Données chiffrées et protégées via Supabase Auth + RLS
        </p>
      </div>
    </form>
  )
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={bold ? 'font-bold' : ''}>{value}</span>
    </div>
  )
}
