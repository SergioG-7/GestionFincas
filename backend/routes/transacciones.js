const express = require('express');
const router = express.Router();
const {
  getTransacciones,
  createTransaccion,
  updateTransaccion,
  deleteTransaccion,
} = require('../controllers/transaccionesController');

router.get('/', getTransacciones);
router.post('/', createTransaccion);
router.put('/:id', updateTransaccion);
router.delete('/:id', deleteTransaccion);

module.exports = router;
