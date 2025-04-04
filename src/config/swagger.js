// config/swagger.js
require('dotenv').config();

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Leitura de NFC-e',
      version: '1.0.0',
      description: 'API para consultar e extrair informações de NFC-e usando Puppeteer',
    },
    servers: [
      {
        url: process.env.SWAGGER_SERVER_URL || 'http://localhost:3400',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);
module.exports = specs;