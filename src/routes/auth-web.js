// src/routes/auth-web.js
const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); 
const router = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google/web', async (req, res) => {
  try {
    const { token: googleToken } = req.body;
    if (!googleToken) {
      return res.status(400).json({ error: 'Token não fornecido.' });
    }

    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const googleId = payload['sub'];
    const email = payload['email'];
    const name = payload['name'];

    let user = await User.findOne({ where: { googleId } });
    if (!user) {
      user = await User.create({
        googleId,
        name,
        email,
      });
    }

    const jwtToken = jwt.sign(
      {
        id: user.id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({
      message: 'Autenticação bem-sucedida!',
      token: jwtToken,
    });
  } catch (error) {
    console.error('Erro na autenticação com o token do Google:', error);
    return res.status(401).json({ error: 'Token do Google inválido.' });
  }
});

module.exports = router;