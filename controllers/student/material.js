const Material = require('../../models/student/material');
const { extractText } = require('../../services/textExtractor');
const cloudinary = require('../../config/cloudinary');

const {summarizer} = require('../../AI/summarise')

// Upload
exports.upload = async (req, res) => {
        if (!req.file) {
            console.log('ERROR: No file uploaded');
            return res.status(400).json({ 
                success: false,
                error: 'No file uploaded' 
            });
        }

        if (!req.body.title) {
            console.log('ERROR: No title provided');
            try {
                await cloudinary.uploader.destroy(req.file.filename, { resource_type: 'auto' });
                console.log('Deleted file from Cloudinary due to missing title');
            } catch (deleteError) {
                console.error('Error deleting file from Cloudinary:', deleteError);
            }
            return res.status(400).json({ 
                success: false,
                error: 'Title is required' 
            });
        }

        const fileType = req.file.originalname.split('.').pop().toLowerCase();

        const material = new Material({
            title: req.body.title,
            fileName: req.file.originalname,
            fileType: fileType,
            fileSize: req.file.size,
            cloudinaryId: req.file.filename, // This is the public_id
            uploadedBy: req.user._id,
            status: 'processing'
        });

        await material.save();

        setImmediate(async () => {
                const localFilePath = req.file.path;
                const text = await extractText(localFilePath, fileType);

                const summary = summarizer(text);
                console.log(summary)

                await Material.findByIdAndUpdate(material._id, {
                    content: text,
                    status: 'ready'
                });
        });
        
        
        // Return response immediately
        res.status(201).json({
            success: true,
            material: {
                id: material._id,
                title: material.title,
                fileName: material.fileName,
                fileType: material.fileType,
                status: material.status
            },
            redirectUrl: `/upload/success/${material._id}`
        });
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

        res.json({ 
            success: true,
            materials, 
            total, 
            page: +page, 
            pages: Math.ceil(total / limit) 
        });
    } catch (error) {
        console.error('Get all materials error:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Get one
exports.getOne = async (req, res) => {
        const material = await Material.findOne({ 
            _id: req.params.id, 
            uploadedBy: req.user._id 
        });
        
        res.json({ 
            success: true,
            material 
        });
};

// Update
exports.update = async (req, res) => {
    try {
        const material = await Material.findOneAndUpdate(
            { _id: req.params.id, uploadedBy: req.user._id },
            { title: req.body.title },
            { new: true }
        );
        
        if (!material) {
            return res.status(404).json({ 
                success: false,
                error: 'Material not found' 
            });
        }
        
        res.json({ 
            success: true,
            material 
        });
    } catch (error) {
        console.error('Update material error:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Delete
exports.delete = async (req, res) => {
    try {
        const material = await Material.findOne({ 
            _id: req.params.id, 
            uploadedBy: req.user._id 
        });
        
        if (!material) {
            return res.status(404).json({ 
                success: false,
                error: 'Material not found' 
            });
        }

        // Delete from Cloudinary
        if (material.cloudinaryId) {
            await cloudinary.uploader.destroy(material.cloudinaryId, {
                resource_type: 'raw'
            });
            console.log('Deleted from Cloudinary:', material.cloudinaryId);
        }

        // Delete from database
        await material.deleteOne();
        console.log('Deleted from database:', material._id);

        req.flash('success', 'Deleted Material Successfully');
        res.redirect('/materials')
    } catch (error) {
        console.error('Delete material error:', error);
        req.flash('error', 'Encountered an error when trying to delete material')
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};