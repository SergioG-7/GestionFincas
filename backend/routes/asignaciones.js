const express = require('express');
const router = express.Router();
const { getAsignacionesPorParcela, createAsignacion } = require('../controllers/asignacionesController');

router.get('/parcela/:parcelaId', getAsignacionesPorParcela);
router.post('/', createAsignacion);

module.exports = router;
