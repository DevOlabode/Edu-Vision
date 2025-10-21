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

// Add route for materials page
router.get('/materials', async (req, res) => {
    try {
        const Material = require('../../models/student/material');
        const materials = await Material.find({ uploadedBy: req.user._id }).sort('-createdAt');
        res.render('materials', { materials });
    } catch (error) {
        req.flash('error', 'Something went wrong');
        res.redirect('/');
    }
});

module.exports = router;