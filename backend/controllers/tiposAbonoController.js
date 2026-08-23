const pool = require('../config/db');

async function getTiposAbono(req, res) {
  try {
    const [tipos] = await pool.query('SELECT * FROM tipos_abono ORDER BY id ASC');
    res.json(tipos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createTipoAbono(req, res) {
  const { nombre, color_hexadecimal } = req.body;

  if (!nombre || !color_hexadecimal) {
    return res.status(400).json({ message: 'nombre y color_hexadecimal son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO tipos_abono (nombre, color_hexadecimal) VALUES (?, ?)',
      [nombre, color_hexadecimal]
    );
    const [[tipo]] = await pool.query('SELECT * FROM tipos_abono WHERE id = ?', [result.insertId]);
    res.status(201).json(tipo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updateTipoAbono(req, res) {
  const { nombre, color_hexadecimal } = req.body;

  if (!nombre || !color_hexadecimal) {
    return res.status(400).json({ message: 'nombre y color_hexadecimal son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE tipos_abono SET nombre = ?, color_hexadecimal = ? WHERE id = ?',
      [nombre, color_hexadecimal, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tipo de abono no encontrado' });
    }
    const [[tipo]] = await pool.query('SELECT * FROM tipos_abono WHERE id = ?', [req.params.id]);
    res.json(tipo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function deleteTipoAbono(req, res) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query('DELETE FROM planes_abonado WHERE tipo_abono_id = ?', [req.params.id]);

    const [result] = await conn.query('DELETE FROM tipos_abono WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Tipo de abono no encontrado' });
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

module.exports = { getTiposAbono, createTipoAbono, updateTipoAbono, deleteTipoAbono };
