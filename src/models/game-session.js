module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'GameSession',
    {
      session_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      set_id: { type: DataTypes.INTEGER, allowNull: false },
      host_id: { type: DataTypes.INTEGER, allowNull: false },
      join_pin: { type: DataTypes.STRING(6), allowNull: false },
      status: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'LOBBY' },
      current_question_index: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      started_at: { type: DataTypes.DATE },
      ended_at: { type: DataTypes.DATE },
    },
    { tableName: 'game_sessions', timestamps: true, createdAt: 'created_at', updatedAt: false }
  );