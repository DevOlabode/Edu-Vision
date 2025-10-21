const axios = require('axios');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

exports.extractText = async (fileUrl, type) => {
    try {
        console.log('Extracting text from file:', fileUrl);
        console.log('File type:', type);

        // Download the file from Cloudinary URL
        const response = await axios.get(fileUrl, {
            responseType: 'arraybuffer'
        });
        const buffer = Buffer.from(response.data);
        console.log('Downloaded file, buffer size:', buffer.length);

        if (type === 'pdf') {
            console.log('Parsing PDF...');
            const pdf = await pdfParse(buffer);
            console.log('PDF parsed successfully, text length:', pdf.text.length);
            return pdf.text;
        }
        
        if (type === 'docx' || type === 'doc') {
            console.log('Parsing DOCX...');
            const result = await mammoth.extractRawText({ buffer });
            console.log('DOCX parsed successfully, text length:', result.value.length);
            return result.value;
        }
        
        if (type === 'txt') {
            console.log('Parsing TXT...');
            const text = buffer.toString('utf-8');
            console.log('TXT parsed successfully, text length:', text.length);
            return text;
        }
        
        throw new Error('Unsupported file type: ' + type);
    } catch (error) {
        console.error('Text extraction error:', error);
        throw new Error(`Failed to extract text: ${error.message}`);
    }
};