const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || res.statusText)
  }
  return res.json()
}

// Establishments
export const getEstablishment = (slug) => api(`/api/establishments/${slug}`)
export const getEstablishmentPools = (slug) => api(`/api/establishments/${slug}/pools`)

// Slots
export const getPoolSlots = (poolId) => api(`/api/pools/${poolId}/slots`)
export const getPoolAvailability = (poolId, date) =>
  api(`/api/pools/${poolId}/availability?date=${date}`)

// Bookings
export const createBooking = (data) =>
  api('/api/bookings', { method: 'POST', body: JSON.stringify(data) })

export const getBookings = (params = {}) => {
  const q = new URLSearchParams(params).toString()
  return api(`/api/bookings${q ? '?' + q : ''}`)
}

export const getBookingsByPool = (poolId, params = {}) => {
  const q = new URLSearchParams(params).toString()
  return api(`/api/bookings/${poolId}${q ? '?' + q : ''}`)
}

export const cancelBooking = (id) =>
  api(`/api/bookings/${id}/cancel`, { method: 'PATCH' })

// iCal
export const getIcalUrl = (poolId) => `${API_BASE}/api/export-ical/${poolId}`
export const syncExternal = (poolId, icalUrl) =>
  api('/api/sync-external', { method: 'POST', body: JSON.stringify({ poolId, icalUrl }) })

// Webhook
export const webhookPayment = (bookingId, status) =>
  api('/api/webhook-payment', { method: 'POST', body: JSON.stringify({ bookingId, status }) })
