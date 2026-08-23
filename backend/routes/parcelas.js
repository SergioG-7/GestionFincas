const express = require('express');
const router = express.Router();
const { updateParcela, deleteParcela } = require('../controllers/parcelasController');

router.put('/:id', updateParcela);
router.delete('/:id', deleteParcela);

module.exports = router;
