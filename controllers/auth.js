const User = require('../models/user');
const passport = require('passport');

module.exports.registerForm = (req, res) =>{
    res.render('auth/register');
}

module.exports.register = async(req, res) =>{
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