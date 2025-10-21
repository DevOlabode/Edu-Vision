const openrouter = require('../utils/openrouterClient');

module.exports.summarizer = async (extractedText) => {
  const prompt = `
You are an academic assistant helping students study efficiently. Given the following document content, summarize it into clear, concise study notes.
Highlight key concepts, definitions, and important facts. Use bullet points and simple language suitable for a high school or university student.
If applicable, generate 3–5 flashcards at the end based on the content.

Document:
${extractedText}
  `;

  const response = await openrouter.post('/chat/completions', {
    model: 'openai/gpt-3.5-turbo', // You can change this to other models like 'openai/gpt-4' or 'meta-llama/llama-3-8b'
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7
  });

  const answer = response.data.choices[0].message.content;
  return answer;
};