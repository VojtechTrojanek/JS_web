const controller = require('../controllers/itemsController.js');
const usersController = require('../controllers/usersController.js');

const router = require('express').Router();

router.get('/', controller.show);
router.post('/new', controller.create);
router.post('/delete/:id', controller.remove);
router.post('/rent/:id', usersController.requireAuth, controller.rent);

module.exports = router;