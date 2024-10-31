//src/models/item.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const NfceData = require('./nfceData');

class Item extends Model {}

Item.init(
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
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    totalPrice: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    accessKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nfceDataId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Item',
    tableName: 'items',
  }
);

// Relacionamentos
Item.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Item, { foreignKey: 'userId' });

Item.belongsTo(NfceData, { foreignKey: 'nfceDataId', onDelete: 'CASCADE' });
NfceData.hasMany(Item, { foreignKey: 'nfceDataId' });

module.exports = Item;
