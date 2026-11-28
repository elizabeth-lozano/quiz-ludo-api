'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // The API and the module call it current_position (1 = the first question).
    // 0 means "no question yet": a game in the lobby has not started.
    await queryInterface.renameColumn('game_sessions', 'current_question_index', 'current_position');

    // The server stamps this every time a question starts, and measures every answer against it.
    await queryInterface.addColumn('game_sessions', 'question_started_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // One answer per player per question, decided by the database, not by a check in the code.
    await queryInterface.addConstraint('answers', {
      type: 'unique',
      name: 'uq_answers_player_question',
      fields: ['player_id', 'question_id'],
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('answers', 'uq_answers_player_question');
    await queryInterface.removeColumn('game_sessions', 'question_started_at');
    await queryInterface.renameColumn('game_sessions', 'current_position', 'current_question_index');
  },
};