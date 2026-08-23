const pool = require('../config/db');

const TIPOS_VALIDOS = ['gasto', 'ingreso', 'ambos'];

async function getCategorias(req, res) {
  try {
    const [categorias] = await pool.query('SELECT * FROM categorias_transacciones ORDER BY nombre ASC');
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createCategoria(req, res) {
  const { nombre, tipo } = req.body;

  if (!nombre) {
    return res.status(400).json({ message: 'nombre es obligatorio' });
  }
  const tipoFinal = TIPOS_VALIDOS.includes(tipo) ? tipo : 'ambos';

  try {
    const [result] = await pool.query(
      'INSERT INTO categorias_transacciones (nombre, tipo) VALUES (?, ?)',
      [nombre, tipoFinal]
    );
    const [[categoria]] = await pool.query('SELECT * FROM categorias_transacciones WHERE id = ?', [result.insertId]);
    res.status(201).json(categoria);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updateCategoria(req, res) {
  const { nombre, tipo } = req.body;

  if (!nombre) {
    return res.status(400).json({ message: 'nombre es obligatorio' });
  }
  const tipoFinal = TIPOS_VALIDOS.includes(tipo) ? tipo : 'ambos';

  try {
    const [result] = await pool.query(
      'UPDATE categorias_transacciones SET nombre = ?, tipo = ? WHERE id = ?',
      [nombre, tipoFinal, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Categoria no encontrada' });
    }
    const [[categoria]] = await pool.query('SELECT * FROM categorias_transacciones WHERE id = ?', [req.params.id]);
    res.json(categoria);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function deleteCategoria(req, res) {
  try {
    // La FK de transacciones.categoria_id es ON DELETE SET NULL: las transacciones
    // asociadas quedan sin categoria automaticamente, sin borrarlas.
    const [result] = await pool.query('DELETE FROM categorias_transacciones WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Categoria no encontrada' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getCategorias, createCategoria, updateCategoria, deleteCategoria };
