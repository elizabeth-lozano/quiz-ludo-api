'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeConstraint('game_sessions', 'game_sessions_set_id_fkey');
    await queryInterface.addConstraint('game_sessions', {
      type: 'foreign key',
      name: 'game_sessions_set_id_fkey',
      fields: ['set_id'],
      references: { table: 'question_sets', field: 'set_id' },
      onDelete: 'NO ACTION',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('game_sessions', 'game_sessions_set_id_fkey');
    await queryInterface.addConstraint('game_sessions', {
      type: 'foreign key',
      name: 'game_sessions_set_id_fkey',
      fields: ['set_id'],
      references: { table: 'question_sets', field: 'set_id' },
      onDelete: 'RESTRICT',
    });
  },
};