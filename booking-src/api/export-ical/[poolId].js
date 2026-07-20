const db = require('../../_lib/db');
const ical = require('ical-generator').default;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { poolId } = req.query;
  try {
    const { rows: bookings } = await db.query(
      "SELECT id, customer_name, booking_date, start_time, end_time, slot_name FROM bookings WHERE pool_id = $1 AND booking_status = 'confirmed'",
      [poolId]
    );
    const { rows: pool } = await db.query('SELECT name FROM pools WHERE id = $1', [poolId]);

    const calendar = ical({ name: `Réservations — ${pool[0]?.name || poolId}` });

    bookings.forEach(b => {
      calendar.createEvent({
        id: b.id,
        start: new Date(`${b.booking_date}T${b.start_time}`),
        end: new Date(`${b.booking_date}T${b.end_time}`),
        summary: `Réservé — ${b.customer_name} (${b.slot_name})`,
        description: `Réservation via Booking SaaS — ${b.slot_name}`
      });
    });

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="reservations-${poolId}.ics"`);
    res.send(calendar.toString());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
