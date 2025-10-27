const express = require('express');
const router = express.Router();

const { isLoggedIn } = require('../../middleware');
const catchAsync = require('../../utils/catchAsync');

module.exports = router