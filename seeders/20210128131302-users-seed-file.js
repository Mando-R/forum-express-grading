'use strict';

// 引入 bcrypt：設定密碼時才能引用相關函式。
const bcrypt = require("bcryptjs")

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // bulkInsert()：Insert records into a table.
    // 用陣列形式，將 user 物件傳入 MySQL Database。
    await queryInterface.bulkInsert('Users', [{
      // 管理員權限帳號
      email: "root@example.com",
      password: bcrypt.hashSync("12345678", bcrypt.genSaltSync(10), null),

      // 注意：isAdmin：管理員權限
      isAdmin: true,
      name: "root",

      // createdAt 和 updatedAt：兩欄位的值也須一並附上，因sequelize 的 bulkInsert 也和 mongoose 的 insertMany 一樣，預設不帶入 timestamp。
      // new Date()：獲取現在時間。
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      email: "user1@example.com",
      password: bcrypt.hashSync("12345678", bcrypt.genSaltSync(10), null),
      isAdmin: false,
      name: "user1",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      email: "user2@example.com",
      password: bcrypt.hashSync("12345678", bcrypt.genSaltSync(10), null),
      isAdmin: false,
      name: "user2",
      createdAt: new Date(),
      updatedAt: new Date()
    }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    // bulkDelete：批次刪除，清空 Users 這個 Table 內所有資料，並寫入 null 值。第三個參數可指定 where 條件，但因全部刪除，所以只傳入空物件。
    await queryInterface.bulkDelete("Users", null, {});
  }
};
