'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('answers', {
      answer_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      player_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'players', key: 'player_id' },
        onDelete: 'CASCADE',
      },
      question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'questions', key: 'question_id' },
        onDelete: 'RESTRICT',
      },
      choice_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'choices', key: 'choice_id' },
        onDelete: 'RESTRICT',
      },
      q_index: { type: Sequelize.INTEGER, allowNull: false },
      is_correct: { type: Sequelize.BOOLEAN, allowNull: false },
      response_time_ms: { type: Sequelize.INTEGER, allowNull: false },
      answered_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
    });
    await queryInterface.addConstraint('answers', {
      type: 'unique',
      name: 'uq_answers_player_question_round',
      fields: ['player_id', 'q_index'],
    });
    await queryInterface.addConstraint('answers', {
      type: 'check',
      name: 'ck_answers_response_time_not_negative',
      fields: ['response_time_ms'],
      where: { response_time_ms: { [Sequelize.Op.gte]: 0 } },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('answers');
  },
};