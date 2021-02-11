'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Restaurant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Model Restaurant[M] -> [1]Model Category
      // restaurant.Category：撈出 restaurant 這間餐廳所屬的分類，注意此時 Category 是單數。
      Restaurant.belongsTo(models.Category)

      // Model Restaurant[1] -> [M]Model Comment
      Restaurant.hasMany(models.Comment)
    }
  };
  Restaurant.init({
    name: DataTypes.STRING,
    tel: DataTypes.STRING,
    address: DataTypes.STRING,
    opening_hours: DataTypes.STRING,
    description: DataTypes.TEXT,
    image: DataTypes.STRING,
    // 更新欄位清單
    CategoryId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Restaurant',
  });
  return Restaurant;
};