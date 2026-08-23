const express = require('express');
const router = express.Router();
const {
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
} = require('../controllers/categoriasTransaccionesController');

router.get('/', getCategorias);
router.post('/', createCategoria);
router.put('/:id', updateCategoria);
router.delete('/:id', deleteCategoria);

module.exports = router;
