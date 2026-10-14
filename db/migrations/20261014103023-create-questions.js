'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('questions', {
      question_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      set_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'question_sets', key: 'set_id' },
        onDelete: 'CASCADE',
      },
      question_text: { type: Sequelize.TEXT, allowNull: false },
      time_limit_sec: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 15 },
    });
    await queryInterface.addConstraint('questions', {
      type: 'check',
      name: 'ck_questions_time_limit_5_to_60',
      fields: ['time_limit_sec'],
      where: { time_limit_sec: { [Sequelize.Op.between]: [5, 60] } },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('questions');
  },
};