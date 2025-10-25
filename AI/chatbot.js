const openrouter = require('../utils/openrouterClient');

module.exports.chatbot = async (question, content, summary) => {
  const prompt = `
You are a helpful study assistant. Answer questions about the material based on the provided content and summary.
Be concise, accurate, and helpful for students.

Material Summary: ${summary}

Material Content: ${content}

Question: ${question}

Answer:
  `;

  try {
    const response = await openrouter.post('/chat/completions', {
      model: 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 300
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Chatbot error:', error.response?.data || error.message);
    return 'Sorry, I could not answer that question right now.';
  }
};
