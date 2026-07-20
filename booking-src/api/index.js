const db = require('./_lib/db');
const ical = require('ical-generator').default;
const icalParser = require('node-ical');

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = new URL(req.url, 'https://x');
  const path = url.pathname;
  const method = req.method;

  try {
    // HEALTH
    if (path === '/api/health') {
      await db.query('SELECT 1');
      return res.json({ status: 'ok', db: 'connected' });
    }

    // GET establishment by slug
    const estMatch = path.match(/^\/api\/establishments\/([^/]+)$/);
    if (estMatch && method === 'GET') {
      const { rows } = await db.query('SELECT * FROM establishments WHERE slug = $1', [estMatch[1]]);
      if (!rows.length) return res.status(404).json({ error: 'Not found' });
      return res.json(rows[0]);
    }

    // GET pools for establishment
    const poolsMatch = path.match(/^\/api\/establishments\/([^/]+)\/pools$/);
    if (poolsMatch && method === 'GET') {
      const { rows: est } = await db.query('SELECT id FROM establishments WHERE slug = $1', [poolsMatch[1]]);
      if (!est.length) return res.status(404).json({ error: 'Not found' });
      const { rows } = await db.query('SELECT * FROM pools WHERE establishment_id = $1 AND is_active = true', [est[0].id]);
      return res.json(rows);
    }

    // GET slots for pool
    const slotsMatch = path.match(/^\/api\/pools\/([^/]+)\/slots$/);
    if (slotsMatch && method === 'GET') {
      const { rows } = await db.query('SELECT * FROM slot_configs WHERE pool_id = $1 AND is_active = true ORDER BY start_time', [slotsMatch[1]]);
      return res.json(rows);
    }

    // GET availability
    const availMatch = path.match(/^\/api\/pools\/([^/]+)\/availability$/);
    if (availMatch && method === 'GET') {
      const date = url.searchParams.get('date');
      if (!date) return res.status(400).json({ error: 'date required' });
      const { rows: slots } = await db.query('SELECT * FROM slot_configs WHERE pool_id = $1 AND is_active = true ORDER BY start_time', [availMatch[1]]);
      const results = [];
      for (const slot of slots) {
        const { rows } = await db.query('SELECT check_slot_availability($1, $2, $3) AS available', [availMatch[1], date, slot.name]);
        results.push({ ...slot, available: rows[0].available });
      }
      return res.json(results);
    }

    // GET bookings (all or by pool)
    if (path === '/api/bookings' && method === 'GET') {
      const { rows } = await db.query('SELECT * FROM bookings ORDER BY created_at DESC');
      return res.json(rows);
    }

    const bookMatch = path.match(/^\/api\/bookings\/([^/]+)$/);
    if (bookMatch && method === 'GET') {
      const params = [bookMatch[1]]; let sql = 'SELECT * FROM bookings WHERE pool_id = $1'; let i = 2;
      const df = url.searchParams.get('date_from');
      const dt = url.searchParams.get('date_to');
      const st = url.searchParams.get('status');
      if (df) { sql += ` AND booking_date >= $${i++}`; params.push(df); }
      if (dt) { sql += ` AND booking_date <= $${i++}`; params.push(dt); }
      if (st) { sql += ` AND booking_status = $${i++}`; params.push(st); }
      sql += ' ORDER BY booking_date ASC';
      const { rows } = await db.query(sql, params);
      return res.json(rows);
    }

    // POST create booking
    if (path === '/api/bookings' && method === 'POST') {
      const b = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { pool_id, customer_name, customer_email, customer_phone, booking_date, slot_name, start_time, end_time, guests_count, total_price } = b;
      if (!pool_id || !customer_name || !customer_email || !customer_phone || !booking_date || !slot_name) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const { rows: avail } = await db.query('SELECT check_slot_availability($1, $2, $3) AS available', [pool_id, booking_date, slot_name]);
      if (!avail[0].available) return res.status(409).json({ error: "Ce créneau n'est plus disponible" });
      const amount_paid = total_price * 0.5;
      const { rows } = await db.query(
        `INSERT INTO bookings (pool_id, customer_name, customer_email, customer_phone, booking_date, slot_name, start_time, end_time, guests_count, total_price, amount_paid, payment_status, booking_status, source)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'pending','confirmed','direct') RETURNING *`,
        [pool_id, customer_name, customer_email, customer_phone, booking_date, slot_name, start_time, end_time, guests_count || 1, total_price, amount_paid]
      );
      return res.status(201).json(rows[0]);
    }

    // PATCH cancel
    const cancelMatch = path.match(/^\/api\/bookings\/([^/]+)\/cancel$/);
    if (cancelMatch && method === 'PATCH') {
      const { rows } = await db.query("UPDATE bookings SET booking_status = 'cancelled' WHERE id = $1 RETURNING *", [cancelMatch[1]]);
      if (!rows.length) return res.status(404).json({ error: 'Not found' });
      return res.json(rows[0]);
    }

    // iCAL EXPORT
    const icalMatch = path.match(/^\/api\/export-ical\/([^/]+)$/);
    if (icalMatch && method === 'GET') {
      const { rows: bookings } = await db.query("SELECT id, customer_name, booking_date, start_time, end_time, slot_name FROM bookings WHERE pool_id = $1 AND booking_status = 'confirmed'", [icalMatch[1]]);
      const { rows: pool } = await db.query('SELECT name FROM pools WHERE id = $1', [icalMatch[1]]);
      const calendar = ical({ name: `Réservations — ${pool[0]?.name || icalMatch[1]}` });
      bookings.forEach(b => {
        calendar.createEvent({ id: b.id, start: new Date(`${b.booking_date}T${b.start_time}`), end: new Date(`${b.booking_date}T${b.end_time}`), summary: `Réservé — ${b.customer_name} (${b.slot_name})` });
      });
      res.setHeader('Content-Type', 'text/calendar');
      res.setHeader('Content-Disposition', `attachment; filename="reservations-${icalMatch[1]}.ics"`);
      return res.send(calendar.toString());
    }

    // SYNC EXTERNAL
    if (path === '/api/sync-external' && method === 'POST') {
      const b = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { poolId, icalUrl } = b;
      if (!poolId || !icalUrl) return res.status(400).json({ error: 'poolId and icalUrl required' });
      const events = await icalParser.fromURL(icalUrl);
      let synced = 0;
      for (let k in events) {
        if (events.hasOwnProperty(k) && events[k].type === 'VEVENT') {
          const ev = events[k];
          const bd = ev.start.toISOString().split('T')[0];
          const st = ev.start.toTimeString().split(' ')[0];
          const et = ev.end.toTimeString().split(' ')[0];
          const { rows: ex } = await db.query("SELECT id FROM bookings WHERE pool_id = $1 AND booking_date = $2 AND start_time = $3 AND source = 'external' LIMIT 1", [poolId, bd, st]);
          if (!ex.length) {
            await db.query(`INSERT INTO bookings (pool_id, customer_name, customer_email, customer_phone, booking_date, slot_name, start_time, end_time, guests_count, total_price, amount_paid, payment_status, booking_status, source)
              VALUES ($1,'Blocage Externe','sync@system.local','0000000000',$2,'Bloqué Externe',$3,$4,0,0,0,'paid','confirmed','external')`, [poolId, bd, st, et]);
            synced++;
          }
        }
      }
      return res.json({ success: true, synced, message: `${synced} événement(s) synchronisé(s)` });
    }

    // WEBHOOK
    if (path === '/api/webhook-payment' && method === 'POST') {
      const b = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { rows } = await db.query('UPDATE bookings SET payment_status = $1 WHERE id = $2 RETURNING *', [b.status || 'paid', b.bookingId]);
      if (!rows.length) return res.status(404).json({ error: 'Not found' });
      return res.json({ success: true, booking: rows[0] });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: err.message });
  }
};
