'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // await：取代 return
    await queryInterface.addColumn("Users", "isAdmin", {
      // 型態：Boolean
      type: Sequelize.BOOLEAN,
      // 預設值： false
      defaultValue: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "isAdmin");
  }
};
