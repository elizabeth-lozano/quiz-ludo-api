'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'password_hash', {
      type: Sequelize.STRING(60), // a bcrypt hash is always 60 characters
      allowNull: true,            // existing accounts have no password until the seeder gives one
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'password_hash');
  },
};