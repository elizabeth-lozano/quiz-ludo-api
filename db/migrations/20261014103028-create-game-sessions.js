'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('game_sessions', {
      session_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      set_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'question_sets', key: 'set_id' },
        onDelete: 'RESTRICT',
      },
      host_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'user_id' },
        onDelete: 'RESTRICT',
      },
      join_pin: { type: Sequelize.STRING(6), allowNull: false, unique: true },
      status: { type: Sequelize.STRING(10), allowNull: false, defaultValue: 'LOBBY' },
      current_question_index: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      q_started_at: { type: Sequelize.DATE, allowNull: true },
      roll_pending: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      roll_deadline: { type: Sequelize.DATE, allowNull: true },
      last_die: { type: Sequelize.SMALLINT, allowNull: true },
      last_event: { type: Sequelize.STRING(200), allowNull: true },
      winner_nickname: { type: Sequelize.STRING(24), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
      started_at: { type: Sequelize.DATE, allowNull: true },
      ended_at: { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addConstraint('game_sessions', {
      type: 'check',
      name: 'ck_game_sessions_status_valid',
      fields: ['status'],
      where: { status: { [Sequelize.Op.in]: ['LOBBY', 'RUNNING', 'CLOSED'] } },
    });
    await queryInterface.addConstraint('game_sessions', {
      type: 'check',
      name: 'ck_game_sessions_last_die_1_to_6',
      fields: ['last_die'],
      where: { last_die: { [Sequelize.Op.between]: [1, 6] } },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('game_sessions');
  },
};