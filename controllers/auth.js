const User = require('../models/user');
const passport = require('passport');

module.exports.registerForm = (req, res) =>{
    res.render('auth/register');
}

module.exports.register = async(req, res) =>{
    const {username, email, password, lastName, firstName, bio, role} = req.body;
    res.send(req.body);
} 