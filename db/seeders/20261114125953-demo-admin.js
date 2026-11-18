'use strict';

const password = require('../../src/security/password');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('users', [
      {
        school_id: '2099-0099',
        full_name: 'Library Admin',
        email: 'library.admin@school.test',
        role: 'ADMIN',
        password_hash: await password.hash('Demo12345'), // the same demo password as the others
        created_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { school_id: '2099-0099' }, {});
  },
};