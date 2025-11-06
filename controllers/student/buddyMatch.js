const User = require('../../models/user');
const BuddyMatch = require('../../models/student/buddy');

const findStudyBuddy = async(currentUserId)=>{
  const currentUser = await User.findById(currentUserId);
  const { studyPreferences } = currentUser
  const {goals, availability, subjects} = studyPreferences;
  // console.log(availability, subjects)

  const candidates = await User.find({
    _id : {$ne : currentUserId},
    buddies : { $ne : currentUserId},
    'studyPreferences.subjects' : {$in : subjects},
    'studyPreferences': { $exists: true }
  });

  if(!candidates.length) return null;

  return candidates;
}

module.exports.findStudyBuddy = findStudyBuddy;

module.exports.findMatch = (req, res) => {
  res.render('buddyMatch/index', { title: 'Find Study Buddy' });
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