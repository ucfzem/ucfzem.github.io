const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_D1RFPEIzh6wL@ep-withered-base-ajavqayj.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // Get pool IDs
  const { rows: pools } = await pool.query('SELECT id, name FROM pools ORDER BY price_per_slot DESC');
  console.log('Pools:', pools.map(p => `${p.name}=${p.id}`));

  const pool1 = pools.find(p => p.name === 'Piscine Principale')?.id;
  const pool2 = pools.find(p => p.name === 'Espace Kids')?.id;

  if (!pool1 || !pool2) { console.error('Pools not found'); await pool.end(); return; }

  // Demo bookings
  await pool.query(`
    INSERT INTO bookings (pool_id, customer_name, customer_email, customer_phone, booking_date, slot_name, start_time, end_time, guests_count, total_price, amount_paid, payment_status, booking_status, source)
    VALUES ($1, 'Ahmed Benali', 'ahmed@gmail.com', '0661234567', $2, 'Matinée (09h-13h)', '09:00:00', '13:00:00', 6, 800, 400, 'paid', 'confirmed', 'direct')
  `, [pool1, today]);

  await pool.query(`
    INSERT INTO bookings (pool_id, customer_name, customer_email, customer_phone, booking_date, slot_name, start_time, end_time, guests_count, total_price, amount_paid, payment_status, booking_status, source)
    VALUES ($1, 'Sara El Fassi', 'sara.fassi@hotmail.com', '0672345678', $2, 'Après-midi (14h-18h)', '14:00:00', '18:00:00', 4, 800, 0, 'pending', 'confirmed', 'whatsapp')
  `, [pool1, tomorrow]);

  await pool.query(`
    INSERT INTO bookings (pool_id, customer_name, customer_email, customer_phone, booking_date, slot_name, start_time, end_time, guests_count, total_price, amount_paid, payment_status, booking_status, source)
    VALUES ($1, 'Youssef Amrani', 'youssef@outlook.com', '0683456789', $2, 'Matinée (09h-12h)', '09:00:00', '12:00:00', 3, 400, 200, 'paid', 'confirmed', 'direct')
  `, [pool2, tomorrow]);

  // Verify
  const { rows: bookings } = await pool.query('SELECT customer_name, booking_date, slot_name, payment_status FROM bookings');
  console.log('Bookings:', bookings);

  await pool.end();
}

seed();
