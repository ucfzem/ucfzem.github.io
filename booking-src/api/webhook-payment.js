const db = require('../_lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { bookingId, status } = req.body;

  try {
    const { rows } = await db.query(
      'UPDATE bookings SET payment_status = $1 WHERE id = $2 RETURNING *',
      [status || 'paid', bookingId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Booking not found' });

    res.json({ success: true, booking: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
