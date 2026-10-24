module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Player',
    {
      player_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      session_id: { type: DataTypes.INTEGER, allowNull: false },
      user_id: { type: DataTypes.INTEGER }, // NULL = a bot seat
      nickname: { type: DataTypes.STRING(24), allowNull: false },
      color: { type: DataTypes.STRING(10), allowNull: false },
      score: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      token_1_pos: { type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 },
      token_2_pos: { type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 },
      is_bot: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      left_at: { type: DataTypes.DATE },
    },
    { tableName: 'players', timestamps: true, createdAt: 'joined_at', updatedAt: false }
  );