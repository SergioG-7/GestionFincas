const pool = require('../config/db');

async function getTransacciones(req, res) {
  const { anio, finca_id } = req.query;

  const condiciones = [];
  const valores = [];

  if (anio) {
    condiciones.push('YEAR(t.fecha) = ?');
    valores.push(anio);
  }
  if (finca_id) {
    condiciones.push('t.finca_id = ?');
    valores.push(finca_id);
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

  try {
    const [transacciones] = await pool.query(
      `SELECT t.*, f.nombre AS finca_nombre
       FROM transacciones t
       LEFT JOIN fincas f ON f.id = t.finca_id
       ${where}
       ORDER BY t.fecha DESC, t.id DESC`,
      valores
    );

    const totalIngresos = transacciones
      .filter((t) => t.tipo === 'ingreso')
      .reduce((suma, t) => suma + Number(t.importe), 0);
    const totalGastos = transacciones
      .filter((t) => t.tipo === 'gasto')
      .reduce((suma, t) => suma + Number(t.importe), 0);

    res.json({
      transacciones,
      resumen: {
        total_ingresos: totalIngresos,
        total_gastos: totalGastos,
        balance_neto: totalIngresos - totalGastos,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createTransaccion(req, res) {
  const { finca_id, tipo, concepto, categoria, importe, fecha, observaciones } = req.body;

  if (!tipo || !['gasto', 'ingreso'].includes(tipo) || !concepto || importe === undefined || !fecha) {
    return res.status(400).json({ message: 'tipo, concepto, importe y fecha son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO transacciones (finca_id, tipo, concepto, categoria, importe, fecha, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [finca_id || null, tipo, concepto, categoria || null, importe, fecha, observaciones || null]
    );

    const [[transaccion]] = await pool.query(
      `SELECT t.*, f.nombre AS finca_nombre FROM transacciones t
       LEFT JOIN fincas f ON f.id = t.finca_id WHERE t.id = ?`,
      [result.insertId]
    );

    res.status(201).json(transaccion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updateTransaccion(req, res) {
  const { finca_id, tipo, concepto, categoria, importe, fecha, observaciones } = req.body;

  if (!tipo || !['gasto', 'ingreso'].includes(tipo) || !concepto || importe === undefined || !fecha) {
    return res.status(400).json({ message: 'tipo, concepto, importe y fecha son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE transacciones
       SET finca_id = ?, tipo = ?, concepto = ?, categoria = ?, importe = ?, fecha = ?, observaciones = ?
       WHERE id = ?`,
      [finca_id || null, tipo, concepto, categoria || null, importe, fecha, observaciones || null, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Transaccion no encontrada' });
    }

    const [[transaccion]] = await pool.query(
      `SELECT t.*, f.nombre AS finca_nombre FROM transacciones t
       LEFT JOIN fincas f ON f.id = t.finca_id WHERE t.id = ?`,
      [req.params.id]
    );

    res.json(transaccion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function deleteTransaccion(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM transacciones WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Transaccion no encontrada' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getTransacciones, createTransaccion, updateTransaccion, deleteTransaccion };
