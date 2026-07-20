const db = require('../../_lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { poolId } = req.query;
  const { date_from, date_to, status } = req.query;

  try {
    let sql = 'SELECT * FROM bookings WHERE pool_id = $1';
    const params = [poolId];
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
};
