const Material = require('../../models/student/material');
const { extractText } = require('../../services/textExtractor');
const cloudinary = require('../../config/cloudinary');
const { google } = require('googleapis');

const {summarizer} = require('../../AI/summarise')
const {chatbot} = require('../../AI/chatbot')

// Upload
exports.upload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        if (!req.body.title) {
            try {
                await cloudinary.uploader.destroy(req.file.filename, { resource_type: 'auto' });
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

        const materialId = material._id;

        setImmediate(async () => {
            try {
                const localFilePath = req.file.path;
                const text = await extractText(localFilePath, fileType);

                const summary = await summarizer(text);


                await Material.findByIdAndUpdate(materialId, {
                    content: text,
                    summary: summary,
                    status: 'ready'
                });

            } catch (error) {
                console.error('Processing error:', error);
                await Material.findByIdAndUpdate(materialId, { status: 'error' });
            }
        });


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
        console.error('Upload error:', error);
        return res.status(500).json({ success: false, error: error.message });
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

// Upload from Google Drive
exports.uploadFromDrive = async (req, res) => {
    try {
        const { title, fileId } = req.body;

        if (!title || !fileId) {
            return res.status(400).json({
                success: false,
                error: 'Title and file ID are required'
            });
        }

        // Check if user has Google tokens
        if (!req.user.googleAccessToken) {
            return res.status(401).json({
                success: false,
                error: 'Google Drive access not authorized'
            });
        }

        // Set up Google Drive API
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({
            access_token: req.user.googleAccessToken,
            refresh_token: req.user.googleRefreshToken
        });

        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        // Get file metadata
        const fileMetadata = await drive.files.get({
            fileId: fileId,
            fields: 'name, size, mimeType'
        });

        const mimeType = fileMetadata.data.mimeType;
        let fileType;

        if (mimeType === 'application/pdf') {
            fileType = 'pdf';
        } else if (mimeType === 'text/plain') {
            fileType = 'txt';
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            fileType = 'docx';
        } else {
            return res.status(400).json({
                success: false,
                error: 'Unsupported file type'
            });
        }

        // Download file from Google Drive
        const response = await drive.files.get({
            fileId: fileId,
            alt: 'media'
        }, { responseType: 'stream' });

        // Upload to Cloudinary
        const cloudinaryUpload = cloudinary.uploader.upload_stream(
            {
                resource_type: 'raw',
                public_id: `drive_${fileId}_${Date.now()}`,
                folder: 'materials'
            },
            async (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json({ success: false, error: 'Upload failed' });
                }

                // Save material to database
                const material = new Material({
                    title: title,
                    fileName: fileMetadata.data.name,
                    fileType: fileType,
                    fileSize: parseInt(fileMetadata.data.size),
                    cloudinaryId: result.public_id,
                    uploadedBy: req.user._id,
                    status: 'processing'
                });

                await material.save();
                const materialId = material._id;

                // Process file asynchronously
                setImmediate(async () => {
                    try {
                        // Extract text from Cloudinary URL
                        const cloudinaryUrl = result.secure_url;
                        const text = await extractText(cloudinaryUrl, fileType);
                        const summary = await summarizer(text);

                        await Material.findByIdAndUpdate(materialId, {
                            content: text,
                            summary: summary,
                            status: 'ready'
                        });
                    } catch (error) {
                        console.error('Processing error:', error);
                        await Material.findByIdAndUpdate(materialId, { status: 'error' });
                    }
                });

                // Return response
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
            }
        );

        response.data.pipe(cloudinaryUpload);

    } catch (error) {
        console.error('Google Drive upload error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};



// Get Flashcards
exports.getFlashcards = async (req, res) => {
    try {
        const { id } = req.params;
        const { count = 5 } = req.query;

        const material = await Material.findOne({
            _id: id,
            uploadedBy: req.user._id
        });

        if (!material) {
            return res.status(404).json({
                success: false,
                error: 'Material not found'
            });
        }

        // Use summary for flashcard generation
        const text = material.summary || '';
        if (!text || text.trim().length === 0) {
            return res.json({
                success: true,
                flashcards: []
            });
        }

        const flashcards = await summarizer(text, parseInt(count));

        // Extract flashcards from summary (assume Q&A pairs)
        const flashcardSection = flashcards.split(/flashcards/i)[1] || flashcards;
        const extractedFlashcards = flashcardSection.match(/Q:.*?A:.*?(?=Q:|$)/gs) || [];

        console.log('Generated flashcards:', extractedFlashcards.length, 'cards');

        res.json({
            success: true,
            flashcards: extractedFlashcards
        });
    } catch (error) {
        console.error('Get flashcards error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate flashcards. Please try again later.'
        });
    }
};

// Chatbot
exports.chat = async (req, res) => {
        const { id } = req.params;
        const { question } = req.body;

        const material = await Material.findOne({
            _id: id,
            uploadedBy: req.user._id
        });

        if (!material) {
            return res.status(404).json({
                success: false,
                error: 'Material not found'
            });
        }

        const answer = await chatbot(question, material.content, material.summary);

        res.json({
            success: true,
            answer: answer
        });
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
            // console.log('Deleted from Cloudinary:', material.cloudinaryId);
        }

        // Delete from database
        await material.deleteOne();
        // console.log('Deleted from database:', material._id);

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
