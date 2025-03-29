const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class User extends Model {}

User.init(
  {
    googleId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING, 
    email: DataTypes.STRING,
    refreshToken: DataTypes.TEXT,
    picture: DataTypes.STRING,     
    givenName: DataTypes.STRING,   
    familyName: DataTypes.STRING,  
  },
  {
    sequelize,
    modelName: 'User',
  }
);

module.exports = User;