const User = require('../../models/user');
const Buddy = require('../../models/student/buddy');

async function findStudyBuddy(currentUserId) {
    console.log(currentUserId)
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
        throw new Error('User not found');
    }

    const { studyPreferences } = currentUser;

    const { subjects, availability, goals } = studyPreferences;

    const candidates = await User.find({
        _id: { $ne: currentUserId },
        buddyId: null,
        'studyPreferences.subjects': { $in: subjects },
        'studyPreferences.availability': { $in: availability }
    });

    if (!candidates.length) return null;

    const buddy = candidates[0];

    const match = await BuddyMatch.create({
        userA: currentUser._id,
        userB: buddy._id,
        status: 'active',
        sharedGoals: [goals, buddy.studyPreferences.goals],
        compatibilityScore: 80
    });

    currentUser.buddyId = buddy._id;
    buddy.buddyId = currentUser._id;
    await currentUser.save();
    await buddy.save();

    return match;
}

module.exports.findBuddy = async(req, res)=>{
    const userId = req.user._id;
    const match  = await findStudyBuddy(userId);

    if(!match){
        return res.status(404).json({message : 'No Suitable Buddy Found'})
    }

    res.json({message : 'Buddy Found!', match})
}