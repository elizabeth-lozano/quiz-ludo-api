const { body, param } = require('express-validator');

// ---- register: every rule is at least as strict as the column it fills ----
const schoolId = () => body('school_id') // users.school_id VARCHAR(20), UNIQUE
  .exists().withMessage('school_id is required')
  .bail()
  .isString().withMessage('school_id must be text')
  .bail()
  .trim()
  .matches(/^[0-9]{4}-[0-9]{4}$/).withMessage('school_id must look like 2099-0001');

const fullName = () => body('full_name') // users.full_name VARCHAR(100)
  .exists().withMessage('full_name is required')
  .bail()
  .isString().withMessage('full_name must be text')
  .bail()
  .trim()
  .isLength({ min: 2, max: 100 }).withMessage('full_name must be 2 to 100 characters long');

const email = () => body('email') // users.email, UNIQUE
  .exists().withMessage('email is required')
  .bail()
  .isString().withMessage('email must be text')
  .bail()
  .trim()
  .isEmail().withMessage('email must be a valid email address')
  .bail()
  .isLength({ max: 120 }).withMessage('email must be at most 120 characters long')
  .toLowerCase(); // so Rina@x.test and rina@x.test are the same account

// bcrypt reads only 72 bytes, so a longer password would be silently cut.
const newPassword = () => body('password')
  .exists().withMessage('password is required')
  .bail()
  .isString().withMessage('password must be text')
  .bail()
  .isLength({ min: 8 }).withMessage('password must be at least 8 characters long')
  .bail()
  .custom((value) => Buffer.byteLength(value, 'utf8') <= 72)
  .withMessage('password must be at most 72 bytes long')
  .bail()
  .matches(/[A-Za-z]/).withMessage('password must contain a letter')
  .bail()
  .matches(/[0-9]/).withMessage('password must contain a number');

// There is NO rule for "role" here. With matchedData, a "role" in the body
// never reaches the service, so a visitor cannot register as an admin.
const registerRules = [schoolId(), fullName(), email(), newPassword()];

// ---- login: only "present and text". No length or pattern rules, so a
// stranger learns nothing about what a valid account looks like.
const loginRules = [
  body('school_id')
    .exists().withMessage('school_id is required')
    .bail()
    .isString().withMessage('school_id must be text')
    .bail()
    .trim()
    .notEmpty().withMessage('school_id is required'),
  body('password')
    .exists().withMessage('password is required')
    .bail()
    .isString().withMessage('password must be text')
    .bail()
    .notEmpty().withMessage('password is required'), // never trimmed
];

// ---- admin changes a role ----
const roleRules = [
  param('id')
    .isInt({ min: 1 }).withMessage('id must be a positive whole number')
    .toInt(),
  body('role')
    .exists().withMessage('role is required')
    .bail()
    .isIn(['PLAYER', 'HOST', 'ADMIN']).withMessage('role must be PLAYER, HOST or ADMIN'),
];

module.exports = { registerRules, loginRules, roleRules };