const pool = require('../config/db');

async function getAbonado(req, res) {
  const { finca_id, anio } = req.query;

  if (!finca_id || !anio) {
    return res.status(400).json({ message: 'finca_id y anio son obligatorios' });
  }

  try {
    const [registros] = await pool.query(
      `SELECT pa.*, ta.nombre AS tipo_abono_nombre, ta.color_hexadecimal
       FROM planes_abonado pa
       JOIN tipos_abono ta ON ta.id = pa.tipo_abono_id
       WHERE pa.finca_id = ? AND pa.temporada_anio = ?
       ORDER BY pa.mes ASC, pa.id ASC`,
      [finca_id, anio]
    );
    res.json(registros);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function upsertAbonado(req, res) {
  const {
    finca_id,
    temporada_anio,
    mes,
    tipo_abono_id,
    cantidad_dosis,
    fecha_inicio_temporada,
    fecha_fin_temporada,
    observaciones,
  } = req.body;

  if (!finca_id || !temporada_anio || !mes || !tipo_abono_id) {
    return res.status(400).json({ message: 'finca_id, temporada_anio, mes y tipo_abono_id son obligatorios' });
  }

  try {
    const [[existente]] = await pool.query(
      `SELECT id FROM planes_abonado
       WHERE finca_id = ? AND temporada_anio = ? AND mes = ? AND tipo_abono_id = ?`,
      [finca_id, temporada_anio, mes, tipo_abono_id]
    );

    let id;
    if (existente) {
      await pool.query(
        `UPDATE planes_abonado
         SET cantidad_dosis = ?, fecha_inicio_temporada = ?, fecha_fin_temporada = ?, observaciones = ?
         WHERE id = ?`,
        [cantidad_dosis || null, fecha_inicio_temporada || null, fecha_fin_temporada || null, observaciones || null, existente.id]
      );
      id = existente.id;
    } else {
      const [result] = await pool.query(
        `INSERT INTO planes_abonado
          (finca_id, temporada_anio, mes, tipo_abono_id, cantidad_dosis, fecha_inicio_temporada, fecha_fin_temporada, observaciones)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          finca_id,
          temporada_anio,
          mes,
          tipo_abono_id,
          cantidad_dosis || null,
          fecha_inicio_temporada || null,
          fecha_fin_temporada || null,
          observaciones || null,
        ]
      );
      id = result.insertId;
    }

    const [[registro]] = await pool.query(
      `SELECT pa.*, ta.nombre AS tipo_abono_nombre, ta.color_hexadecimal
       FROM planes_abonado pa JOIN tipos_abono ta ON ta.id = pa.tipo_abono_id WHERE pa.id = ?`,
      [id]
    );

    res.status(existente ? 200 : 201).json(registro);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function deleteAbonado(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM planes_abonado WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updateTemporada(req, res) {
  const { finca_id, temporada_anio, fecha_inicio_temporada, fecha_fin_temporada } = req.body;

  if (!finca_id || !temporada_anio) {
    return res.status(400).json({ message: 'finca_id y temporada_anio son obligatorios' });
  }

  try {
    await pool.query(
      `UPDATE planes_abonado SET fecha_inicio_temporada = ?, fecha_fin_temporada = ?
       WHERE finca_id = ? AND temporada_anio = ?`,
      [fecha_inicio_temporada || null, fecha_fin_temporada || null, finca_id, temporada_anio]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getAbonado, upsertAbonado, deleteAbonado, updateTemporada };
