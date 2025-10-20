const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');

const userController = require('../controllers/auth');

const {loginAuthenticate, isLoggedIn, storeReturnTo, redirectIfLoggedIn} = require('../middleware')

router.get('/register', redirectIfLoggedIn, userController.registerForm);

router.post('/register', catchAsync(userController.register));

router.get('/login', redirectIfLoggedIn, userController.loginForm);

router.post('/login', storeReturnTo, loginAuthenticate, catchAsync(userController.login));

router.get('/logout', userController.logout);

router.get('/profile', isLoggedIn, userController.profile);

router.get('/forgot-password', redirectIfLoggedIn, userController.forgottenPasswordForm);

router.post('/forgot-password', catchAsync(userController.sendCode));

router.get('/reset-password', redirectIfLoggedIn, userController.resetPasswordForm);

router.post('/reset-password', catchAsync(userController.resetPassword));

router.get('/complete-profile', isLoggedIn, userController.completeProfileForm);

router.post('/complete-profile', isLoggedIn, catchAsync(userController.completeProfile));

module.exports = router;
