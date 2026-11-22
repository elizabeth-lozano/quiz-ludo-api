const { body, param, query } = require('express-validator');
const { pageRules, sortRules } = require('./list.validator');

const idParam = param('id')
  .isInt({ min: 1 }).withMessage('id must be a positive whole number')
  .toInt();

const title = () => body('title') // title VARCHAR(100) NOT NULL
  .exists().withMessage('title is required')
  .bail()
  .isString().withMessage('title must be text')
  .bail()
  .trim()
  .isLength({ min: 3, max: 100 }).withMessage('title must be 3 to 100 characters long');

const category = () => body('category') // category VARCHAR(40) DEFAULT 'General'
  .optional()
  .isString().withMessage('category must be text')
  .bail()
  .trim()
  .isLength({ min: 1, max: 40 }).withMessage('category must be 1 to 40 characters long');

const description = () => body('description') // description TEXT, may be NULL
  .optional({ values: 'null' })
  .isString().withMessage('description must be text')
  .bail()
  .trim()
  .isLength({ max: 500 }).withMessage('description must be at most 500 characters long');

const createRules = [title(), category(), description()];

// PATCH changes only what is sent: every field is optional, but not all of them at once.
const updateRules = [
  idParam,
  title().optional(),
  category(),
  description(),
  body().custom((value) => {
    const sent = Object.keys(value || {});
    if (!sent.some((key) => ['title', 'category', 'description'].includes(key))) {
      throw new Error('send at least one of: title, category, description');
    }
    return true;
  }),
];

// ?q searches the title and the category. The value is bound as a parameter, never glued into SQL.
const search = query('q')
  .optional()
  .isString().withMessage('q must be text')
  .bail()
  .trim()
  .isLength({ max: 100 }).withMessage('q must be at most 100 characters long');

// ?sort may only name one of these columns (an allow-list), so nobody can sort by
// another column or inject SQL through the URL.
const listRules = [...pageRules, ...sortRules(['title', 'category', 'created_at']), search];

module.exports = { idParam, createRules, updateRules, listRules };