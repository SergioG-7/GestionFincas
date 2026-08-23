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

async function createAsignacionesLote(req, res) {
  const { parcela_id, estado_id, observaciones, celdas } = req.body;

  if (!parcela_id || !estado_id || !Array.isArray(celdas) || celdas.length === 0) {
    return res.status(400).json({ message: 'parcela_id, estado_id y al menos una celda son obligatorios' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    for (const celda of celdas) {
      await conn.query(
        `INSERT INTO asignaciones_celdas
          (parcela_id, fila, columna, estado_id, observaciones, fecha_asignacion, activo_en_celda)
         VALUES (?, ?, ?, ?, ?, CURDATE(), 1)`,
        [parcela_id, celda.fila, celda.columna, estado_id, observaciones || null]
      );
    }

    await conn.commit();

    const [asignaciones] = await pool.query(
      `SELECT ac.*, e.nombre AS estado_nombre, e.color_hexadecimal
       FROM asignaciones_celdas ac
       JOIN estados e ON e.id = ac.estado_id
       WHERE ac.parcela_id = ? AND ac.activo_en_celda = 1
       ORDER BY ac.fecha_asignacion ASC, ac.id ASC`,
      [parcela_id]
    );

    res.status(201).json(asignaciones);
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    conn.release();
  }
}

async function desactivarAsignacion(req, res) {
  try {
    const [result] = await pool.query(
      'UPDATE asignaciones_celdas SET activo_en_celda = 0 WHERE id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Asignacion no encontrada' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getHistorico(req, res) {
  const { desde, hasta, finca_id, parcela_id, estado_id } = req.query;

  const condiciones = [];
  const valores = [];

  if (desde) {
    condiciones.push('ac.fecha_asignacion >= ?');
    valores.push(desde);
  }
  if (hasta) {
    condiciones.push('ac.fecha_asignacion <= ?');
    valores.push(hasta);
  }
  if (finca_id) {
    condiciones.push('f.id = ?');
    valores.push(finca_id);
  }
  if (parcela_id) {
    condiciones.push('p.id = ?');
    valores.push(parcela_id);
  }
  if (estado_id) {
    condiciones.push('e.id = ?');
    valores.push(estado_id);
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

  try {
    const [rows] = await pool.query(
      `SELECT ac.id, ac.fila, ac.columna, ac.fecha_asignacion, ac.observaciones, ac.activo_en_celda,
              f.id AS finca_id, f.nombre AS finca_nombre,
              p.id AS parcela_id, p.nombre AS parcela_nombre,
              e.id AS estado_id, e.nombre AS estado_nombre, e.color_hexadecimal
       FROM asignaciones_celdas ac
       JOIN parcelas p ON p.id = ac.parcela_id
       JOIN fincas f ON f.id = p.finca_id
       JOIN estados e ON e.id = ac.estado_id
       ${where}
       ORDER BY ac.fecha_asignacion DESC, ac.id DESC`,
      valores
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getAsignacionesPorParcela,
  createAsignacion,
  createAsignacionesLote,
  desactivarAsignacion,
  getHistorico,
};
