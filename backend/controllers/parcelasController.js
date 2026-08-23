const pool = require('../config/db');

async function updateParcela(req, res) {
  const { nombre, filas, columnas } = req.body;
  const { id } = req.params;

  if (!nombre || !filas || !columnas) {
    return res.status(400).json({ message: 'nombre, filas y columnas son obligatorios' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      'UPDATE parcelas SET nombre = ?, filas = ?, columnas = ? WHERE id = ?',
      [nombre, filas, columnas, id]
    );
    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Parcela no encontrada' });
    }

    // Si se redujo el tamano, las celdas que quedan fuera de las nuevas dimensiones
    // se marcan inactivas (no se borran, para conservar el historico).
    await conn.query(
      `UPDATE asignaciones_celdas
       SET activo_en_celda = 0
       WHERE parcela_id = ? AND activo_en_celda = 1 AND (fila >= ? OR columna >= ?)`,
      [id, filas, columnas]
    );

    await conn.commit();

    const [[parcela]] = await pool.query('SELECT * FROM parcelas WHERE id = ?', [id]);
    res.json(parcela);
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    conn.release();
  }
}

async function deleteParcela(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM parcelas WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Parcela no encontrada' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { updateParcela, deleteParcela };
