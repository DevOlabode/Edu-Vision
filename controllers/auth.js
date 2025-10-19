const User = require('../models/user');

const passport = require('passport');

module.exports.registerForm = (req, res) =>{
    res.render('auth/register');
}

module.exports.register = async(req, res, next) =>{
    const {username, email, password, lastName, firstName, bio, role} = req.body;
    const user = new User({ username, firstName, lastName, email, bio,role });
    const registeredUser = await User.register(user, password);

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