const express = require('express');
const { register, login, getCurrent } = require('../controllers/auth');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middlewares/auth');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/current').get(protect, getCurrent);

module.exports = router;
