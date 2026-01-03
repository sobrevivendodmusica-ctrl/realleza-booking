const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const initDB = async () => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        user_type VARCHAR(30) NOT NULL,
        role_category VARCHAR(30),
        contact VARCHAR(20) NOT NULL,
        emergency_contact VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create events table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        space VARCHAR(100) NOT NULL,
        time VARCHAR(50) NOT NULL,
        event_name VARCHAR(200) NOT NULL,
        notes TEXT,
        status VARCHAR(20) DEFAULT 'unfilled',
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create event_positions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS event_positions (
        id SERIAL PRIMARY KEY,
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        position VARCHAR(50) NOT NULL,
        quantity INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create bookings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        position VARCHAR(50) NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending',
        booked_by INTEGER REFERENCES users(id),
        booked_at TIMESTAMP DEFAULT NOW(),
        confirmed_at TIMESTAMP,
        UNIQUE(event_id, user_id)
      );
    `);

    // Create availability table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS availability (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        available BOOLEAN NOT NULL,
        notes TEXT,
        submitted_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(date, user_id)
      );
    `);

    // Create indexes
    await pool.query('CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_event_positions_event ON event_positions(event_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_bookings_event ON bookings(event_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_availability_date ON availability(date);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_availability_user ON availability(user_id);');

    console.log('✅ Database tables created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating tables:', err);
    process.exit(1);
  }
};

initDB();
