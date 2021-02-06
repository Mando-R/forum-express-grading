'use strict';

// 
const faker = require("faker")

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // bulkInsert()：Insert records into a table.
    // 用陣列形式，將 Restaurant 物件傳入 MySQL Database。
    await queryInterface.bulkInsert("Restaurants",
      // Array.from({ length: 50})：建立長度為 50 的陣列
      Array.from({ length: 50 })
        // map(value, index, array)：讓長度為 50 的陣列，其中每一元素皆對應一個 "餐廳物件{Data}"，並回傳一個新 Array[]。
        .map((d, i) => (
          {
            // faker：產生 fake Data，如 name、tel、address、description。
            name: faker.name.findName(),
            tel: faker.phone.phoneNumber(),
            address: faker.address.streetAddress(),

            opening_hours: "08:00",
            image: `https://loremflickr.com/320/240/restaurant,food/?random=${Math.random() * 100}`,

            description: faker.lorem.text(),

            createdAt: new Date(),
            updatedAt: new Date(),

            // 對應 Category Seeder
            CategoryId: Math.floor(Math.random() * 6) * 10 + 1
          }
        )
        ), {})
  },

  down: async (queryInterface, Sequelize) => {
    // bulkDelete()：Delete records from a table
    await queryInterface.bulkDelete("Restaurants", null, {});
  }
};
