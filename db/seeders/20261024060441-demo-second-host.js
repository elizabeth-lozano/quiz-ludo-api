'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('users', [
      {
        school_id: '2099-0002',
        full_name: 'Paolo Mendoza',
        email: 'paolo.mendoza@school.test',
        role: 'HOST',
        created_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { school_id: '2099-0002' }, {});
  },
};