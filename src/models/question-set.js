module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'QuestionSet',
    {
      set_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      host_id: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING(100), allowNull: false },
      category: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'General' },
      description: { type: DataTypes.TEXT },
    },
    { tableName: 'question_sets', timestamps: true, createdAt: 'created_at', updatedAt: false }
  );