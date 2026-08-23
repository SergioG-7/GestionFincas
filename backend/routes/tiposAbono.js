const express = require('express');
const router = express.Router();
const {
  getTiposAbono,
  createTipoAbono,
  updateTipoAbono,
  deleteTipoAbono,
} = require('../controllers/tiposAbonoController');

router.get('/', getTiposAbono);
router.post('/', createTipoAbono);
router.put('/:id', updateTipoAbono);
router.delete('/:id', deleteTipoAbono);

module.exports = router;
