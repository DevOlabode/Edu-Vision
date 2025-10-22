const express= require('express');
const router = express.Router();

const controller = require('../../controllers/student/task');

const {isLoggedIn} = require('../../middleware');
const catchAsync = require('../../utils/catchAsync');

router.get('/new', isLoggedIn, controller.newTaskForm);

router.get('/', isLoggedIn, controller.allTasks);

router.post('/', isLoggedIn, catchAsync(controller.newTask));

router.get('/:id', isLoggedIn, catchAsync(controller.showTask));

router.post('/:id/milestone', isLoggedIn, catchAsync(controller.addMilestone));

router.post('/:id/milestone/:milestoneIndex/toggle', isLoggedIn, catchAsync(controller.toggleMilestone));

router.delete('/:id', isLoggedIn, catchAsync(controller.delete));

module.exports = router;
