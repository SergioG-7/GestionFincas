const express = require('express');
const router = express.Router();
const { getAbonado, upsertAbonado, deleteAbonado, updateTemporada } = require('../controllers/abonadoController');

router.get('/', getAbonado);
router.post('/', upsertAbonado);
router.put('/temporada', updateTemporada);
router.delete('/:id', deleteAbonado);

module.exports = router;
