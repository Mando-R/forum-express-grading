'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {

    static associate(models) {
      // define association here
    }
  };
  Like.init({
    UserId: DataTypes.STRING,
    RestaurantId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Like',
  });
  return Like;
};