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
  pseudo VARCHAR(50) UNIQUE,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)`);

app.get('/messages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des messages.' });
  }
});

app.post('/messages', async (req, res) => {
  try {
    const { pseudo, content } = req.body;
    if (!pseudo || !content) {
      return res.status(400).json({ error: 'Pseudo et message requis.' });
    }
    const result = await pool.query(
      'INSERT INTO messages (pseudo, content) VALUES ($1, $2) RETURNING *',
      [pseudo, content]
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ce pseudonyme est déjà utilisé.' });
    }
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message.' });
  }
});

app.listen(3000, () => console.log('API running on port 3000'));
