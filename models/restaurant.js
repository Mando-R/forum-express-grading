'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Restaurant extends Model {
    static associate(models) {
      // Model Restaurant[M] -> [1]Model Category
      // restaurant.Category：撈出 restaurant 這間餐廳所屬的分類，注意此時 Category 是單數。
      Restaurant.belongsTo(models.Category)

      // Model Restaurant[1] -> [M]Model Comment
      Restaurant.hasMany(models.Comment)

      // isFavorited
      // 注意：Model Restaurant[M] -> [M]Model User
      // Model.belongsToMany：多對多
      Restaurant.belongsToMany(models.User, {
        // 1. through(查詢路徑)："JOIN TABLE(FK)" -> "Original Model(Data)" 
        // (1)先鎖定 Favorite Model(JOIN Table)的 RestaurantId(FK)
        // (2)查詢對應 UserId(FK)。
        // (3)UserId(FK) -> User Model(Table) 的 User Data。
        through: models.Favorite,
        foreignKey: "RestaurantId",

        // 2. as(命名 路徑&方法)：命名此多對多關係＆查詢路徑。
        // 路徑&方法：restaurant.FavoritedUsers：
        // Restaurant Model -> Favorite Model(JOIN Table) -> User Model(物件{})
        // 即找出收藏 Restaurant 的 User。
        as: "FavoritedUsers"
      })

      // isLiked
      // 注意：Model Restaurant[M] -> [M]Model User
      // Model.belongsToMany：多對多
      Restaurant.belongsToMany(models.User, {
        through: models.Like,
        foreignKey: "RestaurantId",
        as: "LikedUsers"
      })

    }
  };
  Restaurant.init({
    name: DataTypes.STRING,
    tel: DataTypes.STRING,
    address: DataTypes.STRING,
    opening_hours: DataTypes.STRING,
    description: DataTypes.TEXT,
    // 新增欄位：image
    image: DataTypes.STRING,
    // 新增欄位：CategoryId
    CategoryId: DataTypes.INTEGER,
    // 新增欄位：viewCounts 計算瀏覽/點擊次數 
    viewCounts: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Restaurant',
  });
  return Restaurant;
};