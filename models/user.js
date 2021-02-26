'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Model User[1] -> [M]Model Comment
      User.hasMany(models.Comment)

      // Model User[M] -> [M]Model Restaurant
      // 注意：User 相關 Passport 套件，所以 Passport.js 新增{model}設定。
      User.belongsToMany(models.Restaurant, {
        // 1. through(查詢路徑)："JOIN TABLE(FK)" -> "Original Model(Data)" 
        // Favorite Table
        through: models.Favorite,
        // Favorite Model[固定 UserId(FK) -> RestaurantId(FK)] -> Restaurant Model
        foreighKey: "UserId",

        // 2. as(命名 路徑&方法)：命名此多對多關係＆查詢路徑。
        // 路徑&方法：user.FavoritedRestaurants
        // User Model -> Favorite Model(JOIN Table) -> Restaurant Model(物件{})
        // 即找出 User 收藏的 Restaurant。
        as: "FavoritedRestaurants"
      })

      // Followship：Model User[M] <-> Model User[M]
      // 注意：User 相關 Passport 套件，所以 Passport.js 新增{model}設定。
      User.belongsToMany(User, {
        // Followship Table
        through: models.Followship,
        // User Model[固定 followingId(FK) -> followerId(FK)] -> User Model(從 following 找 follower)
        foreignKey: "followingId",
        // 追蹤者
        as: "Followers"
      })

      User.belongsToMany(User, {
        // Followship Table
        through: models.Followship,
        // User Model[固定 followerId(FK) -> followingId(FK)] -> User Model(從 follower 找 following)
        foreignKey: "followerId",
        // 被追蹤者
        as: "Followings"
      })
    }
  };

  // User.init：定義 Data 欄位屬性
  User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    isAdmin: DataTypes.BOOLEAN,
    // 新增欄位：image
    image: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'User',
  });

  // 回傳、匯出 Model
  return User;
};