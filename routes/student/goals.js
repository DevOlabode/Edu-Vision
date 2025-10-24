const express  = require('express');
const router = express.Router();

const controller = require('../../controllers/student/goals');

const {isLoggedIn} = require('../../middleware');
const catchAsync = require('../../utils/catchAsync')

router.get('/new', isLoggedIn, controller.newForm);

router.post('/', isLoggedIn, catchAsync(controller.savegoals));

router.get('/', isLoggedIn, catchAsync(controller.allGoals));

router.get('/:id', isLoggedIn, catchAsync(controller.showGoal))

module.exports = router