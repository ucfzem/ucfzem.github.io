const db = require('../_lib/db');
const icalParser = require('node-ical');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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
    res.json({ success: true, synced, message: `${synced} événement(s) synchronisé(s)` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
