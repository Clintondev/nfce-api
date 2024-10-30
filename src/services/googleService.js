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
    return token;
  } catch (err) {
    console.error('Erro ao obter novo Access Token:', err);

    if (err.response && err.response.data) {
      const errorData = err.response.data;
      if (errorData.error === 'invalid_grant') {
        throw new Error('Refresh Token inválido ou expirado.');
      }
    }

    throw err;
  }
}

module.exports = { getAccessToken };
