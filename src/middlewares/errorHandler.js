const logger = require('../config/logger');

module.exports = (err, req, res, next) => {
  logger.error('Erro interno no servidor: %s', err.stack);

  res.status(500).json({
    error: 'Something went wrong!',
    details: err.message,
  });
};