const express = require('express');
const router = express.Router();
const controller = require('../../controllers/student/material');
const upload = require('../../middleware/upload');
const { isLoggedIn } = require('../../middleware');

router.use(isLoggedIn);

// Add error handler for multer
router.post('/upload', (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.status(400).json({ 
                success: false,
                error: err.message 
            });
        }
        next();
    });
}, controller.upload);

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;