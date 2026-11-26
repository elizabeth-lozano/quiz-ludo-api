const { Router } = require('express');
const controller = require('../controllers/question.controller');
const rules = require('../validators/question.validator');
const validate = require('../middlewares/validate');

// mergeParams lets this router see :id from /question-sets/:id/questions.
const router = Router({ mergeParams: true });

// The guard (HOST or ADMIN) comes from question-set.routes.js, so it runs first.
router.get('/', rules.listRules, validate, controller.list);
router.post('/', rules.createRules, validate, controller.create);
router.patch('/:questionId', rules.updateRules, validate, controller.update);
router.delete('/:questionId', rules.questionParams, validate, controller.remove);

module.exports = router;