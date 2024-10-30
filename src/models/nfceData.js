// src/models/nfceData.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user'); 

class NfceData extends Model {}

NfceData.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'NfceData',
    tableName: 'NfceData', 
  }
);

NfceData.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(NfceData, { foreignKey: 'userId' });

module.exports = NfceData;
