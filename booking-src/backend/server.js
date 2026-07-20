const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const ical = require('ical-generator').default;
const icalParser = require('node-ical');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ==========================================
// HEALTH CHECK
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==========================================
// 1. ESTABLISHMENTS
// ==========================================
app.get('/api/establishments/:slug', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('establishments')
      .select('*')
      .eq('slug', req.params.slug)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Establishment not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/establishments/:slug/pools', async (req, res) => {
  try {
    const { data: est, error: e1 } = await supabase
      .from('establishments')
      .select('id')
      .eq('slug', req.params.slug)
      .single();
    if (e1) throw e1;

    const { data: pools, error: e2 } = await supabase
      .from('pools')
      .select('*')
      .eq('establishment_id', est.id)
      .eq('is_active', true);
    if (e2) throw e2;

    res.json(pools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. SLOT CONFIGS
// ==========================================
app.get('/api/pools/:poolId/slots', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('slot_configs')
      .select('*')
      .eq('pool_id', req.params.poolId)
      .eq('is_active', true)
      .order('start_time');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. AVAILABILITY CHECK
// ==========================================
app.get('/api/pools/:poolId/availability', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date query param required' });

  try {
    const { data: slots, error: e1 } = await supabase
      .from('slot_configs')
      .select('*')
      .eq('pool_id', req.params.poolId)
      .eq('is_active', true)
      .order('start_time');
    if (e1) throw e1;

    const results = [];
    for (const slot of slots) {
      const { data: available } = await supabase.rpc('check_slot_availability', {
        p_pool_id: req.params.poolId,
        p_date: date,
        p_slot_name: slot.name
      });
      results.push({
        ...slot,
        available: available
      });
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. BOOKINGS
// ==========================================
app.post('/api/bookings', async (req, res) => {
  const {
    pool_id, customer_name, customer_email, customer_phone,
    booking_date, slot_name, start_time, end_time,
    guests_count, total_price
  } = req.body;

  if (!pool_id || !customer_name || !customer_email || !customer_phone || !booking_date || !slot_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check availability first
    const { data: isAvailable } = await supabase.rpc('check_slot_availability', {
      p_pool_id: pool_id,
      p_date: booking_date,
      p_slot_name: slot_name
    });

    if (!isAvailable) {
      return res.status(409).json({ error: 'Ce créneau n\'est plus disponible' });
    }

    const amount_paid = total_price * 0.5;

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        pool_id,
        customer_name,
        customer_email,
        customer_phone,
        booking_date,
        slot_name,
        start_time,
        end_time,
        guests_count: guests_count || 1,
        total_price,
        amount_paid,
        payment_status: 'pending',
        booking_status: 'confirmed',
        source: 'direct'
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bookings/:poolId', async (req, res) => {
  const { date_from, date_to, status } = req.query;
  try {
    let query = supabase
      .from('bookings')
      .select('*')
      .eq('pool_id', req.params.poolId)
      .order('booking_date', { ascending: true });

    if (date_from) query = query.gte('booking_date', date_from);
    if (date_to) query = query.lte('booking_date', date_to);
    if (status) query = query.eq('booking_status', status);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/bookings/:id/cancel', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ booking_status: 'cancelled' })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. iCAL EXPORT / IMPORT
// ==========================================
app.get('/api/export-ical/:poolId', async (req, res) => {
  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, customer_name, booking_date, start_time, end_time, slot_name')
      .eq('pool_id', req.params.poolId)
      .eq('booking_status', 'confirmed');
    if (error) throw error;

    const { data: pool } = await supabase
      .from('pools')
      .select('name')
      .eq('id', req.params.poolId)
      .single();

    const calendar = ical({ name: `Réservations — ${pool?.name || req.params.poolId}` });

    bookings.forEach(b => {
      calendar.createEvent({
        id: b.id,
        start: new Date(`${b.booking_date}T${b.start_time}`),
        end: new Date(`${b.booking_date}T${b.end_time}`),
        summary: `Réservé — ${b.customer_name} (${b.slot_name})`,
        description: `Réservation via Booking SaaS — ${b.slot_name}`
      });
    });

    res.set('Content-Type', 'text/calendar');
    res.set('Content-Disposition', `attachment; filename="reservations-${req.params.poolId}.ics"`);
    return res.send(calendar.toString());
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/sync-external', async (req, res) => {
  const { poolId, icalUrl } = req.body;
  if (!poolId || !icalUrl) {
    return res.status(400).json({ error: 'poolId and icalUrl required' });
  }

  try {
    const events = await icalParser.fromURL(icalUrl);
    let synced = 0;

    for (let k in events) {
      if (events.hasOwnProperty(k)) {
        const ev = events[k];
        if (ev.type === 'VEVENT') {
          const bookingDate = ev.start.toISOString().split('T')[0];
          const startTime = ev.start.toTimeString().split(' ')[0];
          const endTime = ev.end.toTimeString().split(' ')[0];

          // Check if already synced
          const { data: existing } = await supabase
            .from('bookings')
            .select('id')
            .eq('pool_id', poolId)
            .eq('booking_date', bookingDate)
            .eq('start_time', startTime)
            .eq('source', 'external')
            .maybeSingle();

          if (!existing) {
            await supabase.from('bookings').insert({
              pool_id: poolId,
              customer_name: 'Blocage Plateforme Externe',
              customer_email: 'sync@system.local',
              customer_phone: '0000000000',
              booking_date: bookingDate,
              slot_name: 'Bloqué Externe',
              start_time: startTime,
              end_time: endTime,
              guests_count: 0,
              total_price: 0,
              amount_paid: 0,
              payment_status: 'paid',
              booking_status: 'confirmed',
              source: 'external'
            });
            synced++;
          }
        }
      }
    }
    return res.json({ success: true, synced, message: `${synced} événement(s) synchronisé(s)` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. WHATSAPP NOTIFICATIONS
// ==========================================
async function sendWhatsAppNotification(phone, clientName, date, slot) {
  const formattedPhone = phone.startsWith('0') ? `212${phone.slice(1)}` : phone;

  try {
    await axios.post(
      `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'template',
        template: {
          name: 'booking_confirmation_maroc',
          language: { code: 'fr' },
          components: [{
            type: 'body',
            parameters: [
              { type: 'text', text: clientName },
              { type: 'text', text: date },
              { type: 'text', text: slot }
            ]
          }]
        }
      },
      {
        headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` }
      }
    );
    console.log(`WhatsApp sent to ${formattedPhone}`);
  } catch (error) {
    console.error('WhatsApp error:', error.response?.data || error.message);
  }
}

// ==========================================
// 7. PAYMENT WEBHOOK
// ==========================================
app.post('/api/webhook-payment', async (req, res) => {
  const { bookingId, status } = req.body;

  try {
    const { data: booking, error } = await supabase
      .from('bookings')
      .update({ payment_status: status || 'paid' })
      .eq('id', bookingId)
      .select('*, pools(name)')
      .single();
    if (error) throw error;

    if (status === 'paid' || !status) {
      await sendWhatsAppNotification(
        booking.customer_phone,
        booking.customer_name,
        booking.booking_date,
        booking.slot_name
      );
    }

    return res.json({ success: true, booking });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// START
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Booking SaaS API running on port ${PORT}`);
});
