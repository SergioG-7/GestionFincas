const express = require('express');
const router = express.Router();
const {
  getAbonado,
  upsertAbonado,
  deleteAbonado,
  getTemporada,
  upsertTemporada,
  getAniosConDatos,
  copiarPlan,
} = require('../controllers/abonadoController');

router.get('/temporada', getTemporada);
router.post('/temporada', upsertTemporada);
router.get('/anios', getAniosConDatos);
router.post('/copiar-plan', copiarPlan);
router.get('/', getAbonado);
router.post('/', upsertAbonado);
router.delete('/:id', deleteAbonado);

module.exports = router;
