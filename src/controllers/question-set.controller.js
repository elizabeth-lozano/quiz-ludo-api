const { matchedData } = require('express-validator');
const questionSetService = require('../services/question-set.service');
const { envelope } = require('../utils/paginate');
const { toJson: questionToJson } = require('./question-json');

// What a client is allowed to see of a question set.
function toJson(questionSet) {
  return {
    id: questionSet.set_id,
    title: questionSet.title,
    category: questionSet.category,
    description: questionSet.description,
    host_id: questionSet.host_id,
    created_at: questionSet.created_at,
    cover_url: questionSet.cover ? `/uploads/covers/${questionSet.cover}` : null,
  };
}

async function list(req, res) {
  const { page = 1, limit = 10, sort, order, q } = matchedData(req, { locations: ['query'] });
  const { rows, count } = await questionSetService.list(req.user, { page, limit, sort, order, q });
  res.status(200).json(envelope(rows.map(toJson), count, { page, limit }));
}

async function get(req, res) {
  const { id, include } = matchedData(req);
  if (include === 'questions') {
    const questionSet = await questionSetService.getWithQuestions(id, req.user);
    res.status(200).json({ ...toJson(questionSet), questions: questionSet.questions.map(questionToJson) });
    return;
  }
  const questionSet = await questionSetService.get(id, req.user);
  res.status(200).json(toJson(questionSet));
}

async function create(req, res) {
  const data = matchedData(req, { locations: ['body'] }); // only fields that passed a rule
  const questionSet = await questionSetService.create(data, req.user);
  res.status(201).json(toJson(questionSet));
}

async function update(req, res) {
  const { id } = matchedData(req, { locations: ['params'] });
  const changes = matchedData(req, { locations: ['body'] });
  const questionSet = await questionSetService.update(id, changes, req.user);
  res.status(200).json(toJson(questionSet));
}

async function remove(req, res) {
  const { id } = matchedData(req);
  await questionSetService.remove(id, req.user);
  res.status(204).end();
}

module.exports = { list, get, create, update, remove };