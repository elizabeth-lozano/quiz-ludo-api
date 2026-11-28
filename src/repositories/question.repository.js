const { Op } = require('sequelize');
const { Question, Choice } = require('../models');
const { toOffset } = require('../utils/paginate');

// A page of questions, in order. The choices come in ONE extra query for the whole page
// (separate: true), not one query per question. That would be the N+1 problem.
const withChoices = [{ model: Choice, as: 'choices', separate: true, order: [['choice_index', 'ASC']] }];

function findPageBySet(setId, { page, limit }) {
  return Question.findAndCountAll({
    where: { set_id: setId },
    order: [['position', 'ASC']],
    include: withChoices,
    ...toOffset({ page, limit }),
  });
}

function findInSet(setId, questionId) {
  return Question.findOne({ where: { question_id: questionId, set_id: setId }, include: withChoices });
}

async function maxPosition(setId, transaction) {
  const max = await Question.max('position', { where: { set_id: setId }, transaction });
  return max || 0;
}

function create(data, transaction) {
  return Question.create(data, { transaction });
}

function createChoices(rows, transaction) {
  return Choice.bulkCreate(rows, { transaction });
}

function removeChoices(questionId, transaction) {
  return Choice.destroy({ where: { question_id: questionId }, transaction });
}

function update(question, changes, transaction) {
  return question.update(changes, { transaction });
}

function remove(question, transaction) {
  return question.destroy({ transaction }); // the choices go with it (ON DELETE CASCADE)
}

// After a delete, every later question moves up by one. It takes two steps, so the
// UNIQUE (set_id, position) is never broken in between: first move them far away,
// then bring them back one place lower.
async function closeGap(setId, position, transaction) {
  await Question.increment('position', {
    by: 10000, where: { set_id: setId, position: { [Op.gt]: position } }, transaction,
  });
  await Question.decrement('position', {
    by: 10001, where: { set_id: setId, position: { [Op.gt]: 10000 } }, transaction,
  });
}

module.exports = {
  findPageBySet, findInSet, maxPosition, create, createChoices, removeChoices, update, remove, closeGap,
};