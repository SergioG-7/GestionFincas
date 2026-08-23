const express = require('express');
const router = express.Router();
const {
  getAsignacionesPorParcela,
  createAsignacion,
  desactivarAsignacion,
  getHistorico,
} = require('../controllers/asignacionesController');

router.get('/parcela/:parcelaId', getAsignacionesPorParcela);
router.get('/historico', getHistorico);
router.post('/', createAsignacion);
router.patch('/:id/desactivar', desactivarAsignacion);

module.exports = router;
