const User = require('../../models/user');
const BuddyMatch = require('../../models/student/buddy');
const Notification = require('../../models/notification');

const findStudyBuddy = async(currentUserId)=>{
  const currentUser = await User.findById(currentUserId);
  const { studyPreferences } = currentUser
  const {goals, availability, subjects} = studyPreferences;

  const candidates = await User.find({
    _id : {$ne : currentUserId},
    buddies : { $ne : currentUserId},
    'studyPreferences.subjects' : {$in : subjects},
    'studyPreferences': { $exists: true },
    'studyPreferences.availability': { $in: availability },
  });

  if(!candidates.length) return null;

  return candidates;
}

module.exports.findStudyBuddy = findStudyBuddy;

module.exports.findMatch = (req, res) => {
  res.render('student/buddyMatch/index', { title: 'Find Study Buddy' });
};

module.exports.findBuddy = async (req, res) => {
  try {
    const userId = req.user._id;
    const candidates = await findStudyBuddy(userId);

    if (!candidates || candidates.length === 0) {
      return res.status(404).json({ message: 'No Suitable Buddy Found' });
    }

    res.status(200).send({ message: 'Buddy Request Sent!', candidates });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSharedGoals = (sender, receiver) => {
  const senderGoals = sender.studyPreferences.goals || [];
  const receiverGoals = receiver.studyPreferences.goals || [];

  const sharedGoals = senderGoals.filter(goal => receiverGoals.includes(goal));
  return sharedGoals;
};

module.exports.sendBuddyRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.body; // Plain text body

    if (!receiverId) {
      req.flash('error', 'Buddy ID is required');
      return res.redirect('/buddy-match');
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      req.flash('error', 'Invalid sender or receiver');
      return res.redirect('/buddy-match');
    }

    const existingRequest = await BuddyMatch.findOne({
      $or: [
        { sender: senderId, reciever: receiverId },
        { sender: receiverId, reciever: senderId }
      ]
    });

    if (existingRequest) {
      req.flash('error', 'Buddy Request Already Sent or Received');
      return res.redirect('/buddy-match');
    }

    const sharedGoals = getSharedGoals(sender, receiver);

    const newRequest = new BuddyMatch({
      sender: senderId,
      reciever: receiverId,
      requestStatus: 'pending',
      relationshipStatus: 'pending',
      compatibilityScore: Math.floor(Math.random() * 101),
      sharedGoals: sharedGoals,
      matchedOn: new Date()
    });

    await newRequest.save();
    
    const notificationService = require('../../services/notificationService');
    await notificationService.createNotification({
      userId: receiverId,
      type: 'buddy-request',
      title: '🤝 New Buddy Request',
      message: `${sender.username} has sent you a buddy request!`,
      link: `/buddy-match/requests`,
      icon: '✨',
      buddyMatchId: newRequest._id
    });

    req.flash('success', 'Buddy Request Sent Successfully');
    res.redirect('/buddy-match');
  } catch (err) {
    console.error('Error sending buddy request:', err);
    req.flash('error', 'Something went wrong while sending the request');
    res.redirect('/buddy-match');
  }
};

module.exports.acceptRequest = async(req, res)=>{
  const notification = req.params.id;

  if(!notification && notification.type !== 'buddy-request'){
    req.flash('error', 'Invalid buddy request notification.');
    return res.redirect('/notifications');
  };

  console.log(notification);

  console.log('reciever', notification.userId);

  const buddyMatch = await BuddyMatch.findOne({
    sender : req.user._id,
    reciever : notification.userId,
    requestStatus : 'pending' 
  });

  console.log(buddyMatch);

  if (buddyMatch) {
    buddyMatch.requestStatus = 'accepted';
    buddyMatch.relationshipStatus = 'active';
    await buddyMatch.save();
    notification.read = true;
    await notification.save();
    req.flash('success', 'Buddy request accepted!');
    res.status(200).json({msg : 'Accepted Buddy Request'});
  }else{
    res.status(404).json({message: 'No pending buddy request found.'});
  }
};

module.exports.declineRequest = async(req, res)=>{
  const notification = await Notification.findById(req.params.id);
  if (!notification || notification.type !== 'buddy-request') {
    req.flash('error', 'Invalid buddy request.');
    return res.redirect('/profile');
  }

  const buddyMatch = await BuddyMatch.findOne({
    sender: notification.link,
    reciever: req.user._id,
    requestStatus: 'pending'
  });

  if (buddyMatch) {
    buddyMatch.requestStatus = 'rejected';
    buddyMatch.relationshipStatus = 'ended';
    await buddyMatch.save();
    notification.read = true;
    await notification.save();
    req.flash('info', 'Buddy request declined.');
  }

  res.redirect('/profile');
};