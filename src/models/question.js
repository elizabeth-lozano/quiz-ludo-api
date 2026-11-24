module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Question',
    {
      question_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      set_id: { type: DataTypes.INTEGER, allowNull: false },
      question_text: { type: DataTypes.TEXT, allowNull: false },
      time_limit_sec: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 15 },
      position: { type: DataTypes.INTEGER, allowNull: false },
    },
    { tableName: 'questions', timestamps: false }
  );