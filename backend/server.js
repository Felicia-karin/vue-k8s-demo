const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// PostgreSQL Connection Pool
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres-service',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'secretpassword',
  database: process.env.DB_NAME || 'mydb',
  port: 5432,
});

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Existing welcome endpoint
app.get('/api/welcome', (req, res) => {
  res.json({
    message: 'Welcome from Node.js Backend! 🚀',
    timestamp: new Date().toISOString(),
    pod: process.env.HOSTNAME || 'local',
  });
});

// NEW: Get all users from PostgreSQL
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT name, email, username, is_active FROM users');
    // Map database columns to frontend-friendly keys
    const users = result.rows.map(row => ({
      name: row.name,
      email: row.email,
      username: row.username,
      isActive: row.is_active
    }));
    res.json(users);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to fetch users from database' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});