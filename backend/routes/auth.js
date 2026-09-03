const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { login, verify } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Frena fuerza bruta sobre el unico usuario valido: 10 intentos / 15 min por IP.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Demasiados intentos de inicio de sesion. Intentalo de nuevo mas tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, login);
router.get('/verify', authMiddleware, verify);

module.exports = router;
