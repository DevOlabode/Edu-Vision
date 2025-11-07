//General Models
const User = require('../models/user');
const Notification = require('../models/notification');

// Student Related Models
const Assignment = require('../models/student/task');
const Goals  = require('../models/student/goals');
const Materials = require('../models/student/material');
const Buddy = require('../models/student/buddy');

const passport = require('passport');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/emailService');

module.exports.registerForm = (req, res) =>{
    res.render('auth/register');
}

module.exports.register = async(req, res, next) =>{
    const {username, email, password, lastName, firstName, bio, role, studentType, grade, timezone, studyPreferences} = req.body;
    const user = new User({
        username,
        firstName,
        lastName,
        email,
        bio,
        role,
        studentType,
        grade,
        timezone,
        studyPreferences: {
            subjects: studyPreferences.subjects,
            availability: studyPreferences.availability,
            goals: studyPreferences.goals
        }
    });
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
    const { username, password, confirmPassword, bio, role, studentType, grade, timezone, studyPreferences } = req.body;

    if (password !== confirmPassword) {
        req.flash('error', 'Passwords do not match.');
        return res.redirect('/complete-profile');
    }

    // Check if username is unique
    const existingUser = await User.findOne({ username: username });
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
        req.flash('error', 'Username is already taken. Please choose a different one.');
        return res.redirect('/complete-profile');
    }

    const user = await User.findById(req.user._id);

    // Set username and password for Google OAuth users
    user.username = username;
    if (password) {
        await user.setPassword(password);
    }

    user.bio = bio;
    user.role = role;
    user.studentType = studentType;
    user.grade = grade;
    user.timezone = timezone;
    user.studyPreferences = studyPreferences;
    await user.save();

    req.flash('success', 'Profile completed successfully! Welcome to EduVision AI!');
    res.redirect('/');
};

module.exports.deleteAcctForm = (req, res)=>{
    res.render('auth/deleteAccount');
}

module.exports.deleteAccount = async (req, res) => {
  const userId = req.user._id;
  const { password, reason } = req.body;

  const user = await User.findById(userId);
  const isMatch = await user.authenticate(password);

  if (!isMatch || !isMatch.user) {
    req.flash('error', 'Incorrect password. Account deletion aborted.');
    return res.redirect('/delete-account');
  }

  await Assignment.deleteMany({ createdBy: userId });
  await Goals.deleteMany({ createdBy: userId });
  await Materials.deleteMany({ createdBy: userId });
  await Buddy.deleteMany({ createdBy: userId });
  await Notification.deleteMany({ user: userId });
  await User.findByIdAndDelete(userId);

  await req.logout(); // Passport 0.6+ requires await
  req.session.destroy(() => {
    req.flash('success', 'Your account has been deleted successfully.');
    res.redirect('/');
  });
};

// Google OAuth callback logic
module.exports.googleOAuthCallback = async (profile) => {
    // Try to find user by Google ID or email first
    let user = await User.findOne({
        $or: [
            { googleId: profile.id },
            { email: profile.emails && profile.emails[0] && profile.emails[0].value }
        ]
    });
    if (user) return user;

    // Generate a unique username
    let baseUsername = profile.emails && profile.emails[0] && profile.emails[0].value ? profile.emails[0].value.split('@')[0] : 'user';
    let username = baseUsername;
    let counter = 1;
    while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`;
        counter++;
    }

    user = new User({
        username,
        email: profile.emails && profile.emails[0] && profile.emails[0].value,
        firstName: profile.name && profile.name.givenName,
        lastName: profile.name && profile.name.familyName,
        googleId: profile.id,
    });
    await user.save();
    return user;
};