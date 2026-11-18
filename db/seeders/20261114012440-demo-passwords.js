'use strict';

const password = require('../../src/security/password');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const hash = await password.hash('Demo12345');
    // Only accounts that have no password yet. Your Week 10 seeder stays untouched.
    await queryInterface.bulkUpdate('users', { password_hash: hash }, { password_hash: null });
  },

  async down(queryInterface) {
    await queryInterface.bulkUpdate('users', { password_hash: null }, {});
  },
};