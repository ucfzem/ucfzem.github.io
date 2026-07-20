const db = require('../../_lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { poolId } = req.query;
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date query param required' });

  try {
    const { rows: slots } = await db.query(
      'SELECT * FROM slot_configs WHERE pool_id = $1 AND is_active = true ORDER BY start_time',
      [poolId]
    );

    const results = [];
    for (const slot of slots) {
      const { rows } = await db.query(
        'SELECT check_slot_availability($1, $2, $3) AS available',
        [poolId, date, slot.name]
      );
      results.push({ ...slot, available: rows[0].available });
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
