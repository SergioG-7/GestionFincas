const pool = require('../config/db');

async function getEstados(req, res) {
  try {
    const [estados] = await pool.query('SELECT * FROM estados ORDER BY id ASC');
    res.json(estados);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createEstado(req, res) {
  const { nombre, color_hexadecimal } = req.body;

  if (!nombre || !color_hexadecimal) {
    return res.status(400).json({ message: 'nombre y color_hexadecimal son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO estados (nombre, color_hexadecimal) VALUES (?, ?)',
      [nombre, color_hexadecimal]
    );
    const [[estado]] = await pool.query('SELECT * FROM estados WHERE id = ?', [result.insertId]);
    res.status(201).json(estado);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updateEstado(req, res) {
  const { nombre, color_hexadecimal } = req.body;

  if (!nombre || !color_hexadecimal) {
    return res.status(400).json({ message: 'nombre y color_hexadecimal son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE estados SET nombre = ?, color_hexadecimal = ? WHERE id = ?',
      [nombre, color_hexadecimal, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Estado no encontrado' });
    }
    const [[estado]] = await pool.query('SELECT * FROM estados WHERE id = ?', [req.params.id]);
    res.json(estado);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function deleteEstado(req, res) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query('DELETE FROM asignaciones_celdas WHERE estado_id = ?', [req.params.id]);

    const [result] = await conn.query('DELETE FROM estados WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Estado no encontrado' });
    }

    await conn.commit();
    res.status(204).send();
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    conn.release();
  }
}

module.exports = { getEstados, createEstado, updateEstado, deleteEstado };
