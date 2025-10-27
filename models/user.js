const mongoose = require('mongoose');
const { Schema } = mongoose;

const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email : {
        type : String,
        required : true,
        unique : true
    },
    timezone : {
        type : String,
        required : true,
    },
    firstName : {
        type : String,
        required : true
    },
    lastName : {
        type : String,
        required : true
    },
    username : {
        type : String,
        required : false,
        unique : true
    },
    bio : {
        type : String,
        required : false
    },
    role : {
        type : String,
        enum : ['Teacher' , 'Student'],
        required : false
    },
    resetCode: {
        type: String,
        required: false
    },
    resetCodeExpires: {
        type: Date,
        required: false
    },
    googleId: {
        type: String,
        required: false
    },
    googleAccessToken: {
        type: String,
        required: false
    },
    googleRefreshToken: {
        type: String,
        required: false
    },
    studentType: {
        type: String,
        enum: ['High School', 'University/College'],
        required: false
    },
    grade: {
        type: String,
        required: false
    },
    studyPreferences : {
        subject : [String],
        availability : [String],
        goals : String
  },
  buddyId : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        default : null
  }
}, { timestamps: true }
);

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

module.exports = mongoose.model('User', userSchema);
