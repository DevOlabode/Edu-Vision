const express  = require('express');
const router = express.Router();

const {isLoggedIn} = require('../../middleware');
const catchAsync = require('../../utils/catchAsync');

const controller = require('../../controllers/student/buddyMatch')

router.get('/buddy-match', isLoggedIn, controller.findMatch);

router.post('/buddy-match', isLoggedIn, catchAsync(controller.findBuddy));

module.exports  = router
