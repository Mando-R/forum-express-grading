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

      // 注意：Model User[M] -> [M]Model Restaurant
      // Model.belongsToMany：多對多
      User.belongsToMany(models.Restaurant, {
        // 1. through(查詢路徑)："JOIN TABLE(FK)" -> "Original Model(Data)" 
        // (1)先鎖定 Favorite Model(JOIN Table)的 UserId(FK)
        // (2)查詢對應 RestaurantId(FK)。
        // (3)RestaurantId(FK) -> Restaurant Model(Table) 的 Restaurant Data。
        through: models.Favorite,
        foreighKey: "UserId",

        // 2. as(命名 路徑&方法)：命名此多對多關係＆查詢路徑。
        // 路徑&方法：user.FavoritedRestaurants
        // User Model -> Favorite Model(JOIN Table) -> Restaurant Model(物件{})
        // 即找出 User 收藏的 Restaurant。
        as: "FavoritedRestaurants"
      })
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