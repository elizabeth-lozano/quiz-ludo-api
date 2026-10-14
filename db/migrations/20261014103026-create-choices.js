'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('choices', {
      choice_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'questions', key: 'question_id' },
        onDelete: 'CASCADE',
      },
      choice_index: { type: Sequelize.SMALLINT, allowNull: false },
      choice_text: { type: Sequelize.STRING(200), allowNull: false },
      is_correct: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    });
    await queryInterface.addConstraint('choices', {
      type: 'unique',
      name: 'uq_choices_question_index',
      fields: ['question_id', 'choice_index'],
    });
    await queryInterface.addConstraint('choices', {
      type: 'check',
      name: 'ck_choices_index_0_to_3',
      fields: ['choice_index'],
      where: { choice_index: { [Sequelize.Op.between]: [0, 3] } },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('choices');
  },
};