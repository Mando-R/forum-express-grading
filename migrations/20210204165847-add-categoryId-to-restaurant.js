'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Restaurants', 'CategoryId', {
      type: Sequelize.INTEGER,

      // allowNull : false - 設定必填，也就是每一筆餐廳資料都要指定 CategoryId，否則無法寫入資料庫
      allowNull: false,

      // Sequelize 關聯設置中，預設FK欄位名稱是「Model 名稱 + Id」，而 Model 名稱一般是大寫的。所以 Sequelize 預期「與 Category 關聯FK」叫做 CategoryId 而不是 categoryId。
      references: {
        model: 'Categories',
        key: 'id'
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Restaurants', 'CategoryId')
  }
};
