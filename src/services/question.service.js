const { sequelize } = require('../models');
const questionRepository = require('../repositories/question.repository');
const sessionRepository = require('../repositories/session.repository');
const questionSetService = require('./question-set.service');
const { notFound, conflict } = require('../errors/app-error');

// Rule: only the owner (or an admin) may touch the questions of a set.
// questionSetService.get() answers 404 for a missing set and 403 for another host.
function ownSet(setId, user) {
  return questionSetService.get(setId, user);
}

// Rule: a set that a game already used is frozen, so a finished game can always be replayed.
async function assertNotInUse(setId) {
  if (await sessionRepository.existsForSet(setId)) {
    throw conflict(
      'QUESTION_SET_IN_USE',
      'This question set was used in a game, so its questions can no longer change.'
    );
  }
}

async function findOrFail(setId, questionId) {
  const question = await questionRepository.findInSet(setId, questionId);
  if (!question) {
    throw notFound('QUESTION_NOT_FOUND', `No question ${questionId} in question set ${setId}.`);
  }
  return question;
}

// Rule: the SERVER numbers the choices 0, 1, 2, 3 in the order they were sent.
function toChoiceRows(questionId, choices) {
  return choices.map((choice, i) => ({
    question_id: questionId,
    choice_index: i,
    choice_text: choice.text,
    is_correct: choice.is_correct,
  }));
}

async function list(setId, user, paging) {
  await ownSet(setId, user);
  return questionRepository.findPageBySet(setId, paging);
}

// Rule: the SERVER picks the position (the next free place). A question and its choices
// are saved all-or-nothing, inside one transaction.
async function create(setId, data, user) {
  await ownSet(setId, user);
  await assertNotInUse(setId);
  const questionId = await sequelize.transaction(async (t) => {
    const position = (await questionRepository.maxPosition(setId, t)) + 1;
    const question = await questionRepository.create({
      set_id: setId,
      question_text: data.text,
      ...(data.time_limit_sec ? { time_limit_sec: data.time_limit_sec } : {}),
      position,
    }, t);
    await questionRepository.createChoices(toChoiceRows(question.question_id, data.choices), t);
    return question.question_id;
  });
  return findOrFail(setId, questionId);
}

async function update(setId, questionId, changes, user) {
  await ownSet(setId, user);
  await assertNotInUse(setId);
  const question = await findOrFail(setId, questionId);
  await sequelize.transaction(async (t) => {
    const fields = {};
    if (changes.text !== undefined) fields.question_text = changes.text;
    if (changes.time_limit_sec !== undefined) fields.time_limit_sec = changes.time_limit_sec;
    if (Object.keys(fields).length > 0) await questionRepository.update(question, fields, t);
    if (changes.choices) { // new choices replace the old ones, all together
      await questionRepository.removeChoices(question.question_id, t);
      await questionRepository.createChoices(toChoiceRows(question.question_id, changes.choices), t);
    }
  });
  return findOrFail(setId, questionId);
}

async function remove(setId, questionId, user) {
  await ownSet(setId, user);
  await assertNotInUse(setId);
  const question = await findOrFail(setId, questionId);
  await sequelize.transaction(async (t) => {
    await questionRepository.remove(question, t);
    await questionRepository.closeGap(setId, question.position, t);
  });
}

module.exports = { list, create, update, remove };