const mongoose = require('mongoose');
const { Schema } = mongoose

// const goalSchema = new Schema({
//     title : {
//         type : String,
//         required : true,
//         trim : true
//     },
//     description : {
//         type : String,
//         trim : true
//     },
//     category : {
//         type :String,
//         enum : ['Acedamic']
//     }
// })

const goalSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    trim: true
  },

  category: {
    type: String,
    enum: ['Academic', 'Personal', 'Career', 'Health', 'Other'],
    default: 'Academic'
  },

  targetDate: {
    type: Date,
    required: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },

  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'abandoned'],
    default: 'not-started'
  },

  milestones: [
    {
      title: String,
      dueDate: Date,
      completed: { type: Boolean, default: false },
      notes: String
    }
  ],

  motivation: {
    type: String,
    trim: true
  },

  tips: [String],

  aiSuggestions: {
    type: [String],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);