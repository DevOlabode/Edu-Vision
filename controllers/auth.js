const User = require('../models/user');

const passport = require('passport');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/emailService');

module.exports.registerForm = (req, res) =>{
    res.render('auth/register');
}

module.exports.register = async(req, res, next) =>{
    const {username, email, password, lastName, firstName, bio, role} = req.body;
    const user = new User({ username, firstName, lastName, email, bio,role });
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
    const user = await User.find({email});

    if(user){
        const resetCode = generateCode();
        sendPasswordResetEmail(email, user.firstName, resetCode);
    }
};
