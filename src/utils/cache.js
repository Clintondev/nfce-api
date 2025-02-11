const redis = require('redis');

let client;

async function getRedisClient() {
  if (!client) {
    client = redis.createClient({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379,
    });

    client.on('error', (err) => {
      console.error('Erro ao conectar ao Redis:', err);
    });

    client.on('connect', () => {
      console.log('Conectado ao Redis.');
    });

    await client.connect(); // Garante que a conexão seja estabelecida uma vez
    console.log('Redis cliente conectado com sucesso!');
  }

  return client;
}

const DEFAULT_EXPIRATION = 3600; // 1 hora

module.exports = {
  set: async (key, value, expiration = DEFAULT_EXPIRATION) => {
    try {
      const redisClient = await getRedisClient();

      if (typeof value !== 'string') {
        value = JSON.stringify(value); // Converte objetos para string
      }

      await redisClient.setEx(key, expiration, value);
    } catch (err) {
      console.error('Erro ao definir valor no Redis:', err);
      throw err;
    }
  },

  get: async (key) => {
    try {
      const redisClient = await getRedisClient();
      const data = await redisClient.get(key);

      try {
        return data ? JSON.parse(data) : null; // Retorna o JSON se possível
      } catch (err) {
        return data; // Retorna como string se não for JSON
      }
    } catch (err) {
      console.error('Erro ao obter valor do Redis:', err);
      throw err;
    }
  },

  testConnection: async () => {
    try {
      const redisClient = await getRedisClient();
      const pong = await redisClient.ping();
      console.log('Redis conectado e funcionando:', pong);
    } catch (err) {
      console.error('Erro ao testar conexão com Redis:', err);
      throw err;
    }
  },
};