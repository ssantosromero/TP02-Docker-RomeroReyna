const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Configuración de base de datos usando variables de entorno
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'todoapp',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

const PORT = process.env.PORT || 3000;
const ENVIRONMENT = process.env.NODE_ENV || 'development';

// Inicializar tabla si no existe
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        environment VARCHAR(50) DEFAULT '${ENVIRONMENT}'
      )
    `);
    console.log(`[${ENVIRONMENT}] Base de datos inicializada`);
  } catch (error) {
    console.error('Error inicializando DB:', error);
  }
}

// Rutas de la API
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY id DESC');
    res.json({
      environment: ENVIRONMENT,
      tasks: result.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { title } = req.body;
    const result = await pool.query(
      'INSERT INTO tasks (title, environment) VALUES ($1, $2) RETURNING *',
      [title, ENVIRONMENT]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    environment: ENVIRONMENT,
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[${ENVIRONMENT}] Servidor corriendo en puerto ${PORT}`);
  });
});