const db = require('../../_lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { slug } = req.query;
  try {
    const { rows: est } = await db.query('SELECT id FROM establishments WHERE slug = $1', [slug]);
    if (!est.length) return res.status(404).json({ error: 'Establishment not found' });

    const { rows } = await db.query(
      'SELECT * FROM pools WHERE establishment_id = $1 AND is_active = true',
      [est[0].id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
