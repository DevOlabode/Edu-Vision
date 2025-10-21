const express = require('express');
const router = express.Router();
const controller = require('../../controllers/student/material');
const upload = require('../../middleware/upload');
const { isLoggedIn } = require('../../middleware');

router.use(isLoggedIn);

router.post('/upload', upload.single('file'), controller.upload);
router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;