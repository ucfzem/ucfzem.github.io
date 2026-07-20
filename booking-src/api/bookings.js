const db = require('../_lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET all bookings
  if (req.method === 'GET') {
    try {
      const { rows } = await db.query('SELECT * FROM bookings ORDER BY created_at DESC');
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  // POST create booking
  if (req.method === 'POST') {
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
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
