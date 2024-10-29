// src/middlewares/auth.js
const jwt = require('jsonwebtoken');

exports.ensureAuthenticated = (req, res, next) => {
  // Obter o token do header de autorização
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Erro no token.' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token mal formatado.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido.' });
    }

    // Adicionar o usuário decodificado ao objeto de requisição
    req.user = decoded;

    return next();
  });
};
