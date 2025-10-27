const mongoose = require('mongoose');
const { Schema } = mongoose;

const BuddyMatchSchema = new Schema({
  userA: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userB: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matchedOn: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'ended'],
    default: 'pending'
  },
  compatibilityScore: {
    type: Number,
    min: 0,
    max: 100
  },
  sharedGoals: {
    type: [String],
    default: []
  },
  lastInteraction: {
    type: Date
  },
  notes: {
    type: String
  },
});

module.exports = mongoose.model('BuddyMatch', BuddyMatchSchema);