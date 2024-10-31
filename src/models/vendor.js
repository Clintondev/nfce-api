//src/models/vendor.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');

class Vendor extends Model {}

Vendor.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    CNPJ: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Vendor',
    tableName: 'vendors',
  }
);

Vendor.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Vendor, { foreignKey: 'userId' });

module.exports = Vendor;
