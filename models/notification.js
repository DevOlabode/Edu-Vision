const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['material', 'task', 'goals', 'goal', 'buddy-request','buddy-accept', 'buddy-reject', 'reminder', 'achievement', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  link: {
    type: String
  },
  icon: {
    type: String,
    default: '🔔'
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  buddyMatchId: {
    type : Schema.Types.ObjectId,
    ref : 'Buddymatch',
    default : null
  },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);