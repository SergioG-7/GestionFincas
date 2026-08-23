require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const routes = require('./routes');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middlewares/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'disconnected', message: err.message });
  }
});

// /api/auth/login queda publico; /api/auth/verify exige token (ver routes/auth.js).
app.use('/api/auth', authRoutes);

// Todo lo demas bajo /api requiere sesion valida.
app.use('/api', authMiddleware, routes);

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});
