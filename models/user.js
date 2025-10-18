const mongoose = require('mongoose');
const { Schema } = mongoose;

const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email : {
        type : String,
        required : true,
        unique : true
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
        required : true,
        unique : true
    },
    bio : {
        type : String,
        required : false
    },
    role : {
        type : String,
        enum : ['Teacher' , 'Student'],
        required : true
    }
}, { timestamps: true }
);

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

module.exports = mongoose.model('User', userSchema);
