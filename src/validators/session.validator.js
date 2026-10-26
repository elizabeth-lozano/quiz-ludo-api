const { body, param } = require('express-validator');

// Hub Contract rule 5: a join code is six digits and does not start with 0.
const codeParam = param('code')
  .matches(/^[1-9][0-9]{5}$/).withMessage('the join code must be six digits');

// The client says which question set to play. The server makes the code.
const createRules = [
  body('set_id')
    .exists().withMessage('set_id is required')
    .bail()
    .isInt({ min: 1 }).withMessage('set_id must be a positive whole number')
    .toInt(),
];

// A client may only ask for these two. LOBBY is where every game starts.
const statusRules = [
  codeParam,
  body('status')
    .exists().withMessage('status is required')
    .bail()
    .isIn(['RUNNING', 'CLOSED']).withMessage('status must be RUNNING or CLOSED'),
];

module.exports = { codeParam, createRules, statusRules };