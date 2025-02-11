const express = require('express');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const passport = require('./src/config/passport');
const swaggerSpecs = require('./src/config/swagger');
const errorHandler = require('./src/middlewares/errorHandler');
const nfceRoutes = require('./src/routes/nfce');
const { ensureAuthenticated, ensureAdmin } = require('./src/middlewares/auth');
const authRoutes = require('./src/routes/auth');
const dataRoutes = require('./src/routes/data');
const sequelize = require('./src/config/database');
const { ExpressAdapter } = require('@bull-board/express');
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const nfceProcessor = require('./src/queues/processors/nfceProcessor');
const nfceQueue = require('./src/queues/nfceQueue');
const cache = require('./src/utils/cache');

const app = express();
const PORT = process.env.PORT || 3400;

app.use(express.json());

app.use(passport.initialize());

app.use('/auth', authRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use('/nfce', nfceRoutes);

app.use('/data', dataRoutes);


const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullAdapter(nfceQueue)],
  serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());

app.use(errorHandler);

nfceQueue.process(nfceProcessor);

nfceQueue.on('completed', (job, result) => {
  console.log(`Tarefa concluída: Job ID ${job.id}`);
});

nfceQueue.on('failed', (job, err) => {
  console.error(`Tarefa falhou: Job ID ${job.id}, Erro: ${err.message}`);
});

sequelize.authenticate()
  .then(() => console.log('Conexão com o banco de dados estabelecida com sucesso.'))
  .catch((err) => {
    console.error('Erro ao conectar ao banco de dados:', err);
    process.exit(1);
  });

sequelize.sync({ alter: false })
  .then(() => console.log('Banco de dados sincronizado.'))
  .catch((err) => console.error('Erro ao sincronizar banco de dados:', err));

cache.testConnection()
  .then(() => console.log('Conexão com Redis testada com sucesso.'))
  .catch((err) => {
    console.error('Erro ao testar conexão com Redis:', err);
    process.exit(1); 
  });

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Documentação Swagger disponível em http://localhost:${PORT}/api-docs`);
});