const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.query(`CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  pseudo VARCHAR(50),
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)`);

app.get('/messages', async (req, res) => {
  const result = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
  res.json(result.rows);
});

app.post('/messages', async (req, res) => {
  const { pseudo, content } = req.body;
  const result = await pool.query(
    'INSERT INTO messages (pseudo, content) VALUES ($1, $2) RETURNING *',
    [pseudo, content]
  );
  res.json(result.rows[0]);
});

app.listen(3000, () => console.log('API running on port 3000'));
