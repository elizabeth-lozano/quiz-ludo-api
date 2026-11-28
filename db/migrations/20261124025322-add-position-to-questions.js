'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add the column empty, so the questions already in the table can stay.
    await queryInterface.addColumn('questions', 'position', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // 2. Give every existing question its place: 1, 2, 3 inside its set, in id order.
    await queryInterface.sequelize.query(`
      UPDATE questions q
      SET position = numbered.position
      FROM (
        SELECT question_id,
               ROW_NUMBER() OVER (PARTITION BY set_id ORDER BY question_id) AS position
        FROM questions
      ) AS numbered
      WHERE q.question_id = numbered.question_id
    `);

    // 3. Every row has a value now, so the column can be required.
    await queryInterface.changeColumn('questions', 'position', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    // 4. Two questions in one set can never share a place.
    await queryInterface.addConstraint('questions', {
      type: 'unique',
      name: 'uq_questions_set_position',
      fields: ['set_id', 'position'],
    });
    await queryInterface.addConstraint('questions', {
      type: 'check',
      name: 'ck_questions_position_positive',
      fields: ['position'],
      where: { position: { [Sequelize.Op.gte]: 1 } },
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('questions', 'ck_questions_position_positive');
    await queryInterface.removeConstraint('questions', 'uq_questions_set_position');
    await queryInterface.removeColumn('questions', 'position');
  },
};