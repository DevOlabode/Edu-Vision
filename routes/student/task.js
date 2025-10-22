const express= require('express');
const router = express.Router();
const controller = require('../../controllers/student/task');
const {isLoggedIn} = require('../../middleware')

router.get('/', isLoggedIn, controller.allTasks);
router.get('/new', isLoggedIn, controller.newTaskForm);

module.exports = router;