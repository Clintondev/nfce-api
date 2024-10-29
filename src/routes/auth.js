// src/routes/auth.js
const express = require('express');
const passport = require('passport');
const router = express.Router();

// Iniciar a autenticação com o Google
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'consent',
  })
);

// Manipular o callback após a autenticação
router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, data, info) => {
      if (err || !data) {
        return res.status(401).json({ message: 'Falha na autenticação.' });
      }

      // data contém { user, token }
      const { token } = data;

      // Retornar o token JWT no corpo da resposta em formato JSON
      res.json({
        message: 'Autenticação bem-sucedida!',
        token: token,
      });
    })(req, res, next);
  }
);

// Rota de falha na autenticação
router.get('/failure', (req, res) => {
  res.status(401).json({ message: 'Falha na autenticação.' });
});

// Rota de logout (opcional)
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
