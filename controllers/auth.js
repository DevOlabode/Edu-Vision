const User = require('../models/user');

const passport = require('passport');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/emailService');

module.exports.registerForm = (req, res) =>{
    res.render('auth/register');
}

module.exports.register = async(req, res, next) =>{
    const {username, email, password, lastName, firstName, bio, role, studentType, grade} = req.body;
    const user = new User({ username, firstName, lastName, email, bio, role, studentType, grade });
    const registeredUser = await User.register(user, password);

    sendWelcomeEmail(email, firstName)

    req.login(registeredUser, err =>{
        if(err) return next(err);
        req.flash('success', 'Welcome to EduVision AI');
        res.redirect('/');
    });
}

module.exports.loginForm = (req, res) =>{
    res.render('auth/login');
};

module.exports.login = async(req, res) =>{
    req.flash('success', 'Welcome back to Eduvision!');
    const returnUrl = res.locals.returnTo || '/'
    res.redirect(returnUrl)
};

module.exports.logout = (req, res, next)=>{
        req.logout(function(err){
        if(err) return next(err);
        req.flash('success', 'Successfully Logged out');
        res.redirect('/')
    });
}

module.exports.profile = async(req, res)=>{
    const user = await User.findById(req.user._id);
    res.render('auth/profile', {user})
};

module.exports.forgottenPasswordForm = (req, res) =>{
    res.render('auth/forgottenPassword');
};

function generateCode(length = 7) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

module.exports.sendCode = async(req, res) =>{
    const { email } = req.body;
    const user = await User.findOne({email});

    if(user){
        const resetCode = generateCode();
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        user.resetCode = resetCode;
        user.resetCodeExpires = expires;
        await user.save();
        sendPasswordResetEmail(email, user.firstName, resetCode);
        req.flash('success', 'Password reset code sent to your email.');
        res.redirect('/reset-password');
    } else {
        req.flash('error', 'No account found with that email address.');
        res.redirect('/forgot-password');
    }
};

module.exports.resetPasswordForm = (req, res) => {
    res.render('auth/resetPassword');
};

module.exports.resetPassword = async(req, res) => {
    const { resetCode, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
        req.flash('error', 'Passwords do not match.');
        return res.redirect('/reset-password');
    }

    const user = await User.findOne({
        resetCode: resetCode,
        resetCodeExpires: { $gt: new Date() }
    });

    if (!user) {
        req.flash('error', 'Invalid or expired reset code.');
        return res.redirect('/reset-password');
    }

    await user.setPassword(newPassword);
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();

    req.flash('success', 'Password reset successfully. You can now log in with your new password.');
    res.redirect('/login');
};

module.exports.completeProfileForm = (req, res) => {
    res.render('auth/completeProfile');
};

module.exports.completeProfile = async(req, res) => {
    const { bio, role, studentType, grade } = req.body;
    const user = await User.findById(req.user._id);

    user.bio = bio;
    user.role = role;
    user.studentType = studentType;
    user.grade = grade;
    await user.save();

    req.flash('success', 'Profile completed successfully! Welcome to EduVision AI!');
    res.redirect('/');
};
