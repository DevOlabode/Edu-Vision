const openrouter = require('../utils/openrouterClient');

module.exports.summarizer = async (extractedText, flashcardCount = 5) => {
  const maxLength = 12000;
  let safeText = extractedText;
  if (extractedText.length > maxLength) {
    safeText = extractedText.slice(0, maxLength) + '\n[Content truncated for summary]';
  }
  const prompt = `
You are an academic assistant helping students study efficiently. Given the following document content, summarize it into clear, concise study notes.
Highlight key concepts, definitions, and important facts. Use bullet points and simple language suitable for a high school or university student.
At the end, generate ${flashcardCount} flashcards based on the content. Format flashcards as Q&A pairs, clearly separated from the notes.

Document:
${safeText}
  `;

  try {
    const response = await openrouter.post('/chat/completions', {
      model: 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    const content = response.data.choices[0].message.content;
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
