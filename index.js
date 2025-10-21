require('dotenv').config();

const express = require('express');
const app = express();

const path = require('path');
const ejsMate = require('ejs-mate');

const session = require('express-session');
const flash = require('connect-flash');

const passport = require('passport');
const LocalStrategy = require('passport-local');

const methodOverride = require('method-override');

require('./config/oauth')

const User = require('./models/user'); // adjust path as needed

const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');

const connectDB = require('./config/database')
const authRoutes = require('./routes/auth');
const materialRoutes = require('./routes/student/material');

const materialController  = require('./controllers/student/material')

const { isLoggedIn } = require('./middleware')

app.use(express.urlencoded({extended : true}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);

app.use(methodOverride('_method'))

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

connectDB()

app.use('/', authRoutes);
app.use('/api/materials', materialRoutes);

// Add middleware to log all API requests
app.use('/api', (req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Google OAuth routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    if (req.user.isNewUser) {
      req.flash('info', 'Please complete your profile to continue.');
      res.redirect('/complete-profile');
    } else {
      req.flash('success', 'Welcome to EduVision AI!');
      res.redirect('/');
    }
  }
);

app.get('/', (req, res)=>{
    res.render('shared/home');
});

app.get('/upload',isLoggedIn,   (req, res)=>{
    res.render('student/upload');
});

app.get('/upload/success/:id', isLoggedIn, async (req, res) => {
    try {
        const Material = require('./models/student/material');
        const material = await Material.findOne({ _id: req.params.id, uploadedBy: req.user._id });
        if (!material) {
            req.flash('error', 'Material not found');
            return res.redirect('/upload');
        }
        res.render('student/uploadSuccess', { material });
    } catch (error) {
        req.flash('error', 'Something went wrong');
        res.redirect('/upload');
    }
});

app.get('/materials',isLoggedIn, async (req, res) => {
    try {
        const Material = require('./models/student/material');
        const materials = await Material.find({ uploadedBy: req.user._id }).sort('-createdAt');
        res.render('student/materials', { materials });
    } catch (error) {
        req.flash('error', 'Something went wrong');
        res.redirect('/');
    }
});

app.get('/materials/:id',isLoggedIn, async (req, res) => {
    try {
        const Material = require('./models/student/material');
        const material = await Material.findOne({ _id: req.params.id, uploadedBy: req.user._id });
        if (!material) {
            req.flash('error', 'Material not found');
            return res.redirect('/materials');
        }
        res.render('student/materialDetail', { material });
    } catch (error) {
        req.flash('error', 'Something went wrong');
        res.redirect('/materials');
    }
});

app.delete('/materials/:id', isLoggedIn,  materialController.delete);


app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError('Page not found', 404))
});

app.use((err, req, res, next)=>{
    const {statusCode = 500} = err;
    if(!err.message){
        err.message = 'Something Went Wrong!'
    }
    res.status(statusCode).render('shared/error', {err})
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});