const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');

const userController = require('../controllers/auth');

router.get('/register', userController.registerForm);

router.post('/register', catchAsync(userController.register));

router.get('/login', userController.loginForm);

module.exports = router;