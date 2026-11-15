const { Router } = require('express');
const controller = require('../controllers/user.controller');
const rules = require('../validators/auth.validator');
const validate = require('../middlewares/validate');
const requireUser = require('../middlewares/require-user');

const router = Router();

// Every endpoint in this file is for admins. The guard runs BEFORE validation,
// so a stranger learns nothing about my rules.
router.use(requireUser('ADMIN'));

router.get('/', controller.list);
router.patch('/:id/role', rules.roleRules, validate, controller.changeRole);

module.exports = router;