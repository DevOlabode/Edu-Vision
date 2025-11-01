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

    // Handle insufficient credits error
    if (error.response?.status === 402 || error.response?.data?.error?.code === 402) {
      return {
        error: 'AI service temporarily unavailable due to insufficient credits. Please try again later or contact support.',
        fallback: true,
        overview: "Goal planning assistance is currently unavailable.",
        suggestedPlan: [
          "Step 1: Define your goal clearly - Deadline: Set a reasonable deadline",
          "Step 2: Break down into smaller tasks - Deadline: Within 1 week",
          "Step 3: Create a study schedule - Deadline: Within 2 weeks",
          "Step 4: Gather necessary resources - Deadline: Within 3 weeks",
          "Step 5: Start working on first milestone - Deadline: Within 4 weeks",
          "Step 6: Review progress and adjust plan - Deadline: Ongoing"
        ],
        studyTips: [
          "Set specific, measurable goals",
          "Break large tasks into smaller, manageable steps",
          "Create a consistent study schedule",
          "Track your progress regularly",
          "Stay motivated by celebrating small wins",
          "Don't hesitate to ask for help when needed"
        ],
        estimatedTime: "Varies based on goal complexity",
        motivation: "Remember that every expert was once a beginner. Stay consistent and you'll achieve your goals!"
      };
    }

    return { error: 'Goal planning failed. Using basic template instead.', fallback: true };
  }
};