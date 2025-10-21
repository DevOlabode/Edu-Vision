const axios = require('axios');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

exports.extractText = async (url, type) => {
    const { data } = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(data);
    
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