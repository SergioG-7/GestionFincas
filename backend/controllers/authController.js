const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// El unico usuario autorizado vive en variables de entorno (sin registro publico).
// Se guarda un hash bcrypt en memoria para no comparar la contrasena en texto plano.
const PASSWORD_HASH = bcrypt.hashSync(process.env.AUTH_PASSWORD, 10);

function login(req, res) {
  const { username, password, rememberMe } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'username y password son obligatorios' });
  }

  const usuarioValido = username === process.env.AUTH_USERNAME;
  const passwordValida = bcrypt.compareSync(password, PASSWORD_HASH);

  if (!usuarioValido || !passwordValida) {
    return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
  }

  const token = jwt.sign({ username }, process.env.JWT_SECRET, {
    expiresIn: rememberMe ? '30d' : '24h',
  });

  res.json({ token, username });
}

function verify(req, res) {
  res.json({ username: req.username });
}

module.exports = { login, verify };
