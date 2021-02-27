// 引入 faker：Fake Data
const faker = require("faker")

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // bulkInsert()：Insert records into a table.
    await queryInterface.bulkInsert("Comments",
      Array.from({ length: 10 })
        .map((item, index) => ({
          text: faker.lorem.text().substring(0, 20),

          // UserId: Math.floor(Math.random() * 1000) + 1,
          UserId: 112,

          RestaurantId: Math.floor(Math.random() * 10000) + 1,

          createdAt: new Date(),
          updatedAt: new Date(),
        })
        ), {})
  },

  down: async (queryInterface, Sequelize) => {
    // bulkDelete()：Delete records from a table
    await queryInterface.bulkDelete("Comments", null, {});
  }
};
