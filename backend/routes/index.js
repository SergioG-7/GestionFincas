const express = require('express');
const router = express.Router();

router.use('/fincas', require('./fincas'));

// Las rutas de los demas recursos (estados, asignaciones_celdas)
// se registraran aqui en las siguientes fases.

module.exports = router;
