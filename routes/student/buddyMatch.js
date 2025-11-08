const express  = require('express');
const router = express.Router();

const {isLoggedIn} = require('../../middleware');
const catchAsync = require('../../utils/catchAsync');

const controller = require('../../controllers/student/buddyMatch')

router.get('/', isLoggedIn, controller.findMatch);

router.post('/', isLoggedIn, catchAsync(controller.findBuddy));

router.post('/send-request', isLoggedIn, catchAsync(controller.sendBuddyRequest));

router.post('/:id/accept', isLoggedIn, catchAsync(controller.acceptRequest));

router.post('/:id/decline', isLoggedIn, catchAsync(controller.declineRequest));

module.exports  = router