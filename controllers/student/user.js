const User = require('../../models/user');
const Materials = require('../../models/student/material')

module.exports.editProfileForm = async (req, res) => {
    const user = req.user;
    res.render('auth/editProfile', { user });
};

module.exports.editProfile = async (req, res) => {
    const user = req.user;
    const { password } = req.body;

    user.authenticate(password, (err, authenticatedUser, message) => {
        if (!authenticatedUser) {
            req.flash('error', '❌ Incorrect password');
            return res.redirect('/edit-profile');
        }

        (async () => {
            const updatedUser = await User.findByIdAndUpdate(
                user._id,
                req.body,
                { new: true, runValidators: true }
            );

            req.flash('success', 'Profile updated successfully!');
            res.redirect('/profile');
        })();
    });
};

module.exports.changePasswordForm = (req, res)=>{
    res.render('auth/changePassword')
};

module.exports.updatePassword = async (req, res) => {
    const user = await User.findById(req.user._id);
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if(newPassword !== confirmPassword) {
        req.flash('error', 'New password and confirmation do not match');
        return res.redirect('/profile');
    }

    if(!user){
        req.flash('error', 'User not found');
        return res.redirect('/profile');
    }

     // ✅ check if current password is correct
    const { user: authenticatedUser, error } = await user.authenticate(currentPassword);
    
    if (error || !authenticatedUser) {
        req.flash('error', 'Current password is incorrect');
        return res.redirect(`/profile`);
    }

    await user.setPassword(newPassword);
    await user.save();

    req.flash('success', 'Password changed successfully');
    res.redirect('/profile');
};

module.exports.allUsers = async(req, res)=>{
    const { q } = req.query;
    let users;
    if (q && q.trim() !== '') {
        users = await User.find({
            $or: [
                { firstName: { $regex: q, $options: 'i' } },
                { lastName: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } }
            ]
        });
    } else {
        users = await User.find();
    }
    res.render('student/user/allUsers', { users, search: q || '' });
};

module.exports.searchMaterials = async (req, res) => {
    const { q } = req.query;
    let materials = [];
    if (q && q.trim() !== '') {
        materials = await Materials.find({
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { fileName: { $regex: q, $options: 'i' } }
            ]
        }).populate('uploadedBy', 'firstName lastName _id');
    }
    res.render('student/material/materials', { materials, search: q || '' });
};

module.exports.profilePage = async(req, res)=>{
    const userId = req.params.id;
   const user = await User.findById(userId);

   const materials = await Materials.find({uploadedBy : userId});
    res.render('student/user/profile', { user, materials });
};