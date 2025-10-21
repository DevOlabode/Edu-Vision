const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path = require('path');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Generate unique filename
        const fileExtension = path.extname(file.originalname).substring(1);
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        
        return {
            folder: 'eduvisionai',
            resource_type: 'auto', // Changed from 'raw' to 'auto'
            access_mode: 'public', // Make files publicly accessible
            public_id: uniqueName,
            format: fileExtension
        };
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        console.log('File filter - checking file:', file.originalname);
        console.log('File mimetype:', file.mimetype);
        
        const allowed = /pdf|doc|docx|txt/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = [
            'application/pdf', 
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
            'text/plain'
        ].includes(file.mimetype);
        
        if (ext && mime) {
            console.log('File accepted');
            cb(null, true);
        } else {
            console.log('File rejected - invalid type');
            cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
        }
    }
});

// Error handling middleware
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File size too large. Maximum 10MB allowed.'
            });
        }
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }
    
    if (err) {
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }
    
    next();
};

module.exports = upload;
module.exports.handleUploadError = handleUploadError;