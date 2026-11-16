const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { createClient } = require('redis');

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL Connection
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres-service',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'secretpassword',
  database: process.env.DB_NAME || 'mydb',
  port: 5432,
});

// Redis Connection
const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || 'redis-service'}:6379`
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Connect to Redis when the app starts
(async () => {
  await redisClient.connect();
  console.log('✅ Connected to Redis');
})();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.get('/api/welcome', (req, res) => {
  res.json({
    message: 'Welcome from Node.js Backend! 🚀',
    timestamp: new Date().toISOString(),
    pod: process.env.HOSTNAME || 'local',
  });
});

app.get('/api/users', async (req, res) => {
  try {
    // 1. Check Redis Cache first
    const cachedUsers = await redisClient.get('users_list');
    
    if (cachedUsers) {
      console.log('⚡ Serving from Redis Cache');
      return res.json(JSON.parse(cachedUsers));
    }

    // 2. Cache Miss - Query PostgreSQL
    console.log('🐘 Querying PostgreSQL...');
    const result = await pool.query('SELECT name, email, username, is_active FROM users');
    const users = result.rows.map(row => ({
      name: row.name,
      email: row.email,
      username: row.username,
      isActive: row.is_active
    }));

    // 3. Save to Redis for next time (expire in 60 seconds)
    await redisClient.setEx('users_list', 60, JSON.stringify(users));

    res.json(users);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to fetch users from database' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});