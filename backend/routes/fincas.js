const express = require('express');
const router = express.Router();
const { getFincas, createFinca } = require('../controllers/fincasController');

router.get('/', getFincas);
router.post('/', createFinca);

module.exports = router;
