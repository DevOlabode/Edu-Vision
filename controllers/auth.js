const User = require('../models/user');
const passport = require('passport');

module.exports.registerForm = (req, res) =>{
    res.render('auth/register');
}