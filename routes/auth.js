const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');

const userController = require('../controllers/auth');

const {loginAuthenticate} = require('../middleware')

router.get('/register', userController.registerForm);

router.post('/register', catchAsync(userController.register));

router.get('/login', userController.loginForm);

router.post('/login', catchAsync(userController.login))

module.exports = router;