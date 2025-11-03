const User = require('../../models/user');
const BuddyMatch = require('../../models/student/buddy');

async function findStudyBuddy(currentUserId) {
  const currentUser = await User.findById(currentUserId);
  if (!currentUser) {
    throw new Error('User not found');
  }

  const { studyPreferences, timezone } = currentUser;
  if (!studyPreferences || !studyPreferences.subjects || !studyPreferences.availability || !studyPreferences.goals) {
    throw new Error('Incomplete study preferences');
  }

  const { subjects, availability, goals } = studyPreferences;

  // Extract timezone offset (e.g., "UTC+01:00" → 1)
  const currentOffset = parseInt(timezone?.match(/[-+]\d+/)?.[0] || 0);

  // Find candidates with similar timezone (±1 hour)
  const candidates = await User.find({
    _id: { $ne: currentUserId },
    buddies: { $ne: currentUserId },
    'studyPreferences.subjects': { $in: subjects },
    'studyPreferences.availability': { $in: availability },
    timezone: { $in: [`UTC${currentOffset - 1}:00`, `UTC${currentOffset}:00`, `UTC${currentOffset + 1}:00`] }
  });

  if (!candidates.length) return null;

  const buddy = candidates[0];

  // Check for existing match
  const existingMatch = await BuddyMatch.findOne({
    $or: [
      { userA: currentUser._id, userB: buddy._id },
      { userA: buddy._id, userB: currentUser._id }
    ],
    requestStatus: { $in: ['pending', 'accepted'] }
  });

  if (existingMatch) return null;

  const match = await BuddyMatch.create({
    userA: currentUser._id,
    userB: buddy._id,
    requestStatus: 'pending',
    relationshipStatus: 'pending',
    sharedGoals: [goals, buddy.studyPreferences.goals],
    compatibilityScore: 60
  });

  return match;
}
module.ezports.findMatch = (req, res) => {
  res.render('buddyMatch/index', { title: 'Find Study Buddy' });
};

module.exports.findBuddy = async (req, res) => {
  try {
    const userId = req.user._id;
    const match = await findStudyBuddy(userId);

    if (!match) {
      return res.status(404).json({ message: 'No Suitable Buddy Found' });
    }

    // Populate buddy information for frontend
    await match.populate('userA userB', 'firstName lastName email studyPreferences');

    res.status(200).json({ message: 'Buddy Request Sent!', match });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
