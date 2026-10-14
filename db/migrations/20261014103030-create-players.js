'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('players', {
      player_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      session_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'game_sessions', key: 'session_id' },
        onDelete: 'CASCADE',
      },
      // NULL for bots, which have no account. A human who leaves keeps their user_id.
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'user_id' },
        onDelete: 'RESTRICT',
      },
      nickname: { type: Sequelize.STRING(24), allowNull: false },
      color: { type: Sequelize.STRING(6), allowNull: false },
      score: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      token_1_pos: { type: Sequelize.SMALLINT, allowNull: false, defaultValue: 0 },
      token_2_pos: { type: Sequelize.SMALLINT, allowNull: false, defaultValue: 0 },
      is_bot: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      joined_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
      last_seen_at: { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addConstraint('players', {
      type: 'unique',
      name: 'uq_players_session_user',
      fields: ['session_id', 'user_id'],
    });
    await queryInterface.addConstraint('players', {
      type: 'unique',
      name: 'uq_players_session_nickname',
      fields: ['session_id', 'nickname'],
    });
    await queryInterface.addConstraint('players', {
      type: 'unique',
      name: 'uq_players_session_color',
      fields: ['session_id', 'color'],
    });
    await queryInterface.addConstraint('players', {
      type: 'check',
      name: 'ck_players_color_valid',
      fields: ['color'],
      where: { color: { [Sequelize.Op.in]: ['Red', 'Green', 'Yellow', 'Blue'] } },
    });
    await queryInterface.addConstraint('players', {
      type: 'check',
      name: 'ck_players_score_not_negative',
      fields: ['score'],
      where: { score: { [Sequelize.Op.gte]: 0 } },
    });
    await queryInterface.addConstraint('players', {
      type: 'check',
      name: 'ck_players_token_1_0_to_28',
      fields: ['token_1_pos'],
      where: { token_1_pos: { [Sequelize.Op.between]: [0, 28] } },
    });
    await queryInterface.addConstraint('players', {
      type: 'check',
      name: 'ck_players_token_2_0_to_28',
      fields: ['token_2_pos'],
      where: { token_2_pos: { [Sequelize.Op.between]: [0, 28] } },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('players');
  },
};