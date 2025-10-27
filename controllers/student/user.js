const User = require('../../models/user');

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
}