const express = require('express');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const passport = require('./src/config/passport');
const swaggerSpecs = require('./src/config/swagger');
const errorHandler = require('./src/middlewares/errorHandler');
const nfceRoutes = require('./src/routes/nfce');
const { ensureAuthenticated, ensureAdmin } = require('./src/middlewares/auth');
const authRoutes = require('./src/routes/auth');
const sequelize = require('./src/config/database');
const { ExpressAdapter } = require('@bull-board/express');
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const nfceProcessor = require('./src/queues/processors/nfceProcessor');
const nfceQueue = require('./src/queues/nfceQueue');
const cache = require('./src/utils/cache');

const app = express();
const PORT = process.env.PORT || 3400;

// Middleware para parsing de JSON
app.use(express.json());

// Inicializar Passport
app.use(passport.initialize());

// Rotas de autenticação
app.use('/auth', authRoutes);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Rotas de NFC-e
app.use('/nfce', nfceRoutes);

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

// Configura o Bull Board
createBullBoard({
  queues: [new BullAdapter(nfceQueue)],
  serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());

// Middleware de tratamento de erros
app.use(errorHandler);

// Configurar fila de processamento
nfceQueue.process(nfceProcessor);

// Eventos de log da fila
nfceQueue.on('completed', (job, result) => {
  console.log(`Tarefa concluída: Job ID ${job.id}`);
});

nfceQueue.on('failed', (job, err) => {
  console.error(`Tarefa falhou: Job ID ${job.id}, Erro: ${err.message}`);
});

// Testar conexão com o banco de dados
sequelize.authenticate()
  .then(() => console.log('Conexão com o banco de dados estabelecida com sucesso.'))
  .catch((err) => {
    console.error('Erro ao conectar ao banco de dados:', err);
    process.exit(1); // Finaliza o processo em caso de erro
  });

// Sincronizar banco de dados
sequelize.sync({ alter: false })
  .then(() => console.log('Banco de dados sincronizado.'))
  .catch((err) => console.error('Erro ao sincronizar banco de dados:', err));

// Testar conexão com Redis
cache.testConnection()
  .then(() => console.log('Conexão com Redis testada com sucesso.'))
  .catch((err) => {
    console.error('Erro ao testar conexão com Redis:', err);
    process.exit(1); // Finaliza o processo em caso de falha
  });

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Documentação Swagger disponível em http://localhost:${PORT}/api-docs`);
});