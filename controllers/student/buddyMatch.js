const User = require('../../models/user');
const BuddyMatch = require('../../models/student/buddy');

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
  const senderGoals = sender.studyPreferences?.goals || [];
  const receiverGoals = receiver.studyPreferences?.goals || [];

  const sharedGoals = senderGoals.filter(goal => receiverGoals.includes(goal));
  return sharedGoals;
};

module.exports.sendBuddyRequest = async (req, res) => {
  const senderId = req.user._id;
  const receiverId = req.body;

  if(!receiverId){
    req.flash('error', 'Budddy ID is required');
    return res.redirect('/student/buddy-match');
  };

  const existingRequest = await BuddyMatch.findOne({
    $or : [
      {senderId, receiverId },
      { sender: receiverId, receiver: senderId }
    ]
  });

  const sharedGoals = getSharedGoals(senderId, receiverId);

  if(existingRequest){
    req.flash('error', 'Buddy Request Already Sent or Received');
    return res.redirect('/student/buddy-match');
  }

  const newRequest = new BuddyMatch({
    sender : senderId,
    reciever : receiverId,
    requestStatus: 'pending',
    relationshipStatus: 'pending',
    compatibilityScore: Math.floor(Math.random() * 101),
    sharedGoals: sharedGoals,
    matchedOn: new Date()
  });

  await newRequest.save();
  console.log('Request sent',newRequest);

  req.flash('success', 'Buddy Request Sent Successfully');
  res.redirect('/student/buddy-match');
};