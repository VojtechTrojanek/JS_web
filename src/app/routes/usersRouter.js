const controller = require('../controllers/usersController.js');
const router = require('express').Router();

router.get('/register', controller.showRegister);
router.post('/register', controller.register);
router.get('/login', controller.showLogin);
router.post('/login', controller.login);
router.post('/logout', controller.requireAuth, controller.logout);
router.get('/profile', controller.requireAuth, controller.showProfile);
router.post('/delete', controller.requireAuth, controller.deleteProfile);

module.exports = router;
