const express = require('express');
const router = express.Router();

const controller = require('../../controllers/student/dashboard');
const catchAsync = require('../../utils/catchAsync');
const { isLoggedIn } = require('../../middleware')

router.get('/', isLoggedIn, catchAsync(controller.mainDashboard));

module.exports = router;