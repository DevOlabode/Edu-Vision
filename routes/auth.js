const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');

const userController = require('../controllers/auth');

const {loginAuthenticate, isLoggedIn, storeReturnTo, redirectIfLoggedIn} = require('../middleware')

router.get('/register', userController.registerForm);

router.post('/register', catchAsync(userController.register));

router.get('/login', redirectIfLoggedIn, userController.loginForm);

router.post('/login', storeReturnTo, loginAuthenticate, catchAsync(userController.login));

router.get('/logout', userController.logout);

router.get('/profile', isLoggedIn, userController.profile);

router.get('/forgot-password', redirectIfLoggedIn, userController.forgottenPasswordForm);

module.exports = router;
