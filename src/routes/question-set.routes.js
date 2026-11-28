const { Router } = require('express');
const controller = require('../controllers/question-set.controller');
const rules = require('../validators/question-set.validator');
const validate = require('../middlewares/validate');
const requireUser = require('../middlewares/require-user');
const uploadCover = require('../middlewares/upload-cover');

const router = Router();

router.use(requireUser('HOST', 'ADMIN')); // every endpoint in this file is for hosts
router.use('/:id/questions', require('./question.routes'));

router.get('/', rules.listRules, validate, controller.list);    
router.post('/', rules.createRules, validate, controller.create);
router.get('/:id', rules.getRules, validate, controller.get);
router.patch('/:id', rules.updateRules, validate, controller.update);
router.delete('/:id', rules.idParam, validate, controller.remove);
router.put('/:id/cover', rules.idParam, validate, uploadCover, controller.setCover);

module.exports = router;