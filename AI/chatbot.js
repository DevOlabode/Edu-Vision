// chatbot/chatbotService.js
const openrouter = require('../utils/openrouterClient');

// Helper function to trim long text inputs
const getRecentSlice = (text, maxLength = 4000) => {
  return text.length > maxLength ? text.slice(-maxLength) : text;
};

module.exports.chatbot = async (question, content, summary) => {
  const trimmedContent = getRecentSlice(content, 4000);
  const trimmedSummary = getRecentSlice(summary, 2000);

  const messages = [
    {
      role: 'system',
      content: `You are a helpful study assistant. A file as been uploaded and you are given the content and summary of the file.  Answer questions about the material based on the provided content and summary. Be concise, accurate, and helpful for students.Do not return in markdonw or list. Just plain text`
    },
    {
      role: 'user',
      content: `Material Summary:\n${trimmedSummary}`
    },
    {
      role: 'user',
      content: `Material Content:\n${trimmedContent}`
    },
    {
      role: 'user',
      content: `Question:\n${question}`
    }
  ];

  try {
    const response = await openrouter.post('/chat/completions', {
      model: 'openai/gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 300
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Chatbot error:', error.response?.data || error.message);
    return 'Sorry, I could not answer that question right now.';
  }
};