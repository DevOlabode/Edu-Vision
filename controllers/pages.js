const Material = require('../models/student/material');
const Notifications = require('../models/notification');

exports.home = (req, res)=>{
    res.render('shared/home');
};

exports.upload = (req, res)=>{
    res.render('student/upload/upload');
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

        res.render('student/upload/uploadSuccess', { material: materialPlain });
    } catch (error) {
        console.error('Upload success page error:', error);
        req.flash('error', 'Something went wrong');
        res.redirect('/upload');
    }
};

exports.materials = async (req, res) => {
    try {
        const materials = await Material.find({ uploadedBy: req.user._id }).sort('-createdAt');

        res.render('student/material/materials', { materials });
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

        // Handle summary data - it should be a string from the AI summarizer
        if (typeof materialPlain.summary !== 'string') {
            materialPlain.summary = 'Summary not available';
            materialPlain.studyNotes = [];
            materialPlain.flashcards = [];
        } else {
            // Parse the summary to separate study notes and flashcards
            const lines = materialPlain.summary.split('\n');
            const studyNotes = [];
            const flashcards = [];
            let inFlashcards = false;

            for (const line of lines) {
                if (line.toLowerCase().includes('flashcard') || line.toLowerCase().includes('card')) {
                    inFlashcards = true;
                    continue; // Skip the header line
                }
                if (inFlashcards) {
                    // Parse Q&A format: "Q: Question? A: Answer" or similar
                    if (line.trim()) {
                        flashcards.push(line.trim());
                    }
                } else {
                    studyNotes.push(line);
                }
            }

            materialPlain.studyNotes = studyNotes.join('\n');

            // Parse flashcards into Q&A pairs
            const parsedFlashcards = [];
            let currentCard = null;

            // console.log('Raw flashcards lines:', flashcards);

            flashcards.forEach((line, index) => {
                const trimmedLine = line.trim();
                if (!trimmedLine) return; // Skip empty lines

                // Look for question markers
                if (trimmedLine.toLowerCase().includes('q:') ||
                    trimmedLine.toLowerCase().includes('question') ||
                    trimmedLine.match(/^\d+\./) ||
                    (trimmedLine.includes('?') && !currentCard)) {

                    // Save previous card if exists
                    if (currentCard && currentCard.question) {
                        parsedFlashcards.push(currentCard);
                    }

                    // Start new card
                    currentCard = {
                        question: trimmedLine.replace(/^(q:|question\s*)/i, '').trim(),
                        answer: '',
                        id: `card-${parsedFlashcards.length}`
                    };
                } else if (currentCard && (trimmedLine.toLowerCase().includes('a:') || trimmedLine.toLowerCase().includes('answer'))) {
                    // This is the answer
                    currentCard.answer = trimmedLine.replace(/^(a:|answer\s*)/i, '').trim();
                } else if (currentCard) {
                    // Continue adding to current answer or question
                    if (currentCard.answer || currentCard.question.includes('?')) {
                        currentCard.answer += (currentCard.answer ? ' ' : '') + trimmedLine;
                    } else {
                        currentCard.question += (currentCard.question ? ' ' : '') + trimmedLine;
                    }
                } else if (!currentCard) {
                    // If no current card and line looks like a question, start one
                    currentCard = {
                        question: trimmedLine,
                        answer: '',
                        id: `card-${parsedFlashcards.length}`
                    };
                }
            });

            // Add the last card
            if (currentCard && currentCard.question) {
                parsedFlashcards.push(currentCard);
            }

            // console.log('Parsed flashcards:', parsedFlashcards);
            materialPlain.flashcards = parsedFlashcards;
        }

        res.render('student/material/materialDetail', { material: materialPlain });
    } catch (error) {
        console.error('Material detail error:', error);
        req.flash('error', 'Something went wrong');
        res.redirect('/materials');
    }
};

exports.notifications = async (req, res) => {
    try {
        const notifications = await Notifications.find({ userId: req.user._id }).sort('-createdAt');
        res.render('student/notifications', { notifications });
    } catch (error) {
        console.error('Notifications page error:', error);
        req.flash('error', 'Something went wrong');
        res.redirect('/');
    }
};
