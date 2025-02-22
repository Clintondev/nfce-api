const Queue = require('bull');

const nfceQueue = new Queue('NFCe Queue', {
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
  },
});

module.exports = nfceQueue;