const Material = require('../../models/student/material');
const { extractText } = require('../../services/textExtractor');
const cloudinary = require('../../config/cloudinary');

// Upload
exports.upload = async (req, res) => {
    try {
        console.log('=== UPLOAD REQUEST STARTED ===');
        console.log('User authenticated:', req.user ? 'Yes' : 'No');
        console.log('User ID:', req.user ? req.user._id : 'No user');
        console.log('File received:', req.file ? 'Yes' : 'No');
        
        if (!req.user) {
            console.log('ERROR: No user authenticated');
            return res.status(401).json({ 
                success: false,
                error: 'Authentication required' 
            });
        }

        if (!req.file) {
            console.log('ERROR: No file uploaded');
            return res.status(400).json({ 
                success: false,
                error: 'No file uploaded' 
            });
        }

        console.log('File details:', {
            originalname: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size
        });

        if (!req.body.title) {
            console.log('ERROR: No title provided');
            // Delete from Cloudinary if title is missing
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
        console.log('File type detected:', fileType);

        // Create material document
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
        console.log('Material saved to database with ID:', material._id);

        // Extract text in background (don't wait for it)
        // Use setImmediate instead of setTimeout for better performance
        setImmediate(async () => {
            try {
                // Store the local file path before Cloudinary overwrites it
                const localFilePath = req.file.path;
                const text = await extractText(localFilePath, fileType);

                await Material.findByIdAndUpdate(material._id, {
                    content: text,
                    status: 'ready'
                });
            } catch (err) {
                await Material.findByIdAndUpdate(material._id, {
                    status: 'error'
                });
            }
        });

        console.log('=== UPLOAD SUCCESSFUL ===');
        console.log('Sending response...');
        
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

    } catch (error) {
        console.error('=== UPLOAD ERROR ===');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Cleanup: Delete from Cloudinary if upload failed
        if (req.file && req.file.filename) {
            try {
                await cloudinary.uploader.destroy(req.file.filename, { resource_type: 'auto' });
                console.log('Cleaned up file from Cloudinary after error');
            } catch (deleteError) {
                console.error('Error cleaning up file from Cloudinary:', deleteError);
            }
        }
        
        res.status(500).json({ 
            success: false,
            error: error.message || 'Upload failed'
        });
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
        
        res.json({ 
            success: true,
            material 
        });
    } catch (error) {
        console.error('Get material error:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
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
                resource_type: 'auto' // Changed from 'raw' to 'auto'
            });
            console.log('Deleted from Cloudinary:', material.cloudinaryId);
        }

        // Delete from database
        await material.deleteOne();
        console.log('Deleted from database:', material._id);

        res.json({ 
            success: true,
            message: 'Material deleted successfully' 
        });
    } catch (error) {
        console.error('Delete material error:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};