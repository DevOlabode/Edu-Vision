const openrouter = require('../utils/openrouterClient');

module.exports.summarizer = async (extractedText) => {
  const prompt = `
You are an academic assistant helping students study efficiently.
Given the following document, generate a structured summary in **valid JSON** format.

The JSON object MUST have this structure:
{
  "studyNotes": [
    "bullet point 1",
    "bullet point 2",
    "bullet point 3"
  ],
  "flashcards": [
    {
      "question": "Question text",
      "answer": "Answer text"
    }
  ]
}

Guidelines:
- Study notes should be concise and factual.
- Flashcards should test key concepts or definitions.
- Return ONLY a JSON object. No additional text, explanation, or commentary.

Document:
${extractedText}
  `;

  try {
    const response = await openrouter.post('/chat/completions', {
      model: 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    const raw = response.data.choices[0].message.content.trim();

    // Ensure valid JSON output (in case the model adds code fences)
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/```$/, '')
      .trim();

    const json = JSON.parse(cleaned);
    return json; // returns { studyNotes: [...], flashcards: [...] }

  } catch (error) {
    console.error('Summarizer error:', error.response?.data || error.message);
    return {
      studyNotes: ['Summary generation failed.'],
      flashcards: []
    };
  }
};
