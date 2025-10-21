const axios = require('axios');
const mammoth = require('mammoth');

exports.extractText = async (fileUrl, type) => {
    try {
        // Download the file from URL
        const response = await axios.get(fileUrl, {
            responseType: 'arraybuffer'
        });
        const buffer = Buffer.from(response.data);

        if (type === 'pdf') {
            const pdfParse = require('pdf-parse');
            const pdf = await pdfParse(buffer);
            return pdf.text;
        }

        if (type === 'docx' || type === 'doc') {
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        }

        if (type === 'txt') {
            const text = buffer.toString('utf-8');
            return text;
        }

        throw new Error('Unsupported file type: ' + type);
    } catch (error) {
        throw new Error(`Failed to extract text: ${error.message}`);
    }
};
