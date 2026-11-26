const { matchedData } = require('express-validator');
const questionService = require('../services/question.service');
const { envelope } = require('../utils/paginate');

// What the owner is allowed to see of a question.
function toJson(question) {
  return {
    id: question.question_id,
    set_id: question.set_id,
    position: question.position,
    text: question.question_text,
    time_limit_sec: question.time_limit_sec,
    choices: (question.choices || []).map((choice) => ({
      id: choice.choice_id,
      index: choice.choice_index,
      text: choice.choice_text,
      is_correct: choice.is_correct,
    })),
  };
}

async function list(req, res) {
  const { id, page = 1, limit = 10 } = matchedData(req);
  const { rows, count } = await questionService.list(id, req.user, { page, limit });
  res.status(200).json(envelope(rows.map(toJson), count, { page, limit }));
}

async function create(req, res) {
  const { id } = matchedData(req, { locations: ['params'] });
  const data = matchedData(req, { locations: ['body'] });
  const question = await questionService.create(id, data, req.user);
  res.status(201).json(toJson(question));
}

async function update(req, res) {
  const { id, questionId } = matchedData(req, { locations: ['params'] });
  const changes = matchedData(req, { locations: ['body'] });
  const question = await questionService.update(id, questionId, changes, req.user);
  res.status(200).json(toJson(question));
}

async function remove(req, res) {
  const { id, questionId } = matchedData(req, { locations: ['params'] });
  await questionService.remove(id, questionId, req.user);
  res.status(204).end();
}

module.exports = { list, create, update, remove };