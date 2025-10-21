const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path = require('path');

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'eduvisionai',
        resource_type: 'raw',
        allowed_formats: ['pdf', 'doc', 'docx', 'txt']
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowed = /pdf|doc|docx|txt/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = ['application/pdf', 'application/msword', 
                     'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                     'text/plain'].includes(file.mimetype);
        
        ext && mime ? cb(null, true) : cb(new Error('Invalid file type'));
    }
});

module.exports = upload;