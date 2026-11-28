const { Op } = require('sequelize');
const { QuestionSet, Question, Choice } = require('../models');
const { toOffset } = require('../utils/paginate');

// A host sees only their own sets (hostId). An admin passes null and sees all of them.
// q looks in the title and the category.
function buildWhere({ hostId, q }) {
  const where = {};
  if (hostId) where.host_id = hostId;
  if (q) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${q}%` } },
      { category: { [Op.iLike]: `%${q}%` } },
    ];
  }
  return where;
}

// One page of rows, and the total number of matching rows, in two queries.
function findPage({ hostId, q, sort = 'set_id', order = 'asc', page, limit }) {
  return QuestionSet.findAndCountAll({
    where: buildWhere({ hostId, q }),
    order: [[sort, order.toUpperCase()], ['set_id', 'ASC']], // set_id breaks ties, so pages never overlap
    ...toOffset({ page, limit }),
  });
}

function findById(id) {
  return QuestionSet.findByPk(id); // a row, or null
}

function create(data) {
  return QuestionSet.create(data);
}

function update(questionSet, changes) {
  return questionSet.update(changes);
}

function remove(questionSet) {
  return questionSet.destroy();
}

// A set, its questions and their choices, in one query (joins), in order.
function findByIdWithQuestions(id) {
  return QuestionSet.findByPk(id, {
    include: [{ model: Question, as: 'questions', include: [{ model: Choice, as: 'choices' }] }],
    order: [
      [{ model: Question, as: 'questions' }, 'position', 'ASC'],
      [{ model: Question, as: 'questions' }, { model: Choice, as: 'choices' }, 'choice_index', 'ASC'],
    ],
  });
}

module.exports = { findPage, findById, findByIdWithQuestions, create, update, remove };