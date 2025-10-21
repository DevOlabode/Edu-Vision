const express = require('express');
const router = express.Router();
const pagesController = require('../controllers/pages');
const materialController = require('../controllers/student/material');
const { isLoggedIn } = require('../middleware');

router.get('/', pagesController.home);

router.get('/upload', isLoggedIn, pagesController.upload);

router.get('/upload/success/:id', isLoggedIn, pagesController.uploadSuccess);

router.get('/materials', isLoggedIn, pagesController.materials);

router.get('/materials/:id', isLoggedIn, pagesController.materialDetail);

router.delete('/materials/:id', isLoggedIn, materialController.delete);

module.exports = router;
