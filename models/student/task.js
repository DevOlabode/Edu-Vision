const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Homework', 'Project', 'Exam', 'Quiz', 'Assignment'],
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  description: String,

  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },

  // For projects (optional)
  milestones: [
    {
      title: String,
      dueDate: Date,
      completed: { type: Boolean, default: false },
      notes : String
    },
  ], 

  // For progress tracking
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'overdue'],
    default: 'pending',
  },

  // Link to student
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // 🧠 Smart Planner Feature
  planner: {
    overview: String,
    suggestedPlan: [String],
    studyTips: [String],
    estimatedTime: String,
    motivation: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);