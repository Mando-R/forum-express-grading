'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Model User[1] -> [1]Model User
      User.hasMany(models.Comment)
    }
  };

  // User.init：定義 Data 欄位屬性
  User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    isAdmin: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'User',
  });

  // 回傳、匯出 Model
  return User;
};