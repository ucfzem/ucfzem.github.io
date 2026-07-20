// Demo data for offline/preview mode
// When Supabase is not configured, the app uses this mock data

export const DEMO_ESTABLISHMENT = {
  id: 'demo-est-1',
  name: 'Villa Hamza',
  slug: 'villa-hamza',
  logo_url: null,
  primary_color: '#3b82f6',
  whatsapp_phone: '0612345678',
  address: 'Route de Rio, Tanger',
  city: 'Tanger',
  description: 'Villa avec piscine privée à Tanger, vue mer panoramique.'
}

export const DEMO_POOLS = [
  {
    id: 'demo-pool-1',
    establishment_id: 'demo-est-1',
    name: 'Piscine Principale',
    description: 'Piscine extérieure 12x6m avec vue sur le détroit',
    max_capacity: 15,
    price_per_slot: 800,
    currency: 'MAD',
    is_active: true
  },
  {
    id: 'demo-pool-2',
    establishment_id: 'demo-est-1',
    name: 'Espace Kids',
    description: 'Petite piscine chauffée pour enfants (0.8m)',
    max_capacity: 8,
    price_per_slot: 400,
    currency: 'MAD',
    is_active: true
  }
]

export const DEMO_SLOTS = [
  {
    id: 'slot-1',
    pool_id: 'demo-pool-1',
    name: 'Matinée (09h-13h)',
    start_time: '09:00:00',
    end_time: '13:00:00',
    is_active: true
  },
  {
    id: 'slot-2',
    pool_id: 'demo-pool-1',
    name: 'Après-midi (14h-18h)',
    start_time: '14:00:00',
    end_time: '18:00:00',
    is_active: true
  },
  {
    id: 'slot-3',
    pool_id: 'demo-pool-1',
    name: 'Soirée (19h-23h)',
    start_time: '19:00:00',
    end_time: '23:00:00',
    is_active: true
  },
  {
    id: 'slot-4',
    pool_id: 'demo-pool-2',
    name: 'Matinée (09h-12h)',
    start_time: '09:00:00',
    end_time: '12:00:00',
    is_active: true
  },
  {
    id: 'slot-5',
    pool_id: 'demo-pool-2',
    name: 'Après-midi (13h-17h)',
    start_time: '13:00:00',
    end_time: '17:00:00',
    is_active: true
  }
]

export const DEMO_BOOKINGS = [
  {
    id: 'bk-1',
    pool_id: 'demo-pool-1',
    customer_name: 'Ahmed Benali',
    customer_email: 'ahmed@gmail.com',
    customer_phone: '0661234567',
    booking_date: getTodayStr(),
    slot_name: 'Matinée (09h-13h)',
    start_time: '09:00:00',
    end_time: '13:00:00',
    guests_count: 6,
    total_price: 800,
    amount_paid: 400,
    payment_status: 'paid',
    booking_status: 'confirmed',
    source: 'direct',
    created_at: new Date().toISOString()
  },
  {
    id: 'bk-2',
    pool_id: 'demo-pool-1',
    customer_name: 'Sara El Fassi',
    customer_email: 'sara.fassi@hotmail.com',
    customer_phone: '0672345678',
    booking_date: getTomorrowStr(),
    slot_name: 'Après-midi (14h-18h)',
    start_time: '14:00:00',
    end_time: '18:00:00',
    guests_count: 4,
    total_price: 800,
    amount_paid: 0,
    payment_status: 'pending',
    booking_status: 'confirmed',
    source: 'whatsapp',
    created_at: new Date().toISOString()
  },
  {
    id: 'bk-3',
    pool_id: 'demo-pool-2',
    customer_name: 'Youssef Amrani',
    customer_email: 'youssef@outlook.com',
    customer_phone: '0683456789',
    booking_date: getTomorrowStr(),
    slot_name: 'Matinée (09h-12h)',
    start_time: '09:00:00',
    end_time: '12:00:00',
    guests_count: 3,
    total_price: 400,
    amount_paid: 200,
    payment_status: 'paid',
    booking_status: 'confirmed',
    source: 'direct',
    created_at: new Date().toISOString()
  }
]

function getTodayStr() {
  return new Date().toISOString().split('T')[0]
}

function getTomorrowStr() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

// Check if API backend is available
export function isDemoMode() {
  const url = import.meta.env.VITE_API_URL || ''
  return !url || url === 'http://localhost:5000'
}
