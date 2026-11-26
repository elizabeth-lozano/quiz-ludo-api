const { body, param } = require('express-validator');
const { pageRules } = require('./list.validator');

const setIdParam = param('id')
  .isInt({ min: 1 }).withMessage('id must be a positive whole number')
  .toInt();

const questionIdParam = param('questionId')
  .isInt({ min: 1 }).withMessage('questionId must be a positive whole number')
  .toInt();

// A required field must exist; an optional one is skipped when absent.
const field = (name, required) => (required
  ? body(name).exists().withMessage(`${name} is required`).bail()
  : body(name).optional());

const text = (required) => field('text', required) // questions.question_text
  .isString().withMessage('text must be text')
  .bail()
  .trim()
  .isLength({ min: 3, max: 500 }).withMessage('text must be 3 to 500 characters long');

const timeLimit = () => body('time_limit_sec') // the column is checked 5 to 60
  .optional()
  .isInt({ min: 5, max: 60 }).withMessage('time_limit_sec must be a whole number from 5 to 60')
  .toInt();

const choices = (required) => [
  field('choices', required)
    .isArray({ min: 2, max: 4 }).withMessage('choices must be a list of 2 to 4 items')
    .bail()
    .custom((list) => list.filter((c) => c && c.is_correct === true).length === 1)
    .withMessage('exactly one choice must be correct'),
  body('choices.*.text') // choices.choice_text VARCHAR(200)
    .exists().withMessage('every choice needs a text')
    .bail()
    .isString().withMessage('a choice text must be text')
    .bail()
    .trim()
    .isLength({ min: 1, max: 200 }).withMessage('a choice text must be 1 to 200 characters long'),
  body('choices.*.is_correct')
    .exists().withMessage('every choice needs is_correct')
    .bail()
    .isBoolean({ strict: true }).withMessage('is_correct must be true or false'),
];

const listRules = [setIdParam, ...pageRules];
const createRules = [setIdParam, text(true), timeLimit(), ...choices(true)];

// PATCH changes only what is sent, but not nothing.
const updateRules = [
  setIdParam,
  questionIdParam,
  text(false),
  timeLimit(),
  ...choices(false),
  body().custom((value) => {
    if (!['text', 'time_limit_sec', 'choices'].some((key) => value && value[key] !== undefined)) {
      throw new Error('send at least one of: text, time_limit_sec, choices');
    }
    return true;
  }),
];

const questionParams = [setIdParam, questionIdParam];

module.exports = { listRules, createRules, updateRules, questionParams };