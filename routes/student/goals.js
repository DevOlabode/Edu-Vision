const express  = require('express');
const router = express.Router();

const controller = require('../../controllers/student/goals');

const {isLoggedIn} = require('../../middleware');
const catchAsync = require('../../utils/catchAsync')

router.get('/new', isLoggedIn, controller.newForm);

router.post('/', isLoggedIn, catchAsync(controller.savegoals));

router.get('/', isLoggedIn, catchAsync(controller.allGoals));

router.get('/:id', isLoggedIn, catchAsync(controller.showGoal));

router.get('/:id/edit', isLoggedIn, catchAsync(controller.editForm))

router.put('/:id', isLoggedIn, catchAsync(controller.edit));

router.delete('/:id', isLoggedIn, catchAsync(controller.deleteGoal));


// API endpoints for functionality
router.put('/:id/progress', isLoggedIn, catchAsync(controller.updateProgress));
router.post('/:id/milestones', isLoggedIn, catchAsync(controller.addMilestone));
router.put('/:id/milestones', isLoggedIn, catchAsync(controller.updateMilestone));
router.delete('/:id/milestones', isLoggedIn, catchAsync(controller.deleteMilestone));
router.patch('/:id/milestones/toggle', isLoggedIn, catchAsync(controller.toggleMilestone));
router.put('/:id/complete', isLoggedIn, catchAsync(controller.markComplete));
router.post('/:id/generate-plan', isLoggedIn, catchAsync(controller.regeneratePlan));

module.exports = router
