const openrouter = require('../utils/openrouterClient');

module.exports.summarizer = async (extractedText) => {
  const prompt = `
You are an academic assistant helping students study efficiently. Given the following document content, summarize it into clear, concise study notes.
Highlight key concepts, definitions, and important facts. Use bullet points and simple language suitable for a high school or university student.
If applicable, generate 3–5 flashcards at the end based on the content.

Document:
${extractedText}
  `;

  try {
    const response = await openrouter.post('/chat/completions', {
      model: 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    // console.log('Full response:', JSON.stringify(response.data, null, 2));
    const content = response.data.choices[0].message.content;
    // console.log('Content type:', typeof content);
    // console.log('Content value:', content);

    let summary;
    if (typeof content === 'string') {
      summary = content.trim();
    } else if (content === null || content === undefined) {
      summary = 'Summary generation failed: No content received.';
    } else {
      summary = 'Summary generation failed: Unexpected content type.';
    }
    return summary;

  } catch (error) {
    console.error('Summarizer error:', error.response?.data || error.message);
    return 'Summary generation failed.';
  }
};
