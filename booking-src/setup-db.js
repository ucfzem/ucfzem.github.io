const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_D1RFPEIzh6wL@ep-withered-base-ajavqayj.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const schema = fs.readFileSync(__dirname + '/supabase/neon-schema.sql', 'utf8');
  try {
    await pool.query(schema);
    console.log('Schema created successfully');
  } catch (err) {
    console.error('Schema error:', err.message);
  }
  
  // Seed demo data
  try {
    // Villa Hamza establishment
    const { rows: [est] } = await pool.query(`
      INSERT INTO establishments (name, slug, primary_color, whatsapp_phone, address, city, description)
      VALUES ('Villa Hamza', 'villa-hamza', '#3b82f6', '0612345678', 'Route de Rio, Tanger', 'Tanger', 'Villa avec piscine privée à Tanger, vue mer panoramique.')
      RETURNING id
    `);
    console.log('Establishment created:', est.id);

    // Pools
    const { rows: [pool1] } = await pool.query(`
      INSERT INTO pools (establishment_id, name, description, max_capacity, price_per_slot)
      VALUES ($1, 'Piscine Principale', 'Piscine extérieure 12x6m avec vue sur le détroit', 15, 800)
      RETURNING id
    `, [est.id]);
    
    const { rows: [pool2] } = await pool.query(`
      INSERT INTO pools (establishment_id, name, description, max_capacity, price_per_slot)
      VALUES ($1, 'Espace Kids', 'Petite piscine chauffée pour enfants (0.8m)', 8, 400)
      RETURNING id
    `, [est.id]);
    console.log('Pools created:', pool1.id, pool2.id);

    // Slots for Piscine Principale
    await pool.query(`
      INSERT INTO slot_configs (pool_id, name, start_time, end_time) VALUES
      ($1, 'Matinée (09h-13h)', '09:00:00', '13:00:00'),
      ($1, 'Après-midi (14h-18h)', '14:00:00', '18:00:00'),
      ($1, 'Soirée (19h-23h)', '19:00:00', '23:00:00')
    `, [pool1.id]);

    // Slots for Espace Kids
    await pool.query(`
      INSERT INTO slot_configs (pool_id, name, start_time, end_time) VALUES
      ($1, 'Matinée (09h-12h)', '09:00:00', '12:00:00'),
      ($1, 'Après-midi (13h-17h)', '13:00:00', '17:00:00')
    `, [pool2.id]);
    console.log('Slots created');

    // Demo bookings
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    
    await pool.query(`
      INSERT INTO bookings (pool_id, customer_name, customer_email, customer_phone, booking_date, slot_name, start_time, end_time, guests_count, total_price, amount_paid, payment_status, booking_status, source) VALUES
      ($1, 'Ahmed Benali', 'ahmed@gmail.com', '0661234567', $2, 'Matinée (09h-13h)', '09:00:00', '13:00:00', 6, 800, 400, 'paid', 'confirmed', 'direct'),
      ($1, 'Sara El Fassi', 'sara.fassi@hotmail.com', '0672345678', $3, 'Après-midi (14h-18h)', '14:00:00', '18:00:00', 4, 800, 0, 'pending', 'confirmed', 'whatsapp'),
      ($2, 'Youssef Amrani', 'youssef@outlook.com', '0683456789', $3, 'Matinée (09h-12h)', '09:00:00', '12:00:00', 3, 400, 200, 'paid', 'confirmed', 'direct')
    `, [pool1.id, pool2.id, today, tomorrow]);
    console.log('Demo bookings created');

  } catch (err) {
    console.error('Seed error:', err.message);
  }
  
  await pool.end();
}

run();
