'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('question_sets', 'cover', {
      type: Sequelize.STRING(120), // the file name the server chose, e.g. set-3-<random>.png
      allowNull: true,             // a set may have no picture
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('question_sets', 'cover');
  },
};