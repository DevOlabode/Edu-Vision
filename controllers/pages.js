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
        res.render('student/uploadSuccess', { material });
    } catch (error) {
        req.flash('error', 'Something went wrong');
        res.redirect('/upload');
    }
};

exports.materials = async (req, res) => {
    try {
        const materials = await Material.find({ uploadedBy: req.user._id }).sort('-createdAt');
        res.render('student/materials', { materials });
    } catch (error) {
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
        res.render('student/materialDetail', { material });
    } catch (error) {
        req.flash('error', 'Something went wrong');
        res.redirect('/materials');
    }
};
