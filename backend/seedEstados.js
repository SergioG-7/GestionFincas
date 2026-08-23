require('dotenv').config();
const pool = require('./config/db');

const ESTADOS_POR_DEFECTO = [
  ['Lechera', '#10B981'],
  ['Seco', '#F59E0B'],
  ['Injerto', '#8B5CF6'],
  ['En Producción', '#3B82F6'],
  ['Barbecho', '#9CA3AF'],
  ['Plaga / Tratamiento', '#EF4444'],
  ['Abonado', '#F472B6'],
];

async function seed() {
  const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM estados');

  if (total > 0) {
    console.log(`La tabla estados ya tiene ${total} registro(s). No se inserta nada.`);
    return;
  }

  for (const [nombre, color] of ESTADOS_POR_DEFECTO) {
    await pool.query('INSERT INTO estados (nombre, color_hexadecimal) VALUES (?, ?)', [nombre, color]);
  }

  console.log(`Se insertaron ${ESTADOS_POR_DEFECTO.length} estados por defecto.`);
}

seed()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
