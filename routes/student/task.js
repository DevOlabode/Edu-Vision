const express= require('express');
const router = express.Router();

const controller = require('../../controllers/student/task');

const {isLoggedIn} = require('../../middleware');
const catchAsync = require('../../utils/catchAsync')

router.get('/', isLoggedIn, controller.allTasks);
router.get('/new', isLoggedIn, catchAsync(controller.newTaskForm));

module.exports = router;