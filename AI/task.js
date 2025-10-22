const openrouter = require('../utils/openrouterClient');

module.exports.taskPlanner = async (
  title,
  subject,
  type,
  dueDate,
  priority,
  difficulty,
  description
) => {
  // Inject variables into the prompt template
  const prompt = `
You are an intelligent academic planner helping students organize their school work effectively.

You will receive details about a student's assignment, project, exam, or quiz.

Your job is to analyze the input and return a structured JSON object containing:

{
  "overview": "A short 2–3 sentence overview summarizing the work and its importance.",
  "suggestedPlan": [
    "Step-by-step actions the student should take to complete it efficiently.",
    "Each step should have a purpose and logical order."
  ],
  "studyTips": [
    "Personalized, practical study or focus tips based on the subject and difficulty level."
  ],
  "estimatedTime": "Estimated total time (in hours) to complete or study for this work.",
  "motivation": "Encouraging or motivational sentence tailored to the type of work (e.g., exams → stay calm, projects → focus on milestones)."
}

Guidelines:
- Respond ONLY with valid JSON.
- Make suggestions specific to the type (homework/project/exam/quiz).
- If the task is a project, break down the plan into milestones with target dates before the due date.
- Use simple, motivational language suitable for high school or college students.

---

Assignment Details:
Title: ${title}
Subject/Course: ${subject}
Type: ${type}
Due Date: ${dueDate}
Priority: ${priority}
Difficulty: ${difficulty}
Description: ${description || "No description provided"}
  `;

  try {
    const response = await openrouter.post('/chat/completions', {
      model: 'openai/gpt-4o-mini', // or any model you prefer
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const raw = response.data.choices[0].message.content.trim();

    // Clean up code fences or stray formatting if present
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```/, '')
      .replace(/```$/, '')
      .trim();

    // Parse and return JSON
    const json = JSON.parse(cleaned);

    return json;
  } catch (error) {
    console.error('Task Planner AI Error:', error.response?.data || error.message);

    // Fallback response if AI fails
    return {
      overview: 'Unable to generate AI plan at this moment.',
      suggestedPlan: [],
      studyTips: [],
      estimatedTime: 'N/A',
      motivation: 'Keep up the great work!',
    };
  }
};
