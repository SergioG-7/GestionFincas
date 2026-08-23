const express = require('express');
const router = express.Router();

router.use('/fincas', require('./fincas'));
router.use('/parcelas', require('./parcelas'));
router.use('/estados', require('./estados'));
router.use('/asignaciones', require('./asignaciones'));
router.use('/transacciones', require('./transacciones'));
router.use('/tipos-abono', require('./tiposAbono'));
router.use('/abonado', require('./abonado'));

module.exports = router;
