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
  const { finca_id, temporada_anio, mes, tipo_abono_id, cantidad_dosis, observaciones } = req.body;

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
        'UPDATE planes_abonado SET cantidad_dosis = ?, observaciones = ? WHERE id = ?',
        [cantidad_dosis || null, observaciones || null, existente.id]
      );
      id = existente.id;
    } else {
      const [result] = await pool.query(
        `INSERT INTO planes_abonado (finca_id, temporada_anio, mes, tipo_abono_id, cantidad_dosis, observaciones)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [finca_id, temporada_anio, mes, tipo_abono_id, cantidad_dosis || null, observaciones || null]
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

async function getTemporada(req, res) {
  const { finca_id, anio } = req.query;

  if (!finca_id || !anio) {
    return res.status(400).json({ message: 'finca_id y anio son obligatorios' });
  }

  try {
    const [[temporada]] = await pool.query(
      'SELECT fecha_inicio, fecha_fin FROM temporadas_fincas WHERE finca_id = ? AND anio = ?',
      [finca_id, anio]
    );
    res.json(temporada || { fecha_inicio: null, fecha_fin: null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function upsertTemporada(req, res) {
  const { finca_id, anio, fecha_inicio, fecha_fin } = req.body;

  if (!finca_id || !anio) {
    return res.status(400).json({ message: 'finca_id y anio son obligatorios' });
  }

  try {
    await pool.query(
      `INSERT INTO temporadas_fincas (finca_id, anio, fecha_inicio, fecha_fin)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE fecha_inicio = VALUES(fecha_inicio), fecha_fin = VALUES(fecha_fin)`,
      [finca_id, anio, fecha_inicio || null, fecha_fin || null]
    );
    res.json({ fecha_inicio: fecha_inicio || null, fecha_fin: fecha_fin || null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getAniosConDatos(req, res) {
  const { finca_id } = req.query;

  if (!finca_id) {
    return res.status(400).json({ message: 'finca_id es obligatorio' });
  }

  try {
    const [filas] = await pool.query(
      'SELECT DISTINCT temporada_anio FROM planes_abonado WHERE finca_id = ? ORDER BY temporada_anio DESC',
      [finca_id]
    );
    res.json(filas.map((f) => f.temporada_anio));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

function desplazarAnio(fecha, anioDestino) {
  if (!fecha) return null;
  const d = new Date(fecha);
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${anioDestino}-${mes}-${dia}`;
}

async function copiarPlan(req, res) {
  const { finca_id, anio_origen, anio_destino } = req.body;

  if (!finca_id || !anio_origen || !anio_destino) {
    return res.status(400).json({ message: 'finca_id, anio_origen y anio_destino son obligatorios' });
  }
  if (Number(anio_origen) === Number(anio_destino)) {
    return res.status(400).json({ message: 'El anio de origen y destino deben ser distintos' });
  }

  const conn = await pool.getConnection();
  try {
    const [registrosOrigen] = await conn.query(
      'SELECT * FROM planes_abonado WHERE finca_id = ? AND temporada_anio = ?',
      [finca_id, anio_origen]
    );

    if (registrosOrigen.length === 0) {
      return res.status(400).json({ message: `No hay plan de abonado guardado en ${anio_origen} para copiar` });
    }

    await conn.beginTransaction();

    const [[temporadaOrigen]] = await conn.query(
      'SELECT fecha_inicio, fecha_fin FROM temporadas_fincas WHERE finca_id = ? AND anio = ?',
      [finca_id, anio_origen]
    );

    if (temporadaOrigen) {
      await conn.query(
        `INSERT INTO temporadas_fincas (finca_id, anio, fecha_inicio, fecha_fin)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE fecha_inicio = VALUES(fecha_inicio), fecha_fin = VALUES(fecha_fin)`,
        [
          finca_id,
          anio_destino,
          desplazarAnio(temporadaOrigen.fecha_inicio, anio_destino),
          desplazarAnio(temporadaOrigen.fecha_fin, anio_destino),
        ]
      );
    }

    await conn.query('DELETE FROM planes_abonado WHERE finca_id = ? AND temporada_anio = ?', [
      finca_id,
      anio_destino,
    ]);

    for (const registro of registrosOrigen) {
      await conn.query(
        `INSERT INTO planes_abonado (finca_id, temporada_anio, mes, tipo_abono_id, cantidad_dosis, observaciones)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [finca_id, anio_destino, registro.mes, registro.tipo_abono_id, registro.cantidad_dosis, registro.observaciones]
      );
    }

    await conn.commit();
    res.json({ ok: true, copiados: registrosOrigen.length });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    conn.release();
  }
}

module.exports = {
  getAbonado,
  upsertAbonado,
  deleteAbonado,
  getTemporada,
  upsertTemporada,
  getAniosConDatos,
  copiarPlan,
};
