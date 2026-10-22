const controller = require('../controllers/itemsController.js');

const router = require('express').Router();

router.get('/', controller.show);
router.post('/new', controller.create);
router.post('/delete/:id', controller.remove);

module.exports = router;