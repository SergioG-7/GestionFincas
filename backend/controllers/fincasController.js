const pool = require('../config/db');

async function getFincas(req, res) {
  try {
    const [fincas] = await pool.query('SELECT * FROM fincas ORDER BY id DESC');
    const [parcelas] = await pool.query('SELECT * FROM parcelas');

    const fincasConParcelas = fincas.map((finca) => ({
      ...finca,
      parcelas: parcelas.filter((p) => p.finca_id === finca.id),
    }));

    res.json(fincasConParcelas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createFinca(req, res) {
  const { nombre, localidad, parcelas } = req.body;

  if (!nombre || !Array.isArray(parcelas) || parcelas.length === 0) {
    return res.status(400).json({ message: 'nombre y al menos una parcela son obligatorios' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [fincaResult] = await conn.query(
      'INSERT INTO fincas (nombre, localidad, num_parcelas) VALUES (?, ?, ?)',
      [nombre, localidad || null, parcelas.length]
    );
    const fincaId = fincaResult.insertId;

    for (const parcela of parcelas) {
      await conn.query(
        'INSERT INTO parcelas (finca_id, nombre, filas, columnas) VALUES (?, ?, ?, ?)',
        [fincaId, parcela.nombre, parcela.filas, parcela.columnas]
      );
    }

    await conn.commit();

    const [[finca]] = await pool.query('SELECT * FROM fincas WHERE id = ?', [fincaId]);
    const [parcelasCreadas] = await pool.query('SELECT * FROM parcelas WHERE finca_id = ?', [fincaId]);

    res.status(201).json({ ...finca, parcelas: parcelasCreadas });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    conn.release();
  }
}

module.exports = { getFincas, createFinca };
