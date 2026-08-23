const express = require('express');
const router = express.Router();
const { getEstados, createEstado, deleteEstado } = require('../controllers/estadosController');

router.get('/', getEstados);
router.post('/', createEstado);
router.delete('/:id', deleteEstado);

module.exports = router;
