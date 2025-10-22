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
    enum: ['homework', 'project', 'exam', 'quiz', 'assignment'],
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
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
