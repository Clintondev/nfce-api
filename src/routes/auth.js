// src/routes/auth.js
const express = require('express');
const passport = require('passport');
const router = express.Router();
const { ensureAuthenticated } = require('../middlewares/auth');

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'consent',
  })
);

router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, data, info) => {
      if (err || !data) {
        return res.status(401).json({ message: 'Falha na autenticação.' });
      }

      const { token } = data;

      res.json({
        message: 'Autenticação bem-sucedida!',
        token: token,
      });
    })(req, res, next);
  }
);

router.get('/failure', (req, res) => {
  res.status(401).json({ message: 'Falha na autenticação.' });
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.post('/refresh-token', ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado.' });
    }

    const payload = {
      id: user.id,
      googleId: user.googleId,
      email: user.email,
      name: user.name,
    };

    const newToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token: newToken });
  } catch (err) {
    console.error('Erro ao renovar o token JWT:', err);
    res.status(500).json({ error: 'Erro ao renovar o token JWT.' });
  }
});

module.exports = router;
