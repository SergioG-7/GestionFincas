const express = require('express');
const router = express.Router();
const {
  getAsignacionesPorParcela,
  createAsignacion,
  createAsignacionesLote,
  limpiarAsignacionesLote,
  updateAsignacion,
  desactivarAsignacion,
  getHistorico,
} = require('../controllers/asignacionesController');

router.get('/parcela/:parcelaId', getAsignacionesPorParcela);
router.get('/historico', getHistorico);
router.post('/', createAsignacion);
router.post('/lote', createAsignacionesLote);
router.post('/lote/limpiar', limpiarAsignacionesLote);
router.put('/:id', updateAsignacion);
router.patch('/:id/desactivar', desactivarAsignacion);

module.exports = router;
