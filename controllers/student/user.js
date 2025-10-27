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