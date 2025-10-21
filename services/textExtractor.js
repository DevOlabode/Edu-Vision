const axios = require('axios');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

exports.extractText = async (filePath, type) => {
    const fs = require('fs');
    const buffer = fs.readFileSync(filePath);

    if (type === 'pdf') {
        const pdf = await pdfParse(buffer);
        return pdf.text;
    }
    if (type === 'docx' || type === 'doc') {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    }
    if (type === 'txt') {
        return buffer.toString('utf-8');
    }
    throw new Error('Unsupported file type');
};
