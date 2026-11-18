const { Router } = require('express');
const controller = require('../controllers/auth.controller');
const rules = require('../validators/auth.validator');
const validate = require('../middlewares/validate');
const requireUser = require('../middlewares/require-user');

const router = Router();

// Register and login are open to everyone: no guard.
router.post('/register', rules.registerRules, validate, controller.register);
router.post('/login', rules.loginRules, validate, controller.login);

// /me is for any logged-in account.
router.get('/me', requireUser(), controller.me);

module.exports = router;