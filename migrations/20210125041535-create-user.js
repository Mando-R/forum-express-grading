'use strict';
module.exports = {
  // 1. async function：包裝.then()鏈，回傳一個 Promise 物件，只是語法包裝 promise-based 寫法。
  up: async (queryInterface, Sequelize) => {
    // 2. await＋非同步處理的回傳值(promise-based)：
    // (1) 設定完 async function 後，在要運用非同步處理的地方加上 await。
    // (2) 注意 await 後面接續的回傳值也必須為 Promise 物件。
    // (3) 目的：程式 await(等待) 後面的函式執行完、並回傳結果之後，再進行後續步驟。
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        //allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        //allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        //allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  }
};