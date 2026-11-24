module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Choice',
    {
      choice_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      question_id: { type: DataTypes.INTEGER, allowNull: false },
      choice_index: { type: DataTypes.SMALLINT, allowNull: false },
      choice_text: { type: DataTypes.STRING(200), allowNull: false },
      is_correct: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    { tableName: 'choices', timestamps: false }
  );