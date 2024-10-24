const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('nfce_api', 'root', 'Abcd@123', {
    host: 'localhost',
    dialect: 'mysql',
});

module.exports = sequelize;
