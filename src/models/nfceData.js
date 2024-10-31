//src/models/nfceData.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Vendor = require('./vendor');

class NfceData extends Model {}

NfceData.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    totalItems: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    totalPaid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    change: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    series: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emission: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    authorizationProtocol: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    xmlVersion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    xsltVersion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accessKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    consumerInfo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vendorId: {
      type: DataTypes.INTEGER,
      allowNull: true,  
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

NfceData.belongsTo(Vendor, { foreignKey: 'vendorId', onDelete: 'SET NULL' });
Vendor.hasMany(NfceData, { foreignKey: 'vendorId' });

module.exports = NfceData;
