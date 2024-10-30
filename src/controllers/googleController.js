// src/controllers/googleController.js
const { google } = require('googleapis');
const { getAccessToken } = require('../services/googleService');
const User = require('../models/user');

exports.getGoogleProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const accessToken = await getAccessToken(user);

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const people = google.people({ version: 'v1', auth: oauth2Client });
    const me = await people.people.get({
      resourceName: 'people/me',
      personFields: 'names,emailAddresses',
    });

    res.json(me.data);
  } catch (err) {
    console.error('Erro ao acessar a API do Google:', err.message);

    if (err.message === 'Refresh Token inválido ou expirado.') {
      return res.status(401).json({
        error: 'Sessão expirada. Por favor, faça login novamente.',
      });
    }

    res.status(500).json({ error: 'Erro ao acessar a API do Google.' });
  }
};