const express = require('express');
const router = express.Router();
const {
  getAbonado,
  upsertAbonado,
  deleteAbonado,
  getTemporada,
  upsertTemporada,
} = require('../controllers/abonadoController');

router.get('/temporada', getTemporada);
router.post('/temporada', upsertTemporada);
router.get('/', getAbonado);
router.post('/', upsertAbonado);
router.delete('/:id', deleteAbonado);

module.exports = router;
