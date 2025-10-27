const express = require('express');
const router = express.Router();

const { isLoggedIn } = require('../../middleware');
const catchAsync = require('../../utils/catchAsync');

const controller = require('../../controllers/student/user')

router.get('/edit-profile', isLoggedIn, catchAsync(controller.editProfileForm))

router.post('/edit-profile', isLoggedIn, catchAsync(controller.editProfile));

module.exports = router