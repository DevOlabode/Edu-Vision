const express= require('express');
const router = express.Router();

const controller = require('../../controllers/student/task');

const {isLoggedIn} = require('../../middleware');
const catchAsync = require('../../utils/catchAsync');

router.get('/new', isLoggedIn, catchAsync(controller.newTaskForm));

router.get('/', isLoggedIn, controller.allTasks);

router.post('/', isLoggedIn, catchAsync(controller.newTask));

module.exports = router;