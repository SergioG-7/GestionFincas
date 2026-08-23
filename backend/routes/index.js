const express = require('express');
const router = express.Router();

router.use('/fincas', require('./fincas'));
router.use('/parcelas', require('./parcelas'));
router.use('/estados', require('./estados'));
router.use('/asignaciones', require('./asignaciones'));

module.exports = router;
