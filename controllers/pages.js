const Material = require('../models/student/material');

exports.home = (req, res)=>{
    res.render('shared/home');
};

exports.upload = (req, res)=>{
    res.render('student/upload');
};

exports.uploadSuccess = async (req, res) => {
    try {
        const material = await Material.findOne({ _id: req.params.id, uploadedBy: req.user._id });
        if (!material) {
            req.flash('error', 'Material not found');
            return res.redirect('/upload');
        }

        // Convert to plain object and handle legacy summary data (string format) and ensure summary is an object
        const materialPlain = material.toObject();
        if (typeof materialPlain.summary === 'string') {
            try {
                const parsed = JSON.parse(materialPlain.summary);
                materialPlain.summary = parsed;
            } catch (e) {
                materialPlain.summary = { studyNotes: ['Legacy summary data'], flashcards: [] };
            }
        } else if (!materialPlain.summary || typeof materialPlain.summary !== 'object') {
            materialPlain.summary = { studyNotes: [], flashcards: [] };
        }

        res.render('student/uploadSuccess', { material: materialPlain });
    } catch (error) {
        console.error('Upload success page error:', error);
        req.flash('error', 'Something went wrong');
        res.redirect('/upload');
    }
};

exports.materials = async (req, res) => {
    try {
        const materials = await Material.find({ uploadedBy: req.user._id }).sort('-createdAt');

        res.render('student/materials', { materials });
    } catch (error) {
        console.error('Materials page error:', error);
        req.flash('error', 'Something went wrong');
        res.redirect('/');
    }
};

exports.materialDetail = async (req, res) => {
    try {
        const material = await Material.findOne({ _id: req.params.id, uploadedBy: req.user._id });
        if (!material) {
            req.flash('error', 'Material not found');
            return res.redirect('/materials');
        }

        // Convert to plain object
        const materialPlain = material.toObject();
        console.log('Material summary type:', typeof materialPlain.summary);
        console.log('Material summary value:', materialPlain.summary);

        // Handle summary data - it should be a string from the AI summarizer
        if (typeof materialPlain.summary !== 'string') {
            materialPlain.summary = 'Summary not available';
        }

        res.render('student/materialDetail', { material: materialPlain });
    } catch (error) {
        console.error('Material detail error:', error);
        req.flash('error', 'Something went wrong');
        res.redirect('/materials');
    }
};
