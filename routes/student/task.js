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

router.get('/:id/milestone/:milestoneId/note', isLoggedIn, catchAsync(controller.getMilestoneNote));
router.post('/:id/milestone/:milestoneId/note', isLoggedIn, catchAsync(controller.saveMilestoneNote));

router.get('/:id/edit', isLoggedIn, controller.editForm);

router.put('/:id', isLoggedIn, catchAsync(controller.edit));

router.delete('/:id', isLoggedIn, catchAsync(controller.delete));

router.post('/:id/description', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const { description } = req.body;
    const task = await controller.Task.findById(id);
    if (!task) return res.status(404).send('Task not found');
    task.description = description;
    await task.save();
    res.status(200).send('Description updated');
}));



module.exports = router;
