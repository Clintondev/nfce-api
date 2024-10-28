// src/routes/auth.js
const express = require('express');
const passport = require('passport');
const router = express.Router();

// Iniciar a autenticação com o Google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Manipular o callback após a autenticação
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/failure',
    successRedirect: '/auth/success',
  })
);

router.get('/success', (req, res) => {
  res.send('Autenticação bem-sucedida!');
});

router.get('/failure', (req, res) => {
  res.send('Falha na autenticação.');
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
