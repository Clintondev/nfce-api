// src/services/googleService.js
const { google } = require('googleapis');
const { decrypt } = require('../config/crypto');

async function getAccessToken(user) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  const encryptedToken = user.refreshToken;

  if (!encryptedToken) {
    throw new Error('Refresh Token não disponível.');
  }

  const refreshToken = decrypt(encryptedToken);

  oauth2Client.setCredentials({ refresh_token: refreshToken });

  try {
    const { token } = await oauth2Client.getAccessToken();

    // Opcional: Atualizar o Access Token do usuário no banco de dados, se necessário
    // Você pode armazenar o novo Access Token se precisar

    return token;
  } catch (err) {
    console.error('Erro ao obter novo Access Token:', err);
    throw err;
  }
}

module.exports = { getAccessToken };
