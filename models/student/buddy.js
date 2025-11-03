const mongoose = require('mongoose');
const { Schema } = mongoose

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
  requestStatus: { 
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
    required: true
  },
  relationshipStatus: { 
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
  }
}, { timestamps: true });

module.exports = mongoose.model('Buddymatch', BuddyMatchSchema);