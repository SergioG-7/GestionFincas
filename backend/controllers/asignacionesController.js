const pool = require('../config/db');

async function getAsignacionesPorParcela(req, res) {
  try {
    const [asignaciones] = await pool.query(
      `SELECT ac.*, e.nombre AS estado_nombre, e.color_hexadecimal
       FROM asignaciones_celdas ac
       JOIN estados e ON e.id = ac.estado_id
       WHERE ac.parcela_id = ? AND ac.activo_en_celda = 1
       ORDER BY ac.fecha_asignacion ASC, ac.id ASC`,
      [req.params.parcelaId]
    );
    res.json(asignaciones);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createAsignacion(req, res) {
  const { parcela_id, fila, columna, estado_id, observaciones } = req.body;

  if (!parcela_id || fila === undefined || columna === undefined || !estado_id) {
    return res.status(400).json({ message: 'parcela_id, fila, columna y estado_id son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO asignaciones_celdas
        (parcela_id, fila, columna, estado_id, observaciones, fecha_asignacion, activo_en_celda)
       VALUES (?, ?, ?, ?, ?, CURDATE(), 1)`,
      [parcela_id, fila, columna, estado_id, observaciones || null]
    );

    const [[asignacion]] = await pool.query(
      `SELECT ac.*, e.nombre AS estado_nombre, e.color_hexadecimal
       FROM asignaciones_celdas ac
       JOIN estados e ON e.id = ac.estado_id
       WHERE ac.id = ?`,
      [result.insertId]
    );

    res.status(201).json(asignacion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getAsignacionesPorParcela, createAsignacion };
