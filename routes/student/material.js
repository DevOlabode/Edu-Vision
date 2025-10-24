const express = require('express');
const router = express.Router();
const controller = require('../../controllers/student/material');
const upload = require('../../middleware/upload');
const { isLoggedIn } = require('../../middleware');

// router.use(isLoggedIn);

// Add error handler for multer
router.post('/upload', isLoggedIn,  (req, res, next) => {
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

// Google Drive upload route
router.post('/upload/drive', isLoggedIn, controller.uploadFromDrive);

router.get('/', isLoggedIn, controller.getAll);
router.get('/:id', isLoggedIn, controller.getOne);
router.get('/:id/flashcards', isLoggedIn, controller.getFlashcards);
router.put('/:id', isLoggedIn,  controller.update);

// Add route for materials page
router.get('/materials', isLoggedIn, async (req, res) => {
        const Material = require('../../models/student/material');
        const materials = await Material.find({ uploadedBy: req.user._id }).sort('-createdAt');
        res.render('materials', { materials });
});

module.exports = router;