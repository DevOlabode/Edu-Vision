require('dotenv').config();

const express = require('express');
const app = express();

const path = require('path');
const ejsMate = require('ejs-mate');

const session = require('express-session');
const flash = require('connect-flash');

const passport = require('passport');
const LocalStrategy = require('passport-local');
require('./config/oauth')

const User = require('./models/user'); // adjust path as needed

const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');

const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');

app.use(express.urlencoded({extended : true}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);

app.use(express.json());

app.use(flash());

const sessionConfig = {
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({usernameField: 'email'}, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.info = req.flash('info');
    res.locals.warning = req.flash('warning')
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("Mongo Connection Open")   
    }).catch((err) => {
        console.log("Error", err)
    });

app.use('/', authRoutes);

// Google OAuth routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    req.flash('success', 'Welcome to EduVision AI!');
    res.redirect('/');
  }
);

app.get('/', (req, res)=>{
    res.render('home');
});

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError('Page not found', 404))
});

app.use((err, req, res, next)=>{
    const {statusCode = 500} = err;
    if(!err.message){
        err.message = 'Something Went Wrong!'
    }
    res.status(statusCode).render('error', {err})
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});