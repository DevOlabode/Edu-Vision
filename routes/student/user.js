const express = require('express');
const router = express.Router();

const { isLoggedIn } = require('../../middleware');
const catchAsync = require('../../utils/catchAsync');

const controller = require('../../controllers/student/user')

router.get('/edit-profile', isLoggedIn, catchAsync(controller.editProfileForm))

router.post('/edit-profile', isLoggedIn, catchAsync(controller.editProfile));

router.get('/change-password', isLoggedIn,controller.changePasswordForm);

router.post('/change-password', isLoggedIn, catchAsync(controller.updatePassword));

router.get('/', isLoggedIn, catchAsync(controller.allUsers));

router.get('/:id', isLoggedIn, catchAsync(controller.profilePage))

module.exports = router