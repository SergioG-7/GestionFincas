const express = require('express');
const router = express.Router();
const { getFincas, createFinca, updateFinca, deleteFinca } = require('../controllers/fincasController');

router.get('/', getFincas);
router.post('/', createFinca);
router.put('/:id', updateFinca);
router.delete('/:id', deleteFinca);

module.exports = router;
