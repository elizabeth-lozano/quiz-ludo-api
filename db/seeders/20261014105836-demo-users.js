'use strict';

const SCHOOL_IDS = ['2099-0001', '2099-1001', '2099-1002', '2099-1003', '2099-1004', '2099-1005'];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('users', [
      { school_id: '2099-0001', full_name: 'Demo Librarian', email: 'librarian@school.test', role: 'HOST' },
      { school_id: '2099-1001', full_name: 'Mika Reyes', email: 'mika.reyes@school.test', role: 'PLAYER' },
      { school_id: '2099-1002', full_name: 'Jon Santos', email: 'jon.santos@school.test', role: 'PLAYER' },
      { school_id: '2099-1003', full_name: 'Lia Ramos', email: 'lia.ramos@school.test', role: 'PLAYER' },
      { school_id: '2099-1004', full_name: 'Ben Torres', email: 'ben.torres@school.test', role: 'PLAYER' },
      // awkward case: an account that never joined any game
      { school_id: '2099-1005', full_name: 'Nina Flores', email: 'nina.flores@school.test', role: 'PLAYER' },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { school_id: SCHOOL_IDS }, {});
  },
};