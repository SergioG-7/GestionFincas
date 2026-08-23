const express = require('express');
const router = express.Router();
const { getEstados, createEstado, updateEstado, deleteEstado } = require('../controllers/estadosController');

router.get('/', getEstados);
router.post('/', createEstado);
router.put('/:id', updateEstado);
router.delete('/:id', deleteEstado);

module.exports = router;
