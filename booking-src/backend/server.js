const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const ical = require('ical-generator').default;
const icalParser = require('node-ical');
const axios = require('axios');
const db = require('./db');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// HEALTH CHECK
// ==========================================
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'error', db: 'disconnected', error: err.message });
  }
});

// ==========================================
// 1. ESTABLISHMENTS
// ==========================================
app.get('/api/establishments/:slug', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM establishments WHERE slug = $1',
      [req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ error: 'Establishment not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/establishments/:slug/pools', async (req, res) => {
  try {
    const { rows: est } = await db.query(
      'SELECT id FROM establishments WHERE slug = $1',
      [req.params.slug]
    );
    if (!est.length) return res.status(404).json({ error: 'Establishment not found' });

    const { rows } = await db.query(
      'SELECT * FROM pools WHERE establishment_id = $1 AND is_active = true',
      [est[0].id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. SLOT CONFIGS
// ==========================================
app.get('/api/pools/:poolId/slots', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM slot_configs WHERE pool_id = $1 AND is_active = true ORDER BY start_time',
      [req.params.poolId]
    );
    res.json(rows);
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
    const { rows: slots } = await db.query(
      'SELECT * FROM slot_configs WHERE pool_id = $1 AND is_active = true ORDER BY start_time',
      [req.params.poolId]
    );

    const results = [];
    for (const slot of slots) {
      const { rows } = await db.query(
        'SELECT check_slot_availability($1, $2, $3) AS available',
        [req.params.poolId, date, slot.name]
      );
      results.push({ ...slot, available: rows[0].available });
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
    const { rows: avail } = await db.query(
      'SELECT check_slot_availability($1, $2, $3) AS available',
      [pool_id, booking_date, slot_name]
    );

    if (!avail[0].available) {
      return res.status(409).json({ error: "Ce créneau n'est plus disponible" });
    }

    const amount_paid = total_price * 0.5;

    const { rows } = await db.query(
      `INSERT INTO bookings (pool_id, customer_name, customer_email, customer_phone,
        booking_date, slot_name, start_time, end_time,
        guests_count, total_price, amount_paid, payment_status, booking_status, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'pending','confirmed','direct')
       RETURNING *`,
      [pool_id, customer_name, customer_email, customer_phone,
       booking_date, slot_name, start_time, end_time,
       guests_count || 1, total_price, amount_paid]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bookings/:poolId', async (req, res) => {
  const { date_from, date_to, status } = req.query;
  try {
    let sql = 'SELECT * FROM bookings WHERE pool_id = $1';
    const params = [req.params.poolId];
    let i = 2;

    if (date_from) { sql += ` AND booking_date >= $${i++}`; params.push(date_from); }
    if (date_to)   { sql += ` AND booking_date <= $${i++}`; params.push(date_to); }
    if (status)    { sql += ` AND booking_status = $${i++}`; params.push(status); }

    sql += ' ORDER BY booking_date ASC';
    const { rows } = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM bookings ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/bookings/:id/cancel', async (req, res) => {
  try {
    const { rows } = await db.query(
      "UPDATE bookings SET booking_status = 'cancelled' WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Booking not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. iCAL EXPORT / IMPORT
// ==========================================
app.get('/api/export-ical/:poolId', async (req, res) => {
  try {
    const { rows: bookings } = await db.query(
      "SELECT id, customer_name, booking_date, start_time, end_time, slot_name FROM bookings WHERE pool_id = $1 AND booking_status = 'confirmed'",
      [req.params.poolId]
    );
    const { rows: pool } = await db.query('SELECT name FROM pools WHERE id = $1', [req.params.poolId]);

    const calendar = ical({ name: `Réservations — ${pool[0]?.name || req.params.poolId}` });

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

          const { rows: existing } = await db.query(
            "SELECT id FROM bookings WHERE pool_id = $1 AND booking_date = $2 AND start_time = $3 AND source = 'external' LIMIT 1",
            [poolId, bookingDate, startTime]
          );

          if (!existing.length) {
            await db.query(
              `INSERT INTO bookings (pool_id, customer_name, customer_email, customer_phone,
                booking_date, slot_name, start_time, end_time,
                guests_count, total_price, amount_paid, payment_status, booking_status, source)
               VALUES ($1,'Blocage Plateforme Externe','sync@system.local','0000000000',
                $2,'Bloqué Externe',$3,$4, 0,0,0,'paid','confirmed','external')`,
              [poolId, bookingDate, startTime, endTime]
            );
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
    const { rows } = await db.query(
      'UPDATE bookings SET payment_status = $1 WHERE id = $2 RETURNING *',
      [status || 'paid', bookingId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Booking not found' });

    const booking = rows[0];

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
