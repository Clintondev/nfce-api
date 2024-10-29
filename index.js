// index.js
const express = require('express');
const puppeteer = require('puppeteer');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const passport = require('./src/config/passport');
const session = require('express-session'); 
const swaggerSpecs = require('./src/config/swagger');
const errorHandler = require('./src/middlewares/errorHandler');
const nfceRoutes = require('./src/routes/nfce');
const authRoutes = require('./src/routes/auth');
const sequelize = require('./src/config/database');
const User = require('./src/models/user');

const app = express();
const PORT = process.env.PORT || 3400;

app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    })
  );

app.use(passport.initialize());

app.use('/auth', authRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use('/nfce', nfceRoutes);
app.use(errorHandler);

sequelize.sync({ alter: true })
  .then(() => {
    //console.log('Tabelas sincronizadas!');
  })
  .catch((err) => {
   // console.error('Erro ao sincronizar tabelas:', err);
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);

});
