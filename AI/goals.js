const openrouter = require('../utils/openrouterClient');

module.exports.goalPlanner = async (description, title, category, motivation, milestoneCount = 6) => {
  const maxLength = 6000;
  let safeGoal = description;
  if (description.length > maxLength) {
    safeGoal = description.slice(0, maxLength) + '\n[Goal description truncated]';
  }

  const prompt = `
You are an academic assistant helping students plan and achieve their goals. Given the goal title, goal description, category and motivation, return a JSON object with the following structure:

{
  "overview": "Brief summary of the goal",
  "suggestedPlan": [
    "Step 1: Description (Purpose: Reason) - Deadline: YYYY-MM-DD",
    ...
  ],
  "studyTips": [
    "Tip 1",
    "Tip 2",
    ...
  ],
  "estimatedTime": "Estimated time in hours",
  "motivation": "Encouraging message"
}

Use simple, motivating language suitable for high school or university students. Format all dates as YYYY-MM-DD. Include ${milestoneCount} steps in the suggestedPlan.

Goal:
${safeGoal}
${title}
${category}
${motivation}
`;

  try {
    const response = await openrouter.post('/chat/completions', {
      model: 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    const content = response.data.choices[0].message.content;

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      console.error('JSON parsing error:', err);
      return {
        error: 'AI response was not valid JSON',
        raw: content
      };
    }

    return parsed;

  } catch (error) {
    console.error('Goal planner error:', error.response?.data || error.message);
    return { error: 'Goal planning failed.' };
  }
};