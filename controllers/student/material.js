// const Material = require('../models/student/Material');

const Material = require('../../models/student/material');
const { extractText } = require('../../services/textExtractor');
const cloudinary = require('../../config/cloudinary');

// Upload
exports.upload = async (req, res) => {
    try {
        console.log('Upload request received');
        console.log('User:', req.user ? req.user._id : 'No user');
        console.log('File:', req.file ? req.file.originalname : 'No file');
        console.log('Title:', req.body.title);

        if (!req.user) {
            console.log('No user authenticated');
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!req.file) {
            console.log('No file uploaded');
            return res.status(400).json({ error: 'No file uploaded' });
        }
        if (!req.body.title) {
            console.log('No title provided');
            if (req.file) {
                await cloudinary.uploader.destroy(req.file.filename, { resource_type: 'raw' });
            }
            return res.status(400).json({ error: 'Title required' });
        }

        const fileType = req.file.originalname.split('.').pop().toLowerCase();
        console.log('File type:', fileType);

        const material = new Material({
            title: req.body.title,
            fileName: req.file.originalname,
            fileType,
            fileSize: req.file.size,
            cloudinaryId: req.file.filename,
            uploadedBy: req.user._id
        });

        await material.save();
        console.log('Material saved with ID:', material._id);

        // Extract text in background
        setTimeout(async () => {
            try {
                const text = await extractText(req.file.path, fileType);
                await Material.findByIdAndUpdate(material._id, { content: text, status: 'ready' });
                console.log('Text extraction completed for material:', material._id);
            } catch (err) {
                console.error('Text extraction failed for material:', material._id, err);
                await Material.findByIdAndUpdate(material._id, { status: 'error' });
            }
        }, 1000);

        console.log('Upload successful, redirecting to:', `/upload/success/${material._id}`);
        res.status(200).json({
            success: true,
            material: {
                id: material._id,
                title: material.title,
                fileName: material.fileName,
                status: material.status
            },
            redirectUrl: `/upload/success/${material._id}`
        });
    } catch (error) {
        console.error('Upload error:', error);
        console.error('Error stack:', error.stack);
        if (req.file) {
            try {
                await cloudinary.uploader.destroy(req.file.filename, { resource_type: 'raw' });
            } catch (cloudError) {
                console.error('Error deleting file from cloudinary:', cloudError);
            }
        }
        res.status(500).json({ error: error.message });
    }
};

// Get all
exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const materials = await Material.find({ uploadedBy: req.user._id })
            .select('-content')
            .sort('-createdAt')
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Material.countDocuments({ uploadedBy: req.user._id });

        res.json({ materials, total, page: +page, pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get one
exports.getOne = async (req, res) => {
    try {
        const material = await Material.findOne({ _id: req.params.id, uploadedBy: req.user._id });
        if (!material) return res.status(404).json({ error: 'Not found' });
        res.json(material);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update
exports.update = async (req, res) => {
    try {
        const material = await Material.findOneAndUpdate(
            { _id: req.params.id, uploadedBy: req.user._id },
            { title: req.body.title },
            { new: true }
        );
        if (!material) return res.status(404).json({ error: 'Not found' });
        res.json(material);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete
exports.delete = async (req, res) => {
    try {
        const material = await Material.findOne({ _id: req.params.id, uploadedBy: req.user._id });
        if (!material) return res.status(404).json({ error: 'Not found' });

        await cloudinary.uploader.destroy(material.cloudinaryId, { resource_type: 'raw' });
        await material.deleteOne();

        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
